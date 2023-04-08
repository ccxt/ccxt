#include <ccxt/base/functions/string.h>

namespace ccxt
{

    std::string capitalize(const std::string &s)
    {
        std::string res{s};
        if (res.size() > 0)
            res[0] = std::toupper(res[0]);
        return res;
    }

}