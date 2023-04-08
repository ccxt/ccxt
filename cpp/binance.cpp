#include <binance.h>
#include <chrono>
#include <iostream>
#include <ostream>
#include <type_traits>
#include <date/date.h>
#include <fmt/format.h>
#include <fmt/ostream.h>
#include <ccxt/base/functions/type.h>
#include <ccxt/base/functions/generic.h>
#include <ccxt/base/functions/time.h>
#include <plog/Log.h>
#include <boost/asio.hpp>
#include <boost/asio/spawn.hpp>
#include <boost/beast.hpp>
#include <boost/beast/ssl.hpp>
#include <httpsClass.h>

template <> struct fmt::formatter<ccxt::MarketType>: formatter<string_view> {
    // parse is inherited from formatter<string_view>.
    template <typename FormatContext>
    auto format(ccxt::MarketType t, FormatContext& ctx) const {
        string_view name = "unknown";
        switch (t) {
        case ccxt::MarketType::DELIVERY:    name = "DELIVERY"; break;
        case ccxt::MarketType::FUTURE:      name = "FUTURE"; break;
        case ccxt::MarketType::INVERSE:     name = "INVERSE"; break;
        case ccxt::MarketType::LINEAR:      name = "LINEAR"; break;
        case ccxt::MarketType::OPTION:      name = "OPTION"; break;
        case ccxt::MarketType::SPOT:        name = "SPOT"; break;
        case ccxt::MarketType::SWAP:        name = "SWAP"; break;
        }
        return formatter<string_view>::format(name, ctx);
    }
};

namespace net   = boost::asio;
namespace beast = boost::beast;
namespace http  = beast::http;
namespace ssl   = net::ssl;
using net::ip::tcp;
using json = nlohmann::json;

