'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetPing(params) { return this['publicGetPing'](params); }
    publicGetCurrencies(params) { return this['publicGetCurrencies'](params); }
    publicGetCurrenciesSymbol(params) { return this['publicGetCurrenciesSymbol'](params); }
    publicGetMarkets(params) { return this['publicGetMarkets'](params); }
    publicGetMarketsTickers(params) { return this['publicGetMarketsTickers'](params); }
    publicGetMarketsSummaries(params) { return this['publicGetMarketsSummaries'](params); }
    publicGetMarketsMarketSymbol(params) { return this['publicGetMarketsMarketSymbol'](params); }
    publicGetMarketsMarketSymbolSummary(params) { return this['publicGetMarketsMarketSymbolSummary'](params); }
    publicGetMarketsMarketSymbolOrderbook(params) { return this['publicGetMarketsMarketSymbolOrderbook'](params); }
    publicGetMarketsMarketSymbolTrades(params) { return this['publicGetMarketsMarketSymbolTrades'](params); }
    publicGetMarketsMarketSymbolTicker(params) { return this['publicGetMarketsMarketSymbolTicker'](params); }
    publicGetMarketsMarketSymbolCandlesCandleIntervalRecent(params) { return this['publicGetMarketsMarketSymbolCandlesCandleIntervalRecent'](params); }
    publicGetMarketsMarketSymbolCandlesCandleIntervalHistoricalYearMonthDay(params) { return this['publicGetMarketsMarketSymbolCandlesCandleIntervalHistoricalYearMonthDay'](params); }
    publicGetMarketsMarketSymbolCandlesCandleIntervalHistoricalYearMonth(params) { return this['publicGetMarketsMarketSymbolCandlesCandleIntervalHistoricalYearMonth'](params); }
    publicGetMarketsMarketSymbolCandlesCandleIntervalHistoricalYear(params) { return this['publicGetMarketsMarketSymbolCandlesCandleIntervalHistoricalYear'](params); }
    privateGetAccount(params) { return this['privateGetAccount'](params); }
    privateGetAccountFeesFiat(params) { return this['privateGetAccountFeesFiat'](params); }
    privateGetAccountFeesFiatCurrencySymbol(params) { return this['privateGetAccountFeesFiatCurrencySymbol'](params); }
    privateGetAccountFeesTrading(params) { return this['privateGetAccountFeesTrading'](params); }
    privateGetAccountFeesTradingMarketSymbol(params) { return this['privateGetAccountFeesTradingMarketSymbol'](params); }
    privateGetAccountVolume(params) { return this['privateGetAccountVolume'](params); }
    privateGetAccountPermissionsMarkets(params) { return this['privateGetAccountPermissionsMarkets'](params); }
    privateGetAccountPermissionsMarketsMarketSymbol(params) { return this['privateGetAccountPermissionsMarketsMarketSymbol'](params); }
    privateGetAccountPermissionsCurrencies(params) { return this['privateGetAccountPermissionsCurrencies'](params); }
    privateGetAccountPermissionsCurrenciesCurrencySymbol(params) { return this['privateGetAccountPermissionsCurrenciesCurrencySymbol'](params); }
    privateGetAddresses(params) { return this['privateGetAddresses'](params); }
    privateGetAddressesCurrencySymbol(params) { return this['privateGetAddressesCurrencySymbol'](params); }
    privateGetBalances(params) { return this['privateGetBalances'](params); }
    privateGetBalancesCurrencySymbol(params) { return this['privateGetBalancesCurrencySymbol'](params); }
    privateGetDepositsOpen(params) { return this['privateGetDepositsOpen'](params); }
    privateGetDepositsClosed(params) { return this['privateGetDepositsClosed'](params); }
    privateGetDepositsByTxIdTxId(params) { return this['privateGetDepositsByTxIdTxId'](params); }
    privateGetDepositsDepositId(params) { return this['privateGetDepositsDepositId'](params); }
    privateGetExecutions(params) { return this['privateGetExecutions'](params); }
    privateGetExecutionsLastId(params) { return this['privateGetExecutionsLastId'](params); }
    privateGetExecutionsExecutionId(params) { return this['privateGetExecutionsExecutionId'](params); }
    privateGetOrdersClosed(params) { return this['privateGetOrdersClosed'](params); }
    privateGetOrdersOpen(params) { return this['privateGetOrdersOpen'](params); }
    privateGetOrdersOrderId(params) { return this['privateGetOrdersOrderId'](params); }
    privateGetOrdersOrderIdExecutions(params) { return this['privateGetOrdersOrderIdExecutions'](params); }
    privateGetPing(params) { return this['privateGetPing'](params); }
    privateGetSubaccountsSubaccountId(params) { return this['privateGetSubaccountsSubaccountId'](params); }
    privateGetSubaccounts(params) { return this['privateGetSubaccounts'](params); }
    privateGetSubaccountsWithdrawalsOpen(params) { return this['privateGetSubaccountsWithdrawalsOpen'](params); }
    privateGetSubaccountsWithdrawalsClosed(params) { return this['privateGetSubaccountsWithdrawalsClosed'](params); }
    privateGetSubaccountsDepositsOpen(params) { return this['privateGetSubaccountsDepositsOpen'](params); }
    privateGetSubaccountsDepositsClosed(params) { return this['privateGetSubaccountsDepositsClosed'](params); }
    privateGetWithdrawalsOpen(params) { return this['privateGetWithdrawalsOpen'](params); }
    privateGetWithdrawalsClosed(params) { return this['privateGetWithdrawalsClosed'](params); }
    privateGetWithdrawalsByTxIdTxId(params) { return this['privateGetWithdrawalsByTxIdTxId'](params); }
    privateGetWithdrawalsWithdrawalId(params) { return this['privateGetWithdrawalsWithdrawalId'](params); }
    privateGetWithdrawalsAllowedAddresses(params) { return this['privateGetWithdrawalsAllowedAddresses'](params); }
    privateGetConditionalOrdersConditionalOrderId(params) { return this['privateGetConditionalOrdersConditionalOrderId'](params); }
    privateGetConditionalOrdersClosed(params) { return this['privateGetConditionalOrdersClosed'](params); }
    privateGetConditionalOrdersOpen(params) { return this['privateGetConditionalOrdersOpen'](params); }
    privateGetTransfersSent(params) { return this['privateGetTransfersSent'](params); }
    privateGetTransfersReceived(params) { return this['privateGetTransfersReceived'](params); }
    privateGetTransfersTransferId(params) { return this['privateGetTransfersTransferId'](params); }
    privateGetFundsTransferMethodsFundsTransferMethodId(params) { return this['privateGetFundsTransferMethodsFundsTransferMethodId'](params); }
    privatePostAddresses(params) { return this['privatePostAddresses'](params); }
    privatePostOrders(params) { return this['privatePostOrders'](params); }
    privatePostSubaccounts(params) { return this['privatePostSubaccounts'](params); }
    privatePostWithdrawals(params) { return this['privatePostWithdrawals'](params); }
    privatePostConditionalOrders(params) { return this['privatePostConditionalOrders'](params); }
    privatePostTransfers(params) { return this['privatePostTransfers'](params); }
    privatePostBatch(params) { return this['privatePostBatch'](params); }
    privateDeleteOrdersOpen(params) { return this['privateDeleteOrdersOpen'](params); }
    privateDeleteOrdersOrderId(params) { return this['privateDeleteOrdersOrderId'](params); }
    privateDeleteWithdrawalsWithdrawalId(params) { return this['privateDeleteWithdrawalsWithdrawalId'](params); }
    privateDeleteConditionalOrdersConditionalOrderId(params) { return this['privateDeleteConditionalOrdersConditionalOrderId'](params); }
    signalrGetNegotiate(params) { return this['signalrGetNegotiate'](params); }
    signalrGetStart(params) { return this['signalrGetStart'](params); }
}

module.exports = Exchange;
