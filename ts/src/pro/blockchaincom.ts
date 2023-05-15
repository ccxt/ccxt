//  ---------------------------------------------------------------------------

import blockchaincomRest from '../blockchaincom.js';
import { NotSupported, AuthenticationError, ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import { IndexType, Int } from '../base/types';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class blockchaincom extends blockchaincomRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchMyTrades': false,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.blockchain.info/mercury-gateway/v1/ws',
                },
            },
            'options': {
                'ws': {
                    'options': {
                        'headers': {
                            'Origin': 'https://exchange.blockchain.com',
                        },
                    },
                    'noOriginHeader': false,
                },
                'sequenceNumbers': {},
            },
            'streaming': {
            },
            'exceptions': {
            },
            'timeframes': {
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '1h': '3600',
                '6h': '21600',
                '1d': '86400',
            },
        });
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name blockchaincom#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://exchange.blockchain.com/api/#balances
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.authenticate (params);
        const messageHash = 'balance';
        const url = this.urls['api']['ws'];
        const subscribe = {
            'action': 'subscribe',
            'channel': 'balances',
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash, request);
    }

    handleBalance (client: Client, message) {
        //
        //  subscribed
        //     {
        //         seqnum: 1,
        //         event: 'subscribed',
        //         channel: 'balances',
        //         local_currency: 'USD',
        //         batching: false
        //     }
        //  snapshot
        //     {
        //         "seqnum": 2,
        //         "event": "snapshot",
        //         "channel": "balances",
        //         "balances": [
        //           {
        //             "currency": "BTC",
        //             "balance": 0.00366963,
        //             "available": 0.00266963,
        //             "balance_local": 38.746779155,
        //             "available_local": 28.188009155,
        //             "rate": 10558.77
        //           },
        //            ...
        //         ],
        //         "total_available_local": 65.477864168,
        //         "total_balance_local": 87.696634168
        //     }
        //
        const event = this.safeString (message, 'event');
        if (event === 'subscribed') {
            return message;
        }
        const result = { 'info': message };
        const balances = this.safeValue (message, 'balances', []);
        for (let i = 0; i < balances.length; i++) {
            const entry = balances[i];
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeNumber (entry, 'available');
            account['total'] = this.safeNumber (entry, 'balance');
            result[code] = account;
        }
        const messageHash = 'balance';
        this.balance = result;
        client.resolve (this.balance, messageHash);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market.
         * @see https://exchange.blockchain.com/api/#prices
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents. Allows '1m', '5m', '15m', '1h', '6h' '1d'. Can only watch one timeframe per symbol.
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bitfinex2 api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const messageHash = 'ohlcv:' + symbol;
        let request = {
            'action': 'subscribe',
            'channel': 'prices',
            'symbol': market['id'],
            'granularity': this.parseNumber (interval),
        };
        request = this.deepExtend (request, params);
        const url = this.urls['api']['ws'];
        const ohlcv = await this.watch (url, messageHash, request, messageHash, request);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0);
    }

    handleOHLCV (client: Client, message) {
        //
        //  subscribed
        //     {
        //         seqnum: 0,
        //         event: 'subscribed',
        //         channel: 'prices',
        //         symbol: 'BTC-USDT',
        //         granularity: 60
        //     }
        //
        //  updated
        //     {
        //         seqnum: 1,
        //         event: 'updated',
        //         channel: 'prices',
        //         symbol: 'BTC-USD',
        //         price: [ 1660085580000, 23185.215, 23185.935, 23164.79, 23169.97, 0 ]
        //     }
        //
        const event = this.safeString (message, 'event');
        if (event === 'subscribed') {
            return message;
        } else if (event === 'rejected') {
            throw new ExchangeError (this.id + ' ' + this.json (message));
        } else if (event === 'updated') {
            const marketId = this.safeString (message, 'symbol');
            const symbol = this.safeSymbol (marketId, undefined, '-');
            const messageHash = 'ohlcv:' + symbol;
            const request = this.safeValue (client.subscriptions, messageHash);
            const timeframeId = this.safeNumber (request, 'granularity');
            const timeframe = this.findTimeframe (timeframeId);
            const ohlcv = this.safeValue (message, 'price', []);
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append (ohlcv);
            client.resolve (stored, messageHash);
        } else {
            throw new NotSupported (this.id + ' ' + this.json (message));
        }
    }

    async watchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name blockchaincom#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://exchange.blockchain.com/api/#ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const messageHash = 'ticker:' + symbol;
        let request = {
            'action': 'subscribe',
            'channel': 'ticker',
            'symbol': market['id'],
        };
        request = this.deepExtend (request, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    handleTicker (client: Client, message) {
        //
        //  subscribed
        //     {
        //         seqnum: 0,
        //         event: 'subscribed',
        //         channel: 'ticker',
        //         symbol: 'BTC-USD'
        //     }
        //  snapshot
        //     {
        //         seqnum: 1,
        //         event: 'snapshot',
        //         channel: 'ticker',
        //         symbol: 'BTC-USD',
        //         price_24h: 23071.4,
        //         volume_24h: 236.28398636,
        //         last_trade_price: 23936.4,
        //         mark_price: 23935.335240262
        //     }
        // update
        //     {
        //         seqnum: 2,
        //         event: 'updated',
        //         channel: 'ticker',
        //         symbol: 'BTC-USD',
        //         mark_price: 23935.242443617
        //     }
        //
        const event = this.safeString (message, 'event');
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let ticker = undefined;
        if (event === 'subscribed') {
            return message;
        } else if (event === 'snapshot') {
            ticker = this.parseTicker (message, market);
        } else if (event === 'updated') {
            const lastTicker = this.safeValue (this.tickers, symbol);
            ticker = this.parseWsUpdatedTicker (message, lastTicker, market);
        }
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = ticker;
        client.resolve (ticker, messageHash);
    }

    parseWsUpdatedTicker (ticker, lastTicker = undefined, market = undefined) {
        //
        //     {
        //         seqnum: 2,
        //         event: 'updated',
        //         channel: 'ticker',
        //         symbol: 'BTC-USD',
        //         mark_price: 23935.242443617
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, undefined, '-');
        const last = this.safeString (ticker, 'mark_price');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (lastTicker, 'open'),
            'close': undefined,
            'last': last,
            'previousClose': this.safeString (lastTicker, 'close'),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (lastTicker, 'baseVolume'),
            'quoteVolume': undefined,
            'info': this.extend (this.safeValue (lastTicker, 'info', {}), ticker),
        }, market);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://exchange.blockchain.com/api/#trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of    trades to fetch
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const messageHash = 'trades:' + symbol;
        let request = {
            'action': 'subscribe',
            'channel': 'trades',
            'symbol': market['id'],
        };
        request = this.deepExtend (request, params);
        const trades = await this.watch (url, messageHash, request, messageHash, request);
        return this.filterBySinceLimit (trades, since, limit, 'timestamp');
    }

    handleTrades (client: Client, message) {
        //
        //  subscribed
        //     {
        //         seqnum: 0,
        //         event: 'subscribed',
        //         channel: 'trades',
        //         symbol: 'BTC-USDT'
        //     }
        //  updates
        //     {
        //         seqnum: 1,
        //         event: 'updated',
        //         channel: 'trades',
        //         symbol: 'BTC-USDT',
        //         timestamp: '2022-08-08T17:23:48.163096Z',
        //         side: 'sell',
        //         qty: 0.083523,
        //         price: 23940.67,
        //         trade_id: '563078810223444'
        //     }
        //
        const event = this.safeString (message, 'event');
        if (event !== 'updated') {
            return message;
        }
        const marketId = this.safeString (message, 'symbol');
        const symbol = this.safeSymbol (marketId);
        const market = this.safeMarket (marketId);
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const parsed = this.parseWsTrade (message, market);
        stored.append (parsed);
        this.trades[symbol] = stored;
        client.resolve (this.trades[symbol], messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        //     {
        //         seqnum: 1,
        //         event: 'updated',
        //         channel: 'trades',
        //         symbol: 'BTC-USDT',
        //         timestamp: '2022-08-08T17:23:48.163096Z',
        //         side: 'sell',
        //         qty: 0.083523,
        //         price: 23940.67,
        //         trade_id: '563078810223444'
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        const datetime = this.safeString (trade, 'timestamp');
        return this.safeTrade ({
            'id': this.safeString (trade, 'trade_id'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'symbol': this.safeSymbol (marketId, market, '-'),
            'order': undefined,
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'qty'),
            'cost': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#fetchOrders
         * @description watches information on multiple orders made by the user
         * @see https://exchange.blockchain.com/api/#mass-order-status-request-ordermassstatusrequest
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the blockchaincom api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        await this.authenticate ();
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
        }
        const url = this.urls['api']['ws'];
        const message = {
            'action': 'subscribe',
            'channel': 'trading',
        };
        const messageHash = 'orders';
        const request = this.deepExtend (message, params);
        const orders = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    handleOrders (client: Client, message) {
        //
        //     {
        //         seqnum: 1,
        //         event: 'rejected',
        //         channel: 'trading',
        //         text: 'Not subscribed to channel'
        //     }
        //  snapshot
        //     {
        //         seqnum: 2,
        //         event: 'snapshot',
        //         channel: 'trading',
        //         orders: [
        //           {
        //             orderID: '562965341621940',
        //             gwOrderId: 181011136260,
        //             clOrdID: '016caf67f7a94508webd',
        //             symbol: 'BTC-USD',
        //             side: 'sell',
        //             ordType: 'limit',
        //             orderQty: 0.000675,
        //             leavesQty: 0.000675,
        //             cumQty: 0,
        //             avgPx: 0,
        //             ordStatus: 'open',
        //             timeInForce: 'GTC',
        //             text: 'New order',
        //             execType: '0',
        //             execID: '21415965325',
        //             transactTime: '2022-08-08T23:31:00.550795Z',
        //             msgType: 8,
        //             lastPx: 0,
        //             lastShares: 0,
        //             tradeId: '0',
        //             fee: 0,
        //             price: 30000,
        //             marginOrder: false,
        //             closePositionOrder: false
        //           }
        //         ],
        //         positions: []
        //     }
        //  update
        //     {
        //         seqnum: 3,
        //         event: 'updated',
        //         channel: 'trading',
        //         orderID: '562965341621940',
        //         gwOrderId: 181011136260,
        //         clOrdID: '016caf67f7a94508webd',
        //         symbol: 'BTC-USD',
        //         side: 'sell',
        //         ordType: 'limit',
        //         orderQty: 0.000675,
        //         leavesQty: 0.000675,
        //         cumQty: 0,
        //         avgPx: 0,
        //         ordStatus: 'cancelled',
        //         timeInForce: 'GTC',
        //         text: 'Canceled by User',
        //         execType: '4',
        //         execID: '21416034921',
        //         transactTime: '2022-08-08T23:33:25.727785Z',
        //         msgType: 8,
        //         lastPx: 0,
        //         lastShares: 0,
        //         tradeId: '0',
        //         fee: 0,
        //         price: 30000,
        //         marginOrder: false,
        //         closePositionOrder: false
        //     }
        //
        const event = this.safeString (message, 'event');
        const messageHash = 'orders';
        const cachedOrders = this.orders;
        if (cachedOrders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        if (event === 'subscribed') {
            return message;
        } else if (event === 'rejected') {
            throw new ExchangeError (this.id + ' ' + this.json (message));
        } else if (event === 'snapshot') {
            const orders = this.safeValue (message, 'orders', []);
            for (let i = 0; i < orders.length; i++) {
                const order = orders[i];
                const parsedOrder = this.parseWsOrder (order);
                cachedOrders.append (parsedOrder);
            }
        } else if (event === 'updated') {
            const parsedOrder = this.parseWsOrder (message);
            cachedOrders.append (parsedOrder);
        }
        this.orders = cachedOrders;
        client.resolve (this.orders, messageHash);
    }

    parseWsOrder (order, market = undefined) {
        //
        //     {
        //         seqnum: 3,
        //         event: 'updated',
        //         channel: 'trading',
        //         orderID: '562965341621940',
        //         gwOrderId: 181011136260,
        //         clOrdID: '016caf67f7a94508webd',
        //         symbol: 'BTC-USD',
        //         side: 'sell',
        //         ordType: 'limit',
        //         orderQty: 0.000675,
        //         leavesQty: 0.000675,
        //         cumQty: 0,
        //         avgPx: 0,
        //         ordStatus: 'cancelled',
        //         timeInForce: 'GTC',
        //         text: 'Canceled by User',
        //         execType: '4',
        //         execID: '21416034921',
        //         transactTime: '2022-08-08T23:33:25.727785Z',
        //         msgType: 8,
        //         lastPx: 0,
        //         lastShares: 0,
        //         tradeId: '0',
        //         fee: 0,
        //         price: 30000,
        //         marginOrder: false,
        //         closePositionOrder: false
        //     }
        //
        const datetime = this.safeString (order, 'transactTime');
        const status = this.safeString (order, 'ordStatus');
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const tradeId = this.safeString (order, 'tradeId');
        const trades = [];
        if (tradeId !== '0') {
            trades.push ({ 'id': tradeId });
        }
        return this.safeOrder ({
            'id': this.safeString (order, 'orderID'),
            'clientOrderId': this.safeString (order, 'clOrdID'),
            'datetime': datetime,
            'timestamp': this.parse8601 (datetime),
            'status': this.parseWsOrderStatus (status),
            'symbol': this.safeSymbol (marketId, market),
            'type': this.safeString (order, 'ordType'), // limit, market, stop, stopLimit, trailingStop, fillOrKill
            'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': this.safeString (order, 'execInst') === 'ALO',
            'side': this.safeString (order, 'side'),
            'price': this.safeString (order, 'price'),
            'stopPrice': this.safeString (order, 'stopPx'),
            'cost': undefined,
            'amount': this.safeString (order, 'orderQty'),
            'filled': this.safeString (order, 'cumQty'),
            'remaining': this.safeString (order, 'leavesQty'),
            'trades': trades,
            'fee': {
                'rate': undefined,
                'cost': this.safeNumber (order, 'fee'),
                'currency': this.safeString (market, 'quote'),
            },
            'info': order,
            'lastTradeTimestamp': undefined,
            'average': this.safeString (order, 'avgPx'),
        }, market);
    }

    parseWsOrderStatus (status) {
        const statuses = {
            'pending': 'open',
            'open': 'open',
            'rejected': 'rejected',
            'cancelled': 'canceled',
            'filled': 'closed',
            'partial': 'open',
            'expired': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name blockchaincom#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://exchange.blockchain.com/api/#l2-order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {objectConstructor} params extra parameters specific to the blockchaincom api endpoint
         * @param {string|undefined} params.type accepts l2 or l3 for level 2 or level 3 order book
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const type = this.safeString (params, 'type', 'l2');
        params = this.omit (params, 'type');
        const messageHash = 'orderbook:' + symbol + ':' + type;
        const subscribe = {
            'action': 'subscribe',
            'channel': type,
            'symbol': market['id'],
        };
        const request = this.deepExtend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //  subscribe
        //     {
        //         seqnum: 0,
        //         event: 'subscribed',
        //         channel: 'l2',
        //         symbol: 'BTC-USDT',
        //         batching: false
        //     }
        //  snapshot
        //     {
        //         seqnum: 1,
        //         event: 'snapshot',
        //         channel: 'l2',
        //         symbol: 'BTC-USDT',
        //         bids: [
        //           { num: 1, px: 0.01, qty: 22 },
        //         ],
        //         asks: [
        //           { num: 1, px: 23840.26, qty: 0.25 },
        //         ],
        //         timestamp: '2022-08-08T22:03:19.071870Z'
        //     }
        //  update
        //     {
        //         seqnum: 2,
        //         event: 'updated',
        //         channel: 'l2',
        //         symbol: 'BTC-USDT',
        //         bids: [],
        //         asks: [ { num: 1, px: 23855.06, qty: 1.04786347 } ],
        //         timestamp: '2022-08-08T22:03:19.014680Z'
        //     }
        //
        const event = this.safeString (message, 'event');
        const type = this.safeString (message, 'channel');
        const marketId = this.safeString (message, 'symbol');
        const symbol = this.safeSymbol (marketId);
        const messageHash = 'orderbook:' + symbol + ':' + type;
        const datetime = this.safeString (message, 'timestamp');
        const timestamp = this.parse8601 (datetime);
        let storedOrderBook = this.safeValue (this.orderbooks, symbol);
        if (storedOrderBook === undefined) {
            storedOrderBook = this.countedOrderBook ({});
            this.orderbooks[symbol] = storedOrderBook;
        }
        if (event === 'subscribed') {
            return message;
        } else if (event === 'snapshot') {
            const snapshot = this.parseCountedOrderBook (message, symbol, timestamp, 'bids', 'asks', 'px', 'qty', 'num');
            storedOrderBook.reset (snapshot);
        } else if (event === 'updated') {
            const asks = this.safeValue (message, 'asks', []);
            const bids = this.safeValue (message, 'bids', []);
            this.handleDeltas (storedOrderBook['asks'], asks);
            this.handleDeltas (storedOrderBook['bids'], bids);
            storedOrderBook['timestamp'] = timestamp;
            storedOrderBook['datetime'] = datetime;
        } else {
            throw new NotSupported (this.id + ' watchOrderBook() does not support ' + event + ' yet');
        }
        client.resolve (storedOrderBook, messageHash);
    }

    parseCountedBidAsk (bidAsk, priceKey: IndexType = 0, amountKey: IndexType = 1, countKey: IndexType = 2) {
        const price = this.safeNumber (bidAsk, priceKey);
        const amount = this.safeNumber (bidAsk, amountKey);
        const count = this.safeNumber (bidAsk, countKey);
        return [ price, amount, count ];
    }

    parseCountedBidsAsks (bidasks, priceKey: IndexType = 0, amountKey: IndexType = 1, countKey: IndexType = 2) {
        bidasks = this.toArray (bidasks);
        const result = [];
        for (let i = 0; i < bidasks.length; i++) {
            result.push (this.parseCountedBidAsk (bidasks[i], priceKey, amountKey, countKey));
        }
        return result;
    }

    parseCountedOrderBook (orderbook, symbol: string, timestamp: Int = undefined, bidsKey: IndexType = 'bids', asksKey: IndexType = 'asks', priceKey: IndexType = 0, amountKey: IndexType = 1, countKey: IndexType = 2) {
        const bids = this.parseCountedBidsAsks (this.safeValue (orderbook, bidsKey, []), priceKey, amountKey, countKey);
        const asks = this.parseCountedBidsAsks (this.safeValue (orderbook, asksKey, []), priceKey, amountKey, countKey);
        return {
            'symbol': symbol,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
    }

    handleDelta (bookside, delta) {
        const array = this.parseCountedBidAsk (delta, 'px', 'qty', 'num');
        bookside.storeArray (array);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    checkSequenceNumber (client: Client, message) {
        const seqnum = this.safeInteger (message, 'seqnum', 0);
        const channel = this.safeString (message, 'channel', '');
        const sequenceNumbersByChannel = this.safeValue (this.options, 'sequenceNumbers', {});
        const lastSeqnum = this.safeInteger (sequenceNumbersByChannel, channel);
        if (lastSeqnum === undefined) {
            this.options['sequenceNumbers'][channel] = seqnum;
        } else {
            if (seqnum !== lastSeqnum + 1) {
                throw new ExchangeError (this.id + ' ' + channel + ' seqnum ' + seqnum + ' is not the expected ' + (lastSeqnum + 1));
            }
            this.options['sequenceNumbers'][channel] = seqnum;
        }
    }

    handleMessage (client: Client, message) {
        this.checkSequenceNumber (client, message);
        const channel = this.safeString (message, 'channel');
        const handlers = {
            'ticker': this.handleTicker,
            'trades': this.handleTrades,
            'prices': this.handleOHLCV,
            'l2': this.handleOrderBook,
            'l3': this.handleOrderBook,
            'auth': this.handleAuthenticationMessage,
            'balances': this.handleBalance,
            'trading': this.handleOrders,
        };
        const handler = this.safeValue (handlers, channel);
        if (handler !== undefined) {
            return handler.call (this, client, message);
        }
        throw new NotSupported (this.id + ' received an unsupported message: ' + this.json (message));
    }

    handleAuthenticationMessage (client: Client, message) {
        //
        //     {
        //         seqnum: 0,
        //         event: 'subscribed',
        //         channel: 'auth',
        //         readOnly: false
        //     }
        //
        const event = this.safeString (message, 'event');
        if (event !== 'subscribed') {
            throw new AuthenticationError (this.id + ' received an authentication error: ' + this.json (message));
        }
        const future = this.safeValue (client.futures, 'authenticated');
        if (future !== undefined) {
            future.resolve (true);
        }
    }

    authenticate (params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        const future = client.future (messageHash);
        const isAuthenticated = this.safeValue (client.subscriptions, messageHash);
        if (isAuthenticated === undefined) {
            this.checkRequiredCredentials ();
            const request = {
                'action': 'subscribe',
                'channel': 'auth',
                'token': this.secret,
            };
            return this.watch (url, messageHash, this.extend (request, params), messageHash);
        }
        return future;
    }
}
