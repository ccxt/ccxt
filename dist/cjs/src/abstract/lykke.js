'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetAssetpairs(params) { return this['publicGetAssetpairs'](params); }
    publicGetAssetpairsId(params) { return this['publicGetAssetpairsId'](params); }
    publicGetAssets(params) { return this['publicGetAssets'](params); }
    publicGetAssetsId(params) { return this['publicGetAssetsId'](params); }
    publicGetIsalive(params) { return this['publicGetIsalive'](params); }
    publicGetOrderbooks(params) { return this['publicGetOrderbooks'](params); }
    publicGetTickers(params) { return this['publicGetTickers'](params); }
    publicGetPrices(params) { return this['publicGetPrices'](params); }
    publicGetTradesPublicAssetPairId(params) { return this['publicGetTradesPublicAssetPairId'](params); }
    privateGetBalance(params) { return this['privateGetBalance'](params); }
    privateGetTrades(params) { return this['privateGetTrades'](params); }
    privateGetTradesOrderOrderId(params) { return this['privateGetTradesOrderOrderId'](params); }
    privateGetOrdersActive(params) { return this['privateGetOrdersActive'](params); }
    privateGetOrdersClosed(params) { return this['privateGetOrdersClosed'](params); }
    privateGetOrdersOrderId(params) { return this['privateGetOrdersOrderId'](params); }
    privateGetOperations(params) { return this['privateGetOperations'](params); }
    privateGetOperationsDepositsAddresses(params) { return this['privateGetOperationsDepositsAddresses'](params); }
    privateGetOperationsDepositsAddressesAssetId(params) { return this['privateGetOperationsDepositsAddressesAssetId'](params); }
    privatePostOrdersLimit(params) { return this['privatePostOrdersLimit'](params); }
    privatePostOrdersMarket(params) { return this['privatePostOrdersMarket'](params); }
    privatePostOrdersBulk(params) { return this['privatePostOrdersBulk'](params); }
    privatePostOperationsWithdrawals(params) { return this['privatePostOperationsWithdrawals'](params); }
    privatePostOperationsDepositsAddresses(params) { return this['privatePostOperationsDepositsAddresses'](params); }
    privateDeleteOrders(params) { return this['privateDeleteOrders'](params); }
    privateDeleteOrdersOrderId(params) { return this['privateDeleteOrdersOrderId'](params); }
}

module.exports = Exchange;
