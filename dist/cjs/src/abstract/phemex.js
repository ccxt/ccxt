'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetCfgV2Products(params = {}) {
        return this.request('cfg/v2/products', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetCfgFundingRates(params = {}) {
        return this.request('cfg/fundingRates', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetProducts(params = {}) {
        return this.request('products', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetNomicsTrades(params = {}) {
        return this.request('nomics/trades', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetMdKline(params = {}) {
        return this.request('md/kline', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetMdV2KlineList(params = {}) {
        return this.request('md/v2/kline/list', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetMdV2Kline(params = {}) {
        return this.request('md/v2/kline', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetMdV2KlineLast(params = {}) {
        return this.request('md/v2/kline/last', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetMdOrderbook(params = {}) {
        return this.request('md/orderbook', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetMdTrade(params = {}) {
        return this.request('md/trade', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetMdSpotTicker24hr(params = {}) {
        return this.request('md/spot/ticker/24hr', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetExchangePublicCfgChainSettings(params = {}) {
        return this.request('exchange/public/cfg/chain-settings', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v1GetMdFullbook(params = {}) {
        return this.request('md/fullbook', ['v1'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v1GetMdOrderbook(params = {}) {
        return this.request('md/orderbook', ['v1'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v1GetMdTrade(params = {}) {
        return this.request('md/trade', ['v1'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v1GetMdTicker24hr(params = {}) {
        return this.request('md/ticker/24hr', ['v1'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v1GetMdTicker24hrAll(params = {}) {
        return this.request('md/ticker/24hr/all', ['v1'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v1GetMdSpotTicker24hr(params = {}) {
        return this.request('md/spot/ticker/24hr', ['v1'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v1GetMdSpotTicker24hrAll(params = {}) {
        return this.request('md/spot/ticker/24hr/all', ['v1'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v1GetExchangePublicProducts(params = {}) {
        return this.request('exchange/public/products', ['v1'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v1GetApiDataPublicDataFundingRateHistory(params = {}) {
        return this.request('api-data/public/data/funding-rate-history', ['v1'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v2GetPublicProducts(params = {}) {
        return this.request('public/products', ['v2'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v2GetPublicProductsPlus(params = {}) {
        return this.request('public/products-plus', ['v2'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v2GetPublicIndexSources(params = {}) {
        return this.request('public/index-sources', ['v2'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v2GetMdV2Orderbook(params = {}) {
        return this.request('md/v2/orderbook', ['v2'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v2GetMdV2Trade(params = {}) {
        return this.request('md/v2/trade', ['v2'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v2GetMdV2Ticker24hr(params = {}) {
        return this.request('md/v2/ticker/24hr', ['v2'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v2GetMdV2Ticker24hrAll(params = {}) {
        return this.request('md/v2/ticker/24hr/all', ['v2'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    v2GetApiDataPublicDataFundingRateHistory(params = {}) {
        return this.request('api-data/public/data/funding-rate-history', ['v2'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetSpotOrdersActive(params = {}) {
        return this.request('spot/orders/active', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetSpotOrders(params = {}) {
        return this.request('spot/orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetSpotWallets(params = {}) {
        return this.request('spot/wallets', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetExchangeSpotOrder(params = {}) {
        return this.request('exchange/spot/order', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetExchangeSpotOrderTrades(params = {}) {
        return this.request('exchange/spot/order/trades', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetExchangeOrderV2OrderList(params = {}) {
        return this.request('exchange/order/v2/orderList', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetExchangeOrderV2TradingList(params = {}) {
        return this.request('exchange/order/v2/tradingList', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetAccountsAccountPositions(params = {}) {
        return this.request('accounts/accountPositions', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGAccountsAccountPositions(params = {}) {
        return this.request('g-accounts/accountPositions', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetGAccountsPositions(params = {}) {
        return this.request('g-accounts/positions', ['private'], 'GET', params, undefined, undefined, { 'cost': 25 });
    }
    privateGetGAccountsRiskUnit(params = {}) {
        return this.request('g-accounts/risk-unit', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetApiDataFuturesFundingFees(params = {}) {
        return this.request('api-data/futures/funding-fees', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataGFuturesFundingFees(params = {}) {
        return this.request('api-data/g-futures/funding-fees', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataFuturesOrders(params = {}) {
        return this.request('api-data/futures/orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataGFuturesOrders(params = {}) {
        return this.request('api-data/g-futures/orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataFuturesOrdersByOrderId(params = {}) {
        return this.request('api-data/futures/orders/by-order-id', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataGFuturesOrdersByOrderId(params = {}) {
        return this.request('api-data/g-futures/orders/by-order-id', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataFuturesTrades(params = {}) {
        return this.request('api-data/futures/trades', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataGFuturesTrades(params = {}) {
        return this.request('api-data/g-futures/trades', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataFuturesTradingFees(params = {}) {
        return this.request('api-data/futures/trading-fees', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataGFuturesTradingFees(params = {}) {
        return this.request('api-data/g-futures/trading-fees', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataFuturesV2TradeAccountDetail(params = {}) {
        return this.request('api-data/futures/v2/tradeAccountDetail', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataGFuturesClosedPosition(params = {}) {
        return this.request('api-data/g-futures/closedPosition', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetGOrdersActiveList(params = {}) {
        return this.request('g-orders/activeList', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetOrdersActiveList(params = {}) {
        return this.request('orders/activeList', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetExchangeOrderList(params = {}) {
        return this.request('exchange/order/list', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetExchangeOrder(params = {}) {
        return this.request('exchange/order', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetExchangeOrderTrade(params = {}) {
        return this.request('exchange/order/trade', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetPhemexUserUsersChildren(params = {}) {
        return this.request('phemex-user/users/children', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetPhemexUserWalletsV2DepositAddress(params = {}) {
        return this.request('phemex-user/wallets/v2/depositAddress', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetPhemexUserWalletsTradeAccountDetail(params = {}) {
        return this.request('phemex-user/wallets/tradeAccountDetail', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetPhemexDepositWalletsApiDepositAddress(params = {}) {
        return this.request('phemex-deposit/wallets/api/depositAddress', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetPhemexDepositWalletsApiDepositHist(params = {}) {
        return this.request('phemex-deposit/wallets/api/depositHist', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetPhemexDepositWalletsApiChainCfg(params = {}) {
        return this.request('phemex-deposit/wallets/api/chainCfg', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetPhemexWithdrawWalletsApiWithdrawHist(params = {}) {
        return this.request('phemex-withdraw/wallets/api/withdrawHist', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetPhemexWithdrawWalletsApiAssetInfo(params = {}) {
        return this.request('phemex-withdraw/wallets/api/asset/info', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetPhemexUserOrderClosedPositionList(params = {}) {
        return this.request('phemex-user/order/closedPositionList', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetExchangeMarginsTransfer(params = {}) {
        return this.request('exchange/margins/transfer', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetExchangeWalletsConfirmWithdraw(params = {}) {
        return this.request('exchange/wallets/confirm/withdraw', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetExchangeWalletsWithdrawList(params = {}) {
        return this.request('exchange/wallets/withdrawList', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetExchangeWalletsDepositList(params = {}) {
        return this.request('exchange/wallets/depositList', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetExchangeWalletsV2DepositAddress(params = {}) {
        return this.request('exchange/wallets/v2/depositAddress', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataSpotsFunds(params = {}) {
        return this.request('api-data/spots/funds', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataSpotsOrders(params = {}) {
        return this.request('api-data/spots/orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataSpotsOrdersByOrderId(params = {}) {
        return this.request('api-data/spots/orders/by-order-id', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataSpotsPnls(params = {}) {
        return this.request('api-data/spots/pnls', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataSpotsTrades(params = {}) {
        return this.request('api-data/spots/trades', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetApiDataSpotsTradesByOrderId(params = {}) {
        return this.request('api-data/spots/trades/by-order-id', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetAssetsConvert(params = {}) {
        return this.request('assets/convert', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetAssetsTransfer(params = {}) {
        return this.request('assets/transfer', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetAssetsSpotsSubAccountsTransfer(params = {}) {
        return this.request('assets/spots/sub-accounts/transfer', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetAssetsFuturesSubAccountsTransfer(params = {}) {
        return this.request('assets/futures/sub-accounts/transfer', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetAssetsQuote(params = {}) {
        return this.request('assets/quote', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetPhemexLbPublicApiTraderPerformanceInfo(params = {}) {
        return this.request('phemex-lb/public/api/trader/performance-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetUtaApiRiskRiskMode(params = {}) {
        return this.request('uta-api/risk/risk-mode', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetUtaApiRiskRiskUnits(params = {}) {
        return this.request('uta-api/risk/risk-units', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetUtaBizAssets(params = {}) {
        return this.request('uta-biz/assets', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetUtaFundsContractBorrow(params = {}) {
        return this.request('uta-funds/contract/borrow', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetUtaFundsContractPayback(params = {}) {
        return this.request('uta-funds/contract/payback', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetUtaFundsContractBorrowInterests(params = {}) {
        return this.request('uta-funds/contract/borrow/interests', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetUtaExchangerAssetsConvert(params = {}) {
        return this.request('uta-exchanger/assets/convert', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostSpotOrders(params = {}) {
        return this.request('spot/orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostOrders(params = {}) {
        return this.request('orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostGOrders(params = {}) {
        return this.request('g-orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostPositionsAssign(params = {}) {
        return this.request('positions/assign', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostExchangeWalletsTransferOut(params = {}) {
        return this.request('exchange/wallets/transferOut', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostExchangeWalletsTransferIn(params = {}) {
        return this.request('exchange/wallets/transferIn', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostExchangeMargins(params = {}) {
        return this.request('exchange/margins', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostExchangeWalletsCreateWithdraw(params = {}) {
        return this.request('exchange/wallets/createWithdraw', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostExchangeWalletsCancelWithdraw(params = {}) {
        return this.request('exchange/wallets/cancelWithdraw', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostExchangeWalletsCreateWithdrawAddress(params = {}) {
        return this.request('exchange/wallets/createWithdrawAddress', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostAssetsTransfer(params = {}) {
        return this.request('assets/transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostAssetsSpotsSubAccountsTransfer(params = {}) {
        return this.request('assets/spots/sub-accounts/transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostAssetsFuturesSubAccountsTransfer(params = {}) {
        return this.request('assets/futures/sub-accounts/transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostAssetsUniversalTransfer(params = {}) {
        return this.request('assets/universal-transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostAssetsConvert(params = {}) {
        return this.request('assets/convert', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostPhemexWithdrawWalletsApiCreateWithdraw(params = {}) {
        return this.request('phemex-withdraw/wallets/api/createWithdraw', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostPhemexWithdrawWalletsApiCancelWithdraw(params = {}) {
        return this.request('phemex-withdraw/wallets/api/cancelWithdraw', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostUtaAccountSwitchMode(params = {}) {
        return this.request('uta-account/switch-mode', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostUtaFundsContractPayback(params = {}) {
        return this.request('uta-funds/contract/payback', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePutSpotOrdersCreate(params = {}) {
        return this.request('spot/orders/create', ['private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    privatePutSpotOrders(params = {}) {
        return this.request('spot/orders', ['private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    privatePutOrdersReplace(params = {}) {
        return this.request('orders/replace', ['private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    privatePutGOrdersReplace(params = {}) {
        return this.request('g-orders/replace', ['private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    privatePutGOrdersCreate(params = {}) {
        return this.request('g-orders/create', ['private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    privatePutPositionsLeverage(params = {}) {
        return this.request('positions/leverage', ['private'], 'PUT', params, undefined, undefined, { 'cost': 5 });
    }
    privatePutGPositionsLeverage(params = {}) {
        return this.request('g-positions/leverage', ['private'], 'PUT', params, undefined, undefined, { 'cost': 5 });
    }
    privatePutGPositionsSwitchPosModeSync(params = {}) {
        return this.request('g-positions/switch-pos-mode-sync', ['private'], 'PUT', params, undefined, undefined, { 'cost': 5 });
    }
    privatePutPositionsRiskLimit(params = {}) {
        return this.request('positions/riskLimit', ['private'], 'PUT', params, undefined, undefined, { 'cost': 5 });
    }
    privateDeleteSpotOrders(params = {}) {
        return this.request('spot/orders', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 2 });
    }
    privateDeleteSpotOrdersAll(params = {}) {
        return this.request('spot/orders/all', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 2 });
    }
    privateDeleteOrdersCancel(params = {}) {
        return this.request('orders/cancel', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteOrders(params = {}) {
        return this.request('orders', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteOrdersAll(params = {}) {
        return this.request('orders/all', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 3 });
    }
    privateDeleteGOrdersCancel(params = {}) {
        return this.request('g-orders/cancel', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteGOrders(params = {}) {
        return this.request('g-orders', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    privateDeleteGOrdersAll(params = {}) {
        return this.request('g-orders/all', ['private'], 'DELETE', params, undefined, undefined, { 'cost': 3 });
    }
}

exports["default"] = Exchange;
