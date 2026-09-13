#pragma once

// The dynamic value model for the transpiled C++ port.
//
// Generated code is written against `ccxt::any` and emits container literals as
// `ccxt::dict {...}` / `ccxt::list{...}` (see the OBJECT_OPENING / ARRAY_OPENING_TOKEN
// overrides in build/cppTranspiler.ts). Both are reference-semantic handles over a
// shared_ptr, for two reasons the plain std:: containers cannot satisfy:
//
//   1. Insertion order. ccxt depends on JS object key order for urlencode, rawencode
//      and request signing. std::unordered_map randomises it.
//   2. Reference semantics. Generated code mutates through a ccxt::any
//      (`::setValue(d, k, v)`, `arrayPush(a, x)`, `deleteKey(d, k)`) and relies on JS
//      aliasing. It also copies every captured local into a `[=]` lambda per async
//      call, which would deep-copy by-value containers.
//
// `ccxt::any` is the port's small-buffer-optimised replacement for ccxt::any: the
// hot payload types (bools, every integer width, floats, doubles, strings, and the
// dict/list/bytes handles) live INLINE in a 40-byte object — zero heap traffic per
// scalar/string/handle value, where ccxt::any allocated a slot per value (perf: the
// malloc/free family + ccxt::any manager were ~30% of warm CPU). Arbitrary types
// (Precise, ws futures, ...) fall back to a type-erased heap block with the exact
// ccxt::any semantics: `type()` returns the same typeids, `any_cast` has the same
// overload set, and empty is `typeid(void)`/`has_value() == false`.

#include <any>
#include <cstring>
#include <initializer_list>
#include <memory>
#include <string>
#include <typeinfo>
#include <unordered_map>
#include <utility>
#include <vector>

namespace ccxt { class any; }

// helpers.h DEFINES this at global scope (`::isTrue` — the port's convention);
// the member operator! below needs it declared first. Declared here (not in
// namespace ccxt) so it is the SAME function helpers.h defines.
bool isTrue (const ccxt::any& v);

namespace ccxt {

class dict;
class list;
class bytes;

// ---------------------------------------------------------------------------
// any — SBO value type (drop-in for the ccxt::any API the port uses)
// ---------------------------------------------------------------------------

class any {
public:
    // storage tags; kHeap covers every type outside the inline set with full
    // typeid fidelity (a real std::type_info rides in the heap block)
    enum Tag : unsigned char {
        kEmpty = 0,
        kBool,
        kInt,
        kLong,
        kLongLong,
        kUnsigned,
        kULongLong,
        kSizeT,
        kFloat,
        kDouble,
        kString,
        kDict,
        kList,
        kBytes,
        kHeap = 255,
    };

    any () noexcept : tag_ (kEmpty) {}
    any (std::nullptr_t) = delete;

    template <class T,
              class = std::enable_if_t<!std::is_same_v<std::decay_t<T>, any>>>
    any (T&& v) {
        this->construct (std::forward<T> (v));
    }

    any (const any& other) { this->copyConstruct (other); }
    any (any&& other) noexcept { this->moveConstruct (other); }
    ~any () { this->destroy (); }

    any& operator= (const any& other) {
        if (this != &other) {
            this->destroy ();
            this->copyConstruct (other);
        }
        return *this;
    }
    any& operator= (any&& other) noexcept {
        if (this != &other) {
            this->destroy ();
            this->moveConstruct (other);
        }
        return *this;
    }
    template <class T,
              class = std::enable_if_t<!std::is_same_v<std::decay_t<T>, any>>>
    any& operator= (T&& v) {
        this->destroy ();
        this->construct (std::forward<T> (v));
        return *this;
    }

    bool has_value () const noexcept { return this->tag_ != kEmpty; }
    // JS `!x` — the negation of truthiness. A MEMBER, not a free function:
    // a free ccxt::operator!(const any&) is ADL-visible for
    // std::is_array<ccxt::any> (the template argument's namespace is ccxt),
    // which makes std::future<ccxt::any>'s static_asserts ambiguous — the
    // same trap the port hit with std::any, but now ccxt::any IS a ccxt type.
    bool operator! () const { return !isTrue (*this); }
    const std::type_info& type () const noexcept;
    void reset () noexcept {
        this->destroy ();
        this->tag_ = kEmpty;
    }
    // typed triple-move: a byte-level swap is NOT valid — libstdc++'s SSO
    // string stores a self-referential data pointer, and memcpy'ing it to a
    // new address makes the destructor free the OLD buffer
    void swap (any& other) noexcept {
        any tmp (std::move (*this));          // *this empty, tmp holds A
        this->operator= (std::move (other));  // B into *this
        other.operator= (std::move (tmp));    // A into other
    }

