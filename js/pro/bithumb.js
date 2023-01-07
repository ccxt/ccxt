'use strict';

//  ---------------------------------------------------------------------------

const bithumbRest = require ('../bithumb.js');
const Precise = require ('../base/Precise');
const { ExchangeError } = require ('../base/errors');
const { ArrayCache } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class bithumb extends bithumbRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchOrders': false,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': true,
                'watchPosition': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://pubwss.bithumb.com/pub/ws',
                },
            },
            'options': {
            },
            'streaming': {},
            'exceptions': {
                'ws': {
                    'exact': {
                    },
                },
            },
        });
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bithumb#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bithumb api endpoint
         * @param {object} params.tickTypes ticker timeframe. Options are "30M"/"1H"/"12H"/"24H"/"MID"
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const url = this.urls['api']['ws'];
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'ticker:' + market['symbol'];
        const request = {
            'type': 'ticker',
            'symbols': [ market['base'] + '_' + market['quote'] ],
            'tickTypes': this.safeString (params, 'tickTypes', '30M'),
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    handleTicker (client, message) {
        //
        //    {
        //        "type" : "ticker",
        //        "content" : {
        //            "symbol" : "BTC_KRW",           // 통화코드
        //            "tickType" : "24H",                 // 변동 기준시간- 30M, 1H, 12H, 24H, MID
        //            "date" : "20200129",                // 일자
        //            "time" : "121844",                  // 시간
        //            "openPrice" : "2302",               // 시가
        //            "closePrice" : "2317",              // 종가
        //            "lowPrice" : "2272",                // 저가
        //            "highPrice" : "2344",               // 고가
        //            "value" : "2831915078.07065789",    // 누적거래금액
        //            "volume" : "1222314.51355788",  // 누적거래량
        //            "sellVolume" : "760129.34079004",   // 매도누적거래량
        //            "buyVolume" : "462185.17276784",    // 매수누적거래량
        //            "prevClosePrice" : "2326",          // 전일종가
        //            "chgRate" : "0.65",                 // 변동률
        //            "chgAmt" : "15",                    // 변동금액
        //            "volumePower" : "60.80"         // 체결강도
        //        }
        //    }
        //
        const content = this.safeValue (message, 'content', {});
        const marketId = this.safeString (content, 'symbol');
        const symbol = this.safeSymbol (marketId, undefined, '_');
        const ticker = this.parseWsTicker (content);
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = ticker;
        client.resolve (this.tickers[symbol], messageHash);
    }

    parseWsTicker (ticker, market = undefined) {
        //
        //    {
        //        "symbol" : "BTC_KRW",           // 통화코드
        //        "tickType" : "24H",                 // 변동 기준시간- 30M, 1H, 12H, 24H, MID
        //        "date" : "20200129",                // 일자
        //        "time" : "121844",                  // 시간
        //        "openPrice" : "2302",               // 시가
        //        "closePrice" : "2317",              // 종가
        //        "lowPrice" : "2272",                // 저가
        //        "highPrice" : "2344",               // 고가
        //        "value" : "2831915078.07065789",    // 누적거래금액
        //        "volume" : "1222314.51355788",  // 누적거래량
        //        "sellVolume" : "760129.34079004",   // 매도누적거래량
        //        "buyVolume" : "462185.17276784",    // 매수누적거래량
        //        "prevClosePrice" : "2326",          // 전일종가
        //        "chgRate" : "0.65",                 // 변동률
        //        "chgAmt" : "15",                    // 변동금액
        //        "volumePower" : "60.80"         // 체결강도
        //    }
        //
        const date = this.safeString (ticker, 'date', '');
        const time = this.safeString (ticker, 'time', '');
        const datetime = date.slice (0, 4) + '-' + date.slice (4, 6) + '-' + date.slice (6, 8) + 'T' + time.slice (0, 2) + ':' + time.slice (2, 4) + ':' + time.slice (4, 6);
        const marketId = this.safeString (ticker, 'symbol');
        return this.safeTicker ({
            'symbol': this.safeSymbol (marketId, market, '_'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'high': this.safeString (ticker, 'highPrice'),
            'low': this.safeString (ticker, 'lowPrice'),
            'bid': undefined,
            'bidVolume': this.safeString (ticker, 'buyVolume'),
            'ask': undefined,
            'askVolume': this.safeString (ticker, 'sellVolume'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'openPrice'),
            'close': this.safeString (ticker, 'closePrice'),
            'last': undefined,
            'previousClose': this.safeString (ticker, 'prevClosePrice'),
            'change': this.safeString (ticker, 'chgAmt'),
            'percentage': this.safeString (ticker, 'chgRate'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': this.safeString (ticker, 'value'),
            'info': ticker,
        }, market);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bithumb#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return.
         * @param {object} params extra parameters specific to the bithumb api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook' + ':' + symbol;
        const request = {
            'type': 'orderbookdepth',
            'symbols': [ market['base'] + '_' + market['quote'] ],
        };
        const orderbook = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client, message) {
        //
        //    {
        //        "type" : "orderbookdepth",
        //            "content" : {
        //            "list" : [
        //                {
        //                    "symbol" : "BTC_KRW",
        //                    "orderType" : "ask",        // 주문타입 – bid / ask
        //                    "price" : "10593000",       // 호가
        //                    "quantity" : "1.11223318",  // 잔량
        //                    "total" : "3"               // 건수
        //                },
        //                {"symbol" : "BTC_KRW", "orderType" : "ask", "price" : "10596000", "quantity" : "0.5495", "total" : "8"},
        //                {"symbol" : "BTC_KRW", "orderType" : "ask", "price" : "10598000", "quantity" : "18.2085", "total" : "10"},
        //                {"symbol" : "BTC_KRW", "orderType" : "bid", "price" : "10532000", "quantity" : "0", "total" : "0"},
        //                {"symbol" : "BTC_KRW", "orderType" : "bid", "price" : "10572000", "quantity" : "2.3324", "total" : "4"},
        //                {"symbol" : "BTC_KRW", "orderType" : "bid", "price" : "10571000", "quantity" : "1.469", "total" : "3"},
        //                {"symbol" : "BTC_KRW", "orderType" : "bid", "price" : "10569000", "quantity" : "0.5152", "total" : "2"}
        //            ],
        //            "datetime":1580268255864325     // 일시
        //        }
        //    }
        //
        const content = this.safeValue (message, 'content', {});
        const list = this.safeValue (content, 'list', []);
        const first = this.safeValue (list, 0, {});
        const marketId = this.safeValue (first, 'symbol');
        const symbol = this.safeSymbol (marketId, undefined, '_');
        let timestamp = this.safeString (content, 'datetime');
        timestamp = Precise.stringDiv (timestamp, '1000');
        timestamp = this.parseNumber (timestamp);
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ();
            orderbook['symbol'] = symbol;
        }
        this.handleDeltas (orderbook, list);
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        const messageHash = 'orderbook' + ':' + symbol;
        client.resolve (orderbook, messageHash);
    }

    handleDelta (orderbook, delta) {
        //
        //    {
        //        symbol: "ETH_BTC",
        //        orderType: "bid",
        //        price: "0.07349517",
        //        quantity: "0",
        //        total: "0",
        //    }
        //
        const sideId = this.safeString (delta, 'orderType');
        const side = (sideId === 'bid') ? 'bids' : 'asks';
        const bidAsk = this.parseBidAsk (delta, 'price', 'quantity');
        const orderbookSide = orderbook[side];
        orderbookSide.storeArray (bidAsk);
    }

    handleDeltas (orderbook, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (orderbook, deltas[i]);
        }
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bithumb#watchTrades
         * @description watches information on multiple trades made in a market
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bithumb api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trade:' + symbol;
        const request = {
            'type': 'transaction',
            'symbols': [ market['base'] + '_' + market['quote'] ],
        };
        const trades = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //    {
        //        "type" : "transaction",
        //        "content" : {
        //            "list" : [
        //                {
        //                    "symbol" : "BTC_KRW",
        //                    "buySellGb" : "1",
        //                    "contPrice" : "10579000",
        //                    "contQty" : "0.01",
        //                    "contAmt" : "105790.00",
        //                    "contDtm" : "2020-01-29 12:24:18.830039",
        //                    "updn" : "dn"
        //                }
        //            ]
        //        }
        //    }
        //
        const content = this.safeValue (message, 'content', {});
        const rawTrades = this.safeValue (content, 'list', []);
        for (let i = 0; i < rawTrades.length; i++) {
            const rawTrade = rawTrades[i];
            const marketId = this.safeString (rawTrade, 'symbol');
            const symbol = this.safeSymbol (marketId, undefined, '_');
            let stored = this.safeValue (this.trades, symbol);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                stored = new ArrayCache (limit);
                this.trades[symbol] = stored;
            }
            const parsed = this.parseTrade (rawTrade);
            stored.append (parsed);
            const messageHash = 'trade' + ':' + symbol;
            client.resolve (stored, messageHash);
        }
    }

    parseWsTrade (trade, market = undefined) {
        //
        //    {
        //        "symbol" : "BTC_KRW",
        //        "buySellGb" : "1",
        //        "contPrice" : "10579000",
        //        "contQty" : "0.01",
        //        "contAmt" : "105790.00",
        //        "contDtm" : "2020-01-29 12:24:18.830039",
        //        "updn" : "dn"
        //    }
        //
        const marketId = this.safeString (trade, 'symbol');
        const datetime = this.safeString (trade, 'contDtm');
        const sideId = this.safeString (trade, 'buySellGb');
        return this.safeTrade ({
            'id': undefined,
            'info': trade,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'symbol': this.safeSymbol (marketId, market, '_'),
            'order': undefined,
            'type': undefined,
            'side': (sideId === 1) ? 'buy' : 'sell',
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'contPrice'),
            'amount': this.safeString (trade, 'contQty'),
            'cost': this.safeString (trade, 'contAmt'),
            'fee': undefined,
        }, market);
    }

    handleErrorMessage (client, message) {
        //
        //    {
        //        "status" : "5100",
        //        "resmsg" : "Invalid Filter Syntax"
        //    }
        //
        const status = this.safeString (message, 'status');
        const msg = this.safeValue (message, 'resmsg', {});
        throw new ExchangeError (this.id + ' status: ' + status + ' message: ' + msg);
    }

    handleMessage (client, message) {
        const type = this.safeString (message, 'type');
        const methods = {
            'ticker': this.handleTicker,
            'orderbookdepth': this.handleOrderBook,
            'transaction': this.handleTrades,
        };
        const method = this.safeValue (methods, type);
        if (method !== undefined) {
            return method.call (this, client, message);
        }
        const status = this.safeString (message, 'status');
        if (status !== '0000') {
            return this.handleErrorMessage (client, message);
        }
    }
};
