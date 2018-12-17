'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const CryptoJS = require ('crypto-js');

//  ---------------------------------------------------------------------------

module.exports = class coss extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coss',
            'name': 'COSS',
            'country': [ 'SG', 'NL' ],
            'rateLimit': 1000,
            'version': 'v1',
            'comment': 'Certified exchange',
            'urls': {
                'logo': 'https://example.com/image.jpg',
                'api': 'https://coss.io/api',
                'www': 'https://coss.io/',
                'doc': [
                    'https://api.coss.io/v1/spec',
                ],
            },
            'has': {
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchBalance': true,
            },
            'api': {
                'engine': {
                    'get': [
                        'dp',
                        'ht',
                    ],
                },
                'trade': {
                    'get': [
                        'account/balances',
                        'account/details',
                        'getmarketsummaries',
                        'market-price',
                        'exchange-info',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        let response = await this.tradeGetExchangeInfo (params);
        let markets = response['symbols'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let entry = markets[i];
            let marketId = entry['symbol'];
            let [ baseId, quoteId ] = marketId.split ('_');
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': this.safeInteger (entry, 'amount_limit_decimal'),  // decimal places (i.e. 2 = 5.03)
                'price': this.safeInteger (entry, 'price_limit_decimal'),
            };
            let active = entry['allow_trading'];
            let value = {
                'symbol': symbol,
                'id': marketId,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': active,
                'precision': precision,
                'info': entry,
            };
            result.push (value);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        let response = await this.tradeGetExchangeInfo (params);
        let result = {};
        let currencies = response['coins'];
        for (let i = 0; i < currencies.length; i++) {
            let info = currencies[i];
            let currencyId = info['currency_code'];
            let name = info['name'];
            let limits = {
                'amount': {
                    'min': this.safeFloat (info, 'minimum_order_amount'),
                    'max': undefined,
                },
            };
            let code = this.commonCurrencyCode (currencyId);
            result[code] = {
                'code': code,
                'id': currencyId,
                'limits': limits,
                'name': name,
                'info': info,
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.tradeGetAccountBalances ();
        let result = {};
        for (let i = 0; i < response.length; i++) {
            let info = response[i];
            let currencyId = info['currency_code'];
            let code = this.currencies_by_id[currencyId]['code'];
            let total = this.safeFloat (info, 'total');
            let used = this.safeFloat (info, 'in_order');
            let free = this.safeFloat (info, 'available');
            result[code] = {
                'total': total,
                'used': used,
                'free': free,
            };
        }
        return this.parseBalance (result);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        let pathArray = url.split ('/');
        if (api === 'trade') {
            pathArray[2] = 'trade.' + pathArray[2];
            pathArray.splice (3, 0, 'c');
        } else if (api === 'engine') {
            pathArray[2] = 'engine.' + pathArray[2];
        }
        path = pathArray.join ('/');
        if (method === 'GET' && path.indexOf ('account') < 0) {
            url = path + '?' + this.urlencode (params);
        } else {
            let requestParams = { 'recvWindow': '10000', 'timestamp': this.nonce () };
            let request = this.implodeParams ('recvWindow={recvWindow}&timestamp={timestamp}', requestParams);
            url = path + '?' + request;
            headers = {
                'Signature': this.hmac (request, this.secret, 'sha256', 'hex'),
                'Authorization': this.apiKey,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
