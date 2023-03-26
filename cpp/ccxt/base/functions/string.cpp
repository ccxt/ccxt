#include <ccxt/base/functions/string.h>

namespace ccxt {

std::wstring capitalize(const std::wstring& s)
{
    std::wstring res{s};
    if (res.size() > 0) res[0] = std::toupper(res[0]);
    return res;
}

}