import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetExchangeOrdersRate (params?: {}): Promise<implicitReturnType>;
    abstract publicGetOrderBooks (params?: {}): Promise<implicitReturnType>;
    abstract publicGetRatePair (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTicker (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTrades (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccounts (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountsBalance (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountsLeverageBalance (params?: {}): Promise<implicitReturnType>;
    abstract privateGetBankAccounts (params?: {}): Promise<implicitReturnType>;
    abstract privateGetDepositMoney (params?: {}): Promise<implicitReturnType>;
    abstract privateGetExchangeOrdersOpens (params?: {}): Promise<implicitReturnType>;
    abstract privateGetExchangeOrdersTransactions (params?: {}): Promise<implicitReturnType>;
    abstract privateGetExchangeOrdersTransactionsPagination (params?: {}): Promise<implicitReturnType>;
    abstract privateGetExchangeLeveragePositions (params?: {}): Promise<implicitReturnType>;
    abstract privateGetLendingBorrowsMatches (params?: {}): Promise<implicitReturnType>;
    abstract privateGetSendMoney (params?: {}): Promise<implicitReturnType>;
    abstract privateGetWithdraws (params?: {}): Promise<implicitReturnType>;
    abstract privatePostBankAccounts (params?: {}): Promise<implicitReturnType>;
    abstract privatePostDepositMoneyIdFast (params?: {}): Promise<implicitReturnType>;
    abstract privatePostExchangeOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostExchangeTransfersToLeverage (params?: {}): Promise<implicitReturnType>;
    abstract privatePostExchangeTransfersFromLeverage (params?: {}): Promise<implicitReturnType>;
    abstract privatePostLendingBorrows (params?: {}): Promise<implicitReturnType>;
    abstract privatePostLendingBorrowsIdRepay (params?: {}): Promise<implicitReturnType>;
    abstract privatePostSendMoney (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdraws (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteBankAccountsId (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteExchangeOrdersId (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteWithdrawsId (params?: {}): Promise<implicitReturnType>;
}