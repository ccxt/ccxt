'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class _1btcxe extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': '_1btcxe',
            'name': '1BTCXE',
            'countries': 'PA', // Panama
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
            'markets': {
                'BTC/AED': {'base': 'BTC', 'id': 'AED', 'quote': 'AED', 'symbol': 'BTC/AED'},
                'BTC/AUD': {'base': 'BTC', 'id': 'AUD', 'quote': 'AUD', 'symbol': 'BTC/AUD'},
                'BTC/BGN': {'base': 'BTC', 'id': 'BGN', 'quote': 'BGN', 'symbol': 'BTC/BGN'},
                'BTC/CAD': {'base': 'BTC', 'id': 'CAD', 'quote': 'CAD', 'symbol': 'BTC/CAD'},
                'BTC/CHF': {'base': 'BTC', 'id': 'CHF', 'quote': 'CHF', 'symbol': 'BTC/CHF'},
                'BTC/CNY': {'base': 'BTC', 'id': 'CNY', 'quote': 'CNY', 'symbol': 'BTC/CNY'},
                'BTC/CZK': {'base': 'BTC', 'id': 'CZK', 'quote': 'CZK', 'symbol': 'BTC/CZK'},
                'BTC/DKK': {'base': 'BTC', 'id': 'DKK', 'quote': 'DKK', 'symbol': 'BTC/DKK'},
                'BTC/EUR': {'base': 'BTC', 'id': 'EUR', 'quote': 'EUR', 'symbol': 'BTC/EUR'},
                'BTC/GBP': {'base': 'BTC', 'id': 'GBP', 'quote': 'GBP', 'symbol': 'BTC/GBP'},
                'BTC/HKD': {'base': 'BTC', 'id': 'HKD', 'quote': 'HKD', 'symbol': 'BTC/HKD'},
                'BTC/HRK': {'base': 'BTC', 'id': 'HRK', 'quote': 'HRK', 'symbol': 'BTC/HRK'},
                'BTC/HUF': {'base': 'BTC', 'id': 'HUF', 'quote': 'HUF', 'symbol': 'BTC/HUF'},
                'BTC/ILS': {'base': 'BTC', 'id': 'ILS', 'quote': 'ILS', 'symbol': 'BTC/ILS'},
                'BTC/INR': {'base': 'BTC', 'id': 'INR', 'quote': 'INR', 'symbol': 'BTC/INR'},
                'BTC/JPY': {'base': 'BTC', 'id': 'JPY', 'quote': 'JPY', 'symbol': 'BTC/JPY'},
                'BTC/MUR': {'base': 'BTC', 'id': 'MUR', 'quote': 'MUR', 'symbol': 'BTC/MUR'},
                'BTC/MXN': {'base': 'BTC', 'id': 'MXN', 'quote': 'MXN', 'symbol': 'BTC/MXN'},
                'BTC/NOK': {'base': 'BTC', 'id': 'NOK', 'quote': 'NOK', 'symbol': 'BTC/NOK'},
                'BTC/NZD': {'base': 'BTC', 'id': 'NZD', 'quote': 'NZD', 'symbol': 'BTC/NZD'},
                'BTC/PLN': {'base': 'BTC', 'id': 'PLN', 'quote': 'PLN', 'symbol': 'BTC/PLN'},
                'BTC/RON': {'base': 'BTC', 'id': 'RON', 'quote': 'RON', 'symbol': 'BTC/RON'},
                'BTC/RUB': {'base': 'BTC', 'id': 'RUB', 'quote': 'RUB', 'symbol': 'BTC/RUB'},
                'BTC/SEK': {'base': 'BTC', 'id': 'SEK', 'quote': 'SEK', 'symbol': 'BTC/SEK'},
                'BTC/SGD': {'base': 'BTC', 'id': 'SGD', 'quote': 'SGD', 'symbol': 'BTC/SGD'},
                'BTC/THB': {'base': 'BTC', 'id': 'THB', 'quote': 'THB', 'symbol': 'BTC/THB'},
                'BTC/TRY': {'base': 'BTC', 'id': 'TRY', 'quote': 'TRY', 'symbol': 'BTC/TRY'},
                'BTC/USD': {'base': 'BTC', 'id': 'USD', 'quote': 'USD', 'symbol': 'BTC/USD'},
                'BTC/ZAR': {'base': 'BTC', 'id': 'ZAR', 'quote': 'ZAR', 'symbol': 'BTC/ZAR'},
            }
        });
    }

    async fetchBalance (params = {}) {
        let response = await this.privatePostBalancesAndInfo ();
        let balance = response['balances-and-info'];
        let result = { 'info': balance };
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let account = this.account ();
            account['free'] = this.safeFloat (balance['available'], currency, 0.0);
            account['used'] = this.safeFloat (balance['on_hold'], currency, 0.0);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let response = await this.publicGetOrderBook (this.extend ({
            'currency': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (response['order-book'], undefined, 'bid', 'ask', 'price', 'order_amount');
    }

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetStats (this.extend ({
            'currency': this.marketId (symbol),
        }, params));
        let ticker = response['stats'];
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['max']),
            'low': parseFloat (ticker['min']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': undefined,
            'open': parseFloat (ticker['open']),
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last_price']),
            'change': parseFloat (ticker['daily_change']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': parseFloat (ticker['total_btc_traded']),
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        return [
            this.parse8601 (ohlcv['date'] + ' 00:00:00'),
            undefined,
            undefined,
            undefined,
            parseFloat (ohlcv['price']),
            undefined,
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetHistoricalPrices (this.extend ({
            'currency': market['id'],
            'timeframe': this.timeframes[timeframe],
        }, params));
        let ohlcvs = this.omit (response['historical-prices'], 'request_currency');
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['timestamp']) * 1000;
        return {
            'id': trade['id'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': trade['maker_type'],
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTransactions (this.extend ({
            'currency': market['id'],
        }, params));
        let trades = this.omit (response['transactions'], 'request_currency');
        return this.parseTrades (trades, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let order = {
            'side': side,
            'type': type,
            'currency': this.marketId (symbol),
            'amount': amount,
        };
        if (type === 'limit')
            order['limit_price'] = price;
        let result = await this.privatePostOrdersNew (this.extend (order, params));
        return {
            'info': result,
            'id': result,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostOrdersCancel ({ 'id': id });
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostWithdrawalsNew (this.extend ({
            'currency': currency,
            'amount': parseFloat (amount),
            'address': address,
        }, params));
        return {
            'info': response,
            'id': response['result']['uuid'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (this.id === 'cryptocapital')
            throw new ExchangeError (this.id + ' is an abstract base API for _1btcxe');
        let url = this.urls['api'] + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            this.checkRequiredCredentials ();
            let query = this.extend ({
                'api_key': this.apiKey,
                'nonce': this.nonce (),
            }, params);
            let request = this.json (query);
            query['signature'] = this.hmac (this.encode (request), this.encode (this.secret));
            body = this.json (query);
            headers = { 'Content-Type': 'application/json' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('errors' in response) {
            let errors = [];
            for (let e = 0; e < response['errors'].length; e++) {
                let error = response['errors'][e];
                errors.push (error['code'] + ': ' + error['message']);
            }
            errors = errors.join (' ');
            throw new ExchangeError (this.id + ' ' + errors);
        }
        return response;
    }
};
