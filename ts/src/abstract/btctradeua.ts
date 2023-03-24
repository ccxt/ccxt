import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetDealsSymbol (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTradesSellSymbol (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTradesBuySymbol (params?: {}): Promise<implicitReturnType>;
    abstract publicGetJapanStatHighSymbol (params?: {}): Promise<implicitReturnType>;
    abstract privatePostAuth (params?: {}): Promise<implicitReturnType>;
    abstract privatePostAskSymbol (params?: {}): Promise<implicitReturnType>;
    abstract privatePostBalance (params?: {}): Promise<implicitReturnType>;
    abstract privatePostBidSymbol (params?: {}): Promise<implicitReturnType>;
    abstract privatePostBuySymbol (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMyOrdersSymbol (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrderStatusId (params?: {}): Promise<implicitReturnType>;
    abstract privatePostRemoveOrderId (params?: {}): Promise<implicitReturnType>;
    abstract privatePostSellSymbol (params?: {}): Promise<implicitReturnType>;
}