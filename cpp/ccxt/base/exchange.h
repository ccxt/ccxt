#pragma once

#include <string>
#include <vector>
#include <map>
#include <ctime>
#include <optional>
#include <ccxt/base/errors.h>
#include <nlohmann/json.hpp>
#include <boost/asio.hpp>
#include <boost/asio/spawn.hpp>
#include <boost/beast.hpp>
#include <boost/beast/ssl.hpp>

namespace ccxt
{

    struct URLs
    {
        std::map<std::string, std::string> test;
        std::map<std::string, std::string> api;
        std::string www;
        std::map<std::string, std::string> referral;
        std::vector<std::string> doc;
        std::string api_management;
        std::string fees;

        std::map<std::string, std::string> apiBackup;
    };

    struct BalanceCache
    {
        // TODO:
        // total
        // free
        // used
        // info
        // timestamp
        // datetime
        // debt
    };

    struct OrderbooksCache
    {
    };
    struct TickersCache
    {
    };
    struct OrdersCache
    {
    };
    struct TradesCache
    {
    };
    struct TransactionsCache
    {
    };
    struct OHLCVsCache
    {
    };
    struct MyTradesCache
    {
    };
    struct PositionsCache
    {
    };

    struct MinMax
    {
        int min;
        int max;
    };

    struct Limits
    {
        MinMax leverage;
        MinMax amount;
        MinMax price;
        MinMax cost;
    };

    struct Currency
    {
        std::string id;
        std::string numericId;
        std::string code;
        double precision;
    };

    typedef std::string AccountGroup;
    struct Accounts
    {
        AccountGroup id;
        // 'type': undefined,
        // 'currency': undefined,
        // 'info': response,
    };

    struct Status
    {
        std::string status;
        std::time_t updated;
        std::time_t eta;
        std::string url;
    };

    struct TokenBucket
    {
        double delay = 0.001;
        int capacity = 1;
        int cost = 1;
        int maxCapacity = 1000;
        int refillRate;
    };

    struct RequiredCredentials
    {
        bool apiKey = true;
        bool secret = true;
        bool uid = false;
        bool login = false;
        bool password = false;
        bool twofa = false;         // 2-factor authentication (one-time password key)
        bool privateKey = false;    // a "0x"-prefixed hexstring private key for a wallet
        bool walletAddress = false; // the wallet address "0x"-prefixed hexstring
        bool token = false;         // reserved for HTTP auth in some cases
    };

    enum class ExchangeAPIOrEmulated
    {
        TRUE,
        EMULATED
    }; // exchange API provides endpoint (true) or emulated versions

    struct Has
    {
        bool publicAPI{true};
        bool privateAPI{true};
        bool CORS;
        bool spot;
        bool margin;
        bool swap;
        bool future;
        bool option;
        bool addMargin;
        bool borrowMargin;
        bool cancelAllOrders;
        bool cancelOrder{true};
        bool cancelOrders;
        bool createDepositAddress;
        bool createLimitOrder{true};
        bool createMarketOrder{true};
        bool createOrder{true};
        bool createPostOnlyOrder;
        bool createReduceOnlyOrder;
        bool createStopOrder;
        bool createStopLimitOrder;
        bool createStopMarketOrder;
        ExchangeAPIOrEmulated editOrder{ExchangeAPIOrEmulated::EMULATED};
        bool fetchAccounts;
        bool fetchBalance{true};
        bool fetchBidsAsks;
        bool fetchBorrowInterest;
        bool fetchBorrowRate;
        bool fetchBorrowRateHistories;
        bool fetchBorrowRateHistory;
        bool fetchBorrowRatesPerSymbol;
        bool fetchBorrowRates;
        bool fetchCanceledOrders;
        bool fetchClosedOrder;
        ExchangeAPIOrEmulated fetchClosedOrders;
        ExchangeAPIOrEmulated fetchCurrencies{ExchangeAPIOrEmulated::EMULATED};
        bool fetchDeposit;
        bool fetchDepositAddress;
        bool fetchDepositAddresses;
        bool fetchDepositAddressesByNetwork;
        bool fetchDeposits;
        ExchangeAPIOrEmulated fetchDepositWithdrawFee;
        bool fetchDepositWithdrawFees;
        bool fetchFundingFee;
        bool fetchFundingFees;
        bool fetchFundingHistory;
        bool fetchFundingRate;
        bool fetchFundingRateHistory;
        bool fetchFundingRates;
        bool fetchIndexOHLCV;
        bool fetchL2OrderBook{true};
        bool fetchL3OrderBook;
        bool fetchLastPrices;
        bool fetchLedger;
        bool fetchLeverage;
        bool fetchLedgerEntry;
        bool fetchLeverageTiers;
        ExchangeAPIOrEmulated fetchMarketLeverageTiers;
        bool fetchMarkets{true};
        bool fetchMarkOHLCV;
        bool fetchMyTrades;
        bool fetchOHLCV;
        bool fetchOpenInterest;
        bool fetchOpenInterestHistory;
        bool fetchOpenOrder;
        bool fetchOpenOrders;
        bool fetchOrder;
        bool fetchOrderBook{true};
        bool fetchOrderBooks;
        bool fetchOrders;
        bool fetchOrderTrades;
        bool fetchPermissions;
        bool fetchPosition;
        bool fetchPositions;
        bool fetchPositionsRisk;
        bool fetchPremiumIndexOHLCV;
        bool fetchSettlementHistory;
        ExchangeAPIOrEmulated fetchStatus{ExchangeAPIOrEmulated::EMULATED};
        bool fetchTicker{true};
        bool fetchTickers;
        bool fetchTime;
        bool fetchTrades{true};
        bool fetchTradingFee;
        bool fetchTradingFees;
        bool fetchTradingLimits;
        bool fetchTransactionFee;
        bool fetchTransactionFees;
        bool fetchTransactions;
        bool fetchTransfers;
        bool fetchWithdrawal;
        bool fetchWithdrawals;
        bool fetchWithdrawalWhitelist;
        bool reduceMargin;
        bool repayMargin;
        bool setLeverage;
        bool setMargin;
        bool setMarginMode;
        bool setPositionMode;
        bool signIn;
        bool transfer;
        bool withdraw;
    };

