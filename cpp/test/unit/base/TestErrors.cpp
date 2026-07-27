#include <doctest.h>
#include <ccxt/base/errors.h>

using namespace ccxt;

TEST_CASE("test errors")
{
    CHECK_THROWS_AS(throw BaseError("test"), std::exception);
    CHECK_THROWS_AS(throw ExchangeError("test"), BaseError);

    try
    {
        throw ExchangeError("test error");
    }
    catch (std::runtime_error e)
    {
        CHECK(e.what() == std::string("test error"));
    }
}