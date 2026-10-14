// live probe 2: raw fetch through the runtime transport.
#include "../ccxt/exchanges/ExchangeFactory.h"
#include "../ccxt/base/ExchangeBase.h"
#include <iostream>

int main (int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "usage: live-probe2 <exchangeId>" << std::endl;
        return 2;
    }
    try {
        ccxt::dict config;
        auto exchange = ccxt::factory::createExchange (argv[1], config);
        const ccxt::any raw = ccxt::awaitValue (exchange->fetch (
            std::string ("https://api.binance.com/api/v3/time"), std::string ("GET"),
            ccxt::any {}, ccxt::any {}));
        std::cout << "raw: " << str (exchange->json (raw)).substr (0, 200) << std::endl;
        const ccxt::any parsed = exchange->parseJson (raw);
        std::cout << "parsed: " << str (exchange->json (parsed)).substr (0, 200) << std::endl;
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "[ERROR] " << e.what () << std::endl;
        return 1;
    }
}
