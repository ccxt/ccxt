// The base-test runner: cpp/build/ccxt-tests.
//
// Mirrors cs/tests/Program.cs. run-tests.js treats any line beginning with
// [TEST_FAILURE] as a failure, so every escaping exception is reported that way and
// the process exits non-zero.
//
// Only the CORE subset below is executed. Transpiling all 62 base tests but gating on
// a subset is deliberate (see the iteration plan): the staged list at the bottom of
// this file is the visible, enumerated gap rather than a silent one, and each entry
// names the runtime piece it is waiting on.

#include "BaseTest.Bridge.h"

// Hand-written, not generated: ts/src/test/base/test.cryptography.ts is marked
// NO_AUTO_TRANSPILE, so every port maintains its own copy (C# included).
#include "Manual/test.cryptography.h"

#include "Generated/Base/test.aggregate.h"
#include "Generated/Base/test.arrayConcat.h"
#include "Generated/Base/test.arraysConcat.h"
#include "Generated/Base/test.capitalize.h"
#include "Generated/Base/test.clone.h"
#include "Generated/Base/test.constants.h"
#include "Generated/Base/test.decimalToPrecision.h"
#include "Generated/Base/test.deepExtend.h"
#include "Generated/Base/test.extend.h"
#include "Generated/Base/test.extractParams.h"
#include "Generated/Base/test.filterBy.h"
#include "Generated/Base/test.groupBy.h"
#include "Generated/Base/test.implodeParams.h"
#include "Generated/Base/test.inArray.h"
#include "Generated/Base/test.indexBy.h"
#include "Generated/Base/test.isDictionary.h"
#include "Generated/Base/test.isEmpty.h"
#include "Generated/Base/test.isJsonEncodedObject.h"
#include "Generated/Base/test.json.h"
#include "Generated/Base/test.keysort.h"
#include "Generated/Base/test.numberToString.h"
#include "Generated/Base/test.omit.h"
#include "Generated/Base/test.parsePrecision.h"
#include "Generated/Base/test.precise.h"
#include "Generated/Base/test.precisionFromString.h"
#include "Generated/Base/test.rawencode.h"
#include "Generated/Base/test.removeRepeatedElementsFromArray.h"
#include "Generated/Base/test.safeMethods.h"
#include "Generated/Base/test.sort.h"
#include "Generated/Base/test.sortBy.h"
#include "Generated/Base/test.strip.h"
#include "Generated/Base/test.sum.h"
#include "Generated/Base/test.timeframes.h"
#include "Generated/Base/test.toArray.h"
#include "Generated/Base/test.unique.h"
#include "Generated/Base/test.urlencode.h"
#include "Generated/Base/test.urlencodeNested.h"
#include "Generated/Base/test.urlencodeWithArrayRepeat.h"

#include <exception>
#include <iostream>
#include <string>
#include <utility>
#include <vector>

