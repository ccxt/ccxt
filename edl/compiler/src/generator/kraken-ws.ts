/**
 * Kraken WebSocket Client Generator
 * Generates TypeScript WebSocket client code for Kraken exchange
 */

/**
 * Kraken-specific WebSocket configuration
 */
export interface KrakenWebSocketConfig {
    /**
     * Exchange ID
     */
    exchangeId: string;

    /**
     * Public WebSocket endpoint URL
     */
    publicEndpoint: string;

    /**
     * Private WebSocket endpoint URL (authenticated)
     */
    privateEndpoint: string;

    /**
     * Supported channels
     */
    channels: {
        ticker: string;
        trade: string;
        book: string;
        ohlc: string;
        spread: string;
        openOrders: string;
    };

    /**
     * Authentication configuration
     */
    auth?: {
        type: 'token' | 'signature';
        endpoint?: string;
    };
}

/**
 * Default Kraken WebSocket configuration
 */
export const DEFAULT_KRAKEN_CONFIG: KrakenWebSocketConfig = {
    exchangeId: 'kraken',
    publicEndpoint: 'wss://ws.kraken.com',
    privateEndpoint: 'wss://ws-auth.kraken.com',
    channels: {
        ticker: 'ticker',
        trade: 'trade',
        book: 'book',
        ohlc: 'ohlc',
        spread: 'spread',
        openOrders: 'openOrders',
    },
};

/**
 * Generate Kraken WebSocket client TypeScript code
 * @param config - Kraken WebSocket configuration
 * @returns Generated TypeScript code as string
 */
export function generateKrakenWsClient(config: KrakenWebSocketConfig = DEFAULT_KRAKEN_CONFIG): string {
    const className = capitalize(config.exchangeId);

    return `/**
 * ${className} WebSocket Client
 * Auto-generated from EDL WebSocket definition
 */

import { Exchange } from '../base/Exchange.js';
import type { Ticker, Trade, OrderBook, Order, Dict } from '../base/types.js';

export interface ${className}WsOptions {
    /**
     * Request ID counter for tracking requests
     */
    reqId?: number;
}

export class ${className}Ws extends Exchange {
    protected wsPublicUrl: string;
    protected wsPrivateUrl: string;
    protected reqIdCounter: number;
    protected subscriptions: Map<string, any>;

    constructor(config: any = {}) {
        super(config);
        this.wsPublicUrl = '${config.publicEndpoint}';
        this.wsPrivateUrl = '${config.privateEndpoint}';
        this.reqIdCounter = 1;
        this.subscriptions = new Map();
    }

    /**
     * Get next request ID for tracking
     */
    protected getReqId(): number {
        return this.reqIdCounter++;
    }

${generateWatchTickerMethod(config)}

${generateWatchTradesMethod(config)}

${generateWatchOrderBookMethod(config)}

${generateWatchOrdersMethod(config)}

${generateSubscribePayloadMethod(config)}

${generateUnsubscribePayloadMethod(config)}

${generateMessageHandlerMethod(config)}

    /**
     * Handle WebSocket connection
     */
    protected async watchPublic(channel: string, symbol: string, params: any = {}): Promise<any> {
        const url = this.wsPublicUrl;
        const messageHash = \`\${channel}:\${symbol}\`;

        const subscription = this.generateSubscribePayload(channel, symbol, params);

        return await this.watch(url, messageHash, subscription, messageHash);
    }

    /**
     * Handle private WebSocket connection
     */
    protected async watchPrivate(channel: string, params: any = {}): Promise<any> {
        await this.authenticate();

        const url = this.wsPrivateUrl;
        const messageHash = channel;

        const subscription = this.generateSubscribePayload(channel, undefined, params);

        return await this.watch(url, messageHash, subscription, messageHash);
    }

    /**
     * Authenticate for private channels
     */
    protected async authenticate(): Promise<void> {
        this.checkRequiredCredentials();

        // Kraken uses token-based authentication
        // The token must be obtained from REST API endpoint
        const token = await this.getWebSocketToken();

        const authMessage = {
            event: 'subscribe',
            subscription: {
                name: 'ownTrades',
                token: token
            }
        };

        // Store auth token for reuse
        (this as any).wsAuthToken = token;
    }

    /**
     * Get WebSocket authentication token from REST API
     */
    protected async getWebSocketToken(): Promise<string> {
        // This would typically call the REST API endpoint
        // to get a WebSocket token
        // For now, return a placeholder
        return 'ws_token_placeholder';
    }
}
`;
}

