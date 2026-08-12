isNode = functions.isNode
isBun = functions.isBun
selfIsDefined = functions.selfIsDefined
deepExtend = functions.deepExtend
# TS narrows `deepExtendSafe`/`indexBySafe` to typed aliases of the same
# helpers (Exchange.ts); the backend references them without emitting the
# bindings, so they are declared here.
deepExtendSafe = functions.deepExtend
indexBySafe = functions.indexBy
extend = functions.extend
clone = functions.clone
unique = functions.unique
indexBy = functions.indexBy
sortBy = functions.sortBy
sortBy2 = functions.sortBy2
safeFloat2 = functions.safeFloat2
groupBy = functions.groupBy
aggregate = functions.aggregate
uuid = functions.uuid
unCamelCase = functions.unCamelCase
precisionFromString = functions.precisionFromString
Throttler = functions.Throttler
capitalize = functions.capitalize
now = functions.now
decimalToPrecision = functions.decimalToPrecision
safeValue = functions.safeValue
safeValue2 = functions.safeValue2
safeString = functions.safeString
safeString2 = functions.safeString2
seconds = functions.seconds
milliseconds = functions.milliseconds
binaryToBase16 = functions.binaryToBase16
numberToBE = functions.numberToBE
base16ToBinary = functions.base16ToBinary
iso8601 = functions.iso8601
omit = functions.omit
isJsonEncodedObject = functions.isJsonEncodedObject
safeInteger = functions.safeInteger
sum = functions.sum
omitZero = functions.omitZero
implodeParams = functions.implodeParams
extractParams = functions.extractParams
json = functions.json
binaryConcat = functions.binaryConcat
hash = functions.hash
arrayConcat = functions.arrayConcat
encode = functions.encode
urlencode = functions.urlencode
hmac = functions.hmac
numberToString = functions.numberToString
roundTimeframe = functions.roundTimeframe
parseTimeframe = functions.parseTimeframe
safeInteger2 = functions.safeInteger2
safeStringLower = functions.safeStringLower
parse8601 = functions.parse8601
yyyymmdd = functions.yyyymmdd
safeStringUpper = functions.safeStringUpper
safeTimestamp = functions.safeTimestamp
binaryConcatArray = functions.binaryConcatArray
ymdhms = functions.ymdhms
stringToBase64 = functions.stringToBase64
decode = functions.decode
uuid22 = functions.uuid22
safeIntegerProduct2 = functions.safeIntegerProduct2
safeIntegerProduct = functions.safeIntegerProduct
safeStringLower2 = functions.safeStringLower2
yymmdd = functions.yymmdd
base58ToBinary = functions.base58ToBinary
binaryToBase58 = functions.binaryToBase58
safeTimestamp2 = functions.safeTimestamp2
rawencode = functions.rawencode
keysort = functions.keysort
sort = functions.sort
inArray = functions.inArray
isEmpty = functions.isEmpty
filterBy = functions.filterBy
uuid16 = functions.uuid16
safeFloat = functions.safeFloat
base64ToBinary = functions.base64ToBinary
safeStringUpper2 = functions.safeStringUpper2
urlencodeWithArrayRepeat = functions.urlencodeWithArrayRepeat
microseconds = functions.microseconds
binaryToBase64 = functions.binaryToBase64
strip = functions.strip
toArray = functions.toArray
safeFloatN = functions.safeFloatN
safeIntegerN = functions.safeIntegerN
safeIntegerProductN = functions.safeIntegerProductN
safeTimestampN = functions.safeTimestampN
safeValueN = functions.safeValueN
safeStringN = functions.safeStringN
safeStringLowerN = functions.safeStringLowerN
safeStringUpperN = functions.safeStringUpperN
urlencodeNested = functions.urlencodeNested
urlencodeBase64 = functions.urlencodeBase64
parseDate = functions.parseDate
ymd = functions.ymd
base64ToString = functions.base64ToString
crc32 = functions.crc32
packb = functions.packb
TRUNCATE = functions.TRUNCATE
ROUND = functions.ROUND
DECIMAL_PLACES = functions.DECIMAL_PLACES
NO_PADDING = functions.NO_PADDING
TICK_SIZE = functions.TICK_SIZE
SIGNIFICANT_DIGITS = functions.SIGNIFICANT_DIGITS
sleep = functions.sleep
readFile = functions.readFile
writeFile = functions.writeFile
existsFile = functions.existsFile
getTempDir = functions.getTempDir
filePathToFileUrlForWindows = functions.filePathToFileUrlForWindows;
export Market, Trade, Fee, Ticker, OHLCV, OHLCVC, Order, OrderBook, Balance, Balances, Dictionary, Transaction, Currency, MinMax, IndexType, NullableIndexType, Int, Bool, OrderType, OrderSide, Position, LedgerEntry, BorrowInterest, OpenInterest, LeverageTier, TransferEntry, CrossBorrowRate, FundingRateHistory, Liquidation, FundingHistory, OrderRequest, MarginMode, Tickers, Greeks, Option, OptionChain, Str, Num, MarketInterface, CurrencyInterface, BalanceAccount, MarginModes, MarketType, Leverage, Leverages, LastPrice, LastPrices, Account, Strings, Conversion, DepositAddress, LongShortRatio, ADL
function dynamicImport(moduleName)
    return (moduleName)
end;
protobufMexc = nothing;
encodeAsAny = nothing;
AuthInfo = nothing;
Tx = nothing;
TxBody = nothing;
TxRaw = nothing;
SignDoc = nothing;
SignMode = nothing;
QUOTE_JSON_NUMBERS_REGEX = Regex("\":([+.0-9eE-]+)(?=[,}])");
@kwdef mutable struct Precision
        amount::Float64 = 0.0
        price::Float64 = 0.0
        cost::Union{Float64, Nothing} = nothing
        base::Union{Float64, Nothing} = nothing
        quote_var::Union{Float64, Nothing} = nothing
end

@kwdef mutable struct Status
        status::String = ""
        updated::Float64 = 0.0
        eta::Float64 = 0.0
        url::String = ""
        info::Any = nothing
end

@kwdef mutable struct Limits
        amount::Union{MinMax, Nothing} = nothing
        cost::Union{MinMax, Nothing} = nothing
        leverage::Union{MinMax, Nothing} = nothing
        price::Union{MinMax, Nothing} = nothing
end

@kwdef mutable struct Fees
        trading::Dict{String, Any} = Dict{String, Any}()
        funding::Dict{String, Any} = Dict{String, Any}()
end

@kwdef mutable struct Exchange <: CcxtExchange
    attrs::Dict{Symbol, Any} = Dict{Symbol, Any}()
    ccxtVersion = "4.5.71"
    options::Union{Dict, Nothing} = nothing
    isSandboxModeEnabled::Bool = false
    api::Union{Dict{String, Any}, Nothing} = nothing
    certified::Bool = false
    pro::Bool = false
    countries::Union{Strings, Nothing} = nothing
    proxy::Any = nothing
    proxyUrl::Union{String, Nothing} = nothing
    proxy_url::Union{String, Nothing} = nothing
    proxyUrlCallback::Any = nothing
    proxy_url_callback::Any = nothing
    httpProxy::Union{String, Nothing} = nothing
    http_proxy::Union{String, Nothing} = nothing
    httpProxyCallback::Any = nothing
    http_proxy_callback::Any = nothing
    httpsProxy::Union{String, Nothing} = nothing
    https_proxy::Union{String, Nothing} = nothing
    httpsProxyCallback::Any = nothing
    https_proxy_callback::Any = nothing
    socksProxy::Union{String, Nothing} = nothing
    socks_proxy::Union{String, Nothing} = nothing
    socksProxyCallback::Any = nothing
    socks_proxy_callback::Any = nothing
    userAgent::Union{Dict{String, Any}, Bool, Nothing} = nothing
    user_agent::Union{Dict{String, Any}, Bool, Nothing} = nothing
    wsProxy::Union{String, Nothing} = nothing
    ws_proxy::Union{String, Nothing} = nothing
    wssProxy::Union{String, Nothing} = nothing
    wss_proxy::Union{String, Nothing} = nothing
    wsSocksProxy::Union{String, Nothing} = nothing
    ws_socks_proxy::Union{String, Nothing} = nothing
    userAgents::Dict{Symbol, String} = Dict{Symbol, Any}(
    Symbol("chrome") => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
    Symbol("chrome39") => "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36",
    Symbol("chrome100") => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36"
)
    headers::Dict{String, String} = Dict{String, String}()
    returnResponseHeaders::Bool = false
    origin::String = "*"
    MAX_VALUE::Float64 = typemax(Float64)
    agent::Any = nothing
    httpAgent::Any = nothing
    httpsAgent::Any = nothing
    minFundingAddressLength::Float64 = 1
    substituteCommonCurrencyCodes::Bool = true
    quoteJsonNumbers::Bool = true
    number::Function = ccxt_Number
    handleContentTypeApplicationZip::Bool = false
    reduceFees::Bool = true
    fetchImplementation::Any = nothing
    AbortError::Any = nothing
    FetchError::Any = nothing
    fetchImplementationLoading::Union{Task, Nothing} = nothing
    fetchIsNative::Bool = false
    undiciModule::Any = nothing
    zlibModule::Any = nothing
    httpStatusTexts::Any = Dict{Symbol, Any}()
    fetchDispatcher::Any = nothing
    validateServerSsl::Bool = true
    validateClientSsl::Bool = false
    timeout::Float64 = 10000
    verbose::Bool = false
    apiKey::Union{String, Nothing} = nothing
    secret::Union{String, Nothing} = nothing
    uid::Union{String, Nothing} = nothing
    login::Union{String, Nothing} = nothing
    password::Union{String, Nothing} = nothing
    privateKey::Union{String, Nothing} = nothing
    walletAddress::Union{String, Nothing} = nothing
    token::Union{String, Nothing} = nothing
    twofa::Union{String, Nothing} = nothing
    accountId::Union{String, Nothing} = nothing
    balance::Any = Dict{Symbol, Any}()
    liquidations::Any = nothing
    orderbooks::Dict{String, Ob} = Dict{String, Ob}()
    tickers::Dict{String, Ticker} = Dict{String, Ticker}()
    fundingRates::Dict{String, FundingRate} = Dict{String, FundingRate}()
    bidsasks::Dict{String, Ticker} = Dict{String, Ticker}()
    orders::Union{ArrayCache, Nothing} = nothing
    triggerOrders::Union{ArrayCache, Nothing} = nothing
    trades::Union{Dict{String, ArrayCache}, Nothing} = nothing
    transactions::Dict{String, Transaction} = Dict{String, Transaction}()
    ohlcvs::Union{Dict{String, Dict{String, ArrayCacheByTimestamp}}, Nothing} = nothing
    myLiquidations::Any = nothing
    myTrades::Union{ArrayCache, Nothing} = nothing
    positions::Any = nothing
    urls::Any = nothing
    requiresWeb3::Bool = false
    precision::Any = nothing
    enableLastJsonResponse::Bool = false
    enableLastHttpResponse::Bool = true
    enableLastResponseHeaders::Bool = true
    last_http_response::Union{String, Nothing} = nothing
    last_json_response::Any = nothing
    last_response_headers::Union{Dict{String, String}, Nothing} = nothing
    last_request_headers::Union{Dict{String, String}, Nothing} = nothing
    last_request_body::Any = nothing
    last_request_url::Union{String, Nothing} = nothing
    last_request_path::Union{String, Nothing} = nothing
    fetchHistoryCache::Any = []
    fetchHistoryCacheSize::Float64 = 0
    id::String = "Exchange"
    markets::Union{Dict{String, Any}, Nothing} = nothing
    has::Union{Dict{String, Union{Bool, String, Nothing}}, Nothing} = nothing
    features::Any = nothing
    status::Any = nothing
    requiredCredentials::Any = nothing
    rateLimit::Float64 = 2000
    tokenBucket::Any = nothing
    throttler::Any = nothing
    enableRateLimit::Bool = true
    rollingWindowSize::Float64 = 0
    rateLimiterAlgorithm::String = "leakyBucket"
    httpExceptions::Union{Dict{String, Any}, Nothing} = nothing
    limits::Any = nothing
    fees::Any = nothing
    markets_by_id::Union{Dict{String, Any}, Nothing} = nothing
    symbols::Any = []
    ids::Union{Strings, Nothing} = nothing
    currencies::Currencies = Dict{Symbol, Any}()
    baseCurrencies::Union{Dict{String, CurrencyInterface}, Nothing} = nothing
    quoteCurrencies::Union{Dict{String, CurrencyInterface}, Nothing} = nothing
    currencies_by_id::Union{Dict{String, CurrencyInterface}, Nothing} = nothing
    codes::Union{Strings, Nothing} = nothing
    reloadingMarkets::Union{Bool, Nothing} = nothing
    marketsLoading::Union{Task, Nothing} = nothing
    accounts::Union{Vector{Account}, Nothing} = nothing
    accountsById::Union{Dict{String, Account}, Nothing} = nothing
    commonCurrencies::Union{Dict{String, String}, Nothing} = nothing
    hostname::Union{String, Nothing} = nothing
    precisionMode::Union{Int, Nothing} = nothing
    paddingMode::Union{Int, Nothing} = nothing
    exceptions::Any = Dict{Symbol, Any}()
    timeframes::Any = Dict{String, Union{Float64, String}}()
    version::Union{String, Nothing} = nothing
    name::Union{String, Nothing} = nothing
    lastRestRequestTimestamp::Union{Int, Nothing} = nothing
    targetAccount::Union{String, Nothing} = nothing
    httpProxyAgentModule::Any = nothing
    httpsProxyAgentModule::Any = nothing
    socksProxyAgentModule::Any = nothing
    socksProxyAgentModuleChecked::Bool = false
    proxyDictionaries::Dict{String, Any} = Dict{String, Any}()
    proxyDictionariesMaxSize::Float64 = 8
    proxiesModulesLoading::Union{Task, Nothing} = nothing
    alias::Bool = false
    clients::Dict{String, WsClient} = Dict{String, WsClient}()
    newUpdates::Bool = true
    streaming::Dict{String, Any} = Dict{String, Any}()
    sleep = sleep
    deepExtend = deepExtend
    deepExtendSafe = deepExtend
    isNode = isNode
    extend = extend
    clone = clone
    unique = unique
    indexBy = indexBy
    indexBySafe = indexBy
    roundTimeframe = roundTimeframe
    sortBy = sortBy
    sortBy2 = sortBy2
    groupBy = groupBy
    aggregate = aggregate
    uuid = uuid
    unCamelCase = unCamelCase
    precisionFromString = precisionFromString
    capitalize = capitalize
    now = now
    decimalToPrecision = decimalToPrecision
    safeValue = safeValue
    safeValue2 = safeValue2
    safeString = safeString
    safeString2 = safeString2
    safeFloat = safeFloat
    safeFloat2 = safeFloat2
    seconds = seconds
    milliseconds = milliseconds
    binaryToBase16 = binaryToBase16
    numberToBE = numberToBE
    base16ToBinary = base16ToBinary
    iso8601 = iso8601
    omit = omit
    isJsonEncodedObject = isJsonEncodedObject
    safeInteger = safeInteger
    sum = sum
    omitZero = omitZero
    implodeParams = implodeParams
    extractParams = extractParams
    json = json
    binaryConcat = binaryConcat
    hash = hash
    arrayConcat = arrayConcat
    encode = encode
    urlencode = urlencode
    hmac = hmac
    numberToString = numberToString
    parseTimeframe = parseTimeframe
    safeInteger2 = safeInteger2
    safeStringLower = safeStringLower
    parse8601 = parse8601
    yyyymmdd = yyyymmdd
    safeStringUpper = safeStringUpper
    safeTimestamp = safeTimestamp
    binaryConcatArray = binaryConcatArray
    ymdhms = ymdhms
    yymmdd = yymmdd
    stringToBase64 = stringToBase64
    decode = decode
    uuid22 = uuid22
    safeIntegerProduct2 = safeIntegerProduct2
    safeIntegerProduct = safeIntegerProduct
    binaryToBase58 = binaryToBase58
    base58ToBinary = base58ToBinary
    base64ToBinary = base64ToBinary
    safeTimestamp2 = safeTimestamp2
    rawencode = rawencode
    keysort = keysort
    sort = sort
    inArray = inArray
    safeStringLower2 = safeStringLower2
    safeStringUpper2 = safeStringUpper2
    isEmpty = isEmpty
    filterBy = filterBy
    uuid16 = uuid16
    urlencodeWithArrayRepeat = urlencodeWithArrayRepeat
    microseconds = microseconds
    binaryToBase64 = binaryToBase64
    strip = strip
    toArray = toArray
    safeFloatN = safeFloatN
    safeIntegerN = safeIntegerN
    safeIntegerProductN = safeIntegerProductN
    safeTimestampN = safeTimestampN
    safeValueN = safeValueN
    safeStringN = safeStringN
    safeStringLowerN = safeStringLowerN
    safeStringUpperN = safeStringUpperN
    urlencodeNested = urlencodeNested
    parseDate = parseDate
    ymd = ymd
    base64ToString = base64ToString
    crc32 = crc32
    packb = packb
    urlencodeBase64 = urlencodeBase64
    readFile = readFile
    writeFile = writeFile
    existsFile = existsFile
    getTempDir = getTempDir
    function Exchange(attrs=Dict{Symbol, Any}(), ccxtVersion="4.5.71", options=nothing, isSandboxModeEnabled=false, api=nothing, certified=false, pro=false, countries=nothing, proxy=nothing, proxyUrl=nothing, proxy_url=nothing, proxyUrlCallback=nothing, proxy_url_callback=nothing, httpProxy=nothing, http_proxy=nothing, httpProxyCallback=nothing, http_proxy_callback=nothing, httpsProxy=nothing, https_proxy=nothing, httpsProxyCallback=nothing, https_proxy_callback=nothing, socksProxy=nothing, socks_proxy=nothing, socksProxyCallback=nothing, socks_proxy_callback=nothing, userAgent=nothing, user_agent=nothing, wsProxy=nothing, ws_proxy=nothing, wssProxy=nothing, wss_proxy=nothing, wsSocksProxy=nothing, ws_socks_proxy=nothing, userAgents=Dict{Symbol, Any}(
    Symbol("chrome") => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
    Symbol("chrome39") => "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36",
    Symbol("chrome100") => "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36"
), headers=Dict{Symbol, Any}(), returnResponseHeaders=false, origin="*", MAX_VALUE=get(ccxt_Number, Symbol("MAX_VALUE"), nothing), agent=nothing, httpAgent=nothing, httpsAgent=nothing, minFundingAddressLength=1, substituteCommonCurrencyCodes=true, quoteJsonNumbers=true, number=ccxt_Number, handleContentTypeApplicationZip=false, reduceFees=true, fetchImplementation=nothing, AbortError=nothing, FetchError=nothing, fetchImplementationLoading=nothing, fetchIsNative=false, undiciModule=nothing, zlibModule=nothing, httpStatusTexts=Dict{Symbol, Any}(), fetchDispatcher=nothing, validateServerSsl=true, validateClientSsl=false, timeout=10000, verbose=false, apiKey=nothing, secret=nothing, uid=nothing, login=nothing, password=nothing, privateKey=nothing, walletAddress=nothing, token=nothing, twofa=nothing, accountId=nothing, balance=Dict{Symbol, Any}(), liquidations=nothing, orderbooks=Dict{Symbol, Any}(), tickers=Dict{Symbol, Any}(), fundingRates=Dict{Symbol, Any}(), bidsasks=Dict{Symbol, Any}(), orders=nothing, triggerOrders=nothing, trades=Dict{String, ArrayCache}(), transactions=Dict{Symbol, Any}(), ohlcvs=Dict{String, Dict{String, ArrayCacheByTimestamp}}(), myLiquidations=nothing, myTrades=nothing, positions=nothing, urls=nothing, requiresWeb3=false, precision=nothing, enableLastJsonResponse=false, enableLastHttpResponse=true, enableLastResponseHeaders=true, last_http_response=nothing, last_json_response=nothing, last_response_headers=nothing, last_request_headers=nothing, last_request_body=nothing, last_request_url=nothing, last_request_path=nothing, fetchHistoryCache=[], fetchHistoryCacheSize=0, id="Exchange", markets=nothing, has=nothing, features=nothing, status=nothing, requiredCredentials=nothing, rateLimit=2000, tokenBucket=nothing, throttler=nothing, enableRateLimit=true, rollingWindowSize=0, rateLimiterAlgorithm="leakyBucket", httpExceptions=nothing, limits=nothing, fees=nothing, markets_by_id=nothing, symbols=[], ids=nothing, currencies=Dict{Symbol, Any}(), baseCurrencies=nothing, quoteCurrencies=nothing, currencies_by_id=nothing, codes=nothing, reloadingMarkets=nothing, marketsLoading=nothing, accounts=nothing, accountsById=nothing, commonCurrencies=nothing, hostname=nothing, precisionMode=nothing, paddingMode=nothing, exceptions=Dict{Symbol, Any}(), timeframes=Dict{Symbol, Any}(), version=nothing, name=nothing, lastRestRequestTimestamp=0.0, targetAccount=nothing, httpProxyAgentModule=nothing, httpsProxyAgentModule=nothing, socksProxyAgentModule=nothing, socksProxyAgentModuleChecked=false, proxyDictionaries=Dict{Symbol, Any}(), proxyDictionariesMaxSize=8, proxiesModulesLoading=nothing, alias=false, clients=Dict{Symbol, Any}(), newUpdates=true, streaming=Dict{Symbol, Any}(), sleep=sleep, deepExtend=deepExtend, deepExtendSafe=deepExtend, isNode=isNode, extend=extend, clone=clone, unique=unique, indexBy=indexBy, indexBySafe=indexBy, roundTimeframe=roundTimeframe, sortBy=sortBy, sortBy2=sortBy2, groupBy=groupBy, aggregate=aggregate, uuid=uuid, unCamelCase=unCamelCase, precisionFromString=precisionFromString, capitalize=capitalize, now=now, decimalToPrecision=decimalToPrecision, safeValue=safeValue, safeValue2=safeValue2, safeString=safeString, safeString2=safeString2, safeFloat=safeFloat, safeFloat2=safeFloat2, seconds=seconds, milliseconds=milliseconds, binaryToBase16=binaryToBase16, numberToBE=numberToBE, base16ToBinary=base16ToBinary, iso8601=iso8601, omit=omit, isJsonEncodedObject=isJsonEncodedObject, safeInteger=safeInteger, sum=sum, omitZero=omitZero, implodeParams=implodeParams, extractParams=extractParams, json=json, binaryConcat=binaryConcat, hash=hash, arrayConcat=arrayConcat, encode=encode, urlencode=urlencode, hmac=hmac, numberToString=numberToString, parseTimeframe=parseTimeframe, safeInteger2=safeInteger2, safeStringLower=safeStringLower, parse8601=parse8601, yyyymmdd=yyyymmdd, safeStringUpper=safeStringUpper, safeTimestamp=safeTimestamp, binaryConcatArray=binaryConcatArray, ymdhms=ymdhms, yymmdd=yymmdd, stringToBase64=stringToBase64, decode=decode, uuid22=uuid22, safeIntegerProduct2=safeIntegerProduct2, safeIntegerProduct=safeIntegerProduct, binaryToBase58=binaryToBase58, base58ToBinary=base58ToBinary, base64ToBinary=base64ToBinary, safeTimestamp2=safeTimestamp2, rawencode=rawencode, keysort=keysort, sort=sort, inArray=inArray, safeStringLower2=safeStringLower2, safeStringUpper2=safeStringUpper2, isEmpty=isEmpty, filterBy=filterBy, uuid16=uuid16, urlencodeWithArrayRepeat=urlencodeWithArrayRepeat, microseconds=microseconds, binaryToBase64=binaryToBase64, strip=strip, toArray=toArray, safeFloatN=safeFloatN, safeIntegerN=safeIntegerN, safeIntegerProductN=safeIntegerProductN, safeTimestampN=safeTimestampN, safeValueN=safeValueN, safeStringN=safeStringN, safeStringLowerN=safeStringLowerN, safeStringUpperN=safeStringUpperN, urlencodeNested=urlencodeNested, parseDate=parseDate, ymd=ymd, base64ToString=base64ToString, crc32=crc32, packb=packb, urlencodeBase64=urlencodeBase64, readFile=readFile, writeFile=writeFile, existsFile=existsFile, getTempDir=getTempDir; userConfig::ConstructorArgs = Dict{Symbol, Any}(), kwargs...)
        v = new(attrs, ccxtVersion, options, isSandboxModeEnabled, api, certified, pro, countries, proxy, proxyUrl, proxy_url, proxyUrlCallback, proxy_url_callback, httpProxy, http_proxy, httpProxyCallback, http_proxy_callback, httpsProxy, https_proxy, httpsProxyCallback, https_proxy_callback, socksProxy, socks_proxy, socksProxyCallback, socks_proxy_callback, userAgent, user_agent, wsProxy, ws_proxy, wssProxy, wss_proxy, wsSocksProxy, ws_socks_proxy, userAgents, headers, returnResponseHeaders, origin, MAX_VALUE, agent, httpAgent, httpsAgent, minFundingAddressLength, substituteCommonCurrencyCodes, quoteJsonNumbers, number, handleContentTypeApplicationZip, reduceFees, fetchImplementation, AbortError, FetchError, fetchImplementationLoading, fetchIsNative, undiciModule, zlibModule, httpStatusTexts, fetchDispatcher, validateServerSsl, validateClientSsl, timeout, verbose, apiKey, secret, uid, login, password, privateKey, walletAddress, token, twofa, accountId, balance, liquidations, orderbooks, tickers, fundingRates, bidsasks, orders, triggerOrders, trades, transactions, ohlcvs, myLiquidations, myTrades, positions, urls, requiresWeb3, precision, enableLastJsonResponse, enableLastHttpResponse, enableLastResponseHeaders, last_http_response, last_json_response, last_response_headers, last_request_headers, last_request_body, last_request_url, last_request_path, fetchHistoryCache, fetchHistoryCacheSize, id, markets, has, features, status, requiredCredentials, rateLimit, tokenBucket, throttler, enableRateLimit, rollingWindowSize, rateLimiterAlgorithm, httpExceptions, limits, fees, markets_by_id, symbols, ids, currencies, baseCurrencies, quoteCurrencies, currencies_by_id, codes, reloadingMarkets, marketsLoading, accounts, accountsById, commonCurrencies, hostname, precisionMode, paddingMode, exceptions, timeframes, version, name, lastRestRequestTimestamp, targetAccount, httpProxyAgentModule, httpsProxyAgentModule, socksProxyAgentModule, socksProxyAgentModuleChecked, proxyDictionaries, proxyDictionariesMaxSize, proxiesModulesLoading, alias, clients, newUpdates, streaming, sleep, deepExtend, deepExtendSafe, isNode, extend, clone, unique, indexBy, indexBySafe, roundTimeframe, sortBy, sortBy2, groupBy, aggregate, uuid, unCamelCase, precisionFromString, capitalize, now, decimalToPrecision, safeValue, safeValue2, safeString, safeString2, safeFloat, safeFloat2, seconds, milliseconds, binaryToBase16, numberToBE, base16ToBinary, iso8601, omit, isJsonEncodedObject, safeInteger, sum, omitZero, implodeParams, extractParams, json, binaryConcat, hash, arrayConcat, encode, urlencode, hmac, numberToString, parseTimeframe, safeInteger2, safeStringLower, parse8601, yyyymmdd, safeStringUpper, safeTimestamp, binaryConcatArray, ymdhms, yymmdd, stringToBase64, decode, uuid22, safeIntegerProduct2, safeIntegerProduct, binaryToBase58, base58ToBinary, base64ToBinary, safeTimestamp2, rawencode, keysort, sort, inArray, safeStringLower2, safeStringUpper2, isEmpty, filterBy, uuid16, urlencodeWithArrayRepeat, microseconds, binaryToBase64, strip, toArray, safeFloatN, safeIntegerN, safeIntegerProductN, safeTimestampN, safeValueN, safeStringN, safeStringLowerN, safeStringUpperN, urlencodeNested, parseDate, ymd, base64ToString, crc32, packb, urlencodeBase64, readFile, writeFile, existsFile, getTempDir)
        # In TS the constructor takes a single `userConfig` object. The
        # backend expanded every struct field into its own positional
        # parameter, pushing `userConfig` into a keyword — so a plain
        # `Exchange (config)` call would land the config in `attrs` and be
        # dropped. Treat a leading Dict as the user config, which is what
        # every call site (and the shared test suite) actually passes.
        if isempty(userConfig) && attrs isa AbstractDict && !isempty(attrs)
            userConfig = attrs
            attrs = Dict{Symbol, Any}()
            v.attrs = attrs
        end
        v.attrs[:userConfig] = userConfig
        for (key, value) in kwargs
            v.attrs[key] = value
        end
        objectAssign(v, functions);
        v.options = v.getDefaultOptions();
        v.headers = Dict{Symbol, Any}();
        v.origin = "*";
        v.minFundingAddressLength = 1;
        v.substituteCommonCurrencyCodes = true;
        v.quoteJsonNumbers = true;
        v.number = ccxt_Number;
        v.handleContentTypeApplicationZip = false;
        v.reduceFees = true;
        v.fetchImplementation = nothing;
        v.validateServerSsl = true;
        v.validateClientSsl = false;
        v.timeout = 10000;
        v.verbose = false;
        v.balance = Dict{Symbol, Any}();
        v.bidsasks = Dict{Symbol, Any}();
        v.orderbooks = Dict{Symbol, Any}();
        v.tickers = Dict{Symbol, Any}();
        v.liquidations = nothing;
        v.orders = nothing;
        v.trades = Dict{Symbol, Any}();
        v.transactions = Dict{Symbol, Any}();
        v.ohlcvs = Dict{Symbol, Any}();
        v.myLiquidations = nothing;
        v.myTrades = nothing;
        v.positions = nothing;
        v.requiresWeb3 = false;
        v.lastRestRequestTimestamp = 0;
        v.enableLastJsonResponse = false;
        v.enableLastHttpResponse = true;
        v.enableLastResponseHeaders = true;
        v.last_json_response = nothing;
        v.last_request_body = nothing;
        function unCamelCaseProperties(obj=v)
            if functions.ccxtruthy(obj != nothing)
            ownPropertyNames = functions.ccxt_getOwnPropertyNames(obj);
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(ownPropertyNames)))
                k = get(ownPropertyNames, i + 1, nothing);
                v[Symbol(unCamelCase(k))] = get(v, Symbol(k), nothing);
                i += 1
            end
        
            unCamelCaseProperties(nothing);
        end
        
        end;
        unCamelCaseProperties();
        configEntries = concat(objectEntries(v.describe()), objectEntries(userConfig));
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(configEntries)))
            (property, value) = get(configEntries, i + 1, nothing);
            # TS: `value && Object.getPrototypeOf (value) === Object.prototype`
            # — merge only plain objects, assign everything else. The backend lost
            # the prototype check (it emitted `nothing == nothing`), so arrays and
            # scalars went down the deepExtend path too.
            if functions.ccxtruthy(value) && isa(value, AbstractDict)
                v[Symbol(property)] = deepExtend(get(v, Symbol(property), nothing), value);
            else
                v[Symbol(property)] = value;
            end
            i += 1
        end
        hasKeys = objectKeys(v.has);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(hasKeys)))
            k = get(hasKeys, i + 1, nothing);
            v[Symbol(string("has", capitalize(k)))] = !functions.ccxtruthy(!functions.ccxtruthy(get(v.has, Symbol(k), nothing)));
            i += 1
        end
        if functions.ccxtruthy(v.api)
            v.defineRestApi(v.api, "request");
        end
        v.newUpdates = functions.ccxtruthy((get(v.options, Symbol("newUpdates"), nothing) != nothing)) ? get(v.options, Symbol("newUpdates"), nothing) : true;
        v.afterConstruct();
        if functions.ccxtruthy(@functions.ccxt_or(v.safeBool(userConfig, "sandbox"), v.safeBool(userConfig, "testnet")))
            v.setSandboxMode(true);
        end
        v.loadExchangeSpecificFiles();
        return v
    end
end
function loadExchangeSpecificFiles(self::CcxtExchange, )
    if functions.ccxtruthy(self.id == "mexc")
        try
            protobufMexc = ("../protobuf/mexc/compiled.cjs");
        catch e

        end
    end

end
function uuid5(self::CcxtExchange, namespace, name)
    nsBytes = map(function (byte)
    
        return ccxt_parseInt(byte, 16);
    end
    
    , match(replace(namespace, Regex("-") => ""), Regex(".{1,2}")));
    nameBytes = encode(TextEncoder(), name);
    data = functions.Uint8Array([nsBytes..., nameBytes...]);
    nsHash = sha1(data);
    nsHash[7] = (get(nsHash, 7, nothing) & 15) | 80;
    nsHash[9] = (get(nsHash, 9, nothing) & 63) | 128;
    hex = join(map(function (b)
    
        return lpad(string(b, base=16), 2, "0");
    end
    
    , [functions.ccxt_slice(nsHash, 0, 16)...]), "");
    return join([substring(hex, 0, 8), substring(hex, 8, 12), substring(hex, 12, 16), substring(hex, 16, 20), substring(hex, 20, 32)], "-")

end
function encodeURIComponent(self::CcxtExchange, args...)
    return functions.encodeURIComponent(args...)

end
"""
returns the version of the ccxt library, e.g. "4.5.54", or "unknown" when the version constant is not initialized (e.g. when an exchange module is imported directly, bypassing the ccxt entry point)

# Returns
- the semver version of the ccxt library, or "unknown" when unavailable
"""
function getCcxtVersion(self::CcxtExchange, )
    staticVersion = Exchange.ccxtVersion;
    return functions.ccxtruthy((staticVersion == nothing)) ? "unknown" : staticVersion

end
function throttle(self::CcxtExchange; cost=nothing)
    return functions.throttle(self.throttler, cost)

end
function initThrottler(self::CcxtExchange, )
    self.throttler = Throttler(self.tokenBucket);

end
function defineRestApiEndpoint(self::CcxtExchange, methodName, uppercaseMethod, lowercaseMethod, camelcaseMethod, path, paths; config=Dict())
    splitPath = split(path, Regex("[^a-zA-Z0-9]"));
    camelcaseSuffix = join(map(self.capitalize, splitPath), "");
    underscoreSuffix = join(filter(function (x)
    
        return functions.ccxt_gt(length(x), 0);
    end
    
    , map(function (x)
    
        return lowercase(strip(x));
    end
    
    , splitPath)), "_");
    camelcasePrefix = join(concat([get(paths, 1, nothing)], map(self.capitalize, functions.ccxt_slice(paths, 1))), "");
    underscorePrefix = join(concat([get(paths, 1, nothing)], filter(function (x)
    
        return functions.ccxt_gt(length(x), 0);
    end
    
    , map(function (x)
    
        return strip(x);
    end
    
    , functions.ccxt_slice(paths, 1)))), "_");
    camelcase = string(camelcasePrefix, camelcaseMethod, capitalize(camelcaseSuffix));
    underscore = string(underscorePrefix, "_", lowercaseMethod, "_", underscoreSuffix);
    typeArgument = functions.ccxtruthy((functions.ccxt_gt(length(paths), 1))) ? paths : get(paths, 1, nothing);
    function partial(params=Dict(), context=Dict())
        return getproperty(self, Symbol(methodName))(path, typeArgument, uppercaseMethod, params, nothing, nothing, config, context)
    end;
    self[Symbol(camelcase)] = partial;
    self[Symbol(underscore)] = partial;

end
function defineRestApi(self::CcxtExchange, api, methodName; paths=[])
    keys_var = objectKeys(api);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        value = get(api, Symbol(key), nothing);
        uppercaseMethod = uppercase(key);
        lowercaseMethod = lowercase(key);
        camelcaseMethod = capitalize(lowercaseMethod);
        if functions.ccxtruthy(functions.ccxt_isArray(value))
            k = 0
            while functions.ccxtruthy(functions.ccxt_lt(k, length(value)))
                path = strip(get(value, k + 1, nothing));
                self.defineRestApiEndpoint(methodName, uppercaseMethod, lowercaseMethod, camelcaseMethod, path, paths);
                k += 1
            end

        elseif functions.ccxtruthy(match(Regex("^(?:get|post|put|delete|head|patch)\$", "i"), key))
            endpoints = objectKeys(value);
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(endpoints)))
                endpoint = get(endpoints, j + 1, nothing);
                path = strip(endpoint);
                config = get(value, Symbol(endpoint), nothing);
                if functions.ccxtruthy(isa(config, Dict))
                    self.defineRestApiEndpoint(methodName, uppercaseMethod, lowercaseMethod, camelcaseMethod, path, paths, config = config);
                elseif functions.ccxtruthy(isa(config, Number))
                    self.defineRestApiEndpoint(methodName, uppercaseMethod, lowercaseMethod, camelcaseMethod, path, paths, config = Dict{Symbol, Any}(
    Symbol("cost") => config
));
                else
                    throw(NotSupported(string(self.id, " defineRestApi() API format is not supported, API leafs must strings, objects or numbers")));
                end
                j += 1
            end
        else
            self.defineRestApi(value, methodName, paths = concat(paths, [key]));
        end
        i += 1
    end

end
function log(self::CcxtExchange, args...)
    println(args...);

end
function loadProxyModules(self::CcxtExchange, )
    if functions.ccxtruthy(self.proxiesModulesLoading == nothing)
        self.proxiesModulesLoading = (function ()

    try
        self.httpProxyAgentModule = dynamicImport("http-proxy-agent");
        self.httpsProxyAgentModule = dynamicImport("https-proxy-agent");
    catch e

    end
    if functions.ccxtruthy(self.socksProxyAgentModuleChecked == false)
        try
            self.socksProxyAgentModule = dynamicImport("socks-proxy-agent");
        catch e

        end
        self.socksProxyAgentModuleChecked = true;
    end
end

);
    end
    return self.proxiesModulesLoading

end
function setProxyAgents(self::CcxtExchange, httpProxy, httpsProxy, socksProxy)
    chosenAgent = nothing;
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isNode), (@functions.ccxt_or(@functions.ccxt_or(httpProxy, httpsProxy), socksProxy))))
        throw(NotSupported(string(self.id, " - proxies in browser-side projects are not supported. You have several choices: [A] Use `exchange.proxyUrl` property to redirect requests through local/remote cors-proxy server (find sample file named \"sample-local-proxy-server-with-cors\" in https://github.com/ccxt/ccxt/tree/master/examples/ folder, which can be used for REST requests only) [B] override `exchange.fetch` && `exchange.watch` methods to send requests through your custom proxy")));
    end
    if functions.ccxtruthy(httpProxy)
        if functions.ccxtruthy(self.httpProxyAgentModule == nothing)
            throw(NotSupported(string(self.id, " - to use httpProxy with ccxt, at first you need install module \"npm i http-proxy-agent\" and then initialize proxies with `await instance.loadProxyModules()` method")));
        end
        cachedHttpAgent = get(self.proxyDictionaries, Symbol(httpProxy), nothing);
        if functions.ccxtruthy(@functions.ccxt_or((cachedHttpAgent == nothing), (typeof(get(cachedHttpAgent, Symbol("dispatch"), nothing)) == "function")))
            self.cacheProxyDictionary(httpProxy, get(self.httpProxyAgentModule, Symbol("HttpProxyAgent"), nothing)(httpProxy));
        end
        chosenAgent = get(self.proxyDictionaries, Symbol(httpProxy), nothing);
    elseif functions.ccxtruthy(httpsProxy)
        if functions.ccxtruthy(self.httpsProxyAgentModule == nothing)
            throw(NotSupported(string(self.id, " - to use httpsProxy with ccxt, at first you need install module \"npm i https-proxy-agent\" and then initialize proxies with `await instance.loadProxyModules()` method")));
        end
        cachedHttpsAgent = get(self.proxyDictionaries, Symbol(httpsProxy), nothing);
        if functions.ccxtruthy(@functions.ccxt_or((cachedHttpsAgent == nothing), (typeof(get(cachedHttpsAgent, Symbol("dispatch"), nothing)) == "function")))
            self.cacheProxyDictionary(httpsProxy, get(self.httpsProxyAgentModule, Symbol("HttpsProxyAgent"), nothing)(httpsProxy));
        end
        chosenAgent = get(self.proxyDictionaries, Symbol(httpsProxy), nothing);
        if functions.ccxtruthy(chosenAgent == nothing)
            throw(ExchangeError(string(self.id, " setProxyAgents() missing chosenAgent")));
        end
        chosenAgent.keepAlive = true;
    else
        if functions.ccxtruthy(socksProxy)
            if functions.ccxtruthy(self.socksProxyAgentModule == nothing)
                throw(NotSupported(string(self.id, " - to use SOCKS proxy with ccxt, at first you need install module \"npm i socks-proxy-agent\" and then initialize proxies with `await instance.loadProxyModules()` method")));
            end
            cachedSocksAgent = get(self.proxyDictionaries, Symbol(socksProxy), nothing);
            if functions.ccxtruthy(@functions.ccxt_or((cachedSocksAgent == nothing), (typeof(get(cachedSocksAgent, Symbol("dispatch"), nothing)) == "function")))
                self.cacheProxyDictionary(socksProxy, get(self.socksProxyAgentModule, Symbol("SocksProxyAgent"), nothing)(socksProxy));
            end
            chosenAgent = get(self.proxyDictionaries, Symbol(socksProxy), nothing);
        end

    end
    return chosenAgent

end
function loadHttpProxyAgent(self::CcxtExchange, )
    if functions.ccxtruthy(!functions.ccxtruthy(self.httpAgent))
        httpModule = ("node:http");
        self.httpAgent = get(httpModule, Symbol("Agent"), nothing)();
    end
    return self.httpAgent

end
function getHttpAgentIfNeeded(self::CcxtExchange, url)
    if functions.ccxtruthy(isNode)
        if functions.ccxtruthy(substring(url, 0, 5) == "ws://")
            if functions.ccxtruthy(self.httpAgent == nothing)
                throw(NotSupported(string(self.id, " to use proxy with non-ssl ws:// urls, at first run  `await exchange.loadHttpProxyAgent()` method")));
            end
                return self.httpAgent
        end
    end
    return nothing

end
function addFetchCache(self::CcxtExchange, data)
    if functions.ccxtruthy(functions.ccxt_le(self.fetchHistoryCacheSize, 0))
            return 
    end
    if functions.ccxtruthy(functions.ccxt_ge(length(self.fetchHistoryCache), self.fetchHistoryCacheSize))
                popfirst!(self.fetchHistoryCache);
    end
    push!(self.fetchHistoryCache, data);

end
function getFetchCache(self::CcxtExchange, )
    return self.fetchHistoryCache

end
function isBinaryMessage(self::CcxtExchange, msg)
    # Julia port of `msg instanceof functions.Uint8Array || msg instanceof functions.ArrayBuffer`.
    # Binary payloads are represented as AbstractVector{UInt8}.
    return isa(msg, AbstractVector{UInt8})

end
function stringToBinary(self::CcxtExchange, content)
    return self.encode(content)

end
function binaryToString(self::CcxtExchange, binary)
    return self.decode(binary)

end
function decodeProtoMsg(self::CcxtExchange, data)
    if functions.ccxtruthy(!functions.ccxtruthy(protobufMexc))
        throw(NotSupported(string(self.id, " requires protobuf to decode messages, please install it with `npm install protobufjs`")));
    end
    if functions.ccxtruthy(isa(data, functions.ArrayBuffer))
        data = functions.Uint8Array(data);
    end
    if functions.ccxtruthy(isa(data, functions.Uint8Array))
        decoded = decode(get(get(protobufMexc, Symbol("default"), nothing), Symbol("PushDataV3ApiWrapper"), nothing), data);
        dict = toJSON(decoded);
            return dict
    end
    return data

end
"""
resolves the fetch implementation once per instance - the platform-native fetch is used everywhere (undici in node, native fetch in bun / browsers / deno), a user-supplied this.fetchImplementation always takes precedence

# Returns
- a promise that resolves when the fetch client is ready
"""
function loadFetchImplementation(self::CcxtExchange, )
    if functions.ccxtruthy(self.fetchImplementationLoading == nothing)
        self.fetchImplementationLoading = (function ()

    if functions.ccxtruthy(self.fetchImplementation != nothing)
        if functions.ccxtruthy(self.AbortError == nothing)
            self.AbortError = DOMException;
        end
        if functions.ccxtruthy(self.FetchError == nothing)
            self.FetchError = TypeError;
        end
            return 
    end
    self.AbortError = DOMException;
    self.FetchError = TypeError;
    if functions.ccxtruthy(@functions.ccxt_or(!functions.ccxtruthy(isNode), isBun))
        if functions.ccxtruthy(selfIsDefined())
            self.fetchImplementation = get(self, Symbol("fetch"), nothing);
        elseif functions.ccxtruthy(typeof(fetch) == "function")
            self.fetchImplementation = fetch;
        else
            throw(NotSupported(string(self.id, " the built-in \"fetch\" function is not available in this environment, please use a modern browser, bun, or node.js 18+")));
        end
        self.fetchIsNative = true;
            return 
    end
    try
        undiciModule = ("undici");
        self.undiciModule = undiciModule;
        self.fetchImplementation = get(undiciModule, Symbol("fetch"), nothing);
        self.fetchDispatcher = get(undiciModule, Symbol("Agent"), nothing)(self.getDispatcherOptions(isPlainAgent = true));
        self.zlibModule = ("node:zlib");
        httpModule = ("node:http");
        self.httpStatusTexts = get(httpModule, Symbol("STATUS_CODES"), nothing);
        self.fetchIsNative = true;
        return
    catch e

    end
    if functions.ccxtruthy(typeof(fetch) == "function")
        self.fetchImplementation = fetch;
        self.fetchIsNative = true;
    else
        throw(NotSupported(string(self.id, " the built-in \"fetch\" function is not available in this environment, please use node.js 18+, bun, or a modern browser")));
    end
end

);
    end
    return self.fetchImplementationLoading

end
"""
builds keep-alive-tuned undici dispatcher options - every in-flight request gets its own socket (no pipelining, no h2 multiplexing), idle sockets are kept alive for reuse because exchanges are polled on the same origins repeatedly - dual-stack is explicit: autoSelectFamily enables the happy eyeballs (rfc 8305) address-family racing so ipv6 and ipv4 are both attempted (off by default on node 18), without forcing either family

# Arguments
- `isPlainAgent`::bool, optional: true for undici.Agent options ('connect' tls shape), false for undici.ProxyAgent options ('requestTls' shape)

# Returns
- undici dispatcher options
"""
function getDispatcherOptions(self::CcxtExchange; isPlainAgent=false)
    options = Dict{Symbol, Any}(
        Symbol("keepAliveTimeout") => 60 * 1000,
        Symbol("keepAliveMaxTimeout") => 10 * 60 * 1000,
        Symbol("connections") => 256,
        Symbol("pipelining") => 1,
        Symbol("allowH2") => false,
        Symbol("autoSelectFamily") => true,
        Symbol("autoSelectFamilyAttemptTimeout") => 10
    );
    if functions.ccxtruthy(!functions.ccxtruthy(self.shouldValidateServerSsl()))
        tlsOptions = Dict{Symbol, Any}(
            Symbol("rejectUnauthorized") => false
        );
        if functions.ccxtruthy(isPlainAgent)
            options[Symbol("connect")] = tlsOptions;
        else
            options[Symbol("requestTls")] = tlsOptions;
        end
    end
    return options

end
"""
whether server certificates should be validated, honoring both this.validateServerSsl and legacy agents constructed with rejectUnauthorized false

# Returns
- true when server ssl certificates must be validated
"""
function shouldValidateServerSsl(self::CcxtExchange, )
    if functions.ccxtruthy(!functions.ccxtruthy(self.validateServerSsl))
            return false
    end
    legacyAgents = [self.agent, self.httpsAgent];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(legacyAgents)))
        legacyAgent = get(legacyAgents, i + 1, nothing);
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(legacyAgent, get(legacyAgent, Symbol("options"), nothing)), (get(get(legacyAgent, Symbol("options"), nothing), Symbol("rejectUnauthorized"), nothing) == false)))
                return false
        end
        i += 1
    end
    return true

end
"""
backwards compatibility helper - http-proxy-agent, https-proxy-agent and socks-proxy-agent instances all carry their target on a `proxy` property (URL object or string), extract it so it can be passed to the native fetch

# Arguments
- `agent`::object, optional: a legacy proxy-carrying agent object

# Returns
- the proxy url, or undefined when the agent does not carry one
"""
function extractProxyFromAgent(self::CcxtExchange, agent)
    if functions.ccxtruthy(@functions.ccxt_and(agent != nothing, agent != nothing))
        proxy = get(agent, Symbol("proxy"), nothing);
        if functions.ccxtruthy(@functions.ccxt_and(proxy != nothing, proxy != nothing))
            if functions.ccxtruthy(isa(proxy, AbstractString))
                    return proxy
            end
            if functions.ccxtruthy(get(proxy, Symbol("href"), nothing) != nothing)
                    return get(proxy, Symbol("href"), nothing)
            end
        end
    end
    return nothing

end
"""
stores a per-proxy-url transport handle (undici dispatcher or legacy node-style agent) in this.proxyDictionaries, evicting the oldest entry beyond proxyDictionariesMaxSize so rotating-proxy setups cannot grow the cache without bound - evicted or replaced undici dispatchers are closed gracefully (in-flight requests finish first), legacy agents are just dropped because live ws connections may still hold them

# Arguments
- `proxyUrl`::string: the proxy url the handle serves
- `value`::any: an undici dispatcher or a node-style agent

# Returns
- the cached value
"""
function cacheProxyDictionary(self::CcxtExchange, proxyUrl, value)
    existing = get(self.proxyDictionaries, Symbol(proxyUrl), nothing);
    if functions.ccxtruthy(existing != nothing)
        self.releaseProxyDictionaryEntry(existing);
    else
        cachedProxyUrls = objectKeys(self.proxyDictionaries);
        if functions.ccxtruthy(functions.ccxt_ge(length(cachedProxyUrls), self.proxyDictionariesMaxSize))
            oldestProxyUrl = get(cachedProxyUrls, 1, nothing);
            oldestEntry = get(self.proxyDictionaries, Symbol(oldestProxyUrl), nothing);
                        delete!(self.proxyDictionaries, Symbol(oldestProxyUrl));
            self.releaseProxyDictionaryEntry(oldestEntry);
        end
    end
    self.proxyDictionaries[Symbol(proxyUrl)] = value;
    return value

end
"""
closes an undici dispatcher that left this.proxyDictionaries - close () drains in-flight requests before releasing sockets, and any close failure is irrelevant because the dispatcher is already unreferenced; legacy node-style agents are left untouched (never destroyed, matching the long-standing behavior, because live ws connections may still use them)

# Arguments
- `entry`::any: the evicted or replaced proxyDictionaries value
"""
function releaseProxyDictionaryEntry(self::CcxtExchange, entry)
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and((entry != nothing), (entry != nothing)), (typeof(get(entry, Symbol("dispatch"), nothing)) == "function")), (typeof(get(entry, Symbol("close"), nothing)) == "function")))
        catch_var(close(entry), function ()

end);
    end

end
"""
returns a cached undici ProxyAgent dispatcher for the given proxy url - undici handles http, https, socks5 and socks schemes natively; dispatchers share this.proxyDictionaries with the legacy node-style agents (entries are distinguished by the 'dispatch' method) and the cache is FIFO-capped at proxyDictionariesMaxSize entries so rotating-proxy setups cannot grow it without bound

# Arguments
- `proxyUrl`::string: the proxy url, e.g. http://user:pass@host:port or socks5://host:port

# Returns
- an undici dispatcher
"""
function getFetchProxyDispatcher(self::CcxtExchange, proxyUrl)
    cached = get(self.proxyDictionaries, Symbol(proxyUrl), nothing);
    if functions.ccxtruthy(@functions.ccxt_and((cached != nothing), (typeof(get(cached, Symbol("dispatch"), nothing)) == "function")))
            return cached
    end
    lowercaseProxyUrl = lowercase(proxyUrl);
    if functions.ccxtruthy(@functions.ccxt_or((findfirst("socks4:", lowercaseProxyUrl) !== nothing), (findfirst("socks4a:", lowercaseProxyUrl) !== nothing)))
        throw(NotSupported(string(self.id, " - socks4 proxies are not supported by the built-in fetch, please use a socks5:// proxy")));
    end
    options = self.getDispatcherOptions(isPlainAgent = false);
    options[Symbol("uri")] = proxyUrl;
    return self.cacheProxyDictionary(proxyUrl, get(self.undiciModule, Symbol("ProxyAgent"), nothing)(options))

end
"""
dispatches through the low-level undici.request api and adapts the result to the minimal fetch-Response surface that handleRestResponse consumes - profiled ~2x faster end-to-end than undici.fetch (node streams instead of the WHATWG Response/Headers/web-streams machinery)

# Arguments
- `url`::string: the request url
- `params`::object: fetch-style request params ('method', 'headers', 'body', 'signal', 'dispatcher')

# Returns
- an object with 'status', 'statusText', 'headers' (plain object), 'text' and 'arrayBuffer' methods
"""
function undiciRequest(self::CcxtExchange, url, params)
    headers = get(params, Symbol("headers"), nothing);
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy((ccxt_in("Accept-Encoding", headers))), !functions.ccxtruthy((ccxt_in("accept-encoding", headers)))))
        headers[Symbol("Accept-Encoding")] = "gzip, deflate, br";
    end
    res = request(self.undiciModule, url, api = Dict{Symbol, Any}(
        Symbol("method") => get(params, Symbol("method"), nothing),
        Symbol("headers") => headers,
        Symbol("body") => get(params, Symbol("body"), nothing),
        Symbol("signal") => get(params, Symbol("signal"), nothing),
        Symbol("dispatcher") => get(params, Symbol("dispatcher"), nothing)
    ));
    statusCode = get(res, Symbol("statusCode"), nothing);
    location = get(get(res, Symbol("headers"), nothing), Symbol("location"), nothing);
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((functions.ccxt_ge(statusCode, 300)), (functions.ccxt_lt(statusCode, 400))), (location != nothing)))
        try
            dump(get(res, Symbol("body"), nothing));
        catch e

        end
        throw(NetworkError(string(self.id, " ", get(params, Symbol("method"), nothing), " ", url, " redirect to ", location, " was not followed (HTTP ", statusCode, ", following redirects is disabled)")));
    end
    return Dict{Symbol, Any}(
    Symbol("status") => get(res, Symbol("statusCode"), nothing),
    Symbol("statusText") => @functions.ccxt_or(get(self.httpStatusTexts, Symbol(get(res, Symbol("statusCode"), nothing)), nothing), ""),
    Symbol("headers") => get(res, Symbol("headers"), nothing),
    Symbol("text") => function ()

    return self.undiciBody(res, binary = false);
end,
    Symbol("arrayBuffer") => function ()

    return self.undiciBody(res, binary = true);
end
)

end
"""
reads an undici.request response body, transparently decompressing gzip/br/deflate content-encodings via node:zlib (undici.request performs no decompression, unlike fetch)

# Arguments
- `res`::object: an undici.request response
- `binary`::bool, optional: true to return a Buffer, false to return a utf8 string

# Returns
- the response body
"""
function undiciBody(self::CcxtExchange, res; binary=false)
    contentEncoding = get(get(res, Symbol("headers"), nothing), Symbol("content-encoding"), nothing);
    if functions.ccxtruthy(@functions.ccxt_or((get(res, Symbol("statusCode"), nothing) == 204), (get(res, Symbol("statusCode"), nothing) == 304)))
        contentEncoding = nothing;
    end
    decompressor = nothing;
    if functions.ccxtruthy(@functions.ccxt_or((contentEncoding == "gzip"), (contentEncoding == "x-gzip")))
        decompressor = createGunzip(self.zlibModule);
    elseif functions.ccxtruthy(contentEncoding == "br")
        decompressor = createBrotliDecompress(self.zlibModule);
    else
        if functions.ccxtruthy(contentEncoding == "deflate")
            decompressor = createInflate(self.zlibModule);
        end

    end
    if functions.ccxtruthy(decompressor == nothing)
            return functions.ccxtruthy(binary) ? arrayBuffer(get(res, Symbol("body"), nothing)) : text(get(res, Symbol("body"), nothing))
    end
    chunks = [];
    pipe(get(res, Symbol("body"), nothing), decompressor);
    for chunk in decompressor
        push!(chunks, chunk);
    end
    buffer = concat(Buffer, chunks);
    return functions.ccxtruthy(binary) ? buffer : string(buffer, base="utf8")

end
"""
attaches per-platform proxy transport options to the native fetch request params - undici dispatcher on node, the built-in `proxy` option on bun; the shared keep-alive dispatcher is attached when no proxy applies

# Arguments
- `params`::object: the fetch RequestInit params, mutated in place
- `httpProxy`::string, optional: unified httpProxy setting
- `httpsProxy`::string, optional: unified httpsProxy setting
- `socksProxy`::string, optional: unified socksProxy setting
"""
function setFetchProxyOptions(self::CcxtExchange, params, httpProxy, httpsProxy, socksProxy)
    selectedProxy = @functions.ccxt_or(@functions.ccxt_or(httpProxy, httpsProxy), socksProxy);
    if functions.ccxtruthy(!functions.ccxtruthy(selectedProxy))
        selectedProxy = @functions.ccxt_or(@functions.ccxt_or(self.extractProxyFromAgent(self.agent), self.extractProxyFromAgent(self.httpsAgent)), self.extractProxyFromAgent(self.httpAgent));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(selectedProxy))
        if functions.ccxtruthy(self.fetchDispatcher != nothing)
            params[Symbol("dispatcher")] = self.fetchDispatcher;
        end
            return 
    end
    if functions.ccxtruthy(!functions.ccxtruthy(isNode))
        throw(NotSupported(string(self.id, " - proxies in browser-side projects are not supported. You have several choices: [A] Use `exchange.proxyUrl` property to redirect requests through local/remote cors-proxy server (find sample file named \"sample-local-proxy-server-with-cors\" in https://github.com/ccxt/ccxt/tree/master/examples/ folder, which can be used for REST requests only) [B] override `exchange.fetch` && `exchange.watch` methods to send requests through your custom proxy")));
    end
    if functions.ccxtruthy(isBun)
        params[Symbol("proxy")] = selectedProxy;
            return 
    end
    if functions.ccxtruthy(self.undiciModule == nothing)
        throw(NotSupported(string(self.id, " - proxy support with the built-in fetch requires the undici module, please install it with \"npm i undici\"")));
    end
    params[Symbol("dispatcher")] = self.getFetchProxyDispatcher(selectedProxy);

end
function fetch(self::CcxtExchange, url; method="GET", headers=nothing, body=nothing)
    headers = extend(self.headers, headers);
    proxyUrl = self.checkProxyUrlSettings(url = url, method = method, headers = headers, body = body);
    if functions.ccxtruthy(proxyUrl != nothing)
        if functions.ccxtruthy(isNode)
            headers = extend(Dict{Symbol, Any}(
    Symbol("Origin") => self.origin
), headers);
        end
        url = string(proxyUrl, self.urlEncoderForProxyUrl(url));
    end
    (httpProxy, httpsProxy, socksProxy) = self.checkProxySettings(url = url, method = method, headers = headers, body = body);
    self.checkConflictingProxies(@functions.ccxt_or(@functions.ccxt_or(httpProxy, httpsProxy), socksProxy), proxyUrl);
    if functions.ccxtruthy(isNode)
        self.loadProxyModules();
    end
    userAgent = functions.ccxtruthy((self.userAgent != nothing)) ? self.userAgent : self.user_agent;
    if functions.ccxtruthy(@functions.ccxt_and((userAgent == nothing), isNode))
        userAgent = get(self.userAgents, Symbol("chrome"), nothing);
    end
    if functions.ccxtruthy(@functions.ccxt_and(userAgent, isNode))
        if functions.ccxtruthy(isa(userAgent, AbstractString))
            headers = extend(Dict{Symbol, Any}(
    Symbol("User-Agent") => userAgent
), headers);
        elseif functions.ccxtruthy(@functions.ccxt_and(self.isDictionary(userAgent), (ccxt_in("User-Agent", userAgent))))
            headers = extend(userAgent, headers);
        end
    end
    headers = self.setHeaders(headers);
    headersKeys = objectKeys(headers);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(headersKeys)))
        key = get(headersKeys, i + 1, nothing);
        if functions.ccxtruthy(lowercase(key) == "content-type")
            value = get(headers, Symbol(key), nothing);
            if functions.ccxtruthy(value == "multipart/form-data")
                bodyKeys = objectKeys(body);
                boundary = string("--------------------------", self.randomBytes(12));
                eol = "\r\n";
                newBody = "";
                j = 0
                while functions.ccxtruthy(functions.ccxt_lt(j, length(bodyKeys)))
                    bodyKey = get(bodyKeys, j + 1, nothing);
                    newBody += string("--", boundary, eol, "Content-Disposition: form-data; name=\"", bodyKey, "\"", eol, eol, get(body, Symbol(bodyKey), nothing), eol);
                    j += 1
                end

                newBody += string("--", boundary, "--", eol);
                value += string("; boundary=", boundary);
                headers[Symbol(key)] = value;
                body = newBody;
                break
            end
        end
        i += 1
    end
    if functions.ccxtruthy(self.verbose)
        self.log("fetch Request:\n", self.id, method, url, "\nRequestHeaders:\n", headers, "\nRequestBody:\n", body, "\n");
    end
    if functions.ccxtruthy(@functions.ccxt_or(self.fetchImplementationLoading == nothing, self.fetchImplementation == nothing))
        self.loadFetchImplementation();
    end
    fetchImplementation = self.fetchImplementation;
    params = Dict{Symbol, Any}(
        Symbol("method") => method,
        Symbol("headers") => headers,
        Symbol("body") => body
    );
    if functions.ccxtruthy(self.fetchIsNative)
        params[Symbol("redirect")] = "error";
        self.setFetchProxyOptions(params, httpProxy, httpsProxy, socksProxy);
    else
        params[Symbol("timeout")] = self.timeout;
        chosenAgent = self.setProxyAgents(httpProxy, httpsProxy, socksProxy);
        legacyAgent = @functions.ccxt_or(@functions.ccxt_or(chosenAgent, self.agent), self.httpsAgent);
        if functions.ccxtruthy(legacyAgent)
            params[Symbol("agent")] = legacyAgent;
        end
    end
    controller = AbortController();
    params[Symbol("signal")] = get(controller, Symbol("signal"), nothing);
    timeout = setTimeout(function ()
    
        abort(controller);
    end, self.timeout);
    response = nothing;
    try
        if functions.ccxtruthy(@functions.ccxt_and(self.fetchIsNative, (self.undiciModule != nothing)))
            response = self.undiciRequest(url, params);
        else
            response = fetchImplementation(url, params);
        end
    catch e
        if functions.ccxtruthy(@functions.ccxt_or((isa(e, self.AbortError)), (@functions.ccxt_and((e != nothing), (@functions.ccxt_or((get(e, Symbol("name"), nothing) == "AbortError"), (get(e, Symbol("name"), nothing) == "TimeoutError")))))))
            throw(RequestTimeout(string(self.id, " ", method, " ", url, " request timed out (", self.timeout, " ms)")));
        end
        causeMessage = functions.ccxtruthy((@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and((e != nothing), (get(e, Symbol("cause"), nothing) != nothing)), (get(e, Symbol("cause"), nothing) != nothing)), (get(get(e, Symbol("cause"), nothing), Symbol("message"), nothing) != nothing)))) ? (string(": ", get(get(e, Symbol("cause"), nothing), Symbol("message"), nothing))) : "";
        if functions.ccxtruthy(@functions.ccxt_or((isa(e, self.FetchError)), (isa(e, TypeError))))
            throw(NetworkError(string(self.id, " ", method, " ", url, " fetch failed", causeMessage)));
        end
        networkErrorCodes = ["ConnectionRefused", "ConnectionClosed", "ConnectionReset", "DNSError", "FailedToOpenSocket", "ECONNREFUSED", "ECONNRESET", "ENOTFOUND", "ETIMEDOUT", "EPIPE", "EAI_AGAIN", "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_SOCKET", "UND_ERR_HEADERS_TIMEOUT", "UND_ERR_BODY_TIMEOUT"];
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((e != nothing), (isa(get(e, Symbol("code"), nothing), AbstractString))), (findfirst(get(e, Symbol("code"), nothing), networkErrorCodes) !== nothing)))
            throw(NetworkError(string(self.id, " ", method, " ", url, " fetch failed: ", get(e, Symbol("message"), nothing))));
        end
        throw(e);
    finally
        clearTimeout(timeout);

    end
    return self.handleRestResponse(response, url, method = method, requestHeaders = headers, requestBody = body)

end
function jsonStringifyWithNull(self::CcxtExchange, obj)
    # TS: `JSON.stringify (obj, (_, v) => (v === undefined ? null : v))`.
    # The backend emits `JSON3.json` (which does not exist) plus a replacer
    # closure (which JSON3 does not accept); `jsonStringifyCanonical` is the
    # Julia equivalent, and sorts keys so the encoding is order-independent.
    return functions.jsonStringifyCanonical(obj)
end
function hasUnsafeInteger(self::CcxtExchange, value)
    if functions.ccxtruthy(isa(value, Number))
            return @functions.ccxt_or((functions.ccxt_gt(value, typemax(Int))), (functions.ccxt_lt(value, -typemax(Int))))
    end
    if functions.ccxtruthy(@functions.ccxt_and(value != nothing, isa(value, Dict)))
        if functions.ccxtruthy(functions.ccxt_isArray(value))
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(value)))
                if functions.ccxtruthy(self.hasUnsafeInteger(get(value, i + 1, nothing)))
                        return true
                end
                i += 1
            end

        else
            for key in functions.ccxt_forin(value)
                if functions.ccxtruthy(self.hasUnsafeInteger(get(value, Symbol(key), nothing)))
                        return true
                end
            end
        end
    end
    return false

end
function parseJson(self::CcxtExchange, jsonString)
    try
        if functions.ccxtruthy(self.isJsonEncodedObject(jsonString))
            if functions.ccxtruthy(!functions.ccxtruthy(self.quoteJsonNumbers))
                    return functions.ccxt_json_parse(jsonString)
            end
            parsed = functions.ccxt_json_parse(jsonString);
            if functions.ccxtruthy(self.hasUnsafeInteger(parsed))
                    return functions.ccxt_json_parse(self.onJsonResponse(jsonString))
            end
                return parsed
        end
    catch e
        return nothing

    end

end
function getResponseHeaders(self::CcxtExchange, response)
    result = Dict{Symbol, Any}();
    headers = get(response, Symbol("headers"), nothing);
    if functions.ccxtruthy(typeof(get(headers, Symbol("forEach"), nothing)) == "function")
        forEach(headers, function (value, key)

    key = join(map(function (word)

    return capitalize(word);
end

, split(key, "-")), "-");
    result[Symbol(key)] = value;
end);
            return result
    end
    keys_var = objectKeys(headers);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        value = get(headers, Symbol(key), nothing);
        if functions.ccxtruthy(functions.ccxt_isArray(value))
            value = join(value, ", ");
        end
        capitalizedKey = join(map(function (word)
        
            return capitalize(word);
        end
        
        , split(key, "-")), "-");
        result[Symbol(capitalizedKey)] = value;
        i += 1
    end
    return result

end
function handleRestResponse(self::CcxtExchange, response, url; method="GET", requestHeaders=nothing, requestBody=nothing)
    responseHeaders = self.getResponseHeaders(response);
    if functions.ccxtruthy(@functions.ccxt_and(self.handleContentTypeApplicationZip, (get(responseHeaders, Symbol("Content-Type"), nothing) == "application/zip")))
        responseBuffer = functions.ccxt_then_sync(arrayBuffer(response), function (arrayBuffer)
        
            return (functions.ccxtruthy((Buffer !== nothing)) ? from(arrayBuffer) : functions.Uint8Array(arrayBuffer));
        end
        
        , nothing);
        if functions.ccxtruthy(self.enableLastResponseHeaders)
            self.last_response_headers = responseHeaders;
        end
        if functions.ccxtruthy(self.enableLastHttpResponse)
            self.last_http_response = responseBuffer;
        end
        if functions.ccxtruthy(self.verbose)
            self.log("handleRestResponse:\n", self.id, method, url, get(response, Symbol("status"), nothing), get(response, Symbol("statusText"), nothing), "\nResponseHeaders:\n", responseHeaders, "ZIP redacted", "\n");
        end
            return responseBuffer
    end
    return functions.ccxt_then_sync(text(response), function (responseBody)

    bodyText = self.onRestResponse(get(response, Symbol("status"), nothing), get(response, Symbol("statusText"), nothing), url, method, responseHeaders, responseBody, requestHeaders, requestBody);
    parsedBody = self.parseJson(bodyText);
    if functions.ccxtruthy(self.enableLastResponseHeaders)
        self.last_response_headers = responseHeaders;
    end
    if functions.ccxtruthy(self.enableLastHttpResponse)
        self.last_http_response = responseBody;
    end
    if functions.ccxtruthy(self.enableLastJsonResponse)
        self.last_json_response = parsedBody;
    end
    if functions.ccxtruthy(self.verbose)
        self.log("handleRestResponse:\n", self.id, method, url, get(response, Symbol("status"), nothing), get(response, Symbol("statusText"), nothing), "\nResponseHeaders:\n", responseHeaders, "\nResponseBody:\n", responseBody, "\n");
    end
    skipFurtherErrorHandling = self.handleErrors(get(response, Symbol("status"), nothing), get(response, Symbol("statusText"), nothing), url, method, responseHeaders, responseBody, parsedBody, requestHeaders, requestBody);
    if functions.ccxtruthy(!functions.ccxtruthy(skipFurtherErrorHandling))
        self.handleHttpStatusCode(get(response, Symbol("status"), nothing), get(response, Symbol("statusText"), nothing), url, method, responseBody);
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(parsedBody, !functions.ccxtruthy(functions.ccxt_isArray(parsedBody))), self.returnResponseHeaders))
        parsedBody[Symbol("responseHeaders")] = responseHeaders;
    end
    return @functions.ccxt_or(parsedBody, responseBody)
end

, nothing)

end
function onRestResponse(self::CcxtExchange, statusCode, statusText, url, method, responseHeaders, responseBody, requestHeaders, requestBody)
    return strip(responseBody)

end
function onJsonResponse(self::CcxtExchange, responseBody)
    return replace(responseBody, QUOTE_JSON_NUMBERS_REGEX => "\":\"\\\1\"")

end
function loadMarketsHelper(self::CcxtExchange; reload=false, params=Dict())
    if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(reload), self.markets))
        if functions.ccxtruthy(!functions.ccxtruthy(self.markets_by_id))
                return self.setMarkets(self.markets)
        end
            return self.markets
    end
    currencies = nothing;
    if functions.ccxtruthy(get(self.has, Symbol("fetchCurrencies"), nothing))
        currencies = self.fetchCurrencies();
        self.options[Symbol("cachedCurrencies")] = currencies;
    end
    markets = self.fetchMarkets(params = params);
    if functions.ccxtruthy(ccxt_in("cachedCurrencies", self.options))
                delete!(self.options, :cachedCurrencies);
    end
    return self.setMarkets(markets, currencies = currencies)

end
"""
Loads and prepares the markets for trading. It ensures that the markets are only loaded once, even if the method is called multiple times. If the markets are already loaded and not reloading, the method returns the existing markets. If the markets are being reloaded, the method waits for the reload to complete before returning the markets. If an error occurs during the loading or preparation of the markets, the promise is rejected with the error.

# Arguments
- `reload`::bool: - If true, the markets will be reloaded from the exchange.
- `params`::object: - Additional exchange-specific parameters for the request.

# Returns
- A promise that resolves to a dictionary of markets.
"""
function loadMarkets(self::CcxtExchange; reload=false, params=Dict())
    if functions.ccxtruthy(@functions.ccxt_or((@functions.ccxt_and(reload, !functions.ccxtruthy(self.reloadingMarkets))), !functions.ccxtruthy(self.marketsLoading)))
        self.reloadingMarkets = true;
        self.marketsLoading = functions.ccxt_then_sync(self.loadMarketsHelper(reload = reload, params = params), function (resolved)

    self.reloadingMarkets = false;
    return resolved
end

, function (error)

    self.reloadingMarkets = false;
    throw(error);
end

);
    end
    return self.marketsLoading

end
function fetchCurrencies(self::CcxtExchange; params=Dict())
    return begin
    resolve = identity
    reject = identity
    resolve(self.currencies);

end

end
function fetchCurrenciesWs(self::CcxtExchange; params=Dict())
    return begin
    resolve = identity
    reject = identity
    resolve(self.currencies);

end

end
function fetchMarkets(self::CcxtExchange; params=Dict())
    return begin
    resolve = identity
    reject = identity
    markets = self.markets;
    if functions.ccxtruthy(markets == nothing)
        resolve([]);
            return 
    end
    resolve(objectValues(markets));

end

end
function fetchMarketsWs(self::CcxtExchange; params=Dict())
    return begin
    resolve = identity
    reject = identity
    markets = self.markets;
    if functions.ccxtruthy(markets == nothing)
        resolve([]);
            return 
    end
    resolve(objectValues(markets));

end

end
function checkRequiredDependencies(self::CcxtExchange, )

end
function parseNumber(self::CcxtExchange, value; d=nothing)
    if functions.ccxtruthy(value == nothing)
            return d
    else
        try
            numberNormalized = numberToString(value);
            if functions.ccxtruthy(numberNormalized == nothing)
                    return d
            end
            if functions.ccxtruthy(findfirst("e-", numberNormalized) !== nothing)
                    return self.number(numberToString(ccxt_toNumber(numberNormalized)))
            end
            result = self.number(numberNormalized);
            return (functions.ccxtruthy(isnan(result)) ? d : result)
        catch e
            return d

        end
    end

end
function checkOrderArguments(self::CcxtExchange, market, type_var, side, amount, price, params)
    if functions.ccxtruthy(price == nothing)
        if functions.ccxtruthy(type_var == "limit")
            throw(ArgumentsRequired(string(self.id, " createOrder() requires a price argument for a limit order")));
        end
    end
    if functions.ccxtruthy(functions.ccxt_le(amount, 0))
        throw(ArgumentsRequired(string(self.id, " createOrder() amount should be above 0")));
    end

end
function handleHttpStatusCode(self::CcxtExchange, code, reason, url, method, body)
    codeAsString = string(code);
    if functions.ccxtruthy(ccxt_in(codeAsString, self.httpExceptions))
        ErrorClass = get(self.httpExceptions, Symbol(codeAsString), nothing);
        throw(ErrorClass(string(self.id, " ", method, " ", url, " ", codeAsString, " ", reason, " ", body)));
    end

end
function remove0xPrefix(self::CcxtExchange, hexData)
    if functions.ccxtruthy(functions.ccxt_slice(hexData, 0, 2) == "0x")
            return functions.ccxt_slice(hexData, 2)
    else
        return hexData
    end

end
function mapToSafeMap(self::CcxtExchange, dict)
    return dict

end
function safeMapToMap(self::CcxtExchange, dict)
    return dict

end
function spawn(self::CcxtExchange, method, args...)
    future = Future();
    catch_var(future, function ()

end);
    setTimeout(function ()

    catch_var(functions.ccxt_then_sync(method(self, args...), get(future, Symbol("resolve"), nothing), nothing), get(future, Symbol("reject"), nothing));
end, 0);
    return future

end
function delay(self::CcxtExchange, timeout, method, args...)
    setTimeout(function ()

    self.spawn(method, args...);
end, timeout);

end
function orderBook(self::CcxtExchange; snapshot=Dict(), depth=typemax(Int))
    return WsOrderBook(snapshot, depth)

end
function indexedOrderBook(self::CcxtExchange; snapshot=Dict(), depth=typemax(Int))
    return IndexedOrderBook(snapshot, depth)

end
function countedOrderBook(self::CcxtExchange; snapshot=Dict(), depth=typemax(Int))
    return CountedOrderBook(snapshot, depth)

end
function handleMessage(self::CcxtExchange, client, message)

end
function ping(self::CcxtExchange, client)
    return nothing

end
function client(self::CcxtExchange, url)
    if functions.ccxtruthy(url == nothing)
        throw(ArgumentsRequired(string(self.id, " client() requires a url argument")));
    end
    self.clients = @functions.ccxt_or(self.clients, Dict{Symbol, Any}());
    if functions.ccxtruthy(!functions.ccxtruthy(get(self.clients, Symbol(url), nothing)))
        onMessage = bind(self.handleMessage, self);
        onError = bind(self.onError, self);
        onClose = bind(self.onClose, self);
        onConnected = bind(self.onConnected, self);
        wsOptions = safeValue(self.options, "ws", Dict{Symbol, Any}());
        (httpProxy, httpsProxy, socksProxy) = self.checkWsProxySettings();
        chosenAgent = self.setProxyAgents(httpProxy, httpsProxy, socksProxy);
        httpProxyAgent = self.getHttpAgentIfNeeded(url);
        finalAgent = functions.ccxtruthy(chosenAgent) ? chosenAgent : (functions.ccxtruthy(httpProxyAgent) ? httpProxyAgent : self.agent);
        options = deepExtend(self.streaming, Dict{Symbol, Any}(
            Symbol("log") => functions.ccxtruthy(self.log) ? bind(self.log, self) : self.log,
            Symbol("ping") => functions.ccxtruthy(get(self, Symbol("ping"), nothing)) ? bind(get(self, Symbol("ping"), nothing), self) : get(self, Symbol("ping"), nothing),
            Symbol("verbose") => self.verbose,
            Symbol("throttler") => Throttler(self.tokenBucket),
            Symbol("options") => Dict{Symbol, Any}(
                Symbol("agent") => finalAgent
            ),
            Symbol("decompressBinary") => self.safeBool(self.options, "decompressBinary", defaultValue = true)
        ), wsOptions);
        self.clients[Symbol(url)] = WsClient(url, onMessage, onError, onClose, onConnected, options);
    end
    return get(self.clients, Symbol(url), nothing)

end
function calculateWsBackoffDelay(self::CcxtExchange, url)
    wsOptions = self.safeDict(self.options, "ws", defaultValue = Dict{Symbol, Any}());
    backoff = self.safeDict(wsOptions, "backoff", defaultValue = Dict{Symbol, Any}());
    base = safeInteger(backoff, "base", 1000);
    factor = safeInteger(backoff, "factor", 2);
    maxDelay = safeInteger(backoff, "max", 60000);
    stableAfter = safeInteger(backoff, "stableAfter", 30000);
    state = self.safeDict(wsOptions, "backoffState");
    if functions.ccxtruthy(state == nothing)
        state = Dict{Symbol, Any}();
    end
    nowMillis = milliseconds();
    urlState = self.safeDict(state, url, defaultValue = Dict{Symbol, Any}());
    lastAttempt = safeInteger(urlState, "lastAttempt", 0);
    attempts = safeInteger(urlState, "attempts", 0);
    if functions.ccxtruthy(@functions.ccxt_and((functions.ccxt_gt(lastAttempt, 0)), (functions.ccxt_gt((nowMillis - lastAttempt), stableAfter))))
        attempts = 0;
    end
    urlState[Symbol("attempts")] = attempts + 1;
    urlState[Symbol("lastAttempt")] = nowMillis;
    state[Symbol(url)] = urlState;
    wsOptions[Symbol("backoffState")] = state;
    self.options[Symbol("ws")] = wsOptions;
    if functions.ccxtruthy(attempts == 0)
            return 0
    end
    delay = base;
    capped = min(attempts, 20);
    i = 1
    while functions.ccxtruthy(functions.ccxt_lt(i, capped))
        delay = delay * factor;
        i += 1
    end
    jitterMillis = nowMillis % 1000;
    jittered = self.parseToInt(delay * (0.8 + (jitterMillis / 2500)));
    return min(jittered, maxDelay)

end
function watchMultiple(self::CcxtExchange, url, messageHashes; message=nothing, subscribeHashes=nothing, subscription=nothing)
    if functions.ccxtruthy(url == nothing)
        throw(ArgumentsRequired(string(self.id, " watchMultiple() requires a url argument")));
    end
    clientExisted = (ccxt_in(url, self.clients));
    client = self.client(url);
    future = race(map(function (messageHash)
    
        return future(client, messageHash);
    end
    
    , messageHashes));
    missingSubscriptions = [];
    if functions.ccxtruthy(subscribeHashes != nothing)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(subscribeHashes)))
            subscribeHash = get(subscribeHashes, i + 1, nothing);
            if functions.ccxtruthy(!functions.ccxtruthy(get(get(client, Symbol("subscriptions"), nothing), Symbol(subscribeHash), nothing)))
                                push!(missingSubscriptions, subscribeHash);
                client.subscriptions[Symbol(subscribeHash)] = @functions.ccxt_or(subscription, true);
            end
            i += 1
        end

    end
    backoffDelay = 0;
    if functions.ccxtruthy(!functions.ccxtruthy(clientExisted))
        backoffDelay = self.calculateWsBackoffDelay(url);
    end
    connected = connect(client, backoffDelay);
    if functions.ccxtruthy(@functions.ccxt_or((subscribeHashes == nothing), length(missingSubscriptions)))
        catch_var(functions.ccxt_then_sync(connected, function ()

    options = safeValue(self.options, "ws");
    cost = safeValue(options, "cost", 1);
    if functions.ccxtruthy(message)
        if functions.ccxtruthy(@functions.ccxt_and(self.enableRateLimit, get(client, Symbol("throttle"), nothing)))
            catch_var(functions.ccxt_then_sync(throttle(client, cost = cost), function ()

    send(client, message);
end

, nothing), function (e)

    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(missingSubscriptions)))
        subscribeHash = get(missingSubscriptions, i + 1, nothing);
        delete!(get(client, Symbol("subscriptions"), nothing), Symbol(subscribeHash));
        i += 1
    end
    reject(future, e);
end);
        else
            catch_var(send(client, message), function (e)

    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(missingSubscriptions)))
        subscribeHash = get(missingSubscriptions, i + 1, nothing);
        delete!(get(client, Symbol("subscriptions"), nothing), Symbol(subscribeHash));
        i += 1
    end
    reject(future, e);
end);
        end
    end
end

, nothing), function (e)

    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(missingSubscriptions)))
        subscribeHash = get(missingSubscriptions, i + 1, nothing);
        delete!(get(client, Symbol("subscriptions"), nothing), Symbol(subscribeHash));
        i += 1
    end
    reject(future, e);
end);
    end
    return future

end
function watch(self::CcxtExchange, url, messageHash; message=nothing, subscribeHash=nothing, subscription=nothing)
    if functions.ccxtruthy(url == nothing)
        throw(ArgumentsRequired(string(self.id, " watch() requires a url argument")));
    end
    if functions.ccxtruthy(messageHash == nothing)
        throw(ArgumentsRequired(string(self.id, " watch() requires a messageHash argument")));
    end
    clientExisted = (ccxt_in(url, self.clients));
    client = self.client(url);
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((subscribeHash == nothing), (messageHash != nothing)), (ccxt_in(messageHash, get(client, Symbol("futures"), nothing)))))
            return get(get(client, Symbol("futures"), nothing), Symbol(messageHash), nothing)
    end
    future = Ccxt.future(client, messageHash);
    clientSubscription = get(get(client, Symbol("subscriptions"), nothing), Symbol(subscribeHash), nothing);
    if functions.ccxtruthy(!functions.ccxtruthy(clientSubscription))
        client.subscriptions[Symbol(subscribeHash)] = @functions.ccxt_or(subscription, true);
    end
    backoffDelay = 0;
    if functions.ccxtruthy(!functions.ccxtruthy(clientExisted))
        backoffDelay = self.calculateWsBackoffDelay(url);
    end
    connected = connect(client, backoffDelay);
    if functions.ccxtruthy(!functions.ccxtruthy(clientSubscription))
        catch_var(functions.ccxt_then_sync(connected, function ()

    options = safeValue(self.options, "ws");
    cost = safeValue(options, "cost", 1);
    if functions.ccxtruthy(message)
        if functions.ccxtruthy(@functions.ccxt_and(self.enableRateLimit, get(client, Symbol("throttle"), nothing)))
            catch_var(functions.ccxt_then_sync(throttle(client, cost = cost), function ()

    send(client, message);
end

, nothing), function (e)

    onError(client, e);
end);
        else
            catch_var(send(client, message), function (e)

    onError(client, e);
end);
        end
    end
end

, nothing), function (e)

    delete!(get(client, Symbol("subscriptions"), nothing), Symbol(subscribeHash));
    reject(future, e);
end);
    end
    return future

end
function onConnected(self::CcxtExchange, client; message=nothing)

end
function onError(self::CcxtExchange, client, error)
    if functions.ccxtruthy(@functions.ccxt_and((ccxt_in(get(client, Symbol("url"), nothing), self.clients)), (get(get(self.clients, Symbol(get(client, Symbol("url"), nothing)), nothing), Symbol("error"), nothing))))
                delete!(self.clients, Symbol(get(client, Symbol("url"), nothing)));
    end

end
function onClose(self::CcxtExchange, client, error)
    if functions.ccxtruthy(get(client, Symbol("error"), nothing))
    else
        if functions.ccxtruthy(get(self.clients, Symbol(get(client, Symbol("url"), nothing)), nothing))
                        delete!(self.clients, Symbol(get(client, Symbol("url"), nothing)));
        end
    end

end
function close(self::CcxtExchange; cleanInstanceCache=false)
    self.sleep(0);
    clients = objectValues(@functions.ccxt_or(self.clients, Dict{Symbol, Any}()));
    closedClients = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(clients)))
        client = get(clients, i + 1, nothing);
        client.error = ExchangeClosedByUser(string(self.id, " closedByUser"));
        push!(closedClients, close(client));
        i += 1
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(clients)))
        client = get(clients, i + 1, nothing);
        delete!(self.clients, Symbol(get(client, Symbol("url"), nothing)));
        push!(closedClients, close(client));
        i += 1
    end
    asyncmap(Base.fetch, closedClients);
    if functions.ccxtruthy(cleanInstanceCache)
        self.cleanWsData();
    end
    if functions.ccxtruthy(cleanInstanceCache)
        self.cleanRestData();
    end

end
function convertToBigInt(self::CcxtExchange, value)
    return BigInt(value)

end
function stringToCharsArray(self::CcxtExchange, value)
    return split(value, "")

end
function valueIsDefined(self::CcxtExchange, value)
    return @functions.ccxt_and(value != nothing, value != nothing)

end
function arraySlice(self::CcxtExchange, array, first; second=nothing)
    if functions.ccxtruthy(second == nothing)
            return functions.ccxt_slice(array, first)
    end
    return functions.ccxt_slice(array, first, second)

end
function getProperty(self::CcxtExchange, obj, property; defaultValue=nothing)
    return (functions.ccxtruthy(ccxt_in(property, obj)) ? get(obj, Symbol(property), nothing) : defaultValue)

end
function setProperty(self::CcxtExchange, obj, property; defaultValue=nothing)
    obj[Symbol(property)] = defaultValue;

end
function exceptionMessage(self::CcxtExchange, exc; includeStack=true)
    message = string("[", get(constructor(exc), Symbol("name"), nothing), "] ", (functions.ccxtruthy(!functions.ccxtruthy(includeStack)) ? get(exc, Symbol("message"), nothing) : get(exc, Symbol("stack"), nothing)));
    len = min(100000, length(message));
    return functions.ccxt_slice(message, 0, len)

end
function fixStringifiedJsonMembers(self::CcxtExchange, content)
    modifiedContent = replace(content, "\\" => "");
    modifiedContent = replace(modifiedContent, "\"{" => "{");
    modifiedContent = replace(modifiedContent, "}\"" => "}");
    return modifiedContent

end
function ethAbiEncode(self::CcxtExchange, types, args)
    return self.base16ToBinary(functions.ccxt_slice(encode(ethers, types, args), 2))

end
function ethEncodeStructuredData(self::CcxtExchange, domain, messageTypes, messageData)
    return self.base16ToBinary(functions.ccxt_slice(encode(domain, messageTypes, messageData), -132))

end
function ethGetAddressFromPrivateKey(self::CcxtExchange, privateKey)
    cleanPrivateKey = self.remove0xPrefix(privateKey);
    publicKeyBytes = getPublicKey(secp256k1, self.base16ToBinary(cleanPrivateKey));
    publicKeyUncompressed = functions.ccxt_slice(functions.ecPointToUncompressed(functions.secp256k1, publicKeyBytes), 1);
    publicKeyHash = keccak_256(publicKeyUncompressed);
    addressBytes = functions.ccxt_slice(publicKeyHash, -20);
    addressHex = string("0x", self.binaryToBase16(addressBytes));
    return addressHex

end
function retrieveStarkAccount(self::CcxtExchange, signature, accountClassHash, accountProxyClassHash)
    privateKey = ethSigToPrivate(signature);
    publicKey = getStarkKey(privateKey);
    callData = compile(Starknet.CallData, Dict{Symbol, Any}(
        Symbol("implementation") => accountClassHash,
        Symbol("selector") => getSelectorFromName(Starknet.hash, "initialize"),
        Symbol("calldata") => compile(Starknet.CallData, Dict{Symbol, Any}(
        Symbol("signer") => publicKey,
        Symbol("guardian") => "0"
    ))
    ));
    address = calculateContractAddressFromHash(Starknet.hash, publicKey, accountProxyClassHash, callData, 0);
    return Dict{Symbol, Any}(
    Symbol("privateKey") => privateKey,
    Symbol("publicKey") => publicKey,
    Symbol("address") => address
)

end
function starknetEncodeStructuredData(self::CcxtExchange, domain, messageTypes, messageData, address)
    types = objectKeys(messageTypes);
    if functions.ccxtruthy(functions.ccxt_gt(length(types), 1))
        throw(NotSupported(string(self.id, " starknetEncodeStructuredData only support single type")));
    end
    request = Dict{Symbol, Any}(
        Symbol("domain") => domain,
        Symbol("primaryType") => get(types, 1, nothing),
        Symbol("types") => extend(Dict{Symbol, Any}(
        Symbol("StarkNetDomain") => [Dict{Symbol, Any}(
        Symbol("name") => "name",
        Symbol("type") => "felt"
    ), Dict{Symbol, Any}(
        Symbol("name") => "chainId",
        Symbol("type") => "felt"
    ), Dict{Symbol, Any}(
        Symbol("name") => "version",
        Symbol("type") => "felt"
    )]
    ), messageTypes),
        Symbol("message") => messageData
    );
    msgHash = getMessageHash(Starknet.typedData, request, address);
    return msgHash

end
function starknetSign(self::CcxtExchange, msgHash, pri)
    signature = starknetCurveSign(replace(msgHash, "0x" => ""), replace(pri, "0x" => ""));
    return json([string(get(signature, Symbol("r"), nothing)), string(get(signature, Symbol("s"), nothing))])

end
function extendedStarknetSign(self::CcxtExchange, msgHash, pri)
    signature = starknetCurveSign(replace(msgHash, "0x" => ""), replace(pri, "0x" => ""));
    return json([string(get(signature, Symbol("r"), nothing)), string(get(signature, Symbol("s"), nothing))])

end
function extendedStarknetGetSelectorFromName(self::CcxtExchange, name)
    return getSelectorFromName(Starknet.hash, name)

end
function extendedStarknetComputePoseidonHashOnElements(self::CcxtExchange, data)
    return computePoseidonHashOnElements(Starknet.hash, data)

end
function getZKContractSignatureObj(self::CcxtExchange, seed; params=Dict())
    formattedSlotId = string(BigInt(string("0x", self.remove0xPrefix(hash(self.encode(safeString(params, "slotId", "")), sha256, "hex")))));
    formattedNonce = string(BigInt(string("0x", self.remove0xPrefix(hash(self.encode(safeString(params, "nonce", "")), sha256, "hex")))));
    formattedUint64 = "18446744073709551615";
    formattedUint32 = "4294967295";
    accountIdString = stringMod(safeString(params, "accountId", "0"), formattedUint32);
    if functions.ccxtruthy(accountIdString == nothing)
        accountIdString = "0";
    end
    slotIdString = stringDiv(stringMod(formattedSlotId, formattedUint64), formattedUint32);
    if functions.ccxtruthy(slotIdString == nothing)
        slotIdString = "0";
    end
    nonceString = stringMod(formattedNonce, formattedUint32);
    if functions.ccxtruthy(nonceString == nothing)
        nonceString = "0";
    end
    accountId = ccxt_parseInt(accountIdString, 10);
    slotId = ccxt_parseInt(slotIdString, 10);
    nonce = ccxt_parseInt(nonceString, 10);
    init();
    _signer = newRpcSignerWithProvider(zklink, Dict{Symbol, Any}());
    initZklinkSigner(_signer, seed);
    pairId = safeInteger(params, "pairId", 0);
    sizeString = stringMul(safeString(params, "size", "0"), "1e18");
    if functions.ccxtruthy(sizeString == nothing)
        sizeString = "0";
    end
    priceString = stringMul(safeString(params, "price", "0"), "1e18");
    if functions.ccxtruthy(priceString == nothing)
        priceString = "0";
    end
    makerFeeRateString = stringMul(safeString(params, "makerFeeRate", "0"), "10000");
    if functions.ccxtruthy(makerFeeRateString == nothing)
        makerFeeRateString = "0";
    end
    takerFeeRateString = stringMul(safeString(params, "takerFeeRate", "0"), "10000");
    if functions.ccxtruthy(takerFeeRateString == nothing)
        takerFeeRateString = "0";
    end
    tx_builder = get(zklink, Symbol("ContractBuilder"), nothing)(accountId, 0, slotId, nonce, pairId, sizeString, priceString, safeString(params, "direction") == "BUY", ccxt_parseInt(makerFeeRateString), ccxt_parseInt(takerFeeRateString), false);
    contractor = newContract(zklink, tx_builder);
    sign(contractor, getZkLinkSigner(_signer));
    tx = jsValue(contractor);
    zkSign = get(get(tx, Symbol("signature"), nothing), Symbol("signature"), nothing);
    return zkSign

end
function getZKTransferSignatureObj(self::CcxtExchange, seed; params=Dict())
    init();
    _signer = newRpcSignerWithProvider(zklink, Dict{Symbol, Any}());
    initZklinkSigner(_signer, seed);
    nonce = safeString(params, "nonce", "0");
    if functions.ccxtruthy(self.safeBool(params, "isContract"))
        formattedUint32 = "4294967295";
        formattedNonce = string(BigInt(string("0x", self.remove0xPrefix(hash(self.encode(nonce), sha256, "hex")))));
        nonce = stringMod(formattedNonce, formattedUint32);
    end
    zkAccountId = self.safeNumber(params, "zkAccountId", defaultNumber = 0);
    subAccountId = self.safeNumber(params, "subAccountId", defaultNumber = 0);
    receiverSubAccountId = self.safeNumber(params, "receiverSubAccountId", defaultNumber = 0);
    tokenId = self.safeNumber(params, "tokenId", defaultNumber = 0);
    timestampSeconds = self.safeNumber(params, "timestampSeconds", defaultNumber = 0);
    tx_builder = get(zklink, Symbol("TransferBuilder"), nothing)(functions.ccxtruthy((zkAccountId == nothing)) ? 0 : zkAccountId, safeString(params, "receiverAddress", ""), functions.ccxtruthy((subAccountId == nothing)) ? 0 : subAccountId, functions.ccxtruthy((receiverSubAccountId == nothing)) ? 0 : receiverSubAccountId, functions.ccxtruthy((tokenId == nothing)) ? 0 : tokenId, safeString(params, "fee", "0"), safeString(params, "amount", "0"), self.parseToInt(nonce), functions.ccxtruthy((timestampSeconds == nothing)) ? 0 : timestampSeconds);
    contractor = newTransfer(zklink, tx_builder);
    sign(contractor, getZkLinkSigner(_signer));
    tx = jsValue(contractor);
    zkSign = get(get(tx, Symbol("signature"), nothing), Symbol("signature"), nothing);
    return zkSign

end
function loadDydxProtos(self::CcxtExchange, )
    tasks = [("../static_dependencies/dydx-v4-client/registry.js"), ("../static_dependencies/dydx-v4-client/cosmos/tx/v1beta1/tx.js"), ("../static_dependencies/dydx-v4-client/cosmos/tx/signing/v1beta1/signing.js")];
    modules = asyncmap(Base.fetch, tasks);
    encodeAsAny = get(get(modules, 1, nothing), Symbol("encodeAsAny"), nothing);
    AuthInfo = get(get(modules, 2, nothing), Symbol("AuthInfo"), nothing);
    Tx = get(get(modules, 2, nothing), Symbol("Tx"), nothing);
    TxBody = get(get(modules, 2, nothing), Symbol("TxBody"), nothing);
    TxRaw = get(get(modules, 2, nothing), Symbol("TxRaw"), nothing);
    SignDoc = get(get(modules, 2, nothing), Symbol("SignDoc"), nothing);
    SignMode = get(get(modules, 3, nothing), Symbol("SignMode"), nothing);

end
function toDydxLong(self::CcxtExchange, numStr)
    return fromString(numStr)

end
function retrieveDydxCredentials(self::CcxtExchange, privateKey)
    privateKeyBytes = self.base16ToBinary(self.remove0xPrefix(privateKey));
    publicKeyBytes = getPublicKey(secp256k1, privateKeyBytes, true);
    return Dict{Symbol, Any}(
    Symbol("privateKey") => privateKeyBytes,
    Symbol("publicKey") => publicKeyBytes
)

end
function encodeDydxTxForSimulation(self::CcxtExchange, message, memo, sequence, publicKey)
    encodeFn = encodeAsAny;
    if functions.ccxtruthy(encodeFn == nothing)
        throw(NotSupported(string(self.id, " requires protobuf to encode messages, please install it with `npm install protobufjs`")));
    end
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((Tx == nothing), (TxBody == nothing)), (AuthInfo == nothing)), (SignMode == nothing)))
        throw(NotSupported(string(self.id, " requires protobuf to encode messages, please install it with `npm install protobufjs`")));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(publicKey))
        throw(Error("Public key cannot be undefined"));
    end
    messages = [message];
    encodedMessages = map(function (msg)
    
        return encodeFn(msg);
    end
    
    , messages);
    tx = fromPartial(Dict{Symbol, Any}(
        Symbol("body") => fromPartial(Dict{Symbol, Any}(
        Symbol("messages") => encodedMessages,
        Symbol("memo") => memo
    )),
        Symbol("authInfo") => fromPartial(Dict{Symbol, Any}(
        Symbol("fee") => Dict{Symbol, Any}(),
        Symbol("signerInfos") => [Dict{Symbol, Any}(
        Symbol("publicKey") => encodeFn(Dict{Symbol, Any}(
        Symbol("typeUrl") => "/cosmos.crypto.secp256k1.PubKey",
        Symbol("value") => publicKey
    )),
        Symbol("sequence") => sequence,
        Symbol("modeInfo") => Dict{Symbol, Any}(
            Symbol("single") => Dict{Symbol, Any}(
                Symbol("mode") => SignMode.SIGN_MODE_UNSPECIFIED
            )
        )
    )]
    )),
        Symbol("signatures") => [functions.Uint8Array()]
    ));
    return self.binaryToBase64(finish(encode(tx)))

end
function encodeDydxTxForSigning(self::CcxtExchange, message, memo, chainId, account, authenticators; fee=nothing)
    encodeFn = encodeAsAny;
    if functions.ccxtruthy(encodeFn == nothing)
        throw(NotSupported(string(self.id, " requires protobuf to encode messages, please install it with `npm install protobufjs`")));
    end
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((TxBody == nothing), (AuthInfo == nothing)), (SignMode == nothing)), (SignDoc == nothing)))
        throw(NotSupported(string(self.id, " requires protobuf to encode messages, please install it with `npm install protobufjs`")));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(get(account, Symbol("pub_key"), nothing)))
        throw(Error("Public key cannot be undefined"));
    end
    messages = [message];
    sequence = milliseconds();
    if functions.ccxtruthy(fee == nothing)
        emptyAmount = [];
        fee = Dict{Symbol, Any}(
            Symbol("amount") => emptyAmount,
            Symbol("gasLimit") => 1000000
        );
    end
    encodedMessages = map(function (msg)
    
        return encodeFn(msg);
    end
    
    , messages);
    nonCriticalExtensionOptions = [encodeFn(Dict{Symbol, Any}(
        Symbol("typeUrl") => "/dydxprotocol.accountplus.TxExtension",
        Symbol("value") => Dict{Symbol, Any}(
            Symbol("selectedAuthenticators") => something(authenticators, [])
        )
    ))];
    txBodyBytes = finish(encode(fromPartial(Dict{Symbol, Any}(
        Symbol("messages") => encodedMessages,
        Symbol("memo") => memo,
        Symbol("extensionOptions") => [],
        Symbol("nonCriticalExtensionOptions") => nonCriticalExtensionOptions
    ))));
    authInfoBytes = finish(encode(fromPartial(Dict{Symbol, Any}(
        Symbol("fee") => fee,
        Symbol("signerInfos") => [Dict{Symbol, Any}(
        Symbol("publicKey") => encodeFn(Dict{Symbol, Any}(
        Symbol("typeUrl") => "/cosmos.crypto.secp256k1.PubKey",
        Symbol("value") => get(account, Symbol("pub_key"), nothing)
    )),
        Symbol("sequence") => sequence,
        Symbol("modeInfo") => Dict{Symbol, Any}(
            Symbol("single") => Dict{Symbol, Any}(
                Symbol("mode") => SignMode.SIGN_MODE_DIRECT
            )
        )
    )]
    ))));
    signDoc = fromPartial(Dict{Symbol, Any}(
        Symbol("accountNumber") => get(account, Symbol("account_number"), nothing),
        Symbol("authInfoBytes") => authInfoBytes,
        Symbol("bodyBytes") => txBodyBytes,
        Symbol("chainId") => chainId
    ));
    signingHash = hash(finish(encode(signDoc)), sha256, "hex");
    return [signingHash, signDoc]

end
function encodeDydxTxRaw(self::CcxtExchange, signDoc, signature)
    if functions.ccxtruthy(encodeAsAny == nothing)
        throw(NotSupported(string(self.id, " requires protobuf to encode messages, please install it with `npm install protobufjs`")));
    end
    if functions.ccxtruthy(TxRaw == nothing)
        throw(NotSupported(string(self.id, " requires protobuf to encode messages, please install it with `npm install protobufjs`")));
    end
    return string("0x", self.binaryToBase16(finish(encode(fromPartial(Dict{Symbol, Any}(
    Symbol("bodyBytes") => get(signDoc, Symbol("bodyBytes"), nothing),
    Symbol("authInfoBytes") => get(signDoc, Symbol("authInfoBytes"), nothing),
    Symbol("signatures") => [self.base16ToBinary(signature)]
))))))

end
function intToBase16(self::CcxtExchange, elem)
    return string(elem, base=16)

end
function extendExchangeOptions(self::CcxtExchange, newOptions)
    self.options = extend(self.options, newOptions);

end
function createSafeDictionary(self::CcxtExchange; isWs=false)
    return Dict{Symbol, Any}()

end
function convertToSafeDictionary(self::CcxtExchange, dict)
    return dict

end
function randomBytes(self::CcxtExchange, length)
    x = functions.Uint8Array(length);
    getRandomValues(crypto, x);
    return self.binaryToBase16(x)

end
function randNumber(self::CcxtExchange, size)
    number = "";
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, size))
        number += floor(rand() * 10);
        i += 1
    end
    return ccxt_parseInt(number, 10)

end
function binaryLength(self::CcxtExchange, binary)
    return length(binary)

end
function lockId(self::CcxtExchange, )
    return nothing

end
function unlockId(self::CcxtExchange, )
    return nothing

end
function loadLighterLibrary(self::CcxtExchange, libraryPath, chainId, privateKey, apiKeyIndex, accountIndex; createClient=false)
    if functions.ccxtruthy(@functions.ccxt_or(libraryPath == nothing, libraryPath == ""))
        throw(Error("loadLighterLibrary() requires \"libraryPath\" that should point to \"lighter.wasm\".\nYou can build it from source using the official Ligher SDK or download it here https://github.com/ccxt/lighter-wasm.\nExample: exchanges.options[\"libraryPath\"] = \"/user/cjg/Git/lighter-wasm/lighter.wasm\""));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(isNode))
        throw(NotSupported(string(self.id, " loadLighterLibrary() is only supported in node environment.")));
    end
    initFileSystem(functions);
    wasmExecPath = safeString(self.options, "wasmExecPath");
    if functions.ccxtruthy(@functions.ccxt_or(wasmExecPath == nothing, wasmExecPath == ""))
        throw(Error("loadLighterLibrary() requires \"wasmExecPath\" that should point to `wasm_exec.js`. You can check the location of the file locally if you have GO installed or download it here https://github.com/ccxt/lighter-wasm.\nExample: exchanges.options[\"wasmExecPath\"] = \"/opt/homebrew/opt/go/libexec/lib/wasm/wasm_exec.js\""));
    end
    (filePathToFileUrlForWindows(wasmExecPath));
    go = get(globalThis, Symbol("Go"), nothing)();
    bytes = functions.Uint8Array(readFile(libraryPath, nothing));
    instance = (instantiate(bytes, get(go, Symbol("importObject"), nothing))).instance;
    run(go, instance);
    if functions.ccxtruthy(createClient)
        self.lighterCreateClient(nothing, chainId, privateKey, apiKeyIndex, accountIndex);
    end
    return Dict{Symbol, Any}()

end
function lighterCreateClient(self::CcxtExchange, signer, chainId, privateKey, apiKeyIndex, accountIndex)
    url = self.implodeHostname(get(get(self.urls, Symbol("api"), nothing), Symbol("public"), nothing));
    res = CreateClient(globalThis, url, privateKey, chainId, apiKeyIndex, accountIndex);
    self.checkLighterSignedError(res);
    return signer

end
function lighterSignCreateGroupedOrders(self::CcxtExchange, signer, request)
    orders = get(request, Symbol("orders"), nothing);
    ordersArr = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
        order = get(orders, i + 1, nothing);
        push!(ordersArr, Dict{Symbol, Any}(
    Symbol("MarketIndex") => ccxt_parseInt(get(order, Symbol("market_index"), nothing)),
    Symbol("ClientOrderIndex") => get(order, Symbol("client_order_index"), nothing),
    Symbol("BaseAmount") => get(order, Symbol("base_amount"), nothing),
    Symbol("Price") => get(order, Symbol("avg_execution_price"), nothing),
    Symbol("IsAsk") => get(order, Symbol("is_ask"), nothing),
    Symbol("Type") => get(order, Symbol("order_type"), nothing),
    Symbol("TimeInForce") => get(order, Symbol("time_in_force"), nothing),
    Symbol("ReduceOnly") => get(order, Symbol("reduce_only"), nothing),
    Symbol("TriggerPrice") => get(order, Symbol("trigger_price"), nothing),
    Symbol("OrderExpiry") => get(order, Symbol("order_expiry"), nothing)
));
        i += 1
    end
    res = SignCreateGroupedOrders(globalThis, get(request, Symbol("grouping_type"), nothing), ordersArr, length(orders), 1, get(request, Symbol("nonce"), nothing), get(request, Symbol("api_key_index"), nothing), get(request, Symbol("account_index"), nothing));
    self.checkLighterSignedError(res);
    return [get(res, Symbol("txType"), nothing), get(res, Symbol("txInfo"), nothing)]

end
function lighterSignCreateOrder(self::CcxtExchange, signer, request)
    res = (SignCreateOrder(globalThis, ccxt_parseInt(get(request, Symbol("market_index"), nothing)), get(request, Symbol("client_order_index"), nothing), get(request, Symbol("base_amount"), nothing), get(request, Symbol("avg_execution_price"), nothing), get(request, Symbol("is_ask"), nothing), get(request, Symbol("order_type"), nothing), get(request, Symbol("time_in_force"), nothing), get(request, Symbol("reduce_only"), nothing), get(request, Symbol("trigger_price"), nothing), get(request, Symbol("order_expiry"), nothing), get(request, Symbol("integrator_account_index"), nothing), get(request, Symbol("integrator_taker_fee"), nothing), get(request, Symbol("integrator_maker_fee"), nothing), 1, get(request, Symbol("nonce"), nothing), get(request, Symbol("api_key_index"), nothing), get(request, Symbol("account_index"), nothing)));
    self.checkLighterSignedError(res);
    return [get(res, Symbol("txType"), nothing), get(res, Symbol("txInfo"), nothing)]

end
function checkLighterSignedError(self::CcxtExchange, result)
    if functions.ccxtruthy(ccxt_in("error", result))
        throw(Error(string("Lighter signing error: ", get(result, Symbol("error"), nothing))));
    end

end
function lighterSignCancelOrder(self::CcxtExchange, signer, request)
    res = (SignCancelOrder(globalThis, get(request, Symbol("market_index"), nothing), get(request, Symbol("order_index"), nothing), 1, get(request, Symbol("nonce"), nothing), get(request, Symbol("api_key_index"), nothing), get(request, Symbol("account_index"), nothing)));
    self.checkLighterSignedError(res);
    return [get(res, Symbol("txType"), nothing), get(res, Symbol("txInfo"), nothing)]

end
function lighterSignWithdraw(self::CcxtExchange, signer, request)
    res = (SignWithdraw(globalThis, get(request, Symbol("asset_index"), nothing), get(request, Symbol("route_type"), nothing), get(request, Symbol("amount"), nothing), 1, get(request, Symbol("nonce"), nothing), get(request, Symbol("api_key_index"), nothing), get(request, Symbol("account_index"), nothing)));
    self.checkLighterSignedError(res);
    return [get(res, Symbol("txType"), nothing), get(res, Symbol("txInfo"), nothing)]

end
function lighterSignCreateSubAccount(self::CcxtExchange, signer, request)
    res = (SignCreateSubAccount(globalThis, 1, get(request, Symbol("nonce"), nothing), get(request, Symbol("api_key_index"), nothing), get(request, Symbol("account_index"), nothing)));
    self.checkLighterSignedError(res);
    return [get(res, Symbol("txType"), nothing), get(res, Symbol("txInfo"), nothing)]

end
function lighterSignCancelAllOrders(self::CcxtExchange, signer, request)
    res = (SignCancelAllOrders(globalThis, get(request, Symbol("time_in_force"), nothing), get(request, Symbol("time"), nothing), 1, get(request, Symbol("nonce"), nothing), get(request, Symbol("api_key_index"), nothing), get(request, Symbol("account_index"), nothing)));
    self.checkLighterSignedError(res);
    return [get(res, Symbol("txType"), nothing), get(res, Symbol("txInfo"), nothing)]

end
function lighterSignModifyOrder(self::CcxtExchange, signer, request)
    res = (SignModifyOrder(globalThis, get(request, Symbol("market_index"), nothing), get(request, Symbol("index"), nothing), get(request, Symbol("base_amount"), nothing), get(request, Symbol("price"), nothing), get(request, Symbol("trigger_price"), nothing), get(request, Symbol("integrator_account_index"), nothing), get(request, Symbol("integrator_taker_fee"), nothing), get(request, Symbol("integrator_maker_fee"), nothing), 1, get(request, Symbol("nonce"), nothing), get(request, Symbol("api_key_index"), nothing), get(request, Symbol("account_index"), nothing)));
    self.checkLighterSignedError(res);
    return [get(res, Symbol("txType"), nothing), get(res, Symbol("txInfo"), nothing)]

end
function lighterSignTransfer(self::CcxtExchange, signer, request)
    res = SignTransfer(globalThis, get(request, Symbol("to_account_index"), nothing), get(request, Symbol("asset_index"), nothing), get(request, Symbol("from_route_type"), nothing), get(request, Symbol("to_route_type"), nothing), get(request, Symbol("amount"), nothing), get(request, Symbol("usdc_fee"), nothing), get(request, Symbol("memo"), nothing), 1, get(request, Symbol("nonce"), nothing), get(request, Symbol("api_key_index"), nothing), get(request, Symbol("account_index"), nothing));
    self.checkLighterSignedError(res);
    return [get(res, Symbol("txType"), nothing), get(res, Symbol("txInfo"), nothing)]

end
function lighterSignUpdateLeverage(self::CcxtExchange, signer, request)
    res = (SignUpdateLeverage(globalThis, get(request, Symbol("market_index"), nothing), get(request, Symbol("initial_margin_fraction"), nothing), get(request, Symbol("margin_mode"), nothing), 1, get(request, Symbol("nonce"), nothing), get(request, Symbol("api_key_index"), nothing), get(request, Symbol("account_index"), nothing)));
    self.checkLighterSignedError(res);
    return [get(res, Symbol("txType"), nothing), get(res, Symbol("txInfo"), nothing)]

end
function lighterCreateAuthToken(self::CcxtExchange, signer, request)
    res = CreateAuthToken(globalThis, get(request, Symbol("deadline"), nothing), get(request, Symbol("api_key_index"), nothing), get(request, Symbol("account_index"), nothing));
    self.checkLighterSignedError(res);
    return get(res, Symbol("authToken"), nothing)

end
function lighterSignUpdateMargin(self::CcxtExchange, signer, request)
    res = SignUpdateMargin(globalThis, get(request, Symbol("market_index"), nothing), get(request, Symbol("usdc_amount"), nothing), get(request, Symbol("direction"), nothing), 1, get(request, Symbol("nonce"), nothing), get(request, Symbol("api_key_index"), nothing), get(request, Symbol("account_index"), nothing));
    self.checkLighterSignedError(res);
    return [get(res, Symbol("txType"), nothing), get(res, Symbol("txInfo"), nothing)]

end
function lighterSignApproveIntegrator(self::CcxtExchange, signer, request)
    res = SignApproveIntegrator(globalThis, get(request, Symbol("integrator_account_index"), nothing), get(request, Symbol("integrator_taker_fee"), nothing), get(request, Symbol("integrator_maker_fee"), nothing), get(request, Symbol("integrator_taker_fee"), nothing), get(request, Symbol("integrator_maker_fee"), nothing), get(request, Symbol("approval_expiry"), nothing), 1, get(request, Symbol("nonce"), nothing), get(request, Symbol("api_key_index"), nothing), get(request, Symbol("account_index"), nothing));
    self.checkLighterSignedError(res);
    return [get(res, Symbol("txType"), nothing), get(res, Symbol("txInfo"), nothing), get(res, Symbol("messageToSign"), nothing)]

end
function lighterGenerateApiKey(self::CcxtExchange, signer)
    res = GenerateAPIKey(globalThis);
    self.checkLighterSignedError(res);
    return [get(res, Symbol("privateKey"), nothing), get(res, Symbol("publicKey"), nothing)]

end
function lighterSignChangePubkey(self::CcxtExchange, signer, request)
    res = SignChangePubKey(globalThis, string(from(get(request, Symbol("pubkey"), nothing))), 1, get(request, Symbol("nonce"), nothing), get(request, Symbol("api_key_index"), nothing), get(request, Symbol("account_index"), nothing));
    self.checkLighterSignedError(res);
    return [get(res, Symbol("txType"), nothing), get(res, Symbol("txInfo"), nothing), get(res, Symbol("messageToSign"), nothing)]

end
function setLastRestRequestTimestamp(self::CcxtExchange, )
    self.lastRestRequestTimestamp = milliseconds();

end
function setLastRequest(self::CcxtExchange, request)
    self.last_request_headers = get(request, Symbol("headers"), nothing);
    self.last_request_body = get(request, Symbol("body"), nothing);
    self.last_request_url = get(request, Symbol("url"), nothing);

end
function describe(self::CcxtExchange, )
    return Dict{Symbol, Any}(
    Symbol("id") => self.id,
    Symbol("name") => self.name,
    Symbol("countries") => self.countries,
    Symbol("enableRateLimit") => self.enableRateLimit,
    Symbol("rateLimit") => self.rateLimit,
    Symbol("rateLimiterAlgorithm") => self.rateLimiterAlgorithm,
    Symbol("timeout") => self.timeout,
    Symbol("certified") => self.certified,
    Symbol("pro") => self.pro,
    Symbol("alias") => self.alias,
    Symbol("dex") => false,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("publicAPI") => true,
        Symbol("privateAPI") => true,
        Symbol("CORS") => nothing,
        Symbol("sandbox") => nothing,
        Symbol("spot") => nothing,
        Symbol("margin") => nothing,
        Symbol("swap") => nothing,
        Symbol("future") => nothing,
        Symbol("option") => nothing,
        Symbol("index") => nothing,
        Symbol("addMargin") => nothing,
        Symbol("borrowCrossMargin") => nothing,
        Symbol("borrowIsolatedMargin") => nothing,
        Symbol("borrowMargin") => nothing,
        Symbol("cancelAllOrders") => nothing,
        Symbol("cancelAllOrdersWs") => nothing,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrderWithClientOrderId") => nothing,
        Symbol("cancelOrderWs") => nothing,
        Symbol("cancelOrders") => nothing,
        Symbol("cancelOrdersWithClientOrderId") => nothing,
        Symbol("cancelOrdersWs") => nothing,
        Symbol("closeAllPositions") => nothing,
        Symbol("closePosition") => nothing,
        Symbol("createDepositAddress") => nothing,
        Symbol("createLimitBuyOrder") => nothing,
        Symbol("createLimitBuyOrderWs") => nothing,
        Symbol("createLimitOrder") => true,
        Symbol("createLimitOrderWs") => nothing,
        Symbol("createLimitSellOrder") => nothing,
        Symbol("createLimitSellOrderWs") => nothing,
        Symbol("createMarketBuyOrder") => nothing,
        Symbol("createMarketBuyOrderWs") => nothing,
        Symbol("createMarketBuyOrderWithCost") => nothing,
        Symbol("createMarketBuyOrderWithCostWs") => nothing,
        Symbol("createMarketOrder") => true,
        Symbol("createMarketOrderWs") => true,
        Symbol("createMarketOrderWithCost") => nothing,
        Symbol("createMarketOrderWithCostWs") => nothing,
        Symbol("createMarketSellOrder") => nothing,
        Symbol("createMarketSellOrderWs") => nothing,
        Symbol("createMarketSellOrderWithCost") => nothing,
        Symbol("createMarketSellOrderWithCostWs") => nothing,
        Symbol("createOrder") => true,
        Symbol("createOrderWs") => nothing,
        Symbol("createOrders") => nothing,
        Symbol("createOrderWithTakeProfitAndStopLoss") => nothing,
        Symbol("createOrderWithTakeProfitAndStopLossWs") => nothing,
        Symbol("createPostOnlyOrder") => nothing,
        Symbol("createPostOnlyOrderWs") => nothing,
        Symbol("createReduceOnlyOrder") => nothing,
        Symbol("createReduceOnlyOrderWs") => nothing,
        Symbol("createStopLimitOrder") => nothing,
        Symbol("createStopLimitOrderWs") => nothing,
        Symbol("createStopLossOrder") => nothing,
        Symbol("createStopLossOrderWs") => nothing,
        Symbol("createStopMarketOrder") => nothing,
        Symbol("createStopMarketOrderWs") => nothing,
        Symbol("createStopOrder") => nothing,
        Symbol("createStopOrderWs") => nothing,
        Symbol("createTakeProfitOrder") => nothing,
        Symbol("createTakeProfitOrderWs") => nothing,
        Symbol("createTrailingAmountOrder") => nothing,
        Symbol("createTrailingAmountOrderWs") => nothing,
        Symbol("createTrailingPercentOrder") => nothing,
        Symbol("createTrailingPercentOrderWs") => nothing,
        Symbol("createTriggerOrder") => nothing,
        Symbol("createTriggerOrderWs") => nothing,
        Symbol("deposit") => nothing,
        Symbol("editOrder") => "emulated",
        Symbol("editOrderWithClientOrderId") => nothing,
        Symbol("editOrders") => nothing,
        Symbol("editOrderWs") => nothing,
        Symbol("fetchAccounts") => nothing,
        Symbol("fetchADLRank") => nothing,
        Symbol("fetchBalance") => true,
        Symbol("fetchBalanceWs") => nothing,
        Symbol("fetchBidsAsks") => nothing,
        Symbol("fetchBorrowInterest") => nothing,
        Symbol("fetchBorrowRate") => nothing,
        Symbol("fetchBorrowRateHistories") => nothing,
        Symbol("fetchBorrowRateHistory") => nothing,
        Symbol("fetchBorrowRates") => nothing,
        Symbol("fetchBorrowRatesPerSymbol") => nothing,
        Symbol("fetchCanceledAndClosedOrders") => nothing,
        Symbol("fetchCanceledOrders") => nothing,
        Symbol("fetchClosedOrder") => nothing,
        Symbol("fetchClosedOrders") => nothing,
        Symbol("fetchClosedOrdersWs") => nothing,
        Symbol("fetchConvertCurrencies") => nothing,
        Symbol("fetchConvertQuote") => nothing,
        Symbol("fetchConvertTrade") => nothing,
        Symbol("fetchConvertTradeHistory") => nothing,
        Symbol("fetchCrossBorrowRate") => nothing,
        Symbol("fetchCrossBorrowRates") => nothing,
        Symbol("fetchCurrencies") => "emulated",
        Symbol("fetchCurrenciesWs") => "emulated",
        Symbol("fetchDeposit") => nothing,
        Symbol("fetchDepositAddress") => nothing,
        Symbol("fetchDepositAddresses") => nothing,
        Symbol("fetchDepositAddressesByNetwork") => nothing,
        Symbol("fetchDeposits") => nothing,
        Symbol("fetchDepositsWithdrawals") => nothing,
        Symbol("fetchDepositsWs") => nothing,
        Symbol("fetchDepositWithdrawFee") => nothing,
        Symbol("fetchDepositWithdrawFees") => nothing,
        Symbol("fetchFundingHistory") => nothing,
        Symbol("fetchFundingRate") => nothing,
        Symbol("fetchFundingRateHistory") => nothing,
        Symbol("fetchFundingInterval") => nothing,
        Symbol("fetchFundingIntervals") => nothing,
        Symbol("fetchFundingRates") => nothing,
        Symbol("fetchGreeks") => nothing,
        Symbol("fetchIndexOHLCV") => nothing,
        Symbol("fetchIsolatedBorrowRate") => nothing,
        Symbol("fetchIsolatedBorrowRates") => nothing,
        Symbol("fetchMarginAdjustmentHistory") => nothing,
        Symbol("fetchIsolatedPositions") => nothing,
        Symbol("fetchL2OrderBook") => true,
        Symbol("fetchL3OrderBook") => nothing,
        Symbol("fetchLastPrices") => nothing,
        Symbol("fetchLedger") => nothing,
        Symbol("fetchLedgerEntry") => nothing,
        Symbol("fetchLeverage") => nothing,
        Symbol("fetchLeverages") => nothing,
        Symbol("fetchLeverageTiers") => nothing,
        Symbol("fetchLiquidations") => nothing,
        Symbol("fetchLongShortRatio") => nothing,
        Symbol("fetchLongShortRatioHistory") => nothing,
        Symbol("fetchMarginMode") => nothing,
        Symbol("fetchMarginModes") => nothing,
        Symbol("fetchMarketLeverageTiers") => nothing,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarketsWs") => nothing,
        Symbol("fetchMarkOHLCV") => nothing,
        Symbol("fetchMyLiquidations") => nothing,
        Symbol("fetchMySettlementHistory") => nothing,
        Symbol("fetchMyTrades") => nothing,
        Symbol("fetchMyTradesWs") => nothing,
        Symbol("fetchOHLCV") => nothing,
        Symbol("fetchOHLCVWs") => nothing,
        Symbol("fetchOpenInterest") => nothing,
        Symbol("fetchOpenInterests") => nothing,
        Symbol("fetchOpenInterestHistory") => nothing,
        Symbol("fetchOpenOrder") => nothing,
        Symbol("fetchOpenOrders") => nothing,
        Symbol("fetchOpenOrdersWs") => nothing,
        Symbol("fetchOption") => nothing,
        Symbol("fetchOptionChain") => nothing,
        Symbol("fetchOrder") => nothing,
        Symbol("fetchOrderWithClientOrderId") => nothing,
        Symbol("fetchOrderBook") => true,
        Symbol("fetchOrderBooks") => nothing,
        Symbol("fetchOrderBookWs") => nothing,
        Symbol("fetchOrders") => nothing,
        Symbol("fetchOrdersByStatus") => nothing,
        Symbol("fetchOrdersWs") => nothing,
        Symbol("fetchOrderTrades") => nothing,
        Symbol("fetchOrderWs") => nothing,
        Symbol("fetchPosition") => nothing,
        Symbol("fetchPositionADLRank") => nothing,
        Symbol("fetchPositionsADLRank") => nothing,
        Symbol("fetchPositionHistory") => nothing,
        Symbol("fetchPositionsHistory") => nothing,
        Symbol("fetchPositionWs") => nothing,
        Symbol("fetchPositionMode") => nothing,
        Symbol("fetchPositions") => nothing,
        Symbol("fetchPositionsWs") => nothing,
        Symbol("fetchPositionsForSymbol") => nothing,
        Symbol("fetchPositionsForSymbolWs") => nothing,
        Symbol("fetchPositionsRisk") => nothing,
        Symbol("fetchPremiumIndexOHLCV") => nothing,
        Symbol("fetchSettlementHistory") => nothing,
        Symbol("fetchStatus") => nothing,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickerWs") => nothing,
        Symbol("fetchTickers") => nothing,
        Symbol("fetchMarkPrices") => nothing,
        Symbol("fetchTickersWs") => nothing,
        Symbol("fetchTime") => nothing,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradesWs") => nothing,
        Symbol("fetchTradingFee") => nothing,
        Symbol("fetchTradingFees") => nothing,
        Symbol("fetchTradingFeesWs") => nothing,
        Symbol("fetchTradingLimits") => nothing,
        Symbol("fetchTransactionFee") => nothing,
        Symbol("fetchTransactionFees") => nothing,
        Symbol("fetchTransactions") => nothing,
        Symbol("fetchTransfer") => nothing,
        Symbol("fetchTransfers") => nothing,
        Symbol("fetchUnderlyingAssets") => nothing,
        Symbol("fetchVolatilityHistory") => nothing,
        Symbol("fetchWithdrawAddresses") => nothing,
        Symbol("fetchWithdrawal") => nothing,
        Symbol("fetchWithdrawals") => nothing,
        Symbol("fetchWithdrawalsWs") => nothing,
        Symbol("fetchWithdrawalWhitelist") => nothing,
        Symbol("reduceMargin") => nothing,
        Symbol("repayCrossMargin") => nothing,
        Symbol("repayIsolatedMargin") => nothing,
        Symbol("setLeverage") => nothing,
        Symbol("setMargin") => nothing,
        Symbol("setMarginMode") => nothing,
        Symbol("setPositionMode") => nothing,
        Symbol("signIn") => nothing,
        Symbol("transfer") => nothing,
        Symbol("watchBalance") => nothing,
        Symbol("watchMyTrades") => nothing,
        Symbol("watchOHLCV") => nothing,
        Symbol("watchOHLCVForSymbols") => nothing,
        Symbol("watchOrderBook") => nothing,
        Symbol("watchBidsAsks") => nothing,
        Symbol("watchOrderBookForSymbols") => nothing,
        Symbol("watchOrders") => nothing,
        Symbol("watchOrdersForSymbols") => nothing,
        Symbol("watchPosition") => nothing,
        Symbol("watchPositions") => nothing,
        Symbol("watchStatus") => nothing,
        Symbol("watchTicker") => nothing,
        Symbol("watchTickers") => nothing,
        Symbol("watchTrades") => nothing,
        Symbol("watchTradesForSymbols") => nothing,
        Symbol("watchLiquidations") => nothing,
        Symbol("watchLiquidationsForSymbols") => nothing,
        Symbol("watchMyLiquidations") => nothing,
        Symbol("unWatchOrders") => nothing,
        Symbol("unWatchTrades") => nothing,
        Symbol("unWatchTradesForSymbols") => nothing,
        Symbol("unWatchOHLCVForSymbols") => nothing,
        Symbol("unWatchOrderBookForSymbols") => nothing,
        Symbol("unWatchPositions") => nothing,
        Symbol("unWatchOrderBook") => nothing,
        Symbol("unWatchTickers") => nothing,
        Symbol("unWatchMyTrades") => nothing,
        Symbol("unWatchTicker") => nothing,
        Symbol("unWatchOHLCV") => nothing,
        Symbol("watchMyLiquidationsForSymbols") => nothing,
        Symbol("withdraw") => nothing,
        Symbol("ws") => nothing
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => nothing,
        Symbol("api") => nothing,
        Symbol("test") => nothing,
        Symbol("www") => nothing,
        Symbol("doc") => nothing,
        Symbol("api_management") => nothing,
        Symbol("fees") => nothing,
        Symbol("referral") => nothing
    ),
    Symbol("api") => nothing,
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => true,
        Symbol("secret") => true,
        Symbol("uid") => false,
        Symbol("accountId") => false,
        Symbol("login") => false,
        Symbol("password") => false,
        Symbol("twofa") => false,
        Symbol("privateKey") => false,
        Symbol("walletAddress") => false,
        Symbol("token") => false
    ),
    Symbol("markets") => nothing,
    Symbol("currencies") => Dict{Symbol, Any}(),
    Symbol("timeframes") => nothing,
    Symbol("fees") => Dict{Symbol, Any}(
        Symbol("trading") => Dict{Symbol, Any}(
            Symbol("tierBased") => nothing,
            Symbol("percentage") => nothing,
            Symbol("taker") => nothing,
            Symbol("maker") => nothing
        ),
        Symbol("funding") => Dict{Symbol, Any}(
            Symbol("tierBased") => nothing,
            Symbol("percentage") => nothing,
            Symbol("withdraw") => Dict{Symbol, Any}(),
            Symbol("deposit") => Dict{Symbol, Any}()
        )
    ),
    Symbol("status") => Dict{Symbol, Any}(
        Symbol("status") => "ok",
        Symbol("updated") => nothing,
        Symbol("eta") => nothing,
        Symbol("url") => nothing,
        Symbol("info") => nothing
    ),
    Symbol("exceptions") => nothing,
    Symbol("httpExceptions") => Dict{Symbol, Any}(
        Symbol("422") => ExchangeError,
        Symbol("418") => DDoSProtection,
        Symbol("429") => RateLimitExceeded,
        Symbol("404") => ExchangeNotAvailable,
        Symbol("409") => ExchangeNotAvailable,
        Symbol("410") => ExchangeNotAvailable,
        Symbol("451") => ExchangeNotAvailable,
        Symbol("500") => ExchangeNotAvailable,
        Symbol("501") => ExchangeNotAvailable,
        Symbol("502") => ExchangeNotAvailable,
        Symbol("520") => ExchangeNotAvailable,
        Symbol("521") => ExchangeNotAvailable,
        Symbol("522") => ExchangeNotAvailable,
        Symbol("525") => ExchangeNotAvailable,
        Symbol("526") => ExchangeNotAvailable,
        Symbol("400") => ExchangeNotAvailable,
        Symbol("403") => ExchangeNotAvailable,
        Symbol("405") => ExchangeNotAvailable,
        Symbol("503") => ExchangeNotAvailable,
        Symbol("530") => ExchangeNotAvailable,
        Symbol("408") => RequestTimeout,
        Symbol("504") => RequestTimeout,
        Symbol("401") => AuthenticationError,
        Symbol("407") => AuthenticationError,
        Symbol("511") => AuthenticationError
    ),
    Symbol("commonCurrencies") => Dict{Symbol, Any}(
        Symbol("XBT") => "BTC",
        Symbol("BCHSV") => "BSV"
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("paddingMode") => NO_PADDING,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("rollingWindowSize") => 60000
)

end
function cleanRestData(self::CcxtExchange, )
    self.ids = nothing;
    self.markets = nothing;
    self.markets_by_id = nothing;
    self.symbols = [];
    self.codes = nothing;
    self.currencies = self.createSafeDictionary();
    self.currencies_by_id = nothing;
    self.baseCurrencies = nothing;
    self.quoteCurrencies = nothing;
    self.last_http_response = nothing;
    self.last_response_headers = nothing;
    self.last_request_headers = nothing;

end
function cleanWsData(self::CcxtExchange, )
    self.balance = self.createSafeDictionary(isWs = true);
    self.orderbooks = self.createSafeDictionary(isWs = true);
    self.tickers = self.createSafeDictionary(isWs = true);
    self.liquidations = nothing;
    self.myLiquidations = nothing;
    self.orders = nothing;
    self.trades = self.createSafeDictionary(isWs = true);
    self.transactions = self.createSafeDictionary();
    self.ohlcvs = self.createSafeDictionary(isWs = true);
    self.myTrades = nothing;
    self.positions = nothing;

end
function safeBoolN(self::CcxtExchange, dictionaryOrList, keys; defaultValue=nothing)
    value = safeValueN(dictionaryOrList, keys, defaultValue);
    if functions.ccxtruthy(isa(value, Bool))
            return value
    end
    return defaultValue

end
function safeBool2(self::CcxtExchange, dictionaryOrList, key1, key2; defaultValue=nothing)
    value = safeValue(dictionaryOrList, key1);
    if functions.ccxtruthy(isa(value, Bool))
            return value
    end
    value2 = safeValue(dictionaryOrList, key2);
    if functions.ccxtruthy(isa(value2, Bool))
            return value2
    end
    return defaultValue

end
function safeBool(self::CcxtExchange, dictionaryOrList, key; defaultValue=nothing)
    value = safeValue(dictionaryOrList, key, defaultValue);
    if functions.ccxtruthy(isa(value, Bool))
            return value
    end
    return defaultValue

end
function safeDictN(self::CcxtExchange, dictionaryOrList, keys; defaultValue)

end
function safeDictN(self::CcxtExchange, dictionaryOrList, keys; defaultValue=nothing)

end
function safeDictN(self::CcxtExchange, dictionaryOrList, keys; defaultValue=nothing)
    value = safeValueN(dictionaryOrList, keys, defaultValue);
    if functions.ccxtruthy(value == nothing)
            return defaultValue
    end
    if functions.ccxtruthy(self.isDictionary(value))
            return value
    end
    return defaultValue

end
function safeDict(self::CcxtExchange, dictionaryOrList, key; defaultValue)

end
function safeDict(self::CcxtExchange, dictionaryOrList, key; defaultValue=nothing)

end
function safeDict(self::CcxtExchange, dictionaryOrList, key; defaultValue=nothing)
    value = safeValue(dictionaryOrList, key, defaultValue);
    if functions.ccxtruthy(value == nothing)
            return defaultValue
    end
    if functions.ccxtruthy(self.isDictionary(value))
            return value
    end
    return defaultValue

end
function safeDict2(self::CcxtExchange, dictionaryOrList, key1, key2; defaultValue)

end
function safeDict2(self::CcxtExchange, dictionaryOrList, key1, key2; defaultValue=nothing)

end
function safeDict2(self::CcxtExchange, dictionaryOrList, key1, key2; defaultValue=nothing)
    value = safeValue(dictionaryOrList, key1);
    if functions.ccxtruthy(self.isDictionary(value))
            return value
    end
    value2 = safeValue(dictionaryOrList, key2);
    if functions.ccxtruthy(self.isDictionary(value2))
            return value2
    end
    return defaultValue

end
function safeListN(self::CcxtExchange, dictionaryOrList, keys; defaultValue)

end
function safeListN(self::CcxtExchange, dictionaryOrList, keys; defaultValue=nothing)

end
function safeListN(self::CcxtExchange, dictionaryOrList, keys; defaultValue=nothing)
    value = safeValueN(dictionaryOrList, keys, defaultValue);
    if functions.ccxtruthy(value == nothing)
            return defaultValue
    end
    if functions.ccxtruthy(functions.ccxt_isArray(value))
            return value
    end
    return defaultValue

end
function isDictionary(self::CcxtExchange, value)
    return @functions.ccxt_and(@functions.ccxt_and((value != nothing), (isa(value, Dict))), !functions.ccxtruthy(functions.ccxt_isArray(value)))

end
function safeList2(self::CcxtExchange, dictionaryOrList, key1, key2; defaultValue)

end
function safeList2(self::CcxtExchange, dictionaryOrList, key1, key2; defaultValue=nothing)

end
function safeList2(self::CcxtExchange, dictionaryOrList, key1, key2; defaultValue=nothing)
    value = safeValue(dictionaryOrList, key1);
    if functions.ccxtruthy(@functions.ccxt_and((value != nothing), functions.ccxt_isArray(value)))
            return value
    end
    value2 = safeValue(dictionaryOrList, key2);
    if functions.ccxtruthy(@functions.ccxt_and((value2 != nothing), functions.ccxt_isArray(value2)))
            return value2
    end
    return defaultValue

end
function safeList(self::CcxtExchange, dictionaryOrList, key; defaultValue)

end
function safeList(self::CcxtExchange, dictionaryOrList, key; defaultValue=nothing)

end
function safeList(self::CcxtExchange, dictionaryOrList, key; defaultValue=nothing)
    value = safeValue(dictionaryOrList, key, defaultValue);
    if functions.ccxtruthy(value == nothing)
            return defaultValue
    end
    if functions.ccxtruthy(functions.ccxt_isArray(value))
            return value
    end
    return defaultValue

end
function storeByKey(self::CcxtExchange, dict, key, value)
    k = key;
    if functions.ccxtruthy(k != nothing)
        dict[Symbol(k)] = value;
    end

end
function handleDeltas(self::CcxtExchange, orderbook, deltas)
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(deltas)))
        self.handleDelta(orderbook, get(deltas, i + 1, nothing));
        i += 1
    end

end
function handleDelta(self::CcxtExchange, bookside, delta)
    throw(NotSupported(string(self.id, " handleDelta not supported yet")));

end
function handleDeltasWithKeys(self::CcxtExchange, bookSide, deltas; priceKey=0, amountKey=1, countOrIdKey=2)
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(deltas)))
        bidAsk = self.parseOrderBookBidAsk(get(deltas, i + 1, nothing), priceKey = priceKey, amountKey = amountKey, countOrIdKey = countOrIdKey);
        storeArray(bookSide, bidAsk);
        i += 1
    end

end
function getCacheIndex(self::CcxtExchange, orderbook, deltas)
    return -1

end
function arraysConcat(self::CcxtExchange, arraysOfArrays)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(arraysOfArrays)))
        result = arrayConcat(result, get(arraysOfArrays, i + 1, nothing));
        i += 1
    end
    return result

end
function findTimeframe(self::CcxtExchange, timeframe; timeframes=nothing)
    if functions.ccxtruthy(timeframes == nothing)
        timeframes = self.timeframes;
    end
    keys_var = objectKeys(timeframes);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        if functions.ccxtruthy(get(timeframes, Symbol(key), nothing) == timeframe)
                return key
        end
        i += 1
    end
    return nothing

end
function checkProxyUrlSettings(self::CcxtExchange; url=nothing, method=nothing, headers=nothing, body=nothing)
    usedProxies = [];
    proxyUrl = nothing;
    if functions.ccxtruthy(self.proxyUrl != nothing)
                push!(usedProxies, "proxyUrl");
        proxyUrl = self.proxyUrl;
    end
    if functions.ccxtruthy(self.proxy_url != nothing)
                push!(usedProxies, "proxy_url");
        proxyUrl = self.proxy_url;
    end
    if functions.ccxtruthy(self.proxyUrlCallback != nothing)
                push!(usedProxies, "proxyUrlCallback");
        proxyUrl = self.proxyUrlCallback(url, method, headers, body);
    end
    if functions.ccxtruthy(self.proxy_url_callback != nothing)
                push!(usedProxies, "proxy_url_callback");
        proxyUrl = self.proxy_url_callback(url, method, headers, body);
    end
    if functions.ccxtruthy(self.proxy != nothing)
                push!(usedProxies, "proxy");
        if functions.ccxtruthy(typeof(self.proxy) == "function")
            proxyUrl = self.proxy(url, method, headers, body);
        else
            proxyUrl = self.proxy;
        end
    end
    len = length(usedProxies);
    if functions.ccxtruthy(functions.ccxt_gt(len, 1))
        joinedProxyNames = join(usedProxies, ",");
        throw(InvalidProxySettings(string(self.id, " you have multiple conflicting proxy settings (", joinedProxyNames, "), please use only one from : proxyUrl, proxy_url, proxyUrlCallback, proxy_url_callback")));
    end
    return proxyUrl

end
function urlEncoderForProxyUrl(self::CcxtExchange, targetUrl)
    includesQuery = findfirst("?", targetUrl) !== nothing;
    finalUrl = functions.ccxtruthy(includesQuery) ? self.encodeURIComponent(targetUrl) : targetUrl;
    return finalUrl

end
function checkProxySettings(self::CcxtExchange; url=nothing, method=nothing, headers=nothing, body=nothing)
    usedProxies = [];
    httpProxy = nothing;
    httpsProxy = nothing;
    socksProxy = nothing;
    isHttpProxyDefined = self.valueIsDefined(self.httpProxy);
    isHttp_proxy_defined = self.valueIsDefined(self.http_proxy);
    if functions.ccxtruthy(@functions.ccxt_or(isHttpProxyDefined, isHttp_proxy_defined))
                push!(usedProxies, "httpProxy");
        httpProxy = functions.ccxtruthy(isHttpProxyDefined) ? self.httpProxy : self.http_proxy;
    end
    ishttpProxyCallbackDefined = self.valueIsDefined(self.httpProxyCallback);
    ishttp_proxy_callback_defined = self.valueIsDefined(self.http_proxy_callback);
    if functions.ccxtruthy(@functions.ccxt_or(ishttpProxyCallbackDefined, ishttp_proxy_callback_defined))
                push!(usedProxies, "httpProxyCallback");
        httpProxy = functions.ccxtruthy(ishttpProxyCallbackDefined) ? self.httpProxyCallback(url, method, headers, body) : self.http_proxy_callback(url, method, headers, body);
    end
    isHttpsProxyDefined = self.valueIsDefined(self.httpsProxy);
    isHttps_proxy_defined = self.valueIsDefined(self.https_proxy);
    if functions.ccxtruthy(@functions.ccxt_or(isHttpsProxyDefined, isHttps_proxy_defined))
                push!(usedProxies, "httpsProxy");
        httpsProxy = functions.ccxtruthy(isHttpsProxyDefined) ? self.httpsProxy : self.https_proxy;
    end
    ishttpsProxyCallbackDefined = self.valueIsDefined(self.httpsProxyCallback);
    ishttps_proxy_callback_defined = self.valueIsDefined(self.https_proxy_callback);
    if functions.ccxtruthy(@functions.ccxt_or(ishttpsProxyCallbackDefined, ishttps_proxy_callback_defined))
                push!(usedProxies, "httpsProxyCallback");
        httpsProxy = functions.ccxtruthy(ishttpsProxyCallbackDefined) ? self.httpsProxyCallback(url, method, headers, body) : self.https_proxy_callback(url, method, headers, body);
    end
    isSocksProxyDefined = self.valueIsDefined(self.socksProxy);
    isSocks_proxy_defined = self.valueIsDefined(self.socks_proxy);
    if functions.ccxtruthy(@functions.ccxt_or(isSocksProxyDefined, isSocks_proxy_defined))
                push!(usedProxies, "socksProxy");
        socksProxy = functions.ccxtruthy(isSocksProxyDefined) ? self.socksProxy : self.socks_proxy;
    end
    issocksProxyCallbackDefined = self.valueIsDefined(self.socksProxyCallback);
    issocks_proxy_callback_defined = self.valueIsDefined(self.socks_proxy_callback);
    if functions.ccxtruthy(@functions.ccxt_or(issocksProxyCallbackDefined, issocks_proxy_callback_defined))
                push!(usedProxies, "socksProxyCallback");
        socksProxy = functions.ccxtruthy(issocksProxyCallbackDefined) ? self.socksProxyCallback(url, method, headers, body) : self.socks_proxy_callback(url, method, headers, body);
    end
    len = length(usedProxies);
    if functions.ccxtruthy(functions.ccxt_gt(len, 1))
        joinedProxyNames = join(usedProxies, ",");
        throw(InvalidProxySettings(string(self.id, " you have multiple conflicting proxy settings (", joinedProxyNames, "), please use only one from: httpProxy, httpsProxy, httpProxyCallback, httpsProxyCallback, socksProxy, socksProxyCallback")));
    end
    return [httpProxy, httpsProxy, socksProxy]

end
function checkWsProxySettings(self::CcxtExchange, )
    usedProxies = [];
    wsProxy = nothing;
    wssProxy = nothing;
    wsSocksProxy = nothing;
    isWsProxyDefined = self.valueIsDefined(self.wsProxy);
    is_ws_proxy_defined = self.valueIsDefined(self.ws_proxy);
    if functions.ccxtruthy(@functions.ccxt_or(isWsProxyDefined, is_ws_proxy_defined))
                push!(usedProxies, "wsProxy");
        wsProxy = functions.ccxtruthy((isWsProxyDefined)) ? self.wsProxy : self.ws_proxy;
    end
    isWssProxyDefined = self.valueIsDefined(self.wssProxy);
    is_wss_proxy_defined = self.valueIsDefined(self.wss_proxy);
    if functions.ccxtruthy(@functions.ccxt_or(isWssProxyDefined, is_wss_proxy_defined))
                push!(usedProxies, "wssProxy");
        wssProxy = functions.ccxtruthy((isWssProxyDefined)) ? self.wssProxy : self.wss_proxy;
    end
    isWsSocksProxyDefined = self.valueIsDefined(self.wsSocksProxy);
    is_ws_socks_proxy_defined = self.valueIsDefined(self.ws_socks_proxy);
    if functions.ccxtruthy(@functions.ccxt_or(isWsSocksProxyDefined, is_ws_socks_proxy_defined))
                push!(usedProxies, "wsSocksProxy");
        wsSocksProxy = functions.ccxtruthy((isWsSocksProxyDefined)) ? self.wsSocksProxy : self.ws_socks_proxy;
    end
    len = length(usedProxies);
    if functions.ccxtruthy(functions.ccxt_gt(len, 1))
        joinedProxyNames = join(usedProxies, ",");
        throw(InvalidProxySettings(string(self.id, " you have multiple conflicting proxy settings (", joinedProxyNames, "), please use only one from: wsProxy, wssProxy, wsSocksProxy")));
    end
    return [wsProxy, wssProxy, wsSocksProxy]

end
function checkConflictingProxies(self::CcxtExchange, proxyAgentSet, proxyUrlSet)
    if functions.ccxtruthy(@functions.ccxt_and(proxyAgentSet, proxyUrlSet))
        throw(InvalidProxySettings(string(self.id, " you have multiple conflicting proxy settings, please use only one from : proxyUrl, httpProxy, httpsProxy, socksProxy")));
    end

end
function checkAddress(self::CcxtExchange; address=nothing)
    if functions.ccxtruthy(address == nothing)
        throw(InvalidAddress(string(self.id, " address is undefined")));
    end
    uniqChars = (unique(self.stringToCharsArray(address)));
    len = length(uniqChars);
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(len == 1, functions.ccxt_lt(length(address), self.minFundingAddressLength)), findfirst(" ", address) !== nothing))
        throw(InvalidAddress(string(self.id, " address is invalid or has less than ", self.minFundingAddressLength, " characters: \"", address, "\"")));
    end
    return address

end
function findMessageHashes(self::CcxtExchange, client, element)
    result = [];
    messageHashes = objectKeys(get(client, Symbol("futures"), nothing));
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(messageHashes)))
        messageHash = get(messageHashes, i + 1, nothing);
        if functions.ccxtruthy(findfirst(element, messageHash) !== nothing)
                        push!(result, messageHash);
        end
        i += 1
    end
    return result

end
function filterByLimit(self::CcxtExchange, array; limit=nothing, key="timestamp", fromStart=false)
    if functions.ccxtruthy(self.valueIsDefined(limit))
        arrayLength = length(array);
        if functions.ccxtruthy(functions.ccxt_gt(arrayLength, 0))
            ascending = true;
            if functions.ccxtruthy((ccxt_in(key, get(array, 1, nothing))))
                first_var = get(get(array, 1, nothing), Symbol(key), nothing);
                last_var = get(get(array, arrayLength - 1 + 1, nothing), Symbol(key), nothing);
                if functions.ccxtruthy(@functions.ccxt_and(first_var != nothing, last_var != nothing))
                    ascending = functions.ccxt_le(first_var, last_var);
                end
            end
            if functions.ccxtruthy(fromStart)
                if functions.ccxtruthy(functions.ccxt_gt(limit, arrayLength))
                    limit = arrayLength;
                end
                if functions.ccxtruthy(ascending)
                    array = self.arraySlice(array, 0, second = limit);
                else
                    array = self.arraySlice(array, -limit);
                end
            else
                if functions.ccxtruthy(ascending)
                    array = self.arraySlice(array, -limit);
                else
                    array = self.arraySlice(array, 0, second = limit);
                end
            end
        end
    end
    return array

end
function filterBySinceLimit(self::CcxtExchange, array; since=nothing, limit=nothing, key="timestamp", tail=false)
    if functions.ccxtruthy(array == nothing)
            return []
    end
    sinceIsDefined = self.valueIsDefined(since);
    parsedArray = toArray(array);
    result = parsedArray;
    if functions.ccxtruthy(sinceIsDefined)
        result = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(parsedArray)))
            entry = get(parsedArray, i + 1, nothing);
            value = safeValue(entry, key);
            if functions.ccxtruthy(@functions.ccxt_and(value, (functions.ccxt_ge(value, since))))
                                push!(result, entry);
            end
            i += 1
        end

    end
    if functions.ccxtruthy(@functions.ccxt_and(tail, limit != nothing))
            return self.arraySlice(result, -limit)
    end
    shouldFilterFromStart = @functions.ccxt_and(!functions.ccxtruthy(tail), sinceIsDefined);
    return self.filterByLimit(result, limit = limit, key = key, fromStart = shouldFilterFromStart)

end
function filterByValueSinceLimit(self::CcxtExchange, array, field; value=nothing, since=nothing, limit=nothing, key="timestamp", tail=false)
    valueIsDefined = self.valueIsDefined(value);
    sinceIsDefined = self.valueIsDefined(since);
    parsedArray = toArray(array);
    result = parsedArray;
    if functions.ccxtruthy(@functions.ccxt_or(valueIsDefined, sinceIsDefined))
        result = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(parsedArray)))
            entry = get(parsedArray, i + 1, nothing);
            entryFiledEqualValue = safeValue(entry, field) == value;
            firstCondition = functions.ccxtruthy(valueIsDefined) ? entryFiledEqualValue : true;
            entryKeyValue = safeValue(entry, key);
            entryKeyGESince = @functions.ccxt_and(@functions.ccxt_and((entryKeyValue), (since != nothing)), (functions.ccxt_ge(entryKeyValue, since)));
            secondCondition = functions.ccxtruthy(sinceIsDefined) ? entryKeyGESince : true;
            if functions.ccxtruthy(@functions.ccxt_and(firstCondition, secondCondition))
                                push!(result, entry);
            end
            i += 1
        end

    end
    if functions.ccxtruthy(@functions.ccxt_and(tail, limit != nothing))
            return self.arraySlice(result, -limit)
    end
    return self.filterByLimit(result, limit = limit, key = key, fromStart = sinceIsDefined)

end
"""
set the sandbox mode for the exchange

# Arguments
- `enabled`::bool: true to enable sandbox mode, false to disable it
"""
function setSandboxMode(self::CcxtExchange, enabled)
    if functions.ccxtruthy(enabled)
        if functions.ccxtruthy(ccxt_in("test", self.urls))
            if functions.ccxtruthy(isa(get(self.urls, Symbol("api"), nothing), AbstractString))
                self.urls[Symbol("apiBackup")] = get(self.urls, Symbol("api"), nothing);
                self.urls[Symbol("api")] = get(self.urls, Symbol("test"), nothing);
            else
                self.urls[Symbol("apiBackup")] = clone(get(self.urls, Symbol("api"), nothing));
                self.urls[Symbol("api")] = clone(get(self.urls, Symbol("test"), nothing));
            end
        else
            throw(NotSupported(string(self.id, " does not have a sandbox URL")));
        end
        self.isSandboxModeEnabled = true;
    elseif functions.ccxtruthy(ccxt_in("apiBackup", self.urls))
        if functions.ccxtruthy(isa(get(self.urls, Symbol("api"), nothing), AbstractString))
            self.urls[Symbol("api")] = get(self.urls, Symbol("apiBackup"), nothing);
        else
            self.urls[Symbol("api")] = clone(get(self.urls, Symbol("apiBackup"), nothing));
        end
        newUrls = omit(self.urls, "apiBackup");
        self.urls = newUrls;
        self.isSandboxModeEnabled = false;
    end

end
"""
enables or disables demo trading mode

# Arguments
- `enable`::bool, optional: true if demo trading should be enabled, false otherwise
"""
function enableDemoTrading(self::CcxtExchange, enable)
    if functions.ccxtruthy(self.isSandboxModeEnabled)
        throw(NotSupported(string(self.id, " demo trading does not support in sandbox environment. Please check https://www.binance.com/en/support/faq/detail/9be58f73e5e14338809e3b705b9687dd to see the differences")));
    end
    if functions.ccxtruthy(enable)
        self.urls[Symbol("apiBackupDemoTrading")] = get(self.urls, Symbol("api"), nothing);
        self.urls[Symbol("api")] = get(self.urls, Symbol("demo"), nothing);
    elseif functions.ccxtruthy(ccxt_in("apiBackupDemoTrading", self.urls))
        self.urls[Symbol("api")] = get(self.urls, Symbol("apiBackupDemoTrading"), nothing);
        newUrls = omit(self.urls, "apiBackupDemoTrading");
        self.urls = newUrls;
    end
    self.options[Symbol("enableDemoTrading")] = enable;

end
function sign(self::CcxtExchange, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    return Dict{Symbol, Any}(
    Symbol("url") => nothing,
    Symbol("method") => nothing,
    Symbol("headers") => nothing,
    Symbol("body") => nothing
)

end
function fetchAccounts(self::CcxtExchange; params=Dict())
    throw(NotSupported(string(self.id, " fetchAccounts() is not supported yet")));

end
function watchLiquidations(self::CcxtExchange, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("watchLiquidationsForSymbols"), nothing))
            return self.watchLiquidationsForSymbols([symbol], since = since, limit = limit, params = params)
    end
    throw(NotSupported(string(self.id, " watchLiquidations() is not supported yet")));

end
function watchLiquidationsForSymbols(self::CcxtExchange, symbols; since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchLiquidationsForSymbols() is not supported yet")));

end
function watchMyLiquidations(self::CcxtExchange, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("watchMyLiquidationsForSymbols"), nothing))
            return self.watchMyLiquidationsForSymbols([symbol], since = since, limit = limit, params = params)
    end
    throw(NotSupported(string(self.id, " watchMyLiquidations() is not supported yet")));

end
function watchMyLiquidationsForSymbols(self::CcxtExchange, symbols; since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchMyLiquidationsForSymbols() is not supported yet")));

end
function unWatchOrders(self::CcxtExchange; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " unWatchOrders() is not supported yet")));

end
function unWatchTrades(self::CcxtExchange, symbol; params=Dict())
    throw(NotSupported(string(self.id, " unWatchTrades() is not supported yet")));

end
function unWatchTradesForSymbols(self::CcxtExchange, symbols; params=Dict())
    throw(NotSupported(string(self.id, " unWatchTradesForSymbols() is not supported yet")));

end
function watchOHLCVForSymbols(self::CcxtExchange, symbolsAndTimeframes; since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchOHLCVForSymbols() is not supported yet")));

end
function unWatchOHLCVForSymbols(self::CcxtExchange, symbolsAndTimeframes; params=Dict())
    throw(NotSupported(string(self.id, " unWatchOHLCVForSymbols() is not supported yet")));

end
function unWatchOrderBookForSymbols(self::CcxtExchange, symbols; params=Dict())
    throw(NotSupported(string(self.id, " unWatchOrderBookForSymbols() is not supported yet")));

end
function unWatchPositions(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " unWatchPositions() is not supported yet")));

end
function unWatchTicker(self::CcxtExchange, symbol; params=Dict())
    throw(NotSupported(string(self.id, " unWatchTicker() is not supported yet")));

end
function unWatchMarkPrice(self::CcxtExchange, symbol; params=Dict())
    throw(NotSupported(string(self.id, " unWatchMarkPrice() is not supported yet")));

end
function unWatchMarkPrices(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " unWatchMarkPrices() is not supported yet")));

end
function fetchDepositAddresses(self::CcxtExchange; codes=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchDepositAddresses() is not supported yet")));

end
function fetchMarginMode(self::CcxtExchange, symbol; params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchMarginModes"), nothing))
        marginModes = self.fetchMarginModes(symbols = [symbol], params = params);
            return self.safeDict(marginModes, symbol)
    else
        throw(NotSupported(string(self.id, " fetchMarginMode() is not supported yet")));
    end

end
function fetchMarginModes(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchMarginModes () is not supported yet")));

end
function unWatchOrderBook(self::CcxtExchange, symbol; params=Dict())
    throw(NotSupported(string(self.id, " unWatchOrderBook() is not supported yet")));

end
function fetchTime(self::CcxtExchange; params=Dict())
    throw(NotSupported(string(self.id, " fetchTime() is not supported yet")));

end
function fetchTradingLimits(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchTradingLimits() is not supported yet")));

end
function parseCurrency(self::CcxtExchange, rawCurrency)
    throw(NotSupported(string(self.id, " parseCurrency() is not supported yet")));

end
function parseCurrencies(self::CcxtExchange, rawCurrencies)
    result = Dict{Symbol, Any}();
    arr = toArray(rawCurrencies);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(arr)))
        parsed = self.parseCurrency(get(arr, i + 1, nothing));
        if functions.ccxtruthy(parsed == nothing)
            i += 1; continue
        end
        code = get(parsed, Symbol("code"), nothing);
        result[Symbol(code)] = parsed;
        i += 1
    end
    return result

end
function parseMarket(self::CcxtExchange, market)
    throw(NotSupported(string(self.id, " parseMarket() is not supported yet")));

end
function parseMarkets(self::CcxtExchange, markets)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
        push!(result, self.parseMarket(get(markets, i + 1, nothing)));
        i += 1
    end
    return result

end
function parseTicker(self::CcxtExchange, ticker; market=nothing)
    throw(NotSupported(string(self.id, " parseTicker() is not supported yet")));

end
function parseDepositAddress(self::CcxtExchange, depositAddress; currency=nothing)
    throw(NotSupported(string(self.id, " parseDepositAddress() is not supported yet")));

end
function parseTrade(self::CcxtExchange, trade; market=nothing)
    throw(NotSupported(string(self.id, " parseTrade() is not supported yet")));

end
function parseTransaction(self::CcxtExchange, transaction; currency=nothing)
    throw(NotSupported(string(self.id, " parseTransaction() is not supported yet")));

end
function parseTransfer(self::CcxtExchange, transfer; currency=nothing)
    if functions.ccxtruthy(transfer == nothing)
        throw(NotSupported(string(self.id, " parseTransfer() is not supported yet")));
    end
    throw(NotSupported(string(self.id, " parseTransfer() is not supported yet")));

end
function parseAccount(self::CcxtExchange, account)
    throw(NotSupported(string(self.id, " parseAccount() is not supported yet")));

end
function parseLedgerEntry(self::CcxtExchange, item; currency=nothing)
    throw(NotSupported(string(self.id, " parseLedgerEntry() is not supported yet")));

end
function parseOrder(self::CcxtExchange, order; market=nothing)
    throw(NotSupported(string(self.id, " parseOrder() is not supported yet")));

end
function fetchCrossBorrowRates(self::CcxtExchange; params=Dict())
    throw(NotSupported(string(self.id, " fetchCrossBorrowRates() is not supported yet")));

end
function fetchIsolatedBorrowRates(self::CcxtExchange; params=Dict())
    throw(NotSupported(string(self.id, " fetchIsolatedBorrowRates() is not supported yet")));

end
function parseMarketLeverageTiers(self::CcxtExchange, info; market=nothing)
    throw(NotSupported(string(self.id, " parseMarketLeverageTiers() is not supported yet")));

end
function fetchLeverageTiers(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchLeverageTiers() is not supported yet")));

end
function parsePosition(self::CcxtExchange, position; market=nothing)
    throw(NotSupported(string(self.id, " parsePosition() is not supported yet")));

end
function parseFundingRateHistory(self::CcxtExchange, info; market=nothing)
    throw(NotSupported(string(self.id, " parseFundingRateHistory() is not supported yet")));

end
function parseBorrowInterest(self::CcxtExchange, info; market=nothing)
    throw(NotSupported(string(self.id, " parseBorrowInterest() is not supported yet")));

end
function parseIsolatedBorrowRate(self::CcxtExchange, info; market=nothing)
    throw(NotSupported(string(self.id, " parseIsolatedBorrowRate() is not supported yet")));

end
function parseWsTrade(self::CcxtExchange, trade; market=nothing)
    throw(NotSupported(string(self.id, " parseWsTrade() is not supported yet")));

end
function parseWsOrder(self::CcxtExchange, order; market=nothing)
    throw(NotSupported(string(self.id, " parseWsOrder() is not supported yet")));

end
function parseWsOrderTrade(self::CcxtExchange, trade; market=nothing)
    throw(NotSupported(string(self.id, " parseWsOrderTrade() is not supported yet")));

end
function parseWsOHLCV(self::CcxtExchange, ohlcv; market=nothing)
    return self.parseOHLCV(ohlcv, market = market)

end
function fetchFundingRates(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchFundingRates() is not supported yet")));

end
function fetchFundingIntervals(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchFundingIntervals() is not supported yet")));

end
function watchFundingRate(self::CcxtExchange, symbol; params=Dict())
    throw(NotSupported(string(self.id, " watchFundingRate() is not supported yet")));

end
function watchFundingRates(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchFundingRates() is not supported yet")));

end
function unWatchFundingRates(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " unWatchFundingRates() is not supported yet")));

end
function watchFundingRatesForSymbols(self::CcxtExchange, symbols; params=Dict())
    return self.watchFundingRates(symbols = symbols, params = params)

end
function transfer(self::CcxtExchange, code, amount, fromAccount, toAccount; params=Dict())
    throw(NotSupported(string(self.id, " transfer() is not supported yet")));

end
function withdraw(self::CcxtExchange, code, amount, address; tag=nothing, params=Dict())
    throw(NotSupported(string(self.id, " withdraw() is not supported yet")));

end
function createDepositAddress(self::CcxtExchange, code; params=Dict())
    throw(NotSupported(string(self.id, " createDepositAddress() is not supported yet")));

end
function setLeverage(self::CcxtExchange, leverage; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " setLeverage() is not supported yet")));

end
function fetchLeverage(self::CcxtExchange, symbol; params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchLeverages"), nothing))
        leverages = self.fetchLeverages(symbols = [symbol], params = params);
            return self.safeDict(leverages, symbol)
    else
        throw(NotSupported(string(self.id, " fetchLeverage() is not supported yet")));
    end

end
function fetchLeverages(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchLeverages() is not supported yet")));

end
function setPositionMode(self::CcxtExchange, hedged; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " setPositionMode() is not supported yet")));

end
function addMargin(self::CcxtExchange, symbol, amount; params=Dict())
    throw(NotSupported(string(self.id, " addMargin() is not supported yet")));

end
function reduceMargin(self::CcxtExchange, symbol, amount; params=Dict())
    throw(NotSupported(string(self.id, " reduceMargin() is not supported yet")));

end
function setMargin(self::CcxtExchange, symbol, amount; params=Dict())
    throw(NotSupported(string(self.id, " setMargin() is not supported yet")));

end
function fetchLongShortRatio(self::CcxtExchange, symbol; timeframe=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchLongShortRatio() is not supported yet")));

end
function fetchLongShortRatioHistory(self::CcxtExchange; symbol=nothing, timeframe=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchLongShortRatioHistory() is not supported yet")));

end
function fetchMarginAdjustmentHistory(self::CcxtExchange; symbol=nothing, type_var=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchMarginAdjustmentHistory() is not supported yet")));

end
function setMarginMode(self::CcxtExchange, marginMode; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " setMarginMode() is not supported yet")));

end
function fetchDepositAddressesByNetwork(self::CcxtExchange, code; params=Dict())
    throw(NotSupported(string(self.id, " fetchDepositAddressesByNetwork() is not supported yet")));

end
function fetchOpenInterestHistory(self::CcxtExchange, symbol; timeframe="1h", since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchOpenInterestHistory() is not supported yet")));

end
function fetchOpenInterests(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchOpenInterests() is not supported yet")));

end
function signIn(self::CcxtExchange; params=Dict())
    throw(NotSupported(string(self.id, " signIn() is not supported yet")));

end
function fetchPaymentMethods(self::CcxtExchange; params=Dict())
    throw(NotSupported(string(self.id, " fetchPaymentMethods() is not supported yet")));

end
function parseToInt(self::CcxtExchange, number)
    stringifiedNumber = numberToString(number);
    convertedNumber = ccxt_toNumber(stringifiedNumber);
    return ccxt_parseInt(convertedNumber)

end
function parseToNumeric(self::CcxtExchange, number)
    stringVersion = numberToString(number);
    if functions.ccxtruthy(findfirst(".", stringVersion) !== nothing)
            return ccxt_toNumber(stringVersion)
    end
    return ccxt_parseInt(stringVersion)

end
function isRoundNumber(self::CcxtExchange, value)
    res = self.parseToNumeric((value % 1));
    return res == 0

end
function isEmptyString(self::CcxtExchange, value)
    return @functions.ccxt_or(!functions.ccxtruthy(self.valueIsDefined(value)), value == "")

end
function safeNumberOmitZero(self::CcxtExchange, obj, key; defaultValue=nothing)
    value = safeString(obj, key);
    final = self.parseNumber(omitZero(value));
    return functions.ccxtruthy((final == nothing)) ? defaultValue : final

end
function safeIntegerOmitZero(self::CcxtExchange, obj, key; defaultValue=nothing)
    timestamp = safeInteger(obj, key, defaultValue);
    if functions.ccxtruthy(@functions.ccxt_or(timestamp == nothing, timestamp == 0))
            return nothing
    end
    return timestamp

end
function afterConstruct(self::CcxtExchange, )
    self.createNetworksByIdObject();
    self.featuresGenerator();
    if functions.ccxtruthy(self.markets)
        self.setMarkets(self.markets);
    end
    self.initRestRateLimiter();
    isSandbox = self.safeBool2(self.options, "sandbox", "testnet", defaultValue = false);
    if functions.ccxtruthy(isSandbox)
        self.setSandboxMode(isSandbox);
    end

end
function initRestRateLimiter(self::CcxtExchange, )
    if functions.ccxtruthy(@functions.ccxt_or(self.rateLimit == nothing, (@functions.ccxt_and(self.id != nothing, self.rateLimit == -1))))
        throw(ExchangeError(string(self.id, ".rateLimit property is not configured")));
    end
    refillRate = self.MAX_VALUE;
    if functions.ccxtruthy(functions.ccxt_gt(self.rateLimit, 0))
        refillRate = 1 / self.rateLimit;
    end
    useLeaky = @functions.ccxt_or((self.rollingWindowSize == 0), (self.rateLimiterAlgorithm == "leakyBucket"));
    algorithm = functions.ccxtruthy(useLeaky) ? "leakyBucket" : "rollingWindow";
    defaultBucket = Dict{Symbol, Any}(
        Symbol("delay") => 0.001,
        Symbol("capacity") => 1,
        Symbol("cost") => 1,
        Symbol("refillRate") => refillRate,
        Symbol("algorithm") => algorithm,
        Symbol("windowSize") => self.rollingWindowSize,
        Symbol("rateLimit") => self.rateLimit
    );
    existingBucket = functions.ccxtruthy((self.tokenBucket == nothing)) ? Dict{Symbol, Any}() : self.tokenBucket;
    self.tokenBucket = extend(defaultBucket, existingBucket);
    self.initThrottler();

end
function featuresGenerator(self::CcxtExchange, )
    if functions.ccxtruthy(self.features == nothing)
            return 
    end
    initialFeatures = self.features;
    self.features = Dict{Symbol, Any}();
    unifiedMarketTypes = ["spot", "swap", "future", "option"];
    subTypes = ["linear", "inverse"];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(unifiedMarketTypes)))
        marketType = get(unifiedMarketTypes, i + 1, nothing);
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(marketType, initialFeatures))))
            self.features[Symbol(marketType)] = nothing;
        else
            if functions.ccxtruthy(marketType == "spot")
                self.features[Symbol(marketType)] = self.featuresMapper(initialFeatures, marketType);
            else
                self.features[Symbol(marketType)] = Dict{Symbol, Any}();
                j = 0
                while functions.ccxtruthy(functions.ccxt_lt(j, length(subTypes)))
                    subType = get(subTypes, j + 1, nothing);
                    self.features[Symbol(marketType)][Symbol(subType)] = self.featuresMapper(initialFeatures, marketType, subType = subType);
                    j += 1
                end
            end
        end
        i += 1
    end

end
function featuresMapper(self::CcxtExchange, initialFeatures, marketType; subType=nothing)
    featuresObj = functions.ccxtruthy((subType != nothing)) ? get(get(initialFeatures, Symbol(marketType), nothing), Symbol(subType), nothing) : get(initialFeatures, Symbol(marketType), nothing);
    if functions.ccxtruthy(featuresObj == nothing)
            return nothing
    end
    extendsStr = safeString(featuresObj, "extends");
    if functions.ccxtruthy(extendsStr != nothing)
        featuresObj = omit(featuresObj, "extends");
        extendObj = self.featuresMapper(initialFeatures, extendsStr);
        featuresObj = deepExtend(extendObj, featuresObj);
    end
    if functions.ccxtruthy(ccxt_in("createOrder", featuresObj))
        value = self.safeDict(get(featuresObj, Symbol("createOrder"), nothing), "attachedStopLossTakeProfit");
        featuresObj[Symbol("createOrder")][Symbol("stopLoss")] = value;
        featuresObj[Symbol("createOrder")][Symbol("takeProfit")] = value;
        if functions.ccxtruthy(marketType == "spot")
            featuresObj[Symbol("createOrder")][Symbol("hedged")] = false;
            if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("leverage", get(featuresObj, Symbol("createOrder"), nothing)))))
                featuresObj[Symbol("createOrder")][Symbol("leverage")] = false;
            end
        end
        if functions.ccxtruthy(self.safeBool(get(get(featuresObj, Symbol("createOrder"), nothing), Symbol("timeInForce"), nothing), "GTC") == nothing)
            featuresObj[Symbol("createOrder")][Symbol("timeInForce")][Symbol("GTC")] = true;
        end
    end
    keys_var = objectKeys(featuresObj);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        featureBlock = get(featuresObj, Symbol(key), nothing);
        if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(inArray(key, ["sandbox"])), featureBlock != nothing))
            if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("symbolRequired", featureBlock))))
                featureBlock[Symbol("symbolRequired")] = inArray(key, ["createOrder", "createOrders", "fetchOHLCV"]);
            end
        end
        i += 1
    end
    return featuresObj

end
function featureValue(self::CcxtExchange, symbol; methodName=nothing, paramName=nothing, defaultValue=nothing)
    market = self.market(symbol);
    return self.featureValueByType(get(market, Symbol("type"), nothing), get(market, Symbol("subType"), nothing), methodName = methodName, paramName = paramName, defaultValue = defaultValue)

end
function featureValueByType(self::CcxtExchange, marketType, subType; methodName=nothing, paramName=nothing, defaultValue=nothing)
    if functions.ccxtruthy(self.features == nothing)
            return defaultValue
    end
    if functions.ccxtruthy(marketType == nothing)
            return defaultValue
    end
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(marketType, self.features))))
            return defaultValue
    end
    if functions.ccxtruthy(get(self.features, Symbol(marketType), nothing) == nothing)
            return defaultValue
    end
    methodsContainer = get(self.features, Symbol(marketType), nothing);
    if functions.ccxtruthy(subType == nothing)
        if functions.ccxtruthy(marketType != "spot")
                return defaultValue
        end
    else
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(subType, get(self.features, Symbol(marketType), nothing)))))
                return defaultValue
        end
        if functions.ccxtruthy(get(get(self.features, Symbol(marketType), nothing), Symbol(subType), nothing) == nothing)
                return defaultValue
        end
        methodsContainer = get(get(self.features, Symbol(marketType), nothing), Symbol(subType), nothing);
    end
    if functions.ccxtruthy(methodName == nothing)
            return functions.ccxtruthy((defaultValue != nothing)) ? defaultValue : methodsContainer
    end
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(methodName, methodsContainer))))
            return defaultValue
    end
    methodDict = get(methodsContainer, Symbol(methodName), nothing);
    if functions.ccxtruthy(methodDict == nothing)
            return defaultValue
    end
    if functions.ccxtruthy(paramName == nothing)
            return functions.ccxtruthy((defaultValue != nothing)) ? defaultValue : methodDict
    end
    splited = split(paramName, ".");
    parentKey = get(splited, 1, nothing);
    subKey = safeString(splited, 1);
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(parentKey, methodDict))))
            return defaultValue
    end
    dictionary = self.safeDict(methodDict, parentKey);
    if functions.ccxtruthy(dictionary == nothing)
            return get(methodDict, Symbol(parentKey), nothing)
    else
        if functions.ccxtruthy(subKey == nothing)
                return get(methodDict, Symbol(parentKey), nothing)
        end
        if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(subKey, get(methodDict, Symbol(parentKey), nothing)))))
                return defaultValue
        end
        return get(get(methodDict, Symbol(parentKey), nothing), Symbol(subKey), nothing)
    end

end
function orderbookChecksumMessage(self::CcxtExchange, symbol)
    return string(symbol, " : ", "orderbook data checksum validation failed. You can reconnect by calling watchOrderBook again or you can mute the error by setting exchange.options[\"watchOrderBook\"][\"checksum\"] = false")

end
function createNetworksByIdObject(self::CcxtExchange, )
    networkIdsToCodesGenerated = self.invertFlatStringDictionary(safeValue(self.options, "networks", Dict{Symbol, Any}()));
    self.options[Symbol("networksById")] = extend(networkIdsToCodesGenerated, safeValue(self.options, "networksById", Dict{Symbol, Any}()));

end
function getDefaultOptions(self::CcxtExchange, )
    return Dict{Symbol, Any}(
    Symbol("defaultNetworkCodeReplacements") => Dict{Symbol, Any}(
        Symbol("ETH") => Dict{Symbol, Any}(
            Symbol("primary") => "ETH",
            Symbol("secondary") => "ERC20",
            Symbol("default") => "secondary"
        ),
        Symbol("CRO") => Dict{Symbol, Any}(
            Symbol("primary") => "CRONOS",
            Symbol("secondary") => "CRC20",
            Symbol("default") => "secondary"
        ),
        Symbol("TRX") => Dict{Symbol, Any}(
            Symbol("primary") => "TRX",
            Symbol("secondary") => "TRC20",
            Symbol("default") => "secondary"
        ),
        Symbol("BTC") => Dict{Symbol, Any}(
            Symbol("primary") => "BTC",
            Symbol("secondary") => "BRC20",
            Symbol("default") => "primary"
        )
    ),
    Symbol("backwardSupportedNetworkCodes") => Dict{Symbol, Any}(
        Symbol("ARB") => "ARBITRUM",
        Symbol("ARBONE") => "ARBITRUM",
        Symbol("ARBNOVA") => "ARBITRUM_NOVA"
    )
)

end
function safeLedgerEntry(self::CcxtExchange, entry; currency=nothing)
    currency = self.safeCurrency(nothing, currency = currency);
    direction = safeString(entry, "direction");
    before = safeString(entry, "before");
    after = safeString(entry, "after");
    amount = safeString(entry, "amount");
    if functions.ccxtruthy(amount != nothing)
        if functions.ccxtruthy(@functions.ccxt_and(before == nothing, after != nothing))
            before = stringSub(after, amount);
        elseif functions.ccxtruthy(@functions.ccxt_and(before != nothing, after == nothing))
            after = stringAdd(before, amount);
        end
    end
    if functions.ccxtruthy(@functions.ccxt_and(before != nothing, after != nothing))
        if functions.ccxtruthy(direction == nothing)
            if functions.ccxtruthy(stringGt(before, after))
                direction = "out";
            end
            if functions.ccxtruthy(stringGt(after, before))
                direction = "in";
            end
        end
    end
    fee = safeValue(entry, "fee");
    if functions.ccxtruthy(fee != nothing)
        fee[Symbol("cost")] = self.safeNumber(fee, "cost");
    end
    timestamp = safeInteger(entry, "timestamp");
    info = self.safeDict(entry, "info", defaultValue = Dict{Symbol, Any}());
    return Dict{Symbol, Any}(
    Symbol("id") => safeString(entry, "id"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("direction") => direction,
    Symbol("account") => safeString(entry, "account"),
    Symbol("referenceId") => safeString(entry, "referenceId"),
    Symbol("referenceAccount") => safeString(entry, "referenceAccount"),
    Symbol("type") => safeString(entry, "type"),
    Symbol("currency") => get(currency, Symbol("code"), nothing),
    Symbol("amount") => self.parseNumber(amount),
    Symbol("before") => self.parseNumber(before),
    Symbol("after") => self.parseNumber(after),
    Symbol("status") => safeString(entry, "status"),
    Symbol("fee") => fee,
    Symbol("info") => info
)

end
function safeCurrencyStructure(self::CcxtExchange, currency)
    networks = self.safeDict(currency, "networks", defaultValue = Dict{Symbol, Any}());
    keys_var = objectKeys(networks);
    len = length(keys_var);
    if functions.ccxtruthy(len != 0)
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, len))
            key = get(keys_var, i + 1, nothing);
            network = get(networks, Symbol(key), nothing);
            deposit = self.safeBool(network, "deposit");
            currencyDeposit = self.safeBool(currency, "deposit");
            if functions.ccxtruthy(@functions.ccxt_or(currencyDeposit == nothing, deposit))
                currency[Symbol("deposit")] = deposit;
            end
            withdraw = self.safeBool(network, "withdraw");
            currencyWithdraw = self.safeBool(currency, "withdraw");
            if functions.ccxtruthy(@functions.ccxt_or(currencyWithdraw == nothing, withdraw))
                currency[Symbol("withdraw")] = withdraw;
            end
            fee = safeString(network, "fee");
            feeMain = safeString(currency, "fee");
            if functions.ccxtruthy(@functions.ccxt_or(feeMain == nothing, stringLt(fee, feeMain)))
                currency[Symbol("fee")] = self.parseNumber(fee);
            end
            precision = safeString(network, "precision");
            precisionMain = safeString(currency, "precision");
            if functions.ccxtruthy(@functions.ccxt_or(precisionMain == nothing, stringGt(precision, precisionMain)))
                currency[Symbol("precision")] = self.parseNumber(precision);
            end
            limits = self.safeDict(network, "limits");
            limitsMain = self.safeDict(currency, "limits");
            if functions.ccxtruthy(limitsMain == nothing)
                currency[Symbol("limits")] = Dict{Symbol, Any}();
            end
            limitsDeposit = self.safeDict(limits, "deposit");
            limitsDepositMain = self.safeDict(limitsMain, "deposit");
            if functions.ccxtruthy(limitsDepositMain == nothing)
                currency[Symbol("limits")][Symbol("deposit")] = Dict{Symbol, Any}();
            end
            limitsDepositMin = safeString(limitsDeposit, "min");
            limitsDepositMax = safeString(limitsDeposit, "max");
            limitsDepositMinMain = safeString(limitsDepositMain, "min");
            limitsDepositMaxMain = safeString(limitsDepositMain, "max");
            if functions.ccxtruthy(@functions.ccxt_or(limitsDepositMinMain == nothing, stringLt(limitsDepositMin, limitsDepositMinMain)))
                currency[Symbol("limits")][Symbol("deposit")][Symbol("min")] = self.parseNumber(limitsDepositMin);
            end
            if functions.ccxtruthy(@functions.ccxt_or(limitsDepositMaxMain == nothing, stringGt(limitsDepositMax, limitsDepositMaxMain)))
                currency[Symbol("limits")][Symbol("deposit")][Symbol("max")] = self.parseNumber(limitsDepositMax);
            end
            limitsWithdraw = self.safeDict(limits, "withdraw");
            limitsWithdrawMain = self.safeDict(limitsMain, "withdraw");
            if functions.ccxtruthy(limitsWithdrawMain == nothing)
                currency[Symbol("limits")][Symbol("withdraw")] = Dict{Symbol, Any}();
            end
            limitsWithdrawMin = safeString(limitsWithdraw, "min");
            limitsWithdrawMax = safeString(limitsWithdraw, "max");
            limitsWithdrawMinMain = safeString(limitsWithdrawMain, "min");
            limitsWithdrawMaxMain = safeString(limitsWithdrawMain, "max");
            if functions.ccxtruthy(@functions.ccxt_or(limitsWithdrawMinMain == nothing, stringLt(limitsWithdrawMin, limitsWithdrawMinMain)))
                currency[Symbol("limits")][Symbol("withdraw")][Symbol("min")] = self.parseNumber(limitsWithdrawMin);
            end
            if functions.ccxtruthy(@functions.ccxt_or(limitsWithdrawMaxMain == nothing, stringGt(limitsWithdrawMax, limitsWithdrawMaxMain)))
                currency[Symbol("limits")][Symbol("withdraw")][Symbol("max")] = self.parseNumber(limitsWithdrawMax);
            end
            i += 1
        end

    end
    return extend(Dict{Symbol, Any}(
    Symbol("info") => nothing,
    Symbol("id") => nothing,
    Symbol("numericId") => nothing,
    Symbol("code") => nothing,
    Symbol("precision") => nothing,
    Symbol("type") => nothing,
    Symbol("name") => nothing,
    Symbol("active") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("fee") => nothing,
    Symbol("fees") => Dict{Symbol, Any}(),
    Symbol("networks") => Dict{Symbol, Any}(),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    )
), currency)

end
function safeMarketStructure(self::CcxtExchange; market=nothing)
    cleanStructure = Dict{Symbol, Any}(
        Symbol("id") => nothing,
        Symbol("lowercaseId") => nothing,
        Symbol("symbol") => nothing,
        Symbol("base") => nothing,
        Symbol("quote") => nothing,
        Symbol("settle") => nothing,
        Symbol("baseId") => nothing,
        Symbol("quoteId") => nothing,
        Symbol("settleId") => nothing,
        Symbol("type") => nothing,
        Symbol("spot") => nothing,
        Symbol("margin") => nothing,
        Symbol("swap") => nothing,
        Symbol("future") => nothing,
        Symbol("option") => nothing,
        Symbol("index") => nothing,
        Symbol("active") => nothing,
        Symbol("contract") => nothing,
        Symbol("linear") => nothing,
        Symbol("inverse") => nothing,
        Symbol("subType") => nothing,
        Symbol("taker") => nothing,
        Symbol("maker") => nothing,
        Symbol("contractSize") => nothing,
        Symbol("expiry") => nothing,
        Symbol("expiryDatetime") => nothing,
        Symbol("strike") => nothing,
        Symbol("optionType") => nothing,
        Symbol("precision") => Dict{Symbol, Any}(
            Symbol("amount") => nothing,
            Symbol("price") => nothing,
            Symbol("cost") => nothing,
            Symbol("base") => nothing,
            Symbol("quote") => nothing
        ),
        Symbol("limits") => Dict{Symbol, Any}(
            Symbol("leverage") => Dict{Symbol, Any}(
                Symbol("min") => nothing,
                Symbol("max") => nothing
            ),
            Symbol("amount") => Dict{Symbol, Any}(
                Symbol("min") => nothing,
                Symbol("max") => nothing
            ),
            Symbol("price") => Dict{Symbol, Any}(
                Symbol("min") => nothing,
                Symbol("max") => nothing
            ),
            Symbol("cost") => Dict{Symbol, Any}(
                Symbol("min") => nothing,
                Symbol("max") => nothing
            )
        ),
        Symbol("marginModes") => Dict{Symbol, Any}(
            Symbol("cross") => nothing,
            Symbol("isolated") => nothing
        ),
        Symbol("created") => nothing,
        Symbol("info") => nothing
    );
    if functions.ccxtruthy(market != nothing)
        result = extend(cleanStructure, market);
        if functions.ccxtruthy(get(result, Symbol("spot"), nothing))
            if functions.ccxtruthy(get(result, Symbol("contract"), nothing) == nothing)
                result[Symbol("contract")] = false;
            end
            if functions.ccxtruthy(get(result, Symbol("swap"), nothing) == nothing)
                result[Symbol("swap")] = false;
            end
            if functions.ccxtruthy(get(result, Symbol("future"), nothing) == nothing)
                result[Symbol("future")] = false;
            end
            if functions.ccxtruthy(get(result, Symbol("option"), nothing) == nothing)
                result[Symbol("option")] = false;
            end
            if functions.ccxtruthy(get(result, Symbol("index"), nothing) == nothing)
                result[Symbol("index")] = false;
            end
        end
            return result
    end
    return extend(cleanStructure)

end
function setMarkets(self::CcxtExchange, markets; currencies=nothing)
    values_var = [];
    self.markets_by_id = self.createSafeDictionary();
    marketValues = sortBy(toArray(markets), "spot", true, true);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(marketValues)))
        value = get(marketValues, i + 1, nothing);
        if functions.ccxtruthy(ccxt_in(get(value, Symbol("id"), nothing), self.markets_by_id))
            marketsByIdArray = get(self.markets_by_id, Symbol(get(value, Symbol("id"), nothing)), nothing);
                        push!(marketsByIdArray, value);
            self.markets_by_id[Symbol(value[Symbol("id")])] = marketsByIdArray;
        else
            self.markets_by_id[Symbol(value[Symbol("id")])] = [value];
        end
        valueDefined = Dict{Symbol, Any}();
        valueKeys = objectKeys(value);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(valueKeys)))
            valueKey = get(valueKeys, j + 1, nothing);
            if functions.ccxtruthy(get(value, Symbol(valueKey), nothing) != nothing)
                valueDefined[Symbol(valueKey)] = get(value, Symbol(valueKey), nothing);
            end
            j += 1
        end
        market = deepExtend(self.safeMarketStructure(), Dict{Symbol, Any}(
            Symbol("precision") => self.precision,
            Symbol("limits") => self.limits
        ), get(self.fees, Symbol("trading"), nothing), valueDefined);
        if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
            market[Symbol("subType")] = "linear";
        elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
            market[Symbol("subType")] = "inverse";
        else
            market[Symbol("subType")] = nothing;
        end
        push!(values_var, market);
        i += 1
    end
    self.markets = self.mapToSafeMap(indexBy(values_var, "symbol"));
    marketsSortedBySymbol = keysort(self.markets);
    marketsSortedById = keysort(self.markets_by_id);
    self.symbols = objectKeys(marketsSortedBySymbol);
    self.ids = objectKeys(marketsSortedById);
    numCurrencies = 0;
    if functions.ccxtruthy(currencies != nothing)
        keys_var = objectKeys(currencies);
        numCurrencies = length(keys_var);
    end
    if functions.ccxtruthy(functions.ccxt_gt(numCurrencies, 0))
        self.currencies = self.mapToSafeMap(deepExtend(self.currencies, currencies));
    else
        baseCurrencies = [];
        quoteCurrencies = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(values_var)))
            market = get(values_var, i + 1, nothing);
            defaultCurrencyPrecision = functions.ccxtruthy((self.precisionMode == DECIMAL_PLACES)) ? 8 : self.parseNumber("1e-8");
            marketPrecision = self.safeDict(market, "precision", defaultValue = Dict{Symbol, Any}());
            if functions.ccxtruthy(ccxt_in("base", market))
                currency = self.safeCurrencyStructure(Dict{Symbol, Any}(
                    Symbol("id") => safeString2(market, "baseId", "base"),
                    Symbol("numericId") => safeInteger(market, "baseNumericId"),
                    Symbol("code") => safeString(market, "base"),
                    Symbol("precision") => safeValue2(marketPrecision, "base", "amount", defaultCurrencyPrecision)
                ));
                                push!(baseCurrencies, currency);
            end
            if functions.ccxtruthy(ccxt_in("quote", market))
                currency = self.safeCurrencyStructure(Dict{Symbol, Any}(
                    Symbol("id") => safeString2(market, "quoteId", "quote"),
                    Symbol("numericId") => safeInteger(market, "quoteNumericId"),
                    Symbol("code") => safeString(market, "quote"),
                    Symbol("precision") => safeValue2(marketPrecision, "quote", "price", defaultCurrencyPrecision)
                ));
                                push!(quoteCurrencies, currency);
            end
            i += 1
        end
        baseCurrencies = sortBy(baseCurrencies, "code", false, "");
        quoteCurrencies = sortBy(quoteCurrencies, "code", false, "");
        self.baseCurrencies = self.mapToSafeMap(indexBy(baseCurrencies, "code"));
        self.quoteCurrencies = self.mapToSafeMap(indexBy(quoteCurrencies, "code"));
        allCurrencies = arrayConcat(baseCurrencies, quoteCurrencies);
        groupedCurrencies = groupBy(allCurrencies, "code");
        codes = objectKeys(groupedCurrencies);
        resultingCurrencies = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(codes)))
            code = get(codes, i + 1, nothing);
            groupedCurrenciesCode = self.safeList(groupedCurrencies, code, defaultValue = []);
            highestPrecisionCurrency = safeValue(groupedCurrenciesCode, 0);
            j = 1
            while functions.ccxtruthy(functions.ccxt_lt(j, length(groupedCurrenciesCode)))
                currentCurrency = get(groupedCurrenciesCode, j + 1, nothing);
                if functions.ccxtruthy(self.precisionMode == TICK_SIZE)
                    highestPrecisionCurrency = functions.ccxtruthy((functions.ccxt_lt(get(currentCurrency, Symbol("precision"), nothing), get(highestPrecisionCurrency, Symbol("precision"), nothing)))) ? currentCurrency : highestPrecisionCurrency;
                else
                    highestPrecisionCurrency = functions.ccxtruthy((functions.ccxt_gt(get(currentCurrency, Symbol("precision"), nothing), get(highestPrecisionCurrency, Symbol("precision"), nothing)))) ? currentCurrency : highestPrecisionCurrency;
                end
                j += 1
            end
            push!(resultingCurrencies, highestPrecisionCurrency);
            i += 1
        end
        sortedCurrencies = sortBy(resultingCurrencies, "code");
        self.currencies = self.mapToSafeMap(deepExtend(self.currencies, indexBy(sortedCurrencies, "code")));
    end
    self.currencies_by_id = indexBySafe(self.currencies, "id");
    currenciesSortedByCode = keysort(self.currencies);
    self.codes = objectKeys(currenciesSortedByCode);
    if functions.ccxtruthy(self.markets == nothing)
        throw(ExchangeError(string(self.id, " setMarkets() markets not set")));
    end
    return self.markets

end
function setMarketsFromExchange(self::CcxtExchange, sourceExchange)
    if functions.ccxtruthy(self.id != get(sourceExchange, Symbol("id"), nothing))
        throw(ArgumentsRequired(string(self.id, " shareMarkets() can only share markets with exchanges of the same type (got ", get(sourceExchange, Symbol("id"), nothing), ")")));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(get(sourceExchange, Symbol("markets"), nothing)))
        throw(ExchangeError("setMarketsFromExchange() source exchange must have loaded markets first. Can call by using loadMarkets function"));
    end
    self.markets = get(sourceExchange, Symbol("markets"), nothing);
    self.markets_by_id = get(sourceExchange, Symbol("markets_by_id"), nothing);
    self.symbols = get(sourceExchange, Symbol("symbols"), nothing);
    self.ids = get(sourceExchange, Symbol("ids"), nothing);
    self.currencies = get(sourceExchange, Symbol("currencies"), nothing);
    self.currencies_by_id = get(sourceExchange, Symbol("currencies_by_id"), nothing);
    self.baseCurrencies = get(sourceExchange, Symbol("baseCurrencies"), nothing);
    self.quoteCurrencies = get(sourceExchange, Symbol("quoteCurrencies"), nothing);
    self.codes = get(sourceExchange, Symbol("codes"), nothing);
    sourceExchangeHelpers = self.safeList(get(sourceExchange, Symbol("options"), nothing), "marketHelperProps", defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(sourceExchangeHelpers)))
        helper = get(sourceExchangeHelpers, i + 1, nothing);
        if functions.ccxtruthy(get(get(sourceExchange, Symbol("options"), nothing), Symbol(helper), nothing) != nothing)
            self.options[Symbol(helper)] = get(get(sourceExchange, Symbol("options"), nothing), Symbol(helper), nothing);
        end
        i += 1
    end
    return self

end
function getDescribeForExtendedWsExchange(self::CcxtExchange, currentRestInstance, parentRestInstance, wsBaseDescribe)
    extendedRestDescribe = deepExtend(describe(parentRestInstance), describe(currentRestInstance));
    superWithRestDescribe = deepExtend(extendedRestDescribe, wsBaseDescribe);
    return superWithRestDescribe

end
function safeBalance(self::CcxtExchange, balance)
    balances = omit(balance, ["info", "timestamp", "datetime", "free", "used", "total"]);
    codes = objectKeys(balances);
    balance[Symbol("free")] = Dict{Symbol, Any}();
    balance[Symbol("used")] = Dict{Symbol, Any}();
    balance[Symbol("total")] = Dict{Symbol, Any}();
    debtBalance = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(codes)))
        code = get(codes, i + 1, nothing);
        total = safeString(get(balance, Symbol(code), nothing), "total");
        free = safeString(get(balance, Symbol(code), nothing), "free");
        used = safeString(get(balance, Symbol(code), nothing), "used");
        debt = safeString(get(balance, Symbol(code), nothing), "debt");
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((total == nothing), (free != nothing)), (used != nothing)))
            total = stringAdd(free, used);
        end
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((free == nothing), (total != nothing)), (used != nothing)))
            free = stringSub(total, used);
        end
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((used == nothing), (total != nothing)), (free != nothing)))
            used = stringSub(total, free);
        end
        balance[Symbol(code)][Symbol("free")] = self.parseNumber(free);
        balance[Symbol(code)][Symbol("used")] = self.parseNumber(used);
        balance[Symbol(code)][Symbol("total")] = self.parseNumber(total);
        balance[Symbol("free")][Symbol(code)] = get(get(balance, Symbol(code), nothing), Symbol("free"), nothing);
        balance[Symbol("used")][Symbol(code)] = get(get(balance, Symbol(code), nothing), Symbol("used"), nothing);
        balance[Symbol("total")][Symbol(code)] = get(get(balance, Symbol(code), nothing), Symbol("total"), nothing);
        if functions.ccxtruthy(debt != nothing)
            balance[Symbol(code)][Symbol("debt")] = self.parseNumber(debt);
            debtBalance[Symbol(code)] = get(get(balance, Symbol(code), nothing), Symbol("debt"), nothing);
        end
        i += 1
    end
    debtBalanceArray = objectKeys(debtBalance);
    len = length(debtBalanceArray);
    if functions.ccxtruthy(len)
        balance[Symbol("debt")] = debtBalance;
    end
    return balance

end
function safeOrder(self::CcxtExchange, order; market=nothing)
    if functions.ccxtruthy(order == nothing)
        order = Dict{Symbol, Any}();
    end
    amount = omitZero(safeString(order, "amount"));
    remaining = safeString(order, "remaining");
    filled = safeString(order, "filled");
    cost = safeString(order, "cost");
    average = omitZero(safeString(order, "average"));
    price = omitZero(safeString(order, "price"));
    lastTradeTimeTimestamp = safeInteger(order, "lastTradeTimestamp");
    symbol = safeString(order, "symbol");
    side = safeString(order, "side");
    status = safeString(order, "status");
    parseFilled = (filled == nothing);
    parseCost = (cost == nothing);
    parseLastTradeTimeTimestamp = (lastTradeTimeTimestamp == nothing);
    fee = safeValue(order, "fee");
    parseFee = (fee == nothing);
    parseFees = safeValue(order, "fees") == nothing;
    parseSymbol = symbol == nothing;
    parseSide = side == nothing;
    shouldParseFees = @functions.ccxt_or(parseFee, parseFees);
    fees = self.safeList(order, "fees", defaultValue = []);
    trades = [];
    isTriggerOrSLTpOrder = (@functions.ccxt_or((@functions.ccxt_or(safeString(order, "triggerPrice") != nothing, (safeString(order, "stopLossPrice") != nothing))), (safeString(order, "takeProfitPrice") != nothing)));
    if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(parseFilled, parseCost), shouldParseFees))
        rawTrades = safeValue(order, "trades", trades);
        firstTrade = safeValue(rawTrades, 0);
        tradesAreParsed = (@functions.ccxt_and(@functions.ccxt_and((firstTrade != nothing), (ccxt_in("info", firstTrade))), (ccxt_in("id", firstTrade))));
        if functions.ccxtruthy(!functions.ccxtruthy(tradesAreParsed))
            trades = self.parseTrades(rawTrades, market = market);
        else
            trades = rawTrades;
        end
        tradesLength = 0;
        isArray = functions.ccxt_isArray(trades);
        if functions.ccxtruthy(isArray)
            tradesLength = length(trades);
        end
        if functions.ccxtruthy(@functions.ccxt_and(isArray, (functions.ccxt_gt(tradesLength, 0))))
            if functions.ccxtruthy(get(order, Symbol("symbol"), nothing) == nothing)
                order[Symbol("symbol")] = get(get(trades, 1, nothing), Symbol("symbol"), nothing);
            end
            if functions.ccxtruthy(get(order, Symbol("side"), nothing) == nothing)
                order[Symbol("side")] = get(get(trades, 1, nothing), Symbol("side"), nothing);
            end
            if functions.ccxtruthy(get(order, Symbol("type"), nothing) == nothing)
                order[Symbol("type")] = get(get(trades, 1, nothing), Symbol("type"), nothing);
            end
            if functions.ccxtruthy(get(order, Symbol("id"), nothing) == nothing)
                order[Symbol("id")] = get(get(trades, 1, nothing), Symbol("order"), nothing);
            end
            if functions.ccxtruthy(parseFilled)
                filled = "0";
            end
            if functions.ccxtruthy(parseCost)
                cost = "0";
            end
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(trades)))
                trade = get(trades, i + 1, nothing);
                tradeAmount = safeString(trade, "amount");
                if functions.ccxtruthy(@functions.ccxt_and(parseFilled, (tradeAmount != nothing)))
                    filled = stringAdd(filled, tradeAmount);
                end
                tradeCost = safeString(trade, "cost");
                if functions.ccxtruthy(@functions.ccxt_and(parseCost, (tradeCost != nothing)))
                    cost = stringAdd(cost, tradeCost);
                end
                if functions.ccxtruthy(parseSymbol)
                    symbol = safeString(trade, "symbol");
                end
                if functions.ccxtruthy(parseSide)
                    side = safeString(trade, "side");
                end
                tradeTimestamp = safeValue(trade, "timestamp");
                if functions.ccxtruthy(@functions.ccxt_and(parseLastTradeTimeTimestamp, (tradeTimestamp != nothing)))
                    if functions.ccxtruthy(lastTradeTimeTimestamp == nothing)
                        lastTradeTimeTimestamp = tradeTimestamp;
                    else
                        lastTradeTimeTimestamp = max(lastTradeTimeTimestamp, tradeTimestamp);
                    end
                end
                if functions.ccxtruthy(shouldParseFees)
                    tradeFees = safeValue(trade, "fees");
                    if functions.ccxtruthy(tradeFees != nothing)
                        j = 0
                        while functions.ccxtruthy(functions.ccxt_lt(j, length(tradeFees)))
                            tradeFee = get(tradeFees, j + 1, nothing);
                            push!(fees, extend(Dict{Symbol, Any}(), tradeFee));
                            j += 1
                        end

                    else
                        tradeFee = safeValue(trade, "fee");
                        if functions.ccxtruthy(tradeFee != nothing)
                                                        push!(fees, extend(Dict{Symbol, Any}(), tradeFee));
                        end
                    end
                end
                i += 1
            end

        end
    end
    if functions.ccxtruthy(shouldParseFees)
        reducedFees = fees;
        if functions.ccxtruthy(self.reduceFees)
            reducedFees = self.reduceFeesByCurrency(fees);
        end
        if functions.ccxtruthy(reducedFees == nothing)
            reducedFees = [];
        end
        reducedLength = length(reducedFees);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, reducedLength))
            reducedFees[i + 1][Symbol("cost")] = self.safeNumber(get(reducedFees, i + 1, nothing), "cost");
            if functions.ccxtruthy(ccxt_in("rate", get(reducedFees, i + 1, nothing)))
                reducedFees[i + 1][Symbol("rate")] = self.safeNumber(get(reducedFees, i + 1, nothing), "rate");
            end
            i += 1
        end

        if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(parseFee), (reducedLength == 0)))
            feeCopy = deepExtend(fee);
            feeCopy[Symbol("cost")] = self.safeNumber(feeCopy, "cost");
            if functions.ccxtruthy(ccxt_in("rate", feeCopy))
                feeCopy[Symbol("rate")] = self.safeNumber(feeCopy, "rate");
            end
                        push!(reducedFees, feeCopy);
        end
        order[Symbol("fees")] = reducedFees;
        if functions.ccxtruthy(@functions.ccxt_and(parseFee, (reducedLength == 1)))
            order[Symbol("fee")] = get(reducedFees, 1, nothing);
        end
    end
    if functions.ccxtruthy(amount == nothing)
        if functions.ccxtruthy(@functions.ccxt_and(filled != nothing, remaining != nothing))
            amount = stringAdd(filled, remaining);
        elseif functions.ccxtruthy(status == "closed")
            amount = filled;
        end
    end
    if functions.ccxtruthy(filled == nothing)
        if functions.ccxtruthy(@functions.ccxt_and(amount != nothing, remaining != nothing))
            filled = stringSub(amount, remaining);
        elseif functions.ccxtruthy(@functions.ccxt_and(status == "closed", amount != nothing))
            filled = amount;
        end
    end
    if functions.ccxtruthy(remaining == nothing)
        if functions.ccxtruthy(@functions.ccxt_and(amount != nothing, filled != nothing))
            remaining = stringSub(amount, filled);
        elseif functions.ccxtruthy(status == "closed")
            remaining = "0";
        end
    end
    inverse = self.safeBool(market, "inverse", defaultValue = false);
    contractSize = numberToString(safeValue(market, "contractSize", 1));
    if functions.ccxtruthy(average == nothing)
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((filled != nothing), (cost != nothing)), stringGt(filled, "0")))
            filledTimesContractSize = stringMul(filled, contractSize);
            if functions.ccxtruthy(inverse)
                average = stringDiv(filledTimesContractSize, cost);
            else
                average = stringDiv(cost, filledTimesContractSize);
            end
        end
    end
    costPriceExists = @functions.ccxt_or((average != nothing), (price != nothing));
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(parseCost, (filled != nothing)), costPriceExists))
        multiplyPrice = nothing;
        if functions.ccxtruthy(average == nothing)
            multiplyPrice = price;
        else
            multiplyPrice = average;
        end
        filledTimesContractSize = stringMul(filled, contractSize);
        if functions.ccxtruthy(inverse)
            cost = stringDiv(filledTimesContractSize, multiplyPrice);
        else
            cost = stringMul(filledTimesContractSize, multiplyPrice);
        end
    end
    orderType = safeValue(order, "type");
    emptyPrice = @functions.ccxt_or((price == nothing), stringEquals(price, "0"));
    if functions.ccxtruthy(@functions.ccxt_and(emptyPrice, (orderType == "market")))
        price = average;
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(trades)))
        entry = get(trades, i + 1, nothing);
        entry[Symbol("amount")] = self.safeNumber(entry, "amount");
        entry[Symbol("price")] = self.safeNumber(entry, "price");
        entry[Symbol("cost")] = self.safeNumber(entry, "cost");
        tradeFee = self.safeDict(entry, "fee", defaultValue = Dict{Symbol, Any}());
        tradeFee[Symbol("cost")] = self.safeNumber(tradeFee, "cost");
        if functions.ccxtruthy(ccxt_in("rate", tradeFee))
            tradeFee[Symbol("rate")] = self.safeNumber(tradeFee, "rate");
        end
        entryFees = self.safeList(entry, "fees", defaultValue = []);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(entryFees)))
            entryFees[j + 1][Symbol("cost")] = self.safeNumber(get(entryFees, j + 1, nothing), "cost");
            j += 1
        end
        entry[Symbol("fees")] = entryFees;
        entry[Symbol("fee")] = tradeFee;
        i += 1
    end
    timeInForce = safeString(order, "timeInForce");
    postOnly = safeValue(order, "postOnly");
    if functions.ccxtruthy(timeInForce == nothing)
        if functions.ccxtruthy(@functions.ccxt_and(!functions.ccxtruthy(isTriggerOrSLTpOrder), (safeString(order, "type") == "market")))
            timeInForce = "IOC";
        end
        if functions.ccxtruthy(postOnly)
            timeInForce = "PO";
        end
    elseif functions.ccxtruthy(postOnly == nothing)
        postOnly = timeInForce == "PO";
    end
    timestamp = safeInteger(order, "timestamp");
    lastUpdateTimestamp = safeInteger(order, "lastUpdateTimestamp");
    datetime = safeString(order, "datetime");
    if functions.ccxtruthy(datetime == nothing)
        datetime = self.iso8601(timestamp);
    end
    triggerPrice = self.parseNumber(safeString2(order, "triggerPrice", "stopPrice"));
    takeProfitPrice = self.parseNumber(safeString(order, "takeProfitPrice"));
    stopLossPrice = self.parseNumber(safeString(order, "stopLossPrice"));
    return extend(order, Dict{Symbol, Any}(
    Symbol("id") => safeString(order, "id"),
    Symbol("clientOrderId") => safeString(order, "clientOrderId"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => datetime,
    Symbol("symbol") => symbol,
    Symbol("type") => safeString(order, "type"),
    Symbol("side") => side,
    Symbol("lastTradeTimestamp") => lastTradeTimeTimestamp,
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("price") => self.parseNumber(price),
    Symbol("amount") => self.parseNumber(amount),
    Symbol("cost") => self.parseNumber(cost),
    Symbol("average") => self.parseNumber(average),
    Symbol("filled") => self.parseNumber(filled),
    Symbol("remaining") => self.parseNumber(remaining),
    Symbol("timeInForce") => timeInForce,
    Symbol("postOnly") => postOnly,
    Symbol("trades") => trades,
    Symbol("reduceOnly") => safeValue(order, "reduceOnly"),
    Symbol("stopPrice") => triggerPrice,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("takeProfitPrice") => takeProfitPrice,
    Symbol("stopLossPrice") => stopLossPrice,
    Symbol("status") => status,
    Symbol("fee") => safeValue(order, "fee")
))

end
function parseOrders(self::CcxtExchange, orders; market=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(orders == nothing)
            return []
    end
    results = [];
    if functions.ccxtruthy(functions.ccxt_isArray(orders))
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(orders)))
            parsed = self.parseOrder(get(orders, i + 1, nothing), market = market);
            order = extend(parsed, params);
            push!(results, order);
            i += 1
        end

    else
        ids = objectKeys(orders);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(ids)))
            id = get(ids, i + 1, nothing);
            idExtended = extend(Dict{Symbol, Any}(
                Symbol("id") => id
            ), get(orders, Symbol(id), nothing));
            parsedOrder = self.parseOrder(idExtended, market = market);
            order = extend(parsedOrder, params);
            push!(results, order);
            i += 1
        end
    end
    results = sortBy(results, "timestamp");
    symbol = safeString(market, "symbol");
    return self.filterBySymbolSinceLimit(results, symbol = symbol, since = since, limit = limit)

end
function calculateFeeWithRate(self::CcxtExchange, symbol, type_var, side, amount, price; takerOrMaker="taker", feeRate=nothing, params=Dict())
    if functions.ccxtruthy(@functions.ccxt_and(type_var == "market", takerOrMaker == "maker"))
        throw(ArgumentsRequired(string(self.id, " calculateFee() - you have provided incompatible arguments - \"market\" type order can not be \"maker\". Change either the \"type\" or the \"takerOrMaker\" argument to calculate the fee.")));
    end
    markets = self.markets;
    if functions.ccxtruthy(markets == nothing)
        throw(ExchangeError(string(self.id, " markets not loaded")));
    end
    market = get(markets, Symbol(symbol), nothing);
    feeSide = safeString(market, "feeSide", "quote");
    useQuote = nothing;
    if functions.ccxtruthy(feeSide == "get")
        useQuote = side == "sell";
    elseif functions.ccxtruthy(feeSide == "give")
        useQuote = side == "buy";
    else
        useQuote = feeSide == "quote";
    end
    cost = numberToString(amount);
    key = nothing;
    if functions.ccxtruthy(useQuote)
        priceString = numberToString(price);
        cost = stringMul(cost, priceString);
        key = "quote";
    else
        key = "base";
    end
    if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
        key = "settle";
    end
    if functions.ccxtruthy(type_var == "market")
        takerOrMaker = "taker";
    end
    rate = functions.ccxtruthy((feeRate != nothing)) ? numberToString(feeRate) : safeString(market, takerOrMaker);
    cost = stringMul(cost, rate);
    return Dict{Symbol, Any}(
    Symbol("type") => takerOrMaker,
    Symbol("currency") => get(market, Symbol(key), nothing),
    Symbol("rate") => self.parseNumber(rate),
    Symbol("cost") => self.parseNumber(cost)
)

end
function calculateFee(self::CcxtExchange, symbol, type_var, side, amount, price; takerOrMaker="taker", params=Dict())
    return self.calculateFeeWithRate(symbol, type_var, side, amount, price, takerOrMaker = takerOrMaker, feeRate = nothing, params = params)

end
function safeLiquidation(self::CcxtExchange, liquidation; market=nothing)
    contracts = safeString(liquidation, "contracts");
    contractSize = safeString(market, "contractSize");
    price = safeString(liquidation, "price");
    baseValue = safeString(liquidation, "baseValue");
    quoteValue = safeString(liquidation, "quoteValue");
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and((baseValue == nothing), (contracts != nothing)), (contractSize != nothing)), (price != nothing)))
        baseValue = stringMul(contracts, contractSize);
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((quoteValue == nothing), (baseValue != nothing)), (price != nothing)))
        quoteValue = stringMul(baseValue, price);
    end
    liquidation[Symbol("contracts")] = self.parseNumber(contracts);
    liquidation[Symbol("contractSize")] = self.parseNumber(contractSize);
    liquidation[Symbol("price")] = self.parseNumber(price);
    liquidation[Symbol("baseValue")] = self.parseNumber(baseValue);
    liquidation[Symbol("quoteValue")] = self.parseNumber(quoteValue);
    return liquidation

end
function safeTrade(self::CcxtExchange, trade; market=nothing)
    amount = safeString(trade, "amount");
    price = safeString(trade, "price");
    cost = safeString(trade, "cost");
    if functions.ccxtruthy(cost == nothing)
        contractSize = safeString(market, "contractSize");
        multiplyPrice = price;
        if functions.ccxtruthy(contractSize != nothing)
            inverse = self.safeBool(market, "inverse", defaultValue = false);
            if functions.ccxtruthy(inverse)
                multiplyPrice = stringDiv("1", price);
            end
            multiplyPrice = stringMul(multiplyPrice, contractSize);
        end
        cost = stringMul(multiplyPrice, amount);
    end
    (resultFee, resultFees) = self.parsedFeeAndFees(trade);
    trade[Symbol("fee")] = resultFee;
    trade[Symbol("fees")] = resultFees;
    trade[Symbol("amount")] = self.parseNumber(amount);
    trade[Symbol("price")] = self.parseNumber(price);
    trade[Symbol("cost")] = self.parseNumber(cost);
    return trade

end
function createCcxtTradeId(self::CcxtExchange; timestamp=nothing, side=nothing, amount=nothing, price=nothing, takerOrMaker=nothing)
    id = nothing;
    if functions.ccxtruthy(timestamp != nothing)
        id = numberToString(timestamp);
        if functions.ccxtruthy(side != nothing)
            id += string("-", side);
        end
        if functions.ccxtruthy(amount != nothing)
            id += string("-", numberToString(amount));
        end
        if functions.ccxtruthy(price != nothing)
            id += string("-", numberToString(price));
        end
        if functions.ccxtruthy(takerOrMaker != nothing)
            id += string("-", takerOrMaker);
        end
    end
    return id

end
function parsedFeeAndFees(self::CcxtExchange, container)
    fee = self.safeDict(container, "fee");
    fees = self.safeList(container, "fees");
    feeDefined = fee != nothing;
    feesDefined = fees != nothing;
    shouldParseFees = (@functions.ccxt_or(feeDefined, feesDefined));
    if functions.ccxtruthy(shouldParseFees)
        if functions.ccxtruthy(feeDefined)
            fee = self.parseFeeNumeric(fee);
        end
        if functions.ccxtruthy(!functions.ccxtruthy(feesDefined))
            fees = [fee];
        end
        reducedFees = fees;
        if functions.ccxtruthy(self.reduceFees)
            reducedFees = self.reduceFeesByCurrency(fees);
        end
        if functions.ccxtruthy(reducedFees == nothing)
            reducedFees = [];
        end
        reducedLength = length(reducedFees);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, reducedLength))
            reducedFees[i + 1] = self.parseFeeNumeric(get(reducedFees, i + 1, nothing));
            i += 1
        end

        fees = reducedFees;
        if functions.ccxtruthy(reducedLength == 1)
            fee = get(reducedFees, 1, nothing);
        elseif functions.ccxtruthy(reducedLength == 0)
            fee = nothing;
        end
    end
    if functions.ccxtruthy(fee == nothing)
        fee = Dict{Symbol, Any}(
            Symbol("cost") => nothing,
            Symbol("currency") => nothing
        );
    end
    if functions.ccxtruthy(fees == nothing)
        fees = [];
    end
    return [fee, fees]

end
function parseFeeNumeric(self::CcxtExchange, fee)
    fee[Symbol("cost")] = self.safeNumber(fee, "cost");
    if functions.ccxtruthy(ccxt_in("rate", fee))
        fee[Symbol("rate")] = self.safeNumber(fee, "rate");
    end
    return fee

end
function findNearestCeiling(self::CcxtExchange, arr, providedValue)
    len = length(arr);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, len))
        current = get(arr, i + 1, nothing);
        if functions.ccxtruthy(functions.ccxt_le(providedValue, current))
                return current
        end
        i += 1
    end
    return get(arr, len - 1 + 1, nothing)

end
function addKeyInArrayItems(self::CcxtExchange, obj, keyName)
    result = [];
    keys_var = objectKeys(obj);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        item = get(obj, Symbol(key), nothing);
        if functions.ccxtruthy(item == nothing)
            i += 1; continue
        end
        itemWithKey = extend(Dict{Symbol, Any}(), item);
        itemWithKey[Symbol(keyName)] = key;
        push!(result, itemWithKey);
        i += 1
    end
    return result

end
function invertFlatStringDictionary(self::CcxtExchange, dict)
    reversed = Dict{Symbol, Any}();
    keys_var = objectKeys(dict);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        value = get(dict, Symbol(key), nothing);
        if functions.ccxtruthy(isa(value, AbstractString))
            reversed[Symbol(value)] = key;
        end
        i += 1
    end
    return reversed

end
function stringToBase16(self::CcxtExchange, str)
    return string("0x", self.binaryToBase16(self.base64ToBinary(self.stringToBase64(str))))

end
function reduceFeesByCurrency(self::CcxtExchange, fees)
    reduced = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(fees)))
        fee = get(fees, i + 1, nothing);
        code = safeString(fee, "currency");
        feeCurrencyCode = functions.ccxtruthy((code != nothing)) ? code : string(i);
        if functions.ccxtruthy(feeCurrencyCode != nothing)
            rate = safeString(fee, "rate");
            cost = safeString(fee, "cost");
            if functions.ccxtruthy(cost == nothing)
                i += 1; continue
            end
            if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(feeCurrencyCode, reduced))))
                reduced[Symbol(feeCurrencyCode)] = Dict{Symbol, Any}();
            end
            rateKey = functions.ccxtruthy((rate == nothing)) ? "" : rate;
            if functions.ccxtruthy(ccxt_in(rateKey, get(reduced, Symbol(feeCurrencyCode), nothing)))
                reduced[Symbol(feeCurrencyCode)][Symbol(rateKey)][Symbol("cost")] = stringAdd(get(get(get(reduced, Symbol(feeCurrencyCode), nothing), Symbol(rateKey), nothing), Symbol("cost"), nothing), cost);
            else
                reduced[Symbol(feeCurrencyCode)][Symbol(rateKey)] = Dict{Symbol, Any}(
                    Symbol("currency") => code,
                    Symbol("cost") => cost
                );
                if functions.ccxtruthy(rate != nothing)
                    reduced[Symbol(feeCurrencyCode)][Symbol(rateKey)][Symbol("rate")] = rate;
                end
            end
        end
        i += 1
    end
    result = [];
    feeValues = objectValues(reduced);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(feeValues)))
        reducedFeeValues = objectValues(get(feeValues, i + 1, nothing));
        result = arrayConcat(result, reducedFeeValues);
        i += 1
    end
    return result

end
function safeTicker(self::CcxtExchange, ticker; market=nothing)
    open = omitZero(safeString(ticker, "open"));
    close = omitZero(safeString2(ticker, "close", "last"));
    change = safeString(ticker, "change");
    percentage = omitZero(safeString(ticker, "percentage"));
    average = omitZero(safeString(ticker, "average"));
    vwap = safeString(ticker, "vwap");
    baseVolume = safeString(ticker, "baseVolume");
    quoteVolume = safeString(ticker, "quoteVolume");
    if functions.ccxtruthy(vwap == nothing)
        vwap = stringDiv(omitZero(quoteVolume), baseVolume);
    end
    if functions.ccxtruthy(change != nothing)
        if functions.ccxtruthy(@functions.ccxt_and(close == nothing, average != nothing))
            close = stringAdd(average, stringDiv(change, "2"));
        end
        if functions.ccxtruthy(@functions.ccxt_and(open == nothing, close != nothing))
            open = stringSub(close, change);
        end
    elseif functions.ccxtruthy(percentage != nothing)
        if functions.ccxtruthy(@functions.ccxt_and(close == nothing, average != nothing))
            openAddClose = stringMul(average, "2");
            denominator = stringAdd("2", stringDiv(percentage, "100"));
            calcOpen = functions.ccxtruthy((open != nothing)) ? open : stringDiv(openAddClose, denominator);
            close = stringMul(calcOpen, stringAdd("1", stringDiv(percentage, "100")));
        end
        if functions.ccxtruthy(@functions.ccxt_and(open == nothing, close != nothing))
            open = stringDiv(close, stringAdd("1", stringDiv(percentage, "100")));
        end
    end
    if functions.ccxtruthy(change == nothing)
        if functions.ccxtruthy(@functions.ccxt_and(close != nothing, open != nothing))
            change = stringSub(close, open);
        elseif functions.ccxtruthy(@functions.ccxt_and(close != nothing, percentage != nothing))
            change = stringMul(stringDiv(percentage, "100"), stringDiv(close, "100"));
        else
            if functions.ccxtruthy(@functions.ccxt_and(open != nothing, percentage != nothing))
                change = stringMul(open, stringDiv(percentage, "100"));
            end

        end
    end
    if functions.ccxtruthy(open != nothing)
        if functions.ccxtruthy(@functions.ccxt_and(percentage == nothing, change != nothing))
            percentage = stringMul(stringDiv(change, open), "100");
        end
        if functions.ccxtruthy(@functions.ccxt_and(close == nothing, change != nothing))
            close = stringAdd(open, change);
        end
        if functions.ccxtruthy(@functions.ccxt_and(close == nothing, average != nothing))
            close = stringMul(average, "2");
        end
        if functions.ccxtruthy(@functions.ccxt_and(average == nothing, close != nothing))
            precision = 18;
            if functions.ccxtruthy(@functions.ccxt_and(market != nothing, self.isTickPrecision()))
                marketPrecision = self.safeDict(market, "precision");
                precisionPrice = safeString(marketPrecision, "price");
                if functions.ccxtruthy(precisionPrice != nothing)
                    precision = precisionFromString(precisionPrice);
                end
            end
            average = stringDiv(stringAdd(open, close), "2", precision);
        end
    end
    closeParsed = self.parseNumber(omitZero(close));
    return extend(ticker, Dict{Symbol, Any}(
    Symbol("bid") => self.parseNumber(omitZero(safeString(ticker, "bid"))),
    Symbol("bidVolume") => self.safeNumber(ticker, "bidVolume"),
    Symbol("ask") => self.parseNumber(omitZero(safeString(ticker, "ask"))),
    Symbol("askVolume") => self.safeNumber(ticker, "askVolume"),
    Symbol("high") => self.parseNumber(omitZero(safeString(ticker, "high"))),
    Symbol("low") => self.parseNumber(omitZero(safeString(ticker, "low"))),
    Symbol("open") => self.parseNumber(omitZero(open)),
    Symbol("close") => closeParsed,
    Symbol("last") => closeParsed,
    Symbol("change") => self.parseNumber(change),
    Symbol("percentage") => self.parseNumber(percentage),
    Symbol("average") => self.parseNumber(average),
    Symbol("vwap") => self.parseNumber(vwap),
    Symbol("baseVolume") => self.parseNumber(baseVolume),
    Symbol("quoteVolume") => self.parseNumber(quoteVolume),
    Symbol("previousClose") => self.safeNumber(ticker, "previousClose"),
    Symbol("indexPrice") => self.safeNumber(ticker, "indexPrice"),
    Symbol("markPrice") => self.safeNumber(ticker, "markPrice")
))

end
function fetchBorrowRate(self::CcxtExchange, code, amount; params=Dict())
    throw(NotSupported(string(self.id, " fetchBorrowRate is deprecated, please use fetchCrossBorrowRate or fetchIsolatedBorrowRate instead")));

end
function repayCrossMargin(self::CcxtExchange, code, amount; params=Dict())
    throw(NotSupported(string(self.id, " repayCrossMargin is not support yet")));

end
function repayIsolatedMargin(self::CcxtExchange, symbol, code, amount; params=Dict())
    throw(NotSupported(string(self.id, " repayIsolatedMargin is not support yet")));

end
function borrowCrossMargin(self::CcxtExchange, code, amount; params=Dict())
    throw(NotSupported(string(self.id, " borrowCrossMargin is not support yet")));

end
function borrowIsolatedMargin(self::CcxtExchange, symbol, code, amount; params=Dict())
    throw(NotSupported(string(self.id, " borrowIsolatedMargin is not support yet")));

end
function borrowMargin(self::CcxtExchange, code, amount; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " borrowMargin is deprecated, please use borrowCrossMargin or borrowIsolatedMargin instead")));

end
function repayMargin(self::CcxtExchange, code, amount; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " repayMargin is deprecated, please use repayCrossMargin or repayIsolatedMargin instead")));

end
function fetchOHLCV(self::CcxtExchange, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    message = "";
    if functions.ccxtruthy(get(self.has, Symbol("fetchTrades"), nothing))
        message = ". If you want to build OHLCV candles from trade executions data, visit https://github.com/ccxt/ccxt/tree/master/examples/ and see \"build-ohlcv-bars\" file";
    end
    throw(NotSupported(string(self.id, " fetchOHLCV() is not supported yet", message)));

end
function fetchSpotOHLCV(self::CcxtExchange, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchSpotOHLCV() is not supported yet")));

end
function fetchContractOHLCV(self::CcxtExchange, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchContractOHLCV() is not supported yet")));

end
function fetchOHLCVWs(self::CcxtExchange, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    message = "";
    if functions.ccxtruthy(get(self.has, Symbol("fetchTradesWs"), nothing))
        message = ". If you want to build OHLCV candles from trade executions data, visit https://github.com/ccxt/ccxt/tree/master/examples/ and see \"build-ohlcv-bars\" file";
    end
    throw(NotSupported(string(self.id, " fetchOHLCVWs() is not supported yet. Try using fetchOHLCV instead.", message)));

end
function watchOHLCV(self::CcxtExchange, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchOHLCV() is not supported yet")));

end
function convertTradingViewToOHLCV(self::CcxtExchange, ohlcvs; timestamp="t", open="o", high="h", low="l", close="c", volume="v", ms=false)
    result = [];
    timestamps = self.safeList(ohlcvs, timestamp, defaultValue = []);
    opens = self.safeList(ohlcvs, open, defaultValue = []);
    highs = self.safeList(ohlcvs, high, defaultValue = []);
    lows = self.safeList(ohlcvs, low, defaultValue = []);
    closes = self.safeList(ohlcvs, close, defaultValue = []);
    volumes = self.safeList(ohlcvs, volume, defaultValue = []);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(timestamps)))
        push!(result, [functions.ccxtruthy(ms) ? safeInteger(timestamps, i) : safeTimestamp(timestamps, i), safeValue(opens, i), safeValue(highs, i), safeValue(lows, i), safeValue(closes, i), safeValue(volumes, i)]);
        i += 1
    end
    return result

end
function convertOHLCVToTradingView(self::CcxtExchange, ohlcvs; timestamp="t", open="o", high="h", low="l", close="c", volume="v", ms=false)
    result = Dict{Symbol, Any}();
    result[Symbol(timestamp)] = [];
    result[Symbol(open)] = [];
    result[Symbol(high)] = [];
    result[Symbol(low)] = [];
    result[Symbol(close)] = [];
    result[Symbol(volume)] = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ohlcvs)))
        ts = functions.ccxtruthy(ms) ? get(get(ohlcvs, i + 1, nothing), 1, nothing) : self.parseToInt(get(get(ohlcvs, i + 1, nothing), 1, nothing) / 1000);
        resultTimestamp = get(result, Symbol(timestamp), nothing);
        push!(resultTimestamp, ts);
        resultOpen = get(result, Symbol(open), nothing);
        push!(resultOpen, get(get(ohlcvs, i + 1, nothing), 2, nothing));
        resultHigh = get(result, Symbol(high), nothing);
        push!(resultHigh, get(get(ohlcvs, i + 1, nothing), 3, nothing));
        resultLow = get(result, Symbol(low), nothing);
        push!(resultLow, get(get(ohlcvs, i + 1, nothing), 4, nothing));
        resultClose = get(result, Symbol(close), nothing);
        push!(resultClose, get(get(ohlcvs, i + 1, nothing), 5, nothing));
        resultVolume = get(result, Symbol(volume), nothing);
        push!(resultVolume, get(get(ohlcvs, i + 1, nothing), 6, nothing));
        i += 1
    end
    return result

end
function fetchWebEndpoint(self::CcxtExchange, method, endpointMethod, returnAsJson; startRegex=nothing, endRegex=nothing)
    errorMessage = "";
    options = safeValue(self.options, method, Dict{Symbol, Any}());
    muteOnFailure = self.safeBool(options, "webApiMuteFailure", defaultValue = true);
    try
        if functions.ccxtruthy(self.safeBool(options, "webApiEnable", defaultValue = true) != true)
                return nothing
        end
        maxRetries = safeValue(options, "webApiRetries", 10);
        response = nothing;
        retry = 0;
        shouldBreak = false;
        while functions.ccxtruthy(functions.ccxt_lt(retry, maxRetries))
            try
                response = getproperty(self, Symbol(endpointMethod))(Dict{Symbol, Any}());
                shouldBreak = true;
                break
            catch e
                retry = retry + 1;
                if functions.ccxtruthy(retry == maxRetries)
                    throw(e);
                end

            end
            if functions.ccxtruthy(shouldBreak)
                break
            end
        end
        content = response;
        if functions.ccxtruthy(content == nothing)
            throw(NullResponse(string(self.id, " fetchWebEndpoint() returned empty content")));
        end
        if functions.ccxtruthy(startRegex != nothing)
            splitted_by_start = split(content, startRegex);
            content = get(splitted_by_start, 2, nothing);
        end
        if functions.ccxtruthy(content == nothing)
            throw(NullResponse(string(self.id, " fetchWebEndpoint() returned empty content")));
        end
        if functions.ccxtruthy(endRegex != nothing)
            splitted_by_end = split(content, endRegex);
            content = get(splitted_by_end, 1, nothing);
        end
        if functions.ccxtruthy(@functions.ccxt_and(returnAsJson, (isa(content, AbstractString))))
            jsoned = self.parseJson(strip(content));
            if functions.ccxtruthy(jsoned)
                    return jsoned
            else
                throw(BadResponse("could not parse the response into json"));
            end
        else
            return content
        end
    catch e
        errorMessage = string(self.id, " ", method, "() failed to fetch correct data from website. Probably webpage markup has been changed, breaking the page custom parser.");

    end
    if functions.ccxtruthy(muteOnFailure)
            return nothing
    else
        throw(BadResponse(errorMessage));
    end

end
function marketIds(self::CcxtExchange; symbols)

end
function marketIds(self::CcxtExchange; symbols=nothing)

end
function marketIds(self::CcxtExchange; symbols=nothing)
    if functions.ccxtruthy(symbols == nothing)
            return symbols
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        id = self.marketId(get(symbols, i + 1, nothing));
        if functions.ccxtruthy(id != nothing)
                        push!(result, id);
        end
        i += 1
    end
    return result

end
function currencyIds(self::CcxtExchange; codes)

end
function currencyIds(self::CcxtExchange; codes=nothing)

end
function currencyIds(self::CcxtExchange; codes=nothing)
    if functions.ccxtruthy(codes == nothing)
            return codes
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(codes)))
        id = self.currencyId(get(codes, i + 1, nothing));
        if functions.ccxtruthy(id != nothing)
                        push!(result, id);
        end
        i += 1
    end
    return result

end
function marketsForSymbols(self::CcxtExchange; symbols=nothing)
    if functions.ccxtruthy(symbols == nothing)
            return nothing
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        push!(result, self.market(get(symbols, i + 1, nothing)));
        i += 1
    end
    return result

end
function marketSymbols(self::CcxtExchange; symbols, type_var, allowEmpty, sameTypeOnly=nothing, sameSubTypeOnly=nothing)

end
function marketSymbols(self::CcxtExchange; symbols, type_var=nothing, allowEmpty=nothing, sameTypeOnly=nothing, sameSubTypeOnly=nothing)

end
function marketSymbols(self::CcxtExchange; symbols=nothing, type_var=nothing, allowEmpty=nothing, sameTypeOnly=nothing, sameSubTypeOnly=nothing)

end
function marketSymbols(self::CcxtExchange; symbols=nothing, type_var=nothing, allowEmpty=true, sameTypeOnly=false, sameSubTypeOnly=false)
    if functions.ccxtruthy(symbols == nothing)
        if functions.ccxtruthy(!functions.ccxtruthy(allowEmpty))
            throw(ArgumentsRequired(string(self.id, " empty list of symbols is not supported")));
        end
            return symbols
    end
    symbolsLength = length(symbols);
    if functions.ccxtruthy(symbolsLength == 0)
        if functions.ccxtruthy(!functions.ccxtruthy(allowEmpty))
            throw(ArgumentsRequired(string(self.id, " empty list of symbols is not supported")));
        end
            return symbols
    end
    result = [];
    marketType = nothing;
    isLinearSubType = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
        market = self.market(get(symbols, i + 1, nothing));
        if functions.ccxtruthy(@functions.ccxt_and(sameTypeOnly, (marketType != nothing)))
            if functions.ccxtruthy(get(market, Symbol("type"), nothing) != marketType)
                throw(BadRequest(string(self.id, " symbols must be of the same type, either ", marketType, " or ", get(market, Symbol("type"), nothing), ".")));
            end
        end
        if functions.ccxtruthy(@functions.ccxt_and(sameSubTypeOnly, (isLinearSubType != nothing)))
            if functions.ccxtruthy(get(market, Symbol("linear"), nothing) != isLinearSubType)
                throw(BadRequest(string(self.id, " symbols must be of the same subType, either linear or inverse.")));
            end
        end
        if functions.ccxtruthy(@functions.ccxt_and(type_var != nothing, get(market, Symbol("type"), nothing) != type_var))
            throw(BadRequest(string(self.id, " symbols must be of the same type ", type_var, ". If the type is incorrect you can change it in options or the params of the request")));
        end
        marketType = get(market, Symbol("type"), nothing);
        if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("spot"), nothing)))
            isLinearSubType = get(market, Symbol("linear"), nothing);
        end
        symbol = safeString(market, "symbol", get(symbols, i + 1, nothing));
        push!(result, symbol);
        i += 1
    end
    return result

end
function marketCodes(self::CcxtExchange; codes=nothing)
    if functions.ccxtruthy(codes == nothing)
            return codes
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(codes)))
        push!(result, self.commonCurrencyCode(get(codes, i + 1, nothing)));
        i += 1
    end
    return result

end
function parseOrderBookBidsAsks(self::CcxtExchange, bidasks; priceKey=0, amountKey=1, countOrIdKey=2)
    bidasks = toArray(bidasks);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(bidasks)))
        push!(result, self.parseOrderBookBidAsk(get(bidasks, i + 1, nothing), priceKey = priceKey, amountKey = amountKey, countOrIdKey = countOrIdKey));
        i += 1
    end
    return result

end
function filterByKey(self::CcxtExchange, objects, key; value=nothing)
    if functions.ccxtruthy(value == nothing)
            return objects
    end
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(objects)))
        objectValue = safeString(get(objects, i + 1, nothing), key);
        if functions.ccxtruthy(objectValue == value)
                        push!(result, get(objects, i + 1, nothing));
        end
        i += 1
    end
    return result

end
function filterBySymbol(self::CcxtExchange, objects; symbol=nothing)
    return self.filterByKey(objects, "symbol", value = symbol)

end
function parseOHLCV(self::CcxtExchange, ohlcv; market=nothing)
    if functions.ccxtruthy(functions.ccxt_isArray(ohlcv))
            return [safeInteger(ohlcv, 0), self.safeNumber(ohlcv, 1), self.safeNumber(ohlcv, 2), self.safeNumber(ohlcv, 3), self.safeNumber(ohlcv, 4), self.safeNumber(ohlcv, 5)]
    end
    return ohlcv

end
function safeNetwork(self::CcxtExchange, network)
    withdrawEnabled = self.safeBool(network, "withdraw");
    depositEnabled = self.safeBool(network, "deposit");
    limits = self.safeDict(network, "limits");
    withdraw = self.safeDict(limits, "withdraw");
    deposit = self.safeDict(limits, "deposit");
    isEnabled = (@functions.ccxt_and(withdrawEnabled, depositEnabled));
    return Dict{Symbol, Any}(
    Symbol("info") => get(network, Symbol("info"), nothing),
    Symbol("id") => safeString(network, "id"),
    Symbol("name") => safeString(network, "name"),
    Symbol("network") => safeString(network, "network"),
    Symbol("active") => self.safeBool(network, "active", defaultValue = isEnabled),
    Symbol("deposit") => depositEnabled,
    Symbol("withdraw") => withdrawEnabled,
    Symbol("fee") => self.safeNumber(network, "fee"),
    Symbol("precision") => self.safeNumber(network, "precision"),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(withdraw, "min"),
            Symbol("max") => self.safeNumber(withdraw, "max")
        ),
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(deposit, "min"),
            Symbol("max") => self.safeNumber(deposit, "max")
        )
    )
)

end
function prioritizedNetworkAliases(self::CcxtExchange; networkCode=nothing, currencyCode=nothing, allowDefault=false)
    if functions.ccxtruthy(networkCode == nothing)
            return nothing
    end
    replacements = self.safeDict(self.options, "defaultNetworkCodeReplacements", defaultValue = Dict{Symbol, Any}());
    keys_var = objectKeys(replacements);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        baseCoin = get(keys_var, i + 1, nothing);
        entry = get(replacements, Symbol(baseCoin), nothing);
        primary = get(entry, Symbol("primary"), nothing);
        secondary = get(entry, Symbol("secondary"), nothing);
        if functions.ccxtruthy(@functions.ccxt_and(networkCode != primary, networkCode != secondary))
            i += 1; continue
        end
        preferPrimary = false;
        if functions.ccxtruthy(currencyCode == baseCoin)
            preferPrimary = true;
        elseif functions.ccxtruthy(currencyCode != nothing)
            preferPrimary = false;
        else
            if functions.ccxtruthy(allowDefault)
                preferPrimary = (get(entry, Symbol("default"), nothing) == "primary");
            else
                preferPrimary = (networkCode == primary);
            end

        end
        return functions.ccxtruthy((preferPrimary)) ? [primary, secondary] : [secondary, primary]
        i += 1
    end
    return [networkCode, networkCode]

end
function networkCodeToId(self::CcxtExchange, networkCode; currencyCode=nothing)
    if functions.ccxtruthy(networkCode == nothing)
            return nothing
    end
    networkIdsByCodes = self.safeDict(self.options, "networks", defaultValue = Dict{Symbol, Any}());
    chainPair = self.prioritizedNetworkAliases(networkCode = networkCode, currencyCode = currencyCode, allowDefault = false);
    preferredChain = functions.ccxtruthy((chainPair == nothing)) ? networkCode : get(chainPair, 1, nothing);
    alternativeChain = functions.ccxtruthy((chainPair == nothing)) ? networkCode : get(chainPair, 2, nothing);
    networkId = safeString2(networkIdsByCodes, preferredChain, alternativeChain);
    if functions.ccxtruthy(networkId != nothing)
            return networkId
    end
    currenciesToCheck = [];
    if functions.ccxtruthy(currencyCode == nothing)
        currenciesToCheck = objectKeys(self.currencies);
    else
        currenciesToCheck = [self.safeDict(self.currencies, currencyCode)];
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(currenciesToCheck)))
        networks = self.safeDict(get(currenciesToCheck, i + 1, nothing), "networks", defaultValue = Dict{Symbol, Any}());
        if functions.ccxtruthy(ccxt_in(networkCode, networks))
                return safeString(get(networks, Symbol(networkCode), nothing), "id")
        end
        i += 1
    end
    oldCodes = self.safeDict(self.options, "backwardSupportedNetworkCodes", defaultValue = Dict{Symbol, Any}());
    if functions.ccxtruthy(ccxt_in(networkCode, oldCodes))
            return self.networkCodeToId(get(oldCodes, Symbol(networkCode), nothing), currencyCode = currencyCode)
    end
    return networkCode

end
function networkIdToCode(self::CcxtExchange; networkId=nothing, currencyCode=nothing)
    if functions.ccxtruthy(networkId == nothing)
            return nothing
    end
    networkCodesByIds = self.safeDict(self.options, "networksById", defaultValue = Dict{Symbol, Any}());
    networkCode = safeString(networkCodesByIds, networkId, networkId);
    chainPair = self.prioritizedNetworkAliases(networkCode = networkCode, currencyCode = currencyCode, allowDefault = true);
    if functions.ccxtruthy(chainPair == nothing)
            return networkCode
    end
    preferredChain = get(chainPair, 1, nothing);
    alternativeChain = get(chainPair, 2, nothing);
    if functions.ccxtruthy(currencyCode == nothing)
        networkIdsByCodes = self.safeDict(self.options, "networks", defaultValue = Dict{Symbol, Any}());
        if functions.ccxtruthy(@functions.ccxt_and((ccxt_in(preferredChain, networkIdsByCodes)), (ccxt_in(alternativeChain, networkIdsByCodes))))
                return networkCode
        end
    end
    return preferredChain

end
function handleNetworkCodeAndParams(self::CcxtExchange, params)
    networkCodeInParams = safeString2(params, "networkCode", "network");
    if functions.ccxtruthy(networkCodeInParams != nothing)
        params = omit(params, ["networkCode", "network"]);
    end
    return [networkCodeInParams, params]

end
function defaultNetworkCode(self::CcxtExchange, currencyCode)
    defaultNetworkCode = nothing;
    defaultNetworks = self.safeDict(self.options, "defaultNetworks", defaultValue = Dict{Symbol, Any}());
    if functions.ccxtruthy(ccxt_in(currencyCode, defaultNetworks))
        defaultNetworkCode = get(defaultNetworks, Symbol(currencyCode), nothing);
    else
        defaultNetwork = safeString(self.options, "defaultNetwork");
        if functions.ccxtruthy(defaultNetwork != nothing)
            defaultNetworkCode = defaultNetwork;
        end
    end
    return defaultNetworkCode

end
function selectNetworkCodeFromUnifiedNetworks(self::CcxtExchange, currencyCode, networkCode, indexedNetworkEntries)
    return self.selectNetworkKeyFromNetworks(currencyCode, networkCode, indexedNetworkEntries, isIndexedByUnifiedNetworkCode = true)

end
function selectNetworkIdFromRawNetworks(self::CcxtExchange, currencyCode, networkCode, indexedNetworkEntries)
    return self.selectNetworkKeyFromNetworks(currencyCode, networkCode, indexedNetworkEntries, isIndexedByUnifiedNetworkCode = false)

end
function selectNetworkKeyFromNetworks(self::CcxtExchange, currencyCode, networkCode, indexedNetworkEntries; isIndexedByUnifiedNetworkCode=false)
    chosenNetworkId = nothing;
    availableNetworkIds = objectKeys(indexedNetworkEntries);
    responseNetworksLength = length(availableNetworkIds);
    if functions.ccxtruthy(networkCode != nothing)
        if functions.ccxtruthy(responseNetworksLength == 0)
            throw(NotSupported(string(self.id, " - ", networkCode, " network did not return any result for ", currencyCode)));
        else
            networkIdOrCode = functions.ccxtruthy(isIndexedByUnifiedNetworkCode) ? networkCode : self.networkCodeToId(networkCode, currencyCode = currencyCode);
            if functions.ccxtruthy(ccxt_in(networkIdOrCode, indexedNetworkEntries))
                chosenNetworkId = networkIdOrCode;
            else
                throw(NotSupported(string(self.id, " - ", networkIdOrCode, " network was not found for ", currencyCode, ", use one of ", join(availableNetworkIds, ", "))));
            end
        end
    else
        if functions.ccxtruthy(responseNetworksLength == 0)
            throw(NotSupported(string(self.id, " - no networks were returned for ", currencyCode)));
        else
            defaultNetworkCode = self.defaultNetworkCode(currencyCode);
            defaultNetworkId = functions.ccxtruthy(isIndexedByUnifiedNetworkCode) ? defaultNetworkCode : self.networkCodeToId(defaultNetworkCode, currencyCode = currencyCode);
            if functions.ccxtruthy(defaultNetworkId == nothing)
                throw(ExchangeError(string(self.id, " selectNetworkKeyFromNetworks() missing defaultNetworkId")));
            end
            if functions.ccxtruthy(ccxt_in(defaultNetworkId, indexedNetworkEntries))
                    return defaultNetworkId
            end
            throw(NotSupported(string(self.id, " - can not determine the default network, please pass param[\"network\"] one from : ", join(availableNetworkIds, ", "))));
        end
    end
    return chosenNetworkId

end
function safeNumber2(self::CcxtExchange, dictionary, key1, key2; d=nothing)
    value = safeString2(dictionary, key1, key2);
    return self.parseNumber(value, d = d)

end
function parseOrderBook(self::CcxtExchange, orderbook, symbol; timestamp=nothing, bidsKey="bids", asksKey="asks", priceKey=0, amountKey=1, countOrIdKey=2)
    if functions.ccxtruthy(orderbook == nothing)
        orderbook = Dict{Symbol, Any}();
    end
    bids = self.parseOrderBookBidsAsks(safeValue(orderbook, bidsKey, []), priceKey = priceKey, amountKey = amountKey, countOrIdKey = countOrIdKey);
    asks = self.parseOrderBookBidsAsks(safeValue(orderbook, asksKey, []), priceKey = priceKey, amountKey = amountKey, countOrIdKey = countOrIdKey);
    return Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("bids") => sortBy(bids, 0, true),
    Symbol("asks") => sortBy(asks, 0),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("nonce") => nothing
)

end
function parseOHLCVs(self::CcxtExchange, ohlcvs; market=nothing, timeframe="1m", since=nothing, limit=nothing, tail=false)
    if functions.ccxtruthy(ohlcvs == nothing)
            return []
    end
    results = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ohlcvs)))
        push!(results, self.parseOHLCV(get(ohlcvs, i + 1, nothing), market = market));
        i += 1
    end
    sorted = sortBy(results, 0);
    return self.filterBySinceLimit(sorted, since = since, limit = limit, key = 0, tail = tail)

end
function parseLeverageTiers(self::CcxtExchange, response; symbols=nothing, marketIdKey=nothing)
    symbols = self.marketSymbols(symbols = symbols);
    tiers = Dict{Symbol, Any}();
    symbolsLength = 0;
    if functions.ccxtruthy(symbols != nothing)
        symbolsLength = length(symbols);
    end
    noSymbols = @functions.ccxt_or((symbols == nothing), (symbolsLength == 0));
    if functions.ccxtruthy(functions.ccxt_isArray(response))
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
            item = get(response, i + 1, nothing);
            id = functions.ccxtruthy((marketIdKey == nothing)) ? nothing : safeString(item, marketIdKey);
            market = self.safeMarket(marketId = id, market = nothing, delimiter = nothing, marketType = "swap");
            symbol = get(market, Symbol("symbol"), nothing);
            contract = self.safeBool(market, "contract", defaultValue = false);
            if functions.ccxtruthy(@functions.ccxt_and(contract, (@functions.ccxt_or(noSymbols, (@functions.ccxt_and((symbols != nothing), inArray(symbol, symbols)))))))
                tiers[Symbol(symbol)] = self.parseMarketLeverageTiers(item, market = market);
            end
            i += 1
        end

    else
        keys_var = objectKeys(response);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
            marketId = get(keys_var, i + 1, nothing);
            item = get(response, Symbol(marketId), nothing);
            market = self.safeMarket(marketId = marketId, market = nothing, delimiter = nothing, marketType = "swap");
            symbol = get(market, Symbol("symbol"), nothing);
            contract = self.safeBool(market, "contract", defaultValue = false);
            if functions.ccxtruthy(@functions.ccxt_and(contract, (@functions.ccxt_or(noSymbols, (@functions.ccxt_and((symbols != nothing), inArray(symbol, symbols)))))))
                tiers[Symbol(symbol)] = self.parseMarketLeverageTiers(item, market = market);
            end
            i += 1
        end
    end
    return tiers

end
function loadTradingLimits(self::CcxtExchange; symbols=nothing, reload=false, params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchTradingLimits"), nothing))
        if functions.ccxtruthy(@functions.ccxt_or(reload, !functions.ccxtruthy((ccxt_in("limitsLoaded", self.options)))))
            response = self.fetchTradingLimits(symbols = symbols);
            symbolsArray = self.requireValue(symbols, message = "loadTradingLimits() requires a symbols argument");
            markets = self.markets;
            if functions.ccxtruthy(markets == nothing)
                throw(ExchangeError(string(self.id, " markets not loaded")));
            end
            i = 0
            while functions.ccxtruthy(functions.ccxt_lt(i, length(symbolsArray)))
                symbol = get(symbolsArray, i + 1, nothing);
                markets[Symbol(symbol)] = deepExtend(get(markets, Symbol(symbol), nothing), get(response, Symbol(symbol), nothing));
                i += 1
            end

            self.options[Symbol("limitsLoaded")] = milliseconds();
        end
    end
    return self.markets

end
function safePosition(self::CcxtExchange, position)
    unrealizedPnlString = safeString(position, "unrealizedPnl");
    initialMarginString = safeString(position, "initialMargin");
    percentage = safeValue(position, "percentage");
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((percentage == nothing), (unrealizedPnlString != nothing)), (initialMarginString != nothing)))
        percentageString = stringMul(stringDiv(unrealizedPnlString, initialMarginString, 4), "100");
        position[Symbol("percentage")] = self.parseNumber(percentageString);
    end
    contractSize = self.safeNumber(position, "contractSize");
    symbol = safeString(position, "symbol");
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = safeValue(self.markets, symbol);
    end
    if functions.ccxtruthy(@functions.ccxt_and(contractSize == nothing, market != nothing))
        contractSize = self.safeNumber(market, "contractSize");
        position[Symbol("contractSize")] = contractSize;
    end
    return position

end
function parsePositions(self::CcxtExchange, positions; symbols=nothing, params=Dict())
    symbols = self.marketSymbols(symbols = symbols);
    positionsArray = toArray(positions);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(positionsArray)))
        position = extend(self.parsePosition(get(positionsArray, i + 1, nothing)), params);
        push!(result, position);
        i += 1
    end
    return self.filterByArrayPositions(result, "symbol", values = symbols, indexed = false)

end
function parseADLRank(self::CcxtExchange, info; market=nothing)
    if functions.ccxtruthy(info == nothing)
        throw(NotSupported(string(self.id, " parseADLRank() is not supported yet")));
    end
    throw(NotSupported(string(self.id, " parseADLRank() is not supported yet")));

end
function parseADLRanks(self::CcxtExchange, ranks; symbols=nothing, params=Dict())
    symbols = self.marketSymbols(symbols = symbols);
    ranksArray = toArray(ranks);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ranksArray)))
        rank = extend(self.parseADLRank(get(ranksArray, i + 1, nothing)), params);
        push!(result, rank);
        i += 1
    end
    return self.filterByArrayPositions(result, "symbol", values = symbols, indexed = false)

end
function parseAccounts(self::CcxtExchange, accounts; params=Dict())
    accountsArray = toArray(accounts);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(accountsArray)))
        account = extend(self.parseAccount(get(accountsArray, i + 1, nothing)), params);
        push!(result, account);
        i += 1
    end
    return result

end
function parseTradesHelper(self::CcxtExchange, isWs, trades; market=nothing, since=nothing, limit=nothing, params=Dict())
    tradesArray = toArray(trades);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(tradesArray)))
        parsed = nothing;
        if functions.ccxtruthy(isWs)
            parsed = self.parseWsTrade(get(tradesArray, i + 1, nothing), market = market);
        else
            parsed = self.parseTrade(get(tradesArray, i + 1, nothing), market = market);
        end
        trade = extend(parsed, params);
        push!(result, trade);
        i += 1
    end
    result = sortBy2(result, "timestamp", "id");
    symbol = safeString(market, "symbol");
    return self.filterBySymbolSinceLimit(result, symbol = symbol, since = since, limit = limit)

end
function parseTrades(self::CcxtExchange, trades; market=nothing, since=nothing, limit=nothing, params=Dict())
    return self.parseTradesHelper(false, trades, market = market, since = since, limit = limit, params = params)

end
function parseWsTrades(self::CcxtExchange, trades; market=nothing, since=nothing, limit=nothing, params=Dict())
    return self.parseTradesHelper(true, trades, market = market, since = since, limit = limit, params = params)

end
function parseTransactions(self::CcxtExchange, transactions; currency=nothing, since=nothing, limit=nothing, params=Dict())
    transactionsArray = toArray(transactions);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(transactionsArray)))
        transaction = extend(self.parseTransaction(get(transactionsArray, i + 1, nothing), currency = currency), params);
        push!(result, transaction);
        i += 1
    end
    result = sortBy(result, "timestamp");
    code = functions.ccxtruthy((currency != nothing)) ? get(currency, Symbol("code"), nothing) : nothing;
    return self.filterByCurrencySinceLimit(result, code = code, since = since, limit = limit)

end
function parseTransfers(self::CcxtExchange, transfers; currency=nothing, since=nothing, limit=nothing, params=Dict())
    transfersArray = toArray(transfers);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(transfersArray)))
        transfer = extend(self.parseTransfer(get(transfersArray, i + 1, nothing), currency = currency), params);
        push!(result, transfer);
        i += 1
    end
    result = sortBy(result, "timestamp");
    code = functions.ccxtruthy((currency != nothing)) ? get(currency, Symbol("code"), nothing) : nothing;
    return self.filterByCurrencySinceLimit(result, code = code, since = since, limit = limit)

end
function parseLedger(self::CcxtExchange, data; currency=nothing, since=nothing, limit=nothing, params=Dict())
    result = [];
    arrayData = toArray(data);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(arrayData)))
        itemOrItems = self.parseLedgerEntry(get(arrayData, i + 1, nothing), currency = currency);
        if functions.ccxtruthy(functions.ccxt_isArray(itemOrItems))
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, length(itemOrItems)))
                push!(result, extend(get(itemOrItems, j + 1, nothing), params));
                j += 1
            end

        else
            push!(result, extend(itemOrItems, params));
        end
        i += 1
    end
    result = sortBy(result, "timestamp");
    code = functions.ccxtruthy((currency != nothing)) ? get(currency, Symbol("code"), nothing) : nothing;
    return self.filterByCurrencySinceLimit(result, code = code, since = since, limit = limit)

end
function nonce(self::CcxtExchange, )
    return seconds()

end
function setHeaders(self::CcxtExchange, headers)
    return headers

end
function currencyId(self::CcxtExchange, code)
    if functions.ccxtruthy(code == nothing)
            return code
    end
    currency = self.safeDict(self.currencies, code);
    if functions.ccxtruthy(currency == nothing)
        currency = self.safeCurrency(code);
    end
    if functions.ccxtruthy(currency != nothing)
            return get(currency, Symbol("id"), nothing)
    end
    return code

end
function marketId(self::CcxtExchange, symbol)
    market = self.market(symbol);
    if functions.ccxtruthy(market != nothing)
            return get(market, Symbol("id"), nothing)
    end
    return symbol

end
function symbol(self::CcxtExchange, symbol)
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " symbol() requires a symbol argument")));
    end
    market = self.market(symbol);
    return safeString(market, "symbol", symbol)

end
function handleParamString(self::CcxtExchange, params, paramName; defaultValue)

end
function handleParamString(self::CcxtExchange, params, paramName; defaultValue=nothing)

end
function handleParamString(self::CcxtExchange, params, paramName; defaultValue=nothing)
    value = safeString(params, paramName, defaultValue);
    if functions.ccxtruthy(value != nothing)
        params = omit(params, paramName);
    end
    return [value, params]

end
function handleParamString2(self::CcxtExchange, params, paramName1, paramName2; defaultValue)

end
function handleParamString2(self::CcxtExchange, params, paramName1, paramName2; defaultValue=nothing)

end
function handleParamString2(self::CcxtExchange, params, paramName1, paramName2; defaultValue=nothing)
    value = safeString2(params, paramName1, paramName2, defaultValue);
    if functions.ccxtruthy(value != nothing)
        params = omit(params, [paramName1, paramName2]);
    end
    return [value, params]

end
function handleParamInteger(self::CcxtExchange, params, paramName; defaultValue=nothing)
    value = safeInteger(params, paramName, defaultValue);
    if functions.ccxtruthy(value != nothing)
        params = omit(params, paramName);
    end
    return [value, params]

end
function handleParamInteger2(self::CcxtExchange, params, paramName1, paramName2; defaultValue=nothing)
    value = safeInteger2(params, paramName1, paramName2, defaultValue);
    if functions.ccxtruthy(value != nothing)
        params = omit(params, [paramName1, paramName2]);
    end
    return [value, params]

end
function handleParamBool(self::CcxtExchange, params, paramName; defaultValue=nothing)
    value = self.safeBool(params, paramName, defaultValue = defaultValue);
    if functions.ccxtruthy(value != nothing)
        params = omit(params, paramName);
    end
    return [value, params]

end
function handleParamBool2(self::CcxtExchange, params, paramName1, paramName2; defaultValue=nothing)
    value = self.safeBool2(params, paramName1, paramName2, defaultValue = defaultValue);
    if functions.ccxtruthy(value != nothing)
        params = omit(params, [paramName1, paramName2]);
    end
    return [value, params]

end
"""

# Arguments
- `params`::object: - extra parameters
- `request`::object: - existing dictionary of request
- `exchangeSpecificKey`::string: - the key for chain id to be set in request
- `currencyCode`::object: - (optional) existing dictionary of request
- `isRequired`::bool: - (optional) whether that param is required to be present

# Returns
- - returns [request, params] where request is the modified request object and params is the modified params object
"""
function handleRequestNetwork(self::CcxtExchange, params, request, exchangeSpecificKey; currencyCode=nothing, isRequired=false)
    networkCode = nothing;
    (networkCode, params) = self.handleNetworkCodeAndParams(params);
    if functions.ccxtruthy(networkCode != nothing)
        request[Symbol(exchangeSpecificKey)] = self.networkCodeToId(networkCode, currencyCode = currencyCode);
    elseif functions.ccxtruthy(isRequired)
        throw(ArgumentsRequired(string(self.id, " - \"network\" param is required for this request")));
    end
    return [request, params]

end
function resolvePath(self::CcxtExchange, path, params)
    return [self.implodeParams(path, params), omit(params, self.extractParams(path))]

end
function getListFromObjectValues(self::CcxtExchange, objects, key)
    newArray = objects;
    if functions.ccxtruthy(!functions.ccxtruthy(functions.ccxt_isArray(objects)))
        newArray = toArray(objects);
    end
    results = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(newArray)))
        push!(results, get(get(newArray, i + 1, nothing), Symbol(key), nothing));
        i += 1
    end
    return results

end
function getSymbolsForMarketType(self::CcxtExchange; marketType=nothing, subType=nothing, symbolWithActiveStatus=true, symbolWithUnknownStatus=true)
    filteredMarkets = self.markets;
    if functions.ccxtruthy(marketType != nothing)
        filteredMarkets = filterBy(filteredMarkets, "type", marketType);
    end
    if functions.ccxtruthy(subType != nothing)
        self.checkRequiredArgument("getSymbolsForMarketType", subType, "subType", options = ["linear", "inverse", "quanto"]);
        filteredMarkets = filterBy(filteredMarkets, "subType", subType);
    end
    activeStatuses = [];
    if functions.ccxtruthy(symbolWithActiveStatus)
                push!(activeStatuses, true);
    end
    if functions.ccxtruthy(symbolWithUnknownStatus)
                push!(activeStatuses, nothing);
    end
    filteredMarkets = self.filterByArray(filteredMarkets, "active", values = activeStatuses, indexed = false);
    return self.getListFromObjectValues(filteredMarkets, "symbol")

end
function filterByArray(self::CcxtExchange, objects, key; values=nothing, indexed=true)
    objects = toArray(objects);
    if functions.ccxtruthy(@functions.ccxt_or(values == nothing, !functions.ccxtruthy(values)))
        if functions.ccxtruthy(indexed)
                return indexBy(objects, key)
        else
            return objects
        end
    end
    results = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(objects)))
        if functions.ccxtruthy(inArray(get(get(objects, i + 1, nothing), Symbol(key), nothing), values))
                        push!(results, get(objects, i + 1, nothing));
        end
        i += 1
    end
    if functions.ccxtruthy(indexed)
            return indexBy(results, key)
    end
    return results

end
function filterOutByArray(self::CcxtExchange, objects, key; values=nothing, indexed=true)
    objects = toArray(objects);
    if functions.ccxtruthy(@functions.ccxt_or(values == nothing, !functions.ccxtruthy(values)))
        if functions.ccxtruthy(indexed)
                return indexBy(objects, key)
        else
            return objects
        end
    end
    results = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(objects)))
        if functions.ccxtruthy(!functions.ccxtruthy(inArray(get(get(objects, i + 1, nothing), Symbol(key), nothing), values)))
                        push!(results, get(objects, i + 1, nothing));
        end
        i += 1
    end
    if functions.ccxtruthy(indexed)
            return indexBy(results, key)
    end
    return results

end
function fetch2(self::CcxtExchange, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing, config=Dict())
    if functions.ccxtruthy(self.enableRateLimit)
        cost = self.calculateRateLimiterCost(api, method, path, params, config = config);
        self.throttle(cost = cost);
    end
    retries = 0;
    (retries, params) = self.handleOptionAndParams(params, path, "maxRetriesOnFailure", defaultValue = retries);
    retryDelay = 0;
    (retryDelay, params) = self.handleOptionAndParams(params, path, "maxRetriesOnFailureDelay", defaultValue = retryDelay);
    fetchData = nothing;
    fetchDataCacheEnabled = functions.ccxt_gt(self.fetchHistoryCacheSize, 0);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, retries + 1))
        if functions.ccxtruthy(fetchDataCacheEnabled)
            fetchData = Dict{Symbol, Any}(
                Symbol("request") => nothing,
                Symbol("response") => Dict{Symbol, Any}(
                    Symbol("body") => nothing
                ),
                Symbol("error") => nothing
            );
        end
        try
            self.setLastRestRequestTimestamp();
            request = self.sign(path, api = api, method = method, params = params, headers = headers, body = body);
            if functions.ccxtruthy(@functions.ccxt_and(fetchDataCacheEnabled, (fetchData != nothing)))
                fetchData[Symbol("request")] = request;
            end
            self.setLastRequest(request);
            response = self.fetch(get(request, Symbol("url"), nothing), method = get(request, Symbol("method"), nothing), headers = get(request, Symbol("headers"), nothing), body = get(request, Symbol("body"), nothing));
            if functions.ccxtruthy(@functions.ccxt_and(fetchDataCacheEnabled, (fetchData != nothing)))
                fetchData[Symbol("response")][Symbol("body")] = response;
                self.addFetchCache(fetchData);
            end
            return response
        catch e
            if functions.ccxtruthy(@functions.ccxt_and(fetchDataCacheEnabled, (fetchData != nothing)))
                fetchData[Symbol("error")] = e;
                self.addFetchCache(fetchData);
            end
            if functions.ccxtruthy(isa(e, OperationFailed))
                if functions.ccxtruthy(functions.ccxt_lt(i, retries))
                    if functions.ccxtruthy(self.verbose)
                        index = i + 1;
                        self.log(string("Request failed with the error: ", e, ", retrying ", index, " of ", retries, "..."));
                    end
                    if functions.ccxtruthy(@functions.ccxt_and((retryDelay != nothing), (retryDelay != 0)))
                        self.sleep(retryDelay);
                    end
                else
                    throw(e);
                end
            else
                throw(e);
            end

        end
        i += 1
    end
    return nothing

end
function request(self::CcxtExchange, path; api="public", method="GET", params=Dict(), headers=nothing, body=nothing, config=Dict())
    return self.fetch2(path, api = api, method = method, params = params, headers = headers, body = body, config = config)

end
function loadAccounts(self::CcxtExchange; reload=false, params=Dict())
    if functions.ccxtruthy(reload)
        self.accounts = self.fetchAccounts(params = params);
    else
        if functions.ccxtruthy(self.accounts)
                return self.accounts
        else
            self.accounts = self.fetchAccounts(params = params);
        end
    end
    self.accountsById = indexBy(self.accounts, "id");
    return self.accounts

end
function buildOHLCVC(self::CcxtExchange, trades; timeframe="1m", since=0, limit=2147483647)
    ms = self.parseTimeframe(timeframe) * 1000;
    ohlcvs = [];
    i_timestamp = 0;
    i_high = 2;
    i_low = 3;
    i_close = 4;
    i_volume = 5;
    i_count = 6;
    tradesLength = length(trades);
    oldest = min(tradesLength, limit);
    options = self.safeDict(self.options, "buildOHLCVC", defaultValue = Dict{Symbol, Any}());
    skipZeroPrices = self.safeBool(options, "skipZeroPrices", defaultValue = true);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, oldest))
        trade = get(trades, i + 1, nothing);
        ts = get(trade, Symbol("timestamp"), nothing);
        price = get(trade, Symbol("price"), nothing);
        if functions.ccxtruthy(@functions.ccxt_or((ts == nothing), (price == nothing)))
            i += 1; continue
        end
        if functions.ccxtruthy(functions.ccxt_lt(ts, since))
            i += 1; continue
        end
        if functions.ccxtruthy(ts == nothing)
            throw(ExchangeError(string(self.id, " buildOHLCVC() missing ts")));
        end
        openingTime = floor(ts / ms) * ms;
        if functions.ccxtruthy(functions.ccxt_lt(openingTime, since))
            i += 1; continue
        end
        ohlcv_length = length(ohlcvs);
        candle = ohlcv_length - 1;
        if functions.ccxtruthy(price == nothing)
            throw(ArgumentsRequired(string(self.id, " buildOHLCVC() requires a price argument")));
        end
        if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(skipZeroPrices, !functions.ccxtruthy((functions.ccxt_gt(price, 0)))), !functions.ccxtruthy((functions.ccxt_lt(price, 0)))))
            i += 1; continue
        end
        isFirstCandle = candle == -1;
        if functions.ccxtruthy(@functions.ccxt_or(isFirstCandle, functions.ccxt_ge(openingTime, self.sum(get(get(ohlcvs, candle + 1, nothing), i_timestamp + 1, nothing), ms))))
                        push!(ohlcvs, [openingTime, price, price, price, price, get(trade, Symbol("amount"), nothing), 1]);
        else
            prevHigh = get(get(ohlcvs, candle + 1, nothing), i_high + 1, nothing);
            prevLow = get(get(ohlcvs, candle + 1, nothing), i_low + 1, nothing);
            prevHighValue = functions.ccxtruthy((prevHigh == nothing)) ? price : prevHigh;
            prevLowValue = functions.ccxtruthy((prevLow == nothing)) ? price : prevLow;
            ohlcvs[candle + 1][i_high + 1] = max(prevHighValue, price);
            ohlcvs[candle + 1][i_low + 1] = min(prevLowValue, price);
            ohlcvs[candle + 1][i_close + 1] = price;
            ohlcvs[candle + 1][i_volume + 1] = self.sum(get(get(ohlcvs, candle + 1, nothing), i_volume + 1, nothing), get(trade, Symbol("amount"), nothing));
            ohlcvs[candle + 1][i_count + 1] = self.sum(get(get(ohlcvs, candle + 1, nothing), i_count + 1, nothing), 1);
        end
        i += 1
    end
    return ohlcvs

end
function parseTradingViewOHLCV(self::CcxtExchange, ohlcvs; market=nothing, timeframe="1m", since=nothing, limit=nothing)
    result = self.convertTradingViewToOHLCV(ohlcvs);
    return self.parseOHLCVs(result, market = market, timeframe = timeframe, since = since, limit = limit)

end
function fetchBorrowInterest(self::CcxtExchange; code=nothing, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchBorrowInterest() is not supported yet")));

end
function fetchLedger(self::CcxtExchange; code=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchLedger() is not supported yet")));

end
function fetchLedgerEntry(self::CcxtExchange, id; code=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchLedgerEntry() is not supported yet")));

end
function parseOrderBookBidAsk(self::CcxtExchange, bidask; priceKey=0, amountKey=1, countOrIdKey=2)
    price = safeFloat(bidask, priceKey);
    amount = safeFloat(bidask, amountKey);
    countOrId = safeInteger(bidask, countOrIdKey);
    bidAsk = [price, amount];
    if functions.ccxtruthy(countOrId != nothing)
                push!(bidAsk, countOrId);
    end
    return bidAsk

end
function safeCurrency(self::CcxtExchange, currencyId; currency=nothing)
    if functions.ccxtruthy(@functions.ccxt_and((currencyId == nothing), (currency != nothing)))
            return currency
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(@functions.ccxt_and((currencyId != nothing), (self.currencies_by_id != nothing)), (ccxt_in(currencyId, self.currencies_by_id))), (get(self.currencies_by_id, Symbol(currencyId), nothing) != nothing)))
            return get(self.currencies_by_id, Symbol(currencyId), nothing)
    end
    code = currencyId;
    if functions.ccxtruthy(currencyId != nothing)
        code = self.commonCurrencyCode(uppercase(currencyId));
    end
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => currencyId,
    Symbol("code") => code,
    Symbol("precision") => nothing
))

end
function safeMarket(self::CcxtExchange; marketId=nothing, market=nothing, delimiter=nothing, marketType=nothing)
    if functions.ccxtruthy(marketId != nothing)
        if functions.ccxtruthy(@functions.ccxt_and((self.markets_by_id != nothing), (ccxt_in(marketId, self.markets_by_id))))
            markets = get(self.markets_by_id, Symbol(marketId), nothing);
            numMarkets = length(markets);
            if functions.ccxtruthy(numMarkets == 1)
                    return get(markets, 1, nothing)
            else
                if functions.ccxtruthy(marketType == nothing)
                    if functions.ccxtruthy(market == nothing)
                        throw(ArgumentsRequired(string(self.id, " safeMarket() requires a fourth argument for ", marketId, " to disambiguate between different markets with the same market id")));
                    else
                        marketType = get(market, Symbol("type"), nothing);
                    end
                end
                i = 0
                while functions.ccxtruthy(functions.ccxt_lt(i, length(markets)))
                    currentMarket = get(markets, i + 1, nothing);
                    if functions.ccxtruthy(get(currentMarket, Symbol(marketType), nothing))
                            return currentMarket
                    end
                    i += 1
                end
            end
        elseif functions.ccxtruthy(@functions.ccxt_and(delimiter != nothing, delimiter != ""))
            parts = split(marketId, delimiter);
            partsLength = length(parts);
            result = self.safeMarketStructure(market = Dict{Symbol, Any}(
                Symbol("symbol") => marketId,
                Symbol("marketId") => marketId
            ));
            if functions.ccxtruthy(result == nothing)
                throw(ExchangeError(string(self.id, " safeMarket() failed to build market structure")));
            end
            if functions.ccxtruthy(partsLength == 2)
                baseId = safeString(parts, 0);
                quoteId = safeString(parts, 1);
                base = self.safeCurrencyCode(baseId);
                quote_var = self.safeCurrencyCode(quoteId);
                result[Symbol("baseId")] = baseId;
                result[Symbol("quoteId")] = quoteId;
                if functions.ccxtruthy(base != nothing)
                    result[Symbol("base")] = base;
                end
                if functions.ccxtruthy(quote_var != nothing)
                    result[Symbol("quote")] = quote_var;
                end
                if functions.ccxtruthy(@functions.ccxt_and((base != nothing), (quote_var != nothing)))
                    result[Symbol("symbol")] = string(base, "/", quote_var);
                end
            end
            return result
        end
    end
    if functions.ccxtruthy(market != nothing)
            return market
    end
    emptyMarket = self.safeMarketStructure(market = Dict{Symbol, Any}(
        Symbol("symbol") => marketId,
        Symbol("marketId") => marketId
    ));
    if functions.ccxtruthy(emptyMarket == nothing)
        throw(ExchangeError(string(self.id, " safeMarket() failed to build market structure")));
    end
    return emptyMarket

end
function marketOrNull(self::CcxtExchange; symbol=nothing)
    if functions.ccxtruthy(symbol == nothing)
            return nothing
    end
    return self.market(symbol)

end
function checkRequiredCredentials(self::CcxtExchange; error=true)
    keys_var = objectKeys(self.requiredCredentials);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        if functions.ccxtruthy(@functions.ccxt_and(get(self.requiredCredentials, Symbol(key), nothing), !functions.ccxtruthy(get(self, Symbol(key), nothing))))
            if functions.ccxtruthy(error)
                throw(AuthenticationError(string(self.id, " requires \"", key, "\" credential")));
            else
                return false
            end
        end
        i += 1
    end
    return true

end
function oath(self::CcxtExchange, )
    if functions.ccxtruthy(self.twofa != nothing)
            return totp(self.twofa)
    else
        throw(ExchangeError(string(self.id, " exchange.twofa has not been set for 2FA Two-Factor Authentication")));
    end

end
function fetchBalance(self::CcxtExchange; params=Dict())
    throw(NotSupported(string(self.id, " fetchBalance() is not supported yet")));

end
function fetchBalanceWs(self::CcxtExchange; params=Dict())
    throw(NotSupported(string(self.id, " fetchBalanceWs() is not supported yet")));

end
function parseBalance(self::CcxtExchange, response)
    throw(NotSupported(string(self.id, " parseBalance() is not supported yet")));

end
function watchBalance(self::CcxtExchange; params=Dict())
    throw(NotSupported(string(self.id, " watchBalance() is not supported yet")));

end
function fetchPartialBalance(self::CcxtExchange, part; params=Dict())
    balance = self.fetchBalance(params = params);
    return get(balance, Symbol(part), nothing)

end
function fetchFreeBalance(self::CcxtExchange; params=Dict())
    return self.fetchPartialBalance("free", params = params)

end
function fetchUsedBalance(self::CcxtExchange; params=Dict())
    return self.fetchPartialBalance("used", params = params)

end
function fetchTotalBalance(self::CcxtExchange; params=Dict())
    return self.fetchPartialBalance("total", params = params)

end
function fetchStatus(self::CcxtExchange; params=Dict())
    throw(NotSupported(string(self.id, " fetchStatus() is not supported yet")));

end
function fetchTransactionFee(self::CcxtExchange, code; params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(get(self.has, Symbol("fetchTransactionFees"), nothing)))
        throw(NotSupported(string(self.id, " fetchTransactionFee() is not supported yet")));
    end
    return self.fetchTransactionFees(codes = [code], params = params)

end
function fetchTransactionFees(self::CcxtExchange; codes=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchTransactionFees() is not supported yet")));

end
function fetchDepositWithdrawFees(self::CcxtExchange; codes=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchDepositWithdrawFees() is not supported yet")));

end
function fetchDepositWithdrawFee(self::CcxtExchange, code; params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(get(self.has, Symbol("fetchDepositWithdrawFees"), nothing)))
        throw(NotSupported(string(self.id, " fetchDepositWithdrawFee() is not supported yet")));
    end
    fees = self.fetchDepositWithdrawFees(codes = [code], params = params);
    return safeValue(fees, code)

end
function getSupportedMapping(self::CcxtExchange, key; mapping=Dict())
    if functions.ccxtruthy(ccxt_in(key, mapping))
            return get(mapping, Symbol(key), nothing)
    else
        throw(NotSupported(string(self.id, " ", key, " does not have a value in mapping")));
    end

end
function fetchCrossBorrowRate(self::CcxtExchange, code; params=Dict())
    self.loadMarkets();
    if functions.ccxtruthy(!functions.ccxtruthy(get(self.has, Symbol("fetchBorrowRates"), nothing)))
        throw(NotSupported(string(self.id, " fetchCrossBorrowRate() is not supported yet")));
    end
    borrowRates = self.fetchCrossBorrowRates(params = params);
    rate = safeValue(borrowRates, code);
    if functions.ccxtruthy(rate == nothing)
        throw(ExchangeError(string(self.id, " fetchCrossBorrowRate() could not find the borrow rate for currency code ", code)));
    end
    return rate

end
function fetchIsolatedBorrowRate(self::CcxtExchange, symbol; params=Dict())
    self.loadMarkets();
    if functions.ccxtruthy(!functions.ccxtruthy(get(self.has, Symbol("fetchBorrowRates"), nothing)))
        throw(NotSupported(string(self.id, " fetchIsolatedBorrowRate() is not supported yet")));
    end
    borrowRates = self.fetchIsolatedBorrowRates(params = params);
    rate = self.safeDict(borrowRates, symbol);
    if functions.ccxtruthy(rate == nothing)
        throw(ExchangeError(string(self.id, " fetchIsolatedBorrowRate() could not find the borrow rate for market symbol ", symbol)));
    end
    return rate

end
function requireValue(self::CcxtExchange, value; message=nothing)

end
function requireValue(self::CcxtExchange, value; message=nothing)
    if functions.ccxtruthy(value == nothing)
        errorMessage = functions.ccxtruthy((message != nothing)) ? message : "value is required";
        throw(ArgumentsRequired(string(self.id, " ", errorMessage)));
    end
    return value

end
function handleOptionAndParams(self::CcxtExchange, params, methodName, optionName; defaultValue)

end
function handleOptionAndParams(self::CcxtExchange, params, methodName, optionName; defaultValue=nothing)

end
function handleOptionAndParams(self::CcxtExchange, params, methodName, optionName; defaultValue=nothing)
    defaultOptionName = string("default", capitalize(optionName));
    value = safeValue2(params, optionName, defaultOptionName);
    if functions.ccxtruthy(value != nothing)
        params = omit(params, [optionName, defaultOptionName]);
    else
        (methodName, params) = self.handleParamString(params, "callerMethodName", defaultValue = methodName);
        exchangeWideMethodOptions = safeValue(self.options, methodName);
        if functions.ccxtruthy(exchangeWideMethodOptions != nothing)
            value = safeValue2(exchangeWideMethodOptions, optionName, defaultOptionName);
        end
        if functions.ccxtruthy(value == nothing)
            value = safeValue2(self.options, optionName, defaultOptionName);
        end
        value = functions.ccxtruthy((value != nothing)) ? value : defaultValue;
    end
    return [value, params]

end
function handleOptionAndParams2(self::CcxtExchange, params, methodName1, optionName1, optionName2; defaultValue)

end
function handleOptionAndParams2(self::CcxtExchange, params, methodName1, optionName1, optionName2; defaultValue=nothing)

end
function handleOptionAndParams2(self::CcxtExchange, params, methodName1, optionName1, optionName2; defaultValue=nothing)
    value = nothing;
    (value, params) = self.handleOptionAndParams(params, methodName1, optionName1);
    if functions.ccxtruthy(value != nothing)
        params = omit(params, optionName2);
            return [value, params]
    end
    value2 = nothing;
    (value2, params) = self.handleOptionAndParams(params, methodName1, optionName2, defaultValue = defaultValue);
    return [value2, params]

end
function handleOption(self::CcxtExchange, methodName, optionName; defaultValue=nothing)
    res = self.handleOptionAndParams(Dict{Symbol, Any}(), methodName, optionName, defaultValue = defaultValue);
    return safeValue(res, 0)

end
function handleMarketTypeAndParams(self::CcxtExchange, methodName; market=nothing, params=Dict(), defaultValue=nothing)
    type_var = safeString2(params, "defaultType", "type");
    if functions.ccxtruthy(type_var != nothing)
        params = omit(params, ["defaultType", "type"]);
            return [type_var, params]
    end
    if functions.ccxtruthy(market != nothing)
            return [get(market, Symbol("type"), nothing), params]
    end
    if functions.ccxtruthy(defaultValue != nothing)
            return [defaultValue, params]
    end
    methodOptions = self.safeDict(self.options, methodName);
    if functions.ccxtruthy(methodOptions != nothing)
        if functions.ccxtruthy(isa(methodOptions, AbstractString))
                return [methodOptions, params]
        else
            typeFromMethod = safeString2(methodOptions, "defaultType", "type");
            if functions.ccxtruthy(typeFromMethod != nothing)
                    return [typeFromMethod, params]
            end
        end
    end
    defaultType = safeString2(self.options, "defaultType", "type", "spot");
    return [defaultType, params]

end
function handleSubTypeAndParams(self::CcxtExchange, methodName; market=nothing, params=Dict(), defaultValue=nothing)
    subType = nothing;
    subTypeInParams = safeString2(params, "subType", "defaultSubType");
    if functions.ccxtruthy(subTypeInParams != nothing)
        if functions.ccxtruthy(@functions.ccxt_or((subTypeInParams == "linear"), (subTypeInParams == "inverse")))
            subType = subTypeInParams;
        end
        params = omit(params, ["subType", "defaultSubType"]);
    else
        if functions.ccxtruthy(market != nothing)
            if functions.ccxtruthy(get(market, Symbol("linear"), nothing))
                subType = "linear";
            elseif functions.ccxtruthy(get(market, Symbol("inverse"), nothing))
                subType = "inverse";
            end
        end
        if functions.ccxtruthy(subType == nothing)
            values_var = self.handleOptionAndParams(Dict{Symbol, Any}(), methodName, "subType", defaultValue = defaultValue);
            subType = get(values_var, 1, nothing);
        end
    end
    return [subType, params]

end
function handleMarginModeAndParams(self::CcxtExchange, methodName; params=Dict(), defaultValue=nothing)
    return self.handleOptionAndParams(params, methodName, "marginMode", defaultValue = defaultValue)

end
function throwExactlyMatchedException(self::CcxtExchange, exact, string, message)
    if functions.ccxtruthy(string == nothing)
            return 
    end
    if functions.ccxtruthy(ccxt_in(string, exact))
        throw(get(exact, Symbol(string), nothing)(message));
    end

end
function throwBroadlyMatchedException(self::CcxtExchange, broad, string, message)
    broadKey = self.findBroadlyMatchedKey(broad, string);
    if functions.ccxtruthy(broadKey != nothing)
        throw(get(broad, Symbol(broadKey), nothing)(message));
    end

end
function findBroadlyMatchedKey(self::CcxtExchange, broad, string)
    keys_var = objectKeys(broad);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        if functions.ccxtruthy(string != nothing)
            if functions.ccxtruthy(findfirst(key, string) !== nothing)
                    return key
            end
        end
        i += 1
    end
    return nothing

end
function handleErrors(self::CcxtExchange, statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody)
    return nothing

end
function calculateRateLimiterCost(self::CcxtExchange, api, method, path, params; config=Dict())
    return safeValue(config, "cost", 1)

end
function fetchSpotTickers(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchSpotTickers() is not supported yet")));

end
function fetchContractTickers(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchContractTickers() is not supported yet")));

end
function fetchOrderBooks(self::CcxtExchange; symbols=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchOrderBooks() is not supported yet")));

end
function unWatchTickers(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " unWatchTickers() is not supported yet")));

end
function unWatchFundingRate(self::CcxtExchange, symbol; params=Dict())
    throw(NotSupported(string(self.id, " unWatchFundingRate() is not supported yet")));

end
function createTwapOrder(self::CcxtExchange, symbol, side, amount, duration; params=Dict())
    throw(NotSupported(string(self.id, " createTwapOrder() is not supported yet")));

end
function createConvertTrade(self::CcxtExchange, id, fromCode, toCode; amount=nothing, params=Dict())
    throw(NotSupported(string(self.id, " createConvertTrade() is not supported yet")));

end
function fetchConvertTrade(self::CcxtExchange, id; code=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchConvertTrade() is not supported yet")));

end
function fetchConvertTradeHistory(self::CcxtExchange; code=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchConvertTradeHistory() is not supported yet")));

end
function fetchPositionMode(self::CcxtExchange; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchPositionMode() is not supported yet")));

end
function fetchADLRank(self::CcxtExchange, symbol; params=Dict())
    throw(NotSupported(string(self.id, " fetchADLRank() is not supported yet")));

end
function fetchPositionsADLRank(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchPositionsADLRank() is not supported yet")));

end
function fetchPositionADLRank(self::CcxtExchange, symbol; params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchPositionsADLRank"), nothing))
        self.loadMarkets();
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
        ranks = self.fetchPositionsADLRank(symbols = [symbol], params = params);
        rank = self.safeDict(ranks, 0);
        if functions.ccxtruthy(rank == nothing)
            throw(NullResponse(string(self.id, " fetchPositionsADLRank() could not find a rank for ", symbol)));
        else
            return rank
        end
    else
        throw(NotSupported(string(self.id, " fetchPositionsADLRank() is not supported yet")));
    end

end
function setTakeProfitAndStopLossParams(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, takeProfit=nothing, stopLoss=nothing, params=Dict())
    if functions.ccxtruthy(@functions.ccxt_and((takeProfit == nothing), (stopLoss == nothing)))
        throw(ArgumentsRequired(string(self.id, " createOrderWithTakeProfitAndStopLoss() requires either a takeProfit or stopLoss argument")));
    end
    if functions.ccxtruthy(takeProfit != nothing)
        params[Symbol("takeProfit")] = Dict{Symbol, Any}(
            Symbol("triggerPrice") => takeProfit
        );
    end
    if functions.ccxtruthy(stopLoss != nothing)
        params[Symbol("stopLoss")] = Dict{Symbol, Any}(
            Symbol("triggerPrice") => stopLoss
        );
    end
    takeProfitType = safeString(params, "takeProfitType");
    takeProfitPriceType = safeString(params, "takeProfitPriceType");
    takeProfitLimitPrice = safeString(params, "takeProfitLimitPrice");
    takeProfitAmount = safeString(params, "takeProfitAmount");
    stopLossType = safeString(params, "stopLossType");
    stopLossPriceType = safeString(params, "stopLossPriceType");
    stopLossLimitPrice = safeString(params, "stopLossLimitPrice");
    stopLossAmount = safeString(params, "stopLossAmount");
    if functions.ccxtruthy(takeProfitType != nothing)
        params[Symbol("takeProfit")][Symbol("type")] = takeProfitType;
    end
    if functions.ccxtruthy(takeProfitPriceType != nothing)
        params[Symbol("takeProfit")][Symbol("priceType")] = takeProfitPriceType;
    end
    if functions.ccxtruthy(takeProfitLimitPrice != nothing)
        params[Symbol("takeProfit")][Symbol("price")] = self.parseToNumeric(takeProfitLimitPrice);
    end
    if functions.ccxtruthy(takeProfitAmount != nothing)
        params[Symbol("takeProfit")][Symbol("amount")] = self.parseToNumeric(takeProfitAmount);
    end
    if functions.ccxtruthy(stopLossType != nothing)
        params[Symbol("stopLoss")][Symbol("type")] = stopLossType;
    end
    if functions.ccxtruthy(stopLossPriceType != nothing)
        params[Symbol("stopLoss")][Symbol("priceType")] = stopLossPriceType;
    end
    if functions.ccxtruthy(stopLossLimitPrice != nothing)
        params[Symbol("stopLoss")][Symbol("price")] = self.parseToNumeric(stopLossLimitPrice);
    end
    if functions.ccxtruthy(stopLossAmount != nothing)
        params[Symbol("stopLoss")][Symbol("amount")] = self.parseToNumeric(stopLossAmount);
    end
    params = omit(params, ["takeProfitType", "takeProfitPriceType", "takeProfitLimitPrice", "takeProfitAmount", "stopLossType", "stopLossPriceType", "stopLossLimitPrice", "stopLossAmount"]);
    return params

end
function createSpotOrders(self::CcxtExchange, orders; params=Dict())
    throw(NotSupported(string(self.id, " createSpotOrders() is not supported yet")));

end
function createContractOrders(self::CcxtExchange, orders; params=Dict())
    throw(NotSupported(string(self.id, " createContractOrders() is not supported yet")));

end
function cancelSpotOrder(self::CcxtExchange, id; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " cancelSpotOrder() is not supported yet")));

end
function cancelContractOrder(self::CcxtExchange, id; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " cancelContractOrder() is not supported yet")));

end
function cancelAllSpotOrders(self::CcxtExchange; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " cancelAllSpotOrders() is not supported yet")));

end
function cancelAllContractOrders(self::CcxtExchange; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " cancelAllContractOrders() is not supported yet")));

end
function cancelAllOrdersAfter(self::CcxtExchange, timeout; params=Dict())
    throw(NotSupported(string(self.id, " cancelAllOrdersAfter() is not supported yet")));

end
function cancelOrdersForSymbols(self::CcxtExchange, orders; params=Dict())
    throw(NotSupported(string(self.id, " cancelOrdersForSymbols() is not supported yet")));

end
function fetchMyLiquidations(self::CcxtExchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchMyLiquidations() is not supported yet")));

end
function fetchLiquidations(self::CcxtExchange, symbol; since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchLiquidations() is not supported yet")));

end
function fetchGreeks(self::CcxtExchange, symbol; params=Dict())
    throw(NotSupported(string(self.id, " fetchGreeks() is not supported yet")));

end
function fetchAllGreeks(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchAllGreeks() is not supported yet")));

end
function fetchOptionChain(self::CcxtExchange, code; params=Dict())
    throw(NotSupported(string(self.id, " fetchOptionChain() is not supported yet")));

end
function fetchOption(self::CcxtExchange, symbol; params=Dict())
    throw(NotSupported(string(self.id, " fetchOption() is not supported yet")));

end
function fetchConvertQuote(self::CcxtExchange, fromCode, toCode; amount=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchConvertQuote() is not supported yet")));

end
function fetchDepositsWithdrawals(self::CcxtExchange; code=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchDepositsWithdrawals() is not supported yet")));

end
function fetchDeposits(self::CcxtExchange; code=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchDeposits() is not supported yet")));

end
function fetchWithdrawals(self::CcxtExchange; code=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchWithdrawals() is not supported yet")));

end
function fetchDepositsWs(self::CcxtExchange; code=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchDepositsWs() is not supported yet")));

end
function fetchWithdrawalsWs(self::CcxtExchange; code=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchWithdrawalsWs() is not supported yet")));

end
function fetchFundingRateHistory(self::CcxtExchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchFundingRateHistory() is not supported yet")));

end
function fetchFundingHistory(self::CcxtExchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchFundingHistory() is not supported yet")));

end
function parseLastPrice(self::CcxtExchange, price; market=nothing)
    throw(NotSupported(string(self.id, " parseLastPrice() is not supported yet")));

end
function fetchDepositAddress(self::CcxtExchange, code; params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchDepositAddresses"), nothing))
        depositAddresses = self.fetchDepositAddresses(codes = [code], params = params);
        depositAddress = safeValue(depositAddresses, code);
        if functions.ccxtruthy(depositAddress == nothing)
            throw(InvalidAddress(string(self.id, " fetchDepositAddress() could not find a deposit address for ", code, ", make sure you have created a corresponding deposit address in your wallet on the exchange website")));
        else
            return depositAddress
        end
    elseif functions.ccxtruthy(get(self.has, Symbol("fetchDepositAddressesByNetwork"), nothing))
        network = safeString(params, "network");
        params = omit(params, "network");
        addressStructures = self.fetchDepositAddressesByNetwork(code, params = params);
        if functions.ccxtruthy(network != nothing)
                return self.safeDict(addressStructures, network)
        else
            keys_var = objectKeys(addressStructures);
            key = get(keys_var, 1, nothing);
            return self.safeDict(addressStructures, key)
        end
    else
        throw(NotSupported(string(self.id, " fetchDepositAddress() is not supported yet")));
    end

end
function fetchContractDepositAddress(self::CcxtExchange, code; params=Dict())
    throw(NotSupported(string(self.id, " fetchContractDepositAddress() is not supported yet")));

end
function account(self::CcxtExchange, )
    return Dict{Symbol, Any}(
    Symbol("free") => nothing,
    Symbol("used") => nothing,
    Symbol("total") => nothing
)

end
function commonCurrencyCode(self::CcxtExchange, code)
    if functions.ccxtruthy(!functions.ccxtruthy(self.substituteCommonCurrencyCodes))
            return code
    end
    return safeString(self.commonCurrencies, code, code)

end
function currency(self::CcxtExchange, code)
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " currency() requires a code argument")));
    end
    keys_var = objectKeys(self.currencies);
    numCurrencies = length(keys_var);
    if functions.ccxtruthy(numCurrencies == 0)
        throw(ExchangeError(string(self.id, " currencies not loaded")));
    end
    if functions.ccxtruthy(isa(code, AbstractString))
        currencies = self.currencies;
        currenciesById = self.currencies_by_id;
        if functions.ccxtruthy(ccxt_in(code, currencies))
                return get(currencies, Symbol(code), nothing)
        elseif functions.ccxtruthy(@functions.ccxt_and((currenciesById != nothing), (ccxt_in(code, currenciesById))))
            return get(currenciesById, Symbol(code), nothing)
        end
    end
    throw(ExchangeError(string(self.id, " does not have currency code ", code)));

end
function market(self::CcxtExchange, symbol)
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " Ccxt.market() requires a symbol argument")));
    end
    markets = self.markets;
    if functions.ccxtruthy(markets == nothing)
        throw(ExchangeError(string(self.id, " markets not loaded")));
    end
    marketsById = self.markets_by_id;
    if functions.ccxtruthy(ccxt_in(symbol, markets))
            return get(markets, Symbol(symbol), nothing)
    elseif functions.ccxtruthy(@functions.ccxt_and((marketsById != nothing), (ccxt_in(symbol, marketsById))))
        marketsList = get(marketsById, Symbol(symbol), nothing);
        defaultType = safeString2(self.options, "defaultType", "defaultSubType", "spot");
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(marketsList)))
            market = get(marketsList, i + 1, nothing);
            if functions.ccxtruthy(get(market, Symbol(defaultType), nothing))
                    return market
            end
            i += 1
        end
        return get(marketsList, 1, nothing)
    else
        if functions.ccxtruthy(@functions.ccxt_or(@functions.ccxt_or(@functions.ccxt_or((endswith(symbol, "-C")), (endswith(symbol, "-P"))), (startswith(symbol, "C-"))), (startswith(symbol, "P-"))))
                return self.createExpiredOptionMarket(symbol)
        end

    end
    throw(BadSymbol(string(self.id, " does not have market symbol ", symbol)));

end
function createExpiredOptionMarket(self::CcxtExchange, symbol)
    throw(NotSupported(string(self.id, " createExpiredOptionMarket () is not supported yet")));

end
function isLeveragedCurrency(self::CcxtExchange, currencyCode; checkBaseCoin=false, existingCurrencies=nothing)
    leverageSuffixes = ["2L", "2S", "3L", "3S", "4L", "4S", "5L", "5S", "UP", "DOWN", "BULL", "BEAR"];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(leverageSuffixes)))
        leverageSuffix = get(leverageSuffixes, i + 1, nothing);
        if functions.ccxtruthy(endswith(currencyCode, leverageSuffix))
            if functions.ccxtruthy(!functions.ccxtruthy(checkBaseCoin))
                    return true
            else
                baseCurrencyCode = replace(currencyCode, leverageSuffix => "");
                if functions.ccxtruthy(@functions.ccxt_and((existingCurrencies != nothing), (ccxt_in(baseCurrencyCode, existingCurrencies))))
                        return true
                end
            end
        end
        i += 1
    end
    return false

end
function handleWithdrawTagAndParams(self::CcxtExchange, tag, params)
    if functions.ccxtruthy(self.isDictionary(tag))
        params = extend(tag, params);
        tag = nothing;
    end
    if functions.ccxtruthy(tag == nothing)
        tag = safeString(params, "tag");
        if functions.ccxtruthy(tag != nothing)
            params = omit(params, "tag");
        end
    end
    return [tag, params]

end
function costToPrecision(self::CcxtExchange, symbol, cost)
    if functions.ccxtruthy(cost == nothing)
            return nothing
    end
    market = self.market(symbol);
    return decimalToPrecision(cost, TRUNCATE, safeString2(get(market, Symbol("precision"), nothing), "cost", "price"), self.precisionMode, self.paddingMode)

end
function priceToPrecision(self::CcxtExchange, symbol, price)
    if functions.ccxtruthy(price == nothing)
            return nothing
    end
    market = self.market(symbol);
    result = decimalToPrecision(price, ROUND, get(get(market, Symbol("precision"), nothing), Symbol("price"), nothing), self.precisionMode, self.paddingMode);
    if functions.ccxtruthy(result == "0")
        throw(InvalidOrder(string(self.id, " price of ", get(market, Symbol("symbol"), nothing), " must be greater than minimum price precision of ", numberToString(get(get(market, Symbol("precision"), nothing), Symbol("price"), nothing)))));
    end
    return result

end
function amountToPrecision(self::CcxtExchange, symbol, amount)
    if functions.ccxtruthy(amount == nothing)
            return nothing
    end
    market = self.market(symbol);
    result = decimalToPrecision(amount, TRUNCATE, get(get(market, Symbol("precision"), nothing), Symbol("amount"), nothing), self.precisionMode, self.paddingMode);
    if functions.ccxtruthy(result == "0")
        throw(InvalidOrder(string(self.id, " amount of ", get(market, Symbol("symbol"), nothing), " must be greater than minimum amount precision of ", numberToString(get(get(market, Symbol("precision"), nothing), Symbol("amount"), nothing)))));
    end
    return result

end
function feeToPrecision(self::CcxtExchange, symbol, fee)
    if functions.ccxtruthy(fee == nothing)
            return nothing
    end
    market = self.market(symbol);
    return decimalToPrecision(fee, ROUND, get(get(market, Symbol("precision"), nothing), Symbol("price"), nothing), self.precisionMode, self.paddingMode)

end
function currencyToPrecision(self::CcxtExchange, code, fee; networkCode=nothing)
    if functions.ccxtruthy(code == nothing)
        throw(ArgumentsRequired(string(self.id, " currencyToPrecision() requires a code argument")));
    end
    currency = get(self.currencies, Symbol(code), nothing);
    precision = safeValue(currency, "precision");
    if functions.ccxtruthy(networkCode != nothing)
        networks = self.safeDict(currency, "networks", defaultValue = Dict{Symbol, Any}());
        networkItem = self.safeDict(networks, networkCode, defaultValue = Dict{Symbol, Any}());
        precision = safeValue(networkItem, "precision", precision);
    end
    if functions.ccxtruthy(precision == nothing)
            return self.forceString(fee)
    else
        roundingMode = safeInteger(self.options, "currencyToPrecisionRoundingMode", ROUND);
        return decimalToPrecision(fee, roundingMode, precision, self.precisionMode, self.paddingMode)
    end

end
function forceString(self::CcxtExchange, value)
    if functions.ccxtruthy(!isa(value, AbstractString))
            return numberToString(value)
    end
    return value

end
function isTickPrecision(self::CcxtExchange, )
    return self.precisionMode == TICK_SIZE

end
function isDecimalPrecision(self::CcxtExchange, )
    return self.precisionMode == DECIMAL_PLACES

end
function isSignificantPrecision(self::CcxtExchange, )
    return self.precisionMode == SIGNIFICANT_DIGITS

end
function safeNumber(self::CcxtExchange, obj, key; defaultNumber=nothing)
    value = safeString(obj, key);
    return self.parseNumber(value, d = defaultNumber)

end
function safeNumberN(self::CcxtExchange, obj, arr; defaultNumber=nothing)
    value = safeStringN(obj, arr);
    return self.parseNumber(value, d = defaultNumber)

end
function parsePrecision(self::CcxtExchange; precision=nothing)
    if functions.ccxtruthy(precision == nothing)
            return nothing
    end
    precisionNumber = ccxt_parseInt(precision);
    if functions.ccxtruthy(precisionNumber == 0)
            return "1"
    end
    if functions.ccxtruthy(functions.ccxt_gt(precisionNumber, 0))
        parsedPrecision = "0.";
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, precisionNumber - 1))
            parsedPrecision = string(parsedPrecision, "0");
            i += 1
        end

            return string(parsedPrecision, "1")
    else
        parsedPrecision = "1";
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, precisionNumber * -1 - 1))
            parsedPrecision = string(parsedPrecision, "0");
            i += 1
        end
        return string(parsedPrecision, "0")
    end

end
function integerPrecisionToAmount(self::CcxtExchange, precision)
    if functions.ccxtruthy(precision == nothing)
            return nothing
    end
    if functions.ccxtruthy(stringGe(precision, "0"))
            return self.parsePrecision(precision = precision)
    else
        positivePrecisionString = stringAbs(precision);
        if functions.ccxtruthy(positivePrecisionString == nothing)
                return nothing
        end
        positivePrecision = ccxt_parseInt(positivePrecisionString);
        parsedPrecision = "1";
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, positivePrecision - 1))
            parsedPrecision = string(parsedPrecision, "0");
            i += 1
        end
        return string(parsedPrecision, "0")
    end

end
function loadTimeDifference(self::CcxtExchange; params=Dict())
    serverTime = self.fetchTime(params = params);
    after = milliseconds();
    if functions.ccxtruthy(serverTime == nothing)
        throw(ExchangeError(string(self.id, " loadTimeDifference() missing serverTime")));
    end
    self.options[Symbol("timeDifference")] = after - serverTime;
    return get(self.options, Symbol("timeDifference"), nothing)

end
function implodeHostname(self::CcxtExchange, url)
    return self.implodeParams(url, Dict{Symbol, Any}(
    Symbol("hostname") => self.hostname
))

end
function fetchMarketLeverageTiers(self::CcxtExchange, symbol; params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchLeverageTiers"), nothing))
        market = self.market(symbol);
        if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
            throw(BadSymbol(string(self.id, " fetchMarketLeverageTiers() supports contract markets only")));
        end
        tiers = self.fetchLeverageTiers(symbols = [symbol]);
            return safeValue(tiers, symbol)
    else
        throw(NotSupported(string(self.id, " fetchMarketLeverageTiers() is not supported yet")));
    end

end
function createSubAccount(self::CcxtExchange, name; params=Dict())
    throw(NotSupported(string(self.id, " createSubAccount() is not supported yet")));

end
function safeCurrencyCode(self::CcxtExchange, currencyId; currency=nothing)
    currency = self.safeCurrency(currencyId, currency = currency);
    return get(currency, Symbol("code"), nothing)

end
function filterBySymbolSinceLimit(self::CcxtExchange, array; symbol=nothing, since=nothing, limit=nothing, tail=false)
    return self.filterByValueSinceLimit(array, "symbol", value = symbol, since = since, limit = limit, key = "timestamp", tail = tail)

end
function filterByCurrencySinceLimit(self::CcxtExchange, array; code=nothing, since=nothing, limit=nothing, tail=false)
    return self.filterByValueSinceLimit(array, "currency", value = code, since = since, limit = limit, key = "timestamp", tail = tail)

end
function filterBySymbolsSinceLimit(self::CcxtExchange, array; symbols=nothing, since=nothing, limit=nothing, tail=false)
    result = self.filterByArray(array, "symbol", values = symbols, indexed = false);
    return self.filterBySinceLimit(result, since = since, limit = limit, key = "timestamp", tail = tail)

end
function parseLastPrices(self::CcxtExchange, pricesData; symbols=nothing, params=Dict())
    results = [];
    if functions.ccxtruthy(functions.ccxt_isArray(pricesData))
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(pricesData)))
            priceData = extend(self.parseLastPrice(get(pricesData, i + 1, nothing)), params);
            push!(results, priceData);
            i += 1
        end

    else
        marketIds = objectKeys(pricesData);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
            marketId = get(marketIds, i + 1, nothing);
            market = self.safeMarket(marketId = marketId);
            priceData = extend(self.parseLastPrice(get(pricesData, Symbol(marketId), nothing), market = market), params);
            push!(results, priceData);
            i += 1
        end
    end
    symbols = self.marketSymbols(symbols = symbols);
    return self.filterByArray(results, "symbol", values = symbols)

end
function parseTickers(self::CcxtExchange, tickers; symbols=nothing, params=Dict())
    results = [];
    if functions.ccxtruthy(functions.ccxt_isArray(tickers))
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(tickers)))
            parsedTicker = self.parseTicker(get(tickers, i + 1, nothing));
            ticker = extend(parsedTicker, params);
            push!(results, ticker);
            i += 1
        end

    else
        marketIds = objectKeys(tickers);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
            marketId = get(marketIds, i + 1, nothing);
            market = self.safeMarket(marketId = marketId);
            parsed = self.parseTicker(get(tickers, Symbol(marketId), nothing), market = market);
            ticker = extend(parsed, params);
            push!(results, ticker);
            i += 1
        end
    end
    symbols = self.marketSymbols(symbols = symbols);
    return self.filterByArray(results, "symbol", values = symbols)

end
function parseDepositAddresses(self::CcxtExchange, addresses; codes=nothing, indexed=true, params=Dict())
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(addresses)))
        address = extend(self.parseDepositAddress(get(addresses, i + 1, nothing)), params);
        push!(result, address);
        i += 1
    end
    if functions.ccxtruthy(codes != nothing)
        result = self.filterByArray(result, "currency", values = codes, indexed = false);
    end
    if functions.ccxtruthy(indexed)
        result = self.filterByArray(result, "currency", values = nothing, indexed = indexed);
    end
    return result

end
function parseBorrowInterests(self::CcxtExchange, response; market=nothing)
    interests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        row = get(response, i + 1, nothing);
        push!(interests, self.parseBorrowInterest(row, market = market));
        i += 1
    end
    return interests

end
function parseBorrowRate(self::CcxtExchange, info; currency=nothing)
    throw(NotSupported(string(self.id, " parseBorrowRate() is not supported yet")));

end
function parseBorrowRateHistory(self::CcxtExchange, response, code, since, limit)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        item = get(response, i + 1, nothing);
        borrowRate = self.parseBorrowRate(item);
        push!(result, borrowRate);
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    return self.filterByCurrencySinceLimit(sorted, code = code, since = since, limit = limit)

end
function parseIsolatedBorrowRates(self::CcxtExchange, info)
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(info)))
        item = get(info, i + 1, nothing);
        borrowRate = self.parseIsolatedBorrowRate(item);
        symbol = safeString(borrowRate, "symbol");
        result[Symbol(symbol)] = borrowRate;
        i += 1
    end
    return result

end
function parseFundingRateHistories(self::CcxtExchange, response; market=nothing, since=nothing, limit=nothing)
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        entry = get(response, i + 1, nothing);
        push!(rates, self.parseFundingRateHistory(entry, market = market));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    symbol = functions.ccxtruthy((market == nothing)) ? nothing : get(market, Symbol("symbol"), nothing);
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end
function safeSymbol(self::CcxtExchange, marketId; market=nothing, delimiter=nothing, marketType=nothing)
    market = self.safeMarket(marketId = marketId, market = market, delimiter = delimiter, marketType = marketType);
    return get(market, Symbol("symbol"), nothing)

end
function parseFundingRate(self::CcxtExchange, contract; market=nothing)
    throw(NotSupported(string(self.id, " parseFundingRate() is not supported yet")));

end
function parseFundingRates(self::CcxtExchange, response; symbols=nothing)
    fundingRates = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        entry = get(response, i + 1, nothing);
        parsed = self.parseFundingRate(entry);
        if functions.ccxtruthy(get(parsed, Symbol("symbol"), nothing) != nothing)
            fundingRates[Symbol(parsed[Symbol("symbol")])] = parsed;
        end
        i += 1
    end
    return self.filterByArray(fundingRates, "symbol", values = symbols)

end
function parseLongShortRatio(self::CcxtExchange, info; market=nothing)
    throw(NotSupported(string(self.id, " parseLongShortRatio() is not supported yet")));

end
function parseLongShortRatioHistory(self::CcxtExchange, response; market=nothing, since=nothing, limit=nothing)
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        entry = get(response, i + 1, nothing);
        push!(rates, self.parseLongShortRatio(entry, market = market));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    symbol = functions.ccxtruthy((market == nothing)) ? nothing : get(market, Symbol("symbol"), nothing);
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end
function handleTriggerPricesAndParams(self::CcxtExchange, symbol, params; omitParams=true)
    triggerPrice = safeString2(params, "triggerPrice", "stopPrice");
    triggerPriceStr = nothing;
    stopLossPrice = safeString(params, "stopLossPrice");
    stopLossPriceStr = nothing;
    takeProfitPrice = safeString(params, "takeProfitPrice");
    takeProfitPriceStr = nothing;
    if functions.ccxtruthy(triggerPrice != nothing)
        if functions.ccxtruthy(omitParams)
            params = omit(params, ["triggerPrice", "stopPrice"]);
        end
        triggerPriceStr = self.priceToPrecision(symbol, ccxt_toNumber(triggerPrice));
    end
    if functions.ccxtruthy(stopLossPrice != nothing)
        if functions.ccxtruthy(omitParams)
            params = omit(params, "stopLossPrice");
        end
        stopLossPriceStr = self.priceToPrecision(symbol, ccxt_toNumber(stopLossPrice));
    end
    if functions.ccxtruthy(takeProfitPrice != nothing)
        if functions.ccxtruthy(omitParams)
            params = omit(params, "takeProfitPrice");
        end
        takeProfitPriceStr = self.priceToPrecision(symbol, ccxt_toNumber(takeProfitPrice));
    end
    return [triggerPriceStr, stopLossPriceStr, takeProfitPriceStr, params]

end
function handleTriggerDirectionAndParams(self::CcxtExchange, params; exchangeSpecificKey=nothing, allowEmpty=false)
    triggerDirection = safeString(params, "triggerDirection");
    exchangeSpecificDefined = @functions.ccxt_and((exchangeSpecificKey != nothing), (ccxt_in(exchangeSpecificKey, params)));
    if functions.ccxtruthy(triggerDirection != nothing)
        params = omit(params, "triggerDirection");
    end
    if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and(!functions.ccxtruthy(inArray(triggerDirection, ["ascending", "descending", "up", "down", "above", "below"])), !functions.ccxtruthy(exchangeSpecificDefined)), !functions.ccxtruthy(allowEmpty)))
        throw(ArgumentsRequired(string(self.id, " createOrder() : trigger orders require params[\"triggerDirection\"] to be either \"ascending\" or \"descending\"")));
    end
    if functions.ccxtruthy(@functions.ccxt_or(triggerDirection == "up", triggerDirection == "above"))
        triggerDirection = "ascending";
    elseif functions.ccxtruthy(@functions.ccxt_or(triggerDirection == "down", triggerDirection == "below"))
        triggerDirection = "descending";
    end
    return [triggerDirection, params]

end
function handleTriggerAndParams(self::CcxtExchange, params)
    isTrigger = self.safeBool2(params, "trigger", "stop");
    if functions.ccxtruthy(isTrigger)
        params = omit(params, ["trigger", "stop"]);
    end
    return [isTrigger, params]

end
function isTriggerOrder(self::CcxtExchange, params)
    return self.handleTriggerAndParams(params)

end
function isPostOnly(self::CcxtExchange, isMarketOrder, exchangeSpecificParam; params=Dict())
    timeInForce = safeStringUpper(params, "timeInForce");
    postOnly = self.safeBool2(params, "postOnly", "post_only", defaultValue = false);
    ioc = timeInForce == "IOC";
    fok = timeInForce == "FOK";
    timeInForcePostOnly = timeInForce == "PO";
    postOnly = @functions.ccxt_or(@functions.ccxt_or(postOnly, timeInForcePostOnly), exchangeSpecificParam);
    if functions.ccxtruthy(postOnly)
        if functions.ccxtruthy(@functions.ccxt_or(ioc, fok))
            throw(InvalidOrder(string(self.id, " postOnly orders cannot have timeInForce equal to ", timeInForce)));
        elseif functions.ccxtruthy(isMarketOrder)
            throw(InvalidOrder(string(self.id, " market orders cannot be postOnly")));
        else
            return true
        end
    else
        return false
    end

end
function handlePostOnly(self::CcxtExchange, isMarketOrder, exchangeSpecificPostOnlyOption; params=Dict())
    timeInForce = safeStringUpper(params, "timeInForce");
    postOnly = self.safeBool(params, "postOnly", defaultValue = false);
    ioc = timeInForce == "IOC";
    fok = timeInForce == "FOK";
    po = timeInForce == "PO";
    postOnly = @functions.ccxt_or(@functions.ccxt_or(postOnly, po), exchangeSpecificPostOnlyOption);
    if functions.ccxtruthy(postOnly)
        if functions.ccxtruthy(@functions.ccxt_or(ioc, fok))
            throw(InvalidOrder(string(self.id, " postOnly orders cannot have timeInForce equal to ", timeInForce)));
        elseif functions.ccxtruthy(isMarketOrder)
            throw(InvalidOrder(string(self.id, " market orders cannot be postOnly")));
        else
            if functions.ccxtruthy(po)
                params = omit(params, "timeInForce");
            end
            params = omit(params, "postOnly");
            return [true, params]
        end
    end
    return [false, params]

end
function fetchLastPrices(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchLastPrices() is not supported yet")));

end
function fetchTradingFees(self::CcxtExchange; params=Dict())
    throw(NotSupported(string(self.id, " fetchTradingFees() is not supported yet")));

end
function fetchTradingFeesWs(self::CcxtExchange; params=Dict())
    throw(NotSupported(string(self.id, " fetchTradingFeesWs() is not supported yet")));

end
function fetchConvertCurrencies(self::CcxtExchange; params=Dict())
    throw(NotSupported(string(self.id, " fetchConvertCurrencies() is not supported yet")));

end
function parseOpenInterest(self::CcxtExchange, interest; market=nothing)
    throw(NotSupported(string(self.id, " parseOpenInterest () is not supported yet")));

end
function parseOpenInterests(self::CcxtExchange, response; symbols=nothing)
    result = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        entry = get(response, i + 1, nothing);
        parsed = self.parseOpenInterest(entry);
        if functions.ccxtruthy(get(parsed, Symbol("symbol"), nothing) != nothing)
            result[Symbol(parsed[Symbol("symbol")])] = parsed;
        end
        i += 1
    end
    return self.filterByArray(result, "symbol", values = symbols)

end
function parseOpenInterestsHistory(self::CcxtExchange, response; market=nothing, since=nothing, limit=nothing)
    interests = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        entry = get(response, i + 1, nothing);
        interest = self.parseOpenInterest(entry, market = market);
        push!(interests, interest);
        i += 1
    end
    sorted = sortBy(interests, "timestamp");
    symbol = safeString(market, "symbol");
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end
function fetchFundingRate(self::CcxtExchange, symbol; params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchFundingRates"), nothing))
        self.loadMarkets();
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
        if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
            throw(BadSymbol(string(self.id, " fetchFundingRate() supports contract markets only")));
        end
        rates = self.fetchFundingRates(symbols = [symbol], params = params);
        rate = safeValue(rates, symbol);
        if functions.ccxtruthy(rate == nothing)
            throw(NullResponse(string(self.id, " fetchFundingRate () returned no data for ", symbol)));
        else
            return rate
        end
    else
        throw(NotSupported(string(self.id, " fetchFundingRate () is not supported yet")));
    end

end
function fetchFundingInterval(self::CcxtExchange, symbol; params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchFundingIntervals"), nothing))
        self.loadMarkets();
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
        if functions.ccxtruthy(!functions.ccxtruthy(get(market, Symbol("contract"), nothing)))
            throw(BadSymbol(string(self.id, " fetchFundingInterval() supports contract markets only")));
        end
        rates = self.fetchFundingIntervals(symbols = [symbol], params = params);
        rate = safeValue(rates, symbol);
        if functions.ccxtruthy(rate == nothing)
            throw(NullResponse(string(self.id, " fetchFundingInterval() returned no data for ", symbol)));
        else
            return rate
        end
    else
        throw(NotSupported(string(self.id, " fetchFundingInterval() is not supported yet")));
    end

end
function fetchMarkOHLCV(self::CcxtExchange, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchMarkOHLCV"), nothing))
        request = Dict{Symbol, Any}(
            Symbol("price") => "mark"
        );
            return self.fetchOHLCV(symbol, timeframe = timeframe, since = since, limit = limit, params = extend(request, params))
    else
        throw(NotSupported(string(self.id, " fetchMarkOHLCV () is not supported yet")));
    end

end
function fetchIndexOHLCV(self::CcxtExchange, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchIndexOHLCV"), nothing))
        request = Dict{Symbol, Any}(
            Symbol("price") => "index"
        );
            return self.fetchOHLCV(symbol, timeframe = timeframe, since = since, limit = limit, params = extend(request, params))
    else
        throw(NotSupported(string(self.id, " fetchIndexOHLCV () is not supported yet")));
    end

end
function fetchPremiumIndexOHLCV(self::CcxtExchange, symbol; timeframe="1m", since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchPremiumIndexOHLCV"), nothing))
        request = Dict{Symbol, Any}(
            Symbol("price") => "premiumIndex"
        );
            return self.fetchOHLCV(symbol, timeframe = timeframe, since = since, limit = limit, params = extend(request, params))
    else
        throw(NotSupported(string(self.id, " fetchPremiumIndexOHLCV () is not supported yet")));
    end

end
function handleTimeInForce(self::CcxtExchange; params=Dict())
    timeInForce = safeStringUpper(params, "timeInForce");
    if functions.ccxtruthy(timeInForce != nothing)
        exchangeValue = safeString(get(self.options, Symbol("timeInForce"), nothing), timeInForce);
        if functions.ccxtruthy(exchangeValue == nothing)
            throw(ExchangeError(string(self.id, " does not support timeInForce \"", timeInForce, "\"")));
        end
            return exchangeValue
    end
    return nothing

end
function convertTypeToAccount(self::CcxtExchange, account)
    accountsByType = self.safeDict(self.options, "accountsByType", defaultValue = Dict{Symbol, Any}());
    lowercaseAccount = lowercase(account);
    if functions.ccxtruthy(ccxt_in(lowercaseAccount, accountsByType))
            return get(accountsByType, Symbol(lowercaseAccount), nothing)
    end
    markets = self.markets;
    marketsById = self.markets_by_id;
    if functions.ccxtruthy(@functions.ccxt_or((@functions.ccxt_and((markets != nothing), (ccxt_in(account, markets)))), (@functions.ccxt_and((marketsById != nothing), (ccxt_in(account, marketsById))))))
        market = self.market(account);
            return get(market, Symbol("id"), nothing)
    else
        return account
    end

end
function checkRequiredArgument(self::CcxtExchange, methodName, argument, argumentName; options=[])
    optionsLength = length(options);
    if functions.ccxtruthy(@functions.ccxt_or((argument == nothing), (@functions.ccxt_and((functions.ccxt_gt(optionsLength, 0)), (!functions.ccxtruthy((inArray(argument, options))))))))
        messageOptions = join(options, ", ");
        message = string(self.id, " ", methodName, "() requires a ", argumentName, " argument");
        if functions.ccxtruthy(messageOptions != "")
            message += string(", one of ", "(", messageOptions, ")");
        end
        throw(ArgumentsRequired(message));
    end

end
function checkRequiredMarginArgument(self::CcxtExchange, methodName, symbol, marginMode)
    if functions.ccxtruthy(@functions.ccxt_and((marginMode == "isolated"), (symbol == nothing)))
        throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires a symbol argument for isolated margin")));
    elseif functions.ccxtruthy(@functions.ccxt_and((marginMode == "cross"), (symbol != nothing)))
        throw(ArgumentsRequired(string(self.id, " ", methodName, "() cannot have a symbol argument for cross margin")));
    end

end
function parseDepositWithdrawFees(self::CcxtExchange, response; codes=nothing, currencyIdKey=nothing)
    depositWithdrawFees = Dict{Symbol, Any}();
    isArray = functions.ccxt_isArray(response);
    responseKeys = response;
    if functions.ccxtruthy(!functions.ccxtruthy(isArray))
        responseKeys = objectKeys(response);
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(responseKeys)))
        entry = get(responseKeys, i + 1, nothing);
        dictionary = functions.ccxtruthy(isArray) ? entry : get(response, Symbol(entry), nothing);
        currencyId = entry;
        if functions.ccxtruthy(isArray)
            currencyId = functions.ccxtruthy((currencyIdKey == nothing)) ? nothing : safeString(dictionary, currencyIdKey);
        end
        currency = self.safeCurrency(currencyId);
        code = safeString(currency, "code");
        if functions.ccxtruthy(@functions.ccxt_or((codes == nothing), (inArray(code, codes))))
            depositWithdrawFees[Symbol(code)] = self.parseDepositWithdrawFee(dictionary, currency = currency);
        end
        i += 1
    end
    return depositWithdrawFees

end
function parseDepositWithdrawFee(self::CcxtExchange, fee; currency=nothing)
    throw(NotSupported(string(self.id, " parseDepositWithdrawFee() is not supported yet")));

end
function depositWithdrawFee(self::CcxtExchange, info)
    return Dict{Symbol, Any}(
    Symbol("info") => info,
    Symbol("withdraw") => Dict{Symbol, Any}(
        Symbol("fee") => nothing,
        Symbol("percentage") => nothing
    ),
    Symbol("deposit") => Dict{Symbol, Any}(
        Symbol("fee") => nothing,
        Symbol("percentage") => nothing
    ),
    Symbol("networks") => Dict{Symbol, Any}()
)

end
function assignDefaultDepositWithdrawFees(self::CcxtExchange, fee; currency=nothing)
    networkKeys = objectKeys(get(fee, Symbol("networks"), nothing));
    numNetworks = length(networkKeys);
    if functions.ccxtruthy(numNetworks == 1)
        fee[Symbol("withdraw")] = get(get(get(fee, Symbol("networks"), nothing), Symbol(get(networkKeys, 1, nothing)), nothing), Symbol("withdraw"), nothing);
        fee[Symbol("deposit")] = get(get(get(fee, Symbol("networks"), nothing), Symbol(get(networkKeys, 1, nothing)), nothing), Symbol("deposit"), nothing);
            return fee
    end
    currencyCode = safeString(currency, "code");
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, numNetworks))
        network = get(networkKeys, i + 1, nothing);
        if functions.ccxtruthy(network == currencyCode)
            fee[Symbol("withdraw")] = get(get(get(fee, Symbol("networks"), nothing), Symbol(get(networkKeys, i + 1, nothing)), nothing), Symbol("withdraw"), nothing);
            fee[Symbol("deposit")] = get(get(get(fee, Symbol("networks"), nothing), Symbol(get(networkKeys, i + 1, nothing)), nothing), Symbol("deposit"), nothing);
        end
        i += 1
    end
    return fee

end
function parseIncome(self::CcxtExchange, info; market=nothing)
    throw(NotSupported(string(self.id, " parseIncome () is not supported yet")));

end
function parseIncomes(self::CcxtExchange, incomes; market=nothing, since=nothing, limit=nothing)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(incomes)))
        entry = get(incomes, i + 1, nothing);
        parsed = self.parseIncome(entry, market = market);
        push!(result, parsed);
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    symbol = safeString(market, "symbol");
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end
function getMarketFromSymbols(self::CcxtExchange; symbols)

end
function getMarketFromSymbols(self::CcxtExchange; symbols=nothing)

end
function getMarketFromSymbols(self::CcxtExchange; symbols=nothing)
    if functions.ccxtruthy(symbols == nothing)
            return nothing
    end
    firstMarket = safeString(symbols, 0);
    if functions.ccxtruthy(firstMarket == nothing)
            return nothing
    end
    market = self.market(firstMarket);
    return market

end
function parseWsOHLCVs(self::CcxtExchange, ohlcvs; market=nothing, timeframe="1m", since=nothing, limit=nothing)
    results = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(ohlcvs)))
        push!(results, self.parseWsOHLCV(get(ohlcvs, i + 1, nothing), market = market));
        i += 1
    end
    return results

end
function fetchTransactions(self::CcxtExchange; code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchDepositsWithdrawals"), nothing))
            return self.fetchDepositsWithdrawals(code = code, since = since, limit = limit, params = params)
    else
        throw(NotSupported(string(self.id, " fetchTransactions () is not supported yet")));
    end

end
function filterByArrayPositions(self::CcxtExchange, objects, key; values=nothing, indexed=true)
    return self.filterByArray(objects, key, values = values, indexed = indexed)

end
function filterByArrayTickers(self::CcxtExchange, objects, key; values=nothing, indexed=true)
    return self.filterByArray(objects, key, values = values, indexed = indexed)

end
function filterByArrayADLRanks(self::CcxtExchange, objects, key; values=nothing, indexed=true)
    return self.filterByArray(objects, key, values = values, indexed = indexed)

end
function createOHLCVObject(self::CcxtExchange, symbol, timeframe, data)
    res = Dict{Symbol, Any}();
    res[Symbol(symbol)] = Dict{Symbol, Any}();
    res[Symbol(symbol)][Symbol(timeframe)] = data;
    return res

end
function handleMaxEntriesPerRequestAndParams(self::CcxtExchange, method; maxEntriesPerRequest=nothing, params=Dict())
    newMaxEntriesPerRequest = nothing;
    (newMaxEntriesPerRequest, params) = self.handleOptionAndParams(params, method, "maxEntriesPerRequest");
    if functions.ccxtruthy(@functions.ccxt_and((newMaxEntriesPerRequest != nothing), (newMaxEntriesPerRequest != maxEntriesPerRequest)))
        maxEntriesPerRequest = newMaxEntriesPerRequest;
    end
    if functions.ccxtruthy(maxEntriesPerRequest == nothing)
        maxEntriesPerRequest = 1000;
    end
    return [maxEntriesPerRequest, params]

end
function fetchPaginatedCallDynamic(self::CcxtExchange, method; symbol=nothing, since=nothing, limit=nothing, params=Dict(), maxEntriesPerRequest=nothing, removeRepeated=true)
    maxCalls = 10;
    (maxCalls, params) = self.handleOptionAndParams(params, method, "paginationCalls", defaultValue = maxCalls);
    maxRetries = 3;
    (maxRetries, params) = self.handleOptionAndParams(params, method, "maxRetries", defaultValue = maxRetries);
    paginationDirection = nothing;
    (paginationDirection, params) = self.handleOptionAndParams(params, method, "paginationDirection", defaultValue = "backward");
    paginationTimestamp = nothing;
    removeRepeatedOption = removeRepeated;
    (removeRepeatedOption, params) = self.handleOptionAndParams(params, method, "removeRepeated", defaultValue = removeRepeated);
    calls = 0;
    result = [];
    errors = 0;
    until = safeIntegerN(params, ["until", "untill", "till"]);
    (maxEntriesPerRequest, params) = self.handleMaxEntriesPerRequestAndParams(method, maxEntriesPerRequest = maxEntriesPerRequest, params = params);
    if functions.ccxtruthy((paginationDirection == "forward"))
        if functions.ccxtruthy(since == nothing)
            throw(ArgumentsRequired(string(self.id, " pagination requires a since argument when paginationDirection set to forward")));
        end
        paginationTimestamp = since;
    end
    while functions.ccxtruthy((functions.ccxt_lt(calls, maxCalls)))
        calls += 1;
        try
            if functions.ccxtruthy(paginationDirection == "backward")
                if functions.ccxtruthy(paginationTimestamp != nothing)
                    params[Symbol("until")] = paginationTimestamp - 1;
                end
                response = getproperty(self, Symbol(method))(symbol, nothing, maxEntriesPerRequest, params);
                responseLength = length(response);
                if functions.ccxtruthy(self.verbose)
                    backwardMessage = string("Dynamic pagination call ", numberToString(calls), " method ", method, " response length ", numberToString(responseLength));
                    if functions.ccxtruthy(paginationTimestamp != nothing)
                        backwardMessage += string(" timestamp ", numberToString(paginationTimestamp));
                    end
                    self.log(backwardMessage);
                end
                if functions.ccxtruthy(responseLength == 0)
                    break
                end
                errors = 0;
                result = arrayConcat(result, response);
                firstElement = safeValue(response, 0);
                paginationTimestamp = safeInteger2(firstElement, "timestamp", 0);
                if functions.ccxtruthy(paginationTimestamp == nothing)
                    break
                end
                if functions.ccxtruthy(@functions.ccxt_and((since != nothing), (functions.ccxt_le(paginationTimestamp, since))))
                    break
                end
            else
                response = getproperty(self, Symbol(method))(symbol, paginationTimestamp, maxEntriesPerRequest, params);
                responseLength = length(response);
                if functions.ccxtruthy(self.verbose)
                    forwardMessage = string("Dynamic pagination call ", numberToString(calls), " method ", method, " response length ", numberToString(responseLength));
                    if functions.ccxtruthy(paginationTimestamp != nothing)
                        forwardMessage += string(" timestamp ", numberToString(paginationTimestamp));
                    end
                    self.log(forwardMessage);
                end
                if functions.ccxtruthy(responseLength == 0)
                    break
                end
                errors = 0;
                result = arrayConcat(result, response);
                last_var = safeValue(response, responseLength - 1);
                lastTimestamp = safeInteger(last_var, "timestamp", 0);
                if functions.ccxtruthy(lastTimestamp == nothing)
                    break
                end
                nextPaginationTimestamp = lastTimestamp + 1;
                paginationTimestamp = nextPaginationTimestamp;
                if functions.ccxtruthy(@functions.ccxt_and((until != nothing), (functions.ccxt_ge(nextPaginationTimestamp, until))))
                    break
                end
            end
        catch e
            errors += 1;
            if functions.ccxtruthy(functions.ccxt_gt(errors, maxRetries))
                throw(e);
            end

        end
    end
    uniqueResults = result;
    if functions.ccxtruthy(removeRepeatedOption)
        uniqueResults = self.removeRepeatedElementsFromArray(result);
    end
    key = functions.ccxtruthy((method == "fetchOHLCV")) ? 0 : "timestamp";
    sortedRes = sortBy(uniqueResults, key);
    return self.filterBySinceLimit(sortedRes, since = since, limit = limit, key = key)

end
function safeDeterministicCall(self::CcxtExchange, method; symbol=nothing, since=nothing, limit=nothing, timeframe=nothing, params=Dict())
    maxRetries = 3;
    (maxRetries, params) = self.handleOptionAndParams(params, method, "maxRetries", defaultValue = maxRetries);
    errors = 0;
    while functions.ccxtruthy(functions.ccxt_le(errors, maxRetries))
        try
            if functions.ccxtruthy(@functions.ccxt_and(timeframe, method != "fetchFundingRateHistory"))
                    return getproperty(self, Symbol(method))(symbol, timeframe, since, limit, params)
            else
                return getproperty(self, Symbol(method))(symbol, since, limit, params)
            end
        catch e
            if functions.ccxtruthy(isa(e, RateLimitExceeded))
                throw(e);
            end
            errors += 1;
            if functions.ccxtruthy(functions.ccxt_gt(errors, maxRetries))
                throw(e);
            end

        end
    end
    return []

end
function fetchPaginatedCallDeterministic(self::CcxtExchange, method; symbol=nothing, since=nothing, limit=nothing, timeframe=nothing, params=Dict(), maxEntriesPerRequest=nothing)
    maxCalls = 10;
    (maxCalls, params) = self.handleOptionAndParams(params, method, "paginationCalls", defaultValue = maxCalls);
    (maxEntriesPerRequest, params) = self.handleMaxEntriesPerRequestAndParams(method, maxEntriesPerRequest = maxEntriesPerRequest, params = params);
    params = omit(params, "paginationDirection");
    current = milliseconds();
    tasks = [];
    time = self.parseTimeframe(timeframe) * 1000;
    maxEntriesPerRequest = self.requireValue(maxEntriesPerRequest, message = "fetchPaginatedCallDeterministic() maxEntriesPerRequest is required");
    step = time * maxEntriesPerRequest;
    until = safeInteger2(params, "until", "till");
    currentSince = current - (maxCalls * step) - 1;
    if functions.ccxtruthy(since != nothing)
        if functions.ccxtruthy(until != nothing)
            currentSince = since;
        else
            currentSince = max(currentSince, since);
        end
    else
        currentSince = max(currentSince, 1241440531000);
    end
    if functions.ccxtruthy(until != nothing)
        if functions.ccxtruthy(since == nothing)
            throw(ArgumentsRequired(string(self.id, " fetchPaginatedCallDeterministic() requires a since argument when until is set")));
        end
        requiredCalls = ceil((until - since) / step);
        if functions.ccxtruthy(functions.ccxt_gt(requiredCalls, maxCalls))
            throw(BadRequest(string(self.id, " the number of required calls is greater than the max number of calls allowed, either increase the paginationCalls or decrease the since-until gap. Current paginationCalls limit is ", maxCalls, " required calls is ", requiredCalls)));
        end
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, maxCalls))
        if functions.ccxtruthy(@functions.ccxt_and((until != nothing), (functions.ccxt_ge(currentSince, until))))
            break
        end
        if functions.ccxtruthy(functions.ccxt_ge(currentSince, current))
            break
        end
        push!(tasks, self.safeDeterministicCall(method, symbol = symbol, since = currentSince, limit = maxEntriesPerRequest, timeframe = timeframe, params = params));
        currentSince = self.sum(currentSince, step) - 1;
        i += 1
    end
    results = asyncmap(Base.fetch, tasks);
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(results)))
        result = arrayConcat(result, get(results, i + 1, nothing));
        i += 1
    end
    uniqueResults = self.removeRepeatedElementsFromArray(result);
    key = functions.ccxtruthy((method == "fetchOHLCV")) ? 0 : "timestamp";
    return self.filterBySinceLimit(uniqueResults, since = since, limit = limit, key = key)

end
function fetchPaginatedCallCursor(self::CcxtExchange, method; symbol=nothing, since=nothing, limit=nothing, params=Dict(), cursorReceived=nothing, cursorSent=nothing, cursorIncrement=nothing, maxEntriesPerRequest=nothing)
    maxCalls = 10;
    (maxCalls, params) = self.handleOptionAndParams(params, method, "paginationCalls", defaultValue = maxCalls);
    maxRetries = 3;
    (maxRetries, params) = self.handleOptionAndParams(params, method, "maxRetries", defaultValue = maxRetries);
    (maxEntriesPerRequest, params) = self.handleMaxEntriesPerRequestAndParams(method, maxEntriesPerRequest = maxEntriesPerRequest, params = params);
    cursorValue = nothing;
    i = 0;
    errors = 0;
    result = [];
    timeframe = safeString(params, "timeframe");
    params = omit(params, "timeframe");
    while functions.ccxtruthy(functions.ccxt_lt(i, maxCalls))
        try
            if functions.ccxtruthy(cursorValue != nothing)
                if functions.ccxtruthy(cursorIncrement != nothing)
                    cursorValue = self.parseToInt(cursorValue) + cursorIncrement;
                end
                params[Symbol(cursorSent)] = cursorValue;
            end
            response = nothing;
            if functions.ccxtruthy(method == "fetchAccounts")
                response = getproperty(self, Symbol(method))(params);
            elseif functions.ccxtruthy(@functions.ccxt_or(method == "getLeverageTiersPaginated", method == "fetchPositions"))
                response = getproperty(self, Symbol(method))(symbol, params);
            else
                if functions.ccxtruthy(method == "fetchOpenInterestHistory")
                    if functions.ccxtruthy(!isa(symbol, AbstractString))
                        throw(ArgumentsRequired(string(self.id, " fetchPaginatedCallCursor() requires a symbol argument")));
                    end
                    if functions.ccxtruthy(timeframe == nothing)
                        throw(ArgumentsRequired(string(self.id, " fetchPaginatedCallCursor() requires a timeframe argument")));
                    end
                    response = getproperty(self, Symbol(method))(symbol, timeframe, since, maxEntriesPerRequest, params);
                else
                    response = getproperty(self, Symbol(method))(symbol, since, maxEntriesPerRequest, params);
                end

            end
            errors = 0;
            if functions.ccxtruthy(response == nothing)
                throw(NullResponse(string(self.id, " fetchPaginatedCallCursor() returned empty response")));
            end
            responseLength = length(response);
            if functions.ccxtruthy(self.verbose)
                cursorString = functions.ccxtruthy((cursorValue == nothing)) ? "" : cursorValue;
                iteration = (i + 1);
                cursorMessage = string("Cursor pagination call ", iteration, " method ", method, " response length ", responseLength, " cursor ", cursorString);
                self.log(cursorMessage);
            end
            if functions.ccxtruthy(responseLength == 0)
                break
            end
            if functions.ccxtruthy(response != nothing)
                result = arrayConcat(result, response);
            end
            last_var = self.safeDict(response, responseLength - 1);
            cursorValue = nothing;
            j = 0
            while functions.ccxtruthy(functions.ccxt_lt(j, responseLength))
                index = responseLength - j - 1;
                entry = self.safeDict(response, index);
                info = self.safeDict(entry, "info");
                cursor = functions.ccxtruthy((cursorReceived == nothing)) ? nothing : safeValue(info, cursorReceived);
                if functions.ccxtruthy(cursor != nothing)
                    cursorValue = cursor;
                    break
                end
                j += 1
            end
            if functions.ccxtruthy(cursorValue == nothing)
                break
            end
            lastTimestamp = safeInteger(last_var, "timestamp");
            if functions.ccxtruthy(since == nothing)
                throw(ArgumentsRequired(string(self.id, " fetchPaginatedCallCursor() requires a since argument")));
            end
            if functions.ccxtruthy(@functions.ccxt_and(lastTimestamp != nothing, functions.ccxt_lt(lastTimestamp, since)))
                break
            end
        catch e
            errors += 1;
            if functions.ccxtruthy(functions.ccxt_gt(errors, maxRetries))
                throw(e);
            end

        end
        i += 1;
    end
    sorted = self.sortCursorPaginatedResult(result);
    key = functions.ccxtruthy((method == "fetchOHLCV")) ? 0 : "timestamp";
    return self.filterBySinceLimit(sorted, since = since, limit = limit, key = key)

end
function fetchPaginatedCallIncremental(self::CcxtExchange, method; symbol=nothing, since=nothing, limit=nothing, params=Dict(), pageKey=nothing, maxEntriesPerRequest=nothing)
    maxCalls = 10;
    (maxCalls, params) = self.handleOptionAndParams(params, method, "paginationCalls", defaultValue = maxCalls);
    maxRetries = 3;
    (maxRetries, params) = self.handleOptionAndParams(params, method, "maxRetries", defaultValue = maxRetries);
    (maxEntriesPerRequest, params) = self.handleMaxEntriesPerRequestAndParams(method, maxEntriesPerRequest = maxEntriesPerRequest, params = params);
    i = 0;
    errors = 0;
    result = [];
    while functions.ccxtruthy(functions.ccxt_lt(i, maxCalls))
        try
            params[Symbol(pageKey)] = i + 1;
            response = getproperty(self, Symbol(method))(symbol, since, maxEntriesPerRequest, params);
            errors = 0;
            responseLength = length(response);
            if functions.ccxtruthy(self.verbose)
                iteration = string((i + 1));
                incrementalMessage = string("Incremental pagination call ", iteration, " method ", method, " response length ", responseLength);
                self.log(incrementalMessage);
            end
            if functions.ccxtruthy(responseLength == 0)
                break
            end
            result = arrayConcat(result, response);
        catch e
            errors += 1;
            if functions.ccxtruthy(functions.ccxt_gt(errors, maxRetries))
                throw(e);
            end

        end
        i += 1;
    end
    sorted = self.sortCursorPaginatedResult(result);
    key = functions.ccxtruthy((method == "fetchOHLCV")) ? 0 : "timestamp";
    return self.filterBySinceLimit(sorted, since = since, limit = limit, key = key)

end
function sortCursorPaginatedResult(self::CcxtExchange, result)
    first_var = safeValue(result, 0);
    if functions.ccxtruthy(first_var != nothing)
        if functions.ccxtruthy(ccxt_in("timestamp", first_var))
                return sortBy(result, "timestamp", true)
        end
        if functions.ccxtruthy(ccxt_in("id", first_var))
                return sortBy(result, "id", true)
        end
    end
    return result

end
function removeRepeatedElementsFromArray(self::CcxtExchange, input; fallbackToTimestamp=true)
    uniqueDic = Dict{Symbol, Any}();
    uniqueResult = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(input)))
        entry = get(input, i + 1, nothing);
        uniqValue = functions.ccxtruthy(fallbackToTimestamp) ? safeStringN(entry, ["id", "timestamp", 0]) : safeString(entry, "id");
        if functions.ccxtruthy(@functions.ccxt_and(uniqValue != nothing, !functions.ccxtruthy((ccxt_in(uniqValue, uniqueDic)))))
            uniqueDic[Symbol(uniqValue)] = 1;
                        push!(uniqueResult, entry);
        end
        i += 1
    end
    valuesLength = length(uniqueResult);
    if functions.ccxtruthy(functions.ccxt_gt(valuesLength, 0))
            return uniqueResult
    end
    return input

end
function removeRepeatedTradesFromArray(self::CcxtExchange, input)
    uniqueResult = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(input)))
        entry = get(input, i + 1, nothing);
        id = safeString(entry, "id");
        if functions.ccxtruthy(id == nothing)
            price = safeString(entry, "price");
            amount = safeString(entry, "amount");
            timestamp = safeString(entry, "timestamp");
            side = safeString(entry, "side");
            if functions.ccxtruthy(timestamp == nothing)
                throw(ExchangeError(string(self.id, " removeRepeatedTradesFromArray() missing timestamp")));
            end
            id = string("t_", timestamp, "_", side, "_", price, "_", amount);
        end
        if functions.ccxtruthy(@functions.ccxt_and(id != nothing, !functions.ccxtruthy((ccxt_in(id, uniqueResult)))))
            uniqueResult[Symbol(id)] = entry;
        end
        i += 1
    end
    values_var = objectValues(uniqueResult);
    return values_var

end
function removeKeysFromDict(self::CcxtExchange, dict, removeKeys)
    keys_var = objectKeys(dict);
    newDict = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(keys_var)))
        key = get(keys_var, i + 1, nothing);
        if functions.ccxtruthy(!functions.ccxtruthy(inArray(key, removeKeys)))
            newDict[Symbol(key)] = get(dict, Symbol(key), nothing);
        end
        i += 1
    end
    return newDict

end
function handleUntilOption(self::CcxtExchange, key, request, params; multiplier=1)
    until = safeInteger2(params, "until", "till");
    if functions.ccxtruthy(until != nothing)
        request[Symbol(key)] = self.parseToInt(until * multiplier);
        params = omit(params, ["until", "till"]);
    end
    return [request, params]

end
function safeOpenInterest(self::CcxtExchange, interest; market=nothing)
    symbol = safeString(interest, "symbol");
    if functions.ccxtruthy(symbol == nothing)
        symbol = safeString(market, "symbol");
    end
    return extend(interest, Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("baseVolume") => self.safeNumber(interest, "baseVolume"),
    Symbol("quoteVolume") => self.safeNumber(interest, "quoteVolume"),
    Symbol("openInterestAmount") => self.safeNumber(interest, "openInterestAmount"),
    Symbol("openInterestValue") => self.safeNumber(interest, "openInterestValue"),
    Symbol("timestamp") => safeInteger(interest, "timestamp"),
    Symbol("datetime") => safeString(interest, "datetime"),
    Symbol("info") => safeValue(interest, "info")
))

end
function parseLiquidation(self::CcxtExchange, liquidation; market=nothing)
    throw(NotSupported(string(self.id, " parseLiquidation () is not supported yet")));

end
function parseLiquidations(self::CcxtExchange, liquidations; market=nothing, since=nothing, limit=nothing)
    result = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(liquidations)))
        entry = get(liquidations, i + 1, nothing);
        parsed = self.parseLiquidation(entry, market = market);
        push!(result, parsed);
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    symbol = safeString(market, "symbol");
    return self.filterBySymbolSinceLimit(sorted, symbol = symbol, since = since, limit = limit)

end
function parseGreeks(self::CcxtExchange, greeks; market=nothing)
    throw(NotSupported(string(self.id, " parseGreeks () is not supported yet")));

end
function parseAllGreeks(self::CcxtExchange, greeks; symbols=nothing, params=Dict())
    results = [];
    if functions.ccxtruthy(functions.ccxt_isArray(greeks))
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(greeks)))
            parsedTicker = self.parseGreeks(get(greeks, i + 1, nothing));
            greek = extend(parsedTicker, params);
            push!(results, greek);
            i += 1
        end

    else
        marketIds = objectKeys(greeks);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(marketIds)))
            marketId = get(marketIds, i + 1, nothing);
            market = self.safeMarket(marketId = marketId);
            parsed = self.parseGreeks(get(greeks, Symbol(marketId), nothing), market = market);
            greek = extend(parsed, params);
            push!(results, greek);
            i += 1
        end
    end
    symbols = self.marketSymbols(symbols = symbols);
    return self.filterByArray(results, "symbol", values = symbols)

end
function parseOption(self::CcxtExchange, chain; currency=nothing, market=nothing)
    throw(NotSupported(string(self.id, " parseOption () is not supported yet")));

end
function parseOptionChain(self::CcxtExchange, response; currencyKey=nothing, symbolKey=nothing)
    optionStructures = Dict{Symbol, Any}();
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        info = get(response, i + 1, nothing);
        currencyId = functions.ccxtruthy((currencyKey == nothing)) ? nothing : safeString(info, currencyKey);
        currency = self.safeCurrency(currencyId);
        marketId = functions.ccxtruthy((symbolKey == nothing)) ? nothing : safeString(info, symbolKey);
        market = self.safeMarket(marketId = marketId, market = nothing, delimiter = nothing, marketType = "option");
        optionStructures[Symbol(market[Symbol("symbol")])] = self.parseOption(info, currency = currency, market = market);
        i += 1
    end
    return optionStructures

end
function parseMarginModes(self::CcxtExchange, response; symbols=nothing, symbolKey=nothing, marketType=nothing)
    marginModeStructures = Dict{Symbol, Any}();
    if functions.ccxtruthy(marketType == nothing)
        marketType = "swap";
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        info = get(response, i + 1, nothing);
        marketId = functions.ccxtruthy((symbolKey == nothing)) ? nothing : safeString(info, symbolKey);
        market = self.safeMarket(marketId = marketId, market = nothing, delimiter = nothing, marketType = marketType);
        if functions.ccxtruthy(@functions.ccxt_or((symbols == nothing), inArray(get(market, Symbol("symbol"), nothing), symbols)))
            marginModeStructures[Symbol(market[Symbol("symbol")])] = self.parseMarginMode(info, market = market);
        end
        i += 1
    end
    return marginModeStructures

end
function parseMarginMode(self::CcxtExchange, marginMode; market=nothing)
    throw(NotSupported(string(self.id, " parseMarginMode () is not supported yet")));

end
function parseLeverages(self::CcxtExchange, response; symbols=nothing, symbolKey=nothing, marketType=nothing)
    leverageStructures = Dict{Symbol, Any}();
    if functions.ccxtruthy(marketType == nothing)
        marketType = "swap";
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        info = get(response, i + 1, nothing);
        marketId = functions.ccxtruthy((symbolKey == nothing)) ? nothing : safeString(info, symbolKey);
        market = self.safeMarket(marketId = marketId, market = nothing, delimiter = nothing, marketType = marketType);
        if functions.ccxtruthy(@functions.ccxt_or((symbols == nothing), inArray(get(market, Symbol("symbol"), nothing), symbols)))
            leverageStructures[Symbol(market[Symbol("symbol")])] = self.parseLeverage(info, market = market);
        end
        i += 1
    end
    return leverageStructures

end
function parseLeverage(self::CcxtExchange, leverage; market=nothing)
    throw(NotSupported(string(self.id, " parseLeverage () is not supported yet")));

end
function parseConversions(self::CcxtExchange, conversions; code=nothing, fromCurrencyKey=nothing, toCurrencyKey=nothing, since=nothing, limit=nothing, params=Dict())
    conversionsArray = toArray(conversions);
    result = [];
    fromCurrency = nothing;
    toCurrency = nothing;
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(conversionsArray)))
        entry = get(conversionsArray, i + 1, nothing);
        fromId = functions.ccxtruthy((fromCurrencyKey == nothing)) ? nothing : safeString(entry, fromCurrencyKey);
        toId = functions.ccxtruthy((toCurrencyKey == nothing)) ? nothing : safeString(entry, toCurrencyKey);
        if functions.ccxtruthy(fromId != nothing)
            fromCurrency = self.safeCurrency(fromId);
        end
        if functions.ccxtruthy(toId != nothing)
            toCurrency = self.safeCurrency(toId);
        end
        conversion = extend(self.parseConversion(entry, fromCurrency = fromCurrency, toCurrency = toCurrency), params);
        push!(result, conversion);
        i += 1
    end
    sorted = sortBy(result, "timestamp");
    currency = nothing;
    if functions.ccxtruthy(code != nothing)
        currency = self.safeCurrency(code);
        if functions.ccxtruthy(currency == nothing)
            throw(ExchangeError(string(self.id, " parseConversions() could not resolve currency")));
        end
        code = get(currency, Symbol("code"), nothing);
    end
    if functions.ccxtruthy(code == nothing)
            return self.filterBySinceLimit(sorted, since = since, limit = limit)
    end
    fromConversion = filterBy(sorted, "fromCurrency", code);
    toConversion = filterBy(sorted, "toCurrency", code);
    both = arrayConcat(fromConversion, toConversion);
    return self.filterBySinceLimit(both, since = since, limit = limit)

end
function parseConversion(self::CcxtExchange, conversion; fromCurrency=nothing, toCurrency=nothing)
    if functions.ccxtruthy(conversion == nothing)
        throw(NotSupported(string(self.id, " parseConversion () is not supported yet")));
    end
    throw(NotSupported(string(self.id, " parseConversion () is not supported yet")));

end
function convertExpireDate(self::CcxtExchange, date)
    if functions.ccxtruthy(date == nothing)
            return nothing
    end
    year = functions.ccxt_slice(date, 0, 2);
    month = functions.ccxt_slice(date, 2, 4);
    day = functions.ccxt_slice(date, 4, 6);
    reconstructedDate = string("20", year, "-", month, "-", day, "T00:00:00Z");
    return reconstructedDate

end
function convertExpireDateToMarketIdDate(self::CcxtExchange, date)
    if functions.ccxtruthy(date == nothing)
            return nothing
    end
    year = functions.ccxt_slice(date, 0, 2);
    monthRaw = functions.ccxt_slice(date, 2, 4);
    month = nothing;
    day = functions.ccxt_slice(date, 4, 6);
    if functions.ccxtruthy(monthRaw == "01")
        month = "JAN";
    elseif functions.ccxtruthy(monthRaw == "02")
        month = "FEB";
    else
        if functions.ccxtruthy(monthRaw == "03")
            month = "MAR";
        elseif functions.ccxtruthy(monthRaw == "04")
            month = "APR";
        else
            if functions.ccxtruthy(monthRaw == "05")
                month = "MAY";
            elseif functions.ccxtruthy(monthRaw == "06")
                month = "JUN";
            else
                if functions.ccxtruthy(monthRaw == "07")
                    month = "JUL";
                elseif functions.ccxtruthy(monthRaw == "08")
                    month = "AUG";
                else
                    if functions.ccxtruthy(monthRaw == "09")
                        month = "SEP";
                    elseif functions.ccxtruthy(monthRaw == "10")
                        month = "OCT";
                    else
                        if functions.ccxtruthy(monthRaw == "11")
                            month = "NOV";
                        elseif functions.ccxtruthy(monthRaw == "12")
                            month = "DEC";
                        end

                    end

                end

            end

        end

    end
    reconstructedDate = string(day, month, year);
    return reconstructedDate

end
function convertMarketIdExpireDate(self::CcxtExchange, date)
    if functions.ccxtruthy(date == nothing)
            return nothing
    end
    monthMappping = Dict{Symbol, Any}(
        Symbol("JAN") => "01",
        Symbol("FEB") => "02",
        Symbol("MAR") => "03",
        Symbol("APR") => "04",
        Symbol("MAY") => "05",
        Symbol("JUN") => "06",
        Symbol("JUL") => "07",
        Symbol("AUG") => "08",
        Symbol("SEP") => "09",
        Symbol("OCT") => "10",
        Symbol("NOV") => "11",
        Symbol("DEC") => "12"
    );
    if functions.ccxtruthy(length(date) == 6)
        date = string("0", date);
    end
    year = functions.ccxt_slice(date, 0, 2);
    monthName = functions.ccxt_slice(date, 2, 5);
    month = safeString(monthMappping, monthName);
    day = functions.ccxt_slice(date, 5, 7);
    reconstructedDate = string(day, month, year);
    return reconstructedDate

end
function loadMarketsAndSignIn(self::CcxtExchange, )
    asyncmap(Base.fetch, [self.loadMarkets(), self.signIn()]);

end
function parseMarginModification(self::CcxtExchange, data; market=nothing)
    if functions.ccxtruthy(data == nothing)
        throw(NotSupported(string(self.id, " parseMarginModification() is not supported yet")));
    end
    throw(NotSupported(string(self.id, " parseMarginModification() is not supported yet")));

end
function parseMarginModifications(self::CcxtExchange, response; symbols=nothing, symbolKey=nothing, marketType=nothing)
    marginModifications = [];
    if functions.ccxtruthy(response == nothing)
            return marginModifications
    end
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        info = get(response, i + 1, nothing);
        marketId = functions.ccxtruthy((symbolKey == nothing)) ? nothing : safeString(info, symbolKey);
        market = self.safeMarket(marketId = marketId, market = nothing, delimiter = nothing, marketType = marketType);
        if functions.ccxtruthy(@functions.ccxt_or((symbols == nothing), inArray(get(market, Symbol("symbol"), nothing), symbols)))
                        push!(marginModifications, self.parseMarginModification(info, market = market));
        end
        i += 1
    end
    return marginModifications

end
function fetchTransfer(self::CcxtExchange, id; code=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchTransfer () is not supported yet")));

end
function fetchTransfers(self::CcxtExchange; code=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchTransfers () is not supported yet")));

end
function unWatchOHLCV(self::CcxtExchange, symbol; timeframe="1m", params=Dict())
    throw(NotSupported(string(self.id, " unWatchOHLCV () is not supported yet")));

end
function withdrawWs(self::CcxtExchange, code, amount, address; tag=nothing, params=Dict())
    throw(NotSupported(string(self.id, " withdrawWs () is not supported yet")));

end
function unWatchMyTrades(self::CcxtExchange; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " unWatchMyTrades () is not supported yet")));

end
function fetchOrdersByStatusWs(self::CcxtExchange, status; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchOrdersByStatusWs () is not supported yet")));

end
function unWatchBidsAsks(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " unWatchBidsAsks () is not supported yet")));

end
function cleanUnsubscription(self::CcxtExchange, client, subHash, unsubHash; subHashIsPrefix=false)
    if functions.ccxtruthy(@functions.ccxt_and((unsubHash != nothing), (ccxt_in(unsubHash, get(client, Symbol("subscriptions"), nothing)))))
                delete!(get(client, Symbol("subscriptions"), nothing), Symbol(unsubHash));
    end
    if functions.ccxtruthy(!functions.ccxtruthy(subHashIsPrefix))
        if functions.ccxtruthy(@functions.ccxt_and((subHash != nothing), (ccxt_in(subHash, get(client, Symbol("subscriptions"), nothing)))))
                        delete!(get(client, Symbol("subscriptions"), nothing), Symbol(subHash));
        end
        if functions.ccxtruthy(@functions.ccxt_and((subHash != nothing), (ccxt_in(subHash, get(client, Symbol("futures"), nothing)))))
            error = UnsubscribeError(string(self.id, " ", subHash));
            reject(client, error, subHash);
        end
    else
        clientSubscriptions = objectKeys(get(client, Symbol("subscriptions"), nothing));
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(clientSubscriptions)))
            sub = get(clientSubscriptions, i + 1, nothing);
            if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((sub != nothing), (subHash != nothing)), startswith(sub, subHash)))
                                delete!(get(client, Symbol("subscriptions"), nothing), Symbol(sub));
            end
            i += 1
        end
        clientFutures = objectKeys(get(client, Symbol("futures"), nothing));
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(clientFutures)))
            future = get(clientFutures, i + 1, nothing);
            if functions.ccxtruthy(@functions.ccxt_and(@functions.ccxt_and((future != nothing), (subHash != nothing)), startswith(future, subHash)))
                error = UnsubscribeError(string(self.id, " ", future));
                reject(client, error, future);
            end
            i += 1
        end
    end
    resolve(client, true, unsubHash);

end
function cleanCache(self::CcxtExchange, subscription)
    topic = safeString(subscription, "topic");
    symbols = self.safeList(subscription, "symbols", defaultValue = []);
    symbolsLength = length(symbols);
    if functions.ccxtruthy(topic == "ohlcv")
        symbolsAndTimeframes = self.safeList(subscription, "symbolsAndTimeframes", defaultValue = []);
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(symbolsAndTimeframes)))
            symbolAndTimeFrame = get(symbolsAndTimeframes, i + 1, nothing);
            symbol = safeString(symbolAndTimeFrame, 0);
            timeframe = safeString(symbolAndTimeFrame, 1);
            if functions.ccxtruthy(symbol == nothing)
                throw(ArgumentsRequired(string(self.id, " cleanCache() requires a symbol argument")));
            end
            if functions.ccxtruthy(timeframe == nothing)
                throw(ArgumentsRequired(string(self.id, " cleanCache() requires a timeframe argument")));
            end
            if functions.ccxtruthy(@functions.ccxt_and((self.ohlcvs != nothing), (ccxt_in(symbol, self.ohlcvs))))
                if functions.ccxtruthy(ccxt_in(timeframe, get(self.ohlcvs, Symbol(symbol), nothing)))
                                        delete!(get(self.ohlcvs, Symbol(symbol), nothing), Symbol(timeframe));
                end
            end
            i += 1
        end

    elseif functions.ccxtruthy(functions.ccxt_gt(symbolsLength, 0))
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(symbols)))
            symbol = get(symbols, i + 1, nothing);
            if functions.ccxtruthy(topic == "trades")
                if functions.ccxtruthy(ccxt_in(symbol, self.trades))
                                        delete!(self.trades, Symbol(symbol));
                end
            elseif functions.ccxtruthy(topic == "orderbook")
                if functions.ccxtruthy(ccxt_in(symbol, self.orderbooks))
                                        delete!(self.orderbooks, Symbol(symbol));
                end
            else
                if functions.ccxtruthy(topic == "ticker")
                    if functions.ccxtruthy(ccxt_in(symbol, self.tickers))
                                                delete!(self.tickers, Symbol(symbol));
                    end
                elseif functions.ccxtruthy(topic == "bidsasks")
                    if functions.ccxtruthy(ccxt_in(symbol, self.bidsasks))
                                                delete!(self.bidsasks, Symbol(symbol));
                    end
                end

            end
            i += 1
        end
    else
        if functions.ccxtruthy(@functions.ccxt_and(topic == "myTrades", (self.myTrades != nothing)))
            self.myTrades = nothing;
        elseif functions.ccxtruthy(@functions.ccxt_and(topic == "orders", (self.orders != nothing)))
            self.orders = nothing;
        else
            if functions.ccxtruthy(@functions.ccxt_and(topic == "positions", (self.positions != nothing)))
                self.positions = nothing;
                clients = objectValues(self.clients);
                i = 0
                while functions.ccxtruthy(functions.ccxt_lt(i, length(clients)))
                    client = get(clients, i + 1, nothing);
                    futures = get(client, Symbol("futures"), nothing);
                    if functions.ccxtruthy(@functions.ccxt_and((futures != nothing), (ccxt_in("fetchPositionsSnapshot", futures))))
                                                delete!(futures, :fetchPositionsSnapshot);
                    end
                    i += 1
                end

            elseif functions.ccxtruthy(@functions.ccxt_and((@functions.ccxt_or(topic == "ticker", topic == "markPrice")), (self.tickers != nothing)))
                tickerSymbols = objectKeys(self.tickers);
                i = 0
                while functions.ccxtruthy(functions.ccxt_lt(i, length(tickerSymbols)))
                    tickerSymbol = get(tickerSymbols, i + 1, nothing);
                    if functions.ccxtruthy(ccxt_in(tickerSymbol, self.tickers))
                                                delete!(self.tickers, Symbol(tickerSymbol));
                    end
                    i += 1
                end
            else
                if functions.ccxtruthy(@functions.ccxt_and(topic == "bidsasks", (self.bidsasks != nothing)))
                    bidsaskSymbols = objectKeys(self.bidsasks);
                    i = 0
                    while functions.ccxtruthy(functions.ccxt_lt(i, length(bidsaskSymbols)))
                        bidsaskSymbol = get(bidsaskSymbols, i + 1, nothing);
                        if functions.ccxtruthy(ccxt_in(bidsaskSymbol, self.bidsasks))
                                                        delete!(self.bidsasks, Symbol(bidsaskSymbol));
                        end
                        i += 1
                    end

                end

            end

        end
    end

end
function timeframeFromMilliseconds(self::CcxtExchange, ms)
    if functions.ccxtruthy(functions.ccxt_le(ms, 0))
            return ""
    end
    second = 1000;
    minute = 60 * second;
    hour = 60 * minute;
    day = 24 * hour;
    week = 7 * day;
    if functions.ccxtruthy(ms % week == 0)
            return string((ms / week), "w")
    end
    if functions.ccxtruthy(ms % day == 0)
            return string((ms / day), "d")
    end
    if functions.ccxtruthy(ms % hour == 0)
            return string((ms / hour), "h")
    end
    if functions.ccxtruthy(ms % minute == 0)
            return string((ms / minute), "m")
    end
    if functions.ccxtruthy(ms % second == 0)
            return string((ms / second), "s")
    end
    return ""

end
function isUTAEnabled(self::CcxtExchange; params=Dict())
    return false

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Exchange, name::Symbol) = ccxt_getproperty(self, name)

function closePosition(self::CcxtExchange, symbol; side=nothing, params=Dict())
    throw(NotSupported(string(self.id, " closePosition() is not supported yet")));

end
function closeAllPositions(self::CcxtExchange; params=Dict())
    throw(NotSupported(string(self.id, " closeAllPositions() is not supported yet")));

end
function editOrders(self::CcxtExchange, orders; params=Dict())
    throw(NotSupported(string(self.id, " editOrders() is not supported yet")));

end
function fetchCanceledAndClosedOrders(self::CcxtExchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchCanceledAndClosedOrders() is not supported yet")));

end
function fetchPositionHistory(self::CcxtExchange, symbol; since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchPositionsHistory"), nothing))
        positions = self.fetchPositionsHistory(symbols = [symbol], since = since, limit = limit, params = params);
            return positions
    else
        throw(NotSupported(string(self.id, " fetchPositionHistory () is not supported yet")));
    end

end
function fetchPositionsHistory(self::CcxtExchange; symbols=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchPositionsHistory () is not supported yet")));

end
function fetchPositionsRisk(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchPositionsRisk() is not supported yet")));

end
function fetchPositionsForSymbol(self::CcxtExchange, symbol; params=Dict())
    throw(NotSupported(string(self.id, " fetchPositionsForSymbol() is not supported yet")));

end
function fetchPositionsForSymbolWs(self::CcxtExchange, symbol; params=Dict())
    throw(NotSupported(string(self.id, " fetchPositionsForSymbol() is not supported yet")));

end
function watchPosition(self::CcxtExchange; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchPosition() is not supported yet")));

end
function watchMyTradesForSymbols(self::CcxtExchange, symbols; since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchMyTradesForSymbols() is not supported yet")));

end
function watchTradesForSymbols(self::CcxtExchange, symbols; since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchTradesForSymbols() is not supported yet")));

end
function fetchBidsAsks(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchBidsAsks() is not supported yet")));

end
function fetchMarkPrice(self::CcxtExchange, symbol; params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchMarkPrices"), nothing))
        self.loadMarkets();
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
        tickers = self.fetchMarkPrices(symbols = [symbol], params = params);
        ticker = self.safeDict(tickers, symbol);
        if functions.ccxtruthy(ticker == nothing)
            throw(NullResponse(string(self.id, " fetchMarkPrices() could not find a ticker for ", symbol)));
        else
            return ticker
        end
    else
        throw(NotSupported(string(self.id, " fetchMarkPrices() is not supported yet")));
    end

end
function fetchMarkPrices(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchMarkPrices() is not supported yet")));

end
function watchBidsAsks(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchBidsAsks() is not supported yet")));

end
function watchMarkPrice(self::CcxtExchange, symbol; params=Dict())
    throw(NotSupported(string(self.id, " watchMarkPrice () is not supported yet")));

end
function watchMarkPrices(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchMarkPrices () is not supported yet")));

end
function fetchL3OrderBook(self::CcxtExchange, symbol; limit=nothing, params=Dict())
    throw(BadRequest(string(self.id, " fetchL3OrderBook() is not supported yet")));

end
function watchOrderBookForSymbols(self::CcxtExchange, symbols; limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchOrderBookForSymbols() is not supported yet")));

end
function watchOrdersForSymbols(self::CcxtExchange, symbols; since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchOrdersForSymbols() is not supported yet")));

end
function cancelAllOrdersWs(self::CcxtExchange; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " cancelAllOrdersWs() is not supported yet")));

end
function cancelOrderWs(self::CcxtExchange, id; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " cancelOrderWs() is not supported yet")));

end
function cancelOrdersWs(self::CcxtExchange, ids; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " cancelOrdersWs() is not supported yet")));

end
function createLimitBuyOrderWs(self::CcxtExchange, symbol, amount, price; params=Dict())
    return self.createOrderWs(symbol, "limit", "buy", amount, price = price, params = params)

end
function createLimitOrderWs(self::CcxtExchange, symbol, side, amount, price; params=Dict())
    return self.createOrderWs(symbol, "limit", side, amount, price = price, params = params)

end
function createLimitSellOrderWs(self::CcxtExchange, symbol, amount, price; params=Dict())
    return self.createOrderWs(symbol, "limit", "sell", amount, price = price, params = params)

end
function createMarketBuyOrderWs(self::CcxtExchange, symbol, amount; params=Dict())
    return self.createOrderWs(symbol, "market", "buy", amount, price = nothing, params = params)

end
function createMarketOrderWithCostWs(self::CcxtExchange, symbol, side, cost; params=Dict())
    if functions.ccxtruthy(@functions.ccxt_or(get(self.has, Symbol("createMarketOrderWithCostWs"), nothing), (@functions.ccxt_and(get(self.has, Symbol("createMarketBuyOrderWithCostWs"), nothing), get(self.has, Symbol("createMarketSellOrderWithCostWs"), nothing)))))
            return self.createOrderWs(symbol, "market", side, cost, price = 1, params = params)
    end
    throw(NotSupported(string(self.id, " createMarketOrderWithCostWs() is not supported yet")));

end
function createMarketOrderWs(self::CcxtExchange, symbol, side, amount; price=nothing, params=Dict())
    return self.createOrderWs(symbol, "market", side, amount, price = price, params = params)

end
function createMarketSellOrderWs(self::CcxtExchange, symbol, amount; params=Dict())
    return self.createOrderWs(symbol, "market", "sell", amount, price = nothing, params = params)

end
function createOrderWithTakeProfitAndStopLossWs(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, takeProfit=nothing, stopLoss=nothing, params=Dict())
    params = self.setTakeProfitAndStopLossParams(symbol, type_var, side, amount, price = price, takeProfit = takeProfit, stopLoss = stopLoss, params = params);
    if functions.ccxtruthy(get(self.has, Symbol("createOrderWithTakeProfitAndStopLossWs"), nothing))
            return self.createOrderWs(symbol, type_var, side, amount, price = price, params = params)
    end
    throw(NotSupported(string(self.id, " createOrderWithTakeProfitAndStopLossWs() is not supported yet")));

end
function createOrderWs(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, params=Dict())
    throw(NotSupported(string(self.id, " createOrderWs() is not supported yet")));

end
function createOrdersWs(self::CcxtExchange, orders; params=Dict())
    throw(NotSupported(string(self.id, " createOrdersWs () is not supported yet")));

end
function createPostOnlyOrderWs(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(get(self.has, Symbol("createPostOnlyOrderWs"), nothing)))
        throw(NotSupported(string(self.id, " createPostOnlyOrderWs() is not supported yet")));
    end
    query = extend(params, Dict{Symbol, Any}(
        Symbol("postOnly") => true
    ));
    return self.createOrderWs(symbol, type_var, side, amount, price = price, params = query)

end
function createReduceOnlyOrderWs(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(get(self.has, Symbol("createReduceOnlyOrderWs"), nothing)))
        throw(NotSupported(string(self.id, " createReduceOnlyOrderWs() is not supported yet")));
    end
    query = extend(params, Dict{Symbol, Any}(
        Symbol("reduceOnly") => true
    ));
    return self.createOrderWs(symbol, type_var, side, amount, price = price, params = query)

end
function createStopLimitOrderWs(self::CcxtExchange, symbol, side, amount, price, triggerPrice; params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(get(self.has, Symbol("createStopLimitOrderWs"), nothing)))
        throw(NotSupported(string(self.id, " createStopLimitOrderWs() is not supported yet")));
    end
    query = extend(params, Dict{Symbol, Any}(
        Symbol("stopPrice") => triggerPrice
    ));
    return self.createOrderWs(symbol, "limit", side, amount, price = price, params = query)

end
function createStopLossOrderWs(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, stopLossPrice=nothing, params=Dict())
    if functions.ccxtruthy(stopLossPrice == nothing)
        throw(ArgumentsRequired(string(self.id, " createStopLossOrderWs() requires a stopLossPrice argument")));
    end
    params = extend(params, Dict{Symbol, Any}(
    Symbol("stopLossPrice") => stopLossPrice
));
    if functions.ccxtruthy(get(self.has, Symbol("createStopLossOrderWs"), nothing))
            return self.createOrderWs(symbol, type_var, side, amount, price = price, params = params)
    end
    throw(NotSupported(string(self.id, " createStopLossOrderWs() is not supported yet")));

end
function createStopMarketOrderWs(self::CcxtExchange, symbol, side, amount, triggerPrice; params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(get(self.has, Symbol("createStopMarketOrderWs"), nothing)))
        throw(NotSupported(string(self.id, " createStopMarketOrderWs() is not supported yet")));
    end
    query = extend(params, Dict{Symbol, Any}(
        Symbol("stopPrice") => triggerPrice
    ));
    return self.createOrderWs(symbol, "market", side, amount, price = nothing, params = query)

end
function createStopOrderWs(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, triggerPrice=nothing, params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(get(self.has, Symbol("createStopOrderWs"), nothing)))
        throw(NotSupported(string(self.id, " createStopOrderWs() is not supported yet")));
    end
    if functions.ccxtruthy(triggerPrice == nothing)
        throw(ArgumentsRequired(string(self.id, " createStopOrderWs() requires a stopPrice argument")));
    end
    query = extend(params, Dict{Symbol, Any}(
        Symbol("stopPrice") => triggerPrice
    ));
    return self.createOrderWs(symbol, type_var, side, amount, price = price, params = query)

end
function createTakeProfitOrderWs(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, takeProfitPrice=nothing, params=Dict())
    if functions.ccxtruthy(takeProfitPrice == nothing)
        throw(ArgumentsRequired(string(self.id, " createTakeProfitOrderWs() requires a takeProfitPrice argument")));
    end
    params = extend(params, Dict{Symbol, Any}(
    Symbol("takeProfitPrice") => takeProfitPrice
));
    if functions.ccxtruthy(get(self.has, Symbol("createTakeProfitOrderWs"), nothing))
            return self.createOrderWs(symbol, type_var, side, amount, price = price, params = params)
    end
    throw(NotSupported(string(self.id, " createTakeProfitOrderWs() is not supported yet")));

end
function createTrailingAmountOrderWs(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, trailingAmount=nothing, trailingTriggerPrice=nothing, params=Dict())
    if functions.ccxtruthy(trailingAmount == nothing)
        throw(ArgumentsRequired(string(self.id, " createTrailingAmountOrderWs() requires a trailingAmount argument")));
    end
    params[Symbol("trailingAmount")] = trailingAmount;
    if functions.ccxtruthy(trailingTriggerPrice != nothing)
        params[Symbol("trailingTriggerPrice")] = trailingTriggerPrice;
    end
    if functions.ccxtruthy(get(self.has, Symbol("createTrailingAmountOrderWs"), nothing))
            return self.createOrderWs(symbol, type_var, side, amount, price = price, params = params)
    end
    throw(NotSupported(string(self.id, " createTrailingAmountOrderWs() is not supported yet")));

end
function createTrailingPercentOrderWs(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, trailingPercent=nothing, trailingTriggerPrice=nothing, params=Dict())
    if functions.ccxtruthy(trailingPercent == nothing)
        throw(ArgumentsRequired(string(self.id, " createTrailingPercentOrderWs() requires a trailingPercent argument")));
    end
    params[Symbol("trailingPercent")] = trailingPercent;
    if functions.ccxtruthy(trailingTriggerPrice != nothing)
        params[Symbol("trailingTriggerPrice")] = trailingTriggerPrice;
    end
    if functions.ccxtruthy(get(self.has, Symbol("createTrailingPercentOrderWs"), nothing))
            return self.createOrderWs(symbol, type_var, side, amount, price = price, params = params)
    end
    throw(NotSupported(string(self.id, " createTrailingPercentOrderWs() is not supported yet")));

end
function createTriggerOrderWs(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, triggerPrice=nothing, params=Dict())
    if functions.ccxtruthy(triggerPrice == nothing)
        throw(ArgumentsRequired(string(self.id, " createTriggerOrderWs() requires a triggerPrice argument")));
    end
    params = extend(params, Dict{Symbol, Any}(
    Symbol("triggerPrice") => triggerPrice
));
    if functions.ccxtruthy(get(self.has, Symbol("createTriggerOrderWs"), nothing))
            return self.createOrderWs(symbol, type_var, side, amount, price = price, params = params)
    end
    throw(NotSupported(string(self.id, " createTriggerOrderWs() is not supported yet")));

end
function editOrderWs(self::CcxtExchange, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    self.cancelOrderWs(id, symbol = symbol);
    return self.createOrderWs(symbol, type_var, side, amount, price = price, params = params)

end
function fetchClosedOrdersWs(self::CcxtExchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchOrdersWs"), nothing))
        orders = self.fetchOrdersWs(symbol = symbol, since = since, limit = limit, params = params);
            return filterBy(orders, "status", "closed")
    end
    throw(NotSupported(string(self.id, " fetchClosedOrdersWs() is not supported yet")));

end
function fetchMyTradesWs(self::CcxtExchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchMyTradesWs() is not supported yet")));

end
function fetchOpenOrdersWs(self::CcxtExchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchOrdersWs"), nothing))
        orders = self.fetchOrdersWs(symbol = symbol, since = since, limit = limit, params = params);
            return filterBy(orders, "status", "open")
    end
    throw(NotSupported(string(self.id, " fetchOpenOrdersWs() is not supported yet")));

end
function fetchOrderBookWs(self::CcxtExchange, symbol; limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchOrderBookWs() is not supported yet")));

end
function fetchOrderWs(self::CcxtExchange, id; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchOrderWs() is not supported yet")));

end
function fetchOrdersWs(self::CcxtExchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchOrdersWs() is not supported yet")));

end
function fetchPositionWs(self::CcxtExchange, symbol; params=Dict())
    throw(NotSupported(string(self.id, " fetchPositionWs() is not supported yet")));

end
function fetchPositionsWs(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchPositions() is not supported yet")));

end
function fetchTickerWs(self::CcxtExchange, symbol; params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchTickersWs"), nothing))
        self.loadMarkets();
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
        tickers = self.fetchTickersWs(symbols = [symbol], params = params);
        ticker = self.safeDict(tickers, symbol);
        if functions.ccxtruthy(ticker == nothing)
            throw(NullResponse(string(self.id, " fetchTickerWs() could not find a ticker for ", symbol)));
        else
            return ticker
        end
    else
        throw(NotSupported(string(self.id, " fetchTickerWs() is not supported yet")));
    end

end
function fetchTickersWs(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchTickersWs() is not supported yet")));

end
function fetchTradesWs(self::CcxtExchange, symbol; since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchTradesWs() is not supported yet")));

end
function loadOrderBook(self::CcxtExchange, client, messageHash, symbol; limit=nothing, params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in(symbol, self.orderbooks))))
        reject(client, ExchangeError(string(self.id, " loadOrderBook() orderbook is not initiated")), messageHash);
            return 
    end
    maxRetries = self.handleOption("watchOrderBook", "snapshotMaxRetries", defaultValue = 3);
    tries = 0;
    error = nothing;
    try
        stored = get(self.orderbooks, Symbol(symbol), nothing);
        while functions.ccxtruthy(functions.ccxt_lt(tries, maxRetries))
            cache = get(stored, Symbol("cache"), nothing);
            orderBook = self.fetchRestOrderBookSafe(symbol, limit = limit, params = params);
            index = self.getCacheIndex(orderBook, cache);
            if functions.ccxtruthy(functions.ccxt_ge(index, 0))
                reset(stored, orderBook);
                self.handleDeltas(stored, functions.ccxt_slice(cache, index));
                stored.cache.length = 0;
                resolve(client, stored, messageHash);
                    return 
            end
            tries += 1;
        end
        error = ExchangeError(string(self.id, " nonce is behind the cache after ", maxRetries, " tries."));
    catch e
        error = e;

    end
    reject(client, error, messageHash);
    delete!(self.clients, Symbol(get(client, Symbol("url"), nothing)));
    self.orderbooks[Symbol(symbol)] = self.orderBook();

end
function fetchTrades(self::CcxtExchange, symbol; since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchTrades() is not supported yet")));

end
function watchTrades(self::CcxtExchange, symbol; since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchTrades() is not supported yet")));

end
function fetchOrderBook(self::CcxtExchange, symbol; limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchOrderBook() is not supported yet")));

end
function fetchRestOrderBookSafe(self::CcxtExchange, symbol; limit=nothing, params=Dict())
    fetchSnapshotMaxRetries = self.handleOption("watchOrderBook", "maxRetries", defaultValue = 3);
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, fetchSnapshotMaxRetries))
        try
            orderBook = self.fetchOrderBook(symbol, limit = limit, params = params);
            return orderBook
        catch e
            if functions.ccxtruthy((i + 1) == fetchSnapshotMaxRetries)
                throw(e);
            end

        end
        i += 1
    end
    return nothing

end
function watchOrderBook(self::CcxtExchange, symbol; limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchOrderBook() is not supported yet")));

end
function fetchOpenInterest(self::CcxtExchange, symbol; params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchOpenInterests"), nothing))
        openInterests = self.fetchOpenInterests(symbols = [symbol], params = params);
            return self.safeDict(openInterests, symbol)
    else
        throw(NotSupported(string(self.id, " fetchOpenInterest() is not supported yet")));
    end

end
function fetchL2OrderBook(self::CcxtExchange, symbol; limit=nothing, params=Dict())
    orderbook = self.fetchOrderBook(symbol, limit = limit, params = params);
    return extend(orderbook, Dict{Symbol, Any}(
    Symbol("asks") => sortBy(aggregate(get(orderbook, Symbol("asks"), nothing)), 0),
    Symbol("bids") => sortBy(aggregate(get(orderbook, Symbol("bids"), nothing)), 0, true)
))

end
function editLimitBuyOrder(self::CcxtExchange, id, symbol, amount; price=nothing, params=Dict())
    return self.editLimitOrder(id, symbol, "buy", amount, price = price, params = params)

end
function editLimitSellOrder(self::CcxtExchange, id, symbol, amount; price=nothing, params=Dict())
    return self.editLimitOrder(id, symbol, "sell", amount, price = price, params = params)

end
function editLimitOrder(self::CcxtExchange, id, symbol, side, amount; price=nothing, params=Dict())
    return self.editOrder(id, symbol, "limit", side, amount = amount, price = price, params = params)

end
function editOrder(self::CcxtExchange, id, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    self.cancelOrder(id, symbol = symbol);
    return self.createOrder(symbol, type_var, side, amount, price = price, params = params)

end
function editOrderWithClientOrderId(self::CcxtExchange, clientOrderId, symbol, type_var, side; amount=nothing, price=nothing, params=Dict())
    extendedParams = extend(params, Dict{Symbol, Any}(
        Symbol("clientOrderId") => clientOrderId
    ));
    return self.editOrder("", symbol, type_var, side, amount = amount, price = price, params = extendedParams)

end
function fetchPosition(self::CcxtExchange, symbol; params=Dict())
    throw(NotSupported(string(self.id, " fetchPosition() is not supported yet")));

end
function watchPositions(self::CcxtExchange; symbols=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchPositions() is not supported yet")));

end
function watchPositionForSymbols(self::CcxtExchange; symbols=nothing, since=nothing, limit=nothing, params=Dict())
    return self.watchPositions(symbols = symbols, since = since, limit = limit, params = params)

end
function fetchPositions(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchPositions() is not supported yet")));

end
function fetchTicker(self::CcxtExchange, symbol; params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchTickers"), nothing))
        self.loadMarkets();
        market = self.market(symbol);
        symbol = get(market, Symbol("symbol"), nothing);
        tickers = self.fetchTickers(symbols = [symbol], params = params);
        ticker = self.safeDict(tickers, symbol);
        if functions.ccxtruthy(ticker == nothing)
            throw(NullResponse(string(self.id, " fetchTickers() could not find a ticker for ", symbol)));
        else
            return ticker
        end
    else
        throw(NotSupported(string(self.id, " fetchTicker() is not supported yet")));
    end

end
function watchTicker(self::CcxtExchange, symbol; params=Dict())
    throw(NotSupported(string(self.id, " watchTicker() is not supported yet")));

end
function fetchTickers(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchTickers() is not supported yet")));

end
function watchTickers(self::CcxtExchange; symbols=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchTickers() is not supported yet")));

end
function fetchOrder(self::CcxtExchange, id; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchOrder() is not supported yet")));

end
"""
create a market order by providing the symbol, side and cost

# Arguments
- `clientOrderId`::string: client order Id
- `symbol`::string: unified symbol of the market to create an order in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function fetchOrderWithClientOrderId(self::CcxtExchange, clientOrderId; symbol=nothing, params=Dict())
    extendedParams = extend(params, Dict{Symbol, Any}(
        Symbol("clientOrderId") => clientOrderId
    ));
    return self.fetchOrder("", symbol = symbol, params = extendedParams)

end
function fetchOrderStatus(self::CcxtExchange, id; symbol=nothing, params=Dict())
    order = self.fetchOrder(id, symbol = symbol, params = params);
    return get(order, Symbol("status"), nothing)

end
function fetchUnifiedOrder(self::CcxtExchange, order; params=Dict())
    return self.fetchOrder(safeString(order, "id"), symbol = safeString(order, "symbol"), params = params)

end
function createOrder(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, params=Dict())
    throw(NotSupported(string(self.id, " createOrder() is not supported yet")));

end
function createTrailingAmountOrder(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, trailingAmount=nothing, trailingTriggerPrice=nothing, params=Dict())
    if functions.ccxtruthy(trailingAmount == nothing)
        throw(ArgumentsRequired(string(self.id, " createTrailingAmountOrder() requires a trailingAmount argument")));
    end
    params[Symbol("trailingAmount")] = trailingAmount;
    if functions.ccxtruthy(trailingTriggerPrice != nothing)
        params[Symbol("trailingTriggerPrice")] = trailingTriggerPrice;
    end
    if functions.ccxtruthy(get(self.has, Symbol("createTrailingAmountOrder"), nothing))
            return self.createOrder(symbol, type_var, side, amount, price = price, params = params)
    end
    throw(NotSupported(string(self.id, " createTrailingAmountOrder() is not supported yet")));

end
function createTrailingPercentOrder(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, trailingPercent=nothing, trailingTriggerPrice=nothing, params=Dict())
    if functions.ccxtruthy(trailingPercent == nothing)
        throw(ArgumentsRequired(string(self.id, " createTrailingPercentOrder() requires a trailingPercent argument")));
    end
    params[Symbol("trailingPercent")] = trailingPercent;
    if functions.ccxtruthy(trailingTriggerPrice != nothing)
        params[Symbol("trailingTriggerPrice")] = trailingTriggerPrice;
    end
    if functions.ccxtruthy(get(self.has, Symbol("createTrailingPercentOrder"), nothing))
            return self.createOrder(symbol, type_var, side, amount, price = price, params = params)
    end
    throw(NotSupported(string(self.id, " createTrailingPercentOrder() is not supported yet")));

end
function createMarketOrderWithCost(self::CcxtExchange, symbol, side, cost; params=Dict())
    if functions.ccxtruthy(@functions.ccxt_or(get(self.has, Symbol("createMarketOrderWithCost"), nothing), (@functions.ccxt_and(get(self.has, Symbol("createMarketBuyOrderWithCost"), nothing), get(self.has, Symbol("createMarketSellOrderWithCost"), nothing)))))
            return self.createOrder(symbol, "market", side, cost, price = 1, params = params)
    end
    throw(NotSupported(string(self.id, " createMarketOrderWithCost() is not supported yet")));

end
function createMarketBuyOrderWithCost(self::CcxtExchange, symbol, cost; params=Dict())
    if functions.ccxtruthy(@functions.ccxt_or(get(self.options, Symbol("createMarketBuyOrderRequiresPrice"), nothing), get(self.has, Symbol("createMarketBuyOrderWithCost"), nothing)))
            return self.createOrder(symbol, "market", "buy", cost, price = 1, params = params)
    end
    throw(NotSupported(string(self.id, " createMarketBuyOrderWithCost() is not supported yet")));

end
function createMarketSellOrderWithCost(self::CcxtExchange, symbol, cost; params=Dict())
    if functions.ccxtruthy(@functions.ccxt_or(get(self.options, Symbol("createMarketSellOrderRequiresPrice"), nothing), get(self.has, Symbol("createMarketSellOrderWithCost"), nothing)))
            return self.createOrder(symbol, "market", "sell", cost, price = 1, params = params)
    end
    throw(NotSupported(string(self.id, " createMarketSellOrderWithCost() is not supported yet")));

end
function createTriggerOrder(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, triggerPrice=nothing, params=Dict())
    if functions.ccxtruthy(triggerPrice == nothing)
        throw(ArgumentsRequired(string(self.id, " createTriggerOrder() requires a triggerPrice argument")));
    end
    params = extend(params, Dict{Symbol, Any}(
    Symbol("triggerPrice") => triggerPrice
));
    if functions.ccxtruthy(get(self.has, Symbol("createTriggerOrder"), nothing))
            return self.createOrder(symbol, type_var, side, amount, price = price, params = params)
    end
    throw(NotSupported(string(self.id, " createTriggerOrder() is not supported yet")));

end
function createStopLossOrder(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, stopLossPrice=nothing, params=Dict())
    if functions.ccxtruthy(stopLossPrice == nothing)
        throw(ArgumentsRequired(string(self.id, " createStopLossOrder() requires a stopLossPrice argument")));
    end
    params = extend(params, Dict{Symbol, Any}(
    Symbol("stopLossPrice") => stopLossPrice
));
    if functions.ccxtruthy(get(self.has, Symbol("createStopLossOrder"), nothing))
            return self.createOrder(symbol, type_var, side, amount, price = price, params = params)
    end
    throw(NotSupported(string(self.id, " createStopLossOrder() is not supported yet")));

end
function createTakeProfitOrder(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, takeProfitPrice=nothing, params=Dict())
    if functions.ccxtruthy(takeProfitPrice == nothing)
        throw(ArgumentsRequired(string(self.id, " createTakeProfitOrder() requires a takeProfitPrice argument")));
    end
    params = extend(params, Dict{Symbol, Any}(
    Symbol("takeProfitPrice") => takeProfitPrice
));
    if functions.ccxtruthy(get(self.has, Symbol("createTakeProfitOrder"), nothing))
            return self.createOrder(symbol, type_var, side, amount, price = price, params = params)
    end
    throw(NotSupported(string(self.id, " createTakeProfitOrder() is not supported yet")));

end
function createOrderWithTakeProfitAndStopLoss(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, takeProfit=nothing, stopLoss=nothing, params=Dict())
    params = self.setTakeProfitAndStopLossParams(symbol, type_var, side, amount, price = price, takeProfit = takeProfit, stopLoss = stopLoss, params = params);
    if functions.ccxtruthy(get(self.has, Symbol("createOrderWithTakeProfitAndStopLoss"), nothing))
            return self.createOrder(symbol, type_var, side, amount, price = price, params = params)
    end
    throw(NotSupported(string(self.id, " createOrderWithTakeProfitAndStopLoss() is not supported yet")));

end
function createOrders(self::CcxtExchange, orders; params=Dict())
    throw(NotSupported(string(self.id, " createOrders() is not supported yet")));

end
function cancelOrder(self::CcxtExchange, id; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " cancelOrder() is not supported yet")));

end
"""
create a market order by providing the symbol, side and cost

# Arguments
- `clientOrderId`::string: client order Id
- `symbol`::string: unified symbol of the market to create an order in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrderWithClientOrderId(self::CcxtExchange, clientOrderId; symbol=nothing, params=Dict())
    extendedParams = extend(params, Dict{Symbol, Any}(
        Symbol("clientOrderId") => clientOrderId
    ));
    return self.cancelOrder("", symbol = symbol, params = extendedParams)

end
function cancelOrders(self::CcxtExchange, ids; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " cancelOrders() is not supported yet")));

end
"""
create a market order by providing the symbol, side and cost

# Arguments
- `clientOrderIds`::array: client order Ids
- `symbol`::string: unified symbol of the market to create an order in
- `params`::object, optional: extra parameters specific to the exchange API endpoint

# Returns
- an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
"""
function cancelOrdersWithClientOrderIds(self::CcxtExchange, clientOrderIds; symbol=nothing, params=Dict())
    extendedParams = extend(params, Dict{Symbol, Any}(
        Symbol("clientOrderIds") => clientOrderIds
    ));
    return self.cancelOrders([], symbol = symbol, params = extendedParams)

end
function cancelAllOrders(self::CcxtExchange; symbol=nothing, params=Dict())
    throw(NotSupported(string(self.id, " cancelAllOrders() is not supported yet")));

end
function cancelUnifiedOrder(self::CcxtExchange, order; params=Dict())
    return self.cancelOrder(safeString(order, "id"), symbol = safeString(order, "symbol"), params = params)

end
function fetchOrders(self::CcxtExchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(@functions.ccxt_and(get(self.has, Symbol("fetchOpenOrders"), nothing), get(self.has, Symbol("fetchClosedOrders"), nothing)))
        throw(NotSupported(string(self.id, " fetchOrders() is not supported yet, consider using fetchOpenOrders() and fetchClosedOrders() instead")));
    end
    throw(NotSupported(string(self.id, " fetchOrders() is not supported yet")));

end
function fetchOrderTrades(self::CcxtExchange, id; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchOrderTrades() is not supported yet")));

end
function watchOrders(self::CcxtExchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchOrders() is not supported yet")));

end
function fetchOpenOrders(self::CcxtExchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchOrders"), nothing))
        orders = self.fetchOrders(symbol = symbol, since = since, limit = limit, params = params);
            return filterBy(orders, "status", "open")
    end
    throw(NotSupported(string(self.id, " fetchOpenOrders() is not supported yet")));

end
function fetchClosedOrders(self::CcxtExchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(get(self.has, Symbol("fetchOrders"), nothing))
        orders = self.fetchOrders(symbol = symbol, since = since, limit = limit, params = params);
            return filterBy(orders, "status", "closed")
    end
    throw(NotSupported(string(self.id, " fetchClosedOrders() is not supported yet")));

end
function fetchCanceledOrders(self::CcxtExchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchCanceledOrders() is not supported yet")));

end
function fetchMyTrades(self::CcxtExchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " fetchMyTrades() is not supported yet")));

end
function watchMyTrades(self::CcxtExchange; symbol=nothing, since=nothing, limit=nothing, params=Dict())
    throw(NotSupported(string(self.id, " watchMyTrades() is not supported yet")));

end
function createLimitOrder(self::CcxtExchange, symbol, side, amount, price; params=Dict())
    return self.createOrder(symbol, "limit", side, amount, price = price, params = params)

end
function createMarketOrder(self::CcxtExchange, symbol, side, amount; price=nothing, params=Dict())
    return self.createOrder(symbol, "market", side, amount, price = price, params = params)

end
function createLimitBuyOrder(self::CcxtExchange, symbol, amount, price; params=Dict())
    return self.createOrder(symbol, "limit", "buy", amount, price = price, params = params)

end
function createLimitSellOrder(self::CcxtExchange, symbol, amount, price; params=Dict())
    return self.createOrder(symbol, "limit", "sell", amount, price = price, params = params)

end
function createMarketBuyOrder(self::CcxtExchange, symbol, amount; params=Dict())
    return self.createOrder(symbol, "market", "buy", amount, price = nothing, params = params)

end
function createMarketSellOrder(self::CcxtExchange, symbol, amount; params=Dict())
    return self.createOrder(symbol, "market", "sell", amount, price = nothing, params = params)

end
function createPostOnlyOrder(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(get(self.has, Symbol("createPostOnlyOrder"), nothing)))
        throw(NotSupported(string(self.id, " createPostOnlyOrder() is not supported yet")));
    end
    query = extend(params, Dict{Symbol, Any}(
        Symbol("postOnly") => true
    ));
    return self.createOrder(symbol, type_var, side, amount, price = price, params = query)

end
function createReduceOnlyOrder(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(get(self.has, Symbol("createReduceOnlyOrder"), nothing)))
        throw(NotSupported(string(self.id, " createReduceOnlyOrder() is not supported yet")));
    end
    query = extend(params, Dict{Symbol, Any}(
        Symbol("reduceOnly") => true
    ));
    return self.createOrder(symbol, type_var, side, amount, price = price, params = query)

end
function createStopOrder(self::CcxtExchange, symbol, type_var, side, amount; price=nothing, triggerPrice=nothing, params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(get(self.has, Symbol("createStopOrder"), nothing)))
        throw(NotSupported(string(self.id, " createStopOrder() is not supported yet")));
    end
    if functions.ccxtruthy(triggerPrice == nothing)
        throw(ArgumentsRequired(string(self.id, " create_stop_order() requires a stopPrice argument")));
    end
    query = extend(params, Dict{Symbol, Any}(
        Symbol("stopPrice") => triggerPrice
    ));
    return self.createOrder(symbol, type_var, side, amount, price = price, params = query)

end
function createStopLimitOrder(self::CcxtExchange, symbol, side, amount, price, triggerPrice; params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(get(self.has, Symbol("createStopLimitOrder"), nothing)))
        throw(NotSupported(string(self.id, " createStopLimitOrder() is not supported yet")));
    end
    query = extend(params, Dict{Symbol, Any}(
        Symbol("stopPrice") => triggerPrice
    ));
    return self.createOrder(symbol, "limit", side, amount, price = price, params = query)

end
function createStopMarketOrder(self::CcxtExchange, symbol, side, amount, triggerPrice; params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(get(self.has, Symbol("createStopMarketOrder"), nothing)))
        throw(NotSupported(string(self.id, " createStopMarketOrder() is not supported yet")));
    end
    query = extend(params, Dict{Symbol, Any}(
        Symbol("stopPrice") => triggerPrice
    ));
    return self.createOrder(symbol, "market", side, amount, price = nothing, params = query)

end
function fetchTradingFee(self::CcxtExchange, symbol; params=Dict())
    if functions.ccxtruthy(!functions.ccxtruthy(get(self.has, Symbol("fetchTradingFees"), nothing)))
        throw(NotSupported(string(self.id, " fetchTradingFee() is not supported yet")));
    end
    fees = self.fetchTradingFees(params = params);
    return self.safeDict(fees, symbol)

end

# Property resolution is centralised so every exchange shares one order; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Exchange, name::Symbol) = ccxt_getproperty(self, name)

export Exchange

# Overlay for properties whose assigned value type does not match the struct
# field's declared type (e.g. describe() returns Dict{Symbol,Any} for a field
# declared Dict{String,String}).
#
# The overlay is stored inside the instance's own `attrs` dictionary rather
# than in a module-level table keyed by `objectid`. An object id is only
# unique among *live* objects: once an exchange is collected its address, and
# therefore its id, is handed to the next allocation. A global table then
# silently serves a freshly built exchange the overlay of a dead one — which
# looks like a constructor that returns an already-initialised instance
# (e.g. `features` that has already been through `featuresGenerator`).
# Keeping the overlay on the instance ties its lifetime to the instance, makes
# each one isolated by construction, and needs no cleanup.
const _OVERLAY_KEY = :__property_overlay__

function _overlay_get(self::Exchange, key::Symbol)
    o = get(getfield(self, :attrs), _OVERLAY_KEY, nothing)
    o === nothing && return nothing
    return get(o, key, nothing)
end

function _overlay_set!(self::Exchange, key::Symbol, val)
    o = get!(() -> Dict{Symbol, Any}(), getfield(self, :attrs), _OVERLAY_KEY)
    o[key] = val
    return val
end

function Base.getindex(self::Exchange, key::Symbol)
  ov = _overlay_get(self, key)
  ov !== nothing && return ov
    if hasfield(Exchange, key)
        return getfield(self, key)
    end
  camel = Symbol(functions.camelCase(string(key)))
    if hasfield(Exchange, camel)
        return getfield(self, camel)
  end
  error("Property $key not found")
end

function Base.get(self::Exchange, key::Symbol, default)
    ov = _overlay_get(self, key)
    ov !== nothing && return ov
    if hasfield(Exchange, key)
        return getfield(self, key)
    end
    camel = Symbol(functions.camelCase(string(key)))
    if hasfield(Exchange, camel)
        return getfield(self, camel)
    end
    return default
end

# The transpiler emits Symbol keys for property access it can see statically,
# but a key that arrives as data (a fixture key, a `getProperty` argument, an
# `unCamelCaseProperties` walk) stays a String. Accept both spellings.
Base.get(self::Exchange, key::AbstractString, default) = get(self, Symbol(key), default)
Base.getindex(self::Exchange, key::AbstractString) = getindex(self, Symbol(key))
Base.setindex!(self::Exchange, val, key::AbstractString) = setindex!(self, val, Symbol(key))

# JS `'key' in exchange` — used by `getProperty`/`hasProp` style helpers, which
# reach `functions.ccxt_in` and from there `haskey`. Both a Symbol and a String
# key must resolve, and the camelCase spelling counts as present too.
function Base.haskey(self::Exchange, key::Symbol)
    _overlay_get(self, key) !== nothing && return true
    hasfield(Exchange, key) && return true
    return hasfield(Exchange, Symbol(functions.camelCase(string(key))))
end
Base.haskey(self::Exchange, key::AbstractString) = haskey(self, Symbol(key))

function Base.setindex!(self::Exchange, val, key::Symbol)
    if hasfield(Exchange, key)
        try
            return setfield!(self, key, val)
        catch e
            if e isa TypeError
                return _overlay_set!(self, key, val)
            end
            rethrow(e)
        end
    end
    camel = Symbol(functions.camelCase(string(key)))
    if hasfield(Exchange, camel)
        try
            return setfield!(self, camel, val)
        catch e
            if e isa TypeError
                return _overlay_set!(self, camel, val)
            end
            rethrow(e)
        end
    end
    return _overlay_set!(self, key, val)
end

function Base.setproperty!(self::Exchange, name::Symbol, val)
    if hasfield(Exchange, name)
        try
            return setfield!(self, name, val)
        catch e
            if e isa TypeError
                return _overlay_set!(self, name, val)
            end
            rethrow(e)
        end
    end
    camel = Symbol(functions.camelCase(string(name)))
    if hasfield(Exchange, camel)
        try
            return setfield!(self, camel, val)
        catch e
            if e isa TypeError
                return _overlay_set!(self, camel, val)
            end
            rethrow(e)
        end
    end
    return _overlay_set!(self, name, val)
end

  function Base.getproperty(self::Exchange, name::Symbol)
      ov = _overlay_get(self, name)
      ov !== nothing && return ov
      if hasfield(Exchange, name)
          value = getfield(self, name)
          if value isa Function
              return (args...; kwargs...) -> (ccxt_takes_self(value) ? value(self, args...; kwargs...) : value(args...; kwargs...))
          else
              return value
          end
      end
      camel = Symbol(functions.camelCase(string(name)))
      if hasfield(Exchange, camel)
          value = getfield(self, camel)
          if value isa Function
              return (args...; kwargs...) -> (ccxt_takes_self(value) ? value(self, args...; kwargs...) : value(args...; kwargs...))
          else
              return value
          end
      end
      # Base methods (getDefaultOptions, safeValue, ...) are emitted as top-level
        # functions in this module rather than struct fields. Resolve them by name
        # so self.method(...) dispatches correctly.
        if isdefined(@__MODULE__, name) && getfield(@__MODULE__, name) isa Function
            fn = getfield(@__MODULE__, name)
            return (args...; kwargs...) -> (ccxt_takes_self(fn) ? fn(self, args...; kwargs...) : fn(args...; kwargs...))
        end
        error("Property $name not found")
    end
