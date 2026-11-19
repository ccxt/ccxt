#pragma once

// The WS/Pro cache classes (ts/src/base/ws/Cache.ts), hand-written like the rest of
// cpp/ccxt/base. Reference semantics mirror the JS classes: every handle copy shares
// one store (shared_ptr Impl), because the pro layer relies on the exchange, the
// client and the consumer all mutating the same live cache.
//
// Rows are ccxt::dict / ccxt::list handles stored in an std::vector<ccxt::any>; keyed
// updates MERGE into the stored row (JS `for (prop in item) reference[prop] = ...`),
// so consumers holding a row see live updates, exactly as in JS.
//
// The update counters implement the getLimit () contract, including the two
// independent poll scopes (symbol-scoped and global) and the deferred clears; see the
// long comments in Cache.ts for the reasoning — the semantics here follow it line by
// line, asserted by ts/src/pro/test/base/test.cache.ts (transpiled).

#include "../Value.h"
#include "../helpers.h"

#include <map>
#include <memory>
#include <set>
#include <string>
#include <vector>

namespace ccxt {
namespace ws {

// ---------------------------------------------------------------------------
// ArrayCache — sliding window of rows with per-symbol / global update counts
// ---------------------------------------------------------------------------

class ArrayCache {
public:
    struct Impl {
        std::vector<ccxt::any> rows;
        long long maxSize = 0;                       // 0 = unbounded
        // getLimit () bookkeeping (see Cache.ts)
        std::map<std::string, long long> newUpdatesBySymbol;
        std::map<std::string, bool> clearUpdatesBySymbol;
        std::map<std::string, std::set<std::string>> seenUpdatesBySymbol;
        std::map<std::string, std::set<std::string>> seenUpdatesAll;
        long long allNewUpdates = 0;
        bool clearAllUpdates = false;
        // keyed subclasses
        dict hashmap;                                 // symbol -> (id -> row) / ts -> row
        std::set<std::string> sizeTracker;            // ByTimestamp
        long long newUpdates = 0;                     // ByTimestamp
        bool clearUpdates = false;                    // ByTimestamp
        std::string keyField = "symbol";              // BySymbolById vs ByOutcomeById
    };
    std::shared_ptr<Impl> impl;

    explicit ArrayCache (const ccxt::any& maxSize = ccxt::any {})
        : impl (std::make_shared<Impl> ()) {
        if (isNum (maxSize)) {
            this->impl->maxSize = toLong (maxSize);
        }
    }

    std::size_t size () const { return this->impl->rows.size (); }
    ccxt::any get (long i) const {
        if (i < 0 || static_cast<std::size_t> (i) >= this->impl->rows.size ()) {
            return ccxt::any {};
        }
        return this->impl->rows[static_cast<std::size_t> (i)];
    }
    list rows () const { return list (this->impl->rows); }
    dict hashmap () const { return this->impl->hashmap; }

    void clear () {
        Impl& s = *this->impl;
        s.rows.clear ();
        s.hashmap = dict {};
        s.newUpdatesBySymbol.clear ();
        s.seenUpdatesBySymbol.clear ();
        s.seenUpdatesAll.clear ();
        s.clearUpdatesBySymbol.clear ();
        s.allNewUpdates = 0;
        s.clearAllUpdates = false;
        s.sizeTracker.clear ();
        s.newUpdates = 0;
        s.clearUpdates = false;
    }

