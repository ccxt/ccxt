#include <doctest.h>
#include <ccxt/base/functions/string.h>

TEST_CASE("test string") {
    CHECK(L"Abc" == capitalize(L"abc"));
    CHECK(L"A" == capitalize(L"a"));
    CHECK(L"" == capitalize(L""));
}