    // the port's style: internals are public (see OrderedMap below); any_cast
    // and the inline machinery below read them directly
    unsigned char tag_;
    alignas (8) unsigned char buf_[32];

    struct heapBlock {
        void (*destroy) (void*) noexcept;
        void* (*copy) (const void*);
        const std::type_info* t;
        alignas (std::max_align_t) unsigned char storage[1];
    };

    heapBlock* heap () const noexcept {
        return *reinterpret_cast<heapBlock* const*> (this->buf_);
    }

private:
    // defined AFTER the container classes (typeid needs complete types)
    static const std::type_info& typeOf (Tag t) noexcept;

    template <class T> void construct (T&& v);
    void copyConstruct (const any& other);
    void moveConstruct (any& other) noexcept;
    void destroy () noexcept;

    template <class D> struct heapOps {
        static void destroy (void* block) noexcept {
            auto* b = static_cast<heapBlock*> (block);
            reinterpret_cast<D*> (b->storage)->~D ();
        }
        static void* copy (const void* block) {
            const auto* src = static_cast<const heapBlock*> (block);
            auto* out = static_cast<heapBlock*> (
                ::operator new (sizeof (heapBlock) + sizeof (D)));
            out->destroy = &heapOps<D>::destroy;
            out->copy = &heapOps<D>::copy;
            out->t = src->t;
            new (out->storage) D (*reinterpret_cast<const D*> (src->storage));
            return out;
        }
    };