/**
 * Generate subscribe payload for a channel
 * @param channel - Channel name
 * @param symbol - Trading pair symbol (optional for private channels)
 * @param params - Additional parameters
 * @returns Subscribe message payload
 */
export function generateSubscribePayload(
    channel: string,
    symbol?: string,
    params: any = {}
): any {
    const reqId = params.reqId || 1;

    const payload: any = {
        event: 'subscribe',
    };

    // Add request ID for tracking
    if (reqId) {
        payload.reqid = reqId;
    }

    // Public channels require pair
    if (symbol) {
        payload.pair = [symbol];
    }

    // Build subscription object
    const subscription: any = {
        name: channel,
    };

    // Add depth for orderbook
    if (channel === 'book' && params.depth) {
        subscription.depth = params.depth;
    }

    // Add interval for OHLC
    if (channel === 'ohlc' && params.interval) {
        subscription.interval = params.interval;
    }

    payload.subscription = subscription;

    return payload;
}

/**
 * Generate unsubscribe payload for a channel
 * @param channel - Channel name
 * @param symbol - Trading pair symbol (optional for private channels)
 * @param params - Additional parameters
 * @returns Unsubscribe message payload
 */
export function generateUnsubscribePayload(
    channel: string,
    symbol?: string,
    params: any = {}
): any {
    const reqId = params.reqId || 1;

    const payload: any = {
        event: 'unsubscribe',
    };

    // Add request ID for tracking
    if (reqId) {
        payload.reqid = reqId;
    }

    // Public channels require pair
    if (symbol) {
        payload.pair = [symbol];
    }

    // Build subscription object
    const subscription: any = {
        name: channel,
    };

    payload.subscription = subscription;

    return payload;
}

/**
 * Generate message handler code for a specific channel
 * @param channel - Channel name to handle
 * @returns Message handler code as string
 */
