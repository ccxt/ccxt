/**
 * WebSocket Message Schemas
 * TypeScript interfaces for WebSocket messages in CCXT
 */

// ============================================================
// Base WebSocket Message Structures
// ============================================================

/**
 * Base WebSocket message structure
 */
export interface WebSocketMessage {
    event?: string;
    stream?: string;
    data?: any;
}

/**
 * Binance specific stream wrapper
 * Binance wraps data in a stream container
 */
export interface BinanceStreamWrapper {
    stream: string;
    data: any;
}

// ============================================================
// Binance Ticker Messages
// ============================================================

/**
 * Binance 24hr Ticker Message
 * Rolling window price change statistics
 */
export interface BinanceTickerMessage {
    /** Event type */
    e: '24hrTicker';
    /** Event time */
    E: number;
    /** Symbol */
    s: string;
    /** Price change */
    p: string;
    /** Price change percent */
    P: string;
    /** Weighted average price */
    w: string;
    /** Last price */
    c: string;
    /** Last quantity */
    Q: string;
    /** Open price */
    o: string;
    /** High price */
    h: string;
    /** Low price */
    l: string;
    /** Total traded base asset volume */
    v: string;
    /** Total traded quote asset volume */
    q: string;
    /** Statistics open time */
    O: number;
    /** Statistics close time */
    C: number;
    /** First trade ID */
    F: number;
    /** Last trade ID */
    L: number;
    /** Total number of trades */
    n: number;
}

// ============================================================
// Binance Trade Messages
// ============================================================

/**
 * Binance Trade Message
 * Individual trade execution
 */
export interface BinanceTradeMessage {
    /** Event type */
    e: 'trade';
    /** Event time */
    E: number;
    /** Symbol */
    s: string;
    /** Trade ID */
    t: number;
    /** Price */
    p: string;
    /** Quantity */
    q: string;
    /** Buyer order ID */
    b: number;
    /** Seller order ID */
    a: number;
    /** Trade time */
    T: number;
    /** Is buyer maker */
    m: boolean;
    /** Ignore */
    M: boolean;
}

// ============================================================
// Binance Order Book Messages
// ============================================================

/**
 * Binance Depth Update Message
 * Order book incremental update
 */
export interface BinanceDepthMessage {
    /** Event type */
    e: 'depthUpdate';
    /** Event time */
    E: number;
    /** Symbol */
    s: string;
    /** First update ID */
    U: number;
    /** Final update ID */
    u: number;
    /** Bids to be updated [price, quantity] */
    b: [string, string][];
    /** Asks to be updated [price, quantity] */
    a: [string, string][];
}

// ============================================================
// Binance Order Messages (Private)
// ============================================================

/**
 * Binance Order Update Message
 * User order execution report (private stream)
 */
export interface BinanceOrderUpdateMessage {
    /** Event type */
    e: 'executionReport';
    /** Event time */
    E: number;
    /** Symbol */
    s: string;
    /** Client order ID */
    c: string;
    /** Side (BUY, SELL) */
    S: string;
    /** Order type (LIMIT, MARKET, etc.) */
    o: string;
    /** Time in force (GTC, IOC, FOK) */
    f: string;
    /** Order quantity */
    q: string;
    /** Order price */
    p: string;
    /** Stop price */
    P: string;
    /** Iceberg quantity */
    F: string;
    /** OrderListId */
    g: number;
    /** Original client order ID */
    C: string;
    /** Current execution type (NEW, CANCELED, REPLACED, REJECTED, TRADE, EXPIRED) */
    x: string;
    /** Current order status (NEW, PARTIALLY_FILLED, FILLED, CANCELED, REJECTED, EXPIRED) */
    X: string;
    /** Order reject reason */
    r: string;
    /** Order ID */
    i: number;
    /** Last executed quantity */
    l: string;
    /** Cumulative filled quantity */
    z: string;
    /** Last executed price */
    L: string;
    /** Commission amount */
    n: string;
    /** Commission asset */
    N: string | null;
    /** Transaction time */
    T: number;
    /** Trade ID */
    t: number;
    /** Ignore */
    I: number;
    /** Is working (currently on the order book) */
    w: boolean;
    /** Is trade the maker side */
    m: boolean;
    /** Ignore */
    M: boolean;
    /** Order creation time */
    O: number;
    /** Cumulative quote asset transacted quantity */
    Z: string;
    /** Last quote asset transacted quantity */
    Y: string;
    /** Quote order quantity */
    Q: string;
}

// ============================================================
// Message Type Mapping
// ============================================================

/**
 * WebSocket message type discriminator
 */
export type WebSocketMessageType =
    | 'ticker'
    | 'trade'
    | 'depth'
    | 'orderUpdate'
    | 'unknown';

/**
 * Message type to schema mapping
 * Maps message event types to their corresponding TypeScript interfaces
 */
export interface MessageTypeMap {
    ticker: BinanceTickerMessage;
    trade: BinanceTradeMessage;
    depth: BinanceDepthMessage;
    orderUpdate: BinanceOrderUpdateMessage;
}

/**
 * Message type detector
 * Determines the message type from a raw WebSocket message
 */
export function detectMessageType(message: any): WebSocketMessageType {
    if (!message || typeof message !== 'object') {
        return 'unknown';
    }

    // Check for Binance stream wrapper
    const data = message.data || message;
    const eventType = data.e;

    switch (eventType) {
        case '24hrTicker':
            return 'ticker';
        case 'trade':
            return 'trade';
        case 'depthUpdate':
            return 'depth';
        case 'executionReport':
            return 'orderUpdate';
        default:
            return 'unknown';
    }
}

/**
 * Type guard for Binance ticker messages
 */
export function isBinanceTickerMessage(message: any): message is BinanceTickerMessage {
    return message?.e === '24hrTicker';
}

/**
 * Type guard for Binance trade messages
 */
export function isBinanceTradeMessage(message: any): message is BinanceTradeMessage {
    return message?.e === 'trade';
}

/**
 * Type guard for Binance depth messages
 */
export function isBinanceDepthMessage(message: any): message is BinanceDepthMessage {
    return message?.e === 'depthUpdate';
}

/**
 * Type guard for Binance order update messages
 */
export function isBinanceOrderUpdateMessage(message: any): message is BinanceOrderUpdateMessage {
    return message?.e === 'executionReport';
}

// ============================================================
// Message Schema Registry
// ============================================================

/**
 * Schema registry for WebSocket messages
 * Maps exchange and message type to schema definitions
 */
export interface MessageSchemaRegistry {
    binance: {
        ticker: BinanceTickerMessage;
        trade: BinanceTradeMessage;
        depth: BinanceDepthMessage;
        orderUpdate: BinanceOrderUpdateMessage;
    };
}

/**
 * Get schema for a specific exchange and message type
 */
export function getMessageSchema(
    exchange: 'binance',
    messageType: WebSocketMessageType
): any {
    const schemas: Record<string, Record<WebSocketMessageType, any>> = {
        binance: {
            ticker: 'BinanceTickerMessage',
            trade: 'BinanceTradeMessage',
            depth: 'BinanceDepthMessage',
            orderUpdate: 'BinanceOrderUpdateMessage',
            unknown: null,
        },
    };

    return schemas[exchange]?.[messageType] || null;
}
