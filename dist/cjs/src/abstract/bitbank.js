'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetPairTicker(params) { return this['publicGetPairTicker'](params); }
    publicGetPairDepth(params) { return this['publicGetPairDepth'](params); }
    publicGetPairTransactions(params) { return this['publicGetPairTransactions'](params); }
    publicGetPairTransactionsYyyymmdd(params) { return this['publicGetPairTransactionsYyyymmdd'](params); }
    publicGetPairCandlestickCandletypeYyyymmdd(params) { return this['publicGetPairCandlestickCandletypeYyyymmdd'](params); }
    privateGetUserAssets(params) { return this['privateGetUserAssets'](params); }
    privateGetUserSpotOrder(params) { return this['privateGetUserSpotOrder'](params); }
    privateGetUserSpotActiveOrders(params) { return this['privateGetUserSpotActiveOrders'](params); }
    privateGetUserSpotTradeHistory(params) { return this['privateGetUserSpotTradeHistory'](params); }
    privateGetUserWithdrawalAccount(params) { return this['privateGetUserWithdrawalAccount'](params); }
    privatePostUserSpotOrder(params) { return this['privatePostUserSpotOrder'](params); }
    privatePostUserSpotCancelOrder(params) { return this['privatePostUserSpotCancelOrder'](params); }
    privatePostUserSpotCancelOrders(params) { return this['privatePostUserSpotCancelOrders'](params); }
    privatePostUserSpotOrdersInfo(params) { return this['privatePostUserSpotOrdersInfo'](params); }
    privatePostUserRequestWithdrawal(params) { return this['privatePostUserRequestWithdrawal'](params); }
    marketsGetSpotPairs(params) { return this['marketsGetSpotPairs'](params); }
}

module.exports = Exchange;
