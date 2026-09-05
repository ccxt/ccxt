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

// key=value pairs of a query string or an urlencoded body, minus the keys the fixture
// says are not reproducible (signature, timestamp, ...)
inline std::vector<std::string> paramPairs (const std::string& text,
                                            const std::vector<std::string>& skipKeys) {
    std::vector<std::string> out;
    std::size_t start = 0;
    while (start <= text.size ()) {
        const std::size_t amp = text.find ('&', start);
        const std::string pair = text.substr (start, (amp == std::string::npos)
                                                     ? std::string::npos : amp - start);
        if (!pair.empty ()) {
            const std::size_t eq = pair.find ('=');
            const std::string key = (eq == std::string::npos) ? pair : pair.substr (0, eq);
            bool skip = false;
            for (const auto& s : skipKeys) {
                if (key == s) { skip = true; break; }
            }
            if (!skip) {
                out.push_back (pair);
            }
        }
        if (amp == std::string::npos) {
            break;
        }
        start = amp + 1;
    }
    std::sort (out.begin (), out.end ());
    return out;
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
        const auto expectedParams = paramPairs (queryOf (expectedUrl), skipKeys);
        const auto actualParams = paramPairs (queryOf (actualUrl), skipKeys);
        if (expectedParams != actualParams) {
            why = "query";
            return false;
        }
        return true;
    }
    // outputType for binance is "urlencoded"; a json body is compared as text
    const std::string expectedText = expectedBody.has_value () ? str (expectedBody) : std::string ();
    const std::string actualText = actualBody.has_value () ? str (actualBody) : std::string ();
    if (!expectedText.empty () && (expectedText[0] == '{' || expectedText[0] == '[')) {
        if (expectedText != actualText) {
            why = "json body";
            return false;
        }
        return true;
    }
    const auto expectedParams = paramPairs (expectedText, skipKeys);
    const auto actualParams = paramPairs (actualText, skipKeys);
    if (expectedParams != actualParams) {
        why = "body";
        return false;
    }
    return true;
}

} // namespace statictests
} // namespace ccxt
