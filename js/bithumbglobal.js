'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadRequest, InvalidOrder } = require ('./base/errors');
const { SIGNIFICANT_DIGITS } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bithumbglobal extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bithumbglobal',
            'name': 'Bithumb Global',
            'countries': [ 'KR' ], // South Korea
            'rateLimit': 500,
            'has': {
                'cancelOrder': true,
                'CORS': true,
                'createMarketOrder': false,
                'createOrder': false,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTrades': false,
                'withdraw': false,
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://global-openapi.bithumb.pro/openapi/v1',
                    'private': 'https://global-openapi.bithumb.pro/openapi/v1',
                },
                'www': 'https://www.bithumb.pro',
                'doc': 'https://github.com/bithumb-pro/bithumb.pro-official-api-docs/blob/master/rest-api.md',
                'fees': 'https://www.bithumb.pro/en-us/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'spot/config',
                        'spot/orderBook',
                    ],
                },
                'private': {
                    'post': [
                        'spot/assetList',
                        'spot/cancelOrder',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
            },
            'precisionMode': SIGNIFICANT_DIGITS,
            'exceptions': {
                'exact': {
                    // 9002 occurs when there are missing/wrong parameters, the signature does not need to be wrong
                    '9002': BadRequest, // {"data":null,"code":"9002","msg":"verifySignature failed","timestamp":1597061538013,"startTime":null}
                    '20004': InvalidOrder, // {"data":null,"code":"20004","msg":"order absent","timestamp":1597061829420,"startTime":null}
                },
                'broad': {
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetSpotConfig (params);
        const data = this.safeValue (response, 'data');
        const spotConfig = this.safeValue (data, 'spotConfig');
        const result = [];
        for (let i = 0; i < spotConfig.length; i++) {
            const market = spotConfig[i];
            const currencyId = this.safeValue (market, 'symbol');
            const [ baseId, quoteId ] = currencyId.split ('-');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            result.push ({
                'id': currencyId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
                'active': true,
                'precision': {
                    'amount': undefined,
                    'price': undefined,
                },
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
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
                'baseId': baseId,
                'quoteId': quoteId,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetSpotConfig (params);
        const data = this.safeValue (response, 'data');
        const coinConfig = this.safeValue (data, 'coinConfig');
        const result = [];
        for (let i = 0; i < coinConfig.length; i++) {
            const currency = coinConfig[i];
            const name = this.safeString (currency, 'name');
            const id = name;
            const code = this.safeCurrencyCode (name);
            result[code] = {
                'id': id,
                'numericId': undefined,
                'code': code,
                'info': currency,
                'name': name,
                'active': this.safeString (currency, 'depositStatus') === 1,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (currency, 'minTxAmt'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minWithdraw'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetSpotOrderBook (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        return this.parseOrderBook (data, undefined, 'b', 's', 0, 1);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            'assetType': 'spot',
        };
        const response = await this.privatePostSpotAssetList (this.extend (request, params));
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data');
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeString (balance, 'coinType');
            const account = this.account ();
            const safeCode = this.safeCurrencyCode (code);
            account['total'] = this.safeFloat (balance, 'count');
            account['used'] = this.safeFloat (balance, 'frozen');
            result[safeCode] = account;
        }
        return this.parseBalance (result);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderId': id,
            'symbol': market['id'],
        };
        return await this.privatePostSpotCancelOrder (this.extend (request, params));
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const ts = this.nonce ().toString ();
            query = this.keysort (this.extend ({
                'apiKey': this.apiKey,
                'msgNo': ts,
                'timestamp': ts,
                'version': 'v1.0.0',
            }, query));
            const urlparams = this.urlencode (query);
            query['signature'] = this.hmac (this.encode (urlparams), this.encode (this.secret), 'sha256');
            body = this.json (query);
            headers = {
                'content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('code' in response) {
            const code = this.safeString (response, 'code');
            const message = this.safeString (response, 'msg');
            if (code === '0') {
                return; // no error
            }
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwExactlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
