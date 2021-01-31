'use strict'

/*  ------------------------------------------------------------------------ */

global.log = require ('ololog') // for easier debugging

/*  ------------------------------------------------------------------------ */

const { Exchange, keys, values, unique, index, aggregate } = require ('../../../ccxt')
const { strictEqual: equal, deepEqual } = require ('assert')

/*  ------------------------------------------------------------------------ */

describe ('ccxt base code', () => {

/*  ------------------------------------------------------------------------ */

    require ('./functions/test.generic')
    require ('./functions/test.time')
    require ('./functions/test.type')
    // Some test files are transpiled to other languages and must be kept very simple so we put `it` call externally to them
    // Some mocha reporters will swallow `assert` failures if they are outside of `it` clause so we must call `it`
    it ('decimalToPrecision() works', () => {
        require ('./functions/test.number')
    })
    it ('date&time functions work', () => {
        require('./functions/test.datetime')
    })
    it ('cryptography code works', () => {
        require('./functions/test.crypto')
    })

/*  ------------------------------------------------------------------------ */

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

        const exchange = new Exchange ({
            'id': 'mock',
            'markets': {
                'FOO/BAR': market,
            },
        })

        Object.keys (fees).forEach (takerOrMaker => {

            const result = exchange.calculateFee (market['symbol'], 'limit', 'sell', amount, price, takerOrMaker, {})

            deepEqual (result, {
                'type': takerOrMaker,
                'currency': 'BAR',
                'rate': fees[takerOrMaker],
                'cost': fees[takerOrMaker] * amount * price,
            })
        })
    })

/*  ------------------------------------------------------------------------ */

    it.skip ('exchange config extension works', () => {


        cost = { min: 0.001, max: 1000 }
        precision = { amount: 3 }
        const exchange = new binance ({
            'markets': {
                'ETH/BTC': { limits: { cost }, precision },
            },
        })

        deepEqual (exchange.markets['ETH/BTC'].limits.cost, cost)
        deepEqual (exchange.markets['ETH/BTC'].precision, { price: 6, amount: 3 })
        deepEqual (exchange.markets['ETH/BTC'].symbol, 'ETH/BTC')
    })

/*  ------------------------------------------------------------------------ */

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

        deepEqual (aggregate (bids.sort ()), [
            [ 123.0, 456.0 ],
            [ 789.0, 123.0 ],
            [ 789.1, 369.0 ],
        ])

        deepEqual (aggregate (asks.sort ()), [
            [ 123.0, 456.0 ],
            [ 789.0, 123.0 ],
            [ 789.10, 123.0 ],
        ])

        deepEqual (aggregate ([]), [])
    })

