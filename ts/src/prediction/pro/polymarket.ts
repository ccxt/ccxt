import polymarketRest from '../polymarket.js';
import { Precise } from '../../base/Precise.js';
import { ArrayCache } from '../../base/ws/Cache.js';
import type {
    Int, Str, Dict,
    OrderBook, Trade, Ticker,
} from '../../base/types.js';

// ---------------------------------------------------------------------------

const WS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/market';

// ---------------------------------------------------------------------------

/**
 * @class polymarket
 * @augments polymarketRest
 */
export default class polymarket extends polymarketRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'pro': true,
            'has': {
                'watchOrderBook': true,
                'watchTrades': true,
                'watchTicker': true,
            },
        });
    }

    handleMessage (client: any, message: any) {
        // Polymarket sends "PONG" text frames as keepalive responses; skip them.
        if (typeof message === 'string') {
            return;
        }
        const events = Array.isArray (message) ? message : [ message ];
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
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

    handleOrderBookSnapshot (client: any, event: any) {
        const tokenId = this.safeString (event, 'asset_id');
        const symbol = this.tokenIdToSymbol (tokenId);
        if (symbol === undefined) {
            return;
        }
        if (this.orderbooks[symbol] === undefined) {
            this.orderbooks[symbol] = this.orderBook ([]);
        }
        const orderbook = this.orderbooks[symbol];
        const timestamp = this.parsePolyTimestamp (this.safeString (event, 'timestamp'));
        const rawBids = this.safeList (event, 'bids', []) as any[];
        const rawAsks = this.safeList (event, 'asks', []) as any[];
        const bids = [];
        for (let i = 0; i < rawBids.length; i++) {
            const b = rawBids[i];
            bids.push ([ this.safeNumber (b, 'price'), this.safeNumber (b, 'size') ]);
        }
        const asks = [];
        for (let j = 0; j < rawAsks.length; j++) {
            const a = rawAsks[j];
            asks.push ([ this.safeNumber (a, 'price'), this.safeNumber (a, 'size') ]);
        }
        orderbook.reset ({
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
        });
        client.resolve (orderbook, 'orderbook::' + symbol);
        client.resolve (orderbook, 'ticker::' + symbol);
    }

    handleOrderBookDelta (client: any, event: any) {
        const timestamp = this.parsePolyTimestamp (this.safeString (event, 'timestamp'));
        const changes = this.safeList (event, 'price_changes', []) as any[];
        const updated = {};
        for (let i = 0; i < changes.length; i++) {
            const change = changes[i];
            const tokenId = this.safeString (change, 'asset_id');
            const symbol = this.tokenIdToSymbol (tokenId);
            if (symbol === undefined || this.orderbooks[symbol] === undefined) {
                continue; // no snapshot yet — discard delta
            }
            const orderbook = this.orderbooks[symbol];
            const price = this.safeNumber (change, 'price') as number;
            const size = this.safeNumber (change, 'size') as number;
            const isBuy = this.safeStringUpper (change, 'side', '') === 'BUY';
            const side = isBuy ? orderbook['bids'] : orderbook['asks'];
            // storeArray([price, size]) inserts/updates or removes (size=0) the level
            const sideRef = side as any;
            sideRef.storeArray ([ price, size ]);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            updated[symbol] = true;
        }
        const updatedSymbols = Object.keys (updated);
        for (let k = 0; k < updatedSymbols.length; k++) {
            const symbol = updatedSymbols[k];
            const orderbook = this.orderbooks[symbol];
            client.resolve (orderbook, 'orderbook::' + symbol);
            client.resolve (orderbook, 'ticker::' + symbol);
        }
    }

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

    /**
     * Streams live order-book updates for a single Polymarket outcome token.
     * Resolves on every snapshot or delta received from the WS feed.
     * @param outcome  CCXT outcome symbol (e.g. "ELECTION/YES:USDC")
     * @param limit    Optional depth limit applied after resolving
     * @param params   Extra params (passed through but currently unused)
     */
    async watchOrderBook (symbol: Str, limit: Int = undefined, params = {}): Promise<OrderBook> {
        const outcome = symbol;
        await this.loadMarkets ();
        const outcomeObj = this.outcome (outcome);
        const tokenId = this.safeString (outcomeObj, 'id');
        symbol = this.safeString (outcomeObj, 'symbol');
        const messageHash = 'orderbook::' + symbol;
        const subscribeHash = 'subscribe::' + tokenId;
        const subscribeMsg = { 'operation': 'subscribe', 'assets_ids': [ tokenId ] };
        const orderbook = await this.watch (WS_URL, messageHash, subscribeMsg, subscribeHash);
        return orderbook.limit ();
    }

    /**
     * Streams live fills for a single Polymarket outcome token.
     * Each resolution delivers the full trades cache filtered by since/limit.
     * @param outcome  CCXT outcome symbol
     * @param since    Optional Unix timestamp (ms) lower bound
     * @param limit    Optional max number of trades to return
     * @param params   Extra params (unused)
     */
    async watchTrades (symbol: Str, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        const outcome = symbol;
        await this.loadMarkets ();
        const outcomeObj = this.outcome (outcome);
        const tokenId = this.safeString (outcomeObj, 'id');
        symbol = this.safeString (outcomeObj, 'symbol');
        const messageHash = 'trades::' + symbol;
        const subscribeHash = 'subscribe::' + tokenId;
        const subscribeMsg = { 'operation': 'subscribe', 'assets_ids': [ tokenId ] };
        const trades = await this.watch (WS_URL, messageHash, subscribeMsg, subscribeHash);
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * Streams a synthetic Ticker derived from order-book snapshots and deltas.
     * mid-price = (best bid + best ask) / 2.
     * @param outcome  CCXT outcome symbol
     * @param params   Extra params (unused)
     */
    async watchTicker (symbol: Str, params = {}): Promise<Ticker> {
        const outcome = symbol;
        await this.loadMarkets ();
        const outcomeObj = this.outcome (outcome);
        const tokenId = this.safeString (outcomeObj, 'id');
        symbol = this.safeString (outcomeObj, 'symbol');
        const messageHash = 'ticker::' + symbol;
        const subscribeHash = 'subscribe::' + tokenId;
        const subscribeMsg = { 'operation': 'subscribe', 'assets_ids': [ tokenId ] };
        if (this.orderbooks[symbol] === undefined) {
            this.orderbooks[symbol] = this.orderBook ([]);
        }
        const orderbook = await this.watch (WS_URL, messageHash, subscribeMsg, subscribeHash);
        const bids = orderbook['bids'] as any;
        const asks = orderbook['asks'] as any;
        let bestBid = undefined;
        let bestBidVolume = undefined;
        let bidsLength = 0;
        if (bids !== undefined) {
            bidsLength = bids.length;
        }
        if ((bids !== undefined) && (bidsLength > 0)) {
            bestBid = bids[0][0];
            bestBidVolume = bids[0][1];
        }
        let bestAsk = undefined;
        let bestAskVolume = undefined;
        let asksLength = 0;
        if (asks !== undefined) {
            asksLength = asks.length;
        }
        if ((asks !== undefined) && (asksLength > 0)) {
            bestAsk = asks[0][0];
            bestAskVolume = asks[0][1];
        }
        let mid = undefined;
        if ((bestBid !== undefined) && (bestAsk !== undefined)) {
            const sum = Precise.stringAdd (this.numberToString (bestBid), this.numberToString (bestAsk));
            mid = this.parseNumber (Precise.stringDiv (sum, '2'));
        } else if (bestBid !== undefined) {
            mid = bestBid;
        } else {
            mid = bestAsk;
        }
        const market = this.safeMarket (symbol);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': orderbook['timestamp'],
            'datetime': orderbook['datetime'],
            'high': undefined,
            'low': undefined,
            'bid': bestBid,
            'bidVolume': bestBidVolume,
            'ask': bestAsk,
            'askVolume': bestAskVolume,
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
            'info': orderbook,
        }, market);
    }

    /**
     * Resolves a CLOB token ID to a unified CCXT outcome symbol.
     * Uses this.marketsById populated by loadMarkets() — market.id = clobTokenId.
     */
    tokenIdToSymbol (tokenId: string): Str {
        if (!tokenId) {
            return undefined;
        }
        const marketsById = this.markets_by_id as any;
        const market = (marketsById !== undefined) ? marketsById[tokenId] : undefined;
        return market ? (market['symbol'] as string) : undefined;
    }

    /**
     * Parses a Polymarket timestamp (Unix milliseconds as a string) to a number.
     */
    parsePolyTimestamp (raw: Str): number {
        if (raw === undefined) {
            return this.milliseconds ();
        }
        const n = this.parseToInt (raw);
        if (n === undefined) {
            return this.milliseconds ();
        }
        return n;
    }
}
