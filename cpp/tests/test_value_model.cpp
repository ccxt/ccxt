// Gate for the D1 value model: insertion order, reference semantics, and the
// JavaScript semantics of the helper surface. Runs offline, no exchange needed.

#include "../ccxt/base/helpers.h"

#include <iostream>
#include <string>

using ccxt::dict;
using ccxt::list;

static int failures = 0;

static void check (bool condition, const std::string& what) {
    if (!condition) {
        std::cout << "  FAIL: " << what << std::endl;
        failures++;
    }
}

static void checkStr (const ccxt::any& actual, const std::string& expected, const std::string& what) {
    const std::string got = ccxt::any_cast<std::string> (toString (actual));
    if (got != expected) {
        std::cout << "  FAIL: " << what << " - expected \"" << expected
                  << "\", got \"" << got << "\"" << std::endl;
        failures++;
    }
}

static void testOrdering () {
    // ccxt signs requests over key order, so insertion order is load-bearing
    dict d { { std::string ("zebra"), ccxt::any (1) },
             { std::string ("alpha"), ccxt::any (2) },
             { std::string ("melon"), ccxt::any (3) } };
    checkStr (join (getObjectKeys (ccxt::any (d)), ccxt::any (std::string (","))),
              "zebra,alpha,melon", "insertion order preserved");

    // updating an existing key must not move it to the back
    d.set ("zebra", ccxt::any (99));
    checkStr (join (getObjectKeys (ccxt::any (d)), ccxt::any (std::string (","))),
              "zebra,alpha,melon", "update keeps position");
    check (isEqual (d.get ("zebra"), ccxt::any (99)), "update changes value");

    // deleting reindexes without disturbing the survivors' order
    deleteKey (ccxt::any (d), ccxt::any (std::string ("alpha")));
    checkStr (join (getObjectKeys (ccxt::any (d)), ccxt::any (std::string (","))),
              "zebra,melon", "delete preserves order");
    check (!inOp (ccxt::any (d), ccxt::any (std::string ("alpha"))), "deleted key is gone");
}

static void testReferenceSemantics () {
    // JS aliasing: two names for one object see each other's writes
    dict original { { std::string ("k"), ccxt::any (1) } };
    ccxt::any boxed = original;          // through ccxt::any, as generated code does
    setValue (boxed, ccxt::any (std::string ("k")), ccxt::any (2));
    check (isEqual (original.get ("k"), ccxt::any (2)), "setValue through any aliases");

    ccxt::any alias = boxed;             // copying the any copies the handle, not the map
    setValue (alias, ccxt::any (std::string ("added")), ccxt::any (std::string ("v")));
    check (inOp (ccxt::any (original), ccxt::any (std::string ("added"))), "any copy still aliases");

    list arr { ccxt::any (1), ccxt::any (2) };
    ccxt::any boxedArr = arr;
    arrayPush (boxedArr, ccxt::any (3));
    check (isEqual (getArrayLength (ccxt::any (arr)), ccxt::any (3)), "arrayPush aliases");

    // nested containers alias too - this is what `market['limits']['amount']` relies on
    dict inner { { std::string ("deep"), ccxt::any (1) } };
    dict outer { { std::string ("inner"), ccxt::any (inner) } };
    setValue (getValue (ccxt::any (outer), ccxt::any (std::string ("inner"))),
              ccxt::any (std::string ("deep")), ccxt::any (42));
    check (isEqual (inner.get ("deep"), ccxt::any (42)), "nested write aliases");
}

