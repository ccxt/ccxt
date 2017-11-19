"use strict";

//-----------------------------------------------------------------------------

const isNode    = (typeof window === 'undefined')
    , functions = require ('./functions')
    , throttle  = require ('./throttle')
    , fetch     = require ('fetch-ponyfill')().fetch
    , Market    = require ('./Market')

const { deepExtend
      , extend
      , sleep
      , timeout
      , sortBy
      , aggregate } = functions

const { ExchangeError
      , NotSupported
      , AuthenticationError
      , DDoSProtection
      , RequestTimeout
      , ExchangeNotAvailable } = require ('./errors')

// stub until we get a better solution for Webpack and React
// const journal = isNode && require ('./journal')
const journal = undefined

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

    describe () { return {} }

    constructor (userConfig = {}) {

        Object.assign (this, functions, { encode: string => string, decode: string => string })

        if (isNode)
            this.nodeVersion = process.version.match (/\d+\.\d+.\d+/) [0]

        // this.initRestRateLimiter ()

        if (isNode) {
            this.userAgent = {
                'User-Agent': 'ccxt/' + Exchange.ccxtVersion +
                    ' (+https://github.com/ccxt/ccxt)' +
                    ' Node.js/' + this.nodeVersion + ' (JavaScript)'
            }
        }

        // prepended to URL, like https://proxy.com/https://exchange.com/api...
        this.proxy = ''

        this.iso8601         = timestamp => new Date (timestamp).toISOString ()
        this.parse8601       = x => Date.parse (((x.indexOf ('+') >= 0) || (x.slice (-1) == 'Z')) ? x : (x + 'Z'))
        this.milliseconds    = Date.now
        this.microseconds    = () => Math.floor (this.milliseconds () * 1000)
        this.seconds         = () => Math.floor (this.milliseconds () / 1000)
        this.id              = undefined

        // rate limiter settings
        this.enableRateLimit = false
        this.rateLimit       = 2000  // milliseconds = seconds * 1000

        this.timeout         = 10000 // milliseconds
        this.verbose         = false
        this.debug           = false
        this.journal         = 'debug.json'
        this.userAgent       = false
        this.twofa           = false // two-factor authentication (2FA)
        this.substituteCommonCurrencyCodes = true
        this.parseBalanceFromOpenOrders = false
        this.timeframes      = undefined
        this.hasPublicAPI         = true
        this.hasPrivateAPI        = true
        this.hasCORS              = false
        this.hasDeposit           = false
        this.hasFetchBalance      = true
        this.hasFetchClosedOrders = false
        this.hasFetchCurrencies   = false
        this.hasFetchMyTrades     = false
        this.hasFetchOHLCV        = false
        this.hasFetchOpenOrders   = false
        this.hasFetchOrder        = false
        this.hasFetchOrderBook    = true
        this.hasFetchOrders       = false
        this.hasFetchTicker       = true
        this.hasFetchTickers      = false
        this.hasFetchTrades       = true
        this.hasWithdraw          = false
        this.hasCreateOrder       = this.hasPrivateAPI
        this.hasCancelOrder       = this.hasPrivateAPI

        this.requiredCredentials = {
            'apiKey':   true,
            'secret':   true,
            'uid':      false,
            'login':    false,
            'password': false,
        }

        this.balance    = {}
        this.orderbooks = {}
        this.fees       = {}
        this.orders     = {}
        this.trades     = {}

        this.last_http_response = undefined
        this.last_json_response = undefined

        // TODO: generate
        this.market_id                   = this.marketId
        this.market_ids                  = this.marketIds
        this.implode_params              = this.implodeParams
        this.extract_params              = this.extractParams
        this.fetch_balance               = this.fetchBalance
        this.fetch_free_balance          = this.fetchFreeBalance
        this.fetch_used_balance          = this.fetchUsedBalance
        this.fetch_total_balance         = this.fetchTotalBalance
        this.fetch_l2_order_book         = this.fetchL2OrderBook
        this.fetch_order_book            = this.fetchOrderBook
        this.fetch_tickers               = this.fetchTickers
        this.fetch_ticker                = this.fetchTicker
        this.fetch_trades                = this.fetchTrades
        this.fetch_order                 = this.fetchOrder
        this.fetch_orders                = this.fetchOrders
        this.fetch_open_orders           = this.fetchOpenOrders
        this.fetch_closed_orders         = this.fetchClosedOrders
        this.fetch_order_status          = this.fetchOrderStatus
        this.fetch_markets               = this.fetchMarkets
        this.load_markets                = this.loadMarkets
        this.set_markets                 = this.setMarkets
        this.parse_balance               = this.parseBalance
        this.parse_bid_ask               = this.parseBidAsk
        this.parse_bids_asks             = this.parseBidsAsks
        this.parse_order_book            = this.parseOrderBook
        this.parse_trades                = this.parseTrades
        this.parse_orders                = this.parseOrders
        this.parse_ohlcv                 = this.parseOHLCV
        this.parse_ohlcvs                = this.parseOHLCVs
        this.edit_limit_buy_order        = this.editLimitBuyOrder
        this.edit_limit_sell_order       = this.editLimitSellOrder
        this.edit_limit_order            = this.editLimitOrder
        this.edit_order                  = this.editOrder
        this.create_limit_buy_order      = this.createLimitBuyOrder
        this.create_limit_sell_order     = this.createLimitSellOrder
        this.create_market_buy_order     = this.createMarketBuyOrder
        this.create_market_sell_order    = this.createMarketSellOrder
        this.create_order                = this.createOrder
        this.calculate_fee               = this.calculateFee
        this.calculate_fee_rate          = this.calculateFeeRate
        this.common_currency_code        = this.commonCurrencyCode
        this.price_to_precision          = this.priceToPrecision
        this.amount_to_precision         = this.amountToPrecision
        this.fee_to_precision            = this.feeToPrecision
        this.cost_to_precision           = this.costToPrecision
        this.truncate                    = functions.truncate

        // API methods metainfo
        this.has = {
            'cancelOrder': this.hasPrivateAPI,
            'createOrder': this.hasPrivateAPI,
            'deposit': false,
            'fetchBalance': this.hasPrivateAPI,
            'fetchClosedOrders': false,
            'fetchCurrencies': false,
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
        }

        // merge configs
        const config = deepExtend (this.describe (), userConfig)

        // merge to this
        for (const [property, value] of Object.entries (config))
            this[property] = deepExtend (this[property], value)

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
                fetch (url, { 'method': method, 'headers': headers, 'body': body, 'agent': this.tunnelAgent || null})
                    .catch (e => {
                        if (isNode)
                            throw new ExchangeNotAvailable ([ this.id, method, url, e.type, e.message ].join (' '))
                        throw e // rethrow all unknown errors
                    })
                    .then (response => this.handleRestErrors (response, url, method, headers, body))
                    .then (response => this.handleRestResponse (response, url, method, headers, body))

            return timeout (this.timeout, promise).catch (e => {
                if (e instanceof RequestTimeout)
                    throw new RequestTimeout (this.id + ' ' + method + ' ' + url + ' ' + e.message + ' (' + this.timeout + ' ms)')
                throw e
            })
        }
    }

    defineRestApi (api, methodName, options = {}) {

        for (const type of Object.keys (api)) {
            for (const httpMethod of Object.keys (api[type])) {

                let urls = api[type][httpMethod]
                for (let i = 0; i < urls.length; i++) {
                    let url = urls[i].trim ()
                    let splitPath = url.split (/[^a-zA-Z0-9]/)

                    let uppercaseMethod  = httpMethod.toUpperCase ()
                    let lowercaseMethod  = httpMethod.toLowerCase ()
                    let camelcaseMethod  = this.capitalize (lowercaseMethod)
                    let camelcaseSuffix  = splitPath.map (this.capitalize).join ('')
                    let underscoreSuffix = splitPath.map (x => x.trim ().toLowerCase ()).filter (x => x.length > 0).join ('_')

                    if (camelcaseSuffix.indexOf (camelcaseMethod) === 0)
                        camelcaseSuffix = camelcaseSuffix.slice (camelcaseMethod.length)

                    if (underscoreSuffix.indexOf (lowercaseMethod) === 0)
                        underscoreSuffix = underscoreSuffix.slice (lowercaseMethod.length)

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

                    let partial = async params => this[methodName] (url, type, uppercaseMethod, params)

                    this[camelcase]  = partial
                    this[underscore] = partial
                }
            }
        }
    }

    fetch (url, method = 'GET', headers = undefined, body = undefined) {

        if (isNode && this.userAgent) {
            if (typeof this.userAgent == 'string')
                headers = extend ({ 'User-Agent': this.userAgent }, headers)
            else if ((typeof this.userAgent == 'object') && ('User-Agent' in this.userAgent))
                headers = extend (this.userAgent, headers)
        }

        if (typeof this.proxy == 'function') {

            url = this.proxy (url)
            headers = extend ({ 'Origin': '*' }, headers)

        } else if (typeof this.proxy == 'string') {

            if (this.proxy.length)
                headers = extend ({ 'Origin': '*' }, headers)

            url = this.proxy + url
        }

        if (this.verbose)
            console.log (this.id, method, url, "\nRequest:\n", headers, body)

        return this.executeRestRequest (url, method, headers, body)
    }

    async fetch2 (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {

        if (this.enableRateLimit)
            await this.throttle ()

        let request = this.sign (path, api, method, params, headers, body)
        return this.fetch (request.url, request.method, request.headers, request.body)
    }

    request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        return this.fetch2 (path, api, method, params, headers, body)
    }

    handleErrors (statusCode, statusText, url, method, headers, body) {
        // override me
    }

    defaultErrorHandler (code, reason, url, method, headers, body) {
        if (this.verbose)
            console.log (this.id, method, url, body ? ("\nResponse:\n" + body) : '')
        if ((code >= 200) && (code <= 300))
            return body
        let error = undefined
        this.last_http_response = body
        let details = body
        let match = body.match ('\<title\>([^<]+)')
        if (match)
            details = match[1].trim ();
        if ([ 429 ].includes (code)) {
            error = DDoSProtection
        } else if ([ 404, 409, 422, 500, 501, 502, 520, 521, 522, 525 ].includes (code)) {
            error = ExchangeNotAvailable
        } else if ([ 400, 403, 405, 503, 530 ].includes (code)) {
            let ddosProtection = body.match (/cloudflare|incapsula/i)
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

    handleRestErrors (response, url, method = 'GET', headers = undefined, body = undefined) {

        if (typeof response == 'string')
            return response

        return response.text ().then (text => {

            const args = [ response.status, response.statusText, url, method, headers, text ]

            this.handleErrors (...args)
            return this.defaultErrorHandler (...args)
        })
    }

    handleRestResponse (response, url, method = 'GET', headers = undefined, body = undefined) {

        try {

            this.last_http_response = response
            this.last_json_response =
                ((typeof response == 'string') && (response.length > 1)) ?
                    JSON.parse (response) : response
            return this.last_json_response

        } catch (e) {

            let maintenance = response.match (/offline|busy|retry|wait|unavailable|maintain|maintenance|maintenancing/i)
            let ddosProtection = response.match (/cloudflare|incapsula|overload/i)

            if (e instanceof SyntaxError) {

                let error = ExchangeNotAvailable
                let details = 'not accessible from this location at the moment'
                if (maintenance)
                    details = 'offline, on maintenance or unreachable from this location at the moment'
                if (ddosProtection)
                    error = DDoSProtection
                throw new error ([ this.id, method, url, details ].join (' '))
            }

            if (this.verbose)
                console.log (this.id, method, url, 'error', e, "response body:\n'" + response + "'")

            throw e
        }
    }

    setMarkets (markets) {
        let values = Object.values (markets).map (market => deepExtend ({
            'limits': this.limits,
            'precision': this.precision,
        }, this.fees['trading'], market))
        this.markets = deepExtend (this.markets, this.indexBy (values, 'symbol'))
        this.marketsById = this.indexBy (markets, 'id')
        this.markets_by_id = this.marketsById
        this.symbols = Object.keys (this.markets).sort ()
        this.ids = Object.keys (this.markets_by_id).sort ()
        let base = this.pluck (values.filter (market => 'base' in market), 'base')
        let quote = this.pluck (values.filter (market => 'quote' in market), 'quote')
        this.currencies = this.unique (base.concat (quote))
        return this.markets
    }

    loadMarkets (reload = false) {
        if (!reload && this.markets) {
            if (!this.marketsById) {
                return new Promise ((resolve, reject) => resolve (this.setMarkets (this.markets)))
            }
            return new Promise ((resolve, reject) => resolve (this.markets))
        }
        return this.fetchMarkets ().then (markets => {
            return this.setMarkets (markets)
        })
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

    fetchOpenOrders (symbol = undefined,$since = undefined, limit = undefined, params = {}) {
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
        let order = await this.fetchOrder (id)
        return order['status']
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
        if (currency == 'XBT')
            return 'BTC'
        if (currency == 'BCC')
            return 'BCH'
        if (currency == 'DRK')
            return 'DASH'
        return currency
    }

    market (symbol) {

        if (typeof this.markets == 'undefined')
            return new ExchangeError (this.id + ' markets not loaded')

        if ((typeof symbol === 'string') && (symbol in this.markets))
            return this.markets[symbol]

        throw new ExchangeError (this.id + ' does not have market symbol ' + symbol)
    }

    marketId (symbol) {
        return this.market (symbol).id || symbol
    }

    marketIds (symbols) {
        return symbols.map (symbol => this.marketId(symbol));
    }

    symbol (symbol) {
        return this.market (symbol).symbol || symbol
    }

    extractParams (string) {
        let re = /{([a-zA-Z0-9_]+?)}/g
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
            'bids': (bidsKey in orderbook) ? this.parseBidsAsks (orderbook[bidsKey], priceKey, amountKey) : [],
            'asks': (asksKey in orderbook) ? this.parseBidsAsks (orderbook[asksKey], priceKey, amountKey) : [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    getCurrencyUsedOnOpenOrders (currency) {
        return Object.values (this.orders).filter (order => (order['status'] == 'open')).reduce ((total, order) => {
            let symbol = order['symbol'];
            let market = this.markets[symbol];
            let amount = order['remaining']
            if (currency == market['base'] && order['side'] == 'sell') {
                return total + amount
            } else if (currency == market['quote'] && order['side'] == 'buy') {
                return total + (order['cost'] || (order['price'] * amount))
            } else {
                return total
            }
        }, 0)
    }

    parseBalance (balance) {

        const currencies = Object.keys (this.omit (balance, 'info'));

        currencies.forEach (currency => {

            if (typeof balance[currency].used == 'undefined') {

                if (this.parseBalanceFromOpenOrders && ('open_orders' in balance['info'])) {
                    const exchangeOrdersCount = balance['info']['open_orders'];
                    const cachedOrdersCount = Object.values (this.orders).filter (order => (order['status'] == 'open')).length;
                    if (cachedOrdersCount == exchangeOrdersCount) {
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
        return balance;
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

    parseTrades (trades, market = undefined) {
        return Object.values (trades).map (trade => this.parseTrade (trade, market))
    }

    parseOrders (orders, market = undefined) {
        return Object.values (orders).map (order => this.parseOrder (order, market))
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
        return Object.values (ohlcvs).map (ohlcv => this.parseOHLCV (ohlcv, market, timeframe, since, limit))
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

    precisionFromString (string) {
        const split = string.replace (/0+$/g, '').split ('.')
        return (split.length > 1) ? (split[1].length) : 0
    }

    costToPrecision (symbol, cost) {
        return parseFloat (cost).toFixed (this.markets[symbol].precision.price)
    }

    priceToPrecision (symbol, price) {
        return parseFloat (price).toFixed (this.markets[symbol].precision.price)
    }

    amountToPrecision (symbol, amount) {
        return this.truncate(amount, this.markets[symbol].precision.amount)
    }

    amountToLots (symbol, amount) {
        return this.amountToPrecision (symbol, Math.floor (amount / this.markets[symbol].lot) * this.markets[symbol].lot)
    }

    feeToPrecision (symbol, fee) {
        return parseFloat (fee).toFixed (this.markets[symbol].precision.price)
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol]
        let rate = market[takerOrMaker]
        let cost = parseFloat (this.costToPrecision (symbol, amount * price))
        return {
            'currency': market['quote'],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, rate * cost)),
        }
    }

    Ymd (timestamp, infix = ' ') {
        let date = new Date (timestamp)
        let Y = date.getUTCFullYear ()
        let m = date.getUTCMonth () + 1
        let d = date.getUTCDate ()
        m = m < 10 ? ('0' + m) : m
        d = d < 10 ? ('0' + d) : d
        return Y + '-' + m + '-' + d
    }

    YmdHMS (timestamp, infix = ' ') {
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
