import Exchange from './abstract/paymium.js';
import type { TransferEntry, Balances, Currency, Int, Market, OrderBook, OrderSide, OrderType, Str, Ticker, Trade, Num, Dict, Strings, int, DepositAddress } from './base/types.js';
/**
 * @class paymium
 * @augments Exchange
 */
export default class paymium extends Exchange {
    describe(): any;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: Dict, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    createDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    fetchDepositAddresses(codes?: Strings, params?: {}): Promise<DepositAddress[]>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<import("./base/types.js").Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<import("./base/types.js").Order>;
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): Str;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
