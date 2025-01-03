import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetHealth(params?: {}): Promise<implicitReturnType>;
    publicGetConstants(params?: {}): Promise<implicitReturnType>;
    publicGetKit(params?: {}): Promise<implicitReturnType>;
    publicGetTiers(params?: {}): Promise<implicitReturnType>;
    publicGetTicker(params?: {}): Promise<implicitReturnType>;
    publicGetTickers(params?: {}): Promise<implicitReturnType>;
    publicGetOrderbook(params?: {}): Promise<implicitReturnType>;
    publicGetOrderbooks(params?: {}): Promise<implicitReturnType>;
    publicGetTrades(params?: {}): Promise<implicitReturnType>;
    publicGetChart(params?: {}): Promise<implicitReturnType>;
    publicGetCharts(params?: {}): Promise<implicitReturnType>;
    publicGetMinicharts(params?: {}): Promise<implicitReturnType>;
    publicGetOraclePrices(params?: {}): Promise<implicitReturnType>;
    publicGetQuickTrade(params?: {}): Promise<implicitReturnType>;
    publicGetUdfConfig(params?: {}): Promise<implicitReturnType>;
    publicGetUdfHistory(params?: {}): Promise<implicitReturnType>;
    publicGetUdfSymbols(params?: {}): Promise<implicitReturnType>;
    privateGetUser(params?: {}): Promise<implicitReturnType>;
    privateGetUserBalance(params?: {}): Promise<implicitReturnType>;
    privateGetUserDeposits(params?: {}): Promise<implicitReturnType>;
    privateGetUserWithdrawals(params?: {}): Promise<implicitReturnType>;
    privateGetUserWithdrawalFee(params?: {}): Promise<implicitReturnType>;
    privateGetUserTrades(params?: {}): Promise<implicitReturnType>;
    privateGetOrders(params?: {}): Promise<implicitReturnType>;
    privateGetOrder(params?: {}): Promise<implicitReturnType>;
    privatePostUserWithdrawal(params?: {}): Promise<implicitReturnType>;
    privatePostOrder(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrderAll(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrder(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
