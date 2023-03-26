#include <ccxt/base/exchange.h>
#include <fmt/format.h>
#include <fmt/xchar.h>
#include <algorithm>
#include <bits/stdc++.h>
#include <ccxt/base/functions/string.h>
#include <ccxt/base/functions/type.h>
#include <plog/Log.h>
#include <plog/Init.h>
#include <plog/Formatters/TxtFormatter.h>
#include <plog/Appenders/ColorConsoleAppender.h>

namespace ccxt {

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
    // init predefined markets if any
    if (_markets.size() == 0) {
        setMarkets(_markets);
    }
    
    if (_verbose) {
        static plog::ColorConsoleAppender<plog::TxtFormatter> consoleAppender;
        plog::init(plog::debug, &consoleAppender);
        // TODO: move this to the places where we want are logging.
        PLOGD << "Hello log!";
    }
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
        throw InvalidAddress(fmt::format(L"{} address is undefined", _id));
    }
    // check the address is not the same letter like 'aaaaa' nor too short nor has a space
    if ((unique(address) == false) ||
        address.size() < _minFundingAddressLength ||
        address.find_first_not_of(L" ") == std::wstring::npos)
    {
        throw InvalidAddress(fmt::format(L"{} address is invalid or has less than {} characters: {}", _id, _minFundingAddressLength, address));
    }
    return address;
}

void Exchange::initRestRateLimiter()
{    
    _tokenBucket.refillRate = (_rateLimit > 0) ? 1 / _rateLimit : std::numeric_limits<int>::max();
    // thottle = Throttle(tokenBucket);
    throw BaseError(L"not implemented");
}

void Exchange::setSandboxMode(bool enabled)
{
    if (!enabled) {
        if (_urls.test.size() > 1) {
            if (_urls.api.size() > 1) {
                _urls.apiBackup = _urls.api;
                _urls.api = _urls.test;
            }
        } else {            
            throw NotSupported(fmt::format(L"{} does not have a sandbox URL", _id));
        }
    } else if (_urls.apiBackup.size() > 1) {
        if (_urls.api.size() > 1) {
            _urls.api = _urls.apiBackup;
        }
    }
}

std::map<std::wstring, Market> Exchange::setMarkets(const std::map<std::wstring, Market>& markets, std::map<int, Currency> currencies)
{
    std::map<std::wstring, Market> values;
    std::map<int, Market> values2;
    _markets_by_id.clear();

    // TODO: Since C++ uses std::map there are no multiple values for the same key,
    // maybe this is a problem since we will have spot and derivatives markets which could have the same id
    // If we want to have multiple entries we need to switch to multimap or change to map(type, id, market) instead.

    // handle marketId conflicts
    // we insert spot markets first
    // const marketValues = this.sortBy(this.toArray(_markets), 'spot', true);
    for (auto i : _markets) {
        auto& value{i.second};
        _markets_by_id[value.id] = value;

        Market market = safeMarket();
        market.precision = _precision;
        market.limits = _limits;
        market.fees.trading = _fees.trading;
        // market.value = value; TODO: Do we really need this?
        values[market.symbol] = market;
        values2[market.id] = market;
    }
    _markets = values;
    _markets_by_id = values2;    
    _symbols.clear();
    for (const auto& i : _markets)
        _symbols.push_back(i.first);
    std::sort(_symbols.begin(), _symbols.end());
    _ids.clear();    
    for (const auto& i : _markets)
        _ids.push_back(i.second.id);
    std::sort(_ids.begin(), _ids.end());
    if (currencies.size() == 0) {
        for (const auto& i : currencies) {
            _currencies[i.first] = i.second;
        }
    }
    else {
        std::vector<Currency> baseCurrencies;
        std::vector<Currency> quoteCurrencies;
        for (auto i : _markets) {
            auto market{i.second};
            double defaultCurrencyPrecision = (_precisionMode == DECIMAL_PLACES) ? 8 : 1e-8;
            const auto marketPrecision = market.precision;
            if (market.base.size() > 0) {
                const auto currencyPrecision = safeValue2(marketPrecision.base, marketPrecision.amount, defaultCurrencyPrecision);
                Currency ccy;
                ccy.id = safeString2(market.baseId, market.base);
                ccy.numericId = safeString(market.baseNumericId);
                ccy.code = safeString(market.base);
                ccy.precision = currencyPrecision;
                baseCurrencies.push_back(ccy);
            }
            if (market.quote.size() != 0) {
                const auto currencyPrecision = safeValue2(marketPrecision.quote, marketPrecision.price, defaultCurrencyPrecision);
                Currency ccy;
                ccy.id = safeString2(market.quoteId, market.quote);
                ccy.numericId = safeString(market.quoteNumericId);
                ccy.code = safeString(market.quote);
                ccy.precision = currencyPrecision;
                quoteCurrencies.push_back(ccy);
            }
        }
    }

    throw std::runtime_error("Not Implemented");
}