    // ArrayCache.getLimit — virtual: ArrayCacheByTimestamp replaces the counting
    // scheme entirely, and callers hold base references
    virtual ccxt::any getLimit (const ccxt::any& symbol, const ccxt::any& limit) {
        Impl& s = *this->impl;
        bool haveValue = false;
        long long newUpdatesValue = 0;
        if (!symbol.has_value ()) {
            newUpdatesValue = s.allNewUpdates;
            haveValue = true;                          // TS initialises allNewUpdates to 0
            s.clearAllUpdates = true;
        } else {
            const std::string key = str (symbol);
            const auto it = s.newUpdatesBySymbol.find (key);
            if (it != s.newUpdatesBySymbol.end ()) {
                newUpdatesValue = it->second;
                haveValue = true;
            }
            s.clearUpdatesBySymbol[key] = true;
        }
        if (!haveValue) {
            return limit;
        }
        if (limit.has_value ()) {
            const long long lim = toLong (limit);
            return ccxt::any (newUpdatesValue < lim ? newUpdatesValue : lim);
        }
        return ccxt::any (newUpdatesValue);
    }

    virtual void append (const ccxt::any& item) {
        Impl& s = *this->impl;
        if (s.maxSize && static_cast<long long> (s.rows.size ()) == s.maxSize) {
            s.rows.erase (s.rows.begin ());
        }
        s.rows.push_back (item);
        if (s.clearAllUpdates) {
            s.clearAllUpdates = false;
            s.allNewUpdates = 0;
            s.seenUpdatesAll.clear ();
        }
        const std::string key = str (::getValue (item, std::string ("symbol")));
        if (s.clearUpdatesBySymbol[key]) {
            s.clearUpdatesBySymbol[key] = false;
            s.newUpdatesBySymbol[key] = 0;
        }
        s.newUpdatesBySymbol[key] = s.newUpdatesBySymbol[key] + 1;
        s.allNewUpdates = s.allNewUpdates + 1;
    }

    virtual ~ArrayCache () = default;

protected:
    // shared by the keyed subclasses: the string form of a row key/id
    static std::string keyOf (const ccxt::any& v) { return str (v); }

    // JS `for (prop in item) reference[prop] = item[prop]` — merge INto the stored row
    static void mergeInto (const ccxt::any& reference, const ccxt::any& item) {
        if (isDict (reference) && isDict (item)) {
            for (const auto& kv : ccxt::any_cast<dict> (item).entries ()) {
                ccxt::any_cast<dict> (reference).set (kv.first, kv.second);
            }
        }
    }
};

// ---------------------------------------------------------------------------
// ArrayCacheByTimestamp — OHLCV rows keyed by their first element
// ---------------------------------------------------------------------------

class ArrayCacheByTimestamp : public ArrayCache {
public:
    explicit ArrayCacheByTimestamp (const ccxt::any& maxSize = ccxt::any {})
        : ArrayCache (maxSize) {}

    ccxt::any getLimit (const ccxt::any& /*symbol*/, const ccxt::any& limit) override {
        Impl& s = *this->impl;
        s.clearUpdates = true;
        if (!limit.has_value ()) {
            return ccxt::any (s.newUpdates);
        }
        const long long lim = toLong (limit);
        return ccxt::any (s.newUpdates < lim ? s.newUpdates : lim);
    }

    void append (const ccxt::any& item) override {
        Impl& s = *this->impl;
        const std::string ts = keyOf (::getValue (item, 0));
        if (s.hashmap.has (ts)) {
            const ccxt::any reference = s.hashmap.get (ts);
            if (isList (reference) && isList (item) && !ccxt::any_cast<list> (reference).sameAs (ccxt::any_cast<list> (item))) {
                // iterate the incoming row and drop whatever it does not cover — a
                // shorter update must not leave the previous row's tail in place
                list ref = ccxt::any_cast<list> (reference);
                const list& incoming = ccxt::any_cast<list> (item);
                ref.items ().assign (incoming.items ().begin (), incoming.items ().end ());
            }
        } else {
            s.hashmap.set (ts, item);
            if (s.maxSize && static_cast<long long> (s.rows.size ()) == s.maxSize) {
                const ccxt::any evicted = s.rows.front ();
                s.rows.erase (s.rows.begin ());
                s.hashmap.erase (keyOf (::getValue (evicted, 0)));
            }
            s.rows.push_back (item);
        }
        if (s.clearUpdates) {
            s.clearUpdates = false;
            s.sizeTracker.clear ();
        }
        s.sizeTracker.insert (ts);
        s.newUpdates = static_cast<long long> (s.sizeTracker.size ());
    }
};

// ---------------------------------------------------------------------------
// ArrayCacheBySymbolById — rows keyed by (keyField, id), distinct-id counting
// ---------------------------------------------------------------------------

class ArrayCacheBySymbolById : public ArrayCache {
public:
    explicit ArrayCacheBySymbolById (const ccxt::any& maxSize = ccxt::any {})
        : ArrayCache (maxSize) {}

