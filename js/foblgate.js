'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, BadRequest, InvalidOrder } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class foblgate extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'foblgate',
            'name': 'FOBLGATE',
            'countries': [ 'KR' ], // South Korea
            'rateLimit': 500,
            'has': {
                'CORS': true,
                'createOrder': true,
                'cancelOrder': true,
                'createMarketOrder': true,
                'fetchTicker': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchTrades': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/69025125/89286704-a5495200-d68d-11ea-8486-fe3fa693e4a6.jpg',
                'api': {
                    'public': 'https://api2.foblgate.com',
                    'private': 'https://api2.foblgate.com',
                },
                'www': 'https://www.foblgate.com',
                'doc': 'https://api-document.foblgate.com',
                'fees': 'https://www.foblgate.com/fees',
            },
            'api': {
                'public': {
                    'post': [
                        'ccxt/marketList',
                        'ccxt/orderBook',
                        // 'ccxt/trades',
                    ],
                },
                'private': {
                    'post': [
                        'ccxt/balance',
                        'ccxt/orderPlace',
                        'ccxt/orderCancel',
                    ],
                },
            },
            'requiredCredentials': {
                'uid': true,
            },
            'exceptions': {
                '400': BadRequest,
                '401': AuthenticationError,
                '403': AuthenticationError,
                '500': ExchangeError,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicPostCcxtMarketList (params);
        const marketList = this.safeValue (response, 'marketList');
        // {
        //     'ETH/BTC': {
        //         limits: { amount: [Object], price: [Object], cost: [Object] },
        //         precision: { amount: 8, price: 8 },
        //         tierBased: false,
        //             percentage: true,
        //             taker: 0.03,
        //             maker: 0.03,
        //             symbol: 'ETH/BTC',
        //             active: true,
        //             baseId: 'ETH',
        //             quoteId: 'BTC',
        //             quote: 'BTC',
        //             id: 'ETH-BTC',
        //             base: 'ETH',
        //             info: { market: 'ETH/BTC', coinName: 'ETH', coinNameKo: '이더리움' }
        //     }
        // }
        return marketList;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostCcxtBalance (params);
        // {
        //     BTC: { total: 0, used: 0, free: 0 },
        //     ETH: { total: 0, used: 0, free: 0 },
        //     info: {}
        // }
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pairName': symbol,
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.publicPostCcxtOrderBook (this.extend (request, params));
        // {
        //     bids: [
        //         [ 303100, 11.68805904 ],
        //         [ 303000, 0.61282982 ],
        //         [ 302900, 0.59681086 ]
        //     ],
        //     asks: [
        //         [ 303700, 0.99953148 ],
        //         [ 303800, 0.66825562 ],
        //         [ 303900, 1.47346607 ],
        //     ],
        //     timestamp: undefined,
        //     datetime: undefined,
        //     nonce: undefined
        // }
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 'price', 'amount');
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            throw new InvalidOrder (this.id + ' createOrder type = market, currently not supported.');
        }
        let action = undefined;
        if (side === 'buy') {
            action = 'bid';
        } else if (side === 'sell') {
            action = 'ask';
        } else {
            throw new InvalidOrder (this.id + ' createOrder allows buy or sell side only!');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairName': market['symbol'],
            'type': type,
            'action': action,
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
        };
        const response = await this.privatePostCcxtOrderPlace (this.extend (request, params));
        // {
        //     info: { data: '2008042' },
        //     id: '2008042',
        //         symbol: 'BTC/KRW',
        //     type: 'limit',
        //     side: 'buy',
        //     amount: 0.1,
        //     price: 9000000
        // }
        return response;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'ordNo': id,
        };
        const response = await this.privatePostCcxtOrderCancel (this.extend (request, params));
        // { status: '0' }
        return response;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        const query = this.omit (params, this.extractParams (path));
        if (method !== 'POST') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            if (api === 'private') {
                this.checkRequiredCredentials ();
                body = this.urlencode (query);
                const nonce = this.nonce ().toString ();
                const auth = this.urlencode (this.extend ({
                    'apiKey': this.apiKey,
                    'mbId': this.uid,
                    'nonce': nonce,
                }, query));
                const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha512');
                const signature64 = this.decode (this.stringToBase64 (this.encode (signature)));
                headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Api-Key': this.apiKey,
                    'Api-Uid': this.uid,
                    'Api-Sign': signature64.toString (),
                    'Api-Nonce': nonce,
                };
            } else {
                body = this.urlencode (query);
                headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        const code = this.safeValue (response, 'code');
        if (code !== undefined) {
            if (code === '0') {
                return;
            }
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions, code, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
