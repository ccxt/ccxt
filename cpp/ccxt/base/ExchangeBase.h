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
inline const ccxt::any MAX_SAFE_INTEGER = static_cast<long long> (9007199254740991LL);

// Awaiting a value that is not a future just yields the value, as in JS.
ccxt::any awaitValue (const ccxt::any& value);
ccxt::any promiseAll (const ccxt::any& futures);
ccxt::any promiseAllConcurrent (const ccxt::any& futures);

// `x instanceof T` cannot be a dynamic_cast on a ccxt::any; the transpiler rewrites it
// to this. Three argument shapes occur: caught exceptions (const std::exception&),
// ccxt::any values, and ccxt::any-wrapped exception_ptr (from getRootException, which
// preserves the concrete ccxt error type across the std::exception catch slicing).
template <class T>
bool isInstanceOf (const std::exception& e) {
    return dynamic_cast<const T*> (&e) != nullptr;
}

template <class T>
bool isInstanceOf (const ccxt::any& value) {
    if (value.type () == typeid (std::exception_ptr)) {
        try {
            std::rethrow_exception (ccxt::any_cast<std::exception_ptr> (value));
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
    ccxt::any value;
    template <class... Args>
    ccxt::any operator() (Args&&...) const {
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
    virtual ~ExchangeBase ();

    // -- identity and configuration -------------------------------------------------
    ccxt::any id;
    ccxt::any name;
    ccxt::any alias;
    ccxt::any countries;
    ccxt::any version;
    ccxt::any hostname;
    ccxt::any certified;
    ccxt::any pro;
    ccxt::any has;
    ccxt::any features;
    ccxt::any urls;
    ccxt::any api;
    ccxt::any options;
    ccxt::any timeframes;
    ccxt::any fees;
    ccxt::any limits;
    ccxt::any precision;
    ccxt::any precisionMode;
    ccxt::any paddingMode;
    ccxt::any requiredCredentials;
    ccxt::any commonCurrencies;
    ccxt::any exceptions;
    ccxt::any twofa;

    // -- credentials ------------------------------------------------------------------
    // The set an exchange actually needs is declared in its describe().requiredCredentials;
    // they all live here so sign() can read whichever ones apply.
    ccxt::any apiKey;
    ccxt::any secret;
    ccxt::any password;
    ccxt::any uid;
    ccxt::any login;
    ccxt::any walletAddress;
    ccxt::any privateKey;
    ccxt::any token;
    ccxt::any verbose;
    ccxt::any number;
    // fields in TS, not methods - the transpiled code reads and assigns them
    ccxt::any reduceFees;
    ccxt::any isSandboxModeEnabled;
    // more TS class fields the transpiled exchange code touches. Some of these are
    // consumed by hand-written members with C++ types (the proxy callbacks live in the
    // Callback fields above), so they are excluded there.
    ccxt::any httpExceptions;
    ccxt::any marketsLoading;
    ccxt::any lastRestRequestTimestamp;
    ccxt::any enableLastHttpResponse;
    ccxt::any enableLastJsonResponse;
    ccxt::any enableLastResponseHeaders;
    ccxt::any fetchHistoryCache;
    ccxt::any triggerOrders;
    ccxt::any fundingRates;
    ccxt::any userAgent;
    ccxt::any userAgents;
    ccxt::any statusTexts;
    ccxt::any httpStatusTexts;
    ccxt::any accountId;
    ccxt::any status;

    // -- rate limiting --------------------------------------------------------------
    // These carry TS class-field defaults (ts/src/base/Exchange.ts:362-367), which are
    // in place BEFORE describe() merges over them. Leaving them undefined made
    // initRestRateLimiter() -- reached from afterConstruct() -- reject every exchange
    // with "rateLimit property is not configured".
    ccxt::any enableRateLimit = ccxt::any (true);
    ccxt::any rateLimit = ccxt::any (2000);
    ccxt::any rateLimiterAlgorithm = ccxt::any (std::string ("leakyBucket"));
    ccxt::any tokenBucket;
    ccxt::any throttler;
    ccxt::any timeout;
    ccxt::any rollingWindowSize = ccxt::any (0.0);

    // -- market and currency state --------------------------------------------------
    // what the last sign() produced -- the static request tests assert against these
    // rather than performing the request (mirrors exchange.last_request_url/body in TS)
    ccxt::any last_request_url;
    ccxt::any last_request_body;

    ccxt::any markets;
    ccxt::any markets_by_id;
    // guards the fetch-and-set phase of loadMarkets (C# uses the cached
    // marketsLoading task for the same purpose)
    std::mutex loadMarketsMutex;
    // The transpiler drops a few base methods whose TS bodies use constructs the
    // backend cannot express. C# hand-writes the same ones (Exchange.cs):
    // randNumber is a real implementation, the zklink-SDK ZK signers are explicit
    // unsupported stubs ("Apex currently does not support create order in ...").
    ccxt::any randNumber (ccxt::any size);
    ccxt::any remove0xPrefix (ccxt::any hexData);
    virtual std::shared_future<ccxt::any> getZKContractSignatureObj (ccxt::any seed, ccxt::any params = ccxt::any {});
    virtual std::shared_future<ccxt::any> getZKTransferSignatureObj (ccxt::any seed, ccxt::any params = ccxt::any {});

    // More TS base methods the C++ backend drops or cannot express. The simple ones
    // are real implementations; the ethers.js/keccak/starknet-crypto backed ones are
    // explicit unsupported stubs until the crypto milestone (keccak-256 + secp256k1
    // signing + EIP-712 + starknet pedersen), mirroring how C# stubs zklink.
    ccxt::any binaryConcat (ccxt::any a = ccxt::any {}, ccxt::any b = ccxt::any {},
                           ccxt::any c = ccxt::any {}, ccxt::any d = ccxt::any {},
                           ccxt::any e = ccxt::any {}, ccxt::any f = ccxt::any {},
                           ccxt::any g = ccxt::any {});
    ccxt::any intToBase16 (ccxt::any number);
    ccxt::any exceptionMessage (ccxt::any exc, ccxt::any includeStack = ccxt::any (true));
    ccxt::any fixStringifiedJsonMembers (ccxt::any content);
    ccxt::any randomBytes (ccxt::any size);
    ccxt::any uuid5 (ccxt::any name, ccxt::any nspace = ccxt::any {});
    ccxt::any convertToBigInt (ccxt::any value);
    ccxt::any ethAbiEncode (ccxt::any types, ccxt::any args);
    ccxt::any ethEncodeStructuredData (ccxt::any domain, ccxt::any messageTypes, ccxt::any messageData);
    ccxt::any ethGetAddressFromPrivateKey (ccxt::any privateKey);
    ccxt::any starknetEncodeStructuredData (ccxt::any domain = {}, ccxt::any messageTypes = {}, ccxt::any messageData = {}, ccxt::any address = {});
    ccxt::any starknetSign (ccxt::any message, ccxt::any privateKey);
    ccxt::any retrieveStarkAccount (ccxt::any signature = {}, ccxt::any accountClassHash = {}, ccxt::any accountProxyClassHash = {});

    // dydx protobuf signing family: C# stubs these in Exchange.cs ("Dydx currently
    // does not support create order / transfer asset in C# language"); the C++ port
    // mirrors that contract until the protobuf milestone.
    ccxt::any encodeDydxTxForSigning (ccxt::any message, ccxt::any memo, ccxt::any chainId,
                                     ccxt::any account, ccxt::any authenticators, ccxt::any fee);
    ccxt::any encodeDydxTxForSimulation (ccxt::any message, ccxt::any memo,
                                        ccxt::any sequence, ccxt::any publicKey);
    ccxt::any encodeDydxTxRaw (ccxt::any signDoc, ccxt::any signature);
    ccxt::any retrieveDydxCredentials (ccxt::any privateKey);
    std::shared_future<ccxt::any> loadDydxProtos ();
    ccxt::any toDydxLong (ccxt::any value);

    // starknet (extended) crypto — same stub contract as starknetSign above
    ccxt::any extendedStarknetSign (ccxt::any message, ccxt::any privateKey);
    ccxt::any extendedStarknetComputePoseidonHashOnElements (ccxt::any elements);
    ccxt::any extendedStarknetGetSelectorFromName (ccxt::any name);

    // parseDate is an imported free function (functions/time.ts) the transpiler drops
    ccxt::any parseDate (ccxt::any value);
    // packb = msgpack serialize (encode.ts imports static_dependencies/messagepack);
    // C# bundles MiniMessagePacker (Exchange.Encode.cs), C++ gets its own below
    ccxt::any packb (ccxt::any data);
    // urlencodeBase64 = base64url (base64 minus '=' padding, '+'->'-', '/'->'_'),
    // used by modetrade and friends for header payloads
    ccxt::any urlencodeBase64 (ccxt::any data);

    // lighter (Lighter.xyz) signing: C# implements these against the lighter native
    // library (Exchange.Lighter.cs); the C++ port stubs them until a lighter milestone
    #define LIGHTER_STUB(NAME) \
        ccxt::any NAME (ccxt::any a = ccxt::any{}, ccxt::any b = ccxt::any{}, ccxt::any c = ccxt::any{}, \
                       ccxt::any d = ccxt::any{}, ccxt::any e = ccxt::any{})
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
    std::shared_future<ccxt::any> loadLighterLibrary (ccxt::any path = ccxt::any{}, ccxt::any chainId = ccxt::any{},
                                                     ccxt::any privateKey = ccxt::any{}, ccxt::any apiKeyIndex = ccxt::any{},
                                                     ccxt::any accountIndex = ccxt::any{}, ccxt::any createClient = ccxt::any{});
    // callDynamically memoizes which names are NOT in any generated dispatch table:
    // the test framework calls base helpers (safeString, parseNumber, json, ...) via
    // the dynamic path per market, and without the cache each call linearly scans
    // the per-exchange table plus the ~500-branch base table and then throws to
    // reach the hand-written registry -- minutes of CPU per exchange's test run.
    std::unordered_set<std::string> tableMissCache;
    std::mutex tableMissCacheMutex;
    ccxt::any currencies;
    ccxt::any currencies_by_id;
    ccxt::any symbols;
    ccxt::any ids;
    ccxt::any codes;
    ccxt::any baseCurrencies;
    ccxt::any quoteCurrencies;
    ccxt::any accounts;
    ccxt::any accountsById;
    ccxt::any minFundingAddressLength;
    ccxt::any quoteJsonNumbers;
    ccxt::any substituteCommonCurrencyCodes;

    // -- caches ---------------------------------------------------------------------
    ccxt::any balance;
    ccxt::any orderbooks;
    ccxt::any tickers;
    ccxt::any bidsasks;
    // ws tier: whether watch methods resolve on EVERY update vs only NEW entries.
    // Seeded from options.newUpdates at construction (TS Exchange.ts:631), default true.
    ccxt::any newUpdates;
    ccxt::any orders;
    ccxt::any trades;
    ccxt::any myTrades;
    ccxt::any positions;
    ccxt::any liquidations;
    ccxt::any myLiquidations;
    ccxt::any ohlcvs;
    ccxt::any transactions;
    ccxt::any futures;
    ccxt::any clients;
    ccxt::any subscriptions;
    ccxt::any fetchHistoryCacheSize;

    // -- last request / response ----------------------------------------------------
    ccxt::any last_http_response;
    ccxt::any last_request_headers;
    ccxt::any last_response_headers;

    // -- proxies --------------------------------------------------------------------
    Callback proxy;
    ccxt::any proxyUrl;
    ccxt::any proxy_url;
    Callback proxyUrlCallback;
    Callback proxy_url_callback;
    ccxt::any httpProxy;
    ccxt::any http_proxy;
    Callback httpProxyCallback;
    Callback http_proxy_callback;
    ccxt::any httpsProxy;
    ccxt::any https_proxy;
    Callback httpsProxyCallback;
    Callback https_proxy_callback;
    ccxt::any socksProxy;
    ccxt::any socks_proxy;
    Callback socksProxyCallback;
    Callback socks_proxy_callback;
    ccxt::any wsProxy;
    ccxt::any ws_proxy;
    ccxt::any wssProxy;
    ccxt::any wss_proxy;
    ccxt::any wsSocksProxy;
    ccxt::any ws_socks_proxy;

    // -- safe accessors -------------------------------------------------------------
    virtual ccxt::any safeString (ccxt::any obj, ccxt::any key, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeString2 (ccxt::any obj, ccxt::any k1, ccxt::any k2, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeStringN (ccxt::any obj, ccxt::any keys, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeStringUpper (ccxt::any obj, ccxt::any key, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeStringLower (ccxt::any obj, ccxt::any key, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeInteger (ccxt::any obj, ccxt::any key, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeInteger2 (ccxt::any obj, ccxt::any k1, ccxt::any k2, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeIntegerN (ccxt::any obj, ccxt::any keys, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeFloat (ccxt::any obj, ccxt::any key, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeFloat2 (ccxt::any obj, ccxt::any k1, ccxt::any k2, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeFloatN (ccxt::any obj, ccxt::any keys, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeValue (ccxt::any obj, ccxt::any key, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeValue2 (ccxt::any obj, ccxt::any k1, ccxt::any k2, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeValueN (ccxt::any obj, ccxt::any keys, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeBool (ccxt::any obj, ccxt::any key, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeTimestamp (ccxt::any obj, ccxt::any key, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeTimestamp2 (ccxt::any obj, ccxt::any k1, ccxt::any k2, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeTimestampN (ccxt::any obj, ccxt::any keys, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeStringUpper2 (ccxt::any obj, ccxt::any k1, ccxt::any k2, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeStringUpperN (ccxt::any obj, ccxt::any keys, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeStringLower2 (ccxt::any obj, ccxt::any k1, ccxt::any k2, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeStringLowerN (ccxt::any obj, ccxt::any keys, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeIntegerProduct (ccxt::any obj, ccxt::any key, ccxt::any factor, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeIntegerProduct2 (ccxt::any obj, ccxt::any k1, ccxt::any k2, ccxt::any factor, ccxt::any def = ccxt::any {});
    virtual ccxt::any safeIntegerProductN (ccxt::any obj, ccxt::any keys, ccxt::any factor, ccxt::any def = ccxt::any {});

    // -- generic collection helpers -------------------------------------------------
    virtual ccxt::any extend (ccxt::any a, ccxt::any b = ccxt::any {});
    virtual ccxt::any deepExtend (ccxt::any a, ccxt::any b = ccxt::any {},
                                 ccxt::any c = ccxt::any {}, ccxt::any d = ccxt::any {});
    virtual ccxt::any clone (ccxt::any value);
    virtual ccxt::any sortBy (ccxt::any array, ccxt::any key,
                             ccxt::any descending = ccxt::any {}, ccxt::any def = ccxt::any {});
    virtual ccxt::any sortBy2 (ccxt::any array, ccxt::any k1, ccxt::any k2,
                              ccxt::any descending = ccxt::any {});
    virtual ccxt::any groupBy (ccxt::any array, ccxt::any key);
    virtual ccxt::any indexBy (ccxt::any array, ccxt::any key);
    virtual ccxt::any indexBySafe (ccxt::any array, ccxt::any key);
    virtual ccxt::any filterBy (ccxt::any array, ccxt::any key, ccxt::any value);
    virtual ccxt::any inArray (ccxt::any needle, ccxt::any haystack);
    virtual ccxt::any keysort (ccxt::any obj);
    virtual ccxt::any omit (ccxt::any obj, ccxt::any keys, ccxt::any k2 = ccxt::any {},
                           ccxt::any k3 = ccxt::any {}, ccxt::any k4 = ccxt::any {},
                           ccxt::any k5 = ccxt::any {}, ccxt::any k6 = ccxt::any {},
                           ccxt::any k7 = ccxt::any {});
    virtual ccxt::any omitZero (ccxt::any value);
    virtual ccxt::any toArray (ccxt::any value);
    virtual ccxt::any unique (ccxt::any array);
    virtual ccxt::any sum (ccxt::any a = ccxt::any {}, ccxt::any b = ccxt::any {},
                          ccxt::any c = ccxt::any {}, ccxt::any d = ccxt::any {});
    virtual ccxt::any isDictionary (ccxt::any value);
    virtual ccxt::any arrayConcat (ccxt::any a, ccxt::any b);
    virtual ccxt::any arraySlice (ccxt::any array, ccxt::any start, ccxt::any end = ccxt::any {});
    virtual ccxt::any valueIsDefined (ccxt::any value);
    virtual ccxt::any isEmpty (ccxt::any value);
    virtual ccxt::any sort (ccxt::any array);

    // -- string helpers -------------------------------------------------------------
    virtual ccxt::any capitalize (ccxt::any s);
    virtual ccxt::any implodeParams (ccxt::any target, ccxt::any params);
    virtual ccxt::any extractParams (ccxt::any target);
    virtual ccxt::any encodeURIComponent (ccxt::any value);
    virtual ccxt::any stringToCharsArray (ccxt::any value);
    virtual ccxt::any stringToBase64 (ccxt::any value);
    virtual ccxt::any base64ToBinary (ccxt::any value);
    virtual ccxt::any binaryToBase16 (ccxt::any value);
    virtual ccxt::any base16ToBinary (ccxt::any value);
    virtual ccxt::any binaryToBase64 (ccxt::any value);
    virtual ccxt::any base58ToBinary (ccxt::any value);
    virtual ccxt::any binaryToBase58 (ccxt::any value);
    virtual ccxt::any binaryLength (ccxt::any value);
    virtual ccxt::any isBinaryMessage (ccxt::any value);
    // TS encode()/decode() are utf8 decode/encode -- string <-> raw octets
    virtual ccxt::any encode (ccxt::any value);
    virtual ccxt::any decode (ccxt::any value);

    // -- crypto -----------------------------------------------------------------------
    virtual ccxt::any hash (ccxt::any payload, ccxt::any algorithm = ccxt::any {},
                           ccxt::any digest = ccxt::any {});
    virtual ccxt::any hmac (ccxt::any payload, ccxt::any key, ccxt::any algorithm = ccxt::any {},
                           ccxt::any digest = ccxt::any {});
    virtual ccxt::any crc32 (ccxt::any value, ccxt::any signed32 = ccxt::any {});
    // Asymmetric signing is not wired yet: binance only needs these for RSA/ed25519 API
    // keys, while the hmac path -- what every static request fixture exercises -- is
    // real. They throw rather than returning a plausible-looking wrong signature.
    virtual ccxt::any rsa (ccxt::any request, ccxt::any secretKey, ccxt::any algorithm = ccxt::any {}, ccxt::any padding = ccxt::any {});
    virtual ccxt::any eddsa (ccxt::any request, ccxt::any secretKey, ccxt::any algorithm = ccxt::any {});
    virtual ccxt::any jwt (ccxt::any data, ccxt::any secretKey, ccxt::any algorithm = ccxt::any {},
                          ccxt::any isRsa = ccxt::any {}, ccxt::any opts = ccxt::any {});
    virtual ccxt::any strip (ccxt::any value);
    virtual ccxt::any uuid ();
    virtual ccxt::any uuid16 ();
    virtual ccxt::any uuid22 ();

    // -- numbers --------------------------------------------------------------------
    virtual ccxt::any parseNumber (ccxt::any value, ccxt::any def = ccxt::any {});
    virtual ccxt::any numberToString (ccxt::any value);
    virtual ccxt::any decimalToPrecision (ccxt::any x, ccxt::any roundingMode, ccxt::any digits,
                                         ccxt::any countingMode = ccxt::any {},
                                         ccxt::any padding = ccxt::any {});
    virtual ccxt::any precisionFromString (ccxt::any value);
    ccxt::any MAX_VALUE = ccxt::any (1.7976931348623157e308);

    // -- json and query-string encoding ----------------------------------------------
    virtual ccxt::any parseJson (ccxt::any value);
    virtual ccxt::any json (ccxt::any value, ccxt::any params = ccxt::any {});
    virtual ccxt::any isJsonEncodedObject (ccxt::any value);
    // The four qs.stringify() configurations ccxt uses. They differ only in what gets
    // percent-encoded and how arrays are keyed; see qsStringify in ExchangeBase.cpp.
    virtual ccxt::any urlencode (ccxt::any params, ccxt::any sortKeys = ccxt::any {});
    virtual ccxt::any urlencodeNested (ccxt::any params);
    virtual ccxt::any urlencodeWithArrayRepeat (ccxt::any params);
    virtual ccxt::any rawencode (ccxt::any params, ccxt::any sortKeys = ccxt::any {});
protected:
    // the one traversal all four encoders share
    std::string queryString (const ccxt::any& params, bool encodeKeys, bool encodeValues,
                             bool arrayRepeat, const ccxt::any& sortKeys);
public:

    // -- time -----------------------------------------------------------------------
    virtual ccxt::any milliseconds ();
    virtual ccxt::any microseconds ();
    virtual ccxt::any seconds ();
    virtual ccxt::any iso8601 (ccxt::any timestamp);
    virtual ccxt::any parseTimeframe (ccxt::any timeframe);
    virtual ccxt::any parse8601 (ccxt::any datetime);
    virtual ccxt::any yymmdd (ccxt::any timestamp, ccxt::any infix = ccxt::any {});
    virtual ccxt::any yyyymmdd (ccxt::any timestamp, ccxt::any infix = ccxt::any {});
    virtual ccxt::any ymd (ccxt::any timestamp, ccxt::any infix = ccxt::any {});
    virtual ccxt::any ymdhms (ccxt::any timestamp, ccxt::any infix = ccxt::any {});
    virtual ccxt::any roundTimeframe (ccxt::any timeframe, ccxt::any timestamp,
                                     ccxt::any direction = ccxt::any {});
    virtual std::shared_future<ccxt::any> sleep (ccxt::any ms);

    // -- logging --------------------------------------------------------------------
    virtual ccxt::any log (ccxt::any value);
    virtual ccxt::any aggregate (ccxt::any bidasks);
    // WS OrderBook factories (ts/src/base/Exchange.ts orderBook/indexedOrderBook/
    // countedOrderBook) — return live ws::WsOrderBook handles
    virtual ccxt::any orderBook (ccxt::any snapshot = ccxt::any {}, ccxt::any depth = ccxt::any {});
    virtual ccxt::any indexedOrderBook (ccxt::any snapshot = ccxt::any {}, ccxt::any depth = ccxt::any {});
    virtual ccxt::any countedOrderBook (ccxt::any snapshot = ccxt::any {}, ccxt::any depth = ccxt::any {});
    virtual ccxt::any totp (ccxt::any key);

    // -- concurrency / cache plumbing -----------------------------------------------
    virtual ccxt::any createSafeDictionary (ccxt::any isWs = ccxt::any {});
    virtual ccxt::any mapToSafeMap (ccxt::any value);
    virtual ccxt::any initThrottler ();

    // -- dynamic access (test framework + transpiled property calls) ------------------
    // Transpiled code reads/writes members through these when the receiver is a
    // ccxt::any: getProperty/setProperty cover the flat field surface, callDynamically
    // routes method calls to the generated per-exchange callMethod table first and
    // falls back to the common helper registry.
    virtual ccxt::any getProperty (const std::string& name);
    virtual ccxt::any setProperty (const std::string& name, ccxt::any value);
    virtual ccxt::any callDynamically (const std::string& name, ccxt::any args);
    // implicit-API fallback for callDynamically: overridden by Exchange, which owns
    // the endpoint registry built from describe().api
    virtual bool hasEndpoint (const std::string&) { return false; }
    virtual std::shared_future<ccxt::any> callEndpoint (ccxt::any, ccxt::any = ccxt::any {}) {
        throw NotSupported ("callEndpoint requires the generated Exchange layer");
    }

    // -- HTTP plumbing ----------------------------------------------------------------
    // handleErrors is also declared on the generated Exchange class (a no-op default)
    // and overridden per exchange (binance.h); fetch() calls it through the vtable.
    virtual ccxt::any handleErrors (ccxt::any statusCode, ccxt::any statusText,
                                   ccxt::any url, ccxt::any method,
                                   ccxt::any responseHeaders, ccxt::any responseBody,
                                   ccxt::any response, ccxt::any requestHeaders,
                                   ccxt::any requestBody);
    virtual ccxt::any handleHttpStatusCode (ccxt::any code, ccxt::any reason,
                                           ccxt::any url, ccxt::any method,
                                           ccxt::any body);
    virtual ccxt::any onRestResponse (ccxt::any statusCode, ccxt::any statusText,
                                     ccxt::any url, ccxt::any method,
                                     ccxt::any responseHeaders, ccxt::any responseBody,
                                     ccxt::any requestHeaders, ccxt::any requestBody);

    // default request headers merged into every fetch (User-Agent etc.)
    ccxt::any headers;

    // -- generated-surface redeclarations --------------------------------------------
    // These methods are generated into the Exchange class (.inc). Redeclaring them
    // here (identical signatures) lets ExchangeBase code (callDynamically, fetch)
    // reach them through the vtable; the .inc definitions become overrides.
    virtual ccxt::any safeNumber (ccxt::any obj, ccxt::any key, ccxt::any defaultNumber = ccxt::any {});
    virtual ccxt::any safeDict (ccxt::any dictionaryOrList, ccxt::any key, ccxt::any defaultValue = ccxt::any {});
    virtual ccxt::any safeList (ccxt::any dictionaryOrList, ccxt::any key, ccxt::any defaultValue = ccxt::any {});
    virtual ccxt::any parseToInt (ccxt::any number);
    virtual ccxt::any parseToNumeric (ccxt::any number);
    virtual ccxt::any market (ccxt::any symbol);
    virtual ccxt::any marketId (ccxt::any symbol);
    virtual ccxt::any currency (ccxt::any code);
    virtual ccxt::any currencyId (ccxt::any code);
    virtual ccxt::any checkRequiredCredentials (ccxt::any error = true);
    virtual ccxt::any setMarkets (ccxt::any markets, ccxt::any currencies = ccxt::any {});
    virtual void setSandboxMode (ccxt::any enabled);
    virtual ccxt::any isEmptyString (ccxt::any value);

    // -- handwritten helpers the transpiled test framework calls ----------------------
    virtual ccxt::any extendExchangeOptions (ccxt::any newOptions);
    virtual ccxt::any convertToSafeDictionary (ccxt::any value);
    virtual ccxt::any getCcxtVersion ();
    virtual ccxt::any addFetchCache (ccxt::any entry, ccxt::any value = ccxt::any {});
    virtual ccxt::any setLastRequest (ccxt::any value);
    virtual ccxt::any setLastRestRequestTimestamp (ccxt::any value = ccxt::any {});
    virtual ccxt::any storeArray (ccxt::any target, ccxt::any value);
    virtual ccxt::any resolve (ccxt::any value, ccxt::any messageHash = ccxt::any {});
    virtual ccxt::any reject (ccxt::any value, ccxt::any messageHash = ccxt::any {});

    // -- ws plumbing (hand-written, mirrors ts/src/base/Exchange.ts above the
    //    transpile marker + the runtime below it) --------------------------------
    virtual ccxt::any client (ccxt::any url);
    virtual ccxt::any watch (ccxt::any url, ccxt::any messageHash, ccxt::any message = ccxt::any {},
                            ccxt::any subscribeHash = ccxt::any {}, ccxt::any subscription = ccxt::any {});
    virtual ccxt::any watchMultiple (ccxt::any url, ccxt::any messageHashes, ccxt::any message = ccxt::any {},
                                    ccxt::any subscribeHashes = ccxt::any {}, ccxt::any subscription = ccxt::any {});
    virtual std::shared_future<ccxt::any> spawn (ccxt::any methodName, ccxt::any args);
    virtual std::shared_future<ccxt::any> delay (ccxt::any timeout, ccxt::any methodName, ccxt::any args);
    virtual ccxt::any ping (ccxt::any client);
    // pro tier request-id serialisation (TS lockId/unlockId stubs above the
    // transpile marker; the ws harness races requestId() across threads) —
    // inline definitions live below with the dispatch helpers
    virtual ccxt::any lockId () {
        idLock.lock ();
        return ccxt::any {};
    }
    virtual ccxt::any unlockId () {
        idLock.unlock ();
        return ccxt::any {};
    }
    mutable std::mutex idLock;
    // transpiled pro code calls delay(timeout, methodName, ...rest) and
    // spawn(methodName, ...rest) with the rest arguments FLAT (JS rest-spread);
    // the variadic overloads pack them into the args list the dynamic dispatcher
    // expects
    template <class... Args>
    std::shared_future<ccxt::any> delay (ccxt::any timeout, ccxt::any methodName, Args&&... rest) {
        ccxt::list args;
        (args.push (ccxt::any (rest)), ...);
        return this->delay (timeout, methodName, ccxt::any (args));
    }
    template <class... Args>
    std::shared_future<ccxt::any> spawn (ccxt::any methodName, Args&&... rest) {
        ccxt::list args;
        (args.push (ccxt::any (rest)), ...);
        return this->spawn (methodName, ccxt::any (args));
    }
    // generated pro code stores a method NAME in a dict value and later calls it
    // as method.call(this, ...); route the name through the dispatch table
    ccxt::any dispatchMethodName (ccxt::any methodName, ccxt::any args) {
        return this->callDynamically (str (methodName), args);
    }
    // ws base emulations declared in TS Exchange.ts ABOVE the transpile marker, so
    // the pro overrides (bitvavo fetchMarketsWs etc) need base declarations here.
    // The bodies mirror the TS ones: resolve the current state immediately.
    virtual std::shared_future<ccxt::any> fetchMarketsWs (ccxt::any params = ccxt::any {});
    virtual std::shared_future<ccxt::any> fetchCurrenciesWs (ccxt::any params = ccxt::any {});
    virtual std::shared_future<ccxt::any> fetchBalanceWs (ccxt::any params = ccxt::any {});
    virtual std::shared_future<ccxt::any> fetchTradingFeesWs (ccxt::any params = ccxt::any {});
    virtual void handleMessage (ccxt::any client, ccxt::any message);
    virtual void onConnected (ccxt::any client, ccxt::any message = ccxt::any {});
    virtual void onError (ccxt::any client, ccxt::any error);
    virtual void onClose (ccxt::any client, ccxt::any error);
    virtual std::shared_future<ccxt::any> close (ccxt::any cleanInstanceCache = ccxt::any {});
    virtual std::shared_future<ccxt::any> throttle (ccxt::any cost = ccxt::any {});

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
    std::function<ccxt::any (ccxt::any url, ccxt::any method, ccxt::any headers, ccxt::any body)> fetchImpl;

    virtual std::shared_future<ccxt::any> fetch (ccxt::any url, ccxt::any method = ccxt::any {},
                                                ccxt::any headers = ccxt::any {},
                                                ccxt::any body = ccxt::any {});
    // Declared here so a derived exchange's generated `fetchMarkets(...) override`
    // actually has something to override -- describe().has lists them, but the base
    // methods themselves sit above the transpile delimiter.
    virtual std::shared_future<ccxt::any> fetchMarkets (ccxt::any params = ccxt::any {});
    virtual std::shared_future<ccxt::any> fetchCurrencies (ccxt::any params = ccxt::any {});
    virtual std::shared_future<ccxt::any> loadMarkets (ccxt::any reload = ccxt::any {},
                                                      ccxt::any params = ccxt::any {});

    // -- dynamic dispatch (D3) ------------------------------------------------------
    //
    // `this[method](...)` has no C++ equivalent, so cppTranspiler.ts rewrites those
    // call sites to these. Only the names the transpiled sources actually dispatch on
    // need to resolve; anything else is an explicit NotSupported rather than a silent
    // no-op.
    virtual ccxt::any getProperty (ExchangeBase* self, ccxt::any name);
    virtual void setProperty (ExchangeBase* self, ccxt::any name, ccxt::any value);
    virtual ccxt::any callDynamically (ExchangeBase* self, ccxt::any name, ccxt::any args);

    // Call a unified method by name with a positional argument list. Each generated
    // exchange overrides this with a table built from its own signatures (see
    // createDispatchTable in build/cppTranspiler.ts); the base has no methods to offer.
    // A name absent from every table surfaces as DispatchMiss (see ExchangeBase.cpp),
    // which is the ONLY signal callDynamically's negative cache records.
    virtual ccxt::any callMethod (ccxt::any name, ccxt::any args);
};

} // namespace ccxt
