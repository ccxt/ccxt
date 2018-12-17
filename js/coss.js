'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError } = require ('./base/errors');


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
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchClosedOrders': true,
                'fetchOpenOrders': true,
                'fetchOHLCV': true,
            },
            'api': {
                'engine': {
                    'get': [
                        'dp',
                        'ht',
                        'cs',
                    ],
                },
                'trade': {
                    'get': [
                        'account/balances',
                        'account/details',
                        'getmarketsummaries',  // fetchTicker (broken on COSS's end)
                        'market-price',
                        'exchange-info',
                        'coins/getinfo/allnonstandard',
                        'order/symbolsnonstandard',
                    ],
                    'post': [
                        'order/add',
                        'order/details',
                        'order/list/open',
                        'order/list/completed',
                        'order/list/all',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        let markets = await this.tradeGetOrderSymbolsnonstandard (params);
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
        let result = {};
        let currencies = await this.tradeGetCoinsGetinfoAllnonstandard (params);
        for (let i = 0; i < currencies.length; i++) {
            let info = currencies[i];
            let currencyId = info['currency_code'];
            let code = this.commonCurrencyCode (currencyId);
            let name = info['name'];
            let limits = {
                'amount': {
                    'min': this.safeFloat (info, 'minimum_order_amount'),
                    'max': undefined,
                },
                'withdraw': {
                    'min': this.safeFloat (info, 'minimum_withdrawn_amount'),
                    'max': undefined,
                },
            };
            let active = info['allow_buy'] && info['allow_sell'] && info['allow_withdrawn'] && info['allow_deposit'];
            let fee = this.safeFloat (info, 'withdrawn_fee');
            let type = this.safeString (info, 'token_type');
            result[code] = {
                'code': code,
                'id': currencyId,
                'limits': limits,
                'name': name,
                'active': active,
                'fee': fee,
                'type': type,
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

    async fetchOHLCV (symbol, params = {}) {
        await this.loadMarkets ();
        let marketId = this.market (symbol)['id'];
        let response = await this.engineGetCs (this.extend ({ 'symbol': marketId, 'tt': '1m' }, params));
        let ohclvs = response['series'];
        return this.parseOHLCVs (ohclvs);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let marketId = this.market (symbol)['marketId'];
        let response = await this.engineGetDp (this.extend ({ 'symbol': marketId }, params));
        let timestamp = this.safeInteger (response, 'time');
        return this.parseOrderBook (response, timestamp, 'asks', 'bids');
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' requires a symbol parameter to fetchOrders');
        }
        await this.loadMarkets ();
        let marketId = this.market (symbol)['id'];
        let response = await this.tradePostOrderListAll (this.extend ({ 'symbol': marketId }, params));
        return response;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return '';
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return '';
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = undefined;
        if (path.indexOf ('nonstandard') >= 0) {
            url = this.urls['api'].replace ('/api', '') + '/' + path.replace ('nonstandard', '');
        } else {
            url = this.urls['api'] + '/' + this.version + '/' + path;
        }
        let urlArray = url.split ('/');
        if (api === 'trade') {
            urlArray[2] = 'trade.' + urlArray[2];
            urlArray.splice (3, 0, 'c');
        } else if (api === 'engine') {
            urlArray[2] = 'engine.' + urlArray[2];
        }
        url = urlArray.join ('/');
        if (method === 'GET' && path.indexOf ('account') < 0) {
            if (Object.keys (params).length > 0) {
                url = url + '?' + this.urlencode (params);
            }
        } else { // todo make post requests work
            let requestParams = { 'recvWindow': '10000', 'timestamp': this.nonce () };
            let request = this.implodeParams ('recvWindow={recvWindow}&timestamp={timestamp}', requestParams);
            if (Object.keys (params).length > 0) {
                request = request + '&' + this.urlencode (params);
            }
            url = url + '?' + request;
            headers = {
                'Signature': this.hmac (request, this.secret, 'sha256', 'hex'),
                'Authorization': this.apiKey,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