namespace ccxt {    
    binance::binance()
        : Exchange (
            "binance", // id
            "Binance", // name
            {"JP", "MT"}, // countries: Japan, Malta
            50, // rateLimit
            false, // certified
            true, // pro
            {  // has
                .CORS = false,
                .spot = true,
                .margin = true,
                .swap = true,
                .future = true,
                .option = false,
                .addMargin = true,
                .borrowMargin = true,
                .cancelAllOrders = true,
                .cancelOrder = true,
                .cancelOrders = false,
                .createDepositAddress = false,
                .createOrder = true,
                .createPostOnlyOrder = true,
                .createReduceOnlyOrder = true,
                .createStopOrder = true,
                .createStopLimitOrder = true,
                .createStopMarketOrder = false,                        
                .editOrder = ExchangeAPIOrEmulated::TRUE,
                .fetchAccounts = false,
                .fetchBalance = true,
                .fetchBidsAsks = true,
                .fetchBorrowInterest = true,
                .fetchBorrowRate = true,
                .fetchBorrowRateHistories = false,
                .fetchBorrowRateHistory = true,
                .fetchBorrowRatesPerSymbol = false,
                .fetchBorrowRates = false,
                .fetchCanceledOrders = false,
                .fetchClosedOrder = false,
                .fetchClosedOrders = ExchangeAPIOrEmulated::EMULATED,
                .fetchCurrencies = ExchangeAPIOrEmulated::TRUE,
                .fetchDeposit = false,
                .fetchDepositAddress = true,
                .fetchDepositAddresses = false,
                .fetchDepositAddressesByNetwork = false,
                .fetchDeposits = true,
                .fetchDepositWithdrawFee = ExchangeAPIOrEmulated::EMULATED,
                .fetchDepositWithdrawFees = true,
                .fetchFundingHistory = true,
                .fetchFundingRate = true,
                .fetchFundingRateHistory = true,
                .fetchFundingRates = true,
                .fetchIndexOHLCV = true,
                .fetchL3OrderBook = false,
                .fetchLastPrices = true,
                .fetchLedger = true,
                .fetchLeverage = false,
                .fetchLeverageTiers = true,
                .fetchMarketLeverageTiers = ExchangeAPIOrEmulated::EMULATED,
                .fetchMarkets = true,
                .fetchMarkOHLCV = true,
                .fetchMyTrades = true,
                .fetchOHLCV = true,
                .fetchOpenInterest = true,
                .fetchOpenInterestHistory = true,            
                .fetchOpenOrder = false,
                .fetchOpenOrders = true,
                .fetchOrder = true,
                .fetchOrderBook = true,
                .fetchOrderBooks = false,
                .fetchOrders = true,
                .fetchOrderTrades = true,
                .fetchPosition = false,
                .fetchPositions = true,
                .fetchPositionsRisk = true,
                .fetchPremiumIndexOHLCV = false,
                .fetchSettlementHistory = true,
                .fetchStatus = ExchangeAPIOrEmulated::TRUE,
                .fetchTicker = true,
                .fetchTickers = true,
                .fetchTime = true,
                .fetchTrades = true,
                .fetchTradingFee = true,
                .fetchTradingFees = true,
                .fetchTradingLimits = false,
                .fetchTransactionFee = false,
                .fetchTransactionFees = true,
                .fetchTransactions = false,
                .fetchTransfers =true,
                .fetchWithdrawal = false,
                .fetchWithdrawals = true,
                .fetchWithdrawalWhitelist = false,
                .reduceMargin =  true,
                .repayMargin = true,
                .setLeverage = true,
                .setMargin = false,
                .setMarginMode = true,
                .setPositionMode = true,
                .signIn = false,
                .transfer = true,
                .withdraw= true
            },
            {  // timeframes
                {"1s", "1s"}, // spot only for now
                {"1m", "1m"},
                {"3m", "3m"},
                {"5m", "5m"},
                {"15m", "15m"},
                {"30m", "30m"},
                {"1h", "1h"},
                {"2h", "2h"},
                {"4h", "4h"},
                {"6h", "6h"},
                {"8h", "8h"},
                {"12h", "12h"},
                {"1d", "1d"},
                {"3d", "3d"},
                {"1w", "1w"},
                {"1M", "1M"}
            },
            {  // urls
                .test = {
                    {"dapiPublic", "https://testnet.binancefuture.com/dapi/v1"},
                    {"dapiPrivate", "https://testnet.binancefuture.com/dapi/v1"},
                    {"dapiPrivateV2", "https://testnet.binancefuture.com/dapi/v2"},
                    {"fapiPublic", "https://testnet.binancefuture.com/fapi/v1"},
                    {"fapiPrivate", "https://testnet.binancefuture.com/fapi/v1"},
                    {"fapiPrivateV2", "https://testnet.binancefuture.com/fapi/v2"},
                    {"public", "https://testnet.binance.vision/api/v3"},
                    {"private", "https://testnet.binance.vision/api/v3"},
                    {"v1", "https://testnet.binance.vision/api/v1"}
                },
                .api = {
                    {"wapi", "https://api.binance.com/wapi/v3"},
                    {"sapi", "https://api.binance.com/sapi/v1"},
                    {"sapiV2", "https://api.binance.com/sapi/v2"},
                    {"sapiV3", "https://api.binance.com/sapi/v3"},
                    {"sapiV4", "https://api.binance.com/sapi/v4"},
                    {"dapiPublic", "https://dapi.binance.com/dapi/v1"},
                    {"dapiPrivate", "https://dapi.binance.com/dapi/v1"},
                    {"eapiPublic", "https://eapi.binance.com/eapi/v1"},
                    {"eapiPublic", "https://eapi.binance.com/eapi/v1"},
                    {"dapiPrivateV2", "https://dapi.binance.com/dapi/v2"},
                    {"dapiData", "https://dapi.binance.com/futures/data"},
                    {"fapiPublic", "https://fapi.binance.com/fapi/v1"},
                    {"fapiPrivate", "https://fapi.binance.com/fapi/v1"},
                    {"fapiData", "https://fapi.binance.com/futures/data"},
                    {"fapiPrivateV2", "https://fapi.binance.com/fapi/v2"},
                    {"public", "https://api.binance.com/api/v3"},
                    {"private", "https://api.binance.com/api/v3"},
                    {"v1", "https://api.binance.com/api/v1"}
                },
                .www = "https://www.binance.com",
                .referral = {
                    {"ur", "https://accounts.binance.com/en/register?ref=D7YA7CLY"},
                    {"discount", "0.1"}
                },
                .doc = {"https://binance-docs.github.io/apidocs/spot/en"},
                .api_management = "https://www.binance.com/en/usercenter/settings/api-management",
                .fees = "https://www.binance.com/en/fee/schedule"
            },
            // commonCurrencies
            {
                {"BCC", "BCC"},
                {"YOYO", "YOYOW"},
            },
            // precisionMode
            DigitsCountingMode::DECIMAL_PLACES,
            // verbose
            _verbose
        )
    {
    };