static void testGetValue () {
    dict d { { std::string ("a"), ccxt::any (std::string ("A")) } };
    list arr { ccxt::any (10), ccxt::any (20) };

    check (isEqual (getValue (ccxt::any (d), ccxt::any (std::string ("a"))),
                    ccxt::any (std::string ("A"))), "dict lookup");
    check (ccxt::isUndef (getValue (ccxt::any (d), ccxt::any (std::string ("missing")))),
           "missing key is undefined");
    check (isEqual (getValue (ccxt::any (arr), ccxt::any (1)), ccxt::any (20)), "list index");
    check (ccxt::isUndef (getValue (ccxt::any (arr), ccxt::any (9))), "out of range is undefined");
    check (ccxt::isUndef (getValue (ccxt::any {}, ccxt::any (0))), "index into undefined is undefined");
    checkStr (getValue (ccxt::any (std::string ("abc")), ccxt::any (1)), "b", "string char access");
}

static void testTruthiness () {
    check (!isTrue (ccxt::any {}),                          "undefined is falsy");
    check (!isTrue (ccxt::any (0)),                         "0 is falsy");
    check (!isTrue (ccxt::any (std::string (""))),          "empty string is falsy");
    check (!isTrue (ccxt::any (false)),                     "false is falsy");
    check (isTrue (ccxt::any (std::string ("0"))),          "\"0\" is truthy");
    check (isTrue (ccxt::any (1)),                          "1 is truthy");
    // the one that trips people: empty objects and arrays are truthy in JS
    check (isTrue (ccxt::any (dict {})),                    "empty dict is truthy");
    check (isTrue (ccxt::any (list {})),                    "empty list is truthy");
}

static void testEquality () {
    check (isEqual (ccxt::any (1), ccxt::any (1.0)),         "int equals double");
    check (isEqual (ccxt::any {}, ccxt::any {}),             "undefined equals undefined");
    check (!isEqual (ccxt::any {}, ccxt::any (0)),           "undefined is not 0");
    check (!isEqual (ccxt::any (std::string ("1")), ccxt::any (1)), "=== does not coerce");

    // objects compare by identity, not contents
    dict a { { std::string ("k"), ccxt::any (1) } };
    dict b { { std::string ("k"), ccxt::any (1) } };
    check (!isEqual (ccxt::any (a), ccxt::any (b)), "distinct dicts are not equal");
    check (isEqual (ccxt::any (a), ccxt::any (a)),  "same dict is equal to itself");
}

static void testArithmetic () {
    checkStr (add (ccxt::any (1), ccxt::any (2)), "3", "numeric add");
    // `+` concatenates when either side is a string - the classic transpiler trap
    checkStr (add (ccxt::any (std::string ("a")), ccxt::any (1)), "a1", "string concat");
    checkStr (add (ccxt::any (1), ccxt::any (std::string ("1"))), "11", "number + string concat");
    // JS division always produces a float, unlike C++ integer division
    checkStr (divide (ccxt::any (1), ccxt::any (2)), "0.5", "division is float");
    checkStr (multiply (ccxt::any (3), ccxt::any (4)), "12", "multiply");
    checkStr (subtract (ccxt::any (10), ccxt::any (4)), "6", "subtract");
    checkStr (mod (ccxt::any (7), ccxt::any (3)), "1", "mod");

    ccxt::any counter = ccxt::any (5);
    postFixIncrement (counter);
    checkStr (counter, "6", "postFixIncrement mutates");

    // integers must not decay into "1.0" when stringified
    checkStr (ccxt::any (1.0), "1", "integral double prints as int");
    checkStr (ccxt::any (1.5), "1.5", "fraction prints in full");
}

static void testComparisons () {
    check (isGreaterThan (ccxt::any (2), ccxt::any (1)),          "2 > 1");
    check (isLessThan (ccxt::any (1), ccxt::any (2)),             "1 < 2");
    check (isGreaterThanOrEqual (ccxt::any (2), ccxt::any (2)),   "2 >= 2");
    check (isLessThanOrEqual (ccxt::any (2), ccxt::any (2)),      "2 <= 2");
    // ccxt frequently compares numeric strings coming off the wire
    check (isGreaterThan (ccxt::any (std::string ("10")), ccxt::any (9)), "\"10\" > 9");
    check (isLessThan (ccxt::any (std::string ("abc")), ccxt::any (std::string ("abd"))),
           "strings compare lexicographically");
}

