#include "helpers.h"

#include <algorithm>
#include <chrono>
#include <climits>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cctype>
#include <iostream>
#include <stdexcept>

using ccxt::dict;
using ccxt::list;

namespace {

// JS prints 1.0 as "1" and uses the shortest representation that round-trips.
std::string numberToJsString (double d) {
    if (std::isnan (d)) {
        return "NaN";
    }
    if (std::isinf (d)) {
        return (d > 0) ? "Infinity" : "-Infinity";
    }
    if (d == static_cast<long long> (d) && std::fabs (d) < 1e15) {
        return std::to_string (static_cast<long long> (d));
    }
    for (int precision = 1; precision <= 17; precision++) {
        char buffer[64];
        std::snprintf (buffer, sizeof (buffer), "%.*g", precision, d);
        if (std::strtod (buffer, nullptr) == d) {
            return std::string (buffer);
        }
    }
    return std::to_string (d);
}

std::string anyToString (const std::any& v) {
    if (!v.has_value ())            return "undefined";
    if (ccxt::isStr (v))            return std::any_cast<std::string> (v);
    if (ccxt::isBoolean (v))        return std::any_cast<bool> (v) ? "true" : "false";
    if (ccxt::isNum (v))            return numberToJsString (ccxt::toDouble (v));
    if (ccxt::isList (v))           return "[object Array]";
    if (ccxt::isDict (v))           return "[object Object]";
    return "[object]";
}

// JS numeric coercion for comparisons: a numeric string compares as a number.
bool numericValue (const std::any& v, double& out) {
    if (ccxt::isNum (v)) {
        out = ccxt::toDouble (v);
        return true;
    }
    if (ccxt::isBoolean (v)) {
        out = std::any_cast<bool> (v) ? 1.0 : 0.0;
        return true;
    }
    if (ccxt::isStr (v)) {
        const std::string s = std::any_cast<std::string> (v);
        if (s.empty ()) {
            out = 0.0;
            return true;
        }
        try {
            std::size_t consumed = 0;
            const double parsed = std::stod (s, &consumed);
            while (consumed < s.size () && std::isspace (static_cast<unsigned char> (s[consumed]))) {
                consumed++;
            }
            if (consumed != s.size ()) {
                return false;
            }
            out = parsed;
            return true;
        } catch (const std::exception&) {
            return false;
        }
    }
    return false;
}

// Returns an int when the value is integral, so round-tripping a JS integer through
// arithmetic does not silently turn every count into a double.
std::any numberResult (double d) {
    if (std::isfinite (d) && d == std::floor (d) && std::fabs (d) < 9.2e18) {
        const long long asLong = static_cast<long long> (d);
        if (asLong >= INT_MIN && asLong <= INT_MAX) {
            return std::any (static_cast<int> (asLong));
        }
        return std::any (asLong);
    }
    return std::any (d);
}

} // namespace

// ---------------------------------------------------------------------------
// element access
// ---------------------------------------------------------------------------

std::any getValue (const std::any& target, const std::any& key) {
    if (!target.has_value ()) {
        return std::any {};
    }
    if (ccxt::isDict (target)) {
        return std::any_cast<dict> (target).get (anyToString (key));
    }
    if (ccxt::isList (target)) {
        double index = 0;
        if (!numericValue (key, index)) {
            return std::any {};
        }
        return std::any_cast<list> (target).get (static_cast<long> (index));
    }
    if (ccxt::isStr (target)) {
        double index = 0;
        if (!numericValue (key, index)) {
            return std::any {};
        }
        const std::string s = std::any_cast<std::string> (target);
        const long i = static_cast<long> (index);
        if (i < 0 || static_cast<std::size_t> (i) >= s.size ()) {
            return std::any {};
        }
        return std::any (std::string (1, s[static_cast<std::size_t> (i)]));
    }
    return std::any {};
}

void setValue (const std::any& target, const std::any& key, const std::any& value) {
    if (ccxt::isDict (target)) {
        std::any_cast<dict> (target).set (anyToString (key), value);
        return;
    }
    if (ccxt::isList (target)) {
        double index = 0;
        if (numericValue (key, index)) {
            std::any_cast<list> (target).set (static_cast<long> (index), value);
        }
    }
}

void deleteKey (const std::any& target, const std::any& key) {
    if (ccxt::isDict (target)) {
        std::any_cast<dict> (target).erase (anyToString (key));
    }
}

// ---------------------------------------------------------------------------
// truthiness, equality, ordering
// ---------------------------------------------------------------------------

