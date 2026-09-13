#pragma once

// Hand-written half of the transpiled testMainClass (ts/src/test/tests.ts).
//
// C# splits testMainClass across the generated TestMethods.cs and a handwritten
// `partial class testMainClass : BaseTest` (cs/tests/BaseTest.Helpers.cs); C++ has
// no partial classes, so this file owns the class declaration and #includes the
// generated member lists -- the same pattern as cpp/ccxt/base/Exchange.h and the
// .inc fragments.
//
// Every bare identifier the transpiled code calls that is not defined inside
// tests.ts itself must resolve to a member here: dump, getCliArgValue, initExchange,
// callExchangeMethodDynamically, callMethod, getTestFiles(Sync), ioFileRead/Exists,
// exitScript, get/setExchangeProp, the WS stubs, and the exchange/… property
// plumbing (getProperty/setProperty/callDynamically over a ccxt::any holding a
// std::shared_ptr<ExchangeBase>).

#include "BaseTest.Bridge.h"
#include "TestUtils.h"

#include "../ccxt/base/ExchangeBase.h"
#include "../ccxt/exchanges/ExchangeFactory.h"
#include "../ccxt/pro/ProExchangeFactory.h"

#include <any>
#include <cstdio>
#include <cstdlib>
#include <filesystem>
#include <functional>
#include <future>
#include <iostream>
#include <sstream>
#include <string>
#include <unordered_map>
#include <vector>

// CLI snapshot set by main.cpp before the testMainClass is constructed.
namespace ccxt {
extern std::vector<std::string> g_testArgs;

class testMainClass {
public:
    // -------------------------------------------------------------------------
    // CLI / environment (cs/tests/BaseTest.Helpers.cs)
    // -------------------------------------------------------------------------

    static bool getCliArgValue (const std::string& option) {
        for (const auto& a : g_testArgs) {
            if (a == option) {
                return true;
            }
        }
        return false;
    }

    static ccxt::any getLang () { return std::string ("C++"); }
    static ccxt::any getExt () { return std::string ("cpp"); }
    static ccxt::any getEnvVars () { return ccxt::dict {}; }
    static ccxt::any getRootDir () { return ccxt::testutils::rootDir (); }
    static bool isWindows () { return false; }
    static bool isLinux () { return true; }
    static bool isAmd64 () { return true; }
    static ccxt::any isNullValue (ccxt::any value) { return !value.has_value (); }
    static ccxt::any close (ccxt::any exchange) {
        // reject pending ws futures + drop the clients, then await the close
        return awaitValue (unwrapExchange (exchange)->close (ccxt::any {}));
    }

    // Called inside catch blocks: `ccxt::any e = getRootException (ex)`. The call
    // itself would slice `ex` down to std::exception (losing the concrete ccxt
    // error type), so ignore the argument and capture the in-flight exception —
    // std::current_exception() is still valid here. isInstanceOf/exceptionMessage
    // understand the exception_ptr payload.
    static ccxt::any getRootException (ccxt::any exc) {
        if (auto p = std::current_exception ()) {
            return ccxt::any (p);
        }
        return exc;
    }

    static void exitScript (ccxt::any code = ccxt::any (0)) {
        // The transpiled initInner calls exitScript(0) on success. Terminating here
        // would kill the C++ test binary mid-teardown; run-tests.js reads the
        // process exit code from main() instead.
        (void) code;
    }

    template <typename... Args>
    static void dump (const Args&... args) {
        std::ostringstream stream;
        ((stream << str (ccxt::any (args)) << ' '), ...);
        std::cout << stream.str () << std::endl;
    }

    static ccxt::any ioFileRead (ccxt::any path, ccxt::any decode = ccxt::any (true)) {
        const std::string content = ccxt::testutils::readFile (str (path));
        if (decode.has_value () && isTrue (decode)) {
            ccxt::ExchangeBase parser;
            return parser.parseJson (content);
        }
        return content;
    }

    static ccxt::any ioDirRead (ccxt::any path) {
        ccxt::list out;
        const std::string dir = str (path);
        for (const auto& entry : std::filesystem::directory_iterator (dir)) {
            out.push (ccxt::any (entry.path ().filename ().string ()));
        }
        return out;
    }

