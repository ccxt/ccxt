'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, InvalidAddress, AuthenticationError, OnMaintenance, RateLimitExceeded, PermissionDenied, NotSupported, BadRequest, BadSymbol } = require ('./base/errors');
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
                'fetchBalance': true,  // partially implemented
                'fetchCurrencies': true, // partially implemented
                'fetchMarkets': true, // partially implemented
                'fetchOrders': true, // partially implemented
                'fetchLedger': true, // partially implemented
                'fetchMyTrades': true, // partially implemented
                'createOrder': true, // partially implemented
                'fetchOrder': true, // partially implemented
                'fetchWithdrawals': true, // partially implemented
                'withdraw': true, // partially implemented
                'fetchFundingHistory': true, // not urgent, not yet done
                'fetchFundingRate': true, // not urgent, not yet done
                'fetchFundingRates': true, // not urgent, not yet done
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/37808081-b87f2d9c-2e59-11e8-894d-c1900b7584fe.jpg',
                'api': {
                    'private': 'https://api.uat.b2c2.net',
                },
                'test': {
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
                        'account_info',
                        'balance',
                        'currency',
                        'funding_rates',
                        'instruments',
                        'ledger',
                        'order',
                        'order/{id}',
                        'trade',
                        'trade/{id}',
                        'withdrawal',
                        'withdrawal/{id}',
                    ],
                    'post': [
                        'request_for_quote',
                        'order',
                        'withdrawal',
                    ],
                    'delete': [
                        'order/{id}',
                        'withdrawal/{id}',
                    ],
                },
            },
            'markets': {
                'BTC/USD': { 'id': 'BTCUSD.SPOT', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'BTC', 'quoteId': 'USD' },
                'ETH/USD': { 'id': 'ETHUSD.SPOT', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD', 'baseId': 'ETH', 'quoteId': 'USD' },
                'XRP/USD': { 'id': 'XRPUSD.SPOT', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD', 'baseId': 'XRP', 'quoteId': 'USD' },
            },
            'httpExceptions': {
                '400': BadRequest, // Bad Request –- Incorrect parameters.
                '401': AuthenticationError, //Unauthorized – Wrong Token.
                '404': ExchangeNotAvailable, // Not Found – The specified endpoint could not be found.
                '405': ExchangeNotAvailable, // Method Not Allowed – You tried to access an endpoint with an invalid method.
                '406': BadRequest, // Not Acceptable – Incorrect request format.
                '429': RateLimitExceeded, // Too Many Requests – Rate limited, pause requests.
                '500': ExchangeError, // Internal Server Error – We had a problem with our server. Try again later.
                '503': OnMaintenance, // Service unavailable
            },
            'exceptions': {
                'exact': {
                    '1000': ExchangeError, // Generic –- Unknown error.
                    '1001': InvalidOrder, // Instrument not allowed – Instrument does not exist or you are not authorized to trade it.
                    '1002': PermissionDenied, // The RFQ does not belong to you.
                    '1003': InvalidOrder, // Different instrument – You tried to post a trade with a different instrument than the related RFQ.
                    '1004': InvalidOrder, // Different side – You tried to post a trade with a different side than the related RFQ.
                    '1005': InvalidOrder, // Different price – You tried to post a trade with a different price than the related RFQ.
                    '1006': InvalidOrder, // Different quantity – You tried to post a trade with a different quantity than the related RFQ.
                    '1007': InvalidOrder, // Quote is not valid – Quote may have expired.
                    '1009': InvalidOrder, // Price not valid – The price is not valid anymore. This error can occur during big market moves.
                    '1010': InvalidOrder, // Quantity too big – Max quantity per trade reached.
                    '1010': InsufficientFunds, // Not enough balance – Not enough balance.
                    '1012': InsufficientFunds, // Max risk exposure reached – Please see our FAQ for more information about the risk exposure.
                    '1013': InsufficientFunds, // Max credit exposure reached – Please see our FAQ for more information about the credit exposure.
                    '1014': InvalidAddress, // No BTC address associated – You don’t have a BTC address associated to your account.
                    '1015': InvalidOrder, // Too many decimals – We only allow four decimals in quantities.
                    '1016': OnMaintenance, // Trading is disabled – May occur after a maintenance or under exceptional circumstances.
                    '1017': BadRequest, // Illegal parameter – Wrong type or parameter.
                    '1018': OnMaintenance, // Settlement is disabled at the moment.
                    '1019': InvalidOrder, // Quantity is too small.
                    '1020': InvalidOrder, // The field valid_until is malformed.
                    '1021': OrderNotFound, // Your Order has expired.
                    '1022': BadSymbol, // Currency not allowed.
                    '1023': NotSupported, // We only support “FOK” order_type at the moment.
                    '1100': ExchangeError, // Other error.
                    '1101': BadRequest, // Field required – Field required.
                    '1102': BadRequest, // Pagination offset too big – Narrow down the data space using parameters such as ‘created*gte’, ‘created*lt’, ‘since’.
                    '1200': OnMaintenance, // API Maintenance
                },
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
        const now = this.nonce ();
        const result = {
            'info': response,
            'timestamp': now,
            'datetime': this.iso8601 (now*1000),
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
        // side: 'buy' | 'sell';
        // type: 'market' | 'limit';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const lowercaseSide = side.toLowerCase ();
        const lowercaseType = type.toLowerCase ();
        const request = {
            'client_order_id': uuid ().toString (), // to parameterise
            'quantity': this.amountToPrecision (symbol, amount),
            'side': lowercaseSide,
            'instrument': market['id'],
            'valid_until': '2022-08-04 10:05:15.00000', // need to do properly
        };
        if (lowercaseType === 'limit') {
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

    async fetchOrders (symbol = undefined, since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        let marketId = undefined;
        if (symbol !== undefined) {
            marketId = this.market (symbol)['id'];
        }
        const request = {
            'created__gte': this.iso8601(since),
            'created__lt': undefined,
            'client_order_id': undefined,
            'order_type': undefined,
            'executing_unit': undefined,
            'instrument': marketId,
            'limit': limit,
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
        const id = this.safeString (order, 'order_id');
        const clientOrderId = this.safeString (order, 'client_order_id');
        const marketId = this.safeString (order, 'instrument');
        const symbol = this.safeSymbol (marketId, market);
        const price = this.safeNumber (order, 'price');
        const averagepxString = this.safeString (order, 'executed_price');
        const averagepx = this.safeNumber (order, 'executed_price');
        const amountString = this.safeString (order, 'quantity');
        const amount = this.safeNumber (order, 'quantity');
        const side = this.safeStringLower (order, 'side');
        let type = this.safeStringUpper (order, 'order_type');
        if (type === 'FOK') {
            type = 'limit';
        } else {
            type = 'market';
        }
        const datetime = this.parse8601 (this.safeString (order, 'created'));
        let filled = undefined;
        let status = undefined;
        let cost = undefined;
        let remaining = undefined;
        if (averagepx !== undefined) {
            status = 'closed';
            filled = amount;
            cost = this.parseNumber (Precise.stringMul (averagepxString, amountString));
        } else {
            status = 'open';
            remaining = amount;
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': undefined, // convert datetime to millis
            'datetime': this.iso8601 (datetime),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': averagepx,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            // 'trades': trades, - B2C2 doesn't return this nor get trades by order ID, need to synthesise
        });
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        const request = {
            'created__gte': undefined,
            'created__lt': undefined,
            'instrument': symbol, // need to map to markets
            'since': undefined, // need to map to markets
            'ordering': undefined, // asc or desc, default desc
            'executing_unit': undefined,
            'limit': limit,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument'] = market['id'];
        }
        if (since !== undefined) {
            request['since'] = this.iso8601 (since);
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
        const id = this.safeString (trade, 'trade_id');
        const amountString = this.safeString (trade, 'quantity');
        const amount = this.parseNumber (amountString);
        const side = this.safeStringLower (trade, 'side');
        const marketId = this.safeString (trade, 'instrument');
        const symbol = this.safeSymbol (marketId, market);
        const priceString = this.safeString (trade, 'price');
        const price = this.parseNumber (priceString);
        const datetime = this.parse8601 (this.safeString (trade, 'created'));
        const orderId = this.safeString (trade, 'client_order_id');
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const type = undefined; // need to link to the order, otherwise cannot tell
        const takerOrMaker = undefined; // need to link to the order, otherwise cannot tell
        return {
            'info': trade,
            'id': id,
            'timestamp': undefined, // need to do millis
            'datetime': this.iso8601 (datetime),
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': takerOrMaker,
            'fee': undefined, // no fees for b2c2
        };
    }

    parseLedgerEntryType (type) {
        // Currently four types of ledgers are possible:
        // trade (ledger resulting of a trade, there are two ledgers per trade)
        // transfer (either you sent funds to B2C2, or B2C2 sent you funds)
        // funding (funding rate charged for your open positions if you have some, CFD only)
        // realised_pnl (Realised P&L, CFD only)
        const types = {
            'transfer': 'transaction',
            'funding': 'funding',
            'realised_pnl': 'margin',
            'trade': 'trade',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
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
        const timestamp = this.parse8601 (this.safeString (item, 'created'));
        const referenceId = this.safeString (item, 'reference');
        const currencyId = this.safeString (item, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency); // not sure why we need the currency param?!
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const account = this.safeString (item, 'group');
        let amount = this.safeNumber (item, 'amount');
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
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': amount,
            'before': undefined,
            'after': undefined,
            'status': 'ok',
            'fee': undefined,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const request = {
            'created__gte': this.iso8601 (since),
            'created__lt': undefined,
            'currency': currency,
            'type': undefined,
            'since': since,
            'limit': limit,
        };
        const response = await this.privateGetLedger (request);
        return this.parseLedger (response, currency, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        // Request a settlement for a given amount to the given destination in a given currency. 
        // Your account must exhibit a sufficient balance in the requested currency. 
        // Note that for non approved addresses, the amount can only be lower than 0.1.
        // The address_protocol parameter is either “Omni” or “ERC20” and only used for UST settlement requests. 
        // For other currencies, leave null. The address_suffix is the memo or the tag of the address as entered on the website.
        // post_data = {
        //     'amount': '1000',
        //     'currency': 'XRP',
        //     'destination_address': {
        //         'address_value': 'rUQngTebGgF1tCexhuPaQBr5MufweybMom',
        //         'address_suffix': 'tag0',
        //         'address_protocol': None
        //     }
        // }
        // # Fiat withdrawal
        // post_data = {
        //     'amount': '1000',
        //     'currency': 'USD',
        //     'destination_bank_account': 'USD Bank Account'
        // }
        // Response:
        // {
        //     "amount": "1000.00000000",
        //     "currency": "XRP",
        //     "withdrawal_id": "5c7e90cc-a8d6-4db5-8348-44053b2dcbdf",
        //     "reference": "",
        //     "settled": false,
        //     "created": "2021-06-09T09:46:00.162599Z",
        //     "destination_address": {
        //       "address_value": "rUQngTebGgF1tCexhuPaQBr5MufweybMom",
        //       "address_suffix": "tag0",
        //       "address_protocol": null
        //     },
        //     "destination_bank_account": null
        //   }
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'amount': amount,
            'currency': currency['id'],
        };
        const dest = {
            'address_value': address,
        }
        if (tag !== undefined) {
            request['addressTag'] = tag;
        }
        if (currency == 'UST') {
            request['address_protocol'] = 'ERC20';
        }
        request['destination_address'] = dest;
        const response = await this.privatePostWithdrawal (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response, 'withdrawal_id'),
        };
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {
            'limit': limit,
        };
        const response = await this.privateGetWithdrawal (this.extend (request, params));
        return this.parseWithdrawals (response, currency, since, limit);
    }

    parseWithdrawal (transaction, currency = undefined) {
        // [
        //     {
        //       "amount": "2.00000000",
        //       "currency": "BTC",
        //       "destination_address": "0xC323E80eF4deC2195G239F4f1e830417D294F841",
        //       "destination_bank_account": null,
        //       "reference": "",
        //       "settled": false,
        //       "created": "2021-06-09T09:46:00.162599Z",
        //       "withdrawal_id": "ed846746-f7e0-4af9-85bb-36732e60d6d8"
        //     },
        //     {
        //       "amount": "10.00000000",
        //       "currency": "BTC",
        //       "destination_address": null,
        //       "destination_bank_account": "EUR BA",
        //       "reference": "",
        //       "settled": true,
        //       "created": "2021-06-09T09:46:00.162599Z",
        //       "withdrawal_id": "b4426ff2-19c6-48ca-8b07-2c344dc34ecb"
        //     }
        //   ]
        const amount = this.safeNumber (transaction, 'amount');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const address = this.safeString (transaction, 'destination_address');
        let tag = this.safeString (transaction, 'reference'); // set but unused
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        let status = 'pending';
        if (transaction['settled'] == true) {
            status = 'ok';
        }
        const datetime = this.parse8601 (this.safeString (transaction, 'applyTime'));
        const id = this.safeString (transaction, 'withdrawal_id');
        return {
            'info': transaction,
            'id': id,
            'txid': id,
            'timestamp': undefined, // need to get millis from datetime
            'datetime': this.iso8601 (datetime),
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'type': 'withdrawal',
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'internal': false,
            'fee': undefined,
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
