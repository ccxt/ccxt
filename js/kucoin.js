'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class kucoin extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kucoin2',
            'name': 'KuCoin',
            'country': ['SC'],
            'rateLimit': 1000,
            'version': 'v1',
            'certified': true,
            'comment': 'This comment is optional',
            'has': {
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTickers': true,
                'fetchOrderBook': true,
            },
            'urls': {
                'logo': 'https://example.com/image.jpg',
                'api': {
                    'public': 'https://openapi-sandbox.kucoin.com',
                    'private': 'https://openapi-sandbox.kucoin.com',
                },
                'www': 'https://www.kucoin.com',
                'doc': [
                    'https://docs.kucoin.com',
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'api': {
                'public': {
                    'get': [
                        'timestamp',
                        'symbols',
                        'market/orderbook/level{level}',
                        'market/histories',
                        'market/candles',
                        'market/stats',
                        'currencies',
                        'currencies/{currency}',
                    ],
                    'post': [
                        'bullet-public',
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'accounts/{accountId}',
                        'accounts/{accountId}/ledgers',
                        'accounts/{accountId}/holds',
                        'deposit-addresses',
                        'deposits',
                        'withdrawals',
                        'withdrawals/quotas',
                        'orders',
                        'orders/{order-id}',
                        'fills',
                    ],
                    'post': [
                        'accounts',
                        'accounts/inner-transfer',
                        'deposit-addresses',
                        'withdrawals',
                        'orders',
                        'bullet-private',

                    ],
                    'delete': [
                        'withdrawals/{withdrawalId}',
                        'orders',
                    ],
                },
            },
            'timeframes': {
                '1m': '1min',
                '3m': '3min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '2h': '2hour',
                '4h': '4hour',
                '6h': '6hour',
                '8h': '8hour',
                '12h': '12hour',
                '1d': '1day',
                '1w': '1week',
            },
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    async loadTimeDifference () {
        const response = await this.publicGetTimestamp ();
        const after = this.milliseconds ();
        const kucoinTime = this.safeInteger (response, 'data');
        this.options['timeDifference'] = parseInt (after - kucoinTime);
        return this.options['timeDifference'];
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetSymbols (params);
        const responseData = response['data'];
        let result = {};
        for (let i = 0; i < responseData.length; i++) {
            const entry = responseData[i];
            const id = entry['name'];
            const baseId = entry['baseCurrency'];
            const quoteId = entry['quoteCurrency'];
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const active = entry['enableTrading'];
            const baseMax = this.safeFloat (entry, 'baseMaxSize');
            const baseMin = this.safeFloat (entry, 'baseMinSize');
            const quoteMax = this.safeFloat (entry, 'quoteMaxSize');
            const quoteMin = this.safeFloat (entry, 'quoteMinSize');
            const priceIncrement = this.safeFloat (entry, 'priceIncrement');
            const precision = {
                'amount': -Math.log10 (this.safeFloat (entry, 'quoteIncrement')),
                'price': -Math.log10 (priceIncrement),
            };
            const limits = {
                'amount': {
                    'min': quoteMin,
                    'max': quoteMax,
                },
                'price': {
                    'min': Math.max (baseMin / quoteMax, priceIncrement),
                    'max': baseMax / quoteMin,
                },
            };
            result[symbol] = {
                'id': id,
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': entry,
            };
        }
        // { id: 'KCS-BTC',
        //   symbol: 'KCS/BTC',
        //   baseId: 'KCS',
        //   quoteId: 'BTC',
        //   base: 'KCS',
        //   quote: 'BTC',
        //   active: true,
        //   precision: { amount: 6, price: 8 },
        //   limits:
        //    { amount: { min: 0.00001, max: 9999999 },
        //      price: { min: 1e-8, max: 999999899999.9999 } },
        //   info:
        //    { quoteCurrency: 'BTC',
        //      symbol: 'KCS-BTC',
        //      quoteMaxSize: '9999999',
        //      quoteIncrement: '0.000001',
        //      baseMinSize: '0.01',
        //      quoteMinSize: '0.00001',
        //      enableTrading: true,
        //      priceIncrement: '0.00000001',
        //      name: 'KCS-BTC',
        //      baseIncrement: '0.01',
        //      baseMaxSize: '9999999',
        //      baseCurrency: 'KCS' } }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies (params);
        const responseData = response['data'];
        let result = {};
        for (let i = 0; i < responseData.length; i++) {
            const entry = responseData[i];
            const id = this.safeString (entry, 'name');
            const name = entry['fullName'];
            const code = this.commonCurrencyCode (id);
            const precision = this.safeInteger (entry, 'precision');
            result[code] = {
                'id': id,
                'name': name,
                'code': code,
                'precision': precision,
                'info': entry,
            };
        }
        // {   id: 'KCS',
        //     name: 'KCS shares',
        //     code: 'KCS',
        //     precision: 10,
        //     info: {
        //         precision: 10,
        //         name: 'KCS',
        //         fullName: 'KCS shares',
        //         currency: 'KCS' } }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const response = await this.publicGetMarketOrderbookLevelLevel ({ 'level': '1', 'symbol': marketId });
        const responseData = response['data'];
        return {
            'symbol': symbol,
            'timestamp': this.safeInteger (responseData, 'sequence'),
            'last': this.safeFloat (responseData, 'price'),
            'info': responseData,
        };
    }

    async fetchOHLCV (symbol, timeframe = '15m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        let sinceSeconds = 0;
        if (since !== undefined) {
            sinceSeconds = Math.floor (since / 1000);
        }
        const response = await this.publicGetMarketCandles (this.extend ({
            'symbol': marketId,
            'startAt': sinceSeconds,
            'type': this.timeframes[timeframe],
        }), params);
        return response;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currencyId = this.currencyId (code);
        return await this.privateGetDepositAddresses ({ 'currency': currencyId });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + 'api' + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        const timestamp = this.nonce ();
        headers = this.extend (headers, {
            'KC-API-KEY': this.apiKey,
            'KC-API-TIMESTAMP': timestamp,
            'KC-API-PASSPHRASE': this.password,
            'KC-API-SIGN': '',
        });
        if (method === 'GET') {
            endpoint = endpoint + '?' + this.urlencode (query);
        } else {
            body = query;
        }
        let url = this.urls['api'][api] + endpoint;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let payload = [String (timestamp), method, endpoint];
            if (body !== undefined && Object.keys (body).length > 0) {
                payload.push (this.json (body));
            }
            const payloadString = payload.join ('');
            headers['KC-API-SIGN'] = this.hmac (this.encode (payloadString), this.encode (this.secret), 'sha256', 'base64');
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
