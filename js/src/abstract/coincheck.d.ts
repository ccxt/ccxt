import { Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetExchangeOrdersRate(params?: {}): Promise<Dict>;
    publicGetExchangeStatus(params?: {}): Promise<Dict>;
    publicGetOrderBooks(params?: {}): Promise<Dict>;
    publicGetRatePair(params?: {}): Promise<Dict>;
    publicGetTicker(params?: {}): Promise<Dict>;
    publicGetTrades(params?: {}): Promise<Dict>;
    privateGetAccounts(params?: {}): Promise<Dict>;
    privateGetAccountsBalance(params?: {}): Promise<Dict>;
    privateGetAccountsLeverageBalance(params?: {}): Promise<Dict>;
    privateGetBankAccounts(params?: {}): Promise<Dict>;
    privateGetDepositMoney(params?: {}): Promise<Dict>;
    privateGetExchangeOrdersId(params?: {}): Promise<Dict>;
    privateGetExchangeOrdersOpens(params?: {}): Promise<Dict>;
    privateGetExchangeOrdersCancelStatus(params?: {}): Promise<Dict>;
    privateGetExchangeOrdersTransactions(params?: {}): Promise<Dict>;
    privateGetExchangeOrdersTransactionsPagination(params?: {}): Promise<Dict>;
    privateGetExchangeLeveragePositions(params?: {}): Promise<Dict>;
    privateGetLendingBorrowsMatches(params?: {}): Promise<Dict>;
    privateGetSendMoney(params?: {}): Promise<Dict>;
    privateGetWithdraws(params?: {}): Promise<Dict>;
    privatePostBankAccounts(params?: {}): Promise<Dict>;
    privatePostDepositMoneyIdFast(params?: {}): Promise<Dict>;
    privatePostExchangeOrders(params?: {}): Promise<Dict>;
    privatePostExchangeTransfersToLeverage(params?: {}): Promise<Dict>;
    privatePostExchangeTransfersFromLeverage(params?: {}): Promise<Dict>;
    privatePostLendingBorrows(params?: {}): Promise<Dict>;
    privatePostLendingBorrowsIdRepay(params?: {}): Promise<Dict>;
    privatePostSendMoney(params?: {}): Promise<Dict>;
    privatePostWithdraws(params?: {}): Promise<Dict>;
    privateDeleteBankAccountsId(params?: {}): Promise<Dict>;
    privateDeleteExchangeOrdersId(params?: {}): Promise<Dict>;
    privateDeleteWithdrawsId(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