export function generateMessageHandler(channel: string): string {
    switch (channel) {
        case 'ticker':
            return `
    /**
     * Handle ticker message
     */
    protected handleTickerMessage(message: any): Ticker {
        const [channelId, data, channelName, pair] = message;

        return {
            symbol: this.safeSymbol(pair),
            timestamp: this.milliseconds(),
            datetime: this.iso8601(this.milliseconds()),
            high: this.safeNumber(data, 'h', [1]),
            low: this.safeNumber(data, 'l', [1]),
            bid: this.safeNumber(data, 'b', [0]),
            bidVolume: this.safeNumber(data, 'b', [2]),
            ask: this.safeNumber(data, 'a', [0]),
            askVolume: this.safeNumber(data, 'a', [2]),
            vwap: this.safeNumber(data, 'p', [1]),
            open: this.safeNumber(data, 'o'),
            close: this.safeNumber(data, 'c', [0]),
            last: this.safeNumber(data, 'c', [0]),
            previousClose: undefined,
            change: undefined,
            percentage: undefined,
            average: undefined,
            baseVolume: this.safeNumber(data, 'v', [1]),
            quoteVolume: undefined,
            info: message,
        };
    }
`;

        case 'trade':
            return `
    /**
     * Handle trade message
     */
    protected handleTradeMessage(message: any): Trade[] {
        const [channelId, trades, channelName, pair] = message;

        return trades.map((trade: any) => ({
            id: this.safeString(trade, 0),
            timestamp: this.safeTimestamp(trade, 2),
            datetime: this.iso8601(this.safeTimestamp(trade, 2)),
            symbol: this.safeSymbol(pair),
            type: undefined,
            side: this.safeString(trade, 3) === 'b' ? 'buy' : 'sell',
            price: this.safeNumber(trade, 0),
            amount: this.safeNumber(trade, 1),
            cost: undefined,
            fee: undefined,
            info: trade,
        }));
    }
`;

        case 'book':
            return `
    /**
     * Handle order book message
     */
    protected handleOrderBookMessage(message: any): OrderBook {
        const [channelId, data, channelName, pair] = message;

        const orderbook: any = {
            symbol: this.safeSymbol(pair),
            bids: [],
            asks: [],
            timestamp: this.milliseconds(),
            datetime: this.iso8601(this.milliseconds()),
            nonce: undefined,
        };

        // Process snapshot or update
        if (data.as) {
            // Snapshot (asks)
            orderbook.asks = data.as.map((entry: any) => [
                this.safeNumber(entry, 0),
                this.safeNumber(entry, 1),
            ]);
        }
        if (data.bs) {
            // Snapshot (bids)
            orderbook.bids = data.bs.map((entry: any) => [
                this.safeNumber(entry, 0),
                this.safeNumber(entry, 1),
            ]);
        }

        // Process updates
        if (data.a) {
            // Ask updates
            orderbook.asks = data.a.map((entry: any) => [
                this.safeNumber(entry, 0),
                this.safeNumber(entry, 1),
            ]);
        }
        if (data.b) {
            // Bid updates
            orderbook.bids = data.b.map((entry: any) => [
                this.safeNumber(entry, 0),
                this.safeNumber(entry, 1),
            ]);
        }

        return orderbook;
    }
`;

        case 'openOrders':
            return `
    /**
     * Handle open orders message
     */
    protected handleOpenOrdersMessage(message: any): Order[] {
        const [orders, channelName] = message;

        const result: Order[] = [];

        for (const [orderId, order] of Object.entries(orders)) {
            result.push({
                id: orderId,
                clientOrderId: this.safeString(order, 'userref'),
                timestamp: this.safeTimestamp(order, 'opentm'),
                datetime: this.iso8601(this.safeTimestamp(order, 'opentm')),
                lastTradeTimestamp: undefined,
                symbol: this.safeSymbol(this.safeString(order, 'descr.pair')),
                type: this.safeString(order, 'descr.ordertype'),
                timeInForce: undefined,
                postOnly: undefined,
                side: this.safeString(order, 'descr.type'),
                price: this.safeNumber(order, 'descr.price'),
                stopPrice: this.safeNumber(order, 'stopprice'),
                amount: this.safeNumber(order, 'vol'),
                cost: this.safeNumber(order, 'cost'),
                average: this.safeNumber(order, 'price'),
                filled: this.safeNumber(order, 'vol_exec'),
                remaining: this.safeNumber(order, 'vol') - this.safeNumber(order, 'vol_exec'),
                status: this.parseOrderStatus(this.safeString(order, 'status')),
                fee: undefined,
                trades: undefined,
                info: order,
            });
        }

        return result;
    }
`;

        default:
            return `
    /**
     * Handle generic channel message
     */
    protected handleMessage(message: any): any {
        return message;
    }
`;
    }
}

// Helper functions

function capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function generateWatchTickerMethod(config: KrakenWebSocketConfig): string {
    return `    /**
     * Watch ticker updates for a symbol
     * @param symbol - Trading pair symbol
     * @param params - Additional parameters
     * @returns Promise resolving to Ticker
     */
    public async watchTicker(symbol: string, params: any = {}): Promise<Ticker> {
        await this.loadMarkets();
        const market = this.market(symbol);
        const krakenSymbol = market.id;

        return await this.watchPublic('${config.channels.ticker}', krakenSymbol, params);
    }`;
}

function generateWatchTradesMethod(config: KrakenWebSocketConfig): string {
    return `    /**
     * Watch trade updates for a symbol
     * @param symbol - Trading pair symbol
     * @param params - Additional parameters
     * @returns Promise resolving to Trade array
     */
    public async watchTrades(symbol: string, params: any = {}): Promise<Trade[]> {
        await this.loadMarkets();
        const market = this.market(symbol);
        const krakenSymbol = market.id;

        return await this.watchPublic('${config.channels.trade}', krakenSymbol, params);
    }`;
}

function generateWatchOrderBookMethod(config: KrakenWebSocketConfig): string {
    return `    /**
     * Watch order book updates for a symbol
     * @param symbol - Trading pair symbol
     * @param limit - Order book depth (10, 25, 100, 500, 1000)
     * @param params - Additional parameters
     * @returns Promise resolving to OrderBook
     */
    public async watchOrderBook(symbol: string, limit?: number, params: any = {}): Promise<OrderBook> {
        await this.loadMarkets();
        const market = this.market(symbol);
        const krakenSymbol = market.id;

        const requestParams = { ...params };
        if (limit !== undefined) {
            requestParams.depth = limit;
        }

        return await this.watchPublic('${config.channels.book}', krakenSymbol, requestParams);
    }`;
}

