import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetServerTime(params?: {}): Promise<implicitReturnType>;
    publicGetPairs(params?: {}): Promise<implicitReturnType>;
    publicGetPriceIncrements(params?: {}): Promise<implicitReturnType>;
    publicGetSummaries(params?: {}): Promise<implicitReturnType>;
    publicGetTickerAll(params?: {}): Promise<implicitReturnType>;
    publicGetPairTicker(params?: {}): Promise<implicitReturnType>;
    publicGetPairTrades(params?: {}): Promise<implicitReturnType>;
    publicGetPairDepth(params?: {}): Promise<implicitReturnType>;
    privatePostGetInfo(params?: {}): Promise<implicitReturnType>;
    privatePostTransHistory(params?: {}): Promise<implicitReturnType>;
    privatePostTrade(params?: {}): Promise<implicitReturnType>;
    privatePostTradeHistory(params?: {}): Promise<implicitReturnType>;
    privatePostOpenOrders(params?: {}): Promise<implicitReturnType>;
    privatePostOrderHistory(params?: {}): Promise<implicitReturnType>;
    privatePostGetOrder(params?: {}): Promise<implicitReturnType>;
    privatePostCancelOrder(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawFee(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawCoin(params?: {}): Promise<implicitReturnType>;
    privatePostListDownline(params?: {}): Promise<implicitReturnType>;
    privatePostCheckDownline(params?: {}): Promise<implicitReturnType>;
    privatePostCreateVoucher(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