bool isTrue (const std::any& v) {
    if (!v.has_value ())     return false;
    if (ccxt::isBoolean (v)) return std::any_cast<bool> (v);
    if (ccxt::isNum (v)) {
        const double d = ccxt::toDouble (v);
        return (d != 0.0) && !std::isnan (d);
    }
    if (ccxt::isStr (v))     return !std::any_cast<std::string> (v).empty ();
    // objects and arrays are always truthy in JS, even when empty
    return true;
}

bool isEqual (const std::any& a, const std::any& b) {
    if (!a.has_value () || !b.has_value ()) {
        return !a.has_value () && !b.has_value ();
    }
    if (ccxt::isStr (a) && ccxt::isStr (b)) {
        return std::any_cast<std::string> (a) == std::any_cast<std::string> (b);
    }
    if (ccxt::isBoolean (a) && ccxt::isBoolean (b)) {
        return std::any_cast<bool> (a) == std::any_cast<bool> (b);
    }
    if (ccxt::isNum (a) && ccxt::isNum (b)) {
        return ccxt::toDouble (a) == ccxt::toDouble (b);
    }
    // reference identity for objects and arrays, matching JS ===
    if (ccxt::isDict (a) && ccxt::isDict (b)) {
        return std::any_cast<dict> (a).sameAs (std::any_cast<dict> (b));
    }
    if (ccxt::isList (a) && ccxt::isList (b)) {
        return std::any_cast<list> (a).sameAs (std::any_cast<list> (b));
    }
    return false;
}

namespace {

// shared by the four ordering helpers; returns false when either side is not
// numerically comparable, which is how JS treats NaN-producing comparisons
bool compareNumeric (const std::any& a, const std::any& b, int& sign) {
    if (ccxt::isStr (a) && ccxt::isStr (b)) {
        const std::string ls = std::any_cast<std::string> (a);
        const std::string rs = std::any_cast<std::string> (b);
        sign = (ls < rs) ? -1 : ((ls > rs) ? 1 : 0);
        return true;
    }
    double left = 0;
    double right = 0;
    if (!numericValue (a, left) || !numericValue (b, right)) {
        return false;
    }
    if (std::isnan (left) || std::isnan (right)) {
        return false;
    }
    sign = (left < right) ? -1 : ((left > right) ? 1 : 0);
    return true;
}

} // namespace

bool isGreaterThan (const std::any& a, const std::any& b) {
    int sign = 0;
    return compareNumeric (a, b, sign) && sign > 0;
}

bool isGreaterThanOrEqual (const std::any& a, const std::any& b) {
    int sign = 0;
    return compareNumeric (a, b, sign) && sign >= 0;
}

bool isLessThan (const std::any& a, const std::any& b) {
    int sign = 0;
    return compareNumeric (a, b, sign) && sign < 0;
}

bool isLessThanOrEqual (const std::any& a, const std::any& b) {
    int sign = 0;
    return compareNumeric (a, b, sign) && sign <= 0;
}

bool inOp (const std::any& container, const std::any& key) {
    if (ccxt::isDict (container)) {
        return std::any_cast<dict> (container).has (anyToString (key));
    }
    if (ccxt::isList (container)) {
        double index = 0;
        if (!numericValue (key, index)) {
            return false;
        }
        const long i = static_cast<long> (index);
        return i >= 0 && static_cast<std::size_t> (i) < std::any_cast<list> (container).size ();
    }
    return false;
}

// ---------------------------------------------------------------------------
// arithmetic
// ---------------------------------------------------------------------------

std::any add (const std::any& a, const std::any& b) {
    // JS `+` concatenates when either operand is a string
    if (ccxt::isStr (a) || ccxt::isStr (b)) {
        return std::any (anyToString (a) + anyToString (b));
    }
    double left = 0;
    double right = 0;
    if (numericValue (a, left) && numericValue (b, right)) {
        return numberResult (left + right);
    }
    return std::any (anyToString (a) + anyToString (b));
}

std::any subtract (const std::any& a, const std::any& b) {
    double left = 0;
    double right = 0;
    if (!numericValue (a, left) || !numericValue (b, right)) {
        return std::any (std::nan (""));
    }
    return numberResult (left - right);
}

std::any multiply (const std::any& a, const std::any& b) {
    double left = 0;
    double right = 0;
    if (!numericValue (a, left) || !numericValue (b, right)) {
        return std::any (std::nan (""));
    }
    return numberResult (left * right);
}

