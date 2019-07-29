'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const {
    ExchangeError,
    ExchangeNotAvailable,
    BadRequest,
    InvalidOrder,
    InsufficientFunds,
    AuthenticationError,
    ArgumentsRequired,
    NotSupported,
} = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class probit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'probit',
            'name': 'ProBit',
            'countries': ['SC', 'KR'],
            'rateLimit': 250, // ms
            'has': {
                'CORS': true,
                'fetchTime': true,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTickers': true,
                'fetchTicker': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchBalance': true,
                'createOrder': true,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'cancelOrder': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchDepositAddress': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '10m': '10m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '1W',
            },
            'version': 'v1',
            'urls': {
                'logo': 'https://static.probit.com/landing/assets/images/probit-logo-global.png',
                'api': {
                    'account': 'https://accounts.probit.com',
                    'exchange': 'https://api.probit.com/api/exchange',
                },
                'www': 'https://www.probit.com',
                'doc': [
                    'https://docs-en.probit.com',
                    'https://docs-ko.probit.com',
                ],
                'fees': 'https://support.probit.com/hc/en-us/articles/360020968611-Trading-Fees',
            },
            'api': {
                'public': {
                    'get': ['market', 'currency', 'time', 'ticker', 'order_book', 'trade', 'candle'],
                },
                'private': {
                    'post': ['new_order', 'cancel_order', 'withdrawal'],
                    'get': ['balance', 'order', 'open_order', 'order_history', 'trade_history', 'deposit_address'],
                },
                'auth': {
                    'post': ['token'],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
            },
            'exceptions': {
                'INVALID_ARGUMENT': BadRequest,
                'TRADING_UNAVAILABLE': ExchangeNotAvailable,
                'NOT_ENOUGH_BALANCE': InsufficientFunds,
                'NOT_ALLOWED_COMBINATION': BadRequest,
                'INVALID_ORDER': InvalidOrder,
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'options': {
                'defaultLimitOrderTimeInForce': 'gtc',
                'defaultMarketOrderTimeInForce': 'ioc',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarket ();
        const markets = this.safeValue (response, 'data');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const base = market['base_currency_id'];
            const quote = market['quote_currency_id'];
            const symbol = base + '/' + quote;
            const closed = market['closed'];
            result.push ({
                'id': market['id'],
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': base,
                'quoteId': quote,
                'active': !closed,
                'precision': {
                    'amount': market['quantity_precision'],
                    'cost': market['cost_precision'],
                },
                'limits': {
                    'amount': {
                        'min': market['min_quantity'],
                        'max': market['max_quantity'],
                    },
                    'price': {
                        'min': market['min_price'],
                        'max': market['max_price'],
                    },
                    'cost': {
                        'min': market['min_cost'],
                        'max': market['max_cost'],
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrency ();
        const currencies = this.safeValue (response, 'data');
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const code = this.safeCurrencyCode (currency['id']);
            result[code] = {
                'id': code,
                'code': code,
                'name': currency['name'],
                'info': currency,
                'precision': currency['precision'],
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalance ();
        const balances = this.safeValue (response, 'data');
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = balance['currency_id'];
            const account = this.account ();
            const total = this.safeFloat (balance, 'total');
            const available = this.safeFloat (balance, 'available');
            const hold = this.sum (total, -available);
            account['total'] = total;
            account['free'] = available;
            account['used'] = hold;
            result[currencyId] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
        };
        const response = await this.publicGetOrderBook (this.extend (request, params));
        const orderbook = this.safeValue (response, 'data');
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 'price', 'quantity');
    }

    parseOrderBook (orderbook, timestamp = undefined, bidsKey = 'buy', asksKey = 'sell', priceKey = 'price', amountKey = 'quantity') {
        const bids = [];
        const asks = [];
        for (let i = 0; i < orderbook.length; i++) {
            const item = orderbook[i];
            if (item['side'] === bidsKey) {
                bids.push (item);
            } else if (item['side'] === asksKey) {
                asks.push (item);
            }
        }
        return {
            'bids': this.sortBy (this.parseBidsAsks (bids, priceKey, amountKey), 0, true),
            'asks': this.sortBy (this.parseBidsAsks (asks, priceKey, amountKey), 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const marketIds = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            marketIds.push (market['id']);
        }
        const request = {
            'market_ids': marketIds.join (','),
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTickers (response['data'], symbols);
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_ids': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (this.safeValue (response, 'data')[0], market);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (ticker, 'time'));
        const symbol = this.findSymbol (this.safeString (ticker, 'market_id'), market);
        const last = this.safeFloat (ticker, 'last');
        return {
            'close': last,
            'last': last,
            'low': this.safeFloat (ticker, 'low'),
            'high': this.safeFloat (ticker, 'high'),
            'change': this.safeFloat (ticker, 'change'),
            'baseVolume': this.safeFloat (ticker, 'base_volume'),
            'quoteVolume': this.safeFloat (ticker, 'quote_volume'),
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': ticker,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'previousClose': undefined,
            'percentage': undefined,
            'average': undefined,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'limit': 100,
            'start_time': this.iso8601 (0),
            'end_time': this.iso8601 (this.milliseconds ()),
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market_id'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetTradeHistory (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
            'limit': 100,
            'start_time': this.iso8601 (0),
            'end_time': this.iso8601 (this.milliseconds ()),
        };
        if (since !== undefined) {
            request['start_time'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTrade (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const time = this.safeString (trade, 'time');
        const timestamp = this.parse8601 (time);
        const symbol = this.safeString (market, 'symbol');
        let fee = undefined;
        const feeAmount = this.safeFloat (trade, 'fee_amount');
        if (feeAmount !== undefined && feeAmount !== 0) {
            fee = {
                'currency': this.safeString (trade, 'fee_currency_id'),
                'cost': feeAmount,
            };
        }
        return {
            'id': this.safeString (trade, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': this.safeString (trade, 'order_id'),
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': undefined,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'quantity'),
            'cost': this.safeFloat (trade, 'cost'),
            'fee': fee,
            'info': trade,
        };
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime ();
        const timestamp = this.parse8601 (this.safeString (response, 'data'));
        return timestamp;
    }

    normalizeCandleTimestamp (timestamp, timeframe) {
        const coeff = parseInt (timeframe.slice (0, -1), 10);
        const unitLetter = timeframe.slice (-1);
        const m = 60 * 1000;
        const h = 60 * m;
        const D = 24 * h;
        const W = 7 * D;
        const units = {
            'm': m,
            'h': h,
            'D': D,
            'W': W,
        };
        const unit = units[unitLetter];
        const mod = coeff * unit;
        const diff = (timestamp % mod);
        timestamp = timestamp - diff;
        if (unit === W) {
            timestamp = timestamp + 3 * D;
        }
        return timestamp;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const interval = this.timeframes[timeframe];
        if (!interval) {
            throw new NotSupported ('Timeframe ' + timeframe + ' is not supported.');
        }
        const request = {
            'market_ids': market['id'],
            'interval': interval,
            'start_time': this.iso8601 (this.normalizeCandleTimestamp (0, interval)),
            'end_time': this.iso8601 (this.normalizeCandleTimestamp (this.milliseconds (), interval)),
            'sort': 'desc',
            'limit': 100,
        };
        if (since !== undefined) {
            request['start_time'] = this.iso8601 (this.normalizeCandleTimestamp (since, interval));
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetCandle (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            parseFloat (this.parse8601 (this.safeString (ohlcv, 'start_time'))),
            parseFloat (this.safeFloat (ohlcv, 'open')),
            parseFloat (this.safeFloat (ohlcv, 'high')),
            parseFloat (this.safeFloat (ohlcv, 'low')),
            parseFloat (this.safeFloat (ohlcv, 'close')),
            parseFloat (this.safeFloat (ohlcv, 'base_volume')),
        ];
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        since = this.parse8601 (since);
        const request = {};
        if (symbol) {
            request['market_id'] = this.marketId (symbol);
        }
        const resp = await this.privateGetOpenOrder (this.extend (request, params));
        const orders = this.safeValue (resp, 'data');
        let arr = [];
        for (let i = 0; i < orders.length; i++) {
            if (since && this.parse8601 (orders[i]['time']) < since) {
                continue;
            }
            const symbol = this.findSymbol (this.safeString (orders[i], 'market_id'));
            arr.push (this.parseOrder (orders[i], symbol));
        }
        // order by desc
        arr = this.sortBy (arr, 'timestamp', true);
        if (limit) {
            arr = arr.slice (0, limit);
        }
        return arr;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'start_time': this.iso8601 (0),
            'end_time': this.iso8601 (this.milliseconds ()),
            'limit': 100,
        };
        if (symbol) {
            request['market_id'] = this.marketId (symbol);
        }
        if (since) {
            request['start_time'] = this.iso8601 (since);
        }
        if (limit) {
            request['limit'] = limit;
        }
        const resp = await this.privateGetOrderHistory (this.extend (request, params));
        const orders = this.safeValue (resp, 'data');
        const arr = [];
        for (let i = 0; i < orders.length; i++) {
            const symbol = this.findSymbol (this.safeString (orders[i], 'market_id'));
            arr.push (this.parseOrder (orders[i], symbol));
        }
        return arr;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
            'order_id': id.toString (),
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId) {
            request['client_order_id'] = clientOrderId;
        }
        const response = await this.privateGetOrder (this.extend (request, params));
        const order = this.safeValue (response, 'data')[0];
        return this.parseOrder (order, symbol);
    }

    parseOrder (order, symbol) {
        let status = order['status'];
        if (status === 'filled') {
            status = 'closed';
        }
        const time = order['time'];
        const filledCost = this.safeFloat (order, 'filled_cost');
        const filledQty = this.safeFloat (order, 'filled_quantity');
        const openQty = this.safeFloat (order, 'open_quantity');
        let qty = this.safeFloat (order, 'quantity');
        let price = this.safeFloat (order, 'limit_price');
        if (order['type'] === 'market') {
            qty = this.sum (filledQty, openQty);
            if (filledCost > 0 && filledQty > 0) {
                price = filledCost / filledQty;
            }
        }
        return {
            'id': order['id'],
            'symbol': symbol,
            'type': order['type'],
            'side': order['side'],
            'datetime': time,
            'timestamp': this.parse8601 (time),
            'lastTradeTimestamp': undefined,
            'status': status,
            'price': price,
            'amount': qty,
            'filled': filledQty,
            'remaining': openQty,
            'cost': filledCost,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const req = {
            'market_id': market['id'],
            'type': type,
            'side': side,
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId) {
            req['client_order_id'] = clientOrderId;
        }
        let timeInForce = this.safeString (params, 'timeInForce');
        if (type === 'limit') {
            if (!timeInForce) {
                timeInForce = this.options['defaultLimitOrderTimeInForce'];
            }
            req['time_in_force'] = timeInForce;
            req['limit_price'] = this.priceToPrecision (symbol, price);
            req['quantity'] = this.amountToPrecision (symbol, amount);
        } else if (type === 'market') {
            if (!timeInForce) {
                timeInForce = this.options['defaultMarketOrderTimeInForce'];
            }
            req['time_in_force'] = timeInForce;
            if (side === 'sell') {
                req['quantity'] = this.amountToPrecision (symbol, amount);
            } else if (side === 'buy') {
                req['cost'] = this.costToPrecision (symbol, amount);
            }
        }
        const resp = await this.privatePostNewOrder (this.extend (req, params));
        return this.parseOrder (this.safeValue (resp, 'data'), symbol);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
            'order_id': id.toString (),
        };
        const resp = await this.privatePostCancelOrder (this.extend (request, params));
        return this.parseOrder (this.safeValue (resp, 'data'));
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        const address = this.safeString (depositAddress, 'address');
        const tag = this.safeString (depositAddress, 'destination_tag');
        const currencyId = this.safeString (depositAddress, 'currency_id');
        const code = this.safeCurrencyCode (currencyId);
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': depositAddress,
        };
    }

    async createDepositAddress (code, params = {}) {
        return this.fetchDepositAddress (code, params);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency_id': currency['id'],
        };
        const response = await this.privateGetDepositAddress (this.extend (request, params));
        return this.parseDepositAddress (response['data'][0]);
    }

    async fetchDepositAddresses (codes = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (codes) {
            const currencyIds = [];
            for (let i = 0; i < codes.length; i++) {
                const currency = this.currency (codes[i]);
                currencyIds.push (currency['id']);
            }
            request['currency_id'] = codes.join (',');
        }
        const response = await this.privateGetDepositAddress (this.extend (request, params));
        return this.parseDepositAddresses (response['data']);
    }

    async parseDepositAddresses (rawAddresses) {
        const addresses = [];
        for (let i = 0; i < rawAddresses.length; i++) {
            addresses.push (this.parseDepositAddress (rawAddresses[i]));
        }
        return addresses;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (!tag) {
            tag = undefined;
        }
        const request = {
            'currency_id': currency['id'],
            'address': address,
            'destination_tag': tag,
            'amount': this.numberToString (amount),
        };
        const response = await this.privatePostWithdrawal (this.extend (request, params));
        return this.parseTransaction (response['data']);
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeString (transaction, 'id');
        const amount = this.safeFloat (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        const tag = this.safeString (transaction, 'destination_tag');
        const txid = this.safeString (transaction, 'hash');
        const timestamp = this.parse8601 (this.safeString (transaction, 'time'));
        const type = this.safeString (transaction, 'type');
        const currencyId = this.safeString (transaction, 'currency_id');
        const code = this.safeCurrencyCode (currencyId);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const feeCost = this.safeFloat (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined && feeCost !== 0) {
            fee = {
                'currency': code,
                'cost': feeCost,
            };
        }
        return {
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': tag,
            'status': status,
            'type': type,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
            'info': transaction,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'requested': 'pending',
            'pending': 'pending',
            'confirming': 'pending',
            'confirmed': 'pending',
            'applying': 'pending',
            'done': 'ok',
            'cancelled': 'canceled',
            'cancelling': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['exchange'] + '/' + this.version + '/';
        if (api === 'auth') {
            url = this.urls['api']['account'] + '/';
        }
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            url += this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const expires = this.safeInteger (this.options, 'expires');
            if (!expires || expires < this.milliseconds ()) {
                throw new AuthenticationError (this.id + ' accessToken expired, call signIn() method');
            }
            url += this.implodeParams (path, params);
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (Object.keys (query).length) {
                body = this.json (query);
            }
            headers = {
                'Authorization': 'Bearer ' + this.options['accessToken'],
                'Content-Type': 'application/json',
            };
        } else if (api === 'auth') {
            this.checkRequiredCredentials ();
            url += this.implodeParams (path, params);
            const encoded = this.encode (this.apiKey + ':' + this.secret);
            const basicAuth = this.stringToBase64 (encoded);
            headers = {
                'Authorization': 'Basic ' + this.decode (basicAuth),
                'Content-Type': 'application/json',
            };
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (Object.keys (query).length) {
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async signIn (params = {}) {
        this.checkRequiredCredentials ();
        if (!this.apiKey || !this.secret) {
            throw new AuthenticationError (this.id + ' signIn() requires this.apiKey and this.secret credentials');
        }
        const body = {
            'grant_type': 'client_credentials',
        };
        const tokenResponse = await this.authPostToken (body);
        const expiresIn = this.safeInteger (tokenResponse, 'expires_in');
        const accessToken = this.safeString (tokenResponse, 'access_token');
        this.options['accessToken'] = accessToken;
        this.options['expires'] = this.sum (this.milliseconds (), expiresIn * 1000);
        this.options['tokenType'] = this.safeString (tokenResponse, 'token_type');
        return tokenResponse;
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('errorCode' in response) {
            const errorCode = this.safeString (response, 'errorCode');
            const message = this.safeString (response, 'message');
            if (errorCode !== undefined) {
                const feedback = this.json (response);
                const exceptions = this.exceptions;
                if (message in exceptions) {
                    throw new exceptions[message] (feedback);
                } else if (errorCode in exceptions) {
                    throw new exceptions[errorCode] (feedback);
                } else {
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
