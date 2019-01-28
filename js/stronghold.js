'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

// ----------------------------------------------------------------------------

module.exports = class Stronghold extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'stronghold',
            'name': 'Stronghold',
            'country': ['US'],
            'rateLimit': 1000,
            'version': 'v1',
            'comment': 'This comment is optional',
            'urls': {
                'logo': 'https://example.com/image.jpg',
                'api': {
                    'public': 'https://api.stronghold.co',
                    'private': 'https://api.stronghold.co',
                },
                'www': 'https://www.example.com',
                'doc': [
                    'https://docs.stronghold.co/',
                ],
            },
            'venueId': 'trade-public',
            'api': {
                'public': {
                    'get': [
                        'utilities/time',
                        'utilites/uuid',
                        'venues/trade-public/markets',
                        'venues/trade-public/markets/{marketId}/orderbook',
                    ],
                    'post': [
                        'iam/credential',
                        'identities',
                    ],
                    'patch': [
                        'identities',
                    ],
                    'put': [
                        'iam/credential/{credentialId}',
                    ],
                    'delete': [
                        'iam/credential/{credentialId}',
                    ],
                },
                'private': {
                    'get': [
                        'venues',
                        'venues/{venueId}/assets',
                        'venues/{venueId}/accounts/{accountId}',
                        'venues/{venueId}/custody/accounts/{accountId}/payment/{paymentId}',
                        'venues/{venueId}/custody/accounts/{accountId}/transactions',
                    ],
                    'post': [
                        'venues/{venueId}/assets',
                        'venues/{venueId}/accounts',
                        'venues/{venueId}/accounts/{accountId}/orders',
                        'venues/{venueId}/accounts/{accountId}/deposit',
                        'venues/{venueId}/accounts/{accountId}/withdrawal',
                        'venues/{venueId}/accounts/{accountId}/withdrawal',
                        'venues/{venueId}/custody/accounts/{accountId}/payment',
                        'venues/{venueId}/custody/accounts/{accountId}/payment/{paymentId}/stop',
                        'venues/{venueId}/custody/accounts/{accountId}/operations/{operationId}/signatures',
                        'venues/{venueId}/anchor/withdrawal',
                    ],
                },
            },
        });
    }

    async fetchMarkets () {
        const response = await this.publicGetVenuesTradePublicMarkets ();
        const responseData = response['result'];
        let result = {};
        for (let i = 0; i < responseData.length; i++) {
            const entry = responseData[i];
            const marketId = entry['id'];
            const [ baseId, url1 ] = entry['baseAssetId'].split ('/');
            const [ quoteId, url2 ] = entry['counterAssetId'].split ('/');
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const limits = {
                'amount': {
                    'min': this.safeFloat (entry, 'minimumOrderSize'),
                    'max': undefined,
                },
            };
            const precision = {
                'price': this.safeInteger (entry, 'displayDecimalsPrice'),
                'amount': this.safeInteger (entry, 'displayDecimalsAmount'),
            };
            result[symbol] = {
                'symbol': symbol,
                'id': marketId,
                'base': base,
                'quote': quote,
                'limits': limits,
                'precision': precision,
                'info': entry,
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = { 'marketId': marketId };
        const response = await this.publicGetVenuesTradePublicMarketsMarketIdOrderbook (this.extend (request, params));
        const responseData = response['result'];
        const timestamp = this.parse8601 (this.safeString (response, 'timestamp'));
        return this.parseOrderBook (responseData, timestamp, 'bids', 'asks', 0, 1);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let venue = { 'venueId': this.venueId };
        let endpoint = '/' + this.version + '/' + this.implodeParams (path, this.extend (params, venue));
        let url = this.urls['api'][api] + endpoint;
        let query = this.omit (params, this.extractParams (path));
        /*if (Object.keys(query).length > 0) {
            if (method === 'GET') {
                endpoint +=
            }
        }

        let timestamp = this.seconds ();
        headers = {
            'SH-CRED-ID': '2727fe7a-20ac-43f4-92ed-3f0301938426',
            'SH-CRED-SIG': '1234',
            'SH-CRED-PASS': 'mypassword',
            'SH-CRED-TIME': String (timestamp),
        }
        */
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
