'use strict';

var bitmex$1 = require('../bitmex.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class bitmex extends bitmex$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
            },
            'urls': {
                'test': {
                    'ws': 'wss://ws.testnet.bitmex.com/realtime',
                },
                'api': {
                    'ws': 'wss://ws.bitmex.com/realtime',
                },
            },
            // 'versions': {
            //     'ws': '0.2.0',
            // },
            'options': {
                'watchOrderBookLevel': 'orderBookL2',
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
            },
            'exceptions': {
                'ws': {
                    'exact': {},
                    'broad': {
                        'Rate limit exceeded': errors.RateLimitExceeded,
                    },
                },
            },
        });
    }
    async watchTicker(symbol, params = {}) {
        /**
         * @method
         * @name bitmex#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitmex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const name = 'instrument';
        const messageHash = name + ':' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [
                messageHash,
            ],
        };
        return await this.watch(url, messageHash, this.extend(request, params), messageHash);
    }
    handleTicker(client, message) {
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
        const table = this.safeString(message, 'table');
        const data = this.safeValue(message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const update = data[i];
            const marketId = this.safeValue(update, 'symbol');
            const market = this.safeMarket(marketId);
            const symbol = market['symbol'];
            const messageHash = table + ':' + marketId;
            let ticker = this.safeValue(this.tickers, symbol, {});
            const info = this.safeValue(ticker, 'info', {});
            ticker = this.parseTicker(this.extend(info, update), market);
            this.tickers[symbol] = ticker;
            client.resolve(ticker, messageHash);
        }
        return message;
    }
    async watchBalance(params = {}) {
        /**
         * @method
         * @name bitmex#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bitmex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets();
        await this.authenticate();
        const messageHash = 'margin';
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [
                messageHash,
            ],
        };
        return await this.watch(url, messageHash, this.extend(request, params), messageHash);
    }
    handleBalance(client, message) {
        //
        //     {
        //         table: 'margin',
        //         action: 'partial',
        //         keys: [ 'account' ],
        //         types: {
        //             account: 'long',
        //             currency: 'symbol',
        //             riskLimit: 'long',
        //             prevState: 'symbol',
        //             state: 'symbol',
        //             action: 'symbol',
        //             amount: 'long',
        //             pendingCredit: 'long',
        //             pendingDebit: 'long',
        //             confirmedDebit: 'long',
        //             prevRealisedPnl: 'long',
        //             prevUnrealisedPnl: 'long',
        //             grossComm: 'long',
        //             grossOpenCost: 'long',
        //             grossOpenPremium: 'long',
        //             grossExecCost: 'long',
        //             grossMarkValue: 'long',
        //             riskValue: 'long',
        //             taxableMargin: 'long',
        //             initMargin: 'long',
        //             maintMargin: 'long',
        //             sessionMargin: 'long',
        //             targetExcessMargin: 'long',
        //             varMargin: 'long',
        //             realisedPnl: 'long',
        //             unrealisedPnl: 'long',
        //             indicativeTax: 'long',
        //             unrealisedProfit: 'long',
        //             syntheticMargin: 'long',
        //             walletBalance: 'long',
        //             marginBalance: 'long',
        //             marginBalancePcnt: 'float',
        //             marginLeverage: 'float',
        //             marginUsedPcnt: 'float',
        //             excessMargin: 'long',
        //             excessMarginPcnt: 'float',
        //             availableMargin: 'long',
        //             withdrawableMargin: 'long',
        //             timestamp: 'timestamp',
        //             grossLastValue: 'long',
        //             commission: 'float'
        //         },
        //         foreignKeys: {},
        //         attributes: { account: 'sorted' },
        //         filter: { account: 1455728 },
        //         data: [
        //             {
        //                 account: 1455728,
        //                 currency: 'XBt',
        //                 riskLimit: 1000000000000,
        //                 prevState: '',
        //                 state: '',
        //                 action: '',
        //                 amount: 263542,
        //                 pendingCredit: 0,
        //                 pendingDebit: 0,
        //                 confirmedDebit: 0,
        //                 prevRealisedPnl: 0,
        //                 prevUnrealisedPnl: 0,
        //                 grossComm: 0,
        //                 grossOpenCost: 0,
        //                 grossOpenPremium: 0,
        //                 grossExecCost: 0,
        //                 grossMarkValue: 0,
        //                 riskValue: 0,
        //                 taxableMargin: 0,
        //                 initMargin: 0,
        //                 maintMargin: 0,
        //                 sessionMargin: 0,
        //                 targetExcessMargin: 0,
        //                 varMargin: 0,
        //                 realisedPnl: 0,
        //                 unrealisedPnl: 0,
        //                 indicativeTax: 0,
        //                 unrealisedProfit: 0,
        //                 syntheticMargin: null,
        //                 walletBalance: 263542,
        //                 marginBalance: 263542,
        //                 marginBalancePcnt: 1,
        //                 marginLeverage: 0,
        //                 marginUsedPcnt: 0,
        //                 excessMargin: 263542,
        //                 excessMarginPcnt: 1,
        //                 availableMargin: 263542,
        //                 withdrawableMargin: 263542,
        //                 timestamp: '2020-08-03T12:01:01.246Z',
        //                 grossLastValue: 0,
        //                 commission: null
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue(message, 'data');
        const balance = this.parseBalance(data);
        this.balance = this.extend(this.balance, balance);
        const messageHash = this.safeString(message, 'table');
        client.resolve(this.balance, messageHash);
    }
    handleTrades(client, message) {
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
        const data = this.safeValue(message, 'data', []);
        const dataByMarketIds = this.groupBy(data, 'symbol');
        const marketIds = Object.keys(dataByMarketIds);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket(marketId);
            const messageHash = table + ':' + marketId;
            const symbol = market['symbol'];
            const trades = this.parseTrades(dataByMarketIds[marketId], market);
            let stored = this.safeValue(this.trades, symbol);
            if (stored === undefined) {
                const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
                stored = new Cache.ArrayCache(limit);
                this.trades[symbol] = stored;
            }
            for (let j = 0; j < trades.length; j++) {
                stored.append(trades[j]);
            }
            client.resolve(stored, messageHash);
        }
    }
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmex#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitmex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const table = 'trade';
        const messageHash = table + ':' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [
                messageHash,
            ],
        };
        const trades = await this.watch(url, messageHash, this.extend(request, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    authenticate(params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client(url);
        const messageHash = 'authenticated';
        let future = this.safeValue(client.subscriptions, messageHash);
        if (future === undefined) {
            this.checkRequiredCredentials();
            const timestamp = this.milliseconds();
            const payload = 'GET' + '/realtime' + timestamp.toString();
            const signature = this.hmac(this.encode(payload), this.encode(this.secret), sha256.sha256);
            const request = {
                'op': 'authKeyExpires',
                'args': [
                    this.apiKey,
                    timestamp,
                    signature,
                ],
            };
            const message = this.extend(request, params);
            future = this.watch(url, messageHash, message);
            client.subscriptions[messageHash] = future;
        }
        return future;
    }
    handleAuthenticationMessage(client, message) {
        const authenticated = this.safeValue(message, 'success', false);
        const messageHash = 'authenticated';
        if (authenticated) {
            // we resolve the future here permanently so authentication only happens once
            client.resolve(message, messageHash);
        }
        else {
            const error = new errors.AuthenticationError(this.json(message));
            client.reject(error, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
    }
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmex#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitmex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        await this.authenticate();
        const name = 'order';
        const subscriptionHash = name;
        let messageHash = name;
        if (symbol !== undefined) {
            symbol = this.symbol(symbol);
            messageHash += ':' + symbol;
        }
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [
                subscriptionHash,
            ],
        };
        const orders = await this.watch(url, messageHash, request, subscriptionHash);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit);
    }
    handleOrders(client, message) {
        //
        //     {
        //         table: 'order',
        //         action: 'partial',
        //         keys: [ 'orderID' ],
        //         types: {
        //             orderID: 'guid',
        //             clOrdID: 'string',
        //             clOrdLinkID: 'symbol',
        //             account: 'long',
        //             symbol: 'symbol',
        //             side: 'symbol',
        //             simpleOrderQty: 'float',
        //             orderQty: 'long',
        //             price: 'float',
        //             displayQty: 'long',
        //             stopPx: 'float',
        //             pegOffsetValue: 'float',
        //             pegPriceType: 'symbol',
        //             currency: 'symbol',
        //             settlCurrency: 'symbol',
        //             ordType: 'symbol',
        //             timeInForce: 'symbol',
        //             execInst: 'symbol',
        //             contingencyType: 'symbol',
        //             exDestination: 'symbol',
        //             ordStatus: 'symbol',
        //             triggered: 'symbol',
        //             workingIndicator: 'boolean',
        //             ordRejReason: 'symbol',
        //             simpleLeavesQty: 'float',
        //             leavesQty: 'long',
        //             simpleCumQty: 'float',
        //             cumQty: 'long',
        //             avgPx: 'float',
        //             multiLegReportingType: 'symbol',
        //             text: 'string',
        //             transactTime: 'timestamp',
        //             timestamp: 'timestamp'
        //         },
        //         foreignKeys: { symbol: 'instrument', side: 'side', ordStatus: 'ordStatus' },
        //         attributes: {
        //             orderID: 'grouped',
        //             account: 'grouped',
        //             ordStatus: 'grouped',
        //             workingIndicator: 'grouped'
        //         },
        //         filter: { account: 1455728 },
        //         data: [
        //             {
        //                 orderID: '56222c7a-9956-413a-82cf-99f4812c214b',
        //                 clOrdID: '',
        //                 clOrdLinkID: '',
        //                 account: 1455728,
        //                 symbol: 'XBTUSD',
        //                 side: 'Sell',
        //                 simpleOrderQty: null,
        //                 orderQty: 1,
        //                 price: 40000,
        //                 displayQty: null,
        //                 stopPx: null,
        //                 pegOffsetValue: null,
        //                 pegPriceType: '',
        //                 currency: 'USD',
        //                 settlCurrency: 'XBt',
        //                 ordType: 'Limit',
        //                 timeInForce: 'GoodTillCancel',
        //                 execInst: '',
        //                 contingencyType: '',
        //                 exDestination: 'XBME',
        //                 ordStatus: 'New',
        //                 triggered: '',
        //                 workingIndicator: true,
        //                 ordRejReason: '',
        //                 simpleLeavesQty: null,
        //                 leavesQty: 1,
        //                 simpleCumQty: null,
        //                 cumQty: 0,
        //                 avgPx: null,
        //                 multiLegReportingType: 'SingleSecurity',
        //                 text: 'Submitted via API.',
        //                 transactTime: '2021-01-02T21:38:49.246Z',
        //                 timestamp: '2021-01-02T21:38:49.246Z'
        //             }
        //         ]
        //     }
        //
        //     {
        //         table: 'order',
        //         action: 'insert',
        //         data: [
        //             {
        //                 orderID: 'fa993d8e-f7e4-46ed-8097-04f8e9393585',
        //                 clOrdID: '',
        //                 clOrdLinkID: '',
        //                 account: 1455728,
        //                 symbol: 'XBTUSD',
        //                 side: 'Sell',
        //                 simpleOrderQty: null,
        //                 orderQty: 1,
        //                 price: 40000,
        //                 displayQty: null,
        //                 stopPx: null,
        //                 pegOffsetValue: null,
        //                 pegPriceType: '',
        //                 currency: 'USD',
        //                 settlCurrency: 'XBt',
        //                 ordType: 'Limit',
        //                 timeInForce: 'GoodTillCancel',
        //                 execInst: '',
        //                 contingencyType: '',
        //                 exDestination: 'XBME',
        //                 ordStatus: 'New',
        //                 triggered: '',
        //                 workingIndicator: true,
        //                 ordRejReason: '',
        //                 simpleLeavesQty: null,
        //                 leavesQty: 1,
        //                 simpleCumQty: null,
        //                 cumQty: 0,
        //                 avgPx: null,
        //                 multiLegReportingType: 'SingleSecurity',
        //                 text: 'Submitted via API.',
        //                 transactTime: '2021-01-02T23:49:02.286Z',
        //                 timestamp: '2021-01-02T23:49:02.286Z'
        //             }
        //         ]
        //     }
        //
        //
        //
        //     {
        //         table: 'order',
        //         action: 'update',
        //         data: [
        //             {
        //                 orderID: 'fa993d8e-f7e4-46ed-8097-04f8e9393585',
        //                 ordStatus: 'Canceled',
        //                 workingIndicator: false,
        //                 leavesQty: 0,
        //                 text: 'Canceled: Canceled via API.\nSubmitted via API.',
        //                 timestamp: '2021-01-02T23:50:51.272Z',
        //                 clOrdID: '',
        //                 account: 1455728,
        //                 symbol: 'XBTUSD'
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue(message, 'data', []);
        const messageHash = 'order';
        // initial subscription response with multiple orders
        const dataLength = data.length;
        if (dataLength > 0) {
            if (this.orders === undefined) {
                const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
                this.orders = new Cache.ArrayCacheBySymbolById(limit);
            }
            const stored = this.orders;
            const symbols = {};
            for (let i = 0; i < dataLength; i++) {
                const currentOrder = data[i];
                const orderId = this.safeString(currentOrder, 'orderID');
                const previousOrder = this.safeValue(stored.hashmap, orderId);
                let rawOrder = currentOrder;
                if (previousOrder !== undefined) {
                    rawOrder = this.extend(previousOrder['info'], currentOrder);
                }
                const order = this.parseOrder(rawOrder);
                stored.append(order);
                const symbol = order['symbol'];
                symbols[symbol] = true;
            }
            client.resolve(this.orders, messageHash);
            const keys = Object.keys(symbols);
            for (let i = 0; i < keys.length; i++) {
                const symbol = keys[i];
                client.resolve(this.orders, messageHash + ':' + symbol);
            }
        }
    }
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmex#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitmex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
         */
        await this.loadMarkets();
        await this.authenticate();
        const name = 'execution';
        const subscriptionHash = name;
        let messageHash = name;
        if (symbol !== undefined) {
            symbol = this.symbol(symbol);
            messageHash += ':' + symbol;
        }
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [
                subscriptionHash,
            ],
        };
        const trades = await this.watch(url, messageHash, request, subscriptionHash);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    handleMyTrades(client, message) {
        //
        //     {
        //         "table":"execution",
        //         "action":"insert",
        //         "data":[
        //             {
        //                 "execID":"0193e879-cb6f-2891-d099-2c4eb40fee21",
        //                 "orderID":"00000000-0000-0000-0000-000000000000",
        //                 "clOrdID":"",
        //                 "clOrdLinkID":"",
        //                 "account":2,
        //                 "symbol":"XBTUSD",
        //                 "side":"Sell",
        //                 "lastQty":1,
        //                 "lastPx":1134.37,
        //                 "underlyingLastPx":null,
        //                 "lastMkt":"XBME",
        //                 "lastLiquidityInd":"RemovedLiquidity",
        //                 "simpleOrderQty":null,
        //                 "orderQty":1,
        //                 "price":1134.37,
        //                 "displayQty":null,
        //                 "stopPx":null,
        //                 "pegOffsetValue":null,
        //                 "pegPriceType":"",
        //                 "currency":"USD",
        //                 "settlCurrency":"XBt",
        //                 "execType":"Trade",
        //                 "ordType":"Limit",
        //                 "timeInForce":"ImmediateOrCancel",
        //                 "execInst":"",
        //                 "contingencyType":"",
        //                 "exDestination":"XBME",
        //                 "ordStatus":"Filled",
        //                 "triggered":"",
        //                 "workingIndicator":false,
        //                 "ordRejReason":"",
        //                 "simpleLeavesQty":0,
        //                 "leavesQty":0,
        //                 "simpleCumQty":0.001,
        //                 "cumQty":1,
        //                 "avgPx":1134.37,
        //                 "commission":0.00075,
        //                 "tradePublishIndicator":"DoNotPublishTrade",
        //                 "multiLegReportingType":"SingleSecurity",
        //                 "text":"Liquidation",
        //                 "trdMatchID":"7f4ab7f6-0006-3234-76f4-ae1385aad00f",
        //                 "execCost":88155,
        //                 "execComm":66,
        //                 "homeNotional":-0.00088155,
        //                 "foreignNotional":1,
        //                 "transactTime":"2017-04-04T22:07:46.035Z",
        //                 "timestamp":"2017-04-04T22:07:46.035Z"
        //             }
        //         ]
        //     }
        //
        const messageHash = this.safeString(message, 'table');
        const data = this.safeValue(message, 'data', []);
        const dataByExecType = this.groupBy(data, 'execType');
        const rawTrades = this.safeValue(dataByExecType, 'Trade', []);
        const trades = this.parseTrades(rawTrades);
        if (this.myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.myTrades = new Cache.ArrayCacheBySymbolById(limit);
        }
        const stored = this.myTrades;
        const symbols = {};
        for (let j = 0; j < trades.length; j++) {
            const trade = trades[j];
            const symbol = trade['symbol'];
            stored.append(trade);
            symbols[symbol] = trade;
        }
        const numTrades = trades.length;
        if (numTrades > 0) {
            client.resolve(stored, messageHash);
        }
        const keys = Object.keys(symbols);
        for (let i = 0; i < keys.length; i++) {
            client.resolve(stored, messageHash + ':' + keys[i]);
        }
    }
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmex#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitmex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        let table = undefined;
        if (limit === undefined) {
            table = this.safeString(this.options, 'watchOrderBookLevel', 'orderBookL2');
        }
        else if (limit === 25) {
            table = 'orderBookL2_25';
        }
        else if (limit === 10) {
            table = 'orderBookL10';
        }
        else {
            throw new errors.ExchangeError(this.id + ' watchOrderBook limit argument must be undefined (L2), 25 (L2) or 10 (L3)');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = table + ':' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [
                messageHash,
            ],
        };
        const orderbook = await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
        return orderbook.limit();
    }
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitmex#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bitmex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const table = 'tradeBin' + this.safeString(this.timeframes, timeframe, timeframe);
        const messageHash = table + ':' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'args': [
                messageHash,
            ],
        };
        const ohlcv = await this.watch(url, messageHash, this.extend(request, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    handleOHLCV(client, message) {
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
        const table = this.safeString(message, 'table');
        const interval = table.replace('tradeBin', '');
        const timeframe = this.findTimeframe(interval);
        const duration = this.parseTimeframe(timeframe);
        const candles = this.safeValue(message, 'data', []);
        const results = {};
        for (let i = 0; i < candles.length; i++) {
            const candle = candles[i];
            const marketId = this.safeString(candle, 'symbol');
            const market = this.safeMarket(marketId);
            const symbol = market['symbol'];
            const messageHash = table + ':' + market['id'];
            const result = [
                this.parse8601(this.safeString(candle, 'timestamp')) - duration * 1000,
                this.safeFloat(candle, 'open'),
                this.safeFloat(candle, 'high'),
                this.safeFloat(candle, 'low'),
                this.safeFloat(candle, 'close'),
                this.safeFloat(candle, 'volume'),
            ];
            this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
            let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
            if (stored === undefined) {
                const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
                stored = new Cache.ArrayCacheByTimestamp(limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            stored.append(result);
            results[messageHash] = stored;
        }
        const messageHashes = Object.keys(results);
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            client.resolve(results[messageHash], messageHash);
        }
    }
    async watchHeartbeat(params = {}) {
        await this.loadMarkets();
        const event = 'heartbeat';
        const url = this.urls['api']['ws'];
        return await this.watch(url, event);
    }
    handleOrderBook(client, message) {
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
        //             {
        //               table: 'orderBookL2',
        //               action: 'insert',
        //               data: [
        //                 {
        //                   symbol: 'ETH_USDT',
        //                   id: 85499965912,
        //                   side: 'Buy',
        //                   size: 83000000,
        //                   price: 1704.4,
        //                   timestamp: '2023-03-26T22:29:00.299Z'
        //                 }
        //               ]
        //             }
        //             ...
        //         ]
        //     }
        //
        const action = this.safeString(message, 'action');
        const table = this.safeString(message, 'table');
        const data = this.safeValue(message, 'data', []);
        // if it's an initial snapshot
        if (action === 'partial') {
            const filter = this.safeValue(message, 'filter', {});
            const marketId = this.safeValue(filter, 'symbol');
            const market = this.safeMarket(marketId);
            const symbol = market['symbol'];
            if (table === 'orderBookL2') {
                this.orderbooks[symbol] = this.indexedOrderBook();
            }
            else if (table === 'orderBookL2_25') {
                this.orderbooks[symbol] = this.indexedOrderBook({}, 25);
            }
            else if (table === 'orderBook10') {
                this.orderbooks[symbol] = this.indexedOrderBook({}, 10);
            }
            const orderbook = this.orderbooks[symbol];
            orderbook['symbol'] = symbol;
            for (let i = 0; i < data.length; i++) {
                const price = this.safeFloat(data[i], 'price');
                const size = this.safeFloat(data[i], 'size');
                const id = this.safeString(data[i], 'id');
                let side = this.safeString(data[i], 'side');
                side = (side === 'Buy') ? 'bids' : 'asks';
                const bookside = orderbook[side];
                bookside.store(price, size, id);
                const datetime = this.safeString(data[i], 'timestamp');
                orderbook['timestamp'] = this.parse8601(datetime);
                orderbook['datetime'] = datetime;
            }
            const messageHash = table + ':' + marketId;
            client.resolve(orderbook, messageHash);
        }
        else {
            const numUpdatesByMarketId = {};
            for (let i = 0; i < data.length; i++) {
                const marketId = this.safeValue(data[i], 'symbol');
                if (!(marketId in numUpdatesByMarketId)) {
                    numUpdatesByMarketId[marketId] = 0;
                }
                numUpdatesByMarketId[marketId] = this.sum(numUpdatesByMarketId, 1);
                const market = this.safeMarket(marketId);
                const symbol = market['symbol'];
                const orderbook = this.orderbooks[symbol];
                const price = this.safeFloat(data[i], 'price');
                const size = (action === 'delete') ? 0 : this.safeFloat(data[i], 'size', 0);
                const id = this.safeString(data[i], 'id');
                let side = this.safeString(data[i], 'side');
                side = (side === 'Buy') ? 'bids' : 'asks';
                const bookside = orderbook[side];
                bookside.store(price, size, id);
                const datetime = this.safeString(data[i], 'timestamp');
                orderbook['timestamp'] = this.parse8601(datetime);
                orderbook['datetime'] = datetime;
            }
            const marketIds = Object.keys(numUpdatesByMarketId);
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const messageHash = table + ':' + marketId;
                const market = this.safeMarket(marketId);
                const symbol = market['symbol'];
                const orderbook = this.orderbooks[symbol];
                client.resolve(orderbook, messageHash);
            }
        }
    }
    handleSystemStatus(client, message) {
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
    handleSubscriptionStatus(client, message) {
        //
        //     {
        //         success: true,
        //         subscribe: 'orderBookL2:XBTUSD',
        //         request: { op: 'subscribe', args: [ 'orderBookL2:XBTUSD' ] }
        //     }
        //
        return message;
    }
    handleErrorMessage(client, message) {
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
        const error = this.safeValue(message, 'error');
        if (error !== undefined) {
            const request = this.safeValue(message, 'request', {});
            const args = this.safeValue(request, 'args', []);
            const numArgs = args.length;
            if (numArgs > 0) {
                const messageHash = args[0];
                const broad = this.exceptions['ws']['broad'];
                const broadKey = this.findBroadlyMatchedKey(broad, error);
                let exception = undefined;
                if (broadKey === undefined) {
                    exception = new errors.ExchangeError(error);
                }
                else {
                    exception = new broad[broadKey](error);
                }
                client.reject(exception, messageHash);
                return false;
            }
        }
        return true;
    }
    handleMessage(client, message) {
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
        if (this.handleErrorMessage(client, message)) {
            const table = this.safeString(message, 'table');
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
                'order': this.handleOrders,
                'execution': this.handleMyTrades,
                'margin': this.handleBalance,
            };
            const method = this.safeValue(methods, table);
            if (method === undefined) {
                const request = this.safeValue(message, 'request', {});
                const op = this.safeValue(request, 'op');
                if (op === 'authKeyExpires') {
                    return this.handleAuthenticationMessage.call(this, client, message);
                }
                else {
                    return message;
                }
            }
            else {
                return method.call(this, client, message);
            }
        }
    }
}

module.exports = bitmex;
