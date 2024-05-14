import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetMarket(params?: {}): Promise<implicitReturnType>;
    publicGetCurrency(params?: {}): Promise<implicitReturnType>;
    publicGetCurrencyWithPlatform(params?: {}): Promise<implicitReturnType>;
    publicGetTime(params?: {}): Promise<implicitReturnType>;
    publicGetTicker(params?: {}): Promise<implicitReturnType>;
    publicGetOrderBook(params?: {}): Promise<implicitReturnType>;
    publicGetTrade(params?: {}): Promise<implicitReturnType>;
    publicGetCandle(params?: {}): Promise<implicitReturnType>;
    privatePostNewOrder(params?: {}): Promise<implicitReturnType>;
    privatePostCancelOrder(params?: {}): Promise<implicitReturnType>;
    privatePostWithdrawal(params?: {}): Promise<implicitReturnType>;
    privateGetBalance(params?: {}): Promise<implicitReturnType>;
    privateGetOrder(params?: {}): Promise<implicitReturnType>;
    privateGetOpenOrder(params?: {}): Promise<implicitReturnType>;
    privateGetOrderHistory(params?: {}): Promise<implicitReturnType>;
    privateGetTradeHistory(params?: {}): Promise<implicitReturnType>;
    privateGetDepositAddress(params?: {}): Promise<implicitReturnType>;
    privateGetTransferPayment(params?: {}): Promise<implicitReturnType>;
    accountsPostToken(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