    void binance::initFees()
    {
        // https://www.binance.com/en/fee/schedule
        // https://www.binance.com/en/fee/marginFee
        // https://www.binance.com/en/fee/futureFee
        // https://www.binance.com/en/fee/deliveryFee
        // https://www.binance.com/en/fee/optionsTrading
        // https://www.binance.com/en/fee/liquidSwapFee

        FeesTrading trading;
        trading.feeside = "get";
        trading.tierBased = false;
        trading.percentage = true;
        trading.taker = 0.001;
        trading.maker = 0.001;

        FeesTiers linearTiers {
            .taker = {
                {0, 0.000400},
                {250, 0.000400},
                {2500, 0.000350},
                {7500, 0.000320},
                {22500, 0.000300},
                {50000, 0.000270},
                {100000, 0.000250},
                {200000, 0.000220},
                {400000, 0.000200},
                {750000, 0.000170}
            },
            .maker = {
                {0, 0.000200},
                {250, 0.000160},
                {2500, 0.000140},
                {7500, 0.000120},
                {22500, 0.000100},
                {50000, 0.000080},
                {100000, 0.000060},
                {200000, 0.000040},
                {400000, 0.000020},
                {750000, 0}
            }
        };

        FeesTrading linear;
        linear.feeside = "quote";
        linear.tierBased = true;
        linear.percentage = true;
        linear.taker = 0.000400;
        linear.maker = 0.000200;
        linear.tiers = linearTiers;

        FeesTiers inverseTiers {
            .taker = {
                {0, 0.000500},
                {250, 0.000450},
                {2500, 0.000400},
                {7500, 0.000300},
                {22500, 0.000250},
                {50000, 0.000240},
                {100000, 0.000240},
                {200000, 0.000240},
                {400000, 0.000240},
                {750000, 0.000240}
            },
            .maker = {
                {0, 0.000100},
                {250, 0.000080},
                {2500, 0.000050},
                {7500, 0.0000030},
                {22500, 0.0},
                {50000, -0.000050},
                {100000, -0.000060},
                {200000, -0.000070},
                {400000, -0.000080},
                {750000, -0.000090}
            }
        };

        FeesTrading inverse;
        linear.feeside = "base";
        linear.tierBased = true;
        linear.percentage = true;
        linear.taker = 0.000500;
        linear.maker = 0.000100;
        linear.tiers = inverseTiers;

         _fees.trading = trading;
         _fees.linear = linear;
         _fees.inverse = inverse;
    }

    long binance::fetchTime(boost::beast::net::thread_pool& ioc)
    {
        // Binance API docs
        // https://binance-docs.github.io/apidocs/spot/en/#check-server-time
        // https://binance-docs.github.io/apidocs/futures/en/#check-server-time
        // https://binance-docs.github.io/apidocs/delivery/en/#check-server-time
        //
        //
        // {"serverTime":1680500475840}
        //
        //
        MarketType type{MarketType::SPOT};
        Url url{_urls.api["public"]};
        if (isLinear(type)) {
            url = _urls.api["fapiPublic"];
        }
        else if (isInverse(type)) {
            url = _urls.api["dapiPrivate"];            
        }        

        std::string hostname{url.host()};
        std::string uri{url.path() + "/time"};
        ssl::context ctx(ssl::context::sslv23_client);
        ctx.set_default_verify_paths();
        // FIXME: See if I need to add more options to ctx as the javascript fetch implementation does.
        try {
                httpsClass client(make_strand(ioc), ctx, hostname);

                auto res = client.performRequest({http::verb::get, uri, 11});
                std::string body = boost::beast::buffers_to_string(res.get().body().data());
                auto epoch_seconds = json::parse(body)["serverTime"].get<long>();
                return epoch_seconds;
        }
        catch (const std::exception& e) {
            std::cout << "ERROR:" << e.what() << std::endl;
            PLOGE << e.what();
            return std::numeric_limits<long>::min();
        }
    }

    std::map<std::string, Currency> binance::fetchCurrencies()
    {
        std::map<std::string, Currency> res;

        if (!_fetchCurrencies) {
            return res;
        }

        // this endpoint requires authentication
        // while fetchCurrencies is a public API method by design
        // therefore we check the keys here
        // and fallback to generating the currencies from the markets
        // TODO:
        // if (!checkRequiredCredentials(false)) {
        //     return res;
        // }
        // sandbox/testnet does not support sapi endpoints
        // TODO:
        // const apiBackup = this.safeString(this.urls, 'apiBackup');
        // if (apiBackup !== undefined) {
        //     return undefined;
        // }

        throw std::runtime_error("Not implemented yet");
    }

