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
                'NEGATIVE_AMOUNT': BadRequest,
                'NEGATIVE_PRICE': BadRequest,
                'MIN_SIZE_NOT_SATISFIED': BadRequest,
                'BAD_AMOUNT_PRECISION': BadRequest,
                'BAD_PRICE_PRECISION': BadRequest,
                'BAD_TRIGGER_PRICE_PRECISION': BadRequest,
                'MAX_OPEN_ORDERS_EXCEEDED': BadRequest,
                'MISSING_PRICE': ArgumentsRequired,
                'MISSING_INSTRUMENT_CODE': ArgumentsRequired,
                'MISSING_ORDER_TYPE': ArgumentsRequired,
                'MISSING_SIDE': ArgumentsRequired,
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
                'price': this.safeFloat (market, 'market_precision'),
                'amount': this.safeFloat (market, 'amount_precision'),
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
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['max_page_size'] = limit;
        }
        const response = await this.privateGetAccountTrades (this.extend (request, params));
        const tradeHistory = this.safeValue (response, 'trade_history');
        const trades = [];
        for (let i = 0; i < tradeHistory.length; i++) {
            const trade = this.safeValue (tradeHistory[i], 'trade');
            trades.push (trade);
        }
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
        const order = this.safeValue (response, 'order');
        return this.parseOrder (order);
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
        if (since !== undefined) {
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
        for (let i = 0; i < response.length; i++) {
            const instrument = this.safeString (response[i], 'instrument_code');
            result[instrument] = this.parseTicker (response[i]);
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
        order = this.safeValue (order, 'order', order);
        market = this.markets_by_id[this.safeString (order, 'instrument_code')];
        const id = this.safeString (order, 'order_id');
        const time = this.safeString (order, 'time');
        const type = this.safeStringLower (order, 'type');
        const side = this.safeStringLower (order, 'side');
        const status = this.safeString (order, 'status');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const filled = this.safeFloat (order, 'filled_amount');
        const cost = price * amount;
        const remaining = amount - filled;
        const fills = this.safeValue (order, 'fills');
        return {
            'id': id,
            'datetime': time,
            'timestamp': this.parse8601 (time),
            'status': status,
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fills': fills,
            'fee': undefined,
            'info': order,
        };
    }

    parseTicker (ticker) {
        const timestamp = this.milliseconds ();
        const symbol = this.safeString (ticker, 'instrument_code');
        const last = this.safeFloat (ticker, 'last_price');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
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

    parseTrade (trade, markets = undefined) {
        const id = this.safeString (trade, 'trade_id');
        const orderId = this.safeString (trade, 'order_id');
        const time = this.safeString (trade, 'time');
        const market = this.markets_by_id[this.safeString (trade, 'instrument_code')];
        const side = this.safeString (trade, 'side');
        const takerOrMaker = this.safeString (trade, 'fee_type');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        const cost = price * amount;
        const fee = {
            'cost': this.safeFloat (trade, 'fee_amount'),
            'currency': this.safeCurrencyCode (this.safeString (trade, 'fee_currency')),
        };
        return {
            'id': id,
            'info': trade,
            'datetime': time,
            'timestamp': this.parse8601 (time),
            'symbol': market['symbol'],
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
};
