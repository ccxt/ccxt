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
#include <cstdint>
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

struct JsonViewRoot;   // defined in JsonView.h (needs simdjson)

// view kinds — the node shape of a lazy json view. Scalars materialize on
// access; only containers stay lazy.
enum : std::uint32_t {
    kJvObject = 1, kJvArray = 2, kJvString = 3, kJvNumber = 4, kJvBool = 5,
    kJvNull = 6, kJvDeferred = 7,   // an array element not yet positioned
};

// A lazy handle into a parsed-but-not-materialized JSON document. Fits the
// any's 32-byte SBO: the root keeps the padded buffer + parser + document +
// the shared sequential cursor alive for every view that references it.
struct jsonView {
    std::shared_ptr<JsonViewRoot> root;
    std::uint32_t kind;   // kJv* above
    std::uint32_t id;     // byte offset of the node in the root's buffer
    std::uint32_t idx;    // kJvDeferred: the element index within the array
};

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
        kView = 24,
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
    } else if constexpr (std::is_same_v<D, jsonView>) {
        this->tag_ = kView;
        new (this->buf_) jsonView (std::forward<T> (v));
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
// InternedKey — a 16-byte (pointer, length) view into a global pool of
// interned dict-key strings. Market data repeats the same keys ("symbol",
// "precision", "price"…) across hundreds of thousands of dicts; interning
// stores each distinct key once and shrinks every OrderedMap entry from 72 to
// 56 bytes. Implicit std::string/std::string_view conversions keep the ~30
// string-context consumers compiling unchanged; comparisons never intern (the
// string→string_view conversion is standard and beats the user-defined
// string→InternedKey conversion in overload resolution).
// ---------------------------------------------------------------------------
namespace intern {
    std::string_view internKey (std::string_view s);   // defined in helpers.cpp
}

class InternedKey {
    const char* data_ = nullptr;
    std::uint32_t len_ = 0;

public:
    InternedKey () = default;
    InternedKey (const std::string& s) { *this = InternedKey (std::string_view (s)); }
    InternedKey (std::string_view s) {
        const std::string_view pooled = intern::internKey (s);
        this->data_ = pooled.data ();
        this->len_ = static_cast<std::uint32_t> (pooled.size ());
    }

    const char* data () const noexcept { return data_; }
    std::size_t size () const noexcept { return len_; }
    bool empty () const noexcept { return len_ == 0; }
    std::string_view view () const noexcept { return { data_, len_ }; }
    std::string str () const { return std::string (data_, len_); }
    operator std::string () const { return str (); }
    operator std::string_view () const noexcept { return view (); }
};

inline bool operator== (const InternedKey& a, const InternedKey& b) noexcept {
    return a.data () == b.data () || a.view () == b.view ();
}
inline bool operator== (const InternedKey& a, std::string_view b) noexcept {
    return a.view () == b;
}
inline bool operator== (std::string_view a, const InternedKey& b) noexcept {
    return b == a;
}
// exact-match overloads: `InternedKey == std::string` is ambiguous between the
// string_view and InternedKey conversions (both user-defined) without these
inline bool operator== (const InternedKey& a, const std::string& b) noexcept {
    return a.view () == std::string_view (b);
}
inline bool operator== (const std::string& a, const InternedKey& b) noexcept {
    return b == a;
}
// const char* literal overload: `kv.first == "alg"` is ambiguous between the
// string_view and std::string conversions without it
inline bool operator== (const InternedKey& a, const char* b) noexcept {
    return a.view () == std::string_view (b);
}
inline bool operator== (const char* a, const InternedKey& b) noexcept {
    return b == a;
}

// ---------------------------------------------------------------------------
// dict — insertion-ordered string-keyed map with O(1) lookup
// ---------------------------------------------------------------------------

// 12-byte packed probe-table slot: 25% smaller than pair<size_t, size_t>
// (the markets dict's resident index is ~10MB — this trims ~2.5MB).
// Unaligned 64-bit loads are effectively free on x86/ARM64 for this access
// pattern (one probe per lookup, cache-resident).
struct __attribute__ ((packed)) indexSlot {
    std::uint64_t h;
    std::uint32_t e;
};

class OrderedMap {
public:
    using entry = std::pair<InternedKey, any>;

    // dicts with few keys (the vast majority in market data: precision/limits/
    // filters/fee dicts are 2-10 entries) skip the hash index entirely: a linear
    // scan over the vector beats hashing a string + probe + bounds check.
    static constexpr std::size_t LINEAR_THRESHOLD = 8;

    // sentinel hashes for the flat index: empty slot / tombstone (deleted key).
    // A real std::hash<string> colliding with these is 2^-64 — the same
    // sentinel-trust argument CPython's dict makes.
    static constexpr std::size_t EMPTY_HASH = ~static_cast<std::size_t> (0);
    static constexpr std::size_t TOMB_HASH = EMPTY_HASH - 1;
    static constexpr std::size_t NPOS = EMPTY_HASH;

    // insertion-ordered dense entries; the key string lives HERE and nowhere
    // else (no duplicate keys in the index — CPython's keys/values design)
    std::vector<entry> entries;
    // flat open-addressing probe table: (hash, entryIndex), size a power of two,
    // load factor <= 0.5. Node-free: one contiguous allocation per dict, no
    // per-key malloc, no pointer chasing. indexDirty: setNew() appends without
    // maintaining the table; the first lookup rebuilds it.
    std::vector<indexSlot> index;
    mutable bool indexDirty = false;

    bool linearMode () const { return this->entries.size () <= LINEAR_THRESHOLD; }

    // indexed-mode probe: entry index for key, or NPOS. Skips tombstones.
    std::size_t findIdx (const std::string& key) const {
        if (this->indexDirty) this->rebuildIndexNow ();
        if (this->index.empty ()) return NPOS;
        const std::size_t h = std::hash<std::string_view> {} (key);
        const std::size_t mask = this->index.size () - 1;
        std::size_t i = h & mask;
        for (;;) {
            const indexSlot& slot = this->index[i];
            if (slot.h == EMPTY_HASH) return NPOS;
            if (slot.h != TOMB_HASH && slot.h == h
                && this->entries[slot.e].first == key) {
                return slot.e;
            }
            i = (i + 1) & mask;
        }
    }

    bool has (const std::string& key) const {
        if (this->linearMode ()) {
            for (const auto& kv : this->entries) {
                if (kv.first == key) return true;
            }
            return false;
        }
        return this->findIdx (key) != NPOS;
    }

    // returns an empty any for a missing key, matching JS `obj[k] === undefined`
    any get (const std::string& key) const {
        if (this->linearMode ()) {
            for (const auto& kv : this->entries) {
                if (kv.first == key) return kv.second;
            }
            return any {};
        }
        const std::size_t idx = this->findIdx (key);
        return (idx == NPOS) ? any {} : this->entries[idx].second;
    }

    void set (const std::string& key, const any& value) {
        if (this->linearMode ()) {
            for (auto& kv : this->entries) {
                if (kv.first == key) {
                    kv.second = value;   // in place: order preserved
                    return;
                }
            }
            this->entries.emplace_back (key, value);
            // crossing into indexed mode: build the probe table once. (Built at
            // the 9th key, not the 8th — dicts that stop at exactly 8 keys never
            // pay for an index their lookups don't use.)
            if (this->entries.size () > LINEAR_THRESHOLD) this->buildIndex ();
            return;
        }
        const std::size_t idx = this->findIdx (key);
        if (idx != NPOS) {
            this->entries[idx].second = value;   // in place: order preserved
            return;
        }
        if ((this->entries.size () + 1) * 2 > this->index.size ()) this->buildIndex ();
        this->entries.emplace_back (key, value);
        this->insertSlot (std::hash<std::string_view> {} (key), this->entries.size () - 1);
    }

    // unchecked append for JSON object builds: the parser guarantees the key
    // is new (JSON keys are unique), so the linear scan / index probe of set()
    // is pure waste during construction. The probe index builds lazily on the
    // first lookup after the bulk insert (indexDirty), so dicts that are only
    // ever built and read stay scan-free and index-free until needed.
    void setNew (const InternedKey& key, const any& value) {
        this->entries.emplace_back (key, value);
        if (this->entries.size () > LINEAR_THRESHOLD && !this->index.empty ()) {
            if (this->entries.size () * 2 <= this->index.size ()) {
                this->insertSlot (std::hash<std::string_view> {} (key.view ()), this->entries.size () - 1);
            } else {
                this->indexDirty = true;
            }
        } else if (this->entries.size () > LINEAR_THRESHOLD) {
            this->indexDirty = true;
        }
    }

    // pre-size the entries store (jsonToAny knows the object size up front);
    // avoids the reallocation churn of growing a 4000-key dict 12 times. The
    // probe index rebuilds geometrically on demand (rehash is pure arithmetic,
    // no per-key allocation — cheaper than pre-sizing it).
    void reserve (std::size_t n) {
        this->entries.reserve (n);
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
        const std::size_t idx = this->findIdx (key);
        if (idx == NPOS) {
            return;
        }
        this->entries.erase (this->entries.begin () + static_cast<long> (idx));
        if (this->entries.size () <= LINEAR_THRESHOLD) {
            this->index.clear ();   // back to linear mode
        } else {
            this->buildIndex ();
        }
    }

    std::size_t size () const { return this->entries.size (); }

private:
    // slot count: smallest power of two holding 2n (load factor <= 0.5, so
    // the probe never degenerates)
    static std::size_t slotCount (std::size_t n) {
        std::size_t slots = 8;
        while (slots < n * 2) slots <<= 1;
        return slots;
    }

    void insertSlot (std::size_t h, std::size_t e) {
        const std::size_t mask = this->index.size () - 1;
        std::size_t i = h & mask;
        while (this->index[i].h != EMPTY_HASH && this->index[i].h != TOMB_HASH) {
            i = (i + 1) & mask;
        }
        this->index[i] = { static_cast<std::uint64_t> (h), static_cast<std::uint32_t> (e) };
        // reuses tombstones
    }

    void buildIndex () {
        this->index.assign (slotCount (this->entries.size ()),
                            { static_cast<std::uint64_t> (EMPTY_HASH), 0 });
        const std::size_t n = this->entries.size ();
        for (std::size_t e = 0; e < n; e++) {
            this->insertSlot (std::hash<std::string_view> {} (this->entries[e].first.view ()), e);
        }
        this->indexDirty = false;
    }

    // const-visible rebuild for the lazy index after bulk setNew() inserts
    void rebuildIndexNow () const {
        auto* self = const_cast<OrderedMap*> (this);
        self->buildIndex ();
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
    case kView:
        new (this->buf_) jsonView (
            *reinterpret_cast<const jsonView*> (other.buf_));
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
    case kView:
        new (this->buf_) jsonView (
            std::move (*reinterpret_cast<jsonView*> (other.buf_)));
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
    case kView:
        reinterpret_cast<jsonView*> (this->buf_)->~jsonView ();
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
    case kView: return typeid (jsonView);
    default: return typeid (void);
    }
}

inline const std::type_info& any::type () const noexcept {
    if (this->tag_ == kHeap) {
        return *this->heap ()->t;
    }
    return typeOf (static_cast<Tag> (this->tag_));
}

inline bool isDict (const any& v) {
    if (v.tag_ == any::kView) {
        const jsonView& jv = *reinterpret_cast<const jsonView*> (v.buf_);
        return jv.kind == kJvObject || jv.kind == kJvDeferred;
    }
    return v.type () == typeid (dict);
}
inline bool isList (const any& v) {
    if (v.tag_ == any::kView) {
        const jsonView& jv = *reinterpret_cast<const jsonView*> (v.buf_);
        return jv.kind == kJvArray;
    }
    return v.type () == typeid (list);
}
inline bool isStr (const any& v) {
    if (v.tag_ == any::kView) {
        const jsonView& jv = *reinterpret_cast<const jsonView*> (v.buf_);
        return jv.kind == kJvString;
    }
    return v.type () == typeid (std::string);
}
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
