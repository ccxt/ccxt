#include <ccxt/base/exchange.h>
#include <fmt/format.h>
#include <algorithm>
#include <ccxt/base/functions/string.h>
#include <ccxt/base/functions/type.h>
#include <ccxt/base/functions/time.h>
#include <httpsClass.h>
#include <spdlog/spdlog.h>

namespace ccxt
{

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
        if (_markets.size() != 0)
        {
            setMarkets(_markets);
        }
        // this.newUpdates = (this.options.newUpdates !== undefined) ? this.options.newUpdates : true;
    }

    Exchange::Exchange(std::string id, std::string name,
                       const std::vector<std::string> &countries, int rateLimit,
                       bool certified, bool pro,
                       Has has, const std::map<std::string, std::string> &timeframes,
                       const URLs &urls,
                       const std::map<std::string, std::string> &commonCurrencies, DigitsCountingMode precisionMode,
                       bool verbose)
        : _id{id}, _name{name}, _countries{countries}, _rateLimit{rateLimit},
          _certified{certified}, _pro{pro}, _has{has}, _timeframes{timeframes},
          _urls{urls}, _commonCurrencies{commonCurrencies},
          _precisionMode{precisionMode}, _verbose{verbose}
    {
        if (_verbose)
        {
            spdlog::info("set spdlog level to debug");
            spdlog::set_level(spdlog::level::debug);
        }
    }

    bool Exchange::checkRequiredVersion(const std::string requiredVersion, bool error)
    {
        bool result = true;
        int major1, minor1, patch1;
        int major2, minor2, patch2;

        std::sscanf(requiredVersion.c_str(), "%d.%d.%d", &major1, &minor1, &patch1);
        std::sscanf(ccxtVersion.c_str(), "%d.%d.%d", &major2, &minor2, &patch2);
        if (major1 > major2)
        {
            result = false;
        }
        if (major1 == major2)
        {
            if (minor1 > minor2)
            {
                result = false;
            }
            else if (minor1 == minor2 && patch1 > patch2)
            {
                result = false;
            }
        }
        if (!result)
        {
            if (error)
            {
                throw NotSupported(fmt::format("Your current version of CCXT is {}, a newer version {} is required, please, upgrade your version of CCXT", ccxtVersion, requiredVersion));
            }
            else
            {
                return error;
            }
        }

        return result;
    }

    bool Exchange::unique(std::string str)
    {
        std::sort(str.begin(), str.end());
        return std::adjacent_find(str.begin(), str.end()) == str.end();
    }

    std::string Exchange::checkAddress(std::string address)
    {
        if (address.size() == 0)
        {
            throw InvalidAddress(fmt::format("{} address is undefined", _id));
        }
        // check the address is not the same letter like 'aaaaa' nor too short nor has a space
        if ((unique(address) == false) ||
            address.size() < _minFundingAddressLength ||
            address.find_first_not_of(" ") == std::string::npos)
        {
            throw InvalidAddress(fmt::format("{} address is invalid or has less than {} characters: {}", _id, _minFundingAddressLength, address));
        }
        return address;
    }

    void Exchange::initRestRateLimiter()
    {
        _tokenBucket.refillRate = (_rateLimit > 0) ? 1 / _rateLimit : std::numeric_limits<int>::max();
        // thottle = Throttle(tokenBucket);
        throw BaseError("not implemented");
    }

    void Exchange::setSandboxMode(bool enabled)
    {
        if (!enabled)
        {
            if (_urls.test.size() > 1)
            {
                if (_urls.api.size() > 1)
                {
                    _urls.apiBackup = _urls.api;
                    _urls.api = _urls.test;
                }
            }
            else
            {
                throw NotSupported(fmt::format("{} does not have a sandbox URL", _id));
            }
        }
        else if (_urls.apiBackup.size() > 1)
        {
            if (_urls.api.size() > 1)
            {
                _urls.api = _urls.apiBackup;
            }
        }
    }

    std::map<MarketType, std::map<std::string, Market>>
    Exchange::setMarkets(const std::map<MarketType, std::map<std::string, Market>> &markets,
                         std::map<MarketType, std::map<std::string, Currency>> currencies)
    {
        std::map<MarketType, std::map<std::string, Market>> vals;
        std::map<MarketType, std::map<std::string, Market>> vals2;
        _markets_by_id.clear();
        for (auto i : markets)
        {
            MarketType marketType{i.first};
            std::map<std::string, Market> market_by_id;
            std::map<std::string, Market> values;
            std::map<std::string, Market> values2;
            for (auto j : i.second)
            {
                auto &value{j.second};
                market_by_id[value.id] = value;

                Market market = safeMarket();
                market.precision = _precision;
                market.limits = _limits;
                market.fees.trading = _fees.trading;
                // market.value = value; TODO: Do we really need this?
                values[market.symbol] = market;
                values2[market.id] = market;
            }
            _markets_by_id[marketType] = market_by_id;
            vals[marketType] = values;
            vals2[marketType] = values2;
        }
        _markets = vals;
        _markets_by_id = vals2;
        _symbols.clear();
        for (const auto &i : _markets)
        {
            MarketType marketType{i.first};
            std::vector<std::string> symbols;
            for (const auto &j : i.second)
            {
                symbols.push_back(j.second.symbol);
            }
            _symbols[marketType] = symbols;
        }
        for (auto &i : _symbols)
        {
            std::sort(i.second.begin(), i.second.end());
        }
        _ids.clear();
        for (const auto &i : _markets)
        {
            MarketType marketType{i.first};
            std::vector<std::string> ids;
            for (const auto &j : i.second)
            {
                ids.push_back(j.second.id);
            }
            _ids[marketType] = ids;
        }
        for (auto &i : _ids)
        {
            std::sort(i.second.begin(), i.second.end());
        }
        if (currencies.size() == 0)
        {
            // TODO: Append to _currencies, don't overwrite
            for (auto &i : currencies)
            {
                std::map<std::string, Currency> ccys;
                for (auto j : i.second)
                {
                    ccys[j.first] = j.second;
                }
                _currencies[i.first] = ccys;
            }
        }
        else
        {
            // FIXME Handle all MarketTypes elegantly, currently there are only spot markets.
            std::vector<Currency> spotBaseCurrencies;
            std::vector<Currency> spotQuoteCurrencies;
            for (auto &i : _markets)
            {
                for (auto &j : i.second)
                {
                    auto market{j.second};
                    double defaultCurrencyPrecision = (_precisionMode == DECIMAL_PLACES) ? 8 : 1e-8;
                    const auto marketPrecision = market.precision;
                    if (market.base.size() > 0)
                    {
                        const auto currencyPrecision = safeValue2(marketPrecision.base, marketPrecision.amount, defaultCurrencyPrecision);
                        Currency ccy;
                        ccy.id = safeString2(market.baseId, market.base);
                        ccy.numericId = safeString(market.baseNumericId);
                        ccy.code = safeString(market.base);
                        ccy.precision = currencyPrecision;
                        spotBaseCurrencies.push_back(ccy);
                    }
                    if (market.quote.size() != 0)
                    {
                        const auto currencyPrecision = safeValue2(marketPrecision.quote, marketPrecision.price, defaultCurrencyPrecision);
                        Currency ccy;
                        ccy.id = safeString2(market.quoteId, market.quote);
                        ccy.numericId = safeString(market.quoteNumericId);
                        ccy.code = safeString(market.quote);
                        ccy.precision = currencyPrecision;
                        spotQuoteCurrencies.push_back(ccy);
                    }
                }
            }
            std::map<MarketType, std::vector<Currency>> baseCurrencies{{MarketType::SPOT, spotBaseCurrencies}};
            std::map<MarketType, std::vector<Currency>> quoteCurrencies{{MarketType::SPOT, spotQuoteCurrencies}};
            for (auto &i : baseCurrencies)
                sort(i.second.begin(), i.second.end(), [](const Currency &c1, const Currency &c2)
                     { return (c1.code < c2.code); });
            _baseCurrencies.clear();
            std::map<std::string, Currency> spotBaseMarket;
            for (const auto &i : baseCurrencies)
            {
                for (const auto &j : i.second)
                {
                    spotBaseMarket[j.code] = j;
                }
            }
            _baseCurrencies[MarketType::SPOT] = spotBaseMarket;
            for (auto &i : quoteCurrencies)
                sort(i.second.begin(), i.second.end(), [](const Currency &c1, const Currency &c2)
                     { return (c1.code < c2.code); });
            _quoteCurrencies.clear();
            std::map<std::string, Currency> spotQuoteMarket;
            for (const auto &i : quoteCurrencies)
            {
                for (const auto &j : i.second)
                {
                    spotQuoteMarket[j.code] = j;
                }
            }
            _quoteCurrencies[MarketType::SPOT] = spotQuoteMarket;
            auto groupedCurrencies{baseCurrencies};
            for (auto i : groupedCurrencies)
            {
                i.second.insert(i.second.end(), quoteCurrencies[i.first].begin(), quoteCurrencies[i.first].end());
                sort(i.second.begin(), i.second.end(), [](const Currency &c1, const Currency &c2)
                     { return (c1.code < c2.code); });
            }
            std::vector<Currency> resultingCurrencies;
            for (auto &i : groupedCurrencies)
            {
                for (const auto &ccy : i.second)
                {
                    // TODO:
                    // auto groupedCurrenciesCode = ccy.code;
                    // auto highestPrecisionCurrency = safeValue(groupedCurrenciesCode, 0);
                    // for (const auto& currentCurrency : groupedCurrenciesCode) {
                    //     if (_precisionMode == TICK_SIZE) {
                    //         highestPrecisionCurrency = (currentCurrency.precision < highestPrecisionCurrency.precision) ? currentCurrency : highestPrecisionCurrency;
                    //     }
                    //     else {
                    //         highestPrecisionCurrency = (currentCurrency.precision > highestPrecisionCurrency.precision) ? currentCurrency : highestPrecisionCurrency;
                    //     }
                    // }
                    // resultingCurrencies.push_back(highestPrecisionCurrency);
                }
            }
            sort(resultingCurrencies.begin(), resultingCurrencies.end(), [](const Currency &c1, const Currency &c2)
                 { return (c1.code < c2.code); });
            // TODO:
            // for (const auto& ccy : resultingCurrencies) {
            //     _currencies[ccy.code] = ccy;
            // }
        }
        _currencies_by_id.clear();
        _codes.clear();
        for (const auto &i : _currencies)
        {
            std::map<std::string, Currency> ccys;
            std::vector<std::string> codes;
            for (const auto &j : i.second)
            {
                ccys[j.second.id] = j.second;
                codes.push_back(j.first);
            }
            _currencies_by_id[i.first] = ccys;
            _codes[i.first] = codes;
        }

        return _markets;
    }

    std::map<MarketType, std::map<std::string, Market>> Exchange::loadMarketsHelper(bool reload)
    {
        if (!reload && _markets.size() != 0)
        {
            if (_markets_by_id.size() != 0)
            {
                return setMarkets(_markets);
            }
            return _markets;
        }
        std::map<MarketType, std::map<std::string, Currency>> currencies;
        // only call if exchange API provides endpoint (true), thus avoid emulated versions
        if (_has.fetchCurrencies == ExchangeAPIOrEmulated::TRUE_)
        {
            currencies = fetchCurrencies();
        }
        const auto markets = fetchMarkets();
        return setMarkets(markets, currencies);
    }

    std::map<MarketType, std::map<std::string, Market>> Exchange::loadMarkets(bool reload)
    {
        if ((reload && !_reloadingMarkets) || _marketsLoading.size() != 0)
        {
            _reloadingMarkets = true;
            try
            {
                _marketsLoading = loadMarketsHelper(reload);
                _reloadingMarkets = false;
            }
            catch (std::exception ex)
            {
                _reloadingMarkets = false;
                throw ex;
            }
        }
        return _marketsLoading;
    }

    std::map<MarketType, std::map<std::string, Currency>> Exchange::fetchCurrencies()
    {
        return _currencies;
    }

    std::map<MarketType, std::map<std::string, Market>> Exchange::fetchMarkets()
    {
        return _markets;
    }

    double Exchange::loadTimeDifference(boost::beast::net::thread_pool &ioc)
    {
        auto serverTime = fetchTime(ioc);
        auto after = now();
        _timeDifference = after - serverTime;
        return _timeDifference;
    }

    std::map<std::string, std::string> Exchange::safeCurrency(std::string currencyId, MarketType type, std::map<std::string, std::string> currency)
    {
        if (currencyId == "" && currency.size() != 0)
            return currency;
        if (_currencies_by_id[type].count(currencyId) > 0)
        {
            auto ccy = _currencies_by_id[type][currencyId];
            return {{"id", ccy.id}, {"code", ccy.code}};
        }
        std::string code{currencyId};
        if (currencyId.size() != 0)
            code = commonCurrencyCode(currencyId);
        std::transform(code.begin(), code.end(), code.begin(), ::toupper);
        return {
            {"id", currencyId},
            {"code", code},
        };
    }

    Market Exchange::safeMarket(std::optional<int> marketId,
                                std::optional<Market> market, std::optional<std::string> delimiter,
                                std::optional<MarketType> marketType)
    {
        throw std::runtime_error("Not Implemented");
    }

    std::string Exchange::safeCurrencyCode(std::string currencyId, MarketType type, std::map<std::string, std::string> currency)
    {
        auto ccy = safeCurrency(currencyId, type, currency);
        return ccy["code"];
    }

    std::string Exchange::commonCurrencyCode(std::string currency)
    {
        if (!substituteCommonCurrencyCodes)
        {
            return currency;
        }
        if (_commonCurrencies.count(currency) > 0)
        {
            return _commonCurrencies[currency];
        }
        else
        {
            return currency;
        }
    }

    void Exchange::handleHttpStatusCode()
    {
        throw BaseError("not implemented");
        // std::map<std::string, std::exception> httpExceptions
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