std::any divide (const std::any& a, const std::any& b) {
    double left = 0;
    double right = 0;
    if (!numericValue (a, left) || !numericValue (b, right)) {
        return std::any (std::nan (""));
    }
    // JS `/` is always floating point, including 1/2 === 0.5
    return numberResult (left / right);
}

std::any mod (const std::any& a, const std::any& b) {
    double left = 0;
    double right = 0;
    if (!numericValue (a, left) || !numericValue (b, right)) {
        return std::any (std::nan (""));
    }
    return numberResult (std::fmod (left, right));
}

std::any postFixIncrement (std::any& v) {
    const std::any previous = v;
    v = add (v, std::any (1));
    return previous;
}

std::any postFixDecrement (std::any& v) {
    const std::any previous = v;
    v = subtract (v, std::any (1));
    return previous;
}

std::any prefixUnaryPlus (const std::any& v) {
    double d = 0;
    return numericValue (v, d) ? numberResult (d) : std::any (std::nan (""));
}

std::any prefixUnaryNeg (const std::any& v) {
    double d = 0;
    return numericValue (v, d) ? numberResult (-d) : std::any (std::nan (""));
}

// ---------------------------------------------------------------------------
// type predicates
// ---------------------------------------------------------------------------

bool isString (const std::any& v)     { return ccxt::isStr (v); }
bool isNumber (const std::any& v)     { return ccxt::isNum (v); }
bool isBool (const std::any& v)       { return ccxt::isBoolean (v); }
bool isDictionary (const std::any& v) { return ccxt::isDict (v); }
bool isFunction (const std::any&)     { return false; }   // no first-class functions in the value model
bool isArray (const std::any& v)      { return ccxt::isList (v); }

bool isInteger (const std::any& v) {
    if (!ccxt::isNum (v)) {
        return false;
    }
    const double d = ccxt::toDouble (v);
    return std::isfinite (d) && d == std::floor (d);
}

// ---------------------------------------------------------------------------
// collections
// ---------------------------------------------------------------------------

std::any getArrayLength (const std::any& v) {
    if (ccxt::isList (v)) return std::any (static_cast<int> (std::any_cast<list> (v).size ()));
    if (ccxt::isDict (v)) return std::any (static_cast<int> (std::any_cast<dict> (v).size ()));
    if (ccxt::isStr (v))  return std::any (static_cast<int> (std::any_cast<std::string> (v).size ()));
    return std::any (0);
}

std::any getStringLength (const std::any& v) {
    return std::any (static_cast<int> (anyToString (v).size ()));
}

std::any getObjectKeys (const std::any& v) {
    list out;
    if (ccxt::isDict (v)) {
        for (const auto& kv : std::any_cast<dict> (v).entries ()) {
            out.push (std::any (kv.first));
        }
    } else if (ccxt::isList (v)) {
        const std::size_t n = std::any_cast<list> (v).size ();
        for (std::size_t i = 0; i < n; i++) {
            out.push (std::any (std::to_string (i)));
        }
    }
    return std::any (out);
}

std::any getObjectValues (const std::any& v) {
    list out;
    if (ccxt::isDict (v)) {
        for (const auto& kv : std::any_cast<dict> (v).entries ()) {
            out.push (kv.second);
        }
    } else if (ccxt::isList (v)) {
        for (const auto& item : std::any_cast<list> (v).items ()) {
            out.push (item);
        }
    }
    return std::any (out);
}

void arrayPush (const std::any& arr, const std::any& v) {
    if (ccxt::isList (arr)) {
        std::any_cast<list> (arr).push (v);
    }
}

std::any pop (const std::any& arr) {
    if (!ccxt::isList (arr)) {
        return std::any {};
    }
    list handle = std::any_cast<list> (arr);
    auto& items = handle.items ();
    if (items.empty ()) {
        return std::any {};
    }
    const std::any back = items.back ();
    items.pop_back ();
    return back;
}

std::any shift (const std::any& arr) {
    if (!ccxt::isList (arr)) {
        return std::any {};
    }
    list handle = std::any_cast<list> (arr);
    auto& items = handle.items ();
    if (items.empty ()) {
        return std::any {};
    }
    const std::any front = items.front ();
    items.erase (items.begin ());
    return front;
}

std::any reverse (const std::any& arr) {
    if (ccxt::isList (arr)) {
        list handle = std::any_cast<list> (arr);
        auto& items = handle.items ();
        std::reverse (items.begin (), items.end ());
    }
    return arr;   // JS Array#reverse mutates and returns the same array
}

