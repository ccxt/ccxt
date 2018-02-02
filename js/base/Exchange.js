"use strict";

/*  ------------------------------------------------------------------------ */

const functions = require ('./functions')
    , Market    = require ('./Market')

const { isNode
      , keys
      , values
      , deepExtend
      , extend
      , flatten
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
      , TimedOut } = functions

const { ExchangeError
      , NotSupported
      , AuthenticationError
      , DDoSProtection
      , RequestTimeout
      , ExchangeNotAvailable } = require ('./errors')

const defaultFetch = isNode ? require ('fetch-ponyfill') ().fetch : fetch

const journal = undefined // isNode && require ('./journal') // stub until we get a better solution for Webpack and React

/*  ------------------------------------------------------------------------ */

module.exports = class Exchange {

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
            'has': {
                'CORS': false,
                'publicAPI': true,
                'privateAPI': true,
                'cancelOrder': true,
                'createDepositAddress': false,
                'createOrder': true,
                'deposit': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchFundingFees': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': true,
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
                'apiKey':   true,
                'secret':   true,
                'uid':      false,
                'login':    false,
                'password': false,
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
                    'withdraw': undefined,
                    'deposit': undefined,
                },
            },
            'parseJsonResponse': true, // whether a reply is required to be in JSON or not
            'skipJsonOnStatusCodes': [], // array of http status codes which override requirement for JSON response
            'exceptions': undefined,
            'parseBalanceFromOpenOrders': false, // some exchanges return balance updates from order API endpoints
        } // return
    } // describe ()

    constructor (userConfig = {}) {

        Object.assign (this, functions, { encode: string => string, decode: string => string })

        if (isNode)
            this.nodeVersion = process.version.match (/\d+\.\d+.\d+/)[0]

        // if (isNode) {
        //     this.userAgent = {
        //         'User-Agent': 'ccxt/' + Exchange.ccxtVersion +
        //             ' (+https://github.com/ccxt/ccxt)' +
        //             ' Node.js/' + this.nodeVersion + ' (JavaScript)'
        //     }
        // }

        this.options = {} // exchange-specific options, if any

        this.userAgents = {
            'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
            'chrome39': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
        }

        this.headers = {}

        // prepended to URL, like https://proxy.com/https://exchange.com/api...
        this.proxy = ''
        this.origin = '*' // CORS origin

        this.iso8601          = timestamp => new Date (timestamp).toISOString ()
        this.parse8601        = x => Date.parse (((x.indexOf ('+') >= 0) || (x.slice (-1) === 'Z')) ? x : (x + 'Z'))
        this.milliseconds     = now
        this.microseconds     = () => now () * 1000 // TODO: utilize performance.now for that purpose
        this.seconds          = () => Math.floor (now () / 1000)

        this.substituteCommonCurrencyCodes = true  // reserved

        // do not delete this line, it is needed for users to be able to define their own fetchImplementation
        this.fetchImplementation = defaultFetch

        this.timeout          = 10000 // milliseconds
        this.verbose          = false
        this.debug            = false
        this.journal          = 'debug.json'
        this.userAgent        = undefined
        this.twofa            = false // two-factor authentication (2FA)

        this.apiKey   = undefined
        this.secret   = undefined
        this.uid      = undefined
        this.login    = undefined
        this.password = undefined

        this.balance    = {}
        this.orderbooks = {}
        this.tickers    = {}
        this.orders     = {}
        this.trades     = {}

        this.last_http_response = undefined
        this.last_json_response = undefined

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

        if (this.debug && journal) {
            journal (() => this.journal, this, Object.keys (this.has))
        }
    }

    defaults () {
        return { /* override me */ }
    }

    nonce () {
        return this.seconds ()
    }

    encodeURIComponent (...args) {
        return encodeURIComponent (...args)
    }

    checkRequiredCredentials () {
        Object.keys (this.requiredCredentials).map (key => {
            if (this.requiredCredentials[key] && !this[key])
                throw new AuthenticationError (this.id + ' requires `' + key + '`')
        })
    }

    initRestRateLimiter () {

        const fetchImplementation = this.fetchImplementation

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

        this.executeRestRequest = function (url, method = 'GET', headers = undefined, body = undefined) {

            let promise =
                fetchImplementation (url, { method, headers, body, 'agent': this.tunnelAgent || null, timeout: this.timeout })
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

    parseJson (responseBody, url, method = 'GET') {
        try {

            return (responseBody.length > 0) ? JSON.parse (responseBody) : {} // empty object for empty body

        } catch (e) {

            if (this.verbose)
                console.log ('parseJson:\n', this.id, method, url, 'error', e, "response body:\n'" + responseBody + "'\n")

            let maintenance = responseBody.match (/offline|busy|retry|wait|unavailable|maintain|maintenance|maintenancing/i)
            let ddosProtection = responseBody.match (/cloudflare|incapsula|overload/i)

            if (e instanceof SyntaxError) {

                let error = ExchangeNotAvailable
                let details = 'not accessible from this location at the moment'
                if (maintenance)
                    details = 'offline, on maintenance or unreachable from this location at the moment'
                if (ddosProtection)
                    error = DDoSProtection
                throw new error ([ this.id, method, url, details ].join (' '))
            }

            throw e
        }
    }

    handleErrors (statusCode, statusText, url, method, requestHeaders, responseBody, json) {
        // override me
    }

    defaultErrorHandler (code, reason, url, method, responseBody) {
        if ((code >= 200) && (code <= 299))
            return
        let error = undefined
        let details = responseBody
        let match = responseBody.match (/<title>([^<]+)/i)
        if (match)
            details = match[1].trim ();
        if ([ 418, 429 ].includes (code)) {
            error = DDoSProtection
        } else if ([ 404, 409, 500, 501, 502, 520, 521, 522, 525 ].includes (code)) {
            error = ExchangeNotAvailable
        } else if ([ 400, 403, 405, 503, 530 ].includes (code)) {
            let ddosProtection = responseBody.match (/cloudflare|incapsula/i)
            if (ddosProtection) {
                error = DDoSProtection
            } else {
                error = ExchangeNotAvailable
                details += ' (possible reasons: ' + [
                    'invalid API keys',
                    'bad or old nonce',
                    'exchange is down or offline',
                    'on maintenance',
                    'DDoS protection',
                    'rate-limiting',
                ].join (', ') + ')'
            }
        } else if ([ 408, 504 ].includes (code)) {
            error = RequestTimeout
        } else if ([ 401, 511 ].includes (code)) {
            error = AuthenticationError
        } else {
            error = ExchangeError
        }
        throw new error ([ this.id, method, url, code, reason, details ].join (' '))
    }

    handleRestResponse (response, url, method = 'GET', requestHeaders = undefined, requestBody = undefined) {

        return response.text ().then (responseBody => {

            let jsonRequired = this.parseJsonResponse && !this.skipJsonOnStatusCodes.includes (response.status)
            let json = jsonRequired ? this.parseJson (responseBody, url, method) : undefined

            if (this.verbose)
                console.log ("handleRestResponse:\n", this.id, method, url, response.status, response.statusText, "\nResponse:\n", requestHeaders, "\n", responseBody, "\n")

            this.last_http_response = responseBody // FIXME: for those classes that haven't switched to handleErrors yet
            this.last_json_response = json         // FIXME: for those classes that haven't switched to handleErrors yet

            const args = [ response.status, response.statusText, url, method, requestHeaders, responseBody, json ]
            this.handleErrors (...args)
            this.defaultErrorHandler (response.status, response.statusText, url, method, responseBody)

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
                        code: market.base,
                        precision: market.precision ? (market.precision.base || market.precision.amount) : 8,
                    }))
            const quoteCurrencies =
                values.filter (market => 'quote' in market)
                    .map (market => ({
                        id: market.quoteId || market.quote,
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

    async loadMarkets (reload = false) {
        if (!reload && this.markets) {
            if (!this.marketsById) {
                return this.setMarkets (this.markets)
            }
            return this.markets
        }
        const markets = await this.fetchMarkets ()
        let currencies = undefined
        if (this.has.fetchCurrencies) {
            currencies = await this.fetchCurrencies ()
        }
        return this.setMarkets (markets, currencies)
    }

    fetchBidsAsks (symbols = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchBidsAsks not supported yet')
    }

    fetchTickers (symbols = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchTickers not supported yet')
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

    fetchCurrencies () {
        throw new NotSupported (this.id + ' fetchCurrencies not supported yet');
    }

    fetchMarkets () {
        return new Promise ((resolve, reject) => resolve (this.markets))
    }

    async fetchOrderStatus (id, market = undefined) {
        let order = await this.fetchOrder (id, market);
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
        if (currency === 'XBT')
            return 'BTC'
        if (currency === 'BCC')
            return 'BCH'
        if (currency === 'DRK')
            return 'DASH'
        return currency
    }

    currency (code) {

        if (typeof this.currencies === 'undefined')
            return new ExchangeError (this.id + ' currencies not loaded')

        if ((typeof code === 'string') && (code in this.currencies))
            return this.currencies[code]

        throw new ExchangeError (this.id + ' does not have currency code ' + code)
    }

    market (symbol) {

        if (typeof this.markets === 'undefined')
            return new ExchangeError (this.id + ' markets not loaded')

        if ((typeof symbol === 'string') && (symbol in this.markets))
            return this.markets[symbol]

        throw new ExchangeError (this.id + ' does not have market symbol ' + symbol)
    }

    marketId (symbol) {
        return this.market (symbol).id || symbol
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
        let match
        while (match = re.exec (string))
            matches.push (match[1])
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

    async fetchL2OrderBook (symbol, params = {}) {
        let orderbook = await this.fetchOrderBook (symbol, params)
        return extend (orderbook, {
            'bids': sortBy (aggregate (orderbook.bids), 0, true),
            'asks': sortBy (aggregate (orderbook.asks), 0),
        })
    }

    parseOrderBook (orderbook, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1) {
        timestamp = timestamp || this.milliseconds ();
        return {
            'bids': sortBy ((bidsKey in orderbook) ? this.parseBidsAsks (orderbook[bidsKey], priceKey, amountKey) : [], 0, true),
            'asks': sortBy ((asksKey in orderbook) ? this.parseBidsAsks (orderbook[asksKey], priceKey, amountKey) : [], 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        }
    }

    getCurrencyUsedOnOpenOrders (currency) {
        return Object.values (this.orders).filter (order => (order['status'] === 'open')).reduce ((total, order) => {
            let symbol = order['symbol'];
            let market = this.markets[symbol];
            let amount = order['remaining']
            if (currency === market['base'] && order['side'] === 'sell') {
                return total + amount
            } else if (currency === market['quote'] && order['side'] === 'buy') {
                return total + (order['cost'] || (order['price'] * amount))
            } else {
                return total
            }
        }, 0)
    }

    parseBalance (balance) {

        const currencies = Object.keys (this.omit (balance, 'info'));

        currencies.forEach (currency => {

            if (typeof balance[currency].used === 'undefined') {

                if (this.parseBalanceFromOpenOrders && ('open_orders' in balance['info'])) {
                    const exchangeOrdersCount = balance['info']['open_orders'];
                    const cachedOrdersCount = Object.values (this.orders).filter (order => (order['status'] === 'open')).length;
                    if (cachedOrdersCount === exchangeOrdersCount) {
                        balance[currency].used = this.getCurrencyUsedOnOpenOrders (currency)
                        balance[currency].total = balance[currency].used + balance[currency].free
                    }
                } else {
                    balance[currency].used = this.getCurrencyUsedOnOpenOrders (currency)
                    balance[currency].total = balance[currency].used + balance[currency].free
                }
            }

            [ 'free', 'used', 'total' ].forEach (account => {
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

    filterBySinceLimit (array, since = undefined, limit = undefined) {
        if (typeof since !== 'undefined')
            array = array.filter (entry => entry.timestamp > since)
        if (typeof limit !== 'undefined')
            array = array.slice (0, limit)
        return array
    }

    parseTrades (trades, market = undefined, since = undefined, limit = undefined) {
        let result = Object.values (trades).map (trade => this.parseTrade (trade, market))
        result = sortBy (result, 'timestamp', true)
        return this.filterBySinceLimit (result, since, limit)
    }

    parseOrders (orders, market = undefined, since = undefined, limit = undefined) {
        let result = Object.values (orders).map (order => this.parseOrder (order, market))
        return this.filterBySinceLimit (result, since, limit)
    }

    filterOrdersBySymbol (orders, symbol = undefined) {
        let grouped = this.groupBy (orders, 'symbol')
        if (symbol) {
            if (symbol in grouped)
                return grouped[symbol]
            return []
        }
        return orders
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return ohlcv
    }

    parseOHLCVs (ohlcvs, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        ohlcvs = Object.values (ohlcvs)
        let result = []
        for (let i = 0; i < ohlcvs.length; i++) {
            if (limit && (result.length >= limit))
                break;
            let ohlcv = this.parseOHLCV (ohlcvs[i], market, timeframe, since, limit)
            if (since && (ohlcv[0] < since))
                continue
            result.push (ohlcv)
        }
        return result
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
        return parseFloat (cost).toFixed (this.markets[symbol].precision.price)
    }

    priceToPrecision (symbol, price) {
        return parseFloat (price).toFixed (this.markets[symbol].precision.price)
    }

    amountToPrecision (symbol, amount) {
        return this.truncate (amount, this.markets[symbol].precision.amount)
    }

    amountToString (symbol, amount) {
        return this.truncate_to_string (amount, this.markets[symbol].precision.amount)
    }

    amountToLots (symbol, amount) {
        const lot = this.markets[symbol].lot
        return this.amountToPrecision (symbol, Math.floor (amount / lot) * lot)
    }

    feeToPrecision (symbol, fee) {
        return parseFloat (fee).toFixed (this.markets[symbol].precision.price)
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

    ymd (timestamp, infix = ' ') {
        let date = new Date (timestamp)
        let Y = date.getUTCFullYear ()
        let m = date.getUTCMonth () + 1
        let d = date.getUTCDate ()
        m = m < 10 ? ('0' + m) : m
        d = d < 10 ? ('0' + d) : d
        return Y + '-' + m + '-' + d
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
}
