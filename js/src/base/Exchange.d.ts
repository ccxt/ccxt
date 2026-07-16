import * as functions from './functions.js';
import WsClient from './ws/WsClient.js';
import type Client from './ws/Client.js';
import { OrderBook as WsOrderBook, IndexedOrderBook, CountedOrderBook, OrderBook as Ob } from './ws/OrderBook.js';
import type { Market, Trade, Ticker, OHLCV, OHLCVC, Order, OrderBook, Balance, Balances, Dictionary, Transaction, Currency, MinMax, IndexType, Int, OrderType, OrderSide, Position, FundingRate, DepositWithdrawFee, LedgerEntry, BorrowInterest, OpenInterest, LeverageTier, TransferEntry, FundingRateHistory, Liquidation, FundingHistory, OrderRequest, MarginMode, Tickers, Greeks, Option, OptionChain, Str, Num, MarketInterface, CurrencyInterface, BalanceAccount, MarginModes, MarketType, Leverage, Leverages, LastPrice, LastPrices, Account, Strings, MarginModification, TradingFeeInterface, Currencies, TradingFees, Conversion, CancellationRequest, IsolatedBorrowRate, IsolatedBorrowRates, CrossBorrowRates, CrossBorrowRate, Dict, FundingRates, LeverageTiers, Bool, int, DepositAddress, LongShortRatio, OrderBooks, OpenInterests, ConstructorArgs, ADL, NullableDict, SubType, NestedDictionary } from './types.js';
import { ArrayCache, ArrayCacheByTimestamp } from './ws/Cache.js';
export type { Market, Trade, Fee, Ticker, OHLCV, OHLCVC, Order, OrderBook, Balance, Balances, Dictionary, Transaction, Currency, MinMax, IndexType, Int, Bool, OrderType, OrderSide, Position, LedgerEntry, BorrowInterest, OpenInterest, LeverageTier, TransferEntry, CrossBorrowRate, FundingRateHistory, Liquidation, FundingHistory, OrderRequest, MarginMode, Tickers, Greeks, Option, OptionChain, Str, Num, MarketInterface, CurrencyInterface, BalanceAccount, MarginModes, MarketType, Leverage, Leverages, LastPrice, LastPrices, Account, Strings, Conversion, DepositAddress, LongShortRatio, ADL } from './types.js';
/**
 * @class Exchange
 */
