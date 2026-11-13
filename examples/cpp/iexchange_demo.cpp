// CCXT C++ — iexchange demo.
//
// C++ counterpart of examples/rust/src/iexchange_demo.rs: every exchange —
// however it was constructed — answers the same unified interface. Here the
// same typed calls run through a plain std::shared_ptr<ExchangeBase>, so the
// example shows the C++ equivalent of Rust's boxed TypedExchange trait
// object: one loop, three different venues, no per-venue code.
#include "ccxt/base/Exchange.h"
#include "ccxt/exchanges/ExchangeFactory.h"

#include <iostream>
#include <memory>
#include <string>

static void demo (const char* id, const char* symbol) {
    std::cout << "=== " << id << " ===" << std::endl;
    std::shared_ptr<ccxt::Exchange> ex;
    try {
        ex = std::dynamic_pointer_cast<ccxt::Exchange> (
            ccxt::factory::createExchange (id, ccxt::any{}));
    } catch (const std::exception& e) {
        std::cout << "   cannot build exchange: " << e.what () << std::endl;
        return;
    }

    try {
        const std::optional<int64_t> now = ex->FetchTime ();
        std::cout << "   server time: "
                  << (now.has_value () ? std::to_string (*now) : std::string ("n/a")) << std::endl;
    } catch (const std::exception& e) {
        std::cout << "   FetchTime: " << e.what () << std::endl;
    }

    try {
        const ccxt::Ticker t = ex->FetchTicker (symbol);
        std::cout << "   " << symbol << " last=" << t.last.value_or (0.0)
                  << " bid=" << t.bid.value_or (0.0) << " ask=" << t.ask.value_or (0.0) << std::endl;
    } catch (const std::exception& e) {
        std::cout << "   FetchTicker: " << e.what () << std::endl;
    }

    try {
        const std::vector<ccxt::Market> markets = ex->FetchMarkets ();
        std::cout << "   markets: " << markets.size () << std::endl;
    } catch (const std::exception& e) {
        std::cout << "   FetchMarkets: " << e.what () << std::endl;
    }
    std::cout << std::endl;
}

int main () {
    demo ("binance", "BTC/USDT");
    demo ("kraken", "BTC/USD");
    demo ("okx", "BTC/USDT");
    return 0;
}
