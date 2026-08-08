import { Dict, List } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetOrderbook(params?: {}): Promise<Dict>;
    publicGetTicker(params?: {}): Promise<Dict>;
    publicGetTrades(params?: {}): Promise<Dict>;
    publicGetOhlc(params?: {}): Promise<Dict>;
    publicGetServerExchangeinfo(params?: {}): Promise<Dict>;
    privateGetUsersBalances(params?: {}): Promise<Dict>;
    privateGetOpenOrders(params?: {}): Promise<Dict>;
    privateGetAllOrders(params?: {}): Promise<Dict>;
    privateGetUsersTransactionsTrade(params?: {}): Promise<Dict>;
    privatePostUsersTransactionsCrypto(params?: {}): Promise<Dict>;
    privatePostUsersTransactionsFiat(params?: {}): Promise<Dict>;
    privatePostOrder(params?: {}): Promise<Dict>;
    privatePostCancelOrder(params?: {}): Promise<Dict>;
    privateDeleteOrder(params?: {}): Promise<Dict>;
    graphGetOhlcs(params?: {}): Promise<List>;
    graphGetKlinesHistory(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
