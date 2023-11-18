import Exchange from './abstract/paymium.js';
import { Balances, Currency, Int, Market, OrderBook, OrderSide, OrderType, Str, Ticker, Trade } from './base/types.js';
/**
 * @class paymium
 * @extends Exchange
 */
export default class paymium extends Exchange {
    describe(): undefined;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    createDepositAddress(code: string, params?: {}): Promise<{
        info: any;
        currency: string;
        address: Str;
        tag: undefined;
        network: undefined;
    }>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        info: any;
        currency: string;
        address: Str;
        tag: undefined;
        network: undefined;
    }>;
    fetchDepositAddresses(codes?: undefined, params?: {}): Promise<{}>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        info: any;
        currency: string;
        address: Str;
        tag: undefined;
        network: undefined;
    };
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<import("./base/types.js").Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        info: any;
        id: Str;
        timestamp: number | undefined;
        datetime: string | undefined;
        currency: string;
        amount: import("./base/types.js").Num;
        fromAccount: undefined;
        toAccount: Str;
        status: Str;
    }>;
    parseTransfer(transfer: any, currency?: Currency): {
        info: any;
        id: Str;
        timestamp: number | undefined;
        datetime: string | undefined;
        currency: string;
        amount: import("./base/types.js").Num;
        fromAccount: undefined;
        toAccount: Str;
        status: Str;
    };
    parseTransferStatus(status: any): Str;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
