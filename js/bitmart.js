'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ArgumentsRequired } = require ('./base/errors');
//  ---------------------------------------------------------------------------

module.exports = class bitmart extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmart',
            'name': 'Bitmart',
            'countries': [ 'US', 'CN', 'HK', 'KR' ],
            'rateLimit': 1000,
            'version': 'v2',
            'has': {
                'CORS': true,
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchCurrencies': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': 'emulated',
                'fetchClosedOrders': 'emulated',
                'fetchOrder': true,
            },
            'urls': {
                'logo': 'https://www.bitmart.com/_nuxt/img/ed5c199.png',
                'api': 'https://openapi.bitmart.com',
                'www': 'https://www.bitmart.com/',
                'doc': 'https://github.com/bitmartexchange/bitmart-official-api-docs/blob/master/REST.md',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'api': {
                'token': {
                    'post': [
                        'authentication',
                    ],
                },
                'public': {
                    'get': [
                        'currencies',
                        'ping',
                        'steps',
                        'symbols',
                        'symbols_details',
                        'symbols/{symbol}/kline',
                        'symbols/{symbol}/orders',
                        'symbols/{symbol}/trades',
                        'ticker',
                        'time',
                    ],
                },
                'private': {
                    'get': [
                        'orders',
                        'orders/{id}',
                        'trades',
                        'wallet',
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'orders',
                        'orders/{id}',
                    ],
                },
            },
            'timeframes': {
                '1m': 1,
                '3m': 3,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '45m': 45,
                '1h': 60,
                '2h': 120,
                '3h': 180,
                '4h': 240,
                '1d': 1440,
                '1w': 10080,
                '1M': 43200,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                    'tiers': {
                        'taker': [
                            [0, 0.20 / 100],
                            [10, 0.18 / 100],
                            [50, 0.16 / 100],
                            [250, 0.14 / 100],
                            [1000, 0.12 / 100],
                            [5000, 0.10 / 100],
                            [25000, 0.08 / 100],
                            [50000, 0.06 / 100],
                        ],
                        'maker': [
                            [0, 0.1 / 100],
                            [10, 0.09 / 100],
                            [50, 0.08 / 100],
                            [250, 0.07 / 100],
                            [1000, 0.06 / 100],
                            [5000, 0.05 / 100],
                            [25000, 0.04 / 100],
                            [50000, 0.03 / 100],
                        ],
                    },
                },
            },
        });
    }

    async signIn (params = {}) {
        const message = this.apiKey + ':' + this.secret + ':' + this.uid;
        const data = {
            'grant_type': 'client_credentials',
            'client_id': this.apiKey,
            'client_secret': this.hmac (this.encode (message), this.encode (this.secret), 'sha256'),
        };
        const response = await this.tokenPostAuthentication (this.extend (data, params));
        const accessToken = this.safeString (response, 'access_token');
        if (!accessToken) {
            throw new AuthenticationError (this.id + ' signIn() failed to authenticate. Access token missing from response.');
        }
        const expiresIn = this.safeInteger (response, 'expires_in');
        this.options['expires'] = this.sum (this.nonce (), expiresIn * 1000);
        this.options['accessToken'] = accessToken;
        return response;
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetSymbolsDetails (params);
        //
        //     [
        //         {
        //             "id":"1SG_BTC",
        //             "base_currency":"1SG",
        //             "quote_currency":"BTC",
        //             "quote_increment":"0.1",
        //             "base_min_size":"0.1000000000",
        //             "base_max_size":"10000000.0000000000",
        //             "price_min_precision":4,
        //             "price_max_precision":6,
        //             "expiration":"NA"
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quote_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            //
            // https://github.com/bitmartexchange/bitmart-official-api-docs/blob/master/rest/public/symbols_details.md#response-details
            // from the above API doc:
            // quote_increment Minimum order price as well as the price increment
            // price_min_precision Minimum price precision (digit) used to query price and kline
            // price_max_precision Maximum price precision (digit) used to query price and kline
            //
            const quoteIncrementAsString = this.safeString (market, 'quote_increment');
            const pricePrecision = this.precisionFromString (quoteIncrementAsString);
            const quoteIncrement = parseFloat (quoteIncrementAsString);
            const precision = {
                'amount': 8,
                'price': pricePrecision,
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'base_min_size'),
                    'max': this.safeFloat (market, 'base_max_size'),
                },
                'price': {
                    'min': quoteIncrement,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        const marketId = this.safeString (ticker, 'symbol_id');
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else if (marketId !== undefined) {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        const last = this.safeFloat (ticker, 'current_price');
        const percentage = this.safeFloat (ticker, 'fluctuation');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highest_price'),
            'low': this.safeFloat (ticker, 'lowest_price'),
            'bid': this.safeFloat (ticker, 'bid_1'),
            'bidVolume': this.safeFloat (ticker, 'bid_1_amount'),
            'ask': this.safeFloat (ticker, 'ask_1'),
            'askVolume': this.safeFloat (ticker, 'ask_1_amount'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage * 100,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'base_volume'),
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //     {
        //         "volume":"97487.38",
        //         "ask_1":"0.00148668",
        //         "base_volume":"144.59",
        //         "lowest_price":"0.00144362",
        //         "bid_1":"0.00148017",
        //         "highest_price":"0.00151000",
        //         "ask_1_amount":"92.03",
        //         "current_price":"0.00148230",
        //         "fluctuation":"+0.0227",
        //         "symbol_id":"XRP_ETH",
        //         "url":"https://www.bitmart.com/trade?symbol=XRP_ETH",
        //         "bid_1_amount":"134.78"
        //     }
        //
        return this.parseTicker (response);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.publicGetTicker (params);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const currencies = await this.publicGetCurrencies (params);
        //
        //     [
        //         {
        //             "name":"CNY1",
        //             "withdraw_enabled":false,
        //             "id":"CNY1",
        //             "deposit_enabled":false
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const currencyId = this.safeString (currency, 'id');
            const code = this.safeCurrencyCode (currencyId);
            const name = this.safeString (currency, 'name');
            const withdrawEnabled = this.safeValue (currency, 'withdraw_enabled');
            const depositEnabled = this.safeValue (currency, 'deposit_enabled');
            const active = withdrawEnabled && depositEnabled;
            result[code] = {
                'id': currencyId,
                'code': code,
                'name': name,
                'info': currency, // the original payload
                'active': active,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
            // 'precision': 4, // optional price precision / depth level whose range is defined in symbol details
        };
        const response = await this.publicGetSymbolsSymbolOrders (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'buys', 'sells', 'price', 'amount');
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "amount":"2.29275119",
        //         "price":"0.021858",
        //         "count":"104.8930",
        //         "order_time":1563997286061,
        //         "type":"sell"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "symbol": "BMX_ETH",
        //         "amount": "1.0",
        //         "fees": "0.0005000000",
        //         "trade_id": 2734956,
        //         "price": "0.00013737",
        //         "active": true,
        //         "entrust_id": 5576623,
        //         "timestamp": 1545292334000
        //     }
        //
        const id = this.safeString (trade, 'trade_id');
        const timestamp = this.safeInteger2 (trade, 'timestamp', 'order_time');
        const type = undefined;
        let side = this.safeString (trade, 'type');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
        const orderId = this.safeInteger (trade, 'entrust_id');
        const marketId = this.safeString (trade, 'symbol');
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if (symbol === undefined) {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        const feeCost = this.safeFloat (trade, 'fees');
        let fee = undefined;
        if (feeCost !== undefined) {
            // is it always quote, always base, or base-quote depending on the side?
            const feeCurrencyCode = undefined;
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return {
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': undefined,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetSymbolsSymbolTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "amount":"2.29275119",
        //             "price":"0.021858",
        //             "count":"104.8930",
        //             "order_time":1563997286061,
        //             "type":"sell"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'offset': 0, // current page, starts from 0
        };
        if (limit === undefined) {
            request['limit'] = limit; // default 500, max 1000
        }
        const response = await this.privateGetTrades (this.extend (request, params));
        //
        //     {
        //         "total_trades": 216,
        //         "total_pages": 22,
        //         "current_page": 0,
        //         "trades": [
        //             {
        //                 "symbol": "BMX_ETH",
        //                 "amount": "1.0",
        //                 "fees": "0.0005000000",
        //                 "trade_id": 2734956,
        //                 "price": "0.00013737",
        //                 "active": true,
        //                 "entrust_id": 5576623,
        //                 "timestamp": 1545292334000
        //             },
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.safeInteger (ohlcv, 'timestamp'),
            this.safeFloat (ohlcv, 'open_price'),
            this.safeFloat (ohlcv, 'highest_price'),
            this.safeFloat (ohlcv, 'lowest_price'),
            this.safeFloat (ohlcv, 'current_price'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        //
        // ohlcv query parameters:
        //    from : start time of k-line data (in milliseconds) : [required]
        //    to : end time of k-line data (in milliseconds) : [required]
        //    step : steps of sampling (in minutes, default 1 minute) : [optional]
        //
        if (limit === undefined) {
            limit = 1;
        }
        // convert timeframe minutes to milliseconds
        const step = (this.timeframes[timeframe] * 60 * 1000);
        let to = this.milliseconds ();
        if (since === undefined) {
            since = to - (step * limit);
        } else {
            to = this.sum (since, step * limit);
        }
        const request = {
            'symbol': this.marketId (symbol),
            'to': to,
            'from': since,
            'step': this.timeframes[timeframe],
        };
        const response = await this.publicGetSymbolsSymbolKline (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balances = await this.privateGetWallet (params);
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            let id = this.safeString (balance, 'id');
            if (id in this.currencies_by_id) {
                id = this.currencies_by_id[id]['code'];
            }
            const free = this.safeFloat (balance, 'available');
            const used = this.safeFloat (balance, 'frozen');
            result[id] = {
                'free': free,
                'used': used,
                'total': this.sum (free, used),
            };
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        const timestamp = this.milliseconds ();
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const symbol = this.findSymbol (this.safeString (order, 'symbol'), market);
        let info = this.safeValue (order, 'info');
        if (info === undefined) {
            info = this.extend ({}, order);
        }
        order = this.mapOrderResponse (order, market);
        return {
            'id': this.safeInteger (order, 'id'),
            'info': info,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'side': this.safeString (order, 'side'),
            'price': this.safeFloat (order, 'price'),
            'amount': this.safeFloat (order, 'amount'),
            'cost': undefined,
            'average': undefined,
            'filled': this.safeFloat (order, 'executed_amount'),
            'remaining': this.safeFloat (order, 'remaining_amount'),
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    mapOrderResponse (order, market = undefined) {
        const originalAmount = this.safeFloat (order, 'original_amount');
        if (originalAmount !== undefined) {
            order['amount'] = originalAmount;
        }
        const entrustId = this.safeInteger (order, 'entrust_id');
        if (entrustId !== undefined) {
            order['id'] = entrustId;
        }
        return order;
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'all',
            '1': 'open',
            '2': 'open',
            '3': 'closed',
            '4': 'canceled',
            '5': 'open',
            '6': 'closed',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let order = {
            'symbol': this.marketId (symbol),
            'side': side.toLowerCase (),
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
        };
        const response = await this.privatePostOrders (this.extend (order, params));
        order = this.extend ({
            'status': 'open',
            'info': response,
        }, order);
        return this.parseOrder (this.extend (order, response), market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.privateDeleteOrdersId (this.extend ({
            'id': id,
            'entrust_id': id,
        }, params));
        return this.parseOrder (this.extend ({
            'symbol': this.marketId (symbol),
            'status': 'canceled',
            'entrust_id': id,
            'info': response,
        }, response), market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit === undefined) {
            limit = 500;
        }
        request['limit'] = limit;
        if (this.safeInteger (params, 'offset') === undefined) {
            request['offset'] = 0;
        }
        // pending & partially filled orders
        request['status'] = 5;
        const response = await this.privateGetOrders (this.extend (request, params));
        const orders = this.safeValue (response, 'orders');
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit === undefined) {
            limit = 500;
        }
        request['limit'] = limit;
        if (this.safeInteger (params, 'offset') === undefined) {
            request['offset'] = 0;
        }
        // successful and canceled orders
        request['status'] = 6;
        const response = await this.privateGetOrders (this.extend (request, params));
        const orders = this.safeValue (response, 'orders');
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.privateGetOrdersId (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (response, market);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'token') {
            this.checkRequiredCredentials ();
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        } else {
            const nonce = this.nonce ();
            this.checkRequiredCredentials ();
            const token = this.safeString (this.options, 'accessToken');
            if (token === undefined) {
                throw new AuthenticationError (this.id + ' ' + path + ' endpoint requires an accessToken option or a prior call to signIn() method');
            }
            const expires = this.safeInteger (this.options, 'expires');
            if (expires !== undefined) {
                if (nonce >= expires) {
                    throw new AuthenticationError (this.id + ' accessToken expired, supply a new accessToken or call the signIn() method');
                }
            }
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
            headers = {
                'Content-Type': 'application/json',
                'X-BM-TIMESTAMP': nonce.toString (),
                'X-BM-AUTHORIZATION': 'Bearer ' + token,
            };
            if (method !== 'GET') {
                query = this.keysort (query);
                body = this.json (query);
                const message = this.urlencode (query);
                headers['X-BM-SIGNATURE'] = this.hmac (this.encode (message), this.encode (this.secret), 'sha256');
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
