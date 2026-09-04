#include "ExchangeBase.h"

#include <nlohmann/json.hpp>

#include <algorithm>
#include <chrono>
#include <cmath>
#include <cstdio>
#include <cstring>
#include <ctime>
#include <cctype>
#include <charconv>
#include <iostream>
#include <random>
#include <set>
#include <thread>

namespace ccxt {

namespace {

std::string str (const std::any& v) {
    return std::any_cast<std::string> (toString (v));
}

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

std::any ExchangeBase::omit (std::any obj, std::any keys) {
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
    if (!isNum (value)) {
        return toString (value);
    }
    if (isInt (value)) {
        return std::any (std::to_string (toLong (value)));
    }
    const double x = toDouble (value);
    if (!std::isfinite (x)) {
        return toString (value);
    }
    char buffer[64];
    const auto converted = std::to_chars (buffer, buffer + sizeof (buffer), x);
    if (converted.ec != std::errc ()) {
        return toString (value);
    }
    std::string text (buffer, converted.ptr);
    const std::size_t at = text.find_first_of ("eE");
    if (at == std::string::npos) {
        return std::any (text);   // already plain decimal
    }
    int exponent = 0;
    try {
        exponent = std::stoi (text.substr (at + 1));
    } catch (const std::exception&) {
        return std::any (text);
    }
    std::string mantissa = text.substr (0, at);
    std::string sign;
    if (!mantissa.empty () && (mantissa[0] == '-' || mantissa[0] == '+')) {
        sign = (mantissa[0] == '-') ? "-" : "";
        mantissa = mantissa.substr (1);
    }
    // digits with the decimal point removed, plus where that point sat
    int pointAt = static_cast<int> (mantissa.size ());
    const std::size_t dot = mantissa.find ('.');
    if (dot != std::string::npos) {
        pointAt = static_cast<int> (dot);
        mantissa.erase (dot, 1);
    }
    const int target = pointAt + exponent;
    const int length = static_cast<int> (mantissa.size ());
    if (target <= 0) {
        return std::any (sign + "0." + std::string (static_cast<std::size_t> (-target), '0') + mantissa);
    }
    if (target >= length) {
        return std::any (sign + mantissa + std::string (static_cast<std::size_t> (target - length), '0'));
    }
    return std::any (sign + mantissa.substr (0, static_cast<std::size_t> (target))
                     + "." + mantissa.substr (static_cast<std::size_t> (target)));
}

std::any ExchangeBase::decimalToPrecision (std::any x, std::any, std::any digits, std::any, std::any) {
    // Placeholder: the full rounding/counting/padding engine is iteration 2 (it is what
    // test.decimalToPrecision exercises, which is outside the agreed gate). Truncating
    // to the requested number of decimals keeps the common path usable meanwhile.
    return toFixed (x, digits);
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
        return jsonToAny (nlohmann::json::parse (str (value)));
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

std::any ExchangeBase::seconds () {
    return std::any (static_cast<long long> (toLong (getCurrentTimestamp ()) / 1000));
}

std::any ExchangeBase::iso8601 (std::any timestamp) {
    if (!timestamp.has_value () || !isNum (timestamp)) {
        return std::any {};
    }
    const long long ms = toLong (timestamp);
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
    return std::async (std::launch::async, [] () -> std::any { return std::any {}; }).share ();
}

// ---------------------------------------------------------------------------
// network — deliberately unimplemented in iteration 1
// ---------------------------------------------------------------------------

std::shared_future<std::any> ExchangeBase::fetch (std::any url, std::any, std::any, std::any) {
    const std::string target = str (url);
    return std::async (std::launch::async, [target] () -> std::any {
        throw NotSupported ("HTTP transport is not implemented in the C++ port yet: " + target);
    }).share ();
}

std::shared_future<std::any> ExchangeBase::loadMarkets (std::any, std::any) {
    return std::async (std::launch::async, [] () -> std::any {
        throw NotSupported ("loadMarkets requires the HTTP transport, not implemented yet");
    }).share ();
}

// ---------------------------------------------------------------------------
// dynamic dispatch (D3)
// ---------------------------------------------------------------------------

std::any ExchangeBase::getProperty (ExchangeBase* self, std::any name) {
    // only the credential lookup in the transpiled base reads properties dynamically
    const std::string key = str (name);
    if (key == "twofa")    return self->twofa;
    if (key == "options")  return self->options;
    if (key == "id")       return self->id;
    return std::any {};
}

void ExchangeBase::setProperty (ExchangeBase* self, std::any name, std::any value) {
    const std::string key = str (name);
    if (key == "options") { self->options = value; return; }
    if (key == "twofa")   { self->twofa = value; return; }
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

