'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetLatest(params) { return this['publicGetLatest'](params); }
    privatePostOrders(params) { return this['privatePostOrders'](params); }
    privatePostOrdersHistory(params) { return this['privatePostOrdersHistory'](params); }
    privatePostMyCoinDeposit(params) { return this['privatePostMyCoinDeposit'](params); }
    privatePostMyCoinSend(params) { return this['privatePostMyCoinSend'](params); }
    privatePostQuoteBuy(params) { return this['privatePostQuoteBuy'](params); }
    privatePostQuoteSell(params) { return this['privatePostQuoteSell'](params); }
    privatePostMyBalances(params) { return this['privatePostMyBalances'](params); }
    privatePostMyOrders(params) { return this['privatePostMyOrders'](params); }
    privatePostMyBuy(params) { return this['privatePostMyBuy'](params); }
    privatePostMySell(params) { return this['privatePostMySell'](params); }
    privatePostMyBuyCancel(params) { return this['privatePostMyBuyCancel'](params); }
    privatePostMySellCancel(params) { return this['privatePostMySellCancel'](params); }
    privatePostRoMyBalances(params) { return this['privatePostRoMyBalances'](params); }
    privatePostRoMyBalancesCointype(params) { return this['privatePostRoMyBalancesCointype'](params); }
    privatePostRoMyDeposits(params) { return this['privatePostRoMyDeposits'](params); }
    privatePostRoMyWithdrawals(params) { return this['privatePostRoMyWithdrawals'](params); }
    privatePostRoMyTransactions(params) { return this['privatePostRoMyTransactions'](params); }
    privatePostRoMyTransactionsCointype(params) { return this['privatePostRoMyTransactionsCointype'](params); }
    privatePostRoMyTransactionsOpen(params) { return this['privatePostRoMyTransactionsOpen'](params); }
    privatePostRoMyTransactionsCointypeOpen(params) { return this['privatePostRoMyTransactionsCointypeOpen'](params); }
    privatePostRoMySendreceive(params) { return this['privatePostRoMySendreceive'](params); }
    privatePostRoMyAffiliatepayments(params) { return this['privatePostRoMyAffiliatepayments'](params); }
    privatePostRoMyReferralpayments(params) { return this['privatePostRoMyReferralpayments'](params); }
}

module.exports = Exchange;
