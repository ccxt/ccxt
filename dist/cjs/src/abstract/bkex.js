'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicSpotGetCommonSymbols(params) { return this['publicSpotGetCommonSymbols'](params); }
    publicSpotGetCommonCurrencys(params) { return this['publicSpotGetCommonCurrencys'](params); }
    publicSpotGetCommonTimestamp(params) { return this['publicSpotGetCommonTimestamp'](params); }
    publicSpotGetQKline(params) { return this['publicSpotGetQKline'](params); }
    publicSpotGetQTickers(params) { return this['publicSpotGetQTickers'](params); }
    publicSpotGetQTickerPrice(params) { return this['publicSpotGetQTickerPrice'](params); }
    publicSpotGetQDepth(params) { return this['publicSpotGetQDepth'](params); }
    publicSpotGetQDeals(params) { return this['publicSpotGetQDeals'](params); }
    publicSwapGetMarketCandle(params) { return this['publicSwapGetMarketCandle'](params); }
    publicSwapGetMarketDeals(params) { return this['publicSwapGetMarketDeals'](params); }
    publicSwapGetMarketDepth(params) { return this['publicSwapGetMarketDepth'](params); }
    publicSwapGetMarketFundingRate(params) { return this['publicSwapGetMarketFundingRate'](params); }
    publicSwapGetMarketIndex(params) { return this['publicSwapGetMarketIndex'](params); }
    publicSwapGetMarketRiskLimit(params) { return this['publicSwapGetMarketRiskLimit'](params); }
    publicSwapGetMarketSymbols(params) { return this['publicSwapGetMarketSymbols'](params); }
    publicSwapGetMarketTickerPrice(params) { return this['publicSwapGetMarketTickerPrice'](params); }
    publicSwapGetMarketTickers(params) { return this['publicSwapGetMarketTickers'](params); }
    publicSwapGetServerPing(params) { return this['publicSwapGetServerPing'](params); }
    privateSpotGetUApiInfo(params) { return this['privateSpotGetUApiInfo'](params); }
    privateSpotGetUAccountBalance(params) { return this['privateSpotGetUAccountBalance'](params); }
    privateSpotGetUWalletAddress(params) { return this['privateSpotGetUWalletAddress'](params); }
    privateSpotGetUWalletDepositRecord(params) { return this['privateSpotGetUWalletDepositRecord'](params); }
    privateSpotGetUWalletWithdrawRecord(params) { return this['privateSpotGetUWalletWithdrawRecord'](params); }
    privateSpotGetUOrderOpenOrders(params) { return this['privateSpotGetUOrderOpenOrders'](params); }
    privateSpotGetUOrderOpenOrderDetail(params) { return this['privateSpotGetUOrderOpenOrderDetail'](params); }
    privateSpotGetUOrderHistoryOrders(params) { return this['privateSpotGetUOrderHistoryOrders'](params); }
    privateSpotPostUAccountTransfer(params) { return this['privateSpotPostUAccountTransfer'](params); }
    privateSpotPostUWalletWithdraw(params) { return this['privateSpotPostUWalletWithdraw'](params); }
    privateSpotPostUOrderCreate(params) { return this['privateSpotPostUOrderCreate'](params); }
    privateSpotPostUOrderCancel(params) { return this['privateSpotPostUOrderCancel'](params); }
    privateSpotPostUOrderBatchCreate(params) { return this['privateSpotPostUOrderBatchCreate'](params); }
    privateSpotPostUOrderBatchCancel(params) { return this['privateSpotPostUOrderBatchCancel'](params); }
    privateSwapGetAccountBalance(params) { return this['privateSwapGetAccountBalance'](params); }
    privateSwapGetAccountBalanceRecord(params) { return this['privateSwapGetAccountBalanceRecord'](params); }
    privateSwapGetAccountOrder(params) { return this['privateSwapGetAccountOrder'](params); }
    privateSwapGetAccountOrderForced(params) { return this['privateSwapGetAccountOrderForced'](params); }
    privateSwapGetAccountPosition(params) { return this['privateSwapGetAccountPosition'](params); }
    privateSwapGetEntrustFinished(params) { return this['privateSwapGetEntrustFinished'](params); }
    privateSwapGetEntrustUnFinish(params) { return this['privateSwapGetEntrustUnFinish'](params); }
    privateSwapGetOrderFinished(params) { return this['privateSwapGetOrderFinished'](params); }
    privateSwapGetOrderFinishedInfo(params) { return this['privateSwapGetOrderFinishedInfo'](params); }
    privateSwapGetOrderUnFinish(params) { return this['privateSwapGetOrderUnFinish'](params); }
    privateSwapGetPositionInfo(params) { return this['privateSwapGetPositionInfo'](params); }
    privateSwapPostAccountSetLeverage(params) { return this['privateSwapPostAccountSetLeverage'](params); }
    privateSwapPostEntrustAdd(params) { return this['privateSwapPostEntrustAdd'](params); }
    privateSwapPostEntrustCancel(params) { return this['privateSwapPostEntrustCancel'](params); }
    privateSwapPostOrderBatchCancel(params) { return this['privateSwapPostOrderBatchCancel'](params); }
    privateSwapPostOrderBatchOpen(params) { return this['privateSwapPostOrderBatchOpen'](params); }
    privateSwapPostOrderCancel(params) { return this['privateSwapPostOrderCancel'](params); }
    privateSwapPostOrderClose(params) { return this['privateSwapPostOrderClose'](params); }
    privateSwapPostOrderCloseAll(params) { return this['privateSwapPostOrderCloseAll'](params); }
    privateSwapPostOrderOpen(params) { return this['privateSwapPostOrderOpen'](params); }
    privateSwapPostPositionSetSpSl(params) { return this['privateSwapPostPositionSetSpSl'](params); }
    privateSwapPostPositionUpdate(params) { return this['privateSwapPostPositionUpdate'](params); }
}

module.exports = Exchange;
