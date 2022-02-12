'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest, BadSymbol, RateLimitExceeded, OrderNotFound, AuthenticationError, InsufficientFunds, InvalidOrder } = require ('./base/errors');

module.exports = class redot extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'redot',
            'name': 'Redot',
            'countries': [ 'EE' ], // Estonia
            'version': 'v1',
            'rateLimit': 300,
            'has': {
                'cancelAllOrders': false,
                'cancelOrder': false,
                'CORS': false,
                'createOrder': true,
                'fetchBalance': false,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRates': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrders': true,
                'fetchOrderBook': true,
                'fetchPositions': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfers': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'transfer': false,
                'withdraw': false,
            },
            'urls': {
                'logo': 'https://cdn.redot.com/static/icons/500px_transparent_background/Icon_0-3.png',
                'api': {
                    'public': 'https://api.redot.com/v1/public',
                    'private': 'https://api.redot.com/v1/private',
                },
                'www': 'https://redot.com/',
                'doc': 'https://redot.com/docs/#rest-api',
            },
            'api': {
                'public': {
                    'get': {
                        'get-info': 1,
                        'get-assets': 1,
                        'get-instruments': 1,
                        'get-instrument': 1,
                        'get-order-book': 1,
                        'get-ticker': 1,
                        'get-last-trades': 1,
                        'get-candles': 1,
                        'get-stats': 1,
                    },
                    'post': {
                        'get-token': 1,
                    },
                },
                'private': {
                    'get': {
                        'get-account-summary': 1,
                        'get-deposit-address': 1,
                        'get-fees': 1,
                        'get-deposits': 1,
                        'get-withdrawals': 1,
                        'get-order': 1,
                        'get-open-orders': 1,
                        'get-orders': 1,
                        'get-trades': 1,
                        'get-trades-by-order': 1,
                    },
                    'post': {
                        'withdraw': 1,
                        'place-order': 1,
                        'edit-order': 1,
                        'cancel-order': 1,
                        'cancel-all-orders': 1,
                        'revoke-token': 1,
                    },
                },
            },
            'options': {
                'accessToken': 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxNTY5MyIsInBybSI6IjExIiwiYWtkIjoieDhwTkVIOW56bmhuMUllWFc4NkxPSU1pMWhMeUhpTTFLS1ZNN3k5L2txWFc2enJyNHZQTlo2SmdaK0lDVjlhQ0tzemVrUEV5TFNDaVB4N0lOR2xlQThva1BjOCsydWtxQWcya01vMldCaUE9IiwicnRpZCI6IjI4ZWE1MWI4LThhNjEtNGIwYi1hNWJiLTAyOGMxNDcxYzkzNiIsInJ0ZXhwIjoiMTY0NTgwNTEzMCIsIm5iZiI6MTY0NDU5NTUzMCwiZXhwIjoxNjQ0NTk3MzMwLCJpYXQiOjE2NDQ1OTU1MzAsImlzcyI6IkFUTEFOVCIsImF1ZCI6IkFUTEFOVCJ9.itjV3wUk1Qrm1AMqwUrpCpd7WYqOgHmTN1rT2eq9-VykdV99YsBDIIO9w6XpMIi7haE8m4URdFHnUhvJnrjAadi0rTcJaoB_rHT98W4JJ9k1unm5gtEIT3TlrIPfz6naQ000RJBgSd5h5PnS32IR7uxpnO5XSCQ9FsDIkdL-eqoJEnp2n1-TQLQVG6Xzk3Encw9Oi4qiGHnlXHRz8ziDOu0KQLSU7FXUbiflXofuxMTd3xRbNndRMRzP-WT3C2KjO3MrjuOv_qJAoRBjqLIGZrSQGJJ2KoO7S862ZXpsmEDRw9i22H-008226V9RTnxie4yRTTZGZYgHN4IfDaIZbA',
                'refreshToken': 'EmG+8a6pXM40CfpQtEYdFb5oswLb1LfoVvf4USTxNkJT4qSKef//UfKDTslM/Yx/8dcHJTeLi7XCLRHGA91TsQ==',
            },
            'timeframes': {
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '1h': '3600',
                '12h': '43200',
            },
            'exceptions': {
                'exact': {
                    '10002': RateLimitExceeded, // {"error":{"code":10002,"message":"Too many requests."}}
                    '10501': BadRequest, // {"error":{"code":10501,"message":"Request parameters have incorrect format."}}
                    '12001': AuthenticationError, // {"error":{"code":12001,"message":"User is not authenticated."}}
                    '12004': AuthenticationError, // {"error":{"code":12004,"message":"Login failed."}}
                    '14500': BadRequest, // {"error":{"code":14500,"message":"Depth is invalid."}}
                    '13500': BadSymbol, // {"error":{"code":13500,"message":"Instrument id is invalid."}}
                    '15001': OrderNotFound, // {"error":{"code":15001,"message":"Order not found."}}
                    '15502': OrderNotFound, // {"error":{"code":15502,"message":"Order id is invalid."}}
                    '15503': InvalidOrder, // {"error":{"code":15503,"message":"Quantity is invalid."}}
                    '16001': InsufficientFunds, // {"error":{"code":16001,"message":"Insufficient funds."}}
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetGetInstruments (params);
        // {
        //     "result":[
        //     {
        //         "id":"KARTA-USDT",
        //         "displayName":"KARTA/USDT",
        //         "type":"spot",
        //         "base":"KARTA",
        //         "quote":"USDT",
        //         "minQty":0.01,
        //         "maxQty":10000000.0,
        //         "tickSize":0.01,
        //         "takerFee":0.0015,
        //         "makerFee":-0.0005,
        //         "feeCurrency":"acquired"
        //     },
        // }
        const markets = this.safeValue (response, 'result', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const minQuantity = this.safeNumber (market, 'minQty');
            const maxQuantity = this.safeNumber (market, 'maxQty');
            const makerFee = this.safeNumber (market, 'makerFee');
            const takerFee = this.safeNumber (market, 'takerFee');
            const type = this.safeString (market, 'type');
            const precision = {
                'amount': minQuantity,
                'price': undefined,
            };
            result.push ({
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'maker': makerFee,
                'taker': takerFee,
                'linear': undefined,
                'inverse': undefined,
                'settle': undefined,
                'settleId': undefined,
                'type': type,
                'spot': (type === 'spot'),
                'margin': undefined,
                'future': false,
                'swap': false,
                'option': false,
                'optionType': undefined,
                'strike': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'contract': false,
                'contractSize': undefined,
                'active': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minQuantity,
                        'max': maxQuantity,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrumentId': market['id'],
        };
        const response = await this.publicGetGetOrderBook (this.extend (request, params));
        //
        // {
        //     "result":{
        //     "bids":[
        //         [
        //             0.068377,
        //             1.3247,
        //         ],
        //     ],
        //     "asks":[
        //         [
        //             0.068531,
        //             0.2693,
        //         ]
        //     ],
        //     "time":1642973720071624
        //     }
        // }
        //
        const result = this.safeValue (response, 'result', []);
        const timestamp = this.safeIntegerProduct (result, 'time', 0.001);
        return this.parseOrderBook (result, symbol, timestamp);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrumentId': market['id'],
        };
        const response = await this.publicGetGetTicker (this.extend (request, params));
        //
        // {
        //     "result":
        //     {
        //     "lastTradeId":7219332,
        //     "price":0.068708,
        //     "qty":0.0046,
        //     "bidPrice":0.068663,
        //     "askPrice":0.068678,
        //     "bidQty":0.4254,
        //     "askQty":0.0506,
        //     "volumeUsd":315646.03,
        //     "volume":130.5272,
        //     "time":1642974178845710
        //     }
        // }
        //
        const ticker = this.safeValue (response, 'result', {});
        return this.parseTicker (ticker, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrumentId': market['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetGetLastTrades (this.extend (request, params));
        // {
        //     "result":{
        //     "data":[
        //         {
        //             "id":744918,
        //             "time":1594800000857010,
        //             "price":0.02594000,
        //             "qty":0.05800000,
        //             "side":"buy"
        //         }
        //     ],
        //     "next":false
        //     }
        // }
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        // fetchTrades
        //  {
        //      "id":"7466162",
        //      "time":"1644601530690620",
        //      "price":"0.99930000",
        //      "qty":"116.73700000",
        //      "side":"buy"
        //   }
        // fetchMyTrades
        // {
        //     "id":"7465756",
        //     "instrumentId":"USDC-USDT",
        //     "price":"0.99760000",
        //     "qty":"10.00000000",
        //     "orderId":"1432795030",
        //     "userSide":"sell",
        //     "fee":"0.0149640000000000",
        //     "feeAsset":"USDT",
        //     "timestamp":"1644598407866177"
        //  }
        const id = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'orderId');
        const marketId = this.safeString2 (trade, 'i', 'instrumentId');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const timestamp = this.safeIntegerProduct2 (trade, 'time', 'timestamp', 0.001);
        const datetime = this.iso8601 (timestamp);
        const side = this.safeString2 (trade, 'side', 'userSide');
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'qty');
        const fee = {
            'currency': this.safeString (trade, 'feeAsset'),
            'cost': this.safeString (trade, 'fee'),
        };
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        });
    }

    parseTicker (ticker, market = undefined) {
        //
        // {
        //     "lastTradeId":7219332,
        //     "price":0.068708,
        //     "qty":0.0046,
        //     "bidPrice":0.068663,
        //     "askPrice":0.068678,
        //     "bidQty":0.4254,
        //     "askQty":0.0506,
        //     "volumeUsd":315646.03,
        //     "volume":130.5272,
        //     "time":1642974178845710
        // }
        //
        const symbol = this.safeSymbol (undefined, market);
        const last = this.safeString (ticker, 'price');
        const open = this.safeString (ticker, 'openPrice');
        const high = this.safeString (ticker, 'highPrice');
        const low = this.safeString (ticker, 'lowPrice');
        const baseVolume = this.safeString (ticker, 'volume');
        const bid = this.safeString (ticker, 'bidPrice');
        const ask = this.safeString (ticker, 'askPrice');
        const timestamp = this.safeIntegerProduct (ticker, 'time', 0.001);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //  {
        //       "time":1642973286229265,
        //       "low":0.068584,
        //       "high":0.068584,
        //       "open":0.068584,
        //       "close":0.068584,
        //       "volume":0.0338
        //  },
        //
        return [
            this.safeIntegerProduct (ohlcv, 'time', 0.001),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrumentId': market['id'],
            'size': this.timeframes[timeframe],
        };
        const response = await this.publicGetGetCandles (this.extend (request, params));
        // {
        //     "result":{
        //     "data":[
        //         {
        //             "time":1642973286229265,
        //             "low":0.068584,
        //             "high":0.068584,
        //             "open":0.068584,
        //             "close":0.068584,
        //             "volume":0.0338
        //         },
        // }
        const resultResponse = this.safeValue (response, 'result', {});
        const data = this.safeValue (resultResponse, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseBalance (response) {
        const balanceKeys = Object.keys (response);
        const result = { };
        for (let i = 0; i < balanceKeys.length; i++) {
            const id = balanceKeys[i];
            const asset = response[id];
            const balance = this.safeValue (asset, 'balance');
            const code = this.safeCurrencyCode (id);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'blocked');
            account['total'] = this.safeString (balance, 'total');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetGetAccountSummary (params);
        //
        // {
        //     "result":{
        //        "assets":{
        //           "BTC":{
        //              "depositAddress":"",
        //              "balance":{
        //                 "available":"0.0",
        //                 "blocked":"0.0",
        //                 "total":"0.0"
        //              }
        //           },
        // }
        //
        const result = this.safeValue (response, 'result', {});
        const assets = this.safeValue (result, 'assets', {});
        return this.parseBalance (assets);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'orderId': parseInt (id),
        };
        const response = await this.privatePostCancelOrder (this.extend (request, params));
        // {
        //     "result": {
        //       "id": 234,
        //       "instrumentId": "ETH-BTC",
        //       "status": "cancelled",
        //       "type": "limit",
        //       "side": "sell",
        //       "qty": 0.02000123,
        //       "cumQty": 0.01595400,
        //       "price": 0.02595400,
        //       "timestamp": 1594800486782215
        //     }
        //   }
        return response;
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        const response = await this.privatePostCancelAllOrders (params);
        //
        // {
        //     "result": [
        //       234,
        //       456
        //     ]
        // }
        //
        return response;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = { };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrumentId'] = market['id'];
        }
        if (since !== undefined) {
            request['start'] = parseInt (since) * 1000;
        }
        if (limit !== undefined) {
            request['limit'] = parseInt (limit); // default max 200
        }
        const response = await this.privateGetGetOpenOrders (this.extend (request, params));
        //
        // {
        //     "result": {
        //       "data": [
        //         {
        //           "id": 234,
        //           "instrumentId": "ETH-BTC",
        //           "status": "open",
        //           "type": "limit",
        //           "side": "sell",
        //           "qty": 0.02000123,
        //           "cumQty": 0.01595400,
        //           "price": 0.02595400,
        //           "timestamp": 1594800486782215
        //         },
        //         ...
        //       ],
        //       "next": true
        //     }
        //   }
        //
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data');
        return this.parseOrders (data, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = { };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrumentId'] = market['id'];
        }
        if (since !== undefined) {
            request['start'] = parseInt (since) * 1000;
        }
        if (limit !== undefined) {
            request['limit'] = parseInt (limit); // default max 200
        }
        const response = await this.privateGetGetOrders (this.extend (request, params));
        //
        // {
        //     "result": {
        //       "data": [
        //         {
        //           "id": 234,
        //           "instrumentId": "ETH-BTC",
        //           "status": "filled",
        //           "type": "limit",
        //           "side": "sell",
        //           "qty": 0.02000123,
        //           "cumQty": 0.02000123,
        //           "price": 0.02595400,
        //           "timestamp": 1594800486782215
        //         },
        //         ...
        //       ],
        //       "next": true
        //     }
        //   }
        //
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data');
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetGetOrder (this.extend (request, params));
        // {
        //     "result":{
        //        "id":"1432857356",
        //        "instrumentId":"USDC-USDT",
        //        "status":"cancelled",
        //        "type":"limit",
        //        "side":"sell",
        //        "qty":"1.00000000",
        //        "cumQty":"0.00000000",
        //        "price":"100.00000000",
        //        "timestamp":"1644600263569962"
        //     }
        //  }
        const result = this.safeValue (response, 'result');
        return this.parseOrder (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        // {
        //     "id":"1432857828",
        //     "instrumentId":"USDC-USDT",
        //     "status":"open",
        //     "type":"limit",
        //     "side":"sell",
        //     "qty":"1.00000000",
        //     "cumQty":"0.00000000",
        //     "price":"100.00000000",
        //     "timestamp":"1644600280211136"
        //  }
        const created = this.safeIntegerProduct (order, 'timestamp', 0.001);
        const marketId = this.safeString (order, 'instrumentId');
        const symbol = this.safeSymbol (marketId, market);
        const amount = this.safeString (order, 'qty');
        const filled = this.safeString (order, 'cumQty');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const id = this.safeString (order, 'id');
        const price = this.safeString (order, 'price');
        const type = this.safeStringLower (order, 'type');
        const side = this.safeStringLower (order, 'side');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': created,
            'datetime': this.iso8601 (created),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': undefined,
            'fee': undefined,
            'average': undefined,
            'trades': [],
        }, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrumentId'] = market['id'];
        }
        if (since !== undefined) {
            request['start'] = parseInt (since) * 1000;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // max 200
        }
        const response = await this.privateGetGetTrades (this.extend (request, params));
        //
        // {
        //     "result": {
        //       "data": [
        //         {
        //           "id": 1,
        //           "instrumentId": "ETH-BTC",
        //           "price": 0.02595400,
        //           "qty": 0.02000123,
        //           "orderId": 234,
        //           "userSide": "sell",
        //           "fee": 0.00000001,
        //           "feeAsset": "BTC",
        //           "timestamp": 1594800486782215
        //         },
        //         ...
        //       ],
        //       "next": true
        //     }
        //   }
        //
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'data');
        return this.parseTrades (data, market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const orderId = parseInt (id);
        const request = {
            'orderId': orderId,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrumentId'] = market['id'];
        }
        if (since !== undefined) {
            request['start'] = parseInt (since) * 1000;
        }
        if (limit !== undefined) {
            request['limit'] = parseInt (limit); // default max 200
        }
        const response = await this.privateGetGetTradesByOrder (this.extend (request, params));
        // {
        //     "result": [
        //       {
        //         "id": 1,
        //         "instrumentId": "ETH-BTC",
        //         "price": 0.02595400,
        //         "qty": 0.02000123,
        //         "orderId": 234,
        //         "userSide": "sell",
        //         "fee": 0.00000001,
        //         "feeAsset": "BTC",
        //         "timestamp": 1594800486782215
        //       },
        //       ...
        //     ]
        // }
        const result = this.safeValue (response, 'result', []);
        return this.parseTrades (result, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (!((type === 'limit') || (type === 'market'))) {
            throw new ExchangeError (this.id + ' createOrder() supports limit and market orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrumentId': market['id'],
            'side': side,
            'qty': amount,
            'type': type,
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostPlaceOrder (this.extend (request, params));
        // {
        //     "result": {
        //       "orderId": 234
        //     }
        // }
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result, market);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'asset': currency['id'],
        };
        const response = await this.privateGetGetDepositAddress (this.extend (request, params));
        //
        // {
        //     "result": {
        //       "asset": "BTC",
        //       "address": "17ciVVLxLcdCUCMf9s4t5jTexACxwF55uc"
        // }
        //
        const data = this.safeValue (response, 'result', {});
        const address = this.safeString (data, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'network': undefined,
            'info': response,
        };
    }

    async fetchFundingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetGetFees (params);
        //
        // {
        //     "result": [
        //       {
        //         "asset": "BTC",
        //         "deposit": {
        //           "fixedFee": 0.000001,
        //           "percentFee": 0,
        //           "minAmount": 0.0001
        //         },
        //         "withdrawal": {
        //           "fixedFee": 0.000002,
        //           "percentFee": 0,
        //           "minAmount": 0.002
        //         }
        //       },
        //       ...
        //     ]
        //   }
        //
        const result = this.safeValue (response, 'result', []);
        const withdrawFees = {};
        const depositFees = {};
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const currencyId = this.safeString (entry, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const withdraw = this.safeValue (entry, 'withdrawal', {});
            withdrawFees[code] = this.safeNumber (withdraw, 'fixedFee');
            const deposit = this.safeValue (entry, 'deposit');
            depositFees[code] = this.safeNumber (deposit, 'fixedFee');
        }
        return {
            'info': response,
            'withdraw': withdrawFees,
            'deposit': depositFees,
        };
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = { };
        if (code !== undefined) {
            const currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = parseInt (limit); // default 20
        }
        const response = await this.privateGetGetWithdrawals (this.extend (request, params));
        //
        // {
        //     "result": {
        //       "data": [
        //         {
        //           "id": 234,
        //           "timestamp": 1594800486782215,
        //           "address": "17ciVVLxLcdCUCMf9s4t5jTexACxwF55uc",
        //           "asset": "BTC",
        //           "amount": 0.001,
        //           "fee": 0.000002,
        //           "transactionId": null,
        //           "status": "pending"
        //         },
        //         ...
        //       ],
        //       "next": true
        //     }
        //   }
        //
        const result = this.safeValue (response, 'result', {});
        const withdrawals = this.safeValue (result, 'data', []);
        return this.parseTransactions (withdrawals, code, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        headers = {};
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const accessToken = this.safeString (this.options, 'accessToken');
            headers = {
                'Authorization': 'Bearer ' + accessToken,
            };
        }
        if (method === 'POST') {
            headers['Content-Type'] = 'application/json';
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async signIn (params = {}) {
        this.checkRequiredCredentials ();
        const timestamp = this.microseconds ();
        const payload = timestamp + '.' + this.apiKey;
        const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256');
        const request = {
            'grantType': 'signature',
            'apiKey': this.apiKey,
            'timestamp': timestamp,
            'signature': signature,
        };
        const response = await this.publicPostGetToken (this.extend (request, params));
        //
        // {
        //     "result":{
        //        "accessToken":"eyJx6g",
        //        "refreshToken":"Gp5ZOwczv4XKspo0qMGNjYw=="
        //     }
        //  }
        //
        const result = this.safeString (response, 'result');
        const accessToken = this.safeString (result, 'accessToken');
        const refreshToken = this.safeString (result, 'refreshToken');
        this.options['accessToken'] = accessToken;
        this.options['refreshToken'] = refreshToken;
        return response;
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        //
        // {"error":{"code":10501,"message":"Request parameters have incorrect format."}}
        //
        if (response === undefined) {
            return;
        }
        const error = this.safeValue (response, 'error');
        if (error !== undefined) {
            const errorCode = this.safeString (error, 'code');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
