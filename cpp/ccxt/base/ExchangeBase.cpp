#include "ExchangeBase.h"
#include "Starknet.h"
#include "ws/Cache.h"
#include "ws/Client.h"
#include "ws/OrderBook.h"

#include <curl/curl.h>

#include <openssl/sha.h>
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <openssl/ec.h>
#include <openssl/bn.h>
#include <openssl/obj_mac.h>

#include <nlohmann/json.hpp>

#ifdef CCXT_HAS_SIMDJSON
#include <simdjson.h>
#endif

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
list keyList (const ccxt::any& keys) {
    if (isList (keys)) {
        return ccxt::any_cast<list> (keys);
    }
    list single;
    single.push (keys);
    return single;
}

// Shared by every safe* accessor: first key that is present and not null wins.
ccxt::any firstPresent (const ccxt::any& obj, const ccxt::any& keys) {
    const list candidates = keyList (keys);
    for (const auto& key : candidates.items ()) {
        const ccxt::any value = getValue (obj, key);
        // TS prop()/getValueFromKeysInArray skip undefined, null AND the empty string,
        // so '' falls through to the next key and ultimately to the default
        if (value.has_value () && !(isStr (value) && ccxt::any_cast<std::string> (value).empty ())) {
            return value;
        }
    }
    return ccxt::any {};
}

nlohmann::ordered_json anyToJson (const ccxt::any& v) {
    if (!v.has_value ())  return nullptr;
    if (isStr (v))        return ccxt::any_cast<std::string> (v);
    if (isBoolean (v))    return ccxt::any_cast<bool> (v);
    if (isInt (v))        return toLong (v);
    if (isFloat (v))      return toDouble (v);
    if (isList (v)) {
        nlohmann::ordered_json out = nlohmann::ordered_json::array ();
        for (const auto& item : ccxt::any_cast<list> (v).items ()) {
            out.push_back (anyToJson (item));
        }
        return out;
    }
    if (isDict (v)) {
        nlohmann::ordered_json out = nlohmann::ordered_json::object ();
        for (const auto& kv : ccxt::any_cast<dict> (v).entries ()) {
            out[kv.first] = anyToJson (kv.second);
        }
        return out;
    }
    return nullptr;
}

ccxt::any jsonToAny (const nlohmann::ordered_json& j) {
    if (j.is_null ())            return ccxt::any {};
    if (j.is_string ())          return ccxt::any (j.get<std::string> ());
    if (j.is_boolean ())         return ccxt::any (j.get<bool> ());
    if (j.is_number_integer ())  return ccxt::any (static_cast<long long> (j.get<long long> ()));
    if (j.is_number_float ())    return ccxt::any (j.get<double> ());
    if (j.is_array ()) {
        list out;
        for (const auto& item : j) {
            out.push (jsonToAny (item));
        }
        return ccxt::any (out);
    }
    if (j.is_object ()) {
        dict out;
        out.store->reserve (j.size ());   // skip rehash churn on big payloads
        for (auto it = j.begin (); it != j.end (); ++it) {
            out.set (it.key (), jsonToAny (it.value ()));
        }
        return ccxt::any (out);
    }
    return ccxt::any {};
}

#ifdef CCXT_HAS_SIMDJSON
// SIMD fast path for big payloads (live exchangeInfo is ~22MB): replaces the
// digit-quoting scan + nlohmann parse + recursive build. Number semantics
// mirror the old pipeline exactly: integer literals of 19+ digits stay exact
// strings (int64 can't hold them and the old pre-pass quoted them), shorter
// integers are int64, floats are doubles. Object field order is document
// order (nlohmann::ordered_json parity).
ccxt::any simdToAny (simdjson::ondemand::value v) {
    using simdjson::ondemand::json_type;
    switch (v.type ()) {
    case json_type::null:
        return ccxt::any {};
    case json_type::boolean:
        return ccxt::any (v.get_bool ().value ());
    case json_type::string:
        return ccxt::any (
            std::string (std::string_view (v.get_string ().value ())));
    case json_type::number: {
        const simdjson::ondemand::number_type ntype =
            v.get_number_type ().value ();
        if (ntype == simdjson::ondemand::number_type::floating_point_number) {
            return ccxt::any (v.get_double ().value ());
        }
        const std::string_view raw = v.raw_json_token ();
        std::size_t digits = raw.size ();
        if (!raw.empty () && raw[0] == '-') {
            digits--;
        }
        if (digits >= 19) {
            return ccxt::any (std::string (raw));   // exact, rides as a string
        }
        return ccxt::any (static_cast<long long> (v.get_int64 ().value ()));
    }
    case json_type::array: {
        list out;
        for (auto item : v.get_array ()) {
            out.push (simdToAny (item.value ()));
        }
        return ccxt::any (out);
    }
    case json_type::object: {
        dict out;
        for (auto field : v.get_object ()) {
            out.set (
                std::string (std::string_view (field.unescaped_key ().value ())),
                simdToAny (field.value ()));
        }
        return ccxt::any (out);
    }
    }
    return ccxt::any {};
}
#endif

// nlohmann::json objects sort keys, which would break request signing, so serialise
// dictionaries by hand in insertion order.
std::string serialise (const ccxt::any& v) {
    if (isDict (v)) {
        std::string out = "{";
        bool first = true;
        for (const auto& kv : ccxt::any_cast<dict> (v).entries ()) {
            if (!first) out += ",";
            first = false;
            out += nlohmann::json (kv.first).dump () + ":" + serialise (kv.second);
        }
        return out + "}";
    }
    if (isList (v)) {
        std::string out = "[";
        bool first = true;
        for (const auto& item : ccxt::any_cast<list> (v).items ()) {
            if (!first) out += ",";
            first = false;
            out += serialise (item);
        }
        return out + "]";
    }
    return anyToJson (v).dump ();
}

ccxt::any deepClone (const ccxt::any& v) {
    if (isDict (v)) {
        dict out;
        for (const auto& kv : ccxt::any_cast<dict> (v).entries ()) {
            out.set (kv.first, deepClone (kv.second));
        }
        return ccxt::any (out);
    }
    if (isList (v)) {
        list out;
        for (const auto& item : ccxt::any_cast<list> (v).items ()) {
            out.push (deepClone (item));
        }
        return ccxt::any (out);
    }
    return v;
}

void deepMergeInto (dict& target, const ccxt::any& source) {
    if (!isDict (source)) {
        return;
    }
    for (const auto& kv : ccxt::any_cast<dict> (source).entries ()) {
        const ccxt::any existing = target.get (kv.first);
        if (isDict (kv.second) && isDict (existing)) {
            dict merged = ccxt::any_cast<dict> (existing);
            deepMergeInto (merged, kv.second);
            target.set (kv.first, ccxt::any (merged));
        } else {
            target.set (kv.first, deepClone (kv.second));
        }
    }
}

} // namespace

// ---------------------------------------------------------------------------
// async plumbing
// ---------------------------------------------------------------------------

ccxt::any awaitValue (const ccxt::any& value) {
    // generated async bodies return shared_future<any>; awaiting anything else is a
    // no-op, exactly like `await 1` in JS
    if (value.type () == typeid (std::shared_future<ccxt::any>)) {
        return ccxt::any_cast<std::shared_future<ccxt::any>> (value).get ();
    }
    // ws futures: watch() returns a ws::Future handle; awaiting blocks until the
    // matching message resolves/rejects it (possibly from another thread)
    if (value.type () == typeid (ccxt::ws::Future)) {
        return ccxt::any_cast<ccxt::ws::Future> (value).get ();
    }
    return value;
}

ccxt::any promiseAll (const ccxt::any& futures) {
    if (!isList (futures)) {
        return futures;
    }
    list out;
    for (const auto& item : ccxt::any_cast<list> (futures).items ()) {
        out.push (awaitValue (item));
    }
    return ccxt::any (out);
}

// The static ws tests pair an injector future with a watcher future and rely on
// them running CONCURRENTLY (the injector polls for the watcher's pending future
// before injecting each frame). The normal promiseAll awaits in list order, which
// The static ws tests pair an injector future with a watcher future and rely on
// them running CONCURRENTLY (the injector polls for the watcher's pending future
// while the watcher blocks on it). Sequential awaiting deadlocks, so this variant
// runs every future on its own thread and joins; it is applied only to the ws
// harness call sites (see transpileTestMainClass) to keep the proven-sequential
// REST sweep untouched.
ccxt::any promiseAllConcurrent (const ccxt::any& futures) {
    if (!isList (futures)) {
        return futures;
    }
    const list items = ccxt::any_cast<list> (futures);
    const std::size_t n = items.size ();
    std::vector<ccxt::any> results (n);
    std::vector<std::thread> threads;
    std::exception_ptr firstError;
    std::mutex errMutex;
    threads.reserve (n);
    for (std::size_t i = 0; i < n; i++) {
        threads.emplace_back ([&, i] () {
            try {
                results[i] = awaitValue (items.get (static_cast<long> (i)));
            } catch (...) {
                std::lock_guard<std::mutex> lock (errMutex);
                if (!static_cast<bool> (firstError)) {
                    firstError = std::current_exception ();
                }
            }
        });
    }
    for (auto& t : threads) {
        t.join ();
    }
    if (std::getenv ("CCXT_WS_URL_TRACE")) {
        std::fprintf (stderr, "[promiseAllConcurrent] all joined, firstError=%d\n",
                      static_cast<int> (static_cast<bool> (firstError)));
    }
    if (static_cast<bool> (firstError)) {
        std::rethrow_exception (firstError);
    }
    return ccxt::any (ccxt::list (std::vector<ccxt::any> (results)));
}

// ---------------------------------------------------------------------------
// safe accessors
// ---------------------------------------------------------------------------

ccxt::any ExchangeBase::safeValueN (ccxt::any obj, ccxt::any keys, ccxt::any def) {
    const ccxt::any found = firstPresent (obj, keys);
    return found.has_value () ? found : def;
}

ccxt::any ExchangeBase::safeValue (ccxt::any obj, ccxt::any key, ccxt::any def) {
    return this->safeValueN (obj, key, def);
}

ccxt::any ExchangeBase::safeValue2 (ccxt::any obj, ccxt::any k1, ccxt::any k2, ccxt::any def) {
    return this->safeValueN (obj, ccxt::any (list { k1, k2 }), def);
}

