#pragma once

// The hand-written half of the base Exchange.
//
// ts/src/base/Exchange.ts is split at the marker
// `// METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT` (line ~2791). Everything
// ABOVE it is re-implemented per language; everything below is transpiled into
// Exchange.BaseMethods.inc. This file is the C++ side of that hand-written half, the
// counterpart of cs/ccxt/base/Exchange.*.cs.
//
// The member list here is not guesswork: it is what the generated fragment actually
// references, enumerated by compiling the fragment against an empty base.

#include "Errors.h"
#include "Precise.h"
#include "helpers.h"

#include <any>
#include <future>
#include <string>

namespace ccxt {

// JS Number sentinels. The backend maps Number.MAX_SAFE_INTEGER to INT_MAX (2^31),
// which is the wrong magnitude, so cppTranspiler.ts redirects it here instead.
inline const std::any MAX_SAFE_INTEGER = static_cast<long long> (9007199254740991LL);

// Awaiting a value that is not a future just yields the value, as in JS.
std::any awaitValue (const std::any& value);
std::any promiseAll (const std::any& futures);

// `x instanceof T` cannot be a dynamic_cast on a std::any; the transpiler rewrites it
// to this. Only error types are ever tested this way in the transpiled sources.
template <class T>
bool isInstanceOf (const std::any& value) {
    return value.type () == typeid (T);
}

// User-supplied proxy hooks. TS calls these as `this.proxyUrlCallback(url, ...)`, so
// they have to be callable; unset ones fail loudly rather than returning nothing.
struct Callback {
    std::any value;
    template <class... Args>
    std::any operator() (Args&&...) const {
        if (!value.has_value ()) {
            throw NotSupported ("proxy callback is not set");
        }
        throw NotSupported ("user-supplied proxy callbacks are not invocable in the C++ port yet");
    }
    explicit operator bool () const { return value.has_value (); }
};

class ExchangeBase {
public:
    ExchangeBase () = default;
    virtual ~ExchangeBase () = default;

    // -- identity and configuration -------------------------------------------------
    std::any id;
    std::any name;
    std::any alias;
    std::any countries;
    std::any version;
    std::any hostname;
    std::any certified;
    std::any pro;
    std::any has;
    std::any features;
    std::any urls;
    std::any api;
    std::any options;
    std::any timeframes;
    std::any fees;
    std::any limits;
    std::any precision;
    std::any precisionMode;
    std::any paddingMode;
    std::any requiredCredentials;
    std::any commonCurrencies;
    std::any exceptions;
    std::any twofa;
    std::any verbose;
    std::any number;
    // fields in TS, not methods - the transpiled code reads and assigns them
    std::any reduceFees;
    std::any isSandboxModeEnabled;

    // -- rate limiting --------------------------------------------------------------
    std::any enableRateLimit;
    std::any rateLimit;
    std::any rateLimiterAlgorithm;
    std::any tokenBucket;
    std::any throttler;
    std::any timeout;
    std::any rollingWindowSize;

    // -- market and currency state --------------------------------------------------
    std::any markets;
    std::any markets_by_id;
    std::any currencies;
    std::any currencies_by_id;
    std::any symbols;
    std::any ids;
    std::any codes;
    std::any baseCurrencies;
    std::any quoteCurrencies;
    std::any accounts;
    std::any accountsById;
    std::any minFundingAddressLength;
    std::any substituteCommonCurrencyCodes;

    // -- caches ---------------------------------------------------------------------
    std::any balance;
    std::any orderbooks;
    std::any tickers;
    std::any bidsasks;
    std::any orders;
    std::any trades;
    std::any myTrades;
    std::any positions;
    std::any liquidations;
    std::any myLiquidations;
    std::any ohlcvs;
    std::any transactions;
    std::any futures;
    std::any clients;
    std::any subscriptions;
    std::any fetchHistoryCacheSize;

    // -- last request / response ----------------------------------------------------
    std::any last_http_response;
    std::any last_request_headers;
    std::any last_response_headers;

    // -- proxies --------------------------------------------------------------------
    Callback proxy;
    std::any proxyUrl;
    std::any proxy_url;
    Callback proxyUrlCallback;
    Callback proxy_url_callback;
    std::any httpProxy;
    std::any http_proxy;
    Callback httpProxyCallback;
    Callback http_proxy_callback;
    std::any httpsProxy;
    std::any https_proxy;
    Callback httpsProxyCallback;
    Callback https_proxy_callback;
    std::any socksProxy;
    std::any socks_proxy;
    Callback socksProxyCallback;
    Callback socks_proxy_callback;
    std::any wsProxy;
    std::any ws_proxy;
    std::any wssProxy;
    std::any wss_proxy;
    std::any wsSocksProxy;
    std::any ws_socks_proxy;

