#include <doctest.h>
#include <ccxt/base/exchange.h>

using namespace ccxt;

TEST_CASE("construct the exchange base class") {
    Exchange ex;
}

TEST_CASE("check required version") {
    CHECK(true == Exchange::checkRequiredVersion("1.1.1"));
    CHECK(false == Exchange::checkRequiredVersion("999.999.999", false));
    CHECK_THROWS_AS(Exchange::checkRequiredVersion("999.999.999"), std::exception);
}

TEST_CASE("unique") {    
    CHECK(true == Exchange::unique("abc"));
    CHECK(false == Exchange::unique("aaabc"));
}

TEST_CASE("check address") {
    Exchange ex;
    CHECK("abc" == ex.checkAddress("abc"));
    CHECK_THROWS_AS(ex.checkAddress("abcc"), std::exception);    
    CHECK_THROWS_AS(ex.checkAddress(""), std::exception);
    CHECK_THROWS_AS(ex.checkAddress(" "), std::exception);
}
