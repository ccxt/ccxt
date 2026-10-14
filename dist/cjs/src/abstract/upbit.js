'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetMarketAll(params = {}) {
        return this.request("market/all", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetCandlesTimeframe(params = {}) {
        return this.request("candles/{timeframe}", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetCandlesTimeframeUnit(params = {}) {
        return this.request("candles/{timeframe}/{unit}", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetCandlesSeconds(params = {}) {
        return this.request("candles/seconds", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetCandlesMinutesUnit(params = {}) {
        return this.request("candles/minutes/{unit}", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetCandlesMinutes1(params = {}) {
        return this.request("candles/minutes/1", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetCandlesMinutes3(params = {}) {
        return this.request("candles/minutes/3", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetCandlesMinutes5(params = {}) {
        return this.request("candles/minutes/5", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetCandlesMinutes10(params = {}) {
        return this.request("candles/minutes/10", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetCandlesMinutes15(params = {}) {
        return this.request("candles/minutes/15", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetCandlesMinutes30(params = {}) {
        return this.request("candles/minutes/30", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetCandlesMinutes60(params = {}) {
        return this.request("candles/minutes/60", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetCandlesMinutes240(params = {}) {
        return this.request("candles/minutes/240", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetCandlesDays(params = {}) {
        return this.request("candles/days", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetCandlesWeeks(params = {}) {
        return this.request("candles/weeks", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetCandlesMonths(params = {}) {
        return this.request("candles/months", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetCandlesYears(params = {}) {
        return this.request("candles/years", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetTradesTicks(params = {}) {
        return this.request("trades/ticks", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetTicker(params = {}) {
        return this.request("ticker", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetTickerAll(params = {}) {
        return this.request("ticker/all", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetOrderbook(params = {}) {
        return this.request("orderbook", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    publicGetOrderbookInstruments(params = {}) {
        return this.request("orderbook/instruments", "public", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    privateGetAccounts(params = {}) {
        return this.request("accounts", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetOrdersChance(params = {}) {
        return this.request("orders/chance", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetOrder(params = {}) {
        return this.request("order", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetOrdersClosed(params = {}) {
        return this.request("orders/closed", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetOrdersOpen(params = {}) {
        return this.request("orders/open", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetOrdersUuids(params = {}) {
        return this.request("orders/uuids", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetWithdraws(params = {}) {
        return this.request("withdraws", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetWithdraw(params = {}) {
        return this.request("withdraw", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetWithdrawsChance(params = {}) {
        return this.request("withdraws/chance", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetWithdrawsCoinAddresses(params = {}) {
        return this.request("withdraws/coin_addresses", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetDeposits(params = {}) {
        return this.request("deposits", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetDepositsChanceCoin(params = {}) {
        return this.request("deposits/chance/coin", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetDeposit(params = {}) {
        return this.request("deposit", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetDepositsCoinAddresses(params = {}) {
        return this.request("deposits/coin_addresses", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetDepositsCoinAddress(params = {}) {
        return this.request("deposits/coin_address", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetTravelRuleVasps(params = {}) {
        return this.request("travel_rule/vasps", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetStatusWallet(params = {}) {
        return this.request("status/wallet", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetApiKeys(params = {}) {
        return this.request("api_keys", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetPockets(params = {}) {
        return this.request("pockets", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetPocketsApiKeys(params = {}) {
        return this.request("pockets/api_keys", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetPocketsAssets(params = {}) {
        return this.request("pockets/assets", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetPocketsUniversalTransfers(params = {}) {
        return this.request("pockets/universal_transfers", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privateGetPocketsTransfers(params = {}) {
        return this.request("pockets/transfers", "private", 'GET', params, undefined, undefined, { "cost": 0.67 });
    }
    privatePostOrders(params = {}) {
        return this.request("orders", "private", 'POST', params, undefined, undefined, { "cost": 2.5 });
    }
    privatePostOrdersTest(params = {}) {
        return this.request("orders/test", "private", 'POST', params, undefined, undefined, { "cost": 2.5 });
    }
    privatePostOrdersCancelAndNew(params = {}) {
        return this.request("orders/cancel_and_new", "private", 'POST', params, undefined, undefined, { "cost": 2.5 });
    }
    privatePostWithdrawsCoin(params = {}) {
        return this.request("withdraws/coin", "private", 'POST', params, undefined, undefined, { "cost": 0.67 });
    }
    privatePostWithdrawsKrw(params = {}) {
        return this.request("withdraws/krw", "private", 'POST', params, undefined, undefined, { "cost": 0.67 });
    }
    privatePostDepositsKrw(params = {}) {
        return this.request("deposits/krw", "private", 'POST', params, undefined, undefined, { "cost": 0.67 });
    }
    privatePostDepositsGenerateCoinAddress(params = {}) {
        return this.request("deposits/generate_coin_address", "private", 'POST', params, undefined, undefined, { "cost": 0.67 });
    }
    privatePostTravelRuleDepositUuid(params = {}) {
        return this.request("travel_rule/deposit/uuid", "private", 'POST', params, undefined, undefined, { "cost": 0.67 });
    }
    privatePostTravelRuleDepositTxid(params = {}) {
        return this.request("travel_rule/deposit/txid", "private", 'POST', params, undefined, undefined, { "cost": 0.67 });
    }
    privatePostPocketsUniversalTransfers(params = {}) {
        return this.request("pockets/universal_transfers", "private", 'POST', params, undefined, undefined, { "cost": 0.67 });
    }
    privatePostPocketsTransfers(params = {}) {
        return this.request("pockets/transfers", "private", 'POST', params, undefined, undefined, { "cost": 0.67 });
    }
    privateDeleteOrder(params = {}) {
        return this.request("order", "private", 'DELETE', params, undefined, undefined, { "cost": 0.67 });
    }
    privateDeleteOrdersOpen(params = {}) {
        return this.request("orders/open", "private", 'DELETE', params, undefined, undefined, { "cost": 40 });
    }
    privateDeleteOrdersUuids(params = {}) {
        return this.request("orders/uuids", "private", 'DELETE', params, undefined, undefined, { "cost": 0.67 });
    }
    privateDeleteWithdrawsCoin(params = {}) {
        return this.request("withdraws/coin", "private", 'DELETE', params, undefined, undefined, { "cost": 0.67 });
    }
}

exports["default"] = Exchange;
