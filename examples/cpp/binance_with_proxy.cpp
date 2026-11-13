// CCXT C++ — binance-with-proxy.
//
// C++ counterpart of examples/rust/src/binance_with_proxy.rs: route REST and
// WebSocket traffic through a local proxy. The proxy URL comes from the
// REST_PROXY / WS_PROXY environment variables (default http://127.0.0.1:8080,
// matching the Rust example). With no proxy listening, the calls fail with a
// connection error — which is the expected output of this demo.
#include "ccxt/exchanges/binance.h"
#include "ccxt/exchanges/ExchangeFactory.h"
#include "ccxt/pro/ProExchangeFactory.h"
#include "ccxt/pro/binance.h"

#include <cstdlib>
#include <iostream>
#include <string>

static std::string envOr (const char* name, const char* fallback) {
    const char* v = std::getenv (name);
    return (v && *v) ? std::string (v) : std::string (fallback);
}

int main () {
    const std::string restProxy = envOr ("REST_PROXY", "http://127.0.0.1:8080");
    const std::string wsProxy = envOr ("WS_PROXY", "http://127.0.0.1:8080");
    std::cout << "rest proxy = " << restProxy << std::endl;
    std::cout << "ws proxy   = " << wsProxy << "\n" << std::endl;

    // REST through the config dict — same shape every ccxt binding uses.
    {
        ccxt::dict cfg;
        cfg.set ("httpsProxy", std::string (restProxy));
        auto exchange = std::dynamic_pointer_cast<ccxt::Exchange> (
            ccxt::factory::createExchange ("binance", cfg));
        std::cout << "config   FetchTicker …" << std::endl;
        try {
            const ccxt::Ticker t = exchange->FetchTicker ("BTC/USDT");
            std::cout << "config   FetchTicker  last=" << t.last.value_or (0.0) << std::endl;
        } catch (const std::exception& e) {
            std::cout << "config   FetchTicker  [" << e.what () << "]" << std::endl;
        }
    }

    // REST through the exchange options member.
    {
        auto exchange = ccxt::newExchange<ccxt::binance> ();
        if (!isDict (exchange->options)) { exchange->options = ccxt::dict {}; }
        ccxt::dict opts = ccxt::any_cast<ccxt::dict> (exchange->options);
        opts.set ("httpsProxy", std::string (restProxy));
        exchange->options = opts;
        std::cout << "\nsetter   FetchOrderBook …" << std::endl;
        try {
            const ccxt::OrderBook ob = exchange->FetchOrderBook ("BTC/USDT", 5);
            std::cout << "setter   FetchOrderBook  bids=" << ob.bids.size ()
                      << " asks=" << ob.asks.size () << std::endl;
        } catch (const std::exception& e) {
            std::cout << "setter   FetchOrderBook  [" << e.what () << "]" << std::endl;
        }
    }

    // WS through the config dict.
    {
        ccxt::dict cfg;
        cfg.set ("wsProxy", std::string (wsProxy));
        auto exchange = std::dynamic_pointer_cast<ccxt::Exchange> (
            ccxt::pro::factory::createProExchange ("binance", cfg));
        std::cout << "\nconfig   WatchTicker …" << std::endl;
        try {
            const ccxt::Ticker t = exchange->WatchTicker ("BTC/USDT");
            std::cout << "config   WatchTicker  last=" << t.last.value_or (0.0) << std::endl;
        } catch (const std::exception& e) {
            std::cout << "config   WatchTicker  [" << e.what () << "]" << std::endl;
        }
    }

    return 0;
}
