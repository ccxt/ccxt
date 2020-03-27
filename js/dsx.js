'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InvalidNonce, BadRequest, InsufficientFunds, PermissionDenied, DDoSProtection, InvalidOrder, AuthenticationError } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class dsx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'dsx',
            'name': 'DSX',
            'countries': [ 'UK' ],
            'rateLimit': 100,
            'has': {
                'CORS': false,
                'cancelOrder': false,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createOrder': false,
                'fetchBalance': false,
                'fetchCurrencies': true,
                'fetchL2OrderBook': false,
                'fetchMarkets': false,
                'fetchOrderBook': true,
                'fetchTicker': false,
                'fetchTickers': true,
                'fetchTrades': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/76909626-cb2bb100-68bc-11ea-99e0-28ba54f04792.jpg',
                'api': {
                    'public': 'https://api.dsxglobal.com/api/2/public',
                    'private': 'https://api.dsxglobal.com/api/2',
                },
                'www': 'http://dsxglobal.com',
                'doc': [
                    'https://api.dsxglobal.com',
                ],
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.15 / 100,
                    'taker': 0.25 / 100,
                },
            },
            'timeframes': {
                '1m': 'm',
                '1h': 'h',
                '1d': 'd',
            },
            'api': {
                // market data (public)
                'public': {
                    'get': [
                        'currency',
                        'currency/{currency}',
                        'symbol',
                        'symbol/{symbol}',
                        'ticker',
                        'ticker/{symbol}',
                        'trades',
                        'trades/{symbol}',
                        'orderbook',
                        'orderbook/{symbol}',
                        'candles',
                        'candles/{symbol}',
                    ],
                },
                // trading (private)
                'private': {
                    'get': [
                        'trading/balance',
                        'account/balance',
                        'account/crypto/address/{currency}',
                        'account/crypto/is-mine/{address}',
                        'account/transactions',
                        'account/transactions/{id}',
                        'sub-acc​/balance​/{subAccountUserID}',
                        'sub-acc',
                        'sub-acc​/acl',
                        'trading/fee/{symbol}',
                        'history/order',
                        'history/trades',
                        'history/order/{orderId}/trades',
                        'order',
                        'order/{clientOrderId}',
                    ],
                    'post': [
                        'order',
                        'account/crypto/address/{currency}',
                        'account/crypto/withdraw',
                        'account/crypto/transfer-convert',
                        'account/transfer',
                        'sub-acc​/freeze',
                        'sub-acc​/activate',
                        'sub-acc​/transfer',
                    ],
                    'put': [
                        'order/{clientOrderId}',
                        'account/crypto/withdraw/{id}',
                        'sub-acc​/acl​/{subAccountUserId}',
                    ],
                    'delete': [
                        'order',
                        'order/{clientOrderId}',
                        'account/crypto/withdraw/{id}',
                    ],
                },
            },
            'exceptions': {
                'exact': {
                    'Sign is invalid': AuthenticationError, // {"success":0,"error":"Sign is invalid"}
                    'Order was rejected. Incorrect price.': InvalidOrder, // {"success":0,"error":"Order was rejected. Incorrect price."}
                    "Order was rejected. You don't have enough money.": InsufficientFunds, // {"success":0,"error":"Order was rejected. You don't have enough money."}
                    'This method is blocked for your pair of keys': PermissionDenied, // {"success":0,"error":"This method is blocked for your pair of keys"}
                },
                'broad': {
                    'INVALID_PARAMETER': BadRequest,
                    'Invalid pair name': ExchangeError, // {"success":0,"error":"Invalid pair name: btc_eth"}
                    'invalid api key': AuthenticationError,
                    'invalid sign': AuthenticationError,
                    'api key dont have trade permission': AuthenticationError,
                    'invalid parameter': InvalidOrder,
                    'invalid order': InvalidOrder,
                    'Requests too often': DDoSProtection,
                    'not available': ExchangeNotAvailable,
                    'data unavailable': ExchangeNotAvailable,
                    'external service unavailable': ExchangeNotAvailable,
                    'nonce is invalid': InvalidNonce, // {"success":0,"error":"Parameter: nonce is invalid"}
                },
            },
            'options': {
                'fetchTickersMaxLength': 250,
            },
            'commonCurrencies': {
                'DSH': 'DASH',
            },
        });
    }

    async fetchCurrenciesFromCache (params = {}) {
        const options = this.safeValue (this.options, 'fetchCurrencies', {});
        const timestamp = this.safeInteger (options, 'timestamp');
        const expires = this.safeInteger (options, 'expires', 1000);
        const now = this.milliseconds ();
        if ((timestamp === undefined) || ((now - timestamp) > expires)) {
            const currencies = await this.publicGetCurrency (params);
            this.options['fetchCurrencies'] = this.extend (options, {
                'currencies': currencies,
                'timestamp': now,
            });
        }
        return this.safeValue (this.options, 'fetchCurrencies', {});
    }

    async fetchCurrencies (params = {}) {
        const response = await this.fetchCurrenciesFromCache (params);
        const currencies = this.safeValue (response, 'currencies', {});
        //   [ { id: 'BCH',
        //     fullName: 'Bitcoin Cash',
        //     crypto: true,
        //     payinEnabled: true,
        //     payinPaymentId: false,
        //     payinConfirmations: 2,
        //     payoutEnabled: true,
        //     payoutIsPaymentId: false,
        //     transferEnabled: true,
        //     delisted: false,
        //     payoutFee: '0.000500000000' }, ...
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'id');
            const name = this.safeString (currency, 'fullName');
            const code = this.safeCurrencyCode (id, name);
            const transferEnabled = currency['transferEnabled'];
            const delisted = currency['delisted'];
            // todo: check what these bools actually mean
            const payinEnabled = currency['payinEnabled'];
            const payoutEnabled = currency['payoutEnabled'];
            const active = !delisted && transferEnabled && payinEnabled && payoutEnabled;
            const fee = this.safeFloat (currency, 'payoutFee');
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': active,
                'fee': fee,
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetSymbol (params);
        //
        //     [ { id: 'BTCUSDT',
        //     baseCurrency: 'BTC',
        //     quoteCurrency: 'USDT',
        //     quantityIncrement: '0.00001',
        //     tickSize: '0.01',
        //     takeLiquidityRate: '0.0025',
        //     provideLiquidityRate: '0.0015',
        //     feeCurrency: 'USDT' ... },
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quoteCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const maker = this.safeFloat (market, 'provideLiquidityRate');
            const taker = this.safeFloat (market, 'takeLiquidityRate');
            const precision = {
                'price': this.safeFloat (market, 'tickSize'),
                'amount': this.safeFloat (market, 'quantityIncrement'),
            };
            const limits = {
                'amount': {},
                'price': {},
                'cost': {},
            };
            const active = undefined;
            const otherId = base.toLowerCase () + quote.toLowerCase ();
            result.push ({
                'id': id,
                'otherId': otherId, // https://github.com/ccxt/ccxt/pull/5786
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'maker': maker,
                'taker': taker,
                'feeCurrency': this.safeString ('feeCurrency'),
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.publicGetTicker (params);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            const id = this.safeString (ticker, 'symbol');
            const market = this.markets_by_id[id];
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //   { symbol: 'BSVUSD',
        //     ask: '100000.000',
        //     bid: '0.207',
        //     last: null,
        //     open: null,
        //     low: '0',
        //     high: '0',
        //     volume: '0',
        //     volumeQuote: '0',
        //     timestamp: '2020-03-27T10:31:08.583Z' }
        //
        const timestamp = this.parse8601 (this.safeString (ticker, 'timestamp'));
        const symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': undefined,
            'last': this.safeFloat (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'volumeQuote'),
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        // the API docs are wrong - all orderbooks get returned if no symbol is present so we can implement fetchOrderbooks using publicGetOrderbook()
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderBook() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const orderbook = await this.publicGetOrderbookSymbol (this.extend (request, params));
        const timestamp = this.parse8601 (this.safeString (orderbook, 'timestamp'));
        return this.parseOrderBook (orderbook, timestamp, 'bid', 'ask', 'price', 'size');
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccountBalance ();
        //   [ { currency: 'BCH', available: '0.00000165', reserved: '0' },
        //     { currency: 'BTG', available: '0.00000727', reserved: '0' },...
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const id = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (id);
            const free = this.safeFloat (balance, 'available');
            const used = this.safeFloat (balance, 'reserved');
            const account = this.account ();
            account['free'] = free;
            account['used'] = used;
            account['total'] = free + used;
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "amount" : 0.0128,
        //         "price" : 6483.99000,
        //         "timestamp" : 1540334614,
        //         "tid" : 35684364,
        //         "type" : "ask"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "number": "36635882", // <-- this is present if the trade has come from the '/order/status' call
        //         "id": "36635882", // <-- this may have been artifically added by the parseTrades method
        //         "pair": "btcusd",
        //         "type": "buy",
        //         "volume": 0.0595,
        //         "rate": 9750,
        //         "orderId": 77149299,
        //         "timestamp": 1519612317,
        //         "commission": 0.00020825,
        //         "commissionCurrency": "btc"
        //     }
        //
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        let side = this.safeString (trade, 'type');
        if (side === 'ask') {
            side = 'sell';
        } else if (side === 'bid') {
            side = 'buy';
        }
        const price = this.safeFloat2 (trade, 'rate', 'price');
        const id = this.safeString2 (trade, 'number', 'id');
        const orderId = this.safeString (trade, 'orderId');
        const marketId = this.safeString (trade, 'pair');
        market = this.parseMarket (marketId);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const amount = this.safeFloat2 (trade, 'amount', 'volume');
        const type = 'limit'; // all trades are still limit trades
        let takerOrMaker = undefined;
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'commission');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'commissionCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const isYourOrder = this.safeValue (trade, 'is_your_order');
        if (isYourOrder !== undefined) {
            takerOrMaker = 'taker';
            if (isYourOrder) {
                takerOrMaker = 'maker';
            }
            if (fee === undefined) {
                fee = this.calculateFee (symbol, type, side, amount, price, takerOrMaker);
            }
        }
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
            'info': trade,
        };
    }

    parseTrades (trades, market = undefined, since = undefined, limit = undefined, params = {}) {
        let result = [];
        if (Array.isArray (trades)) {
            for (let i = 0; i < trades.length; i++) {
                result.push (this.parseTrade (trades[i], market));
            }
        } else {
            const ids = Object.keys (trades);
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                const trade = this.parseTrade (trades[id], market);
                result.push (this.extend (trade, { 'id': id }, params));
            }
        }
        result = this.sortBy (result, 'timestamp');
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol];
        let key = 'quote';
        const rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': cost,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTradesPair (this.extend (request, params));
        if (Array.isArray (response)) {
            const numElements = response.length;
            if (numElements === 0) {
                return [];
            }
        }
        return this.parseTrades (response[market['id']], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (type === 'market' && price === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a price argument even for market orders, that is the worst price that you agree to fill your order for');
        }
        const request = {
            'pair': market['id'],
            'type': side,
            'volume': this.amountToPrecision (symbol, amount),
            'rate': this.priceToPrecision (symbol, price),
            'orderType': type,
        };
        price = parseFloat (price);
        amount = parseFloat (amount);
        const response = await this.privatePostOrderNew (this.extend (request, params));
        //
        //     {
        //       "success": 1,
        //       "return": {
        //         "received": 0,
        //         "remains": 10,
        //         "funds": {
        //           "BTC": {
        //             "total": 100,
        //             "available": 95
        //           },
        //           "USD": {
        //             "total": 10000,
        //             "available": 9995
        //           },
        //           "EUR": {
        //             "total": 1000,
        //             "available": 995
        //           },
        //           "LTC": {
        //             "total": 1000,
        //             "available": 995
        //           }
        //         },
        //         "orderId": 0, // https://github.com/ccxt/ccxt/issues/3677
        //       }
        //     }
        //
        let status = 'open';
        let filled = 0.0;
        let remaining = amount;
        const responseReturn = this.safeValue (response, 'return');
        let id = this.safeString2 (responseReturn, 'orderId', 'order_id');
        if (id === '0') {
            id = this.safeString (responseReturn, 'initOrderId', 'init_order_id');
            status = 'closed';
        }
        filled = this.safeFloat (responseReturn, 'received', 0.0);
        remaining = this.safeFloat (responseReturn, 'remains', amount);
        const timestamp = this.milliseconds ();
        return {
            'info': response,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': price * filled,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'fee': undefined,
            // 'trades': this.parseTrades (order['trades'], market),
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open', // Active
            '1': 'closed', // Filled
            '2': 'canceled', // Killed
            '3': 'canceling', // Killing
            '7': 'canceled', // Rejected
        };
        return this.safeString (statuses, status, status);
    }

    parseMarket (id) {
        if (id in this.markets_by_id) {
            return this.markets_by_id[id];
        } else {
            // the following is a fix for
            // https://github.com/ccxt/ccxt/pull/5786
            // https://github.com/ccxt/ccxt/issues/5770
            let markets_by_other_id = this.safeValue (this.options, 'markets_by_other_id');
            if (markets_by_other_id === undefined) {
                this.options['markets_by_other_id'] = this.indexBy (this.markets, 'otherId');
                markets_by_other_id = this.options['markets_by_other_id'];
            }
            if (id in markets_by_other_id) {
                return markets_by_other_id[id];
            }
        }
        return undefined;
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrder
        //
        //   {
        //     "number": 36635882,
        //     "pair": "btcusd",
        //     "type": "buy",
        //     "remainingVolume": 10,
        //     "volume": 10,
        //     "rate": 1000.0,
        //     "timestampCreated": 1496670,
        //     "status": 0,
        //     "orderType": "limit",
        //     "deals": [
        //       {
        //         "pair": "btcusd",
        //         "type": "buy",
        //         "amount": 1,
        //         "rate": 1000.0,
        //         "orderId": 1,
        //         "timestamp": 1496672724,
        //         "commission": 0.001,
        //         "commissionCurrency": "btc"
        //       }
        //     ]
        //   }
        //
        const id = this.safeString (order, 'id');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const timestamp = this.safeTimestamp (order, 'timestampCreated');
        const marketId = this.safeString (order, 'pair');
        market = this.parseMarket (marketId);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const remaining = this.safeFloat (order, 'remainingVolume');
        const amount = this.safeFloat (order, 'volume');
        const price = this.safeFloat (order, 'rate');
        let filled = undefined;
        let cost = undefined;
        if (amount !== undefined) {
            if (remaining !== undefined) {
                filled = amount - remaining;
                cost = price * filled;
            }
        }
        const orderType = this.safeString (order, 'orderType');
        const side = this.safeString (order, 'type');
        let fee = undefined;
        const deals = this.safeValue (order, 'deals', []);
        const numDeals = deals.length;
        let trades = undefined;
        let lastTradeTimestamp = undefined;
        if (numDeals > 0) {
            trades = this.parseTrades (deals);
            let feeCost = undefined;
            let feeCurrency = undefined;
            for (let i = 0; i < trades.length; i++) {
                const trade = trades[i];
                if (feeCost === undefined) {
                    feeCost = 0;
                }
                feeCost = this.sum (feeCost, trade['fee']['cost']);
                feeCurrency = trade['fee']['currency'];
                lastTradeTimestamp = trade['timestamp'];
            }
            if (feeCost !== undefined) {
                fee = {
                    'cost': feeCost,
                    'currency': feeCurrency,
                };
            }
        }
        return {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'type': orderType,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': parseInt (id),
        };
        const response = await this.privatePostOrderStatus (this.extend (request, params));
        //
        //     {
        //       "success": 1,
        //       "return": {
        //         "pair": "btcusd",
        //         "type": "buy",
        //         "remainingVolume": 10,
        //         "volume": 10,
        //         "rate": 1000.0,
        //         "timestampCreated": 1496670,
        //         "status": 0,
        //         "orderType": "limit",
        //         "deals": [
        //           {
        //             "pair": "btcusd",
        //             "type": "buy",
        //             "amount": 1,
        //             "rate": 1000.0,
        //             "orderId": 1,
        //             "timestamp": 1496672724,
        //             "commission": 0.001,
        //             "commissionCurrency": "btc"
        //           }
        //         ]
        //       }
        //     }
        //
        return this.parseOrder (this.extend ({
            'id': id,
        }, response['return']));
    }

    parseOrdersById (orders, symbol = undefined, since = undefined, limit = undefined) {
        const ids = Object.keys (orders);
        const result = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const order = this.parseOrder (this.extend ({
                'id': id.toString (),
            }, orders[id]));
            result.push (order);
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'count': 10, // Decimal, The maximum number of orders to return
            // 'fromId': 123, // Decimal, ID of the first order of the selection
            // 'endId': 321, // Decimal, ID of the last order of the selection
            // 'order': 'ASC', // String, Order in which orders shown. Possible values are "ASC" — from first to last, "DESC" — from last to first.
        };
        const response = await this.privatePostOrders (this.extend (request, params));
        //
        //     {
        //       "success": 1,
        //       "return": {
        //         "0": {
        //           "pair": "btcusd",
        //           "type": "buy",
        //           "remainingVolume": 10,
        //           "volume": 10,
        //           "rate": 1000.0,
        //           "timestampCreated": 1496670,
        //           "status": 0,
        //           "orderType": "limit"
        //         }
        //       }
        //     }
        //
        return this.parseOrdersById (this.safeValue (response, 'return', {}), symbol, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'count': 10, // Decimal, The maximum number of orders to return
            // 'fromId': 123, // Decimal, ID of the first order of the selection
            // 'endId': 321, // Decimal, ID of the last order of the selection
            // 'order': 'ASC', // String, Order in which orders shown. Possible values are "ASC" — from first to last, "DESC" — from last to first.
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privatePostHistoryOrders (this.extend (request, params));
        //
        //     {
        //       "success": 1,
        //       "return": {
        //         "0": {
        //           "pair": "btcusd",
        //           "type": "buy",
        //           "remainingVolume": 10,
        //           "volume": 10,
        //           "rate": 1000.0,
        //           "timestampCreated": 1496670,
        //           "status": 0,
        //           "orderType": "limit"
        //         }
        //       }
        //     }
        //
        return this.parseOrdersById (this.safeValue (response, 'return', {}), symbol, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privatePostOrderCancel (this.extend (request, params));
        if (id in this.orders) {
            this.orders[id]['status'] = 'canceled';
        }
        return response;
    }

    parseOrders (orders, market = undefined, since = undefined, limit = undefined, params = {}) {
        const result = [];
        const ids = Object.keys (orders);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const order = this.extend ({ 'id': id }, orders[id]);
            result.push (this.extend (this.parseOrder (order, market), params));
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        // some derived classes use camelcase notation for request fields
        const request = {
            // 'from': 123456789, // trade ID, from which the display starts numerical 0 (test result: liqui ignores this field)
            // 'count': 1000, // the number of trades for display numerical, default = 1000
            // 'from_id': trade ID, from which the display starts numerical 0
            // 'end_id': trade ID on which the display ends numerical ∞
            // 'order': 'ASC', // sorting, default = DESC (test result: liqui ignores this field, most recent trade always goes last)
            // 'since': 1234567890, // UTC start time, default = 0 (test result: liqui ignores this field)
            // 'end': 1234567890, // UTC end time, default = ∞ (test result: liqui ignores this field)
            // 'pair': 'eth_btc', // default = all markets
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit !== undefined) {
            request['count'] = parseInt (limit);
        }
        if (since !== undefined) {
            request['since'] = parseInt (since / 1000);
        }
        const response = await this.privatePostHistoryTrades (this.extend (request, params));
        let trades = [];
        if ('return' in response) {
            trades = response['return'];
        }
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privatePostHistoryTransactions (this.extend (request, params));
        //
        //     {
        //         "success": 1,
        //         "return": [
        //             {
        //                 "id": 1,
        //                 "timestamp": 11,
        //                 "type": "Withdraw",
        //                 "amount": 1,
        //                 "currency": "btc",
        //                 "confirmationsCount": 6,
        //                 "address": "address",
        //                 "status": 2,
        //                 "commission": 0.0001
        //             }
        //         ]
        //     }
        //
        const transactions = this.safeValue (response, 'return', []);
        return this.parseTransactions (transactions, currency, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            '1': 'failed',
            '2': 'ok',
            '3': 'pending',
            '4': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //         "id": 1,
        //         "timestamp": 11, // 11 in their docs (
        //         "type": "Withdraw",
        //         "amount": 1,
        //         "currency": "btc",
        //         "confirmationsCount": 6,
        //         "address": "address",
        //         "status": 2,
        //         "commission": 0.0001
        //     }
        //
        const timestamp = this.safeTimestamp (transaction, 'timestamp');
        let type = this.safeString (transaction, 'type');
        if (type !== undefined) {
            if (type === 'Incoming') {
                type = 'deposit';
            } else if (type === 'Withdraw') {
                type = 'withdrawal';
            }
        }
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        return {
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'txid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': this.safeString (transaction, 'address'),
            'type': type,
            'amount': this.safeFloat (transaction, 'amount'),
            'currency': code,
            'status': status,
            'fee': {
                'currency': code,
                'cost': this.safeFloat (transaction, 'commission'),
                'rate': undefined,
            },
            'info': transaction,
        };
    }

    async createDepositAddress (code, params = {}) {
        const request = {
            'new': 1,
        };
        const response = await this.fetchDepositAddress (code, this.extend (request, params));
        return response;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.dwapiPostDepositCryptoaddress (this.extend (request, params));
        const result = this.safeValue (response, 'return', {});
        const address = this.safeString (result, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined, // not documented in DSX API
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const commission = this.safeValue (params, 'commission');
        if (commission === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires a `commission` (withdrawal fee) parameter (string)');
        }
        params = this.omit (params, commission);
        const request = {
            'currency': currency['id'],
            'amount': parseFloat (amount),
            'address': address,
            'commission': commission,
        };
        if (tag !== undefined) {
            request['address'] += ':' + tag;
        }
        const response = await this.dwapiPostWithdrawCrypto (this.extend (request, params));
        //
        //     [
        //         {
        //             "success": 1,
        //             "return": {
        //                 "transactionId": 2863073
        //             }
        //         }
        //     ]
        //
        const data = this.safeValue (response, 'return', {});
        const id = this.safeString (data, 'transactionId');
        return {
            'info': response,
            'id': id,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = {}, body = undefined) {
        let url = this.urls['api'][api];
        url += '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            const auth = this.apiKey + ':' + this.secret;
            headers['Authorization'] = 'Basic ' + this.stringToBase64 (auth);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('success' in response) {
            //
            // 1 - Liqui only returns the integer 'success' key from their private API
            //
            //     { "success": 1, ... } httpCode === 200
            //     { "success": 0, ... } httpCode === 200
            //
            // 2 - However, exchanges derived from Liqui, can return non-integers
            //
            //     It can be a numeric string
            //     { "sucesss": "1", ... }
            //     { "sucesss": "0", ... }, httpCode >= 200 (can be 403, 502, etc)
            //
            //     Or just a string
            //     { "success": "true", ... }
            //     { "success": "false", ... }, httpCode >= 200
            //
            //     Or a boolean
            //     { "success": true, ... }
            //     { "success": false, ... }, httpCode >= 200
            //
            // 3 - Oversimplified, Python PEP8 forbids comparison operator (===) of different types
            //
            // 4 - We do not want to copy-paste and duplicate the code of this handler to other exchanges derived from Liqui
            //
            // To cover points 1, 2, 3 and 4 combined this handler should work like this:
            //
            let success = this.safeValue (response, 'success', false);
            if (typeof success === 'string') {
                if ((success === 'true') || (success === '1')) {
                    success = true;
                } else {
                    success = false;
                }
            }
            if (!success) {
                const code = this.safeString (response, 'code');
                const message = this.safeString (response, 'error');
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
                throw new ExchangeError (feedback); // unknown message
            }
        }
    }
};
