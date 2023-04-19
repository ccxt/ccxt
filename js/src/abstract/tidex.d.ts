import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    webGetCurrency(params?: {}): Promise<implicitReturnType>;
    webGetPairs(params?: {}): Promise<implicitReturnType>;
    webGetTickers(params?: {}): Promise<implicitReturnType>;
    webGetOrders(params?: {}): Promise<implicitReturnType>;
    webGetOrdershistory(params?: {}): Promise<implicitReturnType>;
    webGetTradeData(params?: {}): Promise<implicitReturnType>;
    webGetTradeDataId(params?: {}): Promise<implicitReturnType>;
    publicGetInfo(params?: {}): Promise<implicitReturnType>;
    publicGetTickerPair(params?: {}): Promise<implicitReturnType>;
    publicGetDepthPair(params?: {}): Promise<implicitReturnType>;
    publicGetTradesPair(params?: {}): Promise<implicitReturnType>;
    privatePostGetInfoExt(params?: {}): Promise<implicitReturnType>;
    privatePostGetInfo(params?: {}): Promise<implicitReturnType>;
    privatePostTrade(params?: {}): Promise<implicitReturnType>;
    privatePostActiveOrders(params?: {}): Promise<implicitReturnType>;
    privatePostOrderInfo(params?: {}): Promise<implicitReturnType>;
    privatePostCancelOrder(params?: {}): Promise<implicitReturnType>;
    privatePostTradeHistory(params?: {}): Promise<implicitReturnType>;
    privatePostGetDepositAddress(params?: {}): Promise<implicitReturnType>;
    privatePostCreateWithdraw(params?: {}): Promise<implicitReturnType>;
    privatePostGetWithdraw(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
