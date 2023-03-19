#include <ccxt/base/exchange.h>
#include <fmt/xchar.h>
#include <fmt/format.h>
#include <algorithm>

Exchange::Exchange()
{
    // options = getDefaultOptions(); // exchange-specific options, if any

    // Inherited classes set the member variables.

    // http client options
    // const agentOptions = {
    //     'keepAlive': true,
    // }
    // // ssl options
    // if (!this.validateServerSsl) {
    //     agentOptions['rejectUnauthorized'] = false;
    // }

    // generate implicit api
    // if (this.api) {
    //     this.defineRestApi (this.api, 'request')
    // }
    // // init the request rate limiter
    // this.initRestRateLimiter ()
    // // init predefined markets if any
    // if (this.markets) {
    //     this.setMarkets (this.markets)
    // }
}

bool Exchange::checkRequiredVersion(const std::wstring requiredVersion, bool error) 
{
    bool result = true;
    int major1, minor1, patch1;
    int major2, minor2, patch2;

    std::swscanf(requiredVersion.c_str(), L"%d.%d.%d", &major1, &minor1, &patch1);
    std::swscanf(ccxtVersion.c_str(), L"%d.%d.%d", &major2, &minor2, &patch2);
    if (major1 > major2) {
        result = false;
    }
    if (major1 == major2) {
        if (minor1 > minor2) {
            result = false;
        } 
        else if (minor1 == minor2 && patch1 > patch2) {
            result = false;
        }
    }
    if (!result) {
        if (error) {
            throw NotSupported(fmt::format(L"Your current version of CCXT is {}, a newer version {} is required, please, upgrade your version of CCXT", ccxtVersion, requiredVersion));
        }
        else {
            return error;
        }
    }

    return result;
}

bool Exchange::unique(std::wstring str)
{
    std::sort(str.begin(), str.end());
    return std::adjacent_find(str.begin(), str.end()) == str.end();
}

std::wstring Exchange::checkAddress(std::wstring address)
{
    if (address.size() == 0) {
        throw InvalidAddress(fmt::format(L"{} address is undefined", id));
    }
    // check the address is not the same letter like 'aaaaa' nor too short nor has a space
    if ((unique(address) == false) ||
        address.size() < minFundingAddressLength ||
        address.find_first_not_of(L" ") == std::wstring::npos)
    {
        throw InvalidAddress(fmt::format(L"{} address is invalid or has less than {} characters: {}", id, minFundingAddressLength, address));
    }
    return address;
}

void Exchange::initRestRateLimiter()
{
    tokenBucket.refillRate = (rateLimit > 0) ? 1 / rateLimit : std::numeric_limits<int>::max();
    // thottle = Throttle(tokenBucket);
    throw BaseError(L"not implemented");
}

void Exchange::handle_http_status_code()
{
    throw BaseError(L"not implemented");
    // std::map<std::wstring, std::exception> httpExceptions
    // {
    //     {'422', ExchangeError},
    //     {'418', DDoSProtection},
    //     {'429', RateLimitExceeded},
    //     {'404', ExchangeNotAvailable},
    //     {'409', ExchangeNotAvailable},
    //     {'410', ExchangeNotAvailable},
    //     {'451', ExchangeNotAvailable},
    //     {'500', ExchangeNotAvailable},
    //     {'501', ExchangeNotAvailable},
    //     {'502', ExchangeNotAvailable},
    //     {'520', ExchangeNotAvailable},
    //     {'521', ExchangeNotAvailable},
    //     {'522', ExchangeNotAvailable},
    //     {'525', ExchangeNotAvailable},
    //     {'526', ExchangeNotAvailable},
    //     {'400', ExchangeNotAvailable},
    //     {'403', ExchangeNotAvailable},
    //     {'405', ExchangeNotAvailable},
    //     {'503', ExchangeNotAvailable},
    //     {'530', ExchangeNotAvailable},
    //     {'408', RequestTimeout},
    //     {'504', RequestTimeout},
    //     {'401', AuthenticationError},
    //     {'407', AuthenticationError},
    //     {'511', AuthenticationError},
    // };
}