import * as functions from './functions'
const {
      isNode
    , keys
    , values
    , deepExtend
    , extend
    , clone
    , flatten
    , unique
    , indexBy
    , sortBy
    , groupBy
    , aggregate
    , uuid
    , unCamelCase
    , precisionFromString
    , throttle
    , capitalize
    , now
    , timeout
    , TimedOut
    , buildOHLCVC
    , decimalToPrecision
    , defaultFetch
} = functions

import {
    ExchangeError
    , BadSymbol
    , InvalidAddress
    , NotSupported
    , AuthenticationError
    , DDoSProtection
    , RequestTimeout
    , ExchangeNotAvailable
    , RateLimitExceeded
} from './errors'

const { TRUNCATE, ROUND, DECIMAL_PLACES } = functions.precisionConstants

// const BN = require ('../static_dependencies/BN/bn')
import * as BN from 'bn.js'
import { ExchangeBase, Balance, OrderBook, Ticker, Order, Trade, Transaction, OHLCV, Market, Currency, Params, TradingViewOHLCV, PartialBalances, Balances, TickerSymbol, LedgerEntry, TradingFee } from './ExchangeBase'
import { ExchangeDescription } from './ExchangeDescription'

// ----------------------------------------------------------------------------
// web3 / 0x imports

let Web3: any = undefined
    , ethAbi: any = undefined
    , ethUtil: any = undefined
    , BigNumber: any = undefined

try {
    const requireFunction = require;
    Web3      = requireFunction ('web3') // eslint-disable-line global-require
    ethAbi    = requireFunction ('ethereumjs-abi') // eslint-disable-line global-require
    ethUtil   = requireFunction ('ethereumjs-util') // eslint-disable-line global-require
    BigNumber = requireFunction ('bignumber.js') // eslint-disable-line global-require
    // we prefer bignumber.js over BN.js
    // BN        = requireFunction ('bn.js') // eslint-disable-line global-require
} catch (e) {
    // nothing
}

// ----------------------------------------------------------------------------

export abstract class Exchange extends ExchangeBase {

