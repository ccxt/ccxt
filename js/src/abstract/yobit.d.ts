import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetDepthPair(params?: {}): Promise<implicitReturnType>;
    publicGetInfo(params?: {}): Promise<implicitReturnType>;
    publicGetTickerPair(params?: {}): Promise<implicitReturnType>;
    publicGetTradesPair(params?: {}): Promise<implicitReturnType>;
    privatePostActiveOrders(params?: {}): Promise<implicitReturnType>;
    privatePostCancelOrder(params?: {}): Promise<implicitReturnType>;
    privatePostGetDepositAddress(params?: {}): Promise<implicitReturnType>;
    privatePostGetInfo(params?: {}): Promise<implicitReturnType>;
    privatePostOrderInfo(params?: {}): Promise<implicitReturnType>;
    privatePostTrade(params?: {}): Promise<implicitReturnType>;
    privatePostTradeHistory(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawCoinsToAddress(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
