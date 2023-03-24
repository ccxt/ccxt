import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
export default abstract class Exchange extends _Exchange {
    abstract publicGetOpenapiV1Ping(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenapiV1Time(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenapiQuoteV1Ticker24hr(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenapiQuoteV1TickerPrice(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenapiQuoteV1TickerBookTicker(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenapiV1ExchangeInfo(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenapiQuoteV1Depth(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenapiQuoteV1Klines(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenapiQuoteV1Trades(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenapiV1Pairs(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenapiQuoteV1AvgPrice(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenapiV1Account(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenapiV1OpenOrders(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenapiV1AssetTradeFee(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenapiV1Order(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenapiV1HistoryOrders(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenapiV1MyTrades(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenapiV1CapitalDepositHistory(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenapiV1CapitalWithdrawHistory(params?: {}): Promise<implicitReturnType>;
    abstract privatePostOpenapiV1OrderTest(params?: {}): Promise<implicitReturnType>;
    abstract privatePostOpenapiV1Order(params?: {}): Promise<implicitReturnType>;
    abstract privatePostOpenapiV1CapitalWithdrawApply(params?: {}): Promise<implicitReturnType>;
    abstract privatePostOpenapiV1CapitalDepositApply(params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOpenapiV1Order(params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOpenapiV1OpenOrders(params?: {}): Promise<implicitReturnType>;
}
