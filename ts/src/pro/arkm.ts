
//  ---------------------------------------------------------------------------

import arkmRest from '../arkm.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import type { Int, OHLCV, Str, Strings, OrderBook, Order, Trade, Balances, Ticker, Dict, Position } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class arkm extends arkmRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': false,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': false,
                'watchOrders': true,
                // 'watchMyTrades': true,
                'watchTicker': true,
                // 'watchTickers': true,
                'watchBalance': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://arkm.com/ws',
                },
            },
            'options': {
                'ws': {
                    // 'gunzip': true,
                },
                'watchBalance': {
                    'fetchBalanceSnapshot': true, // needed to be true to keep track of used and free balance
                    'awaitBalanceSnapshot': false, // whether to wait for the balance snapshot before providing updates
                },
                'watchOrderBook': {
                    'depth': 100, // 5, 10, 20, 50, 100
                    'interval': 500, // 100, 200, 500, 1000
                },
                'watchOrderBookForSymbols': {
                    'depth': 100, // 5, 10, 20, 50, 100
                    'interval': 500, // 100, 200, 500, 1000
                },
                'watchTrades': {
                    'ignoreDuplicates': true,
                },
            },
            'streaming': {
                'keepAlive': 300000, // 5 minutes
            },
        });
    }

    handleMessage (client: Client, message) {
        //
        // confirmation
        //
        //     {channel: 'confirmations', confirmationId: 'myCustomId-123'}
        //
        // if (!this.handleErrorMessage (client, message)) {
        //     return;
        // }
        //
        const methods: Dict = {
            'ticker': this.handleTicker,
            'candles': this.handleOHLCV,
            'l2_updates': this.handleOrderBook,
            'trades': this.handleTrades,
            'balances': this.handleBalance,
            'positions': this.handlePositions,
            'order_statuses': this.handleOrder,
            'trigger_orders': this.handleOrder,
            // 'confirmations': this.handleTicker,
        };
        const channel = this.safeString (message, 'channel');
        if (channel === 'confirmations') {
            return;
        }
        // const type = this.safeString (message, 'type');
        // if (type !== 'update' && type !== 'snapshot') {
        //     debugger;
        // }
        const method = this.safeValue (methods, channel);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    async subscribe (messageHash: string, rawChannel: string, params: Dict): Promise<any> {
        const subscriptionHash = messageHash;
        const request: Dict = {
            'args': {
                'channel': rawChannel,
                'params': params,
            },
            'confirmationId': this.uuid (),
            'method': 'subscribe',
        };
        return await this.watch (this.urls['api']['ws'], messageHash, request, subscriptionHash);
    }

    /**
     * @method
     * @name arkm#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://arkm.com/docs#stream/ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const requestArg = {
            'symbol': market['id'],
        };
        const messageHash = 'ticker::' + market['symbol'];
        return await this.subscribe (messageHash, 'ticker', this.extend (params, requestArg));
    }

    handleTicker (client: Client, message) {
        //
        // {
        //   channel: 'ticker',
        //   type: 'update',
        //   data: {
        //     symbol: 'BTC_USDT',
        //     baseSymbol: 'BTC',
        //     quoteSymbol: 'USDT',
        //     price: '118962.74',
        //     price24hAgo: '118780.42',
        //     high24h: '120327.96',
        //     low24h: '118217.28',
        //     volume24h: '32.89729',
        //     quoteVolume24h: '3924438.7146048',
        //     markPrice: '0',
        //     indexPrice: '118963.080293501',
        //     fundingRate: '0',
        //     nextFundingRate: '0',
        //     nextFundingTime: 0,
        //     productType: 'spot',
        //     openInterest: '0',
        //     indexCurrency: 'USDT',
        //     usdVolume24h: '3924438.7146048',
        //     openInterestUSD: '0'
        //   }
        // }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId, undefined);
        const symbol = market['symbol'];
        const ticker = this.parseWsTicker (data, market);
        this.tickers[symbol] = ticker;
        client.resolve (ticker, 'ticker::' + symbol);
        // if (this.safeString (message, 'dataType') === 'all@ticker') {
        //     client.resolve (ticker, this.getMessageHash ('ticker'));
        // }
    }

    parseWsTicker (message, market = undefined) {
        // same dict as REST api
        return this.parseTicker (message, market);
    }

    /**
     * @method
     * @name arkm#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://arkm.com/docs#stream/candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const rawTimeframe = this.safeString (this.timeframes, timeframe, timeframe);
        const requestArg = {
            'symbol': market['id'],
            'duration': rawTimeframe,
        };
        const messageHash = 'ohlcv::' + market['symbol'] + '::' + rawTimeframe;
        const result = await this.subscribe (messageHash, 'candles', this.extend (requestArg, params));
        const ohlcv = result;
        if (this.newUpdates) {
            limit = ohlcv.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        // {
        //   channel: 'candles',
        //   type: 'update',
        //   data: {
        //     symbol: 'BTC_USDT',
        //     time: '1755076380000000',
        //     duration: 60000000,
        //     open: '120073.01',
        //     high: '120073.01',
        //     low: '120073.01',
        //     close: '120073.01',
        //     volume: '0',
        //     quoteVolume: '0'
        //   }
        // }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId, undefined);
        const symbol = market['symbol'];
        const duration = this.safeInteger (data, 'duration');
        const timeframe = this.findTimeframeByDuration (duration);
        const messageHash = 'ohlcv::' + symbol + '::' + timeframe;
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.handleOption ('watchOHLCV', 'limit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        const parsed = this.parseWsOHLCV (data, market);
        stored.append (parsed);
        client.resolve (stored, messageHash);
        return message;
    }

    parseWsOHLCV (ohlcv, market = undefined): OHLCV {
        // same as REST api
        return this.parseOHLCV (ohlcv, market);
    }

    /**
     * @method
     * @name arkm#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://arkm.com/docs#stream/l2_updates
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const requestArg = {
            'symbol': market['id'],
            'snapshot': true,
        };
        const messageHash = 'orderBook::' + market['symbol'];
        const orderBook = await this.subscribe (messageHash, 'l2_updates', this.extend (requestArg, params));
        return orderBook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        // snapshot:
        //
        // {
        //     channel: 'l2_updates',
        //     type: 'snapshot',
        //     data: {
        //         symbol: 'BTC_USDT',
        //         group: '0.01',
        //         asks: [  [Object], [Object], ... ],
        //         bids: [  [Object], [Object], ... ],
        //         lastTime: 1755115180608299
        //     }
        // }
        //
        // update:
        //
        // {
        //   channel: "l2_updates",
        //   type: "update",
        //   data: {
        //     symbol: "BTC_USDT",
        //     group: "0.01",
        //     side: "sell",
        //     size: "0.05295",
        //     price: "122722.76",
        //     revisionId: 2455511217,
        //     time: 1755115736475207,
        //   }
        // }
        //
        const data = this.safeDict (message, 'data');
        const type = this.safeString (message, 'type');
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'orderBook::' + symbol;
        const timestamp = this.safeIntegerProduct (data, 'lastTime', 0.000001);
        if (!(symbol in this.orderbooks)) {
            const ob = this.orderBook ({});
            ob['symbol'] = symbol;
            this.orderbooks[symbol] = ob;
        }
        const storedOrderBook = this.orderbooks[symbol];
        if (type === 'snapshot') {
            const parsedOrderBook = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'price', 'size');
            storedOrderBook.reset (parsedOrderBook);
        } else if (type === 'update') {
            const side = this.safeString (data, 'side');
            const bookside = (side === 'buy') ? storedOrderBook['bids'] : storedOrderBook['asks'];
            this.handleDelta (bookside, data);
            storedOrderBook['timestamp'] = timestamp;
            storedOrderBook['datetime'] = this.iso8601 (timestamp);
        }
        this.orderbooks[symbol] = storedOrderBook;
        client.resolve (this.orderbooks[symbol], messageHash);
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 'price', 'size');
        bookside.storeArray (bidAsk);
    }

    /**
     * @method
     * @name arkm#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://arkm.com/docs#stream/trades
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const requestArg = {
            'symbol': market['id'],
        };
        const messageHash = 'trade::' + market['symbol'];
        const trades = await this.subscribe (messageHash, 'trades', this.extend (requestArg, params));
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        // {
        //     channel: 'trades',
        //     type: 'update',
        //     data: {
        //         symbol: 'BTC_USDT',
        //         revisionId: 2643896903,
        //         size: '0.00261',
        //         price: '118273.2',
        //         takerSide: 'buy',
        //         time: 1755200320146389
        //     }
        // }
        //
        const data = this.safeDict (message, 'data');
        const marketId = this.safeString (data, 'symbol');
        const symbol = this.safeSymbol (marketId);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const parsed = this.parseWsTrade (data);
        const stored = this.trades[symbol];
        stored.append (parsed);
        client.resolve (stored, 'trade::' + symbol);
    }

    parseWsTrade (trade, market = undefined) {
        // same as REST api
        return this.parseTrade (trade, market);
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const expires = (this.milliseconds () + this.safeInteger (this.options, 'requestExpiration', 5000)) * 1000; // need macroseconds
        const wsOptions: Dict = this.safeDict (this.options, 'ws', {});
        const authenticated = this.safeString (wsOptions, 'token');
        if (authenticated === undefined) {
            const method = 'GET';
            const bodyStr = '';
            const path = 'ws';
            const payload = this.apiKey + expires.toString () + method.toUpperCase () + '/' + path + bodyStr;
            const decodedSecret = this.base64ToBinary (this.secret);
            const signature = this.hmac (this.encode (payload), decodedSecret, sha256, 'base64');
            const defaultOptions: Dict = {
                'ws': {
                    'options': {
                        'headers': {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Arkham-Api-Key': this.apiKey,
                            'Arkham-Expires': expires,
                            'Arkham-Signature': signature,
                        },
                    },
                },
            };
            this.extendExchangeOptions (defaultOptions);
            this.client (this.urls['api']['ws']);
        }
    }

    /**
     * @method
     * @name bitfinex#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://arkm.com/docs#stream/balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {str} [params.type] spot or contract if not provided this.options['defaultType'] is used
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance (params = {}): Promise<Balances> {
        await this.authenticate ();
        await this.loadMarkets ();
        const requestArg = {
            'snapshot': true,
        };
        const messageHash = 'balances';
        const result = await this.subscribe (messageHash, 'balances', this.extend (requestArg, params));
        return result;
    }

    handleBalance (client: Client, message, subscription) {
        //
        // snapshot:
        //
        //     {
        //         channel: 'balances',
        //         type: 'snapshot',
        //         data: [
        //           {
        //             subaccountId: 0,
        //             symbol: 'USDT',
        //             balance: '7.035335375',
        //             free: '7.035335375',
        //             priceUSDT: '1',
        //             balanceUSDT: '7.035335375',
        //             freeUSDT: '7.035335375',
        //             lastUpdateReason: 'withdrawalFee',
        //             lastUpdateTime: '1753905990432678',
        //             lastUpdateId: 250483404,
        //             lastUpdateAmount: '-2'
        //           },
        //           {
        //             subaccountId: 0,
        //             symbol: 'SOL',
        //             balance: '0.03',
        //             free: '0.03',
        //             priceUSDT: '197.37823276',
        //             balanceUSDT: '5.921346982',
        //             freeUSDT: '5.921346982',
        //             lastUpdateReason: 'orderFill',
        //             lastUpdateTime: '1753777760560164',
        //             lastUpdateId: 248588190,
        //             lastUpdateAmount: '0.03'
        //           }
        //         ]
        //     }
        //
        // update:
        //
        //     {
        //         channel: 'balances',
        //         type: 'update',
        //         data: {
        //             subaccountId: 0,
        //             symbol: 'USDT',
        //             balance: '7.028357615',
        //             free: '7.028357615',
        //             priceUSDT: '1',
        //             balanceUSDT: '7.028357615',
        //             freeUSDT: '7.028357615',
        //             lastUpdateReason: 'tradingFee',
        //             lastUpdateTime: '1755240882544056',
        //             lastUpdateId: 2697860787,
        //             lastUpdateAmount: '-0.00697776'
        //         }
        //     }
        //
        const type = this.safeString (message, 'type');
        let parsed = {};
        if (type === 'snapshot') {
            // response same as REST api
            const data = this.safeList (message, 'data');
            parsed = this.parseWsBalance (data);
            parsed['info'] = message;
            this.balance = parsed;
        } else {
            const data = this.safeDict (message, 'data');
            const balancesArray = [ data ];
            parsed = this.parseWsBalance (balancesArray);
            const currencyId = this.safeString (data, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            this.balance[code] = parsed[code];
        }
        const messageHash = 'balances';
        client.resolve (this.safeBalance (this.balance), messageHash);
    }

    parseWsBalance (balance) {
        // same as REST api
        return this.parseBalance (balance);
    }

    /**
     * @method
     * @name arkm#watchPositions
     * @see https://arkm.com/docs#stream/positions
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        await this.authenticate ();
        await this.loadMarkets ();
        let messageHash = 'positions';
        if (!this.isEmpty (symbols)) {
            symbols = this.marketSymbols (symbols);
            messageHash += '::' + symbols.join (',');
        }
        this.positions = new ArrayCacheBySymbolBySide ();
        const requestArg = {
            'snapshot': false, // no need for initial snapshot, it's done in REST api
        };
        const newPositions = await this.subscribe (messageHash, 'positions', this.extend (requestArg, params));
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit (this.positions, symbols, since, limit, true);
    }

    handlePositions (client, message) {
        //
        // snapshot:
        //
        //     {
        //         channel: 'positions',
        //         type: 'snapshot',
        //         data: [
        //           {
        //             subaccountId: 0,
        //             symbol: 'SOL_USDT_PERP',
        //             base: '0.059',
        //             quote: '-11.50618',
        //             openBuySize: '0',
        //             openSellSize: '0',
        //             openBuyNotional: '0',
        //             openSellNotional: '0',
        //             lastUpdateReason: 'orderFill',
        //             lastUpdateTime: '1755251065621402',
        //             lastUpdateId: 2709589783,
        //             lastUpdateBaseDelta: '0.059',
        //             lastUpdateQuoteDelta: '-11.50618',
        //             breakEvenPrice: '195.02',
        //             markPrice: '195',
        //             value: '11.505',
        //             pnl: '-0.00118',
        //             initialMargin: '1.1505',
        //             maintenanceMargin: '0.6903',
        //             averageEntryPrice: '195.02'
        //           }
        //         ]
        //     }
        //
        const newPositions = [];
        if (this.positions === undefined) {
            this.positions = {};
        }
        const type = this.safeString (message, 'type');
        if (type === 'snapshot') {
            const data = this.safeList (message, 'data', []);
            for (let i = 0; i < data.length; i++) {
                const position = this.parseWsPosition (data[i]);
                if (this.safeInteger (position, 'entryPrice') !== 0) {
                    newPositions.push (position);
                    const symbol = this.safeString (position, 'symbol');
                    this.positions[symbol] = position;
                }
            }
        } else {
            const data = this.safeDict (message, 'data');
            const position = this.parseWsPosition (data);
            const symbol = this.safeString (position, 'symbol');
            this.positions[symbol] = position;
            newPositions.push (position);
        }
        const messageHashes = this.findMessageHashes (client, 'positions::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split ('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split (',');
            const positions = this.filterByArray (newPositions, 'symbol', symbols, false);
            if (!this.isEmpty (positions)) {
                client.resolve (positions, messageHash);
            }
        }
        const length = newPositions.length;
        if (length > 0) {
            client.resolve (newPositions, 'positions');
        }
    }

    parseWsPositions (positions: any[], symbols: string[] = undefined, params = {}): Position[] {
        symbols = this.marketSymbols (symbols);
        positions = this.toArray (positions);
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            const position = this.extend (this.parseWsPosition (positions[i], undefined), params);
            result.push (position);
        }
        return this.filterByArrayPositions (result, 'symbol', symbols, false);
    }

    parseWsPosition (position, market = undefined) {
        // same as REST api
        return this.parsePosition (position, market);
    }

    /**
     * @method
     * @name arkm#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://arkm.com/docs#stream/order_statuses
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.authenticate ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const requestArg = {
            'snapshot': false,
        };
        let isTriggerOrder = false;
        [ isTriggerOrder, params ] = this.handleOptionAndParams (params, 'watchOrders', 'trigger', false);
        const rawChannel = isTriggerOrder ? 'trigger_orders' : 'order_statuses';
        const messageHash = 'order::' + market['symbol'] + '::' + rawChannel;
        const orders = await this.subscribe (messageHash, rawChannel, this.extend (requestArg, params));
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client: Client, message) {
        //
        //     {
        //         channel: "order_statuses",
        //         type: "update",
        //         data: {
        //             orderId: 4200775347657,
        //             userId: 2959880,
        //             subaccountId: 0,
        //             symbol: "ARKM_USDT_PERP",
        //             time: "1755253639782186",
        //             side: "buy",
        //             type: "limitGtc",
        //             size: "10",
        //             price: "0.5",
        //             postOnly: false,
        //             reduceOnly: false,
        //             executedSize: "0",
        //             status: "cancelled",
        //             avgPrice: "0",
        //             executedNotional: "0",
        //             creditFeePaid: "0",
        //             marginBonusFeePaid: "0",
        //             quoteFeePaid: "0",
        //             arkmFeePaid: "0",
        //             revisionId: 2752963990,
        //             lastTime: "1755272026403545",
        //             clientOrderId: "",
        //             lastSize: "0",
        //             lastPrice: "0",
        //             lastCreditFee: "0",
        //             lastMarginBonusFee: "0",
        //             lastQuoteFee: "0",
        //             lastArkmFee: "0",
        //         }
        //     }
        //
        const channel = this.safeString (message, 'channel');
        const data = this.safeDict (message, 'data');
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        const order = this.parseWsOrder (data);
        orders.append (order);
        client.resolve (orders, 'orders');
        client.resolve (orders, 'order::' + order['symbol'] + '::' + channel);
    }

    parseWsOrder (order, market = undefined): Order {
        // same as REST api
        return this.parseOrder (order, market);
    }
}
