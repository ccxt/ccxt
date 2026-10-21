'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetCountries(params = {}) {
        return this.request('countries', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetCurrencies(params = {}) {
        return this.request('currencies', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetDataCurrencyTicker(params = {}) {
        return this.request('data/{currency}/ticker', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetDataCurrencyTrades(params = {}) {
        return this.request('data/{currency}/trades', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetDataCurrencyDepth(params = {}) {
        return this.request('data/{currency}/depth', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetBitcoinChartsIdTrades(params = {}) {
        return this.request('bitcoin_charts/{id}/trades', ['public'], 'GET', params, { 'cost': 1 });
    }
    publicGetBitcoinChartsIdDepth(params = {}) {
        return this.request('bitcoin_charts/{id}/depth', ['public'], 'GET', params, { 'cost': 1 });
    }
    privateGetUser(params = {}) {
        return this.request('user', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetUserAddresses(params = {}) {
        return this.request('user/addresses', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetUserAddressesAddress(params = {}) {
        return this.request('user/addresses/{address}', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetUserOrders(params = {}) {
        return this.request('user/orders', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetUserOrdersUuid(params = {}) {
        return this.request('user/orders/{uuid}', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetUserPriceAlerts(params = {}) {
        return this.request('user/price_alerts', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetUserWithdrawals(params = {}) {
        return this.request('user/withdrawals', ['private'], 'GET', params, { 'cost': 1 });
    }
    privateGetMerchantGetPaymentUuid(params = {}) {
        return this.request('merchant/get_payment/{uuid}', ['private'], 'GET', params, { 'cost': 1 });
    }
    privatePostUserAddresses(params = {}) {
        return this.request('user/addresses', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostUserOrders(params = {}) {
        return this.request('user/orders', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostUserWithdrawals(params = {}) {
        return this.request('user/withdrawals', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostUserEmailTransfers(params = {}) {
        return this.request('user/email_transfers', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostUserPaymentRequests(params = {}) {
        return this.request('user/payment_requests', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostUserPriceAlerts(params = {}) {
        return this.request('user/price_alerts', ['private'], 'POST', params, { 'cost': 1 });
    }
    privatePostMerchantCreatePayment(params = {}) {
        return this.request('merchant/create_payment', ['private'], 'POST', params, { 'cost': 1 });
    }
    privateDeleteUserOrdersUuid(params = {}) {
        return this.request('user/orders/{uuid}', ['private'], 'DELETE', params, { 'cost': 1 });
    }
    privateDeleteUserOrdersUuidCancel(params = {}) {
        return this.request('user/orders/{uuid}/cancel', ['private'], 'DELETE', params, { 'cost': 1 });
    }
    privateDeleteUserPriceAlertsId(params = {}) {
        return this.request('user/price_alerts/{id}', ['private'], 'DELETE', params, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
