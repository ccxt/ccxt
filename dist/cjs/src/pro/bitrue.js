'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var bitrue$1 = require('../bitrue.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class bitrue extends bitrue$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchMyTrades': false,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'open': 'https://open.bitrue.com',
                    'ws': {
                        'public': 'wss://ws.bitrue.com/market/ws',
                        'futurePublic': 'wss://fmarket-ws.bitrue.com/kline-api/ws',
                        'private': 'wss://wsapi.bitrue.com',
                    },
                },
            },
            'api': {
                'open': {
                    'v1': {
                        'private': {
                            'post': {
                                'poseidon/api/v1/listenKey': 1,
                            },
                            'put': {
                                'poseidon/api/v1/listenKey/{listenKey}': 1,
                            },
                            'delete': {
                                'poseidon/api/v1/listenKey/{listenKey}': 1,
                            },
                        },
                    },
                },
            },
            'options': {
                'listenKeyRefreshRate': 1800000, // 30 mins
                'ws': {
                    'gunzip': true,
                },
                'futuresTimeframes': {
                    '1m': '1min',
                    '5m': '5min',
                    '15m': '15min',
                    '30m': '30min',
                    '1h': '60min',
                    '2h': '2h',
                    '4h': '4h',
                    '1d': '1day',
                    '1w': '1week',
                },
            },
        });
    }
    /**
     * @method
     * @name bitrue#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#balance-update
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        const url = await this.authenticate();
        const messageHash = 'balance';
        const message = {
            'event': 'sub',
            'params': {
                'channel': 'user_balance_update',
            },
        };
        const request = this.deepExtend(message, params);
        return await this.watch(url, messageHash, request, messageHash);
    }
    handleBalance(client, message) {
        //
        //     {
        //         "e": "BALANCE",
        //         "x": "OutboundAccountPositionTradeEvent",
        //         "E": 1657799510175,
        //         "I": "302274978401288200",
        //         "i": 1657799510175,
        //         "B": [{
        //                 "a": "btc",
        //                 "F": "0.0006000000000000",
        //                 "T": 1657799510000,
        //                 "f": "0.0006000000000000",
        //                 "t": 0
        //             },
        //             {
        //                 "a": "usdt",
        //                 "T": 0,
        //                 "L": "0.0000000000000000",
        //                 "l": "-11.8705317318000000",
        //                 "t": 1657799510000
        //             }
        //         ],
        //         "u": 1814396
        //     }
        //
        //     {
        //      "e": "BALANCE",
        //      "x": "OutboundAccountPositionOrderEvent",
        //      "E": 1670051332478,
        //      "I": "353662845694083072",
        //      "i": 1670051332478,
        //      "B": [
        //        {
        //          "a": "eth",
        //          "F": "0.0400000000000000",
        //          "T": 1670051332000,
        //          "f": "-0.0100000000000000",
        //          "L": "0.0100000000000000",
        //          "l": "0.0100000000000000",
        //          "t": 1670051332000
        //        }
        //      ],
        //      "u": 2285311
        //    }
        //
        const balances = this.safeValue(message, 'B', []);
        this.parseWSBalances(balances);
        const messageHash = 'balance';
        client.resolve(this.balance, messageHash);
    }
    parseWSBalances(balances) {
        //
        //    [{
        //         "a": "btc",
        //         "F": "0.0006000000000000",
        //         "T": 1657799510000,
        //         "f": "0.0006000000000000",
        //         "t": 0
        //     },
        //     {
        //         "a": "usdt",
        //         "T": 0,
        //         "L": "0.0000000000000000",
        //         "l": "-11.8705317318000000",
        //         "t": 1657799510000
        //     }]
        //
        this.balance['info'] = balances;
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString(balance, 'a');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            const free = this.safeString(balance, 'F');
            const used = this.safeString(balance, 'L');
            const balanceUpdateTime = this.safeInteger(balance, 'T', 0);
            const lockBalanceUpdateTime = this.safeInteger(balance, 't', 0);
            const updateFree = balanceUpdateTime !== 0;
            const updateUsed = lockBalanceUpdateTime !== 0;
            if (updateFree || updateUsed) {
                if (updateFree) {
                    account['free'] = free;
                }
                if (updateUsed) {
                    account['used'] = used;
                }
                this.balance[code] = account;
            }
        }
        this.balance = this.safeBalance(this.balance);
    }
    /**
     * @method
     * @name bitrue#watchOrders
     * @description watches information on user orders
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#order-update
     * @param {string} symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum amount of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order structure]{@link https://docs.ccxt.com/?id=order-structure} indexed by market symbols
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        if (symbol !== undefined) {
            const market = this.market(symbol);
            symbol = market['symbol'];
        }
        const url = await this.authenticate();
        const messageHash = 'orders';
        const message = {
            'event': 'sub',
            'params': {
                'channel': 'user_order_update',
            },
        };
        const request = this.deepExtend(message, params);
        const orders = await this.watch(url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleOrder(client, message) {
        //
        //    {
        //        "e": "ORDER",
        //        "i": 16122802798,
        //        "E": 1657882521876,
        //        "I": "302623154710888464",
        //        "u": 1814396,
        //        "s": "btcusdt",
        //        "S": 2,
        //        "o": 1,
        //        "q": "0.0005",
        //        "p": "60000",
        //        "X": 0,
        //        "x": 1,
        //        "z": "0",
        //        "n": "0",
        //        "N": "usdt",
        //        "O": 1657882521876,
        //        "L": "0",
        //        "l": "0",
        //        "Y": "0"
        //    }
        //
        const parsed = this.parseWsOrder(message);
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const orders = this.orders;
        orders.append(parsed);
        const messageHash = 'orders';
        client.resolve(this.orders, messageHash);
    }
    parseWsOrder(order, market = undefined) {
        //
        //    {
        //        "e": "ORDER",
        //        "i": 16122802798,
        //        "E": 1657882521876,
        //        "I": "302623154710888464",
        //        "u": 1814396,
        //        "s": "btcusdt",
        //        "S": 2,
        //        "o": 1,
        //        "q": "0.0005",
        //        "p": "60000",
        //        "X": 0,
        //        "x": 1,
        //        "z": "0",
        //        "n": "0",
        //        "N": "usdt",
        //        "O": 1657882521876,
        //        "L": "0",
        //        "l": "0",
        //        "Y": "0"
        //    }
        //
        const timestamp = this.safeInteger(order, 'E');
        const marketId = this.safeStringUpper(order, 's');
        const typeId = this.safeString(order, 'o');
        const sideId = this.safeInteger(order, 'S');
        // 1: buy
        // 2: sell
        const side = (sideId === 1) ? 'buy' : 'sell';
        const statusId = this.safeString(order, 'X');
        const feeCurrencyId = this.safeString(order, 'N');
        return this.safeOrder({
            'info': order,
            'id': this.safeString(order, 'i'),
            'clientOrderId': this.safeString(order, 'c'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': this.safeInteger(order, 'T'),
            'symbol': this.safeSymbol(marketId, market),
            'type': this.parseWsOrderType(typeId),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeString(order, 'p'),
            'triggerPrice': undefined,
            'amount': this.safeString(order, 'q'),
            'cost': this.safeString(order, 'Y'),
            'average': undefined,
            'filled': this.safeString(order, 'z'),
            'remaining': undefined,
            'status': this.parseWsOrderStatus(statusId),
            'fee': {
                'currency': this.safeCurrencyCode(feeCurrencyId),
                'cost': this.safeNumber(order, 'n'),
            },
        }, market);
    }
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        let url = undefined;
        let channel = undefined;
        let cbId = undefined;
        if (market['swap']) {
            const baseIdLower = this.safeStringLower(market, 'baseId');
            const quoteIdLower = this.safeStringLower(market, 'quoteId');
            const wsId = 'e_' + baseIdLower + quoteIdLower;
            channel = 'market_' + wsId + '_depth_step0';
            cbId = wsId;
            url = this.urls['api']['ws']['futurePublic'];
        }
        else {
            const marketIdLowercase = market['id'].toLowerCase();
            channel = 'market_' + marketIdLowercase + '_simple_depth_step0';
            cbId = marketIdLowercase;
            url = this.urls['api']['ws']['public'];
        }
        const message = {
            'event': 'sub',
            'params': {
                'cb_id': cbId,
                'channel': channel,
            },
        };
        const request = this.deepExtend(message, params);
        return await this.watch(url, messageHash, request, messageHash);
    }
    handleOrderBook(client, message) {
        //
        //     {
        //         "channel": "market_ethbtc_simple_depth_step0",
        //         "ts": 1670056708670,
        //         "tick": {
        //             "buys": [
        //                 [
        //                     "0.075170",
        //                     "67.153"
        //                 ],
        //                 [
        //                     "0.075169",
        //                     "17.195"
        //                 ],
        //                 [
        //                     "0.075166",
        //                     "29.788"
        //                 ],
        //             ]
        //              "asks": [
        //                 [
        //                     "0.075171",
        //                     "0.256"
        //                 ],
        //                 [
        //                     "0.075172",
        //                     "0.160"
        //                 ],
        //             ]
        //         }
        //     }
        //
        const channel = this.safeString(message, 'channel');
        const parts = channel.split('_');
        const channelKind = this.safeString(parts, 1);
        const isFutures = (channelKind === 'e');
        let market = undefined;
        if (isFutures) {
            const wsBaseQuote = this.safeStringLower(parts, 2);
            market = this.findSwapMarketByWsBaseQuote(wsBaseQuote);
        }
        else {
            const marketId = this.safeStringUpper(parts, 1);
            market = this.safeMarket(marketId);
        }
        const symbol = market['symbol'];
        const timestamp = this.safeInteger(message, 'ts');
        const tick = this.safeValue(message, 'tick', {});
        let parseable = tick;
        if (isFutures) {
            const rawAsks = this.safeList(tick, 'asks', []);
            const rawBuys = this.safeList(tick, 'buys', []);
            parseable = {
                'asks': this.parseContractBidsAsks(rawAsks, symbol),
                'buys': this.parseContractBidsAsks(rawBuys, symbol),
            };
        }
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook();
        }
        const orderbook = this.orderbooks[symbol];
        const snapshot = this.parseOrderBook(parseable, symbol, timestamp, 'buys', 'asks');
        orderbook.reset(snapshot);
        const messageHash = 'orderbook:' + symbol;
        client.resolve(orderbook, messageHash);
    }
    findSwapMarketByWsBaseQuote(wsBaseQuote) {
        const symbols = Object.keys(this.markets);
        for (let i = 0; i < symbols.length; i++) {
            const candidate = this.markets[symbols[i]];
            if (!candidate['swap']) {
                continue;
            }
            const baseId = this.safeStringLower(candidate, 'baseId', '');
            const quoteId = this.safeStringLower(candidate, 'quoteId', '');
            if (baseId + quoteId === wsBaseQuote) {
                return candidate;
            }
        }
        return undefined;
    }
    parseContractBidsAsks(bidsAsks, symbol) {
        const result = [];
        for (let i = 0; i < bidsAsks.length; i++) {
            const level = bidsAsks[i];
            const price = this.safeNumber(level, 0);
            const rawAmount = this.safeNumber(level, 1);
            const amount = this.convertFromRawQuantity(symbol, rawAmount);
            result.push([price, amount]);
        }
        return result;
    }
    convertFromRawQuantity(symbol, rawQuantity) {
        if (rawQuantity === undefined) {
            return undefined;
        }
        const market = this.market(symbol);
        if (!market['contract']) {
            return rawQuantity;
        }
        const contractSize = this.safeNumber(market, 'contractSize', 1);
        return rawQuantity * contractSize;
    }
    /**
     * @method
     * @name bitrue#watchTrades
     * @description watches public trades for a swap (futures) market
     * @see https://www.bitrue.com/api_docs_includes_file/futures/index.html#websocket-market-data
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        if (!market['swap']) {
            throw new errors.NotSupported(this.id + ' watchTrades is only supported for swap markets');
        }
        const baseIdLower = this.safeStringLower(market, 'baseId');
        const quoteIdLower = this.safeStringLower(market, 'quoteId');
        const wsId = 'e_' + baseIdLower + quoteIdLower;
        const channel = 'market_' + wsId + '_trade_ticker';
        const messageHash = 'trades:' + symbol;
        const url = this.urls['api']['ws']['futurePublic'];
        const message = {
            'event': 'sub',
            'params': {
                'cb_id': wsId,
                'channel': channel,
            },
        };
        const request = this.deepExtend(message, params);
        const trades = await this.watch(url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
        //
        //     {
        //         "event_rep": "",
        //         "channel": "market_e_btcusdt_trade_ticker",
        //         "ts": 1721743391000,
        //         "status": "ok",
        //         "tick": {
        //             "data": [
        //                 {
        //                     "amount": "1666656191.2",
        //                     "ds": "2024-07-23 22:03:11",
        //                     "price": "66008.8",
        //                     "side": "SELL",
        //                     "ts": 1721743391398,
        //                     "vol": "25249"
        //                 }
        //             ]
        //         }
        //     }
        //
        const channel = this.safeString(message, 'channel');
        const parts = channel.split('_');
        const wsBaseQuote = this.safeStringLower(parts, 2);
        const market = this.findSwapMarketByWsBaseQuote(wsBaseQuote);
        if (market === undefined) {
            return;
        }
        const symbol = market['symbol'];
        const tick = this.safeValue(message, 'tick', {});
        const data = this.safeList(tick, 'data', []);
        let appended = false;
        let stored = this.safeValue(this.trades, symbol);
        for (let i = 0; i < data.length; i++) {
            if (stored === undefined) {
                const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
                stored = new Cache.ArrayCache(limit);
                this.trades[symbol] = stored;
            }
            const trade = this.parseWsTrade(data[i], market);
            stored.append(trade);
            appended = true;
        }
        if (appended) {
            const messageHash = 'trades:' + symbol;
            client.resolve(stored, messageHash);
        }
    }
    parseWsTrade(trade, market = undefined) {
        const symbol = market['symbol'];
        const timestamp = this.safeInteger(trade, 'ts');
        const sideLower = this.safeStringLower(trade, 'side');
        const priceString = this.safeString(trade, 'price');
        const rawVol = this.safeNumber(trade, 'vol');
        const baseAmount = this.convertFromRawQuantity(symbol, rawVol);
        return this.safeTrade({
            'info': trade,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': sideLower,
            'takerOrMaker': 'taker',
            'price': priceString,
            'amount': this.numberToString(baseAmount),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }
    /**
     * @method
     * @name bitrue#watchOHLCV
     * @description watches OHLCV candles for a swap (futures) market
     * @see https://www.bitrue.com/api_docs_includes_file/futures/index.html#websocket-market-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        if (!market['swap']) {
            throw new errors.NotSupported(this.id + ' watchOHLCV is only supported for swap markets');
        }
        const futuresTimeframes = this.safeDict(this.options, 'futuresTimeframes', {});
        const interval = this.safeString(futuresTimeframes, timeframe);
        if (interval === undefined) {
            throw new errors.NotSupported(this.id + ' watchOHLCV does not support timeframe ' + timeframe);
        }
        const baseIdLower = this.safeStringLower(market, 'baseId');
        const quoteIdLower = this.safeStringLower(market, 'quoteId');
        const wsId = 'e_' + baseIdLower + quoteIdLower;
        const channel = 'market_' + wsId + '_kline_' + interval;
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        const url = this.urls['api']['ws']['futurePublic'];
        const message = {
            'event': 'sub',
            'params': {
                'cb_id': wsId,
                'channel': channel,
            },
        };
        const request = this.deepExtend(message, params);
        const ohlcv = await this.watch(url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         "channel": "market_e_btcusdt_kline_1min",
        //         "data": [],
        //         "tick": {
        //             "amount": 396539282326.3,
        //             "close": 19517.1,
        //             "ds": "2022-07-13 14:00:00",
        //             "high": 19556.5,
        //             "id": 1657692000,
        //             "low": 19465.1,
        //             "open": 19507.3,
        //             "vol": 20325940
        //         },
        //         "ts": 1657696418000,
        //         "status": "ok"
        //     }
        //
        const channel = this.safeString(message, 'channel');
        const parts = channel.split('_');
        const wsBaseQuote = this.safeStringLower(parts, 2);
        const market = this.findSwapMarketByWsBaseQuote(wsBaseQuote);
        if (market === undefined) {
            return;
        }
        const symbol = market['symbol'];
        const wsInterval = this.safeString(parts, 4);
        const futuresTimeframes = this.safeDict(this.options, 'futuresTimeframes', {});
        const timeframe = this.findTimeframe(wsInterval, futuresTimeframes);
        const tick = this.safeValue(message, 'tick');
        if (tick === undefined) {
            return;
        }
        const parsed = this.parseWsOHLCV(tick, market);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new Cache.ArrayCacheByTimestamp(limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        stored.append(parsed);
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        client.resolve(stored, messageHash);
    }
    parseWsOHLCV(tick, market = undefined) {
        const symbol = market['symbol'];
        const idSeconds = this.safeInteger(tick, 'id');
        const timestamp = (idSeconds === undefined) ? undefined : idSeconds * 1000;
        const open = this.safeNumber(tick, 'open');
        const high = this.safeNumber(tick, 'high');
        const low = this.safeNumber(tick, 'low');
        const close = this.safeNumber(tick, 'close');
        const rawVol = this.safeNumber(tick, 'vol');
        const baseVolume = this.convertFromRawQuantity(symbol, rawVol);
        return [timestamp, open, high, low, close, baseVolume];
    }
    /**
     * @method
     * @name bitrue#watchTicker
     * @description watches a 24h ticker for a swap (futures) market
     * @see https://www.bitrue.com/api_docs_includes_file/futures/index.html#websocket-market-data
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        if (!market['swap']) {
            throw new errors.NotSupported(this.id + ' watchTicker is only supported for swap markets');
        }
        const baseIdLower = this.safeStringLower(market, 'baseId');
        const quoteIdLower = this.safeStringLower(market, 'quoteId');
        const wsId = 'e_' + baseIdLower + quoteIdLower;
        const channel = 'market_' + wsId + '_ticker';
        const messageHash = 'ticker:' + symbol;
        const url = this.urls['api']['ws']['futurePublic'];
        const message = {
            'event': 'sub',
            'params': {
                'cb_id': wsId,
                'channel': channel,
            },
        };
        const request = this.deepExtend(message, params);
        return await this.watch(url, messageHash, request, messageHash);
    }
    handleTicker(client, message) {
        //
        //     {
        //         "channel": "market_e_btcusdt_ticker",
        //         "ts": 1506584998239,
        //         "tick": {
        //             "amount": 123.1221,
        //             "vol": 1212.12211,
        //             "open": 2233.22,
        //             "close": 1221.11,
        //             "high": 22322.22,
        //             "low": 2321.22,
        //             "rose": -0.2922
        //         },
        //         "status": "ok"
        //     }
        //
        const channel = this.safeString(message, 'channel');
        const parts = channel.split('_');
        const wsBaseQuote = this.safeStringLower(parts, 2);
        const market = this.findSwapMarketByWsBaseQuote(wsBaseQuote);
        if (market === undefined) {
            return;
        }
        const symbol = market['symbol'];
        const tick = this.safeValue(message, 'tick');
        if (tick === undefined) {
            return;
        }
        const timestamp = this.safeInteger(message, 'ts');
        const parsed = this.parseWsTicker(tick, market, timestamp);
        this.tickers[symbol] = parsed;
        const messageHash = 'ticker:' + symbol;
        client.resolve(parsed, messageHash);
    }
    parseWsTicker(tick, market, timestamp = undefined) {
        const symbol = market['symbol'];
        const rawVol = this.safeNumber(tick, 'vol');
        const rawAmount = this.safeNumber(tick, 'amount');
        const baseVolume = this.convertFromRawQuantity(symbol, rawVol);
        const quoteVolume = this.convertFromRawQuantity(symbol, rawAmount);
        const close = this.safeNumber(tick, 'close');
        const rose = this.safeNumber(tick, 'rose');
        const percentage = (rose === undefined) ? undefined : rose * 100;
        return this.safeTicker({
            'info': tick,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeNumber(tick, 'high'),
            'low': this.safeNumber(tick, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeNumber(tick, 'open'),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
        }, market);
    }
    parseWsOrderType(typeId) {
        const types = {
            '1': 'limit',
            '2': 'market',
            '3': 'limit',
        };
        return this.safeString(types, typeId, typeId);
    }
    parseWsOrderStatus(status) {
        const statuses = {
            '0': 'open', // The order has not been accepted by the engine.
            '1': 'open', // The order has been accepted by the engine.
            '2': 'closed', // The order has been completed.
            '3': 'open', // A part of the order has been filled.
            '4': 'canceled', // The order has been canceled.
            '7': 'open', // Stop order placed.
        };
        return this.safeString(statuses, status, status);
    }
    handlePing(client, message) {
        this.spawn(this.pong, client, message);
    }
    async pong(client, message) {
        //
        //     {
        //         "ping": 1670057540627
        //     }
        //
        const time = this.safeInteger(message, 'ping');
        const pong = {
            'pong': time,
        };
        await client.send(pong);
    }
    handleMessage(client, message) {
        if ('channel' in message) {
            const channel = this.safeString(message, 'channel');
            if (channel.indexOf('_depth_step') > -1) {
                this.handleOrderBook(client, message);
            }
            else if (channel.indexOf('_trade_ticker') > -1) {
                this.handleTrades(client, message);
            }
            else if (channel.indexOf('_kline_') > -1) {
                this.handleOHLCV(client, message);
            }
            else if (channel.indexOf('_ticker') > -1) {
                this.handleTicker(client, message);
            }
        }
        else if ('ping' in message) {
            this.handlePing(client, message);
        }
        else {
            const event = this.safeString(message, 'e');
            const handlers = {
                'BALANCE': this.handleBalance,
                'ORDER': this.handleOrder,
            };
            const handler = this.safeValue(handlers, event);
            if (handler !== undefined) {
                handler.call(this, client, message);
            }
        }
    }
    async authenticate(params = {}) {
        const listenKey = this.safeValue(this.options, 'listenKey');
        if (listenKey === undefined) {
            const response = await this.openV1PrivatePostPoseidonApiV1ListenKey(params);
            //
            //     {
            //         "msg": "succ",
            //         "code": 200,
            //         "data": {
            //             "listenKey": "7d1ec51340f499d85bb33b00a96ef680bda28869d5c3374a444c5ca4847d1bf0"
            //         }
            //     }
            //
            const data = this.safeValue(response, 'data', {});
            const key = this.safeString(data, 'listenKey');
            this.options['listenKey'] = key;
            this.options['listenKeyUrl'] = this.urls['api']['ws']['private'] + '/stream?listenKey=' + key;
            const refreshTimeout = this.safeInteger(this.options, 'listenKeyRefreshRate', 1800000);
            this.delay(refreshTimeout, this.keepAliveListenKey);
        }
        return this.options['listenKeyUrl'];
    }
    async keepAliveListenKey(params = {}) {
        const listenKey = this.safeString(this.options, 'listenKey');
        const request = {
            'listenKey': listenKey,
        };
        try {
            await this.openV1PrivatePutPoseidonApiV1ListenKeyListenKey(this.extend(request, params));
            //
            // ಠ_ಠ
            //     {
            //         "msg": "succ",
            //         "code": "200"
            //     }
            //
        }
        catch (error) {
            this.options['listenKey'] = undefined;
            this.options['listenKeyUrl'] = undefined;
            return;
        }
        const refreshTimeout = this.safeInteger(this.options, 'listenKeyRefreshRate', 1800000);
        this.delay(refreshTimeout, this.keepAliveListenKey);
    }
}

exports["default"] = bitrue;
