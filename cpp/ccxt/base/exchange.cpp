#include <ccxt/base/exchange.h>
#include <fmt/format.h>
#include <algorithm>
#include <bits/stdc++.h>
#include <ccxt/base/functions/string.h>
#include <ccxt/base/functions/type.h>
#include <plog/Log.h>
#include <plog/Init.h>
#include <plog/Formatters/TxtFormatter.h>
#include <plog/Appenders/ColorConsoleAppender.h>
#include <boost/certify/extensions.hpp>
#include <boost/certify/https_verification.hpp>

namespace ccxt {

Exchange::Exchange()
{
    if (_verbose) {
        static plog::ColorConsoleAppender<plog::TxtFormatter> consoleAppender;
        plog::init(plog::debug, &consoleAppender);
        // TODO: Do this in places where we want logging.
        PLOGD << "Hello log!";
    }

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
    if (_markets.size() != 0) {
        setMarkets(_markets);
    }
    // this.newUpdates = (this.options.newUpdates !== undefined) ? this.options.newUpdates : true;
}

Exchange::Exchange(std::string id, std::string name, 
                   const std::vector<std::string>& countries, int rateLimit,
                   bool certified, bool pro,
                   Has has, const std::map<std::string, std::string>& timeframes,
                   const URLs& urls, const nlohmann::json& api,
                   const std::map<std::string, std::string>& commonCurrencies, DigitsCountingMode precisionMode)
    : _id{id}, _name{name}, _countries{countries}, _rateLimit{rateLimit}, 
      _certified{certified}, _pro{pro}, _has{has}, _timeframes{timeframes},
      _urls{urls}, _api{api},
      _commonCurrencies{commonCurrencies}, _precisionMode{precisionMode}
{
}

Exchange::~Exchange()
{
    if (_stream_ptr) {
        boost::system::error_code ec;
        _stream_ptr->shutdown(ec);
        _stream_ptr->next_layer().close(ec);
    }
}

bool Exchange::checkRequiredVersion(const std::string requiredVersion, bool error) 
{
    bool result = true;
    int major1, minor1, patch1;
    int major2, minor2, patch2;

    std::sscanf(requiredVersion.c_str(), "%d.%d.%d", &major1, &minor1, &patch1);
    std::sscanf(ccxtVersion.c_str(), "%d.%d.%d", &major2, &minor2, &patch2);
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
            throw NotSupported(fmt::format("Your current version of CCXT is {}, a newer version {} is required, please, upgrade your version of CCXT", ccxtVersion, requiredVersion));
        }
        else {
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
    if (address.size() == 0) {
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
    if (!enabled) {
        if (_urls.test.size() > 1) {
            if (_urls.api.size() > 1) {
                _urls.apiBackup = _urls.api;
                _urls.api = _urls.test;
            }
        } else {            
            throw NotSupported(fmt::format("{} does not have a sandbox URL", _id));
        }
    } else if (_urls.apiBackup.size() > 1) {
        if (_urls.api.size() > 1) {
            _urls.api = _urls.apiBackup;
        }
    }
}

std::map<MarketType, std::map<std::string, Market>> 
Exchange::setMarkets(const std::map<MarketType, std::map<std::string, Market>>& markets, 
                     std::map<MarketType, std::map<std::string, Currency>> currencies)
{
    std::map<MarketType, std::map<std::string, Market>> vals;
    std::map<MarketType, std::map<std::string, Market>> vals2;
    _markets_by_id.clear();
    for (auto i : markets) {
        MarketType marketType{i.first};
        std::map<std::string, Market> market_by_id;
        std::map<std::string, Market> values;
        std::map<std::string, Market> values2;
        for (auto j : i.second) {
            auto& value{j.second};
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
    for (const auto& i : _markets) {
        MarketType marketType{i.first};
        std::vector<std::string> symbols;
        for (const auto& j : i.second)
        {
            symbols.push_back(j.second.symbol);
        }
        _symbols[marketType] = symbols;
    }
    for (auto& i : _symbols) {
        std::sort(i.second.begin(), i.second.end());
    }
    _ids.clear();
    for (const auto& i : _markets) {
        MarketType marketType{i.first};
        std::vector<std::string> ids;
        for (const auto& j : i.second) {
            ids.push_back(j.second.id);
        }
        _ids[marketType] = ids;
    }
    for (auto& i : _ids) {
        std::sort(i.second.begin(), i.second.end());
    }
    if (currencies.size() == 0) {
        // TODO: Append to _currencies, don't overwrite
        for (auto& i : currencies) {
            std::map<std::string, Currency> ccys;
            for (auto j : i.second) {
                ccys[j.first] = j.second;
            }
            _currencies[i.first] = ccys;
        }
        
    }
    else { 
        // FIXME Handle all MarketTypes elegantly, currently there are only spot markets.
        std::vector<Currency> spotBaseCurrencies;
        std::vector<Currency> spotQuoteCurrencies;
        for (auto& i : _markets) {
            for (auto& j: i.second) {
                auto market{j.second};
                double defaultCurrencyPrecision = (_precisionMode == DECIMAL_PLACES) ? 8 : 1e-8;
                const auto marketPrecision = market.precision;
                if (market.base.size() > 0) {
                    const auto currencyPrecision = safeValue2(marketPrecision.base, marketPrecision.amount, defaultCurrencyPrecision);
                    Currency ccy;
                    ccy.id = safeString2(market.baseId, market.base);
                    ccy.numericId = safeString(market.baseNumericId);
                    ccy.code = safeString(market.base);
                    ccy.precision = currencyPrecision;
                    spotBaseCurrencies.push_back(ccy);
                }
                if (market.quote.size() != 0) {
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
        for (auto& i : baseCurrencies)
            sort(i.second.begin(), i.second.end(), [](const Currency& c1, const Currency& c2) { return (c1.code < c2.code); });
        _baseCurrencies.clear();
        std::map<std::string, Currency> spotBaseMarket;
        for (const auto& i : baseCurrencies) {
            for (const auto& j : i.second) {
                spotBaseMarket[j.code] = j;
            }            
        }
        _baseCurrencies[MarketType::SPOT] = spotBaseMarket;
        for (auto& i : quoteCurrencies)
            sort(i.second.begin(), i.second.end(), [](const Currency& c1, const Currency& c2) { return (c1.code < c2.code); });
        _quoteCurrencies.clear();
        std::map<std::string, Currency> spotQuoteMarket;
        for (const auto& i : quoteCurrencies) {
            for (const auto& j : i.second) {
                spotQuoteMarket[j.code] = j;
            }            
        }
        _quoteCurrencies[MarketType::SPOT] = spotQuoteMarket;
        auto groupedCurrencies{baseCurrencies};
        for (auto i : groupedCurrencies) {
            i.second.insert(i.second.end(), quoteCurrencies[i.first].begin(), quoteCurrencies[i.first].end());
            sort(i.second.begin(), i.second.end(), [](const Currency& c1, const Currency& c2) { return (c1.code < c2.code); });
        }
        std::vector<Currency> resultingCurrencies;
        for (auto& i : groupedCurrencies) {
            for (const auto& ccy : i.second)
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
        sort(resultingCurrencies.begin(), resultingCurrencies.end(), [](const Currency& c1, const Currency& c2) { return (c1.code < c2.code); });
        // TODO:
        // for (const auto& ccy : resultingCurrencies) {
        //     _currencies[ccy.code] = ccy;
        // }
    }
    _currencies_by_id.clear();
    _codes.clear();
    for (const auto& i : _currencies)
    {
        std::map<std::string, Currency> ccys;
        std::vector<std::string> codes;
        for (const auto& j : i.second) {
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
    if (!reload && _markets.size() != 0) {
        if (_markets_by_id.size() != 0) {
            return setMarkets(_markets);
        }
        return _markets;
    }
    std::map<MarketType, std::map<std::string, Currency>> currencies;
    // only call if exchange API provides endpoint (true), thus avoid emulated versions
    if (_has.fetchCurrencies == ExchangeAPIOrEmulated::TRUE) {
        currencies = fetchCurrencies();
    }
    const auto markets = fetchMarkets();
    return setMarkets(markets, currencies);
}

std::map<MarketType, std::map<std::string, Market>> Exchange::loadMarkets(bool reload)
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

std::map<MarketType, std::map<std::string, Currency>> Exchange::fetchCurrencies()
{
    return _currencies;
}

std::map<MarketType, std::map<std::string, Market>> Exchange::fetchMarkets()
{
    return _markets;
}

Market Exchange::safeMarket(std::optional<int> marketId, 
            std::optional<Market> market, std::optional<std::string> delimiter, 
            std::optional<MarketType> marketType)
{
    throw std::runtime_error("Not Implemented");
}

boost::asio::ip::tcp::resolver::results_type 
Exchange::resolve(boost::asio::io_context& ctx, std::string const& hostname)        
{
    boost::asio::ip::tcp::resolver resolver{ctx};
    return resolver.resolve(hostname, "https");
}

boost::beast::http::response<boost::beast::http::string_body> 
Exchange::fetch(const std::string& hostname, boost::string_view uri)
{
    boost::asio::io_context ctx;
    boost::asio::ssl::context ssl_ctx{boost::asio::ssl::context::tls_client};
    ssl_ctx.set_verify_mode(boost::asio::ssl::context::verify_peer |
                            boost::asio::ssl::context::verify_fail_if_no_peer_cert);
    ssl_ctx.set_default_verify_paths();
    // tag::ctx_setup_source[]
    boost::certify::enable_native_https_server_verification(ssl_ctx);
    // end::ctx_setup_source[]
    connect(ctx, ssl_ctx, hostname);
    auto response = get(*_stream_ptr, hostname, uri);
    return response;
}

boost::asio::ip::tcp::socket Exchange::connect(boost::asio::io_context& ctx, std::string const& hostname)
{
    boost::asio::ip::tcp::socket socket{ctx};
    boost::asio::connect(socket, resolve(ctx, hostname));
    return socket;
}

void Exchange::connect(boost::asio::io_context& ctx, boost::asio::ssl::context& ssl_ctx, std::string const& hostname)
{
    _stream_ptr = std::make_unique<boost::asio::ssl::stream<boost::asio::ip::tcp::socket>>(
      connect(ctx, hostname), ssl_ctx);
    // tag::stream_setup_source[]
    boost::certify::set_server_hostname(*_stream_ptr, hostname);
    boost::certify::sni_hostname(*_stream_ptr, hostname);
    // end::stream_setup_source[]

    _stream_ptr->handshake(boost::asio::ssl::stream_base::handshake_type::client);    
}

boost::beast::http::response<boost::beast::http::string_body> 
Exchange::get(boost::asio::ssl::stream<boost::asio::ip::tcp::socket>& stream, boost::string_view hostname, boost::string_view uri)
{
    boost::beast::http::request<boost::beast::http::empty_body> request;
    request.method(boost::beast::http::verb::get);
    request.target(uri);
    request.keep_alive(false);
    request.set(boost::beast::http::field::host, hostname);
    boost::beast::http::write(stream, request);

    boost::beast::http::response<boost::beast::http::string_body> response;
    boost::beast::flat_buffer buffer;
    boost::beast::http::read(stream, buffer, response);

    return response;
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