#include <doctest.h>
#include <ccxt/base/functions/type.h>
#include <limits>

TEST_CASE("test type") {
    CHECK_EQ(doctest::Approx(1.234), asDouble(L"1.234"));
    CHECK(doctest::IsNaN(asDouble(L"")));

    CHECK_EQ(doctest::Approx(1), asInteger(L"1.234"));
    CHECK_EQ(doctest::Approx(std::numeric_limits<int>::min()), asInteger(L""));
    
    CHECK_EQ(doctest::Approx(1.234), safeDouble(L"1.234"));
    CHECK_EQ(doctest::Approx(1.234), safeDouble(L"1.234", 4.4));
    CHECK_EQ(doctest::Approx(7.5), safeDouble(L"", 7.5));
}
