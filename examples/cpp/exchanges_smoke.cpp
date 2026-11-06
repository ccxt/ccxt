// CCXT C++ — exchanges smoke.
//
// C++ counterpart of examples/rust/src/exchanges_smoke.rs: build each venue by
// id through the factory registry and run its typed FetchMarkets() over the
// network, printing the decoded count.
#include "ccxt/base/Exchange.h"
#include "ccxt/exchanges/ExchangeFactory.h"

#include <iostream>
#include <memory>
#include <string>

int main () {
    const char* ids[] = {"binance", "bybit", "okx", "kucoin", "bitget", "hyperliquid", "gate"};
    for (const char* id : ids) {
        std::cout << "\n=== " << id << " ===" << std::endl;
        std::shared_ptr<ccxt::Exchange> ex;
        try {
            ex = std::dynamic_pointer_cast<ccxt::Exchange> (
                ccxt::factory::createExchange (id, ccxt::any{}));
        } catch (const std::exception& e) {
            std::cout << "   unknown id (" << e.what () << ")" << std::endl;
            continue;
        }
        std::cout << "   FetchMarkets … ";
        try {
            const std::vector<ccxt::Market> markets = ex->FetchMarkets ();
            std::cout << markets.size () << " markets" << std::endl;
        } catch (const std::exception& e) {
            std::cout << "error: " << e.what () << std::endl;
        }
    }
    return 0;
}