    describe (): Partial<ExchangeDescription> {
        return {
            'id': undefined as any,
            'name': undefined as any,
            'countries': undefined as any,
            'enableRateLimit': false,
            'rateLimit': 2000, // milliseconds = seconds * 1000
            'certified': false,
            'has': {
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'CORS': false,
                'createDepositAddress': false,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'deposit': false,
                'editOrder': 'emulated',
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchL2OrderBook': true,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': 'emulated',
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchStatus': 'emulated',
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'privateAPI': true,
                'publicAPI': true,
                'withdraw': false,
            },
            'urls': {
                'logo': undefined as any,
                'api': undefined as any,
                'www': undefined as any,
                'doc': undefined as any,
                'fees': undefined as any,
            },
            'api': undefined,
            'requiredCredentials': {
                'apiKey':     true,
                'secret':     true,
                'uid':        false,
                'login':      false,
                'password':   false,
                'twofa':      false, // 2-factor authentication (one-time password key)
                'privateKey': false, // a "0x"-prefixed hexstring private key for a wallet
                'walletAddress': false, // the wallet address "0x"-prefixed hexstring
                'token':      false, // reserved for HTTP auth in some cases
            },
            'markets': undefined as any, // to be filled manually or by fetchMarkets
            'currencies': {}, // to be filled manually or by fetchMarkets
            'timeframes': undefined, // redefine if the exchange has.fetchOHLCV
            'fees': {
                'trading': {
                    'tierBased': undefined as any,
                    'percentage': undefined as any,
                    'taker': undefined as any,
                    'maker': undefined as any,
                },
                'funding': {
                    'tierBased': undefined as any,
                    'percentage': undefined as any,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'status': {
                'status': 'ok',
                'updated': undefined as any,
                'eta': undefined as any,
                'url': undefined as any,
            },
            'exceptions': undefined as any,
            'httpExceptions': {
                '422': ExchangeError,
                '418': DDoSProtection,
                '429': RateLimitExceeded,
                '404': ExchangeNotAvailable,
                '409': ExchangeNotAvailable,
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
                '511': AuthenticationError,
            },
            // some exchanges report only 'free' on `fetchBlance` call (i.e. report no 'used' funds)
            // in this case ccxt will try to infer 'used' funds from open order cache, which might be stale
            // still, some exchanges report number of open orders together with balance
            // if you set the following flag to 'true' ccxt will leave 'used' funds undefined in case of discrepancy
            'dontGetUsedBalanceFromStaleCache': false,
            'commonCurrencies': { // gets extended/overwritten in subclasses
                'XBT': 'BTC',
                'BCC': 'BCH',
                'DRK': 'DASH',
                'BCHABC': 'BCH',
                'BCHSV': 'BSV',
            },
            'precisionMode': DECIMAL_PLACES,
            'limits': {
                'amount': { 'min': undefined as any, 'max': undefined },
                'price': { 'min': undefined as any, 'max': undefined },
                'cost': { 'min': undefined as any, 'max': undefined },
            },
        } // return
    } // describe ()

    options = {} as any // exchange-specific options, if any

    // fetch implementation options (JS only)
    fetchOptions = {
        // keepalive: true, // does not work in Chrome, https://github.com/ccxt/ccxt/issues/6368
    }

    userAgents = {
        'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
        'chrome39': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
    }

    headers = {}

    // prepended to URL, like https://proxy.com/https://exchange.com/api...
    proxy: string | Function = ''
    origin = '*' // CORS origin

    minFundingAddressLength = 1 // used in checkAddress
    substituteCommonCurrencyCodes = true  // reserved

    // do not delete this line, it is needed for users to be able to define their own fetchImplementation
    fetchImplementation = defaultFetch
    
    timeout       = 10000 // milliseconds
    verbose       = false
    debug         = false
    userAgent?    : { 'User-Agent': string; }
    twofa?        : string // two-factor authentication (2FA)
    
    apiKey?        : string
    secret?        : string
    uid?           : string
    login?         : string
    password?      : string
    privateKey?    : string // a "0x"-prefixed hexstring private key for a wallet
    walletAddress? : string // a wallet address "0x"-prefixed hexstring
    token?         : string // reserved for HTTP auth in some cases
    
    balance      : Dictionary<Balance> = {}
    orderbooks   : Dictionary<OrderBook> = {}
    tickers      : Dictionary<Ticker> = {}
    orders       : Dictionary<Order> = {}
    trades       : Dictionary<Trade> = {}
    transactions : Dictionary<Transaction> = {}
    ohlcvs       : Dictionary<OHLCV> = {}
    
    requiresWeb3 = false
    precision = {}
    
    enableLastJsonResponse = true
    enableLastHttpResponse = true
    enableLastResponseHeaders = true
    last_http_response = ''
    last_json_response = ''
    last_response_headers: any

    agent: any
    httpAgent: any
    httpsAgent: any
    web3?: any
    web3ProviderURL?: string

    // initialized by initRestRateLimiter
    tokenBucket: any
    throttle: any
    executeRestRequest?: (url: any, method?: string, headers?: Dictionary<string>, body?: any) => Promise<any>

    arrayConcat<T>(a: T[], b: T[]) {
        return a.concat (b)
    }

    fn = functions;

    constructor (userConfig = {}) {
        super();
        
        // Object.assign (this, functions)
        // if (isNode) {
        //     this.nodeVersion = process.version.match (/\d+\.\d+\.\d+/)[0]
        //     this.userAgent = {
        //         'User-Agent': 'ccxt/' + Exchange.ccxtVersion +
        //             ' (+https://github.com/ccxt/ccxt)' +
        //             ' Node.js/' + this.nodeVersion + ' (JavaScript)'
        //     }
        // }

        const _this = this as Dictionary<any>

        const unCamelCaseProperties = (obj = this.fn) => {
            if (obj !== null) {
                for (const k of Object.getOwnPropertyNames (obj)) {
                    _this.fn[unCamelCase (k)] = _this.fn[k]
                }
                unCamelCaseProperties (Object.getPrototypeOf (obj))
            }
        }
        unCamelCaseProperties ()

        // merge configs
        const config = deepExtend (this.describe (), userConfig)

        // merge to this
        for (const [property, value] of Object.entries (config))
            _this[property] = deepExtend (_this[property], value)

        if (!this.httpAgent) {
            this.httpAgent = defaultFetch.http ? new defaultFetch.http.Agent ({ 'keepAlive': true }) : undefined
        }

        if (!this.httpsAgent) {
            this.httpsAgent = defaultFetch.https ? new defaultFetch.https.Agent ({ 'keepAlive': true }) : undefined
        }

        // generate old metainfo interface
        for (const k in this.has) {
            _this['has' + capitalize (k)] = !!(<any>this.has)[k] // converts 'emulated' to true
        }

        if (this.api)
            this.defineRestApi (this.api, 'request')

        this.initRestRateLimiter ()

        if (this.markets)
            this.setMarkets (this.markets)

        if (this.requiresWeb3 && !this.web3 && Web3) {
            const provider = (this.web3ProviderURL) ? new Web3.providers.HttpProvider (this.web3ProviderURL) : new Web3.providers.HttpProvider ()
            this.web3 = new Web3 (Web3.givenProvider || provider)
        }
    }

    defaults () {
        return { /* override me */ }
    }

    nonce () {
        return this.fn.seconds ()
    }

    encodeURIComponent = encodeURIComponent

    checkRequiredCredentials (error = true) {
        const keys = Object.keys (this.requiredCredentials)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            if (this.requiredCredentials[key] && !(<any>this)[key]) {
                if (error) {
                    throw new AuthenticationError (this.id + ' requires `' + key + '` credential')
                } else {
                    return error
                }
            }
        }
        return true
    }

    checkAddress (address: string) {

        if (address === undefined)
            throw new InvalidAddress (this.id + ' address is undefined')

        // check the address is not the same letter like 'aaaaa' nor too short nor has a space
        if ((unique (address).length === 1) || address.length < this.minFundingAddressLength || address.includes (' '))
            throw new InvalidAddress (this.id + ' address is invalid or has less than ' + this.minFundingAddressLength.toString () + ' characters: "' + this.fn.json (address) + '"')

        return address
    }

    initRestRateLimiter () {

        if (this.rateLimit === undefined)
            throw new Error (this.id + '.rateLimit property is not configured')

        this.tokenBucket = this.fn.extend ({
            delay:       1,
            capacity:    1,
            defaultCost: 1,
            maxCapacity: 1000,
        }, this.tokenBucket)

        this.throttle = throttle (this.tokenBucket)

        this.executeRestRequest = async (url, method = 'GET', headers = undefined, body = undefined) => {

            // fetchImplementation cannot be called on this. in browsers:
            // TypeError Failed to execute 'fetch' on 'Window': Illegal invocation
            const fetchImplementation = this.fetchImplementation

            const params = { method, headers, body, timeout: this.timeout, agent: undefined }

            if (this.agent) {
                this.agent.keepAlive = true
                params.agent = this.agent
            } else if (this.httpAgent && url.indexOf ('http://') === 0) {
                params.agent = this.httpAgent
            } else if (this.httpsAgent && url.indexOf ('https://') === 0) {
                params.agent = this.httpsAgent
            }

            const promise =
                fetchImplementation (url, this.fn.extend (params, this.fetchOptions))
                    .catch ((e: any) => {
                        if (isNode)
                            throw new ExchangeNotAvailable ([ this.id, method, url, e.type, e.message ].join (' '))
                        throw e // rethrow all unknown errors
                    })
                    .then ((response: any) => this.handleRestResponse (response, url, method, headers, body))

            try {
                return timeout(this.timeout, promise)
            }
            catch (e) {
                if (e instanceof TimedOut)
                    throw new RequestTimeout(this.id + ' ' + method + ' ' + url + ' request timed out (' + this.timeout + ' ms)')
                throw e
            }
        }
    }

    setSandboxMode (enabled: boolean) {
        if (!!enabled) { // eslint-disable-line no-extra-boolean-cast
            if ('test' in this.urls) {
                if (typeof this.urls['api'] === 'string') {
                    this.urls['api_backup'] = this.urls['api']
                    this.urls['api'] = this.urls['test'] as string
                } else {
                    this.urls['api_backup'] = clone (this.urls['api'])
                    this.urls['api'] = clone (this.urls['test'])
                }
            } else {
                throw new NotSupported (this.id + ' does not have a sandbox URL')
            }
        } else if ('api_backup' in this.urls) {
            if (typeof this.urls['api'] === 'string') {
                this.urls['api'] = this.urls['api_backup']
            } else {
                this.urls['api'] = clone (this.urls['api_backup'])
            }
        }
    }

    defineRestApi (api: Dictionary<Dictionary<string>>, methodName: string, options: Dictionary<any> = {}) {

        for (const type of Object.keys (api)) {
            for (const httpMethod of Object.keys (api[type])) {

                let paths = api[type][httpMethod]
                for (let i = 0; i < paths.length; i++) {
                    let path = paths[i].trim ()
                    let splitPath = path.split (/[^a-zA-Z0-9]/)

                    let uppercaseMethod  = httpMethod.toUpperCase ()
                    let lowercaseMethod  = httpMethod.toLowerCase ()
                    let camelcaseMethod  = this.fn.capitalize (lowercaseMethod)
                    let camelcaseSuffix  = splitPath.map (this.fn.capitalize as any).join ('')
                    let underscoreSuffix = splitPath.map (x => x.trim ().toLowerCase ()).filter (x => x.length > 0).join ('_')

                    let camelcase  = type + camelcaseMethod + this.fn.capitalize (camelcaseSuffix)
                    let underscore = type + '_' + lowercaseMethod + '_' + underscoreSuffix

                    if ('suffixes' in options) {
                        if ('camelcase' in options['suffixes'])
                            camelcase += options['suffixes']['camelcase']
                        if ('underscore' in options.suffixes)
                            underscore += options['suffixes']['underscore']
                    }

                    if ('underscore_suffix' in options)
                        underscore += options.underscoreSuffix;
                    if ('camelcase_suffix' in options)
                        camelcase += options.camelcaseSuffix;

                    const _this = this as Dictionary<any>
                    let partial = async (params: any) => _this[methodName] (path, type, uppercaseMethod, params || {})

                    _this[camelcase]  = partial
                    _this[underscore] = partial
                }
            }
        }
    }

    fetch (url: string, method = 'GET', headers?: Dictionary<string>, body?: any) {

        if (isNode && this.userAgent) {
            if (typeof this.userAgent === 'string')
                headers = extend ({ 'User-Agent': this.userAgent }, headers)
            else if ((typeof this.userAgent === 'object') && ('User-Agent' in this.userAgent!))
                headers = extend (this.userAgent, headers)
        }

        if (typeof this.proxy === 'function') {

            url = this.proxy (url)
            if (isNode)
                headers = extend ({ 'Origin': this.origin }, headers)

        } else if (typeof this.proxy === 'string') {

            if (this.proxy.length)
                if (isNode)
                    headers = extend ({ 'Origin': this.origin }, headers)

            url = this.proxy + url
        }

        headers = extend (this.headers, headers)

        if (this.verbose)
            console.log ("fetch:\n", this.id, method, url, "\nRequest:\n", headers, "\n", body, "\n")

        return this.executeRestRequest! (url, method, headers, body)
    }

    async fetch2 (path: string, type = 'public', method = 'GET', params: Params = {}, headers?: Dictionary<string>, body?: any) {

        if (this.enableRateLimit)
            await this.throttle (this.rateLimit)

        const request = this.sign (path, type, method, params, headers, body)
        return this.fetch (request.url, request.method, request.headers, request.body)
    }

    sign (path: string, type: string, method: string, params: Params, headers?: Dictionary<string>, body?: any): {
        url: string;
        method: string;
        headers: Dictionary<string>,
        body: any,
    } {
        throw new Error('Not implemented')
    }

    request (path: string, type = 'public', method = 'GET', params: Params = {}, headers = undefined, body = undefined) {
        return this.fetch2 (path, type, method, params, headers, body)
    }

    parseJson (jsonString: string) {
        try {
            if (this.fn.isJsonEncodedObject (jsonString)) {
                return JSON.parse (jsonString)
            }
        } catch (e) {
            // SyntaxError
            return undefined
        }
    }

    throwExactlyMatchedException (exact: any, string: string, message: string) {
        if (string in exact) {
            throw new exact[string] (message)
        }
    }

    throwBroadlyMatchedException (broad: any, string: string, message: string) {
        const broadKey = this.findBroadlyMatchedKey (broad, string)
        if (broadKey !== undefined) {
            throw new broad[broadKey] (message)
        }
    }

    /**
     * a helper for matching error strings exactly vs broadly
     */
    findBroadlyMatchedKey (broad: any, string: string) {
        const keys = Object.keys (broad)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            if (string.indexOf (key) >= 0) {
                return key
            }
        }
        return undefined
    }

