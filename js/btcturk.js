'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, InvalidOrder } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class btcturk extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcturk',
            'name': 'BTCTurk',
            'countries': [ 'TR' ], // Turkey
            'rateLimit': 1000,
            'has': {
                'cancelOrder': true,
                'CORS': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchOpenOrders': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchMyTrades': true,
            },
            'timeframes': {
                '1d': '1d',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87153926-efbef500-c2c0-11ea-9842-05b63612c4b9.jpg',
                'api': {
                    'public': 'https://api.btcturk.com/api/v2',
                    'private': 'https://api.btcturk.com/api/v1',
                    'graph': 'https://graph-api.btcturk.com/v1',
                },
                'www': 'https://www.btcturk.com',
                'doc': 'https://github.com/BTCTrader/broker-api-docs',
            },
            'api': {
                'public': {
                    'get': [
                        'orderbook',
                        'ticker',
                        'trades',   // ?last=COUNT (max 50)
                        'server/exchangeinfo',
                    ],
                },
                'private': {
                    'get': [
                        'users/balances',
                        'openOrders',
                        'allOrders',
                        'users/transactions/trade',
                    ],
                    'post': [
                        'order',
                        'cancelOrder',
                    ],
                    'delete': [
                        'order',
                    ],
                },
                'graph': {
                    'get': [
                        'ohlcs',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.0005'),
                    'taker': this.parseNumber ('0.0009'),
                },
            },
            'exceptions': {
                'exact': {
                    'FAILED_ORDER_WITH_OPEN_ORDERS': InsufficientFunds,
                    'FAILED_LIMIT_ORDER': InvalidOrder,
                    'FAILED_MARKET_ORDER': InvalidOrder,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetServerExchangeinfo (params);
        //
        //     {
        //       "data": {
        //         "timeZone": "UTC",
        //         "serverTime": "1618826678404",
        //         "symbols": [
        //           {
        //             "id": "1",
        //             "name": "BTCTRY",
        //             "nameNormalized": "BTC_TRY",
        //             "status": "TRADING",
        //             "numerator": "BTC",
        //             "denominator": "TRY",
        //             "numeratorScale": "8",
        //             "denominatorScale": "2",
        //             "hasFraction": false,
        //             "filters": [
        //               {
        //                 "filterType": "PRICE_FILTER",
        //                 "minPrice": "0.0000000000001",
        //                 "maxPrice": "10000000",
        //                 "tickSize": "10",
        //                 "minExchangeValue": "99.91",
        //                 "minAmount": null,
        //                 "maxAmount": null
        //               }
        //             ],
        //             "orderMethods": [
        //               "MARKET",
        //               "LIMIT",
        //               "STOP_MARKET",
        //               "STOP_LIMIT"
        //             ],
        //             "displayFormat": "#,###",
        //             "commissionFromNumerator": false,
        //             "order": "1000",
        //             "priceRounding": false
        //           },
        //         },
        //       ],
        //     }
        //
        const data = this.safeValue (response, 'data');
        const markets = this.safeValue (data, 'symbols', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const entry = markets[i];
            const id = this.safeString (entry, 'name');
            const baseId = this.safeString (entry, 'numerator');
            const quoteId = this.safeString (entry, 'denominator');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const filters = this.safeValue (entry, 'filters');
            let minPrice = undefined;
            let maxPrice = undefined;
            let minAmount = undefined;
            let maxAmount = undefined;
            let minCost = undefined;
            for (let j = 0; j < filters.length; j++) {
                const filter = filters[j];
                const filterType = this.safeString (filter, 'filterType');
                if (filterType === 'PRICE_FILTER') {
                    minPrice = this.safeNumber (filter, 'minPrice');
                    maxPrice = this.safeNumber (filter, 'maxPrice');
                    minAmount = this.safeNumber (filter, 'minAmount');
                    maxAmount = this.safeNumber (filter, 'maxAmount');
                    minCost = this.safeNumber (filter, 'minExchangeValue');
                }
            }
            const status = this.safeString (entry, 'status');
            const active = status === 'TRADING';
            const limits = {
                'price': {
                    'min': minPrice,
                    'max': maxPrice,
                },
                'amount': {
                    'min': minAmount,
                    'max': maxAmount,
                },
                'cost': {
                    'min': minCost,
                    'max': undefined,
                },
            };
            const precision = {
                'price': this.safeInteger (entry, 'denominatorScale'),
                'amount': this.safeInteger (entry, 'numeratorScale'),
            };
            result.push ({
                'info': entry,
                'symbol': symbol,
                'id': id,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'limits': limits,
                'precision': precision,
                'active': active,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetUsersBalances (params);
        //
        //     {
        //       "data": [
        //         {
        //           "asset": "TRY",
        //           "assetname": "Türk Lirası",
        //           "balance": "0",
        //           "locked": "0",
        //           "free": "0",
        //           "orderFund": "0",
        //           "requestFund": "0",
        //           "precision": 2
        //         }
        //       ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const currencyId = this.safeString (entry, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (entry, 'balance');
            account['free'] = this.safeString (entry, 'free');
            account['used'] = this.safeString (entry, 'locked');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairSymbol': market['id'],
        };
        const response = await this.publicGetOrderbook (this.extend (request, params));
        //     {
        //       "data": {
        //         "timestamp": 1618827901241,
        //         "bids": [
        //           [
        //             "460263.00",
        //             "0.04244000"
        //           ]
        //         ]
        //       }
        //     }
        const data = this.safeValue (response, 'data');
        const timestamp = this.safeInteger (data, 'timestamp');
        return this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 0, 1);
    }

    parseTicker (ticker, market = undefined) {
        //
        //   {
        //     "pair": "BTCTRY",
        //     "pairNormalized": "BTC_TRY",
        //     "timestamp": 1618826361234,
        //     "last": 462485,
        //     "high": 473976,
        //     "low": 444201,
        //     "bid": 461928,
        //     "ask": 462485,
        //     "open": 456915,
        //     "volume": 917.41368645,
        //     "average": 462868.29574589,
        //     "daily": 5570,
        //     "dailyPercent": 1.22,
        //     "denominatorSymbol": "TRY",
        //     "numeratorSymbol": "BTC",
        //     "order": 1000
        //   }
        //
        const marketId = this.safeString (ticker, 'pair');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const last = this.safeNumber (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeNumber (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeNumber (ticker, 'daily'),
            'percentage': this.safeNumber (ticker, 'dailyPercent'),
            'average': this.safeNumber (ticker, 'average'),
            'baseVolume': this.safeNumber (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        const tickers = this.safeValue (response, 'data');
        return this.parseTickers (tickers, symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.fetchTickers ([ symbol ], params);
        return this.safeValue (tickers, symbol);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades
        //     {
        //       "pair": "BTCUSDT",
        //       "pairNormalized": "BTC_USDT",
        //       "numerator": "BTC",
        //       "denominator": "USDT",
        //       "date": "1618916879083",
        //       "tid": "637545136790672520",
        //       "price": "55774",
        //       "amount": "0.27917100",
        //       "side": "buy"
        //     }
        //
        // fetchMyTrades
        //     {
        //       "price": "56000",
        //       "numeratorSymbol": "BTC",
        //       "denominatorSymbol": "USDT",
        //       "orderType": "buy",
        //       "orderId": "2606935102",
        //       "id": "320874372",
        //       "timestamp": "1618916479593",
        //       "amount": "0.00020000",
        //       "fee": "0",
        //       "tax": "0"
        //     }
        //
        const timestamp = this.safeInteger2 (trade, 'date', 'timestamp');
        const id = this.safeString2 (trade, 'tid', 'id');
        const order = this.safeString (trade, 'orderId');
        const priceString = this.safeString (trade, 'price');
        const amountString = Precise.stringAbs (this.safeString (trade, 'amount'));
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const marketId = this.safeString (trade, 'pair');
        const symbol = this.safeSymbol (marketId, market);
        const side = this.safeString2 (trade, 'side', 'orderType');
        let fee = undefined;
        const feeAmountString = this.safeString (trade, 'fee');
        if (feeAmountString !== undefined) {
            const feeCurrency = this.safeString (trade, 'denominatorSymbol');
            fee = {
                'cost': this.parseNumber (Precise.stringAbs (feeAmountString)),
                'currency': this.safeCurrencyCode (feeCurrency),
            };
        }
        return {
            'info': trade,
            'id': id,
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // let maxCount = 50;
        const request = {
            'pairSymbol': market['id'],
        };
        if (limit !== undefined) {
            request['last'] = limit;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //       "data": [
        //         {
        //           "pair": "BTCTRY",
        //           "pairNormalized": "BTC_TRY",
        //           "numerator": "BTC",
        //           "denominator": "TRY",
        //           "date": 1618828421497,
        //           "tid": "637544252214980918",
        //           "price": "462585.00",
        //           "amount": "0.01618411",
        //           "side": "sell"
        //         }
        //       ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTrades (data, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //     {
        //        "pair": "BTCTRY",
        //        "time": 1508284800,
        //        "open": 20873.689453125,
        //        "high": 20925.0,
        //        "low": 19310.0,
        //        "close": 20679.55078125,
        //        "volume": 402.216101626982,
        //        "total": 8103096.44443274,
        //        "average": 20146.13,
        //        "dailyChangeAmount": -194.14,
        //        "dailyChangePercentage": -0.93
        //      },
        return [
            this.safeTimestamp (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['last'] = limit;
        }
        const response = await this.graphGetOhlcs (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderType': side,
            'orderMethod': type,
            'pairSymbol': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
        };
        if (type !== 'market') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if ('clientOrderId' in params) {
            request['newClientOrderId'] = params['clientOrderId'];
        } else if (!('newClientOrderId' in params)) {
            request['newClientOrderId'] = this.uuid ();
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'id': id,
        };
        return await this.privateDeleteOrder (this.extend (request, params));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pairSymbol'] = market['id'];
        }
        const response = await this.privateGetOpenOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        const bids = this.safeValue (data, 'bids', []);
        const asks = this.safeValue (data, 'asks', []);
        return this.parseOrders (this.arrayConcat (bids, asks), market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairSymbol': market['id'],
        };
        if (limit !== undefined) {
            // default 100 max 1000
            request['last'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = Math.floor (since / 1000);
        }
        const response = await this.privateGetAllOrders (this.extend (request, params));
        // {
        //   "data": [
        //     {
        //       "id": "2606012912",
        //       "price": "55000",
        //       "amount": "0.0003",
        //       "quantity": "0.0003",
        //       "stopPrice": "0",
        //       "pairSymbol": "BTCUSDT",
        //       "pairSymbolNormalized": "BTC_USDT",
        //       "type": "buy",
        //       "method": "limit",
        //       "orderClientId": "2ed187bd-59a8-4875-a212-1b793963b85c",
        //       "time": "1618913189253",
        //       "updateTime": "1618913189253",
        //       "status": "Untouched",
        //       "leftAmount": "0.0003000000000000"
        //     }
        //   ]
        // }
        const data = this.safeValue (response, 'data');
        return this.parseOrders (data, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'Untouched': 'open',
            'Partial': 'open',
            'Canceled': 'canceled',
            'Closed': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market) {
        //
        // fetchOrders / fetchOpenOrders
        //     {
        //       "id": 2605984008,
        //       "price": "55000",
        //       "amount": "0.00050000",
        //       "quantity": "0.00050000",
        //       "stopPrice": "0",
        //       "pairSymbol": "BTCUSDT",
        //       "pairSymbolNormalized": "BTC_USDT",
        //       "type": "buy",
        //       "method": "limit",
        //       "orderClientId": "f479bdb6-0965-4f03-95b5-daeb7aa5a3a5",
        //       "time": 0,
        //       "updateTime": 1618913083543,
        //       "status": "Untouched",
        //       "leftAmount": "0.00050000"
        //     }
        //
        // createOrder
        //     {
        //       "id": "2606935102",
        //       "quantity": "0.0002",
        //       "price": "56000",
        //       "stopPrice": null,
        //       "newOrderClientId": "98e5c491-7ed9-462b-9666-93553180fb28",
        //       "type": "buy",
        //       "method": "limit",
        //       "pairSymbol": "BTCUSDT",
        //       "pairSymbolNormalized": "BTC_USDT",
        //       "datetime": "1618916479523"
        //     }
        //
        const id = this.safeString (order, 'id');
        const priceString = this.safeString (order, 'price');
        const precisePrice = new Precise (priceString);
        let price = undefined;
        const isZero = precisePrice.toString () === '0';
        if (!isZero) {
            price = this.parseNumber (precisePrice);
        }
        const amountString = this.safeString (order, 'quantity');
        const amount = this.parseNumber (Precise.stringAbs (amountString));
        const remaining = this.safeNumber (order, 'leftAmount');
        const marketId = this.safeNumber (order, 'pairSymbol');
        const symbol = this.safeSymbol (marketId, market);
        const side = this.safeString (order, 'type');
        const type = this.safeString (order, 'method');
        const clientOrderId = this.safeString (order, 'orderClientId');
        const timestamp = this.safeInteger2 (order, 'updateTime', 'datetime');
        const rawStatus = this.safeString (order, 'status');
        const status = this.parseOrderStatus (rawStatus);
        return this.safeOrder ({
            'info': order,
            'id': id,
            'price': price,
            'amount': amount,
            'remaining': remaining,
            'filled': undefined,
            'cost': undefined,
            'average': undefined,
            'status': status,
            'side': side,
            'type': type,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'fee': undefined,
        });
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privateGetUsersTransactionsTrade ();
        //
        //     {
        //       "data": [
        //         {
        //           "price": "56000",
        //           "numeratorSymbol": "BTC",
        //           "denominatorSymbol": "USDT",
        //           "orderType": "buy",
        //           "orderId": "2606935102",
        //           "id": "320874372",
        //           "timestamp": "1618916479593",
        //           "amount": "0.00020000",
        //           "fee": "0",
        //           "tax": "0"
        //         }
        //       ],
        //       "success": true,
        //       "message": "SUCCESS",
        //       "code": "0"
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTrades (data, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (this.id === 'btctrader') {
            throw new ExchangeError (this.id + ' is an abstract base API for BTCExchange, BTCTurk');
        }
        let url = this.urls['api'][api] + '/' + path;
        if ((method === 'GET') || (method === 'DELETE')) {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            body = this.json (params);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const secret = this.base64ToBinary (this.secret);
            const auth = this.apiKey + nonce;
            headers = {
                'X-PCK': this.apiKey,
                'X-Stamp': nonce,
                'X-Signature': this.hmac (this.encode (auth), secret, 'sha256', 'base64'),
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const errorCode = this.safeString (response, 'code', '0');
        const message = this.safeString (response, 'message');
        const output = (message === undefined) ? body : message;
        this.throwExactlyMatchedException (this.exceptions['exact'], message, this.id + ' ' + output);
        if (errorCode !== '0') {
            throw new ExchangeError (this.id + ' ' + output);
        }
    }
};
