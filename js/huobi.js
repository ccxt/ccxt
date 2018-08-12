'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class huobi extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'huobi',
            'name': 'Huobi',
            'countries': [ 'CN' ],
            'rateLimit': 2000,
            'version': 'v3',
            'has': {
                'CORS': false,
                'fetchOHLCV': true,
            },
            'timeframes': {
                '1m': '001',
                '5m': '005',
                '15m': '015',
                '30m': '030',
                '1h': '060',
                '1d': '100',
                '1w': '200',
                '1M': '300',
                '1y': '400',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
                'api': 'http://api.huobi.com',
                'www': 'https://www.huobi.com',
                'doc': 'https://github.com/huobiapi/API_Docs_en/wiki',
            },
            'api': {
                'staticmarket': {
                    'get': [
                        '{id}_kline_{period}',
                        'ticker_{id}',
                        'depth_{id}',
                        'depth_{id}_{length}',
                        'detail_{id}',
                    ],
                },
                'usdmarket': {
                    'get': [
                        '{id}_kline_{period}',
                        'ticker_{id}',
                        'depth_{id}',
                        'depth_{id}_{length}',
                        'detail_{id}',
                    ],
                },
                'trade': {
                    'post': [
                        'get_account_info',
                        'get_orders',
                        'order_info',
                        'buy',
                        'sell',
                        'buy_market',
                        'sell_market',
                        'cancel_order',
                        'get_new_deal_orders',
                        'get_order_id_by_trade_id',
                        'withdraw_coin',
                        'cancel_withdraw_coin',
                        'get_withdraw_coin_result',
                        'transfer',
                        'loan',
                        'repayment',
                        'get_loan_available',
                        'get_loans',
                    ],
                },
            },
            'markets': {
                'BTC/CNY': { 'id': 'btc', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY', 'type': 'staticmarket', 'coinType': 1 },
                'LTC/CNY': { 'id': 'ltc', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY', 'type': 'staticmarket', 'coinType': 2 },
                // 'BTC/USD': { 'id': 'btc', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'type': 'usdmarket',    'coinType': 1 },
            },
        });
    }

    async fetchBalance (params = {}) {
        let balances = await this.tradePostGetAccountInfo ();
        let result = { 'info': balances };
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let lowercase = currency.toLowerCase ();
            let account = this.account ();
            let available = 'available_' + lowercase + '_display';
            let frozen = 'frozen_' + lowercase + '_display';
            let loan = 'loan_' + lowercase + '_display';
            if (available in balances)
                account['free'] = parseFloat (balances[available]);
            if (frozen in balances)
                account['used'] = parseFloat (balances[frozen]);
            if (loan in balances)
                account['used'] = this.sum (account['used'], parseFloat (balances[loan]));
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let method = market['type'] + 'GetDepthId';
        let orderbook = await this[method] (this.extend ({ 'id': market['id'] }, params));
        return this.parseOrderBook (orderbook);
    }

    async fetchTicker (symbol, params = {}) {
        let market = this.market (symbol);
        let method = market['type'] + 'GetTickerId';
        let response = await this[method] (this.extend ({
            'id': market['id'],
        }, params));
        let ticker = response['ticker'];
        let timestamp = parseInt (response['time']) * 1000;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'ask': this.safeFloat (ticker, 'sell'),
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'last'),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'vol'),
            'info': ticker,
        };
    }

    parseTrade (trade, market) {
        let timestamp = trade['ts'];
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['direction'],
            'price': trade['price'],
            'amount': trade['amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let method = market['type'] + 'GetDetailId';
        let response = await this[method] (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTrades (response['trades'], market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        // not implemented yet
        return [
            ohlcv[0],
            ohlcv[1],
            ohlcv[2],
            ohlcv[3],
            ohlcv[4],
            ohlcv[6],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let method = market['type'] + 'GetIdKlinePeriod';
        let ohlcvs = await this[method] (this.extend ({
            'id': market['id'],
            'period': this.timeframes[timeframe],
        }, params));
        return ohlcvs;
        // return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let market = this.market (symbol);
        let method = 'tradePost' + this.capitalize (side);
        let order = {
            'coin_type': market['coinType'],
            'amount': amount,
            'market': market['quote'].toLowerCase (),
        };
        if (type === 'limit')
            order['price'] = price;
        else
            method += this.capitalize (type);
        let response = this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.tradePostCancelOrder ({ 'id': id });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'];
        if (api === 'trade') {
            this.checkRequiredCredentials ();
            url += '/api' + this.version;
            let query = this.keysort (this.extend ({
                'method': path,
                'access_key': this.apiKey,
                'created': this.nonce (),
            }, params));
            let queryString = this.urlencode (this.omit (query, 'market'));
            // secret key must be appended to the query before signing
            queryString += '&secret_key=' + this.secret;
            query['sign'] = this.hash (this.encode (queryString));
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        } else {
            url += '/' + api + '/' + this.implodeParams (path, params) + '_json.js';
            let query = this.omit (params, this.extractParams (path));
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'trade', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('status' in response)
            if (response['status'] === 'error')
                throw new ExchangeError (this.id + ' ' + this.json (response));
        if ('code' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
};