/*  ------------------------------------------------------------------------ */

    it ('parseBalance() works', () => {

        const exchange = new Exchange ({
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

        deepEqual (actual, expected)
    })

/*  ------------------------------------------------------------------------ */

    it ('camelCase/camel_case property conversion works', () => {

        const exchange = new Exchange ({ 'id': 'mock' })

        const propsSeenBefore = index (
                                    ["isNode", "empty", "keys", "values", "extend", "clone", "index", "ordered", "unique", "keysort", "indexBy", "groupBy", "filterBy", "sortBy", "flatten", "pluck", "omit", "sum", "deepExtend", "uuid", "unCamelCase", "capitalize", "isNumber", "isArray", "isObject", "isString", "isStringCoercible", "isDictionary", "hasProps", "prop", "asFloat", "asInteger", "safeFloat", "safeInteger", "safeValue", "safeString", "decimal", "toFixed", "truncate", "truncateToString", "precisionFromString", "stringToBinary", "stringToBase64", "base64ToBinary", "base64ToString", "binaryToString", "binaryConcat", "urlencode", "rawencode", "urlencodeBase64", "hash", "hmac", "jwt", "time", "setTimeout_safe", "sleep", "TimedOut", "timeout", "throttle", "json", "unjson", "aggregate", "is_node", "index_by", "group_by", "filter_by", "sort_by", "deep_extend", "un_camel_case", "is_number", "is_array", "is_object", "is_string", "is_string_coercible", "is_dictionary", "has_props", "as_float", "as_integer", "safe_float", "safe_integer", "safe_value", "safe_string", "to_fixed", "truncate_to_string", "precision_from_string", "string_to_binary", "string_to_base64", "utf16To_base64", "base64To_binary", "base64To_string", "binary_to_string", "binary_concat", "urlencode_base64", "set_timeout_safe", "Timed_out", "encode", "decode", "userAgents", "headers", "proxy", "origin", "iso8601", "parse8601", "milliseconds", "microseconds", "seconds", "id", "enableRateLimit", "rateLimit", "parseJsonResponse", "substituteCommonCurrencyCodes", "parseBalanceFromOpenOrders", "verbose", "debug", "journal", "userAgent", "twofa", "timeframes", "hasPublicAPI", "hasPrivateAPI", "hasCORS", "hasDeposit", "hasFetchBalance", "hasFetchClosedOrders", "hasFetchCurrencies", "hasFetchMyTrades", "hasFetchOHLCV", "hasFetchOpenOrders", "hasFetchOrder", "hasFetchOrderBook", "hasFetchOrders", "hasFetchTicker", "hasFetchTickers", "hasFetchBidsAsks", "hasFetchTrades", "hasWithdraw", "hasCreateOrder", "hasCancelOrder", "apiKey", "secret", "uid", "login", "password", "requiredCredentials", "exceptions", "balance", "orderbooks", "tickers", "fees", "orders", "trades", "currencies", "last_http_response", "last_json_response", "arrayConcat", "market_id", "market_ids", "array_concat", "implode_params", "extract_params", "fetch_balance", "fetch_free_balance", "fetch_used_balance","fetch_total_balance", "fetch_l2_order_book", "fetch_order_book", "fetch_bids_asks", "fetch_tickers", "fetch_ticker", "fetch_trades", "fetch_order", "fetch_orders", "fetch_open_orders", "fetch_closed_orders", "fetch_order_status", "fetch_markets", "load_markets", "set_markets", "parse_balance", "parse_bid_ask", "parse_bids_asks", "parse_order_book", "parse_trades", "parse_orders", "parse_ohlcv", "parse_ohlcvs", "edit_limit_buy_order", "edit_limit_sell_order", "edit_limit_order", "edit_order", "create_limit_buy_order", "create_limit_sell_order", "create_market_buy_order", "create_market_sell_order", "create_order", "calculate_fee", "common_currency_code", "price_to_precision", "amount_to_precision", "amount_to_string", "fee_to_precision", "cost_to_precision", "constructor", "getMarket", "describe", "defaults", "nonce", "encodeURIComponent", "checkRequiredCredentials", "initRestRateLimiter", "defineRestApi", "fetch", "fetch2", "request", "handleErrors", "defaultErrorHandler", "handleRestErrors", "handleRestResponse", "setMarkets", "loadMarkets", "fetchBidsAsks", "fetchTickers", "fetchOrder", "fetchOrders", "fetchOpenOrders", "fetchClosedOrders", "fetchMyTrades", "fetchCurrencies", "fetchMarkets", "fetchOrderStatus", "account", "commonCurrencyCode", "currency", "market", "marketId", "marketIds", "symbol", "extractParams", "implodeParams", "url", "parseBidAsk", "parseBidsAsks", "fetchL2OrderBook", "parseOrderBook", "parseBalance", "fetchPartialBalance", "fetchFreeBalance", "fetchUsedBalance", "fetchTotalBalance", "filterBySinceLimit", "parseTrades", "parseOrders", "filterOrdersBySymbol", "parseOHLCV", "parseOHLCVs", "editLimitBuyOrder", "editLimitSellOrder", "editLimitOrder", "editOrder", "createLimitBuyOrder", "createLimitSellOrder", "createMarketBuyOrder", "createMarketSellOrder", "costToPrecision", "priceToPrecision", "amountToPrecision", "amountToLots", "feeToPrecision", "calculateFee", "Ymd", "YmdHMS"]
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

/*  ------------------------------------------------------------------------ */

    it ('camelCase/camel_case property conversion works #2', () => {

        class Derived extends Exchange {}
        const derived = new Derived ()
        equal (typeof derived.load_markets, 'function')
    })

/*  ------------------------------------------------------------------------ */

    it ('legacy .hasSomething maps to has.something automatically', () => {

        const exchange = new Exchange ({
                                id: 'mock',
                                has: {
                                    CORS: true,
                                    publicAPI: false,
                                    fetchDepositAddress: 'emulated'
                                }
                            })

        equal (exchange.hasCORS, true)
        equal (exchange.hasPublicAPI, false)
        equal (exchange.hasFetchDepositAddress, true)
    })
})

/*  ------------------------------------------------------------------------ */
