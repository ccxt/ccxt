#include <doctest.h>
#include <ccxt/base/exchange.h>

using namespace ccxt;

TEST_CASE("construct the exchange base class")
{
    // FIXME this will not compile because the Exchange class is abstract
    // Exchange ex;
}

TEST_CASE("check required version")
{
    CHECK(true == Exchange::checkRequiredVersion("1.1.1"));
    CHECK(false == Exchange::checkRequiredVersion("999.999.999", false));
    CHECK_THROWS_AS(Exchange::checkRequiredVersion("999.999.999"), std::exception);
}

TEST_CASE("unique")
{
    CHECK(true == Exchange::unique("abc"));
    CHECK(false == Exchange::unique("aaabc"));
}

TEST_CASE("check address")
{
    // FIXME this will not compile because the Exchange class is abstract
    // Exchange ex;
    // CHECK("abc" == ex.checkAddress("abc"));
    // CHECK_THROWS_AS(ex.checkAddress("abcc"), std::exception);
    // CHECK_THROWS_AS(ex.checkAddress(""), std::exception);
    // CHECK_THROWS_AS(ex.checkAddress(" "), std::exception);
}

// // Mock the asio http client for the Exchange unit test
// class MockedAsioHttpClient : public AsioHttpClient {
// }

// TEST_CASE("mocked asio http client") {
//     Exchange ex;
//     ex.setHttpClient(std::make_shared<MockedAsioHttpClient>());
//     auto response = ex.fetch("https://httpbin.org/get");
//     CHECK(response["url"] == "https://httpbin.org/get");
// }
