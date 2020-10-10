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
            'rateLimit': 1500,
            'version': 'v3',
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createDepositAddress': true,
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': false,
                'fetchDepositAddress': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTransactions': true,
                'fetchTrades': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/76909626-cb2bb100-68bc-11ea-99e0-28ba54f04792.jpg',
                'api': {
                    'public': 'https://dsxglobal.com/mapi', // market data
                    'private': 'https://dsxglobal.com/tapi', // trading
                    'dwapi': 'https://dsxglobal.com/dwapi', // deposit/withdraw
                },
                'www': 'https://dsxglobal.com',
                'doc': [
                    'https://dsxglobal.com/developers/publicApi',
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
                        'barsFromMoment/{pair}/{period}/{start}',
                        'depth/{pair}',
                        'info',
                        'lastBars/{pair}/{period}/{amount}', // period is 'm', 'h' or 'd'
                        'periodBars/{pair}/{period}/{start}/{end}',
                        'ticker/{pair}',
                        'trades/{pair}',
                    ],
                },
                // trading (private)
                'private': {
                    'post': [
                        'info/account',
                        'history/transactions',
                        'history/trades',
                        'history/orders',
                        'orders',
                        'order/cancel',
                        // 'order/cancel/all',
                        'order/status',
                        'order/new',
                        'volume',
                        'fees', // trading fee schedule
                    ],
                },
                // deposit / withdraw (private)
                'dwapi': {
                    'post': [
                        'deposit/cryptoaddress',
                        'withdraw/crypto',
                        'withdraw/fiat',
                        'withdraw/submit',
                        // 'withdraw/cancel',
                        'transaction/status', // see 'history/transactions' in private tapi above
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
                    'Incorrect volume': InvalidOrder, // {"success": 0,"error":"Order was rejected. Incorrect volume."}
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

    async fetchMarkets (params = {}) {
        const response = await this.publicGetInfo (params);
        //
        //     {
        //         "server_time": 1522057909,
        //         "pairs": {
        //             "ethusd": {
        //                 "decimal_places": 5,
        //                 "min_price": 100,
        //                 "max_price": 1500,
        //                 "min_amount": 0.01,
        //                 "hidden": 0,
        //                 "fee": 0,
        //                 "amount_decimal_places": 4,
        //                 "quoted_currency": "USD",
        //                 "base_currency": "ETH"
        //             }
        //         }
        //     }
        //
        const markets = this.safeValue (response, 'pairs');
        const keys = Object.keys (markets);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = markets[id];
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quoted_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'decimal_places'),
                'price': this.safeInteger (market, 'decimal_places'),
            };
            const amountLimits = {
                'min': this.safeFloat (market, 'min_amount'),
                'max': this.safeFloat (market, 'max_amount'),
            };
            const priceLimits = {
                'min': this.safeFloat (market, 'min_price'),
                'max': this.safeFloat (market, 'max_price'),
            };
            const costLimits = {
                'min': this.safeFloat (market, 'min_total'),
            };
            const limits = {
                'amount': amountLimits,
                'price': priceLimits,
                'cost': costLimits,
            };
            const hidden = this.safeInteger (market, 'hidden');
            const active = (hidden === 0);
            // see parseMarket below
            // https://github.com/ccxt/ccxt/pull/5786
            const otherId = base.toLowerCase () + quote.toLowerCase ();
            result.push ({
                'id': id,
                'otherId': otherId, // https://github.com/ccxt/ccxt/pull/5786
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostInfoAccount ();
        //
        //     {
        //         "success" : 1,
        //         "return" : {
        //             "funds" : {
        //                 "BTC" : {
        //                     "total" : 0,
        //                     "available" : 0
        //                 },
        //                 "USD" : {
        //                     "total" : 0,
        //                     "available" : 0
        //                 },
        //                 "USDT" : {
        //                     "total" : 0,
        //                     "available" : 0
        //                 }
        //             },
        //             "rights" : {
        //                 "info" : 1,
        //                 "trade" : 1
        //             },
        //             "transactionCount" : 0,
        //             "openOrders" : 0,
        //             "serverTime" : 1537451465
        //         }
        //     }
        //
        const balances = this.safeValue (response, 'return');
        const result = { 'info': response };
        const funds = this.safeValue (balances, 'funds');
        const currencyIds = Object.keys (funds);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeValue (funds, currencyId, {});
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['total'] = this.safeFloat (balance, 'total');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseTicker (ticker, market = undefined) {
        //
        //   {    high:  0.03492,
        //         low:  0.03245,
        //         avg:  29.46133,
        //         vol:  500.8661,
        //     vol_cur:  17.000797104,
        //        last:  0.03364,
        //         buy:  0.03362,
        //        sell:  0.03381,
        //     updated:  1537521993,
        //        pair: "ethbtc"       }
        //
        const timestamp = this.safeTimestamp (ticker, 'updated');
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'pair');
        market = this.parseMarket (marketId);
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        // dsx average is inverted, liqui average is not
        let average = this.safeFloat (ticker, 'avg');
        if (average !== undefined) {
            if (average > 0) {
                average = 1 / average;
            }
        }
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': this.safeFloat (ticker, 'vol_cur'),
            'info': ticker,
        };
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

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 150, max = 2000
        }
        const response = await this.publicGetDepthPair (this.extend (request, params));
        const market_id_in_reponse = (market['id'] in response);
        if (!market_id_in_reponse) {
            throw new ExchangeError (this.id + ' ' + market['symbol'] + ' order book is empty or not available');
        }
        const orderbook = response[market['id']];
        return this.parseOrderBook (orderbook);
    }

    async fetchOrderBooks (symbols = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = undefined;
        if (symbols === undefined) {
            ids = this.ids.join ('-');
            // max URL length is 2083 symbols, including http schema, hostname, tld, etc...
            if (ids.length > 2048) {
                const numIds = this.ids.length;
                throw new ExchangeError (this.id + ' has ' + numIds.toString () + ' symbols exceeding max URL length, you are required to specify a list of symbols in the first argument to fetchOrderBooks');
            }
        } else {
            ids = this.marketIds (symbols);
            ids = ids.join ('-');
        }
        const request = {
            'pair': ids,
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 150, max = 2000
        }
        const response = await this.publicGetDepthPair (this.extend (request, params));
        const result = {};
        ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let symbol = id;
            if (id in this.markets_by_id) {
                const market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
            result[symbol] = this.parseOrderBook (response[id]);
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = this.ids;
        if (symbols === undefined) {
            const numIds = ids.length;
            ids = ids.join ('-');
            const maxLength = this.safeInteger (this.options, 'fetchTickersMaxLength', 2048);
            // max URL length is 2048 symbols, including http schema, hostname, tld, etc...
            if (ids.length > this.options['fetchTickersMaxLength']) {
                throw new ArgumentsRequired (this.id + ' has ' + numIds.toString () + ' markets exceeding max URL length for this endpoint (' + maxLength.toString () + ' characters), please, specify a list of symbols of interest in the first argument to fetchTickers');
            }
        } else {
            ids = this.marketIds (symbols);
            ids = ids.join ('-');
        }
        const request = {
            'pair': ids,
        };
        const tickers = await this.publicGetTickerPair (this.extend (request, params));
        //
        //     {
        //         "bchbtc" : {
        //             "high" : 0.02989,
        //             "low" : 0.02736,
        //             "avg" : 33.90585,
        //             "vol" : 0.65982205,
        //             "vol_cur" : 0.0194604180960,
        //             "last" : 0.03000,
        //             "buy" : 0.02980,
        //             "sell" : 0.03001,
        //             "updated" : 1568104614,
        //             "pair" : "bchbtc"
        //         },
        //         "ethbtc" : {
        //             "high" : 0.01772,
        //             "low" : 0.01742,
        //             "avg" : 56.89082,
        //             "vol" : 229.247115044,
        //             "vol_cur" : 4.02959737298943,
        //             "last" : 0.01769,
        //             "buy" : 0.01768,
        //             "sell" : 0.01776,
        //             "updated" : 1568104614,
        //             "pair" : "ethbtc"
        //         }
        //     }
        //
        const result = {};
        const keys = Object.keys (tickers);
        for (let k = 0; k < keys.length; k++) {
            const id = keys[k];
            const ticker = tickers[id];
            let symbol = id;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        const tickers = await this.fetchTickers ([ symbol ], params);
        return tickers[symbol];
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

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "high" : 0.01955,
        //         "open" : 0.01955,
        //         "low" : 0.01955,
        //         "close" : 0.01955,
        //         "amount" : 2.5,
        //         "timestamp" : 1565155740000
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'timestamp'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'amount'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'period': this.timeframes[timeframe],
        };
        let method = 'publicGetLastBarsPairPeriodAmount';
        if (since === undefined) {
            if (limit === undefined) {
                limit = 100; // required, max 2000
            }
            request['amount'] = limit;
        } else {
            method = 'publicGetPeriodBarsPairPeriodStartEnd';
            // in their docs they expect milliseconds
            // but it returns empty arrays with milliseconds
            // however, it does work properly with seconds
            request['start'] = parseInt (since / 1000);
            if (limit === undefined) {
                request['end'] = this.seconds ();
            } else {
                const duration = this.parseTimeframe (timeframe) * 1000;
                const end = this.sum (since, duration * limit);
                request['end'] = parseInt (end / 1000);
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "ethbtc": [
        //             {
        //                 "high" : 0.01955,
        //                 "open" : 0.01955,
        //                 "low" : 0.01955,
        //                 "close" : 0.01955,
        //                 "amount" : 2.5,
        //                 "timestamp" : 1565155740000
        //             },
        //             {
        //                 "high" : 0.01967,
        //                 "open" : 0.01967,
        //                 "low" : 0.01967,
        //                 "close" : 0.01967,
        //                 "amount" : 0,
        //                 "timestamp" : 1565155680000
        //             }
        //         ]
        //     }
        //
        const candles = this.safeValue (response, market['id'], []);
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        const query = this.omit (params, this.extractParams (path));
        if (api === 'private' || api === 'dwapi') {
            url += '/' + this.version + '/' + this.implodeParams (path, params);
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'nonce': nonce,
            }, query));
            const signature = this.hmac (this.encode (body), this.encode (this.secret), 'sha512', 'base64');
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': signature,
            };
        } else if (api === 'public') {
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            url += '/' + this.implodeParams (path, params);
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    headers = {
                        'Content-Type': 'application/json',
                    };
                }
            }
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
