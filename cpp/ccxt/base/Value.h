#pragma once

// The dynamic value model for the transpiled C++ port.
//
// Generated code is written against `std::any` and emits container literals as
// `ccxt::dict {...}` / `ccxt::list{...}` (see the OBJECT_OPENING / ARRAY_OPENING_TOKEN
// overrides in build/cppTranspiler.ts). Both are reference-semantic handles over a
// shared_ptr, for two reasons the plain std:: containers cannot satisfy:
//
//   1. Insertion order. ccxt depends on JS object key order for urlencode, rawencode
//      and request signing. std::unordered_map randomises it.
//   2. Reference semantics. Generated code mutates through a std::any
//      (`::setValue(d, k, v)`, `arrayPush(a, x)`, `deleteKey(d, k)`) and relies on JS
//      aliasing. It also copies every captured local into a `[=]` lambda per async
//      call, which would deep-copy by-value containers.

#include <any>
#include <initializer_list>
#include <memory>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

namespace ccxt {

// ---------------------------------------------------------------------------
// dict — insertion-ordered string-keyed map with O(1) lookup
// ---------------------------------------------------------------------------

class OrderedMap {
public:
    using entry = std::pair<std::string, std::any>;

    // dicts with few keys (the vast majority in market data: precision/limits/
    // filters/fee dicts are 2-10 entries) skip the unordered_map index entirely:
    // a linear scan over the vector beats hashing a string + map lookup + bounds
    // check, especially with the port's -O0 TU compiles of the hash machinery.
    static constexpr std::size_t LINEAR_THRESHOLD = 8;

    std::vector<entry> entries;
    std::unordered_map<std::string, std::size_t> offsets;

    bool linearMode () const { return this->entries.size () <= LINEAR_THRESHOLD; }

    bool has (const std::string& key) const {
        if (this->linearMode ()) {
            for (const auto& kv : this->entries) {
                if (kv.first == key) return true;
            }
            return false;
        }
        return this->offsets.find (key) != this->offsets.end ();
    }

    // returns an empty any for a missing key, matching JS `obj[k] === undefined`
    std::any get (const std::string& key) const {
        if (this->linearMode ()) {
            for (const auto& kv : this->entries) {
                if (kv.first == key) return kv.second;
            }
            return std::any {};
        }
        const auto it = this->offsets.find (key);
        return (it == this->offsets.end ()) ? std::any {} : this->entries[it->second].second;
    }

    void set (const std::string& key, const std::any& value) {
        if (this->entries.size () < LINEAR_THRESHOLD) {
            for (auto& kv : this->entries) {
                if (kv.first == key) {
                    kv.second = value;   // in place: order preserved
                    return;
                }
            }
            this->entries.emplace_back (key, value);
            if (this->entries.size () == LINEAR_THRESHOLD) {
                // crossing into indexed mode: build the offset table once
                this->rebuildOffsets ();
            }
            return;
        }
        const auto it = this->offsets.find (key);
        if (it != this->offsets.end ()) {
            this->entries[it->second].second = value;   // in place: order preserved
            return;
        }
        this->offsets.emplace (key, this->entries.size ());
        this->entries.emplace_back (key, value);
    }

    // pre-size both stores (jsonToAny knows the object size up front); avoids
    // the rehash/reallocation churn of growing a 4000-key dict 12 times
    void reserve (std::size_t n) {
        this->entries.reserve (n);
        if (n > LINEAR_THRESHOLD) this->offsets.reserve (n);
    }

    // JS `delete obj[k]` — reindexes, so it is O(n); rare enough not to matter
    void erase (const std::string& key) {
        if (this->linearMode ()) {
            for (auto it = this->entries.begin (); it != this->entries.end (); ++it) {
                if (it->first == key) {
                    this->entries.erase (it);
                    return;
                }
            }
            return;
        }
        const auto it = this->offsets.find (key);
        if (it == this->offsets.end ()) {
            return;
        }
        this->entries.erase (this->entries.begin () + static_cast<long> (it->second));
        this->rebuildOffsets ();
    }

    std::size_t size () const { return this->entries.size (); }

private:
    void rebuildOffsets () {
        this->offsets.clear ();
        this->offsets.reserve (this->entries.size ());
        for (std::size_t i = 0; i < this->entries.size (); i++) {
            this->offsets.emplace (this->entries[i].first, i);
        }
    }
};

class dict {
public:
    std::shared_ptr<OrderedMap> store;

    dict () : store (std::make_shared<OrderedMap> ()) {}

    // matches the emitted literal: ccxt::dict { { std::string("k"), v }, ... }
    dict (std::initializer_list<OrderedMap::entry> init) : store (std::make_shared<OrderedMap> ()) {
        for (const auto& kv : init) {
            this->store->set (kv.first, kv.second);
        }
    }

    bool has (const std::string& k) const { return this->store->has (k); }
    std::any get (const std::string& k) const { return this->store->get (k); }
    void set (const std::string& k, const std::any& v) { this->store->set (k, v); }
    void erase (const std::string& k) { this->store->erase (k); }
    std::size_t size () const { return this->store->size (); }

    // Returns a reference INTO the shared store. `std::any_cast<dict>` yields the
    // handle by value, so `for (auto& kv : std::any_cast<dict>(f()).entries())` frees
    // the store before the first iteration. Always bind the cast to a named local.
    const std::vector<OrderedMap::entry>& entries () const { return this->store->entries; }

    // identity, not value equality — `a === b` on two JS objects
    bool sameAs (const dict& other) const { return this->store == other.store; }
};

// ---------------------------------------------------------------------------
// list — reference-semantic array
// ---------------------------------------------------------------------------

class list {
public:
    std::shared_ptr<std::vector<std::any>> store;

