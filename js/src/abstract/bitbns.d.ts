import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    wwwGetOrderFetchMarkets(params?: {}): Promise<implicitReturnType>;
    wwwGetOrderFetchTickers(params?: {}): Promise<implicitReturnType>;
    wwwGetOrderFetchOrderbook(params?: {}): Promise<implicitReturnType>;
    wwwGetOrderGetTickerWithVolume(params?: {}): Promise<implicitReturnType>;
    wwwGetExchangeDataOhlc(params?: {}): Promise<implicitReturnType>;
    wwwGetExchangeDataOrderBook(params?: {}): Promise<implicitReturnType>;
    wwwGetExchangeDataTradedetails(params?: {}): Promise<implicitReturnType>;
    v1GetPlatformStatus(params?: {}): Promise<implicitReturnType>;
    v1GetTickers(params?: {}): Promise<implicitReturnType>;
    v1GetOrderbookSellSymbol(params?: {}): Promise<implicitReturnType>;
    v1GetOrderbookBuySymbol(params?: {}): Promise<implicitReturnType>;
    v1PostCurrentCoinBalanceEVERYTHING(params?: {}): Promise<implicitReturnType>;
    v1PostGetApiUsageStatusUSAGE(params?: {}): Promise<implicitReturnType>;
    v1PostGetOrderSocketTokenUSAGE(params?: {}): Promise<implicitReturnType>;
    v1PostCurrentCoinBalanceSymbol(params?: {}): Promise<implicitReturnType>;
    v1PostOrderStatusSymbol(params?: {}): Promise<implicitReturnType>;
    v1PostDepositHistorySymbol(params?: {}): Promise<implicitReturnType>;
    v1PostWithdrawHistorySymbol(params?: {}): Promise<implicitReturnType>;
    v1PostWithdrawHistoryAllSymbol(params?: {}): Promise<implicitReturnType>;
    v1PostDepositHistoryAllSymbol(params?: {}): Promise<implicitReturnType>;
    v1PostListOpenOrdersSymbol(params?: {}): Promise<implicitReturnType>;
    v1PostListOpenStopOrdersSymbol(params?: {}): Promise<implicitReturnType>;
    v1PostGetCoinAddressSymbol(params?: {}): Promise<implicitReturnType>;
    v1PostPlaceSellOrderSymbol(params?: {}): Promise<implicitReturnType>;
    v1PostPlaceBuyOrderSymbol(params?: {}): Promise<implicitReturnType>;
    v1PostBuyStopLossSymbol(params?: {}): Promise<implicitReturnType>;
    v1PostSellStopLossSymbol(params?: {}): Promise<implicitReturnType>;
    v1PostCancelOrderSymbol(params?: {}): Promise<implicitReturnType>;
    v1PostCancelStopLossOrderSymbol(params?: {}): Promise<implicitReturnType>;
    v1PostListExecutedOrdersSymbol(params?: {}): Promise<implicitReturnType>;
    v1PostPlaceMarketOrderSymbol(params?: {}): Promise<implicitReturnType>;
    v1PostPlaceMarketOrderQntySymbol(params?: {}): Promise<implicitReturnType>;
    v2PostOrders(params?: {}): Promise<implicitReturnType>;
    v2PostCancel(params?: {}): Promise<implicitReturnType>;
    v2PostGetordersnew(params?: {}): Promise<implicitReturnType>;
    v2PostMarginOrders(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
