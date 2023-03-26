#include <doctest.h>
#include <ccxt/base/functions/type.h>

using namespace ccxt;

TEST_CASE("test type") {
    CHECK_EQ(doctest::Approx(1.234), asDouble(L"1.234"));
    CHECK(doctest::IsNaN(asDouble(L"")));

    CHECK_EQ(doctest::Approx(1), asInteger(L"1.234"));
    CHECK_EQ(doctest::Approx(std::numeric_limits<int>::min()), asInteger(L""));    
}

TEST_CASE("test safeDouble") {
    CHECK_EQ(doctest::Approx(1.234), safeDouble(L"1.234"));
    CHECK_EQ(doctest::Approx(1.234), safeDouble(L"1.234", 4.4));
    CHECK_EQ(doctest::Approx(7.5), safeDouble(L"", 7.5));

    double defaultValue = 99.9;

    CHECK(doctest::IsNaN(safeDouble(std::numeric_limits<double>::quiet_NaN())));
    CHECK(doctest::IsNaN(safeDouble(std::numeric_limits<double>::max())));
    CHECK_EQ(doctest::Approx(1.0), safeDouble(L"1.0", defaultValue));
    CHECK_EQ(doctest::Approx(-1.0), safeDouble(L"-1.0", defaultValue));
    CHECK_EQ(doctest::Approx(1.0), safeDouble(1.0, defaultValue));
    CHECK_EQ(doctest::Approx(0), safeDouble(0, defaultValue));
    CHECK(doctest::IsNaN(safeDouble(L"")));
    CHECK_EQ(doctest::Approx(0), safeDouble(L"", 0));    
    CHECK_EQ(doctest::Approx(0), safeDouble(0));

    CHECK_EQ(doctest::Approx(1.59999999), safeDouble(1.59999999));
}

TEST_CASE("test safeValue2") {
    CHECK_EQ(doctest::Approx(1.234), safeValue2(1.234, 99.9));
    CHECK_EQ(doctest::Approx(99.9), safeValue2(0.0, 99.9));
    CHECK_EQ(doctest::Approx(1.234), safeValue2(1.234, 4.5));    
    CHECK_EQ(doctest::Approx(99.9), safeValue2(0.0, 99.9, 4.5));
    CHECK_EQ(doctest::Approx(4.5), safeValue2(0.0, 0.0, 4.5));
}


TEST_CASE("test safeInteger") {
    CHECK(3 == safeInteger(L"3"));
    CHECK(43 == safeInteger(L"", 43));

    double defaultValue = 99;

    CHECK_EQ(std::numeric_limits<int>::min(), safeInteger(std::numeric_limits<int>::min()));
    CHECK_EQ(std::numeric_limits<int>::min(), safeInteger(std::numeric_limits<int>::max()));
    CHECK_EQ(1, safeInteger(L"1.0", defaultValue));
    CHECK_EQ(-1, safeInteger(L"-1.0", defaultValue));
    CHECK_EQ(1, safeInteger(1.0, defaultValue));
    CHECK_EQ(0, safeInteger(0, defaultValue));
    CHECK_EQ(std::numeric_limits<int>::min(), safeInteger(L""));
    CHECK_EQ(doctest::Approx(0), safeInteger(L"", 0));    
    CHECK_EQ(doctest::Approx(0), safeInteger(0));

    CHECK_EQ(doctest::Approx(1), safeInteger(1.59999999));
}

TEST_CASE("test safeIntegerProduct") {
    CHECK_EQ(doctest::Approx(3.0), safeIntegerProduct(L"1", 3.0));
    CHECK_EQ(doctest::Approx(45.0), safeIntegerProduct(L"", 3.0, 45.0));
}