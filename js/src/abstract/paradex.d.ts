import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetBboMarket(params?: {}): Promise<implicitReturnType>;
    publicGetFundingData(params?: {}): Promise<implicitReturnType>;
    publicGetMarkets(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsKlines(params?: {}): Promise<implicitReturnType>;
    publicGetMarketsSummary(params?: {}): Promise<implicitReturnType>;
    publicGetOrderbookMarket(params?: {}): Promise<implicitReturnType>;
    publicGetInsurance(params?: {}): Promise<implicitReturnType>;
    publicGetReferralsConfig(params?: {}): Promise<implicitReturnType>;
    publicGetSystemConfig(params?: {}): Promise<implicitReturnType>;
    publicGetSystemState(params?: {}): Promise<implicitReturnType>;
    publicGetSystemTime(params?: {}): Promise<implicitReturnType>;
    publicGetTrades(params?: {}): Promise<implicitReturnType>;
    privateGetAccount(params?: {}): Promise<implicitReturnType>;
    privateGetAccountProfile(params?: {}): Promise<implicitReturnType>;
    privateGetBalance(params?: {}): Promise<implicitReturnType>;
    privateGetFills(params?: {}): Promise<implicitReturnType>;
    privateGetFundingPayments(params?: {}): Promise<implicitReturnType>;
    privateGetPositions(params?: {}): Promise<implicitReturnType>;
    privateGetTradebusts(params?: {}): Promise<implicitReturnType>;
    privateGetTransactions(params?: {}): Promise<implicitReturnType>;
    privateGetLiquidations(params?: {}): Promise<implicitReturnType>;
    privateGetOrders(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersHistory(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersByClientIdClientId(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersOrderId(params?: {}): Promise<implicitReturnType>;
    privateGetPointsDataMarketProgram(params?: {}): Promise<implicitReturnType>;
    privateGetReferralsSummary(params?: {}): Promise<implicitReturnType>;
    privateGetTransfers(params?: {}): Promise<implicitReturnType>;
    privatePostAccountProfileReferralCode(params?: {}): Promise<implicitReturnType>;
    privatePostAccountProfileUsername(params?: {}): Promise<implicitReturnType>;
    privatePostAuth(params?: {}): Promise<implicitReturnType>;
    privatePostOnboarding(params?: {}): Promise<implicitReturnType>;
    privatePostOrders(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrders(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrdersByClientIdClientId(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrdersOrderId(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
