import { Dict, List } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetApiServerTime(params?: {}): Promise<Dict>;
    publicGetApiPairs(params?: {}): Promise<List>;
    publicGetApiPriceIncrements(params?: {}): Promise<Dict>;
    publicGetApiSummaries(params?: {}): Promise<Dict>;
    publicGetApiTickerPair(params?: {}): Promise<Dict>;
    publicGetApiTickerAll(params?: {}): Promise<Dict>;
    publicGetApiTradesPair(params?: {}): Promise<List>;
    publicGetApiDepthPair(params?: {}): Promise<Dict>;
    publicGetTradingviewHistoryV2(params?: {}): Promise<List>;
    privatePostGetInfo(params?: {}): Promise<Dict>;
    privatePostTransHistory(params?: {}): Promise<Dict>;
    privatePostTrade(params?: {}): Promise<Dict>;
    privatePostTradeHistory(params?: {}): Promise<Dict>;
    privatePostOpenOrders(params?: {}): Promise<Dict>;
    privatePostOrderHistory(params?: {}): Promise<Dict>;
    privatePostGetOrder(params?: {}): Promise<Dict>;
    privatePostCancelOrder(params?: {}): Promise<Dict>;
    privatePostWithdrawFee(params?: {}): Promise<Dict>;
    privatePostWithdrawCoin(params?: {}): Promise<Dict>;
    privatePostListDownline(params?: {}): Promise<Dict>;
    privatePostCheckDownline(params?: {}): Promise<Dict>;
    privatePostCreateVoucher(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
