
"use strict";

/*  ------------------------------------------------------------------------ */

const functions = require ('./functions')
    , Market    = require ('./Market')

const {
    isNode
    , keys
    , values
    , deepExtend
    , extend
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
    , sleep
    , timeout
    , TimedOut
    , buildOHLCVC
    , decimalToPrecision } = functions

const {
    ExchangeError
    , InvalidAddress
    , NotSupported
    , AuthenticationError
    , DDoSProtection
    , RequestTimeout
    , ExchangeNotAvailable
    , NetworkError } = require ('./errors')

const { TRUNCATE, ROUND, DECIMAL_PLACES } = functions.precisionConstants

const defaultFetch = typeof (fetch) === "undefined" ? require ('fetch-ponyfill') ().fetch : fetch

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
}

const journal = undefined // isNode && require ('./journal') // stub until we get a better solution for Webpack and React

const EventEmitter = require('events')
const WebsocketConnection = require ('./websocket/websocket_connection')
const PusherLightConnection = require ('./websocket/pusherlight_connection')
const SocketIoLightConnection = require ('./websocket/socketiolight_connection')
var zlib = require('zlib');

/*  ------------------------------------------------------------------------ */

module.exports = class Exchange extends EventEmitter{

    getMarket (symbol) {

        if (!this.marketClasses)
            this.marketClasses = {}

        let marketClass = this.marketClasses[symbol]

        if (marketClass)
            return marketClass

        marketClass = new Market (this, symbol)
        this.marketClasses[symbol] = marketClass // only one Market instance per market
        return marketClass
    }

    describe () {
        return {
            'id': undefined,
            'name': undefined,
            'countries': undefined,
            'enableRateLimit': false,
            'rateLimit': 2000, // milliseconds = seconds * 1000
            'certified': false,
            'has': {
                'CORS': false,
                'publicAPI': true,
                'privateAPI': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createOrder': true,
                'createMarketOrder': true,
                'createLimitOrder': true,
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
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': 'emulated',
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': true,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
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
            'wsconf': undefined,
            'requiredCredentials': {
                'apiKey':     true,
                'secret':     true,
                'uid':        false,
                'login':      false,
                'password':   false,
                'twofa':      false, // 2-factor authentication (one-time password key)
                'privateKey': false, // a "0x"-prefixed hexstring private key for a wallet
                'walletAddress': false, // the wallet address "0x"-prefixed hexstring
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
            'parseJsonResponse': true, // whether a reply is required to be in JSON or not
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
        } // return
    } // describe ()

    constructor (userConfig = {}) {
        super();

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

        this.iso8601 = (timestamp) => {
            const _timestampNumber = parseInt (timestamp, 10);

            // undefined, null and lots of nasty non-numeric values yield NaN
            if (isNaN (_timestampNumber) || _timestampNumber < 0) {
                return undefined;
            }

            // last line of defence
            try {
                return new Date (_timestampNumber).toISOString ();
            } catch (e) {
                return undefined;
            }
        }

        this.parse8601 = (x) => {
            if (typeof x !== 'string' || !x) {
                return undefined;
            }

            if (x.match (/^[0-9]+$/)) {
                // a valid number in a string, not a date.
                return undefined;
            }

            if (x.indexOf ('-') < 0 || x.indexOf (':') < 0) { // no date can be without a dash and a colon
                return undefined;
            }

            // last line of defence
            try {
                const candidate = Date.parse (((x.indexOf ('+') >= 0) || (x.slice (-1) === 'Z')) ? x : (x + 'Z').replace (/\s(\d\d):/, 'T$1:'));
                if (isNaN (candidate)) {
                    return undefined;
                }
                return candidate;
            } catch (e) {
                return undefined;
            }
        }

        this.parseDate = (x) => {
            if (typeof x !== 'string' || !x) {
                return undefined;
            }

            if (x.indexOf ('GMT') >= 0) {
                try {
                    return Date.parse (x);
                } catch (e) {
                    return undefined;
                }
            }

            return this.parse8601 (x);
        }

        this.microseconds     = () => now () * 1000 // TODO: utilize performance.now for that purpose
        this.seconds          = () => Math.floor (now () / 1000)

        this.minFundingAddressLength = 1 // used in checkAddress
        this.substituteCommonCurrencyCodes = true  // reserved

        // do not delete this line, it is needed for users to be able to define their own fetchImplementation
        this.fetchImplementation = defaultFetch

        this.timeout       = 10000 // milliseconds
        this.verbose       = false
        this.debug         = false
        this.journal       = 'debug.json'
        this.userAgent     = undefined
        this.twofa         = false // two-factor authentication (2FA)

        this.apiKey        = undefined
        this.secret        = undefined
        this.uid           = undefined
        this.login         = undefined
        this.password      = undefined
        this.privateKey    = undefined // a "0x"-prefixed hexstring private key for a wallet
        this.walletAddress = undefined // a wallet address "0x"-prefixed hexstring

        this.balance     = {}
        this.orderbooks  = {}
        this.tickers     = {}
        this.orders      = {}
        this.trades      = {}
        this.transactions = {}

        this.requiresWeb3 = false

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

        this.websocketContexts = {};
        this.websocketDelayedConnections = {};

        this.initRestRateLimiter ()

        if (this.markets)
            this.setMarkets (this.markets)

        if (this.debug && journal) {
            journal (() => this.journal, this, Object.keys (this.has))
        }

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

    checkRequiredCredentials () {
        Object.keys (this.requiredCredentials).forEach ((key) => {
            if (this.requiredCredentials[key] && !this[key])
                throw new AuthenticationError (this.id + ' requires `' + key + '`')
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

            if (url.indexOf ('http://') < 0) {
                params['agent'] = this.agent || null;
            }

            let promise =
                fetchImplementation (url, this.extend (params, this.fetchOptions))
                    .catch (e => {
                        if (isNode)
                            throw new ExchangeNotAvailable ([ this.id, method, url, e.type, e.message ].join (' '))
                        throw e // rethrow all unknown errors
                    })
                    .then (response => this.handleRestResponse (response, url, method, headers, body))

            return timeout (this.timeout, promise).catch (e => {
                if (e instanceof TimedOut)
                    throw new RequestTimeout (this.id + ' ' + method + ' ' + url + ' request timed out (' + this.timeout + ' ms)')
                throw e
            })
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

        let request = this.sign (path, type, method, params, headers, body)
        return this.fetch (request.url, request.method, request.headers, request.body)
    }

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        return this.fetch2 (path, type, method, params, headers, body)
    }

    parseJson (response, responseBody, url, method) {
        try {

            return (responseBody.length > 0) ? JSON.parse (responseBody) : {} // empty object for empty body

        } catch (e) {

            if (this.verbose)
                console.log ('parseJson:\n', this.id, method, url, response.status, 'error', e, "response body:\n'" + responseBody + "'\n")

            let title = undefined
            let match = responseBody.match (/<title>([^<]+)/i)
            if (match)
                title = match[1].trim ();

            let maintenance = responseBody.match (/offline|busy|retry|wait|unavailable|maintain|maintenance|maintenancing/i)
            let ddosProtection = responseBody.match (/cloudflare|incapsula|overload|ddos/i)

            if (e instanceof SyntaxError) {

                let ExceptionClass = ExchangeNotAvailable
                let details = 'not accessible from this location at the moment'
                if (maintenance)
                    details = 'offline, on maintenance or unreachable from this location at the moment'
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

    handleErrors (statusCode, statusText, url, method, responseHeaders, responseBody, response = undefined) {
        // override me
    }

    defaultErrorHandler (response, responseBody, url, method) {
        let { status: code, statusText: reason } = response
        if ((code >= 200) && (code <= 299))
            return
        let error = undefined
        let details = responseBody
        let match = responseBody.match (/<title>([^<]+)/i)
        if (match)
            details = match[1].trim ();
        error = this.httpExceptions[code.toString ()] || ExchangeError
        if (error === ExchangeNotAvailable) {
            if (responseBody.match (/cloudflare|incapsula|overload|ddos/i)) {
                error = DDoSProtection
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
        throw new error ([ this.id, method, url, code, reason, details ].join (' '))
    }

    parseIfJsonEncodedObject (input) {
        return (this.isJsonEncodedObject (input) ? JSON.parse (input) : input)
    }

    isJsonEncodedObject (object) {
        return ((typeof object === 'string') &&
                (object.length >= 2) &&
                ((object[0] === '{') || (object[0] === '[')))
    }

    getResponseHeaders (response) {
        let result = {}
        response.headers.forEach ((value, key) => {
            key = key.split ('-').map (word => capitalize (word)).join ('-')
            result[key] = value
        })
        return result
    }

    handleRestResponse (response, url, method = 'GET', requestHeaders = undefined, requestBody = undefined) {

        return response.text ().then ((responseBody) => {

            let jsonRequired = this.parseJsonResponse && !this.skipJsonOnStatusCodes.includes (response.status)
            let json = jsonRequired ? this.parseJson (response, responseBody, url, method) : undefined

            let responseHeaders = this.getResponseHeaders (response)

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

            const args = [ response.status, response.statusText, url, method, responseHeaders, responseBody, json ]
            this.handleErrors (...args)
            this.defaultErrorHandler (response, responseBody, url, method)

            return jsonRequired ? json : responseBody
        })
    }

    setMarkets (markets, currencies = undefined) {
        let values = Object.values (markets).map (market => deepExtend ({
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
        const markets = await this.fetchMarkets (params)
        let currencies = undefined
        if (this.has.fetchCurrencies) {
            currencies = await this.fetchCurrencies ()
        }
        return this.setMarkets (markets, currencies)
    }

    fetchBidsAsks (symbols = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchBidsAsks not supported yet')
    }

    async fetchOHLCVC (symbol, timeframe = '1m', since = undefined, limits = undefined, params = {}) {
        if (!this.has['fetchTrades'])
            throw new NotSupported (this.id + ' fetchOHLCV() not supported yet')
        await this.loadMarkets ()
        let trades = await this.fetchTrades (symbol, since, limits, params)
        let ohlcvc = buildOHLCVC (trades, timeframe, since, limits)
        return ohlcvc
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limits = undefined, params = {}) {
        if (!this.has['fetchTrades'])
            throw new NotSupported (this.id + ' fetchOHLCV() not supported yet')
        await this.loadMarkets ()
        let trades = await this.fetchTrades (symbol, since, limits, params)
        let ohlcvc = buildOHLCVC (trades, timeframe, since, limits)
        return ohlcvc.map (c => c.slice (0, -1))
    }

    parseTradingViewOHLCV (ohlcvs, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        let result = this.convertTradingViewToOHLCV (ohlcvs);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    convertTradingViewToOHLCV (ohlcvs) {
        let result = [];
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
        let result = {
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
        let order = await this.fetchOrder (id, symbol, params);
        return order['status'];
    }

    account () {
        return {
            'free': 0.0,
            'used': 0.0,
            'total': 0.0,
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

        let currencyIds = {}
        let distinct = Object.keys (this.commonCurrencies)
        for (let i = 0; i < distinct.length; i++) {
            let k = distinct[i]
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
        let market = this.market (symbol);
        return (market !== undefined ? market['id'] : symbol)
    }

    marketIds (symbols) {
        return symbols.map (symbol => this.marketId (symbol));
    }

    symbol (symbol) {
        return this.market (symbol).symbol || symbol
    }

    extractParams (string) {
        let re = /{([\w-]+)}/g
        let matches = []
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
        let query = this.omit (params, this.extractParams (path))
        if (Object.keys (query).length)
            result += '?' + this.urlencode (query)
        return result
    }

    parseBidAsk (bidask, priceKey = 0, amountKey = 1) {
        let price = parseFloat (bidask[priceKey])
        let amount = parseFloat (bidask[amountKey])
        return [ price, amount ]
    }

    parseBidsAsks (bidasks, priceKey = 0, amountKey = 1) {
        return Object.values (bidasks || []).map (bidask => this.parseBidAsk (bidask, priceKey, amountKey))
    }

    async fetchL2OrderBook (symbol, limit = undefined, params = {}) {
        let orderbook = await this.fetchOrderBook (symbol, limit, params)
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
            let symbol = order['symbol'];
            let market = this.markets[symbol];
            let remaining = order['remaining']
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

        currencies.forEach ((currency) => {

            if (balance[currency].free !== undefined && balance[currency].used === undefined) {
                // exchange reports only 'free' balance -> try to derive 'used' funds from open orders cache

                if (this.dontGetUsedBalanceFromStaleCache && ('open_orders' in balance['info'])) {
                    // liqui exchange reports number of open orders with balance response
                    // use it to validate the cache
                    const exchangeOrdersCount = balance['info']['open_orders'];
                    const cachedOrdersCount = Object.values (this.orders).filter (order => (order['status'] === 'open')).length;
                    if (cachedOrdersCount === exchangeOrdersCount) {
                        balance[currency].used = this.getCurrencyUsedOnOpenOrders (currency)
                        balance[currency].total = (balance[currency].used || 0) + (balance[currency].free || 0)
                    }
                } else {
                    balance[currency].used = this.getCurrencyUsedOnOpenOrders (currency)
                    balance[currency].total = (balance[currency].used || 0) + (balance[currency].free || 0)
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
        let balance = await this.fetchBalance (params)
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

    async loadTradingLimits (symbols = undefined, reload = false, params = {}) {
        if (this.has['fetchTradingLimits']) {
            if (reload || !('limitsLoaded' in this.options)) {
                let response = await this.fetchTradingLimits (symbols);
                for (let i = 0; i < symbols.length; i++) {
                    let symbol = symbols[i];
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

        let result = []
        for (let i = 0; i < objects.length; i++) {
            if (values.includes (objects[i][key]))
                result.push (objects[i])
        }

        return indexed ? indexBy (result, key) : result
    }

    parseTrades (trades, market = undefined, since = undefined, limit = undefined) {
        // this code is commented out temporarily to catch for exchange-specific errors
        // if (!this.isArray (trades)) {
        //     throw new ExchangeError (this.id + ' parseTrades expected an array in the trades argument, but got ' + typeof trades);
        // }
        let result = Object.values (trades || []).map (trade => this.parseTrade (trade, market))
        result = sortBy (result, 'timestamp')
        let symbol = (market !== undefined) ? market['symbol'] : undefined
        return this.filterBySymbolSinceLimit (result, symbol, since, limit)
    }

    parseTransactions (transactions, currency = undefined, since = undefined, limit = undefined) {
        // this code is commented out temporarily to catch for exchange-specific errors
        // if (!this.isArray (transactions)) {
        //     throw new ExchangeError (this.id + ' parseTransactions expected an array in the transactions argument, but got ' + typeof transactions);
        // }
        let result = Object.values (transactions || []).map (transaction => this.parseTransaction (transaction, currency))
        result = this.sortBy (result, 'timestamp');
        let code = (currency !== undefined) ? currency['code'] : undefined;
        return this.filterByCurrencySinceLimit (result, code, since, limit);
    }

    parseOrders (orders, market = undefined, since = undefined, limit = undefined) {
        // this code is commented out temporarily to catch for exchange-specific errors
        // if (!this.isArray (orders)) {
        //     throw new ExchangeError (this.id + ' parseOrders expected an array in the orders argument, but got ' + typeof orders);
        // }
        let result = Object.values (orders).map (order => this.parseOrder (order, market))
        result = sortBy (result, 'timestamp')
        let symbol = (market !== undefined) ? market['symbol'] : undefined
        return this.filterBySymbolSinceLimit (result, symbol, since, limit)
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
        let result = []
        for (let i = 0; i < ohlcvs.length; i++) {
            if (limit && (result.length >= limit))
                break;
            let ohlcv = this.parseOHLCV (ohlcvs[i], market, timeframe, since, limit)
            if (since && (ohlcv[0] < since))
                continue
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
        let market = this.markets[symbol]
        let rate = market[takerOrMaker]
        let cost = parseFloat (this.costToPrecision (symbol, amount * price))
        return {
            'type': takerOrMaker,
            'currency': market['quote'],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, rate * cost)),
        }
    }

    mdy (timestamp, infix = '-') {
        infix = infix || ''
        let date = new Date (timestamp)
        let Y = date.getUTCFullYear ().toString ()
        let m = date.getUTCMonth () + 1
        let d = date.getUTCDate ()
        m = m < 10 ? ('0' + m) : m.toString ()
        d = d < 10 ? ('0' + d) : d.toString ()
        return m + infix + d + infix + Y
    }

    ymd (timestamp, infix = '-') {
        infix = infix || ''
        let date = new Date (timestamp)
        let Y = date.getUTCFullYear ().toString ()
        let m = date.getUTCMonth () + 1
        let d = date.getUTCDate ()
        m = m < 10 ? ('0' + m) : m.toString ()
        d = d < 10 ? ('0' + d) : d.toString ()
        return Y + infix + m + infix + d
    }

    ymdhms (timestamp, infix = ' ') {
        let date = new Date (timestamp)
        let Y = date.getUTCFullYear ()
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

    checkRequiredDependencies () {
        if (!Web3 || !ethUtil || !ethAbi || !BigNumber) {
            throw new ExchangeError ('The following npm modules are required:\nnpm install web3 ethereumjs-util ethereumjs-abi bignumber.js --no-save');
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

    signZeroExOrder (order, privateKey) {
        const orderHash = this.getZeroExOrderHash (order);
        const signature = this.signMessage (orderHash, privateKey);
        return this.extend (order, {
            'orderHash': orderHash,
            'ecSignature': signature, // todo fix v if needed
        })
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

    // --------------------------------------------------------
    // websocket methods
    searchIndexToInsertOrUpdate (value, orderedArray, key, descending = false) {
        let i;
        let direction = descending ? -1 : 1;
        let compare = (a, b) =>
                ((a < b) ? -direction :
                ((a > b) ?  direction : 0));
        for (i = 0; i < orderedArray.length; i++) {
            if (compare (orderedArray[i][key], value) >= 0) {
                return i;
            }
        }
        return i;
    }
    updateBidAsk (bidAsk, currentBidsAsks, bids = false) {
        // insert or replace ordered
        let index = this.searchIndexToInsertOrUpdate (bidAsk[0], currentBidsAsks, 0, bids);
        if ((index < currentBidsAsks.length) && (currentBidsAsks[index][0] === bidAsk[0])){
            // found
            if (bidAsk[1] === 0) {
                // remove
                currentBidsAsks.splice (index, 1);
            } else {
                // update
                currentBidsAsks[index] = bidAsk;
            }
        } else {
            if (bidAsk[1] !== 0) {
                // insert
                currentBidsAsks.splice (index, 0, bidAsk);
            }
        }
    }

    updateBidAskDiff (bidAsk, currentBidsAsks, bids = false) {
        // insert or replace ordered
        let index = this.searchIndexToInsertOrUpdate (bidAsk[0], currentBidsAsks, 0, bids);
        if ((index < currentBidsAsks.length) && (currentBidsAsks[index][0] === bidAsk[0])){
            // found
            let nextValue = currentBidsAsks[index][1] + bidAsk[1];
            if (nextValue === 0) {
                // remove
                currentBidsAsks.splice (index, 1);
            } else {
                // update
                currentBidsAsks[index][1] = nextValue;
            }
        } else {
            if (bidAsk[1] !== 0) {
                // insert
                currentBidsAsks.splice (index, 0, bidAsk);
            }
        }
    }

    mergeOrderBookDelta (currentOrderBook, orderbook, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1) {
        let bids = (bidsKey in orderbook) ? this.parseBidsAsks (orderbook[bidsKey], priceKey, amountKey) : [];
        bids.forEach ((bid) => this.updateBidAsk (bid, currentOrderBook.bids, true));
        let asks = (asksKey in orderbook) ? this.parseBidsAsks (orderbook[asksKey], priceKey, amountKey) : [];
        asks.forEach ((ask) => this.updateBidAsk (ask, currentOrderBook.asks, false));
        currentOrderBook.timestamp = timestamp;
        currentOrderBook.datetime = (typeof timestamp !== 'undefined') ? this.iso8601 (timestamp) : undefined;
        return currentOrderBook;
    }

    mergeOrderBookDeltaDiff (currentOrderBook, orderbook, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1) {
        let bids = (bidsKey in orderbook) ? this.parseBidsAsks (orderbook[bidsKey], priceKey, amountKey) : [];
        bids.forEach ((bid) => this.updateBidAskDiff (bid, currentOrderBook.bids, true));
        let asks = (asksKey in orderbook) ? this.parseBidsAsks (orderbook[asksKey], priceKey, amountKey) : [];
        asks.forEach ((ask) => this.updateBidAskDiff (ask, currentOrderBook.asks, false));
        currentOrderBook.timestamp = timestamp;
        currentOrderBook.datetime = (typeof timestamp !== 'undefined') ? this.iso8601 (timestamp) : undefined;
        return currentOrderBook;
    }

    _websocketContextGetSubscribedEventSymbols (conxid) {
        let ret = [];
        let events = this._contextGetEvents(conxid);
        for (let key in events) {
            for (let symbol in events[key]) {
                let symbolContext = events[key][symbol];
                if ((symbolContext['subscribed']) ||(symbolContext['subscribing'])){
                    ret.push ({
                        'event': key,
                        'symbol': symbol,
                    });
                }
            }
        }
        return ret;
    }

    _websocketValidEvent (event) {
        return (typeof this.wsconf['events'] !== undefined) && (event in this.wsconf['events']);
    }

    _websocketResetContext (conxid, conxtpl = undefined) {
        if (!(conxid in this.websocketContexts)) {
            this.websocketContexts[conxid] = {
                '_': {},
                'conx-tpl': conxtpl,
                'events': {},
                'conx': undefined,
            };
        } else {
            let events = this._contextGetEvents(conxid);
            for (let key in events) {
                for (let symbol in events[key]) {
                    let symbolContext = events[key][symbol];
                    symbolContext['subscribed'] = false;
                    symbolContext['subscribing'] = false;
                    symbolContext['data'] = {};
                }
            }
        }
    }

    _contextGetConxTpl(conxid) {
        return this.websocketContexts[conxid]['conx-tpl'];
    }

    _contextGetConnection(conxid) {
        if (this.websocketContexts[conxid]['conx'] === undefined){
            return null;
        }
        return this.websocketContexts[conxid]['conx']['conx'];
    }

    _contextGetConnectionInfo (conxid) {
        if (this.websocketContexts[conxid]['conx'] === undefined){
            throw new NotSupported ("websocket <" + conxid + "> not found in this exchange: " + this.id);
        }
        return this.websocketContexts[conxid]['conx'];
    }

    _contextIsConnectionReady(conxid) {
        return this.websocketContexts[conxid]['conx']['ready'];
    }

    _contextSetConnectionReady(conxid, ready) {
        this.websocketContexts[conxid]['conx']['ready'] = ready;
    }

    _contextIsConnectionAuth(conxid) {
        return this.websocketContexts[conxid]['conx']['auth'];
    }

    _contextSetConnectionAuth(conxid, auth) {
        this.websocketContexts[conxid]['conx']['auth'] = auth;
    }

    _contextSetConnectionInfo(conxid, info) {
        this.websocketContexts[conxid]['conx'] = info;
    }

    _contextSet (conxid, key, data) {
        this.websocketContexts[conxid]['_'][key] = data;
    }

    _contextGet (conxid, key) {
        return this.websocketContexts[conxid]['_'][key];
    }

    _contextGetEvents(conxid) {
        return this.websocketContexts[conxid]['events'];
    }

    _contextGetSymbols(conxid, event){
        return this.websocketContexts[conxid]['events'][event];
    }

    _contextResetEvent(conxid, event) {
        this.websocketContexts[conxid]['events'][event] = {};
    }

    _contextResetSymbol(conxid, event, symbol) {
        this.websocketContexts[conxid]['events'][event][symbol] = {
            'subscribed': false,
            'subscribing': false,
            'data': {},
        };
    }

    _contextGetSymbolData(conxid, event, symbol) {
        return this.websocketContexts[conxid]['events'][event][symbol]['data'];
    }

    _contextSetSymbolData(conxid, event, symbol, data){
        this.websocketContexts[conxid]['events'][event][symbol]['data'] = data;
    }

    _contextSetSubscribed (conxid, event, symbol, subscribed) {
        this.websocketContexts[conxid]['events'][event][symbol]['subscribed'] = subscribed;
    }

    _contextIsSubscribed (conxid, event, symbol) {
        return (typeof this.websocketContexts[conxid]['events'][event] !== 'undefined') && 
            (typeof this.websocketContexts[conxid]['events'][event][symbol] !== 'undefined') && 
            this.websocketContexts[conxid]['events'][event][symbol]['subscribed'];
    }

    _contextSetSubscribing (conxid, event, symbol, subscribing) {
        this.websocketContexts[conxid]['events'][event][symbol]['subscribing'] = subscribing;
    }

    _contextIsSubscribing (conxid, event, symbol) {
        return (typeof this.websocketContexts[conxid]['events'][event] !== 'undefined') && 
            (typeof this.websocketContexts[conxid]['events'][event][symbol] !== 'undefined') && 
            this.websocketContexts[conxid]['events'][event][symbol]['subscribing'];
    }

    _websocketGetConxid4Event (event, symbol) {
        let eventConf = this.safeValue(this.wsconf['events'], event);
        let conxParam = this.safeValue (eventConf, 'conx-param', {
            'id': '{id}'
        });
        return {
            'conxid' : this.implodeParams (conxParam['id'], { 
                'event': event,
                'symbol': symbol,
                'id': eventConf['conx-tpl']
            }),
            'conxtpl' : eventConf['conx-tpl']
        };
    }

    _websocketGetActionForEvent(conxid, event, symbol, subscription=true, subscriptionParams = {}){
        // if subscription and still subscribed no action returned
        //let sym = undefined;
        //if ((event in this.websocketContext[conxid]) && (symbol in this.websocketContext[conxid][event])){
        //    sym = this.websocketContext[event][symbol];
        //}
        let isSubscribed = this._contextIsSubscribed(conxid, event, symbol);
        let isSubscribing = this._contextIsSubscribing(conxid, event, symbol);
        if (subscription && (isSubscribed || isSubscribing)) {
            return null;
        }
        // if unsubscription and no subscribed and no subscribing no action returned
        if (!subscription && (!isSubscribed && !isSubscribing)) {
            return null;
        }
        // get conexion type for event
        let eventConf = this.safeValue(this.wsconf['events'], event);
        if (eventConf === undefined) {
            throw new ExchangeError ("invalid websocket configuration for event: " + event + " in exchange: " + this.id);
        }
        let conxTplName = this.safeString (eventConf, 'conx-tpl', 'default');
        let conxTpl = this.safeValue(this.wsconf['conx-tpls'], conxTplName);
        if (conxTpl === undefined) {
            throw new ExchangeError ("tpl websocket conexion: " + conxTplName + " does not exist in exchange: " + this.id);
        }
        let conxParam = this.safeValue (eventConf, 'conx-param', {
            'url': '{baseurl}',
            'id': '{id}',
            'stream': '{symbol}',
        });
        let params = extend ({}, conxTpl, {
            'event': event,
            'symbol': symbol,
            'id': conxTplName,
        });
        let config = extend ({}, conxTpl);
        for (let key in conxParam) {
            config[key] = this.implodeParams (conxParam[key], params);
        }
        if (!(('id' in config) && ('url' in config) && ('type' in config))) {
            throw new ExchangeError ("invalid websocket configuration in exchange: " + this.id);
        }
        switch (config['type']){
            case 'ws-io':
                return {
                    'action': 'connect',
                    'conx-config': config,
                    'reset-context': 'onconnect',
                    'conx-tpl': conxTplName,
                };
            case 'pusher':
                return {
                    'action': 'connect',
                    'conx-config': config,
                    'reset-context': 'onconnect',
                    'conx-tpl': conxTplName,
                };
            case 'ws':
                return {
                    'action': 'connect',
                    'conx-config': config,
                    'reset-context': 'onconnect',
                    'conx-tpl': conxTplName,
                };
            case 'ws-s':
                let subscribed = this._websocketContextGetSubscribedEventSymbols(config['id']);
                if (subscription) {
                    subscribed.push ({
                        'event': event,
                        'symbol': symbol,
                    });
                    config ['url'] = this._websocketGenerateUrlStream (subscribed, config, subscriptionParams);
                    return {
                        'action': 'reconnect',
                        'conx-config': config,
                        'reset-context': 'onreconnect',
                        'conx-tpl': conxTplName,
                    };
                } else {
                    for (let i = 0; i < subscribed.length; i++) {
                        let element = subscribed[i];
                        if ((element['event'] === event) && (element['symbol'] === symbol)) {
                            subscribed.splice (i, 1);
                            break;
                        }
                    }
                    if (subscribed.length === 0) {
                        return {
                            'action': 'disconnect',
                            'conx-config': config,
                            'reset-context': 'always',
                            'conx-tpl': conxTplName,
                        };

                    } else {
                        config ['url'] = this._websocketGenerateUrlStream (subscribed, config, subscriptionParams);
                        return {
                            'action': 'reconnect',
                            'conx-config': config,
                            'reset-context': 'onreconnect',
                            'conx-tpl': conxTplName,
                        };
                    }
                }
             
            default:
                throw new NotSupported ("invalid websocket connection: " + config['type'] + " for exchange " + this.id);
        }
    }

    async _websocketEnsureConxActive (event, symbol, subscribe, subscriptionParams = {}, delayed = false) {
        let { conxid, conxtpl } = this._websocketGetConxid4Event (event, symbol);
        if (!(conxid in this.websocketContexts)) {
            this._websocketResetContext(conxid, conxtpl);
        }
        let action = this._websocketGetActionForEvent (conxid, event, symbol, subscribe, subscriptionParams);
        if (action !== null) {
            let conxConfig = this.safeValue (action, 'conx-config', {});
            conxConfig['verbose'] = this.verbose;
            if (!(event in this._contextGetEvents(conxid))) {
                this._contextResetEvent(conxid, event);
            }
            if (!(symbol in this._contextGetSymbols(conxid, event))){
                this._contextResetSymbol(conxid, event, symbol);
            }
            let conx;
            switch(action['action']){
                case 'reconnect':
                    conx = this._contextGetConnection(conxid);
                    if (conx != null){
                        conx.close();
                    }
                    if (!delayed){
                        if (action['reset-context'] === 'onreconnect') {
                            this._websocketResetContext(conxid, conxtpl);
                        }
                    }
                    this._contextSetConnectionInfo (conxid, this._websocketInitialize(conxConfig, conxid));
                    break;
                case 'connect':
                    conx = this._contextGetConnection(conxid);
                    if (conx != null){
                        if (conx.isActive()){
                            break;
                        }
                        conx.close();
                        this._websocketResetContext(conxid, conxtpl);
                    } else {
                        this._websocketResetContext(conxid, conxtpl);
                    }
                    this._contextSetConnectionInfo (conxid, this._websocketInitialize(conxConfig, conxid));
                    break;
                case 'disconnect':
                    conx = this._contextGetConnection(conxid);
                    if (conx != null) {
                        conx.close();
                        this._websocketResetContext(conxid, conxtpl);
                    }
                    if (delayed) {
                        // if not subscription in conxid remove from delayed
                        if (Object.keys(this.websocketDelayedConnections).includes (conxid)) {
                            this.omit (this.websocketDelayedConnections, conxid);
                        }
                    }
                    return conxid;
            }
            if (delayed) {
                if (!Object.keys(this.websocketDelayedConnections).includes (conxid)){
                    this.websocketDelayedConnections[conxid] = {
                        'conxtpl': conxtpl,
                        'reset': action['action'] != 'connect'
                    }
                }
            } else {
                await this.websocketConnect (conxid);
            }
        }
        return conxid;
    }

    async _websocketConnectDelayed() {
        for (const conxid of Object.keys (this.websocketDelayedConnections)) {
            try {
                if (this.websocketDelayedConnections[conxid]['reset']){
                    this._websocketResetContext(conxid, this.websocketDelayedConnections[conxid]['conxtpl']);
                }
                await this.websocketConnect(conxid);
            } catch (ex) {
            }
        }
        this.websocketDelayedConnections = {};
    }

    async websocketConnect (conxid = 'default') {
        let websocketConxInfo = this._contextGetConnectionInfo(conxid);
        let conxTpl = this._contextGetConxTpl (conxid);
        await this.loadMarkets();
        if (!websocketConxInfo['ready']) {
            let wait4readyEvent = this.safeString (this.wsconf['conx-tpls'][conxTpl], 'wait4readyEvent');
            if (wait4readyEvent != null){
                await new Promise(async (resolve, reject) => {
                    this.once (wait4readyEvent, (success, error) => {
                        if (success) {
                            websocketConxInfo['ready'] = true;
                            resolve();
                        } else {
                            reject(error);
                        }
                    });
                    websocketConxInfo['conx'].connect ();
                });
            } else {
                await websocketConxInfo['conx'].connect ();
            }
        }
    }

    websocketClose (conxid = 'default') {
        let websocketConxInfo = this._contextGetConnectionInfo(conxid);
        websocketConxInfo['conx'].close();
    }

    websocketSend (data, conxid = 'default') {
        let websocketConxInfo = this._contextGetConnectionInfo(conxid);
        websocketConxInfo['conx'].send(data);
    }

    websocketSendJson (data, conxid = 'default') {
        let websocketConxInfo = this._contextGetConnectionInfo(conxid);
        if (this.verbose)
            console.log (conxid + "->" + JSON.stringify(data));
        websocketConxInfo['conx'].sendJson(data);
    }

    _websocketInitialize (websocketConfig, conxid = 'default') {
        let websocketConnectionInfo = {
            'auth': false,
            'ready': false,
            'conx': null,
        };
        websocketConfig['agent'] = this.agent;
        switch (websocketConfig['type']){
            case 'ws-io':
                websocketConnectionInfo['conx'] = new SocketIoLightConnection (websocketConfig, this.timeout);
                break;
            case 'pusher':
                websocketConnectionInfo['conx'] = new PusherLightConnection (websocketConfig, this.timeout);
                break;
            case 'ws':
                websocketConnectionInfo['conx'] = new WebsocketConnection (websocketConfig, this.timeout);
                break;
            case 'ws-s':
                websocketConnectionInfo['conx'] = new WebsocketConnection (websocketConfig, this.timeout);
                break;
            default:
                throw new NotSupported ("invalid websocket connection: " + websocketConfig['type'] + " for exchange " + this.id);
        }
        websocketConnectionInfo['conx'].on ('open', () => {
            websocketConnectionInfo['auth'] = false;
            this._websocketOnOpen(conxid, websocketConnectionInfo['conx'].options);
        });
        websocketConnectionInfo['conx'].on ('err', (err) => {
            websocketConnectionInfo['auth'] = false;
            this._websocketOnError(conxid, err);
            this._websocketResetContext (conxid);
            this.emit ('err', new NetworkError (err), conxid);
        });
        websocketConnectionInfo['conx'].on ('message', (data) => {
            if (this.verbose)
                console.log (conxid + '<-' + data);
            try {
                this._websocketOnMessage (conxid, data);
            } catch (ex) {
                this.emit ('err', ex, conxid);
            }
        });
        websocketConnectionInfo['conx'].on ('close', () => {
            websocketConnectionInfo['auth'] = false;
            this._websocketOnClose(conxid);
            this._websocketResetContext (conxid);
            this.emit ('close', conxid);
        });

        return websocketConnectionInfo;
    }

    timeoutPromise (promise, scope) {
        return timeout (this.timeout, promise).catch (e => {
            if (e instanceof TimedOut)
                throw new RequestTimeout (this.id + ' ' + scope + ' request timed out (' + this.timeout + ' ms)');
            throw e;
        });
    }

    _cloneOrderBook (ob, limit = undefined) {
        let ret =  {
            'timestamp': ob.timestamp,
            'datetime': ob.datetime,
            'nonce': ob.nonce,
        };
        if (limit === undefined) {
            ret['bids'] = ob.bids.slice ();
            ret['asks'] = ob.asks.slice ();
        } else {
            ret['bids'] = ob.bids.slice (0, limit);
            ret['asks'] = ob.asks.slice (0, limit);            
        }
        return ret;
    }

    _executeAndCallback (contextId, method, params, callback, context = {}, thisParam = null) {
        try {
            thisParam = thisParam != null ? thisParam: this;
            let promise = this[method].apply (thisParam, params);
            let that = this;
            promise.then(function() {
                let args = [].slice.call(arguments);
                args.unshift(null);
                args.unshift(context);
                try {
                    thisParam[callback].apply (thisParam, args);
                } catch (ex) {
                    console.log (ex.stack);
                    that.emit ('err', new ExchangeError (that.id + ': error invoking method ' + callback + ' in _executeAndCallback: '+ ex), contextId);
                }
            }).catch(function(error) {
                try {
                    thisParam[callback].apply (thisParam, [context, error]);
                } catch (ex) {
                    console.log (ex.stack);
                    that.emit ('err', new ExchangeError (that.id + ': error invoking method ' + callback + ' in _executeAndCallback: '+ ex), contextId);
                }
            });
        } catch (ex) {
            console.log (ex.stack);
            that.emit ('err', new ExchangeError (that.id + ': error invoking method ' + method + ' in _executeAndCallback: '+ ex), contextId);
        }
    }

    websocketFetchOrderBook (symbol, limit = undefined) {
        return this.timeoutPromise (new Promise (async (resolve, reject) => {
            try {
                if (!this._websocketValidEvent('ob')) {
                    reject(new ExchangeError ('Not valid event ob for exchange ' + this.id));
                    return;
                }
                let conxid = await this._websocketEnsureConxActive ('ob', symbol, true);
                let ob = this._getCurrentWebsocketOrderbook (conxid, symbol, limit);
                if (typeof ob !== 'undefined') {
                    resolve (ob);
                    return;
                }
                let f = (symbolR, ob) => {
                    if (symbolR === symbol) {
                        this.removeListener ('ob', f);
                        resolve (this._getCurrentWebsocketOrderbook (conxid, symbol, limit));
                    }
                }
                this.on ('ob', f);
            } catch (ex) {
                reject (ex);
            }
        }), 'websocketFetchOrderBook');
    }

    async websocketSubscribe (event, symbol, params = {}) {
        // let promise = new Promise (async (resolve, reject) => {
        //     try {
        //         if (!this._websocketValidEvent(event)) {
        //             reject(new ExchangeError ('Not valid event ' + event + ' for exchange ' + this.id));
        //             return;
        //         }
        //         let conxid = await this._websocketEnsureConxActive (event, symbol, true, params);
        //         const oid = this.nonce();// + '-' + symbol + '-ob-subscribe';
        //         this.once (oid.toString(), (success, ex = null) => {
        //             if (success) {
        //                 this._contextSetSubscribed(conxid, event, symbol, true);
        //                 this._contextSetSubscribing(conxid, event, symbol, false);
        //                 resolve ();
        //             } else {
        //                 this._contextSetSubscribed(conxid, event, symbol, false);
        //                 this._contextSetSubscribing(conxid, event, symbol, false);
        //                 if (ex != null) {
        //                     reject (ex);
        //                 } else {
        //                     reject (new ExchangeError ('error subscribing to ' + event + '(' + symbol + ') ' + this.id));
        //                 }
        //             }
        //         });
        //         this._contextSetSubscribing(conxid, event, symbol, true);
        //         this._websocketSubscribe (conxid, event, symbol, oid, params);
        //     } catch (ex) {
        //         reject (ex);
        //     }
        // });
        // return this.timeoutPromise (promise, 'websocketSubscribe');
        await this.websocketSubscribeAll([{
            'event': event,
            'symbol': symbol,
            'params': params
        }]);
    }

    async websocketSubscribeAll (eventSymbols) {
        let promise = new Promise (async (resolve, reject) => {
            try {
                for (let eventSymbol of eventSymbols){
                    if (!this._websocketValidEvent(eventSymbol['event'])) {
                        reject(new ExchangeError ('Not valid event ' + eventSymbol['event'] + ' for exchange ' + this.id));
                        return;
                    }
                }
                let conxIds = [];
                for (let eventSymbol of eventSymbols){ 
                    let event = eventSymbol['event'];
                    let symbol = eventSymbol['symbol'];
                    let params = eventSymbol['params'];
                    let conxid = await this._websocketEnsureConxActive (event, symbol, true, params, true);
                    conxIds.push(conxid);
                    this._contextSetSubscribing(conxid, event, symbol, true);
                }
                // prepare all conxid
                await this._websocketConnectDelayed();
                for (let i = 0;i<eventSymbols.length; i++){
                    let conxid = conxIds[i];
                    let event = eventSymbols[i]['event'];
                    let symbol = eventSymbols[i]['symbol'];
                    let params = eventSymbols[i]['params'];
                    const oid = this.nonce();// + '-' + symbol + '-ob-subscribe';
                    this.once (oid.toString(), (success, ex = null) => {
                        if (success) {
                            this._contextSetSubscribed(conxid, event, symbol, true);
                            this._contextSetSubscribing(conxid, event, symbol, false);
                            resolve ();
                        } else {
                            this._contextSetSubscribed(conxid, event, symbol, false);
                            this._contextSetSubscribing(conxid, event, symbol, false);
                            if (ex != null) {
                                reject (ex);
                            } else {
                                reject (new ExchangeError ('error subscribing to ' + event + '(' + symbol + ') ' + this.id));
                            }
                        }
                    });
                    this._websocketSubscribe (conxid, event, symbol, oid, params);
                }
            } catch (ex) {
                reject (ex);
            }
        });
        return this.timeoutPromise (promise, 'websocketSubscribe');
    }

    async websocketUnsubscribe (event, symbol, params = {}) {
        // let promise = new Promise (async (resolve, reject) => {
        //     try {
        //         if (!this._websocketValidEvent(event)) {
        //             reject(new ExchangeError ('Not valid event ' + event + ' for exchange ' + this.id));
        //             return;
        //         }
        //         let conxid = await this._websocketEnsureConxActive (event, symbol, false);
        //         const oid = this.nonce();// + '-' + symbol + '-ob-subscribe';
        //         this.once (oid.toString(), (success, ex = null) => {
        //             if (success) {
        //                 this._contextSetSubscribed(conxid, event, symbol, false);
        //                 this._contextSetSubscribing(conxid, event, symbol, false);
        //                 resolve ();
        //             } else {
        //                 if (ex != null) {
        //                     reject (ex);
        //                 } else {
        //                     reject (new ExchangeError ('error unsubscribing to ' + event + '(' + symbol + ') ' + this.id));
        //                 }
        //             }
        //         });
        //         this._websocketUnsubscribe (conxid, event, symbol, oid,params);
        //     } catch (ex) {
        //         reject (ex);
        //     }
        // });
        // return this.timeoutPromise (promise, 'websocketUnsubscribe');
        await this.websocketUnsubscribeAll([{
            'event': event,
            'symbol': symbol,
            'params': params
        }]);
    }
    
    websocketUnsubscribeAll (eventSymbols) {
        let promise = new Promise (async (resolve, reject) => {
            try {
                for (let eventSymbol of eventSymbols){
                    if (!this._websocketValidEvent(eventSymbol['event'])) {
                        reject(new ExchangeError ('Not valid event ' + eventSymbol['event'] + ' for exchange ' + this.id));
                        return;
                    }
                }
                for (let eventSymbol of eventSymbols){ 
                    let event = eventSymbol['event'];
                    let symbol = eventSymbol['symbol'];
                    let params = eventSymbol['params'];

                    let conxid = await this._websocketEnsureConxActive (event, symbol, false);
                    const oid = this.nonce();// + '-' + symbol + '-ob-subscribe';
                    this.once (oid.toString(), (success, ex = null) => {
                        if (success) {
                            this._contextSetSubscribed(conxid, event, symbol, false);
                            this._contextSetSubscribing(conxid, event, symbol, false);
                            resolve ();
                        } else {
                            if (ex != null) {
                                reject (ex);
                            } else {
                                reject (new ExchangeError ('error unsubscribing to ' + event + '(' + symbol + ') ' + this.id));
                            }
                        }
                    });
                    this._websocketUnsubscribe (conxid, event, symbol, oid,params);
                }
            } catch (ex) {
                reject (ex);
            } finally {
                await this._websocketConnectDelayed();
            }
        });
        return this.timeoutPromise (promise, 'websocketUnsubscribe');
    }



    _websocketOnOpen (contextId, websocketConexConfig) {
    }

    _websocketOnMessage (contextId, data) {
    }

    _websocketOnClose (contextId) {
    }

    _websocketOnError (contextId) {
    }

    _websocketMarketId (symbol) {
        return this.marketId (symbol)
    }

    _websocketGenerateUrlStream (events, options, subscriptionParams) {
        throw new NotSupported ('You must implement _websocketGenerateUrlStream method for exchange ' + this.id);
    }

    _websocketSubscribe (contextId, event, symbol, nonce, params = {}) {
        throw new NotSupported ('subscribe ' + event + '(' + symbol + ') not supported for exchange ' + this.id);
    }

    _websocketUnsubscribe (contextId, event, symbol, nonce, params = {}) {
        throw new NotSupported ('unsubscribe ' + event + '(' + symbol + ') not supported for exchange ' + this.id);
    }

    _websocketMethodMap (key) {
        if ((this.wsconf['methodmap'] === undefined) || (this.wsconf['methodmap'][key] === undefined)){
            throw new ExchangeError (this.id + ': ' + key + ' not found in websocket methodmap')
        }
        return this.wsconf['methodmap'][key];
    }

    _setTimeout (contextId, mseconds, method, params, thisParam = null) {
        thisParam = thisParam != null ? thisParam: this;
        let that = this;
        return setTimeout (function () {
            try {
                thisParam[method].apply (thisParam, params);
            } catch (ex) {
                that.emit ('err', new ExchangeError (that.id + ': error invoking method ' + method + ' '+ ex), contextId);
            }
        }, mseconds);
    }

    _cancelTimeout (handle) {
        clearTimeout (handle);
    }

    _setTimer (contextId, mseconds, method, params, thisParam = null) {
        thisParam = thisParam != null ? thisParam: this;
        let that = this;
        return setInterval (function () {
            try {
                thisParam[method].apply (thisParam, params);
            } catch (ex) {
                that.emit ('err', new ExchangeError (that.id + ': error invoking method ' + method + ' '+ ex), contextId);
            }
        }, mseconds);
    }

    _cancelTimer (handle) {
        clearInterval (handle);
    }

    _getCurrentWebsocketOrderbook (contextId, symbol, limit) {
        throw new NotSupported ('You must implement _getCurrentWebsocketOrderbook method for exchange ' + this.id);
    }

    gunzip (data) {
        return zlib.gunzipSync (data).toString ();
    }
}
