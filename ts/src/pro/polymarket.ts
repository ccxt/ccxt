import polymarket from '../polymarket.js';
import { ArrayCache } from '../base/ws/Cache.js';
import type {
    Int, Str, Dict,
    OrderBook, Trade, Ticker,
} from '../base/types.js';

// ---------------------------------------------------------------------------

const WS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/market';

// ---------------------------------------------------------------------------

/**
 * @class polymarketPro
 * @augments polymarket
 */
export default class polymarketPro extends polymarket {
    describe () {
        return this.deepExtend (super.describe (), {
            'pro': true,
            'has': {
                'watchOrderBook': true,
                'watchTrades': true,
                'watchTicker': true,
            },
        });
    }

    // -----------------------------------------------------------------------
    // onConnected — fires once when the WS connection opens.
    // The Polymarket CLOB WS requires an initial "market" handshake before
    // any subscribe operations are accepted.
    // -----------------------------------------------------------------------

    // -----------------------------------------------------------------------
    // handleMessage — entry point for every incoming WS frame
    // -----------------------------------------------------------------------

    handleMessage (client: any, message: any) {
        // Polymarket sends "PONG" text frames as keepalive responses; skip them.
        if (typeof message === 'string') {
            return;
        }
        const events: any[] = Array.isArray (message) ? message : [ message ];
        for (const event of events) {
            if (!event || typeof event !== 'object') {
                continue;
            }
            const eventType = this.safeString (event, 'event_type');
            if (eventType === 'book') {
                this.handleOrderBookSnapshot (client, event);
            } else if (eventType === 'price_change') {
                this.handleOrderBookDelta (client, event);
            } else if (eventType === 'last_trade_price') {
                this.handleTrade (client, event);
            }
            // tick_size_change events are silently ignored for now
        }
    }

    // -----------------------------------------------------------------------
    // Order-book snapshot — replaces the full book
    // -----------------------------------------------------------------------

    handleOrderBookSnapshot (client: any, event: any) {
        const tokenId = this.safeString (event, 'asset_id');
        const symbol = this.tokenIdToSymbol (tokenId);
        if (symbol === undefined) {
            return;
        }
        if (this.orderbooks[symbol] === undefined) {
            this.orderbooks[symbol] = this.orderBook ([]);
        }
        const ob = this.orderbooks[symbol];
        const timestamp = this.parsePolyTimestamp (this.safeString (event, 'timestamp'));
        const rawBids = this.safeList (event, 'bids', []) as any[];
        const rawAsks = this.safeList (event, 'asks', []) as any[];
        const bids = rawBids.map ((b: any) => [ this.safeNumber (b, 'price'), this.safeNumber (b, 'size') ]);
        const asks = rawAsks.map ((a: any) => [ this.safeNumber (a, 'price'), this.safeNumber (a, 'size') ]);
        ob.reset ({
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
        });
        client.resolve (ob, 'orderbook::' + symbol);
        client.resolve (ob, 'ticker::' + symbol);
    }

    // -----------------------------------------------------------------------
    // Order-book delta — applies incremental price-level changes
    // -----------------------------------------------------------------------

    handleOrderBookDelta (client: any, event: any) {
        const timestamp = this.parsePolyTimestamp (this.safeString (event, 'timestamp'));
        const changes: any[] = this.safeList (event, 'price_changes', []) as any[];
        const updated: Set<string> = new Set ();
        for (const change of changes) {
            const tokenId = this.safeString (change, 'asset_id');
            const symbol = this.tokenIdToSymbol (tokenId);
            if (symbol === undefined || this.orderbooks[symbol] === undefined) {
                continue; // no snapshot yet — discard delta
            }
            const ob = this.orderbooks[symbol];
            const price = this.safeNumber (change, 'price') as number;
            const size = this.safeNumber (change, 'size') as number;
            const isBuy = (this.safeStringUpper (change, 'side') || '') === 'BUY';
            const side = isBuy ? ob.bids : ob.asks;
            // storeArray([price, size]) inserts/updates or removes (size=0) the level
            (side as any).storeArray ([ price, size ]);
            ob.timestamp = timestamp;
            ob.datetime = this.iso8601 (timestamp);
            updated.add (symbol);
        }
        for (const symbol of updated) {
            const ob = this.orderbooks[symbol];
            client.resolve (ob, 'orderbook::' + symbol);
            client.resolve (ob, 'ticker::' + symbol);
        }
    }

    // -----------------------------------------------------------------------
    // Trade — builds a unified Trade and appends it to the trades cache
    // -----------------------------------------------------------------------

