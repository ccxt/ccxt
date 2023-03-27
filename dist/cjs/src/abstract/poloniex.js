'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetMarkets(params) { return this['publicGetMarkets'](params); }
    publicGetMarketsSymbol(params) { return this['publicGetMarketsSymbol'](params); }
    publicGetCurrencies(params) { return this['publicGetCurrencies'](params); }
    publicGetCurrenciesCurrency(params) { return this['publicGetCurrenciesCurrency'](params); }
    publicGetTimestamp(params) { return this['publicGetTimestamp'](params); }
    publicGetMarketsPrice(params) { return this['publicGetMarketsPrice'](params); }
    publicGetMarketsSymbolPrice(params) { return this['publicGetMarketsSymbolPrice'](params); }
    publicGetMarketsSymbolOrderBook(params) { return this['publicGetMarketsSymbolOrderBook'](params); }
    publicGetMarketsSymbolCandles(params) { return this['publicGetMarketsSymbolCandles'](params); }
    publicGetMarketsSymbolTrades(params) { return this['publicGetMarketsSymbolTrades'](params); }
    publicGetMarketsTicker24h(params) { return this['publicGetMarketsTicker24h'](params); }
    publicGetMarketsSymbolTicker24h(params) { return this['publicGetMarketsSymbolTicker24h'](params); }
    privateGetAccounts(params) { return this['privateGetAccounts'](params); }
    privateGetAccountsActivity(params) { return this['privateGetAccountsActivity'](params); }
    privateGetAccountsBalances(params) { return this['privateGetAccountsBalances'](params); }
    privateGetAccountsIdBalances(params) { return this['privateGetAccountsIdBalances'](params); }
    privateGetAccountsTransfer(params) { return this['privateGetAccountsTransfer'](params); }
    privateGetAccountsTransferId(params) { return this['privateGetAccountsTransferId'](params); }
    privateGetSubaccounts(params) { return this['privateGetSubaccounts'](params); }
    privateGetSubaccountsBalances(params) { return this['privateGetSubaccountsBalances'](params); }
    privateGetSubaccountsIdBalances(params) { return this['privateGetSubaccountsIdBalances'](params); }
    privateGetSubaccountsTransfer(params) { return this['privateGetSubaccountsTransfer'](params); }
    privateGetSubaccountsTransferId(params) { return this['privateGetSubaccountsTransferId'](params); }
    privateGetFeeinfo(params) { return this['privateGetFeeinfo'](params); }
    privateGetWalletsAddresses(params) { return this['privateGetWalletsAddresses'](params); }
    privateGetWalletsActivity(params) { return this['privateGetWalletsActivity'](params); }
    privateGetWalletsAddressesCurrency(params) { return this['privateGetWalletsAddressesCurrency'](params); }
    privateGetOrders(params) { return this['privateGetOrders'](params); }
    privateGetOrdersId(params) { return this['privateGetOrdersId'](params); }
    privateGetOrdersHistory(params) { return this['privateGetOrdersHistory'](params); }
    privateGetOrdersKillSwitchStatus(params) { return this['privateGetOrdersKillSwitchStatus'](params); }
    privateGetSmartorders(params) { return this['privateGetSmartorders'](params); }
    privateGetSmartordersId(params) { return this['privateGetSmartordersId'](params); }
    privateGetSmartordersHistory(params) { return this['privateGetSmartordersHistory'](params); }
    privateGetTrades(params) { return this['privateGetTrades'](params); }
    privateGetOrdersIdTrades(params) { return this['privateGetOrdersIdTrades'](params); }
    privatePostAccountsTransfer(params) { return this['privatePostAccountsTransfer'](params); }
    privatePostSubaccountsTransfer(params) { return this['privatePostSubaccountsTransfer'](params); }
    privatePostWalletsAddress(params) { return this['privatePostWalletsAddress'](params); }
    privatePostWalletsWithdraw(params) { return this['privatePostWalletsWithdraw'](params); }
    privatePostOrders(params) { return this['privatePostOrders'](params); }
    privatePostOrdersKillSwitch(params) { return this['privatePostOrdersKillSwitch'](params); }
    privatePostOrdersBatch(params) { return this['privatePostOrdersBatch'](params); }
    privatePostSmartorders(params) { return this['privatePostSmartorders'](params); }
    privateDeleteOrdersId(params) { return this['privateDeleteOrdersId'](params); }
    privateDeleteOrdersCancelByIds(params) { return this['privateDeleteOrdersCancelByIds'](params); }
    privateDeleteOrders(params) { return this['privateDeleteOrders'](params); }
    privateDeleteSmartordersId(params) { return this['privateDeleteSmartordersId'](params); }
    privateDeleteSmartordersCancelByIds(params) { return this['privateDeleteSmartordersCancelByIds'](params); }
    privateDeleteSmartorders(params) { return this['privateDeleteSmartorders'](params); }
    privatePutOrdersId(params) { return this['privatePutOrdersId'](params); }
    privatePutSmartordersId(params) { return this['privatePutSmartordersId'](params); }
}

module.exports = Exchange;
