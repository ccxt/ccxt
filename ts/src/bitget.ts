
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bitget.js';
import { ExchangeError, ExchangeNotAvailable, NotSupported, OnMaintenance, ArgumentsRequired, BadRequest, AccountSuspended, InvalidAddress, PermissionDenied, DDoSProtection, InsufficientFunds, InvalidNonce, CancelPending, InvalidOrder, OrderNotFound, AuthenticationError, RequestTimeout, BadSymbol, RateLimitExceeded } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Int, OrderSide, OrderType, Trade, OHLCV, Order, FundingRateHistory, OrderRequest, FundingHistory, Balances, Str, Transaction, Ticker, OrderBook, Tickers, Market, Strings, Currency, Position, Liquidation, TransferEntry, Leverage, MarginMode, Num, MarginModification, TradingFeeInterface, Currencies, TradingFees, Conversion, CrossBorrowRate, IsolatedBorrowRate, Dict, LeverageTier, int, LedgerEntry, FundingRate, DepositAddress, LongShortRatio, BorrowInterest, FundingRates } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class bitget
 * @augments Exchange
 */
export default class bitget extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bitget',
            'name': 'Bitget',
            'countries': [ 'SG' ],
            'version': 'v2',
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
                'closeAllPositions': true,
                'closePosition': true,
                'createConvertTrade': true,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopLossOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': true,
                'createTriggerOrder': true,
                'editOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchConvertCurrencies': true,
                'fetchConvertQuote': true,
                'fetchConvertTrade': false,
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
                'fetchFundingInterval': true,
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': true,
                'fetchIsolatedBorrowRate': true,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': true,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': true,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMarkPrice': true,
                'fetchMyLiquidations': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositionHistory': 'emulated',
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsHistory': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': true,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'repayCrossMargin': true,
                'repayIsolatedMargin': true,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': true,
                'setPositionMode': true,
                'signIn': false,
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
                'logo': 'https://github.com/user-attachments/assets/fbaa10cc-a277-441d-a5b7-997dd9a87658',
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
                    'uta': 'https://api.{hostname}',
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
                            'v2/mix/market/account-long-short': 20,
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
                            'v2/margin/market/long-short-ratio': 20,
                        },
                    },
                    'earn': {
                        'get': {
                            'v2/earn/loan/public/coinInfos': 2,
                            'v2/earn/loan/public/hour-interest': 2,
                        },
                    },
                    'uta': {
                        'get': {
                            'v3/market/instruments': 1,
                            'v3/market/tickers': 1,
                            'v3/market/orderbook': 1,
                            'v3/market/fills': 1,
                            'v3/market/open-interest': 1,
                            'v3/market/candles': 1,
                            'v3/market/history-candles': 1,
                            'v3/market/current-fund-rate': 1,
                            'v3/market/history-fund-rate': 1,
                            'v3/market/risk-reserve': 1,
                            'v3/market/discount-rate': 1,
                            'v3/market/margin-loans': 1,
                            'v3/market/position-tier': 1,
                            'v3/market/oi-limit': 2,
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
                            'v2/account/funding-assets': 2,
                            'v2/account/bot-assets': 2,
                            'v2/account/all-account-balance': 20,
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
                            'v2/spot/wallet/cancel-withdrawal': 2,
                            'v2/spot/wallet/modify-deposit-account': 2,
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
                            'v2/mix/market/position-long-short': 20,
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
                            'v2/mix/order/place-order': 2,
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
                            'v2/margin/crossed/account/assets': 2,
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
                            'v2/margin/isolated/account/assets': 2,
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
                            'v2/convert/bgb-convert-coin-list': 2,
                            'v2/convert/bgb-convert-records': 2,
                        },
                        'post': {
                            'v2/convert/trade': 2,
                            'v2/convert/bgb-convert': 2,
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
                            'v2/earn/account/assets': 2,
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
                    'common': {
                        'get': {
                            'v2/common/trade-rate': 2,
                        },
                    },
                    'uta': {
                        'get': {
                            'v3/account/assets': 1,
                            'v3/account/settings': 1,
                            'v3/account/deposit-records': 2,
                            'v3/account/financial-records': 1,
                            'v3/account/repayable-coins': 2,
                            'v3/account/payment-coins': 2,
                            'v3/account/convert-records': 1,
                            'v3/account/transferable-coins': 2,
                            'v3/account/sub-transfer-record': 4,
                            'v3/ins-loan/transfered': 6.6667,
                            'v3/ins-loan/symbols': 6.6667,
                            'v3/ins-loan/risk-unit': 6.6667,
                            'v3/ins-loan/repaid-history': 6.6667,
                            'v3/ins-loan/product-infos': 6.6667,
                            'v3/ins-loan/loan-order': 6.6667,
                            'v3/ins-loan/ltv-convert': 6.6667,
                            'v3/ins-loan/ensure-coins-convert': 6.6667,
                            'v3/position/current-position': 1,
                            'v3/position/history-position': 1,
                            'v3/trade/order-info': 1,
                            'v3/trade/unfilled-orders': 1,
                            'v3/trade/unfilled-strategy-orders': 1,
                            'v3/trade/history-orders': 1,
                            'v3/trade/history-strategy-orders': 1,
                            'v3/trade/fills': 1,
                            'v3/user/sub-list': 2,
                            'v3/user/sub-api-list': 2,
                        },
                        'post': {
                            'v3/account/set-leverage': 2,
                            'v3/account/set-hold-mode': 2,
                            'v3/account/repay': 4,
                            'v3/account/transfer': 4,
                            'v3/account/sub-transfer': 4,
                            'v3/account/max-open-available': 4,
                            'v3/ins-loan/bind-uid': 6.6667,
                            'v3/trade/place-order': 2,
                            'v3/trade/place-strategy-order': 2,
                            'v3/trade/modify-order': 2,
                            'v3/trade/modify-strategy-order': 2,
                            'v3/trade/cancel-order': 2,
                            'v3/trade/cancel-strategy-order': 2,
                            'v3/trade/place-batch': 4,
                            'v3/trade/batch-modify-order': 2,
                            'v3/trade/cancel-batch': 4,
                            'v3/trade/cancel-symbol-order': 4,
                            'v3/trade/close-positions': 4,
                            'v3/user/create-sub': 2,
                            'v3/user/freeze-sub': 2,
                            'v3/user/create-sub-api': 2,
                            'v3/user/update-sub-api': 2,
                            'v3/user/delete-sub-api': 2,
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
                    '40020': BadRequest, // {"code":"40020","msg":"Parameter orderId error","requestTime":1754305078588,"data":null}
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
                    '40762': InsufficientFunds, // {"code":"40762","msg":"The order amount exceeds the balance","requestTime":1716572156622,"data":null}
                    '40768': OrderNotFound, // Order does not exist
                    '40808': InvalidOrder, // {"code":"40808","msg":"Parameter verification exception size checkBDScale error value=2293.577 checkScale=2","requestTime":1725638500052,"data":null}
                    '41103': InvalidOrder, // {"code":"41103","msg":"param price scale error error","requestTime":1725635883561,"data":null}
                    '41114': OnMaintenance, // {"code":"41114","msg":"The current trading pair is under maintenance, please refer to the official announcement for the opening time","requestTime":1679196062544,"data":null}
                    '43011': InvalidOrder, // The parameter does not meet the specification executePrice <= 0
                    '43001': OrderNotFound,
                    '43012': InsufficientFunds, // {"code":"43012","msg":"Insufficient balance","requestTime":1711648951774,"data":null}
                    '43025': InvalidOrder, // Plan order does not exist
                    '43115': OnMaintenance, // {"code":"43115","msg":"The current trading pair is opening soon, please refer to the official announcement for the opening time","requestTime":1688907202434,"data":null}
                    '45110': InvalidOrder, // {"code":"45110","msg":"less than the minimum amount 5 USDT","requestTime":1669911118932,"data":null}
                    '40774': InvalidOrder, // {"code":"40774","msg":"The order type for unilateral position must also be the unilateral position type.","requestTime":1758709764409,"data":null}
                    '45122': InvalidOrder, // {"code":"45122","msg":"Short position stop loss price please > mark price 106.86","requestTime":1758709970499,"data":null}
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
                'APX': 'AstroPepeX',
                'DEGEN': 'DegenReborn',
                'JADE': 'Jade Protocol',
                'OMNI': 'omni', // conflict with Omni Network
                'TONCOIN': 'TON',
            },
            'options': {
                'uta': false,
                'timeDifference': 0, // the difference between system clock and Binance clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
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
                    'uta': {
                        '1m': '1m',
                        '3m': '3m',
                        '5m': '5m',
                        '15m': '15m',
                        '30m': '30m',
                        '1h': '1H',
                        '2h': '2H',
                        '4h': '4H',
                        '6h': '6H',
                        '12h': '12H',
                        '1d': '1D',
                    },
                },
                'fetchMarkets': {
                    'types': [ 'spot', 'swap' ], // there is future markets but they use the same endpoints as swap
                },
                'defaultType': 'spot', // 'spot', 'swap', 'future'
                'defaultSubType': 'linear', // 'linear', 'inverse'
                'createMarketBuyOrderRequiresPrice': true,
                'broker': 'p4sve',
                'withdraw': {
                    'fillResponseFromRequest': true,
                },
                'fetchOHLCV': {
                    // ### Timeframe settings ###
                    // after testing, the below values are real ones, because the values provided by API DOCS are wrong
                    // so, start timestamp should be within these thresholds to be able to call "recent" candles endpoint
                    'maxRecentDaysPerTimeframe': {
                        '1m': 30,
                        '3m': 30,
                        '5m': 30,
                        '15m': 30,
                        '30m': 30,
                        '1h': 60,
                        '4h': 240,
                        '6h': 360,
                        '12h': 720,
                        '1d': 1440,
                        '3d': 1440 * 3,
                        '1w': 1440 * 7,
                        '1M': 1440 * 30,
                    },
                    'spot': {
                        'maxLimitPerTimeframe': {
                            '1d': 300,
                            '3d': 100,
                            '1w': 100,
                            '1M': 100,
                        },
                        'method': 'publicSpotGetV2SpotMarketCandles', // publicSpotGetV2SpotMarketCandles or publicSpotGetV2SpotMarketHistoryCandles
                    },
                    'swap': {
                        'maxLimitPerTimeframe': {
                            '4h': 540,
                            '6h': 360,
                            '12h': 180,
                            '1d': 90,
                            '3d': 30,
                            '1w': 13,
                            '1M': 4,
                        },
                        'method': 'publicMixGetV2MixMarketCandles', // publicMixGetV2MixMarketCandles or publicMixGetV2MixMarketHistoryCandles or publicMixGetV2MixMarketHistoryIndexCandles or publicMixGetV2MixMarketHistoryMarkCandles
                    },
                },
                'fetchTrades': {
                    'spot': {
                        'method': 'publicSpotGetV2SpotMarketFillsHistory', // or publicSpotGetV2SpotMarketFills
                    },
                    'swap': {
                        'method': 'publicMixGetV2MixMarketFillsHistory', // or publicMixGetV2MixMarketFills
                    },
                },
                'fetchFundingRate': {
                    'method': 'publicMixGetV2MixMarketCurrentFundRate', // or publicMixGetV2MixMarketFundingTime
                },
                'accountsByType': {
                    'spot': 'spot',
                    'cross': 'crossed_margin',
                    'isolated': 'isolated_margin',
                    'swap': 'usdt_futures',
                    'usdc_swap': 'usdc_futures',
                    'future': 'coin_futures',
                    'p2p': 'p2p',
                },
                'accountsById': {
                    'spot': 'spot',
                    'crossed_margin': 'cross',
                    'isolated_margin': 'isolated',
                    'usdt_futures': 'swap',
                    'usdc_futures': 'usdc_swap',
                    'coin_futures': 'future',
                    'p2p': 'p2p',
                },
                'sandboxMode': false,
                'networks': {
                    // 'TRX': 'TRX', // different code for mainnet
                    'TRC20': 'TRC20',
                    // 'ETH': 'ETH', // different code for mainnet
                    'ERC20': 'ERC20',
                    'BEP20': 'BSC',
                    // 'BEP20': 'BEP20', // different for BEP20
                    'ATOM': 'ATOM',
                    'ACA': 'AcalaToken',
                    'APT': 'Aptos',
                    'ARBONE': 'ArbitrumOne',
                    'ARBNOVA': 'ArbitrumNova',
                    'AVAXC': 'C-Chain',
                    'AVAXX': 'X-Chain',
                    'AR': 'Arweave',
                    'BCH': 'BCH',
                    'BCHA': 'BCHA',
                    'BITCI': 'BITCI',
                    'BTC': 'BTC',
                    'CELO': 'CELO',
                    'CSPR': 'CSPR',
                    'ADA': 'Cardano',
                    'CHZ': 'ChilizChain',
                    'CRC20': 'CronosChain',
                    'DOGE': 'DOGE',
                    'DOT': 'DOT',
                    'EOS': 'EOS',
                    'ETHF': 'ETHFAIR',
                    'ETHW': 'ETHW',
                    'ETC': 'ETC',
                    'EGLD': 'Elrond',
                    'FIL': 'FIL',
                    'FIO': 'FIO',
                    'FTM': 'Fantom',
                    'HRC20': 'HECO',
                    'ONE': 'Harmony',
                    'HNT': 'Helium',
                    'ICP': 'ICP',
                    'IOTX': 'IoTeX',
                    'KARDIA': 'KAI',
                    'KAVA': 'KAVA',
                    'KDA': 'KDA',
                    'KLAY': 'Klaytn',
                    'KSM': 'Kusama',
                    'LAT': 'LAT',
                    'LTC': 'LTC',
                    'MINA': 'MINA',
                    'MOVR': 'MOVR',
                    'METIS': 'MetisToken',
                    'GLMR': 'Moonbeam',
                    'NEAR': 'NEARProtocol',
                    'NULS': 'NULS',
                    'OASYS': 'OASYS',
                    'OASIS': 'ROSE',
                    'OMNI': 'OMNI',
                    'ONT': 'Ontology',
                    'OPTIMISM': 'Optimism',
                    'OSMO': 'Osmosis',
                    'POKT': 'PocketNetwork',
                    'MATIC': 'Polygon',
                    'QTUM': 'QTUM',
                    'REEF': 'REEF',
                    'SOL': 'SOL',
                    'SYS': 'SYS', // SyscoinNEVM is different
                    'SXP': 'Solar',
                    'XYM': 'Symbol',
                    'TON': 'TON',
                    'TT': 'TT',
                    'TLOS': 'Telos',
                    'THETA': 'ThetaToken',
                    'VITE': 'VITE',
                    'WAVES': 'WAVES',
                    'WAX': 'WAXP',
                    'WEMIX': 'WEMIXMainnet',
                    'XDC': 'XDCNetworkXDC',
                    'XRP': 'XRP',
                    'FET': 'FETCH',
                    'NEM': 'NEM',
                    'REI': 'REINetwork',
                    'ZIL': 'ZIL',
                    'ABBC': 'ABBCCoin',
                    'RSK': 'RSK',
                    'AZERO': 'AZERO',
                    'TRC10': 'TRC10',
                    'JUNO': 'JUNO',
                    // undetected: USDSP, more info at https://www.bitget.com/v1/spot/public/coinChainList
                    // todo: uncomment below after unification
                    // 'TERRACLASSIC': 'Terra', // tbd, that network id is also assigned to TERRANEW network
                    // 'CUBENETWORK': 'CUBE',
                    // 'CADUCEUS': 'CMP',
                    // 'CONFLUX': 'CFX', // CFXeSpace is different
                    // 'CERE': 'CERE',
                    // 'CANTO': 'CANTO',
                    'ZKSYNC': 'zkSyncEra',
                    'STARKNET': 'Starknet',
                    'VIC': 'VICTION',
                },
                'networksById': {
                },
                'fetchPositions': {
                    'method': 'privateMixGetV2MixPositionAllPosition', // or privateMixGetV2MixPositionHistoryPosition
                },
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
                // fiat currencies on deposit page
                'fiatCurrencies': [ 'EUR', 'VND', 'PLN', 'CZK', 'HUF', 'DKK', 'AUD', 'CAD', 'NOK', 'SEK', 'CHF', 'MXN', 'COP', 'ARS', 'GBP', 'BRL', 'UAH', 'ZAR' ],
            },
            'features': {
                'spot': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'last': true,
                            'mark': true,
                            'index': false, // not on spot
                        },
                        'triggerDirection': false,
                        'stopLossPrice': true, // todo:  not yet implemented in spot
                        'takeProfitPrice': true, // todo: not yet implemented in spot
                        'attachedStopLossTakeProfit': {
                            'triggerPriceType': {
                                'last': false,
                                'mark': false,
                                'index': false,
                            },
                            'price': true,
                        },
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'marketBuyRequiresPrice': true,
                        'marketBuyByCost': true,
                        // exchange-supported features
                        // 'selfTradePrevention': true,
                        // 'twap': false,
                        // 'iceberg': false,
                        // 'oco': false,
                    },
                    'createOrders': {
                        'max': 50,
                    },
                    'fetchMyTrades': {
                        'marginMode': true,
                        'limit': 100,
                        'daysBack': undefined,
                        'untilDays': 90,
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
                        'limit': 100,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': true,
                        'limit': 100,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': 90,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 200, // variable timespans for recent endpoint, 200 for historical
                    },
                },
                'forPerps': {
                    'extends': 'spot',
                    'createOrder': {
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'last': true,
                            'mark': true,
                            'index': false, // not on spot
                        },
                        'triggerDirection': false,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': {
                            'triggerPriceType': {
                                'last': true,
                                'mark': true,
                                'index': true,
                            },
                            'price': false,
                        },
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': true,
                        'trailing': true,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': false,
                        // exchange-supported features
                        // 'selfTradePrevention': true,
                        // 'trailing': true,
                        // 'twap': false,
                        // 'iceberg': false,
                        // 'oco': false,
                    },
                    'fetchMyTrades': {
                        'untilDays': 7,
                    },
                    'fetchClosedOrders': {
                        'trailing': true,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'forPerps',
                    },
                    'inverse': {
                        'extends': 'forPerps',
                    },
                },
                'future': {
                    'linear': {
                        'extends': 'forPerps',
                    },
                    'inverse': {
                        'extends': 'forPerps',
                    },
                },
            },
        });
    }

    setSandboxMode (enabled) {
        this.options['sandboxMode'] = enabled;
    }

    handleProductTypeAndParams (market = undefined, params = {}) {
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('handleProductTypeAndParams', undefined, params);
        let defaultProductType = undefined;
        if ((subType !== undefined) && (market === undefined)) {
            // set default only if subType is defined and market is not defined, since there is also USDC productTypes which are also linear
            // const sandboxMode = this.safeBool (this.options, 'sandboxMode', false);
            // if (sandboxMode) {
            //     defaultProductType = (subType === 'linear') ? 'SUSDT-FUTURES' : 'SCOIN-FUTURES';
            // } else {
            defaultProductType = (subType === 'linear') ? 'USDT-FUTURES' : 'COIN-FUTURES';
            // }
        }
        let productType = this.safeString2 (params, 'productType', 'category', defaultProductType);
        if ((productType === undefined) && (market !== undefined)) {
            const settle = market['settle'];
            if (market['spot']) {
                let marginMode = undefined;
                [ marginMode, params ] = this.handleMarginModeAndParams ('handleProductTypeAndParams', params);
                if (marginMode !== undefined) {
                    productType = 'MARGIN';
                } else {
                    productType = 'SPOT';
                }
            } else if (settle === 'USDT') {
                productType = 'USDT-FUTURES';
            } else if (settle === 'USDC') {
                productType = 'USDC-FUTURES';
            } else if (settle === 'SUSDT') {
                productType = 'SUSDT-FUTURES';
            } else if (settle === 'SUSDC') {
                productType = 'SUSDC-FUTURES';
            } else if ((settle === 'SBTC') || (settle === 'SETH') || (settle === 'SEOS')) {
                productType = 'SCOIN-FUTURES';
            } else {
                productType = 'COIN-FUTURES';
            }
        }
        if (productType === undefined) {
            throw new ArgumentsRequired (this.id + ' requires a productType param, one of "USDT-FUTURES", "USDC-FUTURES", "COIN-FUTURES", "SUSDT-FUTURES", "SUSDC-FUTURES", "SCOIN-FUTURES" or for uta only "SPOT"');
        }
        params = this.omit (params, [ 'productType', 'category' ]);
        return [ productType, params ];
    }

    /**
     * @method
     * @name bitget#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://www.bitget.com/api-doc/common/public/Get-Server-Time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicCommonGetV2PublicTime (params);
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700111073740,
        //         "data": {
        //             "serverTime": "1700111073740"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.safeInteger (data, 'serverTime');
    }

    /**
     * @method
     * @name bitget#fetchMarkets
     * @description retrieves data on all markets for bitget
     * @see https://www.bitget.com/api-doc/spot/market/Get-Symbols
     * @see https://www.bitget.com/api-doc/contract/market/Get-All-Symbols-Contracts
     * @see https://www.bitget.com/api-doc/margin/common/support-currencies
     * @see https://www.bitget.com/api-doc/uta/public/Instruments
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchMarkets', 'uta', false);
        if (uta) {
            return await this.fetchUtaMarkets (params);
        } else {
            return await this.fetchDefaultMarkets (params);
        }
    }

    async fetchDefaultMarkets (params): Promise<Market[]> {
        let types = undefined;
        const fetchMarketsOptions = this.safeDict (this.options, 'fetchMarkets');
        const defaultMarkets = [ 'spot', 'swap' ];
        if (fetchMarketsOptions !== undefined) {
            types = this.safeList (fetchMarketsOptions, 'types', defaultMarkets);
        } else {
            // for backward-compatibility
            types = this.safeList (this.options, 'fetchMarkets', defaultMarkets);
        }
        const promises = [];
        let fetchMargins = false;
        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            if ((type === 'swap') || (type === 'future')) {
                const subTypes = [ 'USDT-FUTURES', 'COIN-FUTURES', 'USDC-FUTURES', 'SUSDT-FUTURES', 'SCOIN-FUTURES', 'SUSDC-FUTURES' ];
                for (let j = 0; j < subTypes.length; j++) {
                    promises.push (this.publicMixGetV2MixMarketContracts (this.extend (params, {
                        'productType': subTypes[j],
                    })));
                }
            } else if (type === 'spot') {
                promises.push (this.publicSpotGetV2SpotPublicSymbols (params));
                fetchMargins = true;
                promises.push (this.publicMarginGetV2MarginCurrencies (params));
            } else {
                throw new NotSupported (this.id + ' does not support ' + type + ' market');
            }
        }
        const results = await Promise.all (promises);
        let markets = [];
        this.options['crossMarginPairsData'] = [];
        this.options['isolatedMarginPairsData'] = [];
        for (let i = 0; i < results.length; i++) {
            const res = this.safeDict (results, i);
            const data = this.safeList (res, 'data', []);
            const firstData = this.safeDict (data, 0, {});
            const isBorrowable = this.safeBool (firstData, 'isBorrowable');
            if (fetchMargins && isBorrowable !== undefined) {
                const keysList = Object.keys (this.indexBy (data, 'symbol'));
                this.options['crossMarginPairsData'] = keysList;
                this.options['isolatedMarginPairsData'] = keysList;
            } else {
                markets = this.arrayConcat (markets, data);
            }
        }
        //
        // spot
        //
        //     {
        //         "symbol": "TRXUSDT",
        //         "baseCoin": "TRX",
        //         "quoteCoin": "USDT",
        //         "minTradeAmount": "0",
        //         "maxTradeAmount": "10000000000",
        //         "takerFeeRate": "0.002",
        //         "makerFeeRate": "0.002",
        //         "pricePrecision": "6",
        //         "quantityPrecision": "4",
        //         "quotePrecision": "6",
        //         "status": "online",
        //         "minTradeUSDT": "5",
        //         "buyLimitPriceRatio": "0.05",
        //         "sellLimitPriceRatio": "0.05"
        //     }
        //
        // swap and future
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "baseCoin": "BTC",
        //         "quoteCoin": "USDT",
        //         "buyLimitPriceRatio": "0.01",
        //         "sellLimitPriceRatio": "0.01",
        //         "feeRateUpRatio": "0.005",
        //         "makerFeeRate": "0.0002",
        //         "takerFeeRate": "0.0006",
        //         "openCostUpRatio": "0.01",
        //         "supportMarginCoins": ["USDT"],
        //         "minTradeNum": "0.001",
        //         "priceEndStep": "1",
        //         "volumePlace": "3",
        //         "pricePlace": "1",
        //         "sizeMultiplier": "0.001",
        //         "symbolType": "perpetual",
        //         "minTradeUSDT": "5",
        //         "maxSymbolOrderNum": "200",
        //         "maxProductOrderNum": "400",
        //         "maxPositionNum": "150",
        //         "symbolStatus": "normal",
        //         "offTime": "-1",
        //         "limitOpenTime": "-1",
        //         "deliveryTime": "",
        //         "deliveryStartTime": "",
        //         "deliveryPeriod": "",
        //         "launchTime": "",
        //         "fundInterval": "8",
        //         "minLever": "1",
        //         "maxLever": "125",
        //         "posLimit": "0.05",
        //         "maintainTime": ""
        //     }
        //
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const marketId = this.safeString (market, 'symbol');
            const quoteId = this.safeString (market, 'quoteCoin');
            const baseId = this.safeString (market, 'baseCoin');
            const quote = this.safeCurrencyCode (quoteId);
            const base = this.safeCurrencyCode (baseId);
            const supportMarginCoins = this.safeValue (market, 'supportMarginCoins', []);
            let settleId = undefined;
            if (this.inArray (baseId, supportMarginCoins)) {
                settleId = baseId;
            } else if (this.inArray (quoteId, supportMarginCoins)) {
                settleId = quoteId;
            } else {
                settleId = this.safeString (supportMarginCoins, 0);
            }
            const settle = this.safeCurrencyCode (settleId);
            let symbol = base + '/' + quote;
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
            const symbolType = this.safeString (market, 'symbolType');
            let marginModes = undefined;
            let isMarginTradingAllowed = false;
            if (symbolType === undefined) {
                type = 'spot';
                spot = true;
                pricePrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'pricePrecision')));
                amountPrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'quantityPrecision')));
                const hasCrossMargin = this.inArray (marketId, this.options['crossMarginPairsData']);
                const hasIsolatedMargin = this.inArray (marketId, this.options['isolatedMarginPairsData']);
                marginModes = {
                    'cross': hasCrossMargin,
                    'isolated': hasIsolatedMargin,
                };
                isMarginTradingAllowed = hasCrossMargin || hasIsolatedMargin;
            } else {
                if (symbolType === 'perpetual') {
                    type = 'swap';
                    swap = true;
                    symbol = symbol + ':' + settle;
                } else if (symbolType === 'delivery') {
                    expiry = this.safeInteger (market, 'deliveryTime');
                    expiryDatetime = this.iso8601 (expiry);
                    const expiryParts = expiryDatetime.split ('-');
                    const yearPart = this.safeString (expiryParts, 0);
                    const dayPart = this.safeString (expiryParts, 2);
                    const year = yearPart.slice (2, 4);
                    const month = this.safeString (expiryParts, 1);
                    const day = dayPart.slice (0, 2);
                    const expiryString = year + month + day;
                    type = 'future';
                    future = true;
                    symbol = symbol + ':' + settle + '-' + expiryString;
                }
                contract = true;
                inverse = (base === settle);
                linear = !inverse;
                const priceDecimals = this.safeInteger (market, 'pricePlace');
                const amountDecimals = this.safeInteger (market, 'volumePlace');
                const priceStep = this.safeString (market, 'priceEndStep');
                const amountStep = this.safeString (market, 'sizeMultiplier');
                const precise = new Precise (priceStep);
                precise.decimals = Math.max (precise.decimals, priceDecimals);
                precise.reduce ();
                const priceString = precise.toString ();
                pricePrecision = this.parseNumber (priceString);
                const preciseAmount = new Precise (amountStep);
                preciseAmount.decimals = Math.max (preciseAmount.decimals, amountDecimals);
                preciseAmount.reduce ();
                const amountString = preciseAmount.toString ();
                amountPrecision = this.parseNumber (amountString);
                marginModes = {
                    'cross': true,
                    'isolated': true,
                };
            }
            const status = this.safeString2 (market, 'status', 'symbolStatus');
            let active = undefined;
            if (status !== undefined) {
                active = ((status === 'online') || (status === 'normal'));
            }
            let minCost = undefined;
            if (quote === 'USDT') {
                minCost = this.safeNumber (market, 'minTradeUSDT');
            }
            const contractSize = contract ? 1 : undefined;
            result.push (this.safeMarketStructure ({
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
                'margin': spot && isMarginTradingAllowed,
                'marginModes': marginModes,
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
                        'min': this.safeNumber (market, 'minLever'),
                        'max': this.safeNumber (market, 'maxLever'),
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
                'created': this.safeInteger (market, 'launchTime'),
                'info': market,
            }));
        }
        return result;
    }

    async fetchUtaMarkets (params): Promise<Market[]> {
        const subTypes = [ 'SPOT', 'USDT-FUTURES', 'COIN-FUTURES', 'USDC-FUTURES' ];
        const promises = [];
        for (let i = 0; i < subTypes.length; i++) {
            const req = this.extend (params, {
                'category': subTypes[i],
            });
            promises.push (this.publicUtaGetV3MarketInstruments (req));
        }
        const results = await Promise.all (promises);
        let markets = [];
        for (let i = 0; i < results.length; i++) {
            const res = this.safeDict (results, i);
            const data = this.safeList (res, 'data', []);
            markets = this.arrayConcat (markets, data);
        }
        //
        // spot uta
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "category": "SPOT",
        //         "baseCoin": "BTC",
        //         "quoteCoin": "USDT",
        //         "buyLimitPriceRatio": "0.05",
        //         "sellLimitPriceRatio": "0.05",
        //         "minOrderQty": "0.000001",
        //         "maxOrderQty": "0",
        //         "pricePrecision": "2",
        //         "quantityPrecision": "6",
        //         "quotePrecision": "8",
        //         "minOrderAmount": "1",
        //         "maxSymbolOrderNum": "400",
        //         "maxProductOrderNum": "400",
        //         "status": "online",
        //         "maintainTime": ""
        //     }
        //
        // margin uta
        //
        //     {
        //         "symbol": "BTCUSDC",
        //         "category": "MARGIN",
        //         "baseCoin": "BTC",
        //         "quoteCoin": "USDC",
        //         "buyLimitPriceRatio": "0.05",
        //         "sellLimitPriceRatio": "0.05",
        //         "minOrderQty": "0.00001",
        //         "maxOrderQty": "0",
        //         "pricePrecision": "2",
        //         "quantityPrecision": "5",
        //         "quotePrecision": "7",
        //         "minOrderAmount": "1",
        //         "maxSymbolOrderNum": "400",
        //         "maxProductOrderNum": "400",
        //         "status": "online",
        //         "maintainTime": "",
        //         "isIsolatedBaseBorrowable": "NO",
        //         "isIsolatedQuotedBorrowable": "NO",
        //         "warningRiskRatio": "0.8",
        //         "liquidationRiskRatio": "1",
        //         "maxCrossedLeverage": "3",
        //         "maxIsolatedLeverage": "0",
        //         "userMinBorrow": "0.00000001",
        //         "areaSymbol": "no"
        //     }
        //
        // swap and future uta
        //
        //     {
        //         "symbol": "BTCPERP",
        //         "category": "USDC-FUTURES",
        //         "baseCoin": "BTC",
        //         "quoteCoin": "USDC",
        //         "buyLimitPriceRatio": "0.02",
        //         "sellLimitPriceRatio": "0.02",
        //         "feeRateUpRatio": "0.005",
        //         "makerFeeRate": "0.0002",
        //         "takerFeeRate": "0.0006",
        //         "openCostUpRatio": "0.01",
        //         "minOrderQty": "0.0001",
        //         "maxOrderQty": "",
        //         "pricePrecision": "1",
        //         "quantityPrecision": "4",
        //         "quotePrecision": null,
        //         "priceMultiplier": "0.5",
        //         "quantityMultiplier": "0.0001",
        //         "type": "perpetual",
        //         "minOrderAmount": "5",
        //         "maxSymbolOrderNum": "200",
        //         "maxProductOrderNum": "1000",
        //         "maxPositionNum": "150",
        //         "status": "online",
        //         "offTime": "-1",
        //         "limitOpenTime": "-1",
        //         "deliveryTime": "",
        //         "deliveryStartTime": "",
        //         "deliveryPeriod": "",
        //         "launchTime": "",
        //         "fundInterval": "8",
        //         "minLeverage": "1",
        //         "maxLeverage": "125",
        //         "maintainTime": ""
        //     }
        //
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const category = this.safeString (market, 'category');
            const marketId = this.safeString (market, 'symbol');
            const quoteId = this.safeString (market, 'quoteCoin');
            const baseId = this.safeString (market, 'baseCoin');
            const quote = this.safeCurrencyCode (quoteId);
            const base = this.safeCurrencyCode (baseId);
            let settleId = undefined;
            let settle = undefined;
            if (category === 'USDT-FUTURES') {
                settleId = 'USDT';
            } else if (category === 'USDC-FUTURES') {
                settleId = 'USDC';
            } else if (category === 'COIN-FUTURES') {
                settleId = base;
            }
            if (settleId !== undefined) {
                settle = this.safeCurrencyCode (settleId);
            }
            let symbol = base + '/' + quote;
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
            const symbolType = this.safeString (market, 'type');
            let marginModes = undefined;
            let isMarginTradingAllowed = false;
            const isUtaMargin = (category === 'MARGIN');
            if (isUtaMargin || (category === 'SPOT')) {
                type = 'spot';
                spot = true;
                if (isUtaMargin) {
                    const isolatedBase = this.safeString (market, 'isIsolatedBaseBorrowable');
                    const isolatedQuote = this.safeString (market, 'isIsolatedQuotedBorrowable');
                    const isolated = (isolatedBase === 'YES') || (isolatedQuote === 'YES');
                    const maxCrossLeverage = this.safeString (market, 'maxCrossedLeverage');
                    const cross = (maxCrossLeverage !== '0');
                    marginModes = {
                        'cross': cross,
                        'isolated': isolated,
                    };
                    isMarginTradingAllowed = true;
                }
            } else {
                if (symbolType === 'perpetual') {
                    type = 'swap';
                    swap = true;
                    symbol = symbol + ':' + settle;
                } else if (symbolType === 'delivery') {
                    expiry = this.safeInteger (market, 'deliveryTime');
                    expiryDatetime = this.iso8601 (expiry);
                    const expiryParts = expiryDatetime.split ('-');
                    const yearPart = this.safeString (expiryParts, 0);
                    const dayPart = this.safeString (expiryParts, 2);
                    const year = yearPart.slice (2, 4);
                    const month = this.safeString (expiryParts, 1);
                    const day = dayPart.slice (0, 2);
                    const expiryString = year + month + day;
                    type = 'future';
                    future = true;
                    symbol = symbol + ':' + settle + '-' + expiryString;
                }
                contract = true;
                inverse = (base === settle);
                linear = !inverse;
                marginModes = {
                    'cross': true,
                    'isolated': true,
                };
            }
            pricePrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'pricePrecision')));
            amountPrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'quantityPrecision')));
            const status = this.safeString (market, 'status');
            let active = undefined;
            if (status !== undefined) {
                active = ((status === 'online') || (status === 'normal'));
            }
            const contractSize = contract ? 1 : undefined;
            result.push (this.safeMarketStructure ({
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
                'margin': spot && isMarginTradingAllowed,
                'marginModes': marginModes,
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
                        'min': this.safeNumber (market, 'minLeverage'),
                        'max': this.safeNumber (market, 'maxLeverage'),
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minOrderQty'),
                        'max': this.safeNumber (market, 'maxOrderQty'),
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
                'created': this.safeInteger (market, 'launchTime'),
                'info': market,
            }));
        }
        return result;
    }

    /**
     * @method
     * @name bitget#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://www.bitget.com/api-doc/spot/market/Get-Coin-List
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicSpotGetV2SpotPublicCoins (params);
        //
        //    {
        //        "code": "00000",
        //        "msg": "success",
        //        "requestTime": "1746195617812",
        //        "data": [
        //            {
        //                "coinId": "1456",
        //                "coin": "NEIROETH",
        //                "transfer": "false",
        //                "chains": [
        //                    {
        //                        "chain": "ERC20",
        //                        "needTag": "false",
        //                        "withdrawable": "true",
        //                        "rechargeable": "true",
        //                        "withdrawFee": "44.91017965",
        //                        "extraWithdrawFee": "0",
        //                        "depositConfirm": "12",
        //                        "withdrawConfirm": "64",
        //                        "minDepositAmount": "0.06",
        //                        "minWithdrawAmount": "60",
        //                        "browserUrl": "https://etherscan.io/tx/",
        //                        "contractAddress": "0xee2a03aa6dacf51c18679c516ad5283d8e7c2637",
        //                        "withdrawStep": "0",
        //                        "withdrawMinScale": "8",
        //                        "congestion": "normal"
        //                    }
        //                ],
        //                "areaCoin": "no"
        //            },
        //            ...
        //
        const result: Dict = {};
        const data = this.safeValue (response, 'data', []);
        const fiatCurrencies = this.safeList (this.options, 'fiatCurrencies', []);
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const id = this.safeString (entry, 'coin'); // we don't use 'coinId' as it has no use. it is 'coin' field that needs to be used in currency related endpoints (deposit, withdraw, etc..)
            const code = this.safeCurrencyCode (id);
            const chains = this.safeValue (entry, 'chains', []);
            const networks: Dict = {};
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'chain');
                let network = this.networkIdToCode (networkId, code);
                network = network.toUpperCase ();
                networks[network] = {
                    'info': chain,
                    'id': networkId,
                    'network': network,
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber (chain, 'minWithdrawAmount'),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.safeNumber (chain, 'minDepositAmount'),
                            'max': undefined,
                        },
                    },
                    'active': undefined,
                    'withdraw': this.safeString (chain, 'withdrawable') === 'true',
                    'deposit': this.safeString (chain, 'rechargeable') === 'true',
                    'fee': this.safeNumber (chain, 'withdrawFee'),
                    'precision': this.parseNumber (this.parsePrecision (this.safeString (chain, 'withdrawMinScale'))),
                };
            }
            const isFiat = this.inArray (code, fiatCurrencies);
            result[code] = this.safeCurrencyStructure ({
                'info': entry,
                'id': id,
                'code': code,
                'networks': networks,
                'type': isFiat ? 'fiat' : 'crypto',
                'name': undefined,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': undefined,
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
            });
        }
        return result;
    }

    /**
     * @method
     * @name bitget#fetchMarketLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
     * @see https://www.bitget.com/api-doc/contract/position/Get-Query-Position-Lever
     * @see https://www.bitget.com/api-doc/margin/cross/account/Cross-Tier-Data
     * @see https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Tier-Data
     * @see https://www.bitget.com/api-doc/uta/public/Get-Position-Tier-Data
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] for spot margin 'cross' or 'isolated', default is 'isolated'
     * @param {string} [params.code] required for cross spot margin
     * @param {string} [params.productType] *contract and uta only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
     */
    async fetchMarketLeverageTiers (symbol: string, params = {}): Promise<LeverageTier[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {};
        let response = undefined;
        let marginMode = undefined;
        let productType = undefined;
        let uta = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchMarketLeverageTiers', params, 'isolated');
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchMarketLeverageTiers', 'uta', false);
        if (uta) {
            if (productType === 'SPOT') {
                if (marginMode !== undefined) {
                    productType = 'MARGIN';
                }
            }
            request['symbol'] = market['id'];
            request['category'] = productType;
            response = await this.publicUtaGetV3MarketPositionTier (this.extend (request, params));
        } else if ((market['swap']) || (market['future'])) {
            request['productType'] = productType;
            request['symbol'] = market['id'];
            response = await this.publicMixGetV2MixMarketQueryPositionLever (this.extend (request, params));
        } else if (marginMode === 'isolated') {
            request['symbol'] = market['id'];
            response = await this.privateMarginGetV2MarginIsolatedTierData (this.extend (request, params));
        } else if (marginMode === 'cross') {
            const code = this.safeString (params, 'code');
            if (code === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchMarketLeverageTiers() requires a code argument');
            }
            params = this.omit (params, 'code');
            const currency = this.currency (code);
            request['coin'] = currency['id'];
            response = await this.privateMarginGetV2MarginCrossedTierData (this.extend (request, params));
        } else {
            throw new BadRequest (this.id + ' fetchMarketLeverageTiers() symbol does not support market ' + market['symbol']);
        }
        //
        // swap and future
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700290724614,
        //         "data": [
        //             {
        //                 "symbol": "BTCUSDT",
        //                 "level": "1",
        //                 "startUnit": "0",
        //                 "endUnit": "150000",
        //                 "leverage": "125",
        //                 "keepMarginRate": "0.004"
        //             },
        //         ]
        //     }
        //
        // isolated
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700291531894,
        //         "data": [
        //             {
        //                 "tier": "1",
        //                 "symbol": "BTCUSDT",
        //                 "leverage": "10",
        //                 "baseCoin": "BTC",
        //                 "quoteCoin": "USDT",
        //                 "baseMaxBorrowableAmount": "2",
        //                 "quoteMaxBorrowableAmount": "24000",
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
        //         "requestTime": 1700291818831,
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
        // uta
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1752735673127,
        //         "data": [
        //             {
        //                 "tier": "1",
        //                 "minTierValue": "0",
        //                 "maxTierValue": "150000",
        //                 "leverage": "125",
        //                 "mmr": "0.004"
        //             },
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'data', []);
        return this.parseMarketLeverageTiers (result, market);
    }

    parseMarketLeverageTiers (info, market: Market = undefined): LeverageTier[] {
        //
        // swap and future
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "level": "1",
        //         "startUnit": "0",
        //         "endUnit": "150000",
        //         "leverage": "125",
        //         "keepMarginRate": "0.004"
        //     }
        //
        // isolated
        //
        //     {
        //         "tier": "1",
        //         "symbol": "BTCUSDT",
        //         "leverage": "10",
        //         "baseCoin": "BTC",
        //         "quoteCoin": "USDT",
        //         "baseMaxBorrowableAmount": "2",
        //         "quoteMaxBorrowableAmount": "24000",
        //         "maintainMarginRate": "0.05",
        //         "initRate": "0.1111"
        //     }
        //
        // cross
        //
        //     {
        //         "tier": "1",
        //         "leverage": "3",
        //         "coin": "BTC",
        //         "maxBorrowableAmount": "26",
        //         "maintainMarginRate": "0.1"
        //     }
        //
        // uta
        //
        //     {
        //         "tier": "1",
        //         "minTierValue": "0",
        //         "maxTierValue": "150000",
        //         "leverage": "125",
        //         "mmr": "0.004"
        //     }
        //
        const tiers = [];
        let minNotional = 0;
        for (let i = 0; i < info.length; i++) {
            const item = info[i];
            const minimumNotional = this.safeNumber2 (item, 'startUnit', 'minTierValue');
            if (minimumNotional !== undefined) {
                minNotional = minimumNotional;
            }
            const maxNotional = this.safeNumberN (item, [ 'endUnit', 'maxBorrowableAmount', 'baseMaxBorrowableAmount', 'maxTierValue' ]);
            const marginCurrency = this.safeString2 (item, 'coin', 'baseCoin');
            const currencyId = (marginCurrency !== undefined) ? marginCurrency : market['base'];
            const marketId = this.safeString (item, 'symbol');
            tiers.push ({
                'tier': this.safeInteger2 (item, 'level', 'tier'),
                'symbol': this.safeSymbol (marketId, market),
                'currency': this.safeCurrencyCode (currencyId),
                'minNotional': minNotional,
                'maxNotional': maxNotional,
                'maintenanceMarginRate': this.safeNumberN (item, [ 'keepMarginRate', 'maintainMarginRate', 'mmr' ]),
                'maxLeverage': this.safeNumber (item, 'leverage'),
                'info': item,
            });
            minNotional = maxNotional;
        }
        return tiers as LeverageTier[];
    }

    /**
     * @method
     * @name bitget#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://www.bitget.com/api-doc/spot/account/Get-Deposit-Record
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in milliseconds
     * @param {string} [params.idLessThan] return records with id less than the provided value
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchDeposits', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchDeposits', undefined, since, limit, params, 'idLessThan', 'idLessThan', undefined, 100) as Transaction[];
        }
        if (since === undefined) {
            since = this.milliseconds () - 7776000000; // 90 days
        }
        let request: Dict = {
            'startTime': since,
            'endTime': this.milliseconds (),
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        const response = await this.privateSpotGetV2SpotWalletDepositRecords (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700528340608,
        //         "data": [
        //             {
        //                 "orderId": "1083832260799930368",
        //                 "tradeId": "35bf0e588a42b25c71a9d45abe7308cabdeec6b7b423910b9bd4743d3a9a9efa",
        //                 "coin": "BTC",
        //                 "type": "deposit",
        //                 "size": "0.00030000",
        //                 "status": "success",
        //                 "toAddress": "1BfZh7JESJGBUszCGeZnzxbVVvBycbJSbA",
        //                 "dest": "on_chain",
        //                 "chain": "BTC",
        //                 "fromAddress": null,
        //                 "cTime": "1694131668281",
        //                 "uTime": "1694131680247"
        //             }
        //         ]
        //     }
        //
        const rawTransactions = this.safeList (response, 'data', []);
        return this.parseTransactions (rawTransactions, undefined, since, limit);
    }

    /**
     * @method
     * @name bitget#withdraw
     * @description make a withdrawal
     * @see https://www.bitget.com/api-doc/spot/account/Wallet-Withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.chain] the blockchain network the withdrawal is taking place on
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag: Str = undefined, params = {}): Promise<Transaction> {
        this.checkAddress (address);
        let networkCode = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        if (networkCode === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires a "network" parameter');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const networkId = this.networkCodeToId (networkCode);
        const request: Dict = {
            'coin': currency['id'],
            'address': address,
            'chain': networkId,
            'size': this.currencyToPrecision (code, amount, networkCode),
            'transferType': 'on_chain',
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const response = await this.privateSpotPostV2SpotWalletWithdrawal (this.extend (request, params));
        //
        //     {
        //          "code":"00000",
        //          "msg":"success",
        //          "requestTime":1696784219602,
        //          "data": {
        //              "orderId":"1094957867615789056",
        //              "clientOid":"64f1e4ce842041d296b4517df1b5c2d7"
        //          }
        //      }
        //
        const data = this.safeValue (response, 'data', {});
        const result = this.parseTransaction (data, currency);
        result['type'] = 'withdrawal';
        const withdrawOptions = this.safeValue (this.options, 'withdraw', {});
        const fillResponseFromRequest = this.safeBool (withdrawOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            result['currency'] = code;
            result['amount'] = amount;
            result['tag'] = tag;
            result['address'] = address;
            result['addressTo'] = address;
            result['network'] = networkCode;
        }
        return result as Transaction;
    }

    /**
     * @method
     * @name bitget#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://www.bitget.com/api-doc/spot/account/Get-Withdraw-Record
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in milliseconds
     * @param {string} [params.idLessThan] return records with id less than the provided value
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchWithdrawals', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchWithdrawals', undefined, since, limit, params, 'idLessThan', 'idLessThan', undefined, 100) as Transaction[];
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        if (since === undefined) {
            since = this.milliseconds () - 7776000000; // 90 days
        }
        let request: Dict = {
            'startTime': since,
            'endTime': this.milliseconds (),
        };
        if (currency !== undefined) {
            request['coin'] = currency['id'];
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateSpotGetV2SpotWalletWithdrawalRecords (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700528340608,
        //         "data": [
        //             {
        //                 "orderId": "1083832260799930368",
        //                 "tradeId": "35bf0e588a42b25c71a9d45abe7308cabdeec6b7b423910b9bd4743d3a9a9efa",
        //                 "clientOid": "123",
        //                 "coin": "BTC",
        //                 "type": "withdraw",
        //                 "size": "0.00030000",
        //                 "fee": "-1.0000000",
        //                 "status": "success",
        //                 "toAddress": "1BfZh7JESJGBUszCGeZnzxbVVvBycbJSbA",
        //                 "dest": "on_chain",
        //                 "chain": "BTC",
        //                 "confirm": "100",
        //                 "fromAddress": null,
        //                 "cTime": "1694131668281",
        //                 "uTime": "1694131680247"
        //             }
        //         ]
        //     }
        //
        const rawTransactions = this.safeList (response, 'data', []);
        return this.parseTransactions (rawTransactions, currency, since, limit);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // fetchDeposits
        //
        //     {
        //         "orderId": "1083832260799930368",
        //         "tradeId": "35bf0e588a42b25c71a9d45abe7308cabdeec6b7b423910b9bd4743d3a9a9efa",
        //         "coin": "BTC",
        //         "type": "deposit",
        //         "size": "0.00030000",
        //         "status": "success",
        //         "toAddress": "1BfZh7JESJGBUszCGeZnzxbVVvBycbJSbA",
        //         "dest": "on_chain",
        //         "chain": "BTC",
        //         "fromAddress": null,
        //         "cTime": "1694131668281",
        //         "uTime": "1694131680247"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "orderId": "1083832260799930368",
        //         "tradeId": "35bf0e588a42b25c71a9d45abe7308cabdeec6b7b423910b9bd4743d3a9a9efa",
        //         "clientOid": "123",
        //         "coin": "BTC",
        //         "type": "withdraw",
        //         "size": "0.00030000",
        //         "fee": "-1.0000000",
        //         "status": "success",
        //         "toAddress": "1BfZh7JESJGBUszCGeZnzxbVVvBycbJSbA",
        //         "dest": "on_chain",
        //         "chain": "BTC",
        //         "confirm": "100",
        //         "fromAddress": null,
        //         "cTime": "1694131668281",
        //         "uTime": "1694131680247"
        //     }
        //
        const currencyId = this.safeString (transaction, 'coin');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger (transaction, 'cTime');
        const networkId = this.safeString (transaction, 'chain');
        const status = this.safeString (transaction, 'status');
        const tag = this.safeString (transaction, 'tag');
        const feeCostString = this.safeString (transaction, 'fee');
        let feeCostAbsString = undefined;
        if (feeCostString !== undefined) {
            feeCostAbsString = Precise.stringAbs (feeCostString);
        }
        let fee = undefined;
        let amountString = this.safeString (transaction, 'size');
        if (feeCostAbsString !== undefined) {
            fee = { 'currency': code, 'cost': this.parseNumber (feeCostAbsString) };
            amountString = Precise.stringSub (amountString, feeCostAbsString);
        }
        return {
            'id': this.safeString (transaction, 'orderId'),
            'info': transaction,
            'txid': this.safeString (transaction, 'tradeId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': this.networkIdToCode (networkId),
            'addressFrom': this.safeString (transaction, 'fromAddress'),
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

    parseTransactionStatus (status: Str) {
        const statuses: Dict = {
            'success': 'ok',
            'Pending': 'pending',
            'pending_review': 'pending',
            'pending_review_fail': 'failed',
            'reject': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name bitget#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.bitget.com/api-doc/spot/account/Get-Deposit-Address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        await this.loadMarkets ();
        let networkCode = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        const currency = this.currency (code);
        const request: Dict = {
            'coin': currency['id'],
        };
        if (networkCode !== undefined) {
            request['chain'] = this.networkCodeToId (networkCode, code);
        }
        const response = await this.privateSpotGetV2SpotWalletDepositAddress (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700532244807,
        //         "data": {
        //             "coin": "BTC",
        //             "address": "1BfZh7JESJGBUszCGeZnzxbVVvBycbJSbA",
        //             "chain": "",
        //             "tag": null,
        //             "url": "https://blockchair.com/bitcoin/transaction/"
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseDepositAddress (data, currency);
    }

    parseDepositAddress (depositAddress, currency: Currency = undefined): DepositAddress {
        //
        //     {
        //         "coin": "BTC",
        //         "address": "1BfZh7JESJGBUszCGeZnzxbVVvBycbJSbA",
        //         "chain": "",
        //         "tag": null,
        //         "url": "https://blockchair.com/bitcoin/transaction/"
        //     }
        //
        const currencyId = this.safeString (depositAddress, 'coin');
        const networkId = this.safeString (depositAddress, 'chain');
        const parsedCurrency = this.safeCurrencyCode (currencyId, currency);
        let network = undefined;
        if (networkId !== undefined) {
            network = this.networkIdToCode (networkId, parsedCurrency);
        }
        return {
            'info': depositAddress,
            'currency': parsedCurrency,
            'network': network,
            'address': this.safeString (depositAddress, 'address'),
            'tag': this.safeString (depositAddress, 'tag'),
        } as DepositAddress;
    }

    /**
     * @method
     * @name bitget#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.bitget.com/api-doc/spot/market/Get-Orderbook
     * @see https://www.bitget.com/api-doc/contract/market/Get-Merge-Depth
     * @see https://www.bitget.com/api-doc/uta/public/OrderBook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        let response = undefined;
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchOrderBook', 'uta', false);
        if (uta) {
            request['category'] = productType;
            response = await this.publicUtaGetV3MarketOrderbook (this.extend (request, params));
        } else if (market['spot']) {
            response = await this.publicSpotGetV2SpotMarketOrderbook (this.extend (request, params));
        } else {
            request['productType'] = productType;
            response = await this.publicMixGetV2MixMarketMergeDepth (this.extend (request, params));
        }
        //
        //     {
        //       "code": "00000",
        //       "msg": "success",
        //       "requestTime": 1645854610294,
        //       "data": {
        //         "asks": [ [ "39102", "11.026" ] ],
        //         "bids": [ [ '39100.5', "1.773" ] ],
        //         "ts": "1645854610294"
        //       }
        //     }
        //
        // uta
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1750329437753,
        //         "data": {
        //             "a": [ [ 104992.60, 0.018411 ] ],
        //             "b":[ [104927.40, 0.229914 ] ],
        //             "ts": "1750329437763"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const bidsKey = uta ? 'b' : 'bids';
        const asksKey = uta ? 'a' : 'asks';
        const timestamp = this.safeInteger (data, 'ts');
        return this.parseOrderBook (data, market['symbol'], timestamp, bidsKey, asksKey);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //   {
        //       "symbol": "BTCUSDT",
        //       "price": "26242",
        //       "indexPrice": "34867",
        //       "markPrice": "25555",
        //       "ts": "1695793390482"
        //   }
        //
        // spot
        //
        //     {
        //         "open": "37202.46",
        //         "symbol": "BTCUSDT",
        //         "high24h": "37744.75",
        //         "low24h": "36666",
        //         "lastPr": "37583.69",
        //         "quoteVolume": "519127705.303",
        //         "baseVolume": "13907.0386",
        //         "usdtVolume": "519127705.302908",
        //         "ts": "1700532903261",
        //         "bidPr": "37583.68",
        //         "askPr": "37583.69",
        //         "bidSz": "0.0007",
        //         "askSz": "0.0829",
        //         "openUtc": "37449.4",
        //         "changeUtc24h": "0.00359",
        //         "change24h": "0.00321"
        //     }
        //
        // swap and future
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "lastPr": "104823.8",
        //         "askPr": "104823.8",
        //         "bidPr": "104823.5",
        //         "bidSz": "0.703",
        //         "askSz": "13.894",
        //         "high24h": "105289.3",
        //         "low24h": "103447.9",
        //         "ts": "1750332210370",
        //         "change24h": "0.00471",
        //         "baseVolume": "79089.5675",
        //         "quoteVolume": "8274870921.80485",
        //         "usdtVolume": "8274870921.80485",
        //         "openUtc": "104833",
        //         "changeUtc24h": "-0.00009",
        //         "indexPrice": "104881.953125",
        //         "fundingRate": "-0.000014",
        //         "holdingAmount": "7452.6421",
        //         "deliveryStartTime": null,
        //         "deliveryTime": null,
        //         "deliveryStatus": "",
        //         "open24h": "104332.3",
        //         "markPrice": "104824.2"
        //     }
        //
        // spot uta
        //
        //     {
        //         "category": "SPOT",
        //         "symbol": "BTCUSDT",
        //         "ts": "1750330651972",
        //         "lastPrice": "104900.2",
        //         "openPrice24h": "104321.2",
        //         "highPrice24h": "107956.8",
        //         "lowPrice24h": "103600.1",
        //         "ask1Price": "104945.8",
        //         "bid1Price": "104880.6",
        //         "bid1Size": "0.266534",
        //         "ask1Size": "0.014001",
        //         "price24hPcnt": "0.00555",
        //         "volume24h": "355.941109",
        //         "turnover24h": "37302936.008134"
        //     }
        //
        // swap and future uta
        //
        //     {
        //         "category": "USDT-FUTURES",
        //         "symbol": "BTCUSDT",
        //         "ts": "1750332730472",
        //         "lastPrice": "104738",
        //         "openPrice24h": "104374",
        //         "highPrice24h": "105289.3",
        //         "lowPrice24h": "103447.9",
        //         "ask1Price": "104738",
        //         "bid1Price": "104737.7",
        //         "bid1Size": "2.036",
        //         "ask1Size": "8.094",
        //         "price24hPcnt": "0.00349",
        //         "volume24h": "79101.6477",
        //         "turnover24h": "8276293391.45973",
        //         "indexPrice": "104785.956168",
        //         "markPrice": "104738",
        //         "fundingRate": "-0.000007",
        //         "openInterest": "7465.5938",
        //         "deliveryStartTime": "",
        //         "deliveryTime": "",
        //         "deliveryStatus": ""
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        const close = this.safeString2 (ticker, 'lastPr', 'lastPrice');
        const timestamp = this.safeIntegerOmitZero (ticker, 'ts'); // exchange bitget provided 0
        const change = this.safeString (ticker, 'change24h');
        const category = this.safeString (ticker, 'category');
        const markPrice = this.safeString (ticker, 'markPrice');
        let marketType: string;
        if ((markPrice !== undefined) && (category !== 'SPOT')) {
            marketType = 'contract';
        } else {
            marketType = 'spot';
        }
        let percentage = this.safeString (ticker, 'price24hPcnt');
        if (percentage === undefined) {
            percentage = Precise.stringMul (change, '100');
        }
        return this.safeTicker ({
            'symbol': this.safeSymbol (marketId, market, undefined, marketType),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString2 (ticker, 'high24h', 'highPrice24h'),
            'low': this.safeString2 (ticker, 'low24h', 'lowPrice24h'),
            'bid': this.safeString2 (ticker, 'bidPr', 'bid1Price'),
            'bidVolume': this.safeString2 (ticker, 'bidSz', 'bid1Size'),
            'ask': this.safeString2 (ticker, 'askPr', 'ask1Price'),
            'askVolume': this.safeString2 (ticker, 'askSz', 'ask1Size'),
            'vwap': undefined,
            'open': this.safeStringN (ticker, [ 'open', 'open24h', 'openPrice24h' ]),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeString2 (ticker, 'baseVolume', 'volume24h'),
            'quoteVolume': this.safeString2 (ticker, 'quoteVolume', 'turnover24h'),
            'indexPrice': this.safeString (ticker, 'indexPrice'),
            'markPrice': markPrice,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name bitget#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.bitget.com/api-doc/spot/market/Get-Tickers
     * @see https://www.bitget.com/api-doc/contract/market/Get-Ticker
     * @see https://www.bitget.com/api-doc/uta/public/Tickers
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        let response = undefined;
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchTicker', 'uta', false);
        if (uta) {
            request['category'] = productType;
            response = await this.publicUtaGetV3MarketTickers (this.extend (request, params));
        } else if (market['spot']) {
            response = await this.publicSpotGetV2SpotMarketTickers (this.extend (request, params));
        } else {
            request['productType'] = productType;
            response = await this.publicMixGetV2MixMarketTicker (this.extend (request, params));
        }
        //
        // spot
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700532903782,
        //         "data": [
        //             {
        //                 "open": "37202.46",
        //                 "symbol": "BTCUSDT",
        //                 "high24h": "37744.75",
        //                 "low24h": "36666",
        //                 "lastPr": "37583.69",
        //                 "quoteVolume": "519127705.303",
        //                 "baseVolume": "13907.0386",
        //                 "usdtVolume": "519127705.302908",
        //                 "ts": "1700532903261",
        //                 "bidPr": "37583.68",
        //                 "askPr": "37583.69",
        //                 "bidSz": "0.0007",
        //                 "askSz": "0.0829",
        //                 "openUtc": "37449.4",
        //                 "changeUtc24h": "0.00359",
        //                 "change24h": "0.00321"
        //             }
        //         ]
        //     }
        //
        // swap and future
        //
        //      {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1750332210369,
        //         "data": [
        //             {
        //                 "symbol": "BTCUSDT",
        //                 "lastPr": "104823.8",
        //                 "askPr": "104823.8",
        //                 "bidPr": "104823.5",
        //                 "bidSz": "0.703",
        //                 "askSz": "13.894",
        //                 "high24h": "105289.3",
        //                 "low24h": "103447.9",
        //                 "ts": "1750332210370",
        //                 "change24h": "0.00471",
        //                 "baseVolume": "79089.5675",
        //                 "quoteVolume": "8274870921.80485",
        //                 "usdtVolume": "8274870921.80485",
        //                 "openUtc": "104833",
        //                 "changeUtc24h": "-0.00009",
        //                 "indexPrice": "104881.953125",
        //                 "fundingRate": "-0.000014",
        //                 "holdingAmount": "7452.6421",
        //                 "deliveryStartTime": null,
        //                 "deliveryTime": null,
        //                 "deliveryStatus": "",
        //                 "open24h": "104332.3",
        //                 "markPrice": "104824.2"
        //             }
        //         ]
        //     }
        //
        // spot uta
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1750330653575,
        //         "data": [
        //             {
        //                 "category": "SPOT",
        //                 "symbol": "BTCUSDT",
        //                 "ts": "1750330651972",
        //                 "lastPrice": "104900.2",
        //                 "openPrice24h": "104321.2",
        //                 "highPrice24h": "107956.8",
        //                 "lowPrice24h": "103600.1",
        //                 "ask1Price": "104945.8",
        //                 "bid1Price": "104880.6",
        //                 "bid1Size": "0.266534",
        //                 "ask1Size": "0.014001",
        //                 "price24hPcnt": "0.00555",
        //                 "volume24h": "355.941109",
        //                 "turnover24h": "37302936.008134"
        //             }
        //         ]
        //     }
        //
        // swap and future uta
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1750332731203,
        //         "data": [
        //             {
        //                 "category": "USDT-FUTURES",
        //                 "symbol": "BTCUSDT",
        //                 "ts": "1750332730472",
        //                 "lastPrice": "104738",
        //                 "openPrice24h": "104374",
        //                 "highPrice24h": "105289.3",
        //                 "lowPrice24h": "103447.9",
        //                 "ask1Price": "104738",
        //                 "bid1Price": "104737.7",
        //                 "bid1Size": "2.036",
        //                 "ask1Size": "8.094",
        //                 "price24hPcnt": "0.00349",
        //                 "volume24h": "79101.6477",
        //                 "turnover24h": "8276293391.45973",
        //                 "indexPrice": "104785.956168",
        //                 "markPrice": "104738",
        //                 "fundingRate": "-0.000007",
        //                 "openInterest": "7465.5938",
        //                 "deliveryStartTime": "",
        //                 "deliveryTime": "",
        //                 "deliveryStatus": ""
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTicker (data[0], market);
    }

    /**
     * @method
     * @name bitget#fetchMarkPrice
     * @description fetches the mark price for a specific market
     * @see https://www.bitget.com/api-doc/contract/market/Get-Symbol-Price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchMarkPrice (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['spot']) {
            throw new NotSupported (this.id + ' fetchMarkPrice() is not supported for spot markets');
        } else {
            let productType = undefined;
            [ productType, params ] = this.handleProductTypeAndParams (market, params);
            request['productType'] = productType;
            response = await this.publicMixGetV2MixMarketSymbolPrice (this.extend (request, params));
        }
        const data = this.safeList (response, 'data', []);
        return this.parseTicker (data[0], market);
    }

    /**
     * @method
     * @name bitget#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://www.bitget.com/api-doc/spot/market/Get-Tickers
     * @see https://www.bitget.com/api-doc/contract/market/Get-All-Symbol-Ticker
     * @see https://www.bitget.com/api-doc/uta/public/Tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @param {string} [params.subType] *contract only* 'linear', 'inverse'
     * @param {string} [params.productType] *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbols !== undefined) {
            const symbol = this.safeValue (symbols, 0);
            market = this.market (symbol);
        }
        let response = undefined;
        const request: Dict = {};
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        // Calls like `.fetchTickers (undefined, {subType:'inverse'})` should be supported for this exchange, so
        // as "options.defaultSubType" is also set in exchange options, we should consider `params.subType`
        // with higher priority and only default to spot, if `subType` is not set in params
        const passedSubType = this.safeString (params, 'subType');
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        // only if passedSubType && productType is undefined, then use spot
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchTickers', 'uta', false);
        if (uta) {
            const symbolsLength = symbols.length;
            if ((symbols !== undefined) && (symbolsLength === 1)) {
                request['symbol'] = market['id'];
            }
            request['category'] = productType;
            response = await this.publicUtaGetV3MarketTickers (this.extend (request, params));
        } else if (type === 'spot' && passedSubType === undefined) {
            response = await this.publicSpotGetV2SpotMarketTickers (this.extend (request, params));
        } else {
            request['productType'] = productType;
            response = await this.publicMixGetV2MixMarketTickers (this.extend (request, params));
        }
        //
        // spot
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700532903782,
        //         "data": [
        //             {
        //                 "open": "37202.46",
        //                 "symbol": "BTCUSDT",
        //                 "high24h": "37744.75",
        //                 "low24h": "36666",
        //                 "lastPr": "37583.69",
        //                 "quoteVolume": "519127705.303",
        //                 "baseVolume": "13907.0386",
        //                 "usdtVolume": "519127705.302908",
        //                 "ts": "1700532903261",
        //                 "bidPr": "37583.68",
        //                 "askPr": "37583.69",
        //                 "bidSz": "0.0007",
        //                 "askSz": "0.0829",
        //                 "openUtc": "37449.4",
        //                 "changeUtc24h": "0.00359",
        //                 "change24h": "0.00321"
        //             }
        //         ]
        //     }
        //
        // swap and future
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700533773477,
        //         "data": [
        //             {
        //                 "open": "14.9776",
        //                 "symbol": "LINKUSDT",
        //                 "high24h": "15.3942",
        //                 "low24h": "14.3457",
        //                 "lastPr": "14.3748",
        //                 "quoteVolume": "7008612.4299",
        //                 "baseVolume": "469908.8523",
        //                 "usdtVolume": "7008612.42986561",
        //                 "ts": "1700533772309",
        //                 "bidPr": "14.375",
        //                 "askPr": "14.3769",
        //                 "bidSz": "50.004",
        //                 "askSz": "0.7647",
        //                 "openUtc": "14.478",
        //                 "changeUtc24h": "-0.00713",
        //                 "change24h": "-0.04978"
        //             },
        //         ]
        //     }
        //
        // spot uta
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1750330653575,
        //         "data": [
        //             {
        //                 "category": "SPOT",
        //                 "symbol": "BTCUSDT",
        //                 "ts": "1750330651972",
        //                 "lastPrice": "104900.2",
        //                 "openPrice24h": "104321.2",
        //                 "highPrice24h": "107956.8",
        //                 "lowPrice24h": "103600.1",
        //                 "ask1Price": "104945.8",
        //                 "bid1Price": "104880.6",
        //                 "bid1Size": "0.266534",
        //                 "ask1Size": "0.014001",
        //                 "price24hPcnt": "0.00555",
        //                 "volume24h": "355.941109",
        //                 "turnover24h": "37302936.008134"
        //             }
        //         ]
        //     }
        //
        // swap and future uta
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1750332731203,
        //         "data": [
        //             {
        //                 "category": "USDT-FUTURES",
        //                 "symbol": "BTCUSDT",
        //                 "ts": "1750332730472",
        //                 "lastPrice": "104738",
        //                 "openPrice24h": "104374",
        //                 "highPrice24h": "105289.3",
        //                 "lowPrice24h": "103447.9",
        //                 "ask1Price": "104738",
        //                 "bid1Price": "104737.7",
        //                 "bid1Size": "2.036",
        //                 "ask1Size": "8.094",
        //                 "price24hPcnt": "0.00349",
        //                 "volume24h": "79101.6477",
        //                 "turnover24h": "8276293391.45973",
        //                 "indexPrice": "104785.956168",
        //                 "markPrice": "104738",
        //                 "fundingRate": "-0.000007",
        //                 "openInterest": "7465.5938",
        //                 "deliveryStartTime": "",
        //                 "deliveryTime": "",
        //                 "deliveryStatus": ""
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTickers (data, symbols);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // spot, swap and future: fetchTrades
        //
        //     {
        //         "tradeId": "1075199767891652609",
        //         "price": "29376.5",
        //         "size": "6.035",
        //         "side": "Buy",
        //         "ts": "1692073521000",
        //         "symbol": "BTCUSDT"
        //     }
        //
        // spot: fetchMyTrades
        //
        //     {
        //         "userId": "7264631750",
        //         "symbol": "BTCUSDT",
        //         "orderId": "1098394344925597696",
        //         "tradeId": "1098394344974925824",
        //         "orderType": "market",
        //         "side": "sell",
        //         "priceAvg": "28467.68",
        //         "size": "0.0002",
        //         "amount": "5.693536",
        //         "feeDetail": {
        //             "deduction": "no",
        //             "feeCoin": "USDT",
        //             "totalDeductionFee": "",
        //             "totalFee": "-0.005693536"
        //         },
        //         "tradeScope": "taker",
        //         "cTime": "1697603539699",
        //         "uTime": "1697603539754"
        //     }
        //
        // spot margin: fetchMyTrades
        //
        //     {
        //         "orderId": "1099353730455318528",
        //         "tradeId": "1099353730627092481",
        //         "orderType": "market",
        //         "side": "sell",
        //         "priceAvg": "29543.7",
        //         "size": "0.0001",
        //         "amount": "2.95437",
        //         "tradeScope": "taker",
        //         "feeDetail": {
        //             "deduction": "no",
        //             "feeCoin": "USDT",
        //             "totalDeductionFee": "0",
        //             "totalFee": "-0.00295437"
        //         },
        //         "cTime": "1697832275063",
        //         "uTime": "1697832275150"
        //     }
        //
        // swap and future: fetchMyTrades
        //
        //     {
        //         "tradeId": "1111468664328269825",
        //         "symbol": "BTCUSDT",
        //         "orderId": "1111468664264753162",
        //         "price": "37271.4",
        //         "baseVolume": "0.001",
        //         "feeDetail": [
        //             {
        //                 "deduction": "no",
        //                 "feeCoin": "USDT",
        //                 "totalDeductionFee": null,
        //                 "totalFee": "-0.02236284"
        //             }
        //         ],
        //         "side": "buy",
        //         "quoteVolume": "37.2714",
        //         "profit": "-0.0007",
        //         "enterPointSource": "web",
        //         "tradeSide": "close",
        //         "posMode": "hedge_mode",
        //         "tradeScope": "taker",
        //         "cTime": "1700720700342"
        //     }
        //
        // uta fetchTrades
        //
        //     {
        //         "execId": "1319896716324937729",
        //         "price": "105909.1",
        //         "size": "6.3090",
        //         "side": "sell",
        //         "ts": "1750413820344"
        //     }
        //
        // uta fetchMyTrades
        //
        //     {
        //         "execId": "1322441401010528257",
        //         "orderId": "1322441400976261120",
        //         "category": "USDT-FUTURES",
        //         "symbol": "BTCUSDT",
        //         "orderType": "market",
        //         "side": "sell",
        //         "execPrice": "107005.4",
        //         "execQty": "0.0001",
        //         "execValue": "10.7005",
        //         "tradeScope": "taker",
        //         "feeDetail": [{
        //             "feeCoin": "USDT",
        //             "fee":"0.00642032"
        //         }],
        //         "createdTime": "1751020520451",
        //         "updatedTime": "1751020520458",
        //         "execPnl": "0.00017"
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeIntegerN (trade, [ 'cTime', 'ts', 'createdTime' ]);
        let fee = undefined;
        const feeDetail = this.safeValue (trade, 'feeDetail');
        const posMode = this.safeString (trade, 'posMode');
        const category = this.safeString (trade, 'category');
        const isFeeStructure = (posMode !== undefined) || (category !== undefined);
        const feeStructure = isFeeStructure ? feeDetail[0] : feeDetail;
        if (feeStructure !== undefined) {
            const currencyCode = this.safeCurrencyCode (this.safeString (feeStructure, 'feeCoin'));
            fee = {
                'currency': currencyCode,
            };
            const feeCostString = this.safeString2 (feeStructure, 'totalFee', 'fee');
            const deduction = this.safeString (feeStructure, 'deduction') === 'yes' ? true : false;
            if (deduction) {
                fee['cost'] = feeCostString;
            } else {
                fee['cost'] = Precise.stringNeg (feeCostString);
            }
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString2 (trade, 'tradeId', 'execId'),
            'order': this.safeString (trade, 'orderId'),
            'symbol': symbol,
            'side': this.safeStringLower (trade, 'side'),
            'type': this.safeString (trade, 'orderType'),
            'takerOrMaker': this.safeString (trade, 'tradeScope'),
            'price': this.safeStringN (trade, [ 'priceAvg', 'price', 'execPrice' ]),
            'amount': this.safeStringN (trade, [ 'baseVolume', 'size', 'execQty' ]),
            'cost': this.safeStringN (trade, [ 'quoteVolume', 'amount', 'execValue' ]),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name bitget#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.bitget.com/api-doc/spot/market/Get-Recent-Trades
     * @see https://www.bitget.com/api-doc/spot/market/Get-Market-Trades
     * @see https://www.bitget.com/api-doc/contract/market/Get-Recent-Fills
     * @see https://www.bitget.com/api-doc/contract/market/Get-Fills-History
     * @see https://www.bitget.com/api-doc/uta/public/Fills
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @param {int} [params.until] *only applies to publicSpotGetV2SpotMarketFillsHistory and publicMixGetV2MixMarketFillsHistory* the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] *only applies to publicSpotGetV2SpotMarketFillsHistory and publicMixGetV2MixMarketFillsHistory* default false, when true will automatically paginate by calling this endpoint multiple times
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchTrades', symbol, since, limit, params, 'idLessThan', 'idLessThan') as Trade[];
        }
        const market = this.market (symbol);
        let request: Dict = {
            'symbol': market['id'],
        };
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchTrades', 'uta', false);
        if (limit !== undefined) {
            if (uta) {
                request['limit'] = Math.min (limit, 100);
            } else if (market['contract']) {
                request['limit'] = Math.min (limit, 1000);
            } else {
                request['limit'] = limit;
            }
        }
        const options = this.safeValue (this.options, 'fetchTrades', {});
        let response = undefined;
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        if (uta) {
            if (productType === 'SPOT') {
                let marginMode = undefined;
                [ marginMode, params ] = this.handleMarginModeAndParams ('fetchTrades', params);
                if (marginMode !== undefined) {
                    productType = 'MARGIN';
                }
            }
            request['category'] = productType;
            response = await this.publicUtaGetV3MarketFills (this.extend (request, params));
        } else if (market['spot']) {
            const spotOptions = this.safeValue (options, 'spot', {});
            const defaultSpotMethod = this.safeString (spotOptions, 'method', 'publicSpotGetV2SpotMarketFillsHistory');
            const spotMethod = this.safeString (params, 'method', defaultSpotMethod);
            params = this.omit (params, 'method');
            if (spotMethod === 'publicSpotGetV2SpotMarketFillsHistory') {
                [ request, params ] = this.handleUntilOption ('endTime', request, params);
                if (since !== undefined) {
                    request['startTime'] = since;
                }
                response = await this.publicSpotGetV2SpotMarketFillsHistory (this.extend (request, params));
            } else if (spotMethod === 'publicSpotGetV2SpotMarketFills') {
                response = await this.publicSpotGetV2SpotMarketFills (this.extend (request, params));
            }
        } else {
            const swapOptions = this.safeValue (options, 'swap', {});
            const defaultSwapMethod = this.safeString (swapOptions, 'method', 'publicMixGetV2MixMarketFillsHistory');
            const swapMethod = this.safeString (params, 'method', defaultSwapMethod);
            params = this.omit (params, 'method');
            request['productType'] = productType;
            if (swapMethod === 'publicMixGetV2MixMarketFillsHistory') {
                [ request, params ] = this.handleUntilOption ('endTime', request, params);
                if (since !== undefined) {
                    request['startTime'] = since;
                }
                response = await this.publicMixGetV2MixMarketFillsHistory (this.extend (request, params));
            } else if (swapMethod === 'publicMixGetV2MixMarketFills') {
                response = await this.publicMixGetV2MixMarketFills (this.extend (request, params));
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
        //                 "price": "29381.54",
        //                 "size": "0.0056",
        //                 "ts": "1692073691000"
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
        //                 "ts": "1692073521000",
        //                 "symbol": "BTCUSDT_UMCBL"
        //             },
        //         ]
        //     }
        //
        // uta
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1750413823980,
        //         "data": [
        //             {
        //                 "execId": "1319896716324937729",
        //                 "price": "105909.1",
        //                 "size": "6.3090",
        //                 "side": "sell",
        //                 "ts": "1750413820344"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @name bitget#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://www.bitget.com/api-doc/common/public/Get-Trade-Rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'isolated' or 'cross', for finding the fee rate of spot margin trading pairs
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchTradingFee', params);
        if (market['spot']) {
            if (marginMode !== undefined) {
                request['businessType'] = 'margin';
            } else {
                request['businessType'] = 'spot';
            }
        } else {
            request['businessType'] = 'mix';
        }
        const response = await this.privateCommonGetV2CommonTradeRate (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700549524887,
        //         "data": {
        //             "makerFeeRate": "0.001",
        //             "takerFeeRate": "0.001"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTradingFee (data, market);
    }

    /**
     * @method
     * @name bitget#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://www.bitget.com/api-doc/spot/market/Get-Symbols
     * @see https://www.bitget.com/api-doc/contract/market/Get-All-Symbols-Contracts
     * @see https://www.bitget.com/api-doc/margin/common/support-currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.productType] *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @param {boolean} [params.margin] set to true for spot margin
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees (params = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        let response = undefined;
        let marginMode = undefined;
        let marketType = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchTradingFees', params);
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchTradingFees', undefined, params);
        if (marketType === 'spot') {
            const margin = this.safeBool (params, 'margin', false);
            params = this.omit (params, 'margin');
            if ((marginMode !== undefined) || margin) {
                response = await this.publicMarginGetV2MarginCurrencies (params);
            } else {
                response = await this.publicSpotGetV2SpotPublicSymbols (params);
            }
        } else if ((marketType === 'swap') || (marketType === 'future')) {
            let productType = undefined;
            [ productType, params ] = this.handleProductTypeAndParams (undefined, params);
            params['productType'] = productType;
            response = await this.publicMixGetV2MixMarketContracts (params);
        } else {
            throw new NotSupported (this.id + ' does not support ' + marketType + ' market');
        }
        //
        // spot and margin
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700102364653,
        //         "data": [
        //             {
        //                 "symbol": "TRXUSDT",
        //                 "baseCoin": "TRX",
        //                 "quoteCoin": "USDT",
        //                 "minTradeAmount": "0",
        //                 "maxTradeAmount": "10000000000",
        //                 "takerFeeRate": "0.002",
        //                 "makerFeeRate": "0.002",
        //                 "pricePrecision": "6",
        //                 "quantityPrecision": "4",
        //                 "quotePrecision": "6",
        //                 "status": "online",
        //                 "minTradeUSDT": "5",
        //                 "buyLimitPriceRatio": "0.05",
        //                 "sellLimitPriceRatio": "0.05"
        //             },
        //         ]
        //     }
        //
        // swap and future
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700102364709,
        //         "data": [
        //             {
        //                 "symbol": "BTCUSDT",
        //                 "baseCoin": "BTC",
        //                 "quoteCoin": "USDT",
        //                 "buyLimitPriceRatio": "0.01",
        //                 "sellLimitPriceRatio": "0.01",
        //                 "feeRateUpRatio": "0.005",
        //                 "makerFeeRate": "0.0002",
        //                 "takerFeeRate": "0.0006",
        //                 "openCostUpRatio": "0.01",
        //                 "supportMarginCoins": ["USDT"],
        //                 "minTradeNum": "0.001",
        //                 "priceEndStep": "1",
        //                 "volumePlace": "3",
        //                 "pricePlace": "1",
        //                 "sizeMultiplier": "0.001",
        //                 "symbolType": "perpetual",
        //                 "minTradeUSDT": "5",
        //                 "maxSymbolOrderNum": "200",
        //                 "maxProductOrderNum": "400",
        //                 "maxPositionNum": "150",
        //                 "symbolStatus": "normal",
        //                 "offTime": "-1",
        //                 "limitOpenTime": "-1",
        //                 "deliveryTime": "",
        //                 "deliveryStartTime": "",
        //                 "deliveryPeriod": "",
        //                 "launchTime": "",
        //                 "fundInterval": "8",
        //                 "minLever": "1",
        //                 "maxLever": "125",
        //                 "posLimit": "0.05",
        //                 "maintainTime": ""
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result: Dict = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString (entry, 'symbol');
            const symbol = this.safeSymbol (marketId, undefined, undefined, marketType);
            const market = this.market (symbol);
            const fee = this.parseTradingFee (entry, market);
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
            'percentage': undefined,
            'tierBased': undefined,
        };
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
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
        const inverse = this.safeBool (market, 'inverse');
        const volumeIndex = inverse ? 6 : 5;
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, volumeIndex),
        ];
    }

    /**
     * @method
     * @name bitget#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.bitget.com/api-doc/spot/market/Get-Candle-Data
     * @see https://www.bitget.com/api-doc/spot/market/Get-History-Candle-Data
     * @see https://www.bitget.com/api-doc/contract/market/Get-Candle-Data
     * @see https://www.bitget.com/api-doc/contract/market/Get-History-Candle-Data
     * @see https://www.bitget.com/api-doc/contract/market/Get-History-Index-Candle-Data
     * @see https://www.bitget.com/api-doc/contract/market/Get-History-Mark-Candle-Data
     * @see https://www.bitget.com/api-doc/uta/public/Get-Candle-Data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.useHistoryEndpoint] whether to force to use historical endpoint (it has max limit of 200)
     * @param {boolean} [params.useHistoryEndpointForPagination] whether to force to use historical endpoint for pagination (default true)
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.price] *swap only* "mark" (to fetch mark price candles) or "index" (to fetch index price candles)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const defaultLimit = 100; // default 100, max 1000
        const maxLimitForRecentEndpoint = 1000;
        const maxLimitForHistoryEndpoint = 200; // note, max 1000 bars are supported for "recent-candles" endpoint, but "historical-candles" support only max 200
        const useHistoryEndpoint = this.safeBool (params, 'useHistoryEndpoint', false);
        const useHistoryEndpointForPagination = this.safeBool (params, 'useHistoryEndpointForPagination', true);
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            const limitForPagination = useHistoryEndpointForPagination ? maxLimitForHistoryEndpoint : maxLimitForRecentEndpoint;
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, limitForPagination);
        }
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let marketType = undefined;
        let timeframes = undefined;
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'uta', false);
        if (uta) {
            timeframes = this.options['timeframes']['uta'];
            request['interval'] = this.safeString (timeframes, timeframe, timeframe);
        } else {
            marketType = market['spot'] ? 'spot' : 'swap';
            timeframes = this.options['timeframes'][marketType];
            request['granularity'] = this.safeString (timeframes, timeframe, timeframe);
        }
        const msInDay = 86400000;
        const now = this.milliseconds ();
        const duration = this.parseTimeframe (timeframe) * 1000;
        const until = this.safeInteger (params, 'until');
        const limitDefined = limit !== undefined;
        const sinceDefined = since !== undefined;
        const untilDefined = until !== undefined;
        params = this.omit (params, [ 'until' ]);
        // retrievable periods listed here:
        // - https://www.bitget.com/api-doc/spot/market/Get-Candle-Data#request-parameters
        // - https://www.bitget.com/api-doc/contract/market/Get-Candle-Data#description
        const key = market['spot'] ? 'spot' : 'swap';
        const ohlcOptions = this.safeDict (this.options['fetchOHLCV'], key, {});
        const maxLimitPerTimeframe = this.safeDict (ohlcOptions, 'maxLimitPerTimeframe', {});
        const maxLimitForThisTimeframe = this.safeInteger (maxLimitPerTimeframe, timeframe, limit);
        const recentEndpointDaysMap = this.safeDict (this.options['fetchOHLCV'], 'maxRecentDaysPerTimeframe', {});
        const recentEndpointAvailableDays = this.safeInteger (recentEndpointDaysMap, timeframe);
        const recentEndpointBoundaryTs = now - (recentEndpointAvailableDays - 1) * msInDay;
        if (limitDefined) {
            limit = Math.min (limit, maxLimitForRecentEndpoint);
            limit = Math.min (limit, maxLimitForThisTimeframe);
        } else {
            limit = defaultLimit;
        }
        let limitMultipliedDuration = limit * duration;
        // exchange aligns from endTime, so it's important, not startTime
        // startTime is supported only on "recent" endpoint, not on "historical" endpoint
        let calculatedStartTime = undefined;
        let calculatedEndTime = undefined;
        if (sinceDefined) {
            calculatedStartTime = since;
            request['startTime'] = since;
            if (!untilDefined) {
                calculatedEndTime = this.sum (calculatedStartTime, limitMultipliedDuration);
                request['endTime'] = calculatedEndTime;
            }
        }
        if (untilDefined) {
            calculatedEndTime = until;
            request['endTime'] = calculatedEndTime;
            if (!sinceDefined) {
                calculatedStartTime = calculatedEndTime - limitMultipliedDuration;
                // we do not need to set "startTime" here
            }
        }
        // if historical endpoint is needed, we should re-set the variables
        let historicalEndpointNeeded = false;
        if ((calculatedStartTime !== undefined && calculatedStartTime <= recentEndpointBoundaryTs) || useHistoryEndpoint) {
            historicalEndpointNeeded = true;
            // only for "historical-candles" - ensure we use correct max limit
            limit = Math.min (limit, maxLimitForHistoryEndpoint);
            limitMultipliedDuration = limit * duration;
            calculatedStartTime = calculatedEndTime - limitMultipliedDuration;
            request['startTime'] = calculatedStartTime;
            // for contract, maximum 90 days allowed between start-end times
            if (!market['spot']) {
                const maxDistanceDaysForContracts = 90;
                // only correct if request is larger
                if (calculatedEndTime - calculatedStartTime > maxDistanceDaysForContracts * msInDay) {
                    calculatedEndTime = this.sum (calculatedStartTime, maxDistanceDaysForContracts * msInDay);
                    request['endTime'] = calculatedEndTime;
                }
            }
        }
        // we need to set limit to safely cover the period
        request['limit'] = limit;
        // make request
        let response = undefined;
        let productType = undefined;
        let priceType = undefined;
        [ priceType, params ] = this.handleParamString (params, 'price');
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        if (uta) {
            if (priceType !== undefined) {
                if (priceType === 'mark') {
                    request['type'] = 'MARK';
                } else if (priceType === 'index') {
                    request['type'] = 'INDEX';
                }
            }
            request['category'] = productType;
            response = await this.publicUtaGetV3MarketCandles (this.extend (request, params));
        } else if (market['spot']) {
            // checks if we need history endpoint
            if (historicalEndpointNeeded) {
                response = await this.publicSpotGetV2SpotMarketHistoryCandles (this.extend (request, params));
            } else {
                if (!limitDefined) {
                    request['limit'] = 1000;
                    limit = 1000;
                }
                response = await this.publicSpotGetV2SpotMarketCandles (this.extend (request, params));
            }
        } else {
            request['productType'] = productType;
            const extended = this.extend (request, params);
            if (!historicalEndpointNeeded && (priceType === 'mark' || priceType === 'index')) {
                if (!limitDefined) {
                    extended['limit'] = 1000;
                    limit = 1000;
                }
                // Recent endpoint for mark/index prices
                // https://www.bitget.com/api-doc/contract/market/Get-Candle-Data
                response = await this.publicMixGetV2MixMarketCandles (this.extend ({ 'kLineType': priceType }, extended));
            } else if (priceType === 'mark') {
                response = await this.publicMixGetV2MixMarketHistoryMarkCandles (extended);
            } else if (priceType === 'index') {
                response = await this.publicMixGetV2MixMarketHistoryIndexCandles (extended);
            } else {
                if (historicalEndpointNeeded) {
                    response = await this.publicMixGetV2MixMarketHistoryCandles (extended);
                } else {
                    if (!limitDefined) {
                        extended['limit'] = 1000;
                        limit = 1000;
                    }
                    response = await this.publicMixGetV2MixMarketCandles (extended);
                }
            }
        }
        if (response === '') {
            return []; // happens when a new token is listed
        }
        //  [ ["1645911960000","39406","39407","39374.5","39379","35.526","1399132.341"] ]
        const data = this.safeList (response, 'data', response);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    /**
     * @method
     * @name bitget#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.bitget.com/api-doc/spot/account/Get-Account-Assets
     * @see https://www.bitget.com/api-doc/contract/account/Get-Account-List
     * @see https://www.bitget.com/api-doc/margin/cross/account/Get-Cross-Assets
     * @see https://www.bitget.com/api-doc/margin/isolated/account/Get-Isolated-Assets
     * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-cross-assets
     * @see https://bitgetlimited.github.io/apidoc/en/margin/#get-isolated-assets
     * @see https://www.bitget.com/api-doc/uta/account/Get-Account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.productType] *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @param {string} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const request: Dict = {};
        let marketType = undefined;
        let marginMode = undefined;
        let response = undefined;
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchBalance', 'uta', false);
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchBalance', params);
        if (uta) {
            response = await this.privateUtaGetV3AccountAssets (this.extend (request, params));
            const results = this.safeDict (response, 'data', {});
            const assets = this.safeList (results, 'assets', []);
            return this.parseUtaBalance (assets);
        } else if ((marketType === 'swap') || (marketType === 'future')) {
            let productType = undefined;
            [ productType, params ] = this.handleProductTypeAndParams (undefined, params);
            request['productType'] = productType;
            response = await this.privateMixGetV2MixAccountAccounts (this.extend (request, params));
        } else if (marginMode === 'isolated') {
            response = await this.privateMarginGetMarginV1IsolatedAccountAssets (this.extend (request, params));
        } else if (marginMode === 'cross') {
            response = await this.privateMarginGetMarginV1CrossAccountAssets (this.extend (request, params));
        } else if (marketType === 'spot') {
            response = await this.privateSpotGetV2SpotAccountAssets (this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchBalance() does not support ' + marketType + ' accounts');
        }
        // spot
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700623852854,
        //         "data": [
        //             {
        //                 "coin": "USDT",
        //                 "available": "0.00000000",
        //                 "limitAvailable": "0",
        //                 "frozen": "0.00000000",
        //                 "locked": "0.00000000",
        //                 "uTime": "1699937566000"
        //             }
        //         ]
        //     }
        //
        // swap
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700625127294,
        //         "data": [
        //             {
        //                 "marginCoin": "USDT",
        //                 "locked": "0",
        //                 "available": "0",
        //                 "crossedMaxAvailable": "0",
        //                 "isolatedMaxAvailable": "0",
        //                 "maxTransferOut": "0",
        //                 "accountEquity": "0",
        //                 "usdtEquity": "0.000000005166",
        //                 "btcEquity": "0",
        //                 "crossedRiskRate": "0",
        //                 "unrealizedPL": "0",
        //                 "coupon": "0",
        //                 "crossedUnrealizedPL": null,
        //                 "isolatedUnrealizedPL": null
        //             }
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
        // uta
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1749980065089,
        //         "data": {
        //             "accountEquity": "11.13919278",
        //             "usdtEquity": "11.13921165",
        //             "btcEquity": "0.00011256",
        //             "unrealisedPnl": "0",
        //             "usdtUnrealisedPnl": "0",
        //             "btcUnrealizedPnl": "0",
        //             "effEquity": "6.19299777",
        //             "mmr": "0",
        //             "imr": "0",
        //             "mgnRatio": "0",
        //             "positionMgnRatio": "0",
        //             "assets": [
        //                 {
        //                     "coin": "USDT",
        //                     "equity": "6.19300826",
        //                     "usdValue": "6.19299777",
        //                     "balance": "6.19300826",
        //                     "available": "6.19300826",
        //                     "debt": "0",
        //                     "locked": "0"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseBalance (data);
    }

    parseUtaBalance (balance): Balances {
        const result: Dict = { 'info': balance };
        //
        //     {
        //         "coin": "USDT",
        //         "equity": "6.19300826",
        //         "usdValue": "6.19299777",
        //         "balance": "6.19300826",
        //         "available": "6.19300826",
        //         "debt": "0",
        //         "locked": "0"
        //     }
        //
        for (let i = 0; i < balance.length; i++) {
            const entry = balance[i];
            const account = this.account ();
            const currencyId = this.safeString (entry, 'coin');
            const code = this.safeCurrencyCode (currencyId);
            account['debt'] = this.safeString (entry, 'debt');
            account['used'] = this.safeString (entry, 'locked');
            account['free'] = this.safeString (entry, 'available');
            account['total'] = this.safeString (entry, 'balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    parseBalance (balance): Balances {
        const result: Dict = { 'info': balance };
        //
        // spot
        //
        //     {
        //         "coin": "USDT",
        //         "available": "0.00000000",
        //         "limitAvailable": "0",
        //         "frozen": "0.00000000",
        //         "locked": "0.00000000",
        //         "uTime": "1699937566000"
        //     }
        //
        // swap
        //
        //     {
        //         "marginCoin": "USDT",
        //         "locked": "0",
        //         "available": "0",
        //         "crossedMaxAvailable": "0",
        //         "isolatedMaxAvailable": "0",
        //         "maxTransferOut": "0",
        //         "accountEquity": "0",
        //         "usdtEquity": "0.000000005166",
        //         "btcEquity": "0",
        //         "crossedRiskRate": "0",
        //         "unrealizedPL": "0",
        //         "coupon": "0",
        //         "crossedUnrealizedPL": null,
        //         "isolatedUnrealizedPL": null
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
            const currencyId = this.safeString2 (entry, 'marginCoin', 'coin');
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
                if (contractAccountFree !== undefined) {
                    account['free'] = contractAccountFree;
                    account['total'] = this.safeString (entry, 'accountEquity');
                } else {
                    account['free'] = spotAccountFree;
                    const frozen = this.safeString (entry, 'frozen');
                    const locked = this.safeString (entry, 'locked');
                    account['used'] = Precise.stringAdd (frozen, locked);
                }
            }
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'new': 'open',
            'init': 'open',
            'not_trigger': 'open',
            'partial_fill': 'open',
            'partially_fill': 'open',
            'partially_filled': 'open',
            'triggered': 'closed',
            'full_fill': 'closed',
            'filled': 'closed',
            'fail_trigger': 'rejected',
            'cancel': 'canceled',
            'cancelled': 'canceled',
            'canceled': 'canceled',
            'live': 'open',
            'fail_execute': 'rejected',
            'executed': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder, editOrder, closePosition
        //
        //     {
        //         "clientOid": "abe95dbe-6081-4a6f-a2d3-ae49601cd479",
        //         "orderId": null
        //     }
        //
        // createOrders
        //
        //     [
        //         {
        //             "orderId": "1111397214281175046",
        //             "clientOid": "766d3fc3-7321-4406-a689-15c9987a2e75"
        //         },
        //         {
        //             "orderId": "",
        //             "clientOid": "d1b75cb3-cc15-4ede-ad4c-3937396f75ab",
        //             "errorMsg": "less than the minimum amount 5 USDT",
        //             "errorCode": "45110"
        //         },
        //     ]
        //
        // spot, swap, future, spot margin and uta: cancelOrder, cancelOrders, cancelAllOrders
        //
        //     {
        //         "orderId": "1098758604547850241",
        //         "clientOid": "1098758604585598977"
        //     }
        //
        // spot trigger: cancelOrder
        //
        //     {
        //         "result": "success"
        //     }
        //
        // spot: fetchOrder, fetchOpenOrders, fetchCanceledAndClosedOrders
        //
        //     {
        //         "userId": "7264631750",
        //         "symbol": "BTCUSDT",
        //         "orderId": "1111499608327360513",
        //         "clientOid": "d0d4dad5-18d0-4869-a074-ec40bb47cba6",
        //         "size": "0.0002000000000000", // COST for 'buy market' order! AMOUNT in all other cases
        //         "price": "0", // in fetchOrder: 0 for market order, otherwise limit price (field not present in fetchOpenOrders
        //         "orderType": "limit",
        //         "side": "buy",
        //         "status": "live",
        //         "basePrice": "0",
        //         "priceAvg": "25000.0000000000000000",   // 0 if nothing filled
        //         "baseVolume": "0.0000000000000000",     // 0 if nothing filled
        //         "quoteVolume": "0.0000000000000000",    // 0 if nothing filled
        //         "enterPointSource": "WEB",
        //         "orderSource": "normal",
        //         "cTime": "1700728077966",
        //         "uTime": "1700728077966"
        //         "feeDetail": "{\\"newFees\\":{\\"c\\":0,\\"d\\":0,\\"deduction\\":false,\\"r\\":-0.0064699886,\\"t\\":-0.0064699886,\\"totalDeductionFee\\":0},\\"USDT\\":{\\"deduction\\":false,\\"feeCoinCode\\":\\"USDT\\",\\"totalDeductionFee\\":0,\\"totalFee\\":-0.0064699886000000}}", // might not be present in fetchOpenOrders
        //         "triggerPrice": null,
        //         "tpslType": "normal",
        //         "quoteCoin": "USDT",  // not present in fetchOpenOrders
        //         "baseCoin": "DOT",    // not present in fetchOpenOrders
        //         "cancelReason": "",   // not present in fetchOpenOrders
        //     }
        //
        // spot trigger: fetchOpenOrders, fetchCanceledAndClosedOrders
        //
        //     {
        //         "orderId": "1111503385931620352",
        //         "clientOid": "1111503385910648832",
        //         "symbol": "BTCUSDT",
        //         "size": "0.0002",
        //         "planType": "AMOUNT",
        //         "executePrice": "25000",
        //         "triggerPrice": "26000",
        //         "status": "live",
        //         "orderType": "limit",
        //         "side": "buy",
        //         "triggerType": "fill_price",
        //         "enterPointSource": "API",
        //         "cTime": "1700728978617",
        //         "uTime": "1700728978617"
        //     }
        //
        // spot margin: fetchOpenOrders, fetchCanceledAndClosedOrders
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderType": "limit",
        //         "enterPointSource": "WEB",
        //         "orderId": "1111506377509580801",
        //         "clientOid": "2043a3b59a60445f9d9f7365bf3e960c",
        //         "loanType": "autoLoanAndRepay",
        //         "price": "25000",
        //         "side": "buy",
        //         "status": "live",
        //         "baseSize": "0.0002",
        //         "quoteSize": "5",
        //         "priceAvg": "0",
        //         "size": "0",
        //         "amount": "0",
        //         "force": "gtc",
        //         "cTime": "1700729691866",
        //         "uTime": "1700729691866"
        //     }
        //
        // swap and future: fetchOrder, fetchOpenOrders, fetchCanceledAndClosedOrders
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "size": "0.001",
        //         "orderId": "1111465253393825792",
        //         "clientOid": "1111465253431574529",
        //         "baseVolume": "0",
        //         "fee": "0",
        //         "price": "27000",
        //         "priceAvg": "",
        //         "state": "live",
        //         // "status": "live", // key for fetchOpenOrders, fetchClosedOrders
        //         "side": "buy",
        //         "force": "gtc",
        //         "totalProfits": "0",
        //         "posSide": "long",
        //         "marginCoin": "USDT",
        //         "quoteVolume": "0",
        //         "leverage": "20",
        //         "marginMode": "crossed",
        //         "enterPointSource": "API",
        //         "tradeSide": "open",
        //         "posMode": "hedge_mode",
        //         "orderType": "limit",
        //         "orderSource": "normal",
        //         "presetStopSurplusPrice": "",
        //         "presetStopLossPrice": "",
        //         "reduceOnly": "NO",
        //         "cTime": "1700719887120",
        //         "uTime": "1700719887120"
        //
        //     for swap trigger order, the additional below fields are present:
        //
        //         "planType": "normal_plan",
        //         "callbackRatio": "",
        //         "triggerPrice": "24000",
        //         "triggerType": "mark_price",
        //         "planStatus": "live",
        //         "stopSurplusTriggerPrice": "",
        //         "stopSurplusExecutePrice": "",
        //         "stopSurplusTriggerType": "fill_price",
        //         "stopLossTriggerPrice": "",
        //         "stopLossExecutePrice": "",
        //         "stopLossTriggerType": "fill_price",
        //     }
        //
        // uta: fetchOrder, fetchOpenOrders, fetchCanceledAndClosedOrders
        //
        //     {
        //         "orderId": "1320244799629316096",
        //         "clientOid": "1320244799633510400",
        //         "category": "USDT-FUTURES",
        //         "symbol": "BTCUSDT",
        //         "orderType": "limit",
        //         "side": "buy",
        //         "price": "50000",
        //         "qty": "0.001",
        //         "amount": "0",
        //         "cumExecQty": "0",
        //         "cumExecValue": "0",
        //         "avgPrice": "0",
        //         "timeInForce": "gtc",
        //         "orderStatus": "live",
        //         "posSide": "long",
        //         "holdMode": "hedge_mode",
        //         "reduceOnly": "NO",
        //         "feeDetail": [{
        //             "feeCoin": "",
        //             "fee": ""
        //         }],
        //         "createdTime": "1750496809871",
        //         "updatedTime": "1750496809886",
        //         "cancelReason": "",
        //         "execType": "normal",
        //         "stpMode": "none",
        //         "tpTriggerBy": null,
        //         "slTriggerBy": null,
        //         "takeProfit": null,
        //         "stopLoss": null,
        //         "tpOrderType": null,
        //         "slOrderType": null,
        //         "tpLimitPrice": null,
        //         "slLimitPrice": null
        //     }
        //
        // uta trigger: fetchClosedOrders, fetchCanceledOrders
        //
        //     {
        //         "orderId": "1330984742276198400",
        //         "clientOid": "1330984742276198400",
        //         "symbol": "BTCUSDT",
        //         "category": "USDT-FUTURES",
        //         "qty": "0.001",
        //         "posSide": "long",
        //         "tpTriggerBy": "market",
        //         "slTriggerBy": "mark",
        //         "takeProfit": "",
        //         "stopLoss": "112000",
        //         "tpOrderType": "market",
        //         "slOrderType": "limit",
        //         "tpLimitPrice": "",
        //         "slLimitPrice": "111000",
        //         "createdTime": "1753057411736",
        //         "updatedTime": "1753058267412"
        //     }
        //
        const errorMessage = this.safeString (order, 'errorMsg');
        if (errorMessage !== undefined) {
            return this.safeOrder ({
                'info': order,
                'id': this.safeString (order, 'orderId'),
                'clientOrderId': this.safeString2 (order, 'clientOrderId', 'clientOid'),
                'status': 'rejected',
            }, market);
        }
        const posSide = this.safeString (order, 'posSide');
        const isContractOrder = (posSide !== undefined);
        let marketType = isContractOrder ? 'contract' : 'spot';
        if (market !== undefined) {
            marketType = market['type'];
        }
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market, undefined, marketType);
        const timestamp = this.safeIntegerN (order, [ 'cTime', 'ctime', 'createdTime' ]);
        const updateTimestamp = this.safeInteger2 (order, 'uTime', 'updatedTime');
        const rawStatus = this.safeStringN (order, [ 'status', 'state', 'orderStatus', 'planStatus' ]);
        let fee = undefined;
        const feeCostString = this.safeString (order, 'fee');
        if (feeCostString !== undefined) {
            // swap
            fee = {
                'cost': this.parseNumber (Precise.stringNeg (feeCostString)),
                'currency': market['settle'],
            };
        }
        const feeDetail = this.safeValue (order, 'feeDetail');
        const uta = this.safeString (order, 'category') !== undefined;
        if (uta) {
            const feeResult = this.safeDict (feeDetail, 0, {});
            const utaFee = this.safeString (feeResult, 'fee');
            fee = {
                'cost': this.parseNumber (Precise.stringNeg (utaFee)),
                'currency': market['settle'],
            };
        } else {
            if (feeDetail !== undefined) {
                const parsedFeeDetail = JSON.parse (feeDetail);
                const feeValues = Object.values (parsedFeeDetail);
                let feeObject = undefined;
                for (let i = 0; i < feeValues.length; i++) {
                    const feeValue = feeValues[i];
                    if (this.safeValue (feeValue, 'feeCoinCode') !== undefined) {
                        feeObject = feeValue;
                        break;
                    }
                }
                fee = {
                    'cost': this.parseNumber (Precise.stringNeg (this.safeString (feeObject, 'totalFee'))),
                    'currency': this.safeCurrencyCode (this.safeString (feeObject, 'feeCoinCode')),
                };
            }
        }
        let postOnly = undefined;
        let timeInForce = this.safeStringUpper2 (order, 'force', 'timeInForce');
        if (timeInForce === 'POST_ONLY') {
            postOnly = true;
            timeInForce = 'PO';
        }
        let reduceOnly = undefined;
        const reduceOnlyRaw = this.safeString (order, 'reduceOnly');
        if (reduceOnlyRaw !== undefined) {
            reduceOnly = (reduceOnlyRaw === 'NO') ? false : true;
        }
        let price = undefined;
        let average = undefined;
        const basePrice = this.safeString (order, 'basePrice');
        if (basePrice !== undefined) {
            // for spot fetchOpenOrders, the price is priceAvg and the filled price is basePrice
            price = this.safeString (order, 'priceAvg');
            average = this.safeString (order, 'basePrice');
        } else {
            price = this.safeStringN (order, [ 'price', 'executePrice', 'slLimitPrice', 'tpLimitPrice' ]);
            average = this.safeString (order, 'priceAvg');
        }
        let size = undefined;
        let filled = undefined;
        const baseSize = this.safeString (order, 'baseSize');
        if (baseSize !== undefined) {
            // for spot margin fetchOpenOrders, the order size is baseSize and the filled amount is size
            size = baseSize;
            filled = this.safeString (order, 'size');
        } else {
            size = this.safeString2 (order, 'size', 'qty');
            filled = this.safeString2 (order, 'baseVolume', 'cumExecQty');
        }
        let side = this.safeString (order, 'side');
        const posMode = this.safeString (order, 'posMode');
        if (posMode === 'hedge_mode' && reduceOnly) {
            side = (side === 'buy') ? 'sell' : 'buy';
            // on bitget hedge mode if the position is long the side is always buy, and if the position is short the side is always sell
            // so the side of the reduceOnly order is inversed
        }
        const orderType = this.safeString (order, 'orderType');
        const isBuyMarket = (side === 'buy') && (orderType === 'market');
        if (market['spot'] && isBuyMarket) {
            // as noted in top comment, for 'buy market' the 'size' field is COST, not AMOUNT
            size = this.safeString (order, 'baseVolume');
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
            'type': orderType,
            'side': side,
            'price': price,
            'amount': size,
            'cost': this.safeString2 (order, 'quoteVolume', 'quoteSize'),
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': reduceOnly,
            'triggerPrice': this.safeNumber (order, 'triggerPrice'),
            'takeProfitPrice': this.safeNumberN (order, [ 'presetStopSurplusPrice', 'stopSurplusTriggerPrice', 'takeProfit' ]),
            'stopLossPrice': this.safeNumberN (order, [ 'presetStopLossPrice', 'stopLossTriggerPrice', 'stopLoss' ]),
            'status': this.parseOrderStatus (rawStatus),
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    /**
     * @method
     * @name bitget#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://www.bitget.com/api-doc/spot/trade/Place-Order
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Cross-Place-Order
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Place-Order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createMarketBuyOrderWithCost (symbol: string, cost: number, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['spot']) {
            throw new NotSupported (this.id + ' createMarketBuyOrderWithCost() supports spot orders only');
        }
        const req = {
            'createMarketBuyOrderRequiresPrice': false,
        };
        return await this.createOrder (symbol, 'market', 'buy', cost, undefined, this.extend (req, params));
    }

    /**
     * @method
     * @name bitget#createOrder
     * @description create a trade order
     * @see https://www.bitget.com/api-doc/spot/trade/Place-Order
     * @see https://www.bitget.com/api-doc/spot/plan/Place-Plan-Order
     * @see https://www.bitget.com/api-doc/contract/trade/Place-Order
     * @see https://www.bitget.com/api-doc/contract/plan/Place-Tpsl-Order
     * @see https://www.bitget.com/api-doc/contract/plan/Place-Plan-Order
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Cross-Place-Order
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Place-Order
     * @see https://www.bitget.com/api-doc/uta/trade/Place-Order
     * @see https://www.bitget.com/api-doc/uta/strategy/Place-Strategy-Order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] *spot only* how much you want to trade in units of the quote currency, for market buy orders only
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
     * @param {string} [params.holdSide] *contract stopLossPrice, takeProfitPrice only* Two-way position: ('long' or 'short'), one-way position: ('buy' or 'sell')
     * @param {float} [params.stopLoss.price] *swap only* the execution price for a stop loss attached to a trigger order
     * @param {float} [params.takeProfit.price] *swap only* the execution price for a take profit attached to a trigger order
     * @param {string} [params.stopLoss.type] *swap only* the type for a stop loss attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price'
     * @param {string} [params.takeProfit.type] *swap only* the type for a take profit attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price'
     * @param {string} [params.trailingPercent] *swap and future only* the percent to trail away from the current market price, rate can not be greater than 10
     * @param {string} [params.trailingTriggerPrice] *swap and future only* the price to trigger a trailing stop order, default uses the price argument
     * @param {string} [params.triggerType] *swap and future only* 'fill_price', 'mark_price' or 'index_price'
     * @param {boolean} [params.oneWayMode] *swap and future only* required to set this to true in one_way_mode and you can leave this as undefined in hedge_mode, can adjust the mode using the setPositionMode() method
     * @param {bool} [params.hedged] *swap and future only* true for hedged mode, false for one way mode, default is false
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @param {string} [params.posSide] *uta only* hedged two-way position side, long or short
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marginParams = this.handleMarginModeAndParams ('createOrder', params);
        const marginMode = marginParams[0];
        const triggerPrice = this.safeValue2 (params, 'stopPrice', 'triggerPrice');
        const stopLossTriggerPrice = this.safeValue (params, 'stopLossPrice');
        const takeProfitTriggerPrice = this.safeValue (params, 'takeProfitPrice');
        const trailingPercent = this.safeString2 (params, 'trailingPercent', 'callbackRatio');
        const isTrailingPercentOrder = trailingPercent !== undefined;
        const isTriggerOrder = triggerPrice !== undefined;
        const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
        const isStopLossOrTakeProfitTrigger = isStopLossTriggerOrder || isTakeProfitTriggerOrder;
        let response = undefined;
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'createOrder', 'uta', false);
        if (uta) {
            const request = this.createUtaOrderRequest (symbol, type, side, amount, price, params);
            if (isStopLossOrTakeProfitTrigger) {
                response = await this.privateUtaPostV3TradePlaceStrategyOrder (request);
            } else {
                response = await this.privateUtaPostV3TradePlaceOrder (request);
            }
        } else {
            const request = this.createOrderRequest (symbol, type, side, amount, price, params);
            if (market['spot']) {
                if (isTriggerOrder) {
                    response = await this.privateSpotPostV2SpotTradePlacePlanOrder (request);
                } else if (marginMode === 'isolated') {
                    response = await this.privateMarginPostV2MarginIsolatedPlaceOrder (request);
                } else if (marginMode === 'cross') {
                    response = await this.privateMarginPostV2MarginCrossedPlaceOrder (request);
                } else {
                    response = await this.privateSpotPostV2SpotTradePlaceOrder (request);
                }
            } else {
                if (isTriggerOrder || isTrailingPercentOrder) {
                    response = await this.privateMixPostV2MixOrderPlacePlanOrder (request);
                } else if (isStopLossOrTakeProfitTrigger) {
                    response = await this.privateMixPostV2MixOrderPlaceTpslOrder (request);
                } else {
                    response = await this.privateMixPostV2MixOrderPlaceOrder (request);
                }
            }
        }
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1645932209602,
        //         "data": {
        //             "orderId": "881669078313766912",
        //             "clientOid": "iauIBf#a45b595f96474d888d0ada"
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    createUtaOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        const market = this.market (symbol);
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        if (productType === 'SPOT') {
            let marginMode = undefined;
            [ marginMode, params ] = this.handleMarginModeAndParams ('createOrder', params);
            if (marginMode !== undefined) {
                productType = 'MARGIN';
            }
        }
        const request: Dict = {
            'category': productType,
            'symbol': market['id'],
            'qty': this.amountToPrecision (symbol, amount),
            'side': side,
        };
        const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOid'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        }
        const stopLossTriggerPrice = this.safeNumber (params, 'stopLossPrice');
        const takeProfitTriggerPrice = this.safeNumber (params, 'takeProfitPrice');
        const stopLoss = this.safeValue (params, 'stopLoss');
        const takeProfit = this.safeValue (params, 'takeProfit');
        const isStopLoss = stopLoss !== undefined;
        const isTakeProfit = takeProfit !== undefined;
        const isStopLossTrigger = stopLossTriggerPrice !== undefined;
        const isTakeProfitTrigger = takeProfitTriggerPrice !== undefined;
        const isStopLossOrTakeProfitTrigger = isStopLossTrigger || isTakeProfitTrigger;
        if (isStopLossOrTakeProfitTrigger) {
            if (isStopLossTrigger) {
                const slType = this.safeString (params, 'slTriggerBy', 'mark');
                request['slTriggerBy'] = slType;
                request['stopLoss'] = this.priceToPrecision (symbol, stopLossTriggerPrice);
                if (price !== undefined) {
                    request['slLimitPrice'] = this.priceToPrecision (symbol, price);
                    request['slOrderType'] = this.safeString (params, 'slOrderType', 'limit');
                } else {
                    request['slOrderType'] = this.safeString (params, 'slOrderType', 'market');
                }
            } else if (isTakeProfitTrigger) {
                const tpType = this.safeString (params, 'tpTriggerBy', 'mark');
                request['tpTriggerBy'] = tpType;
                request['takeProfit'] = this.priceToPrecision (symbol, takeProfitTriggerPrice);
                if (price !== undefined) {
                    request['tpLimitPrice'] = this.priceToPrecision (symbol, price);
                    request['tpOrderType'] = this.safeString (params, 'tpOrderType', 'limit');
                } else {
                    request['tpOrderType'] = this.safeString (params, 'tpOrderType', 'market');
                }
            }
            params = this.omit (params, [ 'stopLossPrice', 'takeProfitPrice' ]);
        } else {
            if (isStopLoss) {
                const slTriggerPrice = this.safeNumber2 (stopLoss, 'triggerPrice', 'stopPrice');
                const slLimitPrice = this.safeNumber (stopLoss, 'price');
                request['stopLoss'] = this.priceToPrecision (symbol, slTriggerPrice);
                if (slLimitPrice !== undefined) {
                    request['slLimitPrice'] = this.priceToPrecision (symbol, slLimitPrice);
                    request['slOrderType'] = this.safeString (params, 'slOrderType', 'limit');
                } else {
                    request['slOrderType'] = this.safeString (params, 'slOrderType', 'market');
                }
            }
            if (isTakeProfit) {
                const tpTriggerPrice = this.safeNumber2 (takeProfit, 'triggerPrice', 'stopPrice');
                const tpLimitPrice = this.safeNumber (takeProfit, 'price');
                request['takeProfit'] = this.priceToPrecision (symbol, tpTriggerPrice);
                if (tpLimitPrice !== undefined) {
                    request['tpLimitPrice'] = this.priceToPrecision (symbol, tpLimitPrice);
                    request['tpOrderType'] = this.safeString (params, 'tpOrderType', 'limit');
                } else {
                    request['tpOrderType'] = this.safeString (params, 'tpOrderType', 'market');
                }
            }
            const isMarketOrder = type === 'market';
            if (!isMarketOrder) {
                request['price'] = this.priceToPrecision (symbol, price);
            }
            request['orderType'] = type;
            const exchangeSpecificTifParam = this.safeString (params, 'timeInForce');
            let postOnly = undefined;
            [ postOnly, params ] = this.handlePostOnly (isMarketOrder, exchangeSpecificTifParam === 'post_only', params);
            const defaultTimeInForce = this.safeStringUpper (this.options, 'defaultTimeInForce');
            const timeInForce = this.safeStringUpper (params, 'timeInForce', defaultTimeInForce);
            if (postOnly) {
                request['timeInForce'] = 'post_only';
            } else if (timeInForce === 'GTC') {
                request['timeInForce'] = 'gtc';
            } else if (timeInForce === 'FOK') {
                request['timeInForce'] = 'fok';
            } else if (timeInForce === 'IOC') {
                request['timeInForce'] = 'ioc';
            }
        }
        const reduceOnly = this.safeBool (params, 'reduceOnly', false);
        let hedged = undefined;
        [ hedged, params ] = this.handleParamBool (params, 'hedged', false);
        if (reduceOnly) {
            if (hedged || isStopLossOrTakeProfitTrigger) {
                const reduceOnlyPosSide = (side === 'sell') ? 'long' : 'short';
                request['posSide'] = reduceOnlyPosSide;
            } else if (!isStopLossOrTakeProfitTrigger) {
                request['reduceOnly'] = 'yes';
            }
        } else {
            if (hedged) {
                const posSide = (side === 'buy') ? 'long' : 'short';
                request['posSide'] = posSide;
            }
        }
        params = this.omit (params, [ 'stopLoss', 'takeProfit', 'postOnly', 'reduceOnly', 'hedged' ]);
        return this.extend (request, params);
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        const market = this.market (symbol);
        let marketType = undefined;
        let marginMode = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('createOrder', market, params);
        [ marginMode, params ] = this.handleMarginModeAndParams ('createOrder', params);
        const request: Dict = {
            'symbol': market['id'],
            'orderType': type,
        };
        let hedged = undefined;
        [ hedged, params ] = this.handleParamBool (params, 'hedged', false);
        // backward compatibility for `oneWayMode`
        let oneWayMode = undefined;
        [ oneWayMode, params ] = this.handleParamBool (params, 'oneWayMode');
        if (oneWayMode !== undefined) {
            hedged = !oneWayMode;
        }
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
        const trailingTriggerPrice = this.safeString (params, 'trailingTriggerPrice', this.numberToString (price));
        const trailingPercent = this.safeString2 (params, 'trailingPercent', 'callbackRatio');
        const isTrailingPercentOrder = trailingPercent !== undefined;
        if (this.sum (isTriggerOrder, isStopLossTriggerOrder, isTakeProfitTriggerOrder, isTrailingPercentOrder) > 1) {
            throw new ExchangeError (this.id + ' createOrder() params can only contain one of triggerPrice, stopLossPrice, takeProfitPrice, trailingPercent');
        }
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const triggerPriceType = this.safeString2 (params, 'triggerPriceType', 'triggerType', 'mark_price');
        const reduceOnly = this.safeBool (params, 'reduceOnly', false);
        const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId');
        const exchangeSpecificTifParam = this.safeString2 (params, 'force', 'timeInForce');
        let postOnly = undefined;
        [ postOnly, params ] = this.handlePostOnly (isMarketOrder, exchangeSpecificTifParam === 'post_only', params);
        const defaultTimeInForce = this.safeStringUpper (this.options, 'defaultTimeInForce');
        const timeInForce = this.safeStringUpper (params, 'timeInForce', defaultTimeInForce);
        if (postOnly) {
            request['force'] = 'post_only';
        } else if (timeInForce === 'GTC') {
            request['force'] = 'GTC';
        } else if (timeInForce === 'FOK') {
            request['force'] = 'FOK';
        } else if (timeInForce === 'IOC') {
            request['force'] = 'IOC';
        }
        params = this.omit (params, [ 'stopPrice', 'triggerType', 'stopLossPrice', 'takeProfitPrice', 'stopLoss', 'takeProfit', 'postOnly', 'reduceOnly', 'clientOrderId', 'trailingPercent', 'trailingTriggerPrice' ]);
        if ((marketType === 'swap') || (marketType === 'future')) {
            request['marginCoin'] = market['settleId'];
            request['size'] = this.amountToPrecision (symbol, amount);
            let productType = undefined;
            [ productType, params ] = this.handleProductTypeAndParams (market, params);
            request['productType'] = productType;
            if (clientOrderId !== undefined) {
                request['clientOid'] = clientOrderId;
            }
            if (isTriggerOrder || isStopLossOrTakeProfitTrigger || isTrailingPercentOrder) {
                request['triggerType'] = triggerPriceType;
            }
            if (isTrailingPercentOrder) {
                if (!isMarketOrder) {
                    throw new BadRequest (this.id + ' createOrder() bitget trailing orders must be market orders');
                }
                if (trailingTriggerPrice === undefined) {
                    throw new ArgumentsRequired (this.id + ' createOrder() bitget trailing orders must have a trailingTriggerPrice param');
                }
                request['planType'] = 'track_plan';
                request['triggerPrice'] = this.priceToPrecision (symbol, trailingTriggerPrice);
                request['callbackRatio'] = trailingPercent;
            } else if (isTriggerOrder) {
                request['planType'] = 'normal_plan';
                request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
                if (price !== undefined) {
                    request['executePrice'] = this.priceToPrecision (symbol, price);
                }
                if (isStopLoss) {
                    const slTriggerPrice = this.safeString2 (stopLoss, 'triggerPrice', 'stopPrice');
                    request['stopLossTriggerPrice'] = this.priceToPrecision (symbol, slTriggerPrice);
                    const slPrice = this.safeString (stopLoss, 'price');
                    request['stopLossExecutePrice'] = this.priceToPrecision (symbol, slPrice);
                    const slType = this.safeString (stopLoss, 'type', 'mark_price');
                    request['stopLossTriggerType'] = slType;
                }
                if (isTakeProfit) {
                    const tpTriggerPrice = this.safeString2 (takeProfit, 'triggerPrice', 'stopPrice');
                    request['stopSurplusTriggerPrice'] = this.priceToPrecision (symbol, tpTriggerPrice);
                    const tpPrice = this.safeString (takeProfit, 'price');
                    request['stopSurplusExecutePrice'] = this.priceToPrecision (symbol, tpPrice);
                    const tpType = this.safeString (takeProfit, 'type', 'mark_price');
                    request['stopSurplusTriggerType'] = tpType;
                }
            } else if (isStopLossOrTakeProfitTrigger) {
                if (!isMarketOrder) {
                    throw new ExchangeError (this.id + ' createOrder() bitget stopLoss or takeProfit orders must be market orders');
                }
                if (hedged) {
                    request['holdSide'] = (side === 'sell') ? 'long' : 'short';
                } else {
                    request['holdSide'] = (side === 'sell') ? 'buy' : 'sell';
                }
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
                    request['presetStopSurplusPrice'] = this.priceToPrecision (symbol, tpTriggerPrice);
                }
            }
            if (!isStopLossOrTakeProfitTrigger) {
                if (marginMode === undefined) {
                    marginMode = 'cross';
                }
                const marginModeRequest = (marginMode === 'cross') ? 'crossed' : 'isolated';
                request['marginMode'] = marginModeRequest;
                let requestSide = side;
                if (reduceOnly) {
                    if (!hedged) {
                        request['reduceOnly'] = 'YES';
                    } else {
                        // on bitget hedge mode if the position is long the side is always buy, and if the position is short the side is always sell
                        requestSide = (side === 'buy') ? 'sell' : 'buy';
                        request['tradeSide'] = 'Close';
                    }
                } else {
                    if (hedged) {
                        request['tradeSide'] = 'Open';
                    }
                }
                request['side'] = requestSide;
            }
        } else if (marketType === 'spot') {
            if (isStopLossOrTakeProfitTrigger || isStopLossOrTakeProfit) {
                throw new InvalidOrder (this.id + ' createOrder() does not support stop loss/take profit orders on spot markets, only swap markets');
            }
            request['side'] = side;
            let quantity = undefined;
            let planType = undefined;
            let createMarketBuyOrderRequiresPrice = true;
            [ createMarketBuyOrderRequiresPrice, params ] = this.handleOptionAndParams (params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
            if (isMarketOrder && (side === 'buy')) {
                planType = 'total';
                const cost = this.safeNumber (params, 'cost');
                params = this.omit (params, 'cost');
                if (cost !== undefined) {
                    quantity = this.costToPrecision (symbol, cost);
                } else if (createMarketBuyOrderRequiresPrice) {
                    if (price === undefined) {
                        throw new InvalidOrder (this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument');
                    } else {
                        const amountString = this.numberToString (amount);
                        const priceString = this.numberToString (price);
                        const quoteAmount = Precise.stringMul (amountString, priceString);
                        quantity = this.costToPrecision (symbol, quoteAmount);
                    }
                } else {
                    quantity = this.costToPrecision (symbol, amount);
                }
            } else {
                planType = 'amount';
                quantity = this.amountToPrecision (symbol, amount);
            }
            if (clientOrderId !== undefined) {
                request['clientOid'] = clientOrderId;
            }
            if (marginMode !== undefined) {
                request['loanType'] = 'normal';
                if (isMarketOrder && (side === 'buy')) {
                    request['quoteSize'] = quantity;
                } else {
                    request['baseSize'] = quantity;
                }
            } else {
                if (quantity !== undefined) {
                    request['size'] = quantity;
                }
                if (triggerPrice !== undefined) {
                    request['planType'] = planType;
                    request['triggerType'] = triggerPriceType;
                    request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
                    if (price !== undefined) {
                        request['executePrice'] = this.priceToPrecision (symbol, price);
                    }
                }
            }
        } else {
            throw new NotSupported (this.id + ' createOrder() does not support ' + marketType + ' orders');
        }
        return this.extend (request, params);
    }

    async createUtaOrders (orders: OrderRequest[], params = {}) {
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
            const orderRequest = this.createUtaOrderRequest (marketId, type, side, amount, price, orderParams);
            ordersRequests.push (orderRequest);
        }
        const market = this.market (symbol);
        const response = await this.privateUtaPostV3TradePlaceBatch (ordersRequests);
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1752810184560,
        //         "data": [
        //             {
        //                 "orderId": "1329947796441513984",
        //                 "clientOid": "1329947796483457024"
        //             },
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market);
    }

    /**
     * @method
     * @name bitget#createOrders
     * @description create a list of trade orders (all orders should be of the same symbol)
     * @see https://www.bitget.com/api-doc/spot/trade/Batch-Place-Orders
     * @see https://www.bitget.com/api-doc/contract/trade/Batch-Order
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Batch-Order
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Cross-Batch-Order
     * @see https://www.bitget.com/api-doc/uta/trade/Place-Batch
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the api endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders (orders: OrderRequest[], params = {}) {
        await this.loadMarkets ();
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'createOrders', 'uta', false);
        if (uta) {
            return await this.createUtaOrders (orders, params);
        }
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
        const request: Dict = {
            'symbol': market['id'],
            'orderList': ordersRequests,
        };
        let response = undefined;
        if ((market['swap']) || (market['future'])) {
            if (marginMode === undefined) {
                marginMode = 'cross';
            }
            const marginModeRequest = (marginMode === 'cross') ? 'crossed' : 'isolated';
            request['marginMode'] = marginModeRequest;
            request['marginCoin'] = market['settleId'];
            let productType = undefined;
            [ productType, params ] = this.handleProductTypeAndParams (market, params);
            request['productType'] = productType;
            response = await this.privateMixPostV2MixOrderBatchPlaceOrder (request);
        } else if (marginMode === 'isolated') {
            response = await this.privateMarginPostV2MarginIsolatedBatchPlaceOrder (request);
        } else if (marginMode === 'cross') {
            response = await this.privateMarginPostV2MarginCrossedBatchPlaceOrder (request);
        } else {
            response = await this.privateSpotPostV2SpotTradeBatchOrders (request);
        }
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700703539416,
        //         "data": {
        //             "successList": [
        //                 {
        //                     "orderId": "1111397214281175046",
        //                     "clientOid": "766d3fc3-7321-4406-a689-15c9987a2e75"
        //                 },
        //             ],
        //             "failureList": [
        //                 {
        //                     "orderId": "",
        //                     "clientOid": "d1b75cb3-cc15-4ede-ad4c-3937396f75ab",
        //                     "errorMsg": "less than the minimum amount 5 USDT",
        //                     "errorCode": "45110"
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const failure = this.safeValue (data, 'failureList', []);
        const orderInfo = this.safeValue (data, 'successList', []);
        const both = this.arrayConcat (orderInfo, failure);
        return this.parseOrders (both, market);
    }

    /**
     * @method
     * @name bitget#editOrder
     * @description edit a trade order
     * @see https://www.bitget.com/api-doc/spot/plan/Modify-Plan-Order
     * @see https://www.bitget.com/api-doc/contract/trade/Modify-Order
     * @see https://www.bitget.com/api-doc/contract/plan/Modify-Tpsl-Order
     * @see https://www.bitget.com/api-doc/contract/plan/Modify-Plan-Order
     * @see https://www.bitget.com/api-doc/uta/trade/Modify-Order
     * @see https://www.bitget.com/api-doc/uta/strategy/Modify-Strategy-Order
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at
     * @param {float} [params.stopLossPrice] *swap only* The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] *swap only* The price at which a take profit order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] *swap only* take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] *swap only* stop loss trigger price
     * @param {float} [params.stopLoss.price] *swap only* the execution price for a stop loss attached to a trigger order
     * @param {float} [params.takeProfit.price] *swap only* the execution price for a take profit attached to a trigger order
     * @param {string} [params.stopLoss.type] *swap only* the type for a stop loss attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price'
     * @param {string} [params.takeProfit.type] *swap only* the type for a take profit attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price'
     * @param {string} [params.trailingPercent] *swap and future only* the percent to trail away from the current market price, rate can not be greater than 10
     * @param {string} [params.trailingTriggerPrice] *swap and future only* the price to trigger a trailing stop order, default uses the price argument
     * @param {string} [params.newTriggerType] *swap and future only* 'fill_price', 'mark_price' or 'index_price'
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder (id: string, symbol: string, type:OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'orderId': id,
        };
        const isMarketOrder = type === 'market';
        const triggerPrice = this.safeValue2 (params, 'stopPrice', 'triggerPrice');
        const isTriggerOrder = triggerPrice !== undefined;
        const stopLossPrice = this.safeValue (params, 'stopLossPrice');
        const isStopLossOrder = stopLossPrice !== undefined;
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        const isTakeProfitOrder = takeProfitPrice !== undefined;
        const stopLoss = this.safeValue (params, 'stopLoss');
        const takeProfit = this.safeValue (params, 'takeProfit');
        const isStopLoss = stopLoss !== undefined;
        const isTakeProfit = takeProfit !== undefined;
        const trailingTriggerPrice = this.safeString (params, 'trailingTriggerPrice', this.numberToString (price));
        const trailingPercent = this.safeString2 (params, 'trailingPercent', 'newCallbackRatio');
        const isTrailingPercentOrder = trailingPercent !== undefined;
        if (this.sum (isTriggerOrder, isStopLossOrder, isTakeProfitOrder, isTrailingPercentOrder) > 1) {
            throw new ExchangeError (this.id + ' editOrder() params can only contain one of triggerPrice, stopLossPrice, takeProfitPrice, trailingPercent');
        }
        const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOid'] = clientOrderId;
        }
        params = this.omit (params, [ 'stopPrice', 'triggerType', 'stopLossPrice', 'takeProfitPrice', 'stopLoss', 'takeProfit', 'clientOrderId', 'trailingTriggerPrice', 'trailingPercent' ]);
        let response = undefined;
        let productType = undefined;
        let uta = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        [ uta, params ] = this.handleOptionAndParams (params, 'editOrder', 'uta', false);
        if (uta) {
            if (amount !== undefined) {
                request['qty'] = this.amountToPrecision (symbol, amount);
            }
            if (isStopLossOrder || isTakeProfitOrder) {
                if (isStopLossOrder) {
                    const slType = this.safeString (params, 'slTriggerBy', 'mark');
                    request['slTriggerBy'] = slType;
                    request['stopLoss'] = this.priceToPrecision (symbol, stopLossPrice);
                    if (price !== undefined) {
                        request['slLimitPrice'] = this.priceToPrecision (symbol, price);
                        request['slOrderType'] = this.safeString (params, 'slOrderType', 'limit');
                    } else {
                        request['slOrderType'] = this.safeString (params, 'slOrderType', 'market');
                    }
                } else if (isTakeProfitOrder) {
                    const tpType = this.safeString (params, 'tpTriggerBy', 'mark');
                    request['tpTriggerBy'] = tpType;
                    request['takeProfit'] = this.priceToPrecision (symbol, takeProfitPrice);
                    if (price !== undefined) {
                        request['tpLimitPrice'] = this.priceToPrecision (symbol, price);
                        request['tpOrderType'] = this.safeString (params, 'tpOrderType', 'limit');
                    } else {
                        request['tpOrderType'] = this.safeString (params, 'tpOrderType', 'market');
                    }
                }
                params = this.omit (params, [ 'stopLossPrice', 'takeProfitPrice' ]);
                response = await this.privateUtaPostV3TradeModifyStrategyOrder (this.extend (request, params));
            } else {
                if (price !== undefined) {
                    request['price'] = this.priceToPrecision (symbol, price);
                }
                response = await this.privateUtaPostV3TradeModifyOrder (this.extend (request, params));
            }
        } else if (market['spot']) {
            if (triggerPrice === undefined) {
                throw new NotSupported (this.id + ' editOrder() only supports plan/trigger spot orders');
            }
            const editMarketBuyOrderRequiresPrice = this.safeBool (this.options, 'editMarketBuyOrderRequiresPrice', true);
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
            request['orderType'] = type;
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
            request['executePrice'] = this.priceToPrecision (symbol, price);
            response = await this.privateSpotPostV2SpotTradeModifyPlanOrder (this.extend (request, params));
        } else {
            if ((!market['swap']) && (!market['future'])) {
                throw new NotSupported (this.id + ' editOrder() does not support ' + market['type'] + ' orders');
            }
            request['symbol'] = market['id'];
            request['productType'] = productType;
            if (!isTakeProfitOrder && !isStopLossOrder) {
                request['newSize'] = this.amountToPrecision (symbol, amount);
                if ((price !== undefined) && !isTrailingPercentOrder) {
                    request['newPrice'] = this.priceToPrecision (symbol, price);
                }
            }
            if (isTrailingPercentOrder) {
                if (!isMarketOrder) {
                    throw new BadRequest (this.id + ' editOrder() bitget trailing orders must be market orders');
                }
                if (trailingTriggerPrice !== undefined) {
                    request['newTriggerPrice'] = this.priceToPrecision (symbol, trailingTriggerPrice);
                }
                request['newCallbackRatio'] = trailingPercent;
                response = await this.privateMixPostV2MixOrderModifyPlanOrder (this.extend (request, params));
            } else if (isTakeProfitOrder || isStopLossOrder) {
                request['marginCoin'] = market['settleId'];
                request['size'] = this.amountToPrecision (symbol, amount);
                if (price !== undefined) {
                    request['executePrice'] = this.priceToPrecision (symbol, price);
                }
                if (isStopLossOrder) {
                    request['triggerPrice'] = this.priceToPrecision (symbol, stopLossPrice);
                } else if (isTakeProfitOrder) {
                    request['triggerPrice'] = this.priceToPrecision (symbol, takeProfitPrice);
                }
                response = await this.privateMixPostV2MixOrderModifyTpslOrder (this.extend (request, params));
            } else if (isTriggerOrder) {
                request['newTriggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
                if (isStopLoss) {
                    const slTriggerPrice = this.safeNumber2 (stopLoss, 'triggerPrice', 'stopPrice');
                    request['newStopLossTriggerPrice'] = this.priceToPrecision (symbol, slTriggerPrice);
                    const slPrice = this.safeNumber (stopLoss, 'price');
                    request['newStopLossExecutePrice'] = this.priceToPrecision (symbol, slPrice);
                    const slType = this.safeString (stopLoss, 'type', 'mark_price');
                    request['newStopLossTriggerType'] = slType;
                }
                if (isTakeProfit) {
                    const tpTriggerPrice = this.safeNumber2 (takeProfit, 'triggerPrice', 'stopPrice');
                    request['newSurplusTriggerPrice'] = this.priceToPrecision (symbol, tpTriggerPrice);
                    const tpPrice = this.safeNumber (takeProfit, 'price');
                    request['newStopSurplusExecutePrice'] = this.priceToPrecision (symbol, tpPrice);
                    const tpType = this.safeString (takeProfit, 'type', 'mark_price');
                    request['newStopSurplusTriggerType'] = tpType;
                }
                response = await this.privateMixPostV2MixOrderModifyPlanOrder (this.extend (request, params));
            } else {
                const defaultNewClientOrderId = this.uuid ();
                const newClientOrderId = this.safeString2 (params, 'newClientOid', 'newClientOrderId', defaultNewClientOrderId);
                params = this.omit (params, 'newClientOrderId');
                request['newClientOid'] = newClientOrderId;
                if (isStopLoss) {
                    const slTriggerPrice = this.safeValue2 (stopLoss, 'triggerPrice', 'stopPrice');
                    request['newPresetStopLossPrice'] = this.priceToPrecision (symbol, slTriggerPrice);
                }
                if (isTakeProfit) {
                    const tpTriggerPrice = this.safeValue2 (takeProfit, 'triggerPrice', 'stopPrice');
                    request['newPresetStopSurplusPrice'] = this.priceToPrecision (symbol, tpTriggerPrice);
                }
                response = await this.privateMixPostV2MixOrderModifyOrder (this.extend (request, params));
            }
        }
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700708275737,
        //         "data": {
        //             "clientOid": "abe95dbe-6081-4a6f-a2d3-ae49601cd459",
        //             "orderId": null
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    /**
     * @method
     * @name bitget#cancelOrder
     * @description cancels an open order
     * @see https://www.bitget.com/api-doc/spot/trade/Cancel-Order
     * @see https://www.bitget.com/api-doc/spot/plan/Cancel-Plan-Order
     * @see https://www.bitget.com/api-doc/contract/trade/Cancel-Order
     * @see https://www.bitget.com/api-doc/contract/plan/Cancel-Plan-Order
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Cross-Cancel-Order
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Cancel-Order
     * @see https://www.bitget.com/api-doc/uta/trade/Cancel-Order
     * @see https://www.bitget.com/api-doc/uta/strategy/Cancel-Strategy-Order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'isolated' or 'cross' for spot margin trading
     * @param {boolean} [params.trigger] set to true for canceling trigger orders
     * @param {string} [params.planType] *swap only* either profit_plan, loss_plan, normal_plan, pos_profit, pos_loss, moving_plan or track_plan
     * @param {boolean} [params.trailing] set to true if you want to cancel a trailing order
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @param {string} [params.clientOrderId] the clientOrderId of the order, id does not need to be provided if clientOrderId is provided
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let marginMode = undefined;
        let response = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('cancelOrder', params);
        const request: Dict = {};
        const trailing = this.safeValue (params, 'trailing');
        const trigger = this.safeValue2 (params, 'stop', 'trigger');
        params = this.omit (params, [ 'stop', 'trigger', 'trailing' ]);
        if (!(market['spot'] && trigger)) {
            request['symbol'] = market['id'];
        }
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'cancelOrder', 'uta', false);
        const isPlanOrder = trigger || trailing;
        const isContract = market['swap'] || market['future'];
        const isContractTriggerEndpoint = isContract && isPlanOrder && !uta;
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'clientOid');
        if (isContractTriggerEndpoint) {
            const orderIdList = [];
            const orderId: Dict = {};
            if (clientOrderId !== undefined) {
                params = this.omit (params, 'clientOrderId');
                orderId['clientOid'] = clientOrderId;
            } else {
                orderId['orderId'] = id;
            }
            orderIdList.push (orderId);
            request['orderIdList'] = orderIdList;
        } else {
            if (clientOrderId !== undefined) {
                params = this.omit (params, 'clientOrderId');
                request['clientOid'] = clientOrderId;
            } else {
                request['orderId'] = id;
            }
        }
        if (uta) {
            if (trigger) {
                response = await this.privateUtaPostV3TradeCancelStrategyOrder (this.extend (request, params));
            } else {
                response = await this.privateUtaPostV3TradeCancelOrder (this.extend (request, params));
            }
        } else if ((market['swap']) || (market['future'])) {
            let productType = undefined;
            [ productType, params ] = this.handleProductTypeAndParams (market, params);
            request['productType'] = productType;
            if (trailing) {
                const planType = this.safeString (params, 'planType', 'track_plan');
                request['planType'] = planType;
                response = await this.privateMixPostV2MixOrderCancelPlanOrder (this.extend (request, params));
            } else if (trigger) {
                response = await this.privateMixPostV2MixOrderCancelPlanOrder (this.extend (request, params));
            } else {
                response = await this.privateMixPostV2MixOrderCancelOrder (this.extend (request, params));
            }
        } else if (market['spot']) {
            if (marginMode !== undefined) {
                if (marginMode === 'isolated') {
                    response = await this.privateMarginPostV2MarginIsolatedCancelOrder (this.extend (request, params));
                } else if (marginMode === 'cross') {
                    response = await this.privateMarginPostV2MarginCrossedCancelOrder (this.extend (request, params));
                }
            } else {
                if (trigger) {
                    response = await this.privateSpotPostV2SpotTradeCancelPlanOrder (this.extend (request, params));
                } else {
                    response = await this.privateSpotPostV2SpotTradeCancelOrder (this.extend (request, params));
                }
            }
        } else {
            throw new NotSupported (this.id + ' cancelOrder() does not support ' + market['type'] + ' orders');
        }
        //
        // spot, swap, future and spot margin
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
        // swap trigger
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700711311791,
        //         "data": {
        //             "successList": [
        //                 {
        //                     "clientOid": "1111428059067125760",
        //                     "orderId": "1111428059067125761"
        //                 }
        //             ],
        //             "failureList": []
        //         }
        //     }
        //
        // spot trigger
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700711728063,
        //         "data": {
        //             "result": "success"
        //         }
        //     }
        //
        // uta trigger
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": "1753058267399",
        //         "data": null
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        let order = undefined;
        if (isContractTriggerEndpoint) {
            const orderInfo = this.safeValue (data, 'successList', []);
            order = orderInfo[0];
        } else {
            if (uta && trigger) {
                order = response;
            } else {
                order = data;
            }
        }
        return this.parseOrder (order, market);
    }

    async cancelUtaOrders (ids, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        const requestList = [];
        for (let i = 0; i < ids.length; i++) {
            const individualId = ids[i];
            const order: Dict = {
                'orderId': individualId,
                'symbol': market['id'],
                'category': productType,
            };
            requestList.push (order);
        }
        const response = await this.privateUtaPostV3TradeCancelBatch (requestList);
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1752813731517,
        //         "data": [
        //             {
        //                 "orderId": "1329948909442023424",
        //                 "clientOid": "1329948909446217728"
        //             },
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market);
    }

    /**
     * @method
     * @name bitget#cancelOrders
     * @description cancel multiple orders
     * @see https://www.bitget.com/api-doc/spot/trade/Batch-Cancel-Orders
     * @see https://www.bitget.com/api-doc/contract/trade/Batch-Cancel-Orders
     * @see https://www.bitget.com/api-doc/contract/plan/Cancel-Plan-Order
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Cross-Batch-Cancel-Order
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Batch-Cancel-Orders
     * @see https://www.bitget.com/api-doc/uta/trade/Cancel-Batch
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'isolated' or 'cross' for spot margin trading
     * @param {boolean} [params.trigger] *contract only* set to true for canceling trigger orders
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} an array of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders (ids, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'cancelOrders', 'uta', false);
        if (uta) {
            return await this.cancelUtaOrders (ids, symbol, params);
        }
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('cancelOrders', params);
        const trigger = this.safeValue2 (params, 'stop', 'trigger');
        params = this.omit (params, [ 'stop', 'trigger' ]);
        const orderIdList = [];
        for (let i = 0; i < ids.length; i++) {
            const individualId = ids[i];
            const orderId: Dict = {
                'orderId': individualId,
            };
            orderIdList.push (orderId);
        }
        const request: Dict = {
            'symbol': market['id'],
        };
        if (market['spot'] && (marginMode === undefined)) {
            request['orderList'] = orderIdList;
        } else {
            request['orderIdList'] = orderIdList;
        }
        let response = undefined;
        if (market['spot']) {
            if (marginMode !== undefined) {
                if (marginMode === 'cross') {
                    response = await this.privateMarginPostV2MarginCrossedBatchCancelOrder (this.extend (request, params));
                } else {
                    response = await this.privateMarginPostV2MarginIsolatedBatchCancelOrder (this.extend (request, params));
                }
            } else {
                response = await this.privateSpotPostV2SpotTradeBatchCancelOrder (this.extend (request, params));
            }
        } else {
            let productType = undefined;
            [ productType, params ] = this.handleProductTypeAndParams (market, params);
            request['productType'] = productType;
            if (trigger) {
                response = await this.privateMixPostV2MixOrderCancelPlanOrder (this.extend (request, params));
            } else {
                response = await this.privateMixPostV2MixOrderBatchCancelOrders (this.extend (request, params));
            }
        }
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": "1680008815965",
        //         "data": {
        //             "successList": [
        //                 {
        //                     "orderId": "1024598257429823488",
        //                     "clientOid": "876493ce-c287-4bfc-9f4a-8b1905881313"
        //                 },
        //             ],
        //             "failureList": []
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const orders = this.safeList (data, 'successList', []);
        return this.parseOrders (orders, market);
    }

    /**
     * @method
     * @name bitget#cancelAllOrders
     * @description cancel all open orders
     * @see https://www.bitget.com/api-doc/spot/trade/Cancel-Symbol-Orders
     * @see https://www.bitget.com/api-doc/spot/plan/Batch-Cancel-Plan-Order
     * @see https://www.bitget.com/api-doc/contract/trade/Batch-Cancel-Orders
     * @see https://bitgetlimited.github.io/apidoc/en/margin/#isolated-batch-cancel-orders
     * @see https://bitgetlimited.github.io/apidoc/en/margin/#cross-batch-cancel-order
     * @see https://www.bitget.com/api-doc/uta/trade/Cancel-All-Order
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'isolated' or 'cross' for spot margin trading
     * @param {boolean} [params.trigger] *contract only* set to true for canceling trigger orders
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('cancelAllOrders', params);
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        const request: Dict = {
            'symbol': market['id'],
        };
        const trigger = this.safeBool2 (params, 'stop', 'trigger');
        params = this.omit (params, [ 'stop', 'trigger' ]);
        let response = undefined;
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'cancelAllOrders', 'uta', false);
        if (uta) {
            if (productType === 'SPOT') {
                if (marginMode !== undefined) {
                    productType = 'MARGIN';
                }
            }
            request['category'] = productType;
            response = await this.privateUtaPostV3TradeCancelSymbolOrder (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1750751578138,
            //         "data": {
            //             "list": [
            //                 {
            //                     "orderId": "1321313242969427968",
            //                     "clientOid": "1321313242969427969"
            //                 }
            //             ]
            //         }
            //     }
            //
        } else if (market['spot']) {
            if (marginMode !== undefined) {
                if (marginMode === 'cross') {
                    response = await this.privateMarginPostMarginV1CrossOrderBatchCancelOrder (this.extend (request, params));
                } else {
                    response = await this.privateMarginPostMarginV1IsolatedOrderBatchCancelOrder (this.extend (request, params));
                }
                //
                //     {
                //         "code": "00000",
                //         "msg": "success",
                //         "requestTime": 1700717155622,
                //         "data": {
                //             "resultList": [
                //                 {
                //                     "orderId": "1111453253721796609",
                //                     "clientOid": "2ae7fc8a4ff949b6b60d770ca3950e2d"
                //                 },
                //             ],
                //             "failure": []
                //         }
                //     }
                //
            } else {
                if (trigger) {
                    const stopRequest: Dict = {
                        'symbolList': [ market['id'] ],
                    };
                    response = await this.privateSpotPostV2SpotTradeBatchCancelPlanOrder (this.extend (stopRequest, params));
                } else {
                    response = await this.privateSpotPostV2SpotTradeCancelSymbolOrder (this.extend (request, params));
                }
                //
                //     {
                //         "code": "00000",
                //         "msg": "success",
                //         "requestTime": 1700716953996,
                //         "data": {
                //             "symbol": "BTCUSDT"
                //         }
                //     }
                //
                const timestamp = this.safeInteger (response, 'requestTime');
                const responseData = this.safeDict (response, 'data');
                const marketId = this.safeString (responseData, 'symbol');
                return [
                    this.safeOrder ({
                        'info': response,
                        'symbol': this.safeSymbol (marketId, undefined, undefined, 'spot'),
                        'timestamp': timestamp,
                        'datetime': this.iso8601 (timestamp),
                    }),
                ];
            }
        } else {
            request['productType'] = productType;
            if (trigger) {
                response = await this.privateMixPostV2MixOrderCancelPlanOrder (this.extend (request, params));
            } else {
                response = await this.privateMixPostV2MixOrderBatchCancelOrders (this.extend (request, params));
            }
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": "1680008815965",
            //         "data": {
            //             "successList": [
            //                 {
            //                     "orderId": "1024598257429823488",
            //                     "clientOid": "876493ce-c287-4bfc-9f4a-8b1905881313"
            //                 },
            //             ],
            //             "failureList": []
            //         }
            //     }
        }
        const data = this.safeDict (response, 'data');
        const resultList = this.safeListN (data, [ 'resultList', 'successList', 'list' ]);
        const failureList = this.safeList2 (data, 'failure', 'failureList');
        let responseList = undefined;
        if ((resultList !== undefined) && (failureList !== undefined)) {
            responseList = this.arrayConcat (resultList, failureList);
        } else {
            responseList = resultList;
        }
        return this.parseOrders (responseList);
    }

    /**
     * @method
     * @name bitget#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://www.bitget.com/api-doc/spot/trade/Get-Order-Info
     * @see https://www.bitget.com/api-doc/contract/trade/Get-Order-Details
     * @see https://www.bitget.com/api-doc/uta/trade/Get-Order-Details
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @param {string} [params.clientOrderId] the clientOrderId of the order, id does not need to be provided if clientOrderId is provided
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            // 'orderId': id,
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'clientOid');
        if (clientOrderId !== undefined) {
            params = this.omit (params, [ 'clientOrderId' ]);
            request['clientOid'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        let response = undefined;
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchOrder', 'uta', false);
        if (uta) {
            response = await this.privateUtaGetV3TradeOrderInfo (this.extend (request, params));
        } else if (market['spot']) {
            response = await this.privateSpotGetV2SpotTradeOrderInfo (this.extend (request, params));
        } else if (market['swap'] || market['future']) {
            request['symbol'] = market['id'];
            let productType = undefined;
            [ productType, params ] = this.handleProductTypeAndParams (market, params);
            request['productType'] = productType;
            response = await this.privateMixGetV2MixOrderDetail (this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchOrder() does not support ' + market['type'] + ' orders');
        }
        //
        // spot
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700719076263,
        //         "data": [
        //             {
        //                 "userId": "7264631750",
        //                 "symbol": "BTCUSDT",
        //                 "orderId": "1111461743123927040",
        //                 "clientOid": "63f95110-93b5-4309-8f77-46339f1bcf3c",
        //                 "price": "25000.0000000000000000",
        //                 "size": "0.0002000000000000",
        //                 "orderType": "limit",
        //                 "side": "buy",
        //                 "status": "live",
        //                 "priceAvg": "0",
        //                 "baseVolume": "0.0000000000000000",
        //                 "quoteVolume": "0.0000000000000000",
        //                 "enterPointSource": "API",
        //                 "feeDetail": "",
        //                 "orderSource": "normal",
        //                 "cTime": "1700719050198",
        //                 "uTime": "1700719050198"
        //             }
        //         ]
        //     }
        //
        // swap and future
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700719918781,
        //         "data": {
        //             "symbol": "BTCUSDT",
        //             "size": "0.001",
        //             "orderId": "1111465253393825792",
        //             "clientOid": "1111465253431574529",
        //             "baseVolume": "0",
        //             "fee": "0",
        //             "price": "27000",
        //             "priceAvg": "",
        //             "state": "live",
        //             "side": "buy",
        //             "force": "gtc",
        //             "totalProfits": "0",
        //             "posSide": "long",
        //             "marginCoin": "USDT",
        //             "presetStopSurplusPrice": "",
        //             "presetStopLossPrice": "",
        //             "quoteVolume": "0",
        //             "orderType": "limit",
        //             "leverage": "20",
        //             "marginMode": "crossed",
        //             "reduceOnly": "NO",
        //             "enterPointSource": "API",
        //             "tradeSide": "open",
        //             "posMode": "hedge_mode",
        //             "orderSource": "normal",
        //             "cTime": "1700719887120",
        //             "uTime": "1700719887120"
        //         }
        //     }
        //
        // uta
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1750496858333,
        //         "data": {
        //             "orderId": "1320244799629316096",
        //             "clientOid": "1320244799633510400",
        //             "category": "USDT-FUTURES",
        //             "symbol": "BTCUSDT",
        //             "orderType": "limit",
        //             "side": "buy",
        //             "price": "50000",
        //             "qty": "0.001",
        //             "amount": "0",
        //             "cumExecQty": "0",
        //             "cumExecValue": "0",
        //             "avgPrice": "0",
        //             "timeInForce": "gtc",
        //             "orderStatus": "live",
        //             "posSide": "long",
        //             "holdMode": "hedge_mode",
        //             "reduceOnly": "NO",
        //             "feeDetail": [{
        //                 "feeCoin": "",
        //                 "fee": ""
        //             }],
        //             "createdTime": "1750496809871",
        //             "updatedTime": "1750496809886",
        //             "cancelReason": "",
        //             "execType": "normal",
        //             "stpMode": "none",
        //             "tpTriggerBy": null,
        //             "slTriggerBy": null,
        //             "takeProfit": null,
        //             "stopLoss": null,
        //             "tpOrderType": null,
        //             "slOrderType": null,
        //             "tpLimitPrice": null,
        //             "slLimitPrice": null
        //         }
        //     }
        //
        if (!uta && (typeof response === 'string')) {
            response = JSON.parse (response);
        }
        const data = this.safeDict (response, 'data');
        if ((data !== undefined)) {
            if (!Array.isArray (data)) {
                return this.parseOrder (data, market);
            }
        }
        const dataList = this.safeList (response, 'data', []);
        const dataListLength = dataList.length;
        if (dataListLength === 0) {
            throw new OrderNotFound (this.id + ' fetchOrder() could not find order id ' + id + ' in ' + this.json (response));
        }
        const first = this.safeDict (dataList, 0, {});
        return this.parseOrder (first, market);
        // const first = this.safeDict (data, 0, data);
        // return this.parseOrder (first, market);
    }

    /**
     * @method
     * @name bitget#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://www.bitget.com/api-doc/spot/trade/Get-Unfilled-Orders
     * @see https://www.bitget.com/api-doc/spot/plan/Get-Current-Plan-Order
     * @see https://www.bitget.com/api-doc/contract/trade/Get-Orders-Pending
     * @see https://www.bitget.com/api-doc/contract/plan/get-orders-plan-pending
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Open-Orders
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Open-Orders
     * @see https://www.bitget.com/api-doc/uta/strategy/Get-Unfilled-Strategy-Orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {string} [params.planType] *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan'
     * @param {boolean} [params.trigger] set to true for fetching trigger orders
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.isPlan] *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan'
     * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        let type = undefined;
        let request: Dict = {};
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchOpenOrders', params);
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'uta', false);
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            const defaultType = this.safeString2 (this.options, 'fetchOpenOrders', 'defaultType', 'spot');
            const marketType = ('type' in market) ? market['type'] : defaultType;
            type = this.safeString (params, 'type', marketType);
        } else {
            const defaultType = this.safeString2 (this.options, 'fetchOpenOrders', 'defaultType', 'spot');
            type = this.safeString (params, 'type', defaultType);
        }
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'paginate');
        if (paginate) {
            let cursorReceived = undefined;
            let cursorSent = undefined;
            if (uta) {
                cursorReceived = 'cursor';
                cursorSent = 'cursor';
            } else if (type === 'spot') {
                if (marginMode !== undefined) {
                    cursorReceived = 'minId';
                    cursorSent = 'idLessThan';
                }
            } else {
                cursorReceived = 'endId';
                cursorSent = 'idLessThan';
            }
            return await this.fetchPaginatedCallCursor ('fetchOpenOrders', symbol, since, limit, params, cursorReceived, cursorSent) as Order[];
        }
        let response = undefined;
        const trailing = this.safeBool (params, 'trailing');
        const trigger = this.safeBool2 (params, 'stop', 'trigger');
        const planTypeDefined = this.safeString (params, 'planType') !== undefined;
        const isTrigger = (trigger || planTypeDefined);
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (!uta && ((type === 'swap') || (type === 'future') || (marginMode !== undefined))) {
            const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId');
            params = this.omit (params, 'clientOrderId');
            if (clientOrderId !== undefined) {
                request['clientOid'] = clientOrderId;
            }
        }
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        params = this.omit (params, [ 'type', 'stop', 'trigger', 'trailing' ]);
        if (uta) {
            if (type === 'spot') {
                if (marginMode !== undefined) {
                    productType = 'MARGIN';
                }
            }
            request['category'] = productType;
            if (trigger) {
                response = await this.privateUtaGetV3TradeUnfilledStrategyOrders (this.extend (request, params));
            } else {
                response = await this.privateUtaGetV3TradeUnfilledOrders (this.extend (request, params));
            }
        } else if (type === 'spot') {
            if (marginMode !== undefined) {
                if (since === undefined) {
                    since = this.milliseconds () - 7776000000;
                    request['startTime'] = since;
                }
                if (marginMode === 'isolated') {
                    response = await this.privateMarginGetV2MarginIsolatedOpenOrders (this.extend (request, params));
                } else if (marginMode === 'cross') {
                    response = await this.privateMarginGetV2MarginCrossedOpenOrders (this.extend (request, params));
                }
            } else {
                if (trigger) {
                    response = await this.privateSpotGetV2SpotTradeCurrentPlanOrder (this.extend (request, params));
                } else {
                    response = await this.privateSpotGetV2SpotTradeUnfilledOrders (this.extend (request, params));
                }
            }
        } else {
            request['productType'] = productType;
            if (trailing) {
                const planType = this.safeString (params, 'planType', 'track_plan');
                request['planType'] = planType;
                response = await this.privateMixGetV2MixOrderOrdersPlanPending (this.extend (request, params));
            } else if (isTrigger) {
                const planType = this.safeString (params, 'planType', 'normal_plan');
                request['planType'] = planType;
                response = await this.privateMixGetV2MixOrderOrdersPlanPending (this.extend (request, params));
            } else {
                response = await this.privateMixGetV2MixOrderOrdersPending (this.extend (request, params));
            }
        }
        //
        // spot
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700728123994,
        //         "data": [
        //             {
        //                 "userId": "7264631750",
        //                 "symbol": "BTCUSDT",
        //                 "orderId": "1111499608327360513",
        //                 "clientOid": "d0d4dad5-18d0-4869-a074-ec40bb47cba6",
        //                 "priceAvg": "25000.0000000000000000",
        //                 "size": "0.0002000000000000",
        //                 "orderType": "limit",
        //                 "side": "buy",
        //                 "status": "live",
        //                 "basePrice": "0",
        //                 "baseVolume": "0.0000000000000000",
        //                 "quoteVolume": "0.0000000000000000",
        //                 "enterPointSource": "WEB",
        //                 "orderSource": "normal",
        //                 "cTime": "1700728077966",
        //                 "uTime": "1700728077966"
        //             }
        //         ]
        //     }
        //
        // spot stop
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700729361609,
        //         "data": {
        //             "nextFlag": false,
        //             "idLessThan": "1111503385931620352",
        //             "orderList": [
        //                 {
        //                     "orderId": "1111503385931620352",
        //                     "clientOid": "1111503385910648832",
        //                     "symbol": "BTCUSDT",
        //                     "size": "0.0002",
        //                     "planType": "AMOUNT",
        //                     "executePrice": "25000",
        //                     "triggerPrice": "26000",
        //                     "status": "live",
        //                     "orderType": "limit",
        //                     "side": "buy",
        //                     "triggerType": "fill_price",
        //                     "enterPointSource": "API",
        //                     "cTime": "1700728978617",
        //                     "uTime": "1700728978617"
        //                 }
        //             ]
        //         }
        //     }
        //
        // spot margin
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700729887686,
        //         "data": {
        //             "orderList": [
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "orderType": "limit",
        //                     "enterPointSource": "WEB",
        //                     "orderId": "1111506377509580801",
        //                     "clientOid": "2043a3b59a60445f9d9f7365bf3e960c",
        //                     "loanType": "autoLoanAndRepay",
        //                     "price": "25000",
        //                     "side": "buy",
        //                     "status": "live",
        //                     "baseSize": "0.0002",
        //                     "quoteSize": "5",
        //                     "priceAvg": "0",
        //                     "size": "0",
        //                     "amount": "0",
        //                     "force": "gtc",
        //                     "cTime": "1700729691866",
        //                     "uTime": "1700729691866"
        //                 }
        //             ],
        //             "maxId": "1111506377509580801",
        //             "minId": "1111506377509580801"
        //         }
        //     }
        //
        // swap and future
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700725609065,
        //         "data": {
        //             "entrustedList": [
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "size": "0.002",
        //                     "orderId": "1111488897767604224",
        //                     "clientOid": "1111488897805352960",
        //                     "baseVolume": "0",
        //                     "fee": "0",
        //                     "price": "25000",
        //                     "priceAvg": "",
        //                     "status": "live",
        //                     "side": "buy",
        //                     "force": "gtc",
        //                     "totalProfits": "0",
        //                     "posSide": "long",
        //                     "marginCoin": "USDT",
        //                     "quoteVolume": "0",
        //                     "leverage": "20",
        //                     "marginMode": "crossed",
        //                     "enterPointSource": "web",
        //                     "tradeSide": "open",
        //                     "posMode": "hedge_mode",
        //                     "orderType": "limit",
        //                     "orderSource": "normal",
        //                     "presetStopSurplusPrice": "",
        //                     "presetStopLossPrice": "",
        //                     "reduceOnly": "NO",
        //                     "cTime": "1700725524378",
        //                     "uTime": "1700725524378"
        //                 }
        //             ],
        //             "endId": "1111488897767604224"
        //         }
        //     }
        //
        // swap and future stop
        //
        //     {
        //         "code": "00000",\
        //         "msg": "success",
        //         "requestTime": 1700726417495,
        //         "data": {
        //             "entrustedList": [
        //                 {
        //                     "planType": "normal_plan",
        //                     "symbol": "BTCUSDT",
        //                     "size": "0.001",
        //                     "orderId": "1111491399869075457",
        //                     "clientOid": "1111491399869075456",
        //                     "price": "27000",
        //                     "callbackRatio": "",
        //                     "triggerPrice": "24000",
        //                     "triggerType": "mark_price",
        //                     "planStatus": "live",
        //                     "side": "buy",
        //                     "posSide": "long",
        //                     "marginCoin": "USDT",
        //                     "marginMode": "crossed",
        //                     "enterPointSource": "API",
        //                     "tradeSide": "open",
        //                     "posMode": "hedge_mode",
        //                     "orderType": "limit",
        //                     "stopSurplusTriggerPrice": "",
        //                     "stopSurplusExecutePrice": "",
        //                     "stopSurplusTriggerType": "fill_price",
        //                     "stopLossTriggerPrice": "",
        //                     "stopLossExecutePrice": "",
        //                     "stopLossTriggerType": "fill_price",
        //                     "cTime": "1700726120917",
        //                     "uTime": "1700726120917"
        //                 }
        //             ],
        //             "endId": "1111491399869075457"
        //         }
        //     }
        //
        // uta
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1750753395850,
        //         "data": {
        //             "list": [
        //                 {
        //                     "orderId": "1321320757371228160",
        //                     "clientOid": "1321320757371228161",
        //                     "category": "USDT-FUTURES",
        //                     "symbol": "BTCUSDT",
        //                     "orderType": "limit",
        //                     "side": "buy",
        //                     "price": "50000",
        //                     "qty": "0.001",
        //                     "amount": "0",
        //                     "cumExecQty": "0",
        //                     "cumExecValue": "0",
        //                     "avgPrice": "0",
        //                     "timeInForce": "gtc",
        //                     "orderStatus": "live",
        //                     "posSide": "long",
        //                     "holdMode": "hedge_mode",
        //                     "reduceOnly": "NO",
        //                     "feeDetail": [
        //                         {
        //                             "feeCoin": "",
        //                             "fee": ""
        //                         }
        //                     ],
        //                     "createdTime": "1750753338186",
        //                     "updatedTime": "1750753338203",
        //                     "stpMode": "none",
        //                     "tpTriggerBy": null,
        //                     "slTriggerBy": null,
        //                     "takeProfit": null,
        //                     "stopLoss": null,
        //                     "tpOrderType": null,
        //                     "slOrderType": null,
        //                     "tpLimitPrice": null,
        //                     "slLimitPrice": null
        //                 }
        //             ],
        //             "cursor": "1321320757371228160"
        //         }
        //     }
        //
        // uta trigger
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1753057527060,
        //         "data": [
        //             {
        //                 "orderId": "1330984742276198400",
        //                 "clientOid": "1330984742276198400",
        //                 "symbol": "BTCUSDT",
        //                 "category": "USDT-FUTURES",
        //                 "qty": "0.001",
        //                 "posSide": "long",
        //                 "tpTriggerBy": "market",
        //                 "slTriggerBy": "mark",
        //                 "takeProfit": "",
        //                 "stopLoss":"114000",
        //                 "tpOrderType": "market",
        //                 "slOrderType": "limit",
        //                 "tpLimitPrice": "",
        //                 "slLimitPrice": "113000",
        //                 "createdTime": "1753057411736",
        //                 "updatedTime": "1753057411747"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        if (uta) {
            let result = undefined;
            if (trigger) {
                result = this.safeList (response, 'data', []);
            } else {
                result = this.safeList (data, 'list', []);
            }
            return this.parseOrders (result, market, since, limit);
        } else if (type === 'spot') {
            if ((marginMode !== undefined) || trigger) {
                const resultList = this.safeList (data, 'orderList', []);
                return this.parseOrders (resultList, market, since, limit);
            }
        } else {
            const result = this.safeList (data, 'entrustedList', []);
            return this.parseOrders (result, market, since, limit);
        }
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name bitget#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
     * @see https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
     * @see https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
     * @see https://www.bitget.com/api-doc/contract/plan/orders-plan-history
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
     * @see https://www.bitget.com/api-doc/uta/trade/Get-Order-History
     * @param {string} symbol unified market symbol of the closed orders
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the max number of closed orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {string} [params.planType] *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan'
     * @param {boolean} [params.trigger] set to true for fetching trigger orders
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.isPlan] *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan'
     * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const orders = await this.fetchCanceledAndClosedOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed') as Order[];
    }

    /**
     * @method
     * @name bitget#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
     * @see https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
     * @see https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
     * @see https://www.bitget.com/api-doc/contract/plan/orders-plan-history
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
     * @see https://www.bitget.com/api-doc/uta/trade/Get-Order-History
     * @param {string} symbol unified market symbol of the canceled orders
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the max number of canceled orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {string} [params.planType] *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan'
     * @param {boolean} [params.trigger] set to true for fetching trigger orders
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.isPlan] *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan'
     * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const orders = await this.fetchCanceledAndClosedOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'canceled') as Order[];
    }

    /**
     * @method
     * @name bitget#fetchCanceledAndClosedOrders
     * @see https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
     * @see https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
     * @see https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
     * @see https://www.bitget.com/api-doc/contract/plan/orders-plan-history
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
     * @see https://www.bitget.com/api-doc/uta/trade/Get-Order-History
     * @see https://www.bitget.com/api-doc/uta/strategy/Get-History-Strategy-Orders
     * @description fetches information on multiple canceled and closed orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {string} [params.planType] *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan'
     * @param {boolean} [params.trigger] set to true for fetching trigger orders
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.isPlan] *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan'
     * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchCanceledAndClosedOrders', 'uta', false);
        if (uta) {
            return await this.fetchUtaCanceledAndClosedOrders (symbol, since, limit, params);
        }
        await this.loadMarkets ();
        let market = undefined;
        let request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchCanceledAndClosedOrders', market, params);
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchCanceledAndClosedOrders', params);
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchCanceledAndClosedOrders', 'paginate');
        if (paginate) {
            let cursorReceived = undefined;
            if (marketType === 'spot') {
                if (marginMode !== undefined) {
                    cursorReceived = 'minId';
                }
            } else {
                cursorReceived = 'endId';
            }
            return await this.fetchPaginatedCallCursor ('fetchCanceledAndClosedOrders', symbol, since, limit, params, cursorReceived, 'idLessThan') as Order[];
        }
        let response = undefined;
        const trailing = this.safeBool (params, 'trailing');
        const trigger = this.safeBool2 (params, 'stop', 'trigger');
        params = this.omit (params, [ 'stop', 'trigger', 'trailing' ]);
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if ((marketType === 'swap') || (marketType === 'future') || (marginMode !== undefined)) {
            const clientOrderId = this.safeString2 (params, 'clientOid', 'clientOrderId');
            params = this.omit (params, 'clientOrderId');
            if (clientOrderId !== undefined) {
                request['clientOid'] = clientOrderId;
            }
        }
        const now = this.milliseconds ();
        if (marketType === 'spot') {
            if (marginMode !== undefined) {
                if (since === undefined) {
                    since = now - 7776000000;
                    request['startTime'] = since;
                }
                if (marginMode === 'isolated') {
                    response = await this.privateMarginGetV2MarginIsolatedHistoryOrders (this.extend (request, params));
                } else if (marginMode === 'cross') {
                    response = await this.privateMarginGetV2MarginCrossedHistoryOrders (this.extend (request, params));
                }
            } else if (trigger) {
                if (symbol === undefined) {
                    throw new ArgumentsRequired (this.id + ' fetchCanceledAndClosedOrders() requires a symbol argument');
                }
                const endTime = this.safeIntegerN (params, [ 'endTime', 'until' ]);
                params = this.omit (params, [ 'until' ]);
                if (since === undefined) {
                    since = now - 7776000000;
                    request['startTime'] = since;
                }
                if (endTime === undefined) {
                    request['endTime'] = now;
                }
                response = await this.privateSpotGetV2SpotTradeHistoryPlanOrder (this.extend (request, params));
            } else {
                response = await this.privateSpotGetV2SpotTradeHistoryOrders (this.extend (request, params));
            }
        } else {
            let productType = undefined;
            [ productType, params ] = this.handleProductTypeAndParams (market, params);
            request['productType'] = productType;
            const planTypeDefined = this.safeString (params, 'planType') !== undefined;
            if (trailing) {
                const planType = this.safeString (params, 'planType', 'track_plan');
                request['planType'] = planType;
                response = await this.privateMixGetV2MixOrderOrdersPlanHistory (this.extend (request, params));
            } else if (trigger || planTypeDefined) {
                const planType = this.safeString (params, 'planType', 'normal_plan');
                request['planType'] = planType;
                response = await this.privateMixGetV2MixOrderOrdersPlanHistory (this.extend (request, params));
            } else {
                response = await this.privateMixGetV2MixOrderOrdersHistory (this.extend (request, params));
            }
        }
        //
        // spot
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700791085380,
        //         "data": [
        //             {
        //                 "userId": "7264631750",
        //                 "symbol": "BTCUSDT",
        //                 "orderId": "1111499608327360513",
        //                 "clientOid": "d0d4dad5-18d0-4869-a074-ec40bb47cba6",
        //                 "price": "25000.0000000000000000",
        //                 "size": "0.0002000000000000",
        //                 "orderType": "limit",
        //                 "side": "buy",
        //                 "status": "cancelled",
        //                 "priceAvg": "0",
        //                 "baseVolume": "0.0000000000000000",
        //                 "quoteVolume": "0.0000000000000000",
        //                 "enterPointSource": "WEB",
        //                 "feeDetail": "",
        //                 "orderSource": "normal",
        //                 "cTime": "1700728077966",
        //                 "uTime": "1700728911471"
        //             },
        //         ]
        //     }
        //
        // spot stop
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700792099146,
        //         "data": {
        //             "nextFlag": false,
        //             "idLessThan": "1098757597417775104",
        //             "orderList": [
        //                 {
        //                     "orderId": "1111503385931620352",
        //                     "clientOid": "1111503385910648832",
        //                     "symbol": "BTCUSDT",
        //                     "size": "0.0002",
        //                     "planType": "AMOUNT",
        //                     "executePrice": "25000",
        //                     "triggerPrice": "26000",
        //                     "status": "cancelled",
        //                     "orderType": "limit",
        //                     "side": "buy",
        //                     "triggerType": "fill_price",
        //                     "enterPointSource": "API",
        //                     "cTime": "1700728978617",
        //                     "uTime": "1700729666868"
        //                 },
        //             ]
        //         }
        //     }
        //
        // spot margin
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700792381435,
        //         "data": {
        //             "orderList": [
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "orderType": "limit",
        //                     "enterPointSource": "WEB",
        //                     "orderId": "1111456274707001345",
        //                     "clientOid": "41e428dd305a4f668671b7f1ed00dc50",
        //                     "loanType": "autoLoanAndRepay",
        //                     "price": "27000",
        //                     "side": "buy",
        //                     "status": "cancelled",
        //                     "baseSize": "0.0002",
        //                     "quoteSize": "5.4",
        //                     "priceAvg": "0",
        //                     "size": "0",
        //                     "amount": "0",
        //                     "force": "gtc",
        //                     "cTime": "1700717746427",
        //                     "uTime": "1700717780636"
        //                 },
        //             ],
        //             "maxId": "1111456274707001345",
        //             "minId": "1098396464990269440"
        //         }
        //     }
        //
        // swap and future
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700792674673,
        //         "data": {
        //             "entrustedList": [
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "size": "0.002",
        //                     "orderId": "1111498800817143808",
        //                     "clientOid": "1111498800850698240",
        //                     "baseVolume": "0",
        //                     "fee": "0",
        //                     "price": "25000",
        //                     "priceAvg": "",
        //                     "status": "canceled",
        //                     "side": "buy",
        //                     "force": "gtc",
        //                     "totalProfits": "0",
        //                     "posSide": "long",
        //                     "marginCoin": "USDT",
        //                     "quoteVolume": "0",
        //                     "leverage": "20",
        //                     "marginMode": "crossed",
        //                     "enterPointSource": "web",
        //                     "tradeSide": "open",
        //                     "posMode": "hedge_mode",
        //                     "orderType": "limit",
        //                     "orderSource": "normal",
        //                     "presetStopSurplusPrice": "",
        //                     "presetStopLossPrice": "",
        //                     "reduceOnly": "NO",
        //                     "cTime": "1700727885449",
        //                     "uTime": "1700727944563"
        //                 },
        //             ],
        //             "endId": "1098397008323575809"
        //         }
        //     }
        //
        // swap and future stop
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700792938359,
        //         "data": {
        //             "entrustedList": [
        //                 {
        //                     "planType": "normal_plan",
        //                     "symbol": "BTCUSDT",
        //                     "size": "0.001",
        //                     "orderId": "1111491399869075457",
        //                     "clientOid": "1111491399869075456",
        //                     "planStatus": "cancelled",
        //                     "price": "27000",
        //                     "feeDetail": null,
        //                     "baseVolume": "0",
        //                     "callbackRatio": "",
        //                     "triggerPrice": "24000",
        //                     "triggerType": "mark_price",
        //                     "side": "buy",
        //                     "posSide": "long",
        //                     "marginCoin": "USDT",
        //                     "marginMode": "crossed",
        //                     "enterPointSource": "API",
        //                     "tradeSide": "open",
        //                     "posMode": "hedge_mode",
        //                     "orderType": "limit",
        //                     "stopSurplusTriggerPrice": "",
        //                     "stopSurplusExecutePrice": "",
        //                     "stopSurplusTriggerType": "fill_price",
        //                     "stopLossTriggerPrice": "",
        //                     "stopLossExecutePrice": "",
        //                     "stopLossTriggerType": "fill_price",
        //                     "cTime": "1700726120917",
        //                     "uTime": "1700727879652"
        //                 },
        //             ],
        //             "endId": "1098760007867502593"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        if (marketType === 'spot') {
            if ((marginMode !== undefined) || trigger) {
                return this.parseOrders (this.safeValue (data, 'orderList', []), market, since, limit);
            }
        } else {
            return this.parseOrders (this.safeValue (data, 'entrustedList', []), market, since, limit);
        }
        if (typeof response === 'string') {
            response = JSON.parse (response);
        }
        const orders = this.safeList (response, 'data', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchUtaCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        if (productType === 'SPOT') {
            let marginMode = undefined;
            [ marginMode, params ] = this.handleMarginModeAndParams ('fetchCanceledAndClosedOrders', params);
            if (marginMode !== undefined) {
                productType = 'MARGIN';
            }
        }
        let request: Dict = {
            'category': productType,
        };
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchCanceledAndClosedOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchCanceledAndClosedOrders', symbol, since, limit, params, 'cursor', 'cursor') as Order[];
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        const trigger = this.safeBool2 (params, 'stop', 'trigger');
        params = this.omit (params, [ 'stop', 'trigger' ]);
        if (trigger) {
            response = await this.privateUtaGetV3TradeHistoryStrategyOrders (this.extend (request, params));
        } else {
            response = await this.privateUtaGetV3TradeHistoryOrders (this.extend (request, params));
        }
        //
        // uta
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1752531592855,
        //         "data": {
        //             "list": [
        //                 {
        //                     "orderId": "1322441400976261120",
        //                     "clientOid": "1322441400976261121",
        //                     "category": "USDT-FUTURES",
        //                     "symbol": "BTCUSDT",
        //                     "orderType": "market",
        //                     "side": "sell",
        //                     "price": "0",
        //                     "qty": "0.0001",
        //                     "amount": "0",
        //                     "cumExecQty": "0.0001",
        //                     "cumExecValue": "10.7005",
        //                     "avgPrice": "107005.4",
        //                     "timeInForce": "gtc",
        //                     "orderStatus": "filled",
        //                     "posSide": "long",
        //                     "holdMode": "hedge_mode",
        //                     "reduceOnly": "NO",
        //                     "feeDetail": [
        //                         {
        //                             "feeCoin": "USDT",
        //                             "fee": "0.00642032"
        //                         }
        //                     ],
        //                     "createdTime": "1751020520442",
        //                     "updatedTime": "1751020520457",
        //                     "cancelReason": "",
        //                     "execType": "normal",
        //                     "stpMode": "none",
        //                     "tpTriggerBy": null,
        //                     "slTriggerBy": null,
        //                     "takeProfit": null,
        //                     "stopLoss": null,
        //                     "tpOrderType": null,
        //                     "slOrderType": null,
        //                     "tpLimitPrice": null,
        //                     "slLimitPrice": null
        //                 },
        //             ],
        //             "cursor": "1322441328637100035"
        //         }
        //     }
        //
        // uta trigger
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1753058447920,
        //         "data": {
        //             "list": [
        //                 {
        //                     "orderId": "1330984742276198400",
        //                     "clientOid": "1330984742276198400",
        //                     "symbol": "BTCUSDT",
        //                     "category": "USDT-FUTURES",
        //                     "qty": "0.001",
        //                     "posSide": "long",
        //                     "tpTriggerBy": "market",
        //                     "slTriggerBy": "mark",
        //                     "takeProfit": "",
        //                     "stopLoss": "112000",
        //                     "tpOrderType": "market",
        //                     "slOrderType": "limit",
        //                     "tpLimitPrice": "",
        //                     "slLimitPrice": "111000",
        //                     "createdTime": "1753057411736",
        //                     "updatedTime": "1753058267412"
        //                 },
        //             ],
        //             "cursor": 1330960754317619202
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const orders = this.safeList (data, 'list', []);
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name bitget#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://www.bitget.com/api-doc/spot/account/Get-Account-Bills
     * @see https://www.bitget.com/api-doc/contract/account/Get-Account-Bill
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @param {string} [params.symbol] *contract only* unified market symbol
     * @param {string} [params.productType] *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        await this.loadMarkets ();
        const symbol = this.safeString (params, 'symbol');
        params = this.omit (params, 'symbol');
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchLedger', market, params);
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchLedger', 'paginate');
        if (paginate) {
            let cursorReceived = undefined;
            if (marketType !== 'spot') {
                cursorReceived = 'endId';
            }
            return await this.fetchPaginatedCallCursor ('fetchLedger', symbol, since, limit, params, cursorReceived, 'idLessThan') as LedgerEntry[];
        }
        let currency = undefined;
        let request: Dict = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateSpotGetV2SpotAccountBills (this.extend (request, params));
        } else {
            if (symbol !== undefined) {
                request['symbol'] = market['id'];
            }
            let productType = undefined;
            [ productType, params ] = this.handleProductTypeAndParams (market, params);
            request['productType'] = productType;
            response = await this.privateMixGetV2MixAccountBill (this.extend (request, params));
        }
        //
        // spot
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700795836415,
        //         "data": [
        //             {
        //                 "billId": "1111506298997215233",
        //                 "coin": "USDT",
        //                 "groupType": "transfer",
        //                 "businessType": "transfer_out",
        //                 "size": "-11.64958799",
        //                 "balance": "0.00000000",
        //                 "fees": "0.00000000",
        //                 "cTime": "1700729673028"
        //             },
        //         ]
        //     }
        //
        // swap and future
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700795977890,
        //         "data": {
        //             "bills": [
        //                 {
        //                     "billId": "1111499428100472833",
        //                     "symbol": "",
        //                     "amount": "-11.64958799",
        //                     "fee": "0",
        //                     "feeByCoupon": "",
        //                     "businessType": "trans_to_exchange",
        //                     "coin": "USDT",
        //                     "cTime": "1700728034996"
        //                 },
        //             ],
        //             "endId": "1098396773329305606"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        if ((marketType === 'swap') || (marketType === 'future')) {
            const bills = this.safeValue (data, 'bills', []);
            return this.parseLedger (bills, currency, since, limit);
        }
        return this.parseLedger (data, currency, since, limit);
    }

    parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        //
        // spot
        //
        //     {
        //         "billId": "1111506298997215233",
        //         "coin": "USDT",
        //         "groupType": "transfer",
        //         "businessType": "transfer_out",
        //         "size": "-11.64958799",
        //         "balance": "0.00000000",
        //         "fees": "0.00000000",
        //         "cTime": "1700729673028"
        //     }
        //
        // swap and future
        //
        //     {
        //         "billId": "1111499428100472833",
        //         "symbol": "",
        //         "amount": "-11.64958799",
        //         "fee": "0",
        //         "feeByCoupon": "",
        //         "businessType": "trans_to_exchange",
        //         "coin": "USDT",
        //         "cTime": "1700728034996"
        //     }
        //
        const currencyId = this.safeString (item, 'coin');
        const code = this.safeCurrencyCode (currencyId, currency);
        currency = this.safeCurrency (currencyId, currency);
        const timestamp = this.safeInteger (item, 'cTime');
        const after = this.safeNumber (item, 'balance');
        const fee = this.safeNumber2 (item, 'fees', 'fee');
        const amountRaw = this.safeString2 (item, 'size', 'amount');
        const amount = this.parseNumber (Precise.stringAbs (amountRaw));
        let direction = 'in';
        if (amountRaw.indexOf ('-') >= 0) {
            direction = 'out';
        }
        return this.safeLedgerEntry ({
            'info': item,
            'id': this.safeString (item, 'billId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': direction,
            'account': undefined,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': this.parseLedgerType (this.safeString (item, 'businessType')),
            'currency': code,
            'amount': amount,
            'before': undefined,
            'after': after,
            'status': undefined,
            'fee': {
                'currency': code,
                'cost': fee,
            },
        }, currency) as LedgerEntry;
    }

    parseLedgerType (type) {
        const types: Dict = {
            'trans_to_cross': 'transfer',
            'trans_from_cross': 'transfer',
            'trans_to_exchange': 'transfer',
            'trans_from_exchange': 'transfer',
            'trans_to_isolated': 'transfer',
            'trans_from_isolated': 'transfer',
            'trans_to_contract': 'transfer',
            'trans_from_contract': 'transfer',
            'trans_to_otc': 'transfer',
            'trans_from_otc': 'transfer',
            'open_long': 'trade',
            'close_long': 'trade',
            'open_short': 'trade',
            'close_short': 'trade',
            'force_close_long': 'trade',
            'force_close_short': 'trade',
            'burst_long_loss_query': 'trade',
            'burst_short_loss_query': 'trade',
            'force_buy': 'trade',
            'force_sell': 'trade',
            'burst_buy': 'trade',
            'burst_sell': 'trade',
            'delivery_long': 'settlement',
            'delivery_short': 'settlement',
            'contract_settle_fee': 'fee',
            'append_margin': 'transaction',
            'adjust_down_lever_append_margin': 'transaction',
            'reduce_margin': 'transaction',
            'auto_append_margin': 'transaction',
            'cash_gift_issue': 'cashback',
            'cash_gift_recycle': 'cashback',
            'bonus_issue': 'rebate',
            'bonus_recycle': 'rebate',
            'bonus_expired': 'rebate',
            'transfer_in': 'transfer',
            'transfer_out': 'transfer',
            'deposit': 'deposit',
            'withdraw': 'withdrawal',
            'buy': 'trade',
            'sell': 'trade',
        };
        return this.safeString (types, type, type);
    }

    /**
     * @method
     * @name bitget#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://www.bitget.com/api-doc/spot/trade/Get-Fills
     * @see https://www.bitget.com/api-doc/contract/trade/Get-Order-Fills
     * @see https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-Fills
     * @see https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Transaction-Details
     * @see https://www.bitget.com/api-doc/uta/trade/Get-Order-Fills
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'uta', false);
        if (!uta && (symbol === undefined)) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request: Dict = {};
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let paginate = false;
        let marginMode = undefined;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate');
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchMyTrades', params);
        if (paginate) {
            let cursorReceived = undefined;
            let cursorSent = undefined;
            if (uta) {
                cursorReceived = 'cursor';
                cursorSent = 'cursor';
            } else if (market['spot']) {
                if (marginMode !== undefined) {
                    cursorReceived = 'minId';
                    cursorSent = 'idLessThan';
                }
            } else {
                cursorReceived = 'endId';
                cursorSent = 'idLessThan';
            }
            return await this.fetchPaginatedCallCursor ('fetchMyTrades', symbol, since, limit, params, cursorReceived, cursorSent) as Trade[];
        }
        let response = undefined;
        if (uta) {
            response = await this.privateUtaGetV3TradeFills (this.extend (request, params));
        } else {
            request['symbol'] = market['id'];
            if (market['spot']) {
                if (marginMode !== undefined) {
                    if (since === undefined) {
                        request['startTime'] = this.milliseconds () - 7776000000;
                    }
                    if (marginMode === 'isolated') {
                        response = await this.privateMarginGetV2MarginIsolatedFills (this.extend (request, params));
                    } else if (marginMode === 'cross') {
                        response = await this.privateMarginGetV2MarginCrossedFills (this.extend (request, params));
                    }
                } else {
                    response = await this.privateSpotGetV2SpotTradeFills (this.extend (request, params));
                }
            } else {
                let productType = undefined;
                [ productType, params ] = this.handleProductTypeAndParams (market, params);
                request['productType'] = productType;
                response = await this.privateMixGetV2MixOrderFills (this.extend (request, params));
            }
        }
        //
        // spot
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700802995406,
        //         "data": [
        //             {
        //                 "userId": "7264631751",
        //                 "symbol": "BTCUSDT",
        //                 "orderId": "1098394344925597696",
        //                 "tradeId": "1098394344974925824",
        //                 "orderType": "market",
        //                 "side": "sell",
        //                 "priceAvg": "28467.68",
        //                 "size": "0.0002",
        //                 "amount": "5.693536",
        //                 "feeDetail": {
        //                     "deduction": "no",
        //                     "feeCoin": "USDT",
        //                     "totalDeductionFee": "",
        //                     "totalFee": "-0.005693536"
        //                 },
        //                 "tradeScope": "taker",
        //                 "cTime": "1697603539699",
        //                 "uTime": "1697603539754"
        //             }
        //         ]
        //     }
        //
        // spot margin
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700803176399,
        //         "data": {
        //             "fills": [
        //                 {
        //                     "orderId": "1099353730455318528",
        //                     "tradeId": "1099353730627092481",
        //                     "orderType": "market",
        //                     "side": "sell",
        //                     "priceAvg": "29543.7",
        //                     "size": "0.0001",
        //                     "amount": "2.95437",
        //                     "tradeScope": "taker",
        //                     "feeDetail": {
        //                         "deduction": "no",
        //                         "feeCoin": "USDT",
        //                         "totalDeductionFee": "0",
        //                         "totalFee": "-0.00295437"
        //                     },
        //                     "cTime": "1697832275063",
        //                     "uTime": "1697832275150"
        //                 },
        //             ],
        //             "minId": "1099353591699161118",
        //             "maxId": "1099353730627092481"
        //         }
        //     }
        //
        // swap and future
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700803357487,
        //         "data": {
        //             "fillList": [
        //                 {
        //                     "tradeId": "1111468664328269825",
        //                     "symbol": "BTCUSDT",
        //                     "orderId": "1111468664264753162",
        //                     "price": "37271.4",
        //                     "baseVolume": "0.001",
        //                     "feeDetail": [
        //                         {
        //                             "deduction": "no",
        //                             "feeCoin": "USDT",
        //                             "totalDeductionFee": null,
        //                             "totalFee": "-0.02236284"
        //                         }
        //                     ],
        //                     "side": "buy",
        //                     "quoteVolume": "37.2714",
        //                     "profit": "-0.0007",
        //                     "enterPointSource": "web",
        //                     "tradeSide": "close",
        //                     "posMode": "hedge_mode",
        //                     "tradeScope": "taker",
        //                     "cTime": "1700720700342"
        //                 },
        //             ],
        //             "endId": "1099351587643699201"
        //         }
        //     }
        //
        // uta
        //
        //      {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1751099666579,
        //         "data": {
        //             "list": [
        //                 {
        //                     "execId": "1322441401010528257",
        //                     "orderId": "1322441400976261120",
        //                     "category": "USDT-FUTURES",
        //                     "symbol": "BTCUSDT",
        //                     "orderType": "market",
        //                     "side": "sell",
        //                     "execPrice": "107005.4",
        //                     "execQty": "0.0001",
        //                     "execValue": "10.7005",
        //                     "tradeScope": "taker",
        //                     "feeDetail": [{
        //                         "feeCoin": "USDT",
        //                         "fee":"0.00642032"
        //                     }],
        //                     "createdTime": "1751020520451",
        //                     "updatedTime": "1751020520458",
        //                     "execPnl": "0.00017"
        //                 },
        //             ],
        //             "cursor": "1322061241878880257"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        if (uta) {
            const fills = this.safeList (data, 'list', []);
            return this.parseTrades (fills, market, since, limit);
        } else if ((market['swap'] || (market['future']))) {
            const fills = this.safeList (data, 'fillList', []);
            return this.parseTrades (fills, market, since, limit);
        } else if (marginMode !== undefined) {
            const fills = this.safeList (data, 'fills', []);
            return this.parseTrades (fills, market, since, limit);
        }
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @name bitget#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://www.bitget.com/api-doc/contract/position/get-single-position
     * @see https://www.bitget.com/api-doc/uta/trade/Get-Position
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPosition (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        const request: Dict = {
            'symbol': market['id'],
        };
        let response = undefined;
        let uta = undefined;
        let result = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchPosition', 'uta', false);
        if (uta) {
            request['category'] = productType;
            response = await this.privateUtaGetV3PositionCurrentPosition (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1750929905423,
            //         "data": {
            //             "list": [
            //                 {
            //                     "category": "USDT-FUTURES",
            //                     "symbol": "BTCUSDT",
            //                     "marginCoin": "USDT",
            //                     "holdMode": "hedge_mode",
            //                     "posSide": "long",
            //                     "marginMode": "crossed",
            //                     "positionBalance": "5.435199",
            //                     "available": "0.001",
            //                     "frozen": "0",
            //                     "total": "0.001",
            //                     "leverage": "20",
            //                     "curRealisedPnl": "0",
            //                     "avgPrice": "107410.3",
            //                     "positionStatus": "normal",
            //                     "unrealisedPnl": "0.0047",
            //                     "liquidationPrice": "0",
            //                     "mmr": "0.004",
            //                     "profitRate": "0.0008647337475591",
            //                     "markPrice": "107415.3",
            //                     "breakEvenPrice": "107539.2",
            //                     "totalFunding": "0",
            //                     "openFeeTotal": "-0.06444618",
            //                     "closeFeeTotal": "0",
            //                     "createdTime": "1750495670699",
            //                     "updatedTime": "1750929883465"
            //                 }
            //             ]
            //         }
            //     }
            //
            const data = this.safeDict (response, 'data', {});
            result = this.safeList (data, 'list', []);
        } else {
            request['marginCoin'] = market['settleId'];
            request['productType'] = productType;
            response = await this.privateMixGetV2MixPositionSinglePosition (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1700807531673,
            //         "data": [
            //             {
            //                 "marginCoin": "USDT",
            //                 "symbol": "BTCUSDT",
            //                 "holdSide": "long",
            //                 "openDelegateSize": "0",
            //                 "marginSize": "3.73555",
            //                 "available": "0.002",
            //                 "locked": "0",
            //                 "total": "0.002",
            //                 "leverage": "20",
            //                 "achievedProfits": "0",
            //                 "openPriceAvg": "37355.5",
            //                 "marginMode": "crossed",
            //                 "posMode": "hedge_mode",
            //                 "unrealizedPL": "0.007",
            //                 "liquidationPrice": "31724.970702417",
            //                 "keepMarginRate": "0.004",
            //                 "markPrice": "37359",
            //                 "marginRatio": "0.029599540355",
            //                 "cTime": "1700807507275"
            //             }
            //         ]
            //     }
            //
            result = this.safeList (response, 'data', []);
        }
        const first = this.safeDict (result, 0, {});
        return this.parsePosition (first, market);
    }

    /**
     * @method
     * @name bitget#fetchPositions
     * @description fetch all open positions
     * @see https://www.bitget.com/api-doc/contract/position/get-all-position
     * @see https://www.bitget.com/api-doc/contract/position/Get-History-Position
     * @see https://www.bitget.com/api-doc/uta/trade/Get-Position
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginCoin] the settle currency of the positions, needs to match the productType
     * @param {string} [params.productType] 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.useHistoryEndpoint] default false, when true  will use the historic endpoint to fetch positions
     * @param {string} [params.method] either (default) 'privateMixGetV2MixPositionAllPosition', 'privateMixGetV2MixPositionHistoryPosition', or 'privateUtaGetV3PositionCurrentPosition'
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchPositions', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchPositions', undefined, undefined, undefined, params, 'endId', 'idLessThan') as Position[];
        }
        let method = undefined;
        const useHistoryEndpoint = this.safeBool (params, 'useHistoryEndpoint', false);
        if (useHistoryEndpoint) {
            method = 'privateMixGetV2MixPositionHistoryPosition';
        } else {
            [ method, params ] = this.handleOptionAndParams (params, 'fetchPositions', 'method', 'privateMixGetV2MixPositionAllPosition');
        }
        let market = undefined;
        if (symbols !== undefined) {
            const first = this.safeString (symbols, 0);
            market = this.market (first);
        }
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        const request: Dict = {};
        let response = undefined;
        let isHistory = false;
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchPositions', 'uta', false);
        if (uta) {
            request['category'] = productType;
            response = await this.privateUtaGetV3PositionCurrentPosition (this.extend (request, params));
        } else if (method === 'privateMixGetV2MixPositionAllPosition') {
            let marginCoin = this.safeString (params, 'marginCoin', 'USDT');
            if (symbols !== undefined) {
                marginCoin = market['settleId'];
            } else if (productType === 'USDT-FUTURES') {
                marginCoin = 'USDT';
            } else if (productType === 'USDC-FUTURES') {
                marginCoin = 'USDC';
            } else if (productType === 'SUSDT-FUTURES') {
                marginCoin = 'SUSDT';
            } else if (productType === 'SUSDC-FUTURES') {
                marginCoin = 'SUSDC';
            } else if ((productType === 'SCOIN-FUTURES') || (productType === 'COIN-FUTURES')) {
                if (marginCoin === undefined) {
                    throw new ArgumentsRequired (this.id + ' fetchPositions() requires a marginCoin parameter that matches the productType');
                }
            }
            request['marginCoin'] = marginCoin;
            request['productType'] = productType;
            response = await this.privateMixGetV2MixPositionAllPosition (this.extend (request, params));
        } else {
            isHistory = true;
            if (market !== undefined) {
                request['symbol'] = market['id'];
            }
            request['productType'] = productType;
            response = await this.privateMixGetV2MixPositionHistoryPosition (this.extend (request, params));
        }
        //
        // privateMixGetV2MixPositionAllPosition
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700807810221,
        //         "data": [
        //             {
        //                 "marginCoin": "USDT",
        //                 "symbol": "BTCUSDT",
        //                 "holdSide": "long",
        //                 "openDelegateSize": "0",
        //                 "marginSize": "3.73555",
        //                 "available": "0.002",
        //                 "locked": "0",
        //                 "total": "0.002",
        //                 "leverage": "20",
        //                 "achievedProfits": "0",
        //                 "openPriceAvg": "37355.5",
        //                 "marginMode": "crossed",
        //                 "posMode": "hedge_mode",
        //                 "unrealizedPL": "0.03",
        //                 "liquidationPrice": "31725.023602417",
        //                 "keepMarginRate": "0.004",
        //                 "markPrice": "37370.5",
        //                 "marginRatio": "0.029550120396",
        //                 "cTime": "1700807507275"
        //             }
        //         ]
        //     }
        //
        // privateMixGetV2MixPositionHistoryPosition
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700808051002,
        //         "data": {
        //             "list": [
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "marginCoin": "USDT",
        //                     "holdSide": "long",
        //                     "openAvgPrice": "37272.1",
        //                     "closeAvgPrice": "37271.4",
        //                     "marginMode": "crossed",
        //                     "openTotalPos": "0.001",
        //                     "closeTotalPos": "0.001",
        //                     "pnl": "-0.0007",
        //                     "netProfit": "-0.0454261",
        //                     "totalFunding": "0",
        //                     "openFee": "-0.02236326",
        //                     "closeFee": "-0.02236284",
        //                     "utime": "1700720700400",
        //                     "ctime": "1700720651684"
        //                 },
        //             ],
        //             "endId": "1099351653866962944"
        //         }
        //     }
        //
        // privateUtaGetV3PositionCurrentPosition
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1750929905423,
        //         "data": {
        //             "list": [
        //                 {
        //                     "category": "USDT-FUTURES",
        //                     "symbol": "BTCUSDT",
        //                     "marginCoin": "USDT",
        //                     "holdMode": "hedge_mode",
        //                     "posSide": "long",
        //                     "marginMode": "crossed",
        //                     "positionBalance": "5.435199",
        //                     "available": "0.001",
        //                     "frozen": "0",
        //                     "total": "0.001",
        //                     "leverage": "20",
        //                     "curRealisedPnl": "0",
        //                     "avgPrice": "107410.3",
        //                     "positionStatus": "normal",
        //                     "unrealisedPnl": "0.0047",
        //                     "liquidationPrice": "0",
        //                     "mmr": "0.004",
        //                     "profitRate": "0.0008647337475591",
        //                     "markPrice": "107415.3",
        //                     "breakEvenPrice": "107539.2",
        //                     "totalFunding": "0",
        //                     "openFeeTotal": "-0.06444618",
        //                     "closeFeeTotal": "0",
        //                     "createdTime": "1750495670699",
        //                     "updatedTime": "1750929883465"
        //                 }
        //             ]
        //         }
        //     }
        //
        let position = [];
        if (uta || isHistory) {
            const data = this.safeDict (response, 'data', {});
            position = this.safeList (data, 'list', []);
        } else {
            position = this.safeList (response, 'data', []);
        }
        const result = [];
        for (let i = 0; i < position.length; i++) {
            result.push (this.parsePosition (position[i], market));
        }
        symbols = this.marketSymbols (symbols);
        return this.filterByArrayPositions (result, 'symbol', symbols, false);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        // fetchPosition
        //
        //     {
        //         "marginCoin": "USDT",
        //         "symbol": "BTCUSDT",
        //         "holdSide": "long",
        //         "openDelegateSize": "0",
        //         "marginSize": "3.73555",
        //         "available": "0.002",
        //         "locked": "0",
        //         "total": "0.002",
        //         "leverage": "20",
        //         "achievedProfits": "0",
        //         "openPriceAvg": "37355.5",
        //         "marginMode": "crossed",
        //         "posMode": "hedge_mode",
        //         "unrealizedPL": "0.007",
        //         "liquidationPrice": "31724.970702417",
        //         "keepMarginRate": "0.004",
        //         "markPrice": "37359",
        //         "marginRatio": "0.029599540355",
        //         "cTime": "1700807507275"
        //     }
        //
        // uta: fetchPosition
        //
        //     {
        //         "category": "USDT-FUTURES",
        //         "symbol": "BTCUSDT",
        //         "marginCoin": "USDT",
        //         "holdMode": "hedge_mode",
        //         "posSide": "long",
        //         "marginMode": "crossed",
        //         "positionBalance": "5.435199",
        //         "available": "0.001",
        //         "frozen": "0",
        //         "total": "0.001",
        //         "leverage": "20",
        //         "curRealisedPnl": "0",
        //         "avgPrice": "107410.3",
        //         "positionStatus": "normal",
        //         "unrealisedPnl": "0.0047",
        //         "liquidationPrice": "0",
        //         "mmr": "0.004",
        //         "profitRate": "0.0008647337475591",
        //         "markPrice": "107415.3",
        //         "breakEvenPrice": "107539.2",
        //         "totalFunding": "0",
        //         "openFeeTotal": "-0.06444618",
        //         "closeFeeTotal": "0",
        //         "createdTime": "1750495670699",
        //         "updatedTime": "1750929883465"
        //     }
        //
        // fetchPositions: privateMixGetV2MixPositionAllPosition
        //
        //     {
        //         "marginCoin": "USDT",
        //         "symbol": "BTCUSDT",
        //         "holdSide": "long",
        //         "openDelegateSize": "0",
        //         "marginSize": "3.73555",
        //         "available": "0.002",
        //         "locked": "0",
        //         "total": "0.002",
        //         "leverage": "20",
        //         "achievedProfits": "0",
        //         "openPriceAvg": "37355.5",
        //         "marginMode": "crossed",
        //         "posMode": "hedge_mode",
        //         "unrealizedPL": "0.03",
        //         "liquidationPrice": "31725.023602417",
        //         "keepMarginRate": "0.004",
        //         "markPrice": "37370.5",
        //         "marginRatio": "0.029550120396",
        //         "cTime": "1700807507275"
        //     }
        //
        // fetchPositionsHistory: privateMixGetV2MixPositionHistoryPosition
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "marginCoin": "USDT",
        //         "holdSide": "long",
        //         "openAvgPrice": "37272.1",
        //         "closeAvgPrice": "37271.4",
        //         "marginMode": "crossed",
        //         "openTotalPos": "0.001",
        //         "closeTotalPos": "0.001",
        //         "pnl": "-0.0007",
        //         "netProfit": "-0.0454261",
        //         "totalFunding": "0",
        //         "openFee": "-0.02236326",
        //         "closeFee": "-0.02236284",
        //         "utime": "1700720700400",
        //         "ctime": "1700720651684"
        //     }
        //
        // closeAllPositions
        //
        //     {
        //         "orderId": "1120923953904893955",
        //         "clientOid": "1120923953904893956"
        //     }
        //
        // uta: fetchPositionsHistory
        //
        //     {
        //         "positionId": "1322441328637100049",
        //         "category": "USDT-FUTURES",
        //         "symbol": "BTCUSDT",
        //         "marginCoin": "USDT",
        //         "holdMode": "hedge_mode",
        //         "posSide": "long",
        //         "marginMode": "crossed",
        //         "openPriceAvg": "107003.7",
        //         "closePriceAvg": "107005.4",
        //         "openTotalPos": "0.0001",
        //         "closeTotalPos": "0.0001",
        //         "cumRealisedPnl": "0.00017",
        //         "netProfit": "-0.01267055",
        //         "totalFunding": "0",
        //         "openFeeTotal": "-0.00642022",
        //         "closeFeeTotal": "-0.00642032",
        //         "createdTime": "1751020503195",
        //         "updatedTime": "1751020520458"
        //     }
        //
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market, undefined, 'contract');
        const symbol = market['symbol'];
        const timestamp = this.safeIntegerN (position, [ 'cTime', 'ctime', 'createdTime' ]);
        let marginMode = this.safeString (position, 'marginMode');
        let collateral = undefined;
        let initialMargin = undefined;
        const unrealizedPnl = this.safeString2 (position, 'unrealizedPL', 'unrealisedPnl');
        const rawCollateral = this.safeString2 (position, 'marginSize', 'positionBalance');
        if (marginMode === 'isolated') {
            collateral = Precise.stringAdd (rawCollateral, unrealizedPnl);
        } else if (marginMode === 'crossed') {
            marginMode = 'cross';
            initialMargin = rawCollateral;
        }
        const holdMode = this.safeString2 (position, 'posMode', 'holdMode');
        let hedged = undefined;
        if (holdMode === 'hedge_mode') {
            hedged = true;
        } else if (holdMode === 'one_way_mode') {
            hedged = false;
        }
        const side = this.safeString2 (position, 'holdSide', 'posSide');
        const leverage = this.safeString (position, 'leverage');
        const contractSizeNumber = this.safeValue (market, 'contractSize');
        const contractSize = this.numberToString (contractSizeNumber);
        const baseAmount = this.safeString2 (position, 'total', 'openTotalPos');
        const entryPrice = this.safeStringN (position, [ 'openPriceAvg', 'openAvgPrice', 'avgPrice' ]);
        const maintenanceMarginPercentage = this.safeString (position, 'keepMarginRate');
        const openNotional = Precise.stringMul (entryPrice, baseAmount);
        if (initialMargin === undefined) {
            initialMargin = Precise.stringDiv (openNotional, leverage);
        }
        let contracts = this.parseNumber (Precise.stringDiv (baseAmount, contractSize));
        if (contracts === undefined) {
            contracts = this.safeNumber (position, 'closeTotalPos');
        }
        const markPrice = this.safeString (position, 'markPrice');
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
        const percentage = Precise.stringMul (Precise.stringDiv (unrealizedPnl, initialMargin, 4), '100');
        return this.safePosition ({
            'info': position,
            'id': this.safeString2 (position, 'orderId', 'positionId'),
            'symbol': symbol,
            'notional': this.parseNumber (notional),
            'marginMode': marginMode,
            'liquidationPrice': liquidationPrice,
            'entryPrice': this.parseNumber (entryPrice),
            'unrealizedPnl': this.parseNumber (unrealizedPnl),
            'realizedPnl': this.safeNumberN (position, [ 'pnl', 'curRealisedPnl', 'cumRealisedPnl' ]),
            'percentage': this.parseNumber (percentage),
            'contracts': contracts,
            'contractSize': contractSizeNumber,
            'markPrice': this.parseNumber (markPrice),
            'lastPrice': this.safeNumber2 (position, 'closeAvgPrice', 'closePriceAvg'),
            'side': side,
            'hedged': hedged,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': this.safeInteger2 (position, 'utime', 'updatedTime'),
            'maintenanceMargin': this.parseNumber (maintenanceMargin),
            'maintenanceMarginPercentage': this.parseNumber (maintenanceMarginPercentage),
            'collateral': this.parseNumber (collateral),
            'initialMargin': this.parseNumber (initialMargin),
            'initialMarginPercentage': this.parseNumber (initialMarginPercentage),
            'leverage': this.parseNumber (leverage),
            'marginRatio': this.safeNumber2 (position, 'marginRatio', 'mmr'),
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    /**
     * @method
     * @name bitget#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://www.bitget.com/api-doc/contract/market/Get-History-Funding-Rate
     * @see https://www.bitget.com/api-doc/uta/public/Get-History-Funding-Rate
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let productType = undefined;
        let uta = undefined;
        let response = undefined;
        let result = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'uta', false);
        if (uta) {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            request['category'] = productType;
            response = await this.publicUtaGetV3MarketHistoryFundRate (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1750435113658,
            //         "data": {
            //             "resultList": [
            //                 {
            //                     "symbol": "BTCUSDT",
            //                     "fundingRate": "-0.000017",
            //                     "fundingRateTimestamp": "1750431600000"
            //                 },
            //             ]
            //         }
            //     }
            //
            const data = this.safeDict (response, 'data', {});
            result = this.safeList (data, 'resultList', []);
        } else {
            let paginate = false;
            [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'paginate');
            if (paginate) {
                return await this.fetchPaginatedCallIncremental ('fetchFundingRateHistory', symbol, since, limit, params, 'pageNo', 100) as FundingRateHistory[];
            }
            if (limit !== undefined) {
                request['pageSize'] = limit;
            }
            request['productType'] = productType;
            response = await this.publicMixGetV2MixMarketHistoryFundRate (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1652406728393,
            //         "data": [
            //             {
            //                 "symbol": "BTCUSDT",
            //                 "fundingRate": "-0.0003",
            //                 "fundingTime": "1652396400000"
            //             },
            //         ]
            //     }
            //
            result = this.safeList (response, 'data', []);
        }
        const rates = [];
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const marketId = this.safeString (entry, 'symbol');
            const symbolInner = this.safeSymbol (marketId, market);
            const timestamp = this.safeInteger2 (entry, 'fundingTime', 'fundingRateTimestamp');
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

    /**
     * @method
     * @name bitget#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://www.bitget.com/api-doc/contract/market/Get-Current-Funding-Rate
     * @see https://www.bitget.com/api-doc/contract/market/Get-Symbol-Next-Funding-Time
     * @see https://www.bitget.com/api-doc/uta/public/Get-Current-Funding-Rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @param {string} [params.method] either (default) 'publicMixGetV2MixMarketCurrentFundRate' or 'publicMixGetV2MixMarketFundingTime'
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingRate() supports swap contracts only');
        }
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        const request: Dict = {
            'symbol': market['id'],
        };
        let uta = undefined;
        let response = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchFundingRate', 'uta', false);
        if (uta) {
            response = await this.publicUtaGetV3MarketCurrentFundRate (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1750897372153,
            //         "data": [
            //             {
            //                 "symbol": "BTCUSDT",
            //                 "fundingRate": "0.00001",
            //                 "fundingRateInterval": "8",
            //                 "nextUpdate": "1750924800000",
            //                 "minFundingRate": "-0.003",
            //                 "maxFundingRate": "0.003"
            //             }
            //         ]
            //     }
            //
        } else {
            request['productType'] = productType;
            let method = undefined;
            [ method, params ] = this.handleOptionAndParams (params, 'fetchFundingRate', 'method', 'publicMixGetV2MixMarketCurrentFundRate');
            if (method === 'publicMixGetV2MixMarketCurrentFundRate') {
                response = await this.publicMixGetV2MixMarketCurrentFundRate (this.extend (request, params));
                //
                //     {
                //         "code": "00000",
                //         "msg": "success",
                //         "requestTime": 1745500709429,
                //         "data": [
                //             {
                //                 "symbol": "BTCUSDT",
                //                 "fundingRate": "-0.000013",
                //                 "fundingRateInterval": "8",
                //                 "nextUpdate": "1745510400000",
                //                 "minFundingRate": "-0.003",
                //                 "maxFundingRate": "0.003"
                //             }
                //         ]
                //     }
                //
            } else if (method === 'publicMixGetV2MixMarketFundingTime') {
                response = await this.publicMixGetV2MixMarketFundingTime (this.extend (request, params));
                //
                //     {
                //         "code": "00000",
                //         "msg": "success",
                //         "requestTime": 1745402092428,
                //         "data": [
                //             {
                //                 "symbol": "BTCUSDT",
                //                 "nextFundingTime": "1745424000000",
                //                 "ratePeriod": "8"
                //             }
                //         ]
                //     }
                //
            }
        }
        const data = this.safeList (response, 'data', []);
        return this.parseFundingRate (data[0], market);
    }

    /**
     * @method
     * @name bitget#fetchFundingRates
     * @description fetch the current funding rates for all markets
     * @see https://www.bitget.com/api-doc/contract/market/Get-All-Symbol-Ticker
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] *contract only* 'linear', 'inverse'
     * @param {string} [params.productType] *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @returns {object} a dictionary of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexed by market symbols
     */
    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbols !== undefined) {
            const symbol = this.safeValue (symbols, 0);
            market = this.market (symbol);
        }
        const request: Dict = {};
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        request['productType'] = productType;
        const response = await this.publicMixGetV2MixMarketTickers (this.extend (request, params));
        // {
        //     "code": "00000",
        //     "msg": "success",
        //     "requestTime": 1700533773477,
        //     "data": [
        //         {
        //             "symbol": "BTCUSD",
        //             "lastPr": "29904.5",
        //             "askPr": "29904.5",
        //             "bidPr": "29903.5",
        //             "bidSz": "0.5091",
        //             "askSz": "2.2694",
        //             "high24h": "0",
        //             "low24h": "0",
        //             "ts": "1695794271400",
        //             "change24h": "0",
        //             "baseVolume": "0",
        //             "quoteVolume": "0",
        //             "usdtVolume": "0",
        //             "openUtc": "0",
        //             "changeUtc24h": "0",
        //             "indexPrice": "29132.353333",
        //             "fundingRate": "-0.0007",
        //             "holdingAmount": "125.6844",
        //             "deliveryStartTime": null,
        //             "deliveryTime": null,
        //             "deliveryStatus": "delivery_normal",
        //             "open24h": "0",
        //             "markPrice": "12345"
        //         },
        //     ]
        // }
        symbols = this.marketSymbols (symbols);
        const data = this.safeList (response, 'data', []);
        return this.parseFundingRates (data, symbols);
    }

    parseFundingRate (contract, market: Market = undefined): FundingRate {
        //
        // fetchFundingRate: publicMixGetV2MixMarketCurrentFundRate, publicUtaGetV3MarketCurrentFundRate
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "fundingRate": "-0.000013",
        //         "fundingRateInterval": "8",
        //         "nextUpdate": "1745510400000",
        //         "minFundingRate": "-0.003",
        //         "maxFundingRate": "0.003"
        //     }
        //
        // fetchFundingRate: publicMixGetV2MixMarketFundingTime
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "nextFundingTime": "1745424000000",
        //         "ratePeriod": "8"
        //     }
        //
        // fetchFundingInterval
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "nextFundingTime": "1727942400000",
        //         "ratePeriod": "8"
        //     }
        //
        // fetchFundingRates
        //
        //     {
        //         "symbol": "BTCUSD",
        //         "lastPr": "29904.5",
        //         "askPr": "29904.5",
        //         "bidPr": "29903.5",
        //         "bidSz": "0.5091",
        //         "askSz": "2.2694",
        //         "high24h": "0",
        //         "low24h": "0",
        //         "ts": "1695794271400",
        //         "change24h": "0",
        //         "baseVolume": "0",
        //         "quoteVolume": "0",
        //         "usdtVolume": "0",
        //         "openUtc": "0",
        //         "changeUtc24h": "0",
        //         "indexPrice": "29132.353333",
        //         "fundingRate": "-0.0007",
        //         "holdingAmount": "125.6844",
        //         "deliveryStartTime": null,
        //         "deliveryTime": null,
        //         "deliveryStatus": "delivery_normal",
        //         "open24h": "0",
        //         "markPrice": "12345"
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, 'swap');
        const fundingTimestamp = this.safeInteger2 (contract, 'nextFundingTime', 'nextUpdate');
        const interval = this.safeString2 (contract, 'ratePeriod', 'fundingRateInterval');
        const timestamp = this.safeInteger (contract, 'ts');
        const markPrice = this.safeNumber (contract, 'markPrice');
        const indexPrice = this.safeNumber (contract, 'indexPrice');
        let intervalString = undefined;
        if (interval !== undefined) {
            intervalString = interval + 'h';
        }
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': markPrice,
            'indexPrice': indexPrice,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601 (fundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': intervalString,
        } as FundingRate;
    }

    /**
     * @method
     * @name bitget#fetchFundingHistory
     * @description fetch the funding history
     * @see https://www.bitget.com/api-doc/contract/account/Get-Account-Bill
     * @param {string} symbol unified market symbol
     * @param {int} [since] the starting timestamp in milliseconds
     * @param {int} [limit] the number of entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch funding history for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding history structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingHistory[]> {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingHistory() requires a symbol argument');
        }
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchFundingHistory', symbol, since, limit, params, 'endId', 'idLessThan') as FundingHistory[];
        }
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingHistory() supports swap contracts only');
        }
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        let request: Dict = {
            'symbol': market['id'],
            'marginCoin': market['settleId'],
            'businessType': 'contract_settle_fee',
            'productType': productType,
        };
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateMixGetV2MixAccountBill (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700795977890,
        //         "data": {
        //             "bills": [
        //                 {
        //                     "billId": "1111499428100472833",
        //                     "symbol": "BTCUSDT",
        //                     "amount": "-0.004992",
        //                     "fee": "0",
        //                     "feeByCoupon": "",
        //                     "businessType": "contract_settle_fee",
        //                     "coin": "USDT",
        //                     "cTime": "1700728034996"
        //                 },
        //             ],
        //             "endId": "1098396773329305606"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const result = this.safeValue (data, 'bills', []);
        return this.parseFundingHistories (result, market, since, limit);
    }

    parseFundingHistory (contract, market: Market = undefined) {
        //
        //     {
        //         "billId": "1111499428100472833",
        //         "symbol": "BTCUSDT",
        //         "amount": "-0.004992",
        //         "fee": "0",
        //         "feeByCoupon": "",
        //         "businessType": "contract_settle_fee",
        //         "coin": "USDT",
        //         "cTime": "1700728034996"
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const currencyId = this.safeString (contract, 'coin');
        const timestamp = this.safeInteger (contract, 'cTime');
        return {
            'info': contract,
            'symbol': this.safeSymbol (marketId, market, undefined, 'swap'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'code': this.safeCurrencyCode (currencyId),
            'amount': this.safeNumber (contract, 'amount'),
            'id': this.safeString (contract, 'billId'),
        };
    }

    parseFundingHistories (contracts, market = undefined, since: Int = undefined, limit: Int = undefined): FundingHistory[] {
        const result = [];
        for (let i = 0; i < contracts.length; i++) {
            const contract = contracts[i];
            const business = this.safeString (contract, 'businessType');
            if (business !== 'contract_settle_fee') {
                continue;
            }
            result.push (this.parseFundingHistory (contract, market));
        }
        const sorted = this.sortBy (result, 'timestamp');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    async modifyMarginHelper (symbol: string, amount, type, params = {}): Promise<MarginModification> {
        await this.loadMarkets ();
        const holdSide = this.safeString (params, 'holdSide');
        const market = this.market (symbol);
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        const request: Dict = {
            'symbol': market['id'],
            'marginCoin': market['settleId'],
            'amount': this.amountToPrecision (symbol, amount), // positive value for adding margin, negative for reducing
            'holdSide': holdSide, // long or short
            'productType': productType,
        };
        params = this.omit (params, 'holdSide');
        const response = await this.privateMixPostV2MixAccountSetMargin (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700813444618,
        //         "data": ""
        //     }
        //
        return this.extend (this.parseMarginModification (response, market), {
            'amount': this.parseNumber (amount),
            'type': type,
        });
    }

    parseMarginModification (data: Dict, market: Market = undefined): MarginModification {
        //
        // addMargin/reduceMargin
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700813444618,
        //         "data": ""
        //     }
        //
        const errorCode = this.safeString (data, 'code');
        const status = (errorCode === '00000') ? 'ok' : 'failed';
        return {
            'info': data,
            'symbol': market['symbol'],
            'type': undefined,
            'marginMode': 'isolated',
            'amount': undefined,
            'total': undefined,
            'code': market['settle'],
            'status': status,
            'timestamp': undefined,
            'datetime': undefined,
        };
    }

    /**
     * @method
     * @name bitget#reduceMargin
     * @description remove margin from a position
     * @see https://www.bitget.com/api-doc/contract/account/Change-Margin
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    async reduceMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        if (amount > 0) {
            throw new BadRequest (this.id + ' reduceMargin() amount parameter must be a negative value');
        }
        const holdSide = this.safeString (params, 'holdSide');
        if (holdSide === undefined) {
            throw new ArgumentsRequired (this.id + ' reduceMargin() requires a holdSide parameter, either long or short');
        }
        return await this.modifyMarginHelper (symbol, amount, 'reduce', params);
    }

    /**
     * @method
     * @name bitget#addMargin
     * @description add margin
     * @see https://www.bitget.com/api-doc/contract/account/Change-Margin
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    async addMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        const holdSide = this.safeString (params, 'holdSide');
        if (holdSide === undefined) {
            throw new ArgumentsRequired (this.id + ' addMargin() requires a holdSide parameter, either long or short');
        }
        return await this.modifyMarginHelper (symbol, amount, 'add', params);
    }

    /**
     * @method
     * @name bitget#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://www.bitget.com/api-doc/contract/account/Get-Single-Account
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        const request: Dict = {
            'symbol': market['id'],
            'marginCoin': market['settleId'],
            'productType': productType,
        };
        const response = await this.privateMixGetV2MixAccountAccount (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1709366911964,
        //         "data": {
        //             "marginCoin": "USDT",
        //             "locked": "0",
        //             "available": "0",
        //             "crossedMaxAvailable": "0",
        //             "isolatedMaxAvailable": "0",
        //             "maxTransferOut": "0",
        //             "accountEquity": "0",
        //             "usdtEquity": "0.000000009166",
        //             "btcEquity": "0",
        //             "crossedRiskRate": "0",
        //             "crossedMarginLeverage": 20,
        //             "isolatedLongLever": 20,
        //             "isolatedShortLever": 20,
        //             "marginMode": "crossed",
        //             "posMode": "hedge_mode",
        //             "unrealizedPL": "0",
        //             "coupon": "0",
        //             "crossedUnrealizedPL": "0",
        //             "isolatedUnrealizedPL": ""
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseLeverage (data, market);
    }

    parseLeverage (leverage: Dict, market: Market = undefined): Leverage {
        const isCrossMarginMode = this.safeString (leverage, 'marginMode') === 'crossed';
        const longLevKey = isCrossMarginMode ? 'crossedMarginLeverage' : 'isolatedLongLever';
        const shortLevKey = isCrossMarginMode ? 'crossedMarginLeverage' : 'isolatedShortLever';
        return {
            'info': leverage,
            'symbol': market['symbol'],
            'marginMode': isCrossMarginMode ? 'cross' : 'isolated',
            'longLeverage': this.safeInteger (leverage, longLevKey),
            'shortLeverage': this.safeInteger (leverage, shortLevKey),
        } as Leverage;
    }

    /**
     * @method
     * @name bitget#setLeverage
     * @description set the level of leverage for a market
     * @see https://www.bitget.com/api-doc/contract/account/Change-Leverage
     * @see https://www.bitget.com/api-doc/uta/account/Change-Leverage
     * @param {int} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.holdSide] *isolated only* position direction, 'long' or 'short'
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @param {boolean} [params.posSide] required for uta isolated margin, long or short
     * @returns {object} response from the exchange
     */
    async setLeverage (leverage: int, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        const request: Dict = {
            'symbol': market['id'],
            'leverage': this.numberToString (leverage),
        };
        let uta = undefined;
        let response = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'setLeverage', 'uta', false);
        if (uta) {
            if (productType === 'SPOT') {
                let marginMode = undefined;
                [ marginMode, params ] = this.handleMarginModeAndParams ('fetchTrades', params);
                if (marginMode !== undefined) {
                    productType = 'MARGIN';
                }
            }
            request['coin'] = market['settleId'];
            request['category'] = productType;
            response = await this.privateUtaPostV3AccountSetLeverage (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1752815940833,
            //         "data": "success"
            //     }
            //
        } else {
            request['marginCoin'] = market['settleId'];
            request['productType'] = productType;
            response = await this.privateMixPostV2MixAccountSetLeverage (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1700864711517,
            //         "data": {
            //             "symbol": "BTCUSDT",
            //             "marginCoin": "USDT",
            //             "longLeverage": "25",
            //             "shortLeverage": "25",
            //             "crossMarginLeverage": "25",
            //             "marginMode": "crossed"
            //         }
            //     }
            //
        }
        return response;
    }

    /**
     * @method
     * @name bitget#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://www.bitget.com/api-doc/contract/account/Change-Margin-Mode
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setMarginMode (marginMode: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
        marginMode = marginMode.toLowerCase ();
        if (marginMode === 'cross') {
            marginMode = 'crossed';
        }
        if ((marginMode !== 'isolated') && (marginMode !== 'crossed')) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() marginMode must be either isolated or crossed (cross)');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        const request: Dict = {
            'symbol': market['id'],
            'marginCoin': market['settleId'],
            'marginMode': marginMode,
            'productType': productType,
        };
        const response = await this.privateMixPostV2MixAccountSetMarginMode (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700865205552,
        //         "data": {
        //             "symbol": "BTCUSDT",
        //             "marginCoin": "USDT",
        //             "longLeverage": "20",
        //             "shortLeverage": "3",
        //             "marginMode": "isolated"
        //         }
        //     }
        //
        return response;
    }

    /**
     * @method
     * @name bitget#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://www.bitget.com/api-doc/contract/account/Change-Hold-Mode
     * @see https://www.bitget.com/api-doc/uta/account/Change-Position-Mode
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol not used by bitget setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.productType] required if not uta and symbol is undefined: 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} response from the exchange
     */
    async setPositionMode (hedged: boolean, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const posMode = hedged ? 'hedge_mode' : 'one_way_mode';
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let productType = undefined;
        let uta = undefined;
        let response = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        [ uta, params ] = this.handleOptionAndParams (params, 'setPositionMode', 'uta', false);
        if (uta) {
            request['holdMode'] = posMode;
            response = await this.privateUtaPostV3AccountSetHoldMode (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1752816734592,
            //         "data": "success"
            //     }
            //
        } else {
            request['posMode'] = posMode;
            request['productType'] = productType;
            response = await this.privateMixPostV2MixAccountSetPositionMode (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1700865608009,
            //         "data": {
            //             "posMode": "hedge_mode"
            //         }
            //     }
            //
        }
        return response;
    }

    /**
     * @method
     * @name bitget#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://www.bitget.com/api-doc/contract/market/Get-Open-Interest
     * @see https://www.bitget.com/api-doc/uta/public/Get-Open-Interest
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    async fetchOpenInterest (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['contract']) {
            throw new BadRequest (this.id + ' fetchOpenInterest() supports contract markets only');
        }
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        const request: Dict = {
            'symbol': market['id'],
        };
        let uta = undefined;
        let response = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchOpenInterest', 'uta', false);
        if (uta) {
            request['category'] = productType;
            response = await this.publicUtaGetV3MarketOpenInterest (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1751101221545,
            //         "data": {
            //             "list": [
            //                 {
            //                     "symbol": "BTCUSDT",
            //                     "openInterest": "18166.3583"
            //                 }
            //             ],
            //             "ts": "1751101220993"
            //         }
            //     }
            //
        } else {
            request['productType'] = productType;
            response = await this.publicMixGetV2MixMarketOpenInterest (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1700866041022,
            //         "data": {
            //             "openInterestList": [
            //                 {
            //                     "symbol": "BTCUSDT",
            //                     "size": "52234.134"
            //                 }
            //             ],
            //             "ts": "1700866041023"
            //         }
            //     }
            //
        }
        const data = this.safeDict (response, 'data', {});
        return this.parseOpenInterest (data, market);
    }

    parseOpenInterest (interest, market: Market = undefined) {
        //
        // default
        //
        //     {
        //         "openInterestList": [
        //             {
        //                 "symbol": "BTCUSDT",
        //                 "size": "52234.134"
        //             }
        //         ],
        //         "ts": "1700866041023"
        //     }
        //
        // uta
        //
        //     {
        //         "list": [
        //             {
        //                 "symbol": "BTCUSDT",
        //                 "openInterest": "18166.3583"
        //             }
        //         ],
        //         "ts": "1751101220993"
        //     }
        //
        const data = this.safeList2 (interest, 'openInterestList', 'list', []);
        const timestamp = this.safeInteger (interest, 'ts');
        const marketId = this.safeString (data[0], 'symbol');
        return this.safeOpenInterest ({
            'symbol': this.safeSymbol (marketId, market, undefined, 'contract'),
            'openInterestAmount': this.safeNumber2 (data[0], 'size', 'openInterest'),
            'openInterestValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        }, market);
    }

    /**
     * @method
     * @name bitget#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://www.bitget.com/api-doc/spot/account/Get-Account-TransferRecords
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<TransferEntry[]> {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransfers() requires a code argument');
        }
        await this.loadMarkets ();
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTransfers', undefined, params);
        const fromAccount = this.safeString (params, 'fromAccount', type);
        params = this.omit (params, 'fromAccount');
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        type = this.safeString (accountsByType, fromAccount);
        const currency = this.currency (code);
        let request: Dict = {
            'coin': currency['id'],
            'fromType': type,
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        const response = await this.privateSpotGetV2SpotAccountTransferRecords (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700873854651,
        //         "data": [
        //             {
        //                 "coin": "USDT",
        //                 "status": "Successful",
        //                 "toType": "crossed_margin",
        //                 "toSymbol": "",
        //                 "fromType": "spot",
        //                 "fromSymbol": "",
        //                 "size": "11.64958799",
        //                 "ts": "1700729673028",
        //                 "clientOid": "1111506298504744960",
        //                 "transferId": "24930940"
        //             },
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTransfers (data, currency, since, limit);
    }

    /**
     * @method
     * @name bitget#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://www.bitget.com/api-doc/spot/account/Wallet-Transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.symbol] unified CCXT market symbol, required when transferring to or from an account type that is a leveraged position-by-position account
     * @param {string} [params.clientOid] custom id
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer (code: string, amount: number, fromAccount: string, toAccount:string, params = {}): Promise<TransferEntry> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const fromType = this.safeString (accountsByType, fromAccount);
        const toType = this.safeString (accountsByType, toAccount);
        const request: Dict = {
            'fromType': fromType,
            'toType': toType,
            'amount': amount,
            'coin': currency['id'],
        };
        const symbol = this.safeString (params, 'symbol');
        params = this.omit (params, 'symbol');
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateSpotPostV2SpotWalletTransfer (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700874302021,
        //         "data": {
        //             "transferId": "1112112916581847040",
        //             "clientOrderId": null
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        data['ts'] = this.safeInteger (response, 'requestTime');
        return this.parseTransfer (data, currency);
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        //
        // transfer
        //
        //     {
        //         "transferId": "1112112916581847040",
        //         "clientOrderId": null,
        //         "ts": 1700874302021
        //     }
        //
        // fetchTransfers
        //
        //     {
        //         "coin": "USDT",
        //         "status": "Successful",
        //         "toType": "crossed_margin",
        //         "toSymbol": "",
        //         "fromType": "spot",
        //         "fromSymbol": "",
        //         "size": "11.64958799",
        //         "ts": "1700729673028",
        //         "clientOid": "1111506298504744960",
        //         "transferId": "24930940"
        //     }
        //
        const timestamp = this.safeInteger (transfer, 'ts');
        const status = this.safeStringLower (transfer, 'status');
        const currencyId = this.safeString (transfer, 'coin');
        const fromAccountRaw = this.safeString (transfer, 'fromType');
        const accountsById = this.safeValue (this.options, 'accountsById', {});
        const fromAccount = this.safeString (accountsById, fromAccountRaw, fromAccountRaw);
        const toAccountRaw = this.safeString (transfer, 'toType');
        const toAccount = this.safeString (accountsById, toAccountRaw, toAccountRaw);
        return {
            'info': transfer,
            'id': this.safeString (transfer, 'transferId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber (transfer, 'size'),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': this.parseTransferStatus (status),
        };
    }

    parseTransferStatus (status: Str): Str {
        const statuses: Dict = {
            'successful': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseDepositWithdrawFee (fee, currency: Currency = undefined) {
        //
        //     {
        //         "chains": [
        //             {
        //                 "browserUrl": "https://blockchair.com/bitcoin/transaction/",
        //                 "chain": "BTC",
        //                 "depositConfirm": "1",
        //                 "extraWithdrawFee": "0",
        //                 "minDepositAmount": "0.0001",
        //                 "minWithdrawAmount": "0.005",
        //                 "needTag": "false",
        //                 "rechargeable": "true",
        //                 "withdrawConfirm": "1",
        //                 "withdrawFee": "0.0004",
        //                 "withdrawable": "true"
        //             },
        //         ],
        //         "coin": "BTC",
        //         "coinId": "1",
        //         "transfer": "true""
        //     }
        //
        const chains = this.safeValue (fee, 'chains', []);
        const chainsLength = chains.length;
        const result: Dict = {
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

    /**
     * @method
     * @name bitget#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://www.bitget.com/api-doc/spot/market/Get-Coin-List
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchDepositWithdrawFees (codes: Strings = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicSpotGetV2SpotPublicCoins (params);
        //
        //     {
        //         "code": "00000",
        //         "data": [
        //             {
        //                 "chains": [
        //                     {
        //                         "browserUrl": "https://blockchair.com/bitcoin/transaction/",
        //                         "chain": "BTC",
        //                         "depositConfirm": "1",
        //                         "extraWithdrawFee": "0",
        //                         "minDepositAmount": "0.0001",
        //                         "minWithdrawAmount": "0.005",
        //                         "needTag": "false",
        //                         "rechargeable": "true",
        //                         "withdrawConfirm": "1",
        //                         "withdrawFee": "0.0004",
        //                         "withdrawable": "true"
        //                     },
        //                 ],
        //                 "coin": "BTC",
        //                 "coinId": "1",
        //                 "transfer": "true""
        //             }
        //         ],
        //         "msg": "success",
        //         "requestTime": "1700120731773"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseDepositWithdrawFees (data, codes, 'coin');
    }

    /**
     * @method
     * @name bitget#borrowCrossMargin
     * @description create a loan to borrow margin
     * @see https://www.bitget.com/api-doc/margin/cross/account/Cross-Borrow
     * @param {string} code unified currency code of the currency to borrow
     * @param {string} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async borrowCrossMargin (code: string, amount: number, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'coin': currency['id'],
            'borrowAmount': this.currencyToPrecision (code, amount),
        };
        const response = await this.privateMarginPostV2MarginCrossedAccountBorrow (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700876470931,
        //         "data": {
        //             "loanId": "1112122013642272769",
        //             "coin": "USDT",
        //             "borrowAmount": "4"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseMarginLoan (data, currency);
    }

    /**
     * @method
     * @name bitget#borrowIsolatedMargin
     * @description create a loan to borrow margin
     * @see https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Borrow
     * @param {string} symbol unified market symbol
     * @param {string} code unified currency code of the currency to borrow
     * @param {string} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async borrowIsolatedMargin (symbol: string, code: string, amount: number, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const market = this.market (symbol);
        const request: Dict = {
            'coin': currency['id'],
            'borrowAmount': this.currencyToPrecision (code, amount),
            'symbol': market['id'],
        };
        const response = await this.privateMarginPostV2MarginIsolatedAccountBorrow (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700877255605,
        //         "data": {
        //             "loanId": "1112125304879067137",
        //             "symbol": "BTCUSDT",
        //             "coin": "USDT",
        //             "borrowAmount": "4"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseMarginLoan (data, currency, market);
    }

    /**
     * @method
     * @name bitget#repayIsolatedMargin
     * @description repay borrowed margin and interest
     * @see https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Repay
     * @param {string} symbol unified market symbol
     * @param {string} code unified currency code of the currency to repay
     * @param {string} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async repayIsolatedMargin (symbol: string, code: string, amount, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const market = this.market (symbol);
        const request: Dict = {
            'coin': currency['id'],
            'repayAmount': this.currencyToPrecision (code, amount),
            'symbol': market['id'],
        };
        const response = await this.privateMarginPostV2MarginIsolatedAccountRepay (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700877518012,
        //         "data": {
        //             "remainDebtAmount": "0",
        //             "repayId": "1112126405439270912",
        //             "symbol": "BTCUSDT",
        //             "coin": "USDT",
        //             "repayAmount": "8.000137"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseMarginLoan (data, currency, market);
    }

    /**
     * @method
     * @name bitget#repayCrossMargin
     * @description repay borrowed margin and interest
     * @see https://www.bitget.com/api-doc/margin/cross/account/Cross-Repay
     * @param {string} code unified currency code of the currency to repay
     * @param {string} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async repayCrossMargin (code: string, amount, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'coin': currency['id'],
            'repayAmount': this.currencyToPrecision (code, amount),
        };
        const response = await this.privateMarginPostV2MarginCrossedAccountRepay (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700876704885,
        //         "data": {
        //             "remainDebtAmount": "0",
        //             "repayId": "1112122994945830912",
        //             "coin": "USDT",
        //             "repayAmount": "4.00006834"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseMarginLoan (data, currency);
    }

    parseMarginLoan (info, currency: Currency = undefined, market: Market = undefined) {
        //
        // isolated: borrowMargin
        //
        //     {
        //         "loanId": "1112125304879067137",
        //         "symbol": "BTCUSDT",
        //         "coin": "USDT",
        //         "borrowAmount": "4"
        //     }
        //
        // cross: borrowMargin
        //
        //     {
        //         "loanId": "1112122013642272769",
        //         "coin": "USDT",
        //         "borrowAmount": "4"
        //     }
        //
        // isolated: repayMargin
        //
        //     {
        //         "remainDebtAmount": "0",
        //         "repayId": "1112126405439270912",
        //         "symbol": "BTCUSDT",
        //         "coin": "USDT",
        //         "repayAmount": "8.000137"
        //     }
        //
        // cross: repayMargin
        //
        //     {
        //         "remainDebtAmount": "0",
        //         "repayId": "1112122994945830912",
        //         "coin": "USDT",
        //         "repayAmount": "4.00006834"
        //     }
        //
        const currencyId = this.safeString (info, 'coin');
        const marketId = this.safeString (info, 'symbol');
        let symbol = undefined;
        if (marketId !== undefined) {
            symbol = this.safeSymbol (marketId, market, undefined, 'spot');
        }
        return {
            'id': this.safeString2 (info, 'loanId', 'repayId'),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber2 (info, 'borrowAmount', 'repayAmount'),
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }

    /**
     * @method
     * @name bitget#fetchMyLiquidations
     * @description retrieves the users liquidated positions
     * @see https://www.bitget.com/api-doc/margin/cross/record/Get-Cross-Liquidation-Records
     * @see https://www.bitget.com/api-doc/margin/isolated/record/Get-Isolated-Liquidation-Records
     * @param {string} [symbol] unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the bitget api endpoint
     * @param {int} [params.until] timestamp in ms of the latest liquidation
     * @param {string} [params.marginMode] 'cross' or 'isolated' default value is 'cross'
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    async fetchMyLiquidations (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Liquidation[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyLiquidations', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchMyLiquidations', symbol, since, limit, params, 'minId', 'idLessThan') as Liquidation[];
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchMyLiquidations', market, params);
        if (type !== 'spot') {
            throw new NotSupported (this.id + ' fetchMyLiquidations() supports spot margin markets only');
        }
        let request: Dict = {};
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        } else {
            request['startTime'] = this.milliseconds () - 7776000000;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchMyLiquidations', params, 'cross');
        if (marginMode === 'isolated') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchMyLiquidations() requires a symbol argument');
            }
            request['symbol'] = market['id'];
            response = await this.privateMarginGetV2MarginIsolatedLiquidationHistory (this.extend (request, params));
        } else if (marginMode === 'cross') {
            response = await this.privateMarginGetV2MarginCrossedLiquidationHistory (this.extend (request, params));
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
        //                     "liqRiskRatio": "1.01",
        //                     "totalAssets": "1242.34",
        //                     "totalDebt": "1100",
        //                     "liqFee": "1.2",
        //                     "uTime": "1668134458717",
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
        //                     "liqRiskRatio": "1.01",
        //                     "totalAssets": "1242.34",
        //                     "totalDebt": "1100",
        //                     "LiqFee": "1.2",
        //                     "uTime": "1668134458717",
        //                     "cTime": "1653453245342"
        //                 }
        //             ],
        //             "maxId": "0",
        //             "minId": "0"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const liquidations = this.safeList (data, 'resultList', []);
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
        //         "liqRiskRatio": "1.01",
        //         "totalAssets": "1242.34",
        //         "totalDebt": "1100",
        //         "liqFee": "1.2",
        //         "uTime": "1692690126000"
        //         "cTime": "1653453245342"
        //     }
        //
        // cross
        //
        //     {
        //         "liqId": "123",
        //         "liqStartTime": "1653453245342",
        //         "liqEndTime": "16312423423432",
        //         "liqRiskRatio": "1.01",
        //         "totalAssets": "1242.34",
        //         "totalDebt": "1100",
        //         "LiqFee": "1.2",
        //         "uTime": "1692690126000"
        //         "cTime": "1653453245342"
        //     }
        //
        const marketId = this.safeString (liquidation, 'symbol');
        const timestamp = this.safeInteger (liquidation, 'liqEndTime');
        const liquidationFee = this.safeString2 (liquidation, 'LiqFee', 'liqFee');
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

    /**
     * @method
     * @name bitget#fetchIsolatedBorrowRate
     * @description fetch the rate of interest to borrow a currency for margin trading
     * @see https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Margin-Interest-Rate-And-Max-Borrowable-Amount
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [isolated borrow rate structure]{@link https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure}
     */
    async fetchIsolatedBorrowRate (symbol: string, params = {}): Promise<IsolatedBorrowRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.privateMarginGetV2MarginIsolatedInterestRateAndLimit (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700878692567,
        //         "data": [
        //             {
        //                 "symbol": "BTCUSDT",
        //                 "leverage": "10",
        //                 "baseCoin": "BTC",
        //                 "baseTransferable": true,
        //                 "baseBorrowable": true,
        //                 "baseDailyInterestRate": "0.00007",
        //                 "baseAnnuallyInterestRate": "0.02555",
        //                 "baseMaxBorrowableAmount": "27",
        //                 "baseVipList": [
        //                     {"level":"0","dailyInterestRate":"0.00007","limit":"27","annuallyInterestRate":"0.02555","discountRate":"1"},
        //                     {"level":"1","dailyInterestRate":"0.0000679","limit":"27.81","annuallyInterestRate":"0.0247835","discountRate":"0.97"},
        //                     {"level":"2","dailyInterestRate":"0.0000644","limit":"29.16","annuallyInterestRate":"0.023506","discountRate":"0.92"},
        //                     {"level":"3","dailyInterestRate":"0.0000602","limit":"31.32","annuallyInterestRate":"0.021973","discountRate":"0.86"},
        //                     {"level":"4","dailyInterestRate":"0.0000525","limit":"35.91","annuallyInterestRate":"0.0191625","discountRate":"0.75"},
        //                     {"level":"5","dailyInterestRate":"0.000042","limit":"44.82","annuallyInterestRate":"0.01533","discountRate":"0.6"}
        //                 ],
        //                 "quoteCoin": "USDT",
        //                 "quoteTransferable": true,
        //                 "quoteBorrowable": true,
        //                 "quoteDailyInterestRate": "0.00041095",
        //                 "quoteAnnuallyInterestRate": "0.14999675",
        //                 "quoteMaxBorrowableAmount": "300000",
        //                 "quoteList": [
        //                     {"level":"0","dailyInterestRate":"0.00041095","limit":"300000","annuallyInterestRate":"0.14999675","discountRate":"1"},
        //                     {"level":"1","dailyInterestRate":"0.00039863","limit":"309000","annuallyInterestRate":"0.14549995","discountRate":"0.97"},
        //                     {"level":"2","dailyInterestRate":"0.00037808","limit":"324000","annuallyInterestRate":"0.1379992","discountRate":"0.92"},
        //                     {"level":"3","dailyInterestRate":"0.00035342","limit":"348000","annuallyInterestRate":"0.1289983","discountRate":"0.86"},
        //                     {"level":"4","dailyInterestRate":"0.00030822","limit":"399000","annuallyInterestRate":"0.1125003","discountRate":"0.75"},
        //                     {"level":"5","dailyInterestRate":"0.00024657","limit":"498000","annuallyInterestRate":"0.08999805","discountRate":"0.6"}
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

    parseIsolatedBorrowRate (info: Dict, market: Market = undefined): IsolatedBorrowRate {
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "leverage": "10",
        //         "baseCoin": "BTC",
        //         "baseTransferable": true,
        //         "baseBorrowable": true,
        //         "baseDailyInterestRate": "0.00007",
        //         "baseAnnuallyInterestRate": "0.02555",
        //         "baseMaxBorrowableAmount": "27",
        //         "baseVipList": [
        //             {"level":"0","dailyInterestRate":"0.00007","limit":"27","annuallyInterestRate":"0.02555","discountRate":"1"},
        //             {"level":"1","dailyInterestRate":"0.0000679","limit":"27.81","annuallyInterestRate":"0.0247835","discountRate":"0.97"},
        //             {"level":"2","dailyInterestRate":"0.0000644","limit":"29.16","annuallyInterestRate":"0.023506","discountRate":"0.92"},
        //             {"level":"3","dailyInterestRate":"0.0000602","limit":"31.32","annuallyInterestRate":"0.021973","discountRate":"0.86"},
        //             {"level":"4","dailyInterestRate":"0.0000525","limit":"35.91","annuallyInterestRate":"0.0191625","discountRate":"0.75"},
        //             {"level":"5","dailyInterestRate":"0.000042","limit":"44.82","annuallyInterestRate":"0.01533","discountRate":"0.6"}
        //         ],
        //         "quoteCoin": "USDT",
        //         "quoteTransferable": true,
        //         "quoteBorrowable": true,
        //         "quoteDailyInterestRate": "0.00041095",
        //         "quoteAnnuallyInterestRate": "0.14999675",
        //         "quoteMaxBorrowableAmount": "300000",
        //         "quoteList": [
        //             {"level":"0","dailyInterestRate":"0.00041095","limit":"300000","annuallyInterestRate":"0.14999675","discountRate":"1"},
        //             {"level":"1","dailyInterestRate":"0.00039863","limit":"309000","annuallyInterestRate":"0.14549995","discountRate":"0.97"},
        //             {"level":"2","dailyInterestRate":"0.00037808","limit":"324000","annuallyInterestRate":"0.1379992","discountRate":"0.92"},
        //             {"level":"3","dailyInterestRate":"0.00035342","limit":"348000","annuallyInterestRate":"0.1289983","discountRate":"0.86"},
        //             {"level":"4","dailyInterestRate":"0.00030822","limit":"399000","annuallyInterestRate":"0.1125003","discountRate":"0.75"},
        //             {"level":"5","dailyInterestRate":"0.00024657","limit":"498000","annuallyInterestRate":"0.08999805","discountRate":"0.6"}
        //         ]
        //     }
        //
        const marketId = this.safeString (info, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, 'spot');
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

    /**
     * @method
     * @name bitget#fetchCrossBorrowRate
     * @description fetch the rate of interest to borrow a currency for margin trading
     * @see https://www.bitget.com/api-doc/margin/cross/account/Get-Cross-Margin-Interest-Rate-And-Borrowable
     * @see https://www.bitget.com/api-doc/uta/public/Get-Margin-Loans
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} a [borrow rate structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#borrow-rate-structure}
     */
    async fetchCrossBorrowRate (code: string, params = {}): Promise<CrossBorrowRate> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'coin': currency['id'],
        };
        let uta = undefined;
        let response = undefined;
        let result = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchCrossBorrowRate', 'uta', false);
        if (uta) {
            response = await this.publicUtaGetV3MarketMarginLoans (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1752817798893,
            //         "data": {
            //             "dailyInterest": "0.00100008",
            //             "annualInterest": "0.3650292",
            //             "limit": "100"
            //         }
            //     }
            //
            result = this.safeDict (response, 'data', {});
        } else {
            response = await this.privateMarginGetV2MarginCrossedInterestRateAndLimit (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1700879047861,
            //         "data": [
            //             {
            //                 "coin": "BTC",
            //                 "leverage": "3",
            //                 "transferable": true,
            //                 "borrowable": true,
            //                 "dailyInterestRate": "0.00007",
            //                 "annualInterestRate": "0.02555",
            //                 "maxBorrowableAmount": "26",
            //                 "vipList": [
            //                     {"level":"0","limit":"26","dailyInterestRate":"0.00007","annualInterestRate":"0.02555","discountRate":"1"},
            //                     {"level":"1","limit":"26.78","dailyInterestRate":"0.0000679","annualInterestRate":"0.0247835","discountRate":"0.97"},
            //                     {"level":"2","limit":"28.08","dailyInterestRate":"0.0000644","annualInterestRate":"0.023506","discountRate":"0.92"},
            //                     {"level":"3","limit":"30.16","dailyInterestRate":"0.0000602","annualInterestRate":"0.021973","discountRate":"0.86"},
            //                     {"level":"4","limit":"34.58","dailyInterestRate":"0.0000525","annualInterestRate":"0.0191625","discountRate":"0.75"},
            //                     {"level":"5","limit":"43.16","dailyInterestRate":"0.000042","annualInterestRate":"0.01533","discountRate":"0.6"}
            //                 ]
            //             }
            //         ]
            //     }
            //
            const data = this.safeValue (response, 'data', []);
            result = this.safeValue (data, 0, {});
        }
        const timestamp = this.safeInteger (response, 'requestTime');
        result['timestamp'] = timestamp;
        return this.parseBorrowRate (result, currency);
    }

    parseBorrowRate (info, currency: Currency = undefined) {
        //
        // default
        //
        //     {
        //         "coin": "BTC",
        //         "leverage": "3",
        //         "transferable": true,
        //         "borrowable": true,
        //         "dailyInterestRate": "0.00007",
        //         "annualInterestRate": "0.02555",
        //         "maxBorrowableAmount": "26",
        //         "vipList": [
        //             {"level":"0","limit":"26","dailyInterestRate":"0.00007","annualInterestRate":"0.02555","discountRate":"1"},
        //             {"level":"1","limit":"26.78","dailyInterestRate":"0.0000679","annualInterestRate":"0.0247835","discountRate":"0.97"},
        //             {"level":"2","limit":"28.08","dailyInterestRate":"0.0000644","annualInterestRate":"0.023506","discountRate":"0.92"},
        //             {"level":"3","limit":"30.16","dailyInterestRate":"0.0000602","annualInterestRate":"0.021973","discountRate":"0.86"},
        //             {"level":"4","limit":"34.58","dailyInterestRate":"0.0000525","annualInterestRate":"0.0191625","discountRate":"0.75"},
        //             {"level":"5","limit":"43.16","dailyInterestRate":"0.000042","annualInterestRate":"0.01533","discountRate":"0.6"}
        //         ]
        //     }
        //
        // uta
        //
        //     {
        //         "dailyInterest": "0.00100008",
        //         "annualInterest": "0.3650292",
        //         "limit": "100"
        //     }
        //
        const currencyId = this.safeString (info, 'coin');
        const timestamp = this.safeInteger (info, 'timestamp');
        return {
            'currency': this.safeCurrencyCode (currencyId, currency),
            'rate': this.safeNumber2 (info, 'dailyInterestRate', 'dailyInterest'),
            'period': 86400000, // 1-Day
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    /**
     * @method
     * @name bitget#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://www.bitget.com/api-doc/margin/cross/record/Get-Cross-Interest-Records
     * @see https://www.bitget.com/api-doc/margin/isolated/record/Get-Isolated-Interest-Records
     * @param {string} [code] unified currency code
     * @param {string} [symbol] unified market symbol when fetching interest in isolated markets
     * @param {int} [since] the earliest time in ms to fetch borrow interest for
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    async fetchBorrowInterest (code: Str = undefined, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<BorrowInterest[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchBorrowInterest', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchBorrowInterest', symbol, since, limit, params, 'minId', 'idLessThan') as BorrowInterest[];
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {};
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
            request['limit'] = limit;
        }
        let response = undefined;
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchBorrowInterest', params, 'cross');
        if (marginMode === 'isolated') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchBorrowInterest() requires a symbol argument');
            }
            request['symbol'] = market['id'];
            response = await this.privateMarginGetV2MarginIsolatedInterestHistory (this.extend (request, params));
        } else if (marginMode === 'cross') {
            response = await this.privateMarginGetV2MarginCrossedInterestHistory (this.extend (request, params));
        }
        //
        // isolated
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700879935189,
        //         "data": {
        //             "resultList": [
        //                 {
        //                     "interestId": "1112125304879067137",
        //                     "interestCoin": "USDT",
        //                     "dailyInterestRate": "0.00041095",
        //                     "loanCoin": "USDT",
        //                     "interestAmount": "0.0000685",
        //                     "interstType": "first",
        //                     "symbol": "BTCUSDT",
        //                     "cTime": "1700877255648",
        //                     "uTime": "1700877255648"
        //                 },
        //             ],
        //             "maxId": "1112125304879067137",
        //             "minId": "1100138015672119298"
        //         }
        //     }
        //
        // cross
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1700879597044,
        //         "data": {
        //             "resultList": [
        //                 {
        //                     "interestId": "1112122013642272769",
        //                     "interestCoin": "USDT",
        //                     "dailyInterestRate": "0.00041",
        //                     "loanCoin": "USDT",
        //                     "interestAmount": "0.00006834",
        //                     "interstType": "first",
        //                     "cTime": "1700876470957",
        //                     "uTime": "1700876470957"
        //                 },
        //             ],
        //             "maxId": "1112122013642272769",
        //             "minId": "1096917004629716993"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const rows = this.safeValue (data, 'resultList', []);
        const interest = this.parseBorrowInterests (rows, market);
        return this.filterByCurrencySinceLimit (interest, code, since, limit);
    }

    parseBorrowInterest (info: Dict, market: Market = undefined): BorrowInterest {
        //
        // isolated
        //
        //     {
        //         "interestId": "1112125304879067137",
        //         "interestCoin": "USDT",
        //         "dailyInterestRate": "0.00041095",
        //         "loanCoin": "USDT",
        //         "interestAmount": "0.0000685",
        //         "interstType": "first",
        //         "symbol": "BTCUSDT",
        //         "cTime": "1700877255648",
        //         "uTime": "1700877255648"
        //     }
        //
        // cross
        //
        //     {
        //         "interestId": "1112122013642272769",
        //         "interestCoin": "USDT",
        //         "dailyInterestRate": "0.00041",
        //         "loanCoin": "USDT",
        //         "interestAmount": "0.00006834",
        //         "interstType": "first",
        //         "cTime": "1700876470957",
        //         "uTime": "1700876470957"
        //     }
        //
        const marketId = this.safeString (info, 'symbol');
        market = this.safeMarket (marketId, market);
        const marginMode = (marketId !== undefined) ? 'isolated' : 'cross';
        const timestamp = this.safeInteger (info, 'cTime');
        return {
            'info': info,
            'symbol': this.safeString (market, 'symbol'),
            'currency': this.safeCurrencyCode (this.safeString (info, 'interestCoin')),
            'interest': this.safeNumber (info, 'interestAmount'),
            'interestRate': this.safeNumber (info, 'dailyInterestRate'),
            'amountBorrowed': undefined,
            'marginMode': marginMode,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        } as BorrowInterest;
    }

    /**
     * @method
     * @name bitget#closePosition
     * @description closes an open position for a market
     * @see https://www.bitget.com/api-doc/contract/trade/Flash-Close-Position
     * @see https://www.bitget.com/api-doc/uta/trade/Close-All-Positions
     * @param {string} symbol unified CCXT market symbol
     * @param {string} [side] one-way mode: 'buy' or 'sell', hedge-mode: 'long' or 'short'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let productType = undefined;
        let uta = undefined;
        let response = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        [ uta, params ] = this.handleOptionAndParams (params, 'closePosition', 'uta', false);
        if (uta) {
            if (side !== undefined) {
                request['posSide'] = side;
            }
            request['category'] = productType;
            response = await this.privateUtaPostV3TradeClosePositions (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1751020218384,
            //         "data": {
            //             "list": [
            //                 {
            //                     "orderId": "1322440134099320832",
            //                     "clientOid": "1322440134099320833"
            //                 }
            //             ]
            //         }
            //     }
            //
        } else {
            if (side !== undefined) {
                request['holdSide'] = side;
            }
            request['productType'] = productType;
            response = await this.privateMixPostV2MixOrderClosePositions (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1702975017017,
            //         "data": {
            //             "successList": [
            //                 {
            //                     "orderId": "1120923953904893955",
            //                     "clientOid": "1120923953904893956"
            //                 }
            //             ],
            //             "failureList": [],
            //             "result": false
            //         }
            //     }
            //
        }
        const data = this.safeValue (response, 'data', {});
        const order = this.safeList2 (data, 'successList', 'list', []);
        return this.parseOrder (order[0], market);
    }

    /**
     * @method
     * @name bitget#closeAllPositions
     * @description closes all open positions for a market type
     * @see https://www.bitget.com/api-doc/contract/trade/Flash-Close-Position
     * @see https://www.bitget.com/api-doc/uta/trade/Close-All-Positions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.productType] 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object[]} A list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async closeAllPositions (params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let productType = undefined;
        let uta = undefined;
        let response = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (undefined, params);
        [ uta, params ] = this.handleOptionAndParams (params, 'closeAllPositions', 'uta', false);
        if (uta) {
            request['category'] = productType;
            response = await this.privateUtaPostV3TradeClosePositions (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1751020218384,
            //         "data": {
            //             "list": [
            //                 {
            //                     "orderId": "1322440134099320832",
            //                     "clientOid": "1322440134099320833"
            //                 }
            //             ]
            //         }
            //     }
            //
        } else {
            request['productType'] = productType;
            response = await this.privateMixPostV2MixOrderClosePositions (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1702975017017,
            //         "data": {
            //             "successList": [
            //                 {
            //                     "orderId": "1120923953904893955",
            //                     "clientOid": "1120923953904893956"
            //                 }
            //             ],
            //             "failureList": [],
            //             "result": false
            //         }
            //     }
            //
        }
        const data = this.safeValue (response, 'data', {});
        const orderInfo = this.safeList2 (data, 'successList', 'list', []);
        return this.parsePositions (orderInfo, undefined, params);
    }

    /**
     * @method
     * @name bitget#fetchMarginMode
     * @description fetches the margin mode of a trading pair
     * @see https://www.bitget.com/api-doc/contract/account/Get-Single-Account
     * @param {string} symbol unified symbol of the market to fetch the margin mode for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
     */
    async fetchMarginMode (symbol: string, params = {}): Promise<MarginMode> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        const request: Dict = {
            'symbol': market['id'],
            'marginCoin': market['settleId'],
            'productType': productType,
        };
        const response = await this.privateMixGetV2MixAccountAccount (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1709791216652,
        //         "data": {
        //             "marginCoin": "USDT",
        //             "locked": "0",
        //             "available": "19.88811074",
        //             "crossedMaxAvailable": "19.88811074",
        //             "isolatedMaxAvailable": "19.88811074",
        //             "maxTransferOut": "19.88811074",
        //             "accountEquity": "19.88811074",
        //             "usdtEquity": "19.888110749166",
        //             "btcEquity": "0.000302183391",
        //             "crossedRiskRate": "0",
        //             "crossedMarginLeverage": 20,
        //             "isolatedLongLever": 20,
        //             "isolatedShortLever": 20,
        //             "marginMode": "crossed",
        //             "posMode": "hedge_mode",
        //             "unrealizedPL": "0",
        //             "coupon": "0",
        //             "crossedUnrealizedPL": "0",
        //             "isolatedUnrealizedPL": ""
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseMarginMode (data, market);
    }

    parseMarginMode (marginMode: Dict, market = undefined): MarginMode {
        let marginType = this.safeString (marginMode, 'marginMode');
        marginType = (marginType === 'crossed') ? 'cross' : marginType;
        return {
            'info': marginMode,
            'symbol': market['symbol'],
            'marginMode': marginType,
        } as MarginMode;
    }

    /**
     * @method
     * @name bitget#fetchPositionsHistory
     * @description fetches historical positions
     * @see https://www.bitget.com/api-doc/contract/position/Get-History-Position
     * @see https://www.bitget.com/api-doc/uta/trade/Get-Position-History
     * @param {string[]} [symbols] unified contract symbols
     * @param {int} [since] timestamp in ms of the earliest position to fetch, default=3 months ago, max range for params["until"] - since is 3 months
     * @param {int} [limit] the maximum amount of records to fetch, default=20, max=100
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] timestamp in ms of the latest position to fetch, max range for params["until"] - since is 3 months
     * @param {string} [params.productType] USDT-FUTURES (default), COIN-FUTURES, USDC-FUTURES, SUSDT-FUTURES, SCOIN-FUTURES, or SUSDC-FUTURES
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositionsHistory (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        let request: Dict = {};
        let market = undefined;
        let productType = undefined;
        let uta = undefined;
        let response = undefined;
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength > 0) {
                market = this.market (symbols[0]);
                request['symbol'] = market['id'];
            }
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchPositionsHistory', 'uta', false);
        if (uta) {
            request['category'] = productType;
            response = await this.privateUtaGetV3PositionHistoryPosition (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1751020950427,
            //         "data": {
            //             "list": [
            //                 {
            //                     "positionId": "1322441328637100049",
            //                     "category": "USDT-FUTURES",
            //                     "symbol": "BTCUSDT",
            //                     "marginCoin": "USDT",
            //                     "holdMode": "hedge_mode",
            //                     "posSide": "long",
            //                     "marginMode": "crossed",
            //                     "openPriceAvg": "107003.7",
            //                     "closePriceAvg": "107005.4",
            //                     "openTotalPos": "0.0001",
            //                     "closeTotalPos": "0.0001",
            //                     "cumRealisedPnl": "0.00017",
            //                     "netProfit": "-0.01267055",
            //                     "totalFunding": "0",
            //                     "openFeeTotal": "-0.00642022",
            //                     "closeFeeTotal": "-0.00642032",
            //                     "createdTime": "1751020503195",
            //                     "updatedTime": "1751020520458"
            //                 },
            //             ],
            //             "cursor": "1322440134158041089"
            //         }
            //     }
            //
        } else {
            response = await this.privateMixGetV2MixPositionHistoryPosition (this.extend (request, params));
            //
            //    {
            //        code: '00000',
            //        msg: 'success',
            //        requestTime: '1712794148791',
            //        data: {
            //            list: [
            //                {
            //                    symbol: 'XRPUSDT',
            //                    marginCoin: 'USDT',
            //                    holdSide: 'long',
            //                    openAvgPrice: '0.64967',
            //                    closeAvgPrice: '0.58799',
            //                    marginMode: 'isolated',
            //                    openTotalPos: '10',
            //                    closeTotalPos: '10',
            //                    pnl: '-0.62976205',
            //                    netProfit: '-0.65356802',
            //                    totalFunding: '-0.01638',
            //                    openFee: '-0.00389802',
            //                    closeFee: '-0.00352794',
            //                    ctime: '1709590322199',
            //                    utime: '1709667583395'
            //                },
            //                ...
            //            ]
            //        }
            //    }
            //
        }
        const data = this.safeDict (response, 'data', {});
        const responseList = this.safeList (data, 'list', []);
        const positions = this.parsePositions (responseList, symbols, params);
        return this.filterBySinceLimit (positions, since, limit);
    }

    /**
     * @method
     * @name bitget#fetchConvertQuote
     * @description fetch a quote for converting from one currency to another
     * @see https://www.bitget.com/api-doc/common/convert/Get-Quoted-Price
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async fetchConvertQuote (fromCode: string, toCode: string, amount: Num = undefined, params = {}): Promise<Conversion> {
        await this.loadMarkets ();
        const request: Dict = {
            'fromCoin': fromCode,
            'toCoin': toCode,
            'fromCoinSize': this.numberToString (amount),
        };
        const response = await this.privateConvertGetV2ConvertQuotedPrice (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1712121940158,
        //         "data": {
        //             "fromCoin": "USDT",
        //             "fromCoinSize": "5",
        //             "cnvtPrice": "0.9993007892377704",
        //             "toCoin": "USDC",
        //             "toCoinSize": "4.99650394",
        //             "traceId": "1159288930228187140",
        //             "fee": "0"
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const fromCurrencyId = this.safeString (data, 'fromCoin', fromCode);
        const fromCurrency = this.currency (fromCurrencyId);
        const toCurrencyId = this.safeString (data, 'toCoin', toCode);
        const toCurrency = this.currency (toCurrencyId);
        return this.parseConversion (data, fromCurrency, toCurrency);
    }

    /**
     * @method
     * @name bitget#createConvertTrade
     * @description convert from one currency to another
     * @see https://www.bitget.com/api-doc/common/convert/Trade
     * @param {string} id the id of the trade that you want to make
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} amount how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.price the price of the conversion, obtained from fetchConvertQuote()
     * @param {string} params.toAmount the amount you want to trade in units of the toCurrency, obtained from fetchConvertQuote()
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async createConvertTrade (id: string, fromCode: string, toCode: string, amount: Num = undefined, params = {}): Promise<Conversion> {
        await this.loadMarkets ();
        const price = this.safeString2 (params, 'price', 'cnvtPrice');
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' createConvertTrade() requires a price parameter');
        }
        const toAmount = this.safeString2 (params, 'toAmount', 'toCoinSize');
        if (toAmount === undefined) {
            throw new ArgumentsRequired (this.id + ' createConvertTrade() requires a toAmount parameter');
        }
        params = this.omit (params, [ 'price', 'toAmount' ]);
        const request: Dict = {
            'traceId': id,
            'fromCoin': fromCode,
            'toCoin': toCode,
            'fromCoinSize': this.numberToString (amount),
            'toCoinSize': toAmount,
            'cnvtPrice': price,
        };
        const response = await this.privateConvertPostV2ConvertTrade (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1712123746203,
        //         "data": {
        //             "cnvtPrice": "0.99940076",
        //             "toCoin": "USDC",
        //             "toCoinSize": "4.99700379",
        //             "ts": "1712123746217"
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const toCurrencyId = this.safeString (data, 'toCoin', toCode);
        const toCurrency = this.currency (toCurrencyId);
        return this.parseConversion (data, undefined, toCurrency);
    }

    /**
     * @method
     * @name bitget#fetchConvertTradeHistory
     * @description fetch the users history of conversion trades
     * @see https://www.bitget.com/api-doc/common/convert/Get-Convert-Record
     * @param {string} [code] the unified currency code
     * @param {int} [since] the earliest time in ms to fetch conversions for
     * @param {int} [limit] the maximum number of conversion structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [conversion structures]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async fetchConvertTradeHistory (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Conversion[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        const msInDay = 86400000;
        const now = this.milliseconds ();
        if (since !== undefined) {
            request['startTime'] = since;
        } else {
            request['startTime'] = now - msInDay;
        }
        const endTime = this.safeString2 (params, 'endTime', 'until');
        if (endTime !== undefined) {
            request['endTime'] = endTime;
        } else {
            request['endTime'] = now;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        params = this.omit (params, 'until');
        const response = await this.privateConvertGetV2ConvertConvertRecord (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1712124371799,
        //         "data": {
        //             "dataList": [
        //                 {
        //                     "id": "1159296505255219205",
        //                     "fromCoin": "USDT",
        //                     "fromCoinSize": "5",
        //                     "cnvtPrice": "0.99940076",
        //                     "toCoin": "USDC",
        //                     "toCoinSize": "4.99700379",
        //                     "ts": "1712123746217",
        //                     "fee": "0"
        //                 }
        //             ],
        //             "endId": "1159296505255219205"
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const dataList = this.safeList (data, 'dataList', []);
        return this.parseConversions (dataList, code, 'fromCoin', 'toCoin', since, limit);
    }

    parseConversion (conversion: Dict, fromCurrency: Currency = undefined, toCurrency: Currency = undefined): Conversion {
        //
        // fetchConvertQuote
        //
        //     {
        //         "fromCoin": "USDT",
        //         "fromCoinSize": "5",
        //         "cnvtPrice": "0.9993007892377704",
        //         "toCoin": "USDC",
        //         "toCoinSize": "4.99650394",
        //         "traceId": "1159288930228187140",
        //         "fee": "0"
        //     }
        //
        // createConvertTrade
        //
        //     {
        //         "cnvtPrice": "0.99940076",
        //         "toCoin": "USDC",
        //         "toCoinSize": "4.99700379",
        //         "ts": "1712123746217"
        //     }
        //
        // fetchConvertTradeHistory
        //
        //     {
        //         "id": "1159296505255219205",
        //         "fromCoin": "USDT",
        //         "fromCoinSize": "5",
        //         "cnvtPrice": "0.99940076",
        //         "toCoin": "USDC",
        //         "toCoinSize": "4.99700379",
        //         "ts": "1712123746217",
        //         "fee": "0"
        //     }
        //
        const timestamp = this.safeInteger (conversion, 'ts');
        const fromCoin = this.safeString (conversion, 'fromCoin');
        const fromCode = this.safeCurrencyCode (fromCoin, fromCurrency);
        const to = this.safeString (conversion, 'toCoin');
        const toCode = this.safeCurrencyCode (to, toCurrency);
        return {
            'info': conversion,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': this.safeString2 (conversion, 'id', 'traceId'),
            'fromCurrency': fromCode,
            'fromAmount': this.safeNumber (conversion, 'fromCoinSize'),
            'toCurrency': toCode,
            'toAmount': this.safeNumber (conversion, 'toCoinSize'),
            'price': this.safeNumber (conversion, 'cnvtPrice'),
            'fee': this.safeNumber (conversion, 'fee'),
        } as Conversion;
    }

    /**
     * @method
     * @name bitget#fetchConvertCurrencies
     * @description fetches all available currencies that can be converted
     * @see https://www.bitget.com/api-doc/common/convert/Get-Convert-Currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchConvertCurrencies (params = {}): Promise<Currencies> {
        await this.loadMarkets ();
        const response = await this.privateConvertGetV2ConvertCurrencies (params);
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1712121755897,
        //         "data": [
        //             {
        //                 "coin": "BTC",
        //                 "available": "0.00009850",
        //                 "maxAmount": "0.756266",
        //                 "minAmount": "0.00001"
        //             },
        //         ]
        //     }
        //
        const result: Dict = {};
        const data = this.safeList (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const id = this.safeString (entry, 'coin');
            const code = this.safeCurrencyCode (id);
            result[code] = {
                'info': entry,
                'id': id,
                'code': code,
                'networks': undefined,
                'type': undefined,
                'name': undefined,
                'active': undefined,
                'deposit': undefined,
                'withdraw': this.safeNumber (entry, 'available'),
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (entry, 'minAmount'),
                        'max': this.safeNumber (entry, 'maxAmount'),
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
     * @name bitget#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://www.bitget.com/api-doc/contract/market/Get-Symbol-Next-Funding-Time
     * @see https://www.bitget.com/api-doc/uta/public/Get-Current-Funding-Rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingInterval (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let productType = undefined;
        [ productType, params ] = this.handleProductTypeAndParams (market, params);
        const request: Dict = {
            'symbol': market['id'],
        };
        let response = undefined;
        let uta = undefined;
        [ uta, params ] = this.handleOptionAndParams (params, 'fetchFundingInterval', 'uta', false);
        if (uta) {
            response = await this.publicUtaGetV3MarketCurrentFundRate (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1752880157959,
            //         "data": [
            //             {
            //                 "symbol": "BTCUSDT",
            //                 "fundingRate": "0.0001",
            //                 "fundingRateInterval": "8",
            //                 "nextUpdate": "1752883200000",
            //                 "minFundingRate": "-0.003",
            //                 "maxFundingRate": "0.003"
            //             }
            //         ]
            //     }
            //
        } else {
            request['productType'] = productType;
            response = await this.publicMixGetV2MixMarketFundingTime (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1727930153888,
            //         "data": [
            //             {
            //                 "symbol": "BTCUSDT",
            //                 "nextFundingTime": "1727942400000",
            //                 "ratePeriod": "8"
            //             }
            //         ]
            //     }
            //
        }
        const data = this.safeList (response, 'data', []);
        const first = this.safeDict (data, 0, {});
        return this.parseFundingRate (first, market);
    }

    /**
     * @method
     * @name bitget#fetchLongShortRatioHistory
     * @description fetches the long short ratio history for a unified market symbol
     * @see https://www.bitget.com/api-doc/common/apidata/Margin-Ls-Ratio
     * @see https://www.bitget.com/api-doc/common/apidata/Account-Long-Short
     * @param {string} symbol unified symbol of the market to fetch the long short ratio for
     * @param {string} [timeframe] the period for the ratio
     * @param {int} [since] the earliest time in ms to fetch ratios for
     * @param {int} [limit] the maximum number of long short ratio structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of [long short ratio structures]{@link https://docs.ccxt.com/#/?id=long-short-ratio-structure}
     */
    async fetchLongShortRatioHistory (symbol: Str = undefined, timeframe: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LongShortRatio[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (timeframe !== undefined) {
            request['period'] = timeframe;
        }
        let response = undefined;
        if (market['swap'] || market['future']) {
            response = await this.publicMixGetV2MixMarketAccountLongShort (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1729321233281,
            //         "data": [
            //             {
            //                 "longAccountRatio": "0.58",
            //                 "shortAccountRatio": "0.42",
            //                 "longShortAccountRatio": "0.0138",
            //                 "ts": "1729312200000"
            //             },
            //         ]
            //     }
            //
        } else {
            response = await this.publicMarginGetV2MarginMarketLongShortRatio (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1729306974712,
            //         "data": [
            //             {
            //                 "longShortRatio": "40.66",
            //                 "ts": "1729306800000"
            //             },
            //         ]
            //     }
            //
        }
        const data = this.safeList (response, 'data', []);
        return this.parseLongShortRatioHistory (data, market);
    }

    parseLongShortRatio (info: Dict, market: Market = undefined): LongShortRatio {
        const marketId = this.safeString (info, 'symbol');
        const timestamp = this.safeIntegerOmitZero (info, 'ts');
        return {
            'info': info,
            'symbol': this.safeSymbol (marketId, market, undefined, 'contract'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'timeframe': undefined,
            'longShortRatio': this.safeNumber2 (info, 'longShortRatio', 'longShortAccountRatio'),
        } as LongShortRatio;
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        // spot
        //
        //     {"code":"00000","msg":"success","requestTime":1713294492511,"data":[...]}"
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
        const message = this.safeString2 (response, 'err_msg', 'msg');
        const feedback = this.id + ' ' + body;
        const nonEmptyMessage = ((message !== undefined) && (message !== '') && (message !== 'success'));
        if (nonEmptyMessage) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        }
        const errorCode = this.safeString2 (response, 'code', 'err_code');
        const nonZeroErrorCode = (errorCode !== undefined) && (errorCode !== '00000');
        if (nonZeroErrorCode) {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
        if (nonZeroErrorCode || nonEmptyMessage) {
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
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
            const timestamp = this.nonce ().toString ();
            let auth = timestamp + method + payload;
            if (method === 'POST') {
                body = this.json (params);
                auth += body;
            } else {
                if (Object.keys (params).length) {
                    let queryInner = '?' + this.urlencode (this.keysort (params));
                    // check #21169 pr
                    if (queryInner.indexOf ('%24') > -1) {
                        queryInner = queryInner.replace ('%24', '$');
                    }
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
        const sandboxMode = this.safeBool2 (this.options, 'sandboxMode', 'sandbox', false);
        if (sandboxMode && (path !== 'v2/public/time') && (path !== 'v3/market/current-fund-rate')) {
            // https://github.com/ccxt/ccxt/issues/25252#issuecomment-2662742336
            if (headers === undefined) {
                headers = {};
            }
            const productType = this.safeString (params, 'productType');
            if ((productType !== 'SCOIN-FUTURES') && (productType !== 'SUSDT-FUTURES') && (productType !== 'SUSDC-FUTURES')) {
                headers['PAPTRADING'] = '1';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
