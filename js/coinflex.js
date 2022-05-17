'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { AuthenticationError } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class coinflex extends ccxt.coinflex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': false,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://v2api.coinflex.com/v2/websocket',
                },
                'test': {
                    'ws': 'wss://v2stgapi.coinflex.com/v2/websocket',
                },
            },
            'options': {
            },
        });
    }

    async watchTicker (symbol, params = {}) {
        const channel = 'ticker';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = channel + ':' + market['id'];
        return await this.watchPublic (messageHash, messageHash, params);
    }

    handleTicker (client, message) {
        //
        //     {
        //         table: 'ticker',
        //         data: [
        //           {
        //             last: '29586',
        //             open24h: '29718',
        //             high24h: '31390',
        //             low24h: '29299',
        //             volume24h: '30861108.9365753390',
        //             currencyVolume24h: '1017.773',
        //             openInterest: '0',
        //             marketCode: 'BTC-USD',
        //             timestamp: '1652693831002',
        //             lastQty: '0.001',
        //             markPrice: '29586',
        //             lastMarkPrice: '29601'
        //           }
        //         ]
        //     }
        //
        const topic = this.safeString (message, 'table');
        const tickers = this.safeValue (message, 'data', []);
        for (let i = 0; i < tickers.length; i++) {
            const data = tickers[i];
            const marketId = this.safeString (data, 'marketCode');
            const market = this.safeMarket (marketId, undefined);
            const messageHash = topic + ':' + marketId;
            const ticker = this.parseWsTicker (data, market);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    parseWsTicker (ticker, market = undefined) {
        //
        //    {
        //        last: '29586',
        //        open24h: '29718',
        //        high24h: '31390',
        //        low24h: '29299',
        //        volume24h: '30861108.9365753390',
        //        currencyVolume24h: '1017.773',
        //        openInterest: '0',
        //        marketCode: 'BTC-USD',
        //        timestamp: '1652693831002',
        //        lastQty: '0.001',
        //        markPrice: '29586',
        //        lastMarkPrice: '29601'
        //    }
        //
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const marketId = this.safeString (ticker, 'marketCode');
        market = this.safeMarket (marketId, market);
        const close = this.safeString (ticker, 'last');
        const open = this.safeString (ticker, 'open24h');
        const high = this.safeString (ticker, 'high24h');
        const low = this.safeString (ticker, 'low24h');
        const baseVolume = this.safeString (ticker, 'currencyVolume24h');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const channel = 'candles';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const interval = this.timeframes[timeframe];
        const messageHash = channel + interval + ':' + market['id'];
        const ohlcv = await this.watchPublic (messageHash, messageHash, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        //     "table":"candles60s",
        //     "data":[
        //        {
        //           "candle":[
        //              "1652695200000",
        //              "29598",
        //              "29598",
        //              "29597.585628",
        //              "29597.585628",
        //              "1589597.531322996",
        //              "53.707"
        //           ],
        //           "marketCode":"BTC-USD"
        //        }
        //     ]
        //  }
        //
        const topic = this.safeString (message, 'table');
        const interval = topic.replace ('candles', '');
        const data = this.safeValue (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const candles = this.safeValue (entry, 'candle', []);
            const marketId = this.safeString (entry, 'marketCode');
            const market = this.safeMarket (marketId, undefined);
            const messageHash = topic + ':' + marketId;
            const symbol = market['symbol'];
            const timeframe = this.findTimeframe (interval);
            const ohlcvs = this.parseWsOHLCV (candles, market);
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append (ohlcvs);
            client.resolve (stored, messageHash);
        }
    }

    parseWsOHLCV (ohlcv, market = undefined) {
        //
        //  [
        //     "1652695200000",
        //     "29598",
        //     "29598",
        //     "29597.585628",
        //     "29597.585628",
        //     "1589597.531322996",
        //     "53.707"
        //  ]
        //
        return [
            this.safeNumber (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 6),
        ];
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        const channel = 'depth';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = channel + ':' + market['id'];
        const orderbook = await this.watchPublic (messageHash, messageHash, params);
        return orderbook.limit (limit);
    }

    handleOrderBook (client, message) {
        //
        // we get always the full snapshot
        //
        // {
        //     "table":"depth",
        //     "data":[
        //        {
        //           "instrumentId":"BTC-USD-SWAP-LIN",
        //           "seqNum":"1650424356029712528",
        //           "asks":[
        //              [29878,0.303,0,0 ],
        //              [29880,0.004,0,0 ],
        //           ],
        //           "checksum":-1222631948,
        //           "bids":[
        //              [ 29877, 0.047, 0, 0 ],
        //              [ 29872, 0.001, 0, 0 ],
        //           ],
        //           "timestamp":"1652708448921"
        //        }
        //     ],
        //     "action":"partial"
        //  }
        //
        const channel = this.safeString (message, 'table');
        const data = this.safeValue (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString (entry, 'instrumentId');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const timestamp = this.safeInteger (entry, 'timestamp');
            const snapshot = this.parseOrderBook (entry, symbol, timestamp);
            let orderbook = undefined;
            if (!(symbol in this.orderbooks)) {
                orderbook = this.orderBook (snapshot);
                this.orderbooks[symbol] = orderbook;
            } else {
                orderbook = this.orderbooks[symbol];
                orderbook.reset (snapshot);
            }
            const messageHash = channel + ':' + marketId;
            client.resolve (orderbook, messageHash);
        }
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const channel = 'trade';
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = channel + ':' + market['id'];
        const trades = await this.watchPublic (messageHash, messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //    {
        //        table: 'trade',
        //        data: [
        //          {
        //            side: 'BUY',
        //            quantity: '0.042',
        //            price: '30081.0',
        //            marketCode: 'BTC-USD-SWAP-LIN',
        //            tradeId: '304734619689878207',
        //            timestamp: '1652698566797'
        //          }
        //        ]
        //    }
        //
        const topic = this.safeString (message, 'table');
        const data = this.safeValue (message, 'data', []);
        const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
        const marketIds = {};
        for (let i = 0; i < data.length; i++) {
            const trade = data[i];
            const marketId = this.safeString (trade, 'marketCode');
            marketIds[marketId] = true;
            const market = this.safeMarket (marketId, undefined);
            const symbol = market['symbol'];
            const parsedTrade = this.parseWsTrade (trade, market);
            let stored = this.safeValue (this.trades, symbol);
            if (stored === undefined) {
                stored = new ArrayCache (tradesLimit);
                this.trades[symbol] = stored;
            }
            stored.append (parsedTrade);
        }
        const marketIdsArray = Object.keys (marketIds);
        for (let i = 0; i < marketIdsArray.length; i++) {
            const marketId = marketIdsArray[i];
            const messageHash = topic + ':' + marketId;
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const stored = this.safeValue (this.trades, symbol);
            client.resolve (stored, messageHash);
        }
    }

    parseWsTrade (trade, market = undefined) {
        //
        //   {
        //       side: 'BUY',
        //       quantity: '0.042',
        //       price: '30081.0',
        //       marketCode: 'BTC-USD-SWAP-LIN',
        //       tradeId: '304734619689878207',
        //       timestamp: '1652698566797'
        //   }
        //
        const marketId = this.safeString (trade, 'marketCode');
        market = this.safeMarket (marketId, market);
        const id = this.safeString (trade, 'tradeId');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const side = this.safeStringLower (trade, 'side');
        const amount = this.safeString (trade, 'quantity');
        const price = this.safeString (trade, 'price');
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let messageHash = 'order';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + market['id'];
        } else {
            messageHash += ':all';
        }
        const orders = await this.watchPrivate (messageHash, messageHash, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client, message, subscription = undefined) {
        //
        //
        //    {
        //        table: 'order',
        //        data: [
        //          {
        //            accountId: '39422',
        //            clientOrderId: '1652712518830',
        //            orderId: '1002215627250',
        //            price: '40.0',
        //            quantity: '0.01',
        //            side: 'BUY',
        //            status: 'CANCELED_BY_USER',
        //            marketCode: 'LTC-USD',
        //            timeInForce: 'GTC',
        //            timestamp: '1652712536469',
        //            remainQuantity: '0.01',
        //            notice: 'OrderClosed',
        //            orderType: 'LIMIT',
        //            isTriggered: 'false'
        //          }
        //        ]
        //    }
        //
        //    {
        //      table: 'order',
        //      data: [
        //        {
        //          accountId: '39422',
        //          clientOrderId: '1652713431643',
        //          orderId: '1002215706472',
        //          quantity: '0.001',
        //          side: 'SELL',
        //          status: 'FILLED',
        //          marketCode: 'BTC-USD-SWAP-LIN',
        //          timestamp: '1652713431854',
        //          matchId: '304734619690202846',
        //          matchPrice: '29480.0',
        //          matchQuantity: '0.001',
        //          orderMatchType: 'TAKER',
        //          remainQuantity: '0.0',
        //          notice: 'OrderMatched',
        //          orderType: 'MARKET',
        //          fees: '0.02358400',
        //          feeInstrumentId: 'USD',
        //          isTriggered: 'false'
        //        }
        //      ]
        //    }
        //
        const channel = this.safeString (message, 'table');
        const rawOrders = this.safeValue (message, 'data', []);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.orders;
        const marketIds = {};
        for (let i = 0; i < rawOrders.length; i++) {
            const order = rawOrders[i];
            // parseOrder does not support 'matchPrice'
            const matchPrice = this.safeString (order, 'matchPrice');
            if (matchPrice !== undefined) {
                order['price'] = matchPrice;
            }
            const parsed = this.parseOrder (order);
            stored.append (parsed);
            const symbol = parsed['symbol'];
            const market = this.market (symbol);
            const marketId = market['id'];
            marketIds[marketId] = true;
        }
        // non-symbol specific
        const messageHash = channel + ':all';
        client.resolve (this.orders, messageHash);
        const keys = Object.keys (marketIds);
        for (let i = 0; i < keys.length; i++) {
            const marketId = keys[i];
            const messageHash = channel + ':' + marketId;
            client.resolve (this.orders, messageHash);
        }
    }

    async watchBalance (params = {}) {
        const messageHash = 'balance:all';
        return await this.watchPrivate (messageHash, messageHash, params);
    }

    handleBalance (client, message) {
        //
        //    {
        //        table: 'balance',
        //        accountId: '39422',
        //        timestamp: '1652710563235',
        //        tradeType: 'LINEAR',
        //        data: [
        //          {
        //            total: '47.7114057900',
        //            reserved: '6.00',
        //            instrumentId: 'USD',
        //            available: '41.7114057900',
        //            quantityLastUpdated: '1652188203911'
        //          },
        //          {
        //            total: '0.98',
        //            reserved: '0',
        //            instrumentId: 'DOGE',
        //            available: '0.98',
        //            quantityLastUpdated: '1651655519741'
        //          }
        //        ]
        //    }
        //
        const channel = this.safeString (message, 'table');
        const data = this.safeValue (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString (balance, 'instrumentId');
            const code = this.safeCurrencyCode (currencyId);
            const account = (code in this.balance) ? this.balance[code] : this.account ();
            account['total'] = this.safeString (balance, 'total');
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'reserved');
            this.balance[code] = account;
        }
        this.balance = this.safeBalance (this.balance);
        const messageHash = channel + ':all';
        client.resolve (this.balance, messageHash);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let subHash = 'order';
        let messageHash = 'usertrades';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            subHash += ':' + market['id'];
            messageHash += ':' + market['id'];
        } else {
            subHash += ':all';
            messageHash += ':all';
        }
        const trades = await this.watchPrivate (subHash, messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    async watchPublic (subscriptionHash, messageHash, params = {}) {
        const url = this.urls['api']['ws'];
        const id = this.nonce ();
        const request = {
            'op': 'subscribe',
            'tag': id,
            'args': [ messageHash ],
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, subscriptionHash);
    }

    async watchPrivate (subscriptionHash, messageHash, params = {}) {
        await this.authenticate ();
        return await this.watchPublic (subscriptionHash, messageHash, params);
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws'];
        const messageHash = 'login';
        const client = this.client (url);
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            future = client.future ('authenticated');
            const timestamp = this.milliseconds ().toString ();
            const method = 'GET';
            const path = '/auth/self/verify';
            const auth = timestamp + method + path;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            const request = {
                'op': messageHash,
                'data': {
                    'apiKey': this.apiKey,
                    'timestamp': timestamp,
                    'signature': signature,
                },
            };
            this.spawn (this.watch, url, messageHash, request, messageHash, future);
        }
        return await future;
    }

    handleErrorMessage (client, message) {
        //
        //    {
        //        event: 'login',
        //        success: false,
        //        message: 'Signature is invalid',
        //        code: '20000',
        //        timestamp: '1652709878447'
        //    }
        //
        //    {
        //        event: 'placeorder',
        //        submitted: false,
        //        tag: '1652714023869',
        //        message: 'FAILED sanity bound check as price (14000) >  upper bound (13260)',
        //        code: '710003',
        //        timestamp: '1652714024078',
        //        data: {
        //          clientOrderId: '1652714023869',
        //          marketCode: 'BTC-USD-SWAP-LIN',
        //          side: 'BUY',
        //          orderType: 'STOP_LIMIT',
        //          quantity: '0.001',
        //          timeInForce: 'GTC',
        //          limitPrice: '14000',
        //          stopPrice: '13000',
        //          source: 0
        //        }
        //     }
        //
        const success = this.safeValue (message, 'success');
        try {
            if (!success) {
                const error = this.safeString (message, 'code');
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            }
        } catch (e) {
            if (e instanceof AuthenticationError) {
                client.reject (e, 'authenticated');
                const method = 'login';
                if (method in client.subscriptions) {
                    delete client.subscriptions[method];
                }
                return false;
            }
        }
        return message;
    }

    handleMessage (client, message) {
        //
        //   { event: 'Welcome', nonce: '253ae705', timestamp: '1652711966653' }
        //
        //   {
        //      success: true,
        //      tag: '1652712019244',
        //      event: 'subscribe',
        //      channel: 'trade:BTC-USD',
        //      timestamp: '1652712020624'
        //   }
        //
        //   {
        //       event: 'placeorder',
        //       submitted: true,
        //       tag: '1652714101465',
        //       timestamp: '1652714101676',
        //       data: {
        //         clientOrderId: '1652714101465',
        //         marketCode: 'BTC-USD-SWAP-LIN',
        //         side: 'BUY',
        //         orderType: 'STOP_LIMIT',
        //         quantity: '0.001',
        //         timeInForce: 'GTC',
        //         limitPrice: '15300',
        //         stopPrice: '15000',
        //         orderId: '1002215765848',
        //         source: 0
        //       }
        //   }
        //
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        const event = this.safeString (message, 'event');
        if (event === 'login') {
            this.handleAuthenticate (client, message);
            return;
        }
        const tables = {
            'ticker': this.handleTicker,
            'trade': this.handleTrades,
            'depth': this.handleOrderBook,
            'order': this.handleOrder,
            'balance': this.handleBalance,
            // 'usertrade': this.handleMyTrades,
        };
        const topic = this.safeString (message, 'table');
        // specific check because this topic has the timeframe attached
        // so we would need to list all possibilities in the methods object
        if (topic !== undefined && topic.indexOf ('candles') >= 0) {
            this.handleOHLCV (client, message);
            return;
        }
        const method = this.safeValue (tables, topic);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    handleAuthenticate (client, message) {
        //
        //  { event: 'login', success: true, timestamp: '1652710009321' }
        //
        client.resolve (message, 'authenticated');
        return message;
    }

    handlePong (client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }
};
