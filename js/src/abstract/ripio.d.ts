import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
export default class Exchange extends _Exchange {
    publicGetRateAll(params?: {}): Promise<implicitReturnType>;
    publicGetRatePair(params?: {}): Promise<implicitReturnType>;
    publicGetOrderbookPair(params?: {}): Promise<implicitReturnType>;
    publicGetTradehistoryPair(params?: {}): Promise<implicitReturnType>;
    publicGetPair(params?: {}): Promise<implicitReturnType>;
    publicGetCurrency(params?: {}): Promise<implicitReturnType>;
    publicGetOrderbookPairDepth(params?: {}): Promise<implicitReturnType>;
    privateGetBalancesExchangeBalances(params?: {}): Promise<implicitReturnType>;
    privateGetOrderPairOrderId(params?: {}): Promise<implicitReturnType>;
    privateGetOrderPair(params?: {}): Promise<implicitReturnType>;
    privateGetTradePair(params?: {}): Promise<implicitReturnType>;
    privatePostOrderPair(params?: {}): Promise<implicitReturnType>;
    privatePostOrderPairOrderIdCancel(params?: {}): Promise<implicitReturnType>;
}
