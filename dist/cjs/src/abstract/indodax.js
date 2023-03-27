'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetServerTime(params) { return this['publicGetServerTime'](params); }
    publicGetPairs(params) { return this['publicGetPairs'](params); }
    publicGetPriceIncrements(params) { return this['publicGetPriceIncrements'](params); }
    publicGetSummaries(params) { return this['publicGetSummaries'](params); }
    publicGetTickerAll(params) { return this['publicGetTickerAll'](params); }
    publicGetPairTicker(params) { return this['publicGetPairTicker'](params); }
    publicGetPairTrades(params) { return this['publicGetPairTrades'](params); }
    publicGetPairDepth(params) { return this['publicGetPairDepth'](params); }
    privatePostGetInfo(params) { return this['privatePostGetInfo'](params); }
    privatePostTransHistory(params) { return this['privatePostTransHistory'](params); }
    privatePostTrade(params) { return this['privatePostTrade'](params); }
    privatePostTradeHistory(params) { return this['privatePostTradeHistory'](params); }
    privatePostOpenOrders(params) { return this['privatePostOpenOrders'](params); }
    privatePostOrderHistory(params) { return this['privatePostOrderHistory'](params); }
    privatePostGetOrder(params) { return this['privatePostGetOrder'](params); }
    privatePostCancelOrder(params) { return this['privatePostCancelOrder'](params); }
    privatePostWithdrawFee(params) { return this['privatePostWithdrawFee'](params); }
    privatePostWithdrawCoin(params) { return this['privatePostWithdrawCoin'](params); }
    privatePostListDownline(params) { return this['privatePostListDownline'](params); }
    privatePostCheckDownline(params) { return this['privatePostCheckDownline'](params); }
    privatePostCreateVoucher(params) { return this['privatePostCreateVoucher'](params); }
}

module.exports = Exchange;