    handleErrors (statusCode: number, statusText: string, url: string, method: string, responseHeaders: Dictionary<string> , responseBody: any, response: any, requestHeaders: any, requestBody: any) {
        // override me
    }

    defaultErrorHandler (code: number, reason: string, url: string, method: string, headers: Dictionary<string>, body: any, response: any) {
        if ((code >= 200) && (code <= 299)) {
            return
        }
        let details = body
        const codeAsString = code.toString ()
        let ErrorClass = undefined
        if (codeAsString in this.httpExceptions) {
            ErrorClass = this.httpExceptions[codeAsString]
        }
        if (response === undefined) {
            const maintenance = body.match (/offline|busy|retry|wait|unavailable|maintain|maintenance|maintenancing/i)
            const ddosProtection = body.match (/cloudflare|incapsula|overload|ddos/i)
            if (maintenance) {
                ErrorClass = ExchangeNotAvailable
                details += ' offline, on maintenance, or unreachable from this location at the moment'
            }
            if (ddosProtection) {
                ErrorClass = DDoSProtection
            }
        }
        if (ErrorClass === ExchangeNotAvailable) {
            details += ' (possible reasons: ' + [
                'invalid API keys',
                'bad or old nonce',
                'exchange is down or offline',
                'on maintenance',
                'DDoS protection',
                'rate-limiting',
            ].join (', ') + ')'
        }
        if (ErrorClass !== undefined) {
            throw new ErrorClass ([ this.id, method, url, code, reason, details ].join (' '))
        }
    }

    getResponseHeaders (response: any) {
        const result = {} as any
        response.headers.forEach ((value: string, key: string) => {
            key = key.split ('-').map (word => capitalize (word)).join ('-')
            result[key] = value
        })
        return result
    }

    handleRestResponse (response: any, url: string, method = 'GET', requestHeaders?: Dictionary<string>, requestBody?: any) {

        return response.text ().then ((responseBody: string) => {

            const json = this.parseJson (responseBody)

            const responseHeaders = this.getResponseHeaders (response)

            if (this.enableLastResponseHeaders) {
                this.last_response_headers = responseHeaders
            }

            if (this.enableLastHttpResponse) {
                this.last_http_response = responseBody // FIXME: for those classes that haven't switched to handleErrors yet
            }

            if (this.enableLastJsonResponse) {
                this.last_json_response = json         // FIXME: for those classes that haven't switched to handleErrors yet
            }

            if (this.verbose)
                console.log ("handleRestResponse:\n", this.id, method, url, response.status, response.statusText, "\nResponse:\n", responseHeaders, "\n", responseBody, "\n")

            this.handleErrors (response.status, response.statusText, url, method, responseHeaders, responseBody, json, requestHeaders, requestBody)
            this.defaultErrorHandler (response.status, response.statusText, url, method, responseHeaders, responseBody, json)

            return json || responseBody
        })
    }

