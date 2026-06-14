// ----------------------------------------------------------------------------

import driftRest from '../drift.js';
import { AuthenticationError } from '../base/errors.js';
import { ArrayCacheByTimestamp, ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Int, OrderBook, OHLCV, Dict, Bool, Trade, Str, Order } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { Precise } from '../base/Precise.js';

// ----------------------------------------------------------------------------

export default class drift extends driftRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': false,
                'watchTickers': true,
                'watchBidsAsks': false,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchPositions': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://data.api.drift.trade/ws',
                        'private': 'wss://ws-private-evm.orderly.org/v2/ws/private/stream',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
            },
            'streaming': {
                'keepAlive': 10000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                    },
                },
            },
        });
    }

    async watchPublic (messageHash, subscribeHash, message) {
        const url = this.urls['api']['ws']['public'];
        return await this.watch (url, messageHash, message, subscribeHash, message);
    }

    /**
     * @method
     * @name drift#watchOHLCV
     * @see https://data.api.drift.trade/playground
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const topic = market['id'] + '@candle' + '_' + interval;
        const request: Dict = {
            'type': 'subscribe',
            'channelType': 'candle',
            'resolution': interval,
            'symbol': market['id'],
        };
        const message = this.extend (request, params);
        const ohlcv = await this.watchPublic (topic, topic, message);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        // {
        //     "type": "init",
        //     "channelType": "candle",
        //     "data": {
        //         "symbol": "SOL-PERP",
        //         "resolution": "1",
        //         "ts": 1774000440,
        //         "fillOpen": 88.7234,
        //         "fillHigh": 88.7234,
        //         "fillClose": 88.64,
        //         "fillLow": 88.64,
        //         "oracleOpen": 88.790903,
        //         "oracleHigh": 88.790903,
        //         "oracleClose": 88.745,
        //         "oracleLow": 88.745,
        //         "quoteVolume": 9999.4784,
        //         "baseVolume": 112.81,
        //         "lastTradeTs": 1774000453,
        //         "lastFillRecordId": "16232886"
        //     },
        //     "symbol": "SOL-PERP",
        //     "resolution": "1",
        //     "candle": {
        //         "symbol": "SOL-PERP",
        //         "resolution": "1",
        //         "ts": 1774000440,
        //         "fillOpen": 88.7234,
        //         "fillHigh": 88.7234,
        //         "fillClose": 88.64,
        //         "fillLow": 88.64,
        //         "oracleOpen": 88.790903,
        //         "oracleHigh": 88.790903,
        //         "oracleClose": 88.745,
        //         "oracleLow": 88.745,
        //         "quoteVolume": 9999.4784,
        //         "baseVolume": 112.81,
        //         "lastTradeTs": 1774000453,
        //         "lastFillRecordId": "16232886"
        //     }
        // }
        //
        const data = this.safeDict (message, 'candle', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const interval = this.safeString (data, 'resolution');
        const timeframe = this.findTimeframe (interval);
        const topic = market['id'] + '@candle' + '_' + interval;
        const parsed = [
            this.safeInteger (data, 'ts'),
            this.safeNumber (data, 'fillOpen'),
            this.safeNumber (data, 'fillHigh'),
            this.safeNumber (data, 'fillLow'),
            this.safeNumber (data, 'fillClose'),
            this.safeNumber (data, 'baseVolume'),
        ];
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const ohlcvCache = this.ohlcvs[symbol][timeframe];
        ohlcvCache.append (parsed);
        client.resolve (ohlcvCache, topic);
        // trades data is sent with ohlcv topic
        this.handleTrade (client, message);
    }

    /**
     * @method
     * @name drift#watchOrderBook
     * @see https://data.api.drift.trade/playground
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const topic = market['id'] + '@orderbook';
        const request: Dict = {
            'type': 'subscribe',
            'channelType': 'orderbook',
            'symbol': market['id'],
        };
        const message = this.extend (request, params);
        const orderbook = await this.watchPublic (topic, topic, message);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        // {
        //     "type": "update",
        //     "channelType": "orderbook",
        //     "channel": "orderbook:SOL-PERP",
        //     "data": {
        //         "symbol": "SOL-PERP",
        //         "levels": [
        //             [
        //                 [
        //                     "85.560000",
        //                     "2942.366520676"
        //                 ]
        //             ],
        //             [
        //                 [
        //                     "85.716800",
        //                     "2334.774000000"
        //                 ]
        //             ]
        //         ],
        //         "oraclePrice": "85.689988",
        //         "markPrice": "85.638400",
        //         "spreadQuote": "0.156800",
        //         "spreadPercent": "0.183095"
        //     }
        // }
        //
        const data = this.safeDict (message, 'data', {});
        const levels = this.safeList (data, 'levels', []);
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const topic = this.safeString (message, 'channelType');
        const messageHash = market['id'] + '@' + topic;
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const orderbook = this.orderbooks[symbol];
        const snapshot = this.parseOrderBook (levels, symbol, undefined, '0', '1', 0, 1);
        orderbook.reset (snapshot);
        client.resolve (orderbook, messageHash);
    }

    /**
     * @method
     * @name drift#watchTrades
     * @see https://data.api.drift.trade/playground
     * @description watches information on multiple trades made in a market
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const topic = market['id'] + '@candle' + '_1';
        const messageHash = market['id'] + '@trades';
        const request: Dict = {
            'type': 'subscribe',
            'channelType': 'candle',
            'resolution': '1',
            'symbol': market['id'],
        };
        const message = this.extend (request, params);
        const trades = await this.watchPublic (messageHash, topic, message);
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleTrade (client: Client, message) {
        const trades = this.safeList (message, 'trades', []);
        const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
        for (let i = 0; i < trades.length; i++) {
            const rawTrade = trades[i];
            const marketId = this.safeString (rawTrade, 'symbol');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const messageHash = market['id'] + '@trades';
            const trade = this.parseWsTrade (rawTrade, market);
            let tradesArray = this.safeValue (this.trades, symbol);
            if (tradesArray === undefined) {
                tradesArray = new ArrayCache (limit);
            }
            tradesArray.append (trade);
            this.trades[symbol] = tradesArray;
            client.resolve (tradesArray, messageHash);
        }
    }

    parseWsTrade (trade, market = undefined) {
        //
        // {
        //     "symbol": "SOL-PERP",
        //     "fillRecordId": "16251183",
        //     "slot": 408304474,
        //     "actionExplanation": "orderFilledWithMatch",
        //     "makerExistingBaseAssetAmount": null,
        //     "marketType": "perp",
        //     "takerOrderDirection": "long",
        //     "createdAt": 1774260267,
        //     "makerRebate": -0.000017,
        //     "quoteAssetAmountSurplus": 0,
        //     "makerExistingQuoteEntryAmount": null,
        //     "makerFee": -0.000017,
        //     "takerOrderCumulativeQuoteAssetAmountFilled": 0.857168,
        //     "referrerReward": 0,
        //     "action": "fill",
        //     "takerExistingQuoteEntryAmount": 0.859088,
        //     "bitFlags": 0,
        //     "takerOrderId": 2752,
        //     "taker": "ELPPn6XZCanRAT6U9xJZg7wnKuvBtPsRdVff1dcTxesU",
        //     "oraclePrice": 85.781072,
        //     "takerExistingBaseAssetAmount": null,
        //     "quoteAssetAmountFilled": 0.857168,
        //     "makerOrderBaseAssetAmount": 0.5,
        //     "txSigIndex": 0,
        //     "takerFee": 0.000301,
        //     "marketFilter": "perp",
        //     "makerOrderCumulativeQuoteAssetAmountFilled": 0.857168,
        //     "spotFulfillmentMethodFee": 0,
        //     "maker": "3JvYM3FTkPw9AeXMJKmyYgnCtGjKuf9JL46XqhB9aHxe",
        //     "takerOrderBaseAssetAmount": 0.01,
        //     "makerOrderId": 4391,
        //     "makerOrderCumulativeBaseAssetAmountFilled": 0.01,
        //     "takerOrderCumulativeBaseAssetAmountFilled": 0.01,
        //     "baseAssetAmountFilled": 0.01,
        //     "makerOrderDirection": "short",
        //     "txSig": "3br1qBqK17SqSZDgDMMBpe2myWPq2QY2joVqo19WDxAzYNkHS3vzqpNQosQbUfMWKpNw6ZVgtffcbutuGJNfKuS4",
        //     "filler": "JE9m89yHHiCGzzL2FAeeZgHKAFwjkW4Qp1GfjegWnojR",
        //     "marketIndex": 0,
        //     "entity": "market",
        //     "fillerReward": 0.00003,
        //     "ts": 1774260265,
        //     "price": 85.7168
        // }
        //
        // {
        //     "recordType": "OrderActionRecord",
        //     "ts": 1711152059,
        //     "txSig": "<signature>",
        //     "txSigIndex": 0,
        //     "slot": 250000000,
        //     "action": "fill",
        //     "actionExplanation": "orderFilledWithMatch",
        //     "marketIndex": 0,
        //     "marketType": "perp",
        //     "marketFilter": "perp_0",
        //     "filler": "<pubkey>",
        //     "fillRecordId": "123456",
        //     "taker": "<pubkey>",
        //     "takerOrderId": "789",
        //     "takerOrderDirection": "long",
        //     "maker": "<pubkey>",
        //     "makerOrderId": "456",
        //     "makerOrderDirection": "short",
        //     "baseAssetAmountFilled": "1.000000000",
        //     "quoteAssetAmountFilled": "185.500000",
        //     "takerFee": "0.139000",
        //     "makerFee": "-0.028000",
        //     "makerRebate": "0.028000",
        //     "referrerReward": "0.000000",
        //     "fillerReward": "0.000000",
        //     "quoteAssetAmountSurplus": "0.000000",
        //     "spotFulfillmentMethodFee": "0.000000",
        //     "oraclePrice": "185.500000",
        //     "takerOrderBaseAssetAmount": "1.000000000",
        //     "takerOrderCumulativeBaseAssetAmountFilled": "1.000000000",
        //     "takerOrderCumulativeQuoteAssetAmountFilled": "185.500000",
        //     "takerExistingQuoteEntryAmount": "0.000000",
        //     "takerExistingBaseAssetAmount": "0.000000000",
        //     "makerOrderBaseAssetAmount": "10.000000000",
        //     "makerOrderCumulativeBaseAssetAmountFilled": "5.000000000",
        //     "makerOrderCumulativeQuoteAssetAmountFilled": "927.500000",
        //     "makerExistingQuoteEntryAmount": "0.000000",
        //     "makerExistingBaseAssetAmount": "0.000000000",
        //     "user": "<pubkey>",
        //     "symbol": "SOL-PERP",
        //     "bitFlags": 0
        // }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const user = this.safeString (trade, 'user');
        let orderIdKey = 'orderId';
        let side = undefined;
        let takerOrMaker = undefined;
        const fee = {
            'cost': undefined,
            'currency': undefined,
        };
        let price = undefined;
        let amount = undefined;
        if (user !== undefined) {
            const taker = this.safeString (trade, 'taker');
            if (user === taker) {
                takerOrMaker = 'taker';
            } else {
                takerOrMaker = 'maker';
            }
            orderIdKey = takerOrMaker + 'OrderId';
            amount = this.safeString (trade, takerOrMaker + 'OrderCumulativeBaseAssetAmountFilled');
            const quoteAmount = this.safeString (trade, takerOrMaker + 'OrderCumulativeQuoteAssetAmountFilled');
            price = Precise.stringDiv (quoteAmount, amount);
            const direction = this.safeString (trade, takerOrMaker + 'OrderDirection');
            side = (direction === 'long') ? 'buy' : 'sell';
            fee['cost'] = this.safeString (trade, takerOrMaker + 'Fee');
        } else {
            price = this.safeString (trade, 'price');
            amount = this.safeString (trade, 'baseAssetAmountFilled');
        }
        const timestamp = this.safeTimestamp (trade, 'ts');
        return this.safeTrade ({
            'id': this.safeString (trade, 'fillRecordId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'order': this.safeString (trade, orderIdKey),
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    /**
     * @method
     * @name drift#watchOrders
     * @see https://data.api.drift.trade/playground
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let accountId = undefined;
        [ accountId, params ] = await this.handleAccountId (params, 'watchBalance', 'accountId', 'account_id', this.accountId);
        const topic = 'user@' + accountId;
        let messageHash = 'orders';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += '@' + symbol;
        }
        const request: Dict = {
            'type': 'subscribe',
            'channelType': 'user',
            'accountId': accountId,
        };
        const message = this.extend (request, params);
        const orders = await this.watchPublic (messageHash, topic, message);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    /**
     * @method
     * @name drift#watchMyTrades
     * @see https://data.api.drift.trade/playground
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let accountId = undefined;
        [ accountId, params ] = await this.handleAccountId (params, 'watchBalance', 'accountId', 'account_id', this.accountId);
        const topic = 'user@' + accountId;
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += '@' + symbol;
        }
        const request: Dict = {
            'type': 'subscribe',
            'channelType': 'user',
            'accountId': accountId,
        };
        const message = this.extend (request, params);
        const trades = await this.watchPublic (messageHash, topic, message);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    parseWsOrder (order, market = undefined) {
        //
        // {
        //     "recordType": "OrderRecord",
        //     "ts": 1711152000,
        //     "txSig": "<signature>",
        //     "txSigIndex": 0,
        //     "slot": 250000000,
        //     "user": "<pubkey>",
        //     "status": "open",
        //     "orderType": "limit",
        //     "marketType": "perp",
        //     "marketFilter": "perp_0",
        //     "orderId": 179,
        //     "userOrderId": 179,
        //     "marketIndex": 0,
        //     "price": "185.500000",
        //     "baseAssetAmount": "1.000000000",
        //     "quoteAssetAmount": "185.500000",
        //     "baseAssetAmountFilled": "0.000000000",
        //     "quoteAssetAmountFilled": "0.000000",
        //     "direction": "long",
        //     "reduceOnly": false,
        //     "triggerPrice": "0.000000",
        //     "triggerCondition": "above",
        //     "existingPositionDirection": "long",
        //     "postOnly": false,
        //     "immediateOrCancel": false,
        //     "oraclePriceOffset": "0.000000",
        //     "auctionDuration": 0,
        //     "auctionStartPrice": "0.000000",
        //     "auctionEndPrice": "0.000000",
        //     "maxTs": 0,
        //     "symbol": "SOL-PERP",
        //     "lastActionStatus": "open",
        //     "lastActionExplanation": "none",
        //     "lastUpdatedTs": 1711152000,
        //     "cumulativeFee": "0.000000"
        // }
        //
        // {
        //     "recordType": "OrderActionRecord",
        //     "ts": 1711152059,
        //     "txSig": "<signature>",
        //     "txSigIndex": 0,
        //     "slot": 250000000,
        //     "action": "fill",
        //     "actionExplanation": "orderFilledWithMatch",
        //     "marketIndex": 0,
        //     "marketType": "perp",
        //     "marketFilter": "perp_0",
        //     "filler": "<pubkey>",
        //     "fillRecordId": "123456",
        //     "taker": "<pubkey>",
        //     "takerOrderId": "789",
        //     "takerOrderDirection": "long",
        //     "maker": "<pubkey>",
        //     "makerOrderId": "456",
        //     "makerOrderDirection": "short",
        //     "baseAssetAmountFilled": "1.000000000",
        //     "quoteAssetAmountFilled": "185.500000",
        //     "takerFee": "0.139000",
        //     "makerFee": "-0.028000",
        //     "makerRebate": "0.028000",
        //     "referrerReward": "0.000000",
        //     "fillerReward": "0.000000",
        //     "quoteAssetAmountSurplus": "0.000000",
        //     "spotFulfillmentMethodFee": "0.000000",
        //     "oraclePrice": "185.500000",
        //     "takerOrderBaseAssetAmount": "1.000000000",
        //     "takerOrderCumulativeBaseAssetAmountFilled": "1.000000000",
        //     "takerOrderCumulativeQuoteAssetAmountFilled": "185.500000",
        //     "takerExistingQuoteEntryAmount": "0.000000",
        //     "takerExistingBaseAssetAmount": "0.000000000",
        //     "makerOrderBaseAssetAmount": "10.000000000",
        //     "makerOrderCumulativeBaseAssetAmountFilled": "5.000000000",
        //     "makerOrderCumulativeQuoteAssetAmountFilled": "927.500000",
        //     "makerExistingQuoteEntryAmount": "0.000000",
        //     "makerExistingBaseAssetAmount": "0.000000000",
        //     "user": "<pubkey>",
        //     "symbol": "SOL-PERP",
        //     "bitFlags": 0
        // }
        //
        const orderId = this.safeInteger2 (order, 'orderId', 'makerOrderId');
        const marketId = this.safeString (order, 'symbol');
        market = this.market (marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeTimestamp (order, 'ts');
        const price = this.safeString (order, 'price');
        const amount = this.safeString2 (order, 'baseAssetAmount', 'makerOrderBaseAssetAmount');
        const direction = this.safeString2 (order, 'direction', 'makerOrderDirection');
        const side = (direction === 'long') ? 'buy' : 'sell';
        const type = this.safeStringLower (order, 'orderType');
        let rawStatus = this.safeString (order, 'status');
        const action = this.safeString (order, 'action');
        if (action === 'cancel') {
            rawStatus = 'cancelled';
        }
        const status = this.parseOrderStatus (rawStatus);
        const triggerPrice = this.safeNumber (order, 'triggerPrice');
        return this.safeOrder ({
            'info': order,
            'symbol': symbol,
            'id': orderId,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': timestamp,
            'type': type,
            'timeInForce': undefined,
            'postOnly': this.safeBool (order, 'postOnly'),
            'reduceOnly': this.safeBool (order, 'reduceOnly'),
            'side': side,
            'price': price,
            'stopPrice': triggerPrice,
            'triggerPrice': triggerPrice,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': status,
            'trades': undefined,
        });
    }

    handleUser (client: Client, message) {
        const data = this.safeList (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const record = data[i];
            const recordType = this.safeString (record, 'recordType');
            if (recordType === 'OrderRecord') {
                this.handleOrder (client, record);
            } else if (recordType === 'OrderActionRecord') {
                const action = this.safeString (record, 'action');
                if (action === 'cancel') {
                    this.handleOrder (client, record);
                } else if (action === 'fill') {
                    this.handleMyTrade (client, record);
                }
            }
        }
    }

    handleOrder (client: Client, message) {
        const parsed = this.parseWsOrder (message);
        const symbol = this.safeString (parsed, 'symbol');
        const orderId = this.safeString (parsed, 'id');
        if (symbol !== undefined) {
            if (this.orders === undefined) {
                const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const cachedOrders = this.orders;
            const orders = this.safeDict (cachedOrders.hashmap, symbol, {});
            const order = this.safeDict (orders, orderId);
            if (order !== undefined) {
                const fee = this.safeValue (order, 'fee');
                if (fee !== undefined) {
                    parsed['fee'] = fee;
                }
                const fees = this.safeList (order, 'fees');
                if (fees !== undefined) {
                    parsed['fees'] = fees;
                }
                parsed['trades'] = this.safeList (order, 'trades');
                parsed['timestamp'] = this.safeInteger (order, 'timestamp');
                parsed['datetime'] = this.safeString (order, 'datetime');
            }
            cachedOrders.append (parsed);
            client.resolve (this.orders, 'orders');
            const messageHashSymbol = 'orders@' + symbol;
            client.resolve (this.orders, messageHashSymbol);
        }
    }

    handleMyTrade (client: Client, message) {
        const messageHash = 'myTrades';
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const trade = this.parseWsTrade (message, market);
        let trades = this.myTrades;
        if (trades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            trades = new ArrayCacheBySymbolById (limit);
            this.myTrades = trades;
        }
        trades.append (trade);
        client.resolve (trades, messageHash);
        const symbolSpecificMessageHash = messageHash + '@' + symbol;
        client.resolve (trades, symbolSpecificMessageHash);
    }

    handleErrorMessage (client: Client, message): Bool {
        //
        // {"type":"error","message":"Auth is needed."}
        //
        const type = this.safeString (message, 'type');
        if (type !== 'error') {
            return false;
        }
        const errorMessage = this.safeString (message, 'message');
        try {
            const feedback = this.id + ' ' + this.json (message);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorMessage, feedback);
            return false;
        } catch (error) {
            if (error instanceof AuthenticationError) {
                const messageHash = 'authenticated';
                client.reject (error, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            } else {
                client.reject (error);
            }
            return true;
        }
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const methods: Dict = {
            'subscribe': this.handleSubscribe,
            'candle': this.handleOHLCV,
            'orderbook': this.handleOrderBook,
            'user': this.handleUser,
        };
        const type = this.safeString (message, 'type');
        if ((type === 'subscribe') || (type === 'subscription')) {
            this.handleSubscribe (client, message);
            return;
        }
        const channelType = this.safeString (message, 'channelType');
        const method = this.safeValue (methods, channelType);
        if (method !== undefined) {
            method.call (this, client, message);
            return;
        }
        if ('candle' in message) {
            this.handleOHLCV (client, message);
        }
    }

    handleSubscribe (client: Client, message) {
        //
        // {
        //     "type": "subscription",
        //     "message": "Subscribed to SOL/USDC:USDC 1",
        //     "channelType": "candle",
        //     "channel": "candle:SOL/USDC:USDC:1",
        //     "symbol": "SOL/USDC:USDC",
        //     "resolution": "1"
        // }
        //
        return message;
    }
}
