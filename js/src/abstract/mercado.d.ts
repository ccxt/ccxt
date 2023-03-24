import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
export default abstract class Exchange extends _Exchange {
    abstract publicGetCoins(params?: {}): Promise<implicitReturnType>;
    abstract publicGetCoinOrderbook(params?: {}): Promise<implicitReturnType>;
    abstract publicGetCoinTicker(params?: {}): Promise<implicitReturnType>;
    abstract publicGetCoinTrades(params?: {}): Promise<implicitReturnType>;
    abstract publicGetCoinTradesFrom(params?: {}): Promise<implicitReturnType>;
    abstract publicGetCoinTradesFromTo(params?: {}): Promise<implicitReturnType>;
    abstract publicGetCoinDaySummaryYearMonthDay(params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancelOrder(params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetAccountInfo(params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetOrder(params?: {}): Promise<implicitReturnType>;
    abstract privatePostGetWithdrawal(params?: {}): Promise<implicitReturnType>;
    abstract privatePostListSystemMessages(params?: {}): Promise<implicitReturnType>;
    abstract privatePostListOrders(params?: {}): Promise<implicitReturnType>;
    abstract privatePostListOrderbook(params?: {}): Promise<implicitReturnType>;
    abstract privatePostPlaceBuyOrder(params?: {}): Promise<implicitReturnType>;
    abstract privatePostPlaceSellOrder(params?: {}): Promise<implicitReturnType>;
    abstract privatePostPlaceMarketBuyOrder(params?: {}): Promise<implicitReturnType>;
    abstract privatePostPlaceMarketSellOrder(params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawCoin(params?: {}): Promise<implicitReturnType>;
    abstract v4PublicGetCoinCandle(params?: {}): Promise<implicitReturnType>;
    abstract v4PublicNetGetCandles(params?: {}): Promise<implicitReturnType>;
}