    setMarkets (markets: Collection<Market>, currencies?: Dictionary<Currency>) {
        const values = Object.values (markets).map (market => deepExtend ({
            'limits': this.limits,
            'precision': this.precision,
        }, this.fees['trading'], market))
        this.markets = indexBy (values, 'symbol')
        this.marketsById = indexBy (markets, 'id')
        this.markets_by_id = this.marketsById
        this.symbols = Object.keys (this.markets).sort ()
        this.ids = Object.keys (this.markets_by_id).sort ()
        if (currencies) {
            this.currencies = deepExtend (currencies, this.currencies)
        } else {
            const baseCurrencies =
                values.filter (market => 'base' in market)
                    .map (market => ({
                        id: market.baseId || market.base,
                        numericId: (market.baseNumericId !== undefined) ? market.baseNumericId : undefined,
                        code: market.base,
                        precision: market.precision ? (market.precision.base || market.precision.amount) : 8,
                    } as Currency))
            const quoteCurrencies =
                values.filter (market => 'quote' in market)
                    .map (market => ({
                        id: market.quoteId || market.quote,
                        numericId: (market.quoteNumericId !== undefined) ? market.quoteNumericId : undefined,
                        code: market.quote,
                        precision: market.precision ? (market.precision.quote || market.precision.price) : 8,
                    } as Currency))
            const allCurrencies = baseCurrencies.concat (quoteCurrencies)
            const groupedCurrencies = groupBy (allCurrencies, 'code')
            const currencies = Object.keys (groupedCurrencies).map (code =>
                groupedCurrencies[code].reduce ((previous, current) =>
                    ((previous.precision > current.precision) ? previous : current), groupedCurrencies[code][0]))
            const sortedCurrencies = sortBy (flatten (currencies), 'code')
            this.currencies = deepExtend (indexBy (sortedCurrencies, 'code'), this.currencies)
        }
        this.currencies_by_id = indexBy (this.currencies, 'id')
        return this.markets
    }

    async loadMarkets (reload = false, params: Params = {}) {
        if (!reload && this.markets) {
            if (!this.markets_by_id) {
                return this.setMarkets (this.markets)
            }
            return this.markets
        }
        let currencies: Dictionary<Currency> = {}
        if (this.has.fetchCurrencies) {
            currencies = await this.fetchCurrencies ()
        }
        const markets = await this.fetchMarkets (params)
        return this.setMarkets (markets, currencies)
    }

    accounts: any
    fetchAccounts!: (params: Dictionary<any>) => any
    accountsById!: {}

    async loadAccounts (reload = false, params: Params = {}) {
        if (reload) {
            this.accounts = await this.fetchAccounts (params)
        } else {
            if (this.accounts) {
                return this.accounts
            } else {
                this.accounts = await this.fetchAccounts (params)
            }
        }
        this.accountsById = this.fn.indexBy (this.accounts, 'id')
        return this.accounts
    }

    fetchBidsAsks (symbols?: string[], params: Params = {}): Promise<any> {
        throw new NotSupported (this.id + ' fetchBidsAsks not supported yet')
    }

    async fetchOHLCVC (symbol: TickerSymbol, timeframe = '1m', since?: number, limits?: number, params: Params = {}) {
        if (!this.has['fetchTrades'])
            throw new NotSupported (this.id + ' fetchOHLCV() not supported yet')
        await this.loadMarkets ()
        const trades = await this.fetchTrades (symbol, since, limits, params)
        const ohlcvc = buildOHLCVC (trades, timeframe, since, limits)
        return ohlcvc
    }

    async fetchOHLCV (symbol: TickerSymbol, timeframe: string = '1m', since?: number, limits?: number, params: Params = {}): Promise<OHLCV[]> {
        if (!this.has['fetchTrades'])
            throw new NotSupported (this.id + ' fetchOHLCV() not supported yet')
        await this.loadMarkets ()
        const trades = await this.fetchTrades (symbol, since, limits, params)
        const ohlcvc = buildOHLCVC (trades, timeframe, since, limits)
        return ohlcvc.map (c => c.slice (0, -1) as OHLCV)
    }

