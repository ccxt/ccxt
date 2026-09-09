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

#include "Crypto.h"
#include "Number.h"
#include "Errors.h"
#include "Precise.h"
#include "helpers.h"
#include "ws/Cache.h"
#include "ws/Client.h"
#include "ws/OrderBook.h"

#include <any>
#include <functional>
#include <future>
#include <mutex>
#include <string>
#include <unordered_set>

namespace ccxt {

// TS `throw new Error(...)` transpiles to `throw Error(...)` (the backend's NEW_TOKEN
// is empty). TS Error = the root of the ccxt hierarchy, so alias it here.
using Error = BaseError;

// JS Number sentinels. The backend maps Number.MAX_SAFE_INTEGER to INT_MAX (2^31),
// which is the wrong magnitude, so cppTranspiler.ts redirects it here instead.
inline const std::any MAX_SAFE_INTEGER = static_cast<long long> (9007199254740991LL);

// Awaiting a value that is not a future just yields the value, as in JS.
std::any awaitValue (const std::any& value);
std::any promiseAll (const std::any& futures);
std::any promiseAllConcurrent (const std::any& futures);

// `x instanceof T` cannot be a dynamic_cast on a std::any; the transpiler rewrites it
// to this. Three argument shapes occur: caught exceptions (const std::exception&),
// std::any values, and std::any-wrapped exception_ptr (from getRootException, which
// preserves the concrete ccxt error type across the std::exception catch slicing).
template <class T>
bool isInstanceOf (const std::exception& e) {
    return dynamic_cast<const T*> (&e) != nullptr;
}

template <class T>
bool isInstanceOf (const std::any& value) {
    if (value.type () == typeid (std::exception_ptr)) {
        try {
            std::rethrow_exception (std::any_cast<std::exception_ptr> (value));
        } catch (const T&) {
            return true;
        } catch (...) {
            return false;
        }
    }
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

// Thrown by the generated dispatch tables (and the base callMethod fallback) when a
// method name is genuinely absent. ExchangeBase::callDynamically uses this sentinel --
// and ONLY this -- to mark a name in its negative cache: caching on ANY exception would
// poison the cache with expected control flow (InvalidProxySettings from the offline
// proxy in static request tests, NotSupported from stubbed base methods), making the
// second call to a perfectly dispatchable method skip the table and report "no handler".
class DispatchMiss : public NotSupported {
public:
    explicit DispatchMiss (const std::string& name)
        : NotSupported ("callDynamically: no handler for \"" + name + "\"") {}
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

    // -- credentials ------------------------------------------------------------------
    // The set an exchange actually needs is declared in its describe().requiredCredentials;
    // they all live here so sign() can read whichever ones apply.
    std::any apiKey;
    std::any secret;
    std::any password;
    std::any uid;
    std::any login;
    std::any walletAddress;
    std::any privateKey;
    std::any token;
    std::any verbose;
    std::any number;
    // fields in TS, not methods - the transpiled code reads and assigns them
    std::any reduceFees;
    std::any isSandboxModeEnabled;
    // more TS class fields the transpiled exchange code touches. Some of these are
    // consumed by hand-written members with C++ types (the proxy callbacks live in the
    // Callback fields above), so they are excluded there.
    std::any httpExceptions;
    std::any marketsLoading;
    std::any lastRestRequestTimestamp;
    std::any enableLastHttpResponse;
    std::any enableLastJsonResponse;
    std::any enableLastResponseHeaders;
    std::any fetchHistoryCache;
    std::any triggerOrders;
    std::any fundingRates;
    std::any userAgent;
    std::any userAgents;
    std::any statusTexts;
    std::any httpStatusTexts;
    std::any accountId;
    std::any status;

    // -- rate limiting --------------------------------------------------------------
    // These carry TS class-field defaults (ts/src/base/Exchange.ts:362-367), which are
    // in place BEFORE describe() merges over them. Leaving them undefined made
    // initRestRateLimiter() -- reached from afterConstruct() -- reject every exchange
    // with "rateLimit property is not configured".
    std::any enableRateLimit = std::any (true);
    std::any rateLimit = std::any (2000);
    std::any rateLimiterAlgorithm = std::any (std::string ("leakyBucket"));
    std::any tokenBucket;
    std::any throttler;
    std::any timeout;
    std::any rollingWindowSize = std::any (0.0);

    // -- market and currency state --------------------------------------------------
    // what the last sign() produced -- the static request tests assert against these
    // rather than performing the request (mirrors exchange.last_request_url/body in TS)
    std::any last_request_url;
    std::any last_request_body;

    std::any markets;
    std::any markets_by_id;
    // guards the fetch-and-set phase of loadMarkets (C# uses the cached
    // marketsLoading task for the same purpose)
    std::mutex loadMarketsMutex;
    // The transpiler drops a few base methods whose TS bodies use constructs the
    // backend cannot express. C# hand-writes the same ones (Exchange.cs):
    // randNumber is a real implementation, the zklink-SDK ZK signers are explicit
    // unsupported stubs ("Apex currently does not support create order in ...").
    std::any randNumber (std::any size);
    std::any remove0xPrefix (std::any hexData);
    virtual std::shared_future<std::any> getZKContractSignatureObj (std::any seed, std::any params = std::any {});
    virtual std::shared_future<std::any> getZKTransferSignatureObj (std::any seed, std::any params = std::any {});

    // More TS base methods the C++ backend drops or cannot express. The simple ones
    // are real implementations; the ethers.js/keccak/starknet-crypto backed ones are
    // explicit unsupported stubs until the crypto milestone (keccak-256 + secp256k1
    // signing + EIP-712 + starknet pedersen), mirroring how C# stubs zklink.
    std::any binaryConcat (std::any a = std::any {}, std::any b = std::any {},
                           std::any c = std::any {}, std::any d = std::any {},
                           std::any e = std::any {}, std::any f = std::any {},
                           std::any g = std::any {});
    std::any intToBase16 (std::any number);
    std::any exceptionMessage (std::any exc, std::any includeStack = std::any (true));
    std::any fixStringifiedJsonMembers (std::any content);
    std::any randomBytes (std::any size);
    std::any uuid5 (std::any name, std::any nspace = std::any {});
    std::any convertToBigInt (std::any value);
    std::any ethAbiEncode (std::any types, std::any args);
    std::any ethEncodeStructuredData (std::any domain, std::any messageTypes, std::any messageData);
    std::any ethGetAddressFromPrivateKey (std::any privateKey);
    std::any starknetEncodeStructuredData (std::any domain = {}, std::any messageTypes = {}, std::any messageData = {}, std::any address = {});
    std::any starknetSign (std::any message, std::any privateKey);
    std::any retrieveStarkAccount (std::any signature = {}, std::any accountClassHash = {}, std::any accountProxyClassHash = {});

    // dydx protobuf signing family: C# stubs these in Exchange.cs ("Dydx currently
    // does not support create order / transfer asset in C# language"); the C++ port
    // mirrors that contract until the protobuf milestone.
    std::any encodeDydxTxForSigning (std::any message, std::any memo, std::any chainId,
                                     std::any account, std::any authenticators, std::any fee);
    std::any encodeDydxTxForSimulation (std::any message, std::any memo,
                                        std::any sequence, std::any publicKey);
    std::any encodeDydxTxRaw (std::any signDoc, std::any signature);
    std::any retrieveDydxCredentials (std::any privateKey);
    std::shared_future<std::any> loadDydxProtos ();
    std::any toDydxLong (std::any value);

    // starknet (extended) crypto — same stub contract as starknetSign above
    std::any extendedStarknetSign (std::any message, std::any privateKey);
    std::any extendedStarknetComputePoseidonHashOnElements (std::any elements);
    std::any extendedStarknetGetSelectorFromName (std::any name);

    // parseDate is an imported free function (functions/time.ts) the transpiler drops
    std::any parseDate (std::any value);
    // packb = msgpack serialize (encode.ts imports static_dependencies/messagepack);
    // C# bundles MiniMessagePacker (Exchange.Encode.cs), C++ gets its own below
    std::any packb (std::any data);
    // urlencodeBase64 = base64url (base64 minus '=' padding, '+'->'-', '/'->'_'),
    // used by modetrade and friends for header payloads
    std::any urlencodeBase64 (std::any data);

    // lighter (Lighter.xyz) signing: C# implements these against the lighter native
    // library (Exchange.Lighter.cs); the C++ port stubs them until a lighter milestone
    #define LIGHTER_STUB(NAME) \
        std::any NAME (std::any a = std::any{}, std::any b = std::any{}, std::any c = std::any{}, \
                       std::any d = std::any{}, std::any e = std::any{})
    LIGHTER_STUB (lighterCreateAuthToken);
    LIGHTER_STUB (lighterCreateClient);
    LIGHTER_STUB (lighterGenerateApiKey);
    LIGHTER_STUB (lighterSignApproveIntegrator);
    LIGHTER_STUB (lighterSignCancelAllOrders);
    LIGHTER_STUB (lighterSignCancelOrder);
    LIGHTER_STUB (lighterSignChangePubkey);
    LIGHTER_STUB (lighterSignCreateGroupedOrders);
    LIGHTER_STUB (lighterSignCreateOrder);
    LIGHTER_STUB (lighterSignCreateSubAccount);
    LIGHTER_STUB (lighterSignModifyOrder);
    LIGHTER_STUB (lighterSignTransfer);
    LIGHTER_STUB (lighterSignUpdateLeverage);
    LIGHTER_STUB (lighterSignUpdateMargin);
    LIGHTER_STUB (lighterSignWithdraw);
    #undef LIGHTER_STUB
    std::shared_future<std::any> loadLighterLibrary (std::any path = std::any{}, std::any chainId = std::any{},
                                                     std::any privateKey = std::any{}, std::any apiKeyIndex = std::any{},
                                                     std::any accountIndex = std::any{}, std::any createClient = std::any{});
    // callDynamically memoizes which names are NOT in any generated dispatch table:
    // the test framework calls base helpers (safeString, parseNumber, json, ...) via
    // the dynamic path per market, and without the cache each call linearly scans
    // the per-exchange table plus the ~500-branch base table and then throws to
    // reach the hand-written registry -- minutes of CPU per exchange's test run.
    std::unordered_set<std::string> tableMissCache;
    std::mutex tableMissCacheMutex;
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
    std::any quoteJsonNumbers;
    std::any substituteCommonCurrencyCodes;

    // -- caches ---------------------------------------------------------------------
    std::any balance;
    std::any orderbooks;
    std::any tickers;
    std::any bidsasks;
    // ws tier: whether watch methods resolve on EVERY update vs only NEW entries.
    // Seeded from options.newUpdates at construction (TS Exchange.ts:631), default true.
    std::any newUpdates;
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
    virtual std::any omit (std::any obj, std::any keys, std::any k2 = std::any {},
                           std::any k3 = std::any {}, std::any k4 = std::any {},
                           std::any k5 = std::any {}, std::any k6 = std::any {},
                           std::any k7 = std::any {});
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
    virtual std::any base16ToBinary (std::any value);
    virtual std::any binaryToBase64 (std::any value);
    virtual std::any base58ToBinary (std::any value);
    virtual std::any binaryToBase58 (std::any value);
    virtual std::any binaryLength (std::any value);
    virtual std::any isBinaryMessage (std::any value);
    // TS encode()/decode() are utf8 decode/encode -- string <-> raw octets
    virtual std::any encode (std::any value);
    virtual std::any decode (std::any value);

    // -- crypto -----------------------------------------------------------------------
    virtual std::any hash (std::any payload, std::any algorithm = std::any {},
                           std::any digest = std::any {});
    virtual std::any hmac (std::any payload, std::any key, std::any algorithm = std::any {},
                           std::any digest = std::any {});
    virtual std::any crc32 (std::any value, std::any signed32 = std::any {});
    // Asymmetric signing is not wired yet: binance only needs these for RSA/ed25519 API
    // keys, while the hmac path -- what every static request fixture exercises -- is
    // real. They throw rather than returning a plausible-looking wrong signature.
    virtual std::any rsa (std::any request, std::any secretKey, std::any algorithm = std::any {});
    virtual std::any eddsa (std::any request, std::any secretKey, std::any algorithm = std::any {});
    virtual std::any jwt (std::any data, std::any secretKey, std::any algorithm = std::any {},
                          std::any isRsa = std::any {}, std::any opts = std::any {});
    virtual std::any strip (std::any value);
    virtual std::any uuid ();
    virtual std::any uuid16 ();
    virtual std::any uuid22 ();

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
    virtual std::any microseconds ();
    virtual std::any seconds ();
    virtual std::any iso8601 (std::any timestamp);
    virtual std::any parseTimeframe (std::any timeframe);
    virtual std::any parse8601 (std::any datetime);
    virtual std::any yymmdd (std::any timestamp, std::any infix = std::any {});
    virtual std::any yyyymmdd (std::any timestamp, std::any infix = std::any {});
    virtual std::any ymd (std::any timestamp, std::any infix = std::any {});
    virtual std::any ymdhms (std::any timestamp, std::any infix = std::any {});
    virtual std::any roundTimeframe (std::any timeframe, std::any timestamp,
                                     std::any direction = std::any {});
    virtual std::shared_future<std::any> sleep (std::any ms);

    // -- logging --------------------------------------------------------------------
    virtual std::any log (std::any value);
    virtual std::any aggregate (std::any bidasks);
    // WS OrderBook factories (ts/src/base/Exchange.ts orderBook/indexedOrderBook/
    // countedOrderBook) — return live ws::WsOrderBook handles
    virtual std::any orderBook (std::any snapshot = std::any {}, std::any depth = std::any {});
    virtual std::any indexedOrderBook (std::any snapshot = std::any {}, std::any depth = std::any {});
    virtual std::any countedOrderBook (std::any snapshot = std::any {}, std::any depth = std::any {});
    virtual std::any totp (std::any key);

    // -- concurrency / cache plumbing -----------------------------------------------
    virtual std::any createSafeDictionary (std::any isWs = std::any {});
    virtual std::any mapToSafeMap (std::any value);
    virtual std::any initThrottler ();

    // -- dynamic access (test framework + transpiled property calls) ------------------
    // Transpiled code reads/writes members through these when the receiver is a
    // std::any: getProperty/setProperty cover the flat field surface, callDynamically
    // routes method calls to the generated per-exchange callMethod table first and
    // falls back to the common helper registry.
    virtual std::any getProperty (const std::string& name);
    virtual std::any setProperty (const std::string& name, std::any value);
    virtual std::any callDynamically (const std::string& name, std::any args);
    // implicit-API fallback for callDynamically: overridden by Exchange, which owns
    // the endpoint registry built from describe().api
    virtual bool hasEndpoint (const std::string&) { return false; }
    virtual std::shared_future<std::any> callEndpoint (std::any, std::any = std::any {}) {
        throw NotSupported ("callEndpoint requires the generated Exchange layer");
    }

    // -- HTTP plumbing ----------------------------------------------------------------
    // handleErrors is also declared on the generated Exchange class (a no-op default)
    // and overridden per exchange (binance.h); fetch() calls it through the vtable.
    virtual std::any handleErrors (std::any statusCode, std::any statusText,
                                   std::any url, std::any method,
                                   std::any responseHeaders, std::any responseBody,
                                   std::any response, std::any requestHeaders,
                                   std::any requestBody);
    virtual std::any handleHttpStatusCode (std::any code, std::any reason,
                                           std::any url, std::any method,
                                           std::any body);
    virtual std::any onRestResponse (std::any statusCode, std::any statusText,
                                     std::any url, std::any method,
                                     std::any responseHeaders, std::any responseBody,
                                     std::any requestHeaders, std::any requestBody);

    // default request headers merged into every fetch (User-Agent etc.)
    std::any headers;

    // -- generated-surface redeclarations --------------------------------------------
    // These methods are generated into the Exchange class (.inc). Redeclaring them
    // here (identical signatures) lets ExchangeBase code (callDynamically, fetch)
    // reach them through the vtable; the .inc definitions become overrides.
    virtual std::any safeNumber (std::any obj, std::any key, std::any defaultNumber = std::any {});
    virtual std::any safeDict (std::any dictionaryOrList, std::any key, std::any defaultValue = std::any {});
    virtual std::any safeList (std::any dictionaryOrList, std::any key, std::any defaultValue = std::any {});
    virtual std::any parseToInt (std::any number);
    virtual std::any parseToNumeric (std::any number);
    virtual std::any market (std::any symbol);
    virtual std::any marketId (std::any symbol);
    virtual std::any currency (std::any code);
    virtual std::any currencyId (std::any code);
    virtual std::any checkRequiredCredentials (std::any error = true);
    virtual std::any setMarkets (std::any markets, std::any currencies = std::any {});
    virtual void setSandboxMode (std::any enabled);
    virtual std::any isEmptyString (std::any value);

    // -- handwritten helpers the transpiled test framework calls ----------------------
    virtual std::any extendExchangeOptions (std::any newOptions);
    virtual std::any convertToSafeDictionary (std::any value);
    virtual std::any getCcxtVersion ();
    virtual std::any addFetchCache (std::any entry, std::any value = std::any {});
    virtual std::any setLastRequest (std::any value);
    virtual std::any setLastRestRequestTimestamp (std::any value = std::any {});
    virtual std::any storeArray (std::any target, std::any value);
    virtual std::any resolve (std::any value, std::any messageHash = std::any {});
    virtual std::any reject (std::any value, std::any messageHash = std::any {});

    // -- ws plumbing (hand-written, mirrors ts/src/base/Exchange.ts above the
    //    transpile marker + the runtime below it) --------------------------------
    virtual std::any client (std::any url);
    virtual std::any watch (std::any url, std::any messageHash, std::any message = std::any {},
                            std::any subscribeHash = std::any {}, std::any subscription = std::any {});
    virtual std::any watchMultiple (std::any url, std::any messageHashes, std::any message = std::any {},
                                    std::any subscribeHashes = std::any {}, std::any subscription = std::any {});
    virtual std::shared_future<std::any> spawn (std::any methodName, std::any args);
    virtual std::shared_future<std::any> delay (std::any timeout, std::any methodName, std::any args);
    virtual std::any ping (std::any client);
    // pro tier request-id serialisation (TS lockId/unlockId stubs above the
    // transpile marker; the ws harness races requestId() across threads) —
    // inline definitions live below with the dispatch helpers
    virtual std::any lockId () {
        idLock.lock ();
        return std::any {};
    }
    virtual std::any unlockId () {
        idLock.unlock ();
        return std::any {};
    }
    mutable std::mutex idLock;
    // transpiled pro code calls delay(timeout, methodName, ...rest) and
    // spawn(methodName, ...rest) with the rest arguments FLAT (JS rest-spread);
    // the variadic overloads pack them into the args list the dynamic dispatcher
    // expects
    template <class... Args>
    std::shared_future<std::any> delay (std::any timeout, std::any methodName, Args&&... rest) {
        ccxt::list args;
        (args.push (std::any (rest)), ...);
        return this->delay (timeout, methodName, std::any (args));
    }
    template <class... Args>
    std::shared_future<std::any> spawn (std::any methodName, Args&&... rest) {
        ccxt::list args;
        (args.push (std::any (rest)), ...);
        return this->spawn (methodName, std::any (args));
    }
    // generated pro code stores a method NAME in a dict value and later calls it
    // as method.call(this, ...); route the name through the dispatch table
    std::any dispatchMethodName (std::any methodName, std::any args) {
        return this->callDynamically (str (methodName), args);
    }
    // ws base emulations declared in TS Exchange.ts ABOVE the transpile marker, so
    // the pro overrides (bitvavo fetchMarketsWs etc) need base declarations here.
    // The bodies mirror the TS ones: resolve the current state immediately.
    virtual std::shared_future<std::any> fetchMarketsWs (std::any params = std::any {});
    virtual std::shared_future<std::any> fetchCurrenciesWs (std::any params = std::any {});
    virtual std::shared_future<std::any> fetchBalanceWs (std::any params = std::any {});
    virtual std::shared_future<std::any> fetchTradingFeesWs (std::any params = std::any {});
    virtual void handleMessage (std::any client, std::any message);
    virtual void onConnected (std::any client, std::any message = std::any {});
    virtual void onError (std::any client, std::any error);
    virtual void onClose (std::any client, std::any error);
    virtual std::shared_future<std::any> close (std::any cleanInstanceCache = std::any {});
    virtual std::shared_future<std::any> throttle (std::any cost = std::any {});

    // -- network --------------------------------------------------------------------
    //
    // Iteration 1 is offline by design (see the PRD success criteria). libcurl is found
    // and linked by CMake so the dependency is proven, but no transport is wired yet;
    // calling this throws rather than silently returning nothing.
    // Injectable transport. When set, fetch() delegates here instead of performing a
    // request, and the return value is used as the already-decoded response body. This
    // is what makes the static response tests possible: they install a hook that yields
    // the fixture's canned httpResponse, exactly as the reference harness does by
    // reassigning exchange.fetch (setFetchResponse in ts/src/test/tests.helpers.ts).
    // A real libcurl transport can be installed the same way later.
    std::function<std::any (std::any url, std::any method, std::any headers, std::any body)> fetchImpl;

    virtual std::shared_future<std::any> fetch (std::any url, std::any method = std::any {},
                                                std::any headers = std::any {},
                                                std::any body = std::any {});
    // Declared here so a derived exchange's generated `fetchMarkets(...) override`
    // actually has something to override -- describe().has lists them, but the base
    // methods themselves sit above the transpile delimiter.
    virtual std::shared_future<std::any> fetchMarkets (std::any params = std::any {});
    virtual std::shared_future<std::any> fetchCurrencies (std::any params = std::any {});
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

    // Call a unified method by name with a positional argument list. Each generated
    // exchange overrides this with a table built from its own signatures (see
    // createDispatchTable in build/cppTranspiler.ts); the base has no methods to offer.
    // A name absent from every table surfaces as DispatchMiss (see ExchangeBase.cpp),
    // which is the ONLY signal callDynamically's negative cache records.
    virtual std::any callMethod (std::any name, std::any args);
};

} // namespace ccxt
