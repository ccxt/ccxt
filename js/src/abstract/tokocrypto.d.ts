import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    binanceGetPing(params?: {}): Promise<implicitReturnType>;
    binanceGetTime(params?: {}): Promise<implicitReturnType>;
    binanceGetDepth(params?: {}): Promise<implicitReturnType>;
    binanceGetTrades(params?: {}): Promise<implicitReturnType>;
    binanceGetAggTrades(params?: {}): Promise<implicitReturnType>;
    binanceGetHistoricalTrades(params?: {}): Promise<implicitReturnType>;
    binanceGetKlines(params?: {}): Promise<implicitReturnType>;
    binanceGetTicker24hr(params?: {}): Promise<implicitReturnType>;
    binanceGetTickerPrice(params?: {}): Promise<implicitReturnType>;
    binanceGetTickerBookTicker(params?: {}): Promise<implicitReturnType>;
    binanceGetExchangeInfo(params?: {}): Promise<implicitReturnType>;
    binancePutUserDataStream(params?: {}): Promise<implicitReturnType>;
    binancePostUserDataStream(params?: {}): Promise<implicitReturnType>;
    binanceDeleteUserDataStream(params?: {}): Promise<implicitReturnType>;
    publicGetOpenV1CommonTime(params?: {}): Promise<implicitReturnType>;
    publicGetOpenV1CommonSymbols(params?: {}): Promise<implicitReturnType>;
    publicGetOpenV1MarketDepth(params?: {}): Promise<implicitReturnType>;
    publicGetOpenV1MarketTrades(params?: {}): Promise<implicitReturnType>;
    publicGetOpenV1MarketAggTrades(params?: {}): Promise<implicitReturnType>;
    publicGetOpenV1MarketKlines(params?: {}): Promise<implicitReturnType>;
    privateGetOpenV1OrdersDetail(params?: {}): Promise<implicitReturnType>;
    privateGetOpenV1Orders(params?: {}): Promise<implicitReturnType>;
    privateGetOpenV1AccountSpot(params?: {}): Promise<implicitReturnType>;
    privateGetOpenV1AccountSpotAsset(params?: {}): Promise<implicitReturnType>;
    privateGetOpenV1OrdersTrades(params?: {}): Promise<implicitReturnType>;
    privateGetOpenV1Withdraws(params?: {}): Promise<implicitReturnType>;
    privateGetOpenV1Deposits(params?: {}): Promise<implicitReturnType>;
    privateGetOpenV1DepositsAddress(params?: {}): Promise<implicitReturnType>;
    privatePostOpenV1Orders(params?: {}): Promise<implicitReturnType>;
    privatePostOpenV1OrdersCancel(params?: {}): Promise<implicitReturnType>;
    privatePostOpenV1OrdersOco(params?: {}): Promise<implicitReturnType>;
    privatePostOpenV1Withdraws(params?: {}): Promise<implicitReturnType>;
    privatePostOpenV1UserDataStream(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