    std::map<MarketType, std::vector<Market>> binance::fetchMarkets(boost::beast::net::thread_pool& ioc)
    {
        // https://binance-docs.github.io/apidocs/delivery/en/#exchange-information
        // https://binance-docs.github.io/apidocs/futures/en/#exchange-information
        // https://binance-docs.github.io/apidocs/spot/en/#exchange-information

        std::map<MarketType, std::vector<Market>> markets; 
        json spotMarket, futureMarket, deliveryMarket, optionMarket;
        
        ssl::context ctx(ssl::context::sslv23_client);
        ctx.set_default_verify_paths();

        auto rawFetchMarkets = _fetchMarkets;
        auto sandboxMode = _sandboxMode;

        std::vector<MarketType> fetchMkts;
        for (auto type : rawFetchMarkets) {
            if (type == MarketType::OPTION && sandboxMode) {
                continue;
            }
            fetchMkts.push_back(type);
        }
        
        for(auto type : fetchMkts) {
            if (type == MarketType::SPOT) {
                Url url{_urls.api["public"]};
                spotMarket = fetchMarket(ioc, url);
            }
            else if (type == MarketType::LINEAR) {
                Url url{_urls.api["fapiPublic"]};
                auto futureMarket = fetchMarket(ioc, url);
            }
            else if (type == MarketType::INVERSE) {
                Url url{_urls.api["dapiPublic"]};
                deliveryMarket = fetchMarket(ioc, url);
            }
            else if (type == MarketType::OPTION) {
                Url url{_urls.api["eapiPublic"]};
                optionMarket = fetchMarket(ioc, url);
            }
            else {
                throw ExchangeError(fmt::format("{} fetchMarkets() {} is not a supported market type", _id, type));
            }

            if (_adjustForTimeDifference) {
                    loadTimeDifference(ioc);
            }
        }

        ioc.join();
        
        //
        // spot / margin
        //
        //     {
        //         "timezone":"UTC",
        //         "serverTime":1575416692969,
        //         "rateLimits":[
        //             {"rateLimitType":"REQUEST_WEIGHT","interval":"MINUTE","intervalNum":1,"limit":1200},
        //             {"rateLimitType":"ORDERS","interval":"SECOND","intervalNum":10,"limit":100},
        //             {"rateLimitType":"ORDERS","interval":"DAY","intervalNum":1,"limit":200000}
        //         ],
        //         "exchangeFilters":[],
        //         "symbols":[
        //             {
        //                 "symbol":"ETHBTC",
        //                 "status":"TRADING",
        //                 "baseAsset":"ETH",
        //                 "baseAssetPrecision":8,
        //                 "quoteAsset":"BTC",
        //                 "quotePrecision":8,
        //                 "baseCommissionPrecision":8,
        //                 "quoteCommissionPrecision":8,
        //                 "orderTypes":["LIMIT","LIMIT_MAKER","MARKET","STOP_LOSS_LIMIT","TAKE_PROFIT_LIMIT"],
        //                 "icebergAllowed":true,
        //                 "ocoAllowed":true,
        //                 "quoteOrderQtyMarketAllowed":true,
        //                 "allowTrailingStop":false,
        //                 "isSpotTradingAllowed":true,
        //                 "isMarginTradingAllowed":true,
        //                 "filters":[
        //                     {"filterType":"PRICE_FILTER","minPrice":"0.00000100","maxPrice":"100000.00000000","tickSize":"0.00000100"},
        //                     {"filterType":"PERCENT_PRICE","multiplierUp":"5","multiplierDown":"0.2","avgPriceMins":5},
        //                     {"filterType":"LOT_SIZE","minQty":"0.00100000","maxQty":"100000.00000000","stepSize":"0.00100000"},
        //                     {"filterType":"MIN_NOTIONAL","minNotional":"0.00010000","applyToMarket":true,"avgPriceMins":5},
        //                     {"filterType":"ICEBERG_PARTS","limit":10},
        //                     {"filterType":"MARKET_LOT_SIZE","minQty":"0.00000000","maxQty":"63100.00000000","stepSize":"0.00000000"},
        //                     {"filterType":"MAX_NUM_ORDERS","maxNumOrders":200},
        //                     {"filterType":"MAX_NUM_ALGO_ORDERS","maxNumAlgoOrders":5}
        //                 ],
        //                 "permissions":["SPOT","MARGIN"]}
        //             },
        //         ],
        //     }
        //
        // futures/usdt-margined (fapi)
        //
        //     {
        //         "timezone":"UTC",
        //         "serverTime":1575417244353,
        //         "rateLimits":[
        //             {"rateLimitType":"REQUEST_WEIGHT","interval":"MINUTE","intervalNum":1,"limit":1200},
        //             {"rateLimitType":"ORDERS","interval":"MINUTE","intervalNum":1,"limit":1200}
        //         ],
        //         "exchangeFilters":[],
        //         "symbols":[
        //             {
        //                 "symbol":"BTCUSDT",
        //                 "status":"TRADING",
        //                 "maintMarginPercent":"2.5000",
        //                 "requiredMarginPercent":"5.0000",
        //                 "baseAsset":"BTC",
        //                 "quoteAsset":"USDT",
        //                 "pricePrecision":2,
        //                 "quantityPrecision":3,
        //                 "baseAssetPrecision":8,
        //                 "quotePrecision":8,
        //                 "filters":[
        //                     {"minPrice":"0.01","maxPrice":"100000","filterType":"PRICE_FILTER","tickSize":"0.01"},
        //                     {"stepSize":"0.001","filterType":"LOT_SIZE","maxQty":"1000","minQty":"0.001"},
        //                     {"stepSize":"0.001","filterType":"MARKET_LOT_SIZE","maxQty":"1000","minQty":"0.001"},
        //                     {"limit":200,"filterType":"MAX_NUM_ORDERS"},
        //                     {"multiplierDown":"0.8500","multiplierUp":"1.1500","multiplierDecimal":"4","filterType":"PERCENT_PRICE"}
        //                 ],
        //                 "orderTypes":["LIMIT","MARKET","STOP"],
        //                 "timeInForce":["GTC","IOC","FOK","GTX"]
        //             }
        //         ]
        //     }
        //
        // delivery/coin-margined (dapi)
        //
        //     {
        //         "timezone": "UTC",
        //         "serverTime": 1597667052958,
        //         "rateLimits": [
        //             {"rateLimitType":"REQUEST_WEIGHT","interval":"MINUTE","intervalNum":1,"limit":6000},
        //             {"rateLimitType":"ORDERS","interval":"MINUTE","intervalNum":1,"limit":6000}
        //         ],
        //         "exchangeFilters": [],
        //         "symbols": [
        //             {
        //                 "symbol": "BTCUSD_200925",
        //                 "pair": "BTCUSD",
        //                 "contractType": "CURRENT_QUARTER",
        //                 "deliveryDate": 1601020800000,
        //                 "onboardDate": 1590739200000,
        //                 "contractStatus": "TRADING",
        //                 "contractSize": 100,
        //                 "marginAsset": "BTC",
        //                 "maintMarginPercent": "2.5000",
        //                 "requiredMarginPercent": "5.0000",
        //                 "baseAsset": "BTC",
        //                 "quoteAsset": "USD",
        //                 "pricePrecision": 1,
        //                 "quantityPrecision": 0,
        //                 "baseAssetPrecision": 8,
        //                 "quotePrecision": 8,
        //                 "equalQtyPrecision": 4,
        //                 "filters": [
        //                     {"minPrice":"0.1","maxPrice":"100000","filterType":"PRICE_FILTER","tickSize":"0.1"},
        //                     {"stepSize":"1","filterType":"LOT_SIZE","maxQty":"100000","minQty":"1"},
        //                     {"stepSize":"0","filterType":"MARKET_LOT_SIZE","maxQty":"100000","minQty":"1"},
        //                     {"limit":200,"filterType":"MAX_NUM_ORDERS"},
        //                     {"multiplierDown":"0.9500","multiplierUp":"1.0500","multiplierDecimal":"4","filterType":"PERCENT_PRICE"}
        //                 ],
        //                 "orderTypes": ["LIMIT","MARKET","STOP","STOP_MARKET","TAKE_PROFIT","TAKE_PROFIT_MARKET","TRAILING_STOP_MARKET"],
        //                 "timeInForce": ["GTC","IOC","FOK","GTX"]
        //             },
        //             {
        //                 "symbol": "BTCUSD_PERP",
        //                 "pair": "BTCUSD",
        //                 "contractType": "PERPETUAL",
        //                 "deliveryDate": 4133404800000,
        //                 "onboardDate": 1596006000000,
        //                 "contractStatus": "TRADING",
        //                 "contractSize": 100,
        //                 "marginAsset": "BTC",
        //                 "maintMarginPercent": "2.5000",
        //                 "requiredMarginPercent": "5.0000",
        //                 "baseAsset": "BTC",
        //                 "quoteAsset": "USD",
        //                 "pricePrecision": 1,
        //                 "quantityPrecision": 0,
        //                 "baseAssetPrecision": 8,
        //                 "quotePrecision": 8,
        //                 "equalQtyPrecision": 4,
        //                 "filters": [
        //                     {"minPrice":"0.1","maxPrice":"100000","filterType":"PRICE_FILTER","tickSize":"0.1"},
        //                     {"stepSize":"1","filterType":"LOT_SIZE","maxQty":"100000","minQty":"1"},
        //                     {"stepSize":"1","filterType":"MARKET_LOT_SIZE","maxQty":"100000","minQty":"1"},
        //                     {"limit":200,"filterType":"MAX_NUM_ORDERS"},
        //                     {"multiplierDown":"0.8500","multiplierUp":"1.1500","multiplierDecimal":"4","filterType":"PERCENT_PRICE"}
        //                 ],
        //                 "orderTypes": ["LIMIT","MARKET","STOP","STOP_MARKET","TAKE_PROFIT","TAKE_PROFIT_MARKET","TRAILING_STOP_MARKET"],
        //                 "timeInForce": ["GTC","IOC","FOK","GTX"]
        //             }
        //         ]
        //     }
        //
        // options (eapi)
        //
        //     {
        //         "timezone": "UTC",
        //         "serverTime": 1675912490405,
        //         "optionContracts": [
        //             {
        //                 "id": 1,
        //                 "baseAsset": "SOL",
        //                 "quoteAsset": "USDT",
        //                 "underlying": "SOLUSDT",
        //                 "settleAsset": "USDT"
        //             },
        //             ...
        //         ],
        //         "optionAssets": [
        //             {"id":1,"name":"USDT"}
        //         ],
        //         "optionSymbols": [
        //             {
        //                 "contractId": 3,
        //                 "expiryDate": 1677225600000,
        //                 "filters": [
        //                     {"filterType":"PRICE_FILTER","minPrice":"724.6","maxPrice":"919.2","tickSize":"0.1"},
        //                     {"filterType":"LOT_SIZE","minQty":"0.01","maxQty":"1000","stepSize":"0.01"}
        //                 ],
        //                 "id": 2474,
        //                 "symbol": "ETH-230224-800-C",
        //                 "side": "CALL",
        //                 "strikePrice": "800.00000000",
        //                 "underlying": "ETHUSDT",
        //                 "unit": 1,
        //                 "makerFeeRate": "0.00020000",
        //                 "takerFeeRate": "0.00020000",
        //                 "minQty": "0.01",
        //                 "maxQty": "1000",
        //                 "initialMargin": "0.15000000",
        //                 "maintenanceMargin": "0.07500000",
        //                 "minInitialMargin": "0.10000000",
        //                 "minMaintenanceMargin": "0.05000000",
        //                 "priceScale": 1,
        //                 "quantityScale": 2,
        //                 "quoteAsset": "USDT"
        //             },
        //             ...
        //         ],
        //         "rateLimits": [
        //             {"rateLimitType":"REQUEST_WEIGHT","interval":"MINUTE","intervalNum":1,"limit":400},
        //             {"rateLimitType":"ORDERS","interval":"MINUTE","intervalNum":1,"limit":100},
        //             {"rateLimitType":"ORDERS","interval":"SECOND","intervalNum":10,"limit":30}
        //         ]
        //     }
        //

        if (!spotMarket.empty()) {
            markets[MarketType::SPOT] = parseMarkets(spotMarket, MarketType::SPOT);
        }
        if (!futureMarket.empty()) {
            markets[MarketType::LINEAR] = parseMarkets(futureMarket, MarketType::LINEAR);
        }
        if (!deliveryMarket.empty()) {
            markets[MarketType::INVERSE] = parseMarkets(deliveryMarket, MarketType::INVERSE);
        }
        if (!optionMarket.empty()) {
            markets[MarketType::OPTION] = parseMarkets(optionMarket, MarketType::OPTION);
        }

        return markets;
    }