    enum DigitsCountingMode
    {
        DECIMAL_PLACES,
        SIGNIFICANT_DIGITS,
        TICK_SIZE
    };
    enum ZeroPaddingMode
    {
        NO_PADDING,
        PAD_WITH_ZERO
    };

    struct Options
    {
    };

    enum class MarketType
    {
        SPOT,     // Spot exchange rate product.
        FUTURE,   // perpertual futures.
        DELIVERY, // Delivery futures with expiry dates.
        OPTION,   // Vanlilla options.
        SWAP,
        LINEAR,
        INVERSE
    };

    enum class OptionType
    {
        CALL,
        PUT
    };

    struct Precision
    {
        double amount;
        double price;
        double base;
        double quote;
    };

    struct FeesTiers
    {
        std::map<int, double> taker;
        std::map<int, double> maker;
    };

    struct FeesTrading
    {
        std::string feeside;
        bool tierBased;
        bool percentage{true};
        bool taker;
        bool maker;
        FeesTiers tiers;
    };

    struct FeesFunding
    {
        bool tierBased;
        bool percentage;
        std::vector<double> withdraw;
        std::vector<double> deposit;
    };

    struct Fees
    {
        FeesTrading trading;
        FeesTrading linear;
        FeesTrading inverse;
        FeesFunding funding;
    };

    struct Market
    {
        std::string id;
        std::string symbol;
        std::string base;
        std::string quote;
        std::string baseId;
        std::string quoteId;
        std::optional<bool> active;
        MarketType type;
        bool linear;
        bool inverse;
        bool taker;
        bool maker;
        bool spot{false};
        bool swap{false};
        bool future{false};
        bool option{false};
        bool margin{false};
        bool contract{false};
        int contractSize;
        int expiry;
        std::string expiryDatetime;
        OptionType optionType;
        double strike;
        std::string settle; // settlement currency
        std::string settleId;
        int baseNumericId;
        int quoteNumericId;
        Precision precision;
        Limits limits;
        nlohmann::json info;

        Fees fees;
    };

    const std::string ccxtVersion = "2.9.11";

    // Base exchange class
    class Exchange
    {
    public:
        Exchange();
        virtual ~Exchange(){};

        // fetches the current timestamp in milliseconds from the exchange server
        virtual long fetchTime(boost::beast::net::thread_pool &ioc) = 0;

        static bool checkRequiredVersion(const std::string requiredVersion, bool error = true);
        static bool unique(std::string str);

        std::string checkAddress(std::string address);
        void initRestRateLimiter();
        virtual void setSandboxMode(bool enabled);
        std::map<MarketType, std::map<std::string, Market>> loadMarkets(bool reload = false);
        std::map<MarketType, std::map<std::string, Currency>> fetchCurrencies();
        std::map<MarketType, std::map<std::string, Market>> fetchMarkets();
        double loadTimeDifference(boost::beast::net::thread_pool &ioc);

        std::string safeCurrencyCode(std::string currencyId, MarketType type, std::map<std::string, std::string> currency = {});
        std::string commonCurrencyCode(std::string currency);

    private:
        void handleHttpStatusCode();

        std::map<MarketType, std::map<std::string, Market>> setMarkets(
            const std::map<MarketType, std::map<std::string, Market>> &markets,
            std::map<MarketType, std::map<std::string, Currency>> currencies = {});

        std::map<MarketType, std::map<std::string, Market>> loadMarketsHelper(bool reload = false);

        std::map<std::string, std::string> safeCurrency(std::string currencyId, MarketType type, std::map<std::string, std::string> currency = {});

