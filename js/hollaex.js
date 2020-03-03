'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest, AuthenticationError, NetworkError, ArgumentsRequired, OrderNotFound } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class hollaex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hollaex',
            'name': 'HollaEx',
            'countries': [ 'KR' ],
            'rateLimit': 333,
            'version': 'v1',
            'has': {
                'CORS': false,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': true,
                'fetchTrades': true,
                'fetchOHLCV': true,
                'fetchBalance': true,
                'createOrder': true,
                'createLimitBuyOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketSellOrder': true,
                'cancelOrder': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchOrders': true,
                'fetchMyTrades': true,
                'withdraw': true,
                'fetchDepositAddress': true,
            },
            'timeframes': {
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/10441291/59487066-8058b500-8eb6-11e9-82fd-c9157b18c2d8.jpg',
                'api': 'https://api.hollaex.com',
                'www': 'https://hollaex.com',
                'doc': 'https://apidocs.hollaex.com',
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'health',
                        'constant',
                        'ticker',
                        'ticker/all',
                        'orderbooks',
                        'trades',
                        'chart',
                        // TradingView data
                        'udf/config',
                        'udf/history',
                        'udf/symbols',
                    ],
                },
                'private': {
                    'get': [
                        'user',
                        'user/balance',
                        'user/trades',
                        'user/orders',
                        'user/orders/{orderId}',
                        'user/deposits',
                        'user/withdrawals',
                        'user/withdraw/{currency}/fee',
                    ],
                    'post': [
                        'user/request-withdrawal',
                        'order',
                    ],
                    'delete': [
                        'user/orders',
                        'user/orders/{order_id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                },
            },
            'exceptions': {
                'broad': {
                    'Invalid token': AuthenticationError,
                    'Order not found': OrderNotFound,
                },
                'exact': {
                    '400': BadRequest,
                    '403': AuthenticationError,
                    '404': BadRequest,
                    '405': BadRequest,
                    '410': BadRequest,
                    '429': BadRequest,
                    '500': NetworkError,
                    '503': NetworkError,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetConstant (params);
        //
        //     {
        //         coins: {
        //             xmr: {
        //                 id: 7,
        //                 fullname: "Monero",
        //                 symbol: "xmr",
        //                 active: true,
        //                 allow_deposit: true,
        //                 allow_withdrawal: true,
        //                 withdrawal_fee: 0.02,
        //                 min: 0.001,
        //                 max: 100000,
        //                 increment_unit: 0.001,
        //                 deposit_limits: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 },
        //                 withdrawal_limits: { '1': 10, '2': 15, '3': 100, '4': 100, '5': 200, '6': 300, '7': 350, '8': 400, '9': 500, '10': -1 },
        //                 created_at: "2019-12-09T07:14:02.720Z",
        //                 updated_at: "2020-01-16T12:12:53.162Z"
        //             },
        //             // ...
        //         },
        //         pairs: {
        //             'btc-usdt': {
        //                 id: 2,
        //                 name: "btc-usdt",
        //                 pair_base: "btc",
        //                 pair_2: "usdt",
        //                 taker_fees: { '1': 0.3, '2': 0.25, '3': 0.2, '4': 0.18, '5': 0.1, '6': 0.09, '7': 0.08, '8': 0.06, '9': 0.04, '10': 0 },
        //                 maker_fees: { '1': 0.1, '2': 0.08, '3': 0.05, '4': 0.03, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 },
        //                 min_size: 0.0001,
        //                 max_size: 1000,
        //                 min_price: 100,
        //                 max_price: 100000,
        //                 increment_size: 0.0001,
        //                 increment_price: 0.05,
        //                 active: true,
        //                 created_at: "2019-12-09T07:15:54.537Z",
        //                 updated_at: "2019-12-09T07:15:54.537Z"
        //             },
        //         },
        //         config: { tiers: 10 },
        //         status: true
        //     }
        //
        const pairs = this.safeValue (response, 'pairs', {});
        const keys = Object.keys (pairs);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const market = pairs[key];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'pair_base');
            const quoteId = this.safeString (market, 'pair_2');
            const base = this.commonCurrencyCode (baseId.toUpperCase ());
            const quote = this.commonCurrencyCode (quoteId.toUpperCase ());
            const symbol = base + '/' + quote;
            const active = this.safeValue (market, 'active');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': {
                    'price': this.safeFloat (market, 'increment_price'),
                    'amount': this.safeFloat (market, 'increment_size'),
                },
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'min_size'),
                        'max': this.safeFloat (market, 'max_size'),
                    },
                    'price': {
                        'min': this.safeFloat (market, 'min_price'),
                        'max': this.safeFloat (market, 'max_price'),
                    },
                    'cost': { 'min': undefined, 'max': undefined },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetConstant (params);
        const coins = this.safeValue (response, 'coins', {});
        const keys = Object.keys (coins);
        const result = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const currency = coins[key];
            const id = this.safeString (currency, 'symbol');
            const numericId = this.safeInteger (currency, 'id');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'fullname');
            const active = this.safeValue (currency, 'active');
            const fee = this.safeFloat (currency, 'withdrawal_fee');
            const precision = this.safeFloat (currency, 'increment_unit');
            const withdrawalLimits = this.safeValue (currency, 'withdrawal_limits', []);
            result[code] = {
                'id': id,
                'numericId': numericId,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (currency, 'min'),
                        'max': this.safeFloat (currency, 'max'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': this.safeValue (withdrawalLimits, 0),
                    },
                },
            };
        }
        return result;
    }

    async fetchOrderBooks (symbols = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetOrderbooks (params);
        const result = {};
        const marketIds = Object.keys (response);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const orderbook = response[marketId];
            let symbol = marketId;
            if (marketId in this.markets_by_id) {
                const market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
            const timestamp = this.parse8601 (this.safeString (orderbook, 'timestamp'));
            result[symbol] = this.parseOrderBook (response[marketId], timestamp);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = {
            'symbol': marketId,
        };
        const response = await this.publicGetOrderbooks (this.extend (request, params));
        //
        //     {
        //         "btc-usdt": {
        //             "bids": [
        //                 [ 8836.4, 1.022 ],
        //                 [ 8800, 0.0668 ],
        //                 [ 8797.75, 0.2398 ],
        //             ],
        //             "asks": [
        //                 [ 8839.35, 1.5334 ],
        //                 [ 8852.6, 0.0579 ],
        //                 [ 8860.45, 0.1815 ],
        //             ],
        //             "timestamp": "2020-03-03T02:27:25.147Z"
        //         },
        //         "eth-usdt": {},
        //         // ...
        //     }
        //
        const orderbook = this.safeValue (response, marketId);
        const timestamp = this.parse8601 (this.safeString (orderbook, 'timestamp'));
        return this.parseOrderBook (orderbook, timestamp);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //     {
        //         open: 8615.55,
        //         close: 8841.05,
        //         high: 8921.1,
        //         low: 8607,
        //         last: 8841.05,
        //         volume: 20.2802,
        //         timestamp: '2020-03-03T03:11:18.964Z'
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickerAll (this.extend (params));
        //
        //     {
        //         "bch-usdt": {
        //             "time": "2020-03-02T04:29:45.011Z",
        //             "open": 341.65,
        //             "close":337.9,
        //             "high":341.65,
        //             "low":337.3,
        //             "last":337.9,
        //             "volume":0.054,
        //             "symbol":"bch-usdt"
        //         },
        //         // ...
        //     }
        //
        return this.parseTickers (response, symbols);
    }

    parseTickers (response, symbols = undefined) {
        const result = {};
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const ticker = response[key];
            let symbol = key;
            let market = undefined;
            const marketId = this.safeString (ticker, 'symbol', key);
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('-');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         open: 8615.55,
        //         close: 8841.05,
        //         high: 8921.1,
        //         low: 8607,
        //         last: 8841.05,
        //         volume: 20.2802,
        //         timestamp: '2020-03-03T03:11:18.964Z',
        //     }
        //
        // fetchTickers
        //
        //     {
        //         "time": "2020-03-02T04:29:45.011Z",
        //         "open": 341.65,
        //         "close": 337.9,
        //         "high": 341.65,
        //         "low": 337.3,
        //         "last": 337.9,
        //         "volume": 0.054,
        //         "symbol": "bch-usdt"
        //     }
        //
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('-');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const timestamp = this.parse8601 (this.safeString2 (ticker, 'time', 'timestamp'));
        const close = this.safeFloat (ticker, 'close');
        const result = {
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': close,
            'last': this.safeFloat (ticker, 'last', close),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
        };
        return result;
    }

    async fetchTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response[market['id']], market);
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const info = trade;
        const id = undefined;
        const datetime = this.safeString (trade, 'timestamp');
        const timestamp = this.parse8601 (datetime);
        const order = undefined;
        const type = undefined;
        const side = this.safeString (trade, 'side');
        const takerOrMaker = undefined;
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'size');
        const cost = parseFloat (this.amountToPrecision (symbol, price * amount));
        const fee = undefined;
        const result = {
            'info': info,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': order,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
        return result;
    }

    async fetchOHLCV (symbol = undefined, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const to = this.seconds ();
        let fromTime = since;
        if (fromTime === undefined) {
            fromTime = to - 2592000; // default to a month
        } else {
            fromTime /= 1000;
        }
        const request = {
            'from': fromTime,
            'to': to,
            'symbol': market['id'],
            'resolution': this.timeframes[timeframe],
        };
        const response = await this.publicGetChart (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (response, market = undefined, timeframe = '1h', since = undefined, limit = undefined) {
        const time = this.parse8601 (this.safeString (response, 'time'));
        const open = this.safeFloat (response, 'open');
        const high = this.safeFloat (response, 'high');
        const low = this.safeFloat (response, 'low');
        const close = this.safeFloat (response, 'close');
        const volume = this.safeFloat (response, 'volume');
        return [
            time,
            open,
            high,
            low,
            close,
            volume,
        ];
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetUserBalance (params);
        const result = {
            'info': response,
            'free': undefined,
            'used': undefined,
            'total': undefined,
        };
        const free = {};
        const used = {};
        const total = {};
        const currencyId = Object.keys (this.currencies_by_id);
        for (let i = 0; i < currencyId.length; i++) {
            const currency = this.currencies_by_id[currencyId[i]]['code'];
            const responseCurr = currencyId[i];
            free[currency] = response[responseCurr + '_available'];
            total[currency] = response[responseCurr + '_balance'];
            used[currency] = parseFloat (this.currencyToPrecision (currency, total[currency] - free[currency]));
            result[currency] = {
                'free': free[currency],
                'used': used[currency],
                'total': total[currency],
            };
        }
        result['free'] = free;
        result['used'] = used;
        result['total'] = total;
        return result;
    }

    async fetchOrder (id = undefined, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires an orderId argument');
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderId = this.safeValue (params, 'orderId');
        const request = {
            'orderId': orderId,
        };
        if (orderId === undefined) {
            request['orderId'] = id;
        }
        const response = await this.privateGetUserOrdersOrderId (this.extend (request, params));
        if (symbol !== this.markets_by_id[response['symbol']]['symbol']) {
            throw new BadRequest (this.id + ' symbol argument does not match order symbol');
        }
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetUserOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, params);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (order, 'id');
        const datetime = this.safeString (order, 'created_at');
        const timestamp = this.parse8601 (datetime);
        const lastTradeTimestamp = undefined;
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'size');
        const filled = this.safeFloat (order, 'filled');
        const remaining = parseFloat (this.amountToPrecision (symbol, amount - filled));
        let cost = undefined;
        let status = 'open';
        if (type === 'market') {
            status = 'closed';
        } else {
            cost = parseFloat (this.priceToPrecision (symbol, filled * price));
        }
        const trades = undefined;
        const fee = undefined;
        const info = order;
        const result = {
            'id': id,
            'datetime': datetime,
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': trades,
            'fee': fee,
            'info': info,
        };
        return result;
    }

    async createOrder (symbol = undefined, type = undefined, side = undefined, amount = undefined, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a symbol argument');
        }
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a type argument');
        }
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a side argument');
        }
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires an amount argument');
        }
        if (type === 'limit' && price === undefined) {
            throw new ArgumentsRequired (this.id + ' limit createOrder requires a price argument');
        }
        if (type === 'market' && price !== undefined) {
            throw new BadRequest (this.id + ' market createOrder does not require a price argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const order = {
            'symbol': market['id'],
            'side': side,
            'size': amount,
            'type': type,
            'price': price,
        };
        const response = await this.privatePostOrder (this.extend (order, params));
        response['created_at'] = this.iso8601 (this.milliseconds ());
        return this.parseOrder (response, market);
    }

    async createLimitBuyOrder (symbol = undefined, amount = undefined, price = undefined, params = {}) {
        return this.createOrder (symbol, 'limit', 'buy', amount, price, params);
    }

    async createLimitSellOrder (symbol = undefined, amount = undefined, price = undefined, params = {}) {
        return this.createOrder (symbol, 'limit', 'sell', amount, price, params);
    }

    async createMarketBuyOrder (symbol = undefined, amount = undefined, params = {}) {
        return this.createOrder (symbol, 'market', 'buy', amount, undefined, params);
    }

    async createMarketSellOrder (symbol = undefined, amount = undefined, params = {}) {
        return this.createOrder (symbol, 'market', 'sell', amount, undefined, params);
    }

    async cancelOrder (id = undefined, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires an id argument');
        }
        const request = {
            'orderId': id,
        };
        const response = await this.privateDeleteUserOrdersOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetUserTrades (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchDepositAddress (code = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDepositAddress requires a code argument');
        }
        await this.loadMarkets ();
        const curr = await this.currency (code);
        const currency = this.safeString (curr, 'name').toLowerCase ();
        const response = await this.privateGetUser ();
        const info = this.safeValue (response, 'crypto_wallet');
        const address = this.safeString (info, currency);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': info[currency],
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (code !== undefined) {
            const currency = this.currency (code)['id'];
            request['currency'] = currency;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetUserDeposits (this.extend (request, params));
        return this.parseTransactions (response.data);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (code !== undefined) {
            const currency = this.currency (code)['id'];
            request['currency'] = currency;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetUserWithdrawals (this.extend (request, params));
        return this.parseTransactions (response.data);
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeFloat (transaction, 'id');
        const txid = this.safeString (transaction, 'transaction_id');
        const datetime = this.safeString (transaction, 'created_at');
        const timestamp = this.parse8601 (datetime);
        const addressFrom = undefined;
        const address = undefined;
        const addressTo = undefined;
        const tagFrom = undefined;
        const tag = undefined;
        const tagTo = undefined;
        const type = this.safeString (transaction, 'type');
        const amount = this.safeFloat (transaction, 'amount');
        const currencyId = this.safeString (transaction, 'currency');
        currency = this.currencies_by_id[currencyId]['code'];
        let message = 'pending';
        const status = transaction['status'];
        const dismissed = transaction['dismissed'];
        const rejected = transaction['rejected'];
        if (status) {
            message = 'ok';
        } else if (dismissed) {
            message = 'canceled';
        } else if (rejected) {
            message = 'failed';
        }
        const updated = undefined;
        const comment = this.safeString (transaction, 'description');
        const fee = {
            'currency': currency,
            'cost': this.safeFloat (transaction, 'fee'),
            'rate': undefined,
        };
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': datetime,
            'addressFrom': addressFrom,
            'address': address,
            'addressTo': addressTo,
            'tagFrom': tagFrom,
            'tag': tag,
            'tagTo': tagTo,
            'type': type,
            'amount': amount,
            'currency': currency,
            'status': message,
            'updated': updated,
            'comment': comment,
            'fee': fee,
        };
    }

    async withdraw (code = undefined, amount = undefined, address = undefined, tag = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw requires a code argument');
        }
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw requires an amount argument');
        }
        if (address === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw requires an address argument');
        }
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currencies[code]['id'];
        const request = {
            'currency': currency,
            'amount': amount,
            'address': address,
        };
        const response = await this.privatePostUserRequestWithdrawal (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version;
        if (api === 'public') {
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
            const accessToken = 'Bearer ' + this.apiKey;
            headers = {
                'Content-Type': 'application/json',
                'Authorization': accessToken,
            };
            if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
                if (Object.keys (params).length) {
                    body = this.json (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code >= 400 && code <= 503) {
            //
            //  { "message": "Invalid token" }
            //
            const feedback = this.id + ' ' + body;
            const message = this.safeString (response, 'message');
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            const status = code.toString ();
            this.throwExactlyMatchedException (this.exceptions['exact'], status, feedback);
        }
    }
};
