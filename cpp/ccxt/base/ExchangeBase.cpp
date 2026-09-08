#include "ExchangeBase.h"
#include "Starknet.h"

#include <curl/curl.h>

#include <openssl/sha.h>
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <openssl/ec.h>
#include <openssl/bn.h>
#include <openssl/obj_mac.h>

#include <nlohmann/json.hpp>

#include <algorithm>
#include <chrono>
#include <cmath>
#include <cstdio>
#include <cstring>
#include <ctime>
#include <cctype>
#include <charconv>
#include <cstdlib>
#include <functional>
#include <iomanip>
#include <iostream>
#include <random>
#include <regex>
#include <set>
#include <sstream>
#include <thread>

namespace ccxt {

namespace {

// A key argument is either one key or a list of keys; the safe*N variants take the
// list form and the plain ones are expressed in terms of them.
list keyList (const std::any& keys) {
    if (isList (keys)) {
        return std::any_cast<list> (keys);
    }
    list single;
    single.push (keys);
    return single;
}

// Shared by every safe* accessor: first key that is present and not null wins.
std::any firstPresent (const std::any& obj, const std::any& keys) {
    const list candidates = keyList (keys);
    for (const auto& key : candidates.items ()) {
        const std::any value = getValue (obj, key);
        // TS prop()/getValueFromKeysInArray skip undefined, null AND the empty string,
        // so '' falls through to the next key and ultimately to the default
        if (value.has_value () && !(isStr (value) && std::any_cast<std::string> (value).empty ())) {
            return value;
        }
    }
    return std::any {};
}

nlohmann::json anyToJson (const std::any& v) {
    if (!v.has_value ())  return nullptr;
    if (isStr (v))        return std::any_cast<std::string> (v);
    if (isBoolean (v))    return std::any_cast<bool> (v);
    if (isInt (v))        return toLong (v);
    if (isFloat (v))      return toDouble (v);
    if (isList (v)) {
        nlohmann::json out = nlohmann::json::array ();
        for (const auto& item : std::any_cast<list> (v).items ()) {
            out.push_back (anyToJson (item));
        }
        return out;
    }
    if (isDict (v)) {
        nlohmann::json out = nlohmann::json::object ();
        for (const auto& kv : std::any_cast<dict> (v).entries ()) {
            out[kv.first] = anyToJson (kv.second);
        }
        return out;
    }
    return nullptr;
}

std::any jsonToAny (const nlohmann::json& j) {
    if (j.is_null ())            return std::any {};
    if (j.is_string ())          return std::any (j.get<std::string> ());
    if (j.is_boolean ())         return std::any (j.get<bool> ());
    if (j.is_number_integer ())  return std::any (static_cast<long long> (j.get<long long> ()));
    if (j.is_number_float ())    return std::any (j.get<double> ());
    if (j.is_array ()) {
        list out;
        for (const auto& item : j) {
            out.push (jsonToAny (item));
        }
        return std::any (out);
    }
    if (j.is_object ()) {
        dict out;
        for (auto it = j.begin (); it != j.end (); ++it) {
            out.set (it.key (), jsonToAny (it.value ()));
        }
        return std::any (out);
    }
    return std::any {};
}

// nlohmann::json objects sort keys, which would break request signing, so serialise
// dictionaries by hand in insertion order.
std::string serialise (const std::any& v) {
    if (isDict (v)) {
        std::string out = "{";
        bool first = true;
        for (const auto& kv : std::any_cast<dict> (v).entries ()) {
            if (!first) out += ",";
            first = false;
            out += nlohmann::json (kv.first).dump () + ":" + serialise (kv.second);
        }
        return out + "}";
    }
    if (isList (v)) {
        std::string out = "[";
        bool first = true;
        for (const auto& item : std::any_cast<list> (v).items ()) {
            if (!first) out += ",";
            first = false;
            out += serialise (item);
        }
        return out + "]";
    }
    return anyToJson (v).dump ();
}

std::any deepClone (const std::any& v) {
    if (isDict (v)) {
        dict out;
        for (const auto& kv : std::any_cast<dict> (v).entries ()) {
            out.set (kv.first, deepClone (kv.second));
        }
        return std::any (out);
    }
    if (isList (v)) {
        list out;
        for (const auto& item : std::any_cast<list> (v).items ()) {
            out.push (deepClone (item));
        }
        return std::any (out);
    }
    return v;
}

void deepMergeInto (dict& target, const std::any& source) {
    if (!isDict (source)) {
        return;
    }
    for (const auto& kv : std::any_cast<dict> (source).entries ()) {
        const std::any existing = target.get (kv.first);
        if (isDict (kv.second) && isDict (existing)) {
            dict merged = std::any_cast<dict> (existing);
            deepMergeInto (merged, kv.second);
            target.set (kv.first, std::any (merged));
        } else {
            target.set (kv.first, deepClone (kv.second));
        }
    }
}

} // namespace

// ---------------------------------------------------------------------------
// async plumbing
// ---------------------------------------------------------------------------

std::any awaitValue (const std::any& value) {
    // generated async bodies return shared_future<any>; awaiting anything else is a
    // no-op, exactly like `await 1` in JS
    if (value.type () == typeid (std::shared_future<std::any>)) {
        return std::any_cast<std::shared_future<std::any>> (value).get ();
    }
    return value;
}

std::any promiseAll (const std::any& futures) {
    if (!isList (futures)) {
        return futures;
    }
    list out;
    for (const auto& item : std::any_cast<list> (futures).items ()) {
        out.push (awaitValue (item));
    }
    return std::any (out);
}

// ---------------------------------------------------------------------------
// safe accessors
// ---------------------------------------------------------------------------

std::any ExchangeBase::safeValueN (std::any obj, std::any keys, std::any def) {
    const std::any found = firstPresent (obj, keys);
    return found.has_value () ? found : def;
}

std::any ExchangeBase::safeValue (std::any obj, std::any key, std::any def) {
    return this->safeValueN (obj, key, def);
}

std::any ExchangeBase::safeValue2 (std::any obj, std::any k1, std::any k2, std::any def) {
    return this->safeValueN (obj, std::any (list { k1, k2 }), def);
}

std::any ExchangeBase::safeStringN (std::any obj, std::any keys, std::any def) {
    const std::any found = firstPresent (obj, keys);
    if (!found.has_value ()) {
        return def;
    }
    // TS: `if (typeof x === 'string') return x; if (Number.isFinite(x)) return String(x);
    // return $default;` -- a bool, dict or list is NOT string-coercible here and falls
    // back to the default, so this must not stringify everything it finds.
    if (isStr (found)) {
        return found;
    }
    if (isNum (found) && std::isfinite (toDouble (found))) {
        return this->numberToString (found);
    }
    return def;
}

std::any ExchangeBase::safeString (std::any obj, std::any key, std::any def) {
    return this->safeStringN (obj, key, def);
}

std::any ExchangeBase::safeString2 (std::any obj, std::any k1, std::any k2, std::any def) {
    return this->safeStringN (obj, std::any (list { k1, k2 }), def);
}

// The case conversion applies to the FOUND value only -- TS returns `$default`
// untouched, so safeStringLower(o, 'missing', 'MiXed_Case') is 'MiXed_Case', not
// 'mixed_case'. Hence the lookup passes no default of its own.
std::any ExchangeBase::safeStringUpper (std::any obj, std::any key, std::any def) {
    const std::any value = this->safeString (obj, key, std::any {});
    return value.has_value () ? toUpperCase (value) : def;
}

std::any ExchangeBase::safeStringLower (std::any obj, std::any key, std::any def) {
    const std::any value = this->safeString (obj, key, std::any {});
    return value.has_value () ? toLowerCase (value) : def;
}

std::any ExchangeBase::safeFloatN (std::any obj, std::any keys, std::any def) {
    const std::any found = firstPresent (obj, keys);
    if (!found.has_value ()) {
        return def;
    }
    if (isNum (found)) {
        return std::any (toDouble (found));
    }
    if (isStr (found)) {
        try {
            std::size_t consumed = 0;
            const std::string s = std::any_cast<std::string> (found);
            const double parsed = std::stod (s, &consumed);
            if (consumed == 0) {
                return def;
            }
            return std::any (parsed);
        } catch (const std::exception&) {
            return def;
        }
    }
    return def;
}

std::any ExchangeBase::safeFloat (std::any obj, std::any key, std::any def) {
    return this->safeFloatN (obj, key, def);
}

std::any ExchangeBase::safeFloat2 (std::any obj, std::any k1, std::any k2, std::any def) {
    return this->safeFloatN (obj, std::any (list { k1, k2 }), def);
}

std::any ExchangeBase::safeIntegerN (std::any obj, std::any keys, std::any def) {
    const std::any value = this->safeFloatN (obj, keys, std::any {});
    if (!value.has_value ()) {
        return def;
    }
    const double d = toDouble (value);
    if (!std::isfinite (d)) {
        return def;
    }
    return std::any (static_cast<long long> (d));
}

std::any ExchangeBase::safeInteger (std::any obj, std::any key, std::any def) {
    return this->safeIntegerN (obj, key, def);
}

std::any ExchangeBase::safeInteger2 (std::any obj, std::any k1, std::any k2, std::any def) {
    return this->safeIntegerN (obj, std::any (list { k1, k2 }), def);
}

std::any ExchangeBase::safeBool (std::any obj, std::any key, std::any def) {
    const std::any found = firstPresent (obj, key);
    if (!found.has_value ()) {
        return def;
    }
    return std::any (isTrue (found));
}

std::any ExchangeBase::safeTimestamp (std::any obj, std::any key, std::any def) {
    const std::any secondsValue = this->safeFloat (obj, key, std::any {});
    if (!secondsValue.has_value ()) {
        return def;
    }
    return std::any (static_cast<long long> (toDouble (secondsValue) * 1000.0));
}

std::any ExchangeBase::safeTimestampN (std::any obj, std::any keys, std::any def) {
    const std::any secondsValue = this->safeFloatN (obj, keys, std::any {});
    if (!secondsValue.has_value ()) {
        return def;
    }
    return std::any (static_cast<long long> (toDouble (secondsValue) * 1000.0));
}

std::any ExchangeBase::safeTimestamp2 (std::any obj, std::any k1, std::any k2, std::any def) {
    return this->safeTimestampN (obj, std::any (list { k1, k2 }), def);
}

std::any ExchangeBase::safeStringUpperN (std::any obj, std::any keys, std::any def) {
    const std::any value = this->safeStringN (obj, keys, std::any {});
    return value.has_value () ? toUpperCase (value) : def;
}

std::any ExchangeBase::safeStringUpper2 (std::any obj, std::any k1, std::any k2, std::any def) {
    return this->safeStringUpperN (obj, std::any (list { k1, k2 }), def);
}

std::any ExchangeBase::safeStringLowerN (std::any obj, std::any keys, std::any def) {
    const std::any value = this->safeStringN (obj, keys, std::any {});
    return value.has_value () ? toLowerCase (value) : def;
}

std::any ExchangeBase::safeStringLower2 (std::any obj, std::any k1, std::any k2, std::any def) {
    return this->safeStringLowerN (obj, std::any (list { k1, k2 }), def);
}

// TS: `isNumber(n) ? parseInt(n * factor) : default` -- the multiply happens in
// floating point and the result is truncated toward zero, not rounded.
std::any ExchangeBase::safeIntegerProductN (std::any obj, std::any keys, std::any factor, std::any def) {
    const std::any value = this->safeFloatN (obj, keys, std::any {});
    if (!value.has_value ()) {
        return def;
    }
    const double product = toDouble (value) * toDouble (factor);
    if (!std::isfinite (product)) {
        return def;
    }
    return std::any (static_cast<long long> (product));
}

std::any ExchangeBase::safeIntegerProduct (std::any obj, std::any key, std::any factor, std::any def) {
    return this->safeIntegerProductN (obj, key, factor, def);
}

std::any ExchangeBase::safeIntegerProduct2 (std::any obj, std::any k1, std::any k2, std::any factor, std::any def) {
    return this->safeIntegerProductN (obj, std::any (list { k1, k2 }), factor, def);
}

// ---------------------------------------------------------------------------
// generic collection helpers
// ---------------------------------------------------------------------------

std::any ExchangeBase::extend (std::any a, std::any b) {
    dict out;
    for (const std::any& source : { a, b }) {
        if (isDict (source)) {
            for (const auto& kv : std::any_cast<dict> (source).entries ()) {
                out.set (kv.first, kv.second);
            }
        }
    }
    return std::any (out);
}

std::any ExchangeBase::deepExtend (std::any a, std::any b, std::any c, std::any d) {
    dict out;
    for (const std::any& source : { a, b, c, d }) {
        deepMergeInto (out, source);
    }
    return std::any (out);
}

std::any ExchangeBase::clone (std::any value) { return deepClone (value); }

std::any ExchangeBase::sortBy (std::any array, std::any key, std::any descending, std::any def) {
    if (!isList (array)) {
        return array;
    }
    std::vector<std::any> items = std::any_cast<list> (array).items ();
    const bool desc = isTrue (descending);
    std::stable_sort (items.begin (), items.end (), [&] (const std::any& l, const std::any& r) {
        std::any lv = getValue (l, key);
        std::any rv = getValue (r, key);
        if (!lv.has_value ()) lv = def;
        if (!rv.has_value ()) rv = def;
        return desc ? isGreaterThan (lv, rv) : isLessThan (lv, rv);
    });
    return std::any (list (items));
}

std::any ExchangeBase::sortBy2 (std::any array, std::any k1, std::any k2, std::any descending) {
    if (!isList (array)) {
        return array;
    }
    std::vector<std::any> items = std::any_cast<list> (array).items ();
    const bool desc = isTrue (descending);
    std::stable_sort (items.begin (), items.end (), [&] (const std::any& l, const std::any& r) {
        const std::any l1 = getValue (l, k1);
        const std::any r1 = getValue (r, k1);
        if (!isEqual (l1, r1)) {
            return desc ? isGreaterThan (l1, r1) : isLessThan (l1, r1);
        }
        const std::any l2 = getValue (l, k2);
        const std::any r2 = getValue (r, k2);
        return desc ? isGreaterThan (l2, r2) : isLessThan (l2, r2);
    });
    return std::any (list (items));
}

std::any ExchangeBase::groupBy (std::any array, std::any key) {
    dict out;
    if (!isList (array)) {
        return std::any (out);
    }
    for (const auto& item : std::any_cast<list> (array).items ()) {
        const std::any value = getValue (item, key);
        if (!value.has_value ()) {
            continue;   // JS groupBy drops entries without the key
        }
        const std::string bucket = str (value);
        std::any existing = out.get (bucket);
        if (!isList (existing)) {
            existing = std::any (list {});
            out.set (bucket, existing);
        }
        std::any_cast<list> (existing).push (item);
    }
    return std::any (out);
}

std::any ExchangeBase::indexBy (std::any array, std::any key) {
    dict out;
    const std::any values = isDict (array) ? getObjectValues (array) : array;
    if (!isList (values)) {
        return std::any (out);
    }
    for (const auto& item : std::any_cast<list> (values).items ()) {
        const std::any value = getValue (item, key);
        if (value.has_value ()) {
            out.set (str (value), item);
        }
    }
    return std::any (out);
}

std::any ExchangeBase::indexBySafe (std::any array, std::any key) {
    return this->indexBy (array, key);
}

std::any ExchangeBase::filterBy (std::any array, std::any key, std::any value) {
    list out;
    const std::any values = isDict (array) ? getObjectValues (array) : array;
    if (!isList (values)) {
        return std::any (out);
    }
    for (const auto& item : std::any_cast<list> (values).items ()) {
        if (isEqual (getValue (item, key), value)) {
            out.push (item);
        }
    }
    return std::any (out);
}

std::any ExchangeBase::inArray (std::any needle, std::any haystack) {
    return std::any (includes (haystack, needle));
}

std::any ExchangeBase::keysort (std::any obj) {
    dict out;
    if (!isDict (obj)) {
        return std::any (out);
    }
    const dict source = std::any_cast<dict> (obj);
    std::vector<std::string> keys;
    for (const auto& kv : source.entries ()) {
        keys.push_back (kv.first);
    }
    std::sort (keys.begin (), keys.end ());
    for (const auto& key : keys) {
        out.set (key, source.get (key));
    }
    return std::any (out);
}

std::any ExchangeBase::omit (std::any obj, std::any keys, std::any k2, std::any k3,
                             std::any k4, std::any k5, std::any k6, std::any k7) {
    // TS omit is variadic: omit(obj, 'a', 'b') or omit(obj, ['a', 'b']); the extra
    // C++ parameters cover the spread form up to the widest generated call site.
    if (!isDict (obj)) {
        return obj;
    }
    std::set<std::string> drop;
    if (isList (keys)) {
        for (const auto& k : std::any_cast<list> (keys).items ()) {
            drop.insert (str (k));
        }
    } else if (keys.has_value ()) {
        drop.insert (str (keys));
    }
    for (const std::any& extra : { k2, k3, k4, k5, k6, k7 }) {
        if (extra.has_value ()) {
            drop.insert (str (extra));
        }
    }
    dict out;
    for (const auto& kv : std::any_cast<dict> (obj).entries ()) {
        if (drop.find (kv.first) == drop.end ()) {
            out.set (kv.first, kv.second);
        }
    }
    return std::any (out);
}

std::any ExchangeBase::omitZero (std::any value) {
    if (!value.has_value ()) {
        return std::any {};
    }
    double d = 0;
    if (isNum (value)) {
        d = toDouble (value);
    } else if (isStr (value)) {
        try {
            d = std::stod (std::any_cast<std::string> (value));
        } catch (const std::exception&) {
            return value;
        }
    } else {
        return value;
    }
    return (d == 0.0) ? std::any {} : value;
}

std::any ExchangeBase::toArray (std::any value) {
    if (isList (value)) {
        return value;
    }
    return getObjectValues (value);
}

std::any ExchangeBase::unique (std::any array) {
    list out;
    if (!isList (array)) {
        return std::any (out);
    }
    for (const auto& item : std::any_cast<list> (array).items ()) {
        if (!includes (std::any (out), item)) {
            out.push (item);
        }
    }
    return std::any (out);
}

std::any ExchangeBase::sum (std::any a, std::any b, std::any c, std::any d) {
    // JS `sum` ignores non-numeric arguments entirely
    double total = 0;
    bool sawNumber = false;
    for (const std::any& value : { a, b, c, d }) {
        if (isNum (value)) {
            total += toDouble (value);
            sawNumber = true;
        }
    }
    return sawNumber ? add (std::any (0), std::any (total)) : std::any {};
}

std::any ExchangeBase::isDictionary (std::any value) { return std::any (isDict (value)); }

std::any ExchangeBase::arrayConcat (std::any a, std::any b) { return concat (a, b); }

std::any ExchangeBase::arraySlice (std::any array, std::any start, std::any end) {
    return slice (array, start, end);
}

std::any ExchangeBase::valueIsDefined (std::any value) { return std::any (value.has_value ()); }

// TS returns true only for undefined/null and empty containers; every scalar -- "", 0,
// false included -- is explicitly false.
std::any ExchangeBase::isEmpty (std::any value) {
    if (!value.has_value ()) {
        return std::any (true);
    }
    if (isList (value)) {
        return std::any (std::any_cast<list> (value).size () < 1);
    }
    if (isDict (value)) {
        return std::any (std::any_cast<dict> (value).size () < 1);
    }
    return std::any (false);
}

// TS copies first (`array.slice()`), so the input must not be reordered. With the
// reference-semantic list of D1 that matters: sorting in place would be visible to
// every alias, and test.sort asserts the original is untouched.
std::any ExchangeBase::sort (std::any array) {
    if (!isList (array)) {
        return array;
    }
    std::vector<std::any> copy = std::any_cast<list> (array).items ();
    // JS Array#sort with no comparator compares elements as strings
    std::stable_sort (copy.begin (), copy.end (), [] (const std::any& a, const std::any& b) {
        return str (a) < str (b);
    });
    return std::any (list (std::move (copy)));
}


// ---------------------------------------------------------------------------
// strings
// ---------------------------------------------------------------------------

std::any ExchangeBase::capitalize (std::any s) {
    std::string value = str (s);
    if (value.empty ()) {
        return std::any (value);
    }
    value[0] = static_cast<char> (std::toupper (static_cast<unsigned char> (value[0])));
    return std::any (value);
}

std::any ExchangeBase::implodeParams (std::any target, std::any params) {
    std::string out = str (target);
    if (isDict (params)) {
        for (const auto& kv : std::any_cast<dict> (params).entries ()) {
            if (isList (kv.second)) {
                continue;   // array params are query values, not path segments
            }
            const std::string token = "{" + kv.first + "}";
            std::size_t at = out.find (token);
            while (at != std::string::npos) {
                const std::string replacement = str (kv.second);
                out.replace (at, token.size (), replacement);
                at = out.find (token, at + replacement.size ());
            }
        }
    }
    return std::any (out);
}

std::any ExchangeBase::extractParams (std::any target) {
    const std::string value = str (target);
    list out;
    std::size_t at = value.find ('{');
    while (at != std::string::npos) {
        const std::size_t close = value.find ('}', at);
        if (close == std::string::npos) {
            break;
        }
        out.push (std::any (value.substr (at + 1, close - at - 1)));
        at = value.find ('{', close);
    }
    return std::any (out);
}

std::any ExchangeBase::encodeURIComponent (std::any value) {
    static const std::string unreserved =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~*'()";
    const std::string input = str (value);
    std::string out;
    for (unsigned char c : input) {
        if (unreserved.find (static_cast<char> (c)) != std::string::npos) {
            out += static_cast<char> (c);
        } else {
            char buffer[8];
            std::snprintf (buffer, sizeof (buffer), "%%%02X", c);
            out += buffer;
        }
    }
    return std::any (out);
}

std::any ExchangeBase::stringToCharsArray (std::any value) {
    return split (value, std::any (std::string ("")));
}

namespace {
const char* BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
}

std::any ExchangeBase::stringToBase64 (std::any value) {
    const std::string input = str (value);
    std::string out;
    for (std::size_t i = 0; i < input.size (); i += 3) {
        const unsigned char b0 = static_cast<unsigned char> (input[i]);
        const unsigned char b1 = (i + 1 < input.size ()) ? static_cast<unsigned char> (input[i + 1]) : 0;
        const unsigned char b2 = (i + 2 < input.size ()) ? static_cast<unsigned char> (input[i + 2]) : 0;
        out += BASE64_ALPHABET[b0 >> 2];
        out += BASE64_ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)];
        out += (i + 1 < input.size ()) ? BASE64_ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)] : '=';
        out += (i + 2 < input.size ()) ? BASE64_ALPHABET[b2 & 0x3f] : '=';
    }
    return std::any (out);
}

