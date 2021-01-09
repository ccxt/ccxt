'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, InsufficientFunds, OrderNotFound, BadResponse, BadRequest, BadSymbol } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');
//  ---------------------------------------------------------------------------

module.exports = class aax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'aax',
            'name': 'AAX',
            'countries': [ 'MT' ], // Malta
            'enableRateLimit': true,
            'rateLimit': 500,
            'version': 'v2',
            'v1': 'marketdata/v1',
            'has': {
                // 'cancelAllOrders': true,
                // 'cancelOrder': true,
                // 'createLimitOrder': false,
                // 'createMarketOrder': false,
                // 'createOrder': true,
                // 'editOrder': true,
                // 'fetchBalance': true,
                // 'fetchClosedOrders': true,
                // 'fetchDepositAddress': false,
                'fetchMarkets': true,
                // 'fetchMyTrades': true,
                // 'fetchOHLCV': true,
                // 'fetchOpenOrders': true,
                // 'fetchOrder': true,
                'fetchOrderBook': true,
                // 'fetchOrders': true,
                // 'fetchOrderTrades': false,
                'fetchTicker': 'emulated',
                'fetchTickers': true,
                'fetchTrades': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '12h': '720',
                '1d': '1440',
                '3d': '4320',
                '1w': '10080',
            },
            'urls': {
                'logo': 'http://cdn.aaxvip.com/res/images/logo/AAX-25B.jpg',
                'api': 'https://api.aaxpro.com',
                'www': 'https://www.aaxpro.com', // string website URL
                'doc': 'https://www.aaxpro.com/apidoc/index.html',
            },
            'api': {
                'public': {
                    // these endpoints are not documented
                    // 'get': [
                    //     'getHistMarketData', // Get OHLC(k line) of specific market v1
                    //     'order_book', // Get the order book of specified market
                    //     'order_book/{market}',
                    //     'trades', // Get recent trades on market, each trade is included only once Trades are sorted in reverse creation order.
                    //     'trades/{market}',
                    //     'tickers', // Get ticker of all markets
                    //     'tickers/{market}', // Get ticker of specific market
                    // ],
                    'get': [
                        'announcement/maintenance', // System Maintenance Notice
                        'instruments', // Retrieve all trading pairs information
                        'market/orderbook', // Order Book
                        'futures/position/openInterest', // Open Interest
                        'market/tickers', // Get the Last 24h Market Summary
                        'market/candles', // Get Current Candlestick
                        'market/trades', // Get the Most Recent Trades
                        'market/markPrice', // Get Current Mark Price
                        'futures/funding/predictedFunding/{symbol}', // Get Predicted Funding Rate
                        'futures/funding/prevFundingRate/{symbol}', // Get Last Funding Rate
                        'market/candles/index', // Get Current Index Candlestick
                    ],
                },
                'private': {
                    'get': [
                        'user/info', // Retrieve user information
                        'account/balances', // Get Account Balances
                        'account/deposit/address', // undocumented
                        'spot/trades', // Retrieve trades details for a spot order
                        'spot/openOrders', // Retrieve spot open orders
                        'spot/orders', // Retrieve historical spot orders
                        'futures/position', // Get positions for all contracts
                        'futures/position/closed', // Get closed positions
                        'futures/trades', // Retrieve trade details for a futures order
                        'futures/openOrders', // Retrieve futures open orders
                        'futures/orders', // Retrieve historical futures orders
                        'futures/funding/predictedFundingFee/{symbol}', // Get predicted funding fee
                    ],
                    'post': [
                        'account/transfer', // Asset Transfer
                        'spot/orders', // Create a new spot order
                        'spot/orders/cancelAllOnTimeout', // Automatically cancel all your spot orders after a specified timeout.
                        'futures/orders', // Create a new futures order
                        'futures/orders/cancelAllOnTimeout', // Automatically cancel all your futures orders after a specified timeout.
                        'futures/position/sltp', // Set take profit and stop loss orders for an opening position
                        'futures/position/close', // Close position
                        'futures/position/leverage', // Update leverage for position
                        'futures/position/margin', // Modify Isolated Position Margin
                    ],
                    'put': [
                        'spot/orders', // Amend spot order
                        'futures/orders', // Amend the quantity of an open futures order
                    ],
                    'delete': [
                        'spot/orders/cancel/{orderID}', // Cancel a spot order
                        'spot/orders/cancel/all', // Batch cancel spot orders
                        'futures/orders/cancel/{orderID}', // Cancel a futures order
                        'futures/orders/cancel/all', // Batch cancel futures orders
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': true,
                    'withdraw': {}, // There is only 1% fee on withdrawals to your bank account.
                },
            },
            'commonCurrencies': {
                'PLA': 'Plair',
            },
            'exceptions': {
                '2002': InsufficientFunds,
                '2003': OrderNotFound,
            },
            'options': {
                'defaultType': 'spot', // 'spot', 'future'
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetInstruments (params);
        //
        //     {
        //         "code":1,
        //         "message":"success",
        //         "ts":1610159448962,
        //         "data":[
        //             {
        //                 "tickSize":"0.01",
        //                 "lotSize":"1",
        //                 "base":"BTC",
        //                 "quote":"USDT",
        //                 "minQuantity":"1.0000000000",
        //                 "maxQuantity":"30000",
        //                 "minPrice":"0.0100000000",
        //                 "maxPrice":"999999.0000000000",
        //                 "status":"readOnly",
        //                 "symbol":"BTCUSDTFP",
        //                 "code":"FP",
        //                 "takerFee":"0.00040",
        //                 "makerFee":"0.00020",
        //                 "multiplier":"0.001000000000",
        //                 "mmRate":"0.00500",
        //                 "imRate":"0.01000",
        //                 "type":"futures",
        //                 "settleType":"Vanilla",
        //                 "settleCurrency":"USDT"
        //             },
        //             {
        //                 "tickSize":"0.5",
        //                 "lotSize":"10",
        //                 "base":"BTC",
        //                 "quote":"USD",
        //                 "minQuantity":"10.0000000000",
        //                 "maxQuantity":"300000",
        //                 "minPrice":"0.5000000000",
        //                 "maxPrice":"999999.0000000000",
        //                 "status":"readOnly",
        //                 "symbol":"BTCUSDFP",
        //                 "code":"FP",
        //                 "takerFee":"0.00040",
        //                 "makerFee":"0.00020",
        //                 "multiplier":"1.000000000000",
        //                 "mmRate":"0.00500",
        //                 "imRate":"0.01000",
        //                 "type":"futures",
        //                 "settleType":"Inverse",
        //                 "settleCurrency":"BTC"
        //             },
        //             {
        //                 "tickSize":"0.0001",
        //                 "lotSize":"0.01",
        //                 "base":"AAB",
        //                 "quote":"USDT",
        //                 "minQuantity":"5.0000000000",
        //                 "maxQuantity":"50000.0000000000",
        //                 "minPrice":"0.0001000000",
        //                 "maxPrice":"999999.0000000000",
        //                 "status":"readOnly",
        //                 "symbol":"AABUSDT",
        //                 "code":null,
        //                 "takerFee":"0.00100",
        //                 "makerFee":"0.00100",
        //                 "multiplier":"1.000000000000",
        //                 "mmRate":"0.02500",
        //                 "imRate":"0.05000",
        //                 "type":"spot",
        //                 "settleType":null,
        //                 "settleCurrency":null
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const status = this.safeString (market, 'status');
            const active = (status === 'enable');
            const taker = this.safeFloat (market, 'takerFee');
            const maker = this.safeFloat (market, 'makerFee');
            const type = this.safeString (market, 'type');
            let inverse = undefined;
            let linear = undefined;
            let quanto = undefined;
            const spot = (type === 'spot');
            const futures = (type === 'futures');
            const settleType = this.safeStringLower (market, 'settleType');
            if (settleType !== undefined) {
                inverse = (settleType === 'inverse');
                linear = (settleType === 'vanilla');
                quanto = (settleType === 'quanto');
            }
            let symbol = id;
            if (type === 'spot') {
                symbol = base + '/' + quote;
            }
            const precision = {
                'amount': this.safeFloat (market, 'lotSize'),
                'price': this.safeFloat (market, 'tickSize'),
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': type,
                'spot': spot,
                'futures': futures,
                'inverse': inverse,
                'linear': linear,
                'quanto': quanto,
                'precision': precision,
                'info': market,
                'active': active,
                'taker': taker,
                'maker': maker,
                'percentage': false,
                'tierBased': true,
                'limits': {
                    'amount': {
                        'min': this.safeString (market, 'minQuantity'),
                        'max': this.safeString (market, 'maxQuantity'),
                    },
                    'price': {
                        'min': this.safeString (market, 'minPrice'),
                        'max': this.safeString (market, 'maxPrice'),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "t":1610162685342, // timestamp
        //         "a":"0.00000000", // trading volume in USD in the last 24 hours, futures only
        //         "c":"435.20000000", // close
        //         "d":"4.22953489", // change
        //         "h":"455.04000000", // high
        //         "l":"412.78000000", // low
        //         "o":"417.54000000", // open
        //         "s":"BCHUSDTFP", // market id
        //         "v":"2031068.00000000", // trading volume in quote currency of last 24 hours
        //     }
        //
        const timestamp = this.safeInteger (ticker, 't');
        const marketId = this.safeString (ticker, 's');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeFloat (ticker, 'c');
        const open = this.safeFloat (ticker, 'o');
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        if (last !== undefined && open !== undefined) {
            change = last - open;
            if (open > 0) {
                percentage = change / open * 100;
            }
            average = this.sum (last, open) / 2;
        }
        const quoteVolume = this.safeFloat (ticker, 'v');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'h'),
            'low': this.safeFloat (ticker, 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': undefined,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        const tickers = await this.fetchTickers (undefined, params);
        if (symbol in tickers) {
            return tickers[symbol];
        }
        throw new BadSymbol (this.id + ' fetchTicker() symbol ' + symbol + ' ticker not found');
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarketTickers (params);
        //
        //     {
        //         "e":"tickers",
        //         "t":1610162685342,
        //         "tickers":[
        //             {
        //                 "a":"0.00000000",
        //                 "c":"435.20000000",
        //                 "d":"4.22953489",
        //                 "h":"455.04000000",
        //                 "l":"412.78000000",
        //                 "o":"417.54000000",
        //                 "s":"BCHUSDTFP",
        //                 "v":"2031068.00000000",
        //             },
        //         ],
        //     }
        //
        const tickers = this.safeValue (response, 'tickers', []);
        const result = [];
        const timestamp = this.safeInteger (response, 't');
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (this.extend (tickers[i], { 't': timestamp }));
            result.push (ticker);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            if ((limit !== 20) && (limit !== 50)) {
                throw new BadRequest (this.id + ' fetchOrderBook() limit argument must be undefined, 20 or 50');
            }
            request['level'] = limit;
        }
        //
        const response = await this.publicGetMarketOrderbook (this.extend (request, params));
        //
        //     {
        //         "asks":[
        //             ["10823.00000000","0.004000"],
        //             ["10823.10000000","0.100000"],
        //             ["10823.20000000","0.010000"]
        //         ],
        //         "bids":[
        //             ["10821.20000000","0.002000"],
        //             ["10821.10000000","0.005000"],
        //             ["10820.40000000","0.013000"]
        //         ],
        //         "e":"BTCUSDT@book_50",
        //         "t":1561543614756
        //     }
        //
        const timestamp = this.safeInteger (response, 't'); // need unix type
        return this.parseOrderBook (response, timestamp);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeFloat (trade, 't');
        const id = this.safeString (trade, 'tid');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        if (symbol && symbol.slice (-2) === 'FP') {
            symbol = symbol.slice (0, -2);
        }
        const price = this.safeFloat (trade, 'p');
        const amount = this.safeFloat (trade, 'q');
        const side = price > 0 ? 'buy' : 'sell';
        const cost = this.dealDecimal ('mul', price, amount);
        const currency = symbol ? symbol.split ('/')[1] : 'currency';
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'order': undefined,
            'takerOrMaker': undefined,
            'price': Math.abs (price),
            'amount': amount,
            'cost': Math.abs (cost),
            'fee': {
                'cost': undefined,
                'currency': currency,
                'rate': undefined,
            },
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'limit': 2, // max 2000
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketTrades (request);
        //
        //     {
        //         "e":"BTCUSDFP@trades",
        //         "trades": [
        //             {"p":"9395.50000000","q":"50.000000","t":1592563996718},
        //             {"p":"9395.50000000","q":"50.000000","t":1592563993577},
        //         ],
        //     }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        symbol = this.dealSymbol (symbol, params);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        this.checkParams (params);
        const isSpot = this.isSpot (symbol, params);
        let response = undefined;
        if (isSpot) {
            response = await this.privateDeleteSpotOrdersCancelAll (this.extend (request, params));
        } else {
            response = await this.privateDeleteFuturesOrdersCancelAll (this.extend (request, params));
        }
        return { 'info': response };
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        symbol = this.dealSymbol (symbol, params);
        return this.fetchOrders (symbol, since, limit, this.extend ({ 'orderStatus': 2 }, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (!id) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = {
            'orderID': id,
        };
        symbol = this.dealSymbol (symbol, params);
        this.market (symbol);
        this.checkParams (params);
        let response = undefined;
        // spot or future
        try {
            response = await this.privateDeleteSpotOrdersCancelOrderID (request);
        } catch (error) {
            response = await this.privateDeleteFuturesOrdersCancelOrderID (request);
        }
        if (response && response['code'] !== 1) {
            throw new BadResponse (response['message']);
        }
        // const response={
        //     "code":1,
        //     "data":{
        //        "avgPrice":"0",
        //        "base":"BTC",
        //        "clOrdID":"aax",
        //        "commission":"0",
        //        "createTime":"2019-11-12T03:46:41Z",
        //        "cumQty":"0",
        //        "id":"114330021504606208",
        //        "isTriggered":false,
        //        "lastPrice":"0",
        //        "lastQty":"0",
        //        "leavesQty":"0",
        //        "orderID":"wJ4L366KB",
        //        "orderQty":"0.05",
        //        "orderStatus":1,
        //        "orderType":2,
        //        "price":"8000",
        //        "quote":"USDT",
        //        "rejectCode":0,
        //        "rejectReason":null,
        //        "side":1,
        //        "stopPrice":"0",
        //        "symbol":"BTCUSDT",
        //        "transactTime":null,
        //        "updateTime":"2019-11-12T03:46:41Z",
        //        "timeInForce":1,
        //        "userID":"216214"
        //     },
        //     "message":"success",
        //     "ts":1573530402029
        //  }
        let order = this.extend (response['data'], { 'ts': response['ts'] });
        order = this.parseOrder (order);
        const status = this.safeString (order, 'status');
        if (status === 'closed' || status === 'canceled') {
            throw new OrderNotFound (this.id + ' ' + this.json (order));
        }
        return order;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        symbol = this.dealSymbol (symbol, params);
        if (!(symbol && type && side && amount)) {
            throw new ArgumentsRequired (this.id + ' createOrder  lack of arguments');
        }
        type = type.toUpperCase ();
        side = side.toUpperCase ();
        if (!this.inArray (type, ['MARKET', 'LIMIT', 'SPOT', 'STOP-LIMIT'])) {
            throw new BadRequest ('type must be MARKET, LIMIT, SPOT or STOP-LIMIT');
        }
        await this.loadMarkets ();
        const request = {
            'orderType': type,
            'symbol': this.marketId (symbol),
            'orderQty': amount,
            'stopPrice': this.safeString (params, 'stopPrice'),
            'timeInForce': this.safeString (params, 'timeInForce') ? this.safeString (params, 'timeInForce') : 'GTC',
            'side': side,
        };
        if (type === 'LIMIT' || type === 'STOP-LIMIT') {
            if (!price) {
                throw new ArgumentsRequired (this.id + ' createOrder LIMIT or STOP-LIMIT need price argument');
            }
            request['price'] = price.toString ();
        }
        this.checkParams (params);
        const isSpot = this.isSpot (symbol, params);
        let response = undefined;
        if (isSpot) {
            response = await this.privatePostSpotOrders (this.extend (request, params));
        } else {
            response = await this.privatePostFuturesOrders (this.extend (request, params));
        }
        if (response && response['code'] !== 1) {
            throw new BadResponse (response['message']);
        }
        // const response={
        //     "code":1,
        //     "data":{
        //        "avgPrice":"0",
        //        "base":"BTC",
        //        "clOrdID":"aax_futures",
        //        "code":"FP",
        //        "commission":"0",
        //        "createTime":null,
        //        "cumQty":"0",
        //        "id":"114375893764395008",
        //        "isTriggered":null,
        //        "lastPrice":"0",
        //        "lastQty":null,
        //        "leavesQty":"100",
        //        "leverage":"1",
        //        "liqType":0,
        //        "marketPrice":"8760.7500000000",
        //        "orderID":"wJTewQc81",
        //        "orderQty":"100",
        //        "orderStatus":0,
        //        "orderType":2,
        //        "price":"8000",
        //        "quote":"USD",
        //        "rejectCode":null,
        //        "rejectReason":null,
        //        "settleType":"INVERSE",
        //        "side":1,
        //        "stopPrice":null,
        //        "symbol":"BTCUSDFP",
        //        "transactTime":null,
        //        "updateTime":null,
        //        "timeInForce":1,
        //        "execInst": "",
        //        "userID":"216214"
        //     },
        //     "message":"success",
        //     "ts":1573541338074
        //  }
        const order = this.extend (response['data'], { 'ts': response['ts'] });
        return this.parseOrder (order);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.cancelOrder (id, symbol, params);
        return this.createOrder (symbol, type, side, amount, price, params);
        // const response={
        //     "code":1,
        //     "data":{
        //        "avgPrice":"0",
        //        "base":"BTC",
        //        "clOrdID":"aax",
        //        "commission":"0",
        //        "createTime":"2019-11-12T03:46:41Z",
        //        "cumQty":"0",
        //        "id":"114330021504606208",
        //        "isTriggered":false,
        //        "lastPrice":"0",
        //        "lastQty":"0",
        //        "leavesQty":"0.05",
        //        "orderID":"wJ4L366KB",
        //        "orderQty":"0.05",
        //        "orderStatus":1,
        //        "orderType":2,
        //        "price":"8000",
        //        "quote":"USDT",
        //        "rejectCode":0,
        //        "rejectReason":null,
        //        "side":1,
        //        "stopPrice":"0",
        //        "symbol":"BTCUSDT",
        //        "transactTime":null,
        //        "updateTime":"2019-11-12T03:46:41Z",
        //        "timeInForce":1,
        //        "userID":"216214"
        //     },
        //     "message":"success",
        //     "ts":1573530401494
        // }
    }

    purseType () {
        return {
            'spot': 'SPTP',
            'future': 'FUTP',
            'otc': 'F2CP',
            'saving': 'VLTP',
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const type = this.safeString (params, 'type') ? this.safeString (params, 'type') : this.options['defaultType'];
        this.checkParams (params, ['spot', 'future', 'otc', 'saving']);
        const purseType = this.purseType ();
        const response = await this.privateGetAccountBalances ({ 'purseType': purseType[type] });
        // const response = {
        //     'code': 1,
        //     'message': 'success',
        //     'ts': 1603187218565,
        //     'data': [
        //         {
        //             'purseType': 'SPTP',
        //             'currency': 'USDT',
        //             'available': '9402.93025232',
        //             'unavailable': '47.92316768',
        //         },
        //         {
        //             'purseType': 'SPTP',
        //             'currency': 'BTC',
        //             'available': '0.14995000',
        //             'unavailable': '0.00000000',
        //         },
        //         {
        //             'purseType': 'RWDP',
        //             'currency': 'BTC',
        //             'available': '0.00030000',
        //             'unavailable': '0.00200000',
        //         },
        //         {
        //             'purseType': 'FUTP',
        //             'currency': 'BTC',
        //             'available': '0.02000000',
        //             'unavailable': '0.20030000',
        //         },
        //     ],
        // };
        // RWDP
        const balances = this.safeValue (response, 'data');
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'unavailable');
            account['total'] = this.safeFloat (balance, 'available') + this.safeFloat (balance, 'unavailable');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        symbol = this.dealSymbol (symbol, params);
        await this.loadMarkets ();
        const request = this.dealSinceLimit (since, limit);
        this.checkParams (params);
        const optionType = this.safeString (params, 'type') ? this.safeString (params, 'type') : this.options['defaultType'];
        let response = undefined;
        if (optionType === 'spot') {
            response = await this.privateGetSpotTrades (this.extend (request, params));
        } else {
            response = await this.privateGetFuturesTrades (this.extend (request, params));
        }
        if (response && response['code'] !== 1) {
            throw new BadResponse (response['message']);
        }
        // const response={
        //     "code":1,
        //     "data":{
        //        "list":[
        //           {
        //              "avgPrice":"8000",
        //              "base":"BTC",
        //              "commission":"0.00000888",
        //              "createTime":"2019-11-12T03:18:35Z",
        //              "cumQty":"0.0148",
        //              "filledPrice":"8000",
        //              "filledQty":"0.0148",
        //              "id":"114322949580906499",
        //              "leavesQty":"0.0052",
        //              "orderID":"wFo9ZPxAJ",
        //              "orderQty":"0.02",
        //              "orderStatus":2,
        //              "orderType":2,
        //              "price":"8000",
        //              "quote":"USDT",
        //              "rejectCode":0,
        //              "rejectReason":null,
        //              "side":1,
        //              "stopPrice":"0",
        //              "symbol":"BTCUSDT",
        //              "taker":false,
        //              "transactTime":"2019-11-12T03:16:16Z",
        //              "updateTime":null,
        //              "userID":"216214"
        //           }
        //        ],
        //        "pageNum":1,
        //        "pageSize":1,
        //        "total":10
        //     },
        //     "message":"success",
        //     "ts":1573532934832
        // }
        const trades = response['data']['list'];
        return this.parseMyTrades (trades);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const dateScale = this.dealTimeFrame (timeframe);
        symbol = this.dealSymbol (symbol, params);
        await this.loadMarkets ();
        const [base, quote] = symbol.split ('/');
        limit = limit ? limit : 500;
        const request = {
            'limit': limit,
            'base': base,
            'quote': quote,
            'format': 'array',
            'useV1': true,
            'date_scale': dateScale,
        };
        if (since !== undefined) {
            request['timestamp'] = parseInt (since / 1000);
        }
        const response = await this.publicGetGetHistMarketData (this.extend (request, params));
        if (response && Array.isArray (response)) {
            for (let i = 0; i < response.length; i++) {
                if (response[i] && Array.isArray (response[i])) {
                    for (let index = 0; index < response[i].length; index++) {
                        const arr = response[i];
                        if (index === 0) {
                            arr[index] = this.dealDecimal ('mul', this.safeFloat (arr, index), 1000);
                        } else {
                            arr[index] = parseFloat (arr[index]);
                        }
                    }
                }
            }
            return this.parseOHLCVs (response);
        }
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = this.dealSinceLimit (since, limit);
        symbol = this.dealSymbol (symbol, params);
        if (symbol) {
            request['symbol'] = this.marketId (symbol);
        }
        this.checkParams (params);
        const isSpot = this.isSpot (symbol, params);
        let response = undefined;
        if (isSpot) {
            response = await this.privateGetSpotOpenOrders (this.extend (request, params));
        } else {
            response = await this.privateGetFuturesOpenOrders (this.extend (request, params));
        }
        // const response={
        //     "code":1,
        //     "data":{
        //        "list":[
        //           {
        //              "avgPrice":"0",
        //              "base":"BTC",
        //              "clOrdID":"aax",
        //              "commission":"0",
        //              "createTime":"2019-11-12T03:41:52Z",
        //              "cumQty":"0",
        //              "id":"114328808516083712",
        //              "isTriggered":false,
        //              "lastPrice":"0",
        //              "lastQty":"0",
        //              "leavesQty":"0",
        //              "orderID":"wJ3qitASB",
        //              "orderQty":"0.02",
        //              "orderStatus":1,
        //              "orderType":2,
        //              "price":"8000",
        //              "quote":"USDT",
        //              "rejectCode":0,
        //              "rejectReason":null,
        //              "side":1,
        //              "stopPrice":"0",
        //              "symbol":"BTCUSDT",
        //              "transactTime":null,
        //              "updateTime":"2019-11-12T03:41:52Z",
        //              "timeInForce":1,
        //              "userID":"216214"
        //           }
        //        ],
        //        "pageNum":1,
        //        "pageSize":2,
        //        "total":2
        //     },
        //     "message":"success",
        //     "ts":1573553718212
        //  }
        const orders = response['data']['list'];
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            const order = this.extend (orders[i]);
            result.push (this.parseOrder (order));
        }
        return result;
    }

    async fetchOrder (id = undefined, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (!id) {
            throw new ArgumentsRequired (this.id + ' editOrder need orderId argument');
        }
        request['orderID'] = id;
        symbol = this.dealSymbol (symbol, params);
        if (symbol) {
            request['symbol'] = this.marketId (symbol);
        }
        this.checkParams (params);
        const isSpot = this.isSpot (symbol, params);
        let response = undefined;
        if (isSpot) {
            response = await this.privateGetSpotOrders (this.extend (request, params));
        } else {
            response = await this.privateGetFuturesOrders (this.extend (request, params));
        }
        // const response={
        //     "code":1,
        //     "data":{
        //        "total":19,
        //        "pageSize":10,
        //        "list":[
        //           {
        //              "orderType":2,
        //              "symbol":"BTCUSDT",
        //              "avgPrice":"0",
        //              "orderStatus":0,
        //              "userID":"7225",
        //              "quote":"USDT",
        //              "rejectReason":null,
        //              "rejectCode":null,
        //              "price":"0",
        //              "orderQty":"0.002",
        //              "commission":"0",
        //              "id":"110419975166304256",
        //              "isTriggered":null,
        //              "side":1,
        //              "orderID":"vBGlDcLwk",
        //              "cumQty":"0",
        //              "leavesQty":"0",
        //              "updateTime":null,
        //              "clOrdID":"0001",
        //              "lastQty":"0",
        //              "stopPrice":"0",
        //              "createTime":"2019-11-01T08:49:33Z",
        //              "transactTime":null,
        //              "timeInForce":1,
        //              "base":"BTC",
        //              "lastPrice":"0"
        //           }
        //        ],
        //        "pageNum":1
        //     },
        //     "message":"success",
        //     "ts":1572598173682
        //  }
        const orders = response['data']['list'];
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            const order = this.extend (orders[i]);
            result.push (this.parseOrder (order));
        }
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        symbol = this.dealSymbol (symbol, params);
        await this.loadMarkets ();
        const request = this.dealSinceLimit (since, limit);
        this.checkParams (params);
        const isSpot = this.isSpot (symbol, params);
        if (symbol) {
            request['symbol'] = this.marketId (symbol);
        }
        let response = undefined;
        if (isSpot) {
            response = await this.privateGetSpotOrders (this.extend (request, params));
        } else {
            response = await this.privateGetFuturesOrders (this.extend (request, params));
        }
        // const response={
        //     "code":1,
        //     "data":{
        //        "total":19,
        //        "pageSize":10,
        //        "list":[
        //           {
        //              "orderType":2,
        //              "symbol":"BTCUSDT",
        //              "avgPrice":"0",
        //              "orderStatus":0,
        //              "userID":"7225",
        //              "quote":"USDT",
        //              "rejectReason":null,
        //              "rejectCode":null,
        //              "price":"0",
        //              "orderQty":"0.002",
        //              "commission":"0",
        //              "id":"110419975166304256",
        //              "isTriggered":null,
        //              "side":1,
        //              "orderID":"vBGlDcLwk",
        //              "cumQty":"0",
        //              "leavesQty":"0",
        //              "updateTime":null,
        //              "clOrdID":"0001",
        //              "lastQty":"0",
        //              "stopPrice":"0",
        //              "createTime":"2019-11-01T08:49:33Z",
        //              "transactTime":null,
        //              "timeInForce":1,
        //              "base":"BTC",
        //              "lastPrice":"0"
        //           }
        //        ],
        //        "pageNum":1
        //     },
        //     "message":"success",
        //     "ts":1572598173682
        //  }
        const orders = response['data']['list'];
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            const order = this.extend (orders[i]);
            result.push (this.parseOrder (order));
        }
        return result;
    }

    parseMyTrade (trade) {
        const id = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'orderID');
        const createTime = this.safeString (trade, 'createTime');
        const timestamp = createTime ? createTime : undefined;
        let symbol = this.safeString (trade, 'symbol');
        symbol = symbol ? this.marketsById[symbol]['symbol'] : symbol;
        if (symbol && symbol.slice (-2) === 'FP') {
            symbol = symbol.slice (0, -2);
        }
        const price = this.safeFloat (trade, 'price');
        const type = this.parseOrderType (this.safeString (trade, 'orderType'));
        const side = this.safeString (trade, 'side') === 1 ? 'Buy' : 'Sell';
        const amount = this.safeFloat (trade, 'filledQty');
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'order': orderId,
            'takerOrMaker': 'taker',
            'price': price,
            'amount': amount,
            'cost': this.dealDecimal ('mul', price, amount),
            'fee': {
                'currency': undefined,
                'cost': undefined,
                'rate': undefined,
            },
        };
    }

    parseMyTrades (trades) {
        const result = [];
        for (let i = 0; i < trades.length; i++) {
            let trade = trades[i];
            trade = this.parseMyTrade (trade);
            result.push (trade);
        }
        return result;
    }

    parseTrades (trades, market = undefined, since = undefined, limit = undefined, params = {}) {
        const lists = [];
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            lists.push (this.parseTrade (trade, market));
        }
        trades = lists;
        const result = this.sortBy (trades, 'timestamp');
        let symbol = undefined;
        if (market && this.safeString (market, 'symbol')) {
            symbol = this.safeString (market, 'symbol');
            if (symbol.slice (-2) === 'FP') {
                symbol = symbol.slice (0, -2);
            }
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open', // open
            '1': 'open', // open
            '2': 'closed', // closed
            '3': 'closed', // closed
            '4': 'cancled', // cancled
            '5': 'cancled', // cancled
            '6': 'rejected', // Rejected
            '10': 'cancled', // cancled
            '11': 'rejected', // Rejected
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (status) {
        const statuses = {
            '1': 'market',
            '2': 'limit',
            '3': 'Stop Order',
            '4': 'Stop-Limit Order',
            '7': 'Stop Loss',
            '8': 'Take Profit',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order) {
        const createTime = this.safeString (order, 'createTime');
        const timestamp = createTime ? createTime : this.safeFloat (order, 'ts');
        const status = this.parseOrderStatus (this.safeString (order, 'orderStatus'));
        const type = this.parseOrderType (this.safeString (order, 'orderType'));
        const side = this.safeString (order, 'side') === 1 ? 'buy' : 'sell';
        const id = this.safeString (order, 'orderID');
        const clientOrderId = this.safeString (order, 'clOrdID');
        let symbol = this.safeString (order, 'symbol');
        symbol = symbol ? this.marketsById[symbol]['symbol'] : symbol;
        if (symbol && symbol.slice (-2) === 'FP') {
            symbol = symbol.slice (0, -2);
        }
        const price = this.safeFloat (order, 'price');
        const average = this.safeFloat (order, 'avgPrice');
        const amount = this.safeFloat (order, 'orderQty');
        const filled = this.safeFloat (order, 'cumQty');
        const remaining = this.safeString (order, 'leavesQty');
        const transactTime = this.safeString (order, 'transactTime');
        const lastTradeTimestamp = transactTime ? transactTime : undefined;
        const currency = undefined;
        return {
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.parseDate (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'rejectReason': this.safeString (order, 'rejectReason'),
            'cost': this.dealDecimal ('mul', filled, price),
            'trades': [],
            'info': order,
            'fee': {
                'currency': currency,
                'cost': undefined,
                'rate': undefined,
            },
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let version = this.version;
        if (this.safeString (params, 'useV1')) {
            version = this.v1;
        }
        let request = '/' + version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + request;
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const privateHeader = {
                'X-ACCESS-KEY': this.apiKey,
                'X-ACCESS-NONCE': nonce,
            };
            const suffix = this.urlencode (query);
            if (method === 'GET') {
                url = suffix ? (url + '?' + suffix) : url;
                request = suffix ? (request + '?' + suffix) : request;
                const payload = {
                    'nonce': nonce,
                    'verb': method,
                    'path': request,
                    'data': '',
                };
                const sign = this.getSignFromSecret (payload);
                privateHeader['X-ACCESS-SIGN'] = sign;
                headers = this.extend ({ 'accept': 'application/json;charset=UTF-8' }, privateHeader);
            } else {
                const payload = {
                    'nonce': nonce,
                    'verb': method,
                    'path': request,
                    'data': this.json (query, { 'convertArraysToObjects': true }),
                };
                const sign = this.getSignFromSecret (payload);
                privateHeader['X-ACCESS-SIGN'] = sign;
                body = this.json (query, { 'convertArraysToObjects': true });
                headers = this.extend ({ 'Content-Type': 'application/json' }, privateHeader);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code === 400) {
            const error = this.safeValue (response, 'error');
            const errorCode = this.safeString (error, 'code');
            const feedback = this.id + ' ' + this.json (response);
            this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
            // fallback to default error handler
        }
    }

    getSignFromSecret (params) {
        const nonce = this.safeString (params, 'nonce');
        const verb = this.safeString (params, 'verb');
        const path = this.safeString (params, 'path');
        const data = this.safeString (params, 'data');
        const message = nonce + ':' + verb + path + data;
        return this.hmac (this.encode (message), this.encode (this.secret));
    }

    checkParams (params, arr = []) {
        if (!this.inArray (this.options['defaultType'], ['spot', 'future'])) {
            throw new BadRequest ('defaultType must be spot or future');
        }
        if (this.isEmpty (arr)) {
            arr = ['spot', 'future'];
        }
        let type = this.options['defaultType'];
        if (params && this.safeString (params, 'type')) {
            type = this.safeString (params, 'type');
            if (!this.inArray (type, arr)) {
                throw new BadRequest ('params.type must be' + arr.join (','));
            }
        }
    }

    dealSinceLimit (since, limit) {
        const result = {};
        if (since) {
            result['startDate'] = this.ymd (since);
        }
        if (limit) {
            result['pageSize'] = limit;
        }
        return result;
    }

    dealTimeFrame (timeframe) {
        const dateScale = this.timeframes[timeframe];
        if (!dateScale) {
            const keys = Object.keys (this.timeframes);
            const error = keys.join (',');
            throw new BadRequest ('timeframes must be ' + error);
        }
        return dateScale;
    }

    dealSymbol (symbol, params) {
        this.checkParams (params);
        let type = this.options['defaultType'];
        if (this.safeString (params, 'type')) {
            type = this.safeString (params, 'type');
        }
        const isSpot = type === 'spot';
        if (symbol) {
            if (!isSpot && symbol.slice (-2) !== 'FP') {
                symbol = symbol + 'FP';
            }
        }
        return symbol;
    }

    dealDecimal (op, num1, num2, digits = 8) {
        let result = 0;
        num1 = parseFloat (num1);
        num2 = parseFloat (num2);
        if (op === 'add') {
            result = this.decimalToPrecision (this.sum (num1, num2), ROUND, digits, this.precisionMode);
        }
        if (op === 'sub') {
            result = this.decimalToPrecision (num1 - num2, ROUND, digits, this.precisionMode);
        }
        if (op === 'mul') {
            result = this.decimalToPrecision (num1 * num2, ROUND, digits, this.precisionMode);
        }
        if (op === 'div') {
            result = this.decimalToPrecision (num1 / num2, ROUND, digits, this.precisionMode);
        }
        return parseFloat (result);
    }

    isSpot (symbol, params) {
        let optionType = this.options['defaultType'];
        if (this.safeString (params, 'type')) {
            optionType = this.safeString (params, 'type');
        }
        if (symbol) {
            return optionType === 'spot' && symbol.slice (-2) !== 'FP';
        }
        return optionType === 'spot';
    }
};