namespace {

using TestFn = void (*) ();

struct Case {
    const char* name;
    TestFn run;
};

// The gated core. Everything here must pass for the build to be green.
const std::vector<Case> CORE = {
    { "constants",                     testConstants },
    { "cryptography",                  testCryptography },
    { "aggregate",                     testAggregate },
    { "extend",                        testExtend },
    { "deepExtend",                    testDeepExtend },
    { "clone",                         testClone },
    { "capitalize",                    testCapitalize },
    { "isDictionary",                  testIsDictionary },
    { "isEmpty",                       testIsEmpty },
    { "isJsonEncodedObject",           testIsJsonEncodedObject },
    { "json",                          testJson },
    { "numberToString",                testNumberToString },
    { "precise",                       testPrecise },
    { "parsePrecision",                testParsePrecision },
    { "precisionFromString",           testPrecisionFromString },
    { "decimalToPrecision",            testDecimalToPrecision },
    { "safeMethods",                   testSafeMethods },
    { "omit",                          testOmit },
    { "keysort",                       testKeysort },
    { "sortBy",                        testSortBy },
    { "sort",                          testSort },
    { "sum",                           testSum },
    { "groupBy",                       testGroupBy },
    { "indexBy",                       testIndexBy },
    { "filterBy",                      testFilterBy },
    { "inArray",                       testInArray },
    { "toArray",                       testToArray },
    { "unique",                        testUnique },
    { "arrayConcat",                   testArrayConcat },
    { "arraysConcat",                  testArraysConcat },
    { "removeRepeatedElementsFromArray", testRemoveRepeatedElementsFromArray },
    { "strip",                         testStrip },
    { "extractParams",                 testExtractParams },
    { "implodeParams",                 testImplodeParams },
    { "urlencode",                     testUrlencode },
    { "urlencodeNested",               testUrlencodeNested },
    { "urlencodeWithArrayRepeat",      testUrlencodeWithArrayRepeat },
    { "rawencode",                     testRawencode },
    { "timeframes",                    testTimeframes },
};

// Transpiled and compiled by CMake into the tree, but NOT gated yet. Each is blocked on
// a runtime piece this iteration deliberately left out; printing the list keeps the gap
// in front of whoever runs the suite.
const std::vector<std::pair<const char*, const char*>> STAGED = {
    { "base16ToBinary",         "binary value type not in the iteration-1 runtime" },
    { "base58ToBinary",         "binary value type + base58 alphabet" },
    { "base64ToBinary",         "binary value type + base64" },
    { "binaryToBase16",         "binary value type not in the iteration-1 runtime" },
    { "binaryToBase58",         "binary value type + base58 alphabet" },
    { "binaryToBase64",         "binary value type + base64" },
    { "binaryConcat",           "binary value type not in the iteration-1 runtime" },
    { "stringToBase16",         "binary value type + base16" },
    { "stringToBase64",         "binary value type + base64" },
    { "urlencodeBase64",        "binary value type + base64" },
    { "numberToBE",             "binary value type not in the iteration-1 runtime" },
    { "encodeDecode",           "binary value type not in the iteration-1 runtime" },
    { "ethMethods",             "no secp256k1/keccak layer yet" },
    { "uuid",                   "needs a seeded RNG in the runtime" },
    { "datetime",               "Time.h (parse8601/iso8601) is iteration 2" },
    { "io",                     "filesystem access is out of scope this iteration" },
    { "sleep",                  "needs the async scheduler, not just std::async" },
    { "networkMethods",         "depends on the network-code tables loaded from describe()" },
    { "handleMethods",          "depends on loadMarkets, which needs the HTTP layer" },
    { "fetchHistory",           "needs the HTTP layer (fetch() throws NotSupported)" },
    { "setMarketsFromExchange", "needs loadMarkets" },
    { "afterConstructor",       "needs the throttler and sandbox plumbing" },
    { "safeTicker",             "depends on Number.h rounding" },
};

int runBaseTests () {
    int failures = 0;
    for (const auto& test : CORE) {
        try {
            resetAssertionOrdinal ();   // so a failure reports the ordinal within THIS test
            test.run ();
            std::cout << "[PASS] " << test.name << std::endl;
        } catch (const std::exception& e) {
            // run-tests.js keys off this prefix
            std::cout << "[TEST_FAILURE] " << test.name << ": " << e.what () << std::endl;
            failures++;
        } catch (...) {
            std::cout << "[TEST_FAILURE] " << test.name << ": unknown exception" << std::endl;
            failures++;
        }
    }
    std::cout << "\n" << (CORE.size () - static_cast<std::size_t> (failures))
              << "/" << CORE.size () << " core base tests passed" << std::endl;
    std::cout << STAGED.size () << " base tests transpiled but staged for the next iteration:"
              << std::endl;
    for (const auto& staged : STAGED) {
        std::cout << "  - " << staged.first << " (" << staged.second << ")" << std::endl;
    }
    return (failures == 0) ? 0 : 1;
}

} // namespace

int main (int argc, char** argv) {
    bool baseTests = false;
    std::string exchangeId;
    for (int i = 1; i < argc; i++) {
        const std::string arg = argv[i];
        if (arg == "--baseTests") {
            baseTests = true;
        } else if (arg.rfind ("--", 0) != 0) {
            exchangeId = arg;
        }
    }
    if (baseTests) {
        return runBaseTests ();
    }
    // Live per-exchange tests need the HTTP layer, which this iteration stubs out.
    std::cout << "[TEST_FAILURE] only --baseTests is implemented in the C++ port"
              << (exchangeId.empty () ? "" : " (asked for " + exchangeId + ")") << std::endl;
    return 1;
}