std::any ExchangeBase::base64ToBinary (std::any value) {
    const std::string input = str (value);
    std::string out;
    int accumulator = 0;
    int bits = 0;
    for (char c : input) {
        if (c == '=') {
            break;
        }
        const char* at = std::strchr (BASE64_ALPHABET, c);
        if (at == nullptr) {
            continue;
        }
        accumulator = (accumulator << 6) | static_cast<int> (at - BASE64_ALPHABET);
        bits += 6;
        if (bits >= 8) {
            bits -= 8;
            out += static_cast<char> ((accumulator >> bits) & 0xff);
        }
    }
    return std::any (out);
}

std::any ExchangeBase::binaryToBase16 (std::any value) {
    const std::string input = str (value);
    std::string out;
    for (unsigned char c : input) {
        char buffer[4];
        std::snprintf (buffer, sizeof (buffer), "%02x", c);
        out += buffer;
    }
    return std::any (out);
}

std::any ExchangeBase::strip (std::any value) {
    return trim (value);
}

// uuid4, formatted 8-4-4-4-12 with the version and variant nibbles pinned. Seeded from
// random_device per call site rather than a shared generator so it stays thread-safe
// under the std::async-per-call model (D5).
std::any ExchangeBase::uuid () {
    static thread_local std::mt19937_64 generator (std::random_device {} ());
    std::uniform_int_distribution<int> nibble (0, 15);
    static const char* digits = "0123456789abcdef";
    std::string out;
    for (int i = 0; i < 36; i++) {
        if (i == 8 || i == 13 || i == 18 || i == 23) {
            out += '-';
        } else if (i == 14) {
            out += '4';                                  // version 4
        } else if (i == 19) {
            out += digits[(nibble (generator) & 0x3) | 0x8];   // variant 10xx
        } else {
            out += digits[nibble (generator)];
        }
    }
    return std::any (out);
}

// ---------------------------------------------------------------------------
// numbers
// ---------------------------------------------------------------------------

std::any ExchangeBase::parseNumber (std::any value, std::any def) {
    if (!value.has_value ()) {
        return def;
    }
    if (isNum (value)) {
        return value;
    }
    try {
        return std::any (std::stod (str (value)));
    } catch (const std::exception&) {
        return def;
    }
}

// JS Number#toString gives the shortest representation that round-trips, then ccxt
// expands any scientific notation so amounts and prices never reach an exchange as
// "7.8e-7". std::to_chars in shortest mode is the same shortest-round-trip algorithm,
// so the two agree digit for digit; only the expansion has to be written out.
std::any ExchangeBase::numberToString (std::any value) {
    if (!value.has_value ()) {
        return std::any {};
    }
    return std::any (numberToText (value));
}

std::any ExchangeBase::decimalToPrecision (std::any x, std::any roundingMode, std::any digits,
                                           std::any countingMode, std::any paddingMode) {
    // The defaults match the TS signature: DECIMAL_PLACES counting, no padding. An
    // absent roundingMode means TRUNCATE, which is what ccxt's own callers rely on.
    const int rounding = roundingMode.has_value () ? static_cast<int> (toLong (roundingMode)) : 0;
    const int counting = countingMode.has_value ()
        ? static_cast<int> (toLong (countingMode)) : 2;
    const int padding = paddingMode.has_value ()
        ? static_cast<int> (toLong (paddingMode)) : 5;
    return std::any (decimalToPrecisionText (x, rounding, digits, counting, padding));
}

std::any ExchangeBase::precisionFromString (std::any value) {
    if (!value.has_value ()) {
        return std::any (0);
    }
    const std::string s = str (value);
    // '1e-4' -> 4, '1e4' -> -4: strip the mantissa and negate the exponent
    if (s.find ('e') != std::string::npos || s.find ('E') != std::string::npos) {
        const std::size_t at = s.find_first_of ("eE");
        int exponent = 0;
        try {
            exponent = std::stoi (s.substr (at + 1));
        } catch (const std::exception&) {
            return std::any (0);
        }
        return std::any (-exponent);
    }
    // Mirrors the single-pass scan in ts/src/base/functions/number.ts, which is
    // equivalent to str.replace(/0+$/g, '').split('.') -- trailing zeros do not count
    // toward precision, so '0.0100' is 2 and '1.0000' is 0.
    int dot = -1;
    int secondDot = -1;
    int lastNonZero = -1;
    for (int i = 0; i < static_cast<int> (s.size ()); i++) {
        const char c = s[static_cast<std::size_t> (i)];
        if (c != '0') {
            lastNonZero = i;
            if (c == '.') {
                if (dot < 0) {
                    dot = i;
                } else if (secondDot < 0) {
                    secondDot = i;
                }
            }
        }
    }
    if (dot < 0) {
        return std::any (0);
    }
    return std::any (((secondDot < 0) ? (lastNonZero + 1) : secondDot) - dot - 1);
}

// ---------------------------------------------------------------------------
// json
// ---------------------------------------------------------------------------

std::any ExchangeBase::parseJson (std::any value) {
    try {
        // exchange ids routinely exceed int64 (e.g. alpaca trade ids like
        // 2880534893454904000): nlohmann stores those as double, rounding the
        // value before any numberToString can recover it. Quote such integer
        // literals first so they ride through as exact strings.
        std::string text = str (value);
        static const std::regex bigInt (R"((?<![.\w-])-?(\d{19,})(?![\d.]))");
        text = std::regex_replace (text, bigInt, R"("$&")");
        return jsonToAny (nlohmann::json::parse (text));
    } catch (const std::exception&) {
        return std::any {};   // ccxt returns undefined for unparseable payloads
    }
}

std::any ExchangeBase::json (std::any value, std::any params) {
    (void) params;   // TS accepts it for signature compatibility and ignores it
    return std::any (serialise (value));
}

std::any ExchangeBase::isJsonEncodedObject (std::any value) {
    if (!isStr (value)) {
        return std::any (false);
    }
    const std::string text = std::any_cast<std::string> (value);
    if (text.empty ()) {
        return std::any (false);
    }
    return std::any ((text[0] == '{') || (text[0] == '['));
}

