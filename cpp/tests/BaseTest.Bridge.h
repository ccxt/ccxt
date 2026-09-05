#pragma once

// Hand-written glue between the transpiled base tests and the C++ runtime.
//
// The TS base tests are free functions that import assertion helpers and a few shared
// utilities from outside their own file. The transpiler strips the imports (and the
// `testSharedMethods.` prefix), so those names have to resolve to something at global
// scope here. This is the C++ counterpart of cs/tests/BaseTest.Bridge.cs.

#include "../ccxt/base/Exchange.h"

#include <any>
#include <future>
#include <iostream>
#include <string>

// ---------------------------------------------------------------------------
// deep equality
// ---------------------------------------------------------------------------

// test.safeMethods declares a file-local `equals`, but its body is a single for-of,
// which the C++ backend drops -- the emitted function was `return true`, i.e. every
// comparison in that file silently passed. build/cppTranspiler.ts strips the mangled
// definition (stripGeneratedEquals) and the callers resolve to this one instead.
// Semantics follow cs/tests/BaseTest.Bridge.cs: recursive over lists and dicts, and
// asymmetric for dicts -- extra keys in `b` are allowed, matching the TS comment
// "does not check if b has more properties than a".
inline bool equals (const std::any& a, const std::any& b) {
    if (ccxt::isList (a)) {
        if (!ccxt::isList (b)) {
            return false;
        }
        const auto& x = std::any_cast<ccxt::list> (a);
        const auto& y = std::any_cast<ccxt::list> (b);
        if (x.size () != y.size ()) {
            return false;
        }
        for (std::size_t i = 0; i < x.size (); i++) {
            if (!equals (x.get (static_cast<long> (i)), y.get (static_cast<long> (i)))) {
                return false;
            }
        }
        return true;
    }
    if (ccxt::isDict (a)) {
        if (!ccxt::isDict (b)) {
            return false;
        }
        const auto& x = std::any_cast<ccxt::dict> (a);
        const auto& y = std::any_cast<ccxt::dict> (b);
        for (const auto& kv : x.entries ()) {
            if (!y.has (kv.first)) {
                return false;
            }
            if (!equals (kv.second, y.get (kv.first))) {
                return false;
            }
        }
        return true;
    }
    return isEqual (a, b);
}

// ---------------------------------------------------------------------------
// shared assertions (ts/src/test/Exchange/base/test.sharedMethods.ts)
// ---------------------------------------------------------------------------
//
// The transpiler strips the `testSharedMethods.` prefix, so these resolve here. The TS
// deepEqual is a JSON-string comparison, which makes it order-sensitive -- that is a
// real part of the contract for a port whose whole value model is insertion-ordered,
// so it is reproduced rather than relaxed into the structural `equals` above.
inline bool deepEqual (ccxt::Exchange& exchange, const std::any& a, const std::any& b) {
    return isEqual (exchange.json (a), exchange.json (b));
}

inline void assertDeepEqual (ccxt::Exchange& exchange, const std::any& skippedProperties,
                             const std::any& method, const std::any& a, const std::any& b) {
    (void) skippedProperties;
    if (!deepEqual (exchange, a, b)) {
        throw ccxt::BaseError (
            "two dicts do not match: " + std::any_cast<std::string> (toString (exchange.json (a)))
            + " != " + std::any_cast<std::string> (toString (exchange.json (b)))
            + " [" + std::any_cast<std::string> (toString (method)) + "]");
    }
}

// ---------------------------------------------------------------------------
// per-language hooks
// ---------------------------------------------------------------------------

// tests.init calls this first so each port can assert on its own value model before
// the shared tests run. The C++ model is covered by cpp/tests/test_value_model.cpp,
// which runs as its own binary, so there is nothing extra to do here.
inline std::shared_future<std::any> testLanguageSpecific () {
    return std::async (std::launch::deferred, []() -> std::any {
        return true;
    }).share ();
}
