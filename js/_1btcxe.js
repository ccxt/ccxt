'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class _1btcxe extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': '_1btcxe',
            'name': '1BTCXE',
            'countries': [ 'PA' ], // Panama
            'comment': 'Crypto Capital API',
            'has': {
                'CORS': true,
                'withdraw': true,
            },
            'timeframes': {
                '1d': '1year',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766049-2b294408-5ecc-11e7-85cc-adaff013dc1a.jpg',
                'api': 'https://1btcxe.com/api',
                'www': 'https://1btcxe.com',
                'doc': 'https://1btcxe.com/api-docs.php',
            },
            'api': {
                'public': {
                    'get': [
                        'stats',
                        'historical-prices',
                        'order-book',
                        'transactions',
                    ],
                },
                'private': {
                    'post': [
                        'balances-and-info',
                        'open-orders',
                        'user-transactions',
                        'btc-deposit-address/get',
                        'btc-deposit-address/new',
                        'deposits/get',
                        'withdrawals/get',
                        'orders/new',
                        'orders/edit',
                        'orders/cancel',
                        'orders/status',
                        'withdrawals/new',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        return [
            { 'id': 'USD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'BTC', 'quoteId': 'USD' },
            { 'id': 'EUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', 'baseId': 'BTC', 'quoteId': 'EUR' },
            { 'id': 'CNY', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY', 'baseId': 'BTC', 'quoteId': 'CNY' },
            { 'id': 'RUB', 'symbol': 'BTC/RUB', 'base': 'BTC', 'quote': 'RUB', 'baseId': 'BTC', 'quoteId': 'RUB' },
            { 'id': 'CHF', 'symbol': 'BTC/CHF', 'base': 'BTC', 'quote': 'CHF', 'baseId': 'BTC', 'quoteId': 'CHF' },
            { 'id': 'JPY', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY', 'baseId': 'BTC', 'quoteId': 'JPY' },
            { 'id': 'GBP', 'symbol': 'BTC/GBP', 'base': 'BTC', 'quote': 'GBP', 'baseId': 'BTC', 'quoteId': 'GBP' },
            { 'id': 'CAD', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD', 'baseId': 'BTC', 'quoteId': 'CAD' },
            { 'id': 'AUD', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD', 'baseId': 'BTC', 'quoteId': 'AUD' },
            { 'id': 'AED', 'symbol': 'BTC/AED', 'base': 'BTC', 'quote': 'AED', 'baseId': 'BTC', 'quoteId': 'AED' },
            { 'id': 'BGN', 'symbol': 'BTC/BGN', 'base': 'BTC', 'quote': 'BGN', 'baseId': 'BTC', 'quoteId': 'BGN' },
            { 'id': 'CZK', 'symbol': 'BTC/CZK', 'base': 'BTC', 'quote': 'CZK', 'baseId': 'BTC', 'quoteId': 'CZK' },
            { 'id': 'DKK', 'symbol': 'BTC/DKK', 'base': 'BTC', 'quote': 'DKK', 'baseId': 'BTC', 'quoteId': 'DKK' },
            { 'id': 'HKD', 'symbol': 'BTC/HKD', 'base': 'BTC', 'quote': 'HKD', 'baseId': 'BTC', 'quoteId': 'HKD' },
            { 'id': 'HRK', 'symbol': 'BTC/HRK', 'base': 'BTC', 'quote': 'HRK', 'baseId': 'BTC', 'quoteId': 'HRK' },
            { 'id': 'HUF', 'symbol': 'BTC/HUF', 'base': 'BTC', 'quote': 'HUF', 'baseId': 'BTC', 'quoteId': 'HUF' },
            { 'id': 'ILS', 'symbol': 'BTC/ILS', 'base': 'BTC', 'quote': 'ILS', 'baseId': 'BTC', 'quoteId': 'ILS' },
            { 'id': 'INR', 'symbol': 'BTC/INR', 'base': 'BTC', 'quote': 'INR', 'baseId': 'BTC', 'quoteId': 'INR' },
            { 'id': 'MUR', 'symbol': 'BTC/MUR', 'base': 'BTC', 'quote': 'MUR', 'baseId': 'BTC', 'quoteId': 'MUR' },
            { 'id': 'MXN', 'symbol': 'BTC/MXN', 'base': 'BTC', 'quote': 'MXN', 'baseId': 'BTC', 'quoteId': 'MXN' },
            { 'id': 'NOK', 'symbol': 'BTC/NOK', 'base': 'BTC', 'quote': 'NOK', 'baseId': 'BTC', 'quoteId': 'NOK' },
            { 'id': 'NZD', 'symbol': 'BTC/NZD', 'base': 'BTC', 'quote': 'NZD', 'baseId': 'BTC', 'quoteId': 'NZD' },
            { 'id': 'PLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN', 'baseId': 'BTC', 'quoteId': 'PLN' },
            { 'id': 'RON', 'symbol': 'BTC/RON', 'base': 'BTC', 'quote': 'RON', 'baseId': 'BTC', 'quoteId': 'RON' },
            { 'id': 'SEK', 'symbol': 'BTC/SEK', 'base': 'BTC', 'quote': 'SEK', 'baseId': 'BTC', 'quoteId': 'SEK' },
            { 'id': 'SGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD', 'baseId': 'BTC', 'quoteId': 'SGD' },
            { 'id': 'THB', 'symbol': 'BTC/THB', 'base': 'BTC', 'quote': 'THB', 'baseId': 'BTC', 'quoteId': 'THB' },
            { 'id': 'TRY', 'symbol': 'BTC/TRY', 'base': 'BTC', 'quote': 'TRY', 'baseId': 'BTC', 'quoteId': 'TRY' },
            { 'id': 'ZAR', 'symbol': 'BTC/ZAR', 'base': 'BTC', 'quote': 'ZAR', 'baseId': 'BTC', 'quoteId': 'ZAR' },
        ];
    }

    async fetchBalance (params = {}) {
        const response = await this.privatePostBalancesAndInfo (params);
        const balance = response['balances-and-info'];
        const result = { 'info': balance };
        const codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const currency = this.currency (code);
            const currencyId = currency['id'];
            const account = this.account ();
            account['free'] = this.safeFloat (balance['available'], currencyId);
            account['used'] = this.safeFloat (balance['on_hold'], currencyId);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        const request = {
            'currency': this.marketId (symbol),
        };
        const response = await this.publicGetOrderBook (this.extend (request, params));
        return this.parseOrderBook (response['order-book'], undefined, 'bid', 'ask', 'price', 'order_amount');
    }

    async fetchTicker (symbol, params = {}) {
        const request = {
            'currency': this.marketId (symbol),
        };
        const response = await this.publicGetStats (this.extend (request, params));
        const ticker = this.safeValue (response, 'stats', {});
        const last = this.safeFloat (ticker, 'last_price');
        return {
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeFloat (ticker, 'max'),
            'low': this.safeFloat (ticker, 'min'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'daily_change'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'total_btc_traded'),
            'info': ticker,
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        return [
            this.parse8601 (ohlcv['date'] + ' 00:00:00'),
            undefined,
            undefined,
            undefined,
            this.safeFloat (ohlcv, 'price'),
            undefined,
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        const market = this.market (symbol);
        const response = await this.publicGetHistoricalPrices (this.extend ({
            'currency': market['id'],
            'timeframe': this.timeframes[timeframe],
        }, params));
        const ohlcvs = this.toArray (this.omit (response['historical-prices'], 'request_currency'));
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        const id = this.safeString (trade, 'id');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const type = undefined;
        const side = this.safeString (trade, 'maker_type');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTransactions (this.extend (request, params));
        const trades = this.toArray (this.omit (response['transactions'], 'request_currency'));
        return this.parseTrades (trades, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        const request = {
            'side': side,
            'type': type,
            'currency': this.marketId (symbol),
            'amount': amount,
        };
        if (type === 'limit') {
            request['limit_price'] = price;
        }
        const result = await this.privatePostOrdersNew (this.extend (request, params));
        return {
            'info': result,
            'id': result,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'id': id,
        };
        return await this.privatePostOrdersCancel (this.extend (request, params));
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': parseFloat (amount),
            'address': address,
        };
        const response = await this.privatePostWithdrawalsNew (this.extend (request, params));
        return {
            'info': response,
            'id': response['result']['uuid'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (this.id === 'cryptocapital') {
            throw new ExchangeError (this.id + ' is an abstract base API for _1btcxe');
        }
        let url = this.urls['api'] + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const query = this.extend ({
                'api_key': this.apiKey,
                'nonce': this.nonce (),
            }, params);
            const request = this.json (query);
            query['signature'] = this.hmac (this.encode (request), this.encode (this.secret));
            body = this.json (query);
            headers = { 'Content-Type': 'application/json' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if (typeof response === 'string') {
            if (response.indexOf ('Maintenance') >= 0) {
                throw new ExchangeNotAvailable (this.id + ' on maintenance');
            }
        }
        if ('errors' in response) {
            let errors = [];
            for (let e = 0; e < response['errors'].length; e++) {
                const error = response['errors'][e];
                errors.push (error['code'] + ': ' + error['message']);
            }
            errors = errors.join (' ');
            throw new ExchangeError (this.id + ' ' + errors);
        }
        return response;
    }
};
