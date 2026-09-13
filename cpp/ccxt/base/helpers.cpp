#include "helpers.h"
#include "Precise.h"
#include "ws/Cache.h"
#include "ws/Client.h"
#include "ws/OrderBook.h"

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

std::string anyToString (const ccxt::any& v) {
    if (!v.has_value ())            return "undefined";
    if (ccxt::isStr (v))            return ccxt::any_cast<std::string> (v);
    if (ccxt::isBoolean (v))        return ccxt::any_cast<bool> (v) ? "true" : "false";
    // integer types print exactly (C# long semantics): the double round-trip
    // corrupts 19-digit ids (782042010738492300 -> ...288)
    if (v.type () == typeid (long long))          return std::to_string (ccxt::any_cast<long long> (v));
    if (v.type () == typeid (long))               return std::to_string (ccxt::any_cast<long> (v));
    if (v.type () == typeid (int))                return std::to_string (ccxt::any_cast<int> (v));
    if (v.type () == typeid (unsigned long long)) return std::to_string (ccxt::any_cast<unsigned long long> (v));
    if (v.type () == typeid (std::size_t) && typeid (std::size_t) != typeid (unsigned long long))
        return std::to_string (ccxt::any_cast<std::size_t> (v));
    if (ccxt::isNum (v))            return numberToJsString (ccxt::toDouble (v));
    if (v.type () == typeid (ccxt::Precise)) {
        return anyToString (ccxt::any_cast<const ccxt::Precise&> (v).toString ());
    }
    if (ccxt::isList (v))           return "[object Array]";
    if (ccxt::isDict (v))           return "[object Object]";
    return "[object]";
}

