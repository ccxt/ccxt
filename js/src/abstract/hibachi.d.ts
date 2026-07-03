import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarketExchangeInfo(params?: {}): Promise<implicitReturnType>;
    publicGetMarketDataTrades(params?: {}): Promise<implicitReturnType>;
    publicGetMarketDataPrices(params?: {}): Promise<implicitReturnType>;
    publicGetMarketDataStats(params?: {}): Promise<implicitReturnType>;
    publicGetMarketDataKlines(params?: {}): Promise<implicitReturnType>;
    publicGetMarketDataOrderbook(params?: {}): Promise<implicitReturnType>;
    publicGetMarketDataOpenInterest(params?: {}): Promise<implicitReturnType>;
    publicGetMarketDataFundingRates(params?: {}): Promise<implicitReturnType>;
    publicGetExchangeUtcTimestamp(params?: {}): Promise<implicitReturnType>;
    privateGetCapitalDepositInfo(params?: {}): Promise<implicitReturnType>;
    privateGetCapitalHistory(params?: {}): Promise<implicitReturnType>;
    privateGetTradeAccountTradingHistory(params?: {}): Promise<implicitReturnType>;
    privateGetTradeAccountInfo(params?: {}): Promise<implicitReturnType>;
    privateGetTradeOrder(params?: {}): Promise<implicitReturnType>;
    privateGetTradeAccountTrades(params?: {}): Promise<implicitReturnType>;
    privateGetTradeOrders(params?: {}): Promise<implicitReturnType>;
    privatePutTradeOrder(params?: {}): Promise<implicitReturnType>;
    privateDeleteTradeOrder(params?: {}): Promise<implicitReturnType>;
    privateDeleteTradeOrders(params?: {}): Promise<implicitReturnType>;
    privatePostTradeOrder(params?: {}): Promise<implicitReturnType>;
    privatePostTradeOrders(params?: {}): Promise<implicitReturnType>;
    privatePostCapitalWithdraw(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
