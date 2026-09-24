import { Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarkets(params?: {}): Promise<Dict>;
    publicGetMarket(params?: {}): Promise<Dict>;
    publicGetTickers(params?: {}): Promise<Dict>;
    publicGetTicker(params?: {}): Promise<Dict>;
    publicGetBook(params?: {}): Promise<Dict>;
    publicGetHistory(params?: {}): Promise<Dict>;
    publicGetDepthResult(params?: {}): Promise<Dict>;
    publicGetMarketKline(params?: {}): Promise<Dict>;
    privatePostAccountBalances(params?: {}): Promise<Dict>;
    privatePostAccountBalance(params?: {}): Promise<Dict>;
    privatePostOrderNew(params?: {}): Promise<Dict>;
    privatePostOrderCancel(params?: {}): Promise<Dict>;
    privatePostOrders(params?: {}): Promise<Dict>;
    privatePostAccountMarketOrderHistory(params?: {}): Promise<Dict>;
    privatePostAccountMarketDealHistory(params?: {}): Promise<Dict>;
    privatePostAccountOrder(params?: {}): Promise<Dict>;
    privatePostAccountOrderHistory(params?: {}): Promise<Dict>;
    privatePostAccountExecutedHistory(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
