// ----------------------------------------------------------------------------

import * as functions from './functions.js';
import {
    keys as keysFunc,
    values as valuesFunc,
    // inArray as inArrayFunc,
    vwap as vwapFunc,
} from './functions.js';
// import exceptions from "./errors.js"
import { // eslint-disable-line object-curly-newline
    ExchangeError,
    BadSymbol,
    NullResponse,
    InvalidAddress,
    InvalidOrder,
    NotSupported,
    OperationFailed,
    BadResponse,
    AuthenticationError,
    DDoSProtection,
    RequestTimeout,
    NetworkError,
    InvalidProxySettings,
    ExchangeNotAvailable,
    ArgumentsRequired,
    RateLimitExceeded,
    BadRequest,
    UnsubscribeError,
    ExchangeClosedByUser,
} from './errors.js';
import { Precise } from './Precise.js';
//-----------------------------------------------------------------------------
import WsClient from './ws/WsClient.js';
import type Client from './ws/Client.js';
import { Future } from './ws/Future.js';
import { OrderBook as WsOrderBook, IndexedOrderBook, CountedOrderBook, OrderBook as Ob } from './ws/OrderBook.js';
// ----------------------------------------------------------------------------
//
import { axolotl } from './functions/crypto.js';
// import types
import type { Market, Trade, Ticker, OHLCV, OHLCVC, Order, OrderBook, Balance, Balances, Dictionary, Transaction, Currency, MinMax, IndexType, Int, OrderType, OrderSide, Position, FundingRate, DepositWithdrawFee, LedgerEntry, BorrowInterest, OpenInterest, LeverageTier, TransferEntry, FundingRateHistory, Liquidation, FundingHistory, OrderRequest, MarginMode, Tickers, Greeks, Option, OptionChain, Str, Num, MarketInterface, CurrencyInterface, BalanceAccount, MarginModes, MarketType, Leverage, Leverages, LastPrice, LastPrices, Account, Strings, MarginModification, TradingFeeInterface, Currencies, TradingFees, Conversion, CancellationRequest, IsolatedBorrowRate, IsolatedBorrowRates, CrossBorrowRates, CrossBorrowRate, Dict, FundingRates, LeverageTiers, Bool, int, DepositAddress, LongShortRatio, OrderBooks, OpenInterests, ConstructorArgs } from './types.js';
// ----------------------------------------------------------------------------
// move this elsewhere.
import { ArrayCache, ArrayCacheByTimestamp } from './ws/Cache.js';
import { totp } from './functions/totp.js';
import ethers from '../static_dependencies/ethers/index.js';
import { TypedDataEncoder } from '../static_dependencies/ethers/hash/index.js';
import { secp256k1 } from '../static_dependencies/noble-curves/secp256k1.js';
import { keccak_256 } from '../static_dependencies/noble-hashes/sha3.js';
import { SecureRandom } from '../static_dependencies/jsencrypt/lib/jsbn/rng.js';
import { getStarkKey, ethSigToPrivate, sign as starknetCurveSign } from '../static_dependencies/scure-starknet/index.js';
import init, * as zklink from '../static_dependencies/zklink/zklink-sdk-web.js';
import * as Starknet from '../static_dependencies/starknet/index.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { sha1 } from '../static_dependencies/noble-hashes/sha1.js';
import { exportMnemonicAndPrivateKey, deriveHDKeyFromMnemonic } from '../static_dependencies/dydx-v4-client/onboarding.js';
import { Long } from '../static_dependencies/dydx-v4-client/helpers.js';

const {
    isNode,
    selfIsDefined,
    deepExtend,
    extend,
    clone,
    flatten,
    unique,
    indexBy,
    sortBy,
    sortBy2,
    safeFloat2,
    groupBy,
    aggregate,
    uuid,
    unCamelCase,
    precisionFromString,
    Throttler,
    capitalize,
    now,
    decimalToPrecision,
    safeValue,
    safeValue2,
    safeString,
    safeString2,
    seconds,
    milliseconds,
    binaryToBase16,
    numberToBE,
    base16ToBinary,
    iso8601,
    omit,
    isJsonEncodedObject,
    safeInteger,
    sum,
    omitZero,
    implodeParams,
    extractParams,
    json,
    merge,
    binaryConcat,
    hash,
    // ecdsa,
    arrayConcat,
    encode,
    urlencode,
    hmac,
    numberToString,
    roundTimeframe,
    parseTimeframe,
    safeInteger2,
    safeStringLower,
    parse8601,
    yyyymmdd,
    safeStringUpper,
    safeTimestamp,
    binaryConcatArray,
    uuidv1,
    numberToLE,
    ymdhms,
    stringToBase64,
    decode,
    uuid22,
    safeIntegerProduct2,
    safeIntegerProduct,
    safeStringLower2,
    yymmdd,
    base58ToBinary,
    binaryToBase58,
    safeTimestamp2,
    rawencode,
    keysort,
    sort,
    inArray,
    isEmpty,
    ordered,
    filterBy,
    uuid16,
    safeFloat,
    base64ToBinary,
    safeStringUpper2,
    urlencodeWithArrayRepeat,
    microseconds,
    binaryToBase64,
    strip,
    toArray,
    safeFloatN,
    safeIntegerN,
    safeIntegerProductN,
    safeTimestampN,
    safeValueN,
    safeStringN,
    safeStringLowerN,
    safeStringUpperN,
    urlencodeNested,
    urlencodeBase64,
    parseDate,
    ymd,
    base64ToString,
    crc32,
    packb,
    TRUNCATE,
    ROUND,
    DECIMAL_PLACES,
    NO_PADDING,
    TICK_SIZE,
    SIGNIFICANT_DIGITS,
    sleep,
} = functions;

// export {Market, Trade, Fee, Ticker, OHLCV, OHLCVC, Order, OrderBook, Balance, Balances, Dictionary, Transaction, Currency, MinMax, IndexType, Int, OrderType, OrderSide, Position, FundingRateHistory, Liquidation, FundingHistory} from './types.js'
// import { Market, Trade, Fee, Ticker, OHLCV, OHLCVC, Order, OrderBook, Balance, Balances, Dictionary, Transaction, Currency, MinMax, IndexType, Int, OrderType, OrderSide, Position, FundingRateHistory, OpenInterest, Liquidation, OrderRequest, FundingHistory, MarginMode, Tickers, Greeks, Str, Num, MarketInterface, CurrencyInterface, Account } from './types.js';
export type { Market, Trade, Fee, Ticker, OHLCV, OHLCVC, Order, OrderBook, Balance, Balances, Dictionary, Transaction, Currency, MinMax, IndexType, Int, Bool, OrderType, OrderSide, Position, LedgerEntry, BorrowInterest, OpenInterest, LeverageTier, TransferEntry, CrossBorrowRate, FundingRateHistory, Liquidation, FundingHistory, OrderRequest, MarginMode, Tickers, Greeks, Option, OptionChain, Str, Num, MarketInterface, CurrencyInterface, BalanceAccount, MarginModes, MarketType, Leverage, Leverages, LastPrice, LastPrices, Account, Strings, Conversion, DepositAddress, LongShortRatio } from './types.js';
// ----------------------------------------------------------------------------
let protobufMexc = undefined;
let encodeAsAny = undefined;
let AuthInfo = undefined;
let Tx = undefined;
let TxBody = undefined;
let TxRaw = undefined;
let SignDoc = undefined;
let SignMode = undefined;
(async () => {
    try {
        protobufMexc = await import ('../protobuf/mexc/compiled.cjs');
    } catch (e) {
        // TODO: handle error
    }
}) ();

// -----------------------------------------------------------------------------
/**
 * @class Exchange
 */
export default class Exchange {
    options: Dict;

    isSandboxModeEnabled: boolean = false;

    api: Dictionary<any> = undefined;
    certified: boolean = false;
    pro: boolean = false;
    countries: Str[] = undefined;

    // PROXY & USER-AGENTS (see "examples/proxy-usage" file for explanation)
    proxy: any;  // maintained for backwards compatibility, no-one should use it from now on
    proxyUrl: string;
    proxy_url: string;
    proxyUrlCallback: any;
    proxy_url_callback: any;
    httpProxy: string;
    http_proxy: string;
    httpProxyCallback: any;
    http_proxy_callback: any;
    httpsProxy: string;
    https_proxy: string;
    httpsProxyCallback: any;
    https_proxy_callback: any;
    socksProxy: string;
    socks_proxy: string;
    socksProxyCallback: any;
    socks_proxy_callback: any;
    userAgent: { 'User-Agent': string } | false = undefined;
    user_agent: { 'User-Agent': string } | false = undefined;
    wsProxy: string;
    ws_proxy: string;
    wssProxy: string;
    wss_proxy: string;
    wsSocksProxy: string;
    ws_socks_proxy: string;
    //
    userAgents: Dictionary<string> = {
        'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
        'chrome39': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
        'chrome100': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36',
    };

    headers: Dictionary<string> = {};
    returnResponseHeaders: boolean = false;
    origin: string = '*';  // CORS origin
    MAX_VALUE: number = Number.MAX_VALUE;
    //
    agent: any = undefined;  // maintained for backwards compatibility
    nodeHttpModuleLoaded: boolean = false;
    httpAgent: any = undefined;
    httpsAgent: any = undefined;

    minFundingAddressLength: Int = 1;  // used in checkAddress
    substituteCommonCurrencyCodes: boolean = true;  // reserved
    quoteJsonNumbers: boolean = true;  // treat numbers in json as quoted precise strings
    // eslint-disable-next-line no-unused-vars
    number: (numberString: string) => number = Number;  // or String (a pointer to a function)
    handleContentTypeApplicationZip: boolean = false;

    // whether fees should be summed by currency code
    reduceFees: boolean = true;

    // do not delete this line, it is needed for users to be able to define their own fetchImplementation
    fetchImplementation: any;
    AbortError: any;
    FetchError: any;

    validateServerSsl: boolean = true;
    validateClientSsl: boolean = false;

    timeout: Int = 10000;  // milliseconds
    verbose: boolean = false;
    twofa: string = undefined;  // two-factor authentication (2-FA)

    apiKey: string;
    secret: string;
    uid: string;
    accountId: string;
    login: string;
    password: string;
    privateKey: string;  // a "0x"-prefixed hexstring private key for a wallet
    walletAddress: string;  // a wallet address "0x"-prefixed hexstring
    token: string;  // reserved for HTTP auth in some cases

    balance: any = {};
    liquidations: Dictionary<Liquidation> = {};
    orderbooks: Dictionary<Ob> = {};
    tickers: Dictionary<Ticker> = {};
    fundingRates: Dictionary<FundingRate> = {};
    bidsasks: Dictionary<Ticker> = {};
    orders: ArrayCache = undefined;
    triggerOrders: ArrayCache = undefined;
    trades: Dictionary<ArrayCache>;
    transactions: Dictionary<Transaction> = {};
    ohlcvs: Dictionary<Dictionary<ArrayCacheByTimestamp>>;
    myLiquidations: Dictionary<Liquidation> = {};
    myTrades: ArrayCache;
    positions: any;
    urls: {
        logo?: string;
        api?: string | Dictionary<string>;
        test?: string | Dictionary<string>;
        www?: string;
        doc?: string[];
        api_management?: string;
        fees?: string;
        referral?: string;
    };

    requiresWeb3: boolean = false;
    requiresEddsa: boolean = false;
    precision: {
        amount: Num,
        price: Num,
        cost?: Num,
        base?: Num,
        quote?: Num,
    } = undefined;

    enableLastJsonResponse: boolean = false;
    enableLastHttpResponse: boolean = true;
    enableLastResponseHeaders: boolean = true;
    last_http_response: string = undefined;
    last_json_response: any = undefined;
    last_response_headers: Dictionary<string> = undefined;
    last_request_headers: Dictionary<string> = undefined;
    last_request_body: any = undefined;
    last_request_url: string = undefined;
    last_request_path: string = undefined;

    id: string = 'Exchange';

    markets: Dictionary<any> = undefined;
    has: Dictionary<boolean | 'emulated' | undefined>;
    features: Dictionary<Dictionary<any>> = undefined;
    status: {
        status: Str,
        updated: Num,
        eta: Num,
        url: Str,
        info: any,
    } = undefined;

    requiredCredentials: {
        apiKey: Bool,
        secret: Bool,
        uid: Bool,
        login: Bool,
        password: Bool,
        twofa: Bool,  // 2-factor authentication (one-time password key)
        privateKey: Bool,  // a "0x"-prefixed hexstring private key for a wallet
        walletAddress: Bool,  // the wallet address "0x"-prefixed hexstring
        token: Bool,  // reserved for HTTP auth in some cases
    };

    rateLimit: Num = undefined; // milliseconds
    tokenBucket: Dictionary<number> = undefined;
    throttler: any = undefined;
    enableRateLimit: boolean = undefined;
    rollingWindowSize: number = 0.0;  // set to 0.0 to use leaky bucket rate limiter
    rateLimiterAlgorithm: string = 'leakyBucket';

    httpExceptions: Dictionary<any> = undefined;

    limits: {
        amount?: MinMax,
        cost?: MinMax,
        leverage?: MinMax,
        price?: MinMax,
    } = undefined;

    fees: {
        trading: {
            tierBased: Bool,
            percentage: Bool,
            taker: Num,
            maker: Num,
        },
        funding: {
            tierBased: Bool,
            percentage: Bool,
            withdraw: {},
            deposit: {},
        },
    };

    markets_by_id: Dictionary<any> = undefined;
    symbols: Strings = undefined;
    ids: Strings = undefined;
    currencies: Currencies = {};

    baseCurrencies: Dictionary<CurrencyInterface> = undefined;
    quoteCurrencies: Dictionary<CurrencyInterface> = undefined;
    currencies_by_id: Dictionary<CurrencyInterface> = undefined;
    codes: Strings = undefined;

    reloadingMarkets: Bool = undefined;
    marketsLoading: Promise<Dictionary<Market>> = undefined;

    accounts: Account[] = undefined;
    accountsById: Dictionary<Account> = undefined;

    commonCurrencies: Dictionary<string> = undefined;

    hostname: Str = undefined;

    precisionMode: Int = undefined;
    paddingMode: Int = undefined;

    exceptions: Dictionary<string> = {};
    timeframes: Dictionary<number | string> = {};

    version: Str = undefined;

    marketsByAltname: Dictionary<Market> = undefined;

    name: Str = undefined;

    lastRestRequestTimestamp: int;

    targetAccount: string = undefined;

    stablePairs: Dictionary<boolean> = {};

    httpProxyAgentModule: any = undefined;
    httpsProxyAgentModule: any = undefined;
    socksProxyAgentModule: any = undefined;
    socksProxyAgentModuleChecked: boolean = false;
    proxyDictionaries: Dictionary<any> = {};
    proxiesModulesLoading: Promise<any> = undefined;
    alias: boolean = false;

    // WS/PRO options
    clients: Dictionary<WsClient> = {};
    newUpdates: boolean = true;
    streaming: Dictionary<any> = {};

    // INTERNAL METHODS
    sleep = sleep;
    deepExtend = deepExtend;
    deepExtendSafe = deepExtend;
    isNode = isNode;
    keys = keysFunc;
    values = valuesFunc;
    extend = extend;
    clone = clone;
    flatten = flatten;
    unique = unique;
    indexBy = indexBy;
    indexBySafe = indexBy;
    roundTimeframe = roundTimeframe;
    sortBy = sortBy;
    sortBy2 = sortBy2;
    groupBy = groupBy;
    aggregate = aggregate;
    uuid = uuid;
    unCamelCase = unCamelCase;
    precisionFromString = precisionFromString;
    capitalize = capitalize;
    now = now;
    decimalToPrecision = decimalToPrecision;
    safeValue = safeValue;
    safeValue2 = safeValue2;
    safeString = safeString;
    safeString2 = safeString2;
    safeFloat = safeFloat;
    safeFloat2 = safeFloat2;
    seconds = seconds;
    milliseconds = milliseconds;
    binaryToBase16 = binaryToBase16;
    numberToBE = numberToBE;
    base16ToBinary = base16ToBinary;
    iso8601 = iso8601;
    omit = omit;
    isJsonEncodedObject = isJsonEncodedObject;
    safeInteger = safeInteger;
    sum = sum;
    omitZero = omitZero;
    implodeParams = implodeParams;
    extractParams = extractParams;
    json = json;
    vwap = vwapFunc;
    merge = merge;
    binaryConcat = binaryConcat;
    hash = hash;
    arrayConcat = arrayConcat;
    encode = encode;
    urlencode = urlencode;
    hmac = hmac;
    numberToString = numberToString;
    parseTimeframe = parseTimeframe;
    safeInteger2 = safeInteger2;
    safeStringLower = safeStringLower;
    parse8601 = parse8601;
    yyyymmdd = yyyymmdd;
    safeStringUpper = safeStringUpper;
    safeTimestamp = safeTimestamp;
    binaryConcatArray = binaryConcatArray;
    uuidv1 = uuidv1;
    numberToLE = numberToLE;
    ymdhms = ymdhms;
    yymmdd = yymmdd;
    stringToBase64 = stringToBase64;
    decode = decode;
    uuid22 = uuid22;
    safeIntegerProduct2 = safeIntegerProduct2;
    safeIntegerProduct = safeIntegerProduct;
    binaryToBase58 = binaryToBase58;
    base58ToBinary = base58ToBinary;
    base64ToBinary = base64ToBinary;
    safeTimestamp2 = safeTimestamp2;
    rawencode = rawencode;
    keysort = keysort;
    sort = sort;
    inArray = inArray;
    safeStringLower2 = safeStringLower2;
    safeStringUpper2 = safeStringUpper2;
    isEmpty = isEmpty;
    ordered = ordered;
    filterBy = filterBy;
    uuid16 = uuid16;
    urlencodeWithArrayRepeat = urlencodeWithArrayRepeat;
    microseconds = microseconds;
    binaryToBase64 = binaryToBase64;
    strip = strip;
    toArray = toArray;
    safeFloatN = safeFloatN;
    safeIntegerN = safeIntegerN;
    safeIntegerProductN = safeIntegerProductN;
    safeTimestampN = safeTimestampN;
    safeValueN = safeValueN;
    safeStringN = safeStringN;
    safeStringLowerN = safeStringLowerN;
    safeStringUpperN = safeStringUpperN;
    urlencodeNested = urlencodeNested;
    parseDate = parseDate;
    ymd = ymd;
    base64ToString = base64ToString;
    crc32 = crc32;
    packb = packb;
    urlencodeBase64 = urlencodeBase64;

    constructor (userConfig: ConstructorArgs = {}) {
        Object.assign (this, functions);
        //
        //     if (isNode) {
        //         this.nodeVersion = process.version.match (/\d+\.\d+\.\d+/)[0]
        //         this.userAgent = {
        //             'User-Agent': 'ccxt/' + (Exchange as any).ccxtVersion +
        //                 ' (+https://github.com/ccxt/ccxt)' +
        //                 ' Node.js/' + this.nodeVersion + ' (JavaScript)'
        //         }
        //     }
        //
        this.options = this.getDefaultOptions (); // exchange-specific options if any
        // fetch implementation options (JS only)
        // http properties
        this.headers = {};
        this.origin = '*'; // CORS origin
        // underlying properties
        this.minFundingAddressLength = 1; // used in checkAddress
        this.substituteCommonCurrencyCodes = true;  // reserved
        this.quoteJsonNumbers = true; // treat numbers in json as quoted precise strings
        this.number = Number; // or String (a pointer to a function)
        this.handleContentTypeApplicationZip = false;
        // whether fees should be summed by currency code
        this.reduceFees = true;
        // do not delete this line, it is needed for users to be able to define their own fetchImplementation
        this.fetchImplementation = undefined;
        this.validateServerSsl = true;
        this.validateClientSsl = false;
        // default property values
        this.timeout = 10000; // milliseconds
        this.verbose = false;
        this.twofa = undefined; // two-factor authentication (2FA)
        // default credentials
        this.apiKey = undefined;
        this.secret = undefined;
        this.uid = undefined;
        this.login = undefined;
        this.password = undefined;
        this.privateKey = undefined; // a "0x"-prefixed hexstring private key for a wallet
        this.walletAddress = undefined; // a wallet address "0x"-prefixed hexstring
        this.token = undefined; // reserved for HTTP auth in some cases
        // placeholders for cached data
        this.balance = {};
        this.bidsasks = {};
        this.orderbooks = {};
        this.tickers = {};
        this.liquidations = {};
        this.orders = undefined;
        this.trades = {};
        this.transactions = {};
        this.ohlcvs = {};
        this.myLiquidations = {};
        this.myTrades = undefined;
        this.positions = undefined;
        // web3 and cryptography flags
        this.requiresWeb3 = false;
        this.requiresEddsa = false;
        // response handling flags and properties
        this.lastRestRequestTimestamp = 0;
        this.enableLastJsonResponse = false;
        this.enableLastHttpResponse = true;
        this.enableLastResponseHeaders = true;
        this.last_http_response = undefined;
        this.last_json_response = undefined;
        this.last_response_headers = undefined;
        this.last_request_headers = undefined;
        this.last_request_body = undefined;
        this.last_request_url = undefined;
        this.last_request_path = undefined;
        // camelCase and snake_notation support
        const unCamelCaseProperties = (obj = this) => {
            if (obj !== null) {
                const ownPropertyNames = Object.getOwnPropertyNames (obj);
                for (let i = 0; i < ownPropertyNames.length; i++) {
                    const k = ownPropertyNames[i];
                    this[unCamelCase (k)] = this[k];
                }
                unCamelCaseProperties (Object.getPrototypeOf (obj));
            }
        };
        unCamelCaseProperties ();
        // merge constructor overrides to this instance
        const configEntries = Object.entries (this.describe ()).concat (Object.entries (userConfig));
        for (let i = 0; i < configEntries.length; i++) {
            const [ property, value ] = configEntries[i];
            if (value && Object.getPrototypeOf (value) === Object.prototype) {
                this[property] = this.deepExtend (this[property], value);
            } else {
                this[property] = value;
            }
        }
        // http client options
        const agentOptions = {
            'keepAlive': true,
        };
        // ssl options
        if (!this.validateServerSsl) {
            agentOptions['rejectUnauthorized'] = false;
        }
        // generate old metainfo interface
        const hasKeys = Object.keys (this.has);
        for (let i = 0; i < hasKeys.length; i++) {
            const k = hasKeys[i];
            this['has' + this.capitalize (k)] = !!this.has[k]; // converts 'emulated' to true
        }
        // generate implicit api
        if (this.api) {
            this.defineRestApi (this.api, 'request');
        }
        this.newUpdates = ((this.options as any).newUpdates !== undefined) ? (this.options as any).newUpdates : true;
        this.afterConstruct ();
        if (this.safeBool (userConfig, 'sandbox') || this.safeBool (userConfig, 'testnet')) {
            this.setSandboxMode (true);
        }
    }

    uuid5 (namespace: string, name: string): string {
        const nsBytes = namespace
            .replace (/-/g, '')
            .match (/.{1,2}/g)
            .map ((byte) => parseInt (byte, 16));
        const nameBytes = new TextEncoder ().encode (name);
        const data = new Uint8Array ([ ...nsBytes, ...nameBytes ]);
        const nsHash = sha1 (data);
        // eslint-disable-next-line
        nsHash[6] = (nsHash[6] & 0x0f) | 0x50;
        // eslint-disable-next-line
        nsHash[8] = (nsHash[8] & 0x3f) | 0x80;
        const hex = [ ...nsHash.slice (0, 16) ]
            .map ((b) => b.toString (16).padStart (2, '0'))
            .join ('');
        return [
            hex.substring (0, 8),
            hex.substring (8, 12),
            hex.substring (12, 16),
            hex.substring (16, 20),
            hex.substring (20, 32),
        ].join ('-');
    }

    encodeURIComponent (...args) {
        // @ts-expect-error
        return encodeURIComponent (...args);
    }

    checkRequiredVersion (requiredVersion, error = true) {
        let result = true;
        const [ major1, minor1, patch1 ] = requiredVersion.split ('.');
        const [ major2, minor2, patch2 ] = (Exchange as any).ccxtVersion.split ('.');
        const intMajor1 = this.parseToInt (major1);
        const intMinor1 = this.parseToInt (minor1);
        const intPatch1 = this.parseToInt (patch1);
        const intMajor2 = this.parseToInt (major2);
        const intMinor2 = this.parseToInt (minor2);
        const intPatch2 = this.parseToInt (patch2);
        if (intMajor1 > intMajor2) {
            result = false;
        }
        if (intMajor1 === intMajor2) {
            if (intMinor1 > intMinor2) {
                result = false;
            } else if (intMinor1 === intMinor2 && intPatch1 > intPatch2) {
                result = false;
            }
        }
        if (!result) {
            if (error) {
                throw new NotSupported ('Your current version of CCXT is ' + (Exchange as any).ccxtVersion + ', a newer version ' + requiredVersion + ' is required, please, upgrade your version of CCXT');
            } else {
                return error;
            }
        }
        return result;
    }

    throttle (cost = undefined) {
        return this.throttler.throttle (cost);
    }

    initThrottler () {
        this.throttler = new Throttler (this.tokenBucket);
    }

    defineRestApiEndpoint (methodName, uppercaseMethod, lowercaseMethod, camelcaseMethod, path, paths, config = {}) {
        const splitPath = path.split (/[^a-zA-Z0-9]/);
        const camelcaseSuffix = splitPath.map (this.capitalize).join ('');
        const underscoreSuffix = splitPath.map ((x) => x.trim ().toLowerCase ()).filter ((x) => x.length > 0).join ('_');
        const camelcasePrefix = [ paths[0] ].concat (paths.slice (1).map (this.capitalize)).join ('');
        const underscorePrefix = [ paths[0] ].concat (paths.slice (1).map ((x) => x.trim ()).filter ((x) => x.length > 0)).join ('_');
        const camelcase = camelcasePrefix + camelcaseMethod + this.capitalize (camelcaseSuffix);
        const underscore = underscorePrefix + '_' + lowercaseMethod + '_' + underscoreSuffix;
        const typeArgument = (paths.length > 1) ? paths : paths[0];
        // handle call costs here
        const partial = async (params = {}, context = {}) => this[methodName] (path, typeArgument, uppercaseMethod, params, undefined, undefined, config, context);
        // const partial = async (params) => this[methodName] (path, typeArgument, uppercaseMethod, params || {})
        this[camelcase] = partial;
        this[underscore] = partial;
    }

