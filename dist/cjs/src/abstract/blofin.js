'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetMarketInstruments(params = {}) {
        return this.request('market/instruments', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketInstrumentsHistory(params = {}) {
        return this.request('market/instruments-history', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketTickers(params = {}) {
        return this.request('market/tickers', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketBooks(params = {}) {
        return this.request('market/books', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketTrades(params = {}) {
        return this.request('market/trades', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketMarkPrice(params = {}) {
        return this.request('market/mark-price', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketFundingRate(params = {}) {
        return this.request('market/funding-rate', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketFundingRateHistory(params = {}) {
        return this.request('market/funding-rate-history', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketCandles(params = {}) {
        return this.request('market/candles', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketIndexCandles(params = {}) {
        return this.request('market/index-candles', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketMarkPriceCandles(params = {}) {
        return this.request('market/mark-price-candles', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetMarketPositionTiers(params = {}) {
        return this.request('market/position-tiers', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSpotMarketInstruments(params = {}) {
        return this.request('spot/market/instruments', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSpotMarketTickers(params = {}) {
        return this.request('spot/market/tickers', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSpotMarketBooks(params = {}) {
        return this.request('spot/market/books', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSpotMarketTrades(params = {}) {
        return this.request('spot/market/trades', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSpotMarketCandles(params = {}) {
        return this.request('spot/market/candles', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAssetBalances(params = {}) {
        return this.request('asset/balances', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAssetBills(params = {}) {
        return this.request('asset/bills', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAssetWithdrawalHistory(params = {}) {
        return this.request('asset/withdrawal-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAssetDepositHistory(params = {}) {
        return this.request('asset/deposit-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAssetDepositAddress(params = {}) {
        return this.request('asset/deposit-address', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAccountConfig(params = {}) {
        return this.request('account/config', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAssetCurrencies(params = {}) {
        return this.request('asset/currencies', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAccountBalance(params = {}) {
        return this.request('account/balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAccountPositions(params = {}) {
        return this.request('account/positions', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAccountPositionsHistory(params = {}) {
        return this.request('account/positions-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAccountFundingFees(params = {}) {
        return this.request('account/funding-fees', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAccountMarginMode(params = {}) {
        return this.request('account/margin-mode', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAccountPositionMode(params = {}) {
        return this.request('account/position-mode', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAccountLeverageInfo(params = {}) {
        return this.request('account/leverage-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAccountBatchLeverageInfo(params = {}) {
        return this.request('account/batch-leverage-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetTradeOrdersPending(params = {}) {
        return this.request('trade/orders-pending', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetTradeOrderDetail(params = {}) {
        return this.request('trade/order-detail', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetTradeOrdersTpslPending(params = {}) {
        return this.request('trade/orders-tpsl-pending', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetTradeOrderTpslDetail(params = {}) {
        return this.request('trade/order-tpsl-detail', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetTradeOrdersAlgoPending(params = {}) {
        return this.request('trade/orders-algo-pending', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetTradeOrdersHistory(params = {}) {
        return this.request('trade/orders-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetTradeOrdersTpslHistory(params = {}) {
        return this.request('trade/orders-tpsl-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetTradeOrdersAlgoHistory(params = {}) {
        return this.request('trade/orders-algo-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetTradeFillsHistory(params = {}) {
        return this.request('trade/fills-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetTradeOrderPriceRange(params = {}) {
        return this.request('trade/order/price-range', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetAffiliateBasic(params = {}) {
        return this.request('affiliate/basic', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAffiliateReferralCode(params = {}) {
        return this.request('affiliate/referral-code', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAffiliateInvitees(params = {}) {
        return this.request('affiliate/invitees', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAffiliateSubInvitees(params = {}) {
        return this.request('affiliate/sub-invitees', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAffiliateSubAffiliates(params = {}) {
        return this.request('affiliate/sub-affiliates', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAffiliateInviteesDailyInfo(params = {}) {
        return this.request('affiliate/invitees/daily/info', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetCopytradingInstruments(params = {}) {
        return this.request('copytrading/instruments', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetCopytradingConfig(params = {}) {
        return this.request('copytrading/config', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetCopytradingAccountBalance(params = {}) {
        return this.request('copytrading/account/balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetCopytradingAccountPositionsByOrder(params = {}) {
        return this.request('copytrading/account/positions-by-order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetCopytradingAccountPositionsDetailsByOrder(params = {}) {
        return this.request('copytrading/account/positions-details-by-order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetCopytradingAccountPositionsByContract(params = {}) {
        return this.request('copytrading/account/positions-by-contract', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetCopytradingAccountPositionMode(params = {}) {
        return this.request('copytrading/account/position-mode', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetCopytradingAccountLeverageInfo(params = {}) {
        return this.request('copytrading/account/leverage-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetCopytradingTradeOrdersPending(params = {}) {
        return this.request('copytrading/trade/orders-pending', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetCopytradingTradePendingTpslByContract(params = {}) {
        return this.request('copytrading/trade/pending-tpsl-by-contract', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetCopytradingTradePositionHistoryByOrder(params = {}) {
        return this.request('copytrading/trade/position-history-by-order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetCopytradingTradeOrdersHistory(params = {}) {
        return this.request('copytrading/trade/orders-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetCopytradingTradePendingTpslByOrder(params = {}) {
        return this.request('copytrading/trade/pending-tpsl-by-order', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetUserQueryApikey(params = {}) {
        return this.request('user/query-apikey', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetSpotTradeFillsHistory(params = {}) {
        return this.request('spot/trade/fills-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetSpotTradeOrdersPending(params = {}) {
        return this.request('spot/trade/orders-pending', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetSpotTradeOrderDetail(params = {}) {
        return this.request('spot/trade/order-detail', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetSpotTradeOrdersAlgoPending(params = {}) {
        return this.request('spot/trade/orders-algo-pending', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetSpotTradeOrdersHistory(params = {}) {
        return this.request('spot/trade/orders-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetSpotTradeOrdersAlgoHistory(params = {}) {
        return this.request('spot/trade/orders-algo-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privateGetSpotTradeOrderPriceRange(params = {}) {
        return this.request('spot/trade/order/price-range', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostAssetTransfer(params = {}) {
        return this.request('asset/transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAssetDemoApplyMoney(params = {}) {
        return this.request('asset/demo-apply-money', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAssetWithdrawalApply(params = {}) {
        return this.request('asset/withdrawal-apply', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostAccountSetMarginMode(params = {}) {
        return this.request('account/set-margin-mode', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostAccountSetPositionMode(params = {}) {
        return this.request('account/set-position-mode', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostAccountSetLeverage(params = {}) {
        return this.request('account/set-leverage', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostTradeOrder(params = {}) {
        return this.request('trade/order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostTradeBatchOrders(params = {}) {
        return this.request('trade/batch-orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostTradeOrderTpsl(params = {}) {
        return this.request('trade/order-tpsl', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostTradeOrderAlgo(params = {}) {
        return this.request('trade/order-algo', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostTradeCancelOrder(params = {}) {
        return this.request('trade/cancel-order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostTradeCancelBatchOrders(params = {}) {
        return this.request('trade/cancel-batch-orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostTradeCancelTpsl(params = {}) {
        return this.request('trade/cancel-tpsl', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostTradeCancelAlgo(params = {}) {
        return this.request('trade/cancel-algo', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostTradeAmendOrder(params = {}) {
        return this.request('trade/amend-order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostTradeAmendBatchOrders(params = {}) {
        return this.request('trade/amend-batch-orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostTradeAmendTpsl(params = {}) {
        return this.request('trade/amend-tpsl', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostTradeAmendAlgo(params = {}) {
        return this.request('trade/amend-algo', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostTradeClosePosition(params = {}) {
        return this.request('trade/close-position', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostSpotTradeOrder(params = {}) {
        return this.request('spot/trade/order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostSpotTradeBatchOrders(params = {}) {
        return this.request('spot/trade/batch-orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostSpotTradeOrderAlgo(params = {}) {
        return this.request('spot/trade/order-algo', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostSpotTradeCancelOrder(params = {}) {
        return this.request('spot/trade/cancel-order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostSpotTradeCancelBatchOrders(params = {}) {
        return this.request('spot/trade/cancel-batch-orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostSpotTradeCancelAlgo(params = {}) {
        return this.request('spot/trade/cancel-algo', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostCopytradingAccountSetPositionMode(params = {}) {
        return this.request('copytrading/account/set-position-mode', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostCopytradingAccountSetLeverage(params = {}) {
        return this.request('copytrading/account/set-leverage', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostCopytradingTradePlaceOrder(params = {}) {
        return this.request('copytrading/trade/place-order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostCopytradingTradeCancelOrder(params = {}) {
        return this.request('copytrading/trade/cancel-order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostCopytradingTradePlaceTpslByContract(params = {}) {
        return this.request('copytrading/trade/place-tpsl-by-contract', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostCopytradingTradeCancelTpslByContract(params = {}) {
        return this.request('copytrading/trade/cancel-tpsl-by-contract', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostCopytradingTradePlaceTpslByOrder(params = {}) {
        return this.request('copytrading/trade/place-tpsl-by-order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostCopytradingTradeCancelTpslByOrder(params = {}) {
        return this.request('copytrading/trade/cancel-tpsl-by-order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostCopytradingTradeClosePositionByOrder(params = {}) {
        return this.request('copytrading/trade/close-position-by-order', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
    privatePostCopytradingTradeClosePositionByContract(params = {}) {
        return this.request('copytrading/trade/close-position-by-contract', ['private'], 'POST', params, undefined, undefined, { 'cost': 1.67 });
    }
}

exports["default"] = Exchange;
