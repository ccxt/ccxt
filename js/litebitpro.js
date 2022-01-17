'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InvalidNonce, ExchangeError, AuthenticationError, InsufficientFunds, InvalidOrder, ArgumentsRequired, BadRequest, RateLimitExceeded, PermissionDenied, OnMaintenance, ExchangeNotAvailable, NotSupported } = require ('./base/errors');
const { TICK_SIZE, TRUNCATE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ----------------------------------------------------------------------------

module.exports = class litebitpro extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'litebitpro',
            'name': 'LiteBit Pro',
            'countries': [ 'NL' ], // Netherlands
            'rateLimit': 60.1, // 1000 requests per second TODO: we don't have a global rate limit across all endpoints
            'version': 'v1',
            'certified': false,
            'pro': false,
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'CORS': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFees': true,
            },
            'timeframes': {
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '1h': '3600',
                '4h': '14400',
                '1d': '86400',
            },
            'urls': {
                // TODO
                'logo': 'TODO',
                'api': {
                    'public': 'https://api.pro.liteaccept.nl',
                    'private': 'https://api.pro.liteaccept.nl',
                },
                'www': 'https://pro.litebit.com/',
                'doc': 'https://docs.pro.litebit.com/',
                // TODO
                'fees': 'TODO',
                // TODO
                'referral': 'TODO',
            },
            'api': {
                'public': {
                    'get': {
                        'time': 1,
                        'currencies': 1,
                        'markets': 1,
                        'ticker': 1,
                        'tickers': 1,
                        'book': 1,
                        'candles': 1,
                        'trades': 1,
                    },
                },
                'private': {
                    'get': {
                        'orders/open': 1,
                        'orders/closed': 1,
                        'order': 1,
                        'fills': 1,
                        'fee': 1,
                        'balances': 1,
                    },
                    'post': {
                        'order': 1,
                    },
                    'delete': {
                        'orders': 1,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                'exact': {
                    '10000': BadRequest, // This error code is used for validation errors. See message for more information about the validation error.
                    '10001': InvalidOrder, // The notional value of your order is too low. Use GET /market's minimum_amount_quote to retrieve the market's minimum notional value.
                    '10002': InvalidOrder, // Order time in force is missing.
                    '10003': OnMaintenance, // Post-only is only allowed for limit orders.
                    '10004': InvalidOrder, // Price must be higher than zero.
                    '10005': InvalidOrder, // Price is required for limit orders.
                    '10006': InvalidOrder, // Type is required for orders.
                    '10007': InvalidNonce, // Time window cannot be smaller than 1 or larger than 60000 milliseconds.
                    '10008': AuthenticationError, // Unauthenticated.
                    '10009': PermissionDenied, // Unauthorized.
                    '10010': BadRequest, // Invalid JSON.
                    '10011': BadRequest, // Invalid event.
                    '10012': BadRequest, // Invalid channel.
                    '10013': AuthenticationError, // Any of: Could not derive authentication method. Invalid API key and/or signature. Invalid timestamp. Invalid API key. Invalid signature. Connection is already authenticated.
                    '20000': InsufficientFunds, // Insufficient funds.
                    '20001': DDoSProtection, // Maximum of open orders allowed per user per market.
                    '20002': ExchangeError, // Insufficient liquidity.
                    '20003': RateLimitExceeded, // Rate limit exceeded.
                    '20004': ExchangeNotAvailable, // Transient request error without any available public information.
                    '30000': OnMaintenance, // Exchange is in maintenance mode.
                    '30001': ExchangeError, // An unexpected error occurred. The execution status of your request is unknown.
                    '40000': OnMaintenance, // Only post-only orders are currently accepted by the matching engine.
                    '40001': OnMaintenance, // Only cancel order requests are currently accepted by the matching engine.
                    '40002': ExchangeError, // Order book limit reached, only taker orders are allowed.
                    '40003': ExchangeNotAvailable, // Market overloaded.
                    '40004': OnMaintenance, // Market is halted.
                    '40005': OnMaintenance, // Market is inactive.
                    '50000': AuthenticationError, // Your request was rejected, because it was received outside the allowed time window.
                },
                'broad': {
                },
            },
            'options': {
                'LITEBIT-WINDOW': 10000, // default 10 sec
                'fetchCurrencies': {
                    'expires': 1000, // 1 second
                },
            },
            'precisionMode': TICK_SIZE,
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        //
        //     {"timestamp":1641228475856}
        //
        return this.safeInteger (response, 'timestamp');
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        //
        // [
        //    {
        //       "market":"BTC-EUR",
        //       "status":"active",
        //       "step_size":"0.00000001",
        //       "tick_size":"0.01",
        //       "minimum_amount_quote":"5.00",
        //       "base_currency":"BTC",
        //       "quote_currency":"EUR"
        //    }
        // ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'market');
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quote_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const status = this.safeString (market, 'status');
            const active = (status === 'active');
            const precision = {
                'price': this.safeNumber (market, 'tick_size'),
                'amount': this.safeNumber (market, 'step_size'),
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'type': 'spot',
                'spot': true,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minimum_amount_quote'),
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchCurrenciesFromCache (params = {}) {
        // this method is now redundant
        // currencies are now fetched before markets
        const options = this.safeValue (this.options, 'fetchCurrencies', {});
        const timestamp = this.safeInteger (options, 'timestamp');
        const expires = this.safeInteger (options, 'expires', 1000);
        const now = this.milliseconds ();
        if ((timestamp === undefined) || ((now - timestamp) > expires)) {
            const response = await this.publicGetCurrencies (params);
            this.options['fetchCurrencies'] = this.extend (options, {
                'response': response,
                'timestamp': now,
            });
        }
        return this.safeValue (this.options['fetchCurrencies'], 'response');
    }

    async fetchCurrencies (params = {}) {
        const response = await this.fetchCurrenciesFromCache (params);
        //
        // [
        //    {
        //       "code":"EUR",
        //       "name":"Euro",
        //       "decimals":"2"
        //    }
        // ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'code');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const precision = this.safeInteger (currency, 'decimals');
            result[code] = {
                'id': id,
                'info': currency,
                'code': code,
                'name': name,
                'active': undefined,
                'fee': undefined,
                // convert number of decimals to precision mode TICK_SIZE
                'precision': Math.pow (10, -precision),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetFee (params);
        //
        // {
        //     "maker": "0.15",
        //     "taker": "0.25",
        //     "volume": "11.70"
        // }
        //
        const result = {};
        let maker = this.safeNumber (response, 'maker');
        if (maker !== undefined) {
            // convert to ratio
            maker = maker / 100;
        }
        let taker = this.safeNumber (response, 'taker');
        if (taker !== undefined) {
            // convert to ratio
            taker = taker / 100;
        }
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'maker': maker,
                'taker': taker,
                'info': response,
                'symbol': symbol,
            };
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        // {
        //    "market":"BTC-EUR",
        //    "open":"43234.98",
        //    "last":"42213.20000000",
        //    "volume":"29981.04495099",
        //    "low":"40882.22",
        //    "high":"43986.34",
        //    "bid":"41781.32",
        //    "ask":"42213.20"
        // }
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        // {
        //    "market":"BTC-EUR",
        //    "open":"43234.98",
        //    "last":"42213.20000000",
        //    "volume":"29981.04495099",
        //    "low":"40882.22",
        //    "high":"43986.34",
        //    "bid":"41781.32",
        //    "ask":"42213.20"
        // }
        //
        const marketId = this.safeString (ticker, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        const last = this.safeNumber (ticker, 'last');
        const baseVolume = this.safeNumber (ticker, 'volume');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeNumber (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        // [
        //    {
        //       "market":"BTC-EUR",
        //       "open":"43346.43",
        //       "last":"42046.58000000",
        //       "volume":"30006.37834551",
        //       "low":"40882.22",
        //       "high":"43986.34",
        //       "bid":"41946.08",
        //       "ask":"42046.58"
        //    }
        // ]
        return this.parseTickers (response, symbols);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            // 'limit': 200, // default 200, max 200
            // 'timestamp_from': since,
            // 'timestamp_to': this.milliseconds (),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['timestamp_from'] = since;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        // [
        //    {
        //       "uuid":"c28a37e2-69d1-4844-ad37-b8f08311478d",
        //       "amount":"0.36636292",
        //       "price":"41551.23000000",
        //       "side":"sell",
        //       "market":"BTC-EUR",
        //       "timestamp":1640788080819
        //    }
        // ]
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        // {
        //    "uuid":"c28a37e2-69d1-4844-ad37-b8f08311478d",
        //    "amount":"0.36636292",
        //    "price":"41551.23000000",
        //    "side":"sell",
        //    "market":"BTC-EUR",
        //    "timestamp":1640788080819
        // }
        //
        // fetchMyTrades (private)
        //
        // {
        //     "uuid": "234234897234-1243-1234-qsf234",
        //     "order_uuid": "234234897234-1243-1234-qsf235",
        //     "amount": "0.00100000",
        //     "price": "42986.64",
        //     "amount_quote": "43.09410660",
        //     "side": "buy",
        //     "fee": "0.10746660",
        //     "market": "BTC-EUR",
        //     "liquidity": "taker",
        //     "timestamp": 1622123573863
        // }
        //
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const side = this.safeString (trade, 'side');
        const id = this.safeString (trade, 'uuid');
        const marketId = this.safeString (trade, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        const takerOrMaker = this.safeString (trade, 'liquidity');
        let feeCurrency = undefined;
        if (market !== undefined) {
            feeCurrency = market['quote'];
        }
        const fee = {
            'cost': this.safeString (trade, 'fee'),
            'currency': feeCurrency,
        };
        const feeString = this.safeString (trade, 'fee');
        const amountQuote = this.safeString (trade, 'amount_quote');
        let cost = undefined;
        if (amountQuote !== undefined && feeString !== undefined) {
            if (side === 'buy') {
                cost = Precise.stringSub (amountQuote, feeString);
            } else {
                cost = Precise.stringAdd (amountQuote, feeString);
            }
        }
        const orderId = this.safeString (trade, 'order_uuid');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': cost,
            'fee': fee,
        }, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
        };
        if (limit !== undefined) {
            throw new NotSupported (this.id + ' fetchOrderBook() doesn\'t support the limit parameter.');
        }
        const response = await this.publicGetBook (this.extend (request, params));
        //
        // {
        //     "market": "BTC-EUR",
        //     "timestamp": 1622123573863,
        //     "sequence": 1231232,
        //     "update_type": "snapshot",
        //     "bids": [
        //         ["2.0000", "201.99000000"],
        //         ...,
        //     ],
        //     "asks": [
        //         ["2.0000", "201.99000000"],
        //         ...,
        //     ]
        // }
        //
        const orderbook = this.parseOrderBook (
            response,
            symbol,
            this.safeInteger (response, 'timestamp')
        );
        orderbook['nonce'] = this.safeInteger (response, 'sequence');
        return orderbook;
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1590383700000,
        //         "8088.5",
        //         "8088.5",
        //         "8088.5",
        //         "8088.5",
        //         "0.04788623"
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'interval': this.timeframes[timeframe],
            // 'limit': 1440, // default 500, max 500
            // 'timestamp_from': since,
            // 'timestamp_to': this.milliseconds (),
        };
        if (since !== undefined) {
            request['timestamp_from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 500
        }
        const response = await this.publicGetCandles (this.extend (request, params));
        //
        //     [
        //         [1590383700000,"8088.5","8088.5","8088.5","8088.5","0.04788623"],
        //         [1590383580000,"8091.3","8091.5","8091.3","8091.5","0.04931221"],
        //         [1590383520000,"8090.3","8092.7","8090.3","8092.5","0.04001286"],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalances (params);
        //
        // [
        //    {
        //       "available":"7716.93507952",
        //       "reserved":"2155.37500000",
        //       "total":"9872.31007952",
        //       "currency":"EUR"
        //    }
        // ]
        //
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'reserved');
            account['total'] = this.safeString (balance, 'total');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side,
            'type': type, // limit, market
            // 'amount': this.amountToPrecision (symbol, amount),
            // 'amount_quote': this.costToPrecision (symbol, cost),
            // 'price': this.priceToPrecision (symbol, price),
            // 'stop': 'loss', // "entry" = trigger when the last price is greater than or equal to stop_price. "loss" = trigger when the last price is less than or equal to stop_price.
            // 'stop_price': this.priceToPrecision (symbol, price),
            // 'post_only': false,
            // 'time_in_force': 'gtc', // gtc, ioc, fok, day, gtd
            // 'expire_at': expireAt,
            // 'client_id': clientId,
        };
        const stop = this.safeString (params, 'stop');
        if (stop !== undefined) {
            const stopPrice = this.safeNumber2 (params, 'stopPrice', 'stop_price');
            if (stopPrice === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder requires a stopPrice parameter for a stop order');
            }
            request['stop'] = stop;
            request['stop_price'] = this.priceToPrecision (symbol, stopPrice);
        }
        const postOnly = this.safeValue2 (params, 'postOnly', 'post_only', false);
        if (postOnly) {
            request['post_only'] = true;
        }
        const timeInForce = this.safeString2 (params, 'timeInForce', 'time_in_force');
        if (timeInForce !== undefined) {
            request['time_in_force'] = timeInForce;
            if (timeInForce === 'gtd') {
                const expireAt = this.safeNumber2 (params, 'expireAt', 'expire_at');
                if (expireAt === undefined) {
                    throw new ArgumentsRequired (this.id + ' createOrder requires a expireAt parameter for a ' + timeInForce + ' order');
                }
                request['expire_at'] = expireAt;
            }
        }
        const clientId = this.safeString2 (params, 'client_id', 'clientOrderId');
        if (clientId !== undefined) {
            request['client_id'] = clientId;
        }
        params = this.omit (params, ['stop', 'stopPrice', 'stop_price', 'postOnly', 'post_only', 'timeInForce', 'time_in_force', 'expireAt', 'expire_at', 'client_id', 'clientOrderId' ]);
        if (type === 'market') {
            let cost = undefined;
            if (price !== undefined) {
                cost = amount * price;
            } else {
                cost = this.safeNumber2 (params, 'amountQuote', 'amount_quote');
            }
            if (cost !== undefined) {
                const precision = market['precision']['price'];
                request['amount_quote'] = this.decimalToPrecision (cost, TRUNCATE, precision, this.precisionMode);
            } else {
                request['amount'] = this.amountToPrecision (symbol, amount);
            }
            params = this.omit (params, [ 'amountQuote', 'amount_quote' ]);
        } else if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        //
        // {
        //     "uuid": "69d353dc-a80f-491e-b5cf-d2589682664e",
        //     "amount": "0.01000000",
        //     "amount_filled": "0.00000000",
        //     "amount_quote_filled": "0.00000000",
        //     "fee": "0.00000000",
        //     "price": "1000.00",
        //     "side": "buy",
        //     "type": "limit",
        //     "status": "open",
        //     "filled_status": "not_filled",
        //     "cancel_status": null,
        //     "stop": "entry",
        //     "stop_hit": false,
        //     "stop_price": "800.00",
        //     "post_only": true,
        //     "time_in_force": "gtd",
        //     "created_at": 1637147943854,
        //     "updated_at": 1637147943854,
        //     "expire_at": 1625038240391,
        //     "market": "BTC-EUR",
        //     "client_id": "d22a7a4e-c28b-40f5-a5a4-79ca8a4fc41c"
        // }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orders': [id],
            'market': market['id'],
        };
        await this.privateDeleteOrders (this.extend (request, params));
        //
        // <empty response>
        //
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        await this.privateDeleteOrders (this.extend (request, params));
        //
        // <empty response>
        //
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'uuid': id,
            'market': market['id'],
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        //
        // {
        //     "uuid": "4260cd4a-35ba-41af-a63d-b0f1a127f2ab",
        //     "amount": "0.49875000",
        //     "amount_filled": "0.00000000",
        //     "amount_quote_filled": "0.00000000",
        //     "fee": "0.00000000",
        //     "price": "0.0000",
        //     "side": "buy",
        //     "type": "market",
        //     "status": "open",
        //     "filled_status": "not_filled",
        //     "cancel_status": null,
        //     "stop": null,
        //     "stop_hit": null,
        //     "stop_price": null,
        //     "post_only": false,
        //     "time_in_force": "gtc",
        //     "created_at": 1620112337000,
        //     "updated_at": 1620112337000,
        //     "expire_at": null,
        //     "market": "BTC-EUR",
        //     "client_id": null
        // }
        //
        return this.parseOrder (response, market);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            // 'limit': 200, // default 200, max 200
            // 'created_at_from': since,
            // 'created_at_to': this.milliseconds (),
        };
        if (since !== undefined) {
            request['created_at_from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 200, max 200
        }
        const response = await this.privateGetOrdersClosed (this.extend (request, params));
        //
        // [
        //     {
        //         "uuid": "4260cd4a-35ba-41af-a63d-b0f1a127f2ab",
        //         "amount": "0.49875000",
        //         "amount_filled": "0.00000000",
        //         "amount_quote_filled": "0.00000000",
        //         "fee": "0.00000000",
        //         "price": "0.0000",
        //         "side": "buy",
        //         "type": "market",
        //         "status": "closed",
        //         "filled_status": "not_filled",
        //         "cancel_status": null,
        //         "stop": null,
        //         "stop_hit": null,
        //         "stop_price": null,
        //         "post_only": false,
        //         "time_in_force": "gtc",
        //         "created_at": 1620112337000,
        //         "updated_at": 1620112337000,
        //         "expire_at": null,
        //         "market": "BTC-EUR",
        //         "client_id": null
        //     }
        // ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'market': market['id'],
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateGetOrdersOpen (this.extend (request, params));
        //
        // [
        //     {
        //         "uuid": "4260cd4a-35ba-41af-a63d-b0f1a127f2ab",
        //         "amount": "0.49875000",
        //         "amount_filled": "0.00000000",
        //         "amount_quote_filled": "0.00000000",
        //         "fee": "0.00000000",
        //         "price": "0.0000",
        //         "side": "buy",
        //         "type": "market",
        //         "status": "open",
        //         "filled_status": "not_filled",
        //         "cancel_status": null,
        //         "stop": null,
        //         "stop_hit": null,
        //         "stop_price": null,
        //         "post_only": false,
        //         "time_in_force": "gtc",
        //         "created_at": 1620112337000,
        //         "updated_at": 1620112337000,
        //         "expire_at": null,
        //         "market": "BTC-EUR",
        //         "client_id": null
        //     }
        // ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    parseOrderStatus (status, cancelStatus) {
        if (cancelStatus !== undefined) {
            return 'canceled';
        }
        const statuses = {
            'created': 'open',
            'open': 'open',
            'closed': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder, fetchOrder, fetchOpenOrders, fetchClosedOrders
        //
        // {
        //     "uuid": "4260cd4a-35ba-41af-a63d-b0f1a127f2ab",
        //     "amount": "0.49875000",
        //     "amount_filled": "0.00000000",
        //     "amount_quote_filled": "0.00000000",
        //     "fee": "0.00000000",
        //     "price": "0.0000",
        //     "side": "buy",
        //     "type": "market",
        //     "status": "open",
        //     "filled_status": "not_filled",
        //     "cancel_status": null,
        //     "stop": null,
        //     "stop_hit": null,
        //     "stop_price": null,
        //     "post_only": false,
        //     "time_in_force": "gtc",
        //     "created_at": 1620112337000,
        //     "updated_at": 1620112337000,
        //     "expire_at": null,
        //     "market": "BTC-EUR",
        //     "client_id": null
        // }
        //
        const id = this.safeString (order, 'uuid');
        const clientOrderId = this.safeString (order, 'client_id');
        const timestamp = this.safeInteger (order, 'created_at');
        const marketId = this.safeString (order, 'market');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const status = this.parseOrderStatus (this.safeString (order, 'status'), this.safeString (order, 'cancel_status'));
        const side = this.safeString (order, 'side');
        const type = this.safeString (order, 'type');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'amount');
        const filled = this.safeString (order, 'amount_filled');
        let fee = undefined;
        const feeNumber = this.safeNumber (order, 'fee');
        if (feeNumber !== undefined) {
            let feeCurrencyCode = undefined;
            if (market !== undefined) {
                feeCurrencyCode = market['quote'];
            }
            fee = {
                'cost': feeNumber,
                'currency': feeCurrencyCode,
            };
        }
        const feeString = this.safeString (order, 'fee');
        const amountQuoteFilled = this.safeString (order, 'amount_quote_filled');
        let cost = undefined;
        if (amountQuoteFilled !== undefined && feeString !== undefined) {
            if (side === 'buy') {
                cost = Precise.stringSub (amountQuoteFilled, feeString);
            } else {
                cost = Precise.stringAdd (amountQuoteFilled, feeString);
            }
        }
        const timeInForce = this.safeString (order, 'time_in_force');
        const postOnly = this.safeValue (order, 'post_only');
        const stopPrice = this.safeNumber (order, 'stop_price');
        return this.safeOrder2 ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            // 'order_uuid': order_uuid,
            // 'limit': 200, // default 200, max 200
            // 'timestamp_from': since,
            // 'timestamp_to': this.milliseconds (),
        };
        if (since !== undefined) {
            request['timestamp_from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 200, max 200
        }
        const response = await this.privateGetFills (this.extend (request, params));
        //
        // [
        //     {
        //         "uuid": "234234897234-1243-1234-qsf234",
        //         "order_uuid": "234234897234-1243-1234-qsf235",
        //         "amount": "0.00100000",
        //         "price": "42986.64",
        //         "amount_quote": "43.09410660",
        //         "side": "buy",
        //         "fee": "0.10746660",
        //         "market": "BTC-EUR",
        //         "liquidity": "taker",
        //         "timestamp": 1622123573863
        //     }
        // ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = '/' + this.version + '/' + this.implodeParams (path, params);
        const getOrDelete = (method === 'GET') || (method === 'DELETE');
        if (getOrDelete) {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let payload = '';
            if (!getOrDelete) {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    payload = body;
                }
            }
            const timestamp = this.milliseconds ().toString ();
            const auth = timestamp + method + url + payload;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            const accessWindow = this.safeString (this.options, 'LITEBIT-WINDOW', '10000');
            headers = {
                'LITEBIT-API-KEY': this.apiKey,
                'LITEBIT-SIGNATURE': signature,
                'LITEBIT-TIMESTAMP': timestamp,
                'LITEBIT-WINDOW': accessWindow,
            };
            if (!getOrDelete) {
                headers['Content-Type'] = 'application/json';
            }
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"code": 10007,"message": "Invalid time window."}
        //
        const errorCode = this.safeString (response, 'code');
        if (errorCode !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
