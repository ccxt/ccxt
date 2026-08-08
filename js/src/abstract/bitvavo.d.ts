import { Dict, List } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarketBook(params?: {}): Promise<Dict>;
    publicGetReportMarketBook(params?: {}): Promise<Dict>;
    publicGetMarketTrades(params?: {}): Promise<List>;
    publicGetReportMarketTrades(params?: {}): Promise<List>;
    publicGetTickerPrice(params?: {}): Promise<List>;
    publicGetTickerBook(params?: {}): Promise<List>;
    publicGetMarketCandles(params?: {}): Promise<List>;
    publicGetTicker24h(params?: {}): Promise<Dict | List>;
    publicGetTime(params?: {}): Promise<Dict>;
    publicGetMarkets(params?: {}): Promise<List>;
    publicGetAssets(params?: {}): Promise<List>;
    privateGetOrder(params?: {}): Promise<Dict>;
    privateGetOrdersOpen(params?: {}): Promise<List>;
    privateGetTrades(params?: {}): Promise<List>;
    privateGetOrders(params?: {}): Promise<List>;
    privateGetDeposit(params?: {}): Promise<Dict>;
    privateGetDepositHistory(params?: {}): Promise<List>;
    privateGetWithdrawalHistory(params?: {}): Promise<List>;
    privateGetAccount(params?: {}): Promise<List>;
    privateGetBalance(params?: {}): Promise<List>;
    privateGetStakingBalance(params?: {}): Promise<List>;
    privateGetAccountFees(params?: {}): Promise<Dict>;
    privateGetAccountHistory(params?: {}): Promise<Dict>;
    privateGetSubaccounts(params?: {}): Promise<Dict>;
    privateGetSubaccountsTransfers(params?: {}): Promise<Dict>;
    privateGetSubaccountsTransfersTransferId(params?: {}): Promise<Dict>;
    privateGetInstitutionalSubaccountsBalance(params?: {}): Promise<Dict>;
    privateGetInstitutionalSubaccountsHistory(params?: {}): Promise<Dict>;
    privateGetInstitutionalSubaccountsOrdersOpen(params?: {}): Promise<List>;
    privatePostOrder(params?: {}): Promise<Dict>;
    privatePostCancelOrdersAfter(params?: {}): Promise<Dict>;
    privatePostWithdrawal(params?: {}): Promise<Dict>;
    privatePostCryptoWithdrawal(params?: {}): Promise<Dict>;
    privatePostSubaccounts(params?: {}): Promise<Dict>;
    privatePostSubaccountsTransfers(params?: {}): Promise<Dict>;
    privatePutOrder(params?: {}): Promise<Dict>;
    privateDeleteOrder(params?: {}): Promise<Dict>;
    privateDeleteOrders(params?: {}): Promise<List>;
    privateDeleteAtomicOrders(params?: {}): Promise<List>;
    privateDeleteInstitutionalSubaccountsOrder(params?: {}): Promise<Dict>;
    privateDeleteInstitutionalSubaccountsOrders(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
