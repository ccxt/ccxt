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
#include <sstream>
#include <string>
#include <vector>

namespace ccxt {
namespace statictests {

struct Report {
    int passed = 0;
    int failed = 0;
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

// Query strings are compared as sets of key=value pairs: the fixture was captured from
// another language whose dict ordering may differ, and ccxt only guarantees the order
// within a single implementation. The path before '?' is compared literally.
inline bool sameUrl (const std::string& expected, const std::string& actual,
                     const std::vector<std::string>& skipKeys) {
    const auto split = [] (const std::string& url, std::string& path,
                           std::vector<std::string>& params) {
        const std::size_t at = url.find ('?');
        path = (at == std::string::npos) ? url : url.substr (0, at);
        if (at == std::string::npos) {
            return;
        }
        std::string rest = url.substr (at + 1);
        std::size_t start = 0;
        while (start <= rest.size ()) {
            const std::size_t amp = rest.find ('&', start);
            const std::string pair = rest.substr (start, (amp == std::string::npos)
                                                         ? std::string::npos : amp - start);
            if (!pair.empty ()) {
                params.push_back (pair);
            }
            if (amp == std::string::npos) {
                break;
            }
            start = amp + 1;
        }
    };
    std::string expectedPath, actualPath;
    std::vector<std::string> expectedParams, actualParams;
    split (expected, expectedPath, expectedParams);
    split (actual, actualPath, actualParams);
    if (expectedPath != actualPath) {
        return false;
    }
    // signature/timestamp style keys are not reproducible, so the fixture lists them
    const auto skipped = [&skipKeys] (const std::string& pair) {
        const std::size_t eq = pair.find ('=');
        const std::string key = (eq == std::string::npos) ? pair : pair.substr (0, eq);
        for (const auto& skip : skipKeys) {
            if (key == skip) {
                return true;
            }
        }
        return (key == "signature") || (key == "timestamp") || (key == "recvWindow");
    };
    std::vector<std::string> left, right;
    for (const auto& pair : expectedParams) if (!skipped (pair)) left.push_back (pair);
    for (const auto& pair : actualParams)   if (!skipped (pair)) right.push_back (pair);
    std::sort (left.begin (), left.end ());
    std::sort (right.begin (), right.end ());
    return left == right;
}

} // namespace statictests
} // namespace ccxt
