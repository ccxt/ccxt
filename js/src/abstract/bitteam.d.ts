import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    historyGetApiTwHistoryPairNameResolution(params?: {}): Promise<implicitReturnType>;
    publicGetTradeApiAsset(params?: {}): Promise<implicitReturnType>;
    publicGetTradeApiCurrencies(params?: {}): Promise<implicitReturnType>;
    publicGetTradeApiOrderbooksSymbol(params?: {}): Promise<implicitReturnType>;
    publicGetTradeApiOrders(params?: {}): Promise<implicitReturnType>;
    publicGetTradeApiPairName(params?: {}): Promise<implicitReturnType>;
    publicGetTradeApiPairs(params?: {}): Promise<implicitReturnType>;
    publicGetTradeApiPairsPrecisions(params?: {}): Promise<implicitReturnType>;
    publicGetTradeApiRates(params?: {}): Promise<implicitReturnType>;
    publicGetTradeApiTradeId(params?: {}): Promise<implicitReturnType>;
    publicGetTradeApiTrades(params?: {}): Promise<implicitReturnType>;
    publicGetTradeApiCcxtPairs(params?: {}): Promise<implicitReturnType>;
    publicGetTradeApiCmcAssets(params?: {}): Promise<implicitReturnType>;
    publicGetTradeApiCmcOrderbookPair(params?: {}): Promise<implicitReturnType>;
    publicGetTradeApiCmcSummary(params?: {}): Promise<implicitReturnType>;
    publicGetTradeApiCmcTicker(params?: {}): Promise<implicitReturnType>;
    publicGetTradeApiCmcTradesPair(params?: {}): Promise<implicitReturnType>;
    privateGetTradeApiCcxtBalance(params?: {}): Promise<implicitReturnType>;
    privateGetTradeApiCcxtOrderId(params?: {}): Promise<implicitReturnType>;
    privateGetTradeApiCcxtOrdersOfUser(params?: {}): Promise<implicitReturnType>;
    privateGetTradeApiCcxtTradesOfUser(params?: {}): Promise<implicitReturnType>;
    privateGetTradeApiTransactionsOfUser(params?: {}): Promise<implicitReturnType>;
    privatePostTradeApiCcxtCancelAllOrder(params?: {}): Promise<implicitReturnType>;
    privatePostTradeApiCcxtCancelorder(params?: {}): Promise<implicitReturnType>;
    privatePostTradeApiCcxtOrdercreate(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
