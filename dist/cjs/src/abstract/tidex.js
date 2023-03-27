'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    webGetCurrency(params) { return this['webGetCurrency'](params); }
    webGetPairs(params) { return this['webGetPairs'](params); }
    webGetTickers(params) { return this['webGetTickers'](params); }
    webGetOrders(params) { return this['webGetOrders'](params); }
    webGetOrdershistory(params) { return this['webGetOrdershistory'](params); }
    webGetTradeData(params) { return this['webGetTradeData'](params); }
    webGetTradeDataId(params) { return this['webGetTradeDataId'](params); }
    publicGetInfo(params) { return this['publicGetInfo'](params); }
    publicGetTickerPair(params) { return this['publicGetTickerPair'](params); }
    publicGetDepthPair(params) { return this['publicGetDepthPair'](params); }
    publicGetTradesPair(params) { return this['publicGetTradesPair'](params); }
    privatePostGetInfoExt(params) { return this['privatePostGetInfoExt'](params); }
    privatePostGetInfo(params) { return this['privatePostGetInfo'](params); }
    privatePostTrade(params) { return this['privatePostTrade'](params); }
    privatePostActiveOrders(params) { return this['privatePostActiveOrders'](params); }
    privatePostOrderInfo(params) { return this['privatePostOrderInfo'](params); }
    privatePostCancelOrder(params) { return this['privatePostCancelOrder'](params); }
    privatePostTradeHistory(params) { return this['privatePostTradeHistory'](params); }
    privatePostGetDepositAddress(params) { return this['privatePostGetDepositAddress'](params); }
    privatePostCreateWithdraw(params) { return this['privatePostCreateWithdraw'](params); }
    privatePostGetWithdraw(params) { return this['privatePostGetWithdraw'](params); }
}

module.exports = Exchange;
