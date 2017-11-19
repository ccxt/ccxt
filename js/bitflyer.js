"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')

//  ---------------------------------------------------------------------------

module.exports = class bitflyer extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitflyer',
            'name': 'bitFlyer',
            'countries': 'JP',
            'version': 'v1',
            'rateLimit': 500,
            'hasCORS': false,
            'hasWithdraw': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28051642-56154182-660e-11e7-9b0d-6042d1e6edd8.jpg',
                'api': 'https://api.bitflyer.jp',
                'www': 'https://bitflyer.jp',
                'doc': 'https://bitflyer.jp/API',
            },
            'api': {
                'public': {
                    'get': [
                        'getmarkets',    // or 'markets'
                        'getboard',      // or 'board'
                        'getticker',     // or 'ticker'
                        'getexecutions', // or 'executions'
                        'gethealth',
                        'getchats',
                    ],
                },
                'private': {
                    'get': [
                        'getpermissions',
                        'getbalance',
                        'getcollateral',
                        'getcollateralaccounts',
                        'getaddresses',
                        'getcoinins',
                        'getcoinouts',
                        'getbankaccounts',
                        'getdeposits',
                        'getwithdrawals',
                        'getchildorders',
                        'getparentorders',
                        'getparentorder',
                        'getexecutions',
                        'getpositions',
                        'gettradingcommission',
                    ],
                    'post': [
                        'sendcoin',
                        'withdraw',
                        'sendchildorder',
                        'cancelchildorder',
                        'sendparentorder',
                        'cancelparentorder',
                        'cancelallchildorders',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.25 / 100,
                    'taker': 0.25 / 100,
                },
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['product_code'];
            let currencies = id.split ('_');
            let base = undefined;
            let quote = undefined;
            let symbol = id;
            let numCurrencies = currencies.length;
            if (numCurrencies == 1) {
                base = symbol.slice (0, 3);
                quote = symbol.slice (3, 6);
            } else if (numCurrencies == 2) {
                base = currencies[0];
                quote = currencies[1];
                symbol = base + '/' + quote;
            } else {
                base = currencies[1];
                quote = currencies[2];
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalance ();
        let balances = {};
        for (let b = 0; b < response.length; b++) {
            let account = response[b];
            let currency = account['currency_code'];
            balances[currency] = account;
        }
        let result = { 'info': response };
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            if (currency in balances) {
                account['total'] = balances[currency]['amount'];
                account['free'] = balances[currency]['available'];
                account['used'] = account['total'] - account['free'];
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetBoard (this.extend ({
            'product_code': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'size');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let ticker = await this.publicGetTicker (this.extend ({
            'product_code': this.marketId (symbol),
        }, params));
        let timestamp = this.parse8601 (ticker['timestamp']);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['best_bid']),
            'ask': parseFloat (ticker['best_ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['ltp']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume_by_product']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let side = undefined;
        let order = undefined;
        if ('side' in trade)
            if (trade['side']) {
                side = trade['side'].toLowerCase ();
                let id = side + '_child_order_acceptance_id';
                if (id in trade)
                    order = trade[id];
            }
        let timestamp = this.parse8601 (trade['exec_date']);
        return {
            'id': trade['id'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': order,
            'type': undefined,
            'side': side,
            'price': trade['price'],
            'amount': trade['size'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetExecutions (this.extend ({
            'product_code': market['id'],
        }, params));
        return this.parseTrades (response, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'product_code': this.marketId (symbol),
            'child_order_type': type.toUpperCase (),
            'side': side.toUpperCase (),
            'price': price,
            'size': amount,
        };
        let result = await this.privatePostSendchildorder (this.extend (order, params));
        return {
            'info': result,
            'id': result['child_order_acceptance_id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelchildorder (this.extend ({
            'parent_order_id': id,
        }, params));
    }

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostWithdraw (this.extend ({
            'currency_code': currency,
            'amount': amount,
            // 'bank_account_id': 1234,
        }, params));
        return {
            'info': response,
            'id': response['message_id'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.version + '/';
        if (api == 'private')
            request += 'me/';
        request += path;
        if (method == 'GET') {
            if (Object.keys (params).length)
                request += '?' + this.urlencode (params);
        }
        let url = this.urls['api'] + request;
        if (api == 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            body = this.json (params);
            let auth = [ nonce, method, request, body ].join ('');
            headers = {
                'ACCESS-KEY': this.apiKey,
                'ACCESS-TIMESTAMP': nonce,
                'ACCESS-SIGN': this.hmac (this.encode (auth), this.encode (this.secret)),
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
