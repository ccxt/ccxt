'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetCountries(params) { return this['publicGetCountries'](params); }
    publicGetDataCurrencyTicker(params) { return this['publicGetDataCurrencyTicker'](params); }
    publicGetDataCurrencyTrades(params) { return this['publicGetDataCurrencyTrades'](params); }
    publicGetDataCurrencyDepth(params) { return this['publicGetDataCurrencyDepth'](params); }
    publicGetBitcoinChartsIdTrades(params) { return this['publicGetBitcoinChartsIdTrades'](params); }
    publicGetBitcoinChartsIdDepth(params) { return this['publicGetBitcoinChartsIdDepth'](params); }
    privateGetUser(params) { return this['privateGetUser'](params); }
    privateGetUserAddresses(params) { return this['privateGetUserAddresses'](params); }
    privateGetUserAddressesAddress(params) { return this['privateGetUserAddressesAddress'](params); }
    privateGetUserOrders(params) { return this['privateGetUserOrders'](params); }
    privateGetUserOrdersUuid(params) { return this['privateGetUserOrdersUuid'](params); }
    privateGetUserPriceAlerts(params) { return this['privateGetUserPriceAlerts'](params); }
    privateGetMerchantGetPaymentUuid(params) { return this['privateGetMerchantGetPaymentUuid'](params); }
    privatePostUserAddresses(params) { return this['privatePostUserAddresses'](params); }
    privatePostUserOrders(params) { return this['privatePostUserOrders'](params); }
    privatePostUserWithdrawals(params) { return this['privatePostUserWithdrawals'](params); }
    privatePostUserEmailTransfers(params) { return this['privatePostUserEmailTransfers'](params); }
    privatePostUserPaymentRequests(params) { return this['privatePostUserPaymentRequests'](params); }
    privatePostUserPriceAlerts(params) { return this['privatePostUserPriceAlerts'](params); }
    privatePostMerchantCreatePayment(params) { return this['privatePostMerchantCreatePayment'](params); }
    privateDeleteUserOrdersUuid(params) { return this['privateDeleteUserOrdersUuid'](params); }
    privateDeleteUserOrdersUuidCancel(params) { return this['privateDeleteUserOrdersUuidCancel'](params); }
    privateDeleteUserPriceAlertsId(params) { return this['privateDeleteUserPriceAlertsId'](params); }
}

module.exports = Exchange;
