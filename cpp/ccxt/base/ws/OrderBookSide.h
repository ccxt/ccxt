#pragma once

// The WS/Pro order book sides (ts/src/base/ws/OrderBookSide.ts). One class with a
// mode enum instead of the JS class ladder: the three storeArray semantics (plain,
// counted, indexed) share the sorted-key machinery, and the C++ port has no need for
// the prototype tricks the JS version uses to subclass Array.
//
// Rows are ccxt::list handles [price, size(, count|id)]; `index` mirrors the rows
// with the sort key (bids store -price so both sides sort ascending), and indexed
// mode keeps an id -> sort-key map exactly like the JS hashmap.

#include "../Value.h"
#include "../helpers.h"

#include <algorithm>
#include <cmath>
#include <map>
#include <memory>
#include <string>
#include <vector>

namespace ccxt {
namespace ws {

class OrderBookSide {
public:
    enum class Mode { plain, counted, indexed };

    struct Impl {
        std::vector<std::any> rows;            // any(list) per level
        std::vector<double> index;             // sort keys, ascending
        std::map<std::string, double> idmap;   // indexed mode: id -> sort key
        double depth = 0;                      // 0 = unbounded
        bool isBids = false;
        Mode mode = Mode::plain;
    };
    std::shared_ptr<Impl> impl;

    OrderBookSide () : impl (std::make_shared<Impl> ()) {}
    OrderBookSide (bool isBids, Mode mode, const std::any& deltas = std::any {}, const std::any& depth = std::any {})
        : impl (std::make_shared<Impl> ()) {
        this->impl->isBids = isBids;
        this->impl->mode = mode;
        if (isNum (depth)) {
            this->impl->depth = toDouble (depth);
        }
        if (isList (deltas)) {
            for (const auto& row : std::any_cast<list> (deltas).items ()) {
                // slice: store a copy, the caller's row must not alias the book
                this->storeArray (copyRow (row));
            }
        }
    }

    std::size_t size () const { return this->impl->rows.size (); }
    std::any get (long i) const {
        if (i < 0 || static_cast<std::size_t> (i) >= this->impl->rows.size ()) {
            return std::any {};
        }
        return this->impl->rows[static_cast<std::size_t> (i)];
    }
    list rows () const { return list (this->impl->rows); }
    bool sameAs (const OrderBookSide& other) const { return this->impl == other.impl; }

    void store (const std::any& price, const std::any& size) {
        this->storeArray (std::any (list { price, size }));
    }

    void storeArray (const std::any& delta) {
        switch (this->impl->mode) {
            case Mode::plain:   this->storePlain (delta); break;
            case Mode::counted: this->storeCounted (delta); break;
            case Mode::indexed: this->storeIndexed (delta); break;
        }
    }

    // trim beyond depth; indexed mode must also clean the idmap or trimmed ids leak
    // and a later delta for one of them corrupts the live region
    void limit () {
        Impl& s = *this->impl;
        if (s.depth > 0 && static_cast<double> (s.rows.size ()) > s.depth) {
            const std::size_t keep = static_cast<std::size_t> (s.depth);
            if (s.mode == Mode::indexed) {
                for (std::size_t i = keep; i < s.rows.size (); i++) {
                    s.idmap.erase (str (::getValue (s.rows[i], 2)));
                }
            }
            s.rows.resize (keep);
            s.index.resize (keep);
        }
    }

private:
    static std::any copyRow (const std::any& row) {
        if (isList (row)) {
            return std::any (list (std::any_cast<list> (row).items ()));
        }
        return row;
    }

    double sortKey (double price) const { return this->impl->isBids ? -price : price; }

    std::size_t bisectLeft (double x) const {
        const std::vector<double>& index = this->impl->index;
        return static_cast<std::size_t> (std::lower_bound (index.begin (), index.end (), x) - index.begin ());
    }

    void insertAt (std::size_t i, double key, const std::any& row) {
        Impl& s = *this->impl;
        s.index.insert (s.index.begin () + static_cast<long> (i), key);
        s.rows.insert (s.rows.begin () + static_cast<long> (i), row);
    }

    void removeAt (std::size_t i) {
        Impl& s = *this->impl;
        s.index.erase (s.index.begin () + static_cast<long> (i));
        s.rows.erase (s.rows.begin () + static_cast<long> (i));
    }

