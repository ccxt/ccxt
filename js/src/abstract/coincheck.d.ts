import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetExchangeOrdersRate(params?: {}): Promise<implicitReturnType>;
    publicGetOrderBooks(params?: {}): Promise<implicitReturnType>;
    publicGetRatePair(params?: {}): Promise<implicitReturnType>;
    publicGetTicker(params?: {}): Promise<implicitReturnType>;
    publicGetTrades(params?: {}): Promise<implicitReturnType>;
    privateGetAccounts(params?: {}): Promise<implicitReturnType>;
    privateGetAccountsBalance(params?: {}): Promise<implicitReturnType>;
    privateGetAccountsLeverageBalance(params?: {}): Promise<implicitReturnType>;
    privateGetBankAccounts(params?: {}): Promise<implicitReturnType>;
    privateGetDepositMoney(params?: {}): Promise<implicitReturnType>;
    privateGetExchangeOrdersOpens(params?: {}): Promise<implicitReturnType>;
    privateGetExchangeOrdersTransactions(params?: {}): Promise<implicitReturnType>;
    privateGetExchangeOrdersTransactionsPagination(params?: {}): Promise<implicitReturnType>;
    privateGetExchangeLeveragePositions(params?: {}): Promise<implicitReturnType>;
    privateGetLendingBorrowsMatches(params?: {}): Promise<implicitReturnType>;
    privateGetSendMoney(params?: {}): Promise<implicitReturnType>;
    privateGetWithdraws(params?: {}): Promise<implicitReturnType>;
    privatePostBankAccounts(params?: {}): Promise<implicitReturnType>;
    privatePostDepositMoneyIdFast(params?: {}): Promise<implicitReturnType>;
    privatePostExchangeOrders(params?: {}): Promise<implicitReturnType>;
    privatePostExchangeTransfersToLeverage(params?: {}): Promise<implicitReturnType>;
    privatePostExchangeTransfersFromLeverage(params?: {}): Promise<implicitReturnType>;
    privatePostLendingBorrows(params?: {}): Promise<implicitReturnType>;
    privatePostLendingBorrowsIdRepay(params?: {}): Promise<implicitReturnType>;
    privatePostSendMoney(params?: {}): Promise<implicitReturnType>;
    privatePostWithdraws(params?: {}): Promise<implicitReturnType>;
    privateDeleteBankAccountsId(params?: {}): Promise<implicitReturnType>;
    privateDeleteExchangeOrdersId(params?: {}): Promise<implicitReturnType>;
    privateDeleteWithdrawsId(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
