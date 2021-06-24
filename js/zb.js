'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError, AuthenticationError, ArgumentsRequired } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class zb extends ccxt.zb {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTicker': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.zb.today/websocket',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
            },
        });
    }

    async watchPublic (name, symbol, method, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = market['baseId'] + market['quoteId'] + '_' + name;
        const url = this.urls['api']['ws'];
        const request = {
            'event': 'addChannel',
            'channel': messageHash,
        };
        const message = this.extend (request, params);
        const subscription = {
            'name': name,
            'symbol': symbol,
            'marketId': market['id'],
            'messageHash': messageHash,
            'method': method,
        };
        return await this.watch (url, messageHash, message, messageHash, subscription);
    }

    async watchTicker (symbol, params = {}) {
        return await this.watchPublic ('ticker', symbol, this.handleTicker, params);
    }

    handleTicker (client, message, subscription) {
        //
        //     {
        //         date: '1624398991255',
        //         ticker: {
        //             high: '33298.38',
        //             vol: '56375.9469',
        //             last: '32396.95',
        //             low: '28808.19',
        //             buy: '32395.81',
        //             sell: '32409.3',
        //             turnover: '1771122527.0000',
        //             open: '31652.44',
        //             riseRate: '2.36'
        //         },
        //         dataType: 'ticker',
        //         channel: 'btcusdt_ticker'
        //     }
        //
        const symbol = this.safeString (subscription, 'symbol');
        const channel = this.safeString (message, 'channel');
        const market = this.market (symbol);
        const data = this.safeValue (message, 'ticker');
        data['date'] = this.safeValue (message, 'date');
        const ticker = this.parseTicker (data, market);
        ticker['symbol'] = symbol;
        this.tickers[symbol] = ticker;
        client.resolve (ticker, channel);
        return message;
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const trades = await this.watchPublic ('trades', symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client, message) {
        //
        //     {
        //         event: 'trade',
        //         timestamp: 1590779594547,
        //         market: 'ETH-EUR',
        //         id: '450c3298-f082-4461-9e2c-a0262cc7cc2e',
        //         amount: '0.05026233',
        //         price: '198.46',
        //         side: 'buy'
        //     }
        //
        const marketId = this.safeString (message, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const name = 'trades';
        const messageHash = name + '@' + marketId;
        const trade = this.parseTrade (message, market);
        let array = this.safeValue (this.trades, symbol);
        if (array === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            array = new ArrayCache (limit);
        }
        array.append (trade);
        this.trades[symbol] = array;
        client.resolve (array, messageHash);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'candles';
        const marketId = market['id'];
        const interval = this.timeframes[timeframe];
        const messageHash = name + '@' + marketId + '_' + interval;
        const url = this.urls['api']['ws'];
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': 'candles',
                    'interval': [ interval ],
                    'markets': [ marketId ],
                },
            ],
        };
        const message = this.extend (request, params);
        const ohlcv = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        //     {
        //         event: 'candle',
        //         market: 'BTC-EUR',
        //         interval: '1m',
        //         candle: [
        //             [
        //                 1590797160000,
        //                 '8480.9',
        //                 '8480.9',
        //                 '8480.9',
        //                 '8480.9',
        //                 '0.01038628'
        //             ]
        //         ]
        //     }
        //
        const name = 'candles';
        const marketId = this.safeString (message, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const interval = this.safeString (message, 'interval');
        // use a reverse lookup in a static map instead
        const timeframe = this.findTimeframe (interval);
        const messageHash = name + '@' + marketId + '_' + interval;
        const candles = this.safeValue (message, 'candle');
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        for (let i = 0; i < candles.length; i++) {
            const candle = candles[i];
            const parsed = this.parseOHLCV (candle, market);
            stored.append (parsed);
        }
        client.resolve (stored, messageHash);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        if (limit !== undefined) {
            if ((limit !== 5) && (limit !== 10) && (limit !== 20)) {
                throw new ExchangeError (this.id + ' watchOrderBook limit argument must be undefined, 5, 10 or 20');
            }
        } else {
            limit = 5; // default
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'quick_depth';
        const messageHash = market['baseId'] + market['quoteId'] + '_' + name;
        const url = this.urls['api']['ws'] + '/' + market['baseId'];
        const request = {
            'event': 'addChannel',
            'channel': messageHash,
            'length': limit,
        };
        const message = this.extend (request, params);
        const subscription = {
            'name': name,
            'symbol': symbol,
            'marketId': market['id'],
            'messageHash': messageHash,
            'method': this.handleOrderBook,
        };
        const orderbook = await this.watch (url, messageHash, message, messageHash, subscription);
        return orderbook.limit (limit);
    }

    handleOrderBookMessage (client, message, orderbook) {
        const u = this.safeInteger (message, 'u');
        this.handleDeltas (orderbook['asks'], this.safeValue (message, 'listUp', []));
        this.handleDeltas (orderbook['bids'], this.safeValue (message, 'listDown', []));
        const timestamp = this.safeInteger (message, 'E');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        return orderbook;
    }

    handleOrderBook (client, message, subscription) {
        //
        //     {
        //         lastTime: 1624524640066,
        //         dataType: 'quickDepth',
        //         channel: 'btcusdt_quick_depth',
        //         currentPrice: 33183.79,
        //         listDown: [
        //             [ 33166.87, 0.2331 ],
        //             [ 33166.86, 0.15 ],
        //             [ 33166.76, 0.15 ],
        //             [ 33161.02, 0.212 ],
        //             [ 33146.35, 0.6066 ]
        //         ],
        //         market: 'btcusdt',
        //         listUp: [
        //             [ 33186.88, 0.15 ],
        //             [ 33190.1, 0.15 ],
        //             [ 33193.03, 0.2518 ],
        //             [ 33195.05, 0.2031 ],
        //             [ 33199.99, 0.6066 ]
        //         ],
        //         high: 34816.8,
        //         rate: '6.484',
        //         low: 32312.41,
        //         currentIsBuy: true,
        //         dayNumber: 26988.5536,
        //         totalBtc: 26988.5536,
        //         showMarket: 'btcusdt'
        //     }
        //
        const channel = this.safeString (message, 'channel');
        const limit = this.safeInteger (subscription, 'limit');
        const symbol = this.safeString (subscription, 'symbol');
        const timestamp = this.safeInteger (message, 'lastTime');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ({}, limit);
            this.orderbooks[symbol] = orderbook;
        }
        const deltas = message[1];
        for (let i = 0; i < deltas.length; i++) {
            const delta = deltas[i];
            const id = this.safeString (delta, 0);
            const price = this.safeFloat (delta, 1);
            const size = (delta[2] < 0) ? -delta[2] : delta[2];
            const side = (delta[2] < 0) ? 'asks' : 'bids';
            const bookside = orderbook[side];
            bookside.store (price, size, id);
        }
        orderbook['symbol'] = symbol;
        orderbook['timestamp'] = timestamp;
        orderbook['iso8601'] = this.iso8601 (timestamp);
        client.resolve (orderbook, channel);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.authenticate ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const url = this.urls['api']['ws'];
        const name = 'account';
        const subscriptionHash = name + '@' + marketId;
        const messageHash = subscriptionHash + '_' + 'order';
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': name,
                    'markets': [ marketId ],
                },
            ],
        };
        const orders = await this.watch (url, messageHash, request, subscriptionHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.authenticate ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const url = this.urls['api']['ws'];
        const name = 'account';
        const subscriptionHash = name + '@' + marketId;
        const messageHash = subscriptionHash + '_' + 'fill';
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': name,
                    'markets': [ marketId ],
                },
            ],
        };
        const trades = await this.watch (url, messageHash, request, subscriptionHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleOrder (client, message) {
        //
        //     {
        //         event: 'order',
        //         orderId: 'f0e5180f-9497-4d05-9dc2-7056e8a2de9b',
        //         market: 'ETH-EUR',
        //         created: 1590948500319,
        //         updated: 1590948500319,
        //         status: 'new',
        //         side: 'sell',
        //         orderType: 'limit',
        //         amount: '0.1',
        //         amountRemaining: '0.1',
        //         price: '300',
        //         onHold: '0.1',
        //         onHoldCurrency: 'ETH',
        //         selfTradePrevention: 'decrementAndCancel',
        //         visible: true,
        //         timeInForce: 'GTC',
        //         postOnly: false
        //     }
        //
        const name = 'account';
        const event = this.safeString (message, 'event');
        const marketId = this.safeString (message, 'market', '-');
        const messageHash = name + '@' + marketId + '_' + event;
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            const order = this.parseOrder (message, market);
            if (this.orders === undefined) {
                const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const orders = this.orders;
            orders.append (order);
            client.resolve (this.orders, messageHash);
        }
    }

    handleMyTrade (client, message) {
        //
        //     {
        //         event: 'fill',
        //         timestamp: 1590964470132,
        //         market: 'ETH-EUR',
        //         orderId: '85d082e1-eda4-4209-9580-248281a29a9a',
        //         fillId: '861d2da5-aa93-475c-8d9a-dce431bd4211',
        //         side: 'sell',
        //         amount: '0.1',
        //         price: '211.46',
        //         taker: true,
        //         fee: '0.056',
        //         feeCurrency: 'EUR'
        //     }
        //
        const name = 'account';
        const event = this.safeString (message, 'event');
        const marketId = this.safeString (message, 'market');
        const messageHash = name + '@' + marketId + '_' + event;
        const market = this.safeMarket (marketId, undefined, '-');
        const trade = this.parseTrade (message, market);
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCache (limit);
        }
        const array = this.myTrades;
        array.append (trade);
        this.myTrades = array;
        client.resolve (array, messageHash);
    }

    handleSubscriptionStatus (client, message) {
        //
        //     {
        //         event: 'subscribed',
        //         subscriptions: {
        //             book: [ 'BTC-EUR' ]
        //         }
        //     }
        //
        const subscriptions = this.safeValue (message, 'subscriptions', {});
        const methods = {
            'book': this.handleOrderBookSubscriptions,
        };
        const names = Object.keys (subscriptions);
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const method = this.safeValue (methods, name);
            if (method !== undefined) {
                const subscription = this.safeValue (subscriptions, name);
                method.call (this, client, message, subscription);
            }
        }
        return message;
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const future = client.future ('authenticated');
        const action = 'authenticate';
        const authenticated = this.safeValue (client.subscriptions, action);
        if (authenticated === undefined) {
            try {
                this.checkRequiredCredentials ();
                const timestamp = this.milliseconds ();
                const stringTimestamp = timestamp.toString ();
                const auth = stringTimestamp + 'GET/' + this.version + '/websocket';
                const signature = this.hmac (this.encode (auth), this.encode (this.secret));
                const request = {
                    'action': action,
                    'key': this.apiKey,
                    'signature': signature,
                    'timestamp': timestamp,
                };
                this.spawn (this.watch, url, action, request, action);
            } catch (e) {
                client.reject (e, 'authenticated');
                // allows further authentication attempts
                if (action in client.subscriptions) {
                    delete client.subscriptions[action];
                }
            }
        }
        return await future;
    }

    handleAuthenticationMessage (client, message) {
        //
        //     {
        //         event: 'authenticate',
        //         authenticated: true
        //     }
        //
        const authenticated = this.safeValue (message, 'authenticated', false);
        if (authenticated) {
            // we resolve the future here permanently so authentication only happens once
            const future = this.safeValue (client.futures, 'authenticated');
            future.resolve (true);
        } else {
            const error = new AuthenticationError (this.json (message));
            client.reject (error, 'authenticated');
            // allows further authentication attempts
            const event = this.safeValue (message, 'event');
            if (event in client.subscriptions) {
                delete client.subscriptions[event];
            }
        }
    }

    handleMessage (client, message) {
        //
        //
        //     {
        //         no: '0',
        //         code: 1007,
        //         success: false,
        //         channel: 'btc_usdt_ticker',
        //         message: 'Channel is empty'
        //     }
        //
        //     {
        //         date: '1624398991255',
        //         ticker: {
        //             high: '33298.38',
        //             vol: '56375.9469',
        //             last: '32396.95',
        //             low: '28808.19',
        //             buy: '32395.81',
        //             sell: '32409.3',
        //             turnover: '1771122527.0000',
        //             open: '31652.44',
        //             riseRate: '2.36'
        //         },
        //         dataType: 'ticker',
        //         channel: 'btcusdt_ticker'
        //     }
        //
        const dataType = this.safeString (message, 'dataType');
        if (dataType !== undefined) {
            const channel = this.safeString (message, 'channel');
            const subscription = this.safeValue (client.subscriptions, channel);
            if (subscription !== undefined) {
                const method = this.safeValue (subscription, 'method');
                if (method !== undefined) {
                    return method.call (this, client, message, subscription);
                }
            }
            return message;
        }
    }
};
