'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var bybit$1 = require('../bybit.js');

// ----------------------------------------------------------------------------
class bybit extends bybit$1["default"] {
    publicGetSpotV3PublicSymbols(params = {}) {
        return this.request('spot/v3/public/symbols', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSpotV3PublicQuoteDepth(params = {}) {
        return this.request('spot/v3/public/quote/depth', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSpotV3PublicQuoteDepthMerged(params = {}) {
        return this.request('spot/v3/public/quote/depth/merged', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSpotV3PublicQuoteTrades(params = {}) {
        return this.request('spot/v3/public/quote/trades', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSpotV3PublicQuoteKline(params = {}) {
        return this.request('spot/v3/public/quote/kline', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSpotV3PublicQuoteTicker24hr(params = {}) {
        return this.request('spot/v3/public/quote/ticker/24hr', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSpotV3PublicQuoteTickerPrice(params = {}) {
        return this.request('spot/v3/public/quote/ticker/price', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSpotV3PublicQuoteTickerBookTicker(params = {}) {
        return this.request('spot/v3/public/quote/ticker/bookTicker', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSpotV3PublicServerTime(params = {}) {
        return this.request('spot/v3/public/server-time', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSpotV3PublicInfos(params = {}) {
        return this.request('spot/v3/public/infos', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSpotV3PublicMarginProductInfos(params = {}) {
        return this.request('spot/v3/public/margin-product-infos', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetSpotV3PublicMarginEnsureTokens(params = {}) {
        return this.request('spot/v3/public/margin-ensure-tokens', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV3PublicTime(params = {}) {
        return this.request('v3/public/time', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetContractV3PublicCopytradingSymbolList(params = {}) {
        return this.request('contract/v3/public/copytrading/symbol/list', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetDerivativesV3PublicOrderBookL2(params = {}) {
        return this.request('derivatives/v3/public/order-book/L2', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetDerivativesV3PublicKline(params = {}) {
        return this.request('derivatives/v3/public/kline', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetDerivativesV3PublicTickers(params = {}) {
        return this.request('derivatives/v3/public/tickers', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetDerivativesV3PublicInstrumentsInfo(params = {}) {
        return this.request('derivatives/v3/public/instruments-info', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetDerivativesV3PublicMarkPriceKline(params = {}) {
        return this.request('derivatives/v3/public/mark-price-kline', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetDerivativesV3PublicIndexPriceKline(params = {}) {
        return this.request('derivatives/v3/public/index-price-kline', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetDerivativesV3PublicFundingHistoryFundingRate(params = {}) {
        return this.request('derivatives/v3/public/funding/history-funding-rate', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetDerivativesV3PublicRiskLimitList(params = {}) {
        return this.request('derivatives/v3/public/risk-limit/list', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetDerivativesV3PublicDeliveryPrice(params = {}) {
        return this.request('derivatives/v3/public/delivery-price', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetDerivativesV3PublicRecentTrade(params = {}) {
        return this.request('derivatives/v3/public/recent-trade', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetDerivativesV3PublicOpenInterest(params = {}) {
        return this.request('derivatives/v3/public/open-interest', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetDerivativesV3PublicInsurance(params = {}) {
        return this.request('derivatives/v3/public/insurance', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetV5AnnouncementsIndex(params = {}) {
        return this.request('v5/announcements/index', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5SystemStatus(params = {}) {
        return this.request('v5/system/status', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketTime(params = {}) {
        return this.request('v5/market/time', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketKline(params = {}) {
        return this.request('v5/market/kline', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketMarkPriceKline(params = {}) {
        return this.request('v5/market/mark-price-kline', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketIndexPriceKline(params = {}) {
        return this.request('v5/market/index-price-kline', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketPremiumIndexPriceKline(params = {}) {
        return this.request('v5/market/premium-index-price-kline', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketInstrumentsInfo(params = {}) {
        return this.request('v5/market/instruments-info', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketOrderbook(params = {}) {
        return this.request('v5/market/orderbook', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketRpiOrderbook(params = {}) {
        return this.request('v5/market/rpi_orderbook', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketFullOrderbook(params = {}) {
        return this.request('v5/market/full_orderbook', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketTickers(params = {}) {
        return this.request('v5/market/tickers', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketFundingHistory(params = {}) {
        return this.request('v5/market/funding/history', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketRecentTrade(params = {}) {
        return this.request('v5/market/recent-trade', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketOpenInterest(params = {}) {
        return this.request('v5/market/open-interest', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketHistoricalVolatility(params = {}) {
        return this.request('v5/market/historical-volatility', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketInsurance(params = {}) {
        return this.request('v5/market/insurance', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketRiskLimit(params = {}) {
        return this.request('v5/market/risk-limit', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketDeliveryPrice(params = {}) {
        return this.request('v5/market/delivery-price', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketNewDeliveryPrice(params = {}) {
        return this.request('v5/market/new-delivery-price', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketAccountRatio(params = {}) {
        return this.request('v5/market/account-ratio', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketIndexPriceComponents(params = {}) {
        return this.request('v5/market/index-price-components', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketPriceLimit(params = {}) {
        return this.request('v5/market/price-limit', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketAdlAlert(params = {}) {
        return this.request('v5/market/adlAlert', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5MarketFeeGroupInfo(params = {}) {
        return this.request('v5/market/fee-group-info', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5SpotLeverTokenInfo(params = {}) {
        return this.request('v5/spot-lever-token/info', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5SpotLeverTokenReference(params = {}) {
        return this.request('v5/spot-lever-token/reference', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5SpotMarginTradeData(params = {}) {
        return this.request('v5/spot-margin-trade/data', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5SpotMarginTradeCollateral(params = {}) {
        return this.request('v5/spot-margin-trade/collateral', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5SpotCrossMarginTradeData(params = {}) {
        return this.request('v5/spot-cross-margin-trade/data', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5SpotCrossMarginTradePledgeToken(params = {}) {
        return this.request('v5/spot-cross-margin-trade/pledge-token', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5SpotCrossMarginTradeBorrowToken(params = {}) {
        return this.request('v5/spot-cross-margin-trade/borrow-token', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5CryptoLoanCollateralData(params = {}) {
        return this.request('v5/crypto-loan/collateral-data', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5CryptoLoanLoanableData(params = {}) {
        return this.request('v5/crypto-loan/loanable-data', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5CryptoLoanCommonLoanableData(params = {}) {
        return this.request('v5/crypto-loan-common/loanable-data', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5CryptoLoanCommonCollateralData(params = {}) {
        return this.request('v5/crypto-loan-common/collateral-data', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5CryptoLoanFixedSupplyOrderQuote(params = {}) {
        return this.request('v5/crypto-loan-fixed/supply-order-quote', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5CryptoLoanFixedBorrowOrderQuote(params = {}) {
        return this.request('v5/crypto-loan-fixed/borrow-order-quote', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5InsLoanProductInfos(params = {}) {
        return this.request('v5/ins-loan/product-infos', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5InsLoanEnsureTokensConvert(params = {}) {
        return this.request('v5/ins-loan/ensure-tokens-convert', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5EarnProduct(params = {}) {
        return this.request('v5/earn/product', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5SpotXLaunchpoolProjectList(params = {}) {
        return this.request('v5/spot-x/launchpool/project/list', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5SpotXPuzzleProjectList(params = {}) {
        return this.request('v5/spot-x/puzzle/project/list', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5SpotXTokenSplashProjectList(params = {}) {
        return this.request('v5/spot-x/token-splash/project/list', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5EventInstrumentsInfo(params = {}) {
        return this.request('v5/event/instruments-info', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    publicGetV5EventOrderbook(params = {}) {
        return this.request('v5/event/orderbook', ['public'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5MarketInstrumentsInfo(params = {}) {
        return this.request('v5/market/instruments-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV2PrivateWalletFundRecords(params = {}) {
        return this.request('v2/private/wallet/fund/records', ['private'], 'GET', params, undefined, undefined, { 'cost': 25 });
    }
    privateGetSpotV3PrivateOrder(params = {}) {
        return this.request('spot/v3/private/order', ['private'], 'GET', params, undefined, undefined, { 'cost': 2.5 });
    }
    privateGetSpotV3PrivateOpenOrders(params = {}) {
        return this.request('spot/v3/private/open-orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 2.5 });
    }
    privateGetSpotV3PrivateHistoryOrders(params = {}) {
        return this.request('spot/v3/private/history-orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 2.5 });
    }
    privateGetSpotV3PrivateMyTrades(params = {}) {
        return this.request('spot/v3/private/my-trades', ['private'], 'GET', params, undefined, undefined, { 'cost': 2.5 });
    }
    privateGetSpotV3PrivateAccount(params = {}) {
        return this.request('spot/v3/private/account', ['private'], 'GET', params, undefined, undefined, { 'cost': 2.5 });
    }
    privateGetSpotV3PrivateReference(params = {}) {
        return this.request('spot/v3/private/reference', ['private'], 'GET', params, undefined, undefined, { 'cost': 2.5 });
    }
    privateGetSpotV3PrivateRecord(params = {}) {
        return this.request('spot/v3/private/record', ['private'], 'GET', params, undefined, undefined, { 'cost': 2.5 });
    }
    privateGetSpotV3PrivateCrossMarginOrders(params = {}) {
        return this.request('spot/v3/private/cross-margin-orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetSpotV3PrivateCrossMarginAccount(params = {}) {
        return this.request('spot/v3/private/cross-margin-account', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetSpotV3PrivateCrossMarginLoanInfo(params = {}) {
        return this.request('spot/v3/private/cross-margin-loan-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetSpotV3PrivateCrossMarginRepayHistory(params = {}) {
        return this.request('spot/v3/private/cross-margin-repay-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetSpotV3PrivateMarginLoanInfos(params = {}) {
        return this.request('spot/v3/private/margin-loan-infos', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetSpotV3PrivateMarginRepaidInfos(params = {}) {
        return this.request('spot/v3/private/margin-repaid-infos', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetSpotV3PrivateMarginLtv(params = {}) {
        return this.request('spot/v3/private/margin-ltv', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetAssetV3PrivateTransferInterTransferListQuery(params = {}) {
        return this.request('asset/v3/private/transfer/inter-transfer/list/query', ['private'], 'GET', params, undefined, undefined, { 'cost': 50 });
    }
    privateGetAssetV3PrivateTransferSubMemberListQuery(params = {}) {
        return this.request('asset/v3/private/transfer/sub-member/list/query', ['private'], 'GET', params, undefined, undefined, { 'cost': 50 });
    }
    privateGetAssetV3PrivateTransferSubMemberTransferListQuery(params = {}) {
        return this.request('asset/v3/private/transfer/sub-member-transfer/list/query', ['private'], 'GET', params, undefined, undefined, { 'cost': 50 });
    }
    privateGetAssetV3PrivateTransferUniversalTransferListQuery(params = {}) {
        return this.request('asset/v3/private/transfer/universal-transfer/list/query', ['private'], 'GET', params, undefined, undefined, { 'cost': 25 });
    }
    privateGetAssetV3PrivateCoinInfoQuery(params = {}) {
        return this.request('asset/v3/private/coin-info/query', ['private'], 'GET', params, undefined, undefined, { 'cost': 25 });
    }
    privateGetAssetV3PrivateDepositAddressQuery(params = {}) {
        return this.request('asset/v3/private/deposit/address/query', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetContractV3PrivateCopytradingOrderList(params = {}) {
        return this.request('contract/v3/private/copytrading/order/list', ['private'], 'GET', params, undefined, undefined, { 'cost': 30 });
    }
    privateGetContractV3PrivateCopytradingPositionList(params = {}) {
        return this.request('contract/v3/private/copytrading/position/list', ['private'], 'GET', params, undefined, undefined, { 'cost': 40 });
    }
    privateGetContractV3PrivateCopytradingWalletBalance(params = {}) {
        return this.request('contract/v3/private/copytrading/wallet/balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 25 });
    }
    privateGetContractV3PrivatePositionLimitInfo(params = {}) {
        return this.request('contract/v3/private/position/limit-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 25 });
    }
    privateGetContractV3PrivateOrderUnfilledOrders(params = {}) {
        return this.request('contract/v3/private/order/unfilled-orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetContractV3PrivateOrderList(params = {}) {
        return this.request('contract/v3/private/order/list', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetContractV3PrivatePositionList(params = {}) {
        return this.request('contract/v3/private/position/list', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetContractV3PrivateExecutionList(params = {}) {
        return this.request('contract/v3/private/execution/list', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetContractV3PrivatePositionClosedPnl(params = {}) {
        return this.request('contract/v3/private/position/closed-pnl', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetContractV3PrivateAccountWalletBalance(params = {}) {
        return this.request('contract/v3/private/account/wallet/balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetContractV3PrivateAccountFeeRate(params = {}) {
        return this.request('contract/v3/private/account/fee-rate', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetContractV3PrivateAccountWalletFundRecords(params = {}) {
        return this.request('contract/v3/private/account/wallet/fund-records', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUnifiedV3PrivateOrderUnfilledOrders(params = {}) {
        return this.request('unified/v3/private/order/unfilled-orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUnifiedV3PrivateOrderList(params = {}) {
        return this.request('unified/v3/private/order/list', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUnifiedV3PrivatePositionList(params = {}) {
        return this.request('unified/v3/private/position/list', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUnifiedV3PrivateExecutionList(params = {}) {
        return this.request('unified/v3/private/execution/list', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUnifiedV3PrivateDeliveryRecord(params = {}) {
        return this.request('unified/v3/private/delivery-record', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUnifiedV3PrivateSettlementRecord(params = {}) {
        return this.request('unified/v3/private/settlement-record', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUnifiedV3PrivateAccountWalletBalance(params = {}) {
        return this.request('unified/v3/private/account/wallet/balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUnifiedV3PrivateAccountTransactionLog(params = {}) {
        return this.request('unified/v3/private/account/transaction-log', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUnifiedV3PrivateAccountBorrowHistory(params = {}) {
        return this.request('unified/v3/private/account/borrow-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUnifiedV3PrivateAccountBorrowRate(params = {}) {
        return this.request('unified/v3/private/account/borrow-rate', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUnifiedV3PrivateAccountInfo(params = {}) {
        return this.request('unified/v3/private/account/info', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetUserV3PrivateFrozenSubMember(params = {}) {
        return this.request('user/v3/private/frozen-sub-member', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetUserV3PrivateQuerySubMembers(params = {}) {
        return this.request('user/v3/private/query-sub-members', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetUserV3PrivateQueryApi(params = {}) {
        return this.request('user/v3/private/query-api', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetUserV3PrivateGetMemberType(params = {}) {
        return this.request('user/v3/private/get-member-type', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetAssetV3PrivateTransferTransferCoinListQuery(params = {}) {
        return this.request('asset/v3/private/transfer/transfer-coin/list/query', ['private'], 'GET', params, undefined, undefined, { 'cost': 50 });
    }
    privateGetAssetV3PrivateTransferAccountCoinBalanceQuery(params = {}) {
        return this.request('asset/v3/private/transfer/account-coin/balance/query', ['private'], 'GET', params, undefined, undefined, { 'cost': 50 });
    }
    privateGetAssetV3PrivateTransferAccountCoinsBalanceQuery(params = {}) {
        return this.request('asset/v3/private/transfer/account-coins/balance/query', ['private'], 'GET', params, undefined, undefined, { 'cost': 25 });
    }
    privateGetAssetV3PrivateTransferAssetInfoQuery(params = {}) {
        return this.request('asset/v3/private/transfer/asset-info/query', ['private'], 'GET', params, undefined, undefined, { 'cost': 50 });
    }
    privateGetAssetV3PublicDepositAllowedDepositListQuery(params = {}) {
        return this.request('asset/v3/public/deposit/allowed-deposit-list/query', ['private'], 'GET', params, undefined, undefined, { 'cost': 0.17 });
    }
    privateGetAssetV3PrivateDepositRecordQuery(params = {}) {
        return this.request('asset/v3/private/deposit/record/query', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetAssetV3PrivateWithdrawRecordQuery(params = {}) {
        return this.request('asset/v3/private/withdraw/record/query', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5OrderRealtime(params = {}) {
        return this.request('v5/order/realtime', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5OrderHistory(params = {}) {
        return this.request('v5/order/history', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5OrderSpotBorrowCheck(params = {}) {
        return this.request('v5/order/spot-borrow-check', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV5PositionList(params = {}) {
        return this.request('v5/position/list', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5ExecutionList(params = {}) {
        return this.request('v5/execution/list', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5PositionClosedPnl(params = {}) {
        return this.request('v5/position/closed-pnl', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5PositionGetClosedPositions(params = {}) {
        return this.request('v5/position/get-closed-positions', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5PositionMoveHistory(params = {}) {
        return this.request('v5/position/move-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5PositionSymbolInfo(params = {}) {
        return this.request('v5/position/symbol-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5PreUpgradeOrderHistory(params = {}) {
        return this.request('v5/pre-upgrade/order/history', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5PreUpgradeExecutionList(params = {}) {
        return this.request('v5/pre-upgrade/execution/list', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5PreUpgradePositionClosedPnl(params = {}) {
        return this.request('v5/pre-upgrade/position/closed-pnl', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5PreUpgradeAccountTransactionLog(params = {}) {
        return this.request('v5/pre-upgrade/account/transaction-log', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5PreUpgradeAssetDeliveryRecord(params = {}) {
        return this.request('v5/pre-upgrade/asset/delivery-record', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5PreUpgradeAssetSettlementRecord(params = {}) {
        return this.request('v5/pre-upgrade/asset/settlement-record', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AccountWalletBalance(params = {}) {
        return this.request('v5/account/wallet-balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV5AccountBorrowHistory(params = {}) {
        return this.request('v5/account/borrow-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV5AccountInstrumentsInfo(params = {}) {
        return this.request('v5/account/instruments-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV5AccountCollateralInfo(params = {}) {
        return this.request('v5/account/collateral-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV5AccountOptionAssetInfo(params = {}) {
        return this.request('v5/account/option-asset-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV5AssetCoinGreeks(params = {}) {
        return this.request('v5/asset/coin-greeks', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV5AccountFeeRate(params = {}) {
        return this.request('v5/account/fee-rate', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5AccountInfo(params = {}) {
        return this.request('v5/account/info', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AccountTransactionLog(params = {}) {
        return this.request('v5/account/transaction-log', ['private'], 'GET', params, undefined, undefined, { 'cost': 1.66 });
    }
    privateGetV5AccountContractTransactionLog(params = {}) {
        return this.request('v5/account/contract-transaction-log', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV5AccountQueryDcpInfo(params = {}) {
        return this.request('v5/account/query-dcp-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AccountUserSettingConfig(params = {}) {
        return this.request('v5/account/user-setting-config', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AccountPayInfo(params = {}) {
        return this.request('v5/account/pay-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AccountTradeInfoForAnalysis(params = {}) {
        return this.request('v5/account/trade-info-for-analysis', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AccountSmpGroup(params = {}) {
        return this.request('v5/account/smp-group', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV5AccountMmpState(params = {}) {
        return this.request('v5/account/mmp-state', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AccountWithdrawal(params = {}) {
        return this.request('v5/account/withdrawal', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AssetAssetOverview(params = {}) {
        return this.request('v5/asset/asset-overview', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AssetExchangeQueryCoinList(params = {}) {
        return this.request('v5/asset/exchange/query-coin-list', ['private'], 'GET', params, undefined, undefined, { 'cost': 0.5 });
    }
    privateGetV5AssetExchangeConvertResultQuery(params = {}) {
        return this.request('v5/asset/exchange/convert-result-query', ['private'], 'GET', params, undefined, undefined, { 'cost': 0.5 });
    }
    privateGetV5AssetExchangeQueryConvertHistory(params = {}) {
        return this.request('v5/asset/exchange/query-convert-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 0.5 });
    }
    privateGetV5AssetExchangeOrderRecord(params = {}) {
        return this.request('v5/asset/exchange/order-record', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AssetFundinghistory(params = {}) {
        return this.request('v5/asset/fundinghistory', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AssetPortfolioMargin(params = {}) {
        return this.request('v5/asset/portfolio-margin', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AssetTotalMembersAssets(params = {}) {
        return this.request('v5/asset/total-members-assets', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AssetDeliveryRecord(params = {}) {
        return this.request('v5/asset/delivery-record', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AssetSettlementRecord(params = {}) {
        return this.request('v5/asset/settlement-record', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AssetTransferQueryAssetInfo(params = {}) {
        return this.request('v5/asset/transfer/query-asset-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 50 });
    }
    privateGetV5AssetTransferQueryAccountCoinsBalance(params = {}) {
        return this.request('v5/asset/transfer/query-account-coins-balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 25 });
    }
    privateGetV5AssetTransferQueryAccountCoinBalance(params = {}) {
        return this.request('v5/asset/transfer/query-account-coin-balance', ['private'], 'GET', params, undefined, undefined, { 'cost': 50 });
    }
    privateGetV5AssetTransferQueryTransferCoinList(params = {}) {
        return this.request('v5/asset/transfer/query-transfer-coin-list', ['private'], 'GET', params, undefined, undefined, { 'cost': 50 });
    }
    privateGetV5AssetTransferQueryInterTransferList(params = {}) {
        return this.request('v5/asset/transfer/query-inter-transfer-list', ['private'], 'GET', params, undefined, undefined, { 'cost': 50 });
    }
    privateGetV5AssetTransferQuerySubMemberList(params = {}) {
        return this.request('v5/asset/transfer/query-sub-member-list', ['private'], 'GET', params, undefined, undefined, { 'cost': 50 });
    }
    privateGetV5AssetTransferQueryUniversalTransferList(params = {}) {
        return this.request('v5/asset/transfer/query-universal-transfer-list', ['private'], 'GET', params, undefined, undefined, { 'cost': 25 });
    }
    privateGetV5AssetDepositQueryAllowedList(params = {}) {
        return this.request('v5/asset/deposit/query-allowed-list', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AssetDepositQueryRecord(params = {}) {
        return this.request('v5/asset/deposit/query-record', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5AssetDepositQuerySubMemberRecord(params = {}) {
        return this.request('v5/asset/deposit/query-sub-member-record', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5AssetDepositQueryInternalRecord(params = {}) {
        return this.request('v5/asset/deposit/query-internal-record', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AssetDepositQueryAddress(params = {}) {
        return this.request('v5/asset/deposit/query-address', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5AssetDepositQuerySubMemberAddress(params = {}) {
        return this.request('v5/asset/deposit/query-sub-member-address', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5AssetCoinQueryInfo(params = {}) {
        return this.request('v5/asset/coin/query-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 28 });
    }
    privateGetV5AssetWithdrawQueryAddress(params = {}) {
        return this.request('v5/asset/withdraw/query-address', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5AssetWithdrawQueryRecord(params = {}) {
        return this.request('v5/asset/withdraw/query-record', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5AssetWithdrawWithdrawableAmount(params = {}) {
        return this.request('v5/asset/withdraw/withdrawable-amount', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AssetWithdrawVaspList(params = {}) {
        return this.request('v5/asset/withdraw/vasp/list', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AssetCovertSmallBalanceList(params = {}) {
        return this.request('v5/asset/covert/small-balance-list', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AssetCovertSmallBalanceHistory(params = {}) {
        return this.request('v5/asset/covert/small-balance-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AssetConvertSmallBalanceList(params = {}) {
        return this.request('v5/asset/convert/small-balance-list', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AssetConvertSmallBalanceHistory(params = {}) {
        return this.request('v5/asset/convert/small-balance-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5FiatQueryCoinList(params = {}) {
        return this.request('v5/fiat/query-coin-list', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5FiatReferencePrice(params = {}) {
        return this.request('v5/fiat/reference-price', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5FiatTradeQuery(params = {}) {
        return this.request('v5/fiat/trade-query', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5FiatQueryTradeHistory(params = {}) {
        return this.request('v5/fiat/query-trade-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5FiatBalanceQuery(params = {}) {
        return this.request('v5/fiat/balance-query', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5UserQuerySubMembers(params = {}) {
        return this.request('v5/user/query-sub-members', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5UserQueryApi(params = {}) {
        return this.request('v5/user/query-api', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5UserSubApikeys(params = {}) {
        return this.request('v5/user/sub-apikeys', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5UserGetMemberType(params = {}) {
        return this.request('v5/user/get-member-type', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5UserAffCustomerInfo(params = {}) {
        return this.request('v5/user/aff-customer-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5UserDelSubmember(params = {}) {
        return this.request('v5/user/del-submember', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5UserSubmembers(params = {}) {
        return this.request('v5/user/submembers', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5UserEscrowSubMembers(params = {}) {
        return this.request('v5/user/escrow_sub_members', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5UserInvitationReferrals(params = {}) {
        return this.request('v5/user/invitation/referrals', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5UserInvitationCode(params = {}) {
        return this.request('v5/user/invitation/code', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AffiliateAffUserList(params = {}) {
        return this.request('v5/affiliate/aff-user-list', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AffiliateAffiliateSubList(params = {}) {
        return this.request('v5/affiliate/affiliate-sub-list', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotLeverTokenOrderRecord(params = {}) {
        return this.request('v5/spot-lever-token/order-record', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV5SpotMarginTradeFlexibleAvailableInventory(params = {}) {
        return this.request('v5/spot-margin-trade/flexible-available-inventory', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotMarginTradeFixedAvailableInventory(params = {}) {
        return this.request('v5/spot-margin-trade/fixed-available-inventory', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotMarginTradeInterestRateHistory(params = {}) {
        return this.request('v5/spot-margin-trade/interest-rate-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotMarginTradeState(params = {}) {
        return this.request('v5/spot-margin-trade/state', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotMarginTradeMaxBorrowable(params = {}) {
        return this.request('v5/spot-margin-trade/max-borrowable', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotMarginTradePositionTiers(params = {}) {
        return this.request('v5/spot-margin-trade/position-tiers', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotMarginTradeCoinstate(params = {}) {
        return this.request('v5/spot-margin-trade/coinstate', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotMarginTradeCurrencyData(params = {}) {
        return this.request('v5/spot-margin-trade/currency-data', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotMarginTradeFixedborrowContractInfo(params = {}) {
        return this.request('v5/spot-margin-trade/fixedborrow-contract-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotMarginTradeFixedborrowOrderInfo(params = {}) {
        return this.request('v5/spot-margin-trade/fixedborrow-order-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotMarginTradeFixedborrowOrderQuote(params = {}) {
        return this.request('v5/spot-margin-trade/fixedborrow-order-quote', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotMarginTradeLiability(params = {}) {
        return this.request('v5/spot-margin-trade/liability', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotMarginTradeRepaymentAvailableAmount(params = {}) {
        return this.request('v5/spot-margin-trade/repayment-available-amount', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotMarginTradeGetAutoRepayMode(params = {}) {
        return this.request('v5/spot-margin-trade/get-auto-repay-mode', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotCrossMarginTradeLoanInfo(params = {}) {
        return this.request('v5/spot-cross-margin-trade/loan-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV5SpotCrossMarginTradeAccount(params = {}) {
        return this.request('v5/spot-cross-margin-trade/account', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV5SpotCrossMarginTradeOrders(params = {}) {
        return this.request('v5/spot-cross-margin-trade/orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV5SpotCrossMarginTradeRepayHistory(params = {}) {
        return this.request('v5/spot-cross-margin-trade/repay-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    privateGetV5CryptoLoanBorrowableCollateralisableNumber(params = {}) {
        return this.request('v5/crypto-loan/borrowable-collateralisable-number', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5CryptoLoanOngoingOrders(params = {}) {
        return this.request('v5/crypto-loan/ongoing-orders', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5CryptoLoanRepaymentHistory(params = {}) {
        return this.request('v5/crypto-loan/repayment-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5CryptoLoanBorrowHistory(params = {}) {
        return this.request('v5/crypto-loan/borrow-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5CryptoLoanMaxCollateralAmount(params = {}) {
        return this.request('v5/crypto-loan/max-collateral-amount', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5CryptoLoanAdjustmentHistory(params = {}) {
        return this.request('v5/crypto-loan/adjustment-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5CryptoLoanCommonMaxCollateralAmount(params = {}) {
        return this.request('v5/crypto-loan-common/max-collateral-amount', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5CryptoLoanCommonAdjustmentHistory(params = {}) {
        return this.request('v5/crypto-loan-common/adjustment-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5CryptoLoanCommonPosition(params = {}) {
        return this.request('v5/crypto-loan-common/position', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5CryptoLoanFlexibleOngoingCoin(params = {}) {
        return this.request('v5/crypto-loan-flexible/ongoing-coin', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5CryptoLoanFlexibleBorrowHistory(params = {}) {
        return this.request('v5/crypto-loan-flexible/borrow-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5CryptoLoanFlexibleRepaymentHistory(params = {}) {
        return this.request('v5/crypto-loan-flexible/repayment-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5CryptoLoanFixedBorrowContractInfo(params = {}) {
        return this.request('v5/crypto-loan-fixed/borrow-contract-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5CryptoLoanFixedSupplyContractInfo(params = {}) {
        return this.request('v5/crypto-loan-fixed/supply-contract-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5CryptoLoanFixedBorrowOrderInfo(params = {}) {
        return this.request('v5/crypto-loan-fixed/borrow-order-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5CryptoLoanFixedRenewInfo(params = {}) {
        return this.request('v5/crypto-loan-fixed/renew-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5CryptoLoanFixedSupplyOrderInfo(params = {}) {
        return this.request('v5/crypto-loan-fixed/supply-order-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5CryptoLoanFixedRepaymentHistory(params = {}) {
        return this.request('v5/crypto-loan-fixed/repayment-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5CryptoLoanFixedAvailableInventory(params = {}) {
        return this.request('v5/crypto-loan-fixed/available-inventory', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5CryptoLoanFlexibleAvailableInventory(params = {}) {
        return this.request('v5/crypto-loan-flexible/available-inventory', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5InsLoanProductInfos(params = {}) {
        return this.request('v5/ins-loan/product-infos', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5InsLoanEnsureTokens(params = {}) {
        return this.request('v5/ins-loan/ensure-tokens', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5InsLoanEnsureTokensConvert(params = {}) {
        return this.request('v5/ins-loan/ensure-tokens-convert', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5InsLoanLoanOrder(params = {}) {
        return this.request('v5/ins-loan/loan-order', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5InsLoanRepaidHistory(params = {}) {
        return this.request('v5/ins-loan/repaid-history', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5InsLoanLtv(params = {}) {
        return this.request('v5/ins-loan/ltv', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5InsLoanLtvConvert(params = {}) {
        return this.request('v5/ins-loan/ltv-convert', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5InsLoanCoinDeltaAmount(params = {}) {
        return this.request('v5/ins-loan/coin-delta-amount', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5LendingInfo(params = {}) {
        return this.request('v5/lending/info', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5LendingHistoryOrder(params = {}) {
        return this.request('v5/lending/history-order', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5LendingAccount(params = {}) {
        return this.request('v5/lending/account', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5BrokerEarningRecord(params = {}) {
        return this.request('v5/broker/earning-record', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5BrokerEarningsInfo(params = {}) {
        return this.request('v5/broker/earnings-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5BrokerAccountInfo(params = {}) {
        return this.request('v5/broker/account-info', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5BrokerAssetQuerySubMemberDepositRecord(params = {}) {
        return this.request('v5/broker/asset/query-sub-member-deposit-record', ['private'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    privateGetV5EarnProduct(params = {}) {
        return this.request('v5/earn/product', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5EarnOrder(params = {}) {
        return this.request('v5/earn/order', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5EarnPosition(params = {}) {
        return this.request('v5/earn/position', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5EarnYield(params = {}) {
        return this.request('v5/earn/yield', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5EarnHourlyYield(params = {}) {
        return this.request('v5/earn/hourly-yield', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5EventOrderRealtime(params = {}) {
        return this.request('v5/event/order-realtime', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5EventOrderList(params = {}) {
        return this.request('v5/event/order-list', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5EventPositions(params = {}) {
        return this.request('v5/event/positions', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5EventTrades(params = {}) {
        return this.request('v5/event/trades', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5EventSettlements(params = {}) {
        return this.request('v5/event/settlements', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotXLaunchpoolUserCurrentStaking(params = {}) {
        return this.request('v5/spot-x/launchpool/user/current-staking', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5SpotXTokenSplashUserActivityParams(params = {}) {
        return this.request('v5/spot-x/token-splash/user/activity-params', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5RfqRfqDetailList(params = {}) {
        return this.request('v5/rfq/rfq-detail-list', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AlphaPredictionEngineStatus(params = {}) {
        return this.request('v5/alpha/prediction/engine-status', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AlphaPredictionPayTokenList(params = {}) {
        return this.request('v5/alpha/prediction/pay-token-list', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privateGetV5AlphaPredictionSportsTimelineStages(params = {}) {
        return this.request('v5/alpha/prediction/sports/timeline-stages', ['private'], 'GET', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostSpotV3PrivateOrder(params = {}) {
        return this.request('spot/v3/private/order', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostSpotV3PrivateCancelOrder(params = {}) {
        return this.request('spot/v3/private/cancel-order', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostSpotV3PrivateCancelOrders(params = {}) {
        return this.request('spot/v3/private/cancel-orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostSpotV3PrivateCancelOrdersByIds(params = {}) {
        return this.request('spot/v3/private/cancel-orders-by-ids', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostSpotV3PrivatePurchase(params = {}) {
        return this.request('spot/v3/private/purchase', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostSpotV3PrivateRedeem(params = {}) {
        return this.request('spot/v3/private/redeem', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostSpotV3PrivateCrossMarginLoan(params = {}) {
        return this.request('spot/v3/private/cross-margin-loan', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostSpotV3PrivateCrossMarginRepay(params = {}) {
        return this.request('spot/v3/private/cross-margin-repay', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostAssetV3PrivateTransferInterTransfer(params = {}) {
        return this.request('asset/v3/private/transfer/inter-transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 150 });
    }
    privatePostAssetV3PrivateWithdrawCreate(params = {}) {
        return this.request('asset/v3/private/withdraw/create', ['private'], 'POST', params, undefined, undefined, { 'cost': 300 });
    }
    privatePostAssetV3PrivateWithdrawCancel(params = {}) {
        return this.request('asset/v3/private/withdraw/cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostAssetV3PrivateTransferSubMemberTransfer(params = {}) {
        return this.request('asset/v3/private/transfer/sub-member-transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 150 });
    }
    privatePostAssetV3PrivateTransferTransferSubMemberSave(params = {}) {
        return this.request('asset/v3/private/transfer/transfer-sub-member-save', ['private'], 'POST', params, undefined, undefined, { 'cost': 150 });
    }
    privatePostAssetV3PrivateTransferUniversalTransfer(params = {}) {
        return this.request('asset/v3/private/transfer/universal-transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostUserV3PrivateCreateSubMember(params = {}) {
        return this.request('user/v3/private/create-sub-member', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostUserV3PrivateCreateSubApi(params = {}) {
        return this.request('user/v3/private/create-sub-api', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostUserV3PrivateUpdateApi(params = {}) {
        return this.request('user/v3/private/update-api', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostUserV3PrivateDeleteApi(params = {}) {
        return this.request('user/v3/private/delete-api', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostUserV3PrivateUpdateSubApi(params = {}) {
        return this.request('user/v3/private/update-sub-api', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostUserV3PrivateDeleteSubApi(params = {}) {
        return this.request('user/v3/private/delete-sub-api', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostContractV3PrivateCopytradingOrderCreate(params = {}) {
        return this.request('contract/v3/private/copytrading/order/create', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostContractV3PrivateCopytradingOrderCancel(params = {}) {
        return this.request('contract/v3/private/copytrading/order/cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostContractV3PrivateCopytradingOrderClose(params = {}) {
        return this.request('contract/v3/private/copytrading/order/close', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostContractV3PrivateCopytradingPositionClose(params = {}) {
        return this.request('contract/v3/private/copytrading/position/close', ['private'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privatePostContractV3PrivateCopytradingPositionSetLeverage(params = {}) {
        return this.request('contract/v3/private/copytrading/position/set-leverage', ['private'], 'POST', params, undefined, undefined, { 'cost': 40 });
    }
    privatePostContractV3PrivateCopytradingWalletTransfer(params = {}) {
        return this.request('contract/v3/private/copytrading/wallet/transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 25 });
    }
    privatePostContractV3PrivateCopytradingOrderTradingStop(params = {}) {
        return this.request('contract/v3/private/copytrading/order/trading-stop', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostContractV3PrivateOrderCreate(params = {}) {
        return this.request('contract/v3/private/order/create', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostContractV3PrivateOrderCancel(params = {}) {
        return this.request('contract/v3/private/order/cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostContractV3PrivateOrderCancelAll(params = {}) {
        return this.request('contract/v3/private/order/cancel-all', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostContractV3PrivateOrderReplace(params = {}) {
        return this.request('contract/v3/private/order/replace', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostContractV3PrivatePositionSetAutoAddMargin(params = {}) {
        return this.request('contract/v3/private/position/set-auto-add-margin', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostContractV3PrivatePositionSwitchIsolated(params = {}) {
        return this.request('contract/v3/private/position/switch-isolated', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostContractV3PrivatePositionSwitchMode(params = {}) {
        return this.request('contract/v3/private/position/switch-mode', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostContractV3PrivatePositionSwitchTpslMode(params = {}) {
        return this.request('contract/v3/private/position/switch-tpsl-mode', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostContractV3PrivatePositionSetLeverage(params = {}) {
        return this.request('contract/v3/private/position/set-leverage', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostContractV3PrivatePositionTradingStop(params = {}) {
        return this.request('contract/v3/private/position/trading-stop', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostContractV3PrivatePositionSetRiskLimit(params = {}) {
        return this.request('contract/v3/private/position/set-risk-limit', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostContractV3PrivateAccountSetMarginMode(params = {}) {
        return this.request('contract/v3/private/account/setMarginMode', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostUnifiedV3PrivateOrderCreate(params = {}) {
        return this.request('unified/v3/private/order/create', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostUnifiedV3PrivateOrderReplace(params = {}) {
        return this.request('unified/v3/private/order/replace', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostUnifiedV3PrivateOrderCancel(params = {}) {
        return this.request('unified/v3/private/order/cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostUnifiedV3PrivateOrderCreateBatch(params = {}) {
        return this.request('unified/v3/private/order/create-batch', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostUnifiedV3PrivateOrderReplaceBatch(params = {}) {
        return this.request('unified/v3/private/order/replace-batch', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostUnifiedV3PrivateOrderCancelBatch(params = {}) {
        return this.request('unified/v3/private/order/cancel-batch', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostUnifiedV3PrivateOrderCancelAll(params = {}) {
        return this.request('unified/v3/private/order/cancel-all', ['private'], 'POST', params, undefined, undefined, { 'cost': 30 });
    }
    privatePostUnifiedV3PrivatePositionSetLeverage(params = {}) {
        return this.request('unified/v3/private/position/set-leverage', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostUnifiedV3PrivatePositionTpslSwitchMode(params = {}) {
        return this.request('unified/v3/private/position/tpsl/switch-mode', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostUnifiedV3PrivatePositionSetRiskLimit(params = {}) {
        return this.request('unified/v3/private/position/set-risk-limit', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostUnifiedV3PrivatePositionTradingStop(params = {}) {
        return this.request('unified/v3/private/position/trading-stop', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostUnifiedV3PrivateAccountUpgradeUnifiedAccount(params = {}) {
        return this.request('unified/v3/private/account/upgrade-unified-account', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostUnifiedV3PrivateAccountSetMarginMode(params = {}) {
        return this.request('unified/v3/private/account/setMarginMode', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostFhtComplianceTaxV3PrivateRegistertime(params = {}) {
        return this.request('fht/compliance/tax/v3/private/registertime', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostFhtComplianceTaxV3PrivateCreate(params = {}) {
        return this.request('fht/compliance/tax/v3/private/create', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostFhtComplianceTaxV3PrivateStatus(params = {}) {
        return this.request('fht/compliance/tax/v3/private/status', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostFhtComplianceTaxV3PrivateUrl(params = {}) {
        return this.request('fht/compliance/tax/v3/private/url', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostV5OrderCreate(params = {}) {
        return this.request('v5/order/create', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostV5OrderAmend(params = {}) {
        return this.request('v5/order/amend', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5OrderCancel(params = {}) {
        return this.request('v5/order/cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostV5OrderCancelAll(params = {}) {
        return this.request('v5/order/cancel-all', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostV5OrderCreateBatch(params = {}) {
        return this.request('v5/order/create-batch', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5OrderAmendBatch(params = {}) {
        return this.request('v5/order/amend-batch', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5OrderCancelBatch(params = {}) {
        return this.request('v5/order/cancel-batch', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5OrderDisconnectedCancelAll(params = {}) {
        return this.request('v5/order/disconnected-cancel-all', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5OrderPreCheck(params = {}) {
        return this.request('v5/order/pre-check', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5PositionSetLeverage(params = {}) {
        return this.request('v5/position/set-leverage', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5PositionSwitchIsolated(params = {}) {
        return this.request('v5/position/switch-isolated', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5PositionSetTpslMode(params = {}) {
        return this.request('v5/position/set-tpsl-mode', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5PositionSwitchMode(params = {}) {
        return this.request('v5/position/switch-mode', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5PositionSetRiskLimit(params = {}) {
        return this.request('v5/position/set-risk-limit', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5PositionTradingStop(params = {}) {
        return this.request('v5/position/trading-stop', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5PositionSetAutoAddMargin(params = {}) {
        return this.request('v5/position/set-auto-add-margin', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5PositionAddMargin(params = {}) {
        return this.request('v5/position/add-margin', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5PositionMovePositions(params = {}) {
        return this.request('v5/position/move-positions', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5PositionConfirmPendingMmr(params = {}) {
        return this.request('v5/position/confirm-pending-mmr', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AccountUpgradeToUta(params = {}) {
        return this.request('v5/account/upgrade-to-uta', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AccountQuickRepayment(params = {}) {
        return this.request('v5/account/quick-repayment', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AccountSetMarginMode(params = {}) {
        return this.request('v5/account/set-margin-mode', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AccountSetHedgingMode(params = {}) {
        return this.request('v5/account/set-hedging-mode', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AccountMmpModify(params = {}) {
        return this.request('v5/account/mmp-modify', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AccountMmpReset(params = {}) {
        return this.request('v5/account/mmp-reset', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AccountBorrow(params = {}) {
        return this.request('v5/account/borrow', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AccountRepay(params = {}) {
        return this.request('v5/account/repay', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AccountNoConvertRepay(params = {}) {
        return this.request('v5/account/no-convert-repay', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AccountSetLimitPxAction(params = {}) {
        return this.request('v5/account/set-limit-px-action', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AccountSetDeltaMode(params = {}) {
        return this.request('v5/account/set-delta-mode', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AssetExchangeQuoteApply(params = {}) {
        return this.request('v5/asset/exchange/quote-apply', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV5AssetExchangeConvertExecute(params = {}) {
        return this.request('v5/asset/exchange/convert-execute', ['private'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    privatePostV5AssetTransferInterTransfer(params = {}) {
        return this.request('v5/asset/transfer/inter-transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostV5AssetTransferSaveTransferSubMember(params = {}) {
        return this.request('v5/asset/transfer/save-transfer-sub-member', ['private'], 'POST', params, undefined, undefined, { 'cost': 150 });
    }
    privatePostV5AssetTransferUniversalTransfer(params = {}) {
        return this.request('v5/asset/transfer/universal-transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostV5AssetDepositDepositToAccount(params = {}) {
        return this.request('v5/asset/deposit/deposit-to-account', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AssetTravelRuleDepositSubmit(params = {}) {
        return this.request('v5/asset/travel-rule/deposit/submit', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AssetWithdrawCreate(params = {}) {
        return this.request('v5/asset/withdraw/create', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostV5AssetWithdrawCancel(params = {}) {
        return this.request('v5/asset/withdraw/cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostV5AssetCovertGetQuote(params = {}) {
        return this.request('v5/asset/covert/get-quote', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostV5AssetCovertSmallBalanceExecute(params = {}) {
        return this.request('v5/asset/covert/small-balance-execute', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostV5FiatQuoteApply(params = {}) {
        return this.request('v5/fiat/quote-apply', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostV5FiatTradeExecute(params = {}) {
        return this.request('v5/fiat/trade-execute', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostV5UserCreateSubMember(params = {}) {
        return this.request('v5/user/create-sub-member', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostV5UserCreateSubApi(params = {}) {
        return this.request('v5/user/create-sub-api', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostV5UserFrozenSubMember(params = {}) {
        return this.request('v5/user/frozen-sub-member', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostV5UserUpdateApi(params = {}) {
        return this.request('v5/user/update-api', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostV5UserUpdateSubApi(params = {}) {
        return this.request('v5/user/update-sub-api', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostV5UserDeleteApi(params = {}) {
        return this.request('v5/user/delete-api', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostV5UserDeleteSubApi(params = {}) {
        return this.request('v5/user/delete-sub-api', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostV5UserAgreement(params = {}) {
        return this.request('v5/user/agreement', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostV5UserCreateDemoMember(params = {}) {
        return this.request('v5/user/create-demo-member', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostV5SpotLeverTokenPurchase(params = {}) {
        return this.request('v5/spot-lever-token/purchase', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostV5SpotLeverTokenRedeem(params = {}) {
        return this.request('v5/spot-lever-token/redeem', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostV5SpotMarginTradeSwitchMode(params = {}) {
        return this.request('v5/spot-margin-trade/switch-mode', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5SpotMarginTradeSetLeverage(params = {}) {
        return this.request('v5/spot-margin-trade/set-leverage', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5SpotMarginTradeSetAutoRepayMode(params = {}) {
        return this.request('v5/spot-margin-trade/set-auto-repay-mode', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5SpotMarginTradeFixedborrow(params = {}) {
        return this.request('v5/spot-margin-trade/fixedborrow', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5SpotMarginTradeFixedborrowRenew(params = {}) {
        return this.request('v5/spot-margin-trade/fixedborrow-renew', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5SpotCrossMarginTradeLoan(params = {}) {
        return this.request('v5/spot-cross-margin-trade/loan', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostV5SpotCrossMarginTradeRepay(params = {}) {
        return this.request('v5/spot-cross-margin-trade/repay', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostV5SpotCrossMarginTradeSwitch(params = {}) {
        return this.request('v5/spot-cross-margin-trade/switch', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.5 });
    }
    privatePostV5CryptoLoanBorrow(params = {}) {
        return this.request('v5/crypto-loan/borrow', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5CryptoLoanRepay(params = {}) {
        return this.request('v5/crypto-loan/repay', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5CryptoLoanAdjustLtv(params = {}) {
        return this.request('v5/crypto-loan/adjust-ltv', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5CryptoLoanCommonAdjustLtv(params = {}) {
        return this.request('v5/crypto-loan-common/adjust-ltv', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostV5CryptoLoanCommonMaxLoan(params = {}) {
        return this.request('v5/crypto-loan-common/max-loan', ['private'], 'POST', params, undefined, undefined, { 'cost': 10 });
    }
    privatePostV5CryptoLoanFlexibleBorrow(params = {}) {
        return this.request('v5/crypto-loan-flexible/borrow', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostV5CryptoLoanFlexibleRepay(params = {}) {
        return this.request('v5/crypto-loan-flexible/repay', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostV5CryptoLoanFlexibleRepayCollateral(params = {}) {
        return this.request('v5/crypto-loan-flexible/repay-collateral', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostV5CryptoLoanFixedBorrow(params = {}) {
        return this.request('v5/crypto-loan-fixed/borrow', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostV5CryptoLoanFixedRenew(params = {}) {
        return this.request('v5/crypto-loan-fixed/renew', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostV5CryptoLoanFixedSupply(params = {}) {
        return this.request('v5/crypto-loan-fixed/supply', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostV5CryptoLoanFixedBorrowOrderCancel(params = {}) {
        return this.request('v5/crypto-loan-fixed/borrow-order-cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostV5CryptoLoanFixedSupplyOrderCancel(params = {}) {
        return this.request('v5/crypto-loan-fixed/supply-order-cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostV5CryptoLoanFixedFullyRepay(params = {}) {
        return this.request('v5/crypto-loan-fixed/fully-repay', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostV5CryptoLoanFixedRepayCollateral(params = {}) {
        return this.request('v5/crypto-loan-fixed/repay-collateral', ['private'], 'POST', params, undefined, undefined, { 'cost': 50 });
    }
    privatePostV5InsLoanAssociationUid(params = {}) {
        return this.request('v5/ins-loan/association-uid', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5InsLoanRepayLoan(params = {}) {
        return this.request('v5/ins-loan/repay-loan', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5LendingPurchase(params = {}) {
        return this.request('v5/lending/purchase', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5LendingRedeem(params = {}) {
        return this.request('v5/lending/redeem', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5LendingRedeemCancel(params = {}) {
        return this.request('v5/lending/redeem-cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AccountSetCollateralSwitch(params = {}) {
        return this.request('v5/account/set-collateral-switch', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AccountSetCollateralSwitchBatch(params = {}) {
        return this.request('v5/account/set-collateral-switch-batch', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AccountDemoApplyMoney(params = {}) {
        return this.request('v5/account/demo-apply-money', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5BrokerAwardInfo(params = {}) {
        return this.request('v5/broker/award/info', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5BrokerAwardDistributeAward(params = {}) {
        return this.request('v5/broker/award/distribute-award', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5BrokerAwardDistributionRecord(params = {}) {
        return this.request('v5/broker/award/distribution-record', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5EarnPlaceOrder(params = {}) {
        return this.request('v5/earn/place-order', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5EventQuotes(params = {}) {
        return this.request('v5/event/quotes', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5EventCancel(params = {}) {
        return this.request('v5/event/cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5SpotXLaunchpoolUserActivityLog(params = {}) {
        return this.request('v5/spot-x/launchpool/user/activity-log', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5SpotXLaunchpoolUserHistory(params = {}) {
        return this.request('v5/spot-x/launchpool/user/history', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AlphaPredictionEventDetail(params = {}) {
        return this.request('v5/alpha/prediction/event-detail', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AlphaPredictionOrderEstimate(params = {}) {
        return this.request('v5/alpha/prediction/order-estimate', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AlphaPredictionBuy(params = {}) {
        return this.request('v5/alpha/prediction/buy', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AlphaPredictionSell(params = {}) {
        return this.request('v5/alpha/prediction/sell', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AlphaPredictionOrderList(params = {}) {
        return this.request('v5/alpha/prediction/order-list', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AlphaPredictionOrderBook(params = {}) {
        return this.request('v5/alpha/prediction/order-book', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AlphaPredictionTokenPrice(params = {}) {
        return this.request('v5/alpha/prediction/token-price', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AlphaPredictionPriceHistory(params = {}) {
        return this.request('v5/alpha/prediction/price-history', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AlphaPredictionPositionList(params = {}) {
        return this.request('v5/alpha/prediction/position-list', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AlphaPredictionPositionHistory(params = {}) {
        return this.request('v5/alpha/prediction/position-history', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AlphaPredictionPortfolioSummary(params = {}) {
        return this.request('v5/alpha/prediction/portfolio-summary', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AlphaPredictionSideMarketList(params = {}) {
        return this.request('v5/alpha/prediction/side-market-list', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AlphaPredictionSportsMatchList(params = {}) {
        return this.request('v5/alpha/prediction/sports/match-list', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
    privatePostV5AlphaPredictionSportsGroupStageDetail(params = {}) {
        return this.request('v5/alpha/prediction/sports/group-stage-detail', ['private'], 'POST', params, undefined, undefined, { 'cost': 5 });
    }
}

exports["default"] = bybit;