    json binance::fetchMarket(boost::beast::net::thread_pool& ioc, Url& url)
    {
        json j;
        ssl::context ctx(ssl::context::sslv23_client);
        ctx.set_default_verify_paths();
        try {
            auto hostname = url.host();
            auto uri = url.path() + "/exchangeInfo";

            httpsClass client(make_strand(ioc), ctx, hostname);
            auto response = client.performRequest({http::verb::get, uri, 11});
            std::string body = boost::beast::buffers_to_string(response.get().body().data());
            auto json = json::parse(body);
            j = json["symbols"];
        }
        catch (const std::exception& e) {
            std::cout << "ERROR:" << e.what() << std::endl;
            PLOGE << e.what();
            return j;
        }

        return j;
    }

    std::vector<Market> binance::parseMarkets(const nlohmann::json& markets, MarketType type)
    {
        std::vector<Market> res;
        for (auto& market : markets) {
            res.push_back(parseMarket(market, type));
        }
        return res;
    }

    Market binance::parseMarket(const json& market, MarketType type)
    {
        Market res;

        // std::cout << market.dump(4) << std::endl;

        bool swap = false;
        bool future = false;
        bool option = false;
        auto underlying = safeString(market, "underlying");
        auto id = safeString(market, "symbol");
        auto tempID{id};        
        auto optionPart0 = tempID.substr(0, tempID.find("-"));
        auto optionPart1 = tempID.erase(0, tempID.find("-") + 1);
        auto optionPart2 = tempID.erase(0, tempID.find("-") + 1);
        auto optionPart3 = tempID;

        auto optionBase = safeString(optionPart0);
        auto baseId = safeString(market, "baseAsset", optionBase);
        auto quoteId = safeString(market, "quoteAsset");
        auto base = safeCurrencyCode(baseId, type);
        auto quote = safeCurrencyCode(quoteId, type);
        auto contractType = safeString(market, "contractType");
        bool contract = market.contains("contractType");
        auto expiry = safeInteger2(market, "deliveryDate", "expiryDate");
        auto settleId = safeString(market, "marginAsset");
        if ((contractType == "PERPETUAL") || (expiry == 4133404800000)) { // some swap markets do not have contract type, eg: BTCST
            expiry = 0;
            swap = true;
        }
        else if (underlying.size() != 0) {
            contract = true;
            option = true;
            settleId = (settleId.size() == 0) ? "USDT" : settleId;
        }
        else {
            future = true;
        }
        auto settle = safeCurrencyCode(settleId, type);
        auto spot = !contract;
        auto filter = (market.contains("filters")) ? market["filters"] : json::array();
        auto filtersByType = indexBy(market, "filterType");
        auto status = safeString2(market, "status", "contractStatus");
        long contractSize;
        auto fees = _fees;
        bool linear;
        bool inverse;
        auto strike = safeInteger(market, "strikePrice");
        auto symbol = base + '/' + quote;
        if (contract) {
            if (swap) {
                symbol = symbol + ':' + settle;
            }
            else if (future) {
                symbol = symbol + ':' + settle + '-' + yymmdd(expiry);
            }
            else if (option) {
                symbol = symbol + ':' + settle + '-' + yymmdd(expiry) + '-' + std::to_string(strike) + '-' + safeString(optionPart3);
            }
            contractSize = safeLong2(market, "contractSize", "unit", 1L);
            linear = (settle == quote);
            inverse = (settle == base);
            auto fees = linear ? _fees.linear : _fees.inverse;
        }
        std::optional<bool> active{(status == "TRADING")};
        if (spot) {
            auto permissions = (market.contains("permissions")) ? market["permissions"] : json::array();
            for (auto& permission : permissions) {
                if (permission == "TRD_GRP_003") {
                    active = false;
                    break;
                }
            }                        
        }
        bool isMarginTradingAllowed = (market.contains("isMarginTradingAllowed")) ? market["isMarginTradingAllowed"].get<bool>() : false;
        MarketType unifiedType;
        if (spot) {
            unifiedType = MarketType::SPOT;
        }
        else if (swap) {
            unifiedType = MarketType::SWAP;
        }
        else if (future) {
            unifiedType = MarketType::FUTURE;
        }
        else if (option) {
            unifiedType = MarketType::OPTION;
            active.reset();
        }

        res.id = id;
        res.symbol = symbol;
        res.base = base;
        res.quote = quote;
        res.settle = settle;
        res.baseId = baseId;
        res.quoteId = quoteId;
        res.settleId = settleId;
        res.type = unifiedType;
        res.spot = spot;
        res.margin = spot && isMarginTradingAllowed;
        res.swap = swap;
        res.future = future;
        res.option = option;
        res.active = active;
        res.contract = contract;
        res.linear = linear;
        res.inverse = inverse;
        res.taker = fees.trading.taker;
        res.maker = fees.trading.maker;
        res.contractSize = contractSize;
        res.expiry = expiry;
        res.expiryDatetime = iso8601(expiry);
        res.strike = strike;
        res.optionType = (safeStringLower(market, "side") == "put") ? OptionType::PUT : OptionType::CALL;        
        res.precision.amount = safeInteger2(market, "quantityPrecision", "quantityScale");
        res.precision.price = safeInteger2(market, "pricePrecision", "priceScale");
        res.precision.base = safeInteger(market, "baseAssetPrecision");
        res.precision.quote = safeInteger(market, "quotePrecision");
        res.limits.amount.min = safeInteger(market, "minQty");
        res.limits.amount.max = safeInteger(market, "maxQty");
        res.limits.price.min = safeInteger(market, "tickSize");
        res.limits.price.max = safeInteger(market, "maxPrice");
        res.limits.cost.min = safeInteger(market, "minNotional");
        res.limits.cost.max = safeInteger(market, "maxNotional");            
        res.info = market;

        if (filtersByType.contains("PRICE_FILTER")) {
            auto filter = filtersByType["PRICE_FILTER"];
            // PRICE_FILTER reports zero values for maxPrice
            // since they updated filter types in November 2018
            // https://github.com/ccxt/ccxt/issues/4286
            // therefore limits['price']['max'] doesn't have any meaningful value
            res.limits.price.min = safeInteger(filter, "minPrice");
            res.limits.price.max = safeInteger(filter, "maxPrice");
            res.precision.price = std::stod(filter["tickSize"].get<std::string>());
        }
        if (filtersByType.contains("LOT_SIZE")) {
            auto filter = filtersByType["LOT_SIZE"];
            auto stepSize = safeString(filter, "stepSize");
            res.precision.amount = std::stod(stepSize);
            res.limits.amount.min = safeInteger(filter, "minQty");
            res.limits.amount.max = safeInteger(filter, "maxQty");
        }
        if (filtersByType.contains("MIN_NOTIONAL")) {
            auto filter = filtersByType["MIN_NOTIONAL"];
            res.limits.cost.min = safeInteger(filter, "minNotional");
            res.limits.cost.max = safeInteger(filter, "maxNotional");
        }        

        return res;
    }

