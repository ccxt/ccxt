'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetCommonSymbol(params) { return this['publicGetCommonSymbol'](params); }
    publicGetCommonSymbols(params) { return this['publicGetCommonSymbols'](params); }
    publicGetCommonTimestamp(params) { return this['publicGetCommonTimestamp'](params); }
    publicGetMarketTickers(params) { return this['publicGetMarketTickers'](params); }
    publicGetMarketTicker(params) { return this['publicGetMarketTicker'](params); }
    publicGetMarketDepth(params) { return this['publicGetMarketDepth'](params); }
    publicGetMarketTrades(params) { return this['publicGetMarketTrades'](params); }
    publicGetMarketKlineHistory(params) { return this['publicGetMarketKlineHistory'](params); }
    privateGetOrdersGet(params) { return this['privateGetOrdersGet'](params); }
    privateGetOrdersList(params) { return this['privateGetOrdersList'](params); }
    privateGetOrdersFill(params) { return this['privateGetOrdersFill'](params); }
    privateGetOrdersFills(params) { return this['privateGetOrdersFills'](params); }
    privateGetAccountGetBalance(params) { return this['privateGetAccountGetBalance'](params); }
    privateGetAccountSubs(params) { return this['privateGetAccountSubs'](params); }
    privateGetAccountSubsBalance(params) { return this['privateGetAccountSubsBalance'](params); }
    privateGetAccountSubsTransferRecord(params) { return this['privateGetAccountSubsTransferRecord'](params); }
    privateGetWalletQueryDepositWithdraw(params) { return this['privateGetWalletQueryDepositWithdraw'](params); }
    privatePostOrdersCreate(params) { return this['privatePostOrdersCreate'](params); }
    privatePostOrdersCancel(params) { return this['privatePostOrdersCancel'](params); }
    privatePostAccountWithdrawCoin(params) { return this['privatePostAccountWithdrawCoin'](params); }
    privatePostAccountSubsTransfer(params) { return this['privatePostAccountSubsTransfer'](params); }
}

module.exports = Exchange;
