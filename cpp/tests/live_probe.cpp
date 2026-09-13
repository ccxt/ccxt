// live probe: instantiates an exchange and calls methods via the dynamic dispatch.
#include "../ccxt/exchanges/ExchangeFactory.h"
#include "../ccxt/base/ExchangeBase.h"
#include <iostream>

int main (int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "usage: live-probe <exchangeId>" << std::endl;
        return 2;
    }
    try {
        ccxt::dict config;
        auto exchange = ccxt::factory::createExchange (argv[1], config);
        std::cout << "id: " << str (exchange->id) << std::endl;
        ccxt::list noArgs;
        const ccxt::any rawTime = exchange->callDynamically ("fetchTime", noArgs);
        std::cout << "fetchTime raw type: " << rawTime.type ().name () << std::endl;
        std::cout << "fetchTime awaited: " << str (exchange->json (ccxt::awaitValue (rawTime))) << std::endl;
        const ccxt::any mkts = ccxt::awaitValue (exchange->loadMarkets ());
        std::cout << "markets count: " << (ccxt::isList (mkts) ? std::to_string (ccxt::any_cast<ccxt::list> (mkts).size ()) : "not-a-list") << std::endl;
        ccxt::list tickerArgs;
        tickerArgs.push (ccxt::any (std::string ("BTC/USDT")));
        const ccxt::any ticker = ccxt::awaitValue (exchange->callDynamically ("fetchTicker", tickerArgs));
        std::cout << "ticker: " << str (exchange->json (ticker)).substr (0, 200) << std::endl;
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "[ERROR] " << e.what () << std::endl;
        return 1;
    }
}
