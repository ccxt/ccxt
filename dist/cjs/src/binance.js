'use strict';

var binance$1 = require('./abstract/binance.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var rsa = require('./base/functions/rsa.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class binance extends binance$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'binance',
            'name': 'Binance',
            'countries': ['JP', 'MT'],
            'rateLimit': 50,
            'certified': true,
            'pro': true,
            // new metainfo interface
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': true,
                'addMargin': true,
                'borrowMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': undefined,
                'createDepositAddress': false,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': true,
                'editOrder': true,
                'fetchAccounts': undefined,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowInterest': true,
                'fetchBorrowRate': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': true,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledOrders': 'emulated',
                'fetchClosedOrder': false,
                'fetchClosedOrders': 'emulated',
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': true,
                'fetchL3OrderBook': undefined,
                'fetchLastPrices': true,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': true,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': true,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchPositionsRisk': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTradingLimits': undefined,
                'fetchTransactionFee': undefined,
                'fetchTransactionFees': true,
                'fetchTransactions': false,
                'fetchTransfers': true,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': true,
                'repayMargin': true,
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
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'test': {
                    'dapiPublic': 'https://testnet.binancefuture.com/dapi/v1',
                    'dapiPrivate': 'https://testnet.binancefuture.com/dapi/v1',
                    'dapiPrivateV2': 'https://testnet.binancefuture.com/dapi/v2',
                    'fapiPublic': 'https://testnet.binancefuture.com/fapi/v1',
                    'fapiPrivate': 'https://testnet.binancefuture.com/fapi/v1',
                    'fapiPrivateV2': 'https://testnet.binancefuture.com/fapi/v2',
                    'public': 'https://testnet.binance.vision/api/v3',
                    'private': 'https://testnet.binance.vision/api/v3',
                    'v1': 'https://testnet.binance.vision/api/v1',
                },
                'api': {
                    'wapi': 'https://api.binance.com/wapi/v3',
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
                    'fapiPrivate': 'https://fapi.binance.com/fapi/v1',
                    'fapiData': 'https://fapi.binance.com/futures/data',
                    'fapiPrivateV2': 'https://fapi.binance.com/fapi/v2',
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
                    'https://binance-docs.github.io/apidocs/spot/en',
                ],
                'api_management': 'https://www.binance.com/en/usercenter/settings/api-management',
                'fees': 'https://www.binance.com/en/fee/schedule',
            },
            'api': {
                // the API structure below will need 3-layer apidefs
                'sapi': {
                    // IP (api) = 1200 per minute => (rateLimit = 50)
                    // IP (sapi) request rate limit of 12 000 per minute
                    // 1 IP (sapi) => cost = 0.1
                    // 10 IP (sapi) => cost = 1
                    // UID (sapi) request rate limit of 180 000 per minute
                    // 1 UID (sapi) => cost = 1200 / 180 000 = 0.006667
                    'get': {
                        'system/status': 0.1,
                        // these endpoints require this.apiKey
                        'accountSnapshot': 240,
                        'margin/asset': 1,
                        'margin/pair': 1,
                        'margin/allAssets': 0.1,
                        'margin/allPairs': 0.1,
                        'margin/priceIndex': 1,
                        // these endpoints require this.apiKey + this.secret
                        'asset/assetDividend': 1,
                        'asset/dribblet': 0.1,
                        'asset/transfer': 0.1,
                        'asset/assetDetail': 0.1,
                        'asset/tradeFee': 0.1,
                        'asset/ledger-transfer/cloud-mining/queryByPage': 4,
                        'asset/convert-transfer/queryByPage': 0.033335,
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
                        'margin/crossMarginCollateralRatio': 10,
                        'margin/exchange-small-liability': 0.6667,
                        'margin/exchange-small-liability-history': 0.6667,
                        'margin/next-hourly-interest-rate': 0.6667,
                        'loan/income': 40,
                        'loan/ongoing/orders': 40,
                        'loan/ltv/adjustment/history': 40,
                        'loan/borrow/history': 40,
                        'loan/repay/history': 40,
                        'loan/loanable/data': 40,
                        'loan/collateral/data': 40,
                        'loan/repay/collateral/rate': 600,
                        'loan/vip/ongoing/orders': 40,
                        'loan/vip/repay/history': 40,
                        'loan/vip/collateral/account': 600,
                        'fiat/orders': 600.03,
                        'fiat/payments': 0.1,
                        'futures/transfer': 1,
                        'futures/loan/borrow/history': 1,
                        'futures/loan/repay/history': 1,
                        'futures/loan/wallet': 1,
                        'futures/loan/adjustCollateral/history': 1,
                        'futures/loan/liquidationHistory': 1,
                        'rebate/taxQuery': 20.001,
                        // https://binance-docs.github.io/apidocs/spot/en/#withdraw-sapi
                        'capital/config/getall': 1,
                        'capital/deposit/address': 1,
                        'capital/deposit/hisrec': 0.1,
                        'capital/deposit/subAddress': 0.1,
                        'capital/deposit/subHisrec': 0.1,
                        'capital/withdraw/history': 0.1,
                        'capital/contract/convertible-coins': 4.0002,
                        'convert/tradeFlow': 0.6667,
                        'convert/exchangeInfo': 50,
                        'convert/assetInfo': 10,
                        'convert/orderStatus': 0.6667,
                        'account/status': 0.1,
                        'account/apiTradingStatus': 0.1,
                        'account/apiRestrictions/ipRestriction': 0.1,
                        'bnbBurn': 0.1,
                        // 'sub-account/assets': 1, (v3 endpoint)
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
                        'sub-account/transaction-tatistics': 0.4,
                        'managed-subaccount/asset': 0.1,
                        'managed-subaccount/accountSnapshot': 240,
                        'managed-subaccount/queryTransLogForInvestor': 0.1,
                        'managed-subaccount/queryTransLogForTradeParent': 0.1,
                        'managed-subaccount/fetch-future-asset': 0.1,
                        'managed-subaccount/marginAsset': 0.1,
                        'managed-subaccount/info': 0.4,
                        'managed-subaccount/deposit/address': 0.1,
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
                        'algo/futures/openOrders': 0.1,
                        'algo/futures/historicalOrders': 0.1,
                        'algo/futures/subOrders': 0.1,
                        'portfolio/account': 0.1,
                        'portfolio/collateralRate': 5,
                        'portfolio/pmLoan': 3.3335,
                        'portfolio/interest-history': 0.6667,
                        'portfolio/interest-rate': 0.6667,
                        'portfolio/asset-index-price': 0.1,
                        // staking
                        'staking/productList': 0.1,
                        'staking/position': 0.1,
                        'staking/stakingRecord': 0.1,
                        'staking/personalLeftQuota': 0.1,
                    },
                    'post': {
                        'asset/dust': 1,
                        'asset/dust-btc': 0.1,
                        'asset/transfer': 0.1,
                        'asset/get-funding-asset': 0.1,
                        'asset/convert-transfer': 0.033335,
                        'account/disableFastWithdrawSwitch': 0.1,
                        'account/enableFastWithdrawSwitch': 0.1,
                        // 'account/apiRestrictions/ipRestriction': 1, discontinued
                        // 'account/apiRestrictions/ipRestriction/ipList': 1, discontinued
                        'capital/withdraw/apply': 4.0002,
                        'capital/contract/convertible-coins': 4.0002,
                        'capital/deposit/credit-apply': 0.1,
                        'margin/transfer': 1,
                        'margin/loan': 20.001,
                        'margin/repay': 20.001,
                        'margin/order': 0.040002,
                        'margin/order/oco': 0.040002,
                        'margin/exchange-small-liability': 20.001,
                        // 'margin/isolated/create': 1, discontinued
                        'margin/isolated/transfer': 4.0002,
                        'margin/isolated/account': 2.0001,
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
                        // v2 not supported yet
                        // 'sub-account/subAccountApi/ipRestriction': 20,
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
                        'algo/futures/newOrderVp': 20.001,
                        'algo/futures/newOrderTwap': 20.001,
                        // staking
                        'staking/purchase': 0.1,
                        'staking/redeem': 0.1,
                        'staking/setAutoStaking': 0.1,
                        'portfolio/repay': 20.001,
                        'loan/borrow': 40,
                        'loan/repay': 40,
                        'loan/adjust/ltv': 40,
                        'loan/customize/margin_call': 40,
                        'loan/vip/repay': 40,
                        'convert/getQuote': 20.001,
                        'convert/acceptQuote': 3.3335,
                    },
                    'put': {
                        'userDataStream': 0.1,
                        'userDataStream/isolated': 0.1,
                    },
                    'delete': {
                        // 'account/apiRestrictions/ipRestriction/ipList': 1, discontinued
                        'margin/openOrders': 0.1,
                        'margin/order': 0.0066667,
                        'margin/orderList': 0.0066667,
                        'margin/isolated/account': 2.0001,
                        'userDataStream': 0.1,
                        'userDataStream/isolated': 0.1,
                        // brokerage API TODO NO MENTION OF RATELIMIT IN BROKERAGE DOCS
                        'broker/subAccountApi': 1,
                        'broker/subAccountApi/ipRestriction/ipList': 1,
                        'algo/futures/order': 0.1,
                    },
                },
                'sapiV2': {
                    'get': {
                        'sub-account/futures/account': 0.1,
                        'sub-account/futures/positionRisk': 0.1,
                    },
                },
                'sapiV3': {
                    'get': {
                        'sub-account/assets': 1,
                    },
                    'post': {
                        'asset/getUserAsset': 0.5,
                    },
                },
                'sapiV4': {
                    'get': {
                        'sub-account/assets': 1,
                    },
                },
                // deprecated
                'wapi': {
                    'post': {
                        'withdraw': 1,
                        'sub-account/transfer': 1,
                    },
                    'get': {
                        'depositHistory': 1,
                        'withdrawHistory': 1,
                        'depositAddress': 1,
                        'accountStatus': 1,
                        'systemStatus': 1,
                        'apiTradingStatus': 1,
                        'userAssetDribbletLog': 1,
                        'tradeFee': 1,
                        'assetDetail': 1,
                        'sub-account/list': 1,
                        'sub-account/transfer/history': 1,
                        'sub-account/assets': 1,
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
                        'ticker/24hr': { 'cost': 1, 'noSymbol': 40 },
                        'ticker/price': { 'cost': 1, 'noSymbol': 2 },
                        'ticker/bookTicker': { 'cost': 1, 'noSymbol': 2 },
                        'openInterest': 1,
                        'pmExchangeInfo': 1,
                    },
                },
                'dapiData': {
                    'get': {
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
                        'orderAmendment': 1,
                        'pmAccountInfo': 5,
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
                        'fundingRate': 1,
                        'premiumIndex': 1,
                        'ticker/24hr': { 'cost': 1, 'noSymbol': 40 },
                        'ticker/price': { 'cost': 1, 'noSymbol': 2 },
                        'ticker/bookTicker': { 'cost': 1, 'noSymbol': 2 },
                        'openInterest': 1,
                        'indexInfo': 1,
                        'apiTradingStatus': { 'cost': 1, 'noSymbol': 10 },
                        'lvtKlines': 1,
                        'pmExchangeInfo': 1,
                    },
                },
                'fapiData': {
                    'get': {
                        'openInterestHist': 1,
                        'topLongShortAccountRatio': 1,
                        'topLongShortPositionRatio': 1,
                        'globalLongShortAccountRatio': 1,
                        'takerlongshortRatio': 1,
                    },
                },
                'fapiPrivate': {
                    'get': {
                        'forceOrders': { 'cost': 20, 'noSymbol': 50 },
                        'allOrders': 5,
                        'openOrder': 1,
                        'openOrders': 1,
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
                'fapiPrivateV2': {
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
                        'marginAccount': 3,
                        'mmp': 1,
                        'countdownCancelAll': 1,
                        'order': 1,
                    },
                    'post': {
                        'order': 1,
                        'batchOrders': 5,
                        'listenKey': 1,
                        'mmpSet': 1,
                        'mmpReset': 1,
                        'countdownCancelAll': 1,
                        'countdownCancelAllHeartBeat': 10,
                    },
                    'put': {
                        'listenKey': 1,
                    },
                    'delete': {
                        'order': 1,
                        'batchOrders': 1,
                        'allOpenOrders': 1,
                        'allOpenOrdersByUnderlying': 1,
                        'listenKey': 1,
                    },
                },
                'public': {
                    'get': {
                        'ping': 1,
                        'time': 1,
                        'depth': { 'cost': 1, 'byLimit': [[100, 1], [500, 5], [1000, 10], [5000, 50]] },
                        'trades': 1,
                        'aggTrades': 1,
                        'historicalTrades': 5,
                        'klines': 1,
                        'ticker/24hr': { 'cost': 1, 'noSymbol': 40 },
                        'ticker/price': { 'cost': 1, 'noSymbol': 2 },
                        'ticker/bookTicker': { 'cost': 1, 'noSymbol': 2 },
                        'exchangeInfo': 10,
                    },
                    'put': {
                        'userDataStream': 1,
                    },
                    'post': {
                        'userDataStream': 1,
                    },
                    'delete': {
                        'userDataStream': 1,
                    },
                },
                'private': {
                    'get': {
                        'allOrderList': 10,
                        'openOrderList': 3,
                        'orderList': 2,
                        'order': 2,
                        'openOrders': { 'cost': 3, 'noSymbol': 40 },
                        'allOrders': 10,
                        'account': 10,
                        'myTrades': 10,
                        'rateLimit/order': 20,
                        'myPreventedMatches': 1,
                    },
                    'post': {
                        'order/oco': 1,
                        'order': 1,
                        'order/cancelReplace': 1,
                        'order/test': 1,
                    },
                    'delete': {
                        'openOrders': 1,
                        'orderList': 1,
                        'order': 1,
                    },
                },
                'papi': {
                    'get': {
                        'um/order': 1,
                        'um/openOrder': 1,
                        'um/openOrders': 1,
                        'um/allOrders': 5,
                        'cm/order': 1,
                        'cm/openOrder': 1,
                        'cm/openOrders': 1,
                        'cm/allOrders': 20,
                        'balance': 20,
                        'account': 20,
                        'margin/maxBorrowable': 5,
                        'margin/maxWithdraw': 5,
                        'um/positionRisk': 5,
                        'cm/positionRisk': 1,
                        'um/positionSide/dual': 30,
                        'cm/positionSide/dual': 30,
                        'um/userTrades': 5,
                        'cm/userTrades': 20,
                        'um/leverageBracket': 1,
                        'cm/leverageBracket': 1,
                        'margin/forceOrders': 1,
                        'um/forceOrders': 20,
                        'cm/forceOrders': 20,
                        'um/apiTradingStatus': 1,
                        'um/commissionRate': 20,
                        'cm/commissionRate': 20,
                        'margin/marginLoan': 0.0667,
                        'margin/repayLoan': 0.0667,
                        'margin/marginInterestHistory': 0.1,
                        'portfolio/interest-history': 50, // 50
                    },
                    'post': {
                        'um/order': 1,
                        'cm/order': 1,
                        'margin/order': 0.0133,
                        'marginLoan': 0.1333,
                        'repayLoan': 0.1333,
                        'margin/order/oco': 0.0400,
                        'um/leverage': 1,
                        'cm/leverage': 1,
                        'um/positionSide/dual': 1,
                        'cm/positionSide/dual': 1,
                        'auto-collection': 0.6667,
                        'bnb-transfer': 0.6667,
                        'listenKey': 1, // 1
                    },
                    'put': {
                        'listenKey': 1, // 1
                    },
                    'delete': {
                        'um/order': 1,
                        'um/allOpenOrders': 1,
                        'cm/order': 1,
                        'cm/allOpenOrders': 1,
                        'margin/order': 1,
                        'margin/allOpenOrders': 5,
                        'margin/orderList': 2,
                        'listenKey': 1, // 1
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
                        'taker': this.parseNumber('0.000400'),
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
            'commonCurrencies': {
                'BCC': 'BCC',
                'YOYO': 'YOYOW',
            },
            'precisionMode': number.DECIMAL_PLACES,
            // exchange-specific options
            'options': {
                'sandboxMode': false,
                'fetchMarkets': [
                    'spot',
                    'linear',
                    'inverse', // allows CORS in browsers
                    // 'option', // does not allow CORS, enable outside of the browser only
                ],
                'fetchCurrencies': true,
                // 'fetchTradesMethod': 'publicGetAggTrades', // publicGetTrades, publicGetHistoricalTrades, eapiPublicGetTrades
                'defaultTimeInForce': 'GTC',
                'defaultType': 'spot',
                'defaultSubType': undefined,
                'hasAlreadyAuthenticatedSuccessfully': false,
                'warnOnFetchOpenOrdersWithoutSymbol': true,
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
                    'spot': 'x-R4BD3S82',
                    'margin': 'x-R4BD3S82',
                    'future': 'x-xcKtGhcu',
                    'delivery': 'x-xcKtGhcu',
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
                },
                // keeping this object for backward-compatibility
                'reverseNetworks': {
                    'tronscan.org': 'TRC20',
                    'etherscan.io': 'ERC20',
                    'bscscan.com': 'BSC',
                    'explorer.binance.org': 'BEP2',
                    'bithomp.com': 'XRP',
                    'bloks.io': 'EOS',
                    'stellar.expert': 'XLM',
                    'blockchair.com/bitcoin': 'BTC',
                    'blockchair.com/bitcoin-cash': 'BCH',
                    'blockchair.com/ecash': 'XEC',
                    'explorer.litecoin.net': 'LTC',
                    'explorer.avax.network': 'AVAX',
                    'solscan.io': 'SOL',
                    'polkadot.subscan.io': 'DOT',
                    'dashboard.internetcomputer.org': 'ICP',
                    'explorer.chiliz.com': 'CHZ',
                    'cardanoscan.io': 'ADA',
                    'mainnet.theoan.com': 'AION',
                    'algoexplorer.io': 'ALGO',
                    'explorer.ambrosus.com': 'AMB',
                    'viewblock.io/zilliqa': 'ZIL',
                    'viewblock.io/arweave': 'AR',
                    'explorer.ark.io': 'ARK',
                    'atomscan.com': 'ATOM',
                    'www.mintscan.io': 'CTK',
                    'explorer.bitcoindiamond.org': 'BCD',
                    'btgexplorer.com': 'BTG',
                    'bts.ai': 'BTS',
                    'explorer.celo.org': 'CELO',
                    'explorer.nervos.org': 'CKB',
                    'cerebro.cortexlabs.ai': 'CTXC',
                    'chainz.cryptoid.info': 'VIA',
                    'explorer.dcrdata.org': 'DCR',
                    'digiexplorer.info': 'DGB',
                    'dock.subscan.io': 'DOCK',
                    'dogechain.info': 'DOGE',
                    'explorer.elrond.com': 'EGLD',
                    'blockscout.com': 'ETC',
                    'explore-fetchhub.fetch.ai': 'FET',
                    'filfox.info': 'FIL',
                    'fio.bloks.io': 'FIO',
                    'explorer.firo.org': 'FIRO',
                    'neoscan.io': 'NEO',
                    'ftmscan.com': 'FTM',
                    'explorer.gochain.io': 'GO',
                    'block.gxb.io': 'GXS',
                    'hash-hash.info': 'HBAR',
                    'www.hiveblockexplorer.com': 'HIVE',
                    'explorer.helium.com': 'HNT',
                    'tracker.icon.foundation': 'ICX',
                    'www.iostabc.com': 'IOST',
                    'explorer.iota.org': 'IOTA',
                    'iotexscan.io': 'IOTX',
                    'irishub.iobscan.io': 'IRIS',
                    'kava.mintscan.io': 'KAVA',
                    'scope.klaytn.com': 'KLAY',
                    'kmdexplorer.io': 'KMD',
                    'kusama.subscan.io': 'KSM',
                    'explorer.lto.network': 'LTO',
                    'polygonscan.com': 'POLYGON',
                    'explorer.ont.io': 'ONT',
                    'minaexplorer.com': 'MINA',
                    'nanolooker.com': 'NANO',
                    'explorer.nebulas.io': 'NAS',
                    'explorer.nbs.plus': 'NBS',
                    'explorer.nebl.io': 'NEBL',
                    'nulscan.io': 'NULS',
                    'nxscan.com': 'NXS',
                    'explorer.harmony.one': 'ONE',
                    'explorer.poa.network': 'POA',
                    'qtum.info': 'QTUM',
                    'explorer.rsk.co': 'RSK',
                    'www.oasisscan.com': 'ROSE',
                    'ravencoin.network': 'RVN',
                    'sc.tokenview.com': 'SC',
                    'secretnodes.com': 'SCRT',
                    'explorer.skycoin.com': 'SKY',
                    'steemscan.com': 'STEEM',
                    'explorer.stacks.co': 'STX',
                    'www.thetascan.io': 'THETA',
                    'scan.tomochain.com': 'TOMO',
                    'explore.vechain.org': 'VET',
                    'explorer.vite.net': 'VITE',
                    'www.wanscan.org': 'WAN',
                    'wavesexplorer.com': 'WAVES',
                    'wax.eosx.io': 'WAXP',
                    'waltonchain.pro': 'WTC',
                    'chain.nem.ninja': 'XEM',
                    'verge-blockchain.info': 'XVG',
                    'explorer.yoyow.org': 'YOYOW',
                    'explorer.zcha.in': 'ZEC',
                    'explorer.zensystem.io': 'ZEN',
                },
                'networksById': {
                    'tronscan.org': 'TRC20',
                    'etherscan.io': 'ERC20',
                    'bscscan.com': 'BSC',
                    'explorer.binance.org': 'BEP2',
                    'bithomp.com': 'XRP',
                    'bloks.io': 'EOS',
                    'stellar.expert': 'XLM',
                    'blockchair.com/bitcoin': 'BTC',
                    'blockchair.com/bitcoin-cash': 'BCH',
                    'blockchair.com/ecash': 'XEC',
                    'explorer.litecoin.net': 'LTC',
                    'explorer.avax.network': 'AVAX',
                    'solscan.io': 'SOL',
                    'polkadot.subscan.io': 'DOT',
                    'dashboard.internetcomputer.org': 'ICP',
                    'explorer.chiliz.com': 'CHZ',
                    'cardanoscan.io': 'ADA',
                    'mainnet.theoan.com': 'AION',
                    'algoexplorer.io': 'ALGO',
                    'explorer.ambrosus.com': 'AMB',
                    'viewblock.io/zilliqa': 'ZIL',
                    'viewblock.io/arweave': 'AR',
                    'explorer.ark.io': 'ARK',
                    'atomscan.com': 'ATOM',
                    'www.mintscan.io': 'CTK',
                    'explorer.bitcoindiamond.org': 'BCD',
                    'btgexplorer.com': 'BTG',
                    'bts.ai': 'BTS',
                    'explorer.celo.org': 'CELO',
                    'explorer.nervos.org': 'CKB',
                    'cerebro.cortexlabs.ai': 'CTXC',
                    'chainz.cryptoid.info': 'VIA',
                    'explorer.dcrdata.org': 'DCR',
                    'digiexplorer.info': 'DGB',
                    'dock.subscan.io': 'DOCK',
                    'dogechain.info': 'DOGE',
                    'explorer.elrond.com': 'EGLD',
                    'blockscout.com': 'ETC',
                    'explore-fetchhub.fetch.ai': 'FET',
                    'filfox.info': 'FIL',
                    'fio.bloks.io': 'FIO',
                    'explorer.firo.org': 'FIRO',
                    'neoscan.io': 'NEO',
                    'ftmscan.com': 'FTM',
                    'explorer.gochain.io': 'GO',
                    'block.gxb.io': 'GXS',
                    'hash-hash.info': 'HBAR',
                    'www.hiveblockexplorer.com': 'HIVE',
                    'explorer.helium.com': 'HNT',
                    'tracker.icon.foundation': 'ICX',
                    'www.iostabc.com': 'IOST',
                    'explorer.iota.org': 'IOTA',
                    'iotexscan.io': 'IOTX',
                    'irishub.iobscan.io': 'IRIS',
                    'kava.mintscan.io': 'KAVA',
                    'scope.klaytn.com': 'KLAY',
                    'kmdexplorer.io': 'KMD',
                    'kusama.subscan.io': 'KSM',
                    'explorer.lto.network': 'LTO',
                    'polygonscan.com': 'POLYGON',
                    'explorer.ont.io': 'ONT',
                    'minaexplorer.com': 'MINA',
                    'nanolooker.com': 'NANO',
                    'explorer.nebulas.io': 'NAS',
                    'explorer.nbs.plus': 'NBS',
                    'explorer.nebl.io': 'NEBL',
                    'nulscan.io': 'NULS',
                    'nxscan.com': 'NXS',
                    'explorer.harmony.one': 'ONE',
                    'explorer.poa.network': 'POA',
                    'qtum.info': 'QTUM',
                    'explorer.rsk.co': 'RSK',
                    'www.oasisscan.com': 'ROSE',
                    'ravencoin.network': 'RVN',
                    'sc.tokenview.com': 'SC',
                    'secretnodes.com': 'SCRT',
                    'explorer.skycoin.com': 'SKY',
                    'steemscan.com': 'STEEM',
                    'explorer.stacks.co': 'STX',
                    'www.thetascan.io': 'THETA',
                    'scan.tomochain.com': 'TOMO',
                    'explore.vechain.org': 'VET',
                    'explorer.vite.net': 'VITE',
                    'www.wanscan.org': 'WAN',
                    'wavesexplorer.com': 'WAVES',
                    'wax.eosx.io': 'WAXP',
                    'waltonchain.pro': 'WTC',
                    'chain.nem.ninja': 'XEM',
                    'verge-blockchain.info': 'XVG',
                    'explorer.yoyow.org': 'YOYOW',
                    'explorer.zcha.in': 'ZEC',
                    'explorer.zensystem.io': 'ZEN',
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
            },
            // https://binance-docs.github.io/apidocs/spot/en/#error-codes-2
            'exceptions': {
                'exact': {
                    'System is under maintenance.': errors.OnMaintenance,
                    'System abnormality': errors.ExchangeError,
                    'You are not authorized to execute this request.': errors.PermissionDenied,
                    'API key does not exist': errors.AuthenticationError,
                    'Order would trigger immediately.': errors.OrderImmediatelyFillable,
                    'Stop price would trigger immediately.': errors.OrderImmediatelyFillable,
                    'Order would immediately match and take.': errors.OrderImmediatelyFillable,
                    'Account has insufficient balance for requested action.': errors.InsufficientFunds,
                    'Rest API trading is not enabled.': errors.ExchangeNotAvailable,
                    "You don't have permission.": errors.PermissionDenied,
                    'Market is closed.': errors.ExchangeNotAvailable,
                    'Too many requests. Please try again later.': errors.DDoSProtection,
                    'This action is disabled on this account.': errors.AccountSuspended,
                    'This type of sub-account exceeds the maximum number limit': errors.BadRequest,
                    'This symbol is not permitted for this account.': errors.PermissionDenied,
                    '-1000': errors.ExchangeNotAvailable,
                    '-1001': errors.ExchangeNotAvailable,
                    '-1002': errors.AuthenticationError,
                    '-1003': errors.RateLimitExceeded,
                    '-1004': errors.DDoSProtection,
                    '-1005': errors.PermissionDenied,
                    '-1006': errors.BadResponse,
                    '-1007': errors.RequestTimeout,
                    '-1010': errors.BadResponse,
                    '-1011': errors.PermissionDenied,
                    '-1013': errors.InvalidOrder,
                    '-1014': errors.InvalidOrder,
                    '-1015': errors.RateLimitExceeded,
                    '-1016': errors.ExchangeNotAvailable,
                    '-1020': errors.BadRequest,
                    '-1021': errors.InvalidNonce,
                    '-1022': errors.AuthenticationError,
                    '-1023': errors.BadRequest,
                    '-1099': errors.AuthenticationError,
                    '-1100': errors.BadRequest,
                    '-1101': errors.BadRequest,
                    '-1102': errors.BadRequest,
                    '-1103': errors.BadRequest,
                    '-1104': errors.BadRequest,
                    '-1105': errors.BadRequest,
                    '-1106': errors.BadRequest,
                    '-1108': errors.BadRequest,
                    '-1109': errors.AuthenticationError,
                    '-1110': errors.BadRequest,
                    '-1111': errors.BadRequest,
                    '-1112': errors.InvalidOrder,
                    '-1113': errors.BadRequest,
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
                    '-1131': errors.BadRequest,
                    '-1135': errors.BadRequest,
                    '-1136': errors.BadRequest,
                    '-2008': errors.AuthenticationError,
                    '-2010': errors.ExchangeError,
                    '-2011': errors.OrderNotFound,
                    '-2013': errors.OrderNotFound,
                    '-2014': errors.AuthenticationError,
                    '-2015': errors.AuthenticationError,
                    '-2016': errors.BadRequest,
                    '-2018': errors.InsufficientFunds,
                    '-2019': errors.InsufficientFunds,
                    '-2020': errors.OrderNotFillable,
                    '-2021': errors.OrderImmediatelyFillable,
                    '-2022': errors.InvalidOrder,
                    '-2023': errors.InsufficientFunds,
                    '-2024': errors.InsufficientFunds,
                    '-2025': errors.InvalidOrder,
                    '-2026': errors.InvalidOrder,
                    '-2027': errors.InvalidOrder,
                    '-2028': errors.InsufficientFunds,
                    '-3000': errors.ExchangeError,
                    '-3001': errors.AuthenticationError,
                    '-3002': errors.BadSymbol,
                    '-3003': errors.BadRequest,
                    '-3004': errors.ExchangeError,
                    '-3005': errors.InsufficientFunds,
                    '-3006': errors.InsufficientFunds,
                    '-3007': errors.ExchangeError,
                    '-3008': errors.InsufficientFunds,
                    '-3009': errors.BadRequest,
                    '-3010': errors.BadRequest,
                    '-3011': errors.BadRequest,
                    '-3012': errors.InsufficientFunds,
                    '-3013': errors.BadRequest,
                    '-3014': errors.AccountSuspended,
                    '-3015': errors.BadRequest,
                    '-3016': errors.BadRequest,
                    '-3017': errors.ExchangeError,
                    '-3018': errors.AccountSuspended,
                    '-3019': errors.AccountSuspended,
                    '-3020': errors.InsufficientFunds,
                    '-3021': errors.BadRequest,
                    '-3022': errors.AccountSuspended,
                    '-3023': errors.BadRequest,
                    '-3024': errors.ExchangeError,
                    '-3025': errors.BadRequest,
                    '-3026': errors.BadRequest,
                    '-3027': errors.BadSymbol,
                    '-3028': errors.BadSymbol,
                    '-3029': errors.ExchangeError,
                    '-3036': errors.AccountSuspended,
                    '-3037': errors.ExchangeError,
                    '-3038': errors.BadRequest,
                    '-3041': errors.InsufficientFunds,
                    '-3042': errors.BadRequest,
                    '-3043': errors.BadRequest,
                    '-3044': errors.DDoSProtection,
                    '-3045': errors.ExchangeError,
                    '-3999': errors.ExchangeError,
                    '-4001': errors.BadRequest,
                    '-4002': errors.BadRequest,
                    '-4003': errors.BadRequest,
                    '-4004': errors.AuthenticationError,
                    '-4005': errors.RateLimitExceeded,
                    '-4006': errors.BadRequest,
                    '-4007': errors.BadRequest,
                    '-4008': errors.BadRequest,
                    '-4010': errors.BadRequest,
                    '-4011': errors.BadRequest,
                    '-4012': errors.BadRequest,
                    '-4013': errors.AuthenticationError,
                    '-4014': errors.PermissionDenied,
                    '-4015': errors.ExchangeError,
                    '-4016': errors.PermissionDenied,
                    '-4017': errors.PermissionDenied,
                    '-4018': errors.BadSymbol,
                    '-4019': errors.BadSymbol,
                    '-4021': errors.BadRequest,
                    '-4022': errors.BadRequest,
                    '-4023': errors.ExchangeError,
                    '-4024': errors.InsufficientFunds,
                    '-4025': errors.InsufficientFunds,
                    '-4026': errors.InsufficientFunds,
                    '-4027': errors.ExchangeError,
                    '-4028': errors.BadRequest,
                    '-4029': errors.BadRequest,
                    '-4030': errors.ExchangeError,
                    '-4031': errors.ExchangeError,
                    '-4032': errors.ExchangeError,
                    '-4033': errors.BadRequest,
                    '-4034': errors.ExchangeError,
                    '-4035': errors.PermissionDenied,
                    '-4036': errors.BadRequest,
                    '-4037': errors.ExchangeError,
                    '-4038': errors.ExchangeError,
                    '-4039': errors.BadRequest,
                    '-4040': errors.BadRequest,
                    '-4041': errors.ExchangeError,
                    '-4042': errors.ExchangeError,
                    '-4043': errors.BadRequest,
                    '-4044': errors.BadRequest,
                    '-4045': errors.ExchangeError,
                    '-4046': errors.AuthenticationError,
                    '-4047': errors.BadRequest,
                    '-5001': errors.BadRequest,
                    '-5002': errors.InsufficientFunds,
                    '-5003': errors.InsufficientFunds,
                    '-5004': errors.BadRequest,
                    '-5005': errors.InsufficientFunds,
                    '-5006': errors.BadRequest,
                    '-5007': errors.BadRequest,
                    '-5008': errors.InsufficientFunds,
                    '-5009': errors.BadRequest,
                    '-5010': errors.ExchangeError,
                    '-5011': errors.BadRequest,
                    '-5012': errors.ExchangeError,
                    '-5013': errors.InsufficientFunds,
                    '-5021': errors.BadRequest,
                    '-6001': errors.BadRequest,
                    '-6003': errors.BadRequest,
                    '-6004': errors.ExchangeError,
                    '-6005': errors.InvalidOrder,
                    '-6006': errors.BadRequest,
                    '-6007': errors.BadRequest,
                    '-6008': errors.BadRequest,
                    '-6009': errors.RateLimitExceeded,
                    '-6011': errors.BadRequest,
                    '-6012': errors.InsufficientFunds,
                    '-6013': errors.ExchangeError,
                    '-6014': errors.BadRequest,
                    '-6015': errors.BadRequest,
                    '-6016': errors.BadRequest,
                    '-6017': errors.BadRequest,
                    '-6018': errors.BadRequest,
                    '-6019': errors.AuthenticationError,
                    '-6020': errors.BadRequest,
                    '-7001': errors.BadRequest,
                    '-7002': errors.BadRequest,
                    '-9000': errors.InsufficientFunds,
                    '-10017': errors.BadRequest,
                    '-11008': errors.InsufficientFunds,
                    '-12014': errors.RateLimitExceeded,
                    '-13000': errors.BadRequest,
                    '-13001': errors.BadRequest,
                    '-13002': errors.BadRequest,
                    '-13003': errors.BadRequest,
                    '-13004': errors.BadRequest,
                    '-13005': errors.BadRequest,
                    '-13006': errors.InvalidOrder,
                    '-13007': errors.AuthenticationError,
                    '-21001': errors.BadRequest,
                    '-21002': errors.BadRequest,
                    '-21003': errors.BadRequest,
                    '100001003': errors.AuthenticationError,
                    '200003903': errors.AuthenticationError, // {"code":200003903,"msg":"Your identity verification has been rejected. Please complete identity verification again."}
                },
                'broad': {
                    'has no operation privilege': errors.PermissionDenied,
                    'MAX_POSITION': errors.InvalidOrder, // {"code":-2010,"msg":"Filter failure: MAX_POSITION"}
                },
            },
        });
    }
    isInverse(type, subType = undefined) {
        if (subType === undefined) {
            return type === 'delivery';
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
    convertExpireDate(date) {
        // parse YYMMDD to timestamp
        const year = date.slice(0, 2);
        const month = date.slice(2, 4);
        const day = date.slice(4, 6);
        const reconstructedDate = '20' + year + '-' + month + '-' + day + 'T00:00:00Z';
        return reconstructedDate;
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
                // support legacy symbols
                const [base, quote] = symbol.split('/');
                const settle = (quote === 'USD') ? base : quote;
                const futuresSymbol = symbol + ':' + settle;
                if (futuresSymbol in this.markets) {
                    return this.markets[futuresSymbol];
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
    currencyToPrecision(code, fee, networkCode = undefined) {
        // info is available in currencies only if the user has configured his api keys
        if (this.safeValue(this.currencies[code], 'precision') !== undefined) {
            return this.decimalToPrecision(fee, number.TRUNCATE, this.currencies[code]['precision'], this.precisionMode, this.paddingMode);
        }
        else {
            return this.numberToString(fee);
        }
    }
    nonce() {
        return this.milliseconds() - this.options['timeDifference'];
    }
    async fetchTime(params = {}) {
        /**
         * @method
         * @name binance#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://binance-docs.github.io/apidocs/spot/en/#check-server-time       // spot
         * @see https://binance-docs.github.io/apidocs/futures/en/#check-server-time    // swap
         * @see https://binance-docs.github.io/apidocs/delivery/en/#check-server-time   // future
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const defaultType = this.safeString2(this.options, 'fetchTime', 'defaultType', 'spot');
        const type = this.safeString(params, 'type', defaultType);
        const query = this.omit(params, 'type');
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchTime', undefined, params);
        let method = 'publicGetTime';
        if (this.isLinear(type, subType)) {
            method = 'fapiPublicGetTime';
        }
        else if (this.isInverse(type, subType)) {
            method = 'dapiPublicGetTime';
        }
        const response = await this[method](query);
        return this.safeInteger(response, 'serverTime');
    }
    async fetchCurrencies(params = {}) {
        /**
         * @method
         * @name binance#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://binance-docs.github.io/apidocs/spot/en/#all-coins-39-information-user_data
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const fetchCurrenciesEnabled = this.safeValue(this.options, 'fetchCurrencies');
        if (!fetchCurrenciesEnabled) {
            return undefined;
        }
        // this endpoint requires authentication
        // while fetchCurrencies is a public API method by design
        // therefore we check the keys here
        // and fallback to generating the currencies from the markets
        if (!this.checkRequiredCredentials(false)) {
            return undefined;
        }
        // sandbox/testnet does not support sapi endpoints
        const apiBackup = this.safeString(this.urls, 'apiBackup');
        if (apiBackup !== undefined) {
            return undefined;
        }
        const response = await this.sapiGetCapitalConfigGetall(params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
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
            //                "withdrawFee": "0.002",
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
            const entry = response[i];
            const id = this.safeString(entry, 'coin');
            const name = this.safeString(entry, 'name');
            const code = this.safeCurrencyCode(id);
            let minPrecision = undefined;
            let isWithdrawEnabled = true;
            let isDepositEnabled = true;
            const networkList = this.safeValue(entry, 'networkList', []);
            const fees = {};
            let fee = undefined;
            for (let j = 0; j < networkList.length; j++) {
                const networkItem = networkList[j];
                const network = this.safeString(networkItem, 'network');
                // const name = this.safeString (networkItem, 'name');
                const withdrawFee = this.safeNumber(networkItem, 'withdrawFee');
                const depositEnable = this.safeValue(networkItem, 'depositEnable');
                const withdrawEnable = this.safeValue(networkItem, 'withdrawEnable');
                isDepositEnabled = isDepositEnabled || depositEnable;
                isWithdrawEnabled = isWithdrawEnabled || withdrawEnable;
                fees[network] = withdrawFee;
                const isDefault = this.safeValue(networkItem, 'isDefault');
                if (isDefault || (fee === undefined)) {
                    fee = withdrawFee;
                }
                const precisionTick = this.safeString(networkItem, 'withdrawIntegerMultiple');
                // avoid zero values, which are mostly from fiat or leveraged tokens : https://github.com/ccxt/ccxt/pull/14902#issuecomment-1271636731
                // so, when there is zero instead of i.e. 0.001, then we skip those cases, because we don't know the precision - it might be because of network is suspended or other reasons
                if (!Precise["default"].stringEq(precisionTick, '0')) {
                    minPrecision = (minPrecision === undefined) ? precisionTick : Precise["default"].stringMin(minPrecision, precisionTick);
                }
            }
            const trading = this.safeValue(entry, 'trading');
            const active = (isWithdrawEnabled && isDepositEnabled && trading);
            let maxDecimalPlaces = undefined;
            if (minPrecision !== undefined) {
                maxDecimalPlaces = parseInt(this.numberToString(this.precisionFromString(minPrecision)));
            }
            result[code] = {
                'id': id,
                'name': name,
                'code': code,
                'precision': maxDecimalPlaces,
                'info': entry,
                'active': active,
                'deposit': isDepositEnabled,
                'withdraw': isWithdrawEnabled,
                'networks': networkList,
                'fee': fee,
                'fees': fees,
                'limits': this.limits,
            };
        }
        return result;
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name binance#fetchMarkets
         * @description retrieves data on all markets for binance
         * @see https://binance-docs.github.io/apidocs/spot/en/#exchange-information         // spot
         * @see https://binance-docs.github.io/apidocs/futures/en/#exchange-information      // swap
         * @see https://binance-docs.github.io/apidocs/delivery/en/#exchange-information     // future
         * @see https://binance-docs.github.io/apidocs/voptions/en/#exchange-information     // option
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const promisesRaw = [];
        const rawFetchMarkets = this.safeValue(this.options, 'fetchMarkets', ['spot', 'linear', 'inverse']);
        const sandboxMode = this.safeValue(this.options, 'sandboxMode', false);
        const fetchMarkets = [];
        for (let i = 0; i < rawFetchMarkets.length; i++) {
            const type = rawFetchMarkets[i];
            if (type === 'option' && sandboxMode) {
                continue;
            }
            fetchMarkets.push(type);
        }
        for (let i = 0; i < fetchMarkets.length; i++) {
            const marketType = fetchMarkets[i];
            if (marketType === 'spot') {
                promisesRaw.push(this.publicGetExchangeInfo(params));
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
        const promises = await Promise.all(promisesRaw);
        const spotMarkets = this.safeValue(this.safeValue(promises, 0), 'symbols', []);
        const futureMarkets = this.safeValue(this.safeValue(promises, 1), 'symbols', []);
        const deliveryMarkets = this.safeValue(this.safeValue(promises, 2), 'symbols', []);
        const optionMarkets = this.safeValue(this.safeValue(promises, 3), 'optionSymbols', []);
        let markets = spotMarkets;
        markets = this.arrayConcat(markets, futureMarkets);
        markets = this.arrayConcat(markets, deliveryMarkets);
        markets = this.arrayConcat(markets, optionMarkets);
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
        const filters = this.safeValue(market, 'filters', []);
        const filtersByType = this.indexBy(filters, 'filterType');
        const status = this.safeString2(market, 'status', 'contractStatus');
        let contractSize = undefined;
        let fees = this.fees;
        let linear = undefined;
        let inverse = undefined;
        const strike = this.safeInteger(market, 'strikePrice');
        let symbol = base + '/' + quote;
        if (contract) {
            if (swap) {
                symbol = symbol + ':' + settle;
            }
            else if (future) {
                symbol = symbol + ':' + settle + '-' + this.yymmdd(expiry);
            }
            else if (option) {
                symbol = symbol + ':' + settle + '-' + this.yymmdd(expiry) + '-' + this.numberToString(strike) + '-' + this.safeString(optionParts, 3);
            }
            contractSize = this.safeNumber2(market, 'contractSize', 'unit', this.parseNumber('1'));
            linear = settle === quote;
            inverse = settle === base;
            const feesType = linear ? 'linear' : 'inverse';
            fees = this.safeValue(this.fees, feesType, {});
        }
        let active = (status === 'TRADING');
        if (spot) {
            const permissions = this.safeValue(market, 'permissions', []);
            for (let j = 0; j < permissions.length; j++) {
                if (permissions[j] === 'TRD_GRP_003') {
                    active = false;
                    break;
                }
            }
        }
        const isMarginTradingAllowed = this.safeValue(market, 'isMarginTradingAllowed', false);
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
            'strike': strike,
            'optionType': this.safeStringLower(market, 'side'),
            'precision': {
                'amount': this.safeInteger2(market, 'quantityPrecision', 'quantityScale'),
                'price': this.safeInteger2(market, 'pricePrecision', 'priceScale'),
                'base': this.safeInteger(market, 'baseAssetPrecision'),
                'quote': this.safeInteger(market, 'quotePrecision'),
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
        };
        if ('PRICE_FILTER' in filtersByType) {
            const filter = this.safeValue(filtersByType, 'PRICE_FILTER', {});
            // PRICE_FILTER reports zero values for maxPrice
            // since they updated filter types in November 2018
            // https://github.com/ccxt/ccxt/issues/4286
            // therefore limits['price']['max'] doesn't have any meaningful value except undefined
            entry['limits']['price'] = {
                'min': this.safeNumber(filter, 'minPrice'),
                'max': this.safeNumber(filter, 'maxPrice'),
            };
            entry['precision']['price'] = this.precisionFromString(filter['tickSize']);
        }
        if ('LOT_SIZE' in filtersByType) {
            const filter = this.safeValue(filtersByType, 'LOT_SIZE', {});
            const stepSize = this.safeString(filter, 'stepSize');
            entry['precision']['amount'] = this.precisionFromString(stepSize);
            entry['limits']['amount'] = {
                'min': this.safeNumber(filter, 'minQty'),
                'max': this.safeNumber(filter, 'maxQty'),
            };
        }
        if ('MARKET_LOT_SIZE' in filtersByType) {
            const filter = this.safeValue(filtersByType, 'MARKET_LOT_SIZE', {});
            entry['limits']['market'] = {
                'min': this.safeNumber(filter, 'minQty'),
                'max': this.safeNumber(filter, 'maxQty'),
            };
        }
        if (('MIN_NOTIONAL' in filtersByType) || ('NOTIONAL' in filtersByType)) { // notional added in 12/04/23 to spot testnet
            const filter = this.safeValue2(filtersByType, 'MIN_NOTIONAL', 'NOTIONAL', {});
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
    parseBalance(response, type = undefined, marginMode = undefined) {
        const result = {
            'info': response,
        };
        let timestamp = undefined;
        const isolated = marginMode === 'isolated';
        const cross = (type === 'margin') || (marginMode === 'cross');
        if (!isolated && ((type === 'spot') || cross)) {
            timestamp = this.safeInteger(response, 'updateTime');
            const balances = this.safeValue2(response, 'balances', 'userAssets', []);
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
            const assets = this.safeValue(response, 'assets');
            for (let i = 0; i < assets.length; i++) {
                const asset = assets[i];
                const marketId = this.safeValue(asset, 'symbol');
                const symbol = this.safeSymbol(marketId, undefined, undefined, 'spot');
                const base = this.safeValue(asset, 'baseAsset', {});
                const quote = this.safeValue(asset, 'quoteAsset', {});
                const baseCode = this.safeCurrencyCode(this.safeString(base, 'asset'));
                const quoteCode = this.safeCurrencyCode(this.safeString(quote, 'asset'));
                const subResult = {};
                subResult[baseCode] = this.parseBalanceHelper(base);
                subResult[quoteCode] = this.parseBalanceHelper(quote);
                result[symbol] = this.safeBalance(subResult);
            }
        }
        else if (type === 'savings') {
            const positionAmountVos = this.safeValue(response, 'positionAmountVos', []);
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
                balances = this.safeValue(response, 'assets', []);
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
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name binance#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://binance-docs.github.io/apidocs/spot/en/#account-information-user_data                  // spot
         * @see https://binance-docs.github.io/apidocs/spot/en/#query-cross-margin-account-details-user_data   // cross margin
         * @see https://binance-docs.github.io/apidocs/spot/en/#query-isolated-margin-account-info-user_data   // isolated margin
         * @see https://binance-docs.github.io/apidocs/spot/en/#lending-account-user_data                      // lending
         * @see https://binance-docs.github.io/apidocs/spot/en/#funding-wallet-user_data                       // funding
         * @see https://binance-docs.github.io/apidocs/futures/en/#account-information-v2-user_data            // swap
         * @see https://binance-docs.github.io/apidocs/delivery/en/#account-information-user_data              // future
         * @see https://binance-docs.github.io/apidocs/voptions/en/#option-account-information-trade           // option
         * @param {object} params extra parameters specific to the binance api endpoint
         * @param {string|undefined} params.type 'future', 'delivery', 'savings', 'funding', or 'spot'
         * @param {string|undefined} params.marginMode 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null
         * @param {[string]|undefined} params.symbols unified market symbols, only used in isolated margin mode
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets();
        const defaultType = this.safeString2(this.options, 'fetchBalance', 'defaultType', 'spot');
        let type = this.safeString(params, 'type', defaultType);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchBalance', undefined, params);
        const [marginMode, query] = this.handleMarginModeAndParams('fetchBalance', params);
        let method = 'privateGetAccount';
        const request = {};
        if (this.isLinear(type, subType)) {
            const options = this.safeValue(this.options, type, {});
            const fetchBalanceOptions = this.safeValue(options, 'fetchBalance', {});
            method = this.safeString(fetchBalanceOptions, 'method', 'fapiPrivateV2GetAccount');
            type = 'linear';
        }
        else if (this.isInverse(type, subType)) {
            const options = this.safeValue(this.options, type, {});
            const fetchBalanceOptions = this.safeValue(options, 'fetchBalance', {});
            method = this.safeString(fetchBalanceOptions, 'method', 'dapiPrivateGetAccount');
            type = 'inverse';
        }
        else if (marginMode === 'isolated') {
            method = 'sapiGetMarginIsolatedAccount';
            const paramSymbols = this.safeValue(params, 'symbols');
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
        }
        else if ((type === 'margin') || (marginMode === 'cross')) {
            method = 'sapiGetMarginAccount';
        }
        else if (type === 'savings') {
            method = 'sapiGetLendingUnionAccount';
        }
        else if (type === 'funding') {
            method = 'sapiPostAssetGetFundingAsset';
        }
        const requestParams = this.omit(query, ['type', 'symbols']);
        const response = await this[method](this.extend(request, requestParams));
        //
        // spot
        //
        //     {
        //         makerCommission: 10,
        //         takerCommission: 10,
        //         buyerCommission: 0,
        //         sellerCommission: 0,
        //         canTrade: true,
        //         canWithdraw: true,
        //         canDeposit: true,
        //         updateTime: 1575357359602,
        //         accountType: "MARGIN",
        //         balances: [
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
        //        info: {
        //            assets: [
        //                {
        //                    baseAsset: {
        //                        asset: '1INCH',
        //                        borrowEnabled: true,
        //                        borrowed: '0',
        //                        free: '0',
        //                        interest: '0',
        //                        locked: '0',
        //                        netAsset: '0',
        //                        netAssetOfBtc: '0',
        //                        repayEnabled: true,
        //                        totalAsset: '0'
        //                    },
        //                    quoteAsset: {
        //                        asset: 'USDT',
        //                        borrowEnabled: true,
        //                        borrowed: '0',
        //                        free: '11',
        //                        interest: '0',
        //                        locked: '0',
        //                        netAsset: '11',
        //                        netAssetOfBtc: '0.00054615',
        //                        repayEnabled: true,
        //                        totalAsset: '11'
        //                    },
        //                    symbol: '1INCHUSDT',
        //                    isolatedCreated: true,
        //                    marginLevel: '999',
        //                    marginLevelStatus: 'EXCESSIVE',
        //                    marginRatio: '5',
        //                    indexPrice: '0.59184331',
        //                    liquidatePrice: '0',
        //                    liquidateRate: '0',
        //                    tradeEnabled: true,
        //                    enabled: true
        //                },
        //            ]
        //        }
        //    }
        //
        // futures (fapi)
        //
        //     fapiPrivateGetAccount
        //
        //     {
        //         "feeTier":0,
        //         "canTrade":true,
        //         "canDeposit":true,
        //         "canWithdraw":true,
        //         "updateTime":0,
        //         "totalInitialMargin":"0.00000000",
        //         "totalMaintMargin":"0.00000000",
        //         "totalWalletBalance":"4.54000000",
        //         "totalUnrealizedProfit":"0.00000000",
        //         "totalMarginBalance":"4.54000000",
        //         "totalPositionInitialMargin":"0.00000000",
        //         "totalOpenOrderInitialMargin":"0.00000000",
        //         "maxWithdrawAmount":"4.54000000",
        //         "assets":[
        //             {
        //                 "asset":"USDT",
        //                 "walletBalance":"4.54000000",
        //                 "unrealizedProfit":"0.00000000",
        //                 "marginBalance":"4.54000000",
        //                 "maintMargin":"0.00000000",
        //                 "initialMargin":"0.00000000",
        //                 "positionInitialMargin":"0.00000000",
        //                 "openOrderInitialMargin":"0.00000000",
        //                 "maxWithdrawAmount":"4.54000000"
        //             }
        //         ],
        //         "positions":[
        //             {
        //                 "symbol":"BTCUSDT",
        //                 "initialMargin":"0.00000",
        //                 "maintMargin":"0.00000",
        //                 "unrealizedProfit":"0.00000000",
        //                 "positionInitialMargin":"0.00000",
        //                 "openOrderInitialMargin":"0.00000"
        //             }
        //         ]
        //     }
        //
        //     fapiPrivateV2GetAccount
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
        //                 "leverage":"20",
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
        // savings
        //
        //     {
        //       "totalAmountInBTC": "0.3172",
        //       "totalAmountInUSDT": "10000",
        //       "totalFixedAmountInBTC": "0.3172",
        //       "totalFixedAmountInUSDT": "10000",
        //       "totalFlexibleInBTC": "0",
        //       "totalFlexibleInUSDT": "0",
        //       "positionAmountVos": [
        //         {
        //           "asset": "USDT",
        //           "amount": "10000",
        //           "amountInBTC": "0.3172",
        //           "amountInUSDT": "10000"
        //         },
        //         {
        //           "asset": "BUSD",
        //           "amount": "0",
        //           "amountInBTC": "0",
        //           "amountInUSDT": "0"
        //         }
        //       ]
        //     }
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
        return this.parseBalance(response, type, marginMode);
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://binance-docs.github.io/apidocs/spot/en/#order-book      // spot
         * @see https://binance-docs.github.io/apidocs/futures/en/#order-book   // swap
         * @see https://binance-docs.github.io/apidocs/delivery/en/#order-book  // future
         * @see https://binance-docs.github.io/apidocs/voptions/en/#order-book  // option
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 5000, see https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#order-book
        }
        let method = 'publicGetDepth';
        if (market['option']) {
            method = 'eapiPublicGetDepth';
        }
        else if (market['linear']) {
            method = 'fapiPublicGetDepth';
        }
        else if (market['inverse']) {
            method = 'dapiPublicGetDepth';
        }
        const response = await this[method](this.extend(request, params));
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
        //
        //     {
        //         symbol: 'ETHBTC',
        //         priceChange: '0.00068700',
        //         priceChangePercent: '2.075',
        //         weightedAvgPrice: '0.03342681',
        //         prevClosePrice: '0.03310300',
        //         lastPrice: '0.03378900',
        //         lastQty: '0.07700000',
        //         bidPrice: '0.03378900',
        //         bidQty: '7.16800000',
        //         askPrice: '0.03379000',
        //         askQty: '24.00000000',
        //         openPrice: '0.03310200',
        //         highPrice: '0.03388900',
        //         lowPrice: '0.03306900',
        //         volume: '205478.41000000',
        //         quoteVolume: '6868.48826294',
        //         openTime: 1601469986932,
        //         closeTime: 1601556386932,
        //         firstId: 196098772,
        //         lastId: 196186315,
        //         count: 87544
        //     }
        //
        // coinm
        //
        //     {
        //         baseVolume: '214549.95171161',
        //         closeTime: '1621965286847',
        //         count: '1283779',
        //         firstId: '152560106',
        //         highPrice: '39938.3',
        //         lastId: '153843955',
        //         lastPrice: '37993.4',
        //         lastQty: '1',
        //         lowPrice: '36457.2',
        //         openPrice: '37783.4',
        //         openTime: '1621878840000',
        //         pair: 'BTCUSD',
        //         priceChange: '210.0',
        //         priceChangePercent: '0.556',
        //         symbol: 'BTCUSD_PERP',
        //         volume: '81990451',
        //         weightedAvgPrice: '38215.08713747'
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
        const timestamp = this.safeInteger(ticker, 'closeTime');
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
        const isCoinm = ('baseVolume' in ticker);
        let baseVolume = undefined;
        let quoteVolume = undefined;
        if (isCoinm) {
            baseVolume = this.safeString(ticker, 'baseVolume');
            quoteVolume = this.safeString(ticker, 'volume');
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
            'vwap': this.safeString(ticker, 'weightedAvgPrice'),
            'open': this.safeString2(ticker, 'openPrice', 'open'),
            'close': last,
            'last': last,
            'previousClose': this.safeString(ticker, 'prevClosePrice'),
            'change': this.safeString(ticker, 'priceChange'),
            'percentage': this.safeString(ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    async fetchStatus(params = {}) {
        /**
         * @method
         * @name binance#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @see https://binance-docs.github.io/apidocs/spot/en/#system-status-system
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
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
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name binance#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://binance-docs.github.io/apidocs/spot/en/#24hr-ticker-price-change-statistics         // spot
         * @see https://binance-docs.github.io/apidocs/futures/en/#24hr-ticker-price-change-statistics      // swap
         * @see https://binance-docs.github.io/apidocs/delivery/en/#24hr-ticker-price-change-statistics     // future
         * @see https://binance-docs.github.io/apidocs/voptions/en/#24hr-ticker-price-change-statistics     // option
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = 'publicGetTicker24hr';
        if (market['option']) {
            method = 'eapiPublicGetTicker';
        }
        else if (market['linear']) {
            method = 'fapiPublicGetTicker24hr';
        }
        else if (market['inverse']) {
            method = 'dapiPublicGetTicker24hr';
        }
        const response = await this[method](this.extend(request, params));
        if (Array.isArray(response)) {
            const firstTicker = this.safeValue(response, 0, {});
            return this.parseTicker(firstTicker, market);
        }
        return this.parseTicker(response, market);
    }
    async fetchBidsAsks(symbols = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchBidsAsks
         * @description fetches the bid and ask price and volume for multiple markets
         * @see https://binance-docs.github.io/apidocs/spot/en/#symbol-order-book-ticker        // spot
         * @see https://binance-docs.github.io/apidocs/futures/en/#symbol-order-book-ticker     // swap
         * @see https://binance-docs.github.io/apidocs/delivery/en/#symbol-order-book-ticker    // future
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        let market = undefined;
        if (symbols !== undefined) {
            const first = this.safeString(symbols, 0);
            market = this.market(first);
        }
        let type = undefined;
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchBidsAsks', market, params);
        [type, params] = this.handleMarketTypeAndParams('fetchBidsAsks', market, params);
        let method = undefined;
        if (this.isLinear(type, subType)) {
            method = 'fapiPublicGetTickerBookTicker';
        }
        else if (this.isInverse(type, subType)) {
            method = 'dapiPublicGetTickerBookTicker';
        }
        else {
            method = 'publicGetTickerBookTicker';
        }
        const response = await this[method](params);
        return this.parseTickers(response, symbols);
    }
    async fetchLastPrices(symbols = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchLastPrices
         * @description fetches the last price for multiple markets
         * @see https://binance-docs.github.io/apidocs/spot/en/#symbol-price-ticker         // spot
         * @see https://binance-docs.github.io/apidocs/future/en/#symbol-price-ticker       // swap
         * @see https://binance-docs.github.io/apidocs/delivery/en/#symbol-price-ticker     // future
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the last prices
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.getMarketFromSymbols(symbols);
        const [marketType, query] = this.handleMarketTypeAndParams('fetchLastPrices', market, params);
        let method = undefined;
        if (marketType === 'future') {
            method = 'fapiPublicGetTickerPrice';
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
        else if (marketType === 'delivery') {
            method = 'dapiPublicGetTickerPrice';
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
        else if (marketType === 'spot') {
            method = 'publicGetTickerPrice';
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
            throw new errors.NotSupported(this.id + ' fetchLastPrices() does not support ' + marketType + ' markets yet');
        }
        const response = await this[method](query);
        return this.parseLastPrices(response, symbols);
    }
    parseLastPrice(info, market = undefined) {
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
        const marketId = this.safeString(info, 'symbol');
        const defaultType = this.safeString(this.options, 'defaultType', 'spot');
        market = this.safeMarket(marketId, market, undefined, defaultType);
        const timestamp = this.safeInteger(info, 'time');
        const price = this.safeNumber(info, 'price');
        return {
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'price': price,
            'side': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': info,
        };
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://binance-docs.github.io/apidocs/spot/en/#24hr-ticker-price-change-statistics         // spot
         * @see https://binance-docs.github.io/apidocs/futures/en/#24hr-ticker-price-change-statistics      // swap
         * @see https://binance-docs.github.io/apidocs/delivery/en/#24hr-ticker-price-change-statistics     // future
         * @see https://binance-docs.github.io/apidocs/voptions/en/#24hr-ticker-price-change-statistics     // option
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        let type = undefined;
        let market = undefined;
        if (symbols !== undefined) {
            const first = this.safeString(symbols, 0);
            market = this.market(first);
        }
        [type, params] = this.handleMarketTypeAndParams('fetchTickers', market, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchTickers', market, params);
        const query = this.omit(params, 'type');
        let defaultMethod = undefined;
        if (type === 'option') {
            defaultMethod = 'eapiPublicGetTicker';
        }
        else if (this.isLinear(type, subType)) {
            defaultMethod = 'fapiPublicGetTicker24hr';
        }
        else if (this.isInverse(type, subType)) {
            defaultMethod = 'dapiPublicGetTicker24hr';
        }
        else {
            defaultMethod = 'publicGetTicker24hr';
        }
        const method = this.safeString(this.options, 'fetchTickersMethod', defaultMethod);
        const response = await this[method](query);
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
        const volumeIndex = (market['inverse']) ? 7 : 5;
        return [
            this.safeInteger2(ohlcv, 0, 'closeTime'),
            this.safeNumber2(ohlcv, 1, 'open'),
            this.safeNumber2(ohlcv, 2, 'high'),
            this.safeNumber2(ohlcv, 3, 'low'),
            this.safeNumber2(ohlcv, 4, 'close'),
            this.safeNumber2(ohlcv, volumeIndex, 'volume'),
        ];
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the binance api endpoint
         * @param {string|undefined} params.price "mark" or "index" for mark price and index price candles
         * @param {int|undefined} params.until timestamp in ms of the latest candle to fetch
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        // binance docs say that the default limit 500, max 1500 for futures, max 1000 for spot markets
        // the reality is that the time range wider than 500 candles won't work right
        const defaultLimit = 500;
        const maxLimit = 1500;
        const price = this.safeString(params, 'price');
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, ['price', 'until']);
        limit = (limit === undefined) ? defaultLimit : Math.min(limit, maxLimit);
        const request = {
            'interval': this.safeString(this.timeframes, timeframe, timeframe),
            'limit': limit,
        };
        if (price === 'index') {
            request['pair'] = market['id']; // Index price takes this argument instead of symbol
        }
        else {
            request['symbol'] = market['id'];
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
        let method = 'publicGetKlines';
        if (market['option']) {
            method = 'eapiPublicGetKlines';
        }
        else if (price === 'mark') {
            if (market['inverse']) {
                method = 'dapiPublicGetMarkPriceKlines';
            }
            else {
                method = 'fapiPublicGetMarkPriceKlines';
            }
        }
        else if (price === 'index') {
            if (market['inverse']) {
                method = 'dapiPublicGetIndexPriceKlines';
            }
            else {
                method = 'fapiPublicGetIndexPriceKlines';
            }
        }
        else if (market['linear']) {
            method = 'fapiPublicGetKlines';
        }
        else if (market['inverse']) {
            method = 'dapiPublicGetKlines';
        }
        const response = await this[method](this.extend(request, params));
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
        return this.parseOHLCVs(response, market, timeframe, since, limit);
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
        // https://binance-docs.github.io/apidocs/futures/en/#account-trade-list-user_data
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
        const timestamp = this.safeInteger2(trade, 'T', 'time');
        const price = this.safeString2(trade, 'p', 'price');
        let amount = this.safeString2(trade, 'q', 'qty');
        amount = this.safeString(trade, 'quantity', amount);
        const cost = this.safeString2(trade, 'quoteQty', 'baseQty'); // inverse futures
        const marketId = this.safeString(trade, 'symbol');
        const isSpotTrade = ('isIsolated' in trade) || ('M' in trade) || ('orderListId' in trade);
        const marketType = isSpotTrade ? 'spot' : 'contract';
        market = this.safeMarket(marketId, market, undefined, marketType);
        const symbol = market['symbol'];
        let id = this.safeString2(trade, 't', 'a');
        id = this.safeString2(trade, 'tradeId', 'id', id);
        let side = undefined;
        const orderId = this.safeString(trade, 'orderId');
        const buyerMaker = this.safeValue2(trade, 'm', 'isBuyerMaker');
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
            'id': id,
            'order': orderId,
            'type': this.safeStringLower(trade, 'type'),
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, market);
    }
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * Default fetchTradesMethod
         * @see https://binance-docs.github.io/apidocs/spot/en/#compressed-aggregate-trades-list        // publicGetAggTrades (spot)
         * @see https://binance-docs.github.io/apidocs/futures/en/#compressed-aggregate-trades-list     // fapiPublicGetAggTrades (swap)
         * @see https://binance-docs.github.io/apidocs/delivery/en/#compressed-aggregate-trades-list    // dapiPublicGetAggTrades (future)
         * @see https://binance-docs.github.io/apidocs/voptions/en/#recent-trades-list                  // eapiPublicGetTrades (option)
         * Other fetchTradesMethod
         * @see https://binance-docs.github.io/apidocs/spot/en/#recent-trades-list                      // publicGetTrades (spot)
         * @see https://binance-docs.github.io/apidocs/futures/en/#recent-trades-list                   // fapiPublicGetTrades (swap)
         * @see https://binance-docs.github.io/apidocs/delivery/en/#recent-trades-list                  // dapiPublicGetTrades (future)
         * @see https://binance-docs.github.io/apidocs/spot/en/#old-trade-lookup-market_data            // publicGetHistoricalTrades (spot)
         * @see https://binance-docs.github.io/apidocs/future/en/#old-trade-lookup-market_data          // fapiPublicGetHistoricalTrades (swap)
         * @see https://binance-docs.github.io/apidocs/delivery/en/#old-trade-lookup-market_data        // dapiPublicGetHistoricalTrades (future)
         * @see https://binance-docs.github.io/apidocs/voptions/en/#old-trade-lookup-market_data        // eapiPublicGetHistoricalTrades (option)
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since only used when fetchTradesMethod is 'publicGetAggTrades', 'fapiPublicGetAggTrades', or 'dapiPublicGetAggTrades'
         * @param {int|undefined} limit default 500, max 1000
         * @param {object} params extra parameters specific to the binance api endpoint
         * @param {int|undefined} params.until only used when fetchTradesMethod is 'publicGetAggTrades', 'fapiPublicGetAggTrades', or 'dapiPublicGetAggTrades'
         * @param {int|undefined} params.fetchTradesMethod 'publicGetAggTrades' (spot default), 'fapiPublicGetAggTrades' (swap default), 'dapiPublicGetAggTrades' (future default), 'eapiPublicGetTrades' (option default), 'publicGetTrades', 'fapiPublicGetTrades', 'dapiPublicGetTrades', 'publicGetHistoricalTrades', 'fapiPublicGetHistoricalTrades', 'dapiPublicGetHistoricalTrades', 'eapiPublicGetHistoricalTrades'
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {int|undefined} params.fromId trade id to fetch from, default gets most recent trades, not used when fetchTradesMethod is 'publicGetTrades', 'fapiPublicGetTrades', 'dapiPublicGetTrades', or 'eapiPublicGetTrades'
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            // 'fromId': 123,    // ID to get aggregate trades from INCLUSIVE.
            // 'startTime': 456, // Timestamp in ms to get aggregate trades from INCLUSIVE.
            // 'endTime': 789,   // Timestamp in ms to get aggregate trades until INCLUSIVE.
            // 'limit': 500,     // default = 500, maximum = 1000
        };
        let method = this.safeString(this.options, 'fetchTradesMethod');
        method = this.safeString2(params, 'fetchTradesMethod', 'method', method);
        if (method === undefined) {
            if (market['option']) {
                method = 'eapiPublicGetTrades';
            }
            else if (market['linear']) {
                method = 'fapiPublicGetAggTrades';
            }
            else if (market['inverse']) {
                method = 'dapiPublicGetAggTrades';
            }
            else {
                method = 'publicGetAggTrades';
            }
        }
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
        if (limit !== undefined) {
            request['limit'] = limit; // default = 500, maximum = 1000
        }
        params = this.omit(params, ['until', 'fetchTradesMethod']);
        //
        // Caveats:
        // - default limit (500) applies only if no other parameters set, trades up
        //   to the maximum limit may be returned to satisfy other parameters
        // - if both limit and time window is set and time window contains more
        //   trades than the limit then the last trades from the window are returned
        // - 'tradeId' accepted and returned by this method is "aggregate" trade id
        //   which is different from actual trade id
        // - setting both fromId and time window results in error
        const response = await this[method](this.extend(request, params));
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
    async editSpotOrder(id, symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name binance#editSpotOrder
         * @description edit a trade order
         * @see https://binance-docs.github.io/apidocs/spot/en/#cancel-an-existing-order-and-send-a-new-order-trade
         * @param {string} id cancel order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the base currency, ignored in market orders
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' editSpotOrder() does not support ' + market['type'] + ' orders');
        }
        const request = {
            'symbol': market['id'],
            'side': side.toUpperCase(),
        };
        const clientOrderId = this.safeStringN(params, ['newClientOrderId', 'clientOrderId', 'origClientOrderId']);
        let response = undefined;
        if (market['spot']) {
            const initialUppercaseType = type.toUpperCase();
            let uppercaseType = initialUppercaseType;
            const postOnly = this.isPostOnly(initialUppercaseType === 'MARKET', initialUppercaseType === 'LIMIT_MAKER', params);
            if (postOnly) {
                uppercaseType = 'LIMIT_MAKER';
            }
            request['type'] = uppercaseType;
            const stopPrice = this.safeNumber(params, 'stopPrice');
            if (stopPrice !== undefined) {
                if (uppercaseType === 'MARKET') {
                    uppercaseType = 'STOP_LOSS';
                }
                else if (uppercaseType === 'LIMIT') {
                    uppercaseType = 'STOP_LOSS_LIMIT';
                }
            }
            const validOrderTypes = this.safeValue(market['info'], 'orderTypes');
            if (!this.inArray(uppercaseType, validOrderTypes)) {
                if (initialUppercaseType !== uppercaseType) {
                    throw new errors.InvalidOrder(this.id + ' stopPrice parameter is not allowed for ' + symbol + ' ' + type + ' orders');
                }
                else {
                    throw new errors.InvalidOrder(this.id + ' ' + type + ' is not a valid order type for the ' + symbol + ' market');
                }
            }
            if (clientOrderId === undefined) {
                const broker = this.safeValue(this.options, 'broker');
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
            let stopPriceIsRequired = false;
            let quantityIsRequired = false;
            if (uppercaseType === 'MARKET') {
                const quoteOrderQty = this.safeValue(this.options, 'quoteOrderQty', true);
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
                stopPriceIsRequired = true;
                quantityIsRequired = true;
            }
            else if ((uppercaseType === 'STOP_LOSS_LIMIT') || (uppercaseType === 'TAKE_PROFIT_LIMIT')) {
                quantityIsRequired = true;
                stopPriceIsRequired = true;
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
            if (timeInForceIsRequired) {
                request['timeInForce'] = this.options['defaultTimeInForce']; // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
            }
            if (stopPriceIsRequired) {
                if (stopPrice === undefined) {
                    throw new errors.InvalidOrder(this.id + ' editOrder() requires a stopPrice extra param for a ' + type + ' order');
                }
                else {
                    request['stopPrice'] = this.priceToPrecision(symbol, stopPrice);
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
            response = await this.privatePostOrderCancelReplace(this.extend(request, params));
        }
        else {
            request['orderId'] = id;
            request['quantity'] = this.amountToPrecision(symbol, amount);
            if (price !== undefined) {
                request['price'] = this.priceToPrecision(symbol, price);
            }
            if (clientOrderId !== undefined) {
                request['origClientOrderId'] = clientOrderId;
            }
            params = this.omit(params, ['clientOrderId', 'newClientOrderId']);
            if (market['linear']) {
                response = await this.fapiPrivatePutOrder(this.extend(request, params));
            }
            else if (market['inverse']) {
                response = await this.dapiPrivatePutOrder(this.extend(request, params));
            }
        }
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
        //             "clientOrderId": "x-R4BD3S8222ecb58eb9074fb1be018c",
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
        const data = this.safeValue(response, 'newOrderResponse');
        return this.parseOrder(data, market);
    }
    async editContractOrder(id, symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name binance#editOrder
         * @description edit a trade order
         * @see https://binance-docs.github.io/apidocs/futures/en/#modify-order-trade
         * @see https://binance-docs.github.io/apidocs/delivery/en/#modify-order-trade
         * @param {string} id cancel order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the base currency, ignored in market orders
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['contract']) {
            throw new errors.NotSupported(this.id + ' editContractOrder() does not support ' + market['type'] + ' orders');
        }
        const request = {
            'symbol': market['id'],
            'side': side.toUpperCase(),
        };
        const clientOrderId = this.safeStringN(params, ['newClientOrderId', 'clientOrderId', 'origClientOrderId']);
        request['orderId'] = id;
        request['quantity'] = this.amountToPrecision(symbol, amount);
        if (price !== undefined) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        if (clientOrderId !== undefined) {
            request['origClientOrderId'] = clientOrderId;
        }
        params = this.omit(params, ['clientOrderId', 'newClientOrderId']);
        let response = undefined;
        if (market['linear']) {
            response = await this.fapiPrivatePutOrder(this.extend(request, params));
        }
        else if (market['inverse']) {
            response = await this.dapiPrivatePutOrder(this.extend(request, params));
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
    async editOrder(id, symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name binance#editOrder
         * @description edit a trade order
         * @see https://binance-docs.github.io/apidocs/spot/en/#cancel-an-existing-order-and-send-a-new-order-trade
         * @see https://binance-docs.github.io/apidocs/futures/en/#modify-order-trade
         * @see https://binance-docs.github.io/apidocs/delivery/en/#modify-order-trade
         * @param {string} id cancel order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the base currency, ignored in market orders
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
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
        //         "clientOrderId": "x-R4BD3S8222ecb58eb9074fb1be018c",
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
        //       "clientOrderId": "x-R4BD3S825e669e75b6c14f69a2c43e",
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
        const status = this.parseOrderStatus(this.safeString(order, 'status'));
        const marketId = this.safeString(order, 'symbol');
        const marketType = ('closePosition' in order) ? 'contract' : 'spot';
        const symbol = this.safeSymbol(marketId, market, undefined, marketType);
        const filled = this.safeString(order, 'executedQty', '0');
        let timestamp = undefined;
        let lastTradeTimestamp = undefined;
        if ('time' in order) {
            timestamp = this.safeInteger(order, 'time');
        }
        else if ('workingTime' in order) {
            lastTradeTimestamp = this.safeInteger(order, 'transactTime');
            timestamp = this.safeInteger(order, 'workingTime');
        }
        else if ('transactTime' in order) {
            lastTradeTimestamp = this.safeInteger(order, 'transactTime');
            timestamp = this.safeInteger(order, 'transactTime');
        }
        else if ('createTime' in order) {
            lastTradeTimestamp = this.safeInteger(order, 'updateTime');
            timestamp = this.safeInteger(order, 'createTime');
        }
        else if ('updateTime' in order) {
            if (status === 'open') {
                if (Precise["default"].stringGt(filled, '0')) {
                    lastTradeTimestamp = this.safeInteger(order, 'updateTime');
                }
                else {
                    timestamp = this.safeInteger(order, 'updateTime');
                }
            }
        }
        const average = this.safeString(order, 'avgPrice');
        const price = this.safeString(order, 'price');
        const amount = this.safeString2(order, 'origQty', 'quantity');
        // - Spot/Margin market: cummulativeQuoteQty
        // - Futures market: cumQuote.
        //   Note this is not the actual cost, since Binance futures uses leverage to calculate margins.
        let cost = this.safeString2(order, 'cummulativeQuoteQty', 'cumQuote');
        cost = this.safeString(order, 'cumBase', cost);
        const id = this.safeString(order, 'orderId');
        let type = this.safeStringLower(order, 'type');
        const side = this.safeStringLower(order, 'side');
        const fills = this.safeValue(order, 'fills', []);
        const clientOrderId = this.safeString(order, 'clientOrderId');
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
        const stopPrice = this.parseNumber(this.omitZero(stopPriceString));
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': this.safeValue(order, 'reduceOnly'),
            'side': side,
            'price': price,
            'triggerPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': {
                'currency': this.safeString(order, 'quoteAsset'),
                'cost': this.safeNumber(order, 'fee'),
                'rate': undefined,
            },
            'trades': fills,
        }, market);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name binance#createOrder
         * @description create a trade order
         * @see https://binance-docs.github.io/apidocs/spot/en/#new-order-trade
         * @see https://binance-docs.github.io/apidocs/spot/en/#test-new-order-trade
         * @see https://binance-docs.github.io/apidocs/futures/en/#new-order-trade
         * @see https://binance-docs.github.io/apidocs/delivery/en/#new-order-trade
         * @see https://binance-docs.github.io/apidocs/voptions/en/#new-order-trade
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit' or 'STOP_LOSS' or 'STOP_LOSS_LIMIT' or 'TAKE_PROFIT' or 'TAKE_PROFIT_LIMIT' or 'STOP'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the binance api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated', for spot margin trading
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const marketType = this.safeString(params, 'type', market['type']);
        const clientOrderId = this.safeString2(params, 'newClientOrderId', 'clientOrderId');
        const initialUppercaseType = type.toUpperCase();
        const isMarketOrder = initialUppercaseType === 'MARKET';
        const isLimitOrder = initialUppercaseType === 'LIMIT';
        const postOnly = this.isPostOnly(isMarketOrder, initialUppercaseType === 'LIMIT_MAKER', params);
        const triggerPrice = this.safeValue2(params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeValue(params, 'stopLossPrice', triggerPrice); // fallback to stopLoss
        const takeProfitPrice = this.safeValue(params, 'takeProfitPrice');
        const trailingDelta = this.safeValue(params, 'trailingDelta');
        const isStopLoss = stopLossPrice !== undefined || trailingDelta !== undefined;
        const isTakeProfit = takeProfitPrice !== undefined;
        params = this.omit(params, ['type', 'newClientOrderId', 'clientOrderId', 'postOnly', 'stopLossPrice', 'takeProfitPrice', 'stopPrice', 'triggerPrice']);
        const [marginMode, query] = this.handleMarginModeAndParams('createOrder', params);
        const request = {
            'symbol': market['id'],
            'side': side.toUpperCase(),
        };
        let method = 'privatePostOrder';
        if (market['linear']) {
            method = 'fapiPrivatePostOrder';
        }
        else if (market['inverse']) {
            method = 'dapiPrivatePostOrder';
        }
        else if (marketType === 'margin' || marginMode !== undefined) {
            method = 'sapiPostMarginOrder';
            const reduceOnly = this.safeValue(params, 'reduceOnly');
            if (reduceOnly) {
                request['sideEffectType'] = 'AUTO_REPAY';
                params = this.omit(params, 'reduceOnly');
            }
        }
        if (market['spot'] || marketType === 'margin') {
            // support for testing orders
            const test = this.safeValue(query, 'test', false);
            if (test) {
                method += 'Test';
            }
            // only supported for spot/margin api (all margin markets are spot markets)
            if (postOnly) {
                type = 'LIMIT_MAKER';
            }
        }
        let uppercaseType = type.toUpperCase();
        let stopPrice = undefined;
        if (isStopLoss) {
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
        if (marginMode === 'isolated') {
            request['isIsolated'] = true;
        }
        if (clientOrderId === undefined) {
            const broker = this.safeValue(this.options, 'broker');
            if (broker !== undefined) {
                const brokerId = this.safeString(broker, marketType);
                if (brokerId !== undefined) {
                    request['newClientOrderId'] = brokerId + this.uuid22();
                }
            }
        }
        else {
            request['newClientOrderId'] = clientOrderId;
        }
        if ((marketType === 'spot') || (marketType === 'margin')) {
            request['newOrderRespType'] = this.safeValue(this.options['newOrderRespType'], type, 'RESULT'); // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
        }
        else {
            // swap, futures and options
            request['newOrderRespType'] = 'RESULT'; // "ACK", "RESULT", default "ACK"
        }
        if (market['option']) {
            if (type === 'market') {
                throw new errors.InvalidOrder(this.id + ' ' + type + ' is not a valid order type for the ' + symbol + ' market');
            }
            method = 'eapiPrivatePostOrder';
        }
        else {
            const validOrderTypes = this.safeValue(market['info'], 'orderTypes');
            if (!this.inArray(uppercaseType, validOrderTypes)) {
                if (initialUppercaseType !== uppercaseType) {
                    throw new errors.InvalidOrder(this.id + ' stopPrice parameter is not allowed for ' + symbol + ' ' + type + ' orders');
                }
                else {
                    throw new errors.InvalidOrder(this.id + ' ' + type + ' is not a valid order type for the ' + symbol + ' market');
                }
            }
        }
        request['type'] = uppercaseType;
        // additional required fields depending on the order type
        let timeInForceIsRequired = false;
        let priceIsRequired = false;
        let stopPriceIsRequired = false;
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
                const quoteOrderQty = this.safeValue(this.options, 'quoteOrderQty', true);
                if (quoteOrderQty) {
                    const quoteOrderQtyNew = this.safeValue2(query, 'quoteOrderQty', 'cost');
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
            stopPriceIsRequired = true;
            quantityIsRequired = true;
            if (market['linear'] || market['inverse']) {
                priceIsRequired = true;
            }
        }
        else if ((uppercaseType === 'STOP_LOSS_LIMIT') || (uppercaseType === 'TAKE_PROFIT_LIMIT')) {
            quantityIsRequired = true;
            stopPriceIsRequired = true;
            priceIsRequired = true;
            timeInForceIsRequired = true;
        }
        else if (uppercaseType === 'LIMIT_MAKER') {
            priceIsRequired = true;
            quantityIsRequired = true;
        }
        else if (uppercaseType === 'STOP') {
            quantityIsRequired = true;
            stopPriceIsRequired = true;
            priceIsRequired = true;
        }
        else if ((uppercaseType === 'STOP_MARKET') || (uppercaseType === 'TAKE_PROFIT_MARKET')) {
            const closePosition = this.safeValue(query, 'closePosition');
            if (closePosition === undefined) {
                quantityIsRequired = true;
            }
            stopPriceIsRequired = true;
        }
        else if (uppercaseType === 'TRAILING_STOP_MARKET') {
            quantityIsRequired = true;
            const callbackRate = this.safeNumber(query, 'callbackRate');
            if (callbackRate === undefined) {
                throw new errors.InvalidOrder(this.id + ' createOrder() requires a callbackRate extra param for a ' + type + ' order');
            }
        }
        if (quantityIsRequired) {
            request['quantity'] = this.amountToPrecision(symbol, amount);
        }
        if (priceIsRequired) {
            if (price === undefined) {
                throw new errors.InvalidOrder(this.id + ' createOrder() requires a price argument for a ' + type + ' order');
            }
            request['price'] = this.priceToPrecision(symbol, price);
        }
        if (timeInForceIsRequired) {
            request['timeInForce'] = this.options['defaultTimeInForce']; // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
        }
        if (market['contract'] && postOnly) {
            request['timeInForce'] = 'GTX';
        }
        if (stopPriceIsRequired) {
            if (market['contract']) {
                if (stopPrice === undefined) {
                    throw new errors.InvalidOrder(this.id + ' createOrder() requires a stopPrice extra param for a ' + type + ' order');
                }
            }
            else {
                // check for delta price as well
                if (trailingDelta === undefined && stopPrice === undefined) {
                    throw new errors.InvalidOrder(this.id + ' createOrder() requires a stopPrice or trailingDelta param for a ' + type + ' order');
                }
            }
            if (stopPrice !== undefined) {
                request['stopPrice'] = this.priceToPrecision(symbol, stopPrice);
            }
        }
        // remove timeInForce from params because PO is only used by this.isPostOnly and it's not a valid value for Binance
        if (this.safeString(params, 'timeInForce') === 'PO') {
            params = this.omit(params, ['timeInForce']);
        }
        const requestParams = this.omit(params, ['quoteOrderQty', 'cost', 'stopPrice', 'test', 'type', 'newClientOrderId', 'clientOrderId', 'postOnly']);
        const response = await this[method](this.extend(request, requestParams));
        return this.parseOrder(response, market);
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the binance api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated', for spot margin trading
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredSymbol('fetchOrder', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        const defaultType = this.safeString2(this.options, 'fetchOrder', 'defaultType', 'spot');
        const type = this.safeString(params, 'type', defaultType);
        const [marginMode, query] = this.handleMarginModeAndParams('fetchOrder', params);
        const request = {
            'symbol': market['id'],
        };
        let method = 'privateGetOrder';
        if (market['option']) {
            method = 'eapiPrivateGetOrder';
        }
        else if (market['linear']) {
            method = 'fapiPrivateGetOrder';
        }
        else if (market['inverse']) {
            method = 'dapiPrivateGetOrder';
        }
        else if (type === 'margin' || marginMode !== undefined) {
            method = 'sapiGetMarginOrder';
            if (marginMode === 'isolated') {
                request['isIsolated'] = true;
            }
        }
        const clientOrderId = this.safeValue2(params, 'origClientOrderId', 'clientOrderId');
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
        const requestParams = this.omit(query, ['type', 'clientOrderId', 'origClientOrderId']);
        const response = await this[method](this.extend(request, requestParams));
        return this.parseOrder(response, market);
    }
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of order structures to retrieve
         * @param {object} params extra parameters specific to the binance api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated', for spot margin trading
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredSymbol('fetchOrders', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        const defaultType = this.safeString2(this.options, 'fetchOrders', 'defaultType', 'spot');
        const type = this.safeString(params, 'type', defaultType);
        const [marginMode, query] = this.handleMarginModeAndParams('fetchOrders', params);
        const request = {
            'symbol': market['id'],
        };
        let method = 'privateGetAllOrders';
        if (market['option']) {
            method = 'eapiPrivateGetHistoryOrders';
        }
        else if (market['linear']) {
            method = 'fapiPrivateGetAllOrders';
        }
        else if (market['inverse']) {
            method = 'dapiPrivateGetAllOrders';
        }
        else if (type === 'margin' || marginMode !== undefined) {
            method = 'sapiGetMarginAllOrders';
            if (marginMode === 'isolated') {
                request['isIsolated'] = true;
            }
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method](this.extend(request, query));
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
        return this.parseOrders(response, market, since, limit);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of open orders structures to retrieve
         * @param {object} params extra parameters specific to the binance api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated', for spot margin trading
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        let type = undefined;
        const request = {};
        let marginMode = undefined;
        let query = undefined;
        [marginMode, query] = this.handleMarginModeAndParams('fetchOpenOrders', params);
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
            const defaultType = this.safeString2(this.options, 'fetchOpenOrders', 'defaultType', 'spot');
            const marketType = ('type' in market) ? market['type'] : defaultType;
            type = this.safeString(query, 'type', marketType);
        }
        else if (this.options['warnOnFetchOpenOrdersWithoutSymbol']) {
            const symbols = this.symbols;
            const numSymbols = symbols.length;
            const fetchOpenOrdersRateLimit = this.parseToInt(numSymbols / 2);
            throw new errors.ExchangeError(this.id + ' fetchOpenOrders() WARNING: fetching open orders without specifying a symbol is rate-limited to one call per ' + fetchOpenOrdersRateLimit.toString() + ' seconds. Do not call this method frequently to avoid ban. Set ' + this.id + '.options["warnOnFetchOpenOrdersWithoutSymbol"] = false to suppress this warning message.');
        }
        else {
            const defaultType = this.safeString2(this.options, 'fetchOpenOrders', 'defaultType', 'spot');
            type = this.safeString(query, 'type', defaultType);
        }
        let subType = undefined;
        [subType, query] = this.handleSubTypeAndParams('fetchOpenOrders', market, query);
        const requestParams = this.omit(query, 'type');
        let method = 'privateGetOpenOrders';
        if (type === 'option') {
            method = 'eapiPrivateGetOpenOrders';
            if (since !== undefined) {
                request['startTime'] = since;
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        }
        else if (this.isLinear(type, subType)) {
            method = 'fapiPrivateGetOpenOrders';
        }
        else if (this.isInverse(type, subType)) {
            method = 'dapiPrivateGetOpenOrders';
        }
        else if (type === 'margin' || marginMode !== undefined) {
            method = 'sapiGetMarginOpenOrders';
            if (marginMode === 'isolated') {
                request['isIsolated'] = true;
                if (symbol === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' fetchOpenOrders() requires a symbol argument for isolated markets');
                }
            }
        }
        const response = await this[method](this.extend(request, requestParams));
        return this.parseOrders(response, market, since, limit);
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of order structures to retrieve
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const orders = await this.fetchOrders(symbol, since, limit, params);
        return this.filterBy(orders, 'status', 'closed');
    }
    async fetchCanceledOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchCanceledOrders
         * @description fetches information on multiple canceled orders made by the user
         * @see https://binance-docs.github.io/apidocs/spot/en/#all-orders-user_data
         * @see https://binance-docs.github.io/apidocs/spot/en/#query-margin-account-39-s-all-orders-user_data
         * @see https://binance-docs.github.io/apidocs/voptions/en/#query-option-order-history-trade
         * @param {string} symbol unified market symbol of the market the orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of order structures to retrieve
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredSymbol('fetchCanceledOrders', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        if (market['swap'] || market['future']) {
            throw new errors.NotSupported(this.id + ' fetchCanceledOrders() supports spot, margin and option markets only');
        }
        params = this.omit(params, 'type');
        const orders = await this.fetchOrders(symbol, since, undefined, params);
        const filteredOrders = this.filterBy(orders, 'status', 'canceled');
        return this.filterByLimit(filteredOrders, limit);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name binance#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredSymbol('cancelOrder', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        const defaultType = this.safeString2(this.options, 'cancelOrder', 'defaultType', 'spot');
        const type = this.safeString(params, 'type', defaultType);
        const [marginMode, query] = this.handleMarginModeAndParams('cancelOrder', params);
        const request = {
            'symbol': market['id'],
            // 'orderId': id,
            // 'origClientOrderId': id,
        };
        const clientOrderId = this.safeValue2(params, 'origClientOrderId', 'clientOrderId');
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
        let method = 'privateDeleteOrder';
        if (market['option']) {
            method = 'eapiPrivateDeleteOrder';
        }
        else if (market['linear']) {
            method = 'fapiPrivateDeleteOrder';
        }
        else if (market['inverse']) {
            method = 'dapiPrivateDeleteOrder';
        }
        else if (type === 'margin' || marginMode !== undefined) {
            method = 'sapiDeleteMarginOrder';
            if (marginMode === 'isolated') {
                request['isIsolated'] = true;
            }
        }
        const requestParams = this.omit(query, ['type', 'origClientOrderId', 'clientOrderId']);
        const response = await this[method](this.extend(request, requestParams));
        return this.parseOrder(response, market);
    }
    async cancelAllOrders(symbol = undefined, params = {}) {
        /**
         * @method
         * @name binance#cancelAllOrders
         * @description cancel all open orders in a market
         * @param {string} symbol unified market symbol of the market to cancel orders in
         * @param {object} params extra parameters specific to the binance api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated', for spot margin trading
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredSymbol('cancelAllOrders', symbol);
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const type = this.safeString(params, 'type', market['type']);
        params = this.omit(params, ['type']);
        const [marginMode, query] = this.handleMarginModeAndParams('cancelAllOrders', params);
        let method = 'privateDeleteOpenOrders';
        if (market['option']) {
            method = 'eapiPrivateDeleteAllOpenOrders';
        }
        else if (market['linear']) {
            method = 'fapiPrivateDeleteAllOpenOrders';
        }
        else if (market['inverse']) {
            method = 'dapiPrivateDeleteAllOpenOrders';
        }
        else if ((type === 'margin') || (marginMode !== undefined)) {
            method = 'sapiDeleteMarginOpenOrders';
            if (marginMode === 'isolated') {
                request['isIsolated'] = true;
            }
        }
        const response = await this[method](this.extend(request, query));
        if (Array.isArray(response)) {
            return this.parseOrders(response, market);
        }
        else {
            return response;
        }
    }
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
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
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        let type = undefined;
        let method = undefined;
        let marginMode = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        [type, params] = this.handleMarketTypeAndParams('fetchMyTrades', market, params);
        if (type === 'option') {
            method = 'eapiPrivateGetUserTrades';
        }
        else {
            this.checkRequiredSymbol('fetchMyTrades', symbol);
            [marginMode, params] = this.handleMarginModeAndParams('fetchMyTrades', params);
            if (type === 'spot' || type === 'margin') {
                method = 'privateGetMyTrades';
                if ((type === 'margin') || (marginMode !== undefined)) {
                    method = 'sapiGetMarginMyTrades';
                    if (marginMode === 'isolated') {
                        request['isIsolated'] = true;
                    }
                }
            }
            else if (market['linear']) {
                method = 'fapiPrivateGetUserTrades';
            }
            else if (market['inverse']) {
                method = 'dapiPrivateGetUserTrades';
            }
        }
        let endTime = this.safeInteger2(params, 'until', 'endTime');
        if (since !== undefined) {
            const startTime = since;
            request['startTime'] = startTime;
            // https://binance-docs.github.io/apidocs/futures/en/#account-trade-list-user_data
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
        const response = await this[method](this.extend(request, params));
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
        return this.parseTrades(response, market, since, limit);
    }
    async fetchMyDustTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchMyDustTrades
         * @description fetch all dust trades made by the user
         * @param {string|undefined} symbol not used by binance fetchMyDustTrades ()
         * @param {int|undefined} since the earliest time in ms to fetch my dust trades for
         * @param {int|undefined} limit the maximum number of dust trades to retrieve
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
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
        const results = this.safeValue(response, 'userAssetDribblets', []);
        const rows = this.safeInteger(response, 'total', 0);
        const data = [];
        for (let i = 0; i < rows; i++) {
            const logs = this.safeValue(results[i], 'userAssetDribbletDetails', []);
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
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the binance api endpoint
         * @param {bool} params.fiat if true, only fiat deposits will be returned
         * @param {int|undefined} params.until the latest time in ms to fetch deposits for
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        let currency = undefined;
        let response = undefined;
        const request = {};
        const legalMoney = this.safeValue(this.options, 'legalMoney', {});
        const fiatOnly = this.safeValue(params, 'fiat', false);
        params = this.omit(params, 'fiatOnly');
        const until = this.safeInteger(params, 'until');
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
            response = this.safeValue(raw, 'data');
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
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the binance api endpoint
         * @param {bool} params.fiat if true, only fiat withdrawals will be returned
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        const legalMoney = this.safeValue(this.options, 'legalMoney', {});
        const fiatOnly = this.safeValue(params, 'fiat', false);
        params = this.omit(params, 'fiatOnly');
        const request = {};
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
            response = this.safeValue(raw, 'data');
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
        const statuses = this.safeValue(statusesByType, type, {});
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
        //    { id: '9a67628b16ba4988ae20d329333f16bc' }
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
            const legalMoneyCurrenciesById = this.safeValue(this.options, 'legalMoneyCurrenciesById');
            code = this.safeString(legalMoneyCurrenciesById, code, code);
        }
        const status = this.parseTransactionStatusByType(this.safeString(transaction, 'status'), type);
        const amount = this.safeNumber(transaction, 'amount');
        const feeCost = this.safeNumber2(transaction, 'transactionFee', 'totalFee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        let internal = this.safeInteger(transaction, 'transferType');
        if (internal !== undefined) {
            internal = internal ? true : false;
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
        //         timestamp: 1614640878000,
        //         asset: 'USDT',
        //         amount: '25',
        //         type: 'MAIN_UMFUTURE',
        //         status: 'CONFIRMED',
        //         tranId: 43000126248
        //     }
        //
        const id = this.safeString(transfer, 'tranId');
        const currencyId = this.safeString(transfer, 'asset');
        const code = this.safeCurrencyCode(currencyId, currency);
        const amount = this.safeNumber(transfer, 'amount');
        const type = this.safeString(transfer, 'type');
        let fromAccount = undefined;
        let toAccount = undefined;
        const accountsById = this.safeValue(this.options, 'accountsById', {});
        if (type !== undefined) {
            const parts = type.split('_');
            fromAccount = this.safeValue(parts, 0);
            toAccount = this.safeValue(parts, 1);
            fromAccount = this.safeString(accountsById, fromAccount, fromAccount);
            toAccount = this.safeString(accountsById, toAccount, toAccount);
        }
        const timestamp = this.safeInteger(transfer, 'timestamp');
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
        const symbol = this.safeSymbol(marketId, market, undefined, 'swap');
        const amount = this.safeNumber(income, 'income');
        const currencyId = this.safeString(income, 'asset');
        const code = this.safeCurrencyCode(currencyId);
        const id = this.safeString(income, 'tranId');
        const timestamp = this.safeInteger(income, 'time');
        return {
            'info': income,
            'symbol': symbol,
            'code': code,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': id,
            'amount': amount,
        };
    }
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name binance#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://binance-docs.github.io/apidocs/spot/en/#user-universal-transfer-user_data
         * @see https://binance-docs.github.io/apidocs/spot/en/#isolated-margin-account-transfer-margin
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
        };
        request['type'] = this.safeString(params, 'type');
        let method = 'sapiPostAssetTransfer';
        if (request['type'] === undefined) {
            const symbol = this.safeString(params, 'symbol');
            if (symbol !== undefined) {
                params = this.omit(params, 'symbol');
            }
            let fromId = this.convertTypeToAccount(fromAccount).toUpperCase();
            let toId = this.convertTypeToAccount(toAccount).toUpperCase();
            if (fromId === 'ISOLATED') {
                if (symbol === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' transfer () requires params["symbol"] when fromAccount is ' + fromAccount);
                }
                else {
                    fromId = this.marketId(symbol);
                }
            }
            if (toId === 'ISOLATED') {
                if (symbol === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' transfer () requires params["symbol"] when toAccount is ' + toAccount);
                }
                else {
                    toId = this.marketId(symbol);
                }
            }
            const accountsById = this.safeValue(this.options, 'accountsById', {});
            const fromIsolated = !(fromId in accountsById);
            const toIsolated = !(toId in accountsById);
            if (fromIsolated || toIsolated) { // Isolated margin transfer
                const fromFuture = fromId === 'UMFUTURE' || fromId === 'CMFUTURE';
                const toFuture = toId === 'UMFUTURE' || toId === 'CMFUTURE';
                const fromSpot = fromId === 'MAIN';
                const toSpot = toId === 'MAIN';
                const funding = fromId === 'FUNDING' || toId === 'FUNDING';
                const mining = fromId === 'MINING' || toId === 'MINING';
                const option = fromId === 'OPTION' || toId === 'OPTION';
                const prohibitedWithIsolated = fromFuture || toFuture || mining || funding || option;
                if ((fromIsolated || toIsolated) && prohibitedWithIsolated) {
                    throw new errors.BadRequest(this.id + ' transfer () does not allow transfers between ' + fromAccount + ' and ' + toAccount);
                }
                else if (toSpot && fromIsolated) {
                    method = 'sapiPostMarginIsolatedTransfer';
                    request['transFrom'] = 'ISOLATED_MARGIN';
                    request['transTo'] = 'SPOT';
                    request['symbol'] = fromId;
                }
                else if (fromSpot && toIsolated) {
                    method = 'sapiPostMarginIsolatedTransfer';
                    request['transFrom'] = 'SPOT';
                    request['transTo'] = 'ISOLATED_MARGIN';
                    request['symbol'] = toId;
                }
                else {
                    if (fromIsolated) {
                        request['fromSymbol'] = fromId;
                        fromId = 'ISOLATEDMARGIN';
                    }
                    if (toIsolated) {
                        request['toSymbol'] = toId;
                        toId = 'ISOLATEDMARGIN';
                    }
                    request['type'] = fromId + '_' + toId;
                }
            }
            else {
                request['type'] = fromId + '_' + toId;
            }
        }
        params = this.omit(params, 'type');
        const response = await this[method](this.extend(request, params));
        //
        //     {
        //         "tranId":13526853623
        //     }
        //
        return this.parseTransfer(response, currency);
    }
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchTransfers
         * @description fetch a history of internal transfers made on an account
         * @param {string|undefined} code unified currency code of the currency transferred
         * @param {int|undefined} since the earliest time in ms to fetch transfers for
         * @param {int|undefined} limit the maximum number of transfers structures to retrieve
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {[object]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const defaultType = this.safeString2(this.options, 'fetchTransfers', 'defaultType', 'spot');
        const fromAccount = this.safeString(params, 'fromAccount', defaultType);
        const defaultTo = (fromAccount === 'future') ? 'spot' : 'future';
        const toAccount = this.safeString(params, 'toAccount', defaultTo);
        let type = this.safeString(params, 'type');
        const accountsByType = this.safeValue(this.options, 'accountsByType', {});
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
        const request = {
            'type': type,
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.sapiGetAssetTransfer(this.extend(request, params));
        //
        //     {
        //         total: 3,
        //         rows: [
        //             {
        //                 timestamp: 1614640878000,
        //                 asset: 'USDT',
        //                 amount: '25',
        //                 type: 'MAIN_UMFUTURE',
        //                 status: 'CONFIRMED',
        //                 tranId: 43000126248
        //             },
        //         ]
        //     }
        //
        const rows = this.safeValue(response, 'rows', []);
        return this.parseTransfers(rows, currency, since, limit);
    }
    async fetchDepositAddress(code, params = {}) {
        /**
         * @method
         * @name binance#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'coin': currency['id'],
            // 'network': 'ETH', // 'BSC', 'XMR', you can get network and isDefault in networkList in the response of sapiGetCapitalConfigDetail
        };
        const networks = this.safeValue(this.options, 'networks', {});
        let network = this.safeStringUpper(params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString(networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['network'] = network;
            params = this.omit(params, 'network');
        }
        // has support for the 'network' parameter
        // https://binance-docs.github.io/apidocs/spot/en/#deposit-address-supporting-network-user_data
        const response = await this.sapiGetCapitalDepositAddress(this.extend(request, params));
        //
        //     {
        //         currency: 'XRP',
        //         address: 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh',
        //         tag: '108618262',
        //         info: {
        //             coin: 'XRP',
        //             address: 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh',
        //             tag: '108618262',
        //             url: 'https://bithomp.com/explorer/rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh'
        //         }
        //     }
        //
        const address = this.safeString(response, 'address');
        const url = this.safeString(response, 'url');
        let impliedNetwork = undefined;
        if (url !== undefined) {
            const reverseNetworks = this.safeValue(this.options, 'reverseNetworks', {});
            const parts = url.split('/');
            let topLevel = this.safeString(parts, 2);
            if ((topLevel === 'blockchair.com') || (topLevel === 'viewblock.io')) {
                const subLevel = this.safeString(parts, 3);
                if (subLevel !== undefined) {
                    topLevel = topLevel + '/' + subLevel;
                }
            }
            impliedNetwork = this.safeString(reverseNetworks, topLevel);
            const impliedNetworks = this.safeValue(this.options, 'impliedNetworks', {
                'ETH': { 'ERC20': 'ETH' },
                'TRX': { 'TRC20': 'TRX' },
            });
            if (code in impliedNetworks) {
                const conversion = this.safeValue(impliedNetworks, code, {});
                impliedNetwork = this.safeString(conversion, impliedNetwork, impliedNetwork);
            }
        }
        let tag = this.safeString(response, 'tag', '');
        if (tag.length === 0) {
            tag = undefined;
        }
        this.checkAddress(address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': impliedNetwork,
            'info': response,
        };
    }
    async fetchTransactionFees(codes = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchTransactionFees
         * @description *DEPRECATED* please use fetchDepositWithdrawFees instead
         * @param {[string]|undefined} codes not used by binance fetchTransactionFees ()
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {[object]} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets();
        const response = await this.sapiGetCapitalConfigGetall(params);
        //
        //  [
        //     {
        //       coin: 'BAT',
        //       depositAllEnable: true,
        //       withdrawAllEnable: true,
        //       name: 'Basic Attention Token',
        //       free: '0',
        //       locked: '0',
        //       freeze: '0',
        //       withdrawing: '0',
        //       ipoing: '0',
        //       ipoable: '0',
        //       storage: '0',
        //       isLegalMoney: false,
        //       trading: true,
        //       networkList: [
        //         {
        //           network: 'BNB',
        //           coin: 'BAT',
        //           withdrawIntegerMultiple: '0.00000001',
        //           isDefault: false,
        //           depositEnable: true,
        //           withdrawEnable: true,
        //           depositDesc: '',
        //           withdrawDesc: '',
        //           specialTips: 'The name of this asset is Basic Attention Token (BAT). Both a MEMO and an Address are required to successfully deposit your BEP2 tokens to Binance.',
        //           name: 'BEP2',
        //           resetAddressStatus: false,
        //           addressRegex: '^(bnb1)[0-9a-z]{38}$',
        //           memoRegex: '^[0-9A-Za-z\\-_]{1,120}$',
        //           withdrawFee: '0.27',
        //           withdrawMin: '0.54',
        //           withdrawMax: '10000000000',
        //           minConfirm: '1',
        //           unLockConfirm: '0'
        //         },
        //         {
        //           network: 'BSC',
        //           coin: 'BAT',
        //           withdrawIntegerMultiple: '0.00000001',
        //           isDefault: false,
        //           depositEnable: true,
        //           withdrawEnable: true,
        //           depositDesc: '',
        //           withdrawDesc: '',
        //           specialTips: 'The name of this asset is Basic Attention Token. Please ensure you are depositing Basic Attention Token (BAT) tokens under the contract address ending in 9766e.',
        //           name: 'BEP20 (BSC)',
        //           resetAddressStatus: false,
        //           addressRegex: '^(0x)[0-9A-Fa-f]{40}$',
        //           memoRegex: '',
        //           withdrawFee: '0.27',
        //           withdrawMin: '0.54',
        //           withdrawMax: '10000000000',
        //           minConfirm: '15',
        //           unLockConfirm: '0'
        //         },
        //         {
        //           network: 'ETH',
        //           coin: 'BAT',
        //           withdrawIntegerMultiple: '0.00000001',
        //           isDefault: true,
        //           depositEnable: true,
        //           withdrawEnable: true,
        //           depositDesc: '',
        //           withdrawDesc: '',
        //           specialTips: 'The name of this asset is Basic Attention Token. Please ensure you are depositing Basic Attention Token (BAT) tokens under the contract address ending in 887ef.',
        //           name: 'ERC20',
        //           resetAddressStatus: false,
        //           addressRegex: '^(0x)[0-9A-Fa-f]{40}$',
        //           memoRegex: '',
        //           withdrawFee: '27',
        //           withdrawMin: '54',
        //           withdrawMax: '10000000000',
        //           minConfirm: '12',
        //           unLockConfirm: '0'
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
            const networkList = this.safeValue(entry, 'networkList', []);
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
    async fetchDepositWithdrawFees(codes = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @param {[string]|undefined} codes not used by binance fetchDepositWithdrawFees ()
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {[object]} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets();
        const response = await this.sapiGetCapitalConfigGetall(params);
        //
        //    [
        //        {
        //            coin: 'BAT',
        //            depositAllEnable: true,
        //            withdrawAllEnable: true,
        //            name: 'Basic Attention Token',
        //            free: '0',
        //            locked: '0',
        //            freeze: '0',
        //            withdrawing: '0',
        //            ipoing: '0',
        //            ipoable: '0',
        //            storage: '0',
        //            isLegalMoney: false,
        //            trading: true,
        //            networkList: [
        //                {
        //                    network: 'BNB',
        //                    coin: 'BAT',
        //                    withdrawIntegerMultiple: '0.00000001',
        //                    isDefault: false,
        //                    depositEnable: true,
        //                    withdrawEnable: true,
        //                    depositDesc: '',
        //                    withdrawDesc: '',
        //                    specialTips: 'The name of this asset is Basic Attention Token (BAT). Both a MEMO and an Address are required to successfully deposit your BEP2 tokens to Binance.',
        //                    name: 'BEP2',
        //                    resetAddressStatus: false,
        //                    addressRegex: '^(bnb1)[0-9a-z]{38}$',
        //                    memoRegex: '^[0-9A-Za-z\\-_]{1,120}$',
        //                    withdrawFee: '0.27',
        //                    withdrawMin: '0.54',
        //                    withdrawMax: '10000000000',
        //                    minConfirm: '1',
        //                    unLockConfirm: '0'
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
        //        coin: 'BAT',
        //        depositAllEnable: true,
        //        withdrawAllEnable: true,
        //        name: 'Basic Attention Token',
        //        free: '0',
        //        locked: '0',
        //        freeze: '0',
        //        withdrawing: '0',
        //        ipoing: '0',
        //        ipoable: '0',
        //        storage: '0',
        //        isLegalMoney: false,
        //        trading: true,
        //        networkList: [
        //            {
        //                network: 'BNB',
        //                coin: 'BAT',
        //                withdrawIntegerMultiple: '0.00000001',
        //                isDefault: false,
        //                depositEnable: true,
        //                withdrawEnable: true,
        //                depositDesc: '',
        //                withdrawDesc: '',
        //                specialTips: 'The name of this asset is Basic Attention Token (BAT). Both a MEMO and an Address are required to successfully deposit your BEP2 tokens to Binance.',
        //                name: 'BEP2',
        //                resetAddressStatus: false,
        //                addressRegex: '^(bnb1)[0-9a-z]{38}$',
        //                memoRegex: '^[0-9A-Za-z\\-_]{1,120}$',
        //                withdrawFee: '0.27',
        //                withdrawMin: '0.54',
        //                withdrawMax: '10000000000',
        //                minConfirm: '1',
        //                unLockConfirm: '0'
        //            },
        //            ...
        //        ]
        //    }
        //
        const networkList = this.safeValue(fee, 'networkList', []);
        const result = this.depositWithdrawFee(fee);
        for (let j = 0; j < networkList.length; j++) {
            const networkEntry = networkList[j];
            const networkId = this.safeString(networkEntry, 'network');
            const networkCode = this.networkIdToCode(networkId);
            const withdrawFee = this.safeNumber(networkEntry, 'withdrawFee');
            const isDefault = this.safeValue(networkEntry, 'isDefault');
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
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name binance#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        this.checkAddress(address);
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'coin': currency['id'],
            'address': address,
            'amount': amount,
            // https://binance-docs.github.io/apidocs/spot/en/#withdraw-sapi
            // issue sapiGetCapitalConfigGetall () to get networks for withdrawing USDT ERC20 vs USDT Omni
            // 'network': 'ETH', // 'BTC', 'TRX', etc, optional
        };
        if (tag !== undefined) {
            request['addressTag'] = tag;
        }
        const networks = this.safeValue(this.options, 'networks', {});
        let network = this.safeStringUpper(params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString(networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['network'] = network;
            params = this.omit(params, 'network');
        }
        const response = await this.sapiPostCapitalWithdrawApply(this.extend(request, params));
        //     { id: '9a67628b16ba4988ae20d329333f16bc' }
        return this.parseTransaction(response, currency);
    }
    parseTradingFee(fee, market = undefined) {
        //
        //     {
        //         "symbol": "ADABNB",
        //         "makerCommission": 0.001,
        //         "takerCommission": 0.001
        //     }
        //
        const marketId = this.safeString(fee, 'symbol');
        const symbol = this.safeSymbol(marketId, market, undefined, 'spot');
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber(fee, 'makerCommission'),
            'taker': this.safeNumber(fee, 'takerCommission'),
        };
    }
    async fetchTradingFee(symbol, params = {}) {
        /**
         * @method
         * @name binance#fetchTradingFee
         * @description fetch the trading fees for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.sapiGetAssetTradeFee(this.extend(request, params));
        //
        //     [
        //       {
        //         "symbol": "BTCUSDT",
        //         "makerCommission": "0.001",
        //         "takerCommission": "0.001"
        //       }
        //     ]
        //
        const first = this.safeValue(response, 0, {});
        return this.parseTradingFee(first);
    }
    async fetchTradingFees(params = {}) {
        /**
         * @method
         * @name binance#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets();
        let method = undefined;
        const defaultType = this.safeString2(this.options, 'fetchTradingFees', 'defaultType', 'linear');
        const type = this.safeString(params, 'type', defaultType);
        params = this.omit(params, 'type');
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchTradingFees', undefined, params);
        const isSpotOrMargin = (type === 'spot') || (type === 'margin');
        const isLinear = this.isLinear(type, subType);
        const isInverse = this.isInverse(type, subType);
        if (isSpotOrMargin) {
            method = 'sapiGetAssetTradeFee';
        }
        else if (isLinear) {
            method = 'fapiPrivateGetAccount';
        }
        else if (isInverse) {
            method = 'dapiPrivateGetAccount';
        }
        const response = await this[method](params);
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
    async futuresTransfer(code, amount, type, params = {}) {
        /**
         * @method
         * @name binance#futuresTransfer
         * @description transfer between futures account
         * @param {string} code unified currency code
         * @param {float} amount the amount to transfer
         * @param {string} type 1 - transfer from spot account to USDT-Ⓜ futures account, 2 - transfer from USDT-Ⓜ futures account to spot account, 3 - transfer from spot account to COIN-Ⓜ futures account, 4 - transfer from COIN-Ⓜ futures account to spot account
         * @param {object} params extra parameters specific to the binance api endpoint
         * @param {float|undefined} params.recvWindow
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=futures-transfer-structure}
         */
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
    async fetchFundingRate(symbol, params = {}) {
        /**
         * @method
         * @name binance#fetchFundingRate
         * @description fetch the current funding rate
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = undefined;
        if (market['linear']) {
            method = 'fapiPublicGetPremiumIndex';
        }
        else if (market['inverse']) {
            method = 'dapiPublicGetPremiumIndex';
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchFundingRate() supports linear and inverse contracts only');
        }
        let response = await this[method](this.extend(request, params));
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
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @param {string|undefined} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int|undefined} since timestamp in ms of the earliest funding rate to fetch
         * @param {int|undefined} limit the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure} to fetch
         * @param {object} params extra parameters specific to the binance api endpoint
         * @param {int|undefined} params.until timestamp in ms of the latest funding rate
         * @returns {[object]} a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
         */
        await this.loadMarkets();
        const request = {};
        let method = undefined;
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
        if (this.isLinear(type, subType)) {
            method = 'fapiPublicGetFundingRate';
        }
        else if (this.isInverse(type, subType)) {
            method = 'dapiPublicGetFundingRate';
        }
        if (method === undefined) {
            throw new errors.NotSupported(this.id + ' fetchFundingRateHistory() is not supported for ' + type + ' markets');
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger2(params, 'until', 'till'); // unified in milliseconds
        const endTime = this.safeInteger(params, 'endTime', until); // exchange-specific in milliseconds
        params = this.omit(params, ['endTime', 'till', 'until']);
        if (endTime !== undefined) {
            request['endTime'] = endTime;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method](this.extend(request, params));
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "fundingRate": "0.00063521",
        //         "fundingTime": "1621267200000",
        //     }
        //
        const rates = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const timestamp = this.safeInteger(entry, 'fundingTime');
            rates.push({
                'info': entry,
                'symbol': this.safeSymbol(this.safeString(entry, 'symbol'), undefined, undefined, 'swap'),
                'fundingRate': this.safeNumber(entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            });
        }
        const sorted = this.sortBy(rates, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }
    async fetchFundingRates(symbols = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchFundingRates
         * @description fetch the funding rate for multiple markets
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexe by market symbols
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        let method = undefined;
        const defaultType = this.safeString2(this.options, 'fetchFundingRates', 'defaultType', 'future');
        const type = this.safeString(params, 'type', defaultType);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchFundingRates', undefined, params, 'linear');
        const query = this.omit(params, 'type');
        if (this.isLinear(type, subType)) {
            method = 'fapiPublicGetPremiumIndex';
        }
        else if (this.isInverse(type, subType)) {
            method = 'dapiPublicGetPremiumIndex';
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchFundingRates() supports linear and inverse contracts only');
        }
        const response = await this[method](query);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const parsed = this.parseFundingRate(entry);
            result.push(parsed);
        }
        return this.filterByArray(result, 'symbol', symbols);
    }
    parseFundingRate(contract, market = undefined) {
        // ensure it matches with https://www.binance.com/en/futures/funding-history/0
        //
        //   {
        //     "symbol": "BTCUSDT",
        //     "markPrice": "45802.81129892",
        //     "indexPrice": "45745.47701915",
        //     "estimatedSettlePrice": "45133.91753671",
        //     "lastFundingRate": "0.00063521",
        //     "interestRate": "0.00010000",
        //     "nextFundingTime": "1621267200000",
        //     "time": "1621252344001"
        //  }
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
        };
    }
    parseAccountPositions(account) {
        const positions = this.safeValue(account, 'positions');
        const assets = this.safeValue(account, 'assets', []);
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
            // sometimes not all the codes are correctly returned...
            if (code in balances) {
                const parsed = this.parseAccountPosition(this.extend(position, {
                    'crossMargin': balances[code]['crossMargin'],
                    'crossWalletBalance': balances[code]['crossWalletBalance'],
                }), market);
                result.push(parsed);
            }
        }
        return result;
    }
    parseAccountPosition(position, market = undefined) {
        //
        // usdm
        //    {
        //       "symbol": "BTCBUSD",
        //       "initialMargin": "0",
        //       "maintMargin": "0",
        //       "unrealizedProfit": "0.00000000",
        //       "positionInitialMargin": "0",
        //       "openOrderInitialMargin": "0",
        //       "leverage": "20",
        //       "isolated": false,
        //       "entryPrice": "0.0000",
        //       "maxNotional": "100000",
        //       "positionSide": "BOTH",
        //       "positionAmt": "0.000",
        //       "notional": "0",
        //       "isolatedWallet": "0",
        //       "updateTime": "0",
        //       "crossMargin": "100.93634809",
        //     }
        //
        // coinm
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
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market, undefined, 'contract');
        const symbol = this.safeString(market, 'symbol');
        const leverageString = this.safeString(position, 'leverage');
        const leverage = parseInt(leverageString);
        const initialMarginString = this.safeString(position, 'initialMargin');
        const initialMargin = this.parseNumber(initialMarginString);
        let initialMarginPercentageString = Precise["default"].stringDiv('1', leverageString, 8);
        const rational = (1000 % leverage) === 0;
        if (!rational) {
            initialMarginPercentageString = Precise["default"].stringDiv(Precise["default"].stringAdd(initialMarginPercentageString, '1e-8'), '1', 8);
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
        const leverageBrackets = this.safeValue(this.options, 'leverageBrackets', {});
        const leverageBracket = this.safeValue(leverageBrackets, symbol, []);
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
        const isolated = this.safeValue(position, 'isolated');
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
            const pricePrecision = market['precision']['price'];
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
        //     {
        //       "symbol": "BTCUSDT",
        //       "positionAmt": "0.001",
        //       "entryPrice": "43578.07000",
        //       "markPrice": "43532.30000000",
        //       "unRealizedProfit": "-0.04577000",
        //       "liquidationPrice": "21841.24993976",
        //       "leverage": "2",
        //       "maxNotionalValue": "300000000",
        //       "marginType": "isolated",
        //       "isolatedMargin": "21.77841506",
        //       "isAutoAddMargin": "false",
        //       "positionSide": "BOTH",
        //       "notional": "43.53230000",
        //       "isolatedWallet": "21.82418506",
        //       "updateTime": "1621358023886"
        //     }
        //
        // coinm
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
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market, undefined, 'contract');
        const symbol = this.safeString(market, 'symbol');
        const leverageBrackets = this.safeValue(this.options, 'leverageBrackets', {});
        const leverageBracket = this.safeValue(leverageBrackets, symbol, []);
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
        const leverageString = this.safeString(position, 'leverage');
        const leverage = parseInt(leverageString);
        const liquidationPriceString = this.omitZero(this.safeString(position, 'liquidationPrice'));
        const liquidationPrice = this.parseNumber(liquidationPriceString);
        let collateralString = undefined;
        const marginMode = this.safeString(position, 'marginType');
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
            const precision = this.safeValue(market, 'precision', {});
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
                const pricePrecision = this.safeInteger(precision, 'price');
                const quotePrecision = this.safeInteger(precision, 'quote', pricePrecision);
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
                const basePrecision = this.safeInteger(precision, 'base');
                if (basePrecision !== undefined) {
                    collateralString = Precise["default"].stringDiv(Precise["default"].stringMul(leftSide, rightSide), '1', basePrecision);
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
        const maintenanceMarginString = Precise["default"].stringMul(maintenanceMarginPercentageString, notionalStringAbs);
        const maintenanceMargin = this.parseNumber(maintenanceMarginString);
        let initialMarginPercentageString = Precise["default"].stringDiv('1', leverageString, 8);
        const rational = (1000 % leverage) === 0;
        if (!rational) {
            initialMarginPercentageString = Precise["default"].stringAdd(initialMarginPercentageString, '1e-8');
        }
        const initialMarginString = Precise["default"].stringDiv(Precise["default"].stringMul(notionalStringAbs, initialMarginPercentageString), '1', 8);
        const initialMargin = this.parseNumber(initialMarginString);
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
            'initialMargin': initialMargin,
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
        };
    }
    async loadLeverageBrackets(reload = false, params = {}) {
        await this.loadMarkets();
        // by default cache the leverage bracket
        // it contains useful stuff like the maintenance margin and initial margin for positions
        const leverageBrackets = this.safeValue(this.options, 'leverageBrackets');
        if ((leverageBrackets === undefined) || (reload)) {
            let method = undefined;
            const defaultType = this.safeString(this.options, 'defaultType', 'future');
            const type = this.safeString(params, 'type', defaultType);
            const query = this.omit(params, 'type');
            let subType = undefined;
            [subType, params] = this.handleSubTypeAndParams('loadLeverageBrackets', undefined, params, 'linear');
            if (this.isLinear(type, subType)) {
                method = 'fapiPrivateGetLeverageBracket';
            }
            else if (this.isInverse(type, subType)) {
                method = 'dapiPrivateV2GetLeverageBracket';
            }
            else {
                throw new errors.NotSupported(this.id + ' loadLeverageBrackets() supports linear and inverse contracts only');
            }
            const response = await this[method](query);
            this.options['leverageBrackets'] = {};
            for (let i = 0; i < response.length; i++) {
                const entry = response[i];
                const marketId = this.safeString(entry, 'symbol');
                const symbol = this.safeSymbol(marketId, undefined, undefined, 'contract');
                const brackets = this.safeValue(entry, 'brackets', []);
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
    async fetchLeverageTiers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchLeverageTiers
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
         */
        await this.loadMarkets();
        const [type, query] = this.handleMarketTypeAndParams('fetchLeverageTiers', undefined, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchLeverageTiers', undefined, query, 'linear');
        let method = undefined;
        if (this.isLinear(type, subType)) {
            method = 'fapiPrivateGetLeverageBracket';
        }
        else if (this.isInverse(type, subType)) {
            method = 'dapiPrivateV2GetLeverageBracket';
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchLeverageTiers() supports linear and inverse contracts only');
        }
        const response = await this[method](query);
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
        const brackets = this.safeValue(info, 'brackets', []);
        const tiers = [];
        for (let j = 0; j < brackets.length; j++) {
            const bracket = brackets[j];
            tiers.push({
                'tier': this.safeNumber(bracket, 'bracket'),
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
    async fetchPosition(symbol, params = {}) {
        /**
         * @method
         * @name binance#fetchPosition
         * @see https://binance-docs.github.io/apidocs/voptions/en/#option-position-information-user_data
         * @description fetch data on an open position
         * @param {string} symbol unified market symbol of the market the position is held in
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
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
    async fetchOptionPositions(symbols = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchOptionPositions
         * @see https://binance-docs.github.io/apidocs/voptions/en/#option-position-information-user_data
         * @description fetch data on open options positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {[object]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
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
        return this.filterByArray(result, 'symbol', symbols, false);
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
        market = this.safeMarket(marketId, market);
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
    async fetchPositions(symbols = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        const defaultMethod = this.safeString(this.options, 'fetchPositions', 'positionRisk');
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
            throw new errors.NotSupported(this.id + '.options["fetchPositions"] = "' + defaultMethod + '" is invalid, please choose between "account", "positionRisk" and "option"');
        }
    }
    async fetchAccountPositions(symbols = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchAccountPositions
         * @description fetch account positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} data on account positions
         */
        if (symbols !== undefined) {
            if (!Array.isArray(symbols)) {
                throw new errors.ArgumentsRequired(this.id + ' fetchPositions() requires an array argument for symbols');
            }
        }
        await this.loadMarkets();
        await this.loadLeverageBrackets(false, params);
        let method = undefined;
        const defaultType = this.safeString(this.options, 'defaultType', 'future');
        const type = this.safeString(params, 'type', defaultType);
        let query = this.omit(params, 'type');
        let subType = undefined;
        [subType, query] = this.handleSubTypeAndParams('fetchAccountPositions', undefined, params, 'linear');
        if (this.isLinear(type, subType)) {
            method = 'fapiPrivateGetAccount';
        }
        else if (this.isInverse(type, subType)) {
            method = 'dapiPrivateGetAccount';
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchPositions() supports linear and inverse contracts only');
        }
        const account = await this[method](query);
        const result = this.parseAccountPositions(account);
        symbols = this.marketSymbols(symbols);
        return this.filterByArray(result, 'symbol', symbols, false);
    }
    async fetchPositionsRisk(symbols = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchPositionsRisk
         * @description fetch positions risk
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} data on the positions risk
         */
        if (symbols !== undefined) {
            if (!Array.isArray(symbols)) {
                throw new errors.ArgumentsRequired(this.id + ' fetchPositionsRisk() requires an array argument for symbols');
            }
        }
        await this.loadMarkets();
        await this.loadLeverageBrackets(false, params);
        const request = {};
        let method = undefined;
        let defaultType = 'future';
        defaultType = this.safeString(this.options, 'defaultType', defaultType);
        const type = this.safeString(params, 'type', defaultType);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchPositionsRisk', undefined, params, 'linear');
        params = this.omit(params, 'type');
        if (this.isLinear(type, subType)) {
            method = 'fapiPrivateGetPositionRisk';
            // ### Response examples ###
            //
            // For One-way position mode:
            //     [
            //         {
            //             "entryPrice": "0.00000",
            //             "marginType": "isolated",
            //             "isAutoAddMargin": "false",
            //             "isolatedMargin": "0.00000000",
            //             "leverage": "10",
            //             "liquidationPrice": "0",
            //             "markPrice": "6679.50671178",
            //             "maxNotionalValue": "20000000",
            //             "positionAmt": "0.000",
            //             "symbol": "BTCUSDT",
            //             "unRealizedProfit": "0.00000000",
            //             "positionSide": "BOTH",
            //             "updateTime": 0
            //        }
            //     ]
            //
            // For Hedge position mode:
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
            //             "positionAmt": "20.000",
            //             "symbol": "BTCUSDT",
            //             "unRealizedProfit": "2316.83423560"
            //             "positionSide": "LONG",
            //             "updateTime": 1625474304765
            //         },
            //         {
            //             "entryPrice": "0.00000",
            //             "marginType": "isolated",
            //             "isAutoAddMargin": "false",
            //             "isolatedMargin": "5413.95799991",
            //             "leverage": "10",
            //             "liquidationPrice": "7189.95",
            //             "markPrice": "6679.50671178",
            //             "maxNotionalValue": "20000000",
            //             "positionAmt": "-10.000",
            //             "symbol": "BTCUSDT",
            //             "unRealizedProfit": "-1156.46711780",
            //             "positionSide": "SHORT",
            //             "updateTime": 0
            //         }
            //     ]
        }
        else if (this.isInverse(type, subType)) {
            method = 'dapiPrivateGetPositionRisk';
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchPositionsRisk() supports linear and inverse contracts only');
        }
        const response = await this[method](this.extend(request, params));
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const parsed = this.parsePositionRisk(response[i]);
            result.push(parsed);
        }
        symbols = this.marketSymbols(symbols);
        return this.filterByArray(result, 'symbol', symbols, false);
    }
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchFundingHistory
         * @description fetch the history of funding payments paid and received on this account
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch funding history for
         * @param {int|undefined} limit the maximum number of funding history structures to retrieve
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        let method = undefined;
        const request = {
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
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const defaultType = this.safeString2(this.options, 'fetchFundingHistory', 'defaultType', 'future');
        const type = this.safeString(params, 'type', defaultType);
        params = this.omit(params, 'type');
        if (this.isLinear(type, subType)) {
            method = 'fapiPrivateGetIncome';
        }
        else if (this.isInverse(type, subType)) {
            method = 'dapiPrivateGetIncome';
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchFundingHistory() supports linear and inverse contracts only');
        }
        const response = await this[method](this.extend(request, params));
        return this.parseIncomes(response, market, since, limit);
    }
    async setLeverage(leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name binance#setLeverage
         * @description set the level of leverage for a market
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} response from the exchange
         */
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
        let method = undefined;
        if (market['linear']) {
            method = 'fapiPrivatePostLeverage';
        }
        else if (market['inverse']) {
            method = 'dapiPrivatePostLeverage';
        }
        else {
            throw new errors.NotSupported(this.id + ' setLeverage() supports linear and inverse contracts only');
        }
        const request = {
            'symbol': market['id'],
            'leverage': leverage,
        };
        return await this[method](this.extend(request, params));
    }
    async setMarginMode(marginMode, symbol = undefined, params = {}) {
        /**
         * @method
         * @name binance#setMarginMode
         * @description set margin mode to 'cross' or 'isolated'
         * @param {string} marginMode 'cross' or 'isolated'
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} response from the exchange
         */
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
        let method = undefined;
        if (market['linear']) {
            method = 'fapiPrivatePostMarginType';
        }
        else if (market['inverse']) {
            method = 'dapiPrivatePostMarginType';
        }
        else {
            throw new errors.NotSupported(this.id + ' setMarginMode() supports linear and inverse contracts only');
        }
        const request = {
            'symbol': market['id'],
            'marginType': marginMode,
        };
        let response = undefined;
        try {
            response = await this[method](this.extend(request, params));
        }
        catch (e) {
            // not an error
            // https://github.com/ccxt/ccxt/issues/11268
            // https://github.com/ccxt/ccxt/pull/11624
            // POST https://fapi.binance.com/fapi/v1/marginType 400 Bad Request
            // binanceusdm
            if (e instanceof errors.MarginModeAlreadySet) {
                const throwMarginModeAlreadySet = this.safeValue(this.options, 'throwMarginModeAlreadySet', false);
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
    async setPositionMode(hedged, symbol = undefined, params = {}) {
        /**
         * @method
         * @name binance#setPositionMode
         * @description set hedged to true or false for a market
         * @param {bool} hedged set to true to use dualSidePosition
         * @param {string|undefined} symbol not used by binance setPositionMode ()
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} response from the exchange
         */
        const defaultType = this.safeString(this.options, 'defaultType', 'future');
        const type = this.safeString(params, 'type', defaultType);
        params = this.omit(params, ['type']);
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
        let method = undefined;
        if (this.isInverse(type)) {
            method = 'dapiPrivatePostPositionSideDual';
        }
        else {
            // default to future
            method = 'fapiPrivatePostPositionSideDual';
        }
        //
        //     {
        //       "code": 200,
        //       "msg": "success"
        //     }
        //
        return await this[method](this.extend(request, params));
    }
    async fetchSettlementHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchSettlementHistory
         * @description fetches historical settlement records
         * @see https://binance-docs.github.io/apidocs/voptions/en/#historical-exercise-records
         * @param {string} symbol unified market symbol of the settlement history
         * @param {int} since timestamp in ms
         * @param {int} limit number of records, default 100, max 100
         * @param {object} params exchange specific params
         * @returns {[object]} a list of [settlement history objects]
         */
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
    parseSettlement(settlement, market) {
        //
        //     {
        //         "symbol": "ETH-230223-1900-P",
        //         "strikePrice": "1900",
        //         "realStrikePrice": "1665.5897334",
        //         "expiryDate": 1677139200000,
        //         "strikeResult": "REALISTIC_VALUE_STRICKEN"
        //     }
        //
        const timestamp = this.safeInteger(settlement, 'expiryDate');
        const marketId = this.safeString(settlement, 'symbol');
        return {
            'info': settlement,
            'symbol': this.safeSymbol(marketId, market),
            'price': this.safeNumber(settlement, 'realStrikePrice'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    parseSettlements(settlements, market) {
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
        const result = [];
        for (let i = 0; i < settlements.length; i++) {
            result.push(this.parseSettlement(settlements[i], market));
        }
        return result;
    }
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
         * @see https://binance-docs.github.io/apidocs/voptions/en/#account-funding-flow-user_data
         * @see https://binance-docs.github.io/apidocs/futures/en/#get-income-history-user_data
         * @see https://binance-docs.github.io/apidocs/delivery/en/#get-income-history-user_data
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry
         * @param {int|undefined} limit max number of ledger entrys to return
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
        await this.loadMarkets();
        let type = undefined;
        let subType = undefined;
        let currency = undefined;
        let method = undefined;
        const request = {};
        [type, params] = this.handleMarketTypeAndParams('fetchLedger', undefined, params);
        [subType, params] = this.handleSubTypeAndParams('fetchLedger', undefined, params);
        if (type === 'option') {
            this.checkRequiredArgument('fetchLedger', code, 'code');
            currency = this.currency(code);
            request['currency'] = currency['id'];
            method = 'eapiPrivateGetBill';
        }
        else if (this.isLinear(type, subType)) {
            method = 'fapiPrivateGetIncome';
        }
        else if (this.isInverse(type, subType)) {
            method = 'dapiPrivateGetIncome';
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchLedger() supports contract wallets only');
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method](this.extend(request, params));
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
        // futures (fapi, dapi)
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
        //         "createDate": 1676621042489
        //     }
        //
        // futures (fapi, dapi)
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
        const timestamp = this.safeInteger2(item, 'createDate', 'time');
        const type = this.safeString2(item, 'type', 'incomeType');
        return {
            'id': this.safeString2(item, 'id', 'tranId'),
            'direction': direction,
            'account': undefined,
            'referenceAccount': undefined,
            'referenceId': this.safeString(item, 'tradeId'),
            'type': this.parseLedgerEntryType(type),
            'currency': this.safeCurrencyCode(currencyId, currency),
            'amount': this.parseNumber(amount),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'before': undefined,
            'after': undefined,
            'status': undefined,
            'fee': undefined,
            'info': item,
        };
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
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const urls = this.urls;
        if (!(api in urls['api'])) {
            throw new errors.NotSupported(this.id + ' does not have a testnet/sandbox URL for ' + api + ' endpoints');
        }
        let url = this.urls['api'][api];
        url += '/' + path;
        if (api === 'wapi') {
            url += '.html';
        }
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
        else if ((api === 'private') || (api === 'eapiPrivate') || (api === 'sapi' && path !== 'system/status') || (api === 'sapiV2') || (api === 'sapiV3') || (api === 'sapiV4') || (api === 'wapi' && path !== 'systemStatus') || (api === 'dapiPrivate') || (api === 'dapiPrivateV2') || (api === 'fapiPrivate') || (api === 'fapiPrivateV2')) {
            this.checkRequiredCredentials();
            let query = undefined;
            const defaultRecvWindow = this.safeInteger(this.options, 'recvWindow');
            const extendedParams = this.extend({
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
            else if ((path === 'batchOrders') || (path.indexOf('sub-account') >= 0) || (path === 'capital/withdraw/apply') || (path.indexOf('staking') >= 0)) {
                query = this.rawencode(extendedParams);
            }
            else {
                query = this.urlencode(extendedParams);
            }
            let signature = undefined;
            if (this.secret.indexOf('PRIVATE KEY') > -1) {
                signature = this.encodeURIComponent(rsa.rsa(query, this.secret, sha256.sha256));
            }
            else {
                signature = this.hmac(this.encode(query), this.encode(this.secret), sha256.sha256);
            }
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method === 'GET') || (method === 'DELETE') || (api === 'wapi')) {
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
        // check success value for wapi endpoints
        // response in format {'msg': 'The coin does not exist.', 'success': true/false}
        const success = this.safeValue(response, 'success', true);
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
            this.throwExactlyMatchedException(this.exceptions['exact'], message, this.id + ' ' + message);
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
            this.throwExactlyMatchedException(this.exceptions['exact'], error, feedback);
            throw new errors.ExchangeError(feedback);
        }
        if (!success) {
            throw new errors.ExchangeError(this.id + ' ' + body);
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
    async request(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined, config = {}, context = {}) {
        const response = await this.fetch2(path, api, method, params, headers, body, config);
        // a workaround for {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
        if ((api === 'private') || (api === 'wapi')) {
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
        let method = undefined;
        let code = undefined;
        if (market['linear']) {
            method = 'fapiPrivatePostPositionMargin';
            code = market['quote'];
        }
        else {
            method = 'dapiPrivatePostPositionMargin';
            code = market['base'];
        }
        const response = await this[method](this.extend(request, params));
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
        const rawType = this.safeInteger(data, 'type');
        const resultType = (rawType === 1) ? 'add' : 'reduce';
        const resultAmount = this.safeNumber(data, 'amount');
        const errorCode = this.safeString(data, 'code');
        const status = (errorCode === '200') ? 'ok' : 'failed';
        return {
            'info': data,
            'type': resultType,
            'amount': resultAmount,
            'code': undefined,
            'symbol': market['symbol'],
            'status': status,
        };
    }
    async reduceMargin(symbol, amount, params = {}) {
        /**
         * @method
         * @name binance#reduceMargin
         * @description remove margin from a position
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
         */
        return await this.modifyMarginHelper(symbol, amount, 2, params);
    }
    async addMargin(symbol, amount, params = {}) {
        /**
         * @method
         * @name binance#addMargin
         * @description add margin
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
         */
        return await this.modifyMarginHelper(symbol, amount, 1, params);
    }
    async fetchBorrowRate(code, params = {}) {
        /**
         * @method
         * @name binance#fetchBorrowRate
         * @description fetch the rate of interest to borrow a currency for margin trading
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a [borrow rate structure]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
         */
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
        const rate = this.safeValue(response, 0);
        return this.parseBorrowRate(rate);
    }
    async fetchBorrowRateHistory(code, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchBorrowRateHistory
         * @description retrieves a history of a currencies borrow interest rate at specific time slots
         * @param {string} code unified currency code
         * @param {int|undefined} since timestamp for the earliest borrow rate
         * @param {int|undefined} limit the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure} to retrieve
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
         */
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
    parseBorrowRateHistory(response, code, since, limit) {
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            const borrowRate = this.parseBorrowRate(item);
            result.push(borrowRate);
        }
        const sorted = this.sortBy(result, 'timestamp');
        return this.filterByCurrencySinceLimit(sorted, code, since, limit);
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
        const timestamp = this.safeNumber(info, 'timestamp');
        currency = this.safeString(info, 'asset');
        return {
            'currency': this.safeCurrencyCode(currency),
            'rate': this.safeNumber(info, 'dailyInterestRate'),
            'period': 86400000,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': info,
        };
    }
    async createGiftCode(code, amount, params = {}) {
        /**
         * @method
         * @name binance#createGiftCode
         * @description create gift code
         * @param {string} code gift code
         * @param {float} amount amount of currency for the gift
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} The gift code id, code, currency and amount
         */
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
        //         code: '000000',
        //         message: 'success',
        //         data: { referenceNo: '0033002404219823', code: 'AP6EXTLKNHM6CEX7' },
        //         success: true
        //     }
        //
        const data = this.safeValue(response, 'data');
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
    async redeemGiftCode(giftcardCode, params = {}) {
        /**
         * @method
         * @name binance#redeemGiftCode
         * @description redeem gift code
         * @param {string} giftcardCode
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} response from the exchange
         */
        const request = {
            'code': giftcardCode,
        };
        const response = await this.sapiPostGiftcardRedeemCode(this.extend(request, params));
        //
        //     {
        //         code: '000000',
        //         message: 'success',
        //         data: {
        //             referenceNo: '0033002404219823',
        //             identityNo: '10316431732801474560'
        //         },
        //         success: true
        //     }
        //
        return response;
    }
    async verifyGiftCode(id, params = {}) {
        /**
         * @method
         * @name binance#verifyGiftCode
         * @description verify gift code
         * @param {string} id reference number id
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} response from the exchange
         */
        const request = {
            'referenceNo': id,
        };
        const response = await this.sapiGetGiftcardVerify(this.extend(request, params));
        //
        //     {
        //         code: '000000',
        //         message: 'success',
        //         data: { valid: true },
        //         success: true
        //     }
        //
        return response;
    }
    async fetchBorrowInterest(code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchBorrowInterest
         * @description fetch the interest owed by the user for borrowing currency for margin trading
         * @param {string|undefined} code unified currency code
         * @param {string|undefined} symbol unified market symbol when fetch interest in isolated markets
         * @param {int|undefined} since the earliest time in ms to fetch borrrow interest for
         * @param {int|undefined} limit the maximum number of structures to retrieve
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {[object]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
         */
        await this.loadMarkets();
        const request = {};
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
        if (symbol !== undefined) { // Isolated
            market = this.market(symbol);
            request['isolatedSymbol'] = market['id'];
        }
        const response = await this.sapiGetMarginInterestHistory(this.extend(request, params));
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
        const rows = this.safeValue(response, 'rows');
        const interest = this.parseBorrowInterests(rows, market);
        return this.filterByCurrencySinceLimit(interest, code, since, limit);
    }
    parseBorrowInterest(info, market = undefined) {
        const symbol = this.safeString(info, 'isolatedSymbol');
        const timestamp = this.safeNumber(info, 'interestAccuredTime');
        const marginMode = (symbol === undefined) ? 'cross' : 'isolated';
        return {
            'account': (symbol === undefined) ? 'cross' : symbol,
            'symbol': symbol,
            'marginMode': marginMode,
            'currency': this.safeCurrencyCode(this.safeString(info, 'asset')),
            'interest': this.safeNumber(info, 'interest'),
            'interestRate': this.safeNumber(info, 'interestRate'),
            'amountBorrowed': this.safeNumber(info, 'principal'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': info,
        };
    }
    async repayMargin(code, amount, symbol = undefined, params = {}) {
        /**
         * @method
         * @name binance#repayMargin
         * @description repay borrowed margin and interest
         * @see https://binance-docs.github.io/apidocs/spot/en/#margin-account-repay-margin
         * @param {string} code unified currency code of the currency to repay
         * @param {float} amount the amount to repay
         * @param {string|undefined} symbol unified market symbol, required for isolated margin
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        const [marginMode, query] = this.handleMarginModeAndParams('repayMargin', params); // cross or isolated
        this.checkRequiredMarginArgument('repayMargin', symbol, marginMode);
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
        };
        if (symbol !== undefined) {
            const market = this.market(symbol);
            request['symbol'] = market['id'];
            request['isIsolated'] = 'TRUE';
        }
        const response = await this.sapiPostMarginRepay(this.extend(request, query));
        //
        //     {
        //         "tranId": 108988250265,
        //         "clientTag":""
        //     }
        //
        return this.parseMarginLoan(response, currency);
    }
    async borrowMargin(code, amount, symbol = undefined, params = {}) {
        /**
         * @method
         * @name binance#borrowMargin
         * @description create a loan to borrow margin
         * @see https://binance-docs.github.io/apidocs/spot/en/#margin-account-borrow-margin
         * @param {string} code unified currency code of the currency to borrow
         * @param {float} amount the amount to borrow
         * @param {string|undefined} symbol unified market symbol, required for isolated margin
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        const [marginMode, query] = this.handleMarginModeAndParams('borrowMargin', params); // cross or isolated
        this.checkRequiredMarginArgument('borrowMargin', symbol, marginMode);
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
        };
        if (symbol !== undefined) {
            const market = this.market(symbol);
            request['symbol'] = market['id'];
            request['isIsolated'] = 'TRUE';
        }
        const response = await this.sapiPostMarginLoan(this.extend(request, query));
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
        return {
            'id': this.safeInteger(info, 'tranId'),
            'currency': this.safeCurrencyCode(undefined, currency),
            'amount': undefined,
            'symbol': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }
    async fetchOpenInterestHistory(symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchOpenInterestHistory
         * @description Retrieves the open interest history of a currency
         * @param {string} symbol Unified CCXT market symbol
         * @param {string} timeframe "5m","15m","30m","1h","2h","4h","6h","12h", or "1d"
         * @param {int|undefined} since the time(ms) of the earliest record to retrieve as a unix timestamp
         * @param {int|undefined} limit default 30, max 500
         * @param {object} params exchange specific parameters
         * @param {int|undefined} params.until the time(ms) of the latest record to retrieve as a unix timestamp
         * @returns {object} an array of [open interest history structure]{@link https://docs.ccxt.com/#/?id=interest-history-structure}
         */
        if (timeframe === '1m') {
            throw new errors.BadRequest(this.id + 'fetchOpenInterestHistory cannot use the 1m timeframe');
        }
        await this.loadMarkets();
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
        const until = this.safeInteger2(params, 'until', 'till'); // unified in milliseconds
        const endTime = this.safeInteger(params, 'endTime', until); // exchange-specific in milliseconds
        params = this.omit(params, ['endTime', 'until', 'till']);
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
        let method = 'fapiDataGetOpenInterestHist';
        if (market['inverse']) {
            method = 'dapiDataGetOpenInterestHist';
        }
        const response = await this[method](this.extend(request, params));
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
        return this.parseOpenInterests(response, market, since, limit);
    }
    async fetchOpenInterest(symbol, params = {}) {
        /**
         * @method
         * @name binance#fetchOpenInterest
         * @description retrieves the open interest of a contract trading pair
         * @see https://binance-docs.github.io/apidocs/futures/en/#open-interest
         * @see https://binance-docs.github.io/apidocs/delivery/en/#open-interest
         * @see https://binance-docs.github.io/apidocs/voptions/en/#open-interest
         * @param {string} symbol unified CCXT market symbol
         * @param {object} params exchange specific parameters
         * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=interest-history-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {};
        if (market['option']) {
            request['underlyingAsset'] = market['baseId'];
            request['expiration'] = this.yymmdd(market['expiry']);
        }
        else {
            request['symbol'] = market['id'];
        }
        let method = 'fapiPublicGetOpenInterest';
        if (market['option']) {
            method = 'eapiPublicGetOpenInterest';
        }
        else if (market['inverse']) {
            method = 'dapiPublicGetOpenInterest';
        }
        const response = await this[method](this.extend(request, params));
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
            return this.parseOpenInterests(response, market);
        }
        else {
            return this.parseOpenInterest(response, market);
        }
    }
    parseOpenInterest(interest, market = undefined) {
        const timestamp = this.safeInteger2(interest, 'timestamp', 'time');
        const id = this.safeString(interest, 'symbol');
        const amount = this.safeNumber2(interest, 'sumOpenInterest', 'openInterest');
        const value = this.safeNumber2(interest, 'sumOpenInterestValue', 'sumOpenInterestUsd');
        // Inverse returns the number of contracts different from the base or quote volume in this case
        // compared with https://www.binance.com/en/futures/funding-history/quarterly/4
        return {
            'symbol': this.safeSymbol(id, market, undefined, 'contract'),
            'baseVolume': market['inverse'] ? undefined : amount,
            'quoteVolume': value,
            'openInterestAmount': amount,
            'openInterestValue': value,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': interest,
        };
    }
}

module.exports = binance;
