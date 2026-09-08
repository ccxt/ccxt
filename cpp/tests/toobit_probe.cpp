// toobit fetchMarkets mocked-response probe.
#include "../ccxt/exchanges/ExchangeFactory.h"
#include "../ccxt/base/ExchangeBase.h"
#include "../ccxt/base/helpers.h"
#include <fstream>
#include <iostream>
#include <sstream>

int main () {
    auto ex = ccxt::factory::createExchange (std::string ("toobit"), ccxt::dict {});
    try {
        // load the fixture httpResponse
        std::ifstream f ("/tmp/toobit-hr.json");
        std::stringstream buf;
        buf << f.rdbuf ();
        const std::any parsed = ex->parseJson (buf.str ());
        std::cout << "httpResponse parsed: " << (parsed.has_value () ? "yes" : "NO") << std::endl;
        const std::any symbols = ex->safeList (parsed, std::string ("symbols"), ccxt::list {});
        std::cout << "symbols len: " << ccxt::toLong (getArrayLength (symbols)) << std::endl;
        // safeDict on options
        const std::any info = ex->safeDict (ex->getProperty ("options"), std::string ("exchangeInfo"));
        std::cout << "options.exchangeInfo set: " << (info.has_value () ? "yes" : "no") << std::endl;
        // simulate the harness: set the mock response then call fetchMarkets
        ex->fetchImpl = [parsed] (std::any, std::any, std::any, std::any) -> std::any {
            return parsed;
        };
        const std::any mk = ccxt::awaitValue (ex->callDynamically (std::string ("fetchMarkets"), ccxt::list {}));
        std::cout << "fetchMarkets len: " << ccxt::toLong (getArrayLength (mk)) << std::endl;
        // replicate the harness: markets/currencies from fixture files in the config
        ccxt::ExchangeBase loader;
        std::ifstream mf ("ts/src/test/static/markets/toobit.json");
        std::stringstream mbuf; mbuf << mf.rdbuf ();
        std::ifstream cf ("ts/src/test/static/currencies/toobit.json");
        std::stringstream cbuf; cbuf << cf.rdbuf ();
        ccxt::dict config;
        config.set ("markets", loader.parseJson (mbuf.str ()));
        config.set ("currencies", loader.parseJson (cbuf.str ()));
        auto ex2 = ccxt::factory::createExchange (std::string ("toobit"), config);
        ex2->fetchImpl = [parsed] (std::any, std::any, std::any, std::any) -> std::any {
            return parsed;
        };
        const std::any mk2 = ccxt::awaitValue (ex2->callDynamically (std::string ("fetchMarkets"), ccxt::list {}));
        std::cout << "fetchMarkets (with fixture markets) len: " << ccxt::toLong (getArrayLength (mk2)) << std::endl;
    } catch (const std::exception& e) {
        std::cout << "[ERROR] " << e.what () << std::endl;
    }
    return 0;
}
