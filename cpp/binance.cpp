#include <binance.h>
#include <chrono>
#include <iostream>
#include <date/date.h>
#include <fmt/format.h>
#include <ccxt/base/functions/type.h>
#include <plog/Log.h>

using json = nlohmann::json;

namespace ccxt {
    binance::binance()
        : Exchange (
            "binance", // id
            "Binance", // name
            {"JP", "MT"}, // countries: Japan, Malta
            50, // rateLimit
            false, // certified
            true, // pro
            {  // has
                .CORS = false,
                .spot = true,
                .margin = true,
                .swap = true,
                .future = true,
                .option = false,
                .addMargin = true,
                .borrowMargin = true,
                .cancelAllOrders = true,
                .cancelOrder = true,
                .cancelOrders = false,
                .createDepositAddress = false,
                .createOrder = true,
                .createPostOnlyOrder = true,
                .createReduceOnlyOrder = true,
                .createStopOrder = true,
                .createStopLimitOrder = true,
                .createStopMarketOrder = false,                        
                .editOrder = ExchangeAPIOrEmulated::TRUE,
                .fetchAccounts = false,
                .fetchBalance = true,
                .fetchBidsAsks = true,
                .fetchBorrowInterest = true,
                .fetchBorrowRate = true,
                .fetchBorrowRateHistories = false,
                .fetchBorrowRateHistory = true,
                .fetchBorrowRatesPerSymbol = false,
                .fetchBorrowRates = false,
                .fetchCanceledOrders = false,
                .fetchClosedOrder = false,
                .fetchClosedOrders = ExchangeAPIOrEmulated::EMULATED,
                .fetchCurrencies = ExchangeAPIOrEmulated::TRUE,
                .fetchDeposit = false,
                .fetchDepositAddress = true,
                .fetchDepositAddresses = false,
                .fetchDepositAddressesByNetwork = false,
                .fetchDeposits = true,
                .fetchDepositWithdrawFee = ExchangeAPIOrEmulated::EMULATED,
                .fetchDepositWithdrawFees = true,
                .fetchFundingHistory = true,
                .fetchFundingRate = true,
                .fetchFundingRateHistory = true,
                .fetchFundingRates = true,
                .fetchIndexOHLCV = true,
                .fetchL3OrderBook = false,
                .fetchLastPrices = true,
                .fetchLedger = true,
                .fetchLeverage = false,
                .fetchLeverageTiers = true,
                .fetchMarketLeverageTiers = ExchangeAPIOrEmulated::EMULATED,
                .fetchMarkets = true,
                .fetchMarkOHLCV = true,
                .fetchMyTrades = true,
                .fetchOHLCV = true,
                .fetchOpenInterest = true,
                .fetchOpenInterestHistory = true,            
                .fetchOpenOrder = false,
                .fetchOpenOrders = true,
                .fetchOrder = true,
                .fetchOrderBook = true,
                .fetchOrderBooks = false,
                .fetchOrders = true,
                .fetchOrderTrades = true,
                .fetchPosition = false,
                .fetchPositions = true,
                .fetchPositionsRisk = true,
                .fetchPremiumIndexOHLCV = false,
                .fetchSettlementHistory = true,
                .fetchStatus = ExchangeAPIOrEmulated::TRUE,
                .fetchTicker = true,
                .fetchTickers = true,
                .fetchTime = true,
                .fetchTrades = true,
                .fetchTradingFee = true,
                .fetchTradingFees = true,
                .fetchTradingLimits = false,
                .fetchTransactionFee = false,
                .fetchTransactionFees = true,
                .fetchTransactions = false,
                .fetchTransfers =true,
                .fetchWithdrawal = false,
                .fetchWithdrawals = true,
                .fetchWithdrawalWhitelist = false,
                .reduceMargin =  true,
                .repayMargin = true,
                .setLeverage = true,
                .setMargin = false,
                .setMarginMode = true,
                .setPositionMode = true,
                .signIn = false,
                .transfer = true,
                .withdraw= true
            },
            {  // timeframes
                {"1s", "1s"}, // spot only for now
                {"1m", "1m"},
                {"3m", "3m"},
                {"5m", "5m"},
                {"15m", "15m"},
                {"30m", "30m"},
                {"1h", "1h"},
                {"2h", "2h"},
                {"4h", "4h"},
                {"6h", "6h"},
                {"8h", "8h"},
                {"12h", "12h"},
                {"1d", "1d"},
                {"3d", "3d"},
                {"1w", "1w"},
                {"1M", "1M"}
            },
            {  // urls
                .logo = "https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg",
                .test = {
                    {"dapiPublic", "https://testnet.binancefuture.com/dapi/v1"},
                    {"dapiPrivate", "https://testnet.binancefuture.com/dapi/v1"},
                    {"dapiPrivateV2", "https://testnet.binancefuture.com/dapi/v2"},
                    {"fapiPublic", "https://testnet.binancefuture.com/fapi/v1"},
                    {"fapiPrivate", "https://testnet.binancefuture.com/fapi/v1"},
                    {"fapiPrivateV2", "https://testnet.binancefuture.com/fapi/v2"},
                    {"public", "https://testnet.binance.vision/api/v3"},
                    {"private", "https://testnet.binance.vision/api/v3"},
                    {"v1", "https://testnet.binance.vision/api/v1"}
                },
                .api = {
                    {"wapi", "https://api.binance.com/wapi/v3"},
                    {"sapi", "https://api.binance.com/sapi/v1"},
                    {"sapiV2", "https://api.binance.com/sapi/v2"},
                    {"sapiV3", "https://api.binance.com/sapi/v3"},
                    {"sapiV4", "https://api.binance.com/sapi/v4"},
                    {"dapiPublic", "https://dapi.binance.com/dapi/v1"},
                    {"dapiPrivate", "https://dapi.binance.com/dapi/v1"},
                    {"eapiPublic", "https://eapi.binance.com/eapi/v1"},
                    {"eapiPublic", "https://eapi.binance.com/eapi/v1"},
                    {"dapiPrivateV2", "https://dapi.binance.com/dapi/v2"},
                    {"dapiData", "https://dapi.binance.com/futures/data"},
                    {"fapiPublic", "https://fapi.binance.com/fapi/v1"},
                    {"fapiPrivate", "https://fapi.binance.com/fapi/v1"},
                    {"fapiData", "https://fapi.binance.com/futures/data"},
                    {"fapiPrivateV2", "https://fapi.binance.com/fapi/v2"},
                    {"public", "https://api.binance.com/api/v3"},
                    {"private", "https://api.binance.com/api/v3"},
                    {"v1", "https://api.binance.com/api/v1"}
                },
                .www = "https://www.binance.com",
                .referral = {
                    {"ur", "https://accounts.binance.com/en/register?ref=D7YA7CLY"},
                    {"discount", "0.1"}
                },
                .doc = {"https://binance-docs.github.io/apidocs/spot/en"},
                .api_management = "https://www.binance.com/en/usercenter/settings/api-management",
                .fees = "https://www.binance.com/en/fee/schedule"
            },
            // api
            R"(
                                {
                    "api" : {
                        "sapi" : {
                            "get" : {
                                "system/status" : 0.1,
                                "accountSnapshot" : 240,
                                "margin/asset" : 1,
                                "margin/pair" : 1,
                                "margin/allAssets" : 0.1,
                                "margin/allPairs" : 0.1,
                                "margin/priceIndex" : 1,
                                "asset/assetDividend" : 1,
                                "asset/dribblet" : 0.1,
                                "asset/transfer" : 0.1,
                                "asset/assetDetail" : 0.1,
                                "asset/tradeFee" : 0.1,
                                "asset/ledger-transfer/cloud-mining/queryByPage" : 4,
                                "margin/loan" : 1,
                                "margin/repay" : 1,
                                "margin/account" : 1,
                                "margin/transfer" : 0.1,
                                "margin/interestHistory" : 0.1,
                                "margin/forceLiquidationRec" : 0.1,
                                "margin/order" : 1,
                                "margin/openOrders" : 1,
                                "margin/allOrders" : 20,
                                "margin/myTrades" : 1,
                                "margin/maxBorrowable" : 5,
                                "margin/maxTransferable" : 5,
                                "margin/tradeCoeff" : 1,
                                "margin/isolated/transfer" : 0.1,
                                "margin/isolated/account" : 1,
                                "margin/isolated/pair" : 1,
                                "margin/isolated/allPairs" : 1,
                                "margin/isolated/accountLimit" : 0.1,
                                "margin/interestRateHistory" : 0.1,
                                "margin/orderList" : 1,
                                "margin/allOrderList" : 20,
                                "margin/openOrderList" : 1,
                                "margin/crossMarginData" : {"cost" : 0.1, "noCoin" : 0.5 },
                                "margin/isolatedMarginData" : {"cost" : 0.1, "noCoin" : 1 },
                                "margin/isolatedMarginTier" : 0.1,
                                "margin/rateLimit/order" : 2,
                                "margin/dribblet" : 0.1,
                                "margin/crossMarginCollateralRatio" : 10,
                                "margin/exchange-small-liability" : 0.6667,
                                "margin/exchange-small-liability-history" : 0.6667,
                                "margin/next-hourly-interest-rate" : 0.6667,
                                "loan/income" : 40,
                                "loan/ongoing/orders" : 40,
                                "loan/ltv/adjustment/history" : 40,
                                "loan/borrow/history" : 40,
                                "loan/repay/history" : 40,
                                "loan/loanable/data" : 40,
                                "loan/collateral/data" : 40,
                                "loan/repay/collateral/rate" : 600,
                                "loan/vip/ongoing/orders" : 40,
                                "loan/vip/repay/history" : 40,
                                "loan/vip/collateral/account" : 600,
                                "fiat/orders" : 600.03,
                                "fiat/payments" : 0.1,
                                "futures/transfer" : 1,
                                "futures/loan/borrow/history" : 1,
                                "futures/loan/repay/history" : 1,
                                "futures/loan/wallet" : 1,
                                "futures/loan/adjustCollateral/history" : 1,
                                "futures/loan/liquidationHistory" : 1,
                                "rebate/taxQuery" : 20.001,
                                "capital/config/getall" : 1,
                                "capital/deposit/address" : 1,
                                "capital/deposit/hisrec" : 0.1,
                                "capital/deposit/subAddress" : 0.1,
                                "capital/deposit/subHisrec" : 0.1,
                                "capital/withdraw/history" : 0.1,
                                "capital/contract/convertible-coins" : 4.0002,
                                "convert/tradeFlow" : 0.6667,
                                "convert/exchangeInfo" : 50,
                                "convert/assetInfo" : 10,
                                "convert/orderStatus" : 0.6667,
                                "account/status" : 0.1,
                                "account/apiTradingStatus" : 0.1,
                                "account/apiRestrictions/ipRestriction" : 0.1,
                                "bnbBurn" : 0.1,                                
                                "sub-account/futures/account" : 1,
                                "sub-account/futures/accountSummary" : 0.1,
                                "sub-account/futures/positionRisk" : 1,
                                "sub-account/futures/internalTransfer" : 0.1,
                                "sub-account/list" : 0.1,
                                "sub-account/margin/account" : 1,
                                "sub-account/margin/accountSummary" : 1,
                                "sub-account/spotSummary" : 0.1,
                                "sub-account/status" : 1,
                                "sub-account/sub/transfer/history" : 0.1,
                                "sub-account/transfer/subUserHistory" : 0.1,
                                "sub-account/universalTransfer" : 0.1,
                                "sub-account/apiRestrictions/ipRestriction/thirdPartyList" : 1,
                                "managed-subaccount/asset" : 0.1,
                                "managed-subaccount/accountSnapshot" : 240,
                                "managed-subaccount/queryTransLogForInvestor" : 0.1,
                                "managed-subaccount/queryTransLogForTradeParent" : 0.1,
                                "managed-subaccount/fetch-future-asset" : 0.1,
                                "managed-subaccount/marginAsset" : 0.1,
                                "lending/daily/product/list" : 0.1,
                                "lending/daily/userLeftQuota" : 0.1,
                                "lending/daily/userRedemptionQuota" : 0.1,
                                "lending/daily/token/position" : 0.1,
                                "lending/union/account" : 0.1,
                                "lending/union/purchaseRecord" : 0.1,
                                "lending/union/redemptionRecord" : 0.1,
                                "lending/union/interestHistory" : 0.1,
                                "lending/project/list" : 0.1,
                                "lending/project/position/list" : 0.1,
                                "mining/pub/algoList" : 0.1,
                                "mining/pub/coinList" : 0.1,
                                "mining/worker/detail" : 0.5,
                                "mining/worker/list" : 0.5,
                                "mining/payment/list" : 0.5,
                                "mining/statistics/user/status" : 0.5,
                                "mining/statistics/user/list" : 0.5,
                                "mining/payment/uid" : 0.5,
                                "bswap/pools" : 0.1,
                                "bswap/liquidity" : {"cost" : 0.1, "noPoolId" : 1 },
                                "bswap/liquidityOps" : 20.001,
                                "bswap/quote" : 1.00005,
                                "bswap/swap" : 20.001,
                                "bswap/poolConfigure" : 1.00005,
                                "bswap/addLiquidityPreview" : 1.00005,
                                "bswap/removeLiquidityPreview" : 1.00005,
                                "bswap/unclaimedRewards" : 6.667,
                                "bswap/claimedHistory" : 6.667,
                                "blvt/tokenInfo" : 0.1,
                                "blvt/subscribe/record" : 0.1,
                                "blvt/redeem/record" : 0.1,
                                "blvt/userLimit" : 0.1,
                                "apiReferral/ifNewUser" : 1,
                                "apiReferral/customization" : 1,
                                "apiReferral/userCustomization" : 1,
                                "apiReferral/rebate/recentRecord" : 1,
                                "apiReferral/rebate/historicalRecord" : 1,
                                "apiReferral/kickback/recentRecord" : 1,
                                "apiReferral/kickback/historicalRecord" : 1,
                                "broker/subAccountApi" : 1,
                                "broker/subAccount" : 1,
                                "broker/subAccountApi/commission/futures" : 1,
                                "broker/subAccountApi/commission/coinFutures" : 1,
                                "broker/info" : 1,
                                "broker/transfer" : 1,
                                "broker/transfer/futures" : 1,
                                "broker/rebate/recentRecord" : 1,
                                "broker/rebate/historicalRecord" : 1,
                                "broker/subAccount/bnbBurn/status" : 1,
                                "broker/subAccount/depositHist" : 1,
                                "broker/subAccount/spotSummary" : 1,
                                "broker/subAccount/marginSummary" : 1,
                                "broker/subAccount/futuresSummary" : 1,
                                "broker/rebate/futures/recentRecord" : 1,
                                "broker/subAccountApi/ipRestriction" : 1,
                                "broker/universalTransfer" : 1,
                                "account/apiRestrictions" : 0.1,
                                "c2c/orderMatch/listUserOrderHistory" : 0.1,
                                "nft/history/transactions" : 20.001,
                                "nft/history/deposit" : 20.001,
                                "nft/history/withdraw" : 20.001,
                                "nft/user/getAsset" : 20.001,
                                "pay/transactions" : 20.001,
                                "giftcard/verify" : 0.1,
                                "giftcard/cryptography/rsa-public-key" : 0.1,
                                "giftcard/buyCode/token-limit" : 0.1,
                                "algo/futures/openOrders" : 0.1,
                                "algo/futures/historicalOrders" : 0.1,
                                "algo/futures/subOrders" : 0.1,
                                "portfolio/account" : 0.1,
                                "portfolio/collateralRate" : 5,
                                "portfolio/pmLoan" : 3.3335,
                                "portfolio/interest-history" : 0.6667,
                                "portfolio/interest-rate" : 0.6667,
                                "staking/productList" : 0.1,
                                "staking/position" : 0.1,
                                "staking/stakingRecord" : 0.1,
                                "staking/personalLeftQuota" : 0.1
                            },
                            "post" : {
                                "asset/dust" : 1,
                                "asset/dust-btc" : 0.1,
                                "asset/transfer" : 0.1,
                                "asset/get-funding-asset" : 0.1,
                                "asset/convert-transfer" : 0.033335,
                                "asset/convert-transfer/queryByPage" : 0.033335,
                                "account/disableFastWithdrawSwitch" : 0.1,
                                "account/enableFastWithdrawSwitch" : 0.1,                                
                                "capital/withdraw/apply" : 4.0002,
                                "capital/contract/convertible-coins" : 4.0002,
                                "margin/transfer" : 1,
                                "margin/loan" : 20.001,
                                "margin/repay" : 20.001,
                                "margin/order" : 0.040002,
                                "margin/order/oco" : 0.040002,
                                "margin/exchange-small-liability" : 20.001,
                                "margin/isolated/transfer" : 4.0002,
                                "margin/isolated/account" : 2.0001,
                                "bnbBurn" : 0.1,
                                "sub-account/virtualSubAccount" : 0.1,
                                "sub-account/margin/transfer" : 4.0002,
                                "sub-account/margin/enable" : 0.1,
                                "sub-account/futures/enable" : 0.1,
                                "sub-account/futures/transfer" : 0.1,
                                "sub-account/futures/internalTransfer" : 0.1,
                                "sub-account/transfer/subToSub" : 0.1,
                                "sub-account/transfer/subToMaster" : 0.1,
                                "sub-account/universalTransfer" : 0.1,
                                "managed-subaccount/deposit" : 0.1,
                                "managed-subaccount/withdraw" : 0.1,
                                "userDataStream" : 0.1,
                                "userDataStream/isolated" : 0.1,
                                "futures/transfer" : 0.1,
                                "lending/customizedFixed/purchase" : 0.1,
                                "lending/daily/purchase" : 0.1,
                                "lending/daily/redeem" : 0.1,
                                "bswap/liquidityAdd" : 60,
                                "bswap/liquidityRemove" : 60,
                                "bswap/swap" : 60,
                                "bswap/claimRewards" : 6.667,
                                "blvt/subscribe" : 0.1,
                                "blvt/redeem" : 0.1,
                                "apiReferral/customization" : 1,
                                "apiReferral/userCustomization" : 1,
                                "apiReferral/rebate/historicalRecord" : 1,
                                "apiReferral/kickback/historicalRecord" : 1,
                                "broker/subAccount" : 1,
                                "broker/subAccount/margin" : 1,
                                "broker/subAccount/futures" : 1,
                                "broker/subAccountApi" : 1,
                                "broker/subAccountApi/permission" : 1,
                                "broker/subAccountApi/commission" : 1,
                                "broker/subAccountApi/commission/futures" : 1,
                                "broker/subAccountApi/commission/coinFutures" : 1,
                                "broker/transfer" : 1,
                                "broker/transfer/futures" : 1,
                                "broker/rebate/historicalRecord" : 1,
                                "broker/subAccount/bnbBurn/spot" : 1,
                                "broker/subAccount/bnbBurn/marginInterest" : 1,
                                "broker/subAccount/blvt" : 1,
                                "broker/subAccountApi/ipRestriction" : 1,
                                "broker/subAccountApi/ipRestriction/ipList" : 1,
                                "broker/universalTransfer" : 1,
                                "broker/subAccountApi/permission/universalTransfer" : 1,
                                "broker/subAccountApi/permission/vanillaOptions" : 1,
                                "giftcard/createCode" : 0.1,
                                "giftcard/redeemCode" : 0.1,
                                "giftcard/buyCode" : 0.1,
                                "algo/futures/newOrderVp" : 20.001,
                                "algo/futures/newOrderTwap" : 20.001,
                                "staking/purchase" : 0.1,
                                "staking/redeem" : 0.1,
                                "staking/setAutoStaking" : 0.1,
                                "portfolio/repay" : 20.001,
                                "loan/borrow" : 40,
                                "loan/repay" : 40,
                                "loan/adjust/ltv" : 40,
                                "loan/customize/margin_call" : 40,
                                "loan/vip/repay" : 40,
                                "convert/getQuote" : 20.001,
                                "convert/acceptQuote" : 3.3335
                            }
                        },
                        "put" : {
                            "userDataStream" : 0.1,
                            "userDataStream/isolated" : 0.1
                        },
                        "delete" : {                        
                            "margin/openOrders" : 0.1,
                            "margin/order" : 0.0066667,
                            "margin/orderList" : 0.0066667,
                            "margin/isolated/account" : 2.0001,
                            "userDataStream" : 0.1,
                            "userDataStream/isolated" : 0.1,                            
                            "broker/subAccountApi" : 1,
                            "broker/subAccountApi/ipRestriction/ipList" : 1,
                            "algo/futures/order" : 0.1
                        }
                    },
                    "sapiV2" : {
                        "get": {
                            "sub-account/futures/account": 0.1,
                            "sub-account/futures/positionRisk": 0.1
                        }
                    },
                    "sapiV3": {
                        "get": {
                            "sub-account/assets": 1
                        },
                        "post": {
                            "asset/getUserAsset": 0.5
                        }
                    },
                    "sapiV4": {
                        "get": {
                            "sub-account/assets": 1
                        }
                    },                    
                    "dapiPublic": {
                        "get": {
                            "ping": 1,
                            "time": 1,
                            "exchangeInfo": 1,
                            "depth": { "cost": 2, "byLimit": [[50, 2], [100, 5], [500, 10], [1000, 20]] },
                            "trades": 5,
                            "historicalTrades": 20,
                            "aggTrades": 20,
                            "premiumIndex": 10,
                            "fundingRate": 1,
                            "klines": { "cost": 1, "byLimit": [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                            "continuousKlines": { "cost": 1, "byLimit": [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                            "indexPriceKlines": { "cost": 1, "byLimit": [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                            "markPriceKlines": { "cost": 1, "byLimit": [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                            "ticker/24hr": { "cost": 1, "noSymbol": 40 },
                            "ticker/price": { "cost": 1, "noSymbol": 2 },
                            "ticker/bookTicker": { "cost": 1, "noSymbol": 2 },
                            "openInterest": 1,
                            "pmExchangeInfo": 1
                        }
                    },
                    "dapiData": {
                        "get": {
                            "openInterestHist": 1,
                            "topLongShortAccountRatio": 1,
                            "topLongShortPositionRatio": 1,
                            "globalLongShortAccountRatio": 1,
                            "takerBuySellVol": 1,
                            "basis": 1
                        }
                    },
                    "dapiPrivate": {
                        "get": {
                            "positionSide/dual": 30,
                            "order": 1,
                            "openOrder": 1,
                            "openOrders": { "cost": 1, "noSymbol": 5 },
                            "allOrders": { "cost": 20, "noSymbol": 40 },
                            "balance": 1,
                            "account": 5,
                            "positionMargin/history": 1,
                            "positionRisk": 1,
                            "userTrades": { "cost": 20, "noSymbol": 40 },
                            "income": 20,
                            "leverageBracket": 1,
                            "forceOrders": { "cost": 20, "noSymbol": 50 },
                            "adlQuantile": 5,
                            "orderAmendment": 1,
                            "pmAccountInfo": 5
                        },
                        "post": {
                            "positionSide/dual": 1,
                            "order": 4,
                            "batchOrders": 5,
                            "countdownCancelAll": 10,
                            "leverage": 1,
                            "marginType": 1,
                            "positionMargin": 1,
                            "listenKey": 1
                        },
                        "put": {
                            "listenKey": 1,
                            "order": 1,
                            "batchOrders": 5
                        },
                        "delete": {
                            "order": 1,
                            "allOpenOrders": 1,
                            "batchOrders": 5,
                            "listenKey": 1
                        }
                    },
                    "dapiPrivateV2": {
                        "get": {
                            "leverageBracket": 1
                        }
                    },
                    "fapiPublic": {
                        "get": {
                            "ping": 1,
                            "time": 1,
                            "exchangeInfo": 1,
                            "depth": { "cost": 2, "byLimit": [[50, 2], [100, 5], [500, 10], [1000, 20]] },
                            "trades": 5,
                            "historicalTrades": 20,
                            "aggTrades": 20,
                            "klines": { "cost": 1, "byLimit": [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                            "continuousKlines": { "cost": 1, "byLimit": [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                            "markPriceKlines": { "cost": 1, "byLimit": [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                            "indexPriceKlines": { "cost": 1, "byLimit": [[99, 1], [499, 2], [1000, 5], [10000, 10]] },
                            "fundingRate": 1,
                            "premiumIndex": 1,
                            "ticker/24hr": { "cost": 1, "noSymbol": 40 },
                            "ticker/price": { "cost": 1, "noSymbol": 2 },
                            "ticker/bookTicker": { "cost": 1, "noSymbol": 2 },
                            "openInterest": 1,
                            "indexInfo": 1,
                            "apiTradingStatus": { "cost": 1, "noSymbol": 10 },
                            "lvtKlines": 1,
                            "pmExchangeInfo": 1
                        }
                    },
                    "fapiData": {
                        "get": {
                            "openInterestHist": 1,
                            "topLongShortAccountRatio": 1,
                            "topLongShortPositionRatio": 1,
                            "globalLongShortAccountRatio": 1,
                            "takerlongshortRatio": 1
                        }
                    },
                    "fapiPrivate": {
                        "get": {
                            "forceOrders": { "cost": 20, "noSymbol": 50 },
                            "allOrders": 5,
                            "openOrder": 1,
                            "openOrders": 1,
                            "order": 1,
                            "account": 5,
                            "balance": 5,
                            "leverageBracket": 1,
                            "positionMargin/history": 1,
                            "positionRisk": 5,
                            "positionSide/dual": 30,
                            "userTrades": 5,
                            "income": 30,
                            "commissionRate": 20,
                            "apiTradingStatus": 1,
                            "multiAssetsMargin": 30,                         
                            "apiReferral/ifNewUser": 1,
                            "apiReferral/customization": 1,
                            "apiReferral/userCustomization": 1,
                            "apiReferral/traderNum": 1,
                            "apiReferral/overview": 1,
                            "apiReferral/tradeVol": 1,
                            "apiReferral/rebateVol": 1,
                            "apiReferral/traderSummary": 1,
                            "adlQuantile": 5,
                            "pmAccountInfo": 5
                        },
                        "post": {
                            "batchOrders": 5,
                            "positionSide/dual": 1,
                            "positionMargin": 1,
                            "marginType": 1,
                            "order": 4,
                            "leverage": 1,
                            "listenKey": 1,
                            "countdownCancelAll": 10,
                            "multiAssetsMargin": 1,
                            "apiReferral/customization": 1,
                            "apiReferral/userCustomization": 1
                        },
                        "put": {
                            "listenKey": 1
                        },
                        "delete": {
                            "batchOrders": 1,
                            "order": 1,
                            "allOpenOrders": 1,
                            "listenKey": 1
                        }
                    },
                    "fapiPrivateV2": {
                        "get": {
                            "account": 1,
                            "balance": 1,
                            "positionRisk": 1
                        }
                    },
                    "eapiPublic": {
                        "get": {
                            "ping": 1,
                            "time": 1,
                            "exchangeInfo": 1,
                            "index": 1,
                            "ticker": 5,
                            "mark": 5,
                            "depth": 1,
                            "klines": 1,
                            "trades": 5,
                            "historicalTrades": 20,
                            "exerciseHistory": 3,
                            "openInterest": 3
                        }
                    },
                    "eapiPrivate": {
                        "get": {
                            "account": 3,
                            "position": 5,
                            "openOrders": { "cost": 1, "noSymbol": 40 },
                            "historyOrders": 3,
                            "userTrades": 5,
                            "exerciseRecord": 5,
                            "bill": 1,
                            "marginAccount": 3,
                            "mmp": 1,
                            "countdownCancelAll": 1,
                            "order": 1
                        },
                        "post": {
                            "order": 1,
                            "batchOrders": 5,
                            "listenKey": 1,
                            "mmpSet": 1,
                            "mmpReset": 1,
                            "countdownCancelAll": 1,
                            "countdownCancelAllHeartBeat": 10
                        },
                        "put": {
                            "listenKey": 1
                        },
                        "delete": {
                            "order": 1,
                            "batchOrders": 1,
                            "allOpenOrders": 1,
                            "allOpenOrdersByUnderlying": 1,
                            "listenKey": 1
                        }
                    },
                    "public": {
                        "get": {
                            "ping": 1,
                            "time": 1,
                            "depth": { "cost": 1, "byLimit": [[100, 1], [500, 5], [1000, 10], [5000, 50]] },
                            "trades": 1,
                            "aggTrades": 1,
                            "historicalTrades": 5,
                            "klines": 1,
                            "ticker/24hr": { "cost": 1, "noSymbol": 40 },
                            "ticker/price": { "cost": 1, "noSymbol": 2 },
                            "ticker/bookTicker": { "cost": 1, "noSymbol": 2 },
                            "exchangeInfo": 10
                        },
                        "put": {
                            "userDataStream": 1
                        },
                        "post": {
                            "userDataStream": 1
                        },
                        "delete": {
                            "userDataStream": 1
                        }
                    },
                    "private": {
                        "get": {
                            "allOrderList": 10,
                            "openOrderList": 3,
                            "orderList": 2,
                            "order": 2,
                            "openOrders": { "cost": 3, "noSymbol": 40 },
                            "allOrders": 10,
                            "account": 10,
                            "myTrades": 10,
                            "rateLimit/order": 20,
                            "myPreventedMatches": 1
                        },
                        "post": {
                            "order/oco": 1,
                            "order": 1,
                            "order/cancelReplace": 1,
                            "order/test": 1
                        },
                        "delete": {
                            "openOrders": 1,
                            "orderList": 1,
                            "order": 1
                        }
                    }
                }               

            )"_json,
            // commonCurrencies
            {
                {"BCC", "BCC"},
                {"YOYO", "YOYOW"},
            },
            // precisionMode
            DigitsCountingMode::DECIMAL_PLACES
        )
    {
    };

    long binance::fetchTime()
    {
        //
        //
        // {"serverTime":1680500475840}
        //
        //
        MarketType type{MarketType::SPOT};
        std::string hostname{"api.binance.com"};
        std::string uri{"/api/v3/time"};
        if (isLinear(type)) {
            std::string hostname{"fapi.binance.com"};
            std::string uri{"/fapi/v1/time"};
        }
        else if (isInverse(type)) {
            std::string hostname{"dapi.binance.com"};
            std::string uri{"/dapi/v1/time"};
        }

        boost::beast::http::response<boost::beast::http::string_body> response = fetch(hostname, uri);
        try {
            auto epoch_seconds = json::parse(response.body())["serverTime"].get<long>();
            return epoch_seconds;
        }
        catch (const std::exception& e) {
            PLOGE << e.what();
            return std::numeric_limits<long>::min();
        }
    }

    bool binance::isInverse(const MarketType type, const std::string& subType)
    {
        if (subType.size() == 0) {
            return type == MarketType::DELIVERY;
        }
        else {
            return subType == "inverse";
        }
    }

    bool binance::isLinear(const MarketType type, const std::string& subType)
    {
        if (subType.size() == 0) {
            return (type == MarketType::FUTURE) || (type == MarketType::SWAP);
        }
        else {
            return subType == "linear";
        }
    }

    void binance::setSandboxMode(bool enabled)
    {
        Exchange::setSandboxMode(enabled);
        _sandboxMode = enabled;
    }

    long binance::convertExpireDate(const std::string& d) const
    {
        std::chrono::system_clock::time_point tp;
        std::istringstream ss{ d };
        ss >> date::parse("%F", tp);        
        long ts = (std::chrono::time_point_cast<std::chrono::milliseconds>(tp)
            .time_since_epoch() /
            std::chrono::milliseconds(1));        

        return ts;
    }

    Market binance::createExpiredOptionMarket(const std::string& symbol)
    {
        // Symbol format:
        // base + '/' + settle + ':' + settle + '-' + expiry + '-' + strikeAsString + '-' + optionType

        std::string sym{symbol};
        const std::string settle{"USDT"};
        const std::string optionPart0 = sym.substr(0, symbol.find("-"));
        const std::string optionPart1 = sym.erase(0, sym.find("-") + 1);
        const std::string optionPart2 = sym.erase(0, sym.find("-") + 1);
        const std::string optionPart3 = sym;
        const std::string symbolBase0 = symbol.substr(0, symbol.find("/"));
        std::string base;
        if (symbol.find("/") != std::string::npos) {
            base = safeString(symbolBase0);
        }
        else {
            base = safeString(optionPart0);
        }
        std::string expiry = safeString(optionPart1); 
        double strike = safeDouble(optionPart2);
        std::string strikeAsString = safeString(optionPart2);
        std::string optionType = safeString(optionPart3);
        long datetime = convertExpireDate(expiry);
        long timestamp = datetime;
        Market market;
        market.id = base + "-" + expiry + "-" + strikeAsString + "-" + optionType;
        market.symbol = base + "/" + settle + ":" + settle + "-" + expiry + "-" + strikeAsString + "-" + optionType;
        market.base = base;
        market.quote =  settle;
        market.baseId = base;
        market.quoteId = settle;
        market.type = MarketType::OPTION;
        market.spot = false;
        market.swap = false;
        market.future = false;
        market.option = true;
        market.margin = false;
        market.contract = true;
        market.expiry = timestamp;
        market.expiryDatetime = datetime;
        market.optionType = (optionType == "C") ? OptionType::CALL : OptionType::PUT;
        market.strike = strike;
        market.settle = settle;
        market.settleId = settle;                
        
        return market;
    }

    Market binance::market(const std::string& symbol)
    {
        if (_markets.size() == 0) {
            throw ExchangeError(fmt::format("{} markets not loaded", _id));
        }

        // defaultType has legacy support on binance
        MarketType defaultType{_defaultType}; // spot
        if (symbol.size() != 0) {
            if (_markets[defaultType].contains(symbol)) {
                const Market& market = _markets[defaultType][symbol];
                return market;
            }
            else if (_markets_by_id[defaultType].contains(symbol)) {
                const Market& market = _markets_by_id[defaultType][symbol];
                return market;                
            }
            else if ((symbol.find("/") != std::string::npos) && (symbol.find(":") == std::string::npos)) {
                // support legacy symbols
                std::string sym{symbol};
                const std::string base = sym.substr(0, sym.find("/"));
                const std::string quote = sym.erase(0, sym.find("/") + 1);
                const std::string settle = (quote == "USD") ? base : quote;
                const std::string futuresSymbol = symbol + ':' + settle;
                if (_markets[MarketType::FUTURE].contains(futuresSymbol)) {
                    return _markets[MarketType::FUTURE][futuresSymbol];
                }
            }
            else if ((symbol.find("-C") != std::string::npos) || (symbol.find("-P") != std::string::npos)) { // both exchange-id and unified symbols are supported this way regardless of the defaultType
                return createExpiredOptionMarket(symbol);
            }
        }
        throw BadSymbol(fmt::format("{} does not have market symbol {}", _id, symbol));
    }

} // namespace ccxt
