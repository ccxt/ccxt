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
// plumbing (getProperty/setProperty/callDynamically over a std::any holding a
// std::shared_ptr<ExchangeBase>).

#include "BaseTest.Bridge.h"
#include "TestUtils.h"

#include "../ccxt/base/ExchangeBase.h"
#include "../ccxt/exchanges/ExchangeFactory.h"

#include <any>
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

    static std::any getLang () { return std::string ("C++"); }
    static std::any getExt () { return std::string ("cpp"); }
    static std::any getEnvVars () { return ccxt::dict {}; }
    static std::any getRootDir () { return ccxt::testutils::rootDir (); }
    static bool isWindows () { return false; }
    static bool isLinux () { return true; }
    static bool isAmd64 () { return true; }
    static std::any isNullValue (std::any value) { return !value.has_value (); }
    static std::any close (std::any) { return std::any {}; }

    // Called inside catch blocks: `std::any e = getRootException (ex)`. The call
    // itself would slice `ex` down to std::exception (losing the concrete ccxt
    // error type), so ignore the argument and capture the in-flight exception —
    // std::current_exception() is still valid here. isInstanceOf/exceptionMessage
    // understand the exception_ptr payload.
    static std::any getRootException (std::any exc) {
        if (auto p = std::current_exception ()) {
            return std::any (p);
        }
        return exc;
    }

    static void exitScript (std::any code = std::any (0)) {
        // The transpiled initInner calls exitScript(0) on success. Terminating here
        // would kill the C++ test binary mid-teardown; run-tests.js reads the
        // process exit code from main() instead.
        (void) code;
    }

    template <typename... Args>
    static void dump (const Args&... args) {
        std::ostringstream stream;
        ((stream << str (std::any (args)) << ' '), ...);
        std::cout << stream.str () << std::endl;
    }

    static std::any ioFileRead (std::any path, std::any decode = std::any (true)) {
        const std::string content = ccxt::testutils::readFile (str (path));
        if (decode.has_value () && isTrue (decode)) {
            ccxt::ExchangeBase parser;
            return parser.parseJson (content);
        }
        return content;
    }

    static std::any ioDirRead (std::any path) {
        ccxt::list out;
        const std::string dir = str (path);
        for (const auto& entry : std::filesystem::directory_iterator (dir)) {
            out.push (std::any (entry.path ().filename ().string ()));
        }
        return out;
    }

    static bool ioFileExists (std::any path) {
        return ccxt::testutils::fileExists (str (path));
    }

    static std::any getExchangeProp (std::any exchange, std::any prop, std::any defaultValue = std::any {}) {
        try {
            return getProperty (exchange, str (prop));
        } catch (const std::exception&) {
            return defaultValue;
        }
    }

    static std::any setExchangeProp (std::any exchange, std::any prop, std::any value) {
        return setProperty (exchange, str (prop), value);
    }

    // -------------------------------------------------------------------------
    // WS mocks — the pro layer is a non-goal; fail loudly if reached
    // -------------------------------------------------------------------------

    static std::any setupWsMockTransport (std::any, std::any, std::any, std::any, std::any) {
        throw ccxt::NotSupported ("WS mock transport is not implemented in the C++ port");
    }
    static std::any setupWsMockTransport (std::any, std::any) {
        throw ccxt::NotSupported ("WS mock transport is not implemented in the C++ port");
    }
    static std::any injectWsMessage (std::any, std::any, std::any) { return std::any {}; }
    static std::any rejectPendingWsFutures (std::any, std::any) { return std::any {}; }
    static std::any wsClientHasPendingFutures (std::any) { return false; }
    static std::any wsClientHasPendingFutures (std::any, std::any) { return false; }
    static std::any markWsTestCompleted (std::any, std::any) { return std::any {}; }
    static std::any isWsTestCompleted (std::any) { return false; }
    static std::any isWsTestCompleted (std::any, std::any) { return false; }
    static std::any getWsSentMessages (std::any) { return ccxt::list {}; }
    static std::any getWsSentMessages (std::any, std::any) { return ccxt::list {}; }

    // -------------------------------------------------------------------------
    // exchange plumbing over std::any-held shared_ptr<ExchangeBase>
    // -------------------------------------------------------------------------

    static std::shared_ptr<ccxt::ExchangeBase> unwrapExchange (std::any exchange) {
        if (!exchange.has_value ()) {
            throw ccxt::ArgumentsRequired ("exchange is undefined");
        }
        try {
            return std::any_cast<std::shared_ptr<ccxt::ExchangeBase>> (exchange);
        } catch (const std::bad_any_cast&) {
            // maybe it was stored as a raw pointer by some path
            try {
                auto* raw = std::any_cast<ccxt::ExchangeBase*> (exchange);
                return std::shared_ptr<ccxt::ExchangeBase> (raw);
            } catch (const std::bad_any_cast&) {
                throw ccxt::ArgumentsRequired ("not an exchange instance");
            }
        }
    }

    static std::any getProperty (std::any exchange, std::any name) {
        return unwrapExchange (exchange)->getProperty (str (name));
    }

    static std::any setProperty (std::any exchange, std::any name, std::any value) {
        return unwrapExchange (exchange)->setProperty (str (name), value);
    }

    static std::any callDynamically (std::any exchange, std::any name, std::any args) {
        return unwrapExchange (exchange)->callDynamically (str (name), args);
    }

    static std::any callExchangeMethodDynamically (std::any exchange, std::any methodName, std::any args) {
        return unwrapExchange (exchange)->callDynamically (str (methodName), args);
    }

    static std::any callExchangeMethodDynamicallySync (std::any, std::any, std::any) {
        throw ccxt::NotSupported ("only async methods apply in the test framework");
    }

    static std::any callOverridenMethod (std::any exchange, std::any methodName, std::any args) {
        return callExchangeMethodDynamically (exchange, methodName, args);
    }

    static std::any callMethodSync (std::any, std::any, std::any, std::any, std::any) {
        return ccxt::dict {};
    }

    static std::any isSync () {
        return getCliArgValue ("--sync");
    }

    static std::any jsonParse (std::any elem) {
        ccxt::ExchangeBase parser;   // reuse the runtime's JSON parser
        return parser.parseJson (str (elem));
    }

    static std::any jsonStringify (std::any elem) {
        return ::jsonStringify (elem);
    }

    static std::any convertAscii (std::any input) {
        return input;   // stub, exactly like the C# bridge
    }

    static std::string exceptionMessage (const std::exception& e) {
        return std::string ("[std::exception] ") + e.what ();
    }

    static std::string exceptionMessage (const std::any& e) {
        // getRootException wraps the in-flight exception_ptr; unwrap for the message
        if (e.type () == typeid (std::exception_ptr)) {
            try {
                std::rethrow_exception (std::any_cast<std::exception_ptr> (e));
            } catch (const std::exception& real) {
                return std::string ("[") + typeid (real).name () + "] " + real.what ();
            } catch (...) {
                return "[unknown exception]";
            }
        }
        return std::string ("[std::any] ") + str (e);
    }

    // tests.helpers.ts: swap the transport for a canned response and hand the
    // (still fully functional) exchange back — the C++ counterpart of
    // exchange.fetch = setFetchResponse
    static std::any setFetchResponse (std::any exchange, std::any response) {
        auto ex = unwrapExchange (exchange);
        ex->fetchImpl = [response] (std::any, std::any, std::any, std::any) -> std::any {
            return response;
        };
        return std::any (std::shared_ptr<ccxt::ExchangeBase> (ex));
    }

    static std::any setFetchResponseSync (std::any exchange, std::any response) {
        return setFetchResponse (exchange, response);
    }

    // -------------------------------------------------------------------------
    // exchange construction + test file registry
    // -------------------------------------------------------------------------

    static std::any initExchange (std::any exchangeIdAny, std::any exchangeArgs, std::any isWs = std::any (false)) {
        (void) isWs;   // ccxt.pro is a non-goal; regular exchange classes only
        const std::string id = str (exchangeIdAny);
        std::any config = exchangeArgs.has_value () ? exchangeArgs : std::any (ccxt::dict {});
        // merge credentials from keys.json when present
        const std::string keysPath = ccxt::testutils::rootDir () + "keys.json";
        if (ccxt::testutils::fileExists (keysPath)) {
            ccxt::ExchangeBase parser;   // reuse the runtime's JSON parser
            const std::any keys = parser.parseJson (ccxt::testutils::readFile (keysPath));
            const std::any mine = getValue (keys, std::string (id));
            if (ccxt::isDict (mine) && ccxt::isDict (config)) {
                for (const auto& kv : std::any_cast<ccxt::dict> (mine).entries ()) {
                    std::any_cast<ccxt::dict> (config).set (kv.first, kv.second);
                }
            }
        }
        // stored as shared_ptr<ExchangeBase> so unwrapExchange can cast it back;
        // the per-exchange factories live in the generated tu_*.cpp units
        return std::any (ccxt::factory::createExchange (id, config));
    }

    std::any getTestFilesSync (std::any properties, std::any ws = std::any (false)) {
        (void) ws;
        ccxt::dict out;
        if (ccxt::isList (properties)) {
            // C# appends "features" to the property list (BaseTest.Helpers.cs) because
            // exchange.has does not carry it, yet test.features.ts exists for every venue.
            // ccxt::list is reference-semantic, so build a detached copy before appending.
            ccxt::list props (std::any_cast<ccxt::list> (properties).items ());
            props.push (std::any (std::string ("features")));
            for (const auto& keyAny : props.items ()) {
                const std::string key = str (keyAny);
                if (testRegistry ().count (key)) {
                    out.set (key, std::string (key));
                }
            }
        }
        return out;
    }

    std::any getTestFiles (std::any properties, std::any ws = std::any (false)) {
        return getTestFilesSync (properties, ws);
    }

    std::any callMethod (std::any testFiles, std::any methodName, std::any exchange,
                         std::any skippedProperties, std::any args) {
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

#include "Generated/testMainClass.inc"
#include "Generated/Exchange/TestRegistry.inc"
#include "Generated/Exchange/Includes.inc"
};

} // namespace ccxt

// The registry thunks are declared inside the class body above via the generated
// include; the generated TestRegistry.inc defines the map used by getTestFiles.
