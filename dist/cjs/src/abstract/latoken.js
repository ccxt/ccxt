'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetBookCurrencyQuote(params = {}) {
        return this.request('book/{currency}/{quote}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetChartWeek(params = {}) {
        return this.request('chart/week', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetChartWeekCurrencyQuote(params = {}) {
        return this.request('chart/week/{currency}/{quote}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetCurrency(params = {}) {
        return this.request('currency', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetCurrencyAvailable(params = {}) {
        return this.request('currency/available', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetCurrencyQuotes(params = {}) {
        return this.request('currency/quotes', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetCurrencyCurrency(params = {}) {
        return this.request('currency/{currency}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPair(params = {}) {
        return this.request('pair', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPairAvailable(params = {}) {
        return this.request('pair/available', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTicker(params = {}) {
        return this.request('ticker', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTickerBaseQuote(params = {}) {
        return this.request('ticker/{base}/{quote}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTime(params = {}) {
        return this.request('time', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTradeHistoryCurrencyQuote(params = {}) {
        return this.request('trade/history/{currency}/{quote}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTradeFeeCurrencyQuote(params = {}) {
        return this.request('trade/fee/{currency}/{quote}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTradeFeeLevels(params = {}) {
        return this.request('trade/feeLevels', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetTransactionBindings(params = {}) {
        return this.request('transaction/bindings', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthAccount(params = {}) {
        return this.request('auth/account', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthAccountCurrencyCurrencyType(params = {}) {
        return this.request('auth/account/currency/{currency}/{type}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthAccountFiltered(params = {}) {
        return this.request('auth/account/filtered', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthOrder(params = {}) {
        return this.request('auth/order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthOrderActive(params = {}) {
        return this.request('auth/order/active', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthOrderGetOrderId(params = {}) {
        return this.request('auth/order/getOrder/{id}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthOrderPairCurrencyQuote(params = {}) {
        return this.request('auth/order/pair/{currency}/{quote}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthOrderPairCurrencyQuoteActive(params = {}) {
        return this.request('auth/order/pair/{currency}/{quote}/active', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthStopOrder(params = {}) {
        return this.request('auth/stopOrder', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthStopOrderGetOrderId(params = {}) {
        return this.request('auth/stopOrder/getOrder/{id}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthStopOrderPairCurrencyQuote(params = {}) {
        return this.request('auth/stopOrder/pair/{currency}/{quote}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthStopOrderPairCurrencyQuoteActive(params = {}) {
        return this.request('auth/stopOrder/pair/{currency}/{quote}/active', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthTrade(params = {}) {
        return this.request('auth/trade', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthTradePairCurrencyQuote(params = {}) {
        return this.request('auth/trade/pair/{currency}/{quote}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthTradeFeeCurrencyQuote(params = {}) {
        return this.request('auth/trade/fee/{currency}/{quote}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthTransaction(params = {}) {
        return this.request('auth/transaction', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthTransactionBindings(params = {}) {
        return this.request('auth/transaction/bindings', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthTransactionBindingsCurrency(params = {}) {
        return this.request('auth/transaction/bindings/{currency}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthTransactionId(params = {}) {
        return this.request('auth/transaction/{id}', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAuthTransfer(params = {}) {
        return this.request('auth/transfer', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthOrderCancel(params = {}) {
        return this.request('auth/order/cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthOrderCancelAll(params = {}) {
        return this.request('auth/order/cancelAll', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthOrderCancelAllCurrencyQuote(params = {}) {
        return this.request('auth/order/cancelAll/{currency}/{quote}', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthOrderCancelBulk(params = {}) {
        return this.request('auth/order/cancelBulk', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthOrderPlace(params = {}) {
        return this.request('auth/order/place', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthOrderPlaceBulk(params = {}) {
        return this.request('auth/order/placeBulk', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthSpotDeposit(params = {}) {
        return this.request('auth/spot/deposit', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthSpotWithdraw(params = {}) {
        return this.request('auth/spot/withdraw', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthStopOrderCancel(params = {}) {
        return this.request('auth/stopOrder/cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthStopOrderCancelAll(params = {}) {
        return this.request('auth/stopOrder/cancelAll', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthStopOrderCancelAllCurrencyQuote(params = {}) {
        return this.request('auth/stopOrder/cancelAll/{currency}/{quote}', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthStopOrderPlace(params = {}) {
        return this.request('auth/stopOrder/place', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthTransactionDepositAddress(params = {}) {
        return this.request('auth/transaction/depositAddress', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthTransactionWithdraw(params = {}) {
        return this.request('auth/transaction/withdraw', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthTransactionWithdrawCancel(params = {}) {
        return this.request('auth/transaction/withdraw/cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthTransactionWithdrawConfirm(params = {}) {
        return this.request('auth/transaction/withdraw/confirm', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthTransactionWithdrawResendCode(params = {}) {
        return this.request('auth/transaction/withdraw/resendCode', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthTransferEmail(params = {}) {
        return this.request('auth/transfer/email', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthTransferId(params = {}) {
        return this.request('auth/transfer/id', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAuthTransferPhone(params = {}) {
        return this.request('auth/transfer/phone', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
