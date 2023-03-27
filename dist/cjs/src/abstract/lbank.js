'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetCurrencyPairs(params) { return this['publicGetCurrencyPairs'](params); }
    publicGetTicker(params) { return this['publicGetTicker'](params); }
    publicGetDepth(params) { return this['publicGetDepth'](params); }
    publicGetTrades(params) { return this['publicGetTrades'](params); }
    publicGetKline(params) { return this['publicGetKline'](params); }
    publicGetAccuracy(params) { return this['publicGetAccuracy'](params); }
    privatePostUserInfo(params) { return this['privatePostUserInfo'](params); }
    privatePostCreateOrder(params) { return this['privatePostCreateOrder'](params); }
    privatePostCancelOrder(params) { return this['privatePostCancelOrder'](params); }
    privatePostOrdersInfo(params) { return this['privatePostOrdersInfo'](params); }
    privatePostOrdersInfoHistory(params) { return this['privatePostOrdersInfoHistory'](params); }
    privatePostWithdraw(params) { return this['privatePostWithdraw'](params); }
    privatePostWithdrawCancel(params) { return this['privatePostWithdrawCancel'](params); }
    privatePostWithdraws(params) { return this['privatePostWithdraws'](params); }
    privatePostWithdrawConfigs(params) { return this['privatePostWithdrawConfigs'](params); }
}

module.exports = Exchange;
