import Exchange from './abstract/fswap.js';
import { Balances, Currencies, Dict, Int, Market, Num, Order, OrderSide, OrderType, Str, Trade } from './base/types.js';
export default class fswap extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    parseSpecialSymbol(tokenId: string, tokenSymbol: string): string;
    mapAssetIdToSymbol(assetId: string): string;
    mapSymbolToAssetId(symbol: string): string;
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseCurrencies(assets: Dict): Currencies;
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(outputs: Dict): Balances;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseOrder(order: Dict): Order;
    parseOrderStatus(status: string): string;
    findSymbol(payAssetId: string, fillAssetId: string): string;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market: any): Trade;
    verifySafeTx(raw: string): Promise<{
        verifiedTx: any;
        request_id: string;
    }>;
    sendSafeTx(signedRaw: string, request_id: string): Promise<any>;
    getSafeTx(asset_id: string, amount: string, memo: string): Promise<string>;
    safeTransfer(asset_id: string, amount: string, memo: string): Promise<any>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    deposit(symbol: string, amount: number): Promise<string>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