// ---------------------------------------------------------------------------
// query-string encoding
// ---------------------------------------------------------------------------
//
// ccxt encodes params with qs.stringify under four different option sets. They share
// one traversal and differ only in three flags, so they share one implementation here
// too rather than drifting apart:
//
//   urlencode                -> encode keys and values, arrays indexed  (a[0]=1)
//   urlencodeNested          -> encodeValuesOnly, arrays indexed
//   urlencodeWithArrayRepeat -> encode keys and values, arrays repeated (a=1&a=2)
//   rawencode                -> encode: false, arrays indexed
//
// Nested containers produce bracketed keys (`b[c]`), which is what qs does and what
// exchange signing expects. Key order is the insertion order of ccxt::dict -- that is
// the whole reason for the ordered-map value model, since signatures are computed over
// this exact string.

namespace {

void qsAppend (std::vector<std::pair<std::string, std::string>>& out,
               const std::string& prefix, const std::any& value, bool arrayRepeat) {
    if (isDict (value)) {
        for (const auto& kv : std::any_cast<dict> (value).entries ()) {
            const std::string key = prefix.empty () ? kv.first : (prefix + "[" + kv.first + "]");
            qsAppend (out, key, kv.second, arrayRepeat);
        }
        return;
    }
    if (isList (value)) {
        const auto& items = std::any_cast<list> (value).items ();
        for (std::size_t i = 0; i < items.size (); i++) {
            // 'repeat' reuses the bare key for every element; otherwise qs indexes it
            const std::string key = arrayRepeat
                ? prefix
                : (prefix + "[" + std::to_string (i) + "]");
            qsAppend (out, key, items[i], arrayRepeat);
        }
        return;
    }
    if (!value.has_value ()) {
        return;   // qs drops undefined, matching JS
    }
    out.emplace_back (prefix, str (value));
}

} // namespace

std::any ExchangeBase::urlencode (std::any params, std::any sortKeys) {
    return std::any (this->queryString (params, true, true, false, sortKeys));
}

std::any ExchangeBase::urlencodeNested (std::any params) {
    // encodeValuesOnly: brackets in the key must survive unescaped
    return std::any (this->queryString (params, false, true, false, std::any {}));
}

std::any ExchangeBase::urlencodeWithArrayRepeat (std::any params) {
    return std::any (this->queryString (params, true, true, true, std::any {}));
}

std::any ExchangeBase::rawencode (std::any params, std::any sortKeys) {
    return std::any (this->queryString (params, false, false, false, sortKeys));
}

std::string ExchangeBase::queryString (const std::any& params, bool encodeKeys,
                                       bool encodeValues, bool arrayRepeat,
                                       const std::any& sortKeys) {
    std::vector<std::pair<std::string, std::string>> pairs;
    qsAppend (pairs, std::string (), params, arrayRepeat);
    if (isTrue (sortKeys)) {
        std::stable_sort (pairs.begin (), pairs.end (),
                          [] (const auto& a, const auto& b) { return a.first < b.first; });
    }
    std::string out;
    for (const auto& kv : pairs) {
        if (!out.empty ()) {
            out += "&";
        }
        out += encodeKeys ? str (this->encodeURIComponent (std::any (kv.first))) : kv.first;
        out += "=";
        out += encodeValues ? str (this->encodeURIComponent (std::any (kv.second))) : kv.second;
    }
    return out;
}

// ---------------------------------------------------------------------------
// time
// ---------------------------------------------------------------------------

std::any ExchangeBase::milliseconds () { return getCurrentTimestamp (); }

std::any ExchangeBase::microseconds () {
    // TS microseconds(): Date.now() * 1000 — microseconds since the epoch
    return std::any (toLong (getCurrentTimestamp ()) * 1000);
}

std::any ExchangeBase::seconds () {
    return std::any (static_cast<long long> (toLong (getCurrentTimestamp ()) / 1000));
}

std::any ExchangeBase::iso8601 (std::any timestamp) {
    long long ms = 0;
    if (isNum (timestamp)) {
        ms = static_cast<long long> (std::floor (toDouble (timestamp)));
    } else if (isStr (timestamp)) {
        // only plain-integer strings are accepted, e.g. "1755432123456"
        const std::string text = std::any_cast<std::string> (timestamp);
        if (text.empty ()) {
            return std::any {};
        }
        for (char c : text) {
            if (!std::isdigit (static_cast<unsigned char> (c))) {
                return std::any {};
            }
        }
        try {
            ms = std::stoll (text);
        } catch (const std::exception&) {
            return std::any {};
        }
    } else {
        return std::any {};
    }
    // TS rejects negatives outright, and anything past the Date range. Without the
    // negative guard the millisecond field came out as ".-01" (C++ % truncates toward
    // zero), producing strings like "1970-01-01T00:00:00.-01Z".
    if (ms < 0 || ms > 8640000000000000LL) {
        return std::any {};
    }
    const std::time_t whole = static_cast<std::time_t> (ms / 1000);
    std::tm utc {};
    gmtime_r (&whole, &utc);
    char buffer[64];
    std::snprintf (buffer, sizeof (buffer), "%04d-%02d-%02dT%02d:%02d:%02d.%03lldZ",
                   utc.tm_year + 1900, utc.tm_mon + 1, utc.tm_mday,
                   utc.tm_hour, utc.tm_min, utc.tm_sec, ms % 1000);
    return std::any (std::string (buffer));
}

std::any ExchangeBase::parseTimeframe (std::any timeframe) {
    const std::string value = str (timeframe);
    if (value.empty ()) {
        return std::any {};
    }
    const char unit = value.back ();
    long long amount = 0;
    try {
        amount = std::stoll (value.substr (0, value.size () - 1));
    } catch (const std::exception&) {
        return std::any {};
    }
    switch (unit) {
    case 'y': return std::any (amount * 31536000LL);
    case 'M': return std::any (amount * 2592000LL);
    case 'w': return std::any (amount * 604800LL);
    case 'd': return std::any (amount * 86400LL);
    case 'h': return std::any (amount * 3600LL);
    case 'm': return std::any (amount * 60LL);
    case 's': return std::any (amount);
    default:  return std::any {};
    }
}

// Accepts the ISO-8601 shapes ccxt sees, and only those: TS delegates to Date.parse
// but guards it first, rejecting bare digit strings and anything without both a dash
// and a colon. A naive datetime (no zone, no trailing Z) is read as UTC, which is what
// the `(x + 'Z')` fallback in the TS does.
std::any ExchangeBase::parse8601 (std::any datetime) {
    if (!isStr (datetime)) {
        return std::any {};
    }
    const std::string text = std::any_cast<std::string> (datetime);
    if (text.empty ()) {
        return std::any {};
    }
    bool allDigits = true;
    for (char c : text) {
        if (!std::isdigit (static_cast<unsigned char> (c))) {
            allDigits = false;
            break;
        }
    }
    // a numeric string is a timestamp, not a date
    if (allDigits) {
        return std::any {};
    }
    if (text.find ('-') == std::string::npos || text.find (':') == std::string::npos) {
        return std::any {};
    }
    int year = 0, month = 0, day = 0, hour = 0, minute = 0, second = 0;
    // the date/time separator is 'T' in ISO form and a space in the loose form ccxt
    // also accepts ("2019-08-12 13:22:08")
    if (std::sscanf (text.c_str (), "%4d-%2d-%2dT%2d:%2d:%2d",
                     &year, &month, &day, &hour, &minute, &second) != 6 &&
        std::sscanf (text.c_str (), "%4d-%2d-%2d %2d:%2d:%2d",
                     &year, &month, &day, &hour, &minute, &second) != 6) {
        return std::any {};
    }
    long long millis = 0;
    const std::size_t dot = text.find ('.');
    if (dot != std::string::npos) {
        std::string fraction;
        for (std::size_t i = dot + 1; i < text.size () && std::isdigit (static_cast<unsigned char> (text[i])); i++) {
            fraction += text[i];
        }
        fraction.resize (3, '0');   // milliseconds, truncating anything finer
        try {
            millis = std::stoll (fraction);
        } catch (const std::exception&) {
            millis = 0;
        }
    }
    std::tm utc {};
    utc.tm_year = year - 1900;
    utc.tm_mon = month - 1;
    utc.tm_mday = day;
    utc.tm_hour = hour;
    utc.tm_min = minute;
    utc.tm_sec = second;
    const std::time_t epoch = timegm (&utc);
    if (epoch == static_cast<std::time_t> (-1)) {
        return std::any {};
    }
    long long result = static_cast<long long> (epoch) * 1000LL + millis;
    // an explicit offset shifts the result back to UTC
    const std::size_t timeAt = text.find (':');
    const std::size_t plus = text.find ('+', timeAt);
    std::size_t minus = std::string::npos;
    for (std::size_t i = timeAt; i < text.size (); i++) {
        if (text[i] == '-') {
            minus = i;
            break;
        }
    }
    const std::size_t offsetAt = (plus != std::string::npos) ? plus : minus;
    if (offsetAt != std::string::npos) {
        int offsetHours = 0, offsetMinutes = 0;
        if (std::sscanf (text.c_str () + offsetAt + 1, "%2d:%2d", &offsetHours, &offsetMinutes) >= 1) {
            const long long offsetMs = (offsetHours * 3600LL + offsetMinutes * 60LL) * 1000LL;
            result += (text[offsetAt] == '+') ? -offsetMs : offsetMs;
        }
    }
    return std::any (result);
}

std::any ExchangeBase::roundTimeframe (std::any timeframe, std::any timestamp, std::any direction) {
    const std::any parsed = this->parseTimeframe (timeframe);
    if (!parsed.has_value () || !timestamp.has_value ()) {
        return std::any {};
    }
    const long long ms = toLong (parsed) * 1000LL;
    if (ms == 0) {
        return std::any {};
    }
    const long long value = toLong (timestamp);
    const long long offset = value % ms;
    // TS defaults the direction to ROUND_DOWN and adds a whole period for ROUND_UP
    const bool roundUp = direction.has_value () && isEqual (direction, ROUND_UP);
    return std::any (value - offset + (roundUp ? ms : 0));
}

std::shared_future<std::any> ExchangeBase::sleep (std::any ms) {
    const long long duration = toLong (ms);
    // sleep keeps launch::async: the whole point is that time passes, and a
    // deferred body would not start until someone awaited it
    return std::async (std::launch::async, [duration] () -> std::any {
        std::this_thread::sleep_for (std::chrono::milliseconds (duration));
        return std::any {};
    }).share ();
}

// ---------------------------------------------------------------------------
// logging and plumbing
// ---------------------------------------------------------------------------

std::any ExchangeBase::log (std::any value) {
    std::cout << serialise (value) << std::endl;
    return std::any {};
}

std::any ExchangeBase::createSafeDictionary (std::any) { return std::any (dict {}); }
std::any ExchangeBase::mapToSafeMap (std::any value) { return value; }
std::any ExchangeBase::initThrottler () { return std::any {}; }
std::any ExchangeBase::addFetchCache (std::any, std::any) { return std::any {}; }
std::any ExchangeBase::setLastRequest (std::any) { return std::any {}; }
std::any ExchangeBase::setLastRestRequestTimestamp (std::any) { return std::any {}; }
std::any ExchangeBase::storeArray (std::any target, std::any) { return target; }
std::any ExchangeBase::resolve (std::any value, std::any) { return value; }
std::any ExchangeBase::reject (std::any value, std::any) { return value; }

std::shared_future<std::any> ExchangeBase::throttle (std::any) {
    return std::async (std::launch::deferred, [] () -> std::any { return std::any {}; }).share ();
}

// ---------------------------------------------------------------------------
// network — deliberately unimplemented in iteration 1
// ---------------------------------------------------------------------------