    // dispatch indirection: taking heapOps<D>::copy's address would
    // instantiate its body even for non-copyable D; the if-constexpr here
    // keeps the copy body uninstantiated for those types
    template <class D> static void* heapCopyDispatch (const void* block) {
        if constexpr (std::is_copy_constructible_v<D>) {
            return heapOps<D>::copy (block);
        } else {
            return nullptr;
        }
    }
};

// NOTE: any::typeOf and any::type are defined AFTER the container classes —
// typeid(dict/list/bytes) requires the complete types.

template <class T> inline void any::construct (T&& v) {
    using D = std::decay_t<T>;
    if constexpr (std::is_same_v<D, bool>) {
        this->tag_ = kBool;
        new (this->buf_) bool (v);
    } else if constexpr (std::is_same_v<D, int>) {
        this->tag_ = kInt;
        new (this->buf_) int (v);
    } else if constexpr (std::is_same_v<D, long>) {
        this->tag_ = kLong;
        new (this->buf_) long (v);
    } else if constexpr (std::is_same_v<D, long long>) {
        this->tag_ = kLongLong;
        new (this->buf_) long long (v);
    } else if constexpr (std::is_same_v<D, unsigned>) {
        this->tag_ = kUnsigned;
        new (this->buf_) unsigned (v);
    } else if constexpr (std::is_same_v<D, unsigned long long>) {
        this->tag_ = kULongLong;
        new (this->buf_) unsigned long long (v);
    } else if constexpr (std::is_same_v<D, std::size_t>) {
        this->tag_ = kSizeT;
        new (this->buf_) std::size_t (v);
    } else if constexpr (std::is_same_v<D, float>) {
        this->tag_ = kFloat;
        new (this->buf_) float (v);
    } else if constexpr (std::is_same_v<D, double>) {
        this->tag_ = kDouble;
        new (this->buf_) double (v);
    } else if constexpr (std::is_same_v<D, std::string>) {
        this->tag_ = kString;
        new (this->buf_) std::string (std::forward<T> (v));
    } else if constexpr (std::is_same_v<D, dict>) {
        this->tag_ = kDict;
        new (this->buf_) dict (std::forward<T> (v));
    } else if constexpr (std::is_same_v<D, list>) {
        this->tag_ = kList;
        new (this->buf_) list (std::forward<T> (v));
    } else if constexpr (std::is_same_v<D, bytes>) {
        this->tag_ = kBytes;
        new (this->buf_) bytes (std::forward<T> (v));
    } else {
        auto* block = static_cast<heapBlock*> (
            ::operator new (sizeof (heapBlock) + sizeof (D)));
        block->destroy = &heapOps<D>::destroy;
        block->copy = &heapCopyDispatch<D>;
        block->t = &typeid (D);
        new (block->storage) D (std::forward<T> (v));
        *reinterpret_cast<heapBlock**> (this->buf_) = block;
        this->tag_ = kHeap;
    }
}

// ---------------------------------------------------------------------------
// any_cast — the ccxt::any_cast overload set
// ---------------------------------------------------------------------------

template <class T> inline T* anyCastPtr (any& v) noexcept {
    if (!v.has_value ()) {
        return nullptr;
    }
    using D = std::remove_cv_t<T>;
    if (v.tag_ != any::kHeap) {
        if (v.type () == typeid (D)) {
            return reinterpret_cast<T*> (v.buf_);
        }
        return nullptr;
    }
    any::heapBlock* block = v.heap ();
    if (*block->t == typeid (D)) {
        return reinterpret_cast<T*> (block->storage);
    }
    return nullptr;
}

template <class T> inline const T* anyCastPtr (const any& v) noexcept {
    if (!v.has_value ()) {
        return nullptr;
    }
    using D = std::remove_cv_t<T>;
    if (v.tag_ != any::kHeap) {
        if (v.type () == typeid (D)) {
            return reinterpret_cast<const T*> (v.buf_);
        }
        return nullptr;
    }
    const any::heapBlock* block = v.heap ();
    if (*block->t == typeid (D)) {
        return reinterpret_cast<const T*> (block->storage);
    }
    return nullptr;
}

template <class T> inline T any_cast (any& v) {
    using U = std::remove_cv_t<std::remove_reference_t<T>>;
    static_assert (std::is_constructible_v<T, U&>,
        "ccxt::any_cast<T> requires T to be copy-constructible or a reference");
    if (U* p = anyCastPtr<U> (v)) {
        return static_cast<T> (*p);
    }
    throw std::bad_any_cast ();
}

template <class T> inline T any_cast (const any& v) {
    using U = std::remove_cv_t<std::remove_reference_t<T>>;
    static_assert (std::is_constructible_v<T, const U&>,
        "ccxt::any_cast<T> requires T to be copy-constructible or a reference");
    if (const U* p = anyCastPtr<U> (v)) {
        return static_cast<T> (*p);
    }
    throw std::bad_any_cast ();
}

template <class T> inline T any_cast (any&& v) {
    using U = std::remove_cv_t<std::remove_reference_t<T>>;
    static_assert (std::is_constructible_v<T, U&&>,
        "ccxt::any_cast<T> requires T to be move-constructible or a reference");
    if (U* p = anyCastPtr<U> (v)) {
        return static_cast<T> (std::move (*p));
    }
    throw std::bad_any_cast ();
}

template <class T> inline const T* any_cast (const any* v) noexcept {
    return v ? anyCastPtr<T> (*v) : nullptr;
}

template <class T> inline T* any_cast (any* v) noexcept {
    return v ? anyCastPtr<T> (*v) : nullptr;
}

// ---------------------------------------------------------------------------
// dict — insertion-ordered string-keyed map with O(1) lookup
// ---------------------------------------------------------------------------

class OrderedMap {
public:
    using entry = std::pair<std::string, any>;

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
    any get (const std::string& key) const {
        if (this->linearMode ()) {
            for (const auto& kv : this->entries) {
                if (kv.first == key) return kv.second;
            }
            return any {};
        }
        const auto it = this->offsets.find (key);
        return (it == this->offsets.end ()) ? any {} : this->entries[it->second].second;
    }

