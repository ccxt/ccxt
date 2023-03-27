'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetOrderbook(params) { return this['publicGetOrderbook'](params); }
    publicGetTicker(params) { return this['publicGetTicker'](params); }
    publicGetTrades(params) { return this['publicGetTrades'](params); }
    publicGetServerExchangeinfo(params) { return this['publicGetServerExchangeinfo'](params); }
    privateGetUsersBalances(params) { return this['privateGetUsersBalances'](params); }
    privateGetOpenOrders(params) { return this['privateGetOpenOrders'](params); }
    privateGetAllOrders(params) { return this['privateGetAllOrders'](params); }
    privateGetUsersTransactionsTrade(params) { return this['privateGetUsersTransactionsTrade'](params); }
    privatePostOrder(params) { return this['privatePostOrder'](params); }
    privatePostCancelOrder(params) { return this['privatePostCancelOrder'](params); }
    privateDeleteOrder(params) { return this['privateDeleteOrder'](params); }
    graphGetOhlcs(params) { return this['graphGetOhlcs'](params); }
    graphGetKlinesHistory(params) { return this['graphGetKlinesHistory'](params); }
}

module.exports = Exchange;
