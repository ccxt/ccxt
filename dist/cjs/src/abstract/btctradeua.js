'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetDealsSymbol(params) { return this['publicGetDealsSymbol'](params); }
    publicGetTradesSellSymbol(params) { return this['publicGetTradesSellSymbol'](params); }
    publicGetTradesBuySymbol(params) { return this['publicGetTradesBuySymbol'](params); }
    publicGetJapanStatHighSymbol(params) { return this['publicGetJapanStatHighSymbol'](params); }
    privatePostAuth(params) { return this['privatePostAuth'](params); }
    privatePostAskSymbol(params) { return this['privatePostAskSymbol'](params); }
    privatePostBalance(params) { return this['privatePostBalance'](params); }
    privatePostBidSymbol(params) { return this['privatePostBidSymbol'](params); }
    privatePostBuySymbol(params) { return this['privatePostBuySymbol'](params); }
    privatePostMyOrdersSymbol(params) { return this['privatePostMyOrdersSymbol'](params); }
    privatePostOrderStatusId(params) { return this['privatePostOrderStatusId'](params); }
    privatePostRemoveOrderId(params) { return this['privatePostRemoveOrderId'](params); }
    privatePostSellSymbol(params) { return this['privatePostSellSymbol'](params); }
}

module.exports = Exchange;
