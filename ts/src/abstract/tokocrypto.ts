import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract binanceGetPing (params?: {}): Promise<implicitReturnType>;
    abstract binanceGetTime (params?: {}): Promise<implicitReturnType>;
    abstract binanceGetDepth (params?: {}): Promise<implicitReturnType>;
    abstract binanceGetTrades (params?: {}): Promise<implicitReturnType>;
    abstract binanceGetAggTrades (params?: {}): Promise<implicitReturnType>;
    abstract binanceGetHistoricalTrades (params?: {}): Promise<implicitReturnType>;
    abstract binanceGetKlines (params?: {}): Promise<implicitReturnType>;
    abstract binanceGetTicker24hr (params?: {}): Promise<implicitReturnType>;
    abstract binanceGetTickerPrice (params?: {}): Promise<implicitReturnType>;
    abstract binanceGetTickerBookTicker (params?: {}): Promise<implicitReturnType>;
    abstract binanceGetExchangeInfo (params?: {}): Promise<implicitReturnType>;
    abstract binancePutUserDataStream (params?: {}): Promise<implicitReturnType>;
    abstract binancePostUserDataStream (params?: {}): Promise<implicitReturnType>;
    abstract binanceDeleteUserDataStream (params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenV1CommonTime (params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenV1CommonSymbols (params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenV1MarketDepth (params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenV1MarketTrades (params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenV1MarketAggTrades (params?: {}): Promise<implicitReturnType>;
    abstract publicGetOpenV1MarketKlines (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenV1OrdersDetail (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenV1Orders (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenV1AccountSpot (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenV1AccountSpotAsset (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenV1OrdersTrades (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenV1Withdraws (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenV1Deposits (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOpenV1DepositsAddress (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOpenV1Orders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOpenV1OrdersCancel (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOpenV1OrdersOco (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOpenV1Withdraws (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOpenV1UserDataStream (params?: {}): Promise<implicitReturnType>;
}