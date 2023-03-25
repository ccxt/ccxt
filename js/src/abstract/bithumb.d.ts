import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
export default abstract class Exchange extends _Exchange {
    abstract publicGetTickerCurrency(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTickerAll(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTickerALLBTC(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTickerALLKRW(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOrderbookCurrency(params?: {}): Promise<implicitReturnType>;
    abstract publicGetOrderbookAll(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTransactionHistoryCurrency(params?: {}): Promise<implicitReturnType>;
    abstract publicGetTransactionHistoryAll(params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandlestickCurrencyInterval(params?: {}): Promise<implicitReturnType>;
    abstract privatePostInfoAccount(params?: {}): Promise<implicitReturnType>;
    abstract privatePostInfoBalance(params?: {}): Promise<implicitReturnType>;
    abstract privatePostInfoWalletAddress(params?: {}): Promise<implicitReturnType>;
    abstract privatePostInfoTicker(params?: {}): Promise<implicitReturnType>;
    abstract privatePostInfoOrders(params?: {}): Promise<implicitReturnType>;
    abstract privatePostInfoUserTransactions(params?: {}): Promise<implicitReturnType>;
    abstract privatePostInfoOrderDetail(params?: {}): Promise<implicitReturnType>;
    abstract privatePostTradePlace(params?: {}): Promise<implicitReturnType>;
    abstract privatePostTradeCancel(params?: {}): Promise<implicitReturnType>;
    abstract privatePostTradeBtcWithdrawal(params?: {}): Promise<implicitReturnType>;
    abstract privatePostTradeKrwDeposit(params?: {}): Promise<implicitReturnType>;
    abstract privatePostTradeKrwWithdrawal(params?: {}): Promise<implicitReturnType>;
    abstract privatePostTradeMarketBuy(params?: {}): Promise<implicitReturnType>;
    abstract privatePostTradeMarketSell(params?: {}): Promise<implicitReturnType>;
}
