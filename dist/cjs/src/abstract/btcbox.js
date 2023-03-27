'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetDepth(params) { return this['publicGetDepth'](params); }
    publicGetOrders(params) { return this['publicGetOrders'](params); }
    publicGetTicker(params) { return this['publicGetTicker'](params); }
    privatePostBalance(params) { return this['privatePostBalance'](params); }
    privatePostTradeAdd(params) { return this['privatePostTradeAdd'](params); }
    privatePostTradeCancel(params) { return this['privatePostTradeCancel'](params); }
    privatePostTradeList(params) { return this['privatePostTradeList'](params); }
    privatePostTradeView(params) { return this['privatePostTradeView'](params); }
    privatePostWallet(params) { return this['privatePostWallet'](params); }
}

module.exports = Exchange;
