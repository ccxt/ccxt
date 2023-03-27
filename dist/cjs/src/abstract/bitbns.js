'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    wwwGetOrderFetchMarkets(params) { return this['wwwGetOrderFetchMarkets'](params); }
    wwwGetOrderFetchTickers(params) { return this['wwwGetOrderFetchTickers'](params); }
    wwwGetOrderFetchOrderbook(params) { return this['wwwGetOrderFetchOrderbook'](params); }
    wwwGetOrderGetTickerWithVolume(params) { return this['wwwGetOrderGetTickerWithVolume'](params); }
    wwwGetExchangeDataOhlc(params) { return this['wwwGetExchangeDataOhlc'](params); }
    wwwGetExchangeDataOrderBook(params) { return this['wwwGetExchangeDataOrderBook'](params); }
    wwwGetExchangeDataTradedetails(params) { return this['wwwGetExchangeDataTradedetails'](params); }
    v1GetPlatformStatus(params) { return this['v1GetPlatformStatus'](params); }
    v1GetTickers(params) { return this['v1GetTickers'](params); }
    v1GetOrderbookSellSymbol(params) { return this['v1GetOrderbookSellSymbol'](params); }
    v1GetOrderbookBuySymbol(params) { return this['v1GetOrderbookBuySymbol'](params); }
    v1PostCurrentCoinBalanceEVERYTHING(params) { return this['v1PostCurrentCoinBalanceEVERYTHING'](params); }
    v1PostGetApiUsageStatusUSAGE(params) { return this['v1PostGetApiUsageStatusUSAGE'](params); }
    v1PostGetOrderSocketTokenUSAGE(params) { return this['v1PostGetOrderSocketTokenUSAGE'](params); }
    v1PostCurrentCoinBalanceSymbol(params) { return this['v1PostCurrentCoinBalanceSymbol'](params); }
    v1PostOrderStatusSymbol(params) { return this['v1PostOrderStatusSymbol'](params); }
    v1PostDepositHistorySymbol(params) { return this['v1PostDepositHistorySymbol'](params); }
    v1PostWithdrawHistorySymbol(params) { return this['v1PostWithdrawHistorySymbol'](params); }
    v1PostWithdrawHistoryAllSymbol(params) { return this['v1PostWithdrawHistoryAllSymbol'](params); }
    v1PostDepositHistoryAllSymbol(params) { return this['v1PostDepositHistoryAllSymbol'](params); }
    v1PostListOpenOrdersSymbol(params) { return this['v1PostListOpenOrdersSymbol'](params); }
    v1PostListOpenStopOrdersSymbol(params) { return this['v1PostListOpenStopOrdersSymbol'](params); }
    v1PostGetCoinAddressSymbol(params) { return this['v1PostGetCoinAddressSymbol'](params); }
    v1PostPlaceSellOrderSymbol(params) { return this['v1PostPlaceSellOrderSymbol'](params); }
    v1PostPlaceBuyOrderSymbol(params) { return this['v1PostPlaceBuyOrderSymbol'](params); }
    v1PostBuyStopLossSymbol(params) { return this['v1PostBuyStopLossSymbol'](params); }
    v1PostSellStopLossSymbol(params) { return this['v1PostSellStopLossSymbol'](params); }
    v1PostCancelOrderSymbol(params) { return this['v1PostCancelOrderSymbol'](params); }
    v1PostCancelStopLossOrderSymbol(params) { return this['v1PostCancelStopLossOrderSymbol'](params); }
    v1PostListExecutedOrdersSymbol(params) { return this['v1PostListExecutedOrdersSymbol'](params); }
    v1PostPlaceMarketOrderSymbol(params) { return this['v1PostPlaceMarketOrderSymbol'](params); }
    v1PostPlaceMarketOrderQntySymbol(params) { return this['v1PostPlaceMarketOrderQntySymbol'](params); }
    v2PostOrders(params) { return this['v2PostOrders'](params); }
    v2PostCancel(params) { return this['v2PostCancel'](params); }
    v2PostGetordersnew(params) { return this['v2PostGetordersnew'](params); }
    v2PostMarginOrders(params) { return this['v2PostMarginOrders'](params); }
}

module.exports = Exchange;
