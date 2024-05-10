import coinbaseinternationalRest from '../coinbaseinternational.js';
import { Ticker, Int, Trade, OrderBook, Market, Dict, Strings, FundingRate, FundingRates } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class coinbaseinternational extends coinbaseinternationalRest {
    describe(): any;
    subscribe(name: string, symbols?: Strings, params?: {}): Promise<any>;
    subscribeMultiple(name: string, symbols?: Strings, params?: {}): Promise<any>;
    watchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    watchFundingRates(symbols: string[], params?: {}): Promise<FundingRates>;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleInstrument(client: Client, message: any): void;
    parseWsInstrument(ticker: Dict, market?: any): Ticker;
    handleTicker(client: Client, message: any): void;
    parseWsTicker(ticker: object, market?: Market): Ticker;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrade(client: any, message: any): any;
    parseWsTrade(trade: any, market?: any): Trade;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: any, message: any): void;
    handleDelta(orderbook: any, delta: any): void;
    handleDeltas(orderbook: any, deltas: any): void;
    handleSubscriptionStatus(client: any, message: any): any;
    handleFundingRate(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: any, message: any): void;
}
