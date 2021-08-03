'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');
const Precise = require ('./base/Precise');
const { uuid } = require ('./base/functions/string');

//  ---------------------------------------------------------------------------

module.exports = class b2c2 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'b2c2',
            'name': 'B2C2',
            'countries': [ 'GB' ],
            'rateLimit': 500,
            'has': {
                'fetchBalance': true, // implemented
                'fetchCurrencies': true, // partially implemented
                'fetchMarkets': true, // partially implemented
                'fetchOrders': true, // partially implemented
                'fetchLedger': true, // partially implemented
                'fetchMyTrades': true, // partially implemented
                'createOrder': true, // partially implemented
                'fetchOrder': true, // partially implemented
                'fetchWithdrawals': true,
                'withdraw': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRates': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/37808081-b87f2d9c-2e59-11e8-894d-c1900b7584fe.jpg',
                'api': {
                    'private': 'https://api.uat.b2c2.net',
                },
                'www': 'https://b2c2.com',
                'doc': 'https://docs.b2c2.net',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'api': {
                'private': {
                    'get': [
                        'balance',
                        'margin_requirements',
                        'instruments',
                        'order',
                        'order/{id}',
                        'trade',
                        'ledger',
                        'withdrawal',
                        'currency',
                        'funding_rates',
                        'account_info',
                    ],
                    'post': [
                        'request_for_quote',
                        'order',
                        'withdrawal',
                    ],
                },
            },
            'markets': {
                'BTCUSD.SPOT': { 'id': 'BTCUSD.SPOT', 'symbol': 'BTCUSD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'btc', 'quoteId': 'usd' },
                'ETHUSD.SPOT': { 'id': 'ETHUSD.SPOT', 'symbol': 'ETHUSD', 'base': 'ETH', 'quote': 'USD', 'baseId': 'eth', 'quoteId': 'usd' },
                'XRPUSD.SPOT': { 'id': 'XRPUSD.SPOT', 'symbol': 'XRPUSD', 'base': 'XRP', 'quote': 'USD', 'baseId': 'xrp', 'quoteId': 'usd' },
            },
            'exceptions': {
                '400': ExchangeError, // At least one parameter wasn't set
            },
            'options': {
                'fetchMyTrades': {
                    'sort': 'timestamp,asc',
                },
                'fetchOpenOrders': {
                    'sort': 'createdAt,asc',
                },
                'fetchClosedOrders': {
                    'sort': 'createdAt,asc',
                },
                'defaultSort': 'timestamp,asc',
                'defaultSortOrders': 'createdAt,asc',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.privateGetInstruments (params);
        //
        // [
        //     {
        //       "name": "LTCUSD.SPOT",
        //       "underlier": "LTCUSD",
        //       "type": "SPOT"
        //     },
        //     {
        //       "name": "BCHUSD.SPOT",
        //       "underlier": "BCHUSD",
        //       "type": "SPOT"
        //     },
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            result.push (this.parseMarket (response[i]));
        }
        return result;
    }

    parseMarket (market) {
        //
        // [
        //     {
        //       "name": "LTCUSD.SPOT",
        //       "underlier": "LTCUSD",
        //       "type": "SPOT"
        //     },
        //     {
        //       "name": "BCHUSD.SPOT",
        //       "underlier": "BCHUSD",
        //       "type": "SPOT"
        //     },
        //
        // const locked = this.safeValue (market, 'locked');
        // const active = !locked;
        const id = this.safeString (market, 'name');
        const symbol = this.safeString (market, 'underlier'); // needs to be base/quote!!
        const type = this.safeString (market, 'type');
        // const baseId = this.safeString (market, 'baseCurrency');
        // const quoteId = this.safeString (market, 'quoteCurrency');
        // const base = this.safeCurrencyCode (baseId);
        // const quote = this.safeCurrencyCode (quoteId);
        // const symbol = base + '/' + quote;
        // const precision = {
        //     'amount': this.precisionFromString (this.safeString (market, 'quantityIncrement')),
        //     'price': this.precisionFromString (this.safeString (market, 'tickSize')),
        // };
        // const amountIncrement = this.safeNumber (market, 'quantityIncrement');
        // const minBase = this.safeNumber (market, 'baseMinSize');
        // const minAmount = Math.max (amountIncrement, minBase);
        // const priceIncrement = this.safeNumber (market, 'tickSize');
        // const minCost = this.safeNumber (market, 'quoteMinSize');
        // const limits = {
        //     'amount': { 'min': minAmount, 'max': undefined },
        //     'price': { 'min': priceIncrement, 'max': undefined },
        //     'cost': { 'min': Math.max (minCost, minAmount * priceIncrement), 'max': undefined },
        // };
        // const taker = this.safeNumber (market, 'takerFee');
        // const maker = this.safeNumber (market, 'makerFee');
        return {
            'id': id,
            'symbol': symbol,
            'base': undefined,
            'quote': undefined,
            'baseId': undefined,
            'quoteId': undefined,
            'type': type,
            'active': true,
            'precision': undefined,
            'limits': undefined,
            'taker': undefined,
            'maker': undefined,
            'info': market,
        };
    }

    async fetchCurrencies (params = {}) {
        const currencies_raw = await this.privateGetCurrency (params);
        // {
        //    "AUD": {
        //        "long_only": false,
        //        "minimum_trade_size": 0.01,
        //        "stable_coin": false,
        //        "currency_type": "fiat",
        //        "is_crypto": false,
        //        "readable_name": ""
        //    },
        //    "BCH": {
        //        "long_only": false,
        //        "minimum_trade_size": 0.01,
        //        "stable_coin": false,
        //        "currency_type": "crypto",
        //        "is_crypto": true,
        //        "readable_name": "Bitcoin cash"
        //    },
        //
        const result = {};
        const keys = Object.keys (currencies_raw);
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const code = this.safeCurrencyCode (id);
            const currency_raw = currencies_raw[keys[i]];
            const name = this.safeString (currency_raw, 'readable_name');
            const minTradeSize = this.safeNumber (currency_raw, 'minimum_trade_size');
            result[code] = {
                'id': code,
                'code': code,
                'info': currency_raw,
                'type': undefined,
                'name': name,
                'active': true,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'withdraw': { 'min': undefined, 'max': undefined },
                    'amount': { 'min': minTradeSize, 'max': undefined },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
        // {
        //     "USD": "0",
        //     "BTC": "0",
        //     "JPY": "0",
        //     "GBP": "0",
        //     "ETH": "0",
        //     "EUR": "0",
        //     "CAD": "0",
        //     "LTC": "0",
        //     "XRP": "0",
        //     "BCH": "0"
        // }
        const result = {
            'info': response,
            'timestamp': this.timestamp,
            'datetime': undefined,
        };
        const assets = response;
        const keys = Object.keys (assets);
        for (let i = 0; i < keys.length; i++) {
            const balance = assets[keys[i]];
            const code = keys[i];
            const account = this.account ();
            account['free'] = balance;
            account['used'] = 0;
            account['total'] = balance;
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const lowercaseSide = side.toLowerCase ();
        const uppercaseType = type.toUpperCase ();
        const request = {
            'client_order_id': uuid ().toString (), // to parameterise
            'quantity': this.amountToPrecision (symbol, amount),
            'side': lowercaseSide,
            'instrument': market['id'],
            'valid_until': '2022-08-04 10:05:15.00000', // need to do properly
        };
        if (uppercaseType === 'LIMIT') {
            request['order_type'] = 'FOK';
            request['price'] = this.priceToPrecision (symbol, price);
        } else {
            request['order_type'] = 'MKT';
        }
        const response = await this.privatePostOrder (request);
        return this.parseOrder (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = { 'id': id };
        const response = await this.privateGetOrderId (request);
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // const market = this.market (symbol);
        const request = {
            'created__gte': undefined,
            'created__lt': undefined,
            'client_order_id': undefined,
            'order_type': undefined,
            'executing_unit': undefined,
            'instrument': symbol,
            'limit': 1000,
        };
        const response = await this.privateGetOrder (request);
        // return this.parseOrders (response, market, since, limit);
        return this.parseOrders (response, undefined, since, limit);
    }

    parseOrder (order, market = undefined) {
        // [
        //     {
        //       "order_id": "373991c8-727d-4b55-94c2-eece7b81023c",
        //       "client_order_id": "fd76dbde-fdd5-40a9-9211-19eaa19653be",
        //       "instrument": "XRPUSD.SPOT",
        //       "price": "0.59525000",
        //       "executed_price": "0.59525000",
        //       "quantity": "1000.0000000000",
        //       "side": "buy",
        //       "order_type": "MKT",
        //       "created": "2021-07-23T13:36:24.885622Z",
        //       "executing_unit": ""
        //     },
        const id = this.safeString (order, 'client_order_id');
        const type = this.safeStringLower (order, 'order_type');
        const side = this.safeStringLower (order, 'side');
        const marketId = this.safeString (order, 'instrument');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.parse8601 (this.safeString (order, 'created'));
        const price = this.safeNumber (order, 'executed_price');
        const amount = this.safeNumber (order, 'quantity');
        const filled = this.safeNumber (order, 'quantity');
        // const canceledQuantity = this.safeNumber (order, 'cancelledQuantity');
        const canceledQuantity = 0;
        let status = undefined;
        if ((amount !== undefined) && (filled !== undefined)) {
            if (filled >= amount) {
                status = 'closed';
            } else if ((canceledQuantity !== undefined) && (canceledQuantity > 0)) {
                status = 'canceled';
            } else {
                status = 'open';
            }
        }
        // const rawTrades = this.safeValue (order, 'trades', []);
        // const trades = this.parseTrades (rawTrades, market, undefined, undefined, {
        //     'order': id,
        //     'type': type,
        // });
        const clientOrderId = this.safeString (order, 'clientOrderId');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            // 'trades': trades,
        });
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // const options = this.safeValue (this.options, 'fetchMyTrades', {});
        // const defaultSort = this.safeValue (options, 'sort', 'timestamp,asc');
        // const sort = this.safeString (params, 'sort', defaultSort);
        // const query = this.omit (params, 'sort');
        // const request = {
        //     // 'cursorId': 123, // int64 (?)
        //     // 'from': this.iso8601 (since),
        //     // 'makerOrderId': '1234', // maker order hash
        //     // 'owner': '...', // owner address (?)
        //     // 'page': 0, // results page you want to retrieve (0 .. N)
        //     // 'side': 'BUY', // or 'SELL'
        //     // 'size': limit,
        //     'sort': sort, // sorting criteria in the format "property,asc" or "property,desc", default order is ascending, multiple sort criteria are supported
        //     // 'symbol': market['id'],
        //     // 'takerOrderId': '1234',
        //     // 'till': this.iso8601 (this.milliseconds ()),
        // };
        const request = {
            'created__gte': undefined,
            'created__lt': undefined,
            'client_order_id': undefined,
            'order_type': undefined,
            'executing_unit': undefined,
            'instrument': symbol, // need to map to markets
            'limit': 1000,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.privateGetTrade (request);
        // const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // [
        //     {
        //       "trade_id": "2b656360-c49f-4409-a4fb-6f39b11bc2bf",
        //       "rfq_id": null,
        //       "order": "80d591a0-30bc-4ee2-a1b8-712cb22dcf0f",
        //       "quantity": "1.0000000000",
        //       "side": "buy",
        //       "instrument": "BTCUSD.SPOT",
        //       "price": "33534.00000000",
        //       "created": "2021-07-09T15:47:55.887484Z",
        //       "end_client_id": "",
        //       "client_rfq_id": null,
        //       "client_order_id": "cd50d109-dca7-4f5d-bf1b-e7141ec6b50c",
        //       "user": "Demo_Leonie",
        //       "origin": "screen:mobile",
        //       "executing_unit": ""
        //     },
        //
        const marketId = this.safeString (trade, 'instrument');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.parse8601 (this.safeString (trade, 'created'));
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'quantity');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const id = this.safeString (trade, 'trade_id');
        const side = this.safeStringLower (trade, 'side');
        const takerOrMaker = this.safeStringLower (trade, 'makerOrTaker');
        const orderId = this.safeString (trade, 'client_order_id');
        let fee = undefined;
        const feeCost = this.safeNumber (trade, 'fee');
        const feeCurrency = this.safeCurrencyCode (this.safeString (trade, 'feeToken'));
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        };
    }

    parseLedgerEntryType (type) {
        const types = {
            'Withdrawal': 'transaction',
            'RealisedPNL': 'margin',
            'UnrealisedPNL': 'margin',
            'Deposit': 'transaction',
            'Transfer': 'transfer',
            'AffiliatePayout': 'referral',
            'trade': 'trade',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     {
        //         transactID: "69573da3-7744-5467-3207-89fd6efe7a47",
        //         account:  24321,
        //         currency: "XBt",
        //         transactType: "Withdrawal", // "AffiliatePayout", "Transfer", "Deposit", "RealisedPNL", ...
        //         amount:  -1000000,
        //         fee:  300000,
        //         transactStatus: "Completed", // "Canceled", ...
        //         address: "1Ex4fkF4NhQaQdRWNoYpqiPbDBbq18Kdd9",
        //         tx: "3BMEX91ZhhKoWtsH9QRb5dNXnmnGpiEetA",
        //         text: "",
        //         transactTime: "2017-03-21T20:05:14.388Z",
        //         walletBalance:  0, // balance after
        //         marginBalance:  null,
        //         timestamp: "2017-03-22T13:09:23.514Z"
        //     }
        //
        // ButMEX returns the unrealized pnl from the wallet history endpoint.
        // The unrealized pnl transaction has an empty timestamp.
        // It is not related to historical pnl it has status set to "Pending".
        // Therefore it's not a part of the history at all.
        // https://github.com/ccxt/ccxt/issues/6047
        //
        //     {
        //         "transactID":"00000000-0000-0000-0000-000000000000",
        //         "account":121210,
        //         "currency":"XBt",
        //         "transactType":"UnrealisedPNL",
        //         "amount":-5508,
        //         "fee":0,
        //         "transactStatus":"Pending",
        //         "address":"XBTUSD",
        //         "tx":"",
        //         "text":"",
        //         "transactTime":null,  # ←---------------------------- null
        //         "walletBalance":139198767,
        //         "marginBalance":139193259,
        //         "timestamp":null  # ←---------------------------- null
        //     }
        //
        // [
        //     {
        //       "transaction_id": "3b8c41be-1bae-45aa-a6fb-86fce3ebef85",
        //       "created": "2021-07-23T13:36:24.889949Z",
        //       "reference": "57912eaf-02dc-461f-ad0d-8c636c01c997",
        //       "currency": "USD",
        //       "amount": "-595.2500000000000000",
        //       "type": "trade",
        //       "group": "trading"
        //     },
        //     {
        //       "transaction_id": "cd92a3d5-a782-4bb2-86b2-815d76667658",
        //       "created": "2021-07-23T13:36:24.889949Z",
        //       "reference": "57912eaf-02dc-461f-ad0d-8c636c01c997",
        //       "currency": "XRP",
        //       "amount": "1000.0000000000000000",
        //       "type": "trade",
        //       "group": "trading"
        //     },
        const id = this.safeString (item, 'transaction_id');
        const account = this.safeString (item, 'group');
        const referenceId = this.safeString (item, 'reference');
        const referenceAccount = undefined;
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const currencyId = this.safeString (item, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        let amount = this.safeNumber (item, 'amount');
        // if (amount !== undefined) {
        //     amount = amount / 100000000;
        // }
        let timestamp = this.parse8601 (this.safeString (item, 'created'));
        if (timestamp === undefined) {
            // https://github.com/ccxt/ccxt/issues/6047
            // set the timestamp to zero, 1970 Jan 1 00:00:00
            // for unrealized pnl and other transactions without a timestamp
            timestamp = 0; // see comments above
        }
        // let feeCost = this.safeNumber (item, 'fee', 0);
        // if (feeCost !== undefined) {
        //     feeCost = feeCost / 100000000;
        // }
        // const fee = {
        //     'cost': feeCost,
        //     'currency': code,
        // };
        // let after = this.safeNumber (item, 'walletBalance');
        // if (after !== undefined) {
        //     after = after / 100000000;
        // }
        // const before = this.sum (after, -amount);
        let direction = undefined;
        if (amount < 0) {
            direction = 'out';
            amount = Math.abs (amount);
        } else {
            direction = 'in';
        }
        // const status = this.parseTransactionStatus (this.safeString (item, 'transactStatus'));
        return {
            'id': id,
            'info': item,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': direction,
            'account': account,
            'referenceId': referenceId,
            'referenceAccount': referenceAccount,
            'type': type,
            'currency': code,
            'amount': amount,
            'before': undefined,
            'after': undefined,
            'status': undefined,
            'fee': undefined,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const request = {
            'created__gte': undefined,
            'created__lt': undefined,
            'currency': currency,
            'type': undefined,
            'since': since,
            'limit': 1000,
        };
        //
        //     if (since !== undefined) {
        //         // date-based pagination not supported
        //     }
        //
        const response = await this.privateGetLedger (request);
        return this.parseLedger (response, currency, since, limit);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'start': 123,
        };
        //
        //     if (since !== undefined) {
        //         // date-based pagination not supported
        //     }
        //
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privateGetUserWalletHistory (this.extend (request, params));
        const transactions = this.filterByArray (response, 'transactType', [ 'Withdrawal', 'Deposit' ], false);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (transactions, currency, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'Canceled': 'canceled',
            'Completed': 'ok',
            'Pending': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //   {
        //      'transactID': 'ffe699c2-95ee-4c13-91f9-0faf41daec25',
        //      'account': 123456,
        //      'currency': 'XBt',
        //      'transactType': 'Withdrawal',
        //      'amount': -100100000,
        //      'fee': 100000,
        //      'transactStatus': 'Completed',
        //      'address': '385cR5DM96n1HvBDMzLHPYcw89fZAXULJP',
        //      'tx': '3BMEXabcdefghijklmnopqrstuvwxyz123',
        //      'text': '',
        //      'transactTime': '2019-01-02T01:00:00.000Z',
        //      'walletBalance': 99900000,
        //      'marginBalance': None,
        //      'timestamp': '2019-01-02T13:00:00.000Z'
        //   }
        //
        const id = this.safeString (transaction, 'transactID');
        // For deposits, transactTime == timestamp
        // For withdrawals, transactTime is submission, timestamp is processed
        const transactTime = this.parse8601 (this.safeString (transaction, 'transactTime'));
        const timestamp = this.parse8601 (this.safeString (transaction, 'timestamp'));
        const type = this.safeStringLower (transaction, 'transactType');
        // Deposits have no from address or to address, withdrawals have both
        let address = undefined;
        let addressFrom = undefined;
        let addressTo = undefined;
        if (type === 'withdrawal') {
            address = this.safeString (transaction, 'address');
            addressFrom = this.safeString (transaction, 'tx');
            addressTo = address;
        }
        let amount = this.safeInteger (transaction, 'amount');
        if (amount !== undefined) {
            amount = Math.abs (amount) / 10000000;
        }
        let feeCost = this.safeInteger (transaction, 'fee');
        if (feeCost !== undefined) {
            feeCost = feeCost / 10000000;
        }
        const fee = {
            'cost': feeCost,
            'currency': 'BTC',
        };
        let status = this.safeString (transaction, 'transactStatus');
        if (status !== undefined) {
            status = this.parseTransactionStatus (status);
        }
        return {
            'info': transaction,
            'id': id,
            'txid': undefined,
            'timestamp': transactTime,
            'datetime': this.iso8601 (transactTime),
            'addressFrom': addressFrom,
            'address': address,
            'addressTo': addressTo,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': type,
            'amount': amount,
            // BTC is the only currency on Bitmex
            'currency': 'BTC',
            'status': status,
            'updated': timestamp,
            'comment': undefined,
            'fee': fee,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/' + path;
        if ((api === 'public') || (api === 'markets')) {
            url += this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            headers = {
                'Authorization': 'Token ' + this.apiKey,
            };
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
