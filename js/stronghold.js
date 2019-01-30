'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidNonce, AuthenticationError, AccountSuspended } = require ('./base/errors');


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
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'api': {
                'public': {
                    'get': [
                        'utilities/time',
                        'utilites/uuid',
                        'venues',
                        'venues/{venueId}/assets',
                        'venues/{venueId}/markets',
                        'venues/{venueId}/markets/{marketId}/orderbook',
                        'venues/{venueId}/markets/{marketId}/trades',
                    ],
                    'post': [
                        'venues/{venueId}/assets',
                        'iam/credentials',
                        'identities',
                    ],
                    'patch': [
                        'identities',
                    ],
                    'put': [
                        'iam/credentials/{credentialId}',
                    ],
                    'delete': [
                        'iam/credentials/{credentialId}',
                    ],
                },
                'private': {
                    'get': [
                        'venues',
                        'venues/{venueId}/accounts/{accountId}',
                        'venues/{venueId}/custody/accounts/{accountId}/payment/{paymentId}',
                        'venues/{venueId}/custody/accounts/{accountId}/orders',
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
            'options': {
                'venues': {
                    'main': 'trade-public',
                    'sandbox': 'sandbox-public',
                },
            },
            'exceptions': {
                'CREDENTIAL_MISSING': AuthenticationError,
                'CREDENTIAL_INVALID': AuthenticationError,
                'CREDENTIAL_REVOKED': AccountSuspended,
                'CREDENTIAL_NO_IDENTITY': AuthenticationError,
                'PASSPHRASE_INVALID': AuthenticationError,
                'SIGNATURE_INVALID': AuthenticationError,
                'TIME_INVALID': InvalidNonce,
                'BYPASS_INVALID': AuthenticationError,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetVenuesVenueIdMarkets (params);
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
        const response = await this.publicGetVenuesVenueIdAssets ();
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

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = this.privateGetVenuesVenueIdAccountsAccountIdTransactions ({ "accountId": "f72b9fb5-9607-4dd3-b31f-6ded21337056" })


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

    nonce () {
        return this.seconds ();
    }

    setSandboxMode (enabled) {
        if (enabled) {
            this.options['venues']['backup'] = this.options['venues']['main'];
            this.options['venues']['main'] = this.options['venues']['sandbox'];
        } else {
            if ('backup' in this.options['venues']) {
                this.options['venues']['main'] = this.options['venues']['backup'];
            }
        }
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let venue = this.options['venues']['main'];
        let endpoint = '/' + this.version + '/' + this.implodeParams (path, this.extend (params, { 'venueId': venue }));
        let query = this.omit (params, this.extractParams (path));
        let endpart = '';
        headers = headers !== undefined ? headers : {};
        if (Object.keys (query).length > 0) {
            if (method === 'GET') {
                endpoint += '?' + this.urlencode (query);
            } else {
                body = this.json (query);
                endpart = body;
            }
        }
        let url = this.urls['api'][api] + endpoint;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.nonce ().toString ();
            const payload = timestamp + method + endpoint + endpart;
            console.log (payload);
            headers = this.extend ({
                'SH-CRED-ID': this.apiKey,
                'SH-CRED-SIG': this.hmac (this.encode (payload), this.encode (this.secret), 'sha256', 'base64'),
                'SH-CRED-TIME': timestamp,
                'SH-CRED-PASS': this.password,
            }, headers);
            headers['Content-Type'] = 'application/json';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
