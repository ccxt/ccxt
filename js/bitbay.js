'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InvalidNonce, InsufficientFunds, AuthenticationError, InvalidOrder, ExchangeError, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitbay extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitbay',
            'name': 'BitBay',
            'countries': [ 'MT', 'EU' ], // Malta
            'rateLimit': 1000,
            'has': {
                'CORS': true,
                'withdraw': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
            },
            'urls': {
                'referral': 'https://auth.bitbay.net/ref/jHlbB4mIkdS1',
                'logo': 'https://user-images.githubusercontent.com/1294454/27766132-978a7bd8-5ece-11e7-9540-bc96d1e9bbb8.jpg',
                'www': 'https://bitbay.net',
                'api': {
                    'public': 'https://bitbay.net/API/Public',
                    'private': 'https://bitbay.net/API/Trading/tradingApi.php',
                    'v1_01Public': 'https://api.bitbay.net/rest',
                    'v1_01Private': 'https://api.bitbay.net/rest',
                },
                'doc': [
                    'https://bitbay.net/public-api',
                    'https://bitbay.net/en/private-api',
                    'https://bitbay.net/account/tab-api',
                    'https://github.com/BitBayNet/API',
                    'https://docs.bitbay.net/v1.0.1-en/reference',
                ],
                'fees': 'https://bitbay.net/en/fees',
            },
            'api': {
                'public': {
                    'get': [
                        '{id}/all',
                        '{id}/market',
                        '{id}/orderbook',
                        '{id}/ticker',
                        '{id}/trades',
                    ],
                },
                'private': {
                    'post': [
                        'info',
                        'trade',
                        'cancel',
                        'orderbook',
                        'orders',
                        'transfer',
                        'withdraw',
                        'history',
                        'transactions',
                    ],
                },
                'v1_01Public': {
                    'get': [
                        'trading/ticker',
                        'trading/ticker/{symbol}',
                        'trading/stats',
                        'trading/orderbook/{symbol}',
                        'trading/transactions/{symbol}',
                        'trading/candle/history/{symbol}/{resolution}',
                    ],
                },
                'v1_01Private': {
                    'get': [
                        'payments/withdrawal/{detailId}',
                        'payments/deposit/{detailId}',
                        'trading/offer',
                        'trading/config/{symbol}',
                        'trading/history/transactions',
                        'balances/BITBAY/history',
                        'balances/BITBAY/balance',
                        'fiat_cantor/rate/{baseId}/{quoteId}',
                        'fiat_cantor/history',
                    ],
                    'post': [
                        'trading/offer/{symbol}',
                        'trading/config/{symbol}',
                        'balances/BITBAY/balance',
                        'balances/BITBAY/balance/transfer/{source}/{destination}',
                        'fiat_cantor/exchange',
                    ],
                    'delete': [
                        'trading/offer/{symbol}/{id}/{side}/{price}',
                    ],
                    'put': [
                        'balances/BITBAY/balance/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.3 / 100,
                    'taker': 0.0043,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.0009,
                        'LTC': 0.005,
                        'ETH': 0.00126,
                        'LSK': 0.2,
                        'BCH': 0.0006,
                        'GAME': 0.005,
                        'DASH': 0.001,
                        'BTG': 0.0008,
                        'PLN': 4,
                        'EUR': 1.5,
                    },
                },
            },
            'exceptions': {
                '400': ExchangeError, // At least one parameter wasn't set
                '401': InvalidOrder, // Invalid order type
                '402': InvalidOrder, // No orders with specified currencies
                '403': InvalidOrder, // Invalid payment currency name
                '404': InvalidOrder, // Error. Wrong transaction type
                '405': InvalidOrder, // Order with this id doesn't exist
                '406': InsufficientFunds, // No enough money or crypto
                // code 407 not specified are not specified in their docs
                '408': InvalidOrder, // Invalid currency name
                '501': AuthenticationError, // Invalid public key
                '502': AuthenticationError, // Invalid sign
                '503': InvalidNonce, // Invalid moment parameter. Request time doesn't match current server time
                '504': ExchangeError, // Invalid method
                '505': AuthenticationError, // Key has no permission for this action
                '506': AuthenticationError, // Account locked. Please contact with customer service
                // codes 507 and 508 are not specified in their docs
                '509': ExchangeError, // The BIC/SWIFT is required for this currency
                '510': ExchangeError, // Invalid market name
                'FUNDS_NOT_SUFFICIENT': InsufficientFunds,
                'OFFER_FUNDS_NOT_EXCEEDING_MINIMUMS': InvalidOrder,
                'OFFER_NOT_FOUND': OrderNotFound,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.v1_01PublicGetTradingTicker (params);
        //
        //     {
        //         status: 'Ok',
        //         items: {
        //             'BSV-USD': {
        //                 market: {
        //                     code: 'BSV-USD',
        //                     first: { currency: 'BSV', minOffer: '0.00035', scale: 8 },
        //                     second: { currency: 'USD', minOffer: '5', scale: 2 }
        //                 },
        //                 time: '1557569762154',
        //                 highestBid: '52.31',
        //                 lowestAsk: '62.99',
        //                 rate: '63',
        //                 previousRate: '51.21',
        //             },
        //         },
        //     }
        //
        const result = [];
        const items = this.safeValue (response, 'items');
        const keys = Object.keys (items);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const item = items[key];
            const market = this.safeValue (item, 'market', {});
            const first = this.safeValue (market, 'first', {});
            const second = this.safeValue (market, 'second', {});
            const baseId = this.safeString (first, 'currency');
            const quoteId = this.safeString (second, 'currency');
            const id = baseId + quoteId;
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (first, 'scale'),
                'price': this.safeInteger (second, 'scale'),
            };
            // todo: check that the limits have ben interpreted correctly
            // todo: parse the fees page
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
                'active': undefined,
                'fee': undefined,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (first, 'minOffer'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeFloat (second, 'minOffer'),
                        'max': undefined,
                    },
                },
                'info': item,
            });
        }
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.v1_01PrivateGetTradingOffer (this.extend (request, params));
        const items = this.safeValue (response, 'items', []);
        return this.parseOrders (items, undefined, since, limit, { 'status': 'open' });
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         market: 'ETH-EUR',
        //         offerType: 'Sell',
        //         id: '93d3657b-d616-11e9-9248-0242ac110005',
        //         currentAmount: '0.04',
        //         lockedAmount: '0.04',
        //         rate: '280',
        //         startAmount: '0.04',
        //         time: '1568372806924',
        //         postOnly: false,
        //         hidden: false,
        //         mode: 'limit',
        //         receivedAmount: '0.0',
        //         firstBalanceId: '5b816c3e-437c-4e43-9bef-47814ae7ebfc',
        //         secondBalanceId: 'ab43023b-4079-414c-b340-056e3430a3af'
        //     }
        //
        const marketId = this.safeString (order, 'market');
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const [ baseId, quoteId ] = marketId.split ('-');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if (symbol === undefined) {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        const timestamp = this.safeInteger (order, 'time');
        const amount = this.safeFloat (order, 'startAmount');
        const remaining = this.safeFloat (order, 'currentAmount');
        let filled = undefined;
        if (amount !== undefined) {
            if (remaining !== undefined) {
                filled = Math.max (0, amount - remaining);
            }
        }
        return {
            'id': this.safeString (order, 'id'),
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': symbol,
            'type': this.safeString (order, 'mode'),
            'side': this.safeStringLower (order, 'offerType'),
            'price': this.safeFloat (order, 'rate'),
            'amount': amount,
            'cost': undefined,
            'filled': filled,
            'remaining': remaining,
            'average': undefined,
            'fee': undefined,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbol) {
            const markets = [ this.marketId (symbol) ];
            request['markets'] = markets;
        }
        const query = { 'query': this.json (this.extend (request, params)) };
        const response = await this.v1_01PrivateGetTradingHistoryTransactions (query);
        //
        //     {
        //         status: 'Ok',
        //         totalRows: '67',
        //         items: [
        //             {
        //                 id: 'b54659a0-51b5-42a0-80eb-2ac5357ccee2',
        //                 market: 'BTC-EUR',
        //                 time: '1541697096247',
        //                 amount: '0.00003',
        //                 rate: '4341.44',
        //                 initializedBy: 'Sell',
        //                 wasTaker: false,
        //                 userAction: 'Buy',
        //                 offerId: 'bd19804a-6f89-4a69-adb8-eb078900d006',
        //                 commissionValue: null
        //             },
        //         ]
        //     }
        //
        const items = this.safeValue (response, 'items');
        const result = this.parseTrades (items, undefined, since, limit);
        if (symbol === undefined) {
            return result;
        }
        return this.filterBySymbol (result, symbol);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.v1_01PrivateGetBalancesBITBAYBalance (params);
        const balances = this.safeValue (response, 'balances');
        if (balances === undefined) {
            throw new ExchangeError (this.id + ' empty balance response ' + this.json (response));
        }
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['used'] = this.safeFloat (balance, 'lockedFunds');
            account['free'] = this.safeFloat (balance, 'availableFunds');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': this.marketId (symbol),
        };
        const orderbook = await this.publicGetIdOrderbook (this.extend (request, params));
        return this.parseOrderBook (orderbook);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': this.marketId (symbol),
        };
        const ticker = await this.publicGetIdTicker (this.extend (request, params));
        const timestamp = this.milliseconds ();
        const baseVolume = this.safeFloat (ticker, 'volume');
        const vwap = this.safeFloat (ticker, 'vwap');
        let quoteVolume = undefined;
        if (baseVolume !== undefined && vwap !== undefined) {
            quoteVolume = baseVolume * vwap;
        }
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'max'),
            'low': this.safeFloat (ticker, 'min'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeFloat (ticker, 'average'),
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        const balanceCurrencies = [];
        if (code !== undefined) {
            const currency = this.currency (code);
            balanceCurrencies.push (currency['id']);
        }
        let request = {
            'balanceCurrencies': balanceCurrencies,
        };
        if (since !== undefined) {
            request['fromTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        request = this.extend (request, params);
        const response = await this.v1_01PrivateGetBalancesBITBAYHistory ({ 'query': this.json (request) });
        const items = response['items'];
        return this.parseLedger (items, undefined, since, limit);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //    FUNDS_MIGRATION
        //    {
        //      "historyId": "84ea7a29-7da5-4de5-b0c0-871e83cad765",
        //      "balance": {
        //        "id": "821ec166-cb88-4521-916c-f4eb44db98df",
        //        "currency": "LTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "LTC"
        //      },
        //      "detailId": null,
        //      "time": 1506128252968,
        //      "type": "FUNDS_MIGRATION",
        //      "value": 0.0009957,
        //      "fundsBefore": { "total": 0, "available": 0, "locked": 0 },
        //      "fundsAfter": { "total": 0.0009957, "available": 0.0009957, "locked": 0 },
        //      "change": { "total": 0.0009957, "available": 0.0009957, "locked": 0 }
        //    }
        //
        //    CREATE_BALANCE
        //    {
        //      "historyId": "d0fabd8d-9107-4b5e-b9a6-3cab8af70d49",
        //      "balance": {
        //        "id": "653ffcf2-3037-4ebe-8e13-d5ea1a01d60d",
        //        "currency": "BTG",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTG"
        //      },
        //      "detailId": null,
        //      "time": 1508895244751,
        //      "type": "CREATE_BALANCE",
        //      "value": 0,
        //      "fundsBefore": { "total": null, "available": null, "locked": null },
        //      "fundsAfter": { "total": 0, "available": 0, "locked": 0 },
        //      "change": { "total": 0, "available": 0, "locked": 0 }
        //    }
        //
        //    BITCOIN_GOLD_FORK
        //    {
        //      "historyId": "2b4d52d3-611c-473d-b92c-8a8d87a24e41",
        //      "balance": {
        //        "id": "653ffcf2-3037-4ebe-8e13-d5ea1a01d60d",
        //        "currency": "BTG",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTG"
        //      },
        //      "detailId": null,
        //      "time": 1508895244778,
        //      "type": "BITCOIN_GOLD_FORK",
        //      "value": 0.00453512,
        //      "fundsBefore": { "total": 0, "available": 0, "locked": 0 },
        //      "fundsAfter": { "total": 0.00453512, "available": 0.00453512, "locked": 0 },
        //      "change": { "total": 0.00453512, "available": 0.00453512, "locked": 0 }
        //    }
        //
        //    ADD_FUNDS
        //    {
        //      "historyId": "3158236d-dae5-4a5d-81af-c1fa4af340fb",
        //      "balance": {
        //        "id": "3a7e7a1e-0324-49d5-8f59-298505ebd6c7",
        //        "currency": "BTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTC"
        //      },
        //      "detailId": "8e83a960-e737-4380-b8bb-259d6e236faa",
        //      "time": 1520631178816,
        //      "type": "ADD_FUNDS",
        //      "value": 0.628405,
        //      "fundsBefore": { "total": 0.00453512, "available": 0.00453512, "locked": 0 },
        //      "fundsAfter": { "total": 0.63294012, "available": 0.63294012, "locked": 0 },
        //      "change": { "total": 0.628405, "available": 0.628405, "locked": 0 }
        //    }
        //
        //    TRANSACTION_PRE_LOCKING
        //    {
        //      "historyId": "e7d19e0f-03b3-46a8-bc72-dde72cc24ead",
        //      "balance": {
        //        "id": "3a7e7a1e-0324-49d5-8f59-298505ebd6c7",
        //        "currency": "BTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTC"
        //      },
        //      "detailId": null,
        //      "time": 1520706403868,
        //      "type": "TRANSACTION_PRE_LOCKING",
        //      "value": -0.1,
        //      "fundsBefore": { "total": 0.63294012, "available": 0.63294012, "locked": 0 },
        //      "fundsAfter": { "total": 0.63294012, "available": 0.53294012, "locked": 0.1 },
        //      "change": { "total": 0, "available": -0.1, "locked": 0.1 }
        //    }
        //
        //    TRANSACTION_POST_OUTCOME
        //    {
        //      "historyId": "c4010825-231d-4a9c-8e46-37cde1f7b63c",
        //      "balance": {
        //        "id": "3a7e7a1e-0324-49d5-8f59-298505ebd6c7",
        //        "currency": "BTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTC"
        //      },
        //      "detailId": "bf2876bc-b545-4503-96c8-ef4de8233876",
        //      "time": 1520706404032,
        //      "type": "TRANSACTION_POST_OUTCOME",
        //      "value": -0.01771415,
        //      "fundsBefore": { "total": 0.63294012, "available": 0.53294012, "locked": 0.1 },
        //      "fundsAfter": { "total": 0.61522597, "available": 0.53294012, "locked": 0.08228585 },
        //      "change": { "total": -0.01771415, "available": 0, "locked": -0.01771415 }
        //    }
        //
        //    TRANSACTION_POST_INCOME
        //    {
        //      "historyId": "7f18b7af-b676-4125-84fd-042e683046f6",
        //      "balance": {
        //        "id": "ab43023b-4079-414c-b340-056e3430a3af",
        //        "currency": "EUR",
        //        "type": "FIAT",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "EUR"
        //      },
        //      "detailId": "f5fcb274-0cc7-4385-b2d3-bae2756e701f",
        //      "time": 1520706404035,
        //      "type": "TRANSACTION_POST_INCOME",
        //      "value": 628.78,
        //      "fundsBefore": { "total": 0, "available": 0, "locked": 0 },
        //      "fundsAfter": { "total": 628.78, "available": 628.78, "locked": 0 },
        //      "change": { "total": 628.78, "available": 628.78, "locked": 0 }
        //    }
        //
        //    TRANSACTION_COMMISSION_OUTCOME
        //    {
        //      "historyId": "843177fa-61bc-4cbf-8be5-b029d856c93b",
        //      "balance": {
        //        "id": "ab43023b-4079-414c-b340-056e3430a3af",
        //        "currency": "EUR",
        //        "type": "FIAT",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "EUR"
        //      },
        //      "detailId": "f5fcb274-0cc7-4385-b2d3-bae2756e701f",
        //      "time": 1520706404050,
        //      "type": "TRANSACTION_COMMISSION_OUTCOME",
        //      "value": -2.71,
        //      "fundsBefore": { "total": 766.06, "available": 766.06, "locked": 0 },
        //      "fundsAfter": { "total": 763.35,"available": 763.35, "locked": 0 },
        //      "change": { "total": -2.71, "available": -2.71, "locked": 0 }
        //    }
        //
        //    TRANSACTION_OFFER_COMPLETED_RETURN
        //    {
        //      "historyId": "cac69b04-c518-4dc5-9d86-e76e91f2e1d2",
        //      "balance": {
        //        "id": "3a7e7a1e-0324-49d5-8f59-298505ebd6c7",
        //        "currency": "BTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTC"
        //      },
        //      "detailId": null,
        //      "time": 1520714886425,
        //      "type": "TRANSACTION_OFFER_COMPLETED_RETURN",
        //      "value": 0.00000196,
        //      "fundsBefore": { "total": 0.00941208, "available": 0.00941012, "locked": 0.00000196 },
        //      "fundsAfter": { "total": 0.00941208, "available": 0.00941208, "locked": 0 },
        //      "change": { "total": 0, "available": 0.00000196, "locked": -0.00000196 }
        //    }
        //
        //    WITHDRAWAL_LOCK_FUNDS
        //    {
        //      "historyId": "03de2271-66ab-4960-a786-87ab9551fc14",
        //      "balance": {
        //        "id": "3a7e7a1e-0324-49d5-8f59-298505ebd6c7",
        //        "currency": "BTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTC"
        //      },
        //      "detailId": "6ad3dc72-1d6d-4ec2-8436-ca43f85a38a6",
        //      "time": 1522245654481,
        //      "type": "WITHDRAWAL_LOCK_FUNDS",
        //      "value": -0.8,
        //      "fundsBefore": { "total": 0.8, "available": 0.8, "locked": 0 },
        //      "fundsAfter": { "total": 0.8, "available": 0, "locked": 0.8 },
        //      "change": { "total": 0, "available": -0.8, "locked": 0.8 }
        //    }
        //
        //    WITHDRAWAL_SUBTRACT_FUNDS
        //    {
        //      "historyId": "b0308c89-5288-438d-a306-c6448b1a266d",
        //      "balance": {
        //        "id": "3a7e7a1e-0324-49d5-8f59-298505ebd6c7",
        //        "currency": "BTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTC"
        //      },
        //      "detailId": "6ad3dc72-1d6d-4ec2-8436-ca43f85a38a6",
        //      "time": 1522246526186,
        //      "type": "WITHDRAWAL_SUBTRACT_FUNDS",
        //      "value": -0.8,
        //      "fundsBefore": { "total": 0.8, "available": 0, "locked": 0.8 },
        //      "fundsAfter": { "total": 0, "available": 0, "locked": 0 },
        //      "change": { "total": -0.8, "available": 0, "locked": -0.8 }
        //    }
        //
        //    TRANSACTION_OFFER_ABORTED_RETURN
        //    {
        //      "historyId": "b1a3c075-d403-4e05-8f32-40512cdd88c0",
        //      "balance": {
        //        "id": "3a7e7a1e-0324-49d5-8f59-298505ebd6c7",
        //        "currency": "BTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTC"
        //      },
        //      "detailId": null,
        //      "time": 1522512298662,
        //      "type": "TRANSACTION_OFFER_ABORTED_RETURN",
        //      "value": 0.0564931,
        //      "fundsBefore": { "total": 0.44951311, "available": 0.39302001, "locked": 0.0564931 },
        //      "fundsAfter": { "total": 0.44951311, "available": 0.44951311, "locked": 0 },
        //      "change": { "total": 0, "available": 0.0564931, "locked": -0.0564931 }
        //    }
        //
        //    WITHDRAWAL_UNLOCK_FUNDS
        //    {
        //      "historyId": "0ed569a2-c330-482e-bb89-4cb553fb5b11",
        //      "balance": {
        //        "id": "3a7e7a1e-0324-49d5-8f59-298505ebd6c7",
        //        "currency": "BTC",
        //        "type": "CRYPTO",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "BTC"
        //      },
        //      "detailId": "0c7be256-c336-4111-bee7-4eb22e339700",
        //      "time": 1527866360785,
        //      "type": "WITHDRAWAL_UNLOCK_FUNDS",
        //      "value": 0.05045,
        //      "fundsBefore": { "total": 0.86001578, "available": 0.80956578, "locked": 0.05045 },
        //      "fundsAfter": { "total": 0.86001578, "available": 0.86001578, "locked": 0 },
        //      "change": { "total": 0, "available": 0.05045, "locked": -0.05045 }
        //    }
        //
        //    TRANSACTION_COMMISSION_RETURN
        //    {
        //      "historyId": "07c89c27-46f1-4d7a-8518-b73798bf168a",
        //      "balance": {
        //        "id": "ab43023b-4079-414c-b340-056e3430a3af",
        //        "currency": "EUR",
        //        "type": "FIAT",
        //        "userId": "a34d361d-7bad-49c1-888e-62473b75d877",
        //        "name": "EUR"
        //      },
        //      "detailId": null,
        //      "time": 1528304043063,
        //      "type": "TRANSACTION_COMMISSION_RETURN",
        //      "value": 0.6,
        //      "fundsBefore": { "total": 0, "available": 0, "locked": 0 },
        //      "fundsAfter": { "total": 0.6, "available": 0.6, "locked": 0 },
        //      "change": { "total": 0.6, "available": 0.6, "locked": 0 }
        //    }
        //
        const timestamp = this.safeInteger (item, 'time');
        const balance = this.safeValue (item, 'balance', {});
        const currencyId = this.safeString (balance, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const change = this.safeValue (item, 'change', {});
        let amount = this.safeFloat (change, 'total');
        let direction = 'in';
        if (amount < 0) {
            direction = 'out';
            amount = -amount;
        }
        const id = this.safeString (item, 'historyId');
        // there are 2 undocumented api calls: (v1_01PrivateGetPaymentsDepositDetailId and v1_01PrivateGetPaymentsWithdrawalDetailId)
        // that can be used to enrich the transfers with txid, address etc (you need to use info.detailId as a parameter)
        const referenceId = this.safeString (item, 'detailId');
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const fundsBefore = this.safeValue (item, 'fundsBefore', {});
        const before = this.safeFloat (fundsBefore, 'total');
        const fundsAfter = this.safeValue (item, 'fundsAfter', {});
        const after = this.safeFloat (fundsAfter, 'total');
        return {
            'info': item,
            'id': id,
            'direction': direction,
            'account': undefined,
            'referenceId': referenceId,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': amount,
            'before': before,
            'after': after,
            'status': 'ok',
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }

    parseLedgerEntryType (type) {
        const types = {
            'ADD_FUNDS': 'transaction',
            'BITCOIN_GOLD_FORK': 'transaction',
            'CREATE_BALANCE': 'transaction',
            'FUNDS_MIGRATION': 'transaction',
            'WITHDRAWAL_LOCK_FUNDS': 'transaction',
            'WITHDRAWAL_SUBTRACT_FUNDS': 'transaction',
            'WITHDRAWAL_UNLOCK_FUNDS': 'transaction',
            'TRANSACTION_COMMISSION_OUTCOME': 'fee',
            'TRANSACTION_COMMISSION_RETURN': 'fee',
            'TRANSACTION_OFFER_ABORTED_RETURN': 'trade',
            'TRANSACTION_OFFER_COMPLETED_RETURN': 'trade',
            'TRANSACTION_POST_INCOME': 'trade',
            'TRANSACTION_POST_OUTCOME': 'trade',
            'TRANSACTION_PRE_LOCKING': 'trade',
        };
        return this.safeString (types, type, type);
    }

    parseTrade (trade, market = undefined) {
        //     {
        //         amount: "0.29285199",
        //         commissionValue: "0.00125927",
        //         id: "11c8203a-a267-11e9-b698-0242ac110007",
        //         initializedBy: "Buy",
        //         market: "ETH-EUR",
        //         offerId: "11c82038-a267-11e9-b698-0242ac110007",
        //         rate: "277",
        //         time: "1562689917517",
        //         userAction: "Buy",
        //         wasTaker: true,
        //     }
        // Public trades
        //     { id: 'df00b0da-e5e0-11e9-8c19-0242ac11000a',
        //          t: '1570108958831',
        //          a: '0.04776653',
        //          r: '0.02145854',
        //          ty: 'Sell'
        //      }
        const timestamp = this.safeInteger2 (trade, 'time', 't');
        const userAction = this.safeString (trade, 'userAction');
        const side = (userAction === 'Buy') ? 'buy' : 'sell';
        const wasTaker = this.safeValue (trade, 'wasTaker');
        let takerOrMaker = undefined;
        if (wasTaker !== undefined) {
            takerOrMaker = wasTaker ? 'taker' : 'maker';
        }
        const price = this.safeFloat2 (trade, 'rate', 'r');
        const amount = this.safeFloat2 (trade, 'amount', 'a');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        const feeCost = this.safeFloat (trade, 'commissionValue');
        const marketId = this.safeString (trade, 'market');
        let base = undefined;
        let quote = undefined;
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
                base = market['base'];
                quote = market['quote'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('-');
                base = this.safeCurrencyCode (baseId);
                quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if (market !== undefined) {
            if (symbol === undefined) {
                symbol = market['symbol'];
            }
            if (base === undefined) {
                base = market['base'];
            }
        }
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCcy = side === 'buy' ? base : quote;
            fee = {
                'currency': feeCcy,
                'cost': feeCost,
            };
        }
        const order = this.safeString (trade, 'offerId');
        // todo: check this logic
        let type = undefined;
        if (order !== undefined) {
            type = order ? 'limit' : 'market';
        }
        return {
            'id': this.safeString (trade, 'id'),
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['baseId'] + '-' + market['quoteId'];
        const request = {
            'symbol': tradingSymbol,
        };
        if (since !== undefined) {
            request['fromTime'] = since - 1; // result does not include exactly `since` time therefore decrease by 1
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default - 10, max - 300
        }
        const response = await this.v1_01PublicGetTradingTransactionsSymbol (this.extend (request, params));
        const items = this.safeValue (response, 'items');
        return this.parseTrades (items, symbol, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['baseId'] + '-' + market['quoteId'];
        const request = {
            'symbol': tradingSymbol,
            'offerType': side,
            'amount': amount,
            'mode': type,
        };
        if (type === 'limit') {
            request['rate'] = price;
        }
        //     {
        //         status: 'Ok',
        //         completed: false, // can deduce status from here
        //         offerId: 'ce9cc72e-d61c-11e9-9248-0242ac110005',
        //         transactions: [], // can deduce order info from here
        //     }
        const response = await this.v1_01PrivatePostTradingOfferSymbol (this.extend (request, params));
        return {
            'id': this.safeString (response, 'offerId'),
            'info': response,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const side = this.safeString (params, 'side');
        if (side === undefined) {
            throw new ExchangeError (this.id + ' cancelOrder() requires a `side` parameter ("buy" or "sell")');
        }
        const price = this.safeValue (params, 'price');
        if (price === undefined) {
            throw new ExchangeError (this.id + ' cancelOrder() requires a `price` parameter (float or string)');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['baseId'] + '-' + market['quoteId'];
        const request = {
            'symbol': tradingSymbol,
            'id': id,
            'side': side,
            'price': price,
        };
        // { status: 'Fail', errors: [ 'NOT_RECOGNIZED_OFFER_TYPE' ] }  -- if required params are missing
        // { status: 'Ok', errors: [] }
        return this.v1_01PrivateDeleteTradingOfferSymbolIdSidePrice (this.extend (request, params));
    }

    isFiat (currency) {
        const fiatCurrencies = {
            'USD': true,
            'EUR': true,
            'PLN': true,
        };
        return this.safeValue (fiatCurrencies, currency, false);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let method = undefined;
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'quantity': amount,
        };
        if (this.isFiat (code)) {
            method = 'privatePostWithdraw';
            // request['account'] = params['account']; // they demand an account number
            // request['express'] = params['express']; // whatever it means, they don't explain
            // request['bic'] = '';
        } else {
            method = 'privatePostTransfer';
            if (tag !== undefined) {
                address += '?dt=' + tag.toString ();
            }
            request['address'] = address;
        }
        const response = await this[method] (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api === 'public') {
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params) + '.json';
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'v1_01Public') {
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'v1_01Private') {
            this.checkRequiredCredentials ();
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            const nonce = this.milliseconds ().toString ();
            let payload = undefined;
            if (method !== 'POST') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
                payload = this.apiKey + nonce;
            } else if (body === undefined) {
                body = this.json (query);
                payload = this.apiKey + nonce + body;
            }
            headers = {
                'Request-Timestamp': nonce,
                'Operation-Id': this.uuid (),
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (this.encode (payload), this.encode (this.secret), 'sha512'),
                'Content-Type': 'application/json',
            };
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'method': path,
                'moment': this.nonce (),
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('code' in response) {
            //
            // bitbay returns the integer 'success': 1 key from their private API
            // or an integer 'code' value from 0 to 510 and an error message
            //
            //      { 'success': 1, ... }
            //      { 'code': 502, 'message': 'Invalid sign' }
            //      { 'code': 0, 'message': 'offer funds not exceeding minimums' }
            //
            //      400 At least one parameter wasn't set
            //      401 Invalid order type
            //      402 No orders with specified currencies
            //      403 Invalid payment currency name
            //      404 Error. Wrong transaction type
            //      405 Order with this id doesn't exist
            //      406 No enough money or crypto
            //      408 Invalid currency name
            //      501 Invalid public key
            //      502 Invalid sign
            //      503 Invalid moment parameter. Request time doesn't match current server time
            //      504 Invalid method
            //      505 Key has no permission for this action
            //      506 Account locked. Please contact with customer service
            //      509 The BIC/SWIFT is required for this currency
            //      510 Invalid market name
            //
            const code = this.safeString (response, 'code'); // always an integer
            const feedback = this.id + ' ' + body;
            const exceptions = this.exceptions;
            if (code in this.exceptions) {
                throw new exceptions[code] (feedback);
            } else {
                throw new ExchangeError (feedback);
            }
        } else if ('status' in response) {
            //
            //      {"status":"Fail","errors":["OFFER_FUNDS_NOT_EXCEEDING_MINIMUMS"]}
            //
            const status = this.safeString (response, 'status');
            if (status === 'Fail') {
                const errors = this.safeValue (response, 'errors');
                const feedback = this.id + ' ' + this.json (response);
                for (let i = 0; i < errors.length; i++) {
                    const error = errors[i];
                    if (error in this.exceptions) {
                        throw new this.exceptions[error] (feedback);
                    }
                }
                throw new ExchangeError (feedback);
            }
        }
    }
};
