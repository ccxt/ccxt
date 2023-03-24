import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
export default abstract class Exchange extends _Exchange {
    abstract publicGetMarket(params?: {}): Promise<implicitReturnType>;
    abstract publicGetCurrency(params?: {}): Promise<implicitReturnType>;
    abstract publicGetCurrencyWithPlatform(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTime(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTicker(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOrderBook(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTrade(params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandle(params?: {}): Promise<implicitReturnType>;
    abstract privatePostNewOrder(params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancelOrder(params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdrawal(params?: {}): Promise<implicitReturnType>;
    abstract privateGetBalance(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrder(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenOrder(params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrderHistory(params?: {}): Promise<implicitReturnType>;
    abstract privateGetTradeHistory(params?: {}): Promise<implicitReturnType>;
    abstract privateGetDepositAddress(params?: {}): Promise<implicitReturnType>;
    abstract accountsPostToken(params?: {}): Promise<implicitReturnType>;
}