std::any concat (const std::any& a, const std::any& b) {
    if (ccxt::isStr (a) || ccxt::isStr (b)) {
        return std::any (anyToString (a) + anyToString (b));
    }
    list out;
    if (ccxt::isList (a)) {
        for (const auto& item : std::any_cast<list> (a).items ()) out.push (item);
    }
    if (ccxt::isList (b)) {
        for (const auto& item : std::any_cast<list> (b).items ()) out.push (item);
    } else if (b.has_value ()) {
        out.push (b);
    }
    return std::any (out);
}

namespace {

// shared start/end normalisation for slice: negative counts from the end, and an
// absent end means "to the end", exactly as Array#slice / String#slice do
void normaliseSliceBounds (long length, const std::any& start, const std::any& end,
                           long& from, long& to) {
    double raw = 0;
    from = numericValue (start, raw) ? static_cast<long> (raw) : 0;
    if (from < 0)      from = std::max (0L, length + from);
    if (from > length) from = length;

    to = length;
    if (end.has_value () && numericValue (end, raw)) {
        to = static_cast<long> (raw);
        if (to < 0)      to = std::max (0L, length + to);
        if (to > length) to = length;
    }
    if (to < from) to = from;
}

} // namespace

std::any slice (const std::any& target, const std::any& start, const std::any& end) {
    if (ccxt::isStr (target)) {
        const std::string s = std::any_cast<std::string> (target);
        long from = 0;
        long to = 0;
        normaliseSliceBounds (static_cast<long> (s.size ()), start, end, from, to);
        return std::any (s.substr (static_cast<std::size_t> (from),
                                   static_cast<std::size_t> (to - from)));
    }
    if (ccxt::isList (target)) {
        const auto& items = std::any_cast<list> (target).items ();
        long from = 0;
        long to = 0;
        normaliseSliceBounds (static_cast<long> (items.size ()), start, end, from, to);
        list out;
        for (long i = from; i < to; i++) {
            out.push (items[static_cast<std::size_t> (i)]);
        }
        return std::any (out);
    }
    return std::any {};
}

bool includes (const std::any& haystack, const std::any& needle) {
    if (ccxt::isStr (haystack)) {
        return std::any_cast<std::string> (haystack).find (anyToString (needle)) != std::string::npos;
    }
    if (ccxt::isList (haystack)) {
        for (const auto& item : std::any_cast<list> (haystack).items ()) {
            if (isEqual (item, needle)) {
                return true;
            }
        }
    }
    return false;
}

std::any getIndexOf (const std::any& haystack, const std::any& needle) {
    if (ccxt::isStr (haystack)) {
        const std::size_t at = std::any_cast<std::string> (haystack).find (anyToString (needle));
        return std::any (at == std::string::npos ? -1 : static_cast<int> (at));
    }
    if (ccxt::isList (haystack)) {
        const auto& items = std::any_cast<list> (haystack).items ();
        for (std::size_t i = 0; i < items.size (); i++) {
            if (isEqual (items[i], needle)) {
                return std::any (static_cast<int> (i));
            }
        }
    }
    return std::any (-1);
}

// ---------------------------------------------------------------------------
// strings
// ---------------------------------------------------------------------------

std::any toString (const std::any& v) { return std::any (anyToString (v)); }

std::string str (const std::any& v) { return anyToString (v); }

bool startsWith (const std::any& s, const std::any& prefix) {
    const std::string str = anyToString (s);
    const std::string pre = anyToString (prefix);
    return str.size () >= pre.size () && str.compare (0, pre.size (), pre) == 0;
}

bool endsWith (const std::any& s, const std::any& suffix) {
    const std::string str = anyToString (s);
    const std::string suf = anyToString (suffix);
    return str.size () >= suf.size ()
        && str.compare (str.size () - suf.size (), suf.size (), suf) == 0;
}

std::any trim (const std::any& s) {
    const std::string str = anyToString (s);
    const auto first = str.find_first_not_of (" \t\n\r\f\v");
    if (first == std::string::npos) {
        return std::any (std::string (""));
    }
    const auto last = str.find_last_not_of (" \t\n\r\f\v");
    return std::any (str.substr (first, last - first + 1));
}

std::any split (const std::any& s, const std::any& sep) {
    const std::string str = anyToString (s);
    const std::string delimiter = anyToString (sep);
    list out;
    if (delimiter.empty ()) {
        for (char c : str) {
            out.push (std::any (std::string (1, c)));
        }
        return std::any (out);
    }
    std::size_t start = 0;
    std::size_t at = str.find (delimiter);
    while (at != std::string::npos) {
        out.push (std::any (str.substr (start, at - start)));
        start = at + delimiter.size ();
        at = str.find (delimiter, start);
    }
    out.push (std::any (str.substr (start)));
    return std::any (out);
}