function generateWatchOrdersMethod(config: KrakenWebSocketConfig): string {
    return `    /**
     * Watch user's open orders
     * @param symbol - Trading pair symbol (optional)
     * @param since - Timestamp in ms (optional)
     * @param limit - Max number of orders (optional)
     * @param params - Additional parameters
     * @returns Promise resolving to Order array
     */
    public async watchOrders(symbol?: string, since?: number, limit?: number, params: any = {}): Promise<Order[]> {
        await this.loadMarkets();

        return await this.watchPrivate('${config.channels.openOrders}', params);
    }`;
}

function generateSubscribePayloadMethod(config: KrakenWebSocketConfig): string {
    return `    /**
     * Generate subscription payload for a channel
     * @param channel - Channel name
     * @param symbol - Trading pair symbol (optional for private channels)
     * @param params - Additional parameters
     * @returns Subscription message object
     */
    protected generateSubscribePayload(channel: string, symbol?: string, params: any = {}): any {
        const reqId = this.getReqId();

        const payload: any = {
            event: 'subscribe',
            reqid: reqId,
        };

        // Public channels require pair
        if (symbol) {
            payload.pair = [symbol];
        }

        // Build subscription object
        const subscription: any = {
            name: channel,
        };

        // Add depth for orderbook
        if (channel === '${config.channels.book}' && params.depth) {
            subscription.depth = params.depth;
        }

        // Add interval for OHLC
        if (channel === '${config.channels.ohlc}' && params.interval) {
            subscription.interval = params.interval;
        }

        // Add token for private channels
        if (params.token) {
            subscription.token = params.token;
        }

        payload.subscription = subscription;

        return payload;
    }`;
}

function generateUnsubscribePayloadMethod(config: KrakenWebSocketConfig): string {
    return `    /**
     * Generate unsubscription payload for a channel
     * @param channel - Channel name
     * @param symbol - Trading pair symbol (optional for private channels)
     * @param params - Additional parameters
     * @returns Unsubscription message object
     */
    protected generateUnsubscribePayload(channel: string, symbol?: string, params: any = {}): any {
        const reqId = this.getReqId();

        const payload: any = {
            event: 'unsubscribe',
            reqid: reqId,
        };

        // Public channels require pair
        if (symbol) {
            payload.pair = [symbol];
        }

        // Build subscription object
        const subscription: any = {
            name: channel,
        };

        payload.subscription = subscription;

        return payload;
    }`;
}

function generateMessageHandlerMethod(config: KrakenWebSocketConfig): string {
    return `    /**
     * Handle incoming WebSocket message
     * @param client - WebSocket client
     * @param message - Incoming message
     */
    protected handleMessage(client: any, message: any): void {
        if (Array.isArray(message)) {
            // Data message format: [channelID, data, channelName, pair]
            const channelName = message[2];

            switch (channelName) {
                case '${config.channels.ticker}':
                    this.handleTickerMessage(message);
                    break;
                case '${config.channels.trade}':
                    this.handleTradeMessage(message);
                    break;
                case '${config.channels.book}':
                    this.handleOrderBookMessage(message);
                    break;
                case '${config.channels.openOrders}':
                    this.handleOpenOrdersMessage(message);
                    break;
                default:
                    // Unknown channel
                    break;
            }
        } else if (message.event) {
            // Event message (subscriptionStatus, systemStatus, heartbeat, etc.)
            this.handleEventMessage(message);
        }
    }

    /**
     * Handle event messages (non-data messages)
     */
    protected handleEventMessage(message: any): void {
        const event = message.event;

        switch (event) {
            case 'subscriptionStatus':
                // Handle subscription confirmation
                if (message.status === 'subscribed') {
                    // Subscription successful
                } else if (message.status === 'error') {
                    // Subscription error
                    this.handleError(message);
                }
                break;
            case 'systemStatus':
                // Handle system status
                break;
            case 'heartbeat':
                // Handle heartbeat
                break;
            default:
                // Unknown event
                break;
        }
    }

    /**
     * Handle WebSocket errors
     */
    protected handleError(message: any): void {
        const errorMessage = message.errorMessage || 'Unknown WebSocket error';
        throw new Error(errorMessage);
    }`;
}
