#include <doctest.h>
#include <ccxt/base/functions/string.h>

using namespace ccxt;

TEST_CASE("test string") {
    CHECK("Abc" == capitalize("abc"));
    CHECK("A" == capitalize("a"));
    CHECK("" == capitalize(""));
}