std::any join (const std::any& arr, const std::any& sep) {
    if (!ccxt::isList (arr)) {
        return std::any (std::string (""));
    }
    const std::string delimiter = anyToString (sep);
    const auto& items = std::any_cast<list> (arr).items ();
    std::string out;
    for (std::size_t i = 0; i < items.size (); i++) {
        if (i > 0) {
            out += delimiter;
        }
        // JS Array#join renders undefined and null as empty strings
        out += items[i].has_value () ? anyToString (items[i]) : std::string ("");
    }
    return std::any (out);
}

std::any toUpperCase (const std::any& s) {
    std::string str = anyToString (s);
    std::transform (str.begin (), str.end (), str.begin (),
                    [] (unsigned char c) { return static_cast<char> (std::toupper (c)); });
    return std::any (str);
}

std::any toLowerCase (const std::any& s) {
    std::string str = anyToString (s);
    std::transform (str.begin (), str.end (), str.begin (),
                    [] (unsigned char c) { return static_cast<char> (std::tolower (c)); });
    return std::any (str);
}

std::any replace (const std::any& s, const std::any& from, const std::any& to) {
    std::string str = anyToString (s);
    const std::string needle = anyToString (from);
    if (needle.empty ()) {
        return std::any (str);
    }
    const std::size_t at = str.find (needle);
    if (at != std::string::npos) {
        str.replace (at, needle.size (), anyToString (to));
    }
    return std::any (str);
}

std::any replaceAll (const std::any& s, const std::any& from, const std::any& to) {
    std::string str = anyToString (s);
    const std::string needle = anyToString (from);
    if (needle.empty ()) {
        return std::any (str);
    }
    const std::string replacement = anyToString (to);
    std::size_t at = str.find (needle);
    while (at != std::string::npos) {
        str.replace (at, needle.size (), replacement);
        at = str.find (needle, at + replacement.size ());
    }
    return std::any (str);
}

std::any padStart (const std::any& s, const std::any& width, const std::any& pad) {
    const std::string str = anyToString (s);
    double target = 0;
    numericValue (width, target);
    const std::string filler = pad.has_value () ? anyToString (pad) : std::string (" ");
    if (filler.empty () || str.size () >= static_cast<std::size_t> (target)) {
        return std::any (str);
    }
    std::string prefix;
    while (prefix.size () + str.size () < static_cast<std::size_t> (target)) {
        prefix += filler;
    }
    prefix.resize (static_cast<std::size_t> (target) - str.size ());
    return std::any (prefix + str);
}

std::any padEnd (const std::any& s, const std::any& width, const std::any& pad) {
    std::string str = anyToString (s);
    double target = 0;
    numericValue (width, target);
    const std::string filler = pad.has_value () ? anyToString (pad) : std::string (" ");
    if (filler.empty () || str.size () >= static_cast<std::size_t> (target)) {
        return std::any (str);
    }
    while (str.size () < static_cast<std::size_t> (target)) {
        str += filler;
    }
    str.resize (static_cast<std::size_t> (target));
    return std::any (str);
}

std::any toFixed (const std::any& v, const std::any& digits) {
    double d = 0;
    if (!numericValue (v, d)) {
        return std::any (std::string ("NaN"));
    }
    double places = 0;
    numericValue (digits, places);
    char buffer[512];
    std::snprintf (buffer, sizeof (buffer), "%.*f", static_cast<int> (places), d);
    return std::any (std::string (buffer));
}

// ---------------------------------------------------------------------------
// math
// ---------------------------------------------------------------------------

std::any mathMin (const std::any& a, const std::any& b) {
    double left = 0;
    double right = 0;
    numericValue (a, left);
    numericValue (b, right);
    return numberResult (std::min (left, right));
}

std::any mathMax (const std::any& a, const std::any& b) {
    double left = 0;
    double right = 0;
    numericValue (a, left);
    numericValue (b, right);
    return numberResult (std::max (left, right));
}

std::any mathAbs (const std::any& v) {
    double d = 0;
    numericValue (v, d);
    return numberResult (std::fabs (d));
}

std::any mathFloor (const std::any& v) {
    double d = 0;
    numericValue (v, d);
    return numberResult (std::floor (d));
}

