#include <doctest.h>
#include <ccxt/base/errors.h>

TEST_CASE("test errors") {
    CHECK_THROWS_AS(throw BaseError(L"test"), std::exception);
    CHECK_THROWS_AS(throw ExchangeError(L"test"), BaseError);    

    try
    {
        throw ExchangeError(L"test error");
    }
    catch(std::runtime_error e)
    {
        CHECK(e.what() == std::string("test error"));        
    }
}