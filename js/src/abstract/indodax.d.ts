import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetApiServerTime(params?: {}): Promise<implicitReturnType>;
    publicGetApiPairs(params?: {}): Promise<implicitReturnType>;
    publicGetApiPriceIncrements(params?: {}): Promise<implicitReturnType>;
    publicGetApiSummaries(params?: {}): Promise<implicitReturnType>;
    publicGetApiTickerPair(params?: {}): Promise<implicitReturnType>;
    publicGetApiTickerAll(params?: {}): Promise<implicitReturnType>;
    publicGetApiTradesPair(params?: {}): Promise<implicitReturnType>;
    publicGetApiDepthPair(params?: {}): Promise<implicitReturnType>;
    publicGetTradingviewHistoryV2(params?: {}): Promise<implicitReturnType>;
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