    list () : store (std::make_shared<std::vector<std::any>> ()) {}

    // matches the emitted literal: ccxt::list{ a, b }
    list (std::initializer_list<std::any> init)
        : store (std::make_shared<std::vector<std::any>> (init)) {}

    explicit list (std::vector<std::any> init)
        : store (std::make_shared<std::vector<std::any>> (std::move (init))) {}

    std::size_t size () const { return this->store->size (); }

    // out of range yields undefined rather than throwing, matching JS
    std::any get (long i) const {
        if (i < 0 || static_cast<std::size_t> (i) >= this->store->size ()) {
            return std::any {};
        }
        return (*this->store)[static_cast<std::size_t> (i)];
    }

    // assigning past the end grows the array with holes, matching JS
    void set (long i, const std::any& v) {
        if (i < 0) {
            return;
        }
        const std::size_t idx = static_cast<std::size_t> (i);
        if (idx >= this->store->size ()) {
            this->store->resize (idx + 1);
        }
        (*this->store)[idx] = v;
    }

    void push (const std::any& v) { this->store->push_back (v); }

    const std::vector<std::any>& items () const { return *this->store; }
    std::vector<std::any>& items () { return *this->store; }

    bool sameAs (const list& other) const { return this->store == other.store; }
};

// ---------------------------------------------------------------------------
// bytes — reference-semantic binary buffer
// ---------------------------------------------------------------------------
//
// JS ccxt carries binary as Uint8Array, and it must NOT be conflated with a string:
// safeString would happily return a digest as text, and json() would try to serialise
// raw bytes as UTF-8. So binary gets its own type rather than reusing std::string,
// with the same shared_ptr handle semantics as dict and list.

class bytes {
public:
    std::shared_ptr<std::vector<unsigned char>> store;

    bytes () : store (std::make_shared<std::vector<unsigned char>> ()) {}

    explicit bytes (std::vector<unsigned char> init)
        : store (std::make_shared<std::vector<unsigned char>> (std::move (init))) {}

    // from a string's raw octets — this is TS `encode()`, i.e. utf8.decode
    explicit bytes (const std::string& text)
        : store (std::make_shared<std::vector<unsigned char>> (text.begin (), text.end ())) {}

    std::size_t size () const { return this->store->size (); }
    const std::vector<unsigned char>& data () const { return *this->store; }
    std::vector<unsigned char>& data () { return *this->store; }

    // TS `decode()` — the octets back as a string
    std::string toString () const {
        return std::string (this->store->begin (), this->store->end ());
    }

    bool sameAs (const bytes& other) const { return this->store == other.store; }
};

// ---------------------------------------------------------------------------
// type inspection over std::any
// ---------------------------------------------------------------------------
//
// Numeric literals arrive as int or double depending on how TypeScript spelled
// them (`60000.0` transpiles to `60000`), so every numeric predicate accepts
// both and callers must not assume one.

inline bool isDict   (const std::any& v) { return v.type () == typeid (dict); }
inline bool isList   (const std::any& v) { return v.type () == typeid (list); }
inline bool isStr    (const std::any& v) { return v.type () == typeid (std::string); }
inline bool isBoolean(const std::any& v) { return v.type () == typeid (bool); }
inline bool isUndef  (const std::any& v) { return !v.has_value (); }
inline bool isBytes  (const std::any& v) { return v.type () == typeid (bytes); }

inline bool isInt (const std::any& v) {
    return v.type () == typeid (int) || v.type () == typeid (long)
        || v.type () == typeid (long long) || v.type () == typeid (unsigned)
        || v.type () == typeid (std::size_t);
}

inline bool isFloat (const std::any& v) {
    return v.type () == typeid (double) || v.type () == typeid (float);
}

inline bool isNum (const std::any& v) { return isInt (v) || isFloat (v); }

// widens any numeric payload to double; caller checks isNum first
inline double toDouble (const std::any& v) {
    if (v.type () == typeid (double))          return std::any_cast<double> (v);
    if (v.type () == typeid (float))           return static_cast<double> (std::any_cast<float> (v));
    if (v.type () == typeid (int))             return static_cast<double> (std::any_cast<int> (v));
    if (v.type () == typeid (long))            return static_cast<double> (std::any_cast<long> (v));
    if (v.type () == typeid (long long))       return static_cast<double> (std::any_cast<long long> (v));
    if (v.type () == typeid (unsigned))        return static_cast<double> (std::any_cast<unsigned> (v));
    if (v.type () == typeid (std::size_t))     return static_cast<double> (std::any_cast<std::size_t> (v));
    return 0.0;
}

inline long long toLong (const std::any& v) {
    // integer payloads convert exactly; the double round-trip corrupts anything
    // beyond 2^53 (weex algoId 782042010738492300 -> ...288)
    if (v.type () == typeid (long long))          return std::any_cast<long long> (v);
    if (v.type () == typeid (long))               return static_cast<long long> (std::any_cast<long> (v));
    if (v.type () == typeid (int))                return static_cast<long long> (std::any_cast<int> (v));
    if (v.type () == typeid (unsigned long long)) return static_cast<long long> (std::any_cast<unsigned long long> (v));
    if (v.type () == typeid (unsigned))           return static_cast<long long> (std::any_cast<unsigned> (v));
    if (v.type () == typeid (std::size_t) && typeid (std::size_t) != typeid (unsigned long long))
        return static_cast<long long> (std::any_cast<std::size_t> (v));
    return static_cast<long long> (toDouble (v));
}

} // namespace ccxt
