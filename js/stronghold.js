'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InvalidNonce, AuthenticationError, AccountSuspended, InsufficientFunds, ExchangeError, ArgumentsRequired, NotSupported } = require ('./base/errors');

// ----------------------------------------------------------------------------

module.exports = class stronghold extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'stronghold',
            'name': 'Stronghold',
            'country': [ 'US' ],
            'rateLimit': 1000,
            'version': 'v1',
            'comment': 'This comment is optional',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/52160042-98c1f300-26be-11e9-90dd-da8473944c83.jpg',
                'api': {
                    'public': 'https://api.stronghold.co',
                    'private': 'https://api.stronghold.co',
                },
                'www': 'https://stronghold.co',
                'doc': [
                    'https://docs.stronghold.co',
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'has': {
                'cancelOrder': true,
                'createDepositAddress': true,
                'createOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchDepositAddress': false,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTransactions': true,
                'withdraw': true,
            },
            'api': {
                'public': {
                    'get': [
                        'utilities/time',
                        'utilities/uuid',
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
                        'venues/{venueId}/accounts',
                        'venues/{venueId}/accounts/{accountId}',
                        'venues/{venueId}/accounts/{accountId}/payments/{paymentId}',
                        'venues/{venueId}/accounts/{accountId}/orders',
                        'venues/{venueId}/accounts/{accountId}/trades',
                        'venues/{venueId}/accounts/{accountId}/transactions',
                    ],
                    'post': [
                        'venues/{venueId}/accounts',
                        'venues/{venueId}/accounts/{accountId}/orders',
                        'venues/{venueId}/accounts/{accountId}/deposit',
                        'venues/{venueId}/accounts/{accountId}/withdrawal',
                        'venues/{venueId}/accounts/{accountId}/payments',
                        'venues/{venueId}/accounts/{accountId}/payments/{paymentId}/stop',
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
                'accountId': undefined,
                'venueId': 'trade-public',
                'venues': {
                    'trade': 'trade-public',
                    'sandbox': 'sandbox-public',
                },
                'paymentMethods': {
                    'ETH': 'ethereum',
                    'BTC': 'bitcoin',
                    'XLM': 'stellar',
                    'XRP': 'ripple',
                    'LTC': 'litecoin',
                    'SHX': 'stellar',
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

    async getActiveAccount () {
        if (this.options['accountId'] !== undefined) {
            return this.options['accountId'];
        }
        await this.loadAccounts ();
        const numAccounts = this.accounts.length;
        if (numAccounts > 0) {
            return this.accounts[0]['id'];
        }
        throw new ExchangeError (this.id + ' requires an accountId.');
    }

    async fetchAccounts (params = {}) {
        const request = {
            'venueId': this.options['venueId'],
        };
        const response = await this.privateGetVenuesVenueIdAccounts (this.extend (request, params));
        //
        //   [ { id: '34080200-b25a-483d-a734-255d30ba324d',
        //       venueSpecificId: '' } ... ]
        //
        return response['result'];
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetUtilitiesTime (params);
        //
        //     {
        //         "requestId": "6de8f506-ad9d-4d0d-94f3-ec4d55dfcdb9",
        //         "timestamp": 1536436649207281,
        //         "success": true,
        //         "statusCode": 200,
        //         "result": {
        //             "timestamp": "2018-09-08T19:57:29.207282Z"
        //         }
        //     }
        //
        return this.parse8601 (this.safeString (response['result'], 'timestamp'));
    }

    async fetchMarkets (params = {}) {
        const request = {
            'venueId': this.options['venueId'],
        };
        const response = await this.publicGetVenuesVenueIdMarkets (this.extend (request, params));
        const data = response['result'];
        //
        //     [
        //         {
        //             id: 'SHXUSD',
        //             baseAssetId: 'SHX/stronghold.co',
        //             counterAssetId: 'USD/stronghold.co',
        //             minimumOrderSize: '1.0000000',
        //             minimumOrderIncrement: '1.0000000',
        //             minimumPriceIncrement: '0.00010000',
        //             displayDecimalsPrice: 4,
        //             displayDecimalsAmount: 0
        //         },
        //         ...
        //     ]
        //
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = entry['id'];
            const baseId = this.safeString (entry, 'baseAssetId');
            const quoteId = this.safeString (entry, 'counterAssetId');
            const baseAssetId = baseId.split ('/')[0];
            const quoteAssetId = quoteId.split ('/')[0];
            const base = this.safeCurrencyCode (baseAssetId);
            const quote = this.safeCurrencyCode (quoteAssetId);
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
                'precision': precision,
                'info': entry,
                'limits': limits,
                'active': undefined,
            };
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const request = {
            'venueId': this.options['venueId'],
        };
        const response = await this.publicGetVenuesVenueIdAssets (this.extend (request, params));
        //
        //     [
        //         {
        //             id: 'XLM/native',
        //             alias: '',
        //             code: 'XLM',
        //             name: '',
        //             displayDecimalsFull: 7,
        //             displayDecimalsSignificant: 2,
        //         },
        //         ...
        //     ]
        //
        const data = response['result'];
        const result = {};
        const limits = {
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
            'withdraw': {
                'min': undefined,
                'max': undefined,
            },
        };
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const assetId = this.safeString (entry, 'id');
            const currencyId = this.safeString (entry, 'code');
            const code = this.safeCurrencyCode (currencyId);
            const precision = this.safeInteger (entry, 'displayDecimalsFull');
            result[code] = {
                'code': code,
                'id': assetId,
                'precision': precision,
                'info': entry,
                'active': undefined,
                'name': undefined,
                'limits': limits,
                'fee': undefined,
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = {
            'marketId': marketId,
            'venueId': this.options['venueId'],
        };
        const response = await this.publicGetVenuesVenueIdMarketsMarketIdOrderbook (this.extend (request, params));
        //
        //     {
        //         marketId: 'ETHBTC',
        //         bids: [
        //             [ '0.031500', '7.385000' ],
        //             ...,
        //         ],
        //         asks: [
        //             [ '0.031500', '7.385000' ],
        //             ...,
        //         ],
        //     }
        //
        const data = response['result'];
        const timestamp = this.parse8601 (this.safeString (response, 'timestamp'));
        return this.parseOrderBook (data, timestamp);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
            'venueId': this.options['venueId'],
        };
        const response = await this.publicGetVenuesVenueIdMarketsMarketIdTrades (this.extend (request, params));
        //
        //     {
        //         "requestId": "4d343700-b53f-4975-afcc-732ae9d3c828",
        //         "timestamp": "2018-11-08T19:22:11.399543Z",
        //         "success": true,
        //         "statusCode": 200,
        //         "result": {
        //             "marketId": "",
        //             "trades": [
        //                 [ "0.9", "3.10", "sell", "2018-11-08T19:22:11.399547Z" ],
        //                 ...
        //             ],
        //         }
        //     }
        //
        return this.parseTrades (response['result']['trades'], market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //      [ '0.03177000', '0.0643501', 'sell', '2019-01-27T23:02:04Z' ]
        //
        // fetchMyTrades (private)
        //
        //     {
        //         id: '9cdb109c-d035-47e2-81f8-a0c802c9c5f9',
        //         orderId: 'a38d8bcb-9ff5-4c52-81a0-a40196a66462',
        //         marketId: 'XLMUSD',
        //         side: 'sell',
        //         size: '1.0000000',
        //         price: '0.10440600',
        //         settled: true,
        //         maker: false,
        //         executedAt: '2019-02-01T18:44:21Z'
        //     }
        //
        let id = undefined;
        let takerOrMaker = undefined;
        let price = undefined;
        let amount = undefined;
        let cost = undefined;
        let side = undefined;
        let timestamp = undefined;
        let orderId = undefined;
        if (Array.isArray (trade)) {
            price = parseFloat (trade[0]);
            amount = parseFloat (trade[1]);
            side = trade[2];
            timestamp = this.parse8601 (trade[3]);
        } else {
            id = this.safeString (trade, 'id');
            price = this.safeFloat (trade, 'price');
            amount = this.safeFloat (trade, 'size');
            side = this.safeString (trade, 'side');
            timestamp = this.parse8601 (this.safeString (trade, 'executedAt'));
            orderId = this.safeString (trade, 'orderId');
            const marketId = this.safeString (trade, 'marketId');
            market = this.safeValue (this.markets_by_id, marketId);
            const isMaker = this.safeValue (trade, 'maker');
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        if (amount !== undefined && price !== undefined) {
            cost = amount * price;
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'order': orderId,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': takerOrMaker,
            'fee': {
                'cost': undefined,
                'currency': undefined,
                'rate': undefined,
            },
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = this.extend ({
            'venueId': this.options['venueId'],
            'accountId': await this.getActiveAccount (),
        }, params);
        if (!request['accountId']) {
            throw new ArgumentsRequired (this.id + " fetchTransactions requires either the 'accountId' extra parameter or exchange.options['accountId'] = 'YOUR_ACCOUNT_ID'.");
        }
        const response = await this.privateGetVenuesVenueIdAccountsAccountIdTransactions (request);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (response['result'], currency, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'queued': 'pending',
            'settling': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        // {
        //     "id": "6408e003-0f14-4457-9340-ba608992ad5c",
        //     "status": "queued",
        //     "direction": "outgoing",
        //     "amount": "98.95000000",
        //     "assetId": "XLM/native",
        //     "sourceAccount": {
        //       "id": "774fa8ef-600b-4636-b9ed-cd6d23421915",
        //       "venueSpecificId": "GC5FIBIQZTQRMJE34GYF5EKH77GEQ3OHFX3NIP5OKDIZFA6VERLZSHY6"
        //     },
        //     "destinationAccount": {
        //       "id": "f72b9fb5-9607-4dd3-b31f-6ded21337056",
        //       "venueSpecificId": "GAOWV6CYBE7DEWSWPODXLMI5YB75VXXZJX5OYVQ2YLZH2TVA3TMMSNYW"
        //     }
        //   }
        const id = this.safeString (transaction, 'id');
        const assetId = this.safeString (transaction, 'assetId');
        let code = undefined;
        if (assetId !== undefined) {
            const currencyId = assetId.split ('/')[0];
            code = this.safeCurrencyCode (currencyId);
        } else {
            if (currency !== undefined) {
                code = currency['code'];
            }
        }
        const amount = this.safeFloat (transaction, 'amount');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const feeCost = this.safeFloat (transaction, 'feeAmount');
        let feeRate = undefined;
        if (feeCost !== undefined) {
            feeRate = feeCost / amount;
        }
        const direction = this.safeString (transaction, 'direction');
        const datetime = this.safeString (transaction, 'requestedAt');
        const timestamp = this.parse8601 (datetime);
        const updated = this.parse8601 (this.safeString (transaction, 'updatedAt'));
        const type = (direction === 'outgoing' || direction === 'withdrawal') ? 'withdrawal' : 'deposit';
        const fee = {
            'cost': feeCost,
            'rate': feeRate,
        };
        return {
            'id': id,
            'info': transaction,
            'currency': code,
            'amount': amount,
            'status': status,
            'fee': fee,
            'tag': undefined,
            'type': type,
            'updated': updated,
            'address': undefined,
            'txid': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.extend ({
            'venueId': this.options['venueId'],
            'accountId': await this.getActiveAccount (),
            'marketID': market['id'],
            'type': type,
            'side': side,
            'size': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
        }, params);
        if (!request['accountId']) {
            throw new ArgumentsRequired (this.id + " createOrder requires either the 'accountId' extra parameter or exchange.options['accountId'] = 'YOUR_ACCOUNT_ID'.");
        }
        const response = await this.privatePostVenuesVenueIdAccountsAccountIdOrders (request);
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = this.extend ({
            'venueId': this.options['venueId'],
            'accountId': await this.getActiveAccount (),
            'orderId': id,
        }, params);
        if (!request['accountId']) {
            throw new ArgumentsRequired (this.id + " cancelOrder requires either the 'accountId' extra parameter or exchange.options['accountId'] = 'YOUR_ACCOUNT_ID'.");
        }
        const response = await this.privateDeleteVenuesVenueIdAccountsAccountIdOrdersOrderId (request);
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = this.extend ({
            'venueId': this.options['venueId'],
            'accountId': await this.getActiveAccount (),
        }, params);
        if (!request['accountId']) {
            throw new ArgumentsRequired (this.id + " cancelOrder requires either the 'accountId' extra parameter or exchange.options['accountId'] = 'YOUR_ACCOUNT_ID'.");
        }
        const response = await this.privateGetVenuesVenueIdAccountsAccountIdOrders (request);
        return this.parseOrders (response['result'], market, since, limit);
    }

    parseOrder (order, market = undefined) {
        // { id: '178596',
        //   marketId: 'XLMUSD',
        //   side: 'buy',
        //   size: '1.0000000',
        //   sizeFilled: '0',
        //   price: '0.10000000',
        //   placedAt: '2019-02-01T19:47:52Z' }
        const marketId = this.safeString (order, 'marketId');
        if (marketId !== undefined) {
            market = this.safeValue (this.marketsById, marketId);
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (order, 'id');
        const datetime = this.safeString (order, 'placedAt');
        const amount = this.safeFloat (order, 'size');
        const price = this.safeFloat (order, 'price');
        const filled = this.safeFloat (order, 'sizeFilled');
        let cost = undefined;
        let remaining = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                remaining = amount - filled;
            }
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        return {
            'id': id,
            'clientOrderId': undefined,
            'info': order,
            'symbol': symbol,
            'datetime': datetime,
            'timestamp': this.parse8601 (datetime),
            'side': this.safeString (order, 'side'),
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'price': price,
            'cost': cost,
            'trades': [],
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'type': undefined,
            'average': undefined,
            'fee': undefined,
        };
    }

    nonce () {
        return this.seconds ();
    }

    setSandboxMode (enabled) {
        if (enabled) {
            this.options['venueId'] = this.options['venues']['sandbox'];
        } else {
            this.options['venueId'] = this.options['venues']['trade'];
        }
    }

    async fetchBalance (params = {}) {
        const request = this.extend ({
            'venueId': this.options['venueId'],
            'accountId': await this.getActiveAccount (),
        }, params);
        if (!('accountId' in request)) {
            throw new ArgumentsRequired (this.id + " fetchBalance requires either the 'accountId' extra parameter or exchange.options['accountId'] = 'YOUR_ACCOUNT_ID'.");
        }
        const response = await this.privateGetVenuesVenueIdAccountsAccountId (request);
        const balances = this.safeValue (response['result'], 'balances');
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const assetId = this.safeString (balance, 'assetId');
            if (assetId !== undefined) {
                const currencyId = assetId.split ('/')[0];
                const code = this.safeCurrencyCode (currencyId);
                const account = {};
                account['total'] = this.safeFloat (balance, 'amount');
                account['free'] = this.safeFloat (balance, 'availableForTrade');
                result[code] = account;
            }
        }
        return this.parseBalance (result);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = this.extend ({
            'venueId': this.options['venueId'],
            'accountId': await this.getActiveAccount (),
        }, params);
        if (!request['accountId']) {
            throw new ArgumentsRequired (this.id + " fetchMyTrades requires either the 'accountId' extra parameter or exchange.options['accountId'] = 'YOUR_ACCOUNT_ID'.");
        }
        const response = await this.privateGetVenuesVenueIdAccountsAccountIdTrades (request);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseTrades (response['result'], market, since, limit);
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const paymentMethod = this.safeString (this.options['paymentMethods'], code);
        if (paymentMethod === undefined) {
            throw new NotSupported (this.id + ' createDepositAddress requires code to be BTC, ETH, or XLM');
        }
        const request = this.extend ({
            'venueId': this.options['venueId'],
            'accountId': await this.getActiveAccount (),
            'assetId': this.currencyId (code),
            'paymentMethod': paymentMethod,
        }, params);
        if (!request['accountId']) {
            throw new ArgumentsRequired (this.id + " createDepositAddress requires either the 'accountId' extra parameter or exchange.options['accountId'] = 'YOUR_ACCOUNT_ID'.");
        }
        const response = await this.privatePostVenuesVenueIdAccountsAccountIdDeposit (request);
        //
        //     {
        //         assetId: 'BTC/stronghold.co',
        //         paymentMethod: 'bitcoin',
        //         paymentMethodInstructions: {
        //             deposit_address: 'mzMT9Cfw8JXVWK7rMonrpGfY9tt57ytHt4',
        //             reference: 'sometimes-exists',
        //         },
        //         direction: 'deposit',
        //     }
        //
        const data = response['result']['paymentMethodInstructions'];
        const address = data['deposit_address'];
        const tag = this.safeString (data, 'reference');
        return {
            'currency': code,
            'address': this.checkAddress (address),
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        const paymentMethod = this.safeString (this.options['paymentMethods'], code);
        if (paymentMethod === undefined) {
            throw new NotSupported (this.id + ' withdraw requires code to be BTC, ETH, or XLM');
        }
        const request = this.extend ({
            'venueId': this.options['venueId'],
            'accountId': await this.getActiveAccount (),
            'assetId': this.currencyId (code),
            'amount': amount,
            'paymentMethod': paymentMethod,
            'paymentMethodDetails': {
                'withdrawal_address': address,
            },
        }, params);
        if (tag !== undefined) {
            request['paymentMethodDetails']['reference'] = tag;
        }
        if (!request['accountId']) {
            throw new ArgumentsRequired (this.id + " withdraw requires either the 'accountId' extra parameter or exchange.options['accountId'] = 'YOUR_ACCOUNT_ID'.");
        }
        const response = await this.privatePostVenuesVenueIdAccountsAccountIdWithdrawal (request);
        //
        //     {
        //         "id": "5be48892-1b6e-4431-a3cf-34b38811e82c",
        //         "assetId": "BTC/stronghold.co",
        //         "amount": "10",
        //         "feeAmount": "0.01",
        //         "paymentMethod": "bitcoin",
        //         "paymentMethodDetails": {
        //             "withdrawal_address": "1vHysJeXYV6nqhroBaGi52QWFarbJ1dmQ"
        //         },
        //         "direction": "withdrawal",
        //         "status": "pending"
        //     }
        //
        const data = response['result'];
        return {
            'id': this.safeString (data, 'id'),
            'info': response,
        };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fallback to base error handler by default
        }
        //
        //     {
        //         requestId: '3e7d17ab-b316-4721-b5aa-f7e6497eeab9',
        //         timestamp: '2019-01-31T21:59:06.696855Z',
        //         success: true,
        //         statusCode: 200,
        //         result: []
        //     }
        //
        const errorCode = this.safeString (response, 'errorCode');
        if (errorCode in this.exceptions) {
            const Exception = this.exceptions[errorCode];
            throw new Exception (this.id + ' ' + body);
        }
        const success = this.safeValue (response, 'success');
        if (!success) {
            throw new ExchangeError (this.id + ' ' + body);
        }
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + request;
        if (Object.keys (query).length) {
            if (method === 'GET') {
                url += '?' + this.urlencode (query);
            } else {
                body = this.json (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.nonce ().toString ();
            let payload = timestamp + method + request;
            if (body !== undefined) {
                payload += body;
            }
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
