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

static void checkStr (const std::any& actual, const std::string& expected, const std::string& what) {
    const std::string got = std::any_cast<std::string> (toString (actual));
    if (got != expected) {
        std::cout << "  FAIL: " << what << " - expected \"" << expected
                  << "\", got \"" << got << "\"" << std::endl;
        failures++;
    }
}

static void testOrdering () {
    // ccxt signs requests over key order, so insertion order is load-bearing
    dict d { { std::string ("zebra"), std::any (1) },
             { std::string ("alpha"), std::any (2) },
             { std::string ("melon"), std::any (3) } };
    checkStr (join (getObjectKeys (std::any (d)), std::any (std::string (","))),
              "zebra,alpha,melon", "insertion order preserved");

    // updating an existing key must not move it to the back
    d.set ("zebra", std::any (99));
    checkStr (join (getObjectKeys (std::any (d)), std::any (std::string (","))),
              "zebra,alpha,melon", "update keeps position");
    check (isEqual (d.get ("zebra"), std::any (99)), "update changes value");

    // deleting reindexes without disturbing the survivors' order
    deleteKey (std::any (d), std::any (std::string ("alpha")));
    checkStr (join (getObjectKeys (std::any (d)), std::any (std::string (","))),
              "zebra,melon", "delete preserves order");
    check (!inOp (std::any (d), std::any (std::string ("alpha"))), "deleted key is gone");
}

static void testReferenceSemantics () {
    // JS aliasing: two names for one object see each other's writes
    dict original { { std::string ("k"), std::any (1) } };
    std::any boxed = original;          // through std::any, as generated code does
    setValue (boxed, std::any (std::string ("k")), std::any (2));
    check (isEqual (original.get ("k"), std::any (2)), "setValue through any aliases");

    std::any alias = boxed;             // copying the any copies the handle, not the map
    setValue (alias, std::any (std::string ("added")), std::any (std::string ("v")));
    check (inOp (std::any (original), std::any (std::string ("added"))), "any copy still aliases");

    list arr { std::any (1), std::any (2) };
    std::any boxedArr = arr;
    arrayPush (boxedArr, std::any (3));
    check (isEqual (getArrayLength (std::any (arr)), std::any (3)), "arrayPush aliases");

    // nested containers alias too - this is what `market['limits']['amount']` relies on
    dict inner { { std::string ("deep"), std::any (1) } };
    dict outer { { std::string ("inner"), std::any (inner) } };
    setValue (getValue (std::any (outer), std::any (std::string ("inner"))),
              std::any (std::string ("deep")), std::any (42));
    check (isEqual (inner.get ("deep"), std::any (42)), "nested write aliases");
}

static void testGetValue () {
    dict d { { std::string ("a"), std::any (std::string ("A")) } };
    list arr { std::any (10), std::any (20) };

    check (isEqual (getValue (std::any (d), std::any (std::string ("a"))),
                    std::any (std::string ("A"))), "dict lookup");
    check (ccxt::isUndef (getValue (std::any (d), std::any (std::string ("missing")))),
           "missing key is undefined");
    check (isEqual (getValue (std::any (arr), std::any (1)), std::any (20)), "list index");
    check (ccxt::isUndef (getValue (std::any (arr), std::any (9))), "out of range is undefined");
    check (ccxt::isUndef (getValue (std::any {}, std::any (0))), "index into undefined is undefined");
    checkStr (getValue (std::any (std::string ("abc")), std::any (1)), "b", "string char access");
}

static void testTruthiness () {
    check (!isTrue (std::any {}),                          "undefined is falsy");
    check (!isTrue (std::any (0)),                         "0 is falsy");
    check (!isTrue (std::any (std::string (""))),          "empty string is falsy");
    check (!isTrue (std::any (false)),                     "false is falsy");
    check (isTrue (std::any (std::string ("0"))),          "\"0\" is truthy");
    check (isTrue (std::any (1)),                          "1 is truthy");
    // the one that trips people: empty objects and arrays are truthy in JS
    check (isTrue (std::any (dict {})),                    "empty dict is truthy");
    check (isTrue (std::any (list {})),                    "empty list is truthy");
}

static void testEquality () {
    check (isEqual (std::any (1), std::any (1.0)),         "int equals double");
    check (isEqual (std::any {}, std::any {}),             "undefined equals undefined");
    check (!isEqual (std::any {}, std::any (0)),           "undefined is not 0");
    check (!isEqual (std::any (std::string ("1")), std::any (1)), "=== does not coerce");

    // objects compare by identity, not contents
    dict a { { std::string ("k"), std::any (1) } };
    dict b { { std::string ("k"), std::any (1) } };
    check (!isEqual (std::any (a), std::any (b)), "distinct dicts are not equal");
    check (isEqual (std::any (a), std::any (a)),  "same dict is equal to itself");
}

