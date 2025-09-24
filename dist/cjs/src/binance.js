'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var binance$1 = require('./abstract/binance.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var rsa = require('./base/functions/rsa.js');
var crypto = require('./base/functions/crypto.js');
var ed25519 = require('./static_dependencies/noble-curves/ed25519.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class binance
 * @augments Exchange
 */
class binance extends binance$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'binance',
            'name': 'Binance',
            'countries': [],
            'rateLimit': 50,
            'certified': true,
            'pro': true,
            // new metainfo2 interface
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': true,
                'addMargin': true,
                'borrowCrossMargin': true,
                'borrowIsolatedMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': true,
                'createDepositAddress': false,
                'createLimitBuyOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': true,
                'createMarketSellOrder': true,
                'createMarketSellOrderWithCost': true,
                'createOrder': true,
                'createOrders': true,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopLossOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': true,
                'createTakeProfitOrder': true,
                'createTrailingPercentOrder': true,
                'createTriggerOrder': true,
                'editOrder': true,
                'editOrders': true,
                'fetchAccounts': undefined,
                'fetchAllGreeks': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowInterest': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': true,
                'fetchCanceledAndClosedOrders': 'emulated',
                'fetchCanceledOrders': 'emulated',
                'fetchClosedOrder': false,
                'fetchClosedOrders': 'emulated',
                'fetchConvertCurrencies': true,
                'fetchConvertQuote': true,
                'fetchConvertTrade': true,
                'fetchConvertTradeHistory': true,
                'fetchCrossBorrowRate': true,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': true,
                'fetchFundingInterval': 'emulated',
                'fetchFundingIntervals': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchGreeks': true,
                'fetchIndexOHLCV': true,
                'fetchIsolatedBorrowRate': 'emulated',
                'fetchIsolatedBorrowRates': true,
                'fetchL3OrderBook': false,
                'fetchLastPrices': true,
                'fetchLedger': true,
                'fetchLedgerEntry': true,
                'fetchLeverage': 'emulated',
                'fetchLeverages': true,
                'fetchLeverageTiers': true,
                'fetchLiquidations': false,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': true,
                'fetchMarginAdjustmentHistory': true,
                'fetchMarginMode': true,
                'fetchMarginModes': true,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMarkPrice': true,
                'fetchMarkPrices': true,
                'fetchMyLiquidations': true,
                'fetchMySettlementHistory': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': true,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOption': true,
                'fetchOptionChain': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionHistory': false,
                'fetchPositionMode': true,
                'fetchPositions': true,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': true,
                'fetchPremiumIndexOHLCV': true,
                'fetchSettlementHistory': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTradingLimits': 'emulated',
                'fetchTransactionFee': 'emulated',
                'fetchTransactionFees': true,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': true,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': true,
                'repayCrossMargin': true,
                'repayIsolatedMargin': true,
                'sandbox': true,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': true,
                'setPositionMode': true,
                'signIn': false,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1s': '1s',
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/e9419b93-ccb0-46aa-9bff-c883f096274b',
                'test': {
                    'dapiPublic': 'https://testnet.binancefuture.com/dapi/v1',
                    'dapiPrivate': 'https://testnet.binancefuture.com/dapi/v1',
                    'dapiPrivateV2': 'https://testnet.binancefuture.com/dapi/v2',
                    'fapiPublic': 'https://testnet.binancefuture.com/fapi/v1',
                    'fapiPublicV2': 'https://testnet.binancefuture.com/fapi/v2',
                    'fapiPublicV3': 'https://testnet.binancefuture.com/fapi/v3',
                    'fapiPrivate': 'https://testnet.binancefuture.com/fapi/v1',
                    'fapiPrivateV2': 'https://testnet.binancefuture.com/fapi/v2',
                    'fapiPrivateV3': 'https://testnet.binancefuture.com/fapi/v3',
                    'public': 'https://testnet.binance.vision/api/v3',
                    'private': 'https://testnet.binance.vision/api/v3',
                    'v1': 'https://testnet.binance.vision/api/v1',
                },
                'demo': {
                    'dapiPublic': 'https://demo-dapi.binance.com/dapi/v1',
                    'dapiPrivate': 'https://demo-dapi.binance.com/dapi/v1',
                    'dapiPrivateV2': 'https://demo-dapi.binance.com/dapi/v2',
                    'fapiPublic': 'https://demo-fapi.binance.com/fapi/v1',
                    'fapiPublicV2': 'https://demo-fapi.binance.com/fapi/v2',
                    'fapiPublicV3': 'https://demo-fapi.binance.com/fapi/v3',
                    'fapiPrivate': 'https://demo-fapi.binance.com/fapi/v1',
                    'fapiPrivateV2': 'https://demo-fapi.binance.com/fapi/v2',
                    'fapiPrivateV3': 'https://demo-fapi.binance.com/fapi/v3',
                    'public': 'https://demo-api.binance.com/api/v3',
                    'private': 'https://demo-api.binance.com/api/v3',
                    'v1': 'https://demo-api.binance.com/api/v1',
                },
                'api': {
                    'sapi': 'https://api.binance.com/sapi/v1',
                    'sapiV2': 'https://api.binance.com/sapi/v2',
                    'sapiV3': 'https://api.binance.com/sapi/v3',
                    'sapiV4': 'https://api.binance.com/sapi/v4',
                    'dapiPublic': 'https://dapi.binance.com/dapi/v1',
                    'dapiPrivate': 'https://dapi.binance.com/dapi/v1',
                    'eapiPublic': 'https://eapi.binance.com/eapi/v1',
                    'eapiPrivate': 'https://eapi.binance.com/eapi/v1',
                    'dapiPrivateV2': 'https://dapi.binance.com/dapi/v2',
                    'dapiData': 'https://dapi.binance.com/futures/data',
                    'fapiPublic': 'https://fapi.binance.com/fapi/v1',
                    'fapiPublicV2': 'https://fapi.binance.com/fapi/v2',
                    'fapiPublicV3': 'https://fapi.binance.com/fapi/v3',
                    'fapiPrivate': 'https://fapi.binance.com/fapi/v1',
                    'fapiPrivateV2': 'https://fapi.binance.com/fapi/v2',
                    'fapiPrivateV3': 'https://fapi.binance.com/fapi/v3',
                    'fapiData': 'https://fapi.binance.com/futures/data',
                    'public': 'https://api.binance.com/api/v3',
                    'private': 'https://api.binance.com/api/v3',
                    'v1': 'https://api.binance.com/api/v1',
                    'papi': 'https://papi.binance.com/papi/v1',
                },
                'www': 'https://www.binance.com',
                'referral': {
                    'url': 'https://accounts.binance.com/en/register?ref=D7YA7CLY',
                    'discount': 0.1,
                },
                'doc': [
                    'https://developers.binance.com/en',
                ],
                'api_management': 'https://www.binance.com/en/usercenter/settings/api-management',
                'fees': 'https://www.binance.com/en/fee/schedule',
            },
            'api': {
                // the API structure below will need 3-layer apidefs
                'sapi': {
                    // IP (sapi) request rate limit of 12 000 per minute
                    // 1 IP (sapi) => cost = 0.1 => (1000 / (50 * 0.1)) * 60 = 12000
                    // 10 IP (sapi) => cost = 1
                    // UID (sapi) request rate limit of 180 000 per minute
                    // 1 UID (sapi) => cost = 0.006667 => (1000 / (50 * 0.006667)) * 60 = 180000
                    'get': {
                        // copy trading
                        'copyTrading/futures/userStatus': 2,
                        'copyTrading/futures/leadSymbol': 2,
                        'system/status': 0.1,
                        // these endpoints require this.apiKey
                        'accountSnapshot': 240,
                        'account/info': 0.1,
                        'margin/asset': 1,
                        'margin/pair': 1,
                        'margin/allAssets': 0.1,
                        'margin/allPairs': 0.1,
                        'margin/priceIndex': 1,
                        // these endpoints require this.apiKey + this.secret
                        'spot/delist-schedule': 10,
                        'asset/assetDividend': 1,
                        'asset/dribblet': 0.1,
                        'asset/transfer': 0.1,
                        'asset/assetDetail': 0.1,
                        'asset/tradeFee': 0.1,
                        'asset/ledger-transfer/cloud-mining/queryByPage': 4.0002,
                        'asset/convert-transfer/queryByPage': 0.033335,
                        'asset/wallet/balance': 6,
                        'asset/custody/transfer-history': 6,
                        'margin/borrow-repay': 1,
                        'margin/loan': 1,
                        'margin/repay': 1,
                        'margin/account': 1,
                        'margin/transfer': 0.1,
                        'margin/interestHistory': 0.1,
                        'margin/forceLiquidationRec': 0.1,
                        'margin/order': 1,
                        'margin/openOrders': 1,
                        'margin/allOrders': 20,
                        'margin/myTrades': 1,
                        'margin/maxBorrowable': 5,
                        'margin/maxTransferable': 5,
                        'margin/tradeCoeff': 1,
                        'margin/isolated/transfer': 0.1,
                        'margin/isolated/account': 1,
                        'margin/isolated/pair': 1,
                        'margin/isolated/allPairs': 1,
                        'margin/isolated/accountLimit': 0.1,
                        'margin/interestRateHistory': 0.1,
                        'margin/orderList': 1,
                        'margin/allOrderList': 20,
                        'margin/openOrderList': 1,
                        'margin/crossMarginData': { 'cost': 0.1, 'noCoin': 0.5 },
                        'margin/isolatedMarginData': { 'cost': 0.1, 'noCoin': 1 },
                        'margin/isolatedMarginTier': 0.1,
                        'margin/rateLimit/order': 2,
                        'margin/dribblet': 0.1,
                        'margin/dust': 20.001,
                        'margin/crossMarginCollateralRatio': 10,
                        'margin/exchange-small-liability': 0.6667,
                        'margin/exchange-small-liability-history': 0.6667,
                        'margin/next-hourly-interest-rate': 0.6667,
                        'margin/capital-flow': 10,
                        'margin/delist-schedule': 10,
                        'margin/available-inventory': 0.3334,
                        'margin/leverageBracket': 0.1,
                        'loan/vip/loanable/data': 40,
                        'loan/vip/collateral/data': 40,
                        'loan/vip/request/data': 2.6668,
                        'loan/vip/request/interestRate': 2.6668,
                        'loan/income': 40.002,
                        'loan/ongoing/orders': 40,
                        'loan/ltv/adjustment/history': 40,
                        'loan/borrow/history': 40,
                        'loan/repay/history': 40,
                        'loan/loanable/data': 40,
                        'loan/collateral/data': 40,
                        'loan/repay/collateral/rate': 600,
                        'loan/flexible/ongoing/orders': 30,
                        'loan/flexible/borrow/history': 40,
                        'loan/flexible/repay/history': 40,
                        'loan/flexible/ltv/adjustment/history': 40,
                        'loan/vip/ongoing/orders': 40,
                        'loan/vip/repay/history': 40,
                        'loan/vip/collateral/account': 600,
                        'fiat/orders': 600.03,
                        'fiat/payments': 0.1,
                        'futures/transfer': 1,
                        'futures/histDataLink': 0.1,
                        'rebate/taxQuery': 80.004,
                        'capital/config/getall': 1,
                        'capital/deposit/address': 1,
                        'capital/deposit/address/list': 1,
                        'capital/deposit/hisrec': 0.1,
                        'capital/deposit/subAddress': 0.1,
                        'capital/deposit/subHisrec': 0.1,
                        'capital/withdraw/history': 2,
                        'capital/withdraw/address/list': 10,
                        'capital/contract/convertible-coins': 4.0002,
                        'convert/tradeFlow': 20.001,
                        'convert/exchangeInfo': 50,
                        'convert/assetInfo': 10,
                        'convert/orderStatus': 0.6667,
                        'convert/limit/queryOpenOrders': 20.001,
                        'account/status': 0.1,
                        'account/apiTradingStatus': 0.1,
                        'account/apiRestrictions/ipRestriction': 0.1,
                        'bnbBurn': 0.1,
                        'sub-account/futures/account': 1,
                        'sub-account/futures/accountSummary': 0.1,
                        'sub-account/futures/positionRisk': 1,
                        'sub-account/futures/internalTransfer': 0.1,
                        'sub-account/list': 0.1,
                        'sub-account/margin/account': 1,
                        'sub-account/margin/accountSummary': 1,
                        'sub-account/spotSummary': 0.1,
                        'sub-account/status': 1,
                        'sub-account/sub/transfer/history': 0.1,
                        'sub-account/transfer/subUserHistory': 0.1,
                        'sub-account/universalTransfer': 0.1,
                        'sub-account/apiRestrictions/ipRestriction/thirdPartyList': 1,
                        'sub-account/transaction-statistics': 0.40002,
                        'sub-account/subAccountApi/ipRestriction': 20.001,
                        'managed-subaccount/asset': 0.1,
                        'managed-subaccount/accountSnapshot': 240,
                        'managed-subaccount/queryTransLogForInvestor': 0.1,
                        'managed-subaccount/queryTransLogForTradeParent': 0.40002,
                        'managed-subaccount/fetch-future-asset': 0.40002,
                        'managed-subaccount/marginAsset': 0.1,
                        'managed-subaccount/info': 0.40002,
                        'managed-subaccount/deposit/address': 0.006667,
                        'managed-subaccount/query-trans-log': 0.40002,
                        // lending endpoints
                        'lending/daily/product/list': 0.1,
                        'lending/daily/userLeftQuota': 0.1,
                        'lending/daily/userRedemptionQuota': 0.1,
                        'lending/daily/token/position': 0.1,
                        'lending/union/account': 0.1,
                        'lending/union/purchaseRecord': 0.1,
                        'lending/union/redemptionRecord': 0.1,
                        'lending/union/interestHistory': 0.1,
                        'lending/project/list': 0.1,
                        'lending/project/position/list': 0.1,
                        // eth-staking
                        'eth-staking/eth/history/stakingHistory': 15,
                        'eth-staking/eth/history/redemptionHistory': 15,
                        'eth-staking/eth/history/rewardsHistory': 15,
                        'eth-staking/eth/quota': 15,
                        'eth-staking/eth/history/rateHistory': 15,
                        'eth-staking/account': 15,
                        'eth-staking/wbeth/history/wrapHistory': 15,
                        'eth-staking/wbeth/history/unwrapHistory': 15,
                        'eth-staking/eth/history/wbethRewardsHistory': 15,
                        'sol-staking/sol/history/stakingHistory': 15,
                        'sol-staking/sol/history/redemptionHistory': 15,
                        'sol-staking/sol/history/bnsolRewardsHistory': 15,
                        'sol-staking/sol/history/rateHistory': 15,
                        'sol-staking/account': 15,
                        'sol-staking/sol/quota': 15,
                        // mining endpoints
                        'mining/pub/algoList': 0.1,
                        'mining/pub/coinList': 0.1,
                        'mining/worker/detail': 0.5,
                        'mining/worker/list': 0.5,
                        'mining/payment/list': 0.5,
                        'mining/statistics/user/status': 0.5,
                        'mining/statistics/user/list': 0.5,
                        'mining/payment/uid': 0.5,
                        // liquid swap endpoints
                        'bswap/pools': 0.1,
                        'bswap/liquidity': { 'cost': 0.1, 'noPoolId': 1 },
                        'bswap/liquidityOps': 20.001,
                        'bswap/quote': 1.00005,
                        'bswap/swap': 20.001,
                        'bswap/poolConfigure': 1.00005,
                        'bswap/addLiquidityPreview': 1.00005,
                        'bswap/removeLiquidityPreview': 1.00005,
                        'bswap/unclaimedRewards': 6.667,
                        'bswap/claimedHistory': 6.667,
                        // leveraged token endpoints
                        'blvt/tokenInfo': 0.1,
                        'blvt/subscribe/record': 0.1,
                        'blvt/redeem/record': 0.1,
                        'blvt/userLimit': 0.1,
                        // broker api TODO (NOT IN DOCS)
                        'apiReferral/ifNewUser': 1,
                        'apiReferral/customization': 1,
                        'apiReferral/userCustomization': 1,
                        'apiReferral/rebate/recentRecord': 1,
                        'apiReferral/rebate/historicalRecord': 1,
                        'apiReferral/kickback/recentRecord': 1,
                        'apiReferral/kickback/historicalRecord': 1,
                        // brokerage API TODO https://binance-docs.github.io/Brokerage-API/General/ does not state ratelimits
                        'broker/subAccountApi': 1,
                        'broker/subAccount': 1,
                        'broker/subAccountApi/commission/futures': 1,
                        'broker/subAccountApi/commission/coinFutures': 1,
                        'broker/info': 1,
                        'broker/transfer': 1,
                        'broker/transfer/futures': 1,
                        'broker/rebate/recentRecord': 1,
                        'broker/rebate/historicalRecord': 1,
                        'broker/subAccount/bnbBurn/status': 1,
                        'broker/subAccount/depositHist': 1,
                        'broker/subAccount/spotSummary': 1,
                        'broker/subAccount/marginSummary': 1,
                        'broker/subAccount/futuresSummary': 1,
                        'broker/rebate/futures/recentRecord': 1,
                        'broker/subAccountApi/ipRestriction': 1,
                        'broker/universalTransfer': 1,
                        // v2 not supported yet
                        // GET /sapi/v2/broker/subAccount/futuresSummary
                        'account/apiRestrictions': 0.1,
                        // c2c / p2p
                        'c2c/orderMatch/listUserOrderHistory': 0.1,
                        // nft endpoints
                        'nft/history/transactions': 20.001,
                        'nft/history/deposit': 20.001,
                        'nft/history/withdraw': 20.001,
                        'nft/user/getAsset': 20.001,
                        'pay/transactions': 20.001,
                        'giftcard/verify': 0.1,
                        'giftcard/cryptography/rsa-public-key': 0.1,
                        'giftcard/buyCode/token-limit': 0.1,
                        'algo/spot/openOrders': 0.1,
                        'algo/spot/historicalOrders': 0.1,
                        'algo/spot/subOrders': 0.1,
                        'algo/futures/openOrders': 0.1,
                        'algo/futures/historicalOrders': 0.1,
                        'algo/futures/subOrders': 0.1,
                        'portfolio/account': 0.1,
                        'portfolio/collateralRate': 5,
                        'portfolio/pmLoan': 3.3335,
                        'portfolio/interest-history': 0.6667,
                        'portfolio/asset-index-price': 0.1,
                        'portfolio/repay-futures-switch': 3,
                        'portfolio/margin-asset-leverage': 5,
                        'portfolio/balance': 2,
                        'portfolio/negative-balance-exchange-record': 2,
                        'portfolio/pmloan-history': 5,
                        'portfolio/earn-asset-balance': 150,
                        // staking
                        'staking/productList': 0.1,
                        'staking/position': 0.1,
                        'staking/stakingRecord': 0.1,
                        'staking/personalLeftQuota': 0.1,
                        'lending/auto-invest/target-asset/list': 0.1,
                        'lending/auto-invest/target-asset/roi/list': 0.1,
                        'lending/auto-invest/all/asset': 0.1,
                        'lending/auto-invest/source-asset/list': 0.1,
                        'lending/auto-invest/plan/list': 0.1,
                        'lending/auto-invest/plan/id': 0.1,
                        'lending/auto-invest/history/list': 0.1,
                        'lending/auto-invest/index/info': 0.1,
                        'lending/auto-invest/index/user-summary': 0.1,
                        'lending/auto-invest/one-off/status': 0.1,
                        'lending/auto-invest/redeem/history': 0.1,
                        'lending/auto-invest/rebalance/history': 0.1,
                        // simple earn
                        'simple-earn/flexible/list': 15,
                        'simple-earn/locked/list': 15,
                        'simple-earn/flexible/personalLeftQuota': 15,
                        'simple-earn/locked/personalLeftQuota': 15,
                        'simple-earn/flexible/subscriptionPreview': 15,
                        'simple-earn/locked/subscriptionPreview': 15,
                        'simple-earn/flexible/history/rateHistory': 15,
                        'simple-earn/flexible/position': 15,
                        'simple-earn/locked/position': 15,
                        'simple-earn/account': 15,
                        'simple-earn/flexible/history/subscriptionRecord': 15,
                        'simple-earn/locked/history/subscriptionRecord': 15,
                        'simple-earn/flexible/history/redemptionRecord': 15,
                        'simple-earn/locked/history/redemptionRecord': 15,
                        'simple-earn/flexible/history/rewardsRecord': 15,
                        'simple-earn/locked/history/rewardsRecord': 15,
                        'simple-earn/flexible/history/collateralRecord': 0.1,
                        // Convert
                        'dci/product/list': 0.1,
                        'dci/product/positions': 0.1,
                        'dci/product/accounts': 0.1,
                    },
                    'post': {
                        'asset/dust': 0.06667,
                        'asset/dust-btc': 0.1,
                        'asset/transfer': 6.0003,
                        'asset/get-funding-asset': 0.1,
                        'asset/convert-transfer': 0.033335,
                        'account/disableFastWithdrawSwitch': 0.1,
                        'account/enableFastWithdrawSwitch': 0.1,
                        // 'account/apiRestrictions/ipRestriction': 1, discontinued
                        // 'account/apiRestrictions/ipRestriction/ipList': 1, discontinued
                        'capital/withdraw/apply': 4.0002,
                        'capital/contract/convertible-coins': 4.0002,
                        'capital/deposit/credit-apply': 0.1,
                        'margin/borrow-repay': 20.001,
                        'margin/transfer': 4.0002,
                        'margin/loan': 20.001,
                        'margin/repay': 20.001,
                        'margin/order': 0.040002,
                        'margin/order/oco': 0.040002,
                        'margin/dust': 20.001,
                        'margin/exchange-small-liability': 20.001,
                        // 'margin/isolated/create': 1, discontinued
                        'margin/isolated/transfer': 4.0002,
                        'margin/isolated/account': 2.0001,
                        'margin/max-leverage': 300,
                        'bnbBurn': 0.1,
                        'sub-account/virtualSubAccount': 0.1,
                        'sub-account/margin/transfer': 4.0002,
                        'sub-account/margin/enable': 0.1,
                        'sub-account/futures/enable': 0.1,
                        'sub-account/futures/transfer': 0.1,
                        'sub-account/futures/internalTransfer': 0.1,
                        'sub-account/transfer/subToSub': 0.1,
                        'sub-account/transfer/subToMaster': 0.1,
                        'sub-account/universalTransfer': 0.1,
                        'sub-account/options/enable': 0.1,
                        'managed-subaccount/deposit': 0.1,
                        'managed-subaccount/withdraw': 0.1,
                        'userDataStream': 0.1,
                        'userDataStream/isolated': 0.1,
                        'futures/transfer': 0.1,
                        // lending
                        'lending/customizedFixed/purchase': 0.1,
                        'lending/daily/purchase': 0.1,
                        'lending/daily/redeem': 0.1,
                        // liquid swap endpoints
                        'bswap/liquidityAdd': 60,
                        'bswap/liquidityRemove': 60,
                        'bswap/swap': 60,
                        'bswap/claimRewards': 6.667,
                        // leveraged token endpoints
                        'blvt/subscribe': 0.1,
                        'blvt/redeem': 0.1,
                        // brokerage API TODO: NO MENTION OF RATELIMITS IN BROKERAGE DOCS
                        'apiReferral/customization': 1,
                        'apiReferral/userCustomization': 1,
                        'apiReferral/rebate/historicalRecord': 1,
                        'apiReferral/kickback/historicalRecord': 1,
                        'broker/subAccount': 1,
                        'broker/subAccount/margin': 1,
                        'broker/subAccount/futures': 1,
                        'broker/subAccountApi': 1,
                        'broker/subAccountApi/permission': 1,
                        'broker/subAccountApi/commission': 1,
                        'broker/subAccountApi/commission/futures': 1,
                        'broker/subAccountApi/commission/coinFutures': 1,
                        'broker/transfer': 1,
                        'broker/transfer/futures': 1,
                        'broker/rebate/historicalRecord': 1,
                        'broker/subAccount/bnbBurn/spot': 1,
                        'broker/subAccount/bnbBurn/marginInterest': 1,
                        'broker/subAccount/blvt': 1,
                        'broker/subAccountApi/ipRestriction': 1,
                        'broker/subAccountApi/ipRestriction/ipList': 1,
                        'broker/universalTransfer': 1,
                        'broker/subAccountApi/permission/universalTransfer': 1,
                        'broker/subAccountApi/permission/vanillaOptions': 1,
                        //
                        'giftcard/createCode': 0.1,
                        'giftcard/redeemCode': 0.1,
                        'giftcard/buyCode': 0.1,
                        'algo/spot/newOrderTwap': 20.001,
                        'algo/futures/newOrderVp': 20.001,
                        'algo/futures/newOrderTwap': 20.001,
                        // staking
                        'staking/purchase': 0.1,
                        'staking/redeem': 0.1,
                        'staking/setAutoStaking': 0.1,
                        // eth-staking
                        'eth-staking/eth/stake': 15,
                        'eth-staking/eth/redeem': 15,
                        'eth-staking/wbeth/wrap': 15,
                        'sol-staking/sol/stake': 15,
                        'sol-staking/sol/redeem': 15,
                        // mining endpoints
                        'mining/hash-transfer/config': 0.5,
                        'mining/hash-transfer/config/cancel': 0.5,
                        'portfolio/repay': 20.001,
                        'loan/vip/renew': 40.002,
                        'loan/vip/borrow': 40.002,
                        'loan/borrow': 40.002,
                        'loan/repay': 40.002,
                        'loan/adjust/ltv': 40.002,
                        'loan/customize/margin_call': 40.002,
                        'loan/flexible/repay': 40.002,
                        'loan/flexible/adjust/ltv': 40.002,
                        'loan/vip/repay': 40.002,
                        'convert/getQuote': 1.3334,
                        'convert/acceptQuote': 3.3335,
                        'convert/limit/placeOrder': 3.3335,
                        'convert/limit/cancelOrder': 1.3334,
                        'portfolio/auto-collection': 150,
                        'portfolio/asset-collection': 6,
                        'portfolio/bnb-transfer': 150,
                        'portfolio/repay-futures-switch': 150,
                        'portfolio/repay-futures-negative-balance': 150,
                        'portfolio/mint': 20,
                        'portfolio/redeem': 20,
                        'portfolio/earn-asset-transfer': 150,
                        'lending/auto-invest/plan/add': 0.1,
                        'lending/auto-invest/plan/edit': 0.1,
                        'lending/auto-invest/plan/edit-status': 0.1,
                        'lending/auto-invest/one-off': 0.1,
                        'lending/auto-invest/redeem': 0.1,
                        // simple earn
                        'simple-earn/flexible/subscribe': 0.1,
                        'simple-earn/locked/subscribe': 0.1,
                        'simple-earn/flexible/redeem': 0.1,
                        'simple-earn/locked/redeem': 0.1,
                        'simple-earn/flexible/setAutoSubscribe': 15,
                        'simple-earn/locked/setAutoSubscribe': 15,
                        'simple-earn/locked/setRedeemOption': 5,
                        // convert
                        'dci/product/subscribe': 0.1,
                        'dci/product/auto_compound/edit': 0.1,
                    },
                    'put': {
                        'userDataStream': 0.1,
                        'userDataStream/isolated': 0.1,
                    },
                    'delete': {
                        // 'account/apiRestrictions/ipRestriction/ipList': 1, discontinued
                        'margin/openOrders': 0.1,
                        'margin/order': 0.006667,
                        'margin/orderList': 0.006667,
                        'margin/isolated/account': 2.0001,
                        'userDataStream': 0.1,
                        'userDataStream/isolated': 0.1,
                        // brokerage API TODO NO MENTION OF RATELIMIT IN BROKERAGE DOCS
                        'broker/subAccountApi': 1,
                        'broker/subAccountApi/ipRestriction/ipList': 1,
                        'algo/spot/order': 0.1,
                        'algo/futures/order': 0.1,
                        'sub-account/subAccountApi/ipRestriction/ipList': 20.001, // Weight(UID): 3000 => cost = 0.006667 * 3000 = 20.001
                    },
                },
                'sapiV2': {
                    'get': {
                        'eth-staking/account': 15,
                        'sub-account/futures/account': 0.1,
                        'sub-account/futures/accountSummary': 1,
                        'sub-account/futures/positionRisk': 0.1,
                        'loan/flexible/ongoing/orders': 30,
                        'loan/flexible/borrow/history': 40,
                        'loan/flexible/repay/history': 40,
                        'loan/flexible/ltv/adjustment/history': 40,
                        'loan/flexible/loanable/data': 40,
                        'loan/flexible/collateral/data': 40,
                        'portfolio/account': 2,
                    },
                    'post': {
                        'eth-staking/eth/stake': 15,
                        'sub-account/subAccountApi/ipRestriction': 20.001,
                        'loan/flexible/borrow': 40.002,
                        'loan/flexible/repay': 40.002,
                        'loan/flexible/adjust/ltv': 40.002, // Weight(UID): 6000 => cost = 0.006667 * 6000 = 40.002
                    },
                },
                'sapiV3': {
                    'get': {
                        'sub-account/assets': 0.40002, // Weight(UID): 60 => cost =  0.006667 * 60 = 0.40002
                    },
                    'post': {
                        'asset/getUserAsset': 0.5,
                    },
                },
                'sapiV4': {
                    'get': {
                        'sub-account/assets': 0.40002, // Weight(UID): 60 => cost = 0.006667 * 60 = 0.40002
                    },
                },
                'dapiPublic': {
                    'get': {
                        'ping': 1,
                        'time': 1,
                        'exchangeInfo': 1,
                        'depth': { 'cost': 2, 'byLimit': [[50, 2], [100, 5], [500, 10], [1000, 20]] },
                        'trades': 5,
                        'historicalTrades': 20,
                        'aggTrades': 20,
                        'premiumIndex': 10,
                        'fundingRate': 1,
                        'klines': { 'cost': 1, 'byLimit': [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                        'continuousKlines': { 'cost': 1, 'byLimit': [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                        'indexPriceKlines': { 'cost': 1, 'byLimit': [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                        'markPriceKlines': { 'cost': 1, 'byLimit': [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                        'premiumIndexKlines': { 'cost': 1, 'byLimit': [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                        'ticker/24hr': { 'cost': 1, 'noSymbol': 40 },
                        'ticker/price': { 'cost': 1, 'noSymbol': 2 },
                        'ticker/bookTicker': { 'cost': 2, 'noSymbol': 5 },
                        'constituents': 2,
                        'openInterest': 1,
                        'fundingInfo': 1,
                    },
                },
                'dapiData': {
                    'get': {
                        'delivery-price': 1,
                        'openInterestHist': 1,
                        'topLongShortAccountRatio': 1,
                        'topLongShortPositionRatio': 1,
                        'globalLongShortAccountRatio': 1,
                        'takerBuySellVol': 1,
                        'basis': 1,
                    },
                },
                'dapiPrivate': {
                    'get': {
                        'positionSide/dual': 30,
                        'orderAmendment': 1,
                        'order': 1,
                        'openOrder': 1,
                        'openOrders': { 'cost': 1, 'noSymbol': 5 },
                        'allOrders': { 'cost': 20, 'noSymbol': 40 },
                        'balance': 1,
                        'account': 5,
                        'positionMargin/history': 1,
                        'positionRisk': 1,
                        'userTrades': { 'cost': 20, 'noSymbol': 40 },
                        'income': 20,
                        'leverageBracket': 1,
                        'forceOrders': { 'cost': 20, 'noSymbol': 50 },
                        'adlQuantile': 5,
                        'commissionRate': 20,
                        'income/asyn': 5,
                        'income/asyn/id': 5,
                        'trade/asyn': 0.5,
                        'trade/asyn/id': 0.5,
                        'order/asyn': 0.5,
                        'order/asyn/id': 0.5,
                        'pmExchangeInfo': 0.5,
                        'pmAccountInfo': 0.5, // Weight(IP): 5 => cost = 0.1 * 5 = 0.5
                    },
                    'post': {
                        'positionSide/dual': 1,
                        'order': 4,
                        'batchOrders': 5,
                        'countdownCancelAll': 10,
                        'leverage': 1,
                        'marginType': 1,
                        'positionMargin': 1,
                        'listenKey': 1,
                    },
                    'put': {
                        'listenKey': 1,
                        'order': 1,
                        'batchOrders': 5,
                    },
                    'delete': {
                        'order': 1,
                        'allOpenOrders': 1,
                        'batchOrders': 5,
                        'listenKey': 1,
                    },
                },
                'dapiPrivateV2': {
                    'get': {
                        'leverageBracket': 1,
                    },
                },
                'fapiPublic': {
                    'get': {
                        'ping': 1,
                        'time': 1,
                        'exchangeInfo': 1,
                        'depth': { 'cost': 2, 'byLimit': [[50, 2], [100, 5], [500, 10], [1000, 20]] },
                        'trades': 5,
                        'historicalTrades': 20,
                        'aggTrades': 20,
                        'klines': { 'cost': 1, 'byLimit': [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                        'continuousKlines': { 'cost': 1, 'byLimit': [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                        'markPriceKlines': { 'cost': 1, 'byLimit': [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                        'indexPriceKlines': { 'cost': 1, 'byLimit': [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                        'premiumIndexKlines': { 'cost': 1, 'byLimit': [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                        'fundingRate': 1,
                        'fundingInfo': 1,
                        'premiumIndex': 1,
                        'ticker/24hr': { 'cost': 1, 'noSymbol': 40 },
                        'ticker/price': { 'cost': 1, 'noSymbol': 2 },
                        'ticker/bookTicker': { 'cost': 1, 'noSymbol': 2 },
                        'openInterest': 1,
                        'indexInfo': 1,
                        'assetIndex': { 'cost': 1, 'noSymbol': 10 },
                        'constituents': 2,
                        'apiTradingStatus': { 'cost': 1, 'noSymbol': 10 },
                        'lvtKlines': 1,
                        'convert/exchangeInfo': 4,
                        'insuranceBalance': 1,
                    },
                },
                'fapiData': {
                    'get': {
                        'delivery-price': 1,
                        'openInterestHist': 1,
                        'topLongShortAccountRatio': 1,
                        'topLongShortPositionRatio': 1,
                        'globalLongShortAccountRatio': 1,
                        'takerlongshortRatio': 1,
                        'basis': 1,
                    },
                },
                'fapiPrivate': {
                    'get': {
                        'forceOrders': { 'cost': 20, 'noSymbol': 50 },
                        'allOrders': 5,
                        'openOrder': 1,
                        'openOrders': { 'cost': 1, 'noSymbol': 40 },
                        'order': 1,
                        'account': 5,
                        'balance': 5,
                        'leverageBracket': 1,
                        'positionMargin/history': 1,
                        'positionRisk': 5,
                        'positionSide/dual': 30,
                        'userTrades': 5,
                        'income': 30,
                        'commissionRate': 20,
                        'rateLimit/order': 1,
                        'apiTradingStatus': 1,
                        'multiAssetsMargin': 30,
                        // broker endpoints
                        'apiReferral/ifNewUser': 1,
                        'apiReferral/customization': 1,
                        'apiReferral/userCustomization': 1,
                        'apiReferral/traderNum': 1,
                        'apiReferral/overview': 1,
                        'apiReferral/tradeVol': 1,
                        'apiReferral/rebateVol': 1,
                        'apiReferral/traderSummary': 1,
                        'adlQuantile': 5,
                        'pmAccountInfo': 5,
                        'orderAmendment': 1,
                        'income/asyn': 1000,
                        'income/asyn/id': 10,
                        'order/asyn': 1000,
                        'order/asyn/id': 10,
                        'trade/asyn': 1000,
                        'trade/asyn/id': 10,
                        'feeBurn': 1,
                        'symbolConfig': 5,
                        'accountConfig': 5,
                        'convert/orderStatus': 5,
                    },
                    'post': {
                        'batchOrders': 5,
                        'positionSide/dual': 1,
                        'positionMargin': 1,
                        'marginType': 1,
                        'order': 4,
                        'leverage': 1,
                        'listenKey': 1,
                        'countdownCancelAll': 10,
                        'multiAssetsMargin': 1,
                        // broker endpoints
                        'apiReferral/customization': 1,
                        'apiReferral/userCustomization': 1,
                        'feeBurn': 1,
                        'convert/getQuote': 200,
                        'convert/acceptQuote': 20,
                    },
                    'put': {
                        'listenKey': 1,
                        'order': 1,
                        'batchOrders': 5,
                    },
                    'delete': {
                        'batchOrders': 1,
                        'order': 1,
                        'allOpenOrders': 1,
                        'listenKey': 1,
                    },
                },
                'fapiPublicV2': {
                    'get': {
                        'ticker/price': 0,
                    },
                },
                'fapiPrivateV2': {
                    'get': {
                        'account': 1,
                        'balance': 1,
                        'positionRisk': 1,
                    },
                },
                'fapiPublicV3': {
                    'get': {},
                },
                'fapiPrivateV3': {
                    'get': {
                        'account': 1,
                        'balance': 1,
                        'positionRisk': 1,
                    },
                },
                'eapiPublic': {
                    'get': {
                        'ping': 1,
                        'time': 1,
                        'exchangeInfo': 1,
                        'index': 1,
                        'ticker': 5,
                        'mark': 5,
                        'depth': 1,
                        'klines': 1,
                        'trades': 5,
                        'historicalTrades': 20,
                        'exerciseHistory': 3,
                        'openInterest': 3,
                    },
                },
                'eapiPrivate': {
                    'get': {
                        'account': 3,
                        'position': 5,
                        'openOrders': { 'cost': 1, 'noSymbol': 40 },
                        'historyOrders': 3,
                        'userTrades': 5,
                        'exerciseRecord': 5,
                        'bill': 1,
                        'income/asyn': 5,
                        'income/asyn/id': 5,
                        'marginAccount': 3,
                        'mmp': 1,
                        'countdownCancelAll': 1,
                        'order': 1,
                        'block/order/orders': 5,
                        'block/order/execute': 5,
                        'block/user-trades': 5,
                        'blockTrades': 5,
                    },
                    'post': {
                        'order': 1,
                        'batchOrders': 5,
                        'listenKey': 1,
                        'mmpSet': 1,
                        'mmpReset': 1,
                        'countdownCancelAll': 1,
                        'countdownCancelAllHeartBeat': 10,
                        'block/order/create': 5,
                        'block/order/execute': 5,
                    },
                    'put': {
                        'listenKey': 1,
                        'block/order/create': 5,
                    },
                    'delete': {
                        'order': 1,
                        'batchOrders': 1,
                        'allOpenOrders': 1,
                        'allOpenOrdersByUnderlying': 1,
                        'listenKey': 1,
                        'block/order/create': 5,
                    },
                },
                'public': {
                    // IP (api) request rate limit of 6000 per minute
                    // 1 IP (api) => cost = 0.2 => (1000 / (50 * 0.2)) * 60 = 6000
                    'get': {
                        'ping': 0.2,
                        'time': 0.2,
                        'depth': { 'cost': 1, 'byLimit': [[100, 1], [500, 5], [1000, 10], [5000, 50]] },
                        'trades': 2,
                        'aggTrades': 0.4,
                        'historicalTrades': 2,
                        'klines': 0.4,
                        'uiKlines': 0.4,
                        'ticker/24hr': { 'cost': 0.4, 'noSymbol': 16 },
                        'ticker': { 'cost': 0.4, 'noSymbol': 16 },
                        'ticker/tradingDay': 0.8,
                        'ticker/price': { 'cost': 0.4, 'noSymbol': 0.8 },
                        'ticker/bookTicker': { 'cost': 0.4, 'noSymbol': 0.8 },
                        'exchangeInfo': 4,
                        'avgPrice': 0.4,
                    },
                    'put': {
                        'userDataStream': 0.4,
                    },
                    'post': {
                        'userDataStream': 0.4,
                    },
                    'delete': {
                        'userDataStream': 0.4,
                    },
                },
                'private': {
                    'get': {
                        'allOrderList': 4,
                        'openOrderList': 1.2,
                        'orderList': 0.8,
                        'order': 0.8,
                        'openOrders': { 'cost': 1.2, 'noSymbol': 16 },
                        'allOrders': 4,
                        'account': 4,
                        'myTrades': 4,
                        'rateLimit/order': 8,
                        'myPreventedMatches': 4,
                        'myAllocations': 4,
                        'account/commission': 4,
                    },
                    'post': {
                        'order/oco': 0.2,
                        'orderList/oco': 0.2,
                        'orderList/oto': 0.2,
                        'orderList/otoco': 0.2,
                        'sor/order': 0.2,
                        'sor/order/test': 0.2,
                        'order': 0.2,
                        'order/cancelReplace': 0.2,
                        'order/test': 0.2,
                    },
                    'delete': {
                        'openOrders': 0.2,
                        'orderList': 0.2,
                        'order': 0.2,
                    },
                },
                'papi': {
                    // IP (papi) request rate limit of 6000 per minute
                    // 1 IP (papi) => cost = 0.2 => (1000 / (50 * 0.2)) * 60 = 6000
                    // Order (papi) request rate limit of 1200 per minute
                    // 1 Order (papi) => cost = 1 => (1000 / (50 * 1)) * 60 = 1200
                    'get': {
                        'ping': 0.2,
                        'um/order': 1,
                        'um/openOrder': 1,
                        'um/openOrders': { 'cost': 1, 'noSymbol': 40 },
                        'um/allOrders': 5,
                        'cm/order': 1,
                        'cm/openOrder': 1,
                        'cm/openOrders': { 'cost': 1, 'noSymbol': 40 },
                        'cm/allOrders': 20,
                        'um/conditional/openOrder': 1,
                        'um/conditional/openOrders': { 'cost': 1, 'noSymbol': 40 },
                        'um/conditional/orderHistory': 1,
                        'um/conditional/allOrders': { 'cost': 1, 'noSymbol': 40 },
                        'cm/conditional/openOrder': 1,
                        'cm/conditional/openOrders': { 'cost': 1, 'noSymbol': 40 },
                        'cm/conditional/orderHistory': 1,
                        'cm/conditional/allOrders': 40,
                        'margin/order': 10,
                        'margin/openOrders': 5,
                        'margin/allOrders': 100,
                        'margin/orderList': 5,
                        'margin/allOrderList': 100,
                        'margin/openOrderList': 5,
                        'margin/myTrades': 5,
                        'balance': 4,
                        'account': 4,
                        'margin/maxBorrowable': 1,
                        'margin/maxWithdraw': 1,
                        'um/positionRisk': 1,
                        'cm/positionRisk': 0.2,
                        'um/positionSide/dual': 6,
                        'cm/positionSide/dual': 6,
                        'um/userTrades': 5,
                        'cm/userTrades': 20,
                        'um/leverageBracket': 0.2,
                        'cm/leverageBracket': 0.2,
                        'margin/forceOrders': 1,
                        'um/forceOrders': { 'cost': 20, 'noSymbol': 50 },
                        'cm/forceOrders': { 'cost': 20, 'noSymbol': 50 },
                        'um/apiTradingStatus': { 'cost': 0.2, 'noSymbol': 2 },
                        'um/commissionRate': 4,
                        'cm/commissionRate': 4,
                        'margin/marginLoan': 2,
                        'margin/repayLoan': 2,
                        'margin/marginInterestHistory': 0.2,
                        'portfolio/interest-history': 10,
                        'um/income': 6,
                        'cm/income': 6,
                        'um/account': 1,
                        'cm/account': 1,
                        'repay-futures-switch': 6,
                        'um/adlQuantile': 5,
                        'cm/adlQuantile': 5,
                        'um/trade/asyn': 300,
                        'um/trade/asyn/id': 2,
                        'um/order/asyn': 300,
                        'um/order/asyn/id': 2,
                        'um/income/asyn': 300,
                        'um/income/asyn/id': 2,
                        'um/orderAmendment': 1,
                        'cm/orderAmendment': 1,
                        'um/feeBurn': 30,
                        'um/accountConfig': 1,
                        'um/symbolConfig': 1,
                        'cm/accountConfig': 1,
                        'cm/symbolConfig': 1,
                        'rateLimit/order': 1,
                    },
                    'post': {
                        'um/order': 1,
                        'um/conditional/order': 1,
                        'cm/order': 1,
                        'cm/conditional/order': 1,
                        'margin/order': 1,
                        'marginLoan': 100,
                        'repayLoan': 100,
                        'margin/order/oco': 1,
                        'um/leverage': 0.2,
                        'cm/leverage': 0.2,
                        'um/positionSide/dual': 0.2,
                        'cm/positionSide/dual': 0.2,
                        'auto-collection': 150,
                        'bnb-transfer': 150,
                        'repay-futures-switch': 150,
                        'repay-futures-negative-balance': 150,
                        'listenKey': 0.2,
                        'asset-collection': 6,
                        'margin/repay-debt': 3000,
                        'um/feeBurn': 1,
                    },
                    'put': {
                        'listenKey': 0.2,
                        'um/order': 1,
                        'cm/order': 1,
                    },
                    'delete': {
                        'um/order': 1,
                        'um/conditional/order': 1,
                        'um/allOpenOrders': 1,
                        'um/conditional/allOpenOrders': 1,
                        'cm/order': 1,
                        'cm/conditional/order': 1,
                        'cm/allOpenOrders': 1,
                        'cm/conditional/allOpenOrders': 1,
                        'margin/order': 2,
                        'margin/allOpenOrders': 5,
                        'margin/orderList': 2,
                        'listenKey': 0.2,
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber('0.001'),
                    'maker': this.parseNumber('0.001'),
                },
                'linear': {
                    'trading': {
                        'feeSide': 'quote',
                        'tierBased': true,
                        'percentage': true,
                        'taker': this.parseNumber('0.000500'),
                        'maker': this.parseNumber('0.000200'),
                        'tiers': {
                            'taker': [
                                [this.parseNumber('0'), this.parseNumber('0.000400')],
                                [this.parseNumber('250'), this.parseNumber('0.000400')],
                                [this.parseNumber('2500'), this.parseNumber('0.000350')],
                                [this.parseNumber('7500'), this.parseNumber('0.000320')],
                                [this.parseNumber('22500'), this.parseNumber('0.000300')],
                                [this.parseNumber('50000'), this.parseNumber('0.000270')],
                                [this.parseNumber('100000'), this.parseNumber('0.000250')],
                                [this.parseNumber('200000'), this.parseNumber('0.000220')],
                                [this.parseNumber('400000'), this.parseNumber('0.000200')],
                                [this.parseNumber('750000'), this.parseNumber('0.000170')],
                            ],
                            'maker': [
                                [this.parseNumber('0'), this.parseNumber('0.000200')],
                                [this.parseNumber('250'), this.parseNumber('0.000160')],
                                [this.parseNumber('2500'), this.parseNumber('0.000140')],
                                [this.parseNumber('7500'), this.parseNumber('0.000120')],
                                [this.parseNumber('22500'), this.parseNumber('0.000100')],
                                [this.parseNumber('50000'), this.parseNumber('0.000080')],
                                [this.parseNumber('100000'), this.parseNumber('0.000060')],
                                [this.parseNumber('200000'), this.parseNumber('0.000040')],
                                [this.parseNumber('400000'), this.parseNumber('0.000020')],
                                [this.parseNumber('750000'), this.parseNumber('0')],
                            ],
                        },
                    },
                },
                'inverse': {
                    'trading': {
                        'feeSide': 'base',
                        'tierBased': true,
                        'percentage': true,
                        'taker': this.parseNumber('0.000500'),
                        'maker': this.parseNumber('0.000100'),
                        'tiers': {
                            'taker': [
                                [this.parseNumber('0'), this.parseNumber('0.000500')],
                                [this.parseNumber('250'), this.parseNumber('0.000450')],
                                [this.parseNumber('2500'), this.parseNumber('0.000400')],
                                [this.parseNumber('7500'), this.parseNumber('0.000300')],
                                [this.parseNumber('22500'), this.parseNumber('0.000250')],
                                [this.parseNumber('50000'), this.parseNumber('0.000240')],
                                [this.parseNumber('100000'), this.parseNumber('0.000240')],
                                [this.parseNumber('200000'), this.parseNumber('0.000240')],
                                [this.parseNumber('400000'), this.parseNumber('0.000240')],
                                [this.parseNumber('750000'), this.parseNumber('0.000240')],
                            ],
                            'maker': [
                                [this.parseNumber('0'), this.parseNumber('0.000100')],
                                [this.parseNumber('250'), this.parseNumber('0.000080')],
                                [this.parseNumber('2500'), this.parseNumber('0.000050')],
                                [this.parseNumber('7500'), this.parseNumber('0.0000030')],
                                [this.parseNumber('22500'), this.parseNumber('0')],
                                [this.parseNumber('50000'), this.parseNumber('-0.000050')],
                                [this.parseNumber('100000'), this.parseNumber('-0.000060')],
                                [this.parseNumber('200000'), this.parseNumber('-0.000070')],
                                [this.parseNumber('400000'), this.parseNumber('-0.000080')],
                                [this.parseNumber('750000'), this.parseNumber('-0.000090')],
                            ],
                        },
                    },
                },
                'option': {},
            },
            'currencies': {
                'BNFCR': this.safeCurrencyStructure({ 'id': 'BNFCR', 'code': 'BNFCR', 'precision': this.parseNumber('0.001') }),
            },
            'commonCurrencies': {
                'BCC': 'BCC',
                'YOYO': 'YOYOW',
            },
            'precisionMode': number.TICK_SIZE,
            // exchange-specific options
            'options': {
                'sandboxMode': false,
                'fetchMargins': true,
                'fetchMarkets': {
                    'types': [
                        'spot',
                        'linear',
                        'inverse', // allows CORS in browsers
                        // 'option', // does not allow CORS, enable outside of the browser only
                    ],
                },
                'loadAllOptions': false,
                'fetchCurrencies': true,
                // 'fetchTradesMethod': 'publicGetAggTrades', // publicGetTrades, publicGetHistoricalTrades, eapiPublicGetTrades
                // 'repayCrossMarginMethod': 'papiPostRepayLoan', // papiPostMarginRepayDebt
                'defaultTimeInForce': 'GTC',
                'defaultType': 'spot',
                'defaultSubType': undefined,
                'hasAlreadyAuthenticatedSuccessfully': false,
                'warnOnFetchOpenOrdersWithoutSymbol': true,
                'currencyToPrecisionRoundingMode': number.TRUNCATE,
                // not an error
                // https://github.com/ccxt/ccxt/issues/11268
                // https://github.com/ccxt/ccxt/pull/11624
                // POST https://fapi.binance.com/fapi/v1/marginType 400 Bad Request
                // binanceusdm
                'throwMarginModeAlreadySet': false,
                'fetchPositions': 'positionRisk',
                'recvWindow': 10 * 1000,
                'timeDifference': 0,
                'adjustForTimeDifference': false,
                'newOrderRespType': {
                    'market': 'FULL',
                    'limit': 'FULL', // we change it from 'ACK' by default to 'FULL' (returns immediately if limit is not hit)
                },
                'quoteOrderQty': true,
                'broker': {
                    'spot': 'x-TKT5PX2F',
                    'margin': 'x-TKT5PX2F',
                    'future': 'x-cvBPrNm9',
                    'delivery': 'x-xcKtGhcu',
                    'swap': 'x-cvBPrNm9',
                    'option': 'x-xcKtGhcu',
                    'inverse': 'x-xcKtGhcu',
                },
                'accountsByType': {
                    'main': 'MAIN',
                    'spot': 'MAIN',
                    'funding': 'FUNDING',
                    'margin': 'MARGIN',
                    'cross': 'MARGIN',
                    'future': 'UMFUTURE',
                    'delivery': 'CMFUTURE',
                    'linear': 'UMFUTURE',
                    'swap': 'UMFUTURE',
                    'inverse': 'CMFUTURE',
                    'option': 'OPTION',
                },
                'accountsById': {
                    'MAIN': 'spot',
                    'FUNDING': 'funding',
                    'MARGIN': 'margin',
                    'UMFUTURE': 'linear',
                    'CMFUTURE': 'inverse',
                    'OPTION': 'option',
                },
                'networks': {
                    'ERC20': 'ETH',
                    'TRC20': 'TRX',
                    'BEP2': 'BNB',
                    'BEP20': 'BSC',
                    'OMNI': 'OMNI',
                    'EOS': 'EOS',
                    'SPL': 'SOL',
                    'SOL': 'SOL', // we shouldn't rename SOL
                },
                'networksById': {
                    'SOL': 'SOL', // temporary fix for SPL definition
                },
                'impliedNetworks': {
                    'ETH': { 'ERC20': 'ETH' },
                    'TRX': { 'TRC20': 'TRX' },
                },
                'legalMoney': {
                    'MXN': true,
                    'UGX': true,
                    'SEK': true,
                    'CHF': true,
                    'VND': true,
                    'AED': true,
                    'DKK': true,
                    'KZT': true,
                    'HUF': true,
                    'PEN': true,
                    'PHP': true,
                    'USD': true,
                    'TRY': true,
                    'EUR': true,
                    'NGN': true,
                    'PLN': true,
                    'BRL': true,
                    'ZAR': true,
                    'KES': true,
                    'ARS': true,
                    'RUB': true,
                    'AUD': true,
                    'NOK': true,
                    'CZK': true,
                    'GBP': true,
                    'UAH': true,
                    'GHS': true,
                    'HKD': true,
                    'CAD': true,
                    'INR': true,
                    'JPY': true,
                    'NZD': true,
                },
                'legalMoneyCurrenciesById': {
                    'BUSD': 'USD',
                },
                'defaultWithdrawPrecision': 0.00000001,
            },
            'features': {
                'spot': {
                    'sandbox': true,
                    'fetchCurrencies': {
                        'private': true,
                    },
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': true,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': {
                            'expire_maker': true,
                            'expire_taker': true,
                            'expire_both': true,
                            'none': true,
                        },
                        'trailing': false,
                        'icebergAmount': true,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': undefined,
                        'untilDays': 1,
                        'symbolRequired': true,
                    },
                    'fetchOrder': {
                        'marginMode': true,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': true,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': true,
                        'limit': 1000,
                        'daysBack': undefined,
                        'untilDays': 10000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchClosedOrders': {
                        'marginMode': true,
                        'limit': 1000,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': 10000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'forDerivatives': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'mark': true,
                            'last': true,
                            'index': false,
                        },
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': true,
                            // 'GTX': true,
                        },
                        'hedged': true,
                        // exchange-supported features
                        'selfTradePrevention': true,
                        'trailing': true,
                        'iceberg': false,
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': true,
                    },
                    'createOrders': {
                        'max': 5,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'daysBack': undefined,
                        'limit': 1000,
                        'untilDays': 7,
                        'symbolRequired': true,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': true,
                        'limit': 500,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': true,
                        'limit': 1000,
                        'daysBack': 90,
                        'untilDays': 7,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchClosedOrders': {
                        'marginMode': true,
                        'limit': 1000,
                        'daysBack': 90,
                        'daysBackCanceled': 3,
                        'untilDays': 7,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOHLCV': {
                        'limit': 1500,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'forDerivatives',
                    },
                    'inverse': {
                        'extends': 'forDerivatives',
                    },
                },
                'future': {
                    'linear': {
                        'extends': 'forDerivatives',
                    },
                    'inverse': {
                        'extends': 'forDerivatives',
                    },
                },
            },
            'exceptions': {
                'spot': {
                    'exact': {
                        //
                        //        1xxx
                        //
                        '-1004': errors.OperationFailed,
                        '-1008': errors.OperationFailed,
                        '-1099': errors.AuthenticationError,
                        '-1108': errors.BadRequest,
                        '-1131': errors.BadRequest,
                        '-1134': errors.BadRequest,
                        '-1135': errors.BadRequest,
                        '-1145': errors.BadRequest,
                        '-1151': errors.BadSymbol,
                        //
                        //        2xxx
                        //
                        '-2008': errors.AuthenticationError,
                        '-2016': errors.OperationRejected,
                        '-2021': errors.BadResponse,
                        '-2022': errors.BadResponse,
                        '-2026': errors.InvalidOrder,
                        //
                        //        3xxx (these errors are available only for spot atm)
                        //
                        '-3000': errors.OperationFailed,
                        '-3001': errors.AuthenticationError,
                        '-3002': errors.BadSymbol,
                        '-3003': errors.BadRequest,
                        '-3004': errors.OperationRejected,
                        '-3005': errors.BadRequest,
                        '-3006': errors.BadRequest,
                        '-3007': errors.OperationFailed,
                        '-3008': errors.BadRequest,
                        '-3009': errors.OperationRejected,
                        '-3010': errors.BadRequest,
                        '-3011': errors.BadRequest,
                        '-3012': errors.OperationRejected,
                        '-3013': errors.BadRequest,
                        '-3014': errors.AccountSuspended,
                        '-3015': errors.BadRequest,
                        '-3016': errors.BadRequest,
                        '-3017': errors.OperationRejected,
                        '-3018': errors.AccountSuspended,
                        '-3019': errors.AccountSuspended,
                        '-3020': errors.BadRequest,
                        '-3021': errors.BadRequest,
                        '-3022': errors.AccountSuspended,
                        '-3023': errors.OperationRejected,
                        '-3024': errors.OperationRejected,
                        '-3025': errors.BadRequest,
                        '-3026': errors.BadRequest,
                        '-3027': errors.BadSymbol,
                        '-3028': errors.BadSymbol,
                        '-3029': errors.OperationFailed,
                        '-3036': errors.AccountSuspended,
                        '-3037': errors.OperationFailed,
                        '-3038': errors.BadRequest,
                        '-3041': errors.InsufficientFunds,
                        '-3042': errors.BadRequest,
                        '-3043': errors.PermissionDenied,
                        '-3044': errors.OperationFailed,
                        '-3045': errors.OperationRejected,
                        '-3999': errors.PermissionDenied,
                        //
                        //        4xxx (different from contract markets)
                        //
                        '-4000': errors.ExchangeError,
                        '-4001': errors.BadRequest,
                        '-4002': errors.BadRequest,
                        '-4003': errors.BadRequest,
                        '-4004': errors.AuthenticationError,
                        '-4005': errors.RateLimitExceeded,
                        '-4006': errors.BadRequest,
                        '-4007': errors.PermissionDenied,
                        '-4008': errors.PermissionDenied,
                        '-4009': errors.ExchangeError,
                        '-4010': errors.PermissionDenied,
                        '-4011': errors.BadRequest,
                        '-4012': errors.PermissionDenied,
                        '-4013': errors.AuthenticationError,
                        '-4014': errors.OperationRejected,
                        '-4015': errors.PermissionDenied,
                        '-4016': errors.PermissionDenied,
                        '-4017': errors.PermissionDenied,
                        '-4018': errors.BadSymbol,
                        '-4019': errors.BadRequest,
                        '-4020': errors.ExchangeError,
                        '-4021': errors.BadRequest,
                        '-4022': errors.BadRequest,
                        '-4023': errors.OperationRejected,
                        '-4024': errors.InsufficientFunds,
                        '-4025': errors.InsufficientFunds,
                        '-4026': errors.InsufficientFunds,
                        '-4027': errors.OperationFailed,
                        '-4028': errors.BadRequest,
                        '-4029': errors.BadRequest,
                        '-4030': errors.BadResponse,
                        '-4031': errors.OperationFailed,
                        '-4032': errors.OperationRejected,
                        '-4033': errors.BadRequest,
                        '-4034': errors.OperationRejected,
                        '-4035': errors.PermissionDenied,
                        '-4036': errors.PermissionDenied,
                        '-4037': errors.OperationFailed,
                        '-4038': errors.OperationFailed,
                        '-4039': errors.PermissionDenied,
                        '-4040': errors.OperationRejected,
                        '-4041': errors.OperationFailed,
                        '-4042': errors.OperationRejected,
                        '-4043': errors.OperationRejected,
                        '-4044': errors.PermissionDenied,
                        '-4045': errors.OperationFailed,
                        '-4046': errors.AuthenticationError,
                        '-4047': errors.BadRequest,
                        '-4048': errors.ExchangeError,
                        '-4049': errors.ExchangeError,
                        '-4050': errors.ExchangeError,
                        '-4051': errors.ExchangeError,
                        '-4052': errors.ExchangeError,
                        '-4053': errors.ExchangeError,
                        '-4054': errors.ExchangeError,
                        '-4055': errors.ExchangeError,
                        '-4056': errors.ExchangeError,
                        '-4057': errors.ExchangeError,
                        '-4058': errors.ExchangeError,
                        '-4059': errors.ExchangeError,
                        '-4060': errors.OperationFailed,
                        '-4061': errors.ExchangeError,
                        '-4062': errors.ExchangeError,
                        '-4063': errors.ExchangeError,
                        '-4064': errors.ExchangeError,
                        '-4065': errors.ExchangeError,
                        '-4066': errors.ExchangeError,
                        '-4067': errors.ExchangeError,
                        '-4068': errors.ExchangeError,
                        '-4069': errors.ExchangeError,
                        '-4070': errors.ExchangeError,
                        '-4071': errors.ExchangeError,
                        '-4072': errors.ExchangeError,
                        '-4073': errors.ExchangeError,
                        '-4074': errors.ExchangeError,
                        '-4075': errors.ExchangeError,
                        '-4076': errors.ExchangeError,
                        '-4077': errors.ExchangeError,
                        '-4078': errors.ExchangeError,
                        '-4079': errors.ExchangeError,
                        '-4080': errors.ExchangeError,
                        '-4081': errors.ExchangeError,
                        '-4082': errors.ExchangeError,
                        '-4083': errors.ExchangeError,
                        '-4084': errors.ExchangeError,
                        '-4085': errors.ExchangeError,
                        '-4086': errors.ExchangeError,
                        '-4087': errors.ExchangeError,
                        '-4088': errors.ExchangeError,
                        '-4089': errors.ExchangeError,
                        '-4091': errors.ExchangeError,
                        '-4092': errors.ExchangeError,
                        '-4093': errors.ExchangeError,
                        '-4094': errors.ExchangeError,
                        '-4095': errors.ExchangeError,
                        '-4096': errors.ExchangeError,
                        '-4097': errors.ExchangeError,
                        '-4098': errors.ExchangeError,
                        '-4099': errors.ExchangeError,
                        '-4101': errors.ExchangeError,
                        '-4102': errors.ExchangeError,
                        '-4103': errors.ExchangeError,
                        '-4104': errors.ExchangeError,
                        '-4105': errors.ExchangeError,
                        '-4106': errors.ExchangeError,
                        '-4107': errors.ExchangeError,
                        '-4108': errors.ExchangeError,
                        '-4109': errors.ExchangeError,
                        '-4110': errors.ExchangeError,
                        '-4112': errors.ExchangeError,
                        '-4113': errors.ExchangeError,
                        '-4114': errors.ExchangeError,
                        '-4115': errors.ExchangeError,
                        '-4116': errors.ExchangeError,
                        '-4117': errors.ExchangeError,
                        '-4118': errors.ExchangeError,
                        '-4119': errors.ExchangeError,
                        '-4120': errors.ExchangeError,
                        '-4121': errors.ExchangeError,
                        '-4122': errors.ExchangeError,
                        '-4123': errors.ExchangeError,
                        '-4124': errors.ExchangeError,
                        '-4125': errors.ExchangeError,
                        '-4126': errors.ExchangeError,
                        '-4127': errors.ExchangeError,
                        '-4128': errors.ExchangeError,
                        '-4129': errors.ExchangeError,
                        '-4130': errors.ExchangeError,
                        '-4131': errors.ExchangeError,
                        '-4132': errors.ExchangeError,
                        '-4133': errors.ExchangeError,
                        '-4134': errors.ExchangeError,
                        '-4135': errors.ExchangeError,
                        '-4136': errors.ExchangeError,
                        '-4137': errors.ExchangeError,
                        '-4138': errors.ExchangeError,
                        '-4139': errors.ExchangeError,
                        '-4141': errors.ExchangeError,
                        '-4142': errors.ExchangeError,
                        '-4143': errors.ExchangeError,
                        '-4144': errors.ExchangeError,
                        '-4145': errors.ExchangeError,
                        '-4146': errors.ExchangeError,
                        '-4147': errors.ExchangeError,
                        '-4148': errors.ExchangeError,
                        '-4149': errors.ExchangeError,
                        '-4150': errors.ExchangeError,
                        //
                        //        5xxx
                        //
                        '-5001': errors.BadRequest,
                        '-5002': errors.InsufficientFunds,
                        '-5003': errors.InsufficientFunds,
                        '-5004': errors.OperationRejected,
                        '-5005': errors.OperationRejected,
                        '-5006': errors.OperationRejected,
                        '-5007': errors.BadRequest,
                        '-5008': errors.OperationRejected,
                        '-5009': errors.BadSymbol,
                        '-5010': errors.OperationFailed,
                        '-5011': errors.BadRequest,
                        '-5012': errors.OperationFailed,
                        '-5013': errors.InsufficientFunds,
                        '-5021': errors.BadRequest,
                        '-5022': errors.BadRequest,
                        //
                        //        6xxx
                        //
                        '-6001': errors.BadSymbol,
                        '-6003': errors.PermissionDenied,
                        '-6004': errors.BadRequest,
                        '-6005': errors.BadRequest,
                        '-6006': errors.BadRequest,
                        '-6007': errors.OperationRejected,
                        '-6008': errors.OperationRejected,
                        '-6009': errors.RateLimitExceeded,
                        '-6011': errors.OperationRejected,
                        '-6012': errors.InsufficientFunds,
                        '-6013': errors.BadResponse,
                        '-6014': errors.OperationRejected,
                        '-6015': errors.BadRequest,
                        '-6016': errors.BadRequest,
                        '-6017': errors.PermissionDenied,
                        '-6018': errors.InsufficientFunds,
                        '-6019': errors.OperationRejected,
                        '-6020': errors.BadRequest,
                        //
                        //        7xxx
                        //
                        '-7001': errors.BadRequest,
                        '-7002': errors.BadRequest,
                        //
                        //        1xxxx
                        //
                        '-10001': errors.OperationFailed,
                        '-10002': errors.BadRequest,
                        '-10005': errors.BadResponse,
                        '-10007': errors.BadRequest,
                        '-10008': errors.BadRequest,
                        '-10009': errors.BadRequest,
                        '-10010': errors.BadRequest,
                        '-10011': errors.InsufficientFunds,
                        '-10012': errors.BadRequest,
                        '-10013': errors.InsufficientFunds,
                        '-10015': errors.OperationFailed,
                        '-10016': errors.OperationFailed,
                        '-10017': errors.OperationRejected,
                        '-10018': errors.BadRequest,
                        '-10019': errors.BadRequest,
                        '-10020': errors.BadRequest,
                        '-10021': errors.InvalidOrder,
                        '-10022': errors.BadRequest,
                        '-10023': errors.OperationFailed,
                        '-10024': errors.BadRequest,
                        '-10025': errors.OperationFailed,
                        '-10026': errors.BadRequest,
                        '-10028': errors.BadRequest,
                        '-10029': errors.OperationRejected,
                        '-10030': errors.OperationRejected,
                        '-10031': errors.OperationRejected,
                        '-10032': errors.OperationFailed,
                        '-10034': errors.OperationRejected,
                        '-10039': errors.OperationRejected,
                        '-10040': errors.OperationRejected,
                        '-10041': errors.OperationFailed,
                        '-10042': errors.BadSymbol,
                        '-10043': errors.OperationRejected,
                        '-10044': errors.OperationRejected,
                        '-10045': errors.OperationRejected,
                        '-10046': errors.OperationRejected,
                        '-10047': errors.PermissionDenied,
                        '-11008': errors.OperationRejected,
                        '-12014': errors.RateLimitExceeded,
                        // BLVT
                        '-13000': errors.OperationRejected,
                        '-13001': errors.OperationRejected,
                        '-13002': errors.OperationRejected,
                        '-13003': errors.PermissionDenied,
                        '-13004': errors.OperationRejected,
                        '-13005': errors.OperationRejected,
                        '-13006': errors.OperationRejected,
                        '-13007': errors.PermissionDenied,
                        // 18xxx - BINANCE CODE
                        '-18002': errors.OperationRejected,
                        '-18003': errors.OperationRejected,
                        '-18004': errors.OperationRejected,
                        '-18005': errors.PermissionDenied,
                        '-18006': errors.OperationRejected,
                        '-18007': errors.OperationRejected,
                        //
                        //        2xxxx
                        //
                        //   21xxx - PORTFOLIO MARGIN (documented in spot docs)
                        '-21001': errors.BadRequest,
                        '-21002': errors.BadRequest,
                        '-21003': errors.BadResponse,
                        '-21004': errors.OperationRejected,
                        '-21005': errors.InsufficientFunds,
                        '-21006': errors.OperationFailed,
                        '-21007': errors.OperationFailed,
                        //
                        //        misc
                        //
                        '-32603': errors.BadRequest,
                        '400002': errors.BadRequest,
                        '100001003': errors.AuthenticationError,
                        '200003903': errors.AuthenticationError, // undocumented, {"code":200003903,"msg":"Your identity verification has been rejected. Please complete identity verification again."}
                    },
                },
                'linear': {
                    'exact': {
                        //
                        //        1xxx
                        //
                        '-1005': errors.PermissionDenied,
                        '-1008': errors.OperationFailed,
                        '-1011': errors.PermissionDenied,
                        '-1023': errors.BadRequest,
                        '-1099': errors.AuthenticationError,
                        '-1109': errors.PermissionDenied,
                        '-1110': errors.BadRequest,
                        '-1113': errors.BadRequest,
                        '-1122': errors.BadRequest,
                        '-1126': errors.BadSymbol,
                        '-1136': errors.BadRequest,
                        //
                        //        2xxx
                        //
                        '-2012': errors.OperationFailed,
                        '-2016': errors.OperationRejected,
                        '-2017': errors.PermissionDenied,
                        '-2018': errors.InsufficientFunds,
                        '-2019': errors.InsufficientFunds,
                        '-2020': errors.OperationFailed,
                        '-2021': errors.OrderImmediatelyFillable,
                        '-2022': errors.InvalidOrder,
                        '-2023': errors.OperationFailed,
                        '-2024': errors.InsufficientFunds,
                        '-2025': errors.OperationRejected,
                        '-2026': errors.InvalidOrder,
                        '-2027': errors.OperationRejected,
                        '-2028': errors.OperationRejected,
                        //
                        //        4xxx
                        //
                        '-4063': errors.BadRequest,
                        '-4064': errors.BadRequest,
                        '-4065': errors.BadRequest,
                        '-4066': errors.BadRequest,
                        '-4069': errors.BadRequest,
                        '-4070': errors.BadRequest,
                        '-4071': errors.BadRequest,
                        '-4072': errors.OperationRejected,
                        '-4073': errors.BadRequest,
                        '-4074': errors.OperationRejected,
                        '-4075': errors.BadRequest,
                        '-4076': errors.OperationRejected,
                        '-4077': errors.OperationRejected,
                        '-4078': errors.OperationFailed,
                        '-4079': errors.BadRequest,
                        '-4080': errors.PermissionDenied,
                        '-4081': errors.BadRequest,
                        '-4085': errors.BadRequest,
                        '-4087': errors.PermissionDenied,
                        '-4088': errors.PermissionDenied,
                        '-4114': errors.BadRequest,
                        '-4115': errors.BadRequest,
                        '-4116': errors.InvalidOrder,
                        '-4117': errors.OperationRejected,
                        '-4118': errors.OperationRejected,
                        '-4131': errors.OperationRejected,
                        '-4140': errors.BadRequest,
                        '-4141': errors.OperationRejected,
                        '-4144': errors.BadSymbol,
                        '-4164': errors.InvalidOrder,
                        '-4136': errors.InvalidOrder,
                        '-4165': errors.BadRequest,
                        '-4167': errors.BadRequest,
                        '-4168': errors.BadRequest,
                        '-4169': errors.OperationRejected,
                        '-4170': errors.OperationRejected,
                        '-4171': errors.OperationRejected,
                        '-4172': errors.OperationRejected,
                        '-4183': errors.BadRequest,
                        '-4184': errors.BadRequest,
                        '-4192': errors.PermissionDenied,
                        '-4202': errors.PermissionDenied,
                        '-4203': errors.PermissionDenied,
                        '-4205': errors.PermissionDenied,
                        '-4206': errors.PermissionDenied,
                        '-4208': errors.OperationRejected,
                        '-4209': errors.OperationRejected,
                        '-4210': errors.BadRequest,
                        '-4211': errors.BadRequest,
                        '-4400': errors.PermissionDenied,
                        '-4401': errors.PermissionDenied,
                        '-4402': errors.PermissionDenied,
                        '-4403': errors.PermissionDenied,
                        //
                        //        5xxx
                        //
                        '-5021': errors.OrderNotFillable,
                        '-5022': errors.OrderNotFillable,
                        '-5024': errors.OperationRejected,
                        '-5025': errors.OperationRejected,
                        '-5026': errors.OperationRejected,
                        '-5027': errors.OperationRejected,
                        '-5028': errors.BadRequest,
                        '-5037': errors.BadRequest,
                        '-5038': errors.BadRequest,
                        '-5039': errors.BadRequest,
                        '-5040': errors.BadRequest,
                        '-5041': errors.OperationFailed, // No depth matches this BBO order
                    },
                },
                'inverse': {
                    'exact': {
                        //
                        //        1xxx
                        //
                        '-1005': errors.PermissionDenied,
                        '-1011': errors.PermissionDenied,
                        '-1023': errors.BadRequest,
                        '-1109': errors.AuthenticationError,
                        '-1110': errors.BadSymbol,
                        '-1113': errors.BadRequest,
                        '-1128': errors.BadRequest,
                        '-1136': errors.BadRequest,
                        //
                        //        2xxx
                        //
                        '-2016': errors.OperationRejected,
                        '-2018': errors.InsufficientFunds,
                        '-2019': errors.InsufficientFunds,
                        '-2020': errors.OperationFailed,
                        '-2021': errors.OrderImmediatelyFillable,
                        '-2022': errors.InvalidOrder,
                        '-2023': errors.OperationFailed,
                        '-2024': errors.BadRequest,
                        '-2025': errors.OperationRejected,
                        '-2026': errors.InvalidOrder,
                        '-2027': errors.OperationRejected,
                        '-2028': errors.OperationRejected,
                        //
                        //        4xxx
                        //
                        '-4086': errors.BadRequest,
                        '-4087': errors.BadSymbol,
                        '-4088': errors.BadRequest,
                        '-4089': errors.PermissionDenied,
                        '-4090': errors.PermissionDenied,
                        '-4110': errors.BadRequest,
                        '-4111': errors.BadRequest,
                        '-4112': errors.OperationRejected,
                        '-4113': errors.OperationRejected,
                        '-4150': errors.OperationRejected,
                        '-4151': errors.BadRequest,
                        '-4152': errors.BadRequest,
                        '-4154': errors.BadRequest,
                        '-4155': errors.BadRequest,
                        '-4178': errors.BadRequest,
                        '-4188': errors.BadRequest,
                        '-4192': errors.PermissionDenied,
                        '-4194': errors.PermissionDenied,
                        '-4195': errors.PermissionDenied,
                        '-4196': errors.BadRequest,
                        '-4197': errors.OperationRejected,
                        '-4198': errors.OperationRejected,
                        '-4199': errors.BadRequest,
                        '-4200': errors.PermissionDenied,
                        '-4201': errors.PermissionDenied,
                        '-4202': errors.OperationRejected, // Current symbol leverage cannot exceed 20 when using position limit adjustment service.
                    },
                },
                'option': {
                    'exact': {
                        //
                        //        1xxx
                        //
                        '-1003': errors.ExchangeError,
                        '-1004': errors.ExchangeError,
                        '-1006': errors.ExchangeError,
                        '-1007': errors.ExchangeError,
                        '-1008': errors.RateLimitExceeded,
                        '-1010': errors.ExchangeError,
                        '-1013': errors.ExchangeError,
                        '-1108': errors.ExchangeError,
                        '-1112': errors.ExchangeError,
                        '-1114': errors.ExchangeError,
                        '-1128': errors.BadSymbol,
                        '-1129': errors.BadSymbol,
                        '-1131': errors.BadRequest,
                        //
                        //        2xxx
                        //
                        '-2011': errors.ExchangeError,
                        '-2018': errors.InsufficientFunds,
                        '-2027': errors.InsufficientFunds,
                        //
                        //        3xxx
                        //
                        '-3029': errors.OperationFailed,
                        //
                        //        4xxx
                        //
                        // -4001 inherited
                        // -4002 inherited
                        // -4003 inherited
                        // -4004 inherited
                        // -4005 inherited
                        '-4006': errors.ExchangeError,
                        '-4007': errors.ExchangeError,
                        '-4008': errors.ExchangeError,
                        '-4009': errors.ExchangeError,
                        '-4010': errors.ExchangeError,
                        '-4011': errors.ExchangeError,
                        '-4012': errors.ExchangeError,
                        // -4013 inherited
                        '-4014': errors.ExchangeError,
                        '-4015': errors.ExchangeError,
                        '-4016': errors.ExchangeError,
                        '-4017': errors.ExchangeError,
                        '-4018': errors.ExchangeError,
                        '-4019': errors.ExchangeError,
                        '-4020': errors.ExchangeError,
                        '-4021': errors.ExchangeError,
                        '-4022': errors.ExchangeError,
                        '-4023': errors.ExchangeError,
                        '-4024': errors.ExchangeError,
                        '-4025': errors.ExchangeError,
                        '-4026': errors.ExchangeError,
                        '-4027': errors.ExchangeError,
                        '-4028': errors.ExchangeError,
                        // -4029 inherited
                        // -4030 inherited
                        '-4031': errors.ExchangeError,
                        '-4032': errors.ExchangeError,
                        '-4033': errors.ExchangeError,
                        '-4034': errors.ExchangeError,
                        '-4035': errors.ExchangeError,
                        '-4036': errors.ExchangeError,
                        '-4037': errors.ExchangeError,
                        '-4038': errors.ExchangeError,
                        '-4039': errors.ExchangeError,
                        '-4040': errors.ExchangeError,
                        '-4041': errors.ExchangeError,
                        '-4042': errors.ExchangeError,
                        '-4043': errors.ExchangeError,
                        '-4044': errors.ExchangeError,
                        '-4045': errors.ExchangeError,
                        '-4046': errors.ExchangeError,
                        '-4047': errors.ExchangeError,
                        '-4048': errors.ExchangeError,
                        '-4049': errors.ExchangeError,
                        '-4050': errors.ExchangeError,
                        '-4051': errors.ExchangeError,
                        '-4052': errors.ExchangeError,
                        '-4053': errors.ExchangeError,
                        '-4054': errors.ExchangeError,
                        // -4055 inherited
                        '-4056': errors.ExchangeError,
                        '-4057': errors.ExchangeError,
                        '-4058': errors.ExchangeError,
                        '-4059': errors.ExchangeError,
                        '-4060': errors.ExchangeError,
                        '-4061': errors.ExchangeError,
                        '-4062': errors.ExchangeError,
                        '-4063': errors.ExchangeError,
                        '-4064': errors.ExchangeError,
                        '-4065': errors.ExchangeError,
                        '-4066': errors.ExchangeError,
                        '-4067': errors.ExchangeError,
                        '-4068': errors.ExchangeError,
                        '-4069': errors.ExchangeError,
                        '-4070': errors.ExchangeError,
                        '-4071': errors.ExchangeError,
                        '-4072': errors.ExchangeError,
                        '-4073': errors.ExchangeError,
                        '-4074': errors.ExchangeError,
                        '-4075': errors.ExchangeError,
                        '-4076': errors.ExchangeError,
                        '-4077': errors.ExchangeError,
                        '-4078': errors.ExchangeError,
                        '-4079': errors.ExchangeError,
                        '-4080': errors.ExchangeError,
                        '-4081': errors.ExchangeError,
                        '-4082': errors.ExchangeError,
                        '-4083': errors.ExchangeError,
                        '-4084': errors.ExchangeError,
                        '-4085': errors.ExchangeError,
                        '-4086': errors.ExchangeError,
                        '-4087': errors.ExchangeError,
                        '-4088': errors.ExchangeError,
                        '-4089': errors.ExchangeError,
                        '-4091': errors.ExchangeError,
                        '-4092': errors.ExchangeError,
                        '-4093': errors.ExchangeError,
                        '-4094': errors.ExchangeError,
                        '-4095': errors.ExchangeError,
                        '-4096': errors.ExchangeError,
                        '-4097': errors.ExchangeError,
                        '-4098': errors.ExchangeError,
                        '-4099': errors.ExchangeError,
                        '-4101': errors.ExchangeError,
                        '-4102': errors.ExchangeError,
                        '-4103': errors.ExchangeError,
                        '-4104': errors.ExchangeError,
                        '-4105': errors.ExchangeError,
                        '-4106': errors.ExchangeError,
                        '-4107': errors.ExchangeError,
                        '-4108': errors.ExchangeError,
                        '-4109': errors.ExchangeError,
                        '-4110': errors.ExchangeError,
                        '-4112': errors.ExchangeError,
                        '-4113': errors.ExchangeError,
                        '-4114': errors.ExchangeError,
                        '-4115': errors.ExchangeError,
                        '-4116': errors.ExchangeError,
                        '-4117': errors.ExchangeError,
                        '-4118': errors.ExchangeError,
                        '-4119': errors.ExchangeError,
                        '-4120': errors.ExchangeError,
                        '-4121': errors.ExchangeError,
                        '-4122': errors.ExchangeError,
                        '-4123': errors.ExchangeError,
                        '-4124': errors.ExchangeError,
                        '-4125': errors.ExchangeError,
                        '-4126': errors.ExchangeError,
                        '-4127': errors.ExchangeError,
                        '-4128': errors.ExchangeError,
                        '-4129': errors.ExchangeError,
                        '-4130': errors.ExchangeError,
                        '-4131': errors.ExchangeError,
                        '-4132': errors.ExchangeError,
                        '-4133': errors.ExchangeError,
                        '-4134': errors.ExchangeError,
                        '-4135': errors.ExchangeError,
                        '-4136': errors.ExchangeError,
                        '-4137': errors.ExchangeError,
                        '-4138': errors.ExchangeError,
                        '-4139': errors.ExchangeError,
                        '-4141': errors.ExchangeError,
                        '-4142': errors.ExchangeError,
                        '-4143': errors.ExchangeError,
                        '-4144': errors.ExchangeError,
                        '-4145': errors.ExchangeError,
                        '-4146': errors.ExchangeError,
                        '-4147': errors.ExchangeError,
                        '-4148': errors.ExchangeError,
                        '-4149': errors.ExchangeError,
                        '-4150': errors.ExchangeError,
                        //
                        //        2xxxx
                        //
                        '-20121': errors.ExchangeError,
                        '-20124': errors.ExchangeError,
                        '-20130': errors.ExchangeError,
                        '-20132': errors.ExchangeError,
                        '-20194': errors.ExchangeError,
                        '-20195': errors.ExchangeError,
                        '-20196': errors.ExchangeError,
                        '-20198': errors.ExchangeError,
                        '-20204': errors.ExchangeError, // override commons
                    },
                },
                'portfolioMargin': {
                    'exact': {
                        //
                        //        10xx General Server or Network Issues
                        //
                        '-1000': errors.OperationFailed,
                        '-1001': errors.ExchangeError,
                        '-1002': errors.PermissionDenied,
                        '-1003': errors.RateLimitExceeded,
                        '-1004': errors.BadRequest,
                        '-1005': errors.PermissionDenied,
                        '-1006': errors.BadResponse,
                        '-1007': errors.BadResponse,
                        '-1008': errors.OperationFailed,
                        '-1010': errors.ExchangeError,
                        '-1011': errors.PermissionDenied,
                        '-1013': errors.ExchangeError,
                        '-1014': errors.InvalidOrder,
                        '-1015': errors.InvalidOrder,
                        '-1016': errors.NotSupported,
                        '-1020': errors.NotSupported,
                        '-1021': errors.BadRequest,
                        '-1022': errors.BadRequest,
                        '-1023': errors.BadRequest,
                        '-1099': errors.OperationFailed,
                        //
                        //        11xx Request Issues
                        //
                        '-1100': errors.BadRequest,
                        '-1101': errors.BadRequest,
                        '-1102': errors.BadRequest,
                        '-1103': errors.BadRequest,
                        '-1104': errors.BadRequest,
                        '-1105': errors.BadRequest,
                        '-1106': errors.BadRequest,
                        '-1108': errors.BadRequest,
                        '-1109': errors.BadRequest,
                        '-1110': errors.BadSymbol,
                        '-1111': errors.BadRequest,
                        '-1112': errors.BadRequest,
                        '-1113': errors.BadRequest,
                        '-1114': errors.BadRequest,
                        '-1115': errors.BadRequest,
                        '-1116': errors.BadRequest,
                        '-1117': errors.BadRequest,
                        '-1118': errors.BadRequest,
                        '-1119': errors.BadRequest,
                        '-1120': errors.BadRequest,
                        '-1121': errors.BadSymbol,
                        '-1125': errors.BadRequest,
                        '-1127': errors.BadRequest,
                        '-1128': errors.BadRequest,
                        '-1130': errors.BadRequest,
                        '-1131': errors.BadRequest,
                        '-1134': errors.BadRequest,
                        '-1136': errors.BadRequest,
                        '-1145': errors.BadRequest,
                        '-1151': errors.BadRequest,
                        //
                        //        20xx Processing Issues
                        //
                        '-2010': errors.InvalidOrder,
                        '-2011': errors.OperationRejected,
                        '-2013': errors.OrderNotFound,
                        '-2014': errors.OperationRejected,
                        '-2015': errors.OperationRejected,
                        '-2016': errors.OperationFailed,
                        '-2018': errors.OperationFailed,
                        '-2019': errors.OperationFailed,
                        '-2020': errors.OrderNotFillable,
                        '-2021': errors.OrderImmediatelyFillable,
                        '-2022': errors.InvalidOrder,
                        '-2023': errors.OperationFailed,
                        '-2024': errors.OperationRejected,
                        '-2025': errors.OperationRejected,
                        '-2026': errors.InvalidOrder,
                        '-2027': errors.OperationRejected,
                        '-2028': errors.OperationRejected,
                        //
                        //        4xxx Filters and other issues
                        //
                        '-4000': errors.BadRequest,
                        '-4001': errors.BadRequest,
                        '-4002': errors.BadRequest,
                        '-4003': errors.BadRequest,
                        '-4004': errors.BadRequest,
                        '-4005': errors.BadRequest,
                        '-4006': errors.BadRequest,
                        '-4007': errors.BadRequest,
                        '-4008': errors.BadRequest,
                        '-4009': errors.BadRequest,
                        '-4010': errors.BadRequest,
                        '-4011': errors.BadRequest,
                        '-4012': errors.BadRequest,
                        '-4013': errors.BadRequest,
                        '-4014': errors.BadRequest,
                        '-4015': errors.BadRequest,
                        '-4016': errors.BadRequest,
                        '-4017': errors.BadRequest,
                        '-4018': errors.BadRequest,
                        '-4019': errors.BadRequest,
                        '-4020': errors.BadRequest,
                        '-4021': errors.BadRequest,
                        '-4022': errors.BadRequest,
                        '-4023': errors.BadRequest,
                        '-4024': errors.BadRequest,
                        '-4025': errors.BadRequest,
                        '-4026': errors.BadRequest,
                        '-4027': errors.BadRequest,
                        '-4028': errors.BadRequest,
                        '-4029': errors.BadRequest,
                        '-4030': errors.BadRequest,
                        '-4031': errors.BadRequest,
                        '-4032': errors.BadRequest,
                        '-4033': errors.BadRequest,
                        '-4044': errors.BadRequest,
                        '-4045': errors.BadRequest,
                        '-4046': errors.BadRequest,
                        '-4047': errors.BadRequest,
                        '-4048': errors.BadRequest,
                        '-4049': errors.BadRequest,
                        '-4050': errors.BadRequest,
                        '-4051': errors.BadRequest,
                        '-4052': errors.BadRequest,
                        '-4053': errors.BadRequest,
                        '-4054': errors.BadRequest,
                        '-4055': errors.BadRequest,
                        '-4056': errors.PermissionDenied,
                        '-4057': errors.PermissionDenied,
                        '-4058': errors.BadRequest,
                        '-4059': errors.BadRequest,
                        '-4060': errors.BadRequest,
                        '-4061': errors.InvalidOrder,
                        '-4062': errors.BadRequest,
                        '-4063': errors.BadRequest,
                        '-4064': errors.BadRequest,
                        '-4065': errors.BadRequest,
                        '-4066': errors.BadRequest,
                        '-4067': errors.BadRequest,
                        '-4068': errors.BadRequest,
                        '-4069': errors.BadRequest,
                        '-4070': errors.BadRequest,
                        '-4071': errors.BadRequest,
                        '-4072': errors.OperationRejected,
                        '-4073': errors.BadRequest,
                        '-4074': errors.BadRequest,
                        '-4075': errors.BadRequest,
                        '-4076': errors.OperationRejected,
                        '-4077': errors.OperationRejected,
                        '-4078': errors.OperationFailed,
                        '-4079': errors.BadRequest,
                        '-4080': errors.PermissionDenied,
                        '-4081': errors.BadRequest,
                        '-4082': errors.BadRequest,
                        '-4083': errors.BadRequest,
                        '-4084': errors.NotSupported,
                        '-4085': errors.BadRequest,
                        '-4086': errors.BadRequest,
                        '-4087': errors.PermissionDenied,
                        '-4088': errors.PermissionDenied,
                        '-4104': errors.BadRequest,
                        '-4114': errors.BadRequest,
                        '-4115': errors.BadRequest,
                        '-4118': errors.OperationRejected,
                        '-4131': errors.OperationRejected,
                        '-4135': errors.BadRequest,
                        '-4137': errors.BadRequest,
                        '-4138': errors.BadRequest,
                        '-4139': errors.BadRequest,
                        '-4140': errors.OrderImmediatelyFillable,
                        '-4141': errors.BadRequest,
                        '-4142': errors.OrderImmediatelyFillable,
                        '-4144': errors.BadSymbol,
                        '-4161': errors.OperationRejected,
                        '-4164': errors.InvalidOrder,
                        '-4165': errors.BadRequest,
                        '-4183': errors.InvalidOrder,
                        '-4184': errors.InvalidOrder,
                        '-4408': errors.InvalidOrder,
                        //
                        //        5xxx Order Execution Issues
                        //
                        '-5021': errors.OrderNotFillable,
                        '-5022': errors.OrderNotFillable,
                        '-5028': errors.OperationFailed,
                        '-5041': errors.RateLimitExceeded, // Time out for too many requests from this account queueing at the same time.
                    },
                },
                'exact': {
                    // error codes to cover ALL market types (however, specific market type might have override)
                    //
                    //        1xxx
                    //
                    '-1000': errors.OperationFailed,
                    '-1001': errors.OperationFailed,
                    '-1002': errors.AuthenticationError,
                    '-1003': errors.RateLimitExceeded,
                    '-1004': errors.OperationRejected,
                    '-1006': errors.OperationFailed,
                    '-1007': errors.RequestTimeout,
                    '-1010': errors.OperationFailed,
                    '-1013': errors.BadRequest,
                    '-1014': errors.InvalidOrder,
                    '-1015': errors.RateLimitExceeded,
                    '-1016': errors.BadRequest,
                    '-1020': errors.BadRequest,
                    '-1021': errors.InvalidNonce,
                    '-1022': errors.AuthenticationError,
                    '-1100': errors.BadRequest,
                    '-1101': errors.BadRequest,
                    '-1102': errors.BadRequest,
                    '-1103': errors.BadRequest,
                    '-1104': errors.BadRequest,
                    '-1105': errors.BadRequest,
                    '-1106': errors.BadRequest,
                    '-1108': errors.BadSymbol,
                    '-1111': errors.BadRequest,
                    '-1112': errors.OperationFailed,
                    '-1114': errors.BadRequest,
                    '-1115': errors.BadRequest,
                    '-1116': errors.BadRequest,
                    '-1117': errors.BadRequest,
                    '-1118': errors.BadRequest,
                    '-1119': errors.BadRequest,
                    '-1120': errors.BadRequest,
                    '-1121': errors.BadSymbol,
                    '-1125': errors.AuthenticationError,
                    '-1127': errors.BadRequest,
                    '-1128': errors.BadRequest,
                    '-1130': errors.BadRequest,
                    //
                    //        2xxx
                    //
                    '-2010': errors.InvalidOrder,
                    '-2011': errors.OrderNotFound,
                    '-2013': errors.OrderNotFound,
                    '-2014': errors.AuthenticationError,
                    '-2015': errors.AuthenticationError,
                    //
                    //        4xxx (common for linear, inverse, pm)
                    //
                    '-4000': errors.InvalidOrder,
                    '-4001': errors.BadRequest,
                    '-4002': errors.BadRequest,
                    '-4003': errors.BadRequest,
                    '-4004': errors.BadRequest,
                    '-4005': errors.BadRequest,
                    '-4006': errors.BadRequest,
                    '-4007': errors.BadRequest,
                    '-4008': errors.BadRequest,
                    '-4009': errors.BadRequest,
                    '-4010': errors.BadRequest,
                    '-4011': errors.BadRequest,
                    '-4012': errors.BadRequest,
                    '-4013': errors.BadRequest,
                    '-4014': errors.BadRequest,
                    '-4015': errors.BadRequest,
                    '-4016': errors.BadRequest,
                    '-4017': errors.BadRequest,
                    '-4018': errors.BadRequest,
                    '-4019': errors.OperationRejected,
                    '-4020': errors.BadRequest,
                    '-4021': errors.BadRequest,
                    '-4022': errors.BadRequest,
                    '-4023': errors.BadRequest,
                    '-4024': errors.BadRequest,
                    '-4025': errors.BadRequest,
                    '-4026': errors.BadRequest,
                    '-4027': errors.BadRequest,
                    '-4028': errors.BadRequest,
                    '-4029': errors.BadRequest,
                    '-4030': errors.BadRequest,
                    '-4031': errors.BadRequest,
                    '-4032': errors.OperationRejected,
                    '-4033': errors.BadRequest,
                    '-4044': errors.BadRequest,
                    '-4045': errors.OperationRejected,
                    '-4046': errors.OperationRejected,
                    '-4047': errors.OperationRejected,
                    '-4048': errors.OperationRejected,
                    '-4049': errors.BadRequest,
                    '-4050': errors.InsufficientFunds,
                    '-4051': errors.InsufficientFunds,
                    '-4052': errors.OperationRejected,
                    '-4053': errors.BadRequest,
                    '-4054': errors.OperationRejected,
                    '-4055': errors.BadRequest,
                    '-4056': errors.AuthenticationError,
                    '-4057': errors.AuthenticationError,
                    '-4058': errors.BadRequest,
                    '-4059': errors.OperationRejected,
                    '-4060': errors.BadRequest,
                    '-4061': errors.OperationRejected,
                    '-4062': errors.BadRequest,
                    '-4067': errors.OperationRejected,
                    '-4068': errors.OperationRejected,
                    '-4082': errors.BadRequest,
                    '-4083': errors.OperationRejected,
                    '-4084': errors.BadRequest,
                    '-4086': errors.BadRequest,
                    '-4104': errors.BadRequest,
                    '-4135': errors.BadRequest,
                    '-4137': errors.BadRequest,
                    '-4138': errors.BadRequest,
                    '-4139': errors.BadRequest,
                    '-4142': errors.OrderImmediatelyFillable,
                    //
                    //        2xxxx
                    //
                    // 20xxx - spot & futures algo (TBD for OPTIONS & PORTFOLIO MARGIN)
                    '-20121': errors.BadSymbol,
                    '-20124': errors.BadRequest,
                    '-20130': errors.BadRequest,
                    '-20132': errors.BadRequest,
                    '-20194': errors.BadRequest,
                    '-20195': errors.BadRequest,
                    '-20196': errors.BadRequest,
                    '-20198': errors.OperationRejected,
                    '-20204': errors.BadRequest,
                    //
                    // strings
                    //
                    'System is under maintenance.': errors.OnMaintenance,
                    'System abnormality': errors.OperationFailed,
                    'You are not authorized to execute this request.': errors.PermissionDenied,
                    'API key does not exist': errors.AuthenticationError,
                    'Order would trigger immediately.': errors.OrderImmediatelyFillable,
                    'Stop price would trigger immediately.': errors.OrderImmediatelyFillable,
                    'Order would immediately match and take.': errors.OrderImmediatelyFillable,
                    'Account has insufficient balance for requested action.': errors.InsufficientFunds,
                    'Rest API trading is not enabled.': errors.PermissionDenied,
                    'This account may not place or cancel orders.': errors.PermissionDenied,
                    "You don't have permission.": errors.PermissionDenied,
                    'Market is closed.': errors.MarketClosed,
                    'Too many requests. Please try again later.': errors.RateLimitExceeded,
                    'This action is disabled on this account.': errors.AccountSuspended,
                    'Limit orders require GTC for this phase.': errors.BadRequest,
                    'This order type is not possible in this trading phase.': errors.BadRequest,
                    'This type of sub-account exceeds the maximum number limit': errors.OperationRejected,
                    'This symbol is restricted for this account.': errors.PermissionDenied,
                    'This symbol is not permitted for this account.': errors.PermissionDenied, // {"code":-2010,"msg":"This symbol is not permitted for this account."}
                },
                'broad': {
                    'has no operation privilege': errors.PermissionDenied,
                    'MAX_POSITION': errors.BadRequest, // {"code":-2010,"msg":"Filter failure: MAX_POSITION"}
                },
            },
        });
    }
    isInverse(type, subType = undefined) {
        if (subType === undefined) {
            return (type === 'delivery');
        }
        else {
            return subType === 'inverse';
        }
    }
    isLinear(type, subType = undefined) {
        if (subType === undefined) {
            return (type === 'future') || (type === 'swap');
        }
        else {
            return subType === 'linear';
        }
    }
    setSandboxMode(enable) {
        super.setSandboxMode(enable);
        this.options['sandboxMode'] = enable;
    }
    createExpiredOptionMarket(symbol) {
        // support expired option contracts
        const settle = 'USDT';
        const optionParts = symbol.split('-');
        const symbolBase = symbol.split('/');
        let base = undefined;
        if (symbol.indexOf('/') > -1) {
            base = this.safeString(symbolBase, 0);
        }
        else {
            base = this.safeString(optionParts, 0);
        }
        const expiry = this.safeString(optionParts, 1);
        const strike = this.safeInteger(optionParts, 2);
        const strikeAsString = this.safeString(optionParts, 2);
        const optionType = this.safeString(optionParts, 3);
        const datetime = this.convertExpireDate(expiry);
        const timestamp = this.parse8601(datetime);
        return {
            'id': base + '-' + expiry + '-' + strikeAsString + '-' + optionType,
            'symbol': base + '/' + settle + ':' + settle + '-' + expiry + '-' + strikeAsString + '-' + optionType,
            'base': base,
            'quote': settle,
            'baseId': base,
            'quoteId': settle,
            'active': undefined,
            'type': 'option',
            'linear': undefined,
            'inverse': undefined,
            'spot': false,
            'swap': false,
            'future': false,
            'option': true,
            'margin': false,
            'contract': true,
            'contractSize': undefined,
            'expiry': timestamp,
            'expiryDatetime': datetime,
            'optionType': (optionType === 'C') ? 'call' : 'put',
            'strike': strike,
            'settle': settle,
            'settleId': settle,
            'precision': {
                'amount': undefined,
                'price': undefined,
            },
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'info': undefined,
        };
    }
    market(symbol) {
        if (this.markets === undefined) {
            throw new errors.ExchangeError(this.id + ' markets not loaded');
        }
        // defaultType has legacy support on binance
        let defaultType = this.safeString(this.options, 'defaultType');
        const defaultSubType = this.safeString(this.options, 'defaultSubType');
        const isLegacyLinear = defaultType === 'future';
        const isLegacyInverse = defaultType === 'delivery';
        const isLegacy = isLegacyLinear || isLegacyInverse;
        if (typeof symbol === 'string') {
            if (symbol in this.markets) {
                const market = this.markets[symbol];
                // begin diff
                if (isLegacy && market['spot']) {
                    const settle = isLegacyLinear ? market['quote'] : market['base'];
                    const futuresSymbol = symbol + ':' + settle;
                    if (futuresSymbol in this.markets) {
                        return this.markets[futuresSymbol];
                    }
                }
                else {
                    return market;
                }
                // end diff
            }
            else if (symbol in this.markets_by_id) {
                const markets = this.markets_by_id[symbol];
                // begin diff
                if (isLegacyLinear) {
                    defaultType = 'linear';
                }
                else if (isLegacyInverse) {
                    defaultType = 'inverse';
                }
                else if (defaultType === undefined) {
                    defaultType = defaultSubType;
                }
                // end diff
                for (let i = 0; i < markets.length; i++) {
                    const market = markets[i];
                    if (market[defaultType]) {
                        return market;
                    }
                }
                return markets[0];
            }
            else if ((symbol.indexOf('/') > -1) && (symbol.indexOf(':') < 0)) {
                if ((defaultType !== undefined) && (defaultType !== 'spot')) {
                    // support legacy symbols
                    const [base, quote] = symbol.split('/');
                    const settle = (quote === 'USD') ? base : quote;
                    const futuresSymbol = symbol + ':' + settle;
                    if (futuresSymbol in this.markets) {
                        return this.markets[futuresSymbol];
                    }
                }
            }
            else if ((symbol.indexOf('-C') > -1) || (symbol.indexOf('-P') > -1)) { // both exchange-id and unified symbols are supported this way regardless of the defaultType
                return this.createExpiredOptionMarket(symbol);
            }
        }
        throw new errors.BadSymbol(this.id + ' does not have market symbol ' + symbol);
    }
    safeMarket(marketId = undefined, market = undefined, delimiter = undefined, marketType = undefined) {
        const isOption = (marketId !== undefined) && ((marketId.indexOf('-C') > -1) || (marketId.indexOf('-P') > -1));
        if (isOption && !(marketId in this.markets_by_id)) {
            // handle expired option contracts
            return this.createExpiredOptionMarket(marketId);
        }
        return super.safeMarket(marketId, market, delimiter, marketType);
    }
    costToPrecision(symbol, cost) {
        return this.decimalToPrecision(cost, number.TRUNCATE, this.markets[symbol]['precision']['quote'], this.precisionMode, this.paddingMode);
    }
    nonce() {
        return this.milliseconds() - this.options['timeDifference'];
    }
    /**
     * @method
     * @name binance#enableDemoTrading
     * @description enables or disables demo trading mode
     * @see https://www.binance.com/en/support/faq/detail/9be58f73e5e14338809e3b705b9687dd
     * @see https://demo.binance.com/en/my/settings/api-management
     * @param {boolean} [enable] true if demo trading should be enabled, false otherwise
     */
    enableDemoTrading(enable) {
        if (this.isSandboxModeEnabled) {
            throw new errors.NotSupported(this.id + ' demo trading is not supported in the sandbox environment. Please check https://www.binance.com/en/support/faq/detail/9be58f73e5e14338809e3b705b9687dd to see the differences');
        }
        if (enable) {
            this.urls['apiBackupDemoTrading'] = this.urls['api'];
            this.urls['api'] = this.urls['demo'];
        }
        else if ('apiBackupDemoTrading' in this.urls) {
            this.urls['api'] = this.urls['apiBackupDemoTrading'];
            const newUrls = this.omit(this.urls, 'apiBackupDemoTrading');
            this.urls = newUrls;
        }
        this.options['enableDemoTrading'] = enable;
    }
    /**
     * @method
     * @name binance#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/general-endpoints#check-server-time          // spot
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Check-Server-Time    // swap
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Check-Server-time    // future
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const defaultType = this.safeString2(this.options, 'fetchTime', 'defaultType', 'spot');
        const type = this.safeString(params, 'type', defaultType);
        const query = this.omit(params, 'type');
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchTime', undefined, params);
        let response = undefined;
        if (this.isLinear(type, subType)) {
            response = await this.fapiPublicGetTime(query);
        }
        else if (this.isInverse(type, subType)) {
            response = await this.dapiPublicGetTime(query);
        }
        else {
            response = await this.publicGetTime(query);
        }
        return this.safeInteger(response, 'serverTime');
    }
    /**
     * @method
     * @name binance#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://developers.binance.com/docs/wallet/capital/all-coins-info
     * @see https://developers.binance.com/docs/margin_trading/market-data/Get-All-Margin-Assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const fetchCurrenciesEnabled = this.safeBool(this.options, 'fetchCurrencies');
        if (!fetchCurrenciesEnabled) {
            return {};
        }
        // this endpoint requires authentication
        // while fetchCurrencies is a public API method by design
        // therefore we check the keys here
        // and fallback to generating the currencies from the markets
        if (!this.checkRequiredCredentials(false)) {
            return {};
        }
        // sandbox/testnet does not support sapi endpoints
        const apiBackup = this.safeValue(this.urls, 'apiBackup');
        if (apiBackup !== undefined) {
            return {};
        }
        // demotrading does not support sapi endpoints
        if (this.safeBool(this.options, 'enableDemoTrading', false)) {
            return {};
        }
        const promises = [this.sapiGetCapitalConfigGetall(params)];
        const fetchMargins = this.safeBool(this.options, 'fetchMargins', false);
        if (fetchMargins) {
            promises.push(this.sapiGetMarginAllPairs(params));
        }
        const results = await Promise.all(promises);
        const responseCurrencies = results[0];
        let marginablesById = undefined;
        if (fetchMargins) {
            const responseMarginables = results[1];
            marginablesById = this.indexBy(responseMarginables, 'assetName');
        }
        const result = {};
        for (let i = 0; i < responseCurrencies.length; i++) {
            //
            //    {
            //        "coin": "LINK",
            //        "depositAllEnable": true,
            //        "withdrawAllEnable": true,
            //        "name": "ChainLink",
            //        "free": "0",
            //        "locked": "0",
            //        "freeze": "0",
            //        "withdrawing": "0",
            //        "ipoing": "0",
            //        "ipoable": "0",
            //        "storage": "0",
            //        "isLegalMoney": false,
            //        "trading": true,
            //        "networkList": [
            //            {
            //                "network": "BSC",
            //                "coin": "LINK",
            //                "withdrawIntegerMultiple": "0.00000001",
            //                "isDefault": false,
            //                "depositEnable": true,
            //                "withdrawEnable": true,
            //                "depositDesc": "",
            //                "withdrawDesc": "",
            //                "specialTips": "",
            //                "specialWithdrawTips": "The network you have selected is BSC. Please ensure that the withdrawal address supports the Binance Smart Chain network. You will lose your assets if the chosen platform does not support retrievals.",
            //                "name": "BNB Smart Chain (BEP20)",
            //                "resetAddressStatus": false,
            //                "addressRegex": "^(0x)[0-9A-Fa-f]{40}$",
            //                "addressRule": "",
            //                "memoRegex": "",
            //                "withdrawFee": "0.012",
            //                "withdrawMin": "0.024",
            //                "withdrawMax": "9999999999.99999999",
            //                "minConfirm": "15",
            //                "unLockConfirm": "0",
            //                "sameAddress": false,
            //                "estimatedArrivalTime": "5",
            //                "busy": false,
            //                "country": "AE,BINANCE_BAHRAIN_BSC"
            //            },
            //            {
            //                "network": "BNB",
            //                "coin": "LINK",
            //                "withdrawIntegerMultiple": "0.00000001",
            //                "isDefault": false,
            //                "depositEnable": true,
            //                "withdrawEnable": true,
            //                "depositDesc": "",
            //                "withdrawDesc": "",
            //                "specialTips": "Both a MEMO and an Address are required to successfully deposit your LINK BEP2 tokens to Binance.",
            //                "specialWithdrawTips": "",
            //                "name": "BNB Beacon Chain (BEP2)",
            //                "resetAddressStatus": false,
            //                "addressRegex": "^(bnb1)[0-9a-z]{38}$",
            //                "addressRule": "",
            //                "memoRegex": "^[0-9A-Za-z\\-_]{1,120}$",
            //                "withdrawFee": "0.003",
            //                "withdrawMin": "0.01",
            //                "withdrawMax": "10000000000",
            //                "minConfirm": "1",
            //                "unLockConfirm": "0",
            //                "sameAddress": true,
            //                "estimatedArrivalTime": "5",
            //                "busy": false,
            //                "country": "AE,BINANCE_BAHRAIN_BSC"
            //            },
            //            {
            //                "network": "ETH",
            //                "coin": "LINK",
            //                "withdrawIntegerMultiple": "0.00000001",
            //                "isDefault": true,
            //                "depositEnable": true,
            //                "withdrawEnable": true,
            //                "depositDesc": "",
            //                "withdrawDesc": "",
            //                "name": "Ethereum (ERC20)",
            //                "resetAddressStatus": false,
            //                "addressRegex": "^(0x)[0-9A-Fa-f]{40}$",
            //                "addressRule": "",
            //                "memoRegex": "",
            //                "withdrawFee": "0.55",
            //                "withdrawMin": "1.1",
            //                "withdrawMax": "10000000000",
            //                "minConfirm": "12",
            //                "unLockConfirm": "0",
            //                "sameAddress": false,
            //                "estimatedArrivalTime": "5",
            //                "busy": false,
            //                "country": "AE,BINANCE_BAHRAIN_BSC"
            //            }
            //        ]
            //    }
            //
            const entry = responseCurrencies[i];
            const id = this.safeString(entry, 'coin');
            const name = this.safeString(entry, 'name');
            const code = this.safeCurrencyCode(id);
            const isFiat = this.safeBool(entry, 'isLegalMoney');
            let minPrecision = undefined;
            let isWithdrawEnabled = true;
            let isDepositEnabled = true;
            const networkList = this.safeList(entry, 'networkList', []);
            const fees = {};
            let fee = undefined;
            const networks = {};
            for (let j = 0; j < networkList.length; j++) {
                const networkItem = networkList[j];
                const network = this.safeString(networkItem, 'network');
                const networkCode = this.networkIdToCode(network);
                const isETF = (network === 'ETF'); // e.g. BTCUP, ETHDOWN
                // const name = this.safeString (networkItem, 'name');
                const withdrawFee = this.safeNumber(networkItem, 'withdrawFee');
                const depositEnable = this.safeBool(networkItem, 'depositEnable');
                const withdrawEnable = this.safeBool(networkItem, 'withdrawEnable');
                isDepositEnabled = isDepositEnabled || depositEnable;
                isWithdrawEnabled = isWithdrawEnabled || withdrawEnable;
                fees[network] = withdrawFee;
                const isDefault = this.safeBool(networkItem, 'isDefault');
                if (isDefault || (fee === undefined)) {
                    fee = withdrawFee;
                }
                // todo: default networks in "setMarkets" overload
                // if (isDefault) {
                //     this.options['defaultNetworkCodesForCurrencies'][code] = networkCode;
                // }
                const precisionTick = this.safeString(networkItem, 'withdrawIntegerMultiple');
                let withdrawPrecision = precisionTick;
                // avoid zero values, which are mostly from fiat or leveraged tokens or some abandoned coins : https://github.com/ccxt/ccxt/pull/14902#issuecomment-1271636731
                if (!Precise["default"].stringEq(precisionTick, '0')) {
                    minPrecision = (minPrecision === undefined) ? precisionTick : Precise["default"].stringMin(minPrecision, precisionTick);
                }
                else {
                    if (!isFiat && !isETF) {
                        // non-fiat and non-ETF currency, there are many cases when precision is set to zero (probably bug, we've reported to binance already)
                        // in such cases, we can set default precision of 8 (which is in UI for such coins)
                        withdrawPrecision = this.omitZero(this.safeString(networkItem, 'withdrawInternalMin'));
                        if (withdrawPrecision === undefined) {
                            withdrawPrecision = this.safeString(this.options, 'defaultWithdrawPrecision');
                        }
                    }
                }
                networks[networkCode] = {
                    'info': networkItem,
                    'id': network,
                    'network': networkCode,
                    'active': depositEnable && withdrawEnable,
                    'deposit': depositEnable,
                    'withdraw': withdrawEnable,
                    'fee': withdrawFee,
                    'precision': this.parseNumber(withdrawPrecision),
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber(networkItem, 'withdrawMin'),
                            'max': this.safeNumber(networkItem, 'withdrawMax'),
                        },
                        'deposit': {
                            'min': this.safeNumber(networkItem, 'depositDust'),
                            'max': undefined,
                        },
                    },
                };
            }
            const trading = this.safeBool(entry, 'trading');
            const active = (isWithdrawEnabled && isDepositEnabled && trading);
            const marginEntry = this.safeDict(marginablesById, id, {});
            //
            //     {
            //         assetName: "BTC",
            //         assetFullName: "Bitcoin",
            //         isBorrowable: true,
            //         isMortgageable: true,
            //         userMinBorrow: "0",
            //         userMinRepay: "0",
            //     }
            //
            result[code] = {
                'id': id,
                'name': name,
                'code': code,
                'type': isFiat ? 'fiat' : 'crypto',
                'precision': this.parseNumber(minPrecision),
                'info': entry,
                'active': active,
                'deposit': isDepositEnabled,
                'withdraw': isWithdrawEnabled,
                'networks': networks,
                'fee': fee,
                'fees': fees,
                'limits': this.limits,
                'margin': this.safeBool(marginEntry, 'isBorrowable'),
            };
        }
        return result;
    }
    /**
     * @method
     * @name binance#fetchMarkets
     * @description retrieves data on all markets for binance
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/general-endpoints#exchange-information           // spot
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Exchange-Information     // swap
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Exchange-Information     // future
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Exchange-Information                             // option
     * @see https://developers.binance.com/docs/margin_trading/market-data/Get-All-Cross-Margin-Pairs                           // cross margin
     * @see https://developers.binance.com/docs/margin_trading/market-data/Get-All-Isolated-Margin-Symbol                       // isolated margin
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const promisesRaw = [];
        let rawFetchMarkets = undefined;
        const defaultTypes = ['spot', 'linear', 'inverse'];
        const fetchMarketsOptions = this.safeDict(this.options, 'fetchMarkets');
        if (fetchMarketsOptions !== undefined) {
            rawFetchMarkets = this.safeList(fetchMarketsOptions, 'types', defaultTypes);
        }
        else {
            // for backward-compatibility
            rawFetchMarkets = this.safeList(this.options, 'fetchMarkets', defaultTypes);
        }
        // handle loadAllOptions option
        const loadAllOptions = this.safeBool(this.options, 'loadAllOptions', false);
        if (loadAllOptions) {
            if (!this.inArray('option', rawFetchMarkets)) {
                rawFetchMarkets.push('option');
            }
        }
        const sandboxMode = this.safeBool(this.options, 'sandboxMode', false);
        const demoMode = this.safeBool(this.options, 'enableDemoTrading', false);
        const isDemoEnv = demoMode || sandboxMode;
        const fetchMarkets = [];
        for (let i = 0; i < rawFetchMarkets.length; i++) {
            const type = rawFetchMarkets[i];
            if (type === 'option' && isDemoEnv) {
                continue;
            }
            fetchMarkets.push(type);
        }
        const fetchMargins = this.safeBool(this.options, 'fetchMargins', false);
        for (let i = 0; i < fetchMarkets.length; i++) {
            const marketType = fetchMarkets[i];
            if (marketType === 'spot') {
                promisesRaw.push(this.publicGetExchangeInfo(params));
                if (fetchMargins && this.checkRequiredCredentials(false) && !isDemoEnv) {
                    promisesRaw.push(this.sapiGetMarginAllPairs(params));
                    promisesRaw.push(this.sapiGetMarginIsolatedAllPairs(params));
                }
            }
            else if (marketType === 'linear') {
                promisesRaw.push(this.fapiPublicGetExchangeInfo(params));
            }
            else if (marketType === 'inverse') {
                promisesRaw.push(this.dapiPublicGetExchangeInfo(params));
            }
            else if (marketType === 'option') {
                promisesRaw.push(this.eapiPublicGetExchangeInfo(params));
            }
            else {
                throw new errors.ExchangeError(this.id + ' fetchMarkets() this.options fetchMarkets "' + marketType + '" is not a supported market type');
            }
        }
        const results = await Promise.all(promisesRaw);
        let markets = [];
        this.options['crossMarginPairsData'] = [];
        this.options['isolatedMarginPairsData'] = [];
        for (let i = 0; i < results.length; i++) {
            const res = this.safeValue(results, i);
            if (fetchMargins && Array.isArray(res)) {
                const keysList = Object.keys(this.indexBy(res, 'symbol'));
                const length = this.options['crossMarginPairsData'].length;
                // first one is the cross-margin promise
                if (length === 0) {
                    this.options['crossMarginPairsData'] = keysList;
                }
                else {
                    this.options['isolatedMarginPairsData'] = keysList;
                }
            }
            else {
                const resultMarkets = this.safeList2(res, 'symbols', 'optionSymbols', []);
                markets = this.arrayConcat(markets, resultMarkets);
            }
        }
        //
        // spot / margin
        //
        //     {
        //         "timezone":"UTC",
        //         "serverTime":1575416692969,
        //         "rateLimits":[
        //             {"rateLimitType":"REQUEST_WEIGHT","interval":"MINUTE","intervalNum":1,"limit":1200},
        //             {"rateLimitType":"ORDERS","interval":"SECOND","intervalNum":10,"limit":100},
        //             {"rateLimitType":"ORDERS","interval":"DAY","intervalNum":1,"limit":200000}
        //         ],
        //         "exchangeFilters":[],
        //         "symbols":[
        //             {
        //                 "symbol":"ETHBTC",
        //                 "status":"TRADING",
        //                 "baseAsset":"ETH",
        //                 "baseAssetPrecision":8,
        //                 "quoteAsset":"BTC",
        //                 "quotePrecision":8,
        //                 "baseCommissionPrecision":8,
        //                 "quoteCommissionPrecision":8,
        //                 "orderTypes":["LIMIT","LIMIT_MAKER","MARKET","STOP_LOSS_LIMIT","TAKE_PROFIT_LIMIT"],
        //                 "icebergAllowed":true,
        //                 "ocoAllowed":true,
        //                 "quoteOrderQtyMarketAllowed":true,
        //                 "allowTrailingStop":false,
        //                 "isSpotTradingAllowed":true,
        //                 "isMarginTradingAllowed":true,
        //                 "filters":[
        //                     {"filterType":"PRICE_FILTER","minPrice":"0.00000100","maxPrice":"100000.00000000","tickSize":"0.00000100"},
        //                     {"filterType":"PERCENT_PRICE","multiplierUp":"5","multiplierDown":"0.2","avgPriceMins":5},
        //                     {"filterType":"LOT_SIZE","minQty":"0.00100000","maxQty":"100000.00000000","stepSize":"0.00100000"},
        //                     {"filterType":"MIN_NOTIONAL","minNotional":"0.00010000","applyToMarket":true,"avgPriceMins":5},
        //                     {"filterType":"ICEBERG_PARTS","limit":10},
        //                     {"filterType":"MARKET_LOT_SIZE","minQty":"0.00000000","maxQty":"63100.00000000","stepSize":"0.00000000"},
        //                     {"filterType":"MAX_NUM_ORDERS","maxNumOrders":200},
        //                     {"filterType":"MAX_NUM_ALGO_ORDERS","maxNumAlgoOrders":5}
        //                 ],
        //                 "permissions":["SPOT","MARGIN"]}
        //             },
        //         ],
        //     }
        //
        // cross & isolated pairs response:
        //
        //     [
        //         {
        //           symbol: "BTCUSDT",
        //           base: "BTC",
        //           quote: "USDT",
        //           isMarginTrade: true,
        //           isBuyAllowed: true,
        //           isSellAllowed: true,
        //           id: "376870555451677893", // doesn't exist in isolated
        //         },
        //     ]
        //
        // futures/usdt-margined (fapi)
        //
        //     {
        //         "timezone":"UTC",
        //         "serverTime":1575417244353,
        //         "rateLimits":[
        //             {"rateLimitType":"REQUEST_WEIGHT","interval":"MINUTE","intervalNum":1,"limit":1200},
        //             {"rateLimitType":"ORDERS","interval":"MINUTE","intervalNum":1,"limit":1200}
        //         ],
        //         "exchangeFilters":[],
        //         "symbols":[
        //             {
        //                 "symbol":"BTCUSDT",
        //                 "status":"TRADING",
        //                 "maintMarginPercent":"2.5000",
        //                 "requiredMarginPercent":"5.0000",
        //                 "baseAsset":"BTC",
        //                 "quoteAsset":"USDT",
        //                 "pricePrecision":2,
        //                 "quantityPrecision":3,
        //                 "baseAssetPrecision":8,
        //                 "quotePrecision":8,
        //                 "filters":[
        //                     {"minPrice":"0.01","maxPrice":"100000","filterType":"PRICE_FILTER","tickSize":"0.01"},
        //                     {"stepSize":"0.001","filterType":"LOT_SIZE","maxQty":"1000","minQty":"0.001"},
        //                     {"stepSize":"0.001","filterType":"MARKET_LOT_SIZE","maxQty":"1000","minQty":"0.001"},
        //                     {"limit":200,"filterType":"MAX_NUM_ORDERS"},
        //                     {"multiplierDown":"0.8500","multiplierUp":"1.1500","multiplierDecimal":"4","filterType":"PERCENT_PRICE"}
        //                 ],
        //                 "orderTypes":["LIMIT","MARKET","STOP"],
        //                 "timeInForce":["GTC","IOC","FOK","GTX"]
        //             }
        //         ]
        //     }
        //
        // delivery/coin-margined (dapi)
        //
        //     {
        //         "timezone": "UTC",
        //         "serverTime": 1597667052958,
        //         "rateLimits": [
        //             {"rateLimitType":"REQUEST_WEIGHT","interval":"MINUTE","intervalNum":1,"limit":6000},
        //             {"rateLimitType":"ORDERS","interval":"MINUTE","intervalNum":1,"limit":6000}
        //         ],
        //         "exchangeFilters": [],
        //         "symbols": [
        //             {
        //                 "symbol": "BTCUSD_200925",
        //                 "pair": "BTCUSD",
        //                 "contractType": "CURRENT_QUARTER",
        //                 "deliveryDate": 1601020800000,
        //                 "onboardDate": 1590739200000,
        //                 "contractStatus": "TRADING",
        //                 "contractSize": 100,
        //                 "marginAsset": "BTC",
        //                 "maintMarginPercent": "2.5000",
        //                 "requiredMarginPercent": "5.0000",
        //                 "baseAsset": "BTC",
        //                 "quoteAsset": "USD",
        //                 "pricePrecision": 1,
        //                 "quantityPrecision": 0,
        //                 "baseAssetPrecision": 8,
        //                 "quotePrecision": 8,
        //                 "equalQtyPrecision": 4,
        //                 "filters": [
        //                     {"minPrice":"0.1","maxPrice":"100000","filterType":"PRICE_FILTER","tickSize":"0.1"},
        //                     {"stepSize":"1","filterType":"LOT_SIZE","maxQty":"100000","minQty":"1"},
        //                     {"stepSize":"0","filterType":"MARKET_LOT_SIZE","maxQty":"100000","minQty":"1"},
        //                     {"limit":200,"filterType":"MAX_NUM_ORDERS"},
        //                     {"multiplierDown":"0.9500","multiplierUp":"1.0500","multiplierDecimal":"4","filterType":"PERCENT_PRICE"}
        //                 ],
        //                 "orderTypes": ["LIMIT","MARKET","STOP","STOP_MARKET","TAKE_PROFIT","TAKE_PROFIT_MARKET","TRAILING_STOP_MARKET"],
        //                 "timeInForce": ["GTC","IOC","FOK","GTX"]
        //             },
        //             {
        //                 "symbol": "BTCUSD_PERP",
        //                 "pair": "BTCUSD",
        //                 "contractType": "PERPETUAL",
        //                 "deliveryDate": 4133404800000,
        //                 "onboardDate": 1596006000000,
        //                 "contractStatus": "TRADING",
        //                 "contractSize": 100,
        //                 "marginAsset": "BTC",
        //                 "maintMarginPercent": "2.5000",
        //                 "requiredMarginPercent": "5.0000",
        //                 "baseAsset": "BTC",
        //                 "quoteAsset": "USD",
        //                 "pricePrecision": 1,
        //                 "quantityPrecision": 0,
        //                 "baseAssetPrecision": 8,
        //                 "quotePrecision": 8,
        //                 "equalQtyPrecision": 4,
        //                 "filters": [
        //                     {"minPrice":"0.1","maxPrice":"100000","filterType":"PRICE_FILTER","tickSize":"0.1"},
        //                     {"stepSize":"1","filterType":"LOT_SIZE","maxQty":"100000","minQty":"1"},
        //                     {"stepSize":"1","filterType":"MARKET_LOT_SIZE","maxQty":"100000","minQty":"1"},
        //                     {"limit":200,"filterType":"MAX_NUM_ORDERS"},
        //                     {"multiplierDown":"0.8500","multiplierUp":"1.1500","multiplierDecimal":"4","filterType":"PERCENT_PRICE"}
        //                 ],
        //                 "orderTypes": ["LIMIT","MARKET","STOP","STOP_MARKET","TAKE_PROFIT","TAKE_PROFIT_MARKET","TRAILING_STOP_MARKET"],
        //                 "timeInForce": ["GTC","IOC","FOK","GTX"]
        //             }
        //         ]
        //     }
        //
        // options (eapi)
        //
        //     {
        //         "timezone": "UTC",
        //         "serverTime": 1675912490405,
        //         "optionContracts": [
        //             {
        //                 "id": 1,
        //                 "baseAsset": "SOL",
        //                 "quoteAsset": "USDT",
        //                 "underlying": "SOLUSDT",
        //                 "settleAsset": "USDT"
        //             },
        //             ...
        //         ],
        //         "optionAssets": [
        //             {"id":1,"name":"USDT"}
        //         ],
        //         "optionSymbols": [
        //             {
        //                 "contractId": 3,
        //                 "expiryDate": 1677225600000,
        //                 "filters": [
        //                     {"filterType":"PRICE_FILTER","minPrice":"724.6","maxPrice":"919.2","tickSize":"0.1"},
        //                     {"filterType":"LOT_SIZE","minQty":"0.01","maxQty":"1000","stepSize":"0.01"}
        //                 ],
        //                 "id": 2474,
        //                 "symbol": "ETH-230224-800-C",
        //                 "side": "CALL",
        //                 "strikePrice": "800.00000000",
        //                 "underlying": "ETHUSDT",
        //                 "unit": 1,
        //                 "makerFeeRate": "0.00020000",
        //                 "takerFeeRate": "0.00020000",
        //                 "minQty": "0.01",
        //                 "maxQty": "1000",
        //                 "initialMargin": "0.15000000",
        //                 "maintenanceMargin": "0.07500000",
        //                 "minInitialMargin": "0.10000000",
        //                 "minMaintenanceMargin": "0.05000000",
        //                 "priceScale": 1,
        //                 "quantityScale": 2,
        //                 "quoteAsset": "USDT"
        //             },
        //             ...
        //         ],
        //         "rateLimits": [
        //             {"rateLimitType":"REQUEST_WEIGHT","interval":"MINUTE","intervalNum":1,"limit":400},
        //             {"rateLimitType":"ORDERS","interval":"MINUTE","intervalNum":1,"limit":100},
        //             {"rateLimitType":"ORDERS","interval":"SECOND","intervalNum":10,"limit":30}
        //         ]
        //     }
        //
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference();
        }
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            result.push(this.parseMarket(markets[i]));
        }
        return result;
    }
    parseMarket(market) {
        let swap = false;
        let future = false;
        let option = false;
        const underlying = this.safeString(market, 'underlying');
        const id = this.safeString(market, 'symbol');
        const optionParts = id.split('-');
        const optionBase = this.safeString(optionParts, 0);
        const lowercaseId = this.safeStringLower(market, 'symbol');
        const baseId = this.safeString(market, 'baseAsset', optionBase);
        const quoteId = this.safeString(market, 'quoteAsset');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const contractType = this.safeString(market, 'contractType');
        let contract = ('contractType' in market);
        let expiry = this.safeInteger2(market, 'deliveryDate', 'expiryDate');
        let settleId = this.safeString(market, 'marginAsset');
        if ((contractType === 'PERPETUAL') || (expiry === 4133404800000)) { // some swap markets do not have contract type, eg: BTCST
            expiry = undefined;
            swap = true;
        }
        else if (underlying !== undefined) {
            contract = true;
            option = true;
            settleId = (settleId === undefined) ? 'USDT' : settleId;
        }
        else if (expiry !== undefined) {
            future = true;
        }
        const settle = this.safeCurrencyCode(settleId);
        const spot = !contract;
        const filters = this.safeList(market, 'filters', []);
        const filtersByType = this.indexBy(filters, 'filterType');
        const status = this.safeString2(market, 'status', 'contractStatus');
        let contractSize = undefined;
        let fees = this.fees;
        let linear = undefined;
        let inverse = undefined;
        let symbol = base + '/' + quote;
        let strike = undefined;
        if (contract) {
            if (swap) {
                symbol = symbol + ':' + settle;
            }
            else if (future) {
                symbol = symbol + ':' + settle + '-' + this.yymmdd(expiry);
            }
            else if (option) {
                strike = this.numberToString(this.parseToNumeric(this.safeString(market, 'strikePrice')));
                symbol = symbol + ':' + settle + '-' + this.yymmdd(expiry) + '-' + strike + '-' + this.safeString(optionParts, 3);
            }
            contractSize = this.safeNumber2(market, 'contractSize', 'unit', this.parseNumber('1'));
            linear = settle === quote;
            inverse = settle === base;
            const feesType = linear ? 'linear' : 'inverse';
            fees = this.safeDict(this.fees, feesType, {});
        }
        let active = (status === 'TRADING');
        if (spot) {
            const permissions = this.safeList(market, 'permissions', []);
            for (let j = 0; j < permissions.length; j++) {
                if (permissions[j] === 'TRD_GRP_003') {
                    active = false;
                    break;
                }
            }
        }
        const isMarginTradingAllowed = this.safeBool(market, 'isMarginTradingAllowed', false);
        let marginModes = undefined;
        if (spot) {
            const hasCrossMargin = this.inArray(id, this.options['crossMarginPairsData']);
            const hasIsolatedMargin = this.inArray(id, this.options['isolatedMarginPairsData']);
            marginModes = {
                'cross': hasCrossMargin,
                'isolated': hasIsolatedMargin,
            };
        }
        else if (linear || inverse) {
            marginModes = {
                'cross': true,
                'isolated': true,
            };
        }
        let unifiedType = undefined;
        if (spot) {
            unifiedType = 'spot';
        }
        else if (swap) {
            unifiedType = 'swap';
        }
        else if (future) {
            unifiedType = 'future';
        }
        else if (option) {
            unifiedType = 'option';
            active = undefined;
        }
        let parsedStrike = undefined;
        if (strike !== undefined) {
            parsedStrike = this.parseToNumeric(strike);
        }
        const entry = {
            'id': id,
            'lowercaseId': lowercaseId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': unifiedType,
            'spot': spot,
            'margin': spot && isMarginTradingAllowed,
            'marginModes': marginModes,
            'swap': swap,
            'future': future,
            'option': option,
            'active': active,
            'contract': contract,
            'linear': linear,
            'inverse': inverse,
            'taker': fees['trading']['taker'],
            'maker': fees['trading']['maker'],
            'contractSize': contractSize,
            'expiry': expiry,
            'expiryDatetime': this.iso8601(expiry),
            'strike': parsedStrike,
            'optionType': this.safeStringLower(market, 'side'),
            'precision': {
                'amount': this.parseNumber(this.parsePrecision(this.safeString2(market, 'quantityPrecision', 'quantityScale'))),
                'price': this.parseNumber(this.parsePrecision(this.safeString2(market, 'pricePrecision', 'priceScale'))),
                'base': this.parseNumber(this.parsePrecision(this.safeString(market, 'baseAssetPrecision'))),
                'quote': this.parseNumber(this.parsePrecision(this.safeString(market, 'quotePrecision'))),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber(market, 'minQty'),
                    'max': this.safeNumber(market, 'maxQty'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'info': market,
            'created': this.safeInteger(market, 'onboardDate'), // present in inverse & linear apis
        };
        if ('PRICE_FILTER' in filtersByType) {
            const filter = this.safeDict(filtersByType, 'PRICE_FILTER', {});
            // PRICE_FILTER reports zero values for maxPrice
            // since they updated filter types in November 2018
            // https://github.com/ccxt/ccxt/issues/4286
            // therefore limits['price']['max'] doesn't have any meaningful value except undefined
            entry['limits']['price'] = {
                'min': this.safeNumber(filter, 'minPrice'),
                'max': this.safeNumber(filter, 'maxPrice'),
            };
            entry['precision']['price'] = this.safeNumber(filter, 'tickSize');
        }
        if ('LOT_SIZE' in filtersByType) {
            const filter = this.safeDict(filtersByType, 'LOT_SIZE', {});
            entry['precision']['amount'] = this.safeNumber(filter, 'stepSize');
            entry['limits']['amount'] = {
                'min': this.safeNumber(filter, 'minQty'),
                'max': this.safeNumber(filter, 'maxQty'),
            };
        }
        if ('MARKET_LOT_SIZE' in filtersByType) {
            const filter = this.safeDict(filtersByType, 'MARKET_LOT_SIZE', {});
            entry['limits']['market'] = {
                'min': this.safeNumber(filter, 'minQty'),
                'max': this.safeNumber(filter, 'maxQty'),
            };
        }
        if (('MIN_NOTIONAL' in filtersByType) || ('NOTIONAL' in filtersByType)) { // notional added in 12/04/23 to spot testnet
            const filter = this.safeDict2(filtersByType, 'MIN_NOTIONAL', 'NOTIONAL', {});
            entry['limits']['cost']['min'] = this.safeNumber2(filter, 'minNotional', 'notional');
            entry['limits']['cost']['max'] = this.safeNumber(filter, 'maxNotional');
        }
        return entry;
    }
    parseBalanceHelper(entry) {
        const account = this.account();
        account['used'] = this.safeString(entry, 'locked');
        account['free'] = this.safeString(entry, 'free');
        const interest = this.safeString(entry, 'interest');
        const debt = this.safeString(entry, 'borrowed');
        account['debt'] = Precise["default"].stringAdd(debt, interest);
        return account;
    }
    parseBalanceCustom(response, type = undefined, marginMode = undefined, isPortfolioMargin = false) {
        const result = {
            'info': response,
        };
        let timestamp = undefined;
        const isolated = marginMode === 'isolated';
        const cross = (type === 'margin') || (marginMode === 'cross');
        if (isPortfolioMargin) {
            for (let i = 0; i < response.length; i++) {
                const entry = response[i];
                const account = this.account();
                const currencyId = this.safeString(entry, 'asset');
                const code = this.safeCurrencyCode(currencyId);
                if (type === 'linear') {
                    account['free'] = this.safeString(entry, 'umWalletBalance');
                    account['used'] = this.safeString(entry, 'umUnrealizedPNL');
                }
                else if (type === 'inverse') {
                    account['free'] = this.safeString(entry, 'cmWalletBalance');
                    account['used'] = this.safeString(entry, 'cmUnrealizedPNL');
                }
                else if (cross) {
                    const borrowed = this.safeString(entry, 'crossMarginBorrowed');
                    const interest = this.safeString(entry, 'crossMarginInterest');
                    account['debt'] = Precise["default"].stringAdd(borrowed, interest);
                    account['free'] = this.safeString(entry, 'crossMarginFree');
                    account['used'] = this.safeString(entry, 'crossMarginLocked');
                    account['total'] = this.safeString(entry, 'crossMarginAsset');
                }
                else {
                    const usedLinear = this.safeString(entry, 'umUnrealizedPNL');
                    const usedInverse = this.safeString(entry, 'cmUnrealizedPNL');
                    const totalUsed = Precise["default"].stringAdd(usedLinear, usedInverse);
                    const totalWalletBalance = this.safeString(entry, 'totalWalletBalance');
                    account['total'] = Precise["default"].stringAdd(totalUsed, totalWalletBalance);
                }
                result[code] = account;
            }
        }
        else if (!isolated && ((type === 'spot') || cross)) {
            timestamp = this.safeInteger(response, 'updateTime');
            const balances = this.safeList2(response, 'balances', 'userAssets', []);
            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i];
                const currencyId = this.safeString(balance, 'asset');
                const code = this.safeCurrencyCode(currencyId);
                const account = this.account();
                account['free'] = this.safeString(balance, 'free');
                account['used'] = this.safeString(balance, 'locked');
                if (cross) {
                    const debt = this.safeString(balance, 'borrowed');
                    const interest = this.safeString(balance, 'interest');
                    account['debt'] = Precise["default"].stringAdd(debt, interest);
                }
                result[code] = account;
            }
        }
        else if (isolated) {
            const assets = this.safeList(response, 'assets');
            for (let i = 0; i < assets.length; i++) {
                const asset = assets[i];
                const marketId = this.safeString(asset, 'symbol');
                const symbol = this.safeSymbol(marketId, undefined, undefined, 'spot');
                const base = this.safeDict(asset, 'baseAsset', {});
                const quote = this.safeDict(asset, 'quoteAsset', {});
                const baseCode = this.safeCurrencyCode(this.safeString(base, 'asset'));
                const quoteCode = this.safeCurrencyCode(this.safeString(quote, 'asset'));
                const subResult = {};
                subResult[baseCode] = this.parseBalanceHelper(base);
                subResult[quoteCode] = this.parseBalanceHelper(quote);
                result[symbol] = this.safeBalance(subResult);
            }
        }
        else if (type === 'savings') {
            const positionAmountVos = this.safeList(response, 'positionAmountVos', []);
            for (let i = 0; i < positionAmountVos.length; i++) {
                const entry = positionAmountVos[i];
                const currencyId = this.safeString(entry, 'asset');
                const code = this.safeCurrencyCode(currencyId);
                const account = this.account();
                const usedAndTotal = this.safeString(entry, 'amount');
                account['total'] = usedAndTotal;
                account['used'] = usedAndTotal;
                result[code] = account;
            }
        }
        else if (type === 'funding') {
            for (let i = 0; i < response.length; i++) {
                const entry = response[i];
                const account = this.account();
                const currencyId = this.safeString(entry, 'asset');
                const code = this.safeCurrencyCode(currencyId);
                account['free'] = this.safeString(entry, 'free');
                const frozen = this.safeString(entry, 'freeze');
                const withdrawing = this.safeString(entry, 'withdrawing');
                const locked = this.safeString(entry, 'locked');
                account['used'] = Precise["default"].stringAdd(frozen, Precise["default"].stringAdd(locked, withdrawing));
                result[code] = account;
            }
        }
        else {
            let balances = response;
            if (!Array.isArray(response)) {
                balances = this.safeList(response, 'assets', []);
            }
            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i];
                const currencyId = this.safeString(balance, 'asset');
                const code = this.safeCurrencyCode(currencyId);
                const account = this.account();
                account['free'] = this.safeString(balance, 'availableBalance');
                account['used'] = this.safeString(balance, 'initialMargin');
                account['total'] = this.safeString2(balance, 'marginBalance', 'balance');
                result[code] = account;
            }
        }
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601(timestamp);
        return isolated ? result : this.safeBalance(result);
    }
    /**
     * @method
     * @name binance#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/account-endpoints#account-information-user_data  // spot
     * @see https://developers.binance.com/docs/margin_trading/account/Query-Cross-Margin-Account-Details                       // cross margin
     * @see https://developers.binance.com/docs/margin_trading/account/Query-Isolated-Margin-Account-Info                       // isolated margin
     * @see https://developers.binance.com/docs/wallet/asset/funding-wallet                                                     // funding
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Futures-Account-Balance-V2   // swap
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Futures-Account-Balance      // future
     * @see https://developers.binance.com/docs/derivatives/option/account/Option-Account-Information                           // option
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Account-Balance                            // portfolio margin
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'future', 'delivery', 'savings', 'funding', or 'spot' or 'papi'
     * @param {string} [params.marginMode] 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null
     * @param {string[]|undefined} [params.symbols] unified market symbols, only used in isolated margin mode
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch the balance for a portfolio margin account
     * @param {string} [params.subType] 'linear' or 'inverse'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const defaultType = this.safeString2(this.options, 'fetchBalance', 'defaultType', 'spot');
        let type = this.safeString(params, 'type', defaultType);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchBalance', undefined, params);
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchBalance', 'papi', 'portfolioMargin', false);
        let marginMode = undefined;
        let query = undefined;
        [marginMode, query] = this.handleMarginModeAndParams('fetchBalance', params);
        query = this.omit(query, 'type');
        let response = undefined;
        const request = {};
        if (isPortfolioMargin || (type === 'papi')) {
            if (this.isLinear(type, subType)) {
                type = 'linear';
            }
            else if (this.isInverse(type, subType)) {
                type = 'inverse';
            }
            isPortfolioMargin = true;
            response = await this.papiGetBalance(this.extend(request, query));
        }
        else if (this.isLinear(type, subType)) {
            type = 'linear';
            let useV2 = undefined;
            [useV2, params] = this.handleOptionAndParams(params, 'fetchBalance', 'useV2', false);
            params = this.extend(request, query);
            if (!useV2) {
                response = await this.fapiPrivateV3GetAccount(params);
            }
            else {
                response = await this.fapiPrivateV2GetAccount(params);
            }
        }
        else if (this.isInverse(type, subType)) {
            type = 'inverse';
            response = await this.dapiPrivateGetAccount(this.extend(request, query));
        }
        else if (marginMode === 'isolated') {
            const paramSymbols = this.safeList(params, 'symbols');
            query = this.omit(query, 'symbols');
            if (paramSymbols !== undefined) {
                let symbols = '';
                if (Array.isArray(paramSymbols)) {
                    symbols = this.marketId(paramSymbols[0]);
                    for (let i = 1; i < paramSymbols.length; i++) {
                        const symbol = paramSymbols[i];
                        const id = this.marketId(symbol);
                        symbols += ',' + id;
                    }
                }
                else {
                    symbols = paramSymbols;
                }
                request['symbols'] = symbols;
            }
            response = await this.sapiGetMarginIsolatedAccount(this.extend(request, query));
        }
        else if ((type === 'margin') || (marginMode === 'cross')) {
            response = await this.sapiGetMarginAccount(this.extend(request, query));
        }
        else if (type === 'savings') {
            response = await this.sapiGetLendingUnionAccount(this.extend(request, query));
        }
        else if (type === 'funding') {
            response = await this.sapiPostAssetGetFundingAsset(this.extend(request, query));
        }
        else {
            response = await this.privateGetAccount(this.extend(request, query));
        }
        //
        // spot
        //
        //     {
        //         "makerCommission": 10,
        //         "takerCommission": 10,
        //         "buyerCommission": 0,
        //         "sellerCommission": 0,
        //         "canTrade": true,
        //         "canWithdraw": true,
        //         "canDeposit": true,
        //         "updateTime": 1575357359602,
        //         "accountType": "MARGIN",
        //         "balances": [
        //             { asset: "BTC", free: "0.00219821", locked: "0.00000000"  },
        //         ]
        //     }
        //
        // margin (cross)
        //
        //     {
        //         "borrowEnabled":true,
        //         "marginLevel":"999.00000000",
        //         "totalAssetOfBtc":"0.00000000",
        //         "totalLiabilityOfBtc":"0.00000000",
        //         "totalNetAssetOfBtc":"0.00000000",
        //         "tradeEnabled":true,
        //         "transferEnabled":true,
        //         "userAssets":[
        //             {"asset":"MATIC","borrowed":"0.00000000","free":"0.00000000","interest":"0.00000000","locked":"0.00000000","netAsset":"0.00000000"},
        //             {"asset":"VET","borrowed":"0.00000000","free":"0.00000000","interest":"0.00000000","locked":"0.00000000","netAsset":"0.00000000"},
        //             {"asset":"USDT","borrowed":"0.00000000","free":"0.00000000","interest":"0.00000000","locked":"0.00000000","netAsset":"0.00000000"}
        //         ],
        //     }
        //
        // margin (isolated)
        //
        //    {
        //        "info": {
        //            "assets": [
        //                {
        //                    "baseAsset": {
        //                        "asset": "1INCH",
        //                        "borrowEnabled": true,
        //                        "borrowed": "0",
        //                        "free": "0",
        //                        "interest": "0",
        //                        "locked": "0",
        //                        "netAsset": "0",
        //                        "netAssetOfBtc": "0",
        //                        "repayEnabled": true,
        //                        "totalAsset": "0"
        //                    },
        //                    "quoteAsset": {
        //                        "asset": "USDT",
        //                        "borrowEnabled": true,
        //                        "borrowed": "0",
        //                        "free": "11",
        //                        "interest": "0",
        //                        "locked": "0",
        //                        "netAsset": "11",
        //                        "netAssetOfBtc": "0.00054615",
        //                        "repayEnabled": true,
        //                        "totalAsset": "11"
        //                    },
        //                    "symbol": "1INCHUSDT",
        //                    "isolatedCreated": true,
        //                    "marginLevel": "999",
        //                    "marginLevelStatus": "EXCESSIVE",
        //                    "marginRatio": "5",
        //                    "indexPrice": "0.59184331",
        //                    "liquidatePrice": "0",
        //                    "liquidateRate": "0",
        //                    "tradeEnabled": true,
        //                    "enabled": true
        //                },
        //            ]
        //        }
        //    }
        //
        // futures (fapi)
        //
        //     fapiPrivateV3GetAccount
        //
        //     {
        //         "feeTier":0,
        //         "canTrade":true,
        //         "canDeposit":true,
        //         "canWithdraw":true,
        //         "updateTime":0,
        //         "totalInitialMargin":"0.00000000",
        //         "totalMaintMargin":"0.00000000",
        //         "totalWalletBalance":"0.00000000",
        //         "totalUnrealizedProfit":"0.00000000",
        //         "totalMarginBalance":"0.00000000",
        //         "totalPositionInitialMargin":"0.00000000",
        //         "totalOpenOrderInitialMargin":"0.00000000",
        //         "totalCrossWalletBalance":"0.00000000",
        //         "totalCrossUnPnl":"0.00000000",
        //         "availableBalance":"0.00000000",
        //         "maxWithdrawAmount":"0.00000000",
        //         "assets":[
        //             {
        //                 "asset":"BNB",
        //                 "walletBalance":"0.01000000",
        //                 "unrealizedProfit":"0.00000000",
        //                 "marginBalance":"0.01000000",
        //                 "maintMargin":"0.00000000",
        //                 "initialMargin":"0.00000000",
        //                 "positionInitialMargin":"0.00000000",
        //                 "openOrderInitialMargin":"0.00000000",
        //                 "maxWithdrawAmount":"0.01000000",
        //                 "crossWalletBalance":"0.01000000",
        //                 "crossUnPnl":"0.00000000",
        //                 "availableBalance":"0.01000000"
        //             }
        //         ],
        //         "positions":[
        //             {
        //                 "symbol":"BTCUSDT",
        //                 "initialMargin":"0",
        //                 "maintMargin":"0",
        //                 "unrealizedProfit":"0.00000000",
        //                 "positionInitialMargin":"0",
        //                 "openOrderInitialMargin":"0",
        //                 "leverage":"21",
        //                 "isolated":false,
        //                 "entryPrice":"0.00000",
        //                 "maxNotional":"5000000",
        //                 "positionSide":"BOTH"
        //             },
        //         ]
        //     }
        //
        //     fapiPrivateV2GetBalance
        //
        //     [
        //         {
        //             "accountAlias":"FzFzXquXXqoC",
        //             "asset":"BNB",
        //             "balance":"0.01000000",
        //             "crossWalletBalance":"0.01000000",
        //             "crossUnPnl":"0.00000000",
        //             "availableBalance":"0.01000000",
        //             "maxWithdrawAmount":"0.01000000"
        //         }
        //     ]
        //
        // binance pay
        //
        //     [
        //       {
        //         "asset": "BUSD",
        //         "free": "1129.83",
        //         "locked": "0",
        //         "freeze": "0",
        //         "withdrawing": "0"
        //       }
        //     ]
        //
        // portfolio margin
        //
        //     [
        //         {
        //             "asset": "USDT",
        //             "totalWalletBalance": "66.9923261",
        //             "crossMarginAsset": "35.9697141",
        //             "crossMarginBorrowed": "0.0",
        //             "crossMarginFree": "35.9697141",
        //             "crossMarginInterest": "0.0",
        //             "crossMarginLocked": "0.0",
        //             "umWalletBalance": "31.022612",
        //             "umUnrealizedPNL": "0.0",
        //             "cmWalletBalance": "0.0",
        //             "cmUnrealizedPNL": "0.0",
        //             "updateTime": 0,
        //             "negativeBalance": "0.0"
        //         },
        //     ]
        //
        return this.parseBalanceCustom(response, type, marginMode, isPortfolioMargin);
    }
    /**
     * @method
     * @name binance#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#order-book     // spot
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Order-Book   // swap
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Order-Book   // future
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Order-Book                           // option
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 5000, see https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#order-book
        }
        let response = undefined;
        if (market['option']) {
            response = await this.eapiPublicGetDepth(this.extend(request, params));
        }
        else if (market['linear']) {
            response = await this.fapiPublicGetDepth(this.extend(request, params));
        }
        else if (market['inverse']) {
            response = await this.dapiPublicGetDepth(this.extend(request, params));
        }
        else {
            response = await this.publicGetDepth(this.extend(request, params));
        }
        //
        // future
        //
        //     {
        //         "lastUpdateId":333598053905,
        //         "E":1618631511986,
        //         "T":1618631511964,
        //         "bids":[
        //             ["2493.56","20.189"],
        //             ["2493.54","1.000"],
        //             ["2493.51","0.005"]
        //         ],
        //         "asks":[
        //             ["2493.57","0.877"],
        //             ["2493.62","0.063"],
        //             ["2493.71","12.054"],
        //         ]
        //     }
        //
        // options (eapi)
        //
        //     {
        //         "bids": [
        //             ["108.7","16.08"],
        //             ["106","21.29"],
        //             ["82.4","0.02"]
        //         ],
        //         "asks": [
        //             ["111.4","19.52"],
        //             ["119.9","17.6"],
        //             ["141.2","31"]
        //         ],
        //         "T": 1676771382078,
        //         "u": 1015939
        //     }
        //
        const timestamp = this.safeInteger(response, 'T');
        const orderbook = this.parseOrderBook(response, symbol, timestamp);
        orderbook['nonce'] = this.safeInteger2(response, 'lastUpdateId', 'u');
        return orderbook;
    }
    parseTicker(ticker, market = undefined) {
        // markPrices
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "markPrice": "11793.63104561", // mark price
        //         "indexPrice": "11781.80495970", // index price
        //         "estimatedSettlePrice": "11781.16138815", // Estimated Settle Price, only useful in the last hour before the settlement starts
        //         "lastFundingRate": "0.00038246",  // This is the lastest estimated funding rate
        //         "nextFundingTime": 1597392000000,
        //         "interestRate": "0.00010000",
        //         "time": 1597370495002
        //     }
        //
        // spot - ticker
        //
        //    {
        //        "symbol": "BTCUSDT",
        //        "priceChange": "-188.18000000",
        //        "priceChangePercent": "-0.159",
        //        "weightedAvgPrice": "118356.64734074",
        //        "lastPrice": "118449.03000000",
        //        "prevClosePrice": "118637.22000000",    // field absent in rolling ticker
        //        "lastQty": "0.00731000",                // field absent in rolling ticker
        //        "bidPrice": "118449.02000000",          // field absent in rolling ticker
        //        "bidQty": "7.15931000",                 // field absent in rolling ticker
        //        "askPrice": "118449.03000000",          // field absent in rolling ticker
        //        "askQty": "0.09592000",                 // field absent in rolling ticker
        //        "openPrice": "118637.21000000",
        //        "highPrice": "119273.36000000",
        //        "lowPrice": "117427.50000000",
        //        "volume": "14741.41491000",
        //        "quoteVolume": "1744744445.80640740",
        //        "openTime": "1753701474013",
        //        "closeTime": "1753787874013",
        //        "firstId": "5116031635",
        //        "lastId": "5117964946",
        //        "count": "1933312"
        //    }
        //
        // usdm tickers
        //
        //    {
        //        "symbol": "SUSDT",
        //        "priceChange": "-0.0229000",
        //        "priceChangePercent": "-6.777",
        //        "weightedAvgPrice": "0.3210035",
        //        "lastPrice": "0.3150000",
        //        "lastQty": "16",
        //        "openPrice": "0.3379000",
        //        "highPrice": "0.3411000",
        //        "lowPrice": "0.3071000",
        //        "volume": "120588225",
        //        "quoteVolume": "38709237.2289000",
        //        "openTime": "1753701720000",
        //        "closeTime": "1753788172414",
        //        "firstId": "72234973",
        //        "lastId": "72423677",
        //        "count": "188700"
        //    }
        //
        // coinm
        //
        //     {
        //         "baseVolume": "214549.95171161",
        //         "closeTime": "1621965286847",
        //         "count": "1283779",
        //         "firstId": "152560106",
        //         "highPrice": "39938.3",
        //         "lastId": "153843955",
        //         "lastPrice": "37993.4",
        //         "lastQty": "1",
        //         "lowPrice": "36457.2",
        //         "openPrice": "37783.4",
        //         "openTime": "1621878840000",
        //         "pair": "BTCUSD",
        //         "priceChange": "210.0",
        //         "priceChangePercent": "0.556",
        //         "symbol": "BTCUSD_PERP",
        //         "volume": "81990451",
        //         "weightedAvgPrice": "38215.08713747"
        //     }
        //
        // eapi: fetchTicker, fetchTickers
        //
        //     {
        //         "symbol": "ETH-230510-1825-C",
        //         "priceChange": "-5.1",
        //         "priceChangePercent": "-0.1854",
        //         "lastPrice": "22.4",
        //         "lastQty": "0",
        //         "open": "27.5",
        //         "high": "34.1",
        //         "low": "22.4",
        //         "volume": "6.83",
        //         "amount": "201.44",
        //         "bidPrice": "21.9",
        //         "askPrice": "22.4",
        //         "openTime": 1683614771898,
        //         "closeTime": 1683695017784,
        //         "firstTradeId": 12,
        //         "tradeCount": 22,
        //         "strikePrice": "1825",
        //         "exercisePrice": "1845.95341176"
        //     }
        //
        // spot bidsAsks
        //
        //     {
        //         "symbol":"ETHBTC",
        //         "bidPrice":"0.07466800",
        //         "bidQty":"5.31990000",
        //         "askPrice":"0.07466900",
        //         "askQty":"10.93540000"
        //     }
        //
        // usdm bidsAsks
        //
        //     {
        //         "symbol":"BTCUSDT",
        //         "bidPrice":"21321.90",
        //         "bidQty":"33.592",
        //         "askPrice":"21322.00",
        //         "askQty":"1.427",
        //         "time":"1673899207538"
        //     }
        //
        // coinm bidsAsks
        //
        //     {
        //         "symbol":"BTCUSD_PERP",
        //         "pair":"BTCUSD",
        //         "bidPrice":"21301.2",
        //         "bidQty":"188",
        //         "askPrice":"21301.3",
        //         "askQty":"10302",
        //         "time":"1673899278514"
        //     }
        //
        const timestamp = this.safeInteger2(ticker, 'closeTime', 'time');
        let marketType = undefined;
        if (('time' in ticker)) {
            marketType = 'contract';
        }
        if (marketType === undefined) {
            marketType = ('bidQty' in ticker) ? 'spot' : 'contract';
        }
        const marketId = this.safeString(ticker, 'symbol');
        const symbol = this.safeSymbol(marketId, market, undefined, marketType);
        const last = this.safeString(ticker, 'lastPrice');
        const wAvg = this.safeString(ticker, 'weightedAvgPrice');
        const isCoinm = ('baseVolume' in ticker);
        let baseVolume = undefined;
        let quoteVolume = undefined;
        if (isCoinm) {
            baseVolume = this.safeString(ticker, 'baseVolume');
            // 'volume' field in inverse markets is not quoteVolume, but traded amount (per contracts)
            quoteVolume = Precise["default"].stringMul(baseVolume, wAvg);
        }
        else {
            baseVolume = this.safeString(ticker, 'volume');
            quoteVolume = this.safeString2(ticker, 'quoteVolume', 'amount');
        }
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString2(ticker, 'highPrice', 'high'),
            'low': this.safeString2(ticker, 'lowPrice', 'low'),
            'bid': this.safeString(ticker, 'bidPrice'),
            'bidVolume': this.safeString(ticker, 'bidQty'),
            'ask': this.safeString(ticker, 'askPrice'),
            'askVolume': this.safeString(ticker, 'askQty'),
            'vwap': wAvg,
            'open': this.safeString2(ticker, 'openPrice', 'open'),
            'close': last,
            'last': last,
            'previousClose': this.safeString(ticker, 'prevClosePrice'),
            'change': this.safeString(ticker, 'priceChange'),
            'percentage': this.safeString(ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'markPrice': this.safeString(ticker, 'markPrice'),
            'indexPrice': this.safeString(ticker, 'indexPrice'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name binance#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://developers.binance.com/docs/wallet/others/system-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus(params = {}) {
        const response = await this.sapiGetSystemStatus(params);
        //
        //     {
        //         "status": 0,              // 0: normal，1：system maintenance
        //         "msg": "normal"           // "normal", "system_maintenance"
        //     }
        //
        const statusRaw = this.safeString(response, 'status');
        return {
            'status': this.safeString({ '0': 'ok', '1': 'maintenance' }, statusRaw, statusRaw),
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }
    /**
     * @method
     * @name binance#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#24hr-ticker-price-change-statistics     // spot
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#rolling-window-price-change-statistics  // spot
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/24hr-Ticker-Price-Change-Statistics   // swap
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/24hr-Ticker-Price-Change-Statistics   // future
     * @see https://developers.binance.com/docs/derivatives/option/market-data/24hr-Ticker-Price-Change-Statistics                           // option
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.rolling] (spot only) default false, if true, uses the rolling 24 hour ticker endpoint /api/v3/ticker
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['option']) {
            response = await this.eapiPublicGetTicker(this.extend(request, params));
        }
        else if (market['linear']) {
            response = await this.fapiPublicGetTicker24hr(this.extend(request, params));
        }
        else if (market['inverse']) {
            response = await this.dapiPublicGetTicker24hr(this.extend(request, params));
        }
        else {
            const rolling = this.safeBool(params, 'rolling', false);
            params = this.omit(params, 'rolling');
            if (rolling) {
                response = await this.publicGetTicker(this.extend(request, params));
            }
            else {
                response = await this.publicGetTicker24hr(this.extend(request, params));
            }
        }
        if (Array.isArray(response)) {
            const firstTicker = this.safeDict(response, 0, {});
            return this.parseTicker(firstTicker, market);
        }
        return this.parseTicker(response, market);
    }
    /**
     * @method
     * @name binance#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#symbol-order-book-ticker   // spot
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Symbol-Order-Book-Ticker // swap
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Symbol-Order-Book-Ticker // future
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, true, true, true);
        const market = this.getMarketFromSymbols(symbols);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchBidsAsks', market, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchBidsAsks', market, params);
        let response = undefined;
        if (this.isLinear(type, subType)) {
            response = await this.fapiPublicGetTickerBookTicker(params);
        }
        else if (this.isInverse(type, subType)) {
            response = await this.dapiPublicGetTickerBookTicker(params);
        }
        else if (type === 'spot') {
            const request = {};
            if (symbols !== undefined) {
                request['symbols'] = this.json(this.marketIds(symbols));
            }
            response = await this.publicGetTickerBookTicker(this.extend(request, params));
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchBidsAsks() does not support ' + type + ' markets yet');
        }
        return this.parseTickers(response, symbols);
    }
    /**
     * @method
     * @name binance#fetchLastPrices
     * @description fetches the last price for multiple markets
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#symbol-price-ticker    // spot
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Symbol-Price-Ticker  // swap
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Symbol-Price-Ticker  // future
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the last prices
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a dictionary of lastprices structures
     */
    async fetchLastPrices(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, true, true, true);
        const market = this.getMarketFromSymbols(symbols);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchLastPrices', market, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchLastPrices', market, params);
        let response = undefined;
        if (this.isLinear(type, subType)) {
            response = await this.fapiPublicV2GetTickerPrice(params);
            //
            //     [
            //         {
            //             "symbol": "LTCBTC",
            //             "price": "4.00000200"
            //             "time": 1589437530011
            //         },
            //         ...
            //     ]
            //
        }
        else if (this.isInverse(type, subType)) {
            response = await this.dapiPublicGetTickerPrice(params);
            //
            //     [
            //         {
            //             "symbol": "BTCUSD_200626",
            //             "ps": "9647.8",
            //             "price": "9647.8",
            //             "time": 1591257246176
            //         }
            //     ]
            //
        }
        else if (type === 'spot') {
            response = await this.publicGetTickerPrice(params);
            //
            //     [
            //         {
            //             "symbol": "LTCBTC",
            //             "price": "4.00000200"
            //         },
            //         ...
            //     ]
            //
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchLastPrices() does not support ' + type + ' markets yet');
        }
        return this.parseLastPrices(response, symbols);
    }
    parseLastPrice(entry, market = undefined) {
        //
        // spot
        //
        //     {
        //         "symbol": "LTCBTC",
        //         "price": "4.00000200"
        //     }
        //
        // usdm (swap/future)
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "price": "6000.01",
        //         "time": 1589437530011   // Transaction time
        //     }
        //
        //
        // coinm (swap/future)
        //
        //     {
        //         "symbol": "BTCUSD_200626", // symbol ("BTCUSD_200626", "BTCUSD_PERP", etc..)
        //         "ps": "BTCUSD", // pair
        //         "price": "9647.8",
        //         "time": 1591257246176
        //     }
        //
        const timestamp = this.safeInteger(entry, 'time');
        const type = (timestamp === undefined) ? 'spot' : 'swap';
        const marketId = this.safeString(entry, 'symbol');
        market = this.safeMarket(marketId, market, undefined, type);
        return {
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'price': this.safeNumberOmitZero(entry, 'price'),
            'side': undefined,
            'info': entry,
        };
    }
    /**
     * @method
     * @name binance#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#24hr-ticker-price-change-statistics    // spot
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/24hr-Ticker-Price-Change-Statistics  // swap
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/24hr-Ticker-Price-Change-Statistics  // future
     * @see https://developers.binance.com/docs/derivatives/option/market-data/24hr-Ticker-Price-Change-Statistics                          // option
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @param {string} [params.type] 'spot', 'option', use params["subType"] for swap and future markets
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, true, true, true);
        const market = this.getMarketFromSymbols(symbols);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchTickers', market, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchTickers', market, params);
        let response = undefined;
        if (this.isLinear(type, subType)) {
            response = await this.fapiPublicGetTicker24hr(params);
        }
        else if (this.isInverse(type, subType)) {
            response = await this.dapiPublicGetTicker24hr(params);
        }
        else if (type === 'spot') {
            const rolling = this.safeBool(params, 'rolling', false);
            params = this.omit(params, 'rolling');
            if (rolling) {
                symbols = this.marketSymbols(symbols);
                const request = {
                    'symbols': this.json(this.marketIds(symbols)),
                };
                response = await this.publicGetTicker(this.extend(request, params));
                // parseTicker is not able to handle marketType for spot-rolling ticker fields, so we need custom parsing
                return this.parseTickersForRolling(response, symbols);
            }
            else {
                const request = {};
                if (symbols !== undefined) {
                    request['symbols'] = this.json(this.marketIds(symbols));
                }
                response = await this.publicGetTicker24hr(this.extend(request, params));
            }
        }
        else if (type === 'option') {
            response = await this.eapiPublicGetTicker(params);
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchTickers() does not support ' + type + ' markets yet');
        }
        return this.parseTickers(response, symbols);
    }
    parseTickersForRolling(response, symbols) {
        const results = [];
        for (let i = 0; i < response.length; i++) {
            const marketId = this.safeString(response[i], 'symbol');
            const tickerMarket = this.safeMarket(marketId, undefined, undefined, 'spot');
            const parsedTicker = this.parseTicker(response[i]);
            parsedTicker['symbol'] = tickerMarket['symbol'];
            results.push(parsedTicker);
        }
        return this.filterByArray(results, 'symbol', symbols);
    }
    /**
     * @method
     * @name binance#fetchMarkPrice
     * @description fetches mark price for the market
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Index-Price-and-Mark-Price
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchMarkPrice(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchMarkPrice', market, params, 'swap');
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchMarkPrice', market, params, 'linear');
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (this.isLinear(type, subType)) {
            response = await this.fapiPublicGetPremiumIndex(this.extend(request, params));
        }
        else if (this.isInverse(type, subType)) {
            response = await this.dapiPublicGetPremiumIndex(this.extend(request, params));
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchMarkPrice() does not support ' + type + ' markets yet');
        }
        if (Array.isArray(response)) {
            return this.parseTicker(this.safeDict(response, 0, {}), market);
        }
        return this.parseTicker(response, market);
    }
    /**
     * @method
     * @name binance#fetchMarkPrices
     * @description fetches mark prices for multiple markets
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Index-Price-and-Mark-Price
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchMarkPrices(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, true, true, true);
        const market = this.getMarketFromSymbols(symbols);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchMarkPrices', market, params, 'swap');
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchMarkPrices', market, params, 'linear');
        let response = undefined;
        if (this.isLinear(type, subType)) {
            response = await this.fapiPublicGetPremiumIndex(params);
        }
        else if (this.isInverse(type, subType)) {
            response = await this.dapiPublicGetPremiumIndex(params);
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchMarkPrices() does not support ' + type + ' markets yet');
        }
        return this.parseTickers(response, symbols);
    }
    parseOHLCV(ohlcv, market = undefined) {
        // when api method = publicGetKlines || fapiPublicGetKlines || dapiPublicGetKlines
        //     [
        //         1591478520000, // open time
        //         "0.02501300",  // open
        //         "0.02501800",  // high
        //         "0.02500000",  // low
        //         "0.02500000",  // close
        //         "22.19000000", // volume
        //         1591478579999, // close time
        //         "0.55490906",  // quote asset volume, base asset volume for dapi
        //         40,            // number of trades
        //         "10.92900000", // taker buy base asset volume
        //         "0.27336462",  // taker buy quote asset volume
        //         "0"            // ignore
        //     ]
        //
        //  when api method = fapiPublicGetMarkPriceKlines || fapiPublicGetIndexPriceKlines
        //     [
        //         [
        //         1591256460000,          // Open time
        //         "9653.29201333",        // Open
        //         "9654.56401333",        // High
        //         "9653.07367333",        // Low
        //         "9653.07367333",        // Close (or latest price)
        //         "0",                    // Ignore
        //         1591256519999,          // Close time
        //         "0",                    // Ignore
        //         60,                     // Number of bisic data
        //         "0",                    // Ignore
        //         "0",                    // Ignore
        //         "0"                     // Ignore
        //         ]
        //     ]
        //
        // options
        //
        //     {
        //         "open": "32.2",
        //         "high": "32.2",
        //         "low": "32.2",
        //         "close": "32.2",
        //         "volume": "0",
        //         "interval": "5m",
        //         "tradeCount": 0,
        //         "takerVolume": "0",
        //         "takerAmount": "0",
        //         "amount": "0",
        //         "openTime": 1677096900000,
        //         "closeTime": 1677097200000
        //     }
        //
        const inverse = this.safeBool(market, 'inverse');
        const volumeIndex = inverse ? 7 : 5;
        return [
            this.safeInteger2(ohlcv, 0, 'openTime'),
            this.safeNumber2(ohlcv, 1, 'open'),
            this.safeNumber2(ohlcv, 2, 'high'),
            this.safeNumber2(ohlcv, 3, 'low'),
            this.safeNumber2(ohlcv, 4, 'close'),
            this.safeNumber2(ohlcv, volumeIndex, 'volume'),
        ];
    }
    /**
     * @method
     * @name binance#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#klinecandlestick-data
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Kline-Candlestick-Data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Kline-Candlestick-Data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Index-Price-Kline-Candlestick-Data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price-Kline-Candlestick-Data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Premium-Index-Kline-Data
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Kline-Candlestick-Data
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Index-Price-Kline-Candlestick-Data
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Mark-Price-Kline-Candlestick-Data
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Premium-Index-Kline-Data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.price] "mark" or "index" for mark price and index price candles
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOHLCV', symbol, since, limit, timeframe, params, 1000);
        }
        const market = this.market(symbol);
        // binance docs say that the default limit 500, max 1500 for futures, max 1000 for spot markets
        // the reality is that the time range wider than 500 candles won't work right
        const defaultLimit = 500;
        const maxLimit = 1500;
        const price = this.safeString(params, 'price');
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, ['price', 'until']);
        if (since !== undefined && until !== undefined && limit === undefined) {
            limit = maxLimit;
        }
        limit = (limit === undefined) ? defaultLimit : Math.min(limit, maxLimit);
        const request = {
            'interval': this.safeString(this.timeframes, timeframe, timeframe),
            'limit': limit,
        };
        const marketId = market['id'];
        if (price === 'index') {
            const parts = marketId.split('_');
            const pair = this.safeString(parts, 0);
            request['pair'] = pair; // Index price takes this argument instead of symbol
        }
        else {
            request['symbol'] = marketId;
        }
        // const duration = this.parseTimeframe (timeframe);
        if (since !== undefined) {
            request['startTime'] = since;
            //
            // It didn't work before without the endTime
            // https://github.com/ccxt/ccxt/issues/8454
            //
            if (market['inverse']) {
                if (since > 0) {
                    const duration = this.parseTimeframe(timeframe);
                    const endTime = this.sum(since, limit * duration * 1000 - 1);
                    const now = this.milliseconds();
                    request['endTime'] = Math.min(now, endTime);
                }
            }
        }
        if (until !== undefined) {
            request['endTime'] = until;
        }
        let response = undefined;
        if (market['option']) {
            response = await this.eapiPublicGetKlines(this.extend(request, params));
        }
        else if (price === 'mark') {
            if (market['inverse']) {
                response = await this.dapiPublicGetMarkPriceKlines(this.extend(request, params));
            }
            else {
                response = await this.fapiPublicGetMarkPriceKlines(this.extend(request, params));
            }
        }
        else if (price === 'index') {
            if (market['inverse']) {
                response = await this.dapiPublicGetIndexPriceKlines(this.extend(request, params));
            }
            else {
                response = await this.fapiPublicGetIndexPriceKlines(this.extend(request, params));
            }
        }
        else if (price === 'premiumIndex') {
            if (market['inverse']) {
                response = await this.dapiPublicGetPremiumIndexKlines(this.extend(request, params));
            }
            else {
                response = await this.fapiPublicGetPremiumIndexKlines(this.extend(request, params));
            }
        }
        else if (market['linear']) {
            response = await this.fapiPublicGetKlines(this.extend(request, params));
        }
        else if (market['inverse']) {
            response = await this.dapiPublicGetKlines(this.extend(request, params));
        }
        else {
            response = await this.publicGetKlines(this.extend(request, params));
        }
        //
        //     [
        //         [1591478520000,"0.02501300","0.02501800","0.02500000","0.02500000","22.19000000",1591478579999,"0.55490906",40,"10.92900000","0.27336462","0"],
        //         [1591478580000,"0.02499600","0.02500900","0.02499400","0.02500300","21.34700000",1591478639999,"0.53370468",24,"7.53800000","0.18850725","0"],
        //         [1591478640000,"0.02500800","0.02501100","0.02500300","0.02500800","154.14200000",1591478699999,"3.85405839",97,"5.32300000","0.13312641","0"],
        //     ]
        //
        // options (eapi)
        //
        //     [
        //         {
        //             "open": "32.2",
        //             "high": "32.2",
        //             "low": "32.2",
        //             "close": "32.2",
        //             "volume": "0",
        //             "interval": "5m",
        //             "tradeCount": 0,
        //             "takerVolume": "0",
        //             "takerAmount": "0",
        //             "amount": "0",
        //             "openTime": 1677096900000,
        //             "closeTime": 1677097200000
        //         }
        //     ]
        //
        const candles = this.parseOHLCVs(response, market, timeframe, since, limit);
        return candles;
    }
    parseTrade(trade, market = undefined) {
        if ('isDustTrade' in trade) {
            return this.parseDustTrade(trade, market);
        }
        //
        // aggregate trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#compressedaggregate-trades-list
        //
        //     {
        //         "a": 26129,         // Aggregate tradeId
        //         "p": "0.01633102",  // Price
        //         "q": "4.70443515",  // Quantity
        //         "f": 27781,         // First tradeId
        //         "l": 27781,         // Last tradeId
        //         "T": 1498793709153, // Timestamp
        //         "m": true,          // Was the buyer the maker?
        //         "M": true           // Was the trade the best price match?
        //     }
        //
        // REST: aggregate trades for swap & future (both linear and inverse)
        //
        //     {
        //         "a": "269772814",
        //         "p": "25864.1",
        //         "q": "3",
        //         "f": "662149354",
        //         "l": "662149355",
        //         "T": "1694209776022",
        //         "m": false,
        //     }
        //
        // recent public trades and old public trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#recent-trades-list
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#old-trade-lookup-market_data
        //
        //     {
        //         "id": 28457,
        //         "price": "4.00000100",
        //         "qty": "12.00000000",
        //         "time": 1499865549590,
        //         "isBuyerMaker": true,
        //         "isBestMatch": true
        //     }
        //
        // private trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#account-trade-list-user_data
        //
        //     {
        //         "symbol": "BNBBTC",
        //         "id": 28457,
        //         "orderId": 100234,
        //         "price": "4.00000100",
        //         "qty": "12.00000000",
        //         "commission": "10.10000000",
        //         "commissionAsset": "BNB",
        //         "time": 1499865549590,
        //         "isBuyer": true,
        //         "isMaker": false,
        //         "isBestMatch": true
        //     }
        //
        // futures trades
        //
        //     {
        //       "accountId": 20,
        //       "buyer": False,
        //       "commission": "-0.07819010",
        //       "commissionAsset": "USDT",
        //       "counterPartyId": 653,
        //       "id": 698759,
        //       "maker": False,
        //       "orderId": 25851813,
        //       "price": "7819.01",
        //       "qty": "0.002",
        //       "quoteQty": "0.01563",
        //       "realizedPnl": "-0.91539999",
        //       "side": "SELL",
        //       "symbol": "BTCUSDT",
        //       "time": 1569514978020
        //     }
        //     {
        //       "symbol": "BTCUSDT",
        //       "id": 477128891,
        //       "orderId": 13809777875,
        //       "side": "SELL",
        //       "price": "38479.55",
        //       "qty": "0.001",
        //       "realizedPnl": "-0.00009534",
        //       "marginAsset": "USDT",
        //       "quoteQty": "38.47955",
        //       "commission": "-0.00076959",
        //       "commissionAsset": "USDT",
        //       "time": 1612733566708,
        //       "positionSide": "BOTH",
        //       "maker": true,
        //       "buyer": false
        //     }
        //
        // { respType: FULL }
        //
        //     {
        //       "price": "4000.00000000",
        //       "qty": "1.00000000",
        //       "commission": "4.00000000",
        //       "commissionAsset": "USDT",
        //       "tradeId": "1234",
        //     }
        //
        // options: fetchMyTrades
        //
        //     {
        //         "id": 1125899906844226012,
        //         "tradeId": 73,
        //         "orderId": 4638761100843040768,
        //         "symbol": "ETH-230211-1500-C",
        //         "price": "18.70000000",
        //         "quantity": "-0.57000000",
        //         "fee": "0.17305890",
        //         "realizedProfit": "-3.53400000",
        //         "side": "SELL",
        //         "type": "LIMIT",
        //         "volatility": "0.30000000",
        //         "liquidity": "MAKER",
        //         "time": 1676085216845,
        //         "priceScale": 1,
        //         "quantityScale": 2,
        //         "optionSide": "CALL",
        //         "quoteAsset": "USDT"
        //     }
        //
        // options: fetchTrades
        //
        //     {
        //         "id": 1,
        //         "symbol": "ETH-230216-1500-C",
        //         "price": "35.5",
        //         "qty": "0.03",
        //         "quoteQty": "1.065",
        //         "side": 1,
        //         "time": 1676366446072
        //     }
        //
        // fetchMyTrades: linear portfolio margin
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "id": 4575108247,
        //         "orderId": 261942655610,
        //         "side": "SELL",
        //         "price": "47263.40",
        //         "qty": "0.010",
        //         "realizedPnl": "27.38400000",
        //         "marginAsset": "USDT",
        //         "quoteQty": "472.63",
        //         "commission": "0.18905360",
        //         "commissionAsset": "USDT",
        //         "time": 1707530039409,
        //         "buyer": false,
        //         "maker": false,
        //         "positionSide": "LONG"
        //     }
        //
        // fetchMyTrades: inverse portfolio margin
        //
        //     {
        //         "symbol": "ETHUSD_PERP",
        //         "id": 701907838,
        //         "orderId": 71548909034,
        //         "pair": "ETHUSD",
        //         "side": "SELL",
        //         "price": "2498.15",
        //         "qty": "1",
        //         "realizedPnl": "0.00012517",
        //         "marginAsset": "ETH",
        //         "baseQty": "0.00400296",
        //         "commission": "0.00000160",
        //         "commissionAsset": "ETH",
        //         "time": 1707530317519,
        //         "positionSide": "LONG",
        //         "buyer": false,
        //         "maker": false
        //     }
        //
        // fetchMyTrades: spot margin portfolio margin
        //
        //     {
        //         "symbol": "ADAUSDT",
        //         "id": 470227543,
        //         "orderId": 4421170947,
        //         "price": "0.53880000",
        //         "qty": "10.00000000",
        //         "quoteQty": "5.38800000",
        //         "commission": "0.00538800",
        //         "commissionAsset": "USDT",
        //         "time": 1707545780522,
        //         "isBuyer": false,
        //         "isMaker": false,
        //         "isBestMatch": true
        //     }
        //
        const timestamp = this.safeInteger2(trade, 'T', 'time');
        let amount = this.safeString2(trade, 'q', 'qty');
        amount = this.safeString(trade, 'quantity', amount);
        const marketId = this.safeString(trade, 'symbol');
        const isSpotTrade = ('isIsolated' in trade) || ('M' in trade) || ('orderListId' in trade) || ('isMaker' in trade);
        const marketType = isSpotTrade ? 'spot' : 'contract';
        market = this.safeMarket(marketId, market, undefined, marketType);
        const symbol = market['symbol'];
        let side = undefined;
        const buyerMaker = this.safeBool2(trade, 'm', 'isBuyerMaker');
        let takerOrMaker = undefined;
        if (buyerMaker !== undefined) {
            side = buyerMaker ? 'sell' : 'buy'; // this is reversed intentionally
        }
        else if ('side' in trade) {
            side = this.safeStringLower(trade, 'side');
        }
        else {
            if ('isBuyer' in trade) {
                side = trade['isBuyer'] ? 'buy' : 'sell'; // this is a true side
            }
        }
        let fee = undefined;
        if ('commission' in trade) {
            fee = {
                'cost': this.safeString(trade, 'commission'),
                'currency': this.safeCurrencyCode(this.safeString(trade, 'commissionAsset')),
            };
        }
        if ('isMaker' in trade) {
            takerOrMaker = trade['isMaker'] ? 'maker' : 'taker';
        }
        if ('maker' in trade) {
            takerOrMaker = trade['maker'] ? 'maker' : 'taker';
        }
        if (('optionSide' in trade) || market['option']) {
            const settle = this.safeCurrencyCode(this.safeString(trade, 'quoteAsset', 'USDT'));
            takerOrMaker = this.safeStringLower(trade, 'liquidity');
            if ('fee' in trade) {
                fee = {
                    'cost': this.safeString(trade, 'fee'),
                    'currency': settle,
                };
            }
            if ((side !== 'buy') && (side !== 'sell')) {
                side = (side === '1') ? 'buy' : 'sell';
            }
            if ('optionSide' in trade) {
                if (side !== 'buy') {
                    amount = Precise["default"].stringMul('-1', amount);
                }
            }
        }
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'id': this.safeStringN(trade, ['t', 'a', 'tradeId', 'id']),
            'order': this.safeString(trade, 'orderId'),
            'type': this.safeStringLower(trade, 'type'),
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeString2(trade, 'p', 'price'),
            'amount': amount,
            'cost': this.safeString2(trade, 'quoteQty', 'baseQty'),
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name binance#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * Default fetchTradesMethod
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#compressedaggregate-trades-list    // publicGetAggTrades (spot)
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Compressed-Aggregate-Trades-List // fapiPublicGetAggTrades (swap)
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Compressed-Aggregate-Trades-List // dapiPublicGetAggTrades (future)
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Recent-Trades-List                                       // eapiPublicGetTrades (option)
     * Other fetchTradesMethod
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#recent-trades-list                 // publicGetTrades (spot)
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Recent-Trades-List               // fapiPublicGetTrades (swap)
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Recent-Trades-List               // dapiPublicGetTrades (future)
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#old-trade-lookup                   // publicGetHistoricalTrades (spot)
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Old-Trades-Lookup                // fapiPublicGetHistoricalTrades (swap)
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Old-Trades-Lookup                // dapiPublicGetHistoricalTrades (future)
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Old-Trades-Lookup                                        // eapiPublicGetHistoricalTrades (option)
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] only used when fetchTradesMethod is 'publicGetAggTrades', 'fapiPublicGetAggTrades', or 'dapiPublicGetAggTrades'
     * @param {int} [limit] default 500, max 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] only used when fetchTradesMethod is 'publicGetAggTrades', 'fapiPublicGetAggTrades', or 'dapiPublicGetAggTrades'
     * @param {int} [params.fetchTradesMethod] 'publicGetAggTrades' (spot default), 'fapiPublicGetAggTrades' (swap default), 'dapiPublicGetAggTrades' (future default), 'eapiPublicGetTrades' (option default), 'publicGetTrades', 'fapiPublicGetTrades', 'dapiPublicGetTrades', 'publicGetHistoricalTrades', 'fapiPublicGetHistoricalTrades', 'dapiPublicGetHistoricalTrades', 'eapiPublicGetHistoricalTrades'
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.fromId] trade id to fetch from, default gets most recent trades, not used when fetchTradesMethod is 'publicGetTrades', 'fapiPublicGetTrades', 'dapiPublicGetTrades', or 'eapiPublicGetTrades'
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchTrades', symbol, since, limit, params);
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            // 'fromId': 123,    // ID to get aggregate trades from INCLUSIVE.
            // 'startTime': 456, // Timestamp in ms to get aggregate trades from INCLUSIVE.
            // 'endTime': 789,   // Timestamp in ms to get aggregate trades until INCLUSIVE.
            // 'limit': 500,     // default = 500, maximum = 1000
        };
        if (!market['option']) {
            if (since !== undefined) {
                request['startTime'] = since;
                // https://github.com/ccxt/ccxt/issues/6400
                // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#compressedaggregate-trades-list
                request['endTime'] = this.sum(since, 3600000);
            }
            const until = this.safeInteger(params, 'until');
            if (until !== undefined) {
                request['endTime'] = until;
            }
        }
        let method = this.safeString(this.options, 'fetchTradesMethod');
        method = this.safeString2(params, 'fetchTradesMethod', 'method', method);
        if (limit !== undefined) {
            const isFutureOrSwap = (market['swap'] || market['future']);
            const isHistoricalEndpoint = (method !== undefined) && (method.indexOf('GetHistoricalTrades') >= 0);
            const maxLimitForContractHistorical = isHistoricalEndpoint ? 500 : 1000;
            request['limit'] = isFutureOrSwap ? Math.min(limit, maxLimitForContractHistorical) : limit; // default = 500, maximum = 1000
        }
        params = this.omit(params, ['until', 'fetchTradesMethod']);
        let response = undefined;
        if (market['option'] || method === 'eapiPublicGetTrades') {
            response = await this.eapiPublicGetTrades(this.extend(request, params));
        }
        else if (market['linear'] || method === 'fapiPublicGetAggTrades') {
            response = await this.fapiPublicGetAggTrades(this.extend(request, params));
        }
        else if (market['inverse'] || method === 'dapiPublicGetAggTrades') {
            response = await this.dapiPublicGetAggTrades(this.extend(request, params));
        }
        else {
            response = await this.publicGetAggTrades(this.extend(request, params));
        }
        //
        // Caveats:
        // - default limit (500) applies only if no other parameters set, trades up
        //   to the maximum limit may be returned to satisfy other parameters
        // - if both limit and time window is set and time window contains more
        //   trades than the limit then the last trades from the window are returned
        // - "tradeId" accepted and returned by this method is "aggregate" trade id
        //   which is different from actual trade id
        // - setting both fromId and time window results in error
        //
        // aggregate trades
        //
        //     [
        //         {
        //             "a": 26129,         // Aggregate tradeId
        //             "p": "0.01633102",  // Price
        //             "q": "4.70443515",  // Quantity
        //             "f": 27781,         // First tradeId
        //             "l": 27781,         // Last tradeId
        //             "T": 1498793709153, // Timestamp
        //             "m": true,          // Was the buyer the maker?
        //             "M": true           // Was the trade the best price match?
        //         }
        //     ]
        //
        // inverse (swap & future)
        //
        //     [
        //      {
        //         "a": "269772814",
        //         "p": "25864.1",
        //         "q": "3",
        //         "f": "662149354",
        //         "l": "662149355",
        //         "T": "1694209776022",
        //         "m": false,
        //      },
        //     ]
        //
        // recent public trades and historical public trades
        //
        //     [
        //         {
        //             "id": 28457,
        //             "price": "4.00000100",
        //             "qty": "12.00000000",
        //             "time": 1499865549590,
        //             "isBuyerMaker": true,
        //             "isBestMatch": true
        //         }
        //     ]
        //
        // options (eapi)
        //
        //     [
        //         {
        //             "id": 1,
        //             "symbol": "ETH-230216-1500-C",
        //             "price": "35.5",
        //             "qty": "0.03",
        //             "quoteQty": "1.065",
        //             "side": 1,
        //             "time": 1676366446072
        //         },
        //     ]
        //
        return this.parseTrades(response, market, since, limit);
    }
    /**
     * @method
     * @name binance#editSpotOrder
     * @ignore
     * @description edit a trade order
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#cancel-an-existing-order-and-send-a-new-order-trade
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'STOP_LOSS' or 'STOP_LOSS_LIMIT' or 'TAKE_PROFIT' or 'TAKE_PROFIT_LIMIT' or 'STOP'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated', for spot margin trading
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editSpotOrder(id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' editSpotOrder() does not support ' + market['type'] + ' orders');
        }
        const payload = this.editSpotOrderRequest(id, symbol, type, side, amount, price, params);
        const response = await this.privatePostOrderCancelReplace(payload);
        //
        // spot
        //
        //     {
        //         "cancelResult": "SUCCESS",
        //         "newOrderResult": "SUCCESS",
        //         "cancelResponse": {
        //             "symbol": "BTCUSDT",
        //             "origClientOrderId": "web_3f6286480b194b079870ac75fb6978b7",
        //             "orderId": 16383156620,
        //             "orderListId": -1,
        //             "clientOrderId": "Azt6foVTTgHPNhqBf41TTt",
        //             "price": "14000.00000000",
        //             "origQty": "0.00110000",
        //             "executedQty": "0.00000000",
        //             "cummulativeQuoteQty": "0.00000000",
        //             "status": "CANCELED",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY"
        //         },
        //         "newOrderResponse": {
        //             "symbol": "BTCUSDT",
        //             "orderId": 16383176297,
        //             "orderListId": -1,
        //             "clientOrderId": "x-TKT5PX2F22ecb58eb9074fb1be018c",
        //             "transactTime": 1670891847932,
        //             "price": "13500.00000000",
        //             "origQty": "0.00085000",
        //             "executedQty": "0.00000000",
        //             "cummulativeQuoteQty": "0.00000000",
        //             "status": "NEW",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY",
        //             "fills": []
        //         }
        //     }
        //
        const data = this.safeDict(response, 'newOrderResponse');
        return this.parseOrder(data, market);
    }
    editSpotOrderRequest(id, symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @ignore
         * @name binance#editSpotOrderRequest
         * @description helper function to build request for editSpotOrder
         * @param {string} id order id to be edited
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit' or 'STOP_LOSS' or 'STOP_LOSS_LIMIT' or 'TAKE_PROFIT' or 'TAKE_PROFIT_LIMIT' or 'STOP'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated', for spot margin trading
         * @returns {object} request to be sent to the exchange
         */
        const market = this.market(symbol);
        const clientOrderId = this.safeStringN(params, ['newClientOrderId', 'clientOrderId', 'origClientOrderId']);
        const request = {
            'symbol': market['id'],
            'side': side.toUpperCase(),
        };
        const initialUppercaseType = type.toUpperCase();
        let uppercaseType = initialUppercaseType;
        const postOnly = this.isPostOnly(initialUppercaseType === 'MARKET', initialUppercaseType === 'LIMIT_MAKER', params);
        if (postOnly) {
            uppercaseType = 'LIMIT_MAKER';
        }
        const triggerPrice = this.safeNumber2(params, 'stopPrice', 'triggerPrice');
        if (triggerPrice !== undefined) {
            if (uppercaseType === 'MARKET') {
                uppercaseType = 'STOP_LOSS';
            }
            else if (uppercaseType === 'LIMIT') {
                uppercaseType = 'STOP_LOSS_LIMIT';
            }
        }
        request['type'] = uppercaseType;
        const validOrderTypes = this.safeList(market['info'], 'orderTypes');
        if (!this.inArray(uppercaseType, validOrderTypes)) {
            if (initialUppercaseType !== uppercaseType) {
                throw new errors.InvalidOrder(this.id + ' triggerPrice parameter is not allowed for ' + symbol + ' ' + type + ' orders');
            }
            else {
                throw new errors.InvalidOrder(this.id + ' ' + type + ' is not a valid order type for the ' + symbol + ' market');
            }
        }
        if (clientOrderId === undefined) {
            const broker = this.safeDict(this.options, 'broker');
            if (broker !== undefined) {
                const brokerId = this.safeString(broker, 'spot');
                if (brokerId !== undefined) {
                    request['newClientOrderId'] = brokerId + this.uuid22();
                }
            }
        }
        else {
            request['newClientOrderId'] = clientOrderId;
        }
        request['newOrderRespType'] = this.safeValue(this.options['newOrderRespType'], type, 'RESULT'); // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
        let timeInForceIsRequired = false;
        let priceIsRequired = false;
        let triggerPriceIsRequired = false;
        let quantityIsRequired = false;
        if (uppercaseType === 'MARKET') {
            const quoteOrderQty = this.safeBool(this.options, 'quoteOrderQty', true);
            if (quoteOrderQty) {
                const quoteOrderQtyNew = this.safeValue2(params, 'quoteOrderQty', 'cost');
                const precision = market['precision']['price'];
                if (quoteOrderQtyNew !== undefined) {
                    request['quoteOrderQty'] = this.decimalToPrecision(quoteOrderQtyNew, number.TRUNCATE, precision, this.precisionMode);
                }
                else if (price !== undefined) {
                    const amountString = this.numberToString(amount);
                    const priceString = this.numberToString(price);
                    const quoteOrderQuantity = Precise["default"].stringMul(amountString, priceString);
                    request['quoteOrderQty'] = this.decimalToPrecision(quoteOrderQuantity, number.TRUNCATE, precision, this.precisionMode);
                }
                else {
                    quantityIsRequired = true;
                }
            }
            else {
                quantityIsRequired = true;
            }
        }
        else if (uppercaseType === 'LIMIT') {
            priceIsRequired = true;
            timeInForceIsRequired = true;
            quantityIsRequired = true;
        }
        else if ((uppercaseType === 'STOP_LOSS') || (uppercaseType === 'TAKE_PROFIT')) {
            triggerPriceIsRequired = true;
            quantityIsRequired = true;
        }
        else if ((uppercaseType === 'STOP_LOSS_LIMIT') || (uppercaseType === 'TAKE_PROFIT_LIMIT')) {
            quantityIsRequired = true;
            triggerPriceIsRequired = true;
            priceIsRequired = true;
            timeInForceIsRequired = true;
        }
        else if (uppercaseType === 'LIMIT_MAKER') {
            priceIsRequired = true;
            quantityIsRequired = true;
        }
        if (quantityIsRequired) {
            request['quantity'] = this.amountToPrecision(symbol, amount);
        }
        if (priceIsRequired) {
            if (price === undefined) {
                throw new errors.InvalidOrder(this.id + ' editOrder() requires a price argument for a ' + type + ' order');
            }
            request['price'] = this.priceToPrecision(symbol, price);
        }
        if (timeInForceIsRequired && (this.safeString(params, 'timeInForce') === undefined)) {
            request['timeInForce'] = this.options['defaultTimeInForce']; // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
        }
        if (triggerPriceIsRequired) {
            if (triggerPrice === undefined) {
                throw new errors.InvalidOrder(this.id + ' editOrder() requires a triggerPrice extra param for a ' + type + ' order');
            }
            else {
                request['stopPrice'] = this.priceToPrecision(symbol, triggerPrice);
            }
        }
        request['cancelReplaceMode'] = 'STOP_ON_FAILURE'; // If the cancel request fails, the new order placement will not be attempted.
        const cancelId = this.safeString2(params, 'cancelNewClientOrderId', 'cancelOrigClientOrderId');
        if (cancelId === undefined) {
            request['cancelOrderId'] = id; // user can provide either cancelOrderId, cancelOrigClientOrderId or cancelOrigClientOrderId
        }
        // remove timeInForce from params because PO is only used by this.isPostOnly and it's not a valid value for Binance
        if (this.safeString(params, 'timeInForce') === 'PO') {
            params = this.omit(params, ['timeInForce']);
        }
        params = this.omit(params, ['quoteOrderQty', 'cost', 'stopPrice', 'newClientOrderId', 'clientOrderId', 'postOnly']);
        return this.extend(request, params);
    }
    editContractOrderRequest(id, symbol, type, side, amount, price = undefined, params = {}) {
        const market = this.market(symbol);
        if (!market['contract']) {
            throw new errors.NotSupported(this.id + ' editContractOrder() does not support ' + market['type'] + ' orders');
        }
        const request = {
            'symbol': market['id'],
            'side': side.toUpperCase(),
            'orderId': id,
            'quantity': this.amountToPrecision(symbol, amount),
        };
        const clientOrderId = this.safeStringN(params, ['newClientOrderId', 'clientOrderId', 'origClientOrderId']);
        if (price !== undefined) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        }
        params = this.omit(params, ['clientOrderId', 'newClientOrderId']);
        return request;
    }
    /**
     * @method
     * @name binance#editContractOrder
     * @description edit a trade order
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Modify-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Modify-UM-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Modify-CM-Order
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to edit an order in a portfolio margin account
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editContractOrder(id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'editContractOrder', 'papi', 'portfolioMargin', false);
        if (market['linear'] || isPortfolioMargin) {
            if ((price === undefined) && !('priceMatch' in params)) {
                throw new errors.ArgumentsRequired(this.id + ' editOrder() requires a price argument for portfolio margin and linear orders');
            }
        }
        const request = this.editContractOrderRequest(id, symbol, type, side, amount, price, params);
        let response = undefined;
        if (market['linear']) {
            if (isPortfolioMargin) {
                response = await this.papiPutUmOrder(this.extend(request, params));
            }
            else {
                response = await this.fapiPrivatePutOrder(this.extend(request, params));
            }
        }
        else if (market['inverse']) {
            if (isPortfolioMargin) {
                response = await this.papiPutCmOrder(this.extend(request, params));
            }
            else {
                response = await this.dapiPrivatePutOrder(this.extend(request, params));
            }
        }
        //
        // swap and future
        //
        //     {
        //         "orderId": 151007482392,
        //         "symbol": "BTCUSDT",
        //         "status": "NEW",
        //         "clientOrderId": "web_pCCGp9AIHjziKLlpGpXI",
        //         "price": "25000",
        //         "avgPrice": "0.00000",
        //         "origQty": "0.001",
        //         "executedQty": "0",
        //         "cumQty": "0",
        //         "cumQuote": "0",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "reduceOnly": false,
        //         "closePosition": false,
        //         "side": "BUY",
        //         "positionSide": "BOTH",
        //         "stopPrice": "0",
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false,
        //         "origType": "LIMIT",
        //         "updateTime": 1684300587845
        //     }
        //
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name binance#editOrder
     * @description edit a trade order
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#cancel-an-existing-order-and-send-a-new-order-trade
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Modify-Order
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (market['option']) {
            throw new errors.NotSupported(this.id + ' editOrder() does not support ' + market['type'] + ' orders');
        }
        if (market['spot']) {
            return await this.editSpotOrder(id, symbol, type, side, amount, price, params);
        }
        else {
            return await this.editContractOrder(id, symbol, type, side, amount, price, params);
        }
    }
    /**
     * @method
     * @name binance#editOrders
     * @description edit a list of trade orders
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Multiple-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Modify-Multiple-Orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrders(orders, params = {}) {
        await this.loadMarkets();
        const ordersRequests = [];
        let orderSymbols = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString(rawOrder, 'symbol');
            orderSymbols.push(marketId);
            const id = this.safeString(rawOrder, 'id');
            const type = this.safeString(rawOrder, 'type');
            const side = this.safeString(rawOrder, 'side');
            const amount = this.safeValue(rawOrder, 'amount');
            const price = this.safeValue(rawOrder, 'price');
            let orderParams = this.safeDict(rawOrder, 'params', {});
            let isPortfolioMargin = undefined;
            [isPortfolioMargin, orderParams] = this.handleOptionAndParams2(orderParams, 'editOrders', 'papi', 'portfolioMargin', false);
            if (isPortfolioMargin) {
                throw new errors.NotSupported(this.id + ' editOrders() does not support portfolio margin orders');
            }
            const orderRequest = this.editContractOrderRequest(id, marketId, type, side, amount, price, orderParams);
            ordersRequests.push(orderRequest);
        }
        orderSymbols = this.marketSymbols(orderSymbols, undefined, false, true, true);
        const market = this.market(orderSymbols[0]);
        if (market['spot'] || market['option']) {
            throw new errors.NotSupported(this.id + ' editOrders() does not support ' + market['type'] + ' orders');
        }
        let response = undefined;
        let request = {
            'batchOrders': ordersRequests,
        };
        request = this.extend(request, params);
        if (market['linear']) {
            response = await this.fapiPrivatePutBatchOrders(request);
        }
        else if (market['inverse']) {
            response = await this.dapiPrivatePutBatchOrders(request);
        }
        //
        //   [
        //       {
        //          "code": -4005,
        //          "msg": "Quantity greater than max quantity."
        //       },
        //       {
        //          "orderId": 650640530,
        //          "symbol": "LTCUSDT",
        //          "status": "NEW",
        //          "clientOrderId": "x-xcKtGhcu32184eb13585491289bbaf",
        //          "price": "54.00",
        //          "avgPrice": "0.00",
        //          "origQty": "0.100",
        //          "executedQty": "0.000",
        //          "cumQty": "0.000",
        //          "cumQuote": "0.00000",
        //          "timeInForce": "GTC",
        //          "type": "LIMIT",
        //          "reduceOnly": false,
        //          "closePosition": false,
        //          "side": "BUY",
        //          "positionSide": "BOTH",
        //          "stopPrice": "0.00",
        //          "workingType": "CONTRACT_PRICE",
        //          "priceProtect": false,
        //          "origType": "LIMIT",
        //          "priceMatch": "NONE",
        //          "selfTradePreventionMode": "NONE",
        //          "goodTillDate": 0,
        //          "updateTime": 1698073926929
        //       }
        //   ]
        //
        return this.parseOrders(response);
    }
    parseOrderStatus(status) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'ACCEPTED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'CANCELLED': 'canceled',
            'PENDING_CANCEL': 'canceling',
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
            'EXPIRED_IN_MATCH': 'expired',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        // spot
        //
        //     {
        //         "symbol": "LTCBTC",
        //         "orderId": 1,
        //         "clientOrderId": "myOrder1",
        //         "price": "0.1",
        //         "origQty": "1.0",
        //         "executedQty": "0.0",
        //         "cummulativeQuoteQty": "0.0",
        //         "status": "NEW",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "stopPrice": "0.0",
        //         "icebergQty": "0.0",
        //         "time": 1499827319559,
        //         "updateTime": 1499827319559,
        //         "isWorking": true
        //     }
        //
        // spot: editOrder
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": 16383176297,
        //         "orderListId": -1,
        //         "clientOrderId": "x-TKT5PX2F22ecb58eb9074fb1be018c",
        //         "transactTime": 1670891847932,
        //         "price": "13500.00000000",
        //         "origQty": "0.00085000",
        //         "executedQty": "0.00000000",
        //         "cummulativeQuoteQty": "0.00000000",
        //         "status": "NEW",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "fills": []
        //     }
        //
        // swap and future: editOrder
        //
        //     {
        //         "orderId": 151007482392,
        //         "symbol": "BTCUSDT",
        //         "status": "NEW",
        //         "clientOrderId": "web_pCCGp9AIHjziKLlpGpXI",
        //         "price": "25000",
        //         "avgPrice": "0.00000",
        //         "origQty": "0.001",
        //         "executedQty": "0",
        //         "cumQty": "0",
        //         "cumQuote": "0",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "reduceOnly": false,
        //         "closePosition": false,
        //         "side": "BUY",
        //         "positionSide": "BOTH",
        //         "stopPrice": "0",
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false,
        //         "origType": "LIMIT",
        //         "updateTime": 1684300587845
        //     }
        //
        // futures
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": 1,
        //         "clientOrderId": "myOrder1",
        //         "price": "0.1",
        //         "origQty": "1.0",
        //         "executedQty": "1.0",
        //         "cumQuote": "10.0",
        //         "status": "NEW",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "stopPrice": "0.0",
        //         "updateTime": 1499827319559
        //     }
        //
        // createOrder with { "newOrderRespType": "FULL" }
        //
        //     {
        //       "symbol": "BTCUSDT",
        //       "orderId": 5403233939,
        //       "orderListId": -1,
        //       "clientOrderId": "x-TKT5PX2F5e669e75b6c14f69a2c43e",
        //       "transactTime": 1617151923742,
        //       "price": "0.00000000",
        //       "origQty": "0.00050000",
        //       "executedQty": "0.00050000",
        //       "cummulativeQuoteQty": "29.47081500",
        //       "status": "FILLED",
        //       "timeInForce": "GTC",
        //       "type": "MARKET",
        //       "side": "BUY",
        //       "fills": [
        //         {
        //           "price": "58941.63000000",
        //           "qty": "0.00050000",
        //           "commission": "0.00007050",
        //           "commissionAsset": "BNB",
        //           "tradeId": 737466631
        //         }
        //       ]
        //     }
        //
        // delivery
        //
        //     {
        //       "orderId": "18742727411",
        //       "symbol": "ETHUSD_PERP",
        //       "pair": "ETHUSD",
        //       "status": "FILLED",
        //       "clientOrderId": "x-xcKtGhcu3e2d1503fdd543b3b02419",
        //       "price": "0",
        //       "avgPrice": "4522.14",
        //       "origQty": "1",
        //       "executedQty": "1",
        //       "cumBase": "0.00221134",
        //       "timeInForce": "GTC",
        //       "type": "MARKET",
        //       "reduceOnly": false,
        //       "closePosition": false,
        //       "side": "SELL",
        //       "positionSide": "BOTH",
        //       "stopPrice": "0",
        //       "workingType": "CONTRACT_PRICE",
        //       "priceProtect": false,
        //       "origType": "MARKET",
        //       "time": "1636061952660",
        //       "updateTime": "1636061952660"
        //     }
        //
        // option: createOrder, fetchOrder, fetchOpenOrders, fetchOrders
        //
        //     {
        //         "orderId": 4728833085436977152,
        //         "symbol": "ETH-230211-1500-C",
        //         "price": "10.0",
        //         "quantity": "1.00",
        //         "executedQty": "0.00",
        //         "fee": "0",
        //         "side": "BUY",
        //         "type": "LIMIT",
        //         "timeInForce": "GTC",
        //         "reduceOnly": false,
        //         "postOnly": false,
        //         "createTime": 1676083034462,
        //         "updateTime": 1676083034462,
        //         "status": "ACCEPTED",
        //         "avgPrice": "0",
        //         "source": "API",
        //         "clientOrderId": "",
        //         "priceScale": 1,
        //         "quantityScale": 2,
        //         "optionSide": "CALL",
        //         "quoteAsset": "USDT",
        //         "lastTrade": {"id":"69","time":"1676084430567","price":"24.9","qty":"1.00"},
        //         "mmp": false
        //     }
        //
        // cancelOrders/createOrders
        //
        //     {
        //         "code": -4005,
        //         "msg": "Quantity greater than max quantity."
        //     }
        //
        // createOrder, fetchOpenOrders, fetchOrder, cancelOrder, fetchOrders: portfolio margin linear swap and future
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "side": "BUY",
        //         "executedQty": "0.000",
        //         "orderId": 258649539704,
        //         "goodTillDate": 0,
        //         "avgPrice": "0",
        //         "origQty": "0.010",
        //         "clientOrderId": "x-xcKtGhcu02573c6f15e544e990057b",
        //         "positionSide": "BOTH",
        //         "cumQty": "0.000",
        //         "updateTime": 1707110415436,
        //         "type": "LIMIT",
        //         "reduceOnly": false,
        //         "price": "35000.00",
        //         "cumQuote": "0.00000",
        //         "selfTradePreventionMode": "NONE",
        //         "timeInForce": "GTC",
        //         "status": "NEW"
        //     }
        //
        // createOrder, fetchOpenOrders, fetchOrder, cancelOrder, fetchOrders: portfolio margin inverse swap and future
        //
        //     {
        //         "symbol": "ETHUSD_PERP",
        //         "side": "BUY",
        //         "cumBase": "0",
        //         "executedQty": "0",
        //         "orderId": 71275227732,
        //         "avgPrice": "0.00",
        //         "origQty": "1",
        //         "clientOrderId": "x-xcKtGhcuca5af3acfb5044198c5398",
        //         "positionSide": "BOTH",
        //         "cumQty": "0",
        //         "updateTime": 1707110994334,
        //         "type": "LIMIT",
        //         "pair": "ETHUSD",
        //         "reduceOnly": false,
        //         "price": "2000",
        //         "timeInForce": "GTC",
        //         "status": "NEW"
        //     }
        //
        // createOrder, fetchOpenOrders, fetchOpenOrder: portfolio margin linear swap and future conditional
        //
        //     {
        //         "newClientStrategyId": "x-xcKtGhcu27f109953d6e4dc0974006",
        //         "strategyId": 3645916,
        //         "strategyStatus": "NEW",
        //         "strategyType": "STOP",
        //         "origQty": "0.010",
        //         "price": "35000.00",
        //         "reduceOnly": false,
        //         "side": "BUY",
        //         "positionSide": "BOTH",
        //         "stopPrice": "45000.00",
        //         "symbol": "BTCUSDT",
        //         "timeInForce": "GTC",
        //         "bookTime": 1707112625879,
        //         "updateTime": 1707112625879,
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false,
        //         "goodTillDate": 0,
        //         "selfTradePreventionMode": "NONE"
        //     }
        //
        // createOrder, fetchOpenOrders: portfolio margin inverse swap and future conditional
        //
        //     {
        //         "newClientStrategyId": "x-xcKtGhcuc6b86f053bb34933850739",
        //         "strategyId": 1423462,
        //         "strategyStatus": "NEW",
        //         "strategyType": "STOP",
        //         "origQty": "1",
        //         "price": "2000",
        //         "reduceOnly": false,
        //         "side": "BUY",
        //         "positionSide": "BOTH",
        //         "stopPrice": "3000",
        //         "symbol": "ETHUSD_PERP",
        //         "timeInForce": "GTC",
        //         "bookTime": 1707113098840,
        //         "updateTime": 1707113098840,
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false
        //     }
        //
        // createOrder, cancelAllOrders, cancelOrder: portfolio margin spot margin
        //
        //     {
        //         "clientOrderId": "x-TKT5PX2Fe9ef29d8346440f0b28b86",
        //         "cummulativeQuoteQty": "0.00000000",
        //         "executedQty": "0.00000000",
        //         "fills": [],
        //         "orderId": 24684460474,
        //         "origQty": "0.00100000",
        //         "price": "35000.00000000",
        //         "selfTradePreventionMode": "EXPIRE_MAKER",
        //         "side": "BUY",
        //         "status": "NEW",
        //         "symbol": "BTCUSDT",
        //         "timeInForce": "GTC",
        //         "transactTime": 1707113538870,
        //         "type": "LIMIT"
        //     }
        //
        // fetchOpenOrders, fetchOrder, fetchOrders: portfolio margin spot margin
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": 24700763749,
        //         "clientOrderId": "x-TKT5PX2F6f724c2a4af6425f98c7b6",
        //         "price": "35000.00000000",
        //         "origQty": "0.00100000",
        //         "executedQty": "0.00000000",
        //         "cummulativeQuoteQty": "0.00000000",
        //         "status": "NEW",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "stopPrice": "0.00000000",
        //         "icebergQty": "0.00000000",
        //         "time": 1707199187679,
        //         "updateTime": 1707199187679,
        //         "isWorking": true,
        //         "accountId": 200180970,
        //         "selfTradePreventionMode": "EXPIRE_MAKER",
        //         "preventedMatchId": null,
        //         "preventedQuantity": null
        //     }
        //
        // cancelOrder: portfolio margin linear and inverse swap conditional
        //
        //     {
        //         "strategyId": 3733211,
        //         "newClientStrategyId": "x-xcKtGhcuaf166172ed504cd1bc0396",
        //         "strategyType": "STOP",
        //         "strategyStatus": "CANCELED",
        //         "origQty": "0.010",
        //         "price": "35000.00",
        //         "reduceOnly": false,
        //         "side": "BUY",
        //         "positionSide": "BOTH",
        //         "stopPrice": "50000.00", // ignored with trailing orders
        //         "symbol": "BTCUSDT",
        //         "timeInForce": "GTC",
        //         "activatePrice": null,  // only return with trailing orders
        //         "priceRate": null,      // only return with trailing orders
        //         "bookTime": 1707270098774,
        //         "updateTime": 1707270119261,
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false,
        //         "goodTillDate": 0,
        //         "selfTradePreventionMode": "NONE"
        //     }
        //
        // fetchOrders: portfolio margin linear and inverse swap conditional
        //
        //     {
        //         "newClientStrategyId": "x-xcKtGhcuaf166172ed504cd1bc0396",
        //         "strategyId": 3733211,
        //         "strategyStatus": "CANCELLED",
        //         "strategyType": "STOP",
        //         "origQty": "0.010",
        //         "price": "35000",
        //         "orderId": 0,
        //         "reduceOnly": false,
        //         "side": "BUY",
        //         "positionSide": "BOTH",
        //         "stopPrice": "50000",
        //         "symbol": "BTCUSDT",
        //         "type": "LIMIT",
        //         "bookTime": 1707270098774,
        //         "updateTime": 1707270119261,
        //         "timeInForce": "GTC",
        //         "triggerTime": 0,
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false,
        //         "goodTillDate": 0,
        //         "selfTradePreventionMode": "NONE"
        //     }
        //
        // fetchOpenOrder: linear swap
        //
        //     {
        //         "orderId": 3697213934,
        //         "symbol": "BTCUSDT",
        //         "status": "NEW",
        //         "clientOrderId": "x-xcKtGhcufb20c5a7761a4aa09aa156",
        //         "price": "33000.00",
        //         "avgPrice": "0.00000",
        //         "origQty": "0.010",
        //         "executedQty": "0.000",
        //         "cumQuote": "0.00000",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "reduceOnly": false,
        //         "closePosition": false,
        //         "side": "BUY",
        //         "positionSide": "BOTH",
        //         "stopPrice": "0.00",
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false,
        //         "origType": "LIMIT",
        //         "priceMatch": "NONE",
        //         "selfTradePreventionMode": "NONE",
        //         "goodTillDate": 0,
        //         "time": 1707892893502,
        //         "updateTime": 1707892893515
        //     }
        //
        // fetchOpenOrder: inverse swap
        //
        //     {
        //         "orderId": 597368542,
        //         "symbol": "BTCUSD_PERP",
        //         "pair": "BTCUSD",
        //         "status": "NEW",
        //         "clientOrderId": "x-xcKtGhcubbde7ba93b1a4ab881eff3",
        //         "price": "35000",
        //         "avgPrice": "0",
        //         "origQty": "1",
        //         "executedQty": "0",
        //         "cumBase": "0",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "reduceOnly": false,
        //         "closePosition": false,
        //         "side": "BUY",
        //         "positionSide": "BOTH",
        //         "stopPrice": "0",
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false,
        //         "origType": "LIMIT",
        //         "time": 1707893453199,
        //         "updateTime": 1707893453199
        //     }
        //
        // fetchOpenOrder: linear portfolio margin
        //
        //     {
        //         "orderId": 264895013409,
        //         "symbol": "BTCUSDT",
        //         "status": "NEW",
        //         "clientOrderId": "x-xcKtGhcu6278f1adbdf14f74ab432e",
        //         "price": "35000",
        //         "avgPrice": "0",
        //         "origQty": "0.010",
        //         "executedQty": "0",
        //         "cumQuote": "0",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "reduceOnly": false,
        //         "side": "BUY",
        //         "positionSide": "LONG",
        //         "origType": "LIMIT",
        //         "time": 1707893839364,
        //         "updateTime": 1707893839364,
        //         "goodTillDate": 0,
        //         "selfTradePreventionMode": "NONE"
        //     }
        //
        // fetchOpenOrder: inverse portfolio margin
        //
        //     {
        //         "orderId": 71790316950,
        //         "symbol": "ETHUSD_PERP",
        //         "pair": "ETHUSD",
        //         "status": "NEW",
        //         "clientOrderId": "x-xcKtGhcuec11030474204ab08ba2c2",
        //         "price": "2500",
        //         "avgPrice": "0",
        //         "origQty": "1",
        //         "executedQty": "0",
        //         "cumBase": "0",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "reduceOnly": false,
        //         "side": "BUY",
        //         "positionSide": "LONG",
        //         "origType": "LIMIT",
        //         "time": 1707894181694,
        //         "updateTime": 1707894181694
        //     }
        //
        // fetchOpenOrder: inverse portfolio margin conditional
        //
        //     {
        //         "newClientStrategyId": "x-xcKtGhcu2da9c765294b433994ffce",
        //         "strategyId": 1423501,
        //         "strategyStatus": "NEW",
        //         "strategyType": "STOP",
        //         "origQty": "1",
        //         "price": "2500",
        //         "reduceOnly": false,
        //         "side": "BUY",
        //         "positionSide": "LONG",
        //         "stopPrice": "4000",
        //         "symbol": "ETHUSD_PERP",
        //         "bookTime": 1707894782679,
        //         "updateTime": 1707894782679,
        //         "timeInForce": "GTC",
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false
        //     }
        //
        const code = this.safeString(order, 'code');
        if (code !== undefined) {
            // cancelOrders/createOrders might have a partial success
            return this.safeOrder({ 'info': order, 'status': 'rejected' }, market);
        }
        const status = this.parseOrderStatus(this.safeString2(order, 'status', 'strategyStatus'));
        const marketId = this.safeString(order, 'symbol');
        const isContract = ('positionSide' in order) || ('cumQuote' in order);
        const marketType = isContract ? 'contract' : 'spot';
        const symbol = this.safeSymbol(marketId, market, undefined, marketType);
        const filled = this.safeString(order, 'executedQty', '0');
        const timestamp = this.safeIntegerN(order, ['time', 'createTime', 'workingTime', 'transactTime', 'updateTime']); // order of the keys matters here
        let lastTradeTimestamp = undefined;
        if (('transactTime' in order) || ('updateTime' in order)) {
            const timestampValue = this.safeInteger2(order, 'updateTime', 'transactTime');
            if (status === 'open') {
                if (Precise["default"].stringGt(filled, '0')) {
                    lastTradeTimestamp = timestampValue;
                }
            }
            else if (status === 'closed') {
                lastTradeTimestamp = timestampValue;
            }
        }
        const lastUpdateTimestamp = this.safeInteger2(order, 'transactTime', 'updateTime');
        const average = this.safeString(order, 'avgPrice');
        const price = this.safeString(order, 'price');
        const amount = this.safeString2(order, 'origQty', 'quantity');
        // - Spot/Margin market: cummulativeQuoteQty
        // - Futures market: cumQuote.
        //   Note this is not the actual cost, since Binance futures uses leverage to calculate margins.
        let cost = this.safeString2(order, 'cummulativeQuoteQty', 'cumQuote');
        cost = this.safeString(order, 'cumBase', cost);
        let type = this.safeStringLower(order, 'type');
        const side = this.safeStringLower(order, 'side');
        const fills = this.safeList(order, 'fills', []);
        let timeInForce = this.safeString(order, 'timeInForce');
        if (timeInForce === 'GTX') {
            // GTX means "Good Till Crossing" and is an equivalent way of saying Post Only
            timeInForce = 'PO';
        }
        const postOnly = (type === 'limit_maker') || (timeInForce === 'PO');
        if (type === 'limit_maker') {
            type = 'limit';
        }
        const stopPriceString = this.safeString(order, 'stopPrice');
        const triggerPrice = this.parseNumber(this.omitZero(stopPriceString));
        const feeCost = this.safeNumber(order, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'currency': this.safeString(order, 'quoteAsset'),
                'cost': feeCost,
                'rate': undefined,
            };
        }
        return this.safeOrder({
            'info': order,
            'id': this.safeString2(order, 'strategyId', 'orderId'),
            'clientOrderId': this.safeString2(order, 'clientOrderId', 'newClientStrategyId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': this.safeBool(order, 'reduceOnly'),
            'side': side,
            'price': price,
            'triggerPrice': triggerPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': fills,
        }, market);
    }
    /**
     * @method
     * @name binance#createOrders
     * @description *contract only* create a list of trade orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Place-Multiple-Orders
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Place-Multiple-Orders
     * @see https://developers.binance.com/docs/derivatives/option/trade/Place-Multiple-Orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders(orders, params = {}) {
        await this.loadMarkets();
        const ordersRequests = [];
        let orderSymbols = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString(rawOrder, 'symbol');
            orderSymbols.push(marketId);
            const type = this.safeString(rawOrder, 'type');
            const side = this.safeString(rawOrder, 'side');
            const amount = this.safeValue(rawOrder, 'amount');
            const price = this.safeValue(rawOrder, 'price');
            const orderParams = this.safeDict(rawOrder, 'params', {});
            const orderRequest = this.createOrderRequest(marketId, type, side, amount, price, orderParams);
            ordersRequests.push(orderRequest);
        }
        orderSymbols = this.marketSymbols(orderSymbols, undefined, false, true, true);
        const market = this.market(orderSymbols[0]);
        if (market['spot']) {
            throw new errors.NotSupported(this.id + ' createOrders() does not support ' + market['type'] + ' orders');
        }
        let response = undefined;
        let request = {
            'batchOrders': ordersRequests,
        };
        request = this.extend(request, params);
        if (market['linear']) {
            response = await this.fapiPrivatePostBatchOrders(request);
        }
        else if (market['option']) {
            response = await this.eapiPrivatePostBatchOrders(request);
        }
        else {
            response = await this.dapiPrivatePostBatchOrders(request);
        }
        //
        //   [
        //       {
        //          "code": -4005,
        //          "msg": "Quantity greater than max quantity."
        //       },
        //       {
        //          "orderId": 650640530,
        //          "symbol": "LTCUSDT",
        //          "status": "NEW",
        //          "clientOrderId": "x-xcKtGhcu32184eb13585491289bbaf",
        //          "price": "54.00",
        //          "avgPrice": "0.00",
        //          "origQty": "0.100",
        //          "executedQty": "0.000",
        //          "cumQty": "0.000",
        //          "cumQuote": "0.00000",
        //          "timeInForce": "GTC",
        //          "type": "LIMIT",
        //          "reduceOnly": false,
        //          "closePosition": false,
        //          "side": "BUY",
        //          "positionSide": "BOTH",
        //          "stopPrice": "0.00",
        //          "workingType": "CONTRACT_PRICE",
        //          "priceProtect": false,
        //          "origType": "LIMIT",
        //          "priceMatch": "NONE",
        //          "selfTradePreventionMode": "NONE",
        //          "goodTillDate": 0,
        //          "updateTime": 1698073926929
        //       }
        //   ]
        //
        return this.parseOrders(response);
    }
    /**
     * @method
     * @name binance#createOrder
     * @description create a trade order
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#new-order-trade
     * @see https://developers.binance.com/docs/binance-spot-api-docs/testnet/rest-api/trading-endpoints#test-new-order-trade
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/New-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api
     * @see https://developers.binance.com/docs/derivatives/option/trade/New-Order
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#sor
     * @see https://developers.binance.com/docs/binance-spot-api-docs/testnet/rest-api/trading-endpoints#sor
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-UM-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-CM-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-Margin-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-UM-Conditional-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-CM-Conditional-Order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'STOP_LOSS' or 'STOP_LOSS_LIMIT' or 'TAKE_PROFIT' or 'TAKE_PROFIT_LIMIT' or 'STOP'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.reduceOnly] for swap and future reduceOnly is a string 'true' or 'false' that cant be sent with close position set to true or in hedge mode. For spot margin and option reduceOnly is a boolean.
     * @param {string} [params.marginMode] 'cross' or 'isolated', for spot margin trading
     * @param {boolean} [params.sor] *spot only* whether to use SOR (Smart Order Routing) or not, default is false
     * @param {boolean} [params.test] *spot only* whether to use the test endpoint or not, default is false
     * @param {float} [params.trailingPercent] the percent to trail away from the current market price
     * @param {float} [params.trailingTriggerPrice] the price to trigger a trailing order, default uses the price argument
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
     * @param {boolean} [params.portfolioMargin] set to true if you would like to create an order in a portfolio margin account
     * @param {string} [params.selfTradePrevention] set unified value for stp (see .features for available values)
     * @param {float} [params.icebergAmount] set iceberg amount for limit orders
     * @param {string} [params.stopLossOrTakeProfit] 'stopLoss' or 'takeProfit', required for spot trailing orders
     * @param {string} [params.positionSide] *swap and portfolio margin only* "BOTH" for one-way mode, "LONG" for buy side of hedged mode, "SHORT" for sell side of hedged mode
     * @param {bool} [params.hedged] *swap and portfolio margin only* true for hedged mode, false for one way mode, default is false
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        // don't handle/omit params here, omitting happens inside createOrderRequest
        const marketType = this.safeString(params, 'type', market['type']);
        const marginMode = this.safeString(params, 'marginMode');
        const porfolioOptionsValue = this.safeBool2(this.options, 'papi', 'portfolioMargin', false);
        const isPortfolioMargin = this.safeBool2(params, 'papi', 'portfolioMargin', porfolioOptionsValue);
        const triggerPrice = this.safeString2(params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeString(params, 'stopLossPrice');
        const takeProfitPrice = this.safeString(params, 'takeProfitPrice');
        const trailingPercent = this.safeString2(params, 'trailingPercent', 'callbackRate');
        const isTrailingPercentOrder = trailingPercent !== undefined;
        const isStopLoss = stopLossPrice !== undefined;
        const isTakeProfit = takeProfitPrice !== undefined;
        const isConditional = (triggerPrice !== undefined) || isTrailingPercentOrder || isStopLoss || isTakeProfit;
        const sor = this.safeBool2(params, 'sor', 'SOR', false);
        const test = this.safeBool(params, 'test', false);
        params = this.omit(params, ['sor', 'SOR', 'test']);
        // if (isPortfolioMargin) {
        //     params['portfolioMargin'] = isPortfolioMargin;
        // }
        const request = this.createOrderRequest(symbol, type, side, amount, price, params);
        let response = undefined;
        if (market['option']) {
            response = await this.eapiPrivatePostOrder(request);
        }
        else if (sor) {
            if (test) {
                response = await this.privatePostSorOrderTest(request);
            }
            else {
                response = await this.privatePostSorOrder(request);
            }
        }
        else if (market['linear']) {
            if (isPortfolioMargin) {
                if (isConditional) {
                    response = await this.papiPostUmConditionalOrder(request);
                }
                else {
                    response = await this.papiPostUmOrder(request);
                }
            }
            else {
                response = await this.fapiPrivatePostOrder(request);
            }
        }
        else if (market['inverse']) {
            if (isPortfolioMargin) {
                if (isConditional) {
                    response = await this.papiPostCmConditionalOrder(request);
                }
                else {
                    response = await this.papiPostCmOrder(request);
                }
            }
            else {
                response = await this.dapiPrivatePostOrder(request);
            }
        }
        else if (marketType === 'margin' || marginMode !== undefined || isPortfolioMargin) {
            if (isPortfolioMargin) {
                response = await this.papiPostMarginOrder(request);
            }
            else {
                response = await this.sapiPostMarginOrder(request);
            }
        }
        else {
            if (test) {
                response = await this.privatePostOrderTest(request);
            }
            else {
                response = await this.privatePostOrder(request);
            }
        }
        return this.parseOrder(response, market);
    }
    createOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @ignore
         * @name binance#createOrderRequest
         * @description helper function to build the request
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency
         * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} request to be sent to the exchange
         */
        const market = this.market(symbol);
        const marketType = this.safeString(params, 'type', market['type']);
        const clientOrderId = this.safeString2(params, 'newClientOrderId', 'clientOrderId');
        const initialUppercaseType = type.toUpperCase();
        const isMarketOrder = initialUppercaseType === 'MARKET';
        const isLimitOrder = initialUppercaseType === 'LIMIT';
        const request = {
            'symbol': market['id'],
            'side': side.toUpperCase(),
        };
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'createOrder', 'papi', 'portfolioMargin', false);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('createOrder', params);
        const reduceOnly = this.safeBool(params, 'reduceOnly', false);
        if (reduceOnly) {
            if (marketType === 'margin' || (!market['contract'] && (marginMode !== undefined))) {
                params = this.omit(params, 'reduceOnly');
                request['sideEffectType'] = 'AUTO_REPAY';
            }
        }
        const triggerPrice = this.safeString2(params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeString(params, 'stopLossPrice', triggerPrice); // fallback to stopLoss
        const takeProfitPrice = this.safeString(params, 'takeProfitPrice');
        const trailingDelta = this.safeString(params, 'trailingDelta');
        const trailingTriggerPrice = this.safeString2(params, 'trailingTriggerPrice', 'activationPrice');
        const trailingPercent = this.safeStringN(params, ['trailingPercent', 'callbackRate', 'trailingDelta']);
        const priceMatch = this.safeString(params, 'priceMatch');
        const isTrailingPercentOrder = trailingPercent !== undefined;
        const isStopLoss = stopLossPrice !== undefined || trailingDelta !== undefined;
        const isTakeProfit = takeProfitPrice !== undefined;
        const isTriggerOrder = triggerPrice !== undefined;
        const isConditional = isTriggerOrder || isTrailingPercentOrder || isStopLoss || isTakeProfit;
        const isPortfolioMarginConditional = (isPortfolioMargin && isConditional);
        const isPriceMatch = priceMatch !== undefined;
        let priceRequiredForTrailing = true;
        let uppercaseType = type.toUpperCase();
        let stopPrice = undefined;
        if (isTrailingPercentOrder) {
            if (market['swap']) {
                uppercaseType = 'TRAILING_STOP_MARKET';
                request['callbackRate'] = trailingPercent;
                if (trailingTriggerPrice !== undefined) {
                    request['activationPrice'] = this.priceToPrecision(symbol, trailingTriggerPrice);
                }
            }
            else {
                if ((uppercaseType !== 'STOP_LOSS') && (uppercaseType !== 'TAKE_PROFIT') && (uppercaseType !== 'STOP_LOSS_LIMIT') && (uppercaseType !== 'TAKE_PROFIT_LIMIT')) {
                    const stopLossOrTakeProfit = this.safeString(params, 'stopLossOrTakeProfit');
                    params = this.omit(params, 'stopLossOrTakeProfit');
                    if ((stopLossOrTakeProfit !== 'stopLoss') && (stopLossOrTakeProfit !== 'takeProfit')) {
                        throw new errors.InvalidOrder(this.id + symbol + ' trailingPercent orders require a stopLossOrTakeProfit parameter of either stopLoss or takeProfit');
                    }
                    if (isMarketOrder) {
                        if (stopLossOrTakeProfit === 'stopLoss') {
                            uppercaseType = 'STOP_LOSS';
                        }
                        else if (stopLossOrTakeProfit === 'takeProfit') {
                            uppercaseType = 'TAKE_PROFIT';
                        }
                    }
                    else {
                        if (stopLossOrTakeProfit === 'stopLoss') {
                            uppercaseType = 'STOP_LOSS_LIMIT';
                        }
                        else if (stopLossOrTakeProfit === 'takeProfit') {
                            uppercaseType = 'TAKE_PROFIT_LIMIT';
                        }
                    }
                }
                if ((uppercaseType === 'STOP_LOSS') || (uppercaseType === 'TAKE_PROFIT')) {
                    priceRequiredForTrailing = false;
                }
                if (trailingTriggerPrice !== undefined) {
                    stopPrice = this.priceToPrecision(symbol, trailingTriggerPrice);
                }
                const trailingPercentConverted = Precise["default"].stringMul(trailingPercent, '100');
                request['trailingDelta'] = trailingPercentConverted;
            }
        }
        else if (isStopLoss) {
            stopPrice = stopLossPrice;
            if (isMarketOrder) {
                // spot STOP_LOSS market orders are not a valid order type
                uppercaseType = market['contract'] ? 'STOP_MARKET' : 'STOP_LOSS';
            }
            else if (isLimitOrder) {
                uppercaseType = market['contract'] ? 'STOP' : 'STOP_LOSS_LIMIT';
            }
        }
        else if (isTakeProfit) {
            stopPrice = takeProfitPrice;
            if (isMarketOrder) {
                // spot TAKE_PROFIT market orders are not a valid order type
                uppercaseType = market['contract'] ? 'TAKE_PROFIT_MARKET' : 'TAKE_PROFIT';
            }
            else if (isLimitOrder) {
                uppercaseType = market['contract'] ? 'TAKE_PROFIT' : 'TAKE_PROFIT_LIMIT';
            }
        }
        if (market['option']) {
            if (type === 'market') {
                throw new errors.InvalidOrder(this.id + ' ' + type + ' is not a valid order type for the ' + symbol + ' market');
            }
        }
        else {
            const validOrderTypes = this.safeList(market['info'], 'orderTypes');
            if (!this.inArray(uppercaseType, validOrderTypes)) {
                if (initialUppercaseType !== uppercaseType) {
                    throw new errors.InvalidOrder(this.id + ' triggerPrice parameter is not allowed for ' + symbol + ' ' + type + ' orders');
                }
                else {
                    throw new errors.InvalidOrder(this.id + ' ' + type + ' is not a valid order type for the ' + symbol + ' market');
                }
            }
        }
        const clientOrderIdRequest = isPortfolioMarginConditional ? 'newClientStrategyId' : 'newClientOrderId';
        if (clientOrderId === undefined) {
            const broker = this.safeDict(this.options, 'broker', {});
            const defaultId = (market['contract']) ? 'x-xcKtGhcu' : 'x-TKT5PX2F';
            let idMarketType = 'spot';
            if (market['contract']) {
                idMarketType = (market['swap'] && market['linear']) ? 'swap' : 'inverse';
            }
            const brokerId = this.safeString(broker, idMarketType, defaultId);
            request[clientOrderIdRequest] = brokerId + this.uuid22();
        }
        else {
            request[clientOrderIdRequest] = clientOrderId;
        }
        let postOnly = undefined;
        if (!isPortfolioMargin) {
            postOnly = this.isPostOnly(isMarketOrder, initialUppercaseType === 'LIMIT_MAKER', params);
            if (market['spot'] || marketType === 'margin') {
                // only supported for spot/margin api (all margin markets are spot markets)
                if (postOnly) {
                    uppercaseType = 'LIMIT_MAKER';
                }
                if (marginMode === 'isolated') {
                    request['isIsolated'] = true;
                }
            }
        }
        else {
            postOnly = this.isPostOnly(isMarketOrder, initialUppercaseType === 'LIMIT_MAKER', params);
            if (postOnly) {
                if (!market['contract']) {
                    uppercaseType = 'LIMIT_MAKER';
                }
                else {
                    request['timeInForce'] = 'GTX';
                }
            }
        }
        // handle newOrderRespType response type
        if (((marketType === 'spot') || (marketType === 'margin')) && !isPortfolioMargin) {
            request['newOrderRespType'] = this.safeString(this.options['newOrderRespType'], type, 'FULL'); // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
        }
        else {
            // swap, futures and options
            request['newOrderRespType'] = 'RESULT'; // "ACK", "RESULT", default "ACK"
        }
        const typeRequest = isPortfolioMarginConditional ? 'strategyType' : 'type';
        request[typeRequest] = uppercaseType;
        // additional required fields depending on the order type
        const closePosition = this.safeBool(params, 'closePosition', false);
        let timeInForceIsRequired = false;
        let priceIsRequired = false;
        let triggerPriceIsRequired = false;
        let quantityIsRequired = false;
        //
        // spot/margin
        //
        //     LIMIT                timeInForce, quantity, price
        //     MARKET               quantity or quoteOrderQty
        //     STOP_LOSS            quantity, stopPrice
        //     STOP_LOSS_LIMIT      timeInForce, quantity, price, stopPrice
        //     TAKE_PROFIT          quantity, stopPrice
        //     TAKE_PROFIT_LIMIT    timeInForce, quantity, price, stopPrice
        //     LIMIT_MAKER          quantity, price
        //
        // futures
        //
        //     LIMIT                timeInForce, quantity, price
        //     MARKET               quantity
        //     STOP/TAKE_PROFIT     quantity, price, stopPrice
        //     STOP_MARKET          stopPrice
        //     TAKE_PROFIT_MARKET   stopPrice
        //     TRAILING_STOP_MARKET callbackRate
        //
        if (uppercaseType === 'MARKET') {
            if (market['spot']) {
                const quoteOrderQty = this.safeBool(this.options, 'quoteOrderQty', true);
                if (quoteOrderQty) {
                    const quoteOrderQtyNew = this.safeString2(params, 'quoteOrderQty', 'cost');
                    const precision = market['precision']['price'];
                    if (quoteOrderQtyNew !== undefined) {
                        request['quoteOrderQty'] = this.decimalToPrecision(quoteOrderQtyNew, number.TRUNCATE, precision, this.precisionMode);
                    }
                    else if (price !== undefined) {
                        const amountString = this.numberToString(amount);
                        const priceString = this.numberToString(price);
                        const quoteOrderQuantity = Precise["default"].stringMul(amountString, priceString);
                        request['quoteOrderQty'] = this.decimalToPrecision(quoteOrderQuantity, number.TRUNCATE, precision, this.precisionMode);
                    }
                    else {
                        quantityIsRequired = true;
                    }
                }
                else {
                    quantityIsRequired = true;
                }
            }
            else {
                quantityIsRequired = true;
            }
        }
        else if (uppercaseType === 'LIMIT') {
            priceIsRequired = true;
            timeInForceIsRequired = true;
            quantityIsRequired = true;
        }
        else if ((uppercaseType === 'STOP_LOSS') || (uppercaseType === 'TAKE_PROFIT')) {
            triggerPriceIsRequired = true;
            quantityIsRequired = true;
            if ((market['linear'] || market['inverse']) && priceRequiredForTrailing) {
                priceIsRequired = true;
            }
        }
        else if ((uppercaseType === 'STOP_LOSS_LIMIT') || (uppercaseType === 'TAKE_PROFIT_LIMIT')) {
            quantityIsRequired = true;
            triggerPriceIsRequired = true;
            priceIsRequired = true;
            timeInForceIsRequired = true;
        }
        else if (uppercaseType === 'LIMIT_MAKER') {
            priceIsRequired = true;
            quantityIsRequired = true;
        }
        else if (uppercaseType === 'STOP') {
            quantityIsRequired = true;
            triggerPriceIsRequired = true;
            priceIsRequired = true;
        }
        else if ((uppercaseType === 'STOP_MARKET') || (uppercaseType === 'TAKE_PROFIT_MARKET')) {
            if (!closePosition) {
                quantityIsRequired = true;
            }
            triggerPriceIsRequired = true;
        }
        else if (uppercaseType === 'TRAILING_STOP_MARKET') {
            if (!closePosition) {
                quantityIsRequired = true;
            }
            if (trailingPercent === undefined) {
                throw new errors.InvalidOrder(this.id + ' createOrder() requires a trailingPercent param for a ' + type + ' order');
            }
        }
        if (quantityIsRequired) {
            const marketAmountPrecision = this.safeString(market['precision'], 'amount');
            const isPrecisionAvailable = (marketAmountPrecision !== undefined);
            if (isPrecisionAvailable) {
                request['quantity'] = this.amountToPrecision(symbol, amount);
            }
            else {
                request['quantity'] = this.parseToNumeric(amount); // some options don't have the precision available
            }
        }
        if (priceIsRequired && !isPriceMatch) {
            if (price === undefined) {
                throw new errors.InvalidOrder(this.id + ' createOrder() requires a price argument for a ' + type + ' order');
            }
            const pricePrecision = this.safeString(market['precision'], 'price');
            const isPricePrecisionAvailable = (pricePrecision !== undefined);
            if (isPricePrecisionAvailable) {
                request['price'] = this.priceToPrecision(symbol, price);
            }
            else {
                request['price'] = this.parseToNumeric(price); // some options don't have the precision available
            }
        }
        if (triggerPriceIsRequired) {
            if (market['contract']) {
                if (stopPrice === undefined) {
                    throw new errors.InvalidOrder(this.id + ' createOrder() requires a triggerPrice extra param for a ' + type + ' order');
                }
            }
            else {
                // check for delta price as well
                if (trailingDelta === undefined && stopPrice === undefined && trailingPercent === undefined) {
                    throw new errors.InvalidOrder(this.id + ' createOrder() requires a triggerPrice, trailingDelta or trailingPercent param for a ' + type + ' order');
                }
            }
            if (stopPrice !== undefined) {
                request['stopPrice'] = this.priceToPrecision(symbol, stopPrice);
            }
        }
        if (timeInForceIsRequired && (this.safeString(params, 'timeInForce') === undefined) && (this.safeString(request, 'timeInForce') === undefined)) {
            request['timeInForce'] = this.safeString(this.options, 'defaultTimeInForce'); // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
        }
        if (!isPortfolioMargin && market['contract'] && postOnly) {
            request['timeInForce'] = 'GTX';
        }
        // remove timeInForce from params because PO is only used by this.isPostOnly and it's not a valid value for Binance
        if (this.safeString(params, 'timeInForce') === 'PO') {
            params = this.omit(params, 'timeInForce');
        }
        const hedged = this.safeBool(params, 'hedged', false);
        if (!market['spot'] && !market['option'] && hedged) {
            if (reduceOnly) {
                params = this.omit(params, 'reduceOnly');
                side = (side === 'buy') ? 'sell' : 'buy';
            }
            request['positionSide'] = (side === 'buy') ? 'LONG' : 'SHORT';
        }
        // unified stp
        const selfTradePrevention = this.safeString(params, 'selfTradePrevention');
        if (selfTradePrevention !== undefined) {
            if (market['spot']) {
                request['selfTradePreventionMode'] = selfTradePrevention.toUpperCase(); // binance enums exactly match the unified ccxt enums (but needs uppercase)
            }
        }
        // unified iceberg
        const icebergAmount = this.safeNumber(params, 'icebergAmount');
        if (icebergAmount !== undefined) {
            if (market['spot']) {
                request['icebergQty'] = this.amountToPrecision(symbol, icebergAmount);
            }
        }
        const requestParams = this.omit(params, ['type', 'newClientOrderId', 'clientOrderId', 'postOnly', 'stopLossPrice', 'takeProfitPrice', 'stopPrice', 'triggerPrice', 'trailingTriggerPrice', 'trailingPercent', 'quoteOrderQty', 'cost', 'test', 'hedged', 'selfTradePrevention', 'icebergAmount']);
        return this.extend(request, requestParams);
    }
    /**
     * @method
     * @name binance#createMarketOrderWithCost
     * @description create a market order by providing the symbol, side and cost
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#new-order-trade
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} side 'buy' or 'sell'
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createMarketOrderWithCost(symbol, side, cost, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' createMarketOrderWithCost() supports spot orders only');
        }
        const req = {
            'cost': cost,
        };
        return await this.createOrder(symbol, 'market', side, cost, undefined, this.extend(req, params));
    }
    /**
     * @method
     * @name binance#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#new-order-trade
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createMarketBuyOrderWithCost(symbol, cost, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' createMarketBuyOrderWithCost() supports spot orders only');
        }
        const req = {
            'cost': cost,
        };
        return await this.createOrder(symbol, 'market', 'buy', cost, undefined, this.extend(req, params));
    }
    /**
     * @method
     * @name binance#createMarketSellOrderWithCost
     * @description create a market sell order by providing the symbol and cost
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#new-order-trade
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createMarketSellOrderWithCost(symbol, cost, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' createMarketSellOrderWithCost() supports spot orders only');
        }
        params['quoteOrderQty'] = cost;
        return await this.createOrder(symbol, 'market', 'sell', cost, undefined, params);
    }
    /**
     * @method
     * @name binance#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#query-order-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Query-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Query-Order
     * @see https://developers.binance.com/docs/derivatives/option/trade/Query-Single-Order
     * @see https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-UM-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-CM-Order
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated', for spot margin trading
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch an order in a portfolio margin account
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const defaultType = this.safeString2(this.options, 'fetchOrder', 'defaultType', 'spot');
        const type = this.safeString(params, 'type', defaultType);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchOrder', params);
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchOrder', 'papi', 'portfolioMargin', false);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2(params, 'origClientOrderId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            if (market['option']) {
                request['clientOrderId'] = clientOrderId;
            }
            else {
                request['origClientOrderId'] = clientOrderId;
            }
        }
        else {
            request['orderId'] = id;
        }
        params = this.omit(params, ['type', 'clientOrderId', 'origClientOrderId']);
        let response = undefined;
        if (market['option']) {
            response = await this.eapiPrivateGetOrder(this.extend(request, params));
        }
        else if (market['linear']) {
            if (isPortfolioMargin) {
                response = await this.papiGetUmOrder(this.extend(request, params));
            }
            else {
                response = await this.fapiPrivateGetOrder(this.extend(request, params));
            }
        }
        else if (market['inverse']) {
            if (isPortfolioMargin) {
                response = await this.papiGetCmOrder(this.extend(request, params));
            }
            else {
                response = await this.dapiPrivateGetOrder(this.extend(request, params));
            }
        }
        else if ((type === 'margin') || (marginMode !== undefined) || isPortfolioMargin) {
            if (isPortfolioMargin) {
                response = await this.papiGetMarginOrder(this.extend(request, params));
            }
            else {
                if (marginMode === 'isolated') {
                    request['isIsolated'] = true;
                }
                response = await this.sapiGetMarginOrder(this.extend(request, params));
            }
        }
        else {
            response = await this.privateGetOrder(this.extend(request, params));
        }
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name binance#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#all-orders-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/All-Orders
     * @see https://developers.binance.com/docs/derivatives/option/trade/Query-Option-Order-History
     * @see https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated', for spot margin trading
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch orders in a portfolio margin account
     * @param {boolean} [params.trigger] set to true if you would like to fetch portfolio margin account trigger or conditional orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchOrders', symbol, since, limit, params);
        }
        const market = this.market(symbol);
        const defaultType = this.safeString2(this.options, 'fetchOrders', 'defaultType', market['type']);
        const type = this.safeString(params, 'type', defaultType);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchOrders', params);
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchOrders', 'papi', 'portfolioMargin', false);
        const isConditional = this.safeBoolN(params, ['stop', 'trigger', 'conditional']);
        params = this.omit(params, ['stop', 'trigger', 'conditional', 'type']);
        let request = {
            'symbol': market['id'],
        };
        [request, params] = this.handleUntilOption('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['option']) {
            response = await this.eapiPrivateGetHistoryOrders(this.extend(request, params));
        }
        else if (market['linear']) {
            if (isPortfolioMargin) {
                if (isConditional) {
                    response = await this.papiGetUmConditionalAllOrders(this.extend(request, params));
                }
                else {
                    response = await this.papiGetUmAllOrders(this.extend(request, params));
                }
            }
            else {
                response = await this.fapiPrivateGetAllOrders(this.extend(request, params));
            }
        }
        else if (market['inverse']) {
            if (isPortfolioMargin) {
                if (isConditional) {
                    response = await this.papiGetCmConditionalAllOrders(this.extend(request, params));
                }
                else {
                    response = await this.papiGetCmAllOrders(this.extend(request, params));
                }
            }
            else {
                response = await this.dapiPrivateGetAllOrders(this.extend(request, params));
            }
        }
        else {
            if (isPortfolioMargin) {
                response = await this.papiGetMarginAllOrders(this.extend(request, params));
            }
            else if (type === 'margin' || marginMode !== undefined) {
                if (marginMode === 'isolated') {
                    request['isIsolated'] = true;
                }
                response = await this.sapiGetMarginAllOrders(this.extend(request, params));
            }
            else {
                response = await this.privateGetAllOrders(this.extend(request, params));
            }
        }
        //
        //  spot
        //
        //     [
        //         {
        //             "symbol": "LTCBTC",
        //             "orderId": 1,
        //             "clientOrderId": "myOrder1",
        //             "price": "0.1",
        //             "origQty": "1.0",
        //             "executedQty": "0.0",
        //             "cummulativeQuoteQty": "0.0",
        //             "status": "NEW",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY",
        //             "stopPrice": "0.0",
        //             "icebergQty": "0.0",
        //             "time": 1499827319559,
        //             "updateTime": 1499827319559,
        //             "isWorking": true
        //         }
        //     ]
        //
        //  futures
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "orderId": 1,
        //             "clientOrderId": "myOrder1",
        //             "price": "0.1",
        //             "origQty": "1.0",
        //             "executedQty": "1.0",
        //             "cumQuote": "10.0",
        //             "status": "NEW",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY",
        //             "stopPrice": "0.0",
        //             "updateTime": 1499827319559
        //         }
        //     ]
        //
        // options
        //
        //     [
        //         {
        //             "orderId": 4728833085436977152,
        //             "symbol": "ETH-230211-1500-C",
        //             "price": "10.0",
        //             "quantity": "1.00",
        //             "executedQty": "0.00",
        //             "fee": "0",
        //             "side": "BUY",
        //             "type": "LIMIT",
        //             "timeInForce": "GTC",
        //             "reduceOnly": false,
        //             "postOnly": false,
        //             "createTime": 1676083034462,
        //             "updateTime": 1676083034462,
        //             "status": "ACCEPTED",
        //             "avgPrice": "0",
        //             "source": "API",
        //             "clientOrderId": "",
        //             "priceScale": 1,
        //             "quantityScale": 2,
        //             "optionSide": "CALL",
        //             "quoteAsset": "USDT",
        //             "lastTrade": {"id":"69","time":"1676084430567","price":"24.9","qty":"1.00"},
        //             "mmp": false
        //         }
        //     ]
        //
        // inverse portfolio margin
        //
        //     [
        //         {
        //             "orderId": 71328442983,
        //             "symbol": "ETHUSD_PERP",
        //             "pair": "ETHUSD",
        //             "status": "CANCELED",
        //             "clientOrderId": "x-xcKtGhcu4b3e3d8515dd4dc5ba9ccc",
        //             "price": "2000",
        //             "avgPrice": "0.00",
        //             "origQty": "1",
        //             "executedQty": "0",
        //             "cumBase": "0",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "reduceOnly": false,
        //             "side": "BUY",
        //             "origType": "LIMIT",
        //             "time": 1707197843046,
        //             "updateTime": 1707197941373,
        //             "positionSide": "BOTH"
        //         },
        //     ]
        //
        // linear portfolio margin
        //
        //     [
        //         {
        //             "orderId": 259235347005,
        //             "symbol": "BTCUSDT",
        //             "status": "CANCELED",
        //             "clientOrderId": "x-xcKtGhcu402881c9103f42bdb4183b",
        //             "price": "35000",
        //             "avgPrice": "0.00000",
        //             "origQty": "0.010",
        //             "executedQty": "0",
        //             "cumQuote": "0",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "reduceOnly": false,
        //             "side": "BUY",
        //             "origType": "LIMIT",
        //             "time": 1707194702167,
        //             "updateTime": 1707197804748,
        //             "positionSide": "BOTH",
        //             "selfTradePreventionMode": "NONE",
        //             "goodTillDate": 0
        //         },
        //     ]
        //
        // conditional portfolio margin
        //
        //     [
        //         {
        //             "newClientStrategyId": "x-xcKtGhcuaf166172ed504cd1bc0396",
        //             "strategyId": 3733211,
        //             "strategyStatus": "CANCELLED",
        //             "strategyType": "STOP",
        //             "origQty": "0.010",
        //             "price": "35000",
        //             "orderId": 0,
        //             "reduceOnly": false,
        //             "side": "BUY",
        //             "positionSide": "BOTH",
        //             "stopPrice": "50000",
        //             "symbol": "BTCUSDT",
        //             "type": "LIMIT",
        //             "bookTime": 1707270098774,
        //             "updateTime": 1707270119261,
        //             "timeInForce": "GTC",
        //             "triggerTime": 0,
        //             "workingType": "CONTRACT_PRICE",
        //             "priceProtect": false,
        //             "goodTillDate": 0,
        //             "selfTradePreventionMode": "NONE"
        //         },
        //     ]
        //
        // spot margin portfolio margin
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "orderId": 24684460474,
        //             "clientOrderId": "x-TKT5PX2Fe9ef29d8346440f0b28b86",
        //             "price": "35000.00000000",
        //             "origQty": "0.00100000",
        //             "executedQty": "0.00000000",
        //             "cummulativeQuoteQty": "0.00000000",
        //             "status": "CANCELED",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY",
        //             "stopPrice": "0.00000000",
        //             "icebergQty": "0.00000000",
        //             "time": 1707113538870,
        //             "updateTime": 1707113797688,
        //             "isWorking": true,
        //             "accountId": 200180970,
        //             "selfTradePreventionMode": "EXPIRE_MAKER",
        //             "preventedMatchId": null,
        //             "preventedQuantity": null
        //         },
        //     ]
        //
        return this.parseOrders(response, market, since, limit);
    }
    /**
     * @method
     * @name binance#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#current-open-orders-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Current-All-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Current-All-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/option/trade/Query-Current-Open-Option-Orders
     * @see https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-UM-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-UM-Open-Conditional-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-CM-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-CM-Open-Conditional-Orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated', for spot margin trading
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch open orders in the portfolio margin account
     * @param {boolean} [params.trigger] set to true if you would like to fetch portfolio margin account conditional orders
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        let type = undefined;
        const request = {};
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchOpenOrders', params);
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchOpenOrders', 'papi', 'portfolioMargin', false);
        const isConditional = this.safeBoolN(params, ['stop', 'trigger', 'conditional']);
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
            const defaultType = this.safeString2(this.options, 'fetchOpenOrders', 'defaultType', 'spot');
            const marketType = ('type' in market) ? market['type'] : defaultType;
            type = this.safeString(params, 'type', marketType);
        }
        else if (this.options['warnOnFetchOpenOrdersWithoutSymbol']) {
            throw new errors.ExchangeError(this.id + ' fetchOpenOrders() WARNING: fetching open orders without specifying a symbol has stricter rate limits (10 times more for spot, 40 times more for other markets) compared to requesting with symbol argument. To acknowledge this warning, set ' + this.id + '.options["warnOnFetchOpenOrdersWithoutSymbol"] = false to suppress this warning message.');
        }
        else {
            const defaultType = this.safeString2(this.options, 'fetchOpenOrders', 'defaultType', 'spot');
            type = this.safeString(params, 'type', defaultType);
        }
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchOpenOrders', market, params);
        params = this.omit(params, ['type', 'stop', 'trigger', 'conditional']);
        let response = undefined;
        if (type === 'option') {
            if (since !== undefined) {
                request['startTime'] = since;
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            response = await this.eapiPrivateGetOpenOrders(this.extend(request, params));
        }
        else if (this.isLinear(type, subType)) {
            if (isPortfolioMargin) {
                if (isConditional) {
                    response = await this.papiGetUmConditionalOpenOrders(this.extend(request, params));
                }
                else {
                    response = await this.papiGetUmOpenOrders(this.extend(request, params));
                }
            }
            else {
                response = await this.fapiPrivateGetOpenOrders(this.extend(request, params));
            }
        }
        else if (this.isInverse(type, subType)) {
            if (isPortfolioMargin) {
                if (isConditional) {
                    response = await this.papiGetCmConditionalOpenOrders(this.extend(request, params));
                }
                else {
                    response = await this.papiGetCmOpenOrders(this.extend(request, params));
                }
            }
            else {
                response = await this.dapiPrivateGetOpenOrders(this.extend(request, params));
            }
        }
        else if (type === 'margin' || marginMode !== undefined || isPortfolioMargin) {
            if (isPortfolioMargin) {
                response = await this.papiGetMarginOpenOrders(this.extend(request, params));
            }
            else {
                if (marginMode === 'isolated') {
                    request['isIsolated'] = true;
                    if (symbol === undefined) {
                        throw new errors.ArgumentsRequired(this.id + ' fetchOpenOrders() requires a symbol argument for isolated markets');
                    }
                }
                response = await this.sapiGetMarginOpenOrders(this.extend(request, params));
            }
        }
        else {
            response = await this.privateGetOpenOrders(this.extend(request, params));
        }
        return this.parseOrders(response, market, since, limit);
    }
    /**
     * @method
     * @name binance#fetchOpenOrder
     * @description fetch an open order by the id
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Query-Current-Open-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Query-Current-Open-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Current-UM-Open-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Current-UM-Open-Conditional-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Current-CM-Open-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Current-CM-Open-Conditional-Order
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.trigger] set to true if you would like to fetch portfolio margin account stop or conditional orders
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch for a portfolio margin account
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOpenOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchOpenOrder', 'papi', 'portfolioMargin', false);
        const isConditional = this.safeBoolN(params, ['stop', 'trigger', 'conditional']);
        params = this.omit(params, ['stop', 'trigger', 'conditional']);
        const isPortfolioMarginConditional = (isPortfolioMargin && isConditional);
        const orderIdRequest = isPortfolioMarginConditional ? 'strategyId' : 'orderId';
        request[orderIdRequest] = id;
        let response = undefined;
        if (market['linear']) {
            if (isPortfolioMargin) {
                if (isConditional) {
                    response = await this.papiGetUmConditionalOpenOrder(this.extend(request, params));
                }
                else {
                    response = await this.papiGetUmOpenOrder(this.extend(request, params));
                }
            }
            else {
                response = await this.fapiPrivateGetOpenOrder(this.extend(request, params));
            }
        }
        else if (market['inverse']) {
            if (isPortfolioMargin) {
                if (isConditional) {
                    response = await this.papiGetCmConditionalOpenOrder(this.extend(request, params));
                }
                else {
                    response = await this.papiGetCmOpenOrder(this.extend(request, params));
                }
            }
            else {
                response = await this.dapiPrivateGetOpenOrder(this.extend(request, params));
            }
        }
        else {
            if (market['option']) {
                throw new errors.NotSupported(this.id + ' fetchOpenOrder() does not support option markets');
            }
            else if (market['spot']) {
                throw new errors.NotSupported(this.id + ' fetchOpenOrder() does not support spot markets');
            }
        }
        //
        // linear swap
        //
        //     {
        //         "orderId": 3697213934,
        //         "symbol": "BTCUSDT",
        //         "status": "NEW",
        //         "clientOrderId": "x-xcKtGhcufb20c5a7761a4aa09aa156",
        //         "price": "33000.00",
        //         "avgPrice": "0.00000",
        //         "origQty": "0.010",
        //         "executedQty": "0.000",
        //         "cumQuote": "0.00000",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "reduceOnly": false,
        //         "closePosition": false,
        //         "side": "BUY",
        //         "positionSide": "BOTH",
        //         "stopPrice": "0.00",
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false,
        //         "origType": "LIMIT",
        //         "priceMatch": "NONE",
        //         "selfTradePreventionMode": "NONE",
        //         "goodTillDate": 0,
        //         "time": 1707892893502,
        //         "updateTime": 1707892893515
        //     }
        //
        // inverse swap
        //
        //     {
        //         "orderId": 597368542,
        //         "symbol": "BTCUSD_PERP",
        //         "pair": "BTCUSD",
        //         "status": "NEW",
        //         "clientOrderId": "x-xcKtGhcubbde7ba93b1a4ab881eff3",
        //         "price": "35000",
        //         "avgPrice": "0",
        //         "origQty": "1",
        //         "executedQty": "0",
        //         "cumBase": "0",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "reduceOnly": false,
        //         "closePosition": false,
        //         "side": "BUY",
        //         "positionSide": "BOTH",
        //         "stopPrice": "0",
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false,
        //         "origType": "LIMIT",
        //         "time": 1707893453199,
        //         "updateTime": 1707893453199
        //     }
        //
        // linear portfolio margin
        //
        //     {
        //         "orderId": 264895013409,
        //         "symbol": "BTCUSDT",
        //         "status": "NEW",
        //         "clientOrderId": "x-xcKtGhcu6278f1adbdf14f74ab432e",
        //         "price": "35000",
        //         "avgPrice": "0",
        //         "origQty": "0.010",
        //         "executedQty": "0",
        //         "cumQuote": "0",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "reduceOnly": false,
        //         "side": "BUY",
        //         "positionSide": "LONG",
        //         "origType": "LIMIT",
        //         "time": 1707893839364,
        //         "updateTime": 1707893839364,
        //         "goodTillDate": 0,
        //         "selfTradePreventionMode": "NONE"
        //     }
        //
        // inverse portfolio margin
        //
        //     {
        //         "orderId": 71790316950,
        //         "symbol": "ETHUSD_PERP",
        //         "pair": "ETHUSD",
        //         "status": "NEW",
        //         "clientOrderId": "x-xcKtGhcuec11030474204ab08ba2c2",
        //         "price": "2500",
        //         "avgPrice": "0",
        //         "origQty": "1",
        //         "executedQty": "0",
        //         "cumBase": "0",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "reduceOnly": false,
        //         "side": "BUY",
        //         "positionSide": "LONG",
        //         "origType": "LIMIT",
        //         "time": 1707894181694,
        //         "updateTime": 1707894181694
        //     }
        //
        // linear portfolio margin conditional
        //
        //     {
        //         "newClientStrategyId": "x-xcKtGhcu2205fde44418483ca21874",
        //         "strategyId": 4084339,
        //         "strategyStatus": "NEW",
        //         "strategyType": "STOP",
        //         "origQty": "0.010",
        //         "price": "35000",
        //         "reduceOnly": false,
        //         "side": "BUY",
        //         "positionSide": "LONG",
        //         "stopPrice": "60000",
        //         "symbol": "BTCUSDT",
        //         "bookTime": 1707894490094,
        //         "updateTime": 1707894490094,
        //         "timeInForce": "GTC",
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false,
        //         "goodTillDate": 0,
        //         "selfTradePreventionMode": "NONE"
        //     }
        //
        // inverse portfolio margin conditional
        //
        //     {
        //         "newClientStrategyId": "x-xcKtGhcu2da9c765294b433994ffce",
        //         "strategyId": 1423501,
        //         "strategyStatus": "NEW",
        //         "strategyType": "STOP",
        //         "origQty": "1",
        //         "price": "2500",
        //         "reduceOnly": false,
        //         "side": "BUY",
        //         "positionSide": "LONG",
        //         "stopPrice": "4000",
        //         "symbol": "ETHUSD_PERP",
        //         "bookTime": 1707894782679,
        //         "updateTime": 1707894782679,
        //         "timeInForce": "GTC",
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false
        //     }
        //
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name binance#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#all-orders-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/All-Orders
     * @see https://developers.binance.com/docs/derivatives/option/trade/Query-Option-Order-History
     * @see https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch orders in a portfolio margin account
     * @param {boolean} [params.trigger] set to true if you would like to fetch portfolio margin account trigger or conditional orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        const orders = await this.fetchOrders(symbol, since, undefined, params);
        const filteredOrders = this.filterBy(orders, 'status', 'closed');
        return this.filterBySinceLimit(filteredOrders, since, limit);
    }
    /**
     * @method
     * @name binance#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#all-orders-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/All-Orders
     * @see https://developers.binance.com/docs/derivatives/option/trade/Query-Option-Order-History
     * @see https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch orders in a portfolio margin account
     * @param {boolean} [params.trigger] set to true if you would like to fetch portfolio margin account trigger or conditional orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchCanceledOrders() requires a symbol argument');
        }
        const orders = await this.fetchOrders(symbol, since, undefined, params);
        const filteredOrders = this.filterBy(orders, 'status', 'canceled');
        return this.filterBySinceLimit(filteredOrders, since, limit);
    }
    /**
     * @method
     * @name binance#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#all-orders-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/All-Orders
     * @see https://developers.binance.com/docs/derivatives/option/trade/Query-Option-Order-History
     * @see https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch orders in a portfolio margin account
     * @param {boolean} [params.trigger] set to true if you would like to fetch portfolio margin account trigger or conditional orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledAndClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchCanceledAndClosedOrders() requires a symbol argument');
        }
        const orders = await this.fetchOrders(symbol, since, undefined, params);
        const canceledOrders = this.filterBy(orders, 'status', 'canceled');
        const closedOrders = this.filterBy(orders, 'status', 'closed');
        const filteredOrders = this.arrayConcat(canceledOrders, closedOrders);
        const sortedOrders = this.sortBy(filteredOrders, 'timestamp');
        return this.filterBySinceLimit(sortedOrders, since, limit);
    }
    /**
     * @method
     * @name binance#cancelOrder
     * @description cancels an open order
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#cancel-order-trade
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Cancel-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Cancel-Order
     * @see https://developers.binance.com/docs/derivatives/option/trade/Cancel-Option-Order
     * @see https://developers.binance.com/docs/margin_trading/trade/Margin-Account-Cancel-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-UM-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-CM-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-UM-Conditional-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-CM-Conditional-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-Margin-Account-Order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to cancel an order in a portfolio margin account
     * @param {boolean} [params.trigger] set to true if you would like to cancel a portfolio margin account conditional order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const defaultType = this.safeString2(this.options, 'cancelOrder', 'defaultType', 'spot');
        const type = this.safeString(params, 'type', defaultType);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('cancelOrder', params);
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'cancelOrder', 'papi', 'portfolioMargin', false);
        const isConditional = this.safeBoolN(params, ['stop', 'trigger', 'conditional']);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeStringN(params, ['origClientOrderId', 'clientOrderId', 'newClientStrategyId']);
        if (clientOrderId !== undefined) {
            if (market['option']) {
                request['clientOrderId'] = clientOrderId;
            }
            else {
                if (isPortfolioMargin && isConditional) {
                    request['newClientStrategyId'] = clientOrderId;
                }
                else {
                    request['origClientOrderId'] = clientOrderId;
                }
            }
        }
        else {
            if (isPortfolioMargin && isConditional) {
                request['strategyId'] = id;
            }
            else {
                request['orderId'] = id;
            }
        }
        params = this.omit(params, ['type', 'origClientOrderId', 'clientOrderId', 'newClientStrategyId', 'stop', 'trigger', 'conditional']);
        let response = undefined;
        if (market['option']) {
            response = await this.eapiPrivateDeleteOrder(this.extend(request, params));
        }
        else if (market['linear']) {
            if (isPortfolioMargin) {
                if (isConditional) {
                    response = await this.papiDeleteUmConditionalOrder(this.extend(request, params));
                }
                else {
                    response = await this.papiDeleteUmOrder(this.extend(request, params));
                }
            }
            else {
                response = await this.fapiPrivateDeleteOrder(this.extend(request, params));
            }
        }
        else if (market['inverse']) {
            if (isPortfolioMargin) {
                if (isConditional) {
                    response = await this.papiDeleteCmConditionalOrder(this.extend(request, params));
                }
                else {
                    response = await this.papiDeleteCmOrder(this.extend(request, params));
                }
            }
            else {
                response = await this.dapiPrivateDeleteOrder(this.extend(request, params));
            }
        }
        else if ((type === 'margin') || (marginMode !== undefined) || isPortfolioMargin) {
            if (isPortfolioMargin) {
                response = await this.papiDeleteMarginOrder(this.extend(request, params));
            }
            else {
                if (marginMode === 'isolated') {
                    request['isIsolated'] = true;
                }
                response = await this.sapiDeleteMarginOrder(this.extend(request, params));
            }
        }
        else {
            response = await this.privateDeleteOrder(this.extend(request, params));
        }
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name binance#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#cancel-all-open-orders-on-a-symbol-trade
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Cancel-All-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Cancel-All-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/option/trade/Cancel-all-Option-orders-on-specific-symbol
     * @see https://developers.binance.com/docs/margin_trading/trade/Margin-Account-Cancel-All-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-All-UM-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-All-UM-Open-Conditional-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-All-CM-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-All-CM-Open-Conditional-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-Margin-Account-All-Open-Orders-on-a-Symbol
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated', for spot margin trading
     * @param {boolean} [params.portfolioMargin] set to true if you would like to cancel orders in a portfolio margin account
     * @param {boolean} [params.trigger] set to true if you would like to cancel portfolio margin account conditional orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'cancelAllOrders', 'papi', 'portfolioMargin', false);
        const isConditional = this.safeBoolN(params, ['stop', 'trigger', 'conditional']);
        const type = this.safeString(params, 'type', market['type']);
        params = this.omit(params, ['type', 'stop', 'trigger', 'conditional']);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('cancelAllOrders', params);
        let response = undefined;
        if (market['option']) {
            response = await this.eapiPrivateDeleteAllOpenOrders(this.extend(request, params));
            //
            //    {
            //        "code": 0,
            //        "msg": "success"
            //    }
            //
        }
        else if (market['linear']) {
            if (isPortfolioMargin) {
                if (isConditional) {
                    response = await this.papiDeleteUmConditionalAllOpenOrders(this.extend(request, params));
                    //
                    //    {
                    //        "code": "200",
                    //        "msg": "The operation of cancel all conditional open order is done."
                    //    }
                    //
                }
                else {
                    response = await this.papiDeleteUmAllOpenOrders(this.extend(request, params));
                    //
                    //    {
                    //        "code": 200,
                    //        "msg": "The operation of cancel all open order is done."
                    //    }
                    //
                }
            }
            else {
                response = await this.fapiPrivateDeleteAllOpenOrders(this.extend(request, params));
                //
                //    {
                //        "code": 200,
                //        "msg": "The operation of cancel all open order is done."
                //    }
                //
            }
        }
        else if (market['inverse']) {
            if (isPortfolioMargin) {
                if (isConditional) {
                    response = await this.papiDeleteCmConditionalAllOpenOrders(this.extend(request, params));
                    //
                    //    {
                    //        "code": "200",
                    //        "msg": "The operation of cancel all conditional open order is done."
                    //    }
                    //
                }
                else {
                    response = await this.papiDeleteCmAllOpenOrders(this.extend(request, params));
                    //
                    //    {
                    //        "code": 200,
                    //        "msg": "The operation of cancel all open order is done."
                    //    }
                    //
                }
            }
            else {
                response = await this.dapiPrivateDeleteAllOpenOrders(this.extend(request, params));
                //
                //    {
                //        "code": 200,
                //        "msg": "The operation of cancel all open order is done."
                //    }
                //
            }
        }
        else if ((type === 'margin') || (marginMode !== undefined) || isPortfolioMargin) {
            if (isPortfolioMargin) {
                response = await this.papiDeleteMarginAllOpenOrders(this.extend(request, params));
            }
            else {
                if (marginMode === 'isolated') {
                    request['isIsolated'] = true;
                }
                response = await this.sapiDeleteMarginOpenOrders(this.extend(request, params));
                //
                //    [
                //        {
                //          "symbol": "BTCUSDT",
                //          "isIsolated": true,       // if isolated margin
                //          "origClientOrderId": "E6APeyTJvkMvLMYMqu1KQ4",
                //          "orderId": 11,
                //          "orderListId": -1,
                //          "clientOrderId": "pXLV6Hz6mprAcVYpVMTGgx",
                //          "price": "0.089853",
                //          "origQty": "0.178622",
                //          "executedQty": "0.000000",
                //          "cummulativeQuoteQty": "0.000000",
                //          "status": "CANCELED",
                //          "timeInForce": "GTC",
                //          "type": "LIMIT",
                //          "side": "BUY",
                //          "selfTradePreventionMode": "NONE"
                //        },
                //        ...
                //    ]
                //
            }
        }
        else {
            response = await this.privateDeleteOpenOrders(this.extend(request, params));
            //
            //    [
            //        {
            //            "symbol": "ADAUSDT",
            //            "origClientOrderId": "x-TKT5PX2F662cde7a90114475b86e21",
            //            "orderId": 3935107,
            //            "orderListId": -1,
            //            "clientOrderId": "bqM2w1oTlugfRAjnTIFBE8",
            //            "transactTime": 1720589016657,
            //            "price": "0.35000000",
            //            "origQty": "30.00000000",
            //            "executedQty": "0.00000000",
            //            "cummulativeQuoteQty": "0.00000000",
            //            "status": "CANCELED",
            //            "timeInForce": "GTC",
            //            "type": "LIMIT",
            //            "side": "BUY",
            //            "selfTradePreventionMode": "EXPIRE_MAKER"
            //        }
            //    ]
            //
        }
        if (Array.isArray(response)) {
            return this.parseOrders(response, market);
        }
        else {
            return [
                this.safeOrder({
                    'info': response,
                }),
            ];
        }
    }
    /**
     * @method
     * @name binance#cancelOrders
     * @description cancel multiple orders
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Cancel-Multiple-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Cancel-Multiple-Orders
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] alternative to ids, array of client order ids
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string[]} [params.origClientOrderIdList] max length 10 e.g. ["my_id_1","my_id_2"], encode the double quotes. No space after comma
     * @param {int[]} [params.recvWindow]
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['contract']) {
            throw new errors.BadRequest(this.id + ' cancelOrders is only supported for swap markets.');
        }
        const request = {
            'symbol': market['id'],
            // 'orderidlist': ids,
        };
        const origClientOrderIdList = this.safeList2(params, 'origClientOrderIdList', 'clientOrderIds');
        if (origClientOrderIdList !== undefined) {
            params = this.omit(params, ['clientOrderIds']);
            request['origClientOrderIdList'] = origClientOrderIdList;
        }
        else {
            request['orderidlist'] = ids;
        }
        let response = undefined;
        if (market['linear']) {
            response = await this.fapiPrivateDeleteBatchOrders(this.extend(request, params));
        }
        else if (market['inverse']) {
            response = await this.dapiPrivateDeleteBatchOrders(this.extend(request, params));
        }
        //
        //    [
        //        {
        //            "clientOrderId": "myOrder1",
        //            "cumQty": "0",
        //            "cumQuote": "0",
        //            "executedQty": "0",
        //            "orderId": 283194212,
        //            "origQty": "11",
        //            "origType": "TRAILING_STOP_MARKET",
        //            "price": "0",
        //            "reduceOnly": false,
        //            "side": "BUY",
        //            "positionSide": "SHORT",
        //            "status": "CANCELED",
        //            "stopPrice": "9300",                  // please ignore when order type is TRAILING_STOP_MARKET
        //            "closePosition": false,               // if Close-All
        //            "symbol": "BTCUSDT",
        //            "timeInForce": "GTC",
        //            "type": "TRAILING_STOP_MARKET",
        //            "activatePrice": "9020",              // activation price, only return with TRAILING_STOP_MARKET order
        //            "priceRate": "0.3",                   // callback rate, only return with TRAILING_STOP_MARKET order
        //            "updateTime": 1571110484038,
        //            "workingType": "CONTRACT_PRICE",
        //            "priceProtect": false,                // if conditional order trigger is protected
        //            "priceMatch": "NONE",                 // price match mode
        //            "selfTradePreventionMode": "NONE",    // self trading preventation mode
        //            "goodTillDate": 0                     // order pre-set auot cancel time for TIF GTD order
        //        },
        //        {
        //            "code": -2011,
        //            "msg": "Unknown order sent."
        //        }
        //    ]
        //
        return this.parseOrders(response, market);
    }
    /**
     * @method
     * @name binance#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/account-endpoints#account-trade-list-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Account-Trade-List
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Account-Trade-List
     * @see https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Trade-List
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrderTrades() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const type = this.safeString(params, 'type', market['type']);
        params = this.omit(params, 'type');
        if (type !== 'spot') {
            throw new errors.NotSupported(this.id + ' fetchOrderTrades() supports spot markets only');
        }
        const request = {
            'orderId': id,
        };
        return await this.fetchMyTrades(symbol, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name binance#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/account-endpoints#account-trade-list-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Account-Trade-List
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Account-Trade-List
     * @see https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Trade-List
     * @see https://developers.binance.com/docs/derivatives/option/trade/Account-Trade-List
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/UM-Account-Trade-List
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/CM-Account-Trade-List
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch trades for a portfolio margin account
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchMyTrades', symbol, since, limit, params);
        }
        const request = {};
        let market = undefined;
        let type = undefined;
        let marginMode = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        [type, params] = this.handleMarketTypeAndParams('fetchMyTrades', market, params);
        let endTime = this.safeInteger2(params, 'until', 'endTime');
        if (since !== undefined) {
            const startTime = since;
            request['startTime'] = startTime;
            // If startTime and endTime are both not sent, then the last 7 days' data will be returned.
            // The time between startTime and endTime cannot be longer than 7 days.
            // The parameter fromId cannot be sent with startTime or endTime.
            const currentTimestamp = this.milliseconds();
            const oneWeek = 7 * 24 * 60 * 60 * 1000;
            if ((currentTimestamp - startTime) >= oneWeek) {
                if ((endTime === undefined) && market['linear']) {
                    endTime = this.sum(startTime, oneWeek);
                    endTime = Math.min(endTime, currentTimestamp);
                }
            }
        }
        if (endTime !== undefined) {
            request['endTime'] = endTime;
            params = this.omit(params, ['endTime', 'until']);
        }
        if (limit !== undefined) {
            if ((type === 'option') || market['contract']) {
                limit = Math.min(limit, 1000); // above 1000, returns error
            }
            request['limit'] = limit;
        }
        let response = undefined;
        if (type === 'option') {
            response = await this.eapiPrivateGetUserTrades(this.extend(request, params));
        }
        else {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchMyTrades() requires a symbol argument');
            }
            [marginMode, params] = this.handleMarginModeAndParams('fetchMyTrades', params);
            let isPortfolioMargin = undefined;
            [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchMyTrades', 'papi', 'portfolioMargin', false);
            if (type === 'spot' || type === 'margin') {
                if (isPortfolioMargin) {
                    response = await this.papiGetMarginMyTrades(this.extend(request, params));
                }
                else if ((type === 'margin') || (marginMode !== undefined)) {
                    if (marginMode === 'isolated') {
                        request['isIsolated'] = true;
                    }
                    response = await this.sapiGetMarginMyTrades(this.extend(request, params));
                }
                else {
                    response = await this.privateGetMyTrades(this.extend(request, params));
                }
            }
            else if (market['linear']) {
                if (isPortfolioMargin) {
                    response = await this.papiGetUmUserTrades(this.extend(request, params));
                }
                else {
                    response = await this.fapiPrivateGetUserTrades(this.extend(request, params));
                }
            }
            else if (market['inverse']) {
                if (isPortfolioMargin) {
                    response = await this.papiGetCmUserTrades(this.extend(request, params));
                }
                else {
                    response = await this.dapiPrivateGetUserTrades(this.extend(request, params));
                }
            }
        }
        //
        // spot trade
        //
        //     [
        //         {
        //             "symbol": "BNBBTC",
        //             "id": 28457,
        //             "orderId": 100234,
        //             "price": "4.00000100",
        //             "qty": "12.00000000",
        //             "commission": "10.10000000",
        //             "commissionAsset": "BNB",
        //             "time": 1499865549590,
        //             "isBuyer": true,
        //             "isMaker": false,
        //             "isBestMatch": true,
        //         }
        //     ]
        //
        // futures trade
        //
        //     [
        //         {
        //             "accountId": 20,
        //             "buyer": False,
        //             "commission": "-0.07819010",
        //             "commissionAsset": "USDT",
        //             "counterPartyId": 653,
        //             "id": 698759,
        //             "maker": False,
        //             "orderId": 25851813,
        //             "price": "7819.01",
        //             "qty": "0.002",
        //             "quoteQty": "0.01563",
        //             "realizedPnl": "-0.91539999",
        //             "side": "SELL",
        //             "symbol": "BTCUSDT",
        //             "time": 1569514978020
        //         }
        //     ]
        //
        // options (eapi)
        //
        //     [
        //         {
        //             "id": 1125899906844226012,
        //             "tradeId": 73,
        //             "orderId": 4638761100843040768,
        //             "symbol": "ETH-230211-1500-C",
        //             "price": "18.70000000",
        //             "quantity": "-0.57000000",
        //             "fee": "0.17305890",
        //             "realizedProfit": "-3.53400000",
        //             "side": "SELL",
        //             "type": "LIMIT",
        //             "volatility": "0.30000000",
        //             "liquidity": "MAKER",
        //             "time": 1676085216845,
        //             "priceScale": 1,
        //             "quantityScale": 2,
        //             "optionSide": "CALL",
        //             "quoteAsset": "USDT"
        //         }
        //     ]
        //
        // linear portfolio margin
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "id": 4575108247,
        //             "orderId": 261942655610,
        //             "side": "SELL",
        //             "price": "47263.40",
        //             "qty": "0.010",
        //             "realizedPnl": "27.38400000",
        //             "marginAsset": "USDT",
        //             "quoteQty": "472.63",
        //             "commission": "0.18905360",
        //             "commissionAsset": "USDT",
        //             "time": 1707530039409,
        //             "buyer": false,
        //             "maker": false,
        //             "positionSide": "LONG"
        //         }
        //     ]
        //
        // inverse portfolio margin
        //
        //     [
        //         {
        //             "symbol": "ETHUSD_PERP",
        //             "id": 701907838,
        //             "orderId": 71548909034,
        //             "pair": "ETHUSD",
        //             "side": "SELL",
        //             "price": "2498.15",
        //             "qty": "1",
        //             "realizedPnl": "0.00012517",
        //             "marginAsset": "ETH",
        //             "baseQty": "0.00400296",
        //             "commission": "0.00000160",
        //             "commissionAsset": "ETH",
        //             "time": 1707530317519,
        //             "positionSide": "LONG",
        //             "buyer": false,
        //             "maker": false
        //         }
        //     ]
        //
        // spot margin portfolio margin
        //
        //     [
        //         {
        //             "symbol": "ADAUSDT",
        //             "id": 470227543,
        //             "orderId": 4421170947,
        //             "price": "0.53880000",
        //             "qty": "10.00000000",
        //             "quoteQty": "5.38800000",
        //             "commission": "0.00538800",
        //             "commissionAsset": "USDT",
        //             "time": 1707545780522,
        //             "isBuyer": false,
        //             "isMaker": false,
        //             "isBestMatch": true
        //         }
        //     ]
        //
        return this.parseTrades(response, market, since, limit);
    }
    /**
     * @method
     * @name binance#fetchMyDustTrades
     * @description fetch all dust trades made by the user
     * @see https://developers.binance.com/docs/wallet/asset/dust-log
     * @param {string} symbol not used by binance fetchMyDustTrades ()
     * @param {int} [since] the earliest time in ms to fetch my dust trades for
     * @param {int} [limit] the maximum number of dust trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'margin', default spot
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyDustTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        //
        // Binance provides an opportunity to trade insignificant (i.e. non-tradable and non-withdrawable)
        // token leftovers (of any asset) into `BNB` coin which in turn can be used to pay trading fees with it.
        // The corresponding trades history is called the `Dust Log` and can be requested via the following end-point:
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/wapi-api.md#dustlog-user_data
        //
        await this.loadMarkets();
        const request = {};
        if (since !== undefined) {
            request['startTime'] = since;
            request['endTime'] = this.sum(since, 7776000000);
        }
        const accountType = this.safeStringUpper(params, 'type');
        params = this.omit(params, 'type');
        if (accountType !== undefined) {
            request['accountType'] = accountType;
        }
        const response = await this.sapiGetAssetDribblet(this.extend(request, params));
        //     {
        //       "total": "4",
        //       "userAssetDribblets": [
        //         {
        //           "operateTime": "1627575731000",
        //           "totalServiceChargeAmount": "0.00001453",
        //           "totalTransferedAmount": "0.00072693",
        //           "transId": "70899815863",
        //           "userAssetDribbletDetails": [
        //             {
        //               "fromAsset": "LTC",
        //               "amount": "0.000006",
        //               "transferedAmount": "0.00000267",
        //               "serviceChargeAmount": "0.00000005",
        //               "operateTime": "1627575731000",
        //               "transId": "70899815863"
        //             },
        //             {
        //               "fromAsset": "GBP",
        //               "amount": "0.15949157",
        //               "transferedAmount": "0.00072426",
        //               "serviceChargeAmount": "0.00001448",
        //               "operateTime": "1627575731000",
        //               "transId": "70899815863"
        //             }
        //           ]
        //         },
        //       ]
        //     }
        const results = this.safeList(response, 'userAssetDribblets', []);
        const rows = this.safeInteger(response, 'total', 0);
        const data = [];
        for (let i = 0; i < rows; i++) {
            const logs = this.safeList(results[i], 'userAssetDribbletDetails', []);
            for (let j = 0; j < logs.length; j++) {
                logs[j]['isDustTrade'] = true;
                data.push(logs[j]);
            }
        }
        const trades = this.parseTrades(data, undefined, since, limit);
        return this.filterBySinceLimit(trades, since, limit);
    }
    parseDustTrade(trade, market = undefined) {
        //
        //     {
        //       "fromAsset": "USDT",
        //       "amount": "0.009669",
        //       "transferedAmount": "0.00002992",
        //       "serviceChargeAmount": "0.00000059",
        //       "operateTime": "1628076010000",
        //       "transId": "71416578712",
        //       "isDustTrade": true
        //     }
        //
        const orderId = this.safeString(trade, 'transId');
        const timestamp = this.safeInteger(trade, 'operateTime');
        const currencyId = this.safeString(trade, 'fromAsset');
        const tradedCurrency = this.safeCurrencyCode(currencyId);
        const bnb = this.currency('BNB');
        const earnedCurrency = bnb['code'];
        const applicantSymbol = earnedCurrency + '/' + tradedCurrency;
        let tradedCurrencyIsQuote = false;
        if (applicantSymbol in this.markets) {
            tradedCurrencyIsQuote = true;
        }
        const feeCostString = this.safeString(trade, 'serviceChargeAmount');
        const fee = {
            'currency': earnedCurrency,
            'cost': this.parseNumber(feeCostString),
        };
        let symbol = undefined;
        let amountString = undefined;
        let costString = undefined;
        let side = undefined;
        if (tradedCurrencyIsQuote) {
            symbol = applicantSymbol;
            amountString = this.safeString(trade, 'transferedAmount');
            costString = this.safeString(trade, 'amount');
            side = 'buy';
        }
        else {
            symbol = tradedCurrency + '/' + earnedCurrency;
            amountString = this.safeString(trade, 'amount');
            costString = this.safeString(trade, 'transferedAmount');
            side = 'sell';
        }
        let priceString = undefined;
        if (costString !== undefined) {
            if (amountString) {
                priceString = Precise["default"].stringDiv(costString, amountString);
            }
        }
        const id = undefined;
        const amount = this.parseNumber(amountString);
        const price = this.parseNumber(priceString);
        const cost = this.parseNumber(costString);
        const type = undefined;
        const takerOrMaker = undefined;
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'amount': amount,
            'price': price,
            'cost': cost,
            'fee': fee,
            'info': trade,
        };
    }
    /**
     * @method
     * @name binance#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://developers.binance.com/docs/wallet/capital/deposite-history
     * @see https://developers.binance.com/docs/fiat/rest-api/Get-Fiat-Deposit-Withdraw-History
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.fiat] if true, only fiat deposits will be returned
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchDeposits', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchDeposits', code, since, limit, params);
        }
        let currency = undefined;
        let response = undefined;
        const request = {};
        const legalMoney = this.safeDict(this.options, 'legalMoney', {});
        const fiatOnly = this.safeBool(params, 'fiat', false);
        params = this.omit(params, 'fiatOnly');
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, 'until');
        if (fiatOnly || (code in legalMoney)) {
            if (code !== undefined) {
                currency = this.currency(code);
            }
            request['transactionType'] = 0;
            if (since !== undefined) {
                request['beginTime'] = since;
            }
            if (until !== undefined) {
                request['endTime'] = until;
            }
            const raw = await this.sapiGetFiatOrders(this.extend(request, params));
            response = this.safeList(raw, 'data', []);
            //     {
            //       "code": "000000",
            //       "message": "success",
            //       "data": [
            //         {
            //           "orderNo": "25ced37075c1470ba8939d0df2316e23",
            //           "fiatCurrency": "EUR",
            //           "indicatedAmount": "15.00",
            //           "amount": "15.00",
            //           "totalFee": "0.00",
            //           "method": "card",
            //           "status": "Failed",
            //           "createTime": 1627501026000,
            //           "updateTime": 1627501027000
            //         }
            //       ],
            //       "total": 1,
            //       "success": true
            //     }
        }
        else {
            if (code !== undefined) {
                currency = this.currency(code);
                request['coin'] = currency['id'];
            }
            if (since !== undefined) {
                request['startTime'] = since;
                // max 3 months range https://github.com/ccxt/ccxt/issues/6495
                let endTime = this.sum(since, 7776000000);
                if (until !== undefined) {
                    endTime = Math.min(endTime, until);
                }
                request['endTime'] = endTime;
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            response = await this.sapiGetCapitalDepositHisrec(this.extend(request, params));
            //     [
            //       {
            //         "amount": "0.01844487",
            //         "coin": "BCH",
            //         "network": "BCH",
            //         "status": 1,
            //         "address": "1NYxAJhW2281HK1KtJeaENBqHeygA88FzR",
            //         "addressTag": "",
            //         "txId": "bafc5902504d6504a00b7d0306a41154cbf1d1b767ab70f3bc226327362588af",
            //         "insertTime": 1610784980000,
            //         "transferType": 0,
            //         "confirmTimes": "2/2"
            //       },
            //       {
            //         "amount": "4500",
            //         "coin": "USDT",
            //         "network": "BSC",
            //         "status": 1,
            //         "address": "0xc9c923c87347ca0f3451d6d308ce84f691b9f501",
            //         "addressTag": "",
            //         "txId": "Internal transfer 51376627901",
            //         "insertTime": 1618394381000,
            //         "transferType": 1,
            //         "confirmTimes": "1/15"
            //     }
            //   ]
        }
        for (let i = 0; i < response.length; i++) {
            response[i]['type'] = 'deposit';
        }
        return this.parseTransactions(response, currency, since, limit);
    }
    /**
     * @method
     * @name binance#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://developers.binance.com/docs/wallet/capital/withdraw-history
     * @see https://developers.binance.com/docs/fiat/rest-api/Get-Fiat-Deposit-Withdraw-History
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.fiat] if true, only fiat withdrawals will be returned
     * @param {int} [params.until] the latest time in ms to fetch withdrawals for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchWithdrawals', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchWithdrawals', code, since, limit, params);
        }
        const legalMoney = this.safeDict(this.options, 'legalMoney', {});
        const fiatOnly = this.safeBool(params, 'fiat', false);
        params = this.omit(params, 'fiatOnly');
        const request = {};
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, 'until');
            request['endTime'] = until;
        }
        let response = undefined;
        let currency = undefined;
        if (fiatOnly || (code in legalMoney)) {
            if (code !== undefined) {
                currency = this.currency(code);
            }
            request['transactionType'] = 1;
            if (since !== undefined) {
                request['beginTime'] = since;
            }
            const raw = await this.sapiGetFiatOrders(this.extend(request, params));
            response = this.safeList(raw, 'data', []);
            //     {
            //       "code": "000000",
            //       "message": "success",
            //       "data": [
            //         {
            //           "orderNo": "CJW706452266115170304",
            //           "fiatCurrency": "GBP",
            //           "indicatedAmount": "10001.50",
            //           "amount": "100.00",
            //           "totalFee": "1.50",
            //           "method": "bank transfer",
            //           "status": "Successful",
            //           "createTime": 1620037745000,
            //           "updateTime": 1620038480000
            //         },
            //         {
            //           "orderNo": "CJW706287492781891584",
            //           "fiatCurrency": "GBP",
            //           "indicatedAmount": "10001.50",
            //           "amount": "100.00",
            //           "totalFee": "1.50",
            //           "method": "bank transfer",
            //           "status": "Successful",
            //           "createTime": 1619998460000,
            //           "updateTime": 1619998823000
            //         }
            //       ],
            //       "total": 39,
            //       "success": true
            //     }
        }
        else {
            if (code !== undefined) {
                currency = this.currency(code);
                request['coin'] = currency['id'];
            }
            if (since !== undefined) {
                request['startTime'] = since;
                // max 3 months range https://github.com/ccxt/ccxt/issues/6495
                request['endTime'] = this.sum(since, 7776000000);
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            response = await this.sapiGetCapitalWithdrawHistory(this.extend(request, params));
            //     [
            //       {
            //         "id": "69e53ad305124b96b43668ceab158a18",
            //         "amount": "28.75",
            //         "transactionFee": "0.25",
            //         "coin": "XRP",
            //         "status": 6,
            //         "address": "r3T75fuLjX51mmfb5Sk1kMNuhBgBPJsjza",
            //         "addressTag": "101286922",
            //         "txId": "19A5B24ED0B697E4F0E9CD09FCB007170A605BC93C9280B9E6379C5E6EF0F65A",
            //         "applyTime": "2021-04-15 12:09:16",
            //         "network": "XRP",
            //         "transferType": 0
            //       },
            //       {
            //         "id": "9a67628b16ba4988ae20d329333f16bc",
            //         "amount": "20",
            //         "transactionFee": "20",
            //         "coin": "USDT",
            //         "status": 6,
            //         "address": "0x0AB991497116f7F5532a4c2f4f7B1784488628e1",
            //         "txId": "0x77fbf2cf2c85b552f0fd31fd2e56dc95c08adae031d96f3717d8b17e1aea3e46",
            //         "applyTime": "2021-04-15 12:06:53",
            //         "network": "ETH",
            //         "transferType": 0
            //       },
            //       {
            //         "id": "a7cdc0afbfa44a48bd225c9ece958fe2",
            //         "amount": "51",
            //         "transactionFee": "1",
            //         "coin": "USDT",
            //         "status": 6,
            //         "address": "TYDmtuWL8bsyjvcauUTerpfYyVhFtBjqyo",
            //         "txId": "168a75112bce6ceb4823c66726ad47620ad332e69fe92d9cb8ceb76023f9a028",
            //         "applyTime": "2021-04-13 12:46:59",
            //         "network": "TRX",
            //         "transferType": 0
            //       }
            //     ]
        }
        for (let i = 0; i < response.length; i++) {
            response[i]['type'] = 'withdrawal';
        }
        return this.parseTransactions(response, currency, since, limit);
    }
    parseTransactionStatusByType(status, type = undefined) {
        if (type === undefined) {
            return status;
        }
        const statusesByType = {
            'deposit': {
                '0': 'pending',
                '1': 'ok',
                '6': 'ok',
                // Fiat
                // Processing, Failed, Successful, Finished, Refunding, Refunded, Refund Failed, Order Partial credit Stopped
                'Processing': 'pending',
                'Failed': 'failed',
                'Successful': 'ok',
                'Refunding': 'canceled',
                'Refunded': 'canceled',
                'Refund Failed': 'failed',
            },
            'withdrawal': {
                '0': 'pending',
                '1': 'canceled',
                '2': 'pending',
                '3': 'failed',
                '4': 'pending',
                '5': 'failed',
                '6': 'ok',
                // Fiat
                // Processing, Failed, Successful, Finished, Refunding, Refunded, Refund Failed, Order Partial credit Stopped
                'Processing': 'pending',
                'Failed': 'failed',
                'Successful': 'ok',
                'Refunding': 'canceled',
                'Refunded': 'canceled',
                'Refund Failed': 'failed',
            },
        };
        const statuses = this.safeDict(statusesByType, type, {});
        return this.safeString(statuses, status, status);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //       "amount": "4500",
        //       "coin": "USDT",
        //       "network": "BSC",
        //       "status": 1,
        //       "address": "0xc9c923c87347ca0f3451d6d308ce84f691b9f501",
        //       "addressTag": "",
        //       "txId": "Internal transfer 51376627901",
        //       "insertTime": 1618394381000,
        //       "transferType": 1,
        //       "confirmTimes": "1/15"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //       "id": "69e53ad305124b96b43668ceab158a18",
        //       "amount": "28.75",
        //       "transactionFee": "0.25",
        //       "coin": "XRP",
        //       "status": 6,
        //       "address": "r3T75fuLjX51mmfb5Sk1kMNuhBgBPJsjza",
        //       "addressTag": "101286922",
        //       "txId": "19A5B24ED0B697E4F0E9CD09FCB007170A605BC93C9280B9E6379C5E6EF0F65A",
        //       "applyTime": "2021-04-15 12:09:16",
        //       "network": "XRP",
        //       "transferType": 0
        //     }
        //
        // fiat transaction
        // withdraw
        //     {
        //       "orderNo": "CJW684897551397171200",
        //       "fiatCurrency": "GBP",
        //       "indicatedAmount": "29.99",
        //       "amount": "28.49",
        //       "totalFee": "1.50",
        //       "method": "bank transfer",
        //       "status": "Successful",
        //       "createTime": 1614898701000,
        //       "updateTime": 1614898820000
        //     }
        //
        // deposit
        //     {
        //       "orderNo": "25ced37075c1470ba8939d0df2316e23",
        //       "fiatCurrency": "EUR",
        //       "transactionType": 0,
        //       "indicatedAmount": "15.00",
        //       "amount": "15.00",
        //       "totalFee": "0.00",
        //       "method": "card",
        //       "status": "Failed",
        //       "createTime": "1627501026000",
        //       "updateTime": "1627501027000"
        //     }
        //
        // withdraw
        //
        //    { id: "9a67628b16ba4988ae20d329333f16bc" }
        //
        const id = this.safeString2(transaction, 'id', 'orderNo');
        const address = this.safeString(transaction, 'address');
        let tag = this.safeString(transaction, 'addressTag'); // set but unused
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        let txid = this.safeString(transaction, 'txId');
        if ((txid !== undefined) && (txid.indexOf('Internal transfer ') >= 0)) {
            txid = txid.slice(18);
        }
        const currencyId = this.safeString2(transaction, 'coin', 'fiatCurrency');
        let code = this.safeCurrencyCode(currencyId, currency);
        let timestamp = undefined;
        timestamp = this.safeInteger2(transaction, 'insertTime', 'createTime');
        if (timestamp === undefined) {
            timestamp = this.parse8601(this.safeString(transaction, 'applyTime'));
        }
        const updated = this.safeInteger2(transaction, 'successTime', 'updateTime');
        let type = this.safeString(transaction, 'type');
        if (type === undefined) {
            const txType = this.safeString(transaction, 'transactionType');
            if (txType !== undefined) {
                type = (txType === '0') ? 'deposit' : 'withdrawal';
            }
            const legalMoneyCurrenciesById = this.safeDict(this.options, 'legalMoneyCurrenciesById');
            code = this.safeString(legalMoneyCurrenciesById, code, code);
        }
        const status = this.parseTransactionStatusByType(this.safeString(transaction, 'status'), type);
        const amount = this.safeNumber(transaction, 'amount');
        const feeCost = this.safeNumber2(transaction, 'transactionFee', 'totalFee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        const internalInteger = this.safeInteger(transaction, 'transferType');
        let internal = undefined;
        if (internalInteger !== undefined) {
            internal = (internalInteger !== 0) ? true : false;
        }
        const network = this.safeString(transaction, 'network');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': network,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'internal': internal,
            'comment': undefined,
            'fee': fee,
        };
    }
    parseTransferStatus(status) {
        const statuses = {
            'CONFIRMED': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        // transfer
        //
        //     {
        //         "tranId":13526853623
        //     }
        //
        // fetchTransfers
        //
        //     {
        //         "timestamp": 1614640878000,
        //         "asset": "USDT",
        //         "amount": "25",
        //         "type": "MAIN_UMFUTURE",
        //         "status": "CONFIRMED",
        //         "tranId": 43000126248
        //     }
        //
        //     {
        //             "orderType": "C2C", // Enum：PAY(C2B Merchant Acquiring Payment), PAY_REFUND(C2B Merchant Acquiring Payment,refund), C2C(C2C Transfer Payment),CRYPTO_BOX(Crypto box), CRYPTO_BOX_RF(Crypto Box, refund), C2C_HOLDING(Transfer to new Binance user), C2C_HOLDING_RF(Transfer to new Binance user,refund), PAYOUT(B2C Disbursement Payment), REMITTANCE（Send cash)
        //             "transactionId": "M_P_71505104267788288",
        //             "transactionTime": 1610090460133, //trade timestamp
        //             "amount": "23.72469206", //order amount(up to 8 decimal places), positive is income, negative is expenditure
        //             "currency": "BNB",
        //             "walletType": 1, //main wallet type, 1 for funding wallet, 2 for spot wallet, 3 for fiat wallet, 4 or 6 for card payment, 5 for earn wallet
        //             "walletTypes": [1,2], //array format，there are multiple values when using combination payment
        //             "fundsDetail": [ // details
        //                     {
        //                         "currency": "USDT", //asset
        //                         "amount": "1.2",
        //                         "walletAssetCost":[ //details of asset cost per wallet
        //                             {"1":"0.6"},
        //                             {"2":"0.6"}
        //                         ]
        //                     },
        //                     {
        //                         "currency": "ETH",
        //                         "amount": "0.0001",
        //                         "walletAssetCost":[
        //                             {"1":"0.00005"},
        //                             {"2":"0.00005"}
        //                         ]
        //                     }
        //                 ],
        //             "payerInfo":{
        //                     "name":"Jack", //nickname or merchant name
        //                     "type":"USER", //account type，USER for personal，MERCHANT for merchant
        //                     "binanceId":"12345678", //binance uid
        //                     "accountId":"67736251" //binance pay id
        //                 },
        //             "receiverInfo":{
        //                     "name":"Alan", //nickname or merchant name
        //                     "type":"MERCHANT", //account type，USER for personal，MERCHANT for merchant
        //                     "email":"alan@binance.com", //email
        //                     "binanceId":"34355667", //binance uid
        //                     "accountId":"21326891", //binance pay id
        //                     "countryCode":"1", //International area code
        //                     "phoneNumber":"8057651210",
        //                     "mobileCode":"US", //country code
        //                     "extend":[ //extension field
        //                             "institutionName": "",
        //                             "cardNumber": "",
        //                             "digitalWalletId": ""
        //                     ]
        //                 }
        //             }
        const id = this.safeString2(transfer, 'tranId', 'transactionId');
        const currencyId = this.safeString2(transfer, 'asset', 'currency');
        const code = this.safeCurrencyCode(currencyId, currency);
        const amount = this.safeNumber(transfer, 'amount');
        const type = this.safeString(transfer, 'type');
        let fromAccount = undefined;
        let toAccount = undefined;
        const accountsById = this.safeDict(this.options, 'accountsById', {});
        if (type !== undefined) {
            const parts = type.split('_');
            fromAccount = this.safeValue(parts, 0);
            toAccount = this.safeValue(parts, 1);
            fromAccount = this.safeString(accountsById, fromAccount, fromAccount);
            toAccount = this.safeString(accountsById, toAccount, toAccount);
        }
        const walletType = this.safeInteger(transfer, 'walletType');
        if (walletType !== undefined) {
            const payer = this.safeDict(transfer, 'payerInfo', {});
            const receiver = this.safeDict(transfer, 'receiverInfo', {});
            fromAccount = this.safeString(payer, 'accountId');
            toAccount = this.safeString(receiver, 'accountId');
        }
        const timestamp = this.safeInteger2(transfer, 'timestamp', 'transactionTime');
        const status = this.parseTransferStatus(this.safeString(transfer, 'status'));
        return {
            'info': transfer,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': code,
            'amount': amount,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': status,
        };
    }
    parseIncome(income, market = undefined) {
        //
        //     {
        //       "symbol": "ETHUSDT",
        //       "incomeType": "FUNDING_FEE",
        //       "income": "0.00134317",
        //       "asset": "USDT",
        //       "time": "1621584000000",
        //       "info": "FUNDING_FEE",
        //       "tranId": "4480321991774044580",
        //       "tradeId": ""
        //     }
        //
        const marketId = this.safeString(income, 'symbol');
        const currencyId = this.safeString(income, 'asset');
        const timestamp = this.safeInteger(income, 'time');
        return {
            'info': income,
            'symbol': this.safeSymbol(marketId, market, undefined, 'swap'),
            'code': this.safeCurrencyCode(currencyId),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': this.safeString(income, 'tranId'),
            'amount': this.safeNumber(income, 'income'),
        };
    }
    /**
     * @method
     * @name binance#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://developers.binance.com/docs/wallet/asset/user-universal-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] exchange specific transfer type
     * @param {string} [params.symbol] the unified symbol, required for isolated margin transfers
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
        };
        request['type'] = this.safeString(params, 'type');
        params = this.omit(params, 'type');
        if (request['type'] === undefined) {
            const symbol = this.safeString(params, 'symbol');
            let market = undefined;
            if (symbol !== undefined) {
                market = this.market(symbol);
                params = this.omit(params, 'symbol');
            }
            let fromId = this.convertTypeToAccount(fromAccount).toUpperCase();
            let toId = this.convertTypeToAccount(toAccount).toUpperCase();
            let isolatedSymbol = undefined;
            if (market !== undefined) {
                isolatedSymbol = market['id'];
            }
            if (fromId === 'ISOLATED') {
                if (symbol === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' transfer () requires params["symbol"] when fromAccount is ' + fromAccount);
                }
            }
            if (toId === 'ISOLATED') {
                if (symbol === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' transfer () requires params["symbol"] when toAccount is ' + toAccount);
                }
            }
            const accountsById = this.safeDict(this.options, 'accountsById', {});
            const fromIsolated = !(fromId in accountsById);
            const toIsolated = !(toId in accountsById);
            if (fromIsolated && (market === undefined)) {
                isolatedSymbol = fromId; // allow user provide symbol as the from/to account
            }
            if (toIsolated && (market === undefined)) {
                isolatedSymbol = toId;
            }
            if (fromIsolated || toIsolated) { // Isolated margin transfer
                const fromFuture = fromId === 'UMFUTURE' || fromId === 'CMFUTURE';
                const toFuture = toId === 'UMFUTURE' || toId === 'CMFUTURE';
                const fromSpot = fromId === 'MAIN';
                const toSpot = toId === 'MAIN';
                const funding = fromId === 'FUNDING' || toId === 'FUNDING';
                const option = fromId === 'OPTION' || toId === 'OPTION';
                const prohibitedWithIsolated = fromFuture || toFuture || funding || option;
                if ((fromIsolated || toIsolated) && prohibitedWithIsolated) {
                    throw new errors.BadRequest(this.id + ' transfer () does not allow transfers between ' + fromAccount + ' and ' + toAccount);
                }
                else if (toSpot && fromIsolated) {
                    fromId = 'ISOLATED_MARGIN';
                    request['fromSymbol'] = isolatedSymbol;
                }
                else if (fromSpot && toIsolated) {
                    toId = 'ISOLATED_MARGIN';
                    request['toSymbol'] = isolatedSymbol;
                }
                else {
                    if (fromIsolated && toIsolated) {
                        request['fromSymbol'] = fromId;
                        request['toSymbol'] = toId;
                        fromId = 'ISOLATEDMARGIN';
                        toId = 'ISOLATEDMARGIN';
                    }
                    else {
                        if (fromIsolated) {
                            request['fromSymbol'] = isolatedSymbol;
                            fromId = 'ISOLATEDMARGIN';
                        }
                        if (toIsolated) {
                            request['toSymbol'] = isolatedSymbol;
                            toId = 'ISOLATEDMARGIN';
                        }
                    }
                }
                request['type'] = fromId + '_' + toId;
            }
            else {
                request['type'] = fromId + '_' + toId;
            }
        }
        const response = await this.sapiPostAssetTransfer(this.extend(request, params));
        //
        //     {
        //         "tranId":13526853623
        //     }
        //
        return this.parseTransfer(response, currency);
    }
    /**
     * @method
     * @name binance#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://developers.binance.com/docs/wallet/asset/query-user-universal-transfer
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.internal] default false, when true will fetch pay trade history
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const internal = this.safeBool(params, 'internal');
        params = this.omit(params, 'internal');
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchTransfers', 'paginate');
        if (paginate && !internal) {
            return await this.fetchPaginatedCallDynamic('fetchTransfers', code, since, limit, params);
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const request = {};
        let limitKey = 'limit';
        if (!internal) {
            const defaultType = this.safeString2(this.options, 'fetchTransfers', 'defaultType', 'spot');
            const fromAccount = this.safeString(params, 'fromAccount', defaultType);
            const defaultTo = (fromAccount === 'future') ? 'spot' : 'future';
            const toAccount = this.safeString(params, 'toAccount', defaultTo);
            let type = this.safeString(params, 'type');
            const accountsByType = this.safeDict(this.options, 'accountsByType', {});
            const fromId = this.safeString(accountsByType, fromAccount);
            const toId = this.safeString(accountsByType, toAccount);
            if (type === undefined) {
                if (fromId === undefined) {
                    const keys = Object.keys(accountsByType);
                    throw new errors.ExchangeError(this.id + ' fromAccount parameter must be one of ' + keys.join(', '));
                }
                if (toId === undefined) {
                    const keys = Object.keys(accountsByType);
                    throw new errors.ExchangeError(this.id + ' toAccount parameter must be one of ' + keys.join(', '));
                }
                type = fromId + '_' + toId;
            }
            request['type'] = type;
            limitKey = 'size';
        }
        if (limit !== undefined) {
            request[limitKey] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, 'until');
            request['endTime'] = until;
        }
        let response = undefined;
        if (internal) {
            response = await this.sapiGetPayTransactions(this.extend(request, params));
            //
            // {
            //     "code": "000000",
            //     "message": "success",
            //     "data": [
            //     {
            //         "orderType": "C2C", // Enum：PAY(C2B Merchant Acquiring Payment), PAY_REFUND(C2B Merchant Acquiring Payment,refund), C2C(C2C Transfer Payment),CRYPTO_BOX(Crypto box), CRYPTO_BOX_RF(Crypto Box, refund), C2C_HOLDING(Transfer to new Binance user), C2C_HOLDING_RF(Transfer to new Binance user,refund), PAYOUT(B2C Disbursement Payment), REMITTANCE（Send cash)
            //         "transactionId": "M_P_71505104267788288",
            //         "transactionTime": 1610090460133, //trade timestamp
            //         "amount": "23.72469206", //order amount(up to 8 decimal places), positive is income, negative is expenditure
            //         "currency": "BNB",
            //         "walletType": 1, //main wallet type, 1 for funding wallet, 2 for spot wallet, 3 for fiat wallet, 4 or 6 for card payment, 5 for earn wallet
            //         "walletTypes": [1,2], //array format，there are multiple values when using combination payment
            //         "fundsDetail": [ // details
            //                 {
            //                  "currency": "USDT", //asset
            //                  "amount": "1.2",
            //                  "walletAssetCost":[ //details of asset cost per wallet
            //                      {"1":"0.6"},
            //                      {"2":"0.6"}
            //                  ]
            //                 },
            //                 {
            //                   "currency": "ETH",
            //                   "amount": "0.0001",
            //                   "walletAssetCost":[
            //                      {"1":"0.00005"},
            //                      {"2":"0.00005"}
            //                   ]
            //                 }
            //            ],
            //         "payerInfo":{
            //                 "name":"Jack", //nickname or merchant name
            //                 "type":"USER", //account type，USER for personal，MERCHANT for merchant
            //                 "binanceId":"12345678", //binance uid
            //                 "accountId":"67736251" //binance pay id
            //             },
            //         "receiverInfo":{
            //                 "name":"Alan", //nickname or merchant name
            //                 "type":"MERCHANT", //account type，USER for personal，MERCHANT for merchant
            //                 "email":"alan@binance.com", //email
            //                 "binanceId":"34355667", //binance uid
            //                 "accountId":"21326891", //binance pay id
            //                 "countryCode":"1", //International area code
            //                 "phoneNumber":"8057651210",
            //                 "mobileCode":"US", //country code
            //                 "extend":[ //extension field
            //                      "institutionName": "",
            //                      "cardNumber": "",
            //                      "digitalWalletId": ""
            //                 ]
            //             }
            //       }
            //    ],
            //    "success": true
            // }
            //
        }
        else {
            response = await this.sapiGetAssetTransfer(this.extend(request, params));
            //
            //     {
            //         "total": 3,
            //         "rows": [
            //             {
            //                 "timestamp": 1614640878000,
            //                 "asset": "USDT",
            //                 "amount": "25",
            //                 "type": "MAIN_UMFUTURE",
            //                 "status": "CONFIRMED",
            //                 "tranId": 43000126248
            //             },
            //         ]
            //     }
            //
        }
        const rows = this.safeList2(response, 'rows', 'data', []);
        return this.parseTransfers(rows, currency, since, limit);
    }
    /**
     * @method
     * @name binance#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://developers.binance.com/docs/wallet/capital/deposite-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] network for fetch deposit address
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'coin': currency['id'],
            // 'network': 'ETH', // 'BSC', 'XMR', you can get network and isDefault in networkList in the response of sapiGetCapitalConfigDetail
        };
        const networks = this.safeDict(this.options, 'networks', {});
        let network = this.safeStringUpper(params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString(networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['network'] = network;
            params = this.omit(params, 'network');
        }
        // has support for the 'network' parameter
        const response = await this.sapiGetCapitalDepositAddress(this.extend(request, params));
        //
        //     {
        //         "currency": "XRP",
        //         "address": "rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh",
        //         "tag": "108618262",
        //         "info": {
        //             "coin": "XRP",
        //             "address": "rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh",
        //             "tag": "108618262",
        //             "url": "https://bithomp.com/explorer/rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh"
        //         }
        //     }
        //
        return this.parseDepositAddress(response, currency);
    }
    parseDepositAddress(response, currency = undefined) {
        //
        //     {
        //         "coin": "XRP",
        //         "address": "rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh",
        //         "tag": "108618262",
        //         "url": "https://bithomp.com/explorer/rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh"
        //     }
        //
        const url = this.safeString(response, 'url');
        const address = this.safeString(response, 'address');
        const currencyId = this.safeString(response, 'currency');
        const code = this.safeCurrencyCode(currencyId, currency);
        // deposit-address endpoint provides only network url (not network ID/CODE)
        // so we should map the url to network (their data is inside currencies)
        const networkCode = this.getNetworkCodeByNetworkUrl(code, url);
        let tag = this.safeString(response, 'tag', '');
        if (tag.length === 0) {
            tag = undefined;
        }
        this.checkAddress(address);
        return {
            'info': response,
            'currency': code,
            'network': networkCode,
            'address': address,
            'tag': tag,
        };
    }
    /**
     * @method
     * @name binance#fetchTransactionFees
     * @deprecated
     * @description please use fetchDepositWithdrawFees instead
     * @see https://developers.binance.com/docs/wallet/capital/all-coins-info
     * @param {string[]|undefined} codes not used by binance fetchTransactionFees ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTransactionFees(codes = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.sapiGetCapitalConfigGetall(params);
        //
        //  [
        //     {
        //       "coin": "BAT",
        //       "depositAllEnable": true,
        //       "withdrawAllEnable": true,
        //       "name": "Basic Attention Token",
        //       "free": "0",
        //       "locked": "0",
        //       "freeze": "0",
        //       "withdrawing": "0",
        //       "ipoing": "0",
        //       "ipoable": "0",
        //       "storage": "0",
        //       "isLegalMoney": false,
        //       "trading": true,
        //       "networkList": [
        //         {
        //           "network": "BNB",
        //           "coin": "BAT",
        //           "withdrawIntegerMultiple": "0.00000001",
        //           "isDefault": false,
        //           "depositEnable": true,
        //           "withdrawEnable": true,
        //           "depositDesc": '',
        //           "withdrawDesc": '',
        //           "specialTips": "The name of this asset is Basic Attention Token (BAT). Both a MEMO and an Address are required to successfully deposit your BEP2 tokens to Binance.",
        //           "name": "BEP2",
        //           "resetAddressStatus": false,
        //           "addressRegex": "^(bnb1)[0-9a-z]{38}$",
        //           "memoRegex": "^[0-9A-Za-z\\-_]{1,120}$",
        //           "withdrawFee": "0.27",
        //           "withdrawMin": "0.54",
        //           "withdrawMax": "10000000000",
        //           "minConfirm": "1",
        //           "unLockConfirm": "0"
        //         },
        //         {
        //           "network": "BSC",
        //           "coin": "BAT",
        //           "withdrawIntegerMultiple": "0.00000001",
        //           "isDefault": false,
        //           "depositEnable": true,
        //           "withdrawEnable": true,
        //           "depositDesc": '',
        //           "withdrawDesc": '',
        //           "specialTips": "The name of this asset is Basic Attention Token. Please ensure you are depositing Basic Attention Token (BAT) tokens under the contract address ending in 9766e.",
        //           "name": "BEP20 (BSC)",
        //           "resetAddressStatus": false,
        //           "addressRegex": "^(0x)[0-9A-Fa-f]{40}$",
        //           "memoRegex": '',
        //           "withdrawFee": "0.27",
        //           "withdrawMin": "0.54",
        //           "withdrawMax": "10000000000",
        //           "minConfirm": "15",
        //           "unLockConfirm": "0"
        //         },
        //         {
        //           "network": "ETH",
        //           "coin": "BAT",
        //           "withdrawIntegerMultiple": "0.00000001",
        //           "isDefault": true,
        //           "depositEnable": true,
        //           "withdrawEnable": true,
        //           "depositDesc": '',
        //           "withdrawDesc": '',
        //           "specialTips": "The name of this asset is Basic Attention Token. Please ensure you are depositing Basic Attention Token (BAT) tokens under the contract address ending in 887ef.",
        //           "name": "ERC20",
        //           "resetAddressStatus": false,
        //           "addressRegex": "^(0x)[0-9A-Fa-f]{40}$",
        //           "memoRegex": '',
        //           "withdrawFee": "27",
        //           "withdrawMin": "54",
        //           "withdrawMax": "10000000000",
        //           "minConfirm": "12",
        //           "unLockConfirm": "0"
        //         }
        //       ]
        //     }
        //  ]
        //
        const withdrawFees = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const currencyId = this.safeString(entry, 'coin');
            const code = this.safeCurrencyCode(currencyId);
            const networkList = this.safeList(entry, 'networkList', []);
            withdrawFees[code] = {};
            for (let j = 0; j < networkList.length; j++) {
                const networkEntry = networkList[j];
                const networkId = this.safeString(networkEntry, 'network');
                const networkCode = this.safeCurrencyCode(networkId);
                const fee = this.safeNumber(networkEntry, 'withdrawFee');
                withdrawFees[code][networkCode] = fee;
            }
        }
        return {
            'withdraw': withdrawFees,
            'deposit': {},
            'info': response,
        };
    }
    /**
     * @method
     * @name binance#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://developers.binance.com/docs/wallet/capital/all-coins-info
     * @param {string[]|undefined} codes not used by binance fetchDepositWithdrawFees ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchDepositWithdrawFees(codes = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.sapiGetCapitalConfigGetall(params);
        //
        //    [
        //        {
        //            "coin": "BAT",
        //            "depositAllEnable": true,
        //            "withdrawAllEnable": true,
        //            "name": "Basic Attention Token",
        //            "free": "0",
        //            "locked": "0",
        //            "freeze": "0",
        //            "withdrawing": "0",
        //            "ipoing": "0",
        //            "ipoable": "0",
        //            "storage": "0",
        //            "isLegalMoney": false,
        //            "trading": true,
        //            "networkList": [
        //                {
        //                    "network": "BNB",
        //                    "coin": "BAT",
        //                    "withdrawIntegerMultiple": "0.00000001",
        //                    "isDefault": false,
        //                    "depositEnable": true,
        //                    "withdrawEnable": true,
        //                    "depositDesc": '',
        //                    "withdrawDesc": '',
        //                    "specialTips": "The name of this asset is Basic Attention Token (BAT). Both a MEMO and an Address are required to successfully deposit your BEP2 tokens to Binance.",
        //                    "name": "BEP2",
        //                    "resetAddressStatus": false,
        //                    "addressRegex": "^(bnb1)[0-9a-z]{38}$",
        //                    "memoRegex": "^[0-9A-Za-z\\-_]{1,120}$",
        //                    "withdrawFee": "0.27",
        //                    "withdrawMin": "0.54",
        //                    "withdrawMax": "10000000000",
        //                    "minConfirm": "1",
        //                    "unLockConfirm": "0"
        //                },
        //                ...
        //            ]
        //        }
        //    ]
        //
        return this.parseDepositWithdrawFees(response, codes, 'coin');
    }
    parseDepositWithdrawFee(fee, currency = undefined) {
        //
        //    {
        //        "coin": "BAT",
        //        "depositAllEnable": true,
        //        "withdrawAllEnable": true,
        //        "name": "Basic Attention Token",
        //        "free": "0",
        //        "locked": "0",
        //        "freeze": "0",
        //        "withdrawing": "0",
        //        "ipoing": "0",
        //        "ipoable": "0",
        //        "storage": "0",
        //        "isLegalMoney": false,
        //        "trading": true,
        //        "networkList": [
        //            {
        //                "network": "BNB",
        //                "coin": "BAT",
        //                "withdrawIntegerMultiple": "0.00000001",
        //                "isDefault": false,
        //                "depositEnable": true,
        //                "withdrawEnable": true,
        //                "depositDesc": '',
        //                "withdrawDesc": '',
        //                "specialTips": "The name of this asset is Basic Attention Token (BAT). Both a MEMO and an Address are required to successfully deposit your BEP2 tokens to Binance.",
        //                "name": "BEP2",
        //                "resetAddressStatus": false,
        //                "addressRegex": "^(bnb1)[0-9a-z]{38}$",
        //                "memoRegex": "^[0-9A-Za-z\\-_]{1,120}$",
        //                "withdrawFee": "0.27",
        //                "withdrawMin": "0.54",
        //                "withdrawMax": "10000000000",
        //                "minConfirm": "1",
        //                "unLockConfirm": "0"
        //            },
        //            ...
        //        ]
        //    }
        //
        const networkList = this.safeList(fee, 'networkList', []);
        const result = this.depositWithdrawFee(fee);
        for (let j = 0; j < networkList.length; j++) {
            const networkEntry = networkList[j];
            const networkId = this.safeString(networkEntry, 'network');
            const networkCode = this.networkIdToCode(networkId);
            const withdrawFee = this.safeNumber(networkEntry, 'withdrawFee');
            const isDefault = this.safeBool(networkEntry, 'isDefault');
            if (isDefault === true) {
                result['withdraw'] = {
                    'fee': withdrawFee,
                    'percentage': undefined,
                };
            }
            result['networks'][networkCode] = {
                'withdraw': {
                    'fee': withdrawFee,
                    'percentage': undefined,
                },
                'deposit': {
                    'fee': undefined,
                    'percentage': undefined,
                },
            };
        }
        return result;
    }
    /**
     * @method
     * @name binance#withdraw
     * @description make a withdrawal
     * @see https://developers.binance.com/docs/wallet/capital/withdraw
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        this.checkAddress(address);
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'coin': currency['id'],
            'address': address,
            // issue sapiGetCapitalConfigGetall () to get networks for withdrawing USDT ERC20 vs USDT Omni
            // 'network': 'ETH', // 'BTC', 'TRX', etc, optional
        };
        if (tag !== undefined) {
            request['addressTag'] = tag;
        }
        const networks = this.safeDict(this.options, 'networks', {});
        let network = this.safeStringUpper(params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString(networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['network'] = network;
            params = this.omit(params, 'network');
        }
        request['amount'] = this.currencyToPrecision(code, amount, network);
        const response = await this.sapiPostCapitalWithdrawApply(this.extend(request, params));
        //     { id: '9a67628b16ba4988ae20d329333f16bc' }
        return this.parseTransaction(response, currency);
    }
    parseTradingFee(fee, market = undefined) {
        //
        // spot
        //     [
        //       {
        //         "symbol": "BTCUSDT",
        //         "makerCommission": "0.001",
        //         "takerCommission": "0.001"
        //       }
        //     ]
        //
        // swap
        //     {
        //         "symbol": "BTCUSD_PERP",
        //         "makerCommissionRate": "0.00015",  // 0.015%
        //         "takerCommissionRate": "0.00040"   // 0.040%
        //     }
        //
        const marketId = this.safeString(fee, 'symbol');
        const symbol = this.safeSymbol(marketId, market, undefined, 'spot');
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber2(fee, 'makerCommission', 'makerCommissionRate'),
            'taker': this.safeNumber2(fee, 'takerCommission', 'takerCommissionRate'),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }
    /**
     * @method
     * @name binance#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://developers.binance.com/docs/wallet/asset/trade-fee
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/User-Commission-Rate
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/User-Commission-Rate
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-User-Commission-Rate-for-UM
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-User-Commission-Rate-for-CM
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch trading fees in a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFee(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const type = market['type'];
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchTradingFee', market, params);
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchTradingFee', 'papi', 'portfolioMargin', false);
        const isLinear = this.isLinear(type, subType);
        const isInverse = this.isInverse(type, subType);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (isLinear) {
            if (isPortfolioMargin) {
                response = await this.papiGetUmCommissionRate(this.extend(request, params));
            }
            else {
                response = await this.fapiPrivateGetCommissionRate(this.extend(request, params));
            }
        }
        else if (isInverse) {
            if (isPortfolioMargin) {
                response = await this.papiGetCmCommissionRate(this.extend(request, params));
            }
            else {
                response = await this.dapiPrivateGetCommissionRate(this.extend(request, params));
            }
        }
        else {
            response = await this.sapiGetAssetTradeFee(this.extend(request, params));
        }
        //
        // spot
        //
        //     [
        //       {
        //         "symbol": "BTCUSDT",
        //         "makerCommission": "0.001",
        //         "takerCommission": "0.001"
        //       }
        //     ]
        //
        // swap
        //
        //     {
        //         "symbol": "BTCUSD_PERP",
        //         "makerCommissionRate": "0.00015",  // 0.015%
        //         "takerCommissionRate": "0.00040"   // 0.040%
        //     }
        //
        let data = response;
        if (Array.isArray(data)) {
            data = this.safeDict(data, 0, {});
        }
        return this.parseTradingFee(data, market);
    }
    /**
     * @method
     * @name binance#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://developers.binance.com/docs/wallet/asset/trade-fee
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Config
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees(params = {}) {
        await this.loadMarkets();
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchTradingFees', undefined, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchTradingFees', undefined, params, 'linear');
        const isSpotOrMargin = (type === 'spot') || (type === 'margin');
        const isLinear = this.isLinear(type, subType);
        const isInverse = this.isInverse(type, subType);
        let response = undefined;
        if (isSpotOrMargin) {
            response = await this.sapiGetAssetTradeFee(params);
        }
        else if (isLinear) {
            response = await this.fapiPrivateGetAccountConfig(params);
        }
        else if (isInverse) {
            response = await this.dapiPrivateGetAccount(params);
        }
        //
        // sapi / spot
        //
        //    [
        //       {
        //         "symbol": "ZRXBNB",
        //         "makerCommission": "0.001",
        //         "takerCommission": "0.001"
        //       },
        //       {
        //         "symbol": "ZRXBTC",
        //         "makerCommission": "0.001",
        //         "takerCommission": "0.001"
        //       },
        //    ]
        //
        // fapi / future / linear
        //
        //     {
        //         "feeTier": 0,       // account commisssion tier
        //         "canTrade": true,   // if can trade
        //         "canDeposit": true,     // if can transfer in asset
        //         "canWithdraw": true,    // if can transfer out asset
        //         "updateTime": 0,
        //         "totalInitialMargin": "0.00000000",    // total initial margin required with current mark price (useless with isolated positions), only for USDT asset
        //         "totalMaintMargin": "0.00000000",     // total maintenance margin required, only for USDT asset
        //         "totalWalletBalance": "23.72469206",     // total wallet balance, only for USDT asset
        //         "totalUnrealizedProfit": "0.00000000",   // total unrealized profit, only for USDT asset
        //         "totalMarginBalance": "23.72469206",     // total margin balance, only for USDT asset
        //         "totalPositionInitialMargin": "0.00000000",    // initial margin required for positions with current mark price, only for USDT asset
        //         "totalOpenOrderInitialMargin": "0.00000000",   // initial margin required for open orders with current mark price, only for USDT asset
        //         "totalCrossWalletBalance": "23.72469206",      // crossed wallet balance, only for USDT asset
        //         "totalCrossUnPnl": "0.00000000",      // unrealized profit of crossed positions, only for USDT asset
        //         "availableBalance": "23.72469206",       // available balance, only for USDT asset
        //         "maxWithdrawAmount": "23.72469206"     // maximum amount for transfer out, only for USDT asset
        //         ...
        //     }
        //
        // dapi / delivery / inverse
        //
        //     {
        //         "canDeposit": true,
        //         "canTrade": true,
        //         "canWithdraw": true,
        //         "feeTier": 2,
        //         "updateTime": 0
        //     }
        //
        if (isSpotOrMargin) {
            //
            //    [
            //       {
            //         "symbol": "ZRXBNB",
            //         "makerCommission": "0.001",
            //         "takerCommission": "0.001"
            //       },
            //       {
            //         "symbol": "ZRXBTC",
            //         "makerCommission": "0.001",
            //         "takerCommission": "0.001"
            //       },
            //    ]
            //
            const result = {};
            for (let i = 0; i < response.length; i++) {
                const fee = this.parseTradingFee(response[i]);
                const symbol = fee['symbol'];
                result[symbol] = fee;
            }
            return result;
        }
        else if (isLinear) {
            //
            //     {
            //         "feeTier": 0,       // account commisssion tier
            //         "canTrade": true,   // if can trade
            //         "canDeposit": true,     // if can transfer in asset
            //         "canWithdraw": true,    // if can transfer out asset
            //         "updateTime": 0,
            //         "totalInitialMargin": "0.00000000",    // total initial margin required with current mark price (useless with isolated positions), only for USDT asset
            //         "totalMaintMargin": "0.00000000",     // total maintenance margin required, only for USDT asset
            //         "totalWalletBalance": "23.72469206",     // total wallet balance, only for USDT asset
            //         "totalUnrealizedProfit": "0.00000000",   // total unrealized profit, only for USDT asset
            //         "totalMarginBalance": "23.72469206",     // total margin balance, only for USDT asset
            //         "totalPositionInitialMargin": "0.00000000",    // initial margin required for positions with current mark price, only for USDT asset
            //         "totalOpenOrderInitialMargin": "0.00000000",   // initial margin required for open orders with current mark price, only for USDT asset
            //         "totalCrossWalletBalance": "23.72469206",      // crossed wallet balance, only for USDT asset
            //         "totalCrossUnPnl": "0.00000000",      // unrealized profit of crossed positions, only for USDT asset
            //         "availableBalance": "23.72469206",       // available balance, only for USDT asset
            //         "maxWithdrawAmount": "23.72469206"     // maximum amount for transfer out, only for USDT asset
            //         ...
            //     }
            //
            const symbols = Object.keys(this.markets);
            const result = {};
            const feeTier = this.safeInteger(response, 'feeTier');
            const feeTiers = this.fees['linear']['trading']['tiers'];
            const maker = feeTiers['maker'][feeTier][1];
            const taker = feeTiers['taker'][feeTier][1];
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.markets[symbol];
                if (market['linear']) {
                    result[symbol] = {
                        'info': {
                            'feeTier': feeTier,
                        },
                        'symbol': symbol,
                        'maker': maker,
                        'taker': taker,
                    };
                }
            }
            return result;
        }
        else if (isInverse) {
            //
            //     {
            //         "canDeposit": true,
            //         "canTrade": true,
            //         "canWithdraw": true,
            //         "feeTier": 2,
            //         "updateTime": 0
            //     }
            //
            const symbols = Object.keys(this.markets);
            const result = {};
            const feeTier = this.safeInteger(response, 'feeTier');
            const feeTiers = this.fees['inverse']['trading']['tiers'];
            const maker = feeTiers['maker'][feeTier][1];
            const taker = feeTiers['taker'][feeTier][1];
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.markets[symbol];
                if (market['inverse']) {
                    result[symbol] = {
                        'info': {
                            'feeTier': feeTier,
                        },
                        'symbol': symbol,
                        'maker': maker,
                        'taker': taker,
                    };
                }
            }
            return result;
        }
        return undefined;
    }
    /**
     * @method
     * @name binance#futuresTransfer
     * @ignore
     * @description transfer between futures account
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/New-Future-Account-Transfer
     * @param {string} code unified currency code
     * @param {float} amount the amount to transfer
     * @param {string} type 1 - transfer from spot account to USDT-Ⓜ futures account, 2 - transfer from USDT-Ⓜ futures account to spot account, 3 - transfer from spot account to COIN-Ⓜ futures account, 4 - transfer from COIN-Ⓜ futures account to spot account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} params.recvWindow
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=futures-transfer-structure}
     */
    async futuresTransfer(code, amount, type, params = {}) {
        if ((type < 1) || (type > 4)) {
            throw new errors.ArgumentsRequired(this.id + ' type must be between 1 and 4');
        }
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
            'amount': amount,
            'type': type,
        };
        const response = await this.sapiPostFuturesTransfer(this.extend(request, params));
        //
        //   {
        //       "tranId": 100000001
        //   }
        //
        return this.parseTransfer(response, currency);
    }
    /**
     * @method
     * @name binance#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Index-Price-and-Mark-Price
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['linear']) {
            response = await this.fapiPublicGetPremiumIndex(this.extend(request, params));
        }
        else if (market['inverse']) {
            response = await this.dapiPublicGetPremiumIndex(this.extend(request, params));
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchFundingRate() supports linear and inverse contracts only');
        }
        if (market['inverse']) {
            response = response[0];
        }
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "markPrice": "45802.81129892",
        //         "indexPrice": "45745.47701915",
        //         "estimatedSettlePrice": "45133.91753671",
        //         "lastFundingRate": "0.00063521",
        //         "interestRate": "0.00010000",
        //         "nextFundingTime": "1621267200000",
        //         "time": "1621252344001"
        //     }
        //
        return this.parseFundingRate(response, market);
    }
    /**
     * @method
     * @name binance#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Get-Funding-Rate-History
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Get-Funding-Rate-History-of-Perpetual-Futures
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchFundingRateHistory', symbol, since, limit, '8h', params);
        }
        const defaultType = this.safeString2(this.options, 'fetchFundingRateHistory', 'defaultType', 'future');
        const type = this.safeString(params, 'type', defaultType);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            request['symbol'] = market['id'];
        }
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchFundingRateHistory', market, params, 'linear');
        params = this.omit(params, 'type');
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger(params, 'until'); // unified in milliseconds
        const endTime = this.safeInteger(params, 'endTime', until); // exchange-specific in milliseconds
        params = this.omit(params, ['endTime', 'until']);
        if (endTime !== undefined) {
            request['endTime'] = endTime;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (this.isLinear(type, subType)) {
            response = await this.fapiPublicGetFundingRate(this.extend(request, params));
        }
        else if (this.isInverse(type, subType)) {
            response = await this.dapiPublicGetFundingRate(this.extend(request, params));
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchFundingRateHistory() is not supported for ' + type + ' markets');
        }
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "fundingRate": "0.00063521",
        //         "fundingTime": "1621267200000",
        //     }
        //
        return this.parseFundingRateHistories(response, market, since, limit);
    }
    parseFundingRateHistory(contract, market = undefined) {
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "fundingRate": "0.00063521",
        //         "fundingTime": "1621267200000",
        //     }
        //
        const timestamp = this.safeInteger(contract, 'fundingTime');
        return {
            'info': contract,
            'symbol': this.safeSymbol(this.safeString(contract, 'symbol'), undefined, undefined, 'swap'),
            'fundingRate': this.safeNumber(contract, 'fundingRate'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    /**
     * @method
     * @name binance#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Index-Price-and-Mark-Price
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexed by market symbols
     */
    async fetchFundingRates(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const defaultType = this.safeString2(this.options, 'fetchFundingRates', 'defaultType', 'future');
        const type = this.safeString(params, 'type', defaultType);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchFundingRates', undefined, params, 'linear');
        const query = this.omit(params, 'type');
        let response = undefined;
        if (this.isLinear(type, subType)) {
            response = await this.fapiPublicGetPremiumIndex(query);
        }
        else if (this.isInverse(type, subType)) {
            response = await this.dapiPublicGetPremiumIndex(query);
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchFundingRates() supports linear and inverse contracts only');
        }
        return this.parseFundingRates(response, symbols);
    }
    parseFundingRate(contract, market = undefined) {
        // ensure it matches with https://www.binance.com/en/futures/funding-history/0
        //
        // fetchFundingRate, fetchFundingRates
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "markPrice": "45802.81129892",
        //         "indexPrice": "45745.47701915",
        //         "estimatedSettlePrice": "45133.91753671",
        //         "lastFundingRate": "0.00063521",
        //         "interestRate": "0.00010000",
        //         "nextFundingTime": "1621267200000",
        //         "time": "1621252344001"
        //     }
        //
        // fetchFundingInterval, fetchFundingIntervals
        //
        //     {
        //         "symbol": "BLZUSDT",
        //         "adjustedFundingRateCap": "0.03000000",
        //         "adjustedFundingRateFloor": "-0.03000000",
        //         "fundingIntervalHours": 4,
        //         "disclaimer": false
        //     }
        //
        const timestamp = this.safeInteger(contract, 'time');
        const marketId = this.safeString(contract, 'symbol');
        const symbol = this.safeSymbol(marketId, market, undefined, 'contract');
        const markPrice = this.safeNumber(contract, 'markPrice');
        const indexPrice = this.safeNumber(contract, 'indexPrice');
        const interestRate = this.safeNumber(contract, 'interestRate');
        const estimatedSettlePrice = this.safeNumber(contract, 'estimatedSettlePrice');
        const fundingRate = this.safeNumber(contract, 'lastFundingRate');
        const fundingTime = this.safeInteger(contract, 'nextFundingTime');
        const interval = this.safeString(contract, 'fundingIntervalHours');
        let intervalString = undefined;
        if (interval !== undefined) {
            intervalString = interval + 'h';
        }
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': markPrice,
            'indexPrice': indexPrice,
            'interestRate': interestRate,
            'estimatedSettlePrice': estimatedSettlePrice,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'fundingRate': fundingRate,
            'fundingTimestamp': fundingTime,
            'fundingDatetime': this.iso8601(fundingTime),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': intervalString,
        };
    }
    parseAccountPositions(account, filterClosed = false) {
        const positions = this.safeList(account, 'positions');
        const assets = this.safeList(account, 'assets', []);
        const balances = {};
        for (let i = 0; i < assets.length; i++) {
            const entry = assets[i];
            const currencyId = this.safeString(entry, 'asset');
            const code = this.safeCurrencyCode(currencyId);
            const crossWalletBalance = this.safeString(entry, 'crossWalletBalance');
            const crossUnPnl = this.safeString(entry, 'crossUnPnl');
            balances[code] = {
                'crossMargin': Precise["default"].stringAdd(crossWalletBalance, crossUnPnl),
                'crossWalletBalance': crossWalletBalance,
            };
        }
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const marketId = this.safeString(position, 'symbol');
            const market = this.safeMarket(marketId, undefined, undefined, 'contract');
            const code = market['linear'] ? market['quote'] : market['base'];
            const maintenanceMargin = this.safeString(position, 'maintMargin');
            // check for maintenance margin so empty positions are not returned
            const isPositionOpen = (maintenanceMargin !== '0') && (maintenanceMargin !== '0.00000000');
            if (!filterClosed || isPositionOpen) {
                // sometimes not all the codes are correctly returned...
                if (code in balances) {
                    const parsed = this.parseAccountPosition(this.extend(position, {
                        'crossMargin': balances[code]['crossMargin'],
                        'crossWalletBalance': balances[code]['crossWalletBalance'],
                    }), market);
                    result.push(parsed);
                }
            }
        }
        return result;
    }
    parseAccountPosition(position, market = undefined) {
        //
        // usdm
        //
        // v3 (similar for cross & isolated)
        //
        //    {
        //        "symbol": "WLDUSDT",
        //        "positionSide": "BOTH",
        //        "positionAmt": "-849",
        //        "unrealizedProfit": "11.17920750",
        //        "notional": "-1992.46079250",
        //        "isolatedMargin": "0",
        //        "isolatedWallet": "0",
        //        "initialMargin": "99.62303962",
        //        "maintMargin": "11.95476475",
        //        "updateTime": "1721995760449"
        //        "leverage": "50",                        // in v2
        //        "entryPrice": "2.34",                    // in v2
        //        "positionInitialMargin": "118.82116614", // in v2
        //        "openOrderInitialMargin": "0",           // in v2
        //        "isolated": false,                       // in v2
        //        "breakEvenPrice": "2.3395788",           // in v2
        //        "maxNotional": "25000",                  // in v2
        //        "bidNotional": "0",                      // in v2
        //        "askNotional": "0"                       // in v2
        //    }
        //
        // coinm
        //
        //     {
        //       "symbol": "BTCUSD_210625",
        //       "initialMargin": "0.00024393",
        //       "maintMargin": "0.00002439",
        //       "unrealizedProfit": "-0.00000163",
        //       "positionInitialMargin": "0.00024393",
        //       "openOrderInitialMargin": "0",
        //       "leverage": "10",
        //       "isolated": false,
        //       "positionSide": "BOTH",
        //       "entryPrice": "41021.20000069",
        //       "maxQty": "100",
        //       "notionalValue": "0.00243939",
        //       "isolatedWallet": "0",
        //       "crossMargin": "0.314"
        //       "crossWalletBalance": "34",
        //     }
        //
        // linear portfolio margin
        //
        //     {
        //         "symbol": "CTSIUSDT",
        //         "initialMargin": "0",
        //         "maintMargin": "0",
        //         "unrealizedProfit": "0.00000000",
        //         "positionInitialMargin": "0",
        //         "openOrderInitialMargin": "0",
        //         "leverage": "20",
        //         "entryPrice": "0.0",
        //         "maxNotional": "25000",
        //         "bidNotional": "0",
        //         "askNotional": "0",
        //         "positionSide": "SHORT",
        //         "positionAmt": "0",
        //         "updateTime": 0,
        //         "notional": "0",
        //         "breakEvenPrice": "0.0"
        //     }
        //
        // inverse portoflio margin
        //
        //     {
        //         "symbol": "TRXUSD_PERP",
        //         "initialMargin": "0",
        //         "maintMargin": "0",
        //         "unrealizedProfit": "0.00000000",
        //         "positionInitialMargin": "0",
        //         "openOrderInitialMargin": "0",
        //         "leverage": "20",
        //         "entryPrice": "0.00000000",
        //         "positionSide": "SHORT",
        //         "positionAmt": "0",
        //         "maxQty": "5000000",
        //         "updateTime": 0,
        //         "notionalValue": "0",
        //         "breakEvenPrice": "0.00000000"
        //     }
        //
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market, undefined, 'contract');
        const symbol = this.safeString(market, 'symbol');
        const leverageString = this.safeString(position, 'leverage');
        const leverage = (leverageString !== undefined) ? parseInt(leverageString) : undefined;
        const initialMarginString = this.safeString(position, 'initialMargin');
        const initialMargin = this.parseNumber(initialMarginString);
        let initialMarginPercentageString = undefined;
        if (leverageString !== undefined) {
            initialMarginPercentageString = Precise["default"].stringDiv('1', leverageString, 8);
            const rational = this.isRoundNumber(1000 % leverage);
            if (!rational) {
                initialMarginPercentageString = Precise["default"].stringDiv(Precise["default"].stringAdd(initialMarginPercentageString, '1e-8'), '1', 8);
            }
        }
        // as oppose to notionalValue
        const usdm = ('notional' in position);
        const maintenanceMarginString = this.safeString(position, 'maintMargin');
        const maintenanceMargin = this.parseNumber(maintenanceMarginString);
        const entryPriceString = this.safeString(position, 'entryPrice');
        let entryPrice = this.parseNumber(entryPriceString);
        const notionalString = this.safeString2(position, 'notional', 'notionalValue');
        const notionalStringAbs = Precise["default"].stringAbs(notionalString);
        const notional = this.parseNumber(notionalStringAbs);
        let contractsString = this.safeString(position, 'positionAmt');
        let contractsStringAbs = Precise["default"].stringAbs(contractsString);
        if (contractsString === undefined) {
            const entryNotional = Precise["default"].stringMul(Precise["default"].stringMul(leverageString, initialMarginString), entryPriceString);
            const contractSizeNew = this.safeString(market, 'contractSize');
            contractsString = Precise["default"].stringDiv(entryNotional, contractSizeNew);
            contractsStringAbs = Precise["default"].stringDiv(Precise["default"].stringAdd(contractsString, '0.5'), '1', 0);
        }
        const contracts = this.parseNumber(contractsStringAbs);
        const leverageBrackets = this.safeDict(this.options, 'leverageBrackets', {});
        const leverageBracket = this.safeList(leverageBrackets, symbol, []);
        let maintenanceMarginPercentageString = undefined;
        for (let i = 0; i < leverageBracket.length; i++) {
            const bracket = leverageBracket[i];
            if (Precise["default"].stringLt(notionalStringAbs, bracket[0])) {
                break;
            }
            maintenanceMarginPercentageString = bracket[1];
        }
        const maintenanceMarginPercentage = this.parseNumber(maintenanceMarginPercentageString);
        const unrealizedPnlString = this.safeString(position, 'unrealizedProfit');
        const unrealizedPnl = this.parseNumber(unrealizedPnlString);
        let timestamp = this.safeInteger(position, 'updateTime');
        if (timestamp === 0) {
            timestamp = undefined;
        }
        let isolated = this.safeBool(position, 'isolated');
        if (isolated === undefined) {
            const isolatedMarginRaw = this.safeString(position, 'isolatedMargin');
            isolated = !Precise["default"].stringEq(isolatedMarginRaw, '0');
        }
        let marginMode = undefined;
        let collateralString = undefined;
        let walletBalance = undefined;
        if (isolated) {
            marginMode = 'isolated';
            walletBalance = this.safeString(position, 'isolatedWallet');
            collateralString = Precise["default"].stringAdd(walletBalance, unrealizedPnlString);
        }
        else {
            marginMode = 'cross';
            walletBalance = this.safeString(position, 'crossWalletBalance');
            collateralString = this.safeString(position, 'crossMargin');
        }
        const collateral = this.parseNumber(collateralString);
        let marginRatio = undefined;
        let side = undefined;
        let percentage = undefined;
        let liquidationPriceStringRaw = undefined;
        let liquidationPrice = undefined;
        const contractSize = this.safeValue(market, 'contractSize');
        const contractSizeString = this.numberToString(contractSize);
        if (Precise["default"].stringEquals(notionalString, '0')) {
            entryPrice = undefined;
        }
        else {
            side = Precise["default"].stringLt(notionalString, '0') ? 'short' : 'long';
            marginRatio = this.parseNumber(Precise["default"].stringDiv(Precise["default"].stringAdd(Precise["default"].stringDiv(maintenanceMarginString, collateralString), '5e-5'), '1', 4));
            percentage = this.parseNumber(Precise["default"].stringMul(Precise["default"].stringDiv(unrealizedPnlString, initialMarginString, 4), '100'));
            if (usdm) {
                // calculate liquidation price
                //
                // liquidationPrice = (walletBalance / (contracts * (±1 + mmp))) + (±entryPrice / (±1 + mmp))
                //
                // mmp = maintenanceMarginPercentage
                // where ± is negative for long and positive for short
                // TODO: calculate liquidation price for coinm contracts
                let onePlusMaintenanceMarginPercentageString = undefined;
                let entryPriceSignString = entryPriceString;
                if (side === 'short') {
                    onePlusMaintenanceMarginPercentageString = Precise["default"].stringAdd('1', maintenanceMarginPercentageString);
                }
                else {
                    onePlusMaintenanceMarginPercentageString = Precise["default"].stringAdd('-1', maintenanceMarginPercentageString);
                    entryPriceSignString = Precise["default"].stringMul('-1', entryPriceSignString);
                }
                const leftSide = Precise["default"].stringDiv(walletBalance, Precise["default"].stringMul(contractsStringAbs, onePlusMaintenanceMarginPercentageString));
                const rightSide = Precise["default"].stringDiv(entryPriceSignString, onePlusMaintenanceMarginPercentageString);
                liquidationPriceStringRaw = Precise["default"].stringAdd(leftSide, rightSide);
            }
            else {
                // calculate liquidation price
                //
                // liquidationPrice = (contracts * contractSize(±1 - mmp)) / (±1/entryPrice * contracts * contractSize - walletBalance)
                //
                let onePlusMaintenanceMarginPercentageString = undefined;
                let entryPriceSignString = entryPriceString;
                if (side === 'short') {
                    onePlusMaintenanceMarginPercentageString = Precise["default"].stringSub('1', maintenanceMarginPercentageString);
                }
                else {
                    onePlusMaintenanceMarginPercentageString = Precise["default"].stringSub('-1', maintenanceMarginPercentageString);
                    entryPriceSignString = Precise["default"].stringMul('-1', entryPriceSignString);
                }
                const size = Precise["default"].stringMul(contractsStringAbs, contractSizeString);
                const leftSide = Precise["default"].stringMul(size, onePlusMaintenanceMarginPercentageString);
                const rightSide = Precise["default"].stringSub(Precise["default"].stringMul(Precise["default"].stringDiv('1', entryPriceSignString), size), walletBalance);
                liquidationPriceStringRaw = Precise["default"].stringDiv(leftSide, rightSide);
            }
            const pricePrecision = this.precisionFromString(this.safeString(market['precision'], 'price'));
            const pricePrecisionPlusOne = pricePrecision + 1;
            const pricePrecisionPlusOneString = pricePrecisionPlusOne.toString();
            // round half up
            const rounder = new Precise["default"]('5e-' + pricePrecisionPlusOneString);
            const rounderString = rounder.toString();
            const liquidationPriceRoundedString = Precise["default"].stringAdd(rounderString, liquidationPriceStringRaw);
            let truncatedLiquidationPrice = Precise["default"].stringDiv(liquidationPriceRoundedString, '1', pricePrecision);
            if (truncatedLiquidationPrice[0] === '-') {
                // user cannot be liquidated
                // since he has more collateral than the size of the position
                truncatedLiquidationPrice = undefined;
            }
            liquidationPrice = this.parseNumber(truncatedLiquidationPrice);
        }
        const positionSide = this.safeString(position, 'positionSide');
        const hedged = positionSide !== 'BOTH';
        return {
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'initialMargin': initialMargin,
            'initialMarginPercentage': this.parseNumber(initialMarginPercentageString),
            'maintenanceMargin': maintenanceMargin,
            'maintenanceMarginPercentage': maintenanceMarginPercentage,
            'entryPrice': entryPrice,
            'notional': notional,
            'leverage': this.parseNumber(leverageString),
            'unrealizedPnl': unrealizedPnl,
            'contracts': contracts,
            'contractSize': contractSize,
            'marginRatio': marginRatio,
            'liquidationPrice': liquidationPrice,
            'markPrice': undefined,
            'collateral': collateral,
            'marginMode': marginMode,
            'side': side,
            'hedged': hedged,
            'percentage': percentage,
        };
    }
    parsePositionRisk(position, market = undefined) {
        //
        // usdm
        //
        //  {
        //     symbol: "WLDUSDT",
        //     positionSide: "BOTH",
        //     positionAmt: "5",
        //     entryPrice: "2.3483",
        //     breakEvenPrice: "2.349356735",
        //     markPrice: "2.39560000",
        //     unRealizedProfit: "0.23650000",
        //     liquidationPrice: "0",
        //     isolatedMargin: "0",
        //     notional: "11.97800000",
        //     isolatedWallet: "0",
        //     updateTime: "1722062678998",
        //     initialMargin: "2.39560000",         // not in v2
        //     maintMargin: "0.07186800",           // not in v2
        //     positionInitialMargin: "2.39560000", // not in v2
        //     openOrderInitialMargin: "0",         // not in v2
        //     adl: "2",                            // not in v2
        //     bidNotional: "0",                    // not in v2
        //     askNotional: "0",                    // not in v2
        //     marginAsset: "USDT",                 // not in v2
        //     // the below fields are only in v2
        //     leverage: "5",
        //     maxNotionalValue: "6000000",
        //     marginType: "cross",
        //     isAutoAddMargin: "false",
        //     isolated: false,
        //     adlQuantile: "2",
        //
        // coinm
        //
        //     {
        //       "symbol": "BTCUSD_PERP",
        //       "positionAmt": "2",
        //       "entryPrice": "37643.10000021",
        //       "markPrice": "38103.05510455",
        //       "unRealizedProfit": "0.00006413",
        //       "liquidationPrice": "25119.97445760",
        //       "leverage": "2",
        //       "maxQty": "1500",
        //       "marginType": "isolated",
        //       "isolatedMargin": "0.00274471",
        //       "isAutoAddMargin": "false",
        //       "positionSide": "BOTH",
        //       "notionalValue": "0.00524892",
        //       "isolatedWallet": "0.00268058"
        //     }
        //
        // inverse portfolio margin
        //
        //     {
        //         "symbol": "ETHUSD_PERP",
        //         "positionAmt": "1",
        //         "entryPrice": "2422.400000007",
        //         "markPrice": "2424.51267823",
        //         "unRealizedProfit": "0.0000036",
        //         "liquidationPrice": "293.57678898",
        //         "leverage": "100",
        //         "positionSide": "LONG",
        //         "updateTime": 1707371941861,
        //         "maxQty": "15",
        //         "notionalValue": "0.00412454",
        //         "breakEvenPrice": "2423.368960034"
        //     }
        //
        // linear portfolio margin
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "positionAmt": "0.01",
        //         "entryPrice": "44525.0",
        //         "markPrice": "45464.1735922",
        //         "unRealizedProfit": "9.39173592",
        //         "liquidationPrice": "38007.16308568",
        //         "leverage": "100",
        //         "positionSide": "LONG",
        //         "updateTime": 1707371879042,
        //         "maxNotionalValue": "500000.0",
        //         "notional": "454.64173592",
        //         "breakEvenPrice": "44542.81"
        //     }
        //
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market, undefined, 'contract');
        const symbol = this.safeString(market, 'symbol');
        const isolatedMarginString = this.safeString(position, 'isolatedMargin');
        const leverageBrackets = this.safeDict(this.options, 'leverageBrackets', {});
        const leverageBracket = this.safeList(leverageBrackets, symbol, []);
        const notionalString = this.safeString2(position, 'notional', 'notionalValue');
        const notionalStringAbs = Precise["default"].stringAbs(notionalString);
        let maintenanceMarginPercentageString = undefined;
        for (let i = 0; i < leverageBracket.length; i++) {
            const bracket = leverageBracket[i];
            if (Precise["default"].stringLt(notionalStringAbs, bracket[0])) {
                break;
            }
            maintenanceMarginPercentageString = bracket[1];
        }
        const notional = this.parseNumber(notionalStringAbs);
        const contractsAbs = Precise["default"].stringAbs(this.safeString(position, 'positionAmt'));
        const contracts = this.parseNumber(contractsAbs);
        const unrealizedPnlString = this.safeString(position, 'unRealizedProfit');
        const unrealizedPnl = this.parseNumber(unrealizedPnlString);
        const liquidationPriceString = this.omitZero(this.safeString(position, 'liquidationPrice'));
        const liquidationPrice = this.parseNumber(liquidationPriceString);
        let collateralString = undefined;
        let marginMode = this.safeString(position, 'marginType');
        if (marginMode === undefined && isolatedMarginString !== undefined) {
            marginMode = Precise["default"].stringEq(isolatedMarginString, '0') ? 'cross' : 'isolated';
        }
        let side = undefined;
        if (Precise["default"].stringGt(notionalString, '0')) {
            side = 'long';
        }
        else if (Precise["default"].stringLt(notionalString, '0')) {
            side = 'short';
        }
        const entryPriceString = this.safeString(position, 'entryPrice');
        const entryPrice = this.parseNumber(entryPriceString);
        const contractSize = this.safeValue(market, 'contractSize');
        const contractSizeString = this.numberToString(contractSize);
        // as oppose to notionalValue
        const linear = ('notional' in position);
        if (marginMode === 'cross') {
            // calculate collateral
            const precision = this.safeDict(market, 'precision', {});
            const basePrecisionValue = this.safeString(precision, 'base');
            const quotePrecisionValue = this.safeString2(precision, 'quote', 'price');
            const precisionIsUndefined = (basePrecisionValue === undefined) && (quotePrecisionValue === undefined);
            if (!precisionIsUndefined) {
                if (linear) {
                    // walletBalance = (liquidationPrice * (±1 + mmp) ± entryPrice) * contracts
                    let onePlusMaintenanceMarginPercentageString = undefined;
                    let entryPriceSignString = entryPriceString;
                    if (side === 'short') {
                        onePlusMaintenanceMarginPercentageString = Precise["default"].stringAdd('1', maintenanceMarginPercentageString);
                        entryPriceSignString = Precise["default"].stringMul('-1', entryPriceSignString);
                    }
                    else {
                        onePlusMaintenanceMarginPercentageString = Precise["default"].stringAdd('-1', maintenanceMarginPercentageString);
                    }
                    const inner = Precise["default"].stringMul(liquidationPriceString, onePlusMaintenanceMarginPercentageString);
                    const leftSide = Precise["default"].stringAdd(inner, entryPriceSignString);
                    const quotePrecision = this.precisionFromString(this.safeString2(precision, 'quote', 'price'));
                    if (quotePrecision !== undefined) {
                        collateralString = Precise["default"].stringDiv(Precise["default"].stringMul(leftSide, contractsAbs), '1', quotePrecision);
                    }
                }
                else {
                    // walletBalance = (contracts * contractSize) * (±1/entryPrice - (±1 - mmp) / liquidationPrice)
                    let onePlusMaintenanceMarginPercentageString = undefined;
                    let entryPriceSignString = entryPriceString;
                    if (side === 'short') {
                        onePlusMaintenanceMarginPercentageString = Precise["default"].stringSub('1', maintenanceMarginPercentageString);
                    }
                    else {
                        onePlusMaintenanceMarginPercentageString = Precise["default"].stringSub('-1', maintenanceMarginPercentageString);
                        entryPriceSignString = Precise["default"].stringMul('-1', entryPriceSignString);
                    }
                    const leftSide = Precise["default"].stringMul(contractsAbs, contractSizeString);
                    const rightSide = Precise["default"].stringSub(Precise["default"].stringDiv('1', entryPriceSignString), Precise["default"].stringDiv(onePlusMaintenanceMarginPercentageString, liquidationPriceString));
                    const basePrecision = this.precisionFromString(this.safeString(precision, 'base'));
                    if (basePrecision !== undefined) {
                        collateralString = Precise["default"].stringDiv(Precise["default"].stringMul(leftSide, rightSide), '1', basePrecision);
                    }
                }
            }
        }
        else {
            collateralString = this.safeString(position, 'isolatedMargin');
        }
        collateralString = (collateralString === undefined) ? '0' : collateralString;
        const collateral = this.parseNumber(collateralString);
        const markPrice = this.parseNumber(this.omitZero(this.safeString(position, 'markPrice')));
        let timestamp = this.safeInteger(position, 'updateTime');
        if (timestamp === 0) {
            timestamp = undefined;
        }
        const maintenanceMarginPercentage = this.parseNumber(maintenanceMarginPercentageString);
        let maintenanceMarginString = Precise["default"].stringMul(maintenanceMarginPercentageString, notionalStringAbs);
        if (maintenanceMarginString === undefined) {
            // for a while, this new value was a backup to the existing calculations, but in future we might prioritize this
            maintenanceMarginString = this.safeString(position, 'maintMargin');
        }
        const maintenanceMargin = this.parseNumber(maintenanceMarginString);
        let initialMarginString = undefined;
        let initialMarginPercentageString = undefined;
        const leverageString = this.safeString(position, 'leverage');
        if (leverageString !== undefined) {
            const leverage = parseInt(leverageString);
            const rational = this.isRoundNumber(1000 % leverage);
            initialMarginPercentageString = Precise["default"].stringDiv('1', leverageString, 8);
            if (!rational) {
                initialMarginPercentageString = Precise["default"].stringAdd(initialMarginPercentageString, '1e-8');
            }
            const unrounded = Precise["default"].stringMul(notionalStringAbs, initialMarginPercentageString);
            initialMarginString = Precise["default"].stringDiv(unrounded, '1', 8);
        }
        else {
            initialMarginString = this.safeString(position, 'initialMargin');
            const unrounded = Precise["default"].stringMul(initialMarginString, '1');
            initialMarginPercentageString = Precise["default"].stringDiv(unrounded, notionalStringAbs, 8);
        }
        let marginRatio = undefined;
        let percentage = undefined;
        if (!Precise["default"].stringEquals(collateralString, '0')) {
            marginRatio = this.parseNumber(Precise["default"].stringDiv(Precise["default"].stringAdd(Precise["default"].stringDiv(maintenanceMarginString, collateralString), '5e-5'), '1', 4));
            percentage = this.parseNumber(Precise["default"].stringMul(Precise["default"].stringDiv(unrealizedPnlString, initialMarginString, 4), '100'));
        }
        const positionSide = this.safeString(position, 'positionSide');
        const hedged = positionSide !== 'BOTH';
        return {
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'contracts': contracts,
            'contractSize': contractSize,
            'unrealizedPnl': unrealizedPnl,
            'leverage': this.parseNumber(leverageString),
            'liquidationPrice': liquidationPrice,
            'collateral': collateral,
            'notional': notional,
            'markPrice': markPrice,
            'entryPrice': entryPrice,
            'timestamp': timestamp,
            'initialMargin': this.parseNumber(initialMarginString),
            'initialMarginPercentage': this.parseNumber(initialMarginPercentageString),
            'maintenanceMargin': maintenanceMargin,
            'maintenanceMarginPercentage': maintenanceMarginPercentage,
            'marginRatio': marginRatio,
            'datetime': this.iso8601(timestamp),
            'marginMode': marginMode,
            'marginType': marginMode,
            'side': side,
            'hedged': hedged,
            'percentage': percentage,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        };
    }
    async loadLeverageBrackets(reload = false, params = {}) {
        await this.loadMarkets();
        // by default cache the leverage bracket
        // it contains useful stuff like the maintenance margin and initial margin for positions
        const leverageBrackets = this.safeDict(this.options, 'leverageBrackets');
        if ((leverageBrackets === undefined) || (reload)) {
            const defaultType = this.safeString(this.options, 'defaultType', 'future');
            const type = this.safeString(params, 'type', defaultType);
            const query = this.omit(params, 'type');
            let subType = undefined;
            [subType, params] = this.handleSubTypeAndParams('loadLeverageBrackets', undefined, params, 'linear');
            let isPortfolioMargin = undefined;
            [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'loadLeverageBrackets', 'papi', 'portfolioMargin', false);
            let response = undefined;
            if (this.isLinear(type, subType)) {
                if (isPortfolioMargin) {
                    response = await this.papiGetUmLeverageBracket(query);
                }
                else {
                    response = await this.fapiPrivateGetLeverageBracket(query);
                }
            }
            else if (this.isInverse(type, subType)) {
                if (isPortfolioMargin) {
                    response = await this.papiGetCmLeverageBracket(query);
                }
                else {
                    response = await this.dapiPrivateV2GetLeverageBracket(query);
                }
            }
            else {
                throw new errors.NotSupported(this.id + ' loadLeverageBrackets() supports linear and inverse contracts only');
            }
            this.options['leverageBrackets'] = this.createSafeDictionary();
            for (let i = 0; i < response.length; i++) {
                const entry = response[i];
                const marketId = this.safeString(entry, 'symbol');
                const symbol = this.safeSymbol(marketId, undefined, undefined, 'contract');
                const brackets = this.safeList(entry, 'brackets', []);
                const result = [];
                for (let j = 0; j < brackets.length; j++) {
                    const bracket = brackets[j];
                    const floorValue = this.safeString2(bracket, 'notionalFloor', 'qtyFloor');
                    const maintenanceMarginPercentage = this.safeString(bracket, 'maintMarginRatio');
                    result.push([floorValue, maintenanceMarginPercentage]);
                }
                this.options['leverageBrackets'][symbol] = result;
            }
        }
        return this.options['leverageBrackets'];
    }
    /**
     * @method
     * @name binance#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Notional-and-Leverage-Brackets
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Notional-Bracket-for-Pair
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/UM-Notional-and-Leverage-Brackets
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/CM-Notional-and-Leverage-Brackets
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch the leverage tiers for a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
     */
    async fetchLeverageTiers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchLeverageTiers', undefined, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchLeverageTiers', undefined, params, 'linear');
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchLeverageTiers', 'papi', 'portfolioMargin', false);
        let response = undefined;
        if (this.isLinear(type, subType)) {
            if (isPortfolioMargin) {
                response = await this.papiGetUmLeverageBracket(params);
            }
            else {
                response = await this.fapiPrivateGetLeverageBracket(params);
            }
        }
        else if (this.isInverse(type, subType)) {
            if (isPortfolioMargin) {
                response = await this.papiGetCmLeverageBracket(params);
            }
            else {
                response = await this.dapiPrivateV2GetLeverageBracket(params);
            }
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchLeverageTiers() supports linear and inverse contracts only');
        }
        //
        // usdm
        //
        //    [
        //        {
        //            "symbol": "SUSHIUSDT",
        //            "brackets": [
        //                {
        //                    "bracket": 1,
        //                    "initialLeverage": 50,
        //                    "notionalCap": 50000,
        //                    "notionalFloor": 0,
        //                    "maintMarginRatio": 0.01,
        //                    "cum": 0.0
        //                },
        //                ...
        //            ]
        //        }
        //    ]
        //
        // coinm
        //
        //     [
        //         {
        //             "symbol":"XRPUSD_210326",
        //             "brackets":[
        //                 {
        //                     "bracket":1,
        //                     "initialLeverage":20,
        //                     "qtyCap":500000,
        //                     "qtyFloor":0,
        //                     "maintMarginRatio":0.0185,
        //                     "cum":0.0
        //                 }
        //             ]
        //         }
        //     ]
        //
        return this.parseLeverageTiers(response, symbols, 'symbol');
    }
    parseMarketLeverageTiers(info, market = undefined) {
        /**
         * @ignore
         * @method
         * @param {object} info Exchange response for 1 market
         * @param {object} market CCXT market
         */
        //
        //    {
        //        "symbol": "SUSHIUSDT",
        //        "brackets": [
        //            {
        //                "bracket": 1,
        //                "initialLeverage": 50,
        //                "notionalCap": 50000,
        //                "notionalFloor": 0,
        //                "maintMarginRatio": 0.01,
        //                "cum": 0.0
        //            },
        //            ...
        //        ]
        //    }
        //
        const marketId = this.safeString(info, 'symbol');
        market = this.safeMarket(marketId, market, undefined, 'contract');
        const brackets = this.safeList(info, 'brackets', []);
        const tiers = [];
        for (let j = 0; j < brackets.length; j++) {
            const bracket = brackets[j];
            tiers.push({
                'tier': this.safeNumber(bracket, 'bracket'),
                'symbol': this.safeSymbol(marketId, market),
                'currency': market['quote'],
                'minNotional': this.safeNumber2(bracket, 'notionalFloor', 'qtyFloor'),
                'maxNotional': this.safeNumber2(bracket, 'notionalCap', 'qtyCap'),
                'maintenanceMarginRate': this.safeNumber(bracket, 'maintMarginRatio'),
                'maxLeverage': this.safeNumber(bracket, 'initialLeverage'),
                'info': bracket,
            });
        }
        return tiers;
    }
    /**
     * @method
     * @name binance#fetchPosition
     * @description fetch data on an open position
     * @see https://developers.binance.com/docs/derivatives/option/trade/Option-Position-Information
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPosition(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['option']) {
            throw new errors.NotSupported(this.id + ' fetchPosition() supports option markets only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.eapiPrivateGetPosition(this.extend(request, params));
        //
        //     [
        //         {
        //             "entryPrice": "27.70000000",
        //             "symbol": "ETH-230426-1850-C",
        //             "side": "LONG",
        //             "quantity": "0.50000000",
        //             "reducibleQty": "0.50000000",
        //             "markValue": "10.250000000",
        //             "ror": "-0.2599",
        //             "unrealizedPNL": "-3.600000000",
        //             "markPrice": "20.5",
        //             "strikePrice": "1850.00000000",
        //             "positionCost": "13.85000000",
        //             "expiryDate": 1682496000000,
        //             "priceScale": 1,
        //             "quantityScale": 2,
        //             "optionSide": "CALL",
        //             "quoteAsset": "USDT",
        //             "time": 1682492427106
        //         }
        //     ]
        //
        return this.parsePosition(response[0], market);
    }
    /**
     * @method
     * @name binance#fetchOptionPositions
     * @description fetch data on open options positions
     * @see https://developers.binance.com/docs/derivatives/option/trade/Option-Position-Information
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchOptionPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const request = {};
        let market = undefined;
        if (symbols !== undefined) {
            let symbol = undefined;
            if (Array.isArray(symbols)) {
                const symbolsLength = symbols.length;
                if (symbolsLength > 1) {
                    throw new errors.BadRequest(this.id + ' fetchPositions() symbols argument cannot contain more than 1 symbol');
                }
                symbol = symbols[0];
            }
            else {
                symbol = symbols;
            }
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.eapiPrivateGetPosition(this.extend(request, params));
        //
        //     [
        //         {
        //             "entryPrice": "27.70000000",
        //             "symbol": "ETH-230426-1850-C",
        //             "side": "LONG",
        //             "quantity": "0.50000000",
        //             "reducibleQty": "0.50000000",
        //             "markValue": "10.250000000",
        //             "ror": "-0.2599",
        //             "unrealizedPNL": "-3.600000000",
        //             "markPrice": "20.5",
        //             "strikePrice": "1850.00000000",
        //             "positionCost": "13.85000000",
        //             "expiryDate": 1682496000000,
        //             "priceScale": 1,
        //             "quantityScale": 2,
        //             "optionSide": "CALL",
        //             "quoteAsset": "USDT",
        //             "time": 1682492427106
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            result.push(this.parsePosition(response[i], market));
        }
        return this.filterByArrayPositions(result, 'symbol', symbols, false);
    }
    parsePosition(position, market = undefined) {
        //
        //     {
        //         "entryPrice": "27.70000000",
        //         "symbol": "ETH-230426-1850-C",
        //         "side": "LONG",
        //         "quantity": "0.50000000",
        //         "reducibleQty": "0.50000000",
        //         "markValue": "10.250000000",
        //         "ror": "-0.2599",
        //         "unrealizedPNL": "-3.600000000",
        //         "markPrice": "20.5",
        //         "strikePrice": "1850.00000000",
        //         "positionCost": "13.85000000",
        //         "expiryDate": 1682496000000,
        //         "priceScale": 1,
        //         "quantityScale": 2,
        //         "optionSide": "CALL",
        //         "quoteAsset": "USDT",
        //         "time": 1682492427106
        //     }
        //
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market, undefined, 'swap');
        const symbol = market['symbol'];
        const side = this.safeStringLower(position, 'side');
        let quantity = this.safeString(position, 'quantity');
        if (side !== 'long') {
            quantity = Precise["default"].stringMul('-1', quantity);
        }
        const timestamp = this.safeInteger(position, 'time');
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'entryPrice': this.safeNumber(position, 'entryPrice'),
            'markPrice': this.safeNumber(position, 'markPrice'),
            'notional': this.safeNumber(position, 'markValue'),
            'collateral': this.safeNumber(position, 'positionCost'),
            'unrealizedPnl': this.safeNumber(position, 'unrealizedPNL'),
            'side': side,
            'contracts': this.parseNumber(quantity),
            'contractSize': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'hedged': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': undefined,
            'liquidationPrice': undefined,
            'marginRatio': undefined,
            'marginMode': undefined,
            'percentage': undefined,
        });
    }
    /**
     * @method
     * @name binance#fetchPositions
     * @description fetch all open positions
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V2
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Position-Information
     * @see https://developers.binance.com/docs/derivatives/option/trade/Option-Position-Information
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] method name to call, "positionRisk", "account" or "option", default is "positionRisk"
     * @param {bool} [params.useV2] set to true if you want to use the obsolete endpoint, where some more additional fields were provided
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        let defaultMethod = undefined;
        [defaultMethod, params] = this.handleOptionAndParams(params, 'fetchPositions', 'method');
        if (defaultMethod === undefined) {
            const options = this.safeDict(this.options, 'fetchPositions');
            if (options === undefined) {
                defaultMethod = this.safeString(this.options, 'fetchPositions', 'positionRisk');
            }
            else {
                defaultMethod = 'positionRisk';
            }
        }
        if (defaultMethod === 'positionRisk') {
            return await this.fetchPositionsRisk(symbols, params);
        }
        else if (defaultMethod === 'account') {
            return await this.fetchAccountPositions(symbols, params);
        }
        else if (defaultMethod === 'option') {
            return await this.fetchOptionPositions(symbols, params);
        }
        else {
            throw new errors.NotSupported(this.id + '.options["fetchPositions"]["method"] or params["method"] = "' + defaultMethod + '" is invalid, please choose between "account", "positionRisk" and "option"');
        }
    }
    /**
     * @method
     * @name binance#fetchAccountPositions
     * @ignore
     * @description fetch account positions
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V2
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Position-Information
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V3
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch positions in a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @param {boolean} [params.filterClosed] set to true if you would like to filter out closed positions, default is false
     * @param {boolean} [params.useV2] set to true if you want to use obsolete endpoint, where some more additional fields were provided
     * @returns {object} data on account positions
     */
    async fetchAccountPositions(symbols = undefined, params = {}) {
        if (symbols !== undefined) {
            if (!Array.isArray(symbols)) {
                throw new errors.ArgumentsRequired(this.id + ' fetchPositions() requires an array argument for symbols');
            }
        }
        await this.loadMarkets();
        await this.loadLeverageBrackets(false, params);
        const defaultType = this.safeString(this.options, 'defaultType', 'future');
        const type = this.safeString(params, 'type', defaultType);
        params = this.omit(params, 'type');
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchAccountPositions', undefined, params, 'linear');
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchAccountPositions', 'papi', 'portfolioMargin', false);
        let response = undefined;
        if (this.isLinear(type, subType)) {
            if (isPortfolioMargin) {
                response = await this.papiGetUmAccount(params);
            }
            else {
                let useV2 = undefined;
                [useV2, params] = this.handleOptionAndParams(params, 'fetchAccountPositions', 'useV2', false);
                if (!useV2) {
                    response = await this.fapiPrivateV3GetAccount(params);
                }
                else {
                    response = await this.fapiPrivateV2GetAccount(params);
                }
                //
                //    {
                //        "totalInitialMargin": "99.62112386",
                //        "totalMaintMargin": "11.95453485",
                //        "totalWalletBalance": "99.84331553",
                //        "totalUnrealizedProfit": "11.17675690",
                //        "totalMarginBalance": "111.02007243",
                //        "totalPositionInitialMargin": "99.62112386",
                //        "totalOpenOrderInitialMargin": "0.00000000",
                //        "totalCrossWalletBalance": "99.84331553",
                //        "totalCrossUnPnl": "11.17675690",
                //        "availableBalance": "11.39894857",
                //        "maxWithdrawAmount": "11.39894857",
                //        "feeTier": "0",      // in v2
                //        "canTrade": true,    // in v2
                //        "canDeposit": true,  // in v2
                //        "canWithdraw": true, // in v2
                //        "feeBurn": true,     // in v2
                //        "tradeGroupId": "-1",// in v2
                //        "updateTime": "0",   // in v2
                //        "multiAssetsMargin": true // in v2
                //        "assets": [
                //            {
                //                "asset": "USDT",
                //                "walletBalance": "72.72317863",
                //                "unrealizedProfit": "11.17920750",
                //                "marginBalance": "83.90238613",
                //                "maintMargin": "11.95476475",
                //                "initialMargin": "99.62303962",
                //                "positionInitialMargin": "99.62303962",
                //                "openOrderInitialMargin": "0.00000000",
                //                "crossWalletBalance": "72.72317863",
                //                "crossUnPnl": "11.17920750",
                //                "availableBalance": "11.39916777",
                //                "maxWithdrawAmount": "11.39916777",
                //                "updateTime": "1721995605338",
                //                "marginAvailable": true // in v2
                //            },
                //            ... and some few supported settle currencies: USDC, BTC, ETH, BNB ..
                //        ],
                //        "positions": [
                //            {
                //                "symbol": "WLDUSDT",
                //                "positionSide": "BOTH",
                //                "positionAmt": "-849",
                //                "unrealizedProfit": "11.17920750",
                //                "isolatedMargin": "0",
                //                "isolatedWallet": "0",
                //                "notional": "-1992.46079250",
                //                "initialMargin": "99.62303962",
                //                "maintMargin": "11.95476475",
                //                "updateTime": "1721995760449"
                //                "leverage": "50",                        // in v2
                //                "entryPrice": "2.34",                    // in v2
                //                "positionInitialMargin": "118.82116614", // in v2
                //                "openOrderInitialMargin": "0",           // in v2
                //                "isolated": false,                       // in v2
                //                "breakEvenPrice": "2.3395788",           // in v2
                //                "maxNotional": "25000",                  // in v2
                //                "bidNotional": "0",                      // in v2
                //                "askNotional": "0"                       // in v2
                //            },
                //            ...
                //        ]
                //    }
                //
            }
        }
        else if (this.isInverse(type, subType)) {
            if (isPortfolioMargin) {
                response = await this.papiGetCmAccount(params);
            }
            else {
                response = await this.dapiPrivateGetAccount(params);
            }
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchPositions() supports linear and inverse contracts only');
        }
        let filterClosed = undefined;
        [filterClosed, params] = this.handleOptionAndParams(params, 'fetchAccountPositions', 'filterClosed', false);
        const result = this.parseAccountPositions(response, filterClosed);
        symbols = this.marketSymbols(symbols);
        return this.filterByArrayPositions(result, 'symbol', symbols, false);
    }
    /**
     * @method
     * @name binance#fetchPositionsRisk
     * @ignore
     * @description fetch positions risk
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V2
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Position-Information
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Query-UM-Position-Information
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Query-CM-Position-Information
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V3
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch positions for a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @param {bool} [params.useV2] set to true if you want to use the obsolete endpoint, where some more additional fields were provided
     * @returns {object} data on the positions risk
     */
    async fetchPositionsRisk(symbols = undefined, params = {}) {
        if (symbols !== undefined) {
            if (!Array.isArray(symbols)) {
                throw new errors.ArgumentsRequired(this.id + ' fetchPositionsRisk() requires an array argument for symbols');
            }
        }
        await this.loadMarkets();
        await this.loadLeverageBrackets(false, params);
        const request = {};
        let defaultType = 'future';
        defaultType = this.safeString(this.options, 'defaultType', defaultType);
        const type = this.safeString(params, 'type', defaultType);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchPositionsRisk', undefined, params, 'linear');
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchPositionsRisk', 'papi', 'portfolioMargin', false);
        params = this.omit(params, 'type');
        let response = undefined;
        if (this.isLinear(type, subType)) {
            if (isPortfolioMargin) {
                response = await this.papiGetUmPositionRisk(this.extend(request, params));
            }
            else {
                let useV2 = undefined;
                [useV2, params] = this.handleOptionAndParams(params, 'fetchPositionsRisk', 'useV2', false);
                params = this.extend(request, params);
                if (!useV2) {
                    response = await this.fapiPrivateV3GetPositionRisk(params);
                }
                else {
                    response = await this.fapiPrivateV2GetPositionRisk(params);
                }
                //
                // [
                //  {
                //     symbol: "WLDUSDT",
                //     positionSide: "BOTH",
                //     positionAmt: "5",
                //     entryPrice: "2.3483",
                //     breakEvenPrice: "2.349356735",
                //     markPrice: "2.39560000",
                //     unRealizedProfit: "0.23650000",
                //     liquidationPrice: "0",
                //     isolatedMargin: "0",
                //     notional: "11.97800000",
                //     isolatedWallet: "0",
                //     updateTime: "1722062678998",
                //     initialMargin: "2.39560000",         // added in v3
                //     maintMargin: "0.07186800",           // added in v3
                //     positionInitialMargin: "2.39560000", // added in v3
                //     openOrderInitialMargin: "0",         // added in v3
                //     adl: "2",                            // added in v3
                //     bidNotional: "0",                    // added in v3
                //     askNotional: "0",                    // added in v3
                //     marginAsset: "USDT",                 // added in v3
                //  },
                // ]
                //
            }
        }
        else if (this.isInverse(type, subType)) {
            if (isPortfolioMargin) {
                response = await this.papiGetCmPositionRisk(this.extend(request, params));
            }
            else {
                response = await this.dapiPrivateGetPositionRisk(this.extend(request, params));
            }
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchPositionsRisk() supports linear and inverse contracts only');
        }
        // ### Response examples ###
        //
        // For One-way position mode:
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "positionSide": "BOTH",
        //             "positionAmt": "0.000",
        //             "entryPrice": "0.00000",
        //             "markPrice": "6679.50671178",
        //             "unRealizedProfit": "0.00000000",
        //             "liquidationPrice": "0",
        //             "isolatedMargin": "0.00000000",
        //             "marginType": "isolated",
        //             "isAutoAddMargin": "false",
        //             "leverage": "10",
        //             "maxNotionalValue": "20000000",
        //             "updateTime": 0
        //        }
        //     ]
        //
        // For Hedge position mode:
        //
        //     [
        //         {
        //             "entryPrice": "6563.66500",
        //             "marginType": "isolated",
        //             "isAutoAddMargin": "false",
        //             "isolatedMargin": "15517.54150468",
        //             "leverage": "10",
        //             "liquidationPrice": "5930.78",
        //             "markPrice": "6679.50671178",
        //             "maxNotionalValue": "20000000",
        //             "positionSide": "LONG",
        //             "positionAmt": "20.000", // negative value for 'SHORT'
        //             "symbol": "BTCUSDT",
        //             "unRealizedProfit": "2316.83423560"
        //             "updateTime": 1625474304765
        //         },
        //         .. second dict is similar, but with `positionSide: SHORT`
        //     ]
        //
        // inverse portfolio margin:
        //
        //     [
        //         {
        //             "symbol": "ETHUSD_PERP",
        //             "positionAmt": "1",
        //             "entryPrice": "2422.400000007",
        //             "markPrice": "2424.51267823",
        //             "unRealizedProfit": "0.0000036",
        //             "liquidationPrice": "293.57678898",
        //             "leverage": "100",
        //             "positionSide": "LONG",
        //             "updateTime": 1707371941861,
        //             "maxQty": "15",
        //             "notionalValue": "0.00412454",
        //             "breakEvenPrice": "2423.368960034"
        //         }
        //     ]
        //
        // linear portfolio margin:
        //
        //     [
        //         {
        //             "symbol": "BTCUSDT",
        //             "positionAmt": "0.01",
        //             "entryPrice": "44525.0",
        //             "markPrice": "45464.1735922",
        //             "unRealizedProfit": "9.39173592",
        //             "liquidationPrice": "38007.16308568",
        //             "leverage": "100",
        //             "positionSide": "LONG",
        //             "updateTime": 1707371879042,
        //             "maxNotionalValue": "500000.0",
        //             "notional": "454.64173592",
        //             "breakEvenPrice": "44542.81"
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const rawPosition = response[i];
            const entryPriceString = this.safeString(rawPosition, 'entryPrice');
            if (Precise["default"].stringGt(entryPriceString, '0')) {
                result.push(this.parsePositionRisk(response[i]));
            }
        }
        symbols = this.marketSymbols(symbols);
        return this.filterByArrayPositions(result, 'symbol', symbols, false);
    }
    /**
     * @method
     * @name binance#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Get-Income-History
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Get-Income-History
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-UM-Income-History
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-CM-Income-History
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding history entry
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch the funding history for a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        let request = {
            'incomeType': 'FUNDING_FEE', // "TRANSFER"，"WELCOME_BONUS", "REALIZED_PNL"，"FUNDING_FEE", "COMMISSION" and "INSURANCE_CLEAR"
        };
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
            if (!market['swap']) {
                throw new errors.NotSupported(this.id + ' fetchFundingHistory() supports swap contracts only');
            }
        }
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchFundingHistory', market, params, 'linear');
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchFundingHistory', 'papi', 'portfolioMargin', false);
        [request, params] = this.handleUntilOption('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const defaultType = this.safeString2(this.options, 'fetchFundingHistory', 'defaultType', 'future');
        const type = this.safeString(params, 'type', defaultType);
        params = this.omit(params, 'type');
        let response = undefined;
        if (this.isLinear(type, subType)) {
            if (isPortfolioMargin) {
                response = await this.papiGetUmIncome(this.extend(request, params));
            }
            else {
                response = await this.fapiPrivateGetIncome(this.extend(request, params));
            }
        }
        else if (this.isInverse(type, subType)) {
            if (isPortfolioMargin) {
                response = await this.papiGetCmIncome(this.extend(request, params));
            }
            else {
                response = await this.dapiPrivateGetIncome(this.extend(request, params));
            }
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchFundingHistory() supports linear and inverse contracts only');
        }
        return this.parseIncomes(response, market, since, limit);
    }
    /**
     * @method
     * @name binance#setLeverage
     * @description set the level of leverage for a market
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Change-Initial-Leverage
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Change-Initial-Leverage
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Change-UM-Initial-Leverage
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Change-CM-Initial-Leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to set the leverage for a trading pair in a portfolio margin account
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        if ((leverage < 1) || (leverage > 125)) {
            throw new errors.BadRequest(this.id + ' leverage should be between 1 and 125');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'leverage': leverage,
        };
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'setLeverage', 'papi', 'portfolioMargin', false);
        let response = undefined;
        if (market['linear']) {
            if (isPortfolioMargin) {
                response = await this.papiPostUmLeverage(this.extend(request, params));
            }
            else {
                response = await this.fapiPrivatePostLeverage(this.extend(request, params));
            }
        }
        else if (market['inverse']) {
            if (isPortfolioMargin) {
                response = await this.papiPostCmLeverage(this.extend(request, params));
            }
            else {
                response = await this.dapiPrivatePostLeverage(this.extend(request, params));
            }
        }
        else {
            throw new errors.NotSupported(this.id + ' setLeverage() supports linear and inverse contracts only');
        }
        return response;
    }
    /**
     * @method
     * @name binance#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Change-Margin-Type
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Change-Margin-Type
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setMarginMode(marginMode, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires a symbol argument');
        }
        //
        // { "code": -4048 , "msg": "Margin type cannot be changed if there exists position." }
        //
        // or
        //
        // { "code": 200, "msg": "success" }
        //
        marginMode = marginMode.toUpperCase();
        if (marginMode === 'CROSS') {
            marginMode = 'CROSSED';
        }
        if ((marginMode !== 'ISOLATED') && (marginMode !== 'CROSSED')) {
            throw new errors.BadRequest(this.id + ' marginMode must be either isolated or cross');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'marginType': marginMode,
        };
        let response = undefined;
        try {
            if (market['linear']) {
                response = await this.fapiPrivatePostMarginType(this.extend(request, params));
            }
            else if (market['inverse']) {
                response = await this.dapiPrivatePostMarginType(this.extend(request, params));
            }
            else {
                throw new errors.NotSupported(this.id + ' setMarginMode() supports linear and inverse contracts only');
            }
        }
        catch (e) {
            // not an error
            // https://github.com/ccxt/ccxt/issues/11268
            // https://github.com/ccxt/ccxt/pull/11624
            // POST https://fapi.binance.com/fapi/v1/marginType 400 Bad Request
            // binanceusdm
            if (e instanceof errors.MarginModeAlreadySet) {
                const throwMarginModeAlreadySet = this.safeBool(this.options, 'throwMarginModeAlreadySet', false);
                if (throwMarginModeAlreadySet) {
                    throw e;
                }
                else {
                    response = { 'code': -4046, 'msg': 'No need to change margin type.' };
                }
            }
            else {
                throw e;
            }
        }
        return response;
    }
    /**
     * @method
     * @name binance#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Change-Position-Mode
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Change-Position-Mode
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-UM-Current-Position-Mode
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-CM-Current-Position-Mode
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol not used by binance setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to set the position mode for a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} response from the exchange
     */
    async setPositionMode(hedged, symbol = undefined, params = {}) {
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('setPositionMode', market, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('setPositionMode', market, params);
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'setPositionMode', 'papi', 'portfolioMargin', false);
        let dualSidePosition = undefined;
        if (hedged) {
            dualSidePosition = 'true';
        }
        else {
            dualSidePosition = 'false';
        }
        const request = {
            'dualSidePosition': dualSidePosition,
        };
        let response = undefined;
        if (this.isInverse(type, subType)) {
            if (isPortfolioMargin) {
                response = await this.papiPostCmPositionSideDual(this.extend(request, params));
            }
            else {
                response = await this.dapiPrivatePostPositionSideDual(this.extend(request, params));
            }
        }
        else if (this.isLinear(type, subType)) {
            if (isPortfolioMargin) {
                response = await this.papiPostUmPositionSideDual(this.extend(request, params));
            }
            else {
                response = await this.fapiPrivatePostPositionSideDual(this.extend(request, params));
            }
        }
        else {
            throw new errors.BadRequest(this.id + ' setPositionMode() supports linear and inverse contracts only');
        }
        //
        //     {
        //       "code": 200,
        //       "msg": "success"
        //     }
        //
        return response;
    }
    /**
     * @method
     * @name binance#fetchLeverages
     * @description fetch the set leverage for all markets
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-UM-Account-Detail
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-CM-Account-Detail
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Symbol-Config
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverages(symbols = undefined, params = {}) {
        await this.loadMarkets();
        await this.loadLeverageBrackets(false, params);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchLeverages', undefined, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchLeverages', undefined, params, 'linear');
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchLeverages', 'papi', 'portfolioMargin', false);
        let response = undefined;
        if (this.isLinear(type, subType)) {
            if (isPortfolioMargin) {
                response = await this.papiGetUmAccount(params);
            }
            else {
                response = await this.fapiPrivateGetSymbolConfig(params);
            }
        }
        else if (this.isInverse(type, subType)) {
            if (isPortfolioMargin) {
                response = await this.papiGetCmAccount(params);
            }
            else {
                response = await this.dapiPrivateGetAccount(params);
            }
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchLeverages() supports linear and inverse contracts only');
        }
        let leverages = this.safeList(response, 'positions', []);
        if (Array.isArray(response)) {
            leverages = response;
        }
        return this.parseLeverages(leverages, symbols, 'symbol');
    }
    parseLeverage(leverage, market = undefined) {
        const marketId = this.safeString(leverage, 'symbol');
        const marginModeRaw = this.safeBool(leverage, 'isolated');
        let marginMode = undefined;
        if (marginModeRaw !== undefined) {
            marginMode = marginModeRaw ? 'isolated' : 'cross';
        }
        const marginTypeRaw = this.safeStringLower(leverage, 'marginType');
        if (marginTypeRaw !== undefined) {
            marginMode = (marginTypeRaw === 'crossed') ? 'cross' : 'isolated';
        }
        const side = this.safeStringLower(leverage, 'positionSide');
        let longLeverage = undefined;
        let shortLeverage = undefined;
        const leverageValue = this.safeInteger(leverage, 'leverage');
        if ((side === undefined) || (side === 'both')) {
            longLeverage = leverageValue;
            shortLeverage = leverageValue;
        }
        else if (side === 'long') {
            longLeverage = leverageValue;
        }
        else if (side === 'short') {
            shortLeverage = leverageValue;
        }
        return {
            'info': leverage,
            'symbol': this.safeSymbol(marketId, market),
            'marginMode': marginMode,
            'longLeverage': longLeverage,
            'shortLeverage': shortLeverage,
        };
    }
    /**
     * @method
     * @name binance#fetchSettlementHistory
     * @description fetches historical settlement records
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Historical-Exercise-Records
     * @param {string} symbol unified market symbol of the settlement history
     * @param {int} [since] timestamp in ms
     * @param {int} [limit] number of records, default 100, max 100
     * @param {object} [params] exchange specific params
     * @returns {object[]} a list of [settlement history objects]{@link https://docs.ccxt.com/#/?id=settlement-history-structure}
     */
    async fetchSettlementHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = (symbol === undefined) ? undefined : this.market(symbol);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchSettlementHistory', market, params);
        if (type !== 'option') {
            throw new errors.NotSupported(this.id + ' fetchSettlementHistory() supports option markets only');
        }
        const request = {};
        if (symbol !== undefined) {
            symbol = market['symbol'];
            request['underlying'] = market['baseId'] + market['quoteId'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.eapiPublicGetExerciseHistory(this.extend(request, params));
        //
        //     [
        //         {
        //             "symbol": "ETH-230223-1900-P",
        //             "strikePrice": "1900",
        //             "realStrikePrice": "1665.5897334",
        //             "expiryDate": 1677139200000,
        //             "strikeResult": "REALISTIC_VALUE_STRICKEN"
        //         }
        //     ]
        //
        const settlements = this.parseSettlements(response, market);
        const sorted = this.sortBy(settlements, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }
    /**
     * @method
     * @name binance#fetchMySettlementHistory
     * @description fetches historical settlement records of the user
     * @see https://developers.binance.com/docs/derivatives/option/trade/User-Exercise-Record
     * @param {string} symbol unified market symbol of the settlement history
     * @param {int} [since] timestamp in ms
     * @param {int} [limit] number of records
     * @param {object} [params] exchange specific params
     * @returns {object[]} a list of [settlement history objects]
     */
    async fetchMySettlementHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = (symbol === undefined) ? undefined : this.market(symbol);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchMySettlementHistory', market, params);
        if (type !== 'option') {
            throw new errors.NotSupported(this.id + ' fetchMySettlementHistory() supports option markets only');
        }
        const request = {};
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
            symbol = market['symbol'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.eapiPrivateGetExerciseRecord(this.extend(request, params));
        //
        //     [
        //         {
        //             "id": "1125899906842897036",
        //             "currency": "USDT",
        //             "symbol": "BTC-230728-30000-C",
        //             "exercisePrice": "30000.00000000",
        //             "markPrice": "29160.71284993",
        //             "quantity": "1.00000000",
        //             "amount": "0.00000000",
        //             "fee": "0.00000000",
        //             "createDate": 1690531200000,
        //             "priceScale": 0,
        //             "quantityScale": 2,
        //             "optionSide": "CALL",
        //             "positionSide": "LONG",
        //             "quoteAsset": "USDT"
        //         }
        //     ]
        //
        const settlements = this.parseSettlements(response, market);
        const sorted = this.sortBy(settlements, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }
    parseSettlement(settlement, market) {
        //
        // fetchSettlementHistory
        //
        //     {
        //         "symbol": "ETH-230223-1900-P",
        //         "strikePrice": "1900",
        //         "realStrikePrice": "1665.5897334",
        //         "expiryDate": 1677139200000,
        //         "strikeResult": "REALISTIC_VALUE_STRICKEN"
        //     }
        //
        // fetchMySettlementHistory
        //
        //     {
        //         "id": "1125899906842897036",
        //         "currency": "USDT",
        //         "symbol": "BTC-230728-30000-C",
        //         "exercisePrice": "30000.00000000",
        //         "markPrice": "29160.71284993",
        //         "quantity": "1.00000000",
        //         "amount": "0.00000000",
        //         "fee": "0.00000000",
        //         "createDate": 1690531200000,
        //         "priceScale": 0,
        //         "quantityScale": 2,
        //         "optionSide": "CALL",
        //         "positionSide": "LONG",
        //         "quoteAsset": "USDT"
        //     }
        //
        const timestamp = this.safeInteger2(settlement, 'expiryDate', 'createDate');
        const marketId = this.safeString(settlement, 'symbol');
        return {
            'info': settlement,
            'symbol': this.safeSymbol(marketId, market),
            'price': this.safeNumber2(settlement, 'realStrikePrice', 'exercisePrice'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    parseSettlements(settlements, market) {
        //
        // fetchSettlementHistory
        //
        //     [
        //         {
        //             "symbol": "ETH-230223-1900-P",
        //             "strikePrice": "1900",
        //             "realStrikePrice": "1665.5897334",
        //             "expiryDate": 1677139200000,
        //             "strikeResult": "EXTRINSIC_VALUE_EXPIRED"
        //         }
        //     ]
        //
        // fetchMySettlementHistory
        //
        //     [
        //         {
        //             "id": "1125899906842897036",
        //             "currency": "USDT",
        //             "symbol": "BTC-230728-30000-C",
        //             "exercisePrice": "30000.00000000",
        //             "markPrice": "29160.71284993",
        //             "quantity": "1.00000000",
        //             "amount": "0.00000000",
        //             "fee": "0.00000000",
        //             "createDate": 1690531200000,
        //             "priceScale": 0,
        //             "quantityScale": 2,
        //             "optionSide": "CALL",
        //             "positionSide": "LONG",
        //             "quoteAsset": "USDT"
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < settlements.length; i++) {
            result.push(this.parseSettlement(settlements[i], market));
        }
        return result;
    }
    /**
     * @method
     * @name binance#fetchLedgerEntry
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://developers.binance.com/docs/derivatives/option/account/Account-Funding-Flow
     * @param {string} id the identification number of the ledger entry
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedgerEntry(id, code = undefined, params = {}) {
        await this.loadMarkets();
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchLedgerEntry', undefined, params);
        if (type !== 'option') {
            throw new errors.BadRequest(this.id + ' fetchLedgerEntry() can only be used for type option');
        }
        this.checkRequiredArgument('fetchLedgerEntry', code, 'code');
        const currency = this.currency(code);
        const request = {
            'recordId': id,
            'currency': currency['id'],
        };
        const response = await this.eapiPrivateGetBill(this.extend(request, params));
        //
        //     [
        //         {
        //             "id": "1125899906845701870",
        //             "asset": "USDT",
        //             "amount": "-0.16518203",
        //             "type": "FEE",
        //             "createDate": 1676621042489
        //         }
        //     ]
        //
        const first = this.safeDict(response, 0, response);
        return this.parseLedgerEntry(first, currency);
    }
    /**
     * @method
     * @name binance#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://developers.binance.com/docs/derivatives/option/account/Account-Funding-Flow
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Get-Income-History
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Get-Income-History
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-UM-Income-History
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-CM-Income-History
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ledger entry
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch the ledger for a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchLedger', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchLedger', code, since, limit, params, undefined, false);
        }
        let type = undefined;
        let subType = undefined;
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const request = {};
        [type, params] = this.handleMarketTypeAndParams('fetchLedger', undefined, params);
        [subType, params] = this.handleSubTypeAndParams('fetchLedger', undefined, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, 'until');
            request['endTime'] = until;
        }
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchLedger', 'papi', 'portfolioMargin', false);
        let response = undefined;
        if (type === 'option') {
            this.checkRequiredArgument('fetchLedger', code, 'code');
            request['currency'] = currency['id'];
            response = await this.eapiPrivateGetBill(this.extend(request, params));
        }
        else if (this.isLinear(type, subType)) {
            if (isPortfolioMargin) {
                response = await this.papiGetUmIncome(this.extend(request, params));
            }
            else {
                response = await this.fapiPrivateGetIncome(this.extend(request, params));
            }
        }
        else if (this.isInverse(type, subType)) {
            if (isPortfolioMargin) {
                response = await this.papiGetCmIncome(this.extend(request, params));
            }
            else {
                response = await this.dapiPrivateGetIncome(this.extend(request, params));
            }
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchLedger() supports contract wallets only');
        }
        //
        // options (eapi)
        //
        //     [
        //         {
        //             "id": "1125899906845701870",
        //             "asset": "USDT",
        //             "amount": "-0.16518203",
        //             "type": "FEE",
        //             "createDate": 1676621042489
        //         }
        //     ]
        //
        // futures (fapi, dapi, papi)
        //
        //     [
        //         {
        //             "symbol": "",
        //             "incomeType": "TRANSFER",
        //             "income": "10.00000000",
        //             "asset": "USDT",
        //             "time": 1677645250000,
        //             "info": "TRANSFER",
        //             "tranId": 131001573082,
        //             "tradeId": ""
        //         }
        //     ]
        //
        return this.parseLedger(response, currency, since, limit);
    }
    parseLedgerEntry(item, currency = undefined) {
        //
        // options (eapi)
        //
        //     {
        //         "id": "1125899906845701870",
        //         "asset": "USDT",
        //         "amount": "-0.16518203",
        //         "type": "FEE",
        //         "createDate": 167662104241
        //     }
        //
        // futures (fapi, dapi, papi)
        //
        //     {
        //         "symbol": "",
        //         "incomeType": "TRANSFER",
        //         "income": "10.00000000",
        //         "asset": "USDT",
        //         "time": 1677645250000,
        //         "info": "TRANSFER",
        //         "tranId": 131001573082,
        //         "tradeId": ""
        //     }
        //
        let amount = this.safeString2(item, 'amount', 'income');
        let direction = undefined;
        if (Precise["default"].stringLe(amount, '0')) {
            direction = 'out';
            amount = Precise["default"].stringMul('-1', amount);
        }
        else {
            direction = 'in';
        }
        const currencyId = this.safeString(item, 'asset');
        const code = this.safeCurrencyCode(currencyId, currency);
        currency = this.safeCurrency(currencyId, currency);
        const timestamp = this.safeInteger2(item, 'createDate', 'time');
        const type = this.safeString2(item, 'type', 'incomeType');
        return this.safeLedgerEntry({
            'info': item,
            'id': this.safeString2(item, 'id', 'tranId'),
            'direction': direction,
            'account': undefined,
            'referenceAccount': undefined,
            'referenceId': this.safeString(item, 'tradeId'),
            'type': this.parseLedgerEntryType(type),
            'currency': code,
            'amount': this.parseNumber(amount),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'before': undefined,
            'after': undefined,
            'status': undefined,
            'fee': undefined,
        }, currency);
    }
    parseLedgerEntryType(type) {
        const ledgerType = {
            'FEE': 'fee',
            'FUNDING_FEE': 'fee',
            'OPTIONS_PREMIUM_FEE': 'fee',
            'POSITION_LIMIT_INCREASE_FEE': 'fee',
            'CONTRACT': 'trade',
            'REALIZED_PNL': 'trade',
            'TRANSFER': 'transfer',
            'CROSS_COLLATERAL_TRANSFER': 'transfer',
            'INTERNAL_TRANSFER': 'transfer',
            'COIN_SWAP_DEPOSIT': 'deposit',
            'COIN_SWAP_WITHDRAW': 'withdrawal',
            'OPTIONS_SETTLE_PROFIT': 'settlement',
            'DELIVERED_SETTELMENT': 'settlement',
            'WELCOME_BONUS': 'cashback',
            'CONTEST_REWARD': 'cashback',
            'COMMISSION_REBATE': 'rebate',
            'API_REBATE': 'rebate',
            'REFERRAL_KICKBACK': 'referral',
            'COMMISSION': 'commission',
        };
        return this.safeString(ledgerType, type, type);
    }
    getNetworkCodeByNetworkUrl(currencyCode, depositUrl = undefined) {
        // depositUrl is like : https://bscscan.com/address/0xEF238AB229342849..
        if (depositUrl === undefined) {
            return undefined;
        }
        let networkCode = undefined;
        const currency = this.currency(currencyCode);
        const networks = this.safeDict(currency, 'networks', {});
        const networkCodes = Object.keys(networks);
        for (let i = 0; i < networkCodes.length; i++) {
            const currentNetworkCode = networkCodes[i];
            const info = this.safeDict(networks[currentNetworkCode], 'info', {});
            const siteUrl = this.safeString(info, 'contractAddressUrl');
            // check if url matches the field's value
            if (siteUrl !== undefined && depositUrl.startsWith(this.getBaseDomainFromUrl(siteUrl))) {
                networkCode = currentNetworkCode;
            }
        }
        return networkCode;
    }
    getBaseDomainFromUrl(url) {
        if (url === undefined) {
            return undefined;
        }
        const urlParts = url.split('/');
        const scheme = this.safeString(urlParts, 0);
        if (scheme === undefined) {
            return undefined;
        }
        const domain = this.safeString(urlParts, 2);
        if (domain === undefined) {
            return undefined;
        }
        return scheme + '//' + domain + '/';
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const urls = this.urls;
        if (!(api in urls['api'])) {
            throw new errors.NotSupported(this.id + ' does not have a testnet/sandbox URL for ' + api + ' endpoints');
        }
        let url = this.urls['api'][api];
        url += '/' + path;
        if (path === 'historicalTrades') {
            if (this.apiKey) {
                headers = {
                    'X-MBX-APIKEY': this.apiKey,
                };
            }
            else {
                throw new errors.AuthenticationError(this.id + ' historicalTrades endpoint requires `apiKey` credential');
            }
        }
        const userDataStream = (path === 'userDataStream') || (path === 'listenKey');
        if (userDataStream) {
            if (this.apiKey) {
                // v1 special case for userDataStream
                headers = {
                    'X-MBX-APIKEY': this.apiKey,
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
                if (method !== 'GET') {
                    body = this.urlencode(params);
                }
            }
            else {
                throw new errors.AuthenticationError(this.id + ' userDataStream endpoint requires `apiKey` credential');
            }
        }
        else if ((api === 'private') || (api === 'eapiPrivate') || (api === 'sapi' && path !== 'system/status') || (api === 'sapiV2') || (api === 'sapiV3') || (api === 'sapiV4') || (api === 'dapiPrivate') || (api === 'dapiPrivateV2') || (api === 'fapiPrivate') || (api === 'fapiPrivateV2') || (api === 'fapiPrivateV3') || (api === 'papi' && path !== 'ping')) {
            this.checkRequiredCredentials();
            if (method === 'POST' && ((path === 'order') || (path === 'sor/order'))) {
                // inject in implicit API calls
                const newClientOrderId = this.safeString(params, 'newClientOrderId');
                if (newClientOrderId === undefined) {
                    const isSpotOrMargin = (api.indexOf('sapi') > -1 || api === 'private');
                    const marketType = isSpotOrMargin ? 'spot' : 'future';
                    const defaultId = (!isSpotOrMargin) ? 'x-xcKtGhcu' : 'x-TKT5PX2F';
                    const broker = this.safeDict(this.options, 'broker', {});
                    const brokerId = this.safeString(broker, marketType, defaultId);
                    params['newClientOrderId'] = brokerId + this.uuid22();
                }
            }
            let query = undefined;
            // handle batchOrders
            if ((path === 'batchOrders') && ((method === 'POST') || (method === 'PUT'))) {
                const batchOrders = this.safeList(params, 'batchOrders');
                let checkedBatchOrders = batchOrders;
                if (method === 'POST' && api === 'fapiPrivate') {
                    // check broker id if batchOrders are called with fapiPrivatePostBatchOrders
                    checkedBatchOrders = [];
                    for (let i = 0; i < batchOrders.length; i++) {
                        const batchOrder = batchOrders[i];
                        let newClientOrderId = this.safeString(batchOrder, 'newClientOrderId');
                        if (newClientOrderId === undefined) {
                            const defaultId = 'x-xcKtGhcu'; // batchOrders can not be spot or margin
                            const broker = this.safeDict(this.options, 'broker', {});
                            const brokerId = this.safeString(broker, 'future', defaultId);
                            newClientOrderId = brokerId + this.uuid22();
                            batchOrder['newClientOrderId'] = newClientOrderId;
                        }
                        checkedBatchOrders.push(batchOrder);
                    }
                }
                const queryBatch = (this.json(checkedBatchOrders));
                params['batchOrders'] = queryBatch;
            }
            const defaultRecvWindow = this.safeInteger(this.options, 'recvWindow');
            let extendedParams = this.extend({
                'timestamp': this.nonce(),
            }, params);
            if (defaultRecvWindow !== undefined) {
                extendedParams['recvWindow'] = defaultRecvWindow;
            }
            const recvWindow = this.safeInteger(params, 'recvWindow');
            if (recvWindow !== undefined) {
                extendedParams['recvWindow'] = recvWindow;
            }
            if ((api === 'sapi') && (path === 'asset/dust')) {
                query = this.urlencodeWithArrayRepeat(extendedParams);
            }
            else if ((path === 'batchOrders') || (path.indexOf('sub-account') >= 0) || (path === 'capital/withdraw/apply') || (path.indexOf('staking') >= 0) || (path.indexOf('simple-earn') >= 0)) {
                if ((method === 'DELETE') && (path === 'batchOrders')) {
                    const orderidlist = this.safeList(extendedParams, 'orderidlist', []);
                    const origclientorderidlist = this.safeList2(extendedParams, 'origclientorderidlist', 'origClientOrderIdList', []);
                    extendedParams = this.omit(extendedParams, ['orderidlist', 'origclientorderidlist', 'origClientOrderIdList']);
                    query = this.rawencode(extendedParams);
                    const orderidlistLength = orderidlist.length;
                    const origclientorderidlistLength = origclientorderidlist.length;
                    if (orderidlistLength > 0) {
                        query = query + '&' + 'orderidlist=%5B' + orderidlist.join('%2C') + '%5D';
                    }
                    if (origclientorderidlistLength > 0) {
                        // wrap clientOrderids around ""
                        const newClientOrderIds = [];
                        for (let i = 0; i < origclientorderidlistLength; i++) {
                            newClientOrderIds.push('%22' + origclientorderidlist[i] + '%22');
                        }
                        query = query + '&' + 'origclientorderidlist=%5B' + newClientOrderIds.join('%2C') + '%5D';
                    }
                }
                else {
                    query = this.rawencode(extendedParams);
                }
            }
            else {
                query = this.urlencode(extendedParams);
            }
            let signature = undefined;
            if (this.secret.indexOf('PRIVATE KEY') > -1) {
                if (this.secret.length > 120) {
                    signature = this.encodeURIComponent(rsa.rsa(query, this.secret, sha256.sha256));
                }
                else {
                    signature = this.encodeURIComponent(crypto.eddsa(this.encode(query), this.secret, ed25519.ed25519));
                }
            }
            else {
                signature = this.hmac(this.encode(query), this.encode(this.secret), sha256.sha256);
            }
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method === 'GET') || (method === 'DELETE')) {
                url += '?' + query;
            }
            else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        }
        else {
            if (Object.keys(params).length) {
                url += '?' + this.urlencode(params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    getExceptionsByUrl(url, exactOrBroad) {
        let marketType = undefined;
        const hostname = (this.hostname !== undefined) ? this.hostname : 'binance.com';
        if (url.startsWith('https://api.' + hostname + '/') || url.startsWith('https://testnet.binance.vision')) {
            marketType = 'spot';
        }
        else if (url.startsWith('https://dapi.' + hostname + '/') || url.startsWith('https://testnet.binancefuture.com/dapi')) {
            marketType = 'inverse';
        }
        else if (url.startsWith('https://fapi.' + hostname + '/') || url.startsWith('https://testnet.binancefuture.com/fapi')) {
            marketType = 'linear';
        }
        else if (url.startsWith('https://eapi.' + hostname + '/')) {
            marketType = 'option';
        }
        else if (url.startsWith('https://papi.' + hostname + '/')) {
            marketType = 'portfolioMargin';
        }
        if (marketType !== undefined) {
            const exceptionsForMarketType = this.safeDict(this.exceptions, marketType, {});
            return this.safeDict(exceptionsForMarketType, exactOrBroad, {});
        }
        return {};
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if ((code === 418) || (code === 429)) {
            throw new errors.DDoSProtection(this.id + ' ' + code.toString() + ' ' + reason + ' ' + body);
        }
        // error response in a form: { "code": -1013, "msg": "Invalid quantity." }
        // following block cointains legacy checks against message patterns in "msg" property
        // will switch "code" checks eventually, when we know all of them
        if (code >= 400) {
            if (body.indexOf('Price * QTY is zero or less') >= 0) {
                throw new errors.InvalidOrder(this.id + ' order cost = amount * price is zero or less ' + body);
            }
            if (body.indexOf('LOT_SIZE') >= 0) {
                throw new errors.InvalidOrder(this.id + ' order amount should be evenly divisible by lot size ' + body);
            }
            if (body.indexOf('PRICE_FILTER') >= 0) {
                throw new errors.InvalidOrder(this.id + ' order price is invalid, i.e. exceeds allowed price precision, exceeds min price or max price limits or is invalid value in general, use this.priceToPrecision (symbol, amount) ' + body);
            }
        }
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        // response in format {'msg': 'The coin does not exist.', 'success': true/false}
        const success = this.safeBool(response, 'success', true);
        if (!success) {
            const messageNew = this.safeString(response, 'msg');
            let parsedMessage = undefined;
            if (messageNew !== undefined) {
                try {
                    parsedMessage = JSON.parse(messageNew);
                }
                catch (e) {
                    // do nothing
                    parsedMessage = undefined;
                }
                if (parsedMessage !== undefined) {
                    response = parsedMessage;
                }
            }
        }
        const message = this.safeString(response, 'msg');
        if (message !== undefined) {
            this.throwExactlyMatchedException(this.getExceptionsByUrl(url, 'exact'), message, this.id + ' ' + message);
            this.throwExactlyMatchedException(this.exceptions['exact'], message, this.id + ' ' + message);
            this.throwBroadlyMatchedException(this.getExceptionsByUrl(url, 'broad'), message, this.id + ' ' + message);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, this.id + ' ' + message);
        }
        // checks against error codes
        const error = this.safeString(response, 'code');
        if (error !== undefined) {
            // https://github.com/ccxt/ccxt/issues/6501
            // https://github.com/ccxt/ccxt/issues/7742
            if ((error === '200') || Precise["default"].stringEquals(error, '0')) {
                return undefined;
            }
            // a workaround for {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
            // despite that their message is very confusing, it is raised by Binance
            // on a temporary ban, the API key is valid, but disabled for a while
            if ((error === '-2015') && this.options['hasAlreadyAuthenticatedSuccessfully']) {
                throw new errors.DDoSProtection(this.id + ' ' + body);
            }
            const feedback = this.id + ' ' + body;
            if (message === 'No need to change margin type.') {
                // not an error
                // https://github.com/ccxt/ccxt/issues/11268
                // https://github.com/ccxt/ccxt/pull/11624
                // POST https://fapi.binance.com/fapi/v1/marginType 400 Bad Request
                // binanceusdm {"code":-4046,"msg":"No need to change margin type."}
                throw new errors.MarginModeAlreadySet(feedback);
            }
            this.throwExactlyMatchedException(this.getExceptionsByUrl(url, 'exact'), error, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], error, feedback);
            throw new errors.ExchangeError(feedback);
        }
        if (!success) {
            throw new errors.ExchangeError(this.id + ' ' + body);
        }
        if (Array.isArray(response)) {
            // cancelOrders returns an array like this: [{"code":-2011,"msg":"Unknown order sent."}]
            const arrayLength = response.length;
            if (arrayLength === 1) { // when there's a single error we can throw, otherwise we have a partial success
                const element = response[0];
                const errorCode = this.safeString(element, 'code');
                if (errorCode !== undefined) {
                    this.throwExactlyMatchedException(this.getExceptionsByUrl(url, 'exact'), errorCode, this.id + ' ' + body);
                    this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, this.id + ' ' + body);
                }
            }
        }
        return undefined;
    }
    calculateRateLimiterCost(api, method, path, params, config = {}) {
        if (('noCoin' in config) && !('coin' in params)) {
            return config['noCoin'];
        }
        else if (('noSymbol' in config) && !('symbol' in params)) {
            return config['noSymbol'];
        }
        else if (('noPoolId' in config) && !('poolId' in params)) {
            return config['noPoolId'];
        }
        else if (('byLimit' in config) && ('limit' in params)) {
            const limit = params['limit'];
            const byLimit = config['byLimit'];
            for (let i = 0; i < byLimit.length; i++) {
                const entry = byLimit[i];
                if (limit <= entry[0]) {
                    return entry[1];
                }
            }
        }
        return this.safeValue(config, 'cost', 1);
    }
    async request(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined, config = {}) {
        const response = await this.fetch2(path, api, method, params, headers, body, config);
        // a workaround for {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
        if (api === 'private') {
            this.options['hasAlreadyAuthenticatedSuccessfully'] = true;
        }
        return response;
    }
    async modifyMarginHelper(symbol, amount, addOrReduce, params = {}) {
        // used to modify isolated positions
        let defaultType = this.safeString(this.options, 'defaultType', 'future');
        if (defaultType === 'spot') {
            defaultType = 'future';
        }
        const type = this.safeString(params, 'type', defaultType);
        if ((type === 'margin') || (type === 'spot')) {
            throw new errors.NotSupported(this.id + ' add / reduce margin only supported with type future or delivery');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        amount = this.amountToPrecision(symbol, amount);
        const request = {
            'type': addOrReduce,
            'symbol': market['id'],
            'amount': amount,
        };
        let response = undefined;
        let code = undefined;
        if (market['linear']) {
            code = market['quote'];
            response = await this.fapiPrivatePostPositionMargin(this.extend(request, params));
        }
        else {
            code = market['base'];
            response = await this.dapiPrivatePostPositionMargin(this.extend(request, params));
        }
        //
        //     {
        //         "code": 200,
        //         "msg": "Successfully modify position margin.",
        //         "amount": 0.001,
        //         "type": 1
        //     }
        //
        return this.extend(this.parseMarginModification(response, market), {
            'code': code,
        });
    }
    parseMarginModification(data, market = undefined) {
        //
        // add/reduce margin
        //
        //     {
        //         "code": 200,
        //         "msg": "Successfully modify position margin.",
        //         "amount": 0.001,
        //         "type": 1
        //     }
        //
        // fetchMarginAdjustmentHistory
        //
        //    {
        //        symbol: "XRPUSDT",
        //        type: "1",
        //        deltaType: "TRADE",
        //        amount: "2.57148240",
        //        asset: "USDT",
        //        time: "1711046271555",
        //        positionSide: "BOTH",
        //        clientTranId: ""
        //    }
        //
        const rawType = this.safeInteger(data, 'type');
        const errorCode = this.safeString(data, 'code');
        const marketId = this.safeString(data, 'symbol');
        const timestamp = this.safeInteger(data, 'time');
        market = this.safeMarket(marketId, market, undefined, 'swap');
        const noErrorCode = errorCode === undefined;
        const success = errorCode === '200';
        return {
            'info': data,
            'symbol': market['symbol'],
            'type': (rawType === 1) ? 'add' : 'reduce',
            'marginMode': 'isolated',
            'amount': this.safeNumber(data, 'amount'),
            'code': this.safeString(data, 'asset'),
            'total': undefined,
            'status': (success || noErrorCode) ? 'ok' : 'failed',
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    /**
     * @method
     * @name binance#reduceMargin
     * @description remove margin from a position
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Isolated-Position-Margin
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Modify-Isolated-Position-Margin
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    async reduceMargin(symbol, amount, params = {}) {
        return await this.modifyMarginHelper(symbol, amount, 2, params);
    }
    /**
     * @method
     * @name binance#addMargin
     * @description add margin
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Isolated-Position-Margin
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Modify-Isolated-Position-Margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    async addMargin(symbol, amount, params = {}) {
        return await this.modifyMarginHelper(symbol, amount, 1, params);
    }
    /**
     * @method
     * @name binance#fetchCrossBorrowRate
     * @description fetch the rate of interest to borrow a currency for margin trading
     * @see https://developers.binance.com/docs/margin_trading/borrow-and-repay/Query-Margin-Interest-Rate-History
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [borrow rate structure]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    async fetchCrossBorrowRate(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
            // 'vipLevel': this.safeInteger (params, 'vipLevel'),
        };
        const response = await this.sapiGetMarginInterestRateHistory(this.extend(request, params));
        //
        //     [
        //         {
        //             "asset": "USDT",
        //             "timestamp": 1638230400000,
        //             "dailyInterestRate": "0.0006",
        //             "vipLevel": 0
        //         },
        //     ]
        //
        const rate = this.safeDict(response, 0);
        return this.parseBorrowRate(rate);
    }
    /**
     * @method
     * @name binance#fetchIsolatedBorrowRate
     * @description fetch the rate of interest to borrow a currency for margin trading
     * @see https://developers.binance.com/docs/margin_trading/account/Query-Isolated-Margin-Fee-Data
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {object} [params.vipLevel] user's current specific margin data will be returned if viplevel is omitted
     * @returns {object} an [isolated borrow rate structure]{@link https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure}
     */
    async fetchIsolatedBorrowRate(symbol, params = {}) {
        const request = {
            'symbol': symbol,
        };
        const borrowRates = await this.fetchIsolatedBorrowRates(this.extend(request, params));
        return this.safeDict(borrowRates, symbol);
    }
    /**
     * @method
     * @name binance#fetchIsolatedBorrowRates
     * @description fetch the borrow interest rates of all currencies
     * @see https://developers.binance.com/docs/margin_trading/account/Query-Isolated-Margin-Fee-Data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.symbol] unified market symbol
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {object} [params.vipLevel] user's current specific margin data will be returned if viplevel is omitted
     * @returns {object} a [borrow rate structure]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    async fetchIsolatedBorrowRates(params = {}) {
        await this.loadMarkets();
        const request = {};
        const symbol = this.safeString(params, 'symbol');
        params = this.omit(params, 'symbol');
        if (symbol !== undefined) {
            const market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.sapiGetMarginIsolatedMarginData(this.extend(request, params));
        //
        //    [
        //        {
        //            "vipLevel": 0,
        //            "symbol": "BTCUSDT",
        //            "leverage": "10",
        //            "data": [
        //                {
        //                    "coin": "BTC",
        //                    "dailyInterest": "0.00026125",
        //                    "borrowLimit": "270"
        //                },
        //                {
        //                    "coin": "USDT",
        //                    "dailyInterest": "0.000475",
        //                    "borrowLimit": "2100000"
        //                }
        //            ]
        //        }
        //    ]
        //
        return this.parseIsolatedBorrowRates(response);
    }
    /**
     * @method
     * @name binance#fetchBorrowRateHistory
     * @description retrieves a history of a currencies borrow interest rate at specific time slots
     * @see https://developers.binance.com/docs/margin_trading/borrow-and-repay/Query-Margin-Interest-Rate-History
     * @param {string} code unified currency code
     * @param {int} [since] timestamp for the earliest borrow rate
     * @param {int} [limit] the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure} to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    async fetchBorrowRateHistory(code, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        if (limit === undefined) {
            limit = 93;
        }
        else if (limit > 93) {
            // Binance API says the limit is 100, but "Illegal characters found in a parameter." is returned when limit is > 93
            throw new errors.BadRequest(this.id + ' fetchBorrowRateHistory() limit parameter cannot exceed 92');
        }
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
            'limit': limit,
        };
        if (since !== undefined) {
            request['startTime'] = since;
            const endTime = this.sum(since, limit * 86400000) - 1; // required when startTime is further than 93 days in the past
            const now = this.milliseconds();
            request['endTime'] = Math.min(endTime, now); // cannot have an endTime later than current time
        }
        const response = await this.sapiGetMarginInterestRateHistory(this.extend(request, params));
        //
        //     [
        //         {
        //             "asset": "USDT",
        //             "timestamp": 1638230400000,
        //             "dailyInterestRate": "0.0006",
        //             "vipLevel": 0
        //         },
        //     ]
        //
        return this.parseBorrowRateHistory(response, code, since, limit);
    }
    parseBorrowRate(info, currency = undefined) {
        //
        //    {
        //        "asset": "USDT",
        //        "timestamp": 1638230400000,
        //        "dailyInterestRate": "0.0006",
        //        "vipLevel": 0
        //    }
        //
        const timestamp = this.safeInteger(info, 'timestamp');
        const currencyId = this.safeString(info, 'asset');
        return {
            'currency': this.safeCurrencyCode(currencyId, currency),
            'rate': this.safeNumber(info, 'dailyInterestRate'),
            'period': 86400000,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': info,
        };
    }
    parseIsolatedBorrowRate(info, market = undefined) {
        //
        //    {
        //        "vipLevel": 0,
        //        "symbol": "BTCUSDT",
        //        "leverage": "10",
        //        "data": [
        //            {
        //                "coin": "BTC",
        //                "dailyInterest": "0.00026125",
        //                "borrowLimit": "270"
        //            },
        //            {
        //                "coin": "USDT",
        //                "dailyInterest": "0.000475",
        //                "borrowLimit": "2100000"
        //            }
        //        ]
        //    }
        //
        const marketId = this.safeString(info, 'symbol');
        market = this.safeMarket(marketId, market, undefined, 'spot');
        const data = this.safeList(info, 'data');
        const baseInfo = this.safeDict(data, 0);
        const quoteInfo = this.safeDict(data, 1);
        return {
            'info': info,
            'symbol': this.safeString(market, 'symbol'),
            'base': this.safeString(baseInfo, 'coin'),
            'baseRate': this.safeNumber(baseInfo, 'dailyInterest'),
            'quote': this.safeString(quoteInfo, 'coin'),
            'quoteRate': this.safeNumber(quoteInfo, 'dailyInterest'),
            'period': 86400000,
            'timestamp': undefined,
            'datetime': undefined,
        };
    }
    /**
     * @method
     * @name binance#createGiftCode
     * @description create gift code
     * @see https://developers.binance.com/docs/gift_card/market-data/Create-a-single-token-gift-card
     * @param {string} code gift code
     * @param {float} amount amount of currency for the gift
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} The gift code id, code, currency and amount
     */
    async createGiftCode(code, amount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        // ensure you have enough token in your funding account before calling this code
        const request = {
            'token': currency['id'],
            'amount': amount,
        };
        const response = await this.sapiPostGiftcardCreateCode(this.extend(request, params));
        //
        //     {
        //         "code": "000000",
        //         "message": "success",
        //         "data": { referenceNo: "0033002404219823", code: "AP6EXTLKNHM6CEX7" },
        //         "success": true
        //     }
        //
        const data = this.safeDict(response, 'data');
        const giftcardCode = this.safeString(data, 'code');
        const id = this.safeString(data, 'referenceNo');
        return {
            'info': response,
            'id': id,
            'code': giftcardCode,
            'currency': code,
            'amount': amount,
        };
    }
    /**
     * @method
     * @name binance#redeemGiftCode
     * @description redeem gift code
     * @see https://developers.binance.com/docs/gift_card/market-data/Redeem-a-Binance-Gift-Card
     * @param {string} giftcardCode
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async redeemGiftCode(giftcardCode, params = {}) {
        const request = {
            'code': giftcardCode,
        };
        const response = await this.sapiPostGiftcardRedeemCode(this.extend(request, params));
        //
        //     {
        //         "code": "000000",
        //         "message": "success",
        //         "data": {
        //             "referenceNo": "0033002404219823",
        //             "identityNo": "10316431732801474560"
        //         },
        //         "success": true
        //     }
        //
        return response;
    }
    /**
     * @method
     * @name binance#verifyGiftCode
     * @description verify gift code
     * @see https://developers.binance.com/docs/gift_card/market-data/Verify-Binance-Gift-Card-by-Gift-Card-Number
     * @param {string} id reference number id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async verifyGiftCode(id, params = {}) {
        const request = {
            'referenceNo': id,
        };
        const response = await this.sapiGetGiftcardVerify(this.extend(request, params));
        //
        //     {
        //         "code": "000000",
        //         "message": "success",
        //         "data": { valid: true },
        //         "success": true
        //     }
        //
        return response;
    }
    /**
     * @method
     * @name binance#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://developers.binance.com/docs/margin_trading/borrow-and-repay/Get-Interest-History
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-Margin-BorrowLoan-Interest-History
     * @param {string} [code] unified currency code
     * @param {string} [symbol] unified market symbol when fetch interest in isolated markets
     * @param {int} [since] the earliest time in ms to fetch borrrow interest for
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch the borrow interest in a portfolio margin account
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    async fetchBorrowInterest(code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchBorrowInterest', 'papi', 'portfolioMargin', false);
        let request = {};
        let market = undefined;
        if (code !== undefined) {
            const currency = this.currency(code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        let response = undefined;
        if (isPortfolioMargin) {
            response = await this.papiGetMarginMarginInterestHistory(this.extend(request, params));
        }
        else {
            if (symbol !== undefined) {
                market = this.market(symbol);
                request['isolatedSymbol'] = market['id'];
            }
            response = await this.sapiGetMarginInterestHistory(this.extend(request, params));
        }
        //
        // spot margin
        //
        //     {
        //         "rows":[
        //             {
        //                 "isolatedSymbol": "BNBUSDT", // isolated symbol, will not be returned for crossed margin
        //                 "asset": "BNB",
        //                 "interest": "0.02414667",
        //                 "interestAccuredTime": 1566813600000,
        //                 "interestRate": "0.01600000",
        //                 "principal": "36.22000000",
        //                 "type": "ON_BORROW"
        //             }
        //         ],
        //         "total": 1
        //     }
        //
        // spot margin portfolio margin
        //
        //     {
        //         "total": 49,
        //         "rows": [
        //             {
        //                 "txId": 1656187724899910076,
        //                 "interestAccuredTime": 1707541200000,
        //                 "asset": "USDT",
        //                 "rawAsset": "USDT",
        //                 "principal": "0.00011146",
        //                 "interest": "0.00000001",
        //                 "interestRate": "0.00089489",
        //                 "type": "PERIODIC"
        //             },
        //         ]
        //     }
        //
        const rows = this.safeList(response, 'rows');
        const interest = this.parseBorrowInterests(rows, market);
        return this.filterByCurrencySinceLimit(interest, code, since, limit);
    }
    parseBorrowInterest(info, market = undefined) {
        const symbol = this.safeString(info, 'isolatedSymbol');
        const timestamp = this.safeInteger(info, 'interestAccuredTime');
        const marginMode = (symbol === undefined) ? 'cross' : 'isolated';
        return {
            'info': info,
            'symbol': symbol,
            'currency': this.safeCurrencyCode(this.safeString(info, 'asset')),
            'interest': this.safeNumber(info, 'interest'),
            'interestRate': this.safeNumber(info, 'interestRate'),
            'amountBorrowed': this.safeNumber(info, 'principal'),
            'marginMode': marginMode,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    /**
     * @method
     * @name binance#repayCrossMargin
     * @description repay borrowed margin and interest
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Margin-Account-Repay
     * @see https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Margin-Account-Repay-Debt
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to repay margin in a portfolio margin account
     * @param {string} [params.repayCrossMarginMethod] *portfolio margin only* 'papiPostRepayLoan' (default), 'papiPostMarginRepayDebt' (alternative)
     * @param {string} [params.specifyRepayAssets] *portfolio margin papiPostMarginRepayDebt only* specific asset list to repay debt
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async repayCrossMargin(code, amount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
        };
        let response = undefined;
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'repayCrossMargin', 'papi', 'portfolioMargin', false);
        if (isPortfolioMargin) {
            let method = undefined;
            [method, params] = this.handleOptionAndParams2(params, 'repayCrossMargin', 'repayCrossMarginMethod', 'method');
            if (method === 'papiPostMarginRepayDebt') {
                response = await this.papiPostMarginRepayDebt(this.extend(request, params));
                //
                //     {
                //         "asset": "USDC",
                //         "amount": 10,
                //         "specifyRepayAssets": null,
                //         "updateTime": 1727170761267,
                //         "success": true
                //     }
                //
            }
            else {
                response = await this.papiPostRepayLoan(this.extend(request, params));
                //
                //     {
                //         "tranId": 108988250265,
                //         "clientTag":""
                //     }
                //
            }
        }
        else {
            request['isIsolated'] = 'FALSE';
            request['type'] = 'REPAY';
            response = await this.sapiPostMarginBorrowRepay(this.extend(request, params));
            //
            //     {
            //         "tranId": 108988250265,
            //         "clientTag":""
            //     }
            //
        }
        return this.parseMarginLoan(response, currency);
    }
    /**
     * @method
     * @name binance#repayIsolatedMargin
     * @description repay borrowed margin and interest
     * @see https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay
     * @param {string} symbol unified market symbol, required for isolated margin
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async repayIsolatedMargin(symbol, code, amount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const market = this.market(symbol);
        const request = {
            'asset': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
            'symbol': market['id'],
            'isIsolated': 'TRUE',
            'type': 'REPAY',
        };
        const response = await this.sapiPostMarginBorrowRepay(this.extend(request, params));
        //
        //     {
        //         "tranId": 108988250265,
        //         "clientTag":""
        //     }
        //
        return this.parseMarginLoan(response, currency);
    }
    /**
     * @method
     * @name binance#borrowCrossMargin
     * @description create a loan to borrow margin
     * @see https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Margin-Account-Borrow
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to borrow margin in a portfolio margin account
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async borrowCrossMargin(code, amount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
        };
        let response = undefined;
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'borrowCrossMargin', 'papi', 'portfolioMargin', false);
        if (isPortfolioMargin) {
            response = await this.papiPostMarginLoan(this.extend(request, params));
        }
        else {
            request['isIsolated'] = 'FALSE';
            request['type'] = 'BORROW';
            response = await this.sapiPostMarginBorrowRepay(this.extend(request, params));
        }
        //
        //     {
        //         "tranId": 108988250265,
        //         "clientTag":""
        //     }
        //
        return this.parseMarginLoan(response, currency);
    }
    /**
     * @method
     * @name binance#borrowIsolatedMargin
     * @description create a loan to borrow margin
     * @see https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay
     * @param {string} symbol unified market symbol, required for isolated margin
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async borrowIsolatedMargin(symbol, code, amount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const market = this.market(symbol);
        const request = {
            'asset': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
            'symbol': market['id'],
            'isIsolated': 'TRUE',
            'type': 'BORROW',
        };
        const response = await this.sapiPostMarginBorrowRepay(this.extend(request, params));
        //
        //     {
        //         "tranId": 108988250265,
        //         "clientTag":""
        //     }
        //
        return this.parseMarginLoan(response, currency);
    }
    parseMarginLoan(info, currency = undefined) {
        //
        //     {
        //         "tranId": 108988250265,
        //         "clientTag":""
        //     }
        //
        // repayCrossMargin alternative endpoint
        //
        //     {
        //         "asset": "USDC",
        //         "amount": 10,
        //         "specifyRepayAssets": null,
        //         "updateTime": 1727170761267,
        //         "success": true
        //     }
        //
        const currencyId = this.safeString(info, 'asset');
        const timestamp = this.safeInteger(info, 'updateTime');
        return {
            'id': this.safeInteger(info, 'tranId'),
            'currency': this.safeCurrencyCode(currencyId, currency),
            'amount': this.safeNumber(info, 'amount'),
            'symbol': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': info,
        };
    }
    /**
     * @method
     * @name binance#fetchOpenInterestHistory
     * @description Retrieves the open interest history of a currency
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Open-Interest-Statistics
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Open-Interest-Statistics
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} timeframe "5m","15m","30m","1h","2h","4h","6h","12h", or "1d"
     * @param {int} [since] the time(ms) of the earliest record to retrieve as a unix timestamp
     * @param {int} [limit] default 30, max 500
     * @param {object} [params] exchange specific parameters
     * @param {int} [params.until] the time(ms) of the latest record to retrieve as a unix timestamp
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} an array of [open interest structure]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    async fetchOpenInterestHistory(symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        if (timeframe === '1m') {
            throw new errors.BadRequest(this.id + ' fetchOpenInterestHistory cannot use the 1m timeframe');
        }
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOpenInterestHistory', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOpenInterestHistory', symbol, since, limit, timeframe, params, 500);
        }
        const market = this.market(symbol);
        const request = {
            'period': this.safeString(this.timeframes, timeframe, timeframe),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const symbolKey = market['linear'] ? 'symbol' : 'pair';
        request[symbolKey] = market['id'];
        if (market['inverse']) {
            request['contractType'] = this.safeString(params, 'contractType', 'CURRENT_QUARTER');
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger(params, 'until'); // unified in milliseconds
        const endTime = this.safeInteger(params, 'endTime', until); // exchange-specific in milliseconds
        params = this.omit(params, ['endTime', 'until']);
        if (endTime) {
            request['endTime'] = endTime;
        }
        else if (since) {
            if (limit === undefined) {
                limit = 30; // Exchange default
            }
            const duration = this.parseTimeframe(timeframe);
            request['endTime'] = this.sum(since, duration * limit * 1000);
        }
        let response = undefined;
        if (market['inverse']) {
            response = await this.dapiDataGetOpenInterestHist(this.extend(request, params));
        }
        else {
            response = await this.fapiDataGetOpenInterestHist(this.extend(request, params));
        }
        //
        //  [
        //      {
        //          "symbol":"BTCUSDT",
        //          "sumOpenInterest":"75375.61700000",
        //          "sumOpenInterestValue":"3248828883.71251440",
        //          "timestamp":1642179900000
        //      },
        //      ...
        //  ]
        //
        return this.parseOpenInterestsHistory(response, market, since, limit);
    }
    /**
     * @method
     * @name binance#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Open-Interest
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Open-Interest
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Open-Interest
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    async fetchOpenInterest(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {};
        if (market['option']) {
            request['underlyingAsset'] = market['baseId'];
            if (market['expiry'] === undefined) {
                throw new errors.NotSupported(this.id + ' fetchOpenInterest does not support ' + symbol);
            }
            request['expiration'] = this.yymmdd(market['expiry']);
        }
        else {
            request['symbol'] = market['id'];
        }
        let response = undefined;
        if (market['option']) {
            response = await this.eapiPublicGetOpenInterest(this.extend(request, params));
        }
        else if (market['inverse']) {
            response = await this.dapiPublicGetOpenInterest(this.extend(request, params));
        }
        else {
            response = await this.fapiPublicGetOpenInterest(this.extend(request, params));
        }
        //
        // futures (fapi)
        //
        //     {
        //         "symbol": "ETHUSDT_230331",
        //         "openInterest": "23581.677",
        //         "time": 1677356872265
        //     }
        //
        // futures (dapi)
        //
        //     {
        //         "symbol": "ETHUSD_PERP",
        //         "pair": "ETHUSD",
        //         "openInterest": "26542436",
        //         "contractType": "PERPETUAL",
        //         "time": 1677360272224
        //     }
        //
        // options (eapi)
        //
        //     [
        //         {
        //             "symbol": "ETH-230225-1625-C",
        //             "sumOpenInterest": "460.50",
        //             "sumOpenInterestUsd": "734957.4358092150",
        //             "timestamp": "1677304860000"
        //         }
        //     ]
        //
        if (market['option']) {
            symbol = market['symbol'];
            const result = this.parseOpenInterestsHistory(response, market);
            for (let i = 0; i < result.length; i++) {
                const item = result[i];
                if (item['symbol'] === symbol) {
                    return item;
                }
            }
        }
        else {
            return this.parseOpenInterest(response, market);
        }
        return undefined;
    }
    parseOpenInterest(interest, market = undefined) {
        const timestamp = this.safeInteger2(interest, 'timestamp', 'time');
        const id = this.safeString(interest, 'symbol');
        const amount = this.safeNumber2(interest, 'sumOpenInterest', 'openInterest');
        const value = this.safeNumber2(interest, 'sumOpenInterestValue', 'sumOpenInterestUsd');
        // Inverse returns the number of contracts different from the base or quote volume in this case
        // compared with https://www.binance.com/en/futures/funding-history/quarterly/4
        return this.safeOpenInterest({
            'symbol': this.safeSymbol(id, market, undefined, 'contract'),
            'baseVolume': market['inverse'] ? undefined : amount,
            'quoteVolume': value,
            'openInterestAmount': amount,
            'openInterestValue': value,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': interest,
        }, market);
    }
    /**
     * @method
     * @name binance#fetchMyLiquidations
     * @description retrieves the users liquidated positions
     * @see https://developers.binance.com/docs/margin_trading/trade/Get-Force-Liquidation-Record
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Users-Force-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Users-Force-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Users-UM-Force-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Users-CM-Force-Orders
     * @param {string} [symbol] unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the binance api endpoint
     * @param {int} [params.until] timestamp in ms of the latest liquidation
     * @param {boolean} [params.paginate] *spot only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch liquidations in a portfolio margin account
     * @param {string} [params.type] "spot"
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    async fetchMyLiquidations(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyLiquidations', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental('fetchMyLiquidations', symbol, since, limit, params, 'current', 100);
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchMyLiquidations', market, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchMyLiquidations', market, params, 'linear');
        let isPortfolioMargin = undefined;
        [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchMyLiquidations', 'papi', 'portfolioMargin', false);
        let request = {};
        if (type !== 'spot') {
            request['autoCloseType'] = 'LIQUIDATION';
        }
        if (market !== undefined) {
            const symbolKey = market['spot'] ? 'isolatedSymbol' : 'symbol';
            if (!isPortfolioMargin) {
                request[symbolKey] = market['id'];
            }
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            if (type === 'spot') {
                request['size'] = limit;
            }
            else {
                request['limit'] = limit;
            }
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        let response = undefined;
        if (type === 'spot') {
            if (isPortfolioMargin) {
                response = await this.papiGetMarginForceOrders(this.extend(request, params));
            }
            else {
                response = await this.sapiGetMarginForceLiquidationRec(this.extend(request, params));
            }
        }
        else if (subType === 'linear') {
            if (isPortfolioMargin) {
                response = await this.papiGetUmForceOrders(this.extend(request, params));
            }
            else {
                response = await this.fapiPrivateGetForceOrders(this.extend(request, params));
            }
        }
        else if (subType === 'inverse') {
            if (isPortfolioMargin) {
                response = await this.papiGetCmForceOrders(this.extend(request, params));
            }
            else {
                response = await this.dapiPrivateGetForceOrders(this.extend(request, params));
            }
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchMyLiquidations() does not support ' + market['type'] + ' markets');
        }
        //
        // margin
        //
        //     {
        //         "rows": [
        //             {
        //                 "avgPrice": "0.00388359",
        //                 "executedQty": "31.39000000",
        //                 "orderId": 180015097,
        //                 "price": "0.00388110",
        //                 "qty": "31.39000000",
        //                 "side": "SELL",
        //                 "symbol": "BNBBTC",
        //                 "timeInForce": "GTC",
        //                 "isIsolated": true,
        //                 "updatedTime": 1558941374745
        //             }
        //         ],
        //         "total": 1
        //     }
        //
        // linear
        //
        //     [
        //         {
        //             "orderId": 6071832819,
        //             "symbol": "BTCUSDT",
        //             "status": "FILLED",
        //             "clientOrderId": "autoclose-1596107620040000020",
        //             "price": "10871.09",
        //             "avgPrice": "10913.21000",
        //             "origQty": "0.001",
        //             "executedQty": "0.001",
        //             "cumQuote": "10.91321",
        //             "timeInForce": "IOC",
        //             "type": "LIMIT",
        //             "reduceOnly": false,
        //             "closePosition": false,
        //             "side": "SELL",
        //             "positionSide": "BOTH",
        //             "stopPrice": "0",
        //             "workingType": "CONTRACT_PRICE",
        //             "origType": "LIMIT",
        //             "time": 1596107620044,
        //             "updateTime": 1596107620087
        //         },
        //     ]
        //
        // inverse
        //
        //     [
        //         {
        //             "orderId": 165123080,
        //             "symbol": "BTCUSD_200925",
        //             "pair": "BTCUSD",
        //             "status": "FILLED",
        //             "clientOrderId": "autoclose-1596542005017000006",
        //             "price": "11326.9",
        //             "avgPrice": "11326.9",
        //             "origQty": "1",
        //             "executedQty": "1",
        //             "cumBase": "0.00882854",
        //             "timeInForce": "IOC",
        //             "type": "LIMIT",
        //             "reduceOnly": false,
        //             "closePosition": false,
        //             "side": "SELL",
        //             "positionSide": "BOTH",
        //             "stopPrice": "0",
        //             "workingType": "CONTRACT_PRICE",
        //             "priceProtect": false,
        //             "origType": "LIMIT",
        //             "time": 1596542005019,
        //             "updateTime": 1596542005050
        //         },
        //     ]
        //
        const liquidations = this.safeList(response, 'rows', response);
        return this.parseLiquidations(liquidations, market, since, limit);
    }
    parseLiquidation(liquidation, market = undefined) {
        //
        // margin
        //
        //     {
        //         "avgPrice": "0.00388359",
        //         "executedQty": "31.39000000",
        //         "orderId": 180015097,
        //         "price": "0.00388110",
        //         "qty": "31.39000000",
        //         "side": "SELL",
        //         "symbol": "BNBBTC",
        //         "timeInForce": "GTC",
        //         "isIsolated": true,
        //         "updatedTime": 1558941374745
        //     }
        //
        // linear
        //
        //     {
        //         "orderId": 6071832819,
        //         "symbol": "BTCUSDT",
        //         "status": "FILLED",
        //         "clientOrderId": "autoclose-1596107620040000020",
        //         "price": "10871.09",
        //         "avgPrice": "10913.21000",
        //         "origQty": "0.001",
        //         "executedQty": "0.002",
        //         "cumQuote": "10.91321",
        //         "timeInForce": "IOC",
        //         "type": "LIMIT",
        //         "reduceOnly": false,
        //         "closePosition": false,
        //         "side": "SELL",
        //         "positionSide": "BOTH",
        //         "stopPrice": "0",
        //         "workingType": "CONTRACT_PRICE",
        //         "origType": "LIMIT",
        //         "time": 1596107620044,
        //         "updateTime": 1596107620087
        //     }
        //
        // inverse
        //
        //     {
        //         "orderId": 165123080,
        //         "symbol": "BTCUSD_200925",
        //         "pair": "BTCUSD",
        //         "status": "FILLED",
        //         "clientOrderId": "autoclose-1596542005017000006",
        //         "price": "11326.9",
        //         "avgPrice": "11326.9",
        //         "origQty": "1",
        //         "executedQty": "1",
        //         "cumBase": "0.00882854",
        //         "timeInForce": "IOC",
        //         "type": "LIMIT",
        //         "reduceOnly": false,
        //         "closePosition": false,
        //         "side": "SELL",
        //         "positionSide": "BOTH",
        //         "stopPrice": "0",
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false,
        //         "origType": "LIMIT",
        //         "time": 1596542005019,
        //         "updateTime": 1596542005050
        //     }
        //
        const marketId = this.safeString(liquidation, 'symbol');
        const timestamp = this.safeInteger2(liquidation, 'updatedTime', 'updateTime');
        return this.safeLiquidation({
            'info': liquidation,
            'symbol': this.safeSymbol(marketId, market),
            'contracts': this.safeNumber(liquidation, 'executedQty'),
            'contractSize': this.safeNumber(market, 'contractSize'),
            'price': this.safeNumber(liquidation, 'avgPrice'),
            'side': this.safeStringLower(liquidation, 'side'),
            'baseValue': this.safeNumber(liquidation, 'cumBase'),
            'quoteValue': this.safeNumber(liquidation, 'cumQuote'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        });
    }
    /**
     * @method
     * @name binance#fetchGreeks
     * @description fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Option-Mark-Price
     * @param {string} symbol unified symbol of the market to fetch greeks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [greeks structure]{@link https://docs.ccxt.com/#/?id=greeks-structure}
     */
    async fetchGreeks(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.eapiPublicGetMark(this.extend(request, params));
        //
        //     [
        //         {
        //             "symbol": "BTC-231229-40000-C",
        //             "markPrice": "2012",
        //             "bidIV": "0.60236275",
        //             "askIV": "0.62267244",
        //             "markIV": "0.6125176",
        //             "delta": "0.39111646",
        //             "theta": "-32.13948531",
        //             "gamma": "0.00004656",
        //             "vega": "51.70062218",
        //             "highPriceLimit": "6474",
        //             "lowPriceLimit": "5"
        //         }
        //     ]
        //
        return this.parseGreeks(response[0], market);
    }
    /**
     * @method
     * @name binance#fetchAllGreeks
     * @description fetches all option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Option-Mark-Price
     * @param {string[]} [symbols] unified symbols of the markets to fetch greeks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [greeks structure]{@link https://docs.ccxt.com/#/?id=greeks-structure}
     */
    async fetchAllGreeks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, true, true, true);
        const request = {};
        let market = undefined;
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                market = this.market(symbols[0]);
                request['symbol'] = market['id'];
            }
        }
        const response = await this.eapiPublicGetMark(this.extend(request, params));
        //
        //     [
        //         {
        //             "symbol": "BTC-231229-40000-C",
        //             "markPrice": "2012",
        //             "bidIV": "0.60236275",
        //             "askIV": "0.62267244",
        //             "markIV": "0.6125176",
        //             "delta": "0.39111646",
        //             "theta": "-32.13948531",
        //             "gamma": "0.00004656",
        //             "vega": "51.70062218",
        //             "highPriceLimit": "6474",
        //             "lowPriceLimit": "5"
        //         }
        //     ]
        //
        return this.parseAllGreeks(response, symbols);
    }
    parseGreeks(greeks, market = undefined) {
        //
        //     {
        //         "symbol": "BTC-231229-40000-C",
        //         "markPrice": "2012",
        //         "bidIV": "0.60236275",
        //         "askIV": "0.62267244",
        //         "markIV": "0.6125176",
        //         "delta": "0.39111646",
        //         "theta": "-32.13948531",
        //         "gamma": "0.00004656",
        //         "vega": "51.70062218",
        //         "highPriceLimit": "6474",
        //         "lowPriceLimit": "5"
        //     }
        //
        const marketId = this.safeString(greeks, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        return {
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'delta': this.safeNumber(greeks, 'delta'),
            'gamma': this.safeNumber(greeks, 'gamma'),
            'theta': this.safeNumber(greeks, 'theta'),
            'vega': this.safeNumber(greeks, 'vega'),
            'rho': undefined,
            'bidSize': undefined,
            'askSize': undefined,
            'bidImpliedVolatility': this.safeNumber(greeks, 'bidIV'),
            'askImpliedVolatility': this.safeNumber(greeks, 'askIV'),
            'markImpliedVolatility': this.safeNumber(greeks, 'markIV'),
            'bidPrice': undefined,
            'askPrice': undefined,
            'markPrice': this.safeNumber(greeks, 'markPrice'),
            'lastPrice': undefined,
            'underlyingPrice': undefined,
            'info': greeks,
        };
    }
    async fetchTradingLimits(symbols = undefined, params = {}) {
        // this method should not be called directly, use loadTradingLimits () instead
        const markets = await this.fetchMarkets();
        const tradingLimits = {};
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const symbol = market['symbol'];
            if ((symbols === undefined) || (this.inArray(symbol, symbols))) {
                tradingLimits[symbol] = market['limits']['amount'];
            }
        }
        return tradingLimits;
    }
    /**
     * @method
     * @name binance#fetchPositionMode
     * @description fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Get-Current-Position-Mode
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Get-Current-Position-Mode
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    async fetchPositionMode(symbol = undefined, params = {}) {
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchPositionMode', market, params);
        let response = undefined;
        if (subType === 'linear') {
            response = await this.fapiPrivateGetPositionSideDual(params);
        }
        else if (subType === 'inverse') {
            response = await this.dapiPrivateGetPositionSideDual(params);
        }
        else {
            throw new errors.BadRequest(this.id + ' fetchPositionMode requires either a symbol argument or params["subType"]');
        }
        //
        //    {
        //        dualSidePosition: false
        //    }
        //
        const dualSidePosition = this.safeBool(response, 'dualSidePosition');
        return {
            'info': response,
            'hedged': dualSidePosition,
        };
    }
    /**
     * @method
     * @name binance#fetchMarginModes
     * @description fetches margin modes ("isolated" or "cross") that the market for the symbol in in, with symbol=undefined all markets for a subType (linear/inverse) are returned
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Symbol-Config
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a list of [margin mode structures]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
     */
    async fetchMarginModes(symbols = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
            market = this.market(symbols[0]);
        }
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchMarginMode', market, params);
        let response = undefined;
        if (subType === 'linear') {
            response = await this.fapiPrivateGetSymbolConfig(params);
            //
            // [
            //     {
            //         "symbol": "BTCUSDT",
            //         "marginType": "CROSSED",
            //         "isAutoAddMargin": "false",
            //         "leverage": 21,
            //         "maxNotionalValue": "1000000",
            //     }
            // ]
            //
        }
        else if (subType === 'inverse') {
            response = await this.dapiPrivateGetAccount(params);
            //
            //    {
            //        feeTier: '0',
            //        canTrade: true,
            //        canDeposit: true,
            //        canWithdraw: true,
            //        updateTime: '0',
            //        assets: [
            //            {
            //                asset: 'APT',
            //                walletBalance: '0.00000000',
            //                unrealizedProfit: '0.00000000',
            //                marginBalance: '0.00000000',
            //                maintMargin: '0.00000000',
            //                initialMargin: '0.00000000',
            //                positionInitialMargin: '0.00000000',
            //                openOrderInitialMargin: '0.00000000',
            //                maxWithdrawAmount: '0.00000000',
            //                crossWalletBalance: '0.00000000',
            //                crossUnPnl: '0.00000000',
            //                availableBalance: '0.00000000',
            //                updateTime: '0'
            //            },
            //            ...
            //        ],
            //        positions: [
            //            {
            //                symbol: 'BCHUSD_240329',
            //                initialMargin: '0',
            //                maintMargin: '0',
            //                unrealizedProfit: '0.00000000',
            //                positionInitialMargin: '0',
            //                openOrderInitialMargin: '0',
            //                leverage: '20',
            //                isolated: false,
            //                positionSide: 'BOTH',
            //                entryPrice: '0.00000000',
            //                maxQty: '1000',
            //                notionalValue: '0',
            //                isolatedWallet: '0',
            //                updateTime: '0',
            //                positionAmt: '0',
            //                breakEvenPrice: '0.00000000'
            //            },
            //            ...
            //        ]
            //    }
            //
        }
        else {
            throw new errors.BadRequest(this.id + ' fetchMarginModes () supports linear and inverse subTypes only');
        }
        let assets = this.safeList(response, 'positions', []);
        if (Array.isArray(response)) {
            assets = response;
        }
        return this.parseMarginModes(assets, symbols, 'symbol', 'swap');
    }
    /**
     * @method
     * @name binance#fetchMarginMode
     * @description fetches the margin mode of a specific symbol
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Symbol-Config
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
     */
    async fetchMarginMode(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchMarginMode', market, params);
        let response = undefined;
        if (subType === 'linear') {
            const request = {
                'symbol': market['id'],
            };
            response = await this.fapiPrivateGetSymbolConfig(this.extend(request, params));
            //
            // [
            //     {
            //         "symbol": "BTCUSDT",
            //         "marginType": "CROSSED",
            //         "isAutoAddMargin": "false",
            //         "leverage": 21,
            //         "maxNotionalValue": "1000000",
            //     }
            // ]
            //
        }
        else if (subType === 'inverse') {
            const fetchMarginModesResponse = await this.fetchMarginModes([symbol], params);
            return fetchMarginModesResponse[symbol];
        }
        else {
            throw new errors.BadRequest(this.id + ' fetchMarginMode () supports linear and inverse subTypes only');
        }
        return this.parseMarginMode(response[0], market);
    }
    parseMarginMode(marginMode, market = undefined) {
        const marketId = this.safeString(marginMode, 'symbol');
        market = this.safeMarket(marketId, market);
        const marginModeRaw = this.safeBool(marginMode, 'isolated');
        let reMarginMode = undefined;
        if (marginModeRaw !== undefined) {
            reMarginMode = marginModeRaw ? 'isolated' : 'cross';
        }
        const marginTypeRaw = this.safeStringLower(marginMode, 'marginType');
        if (marginTypeRaw !== undefined) {
            reMarginMode = (marginTypeRaw === 'crossed') ? 'cross' : 'isolated';
        }
        return {
            'info': marginMode,
            'symbol': market['symbol'],
            'marginMode': reMarginMode,
        };
    }
    /**
     * @method
     * @name binance#fetchOption
     * @description fetches option data that is commonly found in an option chain
     * @see https://developers.binance.com/docs/derivatives/option/market-data/24hr-Ticker-Price-Change-Statistics
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [option chain structure]{@link https://docs.ccxt.com/#/?id=option-chain-structure}
     */
    async fetchOption(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.eapiPublicGetTicker(this.extend(request, params));
        //
        //     [
        //         {
        //             "symbol": "BTC-241227-80000-C",
        //             "priceChange": "0",
        //             "priceChangePercent": "0",
        //             "lastPrice": "2750",
        //             "lastQty": "0",
        //             "open": "2750",
        //             "high": "2750",
        //             "low": "2750",
        //             "volume": "0",
        //             "amount": "0",
        //             "bidPrice": "4880",
        //             "askPrice": "0",
        //             "openTime": 0,
        //             "closeTime": 0,
        //             "firstTradeId": 0,
        //             "tradeCount": 0,
        //             "strikePrice": "80000",
        //             "exercisePrice": "63944.09893617"
        //         }
        //     ]
        //
        const chain = this.safeDict(response, 0, {});
        return this.parseOption(chain, undefined, market);
    }
    parseOption(chain, currency = undefined, market = undefined) {
        //
        //     {
        //         "symbol": "BTC-241227-80000-C",
        //         "priceChange": "0",
        //         "priceChangePercent": "0",
        //         "lastPrice": "2750",
        //         "lastQty": "0",
        //         "open": "2750",
        //         "high": "2750",
        //         "low": "2750",
        //         "volume": "0",
        //         "amount": "0",
        //         "bidPrice": "4880",
        //         "askPrice": "0",
        //         "openTime": 0,
        //         "closeTime": 0,
        //         "firstTradeId": 0,
        //         "tradeCount": 0,
        //         "strikePrice": "80000",
        //         "exercisePrice": "63944.09893617"
        //     }
        //
        const marketId = this.safeString(chain, 'symbol');
        market = this.safeMarket(marketId, market);
        return {
            'info': chain,
            'currency': undefined,
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'impliedVolatility': undefined,
            'openInterest': undefined,
            'bidPrice': this.safeNumber(chain, 'bidPrice'),
            'askPrice': this.safeNumber(chain, 'askPrice'),
            'midPrice': undefined,
            'markPrice': undefined,
            'lastPrice': this.safeNumber(chain, 'lastPrice'),
            'underlyingPrice': this.safeNumber(chain, 'exercisePrice'),
            'change': this.safeNumber(chain, 'priceChange'),
            'percentage': this.safeNumber(chain, 'priceChangePercent'),
            'baseVolume': this.safeNumber(chain, 'volume'),
            'quoteVolume': undefined,
        };
    }
    /**
     * @method
     * @name binance#fetchMarginAdjustmentHistory
     * @description fetches the history of margin added or reduced from contract isolated positions
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Get-Position-Margin-Change-History
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Get-Position-Margin-Change-History
     * @param {string} symbol unified market symbol
     * @param {string} [type] "add" or "reduce"
     * @param {int} [since] timestamp in ms of the earliest change to fetch
     * @param {int} [limit] the maximum amount of changes to fetch
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] timestamp in ms of the latest change to fetch
     * @returns {object[]} a list of [margin structures]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async fetchMarginAdjustmentHistory(symbol = undefined, type = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMarginAdjustmentHistory () requires a symbol argument');
        }
        const market = this.market(symbol);
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, 'until');
        const request = {
            'symbol': market['id'],
        };
        if (type !== undefined) {
            request['type'] = (type === 'add') ? 1 : 2;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (until !== undefined) {
            request['endTime'] = until;
        }
        let response = undefined;
        if (market['linear']) {
            response = await this.fapiPrivateGetPositionMarginHistory(this.extend(request, params));
        }
        else if (market['inverse']) {
            response = await this.dapiPrivateGetPositionMarginHistory(this.extend(request, params));
        }
        else {
            throw new errors.BadRequest(this.id + ' fetchMarginAdjustmentHistory () is not supported for markets of type ' + market['type']);
        }
        //
        //    [
        //        {
        //            symbol: "XRPUSDT",
        //            type: "1",
        //            deltaType: "TRADE",
        //            amount: "2.57148240",
        //            asset: "USDT",
        //            time: "1711046271555",
        //            positionSide: "BOTH",
        //            clientTranId: ""
        //        }
        //        ...
        //    ]
        //
        const modifications = this.parseMarginModifications(response);
        return this.filterBySymbolSinceLimit(modifications, symbol, since, limit);
    }
    /**
     * @method
     * @name binance#fetchConvertCurrencies
     * @description fetches all available currencies that can be converted
     * @see https://developers.binance.com/docs/convert/market-data/Query-order-quantity-precision-per-asset
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchConvertCurrencies(params = {}) {
        await this.loadMarkets();
        const response = await this.sapiGetConvertAssetInfo(params);
        //
        //     [
        //         {
        //             "asset": "BTC",
        //             "fraction": 8
        //         },
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const id = this.safeString(entry, 'asset');
            const code = this.safeCurrencyCode(id);
            result[code] = {
                'info': entry,
                'id': id,
                'code': code,
                'networks': undefined,
                'type': undefined,
                'name': undefined,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': this.parseNumber(this.parsePrecision(this.safeString(entry, 'fraction'))),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'created': undefined,
            };
        }
        return result;
    }
    /**
     * @method
     * @name binance#fetchConvertQuote
     * @description fetch a quote for converting from one currency to another
     * @see https://developers.binance.com/docs/convert/trade/Send-quote-request
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} amount how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.walletType] either 'SPOT' or 'FUNDING', the default is 'SPOT'
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async fetchConvertQuote(fromCode, toCode, amount = undefined, params = {}) {
        if (amount === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchConvertQuote() requires an amount argument');
        }
        await this.loadMarkets();
        const request = {
            'fromAsset': fromCode,
            'toAsset': toCode,
            'fromAmount': amount,
        };
        const response = await this.sapiPostConvertGetQuote(this.extend(request, params));
        //
        //     {
        //         "quoteId":"12415572564",
        //         "ratio":"38163.7",
        //         "inverseRatio":"0.0000262",
        //         "validTimestamp":1623319461670,
        //         "toAmount":"3816.37",
        //         "fromAmount":"0.1"
        //     }
        //
        const fromCurrency = this.currency(fromCode);
        const toCurrency = this.currency(toCode);
        return this.parseConversion(response, fromCurrency, toCurrency);
    }
    /**
     * @method
     * @name binance#createConvertTrade
     * @description convert from one currency to another
     * @see https://developers.binance.com/docs/convert/trade/Accept-Quote
     * @param {string} id the id of the trade that you want to make
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async createConvertTrade(id, fromCode, toCode, amount = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let response = undefined;
        if ((fromCode === 'BUSD') || (toCode === 'BUSD')) {
            if (amount === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' createConvertTrade() requires an amount argument');
            }
            request['clientTranId'] = id;
            request['asset'] = fromCode;
            request['targetAsset'] = toCode;
            request['amount'] = amount;
            response = await this.sapiPostAssetConvertTransfer(this.extend(request, params));
            //
            //     {
            //         "tranId": 118263407119,
            //         "status": "S"
            //     }
            //
        }
        else {
            request['quoteId'] = id;
            response = await this.sapiPostConvertAcceptQuote(this.extend(request, params));
            //
            //     {
            //         "orderId":"933256278426274426",
            //         "createTime":1623381330472,
            //         "orderStatus":"PROCESS"
            //     }
            //
        }
        const fromCurrency = this.currency(fromCode);
        const toCurrency = this.currency(toCode);
        return this.parseConversion(response, fromCurrency, toCurrency);
    }
    /**
     * @method
     * @name binance#fetchConvertTrade
     * @description fetch the data for a conversion trade
     * @see https://developers.binance.com/docs/convert/trade/Order-Status
     * @param {string} id the id of the trade that you want to fetch
     * @param {string} [code] the unified currency code of the conversion trade
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async fetchConvertTrade(id, code = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let response = undefined;
        if (code === 'BUSD') {
            const msInDay = 86400000;
            const now = this.milliseconds();
            if (code !== undefined) {
                const currency = this.currency(code);
                request['asset'] = currency['id'];
            }
            request['tranId'] = id;
            request['startTime'] = now - msInDay;
            request['endTime'] = now;
            response = await this.sapiGetAssetConvertTransferQueryByPage(this.extend(request, params));
            //
            //     {
            //         "total": 3,
            //         "rows": [
            //             {
            //                 "tranId": 118263615991,
            //                 "type": 244,
            //                 "time": 1664442078000,
            //                 "deductedAsset": "BUSD",
            //                 "deductedAmount": "1",
            //                 "targetAsset": "USDC",
            //                 "targetAmount": "1",
            //                 "status": "S",
            //                 "accountType": "MAIN"
            //             },
            //         ]
            //     }
            //
        }
        else {
            request['orderId'] = id;
            response = await this.sapiGetConvertOrderStatus(this.extend(request, params));
            //
            //     {
            //         "orderId":933256278426274426,
            //         "orderStatus":"SUCCESS",
            //         "fromAsset":"BTC",
            //         "fromAmount":"0.00054414",
            //         "toAsset":"USDT",
            //         "toAmount":"20",
            //         "ratio":"36755",
            //         "inverseRatio":"0.00002721",
            //         "createTime":1623381330472
            //     }
            //
        }
        let data = response;
        if (code === 'BUSD') {
            const rows = this.safeList(response, 'rows', []);
            data = this.safeDict(rows, 0, {});
        }
        const fromCurrencyId = this.safeString2(data, 'deductedAsset', 'fromAsset');
        const toCurrencyId = this.safeString2(data, 'targetAsset', 'toAsset');
        let fromCurrency = undefined;
        let toCurrency = undefined;
        if (fromCurrencyId !== undefined) {
            fromCurrency = this.currency(fromCurrencyId);
        }
        if (toCurrencyId !== undefined) {
            toCurrency = this.currency(toCurrencyId);
        }
        return this.parseConversion(data, fromCurrency, toCurrency);
    }
    /**
     * @method
     * @name binance#fetchConvertTradeHistory
     * @description fetch the users history of conversion trades
     * @see https://developers.binance.com/docs/convert/trade/Get-Convert-Trade-History
     * @param {string} [code] the unified currency code
     * @param {int} [since] the earliest time in ms to fetch conversions for
     * @param {int} [limit] the maximum number of conversion structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest conversion to fetch
     * @returns {object[]} a list of [conversion structures]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async fetchConvertTradeHistory(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        const msInThirtyDays = 2592000000;
        const now = this.milliseconds();
        if (since !== undefined) {
            request['startTime'] = since;
        }
        else {
            request['startTime'] = now - msInThirtyDays;
        }
        const endTime = this.safeInteger2(params, 'endTime', 'until');
        if (endTime !== undefined) {
            request['endTime'] = endTime;
        }
        else {
            request['endTime'] = now;
        }
        params = this.omit(params, 'until');
        let response = undefined;
        let responseQuery = undefined;
        let fromCurrencyKey = undefined;
        let toCurrencyKey = undefined;
        if (code === 'BUSD') {
            const currency = this.currency(code);
            request['asset'] = currency['id'];
            if (limit !== undefined) {
                request['size'] = limit;
            }
            fromCurrencyKey = 'deductedAsset';
            toCurrencyKey = 'targetAsset';
            responseQuery = 'rows';
            response = await this.sapiGetAssetConvertTransferQueryByPage(this.extend(request, params));
            //
            //     {
            //         "total": 3,
            //         "rows": [
            //             {
            //                 "tranId": 118263615991,
            //                 "type": 244,
            //                 "time": 1664442078000,
            //                 "deductedAsset": "BUSD",
            //                 "deductedAmount": "1",
            //                 "targetAsset": "USDC",
            //                 "targetAmount": "1",
            //                 "status": "S",
            //                 "accountType": "MAIN"
            //             },
            //         ]
            //     }
            //
        }
        else {
            if ((request['endTime'] - request['startTime']) > msInThirtyDays) {
                throw new errors.BadRequest(this.id + ' fetchConvertTradeHistory () the max interval between startTime and endTime is 30 days.');
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            fromCurrencyKey = 'fromAsset';
            toCurrencyKey = 'toAsset';
            responseQuery = 'list';
            response = await this.sapiGetConvertTradeFlow(this.extend(request, params));
            //
            //     {
            //         "list": [
            //             {
            //                 "quoteId": "f3b91c525b2644c7bc1e1cd31b6e1aa6",
            //                 "orderId": 940708407462087195,
            //                 "orderStatus": "SUCCESS",
            //                 "fromAsset": "USDT",
            //                 "fromAmount": "20",
            //                 "toAsset": "BNB",
            //                 "toAmount": "0.06154036",
            //                 "ratio": "0.00307702",
            //                 "inverseRatio": "324.99",
            //                 "createTime": 1624248872184
            //             }
            //         ],
            //         "startTime": 1623824139000,
            //         "endTime": 1626416139000,
            //         "limit": 100,
            //         "moreData": false
            //     }
            //
        }
        const rows = this.safeList(response, responseQuery, []);
        return this.parseConversions(rows, code, fromCurrencyKey, toCurrencyKey, since, limit);
    }
    parseConversion(conversion, fromCurrency = undefined, toCurrency = undefined) {
        //
        // fetchConvertQuote
        //
        //     {
        //         "quoteId":"12415572564",
        //         "ratio":"38163.7",
        //         "inverseRatio":"0.0000262",
        //         "validTimestamp":1623319461670,
        //         "toAmount":"3816.37",
        //         "fromAmount":"0.1"
        //     }
        //
        // createConvertTrade
        //
        //     {
        //         "orderId":"933256278426274426",
        //         "createTime":1623381330472,
        //         "orderStatus":"PROCESS"
        //     }
        //
        // createConvertTrade BUSD
        //
        //     {
        //         "tranId": 118263407119,
        //         "status": "S"
        //     }
        //
        // fetchConvertTrade, fetchConvertTradeHistory BUSD
        //
        //     {
        //         "tranId": 118263615991,
        //         "type": 244,
        //         "time": 1664442078000,
        //         "deductedAsset": "BUSD",
        //         "deductedAmount": "1",
        //         "targetAsset": "USDC",
        //         "targetAmount": "1",
        //         "status": "S",
        //         "accountType": "MAIN"
        //     }
        //
        // fetchConvertTrade
        //
        //     {
        //         "orderId":933256278426274426,
        //         "orderStatus":"SUCCESS",
        //         "fromAsset":"BTC",
        //         "fromAmount":"0.00054414",
        //         "toAsset":"USDT",
        //         "toAmount":"20",
        //         "ratio":"36755",
        //         "inverseRatio":"0.00002721",
        //         "createTime":1623381330472
        //     }
        //
        // fetchConvertTradeHistory
        //
        //     {
        //         "quoteId": "f3b91c525b2644c7bc1e1cd31b6e1aa6",
        //         "orderId": 940708407462087195,
        //         "orderStatus": "SUCCESS",
        //         "fromAsset": "USDT",
        //         "fromAmount": "20",
        //         "toAsset": "BNB",
        //         "toAmount": "0.06154036",
        //         "ratio": "0.00307702",
        //         "inverseRatio": "324.99",
        //         "createTime": 1624248872184
        //     }
        //
        const timestamp = this.safeIntegerN(conversion, ['time', 'validTimestamp', 'createTime']);
        const fromCur = this.safeString2(conversion, 'deductedAsset', 'fromAsset');
        const fromCode = this.safeCurrencyCode(fromCur, fromCurrency);
        const to = this.safeString2(conversion, 'targetAsset', 'toAsset');
        const toCode = this.safeCurrencyCode(to, toCurrency);
        return {
            'info': conversion,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': this.safeStringN(conversion, ['tranId', 'orderId', 'quoteId']),
            'fromCurrency': fromCode,
            'fromAmount': this.safeNumber2(conversion, 'deductedAmount', 'fromAmount'),
            'toCurrency': toCode,
            'toAmount': this.safeNumber2(conversion, 'targetAmount', 'toAmount'),
            'price': undefined,
            'fee': undefined,
        };
    }
    /**
     * @method
     * @name binance#fetchFundingIntervals
     * @description fetch the funding rate interval for multiple markets
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Get-Funding-Rate-Info
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Get-Funding-Info
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingIntervals(symbols = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
            market = this.market(symbols[0]);
        }
        const type = 'swap';
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchFundingIntervals', market, params, 'linear');
        let response = undefined;
        if (this.isLinear(type, subType)) {
            response = await this.fapiPublicGetFundingInfo(params);
        }
        else if (this.isInverse(type, subType)) {
            response = await this.dapiPublicGetFundingInfo(params);
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchFundingIntervals() supports linear and inverse swap contracts only');
        }
        //
        //     [
        //         {
        //             "symbol": "BLZUSDT",
        //             "adjustedFundingRateCap": "0.03000000",
        //             "adjustedFundingRateFloor": "-0.03000000",
        //             "fundingIntervalHours": 4,
        //             "disclaimer": false
        //         },
        //     ]
        //
        return this.parseFundingRates(response, symbols);
    }
    /**
     * @method
     * @name binance#fetchLongShortRatioHistory
     * @description fetches the long short ratio history for a unified market symbol
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Long-Short-Ratio
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/rest-api/Long-Short-Ratio
     * @param {string} symbol unified symbol of the market to fetch the long short ratio for
     * @param {string} [timeframe] the period for the ratio, default is 24 hours
     * @param {int} [since] the earliest time in ms to fetch ratios for
     * @param {int} [limit] the maximum number of long short ratio structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ratio to fetch
     * @returns {object[]} an array of [long short ratio structures]{@link https://docs.ccxt.com/#/?id=long-short-ratio-structure}
     */
    async fetchLongShortRatioHistory(symbol = undefined, timeframe = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (timeframe === undefined) {
            timeframe = '1d';
        }
        let request = {
            'period': timeframe,
        };
        [request, params] = this.handleUntilOption('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchLongShortRatioHistory', market, params);
        let response = undefined;
        if (subType === 'linear') {
            request['symbol'] = market['id'];
            response = await this.fapiDataGetGlobalLongShortAccountRatio(this.extend(request, params));
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "longAccount": "0.4558",
            //             "longShortRatio": "0.8376",
            //             "shortAccount": "0.5442",
            //             "timestamp": 1726790400000
            //         },
            //     ]
            //
        }
        else if (subType === 'inverse') {
            request['pair'] = market['info']['pair'];
            response = await this.dapiDataGetGlobalLongShortAccountRatio(this.extend(request, params));
            //
            //     [
            //         {
            //             "longAccount": "0.7262",
            //             "longShortRatio": "2.6523",
            //             "shortAccount": "0.2738",
            //             "pair": "BTCUSD",
            //             "timestamp": 1726790400000
            //         },
            //     ]
            //
        }
        else {
            throw new errors.BadRequest(this.id + ' fetchLongShortRatioHistory() supports linear and inverse subTypes only');
        }
        return this.parseLongShortRatioHistory(response, market);
    }
    parseLongShortRatio(info, market = undefined) {
        //
        // linear
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "longAccount": "0.4558",
        //         "longShortRatio": "0.8376",
        //         "shortAccount": "0.5442",
        //         "timestamp": 1726790400000
        //     }
        //
        // inverse
        //
        //     {
        //         "longAccount": "0.7262",
        //         "longShortRatio": "2.6523",
        //         "shortAccount": "0.2738",
        //         "pair": "BTCUSD",
        //         "timestamp": 1726790400000
        //     }
        //
        const marketId = this.safeString(info, 'symbol');
        const timestamp = this.safeIntegerOmitZero(info, 'timestamp');
        return {
            'info': info,
            'symbol': this.safeSymbol(marketId, market, undefined, 'contract'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'timeframe': undefined,
            'longShortRatio': this.safeNumber(info, 'longShortRatio'),
        };
    }
}

exports["default"] = binance;
