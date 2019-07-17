'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { DDoSProtection, ExchangeError, ExchangeNotAvailable, InvalidOrder, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class blockbid extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'blockbid',
            'name': 'Blockbid',
            'countries': [ 'AU' ],
            'rateLimit': 1000,
            'has': {
                'CORS': false,
                'cancelOrders': true,
                'fetchDepositAddress': true,
                'fetchL2OrderBook': false, // this probably needs to be implemented
                'fetchDeposits': false,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '2h': 120,
                '4h': 240,
                '6h': 360,
                '12h': 720,
                '1d': 1440,
                '3d': 4280,
                '1w': 10080,
            },
            'urls': {
                'api': 'https://api.blockbid.io',
                'www': 'https://platform.blockbid.io',
                'doc': 'https://docs.blockbid.io',
                'logo': 'https://platform.blockbid.io/static/logo.svg',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': false,
                'login': false,
                'password': false,
                'twofa': false,
                'privateKey': false,
                'walletAddress': false,
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'tickers',
                        'ohlc',
                        'orderbook',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'identity',
                        'balances',
                        'balances/{currency}',
                        'addresses',
                        'deposits',
                        'deposits/{id}',
                        'trades/my',
                        'orders',
                        'orders/{id}',
                        'withdraws/fiat',
                        'withdraws/crypto',
                    ],
                    'post': [
                        'orders',
                        'withdraws/fiat',
                        'withdraw/crypto',
                    ],
                    'delete': [
                        'orders',
                        'orders/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.1,
                    'taker': 0.1,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'supportedFiat': [
                'AUD',
                'USD',
                'EUR',
                'JPY',
            ],
            'exceptions': {
                'exact': {
                    'server_error': ExchangeNotAvailable,
                    'internal_error': ExchangeError,
                    'view_order_failed': OrderNotFound,
                    'order_failed': InvalidOrder,
                    'rate_limited': DDoSProtection,
                },
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetMarkets ();
        //
        //     [
        //         {"id":"btcaud","name":"BTC/AUD"},
        //         {"id":"ethaud","name":"ETH/AUD"},
        //         ...
        //     ]
        //
        let result = [];
        for (let i = 0; i < response.length; i++) {
            let market = response[i];
            let id = market['id'];
            let name = market['name'];
            let pairArray = name.split ('/');
            let baseId = pairArray[0];
            let quoteId = pairArray[1];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': undefined,
            };
            let active = this.safeValue (market, 'is_active', true);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId.toLowerCase (),
                'quoteId': quoteId.toLowerCase (),
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'base_min_size'),
                        'max': this.safeFloat (market, 'base_max_size'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {"timestamp":"2018-11-08T23:32:28.000Z","market":"btcaud","last":8821.15382691}
        //
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (ticker, 'market');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                let pairArray = marketId.split ('-');
                let baseId = pairArray[0];
                let quoteId = pairArray[1];
                let base = this.commonCurrencyCode (baseId);
                let quote = this.commonCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let timestamp = this.parse8601 (this.safeString (ticker, 'timestamp'));
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.fetchTickers (undefined, params);
        let ticker = this.safeValue (tickers, symbol);
        if (ticker === undefined) {
            throw new ExchangeError (this.id + ' fetchTicker could not fetch ticker for market symbol ' + symbol);
        }
        return ticker;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTickers (params);
        //
        //     [
        //         {"timestamp":"2018-11-08T23:32:28.000Z","market":"btcaud","last":8821.15382691},
        //         {"timestamp":"2018-11-08T23:32:28.000Z","market":"ethaud","last":291.45242072},
        //         ...
        //     ]
        //
        let result = [];
        for (let i = 0; i < response.length; i++) {
            result.push (this.parseTicker (response[i]));
        }
        return this.indexBy (result, 'symbol');
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'market': this.marketId (symbol),
        };
        if (typeof limit !== 'undefined') {
            request['asks_limit'] = limit;
            request['bids_limit'] = limit;
        }
        let response = await this.publicGetOrderbook (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 'price', 'volume');
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let timestamp = this.parse8601 (this.safeString (trade, 'createdAt'));
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'volume');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        let side = this.safeString (trade, 'side');
        let id = this.safeString (trade, 'id');
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'],
            'limit': limit,
        };
        let response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.parse8601 (this.safeString (ohlcv, 'timestamp')),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (typeof since !== 'undefined') {
            request['timestamp'] = since;
        }
        let response = await this.publicGetOhlc (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalances (params);
        let result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            let balance = response[i];
            let currency = balance['currency'].toUpperCase();
            if (currency in this.currencies_by_id) {
                currency = this.currencies_by_id[currency]['code'];
            }
            let account = {
                'free': balance['available'],
                'used': balance['locked'],
                'total': balance['total'],
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            'filled': 'closed',
            'rejected': 'closed',
            'partially_filled': 'open',
            'pending_cancellation': 'open',
            'pending_modification': 'open',
            'open': 'open',
            'new': 'open',
            'queued': 'open',
            'cancelled': 'canceled',
            'triggered': 'triggered',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'id');
        let symbol = undefined;
        const marketId = this.safeString (order, 'market');
        market = this.safeValue (this.markets_by_id, marketId, market);
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat (order, 'price');
        const average = this.safeFloat (order, 'averagePrice');
        const amount = this.safeFloat (order, 'volume');
        const filled = this.safeFloat (order, 'executedVolume');
        const remaining = this.safeFloat (order, 'remainingVolume');
        let cost = undefined;
        if (average !== undefined) {
            if (filled !== undefined) {
                cost = average * filled;
            } else {
                cost = average * amount;
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        let side = this.safeString (order, 'side');
        if (side === 'bid') {
            side = 'buy';
        } else if (side === 'ask') {
            side = 'sell';
        }
        const type = this.safeString (order, 'orderType');
        const timestamp = this.parse8601 (this.safeString (order, 'createdAt'));
        const trades = undefined; // not to be confused with trades count
        return {
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'trades': trades,
            'remaining': remaining,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePostOrders';
        const order = {
            'side': side,
            'volume': amount,
        };
        if (type !== undefined) {
            order['orderType'] = type;
        }
        if (price !== undefined) {
            order['price'] = price;
        }
        let request = {
            'market': market['id'],
            'orders': [ order ],
        };
        let response = await this[method] (this.extend (request, params));
        return this.parseOrder (response[0], market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateDeleteOrdersId (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (this.extend (response, { 'id': id }));
    }

    async cancelOrders (side = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (typeof side !== 'undefined') {
            request['side'] = side;
        }
        let response = await this.privateDeleteOrders (this.extend (request, params));
        return this.parseOrders (response);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        let response = await this.privateGetOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'],
        };
        if (typeof limit !== 'undefined') {
            request['limit'] = limit;
        }
        let result = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (result, undefined, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'],
        };
        if (typeof limit !== 'undefined') {
            request['limit'] = limit;
        }
        let response = await this.privateGetTradesMy (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'currency': currency['id'],
        };
        if (typeof limit !== 'undefined') {
            request['limit'] = limit;
        }
        let currencyCode = currency['code'];
        let isFiat = false;
        for (let i = 0; i < this.supportedFiat.length; i++) {
            if (currencyCode === this.supportedFiat[i]) {
                isFiat = true;
            }
        }
        let method = isFiat ? 'privateGetWithdrawsFiat' : 'privateGetWithdrawsCrypto';
        let response = await this[method] (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransactionStatuses (status) {
        const statuses = {
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeString (transaction, 'withdrawID');
        const txid = this.safeString (transaction, 'txid');
        const timestamp = this.parse8601 (this.safeString (transaction, 'timeCreated'));
        let code = undefined;
        const currencyId = this.safeString (transaction, 'currency');
        const address = this.safeString (transaction, 'address');
        currency = this.safeValue (this.currencies_by_id, currencyId);
        if (currency !== undefined) {
            code = currency['code'];
        } else {
            code = this.commonCurrencyCode (currencyId);
        }
        const amount = this.safeFloat (transaction, 'amount');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        const updated = this.safeString (transaction, 'timeUpdated');
        const fee = {
            'cost': this.safeFloat (transaction, 'fee'),
            'currency': code,
            'rate': undefined,
        };
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'tag': undefined, // or is it defined?
            'type': undefined, // direction of the transaction, ('deposit' | 'withdraw')
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    sign (path, api = 'public', method = 'GET', params = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let body, query;
        if (method === 'GET') {
            query = this.omit (params, this.extractParams (path));
            query = this.urlencode (query);
            if (query.length) {
                url += '?' + query;
            }
        } else if (method !== 'DELETE') {
          body = params;
        }
        let headers = { 'Content-Type': 'application/json' };
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            nonce = nonce.toString ();
            let encodedApiKey = this.encode (this.apiKey);
            let encodedNonce = this.encode (nonce);
            let rawSignature = this.stringToBase64 (encodedApiKey) + this.stringToBase64 (encodedNonce);
            let stringifyedPayload = '';
            if (body && Object.keys(body).length > 0) {
              stringifyedPayload = this.encode(JSON.stringify(body));
            }
            body = JSON.stringify(body);
            rawSignature = rawSignature + this.stringToBase64 (stringifyedPayload);
            let encodedSecret = this.encode (this.secret);
            const signature = this.hmac (rawSignature, encodedSecret, 'sha384', 'base64');
            headers['X-Blockbid-Signature'] = signature;
            headers['X-Blockbid-Nonce'] = nonce;
            headers['X-Blockbid-Api-Key'] = this.apiKey;
        }

        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (!this.isJsonEncodedObject (body))
            return; // fallback to default error handler
        const response = JSON.parse (body);
        const error = this.safeValue (response, 'error');
        if (error !== undefined) {
            const feedback = this.id + ' ' + body;
            const code = this.safeString (error, 'name');
            const exact = this.exceptions['exact'];
            if (code in exact) {
                throw new exact[code] (feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }

    nonce () {
        return this.milliseconds ();
    }
};
