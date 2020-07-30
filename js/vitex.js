'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, DDoSProtection, AuthenticationError, RateLimitExceeded, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class vitex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'vitex',
            'name': 'ViteX',
            'countries': [ 'MT' ],
            'rateLimit': 500,
            'certified': true,
            // new metainfo interface
            'has': {
                // public api
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchOHLCV': true,
                'fetchBidsAsks': true,
                'fetchTime': true,
                // private api
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchMyTrades': false,
                'fetchOpenOrders': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
            },
            'timeframes': {
                '1m': 'minute',
                '30m': 'minute30',
                '1h': 'hour',
                '6h': 'hour6',
                '12h': 'hour12',
                '1d': 'day',
                '1w': 'week',
            },
            'urls': {
                'logo': 'https://growth-1257137467.cos.ap-chengdu.myqcloud.com/vitex.png',
                'test': {
                    'public': 'https://api.vitex.net/test/api/v2',
                    'private': 'https://api.vitex.net/test/api/v2',
                },
                'api': {
                    'web': 'https://vitex.net/',
                    'public': 'https://api.vitex.net/api/v2',
                    'private': 'https://api.vitex.net/api/v2',
                },
                'www': 'https://vitex.net/',
                'doc': [
                    'https://vite.wiki/dex/',
                ],
                'api_management': 'https://vite.wiki/dex/api/dex-apis.html',
                'fees': 'https://vite.wiki/dex/#transaction-fee-model',
            },
            'api': {
                'public': {
                    'get': [
                        'ping',
                        'time',
                        'depth',
                        'trades',
                        'trades/all',
                        'klines',
                        'markets',
                        'ticker/24hr',
                        'ticker/price',
                        'ticker/bookTicker',
                        'balance',
                        'order',
                        'orders',
                        'orders/open',
                        'deposit-withdraw',
                    ],
                },
                'private': {
                    'post': [
                        'order',
                        'order/test',
                    ],
                    'delete': [
                        'order',
                        'allOpenOrders',
                    ],
                },
            },
            'requiredCredentials': {
                'walletAddress': true,
                'privateKey': false,
                'apiKey': true,
                'secret': true,
            },
            // exchange-specific options
            'options': {
                'fetchTradesMethod': 'publicGetAggTrades', // publicGetTrades, publicGetHistoricalTrades
                'fetchTickersMethod': 'publicGetTicker24hr',
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (only)
                'defaultLimitOrderType': 'limit', // or 'limit_maker'
                'hasAlreadyAuthenticatedSuccessfully': false,
                'warnOnFetchOpenOrdersWithoutSymbol': true,
                'recvWindow': 5 * 1000, // 2 sec, vitex default
                'timeDifference': 0, // the difference between system clock and Binance clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'parseOrderToPrecision': false, // force amounts and costs in parseOrder to precision
                'newOrderRespType': {
                    'market': 'FULL', // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
                    'limit': 'RESULT', // we change it from 'ACK' by default to 'RESULT'
                },
            },
            'exceptions': {
                '1002': AuthenticationError,
                '1006': InvalidOrder,
                'Account has insufficient balance for requested action.': InsufficientFunds,
                'Rest API trading is not enabled.': ExchangeNotAvailable,
                "You don't have permission.": PermissionDenied, // {"msg":"You don't have permission.","success":false}
                'Market is closed.': ExchangeNotAvailable, // {"code":-1013,"msg":"Market is closed."}
                '1': ExchangeNotAvailable, // {"code":-1000,"msg":"An unknown error occured while processing the request."}
                '1001': RateLimitExceeded, // {"code":-1003,"msg":"Too much request weight used, current limit is 1200 request weight per 1 MINUTE. Please use the websocket for live updates to avoid polling the API."}
                '1007': InvalidOrder, // createOrder -> 'invalid quantity'/'invalid price'/MIN_NOTIONAL
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async fetchMarkets (params = {}) {
        // {
        //     "code": 0,
        //     "msg": "ok",
        //     "data": [
        //       {
        //         "symbol": "ANKR-000_BTC-000",
        //         "tradeTokenSymbol": "ANKR-000",
        //         "quoteTokenSymbol": "BTC-000",
        //         "tradeToken": "tti_2f875c97d3a51b66a59c4411",
        //         "quoteToken": "tti_b90c9baffffc9dae58d1f33f",
        //         "pricePrecision": 8,
        //         "quantityPrecision": 2
        //       }
        //     ]
        //   }
        const response = await this.publicGetMarkets ();
        const markets = this.safeValue (response, 'data');
        const result = [];
        const limits = {
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
        };
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.formatSymbolToken (market['tradeTokenSymbol']);
            const quoteId = this.formatSymbolToken (market['quoteTokenSymbol']);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'base': market['quantityPrecision'],
                'quote': market['pricePrecision'],
            };
            result.push ({
                'symbol': symbol,
                'precision': precision,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'limits': limits,
                'id': id,
                'info': market,
                'active': true,
            });
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbols': market['id'],
        };
        const query = this.omit (request, 'symbols');
        const response = await this.publicGetTicker24hr (this.extend (query, params));
        const data = this.safeValue (response, 'data');
        const dataLength = data.length;
        if (dataLength) {
            return this.parseTicker (data[0], market);
        } else {
            throw new ExchangeError (this.id + ' fetch ticker failed ' + this.json (response));
        }
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tm = [];
        if (symbols !== undefined) {
            for (let i = 0; i < symbols.length; i++) {
                const market = this.market (symbols[i]);
                const symbol = market['id'];
                tm.push (symbol);
            }
        }
        const request = {
            'symbols': tm.join (','),
        };
        const query = this.omit (request, 'symbols');
        const response = await this.publicGetTicker24hr (this.extend (query, params));
        const data = this.safeValue (response, 'data');
        return this.parseTickers (data, symbols);
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    parseTicker (ticker, market = undefined) {
        // {
        //     "symbol": "VTT-000_VITE",
        //     "tradeTokenSymbol": "VTT-000",
        //     "quoteTokenSymbol": "VITE",
        //     "tradeToken": "tti_2736f320d7ed1c2871af1d9d",
        //     "quoteToken": "tti_5649544520544f4b454e6e40",
        //     "openPrice": "1.00000000",
        //     "prevClosePrice": "0.25410000",
        //     "closePrice": "1.00000000",
        //     "priceChange": "0.00000000",
        //     "priceChangePercent": 0,
        //     "highPrice": "1.00000000",
        //     "lowPrice": "1.00000000",
        //     "quantity": "100.00000000",
        //     "amount": "100.00000000",
        //     "pricePrecision": 8,
        //     "quantityPrecision": 8,
        //     "openTime": null,
        //     "closeTime": null
        // }
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'closePrice');
        return {
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeFloat (ticker, 'highPrice'),
            'low': this.safeFloat (ticker, 'lowPrice'),
            'bid': this.safeFloat (ticker, 'bidPrice'),
            'bidVolume': this.safeFloat (ticker, 'bidQuantity'),
            'ask': this.safeFloat (ticker, 'askPrice'),
            'askVolume': this.safeFloat (ticker, 'askQuantity'),
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'openPrice'),
            'close': last,
            'last': last,
            'previousClose': this.safeFloat (ticker, 'prevClosePrice'), // previous day close
            'change': this.safeFloat (ticker, 'priceChange'),
            'percentage': this.safeFloat (ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'quantity'),
            'quoteVolume': this.safeFloat (ticker, 'amount'),
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        // {
        //     "code": 0,
        //     "msg": "ok",
        //     "data": {
        //       "timestamp": 1588170501936,
        //       "asks": [
        //         [
        //             "0.025750",
        //             "0.0323"
        //         ],
        //         [
        //             "0.026117",
        //             "0.0031"
        //         ]
        //       ],
        //       "bids": [
        //         [
        //             "0.024820",
        //             "0.0004"
        //         ],
        //         [
        //             "0.024161",
        //             "0.0042"
        //         ]
        //       ]
        //     }
        //   }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        const depth = this.safeValue (response, 'data');
        const orderbook = this.parseOrderBook (depth);
        orderbook['nonce'] = this.safeInteger (depth, 'timestamp');
        return orderbook;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 500, maximum = 1000
        }
        params['symbol'] = market['id'];
        const response = await this.publicGetTradesAll (this.extend (request, params));
        // {
        //     "code": 0,
        //     "msg": "ok",
        //     "data": {
        //       "height": null,
        //       "trade": [
        //         {
        //           "tradeId": "d3e7529de05e94d247a4e7ef58a56b069b059d52",
        //           "symbol": "VX_ETH-000",
        //           "tradeTokenSymbol": "VX",
        //           "quoteTokenSymbol": "ETH-000",
        //           "tradeToken": "tti_564954455820434f494e69b5",
        //           "quoteToken": "tti_06822f8d096ecdf9356b666c",
        //           "price": "0.000228",
        //           "quantity": "0.0001",
        //           "amount": "0.00000002",
        //           "time": 1586944732,
        //           "side": 0,
        //           "buyFee": "0.00000000",
        //           "sellFee": "0.00000000",
        //           "blockHeight": 260
        //         }
        //       ],
        //       "total": -1
        //     }
        //   }
        const data = this.safeValue (response, 'data');
        const trade = this.safeValue (data, 'trade');
        return this.parseTrades (trade, market, since, limit);
    }

    parseTrade (trade, market) {
        const timestamp = this.safeTimestamp (trade, 'time');
        const price = this.safeFloat (trade, 'price');
        const cost = this.safeFloat (trade, 'amount');
        const sideTmp = this.safeInteger (trade, 'side');
        const id = this.safeString (trade, 'tradeId');
        const side = sideTmp === 1 ? 'sell' : 'buy';
        const buyFee = this.safeFloat (trade, 'buyFee');
        const sellFee = this.safeFloat (trade, 'sellFee');
        const amount = this.safeFloat (trade, 'quantity');
        const quoteTokenSymbol = this.safeString (trade, 'quoteTokenSymbol');
        const fee = {
            'cost': undefined,
            'currency': this.formatSymbolToken (quoteTokenSymbol),
        };
        if (side === 'buy') {
            fee['cost'] = buyFee;
        } else {
            fee['cost'] = sellFee;
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
            'order': id,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        // {
        //     "code": 0,
        //     "msg": "ok",
        //     "data": {
        //       "t": [
        //         1554207060
        //       ],
        //       "c": [
        //         1.0
        //       ],
        //       "p": [
        //         1.0
        //       ],
        //       "h": [
        //         1.0
        //       ],
        //       "l": [
        //         1.0
        //       ],
        //       "v": [
        //         12970.8
        //       ]
        //     }
        // }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default == max == 500
        }
        const response = await this.publicGetKlines (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        const result = [];
        const tArr = this.safeValue (data, 't');
        const oArr = this.safeValue (data, 'p');
        const hArr = this.safeValue (data, 'h');
        const lArr = this.safeValue (data, 'l');
        const cArr = this.safeValue (data, 'c');
        const vArr = this.safeValue (data, 'v');
        for (let i = 0; i < tArr.length; i++) {
            const temp = [tArr[i], oArr[i], hArr[i], lArr[i], cArr[i], vArr[i]];
            result.push (temp);
        }
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1591478520000,
        //         "0.02501300",
        //         "0.02501800",
        //         "0.02500000",
        //         "0.02500000",
        //         "22.19000000",
        //         1591478579999,
        //         "0.55490906",
        //         40,
        //         "10.92900000",
        //         "0.27336462",
        //         "0"
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeFloat (ohlcv, 1),
            this.safeFloat (ohlcv, 2),
            this.safeFloat (ohlcv, 3),
            this.safeFloat (ohlcv, 4),
            this.safeFloat (ohlcv, 5),
        ];
    }

    async fetchBidsAsks (symbol, params = {}) {
        // {
        //     "code": 0,
        //     "msg": "ok",
        //     "data": {
        //       "symbol": "BTC-000_USDT-000",
        //       "bidPrice": "7600.0000",
        //       "bidQuantity": "0.7039",
        //       "askPrice": "7725.0000",
        //       "askQuantity": "0.0001",
        //       "height": null
        //     }
        // }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTickerBookTicker (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseTicker (data, market);
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        return this.safeInteger (response, 'data');
    }

    async loadTimeDifference () {
        const serverTime = await this.fetchTime ();
        const after = this.milliseconds ();
        this.options['timeDifference'] = after - serverTime;
        return this.options['timeDifference'];
    }

    formatSymbolToken (symbolToken) {
        const token = symbolToken.split ('-')[0];
        return token;
    }

    async fetchBalance (params = {}) {
        const request = {
            'address': this.walletAddress,
        };
        const response = await this.publicGetBalance (this.extend (request, params));
        // "code": 0,
        // "msg": "ok",
        // "data": {
        // "VX": {
        //     "available": "5398.580707487965882436",
        //     "locked": "0.000000000000000000"
        // },
        // "BTC-000": {
        //     "available": "0.01509304",
        //     "locked": "0.00000000"
        // },
        // "VITE": {
        //     "available": "13083.730397906646329982",
        //     "locked": "0.000000000000000000"
        // },
        // "ETH-000": {
        //     "available": "0.622110664756355392",
        //     "locked": "0.000000000000000000"
        // },
        // "USDT-000": {
        //     "available": "76.926307",
        //     "locked": "0.000000"
        // }
        // }
        const result = {
            'info': response,
        };
        const balances = this.safeValue (response, 'data');
        const keys = Object.keys (balances);
        for (let i = 0; i < keys.length; i++) {
            const currency = keys[i];
            const balance = balances[currency];
            const code = this.formatSymbolToken (this.safeCurrencyCode (currency));
            result[code] = {
                'free': this.safeFloat (balance, 'available'),
                'used': this.safeFloat (balance, 'locked'),
            };
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            '3': 'open',
            '5': 'open',
            '4': 'closed',
            '7': 'canceled',
            '8': 'canceled',
            '6': 'canceling',
            '9': 'failed',
            '10': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        // {
        //     "code": 0,
        //     "msg": "ok",
        //     "data": {
        //       "address": "vite_228f578d58842437fb52104b25750aa84a6f8558b6d9e970b1",
        //       "orderId": "0dfbafac33fbccf5c65d44d5d80ca0b73bc82ae0bbbe8a4d0ce536d340738e93",
        //       "symbol": "VX_ETH-000",
        //       "tradeTokenSymbol": "VX",
        //       "quoteTokenSymbol": "ETH-000",
        //       "tradeToken": "tti_564954455820434f494e69b5",
        //       "quoteToken": "tti_06822f8d096ecdf9356b666c",
        //       "side": 1,
        //       "price": "0.000228",
        //       "quantity": "100.0001",
        //       "amount": "0.02280002",
        //       "executedQuantity": "100.0000",
        //       "executedAmount": "0.022800",
        //       "executedPercent": "0.999999",
        //       "executedAvgPrice": "0.000228",
        //       "fee": "0.000045",
        //       "status": 5,
        //       "type": 0,
        //       "createTime": 1586941713
        //     }
        //   }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = undefined;
        const marketId = this.safeString (order, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeTimestamp (order, 'createTime');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'quantity');
        const filled = this.safeFloat (order, 'executedQuantity');
        const quoteTokenSymbol = this.safeString (order, 'quoteTokenSymbol');
        let remaining = undefined;
        const cost = this.safeFloat (order, 'amount');
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
                remaining = Math.max (remaining, 0.0);
            }
        }
        const id = this.safeString (order, 'orderId');
        const type = 'limit';
        const sideTmp = this.safeInteger (order, 'side');
        const side = sideTmp === 1 ? 'sell' : 'buy';
        const fee = {
            'cost': this.safeFloat (order, 'fee'),
            'currency': this.formatSymbolToken (quoteTokenSymbol),
        };
        return {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        };
    }

    parseOrderSide (side) {
        const sides = {
            'buy': 0,
            'sell': 1,
        };
        return this.safeInteger (sides, side, side);
    }

    parseCreateOrder (order, market = undefined) {
        let symbol = undefined;
        const marketId = this.safeString (order, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': order,
            'symbol': symbol,
            'orderId': this.safeValue (order, 'orderId'),
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        // {
        //     "code": 0,
        //     "msg": "ok",
        //     "data": {
        //       "symbol": "VX_ETH-000",
        //       "orderId": "c35dd9868ea761b22fc76ba35cf8357db212736ecb56399523126c515113f19d",
        //       "status": 1
        //     }
        // }
        await this.loadMarkets ();
        const market = this.market (symbol);
        // the next 5 lines are added to support for testing orders
        let method = 'privatePostOrder';
        const test = this.safeValue (params, 'test', false);
        if (test) {
            method += 'Test';
            params = this.omit (params, 'test');
        }
        const request = {
            'symbol': market['id'],
            'price': price,
            'amount': amount,
            'side': this.parseOrderSide (side),
        };
        const response = await this[method] (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseCreateOrder (data, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a orderId argument');
        }
        const request = {
            'address': this.walletAddress,
            'orderId': id,
        };
        const response = await this.publicGetOrder (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, undefined);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'address': this.walletAddress,
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        const orders = this.safeValue (data, 'order');
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a symbol argument');
        }
        let market = undefined;
        const request = {};
        market = this.market (symbol);
        request['symbol'] = market['id'];
        request['address'] = this.walletAddress;
        const response = await this.publicGetOrdersOpen (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        const orders = this.safeValue (data, 'order');
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        // {
        //     "code": 0,
        //     "msg": "ok",
        //     "data": {
        //       "symbol": "VX_ETH-000",
        //       "orderId": "c35dd9868ea761b22fc76ba35cf8357db212736ecb56399523126c515113f19d",
        //       "cancelRequest": "2d015156738071709b11e8d6fa5a700c2fd30b28d53aa6160fd2ac2e573c7595",
        //       "status": 6
        //     }
        //   }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a orderId argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'orderId': this.id,
        };
        const method = 'privateDeleteOrder';
        const response = await this[method] (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseCreateOrder (data);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        const tokenId = this.safeString (params, 'tokenId');
        const request = {
            'address': this.walletAddress,
        };
        if (tokenId === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a tokenId in params');
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.publicGetDepositWithdraw (this.extend (request, params));
        //
        // "data": {
        //     "record": [
        //       {
        //         "time": 1555057049,
        //         "tokenSymbol": "VITE",
        //         "amount": "1000000.00000000",
        //         "type": 1
        //       }
        //     ],
        //     "total": 16
        //   }
        const data = this.safeValue (response, 'data');
        const records = this.safeValue (data, 'record');
        const transactions = [];
        for (let i = 0; i < records.length; i++) {
            if (records[i]['type'] === 1) {
                transactions.push (records['i']);
            }
        }
        return this.parseTransactions (transactions, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        const tokenId = this.safeString (params, 'tokenId');
        const request = {
            'address': this.walletAddress,
        };
        if (tokenId === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a tokenId in params');
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.publicGetDepositWithdraw (this.extend (request, params));
        //
        // "data": {
        //     "record": [
        //       {
        //         "time": 1555057049,
        //         "tokenSymbol": "VITE",
        //         "amount": "1000000.00000000",
        //         "type": 1
        //       }
        //     ],
        //     "total": 16
        //   }
        const data = this.safeValue (response, 'data');
        const records = this.safeValue (data, 'record');
        const transactions = [];
        for (let i = 0; i < records.length; i++) {
            if (records[i]['type'] === 2) {
                transactions.push (records['i']);
            }
        }
        return this.parseTransactions (transactions, currency, since, limit);
    }

    parseTransactionStatusByType (status, type = undefined) {
        if (type === undefined) {
            return status;
        }
        const statuses = {
            'deposit': {
                '0': 'pending',
                '1': 'ok',
            },
            'withdrawal': {
                '0': 'pending', // Email Sent
                '1': 'canceled', // Cancelled (different from 1 = ok in deposits)
                '2': 'pending', // Awaiting Approval
                '3': 'failed', // Rejected
                '4': 'pending', // Processing
                '5': 'failed', // Failure
                '6': 'ok', // Completed
            },
        };
        return (status in statuses[type]) ? statuses[type][status] : status;
    }

    parseTransaction (transaction, currency = undefined) {
        // "data": {
        //     "record": [
        //       {
        //         "time": 1555057049,
        //         "tokenSymbol": "VITE",
        //         "amount": "1000000.00000000",
        //         "type": 1
        //       }
        //     ],
        //     "total": 16
        //   }
        const currencyId = this.formatSymbolToken (this.safeString (transaction, 'tokenSymbol'));
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeTimestamp (transaction, 'time');
        const tmType = this.safeInteger (transaction, 'type');
        const type = tmType === 1 ? 'deposit' : 'withdrawal';
        const status = 'ok';
        const amount = this.safeFloat (transaction, 'amount');
        return {
            'info': transaction,
            'id': undefined,
            'txid': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': this.walletAddress,
            'tag': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        url += '/' + path;
        if ((api === 'private')) {
            this.checkRequiredCredentials ();
            let query = this.urlencodeWithArrayRepeat (this.extend ({
                'timestamp': this.nonce (),
                'key': this.apiKey,
            }, params));
            const signature = this.hmac (this.encode (query), this.encode (this.secret));
            query += '&' + 'signature=' + signature;
            if ((method === 'GET') || (method === 'DELETE')) {
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            const query = this.urlencodeWithArrayRepeat (params);
            if ((method === 'GET') || (method === 'DELETE')) {
                url += '?' + query;
            } else {
                body = query;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if ((code === 418) || (code === 429)) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        // error response in a form: { "code": -1013, "msg": "Invalid quantity." }
        // following block cointains legacy checks against message patterns in "msg" property
        // will switch "code" checks eventually, when we know all of them
        if (code >= 400) {
            if (body.indexOf ('Price * QTY is zero or less') >= 0) {
                throw new InvalidOrder (this.id + ' order cost = amount * price is zero or less ' + body);
            }
            if (body.indexOf ('LOT_SIZE') >= 0) {
                throw new InvalidOrder (this.id + ' order amount should be evenly divisible by lot size ' + body);
            }
            if (body.indexOf ('PRICE_FILTER') >= 0) {
                throw new InvalidOrder (this.id + ' order price is invalid, i.e. exceeds allowed price precision, exceeds min price or max price limits or is invalid float value in general, use this.priceToPrecision (symbol, amount) ' + body);
            }
        }
        if (body.length > 0) {
            if (body[0] === '{') {
                // check success value for wapi endpoints
                // response in format {'msg': 'The coin does not exist.', 'code': 0}
                const message = this.safeString (response, 'msg');
                const error = this.safeInteger (response, 'code');
                if (message !== undefined && error !== 0) {
                    this.throwExactlyMatchedException (this.exceptions, message, this.id + ' ' + message);
                }
                if (error !== 0) {
                    // a workaround for {"code": 1003,"msg":"Invalid API-key, IP, or permissions for action."}
                    // despite that their message is very confusing, it is raised by Binance
                    // on a temporary ban, the API key is valid, but disabled for a while
                    if ((error === 1003) && this.options['hasAlreadyAuthenticatedSuccessfully']) {
                        throw new DDoSProtection (this.id + ' temporary banned: ' + body);
                    }
                    const feedback = this.id + ' ' + url + ' ' + body;
                    this.throwExactlyMatchedException (this.exceptions, error, feedback);
                    throw new ExchangeError (feedback);
                }
            }
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        // a workaround for {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
        if ((api === 'private')) {
            this.options['hasAlreadyAuthenticatedSuccessfully'] = true;
        }
        return response;
    }
};
