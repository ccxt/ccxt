// binance smoke test: the first real exchange through the C++ pipeline.
//
// Gate for the binance slice -- it proves the generated exchange compiles, that
// describe() produces a usable descriptor through the binanceApi -> Exchange chain,
// and that a parser turns a canned exchange response into a unified structure. It
// performs no network I/O; fetch() throws NotSupported this iteration.

#include "../ccxt/exchanges/binance.h"

#include <iostream>
#include <string>

namespace {

int failures = 0;

void check (bool condition, const std::string& what) {
    if (condition) {
        std::cout << "[PASS] " << what << std::endl;
    } else {
        std::cout << "[TEST_FAILURE] " << what << std::endl;
        failures++;
    }
}

std::string text (const std::any& v) {
    return v.has_value () ? std::any_cast<std::string> (toString (v)) : std::string ("<undefined>");
}

} // namespace

int main () {
    try {
        // two-phase construction: describe() must run on the fully built object
        auto exchangePtr = ccxt::newExchange<ccxt::binance> ();
        ccxt::binance& exchange = *exchangePtr;

        // -- describe() ---------------------------------------------------------------
        check (text (exchange.id) == "binance", "id is binance, got " + text (exchange.id));
        check (ccxt::isDict (exchange.has), "has is a dict");
        check (ccxt::isDict (exchange.urls), "urls is a dict");
        check (ccxt::isDict (exchange.api), "api block is a dict");
        check (isTrue (::getValue (exchange.has, std::string ("fetchTicker"))),
               "has.fetchTicker is true");

        // exceptions carry error CLASS NAMES as values (see D3b) -- the transpiler
        // rewrites the class to its name and the registry re-materialises it
        const std::any exact = ::getValue (exchange.exceptions, std::string ("exact"));
        check (ccxt::isDict (exact), "exceptions.exact is a dict");

        // -- parseTicker against a canned response -------------------------------------
        //
        // Shape taken from binance's /api/v3/ticker/24hr, trimmed to the fields
        // parseTicker reads.
        const std::any raw = ccxt::dict {
            { std::string ("symbol"),             std::string ("BTCUSDT") },
            { std::string ("priceChange"),        std::string ("100.0") },
            { std::string ("priceChangePercent"), std::string ("0.5") },
            { std::string ("weightedAvgPrice"),   std::string ("20000.0") },
            { std::string ("prevClosePrice"),     std::string ("19900.0") },
            { std::string ("lastPrice"),          std::string ("20000.0") },
            { std::string ("lastQty"),            std::string ("0.1") },
            { std::string ("bidPrice"),           std::string ("19999.0") },
            { std::string ("bidQty"),             std::string ("1.0") },
            { std::string ("askPrice"),           std::string ("20001.0") },
            { std::string ("askQty"),             std::string ("2.0") },
            { std::string ("openPrice"),          std::string ("19900.0") },
            { std::string ("highPrice"),          std::string ("20500.0") },
            { std::string ("lowPrice"),           std::string ("19800.0") },
            { std::string ("volume"),             std::string ("1000.0") },
            { std::string ("quoteVolume"),        std::string ("20000000.0") },
            { std::string ("openTime"),           1700000000000LL },
            { std::string ("closeTime"),          1700003600000LL },
        };
        const std::any ticker = exchange.parseTicker (raw, std::any {});
        check (ccxt::isDict (ticker), "parseTicker returns a dict");
        check (ccxt::toDouble (::getValue (ticker, std::string ("high"))) == 20500.0,
               "ticker.high is 20500, got " + text (::getValue (ticker, std::string ("high"))));
        check (ccxt::toDouble (::getValue (ticker, std::string ("low"))) == 19800.0,
               "ticker.low is 19800, got " + text (::getValue (ticker, std::string ("low"))));
        check (ccxt::toDouble (::getValue (ticker, std::string ("bid"))) == 19999.0,
               "ticker.bid is 19999, got " + text (::getValue (ticker, std::string ("bid"))));
        check (ccxt::toDouble (::getValue (ticker, std::string ("ask"))) == 20001.0,
               "ticker.ask is 20001, got " + text (::getValue (ticker, std::string ("ask"))));
        check (ccxt::toDouble (::getValue (ticker, std::string ("last"))) == 20000.0,
               "ticker.last is 20000, got " + text (::getValue (ticker, std::string ("last"))));
        check (ccxt::toLong (::getValue (ticker, std::string ("timestamp"))) == 1700003600000LL,
               "ticker.timestamp is closeTime, got " + text (::getValue (ticker, std::string ("timestamp"))));
    } catch (const std::exception& e) {
        std::cout << "[TEST_FAILURE] binance smoke threw: " << e.what () << std::endl;
        failures++;
    }
    std::cout << (failures ? "binance smoke FAILED" : "binance smoke passed") << std::endl;
    return failures ? 1 : 0;
}
