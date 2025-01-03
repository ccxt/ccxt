import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarkets(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsMarketIdTicker(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsMarketIdTrades(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsMarketIdOrderbook(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsMarketIdCandles(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsTickers(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsOrderbooks(params?: {}): Promise<implicitReturnType>;
    publicGetTime(params?: {}): Promise<implicitReturnType>;
    privateGetOrders(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersId(params?: {}): Promise<implicitReturnType>;
    privateGetBatchordersIds(params?: {}): Promise<implicitReturnType>;
    privateGetTrades(params?: {}): Promise<implicitReturnType>;
    privateGetTradesId(params?: {}): Promise<implicitReturnType>;
    privateGetWithdrawals(params?: {}): Promise<implicitReturnType>;
    privateGetWithdrawalsId(params?: {}): Promise<implicitReturnType>;
    privateGetDeposits(params?: {}): Promise<implicitReturnType>;
    privateGetDepositsId(params?: {}): Promise<implicitReturnType>;
    privateGetTransfers(params?: {}): Promise<implicitReturnType>;
    privateGetTransfersId(params?: {}): Promise<implicitReturnType>;
    privateGetAddresses(params?: {}): Promise<implicitReturnType>;
    privateGetWithdrawalFees(params?: {}): Promise<implicitReturnType>;
    privateGetAssets(params?: {}): Promise<implicitReturnType>;
    privateGetAccountsMeTradingFees(params?: {}): Promise<implicitReturnType>;
    privateGetAccountsMeWithdrawalLimits(params?: {}): Promise<implicitReturnType>;
    privateGetAccountsMeBalances(params?: {}): Promise<implicitReturnType>;
    privateGetAccountsMeTransactions(params?: {}): Promise<implicitReturnType>;
    privateGetReportsId(params?: {}): Promise<implicitReturnType>;
    privatePostOrders(params?: {}): Promise<implicitReturnType>;
    privatePostBatchorders(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawals(params?: {}): Promise<implicitReturnType>;
    privatePostReports(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrders(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrdersId(params?: {}): Promise<implicitReturnType>;
    privateDeleteBatchordersIds(params?: {}): Promise<implicitReturnType>;
    privatePutOrdersId(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
