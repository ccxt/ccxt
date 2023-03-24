import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetApiV1MarketSymbols (params?: {}): Promise<implicitReturnType>;
    abstract publicGetApiV1MarketTicker (params?: {}): Promise<implicitReturnType>;
    abstract publicGetApiV1MarketTickerAll (params?: {}): Promise<implicitReturnType>;
    abstract publicGetApiV1MarketDepth (params?: {}): Promise<implicitReturnType>;
    abstract publicGetApiV1MarketDepthAll (params?: {}): Promise<implicitReturnType>;
    abstract publicGetApiV1MarketTrades (params?: {}): Promise<implicitReturnType>;
    abstract publicGetApiV1MarketKline (params?: {}): Promise<implicitReturnType>;
    abstract privatePostApiV1FundMainAccount (params?: {}): Promise<implicitReturnType>;
    abstract privatePostApiV1FundAllAccount (params?: {}): Promise<implicitReturnType>;
    abstract privatePostApiV1TradePlaceOrder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostApiV1TradePlaceMultiOrder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostApiV1TradeCancelOrder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostApiV1TradeCancelMultiOrder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostApiV1TradeCancelAllOrder (params?: {}): Promise<implicitReturnType>;
    abstract privatePostApiV1TradeOrderInfo (params?: {}): Promise<implicitReturnType>;
    abstract privatePostApiV1TradeMultiOrderInfo (params?: {}): Promise<implicitReturnType>;
    abstract privatePostApiV1TradeOrderInfos (params?: {}): Promise<implicitReturnType>;
}