    defineRestApi (api, methodName, paths = []) {
        const keys = Object.keys (api);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = api[key];
            const uppercaseMethod = key.toUpperCase ();
            const lowercaseMethod = key.toLowerCase ();
            const camelcaseMethod = this.capitalize (lowercaseMethod);
            if (Array.isArray (value)) {
                for (let k = 0; k < value.length; k++) {
                    const path = value[k].trim ();
                    this.defineRestApiEndpoint (methodName, uppercaseMethod, lowercaseMethod, camelcaseMethod, path, paths);
                }
            // the options HTTP method conflicts with the 'options' API url path
            // } else if (key.match (/^(?:get|post|put|delete|options|head|patch)$/i)) {
            } else if (key.match (/^(?:get|post|put|delete|head|patch)$/i)) {
                const endpoints = Object.keys (value);
                for (let j = 0; j < endpoints.length; j++) {
                    const endpoint = endpoints[j];
                    const path = endpoint.trim ();
                    const config = value[endpoint];
                    if (typeof config === 'object') {
                        this.defineRestApiEndpoint (methodName, uppercaseMethod, lowercaseMethod, camelcaseMethod, path, paths, config);
                    } else if (typeof config === 'number') {
                        this.defineRestApiEndpoint (methodName, uppercaseMethod, lowercaseMethod, camelcaseMethod, path, paths, { 'cost': config });
                    } else {
                        throw new NotSupported (this.id + ' defineRestApi() API format is not supported, API leafs must strings, objects or numbers');
                    }
                }
            } else {
                this.defineRestApi (value, methodName, paths.concat ([ key ]));
            }
        }
    }

    log (...args) {
        // eslint-disable-next-line no-console
        console.log (...args);
    }

    async loadProxyModules () {
        // when loading markets, multiple parallel calls are made, so need one promise
        if (this.proxiesModulesLoading === undefined) {
            this.proxiesModulesLoading = (async () => {
                // we have to handle it with below nested way, because of dynamic
                // import issues (https://github.com/ccxt/ccxt/pull/20687)
                try {
                    // todo: possible sync alternatives: https://stackoverflow.com/questions/51069002/convert-import-to-synchronous
                    this.httpProxyAgentModule = await import (/* webpackIgnore: true */ '../static_dependencies/proxies/http-proxy-agent/index.js');
                    this.httpsProxyAgentModule = await import (/* webpackIgnore: true */ '../static_dependencies/proxies/https-proxy-agent/index.js');
                } catch (e) {
                    // if several users are using those frameworks which cause exceptions,
                    // let them to be able to load modules still, by installing them
                    try {
                        // @ts-ignore
                        this.httpProxyAgentModule = await import (/* webpackIgnore: true */ 'http-proxy-agent');
                        // @ts-ignore
                        this.httpsProxyAgentModule = await import (/* webpackIgnore: true */ 'https-proxy-agent'); // eslint-disable-line
                    } catch (err) {
                        // TODO: handle error
                    }
                }
                if (this.socksProxyAgentModuleChecked === false) {
                    try {
                        // @ts-ignore
                        this.socksProxyAgentModule = await import (/* webpackIgnore: true */ 'socks-proxy-agent');
                    } catch (e) {
                        // TODO: handle error
                    }
                    this.socksProxyAgentModuleChecked = true;
                }
            }) ();
        }
        return await this.proxiesModulesLoading;
    }

    setProxyAgents (httpProxy, httpsProxy, socksProxy) {
        let chosenAgent = undefined;
        // in browser-side, proxy modules are not supported in 'fetch/ws' methods
        if (!isNode && (httpProxy || httpsProxy || socksProxy)) {
            throw new NotSupported (this.id + ' - proxies in browser-side projects are not supported. You have several choices: [A] Use `exchange.proxyUrl` property to redirect requests through local/remote cors-proxy server (find sample file named "sample-local-proxy-server-with-cors" in https://github.com/ccxt/ccxt/tree/master/examples/ folder, which can be used for REST requests only) [B] override `exchange.fetch` && `exchange.watch` methods to send requests through your custom proxy');
        }
        if (httpProxy) {
            if (this.httpProxyAgentModule === undefined) {
                throw new NotSupported (this.id + ' you need to load JS proxy modules with `await instance.loadProxyModules()` method at first to use proxies');
            }
            if (!(httpProxy in this.proxyDictionaries)) {
                this.proxyDictionaries[httpProxy] = new this.httpProxyAgentModule.HttpProxyAgent (httpProxy);
            }
            chosenAgent = this.proxyDictionaries[httpProxy];
        } else if (httpsProxy) {
            if (this.httpsProxyAgentModule === undefined) {
                throw new NotSupported (this.id + ' you need to load JS proxy modules with `await instance.loadProxyModules()` method at first to use proxies');
            }
            if (!(httpsProxy in this.proxyDictionaries)) {
                this.proxyDictionaries[httpsProxy] = new this.httpsProxyAgentModule.HttpsProxyAgent (httpsProxy);
            }
            chosenAgent = this.proxyDictionaries[httpsProxy];
            chosenAgent.keepAlive = true;
        } else if (socksProxy) {
            if (this.socksProxyAgentModule === undefined) {
                throw new NotSupported (this.id + ' - to use SOCKS proxy with ccxt, at first you need install module "npm i socks-proxy-agent" and then initialize proxies with `await instance.loadProxyModules()` method');
            }
            if (!(socksProxy in this.proxyDictionaries)) {
                this.proxyDictionaries[socksProxy] = new this.socksProxyAgentModule.SocksProxyAgent (socksProxy);
            }
            chosenAgent = this.proxyDictionaries[socksProxy];
        }
        return chosenAgent;
    }

    async loadHttpProxyAgent () {
        // for `http://` protocol proxy-urls, we need to load `http` module only on first call
        if (!this.httpAgent) {
            const httpModule = await import (/* webpackIgnore: true */'node:http');
            this.httpAgent = new httpModule.Agent ();
        }
        return this.httpAgent;
    }

    getHttpAgentIfNeeded (url) {
        if (isNode) {
            // only for non-ssl proxy
            if (url.substring (0, 5) === 'ws://') {
                if (this.httpAgent === undefined) {
                    throw new NotSupported (this.id + ' to use proxy with non-ssl ws:// urls, at first run  `await exchange.loadHttpProxyAgent()` method');
                }
                return this.httpAgent;
            }
        }
        return undefined;
    }

    isBinaryMessage (msg) {
        return msg instanceof Uint8Array || msg instanceof ArrayBuffer;
    }

    decodeProtoMsg (data) {
        if (!protobufMexc) {
            throw new NotSupported (this.id + ' requires protobuf to decode messages, please install it with `npm install protobufjs`');
        }
        if (data instanceof ArrayBuffer) {
            // browser case
            data = new Uint8Array (data);
        }
        if (data instanceof Uint8Array) {
            const decoded = (protobufMexc.default as any).PushDataV3ApiWrapper.decode (data);
            const dict = decoded.toJSON ();
            //  {
            //    "channel":"spot@public.kline.v3.api.pb@BTCUSDT@Min1",
            //    "symbol":"BTCUSDT",
            //    "symbolId":"2fb942154ef44a4ab2ef98c8afb6a4a7",
            //    "createTime":"1754737941062",
            //    "publicSpotKline":{
            //       "interval":"Min1",
            //       "windowStart":"1754737920",
            //       "openingPrice":"117317.31",
            //       "closingPrice":"117325.26",
            //       "highestPrice":"117341",
            //       "lowestPrice":"117317.3",
            //       "volume":"3.12599854",
            //       "amount":"366804.43",
            //       "windowEnd":"1754737980"
            //    }
            // }
            return dict;
        }
        return data;
    }

    async fetch (url, method = 'GET', headers: any = undefined, body: any = undefined) {
        // load node-http(s) modules only on first call
        if (isNode) {
            if (!this.nodeHttpModuleLoaded) {
                this.nodeHttpModuleLoaded = true;
                const httpsModule = await import (/* webpackIgnore: true */'node:https');
                this.httpsAgent = new httpsModule.Agent ({ 'keepAlive': true });
            }
        }
        // ##### PROXY & HEADERS #####
        headers = this.extend (this.headers, headers);
        // proxy-url
        const proxyUrl = this.checkProxyUrlSettings (url, method, headers, body);
        let httpProxyAgent = false;
        if (proxyUrl !== undefined) {
            // part only for node-js
            if (isNode) {
                // in node-js we need to set header to *
                headers = this.extend ({ 'Origin': this.origin }, headers);
                // only for http proxy
                if (proxyUrl.substring (0, 5) === 'http:') {
                    await this.loadHttpProxyAgent ();
                    httpProxyAgent = this.httpAgent;
                }
            }
            url = proxyUrl + this.urlEncoderForProxyUrl (url);
        }
        // proxy agents
        const [ httpProxy, httpsProxy, socksProxy ] = this.checkProxySettings (url, method, headers, body);
        this.checkConflictingProxies (httpProxy || httpsProxy || socksProxy, proxyUrl);
        // skip proxies on the browser
        if (isNode) {
            // this is needed in JS, independently whether proxy properties were set or not, we have to load them because of necessity in WS, which would happen beyond 'fetch' method (WS/etc)
            await this.loadProxyModules ();
        }
        const chosenAgent = this.setProxyAgents (httpProxy, httpsProxy, socksProxy);
        // user-agent
        const userAgent = (this.userAgent !== undefined) ? this.userAgent : this.user_agent;
        if (userAgent && isNode) {
            if (typeof userAgent === 'string') {
                headers = this.extend ({ 'User-Agent': userAgent }, headers);
            } else if ((typeof userAgent === 'object') && ('User-Agent' in userAgent)) {
                headers = this.extend (userAgent, headers);
            }
        }
        // set final headers
        headers = this.setHeaders (headers);
        // log
        if (this.verbose) {
            this.log ('fetch Request:\n', this.id, method, url, '\nRequestHeaders:\n', headers, '\nRequestBody:\n', body, '\n');
        }
        // end of proxies & headers
        if (this.fetchImplementation === undefined) {
            if (isNode) {
                if (this.agent === undefined) {
                    this.agent = this.httpsAgent;
                }
                try {
                    const nodeFetchModule = await import (/* webpackIgnore: true */'../static_dependencies/node-fetch/index.js');
                    this.AbortError = nodeFetchModule.AbortError;
                    this.fetchImplementation = nodeFetchModule.default;
                    this.FetchError = nodeFetchModule.FetchError;
                } catch (e) {
                    // some users having issues with dynamic imports (https://github.com/ccxt/ccxt/pull/20687)
                    // so let them to fallback to node's native fetch
                    if (typeof fetch === 'function') {
                        this.fetchImplementation = fetch; // eslint-disable-line
                        // as it's browser-compatible implementation ( https://nodejs.org/dist/latest-v20.x/docs/api/globals.html#fetch )
                        // it throws same error types
                        this.AbortError = DOMException;
                        this.FetchError = TypeError;
                    } else {
                        throw new Error ('Seems, "fetch" function is not available in your node-js version, please use latest node-js version');
                    }
                }
            } else {
                // eslint-disable-next-line
                this.fetchImplementation = (selfIsDefined ()) ? self.fetch : fetch;
                this.AbortError = DOMException;
                this.FetchError = TypeError;
            }
        }
        // fetchImplementation cannot be called on this. in browsers:
        // TypeError Failed to execute 'fetch' on 'Window': Illegal invocation
        const fetchImplementation = this.fetchImplementation;
        const params = { method, headers, body, 'timeout': this.timeout };
        if (this.agent) {
            params['agent'] = this.agent;
        }
        // override agent, if needed
        if (httpProxyAgent) {
            // if proxyUrl is being used, then specifically in nodejs, we need http module, not https
            params['agent'] = httpProxyAgent;
        } else if (chosenAgent) {
            // if http(s)Proxy is being used
            params['agent'] = chosenAgent;
        }
        const controller = new AbortController ();
        params['signal'] = controller.signal;
        const timeout = setTimeout (() => {
            controller.abort ();
        }, this.timeout);
        try {
            const response = await fetchImplementation (url, params);
            clearTimeout (timeout);
            return this.handleRestResponse (response, url, method, headers, body);
        } catch (e) {
            if (e instanceof this.AbortError) {
                throw new RequestTimeout (this.id + ' ' + method + ' ' + url + ' request timed out (' + this.timeout + ' ms)');
            } else if (e instanceof this.FetchError) {
                throw new NetworkError (this.id + ' ' + method + ' ' + url + ' fetch failed');
            }
            throw e;
        }
    }

    jsonStringifyWithNull (obj) {
        return JSON.stringify (obj, (_, v) => (v === undefined ? null : v));
    }

    parseJson (jsonString) {
        try {
            if (this.isJsonEncodedObject (jsonString)) {
                return JSON.parse (this.onJsonResponse (jsonString));
            }
        } catch (e) {
            // SyntaxError
            return undefined;
        }
    }

    getResponseHeaders (response) {
        const result = {};
        response.headers.forEach ((value, key) => {
            key = key.split ('-').map ((word) => this.capitalize (word)).join ('-');
            result[key] = value;
        });
        return result;
    }

    handleRestResponse (response, url, method = 'GET', requestHeaders = undefined, requestBody = undefined) {
        const responseHeaders = this.getResponseHeaders (response);
        if (this.handleContentTypeApplicationZip && (responseHeaders['Content-Type'] === 'application/zip')) {
            const responseBuffer = response.buffer ();
            if (this.enableLastResponseHeaders) {
                this.last_response_headers = responseHeaders;
            }
            if (this.enableLastHttpResponse) {
                this.last_http_response = responseBuffer;
            }
            if (this.verbose) {
                this.log ('handleRestResponse:\n', this.id, method, url, response.status, response.statusText, '\nResponseHeaders:\n', responseHeaders, 'ZIP redacted', '\n');
            }
            // no error handler needed, because it would not be a zip response in case of an error
            return responseBuffer;
        }
        return response.text ().then ((responseBody) => {
            const bodyText = this.onRestResponse (response.status, response.statusText, url, method, responseHeaders, responseBody, requestHeaders, requestBody);
            const parsedBody = this.parseJson (bodyText);
            if (this.enableLastResponseHeaders) {
                this.last_response_headers = responseHeaders;
            }
            if (this.enableLastHttpResponse) {
                this.last_http_response = responseBody;
            }
            if (this.enableLastJsonResponse) {
                this.last_json_response = parsedBody;
            }
            if (this.verbose) {
                this.log ('handleRestResponse:\n', this.id, method, url, response.status, response.statusText, '\nResponseHeaders:\n', responseHeaders, '\nResponseBody:\n', responseBody, '\n');
            }
            const skipFurtherErrorHandling = this.handleErrors (response.status, response.statusText, url, method, responseHeaders, responseBody, parsedBody, requestHeaders, requestBody);
            if (!skipFurtherErrorHandling) {
                this.handleHttpStatusCode (response.status, response.statusText, url, method, responseBody);
            }
            if (parsedBody && !Array.isArray (parsedBody) && this.returnResponseHeaders) {
                parsedBody['responseHeaders'] = responseHeaders;
            }
            return parsedBody || responseBody;
        });
    }

    onRestResponse (statusCode, statusText, url, method, responseHeaders, responseBody, requestHeaders, requestBody) {
        return responseBody.trim ();
    }

    onJsonResponse (responseBody) {
        return this.quoteJsonNumbers ? responseBody.replace (/":([+.0-9eE-]+)([,}])/g, '":"$1"$2') : responseBody;
    }

    async loadMarketsHelper (reload = false, params = {}) {
        if (!reload && this.markets) {
            if (!this.markets_by_id) {
                return this.setMarkets (this.markets);
            }
            return this.markets;
        }
        let currencies = undefined;
        // only call if exchange API provides endpoint (true), thus avoid emulated versions ('emulated')
        if (this.has['fetchCurrencies'] === true) {
            currencies = await this.fetchCurrencies ();
            this.options['cachedCurrencies'] = currencies;
        }
        const markets = await this.fetchMarkets (params);
        if ('cachedCurrencies' in this.options) {
            delete this.options['cachedCurrencies'];
        }
        return this.setMarkets (markets, currencies);
    }

    /**
     * @method
     * @name Exchange#loadMarkets
     * @description Loads and prepares the markets for trading.
     * @param {boolean} reload - If true, the markets will be reloaded from the exchange.
     * @param {object} params - Additional exchange-specific parameters for the request.
     * @returns A promise that resolves to a dictionary of markets.
     * @throws An error if the markets cannot be loaded or prepared.
     * @remarks This method is asynchronous and returns a promise.
     *          It ensures that the markets are only loaded once, even if the method is called multiple times.
     *          If the markets are already loaded and not reloading, the method returns the existing markets.
     *          If the markets are being reloaded, the method waits for the reload to complete before returning the markets.
     *          If an error occurs during the loading or preparation of the markets, the promise is rejected with the error.
     */
    async loadMarkets (reload: boolean = false, params: object = {}): Promise<Dictionary<Market>> {
        if ((reload && !this.reloadingMarkets) || !this.marketsLoading) {
            this.reloadingMarkets = true;
            this.marketsLoading = this.loadMarketsHelper (reload, params).then ((resolved) => {
                this.reloadingMarkets = false;
                return resolved;
            }, (error) => {
                this.reloadingMarkets = false;
                throw error;
            });
        }
        return this.marketsLoading;
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return new Promise ((resolve, reject) => {
            resolve (this.currencies);
        });
    }

    async fetchCurrenciesWs (params = {}): Promise<Currencies> {
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return new Promise ((resolve, reject) => {
            resolve (this.currencies);
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return new Promise ((resolve, reject) => {
            resolve (Object.values (this.markets));
        });
    }

    async fetchMarketsWs (params = {}): Promise<Market[]> {
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return new Promise ((resolve, reject) => {
            resolve (Object.values (this.markets));
        });
    }

    checkRequiredDependencies () {

    }

    parseNumber (value, d: Num = undefined): number {
        if (value === undefined) {
            return d;
        } else {
            try {
                // we should handle scientific notation here
                // so if the exchanges returns 1e-8
                // this function will return 0.00000001
                // check https://github.com/ccxt/ccxt/issues/24135
                const numberNormalized = this.numberToString (value);
                if (numberNormalized.indexOf ('e-') > -1) {
                    return this.number (numberToString (parseFloat (numberNormalized)));
                }
                const result = this.number (numberNormalized);
                return Number.isNaN (result) ? d : result;
            } catch (e) {
                return d;
            }
        }
    }

    checkOrderArguments (market, type, side, amount, price, params) {
        if (price === undefined) {
            if (type === 'limit') {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for a limit order');
            }
        }
        if (amount <= 0) {
            throw new ArgumentsRequired (this.id + ' createOrder() amount should be above 0');
        }
    }

    handleHttpStatusCode (code, reason, url, method, body) {
        const codeAsString = code.toString ();
        if (codeAsString in this.httpExceptions) {
            const ErrorClass = this.httpExceptions[codeAsString];
            throw new ErrorClass (this.id + ' ' + method + ' ' + url + ' ' + codeAsString + ' ' + reason + ' ' + body);
        }
    }

    remove0xPrefix (hexData) {
        if (hexData.slice (0, 2) === '0x') {
            return hexData.slice (2);
        } else {
            return hexData;
        }
    }

    mapToSafeMap (dict) {
        return dict; // wrapper for go
    }

    safeMapToMap (dict) {
        return dict; // wrapper for go
    }

    spawn (method, ...args) {
        const future = Future ();
        // using setTimeout 0 to force the execution to run after the future is returned
        setTimeout (() => {
            method.apply (this, args).then (future.resolve).catch (future.reject);
        }, 0);
        return future;
    }

    delay (timeout, method, ...args) {
        setTimeout (() => {
            this.spawn (method, ...args);
        }, timeout);
    }

    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------
    // WS/PRO methods

    orderBook (snapshot = {}, depth = Number.MAX_SAFE_INTEGER) {
        return new WsOrderBook (snapshot, depth);
    }

    indexedOrderBook (snapshot = {}, depth = Number.MAX_SAFE_INTEGER) {
        return new IndexedOrderBook (snapshot, depth);
    }

    countedOrderBook (snapshot = {}, depth = Number.MAX_SAFE_INTEGER) {
        return new CountedOrderBook (snapshot, depth);
    }

    handleMessage (client, message) {} // stub to override

    // ping (client: Client) {} // stub to override

    ping (client: Client) {
        return undefined;
    }

    client (url: string): WsClient {
        this.clients = this.clients || {};
        if (!this.clients[url]) {
            const onMessage = this.handleMessage.bind (this);
            const onError = this.onError.bind (this);
            const onClose = this.onClose.bind (this);
            const onConnected = this.onConnected.bind (this);
            // decide client type here: ws / signalr / socketio
            const wsOptions = this.safeValue (this.options, 'ws', {});
            // proxy agents
            const [ httpProxy, httpsProxy, socksProxy ] = this.checkWsProxySettings ();
            const chosenAgent = this.setProxyAgents (httpProxy, httpsProxy, socksProxy);
            // part only for node-js
            const httpProxyAgent = this.getHttpAgentIfNeeded (url);
            // eslint-disable-next-line no-nested-ternary
            const finalAgent = chosenAgent ? chosenAgent : (httpProxyAgent ? httpProxyAgent : this.agent);
            //
            const options = this.deepExtend (this.streaming, {
                'log': this.log ? this.log.bind (this) : this.log,
                'ping': (this as any).ping ? (this as any).ping.bind (this) : (this as any).ping,
                'verbose': this.verbose,
                'throttler': new Throttler (this.tokenBucket),
                // add support for proxies
                'options': {
                    'agent': finalAgent,
                },
                'decompressBinary': this.safeBool (this.options, 'decompressBinary', true),
            }, wsOptions);
            this.clients[url] = new WsClient (url, onMessage, onError, onClose, onConnected, options);
        }
        return this.clients[url];
    }

    watchMultiple (url: string, messageHashes: string[], message = undefined, subscribeHashes = undefined, subscription = undefined) {
        //
        // Without comments the code of this method is short and easy:
        //
        //     const client = this.client (url)
        //     const backoffDelay = 0
        //     const future = client.future (messageHash)
        //     const connected = client.connect (backoffDelay)
        //     connected.then (() => {
        //         if (message && !client.subscriptions[subscribeHash]) {
        //             client.subscriptions[subscribeHash] = true
        //             client.send (message)
        //         }
        //     }).catch ((error) => {})
        //     return future
        //
        // The following is a longer version of this method with comments
        //
        const client = this.client (url) as WsClient;
        // todo: calculate the backoff using the clients cache
        const backoffDelay = 0;
        //
        //  watchOrderBook ---- future ----+---------------+----→ user
        //                                 |               |
        //                                 ↓               ↑
        //                                 |               |
        //                              connect ......→ resolve
        //                                 |               |
        //                                 ↓               ↑
        //                                 |               |
        //                             subscribe -----→ receive
        //
        const future = Future.race (messageHashes.map ((messageHash) => client.future (messageHash)));
        // read and write subscription, this is done before connecting the client
        // to avoid race conditions when other parts of the code read or write to the client.subscriptions
        const missingSubscriptions = [];
        if (subscribeHashes !== undefined) {
            for (let i = 0; i < subscribeHashes.length; i++) {
                const subscribeHash = subscribeHashes[i];
                if (!client.subscriptions[subscribeHash]) {
                    missingSubscriptions.push (subscribeHash);
                    client.subscriptions[subscribeHash] = subscription || true;
                }
            }
        }
        // we intentionally do not use await here to avoid unhandled exceptions
        // the policy is to make sure that 100% of promises are resolved or rejected
        // either with a call to client.resolve or client.reject with
        //  a proper exception class instance
        const connected = client.connect (backoffDelay);
        // the following is executed only if the catch-clause does not
        // catch any connection-level exceptions from the client
        // (connection established successfully)
        if ((subscribeHashes === undefined) || missingSubscriptions.length) {
            connected.then (() => {
                const options = this.safeValue (this.options, 'ws');
                const cost = this.safeValue (options, 'cost', 1);
                if (message) {
                    if (this.enableRateLimit && client.throttle) {
                        // add cost here |
                        //               |
                        //               V
                        client.throttle (cost).then (() => {
                            client.send (message);
                        }).catch ((e) => {
                            for (let i = 0; i < missingSubscriptions.length; i++) {
                                const subscribeHash = missingSubscriptions[i];
                                delete client.subscriptions[subscribeHash];
                            }
                            future.reject (e);
                        });
                    } else {
                        client.send (message)
                            .catch ((e) => {
                                for (let i = 0; i < missingSubscriptions.length; i++) {
                                    const subscribeHash = missingSubscriptions[i];
                                    delete client.subscriptions[subscribeHash];
                                }
                                future.reject (e);
                            });
                    }
                }
            }).catch ((e) => {
                for (let i = 0; i < missingSubscriptions.length; i++) {
                    const subscribeHash = missingSubscriptions[i];
                    delete client.subscriptions[subscribeHash];
                }
                future.reject (e);
            });
        }
        return future;
    }

    watch (url: string, messageHash: string, message = undefined, subscribeHash = undefined, subscription = undefined) {
        //
        // Without comments the code of this method is short and easy:
        //
        //     const client = this.client (url)
        //     const backoffDelay = 0
        //     const future = client.future (messageHash)
        //     const connected = client.connect (backoffDelay)
        //     connected.then (() => {
        //         if (message && !client.subscriptions[subscribeHash]) {
        //             client.subscriptions[subscribeHash] = true
        //             client.send (message)
        //         }
        //     }).catch ((error) => {})
        //     return future
        //
        // The following is a longer version of this method with comments
        //
        const client = this.client (url) as WsClient;
        // todo: calculate the backoff using the clients cache
        const backoffDelay = 0;
        //
        //  watchOrderBook ---- future ----+---------------+----→ user
        //                                 |               |
        //                                 ↓               ↑
        //                                 |               |
        //                              connect ......→ resolve
        //                                 |               |
        //                                 ↓               ↑
        //                                 |               |
        //                             subscribe -----→ receive
        //
        if ((subscribeHash === undefined) && (messageHash in client.futures)) {
            return client.futures[messageHash];
        }
        const future = client.future (messageHash);
        // read and write subscription, this is done before connecting the client
        // to avoid race conditions when other parts of the code read or write to the client.subscriptions
        const clientSubscription = client.subscriptions[subscribeHash];
        if (!clientSubscription) {
            client.subscriptions[subscribeHash] = subscription || true;
        }
        // we intentionally do not use await here to avoid unhandled exceptions
        // the policy is to make sure that 100% of promises are resolved or rejected
        // either with a call to client.resolve or client.reject with
        //  a proper exception class instance
        const connected = client.connect (backoffDelay);
        // the following is executed only if the catch-clause does not
        // catch any connection-level exceptions from the client
        // (connection established successfully)
        if (!clientSubscription) {
            connected.then (() => {
                const options = this.safeValue (this.options, 'ws');
                const cost = this.safeValue (options, 'cost', 1);
                if (message) {
                    if (this.enableRateLimit && client.throttle) {
                        // add cost here |
                        //               |
                        //               V
                        client.throttle (cost).then (() => {
                            client.send (message);
                        }).catch ((e) => {
                            client.onError (e);
                        });
                    } else {
                        client.send (message)
                            .catch ((e) => {
                                client.onError (e);
                            });
                    }
                }
            }).catch ((e) => {
                delete client.subscriptions[subscribeHash];
                future.reject (e);
            });
        }
        return future;
    }

    onConnected (client, message = undefined) {
        // for user hooks
        // console.log ('Connected to', client.url)
    }

    onError (client, error) {
        if ((client.url in this.clients) && (this.clients[client.url].error)) {
            delete this.clients[client.url];
        }
    }

    onClose (client, error) {
        if (client.error) {
            // connection closed due to an error, do nothing
        } else {
            // server disconnected a working connection
            if (this.clients[client.url]) {
                delete this.clients[client.url];
            }
        }
    }

    async close () {
        // test by running ts/src/pro/test/base/test.close.ts
        await this.sleep (0); // allow other futures to run
        const clients = Object.values (this.clients || {});
        const closedClients = [];
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i] as WsClient;
            client.error = new ExchangeClosedByUser (this.id + ' closedByUser');
            closedClients.push (client.close ());
        }
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i] as WsClient;
            delete this.clients[client.url];
            closedClients.push (client.close ());
        }
        return Promise.all (closedClients);
    }

    async loadOrderBook (client, messageHash: string, symbol: string, limit: Int = undefined, params = {}) {
        if (!(symbol in this.orderbooks)) {
            client.reject (new ExchangeError (this.id + ' loadOrderBook() orderbook is not initiated'), messageHash);
            return;
        }
        const maxRetries = this.handleOption ('watchOrderBook', 'snapshotMaxRetries', 3);
        let tries = 0;
        try {
            const stored = this.orderbooks[symbol];
            while (tries < maxRetries) {
                const cache = stored.cache;
                const orderBook = await this.fetchRestOrderBookSafe (symbol, limit, params);
                const index = this.getCacheIndex (orderBook, cache);
                if (index >= 0) {
                    stored.reset (orderBook);
                    this.handleDeltas (stored, cache.slice (index));
                    stored.cache.length = 0;
                    client.resolve (stored, messageHash);
                    return;
                }
                tries++;
            }
            client.reject (new ExchangeError (this.id + ' nonce is behind the cache after ' + maxRetries.toString () + ' tries.'), messageHash);
            delete this.clients[client.url];
            this.orderbooks[symbol] = this.orderBook (); // clear the orderbook and its cache - issue https://github.com/ccxt/ccxt/issues/26753
        } catch (e) {
            client.reject (e, messageHash);
            await this.loadOrderBook (client, messageHash, symbol, limit, params);
        }
    }

    convertToBigInt (value: string) {
        return BigInt (value); // used on XT
    }

    stringToCharsArray (value: string) {
        return value.split ('');
    }

    valueIsDefined (value: any) {
        return value !== undefined && value !== null;
    }

    arraySlice (array, first, second = undefined) {
        if (second === undefined) {
            return array.slice (first);
        }
        return array.slice (first, second);
    }

    getProperty (obj, property, defaultValue: any = undefined) {
        return (property in obj ? obj[property] : defaultValue);
    }

    setProperty (obj, property, defaultValue: any = undefined) {
        obj[property] = defaultValue;
    }

    exceptionMessage (exc, includeStack: boolean = true) {
        const message = '[' + exc.constructor.name + '] ' + (!includeStack ? exc.message : exc.stack);
        const length = Math.min (100000, message.length);
        return message.slice (0, length);
    }

    axolotl (payload, hexKey, ed25519) {
        return axolotl (payload, hexKey, ed25519);
    }

    fixStringifiedJsonMembers (content: string) {
        // used for instance in bingx
        // when stringified json has members with their values also stringified, like:
        // '{"code":0, "data":{"order":{"orderId":1742968678528512345,"symbol":"BTC-USDT", "takeProfit":"{\"type\":\"TAKE_PROFIT\",\"stopPrice\":43320.1}","reduceOnly":false}}}'
        // we can fix with below manipulations
        // @ts-ignore
        let modifiedContent = content.replaceAll ('\\', '');
        modifiedContent = modifiedContent.replaceAll ('"{', '{');
        modifiedContent = modifiedContent.replaceAll ('}"', '}');
        return modifiedContent;
    }

    ethAbiEncode (types, args) {
        return this.base16ToBinary (ethers.encode (types, args).slice (2));
    }

    ethEncodeStructuredData (domain, messageTypes, messageData) {
        return this.base16ToBinary (TypedDataEncoder.encode (domain, messageTypes, messageData).slice (-132));
    }

    ethGetAddressFromPrivateKey (privateKey: string): string {
        // Accepts a "0x"-prefixed hexstring private key and returns the corresponding Ethereum address
        // Removes the "0x" prefix if present
        const cleanPrivateKey = this.remove0xPrefix (privateKey);
        // Get the public key from the private key using secp256k1 curve
        const publicKeyBytes = secp256k1.getPublicKey (cleanPrivateKey);
        // For Ethereum, we need to use the uncompressed public key (without the first byte which indicates compression)
        // secp256k1.getPublicKey returns compressed key, we need uncompressed
        const publicKeyUncompressed = secp256k1.ProjectivePoint.fromHex (publicKeyBytes).toRawBytes (false).slice (1); // Remove 0x04 prefix
        // Hash the public key with Keccak256
        const publicKeyHash = keccak_256 (publicKeyUncompressed);
        // Take the last 20 bytes (40 hex chars)
        const addressBytes = publicKeyHash.slice (-20);
        // Convert to hex and add 0x prefix
        const addressHex = '0x' + this.binaryToBase16 (addressBytes);
        return addressHex;
    }

    retrieveStarkAccount (signature, accountClassHash, accountProxyClassHash) {
        const privateKey = ethSigToPrivate (signature);
        const publicKey = getStarkKey (privateKey);
        const callData = Starknet.CallData.compile ({
            'implementation': accountClassHash,
            'selector': Starknet.hash.getSelectorFromName ('initialize'),
            'calldata': Starknet.CallData.compile ({
                'signer': publicKey,
                'guardian': '0',
            }),
        });
        const address = Starknet.hash.calculateContractAddressFromHash (
            publicKey,
            accountProxyClassHash,
            callData,
            0
        );
        return {
            privateKey,
            publicKey,
            address,
        };
    }

    starknetEncodeStructuredData (domain, messageTypes, messageData, address) {
        const types = Object.keys (messageTypes);
        if (types.length > 1) {
            throw new NotSupported (this.id + ' starknetEncodeStructuredData only support single type');
        }
        const request = {
            'domain': domain,
            'primaryType': types[0],
            'types': this.extend ({
                'StarkNetDomain': [
                    { 'name': 'name', 'type': 'felt' },
                    { 'name': 'chainId', 'type': 'felt' },
                    { 'name': 'version', 'type': 'felt' },
                ],
            }, messageTypes),
            'message': messageData,
        };
        const msgHash = Starknet.typedData.getMessageHash (request, address);
        return msgHash;
    }

    starknetSign (msgHash, pri) {
        // TODO: unify to ecdsa
        const signature = starknetCurveSign (msgHash.replace ('0x', ''), pri.replace ('0x', ''));
        return this.json ([ signature.r.toString (), signature.s.toString () ]);
    }

    async getZKContractSignatureObj (seed, params = {}) {
        const formattedSlotId = BigInt ('0x' + this.remove0xPrefix (this.hash (this.encode (this.safeString (params, 'slotId')), sha256, 'hex'))).toString ();
        const formattedNonce = BigInt ('0x' + this.remove0xPrefix (this.hash (this.encode (this.safeString (params, 'nonce')), sha256, 'hex'))).toString ();
        const formattedUint64 = '18446744073709551615';
        const formattedUint32 = '4294967295';
        const accountId = parseInt (Precise.stringMod (this.safeString (params, 'accountId'), formattedUint32), 10);
        const slotId = parseInt (Precise.stringDiv (Precise.stringMod (formattedSlotId, formattedUint64), formattedUint32), 10);
        const nonce = parseInt (Precise.stringMod (formattedNonce, formattedUint32), 10);
        await init ();
        const _signer = zklink.newRpcSignerWithProvider ({});
        await _signer.initZklinkSigner (seed);
        const tx_builder = new zklink.ContractBuilder (
            accountId,
            0,
            slotId,
            nonce,
            this.safeInteger (params, 'pairId'),
            Precise.stringMul (this.safeString (params, 'size'), '1e18'),
            Precise.stringMul (this.safeString (params, 'price'), '1e18'),
            this.safeString (params, 'direction') === 'BUY',
            parseInt (Precise.stringMul (this.safeString (params, 'makerFeeRate'), '10000')),
            parseInt (Precise.stringMul (this.safeString (params, 'takerFeeRate'), '10000')),
            false
        );
        const contractor = zklink.newContract (tx_builder);
        // const signer = ZkLinkSigner.ethSig(seed);
        // const signer = new Signer(seed);
        contractor?.sign (_signer?.getZkLinkSigner ());
        const tx = contractor.jsValue ();
        const zkSign = tx?.signature?.signature;
        return zkSign;
    }

    async getZKTransferSignatureObj (seed, params = {}) {
        await init ();
        const _signer = zklink.newRpcSignerWithProvider ({});
        await _signer.initZklinkSigner (seed);
        let nonce = this.safeString (params, 'nonce', '0');
        if (this.safeBool (params, 'isContract') === true) {
            const formattedUint32 = '4294967295';
            const formattedNonce = BigInt ('0x' + this.remove0xPrefix (this.hash (this.encode (nonce), sha256, 'hex'))).toString ();
            nonce = Precise.stringMod (formattedNonce, formattedUint32);
        }
        const tx_builder = new zklink.TransferBuilder (
            this.safeNumber (params, 'zkAccountId', 0),
            this.safeString (params, 'receiverAddress'),
            this.safeNumber (params, 'subAccountId', 0),
            this.safeNumber (params, 'receiverSubAccountId', 0),
            this.safeNumber (params, 'tokenId', 0),
            this.safeString (params, 'fee', '0'),
            this.safeString (params, 'amount', '0'),
            this.parseToInt (nonce),
            this.safeNumber (params, 'timestampSeconds', 0)
        );
        const contractor = zklink.newTransfer (tx_builder);
        // const signer = ZkLinkSigner.ethSig(seed);
        // const signer = new Signer(seed);
        contractor?.sign (_signer?.getZkLinkSigner ());
        const tx = contractor.jsValue ();
        const zkSign = tx?.signature?.signature;
        return zkSign;
    }

    async loadDydxProtos () {
        // load dydx protos
        const tasks = [
            import ('../static_dependencies/dydx-v4-client/registry.js') as Promise<any>,
            import ('../static_dependencies/dydx-v4-client/cosmos/tx/v1beta1/tx.js') as Promise<any>,
            import ('../static_dependencies/dydx-v4-client/cosmos/tx/signing/v1beta1/signing.js') as Promise<any>,
        ];
        const modules = await Promise.all (tasks);
        encodeAsAny = modules[0].encodeAsAny;
        AuthInfo = modules[1].AuthInfo;
        Tx = modules[1].Tx;
        TxBody = modules[1].TxBody;
        TxRaw = modules[1].TxRaw;
        SignDoc = modules[1].SignDoc;
        SignMode = modules[2].SignMode;
    }

    toDydxLong (numStr: string): object {
        return Long.fromString (numStr);
    }

    retrieveDydxCredentials (entropy: string): object {
        let credentials = undefined;
        if (entropy.indexOf (' ') > 0) {
            credentials = deriveHDKeyFromMnemonic (entropy);
            credentials['mnemonic'] = entropy;
            return credentials;
        }
        credentials = exportMnemonicAndPrivateKey (this.base16ToBinary (entropy));
        return credentials;
    }

    encodeDydxTxForSimulation (
        message,
        memo,
        sequence,
        publicKey
    ): string {
        if (!encodeAsAny) {
            throw new NotSupported (this.id + ' requires protobuf to encode messages, please install it with `npm install protobufjs`');
        }
        if (!publicKey) {
            throw new Error ('Public key cannot be undefined');
        }
        const messages = [ message ];
        const encodedMessages = messages.map ((msg) => encodeAsAny (msg));
        const tx = Tx.fromPartial ({
            'body': TxBody.fromPartial ({
                'messages': encodedMessages,
                'memo': memo,
            }),
            'authInfo': AuthInfo.fromPartial ({
                'fee': {},
                'signerInfos': [
                    {
                        'publicKey': encodeAsAny ({
                            'typeUrl': '/cosmos.crypto.secp256k1.PubKey',
                            'value': publicKey,
                        }),
                        'sequence': sequence,
                        'modeInfo': { 'single': { 'mode': SignMode.SIGN_MODE_UNSPECIFIED }},
                    },
                ],
            }),
            'signatures': [ new Uint8Array () ],
        });
        return this.binaryToBase64 (Tx.encode (tx).finish ());
    }

    encodeDydxTxForSigning (
        message,
        memo,
        chainId,
        account,
        authenticators,
        fee = undefined
    ): [ string, Dict ] {
        if (!encodeAsAny) {
            throw new NotSupported (this.id + ' requires protobuf to encode messages, please install it with `npm install protobufjs`');
        }
        if (!account.pub_key) {
            throw new Error ('Public key cannot be undefined');
        }
        const messages = [ message ];
        const sequence = this.milliseconds ();
        if (fee === undefined) {
            fee = {
                'amount': [],
                'gasLimit': 1000000,
            };
        }
        const encodedMessages = messages.map ((msg) => encodeAsAny (msg));
        const nonCriticalExtensionOptions = [
            encodeAsAny ({
                'typeUrl': '/dydxprotocol.accountplus.TxExtension',
                'value': {
                    'selectedAuthenticators': authenticators ?? [],
                },
            }),
        ];
        const txBodyBytes = TxBody.encode (TxBody.fromPartial ({
            'messages': encodedMessages,
            'memo': memo,
            'extensionOptions': [],
            'nonCriticalExtensionOptions': nonCriticalExtensionOptions,
        })).finish ();
        const authInfoBytes = AuthInfo.encode (AuthInfo.fromPartial ({
            'fee': fee,
            'signerInfos': [
                {
                    'publicKey': encodeAsAny ({
                        'typeUrl': '/cosmos.crypto.secp256k1.PubKey',
                        'value': account.pub_key,
                    }),
                    'sequence': sequence,
                    'modeInfo': { 'single': { 'mode': SignMode.SIGN_MODE_DIRECT }},
                },
            ],
        })).finish ();
        const signDoc = SignDoc.fromPartial ({
            'accountNumber': account.account_number,
            'authInfoBytes': authInfoBytes,
            'bodyBytes': txBodyBytes,
            'chainId': chainId,
        });
        const signingHash = this.hash (SignDoc.encode (signDoc).finish (), sha256, 'hex');
        return [ signingHash, signDoc ];
    }

    encodeDydxTxRaw (signDoc: Dict, signature: string): string {
        if (!encodeAsAny) {
            throw new NotSupported (this.id + ' requires protobuf to encode messages, please install it with `npm install protobufjs`');
        }
        return '0x' + this.binaryToBase16 (TxRaw.encode (TxRaw.fromPartial ({
            'bodyBytes': signDoc.bodyBytes,
            'authInfoBytes': signDoc.authInfoBytes,
            'signatures': [ this.base16ToBinary (signature) ],
        })).finish ());
    }

    intToBase16 (elem): string {
        return elem.toString (16);
    }

    extendExchangeOptions (newOptions: Dict) {
        this.options = this.extend (this.options, newOptions);
    }

    createSafeDictionary () {
        return {};
    }

    convertToSafeDictionary (dict) {
        return dict;
    }

    randomBytes (length: number) {
        const rng = new SecureRandom ();
        const x:number[] = [];
        x.length = length;
        rng.nextBytes (x);
        return Buffer.from (x).toString ('hex');
    }

    randNumber (size: number) {
        let number = '';
        for (let i = 0; i < size; i++) {
            number += Math.floor (Math.random () * 10);
        }
        return parseInt (number, 10);
    }

    binaryLength (binary: Uint8Array) {
        return binary.length;
    }

    lockId () {
        return undefined; // c# stub
    }

    unlockId () {
        return undefined;  // c# stub
    }

    /* eslint-enable */
    // ------------------------------------------------------------------------

    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ################        ########################        ################
    // ################        ########################        ################
    // ################        ########################        ################
    // ################        ########################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################

    // ------------------------------------------------------------------------
    // METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT

    describe (): any {
        return {
            'id': undefined,
            'name': undefined,
            'countries': undefined,
            'enableRateLimit': true,
            'rateLimit': 2000, // milliseconds = seconds * 1000
            'timeout': this.timeout, // milliseconds = seconds * 1000
            'certified': false, // if certified by the CCXT dev team
            'pro': false, // if it is integrated with CCXT Pro for WebSocket support
            'alias': false, // whether this exchange is an alias to another exchange
            'dex': false,
            'has': {
                'publicAPI': true,
                'privateAPI': true,
                'CORS': undefined,
                'sandbox': undefined,
                'spot': undefined,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'addMargin': undefined,
                'borrowCrossMargin': undefined,
                'borrowIsolatedMargin': undefined,
                'borrowMargin': undefined,
                'cancelAllOrders': undefined,
                'cancelAllOrdersWs': undefined,
                'cancelOrder': true,
                'cancelOrderWithClientOrderId': undefined,
                'cancelOrderWs': undefined,
                'cancelOrders': undefined,
                'cancelOrdersWithClientOrderId': undefined,
                'cancelOrdersWs': undefined,
                'closeAllPositions': undefined,
                'closePosition': undefined,
                'createDepositAddress': undefined,
                'createLimitBuyOrder': undefined,
                'createLimitBuyOrderWs': undefined,
                'createLimitOrder': true,
                'createLimitOrderWs': undefined,
                'createLimitSellOrder': undefined,
                'createLimitSellOrderWs': undefined,
                'createMarketBuyOrder': undefined,
                'createMarketBuyOrderWs': undefined,
                'createMarketBuyOrderWithCost': undefined,
                'createMarketBuyOrderWithCostWs': undefined,
                'createMarketOrder': true,
                'createMarketOrderWs': true,
                'createMarketOrderWithCost': undefined,
                'createMarketOrderWithCostWs': undefined,
                'createMarketSellOrder': undefined,
                'createMarketSellOrderWs': undefined,
                'createMarketSellOrderWithCost': undefined,
                'createMarketSellOrderWithCostWs': undefined,
                'createOrder': true,
                'createOrderWs': undefined,
                'createOrders': undefined,
                'createOrderWithTakeProfitAndStopLoss': undefined,
                'createOrderWithTakeProfitAndStopLossWs': undefined,
                'createPostOnlyOrder': undefined,
                'createPostOnlyOrderWs': undefined,
                'createReduceOnlyOrder': undefined,
                'createReduceOnlyOrderWs': undefined,
                'createStopLimitOrder': undefined,
                'createStopLimitOrderWs': undefined,
                'createStopLossOrder': undefined,
                'createStopLossOrderWs': undefined,
                'createStopMarketOrder': undefined,
                'createStopMarketOrderWs': undefined,
                'createStopOrder': undefined,
                'createStopOrderWs': undefined,
                'createTakeProfitOrder': undefined,
                'createTakeProfitOrderWs': undefined,
                'createTrailingAmountOrder': undefined,
                'createTrailingAmountOrderWs': undefined,
                'createTrailingPercentOrder': undefined,
                'createTrailingPercentOrderWs': undefined,
                'createTriggerOrder': undefined,
                'createTriggerOrderWs': undefined,
                'deposit': undefined,
                'editOrder': 'emulated',
                'editOrderWithClientOrderId': undefined,
                'editOrders': undefined,
                'editOrderWs': undefined,
                'fetchAccounts': undefined,
                'fetchBalance': true,
                'fetchBalanceWs': undefined,
                'fetchBidsAsks': undefined,
                'fetchBorrowInterest': undefined,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistories': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRates': undefined,
                'fetchBorrowRatesPerSymbol': undefined,
                'fetchCanceledAndClosedOrders': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': undefined,
                'fetchClosedOrdersWs': undefined,
                'fetchConvertCurrencies': undefined,
                'fetchConvertQuote': undefined,
                'fetchConvertTrade': undefined,
                'fetchConvertTradeHistory': undefined,
                'fetchCrossBorrowRate': undefined,
                'fetchCrossBorrowRates': undefined,
                'fetchCurrencies': 'emulated',
                'fetchCurrenciesWs': 'emulated',
                'fetchDeposit': undefined,
                'fetchDepositAddress': undefined,
                'fetchDepositAddresses': undefined,
                'fetchDepositAddressesByNetwork': undefined,
                'fetchDeposits': undefined,
                'fetchDepositsWithdrawals': undefined,
                'fetchDepositsWs': undefined,
                'fetchDepositWithdrawFee': undefined,
                'fetchDepositWithdrawFees': undefined,
                'fetchFundingHistory': undefined,
                'fetchFundingRate': undefined,
                'fetchFundingRateHistory': undefined,
                'fetchFundingInterval': undefined,
                'fetchFundingIntervals': undefined,
                'fetchFundingRates': undefined,
                'fetchGreeks': undefined,
                'fetchIndexOHLCV': undefined,
                'fetchIsolatedBorrowRate': undefined,
                'fetchIsolatedBorrowRates': undefined,
                'fetchMarginAdjustmentHistory': undefined,
                'fetchIsolatedPositions': undefined,
                'fetchL2OrderBook': true,
                'fetchL3OrderBook': undefined,
                'fetchLastPrices': undefined,
                'fetchLedger': undefined,
                'fetchLedgerEntry': undefined,
                'fetchLeverage': undefined,
                'fetchLeverages': undefined,
                'fetchLeverageTiers': undefined,
                'fetchLiquidations': undefined,
                'fetchLongShortRatio': undefined,
                'fetchLongShortRatioHistory': undefined,
                'fetchMarginMode': undefined,
                'fetchMarginModes': undefined,
                'fetchMarketLeverageTiers': undefined,
                'fetchMarkets': true,
                'fetchMarketsWs': undefined,
                'fetchMarkOHLCV': undefined,
                'fetchMyLiquidations': undefined,
                'fetchMySettlementHistory': undefined,
                'fetchMyTrades': undefined,
                'fetchMyTradesWs': undefined,
                'fetchOHLCV': undefined,
                'fetchOHLCVWs': undefined,
                'fetchOpenInterest': undefined,
                'fetchOpenInterests': undefined,
                'fetchOpenInterestHistory': undefined,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': undefined,
                'fetchOpenOrdersWs': undefined,
                'fetchOption': undefined,
                'fetchOptionChain': undefined,
                'fetchOrder': undefined,
                'fetchOrderWithClientOrderId': undefined,
                'fetchOrderBook': true,
                'fetchOrderBooks': undefined,
                'fetchOrderBookWs': undefined,
                'fetchOrders': undefined,
                'fetchOrdersByStatus': undefined,
                'fetchOrdersWs': undefined,
                'fetchOrderTrades': undefined,
                'fetchOrderWs': undefined,
                'fetchPosition': undefined,
                'fetchPositionHistory': undefined,
                'fetchPositionsHistory': undefined,
                'fetchPositionWs': undefined,
                'fetchPositionMode': undefined,
                'fetchPositions': undefined,
                'fetchPositionsWs': undefined,
                'fetchPositionsForSymbol': undefined,
                'fetchPositionsForSymbolWs': undefined,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': undefined,
                'fetchSettlementHistory': undefined,
                'fetchStatus': undefined,
                'fetchTicker': true,
                'fetchTickerWs': undefined,
                'fetchTickers': undefined,
                'fetchMarkPrices': undefined,
                'fetchTickersWs': undefined,
                'fetchTime': undefined,
                'fetchTrades': true,
                'fetchTradesWs': undefined,
                'fetchTradingFee': undefined,
                'fetchTradingFees': undefined,
                'fetchTradingFeesWs': undefined,
                'fetchTradingLimits': undefined,
                'fetchTransactionFee': undefined,
                'fetchTransactionFees': undefined,
                'fetchTransactions': undefined,
                'fetchTransfer': undefined,
                'fetchTransfers': undefined,
                'fetchUnderlyingAssets': undefined,
                'fetchVolatilityHistory': undefined,
                'fetchWithdrawAddresses': undefined,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': undefined,
                'fetchWithdrawalsWs': undefined,
                'fetchWithdrawalWhitelist': undefined,
                'reduceMargin': undefined,
                'repayCrossMargin': undefined,
                'repayIsolatedMargin': undefined,
                'setLeverage': undefined,
                'setMargin': undefined,
                'setMarginMode': undefined,
                'setPositionMode': undefined,
                'signIn': undefined,
                'transfer': undefined,
                'watchBalance': undefined,
                'watchMyTrades': undefined,
                'watchOHLCV': undefined,
                'watchOHLCVForSymbols': undefined,
                'watchOrderBook': undefined,
                'watchBidsAsks': undefined,
                'watchOrderBookForSymbols': undefined,
                'watchOrders': undefined,
                'watchOrdersForSymbols': undefined,
                'watchPosition': undefined,
                'watchPositions': undefined,
                'watchStatus': undefined,
                'watchTicker': undefined,
                'watchTickers': undefined,
                'watchTrades': undefined,
                'watchTradesForSymbols': undefined,
                'watchLiquidations': undefined,
                'watchLiquidationsForSymbols': undefined,
                'watchMyLiquidations': undefined,
                'unWatchOrders': undefined,
                'unWatchTrades': undefined,
                'unWatchTradesForSymbols': undefined,
                'unWatchOHLCVForSymbols': undefined,
                'unWatchOrderBookForSymbols': undefined,
                'unWatchPositions': undefined,
                'unWatchOrderBook': undefined,
                'unWatchTickers': undefined,
                'unWatchMyTrades': undefined,
                'unWatchTicker': undefined,
                'unWatchOHLCV': undefined,
                'watchMyLiquidationsForSymbols': undefined,
                'withdraw': undefined,
                'ws': undefined,
            },
            'urls': {
                'logo': undefined,
                'api': undefined,
                'www': undefined,
                'doc': undefined,
                'fees': undefined,
            },
            'api': undefined,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': false,
                'accountId': false,
                'login': false,
                'password': false,
                'twofa': false, // 2-factor authentication (one-time password key)
                'privateKey': false, // a "0x"-prefixed hexstring private key for a wallet
                'walletAddress': false, // the wallet address "0x"-prefixed hexstring
                'token': false, // reserved for HTTP auth in some cases
            },
            'markets': undefined, // to be filled manually or by fetchMarkets
            'currencies': {}, // to be filled manually or by fetchMarkets
            'timeframes': undefined, // redefine if the exchange has.fetchOHLCV
            'fees': {
                'trading': {
                    'tierBased': undefined,
                    'percentage': undefined,
                    'taker': undefined,
                    'maker': undefined,
                },
                'funding': {
                    'tierBased': undefined,
                    'percentage': undefined,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'status': {
                'status': 'ok',
                'updated': undefined,
                'eta': undefined,
                'url': undefined,
            },
            'exceptions': undefined,
            'httpExceptions': {
                '422': ExchangeError,
                '418': DDoSProtection,
                '429': RateLimitExceeded,
                '404': ExchangeNotAvailable,
                '409': ExchangeNotAvailable,
                '410': ExchangeNotAvailable,
                '451': ExchangeNotAvailable,
                '500': ExchangeNotAvailable,
                '501': ExchangeNotAvailable,
                '502': ExchangeNotAvailable,
                '520': ExchangeNotAvailable,
                '521': ExchangeNotAvailable,
                '522': ExchangeNotAvailable,
                '525': ExchangeNotAvailable,
                '526': ExchangeNotAvailable,
                '400': ExchangeNotAvailable,
                '403': ExchangeNotAvailable,
                '405': ExchangeNotAvailable,
                '503': ExchangeNotAvailable,
                '530': ExchangeNotAvailable,
                '408': RequestTimeout,
                '504': RequestTimeout,
                '401': AuthenticationError,
                '407': AuthenticationError,
                '511': AuthenticationError,
            },
            'commonCurrencies': {
                'XBT': 'BTC',
                'BCHSV': 'BSV',
            },
            'precisionMode': TICK_SIZE,
            'paddingMode': NO_PADDING,
            'limits': {
                'leverage': { 'min': undefined, 'max': undefined },
                'amount': { 'min': undefined, 'max': undefined },
                'price': { 'min': undefined, 'max': undefined },
                'cost': { 'min': undefined, 'max': undefined },
            },
            'rollingWindowSize': 60000, // default 60 seconds, requires rateLimiterAlgorithm to be set as 'rollingWindow'
        };
    }

    safeBoolN (dictionaryOrList, keys: IndexType[], defaultValue: boolean = undefined): boolean | undefined {
        /**
         * @ignore
         * @method
         * @description safely extract boolean value from dictionary or list
         * @returns {bool | undefined}
         */
        const value = this.safeValueN (dictionaryOrList, keys, defaultValue);
        if (typeof value === 'boolean') {
            return value;
        }
        return defaultValue;
    }

    safeBool2 (dictionary, key1: IndexType, key2: IndexType, defaultValue: boolean = undefined): boolean | undefined {
        /**
         * @ignore
         * @method
         * @description safely extract boolean value from dictionary or list
         * @returns {bool | undefined}
         */
        return this.safeBoolN (dictionary, [ key1, key2 ], defaultValue);
    }

    safeBool (dictionary, key: IndexType, defaultValue: boolean = undefined): boolean | undefined {
        /**
         * @ignore
         * @method
         * @description safely extract boolean value from dictionary or list
         * @returns {bool | undefined}
         */
        const value = this.safeValue (dictionary, key, defaultValue);
        if (typeof value === 'boolean') {
            return value;
        }
        return defaultValue;
    }

    safeDictN (dictionaryOrList, keys: IndexType[], defaultValue: Dictionary<any> = undefined): Dictionary<any> | undefined {
        /**
         * @ignore
         * @method
         * @description safely extract a dictionary from dictionary or list
         * @returns {object | undefined}
         */
        const value = this.safeValueN (dictionaryOrList, keys, defaultValue);
        if (value === undefined) {
            return defaultValue;
        }
        if ((typeof value === 'object') && !Array.isArray (value)) {
            return value;
        }
        return defaultValue;
    }

    safeDict (dictionary, key: IndexType, defaultValue: Dictionary<any> = undefined): Dictionary<any> | undefined {
        /**
         * @ignore
         * @method
         * @description safely extract a dictionary from dictionary or list
         * @returns {object | undefined}
         */
        const value = this.safeValue (dictionary, key, defaultValue);
        if (value === undefined) {
            return defaultValue;
        }
        if ((typeof value === 'object') && !Array.isArray (value)) {
            return value;
        }
        return defaultValue;
    }

    safeDict2 (dictionary, key1: IndexType, key2: string, defaultValue: Dictionary<any> = undefined): Dictionary<any> | undefined {
        /**
         * @ignore
         * @method
         * @description safely extract a dictionary from dictionary or list
         * @returns {object | undefined}
         */
        return this.safeDictN (dictionary, [ key1, key2 ], defaultValue);
    }

    safeListN (dictionaryOrList, keys: IndexType[], defaultValue: any[] = undefined): any[] | undefined {
        /**
         * @ignore
         * @method
         * @description safely extract an Array from dictionary or list
         * @returns {Array | undefined}
         */
        const value = this.safeValueN (dictionaryOrList, keys, defaultValue);
        if (value === undefined) {
            return defaultValue;
        }
        if (Array.isArray (value)) {
            return value;
        }
        return defaultValue;
    }

    safeList2 (dictionaryOrList, key1: IndexType, key2: string, defaultValue: any[] = undefined): any[] | undefined {
        /**
         * @ignore
         * @method
         * @description safely extract an Array from dictionary or list
         * @returns {Array | undefined}
         */
        return this.safeListN (dictionaryOrList, [ key1, key2 ], defaultValue);
    }

    safeList (dictionaryOrList, key: IndexType, defaultValue: any[] = undefined): any[] | undefined {
        /**
         * @ignore
         * @method
         * @description safely extract an Array from dictionary or list
         * @returns {Array | undefined}
         */
        const value = this.safeValue (dictionaryOrList, key, defaultValue);
        if (value === undefined) {
            return defaultValue;
        }
        if (Array.isArray (value)) {
            return value;
        }
        return defaultValue;
    }

    handleDeltas (orderbook, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (orderbook, deltas[i]);
        }
    }

    handleDelta (bookside, delta) {
        throw new NotSupported (this.id + ' handleDelta not supported yet');
    }

    handleDeltasWithKeys (bookSide: any, deltas, priceKey: IndexType = 0, amountKey: IndexType = 1, countOrIdKey: IndexType = 2) {
        for (let i = 0; i < deltas.length; i++) {
            const bidAsk = this.parseBidAsk (deltas[i], priceKey, amountKey, countOrIdKey);
            bookSide.storeArray (bidAsk);
        }
    }

    getCacheIndex (orderbook, deltas) {
        // return the first index of the cache that can be applied to the orderbook or -1 if not possible.
        return -1;
    }

    arraysConcat (arraysOfArrays: any[]) {
        let result = [];
        for (let i = 0; i < arraysOfArrays.length; i++) {
            result = this.arrayConcat (result, arraysOfArrays[i]);
        }
        return result;
    }

    findTimeframe (timeframe, timeframes = undefined) {
        if (timeframes === undefined) {
            timeframes = this.timeframes;
        }
        const keys = Object.keys (timeframes);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (timeframes[key] === timeframe) {
                return key;
            }
        }
        return undefined;
    }

    checkProxyUrlSettings (url: Str = undefined, method: Str = undefined, headers = undefined, body = undefined) {
        const usedProxies = [];
        let proxyUrl = undefined;
        if (this.proxyUrl !== undefined) {
            usedProxies.push ('proxyUrl');
            proxyUrl = this.proxyUrl;
        }
        if (this.proxy_url !== undefined) {
            usedProxies.push ('proxy_url');
            proxyUrl = this.proxy_url;
        }
        if (this.proxyUrlCallback !== undefined) {
            usedProxies.push ('proxyUrlCallback');
            proxyUrl = this.proxyUrlCallback (url, method, headers, body);
        }
        if (this.proxy_url_callback !== undefined) {
            usedProxies.push ('proxy_url_callback');
            proxyUrl = this.proxy_url_callback (url, method, headers, body);
        }
        // backwards-compatibility
        if (this.proxy !== undefined) {
            usedProxies.push ('proxy');
            if (typeof this.proxy === 'function') {
                proxyUrl = this.proxy (url, method, headers, body);
            } else {
                proxyUrl = this.proxy;
            }
        }
        const length = usedProxies.length;
        if (length > 1) {
            const joinedProxyNames = usedProxies.join (',');
            throw new InvalidProxySettings (this.id + ' you have multiple conflicting proxy settings (' + joinedProxyNames + '), please use only one from : proxyUrl, proxy_url, proxyUrlCallback, proxy_url_callback');
        }
        return proxyUrl;
    }

    urlEncoderForProxyUrl (targetUrl: string) {
        // to be overriden
        const includesQuery = targetUrl.indexOf ('?') >= 0;
        const finalUrl = includesQuery ? this.encodeURIComponent (targetUrl) : targetUrl;
        return finalUrl;
    }

    checkProxySettings (url: Str = undefined, method: Str = undefined, headers = undefined, body = undefined) {
        const usedProxies = [];
        let httpProxy = undefined;
        let httpsProxy = undefined;
        let socksProxy = undefined;
        // httpProxy
        const isHttpProxyDefined = this.valueIsDefined (this.httpProxy);
        const isHttp_proxy_defined = this.valueIsDefined (this.http_proxy);
        if (isHttpProxyDefined || isHttp_proxy_defined) {
            usedProxies.push ('httpProxy');
            httpProxy = isHttpProxyDefined ? this.httpProxy : this.http_proxy;
        }
        const ishttpProxyCallbackDefined = this.valueIsDefined (this.httpProxyCallback);
        const ishttp_proxy_callback_defined = this.valueIsDefined (this.http_proxy_callback);
        if (ishttpProxyCallbackDefined || ishttp_proxy_callback_defined) {
            usedProxies.push ('httpProxyCallback');
            httpProxy = ishttpProxyCallbackDefined ? this.httpProxyCallback (url, method, headers, body) : this.http_proxy_callback (url, method, headers, body);
        }
        // httpsProxy
        const isHttpsProxyDefined = this.valueIsDefined (this.httpsProxy);
        const isHttps_proxy_defined = this.valueIsDefined (this.https_proxy);
        if (isHttpsProxyDefined || isHttps_proxy_defined) {
            usedProxies.push ('httpsProxy');
            httpsProxy = isHttpsProxyDefined ? this.httpsProxy : this.https_proxy;
        }
        const ishttpsProxyCallbackDefined = this.valueIsDefined (this.httpsProxyCallback);
        const ishttps_proxy_callback_defined = this.valueIsDefined (this.https_proxy_callback);
        if (ishttpsProxyCallbackDefined || ishttps_proxy_callback_defined) {
            usedProxies.push ('httpsProxyCallback');
            httpsProxy = ishttpsProxyCallbackDefined ? this.httpsProxyCallback (url, method, headers, body) : this.https_proxy_callback (url, method, headers, body);
        }
        // socksProxy
        const isSocksProxyDefined = this.valueIsDefined (this.socksProxy);
        const isSocks_proxy_defined = this.valueIsDefined (this.socks_proxy);
        if (isSocksProxyDefined || isSocks_proxy_defined) {
            usedProxies.push ('socksProxy');
            socksProxy = isSocksProxyDefined ? this.socksProxy : this.socks_proxy;
        }
        const issocksProxyCallbackDefined = this.valueIsDefined (this.socksProxyCallback);
        const issocks_proxy_callback_defined = this.valueIsDefined (this.socks_proxy_callback);
        if (issocksProxyCallbackDefined || issocks_proxy_callback_defined) {
            usedProxies.push ('socksProxyCallback');
            socksProxy = issocksProxyCallbackDefined ? this.socksProxyCallback (url, method, headers, body) : this.socks_proxy_callback (url, method, headers, body);
        }
        // check
        const length = usedProxies.length;
        if (length > 1) {
            const joinedProxyNames = usedProxies.join (',');
            throw new InvalidProxySettings (this.id + ' you have multiple conflicting proxy settings (' + joinedProxyNames + '), please use only one from: httpProxy, httpsProxy, httpProxyCallback, httpsProxyCallback, socksProxy, socksProxyCallback');
        }
        return [ httpProxy, httpsProxy, socksProxy ];
    }

    checkWsProxySettings () {
        const usedProxies = [];
        let wsProxy = undefined;
        let wssProxy = undefined;
        let wsSocksProxy = undefined;
        // ws proxy
        const isWsProxyDefined = this.valueIsDefined (this.wsProxy);
        const is_ws_proxy_defined = this.valueIsDefined (this.ws_proxy);
        if (isWsProxyDefined || is_ws_proxy_defined) {
            usedProxies.push ('wsProxy');
            wsProxy = (isWsProxyDefined) ? this.wsProxy : this.ws_proxy;
        }
        // wss proxy
        const isWssProxyDefined = this.valueIsDefined (this.wssProxy);
        const is_wss_proxy_defined = this.valueIsDefined (this.wss_proxy);
        if (isWssProxyDefined || is_wss_proxy_defined) {
            usedProxies.push ('wssProxy');
            wssProxy = (isWssProxyDefined) ? this.wssProxy : this.wss_proxy;
        }
        // ws socks proxy
        const isWsSocksProxyDefined = this.valueIsDefined (this.wsSocksProxy);
        const is_ws_socks_proxy_defined = this.valueIsDefined (this.ws_socks_proxy);
        if (isWsSocksProxyDefined || is_ws_socks_proxy_defined) {
            usedProxies.push ('wsSocksProxy');
            wsSocksProxy = (isWsSocksProxyDefined) ? this.wsSocksProxy : this.ws_socks_proxy;
        }
        // check
        const length = usedProxies.length;
        if (length > 1) {
            const joinedProxyNames = usedProxies.join (',');
            throw new InvalidProxySettings (this.id + ' you have multiple conflicting proxy settings (' + joinedProxyNames + '), please use only one from: wsProxy, wssProxy, wsSocksProxy');
        }
        return [ wsProxy, wssProxy, wsSocksProxy ];
    }

    checkConflictingProxies (proxyAgentSet, proxyUrlSet) {
        if (proxyAgentSet && proxyUrlSet) {
            throw new InvalidProxySettings (this.id + ' you have multiple conflicting proxy settings, please use only one from : proxyUrl, httpProxy, httpsProxy, socksProxy');
        }
    }

    checkAddress (address: Str = undefined): Str {
        if (address === undefined) {
            throw new InvalidAddress (this.id + ' address is undefined');
        }
        // check the address is not the same letter like 'aaaaa' nor too short nor has a space
        const uniqChars = (this.unique (this.stringToCharsArray (address)));
        const length = uniqChars.length; // py transpiler trick
        if (length === 1 || address.length < this.minFundingAddressLength || address.indexOf (' ') > -1) {
            throw new InvalidAddress (this.id + ' address is invalid or has less than ' + this.minFundingAddressLength.toString () + ' characters: "' + address.toString () + '"');
        }
        return address;
    }

    findMessageHashes (client, element: string): string[] {
        const result = [];
        const messageHashes = Object.keys (client.futures);
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            if (messageHash.indexOf (element) >= 0) {
                result.push (messageHash);
            }
        }
        return result;
    }

    filterByLimit (array: object[], limit: Int = undefined, key: IndexType = 'timestamp', fromStart: boolean = false): any {
        if (this.valueIsDefined (limit)) {
            const arrayLength = array.length;
            if (arrayLength > 0) {
                let ascending = true;
                if ((key in array[0])) {
                    const first = array[0][key];
                    const last = array[arrayLength - 1][key];
                    if (first !== undefined && last !== undefined) {
                        ascending = first <= last;  // true if array is sorted in ascending order based on 'timestamp'
                    }
                }
                if (fromStart) {
                    if (limit > arrayLength) {
                        limit = arrayLength;
                    }
                    // array = ascending ? this.arraySlice (array, 0, limit) : this.arraySlice (array, -limit);
                    if (ascending) {
                        array = this.arraySlice (array, 0, limit);
                    } else {
                        array = this.arraySlice (array, -limit);
                    }
                } else {
                    // array = ascending ? this.arraySlice (array, -limit) : this.arraySlice (array, 0, limit);
                    if (ascending) {
                        array = this.arraySlice (array, -limit);
                    } else {
                        array = this.arraySlice (array, 0, limit);
                    }
                }
            }
        }
        return array;
    }

    filterBySinceLimit (array: object[], since: Int = undefined, limit: Int = undefined, key: IndexType = 'timestamp', tail = false): any {
        const sinceIsDefined = this.valueIsDefined (since);
        const parsedArray = this.toArray (array) as any;
        let result = parsedArray;
        if (sinceIsDefined) {
            result = [ ];
            for (let i = 0; i < parsedArray.length; i++) {
                const entry = parsedArray[i];
                const value = this.safeValue (entry, key);
                if (value && (value >= since)) {
                    result.push (entry);
                }
            }
        }
        if (tail && limit !== undefined) {
            return this.arraySlice (result, -limit);
        }
        // if the user provided a 'since' argument
        // we want to limit the result starting from the 'since'
        const shouldFilterFromStart = !tail && sinceIsDefined;
        return this.filterByLimit (result, limit, key, shouldFilterFromStart);
    }

    filterByValueSinceLimit (array: object[], field: IndexType, value = undefined, since: Int = undefined, limit: Int = undefined, key = 'timestamp', tail = false): any {
        const valueIsDefined = this.valueIsDefined (value);
        const sinceIsDefined = this.valueIsDefined (since);
        const parsedArray = this.toArray (array) as any;
        let result = parsedArray;
        // single-pass filter for both symbol and since
        if (valueIsDefined || sinceIsDefined) {
            result = [ ];
            for (let i = 0; i < parsedArray.length; i++) {
                const entry = parsedArray[i];
                const entryFiledEqualValue = entry[field] === value;
                const firstCondition = valueIsDefined ? entryFiledEqualValue : true;
                const entryKeyValue = this.safeValue (entry, key);
                const entryKeyGESince = (entryKeyValue) && (since !== undefined) && (entryKeyValue >= since);
                const secondCondition = sinceIsDefined ? entryKeyGESince : true;
                if (firstCondition && secondCondition) {
                    result.push (entry);
                }
            }
        }
        if (tail && limit !== undefined) {
            return this.arraySlice (result, -limit);
        }
        return this.filterByLimit (result, limit, key, sinceIsDefined);
    }

    /**
     * @method
     * @name Exchange#setSandboxMode
     * @description set the sandbox mode for the exchange
     * @param {boolean} enabled true to enable sandbox mode, false to disable it
     */
    setSandboxMode (enabled: boolean) {
        if (enabled) {
            if ('test' in this.urls) {
                if (typeof this.urls['api'] === 'string') {
                    this.urls['apiBackup'] = this.urls['api'];
                    this.urls['api'] = this.urls['test'];
                } else {
                    this.urls['apiBackup'] = this.clone (this.urls['api']);
                    this.urls['api'] = this.clone (this.urls['test']);
                }
            } else {
                throw new NotSupported (this.id + ' does not have a sandbox URL');
            }
            // set flag
            this.isSandboxModeEnabled = true;
        } else if ('apiBackup' in this.urls) {
            if (typeof this.urls['api'] === 'string') {
                this.urls['api'] = this.urls['apiBackup'] as any;
            } else {
                this.urls['api'] = this.clone (this.urls['apiBackup']);
            }
            const newUrls = this.omit (this.urls, 'apiBackup');
            this.urls = newUrls;
            // set flag
            this.isSandboxModeEnabled = false;
        }
    }

    /**
     * @method
     * @name Exchange#enableDemoTrading
     * @description enables or disables demo trading mode
     * @param {boolean} [enable] true if demo trading should be enabled, false otherwise
     */
    enableDemoTrading (enable: boolean) {
        if (this.isSandboxModeEnabled) {
            throw new NotSupported (this.id + ' demo trading does not support in sandbox environment. Please check https://www.binance.com/en/support/faq/detail/9be58f73e5e14338809e3b705b9687dd to see the differences');
        }
        if (enable) {
            this.urls['apiBackupDemoTrading'] = this.urls['api'];
            this.urls['api'] = this.urls['demo'];
        } else if ('apiBackupDemoTrading' in this.urls) {
            this.urls['api'] = this.urls['apiBackupDemoTrading'] as any;
            const newUrls = this.omit (this.urls, 'apiBackupDemoTrading');
            this.urls = newUrls;
        }
        this.options['enableDemoTrading'] = enable;
    }

    sign (path, api: any = 'public', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        return {};
    }

    async fetchAccounts (params = {}): Promise<Account[]> {
        throw new NotSupported (this.id + ' fetchAccounts() is not supported yet');
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        throw new NotSupported (this.id + ' fetchTrades() is not supported yet');
    }

    async fetchTradesWs (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        throw new NotSupported (this.id + ' fetchTradesWs() is not supported yet');
    }

    async watchLiquidations (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Liquidation[]> {
        if (this.has['watchLiquidationsForSymbols']) {
            return await this.watchLiquidationsForSymbols ([ symbol ], since, limit, params);
        }
        throw new NotSupported (this.id + ' watchLiquidations() is not supported yet');
    }

    async watchLiquidationsForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Liquidation[]> {
        throw new NotSupported (this.id + ' watchLiquidationsForSymbols() is not supported yet');
    }

    async watchMyLiquidations (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Liquidation[]> {
        if (this.has['watchMyLiquidationsForSymbols']) {
            return this.watchMyLiquidationsForSymbols ([ symbol ], since, limit, params);
        }
        throw new NotSupported (this.id + ' watchMyLiquidations() is not supported yet');
    }

    async watchMyLiquidationsForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Liquidation[]> {
        throw new NotSupported (this.id + ' watchMyLiquidationsForSymbols() is not supported yet');
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        throw new NotSupported (this.id + ' watchTrades() is not supported yet');
    }

    async unWatchOrders (symbol: Str = undefined, params = {}): Promise<any> {
        throw new NotSupported (this.id + ' unWatchOrders() is not supported yet');
    }

    async unWatchTrades (symbol: string, params = {}): Promise<any> {
        throw new NotSupported (this.id + ' unWatchTrades() is not supported yet');
    }

    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        throw new NotSupported (this.id + ' watchTradesForSymbols() is not supported yet');
    }

    async unWatchTradesForSymbols (symbols: string[], params = {}): Promise<any> {
        throw new NotSupported (this.id + ' unWatchTradesForSymbols() is not supported yet');
    }

    async watchMyTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        throw new NotSupported (this.id + ' watchMyTradesForSymbols() is not supported yet');
    }

    async watchOrdersForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        throw new NotSupported (this.id + ' watchOrdersForSymbols() is not supported yet');
    }

    async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Dictionary<Dictionary<OHLCV[]>>> {
        throw new NotSupported (this.id + ' watchOHLCVForSymbols() is not supported yet');
    }

    async unWatchOHLCVForSymbols (symbolsAndTimeframes: string[][], params = {}): Promise<any> {
        throw new NotSupported (this.id + ' unWatchOHLCVForSymbols() is not supported yet');
    }

    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        throw new NotSupported (this.id + ' watchOrderBookForSymbols() is not supported yet');
    }

    async unWatchOrderBookForSymbols (symbols: string[], params = {}): Promise<any> {
        throw new NotSupported (this.id + ' unWatchOrderBookForSymbols() is not supported yet');
    }

    async unWatchPositions (symbols: Strings = undefined, params = {}): Promise<any> {
        throw new NotSupported (this.id + ' unWatchPositions() is not supported yet');
    }

    async unWatchTicker (symbol: string, params = {}): Promise<any> {
        throw new NotSupported (this.id + ' unWatchTicker() is not supported yet');
    }

    async unWatchMarkPrice (symbol: string, params = {}): Promise<any> {
        throw new NotSupported (this.id + ' unWatchMarkPrice() is not supported yet');
    }

    async unWatchMarkPrices (symbols: Strings = undefined, params = {}): Promise<any> {
        throw new NotSupported (this.id + ' unWatchMarkPrices() is not supported yet');
    }

    async fetchDepositAddresses (codes: Strings = undefined, params = {}): Promise<DepositAddress[]> {
        throw new NotSupported (this.id + ' fetchDepositAddresses() is not supported yet');
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        throw new NotSupported (this.id + ' fetchOrderBook() is not supported yet');
    }

    async fetchOrderBookWs (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        throw new NotSupported (this.id + ' fetchOrderBookWs() is not supported yet');
    }

    async fetchMarginMode (symbol: string, params = {}): Promise<MarginMode> {
        if (this.has['fetchMarginModes']) {
            const marginModes = await this.fetchMarginModes ([ symbol ], params);
            return this.safeDict (marginModes, symbol) as MarginMode;
        } else {
            throw new NotSupported (this.id + ' fetchMarginMode() is not supported yet');
        }
    }

    async fetchMarginModes (symbols: Strings = undefined, params = {}): Promise<MarginModes> {
        throw new NotSupported (this.id + ' fetchMarginModes () is not supported yet');
    }

    async fetchRestOrderBookSafe (symbol, limit = undefined, params = {}) {
        const fetchSnapshotMaxRetries = this.handleOption ('watchOrderBook', 'maxRetries', 3);
        for (let i = 0; i < fetchSnapshotMaxRetries; i++) {
            try {
                const orderBook = await this.fetchOrderBook (symbol, limit, params);
                return orderBook;
            } catch (e) {
                if ((i + 1) === fetchSnapshotMaxRetries) {
                    throw e;
                }
            }
        }
        return undefined;
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        throw new NotSupported (this.id + ' watchOrderBook() is not supported yet');
    }

    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        throw new NotSupported (this.id + ' unWatchOrderBook() is not supported yet');
    }

    async fetchTime (params = {}): Promise<Int> {
        throw new NotSupported (this.id + ' fetchTime() is not supported yet');
    }

    async fetchTradingLimits (symbols: Strings = undefined, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' fetchTradingLimits() is not supported yet');
    }

    parseCurrency (rawCurrency: Dict): Currency {
        throw new NotSupported (this.id + ' parseCurrency() is not supported yet');
    }

    parseCurrencies (rawCurrencies): Currencies {
        const result = {};
        const arr = this.toArray (rawCurrencies);
        for (let i = 0; i < arr.length; i++) {
            const parsed = this.parseCurrency (arr[i]);
            const code = parsed['code'];
            result[code] = parsed;
        }
        return result;
    }

    parseMarket (market: Dict): Market {
        throw new NotSupported (this.id + ' parseMarket() is not supported yet');
    }

    parseMarkets (markets): Market[] {
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            result.push (this.parseMarket (markets[i]));
        }
        return result;
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        throw new NotSupported (this.id + ' parseTicker() is not supported yet');
    }

    parseDepositAddress (depositAddress, currency: Currency = undefined): DepositAddress {
        throw new NotSupported (this.id + ' parseDepositAddress() is not supported yet');
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        throw new NotSupported (this.id + ' parseTrade() is not supported yet');
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        throw new NotSupported (this.id + ' parseTransaction() is not supported yet');
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        throw new NotSupported (this.id + ' parseTransfer() is not supported yet');
    }

    parseAccount (account: Dict): Account {
        throw new NotSupported (this.id + ' parseAccount() is not supported yet');
    }

    parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        throw new NotSupported (this.id + ' parseLedgerEntry() is not supported yet');
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        throw new NotSupported (this.id + ' parseOrder() is not supported yet');
    }

    async fetchCrossBorrowRates (params = {}): Promise<CrossBorrowRates> {
        throw new NotSupported (this.id + ' fetchCrossBorrowRates() is not supported yet');
    }

    async fetchIsolatedBorrowRates (params = {}): Promise<IsolatedBorrowRates> {
        throw new NotSupported (this.id + ' fetchIsolatedBorrowRates() is not supported yet');
    }

    parseMarketLeverageTiers (info, market: Market = undefined): LeverageTier[] {
        throw new NotSupported (this.id + ' parseMarketLeverageTiers() is not supported yet');
    }

    async fetchLeverageTiers (symbols: Strings = undefined, params = {}): Promise<LeverageTiers> {
        throw new NotSupported (this.id + ' fetchLeverageTiers() is not supported yet');
    }

    parsePosition (position: Dict, market: Market = undefined): Position {
        throw new NotSupported (this.id + ' parsePosition() is not supported yet');
    }

    parseFundingRateHistory (info, market: Market = undefined): FundingRateHistory {
        throw new NotSupported (this.id + ' parseFundingRateHistory() is not supported yet');
    }

    parseBorrowInterest (info: Dict, market: Market = undefined): BorrowInterest {
        throw new NotSupported (this.id + ' parseBorrowInterest() is not supported yet');
    }

    parseIsolatedBorrowRate (info: Dict, market: Market = undefined): IsolatedBorrowRate {
        throw new NotSupported (this.id + ' parseIsolatedBorrowRate() is not supported yet');
    }

    parseWsTrade (trade: Dict, market: Market = undefined): Trade {
        throw new NotSupported (this.id + ' parseWsTrade() is not supported yet');
    }

    parseWsOrder (order: Dict, market: Market = undefined): Order {
        throw new NotSupported (this.id + ' parseWsOrder() is not supported yet');
    }

    parseWsOrderTrade (trade: Dict, market: Market = undefined): Trade {
        throw new NotSupported (this.id + ' parseWsOrderTrade() is not supported yet');
    }

    parseWsOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return this.parseOHLCV (ohlcv, market);
    }

    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        throw new NotSupported (this.id + ' fetchFundingRates() is not supported yet');
    }

    async fetchFundingIntervals (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        throw new NotSupported (this.id + ' fetchFundingIntervals() is not supported yet');
    }

    async watchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        throw new NotSupported (this.id + ' watchFundingRate() is not supported yet');
    }

    async watchFundingRates (symbols: string[], params = {}): Promise<FundingRates> {
        throw new NotSupported (this.id + ' watchFundingRates() is not supported yet');
    }

    async watchFundingRatesForSymbols (symbols: string[], params = {}): Promise<{}> {
        return await this.watchFundingRates (symbols, params);
    }

    async transfer (code: string, amount: number, fromAccount: string, toAccount: string, params = {}): Promise<TransferEntry> {
        throw new NotSupported (this.id + ' transfer() is not supported yet');
    }

    async withdraw (code: string, amount: number, address: string, tag: Str = undefined, params = {}): Promise<Transaction> {
        throw new NotSupported (this.id + ' withdraw() is not supported yet');
    }

    async createDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        throw new NotSupported (this.id + ' createDepositAddress() is not supported yet');
    }

    async setLeverage (leverage: int, symbol: Str = undefined, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' setLeverage() is not supported yet');
    }

    async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        if (this.has['fetchLeverages']) {
            const leverages = await this.fetchLeverages ([ symbol ], params);
            return this.safeDict (leverages, symbol) as Leverage;
        } else {
            throw new NotSupported (this.id + ' fetchLeverage() is not supported yet');
        }
    }

    async fetchLeverages (symbols: Strings = undefined, params = {}): Promise<Leverages> {
        throw new NotSupported (this.id + ' fetchLeverages() is not supported yet');
    }

    async setPositionMode (hedged: boolean, symbol: Str = undefined, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' setPositionMode() is not supported yet');
    }

    async addMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        throw new NotSupported (this.id + ' addMargin() is not supported yet');
    }

    async reduceMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        throw new NotSupported (this.id + ' reduceMargin() is not supported yet');
    }

    async setMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        throw new NotSupported (this.id + ' setMargin() is not supported yet');
    }

    async fetchLongShortRatio (symbol: string, timeframe: Str = undefined, params = {}): Promise<LongShortRatio> {
        throw new NotSupported (this.id + ' fetchLongShortRatio() is not supported yet');
    }

    async fetchLongShortRatioHistory (symbol: Str = undefined, timeframe: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LongShortRatio[]> {
        throw new NotSupported (this.id + ' fetchLongShortRatioHistory() is not supported yet');
    }

    async fetchMarginAdjustmentHistory (symbol: Str = undefined, type: Str = undefined, since: Num = undefined, limit: Num = undefined, params = {}): Promise<MarginModification[]> {
        /**
         * @method
         * @name exchange#fetchMarginAdjustmentHistory
         * @description fetches the history of margin added or reduced from contract isolated positions
         * @param {string} [symbol] unified market symbol
         * @param {string} [type] "add" or "reduce"
         * @param {int} [since] timestamp in ms of the earliest change to fetch
         * @param {int} [limit] the maximum amount of changes to fetch
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object[]} a list of [margin structures]{@link https://docs.ccxt.com/?id=margin-loan-structure}
         */
        throw new NotSupported (this.id + ' fetchMarginAdjustmentHistory() is not supported yet');
    }

    async setMarginMode (marginMode: string, symbol: Str = undefined, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' setMarginMode() is not supported yet');
    }

    async fetchDepositAddressesByNetwork (code: string, params = {}): Promise<DepositAddress[]> {
        throw new NotSupported (this.id + ' fetchDepositAddressesByNetwork() is not supported yet');
    }

    async fetchOpenInterestHistory (symbol: string, timeframe: string = '1h', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OpenInterest[]> {
        throw new NotSupported (this.id + ' fetchOpenInterestHistory() is not supported yet');
    }

    async fetchOpenInterest (symbol: string, params = {}): Promise<OpenInterest> {
        throw new NotSupported (this.id + ' fetchOpenInterest() is not supported yet');
    }

    async fetchOpenInterests (symbols: Strings = undefined, params = {}): Promise<OpenInterests> {
        throw new NotSupported (this.id + ' fetchOpenInterests() is not supported yet');
    }

    async signIn (params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' signIn() is not supported yet');
    }

    async fetchPaymentMethods (params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' fetchPaymentMethods() is not supported yet');
    }

    parseToInt (number) {
        // Solve Common parseInt misuse ex: parseInt ((since / 1000).toString ())
        // using a number as parameter which is not valid in ts
        const stringifiedNumber = this.numberToString (number);
        const convertedNumber = parseFloat (stringifiedNumber) as any;
        return parseInt (convertedNumber);
    }

    parseToNumeric (number) {
        const stringVersion = this.numberToString (number); // this will convert 1.0 and 1 to "1" and 1.1 to "1.1"
        // keep this in mind:
        // in JS:     1 === 1.0 is true
        // in Python: 1 == 1.0 is true
        // in PHP:    1 == 1.0 is true, but 1 === 1.0 is false.
        if (stringVersion.indexOf ('.') >= 0) {
            return parseFloat (stringVersion);
        }
        return parseInt (stringVersion);
    }

    isRoundNumber (value: number) {
        // this method is similar to isInteger, but this is more loyal and does not check for types.
        // i.e. isRoundNumber(1.000) returns true, while isInteger(1.000) returns false
        const res = this.parseToNumeric ((value % 1));
        return res === 0;
    }

    safeNumberOmitZero (obj: object, key: IndexType, defaultValue: Num = undefined): Num {
        const value = this.safeString (obj, key);
        const final = this.parseNumber (this.omitZero (value));
        return (final === undefined) ? defaultValue : final;
    }

    safeIntegerOmitZero (obj: object, key: IndexType, defaultValue: Int = undefined): Int {
        const timestamp = this.safeInteger (obj, key, defaultValue);
        if (timestamp === undefined || timestamp === 0) {
            return undefined;
        }
        return timestamp;
    }

    afterConstruct () {
        // networks
        this.createNetworksByIdObject ();
        this.featuresGenerator ();
        // init predefined markets if any
        if (this.markets) {
            this.setMarkets (this.markets);
        }
        // init the request rate limiter
        this.initRestRateLimiter ();
        // sanbox mode
        const isSandbox = this.safeBool2 (this.options, 'sandbox', 'testnet', false);
        if (isSandbox) {
            this.setSandboxMode (isSandbox);
        }
    }

    initRestRateLimiter () {
        if (this.rateLimit === undefined || (this.id !== undefined && this.rateLimit === -1)) {
            throw new ExchangeError (this.id + '.rateLimit property is not configured');
        }
        let refillRate = this.MAX_VALUE;
        if (this.rateLimit > 0) {
            refillRate = 1 / this.rateLimit;
        }
        const useLeaky = (this.rollingWindowSize === 0.0) || (this.rateLimiterAlgorithm === 'leakyBucket');
        const algorithm = useLeaky ? 'leakyBucket' : 'rollingWindow';
        const defaultBucket = {
            'delay': 0.001,
            'capacity': 1,
            'cost': 1,
            'refillRate': refillRate,
            'algorithm': algorithm,
            'windowSize': this.rollingWindowSize,
            'rateLimit': this.rateLimit,
        };
        const existingBucket = (this.tokenBucket === undefined) ? {} : this.tokenBucket;
        this.tokenBucket = this.extend (defaultBucket, existingBucket);
        this.initThrottler ();
    }

    featuresGenerator () {
        //
        // in the exchange-specific features can be something like this, where we support 'string' aliases too:
        //
        //     {
        //         'my' : {
        //             'createOrder' : {...},
        //         },
        //         'swap': {
        //             'linear': {
        //                 'extends': my',
        //             },
        //         },
        //     }
        //
        if (this.features === undefined) {
            return;
        }
        // reconstruct
        const initialFeatures = this.features;
        this.features = {};
        const unifiedMarketTypes = [ 'spot', 'swap', 'future', 'option' ];
        const subTypes = [ 'linear', 'inverse' ];
        // atm only support basic methods, eg: 'createOrder', 'fetchOrder', 'fetchOrders', 'fetchMyTrades'
        for (let i = 0; i < unifiedMarketTypes.length; i++) {
            const marketType = unifiedMarketTypes[i];
            // if marketType is not filled for this exchange, don't add that in `features`
            if (!(marketType in initialFeatures)) {
                this.features[marketType] = undefined;
            } else {
                if (marketType === 'spot') {
                    this.features[marketType] = this.featuresMapper (initialFeatures, marketType, undefined);
                } else {
                    this.features[marketType] = {};
                    for (let j = 0; j < subTypes.length; j++) {
                        const subType = subTypes[j];
                        this.features[marketType][subType] = this.featuresMapper (initialFeatures, marketType, subType);
                    }
                }
            }
        }
    }

    featuresMapper (initialFeatures: any, marketType: Str, subType: Str = undefined) {
        let featuresObj = (subType !== undefined) ? initialFeatures[marketType][subType] : initialFeatures[marketType];
        // if exchange does not have that market-type (eg. future>inverse)
        if (featuresObj === undefined) {
            return undefined;
        }
        const extendsStr: Str = this.safeString (featuresObj, 'extends');
        if (extendsStr !== undefined) {
            featuresObj = this.omit (featuresObj, 'extends');
            const extendObj = this.featuresMapper (initialFeatures, extendsStr);
            featuresObj = this.deepExtend (extendObj, featuresObj);
        }
        //
        // ### corrections ###
        //
        // createOrder
        if ('createOrder' in featuresObj) {
            const value = this.safeDict (featuresObj['createOrder'], 'attachedStopLossTakeProfit');
            featuresObj['createOrder']['stopLoss'] = value;
            featuresObj['createOrder']['takeProfit'] = value;
            if (marketType === 'spot') {
                // default 'hedged': false
                featuresObj['createOrder']['hedged'] = false;
                // default 'leverage': false
                if (!('leverage' in featuresObj['createOrder'])) {
                    featuresObj['createOrder']['leverage'] = false;
                }
            }
            // default 'GTC' to true
            if (this.safeBool (featuresObj['createOrder']['timeInForce'], 'GTC') === undefined) {
                featuresObj['createOrder']['timeInForce']['GTC'] = true;
            }
        }
        // other methods
        const keys = Object.keys (featuresObj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const featureBlock = featuresObj[key];
            if (!this.inArray (key, [ 'sandbox' ]) && featureBlock !== undefined) {
                // default "symbolRequired" to false to all methods (except `createOrder`)
                if (!('symbolRequired' in featureBlock)) {
                    featureBlock['symbolRequired'] = this.inArray (key, [ 'createOrder', 'createOrders', 'fetchOHLCV' ]);
                }
            }
        }
        return featuresObj;
    }

    featureValue (symbol: string, methodName: Str = undefined, paramName: Str = undefined, defaultValue: any = undefined): any {
        /**
         * @method
         * @name exchange#featureValue
         * @description this method is a very deterministic to help users to know what feature is supported by the exchange
         * @param {string} [symbol] unified symbol
         * @param {string} [methodName] view currently supported methods: https://docs.ccxt.com/#/README?id=features
         * @param {string} [paramName] unified param value, like: `triggerPrice`, `stopLoss.triggerPrice` (check docs for supported param names)
         * @param {object} [defaultValue] return default value if no result found
         * @returns {object} returns feature value
         */
        const market = this.market (symbol);
        return this.featureValueByType (market['type'], market['subType'], methodName, paramName, defaultValue);
    }

    featureValueByType (marketType: string, subType: Str, methodName: Str = undefined, paramName: Str = undefined, defaultValue: any = undefined): any {
        /**
         * @method
         * @name exchange#featureValueByType
         * @description this method is a very deterministic to help users to know what feature is supported by the exchange
         * @param {string} [marketType] supported only: "spot", "swap", "future"
         * @param {string} [subType] supported only: "linear", "inverse"
         * @param {string} [methodName] view currently supported methods: https://docs.ccxt.com/#/README?id=features
         * @param {string} [paramName] unified param value (check docs for supported param names)
         * @param {object} [defaultValue] return default value if no result found
         * @returns {object} returns feature value
         */
        // if exchange does not yet have features manually implemented
        if (this.features === undefined) {
            return defaultValue;
        }
        if (marketType === undefined) {
            return defaultValue; // marketType is required
        }
        // if marketType (e.g. 'option') does not exist in features
        if (!(marketType in this.features)) {
            return defaultValue; // unsupported marketType, check "exchange.features" for details
        }
        // if marketType dict undefined
        if (this.features[marketType] === undefined) {
            return defaultValue;
        }
        let methodsContainer = this.features[marketType];
        if (subType === undefined) {
            if (marketType !== 'spot') {
                return defaultValue; // subType is required for non-spot markets
            }
        } else {
            if (!(subType in this.features[marketType])) {
                return defaultValue; // unsupported subType, check "exchange.features" for details
            }
            // if subType dict undefined
            if (this.features[marketType][subType] === undefined) {
                return defaultValue;
            }
            methodsContainer = this.features[marketType][subType];
        }
        // if user wanted only marketType and didn't provide methodName, eg: featureIsSupported('spot')
        if (methodName === undefined) {
            return (defaultValue !== undefined) ? defaultValue : methodsContainer;
        }
        if (!(methodName in methodsContainer)) {
            return defaultValue; // unsupported method, check "exchange.features" for details');
        }
        const methodDict = methodsContainer[methodName];
        if (methodDict === undefined) {
            return defaultValue;
        }
        // if user wanted only method and didn't provide `paramName`, eg: featureIsSupported('swap', 'linear', 'createOrder')
        if (paramName === undefined) {
            return (defaultValue !== undefined) ? defaultValue : methodDict;
        }
        const splited = paramName.split ('.'); // can be only parent key (`stopLoss`) or with child (`stopLoss.triggerPrice`)
        const parentKey = splited[0];
        const subKey = this.safeString (splited, 1);
        if (!(parentKey in methodDict)) {
            return defaultValue; // unsupported paramName, check "exchange.features" for details');
        }
        const dictionary = this.safeDict (methodDict, parentKey);
        if (dictionary === undefined) {
            // if the value is not dictionary but a scalar value (or undefined), return as is
            return methodDict[parentKey];
        } else {
            // return as is, when calling without subKey eg: featureValueByType('spot', undefined, 'createOrder', 'stopLoss')
            if (subKey === undefined) {
                return methodDict[parentKey];
            }
            // throw an exception for unsupported subKey
            if (!(subKey in methodDict[parentKey])) {
                return defaultValue; // unsupported subKey, check "exchange.features" for details
            }
            return methodDict[parentKey][subKey];
        }
    }

    orderbookChecksumMessage (symbol:Str) {
        return symbol + ' : ' + 'orderbook data checksum validation failed. You can reconnect by calling watchOrderBook again or you can mute the error by setting exchange.options["watchOrderBook"]["checksum"] = false';
    }

    createNetworksByIdObject () {
        // automatically generate network-id-to-code mappings
        const networkIdsToCodesGenerated = this.invertFlatStringDictionary (this.safeValue (this.options, 'networks', {})); // invert defined networks dictionary
        this.options['networksById'] = this.extend (networkIdsToCodesGenerated, this.safeValue (this.options, 'networksById', {})); // support manually overriden "networksById" dictionary too
    }

    getDefaultOptions () {
        return {
            'defaultNetworkCodeReplacements': {
                'ETH': { 'ERC20': 'ETH' },
                'TRX': { 'TRC20': 'TRX' },
                'CRO': { 'CRC20': 'CRONOS' },
                'BRC20': { 'BRC20': 'BTC' },
            },
        };
    }

    safeLedgerEntry (entry: object, currency: Currency = undefined) {
        currency = this.safeCurrency (undefined, currency);
        let direction = this.safeString (entry, 'direction');
        let before = this.safeString (entry, 'before');
        let after = this.safeString (entry, 'after');
        const amount = this.safeString (entry, 'amount');
        if (amount !== undefined) {
            if (before === undefined && after !== undefined) {
                before = Precise.stringSub (after, amount);
            } else if (before !== undefined && after === undefined) {
                after = Precise.stringAdd (before, amount);
            }
        }
        if (before !== undefined && after !== undefined) {
            if (direction === undefined) {
                if (Precise.stringGt (before, after)) {
                    direction = 'out';
                }
                if (Precise.stringGt (after, before)) {
                    direction = 'in';
                }
            }
        }
        const fee = this.safeValue (entry, 'fee');
        if (fee !== undefined) {
            fee['cost'] = this.safeNumber (fee, 'cost');
        }
        const timestamp = this.safeInteger (entry, 'timestamp');
        const info = this.safeDict (entry, 'info', {});
        return {
            'id': this.safeString (entry, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': direction,
            'account': this.safeString (entry, 'account'),
            'referenceId': this.safeString (entry, 'referenceId'),
            'referenceAccount': this.safeString (entry, 'referenceAccount'),
            'type': this.safeString (entry, 'type'),
            'currency': currency['code'],
            'amount': this.parseNumber (amount),
            'before': this.parseNumber (before),
            'after': this.parseNumber (after),
            'status': this.safeString (entry, 'status'),
            'fee': fee,
            'info': info,
        };
    }

    safeCurrencyStructure (currency: object): CurrencyInterface {
        // derive data from networks: deposit, withdraw, active, fee, limits, precision
        const networks = this.safeDict (currency, 'networks', {});
        const keys = Object.keys (networks);
        const length = keys.length;
        if (length !== 0) {
            for (let i = 0; i < length; i++) {
                const key = keys[i];
                const network = networks[key];
                const deposit = this.safeBool (network, 'deposit');
                const currencyDeposit = this.safeBool (currency, 'deposit');
                if (currencyDeposit === undefined || deposit) {
                    currency['deposit'] = deposit;
                }
                const withdraw = this.safeBool (network, 'withdraw');
                const currencyWithdraw = this.safeBool (currency, 'withdraw');
                if (currencyWithdraw === undefined || withdraw) {
                    currency['withdraw'] = withdraw;
                }
                // set network 'active' to false if D or W is disabled
                let active = this.safeBool (network, 'active');
                if (active === undefined) {
                    if (deposit && withdraw) {
                        currency['networks'][key]['active'] = true;
                    } else if (deposit !== undefined && withdraw !== undefined) {
                        currency['networks'][key]['active'] = false;
                    }
                }
                active = this.safeBool (currency['networks'][key], 'active'); // dict might have been updated on above lines, so access directly instead of `network` variable
                const currencyActive = this.safeBool (currency, 'active');
                if (currencyActive === undefined || active) {
                    currency['active'] = active;
                }
                // find lowest fee (which is more desired)
                const fee = this.safeString (network, 'fee');
                const feeMain = this.safeString (currency, 'fee');
                if (feeMain === undefined || Precise.stringLt (fee, feeMain)) {
                    currency['fee'] = this.parseNumber (fee);
                }
                // find lowest precision (which is more desired)
                const precision = this.safeString (network, 'precision');
                const precisionMain = this.safeString (currency, 'precision');
                if (precisionMain === undefined || Precise.stringGt (precision, precisionMain)) {
                    currency['precision'] = this.parseNumber (precision);
                }
                // limits
                const limits = this.safeDict (network, 'limits');
                const limitsMain = this.safeDict (currency, 'limits');
                if (limitsMain === undefined) {
                    currency['limits'] = {};
                }
                // deposits
                const limitsDeposit = this.safeDict (limits, 'deposit');
                const limitsDepositMain = this.safeDict (limitsMain, 'deposit');
                if (limitsDepositMain === undefined) {
                    currency['limits']['deposit'] = {};
                }
                const limitsDepositMin = this.safeString (limitsDeposit, 'min');
                const limitsDepositMax = this.safeString (limitsDeposit, 'max');
                const limitsDepositMinMain = this.safeString (limitsDepositMain, 'min');
                const limitsDepositMaxMain = this.safeString (limitsDepositMain, 'max');
                // find min
                if (limitsDepositMinMain === undefined || Precise.stringLt (limitsDepositMin, limitsDepositMinMain)) {
                    currency['limits']['deposit']['min'] = this.parseNumber (limitsDepositMin);
                }
                // find max
                if (limitsDepositMaxMain === undefined || Precise.stringGt (limitsDepositMax, limitsDepositMaxMain)) {
                    currency['limits']['deposit']['max'] = this.parseNumber (limitsDepositMax);
                }
                // withdrawals
                const limitsWithdraw = this.safeDict (limits, 'withdraw');
                const limitsWithdrawMain = this.safeDict (limitsMain, 'withdraw');
                if (limitsWithdrawMain === undefined) {
                    currency['limits']['withdraw'] = {};
                }
                const limitsWithdrawMin = this.safeString (limitsWithdraw, 'min');
                const limitsWithdrawMax = this.safeString (limitsWithdraw, 'max');
                const limitsWithdrawMinMain = this.safeString (limitsWithdrawMain, 'min');
                const limitsWithdrawMaxMain = this.safeString (limitsWithdrawMain, 'max');
                // find min
                if (limitsWithdrawMinMain === undefined || Precise.stringLt (limitsWithdrawMin, limitsWithdrawMinMain)) {
                    currency['limits']['withdraw']['min'] = this.parseNumber (limitsWithdrawMin);
                }
                // find max
                if (limitsWithdrawMaxMain === undefined || Precise.stringGt (limitsWithdrawMax, limitsWithdrawMaxMain)) {
                    currency['limits']['withdraw']['max'] = this.parseNumber (limitsWithdrawMax);
                }
            }
        }
        return this.extend ({
            'info': undefined,
            'id': undefined,
            'numericId': undefined,
            'code': undefined,
            'precision': undefined,
            'type': undefined,
            'name': undefined,
            'active': undefined,
            'deposit': undefined,
            'withdraw': undefined,
            'fee': undefined,
            'fees': {},
            'networks': {},
            'limits': {
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
            },
        }, currency);
    }

    safeMarketStructure (market: Dict = undefined): MarketInterface {
        const cleanStructure = {
            'id': undefined,
            'lowercaseId': undefined,
            'symbol': undefined,
            'base': undefined,
            'quote': undefined,
            'settle': undefined,
            'baseId': undefined,
            'quoteId': undefined,
            'settleId': undefined,
            'type': undefined,
            'spot': undefined,
            'margin': undefined,
            'swap': undefined,
            'future': undefined,
            'option': undefined,
            'index': undefined,
            'active': undefined,
            'contract': undefined,
            'linear': undefined,
            'inverse': undefined,
            'subType': undefined,
            'taker': undefined,
            'maker': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': undefined,
                'price': undefined,
                'cost': undefined,
                'base': undefined,
                'quote': undefined,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'marginModes': {
                'cross': undefined,
                'isolated': undefined,
            },
            'created': undefined,
            'info': undefined,
        };
        if (market !== undefined) {
            const result = this.extend (cleanStructure, market);
            // set undefined swap/future/etc
            if (result['spot']) {
                if (result['contract'] === undefined) {
                    result['contract'] = false;
                }
                if (result['swap'] === undefined) {
                    result['swap'] = false;
                }
                if (result['future'] === undefined) {
                    result['future'] = false;
                }
                if (result['option'] === undefined) {
                    result['option'] = false;
                }
                if (result['index'] === undefined) {
                    result['index'] = false;
                }
            }
            return result;
        }
        return cleanStructure;
    }

    setMarkets (markets, currencies = undefined) {
        const values = [];
        this.markets_by_id = this.createSafeDictionary ();
        // handle marketId conflicts
        // we insert spot markets first
        const marketValues = this.sortBy (this.toArray (markets), 'spot', true, true);
        for (let i = 0; i < marketValues.length; i++) {
            const value = marketValues[i];
            if (value['id'] in this.markets_by_id) {
                const marketsByIdArray = (this.markets_by_id[value['id']] as any);
                marketsByIdArray.push (value);
                this.markets_by_id[value['id']] = marketsByIdArray;
            } else {
                this.markets_by_id[value['id']] = [ value ] as any;
            }
            const market = this.deepExtend (this.safeMarketStructure (), {
                'precision': this.precision,
                'limits': this.limits,
            }, this.fees['trading'], value);
            if (market['linear']) {
                market['subType'] = 'linear';
            } else if (market['inverse']) {
                market['subType'] = 'inverse';
            } else {
                market['subType'] = undefined;
            }
            values.push (market);
        }
        this.markets = this.mapToSafeMap (this.indexBy (values, 'symbol') as any);
        const marketsSortedBySymbol = this.keysort (this.markets);
        const marketsSortedById = this.keysort (this.markets_by_id);
        this.symbols = Object.keys (marketsSortedBySymbol);
        this.ids = Object.keys (marketsSortedById);
        let numCurrencies = 0;
        if (currencies !== undefined) {
            const keys = Object.keys (currencies);
            numCurrencies = keys.length;
        }
        if (numCurrencies > 0) {
            // currencies is always undefined when called in constructor but not when called from loadMarkets
            this.currencies = this.mapToSafeMap (this.deepExtend (this.currencies, currencies));
        } else {
            let baseCurrencies = [];
            let quoteCurrencies = [];
            for (let i = 0; i < values.length; i++) {
                const market = values[i];
                const defaultCurrencyPrecision = (this.precisionMode === DECIMAL_PLACES) ? 8 : this.parseNumber ('1e-8');
                const marketPrecision = this.safeDict (market, 'precision', {});
                if ('base' in market) {
                    const currency = this.safeCurrencyStructure ({
                        'id': this.safeString2 (market, 'baseId', 'base'),
                        'numericId': this.safeInteger (market, 'baseNumericId'),
                        'code': this.safeString (market, 'base'),
                        'precision': this.safeValue2 (marketPrecision, 'base', 'amount', defaultCurrencyPrecision),
                    });
                    baseCurrencies.push (currency);
                }
                if ('quote' in market) {
                    const currency = this.safeCurrencyStructure ({
                        'id': this.safeString2 (market, 'quoteId', 'quote'),
                        'numericId': this.safeInteger (market, 'quoteNumericId'),
                        'code': this.safeString (market, 'quote'),
                        'precision': this.safeValue2 (marketPrecision, 'quote', 'price', defaultCurrencyPrecision),
                    });
                    quoteCurrencies.push (currency);
                }
            }
            baseCurrencies = this.sortBy (baseCurrencies, 'code', false, '');
            quoteCurrencies = this.sortBy (quoteCurrencies, 'code', false, '');
            this.baseCurrencies = this.mapToSafeMap (this.indexBy (baseCurrencies, 'code'));
            this.quoteCurrencies = this.mapToSafeMap (this.indexBy (quoteCurrencies, 'code'));
            const allCurrencies = this.arrayConcat (baseCurrencies, quoteCurrencies);
            const groupedCurrencies = this.groupBy (allCurrencies, 'code');
            const codes = Object.keys (groupedCurrencies);
            const resultingCurrencies = [];
            for (let i = 0; i < codes.length; i++) {
                const code = codes[i];
                const groupedCurrenciesCode = this.safeList (groupedCurrencies, code, []);
                let highestPrecisionCurrency = this.safeValue (groupedCurrenciesCode, 0);
                for (let j = 1; j < groupedCurrenciesCode.length; j++) {
                    const currentCurrency = groupedCurrenciesCode[j];
                    if (this.precisionMode === TICK_SIZE) {
                        highestPrecisionCurrency = (currentCurrency['precision'] < highestPrecisionCurrency['precision']) ? currentCurrency : highestPrecisionCurrency;
                    } else {
                        highestPrecisionCurrency = (currentCurrency['precision'] > highestPrecisionCurrency['precision']) ? currentCurrency : highestPrecisionCurrency;
                    }
                }
                resultingCurrencies.push (highestPrecisionCurrency);
            }
            const sortedCurrencies = this.sortBy (resultingCurrencies, 'code');
            this.currencies = this.mapToSafeMap (this.deepExtend (this.currencies, this.indexBy (sortedCurrencies, 'code')));
        }
        this.currencies_by_id = this.indexBySafe (this.currencies, 'id');
        const currenciesSortedByCode = this.keysort (this.currencies);
        this.codes = Object.keys (currenciesSortedByCode);
        return this.markets;
    }

    setMarketsFromExchange (sourceExchange) {
        // Validate that both exchanges are of the same type
        if (this.id !== sourceExchange.id) {
            throw new ArgumentsRequired (this.id + ' shareMarkets() can only share markets with exchanges of the same type (got ' + sourceExchange['id'] + ')');
        }
        // Validate that source exchange has loaded markets
        if (!sourceExchange.markets) {
            throw new ExchangeError ('setMarketsFromExchange() source exchange must have loaded markets first. Can call by using loadMarkets function');
        }
        // Set all market-related data
        this.markets = sourceExchange.markets;
        this.markets_by_id = sourceExchange.markets_by_id;
        this.symbols = sourceExchange.symbols;
        this.ids = sourceExchange.ids;
        this.currencies = sourceExchange.currencies;
        this.currencies_by_id = sourceExchange.currencies_by_id;
        this.baseCurrencies = sourceExchange.baseCurrencies;
        this.quoteCurrencies = sourceExchange.quoteCurrencies;
        this.codes = sourceExchange.codes;
        // check marketHelperProps
        const sourceExchangeHelpers = this.safeList (sourceExchange.options, 'marketHelperProps', []);
        for (let i = 0; i < sourceExchangeHelpers.length; i++) {
            const helper = sourceExchangeHelpers[i];
            if (sourceExchange.options[helper] !== undefined) {
                this.options[helper] = sourceExchange.options[helper];
            }
        }
        return this;
    }

    getDescribeForExtendedWsExchange (currentRestInstance: any, parentRestInstance: any, wsBaseDescribe: Dictionary<any>) {
        const extendedRestDescribe = this.deepExtend (parentRestInstance.describe (), currentRestInstance.describe ());
        const superWithRestDescribe = this.deepExtend (extendedRestDescribe, wsBaseDescribe);
        return superWithRestDescribe;
    }

    safeBalance (balance: Dict): Balances {
        const balances = this.omit (balance, [ 'info', 'timestamp', 'datetime', 'free', 'used', 'total' ]);
        const codes = Object.keys (balances);
        balance['free'] = {};
        balance['used'] = {};
        balance['total'] = {};
        const debtBalance = {};
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            let total = this.safeString (balance[code], 'total');
            let free = this.safeString (balance[code], 'free');
            let used = this.safeString (balance[code], 'used');
            const debt = this.safeString (balance[code], 'debt');
            if ((total === undefined) && (free !== undefined) && (used !== undefined)) {
                total = Precise.stringAdd (free, used);
            }
            if ((free === undefined) && (total !== undefined) && (used !== undefined)) {
                free = Precise.stringSub (total, used);
            }
            if ((used === undefined) && (total !== undefined) && (free !== undefined)) {
                used = Precise.stringSub (total, free);
            }
            balance[code]['free'] = this.parseNumber (free);
            balance[code]['used'] = this.parseNumber (used);
            balance[code]['total'] = this.parseNumber (total);
            balance['free'][code] = balance[code]['free'];
            balance['used'][code] = balance[code]['used'];
            balance['total'][code] = balance[code]['total'];
            if (debt !== undefined) {
                balance[code]['debt'] = this.parseNumber (debt);
                debtBalance[code] = balance[code]['debt'];
            }
        }
        const debtBalanceArray = Object.keys (debtBalance);
        const length = debtBalanceArray.length;
        if (length) {
            balance['debt'] = debtBalance;
        }
        return balance as any;
    }

    safeOrder (order: Dict, market: Market = undefined): Order {
        // parses numbers as strings
        // * it is important pass the trades as unparsed rawTrades
        let amount = this.omitZero (this.safeString (order, 'amount'));
        let remaining = this.safeString (order, 'remaining');
        let filled = this.safeString (order, 'filled');
        let cost = this.safeString (order, 'cost');
        let average = this.omitZero (this.safeString (order, 'average'));
        let price = this.omitZero (this.safeString (order, 'price'));
        let lastTradeTimeTimestamp = this.safeInteger (order, 'lastTradeTimestamp');
        let symbol = this.safeString (order, 'symbol');
        let side = this.safeString (order, 'side');
        const status = this.safeString (order, 'status');
        const parseFilled = (filled === undefined);
        const parseCost = (cost === undefined);
        const parseLastTradeTimeTimestamp = (lastTradeTimeTimestamp === undefined);
        const fee = this.safeValue (order, 'fee');
        const parseFee = (fee === undefined);
        const parseFees = this.safeValue (order, 'fees') === undefined;
        const parseSymbol = symbol === undefined;
        const parseSide = side === undefined;
        const shouldParseFees = parseFee || parseFees;
        const fees = this.safeList (order, 'fees', []);
        let trades = [];
        const isTriggerOrSLTpOrder = ((this.safeString (order, 'triggerPrice') !== undefined || (this.safeString (order, 'stopLossPrice') !== undefined)) || (this.safeString (order, 'takeProfitPrice') !== undefined));
        if (parseFilled || parseCost || shouldParseFees) {
            const rawTrades = this.safeValue (order, 'trades', trades);
            // const oldNumber = this.number;
            // we parse trades as strings here!
            // i don't think this is needed anymore
            // (this as any).number = String;
            const firstTrade = this.safeValue (rawTrades, 0);
            // parse trades if they haven't already been parsed
            const tradesAreParsed = ((firstTrade !== undefined) && ('info' in firstTrade) && ('id' in firstTrade));
            if (!tradesAreParsed) {
                trades = this.parseTrades (rawTrades, market);
            } else {
                trades = rawTrades;
            }
            // this.number = oldNumber; why parse trades as strings if you read the value using `safeString` ?
            let tradesLength = 0;
            const isArray = Array.isArray (trades);
            if (isArray) {
                tradesLength = trades.length;
            }
            if (isArray && (tradesLength > 0)) {
                // move properties that are defined in trades up into the order
                if (order['symbol'] === undefined) {
                    order['symbol'] = trades[0]['symbol'];
                }
                if (order['side'] === undefined) {
                    order['side'] = trades[0]['side'];
                }
                if (order['type'] === undefined) {
                    order['type'] = trades[0]['type'];
                }
                if (order['id'] === undefined) {
                    order['id'] = trades[0]['order'];
                }
                if (parseFilled) {
                    filled = '0';
                }
                if (parseCost) {
                    cost = '0';
                }
                for (let i = 0; i < trades.length; i++) {
                    const trade = trades[i];
                    const tradeAmount = this.safeString (trade, 'amount');
                    if (parseFilled && (tradeAmount !== undefined)) {
                        filled = Precise.stringAdd (filled, tradeAmount);
                    }
                    const tradeCost = this.safeString (trade, 'cost');
                    if (parseCost && (tradeCost !== undefined)) {
                        cost = Precise.stringAdd (cost, tradeCost);
                    }
                    if (parseSymbol) {
                        symbol = this.safeString (trade, 'symbol');
                    }
                    if (parseSide) {
                        side = this.safeString (trade, 'side');
                    }
                    const tradeTimestamp = this.safeValue (trade, 'timestamp');
                    if (parseLastTradeTimeTimestamp && (tradeTimestamp !== undefined)) {
                        if (lastTradeTimeTimestamp === undefined) {
                            lastTradeTimeTimestamp = tradeTimestamp;
                        } else {
                            lastTradeTimeTimestamp = Math.max (lastTradeTimeTimestamp, tradeTimestamp);
                        }
                    }
                    if (shouldParseFees) {
                        const tradeFees = this.safeValue (trade, 'fees');
                        if (tradeFees !== undefined) {
                            for (let j = 0; j < tradeFees.length; j++) {
                                const tradeFee = tradeFees[j];
                                fees.push (this.extend ({}, tradeFee));
                            }
                        } else {
                            const tradeFee = this.safeValue (trade, 'fee');
                            if (tradeFee !== undefined) {
                                fees.push (this.extend ({}, tradeFee));
                            }
                        }
                    }
                }
            }
        }
        if (shouldParseFees) {
            const reducedFees = this.reduceFees ? this.reduceFeesByCurrency (fees) : fees;
            const reducedLength = reducedFees.length;
            for (let i = 0; i < reducedLength; i++) {
                reducedFees[i]['cost'] = this.safeNumber (reducedFees[i], 'cost');
                if ('rate' in reducedFees[i]) {
                    reducedFees[i]['rate'] = this.safeNumber (reducedFees[i], 'rate');
                }
            }
            if (!parseFee && (reducedLength === 0)) {
                // copy fee to avoid modification by reference
                const feeCopy = this.deepExtend (fee);
                feeCopy['cost'] = this.safeNumber (feeCopy, 'cost');
                if ('rate' in feeCopy) {
                    feeCopy['rate'] = this.safeNumber (feeCopy, 'rate');
                }
                reducedFees.push (feeCopy);
            }
            order['fees'] = reducedFees;
            if (parseFee && (reducedLength === 1)) {
                order['fee'] = reducedFees[0];
            }
        }
        if (amount === undefined) {
            // ensure amount = filled + remaining
            if (filled !== undefined && remaining !== undefined) {
                amount = Precise.stringAdd (filled, remaining);
            } else if (status === 'closed') {
                amount = filled;
            }
        }
        if (filled === undefined) {
            if (amount !== undefined && remaining !== undefined) {
                filled = Precise.stringSub (amount, remaining);
            } else if (status === 'closed' && amount !== undefined) {
                filled = amount;
            }
        }
        if (remaining === undefined) {
            if (amount !== undefined && filled !== undefined) {
                remaining = Precise.stringSub (amount, filled);
            } else if (status === 'closed') {
                remaining = '0';
            }
        }
        // ensure that the average field is calculated correctly
        const inverse = this.safeBool (market, 'inverse', false);
        const contractSize = this.numberToString (this.safeValue (market, 'contractSize', 1));
        // inverse
        // price = filled * contract size / cost
        //
        // linear
        // price = cost / (filled * contract size)
        if (average === undefined) {
            if ((filled !== undefined) && (cost !== undefined) && Precise.stringGt (filled, '0')) {
                const filledTimesContractSize = Precise.stringMul (filled, contractSize);
                if (inverse) {
                    average = Precise.stringDiv (filledTimesContractSize, cost);
                } else {
                    average = Precise.stringDiv (cost, filledTimesContractSize);
                }
            }
        }
        // similarly
        // inverse
        // cost = filled * contract size / price
        //
        // linear
        // cost = filled * contract size * price
        const costPriceExists = (average !== undefined) || (price !== undefined);
        if (parseCost && (filled !== undefined) && costPriceExists) {
            let multiplyPrice = undefined;
            if (average === undefined) {
                multiplyPrice = price;
            } else {
                multiplyPrice = average;
            }
            // contract trading
            const filledTimesContractSize = Precise.stringMul (filled, contractSize);
            if (inverse) {
                cost = Precise.stringDiv (filledTimesContractSize, multiplyPrice);
            } else {
                cost = Precise.stringMul (filledTimesContractSize, multiplyPrice);
            }
        }
        // support for market orders
        const orderType = this.safeValue (order, 'type');
        const emptyPrice = (price === undefined) || Precise.stringEquals (price, '0');
        if (emptyPrice && (orderType === 'market')) {
            price = average;
        }
        // we have trades with string values at this point so we will mutate them
        for (let i = 0; i < trades.length; i++) {
            const entry = trades[i];
            entry['amount'] = this.safeNumber (entry, 'amount');
            entry['price'] = this.safeNumber (entry, 'price');
            entry['cost'] = this.safeNumber (entry, 'cost');
            const tradeFee = this.safeDict (entry, 'fee', {});
            tradeFee['cost'] = this.safeNumber (tradeFee, 'cost');
            if ('rate' in tradeFee) {
                tradeFee['rate'] = this.safeNumber (tradeFee, 'rate');
            }
            const entryFees = this.safeList (entry, 'fees', []);
            for (let j = 0; j < entryFees.length; j++) {
                entryFees[j]['cost'] = this.safeNumber (entryFees[j], 'cost');
            }
            entry['fees'] = entryFees;
            entry['fee'] = tradeFee;
        }
        let timeInForce = this.safeString (order, 'timeInForce');
        let postOnly = this.safeValue (order, 'postOnly');
        // timeInForceHandling
        if (timeInForce === undefined) {
            if (!isTriggerOrSLTpOrder && (this.safeString (order, 'type') === 'market')) {
                timeInForce = 'IOC';
            }
            // allow postOnly override
            if (postOnly) {
                timeInForce = 'PO';
            }
        } else if (postOnly === undefined) {
            // timeInForce is not undefined here
            postOnly = timeInForce === 'PO';
        }
        const timestamp = this.safeInteger (order, 'timestamp');
        const lastUpdateTimestamp = this.safeInteger (order, 'lastUpdateTimestamp');
        let datetime = this.safeString (order, 'datetime');
        if (datetime === undefined) {
            datetime = this.iso8601 (timestamp);
        }
        const triggerPrice = this.parseNumber (this.safeString2 (order, 'triggerPrice', 'stopPrice'));
        const takeProfitPrice = this.parseNumber (this.safeString (order, 'takeProfitPrice'));
        const stopLossPrice = this.parseNumber (this.safeString (order, 'stopLossPrice'));
        return this.extend (order, {
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'type': this.safeString (order, 'type'),
            'side': side,
            'lastTradeTimestamp': lastTradeTimeTimestamp,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'price': this.parseNumber (price),
            'amount': this.parseNumber (amount),
            'cost': this.parseNumber (cost),
            'average': this.parseNumber (average),
            'filled': this.parseNumber (filled),
            'remaining': this.parseNumber (remaining),
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'trades': trades,
            'reduceOnly': this.safeValue (order, 'reduceOnly'),
            'stopPrice': triggerPrice,  // ! deprecated, use triggerPrice instead
            'triggerPrice': triggerPrice,
            'takeProfitPrice': takeProfitPrice,
            'stopLossPrice': stopLossPrice,
            'status': status,
            'fee': this.safeValue (order, 'fee'),
        });
    }

    parseOrders (orders: object, market: Market = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Order[] {
        //
        // the value of orders is either a dict or a list
        //
        // dict
        //
        //     {
        //         'id1': { ... },
        //         'id2': { ... },
        //         'id3': { ... },
        //         ...
        //     }
        //
        // list
        //
        //     [
        //         { 'id': 'id1', ... },
        //         { 'id': 'id2', ... },
        //         { 'id': 'id3', ... },
        //         ...
        //     ]
        //
        let results = [];
        if (Array.isArray (orders)) {
            for (let i = 0; i < orders.length; i++) {
                const parsed = this.parseOrder (orders[i], market); // don't inline this call
                const order = this.extend (parsed, params);
                results.push (order);
            }
        } else {
            const ids = Object.keys (orders);
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                const idExtended = this.extend ({ 'id': id }, orders[id]);
                const parsedOrder = this.parseOrder (idExtended, market); // don't  inline these calls
                const order = this.extend (parsedOrder, params);
                results.push (order);
            }
        }
        results = this.sortBy (results, 'timestamp');
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        return this.filterBySymbolSinceLimit (results, symbol, since, limit) as Order[];
    }

    calculateFeeWithRate (symbol: string, type: string, side: string, amount: number, price: number, takerOrMaker = 'taker', feeRate: Num = undefined, params = {}) {
        if (type === 'market' && takerOrMaker === 'maker') {
            throw new ArgumentsRequired (this.id + ' calculateFee() - you have provided incompatible arguments - "market" type order can not be "maker". Change either the "type" or the "takerOrMaker" argument to calculate the fee.');
        }
        const market = this.markets[symbol];
        const feeSide = this.safeString (market, 'feeSide', 'quote');
        let useQuote = undefined;
        if (feeSide === 'get') {
            // the fee is always in the currency you get
            useQuote = side === 'sell';
        } else if (feeSide === 'give') {
            // the fee is always in the currency you give
            useQuote = side === 'buy';
        } else {
            // the fee is always in feeSide currency
            useQuote = feeSide === 'quote';
        }
        let cost = this.numberToString (amount);
        let key = undefined;
        if (useQuote) {
            const priceString = this.numberToString (price);
            cost = Precise.stringMul (cost, priceString);
            key = 'quote';
        } else {
            key = 'base';
        }
        // for derivatives, the fee is in 'settle' currency
        if (!market['spot']) {
            key = 'settle';
        }
        // even if `takerOrMaker` argument was set to 'maker', for 'market' orders we should forcefully override it to 'taker'
        if (type === 'market') {
            takerOrMaker = 'taker';
        }
        const rate = (feeRate !== undefined) ? this.numberToString (feeRate) : this.safeString (market, takerOrMaker);
        cost = Precise.stringMul (cost, rate);
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': this.parseNumber (rate),
            'cost': this.parseNumber (cost),
        };
    }

    calculateFee (symbol: string, type: string, side: string, amount: number, price: number, takerOrMaker = 'taker', params = {}) {
        /**
         * @method
         * @description calculates the presumptive fee that would be charged for an order
         * @param {string} symbol unified market symbol
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade, in units of the base currency on most exchanges, or number of contracts
         * @param {float} price the price for the order to be filled at, in units of the quote currency
         * @param {string} takerOrMaker 'taker' or 'maker'
         * @param {object} params
         * @returns {object} contains the rate, the percentage multiplied to the order amount to obtain the fee amount, and cost, the total value of the fee in units of the quote currency, for the order
         */
        return this.calculateFeeWithRate (symbol, type, side, amount, price, takerOrMaker, undefined, params);
    }

    safeLiquidation (liquidation: Dict, market: Market = undefined): Liquidation {
        const contracts = this.safeString (liquidation, 'contracts');
        const contractSize = this.safeString (market, 'contractSize');
        const price = this.safeString (liquidation, 'price');
        let baseValue = this.safeString (liquidation, 'baseValue');
        let quoteValue = this.safeString (liquidation, 'quoteValue');
        if ((baseValue === undefined) && (contracts !== undefined) && (contractSize !== undefined) && (price !== undefined)) {
            baseValue = Precise.stringMul (contracts, contractSize);
        }
        if ((quoteValue === undefined) && (baseValue !== undefined) && (price !== undefined)) {
            quoteValue = Precise.stringMul (baseValue, price);
        }
        liquidation['contracts'] = this.parseNumber (contracts);
        liquidation['contractSize'] = this.parseNumber (contractSize);
        liquidation['price'] = this.parseNumber (price);
        liquidation['baseValue'] = this.parseNumber (baseValue);
        liquidation['quoteValue'] = this.parseNumber (quoteValue);
        return liquidation as Liquidation;
    }

    safeTrade (trade: Dict, market: Market = undefined): Trade {
        const amount = this.safeString (trade, 'amount');
        const price = this.safeString (trade, 'price');
        let cost = this.safeString (trade, 'cost');
        if (cost === undefined) {
            // contract trading
            const contractSize = this.safeString (market, 'contractSize');
            let multiplyPrice = price;
            if (contractSize !== undefined) {
                const inverse = this.safeBool (market, 'inverse', false);
                if (inverse) {
                    multiplyPrice = Precise.stringDiv ('1', price);
                }
                multiplyPrice = Precise.stringMul (multiplyPrice, contractSize);
            }
            cost = Precise.stringMul (multiplyPrice, amount);
        }
        const [ resultFee, resultFees ] = this.parsedFeeAndFees (trade);
        trade['fee'] = resultFee;
        trade['fees'] = resultFees;
        trade['amount'] = this.parseNumber (amount);
        trade['price'] = this.parseNumber (price);
        trade['cost'] = this.parseNumber (cost);
        return trade as Trade;
    }

    createCcxtTradeId (timestamp = undefined, side = undefined, amount = undefined, price = undefined, takerOrMaker = undefined) {
        // this approach is being used by multiple exchanges (mexc, woo, coinsbit, dydx, ...)
        let id = undefined;
        if (timestamp !== undefined) {
            id = this.numberToString (timestamp);
            if (side !== undefined) {
                id += '-' + side;
            }
            if (amount !== undefined) {
                id += '-' + this.numberToString (amount);
            }
            if (price !== undefined) {
                id += '-' + this.numberToString (price);
            }
            if (takerOrMaker !== undefined) {
                id += '-' + takerOrMaker;
            }
        }
        return id;
    }

    parsedFeeAndFees (container:any) {
        let fee = this.safeDict (container, 'fee');
        let fees = this.safeList (container, 'fees');
        const feeDefined = fee !== undefined;
        const feesDefined = fees !== undefined;
        // parsing only if at least one of them is defined
        const shouldParseFees = (feeDefined || feesDefined);
        if (shouldParseFees) {
            if (feeDefined) {
                fee = this.parseFeeNumeric (fee);
            }
            if (!feesDefined) {
                // just set it directly, no further processing needed.
                fees = [ fee ];
            }
            // 'fees' were set, so reparse them
            const reducedFees = this.reduceFees ? this.reduceFeesByCurrency (fees) : fees;
            const reducedLength = reducedFees.length;
            for (let i = 0; i < reducedLength; i++) {
                reducedFees[i] = this.parseFeeNumeric (reducedFees[i]);
            }
            fees = reducedFees;
            if (reducedLength === 1) {
                fee = reducedFees[0];
            } else if (reducedLength === 0) {
                fee = undefined;
            }
        }
        // in case `fee & fees` are undefined, set `fees` as empty array
        if (fee === undefined) {
            fee = {
                'cost': undefined,
                'currency': undefined,
            };
        }
        if (fees === undefined) {
            fees = [];
        }
        return [ fee, fees ];
    }

    parseFeeNumeric (fee: any) {
        fee['cost'] = this.safeNumber (fee, 'cost'); // ensure numeric
        if ('rate' in fee) {
            fee['rate'] = this.safeNumber (fee, 'rate');
        }
        return fee;
    }

    findNearestCeiling (arr: number[], providedValue: number) {
        //  i.e. findNearestCeiling ([ 10, 30, 50],  23) returns 30
        const length = arr.length;
        for (let i = 0; i < length; i++) {
            const current = arr[i];
            if (providedValue <= current) {
                return current;
            }
        }
        return arr[length - 1];
    }

    invertFlatStringDictionary (dict) {
        const reversed = {};
        const keys = Object.keys (dict);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = dict[key];
            if (typeof value === 'string') {
                reversed[value] = key;
            }
        }
        return reversed;
    }

    reduceFeesByCurrency (fees) {
        //
        // this function takes a list of fee structures having the following format
        //
        //     string = true
        //
        //     [
        //         { 'currency': 'BTC', 'cost': '0.1' },
        //         { 'currency': 'BTC', 'cost': '0.2'  },
        //         { 'currency': 'BTC', 'cost': '0.2', 'rate': '0.00123' },
        //         { 'currency': 'BTC', 'cost': '0.4', 'rate': '0.00123' },
        //         { 'currency': 'BTC', 'cost': '0.5', 'rate': '0.00456' },
        //         { 'currency': 'USDT', 'cost': '12.3456' },
        //     ]
        //
        //     string = false
        //
        //     [
        //         { 'currency': 'BTC', 'cost': 0.1 },
        //         { 'currency': 'BTC', 'cost': 0.2 },
        //         { 'currency': 'BTC', 'cost': 0.2, 'rate': 0.00123 },
        //         { 'currency': 'BTC', 'cost': 0.4, 'rate': 0.00123 },
        //         { 'currency': 'BTC', 'cost': 0.5, 'rate': 0.00456 },
        //         { 'currency': 'USDT', 'cost': 12.3456 },
        //     ]
        //
        // and returns a reduced fee list, where fees are summed per currency and rate (if any)
        //
        //     string = true
        //
        //     [
        //         { 'currency': 'BTC', 'cost': '0.4'  },
        //         { 'currency': 'BTC', 'cost': '0.6', 'rate': '0.00123' },
        //         { 'currency': 'BTC', 'cost': '0.5', 'rate': '0.00456' },
        //         { 'currency': 'USDT', 'cost': '12.3456' },
        //     ]
        //
        //     string  = false
        //
        //     [
        //         { 'currency': 'BTC', 'cost': 0.3  },
        //         { 'currency': 'BTC', 'cost': 0.6, 'rate': 0.00123 },
        //         { 'currency': 'BTC', 'cost': 0.5, 'rate': 0.00456 },
        //         { 'currency': 'USDT', 'cost': 12.3456 },
        //     ]
        //
        const reduced = {};
        for (let i = 0; i < fees.length; i++) {
            const fee = fees[i];
            const code = this.safeString (fee, 'currency');
            const feeCurrencyCode = (code !== undefined) ? code : i.toString ();
            if (feeCurrencyCode !== undefined) {
                const rate = this.safeString (fee, 'rate');
                const cost = this.safeString (fee, 'cost');
                if (cost === undefined) {
                    // omit undefined cost, as it does not make sense, however, don't omit '0' costs, as they still make sense
                    continue;
                }
                if (!(feeCurrencyCode in reduced)) {
                    reduced[feeCurrencyCode] = {};
                }
                const rateKey = (rate === undefined) ? '' : rate;
                if (rateKey in reduced[feeCurrencyCode]) {
                    reduced[feeCurrencyCode][rateKey]['cost'] = Precise.stringAdd (reduced[feeCurrencyCode][rateKey]['cost'], cost);
                } else {
                    reduced[feeCurrencyCode][rateKey] = {
                        'currency': code,
                        'cost': cost,
                    };
                    if (rate !== undefined) {
                        reduced[feeCurrencyCode][rateKey]['rate'] = rate;
                    }
                }
            }
        }
        let result = [];
        const feeValues = Object.values (reduced);
        for (let i = 0; i < feeValues.length; i++) {
            const reducedFeeValues = Object.values (feeValues[i]);
            result = this.arrayConcat (result, reducedFeeValues);
        }
        return result;
    }

    safeTicker (ticker: Dict, market: Market = undefined): Ticker {
        let open = this.omitZero (this.safeString (ticker, 'open'));
        let close = this.omitZero (this.safeString2 (ticker, 'close', 'last'));
        let change = this.omitZero (this.safeString (ticker, 'change'));
        let percentage = this.omitZero (this.safeString (ticker, 'percentage'));
        let average = this.omitZero (this.safeString (ticker, 'average'));
        let vwap = this.safeString (ticker, 'vwap');
        const baseVolume = this.safeString (ticker, 'baseVolume');
        const quoteVolume = this.safeString (ticker, 'quoteVolume');
        if (vwap === undefined) {
            vwap = Precise.stringDiv (this.omitZero (quoteVolume), baseVolume);
        }
        // calculate open
        if (change !== undefined) {
            if (close === undefined && average !== undefined) {
                close = Precise.stringAdd (average, Precise.stringDiv (change, '2'));
            }
            if (open === undefined && close !== undefined) {
                open = Precise.stringSub (close, change);
            }
        } else if (percentage !== undefined) {
            if (close === undefined && average !== undefined) {
                const openAddClose = Precise.stringMul (average, '2');
                // openAddClose = open * (1 + (100 + percentage)/100)
                const denominator = Precise.stringAdd ('2', Precise.stringDiv (percentage, '100'));
                const calcOpen = (open !== undefined) ? open : Precise.stringDiv (openAddClose, denominator);
                close = Precise.stringMul (calcOpen, Precise.stringAdd ('1', Precise.stringDiv (percentage, '100')));
            }
            if (open === undefined && close !== undefined) {
                open = Precise.stringDiv (close, Precise.stringAdd ('1', Precise.stringDiv (percentage, '100')));
            }
        }
        // change
        if (change === undefined) {
            if (close !== undefined && open !== undefined) {
                change = Precise.stringSub (close, open);
            } else if (close !== undefined && percentage !== undefined) {
                change = Precise.stringMul (Precise.stringDiv (percentage, '100'), Precise.stringDiv (close, '100'));
            } else if (open !== undefined && percentage !== undefined) {
                change = Precise.stringMul (open, Precise.stringDiv (percentage, '100'));
            }
        }
        // calculate things according to "open" (similar can be done with "close")
        if (open !== undefined) {
            // percentage (using change)
            if (percentage === undefined && change !== undefined) {
                percentage = Precise.stringMul (Precise.stringDiv (change, open), '100');
            }
            // close (using change)
            if (close === undefined && change !== undefined) {
                close = Precise.stringAdd (open, change);
            }
            // close (using average)
            if (close === undefined && average !== undefined) {
                close = Precise.stringMul (average, '2');
            }
            // average
            if (average === undefined && close !== undefined) {
                let precision = 18;
                if (market !== undefined && this.isTickPrecision ()) {
                    const marketPrecision = this.safeDict (market, 'precision');
                    const precisionPrice = this.safeString (marketPrecision, 'price');
                    if (precisionPrice !== undefined) {
                        precision = this.precisionFromString (precisionPrice);
                    }
                }
                average = Precise.stringDiv (Precise.stringAdd (open, close), '2', precision);
            }
        }
        // timestamp and symbol operations don't belong in safeTicker
        // they should be done in the derived classes
        const closeParsed = this.parseNumber (this.omitZero (close));
        return this.extend (ticker, {
            'bid': this.parseNumber (this.omitZero (this.safeString (ticker, 'bid'))),
            'bidVolume': this.safeNumber (ticker, 'bidVolume'),
            'ask': this.parseNumber (this.omitZero (this.safeString (ticker, 'ask'))),
            'askVolume': this.safeNumber (ticker, 'askVolume'),
            'high': this.parseNumber (this.omitZero (this.safeString (ticker, 'high'))),
            'low': this.parseNumber (this.omitZero (this.safeString (ticker, 'low'))),
            'open': this.parseNumber (this.omitZero (open)),
            'close': closeParsed,
            'last': closeParsed,
            'change': this.parseNumber (change),
            'percentage': this.parseNumber (percentage),
            'average': this.parseNumber (average),
            'vwap': this.parseNumber (vwap),
            'baseVolume': this.parseNumber (baseVolume),
            'quoteVolume': this.parseNumber (quoteVolume),
            'previousClose': this.safeNumber (ticker, 'previousClose'),
            'indexPrice': this.safeNumber (ticker, 'indexPrice'),
            'markPrice': this.safeNumber (ticker, 'markPrice'),
        });
    }

    async fetchBorrowRate (code: string, amount: number, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' fetchBorrowRate is deprecated, please use fetchCrossBorrowRate or fetchIsolatedBorrowRate instead');
    }

    async repayCrossMargin (code: string, amount: number, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' repayCrossMargin is not support yet');
    }

    async repayIsolatedMargin (symbol: string, code: string, amount: number, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' repayIsolatedMargin is not support yet');
    }

    async borrowCrossMargin (code: string, amount: number, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' borrowCrossMargin is not support yet');
    }

    async borrowIsolatedMargin (symbol: string, code: string, amount: number, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' borrowIsolatedMargin is not support yet');
    }

    async borrowMargin (code: string, amount: number, symbol: Str = undefined, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' borrowMargin is deprecated, please use borrowCrossMargin or borrowIsolatedMargin instead');
    }

    async repayMargin (code: string, amount: number, symbol: Str = undefined, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' repayMargin is deprecated, please use repayCrossMargin or repayIsolatedMargin instead');
    }

    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        let message = '';
        if (this.has['fetchTrades']) {
            message = '. If you want to build OHLCV candles from trade executions data, visit https://github.com/ccxt/ccxt/tree/master/examples/ and see "build-ohlcv-bars" file';
        }
        throw new NotSupported (this.id + ' fetchOHLCV() is not supported yet' + message);
    }

    async fetchOHLCVWs (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        let message = '';
        if (this.has['fetchTradesWs']) {
            message = '. If you want to build OHLCV candles from trade executions data, visit https://github.com/ccxt/ccxt/tree/master/examples/ and see "build-ohlcv-bars" file';
        }
        throw new NotSupported (this.id + ' fetchOHLCVWs() is not supported yet. Try using fetchOHLCV instead.' + message);
    }

    async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        throw new NotSupported (this.id + ' watchOHLCV() is not supported yet');
    }

    convertTradingViewToOHLCV (ohlcvs: number[][], timestamp = 't', open = 'o', high = 'h', low = 'l', close = 'c', volume = 'v', ms = false) {
        const result = [];
        const timestamps = this.safeList (ohlcvs, timestamp, []);
        const opens = this.safeList (ohlcvs, open, []);
        const highs = this.safeList (ohlcvs, high, []);
        const lows = this.safeList (ohlcvs, low, []);
        const closes = this.safeList (ohlcvs, close, []);
        const volumes = this.safeList (ohlcvs, volume, []);
        for (let i = 0; i < timestamps.length; i++) {
            result.push ([
                ms ? this.safeInteger (timestamps, i) : this.safeTimestamp (timestamps, i),
                this.safeValue (opens, i),
                this.safeValue (highs, i),
                this.safeValue (lows, i),
                this.safeValue (closes, i),
                this.safeValue (volumes, i),
            ]);
        }
        return result;
    }

    convertOHLCVToTradingView (ohlcvs: number[][], timestamp = 't', open = 'o', high = 'h', low = 'l', close = 'c', volume = 'v', ms = false) {
        const result = {};
        result[timestamp] = [];
        result[open] = [];
        result[high] = [];
        result[low] = [];
        result[close] = [];
        result[volume] = [];
        for (let i = 0; i < ohlcvs.length; i++) {
            const ts = ms ? ohlcvs[i][0] : this.parseToInt (ohlcvs[i][0] / 1000);
            const resultTimestamp = result[timestamp];
            resultTimestamp.push (ts);
            const resultOpen = result[open];
            resultOpen.push (ohlcvs[i][1]);
            const resultHigh = result[high];
            resultHigh.push (ohlcvs[i][2]);
            const resultLow = result[low];
            resultLow.push (ohlcvs[i][3]);
            const resultClose = result[close];
            resultClose.push (ohlcvs[i][4]);
            const resultVolume = result[volume];
            resultVolume.push (ohlcvs[i][5]);
        }
        return result;
    }

    async fetchWebEndpoint (method, endpointMethod, returnAsJson, startRegex = undefined, endRegex = undefined) {
        let errorMessage = '';
        const options = this.safeValue (this.options, method, {});
        const muteOnFailure = this.safeBool (options, 'webApiMuteFailure', true);
        try {
            // if it was not explicitly disabled, then don't fetch
            if (this.safeBool (options, 'webApiEnable', true) !== true) {
                return undefined;
            }
            const maxRetries = this.safeValue (options, 'webApiRetries', 10);
            let response = undefined;
            let retry = 0;
            let shouldBreak = false;
            while (retry < maxRetries) {
                try {
                    response = await this[endpointMethod] ({});
                    shouldBreak = true;
                    break;
                } catch (e) {
                    retry = retry + 1;
                    if (retry === maxRetries) {
                        throw e;
                    }
                }
                if (shouldBreak) {
                    break; // this is needed because of GO
                }
            }
            let content = response;
            if (startRegex !== undefined) {
                const splitted_by_start = content.split (startRegex);
                content = splitted_by_start[1]; // we need second part after start
            }
            if (endRegex !== undefined) {
                const splitted_by_end = content.split (endRegex);
                content = splitted_by_end[0]; // we need first part after start
            }
            if (returnAsJson && (typeof content === 'string')) {
                const jsoned = this.parseJson (content.trim ()); // content should be trimmed before json parsing
                if (jsoned) {
                    return jsoned; // if parsing was not successfull, exception should be thrown
                } else {
                    throw new BadResponse ('could not parse the response into json');
                }
            } else {
                return content;
            }
        } catch (e) {
            errorMessage = this.id + ' ' + method + '() failed to fetch correct data from website. Probably webpage markup has been changed, breaking the page custom parser.';
        }
        if (muteOnFailure) {
            return undefined;
        } else {
            throw new BadResponse (errorMessage);
        }
    }

    marketIds (symbols: Strings = undefined) {
        if (symbols === undefined) {
            return symbols;
        }
        const result = [];
        for (let i = 0; i < symbols.length; i++) {
            result.push (this.marketId (symbols[i]));
        }
        return result;
    }

    currencyIds (codes: Strings = undefined) {
        if (codes === undefined) {
            return codes;
        }
        const result = [];
        for (let i = 0; i < codes.length; i++) {
            result.push (this.currencyId (codes[i]));
        }
        return result;
    }

    marketsForSymbols (symbols: Strings = undefined) {
        if (symbols === undefined) {
            return symbols;
        }
        const result = [];
        for (let i = 0; i < symbols.length; i++) {
            result.push (this.market (symbols[i]));
        }
        return result;
    }

    marketSymbols (symbols: Strings = undefined, type: Str = undefined, allowEmpty = true, sameTypeOnly = false, sameSubTypeOnly = false) {
        if (symbols === undefined) {
            if (!allowEmpty) {
                throw new ArgumentsRequired (this.id + ' empty list of symbols is not supported');
            }
            return symbols;
        }
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            if (!allowEmpty) {
                throw new ArgumentsRequired (this.id + ' empty list of symbols is not supported');
            }
            return symbols;
        }
        const result = [];
        let marketType = undefined;
        let isLinearSubType = undefined;
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            if (sameTypeOnly && (marketType !== undefined)) {
                if (market['type'] !== marketType) {
                    throw new BadRequest (this.id + ' symbols must be of the same type, either ' + marketType + ' or ' + market['type'] + '.');
                }
            }
            if (sameSubTypeOnly && (isLinearSubType !== undefined)) {
                if (market['linear'] !== isLinearSubType) {
                    throw new BadRequest (this.id + ' symbols must be of the same subType, either linear or inverse.');
                }
            }
            if (type !== undefined && market['type'] !== type) {
                throw new BadRequest (this.id + ' symbols must be of the same type ' + type + '. If the type is incorrect you can change it in options or the params of the request');
            }
            marketType = market['type'];
            if (!market['spot']) {
                isLinearSubType = market['linear'];
            }
            const symbol = this.safeString (market, 'symbol', symbols[i]);
            result.push (symbol);
        }
        return result;
    }

    marketCodes (codes: Strings = undefined) {
        if (codes === undefined) {
            return codes;
        }
        const result = [];
        for (let i = 0; i < codes.length; i++) {
            result.push (this.commonCurrencyCode (codes[i]));
        }
        return result;
    }

    parseBidsAsks (bidasks, priceKey: IndexType = 0, amountKey: IndexType = 1, countOrIdKey: IndexType = 2) {
        bidasks = this.toArray (bidasks);
        const result = [];
        for (let i = 0; i < bidasks.length; i++) {
            result.push (this.parseBidAsk (bidasks[i], priceKey, amountKey, countOrIdKey));
        }
        return result;
    }

    async fetchL2OrderBook (symbol: string, limit: Int = undefined, params = {}) {
        const orderbook = await this.fetchOrderBook (symbol, limit, params);
        return this.extend (orderbook, {
            'asks': this.sortBy (this.aggregate (orderbook['asks']), 0),
            'bids': this.sortBy (this.aggregate (orderbook['bids']), 0, true),
        });
    }

    filterBySymbol (objects, symbol: Str = undefined) {
        if (symbol === undefined) {
            return objects;
        }
        const result = [];
        for (let i = 0; i < objects.length; i++) {
            const objectSymbol = this.safeString (objects[i], 'symbol');
            if (objectSymbol === symbol) {
                result.push (objects[i]);
            }
        }
        return result;
    }

    parseOHLCV (ohlcv, market: Market = undefined) : OHLCV {
        if (Array.isArray (ohlcv)) {
            return [
                this.safeInteger (ohlcv, 0), // timestamp
                this.safeNumber (ohlcv, 1), // open
                this.safeNumber (ohlcv, 2), // high
                this.safeNumber (ohlcv, 3), // low
                this.safeNumber (ohlcv, 4), // close
                this.safeNumber (ohlcv, 5), // volume
            ];
        }
        return ohlcv;
    }

    networkCodeToId (networkCode: string, currencyCode: Str = undefined): string {
        /**
         * @ignore
         * @method
         * @name exchange#networkCodeToId
         * @description tries to convert the provided networkCode (which is expected to be an unified network code) to a network id. In order to achieve this, derived class needs to have 'options->networks' defined.
         * @param {string} networkCode unified network code
         * @param {string} currencyCode unified currency code, but this argument is not required by default, unless there is an exchange (like huobi) that needs an override of the method to be able to pass currencyCode argument additionally
         * @returns {string|undefined} exchange-specific network id
         */
        if (networkCode === undefined) {
            return undefined;
        }
        const networkIdsByCodes = this.safeValue (this.options, 'networks', {});
        let networkId = this.safeString (networkIdsByCodes, networkCode);
        // for example, if 'ETH' is passed for networkCode, but 'ETH' key not defined in `options->networks` object
        if (networkId === undefined) {
            if (currencyCode === undefined) {
                const currencies = Object.values (this.currencies);
                for (let i = 0; i < currencies.length; i++) {
                    const currency = currencies[i];
                    const networks = this.safeDict (currency, 'networks');
                    const network = this.safeDict (networks, networkCode);
                    networkId = this.safeString (network, 'id');
                    if (networkId !== undefined) {
                        break;
                    }
                }
            } else {
                // if currencyCode was provided, then we try to find if that currencyCode has a replacement (i.e. ERC20 for ETH) or is in the currency
                const defaultNetworkCodeReplacements = this.safeValue (this.options, 'defaultNetworkCodeReplacements', {});
                if (currencyCode in defaultNetworkCodeReplacements) {
                    // if there is a replacement for the passed networkCode, then we use it to find network-id in `options->networks` object
                    const replacementObject = defaultNetworkCodeReplacements[currencyCode]; // i.e. { 'ERC20': 'ETH' }
                    const keys = Object.keys (replacementObject);
                    for (let i = 0; i < keys.length; i++) {
                        const key = keys[i];
                        const value = replacementObject[key];
                        // if value matches to provided unified networkCode, then we use it's key to find network-id in `options->networks` object
                        if (value === networkCode) {
                            networkId = this.safeString (networkIdsByCodes, key);
                            break;
                        }
                    }
                } else {
                    // serach for network inside currency
                    const currency = this.safeDict (this.currencies, currencyCode);
                    const networks = this.safeDict (currency, 'networks');
                    const network = this.safeDict (networks, networkCode);
                    networkId = this.safeString (network, 'id');
                }
            }
            // if it wasn't found, we just set the provided value to network-id
            if (networkId === undefined) {
                networkId = networkCode;
            }
        }
        return networkId;
    }

    networkIdToCode (networkId: Str = undefined, currencyCode: Str = undefined): string {
        /**
         * @ignore
         * @method
         * @name exchange#networkIdToCode
         * @description tries to convert the provided exchange-specific networkId to an unified network Code. In order to achieve this, derived class needs to have "options['networksById']" defined.
         * @param {string} networkId exchange specific network id/title, like: TRON, Trc-20, usdt-erc20, etc
         * @param {string|undefined} currencyCode unified currency code, but this argument is not required by default, unless there is an exchange (like huobi) that needs an override of the method to be able to pass currencyCode argument additionally
         * @returns {string|undefined} unified network code
         */
        if (networkId === undefined) {
            return undefined;
        }
        const networkCodesByIds = this.safeDict (this.options, 'networksById', {});
        let networkCode = this.safeString (networkCodesByIds, networkId, networkId);
        // replace mainnet network-codes (i.e. ERC20->ETH)
        if (currencyCode !== undefined) {
            const defaultNetworkCodeReplacements = this.safeDict (this.options, 'defaultNetworkCodeReplacements', {});
            if (currencyCode in defaultNetworkCodeReplacements) {
                const replacementObject = this.safeDict (defaultNetworkCodeReplacements, currencyCode, {});
                networkCode = this.safeString (replacementObject, networkCode, networkCode);
            }
        }
        return networkCode;
    }

    handleNetworkCodeAndParams (params) {
        const networkCodeInParams = this.safeString2 (params, 'networkCode', 'network');
        if (networkCodeInParams !== undefined) {
            params = this.omit (params, [ 'networkCode', 'network' ]);
        }
        // if it was not defined by user, we should not set it from 'defaultNetworks', because handleNetworkCodeAndParams is for only request-side and thus we do not fill it with anything. We can only use 'defaultNetworks' after parsing response-side
        return [ networkCodeInParams, params ];
    }

    defaultNetworkCode (currencyCode: string) {
        let defaultNetworkCode = undefined;
        const defaultNetworks = this.safeDict (this.options, 'defaultNetworks', {});
        if (currencyCode in defaultNetworks) {
            // if currency had set its network in "defaultNetworks", use it
            defaultNetworkCode = defaultNetworks[currencyCode];
        } else {
            // otherwise, try to use the global-scope 'defaultNetwork' value (even if that network is not supported by currency, it doesn't make any problem, this will be just used "at first" if currency supports this network at all)
            const defaultNetwork = this.safeString (this.options, 'defaultNetwork');
            if (defaultNetwork !== undefined) {
                defaultNetworkCode = defaultNetwork;
            }
        }
        return defaultNetworkCode;
    }

    selectNetworkCodeFromUnifiedNetworks (currencyCode, networkCode, indexedNetworkEntries) {
        return this.selectNetworkKeyFromNetworks (currencyCode, networkCode, indexedNetworkEntries, true);
    }

    selectNetworkIdFromRawNetworks (currencyCode, networkCode, indexedNetworkEntries) {
        return this.selectNetworkKeyFromNetworks (currencyCode, networkCode, indexedNetworkEntries, false);
    }

    selectNetworkKeyFromNetworks (currencyCode, networkCode, indexedNetworkEntries, isIndexedByUnifiedNetworkCode = false) {
        // this method is used against raw & unparse network entries, which are just indexed by network id
        let chosenNetworkId = undefined;
        const availableNetworkIds = Object.keys (indexedNetworkEntries);
        const responseNetworksLength = availableNetworkIds.length;
        if (networkCode !== undefined) {
            if (responseNetworksLength === 0) {
                throw new NotSupported (this.id + ' - ' + networkCode + ' network did not return any result for ' + currencyCode);
            } else {
                // if networkCode was provided by user, we should check it after response, as the referenced exchange doesn't support network-code during request
                const networkIdOrCode = isIndexedByUnifiedNetworkCode ? networkCode : this.networkCodeToId (networkCode, currencyCode);
                if (networkIdOrCode in indexedNetworkEntries) {
                    chosenNetworkId = networkIdOrCode;
                } else {
                    throw new NotSupported (this.id + ' - ' + networkIdOrCode + ' network was not found for ' + currencyCode + ', use one of ' + availableNetworkIds.join (', '));
                }
            }
        } else {
            if (responseNetworksLength === 0) {
                throw new NotSupported (this.id + ' - no networks were returned for ' + currencyCode);
            } else {
                // if networkCode was not provided by user, then we try to use the default network (if it was defined in "defaultNetworks"), otherwise, we just return the first network entry
                const defaultNetworkCode = this.defaultNetworkCode (currencyCode);
                const defaultNetworkId = isIndexedByUnifiedNetworkCode ? defaultNetworkCode : this.networkCodeToId (defaultNetworkCode, currencyCode);
                if (defaultNetworkId in indexedNetworkEntries) {
                    return defaultNetworkId;
                }
                throw new NotSupported (this.id + ' - can not determine the default network, please pass param["network"] one from : ' + availableNetworkIds.join (', '));
            }
        }
        return chosenNetworkId;
    }

    safeNumber2 (dictionary: object, key1: IndexType, key2: IndexType, d = undefined) {
        const value = this.safeString2 (dictionary, key1, key2);
        return this.parseNumber (value, d);
    }

    parseOrderBook (orderbook: object, symbol: string, timestamp: Int = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey: IndexType = 0, amountKey: IndexType = 1, countOrIdKey: IndexType = 2): OrderBook {
        const bids = this.parseBidsAsks (this.safeValue (orderbook, bidsKey, []), priceKey, amountKey, countOrIdKey);
        const asks = this.parseBidsAsks (this.safeValue (orderbook, asksKey, []), priceKey, amountKey, countOrIdKey);
        return {
            'symbol': symbol,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        } as any;
    }

    parseOHLCVs (ohlcvs: object[], market: any = undefined, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, tail: Bool = false): OHLCV[] {
        const results = [];
        for (let i = 0; i < ohlcvs.length; i++) {
            results.push (this.parseOHLCV (ohlcvs[i], market));
        }
        const sorted = this.sortBy (results, 0);
        return this.filterBySinceLimit (sorted, since, limit, 0, tail) as any;
    }

    parseLeverageTiers (response: any, symbols: string[] = undefined, marketIdKey = undefined): LeverageTiers {
        // marketIdKey should only be undefined when response is a dictionary.
        symbols = this.marketSymbols (symbols);
        const tiers = {};
        let symbolsLength = 0;
        if (symbols !== undefined) {
            symbolsLength = symbols.length;
        }
        const noSymbols = (symbols === undefined) || (symbolsLength === 0);
        if (Array.isArray (response)) {
            for (let i = 0; i < response.length; i++) {
                const item = response[i];
                const id = this.safeString (item, marketIdKey);
                const market = this.safeMarket (id, undefined, undefined, 'swap');
                const symbol = market['symbol'];
                const contract = this.safeBool (market, 'contract', false);
                if (contract && (noSymbols || this.inArray (symbol, symbols))) {
                    tiers[symbol] = this.parseMarketLeverageTiers (item, market);
                }
            }
        } else {
            const keys = Object.keys (response);
            for (let i = 0; i < keys.length; i++) {
                const marketId = keys[i];
                const item = response[marketId];
                const market = this.safeMarket (marketId, undefined, undefined, 'swap');
                const symbol = market['symbol'];
                const contract = this.safeBool (market, 'contract', false);
                if (contract && (noSymbols || this.inArray (symbol, symbols))) {
                    tiers[symbol] = this.parseMarketLeverageTiers (item, market);
                }
            }
        }
        return tiers;
    }

    async loadTradingLimits (symbols: Strings = undefined, reload = false, params = {}) {
        if (this.has['fetchTradingLimits']) {
            if (reload || !('limitsLoaded' in this.options)) {
                const response = await this.fetchTradingLimits (symbols);
                for (let i = 0; i < symbols.length; i++) {
                    const symbol = symbols[i];
                    this.markets[symbol] = this.deepExtend (this.markets[symbol], response[symbol]);
                }
                this.options['limitsLoaded'] = this.milliseconds ();
            }
        }
        return this.markets;
    }

    safePosition (position: Dict): Position {
        // simplified version of: /pull/12765/
        const unrealizedPnlString = this.safeString (position, 'unrealisedPnl');
        const initialMarginString = this.safeString (position, 'initialMargin');
        //
        // PERCENTAGE
        //
        const percentage = this.safeValue (position, 'percentage');
        if ((percentage === undefined) && (unrealizedPnlString !== undefined) && (initialMarginString !== undefined)) {
            // as it was done in all implementations ( aax, btcex, bybit, deribit, ftx, gate, kucoinfutures, phemex )
            const percentageString = Precise.stringMul (Precise.stringDiv (unrealizedPnlString, initialMarginString, 4), '100');
            position['percentage'] = this.parseNumber (percentageString);
        }
        // if contractSize is undefined get from market
        let contractSize = this.safeNumber (position, 'contractSize');
        const symbol = this.safeString (position, 'symbol');
        let market = undefined;
        if (symbol !== undefined) {
            market = this.safeValue (this.markets, symbol);
        }
        if (contractSize === undefined && market !== undefined) {
            contractSize = this.safeNumber (market, 'contractSize');
            position['contractSize'] = contractSize;
        }
        return position as Position;
    }

    parsePositions (positions: any[], symbols: string[] = undefined, params = {}): Position[] {
        symbols = this.marketSymbols (symbols);
        positions = this.toArray (positions);
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            const position = this.extend (this.parsePosition (positions[i], undefined), params);
            result.push (position);
        }
        return this.filterByArrayPositions (result, 'symbol', symbols, false);
    }

    parseAccounts (accounts: any[], params = {}): Account[] {
        accounts = this.toArray (accounts);
        const result = [];
        for (let i = 0; i < accounts.length; i++) {
            const account = this.extend (this.parseAccount (accounts[i]), params);
            result.push (account);
        }
        return result;
    }

    parseTradesHelper (isWs: boolean, trades: any[], market: Market = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Trade[] {
        trades = this.toArray (trades);
        let result = [];
        for (let i = 0; i < trades.length; i++) {
            let parsed = undefined;
            if (isWs) {
                parsed = this.parseWsTrade (trades[i], market);
            } else {
                parsed = this.parseTrade (trades[i], market);
            }
            const trade = this.extend (parsed, params);
            result.push (trade);
        }
        result = this.sortBy2 (result, 'timestamp', 'id');
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        return this.filterBySymbolSinceLimit (result, symbol, since, limit) as Trade[];
    }

    parseTrades (trades: any[], market: Market = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Trade[] {
        return this.parseTradesHelper (false, trades, market, since, limit, params);
    }

    parseWsTrades (trades: any[], market: Market = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Trade[] {
        return this.parseTradesHelper (true, trades, market, since, limit, params);
    }

    parseTransactions (transactions: any[], currency: Currency = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Transaction[] {
        transactions = this.toArray (transactions);
        let result = [];
        for (let i = 0; i < transactions.length; i++) {
            const transaction = this.extend (this.parseTransaction (transactions[i], currency), params);
            result.push (transaction);
        }
        result = this.sortBy (result, 'timestamp');
        const code = (currency !== undefined) ? currency['code'] : undefined;
        return this.filterByCurrencySinceLimit (result, code, since, limit);
    }

    parseTransfers (transfers: any[], currency: Currency = undefined, since: Int = undefined, limit: Int = undefined, params = {}): TransferEntry[] {
        transfers = this.toArray (transfers);
        let result = [];
        for (let i = 0; i < transfers.length; i++) {
            const transfer = this.extend (this.parseTransfer (transfers[i], currency), params);
            result.push (transfer);
        }
        result = this.sortBy (result, 'timestamp');
        const code = (currency !== undefined) ? currency['code'] : undefined;
        return this.filterByCurrencySinceLimit (result, code, since, limit);
    }

    parseLedger (data, currency: Currency = undefined, since: Int = undefined, limit: Int = undefined, params = {}): LedgerEntry[] {
        let result = [];
        const arrayData = this.toArray (data);
        for (let i = 0; i < arrayData.length; i++) {
            const itemOrItems = this.parseLedgerEntry (arrayData[i], currency);
            if (Array.isArray (itemOrItems)) {
                for (let j = 0; j < itemOrItems.length; j++) {
                    result.push (this.extend (itemOrItems[j], params));
                }
            } else {
                result.push (this.extend (itemOrItems, params));
            }
        }
        result = this.sortBy (result, 'timestamp');
        const code = (currency !== undefined) ? currency['code'] : undefined;
        return this.filterByCurrencySinceLimit (result, code, since, limit);
    }

    nonce () {
        return this.seconds ();
    }

    setHeaders (headers) {
        return headers;
    }

    currencyId (code: string): string {
        let currency = this.safeDict (this.currencies, code);
        if (currency === undefined) {
            currency = this.safeCurrency (code);
        }
        if (currency !== undefined) {
            return currency['id'];
        }
        return code;
    }

    marketId (symbol: string): string {
        const market = this.market (symbol);
        if (market !== undefined) {
            return market['id'];
        }
        return symbol;
    }

    symbol (symbol: string): string {
        const market = this.market (symbol);
        return this.safeString (market, 'symbol', symbol);
    }

    handleParamString (params: object, paramName: string, defaultValue: Str = undefined): [string, object] {
        const value = this.safeString (params, paramName, defaultValue);
        if (value !== undefined) {
            params = this.omit (params, paramName);
        }
        return [ value, params ];
    }

    handleParamString2 (params: object, paramName1: string, paramName2: string, defaultValue: Str = undefined): [string, object] {
        const value = this.safeString2 (params, paramName1, paramName2, defaultValue);
        if (value !== undefined) {
            params = this.omit (params, [ paramName1, paramName2 ]);
        }
        return [ value, params ];
    }

    handleParamInteger (params: object, paramName: string, defaultValue: Int = undefined): [Int, object] {
        const value = this.safeInteger (params, paramName, defaultValue);
        if (value !== undefined) {
            params = this.omit (params, paramName);
        }
        return [ value, params ];
    }

    handleParamInteger2 (params: object, paramName1: string, paramName2: string, defaultValue: Int = undefined): [Int, object] {
        const value = this.safeInteger2 (params, paramName1, paramName2, defaultValue);
        if (value !== undefined) {
            params = this.omit (params, [ paramName1, paramName2 ]);
        }
        return [ value, params ];
    }

    handleParamBool (params: object, paramName: string, defaultValue: Bool = undefined): [Bool, object] {
        const value = this.safeBool (params, paramName, defaultValue);
        if (value !== undefined) {
            params = this.omit (params, paramName);
        }
        return [ value, params ];
    }

    handleParamBool2 (params: object, paramName1: string, paramName2: string, defaultValue: Bool = undefined): [Bool, object] {
        const value = this.safeBool2 (params, paramName1, paramName2, defaultValue);
        if (value !== undefined) {
            params = this.omit (params, [ paramName1, paramName2 ]);
        }
        return [ value, params ];
    }

    /**
     * @param {object} params - extra parameters
     * @param {object} request - existing dictionary of request
     * @param {string} exchangeSpecificKey - the key for chain id to be set in request
     * @param {object} currencyCode - (optional) existing dictionary of request
     * @param {boolean} isRequired - (optional) whether that param is required to be present
     * @returns {object[]} - returns [request, params] where request is the modified request object and params is the modified params object
     */
    handleRequestNetwork (params: Dict, request: Dict, exchangeSpecificKey: string, currencyCode:Str = undefined, isRequired: boolean = false) {
        let networkCode = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        if (networkCode !== undefined) {
            request[exchangeSpecificKey] = this.networkCodeToId (networkCode, currencyCode);
        } else if (isRequired) {
            throw new ArgumentsRequired (this.id + ' - "network" param is required for this request');
        }
        return [ request, params ];
    }

    resolvePath (path, params) {
        return [
            this.implodeParams (path, params),
            this.omit (params, this.extractParams (path)),
        ];
    }

    getListFromObjectValues (objects, key: IndexType) {
        let newArray = objects;
        if (!Array.isArray (objects)) {
            newArray = this.toArray (objects);
        }
        const results = [];
        for (let i = 0; i < newArray.length; i++) {
            results.push (newArray[i][key]);
        }
        return results;
    }

    getSymbolsForMarketType (marketType: Str = undefined, subType: Str = undefined, symbolWithActiveStatus: boolean = true, symbolWithUnknownStatus: boolean = true) {
        let filteredMarkets = this.markets;
        if (marketType !== undefined) {
            filteredMarkets = this.filterBy (filteredMarkets, 'type', marketType);
        }
        if (subType !== undefined) {
            this.checkRequiredArgument ('getSymbolsForMarketType', subType, 'subType', [ 'linear', 'inverse', 'quanto' ]);
            filteredMarkets = this.filterBy (filteredMarkets, 'subType', subType);
        }
        const activeStatuses = [];
        if (symbolWithActiveStatus) {
            activeStatuses.push (true);
        }
        if (symbolWithUnknownStatus) {
            activeStatuses.push (undefined);
        }
        filteredMarkets = this.filterByArray (filteredMarkets, 'active', activeStatuses, false);
        return this.getListFromObjectValues (filteredMarkets, 'symbol');
    }

    filterByArray (objects, key: IndexType, values = undefined, indexed = true) {
        objects = this.toArray (objects);
        // return all of them if no values were passed
        if (values === undefined || !values) {
            // return indexed ? this.indexBy (objects, key) : objects;
            if (indexed) {
                return this.indexBy (objects, key);
            } else {
                return objects;
            }
        }
        const results = [];
        for (let i = 0; i < objects.length; i++) {
            if (this.inArray (objects[i][key], values)) {
                results.push (objects[i]);
            }
        }
        // return indexed ? this.indexBy (results, key) : results;
        if (indexed) {
            return this.indexBy (results, key);
        }
        return results;
    }

    async fetch2 (path, api: any = 'public', method = 'GET', params = {}, headers: any = undefined, body: any = undefined, config = {}) {
        if (this.enableRateLimit) {
            const cost = this.calculateRateLimiterCost (api, method, path, params, config);
            await this.throttle (cost);
        }
        let retries = undefined;
        [ retries, params ] = this.handleOptionAndParams (params, path, 'maxRetriesOnFailure', 0);
        let retryDelay = undefined;
        [ retryDelay, params ] = this.handleOptionAndParams (params, path, 'maxRetriesOnFailureDelay', 0);
        this.lastRestRequestTimestamp = this.milliseconds ();
        const request = this.sign (path, api, method, params, headers, body);
        this.last_request_headers = request['headers'];
        this.last_request_body = request['body'];
        this.last_request_url = request['url'];
        for (let i = 0; i < retries + 1; i++) {
            try {
                return await this.fetch (request['url'], request['method'], request['headers'], request['body']);
            } catch (e) {
                if (e instanceof OperationFailed) {
                    if (i < retries) {
                        if (this.verbose) {
                            const index = i + 1;
                            this.log ('Request failed with the error: ' + e.toString () + ', retrying ' + index.toString () + ' of ' + retries.toString () + '...');
                        }
                        if ((retryDelay !== undefined) && (retryDelay !== 0)) {
                            await this.sleep (retryDelay);
                        }
                    } else {
                        throw e;
                    }
                } else {
                    throw e;
                }
            }
        }
        return undefined; // this line is never reached, but exists for c# value return requirement
    }

    async request (path, api: any = 'public', method = 'GET', params = {}, headers: any = undefined, body: any = undefined, config = {}) {
        return await this.fetch2 (path, api, method, params, headers, body, config);
    }

    async loadAccounts (reload = false, params = {}) {
        if (reload) {
            this.accounts = await this.fetchAccounts (params);
        } else {
            if (this.accounts) {
                return this.accounts;
            } else {
                this.accounts = await this.fetchAccounts (params);
            }
        }
        this.accountsById = this.indexBy (this.accounts, 'id') as any;
        return this.accounts;
    }

    buildOHLCVC (trades: Trade[], timeframe: string = '1m', since: number = 0, limit: number = 2147483647): OHLCVC[] {
        // given a sorted arrays of trades (recent last) and a timeframe builds an array of OHLCV candles
        // note, default limit value (2147483647) is max int32 value
        const ms = this.parseTimeframe (timeframe) * 1000;
        const ohlcvs = [];
        const i_timestamp = 0;
        // const open = 1;
        const i_high = 2;
        const i_low = 3;
        const i_close = 4;
        const i_volume = 5;
        const i_count = 6;
        const tradesLength = trades.length;
        const oldest = Math.min (tradesLength, limit);
        const options = this.safeDict (this.options, 'buildOHLCVC', {});
        const skipZeroPrices = this.safeBool (options, 'skipZeroPrices', true);
        for (let i = 0; i < oldest; i++) {
            const trade = trades[i];
            const ts = trade['timestamp'];
            const price = trade['price'];
            if (ts < since) {
                continue;
            }
            const openingTime = Math.floor (ts / ms) * ms; // shift to the edge of m/h/d (but not M)
            if (openingTime < since) { // we don't need bars, that have opening time earlier than requested
                continue;
            }
            const ohlcv_length = ohlcvs.length;
            const candle = ohlcv_length - 1;
            if (skipZeroPrices && !(price > 0) && !(price < 0)) {
                continue;
            }
            const isFirstCandle = candle === -1;
            if (isFirstCandle || openingTime >= this.sum (ohlcvs[candle][i_timestamp], ms)) {
                // moved to a new timeframe -> create a new candle from opening trade
                ohlcvs.push ([
                    openingTime, // timestamp
                    price, // O
                    price, // H
                    price, // L
                    price, // C
                    trade['amount'], // V
                    1, // count
                ]);
            } else {
                // still processing the same timeframe -> update opening trade
                ohlcvs[candle][i_high] = Math.max (ohlcvs[candle][i_high], price);
                ohlcvs[candle][i_low] = Math.min (ohlcvs[candle][i_low], price);
                ohlcvs[candle][i_close] = price;
                ohlcvs[candle][i_volume] = this.sum (ohlcvs[candle][i_volume], trade['amount']);
                ohlcvs[candle][i_count] = this.sum (ohlcvs[candle][i_count], 1);
            }
        }
        return ohlcvs;
    }

    parseTradingViewOHLCV (ohlcvs, market = undefined, timeframe = '1m', since: Int = undefined, limit: Int = undefined) {
        const result = this.convertTradingViewToOHLCV (ohlcvs);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    async editLimitBuyOrder (id: string, symbol: string, amount: number, price: Num = undefined, params = {}) {
        return await this.editLimitOrder (id, symbol, 'buy', amount, price, params);
    }

    async editLimitSellOrder (id: string, symbol: string, amount: number, price: Num = undefined, params = {}) {
        return await this.editLimitOrder (id, symbol, 'sell', amount, price, params);
    }

    async editLimitOrder (id: string, symbol: string, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        return await this.editOrder (id, symbol, 'limit', side, amount, price, params);
    }

    async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}): Promise<Order> {
        await this.cancelOrder (id, symbol);
        return await this.createOrder (symbol, type, side, amount, price, params);
    }

    async editOrderWithClientOrderId (clientOrderId: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}): Promise<Order> {
        return await this.editOrder ('', symbol, type, side, amount, price, this.extend ({ 'clientOrderId': clientOrderId }, params));
    }

    async editOrderWs (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}): Promise<Order> {
        await this.cancelOrderWs (id, symbol);
        return await this.createOrderWs (symbol, type, side, amount, price, params);
    }

    async fetchPosition (symbol: string, params = {}): Promise<Position> {
        throw new NotSupported (this.id + ' fetchPosition() is not supported yet');
    }

    async fetchPositionWs (symbol: string, params = {}): Promise<Position[]> {
        throw new NotSupported (this.id + ' fetchPositionWs() is not supported yet');
    }

    async watchPosition (symbol: Str = undefined, params = {}): Promise<Position> {
        throw new NotSupported (this.id + ' watchPosition() is not supported yet');
    }

    async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        throw new NotSupported (this.id + ' watchPositions() is not supported yet');
    }

    async watchPositionForSymbols (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        return await this.watchPositions (symbols, since, limit, params);
    }

    async fetchPositionsForSymbol (symbol: string, params = {}): Promise<Position[]> {
        /**
         * @method
         * @name exchange#fetchPositionsForSymbol
         * @description fetches all open positions for specific symbol, unlike fetchPositions (which is designed to work with multiple symbols) so this method might be preffered for one-market position, because of less rate-limit consumption and speed
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the endpoint
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure} with maximum 3 items - possible one position for "one-way" mode, and possible two positions (long & short) for "two-way" (a.k.a. hedge) mode
         */
        throw new NotSupported (this.id + ' fetchPositionsForSymbol() is not supported yet');
    }

    async fetchPositionsForSymbolWs (symbol: string, params = {}): Promise<Position[]> {
        /**
         * @method
         * @name exchange#fetchPositionsForSymbol
         * @description fetches all open positions for specific symbol, unlike fetchPositions (which is designed to work with multiple symbols) so this method might be preffered for one-market position, because of less rate-limit consumption and speed
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the endpoint
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure} with maximum 3 items - possible one position for "one-way" mode, and possible two positions (long & short) for "two-way" (a.k.a. hedge) mode
         */
        throw new NotSupported (this.id + ' fetchPositionsForSymbol() is not supported yet');
    }

    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        throw new NotSupported (this.id + ' fetchPositions() is not supported yet');
    }

    async fetchPositionsWs (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        throw new NotSupported (this.id + ' fetchPositions() is not supported yet');
    }

    async fetchPositionsRisk (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        throw new NotSupported (this.id + ' fetchPositionsRisk() is not supported yet');
    }

    async fetchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        throw new NotSupported (this.id + ' fetchBidsAsks() is not supported yet');
    }

    async fetchBorrowInterest (code: Str = undefined, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<BorrowInterest[]> {
        throw new NotSupported (this.id + ' fetchBorrowInterest() is not supported yet');
    }

    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        throw new NotSupported (this.id + ' fetchLedger() is not supported yet');
    }

    async fetchLedgerEntry (id: string, code: Str = undefined, params = {}): Promise<LedgerEntry> {
        throw new NotSupported (this.id + ' fetchLedgerEntry() is not supported yet');
    }

    parseBidAsk (bidask, priceKey: IndexType = 0, amountKey: IndexType = 1, countOrIdKey: IndexType = 2) {
        const price = this.safeFloat (bidask, priceKey);
        const amount = this.safeFloat (bidask, amountKey);
        const countOrId = this.safeInteger (bidask, countOrIdKey);
        const bidAsk = [ price, amount ];
        if (countOrId !== undefined) {
            bidAsk.push (countOrId);
        }
        return bidAsk;
    }

    safeCurrency (currencyId: Str, currency: Currency = undefined): CurrencyInterface {
        if ((currencyId === undefined) && (currency !== undefined)) {
            return currency;
        }
        if ((this.currencies_by_id !== undefined) && (currencyId in this.currencies_by_id) && (this.currencies_by_id[currencyId] !== undefined)) {
            return this.currencies_by_id[currencyId];
        }
        let code = currencyId;
        if (currencyId !== undefined) {
            code = this.commonCurrencyCode (currencyId.toUpperCase ());
        }
        return this.safeCurrencyStructure ({
            'id': currencyId,
            'code': code,
            'precision': undefined,
        });
    }

    safeMarket (marketId: Str = undefined, market: Market = undefined, delimiter: Str = undefined, marketType: Str = undefined): MarketInterface {
        if (marketId !== undefined) {
            if ((this.markets_by_id !== undefined) && (marketId in this.markets_by_id)) {
                const markets = this.markets_by_id[marketId];
                const numMarkets = markets.length;
                if (numMarkets === 1) {
                    return markets[0];
                } else {
                    if (marketType === undefined) {
                        if (market === undefined) {
                            throw new ArgumentsRequired (this.id + ' safeMarket() requires a fourth argument for ' + marketId + ' to disambiguate between different markets with the same market id');
                        } else {
                            marketType = market['type'];
                        }
                    }
                    for (let i = 0; i < markets.length; i++) {
                        const currentMarket = markets[i];
                        if (currentMarket[marketType]) {
                            return currentMarket;
                        }
                    }
                }
            } else if (delimiter !== undefined && delimiter !== '') {
                const parts = marketId.split (delimiter);
                const partsLength = parts.length;
                const result = this.safeMarketStructure ({
                    'symbol': marketId,
                    'marketId': marketId,
                });
                if (partsLength === 2) {
                    result['baseId'] = this.safeString (parts, 0);
                    result['quoteId'] = this.safeString (parts, 1);
                    result['base'] = this.safeCurrencyCode (result['baseId']);
                    result['quote'] = this.safeCurrencyCode (result['quoteId']);
                    result['symbol'] = result['base'] + '/' + result['quote'];
                }
                return result;
            }
        }
        if (market !== undefined) {
            return market;
        }
        return this.safeMarketStructure ({ 'symbol': marketId, 'marketId': marketId });
    }

    marketOrNull (symbol: Str = undefined): MarketInterface {
        if (symbol === undefined) {
            return undefined;
        }
        return this.market (symbol);
    }

    checkRequiredCredentials (error = true) {
        /**
         * @ignore
         * @method
         * @param {boolean} error throw an error that a credential is required if true
         * @returns {boolean} true if all required credentials have been set, otherwise false or an error is thrown is param error=true
         */
        const keys = Object.keys (this.requiredCredentials);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (this.requiredCredentials[key] && !this[key]) {
                if (error) {
                    throw new AuthenticationError (this.id + ' requires "' + key + '" credential');
                } else {
                    return false;
                }
            }
        }
        return true;
    }

    oath () {
        if (this.twofa !== undefined) {
            return totp (this.twofa);
        } else {
            throw new ExchangeError (this.id + ' exchange.twofa has not been set for 2FA Two-Factor Authentication');
        }
    }

    async fetchBalance (params = {}): Promise<Balances> {
        throw new NotSupported (this.id + ' fetchBalance() is not supported yet');
    }

    async fetchBalanceWs (params = {}): Promise<Balances> {
        throw new NotSupported (this.id + ' fetchBalanceWs() is not supported yet');
    }

    parseBalance (response): Balances {
        throw new NotSupported (this.id + ' parseBalance() is not supported yet');
    }

    async watchBalance (params = {}): Promise<Balances> {
        throw new NotSupported (this.id + ' watchBalance() is not supported yet');
    }

    async fetchPartialBalance (part, params = {}): Promise<Balance> {
        const balance = await this.fetchBalance (params);
        return balance[part];
    }

    async fetchFreeBalance (params = {}): Promise<Balance> {
        return await this.fetchPartialBalance ('free', params);
    }

    async fetchUsedBalance (params = {}): Promise<Balance> {
        return await this.fetchPartialBalance ('used', params);
    }

    async fetchTotalBalance (params = {}): Promise<Balance> {
        return await this.fetchPartialBalance ('total', params);
    }

    async fetchStatus (params = {}): Promise<any> {
        throw new NotSupported (this.id + ' fetchStatus() is not supported yet');
    }

    async fetchTransactionFee (code: string, params = {}) {
        if (!this.has['fetchTransactionFees']) {
            throw new NotSupported (this.id + ' fetchTransactionFee() is not supported yet');
        }
        return await this.fetchTransactionFees ([ code ], params);
    }

    async fetchTransactionFees (codes: Strings = undefined, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' fetchTransactionFees() is not supported yet');
    }

    async fetchDepositWithdrawFees (codes: Strings = undefined, params = {}): Promise<Dictionary<DepositWithdrawFee>> {
        throw new NotSupported (this.id + ' fetchDepositWithdrawFees() is not supported yet');
    }

    async fetchDepositWithdrawFee (code: string, params = {}): Promise<DepositWithdrawFee> {
        if (!this.has['fetchDepositWithdrawFees']) {
            throw new NotSupported (this.id + ' fetchDepositWithdrawFee() is not supported yet');
        }
        const fees = await this.fetchDepositWithdrawFees ([ code ], params);
        return this.safeValue (fees, code);
    }

    getSupportedMapping (key, mapping = {}) {
        if (key in mapping) {
            return mapping[key];
        } else {
            throw new NotSupported (this.id + ' ' + key + ' does not have a value in mapping');
        }
    }

    async fetchCrossBorrowRate (code: string, params = {}): Promise<CrossBorrowRate> {
        await this.loadMarkets ();
        if (!this.has['fetchBorrowRates']) {
            throw new NotSupported (this.id + ' fetchCrossBorrowRate() is not supported yet');
        }
        const borrowRates = await this.fetchCrossBorrowRates (params);
        const rate = this.safeValue (borrowRates, code);
        if (rate === undefined) {
            throw new ExchangeError (this.id + ' fetchCrossBorrowRate() could not find the borrow rate for currency code ' + code);
        }
        return rate;
    }

    async fetchIsolatedBorrowRate (symbol: string, params = {}): Promise<IsolatedBorrowRate> {
        await this.loadMarkets ();
        if (!this.has['fetchBorrowRates']) {
            throw new NotSupported (this.id + ' fetchIsolatedBorrowRate() is not supported yet');
        }
        const borrowRates = await this.fetchIsolatedBorrowRates (params);
        const rate = this.safeDict (borrowRates, symbol) as IsolatedBorrowRate;
        if (rate === undefined) {
            throw new ExchangeError (this.id + ' fetchIsolatedBorrowRate() could not find the borrow rate for market symbol ' + symbol);
        }
        return rate;
    }

    handleOptionAndParams (params: object, methodName: string, optionName: string, defaultValue = undefined) {
        // This method can be used to obtain method specific properties, i.e: this.handleOptionAndParams (params, 'fetchPosition', 'marginMode', 'isolated')
        const defaultOptionName = 'default' + this.capitalize (optionName); // we also need to check the 'defaultXyzWhatever'
        // check if params contain the key
        let value = this.safeValue2 (params, optionName, defaultOptionName);
        if (value !== undefined) {
            params = this.omit (params, [ optionName, defaultOptionName ]);
        } else {
            // handle routed methods like "watchTrades > watchTradesForSymbols" (or "watchTicker > watchTickers")
            [ methodName, params ] = this.handleParamString (params, 'callerMethodName', methodName);
            // check if exchange has properties for this method
            const exchangeWideMethodOptions = this.safeValue (this.options, methodName);
            if (exchangeWideMethodOptions !== undefined) {
                // check if the option is defined inside this method's props
                value = this.safeValue2 (exchangeWideMethodOptions, optionName, defaultOptionName);
            }
            if (value === undefined) {
                // if it's still undefined, check if global exchange-wide option exists
                value = this.safeValue2 (this.options, optionName, defaultOptionName);
            }
            // if it's still undefined, use the default value
            value = (value !== undefined) ? value : defaultValue;
        }
        return [ value, params ];
    }

    handleOptionAndParams2 (params: object, methodName1: string, optionName1: string, optionName2: string, defaultValue = undefined) {
        let value = undefined;
        [ value, params ] = this.handleOptionAndParams (params, methodName1, optionName1);
        if (value !== undefined) {
            // omit optionName2 too from params
            params = this.omit (params, optionName2);
            return [ value, params ];
        }
        // if still undefined, try optionName2
        let value2 = undefined;
        [ value2, params ] = this.handleOptionAndParams (params, methodName1, optionName2, defaultValue);
        return [ value2, params ];
    }

    handleOption (methodName: string, optionName: string, defaultValue = undefined) {
        const res = this.handleOptionAndParams ({}, methodName, optionName, defaultValue);
        return this.safeValue (res, 0);
    }

    handleMarketTypeAndParams (methodName: string, market: Market = undefined, params = {}, defaultValue = undefined): any {
        /**
         * @ignore
         * @method
         * @name exchange#handleMarketTypeAndParams
         * @param methodName the method calling handleMarketTypeAndParams
         * @param {Market} market
         * @param {object} params
         * @param {string} [params.type] type assigned by user
         * @param {string} [params.defaultType] same as params.type
         * @param {string} [defaultValue] assigned programatically in the method calling handleMarketTypeAndParams
         * @returns {[string, object]} the market type and params with type and defaultType omitted
         */
        // type from param
        const type = this.safeString2 (params, 'defaultType', 'type');
        if (type !== undefined) {
            params = this.omit (params, [ 'defaultType', 'type' ]);
            return [ type, params ];
        }
        // type from market
        if (market !== undefined) {
            return [ market['type'], params ];
        }
        // type from default-argument
        if (defaultValue !== undefined) {
            return [ defaultValue, params ];
        }
        const methodOptions = this.safeDict (this.options, methodName);
        if (methodOptions !== undefined) {
            if (typeof methodOptions === 'string') {
                return [ methodOptions, params ];
            } else {
                const typeFromMethod = this.safeString2 (methodOptions, 'defaultType', 'type');
                if (typeFromMethod !== undefined) {
                    return [ typeFromMethod, params ];
                }
            }
        }
        const defaultType = this.safeString2 (this.options, 'defaultType', 'type', 'spot');
        return [ defaultType, params ];
    }

    handleSubTypeAndParams (methodName: string, market = undefined, params = {}, defaultValue = undefined) {
        let subType = undefined;
        // if set in params, it takes precedence
        const subTypeInParams = this.safeString2 (params, 'subType', 'defaultSubType');
        // avoid omitting if it's not present
        if (subTypeInParams !== undefined) {
            subType = subTypeInParams;
            params = this.omit (params, [ 'subType', 'defaultSubType' ]);
        } else {
            // at first, check from market object
            if (market !== undefined) {
                if (market['linear']) {
                    subType = 'linear';
                } else if (market['inverse']) {
                    subType = 'inverse';
                }
            }
            // if it was not defined in market object
            if (subType === undefined) {
                const values = this.handleOptionAndParams ({}, methodName, 'subType', defaultValue); // no need to re-test params here
                subType = values[0];
            }
        }
        return [ subType, params ];
    }

    handleMarginModeAndParams (methodName: string, params = {}, defaultValue = undefined) {
        /**
         * @ignore
         * @method
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Array} the marginMode in lowercase as specified by params["marginMode"], params["defaultMarginMode"] this.options["marginMode"] or this.options["defaultMarginMode"]
         */
        return this.handleOptionAndParams (params, methodName, 'marginMode', defaultValue);
    }

    throwExactlyMatchedException (exact, string, message) {
        if (string === undefined) {
            return;
        }
        if (string in exact) {
            throw new exact[string] (message);
        }
    }

    throwBroadlyMatchedException (broad, string, message) {
        const broadKey = this.findBroadlyMatchedKey (broad, string);
        if (broadKey !== undefined) {
            throw new broad[broadKey] (message);
        }
    }

    findBroadlyMatchedKey (broad, string) {
        // a helper for matching error strings exactly vs broadly
        const keys = Object.keys (broad);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (string !== undefined) { // #issues/12698
                if (string.indexOf (key) >= 0) {
                    return key;
                }
            }
        }
        return undefined;
    }

    handleErrors (statusCode: int, statusText: string, url: string, method: string, responseHeaders: Dict, responseBody: string, response, requestHeaders, requestBody) {
        // it is a stub method that must be overrided in the derived exchange classes
        // throw new NotSupported (this.id + ' handleErrors() not implemented yet');
        return undefined;
    }

    calculateRateLimiterCost (api, method, path, params, config = {}) {
        return this.safeValue (config, 'cost', 1);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        if (this.has['fetchTickers']) {
            await this.loadMarkets ();
            const market = this.market (symbol);
            symbol = market['symbol'];
            const tickers = await this.fetchTickers ([ symbol ], params);
            const ticker = this.safeDict (tickers, symbol);
            if (ticker === undefined) {
                throw new NullResponse (this.id + ' fetchTickers() could not find a ticker for ' + symbol);
            } else {
                return ticker as Ticker;
            }
        } else {
            throw new NotSupported (this.id + ' fetchTicker() is not supported yet');
        }
    }

    async fetchMarkPrice (symbol: string, params = {}): Promise<Ticker> {
        if (this.has['fetchMarkPrices']) {
            await this.loadMarkets ();
            const market = this.market (symbol);
            symbol = market['symbol'];
            const tickers = await this.fetchMarkPrices ([ symbol ], params);
            const ticker = this.safeDict (tickers, symbol);
            if (ticker === undefined) {
                throw new NullResponse (this.id + ' fetchMarkPrices() could not find a ticker for ' + symbol);
            } else {
                return ticker as Ticker;
            }
        } else {
            throw new NotSupported (this.id + ' fetchMarkPrices() is not supported yet');
        }
    }

    async fetchTickerWs (symbol: string, params = {}): Promise<Ticker> {
        if (this.has['fetchTickersWs']) {
            await this.loadMarkets ();
            const market = this.market (symbol);
            symbol = market['symbol'];
            const tickers = await this.fetchTickersWs ([ symbol ], params);
            const ticker = this.safeDict (tickers, symbol);
            if (ticker === undefined) {
                throw new NullResponse (this.id + ' fetchTickerWs() could not find a ticker for ' + symbol);
            } else {
                return ticker as Ticker;
            }
        } else {
            throw new NotSupported (this.id + ' fetchTickerWs() is not supported yet');
        }
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        throw new NotSupported (this.id + ' watchTicker() is not supported yet');
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        throw new NotSupported (this.id + ' fetchTickers() is not supported yet');
    }

    async fetchMarkPrices (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        throw new NotSupported (this.id + ' fetchMarkPrices() is not supported yet');
    }

    async fetchTickersWs (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        throw new NotSupported (this.id + ' fetchTickers() is not supported yet');
    }

    async fetchOrderBooks (symbols: Strings = undefined, limit: Int = undefined, params = {}): Promise<OrderBooks> {
        throw new NotSupported (this.id + ' fetchOrderBooks() is not supported yet');
    }

    async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        throw new NotSupported (this.id + ' watchBidsAsks() is not supported yet');
    }

    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        throw new NotSupported (this.id + ' watchTickers() is not supported yet');
    }

    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        throw new NotSupported (this.id + ' unWatchTickers() is not supported yet');
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        throw new NotSupported (this.id + ' fetchOrder() is not supported yet');
    }

    /**
     * @method
     * @name fetchOrderWithClientOrderId
     * @description create a market order by providing the symbol, side and cost
     * @param {string} clientOrderId client order Id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrderWithClientOrderId (clientOrderId: string, symbol: Str = undefined, params = {}) {
        const extendedParams = this.extend (params, { 'clientOrderId': clientOrderId });
        return await this.fetchOrder ('', symbol, extendedParams);
    }

    async fetchOrderWs (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        throw new NotSupported (this.id + ' fetchOrderWs() is not supported yet');
    }

    async fetchOrderStatus (id: string, symbol: Str = undefined, params = {}): Promise<string> {
        // TODO: TypeScript: change method signature by replacing
        // Promise<string> with Promise<Order['status']>.
        const order = await this.fetchOrder (id, symbol, params);
        return order['status'];
    }

    async fetchUnifiedOrder (order, params = {}): Promise<Order> {
        return await this.fetchOrder (this.safeString (order, 'id'), this.safeString (order, 'symbol'), params);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        throw new NotSupported (this.id + ' createOrder() is not supported yet');
    }

    async createConvertTrade (id: string, fromCode: string, toCode: string, amount: Num = undefined, params = {}): Promise<Conversion> {
        throw new NotSupported (this.id + ' createConvertTrade() is not supported yet');
    }

    async fetchConvertTrade (id: string, code: Str = undefined, params = {}): Promise<Conversion> {
        throw new NotSupported (this.id + ' fetchConvertTrade() is not supported yet');
    }

    async fetchConvertTradeHistory (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Conversion[]> {
        throw new NotSupported (this.id + ' fetchConvertTradeHistory() is not supported yet');
    }

    async fetchPositionMode (symbol: Str = undefined, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' fetchPositionMode() is not supported yet');
    }

    async createTrailingAmountOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, trailingAmount: Num = undefined, trailingTriggerPrice: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name createTrailingAmountOrder
         * @description create a trailing order by providing the symbol, type, side, amount, price and trailingAmount
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
         * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
         * @param {float} trailingAmount the quote amount to trail away from the current market price
         * @param {float} [trailingTriggerPrice] the price to activate a trailing order, default uses the price argument
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        if (trailingAmount === undefined) {
            throw new ArgumentsRequired (this.id + ' createTrailingAmountOrder() requires a trailingAmount argument');
        }
        params['trailingAmount'] = trailingAmount;
        if (trailingTriggerPrice !== undefined) {
            params['trailingTriggerPrice'] = trailingTriggerPrice;
        }
        if (this.has['createTrailingAmountOrder']) {
            return await this.createOrder (symbol, type, side, amount, price, params);
        }
        throw new NotSupported (this.id + ' createTrailingAmountOrder() is not supported yet');
    }

    async createTrailingAmountOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, trailingAmount: Num = undefined, trailingTriggerPrice: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name createTrailingAmountOrderWs
         * @description create a trailing order by providing the symbol, type, side, amount, price and trailingAmount
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
         * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
         * @param {float} trailingAmount the quote amount to trail away from the current market price
         * @param {float} [trailingTriggerPrice] the price to activate a trailing order, default uses the price argument
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        if (trailingAmount === undefined) {
            throw new ArgumentsRequired (this.id + ' createTrailingAmountOrderWs() requires a trailingAmount argument');
        }
        params['trailingAmount'] = trailingAmount;
        if (trailingTriggerPrice !== undefined) {
            params['trailingTriggerPrice'] = trailingTriggerPrice;
        }
        if (this.has['createTrailingAmountOrderWs']) {
            return await this.createOrderWs (symbol, type, side, amount, price, params);
        }
        throw new NotSupported (this.id + ' createTrailingAmountOrderWs() is not supported yet');
    }

    async createTrailingPercentOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, trailingPercent: Num = undefined, trailingTriggerPrice: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name createTrailingPercentOrder
         * @description create a trailing order by providing the symbol, type, side, amount, price and trailingPercent
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
         * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
         * @param {float} trailingPercent the percent to trail away from the current market price
         * @param {float} [trailingTriggerPrice] the price to activate a trailing order, default uses the price argument
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        if (trailingPercent === undefined) {
            throw new ArgumentsRequired (this.id + ' createTrailingPercentOrder() requires a trailingPercent argument');
        }
        params['trailingPercent'] = trailingPercent;
        if (trailingTriggerPrice !== undefined) {
            params['trailingTriggerPrice'] = trailingTriggerPrice;
        }
        if (this.has['createTrailingPercentOrder']) {
            return await this.createOrder (symbol, type, side, amount, price, params);
        }
        throw new NotSupported (this.id + ' createTrailingPercentOrder() is not supported yet');
    }

    async createTrailingPercentOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, trailingPercent: Num = undefined, trailingTriggerPrice: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name createTrailingPercentOrderWs
         * @description create a trailing order by providing the symbol, type, side, amount, price and trailingPercent
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
         * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
         * @param {float} trailingPercent the percent to trail away from the current market price
         * @param {float} [trailingTriggerPrice] the price to activate a trailing order, default uses the price argument
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        if (trailingPercent === undefined) {
            throw new ArgumentsRequired (this.id + ' createTrailingPercentOrderWs() requires a trailingPercent argument');
        }
        params['trailingPercent'] = trailingPercent;
        if (trailingTriggerPrice !== undefined) {
            params['trailingTriggerPrice'] = trailingTriggerPrice;
        }
        if (this.has['createTrailingPercentOrderWs']) {
            return await this.createOrderWs (symbol, type, side, amount, price, params);
        }
        throw new NotSupported (this.id + ' createTrailingPercentOrderWs() is not supported yet');
    }

    async createMarketOrderWithCost (symbol: string, side: OrderSide, cost: number, params = {}) {
        /**
         * @method
         * @name createMarketOrderWithCost
         * @description create a market order by providing the symbol, side and cost
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} side 'buy' or 'sell'
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        if (this.has['createMarketOrderWithCost'] || (this.has['createMarketBuyOrderWithCost'] && this.has['createMarketSellOrderWithCost'])) {
            return await this.createOrder (symbol, 'market', side, cost, 1, params);
        }
        throw new NotSupported (this.id + ' createMarketOrderWithCost() is not supported yet');
    }

    async createMarketBuyOrderWithCost (symbol: string, cost: number, params = {}): Promise<Order> {
        /**
         * @method
         * @name createMarketBuyOrderWithCost
         * @description create a market buy order by providing the symbol and cost
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        if (this.options['createMarketBuyOrderRequiresPrice'] || this.has['createMarketBuyOrderWithCost']) {
            return await this.createOrder (symbol, 'market', 'buy', cost, 1, params);
        }
        throw new NotSupported (this.id + ' createMarketBuyOrderWithCost() is not supported yet');
    }

    async createMarketSellOrderWithCost (symbol: string, cost: number, params = {}): Promise<Order> {
        /**
         * @method
         * @name createMarketSellOrderWithCost
         * @description create a market sell order by providing the symbol and cost
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        if (this.options['createMarketSellOrderRequiresPrice'] || this.has['createMarketSellOrderWithCost']) {
            return await this.createOrder (symbol, 'market', 'sell', cost, 1, params);
        }
        throw new NotSupported (this.id + ' createMarketSellOrderWithCost() is not supported yet');
    }

    async createMarketOrderWithCostWs (symbol: string, side: OrderSide, cost: number, params = {}) {
        /**
         * @method
         * @name createMarketOrderWithCostWs
         * @description create a market order by providing the symbol, side and cost
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} side 'buy' or 'sell'
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        if (this.has['createMarketOrderWithCostWs'] || (this.has['createMarketBuyOrderWithCostWs'] && this.has['createMarketSellOrderWithCostWs'])) {
            return await this.createOrderWs (symbol, 'market', side, cost, 1, params);
        }
        throw new NotSupported (this.id + ' createMarketOrderWithCostWs() is not supported yet');
    }

    async createTriggerOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, triggerPrice: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name createTriggerOrder
         * @description create a trigger stop order (type 1)
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
         * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {float} triggerPrice the price to trigger the stop order, in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        if (triggerPrice === undefined) {
            throw new ArgumentsRequired (this.id + ' createTriggerOrder() requires a triggerPrice argument');
        }
        params['triggerPrice'] = triggerPrice;
        if (this.has['createTriggerOrder']) {
            return await this.createOrder (symbol, type, side, amount, price, params);
        }
        throw new NotSupported (this.id + ' createTriggerOrder() is not supported yet');
    }

    async createTriggerOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, triggerPrice: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name createTriggerOrderWs
         * @description create a trigger stop order (type 1)
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
         * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {float} triggerPrice the price to trigger the stop order, in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        if (triggerPrice === undefined) {
            throw new ArgumentsRequired (this.id + ' createTriggerOrderWs() requires a triggerPrice argument');
        }
        params['triggerPrice'] = triggerPrice;
        if (this.has['createTriggerOrderWs']) {
            return await this.createOrderWs (symbol, type, side, amount, price, params);
        }
        throw new NotSupported (this.id + ' createTriggerOrderWs() is not supported yet');
    }

    async createStopLossOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, stopLossPrice: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name createStopLossOrder
         * @description create a trigger stop loss order (type 2)
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
         * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {float} stopLossPrice the price to trigger the stop loss order, in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        if (stopLossPrice === undefined) {
            throw new ArgumentsRequired (this.id + ' createStopLossOrder() requires a stopLossPrice argument');
        }
        params['stopLossPrice'] = stopLossPrice;
        if (this.has['createStopLossOrder']) {
            return await this.createOrder (symbol, type, side, amount, price, params);
        }
        throw new NotSupported (this.id + ' createStopLossOrder() is not supported yet');
    }

    async createStopLossOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, stopLossPrice: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name createStopLossOrderWs
         * @description create a trigger stop loss order (type 2)
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
         * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {float} stopLossPrice the price to trigger the stop loss order, in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        if (stopLossPrice === undefined) {
            throw new ArgumentsRequired (this.id + ' createStopLossOrderWs() requires a stopLossPrice argument');
        }
        params['stopLossPrice'] = stopLossPrice;
        if (this.has['createStopLossOrderWs']) {
            return await this.createOrderWs (symbol, type, side, amount, price, params);
        }
        throw new NotSupported (this.id + ' createStopLossOrderWs() is not supported yet');
    }

    async createTakeProfitOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, takeProfitPrice: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name createTakeProfitOrder
         * @description create a trigger take profit order (type 2)
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
         * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {float} takeProfitPrice the price to trigger the take profit order, in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        if (takeProfitPrice === undefined) {
            throw new ArgumentsRequired (this.id + ' createTakeProfitOrder() requires a takeProfitPrice argument');
        }
        params['takeProfitPrice'] = takeProfitPrice;
        if (this.has['createTakeProfitOrder']) {
            return await this.createOrder (symbol, type, side, amount, price, params);
        }
        throw new NotSupported (this.id + ' createTakeProfitOrder() is not supported yet');
    }

    async createTakeProfitOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, takeProfitPrice: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name createTakeProfitOrderWs
         * @description create a trigger take profit order (type 2)
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
         * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {float} takeProfitPrice the price to trigger the take profit order, in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        if (takeProfitPrice === undefined) {
            throw new ArgumentsRequired (this.id + ' createTakeProfitOrderWs() requires a takeProfitPrice argument');
        }
        params['takeProfitPrice'] = takeProfitPrice;
        if (this.has['createTakeProfitOrderWs']) {
            return await this.createOrderWs (symbol, type, side, amount, price, params);
        }
        throw new NotSupported (this.id + ' createTakeProfitOrderWs() is not supported yet');
    }

    async createOrderWithTakeProfitAndStopLoss (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, takeProfit: Num = undefined, stopLoss: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name createOrderWithTakeProfitAndStopLoss
         * @description create an order with a stop loss or take profit attached (type 3)
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
         * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {float} [takeProfit] the take profit price, in units of the quote currency
         * @param {float} [stopLoss] the stop loss price, in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.takeProfitType] *not available on all exchanges* 'limit' or 'market'
         * @param {string} [params.stopLossType] *not available on all exchanges* 'limit' or 'market'
         * @param {string} [params.takeProfitPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
         * @param {string} [params.stopLossPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
         * @param {float} [params.takeProfitLimitPrice] *not available on all exchanges* limit price for a limit take profit order
         * @param {float} [params.stopLossLimitPrice] *not available on all exchanges* stop loss for a limit stop loss order
         * @param {float} [params.takeProfitAmount] *not available on all exchanges* the amount for a take profit
         * @param {float} [params.stopLossAmount] *not available on all exchanges* the amount for a stop loss
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        params = this.setTakeProfitAndStopLossParams (symbol, type, side, amount, price, takeProfit, stopLoss, params);
        if (this.has['createOrderWithTakeProfitAndStopLoss']) {
            return await this.createOrder (symbol, type, side, amount, price, params);
        }
        throw new NotSupported (this.id + ' createOrderWithTakeProfitAndStopLoss() is not supported yet');
    }

    setTakeProfitAndStopLossParams (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, takeProfit: Num = undefined, stopLoss: Num = undefined, params = {}) {
        if ((takeProfit === undefined) && (stopLoss === undefined)) {
            throw new ArgumentsRequired (this.id + ' createOrderWithTakeProfitAndStopLoss() requires either a takeProfit or stopLoss argument');
        }
        if (takeProfit !== undefined) {
            params['takeProfit'] = {
                'triggerPrice': takeProfit,
            };
        }
        if (stopLoss !== undefined) {
            params['stopLoss'] = {
                'triggerPrice': stopLoss,
            };
        }
        const takeProfitType = this.safeString (params, 'takeProfitType');
        const takeProfitPriceType = this.safeString (params, 'takeProfitPriceType');
        const takeProfitLimitPrice = this.safeString (params, 'takeProfitLimitPrice');
        const takeProfitAmount = this.safeString (params, 'takeProfitAmount');
        const stopLossType = this.safeString (params, 'stopLossType');
        const stopLossPriceType = this.safeString (params, 'stopLossPriceType');
        const stopLossLimitPrice = this.safeString (params, 'stopLossLimitPrice');
        const stopLossAmount = this.safeString (params, 'stopLossAmount');
        if (takeProfitType !== undefined) {
            params['takeProfit']['type'] = takeProfitType;
        }
        if (takeProfitPriceType !== undefined) {
            params['takeProfit']['priceType'] = takeProfitPriceType;
        }
        if (takeProfitLimitPrice !== undefined) {
            params['takeProfit']['price'] = this.parseToNumeric (takeProfitLimitPrice);
        }
        if (takeProfitAmount !== undefined) {
            params['takeProfit']['amount'] = this.parseToNumeric (takeProfitAmount);
        }
        if (stopLossType !== undefined) {
            params['stopLoss']['type'] = stopLossType;
        }
        if (stopLossPriceType !== undefined) {
            params['stopLoss']['priceType'] = stopLossPriceType;
        }
        if (stopLossLimitPrice !== undefined) {
            params['stopLoss']['price'] = this.parseToNumeric (stopLossLimitPrice);
        }
        if (stopLossAmount !== undefined) {
            params['stopLoss']['amount'] = this.parseToNumeric (stopLossAmount);
        }
        params = this.omit (params, [ 'takeProfitType', 'takeProfitPriceType', 'takeProfitLimitPrice', 'takeProfitAmount', 'stopLossType', 'stopLossPriceType', 'stopLossLimitPrice', 'stopLossAmount' ]);
        return params;
    }

    async createOrderWithTakeProfitAndStopLossWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, takeProfit: Num = undefined, stopLoss: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name createOrderWithTakeProfitAndStopLossWs
         * @description create an order with a stop loss or take profit attached (type 3)
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
         * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {float} [takeProfit] the take profit price, in units of the quote currency
         * @param {float} [stopLoss] the stop loss price, in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.takeProfitType] *not available on all exchanges* 'limit' or 'market'
         * @param {string} [params.stopLossType] *not available on all exchanges* 'limit' or 'market'
         * @param {string} [params.takeProfitPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
         * @param {string} [params.stopLossPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
         * @param {float} [params.takeProfitLimitPrice] *not available on all exchanges* limit price for a limit take profit order
         * @param {float} [params.stopLossLimitPrice] *not available on all exchanges* stop loss for a limit stop loss order
         * @param {float} [params.takeProfitAmount] *not available on all exchanges* the amount for a take profit
         * @param {float} [params.stopLossAmount] *not available on all exchanges* the amount for a stop loss
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        params = this.setTakeProfitAndStopLossParams (symbol, type, side, amount, price, takeProfit, stopLoss, params);
        if (this.has['createOrderWithTakeProfitAndStopLossWs']) {
            return await this.createOrderWs (symbol, type, side, amount, price, params);
        }
        throw new NotSupported (this.id + ' createOrderWithTakeProfitAndStopLossWs() is not supported yet');
    }

    async createOrders (orders: OrderRequest[], params = {}): Promise<Order[]> {
        throw new NotSupported (this.id + ' createOrders() is not supported yet');
    }

    async editOrders (orders: OrderRequest[], params = {}): Promise<Order[]> {
        throw new NotSupported (this.id + ' editOrders() is not supported yet');
    }

    async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        throw new NotSupported (this.id + ' createOrderWs() is not supported yet');
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        throw new NotSupported (this.id + ' cancelOrder() is not supported yet');
    }

    /**
     * @method
     * @name cancelOrderWithClientOrderId
     * @description create a market order by providing the symbol, side and cost
     * @param {string} clientOrderId client order Id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrderWithClientOrderId (clientOrderId: string, symbol: Str = undefined, params = {}) {
        const extendedParams = this.extend (params, { 'clientOrderId': clientOrderId });
        return await this.cancelOrder ('', symbol, extendedParams);
    }

    async cancelOrderWs (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        throw new NotSupported (this.id + ' cancelOrderWs() is not supported yet');
    }

    async cancelOrders (ids: string[], symbol: Str = undefined, params = {}): Promise<Order[]> {
        throw new NotSupported (this.id + ' cancelOrders() is not supported yet');
    }

    /**
     * @method
     * @name cancelOrdersWithClientOrderIds
     * @description create a market order by providing the symbol, side and cost
     * @param {string[]} clientOrderIds client order Ids
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrdersWithClientOrderIds (clientOrderIds: string[], symbol: Str = undefined, params = {}) {
        const extendedParams = this.extend (params, { 'clientOrderIds': clientOrderIds });
        return await this.cancelOrders ([], symbol, extendedParams);
    }

    async cancelOrdersWs (ids: string[], symbol: Str = undefined, params = {}): Promise<Order[]> {
        throw new NotSupported (this.id + ' cancelOrdersWs() is not supported yet');
    }

    async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        throw new NotSupported (this.id + ' cancelAllOrders() is not supported yet');
    }

    async cancelAllOrdersAfter (timeout: Int, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' cancelAllOrdersAfter() is not supported yet');
    }

    async cancelOrdersForSymbols (orders: CancellationRequest[], params = {}): Promise<Order[]> {
        throw new NotSupported (this.id + ' cancelOrdersForSymbols() is not supported yet');
    }

    async cancelAllOrdersWs (symbol: Str = undefined, params = {}): Promise<Order[]> {
        throw new NotSupported (this.id + ' cancelAllOrdersWs() is not supported yet');
    }

    async cancelUnifiedOrder (order: Order, params = {}): Promise<{}> {
        return this.cancelOrder (this.safeString (order, 'id'), this.safeString (order, 'symbol'), params);
    }

    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.has['fetchOpenOrders'] && this.has['fetchClosedOrders']) {
            throw new NotSupported (this.id + ' fetchOrders() is not supported yet, consider using fetchOpenOrders() and fetchClosedOrders() instead');
        }
        throw new NotSupported (this.id + ' fetchOrders() is not supported yet');
    }

    async fetchOrdersWs (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        throw new NotSupported (this.id + ' fetchOrdersWs() is not supported yet');
    }

    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        throw new NotSupported (this.id + ' fetchOrderTrades() is not supported yet');
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        throw new NotSupported (this.id + ' watchOrders() is not supported yet');
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.has['fetchOrders']) {
            const orders = await this.fetchOrders (symbol, since, limit, params);
            return this.filterBy (orders, 'status', 'open') as Order[];
        }
        throw new NotSupported (this.id + ' fetchOpenOrders() is not supported yet');
    }

    async fetchOpenOrdersWs (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.has['fetchOrdersWs']) {
            const orders = await this.fetchOrdersWs (symbol, since, limit, params);
            return this.filterBy (orders, 'status', 'open') as Order[];
        }
        throw new NotSupported (this.id + ' fetchOpenOrdersWs() is not supported yet');
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.has['fetchOrders']) {
            const orders = await this.fetchOrders (symbol, since, limit, params);
            return this.filterBy (orders, 'status', 'closed') as Order[];
        }
        throw new NotSupported (this.id + ' fetchClosedOrders() is not supported yet');
    }

    async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        throw new NotSupported (this.id + ' fetchCanceledOrders() is not supported yet');
    }

    async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        throw new NotSupported (this.id + ' fetchCanceledAndClosedOrders() is not supported yet');
    }

    async fetchClosedOrdersWs (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.has['fetchOrdersWs']) {
            const orders = await this.fetchOrdersWs (symbol, since, limit, params);
            return this.filterBy (orders, 'status', 'closed') as Order[];
        }
        throw new NotSupported (this.id + ' fetchClosedOrdersWs() is not supported yet');
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        throw new NotSupported (this.id + ' fetchMyTrades() is not supported yet');
    }

    async fetchMyLiquidations (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Liquidation[]> {
        throw new NotSupported (this.id + ' fetchMyLiquidations() is not supported yet');
    }

    async fetchLiquidations (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Liquidation[]> {
        throw new NotSupported (this.id + ' fetchLiquidations() is not supported yet');
    }

    async fetchMyTradesWs (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        throw new NotSupported (this.id + ' fetchMyTradesWs() is not supported yet');
    }

    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        throw new NotSupported (this.id + ' watchMyTrades() is not supported yet');
    }

    async fetchGreeks (symbol: string, params = {}): Promise<Greeks> {
        throw new NotSupported (this.id + ' fetchGreeks() is not supported yet');
    }

    async fetchAllGreeks (symbols: Strings = undefined, params = {}): Promise<Greeks[]> {
        throw new NotSupported (this.id + ' fetchAllGreeks() is not supported yet');
    }

    async fetchOptionChain (code: string, params = {}): Promise<OptionChain> {
        throw new NotSupported (this.id + ' fetchOptionChain() is not supported yet');
    }

    async fetchOption (symbol: string, params = {}): Promise<Option> {
        throw new NotSupported (this.id + ' fetchOption() is not supported yet');
    }

    async fetchConvertQuote (fromCode: string, toCode: string, amount: Num = undefined, params = {}): Promise<Conversion> {
        throw new NotSupported (this.id + ' fetchConvertQuote() is not supported yet');
    }

    async fetchDepositsWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name exchange#fetchDepositsWithdrawals
         * @description fetch history of deposits and withdrawals
         * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
         * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
         * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
         */
        throw new NotSupported (this.id + ' fetchDepositsWithdrawals() is not supported yet');
    }

    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        throw new NotSupported (this.id + ' fetchDeposits() is not supported yet');
    }

    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        throw new NotSupported (this.id + ' fetchWithdrawals() is not supported yet');
    }

    async fetchDepositsWs (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' fetchDepositsWs() is not supported yet');
    }

    async fetchWithdrawalsWs (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' fetchWithdrawalsWs() is not supported yet');
    }

    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingRateHistory[]> {
        throw new NotSupported (this.id + ' fetchFundingRateHistory() is not supported yet');
    }

    async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingHistory[]> {
        throw new NotSupported (this.id + ' fetchFundingHistory() is not supported yet');
    }

    async closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order> {
        throw new NotSupported (this.id + ' closePosition() is not supported yet');
    }

    async closeAllPositions (params = {}): Promise<Position[]> {
        throw new NotSupported (this.id + ' closeAllPositions() is not supported yet');
    }

    async fetchL3OrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        throw new BadRequest (this.id + ' fetchL3OrderBook() is not supported yet');
    }

    parseLastPrice (price, market: Market = undefined): LastPrice {
        throw new NotSupported (this.id + ' parseLastPrice() is not supported yet');
    }

    async fetchDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        if (this.has['fetchDepositAddresses']) {
            const depositAddresses = await this.fetchDepositAddresses ([ code ], params);
            const depositAddress = this.safeValue (depositAddresses, code);
            if (depositAddress === undefined) {
                throw new InvalidAddress (this.id + ' fetchDepositAddress() could not find a deposit address for ' + code + ', make sure you have created a corresponding deposit address in your wallet on the exchange website');
            } else {
                return depositAddress;
            }
        } else if (this.has['fetchDepositAddressesByNetwork']) {
            const network = this.safeString (params, 'network');
            params = this.omit (params, 'network');
            const addressStructures = await this.fetchDepositAddressesByNetwork (code, params);
            if (network !== undefined) {
                return this.safeDict (addressStructures, network) as DepositAddress;
            } else {
                const keys = Object.keys (addressStructures);
                const key = this.safeString (keys, 0);
                return this.safeDict (addressStructures, key) as DepositAddress;
            }
        } else {
            throw new NotSupported (this.id + ' fetchDepositAddress() is not supported yet');
        }
    }

    account (): BalanceAccount {
        return {
            'free': undefined,
            'used': undefined,
            'total': undefined,
        };
    }

    commonCurrencyCode (code: string) {
        if (!this.substituteCommonCurrencyCodes) {
            return code;
        }
        return this.safeString (this.commonCurrencies, code, code);
    }

    currency (code: string) {
        const keys = Object.keys (this.currencies);
        const numCurrencies = keys.length;
        if (numCurrencies === 0) {
            throw new ExchangeError (this.id + ' currencies not loaded');
        }
        if (typeof code === 'string') {
            if (code in this.currencies) {
                return this.currencies[code];
            } else if (code in this.currencies_by_id) {
                return this.currencies_by_id[code];
            }
        }
        throw new ExchangeError (this.id + ' does not have currency code ' + code);
    }

    market (symbol: string): MarketInterface {
        if (this.markets === undefined) {
            throw new ExchangeError (this.id + ' markets not loaded');
        }
        if (symbol in this.markets) {
            return this.markets[symbol];
        } else if (symbol in this.markets_by_id) {
            const markets = this.markets_by_id[symbol];
            const defaultType = this.safeString2 (this.options, 'defaultType', 'defaultSubType', 'spot');
            for (let i = 0; i < markets.length; i++) {
                const market = markets[i];
                if (market[defaultType]) {
                    return market;
                }
            }
            return markets[0];
        } else if ((symbol.endsWith ('-C')) || (symbol.endsWith ('-P')) || (symbol.startsWith ('C-')) || (symbol.startsWith ('P-'))) {
            return this.createExpiredOptionMarket (symbol);
        }
        throw new BadSymbol (this.id + ' does not have market symbol ' + symbol);
    }

    createExpiredOptionMarket (symbol: string): MarketInterface {
        throw new NotSupported (this.id + ' createExpiredOptionMarket () is not supported yet');
    }

    isLeveragedCurrency (currencyCode, checkBaseCoin: Bool = false, existingCurrencies: Dict = undefined): boolean {
        const leverageSuffixes = [
            '2L', '2S', '3L', '3S', '4L', '4S', '5L', '5S', // Leveraged Tokens (LT)
            'UP', 'DOWN', // exchange-specific (e.g. BLVT)
            'BULL', 'BEAR', // similar
        ];
        for (let i = 0; i < leverageSuffixes.length; i++) {
            const leverageSuffix = leverageSuffixes[i];
            if (currencyCode.endsWith (leverageSuffix)) {
                if (!checkBaseCoin) {
                    return true;
                } else {
                    // check if base currency is inside dict
                    const baseCurrencyCode = currencyCode.replace (leverageSuffix, '');
                    if (baseCurrencyCode in existingCurrencies) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    handleWithdrawTagAndParams (tag, params): any {
        if ((tag !== undefined) && (typeof tag === 'object')) {
            params = this.extend (tag, params);
            tag = undefined;
        }
        if (tag === undefined) {
            tag = this.safeString (params, 'tag');
            if (tag !== undefined) {
                params = this.omit (params, 'tag');
            }
        }
        return [ tag, params ];
    }

    async createLimitOrder (symbol: string, side: OrderSide, amount: number, price: number, params = {}): Promise<Order> {
        return await this.createOrder (symbol, 'limit', side, amount, price, params);
    }

    async createLimitOrderWs (symbol: string, side: OrderSide, amount: number, price: number, params = {}): Promise<Order> {
        return await this.createOrderWs (symbol, 'limit', side, amount, price, params);
    }

    async createMarketOrder (symbol: string, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        return await this.createOrder (symbol, 'market', side, amount, price, params);
    }

    async createMarketOrderWs (symbol: string, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        return await this.createOrderWs (symbol, 'market', side, amount, price, params);
    }

    async createLimitBuyOrder (symbol: string, amount: number, price: number, params = {}): Promise<Order> {
        return await this.createOrder (symbol, 'limit', 'buy', amount, price, params);
    }

    async createLimitBuyOrderWs (symbol: string, amount: number, price: number, params = {}): Promise<Order> {
        return await this.createOrderWs (symbol, 'limit', 'buy', amount, price, params);
    }

    async createLimitSellOrder (symbol: string, amount: number, price: number, params = {}): Promise<Order> {
        return await this.createOrder (symbol, 'limit', 'sell', amount, price, params);
    }

    async createLimitSellOrderWs (symbol: string, amount: number, price: number, params = {}): Promise<Order> {
        return await this.createOrderWs (symbol, 'limit', 'sell', amount, price, params);
    }

    async createMarketBuyOrder (symbol: string, amount: number, params = {}): Promise<Order> {
        return await this.createOrder (symbol, 'market', 'buy', amount, undefined, params);
    }

    async createMarketBuyOrderWs (symbol: string, amount: number, params = {}): Promise<Order> {
        return await this.createOrderWs (symbol, 'market', 'buy', amount, undefined, params);
    }

    async createMarketSellOrder (symbol: string, amount: number, params = {}): Promise<Order> {
        return await this.createOrder (symbol, 'market', 'sell', amount, undefined, params);
    }

    async createMarketSellOrderWs (symbol: string, amount: number, params = {}): Promise<Order> {
        return await this.createOrderWs (symbol, 'market', 'sell', amount, undefined, params);
    }

    costToPrecision (symbol: string, cost) {
        if (cost === undefined) {
            return undefined;
        }
        const market = this.market (symbol);
        return this.decimalToPrecision (cost, TRUNCATE, market['precision']['price'], this.precisionMode, this.paddingMode);
    }

    priceToPrecision (symbol: string, price): string {
        if (price === undefined) {
            return undefined;
        }
        const market = this.market (symbol);
        const result = this.decimalToPrecision (price, ROUND, market['precision']['price'], this.precisionMode, this.paddingMode);
        if (result === '0') {
            throw new InvalidOrder (this.id + ' price of ' + market['symbol'] + ' must be greater than minimum price precision of ' + this.numberToString (market['precision']['price']));
        }
        return result;
    }

    amountToPrecision (symbol: string, amount) {
        if (amount === undefined) {
            return undefined;
        }
        const market = this.market (symbol);
        const result = this.decimalToPrecision (amount, TRUNCATE, market['precision']['amount'], this.precisionMode, this.paddingMode);
        if (result === '0') {
            throw new InvalidOrder (this.id + ' amount of ' + market['symbol'] + ' must be greater than minimum amount precision of ' + this.numberToString (market['precision']['amount']));
        }
        return result;
    }

    feeToPrecision (symbol: string, fee) {
        if (fee === undefined) {
            return undefined;
        }
        const market = this.market (symbol);
        return this.decimalToPrecision (fee, ROUND, market['precision']['price'], this.precisionMode, this.paddingMode);
    }

    currencyToPrecision (code: string, fee, networkCode = undefined) {
        const currency = this.currencies[code];
        let precision = this.safeValue (currency, 'precision');
        if (networkCode !== undefined) {
            const networks = this.safeDict (currency, 'networks', {});
            const networkItem = this.safeDict (networks, networkCode, {});
            precision = this.safeValue (networkItem, 'precision', precision);
        }
        if (precision === undefined) {
            return this.forceString (fee);
        } else {
            const roundingMode = this.safeInteger (this.options, 'currencyToPrecisionRoundingMode', ROUND);
            return this.decimalToPrecision (fee, roundingMode, precision, this.precisionMode, this.paddingMode);
        }
    }

    forceString (value) {
        if (typeof value !== 'string') {
            return this.numberToString (value);
        }
        return value;
    }

    isTickPrecision () {
        return this.precisionMode === TICK_SIZE;
    }

    isDecimalPrecision () {
        return this.precisionMode === DECIMAL_PLACES;
    }

    isSignificantPrecision () {
        return this.precisionMode === SIGNIFICANT_DIGITS;
    }

    safeNumber (obj, key: IndexType, defaultNumber: Num = undefined): Num {
        const value = this.safeString (obj, key);
        return this.parseNumber (value, defaultNumber);
    }

    safeNumberN (obj: object, arr: IndexType[], defaultNumber: Num = undefined): Num {
        const value = this.safeStringN (obj, arr);
        return this.parseNumber (value, defaultNumber);
    }

    parsePrecision (precision?: string) {
        /**
         * @ignore
         * @method
         * @param {string} precision The number of digits to the right of the decimal
         * @returns {string} a string number equal to 1e-precision
         */
        if (precision === undefined) {
            return undefined;
        }
        const precisionNumber = parseInt (precision);
        if (precisionNumber === 0) {
            return '1';
        }
        if (precisionNumber > 0) {
            let parsedPrecision = '0.';
            for (let i = 0; i < precisionNumber - 1; i++) {
                parsedPrecision = parsedPrecision + '0';
            }
            return parsedPrecision + '1';
        } else {
            let parsedPrecision = '1';
            for (let i = 0; i < precisionNumber * -1 - 1; i++) {
                parsedPrecision = parsedPrecision + '0';
            }
            return parsedPrecision + '0';
        }
    }

    integerPrecisionToAmount (precision: Str) {
        /**
         * @ignore
         * @method
         * @description handles positive & negative numbers too. parsePrecision() does not handle negative numbers, but this method handles
         * @param {string} precision The number of digits to the right of the decimal
         * @returns {string} a string number equal to 1e-precision
         */
        if (precision === undefined) {
            return undefined;
        }
        if (Precise.stringGe (precision, '0')) {
            return this.parsePrecision (precision);
        } else {
            const positivePrecisionString = Precise.stringAbs (precision);
            const positivePrecision = parseInt (positivePrecisionString);
            let parsedPrecision = '1';
            for (let i = 0; i < positivePrecision - 1; i++) {
                parsedPrecision = parsedPrecision + '0';
            }
            return parsedPrecision + '0';
        }
    }

    async loadTimeDifference (params = {}) {
        const serverTime = await this.fetchTime (params);
        const after = this.milliseconds ();
        this.options['timeDifference'] = after - serverTime;
        return this.options['timeDifference'];
    }

    implodeHostname (url: string) {
        return this.implodeParams (url, { 'hostname': this.hostname });
    }

    async fetchMarketLeverageTiers (symbol: string, params = {}): Promise<LeverageTier[]> {
        if (this.has['fetchLeverageTiers']) {
            const market = this.market (symbol);
            if (!market['contract']) {
                throw new BadSymbol (this.id + ' fetchMarketLeverageTiers() supports contract markets only');
            }
            const tiers = await this.fetchLeverageTiers ([ symbol ]);
            return this.safeValue (tiers, symbol);
        } else {
            throw new NotSupported (this.id + ' fetchMarketLeverageTiers() is not supported yet');
        }
    }

    async createPostOnlyOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        if (!this.has['createPostOnlyOrder']) {
            throw new NotSupported (this.id + ' createPostOnlyOrder() is not supported yet');
        }
        const query = this.extend (params, { 'postOnly': true });
        return await this.createOrder (symbol, type, side, amount, price, query);
    }

    async createPostOnlyOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        if (!this.has['createPostOnlyOrderWs']) {
            throw new NotSupported (this.id + ' createPostOnlyOrderWs() is not supported yet');
        }
        const query = this.extend (params, { 'postOnly': true });
        return await this.createOrderWs (symbol, type, side, amount, price, query);
    }

    async createReduceOnlyOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        if (!this.has['createReduceOnlyOrder']) {
            throw new NotSupported (this.id + ' createReduceOnlyOrder() is not supported yet');
        }
        const query = this.extend (params, { 'reduceOnly': true });
        return await this.createOrder (symbol, type, side, amount, price, query);
    }

    async createReduceOnlyOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        if (!this.has['createReduceOnlyOrderWs']) {
            throw new NotSupported (this.id + ' createReduceOnlyOrderWs() is not supported yet');
        }
        const query = this.extend (params, { 'reduceOnly': true });
        return await this.createOrderWs (symbol, type, side, amount, price, query);
    }

    async createStopOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, triggerPrice: Num = undefined, params = {}) {
        if (!this.has['createStopOrder']) {
            throw new NotSupported (this.id + ' createStopOrder() is not supported yet');
        }
        if (triggerPrice === undefined) {
            throw new ArgumentsRequired (this.id + ' create_stop_order() requires a stopPrice argument');
        }
        const query = this.extend (params, { 'stopPrice': triggerPrice });
        return await this.createOrder (symbol, type, side, amount, price, query);
    }

    async createStopOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, triggerPrice: Num = undefined, params = {}) {
        if (!this.has['createStopOrderWs']) {
            throw new NotSupported (this.id + ' createStopOrderWs() is not supported yet');
        }
        if (triggerPrice === undefined) {
            throw new ArgumentsRequired (this.id + ' createStopOrderWs() requires a stopPrice argument');
        }
        const query = this.extend (params, { 'stopPrice': triggerPrice });
        return await this.createOrderWs (symbol, type, side, amount, price, query);
    }

    async createStopLimitOrder (symbol: string, side: OrderSide, amount: number, price: number, triggerPrice: number, params = {}) {
        if (!this.has['createStopLimitOrder']) {
            throw new NotSupported (this.id + ' createStopLimitOrder() is not supported yet');
        }
        const query = this.extend (params, { 'stopPrice': triggerPrice });
        return await this.createOrder (symbol, 'limit', side, amount, price, query);
    }

    async createStopLimitOrderWs (symbol: string, side: OrderSide, amount: number, price: number, triggerPrice: number, params = {}) {
        if (!this.has['createStopLimitOrderWs']) {
            throw new NotSupported (this.id + ' createStopLimitOrderWs() is not supported yet');
        }
        const query = this.extend (params, { 'stopPrice': triggerPrice });
        return await this.createOrderWs (symbol, 'limit', side, amount, price, query);
    }

    async createStopMarketOrder (symbol: string, side: OrderSide, amount: number, triggerPrice: number, params = {}) {
        if (!this.has['createStopMarketOrder']) {
            throw new NotSupported (this.id + ' createStopMarketOrder() is not supported yet');
        }
        const query = this.extend (params, { 'stopPrice': triggerPrice });
        return await this.createOrder (symbol, 'market', side, amount, undefined, query);
    }

    async createStopMarketOrderWs (symbol: string, side: OrderSide, amount: number, triggerPrice: number, params = {}) {
        if (!this.has['createStopMarketOrderWs']) {
            throw new NotSupported (this.id + ' createStopMarketOrderWs() is not supported yet');
        }
        const query = this.extend (params, { 'stopPrice': triggerPrice });
        return await this.createOrderWs (symbol, 'market', side, amount, undefined, query);
    }

    async createSubAccount (name: string, params = {}): Promise<{}> {
        throw new NotSupported (this.id + ' createSubAccount() is not supported yet');
    }

    safeCurrencyCode (currencyId: Str, currency: Currency = undefined): Str {
        currency = this.safeCurrency (currencyId, currency);
        return currency['code'];
    }

    filterBySymbolSinceLimit (array, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, tail = false) {
        return this.filterByValueSinceLimit (array, 'symbol', symbol, since, limit, 'timestamp', tail);
    }

    filterByCurrencySinceLimit (array, code = undefined, since: Int = undefined, limit: Int = undefined, tail = false) {
        return this.filterByValueSinceLimit (array, 'currency', code, since, limit, 'timestamp', tail);
    }

    filterBySymbolsSinceLimit (array, symbols: string[] = undefined, since: Int = undefined, limit: Int = undefined, tail = false) {
        const result = this.filterByArray (array, 'symbol', symbols, false);
        return this.filterBySinceLimit (result, since, limit, 'timestamp', tail);
    }

    parseLastPrices (pricesData, symbols: string[] = undefined, params = {}): LastPrices {
        //
        // the value of tickers is either a dict or a list
        //
        // dict
        //
        //     {
        //         'marketId1': { ... },
        //         'marketId2': { ... },
        //         ...
        //     }
        //
        // list
        //
        //     [
        //         { 'market': 'marketId1', ... },
        //         { 'market': 'marketId2', ... },
        //         ...
        //     ]
        //
        const results = [];
        if (Array.isArray (pricesData)) {
            for (let i = 0; i < pricesData.length; i++) {
                const priceData = this.extend (this.parseLastPrice (pricesData[i]), params);
                results.push (priceData);
            }
        } else {
            const marketIds = Object.keys (pricesData);
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const market = this.safeMarket (marketId);
                const priceData = this.extend (this.parseLastPrice (pricesData[marketId], market), params);
                results.push (priceData);
            }
        }
        symbols = this.marketSymbols (symbols);
        return this.filterByArray (results, 'symbol', symbols);
    }

    parseTickers (tickers, symbols: Strings = undefined, params = {}): Tickers {
        //
        // the value of tickers is either a dict or a list
        //
        //
        // dict
        //
        //     {
        //         'marketId1': { ... },
        //         'marketId2': { ... },
        //         'marketId3': { ... },
        //         ...
        //     }
        //
        // list
        //
        //     [
        //         { 'market': 'marketId1', ... },
        //         { 'market': 'marketId2', ... },
        //         { 'market': 'marketId3', ... },
        //         ...
        //     ]
        //
        const results = [];
        if (Array.isArray (tickers)) {
            for (let i = 0; i < tickers.length; i++) {
                const parsedTicker = this.parseTicker (tickers[i]);
                const ticker = this.extend (parsedTicker, params);
                results.push (ticker);
            }
        } else {
            const marketIds = Object.keys (tickers);
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const market = this.safeMarket (marketId);
                const parsed = this.parseTicker (tickers[marketId], market);
                const ticker = this.extend (parsed, params);
                results.push (ticker);
            }
        }
        symbols = this.marketSymbols (symbols);
        return this.filterByArray (results, 'symbol', symbols);
    }

    parseDepositAddresses (addresses, codes: Strings = undefined, indexed = true, params = {}): DepositAddress[] {
        let result = [];
        for (let i = 0; i < addresses.length; i++) {
            const address = this.extend (this.parseDepositAddress (addresses[i]), params);
            result.push (address);
        }
        if (codes !== undefined) {
            result = this.filterByArray (result, 'currency', codes, false);
        }
        if (indexed) {
            result = this.filterByArray (result, 'currency', undefined, indexed);
        }
        return result as DepositAddress[];
    }

    parseBorrowInterests (response, market: Market = undefined): BorrowInterest[] {
        const interests = [];
        for (let i = 0; i < response.length; i++) {
            const row = response[i];
            interests.push (this.parseBorrowInterest (row, market));
        }
        return interests as BorrowInterest[];
    }

    parseBorrowRate (info, currency: Currency = undefined): Dict {
        throw new NotSupported (this.id + ' parseBorrowRate() is not supported yet');
    }

    parseBorrowRateHistory (response, code: Str, since: Int, limit: Int) {
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            const borrowRate = this.parseBorrowRate (item);
            result.push (borrowRate);
        }
        const sorted = this.sortBy (result, 'timestamp');
        return this.filterByCurrencySinceLimit (sorted, code, since, limit);
    }

    parseIsolatedBorrowRates (info: any): IsolatedBorrowRates {
        const result = {};
        for (let i = 0; i < info.length; i++) {
            const item = info[i];
            const borrowRate = this.parseIsolatedBorrowRate (item);
            const symbol = this.safeString (borrowRate, 'symbol');
            result[symbol] = borrowRate;
        }
        return result as any;
    }

    parseFundingRateHistories (response, market = undefined, since: Int = undefined, limit: Int = undefined): FundingRateHistory[] {
        const rates = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            rates.push (this.parseFundingRateHistory (entry, market));
        }
        const sorted = this.sortBy (rates, 'timestamp');
        const symbol = (market === undefined) ? undefined : market['symbol'];
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit) as FundingRateHistory[];
    }

    safeSymbol (marketId: Str, market: Market = undefined, delimiter: Str = undefined, marketType: Str = undefined): string {
        market = this.safeMarket (marketId, market, delimiter, marketType);
        return market['symbol'];
    }

    parseFundingRate (contract: string, market: Market = undefined): FundingRate {
        throw new NotSupported (this.id + ' parseFundingRate() is not supported yet');
    }

    parseFundingRates (response, symbols: Strings = undefined): FundingRates {
        const fundingRates = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const parsed = this.parseFundingRate (entry);
            fundingRates[parsed['symbol']] = parsed;
        }
        return this.filterByArray (fundingRates, 'symbol', symbols);
    }

    parseLongShortRatio (info: Dict, market: Market = undefined): LongShortRatio {
        throw new NotSupported (this.id + ' parseLongShortRatio() is not supported yet');
    }

    parseLongShortRatioHistory (response, market = undefined, since: Int = undefined, limit: Int = undefined): LongShortRatio[] {
        const rates = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            rates.push (this.parseLongShortRatio (entry, market));
        }
        const sorted = this.sortBy (rates, 'timestamp');
        const symbol = (market === undefined) ? undefined : market['symbol'];
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit) as LongShortRatio[];
    }

    handleTriggerPricesAndParams (symbol, params, omitParams = true) {
        //
        const triggerPrice = this.safeString2 (params, 'triggerPrice', 'stopPrice');
        let triggerPriceStr: Str = undefined;
        const stopLossPrice = this.safeString (params, 'stopLossPrice');
        let stopLossPriceStr: Str = undefined;
        const takeProfitPrice = this.safeString (params, 'takeProfitPrice');
        let takeProfitPriceStr: Str = undefined;
        //
        if (triggerPrice !== undefined) {
            if (omitParams) {
                params = this.omit (params, [ 'triggerPrice', 'stopPrice' ]);
            }
            triggerPriceStr = this.priceToPrecision (symbol, parseFloat (triggerPrice));
        }
        if (stopLossPrice !== undefined) {
            if (omitParams) {
                params = this.omit (params, 'stopLossPrice');
            }
            stopLossPriceStr = this.priceToPrecision (symbol, parseFloat (stopLossPrice));
        }
        if (takeProfitPrice !== undefined) {
            if (omitParams) {
                params = this.omit (params, 'takeProfitPrice');
            }
            takeProfitPriceStr = this.priceToPrecision (symbol, parseFloat (takeProfitPrice));
        }
        return [ triggerPriceStr, stopLossPriceStr, takeProfitPriceStr, params ];
    }

    handleTriggerDirectionAndParams (params, exchangeSpecificKey: Str = undefined, allowEmpty: Bool = false) {
        /**
         * @ignore
         * @method
         * @returns {[string, object]} the trigger-direction value and omited params
         */
        let triggerDirection = this.safeString (params, 'triggerDirection');
        const exchangeSpecificDefined = (exchangeSpecificKey !== undefined) && (exchangeSpecificKey in params);
        if (triggerDirection !== undefined) {
            params = this.omit (params, 'triggerDirection');
        }
        // throw exception if:
        // A) if provided value is not unified (support old "up/down" strings too)
        // B) if exchange specific "trigger direction key" (eg. "stopPriceSide") was not provided
        if (!this.inArray (triggerDirection, [ 'ascending', 'descending', 'up', 'down', 'above', 'below' ]) && !exchangeSpecificDefined && !allowEmpty) {
            throw new ArgumentsRequired (this.id + ' createOrder() : trigger orders require params["triggerDirection"] to be either "ascending" or "descending"');
        }
        // if old format was provided, overwrite to new
        if (triggerDirection === 'up' || triggerDirection === 'above') {
            triggerDirection = 'ascending';
        } else if (triggerDirection === 'down' || triggerDirection === 'below') {
            triggerDirection = 'descending';
        }
        return [ triggerDirection, params ];
    }

    handleTriggerAndParams (params) {
        const isTrigger = this.safeBool2 (params, 'trigger', 'stop');
        if (isTrigger) {
            params = this.omit (params, [ 'trigger', 'stop' ]);
        }
        return [ isTrigger, params ];
    }

    isTriggerOrder (params) {
        // for backwards compatibility
        return this.handleTriggerAndParams (params);
    }

    isPostOnly (isMarketOrder: boolean, exchangeSpecificParam, params = {}) {
        /**
         * @ignore
         * @method
         * @param {string} type Order type
         * @param {boolean} exchangeSpecificParam exchange specific postOnly
         * @param {object} [params] exchange specific params
         * @returns {boolean} true if a post only order, false otherwise
         */
        const timeInForce = this.safeStringUpper (params, 'timeInForce');
        let postOnly = this.safeBool2 (params, 'postOnly', 'post_only', false);
        // we assume timeInForce is uppercase from safeStringUpper (params, 'timeInForce')
        const ioc = timeInForce === 'IOC';
        const fok = timeInForce === 'FOK';
        const timeInForcePostOnly = timeInForce === 'PO';
        postOnly = postOnly || timeInForcePostOnly || exchangeSpecificParam;
        if (postOnly) {
            if (ioc || fok) {
                throw new InvalidOrder (this.id + ' postOnly orders cannot have timeInForce equal to ' + timeInForce);
            } else if (isMarketOrder) {
                throw new InvalidOrder (this.id + ' market orders cannot be postOnly');
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    handlePostOnly (isMarketOrder: boolean, exchangeSpecificPostOnlyOption: boolean, params: any = {}) {
        /**
         * @ignore
         * @method
         * @param {string} type Order type
         * @param {boolean} exchangeSpecificBoolean exchange specific postOnly
         * @param {object} [params] exchange specific params
         * @returns {Array}
         */
        const timeInForce = this.safeStringUpper (params, 'timeInForce');
        let postOnly = this.safeBool (params, 'postOnly', false);
        const ioc = timeInForce === 'IOC';
        const fok = timeInForce === 'FOK';
        const po = timeInForce === 'PO';
        postOnly = postOnly || po || exchangeSpecificPostOnlyOption;
        if (postOnly) {
            if (ioc || fok) {
                throw new InvalidOrder (this.id + ' postOnly orders cannot have timeInForce equal to ' + timeInForce);
            } else if (isMarketOrder) {
                throw new InvalidOrder (this.id + ' market orders cannot be postOnly');
            } else {
                if (po) {
                    params = this.omit (params, 'timeInForce');
                }
                params = this.omit (params, 'postOnly');
                return [ true, params ];
            }
        }
        return [ false, params ];
    }

    async fetchLastPrices (symbols: Strings = undefined, params = {}): Promise<LastPrices> {
        throw new NotSupported (this.id + ' fetchLastPrices() is not supported yet');
    }

    async fetchTradingFees (params = {}): Promise<TradingFees> {
        throw new NotSupported (this.id + ' fetchTradingFees() is not supported yet');
    }

    async fetchTradingFeesWs (params = {}): Promise<TradingFees> {
        throw new NotSupported (this.id + ' fetchTradingFeesWs() is not supported yet');
    }

    async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        if (!this.has['fetchTradingFees']) {
            throw new NotSupported (this.id + ' fetchTradingFee() is not supported yet');
        }
        const fees = await this.fetchTradingFees (params);
        return this.safeDict (fees, symbol) as TradingFeeInterface;
    }

    async fetchConvertCurrencies (params = {}): Promise<Currencies> {
        throw new NotSupported (this.id + ' fetchConvertCurrencies() is not supported yet');
    }

    parseOpenInterest (interest, market: Market = undefined): OpenInterest {
        throw new NotSupported (this.id + ' parseOpenInterest () is not supported yet');
    }

    parseOpenInterests (response, symbols: Strings = undefined): OpenInterests {
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const parsed = this.parseOpenInterest (entry);
            result[parsed['symbol']] = parsed;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseOpenInterestsHistory (response, market = undefined, since: Int = undefined, limit: Int = undefined): OpenInterest[] {
        const interests = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const interest = this.parseOpenInterest (entry, market);
            interests.push (interest);
        }
        const sorted = this.sortBy (interests, 'timestamp');
        const symbol = this.safeString (market, 'symbol');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        if (this.has['fetchFundingRates']) {
            await this.loadMarkets ();
            const market = this.market (symbol);
            symbol = market['symbol'];
            if (!market['contract']) {
                throw new BadSymbol (this.id + ' fetchFundingRate() supports contract markets only');
            }
            const rates = await this.fetchFundingRates ([ symbol ], params);
            const rate = this.safeValue (rates, symbol);
            if (rate === undefined) {
                throw new NullResponse (this.id + ' fetchFundingRate () returned no data for ' + symbol);
            } else {
                return rate;
            }
        } else {
            throw new NotSupported (this.id + ' fetchFundingRate () is not supported yet');
        }
    }

    async fetchFundingInterval (symbol: string, params = {}): Promise<FundingRate> {
        if (this.has['fetchFundingIntervals']) {
            await this.loadMarkets ();
            const market = this.market (symbol);
            symbol = market['symbol'];
            if (!market['contract']) {
                throw new BadSymbol (this.id + ' fetchFundingInterval() supports contract markets only');
            }
            const rates = await this.fetchFundingIntervals ([ symbol ], params);
            const rate = this.safeValue (rates, symbol);
            if (rate === undefined) {
                throw new NullResponse (this.id + ' fetchFundingInterval() returned no data for ' + symbol);
            } else {
                return rate;
            }
        } else {
            throw new NotSupported (this.id + ' fetchFundingInterval() is not supported yet');
        }
    }

    async fetchMarkOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name exchange#fetchMarkOHLCV
         * @description fetches historical mark price candlestick data containing the open, high, low, and close price of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {float[][]} A list of candles ordered as timestamp, open, high, low, close, undefined
         */
        if (this.has['fetchMarkOHLCV']) {
            const request: Dict = {
                'price': 'mark',
            };
            return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchMarkOHLCV () is not supported yet');
        }
    }

    async fetchIndexOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name exchange#fetchIndexOHLCV
         * @description fetches historical index price candlestick data containing the open, high, low, and close price of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {} A list of candles ordered as timestamp, open, high, low, close, undefined
         */
        if (this.has['fetchIndexOHLCV']) {
            const request: Dict = {
                'price': 'index',
            };
            return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchIndexOHLCV () is not supported yet');
        }
    }

    async fetchPremiumIndexOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name exchange#fetchPremiumIndexOHLCV
         * @description fetches historical premium index price candlestick data containing the open, high, low, and close price of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {float[][]} A list of candles ordered as timestamp, open, high, low, close, undefined
         */
        if (this.has['fetchPremiumIndexOHLCV']) {
            const request: Dict = {
                'price': 'premiumIndex',
            };
            return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchPremiumIndexOHLCV () is not supported yet');
        }
    }

    handleTimeInForce (params = {}) {
        /**
         * @ignore
         * @method
         * Must add timeInForce to this.options to use this method
         * @returns {string} returns the exchange specific value for timeInForce
         */
        const timeInForce = this.safeStringUpper (params, 'timeInForce'); // supported values GTC, IOC, PO
        if (timeInForce !== undefined) {
            const exchangeValue = this.safeString (this.options['timeInForce'], timeInForce);
            if (exchangeValue === undefined) {
                throw new ExchangeError (this.id + ' does not support timeInForce "' + timeInForce + '"');
            }
            return exchangeValue;
        }
        return undefined;
    }

    convertTypeToAccount (account) {
        /**
         * @ignore
         * @method
         * Must add accountsByType to this.options to use this method
         * @param {string} account key for account name in this.options['accountsByType']
         * @returns the exchange specific account name or the isolated margin id for transfers
         */
        const accountsByType = this.safeDict (this.options, 'accountsByType', {});
        const lowercaseAccount = account.toLowerCase ();
        if (lowercaseAccount in accountsByType) {
            return accountsByType[lowercaseAccount];
        } else if ((account in this.markets) || (account in this.markets_by_id)) {
            const market = this.market (account);
            return market['id'];
        } else {
            return account;
        }
    }

    checkRequiredArgument (methodName: string, argument, argumentName, options = []) {
        /**
         * @ignore
         * @method
         * @param {string} methodName the name of the method that the argument is being checked for
         * @param {string} argument the argument's actual value provided
         * @param {string} argumentName the name of the argument being checked (for logging purposes)
         * @param {string[]} options a list of options that the argument can be
         * @returns {undefined}
         */
        const optionsLength = options.length;
        if ((argument === undefined) || ((optionsLength > 0) && (!(this.inArray (argument, options))))) {
            const messageOptions = options.join (', ');
            let message = this.id + ' ' + methodName + '() requires a ' + argumentName + ' argument';
            if (messageOptions !== '') {
                message += ', one of ' + '(' + messageOptions + ')';
            }
            throw new ArgumentsRequired (message);
        }
    }

    checkRequiredMarginArgument (methodName: string, symbol: Str, marginMode: string) {
        /**
         * @ignore
         * @method
         * @param {string} symbol unified symbol of the market
         * @param {string} methodName name of the method that requires a symbol
         * @param {string} marginMode is either 'isolated' or 'cross'
         */
        if ((marginMode === 'isolated') && (symbol === undefined)) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a symbol argument for isolated margin');
        } else if ((marginMode === 'cross') && (symbol !== undefined)) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() cannot have a symbol argument for cross margin');
        }
    }

    parseDepositWithdrawFees (response, codes: Strings = undefined, currencyIdKey = undefined): any {
        /**
         * @ignore
         * @method
         * @param {object[]|object} response unparsed response from the exchange
         * @param {string[]|undefined} codes the unified currency codes to fetch transactions fees for, returns all currencies when undefined
         * @param {str} currencyIdKey *should only be undefined when response is a dictionary* the object key that corresponds to the currency id
         * @returns {object} objects with withdraw and deposit fees, indexed by currency codes
         */
        const depositWithdrawFees = {};
        const isArray = Array.isArray (response);
        let responseKeys = response;
        if (!isArray) {
            responseKeys = Object.keys (response);
        }
        for (let i = 0; i < responseKeys.length; i++) {
            const entry = responseKeys[i];
            const dictionary = isArray ? entry : response[entry];
            const currencyId = isArray ? this.safeString (dictionary, currencyIdKey) : entry;
            const currency = this.safeCurrency (currencyId);
            const code = this.safeString (currency, 'code');
            if ((codes === undefined) || (this.inArray (code, codes))) {
                depositWithdrawFees[code] = this.parseDepositWithdrawFee (dictionary, currency);
            }
        }
        return depositWithdrawFees;
    }

    parseDepositWithdrawFee (fee, currency: Currency = undefined): any {
        throw new NotSupported (this.id + ' parseDepositWithdrawFee() is not supported yet');
    }

    depositWithdrawFee (info): any {
        return {
            'info': info,
            'withdraw': {
                'fee': undefined,
                'percentage': undefined,
            },
            'deposit': {
                'fee': undefined,
                'percentage': undefined,
            },
            'networks': {},
        };
    }

    assignDefaultDepositWithdrawFees (fee, currency = undefined): any {
        /**
         * @ignore
         * @method
         * @description Takes a depositWithdrawFee structure and assigns the default values for withdraw and deposit
         * @param {object} fee A deposit withdraw fee structure
         * @param {object} currency A currency structure, the response from this.currency ()
         * @returns {object} A deposit withdraw fee structure
         */
        const networkKeys = Object.keys (fee['networks']);
        const numNetworks = networkKeys.length;
        if (numNetworks === 1) {
            fee['withdraw'] = fee['networks'][networkKeys[0]]['withdraw'];
            fee['deposit'] = fee['networks'][networkKeys[0]]['deposit'];
            return fee;
        }
        const currencyCode = this.safeString (currency, 'code');
        for (let i = 0; i < numNetworks; i++) {
            const network = networkKeys[i];
            if (network === currencyCode) {
                fee['withdraw'] = fee['networks'][networkKeys[i]]['withdraw'];
                fee['deposit'] = fee['networks'][networkKeys[i]]['deposit'];
            }
        }
        return fee;
    }

    parseIncome (info, market: Market = undefined): object {
        throw new NotSupported (this.id + ' parseIncome () is not supported yet');
    }

    parseIncomes (incomes, market = undefined, since: Int = undefined, limit: Int = undefined): FundingHistory[] {
        /**
         * @ignore
         * @method
         * @description parses funding fee info from exchange response
         * @param {object[]} incomes each item describes once instance of currency being received or paid
         * @param {object} market ccxt market
         * @param {int} [since] when defined, the response items are filtered to only include items after this timestamp
         * @param {int} [limit] limits the number of items in the response
         * @returns {object[]} an array of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
         */
        const result = [];
        for (let i = 0; i < incomes.length; i++) {
            const entry = incomes[i];
            const parsed = this.parseIncome (entry, market);
            result.push (parsed);
        }
        const sorted = this.sortBy (result, 'timestamp');
        const symbol = this.safeString (market, 'symbol');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    getMarketFromSymbols (symbols: Strings = undefined) {
        if (symbols === undefined) {
            return undefined;
        }
        const firstMarket = this.safeString (symbols, 0);
        const market = this.market (firstMarket);
        return market;
    }

    parseWsOHLCVs (ohlcvs: object[], market: any = undefined, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined) {
        const results = [];
        for (let i = 0; i < ohlcvs.length; i++) {
            results.push (this.parseWsOHLCV (ohlcvs[i], market));
        }
        return results;
    }

    async fetchTransactions (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name exchange#fetchTransactions
         * @deprecated
         * @description *DEPRECATED* use fetchDepositsWithdrawals instead
         * @param {string} code unified currency code for the currency of the deposit/withdrawals, default is undefined
         * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
         * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
         */
        if (this.has['fetchDepositsWithdrawals']) {
            return await this.fetchDepositsWithdrawals (code, since, limit, params);
        } else {
            throw new NotSupported (this.id + ' fetchTransactions () is not supported yet');
        }
    }

    filterByArrayPositions (objects, key: IndexType, values = undefined, indexed = true): Position[] {
        /**
         * @ignore
         * @method
         * @description Typed wrapper for filterByArray that returns a list of positions
         */
        return this.filterByArray (objects, key, values, indexed) as Position[];
    }

    filterByArrayTickers (objects, key: IndexType, values = undefined, indexed = true): Dictionary<Ticker> {
        /**
         * @ignore
         * @method
         * @description Typed wrapper for filterByArray that returns a dictionary of tickers
         */
        return this.filterByArray (objects, key, values, indexed) as Dictionary<Ticker>;
    }

    createOHLCVObject (symbol: string, timeframe: string, data): Dictionary<Dictionary<OHLCV[]>> {
        const res = {};
        res[symbol] = {};
        res[symbol][timeframe] = data;
        return res;
    }

    handleMaxEntriesPerRequestAndParams (method: string, maxEntriesPerRequest: Int = undefined, params = {}): [Int, any] {
        let newMaxEntriesPerRequest = undefined;
        [ newMaxEntriesPerRequest, params ] = this.handleOptionAndParams (params, method, 'maxEntriesPerRequest');
        if ((newMaxEntriesPerRequest !== undefined) && (newMaxEntriesPerRequest !== maxEntriesPerRequest)) {
            maxEntriesPerRequest = newMaxEntriesPerRequest;
        }
        if (maxEntriesPerRequest === undefined) {
            maxEntriesPerRequest = 1000; // default to 1000
        }
        return [ maxEntriesPerRequest, params ];
    }

    async fetchPaginatedCallDynamic (method: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}, maxEntriesPerRequest: Int = undefined, removeRepeated = true): Promise<any> {
        let maxCalls = undefined;
        [ maxCalls, params ] = this.handleOptionAndParams (params, method, 'paginationCalls', 10);
        let maxRetries = undefined;
        [ maxRetries, params ] = this.handleOptionAndParams (params, method, 'maxRetries', 3);
        let paginationDirection = undefined;
        [ paginationDirection, params ] = this.handleOptionAndParams (params, method, 'paginationDirection', 'backward');
        let paginationTimestamp = undefined;
        let removeRepeatedOption = removeRepeated;
        [ removeRepeatedOption, params ] = this.handleOptionAndParams (params, method, 'removeRepeated', removeRepeated);
        let calls = 0;
        let result = [];
        let errors = 0;
        const until = this.safeIntegerN (params, [ 'until', 'untill', 'till' ]); // do not omit it from params here
        [ maxEntriesPerRequest, params ] = this.handleMaxEntriesPerRequestAndParams (method, maxEntriesPerRequest, params);
        if ((paginationDirection === 'forward')) {
            if (since === undefined) {
                throw new ArgumentsRequired (this.id + ' pagination requires a since argument when paginationDirection set to forward');
            }
            paginationTimestamp = since;
        }
        while ((calls < maxCalls)) {
            calls += 1;
            try {
                if (paginationDirection === 'backward') {
                    // do it backwards, starting from the last
                    // UNTIL filtering is required in order to work
                    if (paginationTimestamp !== undefined) {
                        params['until'] = paginationTimestamp - 1;
                    }
                    const response = await this[method] (symbol, undefined, maxEntriesPerRequest, params);
                    const responseLength = response.length;
                    if (this.verbose) {
                        let backwardMessage = 'Dynamic pagination call ' + this.numberToString (calls) + ' method ' + method + ' response length ' + this.numberToString (responseLength);
                        if (paginationTimestamp !== undefined) {
                            backwardMessage += ' timestamp ' + this.numberToString (paginationTimestamp);
                        }
                        this.log (backwardMessage);
                    }
                    if (responseLength === 0) {
                        break;
                    }
                    errors = 0;
                    result = this.arrayConcat (result, response);
                    const firstElement = this.safeValue (response, 0);
                    paginationTimestamp = this.safeInteger2 (firstElement, 'timestamp', 0);
                    if ((since !== undefined) && (paginationTimestamp <= since)) {
                        break;
                    }
                } else {
                    // do it forwards, starting from the since
                    const response = await this[method] (symbol, paginationTimestamp, maxEntriesPerRequest, params);
                    const responseLength = response.length;
                    if (this.verbose) {
                        let forwardMessage = 'Dynamic pagination call ' + this.numberToString (calls) + ' method ' + method + ' response length ' + this.numberToString (responseLength);
                        if (paginationTimestamp !== undefined) {
                            forwardMessage += ' timestamp ' + this.numberToString (paginationTimestamp);
                        }
                        this.log (forwardMessage);
                    }
                    if (responseLength === 0) {
                        break;
                    }
                    errors = 0;
                    result = this.arrayConcat (result, response);
                    const last = this.safeValue (response, responseLength - 1);
                    paginationTimestamp = this.safeInteger (last, 'timestamp') + 1;
                    if ((until !== undefined) && (paginationTimestamp >= until)) {
                        break;
                    }
                }
            } catch (e) {
                errors += 1;
                if (errors > maxRetries) {
                    throw e;
                }
            }
        }
        let uniqueResults = result;
        if (removeRepeatedOption) {
            uniqueResults = this.removeRepeatedElementsFromArray (result);
        }
        const key = (method === 'fetchOHLCV') ? 0 : 'timestamp';
        const sortedRes = this.sortBy (uniqueResults, key);
        return this.filterBySinceLimit (sortedRes, since, limit, key);
    }

    async safeDeterministicCall (method: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, timeframe: Str = undefined, params = {}) {
        let maxRetries = undefined;
        [ maxRetries, params ] = this.handleOptionAndParams (params, method, 'maxRetries', 3);
        let errors = 0;
        while (errors <= maxRetries) {
            try {
                if (timeframe && method !== 'fetchFundingRateHistory') {
                    return await this[method] (symbol, timeframe, since, limit, params);
                } else {
                    return await this[method] (symbol, since, limit, params);
                }
            } catch (e) {
                if (e instanceof RateLimitExceeded) {
                    throw e; // if we are rate limited, we should not retry and fail fast
                }
                errors += 1;
                if (errors > maxRetries) {
                    throw e;
                }
            }
        }
        return [];
    }

    async fetchPaginatedCallDeterministic (method: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, timeframe: Str = undefined, params = {}, maxEntriesPerRequest = undefined): Promise<any> {
        let maxCalls = undefined;
        [ maxCalls, params ] = this.handleOptionAndParams (params, method, 'paginationCalls', 10);
        [ maxEntriesPerRequest, params ] = this.handleMaxEntriesPerRequestAndParams (method, maxEntriesPerRequest, params);
        const current = this.milliseconds ();
        const tasks = [];
        const time = this.parseTimeframe (timeframe) * 1000;
        const step = time * maxEntriesPerRequest;
        let currentSince = current - (maxCalls * step) - 1;
        if (since !== undefined) {
            currentSince = Math.max (currentSince, since);
        } else {
            currentSince = Math.max (currentSince, 1241440531000); // avoid timestamps older than 2009
        }
        const until = this.safeInteger2 (params, 'until', 'till'); // do not omit it here
        if (until !== undefined) {
            const requiredCalls = Math.ceil ((until - since) / step);
            if (requiredCalls > maxCalls) {
                throw new BadRequest (this.id + ' the number of required calls is greater than the max number of calls allowed, either increase the paginationCalls or decrease the since-until gap. Current paginationCalls limit is ' + maxCalls.toString () + ' required calls is ' + requiredCalls.toString ());
            }
        }
        for (let i = 0; i < maxCalls; i++) {
            if ((until !== undefined) && (currentSince >= until)) {
                break;
            }
            if (currentSince >= current) {
                break;
            }
            tasks.push (this.safeDeterministicCall (method, symbol, currentSince, maxEntriesPerRequest, timeframe, params));
            currentSince = this.sum (currentSince, step) - 1;
        }
        const results = await Promise.all (tasks);
        let result = [];
        for (let i = 0; i < results.length; i++) {
            result = this.arrayConcat (result, results[i]);
        }
        const uniqueResults = this.removeRepeatedElementsFromArray (result) as any;
        const key = (method === 'fetchOHLCV') ? 0 : 'timestamp';
        return this.filterBySinceLimit (uniqueResults, since, limit, key);
    }

    async fetchPaginatedCallCursor (method: string, symbol: Str = undefined, since = undefined, limit = undefined, params = {}, cursorReceived = undefined, cursorSent = undefined, cursorIncrement = undefined, maxEntriesPerRequest = undefined): Promise<any> {
        let maxCalls = undefined;
        [ maxCalls, params ] = this.handleOptionAndParams (params, method, 'paginationCalls', 10);
        let maxRetries = undefined;
        [ maxRetries, params ] = this.handleOptionAndParams (params, method, 'maxRetries', 3);
        [ maxEntriesPerRequest, params ] = this.handleMaxEntriesPerRequestAndParams (method, maxEntriesPerRequest, params);
        let cursorValue = undefined;
        let i = 0;
        let errors = 0;
        let result = [];
        const timeframe = this.safeString (params, 'timeframe');
        params = this.omit (params, 'timeframe'); // reading the timeframe from the method arguments to avoid changing the signature
        while (i < maxCalls) {
            try {
                if (cursorValue !== undefined) {
                    if (cursorIncrement !== undefined) {
                        cursorValue = this.parseToInt (cursorValue) + cursorIncrement;
                    }
                    params[cursorSent] = cursorValue;
                }
                let response = undefined;
                if (method === 'fetchAccounts') {
                    response = await this[method] (params);
                } else if (method === 'getLeverageTiersPaginated' || method === 'fetchPositions') {
                    response = await this[method] (symbol, params);
                } else if (method === 'fetchOpenInterestHistory') {
                    response = await this[method] (symbol, timeframe, since, maxEntriesPerRequest, params);
                } else {
                    response = await this[method] (symbol, since, maxEntriesPerRequest, params);
                }
                errors = 0;
                const responseLength = response.length;
                if (this.verbose) {
                    const cursorString = (cursorValue === undefined) ? '' : cursorValue;
                    const iteration = (i + 1);
                    const cursorMessage = 'Cursor pagination call ' + iteration.toString () + ' method ' + method + ' response length ' + responseLength.toString () + ' cursor ' + cursorString;
                    this.log (cursorMessage);
                }
                if (responseLength === 0) {
                    break;
                }
                result = this.arrayConcat (result, response);
                const last = this.safeDict (response, responseLength - 1);
                // cursorValue = this.safeValue (last['info'], cursorReceived);
                cursorValue = undefined; // search for the cursor
                for (let j = 0; j < responseLength; j++) {
                    const index = responseLength - j - 1;
                    const entry = this.safeDict (response, index);
                    const info = this.safeDict (entry, 'info');
                    const cursor = this.safeValue (info, cursorReceived);
                    if (cursor !== undefined) {
                        cursorValue = cursor;
                        break;
                    }
                }
                if (cursorValue === undefined) {
                    break;
                }
                const lastTimestamp = this.safeInteger (last, 'timestamp');
                if (lastTimestamp !== undefined && lastTimestamp < since) {
                    break;
                }
            } catch (e) {
                errors += 1;
                if (errors > maxRetries) {
                    throw e;
                }
            }
            i += 1;
        }
        const sorted = this.sortCursorPaginatedResult (result);
        const key = (method === 'fetchOHLCV') ? 0 : 'timestamp';
        return this.filterBySinceLimit (sorted, since, limit, key);
    }

    async fetchPaginatedCallIncremental (method: string, symbol: Str = undefined, since = undefined, limit = undefined, params = {}, pageKey = undefined, maxEntriesPerRequest = undefined): Promise<any> {
        let maxCalls = undefined;
        [ maxCalls, params ] = this.handleOptionAndParams (params, method, 'paginationCalls', 10);
        let maxRetries = undefined;
        [ maxRetries, params ] = this.handleOptionAndParams (params, method, 'maxRetries', 3);
        [ maxEntriesPerRequest, params ] = this.handleMaxEntriesPerRequestAndParams (method, maxEntriesPerRequest, params);
        let i = 0;
        let errors = 0;
        let result = [];
        while (i < maxCalls) {
            try {
                params[pageKey] = i + 1;
                const response = await this[method] (symbol, since, maxEntriesPerRequest, params);
                errors = 0;
                const responseLength = response.length;
                if (this.verbose) {
                    const iteration = (i + 1).toString ();
                    const incrementalMessage = 'Incremental pagination call ' + iteration + ' method ' + method + ' response length ' + responseLength.toString ();
                    this.log (incrementalMessage);
                }
                if (responseLength === 0) {
                    break;
                }
                result = this.arrayConcat (result, response);
            } catch (e) {
                errors += 1;
                if (errors > maxRetries) {
                    throw e;
                }
            }
            i += 1;
        }
        const sorted = this.sortCursorPaginatedResult (result);
        const key = (method === 'fetchOHLCV') ? 0 : 'timestamp';
        return this.filterBySinceLimit (sorted, since, limit, key);
    }

    sortCursorPaginatedResult (result) {
        const first = this.safeValue (result, 0);
        if (first !== undefined) {
            if ('timestamp' in first) {
                return this.sortBy (result, 'timestamp', true);
            }
            if ('id' in first) {
                return this.sortBy (result, 'id', true);
            }
        }
        return result;
    }

    removeRepeatedElementsFromArray (input, fallbackToTimestamp: boolean = true) {
        const uniqueDic = {};
        const uniqueResult = [];
        for (let i = 0; i < input.length; i++) {
            const entry = input[i];
            const uniqValue = fallbackToTimestamp ? this.safeStringN (entry, [ 'id', 'timestamp', 0 ]) : this.safeString (entry, 'id');
            if (uniqValue !== undefined && !(uniqValue in uniqueDic)) {
                uniqueDic[uniqValue] = 1;
                uniqueResult.push (entry);
            }
        }
        const valuesLength = uniqueResult.length;
        if (valuesLength > 0) {
            return uniqueResult as any;
        }
        return input;
    }

    removeRepeatedTradesFromArray (input) {
        const uniqueResult = {};
        for (let i = 0; i < input.length; i++) {
            const entry = input[i];
            let id = this.safeString (entry, 'id');
            if (id === undefined) {
                const price = this.safeString (entry, 'price');
                const amount = this.safeString (entry, 'amount');
                const timestamp = this.safeString (entry, 'timestamp');
                const side = this.safeString (entry, 'side');
                // unique trade identifier
                id = 't_' + timestamp.toString () + '_' + side + '_' + price + '_' + amount;
            }
            if (id !== undefined && !(id in uniqueResult)) {
                uniqueResult[id] = entry;
            }
        }
        const values = Object.values (uniqueResult);
        return values as any;
    }

    removeKeysFromDict (dict:Dict, removeKeys: string[]) {
        const keys = Object.keys (dict);
        const newDict = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (!this.inArray (key, removeKeys)) {
                newDict[key] = dict[key];
            }
        }
        return newDict;
    }

    handleUntilOption (key: string, request, params, multiplier = 1) {
        const until = this.safeInteger2 (params, 'until', 'till');
        if (until !== undefined) {
            request[key] = this.parseToInt (until * multiplier);
            params = this.omit (params, [ 'until', 'till' ]);
        }
        return [ request, params ];
    }

    safeOpenInterest (interest: Dict, market: Market = undefined): OpenInterest {
        let symbol = this.safeString (interest, 'symbol');
        if (symbol === undefined) {
            symbol = this.safeString (market, 'symbol');
        }
        return this.extend (interest, {
            'symbol': symbol,
            'baseVolume': this.safeNumber (interest, 'baseVolume'), // deprecated
            'quoteVolume': this.safeNumber (interest, 'quoteVolume'), // deprecated
            'openInterestAmount': this.safeNumber (interest, 'openInterestAmount'),
            'openInterestValue': this.safeNumber (interest, 'openInterestValue'),
            'timestamp': this.safeInteger (interest, 'timestamp'),
            'datetime': this.safeString (interest, 'datetime'),
            'info': this.safeValue (interest, 'info'),
        });
    }

    parseLiquidation (liquidation, market: Market = undefined): Liquidation {
        throw new NotSupported (this.id + ' parseLiquidation () is not supported yet');
    }

    parseLiquidations (liquidations: Dict[], market: Market = undefined, since: Int = undefined, limit: Int = undefined): Liquidation[] {
        /**
         * @ignore
         * @method
         * @description parses liquidation info from the exchange response
         * @param {object[]} liquidations each item describes an instance of a liquidation event
         * @param {object} market ccxt market
         * @param {int} [since] when defined, the response items are filtered to only include items after this timestamp
         * @param {int} [limit] limits the number of items in the response
         * @returns {object[]} an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
         */
        const result = [];
        for (let i = 0; i < liquidations.length; i++) {
            const entry = liquidations[i];
            const parsed = this.parseLiquidation (entry, market);
            result.push (parsed);
        }
        const sorted = this.sortBy (result, 'timestamp');
        const symbol = this.safeString (market, 'symbol');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    parseGreeks (greeks: Dict, market: Market = undefined): Greeks {
        throw new NotSupported (this.id + ' parseGreeks () is not supported yet');
    }

    parseAllGreeks (greeks, symbols: Strings = undefined, params = {}): Greeks[] {
        //
        // the value of greeks is either a dict or a list
        //
        const results = [];
        if (Array.isArray (greeks)) {
            for (let i = 0; i < greeks.length; i++) {
                const parsedTicker = this.parseGreeks (greeks[i]);
                const greek = this.extend (parsedTicker, params);
                results.push (greek);
            }
        } else {
            const marketIds = Object.keys (greeks);
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const market = this.safeMarket (marketId);
                const parsed = this.parseGreeks (greeks[marketId], market);
                const greek = this.extend (parsed, params);
                results.push (greek);
            }
        }
        symbols = this.marketSymbols (symbols);
        return this.filterByArray (results, 'symbol', symbols);
    }

    parseOption (chain: Dict, currency: Currency = undefined, market: Market = undefined): Option {
        throw new NotSupported (this.id + ' parseOption () is not supported yet');
    }

    parseOptionChain (response: object[], currencyKey: Str = undefined, symbolKey: Str = undefined): OptionChain {
        const optionStructures = {};
        for (let i = 0; i < response.length; i++) {
            const info = response[i];
            const currencyId = this.safeString (info, currencyKey);
            const currency = this.safeCurrency (currencyId);
            const marketId = this.safeString (info, symbolKey);
            const market = this.safeMarket (marketId, undefined, undefined, 'option');
            optionStructures[market['symbol']] = this.parseOption (info, currency, market);
        }
        return optionStructures;
    }

    parseMarginModes (response: object[], symbols: string[] = undefined, symbolKey: Str = undefined, marketType: MarketType = undefined): MarginModes {
        const marginModeStructures = {};
        if (marketType === undefined) {
            marketType = 'swap'; // default to swap
        }
        for (let i = 0; i < response.length; i++) {
            const info = response[i];
            const marketId = this.safeString (info, symbolKey);
            const market = this.safeMarket (marketId, undefined, undefined, marketType);
            if ((symbols === undefined) || this.inArray (market['symbol'], symbols)) {
                marginModeStructures[market['symbol']] = this.parseMarginMode (info, market);
            }
        }
        return marginModeStructures;
    }

    parseMarginMode (marginMode: Dict, market: Market = undefined): MarginMode {
        throw new NotSupported (this.id + ' parseMarginMode () is not supported yet');
    }

    parseLeverages (response: object[], symbols: string[] = undefined, symbolKey: Str = undefined, marketType: MarketType = undefined): Leverages {
        const leverageStructures = {};
        if (marketType === undefined) {
            marketType = 'swap'; // default to swap
        }
        for (let i = 0; i < response.length; i++) {
            const info = response[i];
            const marketId = this.safeString (info, symbolKey);
            const market = this.safeMarket (marketId, undefined, undefined, marketType);
            if ((symbols === undefined) || this.inArray (market['symbol'], symbols)) {
                leverageStructures[market['symbol']] = this.parseLeverage (info, market);
            }
        }
        return leverageStructures;
    }

    parseLeverage (leverage: Dict, market: Market = undefined): Leverage {
        throw new NotSupported (this.id + ' parseLeverage () is not supported yet');
    }

    parseConversions (conversions: any[], code: Str = undefined, fromCurrencyKey: Str = undefined, toCurrencyKey: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Conversion[] {
        conversions = this.toArray (conversions);
        const result = [];
        let fromCurrency = undefined;
        let toCurrency = undefined;
        for (let i = 0; i < conversions.length; i++) {
            const entry = conversions[i];
            const fromId = this.safeString (entry, fromCurrencyKey);
            const toId = this.safeString (entry, toCurrencyKey);
            if (fromId !== undefined) {
                fromCurrency = this.safeCurrency (fromId);
            }
            if (toId !== undefined) {
                toCurrency = this.safeCurrency (toId);
            }
            const conversion = this.extend (this.parseConversion (entry, fromCurrency, toCurrency), params);
            result.push (conversion);
        }
        const sorted = this.sortBy (result, 'timestamp');
        let currency = undefined;
        if (code !== undefined) {
            currency = this.safeCurrency (code);
            code = currency['code'];
        }
        if (code === undefined) {
            return this.filterBySinceLimit (sorted, since, limit);
        }
        const fromConversion = this.filterBy (sorted, 'fromCurrency', code);
        const toConversion = this.filterBy (sorted, 'toCurrency', code);
        const both = this.arrayConcat (fromConversion, toConversion);
        return this.filterBySinceLimit (both, since, limit);
    }

    parseConversion (conversion: Dict, fromCurrency: Currency = undefined, toCurrency: Currency = undefined): Conversion {
        throw new NotSupported (this.id + ' parseConversion () is not supported yet');
    }

    convertExpireDate (date: string): string {
        // parse YYMMDD to datetime string
        const year = date.slice (0, 2);
        const month = date.slice (2, 4);
        const day = date.slice (4, 6);
        const reconstructedDate = '20' + year + '-' + month + '-' + day + 'T00:00:00Z';
        return reconstructedDate;
    }

    convertExpireDateToMarketIdDate (date: string): string {
        // parse 240119 to 19JAN24
        const year = date.slice (0, 2);
        const monthRaw = date.slice (2, 4);
        let month = undefined;
        const day = date.slice (4, 6);
        if (monthRaw === '01') {
            month = 'JAN';
        } else if (monthRaw === '02') {
            month = 'FEB';
        } else if (monthRaw === '03') {
            month = 'MAR';
        } else if (monthRaw === '04') {
            month = 'APR';
        } else if (monthRaw === '05') {
            month = 'MAY';
        } else if (monthRaw === '06') {
            month = 'JUN';
        } else if (monthRaw === '07') {
            month = 'JUL';
        } else if (monthRaw === '08') {
            month = 'AUG';
        } else if (monthRaw === '09') {
            month = 'SEP';
        } else if (monthRaw === '10') {
            month = 'OCT';
        } else if (monthRaw === '11') {
            month = 'NOV';
        } else if (monthRaw === '12') {
            month = 'DEC';
        }
        const reconstructedDate = day + month + year;
        return reconstructedDate;
    }

    convertMarketIdExpireDate (date: string): string {
        // parse 03JAN24 to 240103.
        const monthMappping = {
            'JAN': '01',
            'FEB': '02',
            'MAR': '03',
            'APR': '04',
            'MAY': '05',
            'JUN': '06',
            'JUL': '07',
            'AUG': '08',
            'SEP': '09',
            'OCT': '10',
            'NOV': '11',
            'DEC': '12',
        };
        // if exchange omits first zero and provides i.e. '3JAN24' instead of '03JAN24'
        if (date.length === 6) {
            date = '0' + date;
        }
        const year = date.slice (0, 2);
        const monthName = date.slice (2, 5);
        const month = this.safeString (monthMappping, monthName);
        const day = date.slice (5, 7);
        const reconstructedDate = day + month + year;
        return reconstructedDate;
    }

    async fetchPositionHistory (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        /**
         * @method
         * @name exchange#fetchPositionHistory
         * @description fetches the history of margin added or reduced from contract isolated positions
         * @param {string} [symbol] unified market symbol
         * @param {int} [since] timestamp in ms of the position
         * @param {int} [limit] the maximum amount of candles to fetch, default=1000
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
         */
        if (this.has['fetchPositionsHistory']) {
            const positions = await this.fetchPositionsHistory ([ symbol ], since, limit, params);
            return positions as Position[];
        } else {
            throw new NotSupported (this.id + ' fetchPositionHistory () is not supported yet');
        }
    }

    async loadMarketsAndSignIn () {
        await Promise.all ([ this.loadMarkets (), this.signIn () ]);
    }

    async fetchPositionsHistory (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        /**
         * @method
         * @name exchange#fetchPositionsHistory
         * @description fetches the history of margin added or reduced from contract isolated positions
         * @param {string} [symbol] unified market symbol
         * @param {int} [since] timestamp in ms of the position
         * @param {int} [limit] the maximum amount of candles to fetch, default=1000
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
         */
        throw new NotSupported (this.id + ' fetchPositionsHistory () is not supported yet');
    }

    parseMarginModification (data: Dict, market: Market = undefined): MarginModification {
        throw new NotSupported (this.id + ' parseMarginModification() is not supported yet');
    }

    parseMarginModifications (response: object[], symbols: Strings = undefined, symbolKey: Str = undefined, marketType: MarketType = undefined): MarginModification[] {
        const marginModifications = [];
        for (let i = 0; i < response.length; i++) {
            const info = response[i];
            const marketId = this.safeString (info, symbolKey);
            const market = this.safeMarket (marketId, undefined, undefined, marketType);
            if ((symbols === undefined) || this.inArray (market['symbol'], symbols)) {
                marginModifications.push (this.parseMarginModification (info, market));
            }
        }
        return marginModifications;
    }

    async fetchTransfer (id: string, code: Str = undefined, params = {}): Promise<TransferEntry> {
        /**
         * @method
         * @name exchange#fetchTransfer
         * @description fetches a transfer
         * @param {string} id transfer id
         * @param {[string]} code unified currency code
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
         */
        throw new NotSupported (this.id + ' fetchTransfer () is not supported yet');
    }

    async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<TransferEntry[]> {
        /**
         * @method
         * @name exchange#fetchTransfer
         * @description fetches a transfer
         * @param {string} id transfer id
         * @param {int} [since] timestamp in ms of the earliest transfer to fetch
         * @param {int} [limit] the maximum amount of transfers to fetch
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
         */
        throw new NotSupported (this.id + ' fetchTransfers () is not supported yet');
    }

    async unWatchOHLCV (symbol: string, timeframe: string = '1m', params = {}): Promise<any> {
        /**
         * @method
         * @name exchange#unWatchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        throw new NotSupported (this.id + ' unWatchOHLCV () is not supported yet');
    }

    async watchMarkPrice (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name exchange#watchMarkPrice
         * @description watches a mark price for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
         */
        throw new NotSupported (this.id + ' watchMarkPrice () is not supported yet');
    }

    async watchMarkPrices (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name exchange#watchMarkPrices
         * @description watches the mark price for all markets
         * @param {string[]} symbols unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
         */
        throw new NotSupported (this.id + ' watchMarkPrices () is not supported yet');
    }

    async withdrawWs (code: string, amount: number, address: string, tag: Str = undefined, params = {}): Promise<{}> {
        /**
         * @method
         * @name exchange#withdrawWs
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the bitvavo api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
         */
        throw new NotSupported (this.id + ' withdrawWs () is not supported yet');
    }

    async unWatchMyTrades (symbol: Str = undefined, params = {}): Promise<any> {
        /**
         * @method
         * @name exchange#unWatchMyTrades
         * @description unWatches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
         */
        throw new NotSupported (this.id + ' unWatchMyTrades () is not supported yet');
    }

    async createOrdersWs (orders: OrderRequest[], params = {}): Promise<Order[]> {
        /**
         * @method
         * @name exchange#createOrdersWs
         * @description create a list of trade orders
         * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        throw new NotSupported (this.id + ' createOrdersWs () is not supported yet');
    }

    async fetchOrdersByStatusWs (status: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name exchange#fetchOrdersByStatusWs
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
         */
        throw new NotSupported (this.id + ' fetchOrdersByStatusWs () is not supported yet');
    }

    async unWatchBidsAsks (symbols: Strings = undefined, params = {}): Promise<any> {
        /**
         * @method
         * @name exchange#unWatchBidsAsks
         * @description unWatches best bid & ask for symbols
         * @param {string[]} symbols unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
         */
        throw new NotSupported (this.id + ' unWatchBidsAsks () is not supported yet');
    }

    cleanUnsubscription (client, subHash: string, unsubHash: string, subHashIsPrefix = false) {
        if (unsubHash in client.subscriptions) {
            delete client.subscriptions[unsubHash];
        }
        if (!subHashIsPrefix) {
            if (subHash in client.subscriptions) {
                delete client.subscriptions[subHash];
            }
            if (subHash in client.futures) {
                const error = new UnsubscribeError (this.id + ' ' + subHash);
                client.reject (error, subHash);
            }
        } else {
            const clientSubscriptions = Object.keys (client.subscriptions);
            for (let i = 0; i < clientSubscriptions.length; i++) {
                const sub = clientSubscriptions[i];
                if (sub.startsWith (subHash)) {
                    delete client.subscriptions[sub];
                }
            }
            const clientFutures = Object.keys (client.futures);
            for (let i = 0; i < clientFutures.length; i++) {
                const future = clientFutures[i];
                if (future.startsWith (subHash)) {
                    const error = new UnsubscribeError (this.id + ' ' + future);
                    client.reject (error, future);
                }
            }
        }
        client.resolve (true, unsubHash);
    }

    cleanCache (subscription: Dict) {
        const topic = this.safeString (subscription, 'topic');
        const symbols = this.safeList (subscription, 'symbols', []);
        const symbolsLength = symbols.length;
        if (topic === 'ohlcv') {
            const symbolsAndTimeframes = this.safeList (subscription, 'symbolsAndTimeframes', []);
            for (let i = 0; i < symbolsAndTimeframes.length; i++) {
                const symbolAndTimeFrame = symbolsAndTimeframes[i];
                const symbol = this.safeString (symbolAndTimeFrame, 0);
                const timeframe = this.safeString (symbolAndTimeFrame, 1);
                if ((this.ohlcvs !== undefined) && (symbol in this.ohlcvs)) {
                    if (timeframe in this.ohlcvs[symbol]) {
                        delete this.ohlcvs[symbol][timeframe];
                    }
                }
            }
        } else if (symbolsLength > 0) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                if (topic === 'trades') {
                    if (symbol in this.trades) {
                        delete this.trades[symbol];
                    }
                } else if (topic === 'orderbook') {
                    if (symbol in this.orderbooks) {
                        delete this.orderbooks[symbol];
                    }
                } else if (topic === 'ticker') {
                    if (symbol in this.tickers) {
                        delete this.tickers[symbol];
                    }
                } else if (topic === 'bidsasks') {
                    if (symbol in this.bidsasks) {
                        delete this.bidsasks[symbol];
                    }
                }
            }
        } else {
            if (topic === 'myTrades' && (this.myTrades !== undefined)) {
                this.myTrades = undefined;
            } else if (topic === 'orders' && (this.orders !== undefined)) {
                this.orders = undefined;
            } else if (topic === 'positions' && (this.positions !== undefined)) {
                this.positions = undefined;
                const clients = Object.values (this.clients);
                for (let i = 0; i < clients.length; i++) {
                    const client = clients[i];
                    const futures = client.futures;
                    if ((futures !== undefined) && ('fetchPositionsSnapshot' in futures)) {
                        delete futures['fetchPositionsSnapshot'];
                    }
                }
            } else if ((topic === 'ticker' || topic === 'markPrice') && (this.tickers !== undefined)) {
                const tickerSymbols = Object.keys (this.tickers);
                for (let i = 0; i < tickerSymbols.length; i++) {
                    const tickerSymbol = tickerSymbols[i];
                    if (tickerSymbol in this.tickers) {
                        delete this.tickers[tickerSymbol];
                    }
                }
            } else if (topic === 'bidsasks' && (this.bidsasks !== undefined)) {
                const bidsaskSymbols = Object.keys (this.bidsasks);
                for (let i = 0; i < bidsaskSymbols.length; i++) {
                    const bidsaskSymbol = bidsaskSymbols[i];
                    if (bidsaskSymbol in this.bidsasks) {
                        delete this.bidsasks[bidsaskSymbol];
                    }
                }
            }
        }
    }

    timeframeFromMilliseconds (ms: number): string {
        if (ms <= 0) {
            return '';
        }
        const second = 1000;
        const minute = 60 * second;
        const hour = 60 * minute;
        const day = 24 * hour;
        const week = 7 * day;
        if (ms % week === 0) {
            return (ms / week) + 'w';
        }
        if (ms % day === 0) {
            return (ms / day) + 'd';
        }
        if (ms % hour === 0) {
            return (ms / hour) + 'h';
        }
        if (ms % minute === 0) {
            return (ms / minute) + 'm';
        }
        if (ms % second === 0) {
            return (ms / second) + 's';
        }
        return '';
    }
}

export {
    Exchange,
};
