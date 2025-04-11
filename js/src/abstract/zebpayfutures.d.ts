import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetSystemTime(params?: {}): Promise<implicitReturnType>;
    publicGetSystemStatus(params?: {}): Promise<implicitReturnType>;
    publicGetExchangeTradefee(params?: {}): Promise<implicitReturnType>;
    publicGetExchangeTradefees(params?: {}): Promise<implicitReturnType>;
    publicGetMarketOrderBook(params?: {}): Promise<implicitReturnType>;
    publicGetMarketTicker24Hr(params?: {}): Promise<implicitReturnType>;
    publicGetMarketMarkets(params?: {}): Promise<implicitReturnType>;
    privateGetWalletBalance(params?: {}): Promise<implicitReturnType>;
    privateGetTradeOrder(params?: {}): Promise<implicitReturnType>;
    privateGetTradeOrderOpenOrders(params?: {}): Promise<implicitReturnType>;
    privateGetTradeUserLeverages(params?: {}): Promise<implicitReturnType>;
    privateGetTradeUserLeverage(params?: {}): Promise<implicitReturnType>;
    privateGetTradePositions(params?: {}): Promise<implicitReturnType>;
    privatePostTradeOrder(params?: {}): Promise<implicitReturnType>;
    privatePostTradeOrderAddTPSL(params?: {}): Promise<implicitReturnType>;
    privatePostTradeAddMargin(params?: {}): Promise<implicitReturnType>;
    privatePostTradeReduceMargin(params?: {}): Promise<implicitReturnType>;
    privatePostTradePositionClose(params?: {}): Promise<implicitReturnType>;
    privatePostTradeUpdateUserLeverage(params?: {}): Promise<implicitReturnType>;
    privateDeleteTradeOrder(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
