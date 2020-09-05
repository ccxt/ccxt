'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, PermissionDenied, BadRequest, ArgumentsRequired, OrderNotFound, InsufficientFunds, ExchangeNotAvailable, DDoSProtection, InvalidAddress, InvalidOrder } = require ('./base/errors');

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
                'publicAPI': true,
                'privateAPI': true,
                'fetchBalance': true,
                'fetchMarkets': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87591171-9a377d80-c6f0-11ea-94ac-97a126eac3bc.jpg',
                'api': {
                    'public': 'https://api.novadax.com',
                    'private': 'https://api.novadax.com',
                },
                'www': 'https://www.novadax.com',
                'doc': [
                    'https://doc.novadax.com/en-US/',
                ],
                'fees': 'https://www.novadax.com/en/fees-and-limits',
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
                    // A99999 500 Failed Internal error
                    // A10000 200 Success Successful request
                    // A10001 400 Params error Parameter is invalid
                    // A10002 404 Api not found API used is irrelevant
                    // A10003 403 Authentication failed Authentication is failed
                    // A10004 429 Too many requests Too many requests are made
                    // A10005 403 Kyc required Need to complete KYC firstly
                    // A10006 403 Customer canceled Account is canceled
                    // A10007 400 Account not exist Sub account does not exist
                    // A10011 400 Symbol not exist Trading symbol does not exist
                    // A10012 400 Symbol not trading Trading symbol is temporarily not available
                    // A10013 503 Symbol maintain Trading symbol is in maintain
                    // A30001 400 Order not found Queried order is not found
                    // A30002 400 Order amount is too small Order amount is too small
                    // A30003 400 Order amount is invalid Order amount is invalid
                    // A30004 400 Order value is too small Order value is too small
                    // A30005 400 Order value is invalid Order value is invalid
                    // A30006 400 Order price is invalid Order price is invalid
                    // A30007 400 Insufficient balance The balance is insufficient
                    // A30008 400 Order was closed The order has been executed
                    // A30009 400 Order canceled The order has been cancelled
                    // A30010 400 Order cancelling The order is being cancelled
                    // A30011 400 Order price too high The order price is too high
                    // A30012 400 Order price too low The order price is too low
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
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else if (marketId !== undefined) {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
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
        // private fetchMyTrades
        //
        //     ...
        //
        const timestamp = this.safeInteger (trade, 'timestamp');
        const side = this.safeStringLower (trade, 'side');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = this.safeFloat (trade, 'volume');
        if ((cost === undefined) && (amount !== undefined) && (price !== undefined)) {
            cost = amount * price;
        }
        // const marketId = this.safeString (trade, 'instrument_code');
        let symbol = undefined;
        // if (marketId !== undefined) {
        //     if (marketId in this.markets_by_id) {
        //         market = this.markets_by_id[marketId];
        //         symbol = market['symbol'];
        //     } else {
        //         const [ baseId, quoteId ] = marketId.split ('_');
        //         const base = this.safeCurrencyCode (baseId);
        //         const quote = this.safeCurrencyCode (quoteId);
        //         symbol = base + '/' + quote;
        //     }
        // }
        if ((market !== undefined) && (symbol === undefined)) {
            symbol = market['symbol'];
        }
        return {
            'id': undefined,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': undefined,
            'fee': undefined,
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
        const request = {
            'symbol': market['id'],
            'type': uppercaseType, // LIMIT, MARKET
            'side': side.toUpperCase (), // or SELL
            // 'accountId': '...', // subaccount id, optional
            // 'amount': this.amountToPrecision (symbol, amount),
            // "price": "1234.5678", // required for LIMIT and STOP orders
        };
        let priceIsRequired = false;
        if (uppercaseType === 'LIMIT') {
            priceIsRequired = true;
        }
        if (priceIsRequired) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostAccountOrders (this.extend (request, params));
        //
        //     {
        //         "order_id": "d5492c24-2995-4c18-993a-5b8bf8fffc0d",
        //         "client_id": "d75fb03b-b599-49e9-b926-3f0b6d103206",
        //         "account_id": "a4c699f6-338d-4a26-941f-8f9853bfc4b9",
        //         "instrument_code": "BTC_EUR",
        //         "time": "2019-08-01T08:00:44.026Z",
        //         "side": "BUY",
        //         "price": "5000",
        //         "amount": "1",
        //         "filled_amount": "0.5",
        //         "type": "LIMIT",
        //         "time_in_force": "GOOD_TILL_CANCELLED"
        //     }
        //
        return this.parseOrder (response, market);
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
            let queryString = undefined;
            if (method === 'POST') {
                body = this.json (query);
                queryString = this.hash (body, 'md5');
            } else {
                queryString = this.urlencode (this.keysort (query));
            }
            const auth = method + "\n" + request + "\n" + queryString + "\n" + timestamp; // eslint-disable-line quotes
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            headers = {
                'X-Nova-Access-Key': this.apiKey,
                'X-Nova-Signature': signature,
                'X-Nova-Timestamp': timestamp,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const feedback = this.id + ' ' + body;
        const message = this.safeString (response, 'error');
        if (message !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
