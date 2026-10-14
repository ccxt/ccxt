// coinbaseinternational live debug probe.
#include "../ccxt/exchanges/ExchangeFactory.h"
#include "../ccxt/base/ExchangeBase.h"
#include "../ccxt/base/helpers.h"
#include <fstream>
#include <iostream>
#include <sstream>

int main () {
    try {
        auto ex = ccxt::factory::createExchange (std::string ("coinbaseinternational"), ccxt::dict {});
        // 1) parseJson on the live instruments file
        std::ifstream f ("/tmp/cbi.json");
        std::stringstream buf;
        buf << f.rdbuf ();
        const ccxt::any parsed = ex->parseJson (buf.str ());
        std::cout << "parsed type: " << ::str (std::string (parsed.type ().name ())) << " len: " << ::str (::toString (getArrayLength (parsed))) << std::endl;
        if (ccxt::toLong (getArrayLength (parsed)) > 0) {
            const ccxt::any first = ::getValue (parsed, 0);
            std::cout << "first symbol: " << ::str (ex->json (::getValue (first, std::string ("symbol")))) << std::endl;
        }
        // 2) fetchMarkets live
        const ccxt::any mk = ccxt::awaitValue (ex->callDynamically (std::string ("fetchMarkets"), ccxt::list {}));
        std::cout << "fetchMarkets count: " << ::str (::toString (getArrayLength (mk))) << std::endl;
    } catch (const std::exception& e) {
        std::cout << "[ERROR] " << e.what () << std::endl;
    }
    return 0;
}
