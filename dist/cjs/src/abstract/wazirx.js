'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetExchangeInfo(params) { return this['publicGetExchangeInfo'](params); }
    publicGetDepth(params) { return this['publicGetDepth'](params); }
    publicGetPing(params) { return this['publicGetPing'](params); }
    publicGetSystemStatus(params) { return this['publicGetSystemStatus'](params); }
    publicGetTickers24hr(params) { return this['publicGetTickers24hr'](params); }
    publicGetTicker24hr(params) { return this['publicGetTicker24hr'](params); }
    publicGetTime(params) { return this['publicGetTime'](params); }
    publicGetTrades(params) { return this['publicGetTrades'](params); }
    publicGetKlines(params) { return this['publicGetKlines'](params); }
    privateGetAccount(params) { return this['privateGetAccount'](params); }
    privateGetAllOrders(params) { return this['privateGetAllOrders'](params); }
    privateGetFunds(params) { return this['privateGetFunds'](params); }
    privateGetHistoricalTrades(params) { return this['privateGetHistoricalTrades'](params); }
    privateGetOpenOrders(params) { return this['privateGetOpenOrders'](params); }
    privateGetOrder(params) { return this['privateGetOrder'](params); }
    privateGetMyTrades(params) { return this['privateGetMyTrades'](params); }
    privatePostOrder(params) { return this['privatePostOrder'](params); }
    privatePostOrderTest(params) { return this['privatePostOrderTest'](params); }
    privatePostCreateAuthToken(params) { return this['privatePostCreateAuthToken'](params); }
    privateDeleteOrder(params) { return this['privateDeleteOrder'](params); }
    privateDeleteOpenOrders(params) { return this['privateDeleteOpenOrders'](params); }
}

module.exports = Exchange;
