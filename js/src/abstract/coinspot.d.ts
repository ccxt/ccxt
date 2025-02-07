import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetLatest(params?: {}): Promise<implicitReturnType>;
    privatePostOrders(params?: {}): Promise<implicitReturnType>;
    privatePostOrdersHistory(params?: {}): Promise<implicitReturnType>;
    privatePostMyCoinDeposit(params?: {}): Promise<implicitReturnType>;
    privatePostMyCoinSend(params?: {}): Promise<implicitReturnType>;
    privatePostQuoteBuy(params?: {}): Promise<implicitReturnType>;
    privatePostQuoteSell(params?: {}): Promise<implicitReturnType>;
    privatePostMyBalances(params?: {}): Promise<implicitReturnType>;
    privatePostMyOrders(params?: {}): Promise<implicitReturnType>;
    privatePostMyBuy(params?: {}): Promise<implicitReturnType>;
    privatePostMySell(params?: {}): Promise<implicitReturnType>;
    privatePostMyBuyCancel(params?: {}): Promise<implicitReturnType>;
    privatePostMySellCancel(params?: {}): Promise<implicitReturnType>;
    privatePostRoMyBalances(params?: {}): Promise<implicitReturnType>;
    privatePostRoMyBalancesCointype(params?: {}): Promise<implicitReturnType>;
    privatePostRoMyDeposits(params?: {}): Promise<implicitReturnType>;
    privatePostRoMyWithdrawals(params?: {}): Promise<implicitReturnType>;
    privatePostRoMyTransactions(params?: {}): Promise<implicitReturnType>;
    privatePostRoMyTransactionsCointype(params?: {}): Promise<implicitReturnType>;
    privatePostRoMyTransactionsOpen(params?: {}): Promise<implicitReturnType>;
    privatePostRoMyTransactionsCointypeOpen(params?: {}): Promise<implicitReturnType>;
    privatePostRoMySendreceive(params?: {}): Promise<implicitReturnType>;
    privatePostRoMyAffiliatepayments(params?: {}): Promise<implicitReturnType>;
    privatePostRoMyReferralpayments(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
