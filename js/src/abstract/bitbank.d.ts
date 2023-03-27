import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
export default abstract class Exchange extends _Exchange {
    abstract publicGetPairTicker(params?: {}): Promise<implicitReturnType>;
    abstract publicGetPairDepth(params?: {}): Promise<implicitReturnType>;
    abstract publicGetPairTransactions(params?: {}): Promise<implicitReturnType>;
    abstract publicGetPairTransactionsYyyymmdd(params?: {}): Promise<implicitReturnType>;
    abstract publicGetPairCandlestickCandletypeYyyymmdd(params?: {}): Promise<implicitReturnType>;
    abstract privateGetUserAssets(params?: {}): Promise<implicitReturnType>;
    abstract privateGetUserSpotOrder(params?: {}): Promise<implicitReturnType>;
    abstract privateGetUserSpotActiveOrders(params?: {}): Promise<implicitReturnType>;
    abstract privateGetUserSpotTradeHistory(params?: {}): Promise<implicitReturnType>;
    abstract privateGetUserWithdrawalAccount(params?: {}): Promise<implicitReturnType>;
    abstract privatePostUserSpotOrder(params?: {}): Promise<implicitReturnType>;
    abstract privatePostUserSpotCancelOrder(params?: {}): Promise<implicitReturnType>;
    abstract privatePostUserSpotCancelOrders(params?: {}): Promise<implicitReturnType>;
    abstract privatePostUserSpotOrdersInfo(params?: {}): Promise<implicitReturnType>;
    abstract privatePostUserRequestWithdrawal(params?: {}): Promise<implicitReturnType>;
    abstract marketsGetSpotPairs(params?: {}): Promise<implicitReturnType>;
}
