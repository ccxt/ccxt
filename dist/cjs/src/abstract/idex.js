'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetPing(params) { return this['publicGetPing'](params); }
    publicGetTime(params) { return this['publicGetTime'](params); }
    publicGetExchange(params) { return this['publicGetExchange'](params); }
    publicGetAssets(params) { return this['publicGetAssets'](params); }
    publicGetMarkets(params) { return this['publicGetMarkets'](params); }
    publicGetTickers(params) { return this['publicGetTickers'](params); }
    publicGetCandles(params) { return this['publicGetCandles'](params); }
    publicGetTrades(params) { return this['publicGetTrades'](params); }
    publicGetOrderbook(params) { return this['publicGetOrderbook'](params); }
    privateGetUser(params) { return this['privateGetUser'](params); }
    privateGetWallets(params) { return this['privateGetWallets'](params); }
    privateGetBalances(params) { return this['privateGetBalances'](params); }
    privateGetOrders(params) { return this['privateGetOrders'](params); }
    privateGetFills(params) { return this['privateGetFills'](params); }
    privateGetDeposits(params) { return this['privateGetDeposits'](params); }
    privateGetWithdrawals(params) { return this['privateGetWithdrawals'](params); }
    privateGetWsToken(params) { return this['privateGetWsToken'](params); }
    privatePostWallets(params) { return this['privatePostWallets'](params); }
    privatePostOrders(params) { return this['privatePostOrders'](params); }
    privatePostOrdersTest(params) { return this['privatePostOrdersTest'](params); }
    privatePostWithdrawals(params) { return this['privatePostWithdrawals'](params); }
    privateDeleteOrders(params) { return this['privateDeleteOrders'](params); }
}

module.exports = Exchange;
