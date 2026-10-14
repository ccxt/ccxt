'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetPublicTickerALLQuoteId(params = {}) {
        return this.request('public/ticker/ALL_{quoteId}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPublicTickerBaseIdQuoteId(params = {}) {
        return this.request('public/ticker/{baseId}_{quoteId}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPublicOrderbookALLQuoteId(params = {}) {
        return this.request('public/orderbook/ALL_{quoteId}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPublicOrderbookBaseIdQuoteId(params = {}) {
        return this.request('public/orderbook/{baseId}_{quoteId}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPublicTransactionHistoryBaseIdQuoteId(params = {}) {
        return this.request('public/transaction_history/{baseId}_{quoteId}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPublicNetworkInfo(params = {}) {
        return this.request('public/network-info', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPublicAssetsstatusMultichainALL(params = {}) {
        return this.request('public/assetsstatus/multichain/ALL', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPublicAssetsstatusMultichainCurrency(params = {}) {
        return this.request('public/assetsstatus/multichain/{currency}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPublicWithdrawMinimumALL(params = {}) {
        return this.request('public/withdraw/minimum/ALL', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPublicWithdrawMinimumCurrency(params = {}) {
        return this.request('public/withdraw/minimum/{currency}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPublicAssetsstatusALL(params = {}) {
        return this.request('public/assetsstatus/ALL', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPublicAssetsstatusBaseId(params = {}) {
        return this.request('public/assetsstatus/{baseId}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetPublicCandlestickBaseIdQuoteIdInterval(params = {}) {
        return this.request('public/candlestick/{baseId}_{quoteId}/{interval}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1MarketAll(params = {}) {
        return this.request('v1/market/all', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1CandlesMinutesUnit(params = {}) {
        return this.request('v1/candles/minutes/{unit}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1CandlesDays(params = {}) {
        return this.request('v1/candles/days', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1CandlesWeeks(params = {}) {
        return this.request('v1/candles/weeks', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1CandlesMonths(params = {}) {
        return this.request('v1/candles/months', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1TradesTicks(params = {}) {
        return this.request('v1/trades/ticks', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1Ticker(params = {}) {
        return this.request('v1/ticker', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1Orderbook(params = {}) {
        return this.request('v1/orderbook', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1MarketVirtualAssetWarning(params = {}) {
        return this.request('v1/market/virtual_asset_warning', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV1Notices(params = {}) {
        return this.request('v1/notices', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV2FeeInoutCurrency(params = {}) {
        return this.request('v2/fee/inout/{currency}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1Accounts(params = {}) {
        return this.request('v1/accounts', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1OrdersChance(params = {}) {
        return this.request('v1/orders/chance', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1Order(params = {}) {
        return this.request('v1/order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1Orders(params = {}) {
        return this.request('v1/orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV2OrdersPending(params = {}) {
        return this.request('v2/orders/pending', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV2OrdersHistory(params = {}) {
        return this.request('v2/orders/history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1Twap(params = {}) {
        return this.request('v1/twap', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1Withdraws(params = {}) {
        return this.request('v1/withdraws', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1WithdrawsKrw(params = {}) {
        return this.request('v1/withdraws/krw', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1Withdraw(params = {}) {
        return this.request('v1/withdraw', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1WithdrawsChance(params = {}) {
        return this.request('v1/withdraws/chance', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1WithdrawsCoinAddresses(params = {}) {
        return this.request('v1/withdraws/coin_addresses', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1Deposits(params = {}) {
        return this.request('v1/deposits', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1DepositsKrw(params = {}) {
        return this.request('v1/deposits/krw', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1Deposit(params = {}) {
        return this.request('v1/deposit', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1DepositsCoinAddresses(params = {}) {
        return this.request('v1/deposits/coin_addresses', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1DepositsCoinAddress(params = {}) {
        return this.request('v1/deposits/coin_address', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1StatusWallet(params = {}) {
        return this.request('v1/status/wallet', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV1ApiKeys(params = {}) {
        return this.request('v1/api_keys', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostInfoAccount(params = {}) {
        return this.request('info/account', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostInfoBalance(params = {}) {
        return this.request('info/balance', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostInfoWalletAddress(params = {}) {
        return this.request('info/wallet_address', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostInfoTicker(params = {}) {
        return this.request('info/ticker', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostInfoOrders(params = {}) {
        return this.request('info/orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostInfoUserTransactions(params = {}) {
        return this.request('info/user_transactions', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostInfoOrderDetail(params = {}) {
        return this.request('info/order_detail', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTradePlace(params = {}) {
        return this.request('trade/place', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostTradeCancel(params = {}) {
        return this.request('trade/cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostTradeBtcWithdrawal(params = {}) {
        return this.request('trade/btc_withdrawal', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTradeKrwDeposit(params = {}) {
        return this.request('trade/krw_deposit', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTradeKrwWithdrawal(params = {}) {
        return this.request('trade/krw_withdrawal', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTradeMarketBuy(params = {}) {
        return this.request('trade/market_buy', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTradeMarketSell(params = {}) {
        return this.request('trade/market_sell', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostTradeStopLimit(params = {}) {
        return this.request('trade/stop_limit', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV2Orders(params = {}) {
        return this.request('v2/orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV2OrdersBatch(params = {}) {
        return this.request('v2/orders/batch', ['private'], 'POST', params, undefined, undefined, { 'cost': 6 });
    }
    privatePostV2OrdersCancel(params = {}) {
        return this.request('v2/orders/cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 6 });
    }
    privatePostV2OrdersSearch(params = {}) {
        return this.request('v2/orders/search', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV1Twap(params = {}) {
        return this.request('v1/twap', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV1WithdrawsCoin(params = {}) {
        return this.request('v1/withdraws/coin', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV1WithdrawsKrw(params = {}) {
        return this.request('v1/withdraws/krw', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV1DepositsGenerateCoinAddress(params = {}) {
        return this.request('v1/deposits/generate_coin_address', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV1DepositsKrw(params = {}) {
        return this.request('v1/deposits/krw', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteV2Order(params = {}) {
        return this.request('v2/order', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteV1Twap(params = {}) {
        return this.request('v1/twap', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteV1WithdrawsCoin(params = {}) {
        return this.request('v1/withdraws/coin', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
