"use strict";

/*  ------------------------------------------------------------------------ */

const functions = require ('./functions')

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
    , microseconds
    , seconds
    , iso8601
    , parse8601
    , parseDate
    , sleep
    , timeout
    , TimedOut
    , buildOHLCVC
    , decimalToPrecision
    , defaultFetch
} = functions

const {
    ExchangeError
    , InvalidAddress
    , NotSupported
    , AuthenticationError
    , DDoSProtection
    , RequestTimeout
    , ExchangeNotAvailable } = require ('./errors')

const { TRUNCATE, ROUND, DECIMAL_PLACES } = functions.precisionConstants

// ----------------------------------------------------------------------------
// web3 / 0x imports

let Web3 = undefined
    , ethAbi = undefined
    , ethUtil = undefined
    , BigNumber = undefined

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

/*  ------------------------------------------------------------------------ */

module.exports = class Exchange {

    describe () {
        return {
            'id': undefined,
            'name': undefined,
            'countries': undefined,
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
                'logo': undefined,
                'api': undefined,
                'www': undefined,
                'doc': undefined,
                'fees': undefined,
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
            'skipJsonOnStatusCodes': [], // array of http status codes which override requirement for JSON response
            'exceptions': undefined,
            'httpExceptions': {
                '422': ExchangeError,
                '418': DDoSProtection,
                '429': DDoSProtection,
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
        } // return
    } // describe ()

    constructor (userConfig = {}) {

        Object.assign (this, functions, { encode: string => string, decode: string => string })

        // if (isNode) {
        //     this.nodeVersion = process.version.match (/\d+\.\d+\.\d+/)[0]
        //     this.userAgent = {
        //         'User-Agent': 'ccxt/' + Exchange.ccxtVersion +
        //             ' (+https://github.com/ccxt/ccxt)' +
        //             ' Node.js/' + this.nodeVersion + ' (JavaScript)'
        //     }
        // }

        this.options = {} // exchange-specific options, if any
        this.fetchOptions = {} // fetch implementation options (JS only)

        this.userAgents = {
            'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
            'chrome39': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
        }

        this.headers = {}

        // prepended to URL, like https://proxy.com/https://exchange.com/api...
        this.proxy = ''
        this.origin = '*' // CORS origin

        this.iso8601      = iso8601
        this.parse8601    = parse8601
        this.parseDate    = parseDate
        this.microseconds = microseconds
        this.seconds      = seconds

        this.minFundingAddressLength = 1 // used in checkAddress
        this.substituteCommonCurrencyCodes = true  // reserved

        // do not delete this line, it is needed for users to be able to define their own fetchImplementation
        this.fetchImplementation = defaultFetch

        this.timeout       = 10000 // milliseconds
        this.verbose       = false
        this.debug         = false
        this.userAgent     = undefined
        this.twofa         = undefined // two-factor authentication (2FA)

        this.apiKey        = undefined
        this.secret        = undefined
        this.uid           = undefined
        this.login         = undefined
        this.password      = undefined
        this.privateKey    = undefined // a "0x"-prefixed hexstring private key for a wallet
        this.walletAddress = undefined // a wallet address "0x"-prefixed hexstring
        this.token         = undefined // reserved for HTTP auth in some cases

        this.balance     = {}
        this.orderbooks  = {}
        this.tickers     = {}
        this.orders      = {}
        this.trades      = {}
        this.transactions = {}

        this.requiresWeb3 = false
        this.precision = {}

        this.enableLastJsonResponse = true
        this.enableLastHttpResponse = true
        this.enableLastResponseHeaders = true
        this.last_http_response    = undefined
        this.last_json_response    = undefined
        this.last_response_headers = undefined

        this.arrayConcat = (a, b) => a.concat (b)

        const unCamelCaseProperties = (obj = this) => {
            if (obj !== null) {
                for (const k of Object.getOwnPropertyNames (obj)) {
                    this[unCamelCase (k)] = this[k]
                }
                unCamelCaseProperties (Object.getPrototypeOf (obj))
            }
        }
        unCamelCaseProperties ()

        // merge configs
        const config = deepExtend (this.describe (), userConfig)

        // merge to this
        for (const [property, value] of Object.entries (config))
            this[property] = deepExtend (this[property], value)

        // generate old metainfo interface
        for (const k in this.has) {
            this['has' + capitalize (k)] = !!this.has[k] // converts 'emulated' to true
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
        return this.seconds ()
    }

    milliseconds () {
        return now ()
    }

    encodeURIComponent (...args) {
        return encodeURIComponent (...args)
    }

    checkRequiredCredentials (error = true) {
        Object.keys (this.requiredCredentials).forEach ((key) => {
            if (this.requiredCredentials[key] && !this[key]) {
                if (error) {
                    throw new AuthenticationError (this.id + ' requires `' + key + '` credential')
                } else {
                    return error
                }
            }
        })
    }

    checkAddress (address) {

        if (address === undefined)
            throw new InvalidAddress (this.id + ' address is undefined')

        // check the address is not the same letter like 'aaaaa' nor too short nor has a space
        if ((unique (address).length === 1) || address.length < this.minFundingAddressLength || address.includes (' '))
            throw new InvalidAddress (this.id + ' address is invalid or has less than ' + this.minFundingAddressLength.toString () + ' characters: "' + this.json (address) + '"')

        return address
    }

    initRestRateLimiter () {

        if (this.rateLimit === undefined)
            throw new Error (this.id + '.rateLimit property is not configured')

        this.tokenBucket = this.extend ({
            refillRate:  1 / this.rateLimit,
            delay:       1,
            capacity:    1,
            defaultCost: 1,
            maxCapacity: 1000,
        }, this.tokenBucket)

        this.throttle = throttle (this.tokenBucket)

        this.executeRestRequest = (url, method = 'GET', headers = undefined, body = undefined) => {

            // fetchImplementation cannot be called on this. in browsers:
            // TypeError Failed to execute 'fetch' on 'Window': Illegal invocation
            const fetchImplementation = this.fetchImplementation

            const params = { method, headers, body, timeout: this.timeout }

            if (this.httpAgent && url.indexOf ('http://') === 0) {
                params['agent'] = this.httpAgent;
            } else if (this.httpsAgent && url.indexOf ('https://') === 0) {
                params['agent'] = this.httpsAgent;
            } else if (this.agent) {
                const [ protocol, ... rest ] = url.split ('//')
                // this.agent.protocol contains a colon ('https:' or 'http:')
                if (protocol === this.agent.protocol) {
                    params['agent'] = this.agent;
                }
            }

            const promise =
                fetchImplementation (url, this.extend (params, this.fetchOptions))
                    .catch ((e) => {
                        if (isNode)
                            throw new ExchangeNotAvailable ([ this.id, method, url, e.type, e.message ].join (' '))
                        throw e // rethrow all unknown errors
                    })
                    .then (response => this.handleRestResponse (response, url, method, headers, body))

            return timeout (this.timeout, promise).catch ((e) => {
                if (e instanceof TimedOut)
                    throw new RequestTimeout (this.id + ' ' + method + ' ' + url + ' request timed out (' + this.timeout + ' ms)')
                throw e
            })
        }
    }

    setSandboxMode (enabled) {
        if (!!enabled) {
            if ('test' in this.urls) {
                if (typeof this.urls['api'] === 'string') {
                    this.urls['api_backup'] = this.urls['api']
                    this.urls['api'] = this.urls['test']
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

    defineRestApi (api, methodName, options = {}) {

        for (const type of Object.keys (api)) {
            for (const httpMethod of Object.keys (api[type])) {

                let paths = api[type][httpMethod]
                for (let i = 0; i < paths.length; i++) {
                    let path = paths[i].trim ()
                    let splitPath = path.split (/[^a-zA-Z0-9]/)

                    let uppercaseMethod  = httpMethod.toUpperCase ()
                    let lowercaseMethod  = httpMethod.toLowerCase ()
                    let camelcaseMethod  = this.capitalize (lowercaseMethod)
                    let camelcaseSuffix  = splitPath.map (this.capitalize).join ('')
                    let underscoreSuffix = splitPath.map (x => x.trim ().toLowerCase ()).filter (x => x.length > 0).join ('_')

                    let camelcase  = type + camelcaseMethod + this.capitalize (camelcaseSuffix)
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

                    let partial = async params => this[methodName] (path, type, uppercaseMethod, params || {})

                    this[camelcase]  = partial
                    this[underscore] = partial
                }
            }
        }
    }

    fetch (url, method = 'GET', headers = undefined, body = undefined) {

        if (isNode && this.userAgent) {
            if (typeof this.userAgent === 'string')
                headers = extend ({ 'User-Agent': this.userAgent }, headers)
            else if ((typeof this.userAgent === 'object') && ('User-Agent' in this.userAgent))
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

        return this.executeRestRequest (url, method, headers, body)
    }

    async fetch2 (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {

        if (this.enableRateLimit)
            await this.throttle ()

        const request = this.sign (path, type, method, params, headers, body)
        return this.fetch (request.url, request.method, request.headers, request.body)
    }

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        return this.fetch2 (path, type, method, params, headers, body)
    }

    parseJson (jsonString) {
        return JSON.parse (jsonString)
    }

    parseRestResponse (response, responseBody, url, method) {
        try {

            return (responseBody.length > 0) ? this.parseJson (responseBody) : {} // empty object for empty body

        } catch (e) {

            if (this.verbose)
                console.log ('parseJson:\n', this.id, method, url, response.status, 'error', e, "response body:\n'" + responseBody + "'\n")

            let title = undefined
            const match = responseBody.match (/<title>([^<]+)/i)
            if (match)
                title = match[1].trim ();

            const maintenance = responseBody.match (/offline|busy|retry|wait|unavailable|maintain|maintenance|maintenancing/i)
            const ddosProtection = responseBody.match (/cloudflare|incapsula|overload|ddos/i)

            if (e instanceof SyntaxError) {

                let ExceptionClass = ExchangeNotAvailable
                let details = 'not accessible from this location at the moment'
                if (maintenance)
                    details = 'offline, on maintenance, or unreachable from this location at the moment'
                // http error codes proxied by cloudflare are not really DDoSProtection errors (mostly)
                if ((response.status < 500) && (ddosProtection)) {
                    ExceptionClass = DDoSProtection
                }
                throw new ExceptionClass ([ this.id, method, url, response.status, title, details ].join (' '))
            }

            throw e
        }
    }

    // a helper for matching error strings exactly vs broadly
    findBroadlyMatchedKey (broad, string) {
        const keys = Object.keys (broad);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (string.indexOf (key) >= 0)
                return key;
        }
        return undefined;
    }

    handleErrors (statusCode, statusText, url, method, responseHeaders, responseBody, response) {
        // override me
    }

    defaultErrorHandler (code, reason, responseBody, url, method) {
        if ((code >= 200) && (code <= 299))
            return
        let ErrorClass = undefined
        let details = responseBody
        const match = responseBody.match (/<title>([^<]+)/i)
        if (match)
            details = match[1].trim ();
        ErrorClass = this.httpExceptions[code.toString ()] || ExchangeError
        if (ErrorClass === ExchangeNotAvailable) {
            if (responseBody.match (/cloudflare|incapsula|overload|ddos/i)) {
                ErrorClass = DDoSProtection
            } else {
                details += ' (possible reasons: ' + [
                    'invalid API keys',
                    'bad or old nonce',
                    'exchange is down or offline',
                    'on maintenance',
                    'DDoS protection',
                    'rate-limiting',
                ].join (', ') + ')'
            }
        }
        throw new ErrorClass ([ this.id, method, url, code, reason, details ].join (' '))
    }

    isJsonEncodedObject (object) {
        return ((typeof object === 'string') &&
                (object.length >= 2) &&
                ((object[0] === '{') || (object[0] === '[')))
    }

    getResponseHeaders (response) {
        const result = {}
        response.headers.forEach ((value, key) => {
            key = key.split ('-').map (word => capitalize (word)).join ('-')
            result[key] = value
        })
        return result
    }

    handleRestResponse (response, url, method = 'GET', requestHeaders = undefined, requestBody = undefined) {

        return response.text ().then ((responseBody) => {

            const shouldParseJson = this.isJsonEncodedObject (responseBody) && !this.skipJsonOnStatusCodes.includes (response.status)
            const json = shouldParseJson ? this.parseRestResponse (response, responseBody, url, method) : undefined

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

            this.handleErrors (response.status, response.statusText, url, method, responseHeaders, responseBody, json)
            this.defaultErrorHandler (response.status, response.statusText, responseBody, url, method)

            return json || responseBody
        })
    }

    setMarkets (markets, currencies = undefined) {
        const values = Object.values (markets).map (market => deepExtend ({
            'limits': this.limits,
            'precision': this.precision,
        }, this.fees['trading'], market))
        this.markets = deepExtend (this.markets, indexBy (values, 'symbol'))
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
                    }))
            const quoteCurrencies =
                values.filter (market => 'quote' in market)
                    .map (market => ({
                        id: market.quoteId || market.quote,
                        numericId: (market.quoteNumericId !== undefined) ? market.quoteNumericId : undefined,
                        code: market.quote,
                        precision: market.precision ? (market.precision.quote || market.precision.price) : 8,
                    }))
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

    async loadMarkets (reload = false, params = {}) {
        if (!reload && this.markets) {
            if (!this.markets_by_id) {
                return this.setMarkets (this.markets)
            }
            return this.markets
        }
        let currencies = undefined
        if (this.has.fetchCurrencies) {
            currencies = await this.fetchCurrencies ()
        }
        const markets = await this.fetchMarkets (params)
        return this.setMarkets (markets, currencies)
    }

    async loadAccounts (reload = false, params = {}) {
        if (reload) {
            this.accounts = await this.fetchAccounts (params)
        } else {
            if (this.accounts) {
                return this.accounts
            } else {
                this.accounts = await this.fetchAccounts (params)
            }
        }
        this.accountsById = this.indexBy (this.accounts, 'id')
        return this.accounts
    }

    fetchBidsAsks (symbols = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchBidsAsks not supported yet')
    }

    async fetchOHLCVC (symbol, timeframe = '1m', since = undefined, limits = undefined, params = {}) {
        if (!this.has['fetchTrades'])
            throw new NotSupported (this.id + ' fetchOHLCV() not supported yet')
        await this.loadMarkets ()
        const trades = await this.fetchTrades (symbol, since, limits, params)
        const ohlcvc = buildOHLCVC (trades, timeframe, since, limits)
        return ohlcvc
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limits = undefined, params = {}) {
        if (!this.has['fetchTrades'])
            throw new NotSupported (this.id + ' fetchOHLCV() not supported yet')
        await this.loadMarkets ()
        const trades = await this.fetchTrades (symbol, since, limits, params)
        const ohlcvc = buildOHLCVC (trades, timeframe, since, limits)
        return ohlcvc.map (c => c.slice (0, -1))
    }

    parseTradingViewOHLCV (ohlcvs, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        const result = this.convertTradingViewToOHLCV (ohlcvs);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    convertTradingViewToOHLCV (ohlcvs) {
        const result = [];
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

    convertOHLCVToTradingView (ohlcvs) {
        const result = {
            't': [],
            'o': [],
            'h': [],
            'l': [],
            'c': [],
            'v': [],
        };
        for (let i = 0; i < ohlcvs.length; i++) {
            result['t'].push (parseInt (ohlcvs[i][0] / 1000));
            result['o'].push (ohlcvs[i][1]);
            result['h'].push (ohlcvs[i][2]);
            result['l'].push (ohlcvs[i][3]);
            result['c'].push (ohlcvs[i][4]);
            result['v'].push (ohlcvs[i][5]);
        }
        return result;
    }

    fetchTickers (symbols = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchTickers not supported yet')
    }

    purgeCachedOrders (before) {
        const orders = Object
            .values (this.orders)
            .filter (order =>
                (order.status === 'open') ||
                (order.timestamp >= before))
        this.orders = indexBy (orders, 'id')
        return this.orders
    }

    fetchOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOrder not supported yet');
    }

    fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOrders not supported yet');
    }

    fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOpenOrders not supported yet');
    }

    fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchClosedOrders not supported yet');
    }

    fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchMyTrades not supported yet');
    }

    fetchTransactions (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchTransactions not supported yet');
    }

    fetchDeposits (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchDeposits not supported yet');
    }

    fetchWithdrawals (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchWithdrawals not supported yet');
    }

    fetchCurrencies (params = {}) {
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return new Promise ((resolve, reject) => resolve (this.currencies));
    }

    fetchMarkets (params = {}) {
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return new Promise ((resolve, reject) => resolve (Object.values (this.markets)))
    }

    async fetchOrderStatus (id, symbol = undefined, params = {}) {
        const order = await this.fetchOrder (id, symbol, params);
        return order['status'];
    }

    account () {
        return {
            'free': undefined,
            'used': undefined,
            'total': undefined,
        }
    }

    commonCurrencyCode (currency) {
        if (!this.substituteCommonCurrencyCodes)
            return currency
        return this.safeString (this.commonCurrencies, currency, currency)
    }

    currencyId (commonCode) {

        if (this.currencies === undefined) {
            throw new ExchangeError (this.id + ' currencies not loaded')
        }

        if (commonCode in this.currencies) {
            return this.currencies[commonCode]['id'];
        }

        const currencyIds = {}
        const distinct = Object.keys (this.commonCurrencies)
        for (let i = 0; i < distinct.length; i++) {
            const k = distinct[i]
            currencyIds[this.commonCurrencies[k]] = k
        }

        return this.safeString (currencyIds, commonCode, commonCode)
    }

    currency (code) {

        if (this.currencies === undefined)
            throw new ExchangeError (this.id + ' currencies not loaded')

        if ((typeof code === 'string') && (code in this.currencies))
            return this.currencies[code]

        throw new ExchangeError (this.id + ' does not have currency code ' + code)
    }

    findMarket (string) {

        if (this.markets === undefined)
            throw new ExchangeError (this.id + ' markets not loaded')

        if (typeof string === 'string') {

            if (string in this.markets_by_id)
                return this.markets_by_id[string]

            if (string in this.markets)
                return this.markets[string]
        }

        return string
    }

    findSymbol (string, market = undefined) {

        if (market === undefined)
            market = this.findMarket (string)

        if (typeof market === 'object')
            return market['symbol']

        return string
    }

    market (symbol) {

        if (this.markets === undefined)
            throw new ExchangeError (this.id + ' markets not loaded')

        if ((typeof symbol === 'string') && (symbol in this.markets))
            return this.markets[symbol]

        throw new ExchangeError (this.id + ' does not have market symbol ' + symbol)
    }

    marketId (symbol) {
        const market = this.market (symbol)
        return (market !== undefined ? market['id'] : symbol)
    }

    marketIds (symbols) {
        return symbols.map (symbol => this.marketId (symbol));
    }

    symbol (symbol) {
        return this.market (symbol).symbol || symbol
    }

    extractParams (string) {
        const re = /{([\w-]+)}/g
        const matches = []
        let match = re.exec (string)
        while (match) {
            matches.push (match[1])
            match = re.exec (string)
        }
        return matches
    }

    implodeParams (string, params) {
        for (let property in params)
            string = string.replace ('{' + property + '}', params[property])
        return string
    }

    url (path, params = {}) {
        let result = this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path))
        if (Object.keys (query).length)
            result += '?' + this.urlencode (query)
        return result
    }

    parseBidAsk (bidask, priceKey = 0, amountKey = 1) {
        const price = parseFloat (bidask[priceKey])
        const amount = parseFloat (bidask[amountKey])
        return [ price, amount ]
    }

    parseBidsAsks (bidasks, priceKey = 0, amountKey = 1) {
        return Object.values (bidasks || []).map (bidask => this.parseBidAsk (bidask, priceKey, amountKey))
    }

    async fetchL2OrderBook (symbol, limit = undefined, params = {}) {
        const orderbook = await this.fetchOrderBook (symbol, limit, params)
        return extend (orderbook, {
            'bids': sortBy (aggregate (orderbook.bids), 0, true),
            'asks': sortBy (aggregate (orderbook.asks), 0),
        })
    }

    parseOrderBook (orderbook, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1) {
        return {
            'bids': sortBy ((bidsKey in orderbook) ? this.parseBidsAsks (orderbook[bidsKey], priceKey, amountKey) : [], 0, true),
            'asks': sortBy ((asksKey in orderbook) ? this.parseBidsAsks (orderbook[asksKey], priceKey, amountKey) : [], 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        }
    }

    getCurrencyUsedOnOpenOrders (currency) {
        return Object.values (this.orders).filter (order => (order['status'] === 'open')).reduce ((total, order) => {
            const symbol = order['symbol']
            const market = this.markets[symbol]
            const remaining = order['remaining']
            if (currency === market['base'] && order['side'] === 'sell') {
                return total + remaining
            } else if (currency === market['quote'] && order['side'] === 'buy') {
                return total + (order['price'] * remaining)
            } else {
                return total
            }
        }, 0)
    }

    parseBalance (balance) {

        const currencies = Object.keys (this.omit (balance, 'info'));

        balance['free'] = {}
        balance['used'] = {}
        balance['total'] = {}

        currencies.forEach ((currency) => {

            if (balance[currency].total === undefined) {
                if (balance[currency].free !== undefined && balance[currency].used !== undefined) {
                    balance[currency].total = this.sum (balance[currency].free, balance[currency].used)
                }
            }
            if (balance[currency].free === undefined) {
                if (balance[currency].total !== undefined && balance[currency].used !== undefined) {
                    balance[currency].free = this.sum (balance[currency].total, -balance[currency].used)
                }
            }
            if (balance[currency].used === undefined) {
                if (balance[currency].total !== undefined && balance[currency].free !== undefined) {
                    balance[currency].used = this.sum (balance[currency].total, -balance[currency].free)
                }
            }

            [ 'free', 'used', 'total' ].forEach ((account) => {
                balance[account] = balance[account] || {}
                balance[account][currency] = balance[currency][account]
            })
        })

        return balance
    }

    async fetchPartialBalance (part, params = {}) {
        const balance = await this.fetchBalance (params)
        return balance[part]
    }

    fetchFreeBalance (params = {}) {
        return this.fetchPartialBalance ('free', params)
    }

    fetchUsedBalance (params = {}) {
        return this.fetchPartialBalance ('used', params)
    }

    fetchTotalBalance (params = {}) {
        return this.fetchPartialBalance ('total', params)
    }

    async fetchStatus (params = {}) {
        if (this.has['fetchTime']) {
            const time = await this.fetchTime(params)
            return this.status = this.extend(this.status, {
                'updated': time,
            })
        }
        return this.status
    }

    async fetchTradingFees (params = {}) {
        throw new NotSupported (this.id + ' fetchTradingFees not supported yet')
    }

    async fetchTradingFee (symbol, params = {}) {
        if (!this.has['fetchTradingFees']) {
            throw new NotSupported (this.id + ' fetchTradingFee not supported yet')
        }
        return await this.fetchTradingFees (params)
    }

    async loadTradingLimits (symbols = undefined, reload = false, params = {}) {
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

    filterBySinceLimit (array, since = undefined, limit = undefined) {
        if (since !== undefined && since !== null)
            array = array.filter (entry => entry.timestamp >= since)
        if (limit !== undefined && limit !== null)
            array = array.slice (0, limit)
        return array
    }

    filterByValueSinceLimit (array, field, value = undefined, since = undefined, limit = undefined) {

        const valueIsDefined = value !== undefined && value !== null
        const sinceIsDefined = since !== undefined && since !== null

        // single-pass filter for both symbol and since
        if (valueIsDefined || sinceIsDefined)
            array = Object.values (array).filter (entry =>
                ((valueIsDefined ? (entry[field] === value)   : true) &&
                 (sinceIsDefined ? (entry.timestamp >= since) : true)))

        if (limit !== undefined && limit !== null)
            array = Object.values (array).slice (0, limit)

        return array
    }

    filterBySymbolSinceLimit (array, symbol = undefined, since = undefined, limit = undefined) {
        return this.filterByValueSinceLimit (array, 'symbol', symbol, since, limit)
    }

    filterByCurrencySinceLimit (array, code = undefined, since = undefined, limit = undefined) {
        return this.filterByValueSinceLimit (array, 'currency', code, since, limit)
    }

    filterByArray (objects, key, values = undefined, indexed = true) {

        objects = Object.values (objects)

        // return all of them if no values were passed
        if (values === undefined || values === null)
            return indexed ? indexBy (objects, key) : objects

        const result = []
        for (let i = 0; i < objects.length; i++) {
            if (values.includes (objects[i][key]))
                result.push (objects[i])
        }

        return indexed ? indexBy (result, key) : result
    }

    parseTrades (trades, market = undefined, since = undefined, limit = undefined, params = {}) {
        // this code is commented out temporarily to catch for exchange-specific errors
        // if (!this.isArray (trades)) {
        //     throw new ExchangeError (this.id + ' parseTrades expected an array in the trades argument, but got ' + typeof trades);
        // }
        let result = Object.values (trades || []).map (trade => this.extend (this.parseTrade (trade, market), params))
        result = sortBy (result, 'timestamp')
        const symbol = (market !== undefined) ? market['symbol'] : undefined
        return this.filterBySymbolSinceLimit (result, symbol, since, limit)
    }

    parseTransactions (transactions, currency = undefined, since = undefined, limit = undefined, params = {}) {
        // this code is commented out temporarily to catch for exchange-specific errors
        // if (!this.isArray (transactions)) {
        //     throw new ExchangeError (this.id + ' parseTransactions expected an array in the transactions argument, but got ' + typeof transactions);
        // }
        let result = Object.values (transactions || []).map (transaction => this.extend (this.parseTransaction (transaction, currency), params))
        result = this.sortBy (result, 'timestamp');
        const code = (currency !== undefined) ? currency['code'] : undefined;
        return this.filterByCurrencySinceLimit (result, code, since, limit);
    }

    parseLedger (data, currency = undefined, since = undefined, limit = undefined, params = {}) {
        let result = [];
        const array = Object.values (data || []);
        for (let i = 0; i < array.length; i++) {
            result.push (this.extend (this.parseLedgerEntry (array[i], currency), params));
        }
        result = this.sortBy (result, 'timestamp');
        const code = (currency !== undefined) ? currency['code'] : undefined;
        return this.filterByCurrencySinceLimit (result, code, since, limit);
    }

    parseOrders (orders, market = undefined, since = undefined, limit = undefined, params = {}) {
        // this code is commented out temporarily to catch for exchange-specific errors
        // if (!this.isArray (orders)) {
        //     throw new ExchangeError (this.id + ' parseOrders expected an array in the orders argument, but got ' + typeof orders);
        // }
        let result = Object.values (orders).map (order => this.extend (this.parseOrder (order, market), params))
        result = sortBy (result, 'timestamp')
        const symbol = (market !== undefined) ? market['symbol'] : undefined
        return this.filterBySymbolSinceLimit (result, symbol, since, limit)
    }

    safeCurrencyCode (currencyId, currency = undefined) {
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
        return code
    }

    filterBySymbol (array, symbol = undefined) {
        return ((symbol !== undefined) ? array.filter (entry => entry.symbol === symbol) : array)
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return Array.isArray (ohlcv) ? ohlcv.slice (0, 6) : ohlcv
    }

    parseOHLCVs (ohlcvs, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
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
        return this.sortBy (result, 0)
    }

    editLimitBuyOrder (id, symbol, ...args) {
        return this.editLimitOrder (id, symbol, 'buy', ...args)
    }

    editLimitSellOrder (id, symbol, ...args) {
        return this.editLimitOrder (id, symbol, 'sell', ...args)
    }

    editLimitOrder (id, symbol, ...args) {
        return this.editOrder (id, symbol, 'limit', ...args)
    }

    async editOrder (id, symbol, ...args) {
        if (!this.enableRateLimit)
            throw new ExchangeError (this.id + ' editOrder() requires enableRateLimit = true')
        await this.cancelOrder (id, symbol);
        return this.createOrder (symbol, ...args)
    }

    createLimitOrder (symbol, ...args) {
        return this.createOrder (symbol, 'limit', ...args)
    }

    createMarketOrder (symbol, ...args) {
        return this.createOrder (symbol, 'market', ...args)
    }

    createLimitBuyOrder (symbol, ...args) {
        return this.createOrder  (symbol, 'limit', 'buy', ...args)
    }

    createLimitSellOrder (symbol, ...args) {
        return this.createOrder (symbol, 'limit', 'sell', ...args)
    }

    createMarketBuyOrder (symbol, amount, params = {}) {
        return this.createOrder (symbol, 'market', 'buy', amount, undefined, params)
    }

    createMarketSellOrder (symbol, amount, params = {}) {
        return this.createOrder (symbol, 'market', 'sell', amount, undefined, params)
    }

    costToPrecision (symbol, cost) {
        return decimalToPrecision (cost, ROUND, this.markets[symbol].precision.price, this.precisionMode)
    }

    priceToPrecision (symbol, price) {
        return decimalToPrecision (price, ROUND, this.markets[symbol].precision.price, this.precisionMode)
    }

    amountToPrecision (symbol, amount) {
        return decimalToPrecision (amount, TRUNCATE, this.markets[symbol].precision.amount, this.precisionMode)
    }

    feeToPrecision (symbol, fee) {
        return decimalToPrecision (fee, ROUND, this.markets[symbol].precision.price, this.precisionMode)
    }

    currencyToPrecision (currency, fee) {
        return this.decimalToPrecision (fee, ROUND, this.currencies[currency]['precision'], this.precisionMode);
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol]
        const rate = market[takerOrMaker]
        const cost = parseFloat (this.costToPrecision (symbol, amount * price))
        return {
            'type': takerOrMaker,
            'currency': market['quote'],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, rate * cost)),
        }
    }

    mdy (timestamp, infix = '-') {
        infix = infix || ''
        const date = new Date (timestamp)
        const Y = date.getUTCFullYear ().toString ()
        let m = date.getUTCMonth () + 1
        let d = date.getUTCDate ()
        m = m < 10 ? ('0' + m) : m.toString ()
        d = d < 10 ? ('0' + d) : d.toString ()
        return m + infix + d + infix + Y
    }

    ymd (timestamp, infix = '-') {
        infix = infix || ''
        const date = new Date (timestamp)
        const Y = date.getUTCFullYear ().toString ()
        let m = date.getUTCMonth () + 1
        let d = date.getUTCDate ()
        m = m < 10 ? ('0' + m) : m.toString ()
        d = d < 10 ? ('0' + d) : d.toString ()
        return Y + infix + m + infix + d
    }

    ymdhms (timestamp, infix = ' ') {
        const date = new Date (timestamp)
        const Y = date.getUTCFullYear ()
        let m = date.getUTCMonth () + 1
        let d = date.getUTCDate ()
        let H = date.getUTCHours ()
        let M = date.getUTCMinutes ()
        let S = date.getUTCSeconds ()
        m = m < 10 ? ('0' + m) : m
        d = d < 10 ? ('0' + d) : d
        H = H < 10 ? ('0' + H) : H
        M = M < 10 ? ('0' + M) : M
        S = S < 10 ? ('0' + S) : S
        return Y + '-' + m + '-' + d + infix + H + ':' + M + ':' + S
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
        return this.safeValue (units, unit)
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
        return this.safeValue (units, decimals)
    }

    fromWei (amount, unit = 'ether', decimals = 18) {
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

    toWei (amount, unit = 'ether', decimals = 18) {
        if (amount === undefined) {
            return amount
        }
        if (decimals !== 18) {
            amount = new BigNumber (this.numberToString (amount)).div (new BigNumber (10 ** (18 - decimals))).toFixed ()
        } else {
            amount = this.numberToString (amount)
        }
        return this.web3.utils.toWei (amount, unit)
    }

    decryptAccountFromJson (json, password) {
        return this.decryptAccount ((typeof json === 'string') ? JSON.parse (json) : json, password)
    }

    decryptAccount (key, password) {
        return this.web3.eth.accounts.decrypt (key, password)
    }

    decryptAccountFromPrivateKey (privateKey) {
        return this.web3.eth.accounts.privateKeyToAccount (privateKey)
    }

    soliditySha3 (array) {
        const values = this.solidityValues (array);
        const types = this.solidityTypes (values);
        return '0x' +  ethAbi.soliditySHA3 (types, values).toString ('hex')
    }

    soliditySha256 (array) {
        const values = this.solidityValues (array);
        const types = this.solidityTypes (values);
        return '0x' +  ethAbi.soliditySHA256 (types, values).toString ('hex')
    }

    solidityTypes (array) {
        return array.map (value => (this.web3.utils.isAddress (value) ? 'address' : 'uint256'))
    }

    solidityValues (array) {
        return array.map (value => (this.web3.utils.isAddress (value) ? value : (new BigNumber (value).toFixed ())))
    }

    getZeroExOrderHash (order) {
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

    getZeroExOrderHashV2 (order) {
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

    signZeroExOrder (order, privateKey) {
        const orderHash = this.getZeroExOrderHash (order);
        const signature = this.signMessage (orderHash, privateKey);
        return this.extend (order, {
            'orderHash': orderHash,
            'ecSignature': signature, // todo fix v if needed
        })
    }

    signZeroExOrderV2 (order, privateKey) {
        const orderHash = this.getZeroExOrderHashV2 (order);
        const signature = this.signMessage (orderHash, privateKey);
        return this.extend (order, {
            'orderHash': orderHash,
            'signature': this.convertECSignatureToSignatureHex (signature),
        })
    }

    convertECSignatureToSignatureHex (signature) {
        // https://github.com/0xProject/0x-monorepo/blob/development/packages/order-utils/src/signature_utils.ts
        let v = signature.v;
        if (v !== 27 && v !== 28) {
            v = v + 27;
        }
        const signatureBuffer = Buffer.concat ([
            ethUtil.toBuffer (v),
            ethUtil.toBuffer (signature.r),
            ethUtil.toBuffer (signature.s)
        ])
        return '0x' + signatureBuffer.toString ('hex') + '03';
    }

    hashMessage (message) {
        return this.web3.eth.accounts.hashMessage (message)
    }

    // works with Node only
    signHash (hash, privateKey) {
        const signature = ethUtil.ecsign (Buffer.from (hash.slice (-64), 'hex'), Buffer.from (privateKey.slice (-64), 'hex'))
        return {
            v: signature.v, // integer
            r: '0x' + signature.r.toString ('hex'), // '0x'-prefixed hex string
            s: '0x' + signature.s.toString ('hex'), // '0x'-prefixed hex string
        }
    }

    signMessage (message, privateKey) {
        //
        // The following comment is related to MetaMask, we use the upper type of signature prefix:
        //
        // z.ecSignOrderHashAsync ('0xcfdb0a485324ff37699b4c8557f6858f25916fc6fce5993b32fe018aea510b9f',
        //                         '0x731fc101bbe102221c91c31ed0489f1ddfc439a3', {
        //                              prefixType: 'ETH_SIGN',
        //                              shouldAddPrefixBeforeCallingEthSign: true
        //                          }).then ((e, r) => console.log (e,r))
        //
        //     {                            ↓
        //         v: 28,
        //         r: "0xea7a68268b47c48d5d7a4c900e6f9af0015bf70951b3db2f1d835c5d544aaec2",
        //         s: "0x5d1db2a060c955c1fde4c967237b995c2361097405407b33c6046c8aeb3ccbdf"
        //     }
        //
        // --------------------------------------------------------------------
        //
        // z.ecSignOrderHashAsync ('0xcfdb0a485324ff37699b4c8557f6858f25916fc6fce5993b32fe018aea510b9f',
        //                         '0x731fc101bbe102221c91c31ed0489f1ddfc439a3', {
        //                              prefixType: 'NONE',
        //                              shouldAddPrefixBeforeCallingEthSign: true
        //                          }).then ((e, r) => console.log (e,r))
        //
        //     {                            ↓
        //         v: 27,
        //         r: "0xc8c710022c57de4f529d448e9b40517dd9bfb49ff1eb245f5856664b865d14a6",
        //         s: "0x0740bb21f4f094fbbdbafa903bb8f057f82e0c6e4fe65d19a1daed4ed97cd394"
        //     }
        //
        const signature = this.decryptAccountFromPrivateKey (privateKey).sign (message, privateKey.slice (-64))
        return {
            v: parseInt (signature.v.slice (2), 16), // integer
            r: signature.r, // '0x'-prefixed hex string
            s: signature.s, // '0x'-prefixed hex string
        }
    }

    signMessage2 (message, privateKey) {
        // an alternative to signMessage using ethUtil (ethereumjs-util) instead of web3
        return this.signHash (this.hashMessage (message), privateKey.slice (-64))
    }

    oath () {
        if (typeof this.twofa !== 'undefined') {
            return this.totp (this.twofa)
        } else {
            throw new ExchangeError (this.id + ' this.twofa has not been set')
        }
    }
}
