'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetBookCurrencyQuote(params) { return this['publicGetBookCurrencyQuote'](params); }
    publicGetChartWeek(params) { return this['publicGetChartWeek'](params); }
    publicGetChartWeekCurrencyQuote(params) { return this['publicGetChartWeekCurrencyQuote'](params); }
    publicGetCurrency(params) { return this['publicGetCurrency'](params); }
    publicGetCurrencyAvailable(params) { return this['publicGetCurrencyAvailable'](params); }
    publicGetCurrencyQuotes(params) { return this['publicGetCurrencyQuotes'](params); }
    publicGetCurrencyCurrency(params) { return this['publicGetCurrencyCurrency'](params); }
    publicGetPair(params) { return this['publicGetPair'](params); }
    publicGetPairAvailable(params) { return this['publicGetPairAvailable'](params); }
    publicGetTicker(params) { return this['publicGetTicker'](params); }
    publicGetTickerBaseQuote(params) { return this['publicGetTickerBaseQuote'](params); }
    publicGetTime(params) { return this['publicGetTime'](params); }
    publicGetTradeHistoryCurrencyQuote(params) { return this['publicGetTradeHistoryCurrencyQuote'](params); }
    publicGetTradeFeeCurrencyQuote(params) { return this['publicGetTradeFeeCurrencyQuote'](params); }
    publicGetTradeFeeLevels(params) { return this['publicGetTradeFeeLevels'](params); }
    publicGetTransactionBindings(params) { return this['publicGetTransactionBindings'](params); }
    privateGetAuthAccount(params) { return this['privateGetAuthAccount'](params); }
    privateGetAuthAccountCurrencyCurrencyType(params) { return this['privateGetAuthAccountCurrencyCurrencyType'](params); }
    privateGetAuthOrder(params) { return this['privateGetAuthOrder'](params); }
    privateGetAuthOrderGetOrderId(params) { return this['privateGetAuthOrderGetOrderId'](params); }
    privateGetAuthOrderPairCurrencyQuote(params) { return this['privateGetAuthOrderPairCurrencyQuote'](params); }
    privateGetAuthOrderPairCurrencyQuoteActive(params) { return this['privateGetAuthOrderPairCurrencyQuoteActive'](params); }
    privateGetAuthStopOrder(params) { return this['privateGetAuthStopOrder'](params); }
    privateGetAuthStopOrderGetOrderId(params) { return this['privateGetAuthStopOrderGetOrderId'](params); }
    privateGetAuthStopOrderPairCurrencyQuote(params) { return this['privateGetAuthStopOrderPairCurrencyQuote'](params); }
    privateGetAuthStopOrderPairCurrencyQuoteActive(params) { return this['privateGetAuthStopOrderPairCurrencyQuoteActive'](params); }
    privateGetAuthTrade(params) { return this['privateGetAuthTrade'](params); }
    privateGetAuthTradePairCurrencyQuote(params) { return this['privateGetAuthTradePairCurrencyQuote'](params); }
    privateGetAuthTradeFeeCurrencyQuote(params) { return this['privateGetAuthTradeFeeCurrencyQuote'](params); }
    privateGetAuthTransaction(params) { return this['privateGetAuthTransaction'](params); }
    privateGetAuthTransactionBindings(params) { return this['privateGetAuthTransactionBindings'](params); }
    privateGetAuthTransactionBindingsCurrency(params) { return this['privateGetAuthTransactionBindingsCurrency'](params); }
    privateGetAuthTransactionId(params) { return this['privateGetAuthTransactionId'](params); }
    privateGetAuthTransfer(params) { return this['privateGetAuthTransfer'](params); }
    privatePostAuthOrderCancel(params) { return this['privatePostAuthOrderCancel'](params); }
    privatePostAuthOrderCancelAll(params) { return this['privatePostAuthOrderCancelAll'](params); }
    privatePostAuthOrderCancelAllCurrencyQuote(params) { return this['privatePostAuthOrderCancelAllCurrencyQuote'](params); }
    privatePostAuthOrderPlace(params) { return this['privatePostAuthOrderPlace'](params); }
    privatePostAuthSpotDeposit(params) { return this['privatePostAuthSpotDeposit'](params); }
    privatePostAuthSpotWithdraw(params) { return this['privatePostAuthSpotWithdraw'](params); }
    privatePostAuthStopOrderCancel(params) { return this['privatePostAuthStopOrderCancel'](params); }
    privatePostAuthStopOrderCancelAll(params) { return this['privatePostAuthStopOrderCancelAll'](params); }
    privatePostAuthStopOrderCancelAllCurrencyQuote(params) { return this['privatePostAuthStopOrderCancelAllCurrencyQuote'](params); }
    privatePostAuthStopOrderPlace(params) { return this['privatePostAuthStopOrderPlace'](params); }
    privatePostAuthTransactionDepositAddress(params) { return this['privatePostAuthTransactionDepositAddress'](params); }
    privatePostAuthTransactionWithdraw(params) { return this['privatePostAuthTransactionWithdraw'](params); }
    privatePostAuthTransactionWithdrawCancel(params) { return this['privatePostAuthTransactionWithdrawCancel'](params); }
    privatePostAuthTransactionWithdrawConfirm(params) { return this['privatePostAuthTransactionWithdrawConfirm'](params); }
    privatePostAuthTransactionWithdrawResendCode(params) { return this['privatePostAuthTransactionWithdrawResendCode'](params); }
    privatePostAuthTransferEmail(params) { return this['privatePostAuthTransferEmail'](params); }
    privatePostAuthTransferId(params) { return this['privatePostAuthTransferId'](params); }
    privatePostAuthTransferPhone(params) { return this['privatePostAuthTransferPhone'](params); }
}

module.exports = Exchange;