    static bool ioFileExists (ccxt::any path) {
        return ccxt::testutils::fileExists (str (path));
    }

    static ccxt::any getExchangeProp (ccxt::any exchange, ccxt::any prop, ccxt::any defaultValue = ccxt::any {}) {
        try {
            return getProperty (exchange, str (prop));
        } catch (const std::exception&) {
            return defaultValue;
        }
    }

    static ccxt::any setExchangeProp (ccxt::any exchange, ccxt::any prop, ccxt::any value) {
        return setProperty (exchange, str (prop), value);
    }

    // -------------------------------------------------------------------------
    // WS mocks — the pro layer is a non-goal; fail loudly if reached
    // -------------------------------------------------------------------------

    static ccxt::any setupWsMockTransport (ccxt::any, ccxt::any, ccxt::any, ccxt::any, ccxt::any) {
        return ccxt::any {};
    }
    static ccxt::any setupWsMockTransport (ccxt::any exchange, ccxt::any url) {
        // the static ws tests never dial: mark the client as connected so watch()
        // proceeds straight to subscription + future registration
        auto ex = unwrapExchange (exchange);
        ccxt::ws::Client client = ccxt::any_cast<ccxt::ws::Client> (ex->client (url));
        client.mockConnect ();
        return ccxt::any (client);
    }
    static ccxt::any injectWsMessage (ccxt::any exchange, ccxt::any url, ccxt::any message) {
        auto ex = unwrapExchange (exchange);
        ccxt::ws::Client client = ccxt::any_cast<ccxt::ws::Client> (ex->client (url));
        // frames arrive as JSON strings; handleMessage parses the inner payload itself
        ccxt::any parsed = message;
        if (message.has_value () && message.type () == typeid (std::string)) {
            ccxt::ExchangeBase parser;
            parsed = parser.parseJson (ccxt::any_cast<std::string> (message));
        }
        ex->callDynamically ("handleMessage", ccxt::list { ccxt::any (client), parsed });
        return ccxt::any {};
    }
    static ccxt::any rejectPendingWsFutures (ccxt::any exchange, ccxt::any url) {
        auto ex = unwrapExchange (exchange);
        ccxt::ws::Client client = ccxt::any_cast<ccxt::ws::Client> (ex->client (url));
        if (std::getenv ("CCXT_WS_URL_TRACE")) {
            std::fprintf (stderr, "[ws-reject] url=%s pending=%d\n", client.url ().c_str (),
                          static_cast<int> (client.pendingFuturesCount ()));
        }
        client.reject (ccxt::any (std::string ("ExchangeError")),
                       "" /* every pending future */);
        return ccxt::any {};
    }
    static ccxt::any wsClientHasPendingFutures (ccxt::any) { return false; }
    static ccxt::any wsClientHasPendingFutures (ccxt::any exchange, ccxt::any url) {
        auto ex = unwrapExchange (exchange);
        ccxt::ws::Client client = ccxt::any_cast<ccxt::ws::Client> (ex->client (url));
        bool pending = client.hasPendingFutures ();
        if (std::getenv ("CCXT_WS_URL_TRACE")) {
            std::fprintf (stderr, "[ws-pending] url=%s pending=%d\n", client.url ().c_str (),
                          static_cast<int> (pending));
        }
        return pending;
    }
    static ccxt::any markWsTestCompleted (ccxt::any exchange, ccxt::any url) {
        auto ex = unwrapExchange (exchange);
        ccxt::ws::Client client = ccxt::any_cast<ccxt::ws::Client> (ex->client (url));
        if (std::getenv ("CCXT_WS_URL_TRACE")) {
            std::fprintf (stderr, "[ws-completed] url=%s\n", client.url ().c_str ());
        }
        client.markWsTestCompleted ();
        return ccxt::any {};
    }
    static ccxt::any isWsTestCompleted (ccxt::any) { return false; }
    static ccxt::any isWsTestCompleted (ccxt::any exchange, ccxt::any url) {
        auto ex = unwrapExchange (exchange);
        ccxt::ws::Client client = ccxt::any_cast<ccxt::ws::Client> (ex->client (url));
        return client.isWsTestCompleted ();
    }
    static ccxt::any getWsSentMessages (ccxt::any) { return ccxt::list {}; }
    static ccxt::any getWsSentMessages (ccxt::any exchange, ccxt::any url) {
        auto ex = unwrapExchange (exchange);
        ccxt::ws::Client client = ccxt::any_cast<ccxt::ws::Client> (ex->client (url));
        return ccxt::any (client.sentMessagesView ());
    }

