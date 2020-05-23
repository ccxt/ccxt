'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError, NotSupported, RateLimitExceeded } = require ('ccxt/js/base/errors');
const { ArrayCache } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class bitmex extends ccxt.bitmex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://www.bitmex.com/realtime',
                },
            },
            'versions': {
                'ws': '0.2.0',
            },
            'options': {
                'watchOrderBookLevel': 'orderBookL2', // 'orderBookL2' = L2 full order book, 'orderBookL2_25' = L2 top 25, 'orderBook10' L3 top 10
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                    },
                    'broad': {
                        'Rate limit exceeded': RateLimitExceeded,
                    },
                },
            },
        });
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'instrument';
        const messageHash = name + ':' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [
                messageHash,
            ],
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    handleTicker (client, message) {
        //
        //     {
        //         table: 'instrument',
        //         action: 'partial',
        //         keys: [ 'symbol' ],
        //         types: {
        //             symbol: 'symbol',
        //             rootSymbol: 'symbol',
        //             state: 'symbol',
        //             typ: 'symbol',
        //             listing: 'timestamp',
        //             front: 'timestamp',
        //             expiry: 'timestamp',
        //             settle: 'timestamp',
        //             relistInterval: 'timespan',
        //             inverseLeg: 'symbol',
        //             sellLeg: 'symbol',
        //             buyLeg: 'symbol',
        //             optionStrikePcnt: 'float',
        //             optionStrikeRound: 'float',
        //             optionStrikePrice: 'float',
        //             optionMultiplier: 'float',
        //             positionCurrency: 'symbol',
        //             underlying: 'symbol',
        //             quoteCurrency: 'symbol',
        //             underlyingSymbol: 'symbol',
        //             reference: 'symbol',
        //             referenceSymbol: 'symbol',
        //             calcInterval: 'timespan',
        //             publishInterval: 'timespan',
        //             publishTime: 'timespan',
        //             maxOrderQty: 'long',
        //             maxPrice: 'float',
        //             lotSize: 'long',
        //             tickSize: 'float',
        //             multiplier: 'long',
        //             settlCurrency: 'symbol',
        //             underlyingToPositionMultiplier: 'long',
        //             underlyingToSettleMultiplier: 'long',
        //             quoteToSettleMultiplier: 'long',
        //             isQuanto: 'boolean',
        //             isInverse: 'boolean',
        //             initMargin: 'float',
        //             maintMargin: 'float',
        //             riskLimit: 'long',
        //             riskStep: 'long',
        //             limit: 'float',
        //             capped: 'boolean',
        //             taxed: 'boolean',
        //             deleverage: 'boolean',
        //             makerFee: 'float',
        //             takerFee: 'float',
        //             settlementFee: 'float',
        //             insuranceFee: 'float',
        //             fundingBaseSymbol: 'symbol',
        //             fundingQuoteSymbol: 'symbol',
        //             fundingPremiumSymbol: 'symbol',
        //             fundingTimestamp: 'timestamp',
        //             fundingInterval: 'timespan',
        //             fundingRate: 'float',
        //             indicativeFundingRate: 'float',
        //             rebalanceTimestamp: 'timestamp',
        //             rebalanceInterval: 'timespan',
        //             openingTimestamp: 'timestamp',
        //             closingTimestamp: 'timestamp',
        //             sessionInterval: 'timespan',
        //             prevClosePrice: 'float',
        //             limitDownPrice: 'float',
        //             limitUpPrice: 'float',
        //             bankruptLimitDownPrice: 'float',
        //             bankruptLimitUpPrice: 'float',
        //             prevTotalVolume: 'long',
        //             totalVolume: 'long',
        //             volume: 'long',
        //             volume24h: 'long',
        //             prevTotalTurnover: 'long',
        //             totalTurnover: 'long',
        //             turnover: 'long',
        //             turnover24h: 'long',
        //             homeNotional24h: 'float',
        //             foreignNotional24h: 'float',
        //             prevPrice24h: 'float',
        //             vwap: 'float',
        //             highPrice: 'float',
        //             lowPrice: 'float',
        //             lastPrice: 'float',
        //             lastPriceProtected: 'float',
        //             lastTickDirection: 'symbol',
        //             lastChangePcnt: 'float',
        //             bidPrice: 'float',
        //             midPrice: 'float',
        //             askPrice: 'float',
        //             impactBidPrice: 'float',
        //             impactMidPrice: 'float',
        //             impactAskPrice: 'float',
        //             hasLiquidity: 'boolean',
        //             openInterest: 'long',
        //             openValue: 'long',
        //             fairMethod: 'symbol',
        //             fairBasisRate: 'float',
        //             fairBasis: 'float',
        //             fairPrice: 'float',
        //             markMethod: 'symbol',
        //             markPrice: 'float',
        //             indicativeTaxRate: 'float',
        //             indicativeSettlePrice: 'float',
        //             optionUnderlyingPrice: 'float',
        //             settledPrice: 'float',
        //             timestamp: 'timestamp'
        //         },
        //         foreignKeys: {
        //             inverseLeg: 'instrument',
        //             sellLeg: 'instrument',
        //             buyLeg: 'instrument'
        //         },
        //         attributes: { symbol: 'unique' },
        //         filter: { symbol: 'XBTUSD' },
        //         data: [
        //             {
        //                 symbol: 'XBTUSD',
        //                 rootSymbol: 'XBT',
        //                 state: 'Open',
        //                 typ: 'FFWCSX',
        //                 listing: '2016-05-13T12:00:00.000Z',
        //                 front: '2016-05-13T12:00:00.000Z',
        //                 expiry: null,
        //                 settle: null,
        //                 relistInterval: null,
        //                 inverseLeg: '',
        //                 sellLeg: '',
        //                 buyLeg: '',
        //                 optionStrikePcnt: null,
        //                 optionStrikeRound: null,
        //                 optionStrikePrice: null,
        //                 optionMultiplier: null,
        //                 positionCurrency: 'USD',
        //                 underlying: 'XBT',
        //                 quoteCurrency: 'USD',
        //                 underlyingSymbol: 'XBT=',
        //                 reference: 'BMEX',
        //                 referenceSymbol: '.BXBT',
        //                 calcInterval: null,
        //                 publishInterval: null,
        //                 publishTime: null,
        //                 maxOrderQty: 10000000,
        //                 maxPrice: 1000000,
        //                 lotSize: 1,
        //                 tickSize: 0.5,
        //                 multiplier: -100000000,
        //                 settlCurrency: 'XBt',
        //                 underlyingToPositionMultiplier: null,
        //                 underlyingToSettleMultiplier: -100000000,
        //                 quoteToSettleMultiplier: null,
        //                 isQuanto: false,
        //                 isInverse: true,
        //                 initMargin: 0.01,
        //                 maintMargin: 0.005,
        //                 riskLimit: 20000000000,
        //                 riskStep: 10000000000,
        //                 limit: null,
        //                 capped: false,
        //                 taxed: true,
        //                 deleverage: true,
        //                 makerFee: -0.00025,
        //                 takerFee: 0.00075,
        //                 settlementFee: 0,
        //                 insuranceFee: 0,
        //                 fundingBaseSymbol: '.XBTBON8H',
        //                 fundingQuoteSymbol: '.USDBON8H',
        //                 fundingPremiumSymbol: '.XBTUSDPI8H',
        //                 fundingTimestamp: '2020-01-29T12:00:00.000Z',
        //                 fundingInterval: '2000-01-01T08:00:00.000Z',
        //                 fundingRate: 0.000597,
        //                 indicativeFundingRate: 0.000652,
        //                 rebalanceTimestamp: null,
        //                 rebalanceInterval: null,
        //                 openingTimestamp: '2020-01-29T11:00:00.000Z',
        //                 closingTimestamp: '2020-01-29T12:00:00.000Z',
        //                 sessionInterval: '2000-01-01T01:00:00.000Z',
        //                 prevClosePrice: 9063.96,
        //                 limitDownPrice: null,
        //                 limitUpPrice: null,
        //                 bankruptLimitDownPrice: null,
        //                 bankruptLimitUpPrice: null,
        //                 prevTotalVolume: 1989881049026,
        //                 totalVolume: 1990196740950,
        //                 volume: 315691924,
        //                 volume24h: 4491824765,
        //                 prevTotalTurnover: 27865497128425564,
        //                 totalTurnover: 27868891594857150,
        //                 turnover: 3394466431587,
        //                 turnover24h: 48863390064843,
        //                 homeNotional24h: 488633.9006484273,
        //                 foreignNotional24h: 4491824765,
        //                 prevPrice24h: 9091,
        //                 vwap: 9192.8663,
        //                 highPrice: 9440,
        //                 lowPrice: 8886,
        //                 lastPrice: 9287,
        //                 lastPriceProtected: 9287,
        //                 lastTickDirection: 'PlusTick',
        //                 lastChangePcnt: 0.0216,
        //                 bidPrice: 9286,
        //                 midPrice: 9286.25,
        //                 askPrice: 9286.5,
        //                 impactBidPrice: 9285.9133,
        //                 impactMidPrice: 9286.75,
        //                 impactAskPrice: 9287.6382,
        //                 hasLiquidity: true,
        //                 openInterest: 967826984,
        //                 openValue: 10432207060536,
        //                 fairMethod: 'FundingRate',
        //                 fairBasisRate: 0.6537149999999999,
        //                 fairBasis: 0.33,
        //                 fairPrice: 9277.2,
        //                 markMethod: 'FairPrice',
        //                 markPrice: 9277.2,
        //                 indicativeTaxRate: 0,
        //                 indicativeSettlePrice: 9276.87,
        //                 optionUnderlyingPrice: null,
        //                 settledPrice: null,
        //                 timestamp: '2020-01-29T11:31:37.114Z'
        //             }
        //         ]
        //     }
        //
        const table = this.safeString (message, 'table');
        const data = this.safeValue (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const update = data[i];
            const marketId = this.safeValue (update, 'symbol');
            if (marketId in this.markets_by_id) {
                const market = this.markets_by_id[marketId];
                const symbol = market['symbol'];
                const messageHash = table + ':' + marketId;
                let ticker = this.safeValue (this.tickers, symbol, {});
                const info = this.safeValue (ticker, 'info', {});
                ticker = this.parseTicker (this.extend (info, update), market);
                this.tickers[symbol] = ticker;
                client.resolve (ticker, messageHash);
            }
        }
        return message;
    }

    async watchBalance (params = {}) {
        await this.loadMarkets ();
        throw new NotSupported (this.id + ' watchBalance() not implemented yet');
    }

    handleTrades (client, message) {
        //
        // initial snapshot
        //
        //     {
        //         table: 'trade',
        //         action: 'partial',
        //         keys: [],
        //         types: {
        //             timestamp: 'timestamp',
        //             symbol: 'symbol',
        //             side: 'symbol',
        //             size: 'long',
        //             price: 'float',
        //             tickDirection: 'symbol',
        //             trdMatchID: 'guid',
        //             grossValue: 'long',
        //             homeNotional: 'float',
        //             foreignNotional: 'float'
        //         },
        //         foreignKeys: { symbol: 'instrument', side: 'side' },
        //         attributes: { timestamp: 'sorted', symbol: 'grouped' },
        //         filter: { symbol: 'XBTUSD' },
        //         data: [
        //             {
        //                 timestamp: '2020-01-30T17:03:07.854Z',
        //                 symbol: 'XBTUSD',
        //                 side: 'Buy',
        //                 size: 15000,
        //                 price: 9378,
        //                 tickDirection: 'ZeroPlusTick',
        //                 trdMatchID: '5b426e7f-83d1-2c80-295d-ee995b8ceb4a',
        //                 grossValue: 159945000,
        //                 homeNotional: 1.59945,
        //                 foreignNotional: 15000
        //             }
        //         ]
        //     }
        //
        // updates
        //
        //     {
        //         table: 'trade',
        //         action: 'insert',
        //         data: [
        //             {
        //                 timestamp: '2020-01-30T17:31:40.160Z',
        //                 symbol: 'XBTUSD',
        //                 side: 'Sell',
        //                 size: 37412,
        //                 price: 9521.5,
        //                 tickDirection: 'ZeroMinusTick',
        //                 trdMatchID: 'a4bfc6bc-6cf1-1a11-622e-270eef8ca5c7',
        //                 grossValue: 392938236,
        //                 homeNotional: 3.92938236,
        //                 foreignNotional: 37412
        //             }
        //         ]
        //     }
        //
        const table = 'trade';
        const data = this.safeValue (message, 'data', []);
        const dataByMarketIds = this.groupBy (data, 'symbol');
        const marketIds = Object.keys (dataByMarketIds);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            if (marketId in this.markets_by_id) {
                const market = this.markets_by_id[marketId];
                const messageHash = table + ':' + marketId;
                const symbol = market['symbol'];
                const trades = this.parseTrades (dataByMarketIds[marketId], market);
                let stored = this.safeValue (this.trades, symbol);
                if (stored === undefined) {
                    const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                    stored = new ArrayCache (limit);
                    this.trades[symbol] = stored;
                }
                for (let j = 0; j < trades.length; j++) {
                    stored.append (trades[j]);
                }
                client.resolve (stored, messageHash);
            }
        }
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const table = 'trade';
        const messageHash = table + ':' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [
                messageHash,
            ],
        };
        const future = this.watch (url, messageHash, this.extend (request, params), messageHash);
        return await this.after (future, this.filterBySinceLimit, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        let table = undefined;
        if (limit === undefined) {
            table = this.safeString (this.options, 'watchOrderBookLevel', 'orderBookL2');
        } else if (limit === 25) {
            table = 'orderBookL2_25';
        } else if (limit === 10) {
            table = 'orderBookL10';
        } else {
            throw new ExchangeError (this.id + ' watchOrderBook limit argument must be undefined (L2), 25 (L2) or 10 (L3)');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = table + ':' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [
                messageHash,
            ],
        };
        const future = this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const table = 'tradeBin' + this.timeframes[timeframe];
        const messageHash = table + ':' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [
                messageHash,
            ],
        };
        const future = this.watch (url, messageHash, this.extend (request, params), messageHash);
        return await this.after (future, this.filterBySinceLimit, since, limit, 0, true);
    }

    findTimeframe (timeframe) {
        const keys = Object.keys (this.timeframes);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (this.timeframes[key] === timeframe) {
                return key;
            }
        }
        return undefined;
    }

    handleOHLCV (client, message) {
        //
        //     {
        //         table: 'tradeBin1m',
        //         action: 'partial',
        //         keys: [],
        //         types: {
        //             timestamp: 'timestamp',
        //             symbol: 'symbol',
        //             open: 'float',
        //             high: 'float',
        //             low: 'float',
        //             close: 'float',
        //             trades: 'long',
        //             volume: 'long',
        //             vwap: 'float',
        //             lastSize: 'long',
        //             turnover: 'long',
        //             homeNotional: 'float',
        //             foreignNotional: 'float'
        //         },
        //         foreignKeys: { symbol: 'instrument' },
        //         attributes: { timestamp: 'sorted', symbol: 'grouped' },
        //         filter: { symbol: 'XBTUSD' },
        //         data: [
        //             {
        //                 timestamp: '2020-02-03T01:13:00.000Z',
        //                 symbol: 'XBTUSD',
        //                 open: 9395,
        //                 high: 9395.5,
        //                 low: 9394.5,
        //                 close: 9395,
        //                 trades: 221,
        //                 volume: 839204,
        //                 vwap: 9394.9643,
        //                 lastSize: 1874,
        //                 turnover: 8932641535,
        //                 homeNotional: 89.32641534999999,
        //                 foreignNotional: 839204
        //             }
        //         ]
        //     }
        //
        //
        //     {
        //         table: 'tradeBin1m',
        //         action: 'insert',
        //         data: [
        //             {
        //                 timestamp: '2020-02-03T18:28:00.000Z',
        //                 symbol: 'XBTUSD',
        //                 open: 9256,
        //                 high: 9256.5,
        //                 low: 9256,
        //                 close: 9256,
        //                 trades: 29,
        //                 volume: 79057,
        //                 vwap: 9256.688,
        //                 lastSize: 100,
        //                 turnover: 854077082,
        //                 homeNotional: 8.540770820000002,
        //                 foreignNotional: 79057
        //             }
        //         ]
        //     }
        //
        // --------------------------------------------------------------------
        const table = this.safeString (message, 'table');
        const interval = table.replace ('tradeBin', '');
        const timeframe = this.findTimeframe (interval);
        const duration = this.parseTimeframe (timeframe);
        const candles = this.safeValue (message, 'data', []);
        const results = {};
        for (let i = 0; i < candles.length; i++) {
            const candle = candles[i];
            const marketId = this.safeString (candle, 'symbol');
            if (marketId in this.markets_by_id) {
                const market = this.markets_by_id[marketId];
                const symbol = market['symbol'];
                const messageHash = table + ':' + market['id'];
                const result = [
                    this.parse8601 (this.safeString (candle, 'timestamp')) - duration * 1000,
                    this.safeFloat (candle, 'open'),
                    this.safeFloat (candle, 'high'),
                    this.safeFloat (candle, 'low'),
                    this.safeFloat (candle, 'close'),
                    this.safeFloat (candle, 'volume'),
                ];
                this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
                let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
                if (stored === undefined) {
                    const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                    stored = new ArrayCache (limit);
                    this.ohlcvs[symbol][timeframe] = stored;
                }
                const length = stored.length;
                if (length && result[0] === stored[length - 1][0]) {
                    stored[length - 1] = result;
                } else {
                    stored.append (result);
                }
                results[messageHash] = stored;
            }
        }
        const messageHashes = Object.keys (results);
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            client.resolve (results[messageHash], messageHash);
        }
    }

    async watchHeartbeat (params = {}) {
        await this.loadMarkets ();
        const event = 'heartbeat';
        const url = this.urls['api']['ws'];
        return await this.watch (url, event);
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo bitmex signMessage not implemented yet
        return message;
    }

    handleOrderBook (client, message) {
        //
        // first snapshot
        //
        //     {
        //         table: 'orderBookL2',
        //         action: 'partial',
        //         keys: [ 'symbol', 'id', 'side' ],
        //         types: {
        //             symbol: 'symbol',
        //             id: 'long',
        //             side: 'symbol',
        //             size: 'long',
        //             price: 'float'
        //         },
        //         foreignKeys: { symbol: 'instrument', side: 'side' },
        //         attributes: { symbol: 'parted', id: 'sorted' },
        //         filter: { symbol: 'XBTUSD' },
        //         data: [
        //             { symbol: 'XBTUSD', id: 8700000100, side: 'Sell', size: 1, price: 999999 },
        //             { symbol: 'XBTUSD', id: 8700000200, side: 'Sell', size: 3, price: 999998 },
        //             { symbol: 'XBTUSD', id: 8716991250, side: 'Sell', size: 26, price: 830087.5 },
        //             { symbol: 'XBTUSD', id: 8728701950, side: 'Sell', size: 1720, price: 712980.5 },
        //         ]
        //     }
        //
        // subsequent updates
        //
        //     {
        //         table: 'orderBookL2',
        //         action: 'update',
        //         data: [
        //             { symbol: 'XBTUSD', id: 8799285100, side: 'Sell', size: 70590 },
        //             { symbol: 'XBTUSD', id: 8799285550, side: 'Sell', size: 217652 },
        //             { symbol: 'XBTUSD', id: 8799288950, side: 'Buy', size: 47552 },
        //             { symbol: 'XBTUSD', id: 8799289250, side: 'Buy', size: 78217 },
        //         ]
        //     }
        //
        const action = this.safeString (message, 'action');
        const table = this.safeString (message, 'table');
        const data = this.safeValue (message, 'data', []);
        // if it's an initial snapshot
        if (action === 'partial') {
            const filter = this.safeValue (message, 'filter', {});
            const marketId = this.safeValue (filter, 'symbol');
            if (marketId in this.markets_by_id) {
                const market = this.markets_by_id[marketId];
                const symbol = market['symbol'];
                if (table === 'orderBookL2') {
                    this.orderbooks[symbol] = this.indexedOrderBook ();
                } else if (table === 'orderBookL2_25') {
                    this.orderbooks[symbol] = this.indexedOrderBook ({}, 25);
                } else if (table === 'orderBook10') {
                    this.orderbooks[symbol] = this.indexedOrderBook ({}, 10);
                }
                const orderbook = this.orderbooks[symbol];
                for (let i = 0; i < data.length; i++) {
                    const price = this.safeFloat (data[i], 'price');
                    const size = this.safeFloat (data[i], 'size');
                    const id = this.safeString (data[i], 'id');
                    let side = this.safeString (data[i], 'side');
                    side = (side === 'Buy') ? 'bids' : 'asks';
                    const bookside = orderbook[side];
                    bookside.store (price, size, id);
                }
                const messageHash = table + ':' + marketId;
                client.resolve (orderbook, messageHash);
            }
        } else {
            const numUpdatesByMarketId = {};
            for (let i = 0; i < data.length; i++) {
                const marketId = this.safeValue (data[i], 'symbol');
                if (marketId in this.markets_by_id) {
                    if (!(marketId in numUpdatesByMarketId)) {
                        numUpdatesByMarketId[marketId] = 0;
                    }
                    numUpdatesByMarketId[marketId] = this.sum (numUpdatesByMarketId, 1);
                    const market = this.markets_by_id[marketId];
                    const symbol = market['symbol'];
                    const orderbook = this.orderbooks[symbol];
                    const price = this.safeFloat (data[i], 'price');
                    const size = this.safeFloat (data[i], 'size', 0);
                    const id = this.safeString (data[i], 'id');
                    let side = this.safeString (data[i], 'side');
                    side = (side === 'Buy') ? 'bids' : 'asks';
                    const bookside = orderbook[side];
                    bookside.store (price, size, id);
                }
            }
            const marketIds = Object.keys (numUpdatesByMarketId);
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const messageHash = table + ':' + marketId;
                const market = this.markets_by_id[marketId];
                const symbol = market['symbol'];
                const orderbook = this.orderbooks[symbol];
                client.resolve (orderbook, messageHash);
            }
        }
    }

    handleSystemStatus (client, message) {
        //
        // todo answer the question whether handleSystemStatus should be renamed
        // and unified as handleStatus for any usage pattern that
        // involves system status and maintenance updates
        //
        //     {
        //         info: 'Welcome to the BitMEX Realtime API.',
        //         version: '2019-11-22T00:24:37.000Z',
        //         timestamp: '2019-11-23T09:02:27.771Z',
        //         docs: 'https://www.bitmex.com/app/wsAPI',
        //         limit: { remaining: 39 }
        //     }
        //
        return message;
    }

    handleSubscriptionStatus (client, message) {
        //
        //     {
        //         success: true,
        //         subscribe: 'orderBookL2:XBTUSD',
        //         request: { op: 'subscribe', args: [ 'orderBookL2:XBTUSD' ] }
        //     }
        //
        return message;
    }

    handleErrorMessage (client, message) {
        //
        // generic error format
        //
        //     { "error": errorMessage }
        //
        // examples
        //
        //     {
        //         "status": 429,
        //         "error": "Rate limit exceeded, retry in 1 seconds.",
        //         "meta": { "retryAfter": 1 },
        //         "request": { "op": "subscribe", "args": "orderBook" },
        //     }
        //
        //     { "error": "Rate limit exceeded, retry in 29 seconds." }
        //
        const error = this.safeValue (message, 'error');
        if (error !== undefined) {
            const request = this.safeValue (message, 'request', {});
            const args = this.safeString (request, 'args', []);
            const numArgs = args.length;
            if (numArgs > 0) {
                const messageHash = args[0];
                const broad = this.exceptions['ws']['broad'];
                const broadKey = this.findBroadlyMatchedKey (broad, error);
                let exception = undefined;
                if (broadKey === undefined) {
                    exception = new ExchangeError (error);
                } else {
                    exception = new broad[broadKey] (error);
                }
                client.reject (exception, messageHash);
                return false;
            }
        }
        return true;
    }

    handleMessage (client, message) {
        //
        //     {
        //         info: 'Welcome to the BitMEX Realtime API.',
        //         version: '2019-11-22T00:24:37.000Z',
        //         timestamp: '2019-11-23T09:04:42.569Z',
        //         docs: 'https://www.bitmex.com/app/wsAPI',
        //         limit: { remaining: 38 }
        //     }
        //
        //     {
        //         success: true,
        //         subscribe: 'orderBookL2:XBTUSD',
        //         request: { op: 'subscribe', args: [ 'orderBookL2:XBTUSD' ] }
        //     }
        //
        //     {
        //         table: 'orderBookL2',
        //         action: 'update',
        //         data: [
        //             { symbol: 'XBTUSD', id: 8799284800, side: 'Sell', size: 721000 },
        //             { symbol: 'XBTUSD', id: 8799285100, side: 'Sell', size: 70590 },
        //             { symbol: 'XBTUSD', id: 8799285550, side: 'Sell', size: 217652 },
        //             { symbol: 'XBTUSD', id: 8799285850, side: 'Sell', size: 105578 },
        //             { symbol: 'XBTUSD', id: 8799286350, side: 'Sell', size: 172093 },
        //             { symbol: 'XBTUSD', id: 8799286650, side: 'Sell', size: 201125 },
        //             { symbol: 'XBTUSD', id: 8799288950, side: 'Buy', size: 47552 },
        //             { symbol: 'XBTUSD', id: 8799289250, side: 'Buy', size: 78217 },
        //             { symbol: 'XBTUSD', id: 8799289700, side: 'Buy', size: 193677 },
        //             { symbol: 'XBTUSD', id: 8799290000, side: 'Buy', size: 818161 },
        //             { symbol: 'XBTUSD', id: 8799290500, side: 'Buy', size: 218806 },
        //             { symbol: 'XBTUSD', id: 8799290800, side: 'Buy', size: 102946 }
        //         ]
        //     }
        //
        if (this.handleErrorMessage (client, message)) {
            const table = this.safeString (message, 'table');
            const methods = {
                'orderBookL2': this.handleOrderBook,
                'orderBookL2_25': this.handleOrderBook,
                'orderBook10': this.handleOrderBook,
                'instrument': this.handleTicker,
                'trade': this.handleTrades,
                'tradeBin1m': this.handleOHLCV,
                'tradeBin5m': this.handleOHLCV,
                'tradeBin1h': this.handleOHLCV,
                'tradeBin1d': this.handleOHLCV,
            };
            const method = this.safeValue (methods, table);
            if (method === undefined) {
                return message;
            } else {
                return method.call (this, client, message);
            }
        }
    }
};
