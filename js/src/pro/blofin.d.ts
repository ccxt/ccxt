import blofinRest from '../blofin.js';
import type { Int, MarketInterface, Trade, OrderBook, Strings, Ticker, Tickers, OHLCV } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class blofin extends blofinRest {
    describe(): any;
    ping(client: any): string;
    handleWsPong(client: Client, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleWsTrades(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: MarketInterface): Trade;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    handleWsOrderBook(client: Client, message: any): void;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleWsTicker(client: Client, message: any): void;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    handleWsOHLCV(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
    watchMultipleWrapper(channelName: string, callerMethodName: string, symbolsArray: any, params?: {}): Promise<any>;
}
