'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeNotAvailable, ExchangeError, DDoSProtection, BadSymbol, InvalidOrder, ArgumentsRequired } = require ('./base/errors');
//  ---------------------------------------------------------------------------

module.exports = class whitebit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'whitebit',
            'name': 'WhiteBit',
            'version': 'v2',
            'countries': [ 'EE' ],
            'rateLimit': 500,
            'has': {
                'cancelOrder': undefined,
                'CORS': undefined,
                'createDepositAddress': undefined,
                'createLimitOrder': undefined,
                'createMarketOrder': undefined,
                'createOrder': true,
                'deposit': undefined,
                'editOrder': undefined,
                'fetchBalance': true,
                'fetchBidsAsks': undefined,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchOrderTrades': true,
                'fetchOpenOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'privateAPI': true,
                'publicAPI': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/66732963-8eb7dd00-ee66-11e9-849b-10d9282bb9e0.jpg',
                'api': {
                    'web': 'https://whitebit.com/',
                    'v1': {
                        'public': 'https://whitebit.com/api/v1/public',
                        'private': 'https://whitebit.com/api/v1',
                    },
                    'v2': {
                        'public': 'https://whitebit.com/api/v2/public',
                    },
                    'v4': {
                        'public': 'https://whitebit.com/api/v4/public',
                        'private': 'https://whitebit.com/api/v4',
                    },
                },
                'www': 'https://www.whitebit.com',
                'doc': 'https://documenter.getpostman.com/view/7473075/Szzj8dgv?version=latest',
                'fees': 'https://whitebit.com/fee-schedule',
                'referral': 'https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963',
            },
            'api': {
                'web': {
                    'get': [
                        'v1/healthcheck',
                    ],
                },
                'v1': {
                    'public': {
                        'get': [
                            'markets',
                            'tickers',
                            'ticker',
                            'symbols',
                            'depth/result',
                            'history',
                            'kline',
                        ],
                    },
                    'private': {
                        'post': [
                            'account/balance',
                            'order/new',
                            'order/cancel',
                            'orders',
                            'account/order_history',
                            'account/executed_history',
                            'account/executed_history/all',
                            'account/order',
                        ],
                    },
                },
                'v2': {
                    'public': {
                        'get': [
                            'markets',
                            'ticker',
                            'assets',
                            'fee',
                            'depth/{market}',
                            'trades/{market}',
                        ],
                    },
                },
                'v4': {
                    'public': {
                        'get': [
                            'assets',
                            'ticker',
                            'trades/{market}',
                            'fee',
                            'assets',
                            'time',
                            'ping',
                        ],
                    },
                    'private': {
                        'post': [
                            'main-account/address',
                            'main-account/balance',
                            'main-account/create-new-address',
                            'main-account/codes',
                            'main-account/codes/apply',
                            'main-account/codes/my',
                            'main-account/codes/history',
                            'main-account/fiat-deposit-url',
                            'main-account/history',
                            'main-account/withdraw',
                            'main-account/withdraw-pay',
                            'trade-account/balance',
                            'trade-account/executed-history',
                            'trade-account/order',
                            'trade-account/order/history',
                            'order/new',
                            'order/market',
                            'order/stock_market',
                            'order/stop_limit',
                            'order/stop_market',
                            'order/cancel',
                            'orders',
                        ],
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.001'),
                    'maker': this.parseNumber ('0.001'),
                },
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'fetchTradesMethod': 'fetchTradesV1',
                'fiatCurrencies': [ 'EUR', 'USD', 'RUB', 'UAH' ],
            },
            'exceptions': {
                'exact': {
                    '503': ExchangeNotAvailable, // {"response":null,"status":503,"errors":{"message":[""]},"notification":null,"warning":null,"_token":null},
                    '422': InvalidOrder, // {"response":null,"status":422,"errors":{"orderId":["Finished order id 1295772653 not found on your account"]},"notification":null,"warning":"Finished order id 1295772653 not found on your account","_token":null}
                },
                'broad': {
                    'Market is not available': BadSymbol, // {"success":false,"message":{"market":["Market is not available"]},"result":[]}
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.v2PublicGetMarkets (params);
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result":[
        //             {
        //                 "name":"BTC_USD",
        //                 "moneyPrec":"2",
        //                 "stock":"BTC",
        //                 "money":"USD",
        //                 "stockPrec":"6",
        //                 "feePrec":"4",
        //                 "minAmount":"0.001",
        //                 "tradesEnabled":true,
        //                 "minTotal":"0.001"
        //             }
        //         ]
        //     }
        //
        const markets = this.safeValue (response, 'result');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'stock');
            const quoteId = this.safeString (market, 'money');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const active = this.safeValue (market, 'tradesEnabled');
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'type': 'spot',
                'spot': true,
                'active': active,
                'precision': {
                    'amount': this.safeInteger (market, 'stockPrec'),
                    'price': this.safeInteger (market, 'moneyPrec'),
                },
                'limits': {
                    'amount': {
                        'min': this.safeNumber (market, 'minAmount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minTotal'),
                        'max': undefined,
                    },
                },
            };
            result.push (entry);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.v2PublicGetAssets (params);
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result":{
        //             "BTC":{
        //                 "id":"4f37bc79-f612-4a63-9a81-d37f7f9ff622",
        //                 "lastUpdateTimestamp":"2019-10-12T04:40:05.000Z",
        //                 "name":"Bitcoin",
        //                 "canWithdraw":true,
        //                 "canDeposit":true,
        //                 "minWithdrawal":"0.001",
        //                 "maxWithdrawal":"0",
        //                 "makerFee":"0.1",
        //                 "takerFee":"0.1"
        //             }
        //         }
        //     }
        //
        const currencies = this.safeValue (response, 'result');
        const ids = Object.keys (currencies);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = currencies[id];
            // breaks down in Python due to utf8 encoding issues on the exchange side
            // const name = this.safeString (currency, 'name');
            const canDeposit = this.safeValue (currency, 'canDeposit', true);
            const canWithdraw = this.safeValue (currency, 'canWithdraw', true);
            const active = canDeposit && canWithdraw;
            const code = this.safeCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency, // the original payload
                'name': undefined, // see the comment above
                'active': active,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'minWithdrawal'),
                        'max': this.safeNumber (currency, 'maxWithdrawal'),
                    },
                },
            };
        }
        return result;
    }

    async fetchTradingFees (params = {}) {
        const response = await this.v2PublicGetFee (params);
        const fees = this.safeValue (response, 'result');
        return {
            'maker': this.safeNumber (fees, 'makerFee'),
            'taker': this.safeNumber (fees, 'takerFee'),
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.v1PublicGetTicker (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result": {
        //             "bid":"0.021979",
        //             "ask":"0.021996",
        //             "open":"0.02182",
        //             "high":"0.022039",
        //             "low":"0.02161",
        //             "last":"0.021987",
        //             "volume":"2810.267",
        //             "deal":"61.383565474",
        //             "change":"0.76",
        //         },
        //     }
        //
        const ticker = this.safeValue (response, 'result', {});
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         "bid":"0.021979",
        //         "ask":"0.021996",
        //         "open":"0.02182",
        //         "high":"0.022039",
        //         "low":"0.02161",
        //         "last":"0.021987",
        //         "volume":"2810.267",
        //         "deal":"61.383565474",
        //         "change":"0.76",
        //     }
        //
        // fetchTickers v1
        //
        //     {
        //         "at":1571022144,
        //         "ticker": {
        //             "bid":"0.022024",
        //             "ask":"0.022042",
        //             "low":"0.02161",
        //             "high":"0.022062",
        //             "last":"0.022036",
        //             "vol":"2813.503",
        //             "deal":"61.457279261",
        //             "change":"0.95"
        //         }
        //     }
        //
        const timestamp = this.safeTimestamp (ticker, 'at', this.milliseconds ());
        ticker = this.safeValue (ticker, 'ticker', ticker);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeNumber (ticker, 'last');
        const percentage = this.safeNumber (ticker, 'change');
        let change = undefined;
        if (percentage !== undefined) {
            change = this.numberToString (percentage * 0.01);
        }
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
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'volume'),
            'quoteVolume': this.safeNumber (ticker, 'deal'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.v1PublicGetTickers (params);
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result": {
        //             "ETH_BTC": {
        //                 "at":1571022144,
        //                 "ticker": {
        //                     "bid":"0.022024",
        //                     "ask":"0.022042",
        //                     "low":"0.02161",
        //                     "high":"0.022062",
        //                     "last":"0.022036",
        //                     "vol":"2813.503",
        //                     "deal":"61.457279261",
        //                     "change":"0.95"
        //                 }
        //             },
        //         },
        //     }
        //
        const data = this.safeValue (response, 'result');
        const marketIds = Object.keys (data);
        const result = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const ticker = this.parseTicker (data[marketId], market);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 50, maximum = 100
        }
        const response = await this.v2PublicGetDepthMarket (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result":{
        //             "lastUpdateTimestamp":"2019-10-14T03:15:47.000Z",
        //             "asks":[
        //                 ["0.02204","2.03"],
        //                 ["0.022041","2.492"],
        //                 ["0.022042","2.254"],
        //             ],
        //             "bids":[
        //                 ["0.022018","2.327"],
        //                 ["0.022017","1.336"],
        //                 ["0.022015","2.089"],
        //             ],
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const timestamp = this.parse8601 (this.safeString (result, 'lastUpdateTimestamp'));
        return this.parseOrderBook (result, symbol, timestamp);
    }

    async fetchTradesV1 (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'lastId': 1, // todo add since
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 50, maximum = 10000
        }
        const response = await this.v1PublicGetHistory (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result":[
        //             {
        //                 "id":11887426,
        //                 "type":"buy",
        //                 "time":1571023057.413769,
        //                 "amount":"0.171",
        //                 "price":"0.022052"
        //             }
        //         ],
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseTrades (result, market, since, limit);
    }

    async fetchTradesV2 (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 50, maximum = 10000
        }
        const response = await this.v2PublicGetTradesMarket (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result": [
        //             {
        //                 "tradeId":11903347,
        //                 "price":"0.022044",
        //                 "volume":"0.029",
        //                 "time":"2019-10-14T06:30:57.000Z",
        //                 "isBuyerMaker":false
        //             },
        //         ],
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseTrades (result, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const method = this.safeString (this.options, 'fetchTradesMethod', 'fetchTradesV2');
        return await this[method] (symbol, since, limit, params);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTradesV1
        //
        //     {
        //         "id":11887426,
        //         "type":"buy",
        //         "time":1571023057.413769,
        //         "amount":"0.171",
        //         "price":"0.022052"
        //     }
        //
        // fetchTradesV2
        //
        //     {
        //         "tradeId":11903347,
        //         "price":"0.022044",
        //         "volume":"0.029",
        //         "time":"2019-10-14T06:30:57.000Z",
        //         "isBuyerMaker":false
        //     }
        //
        // orderTrades (v4Private)
        //
        //     {
        //         "time": 1593342324.613711,
        //         "fee": "0.00000419198",
        //         "price": "0.00000701",
        //         "amount": "598",
        //         "id": 149156519, // trade id
        //         "dealOrderId": 3134995325, // orderId
        //         "clientOrderId": "customId11", // empty string if not specified
        //         "role": 2, // 1 = maker, 2 = taker
        //         "deal": "0.00419198" // amount in money
        //     }
        //
        let timestamp = this.safeTimestamp (trade, 'time');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (trade, 'time'));
        }
        const orderId = this.safeString (trade, 'dealOrderId');
        const cost = this.safeString (trade, 'deal');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString2 (trade, 'amount', 'volume');
        const id = this.safeString2 (trade, 'id', 'tradeId');
        let side = this.safeString (trade, 'type');
        if (side === undefined) {
            const isBuyerMaker = this.safeValue (trade, 'isBuyerMaker');
            if (side !== undefined) {
                side = isBuyerMaker ? 'buy' : 'sell';
            }
        }
        const symbol = this.safeSymbol (undefined, market);
        const role = this.safeInteger (trade, 'role');
        let takerOrMaker = undefined;
        if (role !== undefined) {
            takerOrMaker = (role === 1) ? 'maker' : 'taker';
        }
        let fee = undefined;
        const feeCost = this.safeString (trade, 'fee');
        if (feeCost !== undefined) {
            const safeMarket = this.safeMarket (undefined, market);
            const quote = safeMarket['quote'];
            fee = {
                'cost': feeCost,
                'currency': quote,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, market);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            const maxLimit = 1440;
            if (limit === undefined) {
                limit = maxLimit;
            }
            limit = Math.min (limit, maxLimit);
            const start = parseInt (since / 1000);
            const duration = this.parseTimeframe (timeframe);
            const end = this.sum (start, duration * limit);
            request['start'] = start;
            request['end'] = end;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // max 1440
        }
        const response = await this.v1PublicGetKline (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "message":"",
        //         "result":[
        //             [1591488000,"0.025025","0.025025","0.025029","0.025023","6.181","0.154686629"],
        //             [1591488060,"0.025028","0.025033","0.025035","0.025026","8.067","0.201921167"],
        //             [1591488120,"0.025034","0.02505","0.02505","0.025034","20.089","0.503114696"],
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1591488000,
        //         "0.025025",
        //         "0.025025",
        //         "0.025029",
        //         "0.025023",
        //         "6.181",
        //         "0.154686629"
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 0), // timestamp
            this.safeNumber (ohlcv, 1), // open
            this.safeNumber (ohlcv, 3), // high
            this.safeNumber (ohlcv, 4), // low
            this.safeNumber (ohlcv, 2), // close
            this.safeNumber (ohlcv, 5), // volume
        ];
    }

    async fetchStatus (params = {}) {
        const response = await this.webGetV1Healthcheck (params);
        const status = this.safeInteger (response, 'status');
        let formattedStatus = 'ok';
        if (status === 503) {
            formattedStatus = 'maintenance';
        }
        this.status = this.extend (this.status, {
            'status': formattedStatus,
            'updated': this.milliseconds (),
        });
        return this.status;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let method = undefined;
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side,
            'amount': this.amountToPrecision (symbol, amount),
        };
        const stopPrice = this.safeNumber2 (params, 'stopPrice', 'activationPrice');
        if (stopPrice !== undefined) {
            // it's a stop order
            request['activation_price'] = this.priceToPrecision (symbol, stopPrice);
            if (type === 'limit' || type === 'stopLimit') {
                // it's a stop-limit-order
                method = 'v4PrivateOPostOrderStopLimit';
            } else if (type === 'market' || type === 'stopMarket') {
                // it's a stop-market-order
                method = 'v4PrivatePostOrderStopMarket';
            }
        } else {
            if (type === 'market') {
                // it's a regular market order
                method = 'v4PrivatePostOrderMarket';
            }
            if (type === 'limit') {
                // it's a regular limit order
                method = 'v4PrivatePostOrderNew';
            }
        }
        // aggregate common assignments regardless stop or not
        if (type === 'limit' || type === 'stopLimit') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder requires a price argument for a stopLimit order');
            }
            const convertedPrice = this.priceToPrecision (symbol, price);
            request['price'] = convertedPrice;
        }
        if (type === 'market' || type === 'stopMarket') {
            if (side === 'buy') {
                let cost = this.safeNumber (params, 'cost');
                const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
                if (createMarketBuyOrderRequiresPrice) {
                    if (price !== undefined) {
                        if (cost === undefined) {
                            cost = amount * price;
                        }
                    } else if (cost === undefined) {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument for market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'amount' argument or in the 'cost' extra parameter (the exchange-specific behaviour)");
                    }
                } else {
                    cost = (cost === undefined) ? amount : cost;
                }
                request['amount'] = this.costToPrecision (symbol, cost);
            }
        }
        if (method === undefined) {
            throw new ArgumentsRequired (this.id + 'Invalid type:  createOrder() requires one of the following order types: market, limit, stopLimit or stopMarket');
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'orderId': parseInt (id),
        };
        return await this.v4PrivatePostOrderCancel (this.extend (request, params));
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.v4PrivatePostTradeAccountBalance (params);
        //
        //     {
        //         "BTC": { "available": "0.123", "freeze": "1" },
        //         "XMR": { "available": "3013", "freeze": "100" },
        //     }
        //
        const balanceKeys = Object.keys (response);
        const result = { };
        for (let i = 0; i < balanceKeys.length; i++) {
            const id = balanceKeys[i];
            const balance = response[id];
            const code = this.safeCurrencyCode (id);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'freeze');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 50 max 100
        }
        const response = await this.v4PrivatePostOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "orderId": 3686033640,            // unexecuted order ID
        //             "clientOrderId": "customId11",    // custom order id; "clientOrderId": "" - if not specified.
        //             "market": "BTC_USDT",             // currency market
        //             "side": "buy",                    // order side
        //             "type": "limit",                  // unexecuted order type
        //             "timestamp": 1594605801.49815,    // current timestamp of unexecuted order
        //             "dealMoney": "0",                 // executed amount in money
        //             "dealStock": "0",                 // executed amount in stock
        //             "amount": "2.241379",             // active order amount
        //             "takerFee": "0.001",              // taker fee ratio. If the number less than 0.0001 - it will be rounded to zero
        //             "makerFee": "0.001",              // maker fee ratio. If the number less than 0.0001 - it will be rounded to zero
        //             "left": "2.241379",               // unexecuted amount in stock
        //             "dealFee": "0",                   // executed fee by deal
        //             "price": "40000"                  // unexecuted order price
        //         },
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50 max 100
        }
        const response = await this.v4PrivatePostTradeAccountOrderHistory (this.extend (request, params));
        //
        //     {
        //         "BTC_USDT": [
        //             {
        //                 "id": 160305483,
        //                 "clientOrderId": "customId11", // empty string if not specified
        //                 "time": 1594667731.724403,
        //                 "side": "sell",
        //                 "role": 2, // 1 = maker, 2 = taker
        //                 "amount": "0.000076",
        //                 "price": "9264.21",
        //                 "deal": "0.70407996",
        //                 "fee": "0.00070407996"
        //             },
        //         ],
        //     }
        //
        // flattening orders and injecting the market
        const keys = Object.keys (response);
        const closedOrdersParsed = [];
        for (let i = 0; i < keys.length; i++) {
            const marketKey = keys[i];
            const orders = response[marketKey];
            for (let j = 0; j < orders.length; j++) {
                const order = orders[j];
                order['market'] = marketKey;
                closedOrdersParsed.push (order);
            }
        }
        return this.parseOrders (closedOrdersParsed, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder, fetchOpenOrders
        //
        //     {
        //         "orderId": 4180284841,             // order id
        //         "clientOrderId": "order1987111",   // empty string if not specified.
        //         "market": "BTC_USDT",              // deal market
        //         "side": "buy",                     // order side
        //         "type": "stop limit",              // order type
        //         "timestamp": 1595792396.165973,    // current timestamp
        //         "dealMoney": "0",                  // if order finished - amount in money currency that finished
        //         "dealStock": "0",                  // if order finished - amount in stock currency that finished
        //         "amount": "0.001",                 // amount
        //         "takerFee": "0.001",               // rounded to zero if less than 0.0001
        //         "makerFee": "0.001",               // rounded to zero if less than 0.0001
        //         "left": "0.001",                   // remaining amount
        //         "dealFee": "0",                    // fee in money that you pay if order is finished
        //         "price": "40000",                  // price
        //         "activation_price": "40000"        // activation price -> only for stopLimit, stopMarket
        //     }
        //
        // fetchClosedOrders
        //
        //     {
        //         "market": "BTC_USDT"              // artificial field
        //         "amount": "0.0009",               // amount of trade
        //         "price": "40000",                 // price
        //         "type": "limit",                  // order type
        //         "id": 4986126152,                 // order id
        //         "clientOrderId": "customId11",    // empty string if not specified.
        //         "side": "sell",                   // order side
        //         "ctime": 1597486960.311311,       // timestamp of order creation
        //         "takerFee": "0.001",              // rounded to zero if less than 0.0001
        //         "ftime": 1597486960.311332,       // executed order timestamp
        //         "makerFee": "0.001",              // rounded to zero if less than 0.0001
        //         "dealFee": "0.041258268",         // paid fee if order is finished
        //         "dealStock": "0.0009",            // amount in stock currency that finished
        //         "dealMoney": "41.258268"          // amount in money currency that finished
        //     }
        //
        const marketId = this.safeString (order, 'market');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        const side = this.safeString (order, 'side');
        const filled = this.safeString (order, 'dealStock');
        const amount = this.safeString (order, 'amount');
        const remaining = this.safeString (order, 'left');
        let clientOrderId = this.safeString (order, 'clientOrderId');
        if (clientOrderId === '') {
            clientOrderId = undefined;
        }
        const price = this.safeString (order, 'price');
        const stopPrice = this.safeString (order, 'activation_price');
        const orderId = this.safeString2 (order, 'orderId', 'id');
        const type = this.safeString (order, 'type');
        const dealFee = this.safeString (order, 'dealFee');
        let fee = undefined;
        if (dealFee !== undefined) {
            let feeCurrencyCode = undefined;
            if (market !== undefined) {
                feeCurrencyCode = market['quote'];
            }
            fee = {
                'cost': this.parseNumber (dealFee),
                'currency': feeCurrencyCode,
            };
        }
        const timestamp = this.safeTimestamp2 (order, 'ctime', 'timestamp');
        const lastTradeTimestamp = this.safeTimestamp (order, 'ftime');
        return this.safeOrder2 ({
            'info': order,
            'id': orderId,
            'symbol': symbol,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'timeInForce': undefined,
            'postOnly': undefined,
            'status': undefined,
            'side': side,
            'price': price,
            'type': type,
            'stopPrice': stopPrice,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'average': undefined,
            'cost': undefined,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': parseInt (id),
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 100
        }
        const response = await this.v4PrivatePostTradeAccountOrder (this.extend (request, params));
        //
        //     {
        //         "records": [
        //             {
        //                 "time": 1593342324.613711,
        //                 "fee": "0.00000419198",
        //                 "price": "0.00000701",
        //                 "amount": "598",
        //                 "id": 149156519, // trade id
        //                 "dealOrderId": 3134995325, // orderId
        //                 "clientOrderId": "customId11", // empty string if not specified
        //                 "role": 2, // 1 = maker, 2 = taker
        //                 "deal": "0.00419198"
        //             }
        //         ],
        //         "offset": 0,
        //         "limit": 100
        //     }
        //
        const data = this.safeValue (response, 'records', []);
        return this.parseTrades (data, market);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'ticker': currency['id'],
        };
        let method = 'v4PrivatePostMainAccountAddress';
        if (this.isFiat (code)) {
            method = 'v4PrivatePostMainAccountFiatDepositUrl';
            const provider = this.safeNumber (params, 'provider');
            if (provider === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires a provider when the ticker is fiat');
            }
            request['provider'] = provider;
            const amount = this.safeNumber (params, 'amount');
            if (amount === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires an amount when the ticker is fiat');
            }
            request['amount'] = amount;
            const uniqueId = this.safeValue (params, 'uniqueId');
            if (uniqueId === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires an uniqueId when the ticker is fiat');
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // fiat
        //
        //     {
        //         "url": "https://someaddress.com" // address for depositing
        //     }
        //
        // crypto
        //
        //     {
        //         "account": {
        //             "address": "GDTSOI56XNVAKJNJBLJGRNZIVOCIZJRBIDKTWSCYEYNFAZEMBLN75RMN", // deposit address
        //             "memo": "48565488244493" // memo if currency requires memo
        //         },
        //         "required": {
        //             "fixedFee": "0", // fixed deposit fee
        //             "flexFee": { // flexible fee - is fee that use percent rate
        //                 "maxFee": "0", // maximum fixed fee that you will pay
        //                 "minFee": "0", // minimum fixed fee that you will pay
        //                 "percent": "0" // percent of deposit that you will pay
        //             },
        //             "maxAmount": "0", // max amount of deposit that can be accepted by exchange - if you deposit more than that number, it won't be accepted by exchange
        //             "minAmount": "1" // min amount of deposit that can be accepted by exchange - if you will deposit less than that number, it won't be accepted by exchange
        //         }
        //     }
        //
        const url = this.safeString (response, 'url');
        const account = this.safeValue (response, 'account', {});
        const address = this.safeString (account, 'address', url);
        const tag = this.safeString (account, 'memo');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code); // check if it has canDeposit
        const request = {
            'ticker': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
            'address': address,
        };
        let uniqueId = this.safeValue (params, 'uniqueId');
        if (uniqueId === undefined) {
            uniqueId = this.uuid22 ();
        }
        request['uniqueId'] = uniqueId;
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        if (this.isFiat (code)) {
            const provider = this.safeValue (params, 'provider');
            if (provider === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires a provider when the ticker is fiat');
            }
            request['provider'] = provider;
        }
        const response = await this.v4PrivatePostMainAccountWithdraw (this.extend (request, params));
        //
        // empty array with a success status
        // go to deposit/withdraw history and check you request status by uniqueId
        //
        //     []
        //
        return {
            'id': uniqueId,
            'info': response,
        };
    }

    isFiat (currency) {
        const fiatCurrencies = this.safeValue (this.options, 'fiatCurrencies', []);
        return this.inArray (currency, fiatCurrencies);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        const version = this.safeValue (api, 0);
        const accessibility = this.safeValue (api, 1);
        const pathWithParams = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][version][accessibility] + pathWithParams;
        if (accessibility === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (accessibility === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const secret = this.stringToBinary (this.secret);
            const request = '/' + 'api' + '/' + version + pathWithParams;
            body = this.json (this.extend ({ 'request': request, 'nonce': nonce }, params));
            const payload = this.stringToBase64 (body);
            const signature = this.hmac (payload, secret, 'sha512');
            headers = {
                'Content-Type': 'application/json',
                'X-TXC-APIKEY': this.apiKey,
                'X-TXC-PAYLOAD': payload,
                'X-TXC-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if ((code === 418) || (code === 429)) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        if (code === 404) {
            throw new ExchangeError (this.id + ' ' + code.toString () + ' endpoint not found');
        }
        if (response !== undefined) {
            const status = this.safeValue (response, 'status');
            if ((status !== undefined && status !== '200')) {
                const feedback = this.id + ' ' + body;
                const status = this.safeString (response, 'status');
                if (typeof status === 'string') {
                    this.throwExactlyMatchedException (this.exceptions['exact'], status, feedback);
                }
                this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
