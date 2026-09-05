// Static request/response runner for the C++ port.
//
// Separate binary from ccxt-tests because it links the generated binance translation
// unit, which is by far the slowest thing in the build; keeping the base tests free of
// it means a base-test edit does not pay for an 18k-line recompile.
//
// Modes mirror the other ports (see cs/tests/Program.cs):
//   --requestTests / --request     replay static/request/<id>.json
//   --responseTests / --response   replay static/response/<id>.json

#include "StaticTests.h"
#include "../ccxt/exchanges/binance.h"

#include <algorithm>
#include <iostream>
#include <memory>
#include <string>
#include <vector>

using namespace ccxt;
using namespace ccxt::statictests;

namespace {

std::vector<std::string> stringList (const std::any& value) {
    std::vector<std::string> out;
    if (isList (value)) {
        for (const auto& item : std::any_cast<list> (value).items ()) {
            out.push_back (str (item));
        }
    }
    return out;
}

// Builds the exchange the fixture describes and gives it markets without any network.
std::shared_ptr<binance> offlineExchange (const std::any& options) {
    std::any config = dict {
        { std::string ("apiKey"), std::string ("sampleApiKey") },
        { std::string ("secret"), std::string ("sampleSecret") },
        { std::string ("uid"),    std::string ("sampleUid") },
        { std::string ("password"), std::string ("samplePassword") },
        { std::string ("walletAddress"), std::string ("0x0000000000000000000000000000000000000000") },
        { std::string ("privateKey"), std::string ("0x0000000000000000000000000000000000000000000000000000000000000001") },
        { std::string ("enableRateLimit"), false },
    };
    if (isDict (options)) {
        for (const auto& kv : std::any_cast<dict> (options).entries ()) {
            std::any_cast<dict> (config).set (kv.first, kv.second);
        }
    }
    auto exchange = newExchange<binance> (config);
    const std::string root = rootDir ();
    const std::string marketsPath = root + "ts/src/test/static/markets/binance.json";
    const std::string currenciesPath = root + "ts/src/test/static/currencies/binance.json";
    std::any markets = std::any {};
    std::any currencies = std::any {};
    if (fileExists (marketsPath)) {
        markets = exchange->parseJson (readFile (marketsPath));
    }
    if (fileExists (currenciesPath)) {
        currencies = exchange->parseJson (readFile (currenciesPath));
    }
    if (markets.has_value ()) {
        exchange->setMarkets (markets, currencies);
    }
    return exchange;
}

int runRequestTests (const std::string& only) {
    Report report;
    const std::string path = rootDir () + "ts/src/test/static/request/binance.json";
    if (!fileExists (path)) {
        std::cout << "[TEST_FAILURE] missing fixture " << path << std::endl;
        return 1;
    }
    auto bootstrap = newExchange<binance> ();
    const std::any fixture = bootstrap->parseJson (readFile (path));
    const std::any options = ::getValue (fixture, std::string ("options"));
    const std::vector<std::string> skipKeys =
        stringList (::getValue (fixture, std::string ("skipKeys")));
    const std::any methods = ::getValue (fixture, std::string ("methods"));
    if (!isDict (methods)) {
        std::cout << "[TEST_FAILURE] fixture has no methods block" << std::endl;
        return 1;
    }
    const dict methodDict = std::any_cast<dict> (methods);
    for (const auto& kv : methodDict.entries ()) {
        const std::string methodName = kv.first;
        if (!only.empty () && only != methodName) {
            continue;
        }
        if (!isList (kv.second)) {
            continue;
        }
        for (const auto& entryAny : std::any_cast<list> (kv.second).items ()) {
            std::shared_ptr<binance> exchange;
            std::string label = methodName;
            try {
                // an entry may carry `disabled` (bool or a reason string); the reference
                // harness skips those rather than counting them
                const std::any disabledFlag = ::getValue (entryAny, std::string ("disabled"));
                if (disabledFlag.has_value ()
                    && (isTrue (disabledFlag) || (isStr (disabledFlag) && !str (disabledFlag).empty ()))) {
                    report.skipped++;
                    continue;
                }
                exchange = offlineExchange (options);
                label = methodName + " [" + describeEntry (*exchange, entryAny) + "]";
                // per-entry options are deep-extended over the exchange's own
                const std::any entryOptions = ::getValue (entryAny, std::string ("options"));
                if (isDict (entryOptions)) {
                    exchange->options = exchange->deepExtend (exchange->options, entryOptions);
                }
                const std::any input = ::getValue (entryAny, std::string ("input"));
                // the call is expected to fail at fetch() -- what matters is the
                // request sign() built on the way there
                // Reaching fetch() is the SUCCESS path here: it records the request
                // and then throws, because there is no transport. Any other exception
                // means the call died earlier and is reported, not swallowed.
                std::string thrown;
                try {
                    exchange->callMethod (std::string (methodName),
                                          input.has_value () ? input : std::any (list {}));
                } catch (const std::exception& e) {
                    thrown = e.what ();
                }
                const std::any expectedUrl = ::getValue (entryAny, std::string ("url"));
                if (!expectedUrl.has_value ()) {
                    continue;
                }
                if (!exchange->last_request_url.has_value ()) {
                    std::cout << "[TEST_FAILURE][STATIC_REQUEST][binance][" << label
                              << "] no request was built: "
                              << (thrown.empty () ? std::string ("(no exception)") : thrown)
                              << std::endl;
                    report.failed++;
                    continue;
                }
                const std::string actual = str (exchange->last_request_url);
                const std::any expectedBody = ::getValue (entryAny, std::string ("output"));
                std::string why;
                if (sameRequest (str (expectedUrl), actual, expectedBody,
                                 exchange->last_request_body, skipKeys, why)) {
                    report.passed++;
                } else {
                    std::cout << "[TEST_FAILURE][STATIC_REQUEST][binance][" << label
                              << "] " << why << "\n"
                              << "  expected: " << str (expectedUrl) << "\n"
                              << "  actual:   " << actual << std::endl;
                    if (expectedBody.has_value () || exchange->last_request_body.has_value ()) {
                        std::cout << "  exp body: "
                                  << (expectedBody.has_value () ? str (expectedBody) : "<none>") << "\n"
                                  << "  act body: "
                                  << (exchange->last_request_body.has_value ()
                                      ? str (exchange->last_request_body) : "<none>") << std::endl;
                    }
                    report.failed++;
                }
            } catch (const std::exception& e) {
                std::cout << "[TEST_FAILURE][STATIC_REQUEST][binance][" << label << "] "
                          << e.what () << std::endl;
                report.failed++;
            }
        }
    }
    std::cout << "static request tests: " << report.passed << " passed, "
              << report.failed << " failed, " << report.skipped << " skipped" << std::endl;
    return report.failed ? 1 : 0;
}

int runResponseTests (const std::string& only) {
    Report report;
    const std::string path = rootDir () + "ts/src/test/static/response/binance.json";
    if (!fileExists (path)) {
        std::cout << "[TEST_FAILURE] missing fixture " << path << std::endl;
        return 1;
    }
    auto bootstrap = newExchange<binance> ();
    const std::any fixture = bootstrap->parseJson (readFile (path));
    const std::any options = ::getValue (fixture, std::string ("options"));
    const std::vector<std::string> skipKeys =
        stringList (::getValue (fixture, std::string ("skipKeys")));
    const std::any methods = ::getValue (fixture, std::string ("methods"));
    if (!isDict (methods)) {
        std::cout << "[TEST_FAILURE] fixture has no methods block" << std::endl;
        return 1;
    }
    const dict methodDict = std::any_cast<dict> (methods);
    for (const auto& kv : methodDict.entries ()) {
        const std::string methodName = kv.first;
        if (!only.empty () && only != methodName) {
            continue;
        }
        if (!isList (kv.second)) {
            continue;
        }
        for (const auto& entryAny : std::any_cast<list> (kv.second).items ()) {
            std::string label = methodName;
            try {
                const std::any disabledFlag = ::getValue (entryAny, std::string ("disabled"));
                if (disabledFlag.has_value ()
                    && (isTrue (disabledFlag) || (isStr (disabledFlag) && !str (disabledFlag).empty ()))) {
                    report.skipped++;
                    continue;
                }
                auto exchange = offlineExchange (options);
                label = methodName + " [" + describeEntry (*exchange, entryAny) + "]";
                const std::any entryOptions = ::getValue (entryAny, std::string ("options"));
                if (isDict (entryOptions)) {
                    exchange->options = exchange->deepExtend (exchange->options, entryOptions);
                }
                // install the canned body as the transport, the C++ counterpart of
                // setFetchResponse(); everything above it -- sign, request, the parse*
                // chain -- runs unmodified
                const std::any httpResponse = ::getValue (entryAny, std::string ("httpResponse"));
                exchange->fetchImpl = [httpResponse] (std::any, std::any, std::any, std::any) {
                    return httpResponse;
                };
                const std::any input = ::getValue (entryAny, std::string ("input"));
                const std::any expected = ::getValue (entryAny, std::string ("parsedResponse"));
                std::any actual;
                try {
                    actual = exchange->callMethod (std::string (methodName),
                                                   input.has_value () ? input : std::any (list {}));
                } catch (const std::exception& e) {
                    std::cout << "[TEST_FAILURE][STATIC_RESPONSE][binance][" << label << "] "
                              << e.what () << std::endl;
                    report.failed++;
                    continue;
                }
                std::string why;
                if (sameAny (expected, actual, skipKeys, why)) {
                    report.passed++;
                } else {
                    std::cout << "[TEST_FAILURE][STATIC_RESPONSE][binance][" << label << "] "
                              << why << std::endl;
                    report.failed++;
                }
            } catch (const std::exception& e) {
                std::cout << "[TEST_FAILURE][STATIC_RESPONSE][binance][" << label << "] "
                          << e.what () << std::endl;
                report.failed++;
            }
        }
    }
    std::cout << "static response tests: " << report.passed << " passed, "
              << report.failed << " failed, " << report.skipped << " skipped" << std::endl;
    return report.failed ? 1 : 0;
}

} // namespace

int main (int argc, char** argv) {
    bool request = false;
    bool response = false;
    std::string only;
    for (int i = 1; i < argc; i++) {
        const std::string arg = argv[i];
        if (arg == "--requestTests" || arg == "--request")  request = true;
        else if (arg == "--responseTests" || arg == "--response") response = true;
        else if (arg.rfind ("--", 0) != 0 && arg != "binance") only = arg;
    }
    if (!request && !response) {
        std::cout << "usage: ccxt-static-binance [--requestTests] [--responseTests] [method]"
                  << std::endl;
        return 1;
    }
    int status = 0;
    try {
        if (request)  status |= runRequestTests (only);
        if (response) status |= runResponseTests (only);
    } catch (const std::exception& e) {
        std::cout << "[TEST_FAILURE] " << e.what () << std::endl;
        return 1;
    }
    return status;
}
