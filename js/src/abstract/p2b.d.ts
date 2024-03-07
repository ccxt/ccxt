import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarkets(params?: {}): Promise<implicitReturnType>;
    publicGetMarket(params?: {}): Promise<implicitReturnType>;
    publicGetTickers(params?: {}): Promise<implicitReturnType>;
    publicGetTicker(params?: {}): Promise<implicitReturnType>;
    publicGetBook(params?: {}): Promise<implicitReturnType>;
    publicGetHistory(params?: {}): Promise<implicitReturnType>;
    publicGetDepthResult(params?: {}): Promise<implicitReturnType>;
    publicGetMarketKline(params?: {}): Promise<implicitReturnType>;
    privatePostAccountBalances(params?: {}): Promise<implicitReturnType>;
    privatePostAccountBalance(params?: {}): Promise<implicitReturnType>;
    privatePostOrderNew(params?: {}): Promise<implicitReturnType>;
    privatePostOrderCancel(params?: {}): Promise<implicitReturnType>;
    privatePostOrders(params?: {}): Promise<implicitReturnType>;
    privatePostAccountMarketOrderHistory(params?: {}): Promise<implicitReturnType>;
    privatePostAccountMarketDealHistory(params?: {}): Promise<implicitReturnType>;
    privatePostAccountOrder(params?: {}): Promise<implicitReturnType>;
    privatePostAccountOrderHistory(params?: {}): Promise<implicitReturnType>;
    privatePostAccountExecutedHistory(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
