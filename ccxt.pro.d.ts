import {
    Balances,
    Dictionary,
    Exchange as BaseExchange,
    OHLCV,
    Order,
    OrderBook,
    Params,
    Ticker,
    Trade,
} from 'ccxt';

declare module 'ccxt.pro' {
    export class Exchange extends BaseExchange {
        watchTicker (symbol: string, params?: Params): Promise<Ticker>;
        watchTickers (symbols?: string[], params?: Params): Promise<Dictionary<Ticker>>;
        watchOrderBook (symbol: string, limit?: number, params?: Params): Promise<OrderBook>;
        watchOHLCV (symbol: string, timeframe?: string, since?: number, limit?: number, params?: Params): Promise<OHLCV[]>;
        // watchStatus (params?: Params): Promise<any>;
        watchTrades (symbol: string, since?: number, limit?: number, params?: Params): Promise<Trade[]>;
        watchBalance (params?: Params): Promise<Balances>;
        watchOrder (id: string, symbol: string, params?: Params): Promise<Order>;
        watchOrders (symbol?: string, since?: number, limit?: number, params?: Params): Promise<Order[]>;
        watchOpenOrders (symbol?: string, since?: number, limit?: number, params?: Params): Promise<Order[]>;
        watchClosedOrders (symbol?: string, since?: number, limit?: number, params?: Params): Promise<Order[]>;
        watchMyTrades (symbol?: string, since?: any, limit?: any, params?: Params): Promise<Trade>;
        // watchDeposits (currency?: string, since?: number, limit?: number, params?: Params): Promise<Transaction[]>;
        // watchWithdrawals (currency?: string, since?: number, limit?: number, params?: Params): Promise<Transaction[]>;
    }
}