std::any mathCeil (const std::any& v) {
    double d = 0;
    numericValue (v, d);
    return numberResult (std::ceil (d));
}

std::any mathRound (const std::any& v) {
    double d = 0;
    numericValue (v, d);
    // JS rounds .5 toward +Infinity, unlike std::round which rounds away from zero
    return numberResult (std::floor (d + 0.5));
}

std::any mathPow (const std::any& a, const std::any& b) {
    double base = 0;
    double exponent = 0;
    numericValue (a, base);
    numericValue (b, exponent);
    return numberResult (std::pow (base, exponent));
}

std::any mathLog (const std::any& v) {
    double d = 0;
    numericValue (v, d);
    return std::any (std::log (d));
}

// ---------------------------------------------------------------------------
// misc
// ---------------------------------------------------------------------------

void consoleLog (const std::any& v) {
    std::cout << anyToString (v) << std::endl;
}

std::any getCurrentTimestamp () {
    const auto now = std::chrono::system_clock::now ().time_since_epoch ();
    const auto ms = std::chrono::duration_cast<std::chrono::milliseconds> (now).count ();
    return std::any (static_cast<long long> (ms));
}

// The transpiled base tests are long runs of bare `assert(...)` with no message, so a
// failure otherwise reports only "Assertion failed" with no way to tell which of the
// eighty assertions in the file it was. Counting them gives the ordinal, which maps
// straight back to the nth assert in the corresponding ts/src/test/base file.
long long assertionOrdinal = 0;

void resetAssertionOrdinal () { assertionOrdinal = 0; }

void assertTrue (const std::any& condition, const std::any& message) {
    assertionOrdinal++;
    if (!isTrue (condition)) {
        const std::string detail = message.has_value () ? anyToString (message) : std::string ("");
        throw std::runtime_error ("assertion #" + std::to_string (assertionOrdinal)
                                  + " failed" + (detail.empty () ? "" : ": " + detail));
    }
}

// ---------------------------------------------------------------------------
// JSON and numeric parsing (declared late; see helpers.h)
// ---------------------------------------------------------------------------

std::any jsonStringify (const std::any& v) {
    // Dictionaries serialise in insertion order: ccxt signs request bodies verbatim.
    if (ccxt::isDict (v)) {
        std::string out = "{";
        bool first = true;
        for (const auto& kv : std::any_cast<dict> (v).entries ()) {
            if (!first) out += ",";
            first = false;
            out += "\"" + kv.first + "\":" + std::any_cast<std::string> (jsonStringify (kv.second));
        }
        return std::any (out + "}");
    }
    if (ccxt::isList (v)) {
        std::string out = "[";
        bool first = true;
        for (const auto& item : std::any_cast<list> (v).items ()) {
            if (!first) out += ",";
            first = false;
            out += std::any_cast<std::string> (jsonStringify (item));
        }
        return std::any (out + "]");
    }
    if (!v.has_value ())      return std::any (std::string ("null"));
    if (ccxt::isBoolean (v))  return std::any (std::string (std::any_cast<bool> (v) ? "true" : "false"));
    if (ccxt::isNum (v))      return toString (v);
    std::string escaped = "\"";
    for (char c : anyToString (v)) {
        switch (c) {
        case '"':  escaped += "\\\""; break;
        case '\\': escaped += "\\\\"; break;
        case '\n': escaped += "\\n";  break;
        case '\r': escaped += "\\r";  break;
        case '\t': escaped += "\\t";  break;
        default:   escaped += c;      break;
        }
    }
    return std::any (escaped + "\"");
}

std::any parseFloat (const std::any& v) {
    // JS parseFloat reads a leading number and ignores trailing junk
    try {
        std::size_t consumed = 0;
        const double parsed = std::stod (anyToString (v), &consumed);
        return (consumed == 0) ? std::any (std::nan ("")) : std::any (parsed);
    } catch (const std::exception&) {
        return std::any (std::nan (""));
    }
}

std::any parseInt (const std::any& v) {
    try {
        std::size_t consumed = 0;
        const double parsed = std::stod (anyToString (v), &consumed);
        return (consumed == 0) ? std::any (std::nan (""))
                               : std::any (static_cast<long long> (std::trunc (parsed)));
    } catch (const std::exception&) {
        return std::any (std::nan (""));
    }
}

std::any parseToInt (const std::any& v) { return parseInt (v); }

std::any describeOf (const std::any&) { return std::any (ccxt::dict {}); }

std::any resetOrderBook (const std::any& book, const std::any&) { return book; }
