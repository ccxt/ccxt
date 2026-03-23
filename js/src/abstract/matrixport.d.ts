import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    walletGetBalance(params?: {}): Promise<implicitReturnType>;
    walletGetCurrencies(params?: {}): Promise<implicitReturnType>;
    walletGetDeposits(params?: {}): Promise<implicitReturnType>;
    walletGetWithdrawals(params?: {}): Promise<implicitReturnType>;
    walletGetDepositAddress(params?: {}): Promise<implicitReturnType>;
    walletGetBills(params?: {}): Promise<implicitReturnType>;
    walletGetWithdrawFees(params?: {}): Promise<implicitReturnType>;
    walletPostWithdraw(params?: {}): Promise<implicitReturnType>;
    tradeGetHealthy(params?: {}): Promise<implicitReturnType>;
    tradeGetSymbolsInfo(params?: {}): Promise<implicitReturnType>;
    tradeGetRfqPrice(params?: {}): Promise<implicitReturnType>;
    tradeGetOrder(params?: {}): Promise<implicitReturnType>;
    tradeGetOrders(params?: {}): Promise<implicitReturnType>;
    tradePostRfqPlace(params?: {}): Promise<implicitReturnType>;
    dcpGetIndexPrice(params?: {}): Promise<implicitReturnType>;
    dcpGetAvailableBalance(params?: {}): Promise<implicitReturnType>;
    dcpGetCashierPaymentCombination(params?: {}): Promise<implicitReturnType>;
    dcpGetTenorConfig(params?: {}): Promise<implicitReturnType>;
    dcpGetTradingExchanges(params?: {}): Promise<implicitReturnType>;
    dcpGetProductOverview(params?: {}): Promise<implicitReturnType>;
    dcpGetProductList(params?: {}): Promise<implicitReturnType>;
    dcpGetProductAgreement(params?: {}): Promise<implicitReturnType>;
    dcpGetQuote(params?: {}): Promise<implicitReturnType>;
    dcpGetRedeemQuote(params?: {}): Promise<implicitReturnType>;
    dcpGetOrders(params?: {}): Promise<implicitReturnType>;
    dcpGetOrder(params?: {}): Promise<implicitReturnType>;
    dcpGetActiveOrderCount(params?: {}): Promise<implicitReturnType>;
    dcpGetGetAllInvestCurrency(params?: {}): Promise<implicitReturnType>;
    dcpGetTotalPositions(params?: {}): Promise<implicitReturnType>;
    dcpGetInvestDays(params?: {}): Promise<implicitReturnType>;
    dcpPostOrder(params?: {}): Promise<implicitReturnType>;
    dcpPostRedeem(params?: {}): Promise<implicitReturnType>;
    dcpPostRedeemResult(params?: {}): Promise<implicitReturnType>;
    dcpPostOrderCoupons(params?: {}): Promise<implicitReturnType>;
    dcpV2GetPnl(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