export declare class BaseExchange {
    static ccxtVersion: string;
    options: Dict;
    isSandboxModeEnabled: boolean;
    api: Dictionary<any>;
    certified: boolean;
    pro: boolean;
    countries: Strings;
    proxy: any;
    proxyUrl: Str;
    proxy_url: Str;
    proxyUrlCallback: any;
    proxy_url_callback: any;
    httpProxy: Str;
    http_proxy: Str;
    httpProxyCallback: any;
    http_proxy_callback: any;
    httpsProxy: Str;
    https_proxy: Str;
    httpsProxyCallback: any;
    https_proxy_callback: any;
    socksProxy: Str;
    socks_proxy: Str;
    socksProxyCallback: any;
    socks_proxy_callback: any;
    userAgent: {
        'User-Agent': string;
    } | false | undefined;
    user_agent: {
        'User-Agent': string;
    } | false | undefined;
    wsProxy: Str;
    ws_proxy: Str;
    wssProxy: Str;
    wss_proxy: Str;
    wsSocksProxy: Str;
    ws_socks_proxy: Str;
    userAgents: Dictionary<string>;
    headers: Dictionary<string>;
    returnResponseHeaders: boolean;
    origin: string;
    MAX_VALUE: number;
    agent: any;
    httpAgent: any;
    httpsAgent: any;
    minFundingAddressLength: number;
    substituteCommonCurrencyCodes: boolean;
    quoteJsonNumbers: boolean;
    number: (numberString: string) => number;
    handleContentTypeApplicationZip: boolean;
    reduceFees: boolean;
    fetchImplementation: any;
    AbortError: any;
    FetchError: any;
    fetchImplementationLoading: Promise<any>;
    fetchIsNative: boolean;
    undiciModule: any;
    zlibModule: any;
    httpStatusTexts: any;
    fetchDispatcher: any;
    validateServerSsl: boolean;
    validateClientSsl: boolean;
    timeout: number;
    verbose: boolean;
    apiKey: string;
    secret: string;
    uid: string;
    login: string;
    password: string;
    privateKey: string;
    walletAddress: string;
    token: string;
    twofa: string;
    accountId: string;
    balance: any;
    liquidations: any;
    orderbooks: Dictionary<Ob>;
    tickers: Dictionary<Ticker>;
    fundingRates: Dictionary<FundingRate>;
    bidsasks: Dictionary<Ticker>;
    orders: ArrayCache | undefined;
    triggerOrders: ArrayCache;
    trades: Dictionary<ArrayCache>;
    transactions: Dictionary<Transaction>;
    ohlcvs: Dictionary<Dictionary<ArrayCacheByTimestamp>>;
    myLiquidations: any;
    myTrades: ArrayCache | undefined;
    positions: any;
    urls: {
        logo?: string;
        api: string | NestedDictionary;
        test: string | NestedDictionary;
        www?: string;
        doc?: string[];
        api_management?: string;
        fees?: string;
        referral?: string;
    };
    requiresWeb3: boolean;
    precision: {
        amount: Num;
        price: Num;
        cost?: Num;
        base?: Num;
        quote?: Num;
    };
    enableLastJsonResponse: boolean;
    enableLastHttpResponse: boolean;
    enableLastResponseHeaders: boolean;
    last_http_response: string;
    last_json_response: any;
    last_response_headers: Dictionary<string>;
    last_request_headers: Dictionary<string>;
    last_request_body: any;
    last_request_url: string;
    last_request_path: string;
    fetchHistoryCache: Dictionary<any>[];
    fetchHistoryCacheSize: number;
    id: string;
    markets: Dictionary<any>;
    has: Dictionary<boolean | 'emulated' | undefined>;
    features: Dictionary<Dictionary<any>>;
    status: {
        status: Str;
        updated: Num;
        eta: Num;
        url: Str;
        info: any;
    };
    requiredCredentials: {
        apiKey: Bool;
        secret: Bool;
        uid: Bool;
        login: Bool;
        password: Bool;
        twofa: Bool;
        privateKey: Bool;
        walletAddress: Bool;
        token: Bool;
    };
    rateLimit: Num;
    tokenBucket: Dictionary<number>;
    throttler: any;
    enableRateLimit: boolean;
    rollingWindowSize: number;
    rateLimiterAlgorithm: string;
    httpExceptions: Dictionary<any>;
    limits: {
        amount?: MinMax;
        cost?: MinMax;
        leverage?: MinMax;
        price?: MinMax;
    };
    fees: {
        trading: {
            tierBased: Bool;
            percentage: Bool;
            taker: Num;
            maker: Num;
        };
        funding: {
            tierBased: Bool;
            percentage: Bool;
            withdraw: {};
            deposit: {};
        };
    };
    markets_by_id: Dictionary<any>;
    symbols: Strings;
    ids: Strings;
    currencies: Currencies;
    baseCurrencies: Dictionary<CurrencyInterface>;
    quoteCurrencies: Dictionary<CurrencyInterface>;
    currencies_by_id: Dictionary<CurrencyInterface>;
    codes: Strings;
    reloadingMarkets: Bool;
    marketsLoading: Promise<Dictionary<Market>>;
    accounts: Account[];
    accountsById: Dictionary<Account>;
    commonCurrencies: Dictionary<string>;
    hostname: Str;
    precisionMode: Int;
    paddingMode: Int;
    exceptions: Dictionary<string>;
    timeframes: Dictionary<number | string>;
    version: Str;
    name: Str;
    lastRestRequestTimestamp: int;
    targetAccount: string;
    httpProxyAgentModule: any;
    httpsProxyAgentModule: any;
    socksProxyAgentModule: any;
    socksProxyAgentModuleChecked: boolean;
    proxyDictionaries: Dictionary<any>;
    proxyDictionariesMaxSize: number;
    proxiesModulesLoading: Promise<any>;
    alias: boolean;
    clients: Dictionary<WsClient>;
    newUpdates: boolean;
    streaming: Dictionary<any>;
    sleep: typeof functions.sleep;
    deepExtend: typeof functions.deepExtend;
    deepExtendSafe: typeof functions.deepExtend;
    isNode: boolean;
    extend: typeof functions.extend;
    clone: typeof functions.clone;
    unique: typeof functions.unique;
    indexBy: typeof functions.indexBy;
    indexBySafe: typeof functions.indexBy;
    roundTimeframe: typeof functions.roundTimeframe;
    sortBy: typeof functions.sortBy;
    sortBy2: typeof functions.sortBy2;
    groupBy: typeof functions.groupBy;
    aggregate: typeof functions.aggregate;
    uuid: typeof functions.uuid;
    unCamelCase: typeof functions.unCamelCase;
    precisionFromString: typeof functions.precisionFromString;
    capitalize: typeof functions.capitalize;
    now: () => number;
    decimalToPrecision: typeof functions.decimalToPrecision;
    safeValue: typeof functions.safeValue;
    safeValue2: typeof functions.safeValue2;
    safeString: typeof functions.safeString;
    safeString2: typeof functions.safeString2;
    safeFloat: typeof functions.safeFloat;
    safeFloat2: typeof functions.safeFloat2;
    seconds: typeof functions.seconds;
    milliseconds: () => number;
    binaryToBase16: (data: Uint8Array) => string;
    numberToBE: typeof functions.numberToBE;
    base16ToBinary: (str: string) => Uint8Array;
    iso8601: typeof functions.iso8601;
    omit: typeof functions.omit;
    isJsonEncodedObject: typeof functions.isJsonEncodedObject;
    safeInteger: typeof functions.safeInteger;
    sum: typeof functions.sum;
    omitZero: typeof functions.omitZero;
    implodeParams: typeof functions.implodeParams;
    extractParams: typeof functions.extractParams;
    json: typeof functions.json;
    binaryConcat: (...arrays: import("@noble/curves/utils.js").TArg<Uint8Array[]>) => import("@noble/curves/utils.js").TRet<Uint8Array>;
    hash: typeof functions.hash;
    arrayConcat: typeof functions.arrayConcat;
    encode: (str: string) => Uint8Array;
    urlencode: typeof functions.urlencode;
    hmac: typeof functions.hmac;
    numberToString: typeof functions.numberToString;
    parseTimeframe: typeof functions.parseTimeframe;
    safeInteger2: typeof functions.safeInteger2;
    safeStringLower: typeof functions.safeStringLower;
    parse8601: typeof functions.parse8601;
    yyyymmdd: typeof functions.yyyymmdd;
    safeStringUpper: typeof functions.safeStringUpper;
    safeTimestamp: typeof functions.safeTimestamp;
    binaryConcatArray: typeof functions.binaryConcatArray;
    ymdhms: typeof functions.ymdhms;
    yymmdd: typeof functions.yymmdd;
    stringToBase64: typeof functions.stringToBase64;
    decode: (data: Uint8Array) => string;
    uuid22: typeof functions.uuid22;
    safeIntegerProduct2: typeof functions.safeIntegerProduct2;
    safeIntegerProduct: typeof functions.safeIntegerProduct;
    binaryToBase58: (data: Uint8Array) => string;
    base58ToBinary: (str: string) => Uint8Array;
    base64ToBinary: (str: string) => Uint8Array;
    safeTimestamp2: typeof functions.safeTimestamp2;
    rawencode: typeof functions.rawencode;
    keysort: typeof functions.keysort;
    sort: typeof functions.sort;
    inArray: typeof functions.inArray;
    safeStringLower2: typeof functions.safeStringLower2;
    safeStringUpper2: typeof functions.safeStringUpper2;
    isEmpty: typeof functions.isEmpty;
    filterBy: typeof functions.filterBy;
    uuid16: typeof functions.uuid16;
    urlencodeWithArrayRepeat: typeof functions.urlencodeWithArrayRepeat;
    microseconds: typeof functions.microseconds;
    binaryToBase64: (data: Uint8Array) => string;
    strip: typeof functions.strip;
    toArray: typeof functions.toArray;
    safeFloatN: typeof functions.safeFloatN;
    safeIntegerN: typeof functions.safeIntegerN;
    safeIntegerProductN: typeof functions.safeIntegerProductN;
    safeTimestampN: typeof functions.safeTimestampN;
    safeValueN: typeof functions.safeValueN;
    safeStringN: typeof functions.safeStringN;
    safeStringLowerN: typeof functions.safeStringLowerN;
    safeStringUpperN: typeof functions.safeStringUpperN;
    urlencodeNested: typeof functions.urlencodeNested;
    parseDate: typeof functions.parseDate;
    ymd: typeof functions.ymd;
    base64ToString: typeof functions.base64ToString;
    crc32: typeof functions.crc32;
    packb: typeof functions.packb;
    urlencodeBase64: typeof functions.urlencodeBase64;
    readFile: typeof functions.readFile;
    writeFile: typeof functions.writeFile;
    existsFile: typeof functions.existsFile;
    getTempDir: typeof functions.getTempDir;
    constructor(userConfig?: ConstructorArgs);
    loadExchangeSpecificFiles(): Promise<void>;
    uuid5(namespace: string, name: string): string;
    encodeURIComponent(...args: any[]): string;
    throttle(cost?: Num): any;
    initThrottler(): void;
    defineRestApiEndpoint(methodName: any, uppercaseMethod: any, lowercaseMethod: any, camelcaseMethod: any, path: any, paths: any, config?: {}): void;
    defineRestApi(api: any, methodName: any, paths?: string[]): void;
    log(...args: any[]): void;
    loadProxyModules(): Promise<any>;
    setProxyAgents(httpProxy: any, httpsProxy: any, socksProxy: any): any;
    loadHttpProxyAgent(): Promise<any>;
    getHttpAgentIfNeeded(url: any): any;
    addFetchCache(data: any): void;
    getFetchCache(): Dictionary<any>[];
    isBinaryMessage(msg: any): msg is ArrayBuffer | Uint8Array<ArrayBufferLike>;
    stringToBinary(content: any): Uint8Array<ArrayBufferLike>;
    binaryToString(binary: any): string;
    decodeProtoMsg(data: any): any;
    /**
     * @ignore
     * @method
     * @name Exchange#loadFetchImplementation
     * @description resolves the fetch implementation once per instance - the platform-native fetch is used everywhere (undici in node, native fetch in bun / browsers / deno), a user-supplied this.fetchImplementation always takes precedence
     * @returns {Promise<any>} a promise that resolves when the fetch client is ready
     */
    loadFetchImplementation(): Promise<any>;
    /**
     * @ignore
     * @method
     * @name Exchange#getDispatcherOptions
     * @description builds keep-alive-tuned undici dispatcher options - every in-flight request gets its own socket (no pipelining, no h2 multiplexing), idle sockets are kept alive for reuse because exchanges are polled on the same origins repeatedly
     * @param {boolean} [isPlainAgent] true for undici.Agent options ('connect' tls shape), false for undici.ProxyAgent options ('requestTls' shape)
     * @returns {object} undici dispatcher options
     */
    getDispatcherOptions(isPlainAgent?: boolean): {
        keepAliveTimeout: number;
        keepAliveMaxTimeout: number;
        connections: number;
        pipelining: number;
        allowH2: boolean;
    };
    /**
     * @ignore
     * @method
     * @name Exchange#shouldValidateServerSsl
     * @description whether server certificates should be validated, honoring both this.validateServerSsl and legacy agents constructed with rejectUnauthorized false
     * @returns {boolean} true when server ssl certificates must be validated
     */
    shouldValidateServerSsl(): boolean;
    /**
     * @ignore
     * @method
     * @name Exchange#extractProxyFromAgent
     * @description backwards compatibility helper - http-proxy-agent, https-proxy-agent and socks-proxy-agent instances all carry their target on a `proxy` property (URL object or string), extract it so it can be passed to the native fetch
     * @param {object} [agent] a legacy proxy-carrying agent object
     * @returns {string|undefined} the proxy url, or undefined when the agent does not carry one
     */
    extractProxyFromAgent(agent: any): any;
    /**
     * @ignore
     * @method
     * @name Exchange#cacheProxyDictionary
     * @description stores a per-proxy-url transport handle (undici dispatcher or legacy node-style agent) in this.proxyDictionaries, evicting the oldest entry beyond proxyDictionariesMaxSize so rotating-proxy setups cannot grow the cache without bound - evicted or replaced undici dispatchers are closed gracefully (in-flight requests finish first), legacy agents are just dropped because live ws connections may still hold them
     * @param {string} proxyUrl the proxy url the handle serves
     * @param {any} value an undici dispatcher or a node-style agent
     * @returns {any} the cached value
     */
    cacheProxyDictionary(proxyUrl: any, value: any): any;
    /**
     * @ignore
     * @method
     * @name Exchange#releaseProxyDictionaryEntry
     * @description closes an undici dispatcher that left this.proxyDictionaries - close () drains in-flight requests before releasing sockets, and any close failure is irrelevant because the dispatcher is already unreferenced; legacy node-style agents are left untouched (never destroyed, matching the long-standing behavior, because live ws connections may still use them)
     * @param {any} entry the evicted or replaced proxyDictionaries value
     */
    releaseProxyDictionaryEntry(entry: any): void;
    /**
     * @ignore
     * @method
     * @name Exchange#getFetchProxyDispatcher
     * @description returns a cached undici ProxyAgent dispatcher for the given proxy url - undici handles http, https, socks5 and socks schemes natively; dispatchers share this.proxyDictionaries with the legacy node-style agents (entries are distinguished by the 'dispatch' method) and the cache is FIFO-capped at proxyDictionariesMaxSize entries so rotating-proxy setups cannot grow it without bound
     * @param {string} proxyUrl the proxy url, e.g. http://user:pass@host:port or socks5://host:port
     * @returns {any} an undici dispatcher
     */
    getFetchProxyDispatcher(proxyUrl: any): any;
    /**
     * @ignore
     * @method
     * @name Exchange#undiciRequest
     * @description dispatches through the low-level undici.request api and adapts the result to the minimal fetch-Response surface that handleRestResponse consumes - profiled ~2x faster end-to-end than undici.fetch (node streams instead of the WHATWG Response/Headers/web-streams machinery)
     * @param {string} url the request url
     * @param {object} params fetch-style request params ('method', 'headers', 'body', 'signal', 'dispatcher')
     * @returns {Promise<object>} an object with 'status', 'statusText', 'headers' (plain object), 'text' and 'arrayBuffer' methods
     */
    undiciRequest(url: any, params: any): Promise<{
        status: any;
        statusText: any;
        headers: any;
        text: () => Promise<any>;
        arrayBuffer: () => Promise<any>;
    }>;
    /**
     * @ignore
     * @method
     * @name Exchange#undiciBody
     * @description reads an undici.request response body, transparently decompressing gzip/br/deflate content-encodings via node:zlib (undici.request performs no decompression, unlike fetch)
     * @param {object} res an undici.request response
     * @param {boolean} [binary] true to return a Buffer, false to return a utf8 string
     * @returns {Promise<any>} the response body
     */
    undiciBody(res: any, binary?: boolean): Promise<any>;
    /**
     * @ignore
     * @method
     * @name Exchange#setFetchProxyOptions
     * @description attaches per-platform proxy transport options to the native fetch request params - undici dispatcher on node, the built-in `proxy` option on bun; the shared keep-alive dispatcher is attached when no proxy applies
     * @param {object} params the fetch RequestInit params, mutated in place
     * @param {string} [httpProxy] unified httpProxy setting
     * @param {string} [httpsProxy] unified httpsProxy setting
     * @param {string} [socksProxy] unified socksProxy setting
     */
    setFetchProxyOptions(params: any, httpProxy: any, httpsProxy: any, socksProxy: any): void;
    fetch(url: any, method?: string, headers?: any, body?: any): Promise<any>;
    jsonStringifyWithNull(obj: any): string;
    hasUnsafeInteger(value: any): boolean;
    parseJson(jsonString: any): any;
    getResponseHeaders(response: any): {};
    handleRestResponse(response: any, url: any, method?: string, requestHeaders?: any, requestBody?: any): any;
    onRestResponse(statusCode: any, statusText: any, url: any, method: any, responseHeaders: any, responseBody: any, requestHeaders: any, requestBody: any): any;
    onJsonResponse(responseBody: any): any;
    loadMarketsHelper(reload?: boolean, params?: {}): Promise<Dictionary<any>>;
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
    loadMarkets(reload?: boolean, params?: object): Promise<Dictionary<Market>>;
    fetchCurrencies(params?: {}): Promise<Currencies>;
    fetchCurrenciesWs(params?: {}): Promise<Currencies>;
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchMarketsWs(params?: {}): Promise<Market[]>;
    checkRequiredDependencies(): void;
    parseNumber(value: any, d?: Num): number;
    checkOrderArguments(market: any, type: any, side: any, amount: any, price: any, params: any): void;
    handleHttpStatusCode(code: any, reason: any, url: any, method: any, body: any): void;
    remove0xPrefix(hexData: any): any;
    mapToSafeMap(dict: any): any;
    safeMapToMap(dict: any): any;
    spawn(method: any, ...args: any[]): import("./ws/Future.js").FutureInterface;
    delay(timeout: any, method: any, ...args: any[]): void;
    orderBook(snapshot?: {}, depth?: number): WsOrderBook;
    indexedOrderBook(snapshot?: {}, depth?: number): IndexedOrderBook;
    countedOrderBook(snapshot?: {}, depth?: number): CountedOrderBook;
    handleMessage(client: any, message: any): void;
    ping(client: Client): Dict | Str;
    client(url: string): WsClient;
    watchMultiple(url: string, messageHashes: string[], message?: any, subscribeHashes?: Strings, subscription?: any): import("./ws/Future.js").FutureInterface;
    watch(url: string, messageHash: string, message?: any, subscribeHash?: any, subscription?: any): any;
    onConnected(client: any, message?: any): void;
    onError(client: any, error: any): void;
    onClose(client: any, error: any): void;
    close(cleanInstanceCache?: boolean): Promise<void>;
    convertToBigInt(value: string): bigint;
    stringToCharsArray(value: string): string[];
    valueIsDefined<T>(value: T): value is NonNullable<T>;
    arraySlice(array: any, first: any, second?: any): any;
    getProperty(obj: any, property: any, defaultValue?: any): any;
    setProperty(obj: any, property: any, defaultValue?: any): void;
    exceptionMessage(exc: any, includeStack?: boolean): string;
    fixStringifiedJsonMembers(content: string): string;
    ethAbiEncode(types: any, args: any): Uint8Array<ArrayBufferLike>;
    ethEncodeStructuredData(domain: any, messageTypes: any, messageData: any): Uint8Array<ArrayBufferLike>;
    ethGetAddressFromPrivateKey(privateKey: string): string;
    retrieveStarkAccount(signature: any, accountClassHash: any, accountProxyClassHash: any): {
        privateKey: string;
        publicKey: string;
        address: string;
    };
    starknetEncodeStructuredData(domain: any, messageTypes: any, messageData: any, address: any): string;
    starknetSign(msgHash: any, pri: any): string;
    extendedStarknetSign(msgHash: any, pri: any): string;
    extendedStarknetGetSelectorFromName(name: any): string;
    extendedStarknetComputePoseidonHashOnElements(data: any): string;
    getZKContractSignatureObj(seed: any, params?: {}): Promise<any>;
    getZKTransferSignatureObj(seed: any, params?: {}): Promise<any>;
    loadDydxProtos(): Promise<void>;
    toDydxLong(numStr: string): object;
    retrieveDydxCredentials(privateKey: string): object;
    encodeDydxTxForSimulation(message: any, memo: any, sequence: any, publicKey: any): string;
    encodeDydxTxForSigning(message: any, memo: any, chainId: any, account: any, authenticators: any, fee?: any): [string, Dict];
    encodeDydxTxRaw(signDoc: Dict, signature: string): string;
    intToBase16(elem: any): string;
    extendExchangeOptions(newOptions: Dict): void;
    createSafeDictionary(isWs?: boolean): {};
    convertToSafeDictionary(dict: any): any;
    randomBytes(length: number): string;
    randNumber(size: number): number;
    binaryLength(binary: Uint8Array): number;
    lockId(): any;
    unlockId(): any;
    loadLighterLibrary(libraryPath: any, chainId: any, privateKey: any, apiKeyIndex: any, accountIndex: any, createClient?: boolean): Promise<{}>;
    lighterCreateClient(signer: any, chainId: any, privateKey: any, apiKeyIndex: any, accountIndex: any): any;
    lighterSignCreateGroupedOrders(signer: any, request: any): any[];
    lighterSignCreateOrder(signer: any, request: any): any[];
    checkLighterSignedError(result: any): void;
    lighterSignCancelOrder(signer: any, request: any): any[];
    lighterSignWithdraw(signer: any, request: any): any[];
    lighterSignCreateSubAccount(signer: any, request: any): any[];
    lighterSignCancelAllOrders(signer: any, request: any): any[];
    lighterSignModifyOrder(signer: any, request: any): any[];
    lighterSignTransfer(signer: any, request: any): any[];
    lighterSignUpdateLeverage(signer: any, request: any): any[];
    lighterCreateAuthToken(signer: any, request: any): string;
    lighterSignUpdateMargin(signer: any, request: any): any[];
    lighterSignApproveIntegrator(signer: any, request: any): any[];
    lighterGenerateApiKey(signer: any): any[];
    lighterSignChangePubkey(signer: any, request: any): any[];
    setLastRestRequestTimestamp(): void;
    setLastRequest(request: any): void;
    describe(): any;
    cleanRestData(): void;
    cleanWsData(): void;
    safeBoolN(dictionaryOrList: any, keys: IndexType[], defaultValue?: boolean): boolean | undefined;
    safeBool2(dictionaryOrList: any, key1: IndexType, key2: IndexType, defaultValue?: boolean): boolean | undefined;
    safeBool(dictionaryOrList: any, key: IndexType, defaultValue?: boolean): boolean | undefined;
    safeDictN(dictionaryOrList: any, keys: IndexType[], defaultValue: Dictionary<any>): Dictionary<any>;
    safeDictN(dictionaryOrList: any, keys: IndexType[], defaultValue?: Dictionary<any>): Dictionary<any> | undefined;
    safeDict(dictionaryOrList: any, key: IndexType, defaultValue: Dictionary<any>): Dictionary<any>;
    safeDict(dictionaryOrList: any, key: IndexType, defaultValue?: Dictionary<any>): Dictionary<any> | undefined;
    safeDict2(dictionaryOrList: any, key1: IndexType, key2: string, defaultValue: Dictionary<any>): Dictionary<any>;
    safeDict2(dictionaryOrList: any, key1: IndexType, key2: string, defaultValue?: Dictionary<any>): Dictionary<any> | undefined;
    safeListN(dictionaryOrList: any, keys: IndexType[], defaultValue: any[]): any[];
    safeListN(dictionaryOrList: any, keys: IndexType[], defaultValue?: any[]): any[] | undefined;
    isDictionary(value: any): boolean;
    safeList2(dictionaryOrList: any, key1: IndexType, key2: string, defaultValue: any[]): any[];
    safeList2(dictionaryOrList: any, key1: IndexType, key2: string, defaultValue?: any[]): any[] | undefined;
    safeList(dictionaryOrList: any, key: IndexType, defaultValue: any[]): any[];
    safeList(dictionaryOrList: any, key: IndexType, defaultValue?: any[]): any[] | undefined;
    handleDeltas(orderbook: any, deltas: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltasWithKeys(bookSide: any, deltas: any, priceKey?: IndexType, amountKey?: IndexType, countOrIdKey?: IndexType): void;
    getCacheIndex(orderbook: any, deltas: any): number;
    arraysConcat(arraysOfArrays: any[]): any[];
    findTimeframe(timeframe: any, timeframes?: NullableDict): string;
    checkProxyUrlSettings(url?: Str, method?: Str, headers?: any, body?: any): string;
    urlEncoderForProxyUrl(targetUrl: string): string;
    checkProxySettings(url?: Str, method?: Str, headers?: any, body?: any): string[];
    checkWsProxySettings(): string[];
    checkConflictingProxies(proxyAgentSet: any, proxyUrlSet: any): void;
    checkAddress(address?: Str): Str;
    findMessageHashes(client: any, element: string): string[];
    filterByLimit(array: object[], limit?: Int, key?: IndexType, fromStart?: boolean): any;
    filterBySinceLimit(array: object[], since?: Int, limit?: Int, key?: IndexType, tail?: boolean): any;
    filterByValueSinceLimit(array: object[], field: IndexType, value?: any, since?: Int, limit?: Int, key?: string, tail?: boolean): any;
    /**
     * @method
     * @name Exchange#setSandboxMode
     * @description set the sandbox mode for the exchange
     * @param {boolean} enabled true to enable sandbox mode, false to disable it
     */
    setSandboxMode(enabled: boolean): void;
    /**
     * @method
     * @name Exchange#enableDemoTrading
     * @description enables or disables demo trading mode
     * @param {boolean} [enable] true if demo trading should be enabled, false otherwise
     */
    enableDemoTrading(enable: boolean): void;
    sign(path: any, api?: any, method?: string, params?: {}, headers?: NullableDict, body?: Str): {
        url: any;
        method: any;
        headers: any;
        body: any;
    };
    fetchAccounts(params?: {}): Promise<Account[]>;
    watchLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    watchLiquidationsForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    watchMyLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    watchMyLiquidationsForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    unWatchOrders(symbol?: Str, params?: {}): Promise<any>;
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    unWatchTradesForSymbols(symbols: string[], params?: {}): Promise<any>;
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<Dictionary<Dictionary<OHLCV[]>>>;
    unWatchOHLCVForSymbols(symbolsAndTimeframes: string[][], params?: {}): Promise<any>;
    unWatchOrderBookForSymbols(symbols: string[], params?: {}): Promise<any>;
    unWatchPositions(symbols?: Strings, params?: {}): Promise<any>;
    unWatchTicker(symbol: string, params?: {}): Promise<any>;
    unWatchMarkPrice(symbol: string, params?: {}): Promise<any>;
    unWatchMarkPrices(symbols?: Strings, params?: {}): Promise<any>;
    fetchDepositAddresses(codes?: Strings, params?: {}): Promise<DepositAddress[]>;
    fetchMarginMode(symbol: string, params?: {}): Promise<MarginMode>;
    fetchMarginModes(symbols?: Strings, params?: {}): Promise<MarginModes>;
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    fetchTime(params?: {}): Promise<Int>;
    fetchTradingLimits(symbols?: Strings, params?: {}): Promise<{}>;
    parseCurrency(rawCurrency: Dict): Currency;
    parseCurrencies(rawCurrencies: any): Currencies;
    parseMarket(market: Dict): Market;
    parseMarkets(markets: any): Market[];
    parseTicker(ticker: Dict, market?: Market): Ticker;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    parseTrade(trade: Dict, market?: Market): Trade;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseAccount(account: Dict): Account;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseOrder(order: Dict, market?: Market): Order;
    fetchCrossBorrowRates(params?: {}): Promise<CrossBorrowRates>;
    fetchIsolatedBorrowRates(params?: {}): Promise<IsolatedBorrowRates>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<LeverageTiers>;
    parsePosition(position: Dict, market?: Market): Position;
    parseFundingRateHistory(info: any, market?: Market): FundingRateHistory;
    parseBorrowInterest(info: Dict, market?: Market): BorrowInterest;
    parseIsolatedBorrowRate(info: Dict, market?: Market): IsolatedBorrowRate;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    parseWsOrder(order: Dict, market?: Market): Order;
    parseWsOrderTrade(trade: Dict, market?: Market): Trade;
    parseWsOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    fetchFundingIntervals(symbols?: Strings, params?: {}): Promise<FundingRates>;
    watchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    watchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    unWatchFundingRates(symbols?: Strings, params?: {}): Promise<any>;
    watchFundingRatesForSymbols(symbols: string[], params?: {}): Promise<{}>;
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    createDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<{}>;
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    fetchLeverages(symbols?: Strings, params?: {}): Promise<Leverages>;
    setPositionMode(hedged: boolean, symbol?: Str, params?: {}): Promise<{}>;
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    setMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    fetchLongShortRatio(symbol: string, timeframe?: Str, params?: {}): Promise<LongShortRatio>;
    fetchLongShortRatioHistory(symbol?: Str, timeframe?: Str, since?: Int, limit?: Int, params?: {}): Promise<LongShortRatio[]>;
    fetchMarginAdjustmentHistory(symbol?: Str, type?: Str, since?: Num, limit?: Num, params?: {}): Promise<MarginModification[]>;
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<{}>;
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<DepositAddress[]>;
    fetchOpenInterestHistory(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OpenInterest[]>;
    fetchOpenInterests(symbols?: Strings, params?: {}): Promise<OpenInterests>;
    signIn(params?: {}): Promise<{}>;
    fetchPaymentMethods(params?: {}): Promise<{}>;
    parseToInt(number: any): number;
    parseToNumeric(number: any): number;
    isRoundNumber(value: number): boolean;
    isEmptyString(value: any): boolean;
    safeNumberOmitZero(obj: object, key: IndexType, defaultValue?: Num): Num;
    safeIntegerOmitZero(obj: object, key: IndexType, defaultValue?: Int): Int;
    afterConstruct(): void;
    initRestRateLimiter(): void;
    featuresGenerator(): void;
    featuresMapper(initialFeatures: any, marketType: Str, subType?: Str): any;
    featureValue(symbol: string, methodName?: Str, paramName?: Str, defaultValue?: any): any;
    featureValueByType(marketType: string, subType: Str, methodName?: Str, paramName?: Str, defaultValue?: any): any;
    orderbookChecksumMessage(symbol: Str): string;
    createNetworksByIdObject(): void;
    getDefaultOptions(): {
        defaultNetworkCodeReplacements: {
            ETH: {
                primary: string;
                secondary: string;
                default: string;
            };
            CRO: {
                primary: string;
                secondary: string;
                default: string;
            };
            TRX: {
                primary: string;
                secondary: string;
                default: string;
            };
            BTC: {
                primary: string;
                secondary: string;
                default: string;
            };
        };
    };
    safeLedgerEntry(entry: object, currency?: Currency): {
        id: string;
        timestamp: number;
        datetime: string;
        direction: string;
        account: string;
        referenceId: string;
        referenceAccount: string;
        type: string;
        currency: string;
        amount: number;
        before: number;
        after: number;
        status: string;
        fee: any;
        info: Dictionary<any>;
    };
    safeCurrencyStructure(currency: object): CurrencyInterface;
    safeMarketStructure(market?: Dict): MarketInterface;
    setMarkets(markets: any, currencies?: any): Dictionary<any>;
    setMarketsFromExchange(sourceExchange: any): this;
    getDescribeForExtendedWsExchange(currentRestInstance: any, parentRestInstance: any, wsBaseDescribe: Dictionary<any>): any;
    safeBalance(balance: Dict): Balances;
    safeOrder(order: Dict, market?: Market): Order;
    parseOrders(orders: object, market?: Market, since?: Int, limit?: Int, params?: {}): Order[];
    calculateFeeWithRate(symbol: string, type: string, side: string, amount: number, price: number, takerOrMaker?: string, feeRate?: Num, params?: {}): {
        type: string;
        currency: any;
        rate: number;
        cost: number;
    };
    calculateFee(symbol: string, type: string, side: string, amount: number, price: number, takerOrMaker?: string, params?: {}): {
        type: string;
        currency: any;
        rate: number;
        cost: number;
    };
    safeLiquidation(liquidation: Dict, market?: Market): Liquidation;
    safeTrade(trade: Dict, market?: Market): Trade;
    createCcxtTradeId(timestamp?: Int, side?: OrderSide, amount?: any, price?: any, takerOrMaker?: any): Str;
    parsedFeeAndFees(container: any): (any[] | Dictionary<any>)[];
    parseFeeNumeric(fee: any): any;
    findNearestCeiling(arr: number[], providedValue: number): number;
    addKeyInArrayItems(obj: any, keyName: any): any[];
    invertFlatStringDictionary(dict: any): {};
    stringToBase16(str: any): string;
    reduceFeesByCurrency(fees: any): any[];
    safeTicker(ticker: Dict, market?: Market): Ticker;
    fetchBorrowRate(code: string, amount: number, params?: {}): Promise<{}>;
    repayCrossMargin(code: string, amount: number, params?: {}): Promise<{}>;
    repayIsolatedMargin(symbol: string, code: string, amount: number, params?: {}): Promise<{}>;
    borrowCrossMargin(code: string, amount: number, params?: {}): Promise<{}>;
    borrowIsolatedMargin(symbol: string, code: string, amount: number, params?: {}): Promise<{}>;
    borrowMargin(code: string, amount: number, symbol?: Str, params?: {}): Promise<{}>;
    repayMargin(code: string, amount: number, symbol?: Str, params?: {}): Promise<{}>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchSpotOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchContractOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchOHLCVWs(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    convertTradingViewToOHLCV(ohlcvs: number[][], timestamp?: string, open?: string, high?: string, low?: string, close?: string, volume?: string, ms?: boolean): any[];
    convertOHLCVToTradingView(ohlcvs: number[][], timestamp?: string, open?: string, high?: string, low?: string, close?: string, volume?: string, ms?: boolean): {};
    fetchWebEndpoint(method: any, endpointMethod: any, returnAsJson: any, startRegex?: any, endRegex?: any): Promise<any>;
    marketIds(symbols: string[]): string[];
    marketIds(symbols?: Strings): Strings;
    currencyIds(codes: string[]): string[];
    currencyIds(codes?: Strings): Strings;
    marketsForSymbols(symbols?: Strings): any[];
    marketSymbols(symbols: string[], type?: Str, allowEmpty?: boolean, sameTypeOnly?: boolean, sameSubTypeOnly?: boolean): string[];
    marketSymbols(symbols?: Strings, type?: Str, allowEmpty?: boolean, sameTypeOnly?: boolean, sameSubTypeOnly?: boolean): Strings;
    marketCodes(codes?: Strings): any[];
    parseOrderBookBidsAsks(bidasks: any, priceKey?: IndexType, amountKey?: IndexType, countOrIdKey?: IndexType): any[];
    filterByKey(objects: any, key: IndexType, value?: Str): any;
    filterBySymbol(objects: any, symbol?: Str): any;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    safeNetwork(network: any): {
        info: any;
        id: string;
        name: string;
        network: string;
        active: boolean;
        deposit: boolean;
        withdraw: boolean;
        fee: number;
        precision: number;
        limits: {
            withdraw: {
                min: number;
                max: number;
            };
            deposit: {
                min: number;
                max: number;
            };
        };
    };
    prioritizedNetworkAliases(networkCode?: Str, currencyCode?: Str, allowDefault?: boolean): any[];
    networkCodeToId(networkCode: string, currencyCode?: Str): string;
    networkIdToCode(networkId?: Str, currencyCode?: Str): string;
    handleNetworkCodeAndParams(params: any): any[];
    defaultNetworkCode(currencyCode: string): any;
    selectNetworkCodeFromUnifiedNetworks(currencyCode: any, networkCode: any, indexedNetworkEntries: any): any;
    selectNetworkIdFromRawNetworks(currencyCode: any, networkCode: any, indexedNetworkEntries: any): any;
    selectNetworkKeyFromNetworks(currencyCode: any, networkCode: any, indexedNetworkEntries: any, isIndexedByUnifiedNetworkCode?: boolean): any;
    safeNumber2(dictionary: object, key1: IndexType, key2: IndexType, d?: any): number;
    parseOrderBook(orderbook: object, symbol: string, timestamp?: Int, bidsKey?: string, asksKey?: string, priceKey?: IndexType, amountKey?: IndexType, countOrIdKey?: IndexType): OrderBook;
    parseOHLCVs(ohlcvs: object[], market?: any, timeframe?: string, since?: Int, limit?: Int, tail?: Bool): OHLCV[];
    parseLeverageTiers(response: any, symbols?: Strings, marketIdKey?: Str): LeverageTiers;
    loadTradingLimits(symbols?: Strings, reload?: boolean, params?: {}): Promise<Dictionary<any>>;
    safePosition(position: Dict): Position;
    parsePositions(positions: any[], symbols?: string[], params?: {}): Position[];
    parseADLRank(info: Dict, market?: Market): ADL;
    parseADLRanks(ranks: any[], symbols?: string[], params?: {}): ADL[];
    parseAccounts(accounts: any[], params?: {}): Account[];
    parseTradesHelper(isWs: boolean, trades: any[], market?: Market, since?: Int, limit?: Int, params?: {}): Trade[];
    parseTrades(trades: any[], market?: Market, since?: Int, limit?: Int, params?: {}): Trade[];
    parseWsTrades(trades: any[], market?: Market, since?: Int, limit?: Int, params?: {}): Trade[];
    parseTransactions(transactions: any[], currency?: Currency, since?: Int, limit?: Int, params?: {}): Transaction[];
    parseTransfers(transfers: any[], currency?: Currency, since?: Int, limit?: Int, params?: {}): TransferEntry[];
    parseLedger(data: any, currency?: Currency, since?: Int, limit?: Int, params?: {}): LedgerEntry[];
    nonce(): number;
    setHeaders(headers: any): any;
    currencyId(code: string): string;
    marketId(symbol: string): string;
    symbol(symbol: string): string;
    handleParamString(params: object, paramName: string, defaultValue?: Str): [string, object];
    handleParamString2(params: object, paramName1: string, paramName2: string, defaultValue?: Str): [string, object];
    handleParamInteger(params: object, paramName: string, defaultValue?: Int): [Int, object];
    handleParamInteger2(params: object, paramName1: string, paramName2: string, defaultValue?: Int): [Int, object];
    handleParamBool(params: object, paramName: string, defaultValue?: Bool): [Bool, object];
    handleParamBool2(params: object, paramName1: string, paramName2: string, defaultValue?: Bool): [Bool, object];
    /**
     * @param {object} params - extra parameters
     * @param {object} request - existing dictionary of request
     * @param {string} exchangeSpecificKey - the key for chain id to be set in request
     * @param {object} currencyCode - (optional) existing dictionary of request
     * @param {boolean} isRequired - (optional) whether that param is required to be present
     * @returns {object[]} - returns [request, params] where request is the modified request object and params is the modified params object
     */
    handleRequestNetwork(params: Dict, request: Dict, exchangeSpecificKey: string, currencyCode?: Str, isRequired?: boolean): Dict[];
    resolvePath(path: any, params: any): any[];
    getListFromObjectValues(objects: any, key: IndexType): any[];
    getSymbolsForMarketType(marketType?: Str, subType?: Str, symbolWithActiveStatus?: boolean, symbolWithUnknownStatus?: boolean): any[];
    filterByArray(objects: any, key: IndexType, values?: any, indexed?: boolean): any;
    filterOutByArray(objects: any, key: IndexType, values?: any, indexed?: boolean): any;
    fetch2(path: any, api?: any, method?: string, params?: {}, headers?: any, body?: any, config?: {}): Promise<any>;
    request(path: any, api?: any, method?: string, params?: {}, headers?: any, body?: any, config?: {}): Promise<any>;
    loadAccounts(reload?: boolean, params?: {}): Promise<Account[]>;
    buildOHLCVC(trades: Trade[], timeframe?: string, since?: number, limit?: number): OHLCVC[];
    parseTradingViewOHLCV(ohlcvs: any, market?: Market, timeframe?: string, since?: Int, limit?: Int): OHLCV[];
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<BorrowInterest[]>;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    fetchLedgerEntry(id: string, code?: Str, params?: {}): Promise<LedgerEntry>;
    parseOrderBookBidAsk(bidask: any, priceKey?: IndexType, amountKey?: IndexType, countOrIdKey?: IndexType): number[];
    safeCurrency(currencyId: Str, currency?: Currency): CurrencyInterface;
    safeMarket(marketId?: Str, market?: Market, delimiter?: Str, marketType?: Str): MarketInterface;
    marketOrNull(symbol?: Str): MarketInterface;
    checkRequiredCredentials(error?: boolean): boolean;
    oath(): string;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchBalanceWs(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    watchBalance(params?: {}): Promise<Balances>;
    fetchPartialBalance(part: any, params?: {}): Promise<Balance>;
    fetchFreeBalance(params?: {}): Promise<Balance>;
    fetchUsedBalance(params?: {}): Promise<Balance>;
    fetchTotalBalance(params?: {}): Promise<Balance>;
    fetchStatus(params?: {}): Promise<any>;
    fetchTransactionFee(code: string, params?: {}): Promise<{}>;
    fetchTransactionFees(codes?: Strings, params?: {}): Promise<{}>;
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<Dictionary<DepositWithdrawFee>>;
    fetchDepositWithdrawFee(code: string, params?: {}): Promise<DepositWithdrawFee>;
    getSupportedMapping(key: any, mapping?: {}): any;
    fetchCrossBorrowRate(code: string, params?: {}): Promise<CrossBorrowRate>;
    fetchIsolatedBorrowRate(symbol: string, params?: {}): Promise<IsolatedBorrowRate>;
    handleOptionAndParams(params: object, methodName: string, optionName: string, defaultValue?: any): [any, Dict];
    handleOptionAndParams2(params: object, methodName1: string, optionName1: string, optionName2: string, defaultValue?: any): [any, Dict];
    handleOption(methodName: string, optionName: string, defaultValue?: any): any;
    handleMarketTypeAndParams(methodName: string, market?: Market, params?: {}, defaultValue?: any): [string, Dict];
    handleSubTypeAndParams(methodName: string, market?: Market, params?: {}, defaultValue?: any): [SubType, Dict];
    handleMarginModeAndParams(methodName: string, params?: {}, defaultValue?: any): [any, Dict];
    throwExactlyMatchedException(exact: any, string: any, message: any): void;
    throwBroadlyMatchedException(broad: any, string: any, message: any): void;
    findBroadlyMatchedKey(broad: any, string: any): string;
    handleErrors(statusCode: int, statusText: string, url: string, method: string, responseHeaders: Dict, responseBody: string, response: any, requestHeaders: any, requestBody: any): any;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): any;
    fetchSpotTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchContractTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchOrderBooks(symbols?: Strings, limit?: Int, params?: {}): Promise<OrderBooks>;
    unWatchTickers(symbols?: Strings, params?: {}): Promise<any>;
    unWatchFundingRate(symbol: string, params?: {}): Promise<any>;
    createTwapOrder(symbol: string, side: OrderSide, amount: number, duration: number, params?: {}): Promise<Order>;
    createConvertTrade(id: string, fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    fetchConvertTrade(id: string, code?: Str, params?: {}): Promise<Conversion>;
    fetchConvertTradeHistory(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Conversion[]>;
    fetchPositionMode(symbol?: Str, params?: {}): Promise<{}>;
    fetchADLRank(symbol: string, params?: {}): Promise<ADL>;
    fetchPositionsADLRank(symbols?: Strings, params?: {}): Promise<ADL[]>;
    fetchPositionADLRank(symbol: string, params?: {}): Promise<ADL>;
    setTakeProfitAndStopLossParams(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, takeProfit?: Num, stopLoss?: Num, params?: {}): {};
    createSpotOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createContractOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    cancelSpotOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelContractOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelAllSpotOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    cancelAllContractOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    cancelAllOrdersAfter(timeout: Int, params?: {}): Promise<{}>;
    cancelOrdersForSymbols(orders: CancellationRequest[], params?: {}): Promise<Order[]>;
    fetchMyLiquidations(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    fetchLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    fetchGreeks(symbol: string, params?: {}): Promise<Greeks>;
    fetchAllGreeks(symbols?: Strings, params?: {}): Promise<Greeks[]>;
    fetchOptionChain(code: string, params?: {}): Promise<OptionChain>;
    fetchOption(symbol: string, params?: {}): Promise<Option>;
    fetchConvertQuote(fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDepositsWs(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<{}>;
    fetchWithdrawalsWs(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<{}>;
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseLastPrice(price: any, market?: Market): LastPrice;
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    fetchContractDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    account(): BalanceAccount;
    commonCurrencyCode(code: string): string;
    currency(code: string): CurrencyInterface;
    market(symbol: string): MarketInterface;
    createExpiredOptionMarket(symbol: string): MarketInterface;
    isLeveragedCurrency(currencyCode: any, checkBaseCoin?: Bool, existingCurrencies?: Dict): boolean;
    handleWithdrawTagAndParams(tag: any, params: any): any;
    costToPrecision(symbol: string, cost: any): string;
    priceToPrecision(symbol: string, price: any): string;
    amountToPrecision(symbol: string, amount: any): string;
    feeToPrecision(symbol: string, fee: any): string;
    currencyToPrecision(code: string, fee: any, networkCode?: Str): string;
    forceString(value: any): string;
    isTickPrecision(): boolean;
    isDecimalPrecision(): boolean;
    isSignificantPrecision(): boolean;
    safeNumber(obj: any, key: IndexType, defaultNumber?: Num): Num;
    safeNumberN(obj: object, arr: IndexType[], defaultNumber?: Num): Num;
    parsePrecision(precision?: string): string;
    integerPrecisionToAmount(precision: Str): string;
    loadTimeDifference(params?: {}): Promise<any>;
    implodeHostname(url: string): string;
    fetchMarketLeverageTiers(symbol: string, params?: {}): Promise<LeverageTier[]>;
    createSubAccount(name: string, params?: {}): Promise<{}>;
    safeCurrencyCode(currencyId: Str, currency?: Currency): string;
    filterBySymbolSinceLimit(array: any, symbol?: Str, since?: Int, limit?: Int, tail?: boolean): any;
    filterByCurrencySinceLimit(array: any, code?: Str, since?: Int, limit?: Int, tail?: boolean): any;
    filterBySymbolsSinceLimit(array: any, symbols?: string[], since?: Int, limit?: Int, tail?: boolean): any;
    parseLastPrices(pricesData: any, symbols?: string[], params?: {}): LastPrices;
    parseTickers(tickers: any, symbols?: Strings, params?: {}): Tickers;
    parseDepositAddresses(addresses: any, codes?: Strings, indexed?: boolean, params?: {}): DepositAddress[];
    parseBorrowInterests(response: any, market?: Market): BorrowInterest[];
    parseBorrowRate(info: any, currency?: Currency): Dict;
    parseBorrowRateHistory(response: any, code: Str, since: Int, limit: Int): any;
    parseIsolatedBorrowRates(info: any): IsolatedBorrowRates;
    parseFundingRateHistories(response: any, market?: Market, since?: Int, limit?: Int): FundingRateHistory[];
    safeSymbol(marketId: Str, market?: Market, delimiter?: Str, marketType?: Str): string;
    parseFundingRate(contract: string, market?: Market): FundingRate;
    parseFundingRates(response: any, symbols?: Strings): FundingRates;
    parseLongShortRatio(info: Dict, market?: Market): LongShortRatio;
    parseLongShortRatioHistory(response: any, market?: Market, since?: Int, limit?: Int): LongShortRatio[];
    handleTriggerPricesAndParams(symbol: any, params: any, omitParams?: boolean): any[];
    handleTriggerDirectionAndParams(params: any, exchangeSpecificKey?: Str, allowEmpty?: Bool): any[];
    handleTriggerAndParams(params: any): any[];
    isTriggerOrder(params: any): any[];
    isPostOnly(isMarketOrder: boolean, exchangeSpecificParam: any, params?: {}): boolean;
    handlePostOnly(isMarketOrder: boolean, exchangeSpecificPostOnlyOption: boolean, params?: any): any[];
    fetchLastPrices(symbols?: Strings, params?: {}): Promise<LastPrices>;
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    fetchTradingFeesWs(params?: {}): Promise<TradingFees>;
    fetchConvertCurrencies(params?: {}): Promise<Currencies>;
    parseOpenInterest(interest: any, market?: Market): OpenInterest;
    parseOpenInterests(response: any, symbols?: Strings): OpenInterests;
    parseOpenInterestsHistory(response: any, market?: Market, since?: Int, limit?: Int): OpenInterest[];
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    fetchFundingInterval(symbol: string, params?: {}): Promise<FundingRate>;
    fetchMarkOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchIndexOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchPremiumIndexOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleTimeInForce(params?: {}): string;
    convertTypeToAccount(account: any): any;
    checkRequiredArgument(methodName: string, argument: any, argumentName: any, options?: any[]): void;
    checkRequiredMarginArgument(methodName: string, symbol: Str, marginMode: string): void;
    parseDepositWithdrawFees(response: any, codes?: Strings, currencyIdKey?: Str): any;
    parseDepositWithdrawFee(fee: any, currency?: Currency): any;
    depositWithdrawFee(info: any): any;
    assignDefaultDepositWithdrawFees(fee: any, currency?: Currency): any;
    parseIncome(info: any, market?: Market): object;
    parseIncomes(incomes: any, market?: Market, since?: Int, limit?: Int): FundingHistory[];
    getMarketFromSymbols(symbols?: Strings): MarketInterface;
    parseWsOHLCVs(ohlcvs: object[], market?: any, timeframe?: string, since?: Int, limit?: Int): any[];
    fetchTransactions(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    filterByArrayPositions(objects: any, key: IndexType, values?: any, indexed?: boolean): Position[];
    filterByArrayTickers(objects: any, key: IndexType, values?: any, indexed?: boolean): Dictionary<Ticker>;
    filterByArrayADLRanks(objects: any, key: IndexType, values?: any, indexed?: boolean): ADL[];
    createOHLCVObject(symbol: string, timeframe: string, data: any): Dictionary<Dictionary<OHLCV[]>>;
    handleMaxEntriesPerRequestAndParams(method: string, maxEntriesPerRequest?: Int, params?: {}): [Int, any];
    fetchPaginatedCallDynamic(method: string, symbol?: Str, since?: Int, limit?: Int, params?: {}, maxEntriesPerRequest?: Int, removeRepeated?: boolean): Promise<any>;
    safeDeterministicCall(method: string, symbol?: Str, since?: Int, limit?: Int, timeframe?: Str, params?: {}): Promise<any>;
    fetchPaginatedCallDeterministic(method: string, symbol?: Str, since?: Int, limit?: Int, timeframe?: Str, params?: {}, maxEntriesPerRequest?: Int): Promise<any>;
    fetchPaginatedCallCursor(method: string, symbol?: Str, since?: Int, limit?: Int, params?: {}, cursorReceived?: Str, cursorSent?: Str, cursorIncrement?: Int, maxEntriesPerRequest?: Int): Promise<any>;
    fetchPaginatedCallIncremental(method: string, symbol?: Str, since?: Int, limit?: Int, params?: {}, pageKey?: Str, maxEntriesPerRequest?: Int): Promise<any>;
    sortCursorPaginatedResult(result: any): any;
    removeRepeatedElementsFromArray(input: any, fallbackToTimestamp?: boolean): any;
    removeRepeatedTradesFromArray(input: any): any;
    removeKeysFromDict(dict: Dict, removeKeys: string[]): {};
    handleUntilOption(key: string, request: any, params: any, multiplier?: number): any[];
    safeOpenInterest(interest: Dict, market?: Market): OpenInterest;
    parseLiquidation(liquidation: any, market?: Market): Liquidation;
    parseLiquidations(liquidations: Dict[], market?: Market, since?: Int, limit?: Int): Liquidation[];
    parseGreeks(greeks: Dict, market?: Market): Greeks;
    parseAllGreeks(greeks: any, symbols?: Strings, params?: {}): Greeks[];
    parseOption(chain: Dict, currency?: Currency, market?: Market): Option;
    parseOptionChain(response: object[], currencyKey?: Str, symbolKey?: Str): OptionChain;
    parseMarginModes(response: object[], symbols?: string[], symbolKey?: Str, marketType?: MarketType): MarginModes;
    parseMarginMode(marginMode: Dict, market?: Market): MarginMode;
    parseLeverages(response: object[], symbols?: string[], symbolKey?: Str, marketType?: MarketType): Leverages;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    parseConversions(conversions: any[], code?: Str, fromCurrencyKey?: Str, toCurrencyKey?: Str, since?: Int, limit?: Int, params?: {}): Conversion[];
    parseConversion(conversion: Dict, fromCurrency?: Currency, toCurrency?: Currency): Conversion;
    convertExpireDate(date: string): string;
    convertExpireDateToMarketIdDate(date: string): string;
    convertMarketIdExpireDate(date: string): string;
    loadMarketsAndSignIn(): Promise<void>;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    parseMarginModifications(response: object[], symbols?: Strings, symbolKey?: Str, marketType?: MarketType): MarginModification[];
    fetchTransfer(id: string, code?: Str, params?: {}): Promise<TransferEntry>;
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<any>;
    withdrawWs(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<{}>;
    unWatchMyTrades(symbol?: Str, params?: {}): Promise<any>;
    fetchOrdersByStatusWs(status: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    unWatchBidsAsks(symbols?: Strings, params?: {}): Promise<any>;
    cleanUnsubscription(client: any, subHash: string, unsubHash: string, subHashIsPrefix?: boolean): void;
    cleanCache(subscription: Dict): void;
    timeframeFromMilliseconds(ms: number): string;
    isUTAEnabled(params?: {}): Promise<boolean>;
}
export default class Exchange extends BaseExchange {
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    closeAllPositions(params?: {}): Promise<Position[]>;
    editOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchPositionHistory(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    fetchPositionsHistory(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    fetchPositionsRisk(symbols?: Strings, params?: {}): Promise<Position[]>;
    fetchPositionsForSymbol(symbol: string, params?: {}): Promise<Position[]>;
    fetchPositionsForSymbolWs(symbol: string, params?: {}): Promise<Position[]>;
    watchPosition(symbol?: Str, params?: {}): Promise<Position>;
    watchMyTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchMarkPrice(symbol: string, params?: {}): Promise<Ticker>;
    fetchMarkPrices(symbols?: Strings, params?: {}): Promise<Tickers>;
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    watchMarkPrice(symbol: string, params?: {}): Promise<Ticker>;
    watchMarkPrices(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchL3OrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    watchOrdersForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    cancelAllOrdersWs(symbol?: Str, params?: {}): Promise<Order[]>;
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelOrdersWs(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    createLimitBuyOrderWs(symbol: string, amount: number, price: number, params?: {}): Promise<Order>;
    createLimitOrderWs(symbol: string, side: OrderSide, amount: number, price: number, params?: {}): Promise<Order>;
    createLimitSellOrderWs(symbol: string, amount: number, price: number, params?: {}): Promise<Order>;
    createMarketBuyOrderWs(symbol: string, amount: number, params?: {}): Promise<Order>;
    createMarketOrderWithCostWs(symbol: string, side: OrderSide, cost: number, params?: {}): Promise<Order>;
    createMarketOrderWs(symbol: string, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createMarketSellOrderWs(symbol: string, amount: number, params?: {}): Promise<Order>;
    createOrderWithTakeProfitAndStopLossWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, takeProfit?: Num, stopLoss?: Num, params?: {}): Promise<Order>;
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createOrdersWs(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createPostOnlyOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createReduceOnlyOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createStopLimitOrderWs(symbol: string, side: OrderSide, amount: number, price: number, triggerPrice: number, params?: {}): Promise<Order>;
    createStopLossOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, stopLossPrice?: Num, params?: {}): Promise<Order>;
    createStopMarketOrderWs(symbol: string, side: OrderSide, amount: number, triggerPrice: number, params?: {}): Promise<Order>;
    createStopOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, triggerPrice?: Num, params?: {}): Promise<Order>;
    createTakeProfitOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, takeProfitPrice?: Num, params?: {}): Promise<Order>;
    createTrailingAmountOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, trailingAmount?: Num, trailingTriggerPrice?: Num, params?: {}): Promise<Order>;
    createTrailingPercentOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, trailingPercent?: Num, trailingTriggerPrice?: Num, params?: {}): Promise<Order>;
    createTriggerOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, triggerPrice?: Num, params?: {}): Promise<Order>;
    editOrderWs(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    fetchClosedOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchMyTradesWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOpenOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrderBookWs(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchPositionWs(symbol: string, params?: {}): Promise<Position[]>;
    fetchPositionsWs(symbols?: Strings, params?: {}): Promise<Position[]>;
    fetchTickerWs(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickersWs(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTradesWs(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    loadOrderBook(client: any, messageHash: string, symbol: string, limit?: Int, params?: {}): Promise<void>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchRestOrderBookSafe(symbol: any, limit?: Int, params?: {}): Promise<OrderBook>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchOpenInterest(symbol: string, params?: {}): Promise<OpenInterest>;
    fetchL2OrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    editLimitBuyOrder(id: string, symbol: string, amount: number, price?: Num, params?: {}): Promise<Order>;
    editLimitSellOrder(id: string, symbol: string, amount: number, price?: Num, params?: {}): Promise<Order>;
    editLimitOrder(id: string, symbol: string, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    editOrderWithClientOrderId(clientOrderId: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    watchPositionForSymbols(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name fetchOrderWithClientOrderId
     * @description create a market order by providing the symbol, side and cost
     * @param {string} clientOrderId client order Id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrderWithClientOrderId(clientOrderId: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrderStatus(id: string, symbol?: Str, params?: {}): Promise<string>;
    fetchUnifiedOrder(order: any, params?: {}): Promise<Order>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createTrailingAmountOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, trailingAmount?: Num, trailingTriggerPrice?: Num, params?: {}): Promise<Order>;
    createTrailingPercentOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, trailingPercent?: Num, trailingTriggerPrice?: Num, params?: {}): Promise<Order>;
    createMarketOrderWithCost(symbol: string, side: OrderSide, cost: number, params?: {}): Promise<Order>;
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    createMarketSellOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    createTriggerOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, triggerPrice?: Num, params?: {}): Promise<Order>;
    createStopLossOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, stopLossPrice?: Num, params?: {}): Promise<Order>;
    createTakeProfitOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, takeProfitPrice?: Num, params?: {}): Promise<Order>;
    createOrderWithTakeProfitAndStopLoss(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, takeProfit?: Num, stopLoss?: Num, params?: {}): Promise<Order>;
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name cancelOrderWithClientOrderId
     * @description create a market order by providing the symbol, side and cost
     * @param {string} clientOrderId client order Id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrderWithClientOrderId(clientOrderId: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name cancelOrdersWithClientOrderIds
     * @description create a market order by providing the symbol, side and cost
     * @param {string[]} clientOrderIds client order Ids
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrdersWithClientOrderIds(clientOrderIds: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    cancelUnifiedOrder(order: Order, params?: {}): Promise<{}>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    createLimitOrder(symbol: string, side: OrderSide, amount: number, price: number, params?: {}): Promise<Order>;
    createMarketOrder(symbol: string, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createLimitBuyOrder(symbol: string, amount: number, price: number, params?: {}): Promise<Order>;
    createLimitSellOrder(symbol: string, amount: number, price: number, params?: {}): Promise<Order>;
    createMarketBuyOrder(symbol: string, amount: number, params?: {}): Promise<Order>;
    createMarketSellOrder(symbol: string, amount: number, params?: {}): Promise<Order>;
    createPostOnlyOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createReduceOnlyOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createStopOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, triggerPrice?: Num, params?: {}): Promise<Order>;
    createStopLimitOrder(symbol: string, side: OrderSide, amount: number, price: number, triggerPrice: number, params?: {}): Promise<Order>;
    createStopMarketOrder(symbol: string, side: OrderSide, amount: number, triggerPrice: number, params?: {}): Promise<Order>;
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
}
export { Exchange, };
