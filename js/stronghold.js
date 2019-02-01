'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InvalidNonce, AuthenticationError, AccountSuspended, InsufficientFunds, InvalidArguments, ExchangeError } = require ('./base/errors');

// ----------------------------------------------------------------------------

module.exports = class stronghold extends Exchange {
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
                'uid': false, // required sometimes
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
                        'venues/{venueId}/accounts/{accountId}/orders',
                        'venues/{venueId}/accounts/{accountId}/trades',
                        'venues/{venueId}/markets/{marketId}/transactions',
                    ],
                    'post': [
                        'venues/{venueId}/accounts',
                        'venues/{venueId}/accounts/{accountId}/orders',
                        'venues/{venueId}/accounts/{accountId}/deposit',
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
                'paymentMethods': {
                    'ETH': 'ethereum',
                    'BTC': 'bitcoin',
                    'XLM': 'stellar',
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
                'INSUFFICIENT_FUNDS': InsufficientFunds,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetVenuesVenueIdMarkets (params);
        const data = response['result'];
        // [ { id: 'SHXUSD',
        //     baseAssetId: 'SHX/stronghold.co',
        //     counterAssetId: 'USD/stronghold.co',
        //     minimumOrderSize: '1.0000000',
        //     minimumOrderIncrement: '1.0000000',
        //     minimumPriceIncrement: '0.00010000',
        //     displayDecimalsPrice: 4,
        //     displayDecimalsAmount: 0 }, ... ]
        let result = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = entry['id'];
            const baseId = entry['baseAssetId'];
            const quoteId = entry['counterAssetId'];
            const baseAssetId = baseId.split ('/')[0];
            const quoteAssetId = quoteId.split ('/')[0];
            const base = this.commonCurrencyCode (baseAssetId);
            const quote = this.commonCurrencyCode (quoteAssetId);
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
                'baseId': baseId,
                'quoteId': quoteId,
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
        const data = response['result'];
        let result = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
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
        const response = await this.publicGetVenuesVenueIdMarketsMarketIdOrderbook (this.extend (request, params));
        // { marketId: 'ETHBTC',
        //   bids:
        //    [ [ '0.031500', '7.385000' ], ... ],
        //   asks:
        //    [ [ '0.031500', '7.385000' ], ... ], }
        const data = response['result'];
        const timestamp = this.parse8601 (this.safeString (response, 'timestamp'));
        return this.parseOrderBook (data, timestamp, 'bids', 'asks', 0, 1);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const request = { 'marketId': marketId };
        const response = await this.publicGetVenuesVenueIdMarketsMarketIdTrades (this.extend (request, params));
        //
        //     {
        //         marketId: 'ETHBTC',
        //         trades: [
        //             [ '0.03150000', '0.0012000', 'sell', '2019-01-28T01:42:17Z' ],
        //             ...
        //         ]
        //     }
        //
        return this.parseTrades (response['result']['trades'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetVenuesVenueIdAccountsAccountIdTrades ({ 'accountId': 'f72b9fb5-9607-4dd3-b31f-6ded21337056' });
        return response;
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //      [ '0.03177000', '0.0643501', 'sell', '2019-01-27T23:02:04Z' ]
        //
        // fetchMyTrades (private)
        //
        //      ?
        //
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
            'info': trade,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'marketID': this.marketId (symbol),
            'type': type,
            'side': side,
            'size': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
        };
        const response = await this.privatePostVenuesVenueIdAccountsAccountIdOrders (this.extend (request, params));
        return response;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.privateGetVenuesVenueIdAccountsAccountIdOrders (params);
        const orders = response['result'];
        return this.parseOrders (orders, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['id'];
        }
        const id = this.safeString (order, 'id');
        const datetime = this.safeString (order, 'placedAt');
        const amount = this.safeFloat (order, 'size');
        const filled = this.safeFloat (order, 'sizeFilled');
        return {
            'id': id,
            'info': order,
            'symbol': symbol,
            'datetime': datetime,
            'timestamp': this.parse8601 (datetime),
            'side': this.safeString (order, 'side'),
            'amount': amount,
            'filled': filled,
            'remaining': amount - filled,
            'price': this.safeFloat (order, 'price'),
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

    async fetchBalance (params = {}) {
        const response = await this.privateGetVenuesVenueIdAccountsAccountId (params);
        const balances = response['result']['balances'];
        let result = {};
        for (let i = 0; i < balances.length; i++) {
            const entry = balances[i];
            const asset = entry['assetId'].split ('/')[0];
            const code = this.commonCurrencyCode (asset);
            let account = this.account ();
            account['total'] = this.safeFloat (entry, 'amount');
            account['available'] = this.safeFloat (entry, 'availableForTrade');
            account['free'] = account['total'] - account['available'];
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (code);
        const response = this.privateGetVenuesVenueIdAccountsAccountIdTrades ();
        return this.parseTrades (response['result'], market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let paymentMethod = undefined;
        if (code in this.options['paymentMethods']) {
            paymentMethod = this.options['paymentMethods'][code];
        } else {
            throw new InvalidArguments (this.id + ' fetchDepositAddress requires code to be BTC, ETH, or XLM');
        }
        const currencyId = this.currencyId (code);
        const request = {
            'assetId': currencyId,
            'paymentMethod': paymentMethod,
        };
        const response = await this.privatePostVenuesVenueIdAccountsAccountIdDeposit (this.extend (request, params));
        // { assetId: 'BTC/stronghold.co',
        //   paymentMethod: 'bitcoin',
        //   paymentMethodInstructions: {
        //       deposit_address: 'mzMT9Cfw8JXVWK7rMonrpGfY9tt57ytHt4' },
        //   direction: 'deposit' }
        const address = response['result']['paymentMethodInstructions']['deposit_address'];
        return {
            'currency': code,
            'address': this.checkAddress (address),
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        let paymentMethod = undefined;
        const currencyId = this.currencyId (code);
        if (code in this.options['paymentMethods']) {
            paymentMethod = this.options['paymentMethods'][code];
        } else {
            throw new InvalidArguments (this.id + ' fetchDepositAddress requires code to be BTC, ETH, or XLM');
        }
        const request = {
            'assetId': currencyId,
            'paymentMethod': paymentMethod,
        };
        const response = await this.privatePostVenuesVenueIdAccountsAccountIdDeposit (this.extend (request, params));
        // {
        //     "id": "5be48892-1b6e-4431-a3cf-34b38811e82c",
        //     "assetId": "BTC/stronghold.co",
        //     "amount": "10",
        //     "feeAmount": "0.01",
        //     "paymentMethod": "bitcoin",
        //     "paymentMethodDetails": {
        //       "withdrawal_address": "1vHysJeXYV6nqhroBaGi52QWFarbJ1dmQ"
        //     },
        //     "direction": "withdrawal",
        //     "status": "pending"
        //   }
        return {
            'id': response['result']['id'],
            'info': response,
        };
    }

    async fetchAccounts (params) {
        return await this.privatePostVenuesVenueIdAccounts (params)
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (!response) {
            return;
        }
        // { requestId: '3e7d17ab-b316-4721-b5aa-f7e6497eeab9',
        //   timestamp: '2019-01-31T21:59:06.696855Z',
        //   success: true,
        //   statusCode: 200,
        //   result: [] }
        let errorCode = this.safeString (response, 'errorCode');
        if (errorCode in this.exceptions) {
            let Exception = this.exceptions[errorCode];
            throw new Exception (this.id + ' ' + body);
        }
        const success = this.safeValue (response, 'success');
        if (!success) {
            throw new ExchangeError (this.id + ' ' + body);
        }
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const extractedParams = this.extractParams (path);
        for (let i = 0; i < extractedParams.length; i++) {
            let param = extractedParams[i];
            if (!(param in params)) {
                if (param === 'venueId') {
                    params['venueId'] = this.options['venues']['main'];
                } else if (param === 'accountId') {
                    if (this.uid === undefined) {
                        throw new AuthenticationError (this.id + ' requires uid');
                    }
                    params['accountId'] = this.uid;
                }
            }
        }
        let endpoint = '/' + this.version + '/' + this.implodeParams (path, params);
        const rawEndpoint = endpoint;
        let query = this.omit (params, extractedParams);
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
            const payload = timestamp + method + rawEndpoint + endpart;
            const secret = this.base64ToBinary (this.secret);
            headers = {
                'SH-CRED-ID': this.apiKey,
                'SH-CRED-SIG': this.hmac (this.encode (payload), secret, 'sha256', 'base64'),
                'SH-CRED-TIME': timestamp,
                'SH-CRED-PASS': this.password,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
