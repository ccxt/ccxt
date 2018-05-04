'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidNonce, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitso extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitso',
            'name': 'Bitso',
            'countries': 'MX', // Mexico
            'rateLimit': 2000, // 30 requests per minute
            'version': 'v3',
            'has': {
                'CORS': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766335-715ce7aa-5ed5-11e7-88a8-173a27bb30fe.jpg',
                'api': 'https://api.bitso.com',
                'www': 'https://bitso.com',
                'doc': 'https://bitso.com/api_info',
                'fees': 'https://bitso.com/fees?l=es',
            },
            'api': {
                'public': {
                    'get': [
                        'available_books',
                        'ticker',
                        'order_book',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'account_status',
                        'balance',
                        'fees',
                        'fundings',
                        'fundings/{fid}',
                        'funding_destination',
                        'kyc_documents',
                        'ledger',
                        'ledger/trades',
                        'ledger/fees',
                        'ledger/fundings',
                        'ledger/withdrawals',
                        'mx_bank_codes',
                        'open_orders',
                        'order_trades/{oid}',
                        'orders/{oid}',
                        'user_trades',
                        'user_trades/{tid}',
                        'withdrawals/',
                        'withdrawals/{wid}',
                    ],
                    'post': [
                        'bitcoin_withdrawal',
                        'debit_card_withdrawal',
                        'ether_withdrawal',
                        'orders',
                        'phone_number',
                        'phone_verification',
                        'phone_withdrawal',
                        'spei_withdrawal',
                    ],
                    'delete': [
                        'orders/{oid}',
                        'orders/all',
                    ],
                },
            },
            'exceptions': {
                '0201': AuthenticationError, // Invalid Nonce or Invalid Credentials
                '104': InvalidNonce, // Cannot perform request - nonce must be higher than 1520307203724237
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetAvailableBooks ();
        let result = [];
        for (let i = 0; i < markets['payload'].length; i++) {
            let market = markets['payload'][i];
            let id = market['book'];
            let symbol = id.toUpperCase ().replace ('_', '/');
            let [ base, quote ] = symbol.split ('/');
            let limits = {
                'amount': {
                    'min': parseFloat (market['minimum_amount']),
                    'max': parseFloat (market['maximum_amount']),
                },
                'price': {
                    'min': parseFloat (market['minimum_price']),
                    'max': parseFloat (market['maximum_price']),
                },
                'cost': {
                    'min': parseFloat (market['minimum_value']),
                    'max': parseFloat (market['maximum_value']),
                },
            };
            let precision = {
                'amount': this.precisionFromString (market['minimum_amount']),
                'price': this.precisionFromString (market['minimum_price']),
            };
            let lot = limits['amount']['min'];
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
                'lot': lot,
                'limits': limits,
                'precision': precision,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalance ();
        let balances = response['payload']['balances'];
        let result = { 'info': response };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'].toUpperCase ();
            let account = {
                'free': parseFloat (balance['available']),
                'used': parseFloat (balance['locked']),
                'total': parseFloat (balance['total']),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetOrderBook (this.extend ({
            'book': this.marketId (symbol),
        }, params));
        let orderbook = response['payload'];
        let timestamp = this.parse8601 (orderbook['updated_at']);
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTicker (this.extend ({
            'book': this.marketId (symbol),
        }, params));
        let ticker = response['payload'];
        let timestamp = this.parse8601 (ticker['created_at']);
        let vwap = parseFloat (ticker['vwap']);
        let baseVolume = parseFloat (ticker['volume']);
        let quoteVolume = baseVolume * vwap;
        let last = parseFloat (ticker['last']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'bidVolume': undefined,
            'ask': parseFloat (ticker['ask']),
            'askVolume': undefined,
            'vwap': vwap,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['created_at']);
        let symbol = undefined;
        if (typeof market === 'undefined') {
            let marketId = this.safeString (trade, 'book');
            if (marketId in this.markets_by_id)
                market = this.markets_by_id[marketId];
        }
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let side = this.safeString (trade, 'side');
        if (typeof side === 'undefined')
            side = this.safeString (trade, 'maker_side');
        let amount = this.safeFloat (trade, 'amount');
        if (typeof amount === 'undefined')
            amount = this.safeFloat (trade, 'major');
        if (typeof amount !== 'undefined')
            amount = Math.abs (amount);
        let fee = undefined;
        let feeCost = this.safeFloat (trade, 'fees_amount');
        if (typeof feeCost !== 'undefined') {
            let feeCurrency = this.safeString (trade, 'fees_currency');
            if (typeof feeCurrency !== 'undefined') {
                if (feeCurrency in this.currencies_by_id)
                    feeCurrency = this.currencies_by_id[feeCurrency]['code'];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        let cost = this.safeFloat (trade, 'minor');
        if (typeof cost !== 'undefined')
            cost = Math.abs (cost);
        let price = this.safeFloat (trade, 'price');
        let orderId = this.safeString (trade, 'oid');
        return {
            'id': trade['tid'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'book': market['id'],
        }, params));
        return this.parseTrades (response['payload'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = 25, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        // the don't support fetching trades starting from a date yet
        // use the `marker` extra param for that
        // this is not a typo, the variable name is 'marker' (don't confuse with 'market')
        let markerInParams = ('marker' in params);
        // warn the user with an exception if the user wants to filter
        // starting from since timestamp, but does not set the trade id with an extra 'marker' param
        if ((typeof since !== 'undefined') && !markerInParams)
            throw ExchangeError (this.id + ' fetchMyTrades does not support fetching trades starting from a timestamp with the `since` argument, use the `marker` extra param to filter starting from an integer trade id');
        // convert it to an integer unconditionally
        if (markerInParams)
            params = this.extend (params, {
                'marker': parseInt (params['marker']),
            });
        let request = {
            'book': market['id'],
            'limit': limit, // default = 25, max = 100
            // 'sort': 'desc', // default = desc
            // 'marker': id, // integer id to start from
        };
        let response = await this.privateGetUserTrades (this.extend (request, params));
        return this.parseTrades (response['payload'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'book': this.marketId (symbol),
            'side': side,
            'type': type,
            'major': this.amountToPrecision (symbol, amount),
        };
        if (type === 'limit')
            order['price'] = this.priceToPrecision (symbol, price);
        let response = await this.privatePostOrders (this.extend (order, params));
        return {
            'info': response,
            'id': response['payload']['oid'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateDeleteOrdersOid ({ 'oid': id });
    }

    parseOrderStatus (status) {
        let statuses = {
            'partial-fill': 'open', // this is a common substitution in ccxt
        };
        if (status in statuses)
            return statuses['status'];
        return status;
    }

    parseOrder (order, market = undefined) {
        let side = order['side'];
        let status = this.parseOrderStatus (order['status']);
        let symbol = undefined;
        if (typeof market === 'undefined') {
            let marketId = order['book'];
            if (marketId in this.markets_by_id)
                market = this.markets_by_id[marketId];
        }
        if (market)
            symbol = market['symbol'];
        let orderType = order['type'];
        let timestamp = this.parse8601 (order['created_at']);
        let amount = parseFloat (order['original_amount']);
        let remaining = parseFloat (order['unfilled_amount']);
        let filled = amount - remaining;
        let result = {
            'info': order,
            'id': order['oid'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'price': this.safeFloat (order, 'price'),
            'amount': amount,
            'cost': undefined,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 25, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        // the don't support fetching trades starting from a date yet
        // use the `marker` extra param for that
        // this is not a typo, the variable name is 'marker' (don't confuse with 'market')
        let markerInParams = ('marker' in params);
        // warn the user with an exception if the user wants to filter
        // starting from since timestamp, but does not set the trade id with an extra 'marker' param
        if ((typeof since !== 'undefined') && !markerInParams)
            throw ExchangeError (this.id + ' fetchOpenOrders does not support fetching orders starting from a timestamp with the `since` argument, use the `marker` extra param to filter starting from an integer trade id');
        // convert it to an integer unconditionally
        if (markerInParams)
            params = this.extend (params, {
                'marker': parseInt (params['marker']),
            });
        let request = {
            'book': market['id'],
            'limit': limit, // default = 25, max = 100
            // 'sort': 'desc', // default = desc
            // 'marker': id, // integer id to start from
        };
        let response = await this.privateGetOpenOrders (this.extend (request, params));
        let orders = this.parseOrders (response['payload'], market, since, limit);
        return orders;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length)
                endpoint += '?' + this.urlencode (query);
        }
        let url = this.urls['api'] + endpoint;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let request = [ nonce, method, endpoint ].join ('');
            if (method !== 'GET') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    request += body;
                }
            }
            let signature = this.hmac (this.encode (request), this.encode (this.secret));
            let auth = this.apiKey + ':' + nonce + ':' + signature;
            headers = {
                'Authorization': 'Bitso ' + auth,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            if ('success' in response) {
                //
                //     {"success":false,"error":{"code":104,"message":"Cannot perform request - nonce must be higher than 1520307203724237"}}
                //
                let success = this.safeValue (response, 'success', false);
                if (typeof success === 'string') {
                    if ((success === 'true') || (success === '1'))
                        success = true;
                    else
                        success = false;
                }
                if (!success) {
                    const feedback = this.id + ' ' + this.json (response);
                    const error = this.safeValue (response, 'error');
                    if (typeof error === 'undefined')
                        throw new ExchangeError (feedback);
                    const code = this.safeString (error, 'code');
                    const exceptions = this.exceptions;
                    if (code in exceptions) {
                        throw new exceptions[code] (feedback);
                    } else {
                        throw new ExchangeError (feedback);
                    }
                }
            }
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('success' in response)
            if (response['success'])
                return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }
};
