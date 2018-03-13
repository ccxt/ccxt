'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ----initial draft -by jjhesk

module.exports = class coinone extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinone',
            'name': 'CoinOne',
            'countries': 'KR', // Korea
            'rateLimit': 90,
            'version': 'v2',
            'has': {
                'CORS': true,
                'fetchTickers': true,
                'fetchBalance': true,
                'fetchOrders': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/629338/35319687-5ca529cc-00fa-11e8-863a-89f169a511e1.png',
                'api': 'https://api.coinone.co.kr/',
                'www': 'https://coinone.co.kr',
                'doc': [
                    'http://doc.coinone.co.kr/',
                ],
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
                'BTC/KRW': {
                    'id': 'btc',
                    'symbol': 'BTC/KRW',
                    'base': 'BTC',
                    'quote': 'KRW',
                },
                'BTG/KRW': {
                    'id': 'btg',
                    'symbol': 'BTG/KRW',
                    'base': 'BTG',
                    'quote': 'KRW',
                },
                'IOT/KRW': {
                    'id': 'iota',
                    'symbol': 'IOT/KRW',
                    'base': 'IOT',
                    'quote': 'KRW',
                },
                'LTC/KRW': {
                    'id': 'ltc',
                    'symbol': 'LTC/KRW',
                    'base': 'LTC',
                    'quote': 'KRW',
                },
                'QTUM/KRW': {
                    'id': 'qtum',
                    'symbol': 'QTUM/KRW',
                    'base': 'QTUM',
                    'quote': 'KRW',
                },
                'XRP/KRW': {
                    'id': 'xrp',
                    'symbol': 'XRP/KRW',
                    'base': 'XRP',
                    'quote': 'KRW',
                },
                'ETH/KRW': {
                    'id': 'eth',
                    'symbol': 'ETH/KRW',
                    'base': 'ETH',
                    'quote': 'KRW',
                },
                'ETC/KRW': {
                    'id': 'etc',
                    'symbol': 'ETC/KRW',
                    'base': 'ETC',
                    'quote': 'KRW',
                },
                'BCH/KRW': {
                    'id': 'bch',
                    'symbol': 'BCH/KRW',
                    'base': 'BCH',
                    'quote': 'KRW',
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.1 / 100,
                    'maker': 0.1 / 100,
                    'tiers': {
                        'taker': [
                            [100000000, 0.1 / 100],
                            [10000000000, 0.09 / 100],
                            [50000000000, 0.08 / 100],
                            [100000000000, 0.07 / 100],
                            [200000000000, 0.06 / 100],
                            [300000000000, 0.05 / 100],
                            [400000000000, 0.04 / 100],
                            [500000000000, 0.03 / 100],
                            [999900000000000, 0.02 / 100],
                        ],
                        'maker': [
                            [100000000, 0.1 / 100],
                            [10000000000, 0.08 / 100],
                            [50000000000, 0.06 / 100],
                            [100000000000, 0.04 / 100],
                            [200000000000, 0.02 / 100],
                            [300000000000, 0.01 / 100],
                            [400000000000, 0],
                            [500000000000, 0],
                            [999900000000000, 0],
                        ],
                    },
                },
            },
        });
    }

    async fetchBalance (params = {}) {
        let res = await this.privateGetV2AccountBalance ();
        let result = { 'info': res };
        Object.values (this.markets).forEach ((mrk) => {
            let id = mrk['id'];
            let symbol = mrk['symbol'];
            if (id in res) {
                let balance = res[id];
                let account = {
                    'free': parseFloat (balance['avail']),
                    'used': parseFloat (balance['balance']) - parseFloat (balance['avail']),
                    'total': parseFloat (balance['balance'])
                };
                result[symbol] = account;
            }
        });
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        let mkt = this.market (symbol);
        let res = await this.publicGetOrderbook (this.extend ({
            'currency': mkt['id'],
            'format': 'json',
        }, params));
        return this.parseOrderBook (res, undefined, 'bid', 'ask', 'price', 'qty');
    }

    async fetchTicker (symbol, params = {}) {
        let mkt = this.market (symbol);
        let timestamp = this.milliseconds ();
        let res = await this.publicGetTicker (this.extend ({
            'currency': mkt['id'],
            'format': 'json',
        }, params));
        let ticker = res;
        let baseVolume = this.safeFloat (ticker, 'volume');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'last'),
            'ask': this.safeFloat (ticker, 'last'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': this.safeFloat (ticker, 'first'),
            'last': this.safeFloat (ticker, 'last'),
            'change': this.safeFloat (ticker, 'yesterday_last') - this.safeFloat (ticker, 'last'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, symbol = undefined) {
        let timestamp = parseInt (trade['timestamp']) * 1000;
        let side = 'buy';
        return {
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': undefined,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'qty'),
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let result = await this.publicGetTrades (this.extend ({
            'currency': market['id'],
            'period': 'hour',
            'format': 'json',
        }, params));
        let trades = result['completeOrders'];
        return this.parseTrades (trades, symbol);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        // throw new ExchangeError (this.id + ' cancelOrder () is not fully implemented yet');
        let method = 'privatePostOrderCancel';
        return await this[method] ({ 'orderID': id });
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
            let payload = this.stringToBase64 (JSON.stringify ({ 'access_token': this.apiKey, 'nonce': nonce }));
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
        if (code === 200) {
            if ((body[0] === '{') || (body[0] === '[')) {
                let response = JSON.parse (body);
                if ('result' in response) {
                    let success = response['result'];
                    if (success !== 'success') {
                        if ('errorCode' in response) {
                            throw new ExchangeError (this.id + ' malformed response: no "message" in response: ' + body);
                        }
                        throw new ExchangeError (this.id + ' error returned: ' + body);
                    }
                } else {
                    throw new ExchangeError (this.id + ' malformed response: no "result" in response: ' + body);
                }
            } else {
                throw new ExchangeError (this.id + ' returned a non-JSON reply: ' + body);
            }
        }
    }
};