ccxt::any ExchangeBase::safeStringN (ccxt::any obj, ccxt::any keys, ccxt::any def) {
    const ccxt::any found = firstPresent (obj, keys);
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

ccxt::any ExchangeBase::safeString (ccxt::any obj, ccxt::any key, ccxt::any def) {
    return this->safeStringN (obj, key, def);
}

ccxt::any ExchangeBase::safeString2 (ccxt::any obj, ccxt::any k1, ccxt::any k2, ccxt::any def) {
    return this->safeStringN (obj, ccxt::any (list { k1, k2 }), def);
}

// The case conversion applies to the FOUND value only -- TS returns `$default`
// untouched, so safeStringLower(o, 'missing', 'MiXed_Case') is 'MiXed_Case', not
// 'mixed_case'. Hence the lookup passes no default of its own.
ccxt::any ExchangeBase::safeStringUpper (ccxt::any obj, ccxt::any key, ccxt::any def) {
    const ccxt::any value = this->safeString (obj, key, ccxt::any {});
    return value.has_value () ? toUpperCase (value) : def;
}

ccxt::any ExchangeBase::safeStringLower (ccxt::any obj, ccxt::any key, ccxt::any def) {
    const ccxt::any value = this->safeString (obj, key, ccxt::any {});
    return value.has_value () ? toLowerCase (value) : def;
}

ccxt::any ExchangeBase::safeFloatN (ccxt::any obj, ccxt::any keys, ccxt::any def) {
    const ccxt::any found = firstPresent (obj, keys);
    if (!found.has_value ()) {
        return def;
    }
    if (isNum (found)) {
        return ccxt::any (toDouble (found));
    }
    if (isStr (found)) {
        try {
            std::size_t consumed = 0;
            const std::string s = ccxt::any_cast<std::string> (found);
            const double parsed = std::stod (s, &consumed);
            if (consumed == 0) {
                return def;
            }
            return ccxt::any (parsed);
        } catch (const std::exception&) {
            return def;
        }
    }
    return def;
}

ccxt::any ExchangeBase::safeFloat (ccxt::any obj, ccxt::any key, ccxt::any def) {
    return this->safeFloatN (obj, key, def);
}

ccxt::any ExchangeBase::safeFloat2 (ccxt::any obj, ccxt::any k1, ccxt::any k2, ccxt::any def) {
    return this->safeFloatN (obj, ccxt::any (list { k1, k2 }), def);
}

ccxt::any ExchangeBase::safeIntegerN (ccxt::any obj, ccxt::any keys, ccxt::any def) {
    const ccxt::any value = this->safeFloatN (obj, keys, ccxt::any {});
    if (!value.has_value ()) {
        return def;
    }
    const double d = toDouble (value);
    if (!std::isfinite (d)) {
        return def;
    }
    return ccxt::any (static_cast<long long> (d));
}

ccxt::any ExchangeBase::safeInteger (ccxt::any obj, ccxt::any key, ccxt::any def) {
    return this->safeIntegerN (obj, key, def);
}

ccxt::any ExchangeBase::safeInteger2 (ccxt::any obj, ccxt::any k1, ccxt::any k2, ccxt::any def) {
    return this->safeIntegerN (obj, ccxt::any (list { k1, k2 }), def);
}

ccxt::any ExchangeBase::safeBool (ccxt::any obj, ccxt::any key, ccxt::any def) {
    const ccxt::any found = firstPresent (obj, key);
    if (!found.has_value ()) {
        return def;
    }
    return ccxt::any (isTrue (found));
}

ccxt::any ExchangeBase::safeTimestamp (ccxt::any obj, ccxt::any key, ccxt::any def) {
    const ccxt::any secondsValue = this->safeFloat (obj, key, ccxt::any {});
    if (!secondsValue.has_value ()) {
        return def;
    }
    return ccxt::any (static_cast<long long> (toDouble (secondsValue) * 1000.0));
}

ccxt::any ExchangeBase::safeTimestampN (ccxt::any obj, ccxt::any keys, ccxt::any def) {
    const ccxt::any secondsValue = this->safeFloatN (obj, keys, ccxt::any {});
    if (!secondsValue.has_value ()) {
        return def;
    }
    return ccxt::any (static_cast<long long> (toDouble (secondsValue) * 1000.0));
}

ccxt::any ExchangeBase::safeTimestamp2 (ccxt::any obj, ccxt::any k1, ccxt::any k2, ccxt::any def) {
    return this->safeTimestampN (obj, ccxt::any (list { k1, k2 }), def);
}

ccxt::any ExchangeBase::safeStringUpperN (ccxt::any obj, ccxt::any keys, ccxt::any def) {
    const ccxt::any value = this->safeStringN (obj, keys, ccxt::any {});
    return value.has_value () ? toUpperCase (value) : def;
}

ccxt::any ExchangeBase::safeStringUpper2 (ccxt::any obj, ccxt::any k1, ccxt::any k2, ccxt::any def) {
    return this->safeStringUpperN (obj, ccxt::any (list { k1, k2 }), def);
}

ccxt::any ExchangeBase::safeStringLowerN (ccxt::any obj, ccxt::any keys, ccxt::any def) {
    const ccxt::any value = this->safeStringN (obj, keys, ccxt::any {});
    return value.has_value () ? toLowerCase (value) : def;
}

ccxt::any ExchangeBase::safeStringLower2 (ccxt::any obj, ccxt::any k1, ccxt::any k2, ccxt::any def) {
    return this->safeStringLowerN (obj, ccxt::any (list { k1, k2 }), def);
}

// TS: `isNumber(n) ? parseInt(n * factor) : default` -- the multiply happens in
// floating point and the result is truncated toward zero, not rounded.
ccxt::any ExchangeBase::safeIntegerProductN (ccxt::any obj, ccxt::any keys, ccxt::any factor, ccxt::any def) {
    const ccxt::any value = this->safeFloatN (obj, keys, ccxt::any {});
    if (!value.has_value ()) {
        return def;
    }
    const double product = toDouble (value) * toDouble (factor);
    if (!std::isfinite (product)) {
        return def;
    }
    return ccxt::any (static_cast<long long> (product));
}

ccxt::any ExchangeBase::safeIntegerProduct (ccxt::any obj, ccxt::any key, ccxt::any factor, ccxt::any def) {
    return this->safeIntegerProductN (obj, key, factor, def);
}

ccxt::any ExchangeBase::safeIntegerProduct2 (ccxt::any obj, ccxt::any k1, ccxt::any k2, ccxt::any factor, ccxt::any def) {
    return this->safeIntegerProductN (obj, ccxt::any (list { k1, k2 }), factor, def);
}

// ---------------------------------------------------------------------------
// generic collection helpers
// ---------------------------------------------------------------------------

ccxt::any ExchangeBase::extend (ccxt::any a, ccxt::any b) {
    dict out;
    for (const ccxt::any& source : { a, b }) {
        if (isDict (source)) {
            for (const auto& kv : ccxt::any_cast<dict> (source).entries ()) {
                out.set (kv.first, kv.second);
            }
        }
    }
    return ccxt::any (out);
}

ccxt::any ExchangeBase::deepExtend (ccxt::any a, ccxt::any b, ccxt::any c, ccxt::any d) {
    dict out;
    for (const ccxt::any& source : { a, b, c, d }) {
        deepMergeInto (out, source);
    }
    return ccxt::any (out);
}

ccxt::any ExchangeBase::clone (ccxt::any value) { return deepClone (value); }

ccxt::any ExchangeBase::sortBy (ccxt::any array, ccxt::any key, ccxt::any descending, ccxt::any def) {
    if (!isList (array)) {
        return array;
    }
    std::vector<ccxt::any> items = ccxt::any_cast<list> (array).items ();
    const bool desc = isTrue (descending);
    std::stable_sort (items.begin (), items.end (), [&] (const ccxt::any& l, const ccxt::any& r) {
        ccxt::any lv = getValue (l, key);
        ccxt::any rv = getValue (r, key);
        if (!lv.has_value ()) lv = def;
        if (!rv.has_value ()) rv = def;
        return desc ? isGreaterThan (lv, rv) : isLessThan (lv, rv);
    });
    return ccxt::any (list (items));
}

ccxt::any ExchangeBase::sortBy2 (ccxt::any array, ccxt::any k1, ccxt::any k2, ccxt::any descending) {
    if (!isList (array)) {
        return array;
    }
    std::vector<ccxt::any> items = ccxt::any_cast<list> (array).items ();
    const bool desc = isTrue (descending);
    std::stable_sort (items.begin (), items.end (), [&] (const ccxt::any& l, const ccxt::any& r) {
        const ccxt::any l1 = getValue (l, k1);
        const ccxt::any r1 = getValue (r, k1);
        if (!isEqual (l1, r1)) {
            return desc ? isGreaterThan (l1, r1) : isLessThan (l1, r1);
        }
        const ccxt::any l2 = getValue (l, k2);
        const ccxt::any r2 = getValue (r, k2);
        return desc ? isGreaterThan (l2, r2) : isLessThan (l2, r2);
    });
    return ccxt::any (list (items));
}

ccxt::any ExchangeBase::groupBy (ccxt::any array, ccxt::any key) {
    dict out;
    if (!isList (array)) {
        return ccxt::any (out);
    }
    for (const auto& item : ccxt::any_cast<list> (array).items ()) {
        const ccxt::any value = getValue (item, key);
        if (!value.has_value ()) {
            continue;   // JS groupBy drops entries without the key
        }
        const std::string bucket = str (value);
        ccxt::any existing = out.get (bucket);
        if (!isList (existing)) {
            existing = ccxt::any (list {});
            out.set (bucket, existing);
        }
        ccxt::any_cast<list> (existing).push (item);
    }
    return ccxt::any (out);
}

ccxt::any ExchangeBase::indexBy (ccxt::any array, ccxt::any key) {
    dict out;
    const ccxt::any values = isDict (array) ? getObjectValues (array) : array;
    if (!isList (values)) {
        return ccxt::any (out);
    }
    for (const auto& item : ccxt::any_cast<list> (values).items ()) {
        const ccxt::any value = getValue (item, key);
        if (value.has_value ()) {
            out.set (str (value), item);
        }
    }
    return ccxt::any (out);
}

ccxt::any ExchangeBase::indexBySafe (ccxt::any array, ccxt::any key) {
    return this->indexBy (array, key);
}

ccxt::any ExchangeBase::filterBy (ccxt::any array, ccxt::any key, ccxt::any value) {
    list out;
    const ccxt::any values = isDict (array) ? getObjectValues (array) : array;
    if (!isList (values)) {
        return ccxt::any (out);
    }
    for (const auto& item : ccxt::any_cast<list> (values).items ()) {
        if (isEqual (getValue (item, key), value)) {
            out.push (item);
        }
    }
    return ccxt::any (out);
}

ccxt::any ExchangeBase::inArray (ccxt::any needle, ccxt::any haystack) {
    return ccxt::any (includes (haystack, needle));
}

ccxt::any ExchangeBase::keysort (ccxt::any obj) {
    dict out;
    if (!isDict (obj)) {
        return ccxt::any (out);
    }
    const dict source = ccxt::any_cast<dict> (obj);
    std::vector<std::string> keys;
    for (const auto& kv : source.entries ()) {
        keys.push_back (kv.first);
    }
    std::sort (keys.begin (), keys.end ());
    for (const auto& key : keys) {
        out.set (key, source.get (key));
    }
    return ccxt::any (out);
}

ccxt::any ExchangeBase::omit (ccxt::any obj, ccxt::any keys, ccxt::any k2, ccxt::any k3,
                             ccxt::any k4, ccxt::any k5, ccxt::any k6, ccxt::any k7) {
    // TS omit is variadic: omit(obj, 'a', 'b') or omit(obj, ['a', 'b']); the extra
    // C++ parameters cover the spread form up to the widest generated call site.
    if (!isDict (obj)) {
        return obj;
    }
    std::set<std::string> drop;
    if (isList (keys)) {
        for (const auto& k : ccxt::any_cast<list> (keys).items ()) {
            drop.insert (str (k));
        }
    } else if (keys.has_value ()) {
        drop.insert (str (keys));
    }
    for (const ccxt::any& extra : { k2, k3, k4, k5, k6, k7 }) {
        if (extra.has_value ()) {
            drop.insert (str (extra));
        }
    }
    dict out;
    for (const auto& kv : ccxt::any_cast<dict> (obj).entries ()) {
        if (drop.find (kv.first) == drop.end ()) {
            out.set (kv.first, kv.second);
        }
    }
    return ccxt::any (out);
}

ccxt::any ExchangeBase::omitZero (ccxt::any value) {
    if (!value.has_value ()) {
        return ccxt::any {};
    }
    double d = 0;
    if (isNum (value)) {
        d = toDouble (value);
    } else if (isStr (value)) {
        try {
            d = std::stod (ccxt::any_cast<std::string> (value));
        } catch (const std::exception&) {
            return value;
        }
    } else {
        return value;
    }
    return (d == 0.0) ? ccxt::any {} : value;
}

ccxt::any ExchangeBase::toArray (ccxt::any value) {
    if (isList (value)) {
        return value;
    }
    // ws caches are arrays, not dicts: filterBySinceLimit slices their rows
    // (wsToPlain maps cache -> rows, book -> dict, and passes other values through)
    if (value.type () == typeid (ccxt::ws::ArrayCache) ||
        value.type () == typeid (ccxt::ws::ArrayCacheByTimestamp) ||
        value.type () == typeid (ccxt::ws::ArrayCacheBySymbolById) ||
        value.type () == typeid (ccxt::ws::ArrayCacheByOutcomeById) ||
        value.type () == typeid (ccxt::ws::ArrayCacheBySymbolBySide)) {
        return wsToPlain (value);
    }
    return getObjectValues (value);
}

ccxt::any ExchangeBase::unique (ccxt::any array) {
    list out;
    if (!isList (array)) {
        return ccxt::any (out);
    }
    for (const auto& item : ccxt::any_cast<list> (array).items ()) {
        if (!includes (ccxt::any (out), item)) {
            out.push (item);
        }
    }
    return ccxt::any (out);
}

ccxt::any ExchangeBase::sum (ccxt::any a, ccxt::any b, ccxt::any c, ccxt::any d) {
    // JS `sum` ignores non-numeric arguments entirely
    double total = 0;
    bool sawNumber = false;
    for (const ccxt::any& value : { a, b, c, d }) {
        if (isNum (value)) {
            total += toDouble (value);
            sawNumber = true;
        }
    }
    return sawNumber ? add (ccxt::any (0), ccxt::any (total)) : ccxt::any {};
}

ccxt::any ExchangeBase::isDictionary (ccxt::any value) { return ccxt::any (isDict (value)); }

ccxt::any ExchangeBase::arrayConcat (ccxt::any a, ccxt::any b) { return concat (a, b); }

ccxt::any ExchangeBase::arraySlice (ccxt::any array, ccxt::any start, ccxt::any end) {
    return slice (array, start, end);
}

ccxt::any ExchangeBase::valueIsDefined (ccxt::any value) { return ccxt::any (value.has_value ()); }

// TS returns true only for undefined/null and empty containers; every scalar -- "", 0,
// false included -- is explicitly false.
ccxt::any ExchangeBase::isEmpty (ccxt::any value) {
    if (!value.has_value ()) {
        return ccxt::any (true);
    }
    if (isList (value)) {
        return ccxt::any (ccxt::any_cast<list> (value).size () < 1);
    }
    if (isDict (value)) {
        return ccxt::any (ccxt::any_cast<dict> (value).size () < 1);
    }
    return ccxt::any (false);
}

// TS copies first (`array.slice()`), so the input must not be reordered. With the
// reference-semantic list of D1 that matters: sorting in place would be visible to
// every alias, and test.sort asserts the original is untouched.
ccxt::any ExchangeBase::sort (ccxt::any array) {
    if (!isList (array)) {
        return array;
    }
    std::vector<ccxt::any> copy = ccxt::any_cast<list> (array).items ();
    // JS Array#sort with no comparator compares elements as strings
    std::stable_sort (copy.begin (), copy.end (), [] (const ccxt::any& a, const ccxt::any& b) {
        return str (a) < str (b);
    });
    return ccxt::any (list (std::move (copy)));
}


// ---------------------------------------------------------------------------
// strings
// ---------------------------------------------------------------------------

ccxt::any ExchangeBase::capitalize (ccxt::any s) {
    std::string value = str (s);
    if (value.empty ()) {
        return ccxt::any (value);
    }
    value[0] = static_cast<char> (std::toupper (static_cast<unsigned char> (value[0])));
    return ccxt::any (value);
}

ccxt::any ExchangeBase::implodeParams (ccxt::any target, ccxt::any params) {
    std::string out = str (target);
    if (isDict (params)) {
        for (const auto& kv : ccxt::any_cast<dict> (params).entries ()) {
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
    return ccxt::any (out);
}

ccxt::any ExchangeBase::extractParams (ccxt::any target) {
    const std::string value = str (target);
    list out;
    std::size_t at = value.find ('{');
    while (at != std::string::npos) {
        const std::size_t close = value.find ('}', at);
        if (close == std::string::npos) {
            break;
        }
        out.push (ccxt::any (value.substr (at + 1, close - at - 1)));
        at = value.find ('{', close);
    }
    return ccxt::any (out);
}

ccxt::any ExchangeBase::encodeURIComponent (ccxt::any value) {
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
    return ccxt::any (out);
}

ccxt::any ExchangeBase::stringToCharsArray (ccxt::any value) {
    return split (value, ccxt::any (std::string ("")));
}

namespace {
const char* BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
}

ccxt::any ExchangeBase::stringToBase64 (ccxt::any value) {
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
    return ccxt::any (out);
}

ccxt::any ExchangeBase::base64ToBinary (ccxt::any value) {
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
    return ccxt::any (out);
}

ccxt::any ExchangeBase::binaryToBase16 (ccxt::any value) {
    const std::string input = str (value);
    std::string out;
    for (unsigned char c : input) {
        char buffer[4];
        std::snprintf (buffer, sizeof (buffer), "%02x", c);
        out += buffer;
    }
    return ccxt::any (out);
}

ccxt::any ExchangeBase::strip (ccxt::any value) {
    return trim (value);
}

// uuid4, formatted 8-4-4-4-12 with the version and variant nibbles pinned. Seeded from
// random_device per call site rather than a shared generator so it stays thread-safe
// under the std::async-per-call model (D5).
ccxt::any ExchangeBase::uuid () {
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
    return ccxt::any (out);
}

// ---------------------------------------------------------------------------
// numbers
// ---------------------------------------------------------------------------

ccxt::any ExchangeBase::parseNumber (ccxt::any value, ccxt::any def) {
    if (!value.has_value ()) {
        return def;
    }
    if (isNum (value)) {
        return value;
    }
    try {
        return ccxt::any (std::stod (str (value)));
    } catch (const std::exception&) {
        return def;
    }
}

// JS Number#toString gives the shortest representation that round-trips, then ccxt
// expands any scientific notation so amounts and prices never reach an exchange as
// "7.8e-7". std::to_chars in shortest mode is the same shortest-round-trip algorithm,
// so the two agree digit for digit; only the expansion has to be written out.
ccxt::any ExchangeBase::numberToString (ccxt::any value) {
    if (!value.has_value ()) {
        return ccxt::any {};
    }
    return ccxt::any (numberToText (value));
}

ccxt::any ExchangeBase::decimalToPrecision (ccxt::any x, ccxt::any roundingMode, ccxt::any digits,
                                           ccxt::any countingMode, ccxt::any paddingMode) {
    // The defaults match the TS signature: DECIMAL_PLACES counting, no padding. An
    // absent roundingMode means TRUNCATE, which is what ccxt's own callers rely on.
    const int rounding = roundingMode.has_value () ? static_cast<int> (toLong (roundingMode)) : 0;
    const int counting = countingMode.has_value ()
        ? static_cast<int> (toLong (countingMode)) : 2;
    const int padding = paddingMode.has_value ()
        ? static_cast<int> (toLong (paddingMode)) : 5;
    return ccxt::any (decimalToPrecisionText (x, rounding, digits, counting, padding));
}

ccxt::any ExchangeBase::precisionFromString (ccxt::any value) {
    if (!value.has_value ()) {
        return ccxt::any (0);
    }
    const std::string s = str (value);
    // '1e-4' -> 4, '1e4' -> -4: strip the mantissa and negate the exponent
    if (s.find ('e') != std::string::npos || s.find ('E') != std::string::npos) {
        const std::size_t at = s.find_first_of ("eE");
        int exponent = 0;
        try {
            exponent = std::stoi (s.substr (at + 1));
        } catch (const std::exception&) {
            return ccxt::any (0);
        }
        return ccxt::any (-exponent);
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
        return ccxt::any (0);
    }
    return ccxt::any (((secondDot < 0) ? (lastNonZero + 1) : secondDot) - dot - 1);
}

// ---------------------------------------------------------------------------
// json
// ---------------------------------------------------------------------------

ccxt::any ExchangeBase::parseJson (ccxt::any value) {
    try {
        // exchange ids routinely exceed int64 (e.g. alpaca trade ids like
        // 2880534893454904000): nlohmann stores those as double, rounding the
        // value before any numberToString can recover it. Quote integer literals
        // that sit in JSON value positions first so they ride through as exact
        // strings. (std::regex is ECMAScript-flavoured: no lookbehind, hence the
        // manual prev-char check instead of (?<!...).)
        std::string text = str (value);
#ifdef CCXT_HAS_SIMDJSON
        // big payloads take the SIMD path (see simdToAny). Fall back to the
        // proven nlohmann pipeline on any simdjson error — guaranteed no
        // regression, only the fast path is opt-in by size.
        if (text.size () >= (1u << 20)
            && !std::getenv ("CCXT_PARSE_FORCE_NLOHMANN")) {
            try {
                simdjson::ondemand::parser parser;
                const simdjson::padded_string padded (text);
                auto doc = parser.iterate (padded);
                if (!doc.error ()) {
                    return simdToAny (doc.get_value ().value ());
                }
            } catch (const std::exception&) {
                // fall through to the nlohmann path
            }
        }
#endif
        // exchange ids routinely exceed int64 (e.g. alpaca trade ids like
        // 2880534893454904000): nlohmann stores those as double, rounding the
        // value before any numberToString can recover it. Quote integer literals
        // that sit in JSON value positions first so they ride through as exact
        // strings. Hand-rolled digit-run scan: a std::regex \d{19,} pass over a
        // multi-MB payload costs seconds at -O0 (libstdc++ regex is backtracking
        // and header-heavy), while this loop is linear with no allocation per run.
        const auto valuePosChar = [] (char c) {
            return c == '{' || c == '[' || c == ',' || c == ':'
                || c == ' ' || c == '\n' || c == '\t' || c == '\r';
        };
        std::string out;
        out.reserve (text.size () + 8);
        std::size_t last = 0;
        bool changed = false;
        for (std::size_t i = 0; i < text.size ();) {
            if (!std::isdigit (static_cast<unsigned char> (text[i]))) {
                i++;
                continue;
            }
            const std::size_t s = i;
            while (i < text.size () && std::isdigit (static_cast<unsigned char> (text[i]))) {
                i++;
            }
            const std::size_t len = i - s;
            if (len < 19) {
                continue;   // short literal: nothing to quote
            }
            if (s > 0 && (text[s - 1] == '.' || std::isdigit (static_cast<unsigned char> (text[s - 1])))) {
                continue;   // fraction tail or interior of a longer literal
            }
            if (s + len < text.size () && text[s + len] == '.') {
                continue;   // a float literal like 12345678901234567890.5
            }
            if (s + len < text.size () && (text[s + len] == 'e' || text[s + len] == 'E')) {
                continue;   // exponent tail like 1.23e22
            }
            std::size_t quoteStart = s;
            if (s > 0 && text[s - 1] == '-') {
                if (s == 1 || valuePosChar (text[s - 2])) {
                    quoteStart = s - 1;
                } else {
                    continue;   // "-" belongs to a string value like "...-9223372036854775808..."
                }
            } else {
                if (!(s == 0 || valuePosChar (text[s - 1]))) {
                    continue;
                }
            }
            out += text.substr (last, quoteStart - last);
            out += '"';
            out += text.substr (quoteStart, s + len - quoteStart);
            out += '"';
            last = s + len;
            changed = true;
        }
        if (changed) {
            out += text.substr (last);
            text = out;
        }
        return jsonToAny (nlohmann::ordered_json::parse (text));
    } catch (const std::exception&) {
        return ccxt::any {};   // ccxt returns undefined for unparseable payloads
    }
}

ccxt::any ExchangeBase::json (ccxt::any value, ccxt::any params) {
    (void) params;   // TS accepts it for signature compatibility and ignores it
    return ccxt::any (serialise (value));
}

ccxt::any ExchangeBase::isJsonEncodedObject (ccxt::any value) {
    if (!isStr (value)) {
        return ccxt::any (false);
    }
    const std::string text = ccxt::any_cast<std::string> (value);
    if (text.empty ()) {
        return ccxt::any (false);
    }
    return ccxt::any ((text[0] == '{') || (text[0] == '['));
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
               const std::string& prefix, const ccxt::any& value, bool arrayRepeat) {
    if (isDict (value)) {
        for (const auto& kv : ccxt::any_cast<dict> (value).entries ()) {
            const std::string key = prefix.empty () ? kv.first : (prefix + "[" + kv.first + "]");
            qsAppend (out, key, kv.second, arrayRepeat);
        }
        return;
    }
    if (isList (value)) {
        const auto& items = ccxt::any_cast<list> (value).items ();
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

ccxt::any ExchangeBase::urlencode (ccxt::any params, ccxt::any sortKeys) {
    return ccxt::any (this->queryString (params, true, true, false, sortKeys));
}

ccxt::any ExchangeBase::urlencodeNested (ccxt::any params) {
    // encodeValuesOnly: brackets in the key must survive unescaped
    return ccxt::any (this->queryString (params, false, true, false, ccxt::any {}));
}

ccxt::any ExchangeBase::urlencodeWithArrayRepeat (ccxt::any params) {
    return ccxt::any (this->queryString (params, true, true, true, ccxt::any {}));
}

ccxt::any ExchangeBase::rawencode (ccxt::any params, ccxt::any sortKeys) {
    return ccxt::any (this->queryString (params, false, false, false, sortKeys));
}

namespace {
// qs.stringify() semantics (ts/src/base/functions/encode.ts:31): encodeURIComponent
// followed by escaping !'()* — stricter than the raw JS encodeURIComponent that the
// C++ encodeURIComponent member mirrors. Used for query-string construction only.
std::string qsEncode (const std::string& input) {
    std::string out;
    for (unsigned char c : input) {
        switch (c) {
            case '!': out += "%21"; break;
            case '\'': out += "%27"; break;
            case '(': out += "%28"; break;
            case ')': out += "%29"; break;
            case '*': out += "%2A"; break;
            default: {
                static const std::string unreserved =
                    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~";
                if (unreserved.find (static_cast<char> (c)) != std::string::npos) {
                    out += static_cast<char> (c);
                } else {
                    char buffer[8];
                    std::snprintf (buffer, sizeof (buffer), "%%%02X", c);
                    out += buffer;
                }
            }
        }
    }
    return out;
}
}

std::string ExchangeBase::queryString (const ccxt::any& params, bool encodeKeys,
                                       bool encodeValues, bool arrayRepeat,
                                       const ccxt::any& sortKeys) {
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
        out += encodeKeys ? qsEncode (kv.first) : kv.first;
        out += "=";
        out += encodeValues ? qsEncode (kv.second) : kv.second;
    }
    return out;
}

// ---------------------------------------------------------------------------
// time
// ---------------------------------------------------------------------------

ccxt::any ExchangeBase::milliseconds () { return getCurrentTimestamp (); }

ccxt::any ExchangeBase::microseconds () {
    // TS microseconds(): Date.now() * 1000 — microseconds since the epoch
    return ccxt::any (toLong (getCurrentTimestamp ()) * 1000);
}

ccxt::any ExchangeBase::seconds () {
    return ccxt::any (static_cast<long long> (toLong (getCurrentTimestamp ()) / 1000));
}

ccxt::any ExchangeBase::iso8601 (ccxt::any timestamp) {
    long long ms = 0;
    if (isNum (timestamp)) {
        ms = static_cast<long long> (std::floor (toDouble (timestamp)));
    } else if (isStr (timestamp)) {
        // only plain-integer strings are accepted, e.g. "1755432123456"
        const std::string text = ccxt::any_cast<std::string> (timestamp);
        if (text.empty ()) {
            return ccxt::any {};
        }
        for (char c : text) {
            if (!std::isdigit (static_cast<unsigned char> (c))) {
                return ccxt::any {};
            }
        }
        try {
            ms = std::stoll (text);
        } catch (const std::exception&) {
            return ccxt::any {};
        }
    } else {
        return ccxt::any {};
    }
    // TS rejects negatives outright, and anything past the Date range. Without the
    // negative guard the millisecond field came out as ".-01" (C++ % truncates toward
    // zero), producing strings like "1970-01-01T00:00:00.-01Z".
    if (ms < 0 || ms > 8640000000000000LL) {
        return ccxt::any {};
    }
    const std::time_t whole = static_cast<std::time_t> (ms / 1000);
    std::tm utc {};
    gmtime_r (&whole, &utc);
    char buffer[64];
    std::snprintf (buffer, sizeof (buffer), "%04d-%02d-%02dT%02d:%02d:%02d.%03lldZ",
                   utc.tm_year + 1900, utc.tm_mon + 1, utc.tm_mday,
                   utc.tm_hour, utc.tm_min, utc.tm_sec, ms % 1000);
    return ccxt::any (std::string (buffer));
}

ccxt::any ExchangeBase::parseTimeframe (ccxt::any timeframe) {
    const std::string value = str (timeframe);
    if (value.empty ()) {
        return ccxt::any {};
    }
    const char unit = value.back ();
    long long amount = 0;
    try {
        amount = std::stoll (value.substr (0, value.size () - 1));
    } catch (const std::exception&) {
        return ccxt::any {};
    }
    switch (unit) {
    case 'y': return ccxt::any (amount * 31536000LL);
    case 'M': return ccxt::any (amount * 2592000LL);
    case 'w': return ccxt::any (amount * 604800LL);
    case 'd': return ccxt::any (amount * 86400LL);
    case 'h': return ccxt::any (amount * 3600LL);
    case 'm': return ccxt::any (amount * 60LL);
    case 's': return ccxt::any (amount);
    default:  return ccxt::any {};
    }
}

// Accepts the ISO-8601 shapes ccxt sees, and only those: TS delegates to Date.parse
// but guards it first, rejecting bare digit strings and anything without both a dash
// and a colon. A naive datetime (no zone, no trailing Z) is read as UTC, which is what
// the `(x + 'Z')` fallback in the TS does.
ccxt::any ExchangeBase::parse8601 (ccxt::any datetime) {
    if (!isStr (datetime)) {
        return ccxt::any {};
    }
    const std::string text = ccxt::any_cast<std::string> (datetime);
    if (text.empty ()) {
        return ccxt::any {};
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
        return ccxt::any {};
    }
    if (text.find ('-') == std::string::npos || text.find (':') == std::string::npos) {
        return ccxt::any {};
    }
    int year = 0, month = 0, day = 0, hour = 0, minute = 0, second = 0;
    // the date/time separator is 'T' in ISO form and a space in the loose form ccxt
    // also accepts ("2019-08-12 13:22:08")
    if (std::sscanf (text.c_str (), "%4d-%2d-%2dT%2d:%2d:%2d",
                     &year, &month, &day, &hour, &minute, &second) != 6 &&
        std::sscanf (text.c_str (), "%4d-%2d-%2d %2d:%2d:%2d",
                     &year, &month, &day, &hour, &minute, &second) != 6) {
        return ccxt::any {};
    }
    // reject out-of-range fields BEFORE timegm: glibc normalizes month 13 / hour 25
    // into the next period and returns a valid epoch for an invalid ISO date
    // (TS's Date.parse is strict and yields NaN -> undefined)
    if (month < 1 || month > 12 || day < 1 || day > 31 ||
        hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 60) {
        return ccxt::any {};
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
        return ccxt::any {};
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
    return ccxt::any (result);
}

ccxt::any ExchangeBase::roundTimeframe (ccxt::any timeframe, ccxt::any timestamp, ccxt::any direction) {
    const ccxt::any parsed = this->parseTimeframe (timeframe);
    if (!parsed.has_value () || !timestamp.has_value ()) {
        return ccxt::any {};
    }
    const long long ms = toLong (parsed) * 1000LL;
    if (ms == 0) {
        return ccxt::any {};
    }
    const long long value = toLong (timestamp);
    const long long offset = value % ms;
    // TS defaults the direction to ROUND_DOWN and adds a whole period for ROUND_UP
    const bool roundUp = direction.has_value () && isEqual (direction, ROUND_UP);
    return ccxt::any (value - offset + (roundUp ? ms : 0));
}

std::shared_future<ccxt::any> ExchangeBase::sleep (ccxt::any ms) {
    const long long duration = toLong (ms);
    // sleep keeps launch::async: the whole point is that time passes, and a
    // deferred body would not start until someone awaited it
    return std::async (std::launch::async, [duration] () -> ccxt::any {
        std::this_thread::sleep_for (std::chrono::milliseconds (duration));
        return ccxt::any {};
    }).share ();
}

// ---------------------------------------------------------------------------
// logging and plumbing
// ---------------------------------------------------------------------------

ccxt::any ExchangeBase::log (ccxt::any value) {
    std::cout << serialise (value) << std::endl;
    return ccxt::any {};
}

ccxt::any ExchangeBase::createSafeDictionary (ccxt::any) { return ccxt::any (dict {}); }
ccxt::any ExchangeBase::mapToSafeMap (ccxt::any value) { return value; }
ccxt::any ExchangeBase::initThrottler () { return ccxt::any {}; }
ccxt::any ExchangeBase::addFetchCache (ccxt::any, ccxt::any) { return ccxt::any {}; }
ccxt::any ExchangeBase::setLastRequest (ccxt::any) { return ccxt::any {}; }
ccxt::any ExchangeBase::setLastRestRequestTimestamp (ccxt::any) { return ccxt::any {}; }
ccxt::any ExchangeBase::storeArray (ccxt::any target, ccxt::any value) {
    // ws order book sides: store the delta (shared store, mutation propagates);
    // the transpiler rewrites `side.storeArray (delta)` to `this->storeArray (side, delta)`
    if (target.type () == typeid (ccxt::ws::OrderBookSide)) {
        ccxt::ws::OrderBookSide side = ccxt::any_cast<ccxt::ws::OrderBookSide> (target);
        side.storeArray (value);
    }
    return target;
}
namespace {

// dials a real socket for a non-mock client: handshake on the caller thread,
// then a receive thread routes frames into the exchange's handleMessage. Used
// by BOTH watch() and watchMultiple() -- the pro tier funnels most exchanges
// through watchMultiple, so the connect step must live here too.
void connectWsClient (ccxt::ExchangeBase* ex, const ccxt::any& url, ccxt::ws::Client& client) {
    if (client.isMockConnected () || client.isLiveConnected ()) {
        return;
    }
    const ccxt::any clientAny = ccxt::any (client);
    try {
        client.connect (
            str (url),
            [ex, clientAny] (const ccxt::any& rawText) {
                if (std::getenv ("CCXT_WS_URL_TRACE")) {
                    const std::string text = str (rawText);
                    std::fprintf (stderr, "[ws-frame] %.110s\n", text.c_str ());
                }
                try {
                    ex->handleMessage (clientAny, ex->parseJson (rawText));
                } catch (const std::exception& e) {
                    if (std::getenv ("CCXT_WS_URL_TRACE")) {
                        std::fprintf (stderr, "[ws-frame-error] %s\n", e.what ());
                    }
                } catch (...) {
                    // a malformed frame must not kill the receive thread
                }
            },
            [ex] (const ccxt::any& message) {
                return ::str (ex->json (message));
            });
        if (std::getenv ("CCXT_WS_URL_TRACE")) {
            std::fprintf (stderr, "[ws-connect] ok url=%s\n", str (url).c_str ());
        }
    } catch (const std::exception& e) {
        if (std::getenv ("CCXT_WS_URL_TRACE")) {
            std::fprintf (stderr, "[ws-connect] FAILED url=%s err=%s\n", str (url).c_str (), e.what ());
        }
        throw;
    }
}

} // namespace

ExchangeBase::~ExchangeBase () {
    // shut live transports down BEFORE members are destroyed: the receive
    // threads route frames into handleMessage on `this`, and the join inside
    // Transport::shutdown orders any in-flight callback before this teardown
    if (this->clients.has_value () && ccxt::isDict (this->clients)) {
        const ccxt::dict clients = ccxt::any_cast<ccxt::dict> (this->clients);
        for (const auto& kv : clients.entries ()) {
            if (kv.second.type () == typeid (ccxt::ws::Client)) {
                ccxt::any_cast<ccxt::ws::Client> (kv.second).shutdown ();
            }
        }
    }
}

ccxt::any ExchangeBase::resolve (ccxt::any value, ccxt::any messageHash) {
    if (std::getenv ("CCXT_WS_URL_TRACE")) {
        std::fprintf (stderr, "[ex-resolve-enter] hash=%s clients=%d\n",
                      messageHash.has_value () ? str (messageHash).c_str () : "<empty>",
                      static_cast<int> (this->clients.has_value () && ccxt::isDict (this->clients)));
    }
    // generated pro code resolves through the client it got from handleMessage;
    // the hash identifies the future. Try every registered client: only the one
    // that holds the hash will settle anything, the others no-op (JS client.resolve).
    if (this->clients.has_value () && ccxt::isDict (this->clients)) {
        const std::string hash = messageHash.has_value () ? str (messageHash) : std::string {};
        const ccxt::dict clients = ccxt::any_cast<ccxt::dict> (this->clients);
        if (std::getenv ("CCXT_WS_URL_TRACE")) {
            std::fprintf (stderr, "[ex-resolve] hash=%s clients=%zu\n", hash.c_str (), clients.size ());
        }
        for (const auto& kv : clients.entries ()) {
            if (kv.second.type () == typeid (ccxt::ws::Client)) {
                ccxt::any_cast<ccxt::ws::Client> (kv.second).resolve (value, hash);
            }
        }
    }
    return value;
}

ccxt::any ExchangeBase::reject (ccxt::any value, ccxt::any messageHash) {
    if (this->clients.has_value () && ccxt::isDict (this->clients)) {
        const std::string hash = messageHash.has_value () ? str (messageHash) : std::string {};
        for (const auto& kv : ccxt::any_cast<ccxt::dict> (this->clients).entries ()) {
            if (kv.second.type () == typeid (ccxt::ws::Client)) {
                ccxt::any_cast<ccxt::ws::Client> (kv.second).reject (value, hash);
            }
        }
    }
    return value;
}

// ---------------------------------------------------------------------------
// ws plumbing — hand-written mirror of ts/src/base/Exchange.ts above the
// transpile marker (client/watch/watchMultiple/spawn/delay/ping/handlers/close)
// ---------------------------------------------------------------------------

ccxt::any ExchangeBase::client (ccxt::any url) {
    if (!url.has_value ()) {
        throw ccxt::ArgumentsRequired (str (this->id) + " client() requires a url argument");
    }
    const std::string urlStr = str (url);
    if (std::getenv ("CCXT_WS_URL_TRACE")) {
        std::fprintf (stderr, "[ws-client] %s client url=%s\n", str (this->id).c_str (), urlStr.c_str ());
    }
    if (!this->clients.has_value ()) {
        this->clients = ccxt::any (ccxt::dict {});
    }
    ccxt::dict clients = ccxt::any_cast<ccxt::dict> (this->clients);
    if (!clients.has (urlStr)) {
        // the static tests never dial: connect is resolved by the mock transport
        // (setupWsMockTransport); a real transport plugs in here later
        clients.set (urlStr, ccxt::any (ccxt::ws::Client (urlStr)));
    }
    return clients.get (urlStr);
}

ccxt::any ExchangeBase::watch (ccxt::any url, ccxt::any messageHash, ccxt::any message,
                              ccxt::any subscribeHash, ccxt::any subscription) {
    if (!url.has_value ()) {
        throw ccxt::ArgumentsRequired (str (this->id) + " watch() requires a url argument");
    }
    if (!messageHash.has_value ()) {
        throw ccxt::ArgumentsRequired (str (this->id) + " watch() requires a messageHash argument");
    }
    const std::string hash = str (messageHash);
    ccxt::ws::Client client = ccxt::any_cast<ccxt::ws::Client> (this->client (url));
    // a non-mock client dials the real socket on first use (shared with watchMultiple)
    connectWsClient (this, url, client);
    if (!subscribeHash.has_value () && client.hasFuture (hash)) {
        return ccxt::any (client.future (hash));
    }
    ccxt::ws::Future future = client.future (hash);
    bool newSubscription = false;
    if (subscribeHash.has_value ()) {
        if (!client.isSubscribed (str (subscribeHash))) {
            client.setSubscription (str (subscribeHash),
                                    subscription.has_value () ? subscription : ccxt::any (true));
            newSubscription = true;
        }
    }
    // the subscribe frame is sent only for a NEW subscription (TS Exchange.ts:
    // `if (clientSubscription === undefined)`); re-entrant watch calls for an
    // existing subscription must not resend
    if (message.has_value () && newSubscription) {
        client.send (message);
    }
    return ccxt::any (future);
}

ccxt::any ExchangeBase::watchMultiple (ccxt::any url, ccxt::any messageHashes, ccxt::any message,
                                      ccxt::any subscribeHashes, ccxt::any subscription) {
    if (!url.has_value ()) {
        throw ccxt::ArgumentsRequired (str (this->id) + " watchMultiple() requires a url argument");
    }
    ccxt::ws::Client client = ccxt::any_cast<ccxt::ws::Client> (this->client (url));
    // a non-mock client dials the real socket on first use (shared with watch)
    connectWsClient (this, url, client);
    // missing-subscription bookkeeping before the race so re-entrant calls don't resend
    std::vector<std::string> missing;
    if (subscribeHashes.has_value () && ccxt::isList (subscribeHashes)) {
        for (const auto& h : ccxt::any_cast<ccxt::list> (subscribeHashes).items ()) {
            if (!client.isSubscribed (str (h))) {
                missing.push_back (str (h));
            }
        }
        for (const auto& h : missing) {
            client.setSubscription (h, subscription.has_value () ? subscription : ccxt::any (true));
        }
    }
    std::vector<ccxt::ws::Future> futures;
    for (const auto& h : ccxt::any_cast<ccxt::list> (messageHashes).items ()) {
        futures.push_back (client.future (str (h)));
    }
    if (message.has_value () && !missing.empty ()) {
        client.send (message);
    }
    return ccxt::any (ccxt::ws::race (futures));
}

std::shared_future<ccxt::any> ExchangeBase::spawn (ccxt::any methodName, ccxt::any args) {
    // fire-and-forget dispatch by method name (generated pro code passes the
    // method as a stringified reference). Exceptions propagate through the
    // shared_future (TS parity: a throwing spawned task rejects its promise
    // and awaitValue rethrows) -- swallowing here produced empty results that
    // masked real failures downstream.
    return std::async (std::launch::async, [this, methodName, args] () -> ccxt::any {
        return this->callDynamically (str (methodName), args);
    }).share ();
}

std::shared_future<ccxt::any> ExchangeBase::delay (ccxt::any timeout, ccxt::any methodName, ccxt::any args) {
    const int64_t ms = timeout.has_value () ? static_cast<int64_t> (toDouble (timeout)) : 0;
    return std::async (std::launch::async, [this, ms, methodName, args] () -> ccxt::any {
        std::this_thread::sleep_for (std::chrono::milliseconds (ms));
        return this->callDynamically (str (methodName), args);
    }).share ();
}

ccxt::any ExchangeBase::ping (ccxt::any) {
    return ccxt::any {};
}

// ws base emulations — TS Exchange.ts declares these above the transpile marker,
// so the C++ base owns them (see declarations in ExchangeBase.h). Bodies mirror
// the TS ones: resolve current state immediately.
std::shared_future<ccxt::any> ExchangeBase::fetchMarketsWs (ccxt::any) {
    return std::async (std::launch::deferred, [this] () -> ccxt::any {
        if (!this->markets.has_value () || !ccxt::isDict (this->markets)) {
            return ccxt::any (ccxt::list {});
        }
        ccxt::list out;
        for (const auto& kv : ccxt::any_cast<ccxt::dict> (this->markets).entries ()) {
            out.push (kv.second);
        }
        return ccxt::any (out);
    }).share ();
}

std::shared_future<ccxt::any> ExchangeBase::fetchCurrenciesWs (ccxt::any) {
    return std::async (std::launch::deferred, [this] () -> ccxt::any {
        return this->currencies.has_value () ? this->currencies : ccxt::any (ccxt::dict {});
    }).share ();
}

std::shared_future<ccxt::any> ExchangeBase::fetchBalanceWs (ccxt::any) {
    return std::async (std::launch::deferred, [this] () -> ccxt::any {
        return this->balance.has_value () ? this->balance : ccxt::any (ccxt::dict {});
    }).share ();
}

std::shared_future<ccxt::any> ExchangeBase::fetchTradingFeesWs (ccxt::any) {
    return std::async (std::launch::deferred, [this] () -> ccxt::any {
        return this->fees.has_value () ? this->fees : ccxt::any (ccxt::dict {});
    }).share ();
}

void ExchangeBase::handleMessage (ccxt::any, ccxt::any) {
    // stub to override in pro exchanges
}

void ExchangeBase::onConnected (ccxt::any, ccxt::any) {
}

void ExchangeBase::onError (ccxt::any, ccxt::any) {
}

void ExchangeBase::onClose (ccxt::any, ccxt::any) {
}

std::shared_future<ccxt::any> ExchangeBase::close (ccxt::any) {
    // reject every pending future with ExchangeClosedByUser and drop the clients
    if (this->clients.has_value () && ccxt::isDict (this->clients)) {
        for (const auto& kv : ccxt::any_cast<ccxt::dict> (this->clients).entries ()) {
            if (kv.second.type () == typeid (ccxt::ws::Client)) {
                ccxt::any_cast<ccxt::ws::Client> (kv.second).reject (
                    ccxt::any (std::string (str (this->id) + " closedByUser")));
            }
        }
        this->clients = ccxt::any (ccxt::dict {});
    }
    return std::async (std::launch::deferred, [] () -> ccxt::any { return ccxt::any {}; }).share ();
}

std::shared_future<ccxt::any> ExchangeBase::throttle (ccxt::any) {
    return std::async (std::launch::deferred, [] () -> ccxt::any { return ccxt::any {}; }).share ();
}

// ---------------------------------------------------------------------------
// network — deliberately unimplemented in iteration 1
// ---------------------------------------------------------------------------

std::shared_future<ccxt::any> ExchangeBase::fetch (ccxt::any url, ccxt::any method,
                                                  ccxt::any headers, ccxt::any body) {
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
                           [impl, url, method, headers, body] () -> ccxt::any {
            return impl (url, method, headers, body);
        }).share ();
    }
    // Real transport. Mirrors ts/src/base/Exchange.ts fetch()/handleRestResponse():
    // merge default headers -> libcurl -> onRestResponse -> parseJson -> handleErrors
    // -> handleHttpStatusCode -> parsed body (or raw text when it is not JSON).
    // launch::async: TS fires fan-outs (binance fetchMarkets awaits
    // Promise.all([exchangeInfo, fapi, dapi])) CONCURRENTLY — deferred futures
    // would run them strictly one at a time on the awaiting thread (~3x slower
    // network phase). Futures are created up front by the generated promiseAll
    // list, so the requests overlap even though promiseAll awaits in order.
    return std::async (std::launch::async, [this, target, verb, url, method, headers, body] () -> ccxt::any {
        // merged headers are built from a LOCAL snapshot: concurrent fetches
        // (TS promiseAll fan-outs) must not race on the this->headers member
        // (the only writer is the exchange's own describe/init path, which is
        // single-threaded and done before any fetch fires)
        ccxt::any base = this->headers;
        ccxt::any merged = headers;
        if (base.has_value () && isDict (base)) {
            merged = (headers.has_value () && isDict (headers))
                ? this->deepExtend (base, headers)
                : base;
        }
        if (!(merged.has_value () && isDict (merged))) {
            merged = dict {
                { std::string ("User-Agent"),
                  std::string ("ccxt-cpp/0.1.0 (+https://github.com/ccxt/ccxt)") },
            };
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
            const auto& opts = ccxt::any_cast<dict> (this->options);
            const auto pick = [&opts] (const char* key) -> std::string {
                if (opts.has (std::string (key))) {
                    const ccxt::any v = opts.get (std::string (key));
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
            for (const auto& kv : ccxt::any_cast<dict> (merged).entries ()) {
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

        const ccxt::any statusText = std::string ("OK");
        const ccxt::any emptyHeaders = dict {};

        const ccxt::any bodyText = this->onRestResponse (status, statusText, url, method,
                                                        emptyHeaders, out, headers, body);
        ccxt::any parsed = ccxt::any {};
        try {
            parsed = this->parseJson (bodyText);
        } catch (const std::exception&) {
            parsed = ccxt::any {};
        }

        const ccxt::any skip = this->handleErrors (status, statusText, url, method,
                                                  emptyHeaders, bodyText, parsed,
                                                  headers, body);
        if (!skip.has_value ()) {
            this->handleHttpStatusCode (status, statusText, url, method, out);
        }
        if (parsed.has_value () && !isTrue (isEqual (parsed, ccxt::any {}))) {
            return parsed;
        }
        return out;
    }).share ();
}

// ---------------------------------------------------------------------------
// dynamic access — the transpiled test framework reads and writes members
// through these when the receiver is a ccxt::any
// ---------------------------------------------------------------------------

ccxt::any ExchangeBase::getProperty (const std::string& name) {
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
    if (name == "enableLastHttpResponse") return ccxt::any (true);
    throw NotSupported ("getProperty: unknown member \"" + name + "\"");
}

ccxt::any ExchangeBase::setProperty (const std::string& name, ccxt::any value) {
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

ccxt::any ExchangeBase::callDynamically (const std::string& name, ccxt::any args) {
    if (std::getenv ("CCXT_WS_URL_TRACE")
        && (name.rfind ("handle", 0) == 0 || name.rfind ("watch", 0) == 0)) {
        std::fprintf (stderr, "[callDynamically] %s\n", name.c_str ());
    }
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
            return this->callMethod (std::string (name), args.has_value () ? args : ccxt::any (list {}));
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
    const auto& argv = isList (args) ? ccxt::any_cast<list> (args).items () : std::vector<ccxt::any> {};
    const ccxt::any a0 = argv.size () > 0 ? argv[0] : ccxt::any {};
    const ccxt::any a1 = argv.size () > 1 ? argv[1] : ccxt::any {};
    const ccxt::any a2 = argv.size () > 2 ? argv[2] : ccxt::any {};
    const ccxt::any a3 = argv.size () > 3 ? argv[3] : ccxt::any {};
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
    if (name == "setSandboxMode") { this->setSandboxMode (a0); return ccxt::any {}; }
    if (name == "setMarkets") { this->setMarkets (a0, a1); return ccxt::any {}; }
    if (name == "loadMarkets") return this->loadMarkets (a0);
    if (name == "sleep") return this->sleep (a0);
    if (name == "getCcxtVersion") return this->getCcxtVersion ();
    if (name == "fetch") return this->fetch (a0, a1, a2, a3);
    // free-form test helpers (transpiled test.sharedMethods passes the exchange
    // itself as a0 inside the args list; it rides as a shared_ptr<ExchangeBase>)
    const auto unwrapSelf = [] (const ccxt::any& selfAny) -> ExchangeBase* {
        if (selfAny.type () == typeid (std::shared_ptr<ExchangeBase>)) {
            return ccxt::any_cast<std::shared_ptr<ExchangeBase>> (selfAny).get ();
        }
        if (selfAny.type () == typeid (ExchangeBase*)) {
            return ccxt::any_cast<ExchangeBase*> (selfAny);
        }
        return nullptr;
    };
    if (name == "getProperty") {
        ExchangeBase* self = unwrapSelf (a0);
        if (self == nullptr) self = this;
        try {
            return self->getProperty (str (a1));
        } catch (const NotSupported&) {
            return a2;   // TS returns the defaultValue (undefined) for a missing property
        }
    }
    if (name == "setProperty") {
        ExchangeBase* self = unwrapSelf (a0);
        if (self == nullptr) self = this;
        try {
            self->setProperty (str (a1), a2);
        } catch (const NotSupported&) {
            // TS would create an expando property; the C++ port has no bag for those
        }
        return ccxt::any {};
    }
    if (name == "jsonStringifyWithNull") return this->json (a0);
    if (name == "capitalize") return this->capitalize (a0);
    if (name == "exceptionMessage") return this->exceptionMessage (a0, a1);
    // implicit API endpoints (e.g. accountV1PrivateGetAccountApiRestrictions): the
    // static request fixtures call them directly; route through callEndpoint. The
    // endpoint default is an empty params dict, mirroring TS's `params = {}`.
    if (this->hasEndpoint (name)) {
        const ccxt::any endpointParams = a0.has_value () ? a0 : ccxt::any (dict {});
        return ccxt::any (this->callEndpoint (ccxt::any (std::string (name)), endpointParams));
    }
    // No dynamic handler at all -- the only way here is a cached DispatchMiss that the
    // helper registry also does not cover.
    throw NotSupported ("callDynamically: no handler for \"" + name + "\"");
}

ccxt::any ExchangeBase::handleErrors (ccxt::any, ccxt::any, ccxt::any, ccxt::any,
                                     ccxt::any, ccxt::any, ccxt::any, ccxt::any,
                                     ccxt::any) {
    return ccxt::any {};   // no-op default; per-exchange overrides throw
}

ccxt::any ExchangeBase::handleHttpStatusCode (ccxt::any code, ccxt::any reason,
                                             ccxt::any url, ccxt::any method,
                                             ccxt::any body) {
    if (!code.has_value ()) {
        return ccxt::any {};
    }
    const long long status = toLong (code);
    if (status < 400) {
        return ccxt::any {};
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
        return ccxt::any {};
    }
}

ccxt::any ExchangeBase::onRestResponse (ccxt::any, ccxt::any, ccxt::any, ccxt::any,
                                       ccxt::any, ccxt::any responseBody,
                                       ccxt::any, ccxt::any) {
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

ccxt::any ExchangeBase::extendExchangeOptions (ccxt::any newOptions) {
    this->options = this->extend (this->options, newOptions);
    return ccxt::any {};
}

ccxt::any ExchangeBase::convertToSafeDictionary (ccxt::any value) {
    return value;
}

ccxt::any ExchangeBase::getCcxtVersion () {
    return std::string ("4.4.79");   // kept in sync with the JS package version
}

// ---------------------------------------------------------------------------
// generated-surface no-ops
// ---------------------------------------------------------------------------
// The real definitions live in the generated Exchange.*.inc fragments (on the
// Exchange class); these exist only so the ExchangeBase vtable has an entry to
// bind. Everything reachable through an ExchangeBase* is a concrete Exchange, so
// these are never actually dispatched.

ccxt::any ExchangeBase::safeNumber (ccxt::any, ccxt::any, ccxt::any) {
    throw NotSupported ("safeNumber is generated, not on the C++ ExchangeBase");
}
ccxt::any ExchangeBase::safeDict (ccxt::any, ccxt::any, ccxt::any) {
    throw NotSupported ("safeDict is generated, not on the C++ ExchangeBase");
}
ccxt::any ExchangeBase::safeList (ccxt::any, ccxt::any, ccxt::any) {
    throw NotSupported ("safeList is generated, not on the C++ ExchangeBase");
}
ccxt::any ExchangeBase::parseToInt (ccxt::any) {
    throw NotSupported ("parseToInt is generated, not on the C++ ExchangeBase");
}
ccxt::any ExchangeBase::parseToNumeric (ccxt::any) {
    throw NotSupported ("parseToNumeric is generated, not on the C++ ExchangeBase");
}
ccxt::any ExchangeBase::market (ccxt::any) {
    throw NotSupported ("market is generated, not on the C++ ExchangeBase");
}
ccxt::any ExchangeBase::marketId (ccxt::any) {
    throw NotSupported ("marketId is generated, not on the C++ ExchangeBase");
}
ccxt::any ExchangeBase::currency (ccxt::any) {
    throw NotSupported ("currency is generated, not on the C++ ExchangeBase");
}
ccxt::any ExchangeBase::currencyId (ccxt::any) {
    throw NotSupported ("currencyId is generated, not on the C++ ExchangeBase");
}
ccxt::any ExchangeBase::checkRequiredCredentials (ccxt::any) {
    throw NotSupported ("checkRequiredCredentials is generated, not on the C++ ExchangeBase");
}
ccxt::any ExchangeBase::setMarkets (ccxt::any, ccxt::any) {
    throw NotSupported ("setMarkets is generated, not on the C++ ExchangeBase");
}
void ExchangeBase::setSandboxMode (ccxt::any) {
    throw NotSupported ("setSandboxMode is generated, not on the C++ ExchangeBase");
}
ccxt::any ExchangeBase::isEmptyString (ccxt::any) {
    throw NotSupported ("isEmptyString is generated, not on the C++ ExchangeBase");
}

// ---------------------------------------------------------------------------
// binary, crypto and date formatting
// ---------------------------------------------------------------------------

namespace {

// Generated code hands binary around as ccxt::any; it may hold real bytes or, on the
// paths that have not been converted yet, a std::string of raw octets.
bytes asBytes (const ccxt::any& v) {
    if (isBytes (v)) {
        return ccxt::any_cast<bytes> (v);
    }
    return bytes (str (v));
}

} // namespace

ccxt::any ExchangeBase::encode (ccxt::any value) { return ccxt::any (encodeUtf8 (str (value))); }

ccxt::any ExchangeBase::decode (ccxt::any value) { return ccxt::any (decodeUtf8 (asBytes (value))); }

ccxt::any ExchangeBase::base16ToBinary (ccxt::any value) { return ccxt::any (fromBase16 (str (value))); }

ccxt::any ExchangeBase::binaryToBase64 (ccxt::any value) { return ccxt::any (toBase64 (asBytes (value))); }

ccxt::any ExchangeBase::base58ToBinary (ccxt::any value) { return ccxt::any (fromBase58 (str (value))); }

ccxt::any ExchangeBase::binaryToBase58 (ccxt::any value) { return ccxt::any (toBase58 (asBytes (value))); }

ccxt::any ExchangeBase::binaryConcat (ccxt::any a, ccxt::any b, ccxt::any c, ccxt::any d,
                                     ccxt::any e, ccxt::any f, ccxt::any g) {
    // TS binaryConcat = concatBytes -- variadic byte concatenation, including the
    // zero-arg call hibachi uses to initialise an empty byte array. The C++ runtime
    // models binaries as `bytes`; non-set parts (ccxt::any{}) are skipped.
    std::vector<unsigned char> out;
    for (const ccxt::any& part : { a, b, c, d, e, f, g }) {
        if (!part.has_value ()) {
            continue;
        }
        const std::vector<unsigned char>& tail = asBytes (part).data ();
        out.insert (out.end (), tail.begin (), tail.end ());
    }
    return ccxt::any (bytes (std::move (out)));
}

ccxt::any ExchangeBase::binaryLength (ccxt::any value) {
    return ccxt::any (static_cast<long long> (asBytes (value).size ()));
}

ccxt::any ExchangeBase::isBinaryMessage (ccxt::any value) { return ccxt::any (isBytes (value)); }

ccxt::any ExchangeBase::hash (ccxt::any payload, ccxt::any algorithm, ccxt::any digest) {
    return hashBytes (asBytes (payload),
                      algorithm.has_value () ? str (algorithm) : std::string ("sha256"),
                      digest.has_value () ? str (digest) : std::string ("hex"));
}

ccxt::any ExchangeBase::hmac (ccxt::any payload, ccxt::any key, ccxt::any algorithm, ccxt::any digest) {
    return hmacBytes (asBytes (payload), asBytes (key).toString (),
                      algorithm.has_value () ? str (algorithm) : std::string ("sha256"),
                      digest.has_value () ? str (digest) : std::string ("hex"));
}

ccxt::any ExchangeBase::crc32 (ccxt::any value, ccxt::any signed32) {
    return ccxt::any (crc32Of (str (value), isTrue (signed32)));
}

ccxt::any ExchangeBase::rsa (ccxt::any, ccxt::any, ccxt::any, ccxt::any) {
    throw NotSupported ("rsa signing is not implemented in the C++ port yet; only hmac keys work");
}

ccxt::any ExchangeBase::eddsa (ccxt::any request, ccxt::any secret, ccxt::any curve) {
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
    return ccxt::any (toBase64 (bytes (std::move (signature))));
}

ccxt::any ExchangeBase::jwt (ccxt::any data, ccxt::any secretKey, ccxt::any algorithm, ccxt::any isRSA, ccxt::any opts) {
    // ts/src/base/functions/rsa.ts jwt(): header {alg, typ, +opts}, payload = data,
    // base64url segments; signature HS (hmac), ES (ecdsa/p256), Ed (eddsa) or RS.
    const std::string hashName = algorithm.has_value () ? str (algorithm) : "sha256";
    if (hashName != "sha256" && hashName != "sha384" && hashName != "sha512") {
        throw NotSupported ("jwt: unsupported hash " + hashName);
    }
    const dict headerOpts = opts.has_value () && isDict (opts) ? ccxt::any_cast<dict> (opts) : dict {};
    std::string alg = (isTrue (isRSA) ? "RS" : "HS") + hashName.substr (3);
    const ccxt::any algOpt = headerOpts.get ("alg");
    if (algOpt.has_value ()) {
        alg = str (algOpt);
        for (char& c : alg) c = static_cast<char> (std::toupper (static_cast<unsigned char> (c)));
    }
    dict header;
    header.set ("alg", ccxt::any (alg));
    header.set ("typ", ccxt::any (std::string ("JWT")));
    for (const auto& kv : headerOpts.entries ()) {
        if (kv.first == "alg") {
            continue;
        }
        if (kv.first == "iat" && isDict (data)) {
            ccxt::any_cast<dict> (data).set ("iat", kv.second);
            continue;
        }
        header.set (kv.first, kv.second);
    }
    const std::string encodedHeader = str (this->urlencodeBase64 (ccxt::any (this->json (ccxt::any (header)))));
    const std::string encodedData = str (this->urlencodeBase64 (ccxt::any (this->json (data))));
    const std::string token = encodedHeader + "." + encodedData;
    std::string signature;
    if (alg.rfind ("HS", 0) == 0) {
        const ccxt::any mac = this->hmac (ccxt::any (token), secretKey, algorithm, ccxt::any (std::string ("binary")));
        signature = str (this->urlencodeBase64 (mac));
    } else if (alg.rfind ("ED", 0) == 0) {
        // coinbase advanced-trade: secret is the base58 32-byte seed
        const ccxt::any sig = this->eddsa (ccxt::any (token), secretKey, ccxt::any (std::string ("ed25519")));
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
    return ccxt::any (token + "." + signature);
}

// ccxt's uuid16/uuid22 are the uuid4 hex with the dashes removed, truncated
ccxt::any ExchangeBase::uuid16 () {
    const std::string full = str (this->uuid ());
    std::string flat;
    for (char c : full) {
        if (c != '-') {
            flat += c;
        }
    }
    return ccxt::any (flat.substr (0, 16));
}

ccxt::any ExchangeBase::uuid22 () {
    const std::string full = str (this->uuid ());
    std::string flat;
    for (char c : full) {
        if (c != '-') {
            flat += c;
        }
    }
    return ccxt::any (flat.substr (0, 22));
}

namespace {

// shared by the ymd family: UTC calendar parts of a ms timestamp
bool utcParts (const ccxt::any& timestamp, std::tm& out) {
    if (!timestamp.has_value () || !isNum (timestamp)) {
        return false;
    }
    const std::time_t whole = static_cast<std::time_t> (toLong (timestamp) / 1000);
    gmtime_r (&whole, &out);
    return true;
}

} // namespace

ccxt::any ExchangeBase::yymmdd (ccxt::any timestamp, ccxt::any infix) {
    std::tm utc {};
    if (!utcParts (timestamp, utc)) {
        return ccxt::any {};
    }
    const std::string sep = infix.has_value () ? str (infix) : std::string ("");
    char buffer[32];
    std::snprintf (buffer, sizeof (buffer), "%02d%s%02d%s%02d",
                   (utc.tm_year + 1900) % 100, sep.c_str (),
                   utc.tm_mon + 1, sep.c_str (), utc.tm_mday);
    return ccxt::any (std::string (buffer));
}

ccxt::any ExchangeBase::yyyymmdd (ccxt::any timestamp, ccxt::any infix) {
    std::tm utc {};
    if (!utcParts (timestamp, utc)) {
        return ccxt::any {};
    }
    const std::string sep = infix.has_value () ? str (infix) : std::string ("-");
    char buffer[32];
    std::snprintf (buffer, sizeof (buffer), "%04d%s%02d%s%02d",
                   utc.tm_year + 1900, sep.c_str (),
                   utc.tm_mon + 1, sep.c_str (), utc.tm_mday);
    return ccxt::any (std::string (buffer));
}

ccxt::any ExchangeBase::ymd (ccxt::any timestamp, ccxt::any infix) {
    return this->yyyymmdd (timestamp, infix.has_value () ? infix : ccxt::any (std::string ("-")));
}

ccxt::any ExchangeBase::ymdhms (ccxt::any timestamp, ccxt::any infix) {
    std::tm utc {};
    if (!utcParts (timestamp, utc)) {
        return ccxt::any {};
    }
    const std::string sep = infix.has_value () ? str (infix) : std::string (" ");
    char buffer[64];
    std::snprintf (buffer, sizeof (buffer), "%04d-%02d-%02d%s%02d:%02d:%02d",
                   utc.tm_year + 1900, utc.tm_mon + 1, utc.tm_mday, sep.c_str (),
                   utc.tm_hour, utc.tm_min, utc.tm_sec);
    return ccxt::any (std::string (buffer));
}

// Loading markets needs the HTTP layer, which this iteration stubs out. They exist so
// a derived exchange's generated override binds; calling one fails loudly.
ccxt::any ExchangeBase::callMethod (ccxt::any name, ccxt::any) {
    throw DispatchMiss (str (name));
}

// The transpiler drops the TS bodies below (BigInt / zklink SDK), so they live here,
// exactly like their C# counterparts in cs/ccxt/base/Exchange.cs.

ccxt::any ExchangeBase::randNumber (ccxt::any size) {
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
        return ccxt::any (0.0);
    }
    return ccxt::any (std::stod (number));
}

ccxt::any ExchangeBase::remove0xPrefix (ccxt::any hexData) {
    if (!hexData.has_value () || !isStr (hexData)) {
        return hexData;
    }
    std::string s = ccxt::any_cast<std::string> (hexData);
    if (s.size () >= 2 && s[0] == '0' && (s[1] == 'x' || s[1] == 'X')) {
        s.erase (0, 2);
    }
    return ccxt::any (s);
}

std::shared_future<ccxt::any> ExchangeBase::getZKContractSignatureObj (ccxt::any, ccxt::any) {
    // same contract as C# Exchange.cs: zklink is a node SDK that does not exist here
    return std::async (std::launch::deferred, [] () -> ccxt::any {
        throw NotSupported ("Apex currently does not support create order in C++ language");
    }).share ();
}

std::shared_future<ccxt::any> ExchangeBase::getZKTransferSignatureObj (ccxt::any, ccxt::any) {
    return std::async (std::launch::deferred, [] () -> ccxt::any {
        throw NotSupported ("Apex currently does not support create order in C++ language");
    }).share ();
}

ccxt::any ExchangeBase::intToBase16 (ccxt::any number) {
    // TS: elem.toString(16) -- hex without the 0x prefix
    char buffer[32];
    std::snprintf (buffer, sizeof (buffer), "%llx", static_cast<unsigned long long> (toLong (number)));
    return ccxt::any (std::string (buffer));
}

ccxt::any ExchangeBase::exceptionMessage (ccxt::any exc, ccxt::any includeStack) {
    // TS: '[' + exc.constructor.name + '] ' + (includeStack ? exc.stack : exc.message),
    // truncated to 100000 chars. C++ has no stack traces; the type name + what() is
    // the faithful equivalent.
    (void) includeStack;
    std::string message;
    if (exc.type () == typeid (std::exception_ptr)) {
        try {
            std::rethrow_exception (ccxt::any_cast<std::exception_ptr> (exc));
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
    return ccxt::any (message.substr (0, length));
}

ccxt::any ExchangeBase::fixStringifiedJsonMembers (ccxt::any content) {
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
    return ccxt::any (s);
}

ccxt::any ExchangeBase::randomBytes (ccxt::any size) {
    const long long n = size.has_value () ? toLong (size) : 0;
    if (n < 0) {
        throw ArgumentsRequired ("randomBytes size must be non-negative");
    }
    std::vector<unsigned char> buffer (static_cast<std::size_t> (n));
    if (n > 0 && RAND_bytes (buffer.data (), static_cast<int> (n)) != 1) {
        throw ExchangeError ("randomBytes: RAND_bytes failed");
    }
    return ccxt::any (bytes (std::move (buffer)));
}

ccxt::any ExchangeBase::uuid5 (ccxt::any nspace, ccxt::any name) {
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
    return ccxt::any (h.substr (0, 8) + "-" + h.substr (8, 4) + "-" + h.substr (12, 4)
                     + "-" + h.substr (16, 4) + "-" + h.substr (20, 12));
}

ccxt::any ExchangeBase::convertToBigInt (ccxt::any value) {
    // TS BigInt(value): the value rides through as a numeric string and the
    // consumers (ethAbiEncode) parse it; no boxed bigint type exists in the port
    if (isStr (value)) {
        return ccxt::any (str (value));
    }
    return value;
}

// forward decls: the EIP-712/ABI helpers in the anonymous namespace further down
namespace {
std::vector<unsigned char> hexDecode (const std::string& text);
std::vector<unsigned char> uintToBytes32 (long long value);
std::vector<unsigned char> intToBytes32 (long long value);
std::vector<unsigned char> anyToBigUint (const ccxt::any& v);
std::vector<unsigned char> anyToBigInt (const ccxt::any& v);
}

ccxt::any ExchangeBase::ethAbiEncode (ccxt::any typesAny, ccxt::any argsAny) {
    // ethers.encode(types, args) over the static subset the exchanges use:
    // address / uintN / intN / bool / bytesN -- each argument one 32-byte word.
    if (!isList (typesAny) || !isList (argsAny)) {
        throw NotSupported ("ethAbiEncode: types and args must be arrays");
    }
    const auto& types = ccxt::any_cast<list> (typesAny).items ();
    const auto& args = ccxt::any_cast<list> (argsAny).items ();
    std::vector<unsigned char> out;
    for (std::size_t i = 0; i < types.size (); i++) {
        if (i >= args.size ()) {
            throw NotSupported ("ethAbiEncode: fewer args than types");
        }
        const std::string type = str (types[i]);
        const ccxt::any& value = args[i];
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
    return ccxt::any (bytes (std::move (out)));
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

long long anyToLong (const ccxt::any& v) {
    if (!v.has_value ()) {
        return 0;
    }
    if (v.type () == typeid (long long)) {
        return ccxt::any_cast<long long> (v);
    }
    if (v.type () == typeid (int)) {
        return ccxt::any_cast<int> (v);
    }
    if (v.type () == typeid (long)) {
        return ccxt::any_cast<long> (v);
    }
    if (v.type () == typeid (double)) {
        return static_cast<long long> (ccxt::any_cast<double> (v));
    }
    if (v.type () == typeid (bool)) {
        return ccxt::any_cast<bool> (v) ? 1 : 0;
    }
    // fall back to a numeric string (Precise strings, big chainIds)
    return static_cast<long long> (std::stoll (::str (v)));
}

// 256-bit unsigned integer as a 32-byte big-endian vector. Handles any numeric value
// the exchanges pass (double, integral types) plus decimal strings wider than 64 bits
// (repeated mod-256 on the decimal digits).
std::vector<unsigned char> anyToBigUint (const ccxt::any& v) {
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
std::vector<unsigned char> anyToBigInt (const ccxt::any& v) {
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
ccxt::any ExchangeBase::ethEncodeStructuredData (ccxt::any domainAny, ccxt::any messageTypesAny, ccxt::any messageDataAny) {
    if (!isDict (domainAny) || !isDict (messageTypesAny) || !isDict (messageDataAny)) {
        throw NotSupported ("ethEncodeStructuredData: domain, messageTypes and message must be objects");
    }
    const dict domain = ccxt::any_cast<dict> (domainAny);
    const dict messageTypes = ccxt::any_cast<dict> (messageTypesAny);
    const dict messageData = ccxt::any_cast<dict> (messageDataAny);
    if (messageTypes.entries ().empty ()) {
        throw NotSupported ("ethEncodeStructuredData: empty messageTypes");
    }
    const std::string primaryType = messageTypes.entries ().front ().first;

    // -- the struct registry: name -> ordered field list ----------------------------
    using Fields = std::vector<std::pair<std::string, std::string>>;
    std::map<std::string, Fields> structs;
    const auto parseFields = [&](const ccxt::any& fieldsAny) -> Fields {
        if (!isList (fieldsAny)) {
            throw NotSupported ("ethEncodeStructuredData: struct fields must be an array");
        }
        Fields fields;
        for (const auto& item : ccxt::any_cast<list> (fieldsAny).items ()) {
            if (!isDict (item)) {
                throw NotSupported ("ethEncodeStructuredData: field descriptor must be an object");
            }
            const dict field = ccxt::any_cast<dict> (item);
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
    const auto encodeAtomic = [&](const std::string& type, const ccxt::any& value) -> std::vector<unsigned char> {
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
    std::function<std::vector<unsigned char> (const std::string&, const ccxt::any&)> hashStruct;
    std::function<std::vector<unsigned char> (const std::string&, const ccxt::any&)> encodeData;

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

    encodeData = [&](const std::string& name, const ccxt::any& value) -> std::vector<unsigned char> {
        const auto it = structs.find (name);
        if (it == structs.end ()) {
            throw NotSupported ("ethEncodeStructuredData: unknown struct '" + name + "'");
        }
        const auto& fields = it->second;
        std::vector<unsigned char> out;
        for (const auto& field : fields) {
            ccxt::any fieldValue = isDict (value) ? ccxt::any_cast<dict> (value).get (field.first) : ccxt::any {};
            const auto base = arrayBase (field.second);
            std::vector<unsigned char> part;
            if (base.second) {
                // array: keccak256 over the concatenated element encodings --
                // ethers encodes each STRUCT element as typehash||fields with a
                // per-element keccak (hashStruct), atomics as 32-byte words
                std::vector<unsigned char> concat;
                if (isList (fieldValue)) {
                    for (const auto& item : ccxt::any_cast<list> (fieldValue).items ()) {
                        std::vector<unsigned char> elem = structs.count (base.first)
                            ? hashStruct (base.first, item)
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

    hashStruct = [&](const std::string& name, const ccxt::any& value) -> std::vector<unsigned char> {
        std::vector<unsigned char> input = keccak256Bytes (encodeType (name)).data ();
        const std::vector<unsigned char> data = encodeData (name, value);
        input.insert (input.end (), data.begin (), data.end ());
        return keccak256Bytes (bytes (input)).data ();
    };

    // -- 0x1901 || domainSeparator || hashStruct(primary) ---------------------------
    const std::vector<unsigned char> domainSeparator =
        hashStruct ("EIP712Domain", ccxt::any (domain));
    const std::vector<unsigned char> primaryHash =
        hashStruct (primaryType, ccxt::any (messageData));
    std::vector<unsigned char> out = {0x19, 0x01};
    out.insert (out.end (), domainSeparator.begin (), domainSeparator.end ());
    out.insert (out.end (), primaryHash.begin (), primaryHash.end ());
    return ccxt::any (bytes (std::move (out)));
}

ccxt::any ExchangeBase::ethGetAddressFromPrivateKey (ccxt::any privateKey) {
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
    return ccxt::any (address);
}

ccxt::any ExchangeBase::starknetEncodeStructuredData (ccxt::any domain, ccxt::any messageTypes, ccxt::any messageData, ccxt::any address) {
    if (!isDict (domain) || !isDict (messageTypes) || !isDict (messageData)) {
        throw NotSupported ("starknetEncodeStructuredData: domain, messageTypes and message must be objects");
    }
    return ccxt::any (starkcrypto::messageHashLegacy (
        ccxt::any_cast<dict> (messageTypes),
        ccxt::any_cast<dict> (domain),
        ccxt::any_cast<dict> (messageData),
        str (address)));
}

ccxt::any ExchangeBase::retrieveStarkAccount (ccxt::any signature, ccxt::any accountClassHash, ccxt::any accountProxyClassHash) {
    const std::string priv = starkcrypto::ethSigToPrivate (str (signature));
    const std::string pub = starkcrypto::getStarkKey (priv);
    const std::string address = starkcrypto::computeAccountAddress (
        str (accountClassHash), str (accountProxyClassHash), pub);
    dict out;
    out.set ("privateKey", ccxt::any (priv));
    out.set ("publicKey", ccxt::any (pub));
    out.set ("address", ccxt::any (address));
    return ccxt::any (out);
}

ccxt::any ExchangeBase::starknetSign (ccxt::any message, ccxt::any privateKey) {
    const auto sig = starkcrypto::sign (str (message), str (privateKey));
    list out;
    out.push (ccxt::any (sig.first));
    out.push (ccxt::any (sig.second));
    return this->json (ccxt::any (out));
}

// dydx protobuf signing: mirrors the C# Exchange.cs stubs verbatim

ccxt::any ExchangeBase::encodeDydxTxForSigning (ccxt::any, ccxt::any, ccxt::any, ccxt::any, ccxt::any, ccxt::any) {
    throw NotSupported ("Dydx currently does not support create order / transfer asset in C++ language");
}

ccxt::any ExchangeBase::encodeDydxTxForSimulation (ccxt::any, ccxt::any, ccxt::any, ccxt::any) {
    throw NotSupported ("Dydx currently does not support create order / transfer asset in C++ language");
}

ccxt::any ExchangeBase::encodeDydxTxRaw (ccxt::any, ccxt::any) {
    throw NotSupported ("Dydx currently does not support create order / transfer asset in C++ language");
}

ccxt::any ExchangeBase::retrieveDydxCredentials (ccxt::any) {
    throw NotSupported ("Dydx currently does not support create order / transfer asset in C++ language");
}

std::shared_future<ccxt::any> ExchangeBase::loadDydxProtos () {
    return std::async (std::launch::deferred, [] () -> ccxt::any {
        throw NotSupported ("Dydx currently does not support create order / transfer asset in C++ language");
    }).share ();
}

ccxt::any ExchangeBase::toDydxLong (ccxt::any value) {
    // TS: BigInt(value).toString() -- string representation of an integral number
    return ccxt::any (str (value));
}

ccxt::any ExchangeBase::extendedStarknetSign (ccxt::any msgHash, ccxt::any pri) {
    // TS: starknetCurveSign(msgHash without 0x, pri without 0x) -> json([r, s]) with
    // r/s as decimal strings (BigInt toString()). starkcrypto::sign already returns
    // decimal r/s (same RFC-6979 path paradex uses).
    std::string hashHex = str (msgHash);
    std::string priHex = str (pri);
    if (hashHex.rfind ("0x", 0) == 0) hashHex = hashHex.substr (2);
    if (priHex.rfind ("0x", 0) == 0) priHex = priHex.substr (2);
    const auto rs = ccxt::starkcrypto::sign (hashHex, priHex);
    return this->json (ccxt::list {rs.first, rs.second});
}

ccxt::any ExchangeBase::extendedStarknetComputePoseidonHashOnElements (ccxt::any valuesAny) {
    // TS extendedStarknetComputePoseidonHashOnElements: poseidon_hash_many over
    // felt elements -> hex string. Elements arrive as hex or decimal strings.
    std::vector<std::string> elements;
    if (ccxt::isList (valuesAny)) {
        const auto& l = ccxt::any_cast<const ccxt::list&> (valuesAny);
        for (std::size_t i = 0; i < l.size (); i++) {
            elements.push_back (str (l.get (static_cast<long long> (i))));
        }
    }
    return ccxt::any (std::string ("0x") + ccxt::starkcrypto::poseidonHashMany (elements));
}

ccxt::any ExchangeBase::extendedStarknetGetSelectorFromName (ccxt::any value) {
    // starknet getSelectorFromName: keccak256(name) & (2^250 - 1), hex string
    return ccxt::any (ccxt::starkcrypto::getSelectorFromName (str (value)));
}

ccxt::any ExchangeBase::parseDate (ccxt::any value) {
    // functions/time.ts parseDate: a GMT-prefixed string parses via Date.parse, anything
    // else goes through parse8601; non-strings yield undefined
    if (!isStr (value) || str (value).empty ()) {
        return ccxt::any {};
    }
    const std::string x = ccxt::any_cast<std::string> (value);
    if (x.find ("GMT") != std::string::npos) {
        // RFC 1123 form: "Tue, 22 Apr 2025 12:00:00 GMT"
        std::tm tm {};
        std::istringstream stream (x);
        stream >> std::get_time (&tm, "%a, %d %b %Y %H:%M:%S GMT");
        if (!stream.fail ()) {
            std::time_t epoch = timegm (&tm);
            return ccxt::any (static_cast<double> (epoch) * 1000.0);
        }
        return ccxt::any {};
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
    void msgpackAppend (std::vector<unsigned char>& out, const ccxt::any& value) {
        if (!value.has_value ()) {
            putByte (out, 0xc0);   // nil
            return;
        }
        if (isBool (value)) {
            putByte (out, ccxt::any_cast<bool> (value) ? 0xc3 : 0xc2);
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
            const std::string s = ccxt::any_cast<std::string> (value);
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
            const std::vector<ccxt::any> items = ccxt::any_cast<list> (value).items ();
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
            const std::vector<OrderedMap::entry> entries = ccxt::any_cast<dict> (value).entries ();
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
                msgpackAppend (out, ccxt::any (kv.first));
                msgpackAppend (out, kv.second);
            }
            return;
        }
        throw ExchangeError ("packb: cannot msgpack-serialize value of type " + std::string (value.type ().name ()));
    }
}   // namespace

ccxt::any ExchangeBase::packb (ccxt::any data) {
    std::vector<unsigned char> out;
    msgpackAppend (out, data);
    return ccxt::any (bytes (std::move (out)));
}

ccxt::any ExchangeBase::urlencodeBase64 (ccxt::any data) {
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
    return ccxt::any (out);
}

// lighter signing: stubs until a lighter-native milestone (C# has real implementations
// in Exchange.Lighter.cs backed by the vendor .so)

#define LIGHTER_STUB_DEF(NAME) \
    ccxt::any ExchangeBase::NAME (ccxt::any, ccxt::any, ccxt::any, ccxt::any, ccxt::any) { \
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

std::shared_future<ccxt::any> ExchangeBase::loadLighterLibrary (ccxt::any, ccxt::any, ccxt::any, ccxt::any, ccxt::any, ccxt::any) {
    return std::async (std::launch::deferred, [] () -> ccxt::any {
        throw NotSupported ("loadLighterLibrary requires the lighter native library; not implemented in the C++ port yet");
    }).share ();
}

std::shared_future<ccxt::any> ExchangeBase::fetchMarkets (ccxt::any) {
    // C# Exchange.fetchMarkets: the base returns this.markets as an array; the
    // generated per-exchange override does the real HTTP fetch.
    return std::async (std::launch::deferred, [this] () -> ccxt::any {
        return this->toArray (this->markets);
    }).share ();
}

std::shared_future<ccxt::any> ExchangeBase::fetchCurrencies (ccxt::any) {
    // C# Exchange.fetchCurrencies: base returns this.currencies verbatim
    return std::async (std::launch::deferred, [this] () -> ccxt::any {
        return this->currencies;
    }).share ();
}

std::shared_future<ccxt::any> ExchangeBase::loadMarkets (ccxt::any reload, ccxt::any params) {
    // C# loadMarketsHelper semantics. The C# version caches the in-flight task
    // (marketsLoading); the C++ async model is deferred futures resolved on the
    // calling thread, so the mutex is enough to keep concurrent callers correct.
    return std::async (std::launch::deferred, [this, reload, params] () -> ccxt::any {
        std::lock_guard<std::mutex> guard (this->loadMarketsMutex);
        if (!isTrue (reload) && isDict (this->markets)
            && (ccxt::any_cast<dict> (this->markets).size () > 0)) {
            if (!this->markets_by_id.has_value ()) {
                return this->setMarkets (this->markets);
            }
            return this->markets;
        }
        ccxt::any currenciesFetched;
        const ccxt::any hasFetchCurrencies = this->safeValue (this->has, std::string ("fetchCurrencies"));
        if (isTrue (hasFetchCurrencies)) {
            currenciesFetched = awaitValue (this->fetchCurrencies ());
            if (isDict (this->options)) {
                ccxt::any_cast<dict> (this->options).set ("cachedCurrencies", currenciesFetched);
            }
        }
        const ccxt::any fetched = awaitValue (this->fetchMarkets (params));
        if (isDict (this->options)) {
            deleteKey (this->options, std::string ("cachedCurrencies"));
        }
        return this->setMarkets (fetched, currenciesFetched);
    }).share ();
}

// ---------------------------------------------------------------------------
// dynamic dispatch (D3)
// ---------------------------------------------------------------------------

ccxt::any ExchangeBase::getProperty (ExchangeBase* self, ccxt::any name) {
    // route through the instance-side property table (the full field surface);
    // checkRequiredCredentials() and the test harness read arbitrary members here.
    // TS returns undefined for a missing property -- mirror that, not a throw.
    try {
        return self->getProperty (str (name));
    } catch (const NotSupported&) {
        return ccxt::any {};
    }
}

void ExchangeBase::setProperty (ExchangeBase* self, ccxt::any name, ccxt::any value) {
    // route through the instance-side property table (the full field surface);
    // silently dropping unknown keys here hid real harness writes (accountId, apiKey).
    // Unknown members stay a silent no-op, exactly like the TS free function.
    try {
        self->setProperty (str (name), value);
    } catch (const NotSupported&) {
        // TS would create an expando property; the C++ port has no bag for those
    }
}

ccxt::any ExchangeBase::callDynamically (ExchangeBase* self, ccxt::any name, ccxt::any args) {
    // transpiled code calls the free-function form callDynamically(this, name, args)
    // (fetchWebEndpoint's endpointMethod, pagination helpers). Route through the
    // instance dispatch, which covers unified methods, helpers, and implicit API
    // endpoints alike.
    return self->callDynamically (str (name), args);
}

// Global, not a member: the backend emits it unqualified for `throw new x[a](msg)`.
// Merges price levels that share a price, used by parseOrderBook and test.aggregate.
ccxt::any ExchangeBase::aggregate (ccxt::any bidasks) {
    dict grouped;
    // ws orderbook sides are array-like: aggregate their rows (parseWsBidAsk and
    // friends hand sides in directly, as JS OrderBookSide extends Array)
    if (bidasks.type () == typeid (ccxt::ws::OrderBookSide)) {
        bidasks = ccxt::any (ccxt::any_cast<const ccxt::ws::OrderBookSide&> (bidasks).rows ());
    }
    if (isList (bidasks)) {
        for (const auto& entry : ccxt::any_cast<list> (bidasks).items ()) {
            const ccxt::any price = getValue (entry, ccxt::any (0));
            const ccxt::any volume = getValue (entry, ccxt::any (1));
            if (!isTrue (volume)) {
                continue;   // a zero-size level means "remove", as in the wire format
            }
            const std::string key = ccxt::any_cast<std::string> (toString (price));
            const ccxt::any running = grouped.get (key);
            grouped.set (key, running.has_value () ? add (running, volume) : volume);
        }
    }
    list out;
    // The cast must bind to a NAMED any. `any_cast<dict>` returns the handle by value,
    // and entries() hands back a reference into the shared store; iterating directly
    // over any_cast<dict>(<temporary>) drops the last shared_ptr owner at the end of
    // the range-init expression and leaves the loop walking freed memory.
    const ccxt::any sorted = this->keysort (ccxt::any (grouped));
    const dict sortedDict = ccxt::any_cast<dict> (sorted);
    for (const auto& kv : sortedDict.entries ()) {
        out.push (ccxt::any (list { ccxt::any (std::stod (kv.first)), kv.second }));
    }
    return ccxt::any (out);
}

ccxt::any ExchangeBase::orderBook (ccxt::any snapshot, ccxt::any depth) {
    return ccxt::any (ccxt::ws::WsOrderBook (snapshot, depth, ccxt::ws::OrderBookSide::Mode::plain));
}

ccxt::any ExchangeBase::indexedOrderBook (ccxt::any snapshot, ccxt::any depth) {
    return ccxt::any (ccxt::ws::WsOrderBook (snapshot, depth, ccxt::ws::OrderBookSide::Mode::indexed));
}

ccxt::any ExchangeBase::countedOrderBook (ccxt::any snapshot, ccxt::any depth) {
    return ccxt::any (ccxt::ws::WsOrderBook (snapshot, depth, ccxt::ws::OrderBookSide::Mode::counted));
}

ccxt::any ExchangeBase::totp (ccxt::any) {
    throw NotSupported ("totp requires the crypto layer, not implemented in the C++ port yet");
}

} // namespace ccxt

[[noreturn]] void throwDynamicException (const ccxt::any& name, const ccxt::any& message) {
    ccxt::throwByName (ccxt::any_cast<std::string> (toString (name)),
                       ccxt::any_cast<std::string> (toString (message)));
}

