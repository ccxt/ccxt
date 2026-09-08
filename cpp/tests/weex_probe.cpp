// weex fetchOpenOrders full harness-path probe (run from the repo root).
#include "../ccxt/exchanges/ExchangeFactory.h"
#include "../ccxt/base/ExchangeBase.h"
#include "../ccxt/base/helpers.h"
#include <fstream>
#include <iostream>
#include <sstream>

int main () {
    auto ex = ccxt::factory::createExchange (std::string ("weex"), ccxt::dict {});
    try {
        // load markets/currencies fixtures like the harness does
        std::ifstream mf ("ts/src/test/static/markets/weex.json");
        std::stringstream mbuf;
        mbuf << mf.rdbuf ();
        const std::any markets = ex->parseJson (mbuf.str ());
        ex->setMarkets (markets);
        std::ifstream cf ("ts/src/test/static/currencies/weex.json");
        std::stringstream cbuf;
        cbuf << cf.rdbuf ();
        const std::any currencies = ex->parseJson (cbuf.str ());
        ex->setProperty (std::string ("currencies"), currencies);
        // full harness credential/config surface (mirror the harness's silent setProperty)
        const auto setSilent = [&] (const std::string& k, const std::any& v) {
            try { ex->setProperty (k, v); } catch (const std::exception&) {}
        };
        setSilent ("apiKey", std::string ("key"));
        setSilent ("secret", std::string ("secretsecret"));
        setSilent ("password", std::string ("password"));
        setSilent ("uid", std::string ("uid"));
        setSilent ("token", std::string ("token"));
        setSilent ("login", std::string ("login"));
        setSilent ("accountId", std::string ("12345"));
        setSilent ("walletAddress", std::string ("wallet"));
        setSilent ("privateKey", std::string ("0xff3bdd43534543d421f05aec535965b5050ad6ac15345435345435453495e771"));
        setSilent ("accounts", ccxt::list {
            ccxt::dict {{std::string ("id"), std::string ("myAccount")}, {std::string ("code"), std::string ("USDT")}},
        });
        std::ifstream f ("ts/src/test/static/response/weex.json");
        std::stringstream buf;
        buf << f.rdbuf ();
        const std::any fixture = ex->parseJson (buf.str ());
        std::cout << "fixture type: " << ::str (std::string (fixture.type ().name ())) << std::endl;
        const std::any methods = ::getValue (fixture, std::string ("methods"));
        const std::any fos = ::getValue (methods, std::string ("fetchOpenOrders"));
        std::cout << "fetchOpenOrders len: " << ccxt::toLong (getArrayLength (fos)) << std::endl;
        std::any target;
        for (std::size_t i = 0; i < ccxt::toLong (getArrayLength (fos)); i++) {
            const std::any entry = ::getValue (fos, static_cast<long long> (i));
            const std::any desc = ::getValue (entry, std::string ("description"));
            if (::str (desc).find ("preset tp sl") != std::string::npos) {
                target = entry;
            }
        }
        const std::any httpResponse = ::getValue (target, std::string ("httpResponse"));
        std::cout << "httpResponse len: " << ccxt::toLong (getArrayLength (httpResponse)) << std::endl;
        const std::any first = ::getValue (httpResponse, static_cast<long long> (0));
        const std::any algoIdRaw = ::getValue (first, std::string ("algoId"));
        std::cout << "algoIdRaw type: " << ::str (std::string (algoIdRaw.type ().name ()))
                  << " str: '" << ::str (algoIdRaw) << "'" << std::endl;
        ex->fetchImpl = [httpResponse] (std::any, std::any, std::any, std::any) -> std::any {
            return httpResponse;
        };
        const std::any orders = ccxt::awaitValue (ex->callDynamically (std::string ("fetchOpenOrders"), ccxt::list {std::string ("BTC/USDT:USDT")}));
        std::cout << "orders len: " << ccxt::toLong (getArrayLength (orders)) << std::endl;
        if (ccxt::toLong (getArrayLength (orders)) > 0) {
            const std::any o0 = ::getValue (orders, static_cast<long long> (0));
            std::cout << "order id: " << ::str (::getValue (o0, std::string ("id"))) << std::endl;
        }
    } catch (const std::exception& e) {
        std::cout << "[ERROR] " << e.what () << std::endl;
    }
    return 0;
}