    // -------------------------------------------------------------------------
    // exchange plumbing over ccxt::any-held shared_ptr<ExchangeBase>
    // -------------------------------------------------------------------------

    static std::shared_ptr<ccxt::ExchangeBase> unwrapExchange (ccxt::any exchange) {
        if (!exchange.has_value ()) {
            throw ccxt::ArgumentsRequired ("exchange is undefined");
        }
        try {
            return ccxt::any_cast<std::shared_ptr<ccxt::ExchangeBase>> (exchange);
        } catch (const std::bad_any_cast&) {
            // maybe it was stored as a raw pointer by some path
            try {
                auto* raw = ccxt::any_cast<ccxt::ExchangeBase*> (exchange);
                return std::shared_ptr<ccxt::ExchangeBase> (raw);
            } catch (const std::bad_any_cast&) {
                throw ccxt::ArgumentsRequired ("not an exchange instance");
            }
        }
    }

    static ccxt::any getProperty (ccxt::any exchange, ccxt::any name) {
        return unwrapExchange (exchange)->getProperty (str (name));
    }

    static ccxt::any setProperty (ccxt::any exchange, ccxt::any name, ccxt::any value) {
        return unwrapExchange (exchange)->setProperty (str (name), value);
    }

    static ccxt::any callDynamically (ccxt::any exchange, ccxt::any name, ccxt::any args) {
        return unwrapExchange (exchange)->callDynamically (str (name), args);
    }

    static ccxt::any callExchangeMethodDynamically (ccxt::any exchange, ccxt::any methodName, ccxt::any args) {
        return unwrapExchange (exchange)->callDynamically (str (methodName), args);
    }

    static ccxt::any callExchangeMethodDynamicallySync (ccxt::any, ccxt::any, ccxt::any) {
        throw ccxt::NotSupported ("only async methods apply in the test framework");
    }

    static ccxt::any callOverridenMethod (ccxt::any exchange, ccxt::any methodName, ccxt::any args) {
        return callExchangeMethodDynamically (exchange, methodName, args);
    }

    static ccxt::any callMethodSync (ccxt::any, ccxt::any, ccxt::any, ccxt::any, ccxt::any) {
        return ccxt::dict {};
    }

    static ccxt::any isSync () {
        return getCliArgValue ("--sync");
    }

    static ccxt::any jsonParse (ccxt::any elem) {
        ccxt::ExchangeBase parser;   // reuse the runtime's JSON parser
        return parser.parseJson (str (elem));
    }

    static ccxt::any jsonStringify (ccxt::any elem) {
        return ::jsonStringify (elem);
    }

    static ccxt::any convertAscii (ccxt::any input) {
        return input;   // stub, exactly like the C# bridge
    }

    static std::string exceptionMessage (const std::exception& e) {
        return std::string ("[std::exception] ") + e.what ();
    }

    static std::string exceptionMessage (const ccxt::any& e) {
        // getRootException wraps the in-flight exception_ptr; unwrap for the message
        if (e.type () == typeid (std::exception_ptr)) {
            try {
                std::rethrow_exception (ccxt::any_cast<std::exception_ptr> (e));
            } catch (const std::exception& real) {
                return std::string ("[") + typeid (real).name () + "] " + real.what ();
            } catch (...) {
                return "[unknown exception]";
            }
        }
        return std::string ("[ccxt::any] ") + str (e);
    }

    // tests.helpers.ts: swap the transport for a canned response and hand the
    // (still fully functional) exchange back — the C++ counterpart of
    // exchange.fetch = setFetchResponse
    static ccxt::any setFetchResponse (ccxt::any exchange, ccxt::any response) {
        auto ex = unwrapExchange (exchange);
        ex->fetchImpl = [response] (ccxt::any, ccxt::any, ccxt::any, ccxt::any) -> ccxt::any {
            return response;
        };
        return ccxt::any (std::shared_ptr<ccxt::ExchangeBase> (ex));
    }

