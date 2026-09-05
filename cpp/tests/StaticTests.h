#pragma once

// The static request/response tests, the C++ side of ts/src/test/tests.ts.
//
// Both modes replay JSON fixtures with no network:
//
//   --requestTests   ts/src/test/static/request/<id>.json
//                    call the method, then compare the url and body that sign()
//                    produced (exchange.last_request_url / last_request_body) with the
//                    fixture. Nothing is sent; fetch() is never reached because the
//                    comparison happens on what sign() built.
//
//   --responseTests  ts/src/test/static/response/<id>.json
//                    feed the canned httpResponse to the parser and compare the
//                    unified structure with the fixture's parsedResponse.
//
// Markets and currencies come from static/markets/<id>.json and
// static/currencies/<id>.json so no loadMarkets call is needed -- the same trick
// loadMarketsFromFile plays in the TS harness.

#include "../ccxt/base/Exchange.h"

#include <fstream>
#include <iostream>
#include <algorithm>
#include <sstream>
#include <string>
#include <vector>

namespace ccxt {
namespace statictests {

struct Report {
    int passed = 0;
    int failed = 0;
    int skipped = 0;   // fixture entries marked `disabled`
};

inline std::string readFile (const std::string& path) {
    std::ifstream stream (path, std::ios::binary);
    if (!stream) {
        throw BaseError ("cannot read fixture " + path);
    }
    std::ostringstream buffer;
    buffer << stream.rdbuf ();
    return buffer.str ();
}

inline bool fileExists (const std::string& path) {
    std::ifstream stream (path);
    return static_cast<bool> (stream);
}

// The repo root, relative to where the test binary is invoked from. run-tests.js and
// npm both run from the repo root, so "." is right; the fallback lets the binary work
// when launched from cpp/build.
inline std::string rootDir () {
    if (fileExists ("./ts/src/test/static/request/binance.json")) {
        return "./";
    }
    return "../../";
}

// ccxt values arrive as dict/list; comparison is over the canonical json text so key
// order matters, which is the point of the ordered value model.
inline bool sameJson (Exchange& exchange, const std::any& a, const std::any& b) {
    return isEqual (exchange.json (a), exchange.json (b));
}

inline std::string describeEntry (Exchange& exchange, const std::any& entry) {
    const std::any description = ::getValue (entry, std::string ("description"));
    return description.has_value () ? str (description) : std::string ("<no description>");
}

// The reference harness (assertStaticRequestOutput in ts/src/test/tests.ts) strips the
// hostname before comparing and asserts only on path + query. That is deliberate: many
// fixtures were captured against testnet or demo hosts (testnet.binance.vision,
// demo-fapi.binance.com), and the host is not what the request builder is being tested
// on. Comparing full urls made 108 perfectly correct requests look wrong.
inline std::string stripHost (const std::string& url) {
    const std::size_t scheme = url.find ("://");
    if (scheme == std::string::npos) {
        return url;
    }
    const std::size_t slash = url.find ('/', scheme + 3);
    return (slash == std::string::npos) ? std::string ("/") : url.substr (slash);
}

inline std::string pathOf (const std::string& url) {
    const std::size_t at = url.find ('?');
    return (at == std::string::npos) ? url : url.substr (0, at);
}

// A query string or urlencoded body as ordered key -> value pairs.
inline std::vector<std::pair<std::string, std::string>> parsePairs (const std::string& text) {
    std::vector<std::pair<std::string, std::string>> out;
    std::size_t start = 0;
    while (start <= text.size ()) {
        const std::size_t amp = text.find ('&', start);
        const std::string pair = text.substr (start, (amp == std::string::npos)
                                                     ? std::string::npos : amp - start);
        if (!pair.empty ()) {
            const std::size_t eq = pair.find ('=');
            if (eq == std::string::npos) {
                out.emplace_back (pair, std::string ());
            } else {
                out.emplace_back (pair.substr (0, eq), pair.substr (eq + 1));
            }
        }
        if (amp == std::string::npos) {
            break;
        }
        start = amp + 1;
    }
    return out;
}

// Recursive value comparison, mirroring assertNewAndStoredOutputInner: dicts compare
// by key count then per stored key (skipKeys skipped), lists element-wise, everything
// else as text. A urlencoded field can itself hold a JSON document -- binance sends the
// whole basket of a createOrders call as `batchOrders=[{...},{...}]` -- and comparing
// that as raw text is wrong twice over: it is order sensitive where the reference is
// not, and it cannot skip a non-reproducible key nested inside.
inline bool sameAnyImpl (const std::any& expected, const std::any& actual,
                         const std::vector<std::string>& skipKeys, std::string& why);

inline bool skippedKey (const std::string& key, const std::vector<std::string>& skipKeys) {
    for (const auto& s : skipKeys) {
        if (key == s) {
            return true;
        }
    }
    return false;
}

inline bool sameAnyImpl (const std::any& expected, const std::any& actual,
                         const std::vector<std::string>& skipKeys, std::string& why) {
    if (ccxt::isDict (expected) && ccxt::isDict (actual)) {
        const auto& e = std::any_cast<ccxt::dict> (expected);
        const auto& a = std::any_cast<ccxt::dict> (actual);
        if (e.size () != a.size ()) {
            why = "output length mismatch";
            return false;
        }
        for (const auto& kv : e.entries ()) {
            if (skippedKey (kv.first, skipKeys)) {
                continue;
            }
            if (!a.has (kv.first)) {
                std::string got;
                for (const auto& other : a.entries ()) {
                    got += (got.empty () ? "" : ",") + other.first;
                }
                why = "output key missing: " + kv.first + " (actual keys: " + got + ")";
                return false;
            }
            if (!sameAnyImpl (kv.second, a.get (kv.first), skipKeys, why)) {
                return false;
            }
        }
        return true;
    }
    if (ccxt::isList (expected) && ccxt::isList (actual)) {
        const auto& e = std::any_cast<ccxt::list> (expected);
        const auto& a = std::any_cast<ccxt::list> (actual);
        if (e.size () != a.size ()) {
            why = "output length mismatch";
            return false;
        }
        for (std::size_t i = 0; i < e.size (); i++) {
            if (!sameAnyImpl (e.get (static_cast<long> (i)), a.get (static_cast<long> (i)),
                              skipKeys, why)) {
                return false;
            }
        }
        return true;
    }
    if (str (expected) != str (actual)) {
        why = str (expected) + " != " + str (actual);
        return false;
    }
    return true;
}

// A urlencoded field value: parsed and compared structurally when it holds JSON.
inline bool sameScalarOrJson (const std::string& expected, const std::string& actual,
                              const std::vector<std::string>& skipKeys, std::string& why) {
    const bool looksJson = !expected.empty () && (expected[0] == '{' || expected[0] == '[');
    if (!looksJson) {
        if (expected != actual) {
            why = expected + " != " + actual;
            return false;
        }
        return true;
    }
    ccxt::Exchange parser;
    const std::any e = parser.parseJson (expected);
    const std::any a = parser.parseJson (actual);
    if (!e.has_value () || !a.has_value ()) {
        if (expected != actual) {
            why = expected + " != " + actual;
            return false;
        }
        return true;
    }
    return sameAnyImpl (e, a, skipKeys, why);
}

// Reproduces assertNewAndStoredOutputInner for a flat urlencoded payload:
//
//   1. the TOTAL key counts must match (counted before any skipping), and
//   2. every stored key that is NOT in skipKeys must be present in the new payload
//      with an equal value.
//
// Extra keys on the new side are never inspected, only counted. That asymmetry is load
// bearing: binance renames the client-id field per order type (newClientOrderId ->
// clientAlgoId for linear conditional orders), the fixture skips the stored name, and
// the renamed one on the new side is only ever counted. Removing skipKeys from both
// sides and comparing sets -- which is what this used to do -- fails those.
inline bool samePayload (const std::string& expected, const std::string& actual,
                         const std::vector<std::string>& skipKeys, std::string& why) {
    const auto storedPairs = parsePairs (expected);
    const auto newPairs = parsePairs (actual);
    if (storedPairs.size () != newPairs.size ()) {
        why = "output length mismatch (" + std::to_string (storedPairs.size ())
            + " stored vs " + std::to_string (newPairs.size ()) + " new)";
        return false;
    }
    const auto skipped = [&skipKeys] (const std::string& key) {
        for (const auto& s : skipKeys) {
            if (key == s) {
                return true;
            }
        }
        return false;
    };
    for (const auto& kv : storedPairs) {
        if (skipped (kv.first)) {
            continue;
        }
        bool found = false;
        for (const auto& other : newPairs) {
            if (other.first == kv.first) {
                found = true;
                if (!sameScalarOrJson (kv.second, other.second, skipKeys, why)) {
                    why = "value mismatch for " + kv.first + ": " + why;
                    return false;
                }
                break;
            }
        }
        if (!found) {
            why = "output key missing: " + kv.first;
            return false;
        }
    }
    return true;
}

inline std::string queryOf (const std::string& url) {
    const std::size_t at = url.find ('?');
    return (at == std::string::npos) ? std::string () : url.substr (at + 1);
}

// Mirrors assertStaticRequestOutput: compare the host-stripped path, then either the
// query (when the fixture records no body) or the urlencoded body.
inline bool sameRequest (const std::string& expectedUrl, const std::string& actualUrl,
                         const std::any& expectedBody, const std::any& actualBody,
                         const std::vector<std::string>& skipKeys, std::string& why) {
    const std::string expectedPath = pathOf (stripHost (expectedUrl));
    const std::string actualPath = pathOf (stripHost (actualUrl));
    if (expectedPath != actualPath) {
        why = "path: " + expectedPath + " != " + actualPath;
        return false;
    }
    const bool haveBody = expectedBody.has_value () || actualBody.has_value ();
    if (!haveBody) {
        return samePayload (queryOf (expectedUrl), queryOf (actualUrl), skipKeys, why);
    }
    // binance's outputType is "urlencoded"; a json body is compared as text
    const std::string expectedText = expectedBody.has_value () ? str (expectedBody) : std::string ();
    const std::string actualText = actualBody.has_value () ? str (actualBody) : std::string ();
    if (!expectedText.empty () && (expectedText[0] == '{' || expectedText[0] == '[')) {
        if (expectedText != actualText) {
            why = "json body";
            return false;
        }
        return true;
    }
    return samePayload (expectedText, actualText, skipKeys, why);
}

// public name for the recursive comparison used by the response tests
inline bool sameAny (const std::any& expected, const std::any& actual,
                     const std::vector<std::string>& skipKeys, std::string& why) {
    return sameAnyImpl (expected, actual, skipKeys, why);
}

} // namespace statictests
} // namespace ccxt
