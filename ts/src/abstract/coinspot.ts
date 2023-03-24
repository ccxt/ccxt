import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetLatest (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrdersHistory (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMyCoinDeposit (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMyCoinSend (params?: {}): Promise<implicitReturnType>;
    abstract privatePostQuoteBuy (params?: {}): Promise<implicitReturnType>;
    abstract privatePostQuoteSell (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMyBalances (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMyOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMyBuy (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMySell (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMyBuyCancel (params?: {}): Promise<implicitReturnType>;
    abstract privatePostMySellCancel (params?: {}): Promise<implicitReturnType>;
    abstract privatePostRoMyBalances (params?: {}): Promise<implicitReturnType>;
    abstract privatePostRoMyBalancesCointype (params?: {}): Promise<implicitReturnType>;
    abstract privatePostRoMyDeposits (params?: {}): Promise<implicitReturnType>;
    abstract privatePostRoMyWithdrawals (params?: {}): Promise<implicitReturnType>;
    abstract privatePostRoMyTransactions (params?: {}): Promise<implicitReturnType>;
    abstract privatePostRoMyTransactionsCointype (params?: {}): Promise<implicitReturnType>;
    abstract privatePostRoMyTransactionsOpen (params?: {}): Promise<implicitReturnType>;
    abstract privatePostRoMyTransactionsCointypeOpen (params?: {}): Promise<implicitReturnType>;
    abstract privatePostRoMySendreceive (params?: {}): Promise<implicitReturnType>;
    abstract privatePostRoMyAffiliatepayments (params?: {}): Promise<implicitReturnType>;
    abstract privatePostRoMyReferralpayments (params?: {}): Promise<implicitReturnType>;
}