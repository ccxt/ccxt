'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');
const { isArray } = require ('./base/functions/type');

//  ---------------------------------------------------------------------------

module.exports = class coinsbit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinsbit',
            'name': 'Coinsbit',
            'countries': ['EE'],
            'urls': {
                'api': {
                    'public': 'https://coinsbit.io/api/',
                    'private': 'https://coinsbit.io/api/',
                },
                'www': 'https://coinsbit.io/',
                'doc': [
                    'https://www.notion.so/API-COINSBIT-WS-API-COINSBIT-cf1044cff30646d49a0bab0e28f27a87',
                ],
                'fees': 'https://coinsbit.io/fee-schedule',
            },
            'version': 'v1',
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'tickers',
                        'ticker',
                        'book',
                        'history',
                        'history/result',
                        'products',
                        'symbols',
                        'depth/result',
                    ],
                },
                'private': {
                    'post': [
                        'order/new',
                        'order/cancel',
                        'orders',
                        'account/balances',
                        'account/balance',
                        'account/order',
                        'account/order_history',
                    ],
                },
            },
            'has': {
                'fetchMarkets': true,
            },
            'rateLimit': 1000,
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        const isSuccess = this.safeValue (response, 'success');
        const message = this.safeValue (response, 'message');
        if (!isSuccess) {
            let errorMessage = '';
            if (isArray (message)) {
                errorMessage = message[0];
            } else {
                errorMessage = message;
            }
            throw new ExchangeError (this.id + ' publicGetMarkets returned response with error:' + errorMessage);
        }
        const marketsList = this.safeValue (response, 'result');
        const parsedMarketList = [];
        for (let marketIndex = 0; marketIndex < marketsList.length; marketIndex++) {
            const market = marketsList[marketIndex];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'stock');
            const quoteId = this.safeString (market, 'money');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const isActive = true;
            const precision = {
                'amount': this.safeInteger (market, 'stockPrec'),
                'price': this.safeInteger (market, 'moneyPrec'),
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'minAmount'),
                    'max': undefined,
                },
                'price': {
                    'min': Math.pow (10, -precision['price']),
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            const info = market;
            parsedMarketList.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': isActive,
                'precision': precision,
                'limits': limits,
                'info': info,
            });
        }
        return parsedMarketList;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + this.version + '/' + api + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const request = '/api/' + this.version + '/' + this.implodeParams (path, params);
            const nonce = this.nonce ();
            query = this.extend ({
                'nonce': nonce.toString (),
                'request': request,
            }, query);
            body = this.json (query);
            const payload = this.stringToBase64 (this.encode (body));
            const secret = this.encode (this.secret);
            const signature = this.hmac (payload, secret, 'sha512');
            headers = {
                'Content-type': 'application/json',
                'X-TXC-APIKEY': this.apiKey,
                'X-TXC-PAYLOAD': payload,
                'X-TXC-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
