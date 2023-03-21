#pragma once

#include <string>
#include <vector>
#include <map>
#include <ctime>
#include <ccxt/base/errors.h>

struct URLs 
{
    std::wstring logo;
    std::map<std::wstring, std::wstring> api;
    std::map<std::wstring, std::wstring> test;
    std::wstring www;
    std::vector<std::wstring> doc;
    std::wstring api_management;
    std::wstring fees;
    std::wstring referral;
    std::map<std::wstring, std::wstring> apiBackup;
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

struct OrderbooksCache {};
struct TickersCache {};
struct OrdersCache {};
struct TradesCache {};
struct TransactionsCache {};
struct OHLCVsCache {};
struct MyTradesCache {};
struct PositionsCache {};

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
    std::wstring id;
    std::wstring numericId;
    std::wstring code;
    double precision;    
};

typedef std::wstring AccountGroup;
struct Accounts
{
    AccountGroup id;
    // 'type': undefined,
    // 'currency': undefined,
    // 'info': response,
};

struct Status
{
    std::wstring status;
    std::time_t updated;
    std::time_t eta;
    std::wstring url;
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

struct Has
{
    bool publicAPI = true;
    bool privateAPI = true;
    bool CORS;
    bool spot;
    bool margin;
    bool swap;
    bool future;
    bool option;
    bool addMargin;
    bool cancelAllOrders;
    bool cancelOrder = true;
    bool cancelOrders;
    bool createDepositAddress;
    bool createLimitOrder = true;
    bool createMarketOrder = true;
    bool createOrder = true;
    bool createPostOnlyOrder;
    bool createReduceOnlyOrder;
    bool createStopOrder;
    bool createStopLimitOrder;
    bool createStopMarketOrder;
    std::string editOrder = "emulated";
    bool fetchAccounts;
    bool fetchBalance = true;
    bool fetchBidsAsks;
    bool fetchBorrowInterest;
    bool fetchBorrowRate;
    bool fetchBorrowRateHistory;
    bool fetchBorrowRatesPerSymbol;
    bool fetchBorrowRates;
    bool fetchCanceledOrders;
    bool fetchClosedOrder;
    bool fetchClosedOrders;
    std::string fetchCurrencies = "emulated";
    bool fetchDeposit;
    bool fetchDepositAddress;
    bool fetchDepositAddresses;
    bool fetchDepositAddressesByNetwork;
    bool fetchDeposits;
    bool fetchFundingFee;
    bool fetchFundingFees;
    bool fetchFundingHistory;
    bool fetchFundingRate;
    bool fetchFundingRateHistory;
    bool fetchFundingRates;
    bool fetchIndexOHLCV;
    bool fetchL2OrderBook = true;
    bool fetchLedger;
    bool fetchLedgerEntry;
    bool fetchLeverageTiers;
    bool fetchMarketLeverageTiers;
    bool fetchMarkets = true;
    bool fetchMarkOHLCV;
    bool fetchMyTrades;
    bool fetchOHLCV;
    bool fetchOpenOrder;
    bool fetchOpenOrders;
    bool fetchOrder;
    bool fetchOrderBook = true;
    bool fetchOrderBooks;
    bool fetchOrders;
    bool fetchOrderTrades;
    bool fetchPermissions;
    bool fetchPosition;
    bool fetchPositions;
    bool fetchPositionsRisk;
    bool fetchPremiumIndexOHLCV;
    std::string fetchStatus = "emulated";
    bool fetchTicker = true;
    bool fetchTickers;
    bool fetchTime;
    bool fetchTrades = true;
    bool fetchTradingFee;
    bool fetchTradingFees;
    bool fetchTradingLimits;
    bool fetchTransactions;
    bool fetchTransfers;
    bool fetchWithdrawal;
    bool fetchWithdrawals;
    bool reduceMargin;
    bool setLeverage;
    bool setMargin;
    bool setMarginMode;
    bool setPositionMode;
    bool signIn;
    bool transfer;
    bool withdraw;
};

enum DigitsCountingMode { DECIMAL_PLACES, SIGNIFICANT_DIGITS, TICK_SIZE };
enum ZeroPaddingMode { NO_PADDING, PAD_WITH_ZERO };

struct Options {};
            
const std::wstring ccxtVersion = L"2.9.11";

// Base exchange class
class Exchange
{
    public:
        Exchange();

        static bool checkRequiredVersion(const std::wstring requiredVersion, bool error = true);
        static bool unique(std::wstring str);

        std::wstring checkAddress(std::wstring address);
        void initRestRateLimiter();
        void setSandboxMode(bool enabled);

