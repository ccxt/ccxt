import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
export default abstract class Exchange extends _Exchange {
    abstract publicGetExchangeInfo(params?: {}): Promise<implicitReturnType>;
    abstract publicGetDepth(params?: {}): Promise<implicitReturnType>;
    abstract publicGetPing(params?: {}): Promise<implicitReturnType>;
    abstract publicGetSystemStatus(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTickers24hr(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTicker24hr(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTime(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTrades(params?: {}): Promise<implicitReturnType>;
    abstract publicGetKlines(params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccount(params?: {}): Promise<implicitReturnType>;
    abstract privateGetAllOrders(params?: {}): Promise<implicitReturnType>;
    abstract privateGetFunds(params?: {}): Promise<implicitReturnType>;
    abstract privateGetHistoricalTrades(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenOrders(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrder(params?: {}): Promise<implicitReturnType>;
    abstract privateGetMyTrades(params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrder(params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrderTest(params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOrder(params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOpenOrders(params?: {}): Promise<implicitReturnType>;
}
