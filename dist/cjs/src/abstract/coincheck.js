'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetExchangeOrdersRate(params) { return this['publicGetExchangeOrdersRate'](params); }
    publicGetOrderBooks(params) { return this['publicGetOrderBooks'](params); }
    publicGetRatePair(params) { return this['publicGetRatePair'](params); }
    publicGetTicker(params) { return this['publicGetTicker'](params); }
    publicGetTrades(params) { return this['publicGetTrades'](params); }
    privateGetAccounts(params) { return this['privateGetAccounts'](params); }
    privateGetAccountsBalance(params) { return this['privateGetAccountsBalance'](params); }
    privateGetAccountsLeverageBalance(params) { return this['privateGetAccountsLeverageBalance'](params); }
    privateGetBankAccounts(params) { return this['privateGetBankAccounts'](params); }
    privateGetDepositMoney(params) { return this['privateGetDepositMoney'](params); }
    privateGetExchangeOrdersOpens(params) { return this['privateGetExchangeOrdersOpens'](params); }
    privateGetExchangeOrdersTransactions(params) { return this['privateGetExchangeOrdersTransactions'](params); }
    privateGetExchangeOrdersTransactionsPagination(params) { return this['privateGetExchangeOrdersTransactionsPagination'](params); }
    privateGetExchangeLeveragePositions(params) { return this['privateGetExchangeLeveragePositions'](params); }
    privateGetLendingBorrowsMatches(params) { return this['privateGetLendingBorrowsMatches'](params); }
    privateGetSendMoney(params) { return this['privateGetSendMoney'](params); }
    privateGetWithdraws(params) { return this['privateGetWithdraws'](params); }
    privatePostBankAccounts(params) { return this['privatePostBankAccounts'](params); }
    privatePostDepositMoneyIdFast(params) { return this['privatePostDepositMoneyIdFast'](params); }
    privatePostExchangeOrders(params) { return this['privatePostExchangeOrders'](params); }
    privatePostExchangeTransfersToLeverage(params) { return this['privatePostExchangeTransfersToLeverage'](params); }
    privatePostExchangeTransfersFromLeverage(params) { return this['privatePostExchangeTransfersFromLeverage'](params); }
    privatePostLendingBorrows(params) { return this['privatePostLendingBorrows'](params); }
    privatePostLendingBorrowsIdRepay(params) { return this['privatePostLendingBorrowsIdRepay'](params); }
    privatePostSendMoney(params) { return this['privatePostSendMoney'](params); }
    privatePostWithdraws(params) { return this['privatePostWithdraws'](params); }
    privateDeleteBankAccountsId(params) { return this['privateDeleteBankAccountsId'](params); }
    privateDeleteExchangeOrdersId(params) { return this['privateDeleteExchangeOrdersId'](params); }
    privateDeleteWithdrawsId(params) { return this['privateDeleteWithdrawsId'](params); }
}

module.exports = Exchange;
