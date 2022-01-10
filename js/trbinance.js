'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest } = require ('./base/errors');
// const { TRUNCATE, DECIMAL_PLACES, TICK_SIZE } = require ('./base/functions/number');
// const Precise = require ('./base/Precise');

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
                'fetchMarkets': true,
                'fetchOrderBook': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchOHLCV': true,
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
            'options': {
                'networks': {
                },
            },
            'commonCurrencies': {
            },
            'exceptions': {
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
        if ('isDustTrade' in trade) {
            return this.parseDustTrade (trade, market);
        }
        //
        // aggregate trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#compressedaggregate-trades-list
        //
        //     {
        //         "a": 26129,         // Aggregate tradeId
        //         "p": "0.01633102",  // Price
        //         "q": "4.70443515",  // Quantity
        //         "f": 27781,         // First tradeId
        //         "l": 27781,         // Last tradeId
        //         "T": 1498793709153, // Timestamp
        //         "m": true,          // Was the buyer the maker?
        //         "M": true           // Was the trade the best price match?
        //     }
        //
        // recent public trades and old public trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#recent-trades-list
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#old-trade-lookup-market_data
        //
        //     {
        //         "id": 28457,
        //         "price": "4.00000100",
        //         "qty": "12.00000000",
        //         "time": 1499865549590,
        //         "isBuyerMaker": true,
        //         "isBestMatch": true
        //     }
        //
        // private trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#account-trade-list-user_data
        //
        //     {
        //         "symbol": "BNBBTC",
        //         "id": 28457,
        //         "orderId": 100234,
        //         "price": "4.00000100",
        //         "qty": "12.00000000",
        //         "commission": "10.10000000",
        //         "commissionAsset": "BNB",
        //         "time": 1499865549590,
        //         "isBuyer": true,
        //         "isMaker": false,
        //         "isBestMatch": true
        //     }
        //
        // futures trades
        // https://binance-docs.github.io/apidocs/futures/en/#account-trade-list-user_data
        //
        //     {
        //       "accountId": 20,
        //       "buyer": False,
        //       "commission": "-0.07819010",
        //       "commissionAsset": "USDT",
        //       "counterPartyId": 653,
        //       "id": 698759,
        //       "maker": False,
        //       "orderId": 25851813,
        //       "price": "7819.01",
        //       "qty": "0.002",
        //       "quoteQty": "0.01563",
        //       "realizedPnl": "-0.91539999",
        //       "side": "SELL",
        //       "symbol": "BTCUSDT",
        //       "time": 1569514978020
        //     }
        //     {
        //       "symbol": "BTCUSDT",
        //       "id": 477128891,
        //       "orderId": 13809777875,
        //       "side": "SELL",
        //       "price": "38479.55",
        //       "qty": "0.001",
        //       "realizedPnl": "-0.00009534",
        //       "marginAsset": "USDT",
        //       "quoteQty": "38.47955",
        //       "commission": "-0.00076959",
        //       "commissionAsset": "USDT",
        //       "time": 1612733566708,
        //       "positionSide": "BOTH",
        //       "maker": true,
        //       "buyer": false
        //     }
        //
        // { respType: FULL }
        //
        //     {
        //       "price": "4000.00000000",
        //       "qty": "1.00000000",
        //       "commission": "4.00000000",
        //       "commissionAsset": "USDT",
        //       "tradeId": "1234",
        //     }
        //
        const timestamp = this.safeInteger2 (trade, 'T', 'time');
        const price = this.safeString2 (trade, 'p', 'price');
        const amount = this.safeString2 (trade, 'q', 'qty');
        const cost = this.safeString2 (trade, 'quoteQty', 'baseQty');  // inverse futures
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        let id = this.safeString2 (trade, 't', 'a');
        id = this.safeString2 (trade, 'id', 'tradeId', id);
        let side = undefined;
        const orderId = this.safeString (trade, 'orderId');
        if ('m' in trade) {
            // this is reversed intentionally
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
        let fee = undefined;
        if ('commission' in trade) {
            fee = {
                'cost': this.safeString (trade, 'commission'),
                'currency': this.safeCurrencyCode (this.safeString (trade, 'commissionAsset')),
            };
        }
        let takerOrMaker = undefined;
        if ('isBuyerMaker' in trade) {
            takerOrMaker = trade['isBuyerMaker'] ? 'maker' : 'taker';
        }
        // if ('maker' in trade) {
        //     takerOrMaker = trade['maker'] ? 'maker' : 'taker';
        // }
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
            // 'symbol': market['id'],
            'symbol': market['base'] + market['quote'], // Symbol needs to be without underscore for the endpoint
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default: 500
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //  [
        //    {"id":1211494273,"price":"46410.42000000","qty":"0.00084000","quoteQty":"38.98475280","time":1641391959076,"isBuyerMaker":false,"isBestMatch":true},
        //    {"id":1211494274,"price":"46410.42000000","qty":"0.00084000","quoteQty":"38.98475280","time":1641391959278,"isBuyerMaker":false,"isBestMatch":true},
        //    {"id":1211494275,"price":"46410.41000000","qty":"0.00061000","quoteQty":"28.31035010","time":1641391959289,"isBuyerMaker":true,"isBestMatch":true},
        //    {"id":1211494276,"price":"46410.42000000","qty":"0.00084000","quoteQty":"38.98475280","time":1641391959357,"isBuyerMaker":false,"isBestMatch":true},
        //    {"id":1211494277,"price":"46410.42000000","qty":"0.00084000","quoteQty":"38.98475280","time":1641391959483,"isBuyerMaker":false,"isBestMatch":true},
        //  ]
        //
        // const data = this.safeValue (response, []);
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
            request['symbol'] = market['base'] + market['quote']; // Symbol needs to be without underscore for the endpoint
        }
        if (since !== undefined) {
            request['startTime'] = since;
            if (market['inverse']) {
                if (since > 0) {
                    const duration = this.parseTimeframe (timeframe);
                    const endTime = this.sum (since, limit * duration * 1000 - 1);
                    const now = this.milliseconds ();
                    request['endTime'] = Math.min (now, endTime);
                }
            }
        }
        const method = 'publicGetKlines';
        const response = await this[method] (this.extend (request, params));
        //
        //     [
        //         [1591478520000,"0.02501300","0.02501800","0.02500000","0.02500000","22.19000000",1591478579999,"0.55490906",40,"10.92900000","0.27336462","0"],
        //         [1591478580000,"0.02499600","0.02500900","0.02499400","0.02500300","21.34700000",1591478639999,"0.53370468",24,"7.53800000","0.18850725","0"],
        //         [1591478640000,"0.02500800","0.02501100","0.02500300","0.02500800","154.14200000",1591478699999,"3.85405839",97,"5.32300000","0.13312641","0"],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + this.version + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (api === 'public' && path === 'trades') {
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
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return '1'; // return;
        }
    }
};