    bool binance::isInverse(const MarketType type, const std::string& subType) const
    {
        if (subType.size() == 0) {
            return type == MarketType::DELIVERY;
        }
        else {
            return subType == "inverse";
        }
    }

    bool binance::isLinear(const MarketType type, const std::string& subType) const
    {
        if (subType.size() == 0) {
            return (type == MarketType::FUTURE) || (type == MarketType::SWAP);
        }
        else {
            return subType == "linear";
        }
    }

    void binance::setSandboxMode(bool enabled)
    {
        Exchange::setSandboxMode(enabled);
        _sandboxMode = enabled;
    }

    long binance::convertExpireDate(const std::string& d) const
    {
        std::chrono::system_clock::time_point tp;
        std::istringstream ss{ d };
        ss >> date::parse("%F", tp);        
        long ts = (std::chrono::time_point_cast<std::chrono::milliseconds>(tp)
            .time_since_epoch() /
            std::chrono::milliseconds(1));        

        return ts;
    }

    Market binance::createExpiredOptionMarket(const std::string& symbol)
    {
        // Symbol format:
        // base + '/' + settle + ':' + settle + '-' + expiry + '-' + strikeAsString + '-' + optionType

        std::string sym{symbol};
        const std::string settle{"USDT"};
        const std::string optionPart0 = sym.substr(0, sym.find("-"));
        const std::string optionPart1 = sym.erase(0, sym.find("-") + 1);
        const std::string optionPart2 = sym.erase(0, sym.find("-") + 1);
        const std::string optionPart3 = sym;
        const std::string symbolBase0 = symbol.substr(0, symbol.find("/"));
        std::string base;
        if (symbol.find("/") != std::string::npos) {
            base = safeString(symbolBase0);
        }
        else {
            base = safeString(optionPart0);
        }
        std::string expiry = safeString(optionPart1); 
        double strike = safeDouble(optionPart2);
        std::string strikeAsString = safeString(optionPart2);
        std::string optionType = safeString(optionPart3);
        long datetime = convertExpireDate(expiry);
        long timestamp = datetime;
        Market market;
        market.id = base + "-" + expiry + "-" + strikeAsString + "-" + optionType;
        market.symbol = base + "/" + settle + ":" + settle + "-" + expiry + "-" + strikeAsString + "-" + optionType;
        market.base = base;
        market.quote =  settle;
        market.baseId = base;
        market.quoteId = settle;
        market.type = MarketType::OPTION;
        market.spot = false;
        market.swap = false;
        market.future = false;
        market.option = true;
        market.margin = false;
        market.contract = true;
        market.expiry = timestamp;
        market.expiryDatetime = datetime;
        market.optionType = (optionType == "C") ? OptionType::CALL : OptionType::PUT;
        market.strike = strike;
        market.settle = settle;
        market.settleId = settle;                
        
        return market;
    }

