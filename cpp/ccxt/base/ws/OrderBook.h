#pragma once

// The WS/Pro order book (ts/src/base/ws/OrderBook.ts): live bids/asks sides plus
// timestamp/nonce/symbol, with reset()/update()/limit() and a deep copy() snapshot.
// One class with the side Mode instead of the JS OrderBook/Counted/Indexed ladder.
//
// Reference semantics: handle copies share one store, like every other value in the
// port — the exchange keeps the book in `orderbooks`, handleMessage mutates it, the
// consumer's watchOrderBook future resolves to the same live object.

#include "OrderBookSide.h"

#include <memory>
#include <string>

namespace ccxt {
namespace ws {

class WsOrderBook {
public:
    struct Impl {
        OrderBookSide bids;
        OrderBookSide asks;
        std::any timestamp;
        std::any datetime;
        std::any nonce;
        std::any symbol;
        std::any cache;   // exchanges buffer deltas here before the snapshot arrives
        OrderBookSide::Mode mode = OrderBookSide::Mode::plain;
        double depth = 0;
    };
    std::shared_ptr<Impl> impl;

    explicit WsOrderBook (const std::any& snapshot = std::any {}, const std::any& depth = std::any {},
                          OrderBookSide::Mode mode = OrderBookSide::Mode::plain)
        : impl (std::make_shared<Impl> ()) {
        Impl& s = *this->impl;
        s.mode = mode;
        if (isNum (depth)) {
            s.depth = toDouble (depth);
        }
        s.bids = OrderBookSide (true, mode, snapValue (snapshot, "bids"), depth);
        s.asks = OrderBookSide (false, mode, snapValue (snapshot, "asks"), depth);
        s.timestamp = snapValue (snapshot, "timestamp");
        s.nonce = snapValue (snapshot, "nonce");
        s.symbol = snapValue (snapshot, "symbol");
        s.cache = std::any (list {});
        this->refreshDatetime ();
    }

    OrderBookSide& bids () { return this->impl->bids; }
    OrderBookSide& asks () { return this->impl->asks; }
    std::any timestamp () const { return this->impl->timestamp; }
    std::any datetime () const { return this->impl->datetime; }
    std::any nonce () const { return this->impl->nonce; }
    std::any symbol () const { return this->impl->symbol; }
    std::any cache () const { return this->impl->cache; }
    void setSymbol (const std::any& symbol) { this->impl->symbol = symbol; }
    void setNonce (const std::any& nonce) { this->impl->nonce = nonce; }
    void setTimestamp (const std::any& timestamp) {
        this->impl->timestamp = timestamp;
        this->refreshDatetime ();
    }
    bool sameAs (const WsOrderBook& other) const { return this->impl == other.impl; }

    WsOrderBook& limit () {
        this->impl->bids.limit ();
        this->impl->asks.limit ();
        return *this;
    }

    // nonce-guarded full replacement
    WsOrderBook& update (const std::any& snapshot) {
        Impl& s = *this->impl;
        const std::any snapNonce = snapValue (snapshot, "nonce");
        if (snapNonce.has_value () && s.nonce.has_value ()
            && toDouble (snapNonce) <= toDouble (s.nonce)) {
            return *this;
        }
        return this->reset (snapshot);
    }

    WsOrderBook& reset (const std::any& snapshot = std::any {}) {
        Impl& s = *this->impl;
        s.bids = OrderBookSide (true, s.mode, snapValue (snapshot, "bids"),
                                s.depth > 0 ? std::any (s.depth) : std::any {});
        s.asks = OrderBookSide (false, s.mode, snapValue (snapshot, "asks"),
                                s.depth > 0 ? std::any (s.depth) : std::any {});
        s.nonce = snapValue (snapshot, "nonce");
        s.timestamp = snapValue (snapshot, "timestamp");
        s.symbol = snapValue (snapshot, "symbol");
        this->refreshDatetime ();
        return *this;
    }

    // deep snapshot: fresh sides, copied rows — safe to hand to the consumer
    WsOrderBook copy () const {
        const Impl& s = *this->impl;
        WsOrderBook out (std::any {}, s.depth > 0 ? std::any (s.depth) : std::any {}, s.mode);
        for (const auto& row : s.bids.rows ().items ()) {
            out.impl->bids.storeArray (std::any (list (std::any_cast<list> (row).items ())));
        }
        for (const auto& row : s.asks.rows ().items ()) {
            out.impl->asks.storeArray (std::any (list (std::any_cast<list> (row).items ())));
        }
        out.impl->nonce = s.nonce;
        out.impl->timestamp = s.timestamp;
        out.impl->datetime = s.datetime;
        out.impl->symbol = s.symbol;
        return out;
    }

    // the unified dict shape (fetchOrderBook parity) — used by the dynamic layer
    std::any toDict () const {
        const Impl& s = *this->impl;
        dict out;
        out.set ("bids", std::any (s.bids.rows ()));
        out.set ("asks", std::any (s.asks.rows ()));
        out.set ("timestamp", s.timestamp);
        out.set ("datetime", s.datetime);
        out.set ("nonce", s.nonce);
        out.set ("symbol", s.symbol);
        return std::any (out);
    }

private:
    static std::any snapValue (const std::any& snapshot, const char* key) {
        if (!isDict (snapshot)) {
            return std::any {};
        }
        return std::any_cast<dict> (snapshot).get (std::string (key));
    }

    void refreshDatetime ();
};

// factory helpers — the shapes ts/src/base/Exchange.ts's orderBook()/indexedOrderBook()/
// countedOrderBook() and the transpiled ws base tests construct
inline WsOrderBook wsOrderBook (const std::any& snapshot = std::any {}, const std::any& depth = std::any {}) {
    return WsOrderBook (snapshot, depth, OrderBookSide::Mode::plain);
}
inline WsOrderBook indexedOrderBook (const std::any& snapshot = std::any {}, const std::any& depth = std::any {}) {
    return WsOrderBook (snapshot, depth, OrderBookSide::Mode::indexed);
}
inline WsOrderBook countedOrderBook (const std::any& snapshot = std::any {}, const std::any& depth = std::any {}) {
    return WsOrderBook (snapshot, depth, OrderBookSide::Mode::counted);
}

} // namespace ws
} // namespace ccxt