std::shared_future<std::any> ExchangeBase::fetch (std::any url, std::any method,
                                                  std::any headers, std::any body) {
    // Record what sign() built BEFORE failing. The static request tests assert on
    // exactly this -- they never want the response, only the request -- so throwing
    // first would make every fixture unverifiable rather than merely unsent.
    this->last_request_url = url;
    this->last_request_body = body;
    this->last_request_headers = headers;
    const std::string target = str (url);
    const std::string verb = method.has_value () ? str (method) : std::string ("GET");
    if (this->fetchImpl) {
        const auto impl = this->fetchImpl;
        return std::async (std::launch::deferred,
                           [impl, url, method, headers, body] () -> std::any {
            return impl (url, method, headers, body);
        }).share ();
    }
    // Real transport. Mirrors ts/src/base/Exchange.ts fetch()/handleRestResponse():
    // merge default headers -> libcurl -> onRestResponse -> parseJson -> handleErrors
    // -> handleHttpStatusCode -> parsed body (or raw text when it is not JSON).
    return std::async (std::launch::deferred, [this, target, verb, url, method, headers, body] () -> std::any {
        if (!this->headers.has_value ()) {
            this->headers = dict {
                { std::string ("User-Agent"),
                  std::string ("ccxt-cpp/0.1.0 (+https://github.com/ccxt/ccxt)") },
            };
        }
        std::any merged = headers;
        if (this->headers.has_value () && isDict (this->headers)) {
            if (headers.has_value () && isDict (headers)) {
                merged = this->deepExtend (this->headers, headers);
            } else {
                merged = this->headers;
            }
        }

        CURL* curl = curl_easy_init ();
        if (!curl) {
            throw NetworkError (this->id.has_value () ? str (this->id) : std::string ("ccxt")
                                + " " + verb + " " + target + " curl_easy_init failed");
        }

        curl_easy_setopt (curl, CURLOPT_URL, target.c_str ());
        curl_easy_setopt (curl, CURLOPT_FOLLOWLOCATION, 1L);
        curl_easy_setopt (curl, CURLOPT_ACCEPT_ENCODING, "");   // enable gzip/deflate
        curl_easy_setopt (curl, CURLOPT_NOSIGNAL, 1L);

        const long long timeoutMs = this->timeout.has_value ()
            ? std::max (1000LL, toLong (this->timeout)) : 10000LL;
        curl_easy_setopt (curl, CURLOPT_TIMEOUT_MS, timeoutMs);

        // honour the standard proxy environment variables, then the exchange
        // options (httpProxy/httpsProxy) — the static test harness relies on the
        // latter: initOfflineExchange installs a deliberately unreachable proxy so
        // request tests fail with InvalidProxySettings instead of hitting the
        // network (see the "proxy 2 times" comment in ts/src/test/tests.ts).
        bool proxyApplied = false;
        std::string proxyValue;
        if (this->options.has_value () && isDict (this->options)) {
            const auto& opts = std::any_cast<dict> (this->options);
            const auto pick = [&opts] (const char* key) -> std::string {
                if (opts.has (std::string (key))) {
                    const std::any v = opts.get (std::string (key));
                    if (isStr (v)) {
                        return str (v);
                    }
                }
                return std::string {};
            };
            const bool httpsTarget = target.rfind ("https://", 0) == 0;
            proxyValue = httpsTarget ? (pick ("httpsProxy").empty () ? pick ("httpProxy") : pick ("httpsProxy"))
                                      : (pick ("httpProxy").empty () ? pick ("httpsProxy") : pick ("httpProxy"));
            if (!proxyValue.empty ()) {
                curl_easy_setopt (curl, CURLOPT_PROXY, proxyValue.c_str ());
                proxyApplied = true;
            }
        }
        if (!proxyApplied) {
            if (const char* p = std::getenv ("https_proxy")) { curl_easy_setopt (curl, CURLOPT_PROXY, p); }
            else if (const char* p2 = std::getenv ("http_proxy")) { curl_easy_setopt (curl, CURLOPT_PROXY, p2); }
        }

        if (verb == "GET") {
            curl_easy_setopt (curl, CURLOPT_HTTPGET, 1L);
        } else if (verb == "POST") {
            curl_easy_setopt (curl, CURLOPT_POST, 1L);
        } else {
            curl_easy_setopt (curl, CURLOPT_CUSTOMREQUEST, verb.c_str ());
        }

        struct curl_slist* hdrs = nullptr;
        if (merged.has_value () && isDict (merged)) {
            for (const auto& kv : std::any_cast<dict> (merged).entries ()) {
                hdrs = curl_slist_append (hdrs, (kv.first + ": " + str (kv.second)).c_str ());
            }
        }
        if (hdrs) {
            curl_easy_setopt (curl, CURLOPT_HTTPHEADER, hdrs);
        }

        std::string rawBody;
        if (body.has_value () && isStr (body)) {
            rawBody = str (body);
            curl_easy_setopt (curl, CURLOPT_POSTFIELDS, rawBody.c_str ());
            curl_easy_setopt (curl, CURLOPT_POSTFIELDSIZE, static_cast<long> (rawBody.size ()));
        }

        std::string out;
        curl_easy_setopt (curl, CURLOPT_WRITEFUNCTION, +[] (void* ptr, size_t size, size_t nmemb, void* userdata) -> size_t {
            static_cast<std::string*> (userdata)->append (static_cast<const char*> (ptr), size * nmemb);
            return size * nmemb;
        });
        curl_easy_setopt (curl, CURLOPT_WRITEDATA, &out);

        const CURLcode res = curl_easy_perform (curl);
        long status = 0;
        curl_easy_getinfo (curl, CURLINFO_RESPONSE_CODE, &status);
        if (hdrs) { curl_slist_free_all (hdrs); }
        curl_easy_cleanup (curl);

        if (res != CURLE_OK) {
            // A failing configured proxy is a proxy-settings error in ccxt's error
            // hierarchy (mirrors JS checkProxySettings/fetch), not a network error.
            if (proxyApplied) {
                throw InvalidProxySettings ((this->id.has_value () ? str (this->id) : std::string ("ccxt"))
                                            + " " + verb + " " + target + " via proxy " + proxyValue + " "
                                            + curl_easy_strerror (res));
            }
            throw NetworkError ((this->id.has_value () ? str (this->id) : std::string ("ccxt"))
                                + " " + verb + " " + target + " "
                                + curl_easy_strerror (res));
        }

        const std::any statusText = std::string ("OK");
        const std::any emptyHeaders = dict {};

        const std::any bodyText = this->onRestResponse (status, statusText, url, method,
                                                        emptyHeaders, out, headers, body);
        std::any parsed = std::any {};
        try {
            parsed = this->parseJson (bodyText);
        } catch (const std::exception&) {
            parsed = std::any {};
        }

        const std::any skip = this->handleErrors (status, statusText, url, method,
                                                  emptyHeaders, bodyText, parsed,
                                                  headers, body);
        if (!skip.has_value ()) {
            this->handleHttpStatusCode (status, statusText, url, method, out);
        }
        if (parsed.has_value () && !isTrue (isEqual (parsed, std::any {}))) {
            return parsed;
        }
        return out;
    }).share ();
}

// ---------------------------------------------------------------------------
// dynamic access — the transpiled test framework reads and writes members
// through these when the receiver is a std::any
// ---------------------------------------------------------------------------

std::any ExchangeBase::getProperty (const std::string& name) {
    if (name == "id") return this->id;
    if (name == "name") return this->name;
    if (name == "alias") return this->alias;
    if (name == "countries") return this->countries;
    if (name == "version") return this->version;
    if (name == "hostname") return this->hostname;
    if (name == "certified") return this->certified;
    if (name == "pro") return this->pro;
    if (name == "has") return this->has;
    if (name == "features") return this->features;
    if (name == "urls") return this->urls;
    if (name == "api") return this->api;
    if (name == "options") return this->options;
    if (name == "timeframes") return this->timeframes;
    if (name == "fees") return this->fees;
    if (name == "limits") return this->limits;
    if (name == "precision") return this->precision;
    if (name == "precisionMode") return this->precisionMode;
    if (name == "paddingMode") return this->paddingMode;
    if (name == "requiredCredentials") return this->requiredCredentials;
    if (name == "commonCurrencies") return this->commonCurrencies;
    if (name == "exceptions") return this->exceptions;
    if (name == "twofa") return this->twofa;
    if (name == "apiKey") return this->apiKey;
    if (name == "secret") return this->secret;
    if (name == "password") return this->password;
    if (name == "uid") return this->uid;
    if (name == "login") return this->login;
    if (name == "walletAddress") return this->walletAddress;
    if (name == "privateKey") return this->privateKey;
    if (name == "token") return this->token;
    if (name == "accountId") return this->accountId;
    if (name == "verbose") return this->verbose;
    if (name == "reduceFees") return this->reduceFees;
    if (name == "isSandboxModeEnabled") return this->isSandboxModeEnabled;
    if (name == "enableRateLimit") return this->enableRateLimit;
    if (name == "rateLimit") return this->rateLimit;
    if (name == "rateLimiterAlgorithm") return this->rateLimiterAlgorithm;
    if (name == "tokenBucket") return this->tokenBucket;
    if (name == "throttler") return this->throttler;
    if (name == "timeout") return this->timeout;
    if (name == "rollingWindowSize") return this->rollingWindowSize;
    if (name == "last_request_url") return this->last_request_url;
    if (name == "last_request_body") return this->last_request_body;
    if (name == "last_request_headers") return this->last_request_headers;
    if (name == "markets") return this->markets;
    if (name == "markets_by_id") return this->markets_by_id;
    if (name == "currencies") return this->currencies;
    if (name == "currencies_by_id") return this->currencies_by_id;
    if (name == "symbols") return this->symbols;
    if (name == "ids") return this->ids;
    if (name == "codes") return this->codes;
    if (name == "baseCurrencies") return this->baseCurrencies;
    if (name == "quoteCurrencies") return this->quoteCurrencies;
    if (name == "accounts") return this->accounts;
    if (name == "accountsById") return this->accountsById;
    if (name == "minFundingAddressLength") return this->minFundingAddressLength;
    if (name == "substituteCommonCurrencyCodes") return this->substituteCommonCurrencyCodes;
    if (name == "headers") return this->headers;
    if (name == "httpProxy") return this->httpProxy;
    if (name == "httpsProxy") return this->httpsProxy;
    if (name == "wsProxy") return this->wsProxy;
    if (name == "wssProxy") return this->wssProxy;
    if (name == "enableLastHttpResponse") return std::any (true);
    throw NotSupported ("getProperty: unknown member \"" + name + "\"");
}

std::any ExchangeBase::setProperty (const std::string& name, std::any value) {
    if (name == "id") { this->id = value; return value; }
    if (name == "alias") { this->alias = value; return value; }
    if (name == "hostname") { this->hostname = value; return value; }
    if (name == "urls") { this->urls = value; return value; }
    if (name == "api") { this->api = value; return value; }
    if (name == "options") { this->options = value; return value; }
    if (name == "apiKey") { this->apiKey = value; return value; }
    if (name == "secret") { this->secret = value; return value; }
    if (name == "password") { this->password = value; return value; }
    if (name == "uid") { this->uid = value; return value; }
    if (name == "walletAddress") { this->walletAddress = value; return value; }
    if (name == "privateKey") { this->privateKey = value; return value; }
    if (name == "accountId") { this->accountId = value; return value; }
    if (name == "accounts") { this->accounts = value; return value; }
    if (name == "currencies") { this->currencies = value; return value; }
    if (name == "markets") { this->markets = value; return value; }
    if (name == "symbols") { this->symbols = value; return value; }
    if (name == "timeout") { this->timeout = value; return value; }
    if (name == "httpProxy") { this->httpProxy = value; return value; }
    if (name == "httpsProxy") { this->httpsProxy = value; return value; }
    if (name == "wsProxy") { this->wsProxy = value; return value; }
    if (name == "wssProxy") { this->wssProxy = value; return value; }
    if (name == "verbose") { this->verbose = value; return value; }
    throw NotSupported ("setProperty: unknown member \"" + name + "\"");
}

std::any ExchangeBase::callDynamically (const std::string& name, std::any args) {
    // unified methods first: the generated per-exchange callMethod table. A name that
    // has already missed every table goes straight to the hand-written helper
    // registry below -- the miss scan is ~800 string comparisons plus an exception
    // throw/catch, which the test framework would otherwise pay per market per call.
    const bool knownMiss = [this, &name] () {
        std::lock_guard<std::mutex> guard (this->tableMissCacheMutex);
        return this->tableMissCache.count (name) > 0;
    } ();
    if (!knownMiss) {
        try {
            return this->callMethod (std::string (name), args.has_value () ? args : std::any (list {}));
        } catch (const DispatchMiss&) {
            // genuine table miss: record it and fall through to the helper registry
            {
                std::lock_guard<std::mutex> guard (this->tableMissCacheMutex);
                this->tableMissCache.insert (name);
            }
        }
        // any other exception is the dispatched method's own error (offline proxy,
        // NotSupported stub, exchange error): propagate it untouched -- falling through
        // here would mask it behind "no handler" and poison the cache
    }
    const auto& argv = isList (args) ? std::any_cast<list> (args).items () : std::vector<std::any> {};
    const std::any a0 = argv.size () > 0 ? argv[0] : std::any {};
    const std::any a1 = argv.size () > 1 ? argv[1] : std::any {};
    const std::any a2 = argv.size () > 2 ? argv[2] : std::any {};
    const std::any a3 = argv.size () > 3 ? argv[3] : std::any {};
    if (name == "safeValue") return this->safeValue (a0, a1, a2);
    if (name == "safeString") return this->safeString (a0, a1, a2);
    if (name == "safeStringUpper") return this->safeStringUpper (a0, a1, a2);
    if (name == "safeStringLower") return this->safeStringLower (a0, a1, a2);
    if (name == "safeInteger") return this->safeInteger (a0, a1, a2);
    if (name == "safeIntegerProduct") return this->safeIntegerProduct (a0, a1, a2, a3);
    if (name == "safeIntegerProduct2") return this->safeIntegerProduct2 (a0, a1, a2, a3);
    if (name == "safeNumber") return this->safeNumber (a0, a1, a2);
    if (name == "safeDict") return this->safeDict (a0, a1, a2);
    if (name == "safeList") return this->safeList (a0, a1, a2);
    if (name == "safeBool") return this->safeBool (a0, a1, a2);
    if (name == "deepExtend") return this->deepExtend (a0, a1);
    if (name == "extend") return this->extend (a0, a1);
    if (name == "extendExchangeOptions") return this->extendExchangeOptions (a0);
    if (name == "convertToSafeDictionary") return this->convertToSafeDictionary (a0);
    if (name == "json") return this->json (a0);
    if (name == "parseJson") return this->parseJson (a0);
    if (name == "inArray") return this->inArray (a0, a1);
    if (name == "indexBy") return this->indexBy (a0, a1);
    if (name == "filterBy") return this->filterBy (a0, a1, a2);
    if (name == "sortBy") return this->sortBy (a0, a1, a2);
    if (name == "sum") return this->sum (a0, a1, a2, a3);
    if (name == "numberToString") return this->numberToString (a0);
    if (name == "parseNumber") return this->parseNumber (a0, a1);
    if (name == "parseToInt") return this->parseToInt (a0);
    if (name == "parseToNumeric") return this->parseToNumeric (a0);
    if (name == "isDictionary") return isDict (a0);
    if (name == "isEmptyString") return this->isEmptyString (a0);
    if (name == "market") return this->market (a0);
    if (name == "marketId") return this->marketId (a0);
    if (name == "currency") return this->currency (a0);
    if (name == "currencyId") return this->currencyId (a0);
    if (name == "iso8601") return this->iso8601 (a0);
    if (name == "milliseconds") return this->milliseconds ();
    if (name == "checkRequiredCredentials") return this->checkRequiredCredentials (a0);
    if (name == "setSandboxMode") { this->setSandboxMode (a0); return std::any {}; }
    if (name == "setMarkets") { this->setMarkets (a0, a1); return std::any {}; }
    if (name == "loadMarkets") return this->loadMarkets (a0);
    if (name == "sleep") return this->sleep (a0);
    if (name == "getCcxtVersion") return this->getCcxtVersion ();
    if (name == "fetch") return this->fetch (a0, a1, a2, a3);
    // No dynamic handler at all -- the only way here is a cached DispatchMiss that the
    // helper registry also does not cover.
    throw NotSupported ("callDynamically: no handler for \"" + name + "\"");
}

std::any ExchangeBase::handleErrors (std::any, std::any, std::any, std::any,
                                     std::any, std::any, std::any, std::any,
                                     std::any) {
    return std::any {};   // no-op default; per-exchange overrides throw
}

