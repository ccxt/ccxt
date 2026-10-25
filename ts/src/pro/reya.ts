// ---------------------------------------------------------------------------

import reyaRest from '../reya.js';
import { BadRequest, ExchangeError } from '../base/errors.js';
import { ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import Client from '../base/ws/Client.js';
import type { Dict, Int, OrderBook, Ticker, Trade } from '../base/types.js';
import type { WsOrderBook } from '../base/ws/OrderBook.js';

export default class reya extends reyaRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTrades': true,
            },
            'urls': {
                'api': { 'ws': 'wss://ws.reya.xyz' },
                'test': { 'ws': 'wss://websocket-devnet.reya-cronos.network' },
            },
            'options': { 'tradesLimit': 1000 },
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
            return;
        }
        if (channel === undefined || (type !== 'subscribed' && type !== 'channel_data')) {
            return;
        }
        const data = this.safeValue (message, (type === 'subscribed') ? 'contents' : 'data');
        if (data === undefined) {
            return;
        }
        if (channel.endsWith ('/depth')) {
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
