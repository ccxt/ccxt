#include <doctest.h>
#include <string>
#include <vector>
#include <ccxt/base/exchange.h>
#include <binance.h>

// std::vector<std::string> exchanges;
// std::wstring symbol{L"all"};
// int maxConcurrency = 5; // MAX_VALUE // no limit

using namespace ccxt;

void loadExchange(Exchange& exchange)
{
    const auto markets = exchange.loadMarkets();
    // CHECK(markets.size() > 0);
}

TEST_CASE("Test Exchange") {
    // Exchange exchange = binance();
    // loadExchange(exchange);
}