    Market binance::market(const std::string& symbol)
    {
        if (_markets.size() == 0) {
            throw ExchangeError(fmt::format("{} markets not loaded", _id));
        }

        // defaultType has legacy support on binance
        MarketType defaultType{_defaultType}; // spot
        if (symbol.size() != 0) {
            if (_markets[defaultType].contains(symbol)) {
                const Market& market = _markets[defaultType][symbol];
                return market;
            }
            else if (_markets_by_id[defaultType].contains(symbol)) {
                const Market& market = _markets_by_id[defaultType][symbol];
                return market;                
            }
            else if ((symbol.find("/") != std::string::npos) && (symbol.find(":") == std::string::npos)) {
                // support legacy symbols
                std::string sym{symbol};
                const std::string base = sym.substr(0, sym.find("/"));
                const std::string quote = sym.erase(0, sym.find("/") + 1);
                const std::string settle = (quote == "USD") ? base : quote;
                const std::string futuresSymbol = symbol + ':' + settle;
                if (_markets[MarketType::FUTURE].contains(futuresSymbol)) {
                    return _markets[MarketType::FUTURE][futuresSymbol];
                }
            }
            else if ((symbol.find("-C") != std::string::npos) || (symbol.find("-P") != std::string::npos)) { // both exchange-id and unified symbols are supported this way regardless of the defaultType
                return createExpiredOptionMarket(symbol);
            }
        }
        throw BadSymbol(fmt::format("{} does not have market symbol {}", _id, symbol));
    }

} // namespace ccxt
