'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetMarkets(params) { return this['publicGetMarkets'](params); }
    publicGetTickersPair(params) { return this['publicGetTickersPair'](params); }
    publicGetTickersMulti(params) { return this['publicGetTickersMulti'](params); }
    publicGetOrderBook(params) { return this['publicGetOrderBook'](params); }
    publicGetOrderBookMulti(params) { return this['publicGetOrderBookMulti'](params); }
    publicGetFeesTrading(params) { return this['publicGetFeesTrading'](params); }
    publicGetTrades(params) { return this['publicGetTrades'](params); }
    publicGetTimestamp(params) { return this['publicGetTimestamp'](params); }
    publicPostK(params) { return this['publicPostK'](params); }
    privateGetKey(params) { return this['privateGetKey'](params); }
    privateGetMembersMe(params) { return this['privateGetMembersMe'](params); }
    privateGetOrders(params) { return this['privateGetOrders'](params); }
    privateGetOrdersFilter(params) { return this['privateGetOrdersFilter'](params); }
    privatePostOrders(params) { return this['privatePostOrders'](params); }
    privatePostOrdersMulti(params) { return this['privatePostOrdersMulti'](params); }
    privatePostOrderDelete(params) { return this['privatePostOrderDelete'](params); }
    privatePostOrderDeleteMulti(params) { return this['privatePostOrderDeleteMulti'](params); }
    privatePostOrdersClear(params) { return this['privatePostOrdersClear'](params); }
}

module.exports = Exchange;
