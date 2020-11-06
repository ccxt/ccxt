'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, PermissionDenied, BadRequest, CancelPending, OrderNotFound, InsufficientFunds, RateLimitExceeded, InvalidOrder, AccountSuspended, BadSymbol, OnMaintenance } = require ('./base/errors');
const { TRUNCATE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class novadax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'novadax',
            'name': 'NovaDAX',
            'countries': [ 'BR' ], // Brazil
            'rateLimit': 50,
            'version': 'v1',
            // new metainfo interface
            'has': {
                'CORS': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchMarkets': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/92337550-2b085500-f0b3-11ea-98e7-5794fb07dd3b.jpg',
                'api': {
                    'public': 'https://api.novadax.com',
                    'private': 'https://api.novadax.com',
                },
                'www': 'https://www.novadax.com.br',
                'doc': [
                    'https://doc.novadax.com/pt-BR/',
                ],
                'fees': 'https://www.novadax.com.br/fees-and-limits',
                'referral': 'https://www.novadax.com.br/?s=ccxt',
            },
            'api': {
                'public': {
                    'get': [
                        'common/symbol',
                        'common/symbols',
                        'common/timestamp',
                        'market/tickers',
                        'market/ticker',
                        'market/depth',
                        'market/trades',
                    ],
                },
                'private': {
                    'get': [
                        'orders/get',
                        'orders/list',
                        'orders/fill',
                        'account/getBalance',
                        'account/subs',
                        'account/subs/balance',
                        'account/subs/transfer/record',
                    ],
                    'post': [
                        'orders/create',
                        'orders/cancel',
                        'account/withdraw/coin',
                        'account/subs/transfer',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.5 / 100,
                    'maker': 0.3 / 100,
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                'exact': {
                    'A99999': ExchangeError, // 500 Failed Internal error
                    // 'A10000': ExchangeError, // 200 Success Successful request
                    'A10001': BadRequest, // 400 Params error Parameter is invalid
                    'A10002': ExchangeError, // 404 Api not found API used is irrelevant
                    'A10003': AuthenticationError, // 403 Authentication failed Authentication is failed
                    'A10004': RateLimitExceeded, // 429 Too many requests Too many requests are made
                    'A10005': PermissionDenied, // 403 Kyc required Need to complete KYC firstly
                    'A10006': AccountSuspended, // 403 Customer canceled Account is canceled
                    'A10007': BadRequest, // 400 Account not exist Sub account does not exist
                    'A10011': BadSymbol, // 400 Symbol not exist Trading symbol does not exist
                    'A10012': BadSymbol, // 400 Symbol not trading Trading symbol is temporarily not available
                    'A10013': OnMaintenance, // 503 Symbol maintain Trading symbol is in maintain
                    'A30001': OrderNotFound, // 400 Order not found Queried order is not found
                    'A30002': InvalidOrder, // 400 Order amount is too small Order amount is too small
                    'A30003': InvalidOrder, // 400 Order amount is invalid Order amount is invalid
                    'A30004': InvalidOrder, // 400 Order value is too small Order value is too small
                    'A30005': InvalidOrder, // 400 Order value is invalid Order value is invalid
                    'A30006': InvalidOrder, // 400 Order price is invalid Order price is invalid
                    'A30007': InsufficientFunds, // 400 Insufficient balance The balance is insufficient
                    'A30008': InvalidOrder, // 400 Order was closed The order has been executed
                    'A30009': InvalidOrder, // 400 Order canceled The order has been cancelled
                    'A30010': CancelPending, // 400 Order cancelling The order is being cancelled
                    'A30011': InvalidOrder, // 400 Order price too high The order price is too high
                    'A30012': InvalidOrder, // 400 Order price too low The order price is too low
                },
                'broad': {
                },
            },
            'commonCurrencies': {
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetCommonTimestamp (params);
        //
        //     {
        //         "code":"A10000",
        //         "data":1599090512080,
        //         "message":"Success"
        //     }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetCommonSymbols (params);
        //
        //     {
        //         "code":"A10000",
        //         "data":[
        //             {
        //                 "amountPrecision":8,
        //                 "baseCurrency":"BTC",
        //                 "minOrderAmount":"0.001",
        //                 "minOrderValue":"25",
        //                 "pricePrecision":2,
        //                 "quoteCurrency":"BRL",
        //                 "status":"ONLINE",
        //                 "symbol":"BTC_BRL",
        //                 "valuePrecision":2
        //             },
        //         ],
        //         "message":"Success"
        //     }
        //
        const result = [];
        const data = this.safeValue (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quoteCurrency');
            const id = this.safeString (market, 'symbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'amountPrecision'),
                'price': this.safeInteger (market, 'pricePrecision'),
                'cost': this.safeInteger (market, 'valuePrecision'),
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'minOrderAmount'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeFloat (market, 'minOrderValue'),
                    'max': undefined,
                },
            };
            const status = this.safeString (market, 'status');
            const active = (status === 'ONLINE');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
                'limits': limits,
                'info': market,
                'active': active,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker, fetchTickers
        //
        //     {
        //         "ask":"61946.1",
        //         "baseVolume24h":"164.41930186",
        //         "bid":"61815",
        //         "high24h":"64930.72",
        //         "lastPrice":"61928.41",
        //         "low24h":"61156.32",
        //         "open24h":"64512.46",
        //         "quoteVolume24h":"10308157.95",
        //         "symbol":"BTC_BRL",
        //         "timestamp":1599091115090
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const open = this.safeFloat (ticker, 'open24h');
        const last = this.safeFloat (ticker, 'lastPrice');
        let percentage = undefined;
        let change = undefined;
        let average = undefined;
        if ((last !== undefined) && (open !== undefined)) {
            change = last - open;
            percentage = change / open * 100;
            average = this.sum (last, open) / 2;
        }
        const baseVolume = this.safeFloat (ticker, 'baseVolume24h');
        const quoteVolume = this.safeFloat (ticker, 'quoteVolume24h');
        const vwap = this.vwap (baseVolume, quoteVolume);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24h'),
            'low': this.safeFloat (ticker, 'low24h'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketTicker (this.extend (request, params));
        //
        //     {
        //         "code":"A10000",
        //         "data":{
        //             "ask":"61946.1",
        //             "baseVolume24h":"164.41930186",
        //             "bid":"61815",
        //             "high24h":"64930.72",
        //             "lastPrice":"61928.41",
        //             "low24h":"61156.32",
        //             "open24h":"64512.46",
        //             "quoteVolume24h":"10308157.95",
        //             "symbol":"BTC_BRL",
        //             "timestamp":1599091115090
        //         },
        //         "message":"Success"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarketTickers (params);
        //
        //     {
        //         "code":"A10000",
        //         "data":[
        //             {
        //                 "ask":"61879.36",
        //                 "baseVolume24h":"164.40955092",
        //                 "bid":"61815",
        //                 "high24h":"64930.72",
        //                 "lastPrice":"61820.04",
        //                 "low24h":"61156.32",
        //                 "open24h":"64624.19",
        //                 "quoteVolume24h":"10307493.92",
        //                 "symbol":"BTC_BRL",
        //                 "timestamp":1599091291083
        //             },
        //         ],
        //         "message":"Success"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseTicker (data[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 20
        }
        const response = await this.publicGetMarketDepth (this.extend (request, params));
        //
        //     {
        //         "code":"A10000",
        //         "data":{
        //             "asks":[
        //                 ["0.037159","0.3741"],
        //                 ["0.037215","0.2706"],
        //                 ["0.037222","1.8459"],
        //             ],
        //             "bids":[
        //                 ["0.037053","0.3857"],
        //                 ["0.036969","0.8101"],
        //                 ["0.036953","1.5226"],
        //             ],
        //             "timestamp":1599280414448
        //         },
        //         "message":"Success"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const timestamp = this.safeInteger (data, 'timestamp');
        return this.parseOrderBook (data, timestamp, 'bids', 'asks');
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "amount":"0.0632",
        //         "price":"0.037288",
        //         "side":"BUY",
        //         "timestamp":1599279694576
        //     }
        //
        // private fetchOrderTrades
        //
        //     {
        //         "id": "608717046691139584",
        //         "orderId": "608716957545402368",
        //         "symbol": "BTC_BRL",
        //         "side": "BUY",
        //         "amount": "0.0988",
        //         "price": "45514.76",
        //         "fee": "0.0000988 BTC",
        //         "role": "MAKER",
        //         "timestamp": 1565171053345
        //     }
        //
        const id = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'orderId');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const side = this.safeStringLower (trade, 'side');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = this.safeFloat (trade, 'volume');
        if ((cost === undefined) && (amount !== undefined) && (price !== undefined)) {
            cost = amount * price;
        }
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const takerOrMaker = this.safeStringLower (trade, 'role');
        const feeString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeString !== undefined) {
            const parts = feeString.split (' ');
            const feeCurrencyId = this.safeString (parts, 1);
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': this.safeFloat (parts, 0),
                'currency': feeCurrencyCode,
            };
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
            'takerOrMaker': takerOrMaker,
            'fee': fee,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100
        }
        const response = await this.publicGetMarketTrades (this.extend (request, params));
        //
        //     {
        //         "code":"A10000",
        //         "data":[
        //             {"amount":"0.0632","price":"0.037288","side":"BUY","timestamp":1599279694576},
        //             {"amount":"0.0052","price":"0.03715","side":"SELL","timestamp":1599276606852},
        //             {"amount":"0.0058","price":"0.037188","side":"SELL","timestamp":1599275187812},
        //         ],
        //         "message":"Success"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccountGetBalance (params);
        //
        //     {
        //         "code": "A10000",
        //         "data": [
        //             {
        //                 "available": "1.23",
        //                 "balance": "0.23",
        //                 "currency": "BTC",
        //                 "hold": "1"
        //             }
        //         ],
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = { 'info': response };
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeFloat (balance, 'available');
            account['free'] = this.safeFloat (balance, 'balance');
            account['used'] = this.safeFloat (balance, 'hold');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const uppercaseType = type.toUpperCase ();
        const uppercaseSide = side.toUpperCase ();
        const request = {
            'symbol': market['id'],
            'type': uppercaseType, // LIMIT, MARKET
            'side': uppercaseSide, // or SELL
            // 'accountId': '...', // subaccount id, optional
            // 'amount': this.amountToPrecision (symbol, amount),
            // "price": "1234.5678", // required for LIMIT and STOP orders
        };
        if (uppercaseType === 'LIMIT') {
            request['price'] = this.priceToPrecision (symbol, price);
            request['amount'] = this.amountToPrecision (symbol, amount);
        } else if (uppercaseType === 'MARKET') {
            if (uppercaseSide === 'SELL') {
                request['amount'] = this.amountToPrecision (symbol, amount);
            } else if (uppercaseSide === 'BUY') {
                let value = this.safeFloat (params, 'value');
                const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
                if (createMarketBuyOrderRequiresPrice) {
                    if (price !== undefined) {
                        if (value === undefined) {
                            value = amount * price;
                        }
                    } else if (value === undefined) {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'amount' argument or in the 'value' extra parameter (the exchange-specific behaviour)");
                    }
                } else {
                    value = (value === undefined) ? amount : value;
                }
                const precision = market['precision']['price'];
                request['value'] = this.decimalToPrecision (value, TRUNCATE, precision, this.precisionMode);
            }
        }
        const response = await this.privatePostOrdersCreate (this.extend (request, params));
        //
        //     {
        //         "code": "A10000",
        //         "data": {
        //             "amount": "0.001",
        //             "averagePrice": null,
        //             "filledAmount": "0",
        //             "filledFee": "0",
        //             "filledValue": "0",
        //             "id": "633679992971251712",
        //             "price": "35000",
        //             "side": "BUY",
        //             "status": "PROCESSING",
        //             "symbol": "BTC_BRL",
        //             "timestamp": 1571122683535,
        //             "type": "LIMIT",
        //             "value": "35"
        //         },
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privatePostOrdersCancel (this.extend (request, params));
        //
        //     {
        //         "code": "A10000",
        //         "data": {
        //             "result": true
        //         },
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersGet (this.extend (request, params));
        //
        //     {
        //         "code": "A10000",
        //         "data": {
        //             "id": "608695623247466496",
        //             "symbol": "BTC_BRL",
        //             "type": "MARKET",
        //             "side": "SELL",
        //             "price": null,
        //             "averagePrice": "0",
        //             "amount": "0.123",
        //             "filledAmount": "0",
        //             "value": null,
        //             "filledValue": "0",
        //             "filledFee": "0",
        //             "status": "REJECTED",
        //             "timestamp": 1565165945588
        //         },
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'symbol': market['id'],
            // 'status': 'SUBMITTED,PROCESSING', // SUBMITTED, PROCESSING, PARTIAL_FILLED, CANCELING, FILLED, CANCELED, REJECTED
            // 'fromId': '...', // order id to begin with
            // 'toId': '...', // order id to end up with
            // 'fromTimestamp': since,
            // 'toTimestamp': this.milliseconds (),
            // 'limit': limit, // default 100, max 100
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        if (since !== undefined) {
            request['fromTimestamp'] = since;
        }
        const response = await this.privateGetOrdersList (this.extend (request, params));
        //
        //     {
        //         "code": "A10000",
        //         "data": [
        //             {
        //                 "id": "608695678650028032",
        //                 "symbol": "BTC_BRL",
        //                 "type": "MARKET",
        //                 "side": "SELL",
        //                 "price": null,
        //                 "averagePrice": "0",
        //                 "amount": "0.123",
        //                 "filledAmount": "0",
        //                 "value": null,
        //                 "filledValue": "0",
        //                 "filledFee": "0",
        //                 "status": "REJECTED",
        //                 "timestamp": 1565165958796
        //             },
        //         ],
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'SUBMITTED,PROCESSING,PARTIAL_FILLED,CANCELING',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'FILLED,CANCELED,REJECTED',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersFill (this.extend (request, params));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const data = this.safeValue (response, 'data', []);
        //
        //     {
        //         "code": "A10000",
        //         "data": [
        //             {
        //                 "id": "608717046691139584",
        //                 "orderId": "608716957545402368",
        //                 "symbol": "BTC_BRL",
        //                 "side": "BUY",
        //                 "amount": "0.0988",
        //                 "price": "45514.76",
        //                 "fee": "0.0000988 BTC",
        //                 "role": "MAKER",
        //                 "timestamp": 1565171053345
        //             },
        //         ],
        //         "message": "Success"
        //     }
        //
        return this.parseTrades (data, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'SUBMITTED': 'open',
            'PROCESSING': 'open',
            'PARTIAL_FILLED': 'open',
            'CANCELING': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'REJECTED': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder, fetchOrders, fetchOrder
        //
        //     {
        //         "amount": "0.001",
        //         "averagePrice": null,
        //         "filledAmount": "0",
        //         "filledFee": "0",
        //         "filledValue": "0",
        //         "id": "633679992971251712",
        //         "price": "35000",
        //         "side": "BUY",
        //         "status": "PROCESSING",
        //         "symbol": "BTC_BRL",
        //         "timestamp": 1571122683535,
        //         "type": "LIMIT",
        //         "value": "35"
        //     }
        //
        // cancelOrder
        //
        //     {
        //         "result": true
        //     }
        //
        const id = this.safeString (order, 'id');
        const amount = this.safeFloat (order, 'amount');
        const price = this.safeFloat (order, 'price');
        const cost = this.safeFloat (order, 'filledValue');
        const type = this.safeStringLower (order, 'type');
        const side = this.safeStringLower (order, 'side');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const timestamp = this.safeInteger (order, 'timestamp');
        const average = this.safeFloat (order, 'averagePrice');
        const filled = this.safeFloat (order, 'filledAmount');
        let remaining = undefined;
        if ((amount !== undefined) && (filled !== undefined)) {
            remaining = Math.max (0, amount - filled);
        }
        let fee = undefined;
        const feeCost = this.safeFloat (order, 'filledFee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': undefined,
            };
        }
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        return {
            'id': id,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'code': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
            'wallet': address,
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const response = await this.privatePostAccountWithdrawCoin (this.extend (request, params));
        //
        //     {
        //         "code":"A10000",
        //         "data": "DR123",
        //         "message":"Success"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "code":"A10000",
        //         "data": "DR123",
        //         "message":"Success"
        //     }
        //
        const id = this.safeString (transaction, 'data');
        let code = undefined;
        if (currency !== undefined) {
            code = currency['code'];
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': undefined,
            'address': undefined,
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'status': undefined,
            'type': undefined,
            'updated': undefined,
            'txid': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fee': undefined,
        };
    }

    async fetchAccounts (params = {}) {
        const response = await this.privateGetAccountSubs (params);
        //
        //     {
        //         "code": "A10000",
        //         "data": [
        //             {
        //                 "subId": "CA648856083527372800",
        //                 "state": "Normal",
        //                 "subAccount": "003",
        //                 "subIdentify": "003"
        //             }
        //         ],
        //         "message": "Success"
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const account = data[i];
            const accountId = this.safeString (account, 'subId');
            const type = this.safeString (account, 'subAccount');
            result.push ({
                'id': accountId,
                'type': type,
                'currency': undefined,
                'info': account,
            });
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + request;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            headers = {
                'X-Nova-Access-Key': this.apiKey,
                'X-Nova-Timestamp': timestamp,
            };
            let queryString = undefined;
            if (method === 'POST') {
                body = this.json (query);
                queryString = this.hash (body, 'md5');
                headers['Content-Type'] = 'application/json';
            } else {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
                queryString = this.urlencode (this.keysort (query));
            }
            const auth = method + "\n" + request + "\n" + queryString + "\n" + timestamp; // eslint-disable-line quotes
            headers['X-Nova-Signature'] = this.hmac (this.encode (auth), this.encode (this.secret));
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        //     {"code":"A10003","data":[],"message":"Authentication failed, Invalid accessKey."}
        //
        const errorCode = this.safeString (response, 'code');
        if (errorCode !== 'A10000') {
            const message = this.safeString (response, 'message');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