static void testStrings () {
    checkStr (toUpperCase (ccxt::any (std::string ("btc"))), "BTC", "toUpperCase");
    checkStr (toLowerCase (ccxt::any (std::string ("BTC"))), "btc", "toLowerCase");
    checkStr (trim (ccxt::any (std::string ("  x  "))), "x", "trim");
    checkStr (slice (ccxt::any (std::string ("abcdef")), ccxt::any (1), ccxt::any (3)), "bc", "slice");
    checkStr (slice (ccxt::any (std::string ("abcdef")), ccxt::any (-2), ccxt::any {}), "ef",
              "negative slice counts from end");
    checkStr (padStart (ccxt::any (std::string ("7")), ccxt::any (3), ccxt::any (std::string ("0"))),
              "007", "padStart");
    checkStr (replaceAll (ccxt::any (std::string ("a-b-c")), ccxt::any (std::string ("-")),
                          ccxt::any (std::string ("/"))), "a/b/c", "replaceAll");
    checkStr (join (split (ccxt::any (std::string ("BTC/USDT")), ccxt::any (std::string ("/"))),
                    ccxt::any (std::string ("_"))), "BTC_USDT", "split then join");
    check (startsWith (ccxt::any (std::string ("abc")), ccxt::any (std::string ("ab"))), "startsWith");
    check (endsWith (ccxt::any (std::string ("abc")), ccxt::any (std::string ("bc"))), "endsWith");
    checkStr (getIndexOf (ccxt::any (std::string ("abc")), ccxt::any (std::string ("z"))), "-1",
              "indexOf missing is -1");
}

static void testCollections () {
    list arr { ccxt::any (1), ccxt::any (2), ccxt::any (3) };
    check (isEqual (getArrayLength (ccxt::any (arr)), ccxt::any (3)), "array length");
    checkStr (pop (ccxt::any (arr)), "3", "pop returns last");
    check (isEqual (getArrayLength (ccxt::any (arr)), ccxt::any (2)), "pop shrinks");
    checkStr (shift (ccxt::any (arr)), "1", "shift returns first");
    check (includes (ccxt::any (arr), ccxt::any (2)), "includes");

    // JS Array#reverse mutates in place and returns the same array
    list order { ccxt::any (1), ccxt::any (2), ccxt::any (3) };
    reverse (ccxt::any (order));
    checkStr (join (ccxt::any (order), ccxt::any (std::string (","))), "3,2,1", "reverse mutates");
}

static void testMath () {
    checkStr (mathFloor (ccxt::any (1.7)), "1", "floor");
    checkStr (mathCeil (ccxt::any (1.2)), "2", "ceil");
    checkStr (mathAbs (ccxt::any (-3)), "3", "abs");
    checkStr (mathMax (ccxt::any (1), ccxt::any (2)), "2", "max");
    checkStr (mathMin (ccxt::any (1), ccxt::any (2)), "1", "min");
    checkStr (mathPow (ccxt::any (2), ccxt::any (10)), "1024", "pow");
    // JS rounds half toward +Infinity, unlike std::round which rounds away from zero
    checkStr (mathRound (ccxt::any (2.5)), "3", "round half up");
    checkStr (mathRound (ccxt::any (-2.5)), "-2", "round half toward +Infinity");
    checkStr (toFixed (ccxt::any (1.23456), ccxt::any (2)), "1.23", "toFixed");
}

int main () {
    std::cout << "[C++] value model tests" << std::endl;
    testOrdering ();
    testReferenceSemantics ();
    testGetValue ();
    testTruthiness ();
    testEquality ();
    testArithmetic ();
    testComparisons ();
    testStrings ();
    testCollections ();
    testMath ();
    if (failures > 0) {
        std::cout << "[TEST_FAILURE] " << failures << " value model assertion(s) failed" << std::endl;
        return 1;
    }
    std::cout << "[C++] value model tests passed" << std::endl;
    return 0;
}
