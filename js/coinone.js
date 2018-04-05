'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinone extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinone',
            'name': 'CoinOne',
            'countries': 'KR', // Korea
            'rateLimit': 667,
            'version': 'v2',
            'has': {
                'CORS': false,
                'createMarketOrder': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38003300-adc12fba-323f-11e8-8525-725f53c4a659.jpg',
                'api': 'https://api.coinone.co.kr',
                'www': 'https://coinone.co.kr',
                'doc': 'https://doc.coinone.co.kr',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'orderbook/',
                        'trades/',
                        'ticker/',
                    ],
                },
                'private': {
                    'post': [
                        'account/btc_deposit_address/',
                        'account/balance/',
                        'account/daily_balance/',
                        'account/user_info/',
                        'account/virtual_account/',
                        'order/cancel_all/',
                        'order/cancel/',
                        'order/limit_buy/',
                        'order/limit_sell/',
                        'order/complete_orders/',
                        'order/limit_orders/',
                        'order/order_info/',
                        'transaction/auth_number/',
                        'transaction/history/',
                        'transaction/krw/history/',
                        'transaction/btc/',
                        'transaction/coin/',
                    ],
                },
            },
            'markets': {
                'BCH/KRW': { 'id': 'bch', 'symbol': 'BCH/KRW', 'base': 'BCH', 'quote': 'KRW' },
                'BTC/KRW': { 'id': 'btc', 'symbol': 'BTC/KRW', 'base': 'BTC', 'quote': 'KRW' },
                'BTG/KRW': { 'id': 'btg', 'symbol': 'BTG/KRW', 'base': 'BTG', 'quote': 'KRW' },
                'ETC/KRW': { 'id': 'etc', 'symbol': 'ETC/KRW', 'base': 'ETC', 'quote': 'KRW' },
                'ETH/KRW': { 'id': 'eth', 'symbol': 'ETH/KRW', 'base': 'ETH', 'quote': 'KRW' },
                'IOT/KRW': { 'id': 'iota', 'symbol': 'IOT/KRW', 'base': 'IOT', 'quote': 'KRW' },
                'LTC/KRW': { 'id': 'ltc', 'symbol': 'LTC/KRW', 'base': 'LTC', 'quote': 'KRW' },
                'QTUM/KRW': { 'id': 'qtum', 'symbol': 'QTUM/KRW', 'base': 'QTUM', 'quote': 'KRW' },
                'XRP/KRW': { 'id': 'xrp', 'symbol': 'XRP/KRW', 'base': 'XRP', 'quote': 'KRW' },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                    'tiers': {
                        'taker': [
                            [0, 0.001],
                            [100000000, 0.0009],
                            [1000000000, 0.0008],
                            [5000000000, 0.0007],
                            [10000000000, 0.0006],
                            [20000000000, 0.0005],
                            [30000000000, 0.0004],
                            [40000000000, 0.0003],
                            [50000000000, 0.0002],
                        ],
                        'maker': [
                            [0, 0.001],
                            [100000000, 0.0008],
                            [1000000000, 0.0006],
                            [5000000000, 0.0004],
                            [10000000000, 0.0002],
                            [20000000000, 0],
                            [30000000000, 0],
                            [40000000000, 0],
                            [50000000000, 0],
                        ],
                    },
                },
            },
            'exceptions': {
                '405': ExchangeNotAvailable,
            },
        });
    }

    async fetchBalance (params = {}) {
        let response = await this.privateGetV2AccountBalance ();
        let result = { 'info': response };
        let ids = Object.keys (this.markets);
        for (let i = 0; i < ids.length; i++) {
            let market = ids[i];
            let id = market['id'];
            let symbol = market['symbol'];
            if (id in response) {
                let balance = response[id];
                let account = {
                    'free': parseFloat (balance['avail']),
                    'used': parseFloat (balance['balance']) - parseFloat (balance['avail']),
                    'total': parseFloat (balance['balance']),
                };
                result[symbol] = account;
            }
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetOrderbook (this.extend ({
            'currency': market['id'],
            'format': 'json',
        }, params));
        return this.parseOrderBook (response, undefined, 'bid', 'ask', 'price', 'qty');
    }

    async fetchTicker (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTicker (this.extend ({
            'currency': market['id'],
            'format': 'json',
        }, params));
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let last = this.safeFloat (ticker, 'last');
        let previousClose = this.safeFloat (ticker, 'yesterday_last');
        let change = undefined;
        if (typeof last !== 'undefined' && typeof previousClose !== 'undefined')
            change = previousClose - last;
        let symbol = (typeof market !== 'undefined') ? market['symbol'] : undefined;
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
            'open': this.safeFloat (ticker, 'first'),
            'close': last,
            'last': last,
            'previousClose': previousClose,
            'change': change,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let timestamp = parseInt (trade['timestamp']) * 1000;
        let symbol = (typeof market !== 'undefined') ? market['symbol'] : undefined;
        return {
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': undefined,
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'qty'),
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTrades (this.extend ({
            'currency': market['id'],
            'period': 'hour',
            'format': 'json',
        }, params));
        return this.parseTrades (response['completeOrders'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let order = {
            'price': price,
            'currency': this.marketId (symbol),
            'qty': amount,
        };
        let method = 'privatePostOrder' + this.capitalize (type) + this.capitalize (side);
        let response = await this[method] (this.extend (order, params));
        // todo: return the full order structure
        // return this.parseOrder (response, market);
        let orderId = this.safeString (response, 'orderId');
        return {
            'info': response,
            'id': orderId,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostOrderCancel ({ 'orderID': id });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/' + request;
        headers = {};
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let payload = this.stringToBase64 (this.json ({ 'access_token': this.apiKey, 'nonce': nonce }));
            body = payload;
            let signature = this.hmac (payload, this.encode (this.secret.toUpperCase ()), 'sha512', 'hex');
            headers = {
                'content-type': 'application/json',
                'X-COINONE-PAYLOAD': payload,
                'X-COINONE-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            if ('result' in response) {
                let result = response['result'];
                if (result !== 'success') {
                    //
                    //    {  "errorCode": "405",  "status": "maintenance",  "result": "error"}
                    //
                    const code = this.safeString (response, 'errorCode');
                    const feedback = this.id + ' ' + this.json (response);
                    const exceptions = this.exceptions;
                    if (code in exceptions) {
                        throw new exceptions[code] (feedback);
                    } else {
                        throw new ExchangeError (feedback);
                    }
                }
            } else {
                throw new ExchangeError (this.id + ' ' + body);
            }
        }
    }
};