std::any ExchangeBase::handleHttpStatusCode (std::any code, std::any reason,
                                             std::any url, std::any method,
                                             std::any body) {
    if (!code.has_value ()) {
        return std::any {};
    }
    const long long status = toLong (code);
    if (status < 400) {
        return std::any {};
    }
    const std::string message = (this->id.has_value () ? str (this->id) : std::string ("ccxt"))
        + " " + str (method) + " " + str (url) + " " + std::to_string (status)
        + " " + str (reason) + " " + str (body);
    switch (status) {
    case 422: throw ExchangeError (message);
    case 418: throw DDoSProtection (message);
    case 429: throw RateLimitExceeded (message);
    case 404: case 409: case 410: case 451: case 500: case 501:
    case 502: case 503: case 520: case 521: case 522: case 525:
    case 526: case 400: case 403: case 405: case 530:
        throw ExchangeNotAvailable (message);
    case 408: case 504: throw RequestTimeout (message);
    case 401: case 407: case 511: throw AuthenticationError (message);
    default:
        if (status >= 500) {
            throw ExchangeNotAvailable (message);
        }
        return std::any {};
    }
}

std::any ExchangeBase::onRestResponse (std::any, std::any, std::any, std::any,
                                       std::any, std::any responseBody,
                                       std::any, std::any) {
    // default: return the trimmed body text
    if (!responseBody.has_value () || !isStr (responseBody)) {
        return responseBody;
    }
    std::string text = str (responseBody);
    const auto first = text.find_first_not_of (" \t\r\n");
    if (first == std::string::npos) {
        return std::string ("");
    }
    const auto last = text.find_last_not_of (" \t\r\n");
    return text.substr (first, last - first + 1);
}

// ---------------------------------------------------------------------------
// handwritten helpers the transpiled test framework calls (ts/src/base/Exchange.ts)
// ---------------------------------------------------------------------------

std::any ExchangeBase::extendExchangeOptions (std::any newOptions) {
    this->options = this->extend (this->options, newOptions);
    return std::any {};
}

std::any ExchangeBase::convertToSafeDictionary (std::any value) {
    return value;
}

std::any ExchangeBase::getCcxtVersion () {
    return std::string ("4.4.79");   // kept in sync with the JS package version
}

// ---------------------------------------------------------------------------
// generated-surface no-ops
// ---------------------------------------------------------------------------
// The real definitions live in the generated Exchange.*.inc fragments (on the
// Exchange class); these exist only so the ExchangeBase vtable has an entry to
// bind. Everything reachable through an ExchangeBase* is a concrete Exchange, so
// these are never actually dispatched.

std::any ExchangeBase::safeNumber (std::any, std::any, std::any) {
    throw NotSupported ("safeNumber is generated, not on the C++ ExchangeBase");
}
std::any ExchangeBase::safeDict (std::any, std::any, std::any) {
    throw NotSupported ("safeDict is generated, not on the C++ ExchangeBase");
}
std::any ExchangeBase::safeList (std::any, std::any, std::any) {
    throw NotSupported ("safeList is generated, not on the C++ ExchangeBase");
}
std::any ExchangeBase::parseToInt (std::any) {
    throw NotSupported ("parseToInt is generated, not on the C++ ExchangeBase");
}
std::any ExchangeBase::parseToNumeric (std::any) {
    throw NotSupported ("parseToNumeric is generated, not on the C++ ExchangeBase");
}
std::any ExchangeBase::market (std::any) {
    throw NotSupported ("market is generated, not on the C++ ExchangeBase");
}
std::any ExchangeBase::marketId (std::any) {
    throw NotSupported ("marketId is generated, not on the C++ ExchangeBase");
}
std::any ExchangeBase::currency (std::any) {
    throw NotSupported ("currency is generated, not on the C++ ExchangeBase");
}
std::any ExchangeBase::currencyId (std::any) {
    throw NotSupported ("currencyId is generated, not on the C++ ExchangeBase");
}
std::any ExchangeBase::checkRequiredCredentials (std::any) {
    throw NotSupported ("checkRequiredCredentials is generated, not on the C++ ExchangeBase");
}
std::any ExchangeBase::setMarkets (std::any, std::any) {
    throw NotSupported ("setMarkets is generated, not on the C++ ExchangeBase");
}
void ExchangeBase::setSandboxMode (std::any) {
    throw NotSupported ("setSandboxMode is generated, not on the C++ ExchangeBase");
}
std::any ExchangeBase::isEmptyString (std::any) {
    throw NotSupported ("isEmptyString is generated, not on the C++ ExchangeBase");
}

// ---------------------------------------------------------------------------
// binary, crypto and date formatting
// ---------------------------------------------------------------------------

namespace {

// Generated code hands binary around as std::any; it may hold real bytes or, on the
// paths that have not been converted yet, a std::string of raw octets.
bytes asBytes (const std::any& v) {
    if (isBytes (v)) {
        return std::any_cast<bytes> (v);
    }
    return bytes (str (v));
}

} // namespace

std::any ExchangeBase::encode (std::any value) { return std::any (encodeUtf8 (str (value))); }

std::any ExchangeBase::decode (std::any value) { return std::any (decodeUtf8 (asBytes (value))); }

std::any ExchangeBase::base16ToBinary (std::any value) { return std::any (fromBase16 (str (value))); }

std::any ExchangeBase::binaryToBase64 (std::any value) { return std::any (toBase64 (asBytes (value))); }

std::any ExchangeBase::base58ToBinary (std::any value) { return std::any (fromBase58 (str (value))); }

std::any ExchangeBase::binaryToBase58 (std::any value) { return std::any (toBase58 (asBytes (value))); }

std::any ExchangeBase::binaryConcat (std::any a, std::any b, std::any c, std::any d,
                                     std::any e, std::any f, std::any g) {
    // TS binaryConcat = concatBytes -- variadic byte concatenation, including the
    // zero-arg call hibachi uses to initialise an empty byte array. The C++ runtime
    // models binaries as `bytes`; non-set parts (std::any{}) are skipped.
    std::vector<unsigned char> out;
    for (const std::any& part : { a, b, c, d, e, f, g }) {
        if (!part.has_value ()) {
            continue;
        }
        const std::vector<unsigned char>& tail = asBytes (part).data ();
        out.insert (out.end (), tail.begin (), tail.end ());
    }
    return std::any (bytes (std::move (out)));
}

std::any ExchangeBase::binaryLength (std::any value) {
    return std::any (static_cast<long long> (asBytes (value).size ()));
}

std::any ExchangeBase::isBinaryMessage (std::any value) { return std::any (isBytes (value)); }

std::any ExchangeBase::hash (std::any payload, std::any algorithm, std::any digest) {
    return hashBytes (asBytes (payload),
                      algorithm.has_value () ? str (algorithm) : std::string ("sha256"),
                      digest.has_value () ? str (digest) : std::string ("hex"));
}

std::any ExchangeBase::hmac (std::any payload, std::any key, std::any algorithm, std::any digest) {
    return hmacBytes (asBytes (payload), asBytes (key).toString (),
                      algorithm.has_value () ? str (algorithm) : std::string ("sha256"),
                      digest.has_value () ? str (digest) : std::string ("hex"));
}

std::any ExchangeBase::crc32 (std::any value, std::any signed32) {
    return std::any (crc32Of (str (value), isTrue (signed32)));
}

std::any ExchangeBase::rsa (std::any, std::any, std::any) {
    throw NotSupported ("rsa signing is not implemented in the C++ port yet; only hmac keys work");
}

std::any ExchangeBase::eddsa (std::any request, std::any secret, std::any curve) {
    // TS eddsa(request, secret, ed25519): request is the message bytes, secret is the
    // 32-byte seed (modetrade passes base58ToBinary(secret)); returns base64(signature).
    if (curve.has_value () && isStr (curve) && str (curve) != "ed25519") {
        throw NotSupported ("eddsa: only ed25519 is supported in the C++ port");
    }
    const bytes message = asBytes (request);
    bytes seed = asBytes (secret);
    if (seed.size () > 32 && isStr (secret)) {
        // the generated call passed a raw base58 seed string (revolutx privateKey);
        // noble handles <32-byte seeds by padding, and this runtime must not die on
        // the fixture's short "secretsecret" test key either
        seed = fromBase58 (str (secret));
        if (seed.size () > 32) {
            seed = bytes (std::vector<unsigned char> (seed.data ().begin (), seed.data ().begin () + 32));
        }
    }
    std::vector<unsigned char> seedBytes (seed.data ());
    if (seedBytes.size () < 32) {
        seedBytes.resize (32, 0);   // noble pads short seeds
    }
    if (seedBytes.size () != 32) {
        throw NotSupported ("eddsa: ed25519 secret must be at most 32 bytes, got " + std::to_string (seed.size ()));
    }
    EVP_PKEY* pkey = EVP_PKEY_new_raw_private_key (EVP_PKEY_ED25519, nullptr,
                                                   seedBytes.data (), seedBytes.size ());
    if (pkey == nullptr) {
        throw NotSupported ("eddsa: invalid ed25519 private key");
    }
    EVP_MD_CTX* mdctx = EVP_MD_CTX_new ();
    std::vector<unsigned char> signature (64);
    std::size_t signatureLength = signature.size ();
    const bool ok = mdctx != nullptr
        && EVP_DigestSignInit (mdctx, nullptr, nullptr, nullptr, pkey) == 1
        && EVP_DigestSign (mdctx, signature.data (), &signatureLength,
                           message.data ().data (), message.size ()) == 1;
    EVP_MD_CTX_free (mdctx);
    EVP_PKEY_free (pkey);
    if (!ok) {
        throw NotSupported ("eddsa: ed25519 signing failed");
    }
    signature.resize (signatureLength);
    return std::any (toBase64 (bytes (std::move (signature))));
}

std::any ExchangeBase::jwt (std::any data, std::any secretKey, std::any algorithm, std::any isRSA, std::any opts) {
    // ts/src/base/functions/rsa.ts jwt(): header {alg, typ, +opts}, payload = data,
    // base64url segments; signature HS (hmac), ES (ecdsa/p256), Ed (eddsa) or RS.
    const std::string hashName = algorithm.has_value () ? str (algorithm) : "sha256";
    if (hashName != "sha256" && hashName != "sha384" && hashName != "sha512") {
        throw NotSupported ("jwt: unsupported hash " + hashName);
    }
    const dict headerOpts = opts.has_value () && isDict (opts) ? std::any_cast<dict> (opts) : dict {};
    std::string alg = (isTrue (isRSA) ? "RS" : "HS") + hashName.substr (3);
    const std::any algOpt = headerOpts.get ("alg");
    if (algOpt.has_value ()) {
        alg = str (algOpt);
        for (char& c : alg) c = static_cast<char> (std::toupper (static_cast<unsigned char> (c)));
    }
    dict header;
    header.set ("alg", std::any (alg));
    header.set ("typ", std::any (std::string ("JWT")));
    for (const auto& kv : headerOpts.entries ()) {
        if (kv.first == "alg") {
            continue;
        }
        if (kv.first == "iat" && isDict (data)) {
            std::any_cast<dict> (data).set ("iat", kv.second);
            continue;
        }
        header.set (kv.first, kv.second);
    }
    const std::string encodedHeader = str (this->urlencodeBase64 (std::any (this->json (std::any (header)))));
    const std::string encodedData = str (this->urlencodeBase64 (std::any (this->json (data))));
    const std::string token = encodedHeader + "." + encodedData;
    std::string signature;
    if (alg.rfind ("HS", 0) == 0) {
        const std::any mac = this->hmac (std::any (token), secretKey, algorithm, std::any (std::string ("binary")));
        signature = str (this->urlencodeBase64 (mac));
    } else if (alg.rfind ("ED", 0) == 0) {
        // coinbase advanced-trade: secret is the base58 32-byte seed
        const std::any sig = this->eddsa (std::any (token), secretKey, std::any (std::string ("ed25519")));
        // base64 -> base64url: '+'->'-', '/'->'_', strip '='
        std::string b64url = str (sig);
        for (char& c : b64url) {
            if (c == '+') c = '-';
            else if (c == '/') c = '_';
        }
        while (!b64url.empty () && b64url.back () == '=') {
            b64url.pop_back ();
        }
        signature = b64url;
    } else {
        throw NotSupported ("jwt: algorithm " + alg + " is not implemented in the C++ port yet (only HS and EdDSA)");
    }
    return std::any (token + "." + signature);
}

// ccxt's uuid16/uuid22 are the uuid4 hex with the dashes removed, truncated
std::any ExchangeBase::uuid16 () {
    const std::string full = str (this->uuid ());
    std::string flat;
    for (char c : full) {
        if (c != '-') {
            flat += c;
        }
    }
    return std::any (flat.substr (0, 16));
}

std::any ExchangeBase::uuid22 () {
    const std::string full = str (this->uuid ());
    std::string flat;
    for (char c : full) {
        if (c != '-') {
            flat += c;
        }
    }
    return std::any (flat.substr (0, 22));
}

namespace {

// shared by the ymd family: UTC calendar parts of a ms timestamp
bool utcParts (const std::any& timestamp, std::tm& out) {
    if (!timestamp.has_value () || !isNum (timestamp)) {
        return false;
    }
    const std::time_t whole = static_cast<std::time_t> (toLong (timestamp) / 1000);
    gmtime_r (&whole, &out);
    return true;
}

} // namespace

std::any ExchangeBase::yymmdd (std::any timestamp, std::any infix) {
    std::tm utc {};
    if (!utcParts (timestamp, utc)) {
        return std::any {};
    }
    const std::string sep = infix.has_value () ? str (infix) : std::string ("");
    char buffer[32];
    std::snprintf (buffer, sizeof (buffer), "%02d%s%02d%s%02d",
                   (utc.tm_year + 1900) % 100, sep.c_str (),
                   utc.tm_mon + 1, sep.c_str (), utc.tm_mday);
    return std::any (std::string (buffer));
}

std::any ExchangeBase::yyyymmdd (std::any timestamp, std::any infix) {
    std::tm utc {};
    if (!utcParts (timestamp, utc)) {
        return std::any {};
    }
    const std::string sep = infix.has_value () ? str (infix) : std::string ("-");
    char buffer[32];
    std::snprintf (buffer, sizeof (buffer), "%04d%s%02d%s%02d",
                   utc.tm_year + 1900, sep.c_str (),
                   utc.tm_mon + 1, sep.c_str (), utc.tm_mday);
    return std::any (std::string (buffer));
}

std::any ExchangeBase::ymd (std::any timestamp, std::any infix) {
    return this->yyyymmdd (timestamp, infix.has_value () ? infix : std::any (std::string ("-")));
}