    void append (const ccxt::any& item) override {
        Impl& s = *this->impl;
        ccxt::any stored = item;
        const std::string key = str (::getValue (item, std::string (s.keyField)));
        const std::string id = keyOf (::getValue (item, std::string ("id")));
        if (!isDict (s.hashmap.get (key))) {
            s.hashmap.set (key, ccxt::any (dict {}));
        }
        dict byId = ccxt::any_cast<dict> (s.hashmap.get (key));
        if (byId.has (id)) {
            const ccxt::any reference = byId.get (id);
            if (!sameDict (reference, stored)) {
                mergeInto (reference, stored);
            }
            stored = reference;
            // move the row to the end, matching on BOTH the key field and the id —
            // different symbols can share an order id
            for (std::size_t i = 0; i < s.rows.size (); i++) {
                const ccxt::any& existing = s.rows[i];
                if (isEqual (::getValue (existing, std::string ("id")), ::getValue (stored, std::string ("id")))
                    && isEqual (::getValue (existing, std::string (s.keyField)), ::getValue (stored, std::string (s.keyField)))) {
                    s.rows.erase (s.rows.begin () + static_cast<long> (i));
                    break;
                }
            }
        } else {
            byId.set (id, stored);
        }
        if (s.maxSize && static_cast<long long> (s.rows.size ()) == s.maxSize) {
            const ccxt::any evicted = s.rows.front ();
            s.rows.erase (s.rows.begin ());
            const std::string deleteKey = str (::getValue (evicted, std::string (s.keyField)));
            const std::string deleteId = keyOf (::getValue (evicted, std::string ("id")));
            if (isDict (s.hashmap.get (deleteKey))) {
                dict bucket = ccxt::any_cast<dict> (s.hashmap.get (deleteKey));
                bucket.erase (deleteId);
                // drop the emptied outer bucket, or short-lived symbols leak forever
                if (bucket.size () == 0) {
                    s.hashmap.erase (deleteKey);
                }
            }
            // the evicted id leaves both seen scopes so the counts stay bounded and
            // mean "distinct ids within the retained window"
            auto symbolSeen = s.seenUpdatesBySymbol.find (deleteKey);
            if (symbolSeen != s.seenUpdatesBySymbol.end ()) {
                if (symbolSeen->second.erase (deleteId) > 0) {
                    s.newUpdatesBySymbol[deleteKey] = s.newUpdatesBySymbol[deleteKey] - 1;
                }
                if (symbolSeen->second.empty ()) {
                    s.seenUpdatesBySymbol.erase (symbolSeen);
                }
            }
            auto globalSeen = s.seenUpdatesAll.find (deleteKey);
            if (globalSeen != s.seenUpdatesAll.end ()) {
                if (globalSeen->second.erase (deleteId) > 0) {
                    s.allNewUpdates = s.allNewUpdates - 1;
                }
                if (globalSeen->second.empty ()) {
                    s.seenUpdatesAll.erase (globalSeen);
                }
            }
        }
        s.rows.push_back (stored);
        if (s.clearAllUpdates) {
            s.clearAllUpdates = false;
            s.allNewUpdates = 0;
            s.seenUpdatesAll.clear ();
        }
        if (s.clearUpdatesBySymbol[key]) {
            s.clearUpdatesBySymbol[key] = false;
            s.seenUpdatesBySymbol[key].clear ();
        }
        // count DISTINCT ids per scope; the scopes keep independent seen sets, or a
        // symbol poll would make the global count double-count a re-updated id
        std::set<std::string>& idSet = s.seenUpdatesBySymbol[key];
        idSet.insert (id);
        s.newUpdatesBySymbol[key] = static_cast<long long> (idSet.size ());
        std::set<std::string>& allIdSet = s.seenUpdatesAll[key];
        const std::size_t beforeAll = allIdSet.size ();
        allIdSet.insert (id);
        s.allNewUpdates = s.allNewUpdates + static_cast<long long> (allIdSet.size () - beforeAll);
    }

protected:
    static bool sameDict (const ccxt::any& a, const ccxt::any& b) {
        return isDict (a) && isDict (b) && ccxt::any_cast<dict> (a).sameAs (ccxt::any_cast<dict> (b));
    }
};

// prediction markets: the first nesting level is the outcome handle, not the symbol
class ArrayCacheByOutcomeById : public ArrayCacheBySymbolById {
public:
    explicit ArrayCacheByOutcomeById (const ccxt::any& maxSize = ccxt::any {})
        : ArrayCacheBySymbolById (maxSize) {
        this->impl->keyField = "outcome";
    }
};

// ---------------------------------------------------------------------------
// ArrayCacheBySymbolBySide — positions: one row per (symbol, side)
// ---------------------------------------------------------------------------

class ArrayCacheBySymbolBySide : public ArrayCache {
public:
    ArrayCacheBySymbolBySide () : ArrayCache (ccxt::any {}) {}

