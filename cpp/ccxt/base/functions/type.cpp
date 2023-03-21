#include <ccxt/base/functions/type.h>
#include <limits>
#include <cmath>

double asDouble(const std::wstring& x)
{
    if (x.size() == 0) return std::numeric_limits<double>::quiet_NaN();
    return std::stod(x);
}

int asInteger(const std::wstring& x)
{    
    if (x.size() == 0) return std::numeric_limits<int>::min(); // C++ int does not have NaN
    return std::stoi(x);
}


double safeDouble(const std::wstring& k, double defaultValue)
{
    double n = asDouble(k);
    return (!std::isnan(n)) ? n : defaultValue;
}
