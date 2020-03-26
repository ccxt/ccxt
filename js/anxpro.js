'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, InsufficientFunds, ExchangeNotAvailable, InvalidOrder, BadRequest, OrderNotFound, NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class anxpro extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'anxpro',
            'name': 'ANXPro',
            'countries': [ 'JP', 'SG', 'HK', 'NZ' ],
            'rateLimit': 1500,
            'userAgent': this.userAgents['chrome'],
            'has': {
                'CORS': false,
                'fetchCurrencies': true,
                'fetchOHLCV': false,
                'fetchTrades': false,
                'fetchOpenOrders': true,
                'fetchDepositAddress': true,
                'fetchTransactions': true,
                'fetchMyTrades': true,
                'createDepositAddress': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg',
                'api': {
                    'public': 'https://anxpro.com/api/2',
                    'private': 'https://anxpro.com/api/2',
                    'v3public': 'https://anxpro.com/api/3',
                    'v3private': 'https://anxpro.com/api/3',
                },
                'www': 'https://anxpro.com',
                'doc': [
                    'https://anxv2.docs.apiary.io',
                    'https://anxv3.docs.apiary.io',
                    'https://anxpro.com/pages/api',
                ],
            },
            'api': {
                'v3public': {
                    'get': [
                        'currencyStatic',
                    ],
                },
                'v3private': {
                    'post': [
                        'register/register',
                        'register/verifyRegistration',
                        'register/resendVerification',
                        'register/autoRegister',
                        'account',
                        'subaccount/new',
                        'transaction/list',
                        'order/list',
                        'trade/list',
                        'send',
                        'receive',
                        'receive/create',
                        'batch/new',
                        'batch/add',
                        'batch/list',
                        'batch/info',
                        'batch/closeForSend',
                        'order/new',
                        'order/info',
                        'order/cancel',
                        'retail/quote',
                        'retail/trade',
                        'validateAddress',
                        'address/check',
                        'alert/create',
                        'alert/delete',
                        'alert/list',
                        'kyc/personal',
                        'kyc/document',
                        'kyc/status',
                        'kyc/verifyCode',
                        'news/list',
                        'press/list',
                        'announcements/list',
                        'apiDoc/list',
                    ],
                },
                'public': {
                    'get': [
                        '{currency_pair}/money/ticker',
                        '{currency_pair}/money/depth/full',
                        '{currency_pair}/money/trade/fetch', // disabled by ANXPro
                    ],
                },
                'private': {
                    'post': [
                        '{currency_pair}/money/order/add',
                        '{currency_pair}/money/order/cancel',
                        '{currency_pair}/money/order/quote',
                        '{currency_pair}/money/order/result',
                        '{currency_pair}/money/orders',
                        'money/{currency}/address',
                        'money/{currency}/send_simple',
                        'money/info',
                        'money/trade/list',
                        'money/wallet/history',
                    ],
                },
            },
            'httpExceptions': {
                '403': AuthenticationError,
            },
            'exceptions': {
                'exact': {
                    // v2
                    'Insufficient Funds': InsufficientFunds,
                    'Trade value too small': InvalidOrder,
                    'The currency pair is not supported': BadRequest,
                    'Order amount is too low': InvalidOrder,
                    'Order amount is too high': InvalidOrder,
                    'order rate is too low': InvalidOrder,
                    'order rate is too high': InvalidOrder,
                    'Too many open orders': InvalidOrder,
                    'Unexpected error': ExchangeError,
                    'Order Engine is offline': ExchangeNotAvailable,
                    'No executed order with that identifer found': OrderNotFound,
                    'Unknown server error, please contact support.': ExchangeError,
                    'Not available': ExchangeNotAvailable, // { "status": "Not available" }
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.1 / 100,
                    'taker': 0.2 / 100,
                },
            },
            'options': {
                'fetchMyTradesMethod': 'private_post_money_trade_list', // or 'v3private_post_trade_list'
            },
        });
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        // todo: migrate this to fetchLedger
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['max'] = limit;
        }
        const currency = (code === undefined) ? undefined : this.currency (code);
        if (currency !== undefined) {
            request['ccy'] = currency['id'];
        }
        const response = await this.v3privatePostTransactionList (this.extend (request, params));
        //
        //     {
        //         transactions: [
        //             {
        //                 transactionClass: 'COIN',
        //                 uuid: '7896857b-2ed6-4c62-ba4c-619837438d9c',
        //                 userUuid: '82027ee9-cb59-4f29-80d6-f7e793f39ad4',
        //                 amount: -17865.72689976,
        //                 fee: 1,
        //                 balanceBefore: 17865.72689976,
        //                 balanceAfter: 17865.72689976,
        //                 ccy: 'XRP',
        //                 transactionState: 'PROCESSED',
        //                 transactionType: 'WITHDRAWAL',
        //                 received: '1551357946000',
        //                 processed: '1551357946000',
        //                 timestampMillis: '1557441435932',
        //                 displayTitle: 'Coin Withdrawal',
        //                 displayDescription: 'Withdraw to: rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg?dt=3750180345',
        //                 coinAddress: 'rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg?dt=3750180345',
        //                 coinTransactionId: '68444611753E9D8F5C33DCBBF43F01391070F79CAFCF7625397D1CEFA519064A',
        //                 subAccount: [
        //                     Object
        //                 ]
        //             },
        //             {
        //                 transactionClass: 'FILL',
        //                 uuid: 'a5ae54de-c14a-4ef8-842d-56000c9dc7ab',
        //                 userUuid: '82027ee9-cb59-4f29-80d6-f7e793f39ad4',
        //                 amount: 0.09006364,
        //                 fee: 0.00018013,
        //                 balanceBefore: 0.3190001,
        //                 balanceAfter: 0.40888361,
        //                 ccy: 'BTC',
        //                 transactionState: 'PROCESSED',
        //                 transactionType: 'FILL_CREDIT',
        //                 received: '1551357057000',
        //                 processed: '1551357057000',
        //                 timestampMillis: '1557441435956',
        //                 displayTitle: 'Order Fill',
        //                 displayDescription: 'Buy BTC @ 3008.53930 EUR/BTC'
        //             }
        //         ],
        //         count: ...,
        //         timestamp: '1557441435971',
        //         resultCode: 'OK'
        //     }
        //
        const transactions = this.safeValue (response, 'transactions', []);
        const grouped = this.groupBy (transactions, 'transactionType', []);
        const depositsAndWithdrawals = this.arrayConcat (this.safeValue (grouped, 'DEPOSIT', []), this.safeValue (grouped, 'WITHDRAWAL', []));
        return this.parseTransactions (depositsAndWithdrawals, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdrawal
        //
        //     {
        //         transactionClass: 'COIN',
        //         uuid: 'bff91938-4dad-4c48-9db6-468324ce96c1',
        //         userUuid: '82027ee9-cb59-4f29-80d6-f7e793f39ad4',
        //         amount: -0.40888361,
        //         fee: 0.002,
        //         balanceBefore: 0.40888361,
        //         balanceAfter: 0.40888361,
        //         ccy: 'BTC',
        //         transactionState: 'PROCESSED',
        //         transactionType: 'WITHDRAWAL',
        //         received: '1551357156000',
        //         processed: '1551357156000',
        //         timestampMillis: '1557441846213',
        //         displayTitle: 'Coin Withdrawal',
        //         displayDescription: 'Withdraw to: 1AHnhqbvbYx3rnZx8uC7NbFZaTe4tafFHX',
        //         coinAddress: '1AHnhqbvbYx3rnZx8uC7NbFZaTe4tafFHX',
        //         coinTransactionId:
        //         'ab80abcb62bf6261ebc827c73dd59a4ce15d740b6ba734af6542f43b6485b923',
        //         subAccount: {
        //             uuid: '652e1add-0d0b-462c-a03c-d6197c825c1a',
        //             name: 'DEFAULT'
        //         }
        //     }
        //
        // deposit
        //
        //     {
        //         "transactionClass": "COIN",
        //         "uuid": "eb65576f-c1a8-423c-8e2f-fa50109b2eab",
        //         "userUuid": "82027ee9-cb59-4f29-80d6-f7e793f39ad4",
        //         "amount": 3.99287184,
        //         "fee": 0,
        //         "balanceBefore": 8.39666034,
        //         "balanceAfter": 12.38953218,
        //         "ccy": "ETH",
        //         "transactionState": "PROCESSED",
        //         "transactionType": "DEPOSIT",
        //         "received": "1529420056000",
        //         "processed": "1529420766000",
        //         "timestampMillis": "1557442743854",
        //         "displayTitle": "Coin Deposit",
        //         "displayDescription": "Deposit to: 0xf123aa44fadea913a7da99cc2ee202db684ce0e3",
        //         "coinTransactionId": "0x33a3e5ea7c034dc5324a88aa313962df0a5d571ab4bcc3cb00b876b1bdfc54f7",
        //         "coinConfirmations": 51,
        //         "coinConfirmationsRequired": 45,
        //         "subAccount": {"uuid": "aba1de05-c7c6-49d7-84ab-a6aca0e827b6", "name": "DEFAULT"}
        //     }
        //
        const timestamp = this.safeInteger (transaction, 'received');
        const updated = this.safeInteger (transaction, 'processed');
        const transactionType = this.safeString (transaction, 'transactionType');
        let type = undefined;
        let amount = this.safeFloat (transaction, 'amount');
        let address = this.safeString (transaction, 'coinAddress');
        let tag = undefined;
        if (transactionType === 'WITHDRAWAL') {
            type = 'withdrawal';
            amount = -amount;
            if (address) {
                //  xrp: "coinAddress": "rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg?dt=3750180345",
                if (address.indexOf ('?dt=') >= 0) {
                    const parts = address.split ('?dt=');
                    address = parts[0];
                    tag = parts[1];
                }
            }
        } else if (transactionType === 'DEPOSIT') {
            if (!address) {
                const displayDescription = this.safeString (transaction, 'displayDescription');
                const addressText = displayDescription.replace ('Deposit to: ', '');
                if (addressText.length > 0) {
                    //  eth: "displayDescription": "Deposit to: 0xf123aa44fadea913a7da99cc2ee202db684ce0e3",
                    //  xrp: "displayDescription": "Deposit to: rUjxty1WWLwX1evhKf3C2XNZDMcXEZ9ToJ?dt=504562345",
                    if (addressText.indexOf ('?dt=') >= 0) {
                        const parts = addressText.split ('?dt=');
                        address = parts[0];
                        tag = parts[1];
                    } else {
                        address = addressText;
                    }
                }
            }
            type = 'deposit';
        }
        const currencyId = this.safeString (transaction, 'ccy');
        const code = this.safeCurrencyCode (currencyId);
        const transactionState = this.safeString (transaction, 'transactionState');
        const status = this.parseTransactionStatus (transactionState);
        const feeCost = this.safeFloat (transaction, 'fee');
        const netAmount = amount - feeCost;
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': this.safeString (transaction, 'uuid'),
            'currency': code,
            'amount': netAmount,
            'address': address,
            'tag': tag,
            'status': status,
            'type': type,
            'updated': updated,
            'txid': this.safeString (transaction, 'coinTransactionId'),
            'fee': {
                'cost': feeCost,
                'currency': code,
            },
            'info': transaction,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'PROCESSED': 'ok',
            'REVERSED': 'canceled',
            'CANCELLED_INSUFFICIENT_FUNDS': 'canceled',
            'CANCELLED_LIMIT_BREACH': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        //
        // v2
        //
        //     {
        //         result: 'success',
        //         data: [
        //             {
        //                 tradeId: 'c2ed821d-717a-4b7e-beb0-a9ba60e8f5a0',
        //                 orderId: '5a65ae21-c7a8-4009-b3af-306c2ad21a02',
        //                 timestamp: '1551357057000',
        //                 tradedCurrencyFillAmount: '0.09006364',
        //                 settlementCurrencyFillAmount: '270.96',
        //                 settlementCurrencyFillAmountUnrounded: '270.96000000',
        //                 price: '3008.53930',
        //                 ccyPair: 'BTCEUR',
        //                 side: 'BUY' // missing in v3
        //             },
        //             {
        //                 tradeId: 'fc0d3a9d-8b0b-4dff-b2e9-edd160785210',
        //                 orderId: '8161ae6e-251a-4eed-a56f-d3d6555730c1',
        //                 timestamp: '1551357033000',
        //                 tradedCurrencyFillAmount: '0.06521746',
        //                 settlementCurrencyFillAmount: '224.09',
        //                 settlementCurrencyFillAmountUnrounded: '224.09000000',
        //                 price: '3436.04305',
        //                 ccyPair: 'BTCUSD',
        //                 side: 'BUY' // missing in v3
        //             },
        //         ]
        //     }
        //
        // v3
        //
        //     {
        //         trades: [
        //             {
        //                 tradeId: 'c2ed821d-717a-4b7e-beb0-a9ba60e8f5a0',
        //                 orderId: '5a65ae21-c7a8-4009-b3af-306c2ad21a02',
        //                 timestamp: '1551357057000',
        //                 tradedCurrencyFillAmount: '0.09006364',
        //                 settlementCurrencyFillAmount: '270.96',
        //                 settlementCurrencyFillAmountUnrounded: '270.96000000',
        //                 price: '3008.53930',
        //                 ccyPair: 'BTCEUR'
        //             },
        //             {
        //                 tradeId: 'fc0d3a9d-8b0b-4dff-b2e9-edd160785210',
        //                 orderId: '8161ae6e-251a-4eed-a56f-d3d6555730c1',
        //                 timestamp: '1551357033000',
        //                 tradedCurrencyFillAmount: '0.06521746',
        //                 settlementCurrencyFillAmount: '224.09',
        //                 settlementCurrencyFillAmountUnrounded: '224.09000000',
        //                 price: '3436.04305',
        //                 ccyPair: 'BTCUSD'
        //             },
        //         ],
        //         count: 3,
        //         timestamp: '1557438456732',
        //         resultCode: 'OK'
        //     }
        //
        const request = {};
        if (limit !== undefined) {
            request['max'] = limit;
        }
        const method = this.safeString (this.options, 'fetchMyTradesMethod', 'private_post_money_trade_list');
        const response = await this[method] (this.extend (request, params));
        const trades = this.safeValue2 (response, 'trades', 'data', []);
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // v2
        //
        //     {
        //         tradeId: 'fc0d3a9d-8b0b-4dff-b2e9-edd160785210',
        //         orderId: '8161ae6e-251a-4eed-a56f-d3d6555730c1',
        //         timestamp: '1551357033000',
        //         tradedCurrencyFillAmount: '0.06521746',
        //         settlementCurrencyFillAmount: '224.09',
        //         settlementCurrencyFillAmountUnrounded: '224.09000000',
        //         price: '3436.04305',
        //         ccyPair: 'BTCUSD',
        //         side: 'BUY', // missing in v3
        //     }
        //
        // v3
        //
        //     {
        //         tradeId: 'fc0d3a9d-8b0b-4dff-b2e9-edd160785210',
        //         orderId: '8161ae6e-251a-4eed-a56f-d3d6555730c1',
        //         timestamp: '1551357033000',
        //         tradedCurrencyFillAmount: '0.06521746',
        //         settlementCurrencyFillAmount: '224.09',
        //         settlementCurrencyFillAmountUnrounded: '224.09000000',
        //         price: '3436.04305',
        //         ccyPair: 'BTCUSD'
        //     }
        //
        const id = this.safeString (trade, 'tradeId');
        const orderId = this.safeString (trade, 'orderId');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'tradedCurrencyFillAmount');
        const cost = this.safeFloat (trade, 'settlementCurrencyFillAmount');
        const side = this.safeStringLower (trade, 'side');
        let symbol = undefined;
        const marketId = this.safeString (trade, 'ccyPair');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchCurrencies (params = {}) {
        const response = await this.v3publicGetCurrencyStatic (params);
        //
        //   {
        //     "currencyStatic": {
        //       "currencies": {
        //         "HKD": {
        //           "decimals": 2,
        //           "minOrderSize": 1.00000000,
        //           "maxOrderSize": 10000000000.00000000,
        //           "displayDenominator": 1,
        //           "summaryDecimals": 0,
        //           "displayUnit": "HKD",
        //           "symbol": "$",
        //           "type": "FIAT",
        //           "engineSettings": {
        //             "depositsEnabled": false,
        //             "withdrawalsEnabled": true,
        //             "displayEnabled": true,
        //             "mobileAccessEnabled": true
        //           },
        //           "minOrderValue": 1.00000000,
        //           "maxOrderValue": 10000000000.00000000,
        //           "maxMarketOrderValue": 36000.00000000,
        //           "maxMarketOrderSize": 36000.00000000,
        //           "assetDivisibility": 0
        //         },
        //         "ETH": {
        //           "decimals": 8,
        //           "minOrderSize": 0.00010000,
        //           "maxOrderSize": 1000000000.00000000,
        //           "type": "CRYPTO",
        //           "confirmationThresholds": [
        //             { "confosRequired": 30, "threshold": 0.50000000 },
        //             { "confosRequired": 45, "threshold": 10.00000000 },
        //             { "confosRequired": 70 }
        //           ],
        //           "networkFee": 0.00500000,
        //           "engineSettings": {
        //             "depositsEnabled": true,
        //             "withdrawalsEnabled": true,
        //             "displayEnabled": true,
        //             "mobileAccessEnabled": true
        //           },
        //           "minOrderValue": 0.00010000,
        //           "maxOrderValue": 10000000000.00000000,
        //           "maxMarketOrderValue": 10000000000.00000000,
        //           "maxMarketOrderSize": 1000000000.00000000,
        //           "digitalCurrencyType": "ETHEREUM",
        //           "assetDivisibility": 0,
        //           "assetIcon": "/images/currencies/crypto/ETH.svg"
        //         },
        //       },
        //       "currencyPairs": {
        //         "ETHUSD": {
        //           "priceDecimals": 5,
        //           "engineSettings": {
        //             "tradingEnabled": true,
        //             "displayEnabled": true,
        //             "cancelOnly": true,
        //             "verifyRequired": false,
        //             "restrictedBuy": false,
        //             "restrictedSell": false
        //           },
        //           "minOrderRate": 10.00000000,
        //           "maxOrderRate": 10000.00000000,
        //           "displayPriceDecimals": 5,
        //           "tradedCcy": "ETH",
        //           "settlementCcy": "USD",
        //           "preferredMarket": "ANX",
        //           "chartEnabled": true,
        //           "simpleTradeEnabled": false
        //         },
        //       },
        //     },
        //     "timestamp": "1549840691039",
        //     "resultCode": "OK"
        //   }
        //
        const currencyStatic = this.safeValue (response, 'currencyStatic', {});
        const currencies = this.safeValue (currencyStatic, 'currencies', {});
        const result = {};
        const ids = Object.keys (currencies);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = currencies[id];
            const code = this.safeCurrencyCode (id);
            const engineSettings = this.safeValue (currency, 'engineSettings');
            const depositsEnabled = this.safeValue (engineSettings, 'depositsEnabled');
            const withdrawalsEnabled = this.safeValue (engineSettings, 'withdrawalsEnabled');
            const displayEnabled = this.safeValue (engineSettings, 'displayEnabled');
            const active = depositsEnabled && withdrawalsEnabled && displayEnabled;
            const precision = this.safeInteger (currency, 'decimals');
            const fee = this.safeFloat (currency, 'networkFee');
            const type = this.safeStringLower (currency, 'type');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': code,
                'type': type,
                'active': active,
                'precision': precision,
                'fee': fee,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (currency, 'minOrderSize'),
                        'max': this.safeFloat (currency, 'maxOrderSize'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeFloat (currency, 'minOrderValue'),
                        'max': this.safeFloat (currency, 'maxOrderValue'),
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.v3publicGetCurrencyStatic (params);
        //
        //   {
        //     "currencyStatic": {
        //       "currencies": {
        //         "HKD": {
        //           "decimals": 2,
        //           "minOrderSize": 1.00000000,
        //           "maxOrderSize": 10000000000.00000000,
        //           "displayDenominator": 1,
        //           "summaryDecimals": 0,
        //           "displayUnit": "HKD",
        //           "symbol": "$",
        //           "type": "FIAT",
        //           "engineSettings": {
        //             "depositsEnabled": false,
        //             "withdrawalsEnabled": true,
        //             "displayEnabled": true,
        //             "mobileAccessEnabled": true
        //           },
        //           "minOrderValue": 1.00000000,
        //           "maxOrderValue": 10000000000.00000000,
        //           "maxMarketOrderValue": 36000.00000000,
        //           "maxMarketOrderSize": 36000.00000000,
        //           "assetDivisibility": 0
        //         },
        //         "ETH": {
        //           "decimals": 8,
        //           "minOrderSize": 0.00010000,
        //           "maxOrderSize": 1000000000.00000000,
        //           "type": "CRYPTO",
        //           "confirmationThresholds": [
        //             { "confosRequired": 30, "threshold": 0.50000000 },
        //             { "confosRequired": 45, "threshold": 10.00000000 },
        //             { "confosRequired": 70 }
        //           ],
        //           "networkFee": 0.00500000,
        //           "engineSettings": {
        //             "depositsEnabled": true,
        //             "withdrawalsEnabled": true,
        //             "displayEnabled": true,
        //             "mobileAccessEnabled": true
        //           },
        //           "minOrderValue": 0.00010000,
        //           "maxOrderValue": 10000000000.00000000,
        //           "maxMarketOrderValue": 10000000000.00000000,
        //           "maxMarketOrderSize": 1000000000.00000000,
        //           "digitalCurrencyType": "ETHEREUM",
        //           "assetDivisibility": 0,
        //           "assetIcon": "/images/currencies/crypto/ETH.svg"
        //         },
        //       },
        //       "currencyPairs": {
        //         "ETHUSD": {
        //           "priceDecimals": 5,
        //           "engineSettings": {
        //             "tradingEnabled": true,
        //             "displayEnabled": true,
        //             "cancelOnly": true,
        //             "verifyRequired": false,
        //             "restrictedBuy": false,
        //             "restrictedSell": false
        //           },
        //           "minOrderRate": 10.00000000,
        //           "maxOrderRate": 10000.00000000,
        //           "displayPriceDecimals": 5,
        //           "tradedCcy": "ETH",
        //           "settlementCcy": "USD",
        //           "preferredMarket": "ANX",
        //           "chartEnabled": true,
        //           "simpleTradeEnabled": false
        //         },
        //       },
        //     },
        //     "timestamp": "1549840691039",
        //     "resultCode": "OK"
        //   }
        //
        const currencyStatic = this.safeValue (response, 'currencyStatic', {});
        const currencies = this.safeValue (currencyStatic, 'currencies', {});
        const currencyPairs = this.safeValue (currencyStatic, 'currencyPairs', {});
        const result = [];
        const ids = Object.keys (currencyPairs);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = currencyPairs[id];
            //
            //     "ETHUSD": {
            //       "priceDecimals": 5,
            //       "engineSettings": {
            //         "tradingEnabled": true,
            //         "displayEnabled": true,
            //         "cancelOnly": true,
            //         "verifyRequired": false,
            //         "restrictedBuy": false,
            //         "restrictedSell": false
            //       },
            //       "minOrderRate": 10.00000000,
            //       "maxOrderRate": 10000.00000000,
            //       "displayPriceDecimals": 5,
            //       "tradedCcy": "ETH",
            //       "settlementCcy": "USD",
            //       "preferredMarket": "ANX",
            //       "chartEnabled": true,
            //       "simpleTradeEnabled": false
            //     },
            //
            const baseId = this.safeString (market, 'tradedCcy');
            const quoteId = this.safeString (market, 'settlementCcy');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const baseCurrency = this.safeValue (currencies, baseId, {});
            const quoteCurrency = this.safeValue (currencies, quoteId, {});
            const precision = {
                'price': this.safeInteger (market, 'priceDecimals'),
                'amount': this.safeInteger (baseCurrency, 'decimals'),
            };
            const engineSettings = this.safeValue (market, 'engineSettings');
            const displayEnabled = this.safeValue (engineSettings, 'displayEnabled');
            const tradingEnabled = this.safeValue (engineSettings, 'tradingEnabled');
            const active = displayEnabled && tradingEnabled;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
                'active': active,
                'limits': {
                    'price': {
                        'min': this.safeFloat (market, 'minOrderRate'),
                        'max': this.safeFloat (market, 'maxOrderRate'),
                    },
                    'amount': {
                        'min': this.safeFloat (baseCurrency, 'minOrderSize'),
                        'max': this.safeFloat (baseCurrency, 'maxOrderSize'),
                    },
                    'cost': {
                        'min': this.safeFloat (quoteCurrency, 'minOrderValue'),
                        'max': this.safeFloat (quoteCurrency, 'maxOrderValue'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostMoneyInfo (params);
        const balance = this.safeValue (response, 'data', {});
        const wallets = this.safeValue (balance, 'Wallets', {});
        const currencyIds = Object.keys (wallets);
        const result = { 'info': balance };
        for (let c = 0; c < currencyIds.length; c++) {
            const currencyId = currencyIds[c];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const wallet = this.safeValue (wallets, currencyId);
            account['free'] = this.safeFloat (wallet['Available_Balance'], 'value');
            account['total'] = this.safeFloat (wallet['Balance'], 'value');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currency_pair': this.marketId (symbol),
        };
        const response = await this.publicGetCurrencyPairMoneyDepthFull (this.extend (request, params));
        const orderbook = this.safeValue (response, 'data', {});
        const timestamp = this.safeIntegerProduct (orderbook, 'dataUpdateTime', 0.001);
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currency_pair': this.marketId (symbol),
        };
        const response = await this.publicGetCurrencyPairMoneyTicker (this.extend (request, params));
        const ticker = this.safeValue (response, 'data', {});
        const timestamp = this.safeIntegerProduct (ticker, 'dataUpdateTime', 0.001);
        const bid = this.safeFloat (ticker['buy'], 'value');
        const ask = this.safeFloat (ticker['sell'], 'value');
        const baseVolume = this.safeFloat (ticker['vol'], 'value');
        const last = this.safeFloat (ticker['last'], 'value');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker['high'], 'value'),
            'low': this.safeFloat (ticker['low'], 'value'),
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeFloat (ticker['avg'], 'value'),
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        throw new NotSupported (this.id + ' switched off the trades endpoint, see their docs at https://docs.anxv2.apiary.io');
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['max'] = limit;
        }
        const response = await this.v3privatePostOrderList (this.extend (request, params));
        const orders = this.safeValue (response, 'orders', []);
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency_pair': market['id'],
        };
        // ANXPro will return all symbol pairs regardless of what is specified in request
        const response = await this.privatePostCurrencyPairMoneyOrders (this.extend (request, params));
        //
        //     {
        //         "result": "success",
        //         "data": [
        //             {
        //                 "oid": "e74305c7-c424-4fbc-a8a2-b41d8329deb0",
        //                 "currency": "HKD",
        //                 "item": "BTC",
        //                 "type": "offer",
        //                 "amount": {
        //                     "currency": "BTC",
        //                     "display": "10.00000000 BTC",
        //                     "display_short": "10.00 BTC",
        //                     "value": "10.00000000",
        //                     "value_int": "1000000000"
        //                 },
        //                 "effective_amount": {
        //                     "currency": "BTC",
        //                     "display": "10.00000000 BTC",
        //                     "display_short": "10.00 BTC",
        //                     "value": "10.00000000",
        //                     "value_int": "1000000000"
        //                 },
        //                 "price": {
        //                     "currency": "HKD",
        //                     "display": "412.34567 HKD",
        //                     "display_short": "412.35 HKD",
        //                     "value": "412.34567",
        //                     "value_int": "41234567"
        //                 },
        //                 "status": "open",
        //                 "date": 1393411075000,
        //                 "priority": 1393411075000000,
        //                 "actions": []
        //             },
        //            ...
        //         ]
        //     }
        //
        return this.parseOrders (this.safeValue (response, 'data', {}), market, since, limit);
    }

    parseOrder (order, market = undefined) {
        if ('orderId' in order) {
            return this.parseOrderV3 (order, market);
        } else {
            return this.parseOrderV2 (order, market);
        }
    }

    parseOrderStatus (status) {
        const statuses = {
            'ACTIVE': 'open',
            'FULL_FILL': 'closed',
            'CANCEL': 'canceled',
            'USER_CANCEL_PARTIAL': 'canceled',
            'PARTIAL_FILL': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderV3 (order, market = undefined) {
        //
        // v3
        //
        //     {
        //         orderType: 'LIMIT',
        //         tradedCurrency: 'XRP',
        //         settlementCurrency: 'BTC',
        //         tradedCurrencyAmount: '400.00000000',
        //         buyTradedCurrency: true,
        //         limitPriceInSettlementCurrency: '0.00007129',
        //         timestamp: '1522547850000',
        //         orderId: '62a8be4d-73c6-4469-90cd-28b4726effe0',
        //         tradedCurrencyAmountOutstanding: '0.00000000',
        //         orderStatus: 'FULL_FILL',
        //         executedAverageRate: '0.00007127',
        //         trades: [
        //             {
        //                 tradeId: 'fe16b796-df57-41a2-b6d9-3489f189749e',
        //                 orderId: '62a8be4d-73c6-4469-90cd-28b4726effe0',
        //                 timestamp: '1522547850000',
        //                 tradedCurrencyFillAmount: '107.91298639',
        //                 settlementCurrencyFillAmount: '0.00768772',
        //                 settlementCurrencyFillAmountUnrounded: '0.00768772',
        //                 price: '0.00007124',
        //                 ccyPair: 'XRPBTC'
        //             },
        //             {
        //                 tradeId: 'e2962f67-c094-4243-8b88-0cdc70a1b1c7',
        //                 orderId: '62a8be4d-73c6-4469-90cd-28b4726effe0',
        //                 timestamp: '1522547851000',
        //                 tradedCurrencyFillAmount: '292.08701361',
        //                 settlementCurrencyFillAmount: '0.02082288',
        //                 settlementCurrencyFillAmountUnrounded: '0.02082288',
        //                 price: '0.00007129',
        //                 ccyPair: 'XRPBTC'
        //             }
        //         ]
        //     }
        //
        const status = this.parseOrderStatus (this.safeString (order, 'orderStatus'));
        const base = this.safeCurrencyCode (this.safeString (order, 'tradedCurrency'));
        const quote = this.safeCurrencyCode (this.safeString (order, 'settlementCurrency'));
        const symbol = base + '/' + quote;
        const buyTradedCurrency = this.safeString (order, 'buyTradedCurrency');
        const side = (buyTradedCurrency === 'true') ? 'buy' : 'sell';
        const timestamp = this.safeInteger (order, 'timestamp');
        let lastTradeTimestamp = undefined;
        const trades = [];
        let filled = 0;
        const type = this.safeStringLower (order, 'orderType');
        for (let i = 0; i < order['trades'].length; i++) {
            const trade = order['trades'][i];
            const tradeTimestamp = this.safeInteger (trade, 'timestamp');
            if (!lastTradeTimestamp || lastTradeTimestamp < tradeTimestamp) {
                lastTradeTimestamp = tradeTimestamp;
            }
            const parsedTrade = this.extend (this.parseTrade (trade), { 'side': side, 'type': type });
            trades.push (parsedTrade);
            filled = this.sum (filled, parsedTrade['amount']);
        }
        const price = this.safeFloat (order, 'limitPriceInSettlementCurrency');
        const executedAverageRate = this.safeFloat (order, 'executedAverageRate');
        const remaining = (type === 'market') ? 0 : this.safeFloat (order, 'tradedCurrencyAmountOutstanding');
        let amount = this.safeFloat (order, 'tradedCurrencyAmount');
        if (!amount) {
            const settlementCurrencyAmount = this.safeFloat (order, 'settlementCurrencyAmount');
            amount = settlementCurrencyAmount / executedAverageRate;
        }
        const cost = executedAverageRate * filled;
        return {
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': undefined,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'fee': undefined,
            'trades': trades,
            'info': order,
        };
    }

    parseOrderV2 (order, market = undefined) {
        //
        // v2
        //
        //     {
        //         "oid": "e74305c7-c424-4fbc-a8a2-b41d8329deb0",
        //         "currency": "HKD",
        //         "item": "BTC",
        //         "type": "offer",  <-- bid/offer
        //         "amount": {
        //             "currency": "BTC",
        //             "display": "10.00000000 BTC",
        //             "display_short": "10.00 BTC",
        //             "value": "10.00000000",
        //             "value_int": "1000000000"
        //         },
        //         "effective_amount": {
        //             "currency": "BTC",
        //             "display": "10.00000000 BTC",
        //             "display_short": "10.00 BTC",
        //             "value": "10.00000000",
        //             "value_int": "1000000000"
        //         },
        //         "price": {
        //             "currency": "HKD",
        //             "display": "412.34567 HKD",
        //             "display_short": "412.35 HKD",
        //             "value": "412.34567",
        //             "value_int": "41234567"
        //         },
        //         "status": "open",
        //         "date": 1393411075000,
        //         "priority": 1393411075000000,
        //         "actions": []
        //     }
        //
        const id = this.safeString (order, 'oid');
        const status = this.safeString (order, 'status');
        const timestamp = this.safeInteger (order, 'date');
        const baseId = this.safeString (order, 'item');
        const quoteId = this.safeString (order, 'currency');
        const marketId = baseId + '/' + quoteId;
        market = this.safeValue (this.markets_by_id, marketId);
        let symbol = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
        }
        const amount_info = this.safeValue (order, 'amount', {});
        const effective_info = this.safeValue (order, 'effective_amount', {});
        const price_info = this.safeValue (order, 'price', {});
        const remaining = this.safeFloat (effective_info, 'value');
        const amount = this.safeFloat (amount_info, 'volume');
        const price = this.safeFloat (price_info, 'value');
        let filled = undefined;
        let cost = undefined;
        if (typeof amount !== 'undefined') {
            if (typeof remaining !== 'undefined') {
                filled = amount - remaining;
                cost = price * filled;
            }
        }
        const orderType = 'limit';
        let side = this.safeString (order, 'type');
        if (side === 'offer') {
            side = 'sell';
        } else {
            side = 'buy';
        }
        const fee = undefined;
        const trades = undefined; // todo parse trades
        const lastTradeTimestamp = undefined;
        return {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'type': orderType,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const amountMultiplier = Math.pow (10, market['precision']['amount']);
        const request = {
            'currency_pair': market['id'],
            'amount_int': parseInt (amount * amountMultiplier), // 10^8
        };
        if (type === 'limit') {
            const priceMultiplier = Math.pow (10, market['precision']['price']);
            request['price_int'] = parseInt (price * priceMultiplier); // 10^5 or 10^8
        }
        request['type'] = (side === 'buy') ? 'bid' : 'ask';
        const response = await this.privatePostCurrencyPairMoneyOrderAdd (this.extend (request, params));
        return {
            'info': response,
            'id': response['data'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCurrencyPairMoneyOrderCancel ({ 'oid': id });
    }

    getAmountMultiplier (code) {
        const multipliers = {
            'BTC': 100000000,
            'LTC': 100000000,
            'STR': 100000000,
            'XRP': 100000000,
            'DOGE': 100000000,
        };
        const defaultValue = 100;
        return this.safeInteger (multipliers, code, defaultValue);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const multiplier = this.getAmountMultiplier (code);
        const request = {
            'currency': currency,
            'amount_int': parseInt (amount * multiplier),
            'address': address,
        };
        if (tag !== undefined) {
            request['destinationTag'] = tag;
        }
        const response = await this.privatePostMoneyCurrencySendSimple (this.extend (request, params));
        return {
            'info': response,
            'id': response['data']['transactionId'],
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostMoneyCurrencyAddress (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        const address = this.safeString (data, 'addr');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/' + request;
        if (api === 'public' || api === 'v3public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            let auth = undefined;
            let contentType = undefined;
            if (api === 'v3private') {
                body = this.json (this.extend ({ 'tonce': nonce * 1000 }, query));
                const path = url.replace ('https://anxpro.com/', '');
                auth = path + '\0' + body;
                contentType = 'application/json';
            } else {
                body = this.urlencode (this.extend ({ 'nonce': nonce }, query));
                // eslint-disable-next-line quotes
                auth = request + "\0" + body;
                contentType = 'application/x-www-form-urlencoded';
            }
            const secret = this.base64ToBinary (this.secret);
            const signature = this.hmac (this.encode (auth), secret, 'sha512', 'base64');
            headers = {
                'Content-Type': contentType,
                'Rest-Key': this.apiKey,
                'Rest-Sign': this.decode (signature),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined || response === '') {
            return;
        }
        const result = this.safeString (response, 'result');
        const code = this.safeString (response, 'resultCode');
        const status = this.safeString (response, 'status');
        if (((result !== undefined) && (result !== 'success')) || ((code !== undefined) && (code !== 'OK')) || (status !== undefined)) {
            const message = this.safeString (response, 'error');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], status, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
