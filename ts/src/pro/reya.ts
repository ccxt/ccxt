// ---------------------------------------------------------------------------

import reyaRest from '../reya.js';
import { BadRequest, ExchangeError } from '../base/errors.js';
import { ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';
import type { Balances, Dict, Int, Market, OHLCV, Order, OrderBook, Position, Str, Strings, Ticker, Trade } from '../base/types.js';
import type { WsOrderBook } from '../base/ws/OrderBook.js';

export default class reya extends reyaRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchPositions': true,
                'watchTicker': true,
                'watchTrades': true,
            },
            'urls': {
                'api': { 'ws': 'wss://ws.reya.xyz' },
                'test': { 'ws': 'wss://websocket-devnet.reya-cronos.network' },
            },
            'options': { 'tradesLimit': 1000, 'ordersLimit': 1000, 'OHLCVLimit': 1000 },
            'streaming': { 'keepAlive': 15000 },
        });
    }

    /** @ignore */
    override ping (client: Client): Dict {
        return { 'type': 'ping' };
    }

    /** @ignore */
    async subscribeReyaChannel (channel: string, params: Dict = {}): Promise<any> {
        const url = this.urls['api']['ws'];
        const request = this.extend (params, { 'type': 'subscribe', 'channel': channel });
        return await this.watch (url, channel, request, channel);
    }

    /** @ignore */
    reyaWalletChannel (resource: string): string {
        // wallet channels are public reads keyed by the owner address; options.accountId selects the account
        this.reyaAccountId ();
        const address = this.reyaWalletAddress ();
        return '/v2/wallet/' + address.toLowerCase () + '/' + resource;
    }

    /**
     * @method
     * @name reya#watchOrderBook
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-trading-v2.yaml
     * @description watch the bounded top-100 order book; each connection starts with a fresh snapshot
     * @param {string} symbol unified market symbol
     * @param {int} [limit] the supported subscription depth is 100
     * @param {object} [params] extra subscription parameters
     * @returns {object} an order book structure
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        if (limit !== undefined && limit !== 100) {
            throw new BadRequest (this.id + ' watchOrderBook supports a fixed depth of 100');
        }
        const market = this.market (symbol);
        const channel = '/v2/market/' + market['id'] + '/depth';
        const request = this.extend (params, { 'type': 'subscribe', 'channel': channel });
        const orderbook: WsOrderBook = await this.watch (this.urls['api']['ws'], channel, request, channel);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name reya#watchTicker
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-trading-v2.yaml
     * @description watch perpetual market statistics, including mark and index prices
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra subscription parameters
     * @returns {object} a ticker structure
     */
    override async watchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        return await this.subscribeReyaChannel ('/v2/perpMarket/' + market['id'] + '/summary', params);
    }

    /**
     * @method
     * @name reya#watchTrades
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-trading-v2.yaml
     * @description watch settled public executions
     * @param {string} symbol unified market symbol
     * @param {int} [since] earliest timestamp in milliseconds
     * @param {int} [limit] maximum trades
     * @param {object} [params] extra subscription parameters
     * @returns {object[]} trade structures
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const trades = await this.subscribeReyaChannel ('/v2/market/' + market['id'] + '/perpExecutions', params);
        let tradeLimit = limit;
        if (this.newUpdates) {
            tradeLimit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (trades, since, tradeLimit, 'timestamp', true);
    }

    /**
     * @method
     * @name reya#watchOHLCV
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-trading-v2.yaml
     * @description watch the newest candle as it forms; the stream carries merged candles (fill prices, else the mark price), the series fetchOHLCV returns with params.priceSource = 'merged'
     * @param {string} symbol unified market symbol
     * @param {string} [timeframe] candle interval
     * @param {int} [since] earliest candle timestamp in milliseconds
     * @param {int} [limit] maximum candles
     * @param {object} [params] extra subscription parameters
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const resolution = this.safeString (this.timeframes, timeframe, timeframe);
        const ohlcv = await this.subscribeReyaChannel ('/v2/candles/' + market['id'] + '/' + resolution, params);
        let ohlcvLimit = limit;
        if (this.newUpdates) {
            ohlcvLimit = ohlcv.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (ohlcv, since, ohlcvLimit, 0, true);
    }

    /**
     * @method
     * @name reya#watchBalance
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-trading-v2.yaml
     * @description watch the rUSD margin of the account in options.accountId, in the structure fetchBalance returns; the subscription is refused while Reya cannot value the account, and a later call subscribes again
     * @param {object} [params] extra subscription parameters
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    override async watchBalance (params: Dict = {}): Promise<Balances> {
        await this.loadMarkets ();
        return await this.subscribeReyaChannel (this.reyaWalletChannel ('accountSummaries'), params);
    }

    /**
     * @method
     * @name reya#watchPositions
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-trading-v2.yaml
     * @description watch the valued open positions of the account in options.accountId; each update returns all of its open positions, in the structure fetchPositions returns
     * @param {string[]} [symbols] unified market symbols
     * @param {int} [since] not used by reya.watchPositions
     * @param {int} [limit] maximum positions
     * @param {object} [params] extra subscription parameters
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    override async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const marketSymbols = this.marketSymbols (symbols);
        const positions = await this.subscribeReyaChannel (this.reyaWalletChannel ('positionRisk'), params);
        return this.filterBySymbolsSinceLimit (positions, marketSymbols, since, limit, true);
    }

    /**
     * @method
     * @name reya#watchOrders
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-trading-v2.yaml
     * @description watch the orders of the account in options.accountId, starting with its open orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] earliest order timestamp in milliseconds
     * @param {int} [limit] maximum orders
     * @param {object} [params] extra subscription parameters
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const orders = await this.subscribeReyaChannel (this.reyaWalletChannel ('orderChanges'), params);
        const symbolResolved = (symbol === undefined) ? undefined : this.symbol (symbol);
        let ordersLimit = limit;
        if (this.newUpdates) {
            ordersLimit = orders.getLimit (symbolResolved, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbolResolved, since, ordersLimit, true);
    }

    /**
     * @method
     * @name reya#watchMyTrades
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/asyncapi-trading-v2.yaml
     * @description watch the settled executions of the account in options.accountId, as fetchMyTrades returns them
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] earliest trade timestamp in milliseconds
     * @param {int} [limit] maximum trades
     * @param {object} [params] extra subscription parameters
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const trades = await this.subscribeReyaChannel (this.reyaWalletChannel ('perpExecutions'), params);
        const symbolResolved = (symbol === undefined) ? undefined : this.symbol (symbol);
        let tradesLimit = limit;
        if (this.newUpdates) {
            tradesLimit = trades.getLimit (symbolResolved, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbolResolved, since, tradesLimit, true);
    }

    /** @ignore */
    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        return [
            this.safeTimestamp (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    /** @ignore */
    handleOHLCV (client: Client, channel: string, data: any) {
        // channel: /v2/candles/{symbol}/{resolution}
        const parts = channel.split ('/');
        const market = this.safeMarket (this.safeString (parts, 3));
        const symbol = market['symbol'];
        const timeframe = this.findTimeframe (this.safeString (parts, 4));
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!((timeframe as string) in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][(timeframe as string)] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][(timeframe as string)];
        // candles arrive in ascending t; a candle replaces the stored one with the same t
        const rows = Array.isArray (data) ? data : this.safeList (data, 'data', []);
        for (let i = 0; i < rows.length; i++) {
            stored.append (this.parseOHLCV (rows[i], market));
        }
        client.resolve (stored, channel);
    }

    /** @ignore */
    handleBalance (client: Client, channel: string, data: any) {
        // a frame carries only the accounts that were recalculated
        const rows = Array.isArray (data) ? data : this.safeList (data, 'data', []);
        const accountId = this.reyaAccountId ();
        const account = this.numberToString (accountId);
        for (let i = 0; i < rows.length; i++) {
            if (this.safeString (rows[i], 'accountId') === account) {
                this.balance = this.parseReyaAccountSummary ([ rows[i] ], accountId);
                client.resolve (this.balance, channel);
            }
        }
    }

    /** @ignore */
    handlePositions (client: Client, channel: string, message: Dict, data: any) {
        // the snapshot holds every account's rows; each live frame replaces the rows of one account
        const account = this.numberToString (this.reyaAccountId ());
        const frameAccount = this.safeString (message, 'accountId');
        if (frameAccount !== undefined && frameAccount !== account) {
            return;
        }
        const rows = Array.isArray (data) ? data : this.safeList (data, 'data', []);
        const positions = [];
        for (let i = 0; i < rows.length; i++) {
            if (this.safeString (rows[i], 'accountId') === account) {
                positions.push (this.parsePosition (rows[i]));
            }
        }
        client.resolve (positions, channel);
    }

    /** @ignore */
    handleOrders (client: Client, channel: string, data: any) {
        // the snapshot holds the open orders; updates carry every later order event, in order
        const rows = Array.isArray (data) ? data : this.safeList (data, 'data', []);
        const account = this.numberToString (this.reyaAccountId ());
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.orders;
        for (let i = 0; i < rows.length; i++) {
            if (this.safeString (rows[i], 'accountId') === account) {
                stored.append (this.parseOrder (rows[i]));
            }
        }
        client.resolve (stored, channel);
    }

    /** @ignore */
    handleMyTrades (client: Client, channel: string, data: any) {
        const rows = Array.isArray (data) ? data : this.safeList (data, 'data', []);
        const account = this.numberToString (this.reyaAccountId ());
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.myTrades;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (this.safeString (row, 'makerAccountId') === account || this.safeString (row, 'takerAccountId') === account) {
                stored.append (this.parseReyaTrade (row, undefined, account));
            }
        }
        client.resolve (stored, channel);
    }

    /** @ignore */
    handleOrderBook (client: Client, channel: string, data: Dict) {
        const symbol = this.safeSymbol (this.safeString (data, 'symbol'));
        const snapshot = this.safeString (data, 'type') === 'SNAPSHOT';
        if (!(symbol in this.orderbooks)) {
            if (!snapshot) {
                return;
            }
            this.orderbooks[symbol] = this.orderBook ({}, 100);
        }
        const orderbook = this.orderbooks[symbol];
        const timestamp = this.safeInteger (data, 'updatedAt');
        if (snapshot) {
            orderbook.reset (this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'px', 'qty'));
        } else {
            this.handleReyaDeltas (orderbook['bids'], this.safeList (data, 'bids', []));
            this.handleReyaDeltas (orderbook['asks'], this.safeList (data, 'asks', []));
            // updatedAt is not a sequence: different updates may share a millisecond.
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        client.resolve (orderbook, channel);
    }

    /** @ignore */
    handleReyaDeltas (bookSide: any, levels: any[]) {
        for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            bookSide.store (this.safeNumber (level, 'px'), this.safeNumber (level, 'qty'));
        }
    }

    /** @ignore */
    handleTrades (client: Client, channel: string, data: any) {
        const rows = Array.isArray (data) ? data : this.safeList (data, 'data', []);
        const symbols: Dict = {};
        for (let i = 0; i < rows.length; i++) {
            const trade = this.parseTrade (rows[i]);
            const symbol = trade['symbol'];
            if (symbol === undefined) {
                continue;
            }
            if (!(symbol in this.trades)) {
                const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
                this.trades[symbol] = new ArrayCacheBySymbolById (tradesLimit);
            }
            const stored = this.trades[symbol];
            stored.append (trade);
            symbols[symbol] = true;
        }
        const keys = Object.keys (symbols);
        for (let i = 0; i < keys.length; i++) {
            client.resolve (this.trades[keys[i]], channel);
        }
    }

    /** @ignore */
    override handleMessage (client: Client, message: Dict) {
        const type = this.safeString (message, 'type');
        if (type === 'pong') {
            client.lastPong = this.milliseconds ();
            return;
        }
        const channel = this.safeString (message, 'channel');
        if (type === 'error') {
            client.reject (new ExchangeError (this.id + ' ' + this.safeString (message, 'message')), channel);
            if (channel !== undefined && (channel in client.subscriptions)) {
                // a refused subscription, such as a valuation channel while a price is stale, is sent again by the next watch call
                delete client.subscriptions[channel];
            }
            return;
        }
        // disconnectNotice has no channel: the connection closes with code 1012 and the next watch call reconnects
        if (channel === undefined || (type !== 'subscribed' && type !== 'channel_data')) {
            return;
        }
        const data = this.safeValue (message, (type === 'subscribed') ? 'contents' : 'data');
        if (data === undefined) {
            return;
        }
        if (channel.startsWith ('/v2/wallet/')) {
            if (channel.endsWith ('/accountSummaries')) {
                this.handleBalance (client, channel, data);
            } else if (channel.endsWith ('/positionRisk')) {
                this.handlePositions (client, channel, message, data);
            } else if (channel.endsWith ('/orderChanges')) {
                this.handleOrders (client, channel, data);
            } else if (channel.endsWith ('/perpExecutions')) {
                this.handleMyTrades (client, channel, data);
            }
        } else if (channel.startsWith ('/v2/candles/')) {
            this.handleOHLCV (client, channel, data);
        } else if (channel.endsWith ('/depth')) {
            this.handleOrderBook (client, channel, data);
        } else if (channel.endsWith ('/summary')) {
            const ticker = this.parseTicker (data);
            const symbol = ticker['symbol'];
            if (symbol !== undefined) {
                this.tickers[symbol] = ticker;
            }
            client.resolve (ticker, channel);
        } else if (channel.endsWith ('/perpExecutions')) {
            this.handleTrades (client, channel, data);
        }
    }
}