        Market safeMarket(std::optional<int> marketId = std::nullopt,
                          std::optional<Market> market = std::nullopt, std::optional<std::string> delimiter = std::nullopt,
                          std::optional<MarketType> marketType = std::nullopt);

    protected:
        Exchange(std::string id, std::string name,
                 const std::vector<std::string> &countries, int rateLimit,
                 bool certified, bool pro,
                 Has has, const std::map<std::string, std::string> &timeframes,
                 const URLs &urls, const std::map<std::string, std::string> &commonCurrencies,
                 DigitsCountingMode precisionMode, bool verbose);

        virtual void initFees() = 0;

    public:
        std::string _id;
        std::string _name;
        std::vector<std::string> _countries;
        bool _enableRateLimit{true};
        int _rateLimit{2000};   // milliseconds = seconds * 1000
        bool _certified{false}; // if certified by the CCXT dev team
        bool _pro{false};       // if it is integrated with CCXT Pro for WebSocket support
        bool _alias{false};     // whether this exchange is an alias to another exchange
        Has _has;               // API method metainfo
        URLs _urls;
        std::map<MarketType, std::map<std::string, Market>> _markets;
        std::map<MarketType, std::map<std::string, Currency>> _currencies;
        std::map<MarketType, std::map<std::string, Currency>> _baseCurrencies;
        std::map<MarketType, std::map<std::string, Currency>> _quoteCurrencies;
        std::map<MarketType, std::map<std::string, Currency>> _currencies_by_id;
        std::map<MarketType, std::vector<std::string>> _codes;
        std::map<std::string, std::string> _timeframes; // redefine if the exchange has.fetchOHLCV
        Fees _fees;
        Status _status;
        std::map<std::string, std::string> _commonCurrencies = // gets extended/overwritten in subclasses
            {
                {"XBT", "BTC"},
                {"BCC", "BCH"},
                {"BCHABC", "BCH"},
                {"BCHSV", "BSV"}};
        DigitsCountingMode _precisionMode{DECIMAL_PLACES};
        ZeroPaddingMode _paddingMode{NO_PADDING};
        Limits _limits;

        TokenBucket _tokenBucket;

        bool _validateServerSsl{true};
        bool _validateClientSsl{false};

        std::string _proxy;                        // prepended to URL, like https://proxy.com/https://exchange.com/api...
        std::string _origin{"*"};                  // CORS origin
        bool substituteCommonCurrencyCodes = true; // reserved
        // underlying properties
        size_t _minFundingAddressLength{1}; // used in checkAddress

        std::vector<std::string> _proxies;
        // default property values
        int _timeout{10000}; // milliseconds = seconds * 1000
        bool _verbose{false};
        bool _debug{false};
        bool _twofa{false}; // 2-factor authentication (one-time password key)
        // default credentials
        bool _apiKey{true};
        bool _secret{true};
        bool _uid{false};
        bool _login{false};
        bool _password{false};
        bool _privateKey;    // a "0x"-prefixed hexstring private key for a wallet
        bool _walletAddress; // the wallet address "0x"-prefixed hexstring
        bool _token;         // reserved for HTTP auth in some cases
        // placeholders for cached data
        std::map<std::string, BalanceCache> _balance;
        std::map<std::string, OrderbooksCache> _orderbooks;
        std::map<std::string, TickersCache> _tickers;
        std::map<std::string, OrdersCache> _orders;
        std::map<std::string, TradesCache> _trades;
        std::map<std::string, TransactionsCache> _transactions;
        std::map<std::string, OHLCVsCache> _ohlcvs;
        std::map<std::string, MyTradesCache> _myTrades;
        std::map<std::string, PositionsCache> _positions;
        // web3 and cryptography flags
        bool _requiresWeb3{false};
        bool _requiresEddsa{false};
        // precision = {}
        // response handling flags and properties
        std::time_t _lastRestRequestTimestamp;
        bool _enableLastJsonResponse{true};
        bool _enableLastHttpResponse{true};
        bool _enableLastResponseHeaders{true};
        std::string _last_http_response;
        std::string _last_json_response;
        std::string _last_response_headers;

        std::map<int, std::string> _marketIds;
        std::map<int, std::string> _currenciesIds;
        Precision _precision;

        std::map<std::string, std::string> _headers;

        Options _options;
        Accounts _accounts;

        RequiredCredentials _requiredCredentials;

        std::map<MarketType, std::vector<std::string>> _symbols;
        std::map<MarketType, std::vector<std::string>> _ids;

        std::map<MarketType, std::map<std::string, Market>> _markets_by_id;
        bool _reloadingMarkets;
        std::map<MarketType, std::map<std::string, Market>> _marketsLoading;

        bool _substituteCommonCurrencyCodes{true};
        bool _quoteJsonNumbers{true};
        double _number; // or str (a pointer to a class)
        bool _handleContentTypeApplicationZip{false};
        // whether fees should be summed by currency code
        bool _reduceFees{true};
        double _timeDifference = 0;
    };

} // namespace ccxt