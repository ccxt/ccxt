#include <doctest.h>
#include <binance.h>

using namespace ccxt;

TEST_CASE("regression test binance fetchTime")
{
    binance b;
    boost::beast::net::thread_pool ioc;

    for (auto i : {1, 2})
    {
        auto serverTime = b.fetchTime(ioc);
        CHECK(serverTime != std::numeric_limits<long>::min());
    }
    ioc.join();
}

TEST_CASE("regression test binance fetchMarkets")
{
    binance b;
    boost::beast::net::thread_pool ioc;
    auto res = b.fetchMarkets(ioc);
    CHECK(res.size() > 0);
}
