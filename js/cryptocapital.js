"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError, InsufficientFunds, OrderNotFound, DDoSProtection } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class cryptocapital extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cryptocapital',
            'name': 'Crypto Capital',
            'comment': 'Crypto Capital API',
            'countries': 'PA', // Panama
            'hasFetchOHLCV': true,
            'hasWithdraw': true,
            'timeframes': {
                '1d': '1year',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27993158-7a13f140-64ac-11e7-89cc-a3b441f0b0f8.jpg',
                'www': 'https://cryptocapital.co',
                'doc': 'https://github.com/cryptocap',
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
        })
    }

    async fetchBalance (params = {}) {
        let response = await this.privatePostBalancesAndInfo ();
        let balance = response['balances-and-info'];
        let result = { 'info': balance };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            account['free'] = this.safeFloat (balance['available'], currency, 0.0);
            account['used'] = this.safeFloat (balance['on_hold'], currency, 0.0);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
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

    async fetchTrades (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTransactions (this.extend ({
            'currency': market['id'],
        }, params));
        let trades = this.omit (response['transactions'], 'request_currency');
        return this.parseTrades (trades, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let order = {
            'side': side,
            'type': type,
            'currency': this.marketId (symbol),
            'amount': amount,
        };
        if (type == 'limit')
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

    async withdraw (currency, amount, address, params = {}) {
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
        if (this.id == 'cryptocapital')
            throw new ExchangeError (this.id + ' is an abstract base API for _1btcxe');
        let url = this.urls['api'] + '/' + path;
        if (api == 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
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
}
