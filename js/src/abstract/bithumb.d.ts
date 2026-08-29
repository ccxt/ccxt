import { Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetTickerALLQuoteId(params?: {}): Promise<Dict>;
    publicGetTickerBaseIdQuoteId(params?: {}): Promise<Dict>;
    publicGetOrderbookALLQuoteId(params?: {}): Promise<Dict>;
    publicGetOrderbookBaseIdQuoteId(params?: {}): Promise<Dict>;
    publicGetTransactionHistoryBaseIdQuoteId(params?: {}): Promise<Dict>;
    publicGetNetworkInfo(params?: {}): Promise<Dict>;
    publicGetAssetsstatusMultichainALL(params?: {}): Promise<Dict>;
    publicGetAssetsstatusMultichainCurrency(params?: {}): Promise<Dict>;
    publicGetWithdrawMinimumALL(params?: {}): Promise<Dict>;
    publicGetWithdrawMinimumCurrency(params?: {}): Promise<Dict>;
    publicGetAssetsstatusALL(params?: {}): Promise<Dict>;
    publicGetAssetsstatusBaseId(params?: {}): Promise<Dict>;
    publicGetCandlestickBaseIdQuoteIdInterval(params?: {}): Promise<Dict>;
    privatePostInfoAccount(params?: {}): Promise<Dict>;
    privatePostInfoBalance(params?: {}): Promise<Dict>;
    privatePostInfoWalletAddress(params?: {}): Promise<Dict>;
    privatePostInfoTicker(params?: {}): Promise<Dict>;
    privatePostInfoOrders(params?: {}): Promise<Dict>;
    privatePostInfoUserTransactions(params?: {}): Promise<Dict>;
    privatePostInfoOrderDetail(params?: {}): Promise<Dict>;
    privatePostTradePlace(params?: {}): Promise<Dict>;
    privatePostTradeCancel(params?: {}): Promise<Dict>;
    privatePostTradeBtcWithdrawal(params?: {}): Promise<Dict>;
    privatePostTradeKrwDeposit(params?: {}): Promise<Dict>;
    privatePostTradeKrwWithdrawal(params?: {}): Promise<Dict>;
    privatePostTradeMarketBuy(params?: {}): Promise<Dict>;
    privatePostTradeMarketSell(params?: {}): Promise<Dict>;
    privatePostTradeStopLimit(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
