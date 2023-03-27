'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    zendeskGet360000292886(params) { return this['zendeskGet360000292886'](params); }
    zendeskGet201893608(params) { return this['zendeskGet201893608'](params); }
    publicGetAssets(params) { return this['publicGetAssets'](params); }
    publicGetAssetPairs(params) { return this['publicGetAssetPairs'](params); }
    publicGetDepth(params) { return this['publicGetDepth'](params); }
    publicGetOHLC(params) { return this['publicGetOHLC'](params); }
    publicGetSpread(params) { return this['publicGetSpread'](params); }
    publicGetTicker(params) { return this['publicGetTicker'](params); }
    publicGetTime(params) { return this['publicGetTime'](params); }
    publicGetTrades(params) { return this['publicGetTrades'](params); }
    privatePostAddOrder(params) { return this['privatePostAddOrder'](params); }
    privatePostAddOrderBatch(params) { return this['privatePostAddOrderBatch'](params); }
    privatePostAddExport(params) { return this['privatePostAddExport'](params); }
    privatePostBalance(params) { return this['privatePostBalance'](params); }
    privatePostCancelAll(params) { return this['privatePostCancelAll'](params); }
    privatePostCancelOrder(params) { return this['privatePostCancelOrder'](params); }
    privatePostCancelOrderBatch(params) { return this['privatePostCancelOrderBatch'](params); }
    privatePostClosedOrders(params) { return this['privatePostClosedOrders'](params); }
    privatePostDepositAddresses(params) { return this['privatePostDepositAddresses'](params); }
    privatePostDepositMethods(params) { return this['privatePostDepositMethods'](params); }
    privatePostDepositStatus(params) { return this['privatePostDepositStatus'](params); }
    privatePostEditOrder(params) { return this['privatePostEditOrder'](params); }
    privatePostExportStatus(params) { return this['privatePostExportStatus'](params); }
    privatePostGetWebSocketsToken(params) { return this['privatePostGetWebSocketsToken'](params); }
    privatePostLedgers(params) { return this['privatePostLedgers'](params); }
    privatePostOpenOrders(params) { return this['privatePostOpenOrders'](params); }
    privatePostOpenPositions(params) { return this['privatePostOpenPositions'](params); }
    privatePostQueryLedgers(params) { return this['privatePostQueryLedgers'](params); }
    privatePostQueryOrders(params) { return this['privatePostQueryOrders'](params); }
    privatePostQueryTrades(params) { return this['privatePostQueryTrades'](params); }
    privatePostRetrieveExport(params) { return this['privatePostRetrieveExport'](params); }
    privatePostRemoveExport(params) { return this['privatePostRemoveExport'](params); }
    privatePostTradeBalance(params) { return this['privatePostTradeBalance'](params); }
    privatePostTradesHistory(params) { return this['privatePostTradesHistory'](params); }
    privatePostTradeVolume(params) { return this['privatePostTradeVolume'](params); }
    privatePostWithdraw(params) { return this['privatePostWithdraw'](params); }
    privatePostWithdrawCancel(params) { return this['privatePostWithdrawCancel'](params); }
    privatePostWithdrawInfo(params) { return this['privatePostWithdrawInfo'](params); }
    privatePostWithdrawStatus(params) { return this['privatePostWithdrawStatus'](params); }
    privatePostStake(params) { return this['privatePostStake'](params); }
    privatePostUnstake(params) { return this['privatePostUnstake'](params); }
    privatePostStakingAssets(params) { return this['privatePostStakingAssets'](params); }
    privatePostStakingPending(params) { return this['privatePostStakingPending'](params); }
    privatePostStakingTransactions(params) { return this['privatePostStakingTransactions'](params); }
}

module.exports = Exchange;
