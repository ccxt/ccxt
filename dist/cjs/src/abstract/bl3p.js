'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetMarketTicker(params) { return this['publicGetMarketTicker'](params); }
    publicGetMarketOrderbook(params) { return this['publicGetMarketOrderbook'](params); }
    publicGetMarketTrades(params) { return this['publicGetMarketTrades'](params); }
    privatePostMarketMoneyDepthFull(params) { return this['privatePostMarketMoneyDepthFull'](params); }
    privatePostMarketMoneyOrderAdd(params) { return this['privatePostMarketMoneyOrderAdd'](params); }
    privatePostMarketMoneyOrderCancel(params) { return this['privatePostMarketMoneyOrderCancel'](params); }
    privatePostMarketMoneyOrderResult(params) { return this['privatePostMarketMoneyOrderResult'](params); }
    privatePostMarketMoneyOrders(params) { return this['privatePostMarketMoneyOrders'](params); }
    privatePostMarketMoneyOrdersHistory(params) { return this['privatePostMarketMoneyOrdersHistory'](params); }
    privatePostMarketMoneyTradesFetch(params) { return this['privatePostMarketMoneyTradesFetch'](params); }
    privatePostGENMKTMoneyInfo(params) { return this['privatePostGENMKTMoneyInfo'](params); }
    privatePostGENMKTMoneyDepositAddress(params) { return this['privatePostGENMKTMoneyDepositAddress'](params); }
    privatePostGENMKTMoneyNewDepositAddress(params) { return this['privatePostGENMKTMoneyNewDepositAddress'](params); }
    privatePostGENMKTMoneyWalletHistory(params) { return this['privatePostGENMKTMoneyWalletHistory'](params); }
    privatePostGENMKTMoneyWithdraw(params) { return this['privatePostGENMKTMoneyWithdraw'](params); }
}

module.exports = Exchange;
