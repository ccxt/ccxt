'use strict';

var Exchange$1 = require('../base/Exchange.js');

// -------------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetMarketsSymbolTicker(params) { return this['publicGetMarketsSymbolTicker'](params); }
    publicGetMarketsSymbolOrderBook(params) { return this['publicGetMarketsSymbolOrderBook'](params); }
    publicGetMarketsSymbolTrades(params) { return this['publicGetMarketsSymbolTrades'](params); }
    privateGetWallets(params) { return this['privateGetWallets'](params); }
    privateGetWalletsWalletId(params) { return this['privateGetWalletsWalletId'](params); }
    privateGetWalletsWalletIdBalancesCurrencyCode(params) { return this['privateGetWalletsWalletIdBalancesCurrencyCode'](params); }
    privateGetWalletsWalletIdFundingHistory(params) { return this['privateGetWalletsWalletIdFundingHistory'](params); }
    privateGetWalletsWalletIdTrades(params) { return this['privateGetWalletsWalletIdTrades'](params); }
    privateGetWalletsWalletIdOrders(params) { return this['privateGetWalletsWalletIdOrders'](params); }
    privateGetWalletsWalletIdOrdersId(params) { return this['privateGetWalletsWalletIdOrdersId'](params); }
    privatePostWalletTransfers(params) { return this['privatePostWalletTransfers'](params); }
    privatePostWallets(params) { return this['privatePostWallets'](params); }
    privatePostWalletsWalletIdCryptocurrencyDeposits(params) { return this['privatePostWalletsWalletIdCryptocurrencyDeposits'](params); }
    privatePostWalletsWalletIdCryptocurrencyWithdrawals(params) { return this['privatePostWalletsWalletIdCryptocurrencyWithdrawals'](params); }
    privatePostWalletsWalletIdOrders(params) { return this['privatePostWalletsWalletIdOrders'](params); }
    privatePostWireWithdrawal(params) { return this['privatePostWireWithdrawal'](params); }
    privateDeleteWalletsWalletIdOrdersId(params) { return this['privateDeleteWalletsWalletIdOrdersId'](params); }
}

module.exports = Exchange;
