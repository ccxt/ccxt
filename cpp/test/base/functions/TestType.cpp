#include <doctest.h>
#include <ccxt/base/functions/type.h>
#include <limits>

TEST_CASE("test type") {
    CHECK_EQ(doctest::Approx(1.234), asFloat(L"1.234"));
    CHECK(doctest::IsNaN(asFloat(L"")));

    CHECK_EQ(doctest::Approx(1), asInteger(L"1.234"));
    CHECK_EQ(doctest::Approx(std::numeric_limits<int>::min()), asInteger(L""));

    CHECK_EQ(doctest::Approx(1), asInteger(L"1.234"));
}
