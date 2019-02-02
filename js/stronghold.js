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
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'has': {
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchOrderBook': true,
                'fetchOpenOrders': true,
                'fetchTrades': true,
                'fetchMyTrades': true,
                'fetchDepositAddress': true,
                'withdraw': true,
                'fetchTicker': false,
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
                        'venues/{venueId}/accounts/{accountId}/transactions',
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
                        'venues/{venueId}/testing/friendbot',
                    ],
                    'delete': [
                        'venues/{venueId}/accounts/{accountId}/orders/{orderId}',
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
                'accountId': undefined,
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
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
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

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const response = await this.privateGetVenuesVenueIdAccountsAccountIdTransactions (params);
        return this.parseTransactions (response['result'], currency, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //      [ '0.03177000', '0.0643501', 'sell', '2019-01-27T23:02:04Z' ]
        //
        // fetchMyTrades (private)
        //
        //      { id: '9cdb109c-d035-47e2-81f8-a0c802c9c5f9',
        //        orderId: 'a38d8bcb-9ff5-4c52-81a0-a40196a66462',
        //        marketId: 'XLMUSD',
        //        side: 'sell',
        //        size: '1.0000000',
        //        price: '0.10440600',
        //        settled: true,
        //        maker: false,
        //        executedAt: '2019-02-01T18:44:21Z' }
        //
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat2 (trade, 0, 'price');
        const amount = this.safeFloat2 (trade, 1, 'size');
        const side = this.safeString2 (trade, 2, 'side');
        const datetime = this.safeString2 (trade, 3, 'executedAt');
        const order = this.safeString (trade, 'orderId');
        const takerOrMaker = trade['maker'] ? 'maker' : 'taker';
        return {
            'symbol': symbol,
            'price': price,
            'amount': amount,
            'side': side,
            'datetime': datetime,
            'order': order,
            'timestamp': this.parse8601 (datetime),
            'takerOrMaker': takerOrMaker,
            'info': trade,
            'cost': price * amount,
            'fees': {
                'cost': undefined,
                'currency': undefined,
                'rate': undefined,
            },
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
        const datetime = this.safeString (response, 'timestamp');
        return {
            'id': undefined,
            'datetime': datetime,
            'timestamp': this.parse8601 (datetime),
            'info': response,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'orderId': id,
        };
        const response = await this.privateDeleteVenuesVenueIdAccountsAccountIdOrdersOrderId (this.extend (request, params));
        const datetime = this.safeString (response, 'timestamp');
        return {
            'id': id,
            'datetime': datetime,
            'timestamp': this.parse8601 (datetime),
            'info': response,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.privateGetVenuesVenueIdAccountsAccountIdOrders (params);
        const orders = response['result'];
        return this.parseOrders (orders, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
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
            let account = {};
            account['total'] = this.safeFloat (entry, 'amount', 0.0);
            account['available'] = this.safeFloat (entry, 'availableForTrade', 0.0);
            account['free'] = account['total'] - account['available'];
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.privateGetVenuesVenueIdAccountsAccountIdTrades (params);
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
        return await this.privatePostVenuesVenueIdAccounts (params);
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
        let endpoint = '/' + this.version + '/' + this.implodeParams (path, params);
        const rawEndpoint = endpoint;
        let query = this.omit (params, this.extractParams (path));
        let endpart = '';
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

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const extractedParams = this.extractParams (path);
        for (let i = 0; i < extractedParams.length; i++) {
            let param = extractedParams[i];
            if (!(param in params)) {
                if (param === 'venueId') {
                    params['venueId'] = this.options['venues']['main'];
                } else if (param === 'accountId') {
                    if (this.options['accountId'] === undefined) {
                        throw new AuthenticationError (this.id + ' ' + path + ' requires an accountId');
                    }
                    params['accountId'] = this.options['accountId'];
                }
            }
        }
        return await this.fetch2 (path, api, method, params, headers, body);
    }
};
