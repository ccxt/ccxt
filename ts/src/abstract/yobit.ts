import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetDepthPair (params?: {}): Promise<implicitReturnType>;
    abstract publicGetInfo (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTickerPair (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTradesPair (params?: {}): Promise<implicitReturnType>;
    abstract privatePostActiveOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancelOrder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetDepositAddress (params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetInfo (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrderInfo (params?: {}): Promise<implicitReturnType>;
    abstract privatePostTrade (params?: {}): Promise<implicitReturnType>;
    abstract privatePostTradeHistory (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawCoinsToAddress (params?: {}): Promise<implicitReturnType>;
}