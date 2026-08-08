import { Dict, List } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetHealth(params?: {}): Promise<Dict>;
    publicGetConstants(params?: {}): Promise<Dict>;
    publicGetKit(params?: {}): Promise<Dict>;
    publicGetTiers(params?: {}): Promise<Dict>;
    publicGetTicker(params?: {}): Promise<Dict>;
    publicGetTickers(params?: {}): Promise<Dict>;
    publicGetOrderbook(params?: {}): Promise<Dict>;
    publicGetOrderbooks(params?: {}): Promise<Dict>;
    publicGetTrades(params?: {}): Promise<Dict>;
    publicGetChart(params?: {}): Promise<List>;
    publicGetCharts(params?: {}): Promise<Dict>;
    publicGetMinicharts(params?: {}): Promise<Dict>;
    publicGetOraclePrices(params?: {}): Promise<Dict>;
    publicGetQuickTrade(params?: {}): Promise<Dict>;
    publicGetUdfConfig(params?: {}): Promise<Dict>;
    publicGetUdfHistory(params?: {}): Promise<Dict>;
    publicGetUdfSymbols(params?: {}): Promise<Dict>;
    privateGetUser(params?: {}): Promise<Dict>;
    privateGetUserBalance(params?: {}): Promise<Dict>;
    privateGetUserDeposits(params?: {}): Promise<Dict>;
    privateGetUserWithdrawals(params?: {}): Promise<Dict>;
    privateGetUserWithdrawalFee(params?: {}): Promise<Dict>;
    privateGetUserTrades(params?: {}): Promise<Dict>;
    privateGetOrders(params?: {}): Promise<Dict>;
    privateGetOrder(params?: {}): Promise<Dict>;
    privatePostUserWithdrawal(params?: {}): Promise<Dict>;
    privatePostOrder(params?: {}): Promise<Dict>;
    privateDeleteOrderAll(params?: {}): Promise<List>;
    privateDeleteOrder(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
