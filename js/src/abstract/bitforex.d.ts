import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
export default class Exchange extends _Exchange {
    publicGetApiV1MarketSymbols(params?: {}): Promise<implicitReturnType>;
    publicGetApiV1MarketTicker(params?: {}): Promise<implicitReturnType>;
    publicGetApiV1MarketTickerAll(params?: {}): Promise<implicitReturnType>;
    publicGetApiV1MarketDepth(params?: {}): Promise<implicitReturnType>;
    publicGetApiV1MarketDepthAll(params?: {}): Promise<implicitReturnType>;
    publicGetApiV1MarketTrades(params?: {}): Promise<implicitReturnType>;
    publicGetApiV1MarketKline(params?: {}): Promise<implicitReturnType>;
    privatePostApiV1FundMainAccount(params?: {}): Promise<implicitReturnType>;
    privatePostApiV1FundAllAccount(params?: {}): Promise<implicitReturnType>;
    privatePostApiV1TradePlaceOrder(params?: {}): Promise<implicitReturnType>;
    privatePostApiV1TradePlaceMultiOrder(params?: {}): Promise<implicitReturnType>;
    privatePostApiV1TradeCancelOrder(params?: {}): Promise<implicitReturnType>;
    privatePostApiV1TradeCancelMultiOrder(params?: {}): Promise<implicitReturnType>;
    privatePostApiV1TradeCancelAllOrder(params?: {}): Promise<implicitReturnType>;
    privatePostApiV1TradeOrderInfo(params?: {}): Promise<implicitReturnType>;
    privatePostApiV1TradeMultiOrderInfo(params?: {}): Promise<implicitReturnType>;
    privatePostApiV1TradeOrderInfos(params?: {}): Promise<implicitReturnType>;
}
