import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetOrderbook(params?: {}): Promise<implicitReturnType>;
    publicGetTrades(params?: {}): Promise<implicitReturnType>;
    publicGetTicker(params?: {}): Promise<implicitReturnType>;
    privatePostAccountDepositAddress(params?: {}): Promise<implicitReturnType>;
    privatePostAccountBtcDepositAddress(params?: {}): Promise<implicitReturnType>;
    privatePostAccountBalance(params?: {}): Promise<implicitReturnType>;
    privatePostAccountDailyBalance(params?: {}): Promise<implicitReturnType>;
    privatePostAccountUserInfo(params?: {}): Promise<implicitReturnType>;
    privatePostAccountVirtualAccount(params?: {}): Promise<implicitReturnType>;
    privatePostOrderCancelAll(params?: {}): Promise<implicitReturnType>;
    privatePostOrderCancel(params?: {}): Promise<implicitReturnType>;
    privatePostOrderLimitBuy(params?: {}): Promise<implicitReturnType>;
    privatePostOrderLimitSell(params?: {}): Promise<implicitReturnType>;
    privatePostOrderCompleteOrders(params?: {}): Promise<implicitReturnType>;
    privatePostOrderLimitOrders(params?: {}): Promise<implicitReturnType>;
    privatePostOrderQueryOrder(params?: {}): Promise<implicitReturnType>;
    privatePostTransactionAuthNumber(params?: {}): Promise<implicitReturnType>;
    privatePostTransactionHistory(params?: {}): Promise<implicitReturnType>;
    privatePostTransactionKrwHistory(params?: {}): Promise<implicitReturnType>;
    privatePostTransactionBtc(params?: {}): Promise<implicitReturnType>;
    privatePostTransactionCoin(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