    // -- safe accessors -------------------------------------------------------------
    virtual std::any safeString (std::any obj, std::any key, std::any def = std::any {});
    virtual std::any safeString2 (std::any obj, std::any k1, std::any k2, std::any def = std::any {});
    virtual std::any safeStringN (std::any obj, std::any keys, std::any def = std::any {});
    virtual std::any safeStringUpper (std::any obj, std::any key, std::any def = std::any {});
    virtual std::any safeStringLower (std::any obj, std::any key, std::any def = std::any {});
    virtual std::any safeInteger (std::any obj, std::any key, std::any def = std::any {});
    virtual std::any safeInteger2 (std::any obj, std::any k1, std::any k2, std::any def = std::any {});
    virtual std::any safeIntegerN (std::any obj, std::any keys, std::any def = std::any {});
    virtual std::any safeFloat (std::any obj, std::any key, std::any def = std::any {});
    virtual std::any safeFloat2 (std::any obj, std::any k1, std::any k2, std::any def = std::any {});
    virtual std::any safeFloatN (std::any obj, std::any keys, std::any def = std::any {});
    virtual std::any safeValue (std::any obj, std::any key, std::any def = std::any {});
    virtual std::any safeValue2 (std::any obj, std::any k1, std::any k2, std::any def = std::any {});
    virtual std::any safeValueN (std::any obj, std::any keys, std::any def = std::any {});
    virtual std::any safeBool (std::any obj, std::any key, std::any def = std::any {});
    virtual std::any safeTimestamp (std::any obj, std::any key, std::any def = std::any {});
    virtual std::any safeTimestamp2 (std::any obj, std::any k1, std::any k2, std::any def = std::any {});
    virtual std::any safeTimestampN (std::any obj, std::any keys, std::any def = std::any {});
    virtual std::any safeStringUpper2 (std::any obj, std::any k1, std::any k2, std::any def = std::any {});
    virtual std::any safeStringUpperN (std::any obj, std::any keys, std::any def = std::any {});
    virtual std::any safeStringLower2 (std::any obj, std::any k1, std::any k2, std::any def = std::any {});
    virtual std::any safeStringLowerN (std::any obj, std::any keys, std::any def = std::any {});
    virtual std::any safeIntegerProduct (std::any obj, std::any key, std::any factor, std::any def = std::any {});
    virtual std::any safeIntegerProduct2 (std::any obj, std::any k1, std::any k2, std::any factor, std::any def = std::any {});
    virtual std::any safeIntegerProductN (std::any obj, std::any keys, std::any factor, std::any def = std::any {});

    // -- generic collection helpers -------------------------------------------------
    virtual std::any extend (std::any a, std::any b = std::any {});
    virtual std::any deepExtend (std::any a, std::any b = std::any {},
                                 std::any c = std::any {}, std::any d = std::any {});
    virtual std::any clone (std::any value);
    virtual std::any sortBy (std::any array, std::any key,
                             std::any descending = std::any {}, std::any def = std::any {});
    virtual std::any sortBy2 (std::any array, std::any k1, std::any k2,
                              std::any descending = std::any {});
    virtual std::any groupBy (std::any array, std::any key);
    virtual std::any indexBy (std::any array, std::any key);
    virtual std::any indexBySafe (std::any array, std::any key);
    virtual std::any filterBy (std::any array, std::any key, std::any value);
    virtual std::any inArray (std::any needle, std::any haystack);
    virtual std::any keysort (std::any obj);
    virtual std::any omit (std::any obj, std::any keys);
    virtual std::any omitZero (std::any value);
    virtual std::any toArray (std::any value);
    virtual std::any unique (std::any array);
    virtual std::any sum (std::any a = std::any {}, std::any b = std::any {},
                          std::any c = std::any {}, std::any d = std::any {});
    virtual std::any isDictionary (std::any value);
    virtual std::any arrayConcat (std::any a, std::any b);
    virtual std::any arraySlice (std::any array, std::any start, std::any end = std::any {});
    virtual std::any valueIsDefined (std::any value);
    virtual std::any isEmpty (std::any value);
    virtual std::any sort (std::any array);

