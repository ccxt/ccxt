#include <ccxt/base/functions/type.h>
#include <cmath>

namespace ccxt {

double asDouble(const std::wstring& x)
{
    if (x.size() == 0) return std::numeric_limits<double>::quiet_NaN();
    return std::stod(x);
}

int asInteger(const std::wstring& x)
{    
    if (x.size() == 0) return std::numeric_limits<int>::min(); // C++ int does not have NaN, since this is of type float
    return std::stoi(x);
}

double safeDouble(const std::wstring& k, double defaultValue)
{
    double n = asDouble(k);
    return (std::isnan(n) || n == std::numeric_limits<double>::max() || n == std::numeric_limits<double>::min()) ? defaultValue : n;
}

double safeDouble(double k, double defaultValue)
{
    return (std::isnan(k) || k == std::numeric_limits<double>::max() || k == std::numeric_limits<double>::min()) ? defaultValue : k;
}

double safeInteger(const std::wstring& k, int defaultValue)
{
    int n = asInteger(k);
    return (n == std::numeric_limits<int>::max() || n == std::numeric_limits<int>::min()) ? defaultValue : n;
}

double safeInteger(int k, int defaultValue)
{    
    return (k == std::numeric_limits<int>::max() || k == std::numeric_limits<int>::min()) ? defaultValue : k;
}

std::wstring safeString(const std::wstring& k, const std::wstring& defaultValue)
{
    if (k.size() != 0) return k;
    else return defaultValue;
}

std::wstring safeString(int k, const std::wstring& defaultValue)
{
    return defaultValue;
}

double safeValue2(double k1, double k2, double defaultValue)
{
    if (k1 != 0) return k1;
    else if (k2 != 0) return k2;
    else return defaultValue;
}

std::wstring safeString2(const std::wstring& k1, const std::wstring& k2, const std::wstring& defaultValue)
{
    if (k1.size() != 0) return k1;
    else if (k2.size() != 0) return k2;
    else return defaultValue;

}

std::wstring safeString2(int k1, const std::wstring& k2, const std::wstring& defaultValue)
{
    if (k2.size() != 0) return k2;
    else return defaultValue;
}

std::wstring safeString2(const std::wstring& k1, int k2, const std::wstring& defaultValue)
{
    if (k1.size() != 0) return k1;
    else return defaultValue;
}

std::wstring safeString2(int k1, int k2, const std::wstring& defaultValue)
{
    return defaultValue;
}


double safeIntegerProduct(const std::wstring& k, double factor, double defaultValue)
{
    int n = asInteger(k);
    return (n != std::numeric_limits<int>::min()) ? n * factor : defaultValue;

}

}