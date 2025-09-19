import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarkets(params?: {}): Promise<implicitReturnType>;
    publicGetTickersPair(params?: {}): Promise<implicitReturnType>;
    publicGetTickersMulti(params?: {}): Promise<implicitReturnType>;
    publicGetOrderBook(params?: {}): Promise<implicitReturnType>;
    publicGetOrderBookMulti(params?: {}): Promise<implicitReturnType>;
    publicGetFeesTrading(params?: {}): Promise<implicitReturnType>;
    publicGetTrades(params?: {}): Promise<implicitReturnType>;
    publicGetTimestamp(params?: {}): Promise<implicitReturnType>;
    publicPostK(params?: {}): Promise<implicitReturnType>;
    privateGetKey(params?: {}): Promise<implicitReturnType>;
    privateGetMembersMe(params?: {}): Promise<implicitReturnType>;
    privateGetOrders(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersFilter(params?: {}): Promise<implicitReturnType>;
    privatePostOrders(params?: {}): Promise<implicitReturnType>;
    privatePostOrdersMulti(params?: {}): Promise<implicitReturnType>;
    privatePostOrderDelete(params?: {}): Promise<implicitReturnType>;
    privatePostOrderDeleteMulti(params?: {}): Promise<implicitReturnType>;
    privatePostOrdersClear(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawsSpecialNew(params?: {}): Promise<implicitReturnType>;
    privatePostDepositAddress(params?: {}): Promise<implicitReturnType>;
    privatePostDepositAddresses(params?: {}): Promise<implicitReturnType>;
    privatePostDepositHistory(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawHistory(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
