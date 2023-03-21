#include <ccxt/base/functions/type.h>
#include <limits>

float asFloat(const std::wstring& x)
{
    if (x.size() == 0) return std::numeric_limits<float>::quiet_NaN();
    return std::stof(x);
}

int asInteger(const std::wstring& x)
{    
    if (x.size() == 0) return std::numeric_limits<int>::min(); // C++ int does not have NaN
    return std::stoi(x);
}


float safeFloat(const std::wstring& k, float defaultValue)
{
    return 0;
}
// const safeFloat = (o: object, k: string | number, $default?: number): number => {
//     const n = asFloat (prop (o, k));
//     return isNumber (n) ? n : $default;
// };