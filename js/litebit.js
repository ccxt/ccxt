'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { DDoSProtection, InvalidNonce, ExchangeError, AuthenticationError, InsufficientFunds, InvalidOrder, ArgumentsRequired, BadRequest, RateLimitExceeded, PermissionDenied, OnMaintenance, ExchangeNotAvailable } = require ('./base/errors');
const { TICK_SIZE, TRUNCATE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ----------------------------------------------------------------------------

module.exports = class litebit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'litebit',
            'name': 'LiteBit',
            'countries': [ 'NL' ], // Netherlands
            'rateLimit': 60, // 1000 requests per minute
            'version': 'v1',
            'certified': false,
            'pro': true,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposits': true,
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
                'fetchWithdrawals': true,
                'withdraw': true,
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
                'logo': 'https://docs.exchange.litebit.eu/images/logo-9f47bc68.png',
                'api': {
                    'public': 'https://api.exchange.litebit.eu',
                    'private': 'https://api.exchange.litebit.eu',
                },
                'www': 'https://exchange.litebit.eu/',
                'doc': 'https://docs.exchange.litebit.eu/',
                'fees': 'https://exchange.litebit.eu/user/fees',
                'referral': 'https://www.litebit.eu/app/register',
            },
            'api': {
                'public': {
                    'get': {
                        'time': 1,
                        'asset': 1,
                        'assets': 1,
                        'market': 1,
                        'markets': 1,
                        'ticker': 1,
                        'tickers': 1,
                        'book': 5,
                        'candles': 5,
                        'trades': 5,
                    },
                },
                'private': {
                    'get': {
                        'api-keys': 5,
                        'orders/open': { 'cost': 5, 'noMarket': 25 },
                        'orders/closed': 5,
                        'order': 1,
                        'fills': 5,
                        'fee': 5,
                        'fees': 5,
                        'balance': 5,
                        'balances': 5,
                        'withdrawals': 20,
                        'deposits': 20,
                    },
                    'post': {
                        'api-key': 5,
                        'order': 1,
                        'withdraw/blockchain': 5,
                        'withdraw/sepa': 5,
                    },
                    'delete': {
                        'api-key': 5,
                        'orders': 1,
                    },
                    'put': {
                        'api-key': 5,
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
                    '20005': PermissionDenied, // Operation could not be performed for legal reasons.
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
            },
            'precisionMode': TICK_SIZE,
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name litebit#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetTime (params);
        //
        //     {"timestamp":1641228475856}
        //
        return this.safeInteger (response, 'timestamp');
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name litebit#fetchMarkets
         * @description retrieves data on all markets for litebit
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetMarkets (params);
        //
        // [
        //    {
        //       "market":"BTC-EUR",
        //       "status":"active",
        //       "step_size":"0.00000001",
        //       "tick_size":"0.01",
        //       "minimum_amount_quote":"5.00",
        //       "base_asset":"BTC",
        //       "quote_asset":"EUR"
        //    }
        // ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'market');
            const baseId = this.safeString (market, 'base_asset');
            const quoteId = this.safeString (market, 'quote_asset');
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
                        'min': this.safeNumber (market, 'step_size'),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.safeNumber (market, 'tick_size'),
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

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name litebit#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetAssets (params);
        //
        //    [
        //       {
        //          "code":"EUR",
        //          "name":"Euro",
        //          "decimals":"2"
        //       }
        //    ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'code');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const precision = this.parseNumber (this.parsePrecision (this.safeString (currency, 'decimals')));
            result[code] = {
                'id': id,
                'info': currency,
                'code': code,
                'name': name,
                'active': undefined,
                'fee': undefined,
                'precision': precision,
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
        /**
         * @method
         * @name litebit#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
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
        let maker = this.safeString (response, 'maker');
        if (maker !== undefined) {
            // convert to ratio
            maker = this.parseNumber (Precise.stringDiv (Precise.stringAbs (maker), '100'));
        }
        let taker = this.safeString (response, 'taker');
        if (taker !== undefined) {
            // convert to ratio
            taker = this.parseNumber (Precise.stringDiv (Precise.stringAbs (taker), '100'));
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
        /**
         * @method
         * @name litebit#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //    {
        //       "market":"BTC-EUR",
        //       "open":"43234.98",
        //       "last":"42213.20000000",
        //       "volume":"29981.04495099",
        //       "low":"40882.22",
        //       "high":"43986.34",
        //       "bid":"41781.32",
        //       "ask":"42213.20"
        //    }
        //
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //    {
        //       "market":"BTC-EUR",
        //       "open":"43234.98",
        //       "last":"42213.20000000",
        //       "volume":"29981.04495099",
        //       "low":"40882.22",
        //       "high":"43986.34",
        //       "bid":"41781.32",
        //       "ask":"42213.20"
        //    }
        //
        const marketId = this.safeString (ticker, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        const last = this.safeString (ticker, 'last');
        const baseVolume = this.safeString (ticker, 'volume');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name litebit#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        //
        //    [
        //       {
        //          "market":"BTC-EUR",
        //          "open":"43346.43",
        //          "last":"42046.58000000",
        //          "volume":"30006.37834551",
        //          "low":"40882.22",
        //          "high":"43986.34",
        //          "bid":"41946.08",
        //          "ask":"42046.58"
        //       }
        //    ]
        //
        return this.parseTickers (response, symbols);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name litebit#fetchTrades
         * @see https://docs.exchange.litebit.eu/#access-scopes-timing-market-data-get-trades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @param {int|undefined} params.timestamp_to The latest unix timestamp to return trades for.
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
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
        //
        //    [
        //       {
        //          "uuid":"c28a37e2-69d1-4844-ad37-b8f08311478d",
        //          "amount":"0.36636292",
        //          "price":"41551.23000000",
        //          "side":"sell",
        //          "market":"BTC-EUR",
        //          "timestamp":1640788080819
        //       }
        //    ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //    {
        //       "uuid":"c28a37e2-69d1-4844-ad37-b8f08311478d",
        //       "amount":"0.36636292",
        //       "price":"41551.23000000",
        //       "side":"sell",
        //       "market":"BTC-EUR",
        //       "timestamp":1640788080819
        //    }
        //
        // fetchMyTrades (private)
        //
        //    {
        //        "uuid": "234234897234-1243-1234-qsf234",
        //        "order_uuid": "234234897234-1243-1234-qsf235",
        //        "amount": "0.00100000",
        //        "price": "42986.64",
        //        "amount_quote": "43.09410660",
        //        "side": "buy",
        //        "fee": "0.10746660",
        //        "market": "BTC-EUR",
        //        "liquidity": "taker",
        //        "timestamp": 1622123573863
        //    }
        //
        const timestamp = this.safeInteger (trade, 'timestamp');
        const marketId = this.safeString (trade, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        market = this.safeMarket (marketId, market, '-');
        const feeCost = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': market['quote'],
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'uuid'),
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': this.safeString (trade, 'order_uuid'),
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': this.safeString (trade, 'liquidity'),
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': this.safeString (trade, 'amount_quote'),
            'fee': fee,
        }, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name litebit#fetchOrderBook
         * @see https://docs.exchange.litebit.eu/#access-scopes-timing-market-data-get-book
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        if (limit !== undefined) {
            throw new BadRequest (this.id + ' fetchOrderBook() does not allow a limit value');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetBook (this.extend (request, params));
        //
        //    {
        //        "market": "BTC-EUR",
        //        "timestamp": 1622123573863,
        //        "sequence": 1231232,
        //        "update_type": "snapshot",
        //        "bids": [
        //            ["2.0000", "201.99000000"],
        //            ...,
        //        ],
        //        "asks": [
        //            ["2.0000", "201.99000000"],
        //            ...,
        //        ]
        //    }
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
        /**
         * @method
         * @name litebit#fetchOHLCV
         * @see https://docs.exchange.litebit.eu/#access-scopes-timing-market-data-get-candles
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'interval': this.safeInteger (this.timeframes, timeframe, timeframe),
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
        /**
         * @method
         * @name litebit#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetBalances (params);
        //
        //    [
        //       {
        //          "available":"7716.93507952",
        //          "reserved":"2155.37500000",
        //          "total":"9872.31007952",
        //          "asset":"EUR"
        //       }
        //    ]
        //
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'reserved');
            account['total'] = this.safeString (balance, 'total');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name litebit#createOrder
         * @see https://docs.exchange.litebit.eu/#access-scopes-timing-trading-post-order
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side,
            'type': type, // limit, market
            // 'amount': this.amountToPrecision (symbol, amount),
            // 'amount_quote': this.costToPrecision (symbol, cost),
            // 'price': this.priceToPrecision (symbol, price),
            // 'post_only': false,
            // 'time_in_force': 'gtc', // gtc, ioc, fok, day, gtd
            // 'expire_at': expireAt,
            // 'client_id': clientId,
        };
        const postOnly = this.safeValue2 (params, 'postOnly', 'post_only', false);
        if (postOnly) {
            request['post_only'] = true;
        }
        const timeInForce = this.safeString2 (params, 'timeInForce', 'time_in_force');
        if (timeInForce !== undefined) {
            request['time_in_force'] = timeInForce;
        }
        const clientId = this.safeString2 (params, 'client_id', 'clientOrderId');
        if (clientId !== undefined) {
            request['client_id'] = clientId;
        }
        params = this.omit (params, [ 'postOnly', 'post_only', 'timeInForce', 'time_in_force', 'client_id', 'clientOrderId' ]);
        if (type === 'market') {
            const cost = this.safeNumber2 (params, 'amountQuote', 'amount_quote');
            if (cost !== undefined) {
                const precision = market['precision']['price'];
                request['amount_quote'] = this.decimalToPrecision (cost, TRUNCATE, precision, this.precisionMode);
            } else {
                request['amount'] = this.amountToPrecision (symbol, amount);
            }
            params = this.omit (params, [ 'amountQuote', 'amount_quote' ]);
        } else if (type === 'limit') {
            if (price === undefined) {
                throw new BadRequest (this.id + ' createOrder price is needed for limit orders');
            }
            request['price'] = this.priceToPrecision (symbol, price);
            request['amount'] = this.amountToPrecision (symbol, amount);
        } else {
            throw new BadRequest (this.id + ' createOrder type must be market or limit');
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        //
        //    {
        //        "uuid": "69d353dc-a80f-491e-b5cf-d2589682664e",
        //        "amount": "0.01000000",
        //        "amount_filled": "0.00000000",
        //        "amount_quote_filled": "0.00000000",
        //        "fee": "0.00000000",
        //        "price": "1000.00",
        //        "side": "buy",
        //        "type": "limit",
        //        "status": "open",
        //        "filled_status": "not_filled",
        //        "cancel_status": null,
        //        "stop": "null",
        //        "stop_price": null,
        //        "post_only": true,
        //        "time_in_force": "gtc",
        //        "created_at": 1637147943854,
        //        "updated_at": 1637147943854,
        //        "expire_at": null,
        //        "market": "BTC-EUR",
        //        "client_id": "d22a7a4e-c28b-40f5-a5a4-79ca8a4fc41c"
        //    }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name litebit#cancelOrder
         * @see https://docs.exchange.litebit.eu/#access-scopes-timing-trading-delete-orders
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orders': [ id ],
            'market': market['id'],
        };
        const response = await this.privateDeleteOrders (this.extend (request, params));
        //
        //    [
        //        {
        //            "uuid": "234234897234-1243-1234-qsf234"
        //        }
        //    ]
        //
        const firstOrder = this.safeValue (response, 0);
        if (firstOrder) {
            return this.parseOrder (firstOrder, market);
        }
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name litebit#cancelOrders
         * @see https://docs.exchange.litebit.eu/#access-scopes-timing-trading-delete-orders
         * @description cancel all open orders in a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {[object]} raw data of order ids queued for cancelation
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orders': ids,
            'market': market['id'],
        };
        const response = await this.privateDeleteOrders (this.extend (request, params));
        //
        //    [
        //        {
        //            "uuid": "234234897234-1243-1234-qsf234"
        //        }
        //    ]
        //
        return this.parseOrders (response, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name litebit#cancelAllOrders
         * @description cancel all open orders in a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateDeleteOrders (this.extend (request, params));
        //
        //    [
        //        {
        //            "uuid": "234234897234-1243-1234-qsf234"
        //        }
        //    ]
        //
        return this.parseOrders (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name litebit#fetchOrder
         * @see https://docs.exchange.litebit.eu/#access-scopes-timing-trading-get-order
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol not used by litebit fetchOrder
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
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
        //    {
        //        "uuid": "4260cd4a-35ba-41af-a63d-b0f1a127f2ab",
        //        "amount": "0.49875000",
        //        "amount_filled": "0.00000000",
        //        "amount_quote_filled": "0.00000000",
        //        "fee": "0.00000000",
        //        "price": "0.0000",
        //        "side": "buy",
        //        "type": "market",
        //        "status": "open",
        //        "filled_status": "not_filled",
        //        "cancel_status": null,
        //        "stop": null,
        //        "stop_price": null,
        //        "post_only": false,
        //        "time_in_force": "gtc",
        //        "created_at": 1620112337000,
        //        "updated_at": 1620112337000,
        //        "expire_at": null,
        //        "market": "BTC-EUR",
        //        "client_id": null
        //    }
        //
        return this.parseOrder (response, market);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name litebit#fetchClosedOrders
         * @see https://docs.exchange.litebit.eu/#access-scopes-timing-trading-get-orders-closed
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
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
        //    [
        //        {
        //            "uuid": "4260cd4a-35ba-41af-a63d-b0f1a127f2ab",
        //            "amount": "0.49875000",
        //            "amount_filled": "0.00000000",
        //            "amount_quote_filled": "0.00000000",
        //            "fee": "0.00000000",
        //            "price": "0.0000",
        //            "side": "buy",
        //            "type": "market",
        //            "status": "closed",
        //            "filled_status": "not_filled",
        //            "cancel_status": null,
        //            "stop": null,
        //            "stop_price": null,
        //            "post_only": false,
        //            "time_in_force": "gtc",
        //            "created_at": 1620112337000,
        //            "updated_at": 1620112337000,
        //            "expire_at": null,
        //            "market": "BTC-EUR",
        //            "client_id": null
        //        }
        //    ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name litebit#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
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
        //    [
        //        {
        //            "uuid": "4260cd4a-35ba-41af-a63d-b0f1a127f2ab",
        //            "amount": "0.49875000",
        //            "amount_filled": "0.00000000",
        //            "amount_quote_filled": "0.00000000",
        //            "fee": "0.00000000",
        //            "price": "0.0000",
        //            "side": "buy",
        //            "type": "market",
        //            "status": "open",
        //            "filled_status": "not_filled",
        //            "cancel_status": null,
        //            "stop": null,
        //            "stop_price": null,
        //            "post_only": false,
        //            "time_in_force": "gtc",
        //            "created_at": 1620112337000,
        //            "updated_at": 1620112337000,
        //            "expire_at": null,
        //            "market": "BTC-EUR",
        //            "client_id": null
        //        }
        //    ]
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
        //    {
        //        "uuid": "4260cd4a-35ba-41af-a63d-b0f1a127f2ab",
        //        "amount": "0.49875000",
        //        "amount_filled": "0.00000000",
        //        "amount_quote_filled": "0.00000000",
        //        "fee": "0.00000000",
        //        "price": "0.0000",
        //        "side": "buy",
        //        "type": "market",
        //        "status": "open",
        //        "filled_status": "not_filled",
        //        "cancel_status": null,
        //        "stop": null,
        //        "stop_price": null,
        //        "post_only": false,
        //        "time_in_force": "gtc",
        //        "created_at": 1620112337000,
        //        "updated_at": 1620112337000,
        //        "expire_at": null,
        //        "market": "BTC-EUR",
        //        "client_id": null
        //    }
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
        const feeCost = this.safeNumber (order, 'fee');
        if (feeCost !== undefined) {
            let feeCurrencyCode = undefined;
            if (market !== undefined) {
                feeCurrencyCode = market['quote'];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const cost = this.safeString (order, 'amount_quote');
        const timeInForce = this.safeStringUpper (order, 'time_in_force');
        const postOnly = this.safeValue (order, 'post_only');
        const stopPrice = this.safeNumber (order, 'stop_price');
        return this.safeOrder ({
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
        /**
         * @method
         * @name litebit#fetchMyTrades
         * @see https://docs.exchange.litebit.eu/#access-scopes-timing-trading-get-fills
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
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
        //    [
        //        {
        //            "uuid": "234234897234-1243-1234-qsf234",
        //            "order_uuid": "234234897234-1243-1234-qsf235",
        //            "amount": "0.00100000",
        //            "price": "42986.64",
        //            "amount_quote": "43.09410660",
        //            "side": "buy",
        //            "fee": "0.10746660",
        //            "market": "BTC-EUR",
        //            "liquidity": "taker",
        //            "timestamp": 1622123573863
        //        }
        //    ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name litebit#withdraw
         * @description make a withdrawal
         * @see https://docs.exchange.litebit.eu/#access-scopes-timing-wallet-post-withdraw-blockchain
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'amount': this.currencyToPrecision (code, amount),
            'address': address,
        };
        let response = undefined;
        if (currency['id'] === 'EUR') {
            response = await this.privatePostWithdrawSepa (this.extend (request, params));
        } else {
            request['asset'] = currency['id'];
            if (tag !== undefined) {
                request['tag'] = tag;
            }
            response = await this.privatePostWithdrawBlockchain (this.extend (request, params));
        }
        //
        //     {
        //          "id": "crypto-12345",
        //          "method": "blockchain",
        //          "asset": "BTC",
        //          "amount": "0.01000000",
        //          "fee": "0.00000001",
        //          "status": "pending_confirmation",
        //          "created_at": 1662622018800,
        //          "updated_at": 1662622026063,
        //          "transaction_details": {
        //              "address": "3E8ociqZa9mZUSwGdSmAEMAoAxBK3FNDcd",
        //              "tag": "",
        //              "transaction_id": "4603d274c8f44cbe3903e4378c144e8e39c54d47a81fc17f6c96f596c1379e38"
        //          }
        //     }
        //
        response = this.extend (response, {
            'type': 'withdrawal',
        });
        return this.parseTransaction (response, currency);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name litebit#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'asset': asset,
            // 'limit': 200, // default 200, max 200
            // 'timestamp_from': since,
            // 'timestamp_to': this.milliseconds (),
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['timestamp_from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 200, max 200
        }
        const response = await this.privateGetWithdrawals (this.extend (request, params));
        //
        // [
        //     {
        //         "id": "fiat-123456",
        //         "method": "sepa",
        //         "asset": "EUR",
        //         "amount": "1234.56",
        //         "fee": "0.01",
        //         "status": "completed",
        //         "created_at": 1662622018800,
        //         "updated_at": 1662622026063,
        //         "transaction_details": {
        //         "address": "NL22ABNA0544878264",
        //             "tag": "",
        //             "transaction_id": ""
        //         }
        //     }
        // ]
        //
        return this.parseTransactions (response, currency, since, limit, { 'type': 'withdrawal' });
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name litebit#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the litebit api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'asset': asset,
            // 'limit': 200, // default 200, max 200
            // 'timestamp_from': since,
            // 'timestamp_to': this.milliseconds (),
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['timestamp_from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 200, max 200
        }
        const response = await this.privateGetDeposits (this.extend (request, params));
        //
        //    [
        //        {
        //            "id": "fiat-12345",
        //            "method": "sepa",
        //            "asset": "EUR",
        //            "amount": "1234.56",
        //            "fee": "0.01",
        //            "status": "completed",
        //            "created_at": 1662622018800,
        //            "updated_at": 1662622026063,
        //            "transaction_details": {
        //            "address": "NL22ABNA0544878264",
        //                "tag": "",
        //                "transaction_id": ""
        //            }
        //        }
        //    ]
        //
        return this.parseTransactions (response, currency, since, limit, { 'type': 'deposit' });
    }

    parseTransactionStatus (status) {
        const statuses = {
            'being withdrawn': 'pending',
            'cancelled': 'canceled',
            'checked': 'pending',
            'confirmed': 'pending',
            'complete': 'ok',
            'completed': 'ok',
            'on hold': 'pending',
            'on_hold': 'pending',
            'order_processing': 'pending',
            'order_paid': 'ok',
            'order_completing': 'pending',
            'order_success': 'ok',
            'order_cancelled': 'canceled',
            'order_on_hold': 'pending',
            'order_expired': 'canceled',
            'order_refunded': 'canceled',
            'order_iban_verification': 'pending',
            'order_awaiting_payment': 'pending',
            'pending': 'pending',
            'pending_confirmation': 'pending',
            'in_sepa_batch': 'pending',
            'invalid address': 'canceled',
            'invalid_payment_details': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //         "id": "fiat-12345",
        //         "method": "sepa",
        //         "asset": "EUR",
        //         "amount": "1234.56",
        //         "fee": "0.01",
        //         "status": "completed",
        //         "created_at": 1662622018800,
        //         "updated_at": 1662622026063,
        //         "transaction_details": {
        //           "address": "NL22ABNA0544878264",
        //           "tag": "",
        //           "transaction_id": ""
        //         }
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const timestamp = this.safeInteger (transaction, 'created_at');
        const updated = this.safeInteger (transaction, 'updated_at');
        const currencyId = this.safeString (transaction, 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const amount = this.safeNumber (transaction, 'amount');
        const transactionDetails = this.safeValue (transaction, 'transaction_details');
        let address = undefined;
        let txid = undefined;
        let tag = undefined;
        if (transactionDetails !== undefined) {
            address = this.safeString (transactionDetails, 'address');
            txid = this.safeString (transactionDetails, 'transaction_id');
            tag = this.safeString (transaction, 'tag');
        }
        let fee = undefined;
        const feeCost = this.safeNumber (transaction, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        const type = this.safeString (transaction, 'type');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': undefined,
            'address': address,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = '/' + this.version + '/' + this.implodeParams (path, params);
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let payload = '';
            if (method !== 'GET') {
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
            if (method !== 'GET') {
                headers['Content-Type'] = 'application/json';
            }
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;  // fallback to default error handler
        }
        //
        //     {"code": 10007,"message": "Invalid time window."}
        //
        const errorCode = this.safeString (response, 'code');
        if (errorCode !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback);  // unknown message
        }
    }

    calculateRateLimiterCost (api, method, path, params, config = {}, context = {}) {
        if (('noMarket' in config) && !('market' in params)) {
            return config['noMarket'];
        }
        return this.safeValue (config, 'cost', 1);
    }
};
