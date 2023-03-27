'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetRateAll(params) { return this['publicGetRateAll'](params); }
    publicGetRatePair(params) { return this['publicGetRatePair'](params); }
    publicGetOrderbookPair(params) { return this['publicGetOrderbookPair'](params); }
    publicGetTradehistoryPair(params) { return this['publicGetTradehistoryPair'](params); }
    publicGetPair(params) { return this['publicGetPair'](params); }
    publicGetCurrency(params) { return this['publicGetCurrency'](params); }
    publicGetOrderbookPairDepth(params) { return this['publicGetOrderbookPairDepth'](params); }
    privateGetBalancesExchangeBalances(params) { return this['privateGetBalancesExchangeBalances'](params); }
    privateGetOrderPairOrderId(params) { return this['privateGetOrderPairOrderId'](params); }
    privateGetOrderPair(params) { return this['privateGetOrderPair'](params); }
    privateGetTradePair(params) { return this['privateGetTradePair'](params); }
    privatePostOrderPair(params) { return this['privatePostOrderPair'](params); }
    privatePostOrderPairOrderIdCancel(params) { return this['privatePostOrderPairOrderIdCancel'](params); }
}

module.exports = Exchange;
