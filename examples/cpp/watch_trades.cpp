// CCXT C++ — watch_trades.
//
// C++ counterpart of examples/rust/src/watch_trades.rs: subscribe to the
// public trades stream on the pro (WebSocket) tier and print each trade as it
// arrives. Runs until TRADES (default 10) trades have been seen or the
// per-call timeout expires.
#include "ccxt/pro/binance.h"
#include "ccxt/pro/ProExchangeFactory.h"

#include <chrono>
#include <cstdlib>
#include <iostream>
#include <string>

static int64_t nowMs () {
    return std::chrono::duration_cast<std::chrono::milliseconds> (
               std::chrono::steady_clock::now ().time_since_epoch ()).count ();
}

int main (int argc, char** argv) {
    const int want = argc > 1 ? std::atoi (argv[1]) : 10;
    std::cout << "watch_trades — binance BTC/USDT (stop after " << want << " trades)"
              << std::endl;

    auto ex = std::dynamic_pointer_cast<ccxt::Exchange> (
        ccxt::pro::factory::createProExchange ("binance", ccxt::any{}));
    try {
        ex->LoadMarkets ();
    } catch (const std::exception& e) {
        std::cout << "load markets failed: " << e.what () << std::endl;
        return 1;
    }

    int seen = 0;
    const int64_t deadline = nowMs () + 90000; // 90s hard stop
    while (seen < want && nowMs () < deadline) {
        try {
            // WatchTrades returns the trades seen since the previous call;
            // on a fresh connection the first call returns the snapshot.
            const std::vector<ccxt::Trade> trades = ex->WatchTrades ("BTC/USDT");
            for (const auto& t : trades) {
                if (seen >= want) { break; }
                std::cout << "  trade " << (++seen) << ": " << t.side.value_or ("?") << " "
                          << t.amount.value_or (0.0) << " @ " << t.price.value_or (0.0) << std::endl;
            }
        } catch (const std::exception& e) {
            std::cout << "watch error: " << e.what () << std::endl;
            return 1;
        }
    }
    std::cout << "done: " << seen << " trades" << std::endl;
    return 0;
}
