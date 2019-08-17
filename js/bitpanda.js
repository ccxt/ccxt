'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, OrderNotFound, InsufficientFunds } = require ('./base/errors');
const { iso8601, parse8601, microseconds } = require ('./base/functions/time');

module.exports = class bitpanda extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitpanda',
            'name': 'Bitpanda Global Exchange',
            'countries': ['AT'], // Austria
            'rateLimit': 500,
            'has': {
                'CORS': false,
                'fetchMarkets': true,
                'fetchOrderBook': true,
                'fetchL2OrderBook': true,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchStatus': false,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'deposit': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1MINUTES',
                '5m': '5MINUTES',
                '15m': '15MINUTES',
                '30m': '30MINUTES',
                '1h': '1HOURS',
                '4h': '4HOURS',
                '1d': '1DAYS',
                '1w': '1WEEKS',
                '1M': '1MONTHS',
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
                        'instruments',
                        'order-book/{instrument}',
                        'candlesticks/{instrument}',
                    ],
                },
                'private': {
                    'get': [
                        'account/balances',
                        'account/orders',
                        'account/orders/{id}',
                        'account/trades',
                    ],
                    'post': [
                        'account/orders',
                    ],
                    'delete': [
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
            // exchange-specific options
            'options': {
                'with_just_filled_inactive': true,
                'with_cancelled_and_rejected': true,
            },
            'exceptions': {
                'NOT_FOUND': OrderNotFound,
                'INSUFFICIENT_FUNDS': InsufficientFunds,
            },
        });
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
                    // TODO: Not sure about this
                    'max': Math.pow (10, precision['price']),
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

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'instrument': this.marketId (symbol),
        };
        return this.parseBook (request, params);
    }

    async fetchL2OrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'instrument': this.marketId (symbol),
            'level': 2,
        };
        return this.parseBook (request, params);
    }

    async parseBook (request, params) {
        const response = await this.publicGetOrderBookInstrument (this.extend (request, params));
        const time = this.safeString (response, 'time');
        return this.parseOrderBook (response, parse8601 (time), 'bids', 'asks', 'price', 'amount');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        // TODO: Needs a price ticker from the exchange bois
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

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        const request = {
            'instrument_code': this.marketId (symbol),
            'side': side.toUpperCase (),
            'type': type.toUpperCase (),
            'amount': this.amountToPrecision (symbol, amount),
        };
        if (type === 'limit' || params['type'] === 'stoplimit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (params['type'] === 'stoplimit') {
            request['trigger_price'] = this.priceToPrecision (symbol, params['stopPrice']);
        }
        const response = await this.privatePostAccountOrders (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        return await this.privateDeleteAccountOrdersId (this.extend (request, params));
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

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'with_cancelled_and_rejected': this.options['with_cancelled_and_rejected'],
            'with_just_filled_inactive': this.options['with_just_filled_inactive'],
        };
        if (symbol !== undefined) {
            request['instrument_code'] = this.marketId (symbol);
        }
        if (since !== undefined) {
            request['from'] = iso8601 (since);
        }
        if (limit !== undefined) {
            request['max_page_size'] = limit;
        }
        const response = await this.privateGetAccountOrders (this.extend (request, params));
        const orders = this.safeValue (response, 'order_history');
        return this.parseOrders (orders);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        params['with_cancelled_and_rejected'] = false;
        params['with_just_filled_inactive'] = false;
        return await this.fetchOrders (symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        params['with_cancelled_and_rejected'] = false;
        params['with_just_filled_inactive'] = true;
        return await this.fetchOrders (symbol, since, limit, params);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            request['instrument_code'] = this.marketId (symbol);
        }
        if (since !== undefined) {
            request['from'] = iso8601 (since);
        }
        if (limit !== undefined) {
            request['max_page_size'] = limit;
        }
        const response = await this.privateGetAccountTrades (this.extend (request, params));
        const trades = this.safeValue (response, 'trade_history');
        return this.parseTrades (trades);
    }

    parseOrders (orders) {
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            const order = this.safeValue (orders[i], 'order');
            result.push (this.parseOrder (order));
        }
        return result;
    }

    parseOrder (order) {
        const id = this.safeString (order, 'order_id');
        const time = this.safeString (order, 'time');
        const market = this.markets_by_id[this.safeString (order, 'instrument_code')];
        const type = this.safeStringLower (order, 'type');
        const side = this.safeStringLower (order, 'side');
        const status = this.safeString (order, 'status');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const filled = this.safeFloat (order, 'filled_amount');
        const cost = price * amount;
        const remaining = amount - filled;
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
            // TODO: Not sure
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    parseTrades (trades) {
        const result = [];
        for (let i = 0; i < trades.length; i++) {
            const trade = this.safeValue (trades[i], 'trade');
            result.push (this.parseTrade (trade));
        }
        return result;
    }

    parseTrade (trade) {
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
            // TODO: Clarify
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

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const time = this.timeframes[timeframe];
        if (time === undefined) {
            throw new ExchangeError (this.id + ' does not have the timeframe option: ' + timeframe);
        }
        const market = this.market (symbol);
        const period = time.substring (0, 1);
        const unit = time.substring (1, time.length);
        const request = {
            'instrument': market['id'],
            'period': period,
            'unit': unit,
        };
        if (since === undefined) {
            // TODO: Discuss if error or no error
            request['from'] = iso8601 (1565175600000);
        } else {
            request['from'] = iso8601 (since);
        }
        if (params['to'] === undefined) {
            request['to'] = iso8601 (microseconds ());
        } else {
            // TODO: Should ccxt handle extra params?
            request['to'] = iso8601 (params['to']);
        }
        const response = await this.publicGetCandlesticksInstrument (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + this.version + request;
        const query = this.omit (params, this.extractParams (path));
        if (headers === undefined) {
            headers = {};
        }
        if (method === 'GET') {
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

    handleErrors (code, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return;
        }
        if (response['error'] === undefined || code < 400) {
            return;
        }
        const errorKey = response['error'];
        const exception = this.exceptions[errorKey];
        if (exception !== undefined) {
            // eslint-disable-next-line new-cap
            throw new exception (errorKey);
        }
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }
};
