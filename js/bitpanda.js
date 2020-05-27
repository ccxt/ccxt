'use strict';

const Exchange = require ('./base/Exchange');
const {
    AuthenticationError,
    PermissionDenied,
    BadRequest,
    ArgumentsRequired,
    OrderNotFound,
    InsufficientFunds,
    ExchangeNotAvailable,
    DDoSProtection,
    ExchangeError,
} = require ('./base/errors');

module.exports = class bitpanda extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitpanda',
            'name': 'Bitpanda Global Exchange',
            'countries': ['AT'],
            'rateLimit': 500,
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'CORS': true,
                'createDepositAddress': true,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'deposit': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchL2OrderBook': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchStatus': 'emulated',
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': false,
                'fetchTradingFees': true,
                'privateAPI': true,
                'publicAPI': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': {
                    'period': 1,
                    'unit': 'MINUTES',
                },
                '5m': {
                    'period': 5,
                    'unit': 'MINUTES',
                },
                '15m': {
                    'period': 15,
                    'unit': 'MINUTES',
                },
                '30m': {
                    'period': 30,
                    'unit': 'MINUTES',
                },
                '1h': {
                    'period': 1,
                    'unit': 'HOURS',
                },
                '4h': {
                    'period': 4,
                    'unit': 'HOURS',
                },
                '1d': {
                    'period': 1,
                    'unit': 'DAYS',
                },
                '1w': {
                    'period': 1,
                    'unit': 'WEEKS',
                },
                '1M': {
                    'period': 1,
                    'unit': 'MONTHS',
                },
            },
            'version': 'v1',
            'urls': {
                'api': {
                    'v1': 'https://api.exchange.bitpanda.com/public/',
                    'public': 'https://api.exchange.bitpanda.com/public/',
                    'private': 'https://api.exchange.bitpanda.com/public/',
                },
                'www': 'https://www.bitpanda.com',
                'doc': [
                    'https://developers.bitpanda.com/exchange/',
                ],
                'fees': 'https://www.bitpanda.com/en/exchange/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'candlesticks/{instrument}',
                        'currencies',
                        'instruments',
                        'market-ticker',
                        'market-ticker/{instrument}',
                        'order-book/{instrument}',
                        'time',
                    ],
                },
                'private': {
                    'get': [
                        'account/balances',
                        'account/deposit/crypto/{id}',
                        'account/fees',
                        'account/orders',
                        'account/orders/{id}',
                        'account/trades',
                        'account/trading-volume',
                    ],
                    'post': [
                        'account/deposit/crypto',
                        'account/orders',
                        'account/withdraw/crypto',
                    ],
                    'delete': [
                        'account/orders',
                        'account/orders/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.1 / 100,
                    'maker': 0.1 / 100,
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'options': {
                'with_just_filled_inactive': false,
                'with_cancelled_and_rejected': false,
            },
            'exceptions': {
                'INVALID_CREDENTIALS': AuthenticationError,
                'MISSING_CREDENTIALS': AuthenticationError,
                'INVALID_APIKEY': AuthenticationError,
                'INVALID_SCOPES': AuthenticationError,
                'INVALID_SUBJECT': AuthenticationError,
                'INVALID_ISSUER': AuthenticationError,
                'INVALID_AUDIENCE': AuthenticationError,
                'INVALID_DEVICE_ID': AuthenticationError,
                'INVALID_IP_RESTRICTION': AuthenticationError,
                'APIKEY_REVOKED': AuthenticationError,
                'APIKEY_EXPIRED': AuthenticationError,
                'SYNCHRONIZER_TOKEN_MISMATCH': AuthenticationError,
                'SESSION_EXPIRED': AuthenticationError,
                'INTERNAL_ERROR': AuthenticationError,
                'CLIENT_IP_BLOCKED': PermissionDenied,
                'MISSING_PERMISSION': PermissionDenied,
                'ILLEGAL_CHARS': BadRequest,
                'UNSUPPORTED_MEDIA_TYPE': BadRequest,
                'ACCOUNT_HISTORY_TIME_RANGE_TOO_BIG': BadRequest,
                'CANDLESTICKS_TIME_RANGE_TOO_BIG': BadRequest,
                'INVALID_INSTRUMENT_CODE': BadRequest,
                'INVALID_ORDER_TYPE': BadRequest,
                'INVALID_UNIT': BadRequest,
                'INVALID_PERIOD': BadRequest,
                'INVALID_TIME': BadRequest,
                'INVALID_DATE': BadRequest,
                'INVALID_CURRENCY': BadRequest,
                'INVALID_AMOUNT': BadRequest,
                'INVALID_PRICE': BadRequest,
                'INVALID_LIMIT': BadRequest,
                'INVALID_QUERY': BadRequest,
                'INVALID_CURSOR': BadRequest,
                'INVALID_ACCOUNT_ID': BadRequest,
                'INVALID_SIDE': BadRequest,
                'INVALID_ACCOUNT_HISTORY_FROM_TIME': BadRequest,
                'INVALID_ACCOUNT_HISTORY_MAX_PAGE_SIZE': BadRequest,
                'INVALID_ACCOUNT_HISTORY_TIME_PERIOD': BadRequest,
                'INVALID_ACCOUNT_HISTORY_TO_TIME': BadRequest,
                'INVALID_CANDLESTICKS_GRANULARITY': BadRequest,
                'INVALID_CANDLESTICKS_UNIT': BadRequest,
                'INVALID_ORDER_BOOK_DEPTH': BadRequest,
                'INVALID_ORDER_BOOK_LEVEL': BadRequest,
                'INVALID_PAGE_CURSOR': BadRequest,
                'INVALID_TIME_RANGE': BadRequest,
                'INVALID_TRADE_ID': BadRequest,
                'INVALID_UI_ACCOUNT_SETTINGS': BadRequest,
                'NEGATIVE_AMOUNT': BadRequest,
                'NEGATIVE_PRICE': BadRequest,
                'MIN_SIZE_NOT_SATISFIED': BadRequest,
                'BAD_AMOUNT_PRECISION': BadRequest,
                'BAD_PRICE_PRECISION': BadRequest,
                'BAD_TRIGGER_PRICE_PRECISION': BadRequest,
                'MAX_OPEN_ORDERS_EXCEEDED': BadRequest,
                'MISSING_PRICE': ArgumentsRequired,
                'MISSING_ORDER_TYPE': ArgumentsRequired,
                'MISSING_SIDE': ArgumentsRequired,
                'MISSING_CANDLESTICKS_PERIOD_PARAM': ArgumentsRequired,
                'MISSING_CANDLESTICKS_UNIT_PARAM': ArgumentsRequired,
                'MISSING_FROM_PARAM': ArgumentsRequired,
                'MISSING_INSTRUMENT_CODE': ArgumentsRequired,
                'MISSING_ORDER_ID': ArgumentsRequired,
                'MISSING_TO_PARAM': ArgumentsRequired,
                'MISSING_TRADE_ID': ArgumentsRequired,
                'INVALID_ORDER_ID': OrderNotFound,
                'NOT_FOUND': OrderNotFound,
                'INSUFFICIENT_LIQUIDITY': InsufficientFunds,
                'INSUFFICIENT_FUNDS': InsufficientFunds,
                'NO_TRADING': ExchangeNotAvailable,
                'SERVICE_UNAVAILABLE': ExchangeNotAvailable,
                'GATEWAY_TIMEOUT': ExchangeNotAvailable,
                'RATELIMIT': DDoSProtection,
                'CF_RATELIMIT': DDoSProtection,
                'INTERNAL_SERVER_ERROR': ExchangeError,
            },
        });
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            request['instrument_code'] = this.marketId (symbol);
        }
        return await this.privateDeleteAccountOrders (this.extend (request, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        return await this.privateDeleteAccountOrdersId (this.extend (request, params));
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostAccountDepositCrypto (this.extend (request, params));
        const address = this.safeString (response, 'address');
        const tag = this.safeString (response, 'destination_tag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'instrument_code': this.marketId (symbol),
            'side': side.toUpperCase (),
            'type': type.toUpperCase (),
            'amount': this.amountToPrecision (symbol, amount),
        };
        if (type === 'limit' || this.safeString (params, 'type') === 'stoplimit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (this.safeString (params, 'type') === 'stoplimit') {
            request['trigger_price'] = this.priceToPrecision (symbol, this.safeFloat (params, 'stopPrice'));
        }
        const response = await this.privatePostAccountOrders (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccountBalances (params);
        const balances = this.safeValue (response, 'balances');
        const result = {
            'info': response,
        };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyCode = this.safeString (balance, 'currency_code');
            const code = this.safeCurrencyCode (currencyCode);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'locked');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        params['with_cancelled_and_rejected'] = false;
        params['with_just_filled_inactive'] = true;
        return await this.fetchOrders (symbol, since, limit, params);
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'code');
            const code = this.safeCurrencyCode (id);
            const precision = this.safeInteger (currency, 'precision');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': code,
                'active': undefined,
                'fee': undefined,
                'precision': precision,
                'limits': undefined,
            };
        }
        return result;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'id': currency['id'],
        };
        const response = await this.privateGetAccountDepositCryptoId (this.extend (request, params));
        const address = this.safeString (response, 'address');
        const tag = this.safeString (response, 'destination_tag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchL2OrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'instrument': this.marketId (symbol),
            'level': 2,
        };
        return await this.parseBook (request, params);
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetInstruments ();
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const baseId = this.safeString (market['base'], 'code');
            const quoteId = this.safeString (market['quote'], 'code');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const id = base + '_' + quote;
            const symbol = base + '/' + quote;
            const active = this.safeString (market, 'state') === 'ACTIVE';
            const precision = {
                'price': this.safeInteger (market, 'market_precision'),
                'amount': this.safeInteger (market, 'amount_precision'),
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'min_size'),
                    'max': undefined,
                },
                'price': {
                    'min': Math.pow (10, -precision['price']),
                    'max': undefined,
                },
            };
            limits['cost'] = {
                'min': limits['amount']['min'] * limits['price']['min'],
                'max': undefined,
            };
            result.push ({
                'id': id,
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

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_code'] = market['id'];
        }
        // from and to parameters are mutually inclusive
        if (since !== undefined) {
            // we define now as default to parameter
            let to = this.iso8601 (this.milliseconds ());
            if ('to' in params) {
                to = this.safeString (params, 'to');
            }
            request['to'] = to;
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['max_page_size'] = limit;
        }
        const response = await this.privateGetAccountTrades (this.extend (request, params));
        const trades = this.safeValue (response, 'trade_history');
        if ('cursor' in response) {
            const cursor = this.safeValue (response, 'cursor');
            return this.addPaginatorCursor (this.parseTrades (trades, market, since, limit, params), cursor);
        }
        return this.parseTrades (trades, market, since, limit, params);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        // maximum supported by bitpanda pro
        const MAX_LIMIT = 1000;
        await this.loadMarkets ();
        const granularity = this.timeframes[timeframe];
        // sanity checks
        if (granularity === undefined) {
            throw new ExchangeError (this.id + ' does not have the timeframe option: ' + timeframe);
        }
        if (since === undefined) {
            throw new ExchangeError (this.id + ' since needs to defined for OHLC');
        }
        if (limit === undefined || limit > MAX_LIMIT) {
            limit = MAX_LIMIT;
        }
        const market = this.market (symbol);
        const duration = this.parseTimeframe (timeframe);
        // max time period in ms wrt granularity and limit
        const maxTimePeriod = (limit - 1) * duration * 1000;
        if ('to' in params) {
            if (params['to'] <= this.sum (maxTimePeriod, since)) {
                params['to'] = this.iso8601 (params['to']);
            } else {
                throw new ExchangeError (this.id + 'to parameter specified is too large');
            }
        } else {
            // default to if none is specified
            params['to'] = this.iso8601 (this.sum (maxTimePeriod, since));
        }
        const request = {
            'instrument': market['id'],
            'period': granularity['period'],
            'unit': granularity['unit'],
            'from': this.iso8601 (since),
            'to': params['to'],
        };
        const response = await this.publicGetCandlesticksInstrument (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrders (symbol, since, limit, params);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetAccountOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'instrument': this.marketId (symbol),
        };
        return await this.parseBook (request, params);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_code'] = market['id'];
        }
        // from and to parameters are mutually inclusive
        if (since !== undefined) {
            // we define now as default to parameter
            let to = this.iso8601 (this.milliseconds ());
            if ('to' in params) {
                to = this.safeString (params, 'to');
            }
            request['to'] = to;
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['max_page_size'] = limit;
        }
        if ('with_cancelled_and_rejected' in params) {
            request['with_cancelled_and_rejected'] = this.safeString (params, 'with_cancelled_and_rejected');
        }
        if ('with_just_filled_inactive' in params) {
            request['with_just_filled_inactive'] = this.safeString (params, 'with_just_filled_inactive');
        }
        const response = await this.privateGetAccountOrders (this.extend (request, params));
        const orders = this.safeValue (response, 'order_history');
        if ('cursor' in response) {
            const cursor = this.safeValue (response, 'cursor');
            return this.addPaginatorCursor (this.parseOrders (orders, market, since, limit, params), cursor);
        }
        return this.parseOrders (orders, market, since, limit, params);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['id'],
        };
        const ticker = await this.publicGetMarketTickerInstrument (this.extend (request, params));
        return this.parseTicker (ticker);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarketTicker (params);
        const result = {};
        const responseNum = response.length;
        for (let i = 0; i < responseNum; i++) {
            const symbol = this.translateSymbol (this.safeString (response[i], 'instrument_code'));
            result[symbol] = this.parseTicker (response[i]);
        }
        return result;
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        return this.safeInteger (response, 'epoch_millis');
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const volumeResponse = await this.privateGetAccountTradingVolume (params);
        const volume = this.safeFloat (volumeResponse, 'volume');
        const feeResponse = await this.privateGetAccountFees (params);
        const tiers = this.safeValue (feeResponse, 'fee_tiers');
        for (let i = 0; i < tiers.length - 1; i++) {
            const firstTier = tiers[i];
            const secondTier = tiers[i + 1];
            const firstTierVolume = this.safeFloat (firstTier, 'volume');
            const secondTierVolume = this.safeFloat (secondTier, 'volume');
            if (volume >= firstTierVolume && volume < secondTierVolume) {
                return {
                    'info': feeResponse,
                    'maker': this.safeFloat (firstTier, 'maker_fee') / 100,
                    'taker': this.safeFloat (firstTier, 'taker_fee') / 100,
                };
            }
        }
        return {
            'info': feeResponse,
            'maker': this.fees.trading.maker,
            'taker': this.fees.trading.taker,
        };
    }

    async parseBook (request, params) {
        const response = await this.publicGetOrderBookInstrument (this.extend (request, params));
        const time = this.safeString (response, 'time');
        return this.parseOrderBook (response, this.parse8601 (time), 'bids', 'asks', 'price', 'amount');
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'recipient': {
                'address': address,
            },
        };
        if (tag !== undefined) {
            request['recipient']['tag'] = tag;
        }
        const response = this.privatePostAccountWithdrawCrypto (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.parse8601 (this.safeString (ohlcv, 'time')),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            // Bitpanda's volume is in quote currency we are using total_amount which is in base currency instead
            this.safeFloat (ohlcv, 'total_amount'),
        ];
    }

    parseOrder (order, market = undefined) {
        // example order response
        // {
        //   "order": {
        //     "order_id": "66756a10-3e86-48f4-9678-b634c4b135b2",
        //     "account_id": "1eb2ad5d-55f1-40b5-bc92-7dc05869e905",
        //     "instrument_code": "BTC_EUR",
        //     "amount": "1234.5678",
        //     "filled_amount": "1234.5678",
        //     "side": "BUY",
        //     "type": "LIMIT",
        //     "status": "OPEN",
        //     "sequence": 123456789,
        //     "price": "1234.5678",
        //     "average_price": "1234.5678",
        //     "reason": "INSUFFICIENT_FUNDS",
        //     "time": "2020-05-06T06:53:31Z",
        //     "time_in_force": "GOOD_TILL_CANCELLED",
        //     "time_last_updated": "2020-05-06T06:53:31Z",
        //     "expire_after": "2020-05-06T06:53:31Z",
        //     "is_post_only": false,
        //     "time_triggered": "2020-05-06T06:53:31Z",
        //     "trigger_price": "1234.5678"
        //   },
        //   "trades": [
        //     {
        //       "trade": {
        //         "trade_id": "2b42efcd-d5b7-4a56-8e12-b69ffd68c5ef",
        //         "order_id": "66756a10-3e86-48f4-9678-b634c4b135b2",
        //         "account_id": "c2d0076a-c20d-41f8-9e9a-1a1d028b2b58",
        //         "amount": "1234.5678",
        //         "side": "BUY",
        //         "instrument_code": "BTC_EUR",
        //         "price": "1234.5678",
        //         "time": "2020-05-06T06:53:31Z",
        //         "sequence": 123456789
        //       },
        //       "fee": {
        //         "fee_amount": "1234.5678",
        //         "fee_percentage": "1234.5678",
        //         "fee_group_id": "default",
        //         "running_trading_volume": "1234.5678",
        //         "fee_currency": "BTC",
        //         "fee_type": "TAKER"
        //       }
        //     }
        //   ]
        // }
        const orderObject = this.safeValue (order, 'order', order);
        const symbol = this.translateSymbol (this.safeString (orderObject, 'instrument_code'));
        const id = this.safeString (orderObject, 'order_id');
        const time = this.safeString (orderObject, 'time');
        const timestamp = this.parse8601 (time);
        const type = this.safeStringLower (orderObject, 'type');
        const side = this.safeStringLower (orderObject, 'side');
        const status = this.parseOrderStatus (this.safeString (orderObject, 'status'));
        const price = this.safeFloat (orderObject, 'price');
        const average = this.safeFloat (orderObject, 'average_price', 0);
        const amount = this.safeFloat (orderObject, 'amount');
        const filled = this.safeFloat (orderObject, 'filled_amount', 0);
        // using average price which is actual filled price of the trades
        const cost = average * amount;
        const remaining = amount - filled;
        const clientId = this.safeString (orderObject, 'client_id');
        let trades = undefined;
        // may not contain any trades if not filled
        const fills = this.safeValue (order, 'trades');
        if (fills !== undefined) {
            trades = this.parseTrades (fills, market);
        }
        return {
            'id': id,
            'datetime': time,
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': average,
            'cost': cost,
            'clientOrderId': clientId,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            // trades for one order can have multiple fee currencies, each trade contains this information of itself.
            'fee': undefined,
            'info': order,
        };
    }

    parseTicker (ticker) {
        const timestamp = this.milliseconds ();
        const symbol = this.translateSymbol (this.safeString (ticker, 'instrument_code'));
        const last = this.safeFloat (ticker, 'last_price');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'best_bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'best_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'price_change'),
            'percentage': this.safeFloat (ticker, 'price_change_percentage'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'base_volume'),
            'quoteVolume': this.safeFloat (ticker, 'quote_volume'),
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        // Example Trade response
        // {
        //   "trade": {
        //     "trade_id": "2b42efcd-d5b7-4a56-8e12-b69ffd68c5ef",
        //     "order_id": "66756a10-3e86-48f4-9678-b634c4b135b2",
        //     "account_id": "c2d0076a-c20d-41f8-9e9a-1a1d028b2b58",
        //     "amount": "1234.5678",
        //     "side": "BUY",
        //     "instrument_code": "BTC_EUR",
        //     "price": "1234.5678",
        //     "time": "2020-05-06T06:53:31Z",
        //     "sequence": 123456789
        //   },
        //   "fee": {
        //     "fee_amount": "1234.5678",
        //     "fee_percentage": "0.10",
        //     "fee_group_id": "default",
        //     "running_trading_volume": "1234.5678",
        //     "fee_currency": "BTC",
        //     "fee_type": "TAKER"
        //   }
        // }
        const tradeObject = this.safeValue (trade, 'trade');
        const feeObject = this.safeValue (trade, 'fee');
        const id = this.safeString (tradeObject, 'trade_id');
        const orderId = this.safeString (tradeObject, 'order_id');
        const time = this.safeString (tradeObject, 'time');
        const side = this.safeStringLower (tradeObject, 'side');
        const takerOrMaker = this.safeStringLower (feeObject, 'fee_type');
        const price = this.safeFloat (tradeObject, 'price');
        const amount = this.safeFloat (tradeObject, 'amount');
        const cost = price * amount;
        const symbol = this.translateSymbol (this.safeString (tradeObject, 'instrument_code'));
        const fee = {
            'cost': this.safeFloat (feeObject, 'fee_amount'),
            'currency': this.safeCurrencyCode (this.safeString (feeObject, 'fee_currency')),
            'rate': this.safeFloat (feeObject, 'fee_percentage'),
        };
        return {
            'id': id,
            'info': trade,
            'datetime': time,
            'timestamp': this.parse8601 (time),
            'symbol': symbol,
            'type': undefined,
            'order': orderId,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + this.version + request;
        const query = this.omit (params, this.extractParams (path));
        if (headers === undefined) {
            headers = {};
        }
        if (method === 'GET' || method === 'DELETE') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (method === 'POST') {
            headers['Content-Type'] = 'application/json';
            body = this.json (query);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            headers['Authorization'] = 'Bearer ' + this.apiKey;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code < 400) {
            return;
        }
        const error = this.safeValue (response, 'error');
        if (error === undefined) {
            return;
        }
        const exception = this.exceptions[error];
        if (exception !== undefined) {
            throw new this.exceptions[error] (error);
        }
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }

    addPaginatorCursor (elements, cursor) {
        if (cursor && elements) {
            // php transpiler making problems here with array length, thus this specific hint.
            const lastElement = elements.length;
            elements[lastElement - 1]['info']['cursor'] = cursor;
        }
        return elements;
    }

    parseOrderStatus (status) {
        const statuses = {
            'OPEN': 'open',
            'STOP_TRIGGERED': 'open',
            'FILLED': 'open',
            'FILLED_FULLY': 'closed',
            'FILLED_CLOSED': 'canceled',
            'FILLED_REJECTED': 'rejected',
            'REJECTED': 'rejected',
            'CLOSED': 'canceled',
            'FAILED': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    translateSymbol (marketId) {
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                const market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                // if not found we just parse it as the format is known
                const [baseId, quoteId] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId); // unified
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        return symbol;
    }
};
