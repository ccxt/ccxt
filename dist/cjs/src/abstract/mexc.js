'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    spotPublicGetAnnouncements(params = {}) {
        return this.request('announcements', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 8 });
    }
    spotPublicGetPing(params = {}) {
        return this.request('ping', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetTime(params = {}) {
        return this.request('time', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetDefaultSymbols(params = {}) {
        return this.request('defaultSymbols', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetSymbolOffline(params = {}) {
        return this.request('symbol/offline', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    spotPublicGetExchangeInfo(params = {}) {
        return this.request('exchangeInfo', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 25 });
    }
    spotPublicGetDepth(params = {}) {
        return this.request('depth', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    spotPublicGetTrades(params = {}) {
        return this.request('trades', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    spotPublicGetHistoricalTrades(params = {}) {
        return this.request('historicalTrades', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetAggTrades(params = {}) {
        return this.request('aggTrades', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetKlines(params = {}) {
        return this.request('klines', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetAvgPrice(params = {}) {
        return this.request('avgPrice', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPublicGetTicker24hr(params = {}) {
        return this.request('ticker/24hr', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 25 });
    }
    spotPublicGetTickerPrice(params = {}) {
        return this.request('ticker/price', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    spotPublicGetTickerBookTicker(params = {}) {
        return this.request('ticker/bookTicker', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    spotPublicGetEtfInfo(params = {}) {
        return this.request('etf/info', ['spot', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetKycStatus(params = {}) {
        return this.request('kyc/status', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetUid(params = {}) {
        return this.request('uid', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetApiKeyInfo(params = {}) {
        return this.request('apiKeyInfo', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetOrder(params = {}) {
        return this.request('order', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    spotPrivateGetOpenOrders(params = {}) {
        return this.request('openOrders', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 3 });
    }
    spotPrivateGetAllOrders(params = {}) {
        return this.request('allOrders', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivateGetAccount(params = {}) {
        return this.request('account', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivateGetMyTrades(params = {}) {
        return this.request('myTrades', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivateGetStrategyGroup(params = {}) {
        return this.request('strategy/group', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    spotPrivateGetStrategyGroupUid(params = {}) {
        return this.request('strategy/group/uid', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    spotPrivateGetTradeFee(params = {}) {
        return this.request('tradeFee', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 20 });
    }
    spotPrivateGetSubAccountList(params = {}) {
        return this.request('sub-account/list', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetSubAccountApiKey(params = {}) {
        return this.request('sub-account/apiKey', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetSubAccountAsset(params = {}) {
        return this.request('sub-account/asset', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetCapitalConfigGetall(params = {}) {
        return this.request('capital/config/getall', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivateGetCapitalDepositHisrec(params = {}) {
        return this.request('capital/deposit/hisrec', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivateGetCapitalWithdrawHistory(params = {}) {
        return this.request('capital/withdraw/history', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetCapitalWithdrawAddress(params = {}) {
        return this.request('capital/withdraw/address', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivateGetCapitalDepositAddress(params = {}) {
        return this.request('capital/deposit/address', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivateGetCapitalTransfer(params = {}) {
        return this.request('capital/transfer', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetCapitalTransferTranId(params = {}) {
        return this.request('capital/transfer/tranId', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetCapitalTransferInternal(params = {}) {
        return this.request('capital/transfer/internal', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetCapitalSubAccountUniversalTransfer(params = {}) {
        return this.request('capital/sub-account/universalTransfer', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetCapitalConvert(params = {}) {
        return this.request('capital/convert', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetCapitalConvertList(params = {}) {
        return this.request('capital/convert/list', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetMarginLoan(params = {}) {
        return this.request('margin/loan', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetMarginAllOrders(params = {}) {
        return this.request('margin/allOrders', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetMarginMyTrades(params = {}) {
        return this.request('margin/myTrades', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetMarginOpenOrders(params = {}) {
        return this.request('margin/openOrders', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetMarginMaxTransferable(params = {}) {
        return this.request('margin/maxTransferable', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetMarginPriceIndex(params = {}) {
        return this.request('margin/priceIndex', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetMarginOrder(params = {}) {
        return this.request('margin/order', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetMarginIsolatedAccount(params = {}) {
        return this.request('margin/isolated/account', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetMarginMaxBorrowable(params = {}) {
        return this.request('margin/maxBorrowable', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetMarginRepay(params = {}) {
        return this.request('margin/repay', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetMarginIsolatedPair(params = {}) {
        return this.request('margin/isolated/pair', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetMarginForceLiquidationRec(params = {}) {
        return this.request('margin/forceLiquidationRec', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetMarginIsolatedMarginData(params = {}) {
        return this.request('margin/isolatedMarginData', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetMarginIsolatedMarginTier(params = {}) {
        return this.request('margin/isolatedMarginTier', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetRebateTaxQuery(params = {}) {
        return this.request('rebate/taxQuery', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetRebateDetail(params = {}) {
        return this.request('rebate/detail', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetRebateDetailKickback(params = {}) {
        return this.request('rebate/detail/kickback', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetRebateReferCode(params = {}) {
        return this.request('rebate/referCode', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetRebateAffiliateCommission(params = {}) {
        return this.request('rebate/affiliate/commission', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetRebateAffiliateWithdraw(params = {}) {
        return this.request('rebate/affiliate/withdraw', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetRebateAffiliateCommissionDetail(params = {}) {
        return this.request('rebate/affiliate/commission/detail', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetRebateAffiliateCampaign(params = {}) {
        return this.request('rebate/affiliate/campaign', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetRebateAffiliateReferral(params = {}) {
        return this.request('rebate/affiliate/referral', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetRebateAffiliateSubaffiliates(params = {}) {
        return this.request('rebate/affiliate/subaffiliates', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetRebateAffiliateList(params = {}) {
        return this.request('rebate/affiliate/list', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetMxDeductEnable(params = {}) {
        return this.request('mxDeduct/enable', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetUserDataStream(params = {}) {
        return this.request('userDataStream', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetSelfSymbols(params = {}) {
        return this.request('selfSymbols', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateGetAssetInternalTransferRecord(params = {}) {
        return this.request('asset/internal/transfer/record', ['spot', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivatePostOrder(params = {}) {
        return this.request('order', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostOrderTest(params = {}) {
        return this.request('order/test', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostApiKeyInfo(params = {}) {
        return this.request('apiKeyInfo', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostSubAccountVirtualSubAccount(params = {}) {
        return this.request('sub-account/virtualSubAccount', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostSubAccountApiKey(params = {}) {
        return this.request('sub-account/apiKey', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostSubAccountFutures(params = {}) {
        return this.request('sub-account/futures', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostSubAccountMargin(params = {}) {
        return this.request('sub-account/margin', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostBatchOrders(params = {}) {
        return this.request('batchOrders', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivatePostStrategyGroup(params = {}) {
        return this.request('strategy/group', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    spotPrivatePostStrategyGroupUid(params = {}) {
        return this.request('strategy/group/uid', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 20 });
    }
    spotPrivatePostCapitalWithdrawApply(params = {}) {
        return this.request('capital/withdraw/apply', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostCapitalWithdraw(params = {}) {
        return this.request('capital/withdraw', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostCapitalTransfer(params = {}) {
        return this.request('capital/transfer', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    spotPrivatePostCapitalTransferInternal(params = {}) {
        return this.request('capital/transfer/internal', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostCapitalDepositAddress(params = {}) {
        return this.request('capital/deposit/address', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostCapitalSubAccountUniversalTransfer(params = {}) {
        return this.request('capital/sub-account/universalTransfer', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostCapitalConvert(params = {}) {
        return this.request('capital/convert', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    spotPrivatePostMxDeductEnable(params = {}) {
        return this.request('mxDeduct/enable', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePostUserDataStream(params = {}) {
        return this.request('userDataStream', ['spot', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivatePutUserDataStream(params = {}) {
        return this.request('userDataStream', ['spot', 'private'], 'PUT', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateDeleteOrder(params = {}) {
        return this.request('order', ['spot', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateDeleteOpenOrders(params = {}) {
        return this.request('openOrders', ['spot', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateDeleteOrderAll(params = {}) {
        return this.request('order/all', ['spot', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateDeleteSubAccountApiKey(params = {}) {
        return this.request('sub-account/apiKey', ['spot', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateDeleteStrategyGroup(params = {}) {
        return this.request('strategy/group', ['spot', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateDeleteStrategyGroupUid(params = {}) {
        return this.request('strategy/group/uid', ['spot', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateDeleteMarginOrder(params = {}) {
        return this.request('margin/order', ['spot', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateDeleteMarginOpenOrders(params = {}) {
        return this.request('margin/openOrders', ['spot', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateDeleteUserDataStream(params = {}) {
        return this.request('userDataStream', ['spot', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    spotPrivateDeleteCapitalWithdraw(params = {}) {
        return this.request('capital/withdraw', ['spot', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    contractPublicGetPing(params = {}) {
        return this.request('ping', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPublicGetDetail(params = {}) {
        return this.request('detail', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 100 });
    }
    contractPublicGetSupportCurrencies(params = {}) {
        return this.request('support_currencies', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPublicGetDepthSymbol(params = {}) {
        return this.request('depth/{symbol}', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPublicGetDepthCommitsSymbolLimit(params = {}) {
        return this.request('depth_commits/{symbol}/{limit}', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPublicGetIndexPriceSymbol(params = {}) {
        return this.request('index_price/{symbol}', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPublicGetFairPriceSymbol(params = {}) {
        return this.request('fair_price/{symbol}', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPublicGetFundingRateSymbol(params = {}) {
        return this.request('funding_rate/{symbol}', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPublicGetKlineSymbol(params = {}) {
        return this.request('kline/{symbol}', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPublicGetKlineIndexPriceSymbol(params = {}) {
        return this.request('kline/index_price/{symbol}', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPublicGetKlineFairPriceSymbol(params = {}) {
        return this.request('kline/fair_price/{symbol}', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPublicGetDealsSymbol(params = {}) {
        return this.request('deals/{symbol}', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPublicGetTicker(params = {}) {
        return this.request('ticker', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPublicGetRiskReverse(params = {}) {
        return this.request('risk_reverse', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPublicGetRiskReverseHistory(params = {}) {
        return this.request('risk_reverse/history', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPublicGetFundingRateHistory(params = {}) {
        return this.request('funding_rate/history', ['contract', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountAssets(params = {}) {
        return this.request('account/assets', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountAssetCurrency(params = {}) {
        return this.request('account/asset/{currency}', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountTransferRecord(params = {}) {
        return this.request('account/transfer_record', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountProfitRateType(params = {}) {
        return this.request('account/profit_rate/{type}', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountAssetAnalysisType(params = {}) {
        return this.request('account/asset/analysis/{type}', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountFeeDeductConfigs(params = {}) {
        return this.request('account/feeDeductConfigs', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountAssetAnalysisYesterdayPnl(params = {}) {
        return this.request('account/asset/analysis/yesterday_pnl', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountAssetAnalysisTodayPnl(params = {}) {
        return this.request('account/asset/analysis/today_pnl', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountConfigContractFeeDiscountConfig(params = {}) {
        return this.request('account/config/contractFeeDiscountConfig', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetOrderFeeDetails(params = {}) {
        return this.request('order/fee_details', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountDiscountType(params = {}) {
        return this.request('account/discountType', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountAssetAnalysisExport(params = {}) {
        return this.request('account/asset/analysis/export', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountAssetBookOrderDealFeeTotal(params = {}) {
        return this.request('account/asset_book/order_deal_fee/total', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountContractFeeRate(params = {}) {
        return this.request('account/contract/fee_rate', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountContractZeroFeeRate(params = {}) {
        return this.request('account/contract/zero_fee_rate', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetPositionListHistoryPositions(params = {}) {
        return this.request('position/list/history_positions', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetPositionOpenPositions(params = {}) {
        return this.request('position/open_positions', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetPositionFundingRecords(params = {}) {
        return this.request('position/funding_records', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetPositionPositionMode(params = {}) {
        return this.request('position/position_mode', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetOrderListOpenOrdersSymbol(params = {}) {
        return this.request('order/list/open_orders/{symbol}', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetOrderListOpenOrders(params = {}) {
        return this.request('order/list/open_orders', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetOrderListHistoryOrders(params = {}) {
        return this.request('order/list/history_orders', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetOrderListOrderDealsV3(params = {}) {
        return this.request('order/list/order_deals/v3', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetOrderExternalSymbolExternalOid(params = {}) {
        return this.request('order/external/{symbol}/{external_oid}', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetOrderGetOrderId(params = {}) {
        return this.request('order/get/{order_id}', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetOrderBatchQuery(params = {}) {
        return this.request('order/batch_query', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 8 });
    }
    contractPrivateGetOrderDealDetailsOrderId(params = {}) {
        return this.request('order/deal_details/{order_id}', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetOrderListOrderDeals(params = {}) {
        return this.request('order/list/order_deals', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetOrderListCloseOrders(params = {}) {
        return this.request('order/list/close_orders', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetPlanorderListOrders(params = {}) {
        return this.request('planorder/list/orders', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetStoporderListOrders(params = {}) {
        return this.request('stoporder/list/orders', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetStoporderOpenOrders(params = {}) {
        return this.request('stoporder/open_orders', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetStoporderOrderDetailsStopOrderId(params = {}) {
        return this.request('stoporder/order_details/{stop_order_id}', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountRiskLimit(params = {}) {
        return this.request('account/risk_limit', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountTieredFeeRate(params = {}) {
        return this.request('account/tiered_fee_rate', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetPositionLeverage(params = {}) {
        return this.request('position/leverage', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetAccountTieredFeeRateV2(params = {}) {
        return this.request('account/tiered_fee_rate/v2', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetTrackorderListOrders(params = {}) {
        return this.request('trackorder/list/orders', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetMarketMakerSelfTradeBlacklist(params = {}) {
        return this.request('market_maker/self_trade/blacklist', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivateGetMarketMakerSelfTradeBlacklistSearch(params = {}) {
        return this.request('market_maker/self_trade/blacklist/search', ['contract', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostAccountAssetAnalysisV3(params = {}) {
        return this.request('account/asset/analysis/v3', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostAccountAssetAnalysisCalendarDailyV3(params = {}) {
        return this.request('account/asset/analysis/calendar/daily/v3', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostAccountAssetAnalysisCalendarMonthlyV3(params = {}) {
        return this.request('account/asset/analysis/calendar/monthly/v3', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostAccountAssetAnalysisRecentV3(params = {}) {
        return this.request('account/asset/analysis/recent/v3', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostPositionChangeMargin(params = {}) {
        return this.request('position/change_margin', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostPositionChangeAutoAddIm(params = {}) {
        return this.request('position/change_auto_add_im', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostPositionChangeLeverage(params = {}) {
        return this.request('position/change_leverage', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostPositionChangePositionMode(params = {}) {
        return this.request('position/change_position_mode', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostPositionReverse(params = {}) {
        return this.request('position/reverse', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostPositionCloseAll(params = {}) {
        return this.request('position/close_all', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    contractPrivatePostOrderCreate(params = {}) {
        return this.request('order/create', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostOrderSubmit(params = {}) {
        return this.request('order/submit', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostOrderSubmitBatch(params = {}) {
        return this.request('order/submit_batch', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    contractPrivatePostOrderChaseLimitOrder(params = {}) {
        return this.request('order/chase_limit_order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    contractPrivatePostOrderChangeLimitOrder(params = {}) {
        return this.request('order/change_limit_order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    contractPrivatePostOrderCancel(params = {}) {
        return this.request('order/cancel', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostOrderBatchCancelWithExternal(params = {}) {
        return this.request('order/batch_cancel_with_external', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostOrderCancelWithExternal(params = {}) {
        return this.request('order/cancel_with_external', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostOrderCancelAll(params = {}) {
        return this.request('order/cancel_all', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostOrderOpenOrderTotalCount(params = {}) {
        return this.request('order/open_order_total_count', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostOrderBatchQueryWithExternal(params = {}) {
        return this.request('order/batch_query_with_external', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostAccountChangeRiskLevel(params = {}) {
        return this.request('account/change_risk_level', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostPlanorderPlace(params = {}) {
        return this.request('planorder/place', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostPlanorderPlaceV2(params = {}) {
        return this.request('planorder/place/v2', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostPlanorderCancel(params = {}) {
        return this.request('planorder/cancel', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostPlanorderCancelAll(params = {}) {
        return this.request('planorder/cancel_all', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostPlanorderChangeStopOrder(params = {}) {
        return this.request('planorder/change_stop_order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostStoporderPlace(params = {}) {
        return this.request('stoporder/place', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostStoporderCancel(params = {}) {
        return this.request('stoporder/cancel', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostStoporderCancelAll(params = {}) {
        return this.request('stoporder/cancel_all', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostStoporderChangePrice(params = {}) {
        return this.request('stoporder/change_price', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostStoporderChangePlanPrice(params = {}) {
        return this.request('stoporder/change_plan_price', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostTrackorderPlace(params = {}) {
        return this.request('trackorder/place', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostTrackorderCancel(params = {}) {
        return this.request('trackorder/cancel', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostTrackorderChangeOrder(params = {}) {
        return this.request('trackorder/change_order', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostMarketMakerSelfTradeBlacklistCreate(params = {}) {
        return this.request('market_maker/self_trade/blacklist/create', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostMarketMakerSelfTradeBlacklistUpdate(params = {}) {
        return this.request('market_maker/self_trade/blacklist/update', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    contractPrivatePostMarketMakerSelfTradeBlacklistDelete(params = {}) {
        return this.request('market_maker/self_trade/blacklist/delete', ['contract', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    spot2PublicGetMarketSymbols(params = {}) {
        return this.request('market/symbols', ['spot2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PublicGetMarketCoinList(params = {}) {
        return this.request('market/coin/list', ['spot2', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    spot2PublicGetCommonTimestamp(params = {}) {
        return this.request('common/timestamp', ['spot2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PublicGetCommonPing(params = {}) {
        return this.request('common/ping', ['spot2', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    spot2PublicGetMarketTicker(params = {}) {
        return this.request('market/ticker', ['spot2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PublicGetMarketDepth(params = {}) {
        return this.request('market/depth', ['spot2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PublicGetMarketDeals(params = {}) {
        return this.request('market/deals', ['spot2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PublicGetMarketKline(params = {}) {
        return this.request('market/kline', ['spot2', 'public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PublicGetMarketApiDefaultSymbols(params = {}) {
        return this.request('market/api_default_symbols', ['spot2', 'public'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    spot2PrivateGetAccountInfo(params = {}) {
        return this.request('account/info', ['spot2', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PrivateGetOrderOpenOrders(params = {}) {
        return this.request('order/open_orders', ['spot2', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PrivateGetOrderList(params = {}) {
        return this.request('order/list', ['spot2', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PrivateGetOrderQuery(params = {}) {
        return this.request('order/query', ['spot2', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PrivateGetOrderDeals(params = {}) {
        return this.request('order/deals', ['spot2', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PrivateGetOrderDealDetail(params = {}) {
        return this.request('order/deal_detail', ['spot2', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PrivateGetAssetDepositAddressList(params = {}) {
        return this.request('asset/deposit/address/list', ['spot2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    spot2PrivateGetAssetDepositList(params = {}) {
        return this.request('asset/deposit/list', ['spot2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    spot2PrivateGetAssetAddressList(params = {}) {
        return this.request('asset/address/list', ['spot2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    spot2PrivateGetAssetWithdrawList(params = {}) {
        return this.request('asset/withdraw/list', ['spot2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    spot2PrivateGetAssetInternalTransferRecord(params = {}) {
        return this.request('asset/internal/transfer/record', ['spot2', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    spot2PrivateGetAccountBalance(params = {}) {
        return this.request('account/balance', ['spot2', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    spot2PrivateGetAssetInternalTransferInfo(params = {}) {
        return this.request('asset/internal/transfer/info', ['spot2', 'private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    spot2PrivateGetMarketApiSymbols(params = {}) {
        return this.request('market/api_symbols', ['spot2', 'private'], 'GET', params, undefined, undefined, { 'cost': 2 });
    }
    spot2PrivatePostOrderPlace(params = {}) {
        return this.request('order/place', ['spot2', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PrivatePostOrderPlaceBatch(params = {}) {
        return this.request('order/place_batch', ['spot2', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PrivatePostOrderAdvancedPlaceBatch(params = {}) {
        return this.request('order/advanced/place_batch', ['spot2', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PrivatePostAssetWithdraw(params = {}) {
        return this.request('asset/withdraw', ['spot2', 'private'], 'POST', params, undefined, undefined, { 'cost': 2 });
    }
    spot2PrivatePostAssetInternalTransfer(params = {}) {
        return this.request('asset/internal/transfer', ['spot2', 'private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    spot2PrivateDeleteOrderCancel(params = {}) {
        return this.request('order/cancel', ['spot2', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PrivateDeleteOrderCancelBySymbol(params = {}) {
        return this.request('order/cancel_by_symbol', ['spot2', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
    spot2PrivateDeleteAssetWithdraw(params = {}) {
        return this.request('asset/withdraw', ['spot2', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 2 });
    }
    brokerPrivateGetSubAccountUniversalTransfer(params = {}) {
        return this.request('sub-account/universalTransfer', ['broker', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    brokerPrivateGetSubAccountList(params = {}) {
        return this.request('sub-account/list', ['broker', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    brokerPrivateGetSubAccountStatus(params = {}) {
        return this.request('sub-account/status', ['broker', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    brokerPrivateGetSubAccountApiKey(params = {}) {
        return this.request('sub-account/apiKey', ['broker', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    brokerPrivateGetCapitalDepositSubAddress(params = {}) {
        return this.request('capital/deposit/subAddress', ['broker', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    brokerPrivateGetCapitalDepositSubHisrec(params = {}) {
        return this.request('capital/deposit/subHisrec', ['broker', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    brokerPrivateGetCapitalDepositSubHisrecGetall(params = {}) {
        return this.request('capital/deposit/subHisrec/getall', ['broker', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    brokerPrivateGetRebateTaxQuery(params = {}) {
        return this.request('rebate/taxQuery', ['broker', 'private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    brokerPrivatePostSubAccountVirtualSubAccount(params = {}) {
        return this.request('sub-account/virtualSubAccount', ['broker', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    brokerPrivatePostSubAccountApiKey(params = {}) {
        return this.request('sub-account/apiKey', ['broker', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    brokerPrivatePostCapitalDepositSubAddress(params = {}) {
        return this.request('capital/deposit/subAddress', ['broker', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    brokerPrivatePostCapitalWithdrawApply(params = {}) {
        return this.request('capital/withdraw/apply', ['broker', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    brokerPrivatePostSubAccountUniversalTransfer(params = {}) {
        return this.request('sub-account/universalTransfer', ['broker', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    brokerPrivatePostSubAccountFutures(params = {}) {
        return this.request('sub-account/futures', ['broker', 'private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    brokerPrivateDeleteSubAccountApiKey(params = {}) {
        return this.request('sub-account/apiKey', ['broker', 'private'], 'DELETE', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
