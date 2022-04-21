'use strict';

// ----------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError, ArgumentsRequired } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheBySymbolById } = require ('./base/Cache');

// ----------------------------------------------------------------------------

module.exports = class bitopro extends ccxt.bitopro {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
            },
            'urls': {
                'ws': 'wss://stream.bitopro.com:9443/ws',
            },
            'apis': {
                'ws': {
                    'watchTrades': '/v1/pub/trades',
                    'watchTicker': '/v1/pub/tickers',
                    'watchOrderBook': '/v1/pub/order-books',
                    'watchOrders': '/v1/pub/auth/orders',
                    'watchBalance': '/v1/pub/auth/account-balance',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'requestId': {},
                'watchTrades': {
                    'name': 'TRADE',
                },
                'watchTicker': {
                    'name': 'TICKER',
                },
                'watchOrderBook': {
                    'name': 'ORDER_BOOK',
                },
                'watchBalance': {
                    'name': 'ACCOUNT_BALANCE',
                },
                'watchOrders': {
                    'name': 'ACTIVE_ORDERS',
                },
                'ws': {
                    'options': {
                        // headers is required for the authentication
                        'headers': {},
                    },
                },
            },
        });
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        if (limit !== undefined) {
            if ((limit !== 5) && (limit !== 10) && (limit !== 20) && (limit !== 50) && (limit !== 100) && (limit !== 500) && (limit !== 1000)) {
                throw new ExchangeError (this.id + ' watchOrderBook limit argument must be undefined, 5, 10, 20, 50, 100, 500 or 1000');
            }
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const options = this.safeValue (this.options, 'watchOrderBook', {});
        const name = this.safeString (options, 'name', 'trade');
        const messageHash = market['id'].toUpperCase () + '@' + name;
        const apis = this.safeValue (this.apis, 'ws');
        const path = this.safeString (apis, 'watchOrderBook');
        const url = this.urls['ws'] + path + '/' + market['id'] + ':' + limit;
        const orderbook = await this.watch (url, messageHash, '', messageHash);
        return orderbook.limit (limit);
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 'price');
        const amount = this.safeFloat (delta, 'amount');
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBookMessage (client, message, orderbook) {
        //
        //     {
        //         event: 'ORDER_BOOK',
        //         timestamp: 1650121915308,
        //         datetime: '2022-04-16T15:11:55.308Z',
        //         pair: 'BTC_TWD',
        //         limit: 5,
        //         scale: 0,
        //         bids: [
        //             { price: '1188178', amount: '0.0425', count: 1, total: '0.0425' },
        //         ],
        //         asks: [
        //             {
        //                 price: '1190740',
        //                 amount: '0.40943964',
        //                 count: 1,
        //                 total: '0.40943964'
        //             },
        //         ]
        //     }
        //
        const marketId = this.safeString (message, 'pair');
        const symbol = this.safeSymbol (marketId);
        const timestamp = this.safeInteger (message, 'timestamp');
        orderbook['symbol'] = symbol;
        orderbook['nonce'] = timestamp;
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.safeString (message, 'datetime');
        this.handleDeltas (orderbook['asks'], this.safeValue (message, 'asks', []));
        this.handleDeltas (orderbook['bids'], this.safeValue (message, 'bids', []));
        return orderbook;
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         event: 'ORDER_BOOK',
        //         timestamp: 1650121915308,
        //         datetime: '2022-04-16T15:11:55.308Z',
        //         pair: 'BTC_TWD',
        //         limit: 5,
        //         scale: 0,
        //         bids: [
        //             { price: '1188178', amount: '0.0425', count: 1, total: '0.0425' },
        //         ],
        //         asks: [
        //             {
        //                 price: '1190740',
        //                 amount: '0.40943964',
        //                 count: 1,
        //                 total: '0.40943964'
        //             },
        //         ]
        //     }
        //
        const marketId = this.safeString (message, 'pair');
        const market = this.safeMarket (marketId, undefined, '_');
        const symbol = market['symbol'];
        const event = this.safeString (message, 'event');
        const messageHash = market['id'].toUpperCase () + '@' + event;
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ({});
        }
        this.handleOrderBookMessage (client, message, orderbook);
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const options = this.safeValue (this.options, 'watchTrades', {});
        const name = this.safeString (options, 'name', 'trade');
        const messageHash = market['id'].toUpperCase () + '@' + name;
        const apis = this.safeValue (this.apis, 'ws');
        const path = this.safeString (apis, 'watchTrades');
        const url = this.urls['ws'] + path + '/' + market['id'];
        const trades = await this.watch (url, messageHash, '', messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client, message) {
        //
        //     {
        //         event: 'TRADE',
        //         timestamp: 1650116346665,
        //         datetime: '2022-04-16T13:39:06.665Z',
        //         pair: 'BTC_TWD',
        //         data: [
        //             {
        //                 event: '',
        //                 datetime: '',
        //                 pair: '',
        //                 timestamp: 1650116227,
        //                 price: '1189429',
        //                 amount: '0.0153127',
        //                 isBuyer: true
        //             },
        //         ]
        //     }
        //
        const marketId = this.safeString (message, 'pair');
        const market = this.safeMarket (marketId, undefined, '_');
        const symbol = market['symbol'];
        const event = this.safeString (message, 'event');
        const messageHash = market['id'].toUpperCase () + '@' + event;
        let rawData = this.safeValue (message, 'data');
        if (rawData === undefined) {
            rawData = [];
        }
        const trades = this.parseTrades (rawData, market);
        let array = this.safeValue (this.trades, symbol);
        if (array === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            array = new ArrayCache (limit);
        }
        for (let i = 0; i < trades.length; i++) {
            array.append (trades[i]);
        }
        this.trades[symbol] = array;
        client.resolve (array, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'].toUpperCase ();
        const options = this.safeValue (this.options, 'watchTicker', {});
        const name = this.safeString (options, 'name', 'ticker');
        const messageHash = marketId + '@' + name;
        const apis = this.safeValue (this.apis, 'ws');
        const path = this.safeString (apis, 'watchTicker');
        const url = this.urls['ws'] + path + '/' + market['id'];
        return await this.watch (url, messageHash, '', messageHash);
    }

    handleTicker (client, message) {
        //
        //     {
        //         event: 'TICKER',
        //         timestamp: 1650119165710,
        //         datetime: '2022-04-16T14:26:05.710Z',
        //         pair: 'BTC_TWD',
        //         lastPrice: '1189110',
        //         lastPriceUSD: '40919.1328',
        //         lastPriceTWD: '1189110',
        //         isBuyer: true,
        //         priceChange24hr: '1.23',
        //         volume24hr: '7.2090',
        //         volume24hrUSD: '294985.5375',
        //         volume24hrTWD: '8572279',
        //         high24hr: '1193656',
        //         low24hr: '1179321'
        //     }
        //
        const marketId = this.safeString (message, 'pair');
        const market = this.safeMarket (marketId, undefined, '_');
        const symbol = market['symbol'];
        const event = this.safeString (message, 'event');
        const messageHash = market['id'].toUpperCase () + '@' + event;
        const timestamp = this.safeInteger (message, 'timestamp');
        const last = this.safeFloat (message, 'lastPrice');
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (message, 'high24hr'),
            'low': this.safeFloat (message, 'low24hr'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (message, 'priceChange24hr'),
            'percentage': this.safeFloat (message, 'priceChange24hr'),
            'average': undefined,
            'baseVolume': this.safeFloat (message, 'volume24hr'),
            'quoteVolume': undefined,
            'info': message,
        };
        this.tickers[symbol] = result;
        client.resolve (result, messageHash);
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const url = this.safeString (params, 'url');
        const messageHash = this.safeString (params, 'messageHash');
        const identity = this.safeString (this.options, 'identity');
        if (url === undefined || messageHash === undefined || identity === undefined) {
            throw new ArgumentsRequired (this.id + ' authenticate requires a url, messageHash and identity argument');
        }
        const nonce = this.milliseconds ();
        let rawData = {
            'nonce': nonce,
            'identity': identity,
        };
        rawData = this.json (rawData);
        const payload = this.stringToBase64 (rawData);
        const signature = this.hmac (payload, this.encode (this.secret), 'sha384');
        const request = {
            'X-BITOPRO-API': 'ccxt',
            'X-BITOPRO-APIKEY': this.apiKey,
            'X-BITOPRO-PAYLOAD': payload,
            'X-BITOPRO-SIGNATURE': signature,
        };
        this.options['ws']['options']['headers'] = request;
        const client = this.client (url);
        const future = this.safeValue (client.subscriptions, messageHash);
        return await future;
    }

    async watchBalance (params = {}) {
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'watchBalance', {});
        const name = this.safeString (options, 'name');
        const messageHash = 'watchBalance@' + name;
        const apis = this.safeValue (this.apis, 'ws');
        const path = this.safeString (apis, 'watchBalance');
        const url = this.urls['ws'] + path;
        const future = await this.authenticate ({
            messageHash,
            url,
        });
        return await this.watch (url, messageHash, '', messageHash, future);
    }

    handleBalance (client, message) {
        //
        //     {
        //         event: 'ACCOUNT_BALANCE',
        //         timestamp: 1650450505715,
        //         datetime: '2022-04-20T10:28:25.715Z',
        //         data: {
        //           ADA: {
        //             currency: 'ADA',
        //             amount: '0',
        //             available: '0',
        //             stake: '0',
        //             tradable: true
        //           },
        //         }
        //     }
        //
        const event = this.safeString (message, 'event');
        const data = this.safeValue (message, 'data');
        const currencies = Object.keys (data);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = this.safeString (currencies, i);
            const balance = this.safeValue (data, currency);
            const code = this.safeCurrencyCode (this.safeString (balance, 'currency'));
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['total'] = this.safeString (balance, 'amount');
            result[code] = account;
        }
        const messageHash = 'watchBalance@' + event;
        this.balance = this.safeBalance (result);
        client.resolve (this.balance, messageHash);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const options = this.safeValue (this.options, 'watchOrders', {});
        const name = this.safeString (options, 'name');
        let messageHash = 'watchOrders@' + name;
        if (symbol !== undefined) {
            messageHash += ':' + market['symbol'];
        }
        const apis = this.safeValue (this.apis, 'ws');
        const path = this.safeString (apis, 'watchOrders');
        const url = this.urls['ws'] + path;
        const future = await this.authenticate ({
            messageHash,
            url,
        });
        const orders = await this.watch (url, messageHash, '', messageHash, future);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, market['symbol'], since, limit, true);
    }

    handleOrders (client, message) {
        //
        //     {
        //         event: 'ACTIVE_ORDERS',
        //         timestamp: 1650526066301,
        //         datetime: '2022-04-21T07:27:46.301Z',
        //         data: {
        //             usdt_twd: [
        //                 {
        //                     id: '3387412609',
        //                     pair: 'usdt_twd',
        //                     price: '29.99',
        //                     avgExecutionPrice: '0',
        //                     action: 'SELL',
        //                     type: 'LIMIT',
        //                     timestamp: 1650526032858,
        //                     status: 0,
        //                     originalAmount: '1',
        //                     remainingAmount: '1',
        //                     executedAmount: '0',
        //                     fee: '0',
        //                     feeSymbol: 'twd',
        //                     bitoFee: '0',
        //                     total: '0',
        //                     seq: 'USDTTWD9172892144',
        //                     timeInForce: 'GTC',
        //                     createdTimestamp: 1650526032000,
        //                     updatedTimestamp: 1650526032858
        //                 }
        //             ]
        //         }
        //     }
        //
        const event = this.safeString (message, 'event');
        const messageHash = 'watchOrders@' + event;
        const data = this.safeValue (message, 'data');
        const currencies = Object.keys (data);
        if (currencies.length > 0) {
            if (this.orders === undefined) {
                const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const stored = this.orders;
            const symbols = {};
            for (let i = 0; i < currencies.length; i++) {
                const currency = currencies[i];
                const ordersByCurrency = this.safeValue (data, currency);
                for (let j = 0; j < ordersByCurrency.length; j++) {
                    const currentOrder = ordersByCurrency[j];
                    const orderId = this.safeString (currentOrder, 'id');
                    const previousOrder = this.safeValue (stored.hashmap, orderId);
                    let rawOrder = currentOrder;
                    if (previousOrder !== undefined) {
                        rawOrder = this.extend (previousOrder['info'], currentOrder);
                    }
                    const order = this.parseOrder (rawOrder);
                    stored.append (order);
                    const symbol = order['symbol'];
                    symbols[symbol] = true;
                }
            }
            client.resolve (this.orders, messageHash);
            for (let i = 0; i < currencies.length; i++) {
                const market = this.safeMarket (currencies[i], undefined, '_');
                const symbol = market['symbol'];
                client.resolve (this.orders, messageHash + ':' + symbol);
            }
        }
    }

    handleMessage (client, message) {
        const methods = {
            'TRADE': this.handleTrade,
            'TICKER': this.handleTicker,
            'ORDER_BOOK': this.handleOrderBook,
            'ACCOUNT_BALANCE': this.handleBalance,
            'ACTIVE_ORDERS': this.handleOrders,
        };
        const event = this.safeString (message, 'event');
        const method = this.safeValue (methods, event);
        if (method === undefined) {
            return message;
        } else {
            return method.call (this, client, message);
        }
    }
};
