import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetCurrencyPairs(params?: {}): Promise<implicitReturnType>;
    publicGetTicker(params?: {}): Promise<implicitReturnType>;
    publicGetDepth(params?: {}): Promise<implicitReturnType>;
    publicGetTrades(params?: {}): Promise<implicitReturnType>;
    publicGetKline(params?: {}): Promise<implicitReturnType>;
    publicGetAccuracy(params?: {}): Promise<implicitReturnType>;
    privatePostUserInfo(params?: {}): Promise<implicitReturnType>;
    privatePostCreateOrder(params?: {}): Promise<implicitReturnType>;
    privatePostCancelOrder(params?: {}): Promise<implicitReturnType>;
    privatePostOrdersInfo(params?: {}): Promise<implicitReturnType>;
    privatePostOrdersInfoHistory(params?: {}): Promise<implicitReturnType>;
    privatePostWithdraw(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawCancel(params?: {}): Promise<implicitReturnType>;
    privatePostWithdraws(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawConfigs(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