// JS numeric coercion for comparisons: a numeric string compares as a number.
bool numericValue (const ccxt::any& v, double& out) {
    if (ccxt::isNum (v)) {
        out = ccxt::toDouble (v);
        return true;
    }
    if (ccxt::isBoolean (v)) {
        out = ccxt::any_cast<bool> (v) ? 1.0 : 0.0;
        return true;
    }
    if (ccxt::isStr (v)) {
        const std::string s = ccxt::any_cast<std::string> (v);
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
ccxt::any numberResult (double d) {
    if (std::isfinite (d) && d == std::floor (d) && std::fabs (d) < 9.2e18) {
        const long long asLong = static_cast<long long> (d);
        if (asLong >= INT_MIN && asLong <= INT_MAX) {
            return ccxt::any (static_cast<int> (asLong));
        }
        return ccxt::any (asLong);
    }
    return ccxt::any (d);
}

} // namespace

// ---------------------------------------------------------------------------
// element access
// ---------------------------------------------------------------------------

ccxt::any getValue (const ccxt::any& target, const ccxt::any& key) {
    if (!target.has_value ()) {
        return ccxt::any {};
    }
    // ws client: url, subscriptions, futures, rejections, mockSentMessages
    if (target.type () == typeid (ccxt::ws::Client)) {
        ccxt::ws::Client client = ccxt::any_cast<ccxt::ws::Client> (target);
        const std::string name = anyToString (key);
        if (name == "url")          return ccxt::any (client.url ());
        if (name == "subscriptions") return ccxt::any (client.subscriptionsView ());
        if (name == "futures")      return ccxt::any (client.futuresView ());
        if (name == "rejections")   return ccxt::any (client.rejectionsView ());
        if (name == "mockSentMessages") return ccxt::any (client.sentMessagesView ());
        return ccxt::any {};
    }
    // ws layer values: books expose bids/asks/timestamp/... ; caches and sides
    // behave like arrays (numeric keys)
    if (target.type () == typeid (ccxt::ws::WsOrderBook)) {
        const auto& book = ccxt::any_cast<const ccxt::ws::WsOrderBook&> (target);
        const std::string name = anyToString (key);
        if (name == "bids")      return ccxt::any (book.impl->bids);
        if (name == "asks")      return ccxt::any (book.impl->asks);
        if (name == "timestamp") return book.timestamp ();
        if (name == "datetime")  return book.datetime ();
        if (name == "nonce")     return book.nonce ();
        if (name == "symbol")    return book.symbol ();
        if (name == "cache")     return book.cache ();
        return ccxt::any {};
    }
    if (target.type () == typeid (ccxt::ws::OrderBookSide)) {
        double index = 0;
        if (!numericValue (key, index)) {
            return ccxt::any {};
        }
        return ccxt::any_cast<const ccxt::ws::OrderBookSide&> (target).get (static_cast<long> (index));
    }
    if (target.type () == typeid (ccxt::ws::ArrayCache)
        || target.type () == typeid (ccxt::ws::ArrayCacheByTimestamp)
        || target.type () == typeid (ccxt::ws::ArrayCacheBySymbolById)
        || target.type () == typeid (ccxt::ws::ArrayCacheByOutcomeById)
        || target.type () == typeid (ccxt::ws::ArrayCacheBySymbolBySide)) {
        // any_cast needs the exact stored type; every cache shares the Impl layout,
        // so cast to whichever subclass is stored and use the base interface
        const ccxt::ws::ArrayCache* cache = nullptr;
        if (target.type () == typeid (ccxt::ws::ArrayCache)) {
            cache = &ccxt::any_cast<const ccxt::ws::ArrayCache&> (target);
        } else if (target.type () == typeid (ccxt::ws::ArrayCacheByTimestamp)) {
            cache = &ccxt::any_cast<const ccxt::ws::ArrayCacheByTimestamp&> (target);
        } else if (target.type () == typeid (ccxt::ws::ArrayCacheBySymbolById)) {
            cache = &ccxt::any_cast<const ccxt::ws::ArrayCacheBySymbolById&> (target);
        } else if (target.type () == typeid (ccxt::ws::ArrayCacheByOutcomeById)) {
            cache = &ccxt::any_cast<const ccxt::ws::ArrayCacheByOutcomeById&> (target);
        } else {
            cache = &ccxt::any_cast<const ccxt::ws::ArrayCacheBySymbolBySide&> (target);
        }
        const std::string name = anyToString (key);
        if (name == "hashmap") {
            return ccxt::any (cache->hashmap ());
        }
        double index = 0;
        if (!numericValue (key, index)) {
            return ccxt::any {};
        }
        return cache->get (static_cast<long> (index));
    }
    if (ccxt::isDict (target)) {
        return ccxt::any_cast<dict> (target).get (anyToString (key));
    }
    if (ccxt::isList (target)) {
        double index = 0;
        if (!numericValue (key, index)) {
            return ccxt::any {};
        }
        return ccxt::any_cast<list> (target).get (static_cast<long> (index));
    }
    if (ccxt::isStr (target)) {
        double index = 0;
        if (!numericValue (key, index)) {
            return ccxt::any {};
        }
        const std::string s = ccxt::any_cast<std::string> (target);
        const long i = static_cast<long> (index);
        if (i < 0 || static_cast<std::size_t> (i) >= s.size ()) {
            return ccxt::any {};
        }
        return ccxt::any (std::string (1, s[static_cast<std::size_t> (i)]));
    }
    return ccxt::any {};
}

void setValue (const ccxt::any& target, const ccxt::any& key, const ccxt::any& value) {
    if (ccxt::isDict (target)) {
        ccxt::any_cast<dict> (target).set (anyToString (key), value);
        return;
    }
    if (target.type () == typeid (ccxt::ws::WsOrderBook)) {
        ccxt::ws::WsOrderBook book = ccxt::any_cast<ccxt::ws::WsOrderBook> (target);
        const std::string name = anyToString (key);
        if (name == "timestamp") { book.setTimestamp (value); return; }
        if (name == "nonce")     { book.setNonce (value); return; }
        if (name == "symbol")    { book.setSymbol (value); return; }
        return;
    }
    if (ccxt::isList (target)) {
        double index = 0;
        if (numericValue (key, index)) {
            ccxt::any_cast<list> (target).set (static_cast<long> (index), value);
        }
    }
}

void deleteKey (const ccxt::any& target, const ccxt::any& key) {
    if (ccxt::isDict (target)) {
        ccxt::any_cast<dict> (target).erase (anyToString (key));
    }
}

// ---------------------------------------------------------------------------
// truthiness, equality, ordering
// ---------------------------------------------------------------------------

bool isTrue (const ccxt::any& v) {
    if (!v.has_value ())     return false;
    if (ccxt::isBoolean (v)) return ccxt::any_cast<bool> (v);
    if (ccxt::isNum (v)) {
        const double d = ccxt::toDouble (v);
        return (d != 0.0) && !std::isnan (d);
    }
    if (ccxt::isStr (v))     return !ccxt::any_cast<std::string> (v).empty ();
    // objects and arrays are always truthy in JS, even when empty
    return true;
}

bool isEqual (const ccxt::any& a, const ccxt::any& b) {
    if (!a.has_value () || !b.has_value ()) {
        return !a.has_value () && !b.has_value ();
    }
    if (ccxt::isStr (a) && ccxt::isStr (b)) {
        return ccxt::any_cast<std::string> (a) == ccxt::any_cast<std::string> (b);
    }
    if (ccxt::isBoolean (a) && ccxt::isBoolean (b)) {
        return ccxt::any_cast<bool> (a) == ccxt::any_cast<bool> (b);
    }
    if (ccxt::isNum (a) && ccxt::isNum (b)) {
        return ccxt::toDouble (a) == ccxt::toDouble (b);
    }
    // reference identity for objects and arrays, matching JS ===
    if (ccxt::isDict (a) && ccxt::isDict (b)) {
        return ccxt::any_cast<dict> (a).sameAs (ccxt::any_cast<dict> (b));
    }
    if (ccxt::isList (a) && ccxt::isList (b)) {
        return ccxt::any_cast<list> (a).sameAs (ccxt::any_cast<list> (b));
    }
    return false;
}

namespace {

// shared by the four ordering helpers; returns false when either side is not
// numerically comparable, which is how JS treats NaN-producing comparisons
bool compareNumeric (const ccxt::any& a, const ccxt::any& b, int& sign) {
    if (ccxt::isStr (a) && ccxt::isStr (b)) {
        const std::string ls = ccxt::any_cast<std::string> (a);
        const std::string rs = ccxt::any_cast<std::string> (b);
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

bool isGreaterThan (const ccxt::any& a, const ccxt::any& b) {
    int sign = 0;
    return compareNumeric (a, b, sign) && sign > 0;
}

bool isGreaterThanOrEqual (const ccxt::any& a, const ccxt::any& b) {
    int sign = 0;
    return compareNumeric (a, b, sign) && sign >= 0;
}

bool isLessThan (const ccxt::any& a, const ccxt::any& b) {
    int sign = 0;
    return compareNumeric (a, b, sign) && sign < 0;
}

bool isLessThanOrEqual (const ccxt::any& a, const ccxt::any& b) {
    int sign = 0;
    return compareNumeric (a, b, sign) && sign <= 0;
}

bool inOp (const ccxt::any& container, const ccxt::any& key) {
    if (ccxt::isDict (container)) {
        return ccxt::any_cast<dict> (container).has (anyToString (key));
    }
    if (ccxt::isList (container)) {
        double index = 0;
        if (!numericValue (key, index)) {
            return false;
        }
        const long i = static_cast<long> (index);
        return i >= 0 && static_cast<std::size_t> (i) < ccxt::any_cast<list> (container).size ();
    }
    return false;
}

// ---------------------------------------------------------------------------
// arithmetic
// ---------------------------------------------------------------------------

ccxt::any add (const ccxt::any& a, const ccxt::any& b) {
    // JS `+` concatenates when either operand is a string
    if (ccxt::isStr (a) || ccxt::isStr (b)) {
        return ccxt::any (anyToString (a) + anyToString (b));
    }
    double left = 0;
    double right = 0;
    if (numericValue (a, left) && numericValue (b, right)) {
        return numberResult (left + right);
    }
    return ccxt::any (anyToString (a) + anyToString (b));
}

ccxt::any subtract (const ccxt::any& a, const ccxt::any& b) {
    double left = 0;
    double right = 0;
    if (!numericValue (a, left) || !numericValue (b, right)) {
        return ccxt::any (std::nan (""));
    }
    return numberResult (left - right);
}

ccxt::any multiply (const ccxt::any& a, const ccxt::any& b) {
    double left = 0;
    double right = 0;
    if (!numericValue (a, left) || !numericValue (b, right)) {
        return ccxt::any (std::nan (""));
    }
    return numberResult (left * right);
}

ccxt::any divide (const ccxt::any& a, const ccxt::any& b) {
    double left = 0;
    double right = 0;
    if (!numericValue (a, left) || !numericValue (b, right)) {
        return ccxt::any (std::nan (""));
    }
    // JS `/` is always floating point, including 1/2 === 0.5
    return numberResult (left / right);
}

ccxt::any mod (const ccxt::any& a, const ccxt::any& b) {
    double left = 0;
    double right = 0;
    if (!numericValue (a, left) || !numericValue (b, right)) {
        return ccxt::any (std::nan (""));
    }
    return numberResult (std::fmod (left, right));
}

ccxt::any postFixIncrement (ccxt::any& v) {
    const ccxt::any previous = v;
    v = add (v, ccxt::any (1));
    return previous;
}

ccxt::any postFixDecrement (ccxt::any& v) {
    const ccxt::any previous = v;
    v = subtract (v, ccxt::any (1));
    return previous;
}

ccxt::any prefixUnaryPlus (const ccxt::any& v) {
    double d = 0;
    return numericValue (v, d) ? numberResult (d) : ccxt::any (std::nan (""));
}

ccxt::any prefixUnaryNeg (const ccxt::any& v) {
    double d = 0;
    return numericValue (v, d) ? numberResult (-d) : ccxt::any (std::nan (""));
}

// ---------------------------------------------------------------------------
// type predicates
// ---------------------------------------------------------------------------

bool isString (const ccxt::any& v)     { return ccxt::isStr (v); }
bool isNumber (const ccxt::any& v)     { return ccxt::isNum (v); }
bool isBool (const ccxt::any& v)       { return ccxt::isBoolean (v); }
bool isDictionary (const ccxt::any& v) { return ccxt::isDict (v); }
bool isFunction (const ccxt::any&)     { return false; }   // no first-class functions in the value model
bool isArray (const ccxt::any& v)      { return ccxt::isList (v); }

bool isInteger (const ccxt::any& v) {
    if (!ccxt::isNum (v)) {
        return false;
    }
    const double d = ccxt::toDouble (v);
    return std::isfinite (d) && d == std::floor (d);
}

// ---------------------------------------------------------------------------
// collections
// ---------------------------------------------------------------------------

ccxt::any getArrayLength (const ccxt::any& v) {
    if (ccxt::isList (v)) return ccxt::any (static_cast<int> (ccxt::any_cast<list> (v).size ()));
    if (ccxt::isDict (v)) return ccxt::any (static_cast<int> (ccxt::any_cast<dict> (v).size ()));
    if (ccxt::isStr (v))  return ccxt::any (static_cast<int> (ccxt::any_cast<std::string> (v).size ()));
    // ws layer: caches and book sides behave like arrays
    if (v.type () == typeid (ccxt::ws::OrderBookSide)) {
        return ccxt::any (static_cast<int> (ccxt::any_cast<const ccxt::ws::OrderBookSide&> (v).size ()));
    }
    if (v.type () == typeid (ccxt::ws::ArrayCache)) {
        return ccxt::any (static_cast<int> (ccxt::any_cast<const ccxt::ws::ArrayCache&> (v).size ()));
    }
    if (v.type () == typeid (ccxt::ws::ArrayCacheByTimestamp)) {
        return ccxt::any (static_cast<int> (ccxt::any_cast<const ccxt::ws::ArrayCacheByTimestamp&> (v).size ()));
    }
    if (v.type () == typeid (ccxt::ws::ArrayCacheBySymbolById)) {
        return ccxt::any (static_cast<int> (ccxt::any_cast<const ccxt::ws::ArrayCacheBySymbolById&> (v).size ()));
    }
    if (v.type () == typeid (ccxt::ws::ArrayCacheByOutcomeById)) {
        return ccxt::any (static_cast<int> (ccxt::any_cast<const ccxt::ws::ArrayCacheByOutcomeById&> (v).size ()));
    }
    if (v.type () == typeid (ccxt::ws::ArrayCacheBySymbolBySide)) {
        return ccxt::any (static_cast<int> (ccxt::any_cast<const ccxt::ws::ArrayCacheBySymbolBySide&> (v).size ()));
    }
    return ccxt::any (0);
}

ccxt::any getStringLength (const ccxt::any& v) {
    return ccxt::any (static_cast<int> (anyToString (v).size ()));
}

ccxt::any getObjectKeys (const ccxt::any& v) {
    list out;
    if (ccxt::isDict (v)) {
        for (const auto& kv : ccxt::any_cast<dict> (v).entries ()) {
            out.push (ccxt::any (kv.first));
        }
    } else if (ccxt::isList (v)) {
        const std::size_t n = ccxt::any_cast<list> (v).size ();
        for (std::size_t i = 0; i < n; i++) {
            out.push (ccxt::any (std::to_string (i)));
        }
    }
    return ccxt::any (out);
}

ccxt::any getObjectValues (const ccxt::any& v) {
    list out;
    if (ccxt::isDict (v)) {
        for (const auto& kv : ccxt::any_cast<dict> (v).entries ()) {
            out.push (kv.second);
        }
    } else if (ccxt::isList (v)) {
        for (const auto& item : ccxt::any_cast<list> (v).items ()) {
            out.push (item);
        }
    }
    return ccxt::any (out);
}

void arrayPush (const ccxt::any& arr, const ccxt::any& v) {
    if (ccxt::isList (arr)) {
        ccxt::any_cast<list> (arr).push (v);
    }
}

ccxt::any pop (const ccxt::any& arr) {
    if (!ccxt::isList (arr)) {
        return ccxt::any {};
    }
    list handle = ccxt::any_cast<list> (arr);
    auto& items = handle.items ();
    if (items.empty ()) {
        return ccxt::any {};
    }
    const ccxt::any back = items.back ();
    items.pop_back ();
    return back;
}

ccxt::any shift (const ccxt::any& arr) {
    if (!ccxt::isList (arr)) {
        return ccxt::any {};
    }
    list handle = ccxt::any_cast<list> (arr);
    auto& items = handle.items ();
    if (items.empty ()) {
        return ccxt::any {};
    }
    const ccxt::any front = items.front ();
    items.erase (items.begin ());
    return front;
}

ccxt::any reverse (const ccxt::any& arr) {
    if (ccxt::isList (arr)) {
        list handle = ccxt::any_cast<list> (arr);
        auto& items = handle.items ();
        std::reverse (items.begin (), items.end ());
    }
    return arr;   // JS Array#reverse mutates and returns the same array
}

ccxt::any concat (const ccxt::any& a, const ccxt::any& b) {
    if (ccxt::isStr (a) || ccxt::isStr (b)) {
        return ccxt::any (anyToString (a) + anyToString (b));
    }
    list out;
    if (ccxt::isList (a)) {
        for (const auto& item : ccxt::any_cast<list> (a).items ()) out.push (item);
    }
    if (ccxt::isList (b)) {
        for (const auto& item : ccxt::any_cast<list> (b).items ()) out.push (item);
    } else if (b.has_value ()) {
        out.push (b);
    }
    return ccxt::any (out);
}

namespace {

// shared start/end normalisation for slice: negative counts from the end, and an
// absent end means "to the end", exactly as Array#slice / String#slice do
void normaliseSliceBounds (long length, const ccxt::any& start, const ccxt::any& end,
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

ccxt::any slice (const ccxt::any& target, const ccxt::any& start, const ccxt::any& end) {
    if (ccxt::isStr (target)) {
        const std::string s = ccxt::any_cast<std::string> (target);
        long from = 0;
        long to = 0;
        normaliseSliceBounds (static_cast<long> (s.size ()), start, end, from, to);
        return ccxt::any (s.substr (static_cast<std::size_t> (from),
                                   static_cast<std::size_t> (to - from)));
    }
    if (ccxt::isList (target)) {
        const auto& items = ccxt::any_cast<list> (target).items ();
        long from = 0;
        long to = 0;
        normaliseSliceBounds (static_cast<long> (items.size ()), start, end, from, to);
        list out;
        for (long i = from; i < to; i++) {
            out.push (items[static_cast<std::size_t> (i)]);
        }
        return ccxt::any (out);
    }
    return ccxt::any {};
}

bool includes (const ccxt::any& haystack, const ccxt::any& needle) {
    if (ccxt::isStr (haystack)) {
        return ccxt::any_cast<std::string> (haystack).find (anyToString (needle)) != std::string::npos;
    }
    if (ccxt::isList (haystack)) {
        for (const auto& item : ccxt::any_cast<list> (haystack).items ()) {
            if (isEqual (item, needle)) {
                return true;
            }
        }
    }
    return false;
}

ccxt::any getIndexOf (const ccxt::any& haystack, const ccxt::any& needle) {
    if (ccxt::isStr (haystack)) {
        const std::size_t at = ccxt::any_cast<std::string> (haystack).find (anyToString (needle));
        return ccxt::any (at == std::string::npos ? -1 : static_cast<int> (at));
    }
    if (ccxt::isList (haystack)) {
        const auto& items = ccxt::any_cast<list> (haystack).items ();
        for (std::size_t i = 0; i < items.size (); i++) {
            if (isEqual (items[i], needle)) {
                return ccxt::any (static_cast<int> (i));
            }
        }
    }
    return ccxt::any (-1);
}

// ---------------------------------------------------------------------------
// strings
// ---------------------------------------------------------------------------

ccxt::any toString (const ccxt::any& v) { return ccxt::any (anyToString (v)); }

std::string str (const ccxt::any& v) { return anyToString (v); }

bool startsWith (const ccxt::any& s, const ccxt::any& prefix) {
    const std::string str = anyToString (s);
    const std::string pre = anyToString (prefix);
    return str.size () >= pre.size () && str.compare (0, pre.size (), pre) == 0;
}

bool endsWith (const ccxt::any& s, const ccxt::any& suffix) {
    const std::string str = anyToString (s);
    const std::string suf = anyToString (suffix);
    return str.size () >= suf.size ()
        && str.compare (str.size () - suf.size (), suf.size (), suf) == 0;
}

ccxt::any trim (const ccxt::any& s) {
    const std::string str = anyToString (s);
    const auto first = str.find_first_not_of (" \t\n\r\f\v");
    if (first == std::string::npos) {
        return ccxt::any (std::string (""));
    }
    const auto last = str.find_last_not_of (" \t\n\r\f\v");
    return ccxt::any (str.substr (first, last - first + 1));
}

ccxt::any split (const ccxt::any& s, const ccxt::any& sep) {
    const std::string str = anyToString (s);
    const std::string delimiter = anyToString (sep);
    list out;
    if (delimiter.empty ()) {
        for (char c : str) {
            out.push (ccxt::any (std::string (1, c)));
        }
        return ccxt::any (out);
    }
    std::size_t start = 0;
    std::size_t at = str.find (delimiter);
    while (at != std::string::npos) {
        out.push (ccxt::any (str.substr (start, at - start)));
        start = at + delimiter.size ();
        at = str.find (delimiter, start);
    }
    out.push (ccxt::any (str.substr (start)));
    return ccxt::any (out);
}

ccxt::any join (const ccxt::any& arr, const ccxt::any& sep) {
    if (!ccxt::isList (arr)) {
        return ccxt::any (std::string (""));
    }
    const std::string delimiter = anyToString (sep);
    const auto& items = ccxt::any_cast<list> (arr).items ();
    std::string out;
    for (std::size_t i = 0; i < items.size (); i++) {
        if (i > 0) {
            out += delimiter;
        }
        // JS Array#join renders undefined and null as empty strings
        out += items[i].has_value () ? anyToString (items[i]) : std::string ("");
    }
    return ccxt::any (out);
}

ccxt::any toUpperCase (const ccxt::any& s) {
    std::string str = anyToString (s);
    std::transform (str.begin (), str.end (), str.begin (),
                    [] (unsigned char c) { return static_cast<char> (std::toupper (c)); });
    return ccxt::any (str);
}

ccxt::any toLowerCase (const ccxt::any& s) {
    std::string str = anyToString (s);
    std::transform (str.begin (), str.end (), str.begin (),
                    [] (unsigned char c) { return static_cast<char> (std::tolower (c)); });
    return ccxt::any (str);
}

ccxt::any replace (const ccxt::any& s, const ccxt::any& from, const ccxt::any& to) {
    std::string str = anyToString (s);
    const std::string needle = anyToString (from);
    if (needle.empty ()) {
        return ccxt::any (str);
    }
    const std::size_t at = str.find (needle);
    if (at != std::string::npos) {
        str.replace (at, needle.size (), anyToString (to));
    }
    return ccxt::any (str);
}

ccxt::any replaceAll (const ccxt::any& s, const ccxt::any& from, const ccxt::any& to) {
    std::string str = anyToString (s);
    const std::string needle = anyToString (from);
    if (needle.empty ()) {
        return ccxt::any (str);
    }
    const std::string replacement = anyToString (to);
    std::size_t at = str.find (needle);
    while (at != std::string::npos) {
        str.replace (at, needle.size (), replacement);
        at = str.find (needle, at + replacement.size ());
    }
    return ccxt::any (str);
}

ccxt::any padStart (const ccxt::any& s, const ccxt::any& width, const ccxt::any& pad) {
    const std::string str = anyToString (s);
    double target = 0;
    numericValue (width, target);
    const std::string filler = pad.has_value () ? anyToString (pad) : std::string (" ");
    if (filler.empty () || str.size () >= static_cast<std::size_t> (target)) {
        return ccxt::any (str);
    }
    std::string prefix;
    while (prefix.size () + str.size () < static_cast<std::size_t> (target)) {
        prefix += filler;
    }
    prefix.resize (static_cast<std::size_t> (target) - str.size ());
    return ccxt::any (prefix + str);
}

ccxt::any padEnd (const ccxt::any& s, const ccxt::any& width, const ccxt::any& pad) {
    std::string str = anyToString (s);
    double target = 0;
    numericValue (width, target);
    const std::string filler = pad.has_value () ? anyToString (pad) : std::string (" ");
    if (filler.empty () || str.size () >= static_cast<std::size_t> (target)) {
        return ccxt::any (str);
    }
    while (str.size () < static_cast<std::size_t> (target)) {
        str += filler;
    }
    str.resize (static_cast<std::size_t> (target));
    return ccxt::any (str);
}

ccxt::any toFixed (const ccxt::any& v, const ccxt::any& digits) {
    double d = 0;
    if (!numericValue (v, d)) {
        return ccxt::any (std::string ("NaN"));
    }
    double places = 0;
    numericValue (digits, places);
    char buffer[512];
    std::snprintf (buffer, sizeof (buffer), "%.*f", static_cast<int> (places), d);
    return ccxt::any (std::string (buffer));
}

// ---------------------------------------------------------------------------
// math
// ---------------------------------------------------------------------------

ccxt::any mathMin (const ccxt::any& a, const ccxt::any& b) {
    double left = 0;
    double right = 0;
    numericValue (a, left);
    numericValue (b, right);
    return numberResult (std::min (left, right));
}

ccxt::any mathMax (const ccxt::any& a, const ccxt::any& b) {
    double left = 0;
    double right = 0;
    numericValue (a, left);
    numericValue (b, right);
    return numberResult (std::max (left, right));
}

ccxt::any mathAbs (const ccxt::any& v) {
    double d = 0;
    numericValue (v, d);
    return numberResult (std::fabs (d));
}

ccxt::any mathFloor (const ccxt::any& v) {
    double d = 0;
    numericValue (v, d);
    return numberResult (std::floor (d));
}

ccxt::any mathCeil (const ccxt::any& v) {
    double d = 0;
    numericValue (v, d);
    return numberResult (std::ceil (d));
}

ccxt::any mathRound (const ccxt::any& v) {
    double d = 0;
    numericValue (v, d);
    // JS rounds .5 toward +Infinity, unlike std::round which rounds away from zero
    return numberResult (std::floor (d + 0.5));
}

ccxt::any mathPow (const ccxt::any& a, const ccxt::any& b) {
    double base = 0;
    double exponent = 0;
    numericValue (a, base);
    numericValue (b, exponent);
    return numberResult (std::pow (base, exponent));
}

ccxt::any mathLog (const ccxt::any& v) {
    double d = 0;
    numericValue (v, d);
    return ccxt::any (std::log (d));
}

// ---------------------------------------------------------------------------
// misc
// ---------------------------------------------------------------------------

void consoleLog (const ccxt::any& v) {
    std::cout << anyToString (v) << std::endl;
}

ccxt::any getCurrentTimestamp () {
    const auto now = std::chrono::system_clock::now ().time_since_epoch ();
    const auto ms = std::chrono::duration_cast<std::chrono::milliseconds> (now).count ();
    return ccxt::any (static_cast<long long> (ms));
}

// The transpiled base tests are long runs of bare `assert(...)` with no message, so a
// failure otherwise reports only "Assertion failed" with no way to tell which of the
// eighty assertions in the file it was. Counting them gives the ordinal, which maps
// straight back to the nth assert in the corresponding ts/src/test/base file.
long long assertionOrdinal = 0;

void resetAssertionOrdinal () { assertionOrdinal = 0; }

void assertTrue (const ccxt::any& condition, const ccxt::any& message) {
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

ccxt::any jsonStringify (const ccxt::any& v) {
    // ws values serialize as their plain shapes (caches -> lists, books -> dicts),
    // matching the JS shape the fixtures assert against
    if (v.type () == typeid (ccxt::ws::WsOrderBook) ||
        v.type () == typeid (ccxt::ws::OrderBookSide) ||
        v.type () == typeid (ccxt::ws::ArrayCache) ||
        v.type () == typeid (ccxt::ws::ArrayCacheByTimestamp) ||
        v.type () == typeid (ccxt::ws::ArrayCacheBySymbolById) ||
        v.type () == typeid (ccxt::ws::ArrayCacheBySymbolBySide)) {
        return jsonStringify (wsToPlain (v));
    }
    // Dictionaries serialise in insertion order: ccxt signs request bodies verbatim.
    if (ccxt::isDict (v)) {
        std::string out = "{";
        bool first = true;
        for (const auto& kv : ccxt::any_cast<dict> (v).entries ()) {
            if (!first) out += ",";
            first = false;
            out += "\"" + kv.first + "\":" + ccxt::any_cast<std::string> (jsonStringify (kv.second));
        }
        return ccxt::any (out + "}");
    }
    if (ccxt::isList (v)) {
        std::string out = "[";
        bool first = true;
        for (const auto& item : ccxt::any_cast<list> (v).items ()) {
            if (!first) out += ",";
            first = false;
            out += ccxt::any_cast<std::string> (jsonStringify (item));
        }
        return ccxt::any (out + "]");
    }
    if (!v.has_value ())      return ccxt::any (std::string ("null"));
    if (ccxt::isBoolean (v))  return ccxt::any (std::string (ccxt::any_cast<bool> (v) ? "true" : "false"));
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
    return ccxt::any (escaped + "\"");
}

ccxt::any parseFloat (const ccxt::any& v) {
    // JS parseFloat reads a leading number and ignores trailing junk
    try {
        std::size_t consumed = 0;
        const double parsed = std::stod (anyToString (v), &consumed);
        return (consumed == 0) ? ccxt::any (std::nan ("")) : ccxt::any (parsed);
    } catch (const std::exception&) {
        return ccxt::any (std::nan (""));
    }
}

ccxt::any parseInt (const ccxt::any& v) {
    try {
        std::size_t consumed = 0;
        const double parsed = std::stod (anyToString (v), &consumed);
        return (consumed == 0) ? ccxt::any (std::nan (""))
                               : ccxt::any (static_cast<long long> (std::trunc (parsed)));
    } catch (const std::exception&) {
        return ccxt::any (std::nan (""));
    }
}

ccxt::any parseToInt (const ccxt::any& v) { return parseInt (v); }

ccxt::any describeOf (const ccxt::any&) { return ccxt::any (ccxt::dict {}); }

ccxt::any resetOrderBook (const ccxt::any& book, const ccxt::any& snapshot) {
    // ws books: reset in place (the handle shares the store, mutation propagates);
    // anything else passes through untouched (pre-ws dict-based paths)
    if (book.type () == typeid (ccxt::ws::WsOrderBook)) {
        ccxt::ws::WsOrderBook handle = ccxt::any_cast<ccxt::ws::WsOrderBook> (book);
        handle.reset (snapshot.has_value () ? snapshot : ccxt::any {});
    }
    return book;
}

namespace {

// Dispatch on the exact stored cache type. Copying the handle is fine (shared Impl),
// but it must be copied into ITS OWN type — assigning a subclass into an ArrayCache
// variable slices the vtable and every append would run the base version.
template <class F>
ccxt::any dispatchCache (const ccxt::any& v, F&& f) {
    if (v.type () == typeid (ccxt::ws::ArrayCache)) {
        ccxt::ws::ArrayCache handle = ccxt::any_cast<ccxt::ws::ArrayCache> (v);
        return f (handle);
    }
    if (v.type () == typeid (ccxt::ws::ArrayCacheByTimestamp)) {
        ccxt::ws::ArrayCacheByTimestamp handle = ccxt::any_cast<ccxt::ws::ArrayCacheByTimestamp> (v);
        return f (handle);
    }
    if (v.type () == typeid (ccxt::ws::ArrayCacheBySymbolById)) {
        ccxt::ws::ArrayCacheBySymbolById handle = ccxt::any_cast<ccxt::ws::ArrayCacheBySymbolById> (v);
        return f (handle);
    }
    if (v.type () == typeid (ccxt::ws::ArrayCacheByOutcomeById)) {
        ccxt::ws::ArrayCacheByOutcomeById handle = ccxt::any_cast<ccxt::ws::ArrayCacheByOutcomeById> (v);
        return f (handle);
    }
    if (v.type () == typeid (ccxt::ws::ArrayCacheBySymbolBySide)) {
        ccxt::ws::ArrayCacheBySymbolBySide handle = ccxt::any_cast<ccxt::ws::ArrayCacheBySymbolBySide> (v);
        return f (handle);
    }
    return ccxt::any {};
}

} // namespace

ccxt::any wsStore (const ccxt::any& side, const ccxt::any& price, const ccxt::any& size) {
    if (side.type () == typeid (ccxt::ws::OrderBookSide)) {
        ccxt::ws::OrderBookSide handle = ccxt::any_cast<ccxt::ws::OrderBookSide> (side);
        handle.store (price, size);
    }
    return side;
}

ccxt::any wsStoreArray (const ccxt::any& side, const ccxt::any& delta) {
    if (side.type () == typeid (ccxt::ws::OrderBookSide)) {
        ccxt::ws::OrderBookSide handle = ccxt::any_cast<ccxt::ws::OrderBookSide> (side);
        handle.storeArray (delta);
    }
    return side;
}

ccxt::any wsLimit (const ccxt::any& bookOrSide) {
    if (bookOrSide.type () == typeid (ccxt::ws::WsOrderBook)) {
        ccxt::ws::WsOrderBook handle = ccxt::any_cast<ccxt::ws::WsOrderBook> (bookOrSide);
        handle.limit ();
    } else if (bookOrSide.type () == typeid (ccxt::ws::OrderBookSide)) {
        ccxt::ws::OrderBookSide handle = ccxt::any_cast<ccxt::ws::OrderBookSide> (bookOrSide);
        handle.limit ();
    }
    return bookOrSide;
}

ccxt::any wsAppend (const ccxt::any& cache, const ccxt::any& item) {
    dispatchCache (cache, [&] (auto& handle) -> ccxt::any {
        handle.append (item);
        return ccxt::any {};
    });
    return cache;
}

ccxt::any wsGetLimit (const ccxt::any& cache, const ccxt::any& symbol, const ccxt::any& limit) {
    return dispatchCache (cache, [&] (auto& handle) -> ccxt::any {
        return handle.getLimit (symbol, limit);
    });
}

ccxt::any wsClear (const ccxt::any& cache) {
    dispatchCache (cache, [] (auto& handle) -> ccxt::any {
        handle.clear ();
        return ccxt::any {};
    });
    return cache;
}

ccxt::any wsReset (const ccxt::any& book) {
    // no-arg reset: rebuild the book from its stored snapshot (JS book.reset())
    if (book.type () == typeid (ccxt::ws::WsOrderBook)) {
        ccxt::any_cast<ccxt::ws::WsOrderBook> (book).reset ();
    }
    return book;
}

// -- ws client helpers (generated pro code calls client.resolve(...) etc on a
//    ccxt::any-held Client handle) -------------------------------------------------

ccxt::any wsClientResolve (const ccxt::any& client, const ccxt::any& result, const ccxt::any& messageHash) {
    ccxt::ws::Client::of (client).resolve (result, anyToString (messageHash));
    return result;
}

ccxt::any wsClientReject (const ccxt::any& client, const ccxt::any& reason, const ccxt::any& messageHash) {
    ccxt::ws::Client::of (client).reject (reason, anyToString (messageHash));
    return reason;
}

ccxt::any wsClientFuture (const ccxt::any& client, const ccxt::any& messageHash) {
    return ccxt::any (ccxt::ws::Client::of (client).future (anyToString (messageHash)));
}

ccxt::any wsClientSend (const ccxt::any& client, const ccxt::any& message) {
    ccxt::ws::Client::of (client).send (message);
    return ccxt::any {};
}

ccxt::any wsClientReset (const ccxt::any& client, const ccxt::any& error) {
    // JS client.reset rejects every pending future with the error
    ccxt::ws::Client::of (client).reject (error);
    return error;
}

ccxt::any wsClientReusableFuture (const ccxt::any& client, const ccxt::any& messageHash) {
    return ccxt::any (ccxt::ws::Client::of (client).future (anyToString (messageHash)));
}

ccxt::any makeExchangeError (const ccxt::any& errorClass, const ccxt::any& message) {
    // pro venues materialise the stored error CLASS NAME into an error OBJECT
    // (assigned and passed to client.reject). Build it by throwing through the
    // Errors.h registry and capturing the exception_ptr -- copying the caught
    // concrete exception into a BaseError SLICES the dynamic type away, and
    // reasonToException's first branch rethrows exception_ptr payloads intact.
    try {
        ccxt::throwByName (anyToString (errorClass), anyToString (message));
    } catch (...) {
        return ccxt::any (std::current_exception ());
    }
    return ccxt::any {};
}

ccxt::any wsFutureResolve (const ccxt::any& future, const ccxt::any& value) {
    ccxt::any_cast<ccxt::ws::Future> (future).resolve (value);
    return value;
}

ccxt::any wsFutureReject (const ccxt::any& future, const ccxt::any& error) {
    ccxt::any_cast<ccxt::ws::Future> (future).reject (ccxt::ws::Client::reasonToException (error));
    return error;
}

ccxt::any wsToPlain (const ccxt::any& v) {
    if (v.type () == typeid (ccxt::ws::WsOrderBook)) {
        // the enumerable-props shape the JS test equals iterates: bids/asks rows plus
        // the scalar fields (cache stays invisible, as in JS)
        return ccxt::any_cast<const ccxt::ws::WsOrderBook&> (v).toDict ();
    }
    if (v.type () == typeid (ccxt::ws::OrderBookSide)) {
        return ccxt::any (ccxt::any_cast<const ccxt::ws::OrderBookSide&> (v).rows ());
    }
    const ccxt::any asRows = dispatchCache (v, [] (auto& handle) -> ccxt::any {
        return ccxt::any (handle.rows ());
    });
    return asRows.has_value () ? asRows : v;
}
