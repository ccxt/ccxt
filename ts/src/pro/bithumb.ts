
//  ---------------------------------------------------------------------------

import { sha256 } from '@noble/hashes/sha2.js';
import bithumbRest from '../bithumb.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type{ Int, OrderBook, Ticker, Trade, Strings, Tickers, Dict, NullableDict, Bool, Order, Str, Market } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { ArgumentsRequired, BadRequest, ExchangeError } from '../base/errors.js';
import { jwt } from '../base/functions/rsa.js';
import { Balances } from '../base/types.js';
//  ---------------------------------------------------------------------------

export default class bithumb extends bithumbRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchOrderBook': true,
                'watchOHLCV': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://pubwss.bithumb.com/pub/ws', // v1.2.0
                        'publicV2': 'wss://ws-api.bithumb.com/websocket/v1', // backwards compatible alias
                        'privateV2': 'wss://ws-api.bithumb.com/websocket/v2/private', // backwards compatible alias
                        'publicGen2': 'wss://ws-api.bithumb.com/websocket/v1', // v2.1.5
                        'privateGen2': 'wss://ws-api.bithumb.com/websocket/v2/private', // v2.1.5
                    },
                },
            },
            'options': {},
            'streaming': {},
            'exceptions': {},
        });
    }

    /**
     * @method
     * @name bithumb#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
     * @see https://apidocs.bithumb.com/reference/%ED%98%84%EC%9E%AC%EA%B0%80-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tickTypes] generation 1 only, the tick type to subscribe to, '24H' by default (30M, 1H, 12H, 24H, MID)
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a [ticker structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'watchTicker', 'generation', 2);
        const isGenerationTwo = (generation === 2);
        const url = isGenerationTwo ? this.urls['api']['ws']['publicGen2'] : this.urls['api']['ws']['public'];
        const market = this.market (symbol);
        const messageHash = 'ticker:' + market['symbol'];
        const tickTypes = this.safeString (params, 'tickTypes', '24H');
        params = this.omit (params, 'tickTypes');
        let request: Dict | Dict[] = {
            'type': 'ticker',
            'symbols': [ market['base'] + '_' + market['quote'] ],
            'tickTypes': [ tickTypes ],
        };
        if (isGenerationTwo) {
            const marketId = this.safeString (market, 'id');
            let marketIdRequest = undefined;
            if ((marketId !== undefined) && (marketId.indexOf ('-') >= 0)) {
                marketIdRequest = marketId;
            } else {
                marketIdRequest = (market['quote'] + '-' + market['base']);
            }
            request = [
                { 'ticket': this.uuid () },
                this.extend ({
                    'type': 'ticker',
                    'codes': [ marketIdRequest ],
                }, params),
            ];
            return await this.watch (url, messageHash, request, messageHash);
        }
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    /**
     * @method
     * @name bithumb#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
     * @see https://apidocs.bithumb.com/reference/%ED%98%84%EC%9E%AC%EA%B0%80-ticker
     * @param {string[]} symbols unified symbols of the markets to fetch tickers for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tickTypes] generation 1 only, the tick type to subscribe to, '24H' by default (30M, 1H, 12H, 24H, MID)
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure} indexed by market symbols
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'watchTickers', 'generation', 2);
        const isGenerationTwo = (generation === 2);
        if (isGenerationTwo && ((symbols === undefined) || (symbols.length === 0))) {
            throw new ArgumentsRequired (this.id + ' watchTickers() requires symbols for the generation 2 API');
        }
        const url = isGenerationTwo ? this.urls['api']['ws']['publicGen2'] : this.urls['api']['ws']['public'];
        const streamMarketIds: string[] = [];
        const messageHashes: string[] = [];
        symbols = this.marketSymbols (symbols, undefined, false, true, true);
        if (symbols === undefined) {
            symbols = this.symbols;
        }
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const marketId = this.safeString (market, 'id');
            let streamMarketId = undefined;
            if (isGenerationTwo) {
                if ((marketId !== undefined) && (marketId.indexOf ('-') >= 0)) {
                    streamMarketId = marketId;
                } else {
                    streamMarketId = (market['quote'] + '-' + market['base']);
                }
            } else {
                streamMarketId = (market['base'] + '_' + market['quote']);
            }
            streamMarketIds.push (streamMarketId);
            messageHashes.push ('ticker:' + market['symbol']);
        }
        const tickTypes = this.safeString (params, 'tickTypes', '24H');
        params = this.omit (params, 'tickTypes');
        let message: Dict | Dict[] = {
            'type': 'ticker',
            'symbols': streamMarketIds,
            'tickTypes': [ tickTypes ],
        };
        if (isGenerationTwo) {
            message = [
                { 'ticket': this.uuid () },
                this.extend ({
                    'type': 'ticker',
                    'codes': streamMarketIds,
                }, params),
            ];
        } else {
            message = this.extend (message, params);
        }
        const newTicker = await this.watchMultiple (url, messageHashes, message, messageHashes);
        if (this.newUpdates) {
            const result: Dict = {};
            result[newTicker['symbol']] = newTicker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message) {
        //
        // generation 1
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
        // generation 2
        //
        //     {
        //         "type": "ticker",
        //         "code": "KRW-BTC",
        //         "opening_price": 94223000,
        //         "high_price": 95465000,
        //         "low_price": 93601000,
        //         "trade_price": 95299000,
        //         "prev_closing_price": 94201000,
        //         "change": "RISE",
        //         "change_price": 1098000,
        //         "signed_change_price": 1098000,
        //         "change_rate": 0.01165593,
        //         "signed_change_rate": 0.01165593,
        //         "trade_volume": 0.0094,
        //         "acc_trade_volume": 151.44914647,
        //         "acc_trade_volume_24h": 310.44065227,
        //         "acc_trade_price": 14330306973.41015,
        //         "acc_trade_price_24h": 29226371799.56915,
        //         "trade_date": "20260710",
        //         "trade_time": "124548",
        //         "trade_timestamp": 1783655148303,
        //         "ask_bid": "BID",
        //         "acc_ask_volume": 52.30413928,
        //         "acc_bid_volume": 99.14500719,
        //         "highest_52_week_price": 179734000,
        //         "highest_52_week_date": "2025-10-09",
        //         "lowest_52_week_price": 81110000,
        //         "lowest_52_week_date": "2026-02-06",
        //         "market_state": "ACTIVE",
        //         "is_trading_suspended": false,
        //         "delisting_date": "",
        //         "market_warning": "NONE",
        //         "timestamp": 1783655148485,
        //         "stream_type": "REALTIME"
        //     }
        //
        const content = this.safeDict (message, 'content');
        const isGenerationTwo = (content === undefined);
        let tickerMessage = undefined;
        if (isGenerationTwo) {
            tickerMessage = message;
        } else {
            tickerMessage = content;
        }
        const marketId = this.safeString2 (tickerMessage, 'symbol', 'code');
        if (marketId === undefined) {
            return;
        }
        let symbol = undefined;
        if (isGenerationTwo) {
            const parts = marketId.split ('-');
            const quoteId = this.safeString (parts, 0);
            const baseId = this.safeString (parts, 1);
            if ((baseId === undefined) || (quoteId === undefined)) {
                return;
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            symbol = base + '/' + quote;
        } else {
            symbol = this.safeSymbol (marketId, undefined, '_');
        }
        const ticker = this.parseWsTicker (tickerMessage);
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = ticker;
        client.resolve (this.tickers[symbol], messageHash);
    }

    parseWsTicker (ticker, market: Market = undefined) {
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
        // generation 2
        //
        //     {
        //         "type": "ticker",
        //         "code": "KRW-BTC",
        //         "opening_price": 94223000,
        //         "high_price": 95465000,
        //         "low_price": 93601000,
        //         "trade_price": 95299000,
        //         "prev_closing_price": 94201000,
        //         "change": "RISE",
        //         "change_price": 1098000,
        //         "signed_change_price": 1098000,
        //         "change_rate": 0.01165593,
        //         "signed_change_rate": 0.01165593,
        //         "trade_volume": 0.0094,
        //         "acc_trade_volume": 151.44914647,
        //         "acc_trade_volume_24h": 310.44065227,
        //         "acc_trade_price": 14330306973.41015,
        //         "acc_trade_price_24h": 29226371799.56915,
        //         "trade_date": "20260710",
        //         "trade_time": "124548",
        //         "trade_timestamp": 1783655148303,
        //         "ask_bid": "BID",
        //         "acc_ask_volume": 52.30413928,
        //         "acc_bid_volume": 99.14500719,
        //         "highest_52_week_price": 179734000,
        //         "highest_52_week_date": "2025-10-09",
        //         "lowest_52_week_price": 81110000,
        //         "lowest_52_week_date": "2026-02-06",
        //         "market_state": "ACTIVE",
        //         "is_trading_suspended": false,
        //         "delisting_date": "",
        //         "market_warning": "NONE",
        //         "timestamp": 1783655148485,
        //         "stream_type": "REALTIME"
        //     }
        //
        const code = this.safeString (ticker, 'code');
        if (code !== undefined) {
            ticker['market'] = this.safeString (ticker, 'market', code);
            return this.parseTicker (ticker, market);
        }
        const date = this.safeString (ticker, 'date', '') as string;
        const time = this.safeString (ticker, 'time', '') as string;
        const kstDatetime = date.slice (0, 4) + '-' + date.slice (4, 6) + '-' + date.slice (6, 8) + 'T' + time.slice (0, 2) + ':' + time.slice (2, 4) + ':' + time.slice (4, 6);
        // date/time are the exchange's local KST wall-clock, not UTC — shift -9h like parseWsTrade
        let timestamp = this.parse8601 (kstDatetime);
        if (timestamp !== undefined) {
            timestamp = (timestamp - 32400000);
        }
        const marketId = this.safeString (ticker, 'symbol');
        return this.safeTicker ({
            'symbol': this.safeSymbol (marketId, market, '_'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
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

    /**
     * @method
     * @name bithumb#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
     * @see https://apidocs.bithumb.com/reference/%ED%98%B8%EA%B0%80-orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object} an [order book structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure}
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'watchOrderBook', 'generation', 2);
        const isGenerationTwo = (generation === 2);
        const url = isGenerationTwo ? this.urls['api']['ws']['publicGen2'] : this.urls['api']['ws']['public'];
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook' + ':' + symbol;
        let request: Dict | Dict[] = {
            'type': 'orderbookdepth',
            'symbols': [ market['base'] + '_' + market['quote'] ],
        };
        if (isGenerationTwo) {
            const marketId = this.safeString (market, 'id');
            let marketIdRequest = undefined;
            if ((marketId !== undefined) && (marketId.indexOf ('-') >= 0)) {
                marketIdRequest = marketId;
            } else {
                marketIdRequest = (market['quote'] + '-' + market['base']);
            }
            request = [
                { 'ticket': this.uuid () },
                this.extend ({
                    'type': 'orderbook',
                    'codes': [ marketIdRequest ],
                }, params),
            ];
        } else {
            request = this.extend (request, params);
        }
        const orderbook = await this.watch (url, messageHash, request, messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        // generation 1
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
        // generation 2
        //
        //     {
        //         "type": "orderbook",
        //         "code": "KRW-BTC",
        //         "total_ask_size": 4.7398,
        //         "total_bid_size": 0.2889,
        //         "orderbook_units": [
        //             {
        //                 "ask_price": 95340000,
        //                 "bid_price": 95339000,
        //                 "ask_size": 0.0007,
        //                 "bid_size": 0.0024
        //             },
        //         ],
        //         "level": 1,
        //         "timestamp": "1783657882348968",
        //         "stream_type": "SNAPSHOT"
        //     }
        //
        const content = this.safeDict (message, 'content');
        if (content !== undefined) {
            const list = this.safeList (content, 'list', []);
            const first = this.safeDict (list, 0, {});
            const legacyMarketId = this.safeString (first, 'symbol');
            const legacySymbol = this.safeSymbol (legacyMarketId, undefined, '_');
            const timestampStr = this.safeString (content, 'datetime') as string;
            const legacyTimestamp = this.parseToInt (timestampStr.slice (0, 13));
            if (!(legacySymbol in this.orderbooks)) {
                const ob = this.orderBook ();
                ob['symbol'] = legacySymbol;
                this.orderbooks[legacySymbol] = ob;
            }
            const legacyOrderbook = this.orderbooks[legacySymbol];
            this.handleDeltas (legacyOrderbook, list);
            legacyOrderbook['timestamp'] = legacyTimestamp;
            legacyOrderbook['datetime'] = this.iso8601 (legacyTimestamp);
            const legacyMessageHash = 'orderbook' + ':' + legacySymbol;
            client.resolve (legacyOrderbook, legacyMessageHash);
            return;
        }
        const marketId = this.safeString (message, 'code');
        let symbol = undefined;
        if (marketId !== undefined) {
            const parts = marketId.split ('-');
            const quoteId = this.safeString (parts, 0);
            const baseId = this.safeString (parts, 1);
            if ((baseId !== undefined) && (quoteId !== undefined)) {
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if (symbol === undefined) {
            return;
        }
        const streamType = this.safeString (message, 'stream_type');
        const options = this.safeValue (this.options, 'watchOrderBook', {});
        const obLimit = this.safeInteger (options, 'limit', 1000);
        if (!(symbol in this.orderbooks) || (streamType === 'SNAPSHOT')) {
            this.orderbooks[symbol] = this.orderBook ({}, obLimit);
        }
        const orderbook = this.orderbooks[symbol];
        orderbook.reset ({});
        orderbook['symbol'] = symbol;
        const bids = orderbook['bids'];
        const asks = orderbook['asks'];
        const units = this.safeList (message, 'orderbook_units', []);
        for (let i = 0; i < units.length; i++) {
            const entry = units[i];
            const bidPrice = this.safeNumber (entry, 'bid_price');
            const bidSize = this.safeNumber (entry, 'bid_size');
            const askPrice = this.safeNumber (entry, 'ask_price');
            const askSize = this.safeNumber (entry, 'ask_size');
            if ((bidPrice !== undefined) && (bidSize !== undefined)) {
                bids.store (bidPrice, bidSize);
            }
            if ((askPrice !== undefined) && (askSize !== undefined)) {
                asks.store (askPrice, askSize);
            }
        }
        const gen2TimestampStr = this.safeString (message, 'timestamp') as string;
        const timestamp = this.parseToInt (gen2TimestampStr.slice (0, 13));
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
        const bidAsk = this.parseOrderBookBidAsk (delta, 'price', 'quantity');
        const orderbookSide = orderbook[side];
        orderbookSide.storeArray (bidAsk);
    }

    handleDeltas (orderbook, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (orderbook, deltas[i]);
        }
    }

    /**
     * @method
     * @name bithumb#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
     * @see https://apidocs.bithumb.com/reference/%EC%B2%B4%EA%B2%B0-trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#public-trades}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'watchTrades', 'generation', 2);
        const isGenerationTwo = (generation === 2);
        const url = isGenerationTwo ? this.urls['api']['ws']['publicGen2'] : this.urls['api']['ws']['public'];
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'trade:' + symbol;
        let request: Dict | Dict[] = {
            'type': 'transaction',
            'symbols': [ market['base'] + '_' + market['quote'] ],
        };
        if (isGenerationTwo) {
            const marketId = this.safeString (market, 'id');
            let marketIdRequest = undefined;
            if ((marketId !== undefined) && (marketId.indexOf ('-') >= 0)) {
                marketIdRequest = marketId;
            } else {
                marketIdRequest = (market['quote'] + '-' + market['base']);
            }
            request = [
                { 'ticket': this.uuid () },
                this.extend ({
                    'type': 'trade',
                    'codes': [ marketIdRequest ],
                }, params),
            ];
        } else {
            request = this.extend (request, params);
        }
        const trades = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        // generation 1
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
        // generation 2
        //
        //     {
        //         "type": "trade",
        //         "code": "KRW-BTC",
        //         "trade_price": 95539000,
        //         "trade_volume": 0.00022664,
        //         "ask_bid": "ASK",
        //         "prev_closing_price": 94201000,
        //         "change": "RISE",
        //         "change_price": 1338000,
        //         "trade_date": "2026-07-10",
        //         "trade_time": "13:39:41",
        //         "trade_timestamp": 1783658381138,
        //         "sequential_id": "862683813820523888",
        //         "timestamp": 1783658381398,
        //         "stream_type": "REALTIME"
        //     }
        //
        const content = this.safeDict (message, 'content');
        let rawTrades = this.safeList (content, 'list');
        if (rawTrades === undefined) {
            rawTrades = [ message ];
        }
        for (let i = 0; i < rawTrades.length; i++) {
            const rawTrade = rawTrades[i];
            const marketId = this.safeString2 (rawTrade, 'symbol', 'code');
            if (marketId === undefined) {
                continue;
            }
            const code = this.safeString (rawTrade, 'code');
            const isGenerationTwo = (code !== undefined);
            let fallbackSymbol = undefined;
            if (isGenerationTwo) {
                const parts = marketId.split ('-');
                const quoteId = this.safeString (parts, 0);
                const baseId = this.safeString (parts, 1);
                if ((baseId !== undefined) && (quoteId !== undefined)) {
                    const base = this.safeCurrencyCode (baseId);
                    const quote = this.safeCurrencyCode (quoteId);
                    fallbackSymbol = base + '/' + quote;
                }
            } else {
                fallbackSymbol = this.safeSymbol (marketId, undefined, '_');
            }
            const parsed = this.parseWsTrade (rawTrade);
            const symbol = this.safeString (parsed, 'symbol', fallbackSymbol);
            if (!(symbol in this.trades)) {
                const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                const stored = new ArrayCache (limit);
                this.trades[symbol] = stored;
            }
            const trades = this.trades[symbol];
            trades.append (parsed);
            const messageHash = 'trade' + ':' + symbol;
            client.resolve (trades, messageHash);
        }
    }

    parseWsTrade (trade, market: Market = undefined) {
        //
        // generation 1
        //
        //    {
        //        "symbol" : "BTC_KRW",
        //        "buySellGb" : "1",
        //        "contPrice" : "10579000",
        //        "contQty" : "0.01",
        //        "contAmt" : "105790.00",
        //        "contDtm" : "2020-01-29 12:24:18.830038",
        //        "updn" : "dn"
        //    }
        //
        // generation 2
        //
        //     {
        //         "type": "trade",
        //         "code": "KRW-BTC",
        //         "trade_price": 95539000,
        //         "trade_volume": 0.00022664,
        //         "ask_bid": "ASK",
        //         "prev_closing_price": 94201000,
        //         "change": "RISE",
        //         "change_price": 1338000,
        //         "trade_date": "2026-07-10",
        //         "trade_time": "13:39:41",
        //         "trade_timestamp": 1783658381138,
        //         "sequential_id": "862683813820523888",
        //         "timestamp": 1783658381398,
        //         "stream_type": "REALTIME"
        //     }
        //
        const marketCode = this.safeString (trade, 'code');
        if (marketCode !== undefined) {
            const tradeTimestamp = this.safeInteger (trade, 'trade_timestamp');
            const normalized = this.extend (trade, {
                'market': marketCode,
                'timestamp': tradeTimestamp,
            });
            return this.parseTrade (normalized, market);
        }
        const marketId = this.safeString (trade, 'symbol');
        const datetime = this.safeString (trade, 'contDtm');
        // that date is not UTC iso8601, but exchange's local time, -9hr difference
        const timestamp = this.parseToInt (this.parse8601 (datetime)) - 32400000;
        const sideId = this.safeString (trade, 'buySellGb');
        return this.safeTrade ({
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (marketId, market, '_'),
            'order': undefined,
            'type': undefined,
            'side': (sideId === '1') ? 'buy' : 'sell',
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'contPrice'),
            'amount': this.safeString (trade, 'contQty'),
            'cost': this.safeString (trade, 'contAmt'),
            'fee': undefined,
        }, market);
    }

    handleErrorMessage (client: Client, message): Bool {
        //
        //    {
        //        "status" : "5100",
        //        "resmsg" : "Invalid Filter Syntax"
        //    }
        //
        const error = this.safeDict (message, 'error');
        if (error !== undefined) {
            try {
                const errorName = this.safeString (error, 'name', 'Error');
                const errorMessage = this.safeString (error, 'message', '');
                let addedMessage = undefined;
                if ((errorMessage.length > 0)) {
                    addedMessage = (' ' + errorMessage);
                } else {
                    addedMessage = '';
                }
                throw new ExchangeError (this.id + ' websocket error ' + errorName + addedMessage);
            } catch (e) {
                client.reject (e);
            }
            return false;
        }
        if (!('status' in message)) {
            return true;
        }
        const errorCode = this.safeString (message, 'status');
        try {
            if (errorCode !== '0000') {
                const msg = this.safeString (message, 'resmsg');
                throw new ExchangeError (this.id + ' ' + msg);
            }
            return true;
        } catch (e) {
            client.reject (e);
            return false;
        }
    }

    /**
     * @method
     * @name bithumb#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://apidocs.bithumb.com/v2.1.5/reference/%EB%82%B4-%EC%9E%90%EC%82%B0-myasset
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async watchBalance (params = {}): Promise<Balances> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'watchBalance', 'generation', 2);
        if (generation !== 2) {
            throw new BadRequest (this.id + ' watchBalance() is only supported for the generation 2 API');
        }
        await this.authenticate ();
        const url = this.urls['api']['ws']['privateGen2'];
        const messageHash = 'myAsset';
        const request = [
            { 'ticket': 'ccxt' },
            { 'type': messageHash },
        ];
        const balance = await this.watch (url, messageHash, request, messageHash);
        return balance;
    }

    handleBalance (client: Client, message) {
        //
        //    {
        //        "type": "myAsset",
        //        "assets": [
        //            {
        //                "currency": "KRW",
        //                "balance": "2061832.35",
        //                "locked": "3824127.3"
        //            }
        //        ],
        //        "asset_timestamp": 1727052537592,
        //        "timestamp": 1727052537687,
        //        "stream_type": "REALTIME"
        //    }
        //
        const messageHash = 'myAsset';
        const assets = this.safeList (message, 'assets', []);
        if (this.balance === undefined) {
            this.balance = {};
        }
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const currencyId = this.safeString (asset, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (asset, 'balance');
            account['used'] = this.safeString (asset, 'locked');
            this.balance[code] = account;
        }
        this.balance['info'] = message;
        const timestamp = this.safeInteger (message, 'timestamp');
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = this.iso8601 (timestamp);
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, messageHash);
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const wsOptions: Dict = this.safeDict (this.options, 'ws', {});
        const authenticated = this.safeString (wsOptions, 'token');
        if (authenticated === undefined) {
            const payload: Dict = {
                'access_key': this.apiKey,
                'nonce': this.uuid (),
                'timestamp': this.milliseconds (),
            };
            const jwtToken = jwt (payload, this.encode (this.secret), sha256);
            wsOptions['token'] = jwtToken;
            wsOptions['options'] = {
                'headers': {
                    'authorization': 'Bearer ' + jwtToken,
                },
            };
            this.options['ws'] = wsOptions;
        }
        const url = this.urls['api']['ws']['privateGen2'];
        const client = this.client (url);
        return client;
    }

    /**
     * @method
     * @name bithumb#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://apidocs.bithumb.com/v2.1.5/reference/%EB%82%B4-%EC%A3%BC%EB%AC%B8-%EB%B0%8F-%EC%B2%B4%EA%B2%B0-myorder
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.codes] market codes to filter orders
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let generation: Int = undefined;
        [ generation, params ] = this.handleOptionAndParams (params, 'watchOrders', 'generation', 2);
        if (generation !== 2) {
            throw new BadRequest (this.id + ' watchOrders() is only supported for the generation 2 API');
        }
        await this.authenticate ();
        const url = this.urls['api']['ws']['privateGen2'];
        let messageHash = 'myOrder';
        const codes = this.safeList (params, 'codes', []);
        const request = [
            { 'ticket': 'ccxt' },
            { 'type': messageHash, 'codes': codes },
        ];
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        const orders = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client: Client, message) {
        //
        //    {
        //        "type": "myOrder",
        //        "code": "KRW-BTC",
        //        "uuid": "C0101000000001818113",
        //        "ask_bid": "BID",
        //        "order_type": "limit",
        //        "state": "trade",
        //        "trade_uuid": "C0101000000001744207",
        //        "price": 1927000,
        //        "volume": 0.4697,
        //        "remaining_volume": 0.0803,
        //        "executed_volume": 0.4697,
        //        "trades_count": 1,
        //        "reserved_fee": 0,
        //        "remaining_fee": 0,
        //        "paid_fee": 0,
        //        "executed_funds": 905111.9000,
        //        "trade_timestamp": 1727052318148,
        //        "order_timestamp": 1727052318074,
        //        "timestamp": 1727052318369,
        //        "stream_type": "REALTIME"
        //    }
        //
        const messageHash = 'myOrder';
        const parsed = this.parseWsOrder (message);
        const symbol = this.safeString (parsed, 'symbol');
        // const orderId = this.safeString (parsed, 'id');
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const cachedOrders = this.orders;
        cachedOrders.append (parsed);
        client.resolve (cachedOrders, messageHash);
        const symbolSpecificMessageHash = messageHash + ':' + symbol;
        client.resolve (cachedOrders, symbolSpecificMessageHash);
    }

    parseWsOrder (order, market: Market = undefined) {
        //
        //    {
        //        "type": "myOrder",
        //        "code": "KRW-BTC",
        //        "uuid": "C0101000000001818113",
        //        "ask_bid": "BID",
        //        "order_type": "limit",
        //        "state": "trade",
        //        "trade_uuid": "C0101000000001744207",
        //        "price": 1927000,
        //        "volume": 0.4697,
        //        "remaining_volume": 0.0803,
        //        "executed_volume": 0.4697,
        //        "trades_count": 1,
        //        "reserved_fee": 0,
        //        "remaining_fee": 0,
        //        "paid_fee": 0,
        //        "executed_funds": 905111.9000,
        //        "trade_timestamp": 1727052318148,
        //        "order_timestamp": 1727052318074,
        //        "timestamp": 1727052318369,
        //        "stream_type": "REALTIME"
        //    }
        //
        const marketId = this.safeString (order, 'code');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.safeInteger (order, 'order_timestamp');
        const sideId = this.safeString (order, 'ask_bid');
        const side = (sideId === 'BID') ? ('buy') : ('sell');
        const typeId = this.safeString (order, 'order_type');
        let type: Str = undefined;
        if (typeId === 'limit') {
            type = 'limit';
        } else if (typeId === 'price') {
            type = 'market';
        } else if (typeId === 'market') {
            type = 'market';
        }
        const stateId = this.safeString (order, 'state');
        let status: Str = undefined;
        if (stateId === 'wait') {
            status = 'open';
        } else if (stateId === 'trade') {
            status = 'open';
        } else if (stateId === 'done') {
            status = 'closed';
        } else if (stateId === 'cancel') {
            status = 'canceled';
        }
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'volume');
        const remaining = this.safeString (order, 'remaining_volume');
        const filled = this.safeString (order, 'executed_volume');
        const cost = this.safeString (order, 'executed_funds');
        const feeCost = this.safeString (order, 'paid_fee');
        let fee: NullableDict = undefined;
        if (feeCost !== undefined) {
            const marketForFee = this.safeMarket (marketId, market);
            const feeCurrency = this.safeString (marketForFee, 'quote');
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'uuid'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.safeInteger (order, 'trade_timestamp'),
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    handleMessage (client: Client, message) {
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        const topic = this.safeString (message, 'type');
        if (topic !== undefined) {
            const methods: Dict = {
                'ticker': this.handleTicker,
                'orderbookdepth': this.handleOrderBook,
                'orderbook': this.handleOrderBook,
                'transaction': this.handleTrades,
                'trade': this.handleTrades,
                'myAsset': this.handleBalance,
                'myOrder': this.handleOrders,
            };
            const method = this.safeValue (methods, topic);
            if (method !== undefined) {
                method.call (this, client, message);
            }
        }
    }
}