std::any ExchangeBase::ymdhms (std::any timestamp, std::any infix) {
    std::tm utc {};
    if (!utcParts (timestamp, utc)) {
        return std::any {};
    }
    const std::string sep = infix.has_value () ? str (infix) : std::string (" ");
    char buffer[64];
    std::snprintf (buffer, sizeof (buffer), "%04d-%02d-%02d%s%02d:%02d:%02d",
                   utc.tm_year + 1900, utc.tm_mon + 1, utc.tm_mday, sep.c_str (),
                   utc.tm_hour, utc.tm_min, utc.tm_sec);
    return std::any (std::string (buffer));
}

// Loading markets needs the HTTP layer, which this iteration stubs out. They exist so
// a derived exchange's generated override binds; calling one fails loudly.
std::any ExchangeBase::callMethod (std::any name, std::any) {
    throw DispatchMiss (str (name));
}

// The transpiler drops the TS bodies below (BigInt / zklink SDK), so they live here,
// exactly like their C# counterparts in cs/ccxt/base/Exchange.cs.

std::any ExchangeBase::randNumber (std::any size) {
    // TS: build a digit string, parseInt it. Return the number (double), matching the
    // call shape `toString(this->randNumber (12))` in the generated apex code.
    static std::mt19937 rng (std::random_device {} ());
    std::uniform_int_distribution<int> digit (0, 9);
    std::string number;
    const long long n = size.has_value () ? toLong (size) : 0;
    for (long long i = 0; i < n; i++) {
        number += static_cast<char> ('0' + digit (rng));
    }
    if (number.empty ()) {
        return std::any (0.0);
    }
    return std::any (std::stod (number));
}

std::any ExchangeBase::remove0xPrefix (std::any hexData) {
    if (!hexData.has_value () || !isStr (hexData)) {
        return hexData;
    }
    std::string s = std::any_cast<std::string> (hexData);
    if (s.size () >= 2 && s[0] == '0' && (s[1] == 'x' || s[1] == 'X')) {
        s.erase (0, 2);
    }
    return std::any (s);
}

std::shared_future<std::any> ExchangeBase::getZKContractSignatureObj (std::any, std::any) {
    // same contract as C# Exchange.cs: zklink is a node SDK that does not exist here
    return std::async (std::launch::deferred, [] () -> std::any {
        throw NotSupported ("Apex currently does not support create order in C++ language");
    }).share ();
}

std::shared_future<std::any> ExchangeBase::getZKTransferSignatureObj (std::any, std::any) {
    return std::async (std::launch::deferred, [] () -> std::any {
        throw NotSupported ("Apex currently does not support create order in C++ language");
    }).share ();
}

std::any ExchangeBase::intToBase16 (std::any number) {
    // TS: elem.toString(16) -- hex without the 0x prefix
    char buffer[32];
    std::snprintf (buffer, sizeof (buffer), "%llx", static_cast<unsigned long long> (toLong (number)));
    return std::any (std::string (buffer));
}

std::any ExchangeBase::exceptionMessage (std::any exc, std::any includeStack) {
    // TS: '[' + exc.constructor.name + '] ' + (includeStack ? exc.stack : exc.message),
    // truncated to 100000 chars. C++ has no stack traces; the type name + what() is
    // the faithful equivalent.
    (void) includeStack;
    std::string message;
    if (exc.type () == typeid (std::exception_ptr)) {
        try {
            std::rethrow_exception (std::any_cast<std::exception_ptr> (exc));
        } catch (const std::exception& e) {
            message = std::string ("[") + typeid (e).name () + "] " + e.what ();
        } catch (...) {
            message = "[unknown]";
        }
    } else if (exc.has_value ()) {
        message = str (exc);
    } else {
        message = "[undefined]";
    }
    const std::size_t length = std::min<std::size_t> (100000, message.length ());
    return std::any (message.substr (0, length));
}

std::any ExchangeBase::fixStringifiedJsonMembers (std::any content) {
    // TS: strip backslashes and the quotes around stringified nested JSON values
    // ("takeProfit":"{...}" -> "takeProfit":{...}), used by bingx.
    std::string s = str (content);
    std::string::size_type pos;
    while ((pos = s.find ('\\')) != std::string::npos) {
        s.erase (pos, 1);
    }
    pos = 0;
    while ((pos = s.find ("\"{", pos)) != std::string::npos) {
        s.replace (pos, 2, "{");
        pos += 1;
    }
    pos = 0;
    while ((pos = s.find ("}\"", pos)) != std::string::npos) {
        s.replace (pos, 2, "}");
        pos += 1;
    }
    return std::any (s);
}

std::any ExchangeBase::randomBytes (std::any size) {
    const long long n = size.has_value () ? toLong (size) : 0;
    if (n < 0) {
        throw ArgumentsRequired ("randomBytes size must be non-negative");
    }
    std::vector<unsigned char> buffer (static_cast<std::size_t> (n));
    if (n > 0 && RAND_bytes (buffer.data (), static_cast<int> (n)) != 1) {
        throw ExchangeError ("randomBytes: RAND_bytes failed");
    }
    return std::any (bytes (std::move (buffer)));
}

std::any ExchangeBase::uuid5 (std::any nspace, std::any name) {
    // TS: sha1(namespaceBytes ++ utf8(nameBytes)) with UUID-v5 version/variant bits
    std::string ns = nspace.has_value () ? str (nspace) : std::string ();
    std::string nsHex;
    for (char ch : ns) {
        if (ch != '-') {
            nsHex += ch;
        }
    }
    std::vector<unsigned char> data;
    for (std::size_t i = 0; i + 1 < nsHex.length (); i += 2) {
        data.push_back (static_cast<unsigned char> (std::stoul (nsHex.substr (i, 2), nullptr, 16)));
    }
    const std::string nameStr = name.has_value () ? str (name) : std::string ();
    data.insert (data.end (), nameStr.begin (), nameStr.end ());

    unsigned char digest[SHA_DIGEST_LENGTH];
    SHA1 (data.data (), data.size (), digest);
    digest[6] = static_cast<unsigned char> ((digest[6] & 0x0f) | 0x50);
    digest[8] = static_cast<unsigned char> ((digest[8] & 0x3f) | 0x80);

    char hex[33];
    for (int i = 0; i < 16; i++) {
        std::snprintf (hex + i * 2, 3, "%02x", digest[i]);
    }
    hex[32] = '\0';
    std::string h (hex);
    return std::any (h.substr (0, 8) + "-" + h.substr (8, 4) + "-" + h.substr (12, 4)
                     + "-" + h.substr (16, 4) + "-" + h.substr (20, 12));
}

std::any ExchangeBase::convertToBigInt (std::any value) {
    // TS BigInt(value): the value rides through as a numeric string and the
    // consumers (ethAbiEncode) parse it; no boxed bigint type exists in the port
    if (isStr (value)) {
        return std::any (str (value));
    }
    return value;
}

// forward decls: the EIP-712/ABI helpers in the anonymous namespace further down
namespace {
std::vector<unsigned char> hexDecode (const std::string& text);
std::vector<unsigned char> uintToBytes32 (long long value);
std::vector<unsigned char> intToBytes32 (long long value);
std::vector<unsigned char> anyToBigUint (const std::any& v);
std::vector<unsigned char> anyToBigInt (const std::any& v);
}

std::any ExchangeBase::ethAbiEncode (std::any typesAny, std::any argsAny) {
    // ethers.encode(types, args) over the static subset the exchanges use:
    // address / uintN / intN / bool / bytesN -- each argument one 32-byte word.
    if (!isList (typesAny) || !isList (argsAny)) {
        throw NotSupported ("ethAbiEncode: types and args must be arrays");
    }
    const auto& types = std::any_cast<list> (typesAny).items ();
    const auto& args = std::any_cast<list> (argsAny).items ();
    std::vector<unsigned char> out;
    for (std::size_t i = 0; i < types.size (); i++) {
        if (i >= args.size ()) {
            throw NotSupported ("ethAbiEncode: fewer args than types");
        }
        const std::string type = str (types[i]);
        const std::any& value = args[i];
        if (type == "address") {
            std::vector<unsigned char> word (32, 0);
            const std::vector<unsigned char> addr = hexDecode (str (value));
            if (addr.size () != 20) {
                throw NotSupported ("ethAbiEncode: address must be 20 bytes, got " + str (value));
            }
            std::copy (addr.begin (), addr.end (), word.begin () + 12);
            out.insert (out.end (), word.begin (), word.end ());
        } else if (type.rfind ("uint", 0) == 0 || type == "uint") {
            std::vector<unsigned char> word = anyToBigUint (value);
            out.insert (out.end (), word.begin (), word.end ());
        } else if (type.rfind ("int", 0) == 0 || type == "int") {
            std::vector<unsigned char> word = anyToBigInt (value);
            out.insert (out.end (), word.begin (), word.end ());
        } else if (type == "bool") {
            std::vector<unsigned char> word = uintToBytes32 (isTrue (value) ? 1 : 0);
            out.insert (out.end (), word.begin (), word.end ());
        } else if (type.rfind ("bytes", 0) == 0 && type != "bytes") {
            const std::size_t n = static_cast<std::size_t> (std::stoi (type.substr (5)));
            std::vector<unsigned char> word (32, 0);
            const std::vector<unsigned char> raw = hexDecode (str (value));
            std::copy (raw.begin (), raw.begin () + std::min (raw.size (), n), word.begin ());
            out.insert (out.end (), word.begin (), word.end ());
        } else {
            throw NotSupported ("ethAbiEncode: unsupported type '" + type + "'");
        }
    }
    return std::any (bytes (std::move (out)));
}

namespace {

// "0x..." (or bare hex) -> bytes; used by the EIP-712 field encoders
std::vector<unsigned char> hexDecode (const std::string& text) {
    std::string s = text;
    if (s.size () >= 2 && s[0] == '0' && (s[1] == 'x' || s[1] == 'X')) {
        s = s.substr (2);
    }
    std::vector<unsigned char> out;
    out.reserve (s.size () / 2);
    for (std::size_t i = 0; i + 1 < s.size (); i += 2) {
        const auto nib = [](char c) -> int {
            if (c >= '0' && c <= '9') return c - '0';
            if (c >= 'a' && c <= 'f') return c - 'a' + 10;
            if (c >= 'A' && c <= 'F') return c - 'A' + 10;
            return 0;
        };
        out.push_back (static_cast<unsigned char> ((nib (s[i]) << 4) | nib (s[i + 1])));
    }
    return out;
}

// integer -> 32-byte big-endian (unsigned). A double with no fractional part is
// converted exactly like the JS number ccxt passes through ethers.
std::vector<unsigned char> uintToBytes32 (long long value) {
    std::vector<unsigned char> out (32, 0);
    for (int i = 31; i >= 0; i--) {
        out[i] = static_cast<unsigned char> (value & 0xff);
        value >>= 8;
    }
    return out;
}

// two's complement, as ethers encodes intN
std::vector<unsigned char> intToBytes32 (long long value) {
    std::vector<unsigned char> result (32, value < 0 ? 0xff : 0x00);
    const uint64_t v = static_cast<uint64_t> (value);
    for (int i = 0; i < 8; i++) {
        result[31 - i] = static_cast<unsigned char> ((v >> (8 * i)) & 0xff);
    }
    return result;
}

long long anyToLong (const std::any& v) {
    if (!v.has_value ()) {
        return 0;
    }
    if (v.type () == typeid (long long)) {
        return std::any_cast<long long> (v);
    }
    if (v.type () == typeid (int)) {
        return std::any_cast<int> (v);
    }
    if (v.type () == typeid (long)) {
        return std::any_cast<long> (v);
    }
    if (v.type () == typeid (double)) {
        return static_cast<long long> (std::any_cast<double> (v));
    }
    if (v.type () == typeid (bool)) {
        return std::any_cast<bool> (v) ? 1 : 0;
    }
    // fall back to a numeric string (Precise strings, big chainIds)
    return static_cast<long long> (std::stoll (::str (v)));
}

// 256-bit unsigned integer as a 32-byte big-endian vector. Handles any numeric value
// the exchanges pass (double, integral types) plus decimal strings wider than 64 bits
// (repeated mod-256 on the decimal digits).
std::vector<unsigned char> anyToBigUint (const std::any& v) {
    if (!v.has_value ()) {
        return std::vector<unsigned char> (32, 0);
    }
    if (isStr (v)) {
        const std::string s = ::str (v);
        // strip sign and fraction, if any
        std::string digits;
        for (char c : s) {
            if (c >= '0' && c <= '9') {
                digits += c;
            } else if (c == '-' || c == '.' || c == 'e' || c == 'E') {
                if (c == '-') {
                    digits.clear ();   // negative unsigned is caller error; encode as 0-ish
                }
            }
        }
        std::vector<unsigned char> out (32, 0);
        // repeated division by 256 on the decimal string
        int pos = 31;
        while (!digits.empty () && digits != "0") {
            int carry = 0;
            std::string next;
            bool leading = true;
            for (char c : digits) {
                const int cur = carry * 10 + (c - '0');
                const int q = cur / 256;
                carry = cur % 256;
                if (!(leading && q == 0)) {
                    next += static_cast<char> ('0' + q);
                    leading = false;
                }
            }
            if (pos < 0) {
                break;   // wider than 256 bits: truncate like a uint256 cast
            }
            out[pos--] = static_cast<unsigned char> (carry);
            digits = next.empty () ? std::string ("0") : next;
        }
        return out;
    }
    return uintToBytes32 (anyToLong (v));
}

// signed arbitrary-precision integer as 32-byte two's complement. Handles negative
// decimal strings (nado sells: Precise.stringMul(x, '-1') = "-27544000000000000000000")
// and positive values wider than 64 bits (int128).
std::vector<unsigned char> anyToBigInt (const std::any& v) {
    std::vector<unsigned char> magnitude (32, 0);
    if (v.has_value () && isStr (v)) {
        std::string s = ::str (v);
        bool negative = false;
        std::string digits;
        for (char c : s) {
            if (c == '-') {
                negative = !negative;
            } else if (c >= '0' && c <= '9') {
                digits += c;
            }
        }
        int pos = 31;
        while (!digits.empty () && digits != "0") {
            int carry = 0;
            std::string next;
            bool leading = true;
            for (char c : digits) {
                const int cur = carry * 10 + (c - '0');
                const int q = cur / 256;
                carry = cur % 256;
                if (!(leading && q == 0)) {
                    next += static_cast<char> ('0' + q);
                    leading = false;
                }
            }
            if (pos < 0) {
                break;
            }
            magnitude[pos--] = static_cast<unsigned char> (carry);
            digits = next.empty () ? std::string ("0") : next;
        }
        if (negative) {
            // two's complement: invert all bytes, then add one
            for (unsigned char& b : magnitude) {
                b = static_cast<unsigned char> (~b);
            }
            int carry = 1;
            for (int i = 31; i >= 0 && carry; i--) {
                const int sum = magnitude[i] + 1;
                magnitude[i] = static_cast<unsigned char> (sum & 0xff);
                carry = sum >> 8;
            }
        }
        return magnitude;
    }
    return intToBytes32 (anyToLong (v));
}

} // namespace

