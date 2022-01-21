'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, BadRequest, ArgumentsRequired, NotSupported } = require ('./base/errors');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class trbinance extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'trbinance',
            'name': 'Binance TR',
            'countries': [ 'TR' ],
            'rateLimit': 1500,
            'version': 'v1',
            'has': {
                'CORS': undefined,
                'publicAPI': true,
                'privateAPI': false,
                'fetchBalance': false,
                'fetchCurrencies': false,
                'fetchMarkets': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchOHLCV': true,
                'fetchOrders': true,
                'fetchOrder': true,
                'fetchOrderTrades': true,
                'fetchMyTrades': true,
                'fetchAccountSpot': true,
                'fetchAccountSpotAsset': true,
                'fetchWithdrawals': true,
                'fetchDeposits': true,
                'fetchDepositAddress': true,
                'createOrder': true,
                'cancelOrder': true,
                'createOcoOrder': true,
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
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://www.trbinance.com/open/',
                    'public3': 'https://api.binance.me/api/v3/',
                    'private': 'https://www.trbinance.com/open/',
                },
                'www': 'https://www.trbinance.com',
                'doc': [
                    'https://www.trbinance.com/apidocs/',
                ],
                'fees': [
                    'https://www.trbinance.com/en/fees/schedule',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'common/time',
                        'common/symbols',
                        'market/depth',
                        'trades',
                        'aggTrades',
                        'klines',
                        'ticker/24hr',
                    ],
                },
                'private': {
                    'get': [
                        'orders/detail',
                        'orders',
                        'account/spot',
                        'account/spot/asset',
                        'orders/trades',
                        'withdraws',
                        'deposits',
                        'deposits/address',
                    ],
                    'post': [
                        'orders',
                        'orders/cancel',
                        'orders/oco',
                        'withdraws',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
            },
            // exchange-specific options
            'options': {
                'fetchCurrencies': true,
                'defaultTimeInForce': 'GTC',
                'defaultType': 'spot',
                'hasAlreadyAuthenticatedSuccessfully': false,
                'warnOnFetchOpenOrdersWithoutSymbol': true,
                'fetchPositions': 'positionRisk', // or 'account'
                'recvWindow': 5 * 1000, // 5 sec, binance default
                'timeDifference': 0, // the difference between system clock and Binance clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
            },
            'commonCurrencies': {
            },
            'exceptions': {
                'exact': {
                    '3700': AuthenticationError,
                },
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetCommonTime (params);
        //
        //      {
        //          "code":0,
        //          "msg":"Success",
        //          "data":null,
        //          "timestamp":1641318638443
        //      }
        //
        return this.safeInteger (response, 'timestamp');
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetCommonSymbols (params);
        //
        //       {
        //            "code":0,
        //            "msg":"Success",
        //            "data":{
        //                "list":[
        //                    {
        //                        "type":1,
        //                        "symbol":"ADA_TRY",
        //                        "baseAsset":"ADA",
        //                        "basePrecision":8,
        //                        "quoteAsset":"TRY",
        //                        "quotePrecision":8,
        //                        "filters":[
        //                            {"filterType":"PRICE_FILTER","minPrice":"0.01000000","maxPrice":"10000.00000000","tickSize":"0.01000000","applyToMarket":false},
        //                            {"filterType":"PERCENT_PRICE","multiplierUp":5,"multiplierDown":0.2,"avgPriceMins":"5","applyToMarket":false},
        //                            {"filterType":"LOT_SIZE","minQty":"0.10000000","maxQty":"9222449.00000000","stepSize":"0.10000000","applyToMarket":false},
        //                            {"filterType":"MIN_NOTIONAL","avgPriceMins":"5","minNotional":"10.00000000","applyToMarket":true},
        //                            {"filterType":"ICEBERG_PARTS","applyToMarket":false,"limit":"10"},
        //                            {"filterType":"MARKET_LOT_SIZE","minQty":"0.00000000","maxQty":"191987.27930555","stepSize":"0.00000000","applyToMarket":false},
        //                            {"filterType":"MAX_NUM_ORDERS","applyToMarket":false},
        //                            {"filterType":"MAX_NUM_ALGO_ORDERS","applyToMarket":false,"maxNumAlgoOrders":"5"}
        //                        ],
        //                        "orderTypes":[
        //                            "LIMIT",
        //                            "LIMIT_MAKER",
        //                            "MARKET",
        //                            "STOP_LOSS_LIMIT",
        //                            "TAKE_PROFIT_LIMIT"
        //                            ],
        //                        "icebergEnable":1,
        //                        "ocoEnable":1,
        //                        "spotTradingEnable":1,
        //                        "marginTradingEnable":0,
        //                        "permissions":["SPOT"]
        //                    },
        //                ]
        //            }
        //        }
        //
        const result = [];
        const data = this.safeValue (response, 'data', {});
        const list = this.safeValue (data, 'list', []);
        for (let i = 0; i < list.length; i++) {
            const market = list[i];
            // const type = this.safeInteger(market, 'type'); // Important to see endpoint for this market
            const id = this.safeString (market, 'symbol');
            const filters = this.safeValue (market, 'filters', []);
            const filtersByType = this.indexBy (filters, 'filterType');
            let minPrice = undefined;
            let maxPrice = undefined;
            let minQty = undefined;
            let maxQty = undefined;
            if ('PRICE_FILTER' in filtersByType) {
                const filter = this.safeValue (filtersByType, 'PRICE_FILTER', {});
                minPrice = this.safeValue (filter, 'minPrice');
                maxPrice = this.safeValue (filter, 'maxPrice');
            }
            if ('LOT_SIZE' in filtersByType) {
                const filter = this.safeValue (filtersByType, 'LOT_SIZE', {});
                minQty = this.safeValue (filter, 'minQty');
                maxQty = this.safeValue (filter, 'maxQty');
            }
            const permissions = this.safeValue (market, 'permissions');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let spotPermission = false;
            let marginPermission = false;
            for (let j = 0; j < permissions.length; j++) {
                if (permissions[j] === 'SPOT') {
                    spotPermission = true;
                } else if (permissions[j] === 'MARGIN') {
                    marginPermission = true;
                }
            }
            let marginEnable = undefined;
            let spotEnable = undefined;
            if (this.safeInteger (market, 'marginTradingEnable') === 1) {
                marginEnable = true;
            } else {
                marginEnable = false;
            }
            if (this.safeInteger (market, 'spotTradingEnable') === 1) {
                spotEnable = true;
            } else {
                spotEnable = false;
            }
            const symbol = base + '/' + quote;
            const precision = {
                'price': this.safeInteger (market, 'quotePrecision'),
                'amount': this.safeInteger (market, 'basePrecision'),
            };
            result.push (this.extend (this.fees['trading'], {
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': 'spot',
                'spot': spotPermission,
                'margin': marginPermission && marginEnable,
                'active': spotEnable,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.parseNumber (minQty),
                        'max': this.parseNumber (maxQty),
                    },
                    'price': {
                        'min': this.parseNumber (minPrice),
                        'max': this.parseNumber (maxPrice),
                    },
                    'cost': {
                        'min': undefined, // this.parseNumber (minQty * minPrice),
                        'max': undefined, // this.parseNumber (maxQty * maxPrice),
                    },
                },
            }));
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        if ((limit !== 5) && (limit !== 10) && (limit !== 20) && (limit !== 50) && (limit !== 100) && (limit !== 500) && limit !== undefined) {
            throw new BadRequest (this.id + ' fetchOrderBook() limit argument must be undefined, 5, 10, 20, 50, 100 or 500, default is 100');
        } else if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketDepth (this.extend (request, params));
        //
        //    {
        //        "code":0,
        //        "msg":"Success",
        //        "data":{
        //            "lastUpdateId":16083754974,
        //            "bids":[
        //                ["46203.21000000","1.75479000"],
        //                ["46203.03000000","0.06255000"],
        //                ["46202.47000000","0.00170000"],
        //                ["46202.46000000","0.01378000"],
        //                ["46202.30000000","0.01634000"]
        //            ],
        //            "asks":[
        //                ["46203.22000000","0.01611000"],
        //                ["46203.24000000","0.00498000"],
        //                ["46203.26000000","0.01136000"],
        //                ["46205.59000000","0.00216000"],
        //                ["46205.84000000","0.08579000"]
        //            ]
        //        },
        //        "timestamp":1641383770656
        //    }
        //
        const result = this.safeValue (response, 'data', {});
        const timestamp = this.safeInteger (response, 'timestamp', {});
        const orderBook = this.parseOrderBook (result, symbol, timestamp, 'bids', 'asks', 0, 1);
        orderBook['nonce'] = this.safeInteger (result, 'lastUpdateId', {});
        return orderBook;
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger2 (trade, 'T', 'time');
        const price = this.safeString2 (trade, 'p', 'price');
        const amount = this.safeString2 (trade, 'q', 'qty');
        const cost = this.safeString2 (trade, 'quoteQty', 'baseQty');  // inverse futures
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        let id = this.safeString2 (trade, 't', 'a');
        id = this.safeString2 (trade, 'id', 'tradeId', id);
        let side = undefined;
        let fee = undefined;
        let takerOrMaker = undefined;
        const orderId = this.safeString (trade, 'orderId');
        if ('m' in trade) {
            if (trade['m']) {
                side = 'sell';
            } else {
                side = 'buy';
            }
        } else if ('isBuyerMaker' in trade) {
            if (trade['isBuyerMaker']) {
                side = 'sell';
            } else {
                side = 'buy';
            }
        } else if ('side' in trade) {
            side = this.safeStringLower (trade, 'side');
        } else {
            if ('isBuyer' in trade) {
                if (trade['isBuyer']) {
                    side = 'buy';
                } else {
                    side = 'sell';
                }
            }
        }
        if ('commission' in trade) {
            fee = {
                'cost': this.safeString (trade, 'commission'),
                'currency': this.safeCurrencyCode (this.safeString (trade, 'commissionAsset')),
            };
        }
        if ('m' in trade) {
            if (trade['m']) {
                takerOrMaker = 'maker';
            } else {
                takerOrMaker = 'taker';
            }
        }
        if ('maker' in trade) {
            if (trade['maker']) {
                takerOrMaker = 'maker';
            } else {
                takerOrMaker = 'taker';
            }
        }
        if ('isMaker' in trade) {
            if (trade['isMaker']) {
                takerOrMaker = 'maker';
            } else {
                takerOrMaker = 'taker';
            }
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['baseId'] + market['quoteId'], // Symbol needs to be without underscore for the endpoint
        };
        const query = this.omit (params, 'type');
        if (limit !== undefined) {
            request['limit'] = limit; // default: 500
        }
        const response = await this.publicGetAggTrades (this.extend (request, query));
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // binancetr docs say that the default limit is 500, max=1500 for futures and max=1000 for spot markets
        // the reality is that the time range wider than 500 candles doestn't work
        const defaultLimit = 500;
        const maxLimit = 1500;
        const price = this.safeString (params, 'price');
        params = this.omit (params, 'price');
        limit = (limit === undefined) ? defaultLimit : Math.min (limit, maxLimit);
        const request = {
            'interval': this.timeframes[timeframe],
            'limit': limit,
        };
        if (price === 'index') {
            request['pair'] = market['id'];   // Index price takes this argument instead of symbol
        } else {
            // request['symbol'] = market['id'];
            request['symbol'] = market['baseId'] + market['quoteId']; // Symbol needs to be without underscore for the endpoint
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.publicGetKlines (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'closeTime');
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeNumber (ticker, 'lastPrice');
        const isCoinm = ('baseVolume' in ticker);
        let baseVolume = undefined;
        let quoteVolume = undefined;
        if (isCoinm) {
            baseVolume = this.safeNumber (ticker, 'baseVolume');
            quoteVolume = this.safeNumber (ticker, 'volume');
        } else {
            baseVolume = this.safeNumber (ticker, 'volume');
            quoteVolume = this.safeNumber (ticker, 'quoteVolume');
        }
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'highPrice'),
            'low': this.safeNumber (ticker, 'lowPrice'),
            'bid': this.safeNumber (ticker, 'bidPrice'),
            'bidVolume': this.safeNumber (ticker, 'bidQty'),
            'ask': this.safeNumber (ticker, 'askPrice'),
            'askVolume': this.safeNumber (ticker, 'askQty'),
            'vwap': this.safeNumber (ticker, 'weightedAvgPrice'),
            'open': this.safeNumber (ticker, 'openPrice'),
            'close': last,
            'last': last,
            'previousClose': this.safeNumber (ticker, 'prevClosePrice'), // previous day close
            'change': this.safeNumber (ticker, 'priceChange'),
            'percentage': this.safeNumber (ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'].replace ('_', ''),
        };
        const response = await this.publicGetTicker24hr (this.extend (request, params));
        if (Array.isArray (response)) {
            const firstTicker = this.safeValue (response, 0, {});
            return this.parseTicker (firstTicker, market);
        }
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const query = this.omit (params, 'type');
        const response = await this.publicGetTicker24hr (query);
        return this.parseTickers (response, symbols);
    }

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PENDING_CANCEL': 'canceling', // currently unused
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const filled = this.safeString (order, 'executedQty', '0');
        let timestamp = undefined;
        let lastTradeTimestamp = undefined;
        if ('createTime' in order) {
            timestamp = this.safeInteger (order, 'createTime');
        } else if ('transactTime' in order) {
            timestamp = this.safeInteger (order, 'transactTime');
        } else if ('updateTime' in order) {
            if (status === 'open') {
                if (Precise.stringGt (filled, '0')) {
                    lastTradeTimestamp = this.safeInteger (order, 'updateTime');
                } else {
                    timestamp = this.safeInteger (order, 'updateTime');
                }
            }
        }
        const average = this.safeString (order, 'avgPrice');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'origQty');
        // - Spot/Margin market: cummulativeQuoteQty
        let cost = this.safeString2 (order, 'cummulativeQuoteQty', 'cumQuote');
        cost = this.safeString (order, 'cumBase', cost);
        const id = this.safeString (order, 'orderId');
        let type = this.safeStringLower (order, 'type');
        const side = this.safeStringLower (order, 'side');
        const fills = this.safeValue (order, 'fills', []);
        const clientOrderId = this.safeString (order, 'clientId');
        const timeInForce = this.safeString (order, 'timeInForce');
        const postOnly = (type === 'limit_maker') || (timeInForce === 'GTX');
        if (type === 'limit_maker') {
            type = 'limit';
        }
        const stopPriceString = this.safeString (order, 'stopPrice');
        const stopPrice = this.parseNumber (this.omitZero (stopPriceString));
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': fills,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeValue2 (params, 'origClientOrderId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        const query = this.omit (params, [ 'type', 'clientOrderId', 'origClientOrderId' ]);
        const response = await this.privateGetOrdersDetail (this.extend (request, query));
        // const response = {
        //     'orderId': 4,
        //     'orderListId': -1,
        //     'clientId': 'myOrder1',
        //     'symbol': 'BTC_USDT',
        //     'side': 1,
        //     'type': 1,
        //     'price': 1,
        //     'status': 0,
        //     'origQty': 10.88,
        //     'origQuoteQty': 0,
        //     'executedQty': 0,
        //     'executedPrice': 0,
        //     'executedQuoteQty': 0,
        //     'createTime': 1550130502000,
        // };
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        // const defaultType = this.safeString2 (this.options, 'fetchOrders', 'defaultType', 'spot');
        // const type = this.safeString (params, 'type', defaultType);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const query = this.omit (params, 'type');
        const response = await this.privateGetOrders (this.extend (request, query));
        // const response = [
        //     {
        //         'orderId': '21',
        //         'clientId': 'uuid',
        //         'symbol': 'ADA_USDT',
        //         'symbolType': 1,
        //         'side': 1,
        //         'type': 1,
        //         'price': '0.1',
        //         'origQty': '10',
        //         'origQuoteQty': '1',
        //         'executedQty': '0',
        //         'executedPrice': '0',
        //         'executedQuoteQty': '0',
        //         'timeInForce': 1,
        //         'stopPrice': '0.0000000000000000',
        //         'icebergQty': '0.0000000000000000',
        //         'status': 0,
        //         'isWorking': 0,
        //         'createTime': 1572692016811,
        //     },
        // ];
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrderTrades (id = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const type = this.safeString (params, 'type', market['type']);
        params = this.omit (params, 'type');
        if (type !== 'spot') {
            throw new NotSupported (this.id + ' fetchOrderTrades() supports spot markets only');
        }
        const request = {
            'orderId': id,
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const type = this.safeString (params, 'type', market['type']);
        params = this.omit (params, type);
        // const method = 'privateGetOrdersDetail';
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrdersTrades (this.extend (request, params));
        // const response = [
        //     {
        //         'tradeId': '3',
        //         'orderId': '2',
        //         'symbol': 'ADA_USDT',
        //         'price': '0.04398',
        //         'qty': '250',
        //         'quoteQty': '10.995',
        //         'commission': '0.25',
        //         'commissionAsset': 'ADA',
        //         'isBuyer': 1,
        //         'isMaker': 0,
        //         'isBestMatch': 1,
        //         'time': '1572920872276',
        //     },
        // ];
        return this.parseTrades (response, market, since, limit);
    }

    parseAccountSpot (response, type = undefined) {
        const result = {
            'info': response,
        };
        let timestamp = undefined;
        if ((type === 'spot') || (type === 'margin')) {
            timestamp = this.safeInteger (response, 'timestamp');
            // const balances = this.safeValue2 (response, 'data', 'accountAssets', []);
            const balances = response.data.accountAssets;
            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i];
                const currencyId = this.safeString (balance, 'asset');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeString (balance, 'free');
                account['used'] = this.safeString (balance, 'locked');
                result[code] = account;
            }
        } else {
            let balances = response;
            if (!Array.isArray (response)) {
                balances = this.safeValue (response, 'assets', []);
            }
            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i];
                const currencyId = this.safeString (balance, 'asset');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeString (balance, 'availableBalance');
                account['used'] = this.safeString (balance, 'initialMargin');
                account['total'] = this.safeString2 (balance, 'marginBalance', 'balance');
                result[code] = account;
            }
        }
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        return this.safeBalance (result);
    }

    async fetchAccountSpot (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchAccountSpot', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const response = await this.privateGetAccountSpot (query);
        // const response = {
        //     'code': 0,
        //     'msg': 'success',
        //     'data': {
        //         'makerCommission': '10.00000000',
        //         'takerCommission': '10.00000000',
        //         'buyerCommission': '0.00000000',
        //         'sellerCommission': '0.00000000',
        //         'canTrade': 1,
        //         'canWithdraw': 1,
        //         'canDeposit': 1,
        //         'accountAssets': [
        //             {
        //                 'asset': 'ADA',
        //                 'free': '272.5550000000000000',
        //                 'locked': '3.0000000000000000',
        //             },
        //         ],
        //     },
        //     'timestamp': 1572514387348,
        // };
        return this.parseAccountSpot (response, type);
    }

    async fetchAccountSpotAsset (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchAccountSpotAsset', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        // const method = 'privateGetAccountSpot';
        const query = this.omit (params, 'type');
        const response = await this.privateGetAccountSpotAsset (query);
        // const response = {
        //     'asset': 'ADA',
        //     'free': '272.5550000000000000',
        //     'locked': '3.0000000000000000',
        // };
        return this.parseAccountSpot (response, type);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'rejected': 'failed',
            'confirmed': 'ok',
            'anulled': 'canceled',
            'retained': 'canceled',
            'pending_confirmation': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeString (transaction, 'id');
        const timestamp = transaction['createTime'];
        // const currencyId = this.safeString (transaction, 'currency');
        const code = transaction['network'];
        const amount = parseFloat (transaction['amount']);
        const fee = parseFloat (transaction['fee']);
        const feeCurrency = transaction['network'];
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const type = ('deposit_data' in transaction) ? 'deposit' : 'withdrawal';
        const address = transaction['address'];
        const txid = transaction['txId'];
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': transaction['network'],
            'address': address,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'fee': {
                'cost': fee,
                'rate': feeCurrency,
            },
        };
    }

    async fetchWithdrawals (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.privateGetwithdraws (this.extend (request, params));
        // const withdrawals = this.safeValue (response, 'withdrawals');
        const currency = undefined;
        // const response = [
        //     {
        //         'id': 1,
        //         'clientId': '1',
        //         'asset': 'BTC',
        //         'network': 'BTC',
        //         'address': '1G58aoKLVd1vHkv7wi6R2rKUrjuk4ZRtY3',
        //         'amount': '0.001',
        //         'fee': '0.0005',
        //         'txId': '',
        //         'status': 4,
        //         'createTime': 1572359825000,
        //     },
        // ];
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchDeposits (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = undefined;
        const request = {};
        const response = await this.privateGetDeposits (this.extend (request, params));
        // const deposits = this.safeValue (response, 'deposits');
        // const response = [
        //     {
        //         'id': 1,
        //         'asset': 'BTC',
        //         'network': 'BTC',
        //         'address': '2',
        //         'addressTag': '2',
        //         'txId': '1',
        //         'amount': '1.000000000000000000000000000000',
        //         'status': 1,
        //         'insertTime': '0',
        //     },
        // ];
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchDepositAddress (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // const currency = undefined;
        const request = {};
        const response = await this.privateGetDepositAddress (this.extend (request, params));
        // const deposits = this.safeValue (response, 'deposits');
        // const response = {
        //     'address': '0x6915f16f8791d0a1cc2bf47c13a6b2a92000504b',
        //     'addressTag': '1231212',
        //     'asset': 'BNB',
        // };
        // return this.parseTransactions (response, currency, since, limit);
        return response;
    }

    async createOrder (symbol, type, side, quantity = undefined, price = undefined, stopPrice = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        side = (side === 'buy') ? '1' : '0';
        const request = {
            'symbol': symbol,
            'side': side,
            'type': type.toString (),
        };
        if (type === 1) {
            request['price'] = this.priceToPrecision (symbol, price);
            request['quantity'] = this.amountToPrecision (symbol, quantity);
        } else if (type === 2) {
            // request['price'] = this.priceToPrecision (symbol, price);
            request['quantity'] = this.amountToPrecision (symbol, quantity);
        } else if (type === 4) {
            request['price'] = this.priceToPrecision (symbol, price);
            request['quantity'] = this.amountToPrecision (symbol, quantity);
            request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
        } else {
            request['price'] = this.priceToPrecision (symbol, price);
            request['quantity'] = this.amountToPrecision (symbol, quantity);
            request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        // const order = this.safeValue (response, 'order');
        // const response = {
        //     'orderId': '4',
        //     'createTime': 1550130502385,
        //     'requestData': request,
        // };
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': parseInt (id),
        };
        const response = await this.privatePostOrderCancel (this.extend (request, params));
        const order = this.safeValue (response, 'order');
        return this.parseOrder (order);
        // const response = {
        //     'orderId': 4,
        //     'orderListId': -1,
        //     'clientId': 'myOrder1',
        //     'symbol': 'BTC_USDT',
        //     'side': 1,
        //     'type': 1,
        //     'price': 1,
        //     'status': 0,
        //     'origQty': 10.88,
        //     'origQuoteQty': 0,
        //     'executedQty': 0,
        //     'executedPrice': 0,
        //     'executedQuoteQty': 0,
        //     'createTime': 1550130502000,
        // };
        // return this.parseOrder (response);
    }

    async withdraw (code, amount, address = undefined, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const request = {
            'asset': code,
            'amount': amount,
            'address': address,
        };
        const response = await this.privatePostWithdraws (this.extend (request, params));
        // const result = this.safeValue (response, 'result', {});
        // const response = {
        //     'withdrawId': '12',
        // };
        const id = this.safeString (response, 'withdrawId');
        return {
            'info': response,
            'id': id,
        };
    }

    async createOcoOrder (symbol, side, quantity, price, stopPrice, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' createOcoOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        side = (side === 'buy') ? '1' : '0';
        const request = {
            'symbol': symbol,
            'side': side,
            'quantity': this.amountToPrecision (symbol, quantity),
            'price': this.priceToPrecision (symbol, price),
            'stopPrice': this.priceToPrecision (symbol, stopPrice),
        };
        const response = await this.privatePostOrderOco (this.extend (request, params));
        // const order = this.safeValue (response, 'order');
        // const response = {
        //     'orderId': '4',
        //     'createTime': 1550130502385,
        //     'requestData': request,
        // };
        return this.parseOrder (response);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + this.version + '/' + path;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let query = undefined;
            const recvWindow = this.safeInteger (this.options, 'recvWindow', 5000);
            query = this.urlencode (this.extend ({
                'timestamp': this.nonce (),
                'recvWindow': recvWindow,
            }, params));
            const signature = this.hmac (this.encode (query), this.encode (this.secret));
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method === 'GET') || (method === 'DELETE') || (api === 'wapi')) {
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
            if (api === 'public' && path === 'aggTrades') {
                url = this.urls['api']['public3'] + path;
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            }
            if (api === 'public' && path === 'klines') {
                url = this.urls['api']['public3'] + path;
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            }
            if (api === 'public' && path === 'ticker/24hr') {
                url = this.urls['api']['public3'] + path;
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined, config = {}, context = {}) {
        const response = await this.fetch2 (path, api, method, params, headers, body, config, context);
        // a workaround for {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
        if ((api === 'private')) {
            this.options['hasAlreadyAuthenticatedSuccessfully'] = true;
        }
        return response;
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return '1'; // return;
        } else {
            // checks against error codes
            const error = this.safeString (response, 'code');
            if (error === '3700') {
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