    handleTrade (client: any, event: any) {
        const tokenId = this.safeString (event, 'asset_id');
        const symbol = this.tokenIdToSymbol (tokenId);
        if (symbol === undefined) {
            return;
        }
        const timestamp = this.parsePolyTimestamp (this.safeString (event, 'timestamp'));
        const price = this.safeNumber (event, 'price') as number;
        const amount = this.safeNumber (event, 'size') as number;
        const market = this.safeMarket (symbol);
        const trade = this.safeTrade ({
            'id': this.safeString (event, 'transaction_hash'),
            'info': event,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': this.safeStringLower (event, 'side'),
            'takerOrMaker': 'taker',
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
        if (!this.trades) {
            this.trades = {};
        }
        if (this.trades[symbol] === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        this.trades[symbol].append (trade);
        client.resolve (this.trades[symbol], 'trades::' + symbol);
    }

    // -----------------------------------------------------------------------
    // watchOrderBook
    // -----------------------------------------------------------------------

    /**
     * Streams live order-book updates for a single Polymarket outcome token.
     * Resolves on every snapshot or delta received from the WS feed.
     * @param outcome  CCXT outcome symbol (e.g. "ELECTION/YES:USDC")
     * @param limit    Optional depth limit applied after resolving
     * @param params   Extra params (passed through but currently unused)
     */
    async watchOrderBook (outcome: Str, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const outcomeObj = this.outcome (outcome);
        const tokenId = this.safeString (outcomeObj, 'id');
        const symbol = this.safeString (outcomeObj, 'symbol');
        const messageHash = 'orderbook::' + symbol;
        const subscribeHash = 'subscribe::' + tokenId;
        const subscribeMsg = { 'operation': 'subscribe', 'assets_ids': [ tokenId ] };
        const orderbook = await this.watch (WS_URL, messageHash, subscribeMsg, subscribeHash);
        return orderbook.limit (limit);
    }

    // -----------------------------------------------------------------------
    // watchTrades
    // -----------------------------------------------------------------------

    /**
     * Streams live fills for a single Polymarket outcome token.
     * Each resolution delivers the full trades cache filtered by since/limit.
     * @param outcome  CCXT outcome symbol
     * @param since    Optional Unix timestamp (ms) lower bound
     * @param limit    Optional max number of trades to return
     * @param params   Extra params (unused)
     */
    async watchTrades (outcome: Str, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const outcomeObj = this.outcome (outcome);
        const tokenId = this.safeString (outcomeObj, 'id');
        const symbol = this.safeString (outcomeObj, 'symbol');
        const messageHash = 'trades::' + symbol;
        const subscribeHash = 'subscribe::' + tokenId;
        const subscribeMsg = { 'operation': 'subscribe', 'assets_ids': [ tokenId ] };
        const trades = await this.watch (WS_URL, messageHash, subscribeMsg, subscribeHash);
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    // -----------------------------------------------------------------------
    // watchTicker — derived from the live order-book feed
    // -----------------------------------------------------------------------

    /**
     * Streams a synthetic Ticker derived from order-book snapshots and deltas.
     * mid-price = (best bid + best ask) / 2.
     * @param outcome  CCXT outcome symbol
     * @param params   Extra params (unused)
     */
    async watchTicker (outcome: Str, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const outcomeObj = this.outcome (outcome);
        const tokenId = this.safeString (outcomeObj, 'id');
        const symbol = this.safeString (outcomeObj, 'symbol');
        const messageHash = 'ticker::' + symbol;
        const subscribeHash = 'subscribe::' + tokenId;
        const subscribeMsg = { 'operation': 'subscribe', 'assets_ids': [ tokenId ] };
        if (this.orderbooks[symbol] === undefined) {
            this.orderbooks[symbol] = this.orderBook ([]);
        }
        const ob = await this.watch (WS_URL, messageHash, subscribeMsg, subscribeHash);
        const bids = ob.bids as any;
        const asks = ob.asks as any;
        const bestBid = bids && bids.length ? bids[0][0] : undefined;
        const bestAsk = asks && asks.length ? asks[0][0] : undefined;
        const mid = (bestBid !== undefined && bestAsk !== undefined)
            ? (bestBid + bestAsk) / 2
            : (bestBid ?? bestAsk);
        const market = this.safeMarket (symbol);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': ob.timestamp,
            'datetime': ob.datetime,
            'high': undefined,
            'low': undefined,
            'bid': bestBid,
            'bidVolume': bids && bids.length ? bids[0][1] : undefined,
            'ask': bestAsk,
            'askVolume': asks && asks.length ? asks[0][1] : undefined,
            'vwap': undefined,
            'open': undefined,
            'close': mid,
            'last': mid,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': mid,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ob,
        }, market);
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Resolves a CLOB token ID to a unified CCXT outcome symbol.
     * Uses this.marketsById populated by loadMarkets() — market.id = clobTokenId.
     */
    tokenIdToSymbol (tokenId: string): string | undefined {
        if (!tokenId) {
            return undefined;
        }
        const market = (this.markets_by_id as any)?.[tokenId];
        return market ? (market['symbol'] as string) : undefined;
    }

    /**
     * Parses a Polymarket timestamp (Unix milliseconds as a string) to a number.
     */
    parsePolyTimestamp (raw: string | undefined): number {
        if (raw === undefined) {
            return this.milliseconds ();
        }
        const n = parseInt (raw, 10);
        return isNaN (n) ? this.milliseconds () : n;
    }
}
