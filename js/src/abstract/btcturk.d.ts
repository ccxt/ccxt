import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetOrderbook(params?: {}): Promise<implicitReturnType>;
    publicGetTicker(params?: {}): Promise<implicitReturnType>;
    publicGetTrades(params?: {}): Promise<implicitReturnType>;
    publicGetServerExchangeinfo(params?: {}): Promise<implicitReturnType>;
    privateGetUsersBalances(params?: {}): Promise<implicitReturnType>;
    privateGetOpenOrders(params?: {}): Promise<implicitReturnType>;
    privateGetAllOrders(params?: {}): Promise<implicitReturnType>;
    privateGetUsersTransactionsTrade(params?: {}): Promise<implicitReturnType>;
    privatePostOrder(params?: {}): Promise<implicitReturnType>;
    privatePostCancelOrder(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrder(params?: {}): Promise<implicitReturnType>;
    graphGetOhlcs(params?: {}): Promise<implicitReturnType>;
    graphGetKlinesHistory(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
