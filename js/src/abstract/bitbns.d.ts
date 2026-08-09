import { List, Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    wwwGetOrderFetchMarkets(params?: {}): Promise<List>;
    wwwGetOrderFetchTickers(params?: {}): Promise<Dict>;
    wwwGetOrderFetchOrderbook(params?: {}): Promise<Dict>;
    wwwGetOrderGetTickerWithVolume(params?: {}): Promise<Dict>;
    wwwGetExchangeDataOhlc(params?: {}): Promise<List>;
    wwwGetExchangeDataOrderBook(params?: {}): Promise<Dict>;
    wwwGetExchangeDataTradedetails(params?: {}): Promise<List>;
    v1GetPlatformStatus(params?: {}): Promise<Dict>;
    v1GetTickers(params?: {}): Promise<Dict>;
    v1GetOrderbookSellSymbol(params?: {}): Promise<Dict>;
    v1GetOrderbookBuySymbol(params?: {}): Promise<Dict>;
    v1PostCurrentCoinBalanceEVERYTHING(params?: {}): Promise<Dict>;
    v1PostGetApiUsageStatusUSAGE(params?: {}): Promise<Dict>;
    v1PostGetOrderSocketTokenUSAGE(params?: {}): Promise<Dict>;
    v1PostCurrentCoinBalanceSymbol(params?: {}): Promise<Dict>;
    v1PostOrderStatusSymbol(params?: {}): Promise<Dict>;
    v1PostDepositHistorySymbol(params?: {}): Promise<Dict>;
    v1PostWithdrawHistorySymbol(params?: {}): Promise<Dict>;
    v1PostWithdrawHistoryAllSymbol(params?: {}): Promise<Dict>;
    v1PostDepositHistoryAllSymbol(params?: {}): Promise<Dict>;
    v1PostListOpenOrdersSymbol(params?: {}): Promise<Dict>;
    v1PostListOpenStopOrdersSymbol(params?: {}): Promise<Dict>;
    v1PostGetCoinAddressSymbol(params?: {}): Promise<Dict>;
    v1PostPlaceSellOrderSymbol(params?: {}): Promise<Dict>;
    v1PostPlaceBuyOrderSymbol(params?: {}): Promise<Dict>;
    v1PostBuyStopLossSymbol(params?: {}): Promise<Dict>;
    v1PostSellStopLossSymbol(params?: {}): Promise<Dict>;
    v1PostCancelOrderSymbol(params?: {}): Promise<Dict>;
    v1PostCancelStopLossOrderSymbol(params?: {}): Promise<Dict>;
    v1PostListExecutedOrdersSymbol(params?: {}): Promise<Dict>;
    v1PostPlaceMarketOrderSymbol(params?: {}): Promise<Dict>;
    v1PostPlaceMarketOrderQntySymbol(params?: {}): Promise<Dict>;
    v2PostOrders(params?: {}): Promise<Dict>;
    v2PostCancel(params?: {}): Promise<Dict>;
    v2PostGetordersnew(params?: {}): Promise<Dict>;
    v2PostMarginOrders(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
