// CCXT C++ — Binance typed example.
//
// The C++ counterpart of examples/rust/src/binance_typed.rs: the typed
// facade (ccxt::binance) returns native structs (Ticker, OrderBook, Market)
// instead of the dynamic ccxt::any, and LoadMarkets() wires the
// describe()/implicit-API setup internally.
#include "ccxt/exchanges/binance.h"

#include <iomanip>
#include <iostream>
#include <string>

static std::string f (const std::optional<double>& v) {
    return v.has_value () ? std::to_string (*v) : std::string ("—");
}

int main () {
    std::cout << "=== Binance — CCXT C++ typed example ===\n" << std::endl;

    auto binance = ccxt::newExchange<ccxt::binance> ();

    // Fetch + cache markets (also wires describe()/implicit-API under the hood).
    std::cout << "→ LoadMarkets() …" << std::endl;
    binance->LoadMarkets ();
    std::cout << "   ✓ markets cached (id " << ::str (binance->id) << ")" << std::endl;

    // FetchTickers() -> map<symbol, Ticker>
    std::cout << "\n→ FetchTickers() -> Tickers" << std::endl;
    try {
        const ccxt::Tickers tickers = binance->FetchTickers ();
        std::cout << "   ✓ " << tickers.size () << " tickers" << std::endl;
        for (const std::string sym : {"BTC/USDT", "ETH/USDT", "SOL/USDT"}) {
            if (tickers.has (sym)) {
                const ccxt::Ticker& t = tickers[sym];
                std::cout << "     " << std::left << std::setw (10) << sym
                          << " last=" << f (t.last)
                          << " baseVol=" << f (t.baseVolume) << std::endl;
            }
        }
    } catch (const std::exception& e) {
        std::cout << "   ✗ " << e.what () << std::endl;
    }

    // FetchOrderBook() -> OrderBook
    std::cout << "\n→ FetchOrderBook(\"BTC/USDT\", limit=5) -> OrderBook" << std::endl;
    try {
        const ccxt::OrderBook ob = binance->FetchOrderBook ("BTC/USDT", 5);
        std::cout << "   ✓ bids=" << ob.bids.size () << " asks=" << ob.asks.size () << std::endl;
        if (!ob.bids.empty () && !ob.asks.empty ()) {
            std::cout << "     top bid: price=" << ob.bids[0][0] << " amount=" << ob.bids[0][1] << std::endl;
            std::cout << "     top ask: price=" << ob.asks[0][0] << " amount=" << ob.asks[0][1] << std::endl;
        }
    } catch (const std::exception& e) {
        std::cout << "   ✗ " << e.what () << std::endl;
    }

    // FetchOHLCV() -> vector<OHLCV>
    std::cout << "\n→ FetchOHLCV(\"BTC/USDT\", \"1h\", limit=3)" << std::endl;
    try {
        const std::vector<ccxt::OHLCV> candles = binance->FetchOHLCV ("BTC/USDT", "1h", std::nullopt, 3);
        std::cout << "   ✓ " << candles.size () << " candles" << std::endl;
        for (const auto& c : candles) {
            std::cout << "     close=" << f (c.close) << " volume=" << f (c.volume) << std::endl;
        }
    } catch (const std::exception& e) {
        std::cout << "   ✗ " << e.what () << std::endl;
    }

    return 0;
}
