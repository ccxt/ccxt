'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    addressbookGetMe(params) { return this['addressbookGetMe'](params); }
    addressbookPost(params) { return this['addressbookPost'](params); }
    addressbookPostIdId(params) { return this['addressbookPostIdId'](params); }
    addressbookPostIdIdRemove(params) { return this['addressbookPostIdIdRemove'](params); }
    custodyGetCredentials(params) { return this['custodyGetCredentials'](params); }
    custodyGetCredentialsHHash(params) { return this['custodyGetCredentialsHHash'](params); }
    custodyGetCredentialsKKey(params) { return this['custodyGetCredentialsKKey'](params); }
    custodyGetCredentialsMe(params) { return this['custodyGetCredentialsMe'](params); }
    custodyGetCredentialsMeAddress(params) { return this['custodyGetCredentialsMeAddress'](params); }
    custodyGetDepositAddresses(params) { return this['custodyGetDepositAddresses'](params); }
    custodyGetDepositAddressesHHash(params) { return this['custodyGetDepositAddressesHHash'](params); }
    historyGetOrders(params) { return this['historyGetOrders'](params); }
    historyGetOrdersDetails(params) { return this['historyGetOrdersDetails'](params); }
    historyGetOrdersExportCsv(params) { return this['historyGetOrdersExportCsv'](params); }
    historyGetTrades(params) { return this['historyGetTrades'](params); }
    historyGetTradesExportCsv(params) { return this['historyGetTradesExportCsv'](params); }
    currenciesGetAAddress(params) { return this['currenciesGetAAddress'](params); }
    currenciesGetIId(params) { return this['currenciesGetIId'](params); }
    currenciesGetSSymbol(params) { return this['currenciesGetSSymbol'](params); }
    currenciesPostPerform(params) { return this['currenciesPostPerform'](params); }
    currenciesPostPrepare(params) { return this['currenciesPostPrepare'](params); }
    currenciesPostRemovePerform(params) { return this['currenciesPostRemovePerform'](params); }
    currenciesPostSSymbolRemovePrepare(params) { return this['currenciesPostSSymbolRemovePrepare'](params); }
    currenciesPostSSymbolUpdatePerform(params) { return this['currenciesPostSSymbolUpdatePerform'](params); }
    currenciesPostSSymbolUpdatePrepare(params) { return this['currenciesPostSSymbolUpdatePrepare'](params); }
    managerGetDeposits(params) { return this['managerGetDeposits'](params); }
    managerGetTransfers(params) { return this['managerGetTransfers'](params); }
    managerGetWithdrawals(params) { return this['managerGetWithdrawals'](params); }
    marketsGetIId(params) { return this['marketsGetIId'](params); }
    marketsGetSSymbol(params) { return this['marketsGetSSymbol'](params); }
    marketsPostPerform(params) { return this['marketsPostPerform'](params); }
    marketsPostPrepare(params) { return this['marketsPostPrepare'](params); }
    marketsPostRemovePerform(params) { return this['marketsPostRemovePerform'](params); }
    marketsPostSSymbolRemovePrepare(params) { return this['marketsPostSSymbolRemovePrepare'](params); }
    marketsPostSSymbolUpdatePerform(params) { return this['marketsPostSSymbolUpdatePerform'](params); }
    marketsPostSSymbolUpdatePrepare(params) { return this['marketsPostSSymbolUpdatePrepare'](params); }
    publicGetCandles(params) { return this['publicGetCandles'](params); }
    publicGetCurrencies(params) { return this['publicGetCurrencies'](params); }
    publicGetMarkets(params) { return this['publicGetMarkets'](params); }
    publicGetOrderbook(params) { return this['publicGetOrderbook'](params); }
    publicGetOrderbookRaw(params) { return this['publicGetOrderbookRaw'](params); }
    publicGetOrderbookV2(params) { return this['publicGetOrderbookV2'](params); }
    publicGetTickers(params) { return this['publicGetTickers'](params); }
    publicGetTrades(params) { return this['publicGetTrades'](params); }
    statisticsGetAddress(params) { return this['statisticsGetAddress'](params); }
    tradingGetBalances(params) { return this['tradingGetBalances'](params); }
    tradingGetFees(params) { return this['tradingGetFees'](params); }
    tradingGetOrders(params) { return this['tradingGetOrders'](params); }
    tradingPostOrders(params) { return this['tradingPostOrders'](params); }
    tradingPostOrdersJson(params) { return this['tradingPostOrdersJson'](params); }
    tradingPutOrders(params) { return this['tradingPutOrders'](params); }
    tradingPutOrdersJson(params) { return this['tradingPutOrdersJson'](params); }
    tradingDeleteOrders(params) { return this['tradingDeleteOrders'](params); }
    tradingDeleteOrdersJson(params) { return this['tradingDeleteOrdersJson'](params); }
    tradingviewGetConfig(params) { return this['tradingviewGetConfig'](params); }
    tradingviewGetHistory(params) { return this['tradingviewGetHistory'](params); }
    tradingviewGetSymbolInfo(params) { return this['tradingviewGetSymbolInfo'](params); }
    tradingviewGetTime(params) { return this['tradingviewGetTime'](params); }
}

module.exports = Exchange;