    private:
        void defineRestApiEndpoint();
        void defineRestApi(std::map<std::wstring, std::wstring>& api, const std::wstring& methodName, const std::vector<std::wstring>& paths);
        void defineRestApi(std::wstring& api, const std::wstring& methodName, const std::vector<std::wstring>& paths);
        void handleHttpStatusCode();
        
        std::wstring _id;
        std::wstring _name;
        std::wstring _version;
        bool _certified = false;  // if certified by the CCXT dev team
        bool _pro = false; // if it is integrated with CCXT Pro for WebSocket support
        bool _alias = false; // whether this exchange is an alias to another exchange
        // rate limiter settings
        bool _enableRateLimit = true;
        int _rateLimit = 2000;   // milliseconds = seconds * 1000
        TokenBucket _tokenBucket;

        bool _validateServerSsl = true;
        bool _validateClientSsl = false;

        // std::map<std::wstring, std::wstring> _userAgents {
        //     {"chrome", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36"},
        //     {"chrome39", "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36"},
        //     {"chrome100", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36"}
        // };        
        // markets = None
        // symbols = None
        // codes = None
        // timeframes = None // // redefine if the exchange has.fetchOHLCV

        // fees = {
        //     'trading': {
        //         'percentage': true,  // subclasses should rarely have to redefine this
        //     },
        //     'funding': {
        //         'withdraw': {},
        //         'deposit': {},
        //     },
        // }

        // loaded_fees = {
        //     'trading': {
        //         'percentage': True,
        //     },
        //     'funding': {
        //         'withdraw': {},
        //         'deposit': {},
        //     },
        // }

        //ids = None

        URLs _urls;

        std::map<std::wstring, std::wstring> _api;
        std::wstring _proxy;          // prepended to URL, like https://proxy.com/https://exchange.com/api...
        std::wstring _origin = L"*";  // CORS origin
        // underlying properties
        size_t _minFundingAddressLength = 1; // used in checkAddress

        std::vector<std::wstring> _proxies;
        // default property values
        int _timeout = 10000;    // milliseconds = seconds * 1000
        bool _verbose = false;
        bool _debug = false;
        bool _twofa = false;     // 2-factor authentication (one-time password key)        
        // default credentials
        bool _apiKey = true;
        bool _secret = true;
        bool _uid = false;
        bool _login = false;
        bool _password = false;        
        bool _privateKey;        // a "0x"-prefixed hexstring private key for a wallet
        bool _walletAddress;     // the wallet address "0x"-prefixed hexstring
        bool _token;             // reserved for HTTP auth in some cases
        // placeholders for cached data
        std::map<std::wstring, BalanceCache> _balance;
        std::map<std::wstring, OrderbooksCache> _orderbooks;
        std::map<std::wstring, TickersCache> _tickers;
        std::map<std::wstring, OrdersCache> _orders;
        std::map<std::wstring, TradesCache> _trades;
        std::map<std::wstring, TransactionsCache> _transactions;
        std::map<std::wstring, OHLCVsCache> _ohlcvs;
        std::map<std::wstring, MyTradesCache> _myTrades;
        std::map<std::wstring, PositionsCache> _positions;
        // web3 and cryptography flags
        bool _requiresWeb3 = false;
        bool _requiresEddsa = false;
        // precision = {}
        // response handling flags and properties
        std::time_t _lastRestRequestTimestamp;
        bool _enableLastJsonResponse = true;
        bool _enableLastHttpResponse = true;
        bool _enableLastResponseHeaders = true;
        std::wstring _last_http_response;
        std::wstring _last_json_response;
        std::wstring _last_response_headers;

        std::map<int, std::wstring> _marketIds;
        std::map<int, std::wstring> _currenciesIds;
        std::map<std::wstring, int> _precision;
        // exceptions = None        
        
        std::map<std::wstring,std::wstring> _headers;

        Limits _limits;

        // set by loadMarkets
        std::map<int, Currency> _baseCurrencies;
        std::map<int, Currency> _quoteCurrencies;
        std::map<int, Currency> _currencies;
        Options _options;
        Accounts _accounts;

        Status _status;
        RequiredCredentials _requiredCredentials;
        
        Has _has; // API method metainfo

        DigitsCountingMode _precisionMode = DECIMAL_PLACES;
        ZeroPaddingMode _paddingMode = NO_PADDING;

        bool _substituteCommonCurrencyCodes = true;
        bool _quoteJsonNumbers = true;
        double _number; // or str (a pointer to a class)
        bool _handleContentTypeApplicationZip = false;
        // whether fees should be summed by currency code
        bool _reduceFees = true;
        
        std::map<std::string, std::string> _commonCurrencies = // gets extended/overwritten in subclasses
        {
            {"XBT", "BTC"},
            {"BCC", "BCH"},
            {"BCHABC", "BCH"},
            {"BCHSV", "BSV"}
        };
};
