'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    marketsGetAssetsPublicBeta(params) { return this['marketsGetAssetsPublicBeta'](params); }
    privateGetAccount(params) { return this['privateGetAccount'](params); }
    privateGetOrders(params) { return this['privateGetOrders'](params); }
    privateGetOrdersOrderId(params) { return this['privateGetOrdersOrderId'](params); }
    privateGetPositions(params) { return this['privateGetPositions'](params); }
    privateGetPositionsSymbol(params) { return this['privateGetPositionsSymbol'](params); }
    privateGetAccountActivitiesActivityType(params) { return this['privateGetAccountActivitiesActivityType'](params); }
    privatePostOrders(params) { return this['privatePostOrders'](params); }
    privateDeleteOrders(params) { return this['privateDeleteOrders'](params); }
    privateDeleteOrdersOrderId(params) { return this['privateDeleteOrdersOrderId'](params); }
    cryptoPublicGetCryptoLatestOrderbooks(params) { return this['cryptoPublicGetCryptoLatestOrderbooks'](params); }
    cryptoPublicGetCryptoTrades(params) { return this['cryptoPublicGetCryptoTrades'](params); }
    cryptoPublicGetCryptoQuotes(params) { return this['cryptoPublicGetCryptoQuotes'](params); }
    cryptoPublicGetCryptoLatestQuotes(params) { return this['cryptoPublicGetCryptoLatestQuotes'](params); }
    cryptoPublicGetCryptoBars(params) { return this['cryptoPublicGetCryptoBars'](params); }
    cryptoPublicGetCryptoSnapshots(params) { return this['cryptoPublicGetCryptoSnapshots'](params); }
}

module.exports = Exchange;
