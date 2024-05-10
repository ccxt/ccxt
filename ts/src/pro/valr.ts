//  ---------------------------------------------------------------------------

import valrRest from '../valr.js';
import { ArgumentsRequired } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import { sha512 } from '../static_dependencies/noble-hashes/sha512.js';
import type { Balances, Int, OHLCV, Order, OrderBook, Str, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { } from '../base/ws/OrderBook.js';
import Precise from '../base/Precise.js';

//  ---------------------------------------------------------------------------

export default class valr extends valrRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'cancelAllOrdersWs': false,
                'cancelOrderWs': false,
                'cancelOrdersWs': false,
                'createOrderWs': false,
                'editOrderWs': false,
                'fetchBalanceWs': false,
                'fetchClosedOrdersWs': false,
                'fetchCurrenciesWs': false,
                'fetchDepositsWs': false,
                'fetchMarketsWs': false,
                'fetchMyTradesWs': false,
                'fetchOHLCVWs': false,
                'fetchOpenOrdersWs': false,
                'fetchOrderBookWs': false,
                'fetchOrderWs': false,
                'fetchOrdersWs': false,
                'fetchTickerWs': false,
                'fetchTradesWs': false,
                'fetchTradingFeesWs': false,
                'fetchWithdrawalsWs': false,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOrders': true,
                'watchOrdersForSymbols': undefined,
                'watchPosition': undefined,
                'watchPositions': false,
                'watchStatus': undefined,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'ws': true,
            },
            'timeframes': {
                '1m': 60,
                '5m': 300,
                '15m': 900,
                '30m': 1800,
                '1h': 3600,
                '6h': 21600,
                '1d': 86400,
            },
            'urls': {
                'api': {
                    'ws': {
                        'trade': 'wss://api.valr.com/ws/trade',
                        'account': 'wss://api.valr.com/ws/account',
                    },
                },
            },
            'options': {
            },
            'streaming': {
                'keepAlive': 30000,
            },
        });
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        this.checkRequiredSymbolArgument ('watchOrderBook', symbol);
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const marketIds = this.marketIds (symbols);
        if (symbols === undefined || marketIds === undefined) {
            throw new ArgumentsRequired (this.id + ' watchOrderBookForSymbols() requires valid symbol list');
        }
        const url = this.urls['api']['ws']['trade'];
        const client = this.authenticate (url);
        const messageHashes = [];
        for (let i = 0; i < marketIds.length; i++) {
            messageHashes.push ('AGGREGATED_ORDERBOOK_UPDATE:' + marketIds[i]);
        }
        const subscriptionHashes = Object.keys (client.subscriptions);
        for (let i = 0; i < subscriptionHashes.length; i++) {
            const subscriptionHash = subscriptionHashes[i];
            if (subscriptionHash.indexOf ('AGGREGATED_ORDERBOOK_UPDATE:') >= 0) {
                const subMarketId = this.safeString (subscriptionHash.split (':'), 1);
                if (subMarketId && !this.inArray (subMarketId, marketIds)) {
                    marketIds.push (subMarketId);
                }
            }
        }
        const message = {
            'type': 'SUBSCRIBE',
            'subscriptions': [
                {
                    'event': 'AGGREGATED_ORDERBOOK_UPDATE',
                    'pairs': marketIds,
                },
            ],
        };
        const orderbook = await this.watchMultiple (url, messageHashes, message, messageHashes);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        // {
        //     "type": "AGGREGATED_ORDERBOOK_UPDATE",
        //     "currencyPairSymbol": "PYUSDUSDT",
        //     "LastChange": "2024-03-27T12:39:52.562Z",
        //     "SequenceNumber": 173347
        //     "data":
        //     {
        //         "Asks":
        //         [
        //             {
        //                 "side": "sell",
        //                 "quantity": "495.26",
        //                 "price": "0.99735",
        //                 "currencyPair": "PYUSDUSDT",
        //                 "orderCount": 1
        //             },
        //             {
        //                 "side": "sell",
        //                 "quantity": "11352.38",
        //                 "price": "0.99775",
        //                 "currencyPair": "PYUSDUSDT",
        //                 "orderCount": 1
        //             },
        //             {
        //                 "side": "sell",
        //                 "quantity": "11925.87",
        //                 "price": "0.99825",
        //                 "currencyPair": "PYUSDUSDT",
        //                 "orderCount": 1
        //             },
        //         ],
        //         "Bids":
        //         [
        //             {
        //                 "side": "buy",
        //                 "quantity": "498.38",
        //                 "price": "0.99727",
        //                 "currencyPair": "PYUSDUSDT",
        //                 "orderCount": 1
        //             },
        //             {
        //                 "side": "buy",
        //                 "quantity": "11316.78",
        //                 "price": "0.99687",
        //                 "currencyPair": "PYUSDUSDT",
        //                 "orderCount": 1
        //             },
        //             {
        //                 "side": "buy",
        //                 "quantity": "11964.06",
        //                 "price": "0.99637",
        //                 "currencyPair": "PYUSDUSDT",
        //                 "orderCount": 1
        //             },
        //         ]
        //     }
        // }
        const updateType = this.safeString (message, 'type');
        const marketId = this.safeString (message, 'currencyPairSymbol');
        const messageHash = updateType + ':' + marketId;
        const symbol = this.safeSymbol (marketId);
        const data = this.safeValue (message, 'data');
        const nonce = this.safeInteger (data, 'SequenceNumber');
        const datetime = this.safeString (data, 'LastChange');
        const timestamp = this.parse8601 (datetime);
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.countedOrderBook ();
        }
        const snapshot = {
            'asks': this.parseWsOrderBookSide (this.safeValue (data, 'Asks')),
            'bids': this.parseWsOrderBookSide (this.safeValue (data, 'Bids')),
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': datetime,
            'nonce': nonce,
        };
        // Using reset instead of update as csharp does not support update
        orderbook.reset (snapshot);
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
        // if (this.verbose) {
        //     this.log (this.iso8601 (this.milliseconds ()), 'handleOrderBook', orderbook.limit ());
        // }
    }

    parseWsOrderBookSide (side) {
        const result = [];
        for (let i = 0; i < side.length; i++) {
            result.push ([
                this.safeNumber (side[i], 'price'),
                this.safeNumber (side[i], 'quantity'),
                this.safeNumber (side[i], 'orderCount'),
            ]);
        }
        return result;
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        this.checkRequiredSymbolArgument ('watchTicker', symbol);
        const tickers = await this.watchTickers ([ symbol ], params);
        return this.safeValue (tickers, symbol);
    }

    async watchTickers (symbols: string[] = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const marketIds = this.marketIds (symbols);
        if (symbols === undefined || marketIds === undefined) {
            throw new ArgumentsRequired (this.id + ' watchTickers() requires valid symbol list');
        }
        const url = this.urls['api']['ws']['trade'];
        const client = this.authenticate (url);
        const messageHashes = [];
        for (let i = 0; i < marketIds.length; i++) {
            messageHashes.push ('MARKET_SUMMARY_UPDATE:' + marketIds[i]);
        }
        const subscriptionHashes = Object.keys (client.subscriptions);
        for (let i = 0; i < subscriptionHashes.length; i++) {
            const subscriptionHash = subscriptionHashes[i];
            if (subscriptionHash.indexOf ('MARKET_SUMMARY_UPDATE:') >= 0) {
                const subMarketId = this.safeString (subscriptionHash.split (':'), 1);
                if (subMarketId && !this.inArray (subMarketId, marketIds)) {
                    marketIds.push (subMarketId);
                }
            }
        }
        const message = {
            'type': 'SUBSCRIBE',
            'subscriptions': [
                {
                    'event': 'MARKET_SUMMARY_UPDATE',
                    'pairs': marketIds,
                },
            ],
        };
        const ticker = await this.watchMultiple (url, messageHashes, message, messageHashes);
        const symbol = this.safeString (ticker, 'symbol');
        const tickers = {};
        tickers[symbol] = ticker;
        return tickers;
    }

    handleTicker (client: Client, message) {
        // {
        //     "type": "MARKET_SUMMARY_UPDATE",
        //     "currencyPairSymbol": "BTCZAR",
        //     "data":
        //     {
        //         "currencyPairSymbol": "BTCZAR",
        //         "askPrice": "1291722",
        //         "bidPrice": "1291721",
        //         "lastTradedPrice": "1291722",
        //         "previousClosePrice": "1262175",
        //         "baseVolume": "18.03385304",
        //         "quoteVolume": "22799989.56979442",
        //         "highPrice": "1293659",
        //         "lowPrice": "1243091",
        //         "created": "2024-03-24T21:49:08.217Z",
        //         "changeFromPrevious": "2.34",
        //         "markPrice": "1291638"
        //     }
        // }
        const updateType = this.safeString (message, 'type');
        const marketId = this.safeString (message, 'currencyPairSymbol');
        const symbol = this.symbol (marketId);
        const messageHash = updateType + ':' + marketId;
        const tickerWs = this.safeValue (message, 'data');
        const ticker = this.parseTicker (tickerWs);
        this.tickers[symbol] = ticker;
        client.resolve (ticker, messageHash);
        // if (this.verbose) {
        //     this.log (this.iso8601 (this.milliseconds ()), 'handleTicker', ticker);
        // }
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        this.checkRequiredSymbolArgument ('watchTrades', symbol);
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const marketIds = this.marketIds (symbols);
        if (symbols === undefined || marketIds === undefined) {
            throw new ArgumentsRequired (this.id + ' watchTradesForSymbols() requires valid symbol list');
        }
        const url = this.urls['api']['ws']['trade'];
        const client = this.authenticate (url);
        const messageHashes = [];
        for (let i = 0; i < marketIds.length; i++) {
            messageHashes.push ('NEW_TRADE:' + marketIds[i]);
        }
        const subscriptionHashes = Object.keys (client.subscriptions);
        for (let i = 0; i < subscriptionHashes.length; i++) {
            const subscriptionHash = subscriptionHashes[i];
            if (subscriptionHash.indexOf ('NEW_TRADE:') >= 0) {
                const subMarketId = this.safeString (subscriptionHash.split (':'), 1);
                if (subMarketId && !this.inArray (subMarketId, marketIds)) {
                    marketIds.push (subMarketId);
                }
            }
        }
        const message = {
            'type': 'SUBSCRIBE',
            'subscriptions': [
                {
                    'event': 'NEW_TRADE',
                    'pairs': marketIds,
                },
            ],
        };
        const trades = await this.watchMultiple (url, messageHashes, message, messageHashes);
        if (this.newUpdates) {
            const first = this.safeValue (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        // {
        //     "type": "NEW_TRADE",
        //     "currencyPairSymbol": "BTCZAR",
        //     "data":
        //     {
        //         "price": "1360468",
        //         "quantity": "0.0004402",
        //         "currencyPair": "BTCZAR",
        //         "tradedAt": "2024-03-27T12:33:19.918Z",
        //         "takerSide": "buy",
        //         "id": "31934cc3-ec36-11ee-92bb-8f9d774e71b6"
        //     }
        // }
        const updateType = this.safeString (message, 'type');
        const marketId = this.safeString (message, 'currencyPairSymbol');
        const messageHash = updateType + ':' + marketId;
        const symbol = this.safeSymbol (marketId);
        const data = this.safeValue (message, 'data');
        const parsed = {
            'timestamp': this.parse8601 (this.safeString (data, 'tradedAt')),
            'datetime': this.safeString (data, 'tradedAt'),
            'id': this.safeString (data, 'id'),
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'symbol': symbol,
            'price': this.safeString (data, 'price'),
            'amount': this.safeString (data, 'quantity'),
            'side': this.safeString (data, 'takerSide'),
            'info': data,
            'fee': undefined,
        };
        const trade = this.safeTrade (parsed);
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        stored.append (trade);
        client.resolve (stored, messageHash);
        // if (this.verbose) {
        //     this.log (this.iso8601 (this.milliseconds ()), 'handleTrades', trade);
        // }
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        this.checkRequiredSymbolArgument ('watchOHLCV', symbol);
        const symbolAndTimeframe = [ symbol, timeframe ];
        const symbolsAndTimeframes = [ symbolAndTimeframe ];
        const candles = await this.watchOHLCVForSymbols (symbolsAndTimeframes, since, limit, params);
        const candlesSymbol = this.safeValue (candles, symbol);
        return this.safeValue (candlesSymbol, timeframe);
    }

    async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray (symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired (this.id + ' watchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [["BTC/USDT", "1m"], ["LTC/USDT", "5m"]]');
        }
        const marketIds = [];
        const symbols = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const symbolAndTimeframe = symbolsAndTimeframes[i];
            const timeframe = symbolAndTimeframe[1];
            if ((timeframe === undefined) || !(timeframe in this.timeframes)) {
                throw new ArgumentsRequired (this.id + ' watchOHLCVForSymbols() requires supported timeframe option');
            }
            const symbol = symbolAndTimeframe[0];
            const marketId = this.marketId (symbol);
            this.checkRequiredSymbolArgument ('watchOHLCVForSymbols', symbol);
            messageHashes.push ('NEW_TRADE_BUCKET_' + timeframe + ':' + marketId);
            if (!this.inArray (symbol, symbols)) {
                symbols.push (symbol);
                marketIds.push (marketId);
            }
        }
        if (marketIds === undefined) {
            throw new ArgumentsRequired (this.id + ' watchTradesForSymbols() requires valid symbol list');
        }
        const url = this.urls['api']['ws']['trade'];
        const client = this.authenticate (url);
        const subscriptionHashes = Object.keys (client.subscriptions);
        for (let i = 0; i < subscriptionHashes.length; i++) {
            const subscriptionHash = subscriptionHashes[i];
            if (subscriptionHash.indexOf ('NEW_TRADE_BUCKET') >= 0) {
                const subMarketId = this.safeString (subscriptionHash.split (':'), 1);
                if (subMarketId && !this.inArray (subMarketId, marketIds)) {
                    marketIds.push (subMarketId);
                }
            }
        }
        const message = {
            'type': 'SUBSCRIBE',
            'subscriptions': [
                {
                    'event': 'NEW_TRADE_BUCKET',
                    'pairs': marketIds,
                },
            ],
        };
        // call to watchMultiple only gets one of the multiple symbolsAndTimeframes returned as they all arrive
        // at the same time. The rest are stored in seperate caches.
        const [ symbolWs, timeframeWs, candles ] = await this.watchMultiple (url, messageHashes, message, messageHashes);
        // const symbolTimeframeCandles = {};
        if (this.newUpdates) {
            // for (let i = 0; i < symbols.length; i++) {
            //     const symbolReq = symbols[i];
            //     const candleSymbol = this.safeDict (this.ohlcvs, symbolReq);
            //     if (candleSymbol !== undefined) {
            //         const candleStored = this.safeValue (candleSymbol, timeframeWs);
            //         if (candleStored !== undefined) {
            //             const limitReg = candles.getLimit (symbolWs, limit);
            //             const filtered = this.filterBySinceLimit (candles, since, limit, 0, true);
            //             symbolTimeframeCandles[symbolReq] = {};
            //             symbolTimeframeCandles[symbolReq][timeframeWs] = filtered;
            //         }
            //     }
            // }
            limit = candles.getLimit (symbolWs, limit);
        }
        const filtered = this.filterBySinceLimit (candles, since, limit, 0, true);
        return this.createOHLCVObject (symbolWs, timeframeWs, filtered);
    }

    handleOHLCV (client: Client, message) {
        // Only support timeframe of 1m
        // {
        //     type: 'NEW_TRADE_BUCKET',
        //     currencyPairSymbol: 'BTCUSDC',
        //     data: {
        //       currencyPairSymbol: 'BTCUSDC',
        //       bucketPeriodInSeconds: 60,
        //       startTime: '2024-04-05T09:03:00Z',
        //       open: '67310',
        //       high: '67310',
        //       low: '67310',
        //       close: '67310',
        //       volume: '0',
        //       quoteVolume: '0'
        //     }
        // }
        const updateType = this.safeString (message, 'type');
        const marketId = this.safeString (message, 'currencyPairSymbol');
        const symbol = this.safeSymbol (marketId);
        const data = this.safeValue (message, 'data');
        const period = this.safeInteger (data, 'bucketPeriodInSeconds');
        const timeframe = this.findTimeframe (period);
        const parsed = [
            this.parse8601 (this.safeString (data, 'startTime')),
            this.safeNumber (data, 'open'), // open
            this.safeNumber (data, 'high'), // high
            this.safeNumber (data, 'low'), // low
            this.safeNumber (data, 'close'), // close
            this.safeNumber (data, 'volume'), // volume
        ];
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        // for multiOHLCV we need special object, as opposed to other "multi"
        // methods, because OHLCV response item does not contain symbol
        // or timeframe, thus otherwise it would be unrecognizable
        const messageHash = updateType + '_' + timeframe + ':' + marketId;
        client.resolve ([ symbol, timeframe, stored ], messageHash);
        // if (this.verbose) {
        //     this.log (this.iso8601 (this.milliseconds ()), 'handleOHLCV', symbol, timeframe, parsed);
        // }
    }

    async watchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['account'];
        const messageHash = 'BALANCE_UPDATE';
        this.authenticate (url);
        const balances = await this.watch (url, messageHash);
        return balances;
    }

    handleBalance (client: Client, message) {
        const data = this.safeValue (message, 'data');
        // {
        //     "type": "BALANCE_UPDATE",
        //     "data":
        //     {
        //         "currency":
        //         {
        //             "symbol": "R",
        //             "decimalPlaces": 2,
        //             "isActive": "True",
        //             "shortName": "ZAR",
        //             "longName": "Rand",
        //             "supportedWithdrawDecimalPlaces": 2,
        //             "collateral": "True",
        //             "collateralWeight": "0.99"
        //         },
        //         "available": "1022.05",
        //         "reserved": "10",
        //         "total": "1032.05",
        //         "updatedAt": "2024-03-25T15:38:48.580Z",
        //         "lendReserved": "0",
        //         "borrowCollateralReserved": "0",
        //         "borrowedAmount": "0",
        //         "totalInReference": "53.31359999",
        //         "totalInReferenceWeighted": "52.7804639901",
        //         "referenceCurrency": "USDC"
        //     }
        // }
        const [ code, balance ] = this.parseWsBalance (data);
        if (this.balance === undefined) {
            this.balance = {};
        }
        this.balance['info'] = this.safeValue (balance, 'info');
        this.balance['datetime'] = this.safeString (balance, 'datetime');
        this.balance['timestamp'] = this.safeString (balance, 'timestamp');
        if (code !== undefined) {
            this.balance[code] = this.safeDict (balance, code);
            this.balance = this.safeBalance (this.balance);
        }
        const updateType = this.safeString (message, 'type');
        client.resolve (balance, updateType);
        // if (this.verbose) {
        //     this.log (this.iso8601 (this.milliseconds ()), 'handleBalance', balance);
        // }
    }

    parseWsBalance (balanceWs): any {
        const result = {
            'timestamp': this.parse8601 (this.safeString (balanceWs, 'updatedAt')),
            'datetime': this.safeString (balanceWs, 'updatedAt'),
            'info': balanceWs,
        };
        const currency = this.safeValue (balanceWs, 'currency');
        const code = this.safeCurrencyCode (this.safeString (currency, 'shortName'));
        const debt = Precise.stringAdd (
            this.safeString (balanceWs, 'lendReserved'),
            this.safeString (balanceWs, 'borrowReserved')
        );
        if (code !== undefined) {
            result[code] = {
                'free': this.safeFloat (balanceWs, 'available'),
                'used': this.safeFloat (balanceWs, 'reserved'),
                'total': this.safeFloat (balanceWs, 'total'),
                'debt': debt,
            };
        }
        return [ code, result ];
    }

    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['account'];
        let messageHash = 'NEW_ACCOUNT_TRADE';
        if (symbol) {
            messageHash = messageHash + ':' + symbol;
        }
        this.authenticate (url);
        const trades = await this.watch (url, messageHash) as ArrayCacheBySymbolById;
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrades (client: Client, message) {
        // {
        //     "type": "NEW_ACCOUNT_TRADE",
        //     "currencyPairSymbol": "BTCZAR",
        //     "data": {
        //       "price": "9500",
        //       "quantity": "0.00105263",
        //       "currencyPair": "BTCZAR",
        //       "tradedAt": "2019-04-25T20:36:53.426Z",
        //       "side": "buy",
        //       "orderId":"d5a81b99-fabf-4be1-bc7c-1a00d476089d",
        //       "id":"7a2b5560-5a71-4640-9e4b-d659ed26278a"
        //     }
        //   }
        const marketId = this.safeString (message, 'currencyPairSymbol');
        const symbol = this.safeSymbol (marketId);
        const tradeMessage = this.safeDict (message, 'data');
        const timestamp = this.parse8601 (this.safeString (tradeMessage, 'tradedAt'));
        const myTrade = this.safeTrade ({
            'info': tradeMessage,
            'timestamp': timestamp,
            'datetime': this.safeString (tradeMessage, 'tradedAt'),
            'id': this.safeString (tradeMessage, 'id'),
            'order': this.safeString (tradeMessage, 'orderId'),
            'symbol': symbol,
            'side': this.safeString (tradeMessage, 'side'),
            'amount': this.safeNumber (tradeMessage, 'quantity'),
            'price': this.safeNumber (tradeMessage, 'price'),
        });
        // watch All symbols
        let cachedTrades = this.myTrades;
        if (cachedTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            cachedTrades = new ArrayCacheBySymbolById (limit);
            this.myTrades = cachedTrades;
        }
        const updateType = this.safeString (message, 'type');
        const messageHashSymbol = updateType + ':' + symbol;
        cachedTrades.append (myTrade);
        client.resolve (cachedTrades, updateType);
        // watch specific symbol
        client.resolve (cachedTrades, messageHashSymbol);
        // if (this.verbose) {
        //     this.log (this.iso8601 (this.milliseconds ()), 'handleMyTrades', myTrade);
        // }
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['account'];
        const messageHashes = [
            // 'INSTANT_ORDER_COMPLETED',  // New Simple Buy/Sell executed
            // New order added to open orders
            'OPEN_ORDERS_UPDATE',
            'ORDER_STATUS_UPDATE',
            // {
            //     "type": "ORDER_STATUS_UPDATE",
            //     "data":
            //     {
            //         "orderId": "0967a400-fcb3-45bd-8f4a-e2b0872f53a8",
            //         "orderStatusType": "Cancelled",
            //         "currencyPair": "BTCZAR",
            //         "originalPrice": "2000000",
            //         "remainingQuantity": "0.00001",
            //         "originalQuantity": "0.00001",
            //         "orderSide": "sell",
            //         "orderType": "post-only limit",
            //         "failedReason": "",
            //         "orderUpdatedAt": "2024-04-01T16:01:41.456Z",
            //         "orderCreatedAt": "2024-04-01T16:00:31.074Z",
            //         "executedPrice": "0",
            //         "executedQuantity": "0",
            //         "executedFee": "0"
            //     }
            // }
        ];
        this.authenticate (url);
        if (symbol) {
            for (let i = 0; i < messageHashes.length; i++) {
                messageHashes[i] = messageHashes[i] + ':' + symbol;
            }
        }
        const orders = await this.watchMultiple (url, messageHashes);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    handleOrders (client: Client, message) {
        // if (this.verbose) {
        //     this.log (this.iso8601 (this.milliseconds ()), 'handleOrders', message);
        // }
        const messageHash = this.safeString (message, 'type');
        const data = this.safeValue (message, 'data');
        const results = [];
        const messageHashesSymbol = [];
        let ordersMessage = [];
        if (Array.isArray (data)) {
            ordersMessage = this.arrayConcat (ordersMessage, data);
        } else {
            ordersMessage.push (data);
        }
        for (let i = 0; i < ordersMessage.length; i++) {
            const orderWs = this.parseWsOrder (ordersMessage[i]);
            results.push (orderWs);
            const symbol = this.safeString (orderWs, 'symbol');
            // const orderId = this.safeString (parsed, 'id');
            if (symbol !== undefined) {
                const messageHashSymbol = messageHash + ':' + symbol;
                if (!this.inArray (messageHashesSymbol, messageHashesSymbol)) {
                    messageHashesSymbol.push (messageHashSymbol);
                }
                if (this.orders === undefined) {
                    const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
                    this.orders = new ArrayCacheBySymbolById (limit);
                }
                const cachedOrders = this.orders;
                // const orders = this.safeValue (cachedOrders.hashmap, symbol, {});
                // const order = this.safeValue (orders, orderId);
                // if (order !== undefined) {
                // Use data from existing order before updating orders
                // }
                cachedOrders.append (orderWs);
            }
        }
        client.resolve (this.orders, messageHash);
        for (let i = 0; i < messageHashesSymbol.length; i++) {
            client.resolve (this.orders, messageHashesSymbol[i]);
        }
    }

    parseWsOrder (order, market = undefined) {
        // OPEN_ORDERS_UPDATE : New order added to open orders
        // [
        //     {
        //         "orderId": "38511e49-a755-4f8f-a2b1-232bae6967dc",
        //         "side": "sell",
        //         "quantity": "0.1",
        //         "price": "10000",
        //         "currencyPair": "BTCZAR"
        //         "createdAt": "2019-04-17T19:51:35.776Z",
        //         "originalQuantity": "0.1",
        //         "filledPercentage": "0.00",
        //         "type": "post-only limit",
        //         "status": "placed",
        //         "updatedAt": "2019-04-17T19:51:35.776Z",
        //         "timeInForce": "GTC",
        //         "customerOrderId": ""
        //     },
        //     {
        //         "orderId": "3f759a40-09ee-44bd-a5aa-29836bbaab1a",
        //         "side": "sell",
        //         "quantity": "0.04",
        //         "price": "10000",
        //         "currencyPair": "BTCZAR"
        //         "createdAt": "2019-04-17T19:51:35.776Z",
        //         "originalQuantity": "0.1",
        //         "filledPercentage": "60.00",
        //         "customerOrderId": "3"
        //         "type": "post-only limit",
        //         "status": "placed",
        //         "updatedAt": "2019-04-17T19:51:35.776Z",
        //         "timeInForce": "GTC",
        //     },
        // ]
        // OPEN_ORDERS_UPDATE : Open order modified
        // [
        //     {
        //         "orderId":"6eaf85b7-7e69-4e26-9664-33a8f23bfb4f",
        //         "side":"buy",
        //         "quantity":"0.0002",
        //         "price":"29300",
        //         "currencyPair":"BTCUSDC",
        //         "createdAt":"2023-10-24T13:33:43.503Z",
        //         "originalQuantity":"0.0002",
        //         "filledPercentage":"0.00",
        //         "customerOrderId":"MyLimit1234",
        //         "type":"limit",
        //         "status":"Order Modified",
        //         "updatedAt":"2023-10-24T13:36:42.660Z",
        //         "timeInForce":"GTC"
        //     },
        // ]
        // ORDER_STATUS_UPDATE : Order status has been updated
        // {
        //     "orderId": "9135e74e-bd4f-4aec-ba1f-d38897826cda",
        //     "orderStatusType": "Cancelled",
        //     "currencyPair": "BTCZAR",
        //     "originalPrice": "2100000",
        //     "remainingQuantity": "0.00002",
        //     "originalQuantity": "0.00002",
        //     "orderSide": "sell",
        //     "orderType": "post-only limit",
        //     "failedReason": "None",
        //     "orderUpdatedAt": "2024-04-01T16:14:00.963Z",
        //     "orderCreatedAt": "2024-04-01T16:01:55.985Z",
        //     "executedPrice": "0",
        //     "executedQuantity": "0",
        //     "executedFee": "0"
        // }
        // {
        //     "orderId": "bf17d427-f9e8-44ef-82c1-4ed94c5f4f7f",
        //     "orderStatusType": "Filled",
        //     "currencyPair": "BTCZAR",
        //     "originalPrice": "1335001",
        //     "remainingQuantity": "0",
        //     "originalQuantity": "0.00001",
        //     "orderSide": "sell",
        //     "orderType": "post-only limit",
        //     "failedReason": "",
        //     "orderUpdatedAt": "2024-04-01T16:14:54.716Z",
        //     "orderCreatedAt": "2024-04-01T16:13:53.400Z",
        //     "executedPrice": "1335001",
        //     "executedQuantity": "0.00001",
        //     "executedFee": "0"
        // }
        const orderStatus = this.safeString2 (order, 'status', 'orderStatusType');
        let status = undefined;
        if (orderStatus === 'Placed' || orderStatus === 'Order Modified') {
            status = 'open';
        } else if (orderStatus === 'Cancelled' || orderStatus === 'Failed') {
            status = 'canceled';
        } else if (orderStatus === 'Filled') {
            status = 'closed';
        }
        const orderTypeReceived = this.safeString (order, 'type');
        let typeOrder = undefined;
        let postOnly = undefined;
        if (orderTypeReceived !== undefined) {
            if (orderTypeReceived.indexOf ('limit') >= 0) {
                typeOrder = 'limit';
                if (orderTypeReceived.indexOf ('post-only') >= 0) {
                    postOnly = true;
                } else {
                    postOnly = false;
                }
            }
        }
        const filledPercentage = this.safeString (order, 'filledPercentage');
        const remaining = this.safeString (order, 'remainingQuantity');
        const amount = this.safeString (order, 'originalQuantity');
        let filled = undefined;
        if (remaining === undefined && filledPercentage !== undefined) {
            filled = Precise.stringMul (amount, filledPercentage);
        }
        return this.safeOrder ({
            'timestamp': this.parse8601 (this.safeString2 (order, 'createdAt', 'orderCreatedAt')),
            'datetime': this.safeString2 (order, 'createdAt', 'orderCreatedAt'),
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': this.safeString (order, 'customerOrderId'),
            'symbol': this.safeSymbol (this.safeString (order, 'currencyPair')),
            'status': status,
            'type': typeOrder,
            'side': this.safeString2 (order, 'side', 'orderSide'),
            'price': this.safeString2 (order, 'price', 'originalPrice'),
            'amount': amount,
            'average': this.safeString (order, 'averagePrice'),
            'filled': filled,
            'remaining': remaining,
            'lastUpdateTimestamp': this.parse8601 (this.safeString2 (order, 'updatedAt', 'orderUpdatedAt')),
            'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': postOnly,
            'info': order,
        });
    }

    async watchTransactions (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['account'];
        const messageHashes = [
            'ORDER_PROCESSED',
            // {
            //     "type": "ORDER_PROCESSED",
            //     "data": {
            //       "orderId": "247dc157-bb5b-49af-b476-2f613b780697",
            //       "success": true,
            //       "failureReason": ""
            //     }
            // }
            'MODIFY_ORDER_OUTCOME', // Order modified
            // {
            //     "type": "MODIFY_ORDER_OUTCOME",
            //     "data": {
            //       "success":true,
            //       "orderId":"6eaf85b7-7e69-4e26-9664-33a8f23bfb4f",
            //       "customerOrderId":"MyLimit1234",
            //       "modifyRequestId":"e0632f4e-7dab-11ee-95c0-07ba663465ab"
            //     }
            // }
            'FAILED_CANCEL_ORDER',
            // {
            //     "type": "FAILED_CANCEL_ORDER",
            //     "data": {
            //         "orderId": "247dc157-bb5b-49af-b476-2f613b780697",
            //         "message": "An error occurred while cancelling your order."
            //     }
            // }
        ];
        this.authenticate (url);
        const result = await this.watchMultiple (url, messageHashes);
        return result;
    }

    handleTransaction (client: Client, message) {
        const messageHash = this.safeString (message, 'type');
        const results = [];
        results.push (message);
        client.resolve (results, messageHash);
        // if (this.verbose) {
        //     this.log (this.iso8601 (this.milliseconds ()), 'handleTransaction', results);
        // }
    }

    ping (client: Client) {
        return { 'type': 'PING' };
    }

    handlePong (client: Client, message) {
        client.lastPong = this.milliseconds ();
        // {'type': 'PONG'}
        // if (this.verbose) {
        //     this.log (this.iso8601 (client.lastPong), 'handlePong', client.url, message);
        // }
        return message;
    }

    handleMessage (client: Client, message) {
        if (message === '') {
            // this.log (this.iso8601 (this.milliseconds ()), 'Empty Message');
            return;
        }
        const methods = {
            'AGGREGATED_ORDERBOOK_UPDATE': this.handleOrderBook,
            // 'FULL_ORDERBOOK_UPDATE': this.log,
            // {"type":"FULL_ORDERBOOK_UPDATE","currencyPairSymbol":"PYUSDUSDT","data":{"LastChange":1711543154427,"Asks":[{"Price":"0.99732","Orders":[{"orderId":"041200ae-2849-4660-93bd-ff6b8d1ebd39","quantity":"0"}]},{"Price":"0.99766","Orders":[{"orderId":"b6c577f1-bf4d-4963-9e9e-aa87499ee93c","quantity":"0"}]},{"Price":"0.99816","Orders":[{"orderId":"3d9ed086-0079-4cda-b052-5fbbf5fd6966","quantity":"0"}]},{"Price":"1.00315","Orders":[{"orderId":"992b1ba2-0a58-404f-9710-2fa617a908fe","quantity":"0"}]},{"Price":"1.00817","Orders":[{"orderId":"f0b97400-f7ed-43f1-be48-6097e71e5a25","quantity":"0"}]},{"Price":"1.01321","Orders":[{"orderId":"82555657-3968-42e7-b4d2-b9866b2e59aa","quantity":"0"}]}],"Bids":[{"Price":"0.99726","Orders":[{"orderId":"cb1a92fa-0db4-42db-bca8-0fee32cdfc8d","quantity":"0"}]},{"Price":"0.99678","Orders":[{"orderId":"8d4a8efd-f871-40d6-8c63-576d20e7777c","quantity":"0"}]},{"Price":"0.99628","Orders":[{"orderId":"517a2a39-dfe9-4605-938b-4564313012a4","quantity":"0"}]},{"Price":"0.99129","Orders":[{"orderId":"e4851eeb-25d4-4383-891c-7361c3e1bb10","quantity":"0"}]},{"Price":"0.98633","Orders":[{"orderId":"6a45081f-37e3-4977-9e91-68a95505698f","quantity":"0"}]},{"Price":"0.98139","Orders":[{"orderId":"6837f9fb-f4fc-434a-914b-0e25e9d1585a","quantity":"0"}]}],"SequenceNumber":173335,"Checksum":492550141}}
            'MARKET_SUMMARY_UPDATE': this.handleTicker,
            'NEW_TRADE_BUCKET': this.handleOHLCV,
            'NEW_TRADE': this.handleTrades,
            // 'MARK_PRICE_UPDATE': this.log,
            // Used for instant buy/sell orders not for exchange.
            // {"type":"MARK_PRICE_UPDATE","currencyPairSymbol":"BTCZAR","data":{"price":"1360201"}}
            'PONG': this.handlePong,
            'BALANCE_UPDATE': this.handleBalance,
            'NEW_ACCOUNT_TRADE': this.handleMyTrades,
            'OPEN_ORDERS_UPDATE': this.handleOrders,
            'ORDER_STATUS_UPDATE': this.handleOrders,
            'ORDER_PROCESSED': this.handleTransaction,
            'MODIFY_ORDER_OUTCOME': this.handleTransaction,
            'FAILED_CANCEL_ORDER': this.handleTransaction,
        };
        const eventType = this.safeString (message, 'type');
        const method = this.safeValue (methods, eventType);
        // const subscriptions = Object.values (client.subscriptions);
        // const messageHash = Object.values (client.messageHash)
        if (method) {
            // if (client.verbose) {
            //     this.log (this.iso8601 (this.milliseconds ()), 'handleMessage', 'eventType:', eventType, 'method:', method);
            // }
            method.call (this, client, message);
        // } else {
        //     if (this.verbose) {
        //         this.log (this.iso8601 (this.milliseconds ()), 'handleMessage: Unknown message.', message);
        //     }
        }
    }

    authenticate (url: string): Client {
        if ((this.clients !== undefined) && (url in this.clients)) {
            return this.client (url);
        }
        const subAccountId = this.safeString (this.options, 'subAccountId');
        this.checkRequiredCredentials ();
        const timestamp = this.milliseconds ().toString ();
        const urlParts = url.split ('/');
        const partsLength = urlParts.length;
        const path = '/' + this.safeString (urlParts, partsLength - 2) + '/' + this.safeString (urlParts, partsLength - 1);
        let message = timestamp + 'GET' + path;
        if (subAccountId) {
            message += subAccountId;
        }
        const payloadBase64 = this.stringToBase64 (message);
        const signature = this.hmac (
            this.base64ToBinary (payloadBase64),
            this.base64ToBinary (this.stringToBase64 (this.secret)),
            sha512,
            'hex'
        );
        // Can't pass headers directly to this.client. Use this.options['ws'] instead.
        const defaultOptions = {
            'ws': {
                'options': {
                    'headers': {},
                },
            },
        };
        this.extendExchangeOptions (defaultOptions);
        const originalHeaders = this.options['ws']['options']['headers'];
        const headers = {
            'X-VALR-API-KEY': this.apiKey,
            'X-VALR-SIGNATURE': signature,
            'X-VALR-TIMESTAMP': timestamp,
        };
        if (subAccountId) {
            headers['X-VALR-SUB-ACCOUNT-ID'] = subAccountId;
        }
        this.options['ws']['options']['headers'] = headers;
        const client = this.client (url);
        this.options['ws']['options']['headers'] = originalHeaders;
        return client;
    }
}

