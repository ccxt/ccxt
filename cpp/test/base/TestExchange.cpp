#include <doctest.h>
#include <ccxt/base/exchange.h>

TEST_CASE("construct the exchange base class") {
    Exchange ex;
}

TEST_CASE("check required version") {
    CHECK(true == Exchange::checkRequiredVersion(L"1.1.1"));
    CHECK(false == Exchange::checkRequiredVersion(L"999.999.999", false));
    CHECK_THROWS_AS(Exchange::checkRequiredVersion(L"999.999.999"), std::exception);
}

TEST_CASE("unique") {    
    CHECK(true == Exchange::unique(L"abc"));
    CHECK(false == Exchange::unique(L"aaabc"));
}

TEST_CASE("check address") {
    Exchange ex;
    CHECK(L"abc" == ex.checkAddress(L"abc"));
    CHECK_THROWS_AS(ex.checkAddress(L"abcc"), std::exception);    
    CHECK_THROWS_AS(ex.checkAddress(L""), std::exception);
    CHECK_THROWS_AS(ex.checkAddress(L" "), std::exception);
}