    void append (const ccxt::any& item) override {
        Impl& s = *this->impl;
        ccxt::any stored = item;
        const std::string key = str (::getValue (item, std::string ("symbol")));
        const std::string side = keyOf (::getValue (item, std::string ("side")));
        if (!isDict (s.hashmap.get (key))) {
            s.hashmap.set (key, ccxt::any (dict {}));
        }
        dict bySide = ccxt::any_cast<dict> (s.hashmap.get (key));
        if (bySide.has (side)) {
            const ccxt::any reference = bySide.get (side);
            if (!(isDict (reference) && isDict (stored)
                  && ccxt::any_cast<dict> (reference).sameAs (ccxt::any_cast<dict> (stored)))) {
                mergeInto (reference, stored);
            }
            stored = reference;
            for (std::size_t i = 0; i < s.rows.size (); i++) {
                const ccxt::any& existing = s.rows[i];
                if (isEqual (::getValue (existing, std::string ("symbol")), ::getValue (stored, std::string ("symbol")))
                    && isEqual (::getValue (existing, std::string ("side")), ::getValue (stored, std::string ("side")))) {
                    s.rows.erase (s.rows.begin () + static_cast<long> (i));
                    break;
                }
            }
        } else {
            bySide.set (side, stored);
        }
        s.rows.push_back (stored);
        if (s.clearAllUpdates) {
            s.clearAllUpdates = false;
            s.allNewUpdates = 0;
            s.seenUpdatesAll.clear ();
        }
        if (s.clearUpdatesBySymbol[key]) {
            s.clearUpdatesBySymbol[key] = false;
            s.seenUpdatesBySymbol[key].clear ();
        }
        // distinct sides per scope, same two-scope independence as BySymbolById
        std::set<std::string>& sideSet = s.seenUpdatesBySymbol[key];
        sideSet.insert (side);
        s.newUpdatesBySymbol[key] = static_cast<long long> (sideSet.size ());
        std::set<std::string>& allSideSet = s.seenUpdatesAll[key];
        const std::size_t beforeAll = allSideSet.size ();
        allSideSet.insert (side);
        s.allNewUpdates = s.allNewUpdates + static_cast<long long> (allSideSet.size () - beforeAll);
    }
};

} // namespace ws
} // namespace ccxt