    void storePlain (const std::any& delta) {
        Impl& s = *this->impl;
        const double price = toDouble (::getValue (delta, 0));
        const double size = numOrZero (::getValue (delta, 1));
        const double key = this->sortKey (price);
        const std::size_t i = this->bisectLeft (key);
        if (size != 0) {
            if (i < s.index.size () && s.index[i] == key) {
                setValue (s.rows[i], std::any (1), ::getValue (delta, 1));
            } else {
                this->insertAt (i, key, delta);
            }
        } else if (i < s.index.size () && s.index[i] == key) {
            this->removeAt (i);
        }
    }

    void storeCounted (const std::any& delta) {
        Impl& s = *this->impl;
        const double price = toDouble (::getValue (delta, 0));
        const double size = numOrZero (::getValue (delta, 1));
        const double count = numOrZero (::getValue (delta, 2));
        const double key = this->sortKey (price);
        const std::size_t i = this->bisectLeft (key);
        if (size != 0 && count != 0) {
            if (i < s.index.size () && s.index[i] == key) {
                setValue (s.rows[i], std::any (1), ::getValue (delta, 1));
                setValue (s.rows[i], std::any (2), ::getValue (delta, 2));
            } else {
                this->insertAt (i, key, delta);
            }
        } else if (i < s.index.size () && s.index[i] == key) {
            this->removeAt (i);
        }
    }

    void storeIndexed (const std::any& delta) {
        Impl& s = *this->impl;
        const std::any priceAny = ::getValue (delta, 0);
        const double size = numOrZero (::getValue (delta, 1));
        const std::string id = str (::getValue (delta, 2));
        if (size != 0) {
            double key = 0;
            bool haveKey = false;
            // TS: `index_price = index_price || old_price` -- a falsy price (0)
            // falls back to the stored key; a present 0 must not move the level
            if (priceAny.has_value () && !(isNum (priceAny) && toDouble (priceAny) == 0)) {
                key = this->sortKey (toDouble (priceAny));
                haveKey = true;
            }
            const auto known = s.idmap.find (id);
            if (known != s.idmap.end ()) {
                const double oldKey = known->second;
                if (!haveKey) {
                    key = oldKey;
                    haveKey = true;
                    // in case price is not sent, restore it from the stored key
                    setValue (delta, std::any (0), std::any (std::fabs (oldKey)));
                }
                if (key == oldKey) {
                    // same price level: update the row in place, bounded scan by id —
                    // a stale idmap entry degrades to a clean reinsert below
                    std::size_t i = this->bisectLeft (key);
                    while (i < s.rows.size () && str (::getValue (s.rows[i], 2)) != id) {
                        i++;
                    }
                    if (i < s.rows.size ()) {
                        s.index[i] = key;
                        s.rows[i] = delta;
                        return;
                    }
                } else {
                    // price moved: remove the old row (bounded scan, may be trimmed)
                    std::size_t oldIndex = this->bisectLeft (oldKey);
                    while (oldIndex < s.rows.size () && str (::getValue (s.rows[oldIndex], 2)) != id) {
                        oldIndex++;
                    }
                    if (oldIndex < s.rows.size ()) {
                        this->removeAt (oldIndex);
                    }
                }
            }
            s.idmap[id] = key;
            std::size_t i = this->bisectLeft (key);
            // several rows may share one price: order them by id, matching JS
            while (i < s.rows.size () && s.index[i] == key
                   && idLess (::getValue (s.rows[i], 2), ::getValue (delta, 2))) {
                i++;
            }
            this->insertAt (i, key, delta);
        } else {
            const auto known = s.idmap.find (id);
            if (known != s.idmap.end ()) {
                const double oldKey = known->second;
                std::size_t i = this->bisectLeft (oldKey);
                while (i < s.rows.size () && str (::getValue (s.rows[i], 2)) != id) {
                    i++;
                }
                if (i < s.rows.size ()) {
                    this->removeAt (i);
                }
                s.idmap.erase (known);
            }
        }
    }

    static double numOrZero (const std::any& v) {
        return isNum (v) ? toDouble (v) : 0.0;
    }

    // JS `<` over ids: numeric when both are numbers, lexicographic otherwise
    static bool idLess (const std::any& a, const std::any& b) {
        if (isNum (a) && isNum (b)) {
            return toDouble (a) < toDouble (b);
        }
        return str (a) < str (b);
    }
};

} // namespace ws
} // namespace ccxt
