import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetTickerALLQuoteId(params?: {}): Promise<implicitReturnType>;
    publicGetTickerBaseIdQuoteId(params?: {}): Promise<implicitReturnType>;
    publicGetOrderbookALLQuoteId(params?: {}): Promise<implicitReturnType>;
    publicGetOrderbookBaseIdQuoteId(params?: {}): Promise<implicitReturnType>;
    publicGetTransactionHistoryBaseIdQuoteId(params?: {}): Promise<implicitReturnType>;
    publicGetNetworkInfo(params?: {}): Promise<implicitReturnType>;
    publicGetAssetsstatusMultichainALL(params?: {}): Promise<implicitReturnType>;
    publicGetAssetsstatusMultichainCurrency(params?: {}): Promise<implicitReturnType>;
    publicGetWithdrawMinimumALL(params?: {}): Promise<implicitReturnType>;
    publicGetWithdrawMinimumCurrency(params?: {}): Promise<implicitReturnType>;
    publicGetAssetsstatusALL(params?: {}): Promise<implicitReturnType>;
    publicGetAssetsstatusBaseId(params?: {}): Promise<implicitReturnType>;
    publicGetCandlestickBaseIdQuoteIdInterval(params?: {}): Promise<implicitReturnType>;
    privatePostInfoAccount(params?: {}): Promise<implicitReturnType>;
    privatePostInfoBalance(params?: {}): Promise<implicitReturnType>;
    privatePostInfoWalletAddress(params?: {}): Promise<implicitReturnType>;
    privatePostInfoTicker(params?: {}): Promise<implicitReturnType>;
    privatePostInfoOrders(params?: {}): Promise<implicitReturnType>;
    privatePostInfoUserTransactions(params?: {}): Promise<implicitReturnType>;
    privatePostInfoOrderDetail(params?: {}): Promise<implicitReturnType>;
    privatePostTradePlace(params?: {}): Promise<implicitReturnType>;
    privatePostTradeCancel(params?: {}): Promise<implicitReturnType>;
    privatePostTradeBtcWithdrawal(params?: {}): Promise<implicitReturnType>;
    privatePostTradeKrwDeposit(params?: {}): Promise<implicitReturnType>;
    privatePostTradeKrwWithdrawal(params?: {}): Promise<implicitReturnType>;
    privatePostTradeMarketBuy(params?: {}): Promise<implicitReturnType>;
    privatePostTradeMarketSell(params?: {}): Promise<implicitReturnType>;
    privatePostTradeStopLimit(params?: {}): Promise<implicitReturnType>;
    v2publicGetMarketAll(params?: {}): Promise<implicitReturnType>;
    v2publicGetTicker(params?: {}): Promise<implicitReturnType>;
    v2publicGetOrderbook(params?: {}): Promise<implicitReturnType>;
    v2publicGetTradesTicks(params?: {}): Promise<implicitReturnType>;
    v2publicGetCandlesMinutesUnit(params?: {}): Promise<implicitReturnType>;
    v2publicGetCandlesInterval(params?: {}): Promise<implicitReturnType>;
    v2publicGetCandlestickMarketInterval(params?: {}): Promise<implicitReturnType>;
    v2privateGetAccounts(params?: {}): Promise<implicitReturnType>;
    v2privateGetOrdersChance(params?: {}): Promise<implicitReturnType>;
    v2privateGetOrder(params?: {}): Promise<implicitReturnType>;
    v2privateGetOrders(params?: {}): Promise<implicitReturnType>;
    v2privatePostOrders(params?: {}): Promise<implicitReturnType>;
    v2privateDeleteOrder(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
