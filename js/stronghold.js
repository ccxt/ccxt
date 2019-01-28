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
                        'venues/trade-public/assets',
                        'venues/trade-public/markets',
                        'venues/trade-public/markets/{marketId}/orderbook',
                        'venues/trade-public/markets/{marketId}/trades',
                    ],
                    'post': [
                        'venues/trade-public/assets',
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
                        'venues/{venueId}/accounts/{accountId}',
                        'venues/{venueId}/custody/accounts/{accountId}/payment/{paymentId}',
                        'venues/{venueId}/custody/accounts/{accountId}/transactions',
                    ],
                    'post': [
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

    async fetchMarkets (params = {}) {
        const response = await this.publicGetVenuesTradePublicMarkets (params);
        const responseData = response['result'];
        // [ { id: 'SHXUSD',
        //     baseAssetId: 'SHX/stronghold.co',
        //     counterAssetId: 'USD/stronghold.co',
        //     minimumOrderSize: '1.0000000',
        //     minimumOrderIncrement: '1.0000000',
        //     minimumPriceIncrement: '0.00010000',
        //     displayDecimalsPrice: 4,
        //     displayDecimalsAmount: 0 }, ... ]
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

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetVenuesTradePublicAssets ();
        //    [ { id: 'XLM/native',
        //        alias: '',
        //        code: 'XLM',
        //        name: '',
        //        displayDecimalsFull: 7,
        //        displayDecimalsSignificant: 2 }, ... ]
        const responseData = response['result'];
        let result = {};
        for (let i = 0; i < responseData.length; i++) {
            const entry = responseData[i];
            const currencyId = this.safeString (entry, 'code');
            const code = this.commonCurrencyCode (currencyId);
            const precision = this.safeInteger (entry, 'displayDecimalsFull');
            result[code] = {
                'code': code,
                'id': currencyId,
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
        // { marketId: 'ETHBTC',
        //   bids:
        //    [ [ '0.031500', '7.385000' ], ... ],
        //   asks:
        //    [ [ '0.031500', '7.385000' ], ... ], }
        const responseData = response['result'];
        const timestamp = this.parse8601 (this.safeString (response, 'timestamp'));
        return this.parseOrderBook (responseData, timestamp, 'bids', 'asks', 0, 1);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const request = { 'marketId': marketId };
        const response = await this.publicGetVenuesTradePublicMarketsMarketIdTrades (this.extend (request, params));
        // { marketId: 'ETHBTC',
        //   trades:
        //    [ [ '0.03150000', '0.0012000', 'sell', '2019-01-28T01:42:17Z' ], ... ] }
        const responseData = response['result'];
        return this.parseTrades (responseData['trades'], market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        // [ '0.03177000', '0.0643501', 'sell', '2019-01-27T23:02:04Z' ]
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat (trade, 0);
        const amount = this.safeFloat (trade, 1);
        const side = this.safeString (trade, 2);
        const datetime = this.safeString (trade, 3);
        return {
            'symbol': symbol,
            'price': price,
            'amount': amount,
            'side': side,
            'datetime': datetime,
            'timestamp': this.parse8601 (datetime),
        };
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
