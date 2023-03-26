#pragma one

#include <string>
#include <limits>

namespace ccxt {

/*  .............................................   */
double asDouble(const std::wstring& x);
int asInteger(const std::wstring& x);
/*  .............................................   */

double safeDouble(const std::wstring& k, double defaultValue = std::numeric_limits<double>::quiet_NaN());
double safeDouble(double k, double defaultValue = std::numeric_limits<double>::quiet_NaN());
double safeInteger(const std::wstring& k, int defaultValue = std::numeric_limits<int>::min());
double safeInteger(int k, int defaultValue = std::numeric_limits<int>::min());
std::wstring safeString(const std::wstring& k, const std::wstring& defaultValue = L"");
std::wstring safeString(int k, const std::wstring& defaultValue = L"");

double safeValue2(double k1, double k2, double defaultValue = std::numeric_limits<double>::quiet_NaN());
std::wstring safeString2(const std::wstring& k1, const std::wstring& k2, const std::wstring& defaultValue = L"");
std::wstring safeString2(int k1, const std::wstring& k2, const std::wstring& defaultValue = L"");
std::wstring safeString2(const std::wstring& k1, int k2, const std::wstring& defaultValue = L"");
std::wstring safeString2(int k1, int k2, const std::wstring& defaultValue = L"");

double safeIntegerProduct(const std::wstring& k, double factor, double defaultValue = 0.0);

}