    parseTradingViewOHLCV (ohlcvs: TradingViewOHLCV, market = undefined, timeframe = '1m', since?: number, limit?: number) {
        const result = this.convertTradingViewToOHLCV (ohlcvs);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    convertTradingViewToOHLCV (ohlcvs: TradingViewOHLCV) {
        const result: OHLCV[] = [];
        for (let i = 0; i < ohlcvs['t'].length; i++) {
            result.push ([
                ohlcvs['t'][i] * 1000,
                ohlcvs['o'][i],
                ohlcvs['h'][i],
                ohlcvs['l'][i],
                ohlcvs['c'][i],
                ohlcvs['v'][i],
            ]);
        }
        return result;
    }

    convertOHLCVToTradingView (ohlcvs: OHLCV[]) {
        const result: TradingViewOHLCV = {
            't': [],
            'o': [],
            'h': [],
            'l': [],
            'c': [],
            'v': [],
        };
        for (let i = 0; i < ohlcvs.length; i++) {
            result['t'].push (parseInt (ohlcvs[i][0] / 1000 as any));
            result['o'].push (ohlcvs[i][1]);
            result['h'].push (ohlcvs[i][2]);
            result['l'].push (ohlcvs[i][3]);
            result['c'].push (ohlcvs[i][4]);
            result['v'].push (ohlcvs[i][5]);
        }
        return result;
    }

    fetchTicker (symbol: TickerSymbol, params: Params = {}): Promise<Ticker> {
        throw new NotSupported (this.id + ' fetchTicker not supported yet')
    }

    fetchTickers (symbols?: string[], params: Params = {}): Promise<Dictionary<Ticker>> {
        throw new NotSupported (this.id + ' fetchTickers not supported yet')
    }

    purgeCachedOrders (before: number) {
        const orders = Object
            .values (this.orders)
            .filter (order =>
                (order.status === 'open') ||
                (order.timestamp >= before))
        this.orders = indexBy (orders, 'id')
        return this.orders
    }

    fetchOrder (id: string, symbol?: TickerSymbol, params: Params = {}): Promise<Order> {
        throw new NotSupported (this.id + ' fetchOrder not supported yet');
    }

    fetchOrders (symbol?: TickerSymbol, since?: number, limit?: number, params: Params = {}): Promise<Order[]> {
        throw new NotSupported (this.id + ' fetchOrders not supported yet');
    }

    fetchOpenOrders (symbol?: TickerSymbol, since?: number, limit?: number, params: Params = {}): Promise<Order[]> {
        throw new NotSupported (this.id + ' fetchOpenOrders not supported yet');
    }

    fetchClosedOrders (symbol?: TickerSymbol, since?: number, limit?: number, params: Params = {}): Promise<Order[]> {
        throw new NotSupported (this.id + ' fetchClosedOrders not supported yet');
    }

    fetchMyTrades (symbol?: TickerSymbol, since?: number, limit?: number, params: Params = {}): Promise<Trade[]> {
        throw new NotSupported (this.id + ' fetchMyTrades not supported yet');
    }

    fetchTransactions (currency?: string, since?: number, limit?: number, params: Params = {}): Promise<Transaction[]> {
        throw new NotSupported (this.id + ' fetchTransactions not supported yet');
    }

    fetchDeposits (currency?: string, since?: number, limit?: number, params: Params = {}): Promise<Transaction[]> {
        throw new NotSupported (this.id + ' fetchDeposits not supported yet');
    }

    fetchWithdrawals (currency?: string, since?: number, limit?: number, params: Params = {}): Promise<Transaction[]> {
        throw new NotSupported (this.id + ' fetchWithdrawals not supported yet');
    }

    async fetchCurrencies (params: Params = {}) {
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return this.currencies
    }

    async fetchMarkets (params: Params = {}) {
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return Object.values (this.markets)
    }

    async fetchOrderStatus (id: string, symbol?: TickerSymbol, params: Params = {}) {
        const order = await this.fetchOrder (id, symbol, params);
        return order['status'];
    }

    account () {
        return {
            free: 0,
            used: 0,
            total: 0,
        }
    }

    commonCurrencyCode (currency: string) {
        if (!this.substituteCommonCurrencyCodes)
            return currency
        return this.fn.safeString (this.commonCurrencies, currency, currency)
    }

    currencyId (commonCode: string) {

        if (this.currencies === undefined) {
            throw new ExchangeError (this.id + ' currencies not loaded')
        }

        if (commonCode in this.currencies) {
            return this.currencies[commonCode]['id'];
        }

        const currencyIds: Dictionary<string> = {}
        const distinct = Object.keys (this.commonCurrencies)
        for (let i = 0; i < distinct.length; i++) {
            const k = distinct[i]
            currencyIds[this.commonCurrencies[k]] = k
        }

        return this.fn.safeString (currencyIds, commonCode, commonCode)
    }

    currency (code: string): Currency {

        if (this.currencies === undefined)
            throw new ExchangeError (this.id + ' currencies not loaded')

        if ((typeof code === 'string') && (code in this.currencies))
            return this.currencies[code]

        throw new ExchangeError (this.id + ' does not have currency code ' + code)
    }

    market (symbol: TickerSymbol) {

        if (this.markets === undefined)
            throw new ExchangeError (this.id + ' markets not loaded')

        if ((typeof symbol === 'string') && (symbol in this.markets))
            return this.markets[symbol as string]

        throw new BadSymbol (this.id + ' does not have market symbol ' + symbol)
    }

    marketId (symbol: TickerSymbol) {
        const market = this.market (symbol)
        return (market !== undefined ? market['id'] : symbol as string)
    }

    marketIds (symbols: TickerSymbol[]) {
        return symbols.map (symbol => this.marketId (symbol));
    }

    symbol (symbol: TickerSymbol) {
        return this.market (symbol).symbol || symbol
    }

    url (path: string, params: Params = {}) {
        let result = this.fn.implodeParams (path, params);
        const query = this.fn.omit (params, this.extractParams (path))
        if (Object.keys (query).length)
            result += '?' + this.fn.urlencode (query)
        return result
    }

    parseBidAsk (bidask: string[], priceKey = 0, amountKey = 1) {
        const price = parseFloat (bidask[priceKey])
        const amount = parseFloat (bidask[amountKey])
        return [ price, amount ] as [number, number]
    }

    parseBidsAsks (bidasks: string[][], priceKey = 0, amountKey = 1) {
        return Object.values (bidasks || []).map (bidask => this.parseBidAsk (bidask, priceKey, amountKey))
    }

    async fetchL2OrderBook (symbol: TickerSymbol, limit = undefined, params: Params = {}) {
        const orderbook = await this.fetchOrderBook (symbol, limit, params)
        return extend (orderbook, {
            'bids': sortBy (aggregate (orderbook.bids), 0, true),
            'asks': sortBy (aggregate (orderbook.asks), 0),
        })
    }

    parseOrderBook (orderbook: any, timestamp?: number, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1) {
        return <OrderBook>{
            'bids': sortBy ((bidsKey in orderbook) ? this.parseBidsAsks (orderbook[bidsKey], priceKey, amountKey) : [], 0, true),
            'asks': sortBy ((asksKey in orderbook) ? this.parseBidsAsks (orderbook[asksKey], priceKey, amountKey) : [], 0),
            'timestamp': timestamp,
            'datetime': this.fn.iso8601 (timestamp as number),
            'nonce': undefined,
        }
    }

    parseBalance (balance: Balances) {

        const currencies = Object.keys (this.fn.omit (balance, [ 'info', 'free', 'used', 'total' ]));

        balance['free'] = {} as any
        balance['used'] = {} as any
        balance['total'] = {} as any

        for (const currency of currencies) {

            if (balance[currency].total === undefined) {
                if (balance[currency].free !== undefined && balance[currency].used !== undefined) {
                    balance[currency].total = this.fn.sum (balance[currency].free, balance[currency].used)
                }
            }
            if (balance[currency].free === undefined) {
                if (balance[currency].total !== undefined && balance[currency].used !== undefined) {
                    balance[currency].free = this.fn.sum (balance[currency].total, -balance[currency].used)
                }
            }
            if (balance[currency].used === undefined) {
                if (balance[currency].total !== undefined && balance[currency].free !== undefined) {
                    balance[currency].used = this.fn.sum (balance[currency].total, -balance[currency].free)
                }
            }

            const _balance = balance as any;
            _balance.free[currency] = balance[currency].free
            _balance.used[currency] = balance[currency].used
            _balance.total[currency] = balance[currency].total
        }

        return balance
    }

    async fetchPartialBalance (part: string, params: Params = {}) {
        const balance = await this.fetchBalance (params)
        return balance[part] as unknown as PartialBalances
    }

    fetchFreeBalance (params: Params = {}) {
        return this.fetchPartialBalance ('free', params)
    }

    fetchUsedBalance (params: Params = {}) {
        return this.fetchPartialBalance ('used', params)
    }

    fetchTotalBalance (params: Params = {}) {
        return this.fetchPartialBalance ('total', params)
    }

    async fetchStatus (params: Params = {}) {
        if (this.has['fetchTime']) {
            const time = await this.fetchTime(params)
            return this.status = this.fn.extend(this.status, {
                'updated': time,
            })
        }
        return this.status
    }

    async fetchTradingFees (params: Params = {}): Promise<Dictionary<TradingFee>> {
        throw new NotSupported (this.id + ' fetchTradingFees not supported yet')
    }

    async fetchTradingFee (symbol: TickerSymbol, params: Params = {}): Promise<TradingFee> {
        if (!this.has['fetchTradingFees']) {
            throw new NotSupported (this.id + ' fetchTradingFee not supported yet')
        }
        const tradingFees = await this.fetchTradingFees (params)
        return this.fn.safeValue (tradingFees, 0, {})
    }

    async loadTradingLimits (symbols: TickerSymbol[], reload = false, params: Params = {}) {
        if (this.has['fetchTradingLimits']) {
            if (reload || !('limitsLoaded' in this.options)) {
                const response = await this.fetchTradingLimits (symbols);
                for (let i = 0; i < symbols.length; i++) {
                    const symbol = symbols[i];
                    this.markets[symbol as string] = this.fn.deepExtend (this.markets[symbol as string], response[symbol as string]);
                }
                this.options['limitsLoaded'] = this.fn.milliseconds ();
            }
        }
        return this.markets;
    }

    filterBySinceLimit (array: any[], since?: number, limit?: number, key = 'timestamp') {
        if (since !== undefined && since !== null)
            array = array.filter (entry => entry[key] >= since)
        if (limit !== undefined && limit !== null)
            array = array.slice (0, limit)
        return array
    }

    filterByValueSinceLimit <T>(array: T[], field: string, value?: any, since?: number, limit?: number) {

        const valueIsDefined = value !== undefined && value !== null
        const sinceIsDefined = since !== undefined && since !== null

        // single-pass filter for both symbol and since
        if (valueIsDefined || sinceIsDefined)
            array = Object.values (array).filter ((entry: any) =>
                ((valueIsDefined ? (entry[field] === value)   : true) &&
                 (sinceIsDefined ? (entry.timestamp >= since!) : true)))

        if (limit !== undefined && limit !== null)
            array = Object.values (array).slice (0, limit)

        return array
    }

    filterBySymbolSinceLimit <T>(array: T[], symbol?: TickerSymbol, since?: number, limit?: number) {
        return this.filterByValueSinceLimit (array, 'symbol', symbol, since, limit)
    }

    filterByCurrencySinceLimit <T>(array: T[], code?: string, since?: number, limit?: number) {
        return this.filterByValueSinceLimit (array, 'currency', code, since, limit)
    }

    private _filterByArray <T>(objects: T[], key: keyof T, values?: string[], indexed = true) {

        const items = Object.values (objects)

        // return all of them if no values were passed
        if (values === undefined || values === null)
            return indexed ? indexBy (objects, key) : objects

        const result = []
        for (let i = 0; i < items.length; i++) {
            if (values?.includes (items[i][key] as any))
                result.push (objects[i])
        }

        return indexed ? indexBy (result, key) : result
    }

    filterByArray <T>(objects: T[], key: keyof T, values?: string[]) {
        return this._filterByArray(objects, key, values, false) as Array<T>;
    }

    filterByArrayAsDictionary <T>(objects: T[], key: keyof T, values?: string[]) {
        return this._filterByArray(objects, key, values, true) as Dictionary<T>;
    }

    abstract parseTrade (trade: any, market?: Market): any;

    parseTrades (trades: any[], market?: Market, since?: number, limit?: number, params: Params = {}) {
        // this code is commented out temporarily to catch for exchange-specific errors
        // if (!this.isArray (trades)) {
        //     throw new ExchangeError (this.id + ' parseTrades expected an array in the trades argument, but got ' + typeof trades);
        // }
        let result = Object.values (trades || []).map (trade => this.fn.extend (this.parseTrade (trade, market), params))
        result = sortBy (result, 'timestamp')
        const symbol = (market !== undefined) ? market['symbol'] : undefined
        return this.filterBySymbolSinceLimit (result, symbol, since, limit)
    }

    abstract parseTransaction (transaction: any, currency: Currency, since?: number, limit?: number, params?: Params): Transaction;

    parseTransactions <T>(transactions: T[], currency: Currency, since?: number, limit?: number, params: Params = {}) {
        // this code is commented out temporarily to catch for exchange-specific errors
        // if (!this.isArray (transactions)) {
        //     throw new ExchangeError (this.id + ' parseTransactions expected an array in the transactions argument, but got ' + typeof transactions);
        // }
        let result = Object.values (transactions || []).map (transaction => this.fn.extend (this.parseTransaction (transaction, currency), params))
        result = sortBy (result, 'timestamp');
        const code = (currency !== undefined) ? currency['code'] : undefined;
        return this.filterByCurrencySinceLimit (result, code, since, limit);
    }

    parseLedgerEntry (item: any, currency?: Currency): LedgerEntry {
        throw new Error('parseLedgerEntry not implemented.');
    }

    parseLedger (data: any, currency?: Currency, since?: number, limit?: number, params: Params = {}) {
        let result: any[] = [];
        const array = Object.values (data || []);
        for (let i = 0; i < array.length; i++) {
            const itemOrItems = this.parseLedgerEntry (array[i], currency);
            if (Array.isArray (itemOrItems)) {
                for (let j = 0; j < itemOrItems.length; j++) {
                    result.push (this.fn.extend (itemOrItems[j], params));
                }
            } else {
                result.push (this.fn.extend (itemOrItems, params));
            }
        }
        result = sortBy (result, 'timestamp');
        const code = (currency !== undefined) ? currency['code'] : undefined;
        return this.filterByCurrencySinceLimit (result, code, since, limit);
    }

    abstract parseOrder (order: any, market?: Market): Order;

    parseOrders (orders: any[], market?: Market, since?: number, limit?: number, params: Params = {}): Order[] {
        // this code is commented out temporarily to catch for exchange-specific errors
        // if (!this.isArray (orders)) {
        //     throw new ExchangeError (this.id + ' parseOrders expected an array in the orders argument, but got ' + typeof orders);
        // }
        let result = Object.values (orders).map (order => this.fn.extend (this.parseOrder (order, market), params))
        result = sortBy (result, 'timestamp')
        const symbol = (market !== undefined) ? market['symbol'] : undefined
        return this.filterBySymbolSinceLimit (result, symbol, since, limit)
    }

    safeCurrencyCode (currencyId: string, currency?: Currency) {
        let code = undefined
        if (currencyId !== undefined) {
            if (this.currencies_by_id !== undefined && currencyId in this.currencies_by_id) {
                code = this.currencies_by_id[currencyId]['code']
            } else {
                code = this.commonCurrencyCode (currencyId.toUpperCase ())
            }
        }
        if (code === undefined && currency !== undefined) {
            code = currency['code']
        }
        return code as string
    }

    filterBySymbol (array: {symbol: TickerSymbol}[], symbol = undefined) {
        return ((symbol !== undefined) ? array.filter (entry => entry.symbol === symbol) : array)
    }

    parseOHLCV (ohlcv: any[], market?: Market, timeframe = '1m', since?: number, limit?: number) {
        return Array.isArray (ohlcv) ? ohlcv.slice (0, 6) : ohlcv
    }

    parseOHLCVs (ohlcvs: OHLCV[], market?: Market, timeframe = '1m', since?: number, limit?: number) {
        // this code is commented out temporarily to catch for exchange-specific errors
        // if (!this.isArray (ohlcvs)) {
        //     throw new ExchangeError (this.id + ' parseOHLCVs expected an array in the ohlcvs argument, but got ' + typeof ohlcvs);
        // }
        ohlcvs = Object.values (ohlcvs || [])
        const result = []
        for (let i = 0; i < ohlcvs.length; i++) {
            if (limit && (result.length >= limit)) {
                break;
            }
            const ohlcv = this.parseOHLCV (ohlcvs[i], market, timeframe, since, limit)
            if (since && (ohlcv[0] < since)) {
                continue
            }
            result.push (ohlcv)
        }
        return sortBy (result, 0)
    }

    editLimitBuyOrder (id: string, symbol: TickerSymbol, amount: number, price?: number, params: Params = {}) {
        return this.editLimitOrder (id, symbol, 'buy', amount, price, params)
    }

    editLimitSellOrder (id: string, symbol: TickerSymbol, amount: number, price?: number, params: Params = {}) {
        return this.editLimitOrder (id, symbol, 'sell', amount, price, params)
    }

    editLimitOrder (id: string, symbol: TickerSymbol, side: Order['side'], amount: number, price?: number, params: Params = {}) {
        return this.editOrder (id, symbol, 'limit', side, amount, price, params)
    }

    async editOrder (id: string, symbol: TickerSymbol, type: Order['type'], side: Order['side'], amount: number, price?: number, params: Params = {}): Promise<Order> {
        if (!this.enableRateLimit)
            throw new ExchangeError (this.id + ' editOrder() requires enableRateLimit = true')
        await this.cancelOrder (id, symbol);
        return this.createOrder (symbol, type, side, amount, price, params)
    }

    createLimitOrder (symbol: TickerSymbol, side: Order['side'], amount: number, price?: number, params: Params = {}): Promise<Order> {
        return this.createOrder (symbol, 'limit', side, amount, price, params)
    }

    createMarketOrder (symbol: TickerSymbol, side: Order['side'], amount: number, price?: number, params: Params = {}): Promise<Order> {
        return this.createOrder (symbol, 'market', side, amount, price, params)
    }

    createLimitBuyOrder (symbol: TickerSymbol, amount: number, price?: number, params: Params = {}) {
        return this.createOrder  (symbol, 'limit', 'buy', amount, price, params)
    }

    createLimitSellOrder (symbol: TickerSymbol, amount: number, price?: number, params: Params = {}) {
        return this.createOrder (symbol, 'limit', 'sell', amount, price, params)
    }

    createMarketBuyOrder (symbol: TickerSymbol, amount: number, params: Params = {}) {
        return this.createOrder (symbol, 'market', 'buy', amount, undefined, params)
    }

    createMarketSellOrder (symbol: TickerSymbol, amount: number, params: Params = {}) {
        return this.createOrder (symbol, 'market', 'sell', amount, undefined, params)
    }

    costToPrecision (symbol: TickerSymbol, cost: number) {
        return decimalToPrecision (cost, ROUND, this.markets[symbol as string].precision.price, this.precisionMode)
    }

    priceToPrecision (symbol: TickerSymbol, price: number) {
        return decimalToPrecision (price, ROUND, this.markets[symbol as string].precision.price, this.precisionMode)
    }

    amountToPrecision (symbol: TickerSymbol, amount: number) {
        return decimalToPrecision (amount, TRUNCATE, this.markets[symbol as string].precision.amount, this.precisionMode)
    }

    feeToPrecision (symbol: TickerSymbol, fee: number) {
        return decimalToPrecision (fee, ROUND, this.markets[symbol as string].precision.price, this.precisionMode)
    }

    currencyToPrecision (currency: string, fee: number) {
        return decimalToPrecision (fee, ROUND, this.currencies[currency]['precision'], this.precisionMode);
    }

    calculateFee (symbol: TickerSymbol, type: Order['type'], side: Order['side'], amount: number, price: number, takerOrMaker: 'taker' | 'maker' = 'taker', params: Params = {}) {
        const market = this.markets[symbol as string]
        const rate = market[takerOrMaker] as number
        const cost = parseFloat (this.costToPrecision (symbol, amount * price))
        return {
            'type': takerOrMaker,
            'currency': market['quote'],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, rate * cost)),
        }
    }

    // ------------------------------------------------------------------------
    // web3 / 0x methods
    static hasWeb3 () {
        return Web3 && ethUtil && ethAbi && BigNumber
    }

    checkRequiredDependencies () {
        if (!Exchange.hasWeb3 ()) {
            throw new ExchangeError ("Required dependencies missing: \nnpm i web3 ethereumjs-util ethereumjs-abi bignumber.js --no-save");
        }
    }

    ethDecimals (unit = 'ether') {
        const units = {
            'wei': 0,          // 1
            'kwei': 3,         // 1000
            'babbage': 3,      // 1000
            'femtoether': 3,   // 1000
            'mwei': 6,         // 1000000
            'lovelace': 6,     // 1000000
            'picoether': 6,    // 1000000
            'gwei': 9,         // 1000000000
            'shannon': 9,      // 1000000000
            'nanoether': 9,    // 1000000000
            'nano': 9,         // 1000000000
            'szabo': 12,       // 1000000000000
            'microether': 12,  // 1000000000000
            'micro': 12,       // 1000000000000
            'finney': 15,      // 1000000000000000
            'milliether': 15,  // 1000000000000000
            'milli': 15,       // 1000000000000000
            'ether': 18,       // 1000000000000000000
            'kether': 21,      // 1000000000000000000000
            'grand': 21,       // 1000000000000000000000
            'mether': 24,      // 1000000000000000000000000
            'gether': 27,      // 1000000000000000000000000000
            'tether': 30,      // 1000000000000000000000000000000
        }
        return this.fn.safeValue (units, unit)
    }

    ethUnit (decimals = 18) {
        const units = {
            0: 'wei',      // 1000000000000000000
            3: 'kwei',     // 1000000000000000
            6: 'mwei',     // 1000000000000
            9: 'gwei',     // 1000000000
            12: 'szabo',   // 1000000
            15: 'finney',  // 1000
            18: 'ether',   // 1
            21: 'kether',  // 0.001
            24: 'mether',  // 0.000001
            27: 'gether',  // 0.000000001
            30: 'tether',  // 0.000000000001
        }
        return this.fn.safeValue (units, decimals)
    }

    fromWei (amount: number, unit = 'ether', decimals = 18) {
        if (amount === undefined) {
            return amount
        }
        if (decimals !== 18) {
            amount = new BigNumber (amount).times (new BigNumber (10 ** (18 - decimals))).toFixed ()
        } else {
            amount = new BigNumber (amount).toFixed ()
        }
        return parseFloat (this.web3.utils.fromWei (amount, unit))
    }

    toWei (amount: number, unit = 'ether', decimals = 18) {
        if (amount === undefined) {
            return amount
        }
        let amountStr: string
        if (decimals !== 18) {
            amountStr = new BigNumber (this.fn.numberToString (amount)).div (new BigNumber (10 ** (18 - decimals))).toFixed ()
        } else {
            amountStr = this.fn.numberToString (amount)
        }
        return this.web3.utils.toWei (amountStr, unit)
    }

    soliditySha3 (array: any[]) {
        const values = this.solidityValues (array);
        const types = this.solidityTypes (values);
        return '0x' +  ethAbi.soliditySHA3 (types, values).toString ('hex')
    }

    solidityTypes (array: any[]) {
        return array.map (value => (this.web3.utils.isAddress (value) ? 'address' : 'uint256'))
    }

    solidityValues (array: any[]) {
        return array.map (value => (this.web3.utils.isAddress (value) ? value : (new BigNumber (value).toFixed ())))
    }

    getZeroExOrderHash (order: any) {
        return this.soliditySha3 ([
            order['exchangeContractAddress'], // address
            order['maker'], // address
            order['taker'], // address
            order['makerTokenAddress'], // address
            order['takerTokenAddress'], // address
            order['feeRecipient'], // address
            order['makerTokenAmount'], // uint256
            order['takerTokenAmount'], // uint256
            order['makerFee'], // uint256
            order['takerFee'], // uint256
            order['expirationUnixTimestampSec'], // uint256
            order['salt'], // uint256
        ]);
    }

    getZeroExOrderHashV2 (order: any) {
        // https://github.com/0xProject/0x-monorepo/blob/development/python-packages/order_utils/src/zero_ex/order_utils/__init__.py
        const addressPadding = '000000000000000000000000';
        const header = '1901';
        const domainStructHeader = '91ab3d17e3a50a9d89e63fd30b92be7f5336b03b287bb946787a83a9d62a2766f0f24618f4c4be1e62e026fb039a20ef96f4495294817d1027ffaa6d1f70e61ead7c5bef027816a800da1736444fb58a807ef4c9603b7848673f7e3a68eb14a5';
        const orderSchemaHash = '770501f88a26ede5c04a20ef877969e961eb11fc13b78aaf414b633da0d4f86f';

        const domainStructHash = ethAbi.soliditySHA3 (
            [
                'bytes',
                'bytes',
                'address'
            ],
            [
                Buffer.from (domainStructHeader, 'hex'),
                Buffer.from (addressPadding, 'hex'),
                order['exchangeAddress']
            ]
        );
        const orderStructHash = ethAbi.soliditySHA3 (
            [
                'bytes',
                'bytes',
                'address',
                'bytes',
                'address',
                'bytes',
                'address',
                'bytes',
                'address',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'string',
                'string'
            ],
            [
                Buffer.from (orderSchemaHash, 'hex'),
                Buffer.from (addressPadding, 'hex'),
                order['makerAddress'],
                Buffer.from (addressPadding, 'hex'),
                order['takerAddress'],
                Buffer.from (addressPadding, 'hex'),
                order['feeRecipientAddress'],
                Buffer.from (addressPadding, 'hex'),
                order['senderAddress'],
                order['makerAssetAmount'],
                order['takerAssetAmount'],
                order['makerFee'],
                order['takerFee'],
                order['expirationTimeSeconds'],
                order['salt'],
                ethUtil.keccak (Buffer.from (order['makerAssetData'].slice (2), 'hex')),
                ethUtil.keccak (Buffer.from (order['takerAssetData'].slice (2), 'hex')),
            ]
        );
        return '0x' + ethUtil.keccak (Buffer.concat ([
            Buffer.from (header, 'hex'),
            domainStructHash,
            orderStructHash
        ])).toString ('hex');
    }

    signZeroExOrder (order: any, privateKey: string) {
        const orderHash = this.getZeroExOrderHash (order);
        const signature = this.signMessage (orderHash, privateKey);
        return this.fn.extend (order, {
            'orderHash': orderHash,
            'ecSignature': signature, // todo fix v if needed
        })
    }

    signZeroExOrderV2 (order: any, privateKey: string) {
        const orderHash = this.getZeroExOrderHashV2 (order);
        const signature = this.signMessage (orderHash, privateKey);
        return this.fn.extend (order, {
            'orderHash': orderHash,
            'signature': this.convertECSignatureToSignatureHex (signature),
        })
    }

    convertECSignatureToSignatureHex (signature: any) {
        // https://github.com/0xProject/0x-monorepo/blob/development/packages/order-utils/src/signature_utils.ts
        let v = signature.v;
        if (v !== 27 && v !== 28) {
            v = v + 27;
        }
        return '0x' + v.toString (16) + signature['r'].slice (-64) + signature['s'].slice (-64) + '03'
    }

    static remove0xPrefix (hexData: string) {
        if (hexData.slice (0, 2) === '0x') {
            return hexData.slice (2)
        } else {
            return hexData
        }
    }

    hashMessage (message: string) {
        // takes a hex encoded message
        const binaryMessage = this.fn.base16ToBinary (Exchange.remove0xPrefix (message))
        const prefix = this.fn.stringToBinary ('\x19Ethereum Signed Message:\n' + binaryMessage.sigBytes)
        return '0x' + this.fn.hash (this.fn.binaryConcat (prefix as any, binaryMessage), 'keccak', 'hex')
    }

    signHash (hash: string, privateKey: string) {
        const signature = this.fn.ecdsa (hash.slice (-64), privateKey.slice (-64), 'secp256k1', undefined)
        return {
            'r': '0x' + signature['r'],
            's': '0x' + signature['s'],
            'v': 27 + signature['v'],
        }
    }

    signMessage (message: string, privateKey: string) {
        return this.signHash (this.hashMessage (message), privateKey.slice (-64))
    }

    oath () {
        if (typeof this.twofa !== 'undefined') {
            return this.fn.totp (this.twofa)
        } else {
            throw new ExchangeError (this.id + ' this.twofa has not been set')
        }
    }

    // the following functions take and return numbers represented as strings
    // this is useful for arbitrary precision maths that floats lack
    integerDivide (a: number, b: number) {
        return new BN (a).div (new BN (b))
    }

    integerModulo (a: number, b: number) {
        return new BN (a).mod (new BN (b))
    }

    integerPow (a: number, b: number) {
        return new BN (a).pow (new BN (b))
    }
}

