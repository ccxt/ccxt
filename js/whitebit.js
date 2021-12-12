'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeNotAvailable, ExchangeError, DDoSProtection, BadSymbol, InvalidOrder, ArgumentsRequired } = require ('./base/errors');
const Precise = require ('./base/Precise');
const { secret, key } = require ('./api_keys');
//  ---------------------------------------------------------------------------

module.exports = class whitebit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'apiKey': key,
            'secret': secret,
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
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchStatus': true,
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
                    'privateV4': 'https://whitebit.com/api/v4',
                    'publicV2': 'https://whitebit.com/api/v2/public',
                    'publicV1': 'https://whitebit.com/api/v1/public',
                    'publicV4': 'https://whitebit.com/api/v4/public',
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
                'publicV4': {
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
                'privateV1': {
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
                'privateV4': {
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
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.001'),
                    'maker': this.parseNumber ('0.001'),
                },
            },
            'options': {
                'fetchTradesMethod': 'fetchTradesV1',
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
        const response = await this.publicV2GetFee (params);
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
        let timestamp = this.safeValue (trade, 'time');
        if (typeof timestamp === 'string') {
            timestamp = this.parse8601 (timestamp);
        } else {
            timestamp = parseInt (timestamp * 1000);
        }
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString2 (trade, 'amount', 'volume');
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
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
        const response = await this.publicV1GetKline (this.extend (request, params));
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
        // types: market, stockMarket, limit, stopLimit, stopMarket
        let method = undefined;
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side,
            'amount': parseFloat (this.amountToPrecision (symbol, amount)),
        };
        function getActivationPrice () {
            const activationPrice = this.safeNumber2 (params, 'stopPrice', 'activationPrice');
            if (activationPrice === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a activationPrice or stopPrice parameter for the ' + type + ' order type');
            }
            return activationPrice;
        }
        if (type === 'market') {
            // this is not conventional
            // for this order type, the amount in the stock currency to buy/sell
            // example: amount = 50 in 'BTC-USDT' means
            // I want to buy BTC for 50 USDT
            method = 'privateV4OrderMarket';
        }
        if (type === 'stockMarket') {
            // this is the standard "market" order
            method = 'privateV4OrderStockMarket';
        }
        if (type === 'limit') {
            method = 'privateV4OrderNew';
            request['price'] = parseFloat (this.priceToPrecision (symbol, price));
        }
        if (type === 'stoplimit') {
            method = 'privateV4OrderStopLimit';
            request['price'] = parseFloat (this.priceToPrecision (symbol, price));
            const activationPrice = getActivationPrice ();
            request['activation_price'] = this.priceToPrecision (symbol, activationPrice);
        }
        if (type === 'stopMarket') {
            // the same as above but for limit orders
            // the amount is in stock currency to buy/sell
            method = 'privateV4OrderStopMarket';
            const activationPrice = getActivationPrice ();
            request['activation_price'] = this.priceToPrecision (symbol, activationPrice);
        }
        if (method === undefined) {
            throw new ArgumentsRequired (this.id + 'Invalid type:  createOrder() requires one of the following order types: market, stockMarket, limit, stopLimit or stopMarket');
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'orderId': id,
        };
        return await this.privateV4PostOrderCancel (this.extend (request, params));
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateV4PostTradeAccountBalance (params);
        //
        // Response
        // {
        //     "...": {...},
        //     "BTC": {
        //         "available": "0.123",      // Available balance of currency for trading
        //         "freeze": "1"              // Balance of currency that is currently in active orders
        //     },
        //     "...": {...},
        //     "XMR": {
        //         "available": "3013",
        //         "freeze": "100"
        //     },
        //     "...": {...}
        // }
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

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'ticker': currency['id'],
        };
        let method = 'privateV4PostMainAccountAddress';
        if (this.isFiat (code)) {
            method = 'privateV4PostMainAccountFiatDepositUrl';
            const provider = this.safeNumber2 (params, 'provider');
            if (provider === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires a provider when the ticker is fiat');
            }
            request['provider'] = provider;
            const amount = this.safeNumber2 (params, 'amount');
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
        // Response for fiat
        // {
        //     "url": "https://someaddress.com"                  // address for deposit
        // }
        // Response for crypo
        // {
        //     "account": {
        //         "address": "GDTSOI56XNVAKJNJBLJGRNZIVOCIZJRBIDKTWSCYEYNFAZEMBLN75RMN",        // deposit address
        //         "memo": "48565488244493"                                                      // memo if currency requires memo
        //     },
        //     "required": {
        //         "fixedFee": "0",                                                              // fixed deposit fee
        //         "flexFee": {                                                                  // flexible fee - is fee that use percent rate
        //             "maxFee": "0",                                                            // maximum fixed fee that you will pay
        //             "minFee": "0",                                                            // minimum fixed fee that you will pay
        //             "percent": "0"                                                            // percent of deposit that you will pay
        //         },
        //         "maxAmount": "0",                                                             // max amount of deposit that can be accepted by exchange - if you deposit more than that number, it won't be accepted by exchange
        //         "minAmount": "1"                                                              // min amount of deposit that can be accepted by exchange - if you will deposit less than that number, it won't be accepted by exchange
        //     }
        // }
        let memo = undefined;
        let address = this.safeValue (response, 'url');
        if (address === undefined) {
            const addressField = this.safeValue (response, 'account');
            address = this.safeValue (addressField, 'address');
            memo = this.safeValue (addressField, 'memo');
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': memo,
            'network': this.safeValue (params, 'network'),
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code); // check if it has canDeposit
        const request = {
            'ticker': currency['id'],
            'amount': amount,
            'address': address,
        };
        const uniqueId = this.safeValue (params, 'uniqueId');
        if (uniqueId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires an uniqueId');
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
        const response = await this.privateV4PostMainAccountWithdraw (this.extend (request, params));
        //
        // [
        //   empty array - has success status - go to deposit/withdraw history and check you request status by uniqueId
        // ]
        //
        return {
            'id': uniqueId,
            'info': response,
        };
    }

    parseOrder (order, market = undefined) {
        // For fetched orders
        // {
        //       "time": 1593342324.613711,      // Timestamp of executed order
        //       "fee": "0.00000419198",         // fee that you pay
        //       "price": "0.00000701",          // price
        //       "amount": "598",                // amount in stock
        //       "id": 149156519,                // trade id
        //       "dealOrderId": 3134995325,      // completed order Id
        //       "clientOrderId": "customId11",  // custom order id; "clientOrderId": "" - if not specified.
        //       "role": 2,                      // Role - 1 - maker, 2 - taker
        //       "side": 'buy
        //       "deal": "0.00419198"            // amount in money
        //   }
        //
        // }
        // For created orders
        // {
        //     "orderId": 4180284841,             // order id
        //     "clientOrderId": "order1987111",   // custom client order id; "clientOrderId": "" - if not specified.
        //     "market": "BTC_USDT",              // deal market
        //     "side": "buy",                     // order side
        //     "type": "stop limit",              // order type
        //     "timestamp": 1595792396.165973,    // current timestamp
        //     "dealMoney": "0",                  // if order finished - amount in money currency that finished
        //     "dealStock": "0",                  // if order finished - amount in stock currency that finished
        //     "amount": "0.001",                 // amount
        //     "takerFee": "0.001",               // maker fee ratio. If the number less than 0.0001 - it will be rounded to zero
        //     "makerFee": "0.001",               // maker fee ratio. If the number less than 0.0001 - it will be rounded to zero
        //     "left": "0.001",                   // if order not finished - rest of amount that must be finished
        //     "dealFee": "0",                    // fee in money that you pay if order is finished
        //     "price": "40000",                  // price
        //     "activation_price": "40000"        // activation price -> only for stopLimit, stopMarket
        // }
        //
        // fetched orders/trades
        const side = this.safeValue (order, 'side');
        const amount = this.safeValue (order, 'amount');
        const clientOrderId = this.safeValue (order, 'clientOrderId');
        const price = this.safeValue (order, 'price');
        // createdOrder
        const orderId = this.safeValue (order, 'orderId');
        const type = this.safeValue (order, 'type');
        const takerFee = this.safeValue (order, 'takerFee');
        const makerFee = this.safeValue (order, 'makerFee');
        const status = 'closed';
        const timestamp = this.safeTimestamp (order, 'time');
        const id = this.safeString (order, 'dealOrderId');
        return this.safeOrder2 ({
            'info': order,
            'id': id,
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeString (order, 'price'),
            'stopPrice': undefined,
            'amount': this.safeString (order, 'deal'),
            'filled': this.safeString (order, 'deal'),
            'status': status,
            'fee': this.safeString (order, 'fee'),
            'cost': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': parseInt (id),
        };
        const response = await this.privateV4PostTradeAccountOrder (this.extend (request, params));
        // {
        //     "records": [
        //         {
        //             "time": 1593342324.613711,      // Timestamp of executed order
        //             "fee": "0.00000419198",         // fee that you pay
        //             "price": "0.00000701",          // price
        //             "amount": "598",                // amount in stock
        //             "id": 149156519,                // trade id
        //             "dealOrderId": 3134995325,      // completed order Id
        //             "clientOrderId": "customId11",  // custom order id; "clientOrderId": "" - if not specified.
        //             "role": 2,                      // Role - 1 - maker, 2 - taker
        //             "deal": "0.00419198"            // amount in money
        //         }
        //     ],
        //     "offset": 0,
        //     "limit": 100
        // }
        let data = this.safeValue (response, 'records', {});
        if (data.length) {
            data = this.safeValue (data, 'records', {});
        }
        return this.parseOrder (response);
    }

    isFiat (currency) {
        const fiatCurrencies = {
            'USD': true,
            'EUR': true,
            'RUB': true,
            'UAH': true,
        };
        return this.safeValue (fiatCurrencies, currency, false);
    }

    sign (path, api = 'publicV1', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        if (api === 'publicV1') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (api === 'privateV4') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const secret = this.stringToBinary (this.secret);
            const baseUrl = this.urls['api']['web'];
            const request = '/' + url.replace (baseUrl, '');
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
        if (url.indexOf ('public') && response !== undefined) {
            const success = this.safeValue (response, 'success');
            if (!success) {
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