    // -- string helpers -------------------------------------------------------------
    virtual std::any capitalize (std::any s);
    virtual std::any implodeParams (std::any target, std::any params);
    virtual std::any extractParams (std::any target);
    virtual std::any encodeURIComponent (std::any value);
    virtual std::any stringToCharsArray (std::any value);
    virtual std::any stringToBase64 (std::any value);
    virtual std::any base64ToBinary (std::any value);
    virtual std::any binaryToBase16 (std::any value);
    virtual std::any strip (std::any value);
    virtual std::any uuid ();

    // -- numbers --------------------------------------------------------------------
    virtual std::any parseNumber (std::any value, std::any def = std::any {});
    virtual std::any numberToString (std::any value);
    virtual std::any decimalToPrecision (std::any x, std::any roundingMode, std::any digits,
                                         std::any countingMode = std::any {},
                                         std::any padding = std::any {});
    virtual std::any precisionFromString (std::any value);
    std::any MAX_VALUE = std::any (1.7976931348623157e308);

    // -- json and query-string encoding ----------------------------------------------
    virtual std::any parseJson (std::any value);
    virtual std::any json (std::any value, std::any params = std::any {});
    virtual std::any isJsonEncodedObject (std::any value);
    // The four qs.stringify() configurations ccxt uses. They differ only in what gets
    // percent-encoded and how arrays are keyed; see qsStringify in ExchangeBase.cpp.
    virtual std::any urlencode (std::any params, std::any sortKeys = std::any {});
    virtual std::any urlencodeNested (std::any params);
    virtual std::any urlencodeWithArrayRepeat (std::any params);
    virtual std::any rawencode (std::any params, std::any sortKeys = std::any {});
protected:
    // the one traversal all four encoders share
    std::string queryString (const std::any& params, bool encodeKeys, bool encodeValues,
                             bool arrayRepeat, const std::any& sortKeys);
public:

    // -- time -----------------------------------------------------------------------
    virtual std::any milliseconds ();
    virtual std::any seconds ();
    virtual std::any iso8601 (std::any timestamp);
    virtual std::any parseTimeframe (std::any timeframe);
    virtual std::any parse8601 (std::any datetime);
    virtual std::any roundTimeframe (std::any timeframe, std::any timestamp,
                                     std::any direction = std::any {});
    virtual std::shared_future<std::any> sleep (std::any ms);

    // -- logging --------------------------------------------------------------------
    virtual std::any log (std::any value);
    virtual std::any aggregate (std::any bidasks);
    // WS OrderBook factory; the pro layer is a non-goal this iteration, so this
    // yields a plain container rather than a live, checksum-tracking order book.
    virtual std::any orderBook (std::any snapshot = std::any {}, std::any depth = std::any {});
    virtual std::any totp (std::any key);

    // -- concurrency / cache plumbing -----------------------------------------------
    virtual std::any createSafeDictionary (std::any isWs = std::any {});
    virtual std::any mapToSafeMap (std::any value);
    virtual std::any initThrottler ();
    virtual std::any addFetchCache (std::any entry, std::any value = std::any {});
    virtual std::any setLastRequest (std::any value);
    virtual std::any setLastRestRequestTimestamp (std::any value = std::any {});
    virtual std::any storeArray (std::any target, std::any value);
    virtual std::any resolve (std::any value, std::any messageHash = std::any {});
    virtual std::any reject (std::any value, std::any messageHash = std::any {});
    virtual std::shared_future<std::any> throttle (std::any cost = std::any {});

    // -- network --------------------------------------------------------------------
    //
    // Iteration 1 is offline by design (see the PRD success criteria). libcurl is found
    // and linked by CMake so the dependency is proven, but no transport is wired yet;
    // calling this throws rather than silently returning nothing.
    virtual std::shared_future<std::any> fetch (std::any url, std::any method = std::any {},
                                                std::any headers = std::any {},
                                                std::any body = std::any {});
    virtual std::shared_future<std::any> loadMarkets (std::any reload = std::any {},
                                                      std::any params = std::any {});

    // -- dynamic dispatch (D3) ------------------------------------------------------
    //
    // `this[method](...)` has no C++ equivalent, so cppTranspiler.ts rewrites those
    // call sites to these. Only the names the transpiled sources actually dispatch on
    // need to resolve; anything else is an explicit NotSupported rather than a silent
    // no-op.
    virtual std::any getProperty (ExchangeBase* self, std::any name);
    virtual void setProperty (ExchangeBase* self, std::any name, std::any value);
    virtual std::any callDynamically (ExchangeBase* self, std::any name, std::any args);
};

} // namespace ccxt
