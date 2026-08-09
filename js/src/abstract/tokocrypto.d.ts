import { Dict, List } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    binanceGetPing(params?: {}): Promise<Dict>;
    binanceGetTime(params?: {}): Promise<Dict>;
    binanceGetDepth(params?: {}): Promise<Dict>;
    binanceGetTrades(params?: {}): Promise<List>;
    binanceGetAggTrades(params?: {}): Promise<List>;
    binanceGetHistoricalTrades(params?: {}): Promise<List>;
    binanceGetKlines(params?: {}): Promise<List>;
    binanceGetTicker24hr(params?: {}): Promise<List>;
    binanceGetTickerPrice(params?: {}): Promise<Dict>;
    binanceGetTickerBookTicker(params?: {}): Promise<List>;
    binanceGetExchangeInfo(params?: {}): Promise<Dict>;
    binancePutUserDataStream(params?: {}): Promise<Dict>;
    binancePostUserDataStream(params?: {}): Promise<Dict>;
    binanceDeleteUserDataStream(params?: {}): Promise<Dict>;
    publicGetOpenV1CommonTime(params?: {}): Promise<Dict>;
    publicGetOpenV1CommonSymbols(params?: {}): Promise<Dict>;
    publicGetOpenV1MarketDepth(params?: {}): Promise<Dict>;
    publicGetOpenV1MarketTrades(params?: {}): Promise<Dict>;
    publicGetOpenV1MarketAggTrades(params?: {}): Promise<Dict>;
    publicGetOpenV1MarketKlines(params?: {}): Promise<Dict>;
    privateGetOpenV1OrdersDetail(params?: {}): Promise<Dict>;
    privateGetOpenV1Orders(params?: {}): Promise<Dict>;
    privateGetOpenV1AccountSpot(params?: {}): Promise<Dict>;
    privateGetOpenV1AccountSpotAsset(params?: {}): Promise<Dict>;
    privateGetOpenV1OrdersTrades(params?: {}): Promise<Dict>;
    privateGetOpenV1Withdraws(params?: {}): Promise<Dict>;
    privateGetOpenV1Deposits(params?: {}): Promise<Dict>;
    privateGetOpenV1DepositsAddress(params?: {}): Promise<Dict>;
    privatePostOpenV1Orders(params?: {}): Promise<Dict>;
    privatePostOpenV1OrdersCancel(params?: {}): Promise<Dict>;
    privatePostOpenV1OrdersOco(params?: {}): Promise<Dict>;
    privatePostOpenV1Withdraws(params?: {}): Promise<Dict>;
    privatePostOpenV1UserDataStream(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
