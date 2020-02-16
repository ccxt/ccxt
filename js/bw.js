'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadSymbol, OrderNotFound, ExchangeError, AuthenticationError, ArgumentsRequired, ExchangeNotAvailable } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bw extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bw',
            'name': 'BW',
            'countries': [ 'CN' ],
            'rateLimit': 1500,
            'version': 'v1',
            'has': {
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'CORS': false,
                'createDepositAddress': false,
                'createLimitOrder': true,
                'createMarketOrder': false,
                'createOrder': true,
                'deposit': false,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingFees': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': true,
                'privateAPI': false,
                'publicAPI': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1M',
                '5m': '5M',
                '15m': '15M',
                '30m': '30M',
                '1h': '1H',
                '1w': '1W',
            },
            'hostname': 'bw.com', // set to 'bw.io' for China mainland
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/69436317-31128c80-0d52-11ea-91d1-eb7bb5818812.jpg',
                'api': 'https://www.{hostname}',
                'www': 'https://www.bw.com',
                'doc': 'https://github.com/bw-exchange/api_docs_en/wiki',
                'fees': 'https://www.bw.com/feesRate',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.2 / 100,
                    'maker': 0.2 / 100,
                },
                'funding': {
                },
            },
            'exceptions': {
                'exact': {
                    '999': AuthenticationError,
                    '1000': ExchangeNotAvailable, // {"datas":null,"resMsg":{"message":"getKlines error:data not exitsts\uff0cplease wait ,dataType=4002_KLINE_1M","method":null,"code":"1000"}}
                    '2012': OrderNotFound, // {"datas":null,"resMsg":{"message":"entrust not exists or on dealing with system","method":null,"code":"2012"}}
                    '5017': BadSymbol, // {"datas":null,"resMsg":{"message":"market not exist","method":null,"code":"5017"}}
                },
            },
            'api': {
                'public': {
                    'get': [
                        'api/data/v1/klines',
                        'api/data/v1/ticker',
                        'api/data/v1/tickers',
                        'api/data/v1/trades',
                        'api/data/v1/entrusts',
                        'exchange/config/controller/website/marketcontroller/getByWebId',
                        'exchange/config/controller/website/currencycontroller/getCurrencyList',
                    ],
                },
                'private': {
                    'get': [
                        'exchange/entrust/controller/website/EntrustController/getEntrustById',
                        'exchange/entrust/controller/website/EntrustController/getUserEntrustRecordFromCacheWithPage',
                        'exchange/entrust/controller/website/EntrustController/getUserEntrustList',
                        'exchange/fund/controller/website/fundwebsitecontroller/getwithdrawaddress',
                        'exchange/fund/controller/website/fundwebsitecontroller/getpayoutcoinrecord',
                        'exchange/entrust/controller/website/EntrustController/getUserEntrustList',
                        // the docs say that the following URLs are HTTP POST
                        // in the docs header and HTTP GET in the docs body
                        // the docs contradict themselves, a typo most likely
                        // the actual HTTP method is POST for this endpoint
                        // 'exchange/fund/controller/website/fundcontroller/getPayinAddress',
                        // 'exchange/fund/controller/website/fundcontroller/getPayinCoinRecord',
                    ],
                    'post': [
                        'exchange/fund/controller/website/fundcontroller/getPayinAddress', // see the comment above
                        'exchange/fund/controller/website/fundcontroller/getPayinCoinRecord', // see the comment above
                        'exchange/fund/controller/website/fundcontroller/findbypage',
                        'exchange/entrust/controller/website/EntrustController/addEntrust',
                        'exchange/entrust/controller/website/EntrustController/cancelEntrust',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetExchangeConfigControllerWebsiteMarketcontrollerGetByWebId (params);
        //
        //     {
        //         "datas": [
        //             {
        //                 "orderNum":null,
        //                 "leverEnable":true,
        //                 "leverMultiple":10,
        //                 "marketId":"291",
        //                 "webId":"102",
        //                 "serverId":"entrust_bw_23",
        //                 "name":"eos_usdt",
        //                 "leverType":"2",
        //                 "buyerCurrencyId":"11",
        //                 "sellerCurrencyId":"7",
        //                 "amountDecimal":4,
        //                 "priceDecimal":3,
        //                 "minAmount":"0.0100000000",
        //                 "state":1,
        //                 "openTime":1572537600000,
        //                 "defaultFee":"0.00200000",
        //                 "createUid":null,
        //                 "createTime":0,
        //                 "modifyUid":null,
        //                 "modifyTime":1574160113735,
        //                 "combineMarketId":"",
        //                 "isCombine":0,
        //                 "isMining":0
        //             }
        //         ],
        //         "resMsg": { "message":"success !", "method":null, "code":"1" }
        //     }
        //
        const markets = this.safeValue (response, 'datas', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'marketId');
            const numericId = parseInt (id);
            const name = this.safeStringUpper (market, 'name');
            let [ base, quote ] = name.split ('_');
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const baseId = this.safeString (market, 'sellerCurrencyId');
            const quoteId = this.safeString (market, 'buyerCurrencyId');
            const baseNumericId = parseInt (baseId);
            const quoteNumericId = parseInt (quoteId);
            const symbol = base + '/' + quote;
            const state = this.safeInteger (market, 'state');
            const active = (state === 1);
            const fee = this.safeFloat (market, 'defaultFee');
            result.push ({
                'id': id,
                'active': active,
                'numericId': numericId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'baseNumericId': baseNumericId,
                'quoteNumericId': quoteNumericId,
                'maker': fee,
                'taker': fee,
                'info': market,
                'precision': {
                    'amount': this.safeInteger (market, 'amountDecimal'),
                    'price': this.safeInteger (market, 'priceDecimal'),
                },
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minAmount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': 0,
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetExchangeConfigControllerWebsiteCurrencycontrollerGetCurrencyList (params);
        //
        //     {
        //         "datas":[
        //             {
        //                 "currencyId":"456",
        //                 "name":"pan",
        //                 "alias":"pan",
        //                 "logo":"pan.svg",
        //                 "description":"pan",
        //                 "descriptionEnglish":"pan",
        //                 "defaultDecimal":2,
        //                 "createUid":null,
        //                 "createTime":1574068133762,
        //                 "modifyUid":null,
        //                 "modifyTime":0,
        //                 "state":1,
        //                 "mark":"pan",
        //                 "totalNumber":"0",
        //                 "publishNumber":"0",
        //                 "marketValue":"0",
        //                 "isLegalCoin":0,
        //                 "needBlockUrl":1,
        //                 "blockChainUrl":"https://etherscan.io/tx/",
        //                 "tradeSearchUrl":null,
        //                 "tokenCoinsId":0,
        //                 "isMining":"0",
        //                 "arithmetic":null,
        //                 "founder":"bw_nxwal",
        //                 "teamAddress":null,
        //                 "remark":null,
        //                 "tokenName":"ethw2",
        //                 "isMemo":0,
        //                 "websiteCurrencyId":"7rhqoHLohkG",
        //                 "drawFlag":0,
        //                 "rechargeFlag":1,
        //                 "drawFee":"0.03000000",
        //                 "onceDrawLimit":100,
        //                 "dailyDrawLimit":500,
        //                 "timesFreetrial":"0",
        //                 "hourFreetrial":"0",
        //                 "dayFreetrial":"0",
        //                 "minFee":"0",
        //                 "inConfigTimes":7,
        //                 "outConfigTimes":7,
        //                 "minCash":"0.06000000",
        //                 "limitAmount":"0",
        //                 "zbExist":false,
        //                 "zone":1
        //             },
        //         ],
        //         "resMsg": { "message":"success !", "method":null, "code":"1" }
        //     }
        //
        const currencies = this.safeValue (response, 'datas', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'currencyId');
            const code = this.safeCurrencyCode (this.safeStringUpper (currency, 'name'));
            const state = this.safeInteger (currency, 'state');
            const active = state === 1;
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': code,
                'active': active,
                'fee': this.safeFloat (currency, 'drawFee'),
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (currency, 'limitAmount', 0),
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
                        'min': undefined,
                        'max': this.safeFloat (currency, 'onceDrawLimit'),
                    },
                },
            };
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     [
        //         "281",            // market id
        //         "9754.4",         // last
        //         "9968.8",         // high
        //         "9631.5",         // low
        //         "47865.6432",     // base volume
        //         "-2.28",          // change
        //         // closing price for last 6 hours
        //         "[[1, 9750.1], [2, 9737.1], [3, 9727.5], [4, 9722], [5, 9722.1], [6, 9754.4]]",
        //         "9752.12",        // bid
        //         "9756.69",        // ask
        //         "469849357.2364"  // quote volume
        //     ]
        //
        let symbol = undefined;
        const marketId = this.safeString (ticker, 0);
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            symbol = marketId;
        }
        const timestamp = this.milliseconds ();
        const close = parseFloat (this.safeValue (ticker, 1));
        const bid = this.safeValue (ticker, 'bid', {});
        const ask = this.safeValue (ticker, 'ask', {});
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (this.safeValue (ticker, 2)),
            'low': parseFloat (this.safeValue (ticker, 3)),
            'bid': parseFloat (this.safeValue (ticker, 7)),
            'bidVolume': this.safeFloat (bid, 'quantity'),
            'ask': parseFloat (this.safeValue (ticker, 8)),
            'askVolume': this.safeFloat (ask, 'quantity'),
            'vwap': undefined,
            'open': undefined,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': parseFloat (this.safeValue (ticker, 5)),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (this.safeValue (ticker, 4)),
            'quoteVolume': parseFloat (this.safeValue (ticker, 9)),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
        };
        const response = await this.publicGetApiDataV1Ticker (this.extend (request, params));
        //
        //     {
        //         "datas": [
        //             "281",
        //             "7601.99",
        //             "8126.5",
        //             "7474.68",
        //             "47004.8708",
        //             "-6.18",
        //             "[[1, 7800.34], [2, 7626.41], [3, 7609.97], [4, 7569.04], [5, 7577.93], [6, 7601.99]]",
        //             "7600.24",
        //             "7603.69",
        //             "371968300.0119",
        //         ],
        //         "resMsg": { "message": "success !", "method": null, "code": "1" }
        //     }
        //
        const ticker = this.safeValue (response, 'datas', []);
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetApiDataV1Tickers (params);
        //
        //     {
        //         "datas": [
        //             [
        //                 "4051",
        //                 "0.00194",
        //                 "0.00863",
        //                 "0.0012",
        //                 "1519020",
        //                 "-38.22",
        //                 "[[1, 0.0023], [2, 0.00198], [3, 0.00199], [4, 0.00195], [5, 0.00199], [6, 0.00194]]",
        //                 "0.00123",
        //                 "0.0045",
        //                 "4466.8104",
        //             ],
        //         ],
        //         "resMsg": { "message": "success !", "method": null, "code": "1" },
        //     }
        //
        const datas = this.safeValue (response, 'datas', []);
        const result = {};
        for (let i = 0; i < datas.length; i++) {
            const ticker = this.parseTicker (datas[i]);
            const symbol = ticker['symbol'];
            if ((symbols === undefined) || this.inArray (symbol, symbols)) {
                result[symbol] = ticker;
            }
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
        };
        if (limit !== undefined) {
            request['dataSize'] = limit;
        }
        const response = await this.publicGetApiDataV1Entrusts (this.extend (request, params));
        //
        //     {
        //         "datas": {
        //             "asks": [
        //                 [ "9740.43", "0.0083" ],
        //             ],
        //             "bids": [
        //                 [ "9734.33", "0.0133" ],
        //             ],
        //             "timestamp": "1569303520",
        //         },
        //         "resMsg": {
        //             "message": "success !",
        //             "method": null,
        //             "code": "1",
        //         },
        //     }
        //
        const orderbook = this.safeValue (response, 'datas', []);
        const timestamp = this.safeTimestamp (orderbook, 'timestamp');
        return this.parseOrderBook (orderbook, timestamp);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     [
        //         "T",          // trade
        //         "281",        // market id
        //         "1569303302", // timestamp
        //         "BTC_USDT",   // market name
        //         "ask",        // side
        //         "9745.08",    // price
        //         "0.0026"      // amount
        //     ]
        //
        // fetchMyTrades (private)
        //
        //     ...
        //
        const timestamp = this.safeTimestamp (trade, 2);
        const price = this.safeFloat (trade, 5);
        const amount = this.safeFloat (trade, 6);
        const marketId = this.safeString (trade, 1);
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const marketName = this.safeString (trade, 3);
                const [ baseId, quoteId ] = marketName.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = this.costToPrecision (symbol, price * amount);
            }
        }
        const sideString = this.safeString (trade, 4);
        const side = (sideString === 'ask') ? 'sell' : 'buy';
        return {
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': 'limit',
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': parseFloat (cost),
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
        };
        if (limit !== undefined) {
            request['dataSize'] = limit; // max 20
        }
        const response = await this.publicGetApiDataV1Trades (this.extend (request, params));
        //
        //     {
        //         "datas": [
        //             [
        //                 "T",          // trade
        //                 "281",        // market id
        //                 "1569303302", // timestamp
        //                 "BTC_USDT",   // market name
        //                 "ask",        // side
        //                 "9745.08",    // price
        //                 "0.0026"      // amount
        //             ],
        //         ],
        //         "resMsg": { "code": "1", "method": null, "message": "success !" },
        //     }
        //
        const trades = this.safeValue (response, 'datas', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.safeTimestamp (ohlcv, 3),
            this.safeFloat (ohlcv, 4),
            this.safeFloat (ohlcv, 5),
            this.safeFloat (ohlcv, 6),
            this.safeFloat (ohlcv, 7),
            this.safeFloat (ohlcv, 8),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
            'type': this.timeframes[timeframe],
            'dataSize': 500,
        };
        if (limit !== undefined) {
            request['dataSize'] = limit;
        }
        const response = await this.publicGetApiDataV1Klines (this.extend (request, params));
        const data = this.safeValue (response, 'datas', []);
        const ohlcvs = this.parseOHLCVs (data, market, timeframe, since, limit);
        return this.sortBy (ohlcvs, 0);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostExchangeFundControllerWebsiteFundcontrollerFindbypage (params);
        //
        //     {
        //         "datas": {
        //             "totalRow": 6,
        //             "pageSize": 99,
        //             "list": [
        //                 {
        //                     "amount": "0.000090000000000000", // The current number of tokens available
        //                     "currencyTypeId": 2,              // Token ID
        //                     "freeze": "0.009900000000000000", // Current token freezing quantity
        //                 },
        //             ],
        //             "pageNum": 1,
        //         },
        //         "resMsg": { "code": "1", "message": "success !" }
        //     }
        //
        const data = this.safeValue (response, 'datas', {});
        const balances = this.safeValue (data, 'list', []);
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currencyTypeId');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'amount');
            account['used'] = this.safeFloat (balance, 'freeze');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (price === undefined) {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
            'type': (side === 'buy') ? 1 : 0,
            'rangeType': 0, // limit order
            'marketId': market['id'],
        };
        const response = await this.privatePostExchangeEntrustControllerWebsiteEntrustControllerAddEntrust (this.extend (request, params));
        //
        //     {
        //         "datas": {
        //             "entrustId": "E6581105708337483776",
        //         },
        //         "resMsg": {
        //             "message": "success !",
        //             "method": null,
        //             "code": "1"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'datas');
        const id = this.safeString (data, 'entrustId');
        return {
            'id': id,
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': 'open',
            'fee': undefined,
            'trades': undefined,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            '-3': 'canceled',
            '-2': 'canceled',
            '-1': 'canceled',
            '0': 'open',
            '1': 'canceled',
            '2': 'closed',
            '3': 'open',
            '4': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrder, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "entrustId": "E6581108027628212224", // Order id
        //         "price": "1450",                     // price
        //         "rangeType": 0,                      // Commission type 0: limit price commission 1: interval commission
        //         "amount": "14.05",                   // Order quantity
        //         "totalMoney": "20372.50",            // Total order amount
        //         "completeAmount": "0",               // Quantity sold
        //         "completeTotalMoney": "0",           // Total dealt amount
        //         "type": 1,                           // 0 = sell, 1 = buy, -1 = cancel
        //         "entrustType": 0,                    // 0 = ordinary current price commission, 1 = lever commission
        //         "status": 0,                         //
        //         "marketId": "318",                   // The market id
        //         "createTime": 1569058424861,         // Create time
        //         "availabelAmount": "14.05"           // Outstanding quantity, typo in the docs or in the API, availabel vs available
        //     }
        //
        const marketId = this.safeString (order, 'marketId');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        const timestamp = this.safeInteger (order, 'createTime');
        let side = this.safeString (order, 'type');
        if (side === '0') {
            side = 'sell';
        } else if (side === '1') {
            side = 'buy';
        }
        const amount = this.safeFloat (order, 'amount');
        const price = this.safeFloat (order, 'price');
        const filled = this.safeFloat (order, 'completeAmount');
        let remaining = this.safeFloat2 (order, 'availabelAmount', 'availableAmount'); // typo in the docs or in the API, availabel vs available
        let cost = this.safeFloat (order, 'totalMoney');
        if (filled !== undefined) {
            if (amount !== undefined) {
                if (remaining === undefined) {
                    remaining = amount - filled;
                }
            }
            if (cost === undefined) {
                if (price !== undefined) {
                    cost = filled * cost;
                }
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        return {
            'info': order,
            'id': this.safeString (order, 'entrustId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': this.safeString (market, 'symbol'),
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
            'entrustId': id,
        };
        const response = await this.privateGetExchangeEntrustControllerWebsiteEntrustControllerGetEntrustById (this.extend (request, params));
        //
        //     {
        //         "datas": {
        //             "entrustId": "E6581108027628212224", // Order id
        //             "price": "1450",                     // price
        //             "rangeType": 0,                      // Commission type 0: limit price commission 1: interval commission
        //             "amount": "14.05",                   // Order quantity
        //             "totalMoney": "20372.50",            // Total order amount
        //             "completeAmount": "0",               // Quantity sold
        //             "completeTotalMoney": "0",           // Total dealt amount
        //             "type": 1,                           // Trade direction, 0: sell, 1: buy, -1: cancel
        //             "entrustType": 0,                    // Commission type, 0: ordinary current price commission, 1: lever commission
        //             "status": 0,                         // Order status,-3:fund Freeze exception,Order status to be confirmed  -2: fund freeze failure, order failure, -1: insufficient funds, order failure, 0: pending order, 1: cancelled, 2: dealt, 3: partially dealt
        //             "marketId": "318",                   // The market id
        //             "createTime": 1569058424861,         // Create time
        //             "availabelAmount": "14.05"           // Outstanding quantity
        //         },
        //         "resMsg": { "message": "success !", "method": null, "code": "1" }
        //     }
        //
        const order = this.safeValue (response, 'datas', {});
        return this.parseOrder (order, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
            'entrustId': id,
        };
        const response = await this.privatePostExchangeEntrustControllerWebsiteEntrustControllerCancelEntrust (this.extend (request, params));
        //
        //     {
        //         "datas": null,
        //         "resMsg": { "message": "success !", "method": null, "code": "1" }
        //     }
        //
        return {
            'info': response,
            'id': id,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
            // 'pageSize': limit, // documented as required, but it works without it
            // 'pageIndex': 0, // also works without it, most likely a typo in the docs
        };
        if (limit !== undefined) {
            request['pageSize'] = limit; // default limit is 20
        }
        const response = await this.privateGetExchangeEntrustControllerWebsiteEntrustControllerGetUserEntrustRecordFromCacheWithPage (this.extend (request, params));
        //
        //     {
        //         "datas": {
        //             "pageNum": 1,
        //             "pageSize": 2,
        //             "totalPage": 20,
        //             "totalRow": 40,
        //             "entrustList": [
        //                 {
        //                     "amount": "14.050000000000000000",        // Order quantity
        //                     "rangeType": 0,                           // Commission type 0: limit price commission 1: interval commission
        //                     "totalMoney": "20372.500000000000000000", // Total order amount
        //                     "entrustId": "E6581108027628212224",      // Order id
        //                     "type": 1,                                // Trade direction, 0: sell, 1: buy, -1: cancel
        //                     "completeAmount": "0",                    // Quantity sold
        //                     "marketId": "318",                        // The market id
        //                     "createTime": 1569058424861,              // Create time
        //                     "price": "1450.000000000",                // price
        //                     "completeTotalMoney": "0",                // Quantity sold
        //                     "entrustType": 0,                         // Commission type, 0: ordinary current price commission, 1: lever commission
        //                     "status": 0                               // Order status,-3:fund Freeze exception,Order status to be confirmed  -2: fund freeze failure, order failure, -1: insufficient funds, order failure, 0: pending order, 1: cancelled, 2: dealt, 3: partially dealt
        //                 },
        //             ],
        //         },
        //         "resMsg": { "message": "success !", "method": null, "code": "1" },
        //     }
        //
        const data = this.safeValue (response, 'datas', {});
        const orders = this.safeValue (data, 'entrustList', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
        };
        if (limit !== undefined) {
            request['pageSize'] = limit; // default limit is 20
        }
        if (since !== undefined) {
            request['startDateTime'] = since;
        }
        const response = await this.privateGetExchangeEntrustControllerWebsiteEntrustControllerGetUserEntrustList (this.extend (request, params));
        const data = this.safeValue (response, 'datas', {});
        const orders = this.safeValue (data, 'entrustList', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
            // 'pageSize': limit, // documented as required, but it works without it
            // 'pageIndex': 0, // also works without it, most likely a typo in the docs
            // 'type': 0, // 0 = sell, 1 = buy, -1 = cancel
            // 'status': -1, // -1 = insufficient funds, failed orders, 0 = pending orders, 1 = canceled, 2 = closed, 3 = partial
            // 'startDateTime': since,
            // 'endDateTime': this.milliseconds (),
        };
        if (since !== undefined) {
            request['startDateTime'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit; // default limit is 20
        }
        const response = await this.privateGetExchangeEntrustControllerWebsiteEntrustControllerGetUserEntrustList (this.extend (request, params));
        //
        //     {
        //         "datas": {
        //             "pageNum": 1,
        //             "pageSize": 2,
        //             "totalPage": 20,
        //             "totalRow": 40,
        //             "entrustList": [
        //                 {
        //                     "amount": "14.050000000000000000",        // Order quantity
        //                     "rangeType": 0,                           // Commission type 0: limit price commission 1: interval commission
        //                     "totalMoney": "20372.500000000000000000", // Total order amount
        //                     "entrustId": "E6581108027628212224",      // Order id
        //                     "type": 1,                                // Trade direction, 0: sell, 1: buy, -1: cancel
        //                     "completeAmount": "0",                    // Quantity sold
        //                     "marketId": "318",                        // The market id
        //                     "createTime": 1569058424861,              // Create time
        //                     "price": "1450.000000000",                // price
        //                     "completeTotalMoney": "0",                // Quantity sold
        //                     "entrustType": 0,                         // Commission type, 0: ordinary current price commission, 1: lever commission
        //                     "status": 0                               // Order status,-3:fund Freeze exception,Order status to be confirmed  -2: fund freeze failure, order failure, -1: insufficient funds, order failure, 0: pending order, 1: cancelled, 2: dealt, 3: partially dealt
        //                 },
        //             ],
        //         },
        //         "resMsg": { "message": "success !", "method": null, "code": "1" },
        //     }
        //
        const data = this.safeValue (response, 'datas', {});
        const orders = this.safeValue (data, 'entrustList', []);
        return this.parseOrders (orders, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams (this.urls['api'], { 'hostname': this.hostname }) + '/' + path;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            body = this.json (params);
        }
        if (api === 'private') {
            const ms = this.milliseconds ().toString ();
            let content = '';
            if (method === 'GET') {
                const sortedParams = this.keysort (params);
                const keys = Object.keys (sortedParams);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    content += key + sortedParams[key].toString ();
                }
            } else {
                content = body;
            }
            const signature = this.apiKey + ms + content + this.secret;
            const hash = this.hash (this.encode (signature), 'md5');
            if (!headers) {
                headers = {};
            }
            headers['Apiid'] = this.apiKey;
            headers['Timestamp'] = ms;
            headers['Sign'] = hash;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currencyTypeName': currency['name'],
        };
        const response = await this.privatePostExchangeFundControllerWebsiteFundcontrollerGetPayinAddress (this.extend (request, params));
        //
        //     {
        //         "datas": {
        //             "isMemo": true,                                // 是否为memo 格式，false：否，true ：是
        //             "address": "bweosdeposit_787928102918558272",  // 充币地址
        //             "memo": "787928102918558272",                  // 币种memo
        //             "account": "bweosdeposit"                      // 币种账户
        //         },
        //         "resMsg": { "message": "success !", "method": null, "code": "1" }
        //     }
        //
        const data = this.safeValue (response, 'datas', {});
        const address = this.safeString (data, 'address');
        const tag = this.safeString (data, 'memo');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': this.checkAddress (address),
            'tag': tag,
            'info': response,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            '-1': 'canceled', // or auditing failed
            '0': 'pending',
            '1': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "depositId": "D6574268549744189441",                  // Deposit ID
        //         "amount": "54.753589700000000000",                    // Deposit amount
        //         "txId": "INNER_SYSTEM_TRANSFER_1198941",              // Trading ID
        //         "confirmTimes": 0,                                    // Confirmation number
        //         "depositAddress": "bweosdeposit_787928102918558272",  // Deposit address
        //         "createTime": "2019-09-02 20:36:08.0",                // Deposit time
        //         "status": 1,                                          // Deposit status, 0: not received, 1: received
        //         "currencyTypeId": 7,                                  // Token ID
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "withdrawalId": "W6527498439872634880",      // Withdrawal ID
        //         "fees": "0.500000000000000000",              // Withdrawal fee
        //         "withdrawalAddress": "okbtothemoon_941657",  // Withdrawal address
        //         "currencyId": "7",                           // Token ID
        //         "amount": "10.000000000000000000",           // Withdrawal amount
        //         "state": 1,                                  // Status, 1: normal, -1: delete
        //         "verifyStatus": 1,                           // Audit status, 0: to be audited, 1: auditing passed, -1: auditing failed
        //         "createTime": 1556276903656,                 // WIthdrawal time
        //         "actuallyAmount": "9.500000000000000000",    // Actual amount received
        //     }
        //
        const id = this.safeString (transaction, 'depositId', 'withdrawalId');
        const address = this.safeString2 (transaction, 'depositAddress', 'withdrawalAddress');
        const currencyId = this.safeString2 (transaction, 'currencyId', 'currencyTypeId');
        let code = undefined;
        if (currencyId in this.currencies_by_id) {
            currency = this.currencies_by_id[currencyId];
        }
        if ((code === undefined) && (currency !== undefined)) {
            code = currency['code'];
        }
        const type = ('depositId' in transaction) ? 'deposit' : 'withdrawal';
        const amount = this.safeFloat2 (transaction, 'actuallyAmount', 'amount');
        const status = this.parseTransactionStatus (this.safeString2 (transaction, 'verifyStatus', 'state'));
        const timestamp = this.safeInteger (transaction, 'createTime');
        const txid = this.safeString (transaction, 'txId');
        let fee = undefined;
        const feeCost = this.safeFloat (transaction, 'fees');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': undefined,
            'address': address,
            'addressTo': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits() requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currencyTypeName': currency['name'],
            // 'pageSize': limit, // documented as required, but it works without it
            // 'pageNum': 0, // also works without it, most likely a typo in the docs
            // 'sort': 1, // 1 = asc, 0 = desc
        };
        if (limit !== undefined) {
            request['pageSize'] = limit; // default 50
        }
        const response = await this.privatePostExchangeFundControllerWebsiteFundcontrollerGetPayinCoinRecord (this.extend (request, params));
        //
        //     {
        //         "datas": {
        //             "totalRow":2,
        //             "totalPage": 1,
        //             "pageSize": 2,
        //             "pageNum": 1,
        //             "list": [
        //                 {
        //                     "depositId": "D6574268549744189441",                  // Deposit ID
        //                     "amount": "54.753589700000000000",                    // Deposit amount
        //                     "txId": "INNER_SYSTEM_TRANSFER_1198941",              // Trading ID
        //                     "confirmTimes": 0,                                    // Confirmation number
        //                     "depositAddress": "bweosdeposit_787928102918558272",  // Deposit address
        //                     "createTime": "2019-09-02 20:36:08.0",                // Deposit time
        //                     "status": 1,                                          // Deposit status, 0: not received, 1: received
        //                     "currencyTypeId": 7,                                  // Token ID
        //                 },
        //             ]
        //         },
        //         "resMsg": { "message": "success !", "method": null, "code": "1" },
        //     }
        //
        const data = this.safeValue (response, 'datas', {});
        const deposits = this.safeValue (data, 'list', []);
        return this.parseTransactions (deposits, code, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals() requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currencyId': currency['id'],
            // 'pageSize': limit, // documented as required, but it works without it
            // 'pageIndex': 0, // also works without it, most likely a typo in the docs
            // 'tab': 'all', // all, wait (submitted, not audited), success (auditing passed), fail (auditing failed), cancel (canceled by user)
        };
        if (limit !== undefined) {
            request['pageSize'] = limit; // default 50
        }
        const response = await this.privateGetExchangeFundControllerWebsiteFundwebsitecontrollerGetpayoutcoinrecord (this.extend (request, params));
        //
        //     {
        //         "datas": {
        //             "totalRow": 1,
        //             "totalPage": 1,
        //             "pageSize": 2,
        //             "pageNum": 1,
        //             "list": [
        //                 {
        //                     "withdrawalId": "W6527498439872634880",      // Withdrawal ID
        //                     "fees": "0.500000000000000000",              // Withdrawal fee
        //                     "withdrawalAddress": "okbtothemoon_941657",  // Withdrawal address
        //                     "currencyId": "7",                           // Token ID
        //                     "amount": "10.000000000000000000",           // Withdrawal amount
        //                     "state": 1,                                  // Status, 1: normal, -1: delete
        //                     "verifyStatus": 1,                           // Audit status, 0: to be audited, 1: auditing passed, -1: auditing failed
        //                     "createTime": 1556276903656,                 // WIthdrawal time
        //                     "actuallyAmount": "9.500000000000000000",    // Actual amount received
        //                 },
        //             ],
        //         },
        //         "resMsg": { "message": "success !", "method": null, "code": "1" },
        //     }
        //
        const data = this.safeValue (response, 'datas', {});
        const withdrawals = this.safeValue (data, 'list', []);
        return this.parseTransactions (withdrawals, code, since, limit);
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // default error handler
        }
        const resMsg = this.safeValue (response, 'resMsg');
        const errorCode = this.safeString (resMsg, 'code');
        if (errorCode !== '1') {
            const feedback = this.id + ' ' + this.json (response);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback); // unknown error
        }
    }
};
