'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetDepthPair(params) { return this['publicGetDepthPair'](params); }
    publicGetInfo(params) { return this['publicGetInfo'](params); }
    publicGetTickerPair(params) { return this['publicGetTickerPair'](params); }
    publicGetTradesPair(params) { return this['publicGetTradesPair'](params); }
    privatePostActiveOrders(params) { return this['privatePostActiveOrders'](params); }
    privatePostCancelOrder(params) { return this['privatePostCancelOrder'](params); }
    privatePostGetDepositAddress(params) { return this['privatePostGetDepositAddress'](params); }
    privatePostGetInfo(params) { return this['privatePostGetInfo'](params); }
    privatePostOrderInfo(params) { return this['privatePostOrderInfo'](params); }
    privatePostTrade(params) { return this['privatePostTrade'](params); }
    privatePostTradeHistory(params) { return this['privatePostTradeHistory'](params); }
    privatePostWithdrawCoinsToAddress(params) { return this['privatePostWithdrawCoinsToAddress'](params); }
}

module.exports = Exchange;
