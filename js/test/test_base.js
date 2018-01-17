/*  ------------------------------------------------------------------------ */

global.log = require ('ololog') // for easier debugging

/*  ------------------------------------------------------------------------ */

const ccxt     = require ('../../ccxt.js')
    , assert   = require ('assert')
    , ansi     = require ('ansicolor').nice;
    
/*  ------------------------------------------------------------------------ */

const { keys, values, unique, index } = ccxt

/*  ------------------------------------------------------------------------ */

const chai = require ('chai')
                .use (require ('chai-as-promised'))
                .should ()

/*  ------------------------------------------------------------------------ */

describe ('ccxt base code', () => {

    it ('amountToString is robust', async () => {

        assert.strictEqual (ccxt.truncate_to_string (10,        0), '10')
        // assert.strictEqual (ccxt.truncate_to_string (10,        1), '10.0')
        assert.strictEqual (ccxt.truncate_to_string (10.1,      0), '10')
        assert.strictEqual (ccxt.truncate_to_string (10.1,      1), '10.1')
        assert.strictEqual (ccxt.truncate_to_string (10.1,      2), '10.1')
        assert.strictEqual (ccxt.truncate_to_string (10.11,     2), '10.11')
        assert.strictEqual (ccxt.truncate_to_string (10.199,    2), '10.19')
        assert.strictEqual (ccxt.truncate_to_string (10.999999, 8), '10.999999')
        assert.strictEqual (ccxt.truncate_to_string (10.99999999, 8), '10.99999999')
        assert.strictEqual (ccxt.truncate_to_string (10.9999999999, 8), '10.99999999')

    })

    it ('safeFloat/safeInteger is robust', async () => {

        const $default = {}

        for (const fn of ['safeFloat', 'safeInteger']) {

            log (fn, ccxt.safeFloat ({ float: [0] }, 'float'))

            assert.strictEqual (ccxt[fn] ({'x': false }, 'x', $default), $default)
            assert.strictEqual (ccxt[fn] ({'x': true }, 'x', $default), $default)
            assert.strictEqual (ccxt[fn] ({'x': [] }, 'x', $default), $default)
            assert.strictEqual (ccxt[fn] ({'x': [0] }, 'x', $default), $default)
            assert.strictEqual (ccxt[fn] ({'x': [1] }, 'x', $default), $default)
            assert.strictEqual (ccxt[fn] ({'x': {} }, 'x', $default), $default)
            assert.strictEqual (ccxt[fn] ({'x': Number.NaN }, 'x'), undefined)
            assert.strictEqual (ccxt[fn] ({'x': Number.POSITIVE_INFINITY }, 'x'), undefined)
            assert.strictEqual (ccxt[fn] ({'x': null }, 'x', undefined), undefined)
            assert.strictEqual (ccxt[fn] ({'x': null }, 'x', $default), $default)
            assert.strictEqual (ccxt[fn] ({'x': '1.0'}, 'x'), 1.0)
            assert.strictEqual (ccxt[fn] ({'x': '-1.0'}, 'x'), -1.0)
            assert.strictEqual (ccxt[fn] ({'x': 1.0}, 'x'), 1.0)
            assert.strictEqual (ccxt[fn] ({'x': 0}, 'x'), 0)
            assert.strictEqual (ccxt[fn] ({'x': undefined}, 'x', $default), $default)
            assert.strictEqual (ccxt[fn] ({'x': ""}, 'x'), undefined)
            assert.strictEqual (ccxt[fn] ({'x': ""}, 'x', 0), 0)
            assert.strictEqual (ccxt[fn] ({}, 'x'), undefined)
            assert.strictEqual (ccxt[fn] ({}, 'x', 0), 0)
        }

        assert.strictEqual (ccxt.safeFloat ({'x': 1.59999999}, 'x'), 1.59999999)
        assert.strictEqual (ccxt.safeInteger ({'x': 1.59999999}, 'x'), 1)
    })

    it ('setTimeout_safe is working', (done) => {

        const time = ccxt.time
        const start = time.now ()
        const calls = []

        const brokenSetTimeout = (done, ms) => {
            calls.push ({ when: time.now () - start, ms_asked: ms })
            return setTimeout (done, 100) // simulates a defect setTimeout implementation that sleeps wrong time (100ms always in this test)
        }

        const approxEquals = (a, b) => Math.abs (a - b) <= 10

        // ask to sleep 250ms
        ccxt.setTimeout_safe (() => {
            assert (approxEquals (calls[0].ms_asked, 250))
            assert (approxEquals (calls[1].ms_asked, 150))
            assert (approxEquals (calls[2].ms_asked, 50))
            done ()
        }, 250, brokenSetTimeout)
    })

    it ('setTimeout_safe canceling is working', (done) => {

        const brokenSetTimeout = (done, ms) => setTimeout (done, 100) // simulates a defect setTimeout implementation that sleeps wrong time (100ms always in this test)

        const clear = ccxt.setTimeout_safe (() => { throw new Error ('shouldnt happen!') }, 250, brokenSetTimeout)

        setTimeout (() => { clear () }, 200)
        setTimeout (() => { done () }, 400)
    })

    it ('timeout() is working', async () => {

        assert ('foo', await ccxt.timeout (200, new Promise (resolve => setTimeout (() => resolve ('foo'), 100))))

        await ccxt.timeout (100, Promise.reject ('foo')).should.be.rejectedWith ('foo')
        await ccxt.timeout (100, new Promise ((resolve, reject) => setTimeout (() => reject ('foo'), 200))).should.be.rejectedWith ('timed out')
    })

    it ('calculateFee() works', () => {

        const price  = 100.00
        const amount = 10.00
        const taker  = 0.0025
        const maker  = 0.0010
        const fees   = { taker, maker }
        const market = {
            'id':     'foobar',
            'symbol': 'FOO/BAR',
            'base':   'FOO',
            'quote':  'BAR',
            'taker':   taker,
            'maker':   maker,
            'precision': {
                'amount': 8,
                'price': 8,
            },
        }

        const exchange = new ccxt.Exchange ({
            'id': 'mock',
            'markets': {
                'FOO/BAR': market,
            },
        })

        Object.keys (fees).forEach (takerOrMaker => {

            const result = exchange.calculateFee (market['symbol'], 'limit', 'sell', amount, price, takerOrMaker, {})

            assert.deepEqual (result, {
                'type': takerOrMaker,
                'currency': 'BAR',
                'rate': fees[takerOrMaker],
                'cost': fees[takerOrMaker] * amount * price,
            })
        })
    })

    it ('amountToLots works', () => {

        const exchange = new ccxt.Exchange ({
            id: 'mock',
            markets: {
                'ETH/BTC': { id: 'ETH/BTC', symbol: 'ETH/BTC', base: 'ETH', quote: 'BTC', lot: 0.001, precision: { amount: 4 }},
                'BTC/USD': { id: 'BTC/USD', symbol: 'BTC/USD', base: 'BTC', quote: 'USD', lot: 0.005, precision: { amount: 3 }},
                'ETH/USD': { id: 'ETH/USD', symbol: 'ETH/USD', base: 'ETH', quote: 'USD', lot: 0.01,  precision: { amount: 1 }},
            },
        })

        assert.equal (exchange.amountToLots ('ETH/BTC', 0.0011),  '0.001')
        assert.equal (exchange.amountToLots ('ETH/BTC', 0.0009),  '0')
        assert.equal (exchange.amountToLots ('ETH/BTC', 0.12345), '0.123')

        assert.equal (exchange.amountToLots ('BTC/USD', 1.234), '1.230')
        assert.equal (exchange.amountToLots ('ETH/USD', 0.01),  '0')
        assert.equal (exchange.amountToLots ('ETH/USD', 1.11),  '1.1')
        assert.equal (exchange.amountToLots ('ETH/USD', 1.123), '1.1')
    })

    it.skip ('rate limiting works', async () => {

        const calls = []
        const rateLimit = 100
        const capacity = 0
        const numTokens = 0
        const defaultCost = 1
        const delay = 0
        const exchange = new ccxt.Exchange ({

            id: 'mock',
            rateLimit,
            enableRateLimit: true,
            tokenBucket: { capacity, numTokens, defaultCost, delay },

            async ping (...args) { return this.throttle ().then (() => exchange.pong (...args)) },
            async pong (...args) { calls.push ({ when: ccxt.time.now (), path: args[0], args }) }
        })

        await exchange.ping ('foo')
        await exchange.ping ('bar')
        await exchange.ping ('baz')

        await Promise.all ([
            exchange.ping ('qux'),
            exchange.ping ('zap'),
            exchange.ping ('lol')
        ])

        assert.deepEqual (calls.map (x => x.path), ['foo', 'bar', 'baz', 'qux', 'zap', 'lol'])

        log (calls)
        calls.reduce ((prevTime, call) => {
            log ('delta T:', call.when - prevTime)
            assert ((call.when - prevTime) >= (rateLimit - 1))
            return call.when
        }, 0)
    })

    it ('getCurrencyUsedOnOpenOrders() works', () => {


        const calls = []
        const rateLimit = 100
        const exchange = new ccxt.Exchange ({
            'orders': [
                { status: 'open',   symbol: 'ETH/BTC', side: 'sell', price: 200.0, amount: 21.0, remaining: 20.0 },
                { status: 'open',   symbol: 'ETH/BTC', side: 'buy',  price: 200.0, amount: 22.0, remaining: 20.0 },
                { status: 'open',   symbol: 'ETH/BTC', side: 'sell', price: 200.0, amount: 23.0, remaining: 20.0 },
                { status: 'closed', symbol: 'BTC/USD', side: 'sell', price: 10.0, amount: 11.0, remaining: 10.0 },
                { status: 'open',   symbol: 'BTC/USD', side: 'buy',  price: 10.0, amount: 12.0, remaining: 10.0 },
                { status: 'open',   symbol: 'BTC/USD', side: 'sell', price: 10.0, amount: 13.0, remaining: 10.0 },
            ],
            'markets': {
                'ETH/BTC': { id: 'ETH/BTC', symbol: 'ETH/BTC', base: 'ETH', quote: 'BTC' },
                'BTC/USD': { id: 'BTC/USD', symbol: 'BTC/USD', base: 'BTC', quote: 'USD' },
            },
        })

        assert.equal (exchange.getCurrencyUsedOnOpenOrders ('LTC'), 0)
        assert.equal (exchange.getCurrencyUsedOnOpenOrders ('ETH'), 40)
        assert.equal (exchange.getCurrencyUsedOnOpenOrders ('USD'), 100)
        assert.equal (exchange.getCurrencyUsedOnOpenOrders ('BTC'), 4010)

    })

    it.skip ('exchange config extension works', () => {


        cost = { min: 0.001, max: 1000 }
        precision = { amount: 3 }
        const exchange = new ccxt.binance ({
            'markets': {
                'ETH/BTC': { limits: { cost }, precision },
            },
        })

        assert.deepEqual (exchange.markets['ETH/BTC'].limits.cost, cost)
        assert.deepEqual (exchange.markets['ETH/BTC'].precision, { price: 6, amount: 3 })
        assert.deepEqual (exchange.markets['ETH/BTC'].symbol, 'ETH/BTC')
    })

    it ('aggregate() works', () => {

        const bids = [
            [ 789.1, 123.0 ],
            [ 789.100, 123.0 ],
            [ 123.0, 456.0 ],
            [ 789.0, 123.0 ],
            [ 789.10, 123.0 ],
        ]

        const asks = [
            [ 123.0, 456.0 ],
            [ 789.0, 123.0 ],
            [ 789.10, 123.0 ],
        ]

        assert.deepEqual (ccxt.aggregate (bids.sort ()), [
            [ 123.0, 456.0 ],
            [ 789.0, 123.0 ],
            [ 789.1, 369.0 ],
        ])

        assert.deepEqual (ccxt.aggregate (asks.sort ()), [
            [ 123.0, 456.0 ],
            [ 789.0, 123.0 ],
            [ 789.10, 123.0 ],
        ])

        assert.deepEqual (ccxt.aggregate ([]), [])
    })

    it ('deepExtend() works', () => {

        let count = 0;

        const values = [{
            a: 1,
            b: 2,
            d: {
                a: 1,
                b: [],
                c: { test1: 123, test2: 321 }},
            f: 5,
            g: 123,
            i: 321,
            j: [1, 2],
        },
        {
            b: 3,
            c: 5,
            d: {
                b: { first: 'one', second: 'two' },
                c: { test2: 222 }},
            e: { one: 1, two: 2 },
            f: [{ 'foo': 'bar' }],
            g: (void 0),
            h: /abc/g,
            i: null,
            j: [3, 4]
        }]

        const extended = ccxt.deepExtend (...values)
        assert.deepEqual ({
            a: 1,
            b: 3,
            d: {
                a: 1,
                b: { first: 'one', second: 'two' },
                c: { test1: 123, test2: 222 }
            },
            f: [{ 'foo': 'bar' }],
            g: undefined,
            c: 5,
            e: { one: 1, two: 2 },
            h: /abc/g,
            i: null,
            j: [3, 4]
        }, extended)

        assert.deepEqual (ccxt.deepExtend (undefined, undefined, {'foo': 'bar' }), { 'foo': 'bar' })
    })

    it ('groupBy() works', () => {

        const array = [
            { 'foo': 'a' },
            { 'foo': 'b' },
            { 'foo': 'c' },
            { 'foo': 'b' },
            { 'foo': 'c' },
            { 'foo': 'c' },
        ]

        assert.deepEqual (ccxt.groupBy (array, 'foo'), {
            'a': [ { 'foo': 'a' } ],
            'b': [ { 'foo': 'b' }, { 'foo': 'b' } ],
            'c': [ { 'foo': 'c' }, { 'foo': 'c' }, { 'foo': 'c' } ],
        })
    })

    it ('filterBy() works', () => {

        const array = [
            { 'foo': 'a' },
            { 'foo': undefined },
            { 'foo': 'b' },
            { },
            { 'foo': 'a', 'bar': 'b' },
            { 'foo': 'c' },
            { 'foo': 'd' },
            { 'foo': 'b' },
            { 'foo': 'c' },
            { 'foo': 'c' },
        ]

        assert.deepEqual (ccxt.filterBy (array, 'foo', 'a'), [
            { 'foo': 'a' },
            { 'foo': 'a', 'bar': 'b' },
        ])
    })

    it ('truncate() works', () => {

        assert.equal (ccxt.truncate (0, 0), 0)
        assert.equal (ccxt.truncate (-17.56,   2), -17.56)
        assert.equal (ccxt.truncate ( 17.56,   2),  17.56)
        assert.equal (ccxt.truncate (-17.569,  2), -17.56)
        assert.equal (ccxt.truncate ( 17.569,  2),  17.56)
        assert.equal (ccxt.truncate (49.9999,  4), 49.9999)
        assert.equal (ccxt.truncate (49.99999, 4), 49.9999)
        assert.equal (ccxt.truncate (1.670006528897705e-10, 4), 0)
    })

    it ('parseBalance() works', () => {

        const exchange = new ccxt.Exchange ({
            'markets': {
                'ETH/BTC': { 'id': 'ETH/BTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', }
            }
        })

        const input = {
            'ETH': { 'free': 10, 'used': 10, 'total': 20 },
            'ZEC': { 'free': 0, 'used': 0, 'total': 0 },
        }

        const expected = {
            'ETH': { 'free': 10, 'used': 10, 'total': 20 },
            'ZEC': { 'free': 0, 'used': 0, 'total': 0 },
            'free': {
                'ETH': 10,
                'ZEC': 0,
            },
            'used': {
                'ETH': 10,
                'ZEC': 0,
            },
            'total': {
                'ETH': 20,
                'ZEC': 0,
            },
        }

        const actual = exchange.parseBalance (input)

        assert.deepEqual (actual, expected)
    })

    it ('omit works', () => {

        assert.deepEqual (ccxt.omit ({ }, 'foo'), {})
        assert.deepEqual (ccxt.omit ({ foo: 2 }, 'foo'), { })
        assert.deepEqual (ccxt.omit ({ foo: 2, bar: 3 }, 'foo'), { bar: 3 })
        assert.deepEqual (ccxt.omit ({ foo: 2, bar: 3 }, ['foo']), { bar: 3 })
        assert.deepEqual (ccxt.omit ({ foo: 2, bar: 3 }), { foo: 2, bar: 3 })
        assert.deepEqual (ccxt.omit ({ foo: 2, bar: 3 }, 'foo', 'bar'), {})
        assert.deepEqual (ccxt.omit ({ foo: 2, bar: 3 }, ['foo'], 'bar'), {})
        assert.deepEqual (ccxt.omit ({ 5: 2, bar: 3 }, [5]), { bar: 3 })
        assert.deepEqual (ccxt.omit ({ 5: 2, bar: 3 }, 5), { bar: 3 })
    })

    it ('sum works', () => {

        assert (ccxt.sum () === undefined)

        ccxt.sum (2).should.equal (2)
        ccxt.sum (2,30,400).should.equal (432)
        ccxt.sum (2,undefined,[88],30,'7',400,null).should.equal (432)
    })

    it ('sortBy works', () => {

        const arr = [{ x: 5 }, { x: 2 }, { x: 4 }, { x: 0 },{ x: 1 },{ x: 3 }]
        ccxt.sortBy (arr, 'x')
        
        assert.deepEqual (arr
          [ { x: 0 },
            { x: 1 },
            { x: 2 },
            { x: 3 },
            { x: 4 },
            { x: 5 }  ])

        assert.deepEqual (ccxt.sortBy (arr, 'x', true),
          [ { x: 5 },
            { x: 4 },
            { x: 3 },
            { x: 2 },
            { x: 1 },
            { x: 0 }  ])

        assert.deepEqual (ccxt.sortBy ([], 'x'), [])
    })

    it ('camelCase/camel_case property conversion works', () => {

        const exchange = new ccxt.Exchange ({ 'id': 'mock' })

        const propsSeenBefore = index (
                                    ["isNode", "empty", "keys", "values", "extend", "clone", "index", "ordered", "unique", "keysort", "indexBy", "groupBy", "filterBy", "sortBy", "flatten", "pluck", "omit", "sum", "deepExtend", "uuid", "unCamelCase", "capitalize", "isNumber", "isArray", "isObject", "isString", "isStringCoercible", "isDictionary", "hasProps", "prop", "asFloat", "asInteger", "safeFloat", "safeInteger", "safeValue", "safeString", "decimal", "toFixed", "truncate", "truncateToString", "precisionFromString", "stringToBinary", "stringToBase64", "utf16ToBase64", "base64ToBinary", "base64ToString", "binaryToString", "binaryConcat", "urlencode", "rawencode", "urlencodeBase64", "hash", "hmac", "jwt", "time", "setTimeout_safe", "sleep", "TimedOut", "timeout", "throttle", "json", "unjson", "aggregate", "is_node", "index_by", "group_by", "filter_by", "sort_by", "deep_extend", "un_camel_case", "is_number", "is_array", "is_object", "is_string", "is_string_coercible", "is_dictionary", "has_props", "as_float", "as_integer", "safe_float", "safe_integer", "safe_value", "safe_string", "to_fixed", "truncate_to_string", "precision_from_string", "string_to_binary", "string_to_base64", "utf16To_base64", "base64To_binary", "base64To_string", "binary_to_string", "binary_concat", "urlencode_base64", "set_timeout_safe", "Timed_out", "encode", "decode", "nodeVersion", "userAgents", "headers", "proxy", "origin", "iso8601", "parse8601", "milliseconds", "microseconds", "seconds", "id", "enableRateLimit", "rateLimit", "parseJsonResponse", "substituteCommonCurrencyCodes", "parseBalanceFromOpenOrders", "verbose", "debug", "journal", "userAgent", "twofa", "timeframes", "hasPublicAPI", "hasPrivateAPI", "hasCORS", "hasDeposit", "hasFetchBalance", "hasFetchClosedOrders", "hasFetchCurrencies", "hasFetchMyTrades", "hasFetchOHLCV", "hasFetchOpenOrders", "hasFetchOrder", "hasFetchOrderBook", "hasFetchOrders", "hasFetchTicker", "hasFetchTickers", "hasFetchBidsAsks", "hasFetchTrades", "hasWithdraw", "hasCreateOrder", "hasCancelOrder", "apiKey", "secret", "uid", "login", "password", "requiredCredentials", "exceptions", "balance", "orderbooks", "tickers", "fees", "orders", "trades", "currencies", "last_http_response", "last_json_response", "arrayConcat", "market_id", "market_ids", "array_concat", "implode_params", "extract_params", "fetch_balance", "fetch_free_balance", "fetch_used_balance","fetch_total_balance", "fetch_l2_order_book", "fetch_order_book", "fetch_bids_asks", "fetch_tickers", "fetch_ticker", "fetch_trades", "fetch_order", "fetch_orders", "fetch_open_orders", "fetch_closed_orders", "fetch_order_status", "fetch_markets", "load_markets", "set_markets", "parse_balance", "parse_bid_ask", "parse_bids_asks", "parse_order_book", "parse_trades", "parse_orders", "parse_ohlcv", "parse_ohlcvs", "edit_limit_buy_order", "edit_limit_sell_order", "edit_limit_order", "edit_order", "create_limit_buy_order", "create_limit_sell_order", "create_market_buy_order", "create_market_sell_order", "create_order", "calculate_fee", "common_currency_code", "price_to_precision", "amount_to_precision", "amount_to_string", "fee_to_precision", "cost_to_precision", "constructor", "getMarket", "describe", "defaults", "nonce", "encodeURIComponent", "checkRequiredCredentials", "initRestRateLimiter", "defineRestApi", "fetch", "fetch2", "request", "handleErrors", "defaultErrorHandler", "handleRestErrors", "handleRestResponse", "setMarkets", "loadMarkets", "fetchBidsAsks", "fetchTickers", "fetchOrder", "fetchOrders", "fetchOpenOrders", "fetchClosedOrders", "fetchMyTrades", "fetchCurrencies", "fetchMarkets", "fetchOrderStatus", "account", "commonCurrencyCode", "currency", "market", "marketId", "marketIds", "symbol", "extractParams", "implodeParams", "url", "parseBidAsk", "parseBidsAsks", "fetchL2OrderBook", "parseOrderBook", "getCurrencyUsedOnOpenOrders", "parseBalance", "fetchPartialBalance", "fetchFreeBalance", "fetchUsedBalance", "fetchTotalBalance", "filterBySinceLimit", "parseTrades", "parseOrders", "filterOrdersBySymbol", "parseOHLCV", "parseOHLCVs", "editLimitBuyOrder", "editLimitSellOrder", "editLimitOrder", "editOrder", "createLimitBuyOrder", "createLimitSellOrder", "createMarketBuyOrder", "createMarketSellOrder", "costToPrecision", "priceToPrecision", "amountToPrecision", "amountToString", "amountToLots", "feeToPrecision", "calculateFee", "Ymd", "YmdHMS"]
                                )

        const props = index (Object.getOwnPropertyNames (exchange).concat (
                             Object.getOwnPropertyNames (exchange.constructor.prototype)))

        for (const k of Array.from (propsSeenBefore))
            if (this[k] && !props.has (k))
                throw new Error (`missing prop: ${k}`)

        for (const k of Array.from (props))
            if (!propsSeenBefore.has (k))
                log.magenta.noLocate (`+ ${k}`)
        
    })

    it ('legacy .hasSomething maps to has.something automatically', () => {

        const exchange = new ccxt.Exchange ({
                                id: 'mock',
                                has: {
                                    CORS: true,
                                    publicAPI: false,
                                    fetchDepositAddress: 'emulated'
                                }
                            })

        assert (exchange.hasCORS === true)
        assert (exchange.hasPublicAPI === false)
        assert (exchange.hasFetchDepositAddress === true)
    })

})

/*  ------------------------------------------------------------------------ */