static void testArithmetic () {
    checkStr (add (std::any (1), std::any (2)), "3", "numeric add");
    // `+` concatenates when either side is a string - the classic transpiler trap
    checkStr (add (std::any (std::string ("a")), std::any (1)), "a1", "string concat");
    checkStr (add (std::any (1), std::any (std::string ("1"))), "11", "number + string concat");
    // JS division always produces a float, unlike C++ integer division
    checkStr (divide (std::any (1), std::any (2)), "0.5", "division is float");
    checkStr (multiply (std::any (3), std::any (4)), "12", "multiply");
    checkStr (subtract (std::any (10), std::any (4)), "6", "subtract");
    checkStr (mod (std::any (7), std::any (3)), "1", "mod");

    std::any counter = std::any (5);
    postFixIncrement (counter);
    checkStr (counter, "6", "postFixIncrement mutates");

    // integers must not decay into "1.0" when stringified
    checkStr (std::any (1.0), "1", "integral double prints as int");
    checkStr (std::any (1.5), "1.5", "fraction prints in full");
}

static void testComparisons () {
    check (isGreaterThan (std::any (2), std::any (1)),          "2 > 1");
    check (isLessThan (std::any (1), std::any (2)),             "1 < 2");
    check (isGreaterThanOrEqual (std::any (2), std::any (2)),   "2 >= 2");
    check (isLessThanOrEqual (std::any (2), std::any (2)),      "2 <= 2");
    // ccxt frequently compares numeric strings coming off the wire
    check (isGreaterThan (std::any (std::string ("10")), std::any (9)), "\"10\" > 9");
    check (isLessThan (std::any (std::string ("abc")), std::any (std::string ("abd"))),
           "strings compare lexicographically");
}

static void testStrings () {
    checkStr (toUpperCase (std::any (std::string ("btc"))), "BTC", "toUpperCase");
    checkStr (toLowerCase (std::any (std::string ("BTC"))), "btc", "toLowerCase");
    checkStr (trim (std::any (std::string ("  x  "))), "x", "trim");
    checkStr (slice (std::any (std::string ("abcdef")), std::any (1), std::any (3)), "bc", "slice");
    checkStr (slice (std::any (std::string ("abcdef")), std::any (-2), std::any {}), "ef",
              "negative slice counts from end");
    checkStr (padStart (std::any (std::string ("7")), std::any (3), std::any (std::string ("0"))),
              "007", "padStart");
    checkStr (replaceAll (std::any (std::string ("a-b-c")), std::any (std::string ("-")),
                          std::any (std::string ("/"))), "a/b/c", "replaceAll");
    checkStr (join (split (std::any (std::string ("BTC/USDT")), std::any (std::string ("/"))),
                    std::any (std::string ("_"))), "BTC_USDT", "split then join");
    check (startsWith (std::any (std::string ("abc")), std::any (std::string ("ab"))), "startsWith");
    check (endsWith (std::any (std::string ("abc")), std::any (std::string ("bc"))), "endsWith");
    checkStr (getIndexOf (std::any (std::string ("abc")), std::any (std::string ("z"))), "-1",
              "indexOf missing is -1");
}

static void testCollections () {
    list arr { std::any (1), std::any (2), std::any (3) };
    check (isEqual (getArrayLength (std::any (arr)), std::any (3)), "array length");
    checkStr (pop (std::any (arr)), "3", "pop returns last");
    check (isEqual (getArrayLength (std::any (arr)), std::any (2)), "pop shrinks");
    checkStr (shift (std::any (arr)), "1", "shift returns first");
    check (includes (std::any (arr), std::any (2)), "includes");

    // JS Array#reverse mutates in place and returns the same array
    list order { std::any (1), std::any (2), std::any (3) };
    reverse (std::any (order));
    checkStr (join (std::any (order), std::any (std::string (","))), "3,2,1", "reverse mutates");
}

static void testMath () {
    checkStr (mathFloor (std::any (1.7)), "1", "floor");
    checkStr (mathCeil (std::any (1.2)), "2", "ceil");
    checkStr (mathAbs (std::any (-3)), "3", "abs");
    checkStr (mathMax (std::any (1), std::any (2)), "2", "max");
    checkStr (mathMin (std::any (1), std::any (2)), "1", "min");
    checkStr (mathPow (std::any (2), std::any (10)), "1024", "pow");
    // JS rounds half toward +Infinity, unlike std::round which rounds away from zero
    checkStr (mathRound (std::any (2.5)), "3", "round half up");
    checkStr (mathRound (std::any (-2.5)), "-2", "round half toward +Infinity");
    checkStr (toFixed (std::any (1.23456), std::any (2)), "1.23", "toFixed");
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
