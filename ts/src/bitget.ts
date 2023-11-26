
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bitget.js';
import { ExchangeError, ExchangeNotAvailable, NotSupported, OnMaintenance, ArgumentsRequired, BadRequest, AccountSuspended, InvalidAddress, PermissionDenied, DDoSProtection, InsufficientFunds, InvalidNonce, CancelPending, InvalidOrder, OrderNotFound, AuthenticationError, RequestTimeout, BadSymbol, RateLimitExceeded } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Int, OrderSide, OrderType, Trade, OHLCV, Order, FundingRateHistory, OrderRequest, FundingHistory, Balances, Str, Transaction, Ticker, OrderBook, Tickers, Market, Strings, Currency } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class bitget
 * @extends Exchange
 */
export default class bitget extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitget',
            'name': 'Bitget',
            'countries': [ 'SG' ],
            'version': 'v1',
            'rateLimit': 50, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
            'certified': true,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': true,
                'borrowCrossMargin': true,
                'borrowIsolatedMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'createOrders': true,
                'createReduceOnlyOrder': false,
                'editOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': true,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': true,
                'fetchIsolatedBorrowRate': true,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginMode': undefined,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyLiquidations': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransfer': false,
                'fetchTransfers': true,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'repayCrossMargin': true,
                'repayIsolatedMargin': true,
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': true,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1m',
            },
            'hostname': 'bitget.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/195989417-4253ddb0-afbe-4a1c-9dea-9dbcd121fa5d.jpg',
                'api': {
                    'spot': 'https://api.{hostname}',
                    'mix': 'https://api.{hostname}',
                    'user': 'https://api.{hostname}',
                    'p2p': 'https://api.{hostname}',
                    'broker': 'https://api.{hostname}',
                    'margin': 'https://api.{hostname}',
                    'common': 'https://api.{hostname}',
                    'tax': 'https://api.{hostname}',
                    'convert': 'https://api.{hostname}',
                    'copy': 'https://api.{hostname}',
                    'earn': 'https://api.{hostname}',
                },
                'www': 'https://www.bitget.com',
                'doc': [
                    'https://www.bitget.com/api-doc/common/intro',
                    'https://www.bitget.com/api-doc/spot/intro',
                    'https://www.bitget.com/api-doc/contract/intro',
                    'https://www.bitget.com/api-doc/broker/intro',
                    'https://www.bitget.com/api-doc/margin/intro',
                    'https://www.bitget.com/api-doc/copytrading/intro',
                    'https://www.bitget.com/api-doc/earn/intro',
                    'https://bitgetlimited.github.io/apidoc/en/mix',
                    'https://bitgetlimited.github.io/apidoc/en/spot',
                    'https://bitgetlimited.github.io/apidoc/en/broker',
                    'https://bitgetlimited.github.io/apidoc/en/margin',
                ],
                'fees': 'https://www.bitget.cc/zh-CN/rate?tab=1',
                'referral': 'https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j',
            },
            'api': {
                'public': {
                    'common': {
                        'get': {
                            'v2/public/annoucements': 1,
                            'v2/public/time': 1,
                            'v2/common/trade-rate': 2,
                        },
                    },
                    'spot': {
                        'get': {
                            'spot/v1/notice/queryAllNotices': 1, // 20 times/1s (IP) => 20/20 = 1
                            'spot/v1/public/time': 1,
                            'spot/v1/public/currencies': 6.6667, // 3 times/1s (IP) => 20/3 = 6.6667
                            'spot/v1/public/products': 1,
                            'spot/v1/public/product': 1,
                            'spot/v1/market/ticker': 1,
                            'spot/v1/market/tickers': 1,
                            'spot/v1/market/fills': 2, // 10 times/1s (IP) => 20/10 = 2
                            'spot/v1/market/fills-history': 2,
                            'spot/v1/market/candles': 1,
                            'spot/v1/market/depth': 1,
                            'spot/v1/market/spot-vip-level': 2,
                            'spot/v1/market/merge-depth': 1,
                            'spot/v1/market/history-candles': 1,
                            'spot/v1/public/loan/coinInfos': 2, // 10 times/1s (IP) => 20/10 = 2
                            'spot/v1/public/loan/hour-interest': 2, // 10 times/1s (IP) => 20/10 = 2
                            'v2/spot/public/coins': 6.6667,
                            'v2/spot/public/symbols': 1,
                            'v2/spot/market/vip-fee-rate': 2,
                            'v2/spot/market/tickers': 1,
                            'v2/spot/market/merge-depth': 1,
                            'v2/spot/market/orderbook': 1,
                            'v2/spot/market/candles': 1,
                            'v2/spot/market/history-candles': 1,
                            'v2/spot/market/fills': 2,
                            'v2/spot/market/fills-history': 2,
                        },
                    },
                    'mix': {
                        'get': {
                            'mix/v1/market/contracts': 1,
                            'mix/v1/market/depth': 1,
                            'mix/v1/market/ticker': 1,
                            'mix/v1/market/tickers': 1,
                            'mix/v1/market/contract-vip-level': 2,
                            'mix/v1/market/fills': 1,
                            'mix/v1/market/fills-history': 2,
                            'mix/v1/market/candles': 1,
                            'mix/v1/market/index': 1,
                            'mix/v1/market/funding-time': 1,
                            'mix/v1/market/history-fundRate': 1,
                            'mix/v1/market/current-fundRate': 1,
                            'mix/v1/market/open-interest': 1,
                            'mix/v1/market/mark-price': 1,
                            'mix/v1/market/symbol-leverage': 1,
                            'mix/v1/market/queryPositionLever': 1,
                            'mix/v1/market/open-limit': 1,
                            'mix/v1/market/history-candles': 1,
                            'mix/v1/market/history-index-candles': 1,
                            'mix/v1/market/history-mark-candles': 1,
                            'mix/v1/market/merge-depth': 1,
                            'v2/mix/market/vip-fee-rate': 2,
                            'v2/mix/market/merge-depth': 1,
                            'v2/mix/market/ticker': 1,
                            'v2/mix/market/tickers': 1,
                            'v2/mix/market/fills': 1,
                            'v2/mix/market/fills-history': 2,
                            'v2/mix/market/candles': 1,
                            'v2/mix/market/history-candles': 1,
                            'v2/mix/market/history-index-candles': 1,
                            'v2/mix/market/history-mark-candles': 1,
                            'v2/mix/market/open-interest': 1,
                            'v2/mix/market/funding-time': 1,
                            'v2/mix/market/symbol-price': 1,
                            'v2/mix/market/history-fund-rate': 1,
                            'v2/mix/market/current-fund-rate': 1,
                            'v2/mix/market/contracts': 1,
                            'v2/mix/market/query-position-lever': 2,
                        },
                    },
                    'margin': {
                        'get': {
                            'margin/v1/cross/public/interestRateAndLimit': 2, // 10 times/1s (IP) => 20/10 = 2
                            'margin/v1/isolated/public/interestRateAndLimit': 2, // 10 times/1s (IP) => 20/10 = 2
                            'margin/v1/cross/public/tierData': 2, // 10 times/1s (IP) => 20/10 = 2
                            'margin/v1/isolated/public/tierData': 2, // 10 times/1s (IP) => 20/10 = 2
                            'margin/v1/public/currencies': 1, // 20 times/1s (IP) => 20/20 = 1
                            'v2/margin/currencies': 2,
                        },
                    },
                    'earn': {
                        'get': {
                            'v2/earn/loan/public/coinInfos': 2,
                            'v2/earn/loan/public/hour-interest': 2,
                        },
                    },
                },
                'private': {
                    'spot': {
                        'get': {
                            'spot/v1/wallet/deposit-address': 4,
                            'spot/v1/wallet/withdrawal-list': 1,
                            'spot/v1/wallet/deposit-list': 1,
                            'spot/v1/account/getInfo': 20,
                            'spot/v1/account/assets': 2,
                            'spot/v1/account/assets-lite': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/account/transferRecords': 1, // 20 times/1s (UID) => 20/20 = 1
                            'spot/v1/convert/currencies': 2,
                            'spot/v1/convert/convert-record': 2,
                            'spot/v1/loan/ongoing-orders': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/loan/repay-history': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/loan/revise-history': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/loan/borrow-history': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/loan/debts': 2, // 10 times/1s (UID) => 20/10 = 2
                            'v2/spot/trade/orderInfo': 1,
                            'v2/spot/trade/unfilled-orders': 1,
                            'v2/spot/trade/history-orders': 1,
                            'v2/spot/trade/fills': 2,
                            'v2/spot/trade/current-plan-order': 1,
                            'v2/spot/trade/history-plan-order': 1,
                            'v2/spot/account/info': 20,
                            'v2/spot/account/assets': 2,
                            'v2/spot/account/subaccount-assets': 2,
                            'v2/spot/account/bills': 2,
                            'v2/spot/account/transferRecords': 1,
                            'v2/spot/wallet/deposit-address': 2,
                            'v2/spot/wallet/deposit-records': 2,
                            'v2/spot/wallet/withdrawal-records': 2,
                        },
                        'post': {
                            'spot/v1/wallet/transfer': 4,
                            'spot/v1/wallet/transfer-v2': 4,
                            'spot/v1/wallet/subTransfer': 10,
                            'spot/v1/wallet/withdrawal': 4,
                            'spot/v1/wallet/withdrawal-v2': 4,
                            'spot/v1/wallet/withdrawal-inner': 4,
                            'spot/v1/wallet/withdrawal-inner-v2': 4,
                            'spot/v1/account/sub-account-spot-assets': 200,
                            'spot/v1/account/bills': 2,
                            'spot/v1/trade/orders': 2,
                            'spot/v1/trade/batch-orders': 4,
                            'spot/v1/trade/cancel-order': 2,
                            'spot/v1/trade/cancel-order-v2': 2,
                            'spot/v1/trade/cancel-symbol-order': 2,
                            'spot/v1/trade/cancel-batch-orders': 4,
                            'spot/v1/trade/cancel-batch-orders-v2': 4,
                            'spot/v1/trade/orderInfo': 1,
                            'spot/v1/trade/open-orders': 1,
                            'spot/v1/trade/history': 1,
                            'spot/v1/trade/fills': 1,
                            'spot/v1/plan/placePlan': 1,
                            'spot/v1/plan/modifyPlan': 1,
                            'spot/v1/plan/cancelPlan': 1,
                            'spot/v1/plan/currentPlan': 1,
                            'spot/v1/plan/historyPlan': 1,
                            'spot/v1/plan/batchCancelPlan': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/convert/quoted-price': 4,
                            'spot/v1/convert/trade': 4,
                            'spot/v1/loan/borrow': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/loan/repay': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/loan/revise-pledge': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/order/orderCurrentList': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/order/orderHistoryList': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/order/closeTrackingOrder': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/order/updateTpsl': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/order/followerEndOrder': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/order/spotInfoList': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/config/getTraderSettings': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/config/getFollowerSettings': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/user/myTraders': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/config/setFollowerConfig': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/user/myFollowers': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/config/setProductCode': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/user/removeTrader': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/getRemovableFollower': 2,
                            'spot/v1/trace/user/removeFollower': 2,
                            'spot/v1/trace/profit/totalProfitInfo': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/profit/totalProfitList': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/profit/profitHisList': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/profit/profitHisDetailList': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/profit/waitProfitDetailList': 2, // 10 times/1s (UID) => 20/10 = 2
                            'spot/v1/trace/user/getTraderInfo': 2, // 10 times/1s (UID) => 20/10 = 2
                            'v2/spot/trade/place-order': 2,
                            'v2/spot/trade/cancel-order': 2,
                            'v2/spot/trade/batch-orders': 20,
                            'v2/spot/trade/batch-cancel-order': 2,
                            'v2/spot/trade/cancel-symbol-order': 4,
                            'v2/spot/trade/place-plan-order': 1,
                            'v2/spot/trade/modify-plan-order': 1,
                            'v2/spot/trade/cancel-plan-order': 1,
                            'v2/spot/trade/batch-cancel-plan-order': 2,
                            'v2/spot/wallet/transfer': 2,
                            'v2/spot/wallet/subaccount-transfer': 2,
                            'v2/spot/wallet/withdrawal': 2,
                        },
                    },
                    'mix': {
                        'get': {
                            'mix/v1/account/account': 2,
                            'mix/v1/account/accounts': 2,
                            'mix/v1/position/singlePosition': 2,
                            'mix/v1/position/singlePosition-v2': 2,
                            'mix/v1/position/allPosition': 4, // 5 times/1s (UID) => 20/5 = 4
                            'mix/v1/position/allPosition-v2': 4, // 5 times/1s (UID) => 20/5 = 4
                            'mix/v1/position/history-position': 1,
                            'mix/v1/account/accountBill': 2,
                            'mix/v1/account/accountBusinessBill': 4,
                            'mix/v1/order/current': 1, // 20 times/1s (UID) => 20/20 = 1
                            'mix/v1/order/marginCoinCurrent': 1, // 20 times/1s (UID) => 20/20 = 1
                            'mix/v1/order/history': 2,
                            'mix/v1/order/historyProductType': 4, // 5 times/1s (UID) => 20/5 = 4
                            'mix/v1/order/detail': 2,
                            'mix/v1/order/fills': 2,
                            'mix/v1/order/allFills': 2,
                            'mix/v1/plan/currentPlan': 1, // 20 times/1s (UID) => 20/20 = 1
                            'mix/v1/plan/historyPlan': 2,
                            'mix/v1/trace/currentTrack': 2,
                            'mix/v1/trace/followerOrder': 2,
                            'mix/v1/trace/followerHistoryOrders': 2,
                            'mix/v1/trace/historyTrack': 2,
                            'mix/v1/trace/summary': 1, // 20 times/1s (UID) => 20/20 = 1
                            'mix/v1/trace/profitSettleTokenIdGroup': 1, // 20 times/1s (UID) => 20/20 = 1
                            'mix/v1/trace/profitDateGroupList': 1, // 20 times/1s (UID) => 20/20 = 1
                            'mix/v1/trade/profitDateList': 2,
                            'mix/v1/trace/waitProfitDateList': 1, // 20 times/1s (UID) => 20/20 = 1
                            'mix/v1/trace/traderSymbols': 1, // 20 times/1s (UID) => 20/20 = 1
                            'mix/v1/trace/traderList': 2,
                            'mix/v1/trace/traderDetail': 2, // 10 times/1s (UID) => 20/10 = 2
                            'mix/v1/trace/queryTraceConfig': 2,
                            'v2/mix/account/account': 2,
                            'v2/mix/account/accounts': 2,
                            'v2/mix/account/sub-account-assets': 200,
                            'v2/mix/account/open-count': 2,
                            'v2/mix/account/bill': 2,
                            'v2/mix/market/query-position-lever': 2,
                            'v2/mix/position/single-position': 2,
                            'v2/mix/position/all-position': 4,
                            'v2/mix/position/history-position': 1,
                            'v2/mix/order/detail': 2,
                            'v2/mix/order/fills': 2,
                            'v2/mix/order/fill-history': 2,
                            'v2/mix/order/orders-pending': 2,
                            'v2/mix/order/orders-history': 2,
                            'v2/mix/order/orders-plan-pending': 2,
                            'v2/mix/order/orders-plan-history': 2,
                        },
                        'post': {
                            'mix/v1/account/sub-account-contract-assets': 200, // 0.1 times/1s (UID) => 20/0.1 = 200
                            'mix/v1/account/open-count': 1,
                            'mix/v1/account/setLeverage': 4, // 5 times/1s (UID) => 20/5 = 4
                            'mix/v1/account/setMargin': 4, // 5 times/1s (UID) => 20/5 = 4
                            'mix/v1/account/setMarginMode': 4, // 5 times/1s (UID) => 20/5 = 4
                            'mix/v1/account/setPositionMode': 4, // 5 times/1s (UID) => 20/5 = 4
                            'mix/v1/order/placeOrder': 2,
                            'mix/v1/order/batch-orders': 2,
                            'mix/v1/order/cancel-order': 2,
                            'mix/v1/order/cancel-batch-orders': 2,
                            'mix/v1/order/modifyOrder': 2, // 10 times/1s (UID) => 20/10 = 2
                            'mix/v1/order/cancel-symbol-orders': 2,
                            'mix/v1/order/cancel-all-orders': 2,
                            'mix/v1/order/close-all-positions': 20,
                            'mix/v1/plan/placePlan': 2,
                            'mix/v1/plan/modifyPlan': 2,
                            'mix/v1/plan/modifyPlanPreset': 2,
                            'mix/v1/plan/placeTPSL': 2,
                            'mix/v1/plan/placeTrailStop': 2,
                            'mix/v1/plan/placePositionsTPSL': 2,
                            'mix/v1/plan/modifyTPSLPlan': 2,
                            'mix/v1/plan/cancelPlan': 2,
                            'mix/v1/plan/cancelSymbolPlan': 2,
                            'mix/v1/plan/cancelAllPlan': 2,
                            'mix/v1/trace/closeTrackOrder': 2,
                            'mix/v1/trace/modifyTPSL': 2, // 10 times/1s (UID) => 20/10 = 2
                            'mix/v1/trace/closeTrackOrderBySymbol': 2,
                            'mix/v1/trace/setUpCopySymbols': 2,
                            'mix/v1/trace/followerSetBatchTraceConfig': 2,
                            'mix/v1/trace/followerCloseByTrackingNo': 2,
                            'mix/v1/trace/followerCloseByAll': 2,
                            'mix/v1/trace/followerSetTpsl': 2,
                            'mix/v1/trace/cancelCopyTrader': 4, // 5 times/1s (UID) => 20/5 = 4
                            'mix/v1/trace/traderUpdateConfig': 2, // 10 times/1s (UID) => 20/10 = 2
                            'mix/v1/trace/myTraderList': 2, // 10 times/1s (UID) => 20/10 = 2
                            'mix/v1/trace/myFollowerList': 2, // 10 times/1s (UID) => 20/10 = 2
                            'mix/v1/trace/removeFollower': 2, // 10 times/1s (UID) => 20/10 = 2
                            'mix/v1/trace/public/getFollowerConfig': 2, // 10 times/1s (UID) => 20/10 = 2
                            'mix/v1/trace/report/order/historyList': 2, // 10 times/1s (IP) => 20/10 = 2
                            'mix/v1/trace/report/order/currentList': 2, // 10 times/1s (IP) => 20/10 = 2
                            'mix/v1/trace/queryTraderTpslRatioConfig': 2, // 10 times/1s (UID) => 20/10 = 2
                            'mix/v1/trace/traderUpdateTpslRatioConfig': 2, // 10 times/1s (UID) => 20/10 = 2
                            'v2/mix/account/set-leverage': 4,
                            'v2/mix/account/set-margin': 4,
                            'v2/mix/account/set-margin-mode': 4,
                            'v2/mix/account/set-position-mode': 4,
                            'v2/mix/order/place-order': 20,
                            'v2/mix/order/click-backhand': 20,
                            'v2/mix/order/batch-place-order': 20,
                            'v2/mix/order/modify-order': 2,
                            'v2/mix/order/cancel-order': 2,
                            'v2/mix/order/batch-cancel-orders': 2,
                            'v2/mix/order/close-positions': 20,
                            'v2/mix/order/place-tpsl-order': 2,
                            'v2/mix/order/place-plan-order': 2,
                            'v2/mix/order/modify-tpsl-order': 2,
                            'v2/mix/order/modify-plan-order': 2,
                            'v2/mix/order/cancel-plan-order': 2,
                        },
                    },
                    'user': {
                        'get': {
                            'user/v1/fee/query': 2,
                            'user/v1/sub/virtual-list': 2,
                            'user/v1/sub/virtual-api-list': 2,
                            'user/v1/tax/spot-record': 1,
                            'user/v1/tax/future-record': 1,
                            'user/v1/tax/margin-record': 1,
                            'user/v1/tax/p2p-record': 1,
                            'v2/user/virtual-subaccount-list': 2,
                            'v2/user/virtual-subaccount-apikey-list': 2,
                        },
                        'post': {
                            'user/v1/sub/virtual-create': 4,
                            'user/v1/sub/virtual-modify': 4,
                            'user/v1/sub/virtual-api-batch-create': 20, // 1 times/1s (UID) => 20/1 = 20
                            'user/v1/sub/virtual-api-create': 4,
                            'user/v1/sub/virtual-api-modify': 4,
                            'v2/user/create-virtual-subaccount': 4,
                            'v2/user/modify-virtual-subaccount': 4,
                            'v2/user/batch-create-subaccount-and-apikey': 20,
                            'v2/user/create-virtual-subaccount-apikey': 4,
                            'v2/user/modify-virtual-subaccount-apikey': 4,
                        },
                    },
                    'p2p': {
                        'get': {
                            'p2p/v1/merchant/merchantList': 2, // 10 times/1s (UID) => 20/10 = 2
                            'p2p/v1/merchant/merchantInfo': 2, // 10 times/1s (UID) => 20/10 = 2
                            'p2p/v1/merchant/advList': 2, // 10 times/1s (UID) => 20/10 = 2
                            'p2p/v1/merchant/orderList': 2, // 10 times/1s (UID) => 20/10 = 2
                            'v2/p2p/merchantList': 2,
                            'v2/p2p/merchantInfo': 2,
                            'v2/p2p/orderList': 2,
                            'v2/p2p/advList': 2,
                        },
                    },
                    'broker': {
                        'get': {
                            'broker/v1/account/info': 2, // 10 times/1s (UID) => 20/10 = 2
                            'broker/v1/account/sub-list': 20, // 1 times/1s (UID) => 20/1 = 20
                            'broker/v1/account/sub-email': 20, // 1 times/1s (UID) => 20/1 = 20
                            'broker/v1/account/sub-spot-assets': 2, // 10 times/1s (UID) => 20/10 = 2
                            'broker/v1/account/sub-future-assets': 2, // 10 times/1s (UID) => 20/10 = 2
                            'broker/v1/account/subaccount-transfer': 1, // unknown
                            'broker/v1/account/subaccount-deposit': 1, // unknown
                            'broker/v1/account/subaccount-withdrawal': 1, // unknown
                            'broker/v1/account/sub-api-list': 2, // 10 times/1s (UID) => 20/10 = 2
                            'v2/broker/account/info': 2,
                            'v2/broker/account/subaccount-list': 20,
                            'v2/broker/account/subaccount-email': 2,
                            'v2/broker/account/subaccount-spot-assets': 2,
                            'v2/broker/account/subaccount-future-assets': 2,
                            'v2/broker/manage/subaccount-apikey-list': 2,
                        },
                        'post': {
                            'broker/v1/account/sub-create': 20, // 1 times/1s (UID) => 20/1 = 20
                            'broker/v1/account/sub-modify': 20, // 1 times/1s (UID) => 20/1 = 20
                            'broker/v1/account/sub-modify-email': 20, // 1 times/1s (UID) => 20/1 = 20
                            'broker/v1/account/sub-address': 2, // 10 times/1s (UID) => 20/10 = 2
                            'broker/v1/account/sub-withdrawal': 2, // 10 times/1s (UID) => 20/10 = 2
                            'broker/v1/account/sub-auto-transfer': 4, // 5 times/1s (UID) => 20/5 = 4
                            'broker/v1/account/sub-api-create': 2, // 10 times/1s (UID) => 20/10 = 2
                            'broker/v1/account/sub-api-modify': 2, // 10 times/1s (UID) => 20/10 = 2
                            'v2/broker/account/modify-subaccount-email': 2,
                            'v2/broker/account/create-subaccount': 20,
                            'v2/broker/account/modify-subaccount': 20,
                            'v2/broker/account/subaccount-address': 2,
                            'v2/broker/account/subaccount-withdrawal': 2,
                            'v2/broker/account/set-subaccount-autotransfer': 2,
                            'v2/broker/manage/create-subaccount-apikey': 2,
                            'v2/broker/manage/modify-subaccount-apikey': 2,
                        },
                    },
                    'margin': {
                        'get': {
                            'margin/v1/cross/account/riskRate': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/account/maxTransferOutAmount': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/account/maxTransferOutAmount': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/order/openOrders': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/order/history': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/order/fills': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/loan/list': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/repay/list': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/interest/list': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/liquidation/list': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/fin/list': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/order/openOrders': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/order/history': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/order/fills': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/loan/list': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/repay/list': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/interest/list': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/liquidation/list': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/fin/list': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/account/assets': 2, // 10 times/1s (IP) => 20/10 = 2
                            'margin/v1/isolated/account/assets': 2, // 10 times/1s (IP) => 20/10 = 2
                            'v2/margin/crossed/borrow-history': 2,
                            'v2/margin/crossed/repay-history': 2,
                            'v2/margin/crossed/interest-history': 2,
                            'v2/margin/crossed/liquidation-history': 2,
                            'v2/margin/crossed/financial-records': 2,
                            'v2/margin/crossed/account-assets': 2,
                            'v2/margin/crossed/account/risk-rate': 2,
                            'v2/margin/crossed/account/max-borrowable-amount': 2,
                            'v2/margin/crossed/account/max-transfer-out-amount': 2,
                            'v2/margin/crossed/interest-rate-and-limit': 2,
                            'v2/margin/crossed/tier-data': 2,
                            'v2/margin/crossed/open-orders': 2,
                            'v2/margin/crossed/history-orders': 2,
                            'v2/margin/crossed/fills': 2,
                            'v2/margin/isolated/borrow-history': 2,
                            'v2/margin/isolated/repay-history': 2,
                            'v2/margin/isolated/interest-history': 2,
                            'v2/margin/isolated/liquidation-history': 2,
                            'v2/margin/isolated/financial-records': 2,
                            'v2/margin/isolated/account-assets': 2,
                            'v2/margin/isolated/account/risk-rate': 2,
                            'v2/margin/isolated/account/max-borrowable-amount': 2,
                            'v2/margin/isolated/account/max-transfer-out-amount': 2,
                            'v2/margin/isolated/interest-rate-and-limit': 2,
                            'v2/margin/isolated/tier-data': 2,
                            'v2/margin/isolated/open-orders': 2,
                            'v2/margin/isolated/history-orders': 2,
                            'v2/margin/isolated/fills': 2,
                        },
                        'post': {
                            'margin/v1/cross/account/borrow': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/account/borrow': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/account/repay': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/account/repay': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/account/riskRate': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/account/maxBorrowableAmount': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/account/maxBorrowableAmount': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/account/flashRepay': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/account/queryFlashRepayStatus': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/account/flashRepay': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/account/queryFlashRepayStatus': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/order/placeOrder': 4, // 5 times/1s (UID) => 20/5 = 4
                            'margin/v1/isolated/order/batchPlaceOrder': 4, // 5 times/1s (UID) => 20/5 = 4
                            'margin/v1/isolated/order/cancelOrder': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/isolated/order/batchCancelOrder': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/order/placeOrder': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/order/batchPlaceOrder': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/order/cancelOrder': 2, // 10 times/1s (UID) => 20/10 = 2
                            'margin/v1/cross/order/batchCancelOrder': 2, // 10 times/1s (UID) => 20/10 = 2
                            'v2/margin/crossed/account/borrow': 2,
                            'v2/margin/crossed/account/repay': 2,
                            'v2/margin/crossed/account/flash-repay': 2,
                            'v2/margin/crossed/account/query-flash-repay-status': 2,
                            'v2/margin/crossed/place-order': 2,
                            'v2/margin/crossed/batch-place-order': 2,
                            'v2/margin/crossed/cancel-order': 2,
                            'v2/margin/crossed/batch-cancel-order': 2,
                            'v2/margin/isolated/account/borrow': 2,
                            'v2/margin/isolated/account/repay': 2,
                            'v2/margin/isolated/account/flash-repay': 2,
                            'v2/margin/isolated/account/query-flash-repay-status': 2,
                            'v2/margin/isolated/place-order': 2,
                            'v2/margin/isolated/batch-place-order': 2,
                            'v2/margin/isolated/cancel-order': 2,
                            'v2/margin/isolated/batch-cancel-order': 2,
                        },
                    },
                    'copy': {
                        'get': {
                            'v2/copy/mix-trader/order-current-track': 2,
                            'v2/copy/mix-trader/order-history-track': 2,
                            'v2/copy/mix-trader/order-total-detail': 2,
                            'v2/copy/mix-trader/profit-history-summarys': 1,
                            'v2/copy/mix-trader/profit-history-details': 1,
                            'v2/copy/mix-trader/profit-details': 1,
                            'v2/copy/mix-trader/profits-group-coin-date': 1,
                            'v2/copy/mix-trader/config-query-symbols': 1,
                            'v2/copy/mix-trader/config-query-followers': 2,
                            'v2/copy/mix-follower/query-current-orders': 2,
                            'v2/copy/mix-follower/query-history-orders': 1,
                            'v2/copy/mix-follower/query-settings': 2,
                            'v2/copy/mix-follower/query-traders': 2,
                            'v2/copy/mix-follower/query-quantity-limit': 2,
                            'v2/copy/mix-broker/query-traders': 2,
                            'v2/copy/mix-broker/query-history-traces': 2,
                            'v2/copy/mix-broker/query-current-traces': 2,
                            'v2/copy/spot-trader/profit-summarys': 2,
                            'v2/copy/spot-trader/profit-history-details': 2,
                            'v2/copy/spot-trader/profit-details': 2,
                            'v2/copy/spot-trader/order-total-detail': 2,
                            'v2/copy/spot-trader/order-history-track': 2,
                            'v2/copy/spot-trader/order-current-track': 2,
                            'v2/copy/spot-trader/config-query-settings': 2,
                            'v2/copy/spot-trader/config-query-followers': 2,
                            'v2/copy/spot-follower/query-traders': 2,
                            'v2/copy/spot-follower/query-trader-symbols': 2,
                            'v2/copy/spot-follower/query-settings': 2,
                            'v2/copy/spot-follower/query-history-orders': 2,
                            'v2/copy/spot-follower/query-current-orders': 2,
                        },
                        'post': {
                            'v2/copy/mix-trader/order-modify-tpsl': 2,
                            'v2/copy/mix-trader/order-close-positions': 2,
                            'v2/copy/mix-trader/config-setting-symbols': 2,
                            'v2/copy/mix-trader/config-setting-base': 2,
                            'v2/copy/mix-trader/config-remove-follower': 2,
                            'v2/copy/mix-follower/setting-tpsl': 1,
                            'v2/copy/mix-follower/settings': 2,
                            'v2/copy/mix-follower/close-positions': 2,
                            'v2/copy/mix-follower/cancel-trader': 4,
                            'v2/copy/spot-trader/order-modify-tpsl': 2,
                            'v2/copy/spot-trader/order-close-tracking': 2,
                            'v2/copy/spot-trader/config-setting-symbols': 2,
                            'v2/copy/spot-trader/config-remove-follower': 2,
                            'v2/copy/spot-follower/stop-order': 2,
                            'v2/copy/spot-follower/settings': 2,
                            'v2/copy/spot-follower/setting-tpsl': 2,
                            'v2/copy/spot-follower/order-close-tracking': 2,
                            'v2/copy/spot-follower/cancel-trader': 2,
                        },
                    },
                    'tax': {
                        'get': {
                            'v2/tax/spot-record': 20,
                            'v2/tax/future-record': 20,
                            'v2/tax/margin-record': 20,
                            'v2/tax/p2p-record': 20,
                        },
                    },
                    'convert': {
                        'get': {
                            'v2/convert/currencies': 2,
                            'v2/convert/quoted-price': 2,
                            'v2/convert/convert-record': 2,
                        },
                        'post': {
                            'v2/convert/trade': 2,
                        },
                    },
                    'earn': {
                        'get': {
                            'v2/earn/savings/product': 2,
                            'v2/earn/savings/account': 2,
                            'v2/earn/savings/assets': 2,
                            'v2/earn/savings/records': 2,
                            'v2/earn/savings/subscribe-info': 2,
                            'v2/earn/savings/subscribe-result': 2,
                            'v2/earn/savings/redeem-result': 2,
                            'v2/earn/sharkfin/product': 2,
                            'v2/earn/sharkfin/account': 2,
                            'v2/earn/sharkfin/assets': 2,
                            'v2/earn/sharkfin/records': 2,
                            'v2/earn/sharkfin/subscribe-info': 2,
                            'v2/earn/sharkfin/subscribe-result': 4,
                            'v2/earn/loan/ongoing-orders': 2,
                            'v2/earn/loan/repay-history': 2,
                            'v2/earn/loan/revise-history': 2,
                            'v2/earn/loan/borrow-history': 2,
                            'v2/earn/loan/debts': 2,
                            'v2/earn/loan/reduces': 2,
                        },
                        'post': {
                            'v2/earn/savings/subscribe': 2,
                            'v2/earn/savings/redeem': 2,
                            'v2/earn/sharkfin/subscribe': 2,
                            'v2/earn/loan/borrow': 2,
                            'v2/earn/loan/repay': 2,
                            'v2/earn/loan/revise-pledge': 2,
                        },
                    },
                },
            },
            'fees': {
                'spot': {
                    'taker': this.parseNumber ('0.002'),
                    'maker': this.parseNumber ('0.002'),
                },
                'swap': {
                    'taker': this.parseNumber ('0.0006'),
                    'maker': this.parseNumber ('0.0004'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'exceptions': {
                // http error codes
                // 400 Bad Request — Invalid request format
                // 401 Unauthorized — Invalid API Key
                // 403 Forbidden — You do not have access to the requested resource
                // 404 Not Found
                // 500 Internal Server Error — We had a problem with our server
                'exact': {
                    '1': ExchangeError, // { "code": 1, "message": "System error" }
                    // undocumented
                    'failure to get a peer from the ring-balancer': ExchangeNotAvailable, // { "message": "failure to get a peer from the ring-balancer" }
                    '4010': PermissionDenied, // { "code": 4010, "message": "For the security of your funds, withdrawals are not permitted within 24 hours after changing fund password  / mobile number / Google Authenticator settings " }
                    // common
                    // '0': ExchangeError, // 200 successful,when the order placement / cancellation / operation is successful
                    '4001': ExchangeError, // no data received in 30s
                    '4002': ExchangeError, // Buffer full. cannot write data
                    // --------------------------------------------------------
                    '30001': AuthenticationError, // { "code": 30001, "message": 'request header "OK_ACCESS_KEY" cannot be blank'}
                    '30002': AuthenticationError, // { "code": 30002, "message": 'request header "OK_ACCESS_SIGN" cannot be blank'}
                    '30003': AuthenticationError, // { "code": 30003, "message": 'request header "OK_ACCESS_TIMESTAMP" cannot be blank'}
                    '30004': AuthenticationError, // { "code": 30004, "message": 'request header "OK_ACCESS_PASSPHRASE" cannot be blank'}
                    '30005': InvalidNonce, // { "code": 30005, "message": "invalid OK_ACCESS_TIMESTAMP" }
                    '30006': AuthenticationError, // { "code": 30006, "message": "invalid OK_ACCESS_KEY" }
                    '30007': BadRequest, // { "code": 30007, "message": 'invalid Content_Type, please use "application/json" format'}
                    '30008': RequestTimeout, // { "code": 30008, "message": "timestamp request expired" }
                    '30009': ExchangeError, // { "code": 30009, "message": "system error" }
                    '30010': AuthenticationError, // { "code": 30010, "message": "API validation failed" }
                    '30011': PermissionDenied, // { "code": 30011, "message": "invalid IP" }
                    '30012': AuthenticationError, // { "code": 30012, "message": "invalid authorization" }
                    '30013': AuthenticationError, // { "code": 30013, "message": "invalid sign" }
                    '30014': DDoSProtection, // { "code": 30014, "message": "request too frequent" }
                    '30015': AuthenticationError, // { "code": 30015, "message": 'request header "OK_ACCESS_PASSPHRASE" incorrect'}
                    '30016': ExchangeError, // { "code": 30015, "message": "you are using v1 apiKey, please use v1 endpoint. If you would like to use v3 endpoint, please subscribe to v3 apiKey" }
                    '30017': ExchangeError, // { "code": 30017, "message": "apikey's broker id does not match" }
                    '30018': ExchangeError, // { "code": 30018, "message": "apikey's domain does not match" }
                    '30019': ExchangeNotAvailable, // { "code": 30019, "message": "Api is offline or unavailable" }
                    '30020': BadRequest, // { "code": 30020, "message": "body cannot be blank" }
                    '30021': BadRequest, // { "code": 30021, "message": "Json data format error" }, { "code": 30021, "message": "json data format error" }
                    '30022': PermissionDenied, // { "code": 30022, "message": "Api has been frozen" }
                    '30023': BadRequest, // { "code": 30023, "message": "{0} parameter cannot be blank" }
                    '30024': BadSymbol, // {"code":30024,"message":"\"instrument_id\" is an invalid parameter"}
                    '30025': BadRequest, // { "code": 30025, "message": "{0} parameter category error" }
                    '30026': DDoSProtection, // { "code": 30026, "message": "requested too frequent" }
                    '30027': AuthenticationError, // { "code": 30027, "message": "login failure" }
                    '30028': PermissionDenied, // { "code": 30028, "message": "unauthorized execution" }
                    '30029': AccountSuspended, // { "code": 30029, "message": "account suspended" }
                    '30030': ExchangeError, // { "code": 30030, "message": "endpoint request failed. Please try again" }
                    '30031': BadRequest, // { "code": 30031, "message": "token does not exist" }
                    '30032': BadSymbol, // { "code": 30032, "message": "pair does not exist" }
                    '30033': BadRequest, // { "code": 30033, "message": "exchange domain does not exist" }
                    '30034': ExchangeError, // { "code": 30034, "message": "exchange ID does not exist" }
                    '30035': ExchangeError, // { "code": 30035, "message": "trading is not supported in this website" }
                    '30036': ExchangeError, // { "code": 30036, "message": "no relevant data" }
                    '30037': ExchangeNotAvailable, // { "code": 30037, "message": "endpoint is offline or unavailable" }
                    // '30038': AuthenticationError, // { "code": 30038, "message": "user does not exist" }
                    '30038': OnMaintenance, // {"client_oid":"","code":"30038","error_code":"30038","error_message":"Matching engine is being upgraded. Please try in about 1 minute.","message":"Matching engine is being upgraded. Please try in about 1 minute.","order_id":"-1","result":false}
                    // futures
                    '32001': AccountSuspended, // { "code": 32001, "message": "futures account suspended" }
                    '32002': PermissionDenied, // { "code": 32002, "message": "futures account does not exist" }
                    '32003': CancelPending, // { "code": 32003, "message": "canceling, please wait" }
                    '32004': ExchangeError, // { "code": 32004, "message": "you have no unfilled orders" }
                    '32005': InvalidOrder, // { "code": 32005, "message": "max order quantity" }
                    '32006': InvalidOrder, // { "code": 32006, "message": "the order price or trigger price exceeds USD 1 million" }
                    '32007': InvalidOrder, // { "code": 32007, "message": "leverage level must be the same for orders on the same side of the contract" }
                    '32008': InvalidOrder, // { "code": 32008, "message": "Max. positions to open (cross margin)" }
                    '32009': InvalidOrder, // { "code": 32009, "message": "Max. positions to open (fixed margin)" }
                    '32010': ExchangeError, // { "code": 32010, "message": "leverage cannot be changed with open positions" }
                    '32011': ExchangeError, // { "code": 32011, "message": "futures status error" }
                    '32012': ExchangeError, // { "code": 32012, "message": "futures order update error" }
                    '32013': ExchangeError, // { "code": 32013, "message": "token type is blank" }
                    '32014': ExchangeError, // { "code": 32014, "message": "your number of contracts closing is larger than the number of contracts available" }
                    '32015': ExchangeError, // { "code": 32015, "message": "margin ratio is lower than 100% before opening positions" }
                    '32016': ExchangeError, // { "code": 32016, "message": "margin ratio is lower than 100% after opening position" }
                    '32017': ExchangeError, // { "code": 32017, "message": "no BBO" }
                    '32018': ExchangeError, // { "code": 32018, "message": "the order quantity is less than 1, please try again" }
                    '32019': ExchangeError, // { "code": 32019, "message": "the order price deviates from the price of the previous minute by more than 3%" }
                    '32020': ExchangeError, // { "code": 32020, "message": "the price is not in the range of the price limit" }
                    '32021': ExchangeError, // { "code": 32021, "message": "leverage error" }
                    '32022': ExchangeError, // { "code": 32022, "message": "this function is not supported in your country or region according to the regulations" }
                    '32023': ExchangeError, // { "code": 32023, "message": "this account has outstanding loan" }
                    '32024': ExchangeError, // { "code": 32024, "message": "order cannot be placed during delivery" }
                    '32025': ExchangeError, // { "code": 32025, "message": "order cannot be placed during settlement" }
                    '32026': ExchangeError, // { "code": 32026, "message": "your account is restricted from opening positions" }
                    '32027': ExchangeError, // { "code": 32027, "message": "cancelled over 20 orders" }
                    '32028': AccountSuspended, // { "code": 32028, "message": "account is suspended and liquidated" }
                    '32029': ExchangeError, // { "code": 32029, "message": "order info does not exist" }
                    '32030': InvalidOrder, // The order cannot be cancelled
                    '32031': ArgumentsRequired, // client_oid or order_id is required.
                    '32038': AuthenticationError, // User does not exist
                    '32040': ExchangeError, // User have open contract orders or position
                    '32044': ExchangeError, // { "code": 32044, "message": "The margin ratio after submitting this order is lower than the minimum requirement ({0}) for your tier." }
                    '32045': ExchangeError, // String of commission over 1 million
                    '32046': ExchangeError, // Each user can hold up to 10 trade plans at the same time
                    '32047': ExchangeError, // system error
                    '32048': InvalidOrder, // Order strategy track range error
                    '32049': ExchangeError, // Each user can hold up to 10 track plans at the same time
                    '32050': InvalidOrder, // Order strategy rang error
                    '32051': InvalidOrder, // Order strategy ice depth error
                    '32052': ExchangeError, // String of commission over 100 thousand
                    '32053': ExchangeError, // Each user can hold up to 6 ice plans at the same time
                    '32057': ExchangeError, // The order price is zero. Market-close-all function cannot be executed
                    '32054': ExchangeError, // Trade not allow
                    '32055': InvalidOrder, // cancel order error
                    '32056': ExchangeError, // iceberg per order average should between {0}-{1} contracts
                    '32058': ExchangeError, // Each user can hold up to 6 initiative plans at the same time
                    '32059': InvalidOrder, // Total amount should exceed per order amount
                    '32060': InvalidOrder, // Order strategy type error
                    '32061': InvalidOrder, // Order strategy initiative limit error
                    '32062': InvalidOrder, // Order strategy initiative range error
                    '32063': InvalidOrder, // Order strategy initiative rate error
                    '32064': ExchangeError, // Time Stringerval of orders should set between 5-120s
                    '32065': ExchangeError, // Close amount exceeds the limit of Market-close-all (999 for BTC, and 9999 for the rest tokens)
                    '32066': ExchangeError, // You have open orders. Please cancel all open orders before changing your leverage level.
                    '32067': ExchangeError, // Account equity < required margin in this setting. Please adjust your leverage level again.
                    '32068': ExchangeError, // The margin for this position will fall short of the required margin in this setting. Please adjust your leverage level or increase your margin to proceed.
                    '32069': ExchangeError, // Target leverage level too low. Your account balance is insufficient to cover the margin required. Please adjust the leverage level again.
                    '32070': ExchangeError, // Please check open position or unfilled order
                    '32071': ExchangeError, // Your current liquidation mode does not support this action.
                    '32072': ExchangeError, // The highest available margin for your order’s tier is {0}. Please edit your margin and place a new order.
                    '32073': ExchangeError, // The action does not apply to the token
                    '32074': ExchangeError, // The number of contracts of your position, open orders, and the current order has exceeded the maximum order limit of this asset.
                    '32075': ExchangeError, // Account risk rate breach
                    '32076': ExchangeError, // Liquidation of the holding position(s) at market price will require cancellation of all pending close orders of the contracts.
                    '32077': ExchangeError, // Your margin for this asset in futures account is insufficient and the position has been taken over for liquidation. (You will not be able to place orders, close positions, transfer funds, or add margin during this period of time. Your account will be restored after the liquidation is complete.)
                    '32078': ExchangeError, // Please cancel all open orders before switching the liquidation mode(Please cancel all open orders before switching the liquidation mode)
                    '32079': ExchangeError, // Your open positions are at high risk.(Please add margin or reduce positions before switching the mode)
                    '32080': ExchangeError, // Funds cannot be transferred out within 30 minutes after futures settlement
                    '32083': ExchangeError, // The number of contracts should be a positive multiple of %%. Please place your order again
                    // token and margin trading
                    '33001': PermissionDenied, // { "code": 33001, "message": "margin account for this pair is not enabled yet" }
                    '33002': AccountSuspended, // { "code": 33002, "message": "margin account for this pair is suspended" }
                    '33003': InsufficientFunds, // { "code": 33003, "message": "no loan balance" }
                    '33004': ExchangeError, // { "code": 33004, "message": "loan amount cannot be smaller than the minimum limit" }
                    '33005': ExchangeError, // { "code": 33005, "message": "repayment amount must exceed 0" }
                    '33006': ExchangeError, // { "code": 33006, "message": "loan order not found" }
                    '33007': ExchangeError, // { "code": 33007, "message": "status not found" }
                    '33008': InsufficientFunds, // { "code": 33008, "message": "loan amount cannot exceed the maximum limit" }
                    '33009': ExchangeError, // { "code": 33009, "message": "user ID is blank" }
                    '33010': ExchangeError, // { "code": 33010, "message": "you cannot cancel an order during session 2 of call auction" }
                    '33011': ExchangeError, // { "code": 33011, "message": "no new market data" }
                    '33012': ExchangeError, // { "code": 33012, "message": "order cancellation failed" }
                    '33013': InvalidOrder, // { "code": 33013, "message": "order placement failed" }
                    '33014': OrderNotFound, // { "code": 33014, "message": "order does not exist" }
                    '33015': InvalidOrder, // { "code": 33015, "message": "exceeded maximum limit" }
                    '33016': ExchangeError, // { "code": 33016, "message": "margin trading is not open for this token" }
                    '33017': InsufficientFunds, // { "code": 33017, "message": "insufficient balance" }
                    '33018': ExchangeError, // { "code": 33018, "message": "this parameter must be smaller than 1" }
                    '33020': ExchangeError, // { "code": 33020, "message": "request not supported" }
                    '33021': BadRequest, // { "code": 33021, "message": "token and the pair do not match" }
                    '33022': InvalidOrder, // { "code": 33022, "message": "pair and the order do not match" }
                    '33023': ExchangeError, // { "code": 33023, "message": "you can only place market orders during call auction" }
                    '33024': InvalidOrder, // { "code": 33024, "message": "trading amount too small" }
                    '33025': InvalidOrder, // { "code": 33025, "message": "base token amount is blank" }
                    '33026': ExchangeError, // { "code": 33026, "message": "transaction completed" }
                    '33027': InvalidOrder, // { "code": 33027, "message": "cancelled order or order cancelling" }
                    '33028': InvalidOrder, // { "code": 33028, "message": "the decimal places of the trading price exceeded the limit" }
                    '33029': InvalidOrder, // { "code": 33029, "message": "the decimal places of the trading size exceeded the limit" }
                    '33034': ExchangeError, // { "code": 33034, "message": "You can only place limit order after Call Auction has started" }
                    '33035': ExchangeError, // This type of order cannot be canceled(This type of order cannot be canceled)
                    '33036': ExchangeError, // Exceeding the limit of entrust order
                    '33037': ExchangeError, // The buy order price should be lower than 130% of the trigger price
                    '33038': ExchangeError, // The sell order price should be higher than 70% of the trigger price
                    '33039': ExchangeError, // The limit of callback rate is 0 < x <= 5%
                    '33040': ExchangeError, // The trigger price of a buy order should be lower than the latest transaction price
                    '33041': ExchangeError, // The trigger price of a sell order should be higher than the latest transaction price
                    '33042': ExchangeError, // The limit of price variance is 0 < x <= 1%
                    '33043': ExchangeError, // The total amount must be larger than 0
                    '33044': ExchangeError, // The average amount should be 1/1000 * total amount <= x <= total amount
                    '33045': ExchangeError, // The price should not be 0, including trigger price, order price, and price limit
                    '33046': ExchangeError, // Price variance should be 0 < x <= 1%
                    '33047': ExchangeError, // Sweep ratio should be 0 < x <= 100%
                    '33048': ExchangeError, // Per order limit: Total amount/1000 < x <= Total amount
                    '33049': ExchangeError, // Total amount should be X > 0
                    '33050': ExchangeError, // Time interval should be 5 <= x <= 120s
                    '33051': ExchangeError, // cancel order number not higher limit: plan and track entrust no more than 10, ice and time entrust no more than 6
                    '33059': BadRequest, // { "code": 33059, "message": "client_oid or order_id is required" }
                    '33060': BadRequest, // { "code": 33060, "message": "Only fill in either parameter client_oid or order_id" }
                    '33061': ExchangeError, // Value of a single market price order cannot exceed 100,000 USD
                    '33062': ExchangeError, // The leverage ratio is too high. The borrowed position has exceeded the maximum position of this leverage ratio. Please readjust the leverage ratio
                    '33063': ExchangeError, // Leverage multiple is too low, there is insufficient margin in the account, please readjust the leverage ratio
                    '33064': ExchangeError, // The setting of the leverage ratio cannot be less than 2, please readjust the leverage ratio
                    '33065': ExchangeError, // Leverage ratio exceeds maximum leverage ratio, please readjust leverage ratio
                    // account
                    '21009': ExchangeError, // Funds cannot be transferred out within 30 minutes after swap settlement(Funds cannot be transferred out within 30 minutes after swap settlement)
                    '34001': PermissionDenied, // { "code": 34001, "message": "withdrawal suspended" }
                    '34002': InvalidAddress, // { "code": 34002, "message": "please add a withdrawal address" }
                    '34003': ExchangeError, // { "code": 34003, "message": "sorry, this token cannot be withdrawn to xx at the moment" }
                    '34004': ExchangeError, // { "code": 34004, "message": "withdrawal fee is smaller than minimum limit" }
                    '34005': ExchangeError, // { "code": 34005, "message": "withdrawal fee exceeds the maximum limit" }
                    '34006': ExchangeError, // { "code": 34006, "message": "withdrawal amount is lower than the minimum limit" }
                    '34007': ExchangeError, // { "code": 34007, "message": "withdrawal amount exceeds the maximum limit" }
                    '34008': InsufficientFunds, // { "code": 34008, "message": "insufficient balance" }
                    '34009': ExchangeError, // { "code": 34009, "message": "your withdrawal amount exceeds the daily limit" }
                    '34010': ExchangeError, // { "code": 34010, "message": "transfer amount must be larger than 0" }
                    '34011': ExchangeError, // { "code": 34011, "message": "conditions not met" }
                    '34012': ExchangeError, // { "code": 34012, "message": "the minimum withdrawal amount for NEO is 1, and the amount must be an integer" }
                    '34013': ExchangeError, // { "code": 34013, "message": "please transfer" }
                    '34014': ExchangeError, // { "code": 34014, "message": "transfer limited" }
                    '34015': ExchangeError, // { "code": 34015, "message": "subaccount does not exist" }
                    '34016': PermissionDenied, // { "code": 34016, "message": "transfer suspended" }
                    '34017': AccountSuspended, // { "code": 34017, "message": "account suspended" }
                    '34018': AuthenticationError, // { "code": 34018, "message": "incorrect trades password" }
                    '34019': PermissionDenied, // { "code": 34019, "message": "please bind your email before withdrawal" }
                    '34020': PermissionDenied, // { "code": 34020, "message": "please bind your funds password before withdrawal" }
                    '34021': InvalidAddress, // { "code": 34021, "message": "Not verified address" }
                    '34022': ExchangeError, // { "code": 34022, "message": "Withdrawals are not available for sub accounts" }
                    '34023': PermissionDenied, // { "code": 34023, "message": "Please enable futures trading before transferring your funds" }
                    '34026': ExchangeError, // transfer too frequently(transfer too frequently)
                    '34036': ExchangeError, // Parameter is incorrect, please refer to API documentation
                    '34037': ExchangeError, // Get the sub-account balance interface, account type is not supported
                    '34038': ExchangeError, // Since your C2C transaction is unusual, you are restricted from fund transfer. Please contact our customer support to cancel the restriction
                    '34039': ExchangeError, // You are now restricted from transferring out your funds due to abnormal trades on C2C Market. Please transfer your fund on our website or app instead to verify your identity
                    // swap
                    '35001': ExchangeError, // { "code": 35001, "message": "Contract does not exist" }
                    '35002': ExchangeError, // { "code": 35002, "message": "Contract settling" }
                    '35003': ExchangeError, // { "code": 35003, "message": "Contract paused" }
                    '35004': ExchangeError, // { "code": 35004, "message": "Contract pending settlement" }
                    '35005': AuthenticationError, // { "code": 35005, "message": "User does not exist" }
                    '35008': InvalidOrder, // { "code": 35008, "message": "Risk ratio too high" }
                    '35010': InvalidOrder, // { "code": 35010, "message": "Position closing too large" }
                    '35012': InvalidOrder, // { "code": 35012, "message": "Incorrect order size" }
                    '35014': InvalidOrder, // { "code": 35014, "message": "Order price is not within limit" }
                    '35015': InvalidOrder, // { "code": 35015, "message": "Invalid leverage level" }
                    '35017': ExchangeError, // { "code": 35017, "message": "Open orders exist" }
                    '35019': InvalidOrder, // { "code": 35019, "message": "Order size too large" }
                    '35020': InvalidOrder, // { "code": 35020, "message": "Order price too high" }
                    '35021': InvalidOrder, // { "code": 35021, "message": "Order size exceeded current tier limit" }
                    '35022': ExchangeError, // { "code": 35022, "message": "Contract status error" }
                    '35024': ExchangeError, // { "code": 35024, "message": "Contract not initialized" }
                    '35025': InsufficientFunds, // { "code": 35025, "message": "No account balance" }
                    '35026': ExchangeError, // { "code": 35026, "message": "Contract settings not initialized" }
                    '35029': OrderNotFound, // { "code": 35029, "message": "Order does not exist" }
                    '35030': InvalidOrder, // { "code": 35030, "message": "Order size too large" }
                    '35031': InvalidOrder, // { "code": 35031, "message": "Cancel order size too large" }
                    '35032': ExchangeError, // { "code": 35032, "message": "Invalid user status" }
                    '35037': ExchangeError, // No last traded price in cache
                    '35039': ExchangeError, // { "code": 35039, "message": "Open order quantity exceeds limit" }
                    '35040': InvalidOrder, // {"error_message":"Invalid order type","result":"true","error_code":"35040","order_id":"-1"}
                    '35044': ExchangeError, // { "code": 35044, "message": "Invalid order status" }
                    '35046': InsufficientFunds, // { "code": 35046, "message": "Negative account balance" }
                    '35047': InsufficientFunds, // { "code": 35047, "message": "Insufficient account balance" }
                    '35048': ExchangeError, // { "code": 35048, "message": "User contract is frozen and liquidating" }
                    '35049': InvalidOrder, // { "code": 35049, "message": "Invalid order type" }
                    '35050': InvalidOrder, // { "code": 35050, "message": "Position settings are blank" }
                    '35052': InsufficientFunds, // { "code": 35052, "message": "Insufficient cross margin" }
                    '35053': ExchangeError, // { "code": 35053, "message": "Account risk too high" }
                    '35055': InsufficientFunds, // { "code": 35055, "message": "Insufficient account balance" }
                    '35057': ExchangeError, // { "code": 35057, "message": "No last traded price" }
                    '35058': ExchangeError, // { "code": 35058, "message": "No limit" }
                    '35059': BadRequest, // { "code": 35059, "message": "client_oid or order_id is required" }
                    '35060': BadRequest, // { "code": 35060, "message": "Only fill in either parameter client_oid or order_id" }
                    '35061': BadRequest, // { "code": 35061, "message": "Invalid instrument_id" }
                    '35062': InvalidOrder, // { "code": 35062, "message": "Invalid match_price" }
                    '35063': InvalidOrder, // { "code": 35063, "message": "Invalid order_size" }
                    '35064': InvalidOrder, // { "code": 35064, "message": "Invalid client_oid" }
                    '35066': InvalidOrder, // Order interval error
                    '35067': InvalidOrder, // Time-weighted order ratio error
                    '35068': InvalidOrder, // Time-weighted order range error
                    '35069': InvalidOrder, // Time-weighted single transaction limit error
                    '35070': InvalidOrder, // Algo order type error
                    '35071': InvalidOrder, // Order total must be larger than single order limit
                    '35072': InvalidOrder, // Maximum 6 unfulfilled time-weighted orders can be held at the same time
                    '35073': InvalidOrder, // Order price is 0. Market-close-all not available
                    '35074': InvalidOrder, // Iceberg order single transaction average error
                    '35075': InvalidOrder, // Failed to cancel order
                    '35076': InvalidOrder, // LTC 20x leverage. Not allowed to open position
                    '35077': InvalidOrder, // Maximum 6 unfulfilled iceberg orders can be held at the same time
                    '35078': InvalidOrder, // Order amount exceeded 100,000
                    '35079': InvalidOrder, // Iceberg order price variance error
                    '35080': InvalidOrder, // Callback rate error
                    '35081': InvalidOrder, // Maximum 10 unfulfilled trail orders can be held at the same time
                    '35082': InvalidOrder, // Trail order callback rate error
                    '35083': InvalidOrder, // Each user can only hold a maximum of 10 unfulfilled stop-limit orders at the same time
                    '35084': InvalidOrder, // Order amount exceeded 1 million
                    '35085': InvalidOrder, // Order amount is not in the correct range
                    '35086': InvalidOrder, // Price exceeds 100 thousand
                    '35087': InvalidOrder, // Price exceeds 100 thousand
                    '35088': InvalidOrder, // Average amount error
                    '35089': InvalidOrder, // Price exceeds 100 thousand
                    '35090': ExchangeError, // No stop-limit orders available for cancelation
                    '35091': ExchangeError, // No trail orders available for cancellation
                    '35092': ExchangeError, // No iceberg orders available for cancellation
                    '35093': ExchangeError, // No trail orders available for cancellation
                    '35094': ExchangeError, // Stop-limit order last traded price error
                    '35095': BadRequest, // Instrument_id error
                    '35096': ExchangeError, // Algo order status error
                    '35097': ExchangeError, // Order status and order ID cannot exist at the same time
                    '35098': ExchangeError, // An order status or order ID must exist
                    '35099': ExchangeError, // Algo order ID error
                    // option
                    '36001': BadRequest, // Invalid underlying index.
                    '36002': BadRequest, // Instrument does not exist.
                    '36005': ExchangeError, // Instrument status is invalid.
                    '36101': AuthenticationError, // Account does not exist.
                    '36102': PermissionDenied, // Account status is invalid.
                    '36103': AccountSuspended, // Account is suspended due to ongoing liquidation.
                    '36104': PermissionDenied, // Account is not enabled for options trading.
                    '36105': PermissionDenied, // Please enable the account for option contract.
                    '36106': AccountSuspended, // Funds cannot be transferred in or out, as account is suspended.
                    '36107': PermissionDenied, // Funds cannot be transferred out within 30 minutes after option exercising or settlement.
                    '36108': InsufficientFunds, // Funds cannot be transferred in or out, as equity of the account is less than zero.
                    '36109': PermissionDenied, // Funds cannot be transferred in or out during option exercising or settlement.
                    '36201': PermissionDenied, // New order function is blocked.
                    '36202': PermissionDenied, // Account does not have permission to short option.
                    '36203': InvalidOrder, // Invalid format for client_oid.
                    '36204': ExchangeError, // Invalid format for request_id.
                    '36205': BadRequest, // Instrument id does not match underlying index.
                    '36206': BadRequest, // Order_id and client_oid can not be used at the same time.
                    '36207': InvalidOrder, // Either order price or fartouch price must be present.
                    '36208': InvalidOrder, // Either order price or size must be present.
                    '36209': InvalidOrder, // Either order_id or client_oid must be present.
                    '36210': InvalidOrder, // Either order_ids or client_oids must be present.
                    '36211': InvalidOrder, // Exceeding max batch size for order submission.
                    '36212': InvalidOrder, // Exceeding max batch size for oder cancellation.
                    '36213': InvalidOrder, // Exceeding max batch size for order amendment.
                    '36214': ExchangeError, // Instrument does not have valid bid/ask quote.
                    '36216': OrderNotFound, // Order does not exist.
                    '36217': InvalidOrder, // Order submission failed.
                    '36218': InvalidOrder, // Order cancellation failed.
                    '36219': InvalidOrder, // Order amendment failed.
                    '36220': InvalidOrder, // Order is pending cancel.
                    '36221': InvalidOrder, // Order qty is not valid multiple of lot size.
                    '36222': InvalidOrder, // Order price is breaching highest buy limit.
                    '36223': InvalidOrder, // Order price is breaching lowest sell limit.
                    '36224': InvalidOrder, // Exceeding max order size.
                    '36225': InvalidOrder, // Exceeding max open order count for instrument.
                    '36226': InvalidOrder, // Exceeding max open order count for underlying.
                    '36227': InvalidOrder, // Exceeding max open size across all orders for underlying
                    '36228': InvalidOrder, // Exceeding max available qty for instrument.
                    '36229': InvalidOrder, // Exceeding max available qty for underlying.
                    '36230': InvalidOrder, // Exceeding max position limit for underlying.
                    // --------------------------------------------------------
                    // swap
                    '400': BadRequest, // Bad Request
                    '401': AuthenticationError, // Unauthorized access
                    '403': PermissionDenied, // Access prohibited
                    '404': BadRequest, // Request address does not exist
                    '405': BadRequest, // The HTTP Method is not supported
                    '415': BadRequest, // The current media type is not supported
                    '429': DDoSProtection, // Too many requests
                    '500': ExchangeNotAvailable, // System busy
                    '1001': RateLimitExceeded, // The request is too frequent and has been throttled
                    '1002': ExchangeError, // {0} verifications within 24 hours
                    '1003': ExchangeError, // You failed more than {0} times today, the current operation is locked, please try again in 24 hours
                    // '00000': ExchangeError, // success
                    '40001': AuthenticationError, // ACCESS_KEY cannot be empty
                    '40002': AuthenticationError, // SECRET_KEY cannot be empty
                    '40003': AuthenticationError, // Signature cannot be empty
                    '40004': InvalidNonce, // Request timestamp expired
                    '40005': InvalidNonce, // Invalid ACCESS_TIMESTAMP
                    '40006': AuthenticationError, // Invalid ACCESS_KEY
                    '40007': BadRequest, // Invalid Content_Type
                    '40008': InvalidNonce, // Request timestamp expired
                    '40009': AuthenticationError, // sign signature error
                    '40010': AuthenticationError, // sign signature error
                    '40011': AuthenticationError, // ACCESS_PASSPHRASE cannot be empty
                    '40012': AuthenticationError, // apikey/password is incorrect
                    '40013': ExchangeError, // User status is abnormal
                    '40014': PermissionDenied, // Incorrect permissions
                    '40015': ExchangeError, // System is abnormal, please try again later
                    '40016': PermissionDenied, // The user must bind the phone or Google
                    '40017': ExchangeError, // Parameter verification failed
                    '40018': PermissionDenied, // Invalid IP
                    '40019': BadRequest, // {"code":"40019","msg":"Parameter QLCUSDT_SPBL cannot be empty","requestTime":1679196063659,"data":null}
                    '40031': AccountSuspended, // The account has been cancelled and cannot be used again
                    '40037': AuthenticationError, // Apikey does not exist
                    '40102': BadRequest, // Contract configuration does not exist, please check the parameters
                    '40103': BadRequest, // Request method cannot be empty
                    '40104': ExchangeError, // Lever adjustment failure
                    '40105': ExchangeError, // Abnormal access to current price limit data
                    '40106': ExchangeError, // Abnormal get next settlement time
                    '40107': ExchangeError, // Abnormal access to index price data
                    '40108': InvalidOrder, // Wrong order quantity
                    '40109': OrderNotFound, // The data of the order cannot be found, please confirm the order number
                    '40200': OnMaintenance, // Server upgrade, please try again later
                    '40201': InvalidOrder, // Order number cannot be empty
                    '40202': ExchangeError, // User information cannot be empty
                    '40203': BadRequest, // The amount of adjustment margin cannot be empty or negative
                    '40204': BadRequest, // Adjustment margin type cannot be empty
                    '40205': BadRequest, // Adjusted margin type data is wrong
                    '40206': BadRequest, // The direction of the adjustment margin cannot be empty
                    '40207': BadRequest, // The adjustment margin data is wrong
                    '40208': BadRequest, // The accuracy of the adjustment margin amount is incorrect
                    '40209': BadRequest, // The current page number is wrong, please confirm
                    '40300': ExchangeError, // User does not exist
                    '40301': PermissionDenied, // Permission has not been obtained yet. If you need to use it, please contact customer service
                    '40302': BadRequest, // Parameter abnormality
                    '40303': BadRequest, // Can only query up to 20,000 data
                    '40304': BadRequest, // Parameter type is abnormal
                    '40305': BadRequest, // Client_oid length is not greater than 50, and cannot be Martian characters
                    '40306': ExchangeError, // Batch processing orders can only process up to 20
                    '40308': OnMaintenance, // The contract is being temporarily maintained
                    '40309': BadSymbol, // The contract has been removed
                    '40400': ExchangeError, // Status check abnormal
                    '40401': ExchangeError, // The operation cannot be performed
                    '40402': BadRequest, // The opening direction cannot be empty
                    '40403': BadRequest, // Wrong opening direction format
                    '40404': BadRequest, // Whether to enable automatic margin call parameters cannot be empty
                    '40405': BadRequest, // Whether to enable the automatic margin call parameter type is wrong
                    '40406': BadRequest, // Whether to enable automatic margin call parameters is of unknown type
                    '40407': ExchangeError, // The query direction is not the direction entrusted by the plan
                    '40408': ExchangeError, // Wrong time range
                    '40409': ExchangeError, // Time format error
                    '40500': InvalidOrder, // Client_oid check error
                    '40501': ExchangeError, // Channel name error
                    '40502': ExchangeError, // If it is a copy user, you must pass the copy to whom
                    '40503': ExchangeError, // With the single type
                    '40504': ExchangeError, // Platform code must pass
                    '40505': ExchangeError, // Not the same as single type
                    '40506': AuthenticationError, // Platform signature error
                    '40507': AuthenticationError, // Api signature error
                    '40508': ExchangeError, // KOL is not authorized
                    '40509': ExchangeError, // Abnormal copy end
                    '40600': ExchangeError, // Copy function suspended
                    '40601': ExchangeError, // Followers cannot be KOL
                    '40602': ExchangeError, // The number of copies has reached the limit and cannot process the request
                    '40603': ExchangeError, // Abnormal copy end
                    '40604': ExchangeNotAvailable, // Server is busy, please try again later
                    '40605': ExchangeError, // Copy type, the copy number must be passed
                    '40606': ExchangeError, // The type of document number is wrong
                    '40607': ExchangeError, // Document number must be passed
                    '40608': ExchangeError, // No documented products currently supported
                    '40609': ExchangeError, // The contract product does not support copying
                    '40700': BadRequest, // Cursor parameters are incorrect
                    '40701': ExchangeError, // KOL is not authorized
                    '40702': ExchangeError, // Unauthorized copying user
                    '40703': ExchangeError, // Bill inquiry start and end time cannot be empty
                    '40704': ExchangeError, // Can only check the data of the last three months
                    '40705': BadRequest, // The start and end time cannot exceed 90 days
                    '40706': InvalidOrder, // Wrong order price
                    '40707': BadRequest, // Start time is greater than end time
                    '40708': BadRequest, // Parameter verification is abnormal
                    '40709': ExchangeError, // There is no position in this position, and no automatic margin call can be set
                    '40710': ExchangeError, // Abnormal account status
                    '40711': InsufficientFunds, // Insufficient contract account balance
                    '40712': InsufficientFunds, // Insufficient margin
                    '40713': ExchangeError, // Cannot exceed the maximum transferable margin amount
                    '40714': ExchangeError, // No direct margin call is allowed
                    '40768': OrderNotFound, // Order does not exist"
                    '41114': OnMaintenance, // {"code":"41114","msg":"The current trading pair is under maintenance, please refer to the official announcement for the opening time","requestTime":1679196062544,"data":null}
                    '43011': InvalidOrder, // The parameter does not meet the specification executePrice <= 0
                    '43025': InvalidOrder, // Plan order does not exist
                    '43115': OnMaintenance, // {"code":"43115","msg":"The current trading pair is opening soon, please refer to the official announcement for the opening time","requestTime":1688907202434,"data":null}
                    '45110': InvalidOrder, // {"code":"45110","msg":"less than the minimum amount 5 USDT","requestTime":1669911118932,"data":null}
                    // spot
                    'invalid sign': AuthenticationError,
                    'invalid currency': BadSymbol, // invalid trading pair
                    'invalid symbol': BadSymbol,
                    'invalid period': BadRequest, // invalid Kline type
                    'invalid user': ExchangeError,
                    'invalid amount': InvalidOrder,
                    'invalid type': InvalidOrder, // {"status":"error","ts":1595700344504,"err_code":"invalid-parameter","err_msg":"invalid type"}
                    'invalid orderId': InvalidOrder,
                    'invalid record': ExchangeError,
                    'invalid accountId': BadRequest,
                    'invalid address': BadRequest,
                    'accesskey not null': AuthenticationError, // {"status":"error","ts":1595704360508,"err_code":"invalid-parameter","err_msg":"accesskey not null"}
                    'illegal accesskey': AuthenticationError,
                    'sign not null': AuthenticationError,
                    'req_time is too much difference from server time': InvalidNonce,
                    'permissions not right': PermissionDenied, // {"status":"error","ts":1595704490084,"err_code":"invalid-parameter","err_msg":"permissions not right"}
                    'illegal sign invalid': AuthenticationError, // {"status":"error","ts":1595684716042,"err_code":"invalid-parameter","err_msg":"illegal sign invalid"}
                    'user locked': AccountSuspended,
                    'Request Frequency Is Too High': RateLimitExceeded,
                    'more than a daily rate of cash': BadRequest,
                    'more than the maximum daily withdrawal amount': BadRequest,
                    'need to bind email or mobile': ExchangeError,
                    'user forbid': PermissionDenied,
                    'User Prohibited Cash Withdrawal': PermissionDenied,
                    'Cash Withdrawal Is Less Than The Minimum Value': BadRequest,
                    'Cash Withdrawal Is More Than The Maximum Value': BadRequest,
                    'the account with in 24 hours ban coin': PermissionDenied,
                    'order cancel fail': BadRequest, // {"status":"error","ts":1595703343035,"err_code":"bad-request","err_msg":"order cancel fail"}
                    'base symbol error': BadSymbol,
                    'base date error': ExchangeError,
                    'api signature not valid': AuthenticationError,
                    'gateway internal error': ExchangeError,
                    'audit failed': ExchangeError,
                    'order queryorder invalid': BadRequest,
                    'market no need price': InvalidOrder,
                    'limit need price': InvalidOrder,
                    'userid not equal to account_id': ExchangeError,
                    'your balance is low': InsufficientFunds, // {"status":"error","ts":1595594160149,"err_code":"invalid-parameter","err_msg":"invalid size, valid range: [1,2000]"}
                    'address invalid cointype': ExchangeError,
                    'system exception': ExchangeError, // {"status":"error","ts":1595711862763,"err_code":"system exception","err_msg":"system exception"}
                    '50003': ExchangeError, // No record
                    '50004': BadSymbol, // The transaction pair is currently not supported or has been suspended
                    '50006': PermissionDenied, // The account is forbidden to withdraw. If you have any questions, please contact customer service.
                    '50007': PermissionDenied, // The account is forbidden to withdraw within 24 hours. If you have any questions, please contact customer service.
                    '50008': RequestTimeout, // network timeout
                    '50009': RateLimitExceeded, // The operation is too frequent, please try again later
                    '50010': ExchangeError, // The account is abnormally frozen. If you have any questions, please contact customer service.
                    '50014': InvalidOrder, // The transaction amount under minimum limits
                    '50015': InvalidOrder, // The transaction amount exceed maximum limits
                    '50016': InvalidOrder, // The price can't be higher than the current price
                    '50017': InvalidOrder, // Price under minimum limits
                    '50018': InvalidOrder, // The price exceed maximum limits
                    '50019': InvalidOrder, // The amount under minimum limits
                    '50020': InsufficientFunds, // Insufficient balance
                    '50021': InvalidOrder, // Price is under minimum limits
                    '50026': InvalidOrder, // Market price parameter error
                    'invalid order query time': ExchangeError, // start time is greater than end time; or the time interval between start time and end time is greater than 48 hours
                    'invalid start time': BadRequest, // start time is a date 30 days ago; or start time is a date in the future
                    'invalid end time': BadRequest, // end time is a date 30 days ago; or end time is a date in the future
                    '20003': ExchangeError, // operation failed, {"status":"error","ts":1595730308979,"err_code":"bad-request","err_msg":"20003"}
                    '01001': ExchangeError, // order failed, {"status":"fail","err_code":"01001","err_msg":"系统异常，请稍后重试"}
                    '43111': PermissionDenied, // {"code":"43111","msg":"参数错误 address not in address book","requestTime":1665394201164,"data":null}
                },
                'broad': {
                    'invalid size, valid range': ExchangeError,
                },
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {
                'JADE': 'Jade Protocol',
            },
            'options': {
                'timeframes': {
                    'spot': {
                        '1m': '1min',
                        '5m': '5min',
                        '15m': '15min',
                        '30m': '30min',
                        '1h': '1h',
                        '4h': '4h',
                        '6h': '6Hutc',
                        '12h': '12Hutc',
                        '1d': '1Dutc',
                        '3d': '3Dutc',
                        '1w': '1Wutc',
                        '1M': '1Mutc',
                    },
                    'swap': {
                        '1m': '1m',
                        '3m': '3m',
                        '5m': '5m',
                        '15m': '15m',
                        '30m': '30m',
                        '1h': '1H',
                        '2h': '2H',
                        '4h': '4H',
                        '6h': '6Hutc',
                        '12h': '12Hutc',
                        '1d': '1Dutc',
                        '3d': '3Dutc',
                        '1w': '1Wutc',
                        '1M': '1Mutc',
                    },
                },
                'fetchMarkets': [
                    'spot',
                    'swap',
                ],
                'defaultType': 'spot', // 'spot', 'swap'
                'defaultSubType': 'linear', // 'linear', 'inverse'
                'createMarketBuyOrderRequiresPrice': true,
                'broker': 'p4sve',
                'withdraw': {
                    'fillResponseFromRequest': true,
                },
                'fetchOHLCV': {
                    'spot': {
                        'method': 'publicSpotGetSpotV1MarketCandles', // or publicSpotGetSpotV1MarketHistoryCandles
                    },
                    'swap': {
                        'method': 'publicMixGetMixV1MarketCandles', // or publicMixGetMixV1MarketHistoryCandles or publicMixGetMixV1MarketHistoryIndexCandles or publicMixGetMixV1MarketHistoryMarkCandles
                    },
                },
                'fetchTrades': {
                    'spot': {
                        'method': 'publicSpotGetSpotV1MarketFillsHistory', // or publicSpotGetSpotV1MarketFills
                    },
                    'swap': {
                        'method': 'publicMixGetMixV1MarketFillsHistory', // or publicMixGetMixV1MarketFills
                    },
                },
                'accountsByType': {
                    'main': 'EXCHANGE',
                    'spot': 'EXCHANGE',
                    'future': 'USDT_MIX',
                    'contract': 'CONTRACT',
                    'mix': 'USD_MIX',
                },
                'accountsById': {
                    'EXCHANGE': 'spot',
                    'USDT_MIX': 'future',
                    'CONTRACT': 'swap',
                    'USD_MIX': 'swap',
                },
                'sandboxMode': false,
                'networks': {
                    'TRX': 'TRC20',
                    'ETH': 'ERC20',
                    'BSC': 'BEP20',
                },
                'networksById': {
                    'TRC20': 'TRX',
                    'BSC': 'BEP20',
                },
                'fetchPositions': {
                    'method': 'privateMixGetMixV1PositionAllPositionV2', // or privateMixGetMixV1PositionHistoryPosition
                },
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
            },
        });
    }

    setSandboxMode (enabled) {
        this.options['sandboxMode'] = enabled;
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name bitget#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-server-time
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicSpotGetSpotV1PublicTime (params);
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1645837773501,
        //       "data": "1645837773501"
        //     }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bitget#fetchMarkets
         * @description retrieves data on all markets for bitget
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-symbols
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-all-symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const sandboxMode = this.safeValue (this.options, 'sandboxMode', false);
        let types = this.safeValue (this.options, 'fetchMarkets', [ 'spot', 'swap' ]);
        if (sandboxMode) {
            types = [ 'swap' ];
        }
        let promises = [];
        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            if (type === 'swap') {
                let subTypes = undefined;
                if (sandboxMode) {
                    // the following are simulated trading markets [ 'sumcbl', 'sdmcbl', 'scmcbl' ];
                    subTypes = [ 'sumcbl', 'sdmcbl', 'scmcbl' ];
                } else {
                    subTypes = [ 'umcbl', 'dmcbl', 'cmcbl' ];
                }
                for (let j = 0; j < subTypes.length; j++) {
                    promises.push (this.fetchMarketsByType (type, this.extend (params, {
                        'productType': subTypes[j],
                    })));
                }
            } else {
                promises.push (this.fetchMarketsByType (types[i], params));
            }
        }
        promises = await Promise.all (promises);
        let result = promises[0];
        for (let i = 1; i < promises.length; i++) {
            result = this.arrayConcat (result, promises[i]);
        }
        return result;
    }

    parseMarket (market): Market {
        //
        // spot
        //
        //    {
        //        "symbol": "ALPHAUSDT_SPBL",
        //        "symbolName": "ALPHAUSDT",
        //        "baseCoin": "ALPHA",
        //        "quoteCoin": "USDT",
        //        "minTradeAmount": "2",
        //        "maxTradeAmount": "0",
        //        minTradeUSDT": "5",
        //        "takerFeeRate": "0.001",
        //        "makerFeeRate": "0.001",
        //        "priceScale": "4",
        //        "quantityScale": "4",
        //        "status": "online"
        //    }
        //
        // swap
        //
        //    {
        //        "symbol": "BTCUSDT_UMCBL",
        //        "makerFeeRate": "0.0002",
        //        "takerFeeRate": "0.0006",
        //        "feeRateUpRatio": "0.005",
        //        "openCostUpRatio": "0.01",
        //        "quoteCoin": "USDT",
        //        "baseCoin": "BTC",
        //        "buyLimitPriceRatio": "0.01",
        //        "sellLimitPriceRatio": "0.01",
        //        "supportMarginCoins": [ "USDT" ],
        //        "minTradeNum": "0.001",
        //        "priceEndStep": "5",
        //        "volumePlace": "3",
        //        "pricePlace": "1",
        //        "symbolStatus": "normal",
        //        "offTime": "-1",
        //        "limitOpenTime": "-1"
        //    }
        //
        const marketId = this.safeString (market, 'symbol');
        const quoteId = this.safeString (market, 'quoteCoin');
        const baseId = this.safeString (market, 'baseCoin');
        const quote = this.safeCurrencyCode (quoteId);
        const base = this.safeCurrencyCode (baseId);
        const supportMarginCoins = this.safeValue (market, 'supportMarginCoins', []);
        const settleId = this.safeString (supportMarginCoins, 0);
        const settle = this.safeCurrencyCode (settleId);
        let symbol = base + '/' + quote;
        const parts = marketId.split ('_');
        const typeId = this.safeString (parts, 1);
        let type = undefined;
        let swap = false;
        let spot = false;
        let future = false;
        let contract = false;
        let pricePrecision = undefined;
        let amountPrecision = undefined;
        let linear = undefined;
        let inverse = undefined;
        let expiry = undefined;
        let expiryDatetime = undefined;
        if (typeId === 'SPBL') {
            type = 'spot';
            spot = true;
            pricePrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'priceScale')));
            amountPrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'quantityScale')));
        } else {
            const expiryString = this.safeString (parts, 2);
            if (expiryString !== undefined) {
                const year = '20' + expiryString.slice (0, 2);
                const month = expiryString.slice (2, 4);
                const day = expiryString.slice (4, 6);
                expiryDatetime = year + '-' + month + '-' + day + 'T00:00:00.000Z';
                expiry = this.parse8601 (expiryDatetime);
                type = 'future';
                future = true;
                symbol = symbol + ':' + settle + '-' + expiryString;
            } else {
                type = 'swap';
                swap = true;
                symbol = symbol + ':' + settle;
            }
            contract = true;
            linear = (typeId === 'UMCBL') || (typeId === 'CMCBL') || (typeId === 'SUMCBL') || (typeId === 'SCMCBL');
            inverse = !linear;
            const priceDecimals = this.safeInteger (market, 'pricePlace');
            const amountDecimals = this.safeInteger (market, 'volumePlace');
            const priceStep = this.safeString (market, 'priceEndStep');
            const amountStep = this.safeString (market, 'minTradeNum');
            const precisePrice = new Precise (priceStep);
            precisePrice.decimals = Math.max (precisePrice.decimals, priceDecimals);
            precisePrice.reduce ();
            const priceString = precisePrice.toString ();
            pricePrecision = this.parseNumber (priceString);
            const preciseAmount = new Precise (amountStep);
            preciseAmount.decimals = Math.max (preciseAmount.decimals, amountDecimals);
            preciseAmount.reduce ();
            const amountString = preciseAmount.toString ();
            amountPrecision = this.parseNumber (amountString);
        }
        const status = this.safeString2 (market, 'status', 'symbolStatus');
        let active = undefined;
        if (status !== undefined) {
            active = (status === 'online' || status === 'normal');
        }
        let minCost = undefined;
        if (quote === 'USDT') {
            minCost = this.safeNumber (market, 'minTradeUSDT');
        }
        const contractSize = contract ? 1 : undefined;
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': spot,
            'margin': false,
            'swap': swap,
            'future': future,
            'option': false,
            'active': active,
            'contract': contract,
            'linear': linear,
            'inverse': inverse,
            'taker': this.safeNumber (market, 'takerFeeRate'),
            'maker': this.safeNumber (market, 'makerFeeRate'),
            'contractSize': contractSize,
            'expiry': expiry,
            'expiryDatetime': expiryDatetime,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': amountPrecision,
                'price': pricePrecision,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber2 (market, 'minTradeNum', 'minTradeAmount'),
                    'max': this.safeNumber (market, 'maxTradeAmount'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': minCost,
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        };
    }

    async fetchMarketsByType (type, params = {}) {
        let response = undefined;
        if (type === 'spot') {
            response = await this.publicSpotGetSpotV1PublicProducts (params);
        } else if (type === 'swap') {
            response = await this.publicMixGetMixV1MarketContracts (params);
        } else {
            throw new NotSupported (this.id + ' does not support ' + type + ' market');
        }
        //
        // spot
        //
        //    {
        //        "code": "00000",
        //        "msg": "success",
        //        "requestTime": 1645840064031,
        //        "data": [
        //            {
        //                "symbol": "ALPHAUSDT_SPBL",
        //                "symbolName": "ALPHAUSDT",
        //                "baseCoin": "ALPHA",
        //                "quoteCoin": "USDT",
        //                "minTradeAmount": "2",
        //                "maxTradeAmount": "0",
        //                "takerFeeRate": "0.001",
        //                "makerFeeRate": "0.001",
        //                "priceScale": "4",
        //                "quantityScale": "4",
        //                "status": "online"
        //            }
        //        ]
        //    }
        //
        // swap
        //
        //    {
        //        "code": "00000",
        //        "msg": "success",
        //        "requestTime": 1645840821493,
        //        "data": [
        //            {
        //                "symbol": "BTCUSDT_UMCBL",
        //                "makerFeeRate": "0.0002",
        //                "takerFeeRate": "0.0006",
        //                "feeRateUpRatio": "0.005",
        //                "openCostUpRatio": "0.01",
        //                "quoteCoin": "USDT",
        //                "baseCoin": "BTC",
        //                "buyLimitPriceRatio": "0.01",
        //                "sellLimitPriceRatio": "0.01",
        //                "supportMarginCoins": [Array],
        //                "minTradeNum": "0.001",
        //                "priceEndStep": "5",
        //                "volumePlace": "3",
        //                "pricePlace": "1"
        //            }
        //        ]
        //    }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseMarkets (data);
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name bitget#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-coin-list
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicSpotGetSpotV1PublicCurrencies (params);
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1645935668288,
        //       "data": [
        //         {
        //           "coinId": "230",
        //           "coinName": "KIN",
        //           "transfer": "false",
        //           "chains": [
        //             {
        //               "chain": "SOL",
        //               "needTag": "false",
        //               "withdrawable": "true",
        //               "rechargeable": "true",
        //               "withdrawFee": "187500",
        //               "depositConfirm": "100",
        //               "withdrawConfirm": "100",
        //               "minDepositAmount": "12500",
        //               "minWithdrawAmount": "250000",
        //               "browserUrl": "https://explorer.solana.com/tx/"
        //             }
        //           ]
        //         }
        //       ]
        //     }
        //
        const result = {};
        const data = this.safeValue (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const id = this.safeString (entry, 'coinId');
            const code = this.safeCurrencyCode (this.safeString (entry, 'coinName'));
            const chains = this.safeValue (entry, 'chains', []);
            const networks = {};
            let deposit = false;
            let withdraw = false;
            let minWithdrawString = undefined;
            let minDepositString = undefined;
            let minWithdrawFeeString = undefined;
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'chain');
                const network = this.safeCurrencyCode (networkId);
                const withdrawEnabled = this.safeString (chain, 'withdrawable');
                const canWithdraw = withdrawEnabled === 'true';
                withdraw = (canWithdraw) ? canWithdraw : withdraw;
                const depositEnabled = this.safeString (chain, 'rechargeable');
                const canDeposit = depositEnabled === 'true';
                deposit = (canDeposit) ? canDeposit : deposit;
                const networkWithdrawFeeString = this.safeString (chain, 'withdrawFee');
                if (networkWithdrawFeeString !== undefined) {
                    minWithdrawFeeString = (minWithdrawFeeString === undefined) ? networkWithdrawFeeString : Precise.stringMin (networkWithdrawFeeString, minWithdrawFeeString);
                }
                const networkMinWithdrawString = this.safeString (chain, 'minWithdrawAmount');
                if (networkMinWithdrawString !== undefined) {
                    minWithdrawString = (minWithdrawString === undefined) ? networkMinWithdrawString : Precise.stringMin (networkMinWithdrawString, minWithdrawString);
                }
                const networkMinDepositString = this.safeString (chain, 'minDepositAmount');
                if (networkMinDepositString !== undefined) {
                    minDepositString = (minDepositString === undefined) ? networkMinDepositString : Precise.stringMin (networkMinDepositString, minDepositString);
                }
                networks[network] = {
                    'info': chain,
                    'id': networkId,
                    'network': network,
                    'limits': {
                        'withdraw': {
                            'min': this.parseNumber (networkMinWithdrawString),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.parseNumber (networkMinDepositString),
                            'max': undefined,
                        },
                    },
                    'active': canWithdraw && canDeposit,
                    'withdraw': canWithdraw,
                    'deposit': canDeposit,
                    'fee': this.parseNumber (networkWithdrawFeeString),
                    'precision': undefined,
                };
            }
            result[code] = {
                'info': entry,
                'id': id,
                'code': code,
                'networks': networks,
                'type': undefined,
                'name': undefined,
                'active': deposit && withdraw,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': this.parseNumber (minWithdrawFeeString),
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.parseNumber (minWithdrawString),
                        'max': undefined,
                    },
                    'deposit': {
                        'min': this.parseNumber (minDepositString),
                        'max': undefined,
                    },
                },
                'created': undefined,
            };
        }
        return result;
    }

    async fetchMarketLeverageTiers (symbol: string, params = {}) {
        /**
         * @method
         * @name bitget#fetchMarketLeverageTiers
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-position-tier
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-isolated-tier-data
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-cross-tier-data
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] for spot margin 'cross' or 'isolated', default is 'isolated'
         * @param {string} [params.code] required for cross spot margin
         * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
         */
        await this.loadMarkets ();
        const request = {};
        const market = this.market (symbol);
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchMarketLeverageTiers', market, params);
        let response = undefined;
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchMarketLeverageTiers', params, 'isolated');
        if ((type === 'swap') || (type === 'future')) {
            const marketId = market['id'];
            const parts = marketId.split ('_');
            const productType = this.safeStringUpper (parts, 1);
            request['symbol'] = marketId;
            request['productType'] = productType;
            response = await this.publicMixGetMixV1MarketQueryPositionLever (this.extend (request, params));
        } else if (marginMode === 'isolated') {
            request['symbol'] = market['info']['symbolName'];
            response = await this.publicMarginGetMarginV1IsolatedPublicTierData (this.extend (request, params));
        } else if (marginMode === 'cross') {
            const code = this.safeString (params, 'code');
            if (code === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchMarketLeverageTiers() requires a code argument');
            }
            params = this.omit (params, 'code');
            const currency = this.currency (code);
            request['coin'] = currency['code'];
            response = await this.publicMarginGetMarginV1CrossPublicTierData (this.extend (request, params));
        } else {
            throw new BadRequest (this.id + ' fetchMarketLeverageTiers() symbol does not support market ' + symbol);
        }
        //
        // swap and future
        //
        //     {
        //         "code":"00000",
        //         "data":[
        //             {
        //                 "level": 1,
        //                 "startUnit": 0,
        //                 "endUnit": 150000,
        //                 "leverage": 125,
        //                 "keepMarginRate": "0.004"
        //             }
        //         ],
        //         "msg":"success",
        //         "requestTime":1627292076687
        //     }
        //
        // isolated
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1698352496622,
        //         "data": [
        //             {
        //                 "tier": "1",
        //                 "symbol": "BTCUSDT",
        //                 "leverage": "10",
        //                 "baseCoin": "BTC",
        //                 "quoteCoin": "USDT",
        //                 "baseMaxBorrowableAmount": "3",
        //                 "quoteMaxBorrowableAmount": "30000",
        //                 "maintainMarginRate": "0.05",
        //                 "initRate": "0.1111"
        //             },
        //         ]
        //     }
        //
        // cross
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1698352997077,
        //         "data": [
        //             {
        //                 "tier": "1",
        //                 "leverage": "3",
        //                 "coin": "BTC",
        //                 "maxBorrowableAmount": "26",
        //                 "maintainMarginRate": "0.1"
        //             }
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'data', []);
        return this.parseMarketLeverageTiers (result, market);
    }

    parseMarketLeverageTiers (info, market: Market = undefined) {
        //
        // swap and future
        //
        //     [
        //         {
        //             "level": 1,
        //             "startUnit": 0,
        //             "endUnit": 150000,
        //             "leverage": 125,
        //             "keepMarginRate": "0.004"
        //         }
        //     ]
        //
        // isolated
        //
        //     [
        //         {
        //             "tier": "1",
        //             "symbol": "BTCUSDT",
        //             "leverage": "10",
        //             "baseCoin": "BTC",
        //             "quoteCoin": "USDT",
        //             "baseMaxBorrowableAmount": "3",
        //             "quoteMaxBorrowableAmount": "30000",
        //             "maintainMarginRate": "0.05",
        //             "initRate": "0.1111"
        //         }
        //     ]
        //
        // cross
        //
        //     [
        //         {
        //             "tier": "1",
        //             "leverage": "3",
        //             "coin": "BTC",
        //             "maxBorrowableAmount": "26",
        //             "maintainMarginRate": "0.1"
        //         }
        //     ]
        //
        const tiers = [];
        let minNotional = 0;
        for (let i = 0; i < info.length; i++) {
            const item = info[i];
            const minimumNotional = this.safeNumber (item, 'startUnit');
            if (minimumNotional !== undefined) {
                minNotional = minimumNotional;
            }
            const maxNotional = this.safeNumberN (item, [ 'endUnit', 'maxBorrowableAmount', 'baseMaxBorrowableAmount' ]);
            const marginCurrency = this.safeString2 (item, 'coin', 'baseCoin');
            const currencyId = (marginCurrency !== undefined) ? marginCurrency : market['base'];
            tiers.push ({
                'tier': this.safeInteger2 (item, 'level', 'tier'),
                'currency': this.safeCurrencyCode (currencyId),
                'minNotional': minNotional,
                'maxNotional': maxNotional,
                'maintenanceMarginRate': this.safeNumber2 (item, 'keepMarginRate', 'maintainMarginRate'),
                'maxLeverage': this.safeNumber (item, 'leverage'),
                'info': item,
            });
            minNotional = maxNotional;
        }
        return tiers;
    }

    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name bitget#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-deposit-list
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.pageNo] pageNo default 1
         * @param {string} [params.pageSize] pageSize default 20. Max 100
         * @param {int} [params.until] end tim in ms
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchDeposits', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchDeposits', code, since, limit, params);
        }
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits() requires a `code` argument');
        }
        const currency = this.currency (code);
        if (since === undefined) {
            since = this.milliseconds () - 7776000000; // 90 days
        }
        let request = {
            'coin': currency['code'],
            'startTime': since,
            'endTime': this.milliseconds (),
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        const response = await this.privateSpotGetSpotV1WalletDepositList (this.extend (request, params));
        //
        //      {
        //          "code": "00000",
        //          "msg": "success",
        //          "requestTime": 0,
        //          "data": [{
        //              "id": "925607360021839872",
        //              "txId": "f73a4ac034da06b729f49676ca8801f406a093cf90c69b16e5a1cc9080df4ccb",
        //              "coin": "USDT",
        //              "type": "deposit",
        //              "amount": "19.44800000",
        //              "status": "success",
        //              "toAddress": "TRo4JMfZ1XYHUgnLsUMfDEf8MWzcWaf8uh",
        //              "fee": null,
        //              "chain": "TRC20",
        //              "confirm": null,
        //              "cTime": "1656407912259",
        //              "uTime": "1656407940148"
        //          }]
        //      }
        //
        const rawTransactions = this.safeValue (response, 'data', []);
        return this.parseTransactions (rawTransactions, currency, since, limit);
    }

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bitget#withdraw
         * @description make a withdrawal
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#withdraw-v2
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.chain] the chain to withdraw to
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        this.checkAddress (address);
        const chain = this.safeString2 (params, 'chain', 'network');
        params = this.omit (params, [ 'network' ]);
        if (chain === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires a chain parameter or a network parameter');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const networkId = this.networkCodeToId (chain);
        const request = {
            'coin': currency['code'],
            'address': address,
            'chain': networkId,
            'amount': amount,
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const response = await this.privateSpotPostSpotV1WalletWithdrawalV2 (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "data": "888291686266343424"
        //     }
        //
        //     {
        //          "code":"00000",
        //          "msg":"success",
        //          "requestTime":1696784219602,
        //          "data":{
        //              "orderId":"1094957867615789056",
        //              "clientOrderId":"64f1e4ce842041d296b4517df1b5c2d7"
        //          }
        //      }
        //
        const data = this.safeValue (response, 'data');
        let id = undefined;
        if (typeof data === 'string') {
            id = data;
        } else if (data !== undefined) {
            id = this.safeString (data, 'orderId');
        }
        const result = {
            'id': id,
            'info': response,
            'txid': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'network': undefined,
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': undefined,
            'amount': undefined,
            'type': 'withdrawal',
            'currency': undefined,
            'status': undefined,
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': undefined,
            'fee': undefined,
        };
        const withdrawOptions = this.safeValue (this.options, 'withdraw', {});
        const fillResponseFromRequest = this.safeValue (withdrawOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            result['currency'] = code;
            result['timestamp'] = this.milliseconds ();
            result['datetime'] = this.iso8601 (this.milliseconds ());
            result['amount'] = amount;
            result['tag'] = tag;
            result['address'] = address;
            result['addressTo'] = address;
            result['network'] = chain;
        }
        return result;
    }

    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name bitget#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-withdraw-list
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.pageNo] pageNo default 1
         * @param {string} [params.pageSize] pageSize default 20. Max 100
         * @param {int} [params.until] end time in ms
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchWithdrawals', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchWithdrawals', code, since, limit, params);
        }
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals() requires a `code` argument');
        }
        const currency = this.currency (code);
        if (since === undefined) {
            since = this.milliseconds () - 7776000000; // 90 days
        }
        let request = {
            'coin': currency['code'],
            'startTime': since,
            'endTime': this.milliseconds (),
        };
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateSpotGetSpotV1WalletWithdrawalList (this.extend (request, params));
        //
        //      {
        //          "code": "00000",
        //          "msg": "success",
        //          "requestTime": 0,
        //          "data": [{
        //              "id": "925607360021839872",
        //              "txId": "f73a4ac034da06b729f49676ca8801f406a093cf90c69b16e5a1cc9080df4ccb",
        //              "coin": "USDT",
        //              "type": "deposit",
        //              "amount": "19.44800000",
        //              "status": "success",
        //              "toAddress": "TRo4JMfZ1XYHUgnLsUMfDEf8MWzcWaf8uh",
        //              "fee": null,
        //              "chain": "TRC20",
        //              "confirm": null,
        //              "cTime": "1656407912259",
        //              "uTime": "1656407940148"
        //          }]
        //      }
        //
        const rawTransactions = this.safeValue (response, 'data', []);
        return this.parseTransactions (rawTransactions, currency, since, limit);
    }

    parseTransaction (transaction, currency: Currency = undefined): Transaction {
        //
        //     {
        //         "id": "925607360021839872",
        //         "txId": "f73a4ac034da06b729f49676ca8801f406a093cf90c69b16e5a1cc9080df4ccb",
        //         "coin": "USDT",
        //         "type": "deposit",
        //         "amount": "19.44800000",
        //         "status": "success",
        //         "toAddress": "TRo4JMfZ1XYHUgnLsUMfDEf8MWzcWaf8uh",
        //         "fee": "-3.06388160",
        //         "chain": "TRC20",
        //         "confirm": null,
        //         "tag": null,
        //         "cTime": "1656407912259",
        //         "uTime": "1656407940148"
        //     }
        //
        const currencyId = this.safeString (transaction, 'coin');
        const code = this.safeCurrencyCode (currencyId);
        let amountString = this.safeString (transaction, 'amount');
        const timestamp = this.safeInteger (transaction, 'cTime');
        const networkId = this.safeString (transaction, 'chain');
        const status = this.safeString (transaction, 'status');
        const tag = this.safeString (transaction, 'tag');
        const feeCostString = this.safeString (transaction, 'fee');
        const feeCostAbsString = Precise.stringAbs (feeCostString);
        let fee = undefined;
        if (feeCostAbsString !== undefined) {
            fee = { 'currency': code, 'cost': this.parseNumber (feeCostAbsString) };
            amountString = Precise.stringSub (amountString, feeCostAbsString);
        }
        return {
            'id': this.safeString (transaction, 'id'),
            'info': transaction,
            'txid': this.safeString (transaction, 'txId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': this.networkIdToCode (networkId),
            'addressFrom': undefined,
            'address': this.safeString (transaction, 'toAddress'),
            'addressTo': this.safeString (transaction, 'toAddress'),
            'amount': this.parseNumber (amountString),
            'type': this.safeString (transaction, 'type'),
            'currency': code,
            'status': this.parseTransactionStatus (status),
            'updated': this.safeInteger (transaction, 'uTime'),
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'comment': undefined,
            'internal': undefined,
            'fee': fee,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'success': 'ok',
            'Pending': 'pending',
            'pending_review': 'pending',
            'pending_review_fail': 'failed',
            'reject': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name bitget#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-coin-address
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const networkCode = this.safeString (params, 'network');
        const networkId = this.networkCodeToId (networkCode, code);
        const currency = this.currency (code);
        const request = {
            'coin': currency['code'],
        };
        if (networkId !== undefined) {
            request['chain'] = networkId;
        }
        const response = await this.privateSpotGetSpotV1WalletDepositAddress (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "data": {
        //             "address": "1HPn8Rx2y6nNSfagQBKy27GB99Vbzg89wv",
        //             "chain": "BTC-Bitcoin",
        //             "coin": "BTC",
        //             "tag": "",
        //             "url": "https://btc.com/1HPn8Rx2y6nNSfagQBKy27GB99Vbzg89wv"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseDepositAddress (data, currency);
    }

    parseDepositAddress (depositAddress, currency: Currency = undefined) {
        //
        //    {
        //        "address": "1HPn8Rx2y6nNSfagQBKy27GB99Vbzg89wv",
        //        "chain": "BTC-Bitcoin",
        //        "coin": "BTC",
        //        "tag": "",
        //        "url": "https://btc.com/1HPn8Rx2y6nNSfagQBKy27GB99Vbzg89wv"
        //    }
        //
        const currencyId = this.safeString (depositAddress, 'coin');
        const networkId = this.safeString (depositAddress, 'chain');
        const parsedCurrency = this.safeCurrencyCode (currencyId, currency);
        return {
            'currency': parsedCurrency,
            'address': this.safeString (depositAddress, 'address'),
            'tag': this.safeString (depositAddress, 'tag'),
            'network': this.networkIdToCode (networkId, parsedCurrency),
            'info': depositAddress,
        };
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name bitget#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-depth
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-depth
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.publicSpotGetSpotV1MarketDepth (this.extend (request, params));
        } else {
            response = await this.publicMixGetMixV1MarketDepth (this.extend (request, params));
        }
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1645854610294,
        //       "data": {
        //         "asks": [ [ "39102", "11.026" ] ],
        //         "bids": [ [ '39100.5', "1.773" ] ],
        //         "timestamp": "1645854610294"
        //       }
        //     }
        //
        const data = this.safeValue (response, 'data');
        const timestamp = this.safeInteger (data, 'timestamp');
        return this.parseOrderBook (data, symbol, timestamp);
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        //
        // spot
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "high24h": "40252.43",
        //         "low24h": "38548.54",
        //         "close": "39102.16",
        //         "quoteVol": "67295596.1458",
        //         "baseVol": "1723.4152",
        //         "usdtVol": "67295596.14578",
        //         "ts": "1645856170030",
        //         "buyOne": "39096.16",
        //         "sellOne": "39103.99"
        //     }
        //
        // swap
        //
        //     {
        //         "symbol": "BTCUSDT_UMCBL",
        //         "last": "39086",
        //         "bestAsk": "39087",
        //         "bestBid": "39086",
        //         "high24h": "40312",
        //         "low24h": "38524.5",
        //         "timestamp": "1645856591864",
        //         "priceChangePercent": "-0.00861",
        //         "baseVolume": "142251.757",
        //         "quoteVolume": "5552388715.9215",
        //         "usdtVolume": "5552388715.9215"
        //     }
        // spot tickers
        //    {
        //        "symbol":"LINKUSDT",
        //        "high24h":"5.2816",
        //        "low24h":"5.0828",
        //        "close":"5.24",
        //        "quoteVol":"1427864.6815",
        //        "baseVol":"276089.9017",
        //        "usdtVol":"1427864.68148328",
        //        "ts":"1686653354407",
        //        "buyOne":"5.239",
        //        "sellOne":"5.2404",
        //        "+":"95.187",
        //        "askSz":"947.6127",
        //        "openUtc0":"5.1599",
        //        "changeUtc":"0.01552",
        //        "change":"0.02594"
        //    }
        // swap tickers
        //    {
        //        "symbol":"BTCUSDT_UMCBL",
        //        "last":"26139",
        //        "bestAsk":"26139",
        //        "bestBid":"26138.5",
        //        "bidSz":"4.62",
        //        "askSz":"11.142",
        //        "high24h":"26260",
        //        "low24h":"25637",
        //        "timestamp":"1686653988192",
        //        "priceChangePercent":"0.01283",
        //        "baseVolume":"130207.098",
        //        "quoteVolume":"3378775678.441",
        //        "usdtVolume":"3378775678.441",
        //        "openUtc":"25889",
        //        "chgUtc":"0.00966",
        //        "indexPrice":"26159.375846",
        //        "fundingRate":"0.000062",
        //        "holdingAmount":"74551.735"
        //    }
        //
        let marketId = this.safeString (ticker, 'symbol');
        if ((market === undefined) && (marketId !== undefined) && (marketId.indexOf ('_') === -1)) {
            // fetchTickers fix:
            // spot symbol are different from the "request id"
            // so we need to convert it to the exchange-specific id
            // otherwise we will not be able to find the market
            marketId = marketId + '_SPBL';
        }
        const symbol = this.safeSymbol (marketId, market);
        const high = this.safeString (ticker, 'high24h');
        const low = this.safeString (ticker, 'low24h');
        const close = this.safeString2 (ticker, 'close', 'last');
        const quoteVolume = this.safeString2 (ticker, 'quoteVol', 'quoteVolume');
        const baseVolume = this.safeString2 (ticker, 'baseVol', 'baseVolume');
        const timestamp = this.safeInteger2 (ticker, 'ts', 'timestamp');
        const bidVolume = this.safeString (ticker, 'bidSz');
        const askVolume = this.safeString (ticker, 'askSz');
        const datetime = this.iso8601 (timestamp);
        const bid = this.safeString2 (ticker, 'buyOne', 'bestBid');
        const ask = this.safeString2 (ticker, 'sellOne', 'bestAsk');
        const percentage = Precise.stringMul (this.safeStringN (ticker, [ 'priceChangePercent', 'changeUtc', 'change', 'chgUtc' ]), '100');
        const open = this.safeString2 (ticker, 'openUtc0', 'openUtc');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': datetime,
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name bitget#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-single-ticker
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-single-symbol-ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        const extended = this.extend (request, params);
        if (market['spot']) {
            response = await this.publicSpotGetSpotV1MarketTicker (extended);
        } else {
            response = await this.publicMixGetMixV1MarketTicker (extended);
        }
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": "1645856138576",
        //         "data": {
        //             "symbol": "BTCUSDT",
        //             "high24h": "40252.43",
        //             "low24h": "38548.54",
        //             "close": "39104.65",
        //             "quoteVol": "67221762.2184",
        //             "baseVol": "1721.527",
        //             "usdtVol": "67221762.218361",
        //             "ts": "1645856138031",
        //             "buyOne": "39102.55",
        //             "sellOne": "39110.56"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name bitget#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-all-tickers
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-all-symbol-ticker
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const sandboxMode = this.safeValue (this.options, 'sandboxMode', false);
        await this.loadMarkets ();
        let type = undefined;
        let market = undefined;
        if (symbols !== undefined) {
            const symbol = this.safeValue (symbols, 0);
            market = this.market (symbol);
        }
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        const request = {};
        if (type !== 'spot') {
            let subType = undefined;
            [ subType, params ] = this.handleSubTypeAndParams ('fetchTickers', undefined, params);
            let productType = (subType === 'linear') ? 'UMCBL' : 'DMCBL';
            if (sandboxMode) {
                productType = 'S' + productType;
            }
            request['productType'] = productType;
        }
        const extended = this.extend (request, params);
        let response = undefined;
        if (type === 'spot') {
            response = await this.publicSpotGetSpotV1MarketTickers (extended);
        } else {
            response = await this.publicMixGetMixV1MarketTickers (extended);
        }
        //
        // spot
        //
        //     {
        //         "code":"00000",
        //         "msg":"success",
        //         "requestTime":1653237548496,
        //         "data":[
        //             {
        //                 "symbol":"LINKUSDT",
        //                 "high24h":"7.2634",
        //                 "low24h":"7.1697",
        //                 "close":"7.2444",
        //                 "quoteVol":"330424.2366",
        //                 "baseVol":"46401.3116",
        //                 "usdtVol":"330424.2365573",
        //                 "ts":"1653237548026",
        //                 "buyOne":"7.2382",
        //                 "sellOne":"7.2513"
        //             },
        //         ]
        //     }
        //
        // swap
        //
        //     {
        //         "code":"00000",
        //         "msg":"success",
        //         "requestTime":1653237819762,
        //         "data":[
        //             {
        //                 "symbol":"BTCUSDT_UMCBL",
        //                 "last":"29891.5",
        //                 "bestAsk":"29891.5",
        //                 "bestBid":"29889.5",
        //                 "high24h":"29941.5",
        //                 "low24h":"29737.5",
        //                 "timestamp":"1653237819761",
        //                 "priceChangePercent":"0.00163",
        //                 "baseVolume":"127937.56",
        //                 "quoteVolume":"3806276573.6285",
        //                 "usdtVolume":"3806276573.6285"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTickers (data, symbols);
    }

    parseTrade (trade, market: Market = undefined): Trade {
        //
        // spot
        //
        //     {
        //         "symbol": "BTCUSDT_SPBL",
        //         "tradeId": "1075200479040323585",
        //         "side": "Sell",
        //         "fillPrice": "29381.54",
        //         "fillQuantity": "0.0056",
        //         "fillTime": "1692073691000"
        //     }
        //
        // swap (public trades)
        //
        //     {
        //         "tradeId": "1075199767891652609",
        //         "price": "29376.5",
        //         "size": "6.035",
        //         "side": "Buy",
        //         "timestamp": "1692073521000",
        //         "symbol": "BTCUSDT_UMCBL"
        //     }
        //
        // spot: fetchMyTrades
        //
        //     {
        //         "accountId": "7264631750",
        //         "symbol": "BTCUSDT_SPBL",
        //         "orderId": "1098394344925597696",
        //         "fillId": "1098394344974925824",
        //         "orderType": "market",
        //         "side": "sell",
        //         "fillPrice": "28467.68",
        //         "fillQuantity": "0.0002",
        //         "fillTotalAmount": "5.693536",
        //         "feeCcy": "USDT",
        //         "fees": "-0.005693536",
        //         "takerMakerFlag": "taker",
        //         "cTime": "1697603539699"
        //     }
        //
        // swap and future: fetchMyTrades
        //
        //     {
        //         "tradeId": "1099351653724958721",
        //         "symbol": "BTCUSDT_UMCBL",
        //         "orderId": "1099351653682413569",
        //         "price": "29531.3",
        //         "sizeQty": "0.001",
        //         "fee": "-0.01771878",
        //         "side": "close_long",
        //         "fillAmount": "29.5313",
        //         "profit": "0.001",
        //         "enterPointSource": "WEB",
        //         "tradeSide": "close_long",
        //         "holdMode": "double_hold",
        //         "takerMakerFlag": "taker",
        //         "cTime": "1697831779891"
        //     }
        //
        // isolated and cross margin: fetchMyTrades
        //
        //     {
        //         "orderId": "1099353730455318528",
        //         "fillId": "1099353730627092481",
        //         "orderType": "market",
        //         "side": "sell",
        //         "fillPrice": "29543.7",
        //         "fillQuantity": "0.0001",
        //         "fillTotalAmount": "2.95437",
        //         "feeCcy": "USDT",
        //         "fees": "-0.00295437",
        //         "ctime": "1697832275063"
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeIntegerN (trade, [ 'fillTime', 'timestamp', 'ctime', 'cTime' ]);
        let fee = undefined;
        const feeAmount = this.safeString (trade, 'fees');
        if (feeAmount !== undefined) {
            const currencyCode = this.safeCurrencyCode (this.safeString (trade, 'feeCcy'));
            fee = {
                'code': currencyCode, // kept here for backward-compatibility, but will be removed soon
                'currency': currencyCode,
                'cost': Precise.stringNeg (feeAmount),
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString2 (trade, 'tradeId', 'fillId'),
            'order': this.safeString (trade, 'orderId'),
            'symbol': symbol,
            'side': this.safeStringLower (trade, 'side'),
            'type': this.safeString (trade, 'orderType'),
            'takerOrMaker': this.safeString (trade, 'takerMakerFlag'),
            'price': this.safeString2 (trade, 'fillPrice', 'price'),
            'amount': this.safeStringN (trade, [ 'fillQuantity', 'size', 'sizeQty' ]),
            'cost': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name bitget#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-market-trades
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-fills
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-recent-trades
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-recent-fills
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch deposits for
         * @param {boolean} [params.paginate] *only applies to publicSpotGetMarketFillsHistory and publicMixGetMarketFillsHistory* default false, when true will automatically paginate by calling this endpoint multiple times
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchTrades', symbol, since, limit, params, 'tradeId', 'tradeId') as Trade[];
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger2 (params, 'until', 'endTime');
        if (since !== undefined) {
            request['startTime'] = since;
            if (until === undefined) {
                const now = this.milliseconds ();
                request['endTime'] = now;
            }
        }
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['endTime'] = until;
        }
        const options = this.safeValue (this.options, 'fetchTrades', {});
        let response = undefined;
        if (market['spot']) {
            const spotOptions = this.safeValue (options, 'spot', {});
            const defaultSpotMethod = this.safeString (spotOptions, 'method', 'publicSpotGetSpotV1MarketFillsHistory');
            const spotMethod = this.safeString (params, 'method', defaultSpotMethod);
            params = this.omit (params, 'method');
            if (spotMethod === 'publicSpotGetSpotV1MarketFillsHistory') {
                response = await this.publicSpotGetSpotV1MarketFillsHistory (this.extend (request, params));
            } else if (spotMethod === 'publicSpotGetSpotV1MarketFills') {
                response = await this.publicSpotGetSpotV1MarketFills (this.extend (request, params));
            }
        } else {
            const swapOptions = this.safeValue (options, 'swap', {});
            const defaultSwapMethod = this.safeString (swapOptions, 'method', 'publicMixGetMixV1MarketFillsHistory');
            const swapMethod = this.safeString (params, 'method', defaultSwapMethod);
            params = this.omit (params, 'method');
            if (swapMethod === 'publicMixGetMixV1MarketFillsHistory') {
                response = await this.publicMixGetMixV1MarketFillsHistory (this.extend (request, params));
                //
                //     {
                //         "tradeId": "1084459062491590657",
                //         "price": "25874",
                //         "size": "1.624",
                //         "side": "Buy",
                //         "timestamp": "1694281109000",
                //         "symbol": "BTCUSDT_UMCBL",
                //     }
                //
            } else if (swapMethod === 'publicMixGetMixV1MarketFills') {
                response = await this.publicMixGetMixV1MarketFills (this.extend (request, params));
            }
        }
        //
        // spot
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1692073693562,
        //         "data": [
        //             {
        //                 "symbol": "BTCUSDT_SPBL",
        //                 "tradeId": "1075200479040323585",
        //                 "side": "Sell",
        //                 "fillPrice": "29381.54",
        //                 "fillQuantity": "0.0056",
        //                 "fillTime": "1692073691000"
        //             },
        //         ]
        //     }
        //
        // swap
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1692073522689,
        //         "data": [
        //             {
        //                 "tradeId": "1075199767891652609",
        //                 "price": "29376.5",
        //                 "size": "6.035",
        //                 "side": "Buy",
        //                 "timestamp": "1692073521000",
        //                 "symbol": "BTCUSDT_UMCBL"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchTradingFee (symbol: string, params = {}) {
        /**
         * @method
         * @name bitget#fetchTradingFee
         * @description fetch the trading fees for a market
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-single-symbol
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicSpotGetSpotV1PublicProduct (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": "1646255374000",
        //         "data": {
        //           "symbol": "ethusdt_SPBL",
        //           "symbolName": null,
        //           "baseCoin": "ETH",
        //           "quoteCoin": "USDT",
        //           "minTradeAmount": "0",
        //           "maxTradeAmount": "0",
        //           "takerFeeRate": "0.002",
        //           "makerFeeRate": "0.002",
        //           "priceScale": "2",
        //           "quantityScale": "4",
        //           "status": "online"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTradingFee (data, market);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name bitget#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.publicSpotGetSpotV1PublicProducts (params);
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": "1646255662391",
        //         "data": [
        //           {
        //             "symbol": "ALPHAUSDT_SPBL",
        //             "symbolName": "ALPHAUSDT",
        //             "baseCoin": "ALPHA",
        //             "quoteCoin": "USDT",
        //             "minTradeAmount": "2",
        //             "maxTradeAmount": "0",
        //             "takerFeeRate": "0.001",
        //             "makerFeeRate": "0.001",
        //             "priceScale": "4",
        //             "quantityScale": "4",
        //             "status": "online"
        //           },
        //           ...
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const feeInfo = data[i];
            const fee = this.parseTradingFee (feeInfo);
            const symbol = fee['symbol'];
            result[symbol] = fee;
        }
        return result;
    }

    parseTradingFee (data, market: Market = undefined) {
        const marketId = this.safeString (data, 'symbol');
        return {
            'info': data,
            'symbol': this.safeSymbol (marketId, market),
            'maker': this.safeNumber (data, 'makerFeeRate'),
            'taker': this.safeNumber (data, 'takerFeeRate'),
        };
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        // spot
        //
        //     {
        //         "open": "57882.31",
        //         "high": "58967.24",
        //         "low": "57509.56",
        //         "close": "57598.96",
        //         "quoteVol": "439160536.605821",
        //         "baseVol": "7531.2927",
        //         "usdtVol": "439160536.605821",
        //         "ts": "1637337600000"
        //     }
        //
        // swap
        //
        //     [
        //         "1645911960000",
        //         "39406",
        //         "39407",
        //         "39374.5",
        //         "39379",
        //         "35.526",
        //         "1399132.341"
        //     ]
        //
        return [
            this.safeInteger2 (ohlcv, 0, 'ts'),
            this.safeNumber2 (ohlcv, 1, 'open'),
            this.safeNumber2 (ohlcv, 2, 'high'),
            this.safeNumber2 (ohlcv, 3, 'low'),
            this.safeNumber2 (ohlcv, 4, 'close'),
            this.safeNumber2 (ohlcv, 5, 'baseVol'),
        ];
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name bitget#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-candle-data
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-history-candle-data
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-candle-data
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-history-candle-data
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-history-index-candle-data
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-history-mark-candle-data
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest candle to fetch
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, 1000) as OHLCV[];
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const until = this.safeInteger2 (params, 'until', 'till');
        const limitIsUndefined = (limit === undefined);
        if (limit === undefined) {
            limit = 200;
        }
        request['limit'] = limit;
        const marketType = market['spot'] ? 'spot' : 'swap';
        const timeframes = this.options['timeframes'][marketType];
        const selectedTimeframe = this.safeString (timeframes, timeframe, timeframe);
        const duration = this.parseTimeframe (timeframe);
        if (market['spot']) {
            request['period'] = selectedTimeframe;
            request['limit'] = limit;
            if (since !== undefined) {
                request['after'] = since;
                if (until === undefined) {
                    request['before'] = this.sum (since, limit * duration * 1000);
                }
            }
            if (until !== undefined) {
                request['before'] = until;
            }
        } else if (market['contract']) {
            request['granularity'] = selectedTimeframe;
            const now = this.milliseconds ();
            if (since === undefined) {
                request['startTime'] = now - limit * (duration * 1000);
                request['endTime'] = now;
            } else {
                request['startTime'] = since;
                if (until !== undefined) {
                    request['endTime'] = until;
                } else {
                    request['endTime'] = this.sum (since, limit * duration * 1000);
                }
            }
        }
        const options = this.safeValue (this.options, 'fetchOHLCV', {});
        params = this.omit (params, [ 'until', 'till' ]);
        let response = undefined;
        if (market['spot']) {
            const spotOptions = this.safeValue (options, 'spot', {});
            const defaultSpotMethod = this.safeString (spotOptions, 'method', 'publicSpotGetSpotV1MarketCandles');
            const method = this.safeString (params, 'method', defaultSpotMethod);
            params = this.omit (params, 'method');
            if (method === 'publicSpotGetSpotV1MarketCandles') {
                if (limitIsUndefined) {
                    request['limit'] = 1000;
                }
                response = await this.publicSpotGetSpotV1MarketCandles (this.extend (request, params));
            } else if (method === 'publicSpotGetSpotV1MarketHistoryCandles') {
                response = await this.publicSpotGetSpotV1MarketHistoryCandles (this.extend (request, params));
            }
        } else {
            const swapOptions = this.safeValue (options, 'swap', {});
            const defaultSwapMethod = this.safeString (swapOptions, 'method', 'publicMixGetMixV1MarketCandles');
            const swapMethod = this.safeString (params, 'method', defaultSwapMethod);
            const priceType = this.safeString (params, 'price');
            params = this.omit (params, [ 'method', 'price' ]);
            if ((priceType === 'mark') || (swapMethod === 'publicMixGetMixV1MarketHistoryMarkCandles')) {
                response = await this.publicMixGetMixV1MarketHistoryMarkCandles (this.extend (request, params));
            } else if ((priceType === 'index') || (swapMethod === 'publicMixGetMixV1MarketHistoryIndexCandles')) {
                response = await this.publicMixGetMixV1MarketHistoryIndexCandles (this.extend (request, params));
            } else if (swapMethod === 'publicMixGetMixV1MarketCandles') {
                if (limitIsUndefined) {
                    request['limit'] = 1000;
                }
                response = await this.publicMixGetMixV1MarketCandles (this.extend (request, params));
            } else if (swapMethod === 'publicMixGetMixV1MarketHistoryCandles') {
                response = await this.publicMixGetMixV1MarketHistoryCandles (this.extend (request, params));
            }
        }
        if (response === '') {
            return []; // happens when a new token is listed
        }
        //  [ ["1645911960000","39406","39407","39374.5","39379","35.526","1399132.341"] ]
        const data = this.safeValue (response, 'data', response);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name bitget#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-account-assets
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-account-list
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-cross-assets
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-isolated-assets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        const sandboxMode = this.safeValue (this.options, 'sandboxMode', false);
        await this.loadMarkets ();
        const request = {};
        let marketType = undefined;
        let marginMode = undefined;
        let response = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchBalance', params);
        if ((marketType === 'swap') || (marketType === 'future')) {
            let subType = undefined;
            [ subType, params ] = this.handleSubTypeAndParams ('fetchBalance', undefined, params);
            let productType = (subType === 'linear') ? 'UMCBL' : 'DMCBL';
            if (sandboxMode) {
                productType = 'S' + productType;
            }
            request['productType'] = productType;
            response = await this.privateMixGetMixV1AccountAccounts (this.extend (request, params));
        } else if (marginMode === 'isolated') {
            response = await this.privateMarginGetMarginV1IsolatedAccountAssets (this.extend (request, params));
        } else if (marginMode === 'cross') {
            response = await this.privateMarginGetMarginV1CrossAccountAssets (this.extend (request, params));
        } else if (marketType === 'spot') {
            response = await this.privateSpotGetSpotV1AccountAssets (this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchBalance() does not support ' + marketType + ' accounts');
        }
        // spot
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697507299139,
        //         "data": [
        //             {
        //                 "coinId": 1,
        //                 "coinName": "BTC",
        //                 "available": "0.00000000",
        //                 "frozen": "0.00000000",
        //                 "lock": "0.00000000",
        //                 "uTime": "1697248128000"
        //             },
        //         ]
        //     }
        //
        // swap
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697507505367,
        //         "data": [
        //             {
        //                 "marginCoin": "STETH",
        //                 "locked": "0",
        //                 "available": "0",
        //                 "crossMaxAvailable": "0",
        //                 "fixedMaxAvailable": "0",
        //                 "maxTransferOut": "0",
        //                 "equity": "0",
        //                 "usdtEquity": "0",
        //                 "btcEquity": "0",
        //                 "crossRiskRate": "0",
        //                 "unrealizedPL": "0",
        //                 "bonus": "0"
        //             },
        //         ]
        //     }
        //
        // isolated margin
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697501436571,
        //         "data": [
        //             {
        //                 "symbol": "BTCUSDT",
        //                 "coin": "BTC",
        //                 "totalAmount": "0.00021654",
        //                 "available": "0.00021654",
        //                 "transferable": "0.00021654",
        //                 "frozen": "0",
        //                 "borrow": "0",
        //                 "interest": "0",
        //                 "net": "0.00021654",
        //                 "ctime": "1697248128071"
        //             },
        //         ]
        //     }
        //
        // cross margin
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697515463804,
        //         "data": [
        //             {
        //                 "coin": "BTC",
        //                 "totalAmount": "0.00024996",
        //                 "available": "0.00024996",
        //                 "transferable": "0.00004994",
        //                 "frozen": "0",
        //                 "borrow": "0.0001",
        //                 "interest": "0.00000001",
        //                 "net": "0.00014995",
        //                 "ctime": "1697251265504"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseBalance (data);
    }

    parseBalance (balance): Balances {
        const result = { 'info': balance };
        //
        // spot
        //
        //     {
        //         "coinId": 1,
        //         "coinName": "BTC",
        //         "available": "0.00000000",
        //         "frozen": "0.00000000",
        //         "lock": "0.00000000",
        //         "uTime": "1697248128000"
        //     }
        //
        // swap
        //
        //     {
        //         "marginCoin": "STETH",
        //         "locked": "0",
        //         "available": "0",
        //         "crossMaxAvailable": "0",
        //         "fixedMaxAvailable": "0",
        //         "maxTransferOut": "0",
        //         "equity": "0",
        //         "usdtEquity": "0",
        //         "btcEquity": "0",
        //         "crossRiskRate": "0",
        //         "unrealizedPL": "0",
        //         "bonus": "0"
        //     }
        //
        // isolated margin
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "coin": "BTC",
        //         "totalAmount": "0.00021654",
        //         "available": "0.00021654",
        //         "transferable": "0.00021654",
        //         "frozen": "0",
        //         "borrow": "0",
        //         "interest": "0",
        //         "net": "0.00021654",
        //         "ctime": "1697248128071"
        //     }
        //
        // cross margin
        //
        //     {
        //         "coin": "BTC",
        //         "totalAmount": "0.00024995",
        //         "available": "0.00024995",
        //         "transferable": "0.00004993",
        //         "frozen": "0",
        //         "borrow": "0.0001",
        //         "interest": "0.00000001",
        //         "net": "0.00014994",
        //         "ctime": "1697251265504"
        //     }
        //
        for (let i = 0; i < balance.length; i++) {
            const entry = balance[i];
            const account = this.account ();
            const currencyId = this.safeStringN (entry, [ 'coinName', 'marginCoin', 'coin' ]);
            const code = this.safeCurrencyCode (currencyId);
            const borrow = this.safeString (entry, 'borrow');
            if (borrow !== undefined) {
                const interest = this.safeString (entry, 'interest');
                account['free'] = this.safeString (entry, 'transferable');
                account['total'] = this.safeString (entry, 'totalAmount');
                account['debt'] = Precise.stringAdd (borrow, interest);
            } else {
                // Use transferable instead of available for swap and margin https://github.com/ccxt/ccxt/pull/19127
                const spotAccountFree = this.safeString (entry, 'available');
                const contractAccountFree = this.safeString (entry, 'maxTransferOut');
                account['free'] = (contractAccountFree !== undefined) ? contractAccountFree : spotAccountFree;
                const frozen = this.safeString (entry, 'frozen');
                const locked = this.safeString2 (entry, 'lock', 'locked');
                account['used'] = Precise.stringAdd (frozen, locked);
            }
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            'new': 'open',
            'init': 'open',
            'not_trigger': 'open',
            'partial_fill': 'open',
            'triggered': 'closed',
            'full_fill': 'closed',
            'filled': 'closed',
            'fail_trigger': 'canceled',
            'cancel': 'canceled',
            'cancelled': 'canceled',
            'canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market: Market = undefined): Order {
        //
        // spot
        //     {
        //         "accountId": "222222222",
        //         "symbol": "TRXUSDT_SPBL",
        //         "orderId": "1041901704004947968",
        //         "clientOrderId": "c5e8a5e1-a07f-4202-8061-b88bd598b264",
        //         "price": "0",
        //         "quantity": "10.0000000000000000",
        //         "orderType": "market",
        //         "side": "buy",
        //         "status": "full_fill",
        //         "fillPrice": "0.0699782527055350",
        //         "fillQuantity": "142.9015000000000000",
        //         "fillTotalAmount": "9.9999972790000000",
        //         "enterPointSource": "API",
        //         "feeDetail": "{\"BGB\":{\"deduction\":true,\"feeCoinCode\":\"BGB\",\"totalDeductionFee\":-0.017118519726,\"totalFee\":-0.017118519726}}",
        //         "orderSource": "market",
        //         "cTime": "1684134644509"
        //     }
        //
        // swap
        //     {
        //       "symbol": "BTCUSDT_UMCBL",
        //       "size": 0.001,
        //       "orderId": "881640729145409536",
        //       "clientOid": "881640729204129792",
        //       "filledQty": 0.001,
        //       "fee": 0,
        //       "price": null,
        //       "priceAvg": 38429.5,
        //       "state": "filled",
        //       "side": "open_long",
        //       "timeInForce": "normal",
        //       "totalProfits": 0,
        //       "posSide": "long",
        //       "marginCoin": "USDT",
        //       "filledAmount": 38.4295,
        //       "orderType": "market",
        //       "cTime": "1645925450611",
        //       "uTime": "1645925450746"
        //     }
        //
        // stop
        //
        //     {
        //         "orderId": "910246821491617792",
        //         "symbol": "BTCUSDT_UMCBL",
        //         "marginCoin": "USDT",
        //         "size": "16",
        //         "executePrice": "20000",
        //         "triggerPrice": "24000",
        //         "status": "not_trigger",
        //         "orderType": "limit",
        //         "planType": "normal_plan",
        //         "side": "open_long",
        //         "triggerType": "market_price",
        //         "presetTakeProfitPrice": "0",
        //         "presetTakeLossPrice": "0",
        //         "cTime": "1652745674488"
        //     }
        //
        // swap, isolated and cross margin: cancelOrder
        //
        //     {
        //         "orderId": "1098749943604719616",
        //         "clientOid": "0ec8d262b3d2436aa651095a745b9b8d"
        //     }
        //
        // spot: cancelOrder
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697689270716,
        //         "data": "1098753830701928448"
        //     }
        //
        // isolated and cross margin: fetchOpenOrders, fetchCanceledOrders, fetchClosedOrders
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderType": "limit",
        //         "source": "WEB",
        //         "orderId": "1099108898629627904",
        //         "clientOid": "f9b55416029e4cc2bbbe2f40ac368c38",
        //         "loanType": "autoLoan",
        //         "price": "25000",
        //         "side": "buy",
        //         "status": "new",
        //         "baseQuantity": "0.0002",
        //         "quoteAmount": "5",
        //         "fillPrice": "0",
        //         "fillQuantity": "0",
        //         "fillTotalAmount": "0",
        //         "ctime": "1697773902588"
        //     }
        // cancelOrders failing
        //
        //         {
        //           "orderId": "1627293504611",
        //           "clientOid": "BITGET#1627293504611",
        //           "errorMsg":"Duplicate clientOid"
        //         }
        //
        const errorMessage = this.safeString (order, 'errorMsg');
        if (errorMessage !== undefined) {
            return this.safeOrder ({
                'info': order,
                'id': this.safeString (order, 'orderId'),
                'clientOrderId': this.safeString (order, 'clientOrderId'),
                'status': 'rejected',
            }, market);
        }
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger2 (order, 'cTime', 'ctime');
        const updateTimestamp = this.safeInteger (order, 'uTime');
        const rawStatus = this.safeString2 (order, 'status', 'state');
        let side = this.safeString2 (order, 'side', 'posSide');
        if ((side === 'open_long') || (side === 'close_short')) {
            side = 'buy';
        } else if ((side === 'close_long') || (side === 'open_short')) {
            side = 'sell';
        }
        let fee = undefined;
        const feeCostString = this.safeString (order, 'fee');
        if (feeCostString !== undefined) {
            // swap
            fee = {
                'cost': feeCostString,
                'currency': market['settle'],
            };
        }
        const feeDetail = this.safeValue (order, 'feeDetail');
        if (feeDetail !== undefined) {
            const parsedFeeDetail = JSON.parse (feeDetail);
            const feeValues = Object.values (parsedFeeDetail);
            const first = this.safeValue (feeValues, 0);
            fee = {
                'cost': this.safeString (first, 'totalFee'),
                'currency': this.safeCurrencyCode (this.safeString (first, 'feeCoinCode')),
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString2 (order, 'orderId', 'data'),
            'clientOrderId': this.safeString2 (order, 'clientOrderId', 'clientOid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': updateTimestamp,
            'lastUpdateTimestamp': updateTimestamp,
            'symbol': market['symbol'],
            'type': this.safeString (order, 'orderType'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeString2 (order, 'price', 'executePrice'),
            'stopPrice': this.safeNumber (order, 'triggerPrice'),
            'triggerPrice': this.safeNumber (order, 'triggerPrice'),
            'average': this.safeString2 (order, 'fillPrice', 'priceAvg'),
            'cost': this.safeString2 (order, 'fillTotalAmount', 'filledAmount'),
            'amount': this.safeStringN (order, [ 'quantity', 'size', 'baseQuantity' ]),
            'filled': this.safeString2 (order, 'fillQuantity', 'filledQty'),
            'remaining': undefined,
            'status': this.parseOrderStatus (rawStatus),
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitget#createOrder
         * @description create a trade order
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#place-order
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#place-plan-order
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#place-order
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#place-stop-order
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#place-position-tpsl
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#place-plan-order
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#isolated-place-order
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#cross-place-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell' or 'open_long' or 'open_short' or 'close_long' or 'close_short'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.triggerPrice] *swap only* The price at which a trigger order is triggered at
         * @param {float} [params.stopLossPrice] *swap only* The price at which a stop loss order is triggered at
         * @param {float} [params.takeProfitPrice] *swap only* The price at which a take profit order is triggered at
         * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
         * @param {float} [params.takeProfit.triggerPrice] *swap only* take profit trigger price
         * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
         * @param {float} [params.stopLoss.triggerPrice] *swap only* stop loss trigger price
         * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", or "PO"
         * @param {string} [params.marginMode] 'isolated' or 'cross' for spot margin trading
         * @param {string} [params.loanType] *spot margin only* 'normal', 'autoLoan', 'autoRepay', or 'autoLoanAndRepay' default is 'normal'
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marginParams = this.handleMarginModeAndParams ('createOrder', params);
        const marginMode = marginParams[0];
        const triggerPrice = this.safeValue2 (params, 'stopPrice', 'triggerPrice');
        const stopLossTriggerPrice = this.safeValue (params, 'stopLossPrice');
        const takeProfitTriggerPrice = this.safeValue (params, 'takeProfitPrice');
        const isTriggerOrder = triggerPrice !== undefined;
        const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
        const isStopLossOrTakeProfitTrigger = isStopLossTriggerOrder || isTakeProfitTriggerOrder;
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        let response = undefined;
        if (market['spot']) {
            if (isTriggerOrder) {
                response = await this.privateSpotPostSpotV1PlanPlacePlan (request);
            } else if (marginMode === 'isolated') {
                response = await this.privateMarginPostMarginV1IsolatedOrderPlaceOrder (request);
            } else if (marginMode === 'cross') {
                response = await this.privateMarginPostMarginV1CrossOrderPlaceOrder (request);
            } else {
                response = await this.privateSpotPostSpotV1TradeOrders (request);
            }
        } else {
            if (isTriggerOrder) {
                response = await this.privateMixPostMixV1PlanPlacePlan (request);
            } else if (isStopLossOrTakeProfitTrigger) {
                response = await this.privateMixPostMixV1PlanPlacePositionsTPSL (request);
            } else {
                response = await this.privateMixPostMixV1OrderPlaceOrder (request);
            }
        }
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1645932209602,
        //         "data": {
        //             "orderId": "881669078313766912",
        //             "clientOrderId": "iauIBf#a45b595f96474d888d0ada"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    createOrderRequest (symbol, type, side, amount, price = undefined, params = {}) {
        const market = this.market (symbol);
        let marketType = undefined;
        let marginMode = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('createOrder', market, params);
        [ marginMode, params ] = this.handleMarginModeAndParams ('createOrder', params);
        const marketId = market['id'];
        const parts = marketId.split ('_');
        const marginMarketId = this.safeStringUpper (parts, 0);
        const symbolRequest = (marginMode !== undefined) ? marginMarketId : marketId;
        const request = {
            'symbol': symbolRequest,
            'orderType': type,
        };
        const isMarketOrder = type === 'market';
        const triggerPrice = this.safeValue2 (params, 'stopPrice', 'triggerPrice');
        const stopLossTriggerPrice = this.safeValue (params, 'stopLossPrice');
        const takeProfitTriggerPrice = this.safeValue (params, 'takeProfitPrice');
        const stopLoss = this.safeValue (params, 'stopLoss');
        const takeProfit = this.safeValue (params, 'takeProfit');
        const isTriggerOrder = triggerPrice !== undefined;
        const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
        const isStopLoss = stopLoss !== undefined;
        const isTakeProfit = takeProfit !== undefined;
        const isStopLossOrTakeProfitTrigger = isStopLossTriggerOrder || isTakeProfitTriggerOrder;
        const isStopLossOrTakeProfit = isStopLoss || isTakeProfit;
        if (this.sum (isTriggerOrder, isStopLossTriggerOrder, isTakeProfitTriggerOrder) > 1) {
            throw new ExchangeError (this.id + ' createOrder() params can only contain one of triggerPrice, stopLossPrice, takeProfitPrice');
        }
        if ((type === 'limit') && (triggerPrice === undefined)) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        // default triggerType to market price for unification
        const triggerType = this.safeString (params, 'triggerType', 'market_price');
        const reduceOnly = this.safeValue (params, 'reduceOnly', false);
        const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId');
        const exchangeSpecificTifParam = this.safeStringN (params, [ 'force', 'timeInForceValue', 'timeInForce' ]);
        let postOnly = undefined;
        [ postOnly, params ] = this.handlePostOnly (isMarketOrder, exchangeSpecificTifParam === 'post_only', params);
        const defaultTimeInForce = this.safeStringLower (this.options, 'defaultTimeInForce');
        const timeInForce = this.safeStringLower (params, 'timeInForce', defaultTimeInForce);
        let timeInForceKey = 'timeInForceValue';
        if (marketType === 'spot') {
            if (marginMode !== undefined) {
                timeInForceKey = 'timeInForce';
            } else if (triggerPrice === undefined) {
                timeInForceKey = 'force';
            }
        }
        if (postOnly) {
            request[timeInForceKey] = 'post_only';
        } else if (timeInForce === 'gtc') {
            const gtcRequest = (marginMode !== undefined) ? 'gtc' : 'normal';
            request[timeInForceKey] = gtcRequest;
        } else if (timeInForce === 'fok') {
            request[timeInForceKey] = 'fok';
        } else if (timeInForce === 'ioc') {
            request[timeInForceKey] = 'ioc';
        }
        params = this.omit (params, [ 'stopPrice', 'triggerType', 'stopLossPrice', 'takeProfitPrice', 'stopLoss', 'takeProfit', 'postOnly', 'reduceOnly' ]);
        if ((marketType === 'swap') || (marketType === 'future')) {
            request['marginCoin'] = market['settleId'];
            if (clientOrderId !== undefined) {
                request['clientOid'] = clientOrderId;
            }
            if (isTriggerOrder || isStopLossOrTakeProfitTrigger) {
                request['triggerType'] = triggerType;
            }
            if (isStopLossOrTakeProfitTrigger) {
                if (!isMarketOrder) {
                    throw new ExchangeError (this.id + ' createOrder() bitget stopLoss or takeProfit orders must be market orders');
                }
                request['holdSide'] = (side === 'buy') ? 'long' : 'short';
            } else {
                request['size'] = this.amountToPrecision (symbol, amount);
                if (reduceOnly) {
                    request['side'] = (side === 'buy') ? 'close_short' : 'close_long';
                } else {
                    if (side === 'buy') {
                        request['side'] = 'open_long';
                    } else if (side === 'sell') {
                        request['side'] = 'open_short';
                    } else {
                        request['side'] = side;
                    }
                }
            }
            if (isTriggerOrder) {
                request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
                if (price !== undefined) {
                    request['executePrice'] = this.priceToPrecision (symbol, price);
                }
            } else if (isStopLossOrTakeProfitTrigger) {
                if (isStopLossTriggerOrder) {
                    request['triggerPrice'] = this.priceToPrecision (symbol, stopLossTriggerPrice);
                    request['planType'] = 'pos_loss';
                } else if (isTakeProfitTriggerOrder) {
                    request['triggerPrice'] = this.priceToPrecision (symbol, takeProfitTriggerPrice);
                    request['planType'] = 'pos_profit';
                }
            } else {
                if (isStopLoss) {
                    const slTriggerPrice = this.safeValue2 (stopLoss, 'triggerPrice', 'stopPrice');
                    request['presetStopLossPrice'] = this.priceToPrecision (symbol, slTriggerPrice);
                }
                if (isTakeProfit) {
                    const tpTriggerPrice = this.safeValue2 (takeProfit, 'triggerPrice', 'stopPrice');
                    request['presetTakeProfitPrice'] = this.priceToPrecision (symbol, tpTriggerPrice);
                }
            }
        } else if (marketType === 'spot') {
            if (isStopLossOrTakeProfitTrigger || isStopLossOrTakeProfit) {
                throw new InvalidOrder (this.id + ' createOrder() does not support stop loss/take profit orders on spot markets, only swap markets');
            }
            let quantity = undefined;
            const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
            if (createMarketBuyOrderRequiresPrice && isMarketOrder && (side === 'buy')) {
                if (price === undefined) {
                    throw new InvalidOrder (this.id + ' createOrder() requires price argument for market buy orders on spot markets to calculate the total amount to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option to false and pass in the cost to spend into the amount parameter');
                } else {
                    const amountString = this.numberToString (amount);
                    const priceString = this.numberToString (price);
                    const cost = this.parseNumber (Precise.stringMul (amountString, priceString));
                    quantity = this.priceToPrecision (symbol, cost);
                }
            } else {
                quantity = this.amountToPrecision (symbol, amount);
            }
            request['side'] = side;
            if (triggerPrice !== undefined) {
                if (quantity !== undefined) {
                    request['size'] = quantity;
                }
                request['triggerType'] = triggerType;
                request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
                if (price !== undefined) {
                    request['executePrice'] = this.priceToPrecision (symbol, price);
                }
                if (clientOrderId !== undefined) {
                    request['clientOrderId'] = clientOrderId;
                }
            } else if (marginMode !== undefined) {
                request['loanType'] = 'normal';
                if (clientOrderId !== undefined) {
                    request['clientOid'] = clientOrderId;
                }
                if (createMarketBuyOrderRequiresPrice && isMarketOrder && (side === 'buy')) {
                    request['quoteAmount'] = quantity;
                } else {
                    request['baseQuantity'] = quantity;
                }
            } else {
                if (clientOrderId !== undefined) {
                    request['clientOrderId'] = clientOrderId;
                }
                if (quantity !== undefined) {
                    request['quantity'] = quantity;
                }
            }
        } else {
            throw new NotSupported (this.id + ' createOrder() does not support ' + marketType + ' orders');
        }
        return this.extend (request, params);
    }

    async createOrders (orders: OrderRequest[], params = {}) {
        /**
         * @method
         * @name bitget#createOrders
         * @description create a list of trade orders (all orders should be of the same symbol)
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#batch-order
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#batch-order
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#isolated-batch-order
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#cross-batch-order
         * @param {array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
         * @param {object} [params] extra parameters specific to the api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const ordersRequests = [];
        let symbol = undefined;
        let marginMode = undefined;
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString (rawOrder, 'symbol');
            if (symbol === undefined) {
                symbol = marketId;
            } else {
                if (symbol !== marketId) {
                    throw new BadRequest (this.id + ' createOrders() requires all orders to have the same symbol');
                }
            }
            const type = this.safeString (rawOrder, 'type');
            const side = this.safeString (rawOrder, 'side');
            const amount = this.safeValue (rawOrder, 'amount');
            const price = this.safeValue (rawOrder, 'price');
            const orderParams = this.safeValue (rawOrder, 'params', {});
            const marginResult = this.handleMarginModeAndParams ('createOrders', orderParams);
            const currentMarginMode = marginResult[0];
            if (currentMarginMode !== undefined) {
                if (marginMode === undefined) {
                    marginMode = currentMarginMode;
                } else {
                    if (marginMode !== currentMarginMode) {
                        throw new BadRequest (this.id + ' createOrders() requires all orders to have the same margin mode (isolated or cross)');
                    }
                }
            }
            const orderRequest = this.createOrderRequest (marketId, type, side, amount, price, orderParams);
            ordersRequests.push (orderRequest);
        }
        const market = this.market (symbol);
        const symbolRequest = (marginMode !== undefined) ? (market['info']['symbolName']) : (market['id']);
        const request = {
            'symbol': symbolRequest,
        };
        let response = undefined;
        if (market['spot']) {
            request['orderList'] = ordersRequests;
        }
        if ((market['swap']) || (market['future'])) {
            request['orderDataList'] = ordersRequests;
            request['marginCoin'] = market['settleId'];
            response = await this.privateMixPostMixV1OrderBatchOrders (request);
        } else if (marginMode === 'isolated') {
            response = await this.privateMarginPostMarginV1IsolatedOrderBatchPlaceOrder (request);
        } else if (marginMode === 'cross') {
            response = await this.privateMarginPostMarginV1CrossOrderBatchPlaceOrder (request);
        } else {
            response = await this.privateSpotPostSpotV1TradeBatchOrders (request);
        }
        //
        // {
        //     "code": "00000",
        //     "data": {
        //       "orderInfo": [
        //         {
        //           "orderId": "1627293504612",
        //           "clientOid": "BITGET#1627293504612"
        //         }
        //       ],
        //       "failure":[
        //         {
        //           "orderId": "1627293504611",
        //           "clientOid": "BITGET#1627293504611",
        //           "errorMsg":"Duplicate clientOid"
        //         }
        //       ]
        //     },
        //     "msg": "success",
        //     "requestTime": 1627293504612
        //   }
        //
        const data = this.safeValue (response, 'data', {});
        const failure = this.safeValue (data, 'failure', []);
        const orderInfo = this.safeValue2 (data, 'orderInfo', 'resultList', []);
        const both = this.arrayConcat (orderInfo, failure);
        return this.parseOrders (both);
    }

    async editOrder (id: string, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        /**
         * @method
         * @name bitget#editOrder
         * @description edit a trade order
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#modify-plan-order
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#modify-plan-order
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#modify-plan-order-tpsl
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#modify-stop-order
         * @param {string} id cancel order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the base currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('editOrder', market, params);
        const request = {
            'orderId': id,
            'orderType': type,
        };
        const isMarketOrder = type === 'market';
        const triggerPrice = this.safeValue2 (params, 'stopPrice', 'triggerPrice');
        const isTriggerOrder = triggerPrice !== undefined;
        const stopLossPrice = this.safeValue (params, 'stopLossPrice');
        const isStopLossOrder = stopLossPrice !== undefined;
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        const isTakeProfitOrder = takeProfitPrice !== undefined;
        const isStopOrder = isStopLossOrder || isTakeProfitOrder;
        if (this.sum (isTriggerOrder, isStopLossOrder, isTakeProfitOrder) > 1) {
            throw new ExchangeError (this.id + ' editOrder() params can only contain one of triggerPrice, stopLossPrice, takeProfitPrice');
        }
        if (!isStopOrder && !isTriggerOrder) {
            throw new InvalidOrder (this.id + ' editOrder() only support plan orders');
        }
        if (triggerPrice !== undefined) {
            // default triggerType to market price for unification
            const triggerType = this.safeString (params, 'triggerType', 'market_price');
            request['triggerType'] = triggerType;
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
            request['executePrice'] = this.priceToPrecision (symbol, price);
        }
        const omitted = this.omit (query, [ 'stopPrice', 'triggerType', 'stopLossPrice', 'takeProfitPrice' ]);
        let response = undefined;
        if (marketType === 'spot') {
            if (isStopOrder) {
                throw new InvalidOrder (this.id + ' editOrder() does not support stop orders on spot markets, only swap markets');
            }
            const editMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'editMarketBuyOrderRequiresPrice', true);
            if (editMarketBuyOrderRequiresPrice && isMarketOrder && (side === 'buy')) {
                if (price === undefined) {
                    throw new InvalidOrder (this.id + ' editOrder() requires price argument for market buy orders on spot markets to calculate the total amount to spend (amount * price), alternatively set the editMarketBuyOrderRequiresPrice option to false and pass in the cost to spend into the amount parameter');
                } else {
                    const amountString = this.numberToString (amount);
                    const priceString = this.numberToString (price);
                    const cost = this.parseNumber (Precise.stringMul (amountString, priceString));
                    request['size'] = this.priceToPrecision (symbol, cost);
                }
            } else {
                request['size'] = this.amountToPrecision (symbol, amount);
            }
            response = await this.privateSpotPostSpotV1PlanModifyPlan (this.extend (request, omitted));
        } else {
            request['symbol'] = market['id'];
            request['size'] = this.amountToPrecision (symbol, amount);
            if ((marketType !== 'swap') && (marketType !== 'future')) {
                throw new NotSupported (this.id + ' editOrder() does not support ' + marketType + ' market');
            }
            request['marginCoin'] = market['settleId'];
            if (isStopOrder) {
                if (!isMarketOrder) {
                    throw new ExchangeError (this.id + ' editOrder() bitget stopLoss or takeProfit orders must be market orders');
                }
                if (isStopLossOrder) {
                    request['triggerPrice'] = this.priceToPrecision (symbol, stopLossPrice);
                    request['planType'] = 'loss_plan';
                } else if (isTakeProfitOrder) {
                    request['triggerPrice'] = this.priceToPrecision (symbol, takeProfitPrice);
                    request['planType'] = 'profit_plan';
                }
                response = await this.privateMixPostMixV1PlanModifyTPSLPlan (this.extend (request, omitted));
            } else {
                response = await this.privateMixPostMixV1PlanModifyPlan (this.extend (request, omitted));
            }
        }
        //
        // spot
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1668136575920,
        //         "data": {
        //         "orderId": "974792060738441216",
        //         "clientOrderId": "974792554995224576"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name bitget#cancelOrder
         * @description cancels an open order
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#cancel-order
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#cancel-plan-order
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#cancel-order
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#cancel-plan-order-tpsl
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#isolated-cancel-order
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#cross-cancel-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'isolated' or 'cross' for spot margin trading
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let marketType = undefined;
        let marginMode = undefined;
        let response = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelOrder', market, params);
        [ marginMode, params ] = this.handleMarginModeAndParams ('cancelOrder', params);
        const symbolRequest = (marginMode !== undefined) ? (market['info']['symbolName']) : (market['id']);
        const request = {
            'symbol': symbolRequest,
            'orderId': id,
        };
        const stop = this.safeValue (params, 'stop');
        const planType = this.safeString (params, 'planType');
        params = this.omit (params, [ 'stop', 'planType' ]);
        if ((marketType === 'swap') || (marketType === 'future')) {
            request['marginCoin'] = market['settleId'];
            if (stop) {
                if (planType === undefined) {
                    throw new ArgumentsRequired (this.id + ' cancelOrder() requires a planType parameter for stop orders, either normal_plan, profit_plan or loss_plan');
                }
                request['planType'] = planType;
                response = await this.privateMixPostMixV1PlanCancelPlan (this.extend (request, params));
            } else {
                response = await this.privateMixPostMixV1OrderCancelOrder (this.extend (request, params));
            }
        } else if (marketType === 'spot') {
            if (marginMode !== undefined) {
                if (marginMode === 'isolated') {
                    response = await this.privateMarginPostMarginV1IsolatedOrderCancelOrder (this.extend (request, params));
                } else if (marginMode === 'cross') {
                    response = await this.privateMarginPostMarginV1CrossOrderCancelOrder (this.extend (request, params));
                }
            } else {
                if (stop) {
                    response = await this.privateSpotPostSpotV1PlanCancelPlan (this.extend (request, params));
                } else {
                    response = await this.privateSpotPostSpotV1TradeCancelOrder (this.extend (request, params));
                }
            }
        } else {
            throw new NotSupported (this.id + ' cancelOrder() does not support ' + marketType + ' orders');
        }
        //
        // spot
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697689270716,
        //         "data": "1098753830701928448"
        //     }
        //
        // isolated margin
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697688367859,
        //         "data": {
        //             "resultList": [
        //                 {
        //                     "orderId": "1098749943604719616",
        //                     "clientOid": "0ec8d262b3d2436aa651095a745b9b8d"
        //                 }
        //             ],
        //             "failure": []
        //         }
        //     }
        //
        // cross margin
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": :1697689028972,
        //         "data": {
        //             "resultList": [
        //                 {
        //                     "orderId": "1098751730051067906",
        //                     "clientOid": "ecb50ca373374c5bb814bc724e36b0eb"
        //                 }
        //             ],
        //             "failure": []
        //         }
        //     }
        //
        // swap
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697690413177,
        //         "data": {
        //             "orderId": "1098758604547850241",
        //             "clientOid": "1098758604585598977"
        //         }
        //     }
        //
        let order = response;
        if ((marketType === 'swap') || (marketType === 'future')) {
            order = this.safeValue (response, 'data', {});
        } else if (marginMode !== undefined) {
            const data = this.safeValue (response, 'data', {});
            const resultList = this.safeValue (data, 'resultList', []);
            order = resultList[0];
        }
        return this.parseOrder (order, market);
    }

    async cancelOrders (ids, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name bitget#cancelOrders
         * @description cancel multiple orders
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#cancel-order-in-batch-v2-single-instruments
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#batch-cancel-order
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#isolated-batch-cancel-orders
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#cross-batch-cancel-order
         * @param {string[]} ids order ids
         * @param {string} symbol unified market symbol, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'isolated' or 'cross' for spot margin trading
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let type = undefined;
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('cancelOrders', params);
        [ type, params ] = this.handleMarketTypeAndParams ('cancelOrders', market, params);
        const request = {};
        let response = undefined;
        if (type === 'spot') {
            request['symbol'] = market['info']['symbolName']; // regular id like LTCUSDT_SPBL does not work here
            request['orderIds'] = ids;
            if (marginMode !== undefined) {
                if (marginMode === 'cross') {
                    response = await this.privateMarginPostMarginV1CrossOrderBatchCancelOrder (this.extend (request, params));
                } else {
                    response = await this.privateMarginPostMarginV1IsolatedOrderBatchCancelOrder (this.extend (request, params));
                }
            } else {
                response = await this.privateSpotPostSpotV1TradeCancelBatchOrdersV2 (this.extend (request, params));
            }
        } else {
            request['symbol'] = market['id'];
            request['marginCoin'] = market['quote'];
            request['orderIds'] = ids;
            response = await this.privateMixPostMixV1OrderCancelBatchOrders (this.extend (request, params));
        }
        //
        //     spot
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": "1680008815965",
        //         "data": {
        //             "resultList": [
        //                 {
        //                     "orderId": "1024598257429823488",
        //                     "clientOrderId": "876493ce-c287-4bfc-9f4a-8b1905881313"
        //                 },
        //             ],
        //             "failed": []
        //         }
        //     }
        //
        //     swap
        //
        //     {
        //         "result":true,
        //         "symbol":"cmt_btcusdt",
        //         "order_ids":[
        //             "258414711",
        //             "478585558"
        //         ],
        //         "fail_infos":[
        //             {
        //                 "order_id":"258414711",
        //                 "err_code":"401",
        //                 "err_msg":""
        //             }
        //         ]
        //     }
        //
        return response;
    }

    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name bitget#cancelAllOrders
         * @description cancel all open orders
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#cancel-all-order
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#cancel-all-trigger-order-tpsl
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#isolated-batch-cancel-orders
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#cross-batch-cancel-order
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'isolated' or 'cross' for spot margin trading
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const sandboxMode = this.safeValue (this.options, 'sandboxMode', false);
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('cancelAllOrders', market, params);
        let productType = (subType === 'linear') ? 'UMCBL' : 'DMCBL';
        if (sandboxMode) {
            productType = 'S' + productType;
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelAllOrders', market, params);
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('cancelAllOrders', params);
        if (marketType === 'spot') {
            if (marginMode === undefined) {
                throw new NotSupported (this.id + ' cancelAllOrders () does not support spot markets, only spot-margin');
            }
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
            }
            const spotMarginRequest = {
                'symbol': market['info']['symbolName'], // regular id like LTCUSDT_SPBL does not work here
            };
            if (marginMode === 'cross') {
                return await this.privateMarginPostMarginV1CrossOrderBatchCancelOrder (this.extend (spotMarginRequest, params));
            } else {
                return await this.privateMarginPostMarginV1IsolatedOrderBatchCancelOrder (this.extend (spotMarginRequest, params));
            }
        }
        const request = {
            'productType': productType,
            'marginCoin': this.safeString (market, 'settleId', 'USDT'),
        };
        const stop = this.safeValue2 (params, 'stop', 'trigger');
        const planType = this.safeString (params, 'planType');
        params = this.omit (params, [ 'stop', 'trigger' ]);
        let response = undefined;
        if (stop !== undefined || planType !== undefined) {
            if (planType === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelOrder() requires a planType parameter for stop orders, either normal_plan, profit_plan, loss_plan, pos_profit, pos_loss, moving_plan or track_plan');
            }
            response = await this.privateMixPostMixV1PlanCancelAllPlan (this.extend (request, params));
        } else {
            response = await this.privateMixPostMixV1OrderCancelAllOrders (this.extend (request, params));
        }
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1663312535998,
        //         "data": {
        //             "result": true,
        //             "order_ids": ["954564352813969409"],
        //             "fail_infos": [
        //                 {
        //                     "order_id": "",
        //                     "err_code": "",
        //                     "err_msg": ""
        //                 }
        //             ]
        //         }
        //     }
        //
        return response;
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-order-details
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-order-details
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateSpotPostSpotV1TradeOrderInfo (this.extend (request, query));
        } else if ((marketType === 'swap') || (marketType === 'future')) {
            response = await this.privateMixGetMixV1OrderDetail (this.extend (request, query));
        } else {
            throw new NotSupported (this.id + ' fetchOrder() does not support ' + marketType + ' market');
        }
        // spot
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": "1645926849436",
        //       "data": [
        //         {
        //           "accountId": "6394957606",
        //           "symbol": "BTCUSDT_SPBL",
        //           "orderId": "881626139738935296",
        //           "clientOrderId": "525890c8-767e-4cd6-8585-38160ed7bb5e",
        //           "price": "38000.000000000000",
        //           "quantity": "0.000700000000",
        //           "orderType": "limit",
        //           "side": "buy",
        //           "status": "new",
        //           "fillPrice": "0.000000000000",
        //           "fillQuantity": "0.000000000000",
        //           "fillTotalAmount": "0.000000000000",
        //           "cTime": "1645921972212"
        //         }
        //       ]
        //     }
        //
        // swap
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": "1645926587877",
        //       "data": {
        //         "symbol": "BTCUSDT_UMCBL",
        //         "size": "0.001",
        //         "orderId": "881640729145409536",
        //         "clientOid": "881640729204129792",
        //         "filledQty": "0.001",
        //         "fee": "0E-8",
        //         "price": null,
        //         "priceAvg": "38429.50",
        //         "state": "filled",
        //         "side": "open_long",
        //         "timeInForce": "normal",
        //         "totalProfits": "0E-8",
        //         "posSide": "long",
        //         "marginCoin": "USDT",
        //         "filledAmount": "38.4295",
        //         "orderType": "market",
        //         "cTime": "1645925450611",
        //         "uTime": "1645925450746"
        //       }
        //     }
        //
        // response will be string after filled, see: ccxt/ccxt#17900
        if (typeof response === 'string') {
            response = JSON.parse (response);
        }
        const data = this.safeValue (response, 'data');
        const first = this.safeValue (data, 0, data);
        return this.parseOrder (first, market);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name bitget#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-order-list
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-current-plan-orders
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-all-open-order
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-plan-order-tpsl-list
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-open-order
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#isolated-open-orders
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-cross-open-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of open order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        let marketType = undefined;
        let marginMode = undefined;
        let response = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            const symbolRequest = (marginMode !== undefined) ? (market['info']['symbolName']) : (market['id']);
            request['symbol'] = symbolRequest;
        }
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchOpenOrders', params);
        const stop = this.safeValue2 (params, 'stop', 'trigger');
        params = this.omit (params, [ 'stop', 'trigger' ]);
        if (stop) {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
            }
            if (marketType === 'spot') {
                if (limit !== undefined) {
                    request['pageSize'] = limit;
                }
                response = await this.privateSpotPostSpotV1PlanCurrentPlan (this.extend (request, params));
            } else {
                response = await this.privateMixGetMixV1PlanCurrentPlan (this.extend (request, params));
            }
        } else {
            if (marketType === 'spot') {
                if (marginMode !== undefined) {
                    const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId');
                    const endTime = this.safeIntegerN (params, [ 'endTime', 'until', 'till' ]);
                    params = this.omit (params, [ 'until', 'till', 'clientOrderId' ]);
                    if (clientOrderId !== undefined) {
                        request['clientOid'] = clientOrderId;
                    }
                    if (endTime !== undefined) {
                        request['endTime'] = endTime;
                    }
                    if (since !== undefined) {
                        request['startTime'] = since;
                    }
                    if (limit !== undefined) {
                        request['pageSize'] = limit;
                    }
                    if (marginMode === 'isolated') {
                        response = await this.privateMarginGetMarginV1IsolatedOrderOpenOrders (this.extend (request, params));
                    } else if (marginMode === 'cross') {
                        response = await this.privateMarginGetMarginV1CrossOrderOpenOrders (this.extend (request, params));
                    }
                } else {
                    response = await this.privateSpotPostSpotV1TradeOpenOrders (this.extend (request, params));
                }
            } else {
                if (market === undefined) {
                    let subType = undefined;
                    [ subType, params ] = this.handleSubTypeAndParams ('fetchOpenOrders', undefined, params);
                    let productType = (subType === 'linear') ? 'UMCBL' : 'DMCBL';
                    const sandboxMode = this.safeValue (this.options, 'sandboxMode', false);
                    if (sandboxMode) {
                        productType = 'S' + productType;
                    }
                    request['productType'] = productType;
                    response = await this.privateMixGetMixV1OrderMarginCoinCurrent (this.extend (request, params));
                } else {
                    if (symbol === undefined) {
                        throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
                    }
                    response = await this.privateMixGetMixV1OrderCurrent (this.extend (request, params));
                }
            }
        }
        //
        //  spot
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1645921640193,
        //       "data": [
        //         {
        //           "accountId": "6394957606",
        //           "symbol": "BTCUSDT_SPBL",
        //           "orderId": "881623995442958336",
        //           "clientOrderId": "135335e9-b054-4e43-b00a-499f11d3a5cc",
        //           "price": "39000.000000000000",
        //           "quantity": "0.000700000000",
        //           "orderType": "limit",
        //           "side": "buy",
        //           "status": "new",
        //           "fillPrice": "0.000000000000",
        //           "fillQuantity": "0.000000000000",
        //           "fillTotalAmount": "0.000000000000",
        //           "cTime": "1645921460972"
        //         }
        //       ]
        //     }
        //
        // swap
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1645922324630,
        //       "data": [
        //         {
        //           "symbol": "BTCUSDT_UMCBL",
        //           "size": 0.001,
        //           "orderId": "881627074081226752",
        //           "clientOid": "881627074160918528",
        //           "filledQty": 0,
        //           "fee": 0,
        //           "price": 38000,
        //           "state": "new",
        //           "side": "open_long",
        //           "timeInForce": "normal",
        //           "totalProfits": 0,
        //           "posSide": "long",
        //           "marginCoin": "USDT",
        //           "filledAmount": 0,
        //           "orderType": "limit",
        //           "cTime": "1645922194995",
        //           "uTime": "1645922194995"
        //         }
        //       ]
        //     }
        //
        // stop
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1652745815697,
        //         "data": [
        //             {
        //                 "orderId": "910246821491617792",
        //                 "symbol": "BTCUSDT_UMCBL",
        //                 "marginCoin": "USDT",
        //                 "size": "16",
        //                 "executePrice": "20000",
        //                 "triggerPrice": "24000",
        //                 "status": "not_trigger",
        //                 "orderType": "limit",
        //                 "planType": "normal_plan",
        //                 "side": "open_long",
        //                 "triggerType": "market_price",
        //                 "presetTakeProfitPrice": "0",
        //                 "presetTakeLossPrice": "0",
        //                 "cTime": "1652745674488"
        //             }
        //         ]
        //     }
        //
        // spot plan order
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1668134581006,
        //         "data": {
        //             "nextFlag": false,
        //             "endId": 974792555020390400,
        //             "orderList": [{
        //                 "orderId": "974792555020390400",
        //                 "symbol": "TRXUSDT_SPBL",
        //                 "size": "151",
        //                 "executePrice": "0.041572",
        //                 "triggerPrice": "0.041572",
        //                 "status": "not_trigger",
        //                 "orderType": "limit",
        //                 "side": "buy",
        //                 "triggerType": "fill_price",
        //                 "cTime": "1668134576563"
        //             }]
        //         }
        //     }
        //
        // isolated and cross margin
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697773997250,
        //         "data": {
        //             "orderList": [
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "orderType": "limit",
        //                     "source": "WEB",
        //                     "orderId": "1099108898629627904",
        //                     "clientOid": "f9b55416029e4cc2bbbe2f40ac368c38",
        //                     "loanType": "autoLoan",
        //                     "price": "25000",
        //                     "side": "buy",
        //                     "status": "new",
        //                     "baseQuantity": "0.0002",
        //                     "quoteAmount": "5",
        //                     "fillPrice": "0",
        //                     "fillQuantity": "0",
        //                     "fillTotalAmount": "0",
        //                     "ctime": "1697773902588"
        //                 }
        //             ],
        //             "maxId": "1099108898629627904",
        //             "minId": "1099108898629627904"
        //         }
        //     }
        //
        if (typeof response === 'string') {
            response = JSON.parse (response);
        }
        const data = this.safeValue (response, 'data', []);
        if (marginMode !== undefined) {
            const resultList = this.safeValue (data, 'orderList', []);
            return this.parseOrders (resultList, market, since, limit);
        }
        if (!Array.isArray (data)) {
            const result = this.safeValue (data, 'orderList', []);
            return this.addPaginationCursorToResult (data, result) as Order[];
        }
        return this.parseOrders (data, market, since, limit);
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name bitget#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-order-history
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-history-plan-orders
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-history-orders
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-history-plan-orders-tpsl
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-isolated-order-history
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-cross-order-history
         * @param {string} symbol unified market symbol of the closed orders
         * @param {int} [since] timestamp in ms of the earliest order
         * @param {int} [limit] the max number of closed orders to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        const market = this.market (symbol);
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchClosedOrders', 'paginate');
        if (paginate) {
            const isStop = this.safeValue2 (params, 'stop', 'trigger', false);
            const cursorReceived = (market['spot'] && !isStop) ? 'orderId' : 'endId';
            const cursorSent = (market['spot'] && !isStop) ? 'after' : 'lastEndId';
            return await this.fetchPaginatedCallCursor ('fetchClosedOrders', symbol, since, limit, params, cursorReceived, cursorSent, undefined, 50) as Order[];
        }
        const response = await this.fetchCanceledAndClosedOrders (symbol, since, limit, params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const status = this.parseOrderStatus (this.safeString2 (entry, 'state', 'status'));
            if (status === 'closed') {
                result.push (entry);
            }
        }
        return this.parseOrders (result, market, since, limit);
    }

    async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchCanceledOrders
         * @description fetches information on multiple canceled orders made by the user
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-order-history
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-history-plan-orders
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-history-orders
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-history-plan-orders-tpsl
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-isolated-order-history
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-cross-order-history
         * @param {string} symbol unified market symbol of the canceled orders
         * @param {int} [since] timestamp in ms of the earliest order
         * @param {int} [limit] the max number of canceled orders to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchCanceledOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchCanceledOrders', 'paginate');
        if (paginate) {
            const isStop = this.safeValue2 (params, 'stop', 'trigger', false);
            const cursorReceived = (market['spot'] && !isStop) ? 'orderId' : 'endId';
            const cursorSent = (market['spot'] && !isStop) ? 'after' : 'lastEndId';
            return await this.fetchPaginatedCallCursor ('fetchCanceledOrders', symbol, since, limit, params, cursorReceived, cursorSent, undefined, 50) as Order[];
        }
        const response = await this.fetchCanceledAndClosedOrders (symbol, since, limit, params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const status = this.parseOrderStatus (this.safeString2 (entry, 'state', 'status'));
            if (status === 'canceled') {
                result.push (entry);
            }
        }
        return this.parseOrders (result, market, since, limit);
    }

    async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let marketType = undefined;
        let marginMode = undefined;
        let response = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchCanceledAndClosedOrders', market, params);
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchCanceledAndClosedOrders', params);
        const symbolRequest = (marginMode !== undefined) ? (market['info']['symbolName']) : (market['id']);
        const request = {
            'symbol': symbolRequest,
        };
        const now = this.milliseconds ();
        const endTime = this.safeIntegerN (params, [ 'endTime', 'until', 'till' ]);
        const stop = this.safeValue (params, 'stop');
        params = this.omit (params, [ 'until', 'till', 'stop' ]);
        if (stop || (marketType === 'swap') || (marketType === 'future')) {
            if (limit === undefined) {
                limit = 100;
            }
            request['pageSize'] = limit;
            if (since === undefined) {
                if (marketType === 'spot') {
                    since = now - 7776000000;
                } else {
                    since = 0;
                }
            }
            request['startTime'] = since;
            if (endTime === undefined) {
                request['endTime'] = this.milliseconds ();
            } else {
                request['endTime'] = endTime;
            }
        }
        if (stop) {
            if (marketType === 'spot') {
                response = await this.privateSpotPostSpotV1PlanHistoryPlan (this.extend (request, params));
            } else {
                response = await this.privateMixGetMixV1PlanHistoryPlan (this.extend (request, params));
            }
        } else {
            if ((marketType === 'swap') || (marketType === 'future')) {
                response = await this.privateMixGetMixV1OrderHistory (this.extend (request, params));
            } else {
                if (marginMode !== undefined) {
                    if (since === undefined) {
                        since = now - 7776000000;
                    }
                    request['startTime'] = since;
                    if (endTime !== undefined) {
                        request['endTime'] = endTime;
                    }
                    if (limit !== undefined) {
                        request['pageSize'] = limit;
                    }
                    if (marginMode === 'isolated') {
                        response = await this.privateMarginGetMarginV1IsolatedOrderHistory (this.extend (request, params));
                    } else if (marginMode === 'cross') {
                        response = await this.privateMarginGetMarginV1CrossOrderHistory (this.extend (request, params));
                    }
                } else {
                    if (limit !== undefined) {
                        request['limit'] = limit;
                    }
                    if (since !== undefined) {
                        request['after'] = since;
                    }
                    if (endTime !== undefined) {
                        params = this.omit (params, 'endTime');
                        request['before'] = endTime;
                    }
                    response = await this.privateSpotPostSpotV1TradeHistory (this.extend (request, params));
                }
            }
        }
        //
        // spot
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1663623237813,
        //         "data": [
        //             {
        //                 "accountId": "7264631750",
        //                 "symbol": "BTCUSDT_SPBL",
        //                 "orderId": "909129926745432064",
        //                 "clientOrderId": "9e12ee3d-6a87-4e68-b1cc-094422d223a5",
        //                 "price": "30001.580000000000",
        //                 "quantity": "0.000600000000",
        //                 "orderType": "limit",
        //                 "side": "sell",
        //                 "status": "full_fill",
        //                 "fillPrice": "30001.580000000000",
        //                 "fillQuantity": "0.000600000000",
        //                 "fillTotalAmount": "18.000948000000",
        //                 "cTime": "1652479386030"
        //             },
        //             ...
        //         ]
        //     }
        //
        // swap
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1663622728935,
        //         "data": {
        //             "nextFlag": false,
        //             "endId": "908510348120305664",
        //             "orderList": [
        //                 {
        //                     "symbol": "BTCUSDT_UMCBL",
        //                     "size": 0.004,
        //                     "orderId": "954568553644306433",
        //                     "clientOid": "954568553677860864",
        //                     "filledQty": 0.000,
        //                     "fee": 0E-8,
        //                     "price": 18000.00,
        //                     "state": "canceled",
        //                     "side": "open_long",
        //                     "timeInForce": "normal",
        //                     "totalProfits": 0E-8,
        //                     "posSide": "long",
        //                     "marginCoin": "USDT",
        //                     "filledAmount": 0.0000,
        //                     "orderType": "limit",
        //                     "leverage": "3",
        //                     "marginMode": "fixed",
        //                     "cTime": "1663312798899",
        //                     "uTime": "1663312809425"
        //                 },
        //                 ...
        //             ]
        //         }
        //     }
        //
        // spot plan order
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1668134626684,
        //         "data": {
        //             "nextFlag": false,
        //             "endId": 974792060738441216,
        //             "orderList": [
        //                 {
        //                 "orderId": "974792060738441216",
        //                 "symbol": "TRXUSDT_SPBL",
        //                 "size": "156",
        //                 "executePrice": "0.041272",
        //                 "triggerPrice": "0.041222",
        //                 "status": "cancel",
        //                 "orderType": "limit",
        //                 "side": "buy",
        //                 "triggerType": "fill_price",
        //                 "cTime": "1668134458717"
        //                 }
        //             ]
        //         }
        //     }
        //
        // swap plan order
        //
        //     {
        //         "code":"00000",
        //         "data":[
        //             {
        //                 "orderId":"803521986049314816",
        //                 "executeOrderId":"84271931884910",
        //                 "symbol":"BTCUSDT_UMCBL",
        //                 "marginCoin":"USDT",
        //                 "size":"1",
        //                 "executePrice":"38923.1",
        //                 "triggerPrice":"45000.3",
        //                 "status":"cancel",
        //                 "orderType":"limit",
        //                 "planType":"normal_plan",
        //                 "side":"open_long",
        //                 "triggerType":"fill_price",
        //                 "presetTakeProfitPrice":"0",
        //                 "presetTakeLossPrice":"0",
        //                 "ctime":"1627300490867"
        //             }
        //         ],
        //         "msg":"success",
        //         "requestTime":1627354109502
        //     }
        //
        // isolated and cross margin
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697779608818,
        //         "data": {
        //             "orderList": [
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "orderType": "limit",
        //                     "source": "API",
        //                     "orderId": "1098761451063619584",
        //                     "clientOid": "8d8ac3454ed345fca914c9cd55682121",
        //                     "loanType": "normal",
        //                     "price": "25000",
        //                     "side": "buy",
        //                     "status": "cancelled",
        //                     "baseQuantity": "0.0002",
        //                     "quoteAmount": "0",
        //                     "fillPrice": "0",
        //                     "fillQuantity": "0",
        //                     "fillTotalAmount": "0",
        //                     "ctime": "1697691064614"
        //                 },
        //             ],
        //             "maxId": "1098761451063619584",
        //             "minId": "1098394690472521728"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        if (data !== undefined) {
            if ('orderList' in data) {
                const orderList = this.safeValue (data, 'orderList');
                if (!orderList) {
                    return [];
                }
                return this.addPaginationCursorToResult (data, orderList);
            } else {
                return this.addPaginationCursorToResult (response, data);
            }
        }
        const parsedData = JSON.parse (response);
        return this.safeValue (parsedData, 'data', []);
    }

    addPaginationCursorToResult (response, data) {
        const endId = this.safeValue (response, 'endId');
        if (endId !== undefined) {
            const dataLength = data.length;
            if (dataLength > 0) {
                const first = data[0];
                const last = data[dataLength - 1];
                first['endId'] = endId;
                last['endId'] = endId;
                data[0] = first;
                data[dataLength - 1] = last;
            }
        }
        return data;
    }

    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchLedger
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-bills
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string} code unified currency code, default is undefined
         * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int} [limit] max number of ledger entrys to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] end tim in ms
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchLedger', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchLedger', code, since, limit, params, 500);
        }
        let currency = undefined;
        let request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['coinId'] = currency['id'];
        }
        if (since !== undefined) {
            request['before'] = since;
        }
        [ request, params ] = this.handleUntilOption ('after', request, params);
        const response = await this.privateSpotPostSpotV1AccountBills (this.extend (request, params));
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": "1645929886887",
        //       "data": [
        //         {
        //           "billId": "881626974170554368",
        //           "coinId": "2",
        //           "coinName": "USDT",
        //           "groupType": "transfer",
        //           "bizType": "transfer-out",
        //           "quantity": "-10.00000000",
        //           "balance": "73.36005300",
        //           "fees": "0.00000000",
        //           "cTime": "1645922171146"
        //         }
        //       ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseLedger (data, currency, since, limit);
    }

    parseLedgerEntry (item, currency: Currency = undefined) {
        //
        //     {
        //       "billId": "881626974170554368",
        //       "coinId": "2",
        //       "coinName": "USDT",
        //       "groupType": "transfer",
        //       "bizType": "transfer-out",
        //       "quantity": "-10.00000000",
        //       "balance": "73.36005300",
        //       "fees": "0.00000000",
        //       "cTime": "1645922171146"
        //     }
        //
        const id = this.safeString (item, 'billId');
        const currencyId = this.safeString (item, 'coinId');
        const code = this.safeCurrencyCode (currencyId);
        const amount = this.parseNumber (Precise.stringAbs (this.safeString (item, 'quantity')));
        const timestamp = this.safeInteger (item, 'cTime');
        const bizType = this.safeString (item, 'bizType');
        let direction = undefined;
        if (bizType !== undefined && bizType.indexOf ('-') >= 0) {
            const parts = bizType.split ('-');
            direction = parts[1];
        }
        const type = this.safeString (item, 'groupType');
        const fee = this.safeNumber (item, 'fees');
        const after = this.safeNumber (item, 'balance');
        return {
            'info': item,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': direction,
            'account': undefined,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': amount,
            'before': undefined,
            'after': after,
            'status': undefined,
            'fee': fee,
        };
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-transaction-details
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-order-fill-detail
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-isolated-transaction-details
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-cross-order-fills
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] *swap only* the latest time in ms to fetch entries for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            if (market['spot']) {
                return await this.fetchPaginatedCallCursor ('fetchMyTrades', symbol, since, limit, params, 'orderId', 'after', undefined, 50) as Trade[];
            } else {
                return await this.fetchPaginatedCallDynamic ('fetchMyTrades', symbol, since, limit, params, 500) as Trade[];
            }
        }
        let response = undefined;
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchMyTrades', params);
        const symbolRequest = (marginMode !== undefined) ? (market['info']['symbolName']) : (market['id']);
        let request = {
            'symbol': symbolRequest,
        };
        if (market['spot']) {
            if (marginMode !== undefined) {
                [ request, params ] = this.handleUntilOption ('endTime', request, params);
                if (since !== undefined) {
                    request['startTime'] = since;
                } else {
                    const now = this.milliseconds ();
                    request['startTime'] = now - 7776000000;
                }
                if (limit !== undefined) {
                    request['pageSize'] = limit;
                }
                if (marginMode === 'isolated') {
                    response = await this.privateMarginGetMarginV1IsolatedOrderFills (this.extend (request, params));
                } else if (marginMode === 'cross') {
                    response = await this.privateMarginGetMarginV1CrossOrderFills (this.extend (request, params));
                }
            } else {
                [ request, params ] = this.handleUntilOption ('before', request, params);
                if (limit !== undefined) {
                    request['limit'] = limit;
                }
                response = await this.privateSpotPostSpotV1TradeFills (this.extend (request, params));
            }
        } else {
            const orderId = this.safeString (params, 'orderId'); // when order id is not defined, startTime and endTime are required
            if (since !== undefined) {
                request['startTime'] = since;
            } else if (orderId === undefined) {
                request['startTime'] = 0;
            }
            [ request, params ] = this.handleUntilOption ('endTime', request, params);
            if (!('endTime' in request) && (orderId === undefined)) {
                request['endTime'] = this.milliseconds ();
            }
            response = await this.privateMixGetMixV1OrderFills (this.extend (request, params));
        }
        //
        // spot
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697831543676,
        //         "data": [
        //             {
        //                 "accountId": "7264631750",
        //                 "symbol": "BTCUSDT_SPBL",
        //                 "orderId": "1098394344925597696",
        //                 "fillId": "1098394344974925824",
        //                 "orderType": "market",
        //                 "side": "sell",
        //                 "fillPrice": "28467.68",
        //                 "fillQuantity": "0.0002",
        //                 "fillTotalAmount": "5.693536",
        //                 "feeCcy": "USDT",
        //                 "fees": "-0.005693536",
        //                 "takerMakerFlag": "taker",
        //                 "cTime": "1697603539699"
        //             },
        //         ]
        //     }
        //
        // swap and future
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697831790948,
        //         "data": [
        //             {
        //                 "tradeId": "1099351653724958721",
        //                 "symbol": "BTCUSDT_UMCBL",
        //                 "orderId": "1099351653682413569",
        //                 "price": "29531.3",
        //                 "sizeQty": "0.001",
        //                 "fee": "-0.01771878",
        //                 "side": "close_long",
        //                 "fillAmount": "29.5313",
        //                 "profit": "0.001",
        //                 "enterPointSource": "WEB",
        //                 "tradeSide": "close_long",
        //                 "holdMode": "double_hold",
        //                 "takerMakerFlag": "taker",
        //                 "cTime": "1697831779891"
        //             },
        //         ]
        //     }
        //
        // isolated and cross margin
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697832285469,
        //         "data": {
        //             "fills": [
        //                 {
        //                     "orderId": "1099353730455318528",
        //                     "fillId": "1099353730627092481",
        //                     "orderType": "market",
        //                     "side": "sell",
        //                     "fillPrice": "29543.7",
        //                     "fillQuantity": "0.0001",
        //                     "fillTotalAmount": "2.95437",
        //                     "feeCcy": "USDT",
        //                     "fees": "-0.00295437",
        //                     "ctime": "1697832275063"
        //                 },
        //             ],
        //             "minId": "1099353591699161118",
        //             "maxId": "1099353730627092481"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        if (marginMode !== undefined) {
            const fills = this.safeValue (data, 'fills', []);
            return this.parseTrades (fills, market, since, limit);
        }
        return this.parseTrades (data, market, since, limit);
    }

    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-transaction-details
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-order-fill-detail
         * @param {string} id order id
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrderTrades', market, params);
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateSpotPostSpotV1TradeFills (this.extend (request, query));
        } else if ((marketType === 'swap') || (marketType === 'future')) {
            response = await this.privateMixGetMixV1OrderFills (this.extend (request, query));
        } else {
            throw new NotSupported (this.id + ' fetchOrderTrades() does not support ' + marketType + ' market');
        }
        // spot
        //
        // swap
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1645927862710,
        //       "data": [
        //         {
        //           "tradeId": "881640729552281602",
        //           "symbol": "BTCUSDT_UMCBL",
        //           "orderId": "881640729145409536",
        //           "price": "38429.50",
        //           "sizeQty": "0.001",
        //           "fee": "0",
        //           "side": "open_long",
        //           "fillAmount": "38.4295",
        //           "profit": "0",
        //           "cTime": "1645925450694"
        //         }
        //       ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseTrades (data, market, since, limit);
    }

    async fetchPosition (symbol: string, params = {}) {
        /**
         * @method
         * @name bitget#fetchPosition
         * @description fetch data on a single open contract trade position
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-symbol-position-v2
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'marginCoin': market['settleId'],
        };
        const response = await this.privateMixGetMixV1PositionSinglePositionV2 (this.extend (request, params));
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": "1645933957584",
        //       "data": [
        //         {
        //           "marginCoin": "USDT",
        //           "symbol": "BTCUSDT_UMCBL",
        //           "holdSide": "long",
        //           "openDelegateCount": "0",
        //           "margin": "1.921475",
        //           "available": "0.001",
        //           "locked": "0",
        //           "total": "0.001",
        //           "leverage": "20",
        //           "achievedProfits": "0",
        //           "averageOpenPrice": "38429.5",
        //           "marginMode": "fixed",
        //           "holdMode": "double_hold",
        //           "unrealizedPL": "0.1634",
        //           "liquidationPrice": "0",
        //           "keepMarginRate": "0.004",
        //           "cTime": "1645922194988"
        //         }
        //       ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0, {});
        const position = this.parsePosition (first, market);
        return position;
    }

    async fetchPositions (symbols: Strings = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchPositions
         * @description fetch all open positions
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-all-position-v2
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-history-position
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        const sandboxMode = this.safeValue (this.options, 'sandboxMode', false);
        await this.loadMarkets ();
        const fetchPositionsOptions = this.safeValue (this.options, 'fetchPositions', {});
        const method = this.safeString (fetchPositionsOptions, 'method', 'privateMixGetMixV1PositionAllPositionV2');
        let market = undefined;
        if (symbols !== undefined) {
            const first = this.safeString (symbols, 0);
            market = this.market (first);
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchPositions', market, params);
        let productType = (subType === 'linear') ? 'UMCBL' : 'DMCBL';
        if (sandboxMode) {
            productType = 'S' + productType;
        }
        const request = {
            'productType': productType,
        };
        if (method === 'privateMixGetMixV1PositionHistoryPosition') {
            // endTime and startTime mandatory
            let since = this.safeInteger2 (params, 'startTime', 'since');
            if (since === undefined) {
                since = this.milliseconds () - 7689600000; // 3 months ago
            }
            request['startTime'] = since;
            let until = this.safeInteger2 (params, 'endTime', 'until');
            if (until === undefined) {
                until = this.milliseconds ();
            }
            request['endTime'] = until;
        }
        let response = undefined;
        let isHistory = false;
        if (method === 'privateMixGetMixV1PositionAllPositionV2') {
            response = await this.privateMixGetMixV1PositionAllPositionV2 (this.extend (request, params));
        } else {
            isHistory = true;
            response = await this.privateMixGetMixV1PositionHistoryPosition (this.extend (request, params));
        }
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": "1645933905060",
        //       "data": [
        //         {
        //           "marginCoin": "USDT",
        //           "symbol": "BTCUSDT_UMCBL",
        //           "holdSide": "long",
        //           "openDelegateCount": "0",
        //           "margin": "1.921475",
        //           "available": "0.001",
        //           "locked": "0",
        //           "total": "0.001",
        //           "leverage": "20",
        //           "achievedProfits": "0",
        //           "averageOpenPrice": "38429.5",
        //           "marginMode": "fixed",
        //           "holdMode": "double_hold",
        //           "unrealizedPL": "0.14869",
        //           "liquidationPrice": "0",
        //           "keepMarginRate": "0.004",
        //           "cTime": "1645922194988"
        //         }
        //       ]
        //     }
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 0,
        //         "data": {
        //           "list": [
        //             {
        //               "symbol": "ETHUSDT_UMCBL",
        //               "marginCoin": "USDT",
        //               "holdSide": "short",
        //               "openAvgPrice": "1206.7",
        //               "closeAvgPrice": "1206.8",
        //               "marginMode": "fixed",
        //               "openTotalPos": "1.15",
        //               "closeTotalPos": "1.15",
        //               "pnl": "-0.11",
        //               "netProfit": "-1.780315",
        //               "totalFunding": "0",
        //               "openFee": "-0.83",
        //               "closeFee": "-0.83",
        //               "ctime": "1689300233897",
        //               "utime": "1689300238205"
        //             }
        //           ],
        //           "endId": "1062308959580516352"
        //         }
        //       }
        //
        let position = [];
        if (!isHistory) {
            position = this.safeValue (response, 'data', []);
        } else {
            const data = this.safeValue (response, 'data', {});
            position = this.safeValue (data, 'list', []);
        }
        const result = [];
        for (let i = 0; i < position.length; i++) {
            result.push (this.parsePosition (position[i]));
        }
        symbols = this.marketSymbols (symbols);
        return this.filterByArrayPositions (result, 'symbol', symbols, false);
    }

    parsePosition (position, market: Market = undefined) {
        //
        //     {
        //         "marginCoin": "USDT",
        //         "symbol": "BTCUSDT_UMCBL",
        //         "holdSide": "long",
        //         "openDelegateCount": "0",
        //         "margin": "1.921475",
        //         "available": "0.001",
        //         "locked": "0",
        //         "total": "0.001",
        //         "leverage": "20",
        //         "achievedProfits": "0",
        //         "averageOpenPrice": "38429.5",
        //         "marginMode": "fixed",
        //         "holdMode": "double_hold",
        //         "unrealizedPL": "0.14869",
        //         "liquidationPrice": "0",
        //         "keepMarginRate": "0.004",
        //         "cTime": "1645922194988"
        //     }
        //
        // history
        //
        //     {
        //       "symbol": "ETHUSDT_UMCBL",
        //       "marginCoin": "USDT",
        //       "holdSide": "short",
        //       "openAvgPrice": "1206.7",
        //       "closeAvgPrice": "1206.8",
        //       "marginMode": "fixed",
        //       "openTotalPos": "1.15",
        //       "closeTotalPos": "1.15",
        //       "pnl": "-0.11",
        //       "netProfit": "-1.780315",
        //       "totalFunding": "0",
        //       "openFee": "-0.83",
        //       "closeFee": "-0.83",
        //       "ctime": "1689300233897",
        //       "utime": "1689300238205"
        //     }
        //
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger2 (position, 'cTime', 'ctime');
        let marginMode = this.safeString (position, 'marginMode');
        let collateral = undefined;
        let initialMargin = undefined;
        const unrealizedPnl = this.safeString (position, 'unrealizedPL');
        const rawCollateral = this.safeString (position, 'margin');
        if (marginMode === 'fixed') {
            marginMode = 'isolated';
            collateral = Precise.stringAdd (rawCollateral, unrealizedPnl);
        } else if (marginMode === 'crossed') {
            marginMode = 'cross';
            initialMargin = rawCollateral;
        }
        const holdMode = this.safeString (position, 'holdMode');
        let hedged = undefined;
        if (holdMode === 'double_hold') {
            hedged = true;
        } else if (holdMode === 'single_hold') {
            hedged = false;
        }
        const side = this.safeString (position, 'holdSide');
        const leverage = this.safeString (position, 'leverage');
        const contractSizeNumber = this.safeValue (market, 'contractSize');
        const contractSize = this.numberToString (contractSizeNumber);
        const baseAmount = this.safeString (position, 'total');
        const entryPrice = this.safeString2 (position, 'averageOpenPrice', 'openAvgPrice');
        const maintenanceMarginPercentage = this.safeString (position, 'keepMarginRate');
        const openNotional = Precise.stringMul (entryPrice, baseAmount);
        if (initialMargin === undefined) {
            initialMargin = Precise.stringDiv (openNotional, leverage);
        }
        let contracts = this.parseNumber (Precise.stringDiv (baseAmount, contractSize));
        if (contracts === undefined) {
            contracts = this.safeNumber (position, 'closeTotalPos');
        }
        const markPrice = this.safeString (position, 'marketPrice');
        const notional = Precise.stringMul (baseAmount, markPrice);
        const initialMarginPercentage = Precise.stringDiv (initialMargin, notional);
        let liquidationPrice = this.parseNumber (this.omitZero (this.safeString (position, 'liquidationPrice')));
        const calcTakerFeeRate = '0.0006';
        const calcTakerFeeMult = '0.9994';
        if ((liquidationPrice === undefined) && (marginMode === 'isolated') && Precise.stringGt (baseAmount, '0')) {
            let signedMargin = Precise.stringDiv (rawCollateral, baseAmount);
            let signedMmp = maintenanceMarginPercentage;
            if (side === 'short') {
                signedMargin = Precise.stringNeg (signedMargin);
                signedMmp = Precise.stringNeg (signedMmp);
            }
            let mmrMinusOne = Precise.stringSub ('1', signedMmp);
            let numerator = Precise.stringSub (entryPrice, signedMargin);
            if (side === 'long') {
                mmrMinusOne = Precise.stringMul (mmrMinusOne, calcTakerFeeMult);
            } else {
                numerator = Precise.stringMul (numerator, calcTakerFeeMult);
            }
            liquidationPrice = this.parseNumber (Precise.stringDiv (numerator, mmrMinusOne));
        }
        const feeToClose = Precise.stringMul (notional, calcTakerFeeRate);
        const maintenanceMargin = Precise.stringAdd (Precise.stringMul (maintenanceMarginPercentage, notional), feeToClose);
        const marginRatio = Precise.stringDiv (maintenanceMargin, collateral);
        const percentage = Precise.stringMul (Precise.stringDiv (unrealizedPnl, initialMargin, 4), '100');
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'notional': this.parseNumber (notional),
            'marginMode': marginMode,
            'liquidationPrice': liquidationPrice,
            'entryPrice': this.parseNumber (entryPrice),
            'unrealizedPnl': this.parseNumber (unrealizedPnl),
            'realizedPnl': this.safeNumber (position, 'pnl'),
            'percentage': this.parseNumber (percentage),
            'contracts': contracts,
            'contractSize': contractSizeNumber,
            'markPrice': this.parseNumber (markPrice),
            'lastPrice': this.safeNumber (position, 'closeAvgPrice'),
            'side': side,
            'hedged': hedged,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': this.safeInteger (position, 'utime'),
            'maintenanceMargin': this.parseNumber (maintenanceMargin),
            'maintenanceMarginPercentage': this.parseNumber (maintenanceMarginPercentage),
            'collateral': this.parseNumber (collateral),
            'initialMargin': this.parseNumber (initialMargin),
            'initialMarginPercentage': this.parseNumber (initialMarginPercentage),
            'leverage': this.parseNumber (leverage),
            'marginRatio': this.parseNumber (marginRatio),
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchFundingRateHistory
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-history-funding-rate
         * @description fetches historical funding rate prices
         * @param {string} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
         * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchFundingRateHistory', symbol, since, limit, params, 'pageNo', 50) as FundingRateHistory[];
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'pageSize': limit, // default 20
            // 'pageNo': 1,
            // 'nextPage': false,
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        request['nextPage'] = true;
        const response = await this.publicMixGetMixV1MarketHistoryFundRate (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1652406728393,
        //         "data": [
        //             {
        //                 "symbol": "BTCUSDT",
        //                 "fundingRate": "-0.0003",
        //                 "settleTime": "1652396400000"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString (entry, 'symbol');
            const symbolInner = this.safeSymbol (marketId, market);
            const timestamp = this.safeInteger (entry, 'settleTime');
            rates.push ({
                'info': entry,
                'symbol': symbolInner,
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit) as FundingRateHistory[];
    }

    async fetchFundingRate (symbol: string, params = {}) {
        /**
         * @method
         * @name bitget#fetchFundingRate
         * @description fetch the current funding rate
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-current-funding-rate
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicMixGetMixV1MarketCurrentFundRate (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1652401684275,
        //         "data": {
        //             "symbol": "BTCUSDT_UMCBL",
        //             "fundingRate": "-0.000182"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseFundingRate (data, market);
    }

    parseFundingRate (contract, market: Market = undefined) {
        //
        //     {
        //         "symbol": "BTCUSDT_UMCBL",
        //         "fundingRate": "-0.000182"
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchFundingHistory
         * @description fetch the funding history
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-account-bill
         * @param {string} symbol unified market symbol
         * @param {int} [since] the starting timestamp in milliseconds
         * @param {int} [limit] the number of entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [funding history structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
         */
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingHistory() requires a symbol argument');
        }
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingHistory() supports swap contracts only');
        }
        if (since === undefined) {
            since = this.milliseconds () - 31556952000; // 1 year
        }
        const request = {
            'symbol': market['id'],
            'marginCoin': market['quoteId'],
            'startTime': since,
            'endTime': this.milliseconds (),
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateMixGetMixV1AccountAccountBill (this.extend (request, params));
        //
        //    {
        //        "code": "00000",
        //        "msg": "success",
        //        "data": {
        //            "result": [
        //                {
        //                    "id": "892962903462432768",
        //                    "symbol": "ETHUSDT_UMCBL",
        //                    "marginCoin": "USDT",
        //                    "amount": "0",
        //                    "fee": "-0.1765104",
        //                    "feeByCoupon": "",
        //                    "feeCoin": "USDT",
        //                    "business": "contract_settle_fee",
        //                    "cTime": "1648624867354"
        //                }
        //            ],
        //            "endId": "885353495773458432",
        //            "nextFlag": false,
        //            "preFlag": false
        //    }
        //
        const data = this.safeValue (response, 'data', {});
        const result = this.safeValue (data, 'result', []);
        return this.parseFundingHistories (result, market, since, limit);
    }

    parseFundingHistory (contract, market: Market = undefined) {
        //
        //     {
        //         "id": "892962903462432768",
        //         "symbol": "ETHUSDT_UMCBL",
        //         "marginCoin": "USDT",
        //         "amount": "0",
        //         "fee": "-0.1765104",
        //         "feeByCoupon": "",
        //         "feeCoin": "USDT",
        //         "business": "contract_settle_fee",
        //         "cTime": "1648624867354"
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, 'swap');
        const currencyId = this.safeString (contract, 'marginCoin');
        const code = this.safeCurrencyCode (currencyId);
        const amount = this.safeNumber (contract, 'amount');
        const timestamp = this.safeInteger (contract, 'cTime');
        const id = this.safeString (contract, 'id');
        return {
            'info': contract,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'code': code,
            'amount': amount,
            'id': id,
        };
    }

    parseFundingHistories (contracts, market = undefined, since: Int = undefined, limit: Int = undefined): FundingHistory[] {
        const result = [];
        for (let i = 0; i < contracts.length; i++) {
            const contract = contracts[i];
            const business = this.safeString (contract, 'business');
            if (business !== 'contract_settle_fee') {
                continue;
            }
            result.push (this.parseFundingHistory (contract, market));
        }
        const sorted = this.sortBy (result, 'timestamp');
        return this.filterBySinceLimit (sorted, since, limit);
    }

    async modifyMarginHelper (symbol: string, amount, type, params = {}) {
        await this.loadMarkets ();
        const holdSide = this.safeString (params, 'holdSide');
        const market = this.market (symbol);
        const marginCoin = (market['linear']) ? market['quote'] : market['base'];
        const request = {
            'symbol': market['id'],
            'marginCoin': marginCoin,
            'amount': this.amountToPrecision (symbol, amount), // positive value for adding margin, negative for reducing
            'holdSide': holdSide, // long or short
        };
        params = this.omit (params, 'holdSide');
        const response = await this.privateMixPostMixV1AccountSetMargin (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1652483636792,
        //         "data": {
        //             "result": true
        //         }
        //     }
        //
        return this.extend (this.parseMarginModification (response, market), {
            'amount': this.parseNumber (amount),
            'type': type,
        });
    }

    parseMarginModification (data, market: Market = undefined) {
        const errorCode = this.safeString (data, 'code');
        const status = (errorCode === '00000') ? 'ok' : 'failed';
        const code = (market['linear']) ? market['quote'] : market['base'];
        return {
            'info': data,
            'type': undefined,
            'amount': undefined,
            'code': code,
            'symbol': market['symbol'],
            'status': status,
        };
    }

    async reduceMargin (symbol: string, amount, params = {}) {
        /**
         * @method
         * @name bitget#reduceMargin
         * @description remove margin from a position
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#change-margin
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
         */
        if (amount > 0) {
            throw new BadRequest (this.id + ' reduceMargin() amount parameter must be a negative value');
        }
        const holdSide = this.safeString (params, 'holdSide');
        if (holdSide === undefined) {
            throw new ArgumentsRequired (this.id + ' reduceMargin() requires a holdSide parameter, either long or short');
        }
        return await this.modifyMarginHelper (symbol, amount, 'reduce', params);
    }

    async addMargin (symbol: string, amount, params = {}) {
        /**
         * @method
         * @name bitget#addMargin
         * @description add margin
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#change-margin
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
         */
        const holdSide = this.safeString (params, 'holdSide');
        if (holdSide === undefined) {
            throw new ArgumentsRequired (this.id + ' addMargin() requires a holdSide parameter, either long or short');
        }
        return await this.modifyMarginHelper (symbol, amount, 'add', params);
    }

    async fetchLeverage (symbol: string, params = {}) {
        /**
         * @method
         * @name bitget#fetchLeverage
         * @description fetch the set leverage for a market
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-single-account
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'marginCoin': market['settleId'],
        };
        const response = await this.privateMixGetMixV1AccountAccount (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 0,
        //         "data": {
        //             "marginCoin": "SUSDT",
        //             "locked": "0",
        //             "available": "3000",
        //             "crossMaxAvailable": "3000",
        //             "fixedMaxAvailable": "3000",
        //             "maxTransferOut": "3000",
        //             "equity": "3000",
        //             "usdtEquity": "3000",
        //             "btcEquity": "0.12217217236",
        //             "crossRiskRate": "0",
        //             "crossMarginLeverage": 20,
        //             "fixedLongLeverage": 40,
        //             "fixedShortLeverage": 10,
        //             "marginMode": "fixed",
        //             "holdMode": "double_hold",
        //             "unrealizedPL": null,
        //             "bonus": "0"
        //         }
        //     }
        //
        return response;
    }

    async setLeverage (leverage, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name bitget#setLeverage
         * @description set the level of leverage for a market
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#change-leverage
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'marginCoin': market['settleId'],
            'leverage': leverage,
            // 'holdSide': 'long',
        };
        return await this.privateMixPostMixV1AccountSetLeverage (this.extend (request, params));
    }

    async setMarginMode (marginMode, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name bitget#setMarginMode
         * @description set margin mode to 'cross' or 'isolated'
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#change-margin-mode
         * @param {string} marginMode 'cross' or 'isolated'
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
        marginMode = marginMode.toLowerCase ();
        if (marginMode === 'isolated') {
            marginMode = 'fixed';
        }
        if (marginMode === 'cross') {
            marginMode = 'crossed';
        }
        if ((marginMode !== 'fixed') && (marginMode !== 'crossed')) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() marginMode must be either fixed (isolated) or crossed (cross)');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'marginCoin': market['settleId'],
            'marginMode': marginMode,
        };
        return await this.privateMixPostMixV1AccountSetMarginMode (this.extend (request, params));
    }

    async setPositionMode (hedged, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name bitget#setPositionMode
         * @description set hedged to true or false for a market
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#change-hold-mode
         * @param {bool} hedged set to true to use dualSidePosition
         * @param {string} symbol not used by bitget setPositionMode ()
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} response from the exchange
         *
         */
        await this.loadMarkets ();
        const sandboxMode = this.safeValue (this.options, 'sandboxMode', false);
        const holdMode = hedged ? 'double_hold' : 'single_hold';
        const request = {
            'holdMode': holdMode,
        };
        let subType = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        [ subType, params ] = this.handleSubTypeAndParams ('setPositionMode', market, params);
        let productType = (subType === 'linear') ? 'UMCBL' : 'DMCBL';
        if (sandboxMode) {
            productType = 'S' + productType;
        }
        request['productType'] = productType;
        const response = await this.privateMixPostMixV1AccountSetPositionMode (this.extend (request, params));
        //
        //    {
        //         "code": "40919",
        //         "msg": "This function is not open yet",
        //         "requestTime": 1672212431093,
        //         "data": null
        //     }
        //
        return response;
    }

    async fetchOpenInterest (symbol: string, params = {}) {
        /**
         * @method
         * @name bitget#fetchOpenInterest
         * @description Retrieves the open interest of a currency
         * @see https://bitgetlimited.github.io/apidoc/en/mix/#get-open-interest
         * @param {string} symbol Unified CCXT market symbol
         * @param {object} [params] exchange specific parameters
         * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['contract']) {
            throw new BadRequest (this.id + ' fetchOpenInterest() supports contract markets only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicMixGetMixV1MarketOpenInterest (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 0,
        //         "data": {
        //             "symbol": "BTCUSDT_UMCBL",
        //             "amount": "130818.967",
        //             "timestamp": "1663399151127"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOpenInterest (data, market);
    }

    async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchTransfers
         * @description fetch a history of internal transfers made on an account
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-transfer-list
         * @param {string} code unified currency code of the currency transferred
         * @param {int} [since] the earliest time in ms to fetch transfers for
         * @param {int} [limit] the maximum number of  transfers structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTransfers', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchTransfers', code, since, limit, params);
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTransfers', undefined, params);
        const fromAccount = this.safeString (params, 'fromAccount', type);
        params = this.omit (params, 'fromAccount');
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        type = this.safeString (accountsByType, fromAccount);
        let request = {
            'fromType': type,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coinId'] = currency['id'];
        }
        if (since !== undefined) {
            request['before'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('after', request, params);
        const response = await this.privateSpotGetSpotV1AccountTransferRecords (this.extend (request, params));
        //
        //     {
        //         "code":"00000",
        //         "message":"success",
        //         "data":[{
        //             "cTime":"1622697148",
        //             "coinId":"22",
        //             "coinName":"usdt",
        //             "groupType":"deposit",
        //             "bizType":"transfer-in",
        //             "quantity":"1",
        //             "balance": "1",
        //             "fees":"0",
        //             "billId":"1291"
        //         }]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTransfers (data, currency, since, limit);
    }

    async transfer (code: string, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name bitget#transfer
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#transfer-v2
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         *
         * EXCHANGE SPECIFIC PARAMS
         * @param {string} [params.clientOid] custom id
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const fromSwap = fromAccount === 'swap';
        const toSwap = toAccount === 'swap';
        const usdt = currency['code'] === 'USDT';
        if (fromSwap) {
            fromAccount = usdt ? 'mix_usdt' : 'mix_usd';
        } else if (toSwap) {
            toAccount = usdt ? 'mix_usdt' : 'mix_usd';
        }
        const request = {
            'fromType': fromAccount,
            'toType': toAccount,
            'amount': amount,
            'coin': currency['info']['coinName'],
        };
        const response = await this.privateSpotPostSpotV1WalletTransferV2 (this.extend (request, params));
        //
        //    {
        //        "code": "00000",
        //        "msg": "success",
        //        "requestTime": 1668119107154,
        //        "data": "SUCCESS"
        //    }
        //
        return this.parseTransfer (response, currency);
    }

    parseTransfer (transfer, currency: Currency = undefined) {
        //
        // transfer
        //
        //    {
        //        "code": "00000",
        //        "msg": "success",
        //        "requestTime": 1668119107154,
        //        "data": "SUCCESS"
        //    }
        //
        // fetchTransfers
        //
        //     {
        //         "cTime":"1622697148",
        //         "coinId":"22",
        //         "coinName":"usdt",
        //         "groupType":"deposit",
        //         "bizType":"transfer-in",
        //         "quantity":"1",
        //         "balance": "1",
        //         "fees":"0",
        //         "billId":"1291"
        //     }
        //
        let timestamp = this.safeInteger2 (transfer, 'requestTime', 'tradeTime');
        if (timestamp === undefined) {
            timestamp = this.safeTimestamp (transfer, 'cTime');
        }
        const msg = this.safeStringLowerN (transfer, [ 'msg', 'status' ]);
        let currencyId = this.safeString2 (transfer, 'code', 'coinName');
        if (currencyId === '00000') {
            currencyId = undefined;
        }
        const fromAccountRaw = this.safeString (transfer, 'fromType');
        const accountsById = this.safeValue (this.options, 'accountsById', {});
        const fromAccount = this.safeString (accountsById, fromAccountRaw, fromAccountRaw);
        const toAccountRaw = this.safeString (transfer, 'toType');
        const toAccount = this.safeString (accountsById, toAccountRaw, toAccountRaw);
        return {
            'info': transfer,
            'id': this.safeString2 (transfer, 'id', 'billId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeCurrencyCode (currencyId),
            'amount': this.safeNumberN (transfer, [ 'size', 'quantity', 'amount' ]),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': this.parseTransferStatus (msg),
        };
    }

    parseDepositWithdrawFee (fee, currency: Currency = undefined) {
        //
        // {
        //     "chains": [
        //       {
        //         "browserUrl": "https://bscscan.com/tx/",
        //         "chain": "BEP20",
        //         "depositConfirm": "15",
        //         "extraWithDrawFee": "0",
        //         "minDepositAmount": "0.000001",
        //         "minWithdrawAmount": "0.0000078",
        //         "needTag": "false",
        //         "rechargeable": "true",
        //         "withdrawConfirm": "15",
        //         "withdrawFee": "0.0000051",
        //         "withdrawable": "true"
        //       },
        //       {
        //         "browserUrl": "https://blockchair.com/bitcoin/transaction/",
        //         "chain": "BTC",
        //         "depositConfirm": "1",
        //         "extraWithDrawFee": "0",
        //         "minDepositAmount": "0.0001",
        //         "minWithdrawAmount": "0.002",
        //         "needTag": "false",
        //         "rechargeable": "true",
        //         "withdrawConfirm": "1",
        //         "withdrawFee": "0.0005",
        //         "withdrawable": "true"
        //       }
        //     ],
        //     "coinId": "1",
        //     "coinName": "BTC",
        //     "transfer": "true"
        // }
        //
        const chains = this.safeValue (fee, 'chains', []);
        const chainsLength = chains.length;
        const result = {
            'info': fee,
            'withdraw': {
                'fee': undefined,
                'percentage': undefined,
            },
            'deposit': {
                'fee': undefined,
                'percentage': undefined,
            },
            'networks': {},
        };
        for (let i = 0; i < chainsLength; i++) {
            const chain = chains[i];
            const networkId = this.safeString (chain, 'chain');
            const currencyCode = this.safeString (currency, 'code');
            const networkCode = this.networkIdToCode (networkId, currencyCode);
            result['networks'][networkCode] = {
                'deposit': { 'fee': undefined, 'percentage': undefined },
                'withdraw': { 'fee': this.safeNumber (chain, 'withdrawFee'), 'percentage': false },
            };
            if (chainsLength === 1) {
                result['withdraw']['fee'] = this.safeNumber (chain, 'withdrawFee');
                result['withdraw']['percentage'] = false;
            }
        }
        return result;
    }

    async fetchDepositWithdrawFees (codes: Strings = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @see https://bitgetlimited.github.io/apidoc/en/spot/#get-coin-list
         * @param {string[]|undefined} codes list of unified currency codes
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicSpotGetSpotV1PublicCurrencies (params);
        const data = this.safeValue (response, 'data');
        return this.parseDepositWithdrawFees (data, codes, 'coinName');
    }

    parseTransferStatus (status) {
        const statuses = {
            'success': 'ok',
            'successful': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseOpenInterest (interest, market: Market = undefined) {
        //
        //     {
        //         "symbol": "BTCUSDT_UMCBL",
        //         "amount": "130818.967",
        //         "timestamp": "1663399151127"
        //     }
        //
        const timestamp = this.safeInteger (interest, 'timestamp');
        const id = this.safeString (interest, 'symbol');
        const symbol = this.safeSymbol (id, market);
        const amount = this.safeNumber (interest, 'amount');
        return this.safeOpenInterest ({
            'symbol': symbol,
            'openInterestAmount': amount,
            'openInterestValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        }, market);
    }

    async borrowCrossMargin (code: string, amount, params = {}) {
        /**
         * @method
         * @name bitget#borrowCrossMargin
         * @description create a loan to borrow margin
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#cross-borrow
         * @param {string} code unified currency code of the currency to borrow
         * @param {string} amount the amount to borrow
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['info']['coinName'],
            'borrowAmount': this.currencyToPrecision (code, amount),
        };
        const response = await this.privateMarginPostMarginV1CrossAccountBorrow (this.extend (request, params));
        //
        // cross
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697251314271,
        //         "data": {
        //             "clientOid": null,
        //             "coin": "BTC",
        //             "borrowAmount": "0.0001"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseMarginLoan (data, currency);
    }

    async borrowIsolatedMargin (symbol: string, code: string, amount, params = {}) {
        /**
         * @method
         * @name bitget#borrowIsolatedMargin
         * @description create a loan to borrow margin
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#isolated-borrow
         * @param {string} symbol unified market symbol
         * @param {string} code unified currency code of the currency to borrow
         * @param {string} amount the amount to borrow
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const market = this.market (symbol);
        const marketId = market['id'];
        const parts = marketId.split ('_');
        const marginMarketId = this.safeStringUpper (parts, 0);
        const request = {
            'coin': currency['info']['coinName'],
            'borrowAmount': this.currencyToPrecision (code, amount),
            'symbol': marginMarketId,
        };
        const response = await this.privateMarginPostMarginV1IsolatedAccountBorrow (this.extend (request, params));
        //
        // isolated
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697250952516,
        //         "data": {
        //             "clientOid": null,
        //             "symbol": "BTCUSDT",
        //             "coin": "BTC",
        //             "borrowAmount": "0.001"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseMarginLoan (data, currency);
    }

    async repayIsolatedMargin (symbol: string, code: string, amount, params = {}) {
        /**
         * @method
         * @name bitget#repayIsolatedMargin
         * @description repay borrowed margin and interest
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#cross-repay
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#isolated-repay
         * @param {string} symbol unified market symbol
         * @param {string} code unified currency code of the currency to repay
         * @param {string} amount the amount to repay
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const market = this.market (symbol);
        const marketId = market['id'];
        const parts = marketId.split ('_');
        const marginMarketId = this.safeStringUpper (parts, 0);
        const request = {
            'coin': currency['info']['coinName'],
            'repayAmount': this.currencyToPrecision (code, amount),
            'symbol': marginMarketId,
        };
        const response = await this.privateMarginPostMarginV1IsolatedAccountRepay (this.extend (request, params));
        //
        // isolated
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697251988593,
        //         "data": {
        //             "remainDebtAmount": "0",
        //             "clientOid": null,
        //             "symbol": "BTCUSDT",
        //             "coin": "BTC",
        //             "repayAmount": "0.00100001"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseMarginLoan (data, currency);
    }

    async repayCrossMargin (code: string, amount, params = {}) {
        /**
         * @method
         * @name bitget#repayCrossMargin
         * @description repay borrowed margin and interest
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#cross-repay
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#isolated-repay
         * @param {string} code unified currency code of the currency to repay
         * @param {string} amount the amount to repay
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['info']['coinName'],
            'repayAmount': this.currencyToPrecision (code, amount),
        };
        const response = await this.privateMarginPostMarginV1CrossAccountRepay (this.extend (request, params));
        //
        // cross
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1697252151042,
        //         "data": {
        //             "remainDebtAmount": "0",
        //             "clientOid": null,
        //             "coin": "BTC",
        //             "repayAmount": "0.00010001"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseMarginLoan (data, currency);
    }

    parseMarginLoan (info, currency: Currency = undefined) {
        //
        // isolated: borrowMargin
        //
        //     {
        //         "clientOid": null,
        //         "symbol": "BTCUSDT",
        //         "coin": "BTC",
        //         "borrowAmount": "0.001"
        //     }
        //
        // cross: borrowMargin
        //
        //     {
        //         "clientOid": null,
        //         "coin": "BTC",
        //         "borrowAmount": "0.0001"
        //     }
        //
        // isolated: repayMargin
        //
        //     {
        //         "remainDebtAmount": "0",
        //         "clientOid": null,
        //         "symbol": "BTCUSDT",
        //         "coin": "BTC",
        //         "repayAmount": "0.00100001"
        //     }
        //
        // cross: repayMargin
        //
        //     {
        //         "remainDebtAmount": "0",
        //         "clientOid": null,
        //         "coin": "BTC",
        //         "repayAmount": "0.00010001"
        //     }
        //
        const currencyId = this.safeString (info, 'coin');
        const marketId = this.safeString (info, 'symbol');
        let symbol = undefined;
        if (marketId !== undefined) {
            symbol = this.safeSymbol (marketId);
        }
        return {
            'id': this.safeString (info, 'clientOid'),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber2 (info, 'borrowAmount', 'repayAmount'),
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }

    async fetchMyLiquidations (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchMyLiquidations
         * @description retrieves the users liquidated positions
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-isolated-liquidation-records
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-cross-liquidation-records
         * @param {string} [symbol] unified CCXT market symbol
         * @param {int} [since] the earliest time in ms to fetch liquidations for
         * @param {int} [limit] the maximum number of liquidation structures to retrieve
         * @param {object} [params] exchange specific parameters for the bitget api endpoint
         * @param {int} [params.until] timestamp in ms of the latest liquidation
         * @param {string} [params.marginMode] 'cross' or 'isolated' default value is 'cross'
         * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchMyLiquidations', market, params);
        if (type !== 'spot') {
            throw new NotSupported (this.id + ' fetchMyLiquidations() supports spot margin markets only');
        }
        let request = {};
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        } else {
            request['startTime'] = this.milliseconds () - 7776000000;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        let response = undefined;
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchMyLiquidations', params, 'cross');
        if (marginMode === 'isolated') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchMyLiquidations() requires a symbol argument');
            }
            request['symbol'] = market['info']['symbolName'];
            response = await this.privateMarginGetMarginV1IsolatedLiquidationList (this.extend (request, params));
        } else if (marginMode === 'cross') {
            response = await this.privateMarginGetMarginV1CrossLiquidationList (this.extend (request, params));
        }
        //
        // isolated
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1698114119193,
        //         "data": {
        //             "resultList": [
        //                 {
        //                     "liqId": "123",
        //                     "symbol": "BTCUSDT",
        //                     "liqStartTime": "1653453245342",
        //                     "liqEndTime": "16312423423432",
        //                     "liqRisk": "1.01",
        //                     "totalAssets": "1242.34",
        //                     "totalDebt": "1100",
        //                     "LiqFee": "1.2",
        //                     "cTime": "1653453245342"
        //                 }
        //             ],
        //             "maxId": "0",
        //             "minId": "0"
        //         }
        //     }
        //
        // cross
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1698114119193,
        //         "data": {
        //             "resultList": [
        //                 {
        //                     "liqId": "123",
        //                     "liqStartTime": "1653453245342",
        //                     "liqEndTime": "16312423423432",
        //                     "liqRisk": "1.01",
        //                     "totalAssets": "1242.34",
        //                     "totalDebt": "1100",
        //                     "LiqFee": "1.2",
        //                     "cTime": "1653453245342"
        //                 }
        //             ],
        //             "maxId": "0",
        //             "minId": "0"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const liquidations = this.safeValue (data, 'resultList', []);
        return this.parseLiquidations (liquidations, market, since, limit);
    }

    parseLiquidation (liquidation, market: Market = undefined) {
        //
        // isolated
        //
        //     {
        //         "liqId": "123",
        //         "symbol": "BTCUSDT",
        //         "liqStartTime": "1653453245342",
        //         "liqEndTime": "16312423423432",
        //         "liqRisk": "1.01",
        //         "totalAssets": "1242.34",
        //         "totalDebt": "1100",
        //         "LiqFee": "1.2",
        //         "cTime": "1653453245342"
        //     }
        //
        // cross
        //
        //     {
        //         "liqId": "123",
        //         "liqStartTime": "1653453245342",
        //         "liqEndTime": "16312423423432",
        //         "liqRisk": "1.01",
        //         "totalAssets": "1242.34",
        //         "totalDebt": "1100",
        //         "LiqFee": "1.2",
        //         "cTime": "1653453245342"
        //     }
        //
        const marketId = this.safeString (liquidation, 'symbol');
        const timestamp = this.safeInteger (liquidation, 'liqEndTime');
        const liquidationFee = this.safeString (liquidation, 'LiqFee');
        const totalDebt = this.safeString (liquidation, 'totalDebt');
        const quoteValueString = Precise.stringAdd (liquidationFee, totalDebt);
        return this.safeLiquidation ({
            'info': liquidation,
            'symbol': this.safeSymbol (marketId, market),
            'contracts': undefined,
            'contractSize': undefined,
            'price': undefined,
            'baseValue': undefined,
            'quoteValue': this.parseNumber (quoteValueString),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        });
    }

    async fetchIsolatedBorrowRate (symbol: string, params = {}) {
        /**
         * @method
         * @name bitget#fetchIsolatedBorrowRate
         * @description fetch the rate of interest to borrow a currency for margin trading
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-isolated-margin-interest-rate-and-max-borrowable-amount
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.symbol] required for isolated margin
         * @returns {object} an [isolated borrow rate structure]{@link https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['info']['symbolName'],
        };
        const response = await this.publicMarginGetMarginV1IsolatedPublicInterestRateAndLimit (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1698208075332,
        //         "data": [
        //             {
        //                 "symbol": "BTCUSDT",
        //                 "leverage": "10",
        //                 "baseCoin": "BTC",
        //                 "baseTransferInAble": true,
        //                 "baseBorrowAble": true,
        //                 "baseDailyInterestRate": "0.00007",
        //                 "baseYearlyInterestRate": "0.02555",
        //                 "baseMaxBorrowableAmount": "35",
        //                 "baseVips": [
        //                     {
        //                         "level": "0",
        //                         "dailyInterestRate": "0.00007",
        //                         "yearlyInterestRate": "0.02555",
        //                         "discountRate": "1"
        //                     },
        //                 ],
        //                 "quoteCoin": "USDT",
        //                 "quoteTransferInAble": true,
        //                 "quoteBorrowAble": true,
        //                 "quoteDailyInterestRate": "0.00012627",
        //                 "quoteYearlyInterestRate": "0.04608855",
        //                 "quoteMaxBorrowableAmount": "300000",
        //                 "quoteVips": [
        //                     {
        //                         "level": "0",
        //                         "dailyInterestRate": "0.000126279",
        //                         "yearlyInterestRate": "0.046091835",
        //                         "discountRate": "1"
        //                     },
        //                 ]
        //             }
        //         ]
        //     }
        //
        const timestamp = this.safeInteger (response, 'requestTime');
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0, {});
        first['timestamp'] = timestamp;
        return this.parseIsolatedBorrowRate (first, market);
    }

    parseIsolatedBorrowRate (info, market: Market = undefined) {
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "leverage": "10",
        //         "baseCoin": "BTC",
        //         "baseTransferInAble": true,
        //         "baseBorrowAble": true,
        //         "baseDailyInterestRate": "0.00007",
        //         "baseYearlyInterestRate": "0.02555",
        //         "baseMaxBorrowableAmount": "35",
        //         "baseVips": [
        //             {
        //                 "level": "0",
        //                 "dailyInterestRate": "0.00007",
        //                 "yearlyInterestRate": "0.02555",
        //                 "discountRate": "1"
        //             },
        //         ],
        //         "quoteCoin": "USDT",
        //         "quoteTransferInAble": true,
        //         "quoteBorrowAble": true,
        //         "quoteDailyInterestRate": "0.00012627",
        //         "quoteYearlyInterestRate": "0.04608855",
        //         "quoteMaxBorrowableAmount": "300000",
        //         "quoteVips": [
        //             {
        //                 "level": "0",
        //                 "dailyInterestRate": "0.000126279",
        //                 "yearlyInterestRate": "0.046091835",
        //                 "discountRate": "1"
        //             },
        //         ]
        //     }
        //
        const marketId = this.safeString (info, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const baseId = this.safeString (info, 'baseCoin');
        const quoteId = this.safeString (info, 'quoteCoin');
        const timestamp = this.safeInteger (info, 'timestamp');
        return {
            'symbol': symbol,
            'base': this.safeCurrencyCode (baseId),
            'baseRate': this.safeNumber (info, 'baseDailyInterestRate'),
            'quote': this.safeCurrencyCode (quoteId),
            'quoteRate': this.safeNumber (info, 'quoteDailyInterestRate'),
            'period': 86400000, // 1-Day
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    async fetchCrossBorrowRate (code: string, params = {}) {
        /**
         * @method
         * @name bitget#fetchCrossBorrowRate
         * @description fetch the rate of interest to borrow a currency for margin trading
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-cross-margin-interest-rate-and-borrowable
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.symbol] required for isolated margin
         * @returns {object} a [borrow rate structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#borrow-rate-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['code'],
        };
        const response = await this.publicMarginGetMarginV1CrossPublicInterestRateAndLimit (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1698208150986,
        //         "data": [
        //             {
        //                 "coin": "BTC",
        //                 "leverage": "3",
        //                 "transferInAble": true,
        //                 "borrowAble": true,
        //                 "dailyInterestRate": "0.00007",
        //                 "yearlyInterestRate": "0.02555",
        //                 "maxBorrowableAmount": "26",
        //                 "vips": [
        //                     {
        //                         "level": "0",
        //                         "dailyInterestRate": "0.00007",
        //                         "yearlyInterestRate": "0.02555",
        //                         "discountRate": "1"
        //                     },
        //                 ]
        //             }
        //         ]
        //     }
        //
        const timestamp = this.safeInteger (response, 'requestTime');
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0, {});
        first['timestamp'] = timestamp;
        return this.parseBorrowRate (first, currency);
    }

    parseBorrowRate (info, currency: Currency = undefined) {
        //
        //     {
        //         "coin": "BTC",
        //         "leverage": "3",
        //         "transferInAble": true,
        //         "borrowAble": true,
        //         "dailyInterestRate": "0.00007",
        //         "yearlyInterestRate": "0.02555",
        //         "maxBorrowableAmount": "26",
        //         "vips": [
        //             {
        //                 "level": "0",
        //                 "dailyInterestRate": "0.00007",
        //                 "yearlyInterestRate": "0.02555",
        //                 "discountRate": "1"
        //             },
        //         ]
        //     }
        //
        const currencyId = this.safeString (info, 'coin');
        const timestamp = this.safeInteger (info, 'timestamp');
        return {
            'currency': this.safeCurrencyCode (currencyId, currency),
            'rate': this.safeNumber (info, 'dailyInterestRate'),
            'period': 86400000, // 1-Day
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    async fetchBorrowInterest (code: Str = undefined, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitget#fetchBorrowInterest
         * @description fetch the interest owed by the user for borrowing currency for margin trading
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-isolated-interest-records
         * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-cross-interest-records
         * @param {string} [code] unified currency code
         * @param {string} [symbol] unified market symbol when fetching interest in isolated markets
         * @param {int} [since] the earliest time in ms to fetch borrow interest for
         * @param {int} [limit] the maximum number of structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        } else {
            request['startTime'] = this.milliseconds () - 7776000000;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        let response = undefined;
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchBorrowInterest', params, 'cross');
        if (marginMode === 'isolated') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchBorrowInterest() requires a symbol argument');
            }
            request['symbol'] = market['info']['symbolName'];
            response = await this.privateMarginGetMarginV1IsolatedInterestList (this.extend (request, params));
        } else if (marginMode === 'cross') {
            response = await this.privateMarginGetMarginV1CrossInterestList (this.extend (request, params));
        }
        //
        // isolated
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1698282523888,
        //         "data": {
        //             "resultList": [
        //                 {
        //                     "interestId": "1100560904468705284",
        //                     "interestCoin": "USDT",
        //                     "interestRate": "0.000126279",
        //                     "loanCoin": "USDT",
        //                     "amount": "0.00000298",
        //                     "type": "scheduled",
        //                     "symbol": "BTCUSDT",
        //                     "ctime": "1698120000000"
        //                 },
        //             ],
        //             "maxId": "1100560904468705284",
        //             "minId": "1096915487398965249"
        //         }
        //     }
        //
        // cross
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1698282552126,
        //         "data": {
        //             "resultList": [
        //                 {
        //                     "interestId": "1099126154352799744",
        //                     "interestCoin": "USDT",
        //                     "interestRate": "0.000126279",
        //                     "loanCoin": "USDT",
        //                     "amount": "0.00002631",
        //                     "type": "scheduled",
        //                     "ctime": "1697778000000"
        //                 },
        //             ],
        //             "maxId": "1099126154352799744",
        //             "minId": "1096917004629716993"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const rows = this.safeValue (data, 'resultList', []);
        const interest = this.parseBorrowInterests (rows, market);
        return this.filterByCurrencySinceLimit (interest, code, since, limit);
    }

    parseBorrowInterest (info, market: Market = undefined) {
        //
        // isolated
        //
        //     {
        //         "interestId": "1100560904468705284",
        //         "interestCoin": "USDT",
        //         "interestRate": "0.000126279",
        //         "loanCoin": "USDT",
        //         "amount": "0.00000298",
        //         "type": "scheduled",
        //         "symbol": "BTCUSDT",
        //         "ctime": "1698120000000"
        //     }
        //
        // cross
        //
        //     {
        //         "interestId": "1099126154352799744",
        //         "interestCoin": "USDT",
        //         "interestRate": "0.000126279",
        //         "loanCoin": "USDT",
        //         "amount": "0.00002631",
        //         "type": "scheduled",
        //         "ctime": "1697778000000"
        //     }
        //
        const marketId = this.safeString (info, 'symbol');
        market = this.safeMarket (marketId, market);
        const marginMode = (marketId !== undefined) ? 'isolated' : 'cross';
        const timestamp = this.safeInteger (info, 'ctime');
        return {
            'symbol': this.safeString (market, 'symbol'),
            'marginMode': marginMode,
            'currency': this.safeCurrencyCode (this.safeString (info, 'interestCoin')),
            'interest': this.safeNumber (info, 'amount'),
            'interestRate': this.safeNumber (info, 'interestRate'),
            'amountBorrowed': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        // spot
        //
        //     {"status":"fail","err_code":"01001","err_msg":"系统异常，请稍后重试"}
        //     {"status":"error","ts":1595594160149,"err_code":"invalid-parameter","err_msg":"invalid size, valid range: [1,2000]"}
        //     {"status":"error","ts":1595684716042,"err_code":"invalid-parameter","err_msg":"illegal sign invalid"}
        //     {"status":"error","ts":1595700216275,"err_code":"bad-request","err_msg":"your balance is low!"}
        //     {"status":"error","ts":1595700344504,"err_code":"invalid-parameter","err_msg":"invalid type"}
        //     {"status":"error","ts":1595703343035,"err_code":"bad-request","err_msg":"order cancel fail"}
        //     {"status":"error","ts":1595704360508,"err_code":"invalid-parameter","err_msg":"accesskey not null"}
        //     {"status":"error","ts":1595704490084,"err_code":"invalid-parameter","err_msg":"permissions not right"}
        //     {"status":"error","ts":1595711862763,"err_code":"system exception","err_msg":"system exception"}
        //     {"status":"error","ts":1595730308979,"err_code":"bad-request","err_msg":"20003"}
        //
        // swap
        //
        //     {"code":"40015","msg":"","requestTime":1595698564931,"data":null}
        //     {"code":"40017","msg":"Order id must not be blank","requestTime":1595702477835,"data":null}
        //     {"code":"40017","msg":"Order Type must not be blank","requestTime":1595698516162,"data":null}
        //     {"code":"40301","msg":"","requestTime":1595667662503,"data":null}
        //     {"code":"40017","msg":"Contract code must not be blank","requestTime":1595703151651,"data":null}
        //     {"code":"40108","msg":"","requestTime":1595885064600,"data":null}
        //     {"order_id":"513468410013679613","client_oid":null,"symbol":"ethusd","result":false,"err_code":"order_no_exist_error","err_msg":"订单不存在！"}
        //
        const message = this.safeString (response, 'err_msg');
        const errorCode = this.safeString2 (response, 'code', 'err_code');
        const feedback = this.id + ' ' + body;
        const nonEmptyMessage = ((message !== undefined) && (message !== ''));
        if (nonEmptyMessage) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        }
        const nonZeroErrorCode = (errorCode !== undefined) && (errorCode !== '00000');
        if (nonZeroErrorCode) {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
        if (nonZeroErrorCode || nonEmptyMessage) {
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }

    sign (path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const signed = api[0] === 'private';
        const endpoint = api[1];
        const pathPart = '/api';
        const request = '/' + this.implodeParams (path, params);
        const payload = pathPart + request;
        let url = this.implodeHostname (this.urls['api'][endpoint]) + payload;
        const query = this.omit (params, this.extractParams (path));
        if (!signed && (method === 'GET')) {
            const keys = Object.keys (query);
            const keysLength = keys.length;
            if (keysLength > 0) {
                url = url + '?' + this.urlencode (query);
            }
        }
        if (signed) {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let auth = timestamp + method + payload;
            if (method === 'POST') {
                body = this.json (params);
                auth += body;
            } else {
                if (Object.keys (params).length) {
                    const queryInner = '?' + this.urlencode (this.keysort (params));
                    url += queryInner;
                    auth += queryInner;
                }
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256, 'base64');
            const broker = this.safeString (this.options, 'broker');
            headers = {
                'ACCESS-KEY': this.apiKey,
                'ACCESS-SIGN': signature,
                'ACCESS-TIMESTAMP': timestamp,
                'ACCESS-PASSPHRASE': this.password,
                'X-CHANNEL-API-CODE': broker,
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
