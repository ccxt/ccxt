import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarketBook(params?: {}): Promise<implicitReturnType>;
    publicGetReportMarketBook(params?: {}): Promise<implicitReturnType>;
    publicGetMarketTrades(params?: {}): Promise<implicitReturnType>;
    publicGetReportMarketTrades(params?: {}): Promise<implicitReturnType>;
    publicGetTickerPrice(params?: {}): Promise<implicitReturnType>;
    publicGetTickerBook(params?: {}): Promise<implicitReturnType>;
    publicGetMarketCandles(params?: {}): Promise<implicitReturnType>;
    publicGetTicker24h(params?: {}): Promise<implicitReturnType>;
    publicGetTime(params?: {}): Promise<implicitReturnType>;
    publicGetMarkets(params?: {}): Promise<implicitReturnType>;
    publicGetAssets(params?: {}): Promise<implicitReturnType>;
    privateGetOrder(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersOpen(params?: {}): Promise<implicitReturnType>;
    privateGetTrades(params?: {}): Promise<implicitReturnType>;
    privateGetOrders(params?: {}): Promise<implicitReturnType>;
    privateGetDeposit(params?: {}): Promise<implicitReturnType>;
    privateGetDepositHistory(params?: {}): Promise<implicitReturnType>;
    privateGetWithdrawalHistory(params?: {}): Promise<implicitReturnType>;
    privateGetAccount(params?: {}): Promise<implicitReturnType>;
    privateGetBalance(params?: {}): Promise<implicitReturnType>;
    privateGetStakingBalance(params?: {}): Promise<implicitReturnType>;
    privateGetAccountFees(params?: {}): Promise<implicitReturnType>;
    privateGetAccountHistory(params?: {}): Promise<implicitReturnType>;
    privateGetSubaccounts(params?: {}): Promise<implicitReturnType>;
    privateGetSubaccountsTransfers(params?: {}): Promise<implicitReturnType>;
    privateGetSubaccountsTransfersTransferId(params?: {}): Promise<implicitReturnType>;
    privateGetInstitutionalSubaccountsBalance(params?: {}): Promise<implicitReturnType>;
    privateGetInstitutionalSubaccountsHistory(params?: {}): Promise<implicitReturnType>;
    privateGetInstitutionalSubaccountsOrdersOpen(params?: {}): Promise<implicitReturnType>;
    privatePostOrder(params?: {}): Promise<implicitReturnType>;
    privatePostCancelOrdersAfter(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawal(params?: {}): Promise<implicitReturnType>;
    privatePostCryptoWithdrawal(params?: {}): Promise<implicitReturnType>;
    privatePostSubaccounts(params?: {}): Promise<implicitReturnType>;
    privatePostSubaccountsTransfers(params?: {}): Promise<implicitReturnType>;
    privatePutOrder(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrder(params?: {}): Promise<implicitReturnType>;
    privateDeleteOrders(params?: {}): Promise<implicitReturnType>;
    privateDeleteAtomicOrders(params?: {}): Promise<implicitReturnType>;
    privateDeleteInstitutionalSubaccountsOrder(params?: {}): Promise<implicitReturnType>;
    privateDeleteInstitutionalSubaccountsOrders(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
