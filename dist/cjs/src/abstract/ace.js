'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetOapiV2ListTradePrice(params) { return this['publicGetOapiV2ListTradePrice'](params); }
    publicGetOapiV2ListMarketPair(params) { return this['publicGetOapiV2ListMarketPair'](params); }
    publicGetOpenV2PublicGetOrderBook(params) { return this['publicGetOpenV2PublicGetOrderBook'](params); }
    privatePostV2CoinCustomerAccount(params) { return this['privatePostV2CoinCustomerAccount'](params); }
    privatePostV2KlineGetKline(params) { return this['privatePostV2KlineGetKline'](params); }
    privatePostV2OrderOrder(params) { return this['privatePostV2OrderOrder'](params); }
    privatePostV2OrderCancel(params) { return this['privatePostV2OrderCancel'](params); }
    privatePostV2OrderGetOrderList(params) { return this['privatePostV2OrderGetOrderList'](params); }
    privatePostV2OrderShowOrderStatus(params) { return this['privatePostV2OrderShowOrderStatus'](params); }
    privatePostV2OrderShowOrderHistory(params) { return this['privatePostV2OrderShowOrderHistory'](params); }
    privatePostV2OrderGetTradeList(params) { return this['privatePostV2OrderGetTradeList'](params); }
}

module.exports = Exchange;
