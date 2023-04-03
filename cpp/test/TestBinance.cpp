#include <doctest.h>
#include <binance.h>
#include <iostream>

using namespace ccxt;


TEST_CASE("test Binance")
{
    binance b;
    auto serverTime = b.fetchTime();
    CHECK(serverTime != std::numeric_limits<long>::min());
}
