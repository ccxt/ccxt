#include "ccxt/exchanges/ExchangeFactory.h"
#include "ccxt/base/Exchange.h"

#include <iostream>
#include <string>
#include <vector>

int main () {
    const std::vector<std::string> ids = {
        "binance", "bybit", "okx", "gate", "mexc", "kucoin",
    };
    for (const auto& id : ids) {
        try {
            const auto exchange = std::static_pointer_cast<ccxt::Exchange> (
                ccxt::factory::createExchange (id, ccxt::dict {}));
            const auto time = exchange->FetchTime ();
            std::cout << id << ": " << (time.has_value () ? std::to_string (*time) : "null")
                      << std::endl;
        } catch (const std::exception& e) {
            std::cout << id << ": error: " << e.what () << std::endl;
        }
    }
    return 0;
}
