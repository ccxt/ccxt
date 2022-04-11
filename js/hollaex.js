'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { AuthenticationError, BadSymbol, BadRequest } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class hollaex extends ccxt.hollaex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchTickers': false, // for now
                'watchMyTrades': false,
                'watchTrades': true,
                'watchOrderBook': true,
                'watchOrders': false,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': 'https://api.hollaex.com/stream',
                },
            },
            'options': {
            },
            'streaming': {
                'ping': this.ping,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'Bearer or HMAC authentication required': BadSymbol, // { error: 'Bearer or HMAC authentication required' }
                        'Error: wrong input': BadRequest, // { error: 'Error: wrong input' }
                    },
                },
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
        const dataLength = data.length;
        if (dataLength === 0) {
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
        const messageHash = 'wallet';
        return await this.watchPrivate (messageHash, params);
    }

    handleBalance (client, message) {
        //
        // {
        //     topic: 'wallet',
        //     action: 'partial',
        //     user_id: 155328,
        //     data: {
        //       bch_balance: 0,
        //       bch_available: 0,
        //       xrp_balance: 0,
        //       xrp_available: 0,
        //       eth_balance: 0,
        //       eth_available: 0,
        //       usdt_balance: 18.94344188,
        //       usdt_available: 18.94344188,
        //       btc_balance: 0,
        //       btc_available: 0,
        //       xht_balance: 0,
        //       xht_available: 0,
        //       link_balance: 0,
        //       link_available: 0,
        //       ama_balance: 0,
        //       ama_available: 0,
        //       xlm_balance: 0,
        //       xlm_available: 0,
        //       xmr_balance: 0,
        //       xmr_available: 0,
        //       bnb_balance: 0,
        //       bnb_available: 0,
        //       trx_balance: 0,
        //       trx_available: 0,
        //       ada_balance: 0,
        //       ada_available: 0,
        //       dot_balance: 0,
        //       dot_available: 0,
        //       ltc_balance: 0.00005,
        //       ltc_available: 0.00005,
        //       uni_balance: 0,
        //       uni_available: 0,
        //       dai_balance: 0,
        //       dai_available: 0,
        //       xtz_balance: 0,
        //       xtz_available: 0,
        //       doge_balance: 0,
        //       doge_available: 0,
        //       axs_balance: 0,
        //       axs_available: 0,
        //       sol_balance: 0,
        //       sol_available: 0,
        //       avax_balance: 0,
        //       avax_available: 0,
        //       shib_balance: 0,
        //       shib_available: 0
        //     },
        //     time: 1649687396
        //   }
        //
        const messageHash = this.safeString (message, 'topic');
        const data = this.safeValue (message, 'data');
        const balanceKeys = Object.keys (data);
        const currencies = {};
        for (let i = 0; i < balanceKeys.length; i++) {
            const rawKey = balanceKeys[i];
            const keyParts = rawKey.split ('_');
            const currency = this.safeValue (keyParts, 0);
            currencies[currency] = true;
        }
        const currenciesKeys = Object.keys (currencies);
        for (let i = 0; i < currenciesKeys.length; i++) {
            const currencyId = currenciesKeys[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const availableKey = currencyId + '_available';
            const totalKey = currencyId + '_balance';
            account['free'] = this.safeString (data, availableKey);
            account['total'] = this.safeString (data, totalKey);
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
        //  { error: 'Bearer or HMAC authentication required' }
        //  { error: 'Error: wrong input' }
        const error = this.safeInteger (message, 'error');
        try {
            if (error !== undefined) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['ws']['exact'], error, feedback);
            }
        } catch (e) {
            if (e instanceof AuthenticationError) {
                return false;
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
        //  {
        //      topic: 'order',
        //      action: 'insert',
        //      user_id: 155328,
        //      symbol: 'ltc-usdt',
        //      data: {
        //        symbol: 'ltc-usdt',
        //        side: 'buy',
        //        size: 0.05,
        //        type: 'market',
        //        price: 0,
        //        fee_structure: { maker: 0.1, taker: 0.1 },
        //        fee_coin: 'ltc',
        //        id: 'ce38fd48-b336-400b-812b-60c636454231',
        //        created_by: 155328,
        //        filled: 0.05,
        //        method: 'market',
        //        created_at: '2022-04-11T14:09:00.760Z',
        //        updated_at: '2022-04-11T14:09:00.760Z',
        //        status: 'filled'
        //      },
        //      time: 1649686140
        //  }
        // balance
        //   {
        //       topic: 'wallet',
        //       action: 'partial',
        //       user_id: 155328,
        //       data: { }
        //   }
        //
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        const methods = {
            'trade': this.handleTrades,
            'orderbook': this.handlOrderBook,
            'order': this.handleOrder,
            'wallet': this.handleBalance,
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
};