    void set (const std::string& key, const any& value) {
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
    any get (const std::string& k) const { return this->store->get (k); }
    void set (const std::string& k, const any& v) { this->store->set (k, v); }
    void erase (const std::string& k) { this->store->erase (k); }
    std::size_t size () const { return this->store->size (); }

    // Returns a reference INTO the shared store. `any_cast<dict>` yields the
    // handle by value, so `for (auto& kv : any_cast<dict>(f()).entries())` frees
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
    std::shared_ptr<std::vector<any>> store;

    list () : store (std::make_shared<std::vector<any>> ()) {}

    // matches the emitted literal: ccxt::list{ a, b }
    list (std::initializer_list<any> init)
        : store (std::make_shared<std::vector<any>> (init)) {}

    explicit list (std::vector<any> init)
        : store (std::make_shared<std::vector<any>> (std::move (init))) {}

    std::size_t size () const { return this->store->size (); }

    // out of range yields undefined rather than throwing, matching JS
    any get (long i) const {
        if (i < 0 || static_cast<std::size_t> (i) >= this->store->size ()) {
            return any {};
        }
        return (*this->store)[static_cast<std::size_t> (i)];
    }

    // assigning past the end grows the array with holes, matching JS
    void set (long i, const any& v) {
        if (i < 0) {
            return;
        }
        const std::size_t idx = static_cast<std::size_t> (i);
        if (idx >= this->store->size ()) {
            this->store->resize (idx + 1);
        }
        (*this->store)[idx] = v;
    }

    void push (const any& v) { this->store->push_back (v); }

    const std::vector<any>& items () const { return *this->store; }
    std::vector<any>& items () { return *this->store; }

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

inline void any::copyConstruct (const any& other) {
    this->tag_ = other.tag_;
    if (other.tag_ == kEmpty) {
        return;
    }
    if (other.tag_ == kHeap) {
        const heapBlock* src = other.heap ();
        if (src->copy == nullptr) {
            throw std::bad_any_cast ();   // stored type is not copyable
        }
        *reinterpret_cast<heapBlock**> (this->buf_) =
            static_cast<heapBlock*> (src->copy (src));
        return;
    }
    switch (other.tag_) {
    case kBool:
        new (this->buf_) bool (*reinterpret_cast<const bool*> (other.buf_));
        break;
    case kInt:
        new (this->buf_) int (*reinterpret_cast<const int*> (other.buf_));
        break;
    case kLong:
        new (this->buf_) long (*reinterpret_cast<const long*> (other.buf_));
        break;
    case kLongLong:
        new (this->buf_) long long (*reinterpret_cast<const long long*> (other.buf_));
        break;
    case kUnsigned:
        new (this->buf_) unsigned (*reinterpret_cast<const unsigned*> (other.buf_));
        break;
    case kULongLong:
        new (this->buf_) unsigned long long (
            *reinterpret_cast<const unsigned long long*> (other.buf_));
        break;
    case kSizeT:
        new (this->buf_) std::size_t (*reinterpret_cast<const std::size_t*> (other.buf_));
        break;
    case kFloat:
        new (this->buf_) float (*reinterpret_cast<const float*> (other.buf_));
        break;
    case kDouble:
        new (this->buf_) double (*reinterpret_cast<const double*> (other.buf_));
        break;
    case kString:
        new (this->buf_) std::string (*reinterpret_cast<const std::string*> (other.buf_));
        break;
    case kDict:
        new (this->buf_) dict (*reinterpret_cast<const dict*> (other.buf_));
        break;
    case kList:
        new (this->buf_) list (*reinterpret_cast<const list*> (other.buf_));
        break;
    case kBytes:
        new (this->buf_) bytes (*reinterpret_cast<const bytes*> (other.buf_));
        break;
    default:
        break;
    }
}

inline void any::moveConstruct (any& other) noexcept {
    this->tag_ = other.tag_;
    other.tag_ = kEmpty;
    if (this->tag_ == kEmpty) {
        return;
    }
    if (this->tag_ == kHeap) {
        // steal the block pointer
        *reinterpret_cast<heapBlock**> (this->buf_) =
            *reinterpret_cast<heapBlock**> (other.buf_);
        return;
    }
    switch (this->tag_) {
    case kString:
        new (this->buf_) std::string (
            std::move (*reinterpret_cast<std::string*> (other.buf_)));
        break;
    case kDict:
        new (this->buf_) dict (
            std::move (*reinterpret_cast<dict*> (other.buf_)));
        break;
    case kList:
        new (this->buf_) list (
            std::move (*reinterpret_cast<list*> (other.buf_)));
        break;
    case kBytes:
        new (this->buf_) bytes (
            std::move (*reinterpret_cast<bytes*> (other.buf_)));
        break;
    default:
        // scalars: bitwise move
        std::memcpy (this->buf_, other.buf_, 32);
        break;
    }
}

inline void any::destroy () noexcept {
    if (this->tag_ == kEmpty) {
        return;
    }
    if (this->tag_ == kHeap) {
        heapBlock* block = this->heap ();
        block->destroy (block);
        ::operator delete (block);
        this->tag_ = kEmpty;
        return;
    }
    switch (this->tag_) {
    case kString:
        reinterpret_cast<std::string*> (this->buf_)->~basic_string ();
        break;
    case kDict:
        reinterpret_cast<dict*> (this->buf_)->~dict ();
        break;
    case kList:
        reinterpret_cast<list*> (this->buf_)->~list ();
        break;
    case kBytes:
        reinterpret_cast<bytes*> (this->buf_)->~bytes ();
        break;
    default:
        break;   // trivially destructible scalars
    }
    this->tag_ = kEmpty;
}


// ---------------------------------------------------------------------------
// type inspection over ccxt::any
// ---------------------------------------------------------------------------
//
// Numeric literals arrive as int or double depending on how TypeScript spelled
// them (`60000.0` transpiles to `60000`), so every numeric predicate accepts
// both and callers must not assume one.

inline const std::type_info& any::typeOf (Tag t) noexcept {
    switch (t) {
    case kEmpty: return typeid (void);
    case kBool: return typeid (bool);
    case kInt: return typeid (int);
    case kLong: return typeid (long);
    case kLongLong: return typeid (long long);
    case kUnsigned: return typeid (unsigned);
    case kULongLong: return typeid (unsigned long long);
    case kSizeT: return typeid (std::size_t);
    case kFloat: return typeid (float);
    case kDouble: return typeid (double);
    case kString: return typeid (std::string);
    case kDict: return typeid (dict);
    case kList: return typeid (list);
    case kBytes: return typeid (bytes);
    default: return typeid (void);
    }
}

inline const std::type_info& any::type () const noexcept {
    if (this->tag_ == kHeap) {
        return *this->heap ()->t;
    }
    return typeOf (static_cast<Tag> (this->tag_));
}

inline bool isDict   (const any& v) { return v.type () == typeid (dict); }
inline bool isList   (const any& v) { return v.type () == typeid (list); }
inline bool isStr    (const any& v) { return v.type () == typeid (std::string); }
inline bool isBoolean(const any& v) { return v.type () == typeid (bool); }
inline bool isUndef  (const any& v) { return !v.has_value (); }
inline bool isBytes  (const any& v) { return v.type () == typeid (bytes); }

inline bool isInt (const any& v) {
    return v.type () == typeid (int) || v.type () == typeid (long)
        || v.type () == typeid (long long) || v.type () == typeid (unsigned)
        || v.type () == typeid (std::size_t);
}

inline bool isFloat (const any& v) {
    return v.type () == typeid (double) || v.type () == typeid (float);
}

inline bool isNum (const any& v) { return isInt (v) || isFloat (v); }

// widens any numeric payload to double; caller checks isNum first
inline double toDouble (const any& v) {
    if (v.type () == typeid (double))          return any_cast<double> (v);
    if (v.type () == typeid (float))           return static_cast<double> (any_cast<float> (v));
    if (v.type () == typeid (int))             return static_cast<double> (any_cast<int> (v));
    if (v.type () == typeid (long))            return static_cast<double> (any_cast<long> (v));
    if (v.type () == typeid (long long))       return static_cast<double> (any_cast<long long> (v));
    if (v.type () == typeid (unsigned))        return static_cast<double> (any_cast<unsigned> (v));
    if (v.type () == typeid (std::size_t))     return static_cast<double> (any_cast<std::size_t> (v));
    return 0.0;
}

inline long long toLong (const any& v) {
    // integer payloads convert exactly; the double round-trip corrupts anything
    // beyond 2^53 (weex algoId 782042010738492300 -> ...288)
    if (v.type () == typeid (long long))          return any_cast<long long> (v);
    if (v.type () == typeid (long))               return static_cast<long long> (any_cast<long> (v));
    if (v.type () == typeid (int))                return static_cast<long long> (any_cast<int> (v));
    if (v.type () == typeid (unsigned long long)) return static_cast<long long> (any_cast<unsigned long long> (v));
    if (v.type () == typeid (unsigned))           return static_cast<long long> (any_cast<unsigned> (v));
    if (v.type () == typeid (std::size_t) && typeid (std::size_t) != typeid (unsigned long long))
        return static_cast<long long> (any_cast<std::size_t> (v));
    return static_cast<long long> (toDouble (v));
}

} // namespace ccxt
