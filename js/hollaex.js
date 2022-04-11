'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { AuthenticationError, NotSupported, ExchangeError } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class hollaex extends ccxt.hollaex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchTickers': false, // for now
                'watchMyTrades': true,
                'watchTrades': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': 'https://api.hollaex.com/stream',
                },
                'test': {
                    'ws': 'api.hollaex.com/stream',
                },
            },
            'options': {
            },
            'streaming': {
                'ping': this.ping,
            },
        });
    }

    async pong (client, message) {
        // {
        //     "id": 1587523073344,
        //     "method": "public/heartbeat",
        //     "code": 0
        // }
        await client.send ({ 'id': this.safeInteger (message, 'id'), 'method': 'public/respond-heartbeat' });
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'orderbook' + ':' + market['id'];
        const orderbook = await this.watchPublic (messageHash, params);
        return orderbook.limit (limit);
    }

    handleOrderBookSnapshot (client, message) {
        // full snapshot
        //
        // {
        //     "instrument_name":"LTC_USDT",
        //     "subscription":"book.LTC_USDT.150",
        //     "channel":"book",
        //     "depth":150,
        //     "data": [
        //          {
        //              'bids': [
        //                  [122.21, 0.74041, 4]
        //              ],
        //              'asks': [
        //                  [122.29, 0.00002, 1]
        //              ]
        //              't': 1648123943803,
        //              's':754560122
        //          }
        //      ]
        // }
        //
        const messageHash = this.safeString (message, 'subscription');
        const marketId = this.safeString (message, 'instrument_name');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let data = this.safeValue (message, 'data');
        data = this.safeValue (data, 0);
        const timestamp = this.safeInteger (data, 't');
        const snapshot = this.parseOrderBook (data, symbol, timestamp);
        snapshot['nonce'] = this.safeInteger (data, 's');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            const limit = this.safeInteger (message, 'depth');
            orderbook = this.orderBook ({}, limit);
        }
        orderbook.reset (snapshot);
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'trade' + ':' + market['id'];
        const trades = await this.watchPublic (messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //   {
        //       topic: 'trade',
        //       action: 'partial',
        //       symbol: 'btc-usdt',
        //       data: [
        //         {
        //           size: 0.05145,
        //           price: 41977.9,
        //           side: 'buy',
        //           timestamp: '2022-04-11T09:40:10.881Z'
        //         },
        //         (...)
        //    }
        //
        const channel = this.safeString (message, 'topic');
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const data = this.safeValue (message, 'data', []);
        const parsedTrades = this.parseTrades (data, market);
        for (let j = 0; j < parsedTrades.length; j++) {
            stored.append (parsedTrades[j]);
        }
        const messageHash = channel + ':' + marketId;
        client.resolve (stored, messageHash);
        client.resolve (stored, channel);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        let messageHash = (defaultType === 'margin') ? 'user.margin.trade' : 'user.trade';
        messageHash = (market !== undefined) ? (messageHash + '.' + market['id']) : messageHash;
        const trades = await this.watchPrivate (messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let messageHash = 'order';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            messageHash += ':' + market['id'];
        }
        const orders = await this.watchPrivate (messageHash, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client, message, subscription = undefined) {
        //
        // {
        //     topic: 'order',
        //     action: 'insert',
        //     user_id: 155328,
        //     symbol: 'ltc-usdt',
        //     data: {
        //       symbol: 'ltc-usdt',
        //       side: 'buy',
        //       size: 0.05,
        //       type: 'market',
        //       price: 0,
        //       fee_structure: { maker: 0.1, taker: 0.1 },
        //       fee_coin: 'ltc',
        //       id: 'ce38fd48-b336-400b-812b-60c636454231',
        //       created_by: 155328,
        //       filled: 0.05,
        //       method: 'market',
        //       created_at: '2022-04-11T14:09:00.760Z',
        //       updated_at: '2022-04-11T14:09:00.760Z',
        //       status: 'filled'
        //     },
        //     time: 1649686140
        // }
        //
        const channel = this.safeString (message, 'topic');
        const marketId = this.safeString (message, 'symbol');
        const data = this.safeValue (message, 'data', {});
        // usually the first message is an empty array
        if (data.length === 0) {
            return 0;
        }
        const parsed = this.parseOrder (data);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (parsed);
        client.resolve (orders);
        // non-symbol specific
        client.resolve (orders, channel);
        const messageHash = channel + ':' + marketId;
        client.resolve (orders, messageHash);
    }

    async watchBalance (params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const messageHash = (defaultType === 'margin') ? 'user.margin.balance' : 'user.balance';
        return await this.watchPrivate (messageHash, params);
    }

    handleBalance (client, message) {
        //
        // {
        //     "method": "subscribe",
        //     "result": {
        //       "subscription": "user.balance",
        //       "channel": "user.balance",
        //       "data": [
        //         {
        //           "currency": "CRO",
        //           "balance": 99999999947.99626,
        //           "available": 99999988201.50826,
        //           "order": 11746.488,
        //           "stake": 0
        //         }
        //       ],
        //       "channel": "user.balance"
        //     }
        // }
        //
        const messageHash = this.safeString (message, 'subscription');
        const data = this.safeValue (message, 'data');
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['total'] = this.safeString (balance, 'balance');
            this.balance[code] = account;
            this.balance = this.safeBalance (this.balance);
        }
        client.resolve (this.balance, messageHash);
    }

    async watchPublic (messageHash, params = {}) {
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [ messageHash ],
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchPrivate (messageHash, params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        const defaultExpires = this.safeInteger2 (this.options, 'api-expires', 'expires', parseInt (this.timeout / 1000));
        const expires = this.sum (this.seconds (), defaultExpires);
        const expiresString = expires.toString ();
        const auth = 'CONNECT' + '/stream' + expiresString;
        const signature = this.hmac (this.encode (auth), this.encode (this.secret));
        const authParams = {
            'api-key': this.apiKey,
            'api-signature': signature,
            'api-expires': expiresString,
        };
        const signedUrl = url + '?' + this.urlencode (authParams);
        const request = {
            'op': 'subscribe',
            'args': [ messageHash ],
        };
        const message = this.extend (request, params);
        return await this.watch (signedUrl, messageHash, message, messageHash);
    }

    handleErrorMessage (client, message) {
        const errorCode = this.safeInteger (message, 'code');
        try {
            if (errorCode !== undefined && errorCode !== 0) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                const messageString = this.safeValue (message, 'message');
                if (messageString !== undefined) {
                    this.throwBroadlyMatchedException (this.exceptions['broad'], messageString, feedback);
                }
            }
        } catch (e) {
            if (e instanceof AuthenticationError) {
                client.reject (e, 'authenticated');
                if ('public/auth' in client.subscriptions) {
                    delete client.subscriptions['public/auth'];
                }
                return false;
            } else {
                client.reject (e);
            }
        }
        return message;
    }

    handleMessage (client, message) {
        // trade
        //   {
        //       topic: 'trade',
        //       action: 'partial',
        //       symbol: 'btc-usdt',
        //       data: [
        //         {
        //           size: 0.05145,
        //           price: 41977.9,
        //           side: 'buy',
        //           timestamp: '2022-04-11T09:40:10.881Z'
        //         },
        //         (...)
        //    }
        // orderbook
        //    {
        //        topic: 'orderbook',
        //        action: 'partial',
        //        symbol: 'ltc-usdt',
        //        data: {
        //          bids: [ ],
        //          asks: [ ],
        //          timestamp: '2022-04-11T10:37:01.227Z'
        //        },
        //        time: 1649673421
        //    }
        // order
        // {
        //     topic: 'order',
        //     action: 'insert',
        //     user_id: 155328,
        //     symbol: 'ltc-usdt',
        //     data: {
        //       symbol: 'ltc-usdt',
        //       side: 'buy',
        //       size: 0.05,
        //       type: 'market',
        //       price: 0,
        //       fee_structure: { maker: 0.1, taker: 0.1 },
        //       fee_coin: 'ltc',
        //       id: 'ce38fd48-b336-400b-812b-60c636454231',
        //       created_by: 155328,
        //       filled: 0.05,
        //       method: 'market',
        //       created_at: '2022-04-11T14:09:00.760Z',
        //       updated_at: '2022-04-11T14:09:00.760Z',
        //       status: 'filled'
        //     },
        //     time: 1649686140
        // }
        //
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        const methods = {
            'trade': this.handleTrades,
            'orderbook': this.handlOrderBook,
            'order': this.handleOrder,
        };
        const topic = this.safeValue (message, 'topic');
        const method = this.safeValue (methods, topic);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    ping (client) {
        // hollaex does not support built-in ws protocol-level ping-pong
        return { 'op': 'ping' };
    }

    handleAuthenticate (client, message) {
        //
        //  { id: 1648132625434, method: 'public/auth', code: 0 }}
        //
        const future = client.futures['authenticated'];
        future.resolve (1);
        client.resolve (1, 'public/auth');
        return message;
    }
};
