import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
export default abstract class Exchange extends _Exchange {
    abstract publicGetOrderbook(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTicker(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTrades(params?: {}): Promise<implicitReturnType>;
    abstract publicGetServerExchangeinfo(params?: {}): Promise<implicitReturnType>;
    abstract privateGetUsersBalances(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenOrders(params?: {}): Promise<implicitReturnType>;
    abstract privateGetAllOrders(params?: {}): Promise<implicitReturnType>;
    abstract privateGetUsersTransactionsTrade(params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrder(params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancelOrder(params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOrder(params?: {}): Promise<implicitReturnType>;
    abstract graphGetOhlcs(params?: {}): Promise<implicitReturnType>;
    abstract graphGetKlinesHistory(params?: {}): Promise<implicitReturnType>;
}
