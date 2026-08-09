import { List, Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetCoins(params?: {}): Promise<List>;
    publicGetCoinOrderbook(params?: {}): Promise<Dict>;
    publicGetCoinTicker(params?: {}): Promise<Dict>;
    publicGetCoinTrades(params?: {}): Promise<List>;
    publicGetCoinTradesFrom(params?: {}): Promise<List>;
    publicGetCoinTradesFromTo(params?: {}): Promise<List>;
    publicGetCoinDaySummaryYearMonthDay(params?: {}): Promise<Dict>;
    privatePostCancelOrder(params?: {}): Promise<Dict>;
    privatePostGetAccountInfo(params?: {}): Promise<Dict>;
    privatePostGetOrder(params?: {}): Promise<Dict>;
    privatePostGetWithdrawal(params?: {}): Promise<Dict>;
    privatePostListSystemMessages(params?: {}): Promise<Dict>;
    privatePostListOrders(params?: {}): Promise<Dict>;
    privatePostListOrderbook(params?: {}): Promise<Dict>;
    privatePostPlaceBuyOrder(params?: {}): Promise<Dict>;
    privatePostPlaceSellOrder(params?: {}): Promise<Dict>;
    privatePostPlaceMarketBuyOrder(params?: {}): Promise<Dict>;
    privatePostPlaceMarketSellOrder(params?: {}): Promise<Dict>;
    privatePostWithdrawCoin(params?: {}): Promise<Dict>;
    v4PublicGetCoinCandle(params?: {}): Promise<Dict>;
    v4PublicNetGetCandles(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
