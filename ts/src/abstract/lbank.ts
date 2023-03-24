import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetCurrencyPairs (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTicker (params?: {}): Promise<implicitReturnType>;
    abstract publicGetDepth (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTrades (params?: {}): Promise<implicitReturnType>;
    abstract publicGetKline (params?: {}): Promise<implicitReturnType>;
    abstract publicGetAccuracy (params?: {}): Promise<implicitReturnType>;
    abstract privatePostUserInfo (params?: {}): Promise<implicitReturnType>;
    abstract privatePostCreateOrder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancelOrder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrdersInfo (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrdersInfoHistory (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdraw (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawCancel (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdraws (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawConfigs (params?: {}): Promise<implicitReturnType>;
}