std::map<std::wstring, Market> Exchange::loadMarketsHelper(bool reload)
{
    if (!reload && _markets.size() != 0) {
        if (_markets_by_id.size() != 0) {
            return setMarkets(_markets);
        }
        return _markets;
    }
    std::map<int, Currency> currencies;
    // only call if exchange API provides endpoint (true), thus avoid emulated versions
    if (_has.fetchCurrencies == L"true") {
        currencies = fetchCurrencies();
    }
    const auto markets = fetchMarkets();
    return setMarkets(markets, currencies);
}

std::map<std::wstring, Market> Exchange::loadMarkets(bool reload)
{
    if ((reload && !_reloadingMarkets) || _marketsLoading.size() != 0) {
            _reloadingMarkets = true;
            try {
                _marketsLoading = loadMarketsHelper(reload);
                _reloadingMarkets = false;
            }
            catch(std::exception ex) {
                _reloadingMarkets = false;
                throw ex;
            }            
        }
        return _marketsLoading;
}

std::map<int, Currency> Exchange::fetchCurrencies()
{
    // markets are returned as a list
    // currencies are returned as a dict
    // this is for historical reasons
    // and may be changed for consistency later
    return _currencies;
}

std::map<std::wstring, Market> Exchange::fetchMarkets()
{
    // markets are returned as a list
    // currencies are returned as a dict
    // this is for historical reasons
    // and may be changed for consistency later
    return _markets;
}

Market Exchange::safeMarket(std::optional<int> marketId, 
            std::optional<Market> market, std::optional<std::wstring> delimiter, 
            std::optional<MarketType> marketType)
{
    throw std::runtime_error("Not Implemented");
}


void Exchange::defineRestApiEndpoint()
{        
}

void Exchange::defineRestApi(std::map<std::wstring, std::wstring>& api, const std::wstring& methodName, const std::vector<std::wstring>& paths)
{    
    for (const auto &i: api) {
        const auto key = i.first;
        const auto value = i.second;
        auto uppercaseMethod = key;
        std::transform(uppercaseMethod.begin(), uppercaseMethod.end(), uppercaseMethod.begin(), ::toupper);
        auto lowercaseMethod = key;
        std::transform(lowercaseMethod.begin(), lowercaseMethod.end(), lowercaseMethod.begin(), ::tolower);
        const auto camelcaseMethod = capitalize(lowercaseMethod);
    }

    // const keys = Object.keys (api)
    // for (let i = 0; i < keys.length; i++) {
    //     const key = keys[i]
    //     const value = api[key]
    //     const uppercaseMethod = key.toUpperCase ()
    //     const lowercaseMethod = key.toLowerCase ()
    //     const camelcaseMethod = this.capitalize (lowercaseMethod)
    //     if (Array.isArray (value)) {
    //         for (let k = 0; k < value.length; k++) {
    //             const path = value[k].trim ()
    //             this.defineRestApiEndpoint (methodName, uppercaseMethod, lowercaseMethod, camelcaseMethod, path, paths)
    //         }
}

void Exchange::defineRestApi(std::wstring& api, const std::wstring& methodName, const std::vector<std::wstring>& paths)
{
    // the options HTTP method conflicts with the 'options' API url path
    //     // } else if (key.match (/^(?:get|post|put|delete|options|head|patch)$/i)) {
    //     } else if (key.match (/^(?:get|post|put|delete|head|patch)$/i)) {
    //         const endpoints = Object.keys (value);
    //         for (let j = 0; j < endpoints.length; j++) {
    //             const endpoint = endpoints[j]
    //             const path = endpoint.trim ()
    //             const config = value[endpoint]
    //             if (typeof config === 'object') {
    //                 this.defineRestApiEndpoint (methodName, uppercaseMethod, lowercaseMethod, camelcaseMethod, path, paths, config)
    //             } else if (typeof config === 'number') {
    //                 this.defineRestApiEndpoint (methodName, uppercaseMethod, lowercaseMethod, camelcaseMethod, path, paths, { cost: config })
    //             } else {
    //                 throw new NotSupported (this.id + ' defineRestApi() API format is not supported, API leafs must strings, objects or numbers');
    //             }
    //         }
    //     } else {
    //         this.defineRestApi (value, methodName, paths.concat ([ key ]))
    //     }

}

void Exchange::handleHttpStatusCode()
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

}