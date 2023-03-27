'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetTickers(params) { return this['publicGetTickers'](params); }
    publicGetTickersSymbol(params) { return this['publicGetTickersSymbol'](params); }
    publicGetSymbols(params) { return this['publicGetSymbols'](params); }
    publicGetSymbolsSymbol(params) { return this['publicGetSymbolsSymbol'](params); }
    publicGetL2Symbol(params) { return this['publicGetL2Symbol'](params); }
    publicGetL3Symbol(params) { return this['publicGetL3Symbol'](params); }
    privateGetFees(params) { return this['privateGetFees'](params); }
    privateGetOrders(params) { return this['privateGetOrders'](params); }
    privateGetOrdersOrderId(params) { return this['privateGetOrdersOrderId'](params); }
    privateGetTrades(params) { return this['privateGetTrades'](params); }
    privateGetFills(params) { return this['privateGetFills'](params); }
    privateGetDeposits(params) { return this['privateGetDeposits'](params); }
    privateGetDepositsDepositId(params) { return this['privateGetDepositsDepositId'](params); }
    privateGetAccounts(params) { return this['privateGetAccounts'](params); }
    privateGetAccountsAccountCurrency(params) { return this['privateGetAccountsAccountCurrency'](params); }
    privateGetWhitelist(params) { return this['privateGetWhitelist'](params); }
    privateGetWhitelistCurrency(params) { return this['privateGetWhitelistCurrency'](params); }
    privateGetWithdrawals(params) { return this['privateGetWithdrawals'](params); }
    privateGetWithdrawalsWithdrawalId(params) { return this['privateGetWithdrawalsWithdrawalId'](params); }
    privatePostOrders(params) { return this['privatePostOrders'](params); }
    privatePostDepositsCurrency(params) { return this['privatePostDepositsCurrency'](params); }
    privatePostWithdrawals(params) { return this['privatePostWithdrawals'](params); }
    privateDeleteOrders(params) { return this['privateDeleteOrders'](params); }
    privateDeleteOrdersOrderId(params) { return this['privateDeleteOrdersOrderId'](params); }
}

module.exports = Exchange;