    static ccxt::any setFetchResponseSync (ccxt::any exchange, ccxt::any response) {
        return setFetchResponse (exchange, response);
    }

    // -------------------------------------------------------------------------
    // exchange construction + test file registry
    // -------------------------------------------------------------------------

    static ccxt::any initExchange (ccxt::any exchangeIdAny, ccxt::any exchangeArgs, ccxt::any isWs = ccxt::any (false)) {
        const std::string id = str (exchangeIdAny);
        const bool ws = isTrue (isWs);   // ws static tests construct ccxt.pro instances
        ccxt::any config = exchangeArgs.has_value () ? exchangeArgs : ccxt::any (ccxt::dict {});
        // merge credentials from keys.json when present
        const std::string keysPath = ccxt::testutils::rootDir () + "keys.json";
        if (ccxt::testutils::fileExists (keysPath)) {
            ccxt::ExchangeBase parser;   // reuse the runtime's JSON parser
            const ccxt::any keys = parser.parseJson (ccxt::testutils::readFile (keysPath));
            const ccxt::any mine = getValue (keys, std::string (id));
            if (ccxt::isDict (mine) && ccxt::isDict (config)) {
                for (const auto& kv : ccxt::any_cast<ccxt::dict> (mine).entries ()) {
                    ccxt::any_cast<ccxt::dict> (config).set (kv.first, kv.second);
                }
            }
        }
        // stored as shared_ptr<ExchangeBase> so unwrapExchange can cast it back;
        // the per-exchange factories live in the generated tu_*.cpp units
        if (ws) {
            return ccxt::any (ccxt::pro::factory::createProExchange (id, config));
        }
        return ccxt::any (ccxt::factory::createExchange (id, config));
    }

    ccxt::any getTestFilesSync (ccxt::any properties, ccxt::any ws = ccxt::any (false)) {
        (void) ws;
        ccxt::dict out;
        if (ccxt::isList (properties)) {
            // C# appends "features" to the property list (BaseTest.Helpers.cs) because
            // exchange.has does not carry it, yet test.features.ts exists for every venue.
            // ccxt::list is reference-semantic, so build a detached copy before appending.
            ccxt::list props (ccxt::any_cast<ccxt::list> (properties).items ());
            props.push (ccxt::any (std::string ("features")));
            for (const auto& keyAny : props.items ()) {
                const std::string key = str (keyAny);
                if (testRegistry ().count (key)) {
                    out.set (key, std::string (key));
                }
            }
        }
        return out;
    }

    ccxt::any getTestFiles (ccxt::any properties, ccxt::any ws = ccxt::any (false)) {
        return getTestFilesSync (properties, ws);
    }

    ccxt::any callMethod (ccxt::any testFiles, ccxt::any methodName, ccxt::any exchange,
                         ccxt::any skippedProperties, ccxt::any args) {
        (void) testFiles;
        const std::string name = str (methodName);
        const auto& registry = testRegistry ();
        const auto it = registry.find (name);
        if (it == registry.end ()) {
            throw ccxt::NotSupported ("no C++ test thunk for method " + name);
        }
        return it->second.thunk (this, exchange, skippedProperties, args);
    }

    // -------------------------------------------------------------------------
    // generated members
    // -------------------------------------------------------------------------

    // total failures across the static suites (request/response/ws). The
    // transpiled framework marks per-suite booleans but never folds them into
    // the process exit code; main.cpp consults this so a failed suite can
    // never report a green exit.
    long totalTestFailures () const {
        long failures = 0;
        const auto flag = [] (const ccxt::any& v) {
            return v.has_value () && ccxt::any_cast<bool> (v);
        };
        if (flag (requestTestsFailed)) failures++;
        if (flag (responseTestsFailed)) failures++;
        if (flag (staticWsTestsFailed)) failures++;
        return failures;
    }

#include "Generated/testMainClass.inc"
#include "Generated/Exchange/TestRegistry.inc"
#include "Generated/Exchange/Includes.inc"
};

} // namespace ccxt

// The registry thunks are declared inside the class body above via the generated
// include; the generated TestRegistry.inc defines the map used by getTestFiles.
