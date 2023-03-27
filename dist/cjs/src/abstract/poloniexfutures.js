'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetContractsActive(params) { return this['publicGetContractsActive'](params); }
    publicGetContractsSymbol(params) { return this['publicGetContractsSymbol'](params); }
    publicGetTicker(params) { return this['publicGetTicker'](params); }
    publicGetTickers(params) { return this['publicGetTickers'](params); }
    publicGetLevel2Snapshot(params) { return this['publicGetLevel2Snapshot'](params); }
    publicGetLevel2Depth(params) { return this['publicGetLevel2Depth'](params); }
    publicGetLevel2MessageQuery(params) { return this['publicGetLevel2MessageQuery'](params); }
    publicGetLevel3Snapshot(params) { return this['publicGetLevel3Snapshot'](params); }
    publicGetTradeHistory(params) { return this['publicGetTradeHistory'](params); }
    publicGetInterestQuery(params) { return this['publicGetInterestQuery'](params); }
    publicGetIndexQuery(params) { return this['publicGetIndexQuery'](params); }
    publicGetMarkPriceSymbolCurrent(params) { return this['publicGetMarkPriceSymbolCurrent'](params); }
    publicGetPremiumQuery(params) { return this['publicGetPremiumQuery'](params); }
    publicGetFundingRateSymbolCurrent(params) { return this['publicGetFundingRateSymbolCurrent'](params); }
    publicGetTimestamp(params) { return this['publicGetTimestamp'](params); }
    publicGetStatus(params) { return this['publicGetStatus'](params); }
    publicGetKlineQuery(params) { return this['publicGetKlineQuery'](params); }
    publicPostBulletPublic(params) { return this['publicPostBulletPublic'](params); }
    privateGetAccountOverview(params) { return this['privateGetAccountOverview'](params); }
    privateGetTransactionHistory(params) { return this['privateGetTransactionHistory'](params); }
    privateGetOrders(params) { return this['privateGetOrders'](params); }
    privateGetStopOrders(params) { return this['privateGetStopOrders'](params); }
    privateGetRecentDoneOrders(params) { return this['privateGetRecentDoneOrders'](params); }
    privateGetOrdersOrderId(params) { return this['privateGetOrdersOrderId'](params); }
    privateGetFills(params) { return this['privateGetFills'](params); }
    privateGetOpenOrderStatistics(params) { return this['privateGetOpenOrderStatistics'](params); }
    privateGetPosition(params) { return this['privateGetPosition'](params); }
    privateGetPositions(params) { return this['privateGetPositions'](params); }
    privateGetFundingHistory(params) { return this['privateGetFundingHistory'](params); }
    privateGetMarginTypeQuery(params) { return this['privateGetMarginTypeQuery'](params); }
    privatePostOrders(params) { return this['privatePostOrders'](params); }
    privatePostBatchOrders(params) { return this['privatePostBatchOrders'](params); }
    privatePostPositionMarginAutoDepositStatus(params) { return this['privatePostPositionMarginAutoDepositStatus'](params); }
    privatePostPositionMarginDepositMargin(params) { return this['privatePostPositionMarginDepositMargin'](params); }
    privatePostBulletPrivate(params) { return this['privatePostBulletPrivate'](params); }
    privatePostMarginTypeChange(params) { return this['privatePostMarginTypeChange'](params); }
    privateDeleteOrdersOrderId(params) { return this['privateDeleteOrdersOrderId'](params); }
    privateDeleteOrders(params) { return this['privateDeleteOrders'](params); }
    privateDeleteStopOrders(params) { return this['privateDeleteStopOrders'](params); }
}

module.exports = Exchange;
