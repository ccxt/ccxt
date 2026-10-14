'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetGetValidPrimaryCurrencyCodes(params = {}) {
        return this.request("GetValidPrimaryCurrencyCodes", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetValidSecondaryCurrencyCodes(params = {}) {
        return this.request("GetValidSecondaryCurrencyCodes", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetValidLimitOrderTypes(params = {}) {
        return this.request("GetValidLimitOrderTypes", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetValidMarketOrderTypes(params = {}) {
        return this.request("GetValidMarketOrderTypes", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetValidOrderTypes(params = {}) {
        return this.request("GetValidOrderTypes", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetValidTransactionTypes(params = {}) {
        return this.request("GetValidTransactionTypes", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetMarketSummary(params = {}) {
        return this.request("GetMarketSummary", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetOrderBook(params = {}) {
        return this.request("GetOrderBook", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetAllOrders(params = {}) {
        return this.request("GetAllOrders", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetTradeHistorySummary(params = {}) {
        return this.request("GetTradeHistorySummary", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetRecentTrades(params = {}) {
        return this.request("GetRecentTrades", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetFxRates(params = {}) {
        return this.request("GetFxRates", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetOrderMinimumVolumes(params = {}) {
        return this.request("GetOrderMinimumVolumes", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetDepositFees(params = {}) {
        return this.request("GetDepositFees", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetFiatWithdrawalFees(params = {}) {
        return this.request("GetFiatWithdrawalFees", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetCryptoWithdrawalFees(params = {}) {
        return this.request("GetCryptoWithdrawalFees", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetCryptoWithdrawalFees2(params = {}) {
        return this.request("GetCryptoWithdrawalFees2", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetNetworks(params = {}) {
        return this.request("GetNetworks", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    publicGetGetPrimaryCurrencyConfig2(params = {}) {
        return this.request("GetPrimaryCurrencyConfig2", "public", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetOpenOrders(params = {}) {
        return this.request("GetOpenOrders", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetClosedOrders(params = {}) {
        return this.request("GetClosedOrders", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetClosedFilledOrders(params = {}) {
        return this.request("GetClosedFilledOrders", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetOrderDetails(params = {}) {
        return this.request("GetOrderDetails", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetAccounts(params = {}) {
        return this.request("GetAccounts", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetTransactions(params = {}) {
        return this.request("GetTransactions", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetFiatBankAccounts(params = {}) {
        return this.request("GetFiatBankAccounts", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetDigitalCurrencyDepositAddress(params = {}) {
        return this.request("GetDigitalCurrencyDepositAddress", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetDigitalCurrencyDepositAddress2(params = {}) {
        return this.request("GetDigitalCurrencyDepositAddress2", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetDigitalCurrencyDepositAddresses(params = {}) {
        return this.request("GetDigitalCurrencyDepositAddresses", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetDigitalCurrencyDepositAddresses2(params = {}) {
        return this.request("GetDigitalCurrencyDepositAddresses2", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetTrades(params = {}) {
        return this.request("GetTrades", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetTradesByOrder(params = {}) {
        return this.request("GetTradesByOrder", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetBrokerageFees(params = {}) {
        return this.request("GetBrokerageFees", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetDigitalCurrencyWithdrawal(params = {}) {
        return this.request("GetDigitalCurrencyWithdrawal", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetFiatWithdrawal(params = {}) {
        return this.request("GetFiatWithdrawal", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetDepositLimits(params = {}) {
        return this.request("GetDepositLimits", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostGetWithdrawalLimits(params = {}) {
        return this.request("GetWithdrawalLimits", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostPlaceLimitOrder(params = {}) {
        return this.request("PlaceLimitOrder", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostPlaceMarketOrder(params = {}) {
        return this.request("PlaceMarketOrder", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancelOrder(params = {}) {
        return this.request("CancelOrder", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostCancelOrders(params = {}) {
        return this.request("CancelOrders", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostSynchDigitalCurrencyDepositAddressWithBlockchain(params = {}) {
        return this.request("SynchDigitalCurrencyDepositAddressWithBlockchain", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostRequestFiatWithdrawal(params = {}) {
        return this.request("RequestFiatWithdrawal", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostWithdrawFiatCurrency(params = {}) {
        return this.request("WithdrawFiatCurrency", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostWithdrawDigitalCurrency(params = {}) {
        return this.request("WithdrawDigitalCurrency", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
    privatePostWithdrawCrypto(params = {}) {
        return this.request("WithdrawCrypto", "private", 'POST', params, undefined, undefined, { "cost": 1 });
    }
}

exports["default"] = Exchange;