// EIP-712 typed-data encoding: flat structs, struct references and arrays of structs
// (grvt's OrderLeg[]), mirroring ethers' TypedDataEncoder.encode(domain, types, value):
// keccak256("0x1901" + hashStruct(EIP712Domain) + hashStruct(primaryType)). Domain field
// types are the canonical EIP712Domain list filtered to the fields present in the dict.
std::any ExchangeBase::ethEncodeStructuredData (std::any domainAny, std::any messageTypesAny, std::any messageDataAny) {
    if (!isDict (domainAny) || !isDict (messageTypesAny) || !isDict (messageDataAny)) {
        throw NotSupported ("ethEncodeStructuredData: domain, messageTypes and message must be objects");
    }
    const dict domain = std::any_cast<dict> (domainAny);
    const dict messageTypes = std::any_cast<dict> (messageTypesAny);
    const dict messageData = std::any_cast<dict> (messageDataAny);
    if (messageTypes.entries ().empty ()) {
        throw NotSupported ("ethEncodeStructuredData: empty messageTypes");
    }
    const std::string primaryType = messageTypes.entries ().front ().first;

    // -- the struct registry: name -> ordered field list ----------------------------
    using Fields = std::vector<std::pair<std::string, std::string>>;
    std::map<std::string, Fields> structs;
    const auto parseFields = [&](const std::any& fieldsAny) -> Fields {
        if (!isList (fieldsAny)) {
            throw NotSupported ("ethEncodeStructuredData: struct fields must be an array");
        }
        Fields fields;
        for (const auto& item : std::any_cast<list> (fieldsAny).items ()) {
            if (!isDict (item)) {
                throw NotSupported ("ethEncodeStructuredData: field descriptor must be an object");
            }
            const dict field = std::any_cast<dict> (item);
            fields.push_back ({::str (field.get ("name")), ::str (field.get ("type"))});
        }
        return fields;
    };
    for (const auto& kv : messageTypes.entries ()) {
        structs[kv.first] = parseFields (kv.second);
    }
    // canonical domain field order; types fixed per EIP-712 (ethers _Types.EIP712Domain)
    const Fields canonicalDomainFields = {
        {"name", "string"}, {"version", "string"}, {"chainId", "uint256"},
        {"verifyingContract", "address"}, {"salt", "bytes32"},
    };
    Fields presentDomainFields;
    for (const auto& field : canonicalDomainFields) {
        if (domain.has (field.first)) {
            presentDomainFields.push_back (field);
        }
    }
    structs["EIP712Domain"] = presentDomainFields;

    // -- atomic field encoding (32 bytes) -------------------------------------------
    const auto encodeAtomic = [&](const std::string& type, const std::any& value) -> std::vector<unsigned char> {
        if (type == "string") {
            return keccak256Bytes (::str (value)).data ();
        }
        if (type == "address") {
            std::vector<unsigned char> out (32, 0);
            const std::vector<unsigned char> addr = hexDecode (::str (value));
            if (addr.size () != 20) {
                throw NotSupported ("ethEncodeStructuredData: address must be 20 bytes, got " + ::str (value));
            }
            std::copy (addr.begin (), addr.end (), out.begin () + 12);
            return out;
        }
        if (type == "bool") {
            return uintToBytes32 (isTrue (value) ? 1 : 0);
        }
        if (type.rfind ("bytes", 0) == 0 && type != "bytes") {
            const std::size_t n = static_cast<std::size_t> (std::stoi (type.substr (5)));
            std::vector<unsigned char> out (32, 0);
            const std::vector<unsigned char> raw = hexDecode (::str (value));
            std::copy (raw.begin (), raw.begin () + std::min (raw.size (), n), out.begin ());
            return out;
        }
        if (type.rfind ("uint", 0) == 0) {
            if (std::stoi (type.substr (4)) > 256) {
                throw NotSupported ("ethEncodeStructuredData: " + type + " wider than 256 bits is not supported");
            }
            return anyToBigUint (value);
        }
        if (type.rfind ("int", 0) == 0) {
            if (std::stoi (type.substr (3)) > 256) {
                throw NotSupported ("ethEncodeStructuredData: " + type + " wider than 256 bits is not supported");
            }
            return anyToBigInt (value);
        }
        throw NotSupported ("ethEncodeStructuredData: unsupported field type '" + type + "'");
    };

    // strip array suffixes: "OrderLeg[]" -> "OrderLeg", "OrderLeg[3]" -> "OrderLeg"
    const auto arrayBase = [](const std::string& type) -> std::pair<std::string, bool> {
        const std::size_t bracket = type.rfind ('[');
        if (bracket != std::string::npos && type.back () == ']') {
            return {type.substr (0, bracket), true};
        }
        return {type, false};
    };

    // -- recursive encoders ---------------------------------------------------------
    std::function<std::string (const std::string&)> encodeType;
    std::function<std::vector<unsigned char> (const std::string&, const std::any&)> hashStruct;
    std::function<std::vector<unsigned char> (const std::string&, const std::any&)> encodeData;

    // ethers' getDependencies: every referenced struct, recursively, sorted by name,
    // with the primary type itself excluded from the dependency tail
    encodeType = [&](const std::string& name) -> std::string {
        std::set<std::string> deps;
        std::function<void (const std::string&)> collect = [&](const std::string& current) {
            const auto it = structs.find (current);
            if (it == structs.end ()) {
                return;
            }
            for (const auto& field : it->second) {
                const auto base = arrayBase (field.second);
                if (structs.count (base.first) && base.first != name) {
                    if (deps.insert (base.first).second) {
                        collect (base.first);
                    }
                }
            }
        };
        collect (name);
        std::string typeString = name + "(";
        for (std::size_t i = 0; i < structs[name].size (); i++) {
            if (i > 0) {
                typeString += ",";
            }
            typeString += structs[name][i].second + " " + structs[name][i].first;
        }
        typeString += ")";
        for (const std::string& dep : deps) {
            typeString += dep + "(";
            for (std::size_t i = 0; i < structs[dep].size (); i++) {
                if (i > 0) {
                    typeString += ",";
                }
                typeString += structs[dep][i].second + " " + structs[dep][i].first;
            }
            typeString += ")";
        }
        return typeString;
    };

    encodeData = [&](const std::string& name, const std::any& value) -> std::vector<unsigned char> {
        const auto it = structs.find (name);
        if (it == structs.end ()) {
            throw NotSupported ("ethEncodeStructuredData: unknown struct '" + name + "'");
        }
        const auto& fields = it->second;
        std::vector<unsigned char> out;
        for (const auto& field : fields) {
            std::any fieldValue = isDict (value) ? std::any_cast<dict> (value).get (field.first) : std::any {};
            const auto base = arrayBase (field.second);
            std::vector<unsigned char> part;
            if (base.second) {
                // array: keccak256 over the concatenated element encodings (structs are
                // fully field-encoded per EIP-712, atomics are 32-byte encoded)
                std::vector<unsigned char> concat;
                if (isList (fieldValue)) {
                    for (const auto& item : std::any_cast<list> (fieldValue).items ()) {
                        std::vector<unsigned char> elem = structs.count (base.first)
                            ? encodeData (base.first, item)
                            : encodeAtomic (base.first, item);
                        concat.insert (concat.end (), elem.begin (), elem.end ());
                    }
                }
                part = keccak256Bytes (bytes (concat)).data ();
            } else if (structs.count (base.first)) {
                part = hashStruct (base.first, fieldValue);
            } else {
                part = encodeAtomic (base.first, fieldValue);
            }
            out.insert (out.end (), part.begin (), part.end ());
        }
        return out;
    };

    hashStruct = [&](const std::string& name, const std::any& value) -> std::vector<unsigned char> {
        std::vector<unsigned char> input = keccak256Bytes (encodeType (name)).data ();
        const std::vector<unsigned char> data = encodeData (name, value);
        input.insert (input.end (), data.begin (), data.end ());
        return keccak256Bytes (bytes (input)).data ();
    };

    // -- 0x1901 || domainSeparator || hashStruct(primary) ---------------------------
    const std::vector<unsigned char> domainSeparator =
        hashStruct ("EIP712Domain", std::any (domain));
    const std::vector<unsigned char> primaryHash =
        hashStruct (primaryType, std::any (messageData));
    std::vector<unsigned char> out = {0x19, 0x01};
    out.insert (out.end (), domainSeparator.begin (), domainSeparator.end ());
    out.insert (out.end (), primaryHash.begin (), primaryHash.end ());
    return std::any (bytes (std::move (out)));
}

std::any ExchangeBase::ethGetAddressFromPrivateKey (std::any privateKey) {
    // Ethereum address: keccak256(uncompressed secp256k1 pubkey[1..64])[12..32]
    std::string key = str (privateKey);
    if (key.size () >= 2 && key[0] == '0' && (key[1] == 'x' || key[1] == 'X')) {
        key = key.substr (2);
    }
    std::vector<unsigned char> priv (32, 0);
    for (std::size_t i = 0; i + 1 < key.size () && i / 2 < 32; i += 2) {
        const auto nib = [](char c) -> int {
            if (c >= '0' && c <= '9') return c - '0';
            if (c >= 'a' && c <= 'f') return c - 'a' + 10;
            if (c >= 'A' && c <= 'F') return c - 'A' + 10;
            return 0;
        };
        priv[i / 2] = static_cast<unsigned char> ((nib (key[i]) << 4) | nib (key[i + 1]));
    }
    EC_KEY* ec = EC_KEY_new_by_curve_name (NID_secp256k1);
    if (ec == nullptr) {
        throw NotSupported ("ethGetAddressFromPrivateKey: secp256k1 unavailable");
    }
    BIGNUM* bn = BN_bin2bn (priv.data (), static_cast<int> (priv.size ()), nullptr);
    if (bn == nullptr || EC_KEY_set_private_key (ec, bn) != 1) {
        BN_free (bn);
        EC_KEY_free (ec);
        throw NotSupported ("ethGetAddressFromPrivateKey: invalid private key");
    }
    const EC_GROUP* group = EC_KEY_get0_group (ec);
    EC_POINT* pub = EC_POINT_new (group);
    unsigned char pubBytes[65] = {0};
    if (pub == nullptr || EC_POINT_mul (group, pub, bn, nullptr, nullptr, nullptr) != 1
        || EC_POINT_point2oct (group, pub, POINT_CONVERSION_UNCOMPRESSED, pubBytes, sizeof (pubBytes), nullptr) != 65) {
        BN_free (bn);
        EC_POINT_free (pub);
        EC_KEY_free (ec);
        throw NotSupported ("ethGetAddressFromPrivateKey: public key derivation failed");
    }
    BN_free (bn);
    EC_POINT_free (pub);
    EC_KEY_free (ec);
    // keccak256 over pubkey bytes 1..64 (drop the 0x04 prefix)
    const std::vector<unsigned char> hash =
        keccak256Bytes (bytes (std::vector<unsigned char> (pubBytes + 1, pubBytes + 65))).data ();
    // last 20 bytes, checksummed like the TS ethGetAddressFromPrivateKey
    std::string address = "0x";
    for (int i = 12; i < 32; i++) {
        static const char* hexDigits = "0123456789abcdef";
        address += hexDigits[(hash[i] >> 4) & 0xf];
        address += hexDigits[hash[i] & 0xf];
    }
    return std::any (address);
}

std::any ExchangeBase::starknetEncodeStructuredData (std::any domain, std::any messageTypes, std::any messageData, std::any address) {
    if (!isDict (domain) || !isDict (messageTypes) || !isDict (messageData)) {
        throw NotSupported ("starknetEncodeStructuredData: domain, messageTypes and message must be objects");
    }
    return std::any (starkcrypto::messageHashLegacy (
        std::any_cast<dict> (messageTypes),
        std::any_cast<dict> (domain),
        std::any_cast<dict> (messageData),
        str (address)));
}

std::any ExchangeBase::retrieveStarkAccount (std::any signature, std::any accountClassHash, std::any accountProxyClassHash) {
    const std::string priv = starkcrypto::ethSigToPrivate (str (signature));
    const std::string pub = starkcrypto::getStarkKey (priv);
    const std::string address = starkcrypto::computeAccountAddress (
        str (accountClassHash), str (accountProxyClassHash), pub);
    dict out;
    out.set ("privateKey", std::any (priv));
    out.set ("publicKey", std::any (pub));
    out.set ("address", std::any (address));
    return std::any (out);
}

std::any ExchangeBase::starknetSign (std::any message, std::any privateKey) {
    const auto sig = starkcrypto::sign (str (message), str (privateKey));
    list out;
    out.push (std::any (sig.first));
    out.push (std::any (sig.second));
    return this->json (std::any (out));
}

// dydx protobuf signing: mirrors the C# Exchange.cs stubs verbatim

std::any ExchangeBase::encodeDydxTxForSigning (std::any, std::any, std::any, std::any, std::any, std::any) {
    throw NotSupported ("Dydx currently does not support create order / transfer asset in C++ language");
}

std::any ExchangeBase::encodeDydxTxForSimulation (std::any, std::any, std::any, std::any) {
    throw NotSupported ("Dydx currently does not support create order / transfer asset in C++ language");
}

std::any ExchangeBase::encodeDydxTxRaw (std::any, std::any) {
    throw NotSupported ("Dydx currently does not support create order / transfer asset in C++ language");
}

std::any ExchangeBase::retrieveDydxCredentials (std::any) {
    throw NotSupported ("Dydx currently does not support create order / transfer asset in C++ language");
}

std::shared_future<std::any> ExchangeBase::loadDydxProtos () {
    return std::async (std::launch::deferred, [] () -> std::any {
        throw NotSupported ("Dydx currently does not support create order / transfer asset in C++ language");
    }).share ();
}

