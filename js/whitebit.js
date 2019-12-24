'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, DDoSProtection, ExchangeError, InsufficientFunds, InvalidOrder, OrderNotFound, BadSymbol, ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class whitebit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'whitebit',
            'name': 'WhiteBit',
            'version': 'v2',
            'countries': [ 'EE' ],
            'rateLimit': 1000,
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createDepositAddress': false,
                'createLimitOrder': true,
                'createMarketOrder': false,
                'createOrder': true,
                'deposit': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'privateAPI': true,
                'publicAPI': true,
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
                    'web': 'https://whitebit.com',
                    'publicV2': 'https://whitebit.com/api/v2/public',
                    'publicV1': 'https://whitebit.com/api/v1/public',
                    'privateV1': 'https://whitebit.com/api/v1',
                },
                'www': 'https://www.whitebit.com',
                'doc': 'https://documenter.getpostman.com/view/7473075/SVSPomwS?version=latest#intro',
                'fees': 'https://whitebit.com/fee-schedule',
                'referral': 'https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963',
            },
            'api': {
                'web': {
                    'get': [
                        'v1/healthcheck',
                    ],
                },
                'publicV1': {
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
                'publicV2': {
                    'get': [
                        'markets',
                        'ticker',
                        'assets',
                        'fee',
                        'depth/{market}',
                        'trades/{market}',
                    ],
                },
                'privateV1': {
                    'post': [
                        'order/new',
                        'order/cancel',
                        'orders',
                        'account/balances',
                        'account/order',
                        'account/order_history',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                },
            },
            'exceptions': {
                'Market is not available': BadSymbol, // {"success":false,"message":{"market":["Market is not available"]},"result":[]}
                'balance not enough': InsufficientFunds,
                'amount is less than': InvalidOrder,
                'Total is less than': InvalidOrder,
                'validation.total': InvalidOrder,
                'Too many requests.': DDoSProtection,
                'This action is unauthorized.': AuthenticationError,
                'order not found': OrderNotFound,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicV2GetMarkets (params);
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
                'active': active,
                'precision': {
                    'amount': this.safeInteger (market, 'stockPrec'),
                    'price': this.safeInteger (market, 'moneyPrec'),
                },
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minAmount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeFloat (market, 'minTotal'),
                        'max': undefined,
                    },
                },
            };
            result.push (entry);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicV2GetAssets (params);
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
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minWithdrawal'),
                        'max': this.safeFloat (currency, 'maxWithdrawal'),
                    },
                },
            };
        }
        return result;
    }

    async fetchTradingFees (params = {}) {
        const response = await this.publicV2GetFee (params);
        const fees = this.safeValue (response, 'result');
        return {
            'maker': this.safeFloat (fees, 'makerFee'),
            'taker': this.safeFloat (fees, 'takerFee'),
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicV1GetTicker (this.extend (request, params));
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
        const last = this.safeFloat (ticker, 'last');
        const percentage = this.safeFloat (ticker, 'change');
        let change = undefined;
        if (percentage !== undefined) {
            change = this.numberToString (percentage * 0.01);
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'deal'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicV1GetTickers (params);
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
            let market = undefined;
            let symbol = marketId;
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
            const ticker = this.parseTicker (data[marketId], market);
            result[symbol] = this.extend (ticker, { 'symbol': symbol });
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
        const response = await this.publicV2GetDepthMarket (this.extend (request, params));
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
        return this.parseOrderBook (result, timestamp);
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
        const response = await this.publicV1GetHistory (this.extend (request, params));
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
        const response = await this.publicV2GetTradesMarket (this.extend (request, params));
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
        return await this.fetchTradesV1 (symbol, since, limit, params);
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
        let timestamp = this.safeValue (trade, 'time');
        if (typeof timestamp === 'string') {
            timestamp = this.parse8601 (timestamp);
        } else {
            timestamp = parseInt (timestamp * 1000);
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat2 (trade, 'amount', 'volume');
        const id = this.safeString2 (trade, 'id', 'tradeId');
        let side = this.safeString (trade, 'type');
        if (side === undefined) {
            const isBuyerMaker = this.safeValue (trade, 'isBuyerMaker');
            side = isBuyerMaker ? 'buy' : 'sell';
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let cost = undefined;
        if (amount !== undefined && price !== undefined) {
            cost = amount * price;
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default == max == 500
        }
        const response = await this.publicV1GetKline (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000, // timestamp
            parseFloat (ohlcv[1]), // open
            parseFloat (ohlcv[3]), // high
            parseFloat (ohlcv[4]), // low
            parseFloat (ohlcv[2]), // close
            parseFloat (ohlcv[5]), // volume
        ];
    }

    async fetchBalance (params = {}) {
        // {
        //     "success": true,
        //     "message": "",
        //     "result": {
        //         "BTC": {
        //             "available": "0",
        //             "freeze": "0"
        //         }
        //     }
        // }
        await this.loadMarkets ();
        const response = await this.privateV1PostAccountBalances (params);
        const balances = this.safeValue (response, 'result');
        const currencies = Object.keys (balances);
        const parsedBalances = {};
        for (let currencyIndex = 0; currencyIndex < currencies.length; currencyIndex++) {
            const currency = currencies[currencyIndex];
            const balance = balances[currency];
            parsedBalances[currency] = {
                'free': this.safeFloat (balance, 'available'),
                'used': this.safeFloat (balance, 'freeze'),
            };
        }
        parsedBalances['info'] = balances;
        return this.parseBalance (parsedBalances);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // {
        //     "success": true,
        //     "message": "",
        //     "result": {
        //         "limit": 100,
        //         "offset": 0,
        //         "total": 1,
        //         "records": [
        //             {
        //                 "id": 3900714,
        //                 "left": "1",
        //                 "market": "ETH_BTC",
        //                 "amount": "1",
        //                 "type": "limit",
        //                 "price": "0.008",
        //                 "timestamp": 1546459568.376407,
        //                 "side": "buy",
        //                 "dealFee": "0",
        //                 "takerFee": "0.001",
        //                 "makerFee": "0.001",
        //                 "dealStock": "0",
        //                 "dealMoney": "0"
        //             }
        //         ]
        //     }
        // }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            symbol['limit'] = limit;
        }
        if (since !== undefined) {
            symbol['since'] = limit;
        }
        const response = await this.privateV1PostOrders (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        const orders = this.safeValue (result, 'records');
        return this.parseOrders (orders, market, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // {
        //     "success": true,
        //     "message": "",
        //     "result": {
        //         "ETH_BTC": [
        //             {
        //                 "amount": "1",
        //                 "price": "0.01",
        //                 "type": "limit",
        //                 "id": 9740,
        //                 "side": "sell",
        //                 "ctime": 1533568890.583023,
        //                 "takerFee": "0.002",
        //                 "ftime": 1533630652.62185,
        //                 "market": "ETH_BTC",
        //                 "makerFee": "0.002",
        //                 "dealFee": "0.002",
        //                 "dealStock": "1",
        //                 "dealMoney": "0.01",
        //                 "marketName": "ETH_BTC"
        //             }
        //         ]
        //     }
        // }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const response = await this.privateV1PostAccountOrderHistory (params);
        const result = this.safeValue (response, 'result');
        if (Array.isArray (result)) {
            // User has no closed orders yet.
            return [];
        }
        const market = this.market (symbol);
        const orders = this.safeValue (result, market['id'], []);
        return this.parseOrders (orders, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        let id = undefined;
        if ('id' in order) {
            id = this.safeString (order, 'id');
        } else if ('orderId' in order) {
            id = this.safeString (order, 'orderId');
        }
        let timestamp = undefined;
        if ('timestamp' in order) {
            timestamp = this.safeTimestamp (order, 'timestamp');
        } else if ('ctime' in order) {
            timestamp = this.safeTimestamp (order, 'ctime');
        }
        const datetime = this.iso8601 (timestamp);
        const lastTradeTimestamp = this.safeTimestamp (order, 'ftime');
        const marketId = this.safeString (order, 'market');
        let orderMarket = undefined;
        let symbol = undefined;
        let currency = undefined;
        if (marketId in this.markets_by_id) {
            orderMarket = this.markets_by_id[marketId];
            symbol = orderMarket['symbol'];
            currency = orderMarket['quote'];
        }
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const amount = this.safeFloat (order, 'amount');
        const remaining = this.safeFloat (order, 'left');
        let status = undefined;
        let filled = undefined;
        if (remaining === undefined || remaining === 0.0) {
            status = 'closed';
            filled = amount;
        } else {
            status = 'open';
            filled = amount - remaining;
        }
        let price = this.safeFloat (order, 'price');
        const cost = this.safeFloat (order, 'dealMoney');
        if (price === 0.0) {
            if ((cost !== undefined) && (filled !== undefined)) {
                if ((cost > 0) && (filled > 0)) {
                    price = cost / filled;
                }
            }
        }
        const fee = {
            'currency': currency,
            'cost': this.safeFloat (order, 'dealFee'),
        };
        return {
            'id': id,
            'datetime': datetime,
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': undefined,
            'fee': fee,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        // {
        //     "success": true,
        //     "message": "",
        //     "result": {
        //         "orderId": 25749,
        //         "market": "ETH_BTC",
        //         "price": "0.1",
        //         "side": "sell",
        //         "type": "limit",
        //         "timestamp": 1537535284.828868,
        //         "dealMoney": "0",
        //         "dealStock": "0",
        //         "amount": "0.1",
        //         "takerFee": "0.002",
        //         "makerFee": "0.002",
        //         "left": "0.1",
        //         "dealFee": "0"
        //     }
        // }
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side,
            'price': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
        };
        const response = await this.privateV1PostOrderNew (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        return this.parseOrder (result, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        // {
        //     "success": true,
        //     "message": "",
        //     "result": {
        //         "orderId": 25749,
        //         "market": "ETH_BTC",
        //         "price": "0.1",
        //         "side": "sell",
        //         "type": "limit",
        //         "timestamp": 1537535284.828868,
        //         "dealMoney": "0",
        //         "dealStock": "0",
        //         "amount": "0.1",
        //         "takerFee": "0.002",
        //         "makerFee": "0.002",
        //         "left": "0.1",
        //         "dealFee": "0"
        //     }
        // }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'orderId': parseInt (id),
        };
        const response = await this.privateV1PostOrderCancel (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        return this.parseOrder (result, market);
    }

    sign (path, api = 'publicV1', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        if (api === 'publicV1' || api === 'publicV2') {
            const queryKeysArray = Object.keys (query);
            const queryKeysArrayLength = queryKeysArray.length;
            if (queryKeysArrayLength > 0) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'privateV1') {
            this.checkRequiredCredentials ();
            const request = '/api/v1/' + this.implodeParams (path, params);
            const nonce = this.nonce ().toString ();
            query = this.extend ({
                'nonce': nonce,
                'request': request,
            }, query);
            body = this.json (query, { 'jsonUnescapedSlashes': true });
            query = this.encode (body);
            const payload = this.stringToBase64 (query);
            const secret = this.encode (this.secret);
            const signature = this.hmac (payload, secret, 'sha512');
            headers = {
                'Content-type': 'application/json',
                'X-TXC-APIKEY': this.apiKey,
                'X-TXC-PAYLOAD': this.decode (payload),
                'X-TXC-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code !== 200) {
            const feedback = "\n" + 'id: ' + this.id + "\n" + 'url: ' + url + "\n" + 'request body: ' + requestBody + "\n" + 'code: ' + code + "\n" + 'body:' + "\n" + body; // eslint-disable-line quotes
            this.throwExactlyMatchedException (this.httpExceptions, code.toString (), feedback);
        }
        if (response !== undefined) {
            const success = this.safeValue (response, 'success');
            if (!success) {
                const messages = this.json (this.safeValue (response, 'message'));
                const feedback = "\n" + 'id: ' + this.id + "\n" + 'url: ' + url + "\n" + 'request body: ' + requestBody + "\n" + 'Error: ' + messages + "\n" + 'body:' + "\n" + body; // eslint-disable-line quotes
                this.throwBroadlyMatchedException (this.exceptions, messages, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
