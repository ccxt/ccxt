'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetPing(params) { return this['publicGetPing'](params); }
    publicGetAssetPairs(params) { return this['publicGetAssetPairs'](params); }
    publicGetAssetPairsAssetPairNameDepth(params) { return this['publicGetAssetPairsAssetPairNameDepth'](params); }
    publicGetAssetPairsAssetPairNameTrades(params) { return this['publicGetAssetPairsAssetPairNameTrades'](params); }
    publicGetAssetPairsAssetPairNameTicker(params) { return this['publicGetAssetPairsAssetPairNameTicker'](params); }
    publicGetAssetPairsAssetPairNameCandles(params) { return this['publicGetAssetPairsAssetPairNameCandles'](params); }
    publicGetAssetPairsTickers(params) { return this['publicGetAssetPairsTickers'](params); }
    privateGetAccounts(params) { return this['privateGetAccounts'](params); }
    privateGetFundAccounts(params) { return this['privateGetFundAccounts'](params); }
    privateGetAssetsAssetSymbolAddress(params) { return this['privateGetAssetsAssetSymbolAddress'](params); }
    privateGetOrders(params) { return this['privateGetOrders'](params); }
    privateGetOrdersId(params) { return this['privateGetOrdersId'](params); }
    privateGetOrdersMulti(params) { return this['privateGetOrdersMulti'](params); }
    privateGetTrades(params) { return this['privateGetTrades'](params); }
    privateGetWithdrawals(params) { return this['privateGetWithdrawals'](params); }
    privateGetDeposits(params) { return this['privateGetDeposits'](params); }
    privatePostOrders(params) { return this['privatePostOrders'](params); }
    privatePostOrdersIdCancel(params) { return this['privatePostOrdersIdCancel'](params); }
    privatePostOrdersCancel(params) { return this['privatePostOrdersCancel'](params); }
    privatePostWithdrawals(params) { return this['privatePostWithdrawals'](params); }
    privatePostTransfer(params) { return this['privatePostTransfer'](params); }
}

module.exports = Exchange;