std::any ExchangeBase::toDydxLong (std::any value) {
    // TS: BigInt(value).toString() -- string representation of an integral number
    return std::any (str (value));
}

std::any ExchangeBase::extendedStarknetSign (std::any, std::any) {
    throw NotSupported ("extendedStarknetSign requires starknet curve signing; not implemented in the C++ port yet");
}

std::any ExchangeBase::extendedStarknetComputePoseidonHashOnElements (std::any) {
    throw NotSupported ("extendedStarknetComputePoseidonHashOnElements requires starknet poseidon hashing; not implemented in the C++ port yet");
}

std::any ExchangeBase::extendedStarknetGetSelectorFromName (std::any) {
    throw NotSupported ("extendedStarknetGetSelectorFromName requires starknet hashing; not implemented in the C++ port yet");
}

std::any ExchangeBase::parseDate (std::any value) {
    // functions/time.ts parseDate: a GMT-prefixed string parses via Date.parse, anything
    // else goes through parse8601; non-strings yield undefined
    if (!isStr (value) || str (value).empty ()) {
        return std::any {};
    }
    const std::string x = std::any_cast<std::string> (value);
    if (x.find ("GMT") != std::string::npos) {
        // RFC 1123 form: "Tue, 22 Apr 2025 12:00:00 GMT"
        std::tm tm {};
        std::istringstream stream (x);
        stream >> std::get_time (&tm, "%a, %d %b %Y %H:%M:%S GMT");
        if (!stream.fail ()) {
            std::time_t epoch = timegm (&tm);
            return std::any (static_cast<double> (epoch) * 1000.0);
        }
        return std::any {};
    }
    return this->parse8601 (value);
}

// msgpack encoder (packb). Minimal, spec-conformant: nil/bool/int/float/str/bin/array/map.
// hyperliquid packs its action payloads with this before hashing; numbers arrive as
// JS doubles but msgpack-packing an integral double as float64 breaks hyperliquid's
// hashing, so integral values are encoded as int64 like the TS messagepack module does.
namespace {
    void putByte (std::vector<unsigned char>& out, unsigned char byte) {
        out.push_back (byte);
    }
    void putBigEndian64 (std::vector<unsigned char>& out, unsigned long long value) {
        for (int shift = 56; shift >= 0; shift -= 8) {
            out.push_back (static_cast<unsigned char> ((value >> shift) & 0xff));
        }
    }
    void putBigEndian32 (std::vector<unsigned char>& out, unsigned long value) {
        for (int shift = 24; shift >= 0; shift -= 8) {
            out.push_back (static_cast<unsigned char> ((value >> shift) & 0xff));
        }
    }
    void msgpackAppend (std::vector<unsigned char>& out, const std::any& value) {
        if (!value.has_value ()) {
            putByte (out, 0xc0);   // nil
            return;
        }
        if (isBool (value)) {
            putByte (out, std::any_cast<bool> (value) ? 0xc3 : 0xc2);
            return;
        }
        if (isNum (value)) {
            const double d = toDouble (value);
            if (d == std::floor (d) && d >= -9223372036854775808.0 && d <= 9223372036854775807.0) {
                const long long n = static_cast<long long> (d);
                if (n >= 0) {
                    putByte (out, 0xcf);
                } else {
                    putByte (out, 0xd3);
                }
                putBigEndian64 (out, static_cast<unsigned long long> (n));
            } else {
                putByte (out, 0xcb);   // float64
                const unsigned long long bits = [&d] () {
                    union { double f; unsigned long long u; } u;
                    u.f = d;
                    return u.u;
                } ();
                putBigEndian64 (out, bits);
            }
            return;
        }
        if (isStr (value)) {
            const std::string s = std::any_cast<std::string> (value);
            const std::size_t n = s.size ();
            if (n < 32) {
                putByte (out, static_cast<unsigned char> (0xa0 | n));
            } else if (n < 65536) {
                putByte (out, 0xda);
                putBigEndian32 (out, static_cast<unsigned long> (n) & 0xffff);
            } else {
                putByte (out, 0xdb);
                putBigEndian64 (out, static_cast<unsigned long long> (n));
            }
            out.insert (out.end (), s.begin (), s.end ());
            return;
        }
        if (isBytes (value)) {
            const std::vector<unsigned char> b = asBytes (value).data ();
            const std::size_t n = b.size ();
            if (n < 256) {
                putByte (out, 0xc4);
                putByte (out, static_cast<unsigned char> (n));
            } else if (n < 65536) {
                putByte (out, 0xc5);
                putBigEndian32 (out, static_cast<unsigned long> (n) & 0xffff);
            } else {
                putByte (out, 0xc6);
                putBigEndian64 (out, static_cast<unsigned long long> (n));
            }
            out.insert (out.end (), b.begin (), b.end ());
            return;
        }
        if (isList (value)) {
            const std::vector<std::any> items = std::any_cast<list> (value).items ();
            const std::size_t n = items.size ();
            if (n < 16) {
                putByte (out, static_cast<unsigned char> (0x90 | n));
            } else if (n < 65536) {
                putByte (out, 0xdc);
                putBigEndian32 (out, static_cast<unsigned long> (n) & 0xffff);
            } else {
                putByte (out, 0xdd);
                putBigEndian64 (out, static_cast<unsigned long long> (n));
            }
            for (const auto& item : items) {
                msgpackAppend (out, item);
            }
            return;
        }
        if (isDict (value)) {
            const std::vector<OrderedMap::entry> entries = std::any_cast<dict> (value).entries ();
            const std::size_t n = entries.size ();
            if (n < 16) {
                putByte (out, static_cast<unsigned char> (0x80 | n));
            } else if (n < 65536) {
                putByte (out, 0xde);
                putBigEndian32 (out, static_cast<unsigned long> (n) & 0xffff);
            } else {
                putByte (out, 0xdf);
                putBigEndian64 (out, static_cast<unsigned long long> (n));
            }
            for (const auto& kv : entries) {
                msgpackAppend (out, std::any (kv.first));
                msgpackAppend (out, kv.second);
            }
            return;
        }
        throw ExchangeError ("packb: cannot msgpack-serialize value of type " + std::string (value.type ().name ()));
    }
}   // namespace

std::any ExchangeBase::packb (std::any data) {
    std::vector<unsigned char> out;
    msgpackAppend (out, data);
    return std::any (bytes (std::move (out)));
}

std::any ExchangeBase::urlencodeBase64 (std::any data) {
    // base64url: standard base64 of the input bytes, drop '=' padding, '+'->'-', '/'->'_'
    static const char b64[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const bytes b = asBytes (data);
    const std::vector<unsigned char>& input = b.data ();
    std::string out;
    out.reserve ((input.size () + 2) / 3 * 4);
    for (std::size_t i = 0; i < input.size (); i += 3) {
        const std::size_t rem = input.size () - i;
        const unsigned int n = (static_cast<unsigned int> (input[i]) << 16)
            | (rem > 1 ? static_cast<unsigned int> (input[i + 1]) << 8 : 0)
            | (rem > 2 ? static_cast<unsigned int> (input[i + 2]) : 0);
        out += b64[(n >> 18) & 63];
        out += b64[(n >> 12) & 63];
        out += rem > 1 ? b64[(n >> 6) & 63] : '=';
        out += rem > 2 ? b64[n & 63] : '=';
    }
    while (!out.empty () && out.back () == '=') {
        out.pop_back ();
    }
    for (char& c : out) {
        if (c == '+') c = '-';
        else if (c == '/') c = '_';
    }
    return std::any (out);
}

// lighter signing: stubs until a lighter-native milestone (C# has real implementations
// in Exchange.Lighter.cs backed by the vendor .so)

#define LIGHTER_STUB_DEF(NAME) \
    std::any ExchangeBase::NAME (std::any, std::any, std::any, std::any, std::any) { \
        throw NotSupported (std::string (#NAME) + " requires the lighter native library; not implemented in the C++ port yet"); \
    }

LIGHTER_STUB_DEF (lighterCreateAuthToken)
LIGHTER_STUB_DEF (lighterCreateClient)
LIGHTER_STUB_DEF (lighterGenerateApiKey)
LIGHTER_STUB_DEF (lighterSignApproveIntegrator)
LIGHTER_STUB_DEF (lighterSignCancelAllOrders)
LIGHTER_STUB_DEF (lighterSignCancelOrder)
LIGHTER_STUB_DEF (lighterSignChangePubkey)
LIGHTER_STUB_DEF (lighterSignCreateGroupedOrders)
LIGHTER_STUB_DEF (lighterSignCreateOrder)
LIGHTER_STUB_DEF (lighterSignCreateSubAccount)
LIGHTER_STUB_DEF (lighterSignModifyOrder)
LIGHTER_STUB_DEF (lighterSignTransfer)
LIGHTER_STUB_DEF (lighterSignUpdateLeverage)
LIGHTER_STUB_DEF (lighterSignUpdateMargin)
LIGHTER_STUB_DEF (lighterSignWithdraw)
#undef LIGHTER_STUB_DEF

std::shared_future<std::any> ExchangeBase::loadLighterLibrary (std::any, std::any, std::any, std::any, std::any, std::any) {
    return std::async (std::launch::deferred, [] () -> std::any {
        throw NotSupported ("loadLighterLibrary requires the lighter native library; not implemented in the C++ port yet");
    }).share ();
}

std::shared_future<std::any> ExchangeBase::fetchMarkets (std::any) {
    // C# Exchange.fetchMarkets: the base returns this.markets as an array; the
    // generated per-exchange override does the real HTTP fetch.
    return std::async (std::launch::deferred, [this] () -> std::any {
        return this->toArray (this->markets);
    }).share ();
}

std::shared_future<std::any> ExchangeBase::fetchCurrencies (std::any) {
    // C# Exchange.fetchCurrencies: base returns this.currencies verbatim
    return std::async (std::launch::deferred, [this] () -> std::any {
        return this->currencies;
    }).share ();
}

std::shared_future<std::any> ExchangeBase::loadMarkets (std::any reload, std::any params) {
    // C# loadMarketsHelper semantics. The C# version caches the in-flight task
    // (marketsLoading); the C++ async model is deferred futures resolved on the
    // calling thread, so the mutex is enough to keep concurrent callers correct.
    return std::async (std::launch::deferred, [this, reload, params] () -> std::any {
        std::lock_guard<std::mutex> guard (this->loadMarketsMutex);
        if (!isTrue (reload) && isDict (this->markets)
            && (std::any_cast<dict> (this->markets).size () > 0)) {
            if (!this->markets_by_id.has_value ()) {
                return this->setMarkets (this->markets);
            }
            return this->markets;
        }
        std::any currenciesFetched;
        const std::any hasFetchCurrencies = this->safeValue (this->has, std::string ("fetchCurrencies"));
        if (isTrue (hasFetchCurrencies)) {
            currenciesFetched = awaitValue (this->fetchCurrencies ());
            if (isDict (this->options)) {
                std::any_cast<dict> (this->options).set ("cachedCurrencies", currenciesFetched);
            }
        }
        const std::any fetched = awaitValue (this->fetchMarkets (params));
        if (isDict (this->options)) {
            deleteKey (this->options, std::string ("cachedCurrencies"));
        }
        return this->setMarkets (fetched, currenciesFetched);
    }).share ();
}

// ---------------------------------------------------------------------------
// dynamic dispatch (D3)
// ---------------------------------------------------------------------------

std::any ExchangeBase::getProperty (ExchangeBase* self, std::any name) {
    // route through the instance-side property table (the full field surface);
    // checkRequiredCredentials() and the test harness read arbitrary members here.
    // TS returns undefined for a missing property -- mirror that, not a throw.
    try {
        return self->getProperty (str (name));
    } catch (const NotSupported&) {
        return std::any {};
    }
}

void ExchangeBase::setProperty (ExchangeBase* self, std::any name, std::any value) {
    // route through the instance-side property table (the full field surface);
    // silently dropping unknown keys here hid real harness writes (accountId, apiKey).
    // Unknown members stay a silent no-op, exactly like the TS free function.
    try {
        self->setProperty (str (name), value);
    } catch (const NotSupported&) {
        // TS would create an expando property; the C++ port has no bag for those
    }
}

std::any ExchangeBase::callDynamically (ExchangeBase*, std::any name, std::any) {
    // The pagination helpers and implicit-API dispatch reach here. Resolving them needs
    // the generated per-exchange method registry, which arrives with the api layer;
    // until then this is an explicit failure rather than a silent empty result.
    throw NotSupported ("dynamic dispatch to '" + str (name) + "' is not registered in the C++ port yet");
}

// Global, not a member: the backend emits it unqualified for `throw new x[a](msg)`.
// Merges price levels that share a price, used by parseOrderBook and test.aggregate.
std::any ExchangeBase::aggregate (std::any bidasks) {
    dict grouped;
    if (isList (bidasks)) {
        for (const auto& entry : std::any_cast<list> (bidasks).items ()) {
            const std::any price = getValue (entry, std::any (0));
            const std::any volume = getValue (entry, std::any (1));
            if (!isTrue (volume)) {
                continue;   // a zero-size level means "remove", as in the wire format
            }
            const std::string key = std::any_cast<std::string> (toString (price));
            const std::any running = grouped.get (key);
            grouped.set (key, running.has_value () ? add (running, volume) : volume);
        }
    }
    list out;
    // The cast must bind to a NAMED any. `any_cast<dict>` returns the handle by value,
    // and entries() hands back a reference into the shared store; iterating directly
    // over any_cast<dict>(<temporary>) drops the last shared_ptr owner at the end of
    // the range-init expression and leaves the loop walking freed memory.
    const std::any sorted = this->keysort (std::any (grouped));
    const dict sortedDict = std::any_cast<dict> (sorted);
    for (const auto& kv : sortedDict.entries ()) {
        out.push (std::any (list { std::any (std::stod (kv.first)), kv.second }));
    }
    return std::any (out);
}

std::any ExchangeBase::orderBook (std::any snapshot, std::any) {
    return snapshot.has_value () ? snapshot : std::any (dict {});
}

std::any ExchangeBase::totp (std::any) {
    throw NotSupported ("totp requires the crypto layer, not implemented in the C++ port yet");
}

} // namespace ccxt

[[noreturn]] void throwDynamicException (const std::any& name, const std::any& message) {
    ccxt::throwByName (std::any_cast<std::string> (toString (name)),
                       std::any_cast<std::string> (toString (message)));
}

