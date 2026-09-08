// bingx fetchTime live debug: dump the actual request URL.
#include "../ccxt/exchanges/ExchangeFactory.h"
#include "../ccxt/base/ExchangeBase.h"
#include "../ccxt/base/helpers.h"
#include <iostream>

int main () {
    auto ex = ccxt::factory::createExchange (std::string ("bingx"), ccxt::dict {});
    try {
        const std::any t = ccxt::awaitValue (ex->callDynamically (std::string ("fetchTime"), ccxt::list {}));
        std::cout << "fetchTime: " << ::str (ex->json (t)) << std::endl;
    } catch (const std::exception& e) {
        std::cout << "[ERROR] " << e.what () << std::endl;
    }
    std::cout << "url: " << ::str (ex->json (ex->getProperty ("last_request_url"))) << std::endl;
    std::cout << "headers: " << ::str (ex->json (ex->getProperty ("last_request_headers"))) << std::endl;
    return 0;
}
