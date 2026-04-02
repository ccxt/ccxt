'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var kucoin$1 = require('./abstract/kucoin.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class kucoin
 * @augments Exchange
 */
class kucoin extends kucoin$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'kucoin',
            'name': 'KuCoin',
            'countries': ['SC'],
            'rateLimit': 7.5,
            'version': 'v2',
            'certified': true,
            'pro': true,
            'comment': 'Platform 2.0',
            'quoteJsonNumbers': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': true,
                'borrowCrossMargin': true,
                'borrowIsolatedMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': true,
                'createDepositAddress': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': true,
                'createMarketSellOrderWithCost': true,
                'createOrder': true,
                'createOrders': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createPostOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopLossOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTakeProfitOrder': true,
                'createTriggerOrder': true,
                'editOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBorrowInterest': true,
                'fetchBorrowRateHistories': true,
                'fetchBorrowRateHistory': true,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': true,
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': true,
                'fetchFundingInterval': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': true,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchLeverageTiers': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': true,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMarkPrice': true,
                'fetchMarkPrices': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': true,
                'fetchOpenInterests': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrdersByStatus': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionADLRank': true,
                'fetchPositionHistory': true,
                'fetchPositionMode': true,
                'fetchPositions': true,
                'fetchPositionsADLRank': true,
                'fetchPositionsHistory': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTransactionFee': true,
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'repayCrossMargin': true,
                'repayIsolatedMargin': true,
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': true,
                'signIn': false,
                'transfer': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87295558-132aaf80-c50e-11ea-9801-a2fb0c57c799.jpg',
                'referral': 'https://www.kucoin.com/ucenter/signup?rcode=E5wkqe',
                'api': {
                    'public': 'https://api.kucoin.com',
                    'private': 'https://api.kucoin.com',
                    'futuresPrivate': 'https://api-futures.kucoin.com',
                    'futuresPublic': 'https://api-futures.kucoin.com',
                    'webExchange': 'https://kucoin.com/_api',
                    'broker': 'https://api-broker.kucoin.com',
                    'earn': 'https://api.kucoin.com',
                    'uta': 'https://api.kucoin.com',
                    'utaPrivate': 'https://api.kucoin.com',
                },
                'www': 'https://www.kucoin.com',
                'doc': [
                    'https://docs.kucoin.com',
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'api': {
                // level VIP0
                // Spot => 4000/30s
                // Weight = x
                // Pro, Futures, Management, Management, Earn, CopyTrading => 2000/30s
                // Weight = x*2
                'public': {
                    'get': {
                        // spot trading
                        'currencies': 3,
                        'currencies/{currency}': 3,
                        'symbols': 4,
                        'market/orderbook/level1': 2,
                        'market/allTickers': 15,
                        'market/stats': 15,
                        'markets': 3,
                        'market/orderbook/level{level}_{limit}': 4,
                        'market/orderbook/level2_20': 2,
                        'market/orderbook/level2_100': 4,
                        'market/histories': 3,
                        'market/candles': 3,
                        'prices': 3,
                        'timestamp': 3,
                        'status': 3,
                        // margin trading
                        'mark-price/{symbol}/current': 2,
                        'mark-price/all-symbols': 10,
                        'margin/config': 25,
                        'announcements': 20,
                        'margin/collateralRatio': 10,
                        // convert
                        'convert/symbol': 5,
                        'convert/currencies': 5,
                    },
                    'post': {
                        // ws
                        'bullet-public': 10,
                    },
                },
                'private': {
                    'get': {
                        // account
                        'user-info': 20,
                        'user/api-key': 20,
                        'accounts': 5,
                        'accounts/{accountId}': 5,
                        'accounts/ledgers': 2,
                        'hf/accounts/ledgers': 2,
                        'hf/margin/account/ledgers': 2,
                        'transaction-history': 2,
                        'sub/user': 20,
                        'sub-accounts/{subUserId}': 15,
                        'sub-accounts': 20,
                        'sub/api-key': 20,
                        // funding
                        'margin/account': 40,
                        'margin/accounts': 15,
                        'isolated/accounts': 15,
                        'deposit-addresses': 5,
                        'deposits': 5,
                        'hist-deposits': 5,
                        'withdrawals': 20,
                        'hist-withdrawals': 20,
                        'withdrawals/quotas': 20,
                        'accounts/transferable': 20,
                        'transfer-list': 20,
                        'base-fee': 3,
                        'trade-fees': 3,
                        // spot trading
                        'market/orderbook/level{level}': 3,
                        'market/orderbook/level2': 3,
                        'market/orderbook/level3': 3,
                        'hf/accounts/opened': 2,
                        'hf/orders/active': 2,
                        'hf/orders/active/symbols': 2,
                        'hf/margin/order/active/symbols': 2,
                        'hf/orders/done': 2,
                        'hf/orders/{orderId}': 2,
                        'hf/orders/client-order/{clientOid}': 2,
                        'hf/orders/dead-cancel-all/query': 2,
                        'hf/fills': 2,
                        'orders': 2,
                        'limit/orders': 3,
                        'orders/{orderId}': 2,
                        'order/client-order/{clientOid}': 2,
                        'fills': 10,
                        'limit/fills': 20,
                        'stop-order': 8,
                        'stop-order/{orderId}': 3,
                        'stop-order/queryOrderByClientOid': 3,
                        'oco/order/{orderId}': 2,
                        'oco/order/details/{orderId}': 2,
                        'oco/client-order/{clientOid}': 2,
                        'oco/orders': 2,
                        // margin trading
                        'hf/margin/orders/active': 4,
                        'hf/margin/orders/done': 10,
                        'hf/margin/orders/{orderId}': 4,
                        'hf/margin/orders/client-order/{clientOid}': 5,
                        'hf/margin/fills': 5,
                        'hf/margin/stop-orders': 8,
                        'hf/margin/stop-order/orderId': 3,
                        'hf/margin/stop-order/clientOid': 3,
                        'hf/margin/oco-order/orderId': 2,
                        'hf/margin/oco-order/clientOid': 2,
                        'hf/margin/oco-order/detail/orderId': 2,
                        'hf/margin/oco-orders': 2,
                        'etf/info': 25,
                        'margin/currencies': 20,
                        'risk/limit/strategy': 20,
                        'isolated/symbols': 3,
                        'margin/symbols': 3,
                        'isolated/account/{symbol}': 50,
                        'margin/borrow': 15,
                        'margin/repay': 15,
                        'margin/interest': 20,
                        'project/list': 10,
                        'project/marketInterestRate': 5,
                        'redeem/orders': 10,
                        'purchase/orders': 10,
                        // broker
                        'broker/api/rebase/download': 3,
                        'broker/queryMyCommission': 3,
                        'broker/queryUser': 3,
                        'broker/queryDetailByUid': 3,
                        'migrate/user/account/status': 3,
                        // convert
                        'convert/quote': 20,
                        'convert/order/detail': 5,
                        'convert/order/history': 5,
                        'convert/limit/quote': 20,
                        'convert/limit/order/detail': 5,
                        'convert/limit/orders': 5,
                        // affiliate
                        'affiliate/inviter/statistics': 30,
                    },
                    'post': {
                        // account
                        'sub/user/created': 15,
                        'sub/api-key': 20,
                        'sub/api-key/update': 30,
                        // funding
                        'deposit-addresses': 20,
                        'withdrawals': 5,
                        'accounts/universal-transfer': 4,
                        'accounts/sub-transfer': 30,
                        'accounts/inner-transfer': 15,
                        'transfer-out': 20,
                        'transfer-in': 20,
                        // spot trading
                        'hf/orders': 1,
                        'hf/orders/test': 1,
                        'hf/orders/sync': 1,
                        'hf/orders/multi': 1,
                        'hf/orders/multi/sync': 1,
                        'hf/orders/alter': 1,
                        'hf/orders/dead-cancel-all': 2,
                        'orders': 2,
                        'orders/test': 2,
                        'orders/multi': 3,
                        'stop-order': 2,
                        'oco/order': 2,
                        // margin trading
                        'hf/margin/order': 2,
                        'hf/margin/order/test': 2,
                        'hf/margin/stop-order': 3,
                        'margin/order': 5,
                        'margin/order/test': 5,
                        'hf/margin/oco-order': 2,
                        'margin/borrow': 15,
                        'margin/repay': 10,
                        'purchase': 15,
                        'redeem': 15,
                        'lend/purchase/update': 10,
                        // convert
                        'convert/order': 20,
                        'convert/limit/order': 20,
                        // ws
                        'bullet-private': 10,
                        'position/update-user-leverage': 5,
                        'deposit-address/create': 20,
                    },
                    'delete': {
                        // account
                        'sub/api-key': 30,
                        // funding
                        'withdrawals/{withdrawalId}': 20,
                        // spot trading
                        'hf/orders/{orderId}': 1,
                        'hf/orders/sync/{orderId}': 1,
                        'hf/orders/client-order/{clientOid}': 1,
                        'hf/orders/sync/client-order/{clientOid}': 1,
                        'hf/orders/cancel/{orderId}': 1,
                        'hf/orders': 2,
                        'hf/orders/cancelAll': 30,
                        'orders/{orderId}': 3,
                        'order/client-order/{clientOid}': 5,
                        'orders': 20,
                        'stop-order/{orderId}': 3,
                        'stop-order/cancelOrderByClientOid': 5,
                        'stop-order/cancel': 3,
                        'oco/order/{orderId}': 3,
                        'oco/client-order/{clientOid}': 3,
                        'oco/orders': 3,
                        // margin trading
                        'hf/margin/orders/{orderId}': 2,
                        'hf/margin/orders/client-order/{clientOid}': 2,
                        'hf/margin/orders': 5,
                        'hf/margin/stop-order/cancel-by-id': 3,
                        'hf/margin/stop-order/cancel-by-clientOid': 5,
                        'hf/margin/stop-order/cancel': 3,
                        'hf/margin/oco-order/cancel-by-id': 3,
                        'hf/margin/oco-order/cancel-by-clientOid': 3,
                        'hf/margin/oco-order/cancel': 3,
                        // convert
                        'convert/limit/order/cancel': 5,
                    },
                },
                'futuresPublic': {
                    'get': {
                        'contracts/active': 6,
                        'contracts/{symbol}': 6,
                        'ticker': 4,
                        'allTickers': 10,
                        'level2/snapshot': 6,
                        'level2/depth20': 10,
                        'level2/depth100': 20,
                        'trade/history': 10,
                        'kline/query': 6,
                        'interest/query': 10,
                        'index/query': 4,
                        'mark-price/{symbol}/current': 6,
                        'premium/query': 6,
                        'trade-statistics': 6,
                        'funding-rate/{symbol}/current': 4,
                        'contract/funding-rates': 10,
                        'timestamp': 4,
                        'status': 8,
                        // ?
                        'level2/message/query': 1.3953,
                        'contracts/risk-limit/{symbol}': 3,
                        'level3/message/query': 3,
                        'level3/snapshot': 3, // v2
                    },
                    'post': {
                        // ws
                        'bullet-public': 20, // 10PW
                    },
                },
                'futuresPrivate': {
                    'get': {
                        // account
                        'transaction-history': 4,
                        // funding
                        'account-overview': 10,
                        'account-overview-all': 12,
                        'transfer-list': 20,
                        // futures
                        'orders': 4,
                        'stopOrders': 12,
                        'recentDoneOrders': 10,
                        'orders/{orderId}': 10,
                        'orders/byClientOid': 10,
                        'fills': 10,
                        'recentFills': 6,
                        'trade-fees': 6,
                        'openOrderStatistics': 20,
                        'position': 4,
                        'positions': 4,
                        'margin/maxWithdrawMargin': 20,
                        'contracts/risk-limit/{symbol}': 10,
                        'funding-history': 10,
                        'copy-trade/futures/get-max-open-size': 8,
                        'copy-trade/futures/position/margin/max-withdraw-margin': 20,
                        'history-positions': 4,
                        'position/getMarginMode': 4,
                        'position/getPositionMode': 4,
                        'deposit-address': 4,
                        'deposit-list': 4,
                        'withdrawals/quotas': 4,
                        'withdrawal-list': 4,
                        'sub/api-key': 4,
                        'trade-statistics': 4,
                        'getMaxOpenSize': 4,
                        'getCrossUserLeverage': 4,
                    },
                    'post': {
                        // funding
                        'transfer-out': 20,
                        'transfer-in': 20,
                        // futures
                        'orders': 4,
                        'st-orders': 4,
                        'orders/test': 4,
                        'orders/multi': 6,
                        'position/margin/auto-deposit-status': 8,
                        'margin/withdrawMargin': 10,
                        'position/margin/deposit-margin': 8,
                        'position/risk-limit-level/change': 8,
                        'copy-trade/futures/orders': 4,
                        'copy-trade/futures/orders/test': 4,
                        'copy-trade/futures/st-orders': 4,
                        'copy-trade/futures/position/margin/deposit-margin': 8,
                        'copy-trade/futures/position/margin/withdraw-margin': 20,
                        'copy-trade/futures/position/risk-limit-level/change': 4,
                        'copy-trade/futures/position/margin/auto-deposit-status': 8,
                        'copy-trade/futures/position/changeMarginMode': 4,
                        'copy-trade/futures/position/changeCrossUserLeverage': 4,
                        'copy-trade/getCrossModeMarginRequirement': 6,
                        'copy-trade/position/switchPositionMode': 4,
                        'changeCrossUserLeverage': 4,
                        'withdrawals': 4,
                        'sub/api-key': 4,
                        'sub/api-key/update': 4,
                        'position/changeMarginMode': 4,
                        'position/switchPositionMode': 4,
                        // ws
                        'bullet-private': 20, // 10FW
                    },
                    'delete': {
                        'orders/{orderId}': 2,
                        'orders/client-order/{clientOid}': 2,
                        'orders': 20,
                        'stopOrders': 30,
                        'copy-trade/futures/orders': 1.5,
                        'copy-trade/futures/orders/client-order': 1.5,
                        'orders/multi-cancel': 40,
                        'withdrawals/{withdrawalId}': 10,
                        'cancel/transfer-out': 10,
                        'sub/api-key': 10,
                    },
                },
                'webExchange': {
                    'get': {
                        'currency/currency/chain-info': 1,
                        'contract/{symbol}/funding-rates': 2,
                    },
                },
                'broker': {
                    'get': {
                        'broker/nd/info': 4,
                        'broker/nd/account': 4,
                        'broker/nd/account/apikey': 4,
                        'broker/nd/rebase/download': 4,
                        'asset/ndbroker/deposit/list': 2,
                        'broker/nd/transfer/detail': 2,
                        'broker/nd/deposit/detail': 2,
                        'broker/nd/withdraw/detail': 2,
                    },
                    'post': {
                        'broker/nd/transfer': 2,
                        'broker/nd/account': 6,
                        'broker/nd/account/apikey': 6,
                        'broker/nd/account/update-apikey': 6,
                    },
                    'delete': {
                        'broker/nd/account/apikey': 6,
                    },
                },
                'earn': {
                    'get': {
                        'otc-loan/discount-rate-configs': 20,
                        'otc-loan/loan': 2,
                        'otc-loan/accounts': 2,
                        'earn/redeem-preview': 10,
                        'earn/saving/products': 10,
                        'earn/hold-assets': 10,
                        'earn/promotion/products': 10,
                        'earn/kcs-staking/products': 10,
                        'earn/staking/products': 10,
                        'earn/eth-staking/products': 10,
                        'struct-earn/dual/products': 6,
                        'struct-earn/orders': 10,
                    },
                    'post': {
                        'earn/orders': 10,
                        'struct-earn/orders': 10,
                    },
                    'delete': {
                        'earn/orders': 10, // 5EW
                    },
                },
                'uta': {
                    'get': {
                        'market/announcement': 40,
                        'market/currency': 6,
                        'asset/currencies': 6,
                        'market/instrument': 8,
                        'market/ticker': 30,
                        'market/trade': 6,
                        'market/kline': 6,
                        'market/funding-rate': 4,
                        'market/funding-rate-history': 10,
                        'market/cross-config': 50,
                        'market/collateral-discount-ratio': 20,
                        'market/index-price': 20,
                        'market/position-tiers': 40,
                        'market/open-interest': 20,
                        'server/status': 6,
                    },
                },
                'utaPrivate': {
                    'get': {
                        'market/orderbook': 6,
                        'account/balance': 10,
                        'account/transfer-quota': 40,
                        'account/mode': 60,
                        'account/ledger': 4,
                        'account/interest-history': 30,
                        'asset/deposit/address': 10,
                        'account/deposit/address': 5,
                        '{accountMode}/account/balance': 10,
                        '{accountMode}/account/overview': 10,
                        '{accountMode}/order/detail': 8,
                        '{accountMode}/order/open-list': 8,
                        '{accountMode}/order/history': 8,
                        '{accountMode}/order/execution': 8,
                        '{accountMode}/position/open-list': 6,
                        '{accountMode}/position/history': 4,
                        'position/history': 4,
                        '{accountMode}/position/tiers': 40,
                        'sub-account/balance': 10,
                        'user/fee-rate': 6,
                        'dcp/query': 4,
                    },
                    'post': {
                        'account/transfer': 8,
                        'account/mode': 60,
                        '{accountMode}/account/modify-leverage': 40,
                        '{accountMode}/order/place': 2,
                        '{accountMode}/order/place-batch': 8,
                        '{accountMode}/order/cancel': 2,
                        '{accountMode}/order/cancel-batch': 8,
                        '{accountMode}/order/cancel-all': 40,
                        'sub-account/canTransferOut': 10,
                        'dcp/set': 4,
                    },
                },
            },
            'timeframes': {
                '1m': '1min',
                '3m': '3min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '2h': '2hour',
                '4h': '4hour',
                '6h': '6hour',
                '8h': '8hour',
                '12h': '12hour',
                '1d': '1day',
                '1w': '1week',
                '1M': '1month',
            },
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                'exact': {
                    'Order not exist or not allow to be cancelled': errors.OrderNotFound,
                    'The order does not exist.': errors.OrderNotFound,
                    'order not exist': errors.OrderNotFound,
                    'order not exist.': errors.OrderNotFound,
                    'order_not_exist': errors.OrderNotFound,
                    'order_not_exist_or_not_allow_to_cancel': errors.InvalidOrder,
                    'Order size below the minimum requirement.': errors.InvalidOrder,
                    'Order size increment invalid.': errors.InvalidOrder,
                    'The withdrawal amount is below the minimum requirement.': errors.ExchangeError,
                    'Unsuccessful! Exceeded the max. funds out-transfer limit': errors.InsufficientFunds,
                    'The amount increment is invalid.': errors.BadRequest,
                    'The quantity is below the minimum requirement.': errors.InvalidOrder,
                    'not in the given range!': errors.BadRequest,
                    'recAccountType not in the given range': errors.BadRequest,
                    'Unsupported trading pair.': errors.BadSymbol,
                    '400': errors.BadRequest,
                    '401': errors.AuthenticationError,
                    '403': errors.NotSupported,
                    '404': errors.NotSupported,
                    '405': errors.NotSupported,
                    '415': errors.NotSupported,
                    '429': errors.RateLimitExceeded,
                    '500': errors.ExchangeNotAvailable,
                    '503': errors.ExchangeNotAvailable,
                    '101030': errors.PermissionDenied,
                    '103000': errors.InvalidOrder,
                    '112010': errors.PermissionDenied,
                    '130101': errors.BadRequest,
                    '130102': errors.ExchangeError,
                    '130103': errors.OrderNotFound,
                    '130104': errors.ExchangeError,
                    '130105': errors.InsufficientFunds,
                    '130106': errors.NotSupported,
                    '130107': errors.ExchangeError,
                    '130108': errors.OrderNotFound,
                    '130201': errors.PermissionDenied,
                    '130202': errors.ExchangeError,
                    '130203': errors.InsufficientFunds,
                    '130204': errors.BadRequest,
                    '130301': errors.InsufficientFunds,
                    '130302': errors.PermissionDenied,
                    '130303': errors.NotSupported,
                    '130304': errors.NotSupported,
                    '130305': errors.NotSupported,
                    '130306': errors.NotSupported,
                    '130307': errors.NotSupported,
                    '130308': errors.InvalidOrder,
                    '130309': errors.InvalidOrder,
                    '130310': errors.ExchangeError,
                    '130311': errors.InvalidOrder,
                    '130312': errors.InvalidOrder,
                    '130313': errors.InvalidOrder,
                    '130314': errors.InvalidOrder,
                    '130315': errors.NotSupported,
                    '126000': errors.ExchangeError,
                    '126001': errors.NotSupported,
                    '126002': errors.ExchangeError,
                    '126003': errors.InvalidOrder,
                    '126004': errors.ExchangeError,
                    '126005': errors.PermissionDenied,
                    '126006': errors.ExchangeError,
                    '126007': errors.ExchangeError,
                    '126009': errors.ExchangeError,
                    '126010': errors.ExchangeError,
                    '126011': errors.ExchangeError,
                    '126013': errors.InsufficientFunds,
                    '126015': errors.ExchangeError,
                    '126021': errors.NotSupported,
                    '126022': errors.InvalidOrder,
                    '126027': errors.InvalidOrder,
                    '126028': errors.InvalidOrder,
                    '126029': errors.InvalidOrder,
                    '126030': errors.InvalidOrder,
                    '126033': errors.InvalidOrder,
                    '126034': errors.InvalidOrder,
                    '126036': errors.InvalidOrder,
                    '126037': errors.ExchangeError,
                    '126038': errors.ExchangeError,
                    '126039': errors.ExchangeError,
                    '126041': errors.ExchangeError,
                    '126042': errors.ExchangeError,
                    '126043': errors.OrderNotFound,
                    '126044': errors.InvalidOrder,
                    '126045': errors.NotSupported,
                    '126046': errors.NotSupported,
                    '126047': errors.PermissionDenied,
                    '126048': errors.PermissionDenied,
                    '135005': errors.ExchangeError,
                    '135018': errors.ExchangeError,
                    '200004': errors.InsufficientFunds,
                    '210014': errors.InvalidOrder,
                    '210021': errors.InsufficientFunds,
                    '230003': errors.InsufficientFunds,
                    '260000': errors.InvalidAddress,
                    '260100': errors.InsufficientFunds,
                    '300000': errors.InvalidOrder,
                    '400000': errors.BadSymbol,
                    '400001': errors.AuthenticationError,
                    '400002': errors.InvalidNonce,
                    '400003': errors.AuthenticationError,
                    '400004': errors.AuthenticationError,
                    '400005': errors.AuthenticationError,
                    '400006': errors.AuthenticationError,
                    '400007': errors.AuthenticationError,
                    '400008': errors.NotSupported,
                    '400100': errors.BadRequest,
                    '400200': errors.InvalidOrder,
                    '400330': errors.InvalidOrder,
                    '400350': errors.InvalidOrder,
                    '400370': errors.InvalidOrder,
                    '400400': errors.BadRequest,
                    '400401': errors.AuthenticationError,
                    '400500': errors.RestrictedLocation,
                    '400600': errors.BadSymbol,
                    '400760': errors.InvalidOrder,
                    '401000': errors.BadRequest,
                    '408000': errors.BadRequest,
                    '411100': errors.AccountSuspended,
                    '415000': errors.BadRequest,
                    '400303': errors.PermissionDenied,
                    '500000': errors.ExchangeNotAvailable,
                    '260220': errors.InvalidAddress,
                    '600100': errors.InsufficientFunds,
                    '600101': errors.InvalidOrder,
                    '900014': errors.BadRequest,
                    // futures errors
                    '330012': errors.InvalidOrder,
                    '330005': errors.InvalidOrder,
                    '100001': errors.OrderNotFound,
                    '100004': errors.BadRequest,
                    '300003': errors.InsufficientFunds,
                    '300012': errors.InvalidOrder,
                    '404000': errors.NotSupported,
                    '300009': errors.InvalidOrder,
                    '330008': errors.InsufficientFunds, // {"msg":"Your current margin and leverage have reached the maximum open limit. Please increase your margin or raise your leverage to open larger positions.","code":"330008"}
                },
                'broad': {
                    'pageSize should not greater than 500': errors.BadRequest,
                    'Exceeded the access frequency': errors.RateLimitExceeded,
                    'require more permission': errors.PermissionDenied,
                    // futures errors
                    'Position does not exist': errors.OrderNotFound, // { "code":"200000", "msg":"Position does not exist" }
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber('0.001'),
                    'maker': this.parseNumber('0.001'),
                    'tiers': {
                        'taker': [
                            [this.parseNumber('0'), this.parseNumber('0.001')],
                            [this.parseNumber('50'), this.parseNumber('0.001')],
                            [this.parseNumber('200'), this.parseNumber('0.0009')],
                            [this.parseNumber('500'), this.parseNumber('0.0008')],
                            [this.parseNumber('1000'), this.parseNumber('0.0007')],
                            [this.parseNumber('2000'), this.parseNumber('0.0007')],
                            [this.parseNumber('4000'), this.parseNumber('0.0006')],
                            [this.parseNumber('8000'), this.parseNumber('0.0005')],
                            [this.parseNumber('15000'), this.parseNumber('0.00045')],
                            [this.parseNumber('25000'), this.parseNumber('0.0004')],
                            [this.parseNumber('40000'), this.parseNumber('0.00035')],
                            [this.parseNumber('60000'), this.parseNumber('0.0003')],
                            [this.parseNumber('80000'), this.parseNumber('0.00025')],
                        ],
                        'maker': [
                            [this.parseNumber('0'), this.parseNumber('0.001')],
                            [this.parseNumber('50'), this.parseNumber('0.0009')],
                            [this.parseNumber('200'), this.parseNumber('0.0007')],
                            [this.parseNumber('500'), this.parseNumber('0.0005')],
                            [this.parseNumber('1000'), this.parseNumber('0.0003')],
                            [this.parseNumber('2000'), this.parseNumber('0')],
                            [this.parseNumber('4000'), this.parseNumber('0')],
                            [this.parseNumber('8000'), this.parseNumber('0')],
                            [this.parseNumber('15000'), this.parseNumber('-0.00005')],
                            [this.parseNumber('25000'), this.parseNumber('-0.00005')],
                            [this.parseNumber('40000'), this.parseNumber('-0.00005')],
                            [this.parseNumber('60000'), this.parseNumber('-0.00005')],
                            [this.parseNumber('80000'), this.parseNumber('-0.00005')],
                        ],
                    },
                },
                'spot': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber('0.001'),
                    'maker': this.parseNumber('0.001'),
                    'tiers': {
                        'taker': [
                            [this.parseNumber('0'), this.parseNumber('0.001')],
                            [this.parseNumber('50'), this.parseNumber('0.001')],
                            [this.parseNumber('200'), this.parseNumber('0.0009')],
                            [this.parseNumber('500'), this.parseNumber('0.0008')],
                            [this.parseNumber('1000'), this.parseNumber('0.0007')],
                            [this.parseNumber('2000'), this.parseNumber('0.0007')],
                            [this.parseNumber('4000'), this.parseNumber('0.0006')],
                            [this.parseNumber('8000'), this.parseNumber('0.0005')],
                            [this.parseNumber('15000'), this.parseNumber('0.00045')],
                            [this.parseNumber('25000'), this.parseNumber('0.0004')],
                            [this.parseNumber('40000'), this.parseNumber('0.00035')],
                            [this.parseNumber('60000'), this.parseNumber('0.0003')],
                            [this.parseNumber('80000'), this.parseNumber('0.00025')],
                        ],
                        'maker': [
                            [this.parseNumber('0'), this.parseNumber('0.001')],
                            [this.parseNumber('50'), this.parseNumber('0.0009')],
                            [this.parseNumber('200'), this.parseNumber('0.0007')],
                            [this.parseNumber('500'), this.parseNumber('0.0005')],
                            [this.parseNumber('1000'), this.parseNumber('0.0003')],
                            [this.parseNumber('2000'), this.parseNumber('0')],
                            [this.parseNumber('4000'), this.parseNumber('0')],
                            [this.parseNumber('8000'), this.parseNumber('0')],
                            [this.parseNumber('15000'), this.parseNumber('-0.00005')],
                            [this.parseNumber('25000'), this.parseNumber('-0.00005')],
                            [this.parseNumber('40000'), this.parseNumber('-0.00005')],
                            [this.parseNumber('60000'), this.parseNumber('-0.00005')],
                            [this.parseNumber('80000'), this.parseNumber('-0.00005')],
                        ],
                    },
                },
                'contract': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber('0.0006'),
                    'maker': this.parseNumber('0.0002'),
                    'tiers': {
                        'taker': [
                            [this.parseNumber('0'), this.parseNumber('0.0006')],
                            [this.parseNumber('50'), this.parseNumber('0.0006')],
                            [this.parseNumber('200'), this.parseNumber('0.0006')],
                            [this.parseNumber('500'), this.parseNumber('0.0005')],
                            [this.parseNumber('1000'), this.parseNumber('0.0004')],
                            [this.parseNumber('2000'), this.parseNumber('0.0004')],
                            [this.parseNumber('4000'), this.parseNumber('0.00038')],
                            [this.parseNumber('8000'), this.parseNumber('0.00035')],
                            [this.parseNumber('15000'), this.parseNumber('0.00032')],
                            [this.parseNumber('25000'), this.parseNumber('0.0003')],
                            [this.parseNumber('40000'), this.parseNumber('0.0003')],
                            [this.parseNumber('60000'), this.parseNumber('0.0003')],
                            [this.parseNumber('80000'), this.parseNumber('0.0003')],
                        ],
                        'maker': [
                            [this.parseNumber('0'), this.parseNumber('0.02')],
                            [this.parseNumber('50'), this.parseNumber('0.015')],
                            [this.parseNumber('200'), this.parseNumber('0.01')],
                            [this.parseNumber('500'), this.parseNumber('0.01')],
                            [this.parseNumber('1000'), this.parseNumber('0.01')],
                            [this.parseNumber('2000'), this.parseNumber('0')],
                            [this.parseNumber('4000'), this.parseNumber('0')],
                            [this.parseNumber('8000'), this.parseNumber('0')],
                            [this.parseNumber('15000'), this.parseNumber('-0.003')],
                            [this.parseNumber('25000'), this.parseNumber('-0.006')],
                            [this.parseNumber('40000'), this.parseNumber('-0.009')],
                            [this.parseNumber('60000'), this.parseNumber('-0.012')],
                            [this.parseNumber('80000'), this.parseNumber('-0.015')],
                        ],
                    },
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'commonCurrencies': {
                'BIFI': 'BIFIF',
                'VAI': 'VAIOT',
                'WAX': 'WAXP',
                'ALT': 'APTOSLAUNCHTOKEN',
                'KALT': 'ALT',
                'FUD': 'FTX Users\' Debt',
            },
            'options': {
                'hf': undefined,
                'uta': undefined,
                'version': 'v1',
                'symbolSeparator': '-',
                'fetchMyTradesMethod': 'private_get_fills',
                'timeDifference': 0,
                'adjustForTimeDifference': false,
                'fetchCurrencies': {
                    'webApiEnable': true,
                    'webApiRetries': 1,
                    'webApiMuteFailure': true,
                },
                'fetchMarkets': {
                    'types': ['spot', 'swap', 'future', 'contract'],
                    'fetchTickersFees': true,
                },
                'withdraw': {
                    'includeFee': false,
                },
                'transfer': {
                    'fillResponseFromRequest': true,
                },
                'fetchBalance': {
                    'code': 'USDT', // for contract endpoint
                },
                'timeInForce': {
                    'IOC': 'IOC',
                    'FOK': 'FOK',
                    'PO': 'PO',
                    'GTD': 'GTT',
                    'RPI': 'RPI',
                },
                'timeframes': {
                    'swap': {
                        '1m': 1,
                        '3m': undefined,
                        '5m': 5,
                        '15m': 15,
                        '30m': 30,
                        '1h': 60,
                        '2h': 120,
                        '4h': 240,
                        '6h': undefined,
                        '8h': 480,
                        '12h': 720,
                        '1d': 1440,
                        '1w': 10080,
                    },
                },
                // endpoint versions
                'versions': {
                    'public': {
                        'GET': {
                            // spot trading
                            'currencies': 'v3',
                            'currencies/{currency}': 'v3',
                            'symbols': 'v2',
                            'mark-price/all-symbols': 'v3',
                            'announcements': 'v3',
                        },
                    },
                    'private': {
                        'GET': {
                            // account
                            'user-info': 'v2',
                            'hf/margin/account/ledgers': 'v3',
                            'sub/user': 'v2',
                            'sub-accounts': 'v2',
                            // funding
                            'margin/accounts': 'v3',
                            'isolated/accounts': 'v3',
                            // 'deposit-addresses': 'v2',
                            'deposit-addresses': 'v1',
                            // spot trading
                            'market/orderbook/level2': 'v3',
                            'market/orderbook/level3': 'v3',
                            'market/orderbook/level{level}': 'v3',
                            'oco/order/{orderId}': 'v3',
                            'oco/order/details/{orderId}': 'v3',
                            'oco/client-order/{clientOid}': 'v3',
                            'oco/orders': 'v3',
                            // margin trading
                            'hf/margin/orders/active': 'v3',
                            'hf/margin/order/active/symbols': 'v3',
                            'hf/margin/orders/done': 'v3',
                            'hf/margin/orders/{orderId}': 'v3',
                            'hf/margin/orders/client-order/{clientOid}': 'v3',
                            'hf/margin/fills': 'v3',
                            'hf/margin/stop-orders': 'v3',
                            'hf/margin/stop-order/orderId': 'v3',
                            'hf/margin/stop-order/clientOid': 'v3',
                            'hf/margin/oco-order/orderId': 'v3',
                            'hf/margin/oco-order/clientOid': 'v3',
                            'hf/margin/oco-order/detail/orderId': 'v3',
                            'hf/margin/oco-orders': 'v3',
                            'etf/info': 'v3',
                            'margin/currencies': 'v3',
                            'margin/borrow': 'v3',
                            'margin/repay': 'v3',
                            'margin/interest': 'v3',
                            'project/list': 'v3',
                            'project/marketInterestRate': 'v3',
                            'redeem/orders': 'v3',
                            'purchase/orders': 'v3',
                            'migrate/user/account/status': 'v3',
                            'margin/symbols': 'v3',
                            'affiliate/inviter/statistics': 'v2',
                            'asset/ndbroker/deposit/list': 'v1',
                        },
                        'POST': {
                            // account
                            'sub/user/created': 'v2',
                            // funding
                            'accounts/universal-transfer': 'v3',
                            'accounts/sub-transfer': 'v2',
                            'accounts/inner-transfer': 'v2',
                            'transfer-out': 'v3',
                            'deposit-address/create': 'v3',
                            // spot trading
                            'oco/order': 'v3',
                            // margin trading
                            'hf/margin/order': 'v3',
                            'hf/margin/order/test': 'v3',
                            'hf/margin/stop-order': 'v3',
                            'margin/borrow': 'v3',
                            'margin/repay': 'v3',
                            'hf/margin/oco-order': 'v3',
                            'purchase': 'v3',
                            'redeem': 'v3',
                            'lend/purchase/update': 'v3',
                            'position/update-user-leverage': 'v3',
                            'withdrawals': 'v3',
                        },
                        'DELETE': {
                            'hf/margin/orders/{orderId}': 'v3',
                            'hf/margin/orders/client-order/{clientOid}': 'v3',
                            'hf/margin/orders': 'v3',
                            'hf/margin/stop-order/cancel-by-id': 'v3',
                            'hf/margin/stop-order/cancel-by-clientOid': 'v3',
                            'hf/margin/stop-order/cancel': 'v3',
                            'oco/order/{orderId}': 'v3',
                            'oco/client-order/{clientOid}': 'v3',
                            'oco/orders': 'v3',
                            'hf/margin/oco-order/cancel-by-id': 'v3',
                            'hf/margin/oco-order/cancel-by-clientOid': 'v3',
                            'hf/margin/oco-order/cancel': 'v3',
                        },
                    },
                    'futuresPrivate': {
                        'GET': {
                            'getMaxOpenSize': 'v2',
                            'getCrossUserLeverage': 'v2',
                            'position/getMarginMode': 'v2',
                            'position/getPositionMode': 'v2',
                        },
                        'POST': {
                            'transfer-out': 'v2',
                            'changeCrossUserLeverage': 'v2',
                            'position/changeMarginMode': 'v2',
                            'position/switchPositionMode': 'v2',
                        },
                    },
                    'futuresPublic': {
                        'GET': {
                            'level3/snapshot': 'v2',
                        },
                    },
                },
                'partner': {
                    // the support for spot and future exchanges as separate settings
                    'spot': {
                        'id': 'ccxt',
                        'key': '9e58cc35-5b5e-4133-92ec-166e3f077cb8',
                    },
                    'future': {
                        'id': 'ccxtfutures',
                        'key': '1b327198-f30c-4f14-a0ac-918871282f15',
                    },
                    // exchange-wide settings are also supported
                    // 'id': 'ccxt'
                    // 'key': '9e58cc35-5b5e-4133-92ec-166e3f077cb8',
                },
                'accountsByType': {
                    'spot': 'trade',
                    'margin': 'margin',
                    'cross': 'margin',
                    'marginV2': 'margin',
                    'isolated': 'isolated',
                    'main': 'main',
                    'funding': 'main',
                    'future': 'contract',
                    'swap': 'contract',
                    'mining': 'pool',
                    'hf': 'trade_hf',
                    'contract': 'contract',
                    'uta': 'unified',
                    'unified': 'unified',
                },
                'utaAccountsByType': {
                    'trade': 'SPOT',
                    'spot': 'SPOT',
                    'margin': 'CROSS',
                    'cross': 'CROSS',
                    'isolated': 'ISOLATED',
                    'main': 'FUNDING',
                    'funding': 'FUNDING',
                    'future': 'FUTURES',
                    'swap': 'FUTURES',
                    'contract': 'FUTURES',
                    'uta': 'unified',
                    'unified': 'unified',
                },
                'networks': {
                    'BRC20': 'btc',
                    'BTCNATIVESEGWIT': 'bech32',
                    'ERC20': 'eth',
                    'TRC20': 'trx',
                    'HRC20': 'heco',
                    'MATIC': 'matic',
                    'KCC': 'kcc',
                    'SOL': 'sol',
                    'ALGO': 'algo',
                    'EOS': 'eos',
                    'BEP20': 'bsc',
                    'BEP2': 'bnb',
                    'ARBONE': 'arbitrum',
                    'AVAXX': 'avax',
                    'AVAXC': 'avaxc',
                    'TLOS': 'tlos',
                    'CFX': 'cfx',
                    'ACA': 'aca',
                    'OPTIMISM': 'optimism',
                    'ONT': 'ont',
                    'GLMR': 'glmr',
                    'CSPR': 'cspr',
                    'KLAY': 'klay',
                    'XRD': 'xrd',
                    'RVN': 'rvn',
                    'NEAR': 'near',
                    'APT': 'aptos',
                    'ETHW': 'ethw',
                    'TON': 'ton',
                    'BCH': 'bch',
                    'BSV': 'bchsv',
                    'BCHA': 'bchabc',
                    'OSMO': 'osmo',
                    'NANO': 'nano',
                    'XLM': 'xlm',
                    'VET': 'vet',
                    'IOST': 'iost',
                    'ZIL': 'zil',
                    'XRP': 'xrp',
                    'TOMO': 'tomo',
                    'XMR': 'xmr',
                    'COTI': 'coti',
                    'XTZ': 'xtz',
                    'ADA': 'ada',
                    'WAX': 'waxp',
                    'THETA': 'theta',
                    'ONE': 'one',
                    'IOTEX': 'iotx',
                    'NULS': 'nuls',
                    'KSM': 'ksm',
                    'LTC': 'ltc',
                    'WAVES': 'waves',
                    'DOT': 'dot',
                    'STEEM': 'steem',
                    'QTUM': 'qtum',
                    'DOGE': 'doge',
                    'FIL': 'fil',
                    'XYM': 'xym',
                    'FLUX': 'flux',
                    'ATOM': 'atom',
                    'XDC': 'xdc',
                    'KDA': 'kda',
                    'ICP': 'icp',
                    'CELO': 'celo',
                    'LSK': 'lsk',
                    'VSYS': 'vsys',
                    'KAR': 'kar',
                    'XCH': 'xch',
                    'FLOW': 'flow',
                    'BAND': 'band',
                    'EGLD': 'egld',
                    'HBAR': 'hbar',
                    'XPR': 'xpr',
                    'AR': 'ar',
                    'FTM': 'ftm',
                    'KAVA': 'kava',
                    'KMA': 'kma',
                    'XEC': 'xec',
                    'IOTA': 'iota',
                    'HNT': 'hnt',
                    'ASTR': 'astr',
                    'PDEX': 'pdex',
                    'METIS': 'metis',
                    'ZEC': 'zec',
                    'POKT': 'pokt',
                    'OASYS': 'oas',
                    'OASIS': 'oasis',
                    'ETC': 'etc',
                    'AKT': 'akt',
                    'FSN': 'fsn',
                    'SCRT': 'scrt',
                    'CFG': 'cfg',
                    'ICX': 'icx',
                    'KMD': 'kmd',
                    'NEM': 'NEM',
                    'STX': 'stx',
                    'DGB': 'dgb',
                    'DCR': 'dcr',
                    'CKB': 'ckb',
                    'ELA': 'ela',
                    'HYDRA': 'hydra',
                    'BTM': 'btm',
                    'KARDIA': 'kai',
                    'SXP': 'sxp',
                    'NEBL': 'nebl',
                    'ZEN': 'zen',
                    'SDN': 'sdn',
                    'LTO': 'lto',
                    'WEMIX': 'wemix',
                    // 'BOBA': 'boba', // tbd
                    'EVER': 'ever',
                    'BNC': 'bnc',
                    'BNCDOT': 'bncdot',
                    // 'CMP': 'cmp', // todo: after consensus
                    'AION': 'aion',
                    'GRIN': 'grin',
                    'LOKI': 'loki',
                    'QKC': 'qkc',
                    'TT': 'TT',
                    'PIVX': 'pivx',
                    'SERO': 'sero',
                    'METER': 'meter',
                    'STATEMINE': 'statemine',
                    'DVPN': 'dvpn',
                    'XPRT': 'xprt',
                    'MOVR': 'movr',
                    'ERGO': 'ergo',
                    'ABBC': 'abbc',
                    'DIVI': 'divi',
                    'PURA': 'pura',
                    'DFI': 'dfi',
                    // 'NEO': 'neo', // tbd neo legacy
                    'NEON3': 'neon3',
                    'DOCK': 'dock',
                    'TRUE': 'true',
                    'CS': 'cs',
                    'ORAI': 'orai',
                    'BASE': 'base',
                    'TARA': 'tara',
                    // below will be uncommented after consensus
                    // 'BITCOINDIAMON': 'bcd',
                    // 'BITCOINGOLD': 'btg',
                    // 'HTR': 'htr',
                    // 'DEROHE': 'derohe',
                    // 'NDAU': 'ndau',
                    // 'HPB': 'hpb',
                    // 'AXE': 'axe',
                    // 'BITCOINPRIVATE': 'btcp',
                    // 'EDGEWARE': 'edg',
                    // 'JUPITER': 'jup',
                    // 'VELAS': 'vlx', // vlxevm is different
                    // // 'terra' luna lunc TBD
                    // 'DIGITALBITS': 'xdb',
                    // // fra is fra-emv on kucoin
                    // 'PASTEL': 'psl',
                    // // sysevm
                    // 'CONCORDIUM': 'ccd',
                    // 'AURORA': 'aurora',
                    // 'PHA': 'pha', // a.k.a. khala
                    // 'PAL': 'pal',
                    // 'RSK': 'rbtc',
                    // 'NIX': 'nix',
                    // 'NIM': 'nim',
                    // 'NRG': 'nrg',
                    // 'RFOX': 'rfox',
                    // 'PIONEER': 'neer',
                    // 'PIXIE': 'pix',
                    // 'ALEPHZERO': 'azero',
                    // 'ACHAIN': 'act', // actevm is different
                    // 'BOSCOIN': 'bos',
                    // 'ELECTRONEUM': 'etn',
                    // 'GOCHAIN': 'go',
                    // 'SOPHIATX': 'sphtx',
                    // 'WANCHAIN': 'wan',
                    // 'ZEEPIN': 'zpt',
                    // 'MATRIXAI': 'man',
                    // 'METADIUM': 'meta',
                    // 'METAHASH': 'mhc',
                    // // eosc --"eosforce" tbd
                    // 'IOTCHAIN': 'itc',
                    // 'CONTENTOS': 'cos',
                    // 'CPCHAIN': 'cpc',
                    // 'INTCHAIN': 'int',
                    // // 'DASH': 'dash', tbd digita-cash
                    // 'WALTONCHAIN': 'wtc',
                    // 'CONSTELLATION': 'dag',
                    // 'ONELEDGER': 'olt',
                    // 'AIRDAO': 'amb', // a.k.a. AMBROSUS
                    // 'ENERGYWEB': 'ewt',
                    // 'WAVESENTERPRISE': 'west',
                    // 'HYPERCASH': 'hc',
                    // 'ENECUUM': 'enq',
                    // 'HAVEN': 'xhv',
                    // 'CHAINX': 'pcx',
                    // // 'FLUXOLD': 'zel', // zel seems old chain (with uppercase FLUX in kucoin UI and with id 'zel')
                    // 'BUMO': 'bu',
                    // 'DEEPONION': 'onion',
                    // 'ULORD': 'ut',
                    // 'ASCH': 'xas',
                    // 'SOLARIS': 'xlr',
                    // 'APOLLO': 'apl',
                    // 'PIRATECHAIN': 'arrr',
                    // 'ULTRA': 'uos',
                    // 'EMONEY': 'ngm',
                    // 'AURORACHAIN': 'aoa',
                    // 'KLEVER': 'klv',
                    // undetermined: xns(insolar), rhoc, luk (luniverse), kts (klimatas), bchn (bitcoin cash node), god (shallow entry), lit (litmus),
                },
                'marginModes': {
                    'cross': 'MARGIN_TRADE',
                    'isolated': 'MARGIN_ISOLATED_TRADE',
                    'spot': 'TRADE',
                },
            },
            'features': {
                'spot': {
                    'sandbox': false,
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
                            'GTD': true,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': true,
                        'iceberg': true, // todo implement
                    },
                    'createOrders': {
                        'max': 5,
                    },
                    'fetchMyTrades': {
                        'marginMode': true,
                        'limit': undefined,
                        'daysBack': undefined,
                        'untilDays': 7,
                        'symbolRequired': true,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': true,
                        'limit': 500,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': true,
                        'limit': 500,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': 7,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOHLCV': {
                        'limit': 1500,
                    },
                },
                'forDerivs': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'last': true,
                            'mark': true,
                            'index': true,
                        },
                        'triggerDirection': true,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': {
                            'triggerPriceType': {
                                'last': true,
                                'mark': true,
                                'index': true,
                            },
                            'price': true,
                        },
                        'timeInForce': {
                            'IOC': true,
                            'FOK': false,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': true,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': true,
                        'iceberg': true,
                    },
                    'createOrders': {
                        'max': 20,
                    },
                    'fetchMyTrades': {
                        'marginMode': true,
                        'limit': 1000,
                        'daysBack': undefined,
                        'untilDays': 7,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 500,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'forDerivs',
                    },
                    'inverse': {
                        'extends': 'forDerivs',
                    },
                },
                'future': {
                    'linear': {
                        'extends': 'forDerivs',
                    },
                    'inverse': {
                        'extends': 'forDerivs',
                    },
                },
            },
            'rollingWindowSize': 30000.0, // https://www.kucoin.com/docs-new/rate-limit
        });
    }
    nonce() {
        return this.milliseconds() - this.options['timeDifference'];
    }
    /**
     * @method
     * @name kucoin#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-server-time
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchTime', undefined, params);
        let response = undefined;
        if ((type !== 'spot') && (type !== 'margin')) {
            //
            //    {
            //        "code": "200000",
            //        "data": 1637385119302,
            //    }
            //
            response = await this.futuresPublicGetTimestamp(params);
        }
        else {
            //
            //     {
            //         "code":"200000",
            //         "msg":"success",
            //         "data":1546837113087
            //     }
            //
            response = await this.publicGetTimestamp(params);
        }
        return this.safeInteger(response, 'data');
    }
    /**
     * @method
     * @name kucoin#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-service-status
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-service-status
     * @see https://www.kucoin.com/docs-new/rest/ua/get-service-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] spot or swap
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @param {string} [params.tradeType] *uta only* set to SPOT or FUTURES
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    async fetchStatus(params = {}) {
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'fetchStatus', 'uta', uta);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchStatus', undefined, params);
        let response = undefined;
        if (uta) {
            const defaultType = this.safeString(this.options, 'defaultType', 'spot');
            const defaultTradeType = (defaultType === 'spot') ? 'SPOT' : 'FUTURES';
            const tradeType = this.safeStringUpper(params, 'tradeType', defaultTradeType);
            const request = {
                'tradeType': tradeType,
            };
            response = await this.utaGetServerStatus(this.extend(request, params));
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "tradeType": "SPOT",
            //             "serverStatus": "open",
            //             "msg": ""
            //         }
            //     }
            //
        }
        else if ((type !== 'spot') && (type !== 'margin')) {
            response = await this.futuresPublicGetStatus(params);
            //
            //    {
            //        "code": "200000",
            //        "data": {
            //            "status": "open", //open, close, cancelonly
            //            "msg": "upgrade match engine" //remark for operation
            //        }
            //    }
            //
        }
        else {
            response = await this.publicGetStatus(params);
            //
            //     {
            //         "code":"200000",
            //         "data":{
            //             "status":"open", //open, close, cancelonly
            //             "msg":"upgrade match engine" //remark for operation
            //         }
            //     }
            //
        }
        const data = this.safeDict(response, 'data', {});
        const status = this.safeString2(data, 'status', 'serverStatus');
        return {
            'status': (status === 'open') ? 'ok' : 'maintenance',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }
    /**
     * @method
     * @name kucoin#fetchMarkets
     * @description retrieves data on all markets for kucoin
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-symbols
     * @see https://www.kucoin.com/docs-new/rest/ua/get-symbol
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-all-symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        let fetchTickersFees = undefined;
        [fetchTickersFees, params] = this.handleOptionAndParams(params, 'fetchMarkets', 'fetchTickersFees', true);
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'fetchMarkets', 'uta', uta);
        if (uta) {
            return await this.fetchUTAMarkets(params);
        }
        const defaultTypes = ['spot', 'swap', 'future', 'contract'];
        const fetchMarketsOptions = this.safeDict(this.options, 'fetchMarkets');
        const types = this.safeList(fetchMarketsOptions, 'types', defaultTypes);
        const credentialsSet = this.checkRequiredCredentials(false);
        const requestMarginables = credentialsSet && this.safeBool(params, 'marginables', true);
        params = this.omit(params, 'marginables');
        let fetchContractMarkets = false;
        if (this.inArray('swap', types) || this.inArray('future', types) || this.inArray('contract', types)) {
            fetchContractMarkets = true;
        }
        const fetchSpotMarkets = this.inArray('spot', types);
        fetchTickersFees = fetchTickersFees && fetchSpotMarkets; // tickers and fees are only fetched for spot markets
        const promises = [];
        if (fetchSpotMarkets) {
            promises.push(this.publicGetSymbols(params));
            //
            //     {
            //         "code": "200000",
            //         "data": [
            //             {
            //                 "symbol": "XLM-USDT",
            //                 "name": "XLM-USDT",
            //                 "baseCurrency": "XLM",
            //                 "quoteCurrency": "USDT",
            //                 "feeCurrency": "USDT",
            //                 "market": "USDS",
            //                 "baseMinSize": "0.1",
            //                 "quoteMinSize": "0.01",
            //                 "baseMaxSize": "10000000000",
            //                 "quoteMaxSize": "99999999",
            //                 "baseIncrement": "0.0001",
            //                 "quoteIncrement": "0.000001",
            //                 "priceIncrement": "0.000001",
            //                 "priceLimitRate": "0.1",
            //                 "isMarginEnabled": true,
            //                 "enableTrading": true
            //             },
            //
        }
        if (requestMarginables) {
            promises.push(this.privateGetMarginSymbols(params)); // cross margin symbols
            //
            //    {
            //        "code": "200000",
            //        "data": {
            //            "timestamp": 1719393213421,
            //            "items": [
            //                {
            //                    // same object as in market, with one additional field:
            //                    "minFunds": "0.1"
            //                },
            //
            promises.push(this.privateGetIsolatedSymbols(params)); // isolated margin symbols
            //
            //    {
            //        "code": "200000",
            //        "data": [
            //            {
            //                "symbol": "NKN-USDT",
            //                "symbolName": "NKN-USDT",
            //                "baseCurrency": "NKN",
            //                "quoteCurrency": "USDT",
            //                "maxLeverage": 5,
            //                "flDebtRatio": "0.97",
            //                "tradeEnable": true,
            //                "autoRenewMaxDebtRatio": "0.96",
            //                "baseBorrowEnable": true,
            //                "quoteBorrowEnable": true,
            //                "baseTransferInEnable": true,
            //                "quoteTransferInEnable": true,
            //                "baseBorrowCoefficient": "1",
            //                "quoteBorrowCoefficient": "1"
            //            },
            //
        }
        if (fetchTickersFees) {
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "time":1602832092060,
            //             "ticker":[
            //                 {
            //                     "symbol": "BTC-USDT",   // symbol
            //                     "symbolName":"BTC-USDT", // Name of trading pairs, it would change after renaming
            //                     "buy": "11328.9",   // bestAsk
            //                     "sell": "11329",    // bestBid
            //                     "changeRate": "-0.0055",    // 24h change rate
            //                     "changePrice": "-63.6", // 24h change price
            //                     "high": "11610",    // 24h highest price
            //                     "low": "11200", // 24h lowest price
            //                     "vol": "2282.70993217", // 24h volume，the aggregated trading volume in BTC
            //                     "volValue": "25984946.157790431",   // 24h total, the trading volume in quote currency of last 24 hours
            //                     "last": "11328.9",  // last price
            //                     "averagePrice": "11360.66065903",   // 24h average transaction price yesterday
            //                     "takerFeeRate": "0.001",    // Basic Taker Fee
            //                     "makerFeeRate": "0.001",    // Basic Maker Fee
            //                     "takerCoefficient": "1",    // Taker Fee Coefficient
            //                     "makerCoefficient": "1" // Maker Fee Coefficient
            //                 }
            //
            promises.push(this.publicGetMarketAllTickers(params));
        }
        if (fetchContractMarkets) {
            promises.push(this.fetchContractMarkets(params));
        }
        if (credentialsSet) {
            // load migration status for account
            promises.push(this.loadMigrationStatus());
        }
        const responses = await Promise.all(promises);
        const symbolsData = fetchSpotMarkets ? this.safeList(responses[0], 'data') : [];
        let crossIndex = 0;
        let isolatedIndex = 0;
        let tickersIndex = 0;
        let contractIndex = 0;
        let nextIndex = 0;
        if (fetchSpotMarkets) {
            nextIndex = 1;
        }
        if (requestMarginables) {
            crossIndex = nextIndex;
            nextIndex = this.sum(nextIndex, 2);
            isolatedIndex = this.sum(crossIndex, 1);
        }
        if (fetchTickersFees) {
            tickersIndex = nextIndex;
            nextIndex = this.sum(nextIndex, 1);
        }
        if (fetchContractMarkets) {
            contractIndex = nextIndex;
        }
        const crossData = requestMarginables ? this.safeDict(responses[crossIndex], 'data', {}) : {};
        const crossItems = this.safeList(crossData, 'items', []);
        const crossById = this.indexBy(crossItems, 'symbol');
        const isolatedData = requestMarginables ? responses[isolatedIndex] : {};
        const isolatedItems = this.safeList(isolatedData, 'data', []);
        const isolatedById = this.indexBy(isolatedItems, 'symbol');
        const tickersResponse = fetchTickersFees ? this.safeDict(responses, tickersIndex, {}) : {};
        const tickerItems = this.safeList(this.safeDict(tickersResponse, 'data', {}), 'ticker', []);
        const tickersById = this.indexBy(tickerItems, 'symbol');
        let result = [];
        for (let i = 0; i < symbolsData.length; i++) {
            const market = symbolsData[i];
            const id = this.safeString(market, 'symbol');
            const [baseId, quoteId] = id.split('-');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            // const quoteIncrement = this.safeNumber (market, 'quoteIncrement');
            const ticker = this.safeDict(tickersById, id, {});
            const makerFeeRate = this.safeString(ticker, 'makerFeeRate');
            const takerFeeRate = this.safeString(ticker, 'takerFeeRate');
            const makerCoefficient = this.safeString(ticker, 'makerCoefficient');
            const takerCoefficient = this.safeString(ticker, 'takerCoefficient');
            const hasCrossMargin = (id in crossById);
            const hasIsolatedMargin = (id in isolatedById);
            const isMarginable = this.safeBool(market, 'isMarginEnabled', false) || hasCrossMargin || hasIsolatedMargin;
            result.push({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': isMarginable,
                'marginModes': {
                    'cross': hasCrossMargin,
                    'isolated': hasIsolatedMargin,
                },
                'swap': false,
                'future': false,
                'option': false,
                'active': this.safeBool(market, 'enableTrading'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.parseNumber(Precise["default"].stringMul(takerFeeRate, takerCoefficient)),
                'maker': this.parseNumber(Precise["default"].stringMul(makerFeeRate, makerCoefficient)),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber(market, 'baseIncrement'),
                    'price': this.safeNumber(market, 'priceIncrement'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber(market, 'baseMinSize'),
                        'max': this.safeNumber(market, 'baseMaxSize'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber(market, 'quoteMinSize'),
                        'max': this.safeNumber(market, 'quoteMaxSize'),
                    },
                },
                'created': undefined,
                'info': market,
            });
        }
        if (fetchContractMarkets) {
            const contractMarkets = this.safeList(responses, contractIndex, []);
            result = this.arrayConcat(result, contractMarkets);
        }
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference();
        }
        return result;
    }
    async fetchContractMarkets(params = {}) {
        const response = await this.futuresPublicGetContractsActive(params);
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "symbol": "ETHUSDTM",
        //            "rootSymbol": "USDT",
        //            "type": "FFWCSX",
        //            "firstOpenDate": 1591086000000,
        //            "expireDate": null,
        //            "settleDate": null,
        //            "baseCurrency": "ETH",
        //            "quoteCurrency": "USDT",
        //            "settleCurrency": "USDT",
        //            "maxOrderQty": 1000000,
        //            "maxPrice": 1000000.0000000000,
        //            "lotSize": 1,
        //            "tickSize": 0.05,
        //            "indexPriceTickSize": 0.01,
        //            "multiplier": 0.01,
        //            "initialMargin": 0.01,
        //            "maintainMargin": 0.005,
        //            "maxRiskLimit": 1000000,
        //            "minRiskLimit": 1000000,
        //            "riskStep": 500000,
        //            "makerFeeRate": 0.00020,
        //            "takerFeeRate": 0.00060,
        //            "takerFixFee": 0.0000000000,
        //            "makerFixFee": 0.0000000000,
        //            "settlementFee": null,
        //            "isDeleverage": true,
        //            "isQuanto": true,
        //            "isInverse": false,
        //            "markMethod": "FairPrice",
        //            "fairMethod": "FundingRate",
        //            "fundingBaseSymbol": ".ETHINT8H",
        //            "fundingQuoteSymbol": ".USDTINT8H",
        //            "fundingRateSymbol": ".ETHUSDTMFPI8H",
        //            "indexSymbol": ".KETHUSDT",
        //            "settlementSymbol": "",
        //            "status": "Open",
        //            "fundingFeeRate": 0.000535,
        //            "predictedFundingFeeRate": 0.002197,
        //            "openInterest": "8724443",
        //            "turnoverOf24h": 341156641.03354263,
        //            "volumeOf24h": 74833.54000000,
        //            "markPrice": 4534.07,
        //            "indexPrice":4531.92,
        //            "lastTradePrice": 4545.4500000000,
        //            "nextFundingRateTime": 25481884,
        //            "maxLeverage": 100,
        //            "sourceExchanges":  [ "huobi", "Okex", "Binance", "Kucoin", "Poloniex", "Hitbtc" ],
        //            "premiumsSymbol1M": ".ETHUSDTMPI",
        //            "premiumsSymbol8H": ".ETHUSDTMPI8H",
        //            "fundingBaseSymbol1M": ".ETHINT",
        //            "fundingQuoteSymbol1M": ".USDTINT",
        //            "lowPrice": 4456.90,
        //            "highPrice":  4674.25,
        //            "priceChgPct": 0.0046,
        //            "priceChg": 21.15
        //        }
        //    }
        //
        const result = [];
        const data = this.safeList(response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString(market, 'symbol');
            const expiry = this.safeInteger(market, 'expireDate');
            const future = this.safeString(market, 'nextFundingRateTime') === undefined;
            const swap = !future;
            const baseId = this.safeString(market, 'baseCurrency');
            const quoteId = this.safeString(market, 'quoteCurrency');
            const settleId = this.safeString(market, 'settleCurrency');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const settle = this.safeCurrencyCode(settleId);
            let symbol = base + '/' + quote + ':' + settle;
            let type = 'swap';
            if (future) {
                symbol = symbol + '-' + this.yymmdd(expiry, '');
                type = 'future';
            }
            const inverse = this.safeValue(market, 'isInverse');
            const status = this.safeString(market, 'status');
            const multiplier = this.safeString(market, 'multiplier');
            const tickSize = this.safeNumber(market, 'tickSize');
            const lotSize = this.safeNumber(market, 'lotSize');
            let limitAmountMin = lotSize;
            if (limitAmountMin === undefined) {
                limitAmountMin = this.safeNumber(market, 'baseMinSize');
            }
            let limitAmountMax = this.safeNumber(market, 'maxOrderQty');
            if (limitAmountMax === undefined) {
                limitAmountMax = this.safeNumber(market, 'baseMaxSize');
            }
            let limitPriceMax = this.safeNumber(market, 'maxPrice');
            if (limitPriceMax === undefined) {
                const baseMinSizeString = this.safeString(market, 'baseMinSize');
                const quoteMaxSizeString = this.safeString(market, 'quoteMaxSize');
                limitPriceMax = this.parseNumber(Precise["default"].stringDiv(quoteMaxSizeString, baseMinSizeString));
            }
            result.push({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': false,
                'margin': false,
                'swap': swap,
                'future': future,
                'option': false,
                'active': (status === 'Open'),
                'contract': true,
                'linear': !inverse,
                'inverse': inverse,
                'taker': this.safeNumber(market, 'takerFeeRate'),
                'maker': this.safeNumber(market, 'makerFeeRate'),
                'contractSize': this.parseNumber(Precise["default"].stringAbs(multiplier)),
                'expiry': expiry,
                'expiryDatetime': this.iso8601(expiry),
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': lotSize,
                    'price': tickSize,
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber('1'),
                        'max': this.safeNumber(market, 'maxLeverage'),
                    },
                    'amount': {
                        'min': limitAmountMin,
                        'max': limitAmountMax,
                    },
                    'price': {
                        'min': tickSize,
                        'max': limitPriceMax,
                    },
                    'cost': {
                        'min': this.safeNumber(market, 'quoteMinSize'),
                        'max': this.safeNumber(market, 'quoteMaxSize'),
                    },
                },
                'created': this.safeInteger(market, 'firstOpenDate'),
                'info': market,
            });
        }
        return result;
    }
    async fetchUTAMarkets(params = {}) {
        const promises = [];
        promises.push(this.utaGetMarketInstrument(this.extend(params, { 'tradeType': 'SPOT' })));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "tradeType": "SPOT",
        //             "list": [
        //                 {
        //                     "symbol": "AVA-USDT",
        //                     "name": "AVA-USDT",
        //                     "baseCurrency": "AVA",
        //                     "quoteCurrency": "USDT",
        //                     "market": "USDS",
        //                     "minBaseOrderSize": "0.1",
        //                     "minQuoteOrderSize": "0.1",
        //                     "maxBaseOrderSize": "10000000000",
        //                     "maxQuoteOrderSize": "99999999",
        //                     "baseOrderStep": "0.01",
        //                     "quoteOrderStep": "0.0001",
        //                     "tickSize": "0.0001",
        //                     "feeCurrency": "USDT",
        //                     "tradingStatus": "1",
        //                     "marginMode": "2",
        //                     "priceLimitRatio": "0.05",
        //                     "feeCategory": 1,
        //                     "makerFeeCoefficient": "1.00",
        //                     "takerFeeCoefficient": "1.00",
        //                     "st": false
        //                 },
        //             ]
        //         }
        //     }
        //
        promises.push(this.utaGetMarketInstrument(this.extend(params, { 'tradeType': 'FUTURES' })));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "tradeType": "FUTURES",
        //             "list": [
        //                 {
        //                     "symbol": "XBTUSDTM",
        //                     "baseCurrency": "XBT",
        //                     "quoteCurrency": "USDT",
        //                     "maxBaseOrderSize": "1000000",
        //                     "tickSize": "0.1",
        //                     "tradingStatus": "1",
        //                     "settlementCurrency": "USDT",
        //                     "contractType": "0",
        //                     "isInverse": false,
        //                     "launchTime": 1585555200000,
        //                     "expiryTime": null,
        //                     "settlementTime": null,
        //                     "maxPrice": "1000000.0",
        //                     "lotSize": "1",
        //                     "unitSize": "0.001",
        //                     "makerFeeRate": "0.00020",
        //                     "takerFeeRate": "0.00060",
        //                     "settlementFeeRate": null,
        //                     "maxLeverage": 125,
        //                     "indexSourceExchanges": ["okex","binance","kucoin","bybit","bitmart","gateio"],
        //                     "k": "490.0",
        //                     "m": "300.0",
        //                     "f": "1.3",
        //                     "mmrLimit": "0.3",
        //                     "mmrLevConstant": "125.0"
        //                 },
        //             ]
        //         }
        //     }
        //
        const responses = await Promise.all(promises);
        const data = this.safeDict(responses[0], 'data', {});
        const contractData = this.safeDict(responses[1], 'data', {});
        const spotData = this.safeList(data, 'list', []);
        const contractSymbolsData = this.safeList(contractData, 'list', []);
        const symbolsData = this.arrayConcat(spotData, contractSymbolsData);
        const result = [];
        for (let i = 0; i < symbolsData.length; i++) {
            const market = symbolsData[i];
            const id = this.safeString(market, 'symbol');
            const baseId = this.safeString(market, 'baseCurrency');
            const quoteId = this.safeString(market, 'quoteCurrency');
            const settleId = this.safeString(market, 'settlementCurrency');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const settle = this.safeCurrencyCode(settleId);
            const hasMargin = this.safeString(market, 'marginMode');
            const isMarginable = (hasMargin === '1') ? true : false;
            let symbol = base + '/' + quote;
            if (settle !== undefined) {
                symbol += ':' + settle;
            }
            const contractType = this.safeString(market, 'contractType');
            const expiry = this.safeInteger(market, 'expiryTime');
            const active = this.safeString(market, 'tradingStatus');
            let type = undefined;
            let spot = false;
            let swap = false;
            let future = false;
            let contract = false;
            let linear = false;
            let inverse = false;
            if (contractType !== undefined) {
                contract = true;
                if (quote === settle) {
                    linear = true;
                }
                else {
                    inverse = true;
                }
                if (contractType === '0') {
                    type = 'swap';
                    swap = true;
                }
                else {
                    type = 'future';
                    future = true;
                }
            }
            else {
                type = 'spot';
                spot = true;
            }
            result.push({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': spot,
                'margin': isMarginable,
                'swap': swap,
                'future': future,
                'option': false,
                'active': (active === '1'),
                'contract': contract,
                'linear': linear,
                'inverse': inverse,
                'taker': this.safeNumber(market, 'makerFeeRate'),
                'maker': this.safeNumber(market, 'takerFeeRate'),
                'contractSize': this.safeNumber(market, 'unitSize'),
                'expiry': expiry,
                'expiryDatetime': this.iso8601(expiry),
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber2(market, 'lotSize', 'baseOrderStep'),
                    'price': this.safeNumber(market, 'tickSize'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': this.safeInteger(market, 'maxLeverage'),
                    },
                    'amount': {
                        'min': this.safeNumber(market, 'minBaseOrderSize'),
                        'max': this.safeNumber(market, 'maxBaseOrderSize'),
                    },
                    'price': {
                        'min': undefined,
                        'max': this.safeNumber(market, 'maxPrice'),
                    },
                    'cost': {
                        'min': this.safeNumber(market, 'minQuoteOrderSize'),
                        'max': this.safeNumber(market, 'maxQuoteOrderSize'),
                    },
                },
                'created': this.safeInteger(market, 'launchTime'),
                'info': market,
            });
        }
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference();
        }
        return result;
    }
    /**
     * @method
     * @name kucoin#loadMigrationStatus
     * @param {boolean} force load account state for non hf
     * @description loads the migration status for the account (hf or not)
     * @see https://www.kucoin.com/docs/rest/spot-trading/spot-hf-trade-pro-account/get-user-type
     * @returns {any} ignore
     */
    async loadMigrationStatus(force = false) {
        if (!('hf' in this.options) || (this.options['hf'] === undefined) || force) {
            const result = await this.privateGetHfAccountsOpened();
            this.options['hf'] = this.safeBool(result, 'data');
        }
        return true;
    }
    handleHfAndParams(params = {}) {
        const migrated = this.safeBool(this.options, 'hf', false);
        let loadedHf = undefined;
        if (migrated !== undefined) {
            if (migrated) {
                loadedHf = true;
            }
            else {
                loadedHf = false;
            }
        }
        const hf = this.safeBool(params, 'hf', loadedHf);
        params = this.omit(params, 'hf');
        return [hf, params];
    }
    /**
     * @method
     * @name kucoin#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-currencies
     * @see https://www.kucoin.com/docs-new/rest/ua/get-currencies
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        let uta = false;
        if (this.checkRequiredCredentials(false)) {
            uta = await this.isUTAEnabled();
        }
        [uta, params] = this.handleOptionAndParams(params, 'fetchCurrencies', 'uta', uta);
        let response = undefined;
        if (uta) {
            //
            //     {
            //         "code": "200000",
            //         "data": [
            //             {
            //                 "currency": "CSP",
            //                 "name": "CSP",
            //                 "fullName": "Caspian",
            //                 "precision": 8,
            //                 "isMarginEnabled": false,
            //                 "isDebitEnabled": false,
            //                 "items": [
            //                     {
            //                         "chainName": "ERC20",
            //                         "minWithdrawSize": "2999",
            //                         "minDepositSize": null,
            //                         "withdrawFeeRate": "0",
            //                         "minWithdrawFee": "2999",
            //                         "isWithdrawEnabled": false,
            //                         "isDepositEnabled": false,
            //                         "confirms": 96,
            //                         "preConfirms": 32,
            //                         "contractAddress": "0xa6446d655a0c34bc4f05042ee88170d056cbaf45",
            //                         "withdrawPrecision": 8,
            //                         "maxWithdrawSize": null,
            //                         "maxDepositSize": null,
            //                         "isMemoRequired": false,
            //                         "chainId": "eth"
            //                     }
            //                 ]
            //             }
            //         ]
            //     }
            //
            response = await this.utaGetAssetCurrencies(params);
        }
        else {
            //
            //    {
            //        "code":"200000",
            //        "data":[
            //           {
            //              "currency":"CSP",
            //              "name":"CSP",
            //              "fullName":"Caspian",
            //              "precision":8,
            //              "confirms":null,
            //              "contractAddress":null,
            //              "isMarginEnabled":false,
            //              "isDebitEnabled":false,
            //              "chains":[
            //                 {
            //                    "chainName":"ERC20",
            //                    "chainId": "eth"
            //                    "withdrawalMinSize":"2999",
            //                    "depositMinSize":null,
            //                    "withdrawFeeRate":"0",
            //                    "withdrawalMinFee":"2999",
            //                    "isWithdrawEnabled":false,
            //                    "isDepositEnabled":false,
            //                    "confirms":12,
            //                    "preConfirms":12,
            //                    "withdrawPrecision": 8,
            //                    "maxWithdraw": null,
            //                    "maxDeposit": null,
            //                    "needTag": false,
            //                    "contractAddress":"0xa6446d655a0c34bc4f05042ee88170d056cbaf45",
            //                    "depositFeeRate": "0.001", // present for some currencies/networks
            //                 }
            //              ]
            //           },
            //        ]
            //    }
            //
            response = await this.publicGetCurrencies(params);
        }
        const currenciesData = this.safeList(response, 'data', []);
        const brokenCurrencies = this.safeList(this.options, 'brokenCurrencies', ['00', 'OPEN_ERROR', 'HUF', 'BDT']);
        const result = {};
        for (let i = 0; i < currenciesData.length; i++) {
            const entry = currenciesData[i];
            const id = this.safeString(entry, 'currency');
            if (this.inArray(id, brokenCurrencies)) {
                continue; // skip buggy entries: https://t.me/KuCoin_API/217798
            }
            const code = this.safeCurrencyCode(id);
            const networks = {};
            const chains = this.safeList2(entry, 'chains', 'items', []);
            const chainsLength = chains.length;
            for (let j = 0; j < chainsLength; j++) {
                const chain = chains[j];
                const chainId = this.safeString(chain, 'chainId');
                const networkCode = this.networkIdToCode(chainId, code);
                networks[networkCode] = {
                    'info': chain,
                    'id': chainId,
                    'name': this.safeString(chain, 'chainName'),
                    'code': networkCode,
                    'active': undefined,
                    'fee': this.safeNumber2(chain, 'withdrawalMinFee', 'minWithdrawFee'),
                    'deposit': this.safeBool(chain, 'isDepositEnabled'),
                    'withdraw': this.safeBool(chain, 'isWithdrawEnabled'),
                    'precision': this.parseNumber(this.parsePrecision(this.safeString(chain, 'withdrawPrecision'))),
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber2(chain, 'withdrawalMinSize', 'minWithdrawSize'),
                            'max': this.safeNumber2(chain, 'maxWithdraw', 'maxWithdrawSize'),
                        },
                        'deposit': {
                            'min': this.safeNumber2(chain, 'depositMinSize', 'minDepositSize'),
                            'max': this.safeNumber2(chain, 'maxDeposit', 'maxDepositSize'),
                        },
                    },
                };
            }
            // kucoin has determined 'fiat' currencies with below logic
            const rawPrecision = this.safeString(entry, 'precision');
            const precision = this.parseNumber(this.parsePrecision(rawPrecision));
            const isFiat = chainsLength === 0;
            result[code] = this.safeCurrencyStructure({
                'id': id,
                'name': this.safeString(entry, 'fullName'),
                'code': code,
                'type': isFiat ? 'fiat' : 'crypto',
                'precision': precision,
                'info': entry,
                'networks': networks,
                'deposit': undefined,
                'withdraw': undefined,
                'active': undefined,
                'fee': undefined,
                'limits': undefined,
            });
        }
        return result;
    }
    /**
     * @method
     * @name kucoin#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-list-spot
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
     */
    async fetchAccounts(params = {}) {
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'fetchAccounts', 'uta', uta);
        let response = undefined;
        let data = [];
        if (uta) {
            response = await this.utaPrivateGetAccountModeAccountOverview(this.extend(params, { 'accountMode': 'unified' }));
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "accountType": "UNIFIED",
            //             "riskRatio": "0.0000000000",
            //             "equity": "30.0000000000",
            //             "liability": "0.0000000000",
            //             "availableMargin": "30.0000000000",
            //             "adjustedEquity": "30.0000000000",
            //             "im": "0.0000000000",
            //             "mm": "0.0000000000"
            //         }
            //     }
            //
            const dataDict = this.safeDict(response, 'data', {});
            data = [dataDict];
        }
        else {
            //
            //     {
            //         "code": "200000",
            //         "data": [
            //             {
            //                 "balance": "0.00009788",
            //                 "available": "0.00009788",
            //                 "holds": "0",
            //                 "currency": "BTC",
            //                 "id": "5c6a4fd399a1d81c4f9cc4d0",
            //                 "type": "trade"
            //             },
            //             {
            //                 "balance": "0.00000001",
            //                 "available": "0.00000001",
            //                 "holds": "0",
            //                 "currency": "ETH",
            //                 "id": "5c6a49ec99a1d819392e8e9f",
            //                 "type": "trade"
            //             }
            //         ]
            //     }
            //
            response = await this.privateGetAccounts(params);
            data = this.safeList(response, 'data', []);
        }
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const account = data[i];
            const accountId = this.safeString(account, 'id');
            const currencyId = this.safeString(account, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const type = this.safeStringLower2(account, 'type', 'accountType'); // main or trade or unified
            result.push({
                'id': accountId,
                'type': type,
                'currency': code,
                'code': code,
                'info': account,
            });
        }
        return result;
    }
    /**
     * @method
     * @name kucoin#fetchTransactionFee
     * @description *DEPRECATED* please use fetchDepositWithdrawFee instead
     * @see https://docs.kucoin.com/#get-withdrawal-quotas
     * @param {string} code unified currency code
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    async fetchTransactionFee(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode !== undefined) {
            request['chain'] = this.networkCodeToId(networkCode).toLowerCase();
        }
        const response = await this.privateGetWithdrawalsQuotas(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        const withdrawFees = {};
        withdrawFees[code] = this.safeNumber(data, 'withdrawMinFee');
        return {
            'info': response,
            'withdraw': withdrawFees,
            'deposit': {},
        };
    }
    /**
     * @method
     * @name kucoin#fetchDepositWithdrawFee
     * @description fetch the fee for deposits and withdrawals
     * @see https://www.kucoin.com/docs-new/rest/account-info/withdrawals/get-withdrawal-quotas
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] The chain of currency. This only apply for multi-chain currency, and there is no need for single chain currency; you can query the chain through the response of the GET /api/v2/currencies/{currency} interface
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    async fetchDepositWithdrawFee(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode !== undefined) {
            request['chain'] = this.networkCodeToId(networkCode).toLowerCase();
        }
        const response = await this.privateGetWithdrawalsQuotas(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "currency": "USDT",
        //            "limitBTCAmount": "1.00000000",
        //            "usedBTCAmount": "0.00000000",
        //            "remainAmount": "16548.072149",
        //            "availableAmount": "0",
        //            "withdrawMinFee": "25",
        //            "innerWithdrawMinFee": "0",
        //            "withdrawMinSize": "50",
        //            "isWithdrawEnabled": true,
        //            "precision": 6,
        //            "chain": "ERC20"
        //        }
        //    }
        //
        const data = this.safeDict(response, 'data');
        return this.parseDepositWithdrawFee(data, currency);
    }
    parseDepositWithdrawFee(fee, currency = undefined) {
        //
        //    {
        //        "currency": "USDT",
        //        "limitBTCAmount": "1.00000000",
        //        "usedBTCAmount": "0.00000000",
        //        "remainAmount": "16548.072149",
        //        "availableAmount": "0",
        //        "withdrawMinFee": "25",
        //        "innerWithdrawMinFee": "0",
        //        "withdrawMinSize": "50",
        //        "isWithdrawEnabled": true,
        //        "precision": 6,
        //        "chain": "ERC20"
        //    }
        //
        if ('chains' in fee) {
            // if data obtained through `currencies` endpoint
            const resultNew = {
                'info': fee,
                'withdraw': {
                    'fee': undefined,
                    'percentage': false,
                },
                'deposit': {
                    'fee': undefined,
                    'percentage': undefined,
                },
                'networks': {},
            };
            const chains = this.safeList(fee, 'chains', []);
            for (let i = 0; i < chains.length; i++) {
                const chain = chains[i];
                const networkCodeNew = this.networkIdToCode(this.safeString(chain, 'chainId'), this.safeString(currency, 'code'));
                resultNew['networks'][networkCodeNew] = {
                    'withdraw': {
                        'fee': this.safeNumber2(chain, 'withdrawalMinFee', 'withdrawMinFee'),
                        'percentage': false,
                    },
                    'deposit': {
                        'fee': undefined,
                        'percentage': undefined,
                    },
                };
            }
            return resultNew;
        }
        const minWithdrawFee = this.safeNumber(fee, 'withdrawMinFee');
        const result = {
            'info': fee,
            'withdraw': {
                'fee': minWithdrawFee,
                'percentage': false,
            },
            'deposit': {
                'fee': undefined,
                'percentage': undefined,
            },
            'networks': {},
        };
        const networkId = this.safeString(fee, 'chain');
        const networkCode = this.networkIdToCode(networkId, this.safeString(currency, 'code'));
        result['networks'][networkCode] = {
            'withdraw': minWithdrawFee,
            'deposit': {
                'fee': undefined,
                'percentage': undefined,
            },
        };
        return result;
    }
    isFuturesMethod(methodName, params) {
        //
        // Helper
        // @methodName (string): The name of the method
        // @params (dict): The parameters passed into {methodName}
        // @return: true if the method used is meant for futures trading, false otherwise
        //
        const defaultType = this.safeString2(this.options, methodName, 'defaultType', 'trade');
        const requestedType = this.safeString(params, 'type', defaultType);
        const accountsByType = this.safeDict(this.options, 'accountsByType');
        const type = this.safeString(accountsByType, requestedType);
        if (type === undefined) {
            const keys = Object.keys(accountsByType);
            throw new errors.ExchangeError(this.id + ' isFuturesMethod() type must be one of ' + keys.join(', '));
        }
        params = this.omit(params, 'type');
        return (type === 'contract') || (type === 'future') || (type === 'futures'); // * (type === 'futures') deprecated, use (type === 'future')
    }
    parseSpotOrUtaTicker(ticker, market = undefined) {
        //
        //     {
        //         "symbol": "BTC-USDT",   // symbol
        //         "symbolName":"BTC-USDT", // Name of trading pairs, it would change after renaming
        //         "buy": "11328.9",   // bestAsk
        //         "sell": "11329",    // bestBid
        //         "changeRate": "-0.0055",    // 24h change rate
        //         "changePrice": "-63.6", // 24h change price
        //         "high": "11610",    // 24h highest price
        //         "low": "11200", // 24h lowest price
        //         "vol": "2282.70993217", // 24h volume，the aggregated trading volume in BTC
        //         "volValue": "25984946.157790431",   // 24h total, the trading volume in quote currency of last 24 hours
        //         "last": "11328.9",  // last price
        //         "averagePrice": "11360.66065903",   // 24h average transaction price yesterday
        //         "takerFeeRate": "0.001",    // Basic Taker Fee
        //         "makerFeeRate": "0.001",    // Basic Maker Fee
        //         "takerCoefficient": "1",    // Taker Fee Coefficient
        //         "makerCoefficient": "1" // Maker Fee Coefficient
        //     }
        //
        //     {
        //         "trading": true,
        //         "symbol": "KCS-BTC",
        //         "buy": 0.00011,
        //         "sell": 0.00012,
        //         "sort": 100,
        //         "volValue": 3.13851792584,   //total
        //         "baseCurrency": "KCS",
        //         "market": "BTC",
        //         "quoteCurrency": "BTC",
        //         "symbolCode": "KCS-BTC",
        //         "datetime": 1548388122031,
        //         "high": 0.00013,
        //         "vol": 27514.34842,
        //         "low": 0.0001,
        //         "changePrice": -1.0e-5,
        //         "changeRate": -0.0769,
        //         "lastTradedPrice": 0.00012,
        //         "board": 0,
        //         "mark": 0
        //     }
        //
        // market/ticker ws subscription
        //
        //     {
        //         "bestAsk": "62258.9",
        //         "bestAskSize": "0.38579986",
        //         "bestBid": "62258.8",
        //         "bestBidSize": "0.0078381",
        //         "price": "62260.7",
        //         "sequence": "1621383297064",
        //         "size": "0.00002841",
        //         "time": 1634641777363
        //     }
        //
        // uta
        //
        //     {
        //         "symbol": "BTC-USDT",
        //         "name": "BTC-USDT",
        //         "bestBidSize": "0.69207954",
        //         "bestBidPrice": "110417.5",
        //         "bestAskSize": "0.08836606",
        //         "bestAskPrice": "110417.6",
        //         "lastPrice": "110417.5",
        //         "size": "0.00016",
        //         "open": "110105.1",
        //         "high": "110838.9",
        //         "low": "109705.5",
        //         "baseVolume": "1882.10069442",
        //         "quoteVolume": "207325626.822922498"
        //     }
        //
        let percentage = this.safeString(ticker, 'changeRate');
        if (percentage !== undefined) {
            percentage = Precise["default"].stringMul(percentage, '100');
        }
        let last = this.safeStringN(ticker, ['last', 'lastTradedPrice', 'lastPrice']);
        last = this.safeString(ticker, 'price', last);
        const marketId = this.safeString(ticker, 'symbol');
        market = this.safeMarket(marketId, market, '-');
        const symbol = market['symbol'];
        const baseVolume = this.safeString2(ticker, 'vol', 'baseVolume');
        const quoteVolume = this.safeString2(ticker, 'volValue', 'quoteVolume');
        const timestamp = this.safeIntegerN(ticker, ['time', 'datetime', 'timePoint']);
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'high'),
            'low': this.safeString(ticker, 'low'),
            'bid': this.safeStringN(ticker, ['buy', 'bestBid', 'bestBidPrice']),
            'bidVolume': this.safeString(ticker, 'bestBidSize'),
            'ask': this.safeStringN(ticker, ['sell', 'bestAsk', 'bestAskPrice']),
            'askVolume': this.safeString(ticker, 'bestAskSize'),
            'vwap': undefined,
            'open': this.safeString(ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString(ticker, 'changePrice'),
            'percentage': percentage,
            'average': this.safeString(ticker, 'averagePrice'),
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'markPrice': this.safeString(ticker, 'value'),
            'info': ticker,
        }, market);
    }
    parseTicker(ticker, market = undefined) {
        // wrapper for parseTickers
        // parseTickers used only in methods for contract markets
        return this.parseContractTicker(ticker, market);
    }
    parseContractTicker(ticker, market = undefined) {
        //
        //     {
        //         "symbol": "LTCUSDTM",
        //         "granularity": 1000,
        //         "timePoint": 1727967339000,
        //         "value": 62.37, mark price
        //         "indexPrice": 62.37
        //      }
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "sequence":  1629930362547,
        //             "symbol": "ETHUSDTM",
        //             "side": "buy",
        //             "size":  130,
        //             "price": "4724.7",
        //             "bestBidSize":  5,
        //             "bestBidPrice": "4724.6",
        //             "bestAskPrice": "4724.65",
        //             "tradeId": "618d2a5a77a0c4431d2335f4",
        //             "ts":  1636641371963227600,
        //             "bestAskSize":  1789
        //          }
        //     }
        //
        // from fetchTickers
        //
        // {
        //     symbol: "XBTUSDTM",
        //     rootSymbol: "USDT",
        //     type: "FFWCSX",
        //     firstOpenDate: 1585555200000,
        //     expireDate: null,
        //     settleDate: null,
        //     baseCurrency: "XBT",
        //     quoteCurrency: "USDT",
        //     settleCurrency: "USDT",
        //     maxOrderQty: 1000000,
        //     maxPrice: 1000000,
        //     lotSize: 1,
        //     tickSize: 0.1,
        //     indexPriceTickSize: 0.01,
        //     multiplier: 0.001,
        //     initialMargin: 0.008,
        //     maintainMargin: 0.004,
        //     maxRiskLimit: 100000,
        //     minRiskLimit: 100000,
        //     riskStep: 50000,
        //     makerFeeRate: 0.0002,
        //     takerFeeRate: 0.0006,
        //     takerFixFee: 0,
        //     makerFixFee: 0,
        //     settlementFee: null,
        //     isDeleverage: true,
        //     isQuanto: true,
        //     isInverse: false,
        //     markMethod: "FairPrice",
        //     fairMethod: "FundingRate",
        //     fundingBaseSymbol: ".XBTINT8H",
        //     fundingQuoteSymbol: ".USDTINT8H",
        //     fundingRateSymbol: ".XBTUSDTMFPI8H",
        //     indexSymbol: ".KXBTUSDT",
        //     settlementSymbol: "",
        //     status: "Open",
        //     fundingFeeRate: 0.000297,
        //     predictedFundingFeeRate: 0.000327,
        //     fundingRateGranularity: 28800000,
        //     openInterest: "8033200",
        //     turnoverOf24h: 659795309.2524643,
        //     volumeOf24h: 9998.54,
        //     markPrice: 67193.51,
        //     indexPrice: 67184.81,
        //     lastTradePrice: 67191.8,
        //     nextFundingRateTime: 20022985,
        //     maxLeverage: 125,
        //     premiumsSymbol1M: ".XBTUSDTMPI",
        //     premiumsSymbol8H: ".XBTUSDTMPI8H",
        //     fundingBaseSymbol1M: ".XBTINT",
        //     fundingQuoteSymbol1M: ".USDTINT",
        //     lowPrice: 64041.6,
        //     highPrice: 67737.3,
        //     priceChgPct: 0.0447,
        //     priceChg: 2878.7
        // }
        //
        const marketId = this.safeString(ticker, 'symbol');
        market = this.safeMarket(marketId, market, '-');
        const last = this.safeString2(ticker, 'price', 'lastTradePrice');
        const timestamp = this.safeIntegerProduct(ticker, 'ts', 0.000001);
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'highPrice'),
            'low': this.safeString(ticker, 'lowPrice'),
            'bid': this.safeString(ticker, 'bestBidPrice'),
            'bidVolume': this.safeString(ticker, 'bestBidSize'),
            'ask': this.safeString(ticker, 'bestAskPrice'),
            'askVolume': this.safeString(ticker, 'bestAskSize'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString(ticker, 'priceChg'),
            'percentage': this.safeString(ticker, 'priceChgPct'),
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'volumeOf24h'),
            'quoteVolume': this.safeString(ticker, 'turnoverOf24h'),
            'markPrice': this.safeString2(ticker, 'markPrice', 'value'),
            'indexPrice': this.safeString(ticker, 'indexPrice'),
            'info': ticker,
        }, market);
    }
    typeToTradeType(type) {
        const tradeTypes = {
            'spot': 'SPOT',
            'margin': 'MARGIN',
            'swap': 'FUTURES',
        };
        return this.safeString(tradeTypes, type, type);
    }
    /**
     * @method
     * @name kucoin#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-tickers
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-all-tickers
     * @see https://www.kucoin.com/docs-new/rest/ua/get-ticker
     * @param {string[]|undefined} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @param {string} [params.type] spot or swap (default is spot)
     * @param {string} [params.method] *swap only* the method to use, futuresPublicGetContractsActive or futuresPublicGetAllTickers (default is futuresPublicGetContractsActive)
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        symbols = this.marketSymbols(symbols, undefined, true, true);
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'fetchTickers', 'uta', uta);
        const tradeType = this.safeString(params, 'tradeType');
        let firstMarket = undefined;
        if (symbols !== undefined) {
            const firstSymbol = this.safeString(symbols, 0);
            firstMarket = this.market(firstSymbol);
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchTickers', firstMarket, params);
        let response = undefined;
        if ((tradeType !== undefined) || uta) {
            if (tradeType === undefined) {
                request['tradeType'] = this.typeToTradeType(type);
            }
            response = await this.utaGetMarketTicker(this.extend(request, params));
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "tradeType": "SPOT",
            //             "ts": 1762061290067,
            //             "list": [
            //                 {
            //                     "symbol": "BTC-USDT",
            //                     "name": "BTC-USDT",
            //                     "bestBidSize": "0.69207954",
            //                     "bestBidPrice": "110417.5",
            //                     "bestAskSize": "0.08836606",
            //                     "bestAskPrice": "110417.6",
            //                     "lastPrice": "110417.5",
            //                     "size": "0.00016",
            //                     "open": "110105.1",
            //                     "high": "110838.9",
            //                     "low": "109705.5",
            //                     "baseVolume": "1882.10069442",
            //                     "quoteVolume": "207325626.822922498"
            //                 }
            //             ]
            //         }
            //     }
            //
        }
        else if ((type !== 'spot') && (type !== 'margin')) {
            return await this.fetchContractTickers(symbols, params);
        }
        else {
            response = await this.publicGetMarketAllTickers(params);
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "time":1602832092060,
            //             "ticker":[
            //                 {
            //                     "symbol": "BTC-USDT",   // symbol
            //                     "symbolName":"BTC-USDT", // Name of trading pairs, it would change after renaming
            //                     "buy": "11328.9",   // bestAsk
            //                     "sell": "11329",    // bestBid
            //                     "changeRate": "-0.0055",    // 24h change rate
            //                     "changePrice": "-63.6", // 24h change price
            //                     "high": "11610",    // 24h highest price
            //                     "low": "11200", // 24h lowest price
            //                     "vol": "2282.70993217", // 24h volume，the aggregated trading volume in BTC
            //                     "volValue": "25984946.157790431",   // 24h total, the trading volume in quote currency of last 24 hours
            //                     "last": "11328.9",  // last price
            //                     "averagePrice": "11360.66065903",   // 24h average transaction price yesterday
            //                     "takerFeeRate": "0.001",    // Basic Taker Fee
            //                     "makerFeeRate": "0.001",    // Basic Maker Fee
            //                     "takerCoefficient": "1",    // Taker Fee Coefficient
            //                     "makerCoefficient": "1" // Maker Fee Coefficient
            //                 }
            //             ]
            //         }
            //     }
            //
        }
        const data = this.safeDict(response, 'data', {});
        const tickers = this.safeList2(data, 'ticker', 'list', []);
        const time = this.safeInteger2(data, 'time', 'ts');
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            tickers[i]['time'] = time;
            const ticker = this.parseSpotOrUtaTicker(tickers[i]);
            const symbol = this.safeString(ticker, 'symbol');
            if (symbol !== undefined) {
                result[symbol] = ticker;
            }
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    async fetchContractTickers(symbols = undefined, params = {}) {
        let method = undefined;
        [method, params] = this.handleOptionAndParams(params, 'fetchTickers', 'method', 'futuresPublicGetContractsActive');
        let response = undefined;
        if (method === 'futuresPublicGetAllTickers') {
            response = await this.futuresPublicGetAllTickers(params);
        }
        else {
            response = await this.futuresPublicGetContractsActive(params);
        }
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "symbol": "ETHUSDTM",
        //            "rootSymbol": "USDT",
        //            "type": "FFWCSX",
        //            "firstOpenDate": 1591086000000,
        //            "expireDate": null,
        //            "settleDate": null,
        //            "baseCurrency": "ETH",
        //            "quoteCurrency": "USDT",
        //            "settleCurrency": "USDT",
        //            "maxOrderQty": 1000000,
        //            "maxPrice": 1000000.0000000000,
        //            "lotSize": 1,
        //            "tickSize": 0.05,
        //            "indexPriceTickSize": 0.01,
        //            "multiplier": 0.01,
        //            "initialMargin": 0.01,
        //            "maintainMargin": 0.005,
        //            "maxRiskLimit": 1000000,
        //            "minRiskLimit": 1000000,
        //            "riskStep": 500000,
        //            "makerFeeRate": 0.00020,
        //            "takerFeeRate": 0.00060,
        //            "takerFixFee": 0.0000000000,
        //            "makerFixFee": 0.0000000000,
        //            "settlementFee": null,
        //            "isDeleverage": true,
        //            "isQuanto": true,
        //            "isInverse": false,
        //            "markMethod": "FairPrice",
        //            "fairMethod": "FundingRate",
        //            "fundingBaseSymbol": ".ETHINT8H",
        //            "fundingQuoteSymbol": ".USDTINT8H",
        //            "fundingRateSymbol": ".ETHUSDTMFPI8H",
        //            "indexSymbol": ".KETHUSDT",
        //            "settlementSymbol": "",
        //            "status": "Open",
        //            "fundingFeeRate": 0.000535,
        //            "predictedFundingFeeRate": 0.002197,
        //            "openInterest": "8724443",
        //            "turnoverOf24h": 341156641.03354263,
        //            "volumeOf24h": 74833.54000000,
        //            "markPrice": 4534.07,
        //            "indexPrice":4531.92,
        //            "lastTradePrice": 4545.4500000000,
        //            "nextFundingRateTime": 25481884,
        //            "maxLeverage": 100,
        //            "sourceExchanges":  [ "huobi", "Okex", "Binance", "Kucoin", "Poloniex", "Hitbtc" ],
        //            "premiumsSymbol1M": ".ETHUSDTMPI",
        //            "premiumsSymbol8H": ".ETHUSDTMPI8H",
        //            "fundingBaseSymbol1M": ".ETHINT",
        //            "fundingQuoteSymbol1M": ".USDTINT",
        //            "lowPrice": 4456.90,
        //            "highPrice":  4674.25,
        //            "priceChgPct": 0.0046,
        //            "priceChg": 21.15
        //        }
        //    }
        //
        const data = this.safeList(response, 'data');
        const tickers = this.parseTickers(data, symbols);
        return this.filterByArrayTickers(tickers, 'symbol', symbols);
    }
    /**
     * @method
     * @name kucoin#fetchMarkPrices
     * @description fetches the mark price for multiple markets
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/market-data/get-mark-price-list
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchMarkPrices(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.publicGetMarkPriceAllSymbols(params);
        const data = this.safeList(response, 'data', []);
        return this.parseTickers(data);
    }
    /**
     * @method
     * @name kucoin#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-24hr-stats
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-ticker
     * @see https://www.kucoin.com/docs-new/rest/ua/get-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'fetchTicker', 'uta', uta);
        let response = undefined;
        let result = undefined;
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchTicker', market, params);
        if (uta) {
            request['tradeType'] = this.typeToTradeType(type);
            response = await this.utaGetMarketTicker(this.extend(request, params));
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "tradeType": "SPOT",
            //             "ts": 1762061290067,
            //             "list": [
            //                 {
            //                     "symbol": "BTC-USDT",
            //                     "name": "BTC-USDT",
            //                     "bestBidSize": "0.69207954",
            //                     "bestBidPrice": "110417.5",
            //                     "bestAskSize": "0.08836606",
            //                     "bestAskPrice": "110417.6",
            //                     "lastPrice": "110417.5",
            //                     "size": "0.00016",
            //                     "open": "110105.1",
            //                     "high": "110838.9",
            //                     "low": "109705.5",
            //                     "baseVolume": "1882.10069442",
            //                     "quoteVolume": "207325626.822922498"
            //                 }
            //             ]
            //         }
            //     }
            //
            const data = this.safeDict(response, 'data', {});
            const resultList = this.safeList(data, 'list', []);
            result = this.safeDict(resultList, 0, {});
        }
        else if (market['contract']) {
            response = await this.futuresPublicGetTicker(this.extend(request, params));
            //
            //    {
            //        "code": "200000",
            //        "data": {
            //            "sequence": 1638444978558,
            //            "symbol": "ETHUSDTM",
            //            "side": "sell",
            //            "size": 4,
            //            "price": "4229.35",
            //            "bestBidSize": 2160,
            //            "bestBidPrice": "4229.0",
            //            "bestAskPrice": "4229.05",
            //            "tradeId": "61aaa8b777a0c43055fe4851",
            //            "ts": 1638574296209786785,
            //            "bestAskSize": 36,
            //        }
            //    }
            //
            const data = this.safeDict(response, 'data', {});
            return this.parseTicker(data, market);
        }
        else {
            response = await this.publicGetMarketStats(this.extend(request, params));
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "time": 1602832092060,  // time
            //             "symbol": "BTC-USDT",   // symbol
            //             "buy": "11328.9",   // bestAsk
            //             "sell": "11329",    // bestBid
            //             "changeRate": "-0.0055",    // 24h change rate
            //             "changePrice": "-63.6", // 24h change price
            //             "high": "11610",    // 24h highest price
            //             "low": "11200", // 24h lowest price
            //             "vol": "2282.70993217", // 24h volume，the aggregated trading volume in BTC
            //             "volValue": "25984946.157790431",   // 24h total, the trading volume in quote currency of last 24 hours
            //             "last": "11328.9",  // last price
            //             "averagePrice": "11360.66065903",   // 24h average transaction price yesterday
            //             "takerFeeRate": "0.001",    // Basic Taker Fee
            //             "makerFeeRate": "0.001",    // Basic Maker Fee
            //             "takerCoefficient": "1",    // Taker Fee Coefficient
            //             "makerCoefficient": "1" // Maker Fee Coefficient
            //         }
            //     }
            //
            result = this.safeDict(response, 'data', {});
        }
        return this.parseSpotOrUtaTicker(result, market);
    }
    /**
     * @method
     * @name kucoin#fetchMarkPrice
     * @description fetches the mark price for a specific market
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/market-data/get-mark-price-detail
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-mark-price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchMarkPrice(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['contract']) {
            response = await this.futuresPublicGetMarkPriceSymbolCurrent(this.extend(request, params));
            const data = this.safeDict(response, 'data', {});
            return this.parseTicker(data, market);
        }
        else {
            response = await this.publicGetMarkPriceSymbolCurrent(this.extend(request, params));
            const data = this.safeDict(response, 'data', {});
            return this.parseSpotOrUtaTicker(data, market);
        }
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     [
        //         "1545904980",             // Start time of the candle cycle
        //         "0.058",                  // opening price
        //         "0.049",                  // closing price
        //         "0.058",                  // highest price
        //         "0.049",                  // lowest price
        //         "0.018",                  // base volume
        //         "0.000945",               // quote volume
        //     ]
        //
        const timestampString = this.safeString(ohlcv, 0);
        if (timestampString !== undefined && timestampString.length <= 10) {
            // kucoin spot and uta return seconds timestamps
            return [
                this.safeTimestamp(ohlcv, 0),
                this.safeNumber(ohlcv, 1),
                this.safeNumber(ohlcv, 3),
                this.safeNumber(ohlcv, 4),
                this.safeNumber(ohlcv, 2),
                this.safeNumber(ohlcv, 5),
            ];
        }
        else {
            // kucoin futures return milliseconds timestamps
            return [
                this.safeInteger(ohlcv, 0),
                this.safeNumber(ohlcv, 1),
                this.safeNumber(ohlcv, 2),
                this.safeNumber(ohlcv, 3),
                this.safeNumber(ohlcv, 4),
                this.safeNumber(ohlcv, 5),
            ];
        }
    }
    /**
     * @method
     * @name kucoin#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-klines
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-klines
     * @see https://www.kucoin.com/docs-new/rest/ua/get-klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'uta', uta);
        if (uta) {
            return await this.fetchUTAOHLCV(symbol, timeframe, since, limit, params);
        }
        else if (market['contract']) {
            return await this.fetchContractOHLCV(symbol, timeframe, since, limit, params);
        }
        else {
            return await this.fetchSpotOHLCV(symbol, timeframe, since, limit, params);
        }
    }
    /**
     * @method
     * @ignore
     * @name kucoin#fetchUTAOHLCV
     * @description helper method for fetchOHLCV
     * @see https://www.kucoin.com/docs-new/rest/ua/get-klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchUTAOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const maxLimit = 1500;
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchUTAOHLCV', symbol, since, limit, timeframe, params, maxLimit);
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.safeString(this.timeframes, timeframe, timeframe),
        };
        const duration = this.parseTimeframe(timeframe) * 1000;
        let endAt = this.milliseconds(); // required param
        const denominator = 1000;
        if (since !== undefined) {
            request['startAt'] = this.parseToInt(Math.floor(since / denominator));
            if (limit === undefined) {
                // For each query, the system would return at most 1500 pieces of data.
                // To obtain more data, please page the data by time.
                limit = this.safeInteger(this.options, 'fetchOHLCVLimit', maxLimit);
            }
            endAt = this.sum(since, limit * duration);
        }
        else if (limit !== undefined) {
            since = endAt - limit * duration;
            request['startAt'] = this.parseToInt(Math.floor(since / denominator));
        }
        request['endAt'] = this.parseToInt(Math.floor(endAt / denominator));
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchOHLCV', market, params);
        if ((type === 'spot') || (type === 'margin')) {
            request['tradeType'] = 'SPOT';
        }
        else {
            request['tradeType'] = 'FUTURES';
        }
        const response = await this.utaGetMarketKline(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "tradeType": "SPOT",
        //             "symbol": "BTC-USDT",
        //             "list": [
        //                 ["1762240200","104581.4","104527.1","104620.1","104526.4","5.57665554","583263.661804122"],
        //                 ["1762240140","104565.6","104581.3","104601.7","104511.3","6.48505114","677973.775916968"],
        //                 ["1762240080","104621.5","104571.3","104704.7","104571.3","14.51713618","1519468.954060838"]
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const result = this.safeList(data, 'list', []);
        return this.parseOHLCVs(result, market, timeframe, since, limit);
    }
    /**
     * @method
     * @ignore
     * @name kucoin#fetchSpotOHLCV
     * @description helper method for fetchOHLCV
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchSpotOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const maxLimit = 1500;
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchSpotOHLCV', symbol, since, limit, timeframe, params, maxLimit);
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'type': this.safeString(this.timeframes, timeframe, timeframe),
        };
        const duration = this.parseTimeframe(timeframe) * 1000;
        let endAt = this.milliseconds(); // required param
        const denominator = 1000;
        if (since !== undefined) {
            request['startAt'] = this.parseToInt(Math.floor(since / denominator));
            if (limit === undefined) {
                // For each query, the system would return at most 1500 pieces of data.
                // To obtain more data, please page the data by time.
                limit = this.safeInteger(this.options, 'fetchOHLCVLimit', maxLimit);
            }
            endAt = this.sum(since, limit * duration);
        }
        else if (limit !== undefined) {
            since = endAt - limit * duration;
            request['startAt'] = this.parseToInt(Math.floor(since / denominator));
        }
        request['endAt'] = this.parseToInt(Math.floor(endAt / denominator));
        const response = await this.publicGetMarketCandles(this.extend(request, params));
        //
        //     {
        //         "code":"200000",
        //         "data":[
        //             ["1591517700","0.025078","0.025069","0.025084","0.025064","18.9883256","0.4761861079404"],
        //             ["1591516800","0.025089","0.025079","0.025089","0.02506","99.4716622","2.494143499081"],
        //             ["1591515900","0.025079","0.02509","0.025091","0.025068","59.83701271","1.50060885172798"],
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOHLCVs(data, market, timeframe, since, limit);
    }
    /**
     * @method
     * @ignore
     * @name kucoin#fetchContractOHLCV
     * @description helper method for fetchOHLCV
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchContractOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const maxLimit = 200;
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchContractOHLCV', symbol, since, limit, timeframe, params, maxLimit);
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const timeframeOptions = this.safeDict(this.options, 'timeframes', {});
        const swapTimeframes = this.safeDict(timeframeOptions, 'swap', {});
        const parsedTimeframe = this.safeInteger(swapTimeframes, timeframe);
        if (parsedTimeframe !== undefined) {
            request['granularity'] = parsedTimeframe;
        }
        else {
            request['granularity'] = timeframe;
        }
        const duration = this.parseTimeframe(timeframe) * 1000;
        let endAt = this.milliseconds(); // required param
        if (since !== undefined) {
            request['from'] = since;
            if (limit === undefined) {
                // For each query, the system would return at most 200 pieces of data.
                // To obtain more data, please page the data by time.
                limit = this.safeInteger(this.options, 'fetchOHLCVLimit', maxLimit);
            }
            endAt = this.sum(since, limit * duration);
        }
        else if (limit !== undefined) {
            since = endAt - limit * duration;
            request['from'] = since;
        }
        request['to'] = endAt;
        const response = await this.futuresPublicGetKlineQuery(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": [
        //            [1636459200000, 4779.3, 4792.1, 4768.7, 4770.3, 78051],
        //            [1636460100000, 4770.25, 4778.55, 4757.55, 4777.25, 80164],
        //            [1636461000000, 4777.25, 4791.45, 4774.5, 4791.3, 51555]
        //        ]
        //    }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOHLCVs(data, market, timeframe, since, limit);
    }
    /**
     * @method
     * @name kucoin#createDepositAddress
     * @see https://www.kucoin.com/docs-new/rest/account-info/deposit/add-deposit-address-v3
     * @description create a currency deposit address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the blockchain network name
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    async createDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode !== undefined) {
            request['chain'] = this.networkCodeToId(networkCode); // docs mention "chain-name", but seems "chain-id" is used, like in "fetchDepositAddress"
        }
        const response = await this.privatePostDepositAddressCreate(this.extend(request, params));
        // {"code":"260000","msg":"Deposit address already exists."}
        //
        //   {
        //     "code": "200000",
        //     "data": {
        //       "address": "0x2336d1834faab10b2dac44e468f2627138417431",
        //       "memo": null,
        //       "chainId": "bsc",
        //       "to": "MAIN",
        //       "expirationDate": 0,
        //       "currency": "BNB",
        //       "chainName": "BEP20"
        //     }
        //   }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseDepositAddress(data, currency);
    }
    /**
     * @method
     * @name kucoin#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.kucoin.com/docs-new/rest/account-info/deposit/get-deposit-address-v3/en
     * @see https://www.kucoin.com/docs-new/rest/ua/get-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the blockchain network name
     * @param {string} [params.accountType] 'main', 'contract' or 'uta' (default is 'main')
     * @param {boolean} [params.uta] set to true for the unified trading account (uta) endpoint, defaults to false
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        let accountType = 'main';
        [accountType, params] = this.handleOptionAndParams(params, 'fetchDepositAddress', 'accountType', accountType);
        const accountsByType = this.safeDict(this.options, 'accountsByType', {});
        accountType = this.safeString(accountsByType, accountType, accountType);
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'fetchDepositAddress', 'uta', uta);
        if (accountType === 'contract') {
            return await this.fetchContractDepositAddress(code, params);
        }
        else if (uta || (accountType === 'uta') || (accountType === 'unified')) {
            return await super.fetchDepositAddress(code, this.extend(params, { 'uta': true }));
        }
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
            // for USDT - OMNI, ERC20, TRC20, default is ERC20
            // for BTC - Native, Segwit, TRC20, the parameters are bech32, btc, trx, default is Native
            // 'chain': 'ERC20', // optional
        };
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode !== undefined) {
            request['chain'] = this.networkCodeToId(networkCode).toLowerCase();
        }
        const version = this.options['versions']['private']['GET']['deposit-addresses'];
        this.options['versions']['private']['GET']['deposit-addresses'] = 'v1';
        const response = await this.privateGetDepositAddresses(this.extend(request, params));
        // BCH {"code":"200000","data":{"address":"bitcoincash:qza3m4nj9rx7l9r0cdadfqxts6f92shvhvr5ls4q7z","memo":""}}
        // BTC {"code":"200000","data":{"address":"36SjucKqQpQSvsak9A7h6qzFjrVXpRNZhE","memo":""}}
        this.options['versions']['private']['GET']['deposit-addresses'] = version;
        const data = this.safeValue(response, 'data');
        if (data === undefined) {
            throw new errors.ExchangeError(this.id + ' fetchDepositAddress() returned an empty response, you might try to run createDepositAddress() first and try again');
        }
        return this.parseDepositAddress(data, currency);
    }
    /**
     * @method
     * @name kucoin#fetchContractDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.kucoin.com/docs/rest/funding/deposit/get-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    async fetchContractDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const currencyId = currency['id'];
        const request = {
            'currency': currencyId, // Currency,including XBT,USDT
        };
        const response = await this.futuresPrivateGetDepositAddress(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "address": "0x78d3ad1c0aa1bf068e19c94a2d7b16c9c0fcd8b1",//Deposit address
        //            "memo": null//Address tag. If the returned value is null, it means that the requested token has no memo. If you are to transfer funds from another platform to KuCoin Futures and if the token to be //transferred has memo(tag), you need to fill in the memo to ensure the transferred funds will be sent //to the address you specified.
        //        }
        //    }
        //
        const data = this.safeDict(response, 'data', {});
        const address = this.safeString(data, 'address');
        if (currencyId !== 'NIM') {
            // contains spaces
            this.checkAddress(address);
        }
        return {
            'info': response,
            'currency': currencyId,
            'network': this.safeString(data, 'chain'),
            'address': address,
            'tag': this.safeString(data, 'memo'),
        };
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        let address = this.safeString(depositAddress, 'address');
        // BCH/BSV is returned with a "bitcoincash:" prefix, which we cut off here and only keep the address
        if (address !== undefined) {
            address = address.replace('bitcoincash:', '');
        }
        let code = undefined;
        if (currency !== undefined) {
            code = this.safeCurrencyCode(currency['id']);
            if (code !== 'NIM') {
                // contains spaces
                this.checkAddress(address);
            }
        }
        return {
            'info': depositAddress,
            'currency': code,
            'network': this.networkIdToCode(this.safeString(depositAddress, 'chainId')),
            'address': address,
            'tag': this.safeString(depositAddress, 'memo'),
        };
    }
    /**
     * @method
     * @name kucoin#fetchDepositAddressesByNetwork
     * @see https://www.kucoin.com/docs-new/rest/account-info/deposit/get-deposit-address-v3/en
     * @see https://www.kucoin.com/docs-new/rest/ua/get-deposit-address
     * @description fetch the deposit address for a currency associated with this account
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta) endpoint, defaults to false
     * @returns {object} an array of [address structures]{@link https://docs.ccxt.com/?id=address-structure}
     */
    async fetchDepositAddressesByNetwork(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'fetchDepositAddressesByNetwork', 'uta', uta);
        let response = undefined;
        if (uta) {
            let networkCode = undefined;
            [networkCode, params] = this.handleNetworkCodeAndParams(params);
            if (networkCode !== undefined) {
                request['chain'] = this.networkCodeToId(networkCode).toLowerCase();
            }
            //
            //     {
            //         "code": "200000",
            //         "data": [
            //             {
            //                 "address": "0xf30a9b6968183668dbce515bd6449438ab3252b3",
            //                 "memo": "",
            //                 "remark": "",
            //                 "chainId": "eth",
            //                 "to": "FUNDING",
            //                 "expirationDate": 0,
            //                 "currency": "USDT",
            //                 "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            //                 "chainName": "ERC20"
            //             }
            //         ]
            //     }
            //
            response = await this.utaPrivateGetAssetDepositAddress(this.extend(request, params));
        }
        else {
            const version = this.options['versions']['private']['GET']['deposit-addresses'];
            this.options['versions']['private']['GET']['deposit-addresses'] = 'v2';
            response = await this.privateGetDepositAddresses(this.extend(request, params));
            //
            //     {
            //         "code": "200000",
            //         "data": [
            //             {
            //                 "address": "fr1qvus7d4d5fgxj5e7zvqe6yhxd7txm95h2and69r",
            //                 "memo": "",
            //                 "chain": "BTC-Segwit",
            //                 "contractAddress": ""
            //             },
            //             {"address":"37icNMEWbiF8ZkwUMxmfzMxi2A1MQ44bMn","memo":"","chain":"BTC","contractAddress":""},
            //             {"address":"Deposit temporarily blocked","memo":"","chain":"TRC20","contractAddress":""}
            //         ]
            //     }
            //
            this.options['versions']['private']['GET']['deposit-addresses'] = version;
        }
        const chains = this.safeList(response, 'data', []);
        const parsed = this.parseDepositAddresses(chains, [currency['code']], false, {
            'currency': currency['code'],
        });
        return this.indexBy(parsed, 'network');
    }
    /**
     * @method
     * @name kucoin#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-part-orderbook
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-full-orderbook
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-part-orderbook
     * @see https://www.kucoin.com/docs-new/rest/ua/get-orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const level = this.safeInteger(params, 'level', 2);
        const request = { 'symbol': market['id'] };
        const isAuthenticated = this.checkRequiredCredentials(false);
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'fetchOrderBook', 'uta', uta);
        let response = undefined;
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchOrderBook', market, params);
        if (uta) {
            if (limit === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchOrderBook() requires a limit argument for uta, either 20, 50, 100 or FULL');
            }
            request['limit'] = limit;
            request['symbol'] = market['id'];
            if ((type === 'spot') || (type === 'margin')) {
                request['tradeType'] = 'SPOT';
            }
            else {
                request['tradeType'] = 'FUTURES';
            }
            response = await this.utaPrivateGetMarketOrderbook(this.extend(request, params));
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "tradeType": "SPOT",
            //             "symbol": "BTC-USDT",
            //             "sequence": "23136002402",
            //             "bids": [
            //                 ["104700","10.25940068"],
            //                 ["104698.9","0.00057076"],
            //             ],
            //             "asks": [
            //                 ["104700.1","1.4082106"],
            //                 ["104700.5","0.02866269"],
            //             ]
            //         }
            //     }
            //
        }
        else if ((type !== 'spot') && (type !== 'margin')) {
            if (level !== 2 && level !== undefined) {
                throw new errors.BadRequest(this.id + ' fetchOrderBook() can only return level 2');
            }
            if ((limit === undefined) || limit === 20) {
                //
                //     {
                //         "code": "200000",
                //         "data": {
                //           "symbol": "XBTUSDM",      //Symbol
                //           "sequence": 100,          //Ticker sequence number
                //           "asks": [
                //                 ["5000.0", 1000],   //Price, quantity
                //                 ["6000.0", 1983]    //Price, quantity
                //           ],
                //           "bids": [
                //                 ["3200.0", 800],    //Price, quantity
                //                 ["3100.0", 100]     //Price, quantity
                //           ],
                //           "ts": 1604643655040584408  // timestamp
                //         }
                //     }
                //
                response = await this.futuresPublicGetLevel2Depth20(this.extend(request, params));
            }
            else if (limit === 100) {
                response = await this.futuresPublicGetLevel2Depth100(this.extend(request, params));
            }
            else {
                throw new errors.BadRequest(this.id + ' fetchOrderBook() limit argument must be 20 or 100');
            }
        }
        else if (!isAuthenticated || limit !== undefined) {
            if (level === 2) {
                request['level'] = level;
                if (limit !== undefined) {
                    if ((limit === 20) || (limit === 100)) {
                        request['limit'] = limit;
                    }
                    else {
                        throw new errors.ExchangeError(this.id + ' fetchOrderBook() limit argument must be 20 or 100');
                    }
                }
                request['limit'] = limit ? limit : 100;
            }
            response = await this.publicGetMarketOrderbookLevelLevelLimit(this.extend(request, params));
        }
        else {
            response = await this.privateGetMarketOrderbookLevel2(this.extend(request, params));
        }
        //
        // public (v1) market/orderbook/level2_20 and market/orderbook/level2_100
        //
        //     {
        //         "sequence": "3262786978",
        //         "time": 1550653727731,
        //         "bids": [
        //             ["6500.12", "0.45054140"],
        //             ["6500.11", "0.45054140"],
        //         ],
        //         "asks": [
        //             ["6500.16", "0.57753524"],
        //             ["6500.15", "0.57753524"],
        //         ]
        //     }
        //
        // private (v3) market/orderbook/level2
        //
        //     {
        //         "sequence": "3262786978",
        //         "time": 1550653727731,
        //         "bids": [
        //             ["6500.12", "0.45054140"],
        //             ["6500.11", "0.45054140"],
        //         ],
        //         "asks": [
        //             ["6500.16", "0.57753524"],
        //             ["6500.15", "0.57753524"],
        //         ]
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        let timestamp = this.safeInteger(data, 'time');
        if (timestamp === undefined) {
            const nanoseconds = this.safeInteger(data, 'ts');
            if (nanoseconds !== undefined) {
                timestamp = this.parseToInt(nanoseconds / 1000000);
            }
        }
        const orderbook = this.parseOrderBook(data, market['symbol'], timestamp, 'bids', 'asks', level - 2, level - 1);
        orderbook['nonce'] = this.safeInteger(data, 'sequence');
        return orderbook;
    }
    handleTriggerPrices(params) {
        const triggerPrice = this.safeValue2(params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeValue(params, 'stopLossPrice');
        const takeProfitPrice = this.safeValue(params, 'takeProfitPrice');
        const isStopLoss = stopLossPrice !== undefined;
        const isTakeProfit = takeProfitPrice !== undefined;
        if ((isStopLoss && isTakeProfit) || (triggerPrice && stopLossPrice) || (triggerPrice && isTakeProfit)) {
            throw new errors.ExchangeError(this.id + ' createOrder() - you should use either triggerPrice or stopLossPrice or takeProfitPrice');
        }
        return [triggerPrice, stopLossPrice, takeProfitPrice];
    }
    /**
     * @method
     * @name kucoin#createOrder
     * @description Create an order on the exchange
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-sync
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-test
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-stop-order
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order-test
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-stop-order
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order-test
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-take-profit-and-stop-loss-order
     * @see https://www.kucoin.com/docs-new/rest/ua/place-order
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta) endpoint, defaults to false
     * Check createSpotOrder(), createContractOrder() and createUtaOrder () for more details on the extra parameters that can be used in params
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'createOrder', 'uta', uta);
        if (uta) {
            return await this.createUtaOrder(symbol, type, side, amount, price, params);
        }
        else if (market['spot']) {
            return await this.createSpotOrder(symbol, type, side, amount, price, params);
        }
        else if (market['contract']) {
            return await this.createContractOrder(symbol, type, side, amount, price, params);
        }
        else {
            throw new errors.NotSupported(this.id + ' createOrder() does not support market ' + market['type']);
        }
    }
    /**
     * @method
     * @name kucoin#createSpotOrder
     * @description helper method for creating spot orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-sync
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-test
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-stop-order
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order-test
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-stop-order
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {string} [params.marginMode] 'cross', // cross (cross mode) and isolated (isolated mode), set to cross by default, the isolated mode will be released soon, stay tuned
     * @param {string} [params.timeInForce] GTC, GTT, IOC, or FOK, default is GTC, limit orders only
     * @param {bool} [params.postOnly] Post only flag, invalid when timeInForce is IOC or FOK
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.clientOid] client order id, defaults to uuid if not passed
     * @param {string} [params.remark] remark for the order, length cannot exceed 100 utf8 characters
     * @param {string} [params.tradeType] 'TRADE', // TRADE, MARGIN_TRADE // not used with margin orders
     * limit orders ---------------------------------------------------
     * @param {float} [params.cancelAfter] long, // cancel after n seconds, requires timeInForce to be GTT
     * @param {bool} [params.hidden] false, // Order will not be displayed in the order book
     * @param {bool} [params.iceberg] false, // Only a portion of the order is displayed in the order book
     * @param {string} [params.visibleSize] this.amountToPrecision (symbol, visibleSize), // The maximum visible size of an iceberg order
     * market orders --------------------------------------------------
     * @param {string} [params.funds] // Amount of quote currency to use
     * stop orders ----------------------------------------------------
     * @param {string} [params.stop]  Either loss or entry, the default is loss. Requires triggerPrice to be defined
     * margin orders --------------------------------------------------
     * @param {float} [params.leverage] Leverage size of the order
     * @param {string} [params.stp] '', // self trade prevention, CN, CO, CB or DC
     * @param {bool} [params.autoBorrow] false, // The system will first borrow you funds at the optimal interest rate and then place an order for you
     * @param {bool} [params.hf] false, // true for hf order
     * @param {bool} [params.test] set to true to test an order, no order will be created but the request will be validated
     * @param {bool} [params.sync] set to true to use the hf sync call
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createSpotOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const testOrder = this.safeBool(params, 'test', false);
        params = this.omit(params, 'test');
        let hf = undefined;
        [hf, params] = this.handleHfAndParams(params);
        let useSync = false;
        [useSync, params] = this.handleOptionAndParams(params, 'createOrder', 'sync', false);
        const [triggerPrice, stopLossPrice, takeProfitPrice] = this.handleTriggerPrices(params);
        const tradeType = this.safeString(params, 'tradeType'); // keep it for backward compatibility
        const isTriggerOrder = (triggerPrice || stopLossPrice || takeProfitPrice);
        const marginResult = this.handleMarginModeAndParams('createOrder', params);
        const marginMode = this.safeString(marginResult, 0);
        const isMarginOrder = tradeType === 'MARGIN_TRADE' || marginMode !== undefined;
        // don't omit anything before calling createOrderRequest
        const orderRequest = this.createSpotOrderRequest(symbol, type, side, amount, price, params);
        let response = undefined;
        if (testOrder) {
            if (isMarginOrder) {
                if (hf) {
                    response = await this.privatePostHfMarginOrderTest(orderRequest);
                }
                else {
                    response = await this.privatePostMarginOrderTest(orderRequest);
                }
            }
            else if (hf) {
                response = await this.privatePostHfOrdersTest(orderRequest);
            }
            else {
                response = await this.privatePostOrdersTest(orderRequest);
            }
        }
        else if (isTriggerOrder) {
            if (isMarginOrder) {
                response = await this.privatePostHfMarginStopOrder(orderRequest);
            }
            else {
                response = await this.privatePostStopOrder(orderRequest);
            }
        }
        else if (isMarginOrder) {
            if (hf) {
                response = await this.privatePostHfMarginOrder(orderRequest);
            }
            else {
                response = await this.privatePostMarginOrder(orderRequest);
            }
        }
        else if (useSync) {
            response = await this.privatePostHfOrdersSync(orderRequest);
        }
        else if (hf) {
            response = await this.privatePostHfOrders(orderRequest);
        }
        else {
            response = await this.privatePostOrders(orderRequest);
        }
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "orderId": "5bd6e9286d99522a52e458de"
        //         }
        //    }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    createSpotOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        const market = this.market(symbol);
        // required param, cannot be used twice
        const clientOrderId = this.safeString2(params, 'clientOid', 'clientOrderId', this.uuid());
        params = this.omit(params, ['clientOid', 'clientOrderId']);
        const request = {
            'clientOid': clientOrderId,
            'side': side,
            'symbol': market['id'],
            'type': type, // limit or market
        };
        const quoteAmount = this.safeNumber2(params, 'cost', 'funds');
        let amountString = undefined;
        let costString = undefined;
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('createOrder', params);
        if (type === 'market') {
            if (quoteAmount !== undefined) {
                params = this.omit(params, ['cost', 'funds']);
                // kucoin uses base precision even for quote values
                costString = this.marketOrderAmountToPrecision(symbol, quoteAmount);
                request['funds'] = costString;
            }
            else {
                amountString = this.amountToPrecision(symbol, amount);
                request['size'] = this.amountToPrecision(symbol, amount);
            }
        }
        else {
            amountString = this.amountToPrecision(symbol, amount);
            request['size'] = amountString;
            request['price'] = this.priceToPrecision(symbol, price);
        }
        const tradeType = this.safeString(params, 'tradeType'); // keep it for backward compatibility
        const [triggerPrice, stopLossPrice, takeProfitPrice] = this.handleTriggerPrices(params);
        const isTriggerOrder = (triggerPrice || stopLossPrice || takeProfitPrice);
        const isMarginOrder = tradeType === 'MARGIN_TRADE' || marginMode !== undefined;
        params = this.omit(params, ['stopLossPrice', 'takeProfitPrice', 'triggerPrice', 'stopPrice']);
        if (isTriggerOrder) {
            if (triggerPrice) {
                request['stopPrice'] = this.priceToPrecision(symbol, triggerPrice);
            }
            else if (stopLossPrice || takeProfitPrice) {
                if (stopLossPrice) {
                    request['stop'] = (side === 'buy') ? 'entry' : 'loss';
                    request['stopPrice'] = this.priceToPrecision(symbol, stopLossPrice);
                }
                else {
                    request['stop'] = (side === 'buy') ? 'loss' : 'entry';
                    request['stopPrice'] = this.priceToPrecision(symbol, takeProfitPrice);
                }
            }
            if (marginMode === 'isolated') {
                throw new errors.BadRequest(this.id + ' createOrder does not support isolated margin for stop orders');
            }
            else if (marginMode === 'cross') {
                request['tradeType'] = this.options['marginModes'][marginMode];
            }
        }
        else if (isMarginOrder) {
            if (marginMode === 'isolated') {
                request['marginModel'] = 'isolated';
            }
        }
        let postOnly = undefined;
        [postOnly, params] = this.handlePostOnly(type === 'market', false, params);
        if (postOnly) {
            request['postOnly'] = true;
        }
        return this.extend(request, params);
    }
    marketOrderAmountToPrecision(symbol, amount) {
        const market = this.market(symbol);
        const result = this.decimalToPrecision(amount, number.TRUNCATE, market['info']['quoteIncrement'], this.precisionMode, this.paddingMode);
        if (result === '0') {
            throw new errors.InvalidOrder(this.id + ' amount of ' + market['symbol'] + ' must be greater than minimum amount precision of ' + this.numberToString(market['precision']['amount']));
        }
        return result;
    }
    /**
     * @method
     * @name kucoin#createContractOrder
     * @description helper method for creating contract orders
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order-test
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-take-profit-and-stop-loss-order
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered and the triggerPriceType
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered and the triggerPriceType
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
     * @param {float} [params.takeProfitPrice] price to trigger take-profit orders
     * @param {bool} [params.reduceOnly] A mark to reduce the position size only. Set to false by default. Need to set the position size when reduceOnly is true.
     * @param {string} [params.timeInForce] GTC, GTT, IOC, or FOK, default is GTC, limit orders only
     * @param {bool} [params.postOnly] Post only flag, invalid when timeInForce is IOC or FOK
     * @param {float} [params.cost] the cost of the order in units of USDT
     * @param {string} [params.marginMode] 'cross' or 'isolated', default is 'isolated'
     * @param {bool} [params.hedged] *swap and future only* true for hedged mode, false for one way mode, default is false
     * ----------------- Exchange Specific Parameters -----------------
     * @param {float} [params.leverage] Leverage size of the order (mandatory param in request, default is 1)
     * @param {string} [params.clientOid] client order id, defaults to uuid if not passed
     * @param {string} [params.remark] remark for the order, length cannot exceed 100 utf8 characters
     * @param {string} [params.stop] 'up' or 'down', the direction the triggerPrice is triggered from, requires triggerPrice. down: Triggers when the price reaches or goes below the triggerPrice. up: Triggers when the price reaches or goes above the triggerPrice.
     * @param {string} [params.triggerPriceType] "last", "mark", "index" - defaults to "mark"
     * @param {string} [params.stopPriceType] exchange-specific alternative for triggerPriceType: TP, IP or MP
     * @param {bool} [params.closeOrder] set to true to close position
     * @param {bool} [params.test] set to true to use the test order endpoint (does not submit order, use to validate params)
     * @param {bool} [params.forceHold] A mark to forcely hold the funds for an order, even though it's an order to reduce the position size. This helps the order stay on the order book and not get canceled when the position size changes. Set to false by default.\
     * @param {string} [params.positionSide] *swap and future only* hedged two-way position side, LONG or SHORT
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createContractOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const testOrder = this.safeBool(params, 'test', false);
        params = this.omit(params, 'test');
        const hasTpOrSlOrder = (this.safeValue(params, 'stopLoss') !== undefined) || (this.safeValue(params, 'takeProfit') !== undefined);
        const orderRequest = this.createContractOrderRequest(symbol, type, side, amount, price, params);
        let response = undefined;
        if (testOrder) {
            response = await this.futuresPrivatePostOrdersTest(orderRequest);
        }
        else {
            if (hasTpOrSlOrder) {
                response = await this.futuresPrivatePostStOrders(orderRequest);
            }
            else {
                response = await this.futuresPrivatePostOrders(orderRequest);
            }
        }
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "orderId": "619717484f1d010001510cde",
        //        },
        //    }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    createContractOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        const market = this.market(symbol);
        // required param, cannot be used twice
        const clientOrderId = this.safeString2(params, 'clientOid', 'clientOrderId', this.uuid());
        params = this.omit(params, ['clientOid', 'clientOrderId']);
        const request = {
            'clientOid': clientOrderId,
            'side': side,
            'symbol': market['id'],
            'type': type,
            'leverage': 1,
        };
        const marginModeUpper = this.safeStringUpper(params, 'marginMode');
        if (marginModeUpper !== undefined) {
            params = this.omit(params, 'marginMode');
            request['marginMode'] = marginModeUpper;
        }
        const cost = this.safeString(params, 'cost');
        params = this.omit(params, 'cost');
        if (cost !== undefined) {
            request['valueQty'] = this.costToPrecision(symbol, cost);
        }
        else {
            if (amount < 1) {
                throw new errors.InvalidOrder(this.id + ' createOrder() minimum contract order amount is 1');
            }
            request['size'] = parseInt(this.amountToPrecision(symbol, amount));
        }
        const [triggerPrice, stopLossPrice, takeProfitPrice] = this.handleTriggerPrices(params);
        const stopLoss = this.safeDict(params, 'stopLoss');
        const takeProfit = this.safeDict(params, 'takeProfit');
        const hasStopLoss = stopLoss !== undefined;
        const hasTakeProfit = takeProfit !== undefined;
        // const isTpAndSl = stopLossPrice && takeProfitPrice;
        const triggerPriceTypes = {
            'mark': 'MP',
            'last': 'TP',
            'index': 'IP',
        };
        const triggerPriceType = this.safeString(params, 'triggerPriceType', 'mark');
        const triggerPriceTypeValue = this.safeString(triggerPriceTypes, triggerPriceType, triggerPriceType);
        params = this.omit(params, ['stopLossPrice', 'takeProfitPrice', 'triggerPrice', 'stopPrice', 'takeProfit', 'stopLoss']);
        if (triggerPrice) {
            request['stop'] = (side === 'buy') ? 'up' : 'down';
            request['stopPrice'] = this.priceToPrecision(symbol, triggerPrice);
            request['stopPriceType'] = triggerPriceTypeValue;
        }
        else if (hasStopLoss || hasTakeProfit) {
            let priceType = triggerPriceTypeValue;
            if (hasStopLoss) {
                const slPrice = this.safeString2(stopLoss, 'triggerPrice', 'stopPrice');
                request['triggerStopDownPrice'] = this.priceToPrecision(symbol, slPrice);
                priceType = this.safeString(stopLoss, 'triggerPriceType', 'mark');
                priceType = this.safeString(triggerPriceTypes, priceType, priceType);
            }
            if (hasTakeProfit) {
                const tpPrice = this.safeString2(takeProfit, 'triggerPrice', 'takeProfitPrice');
                request['triggerStopUpPrice'] = this.priceToPrecision(symbol, tpPrice);
                priceType = this.safeString(takeProfit, 'triggerPriceType', 'mark');
                priceType = this.safeString(triggerPriceTypes, priceType, priceType);
            }
            request['stopPriceType'] = priceType;
        }
        else if (stopLossPrice || takeProfitPrice) {
            if (stopLossPrice) {
                request['stop'] = (side === 'buy') ? 'up' : 'down';
                request['stopPrice'] = this.priceToPrecision(symbol, stopLossPrice);
            }
            else {
                request['stop'] = (side === 'buy') ? 'down' : 'up';
                request['stopPrice'] = this.priceToPrecision(symbol, takeProfitPrice);
            }
            request['reduceOnly'] = true;
            request['stopPriceType'] = triggerPriceTypeValue;
        }
        const uppercaseType = type.toUpperCase();
        const timeInForce = this.safeStringUpper(params, 'timeInForce');
        if (uppercaseType === 'LIMIT') {
            if (price === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a price argument for limit orders');
            }
            else {
                request['price'] = this.priceToPrecision(symbol, price);
            }
            if (timeInForce !== undefined) {
                request['timeInForce'] = timeInForce;
            }
        }
        let postOnly = undefined;
        [postOnly, params] = this.handlePostOnly(type === 'market', false, params);
        if (postOnly) {
            request['postOnly'] = true;
        }
        const hidden = this.safeValue(params, 'hidden');
        if (postOnly && (hidden !== undefined)) {
            throw new errors.BadRequest(this.id + ' createOrder() does not support the postOnly parameter together with a hidden parameter');
        }
        const iceberg = this.safeValue(params, 'iceberg');
        if (iceberg) {
            const visibleSize = this.safeValue(params, 'visibleSize');
            if (visibleSize === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a visibleSize parameter for iceberg orders');
            }
        }
        const reduceOnly = this.safeBool(params, 'reduceOnly', false);
        let hedged = undefined;
        [hedged, params] = this.handleParamBool(params, 'hedged', false);
        if (reduceOnly) {
            request['reduceOnly'] = reduceOnly;
            if (hedged) {
                const reduceOnlyPosSide = (side === 'sell') ? 'LONG' : 'SHORT';
                request['positionSide'] = reduceOnlyPosSide;
            }
        }
        else {
            if (hedged) {
                const posSide = (side === 'buy') ? 'LONG' : 'SHORT';
                request['positionSide'] = posSide;
            }
        }
        params = this.omit(params, ['timeInForce', 'stopPrice', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'reduceOnly', 'hedged']); // Time in force only valid for limit orders, exchange error when gtc for market orders
        return this.extend(request, params);
    }
    /**
     * @method
     * @name kucoin#createUtaOrder
     * @description helper method for creating uta orders
     * @see https://www.kucoin.com/docs-new/rest/ua/place-order
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, defaults to uuid if not passed
     * @param {float} [params.cost] the cost of the order in units of quote currency
     * @param {string} [params.timeInForce] GTC, GTD, IOC, FOK or PO
     * @param {bool} [params.postOnly] Post only flag, invalid when timeInForce is IOC or FOK (default is false)
     * @param {bool} [params.reduceOnly] *contract markets only* A mark to reduce the position size only. Set to false by default
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {string} [params.triggerDirection] 'ascending' or 'descending', the direction the triggerPrice is triggered from, requires triggerPrice
     * @param {string} [params.triggerPriceType] *contract markets only* "last", "mark", "index" - defaults to "mark"
     * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
     * @param {float} [params.takeProfitPrice] price to trigger take-profit orders
     * @param {string} [params.marginMode] 'cross' or 'isolated', (default is 'cross' for margin orders, default is 'isolated' for contract orders)
     *
     * Exchange-specific parameters -------------------------------------------------
     * @param {string} [params.accountMode] 'unified' or 'classic', default is 'unified'
     * @param {string} [params.stp] '', // self trade prevention, CN, CO, CB or DC
     * @param {int} [params.cancelAfter] - Cancel After N Seconds (Calculated from the time of entering the matching engine), only effective when timeInForce is GTD
     * @param {string} [params.sizeUnit] *contracts only* 'BASECCY' (amount of base currency) or 'UNIT' (number of contracts), default is 'UNIT'
     *
     * Classic account parameters
     * @param {bool} [params.autoBorrow] *classic margin orders only*
     * @param {bool} [params.autoRepay] *classic margin orders only*
     * @param {string} [params.hedged] *classic contract orders only* true for hedged mode, false for one way mode, default is false
     * @param {int} [params.leverage] *classic contract orders with isolated marginMode only* Leverage size of the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createUtaOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const request = this.createUtaOrderRequest(symbol, type, side, amount, price, params);
        const response = await this.utaPrivatePostAccountModeOrderPlace(request);
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "orderId": "426319129738321920",
        //             "tradeType": "SPOT",
        //             "ts": 1774455603216000000,
        //             "clientOid": "b896c118-a674-4863-baf4-a9ea3cd696c5"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data);
    }
    createUtaOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        const market = this.market(symbol);
        const isSpot = market['spot'];
        const isContract = market['contract'];
        let accountMode = 'unified';
        [accountMode, params] = this.handleOptionAndParams(params, 'createOrder', 'accountMode', accountMode);
        const isUnified = (accountMode === 'unified');
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('createOrder', params);
        const marginModeDefined = (marginMode !== undefined);
        const isSpotMargin = (isSpot && marginModeDefined);
        if (isSpotMargin && isUnified) {
            throw new errors.NotSupported(this.id + ' createOrder() does not support spot margin orders with unified accountMode');
        }
        const tradeType = this.handleTradeType(isContract, marginMode, params);
        const clientOrderId = this.safeString2(params, 'clientOid', 'clientOrderId', this.uuid());
        params = this.omit(params, ['clientOid', 'clientOrderId']);
        const request = {
            'accountMode': accountMode,
            'tradeType': tradeType,
            'clientOid': clientOrderId,
            'symbol': market['id'],
            // 'triggerDirection'- 'UP' or 'DOWN (required for trigger orders, supported for classic-FUTURES and unified-SPOT and unified-FUTURES)
            // 'triggerPriceType' - 'TP', 'IP', 'MP' (required for trigger orders, supported for classic-FUTURES and unified-SPOT and unified-FUTURES)
            // 'triggerPrice' (required for trigger orders)
            'side': side.toUpperCase(),
            'orderType': type.toUpperCase(),
            // 'size'
            // 'sizeUnit' - 'BASECCY', 'QUOTECCY' (for market SPOT) or 'UNIT' (for unified-FUTURES)
            // 'price'
            // 'timeInForce' - 'GTC', 'IOC', 'FOK', 'GTT' or 'RPI' (GTT is not supported for FUTURES)
            // 'postOnly'
            // 'reduceOnly' (only for FUTURES)
            // 'stp' - 'CN', 'CO', 'CB' or 'DC' (DC is not supported for FUTURES)
            // 'cancelAfter' - time in seconds (only valid when timeInForce is GTT, not supported for FUTURES)
            // 'tags'
            // 'autoBorrow' (only for classic-CROSS and classic-ISOLATED)
            // 'autoRepay' (only for classic-CROSS and classic-ISOLATED)
            // 'positionSide' - 'BOTH', 'LONG' or 'SHORT' (only for classic-FUTURES)
            // 'marginMode' - 'ISOLATED' or 'CROSS' (only for classic-FUTURES, default is 'ISOLATED')
            // 'leverage' (only for classic-FUTURES-ISOLATED, required)
            // 'tpTriggerPriceType' - 'TP', 'IP', 'MP' (only for unified-FUTURES and classic-FUTURES)
            // 'tpTriggerPrice' (only for unified-FUTURES and classic-FUTURES)
            // 'slTriggerPriceType' - 'TP', 'IP', 'MP' (only for unified-FUTURES and classic-FUTURES)
            // 'slTriggerPrice' (only for unified-FUTURES and classic-FUTURES)
        };
        if (tradeType !== undefined) {
            request['tradeType'] = tradeType;
        }
        request['clientOid'] = clientOrderId;
        const isMarketOrder = (type === 'market');
        const cost = this.safeString(params, 'cost');
        if (cost !== undefined) {
            params = this.omit(params, 'cost');
            if (isSpot && isMarketOrder) {
                request['sizeUnit'] = 'QUOTECCY';
                request['size'] = this.marketOrderAmountToPrecision(symbol, cost);
            }
            else {
                throw new errors.NotSupported(this.id + ' createOrder() with cost is supported for spot market orders only');
            }
        }
        else {
            let sizeUnit = 'BASECCY';
            if (isContract) {
                [sizeUnit, params] = this.handleOptionAndParams(params, 'createOrder', 'sizeUnit', 'UNIT');
            }
            request['sizeUnit'] = sizeUnit;
            request['size'] = this.amountToPrecision(symbol, amount);
        }
        if (!isMarketOrder) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        let postOnly = undefined;
        [postOnly, params] = this.handlePostOnly(isMarketOrder, false, params);
        const timeInForce = this.handleTimeInForce(params);
        if ((timeInForce !== undefined)) {
            params = this.omit(params, 'timeInForce');
            request['timeInForce'] = timeInForce;
        }
        if (postOnly) {
            request['postOnly'] = true;
        }
        if (isContract) {
            if (!isUnified) {
                if (marginModeDefined) {
                    request['marginMode'] = marginMode.toUpperCase();
                    if (marginMode === 'isolated') {
                        const leverage = this.safeInteger(params, 'leverage');
                        if (leverage === undefined) {
                            request['leverage'] = 1;
                        }
                    }
                }
                const reduceOnly = this.safeBool(params, 'reduceOnly', false);
                let hedged = false;
                [hedged, params] = this.handleParamBool(params, 'hedged', hedged);
                if (hedged) {
                    let positionSide = (side === 'buy') ? 'LONG' : 'SHORT';
                    if (reduceOnly) {
                        positionSide = (positionSide === 'LONG') ? 'SHORT' : 'LONG';
                    }
                    request['positionSide'] = positionSide;
                }
            }
        }
        // handling with coinditional orders
        const [triggerPrice, stopLossPrice, takeProfitPrice] = this.handleTriggerPrices(params);
        const stopLoss = this.safeDict(params, 'stopLoss');
        const takeProfit = this.safeDict(params, 'takeProfit');
        const hasStopLoss = stopLoss !== undefined;
        const hasTakeProfit = takeProfit !== undefined;
        const triggerPriceTypes = {
            'mark': 'MP',
            'last': 'TP',
            'index': 'IP',
        };
        if (triggerPrice) {
            const triggerDirection = this.safeString(params, 'triggerDirection');
            if (triggerDirection === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a triggerDirection parameter for trigger orders. Provide params.tringgerDirection or use params.stopLossPrice or params.takeProfitPrice instead of params.triggerPrice');
            }
            request['triggerDirection'] = (triggerDirection === 'ascending') ? 'UP' : 'DOWN';
            request['triggerPrice'] = this.priceToPrecision(symbol, triggerPrice);
        }
        else if (hasStopLoss || hasTakeProfit) {
            if (!isContract) {
                throw new errors.NotSupported(this.id + ' createOrder() stopLoss and takeProfit parameters are only supported for contract orders');
            }
            if (hasStopLoss) {
                const slTriggerPrice = this.safeString2(stopLoss, 'triggerPrice', 'stopPrice');
                const slTriggerPriceType = this.safeString(stopLoss, 'triggerPriceType', 'mark');
                request['slTriggerPrice'] = this.priceToPrecision(symbol, slTriggerPrice);
                request['slTriggerPriceType'] = this.safeString(triggerPriceTypes, slTriggerPriceType, slTriggerPriceType);
            }
            if (hasTakeProfit) {
                const tpTriggerPrice = this.safeString2(takeProfit, 'triggerPrice', 'takeProfitPrice');
                const tpTriggerPriceType = this.safeString(takeProfit, 'triggerPriceType', 'mark');
                request['tpTriggerPrice'] = this.priceToPrecision(symbol, tpTriggerPrice);
                request['tpTriggerPriceType'] = this.safeString(triggerPriceTypes, tpTriggerPriceType, tpTriggerPriceType);
            }
        }
        else if (stopLossPrice || takeProfitPrice) {
            if (stopLossPrice) {
                request['triggerDirection'] = (side === 'buy') ? 'UP' : 'DOWN';
                request['triggerPrice'] = this.priceToPrecision(symbol, stopLossPrice);
                if (isContract) {
                    const stopLossPriceType = this.safeString2(params, 'stopLossPriceType', 'triggerPriceType', 'mark');
                    request['triggerPriceType'] = this.safeString(triggerPriceTypes, stopLossPriceType, stopLossPriceType);
                }
            }
            else {
                request['triggerDirection'] = (side === 'buy') ? 'DOWN' : 'UP';
                request['triggerPrice'] = this.priceToPrecision(symbol, takeProfitPrice);
                if (isContract) {
                    const takeProfitPriceType = this.safeString2(params, 'takeProfitPriceType', 'triggerPriceType', 'mark');
                    request['triggerPriceType'] = this.safeString(triggerPriceTypes, takeProfitPriceType, takeProfitPriceType);
                }
            }
        }
        params = this.omit(params, ['triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'stopPriceType', 'stopLossPriceType', 'takeProfitPriceType', 'triggerPriceType', 'triggerDirection', 'stopLoss', 'takeProfit', 'hedged']);
        return this.extend(request, params);
    }
    /**
     * @method
     * @name kucoin#createMarketOrderWithCost
     * @description create a market order by providing the symbol, side and cost
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} side 'buy' or 'sell'
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createMarketOrderWithCost(symbol, side, cost, params = {}) {
        await this.loadMarkets();
        const req = {
            'cost': cost,
        };
        return await this.createOrder(symbol, 'market', side, cost, undefined, this.extend(req, params));
    }
    /**
     * @method
     * @name kucoin#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createMarketBuyOrderWithCost(symbol, cost, params = {}) {
        await this.loadMarkets();
        return await this.createMarketOrderWithCost(symbol, 'buy', cost, params);
    }
    /**
     * @method
     * @name kucoin#createMarketSellOrderWithCost
     * @description create a market sell order by providing the symbol and cost
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createMarketSellOrderWithCost(symbol, cost, params = {}) {
        await this.loadMarkets();
        return await this.createMarketOrderWithCost(symbol, 'sell', cost, params);
    }
    /**
     * @method
     * @name kucoin#createOrders
     * @description create a list of trade orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders-sync
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * Check createSpotOrders() and createContractOrders() for more details on the extra parameters that can be used in params
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrders(orders, params = {}) {
        await this.loadMarkets();
        let isSpot = false;
        let isContract = false;
        for (let i = 0; i < orders.length; i++) {
            const order = this.safeDict(orders, i);
            const symbol = this.safeString(order, 'symbol');
            const market = this.market(symbol);
            if (market['spot']) {
                isSpot = true;
            }
            else if (market['contract']) {
                isContract = true;
            }
        }
        if (isSpot && isContract) {
            throw new errors.BadRequest(this.id + ' createOrders() requires all orders to be either spot or contract');
        }
        else if (isSpot) {
            return await this.createSpotOrders(orders, params);
        }
        else if (isContract) {
            return await this.createContractOrders(orders, params);
        }
        else {
            throw new errors.NotSupported(this.id + ' createOrders() does not support the markets of the orders provided');
        }
    }
    /**
     * @method
     * @name kucoin#createSpotOrders
     * @description helper method for creating spot orders in batch
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders-sync
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/batch-add-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {bool} [params.hf] false, // true for hf orders
     * @param {bool} [params.sync] false, // true to use the hf sync call
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createSpotOrders(orders, params = {}) {
        await this.loadMarkets();
        const ordersRequests = [];
        let symbol = undefined;
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString(rawOrder, 'symbol');
            if (symbol === undefined) {
                symbol = marketId;
            }
            else {
                if (symbol !== marketId) {
                    throw new errors.BadRequest(this.id + ' createOrders() requires all orders to have the same symbol');
                }
            }
            const type = this.safeString(rawOrder, 'type');
            if (type !== 'limit') {
                throw new errors.BadRequest(this.id + ' createOrders() only supports limit orders');
            }
            const side = this.safeString(rawOrder, 'side');
            const amount = this.safeValue(rawOrder, 'amount');
            const price = this.safeValue(rawOrder, 'price');
            const orderParams = this.safeValue(rawOrder, 'params', {});
            const orderRequest = this.createSpotOrderRequest(marketId, type, side, amount, price, orderParams);
            ordersRequests.push(orderRequest);
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'orderList': ordersRequests,
        };
        let hf = undefined;
        [hf, params] = this.handleHfAndParams(params);
        let useSync = false;
        [useSync, params] = this.handleOptionAndParams(params, 'createOrders', 'sync', false);
        let response = undefined;
        if (useSync) {
            response = await this.privatePostHfOrdersMultiSync(this.extend(request, params));
        }
        else if (hf) {
            response = await this.privatePostHfOrdersMulti(this.extend(request, params));
        }
        else {
            response = await this.privatePostOrdersMulti(this.extend(request, params));
        }
        //
        // {
        //     "code": "200000",
        //     "data": {
        //        "data": [
        //           {
        //              "symbol": "LTC-USDT",
        //              "type": "limit",
        //              "side": "sell",
        //              "price": "90",
        //              "size": "0.1",
        //              "funds": null,
        //              "stp": "",
        //              "stop": "",
        //              "stopPrice": null,
        //              "timeInForce": "GTC",
        //              "cancelAfter": 0,
        //              "postOnly": false,
        //              "hidden": false,
        //              "iceberge": false,
        //              "iceberg": false,
        //              "visibleSize": null,
        //              "channel": "API",
        //              "id": "6539148443fcf500079d15e5",
        //              "status": "success",
        //              "failMsg": null,
        //              "clientOid": "5c4c5398-8ab2-4b4e-af8a-e2d90ad2488f"
        //           },
        // }
        //
        let data = this.safeDict(response, 'data', {});
        data = this.safeList(data, 'data', []);
        return this.parseOrders(data);
    }
    /**
     * @method
     * @name kucoin#createContractOrders
     * @description helper method for creating contract orders in batch
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/batch-add-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createContractOrders(orders, params = {}) {
        await this.loadMarkets();
        const ordersRequests = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const symbol = this.safeString(rawOrder, 'symbol');
            const market = this.market(symbol);
            const type = this.safeString(rawOrder, 'type');
            const side = this.safeString(rawOrder, 'side');
            const amount = this.safeValue(rawOrder, 'amount');
            const price = this.safeValue(rawOrder, 'price');
            const orderParams = this.safeValue(rawOrder, 'params', {});
            const orderRequest = this.createContractOrderRequest(market['id'], type, side, amount, price, orderParams);
            ordersRequests.push(orderRequest);
        }
        const response = await this.futuresPrivatePostOrdersMulti(ordersRequests);
        //
        //     {
        //         "code": "200000",
        //         "data": [
        //             {
        //                 "orderId": "135241412609331200",
        //                 "clientOid": "3d8fcc13-0b13-447f-ad30-4b3441e05213",
        //                 "symbol": "LTCUSDTM",
        //                 "code": "200000",
        //                 "msg": "success"
        //             },
        //             {
        //                 "orderId": "135241412747743234",
        //                 "clientOid": "b878c7ee-ae3e-4d63-a20b-038acbb7306f",
        //                 "symbol": "LTCUSDTM",
        //                 "code": "200000",
        //                 "msg": "success"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data);
    }
    /**
     * @method
     * @name kucoin#editOrder
     * @description edit an order, kucoin currently only supports the modification of HF orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/modify-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type not used
     * @param {string} side not used
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, defaults to id if not passed
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2(params, 'clientOid', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOid'] = clientOrderId;
        }
        else {
            request['orderId'] = id;
        }
        if (amount !== undefined) {
            request['newSize'] = this.amountToPrecision(symbol, amount);
        }
        if (price !== undefined) {
            request['newPrice'] = this.priceToPrecision(symbol, price);
        }
        const response = await this.privatePostHfOrdersAlter(this.extend(request, params));
        //
        // {
        //     "code":"200000",
        //     "data":{
        //        "newOrderId":"6478d7a6c883280001e92d8b"
        //     }
        // }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    /**
     * @method
     * @name kucoin#cancelOrder
     * @description cancels an open order
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld-sync
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid-sync
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/ua/cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @param {string} [params.marginMode] *spot only* 'cross' or 'isolated'
     * @param {boolean} [params.uta] true for cancelling order with unified account endpoint (default is false)
     * Check cancelSpotOrder() and cancelContractOrder() for more details on the extra parameters that can be used in params
     * @returns Response from the exchange
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'cancelOrder', 'uta', uta);
        if (uta) {
            return await this.cancelUtaOrder(id, symbol, params);
        }
        let marketType = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        [marketType, params] = this.handleMarketTypeAndParams('cancelOrder', market, params);
        if ((marketType === 'spot') || (marketType === 'margin')) {
            return await this.cancelSpotOrder(id, symbol, params);
        }
        else {
            return await this.cancelContractOrder(id, symbol, params);
        }
    }
    /**
     * @method
     * @name kucoin#cancelSpotOrder
     * @description helper method for cancelling spot orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld-sync
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid-sync
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-clientoid
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] True if cancelling a stop order
     * @param {bool} [params.hf] false, // true for hf order
     * @param {bool} [params.sync] false, // true to use the hf sync call
     * @param {string} [params.marginMode] 'cross' or 'isolated'
     * @returns Response from the exchange
     */
    async cancelSpotOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        const clientOrderId = this.safeString2(params, 'clientOid', 'clientOrderId');
        const trigger = this.safeBool2(params, 'stop', 'trigger', false);
        let hf = undefined;
        [hf, params] = this.handleHfAndParams(params);
        let useSync = false;
        [useSync, params] = this.handleOptionAndParams(params, 'cancelOrder', 'sync', false);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('createOrder', params);
        const tradeType = this.safeString(params, 'tradeType'); // keep it for backward compatibility
        const isMarginOrder = tradeType === 'MARGIN_TRADE' || marginMode !== undefined;
        if (hf || useSync || isMarginOrder) {
            if (!trigger) {
                if (symbol === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol parameter for hf orders');
                }
                const market = this.market(symbol);
                request['symbol'] = market['id'];
            }
        }
        let response = undefined;
        params = this.omit(params, ['clientOid', 'clientOrderId', 'stop', 'trigger', 'tradeType']);
        if (clientOrderId !== undefined) {
            request['clientOid'] = clientOrderId;
            if (trigger) {
                if (isMarginOrder) {
                    response = await this.privateDeleteHfMarginStopOrderCancelByClientOid(this.extend(request, params));
                    const data = this.safeDict(response, 'data');
                    const orderIds = this.safeList(data, 'cancelledOrderIds', []);
                    const orderId = this.safeString(orderIds, 0);
                    return this.safeOrder({
                        'info': data,
                        'id': orderId,
                    });
                }
                else {
                    //
                    //    {
                    //        code: '200000',
                    //        data: {
                    //          cancelledOrderId: 'vs8lgpiuao41iaft003khbbk',
                    //          clientOid: '123456'
                    //        }
                    //    }
                    //
                    response = await this.privateDeleteStopOrderCancelOrderByClientOid(this.extend(request, params));
                }
            }
            else if (isMarginOrder) {
                response = await this.privateDeleteHfMarginOrdersClientOrderClientOid(this.extend(request, params));
            }
            else if (useSync) {
                response = await this.privateDeleteHfOrdersSyncClientOrderClientOid(this.extend(request, params));
            }
            else if (hf) {
                response = await this.privateDeleteHfOrdersClientOrderClientOid(this.extend(request, params));
                //
                //    {
                //        "code": "200000",
                //        "data": {
                //          "clientOid": "6d539dc614db3"
                //        }
                //    }
                //
            }
            else {
                response = await this.privateDeleteOrderClientOrderClientOid(this.extend(request, params));
                //
                //    {
                //        code: '200000',
                //        data: {
                //          cancelledOrderId: '665e580f6660500007aba341',
                //          clientOid: '1234567',
                //          cancelledOcoOrderIds: null
                //        }
                //    }
                //
            }
            response = this.safeDict(response, 'data');
            return this.parseOrder(response);
        }
        else {
            request['orderId'] = id;
            if (trigger) {
                if (isMarginOrder) {
                    response = await this.privateDeleteHfMarginStopOrderCancelById(this.extend(request, params));
                }
                else {
                    //
                    //    {
                    //        code: '200000',
                    //        data: { cancelledOrderIds: [ 'vs8lgpiuaco91qk8003vebu9' ] }
                    //    }
                    //
                    response = await this.privateDeleteStopOrderOrderId(this.extend(request, params));
                }
            }
            else if (isMarginOrder) {
                response = await this.privateDeleteHfMarginOrdersOrderId(this.extend(request, params));
            }
            else if (useSync) {
                response = await this.privateDeleteHfOrdersSyncOrderId(this.extend(request, params));
            }
            else if (hf) {
                response = await this.privateDeleteHfOrdersOrderId(this.extend(request, params));
                //
                //    {
                //        "code": "200000",
                //        "data": {
                //          "orderId": "630625dbd9180300014c8d52"
                //        }
                //    }
                //
                response = this.safeDict(response, 'data');
                return this.parseOrder(response);
            }
            else {
                response = await this.privateDeleteOrdersOrderId(this.extend(request, params));
                //
                //    {
                //        code: '200000',
                //        data: { cancelledOrderIds: [ '665e4fbe28051a0007245c41' ] }
                //    }
                //
            }
            const data = this.safeDict(response, 'data');
            let orderId = this.safeString(data, 'orderId');
            const orderIds = this.safeList(data, 'cancelledOrderIds', []);
            orderId = this.safeString(orderIds, 0, orderId);
            return this.safeOrder({
                'info': data,
                'id': orderId,
            });
        }
    }
    /**
     * @method
     * @name kucoin#cancelContractOrder
     * @description helper method for cancelling contract orders
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-clientoid
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] cancel order by client order id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelContractOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const clientOrderId = this.safeString2(params, 'clientOid', 'clientOrderId');
        params = this.omit(params, ['clientOrderId']);
        const request = {};
        let response = undefined;
        if (clientOrderId !== undefined) {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument when cancelling by clientOrderId');
            }
            const market = this.market(symbol);
            request['symbol'] = market['id'];
            request['clientOid'] = clientOrderId;
            response = await this.futuresPrivateDeleteOrdersClientOrderClientOid(this.extend(request, params));
        }
        else {
            request['orderId'] = id;
            response = await this.futuresPrivateDeleteOrdersOrderId(this.extend(request, params));
        }
        //
        //   {
        //       "code": "200000",
        //       "data": {
        //           "cancelledOrderIds": [
        //                "619714b8b6353000014c505a",
        //           ],
        //       },
        //   }
        //
        return this.safeOrder({ 'info': response });
    }
    /**
     * @method
     * @name kucoin#cancelUtaOrder
     * @description helper method for cancelling uta orders
     * @see https://www.kucoin.com/docs-new/rest/ua/cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountMode] 'unified' or 'classic' (default is 'unified')
     * @param {string} [params.clientOrderId] client order id, required if id is not provided
     * @param {string} [params.marginMode] 'cross' or 'isolated', required if fetching a margin order
     * @returns Response from the exchange
     */
    async cancelUtaOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument for uta endpoint');
        }
        await this.loadMarkets();
        const request = {};
        const clientOrderId = this.safeString2(params, 'clientOid', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOid'] = clientOrderId;
            params = this.omit(params, ['clientOid', 'clientOrderId']);
        }
        else {
            if (id === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires an id argument or clientOrderId parameter');
            }
            request['orderId'] = id;
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        request['symbol'] = market['id'];
        let accountMode = 'unified';
        [accountMode, params] = this.handleOptionAndParams(params, 'fetchOrder', 'accountMode', accountMode);
        request['accountMode'] = accountMode;
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchOrder', params);
        const tradeType = this.handleTradeType(market['contract'], marginMode, params);
        request['tradeType'] = tradeType;
        const response = await this.utaPrivatePostAccountModeOrderCancel(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "orderId": "426319129738321920",
        //             "tradeType": "SPOT",
        //             "ts": 1774457628105000000,
        //             "clientOid": "b896c118-a674-4863-baf4-a9ea3cd696c5"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    /**
     * @method
     * @name kucoin#cancelAllOrders
     * @description cancel all open orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders-by-symbol
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-cancel-stop-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-all-orders-by-symbol
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/batch-cancel-stop-orders
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-orders
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-stop-orders
     * @see https://www.kucoin.com/docs-new/rest/ua/batch-cancel-order-by-symbol
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @param {string} [params.marginMode] *spot only* 'cross' or 'isolated'
     * @param {boolean} [params.uta] true for cancelling orders with unified account endpoint (default is false)
     * Check cancelAllSpotOrders(), cancelAllContractOrders() and cancelAllUtaOrders() for more details on the extra parameters that can be used in params
     * @returns Response from the exchange
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'cancelAllOrders', 'uta', uta);
        if (uta) {
            return await this.cancelAllUtaOrders(symbol, params);
        }
        let marketType = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        [marketType, params] = this.handleMarketTypeAndParams('cancelOrder', market, params);
        if ((marketType === 'spot') || (marketType === 'margin')) {
            return await this.cancelAllSpotOrders(symbol, params);
        }
        else {
            return await this.cancelAllContractOrders(symbol, params);
        }
    }
    /**
     * @method
     * @name kucoin#cancelAllSpotOrders
     * @description helper method for cancelling all spot orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders-by-symbol
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-cancel-stop-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-all-orders-by-symbol
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/batch-cancel-stop-orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] *invalid for isolated margin* true if cancelling all stop orders
     * @param {string} [params.marginMode] 'cross' or 'isolated'
     * @param {string} [params.orderIds] *stop orders only* Comma separated order IDs
     * @param {bool} [params.hf] false, // true for hf order
     * @returns Response from the exchange
     */
    async cancelAllSpotOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        const trigger = this.safeBool2(params, 'trigger', 'stop', false);
        let hf = undefined;
        [hf, params] = this.handleHfAndParams(params);
        params = this.omit(params, ['stop', 'trigger']);
        const [marginMode, query] = this.handleMarginModeAndParams('cancelAllOrders', params);
        const isMarginOrders = marginMode !== undefined;
        if (symbol !== undefined) {
            request['symbol'] = this.marketId(symbol);
        }
        else if (!trigger && isMarginOrders) {
            throw new errors.ArgumentsRequired(this.id + ' cancelAllOrders() requires a symbol argument for margin non-trigger orders');
        }
        if (isMarginOrders) {
            request['tradeType'] = this.options['marginModes'][marginMode];
            if (marginMode === 'isolated' && trigger) {
                throw new errors.BadRequest(this.id + ' cancelAllOrders does not support isolated margin for stop orders');
            }
        }
        let response = undefined;
        if (trigger) {
            if (isMarginOrders) {
                response = await this.privateDeleteHfMarginStopOrderCancel(this.extend(request, query));
            }
            else {
                response = await this.privateDeleteStopOrderCancel(this.extend(request, query));
            }
        }
        else if (isMarginOrders) {
            response = await this.privateDeleteHfMarginOrders(this.extend(request, query));
        }
        else if (hf) {
            if (symbol === undefined) {
                response = await this.privateDeleteHfOrdersCancelAll(this.extend(request, query));
            }
            else {
                response = await this.privateDeleteHfOrders(this.extend(request, query));
            }
        }
        else {
            response = await this.privateDeleteOrders(this.extend(request, query));
        }
        return [this.safeOrder({ 'info': response })];
    }
    /**
     * @method
     * @name kucoin#cancelAllContractOrders
     * @description helper method for cancelling all contract orders
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-orders
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-stop-orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.trigger] When true, all the trigger orders will be cancelled
     * @returns Response from the exchange
     */
    async cancelAllContractOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (symbol !== undefined) {
            request['symbol'] = this.marketId(symbol);
        }
        const trigger = this.safeValue2(params, 'stop', 'trigger');
        params = this.omit(params, ['stop', 'trigger']);
        let response = undefined;
        if (trigger) {
            response = await this.futuresPrivateDeleteStopOrders(this.extend(request, params));
        }
        else {
            response = await this.futuresPrivateDeleteOrders(this.extend(request, params));
        }
        //
        //   {
        //       "code": "200000",
        //       "data": {
        //           "cancelledOrderIds": [
        //                "619714b8b6353000014c505a",
        //           ],
        //       },
        //   }
        //
        const data = this.safeDict(response, 'data');
        return [this.safeOrder({ 'info': data })];
    }
    /**
     * @method
     * @name kucoin#cancelAllUtaOrders
     * @description helper method for cancelling all uta orders
     * @see https://www.kucoin.com/docs-new/rest/ua/batch-cancel-order-by-symbol
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true if cancelling all stop orders
     * @param {string} [params.marginMode] 'CROSS' or 'ISOLATED'
     * @returns Response from the exchange
     */
    async cancelAllUtaOrders(symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelAllOrders() requires a symbol argument for uta endpoint');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const isContract = market['contract'];
        const tradeType = isContract ? 'FUTURES' : 'SPOT';
        let trigger = false;
        [trigger, params] = this.handleParamBool(params, 'trigger', trigger);
        const orderFilter = trigger ? 'ADVANCED' : 'NORMAL';
        const request = {
            'accountMode': 'unified',
            'symbol': market['id'],
            'tradeType': tradeType,
            'orderFilter': orderFilter,
        };
        const response = await this.utaPrivatePostAccountModeOrderCancelAll(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "tradeType": "SPOT",
        //             "ts": 1774458644140000000,
        //             "items": [
        //                 {
        //                     "orderId": "426328635071352832"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const orders = this.safeList(data, 'items', []);
        return this.parseOrders(orders, market, undefined, undefined, { 'status': 'canceled' });
    }
    /**
     * @method
     * @name kucoin#fetchOrdersByStatus
     * @description fetches a list of orders placed on the exchange
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-open-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-closed-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-list
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
     * @see https://www.kucoin.com/docs-new/rest/ua/get-open-order-list
     * @see https://www.kucoin.com/docs-new/rest/ua/get-order-history
     * @param {string} status 'active' or 'closed', only 'active' is valid for stop orders
     * @param {string} symbol unified symbol for the market to retrieve orders from
     * @param {int} [since] timestamp in ms of the earliest order to retrieve
     * @param {int} [limit] The maximum number of orders to retrieve
     * @param {object} [params] exchange specific parameters
     * @param {boolean} [params.uta] true for fetch orders with uta endpoint (default is false)
     * Check fetchSpotOrdersByStatus(), fetchContractOrdersByStatus() and fetchUtaOrdersByStatus() for more details on the extra parameters that can be used in params
     * @returns An [array of order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrdersByStatus(status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'fetchOrdersByStatus', 'uta', uta);
        let marketType = undefined;
        if (symbol === undefined) {
            const type = this.safeString(params, 'type'); // exchange has specific param for order type
            // todo check for better way to determine market type without symbol
            if (type === 'spot' || type === 'margin' || type === 'swap' || type === 'future' || type === 'contract') {
                marketType = type;
                params = this.omit(params, 'type');
            }
            else {
                const methodOptions = this.safeDict(this.options, 'fetchOrdersByStatus', {});
                const methodDefaultType = this.safeString2(methodOptions, 'defaultType', 'type');
                if (methodDefaultType === undefined) {
                    marketType = this.safeString2(this.options, 'defaultType', 'type', 'spot');
                }
                else {
                    marketType = methodDefaultType;
                }
            }
        }
        else {
            const market = this.market(symbol);
            marketType = market['type'];
        }
        if (uta) {
            params = this.omit(params, 'uta');
            params = this.extend(params, { 'marketType': marketType });
            return await this.fetchUtaOrdersByStatus(status, symbol, since, limit, params);
        }
        else if ((marketType === 'spot') || (marketType === 'margin')) {
            return await this.fetchSpotOrdersByStatus(status, symbol, since, limit, params);
        }
        else {
            return await this.fetchContractOrdersByStatus(status, symbol, since, limit, params);
        }
    }
    /**
     * @method
     * @name kucoin#fetchSpotOrdersByStatus
     * @description fetch a list of spot orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-open-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-closed-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-list
     * @param {string} status *not used for stop orders* 'open' or 'closed'
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] max number of orders to return
     * @param {object} [params] exchange specific params
     * @param {int} [params.until] end time in ms
     * @param {string} [params.side] buy or sell
     * @param {string} [params.type] limit, market, limit_stop or market_stop
     * @param {string} [params.tradeType] TRADE for spot trading, MARGIN_TRADE or MARGIN_ISOLATED_TRADE for Margin Trading
     * @param {int} [params.currentPage] *trigger orders only* current page
     * @param {string} [params.orderIds] *trigger orders only* comma separated order ID list
     * @param {bool} [params.trigger] True if fetching a trigger order
     * @param {bool} [params.hf] false, // true for hf order
     * @param {string} [params.marginMode] 'cross' or 'isolated', only for margin orders
     * @returns An [array of order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchSpotOrdersByStatus(status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let lowercaseStatus = status.toLowerCase();
        const until = this.safeInteger(params, 'until');
        const trigger = this.safeBool2(params, 'stop', 'trigger', false);
        let hf = undefined;
        [hf, params] = this.handleHfAndParams(params);
        if (hf && (symbol === undefined)) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrdersByStatus() requires a symbol parameter for hf orders');
        }
        params = this.omit(params, ['stop', 'trigger', 'till', 'until']);
        const [marginMode, query] = this.handleMarginModeAndParams('fetchOrdersByStatus', params);
        const isMarginOrder = marginMode !== undefined;
        if (lowercaseStatus === 'open') {
            lowercaseStatus = 'active';
        }
        else if (lowercaseStatus === 'closed') {
            lowercaseStatus = 'done';
        }
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        request['tradeType'] = this.safeString(this.options['marginModes'], marginMode, 'TRADE');
        let response = undefined;
        if (isMarginOrder && lowercaseStatus === 'active' && (!trigger)) {
            // hf margin open non-trigger orders require only symbol and tradeType params
            response = await this.privateGetHfMarginOrdersActive(this.extend(request, query));
        }
        else {
            if (!isMarginOrder) {
                request['status'] = lowercaseStatus;
            }
            if (since !== undefined) {
                request['startAt'] = since;
            }
            if (limit !== undefined) {
                request['pageSize'] = limit;
            }
            if (until) {
                request['endAt'] = until;
            }
            if (trigger) {
                if (isMarginOrder) {
                    response = await this.privateGetHfMarginStopOrders(this.extend(request, query));
                }
                else {
                    response = await this.privateGetStopOrder(this.extend(request, query));
                }
            }
            else if (isMarginOrder) {
                response = await this.privateGetHfMarginOrdersDone(this.extend(request, query));
            }
            else if (hf) {
                if (lowercaseStatus === 'active') {
                    response = await this.privateGetHfOrdersActive(this.extend(request, query));
                }
                else if (lowercaseStatus === 'done') {
                    response = await this.privateGetHfOrdersDone(this.extend(request, query));
                }
            }
            else {
                response = await this.privateGetOrders(this.extend(request, query));
            }
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "currentPage": 1,
            //             "pageSize": 1,
            //             "totalNum": 153408,
            //             "totalPage": 153408,
            //             "items": [
            //                 {
            //                     "id": "5c35c02703aa673ceec2a168",   //orderid
            //                     "symbol": "BTC-USDT",   //symbol
            //                     "opType": "DEAL",      // operation type,deal is pending order,cancel is cancel order
            //                     "type": "limit",       // order type,e.g. limit,markrt,stop_limit.
            //                     "side": "buy",         // transaction direction,include buy and sell
            //                     "price": "10",         // order price
            //                     "size": "2",           // order quantity
            //                     "funds": "0",          // order funds
            //                     "dealFunds": "0.166",  // deal funds
            //                     "dealSize": "2",       // deal quantity
            //                     "fee": "0",            // fee
            //                     "feeCurrency": "USDT", // charge fee currency
            //                     "stp": "",             // self trade prevention,include CN,CO,DC,CB
            //                     "stop": "",            // stop type
            //                     "stopTriggered": false,  // stop order is triggered
            //                     "stopPrice": "0",      // stop price
            //                     "timeInForce": "GTC",  // time InForce,include GTC,GTT,IOC,FOK
            //                     "postOnly": false,     // postOnly
            //                     "hidden": false,       // hidden order
            //                     "iceberg": false,      // iceberg order
            //                     "visibleSize": "0",    // display quantity for iceberg order
            //                     "cancelAfter": 0,      // cancel orders time，requires timeInForce to be GTT
            //                     "channel": "IOS",      // order source
            //                     "clientOid": "",       // user-entered order unique mark
            //                     "remark": "",          // remark
            //                     "tags": "",            // tag order source
            //                     "isActive": false,     // status before unfilled or uncancelled
            //                     "cancelExist": false,   // order cancellation transaction record
            //                     "createdAt": 1547026471000  // time
            //                 },
            //             ]
            //         }
            //    }
        }
        const listData = this.safeList(response, 'data');
        if (listData !== undefined) {
            return this.parseOrders(listData, market, since, limit);
        }
        const responseData = this.safeDict(response, 'data', {});
        const orders = this.safeList(responseData, 'items', []);
        return this.parseOrders(orders, market, since, limit);
    }
    /**
     * @method
     * @name kucoin#fetchContractOrdersByStatus
     * @description fetches a list of contract orders placed on the exchange
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
     * @param {string} status 'active' or 'closed', only 'active' is valid for stop orders
     * @param {string} symbol unified symbol for the market to retrieve orders from
     * @param {int} [since] timestamp in ms of the earliest order to retrieve
     * @param {int} [limit] The maximum number of orders to retrieve
     * @param {object} [params] exchange specific parameters
     * @param {bool} [params.trigger] set to true to retrieve untriggered stop orders
     * @param {int} [params.until] End time in ms
     * @param {string} [params.side] buy or sell
     * @param {string} [params.type] limit or market
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns An [array of order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchContractOrdersByStatus(status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOrdersByStatus', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchOrdersByStatus', symbol, since, limit, params);
        }
        const trigger = this.safeBool2(params, 'stop', 'trigger');
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, ['stop', 'until', 'trigger']);
        if (status === 'closed') {
            status = 'done';
        }
        else if (status === 'open') {
            status = 'active';
        }
        const request = {};
        if (!trigger) {
            request['status'] = status;
        }
        else if (status !== 'active') {
            throw new errors.BadRequest(this.id + ' fetchOrdersByStatus() can only fetch untriggered stop orders');
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (until !== undefined) {
            request['endAt'] = until;
        }
        let response = undefined;
        if (trigger) {
            response = await this.futuresPrivateGetStopOrders(this.extend(request, params));
        }
        else {
            response = await this.futuresPrivateGetOrders(this.extend(request, params));
        }
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "currentPage": 1,
        //             "pageSize": 50,
        //             "totalNum": 4,
        //             "totalPage": 1,
        //             "items": [
        //                 {
        //                     "id": "64507d02921f1c0001ff6892",
        //                     "symbol": "XBTUSDTM",
        //                     "type": "market",
        //                     "side": "buy",
        //                     "price": null,
        //                     "size": 1,
        //                     "value": "27.992",
        //                     "dealValue": "27.992",
        //                     "dealSize": 1,
        //                     "stp": "",
        //                     "stop": "",
        //                     "stopPriceType": "",
        //                     "stopTriggered": false,
        //                     "stopPrice": null,
        //                     "timeInForce": "GTC",
        //                     "postOnly": false,
        //                     "hidden": false,
        //                     "iceberg": false,
        //                     "leverage": "17",
        //                     "forceHold": false,
        //                     "closeOrder": false,
        //                     "visibleSize": null,
        //                     "clientOid": null,
        //                     "remark": null,
        //                     "tags": null,
        //                     "isActive": false,
        //                     "cancelExist": false,
        //                     "createdAt": 1682996482000,
        //                     "updatedAt": 1682996483062,
        //                     "endAt": 1682996483062,
        //                     "orderTime": 1682996482953900677,
        //                     "settleCurrency": "USDT",
        //                     "status": "done",
        //                     "filledValue": "27.992",
        //                     "filledSize": 1,
        //                     "reduceOnly": false
        //                 }
        //             ]
        //         }
        //     }
        //
        const responseData = this.safeDict(response, 'data', {});
        const orders = this.safeList(responseData, 'items', []);
        return this.parseOrders(orders, market, since, limit);
    }
    /**
     * @method
     * @name kucoin#fetchUtaOrdersByStatus
     * @description helper method for fetching orders by status with uta endpoint
     * @see https://www.kucoin.com/docs-new/rest/ua/get-open-order-list
     * @see https://www.kucoin.com/docs-new/rest/ua/get-order-history
     * @param {string} status 'active' or 'closed', only 'active' is valid for stop orders
     * @param {string} symbol unified symbol for the market to retrieve orders from
     * @param {int} [since] timestamp in ms of the earliest order to retrieve
     * @param {int} [limit] The maximum number of orders to retrieve
     * @param {object} [params] exchange specific parameters
     * @param {int} [params.until] End time in ms
     * @param {string} [params.side] *closed orders only* 'BUY' or 'SELL'
     * @param {string} [params.accountMode] 'unified' or 'classic' (default is unified)
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns An [array of order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchUtaOrdersByStatus(status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        const maxLimit = 200;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOrdersByStatus', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchOrdersByStatus', symbol, since, limit, params, maxLimit);
        }
        let accountMode = 'unified';
        [accountMode, params] = this.handleOptionAndParams(params, 'fetchUtaOrdersByStatus', 'accountMode', accountMode);
        let request = {
            'accountMode': accountMode,
        };
        let marketType = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            marketType = market['type'];
            request['symbol'] = market['id'];
        }
        else {
            marketType = this.safeString(params, 'marketType');
        }
        params = this.omit(params, 'marketType');
        const isContract = (marketType !== 'spot') && (marketType !== 'margin');
        if (!isContract && (symbol === undefined)) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrdersByStatus() requires a symbol argument for spot and margin markets when using uta endpoint');
        }
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchOrdersByStatus', params);
        const tradeType = this.handleTradeType(isContract, marginMode, params);
        params['tradeType'] = tradeType;
        if (since !== undefined) {
            request['startAt'] = since;
        }
        [request, params] = this.handleUntilOption('endAt', request, params);
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        let lowercaseStatus = status.toLowerCase();
        if (lowercaseStatus === 'open') {
            lowercaseStatus = 'active';
        }
        else if (lowercaseStatus === 'closed') {
            lowercaseStatus = 'done';
        }
        let response = undefined;
        if (lowercaseStatus === 'active') {
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "pageNumber": 1,
            //             "pageSize": 50,
            //             "totalNum": 1,
            //             "totalPage": 1,
            //             "items": [
            //                 {
            //                     "orderId": "426328635071352832",
            //                     "symbol": "ETH-USDT",
            //                     "orderType": "LIMIT",
            //                     "side": "BUY",
            //                     "size": "0.001",
            //                     "price": "1000",
            //                     "timeInForce": "GTC",
            //                     "tags": "partner:ccxt",
            //                     "orderTime": 1774457869404794617,
            //                     "stp": "",
            //                     "cancelAfter": null,
            //                     "postOnly": false,
            //                     "reduceOnly": false,
            //                     "triggerDirection": "",
            //                     "triggerPrice": "",
            //                     "triggerPriceType": "",
            //                     "tpTriggerPrice": "",
            //                     "tpTriggerPriceType": "",
            //                     "slTriggerPrice": "",
            //                     "slTriggerPriceType": "",
            //                     "filledSize": "0",
            //                     "avgPrice": "0",
            //                     "fee": "0",
            //                     "feeCurrency": "USDT",
            //                     "tax": "0",
            //                     "updatedTime": 1774457869469028819,
            //                     "triggerOrderId": "",
            //                     "cancelReason": "",
            //                     "cancelSize": "0",
            //                     "clientOid": "708987d5-c346-487a-a70c-ea267377b0ca",
            //                     "sizeUnit": "BASECCY",
            //                     "status": 2
            //                 }
            //             ],
            //             "tradeType": "SPOT"
            //         }
            //     }
            //
            response = await this.utaPrivateGetAccountModeOrderOpenList(this.extend(request, params));
        }
        else {
            response = await this.utaPrivateGetAccountModeOrderHistory(this.extend(request, params));
        }
        const data = this.safeDict(response, 'data', {});
        const orders = this.safeList(data, 'items', []);
        return this.parseOrders(orders, market, since, limit);
    }
    /**
     * @method
     * @name kucoin#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-closed-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
     * @see https://www.kucoin.com/docs-new/rest/ua/get-order-history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @param {string} [params.side] buy or sell
     * @param {string} [params.type] limit, market, limit_stop or market_stop
     * @param {string} [params.tradeType] TRADE for spot trading, MARGIN_TRADE for Margin Trading
     * @param {bool} [params.trigger] True if fetching a trigger order
     * @param {bool} [params.hf] false, // true for hf order
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchClosedOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchClosedOrders', symbol, since, limit, params);
        }
        return await this.fetchOrdersByStatus('done', symbol, since, limit, params);
    }
    /**
     * @method
     * @name kucoin#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-open-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-list
     * @see https://www.kucoin.com/docs-new/rest/ua/get-open-order-list
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @param {bool} [params.trigger] true if fetching trigger orders
     * @param {string} [params.side] buy or sell
     * @param {string} [params.type] limit, market, limit_stop or market_stop
     * @param {string} [params.tradeType] TRADE for spot trading, MARGIN_TRADE for Margin Trading
     * @param {int} [params.currentPage] *trigger orders only* current page
     * @param {string} [params.orderIds] *trigger orders only* comma separated order ID list
     * @param {bool} [params.hf] false, // true for hf order
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOpenOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchOpenOrders', symbol, since, limit, params);
        }
        return await this.fetchOrdersByStatus('active', symbol, since, limit, params);
    }
    /**
     * @method
     * @name kucoin#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/get-stop-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/get-stop-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/ua/get-order-details
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @param {bool} [params.uta] true if fetching an order with uta endpoint (default is false)
     * Check fetchSpotOrder(), fetchContractOrder() and fetchUtaOrder() for more details on the extra parameters that can be used in params
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'fetchOrder', 'uta', uta);
        if (uta) {
            params = this.omit(params, 'uta');
            return await this.fetchUtaOrder(id, symbol, params);
        }
        let marketType = undefined;
        if (symbol === undefined) {
            [marketType, params] = this.handleMarketTypeAndParams('fetchOrder', undefined, params);
        }
        else {
            const market = this.market(symbol);
            marketType = market['type'];
        }
        if ((marketType === 'spot') || (marketType === 'margin')) {
            return await this.fetchSpotOrder(id, symbol, params);
        }
        else {
            return await this.fetchContractOrder(id, symbol, params);
        }
    }
    /**
     * @method
     * @name kucoin#fetchSpotOrder
     * @description fetch a spot order
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/get-stop-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-clientoid
     * @param {string} id Order id
     * @param {string} symbol not sent to exchange except for trigger orders with clientOid, but used internally by CCXT to filter
     * @param {object} [params] exchange specific parameters
     * @param {bool} [params.trigger] true if fetching a trigger order
     * @param {bool} [params.hf] false, // true for hf order
     * @param {bool} [params.clientOid] unique order id created by users to identify their orders
     * @param {object} [params.marginMode] 'cross' or 'isolated'
     * @returns An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchSpotOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        const clientOrderId = this.safeString2(params, 'clientOid', 'clientOrderId');
        const trigger = this.safeBool2(params, 'stop', 'trigger', false);
        let hf = undefined;
        [hf, params] = this.handleHfAndParams(params);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchOrder', params);
        const isMarginOrder = marginMode !== undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        if (hf || isMarginOrder) {
            if (!trigger) {
                if (symbol === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires a symbol parameter for hf and margin orders');
                }
                request['symbol'] = market['id'];
            }
        }
        params = this.omit(params, ['stop', 'clientOid', 'clientOrderId', 'trigger']);
        let response = undefined;
        if (clientOrderId !== undefined) {
            request['clientOid'] = clientOrderId;
            if (trigger) {
                if (isMarginOrder) {
                    response = await this.privateGetHfMarginStopOrderClientOid(this.extend(request, params));
                }
                else {
                    if (symbol !== undefined) {
                        request['symbol'] = market['id'];
                    }
                    response = await this.privateGetStopOrderQueryOrderByClientOid(this.extend(request, params));
                }
            }
            else if (isMarginOrder) {
                response = await this.privateGetHfMarginOrdersClientOrderClientOid(this.extend(request, params));
            }
            else if (hf) {
                response = await this.privateGetHfOrdersClientOrderClientOid(this.extend(request, params));
            }
            else {
                response = await this.privateGetOrderClientOrderClientOid(this.extend(request, params));
            }
        }
        else {
            // a special case for undefined ids
            // otherwise a wrong endpoint for all orders will be triggered
            // https://github.com/ccxt/ccxt/issues/7234
            if (id === undefined) {
                throw new errors.InvalidOrder(this.id + ' fetchOrder() requires an order id');
            }
            request['orderId'] = id;
            if (trigger) {
                if (isMarginOrder) {
                    response = await this.privateGetHfMarginStopOrderOrderId(this.extend(request, params));
                }
                else {
                    response = await this.privateGetStopOrderOrderId(this.extend(request, params));
                }
            }
            else if (isMarginOrder) {
                response = await this.privateGetHfMarginOrdersOrderId(this.extend(request, params));
            }
            else if (hf) {
                response = await this.privateGetHfOrdersOrderId(this.extend(request, params));
            }
            else {
                response = await this.privateGetOrdersOrderId(this.extend(request, params));
            }
        }
        let responseData = this.safeDict(response, 'data', {});
        if (Array.isArray(responseData)) {
            responseData = this.safeValue(responseData, 0);
        }
        return this.parseOrder(responseData, market);
    }
    /**
     * @method
     * @name kucoin#fetchContractOrder
     * @description fetc contract order
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/get-stop-order-by-clientoid
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchContractOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let response = undefined;
        const clientOrderId = this.safeString2(params, 'clientOid', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOid'] = clientOrderId;
            params = this.omit(params, ['clientOid', 'clientOrderId']);
            response = await this.futuresPrivateGetOrdersByClientOid(this.extend(request, params));
        }
        else {
            if (id === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires an order id argument or clientOrderId in params');
            }
            request['orderId'] = id;
            response = await this.futuresPrivateGetOrdersOrderId(this.extend(request, params));
        }
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "id": "64507d02921f1c0001ff6892",
        //             "symbol": "XBTUSDTM",
        //             "type": "market",
        //             "side": "buy",
        //             "price": null,
        //             "size": 1,
        //             "value": "27.992",
        //             "dealValue": "27.992",
        //             "dealSize": 1,
        //             "stp": "",
        //             "stop": "",
        //             "stopPriceType": "",
        //             "stopTriggered": false,
        //             "stopPrice": null,
        //             "timeInForce": "GTC",
        //             "postOnly": false,
        //             "hidden": false,
        //             "iceberg": false,
        //             "leverage": "17",
        //             "forceHold": false,
        //             "closeOrder": false,
        //             "visibleSize": null,
        //             "clientOid": null,
        //             "remark": null,
        //             "tags": null,
        //             "isActive": false,
        //             "cancelExist": false,
        //             "createdAt": 1682996482000,
        //             "updatedAt": 1682996483000,
        //             "endAt": 1682996483000,
        //             "orderTime": 1682996482953900677,
        //             "settleCurrency": "USDT",
        //             "status": "done",
        //             "filledSize": 1,
        //             "filledValue": "27.992",
        //             "reduceOnly": false
        //         }
        //     }
        //
        const market = (symbol !== undefined) ? this.market(symbol) : undefined;
        const responseData = this.safeDict(response, 'data');
        return this.parseOrder(responseData, market);
    }
    /**
     * @method
     * @name kucoin#fetchUtaOrder
     * @description fetch uta order
     * @see https://www.kucoin.com/docs-new/rest/ua/get-order-details
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountMode] 'unified' or 'classic' (default is 'unified')
     * @param {string} [params.clientOrderId] client order id, required if id is not provided
     * @param {string} [params.marginMode] 'cross' or 'isolated', required if fetching a margin order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchUtaOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires a symbol argument for uta orders');
        }
        const request = {};
        const clientOrderId = this.safeString2(params, 'clientOid', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOid'] = clientOrderId;
            params = this.omit(params, ['clientOid', 'clientOrderId']);
        }
        else {
            if (id === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires an id argument or clientOrderId parameter');
            }
            request['orderId'] = id;
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        request['symbol'] = market['id'];
        let accountMode = 'unified';
        [accountMode, params] = this.handleOptionAndParams(params, 'fetchOrder', 'accountMode', accountMode);
        request['accountMode'] = accountMode;
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchOrder', params);
        const tradeType = this.handleTradeType(market['contract'], marginMode, params);
        request['tradeType'] = tradeType;
        const response = await this.utaPrivateGetAccountModeOrderDetail(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "orderId": "426319129738321920",
        //             "symbol": "ETH-USDT",
        //             "orderType": "LIMIT",
        //             "side": "BUY",
        //             "size": "0.001",
        //             "price": "1000",
        //             "timeInForce": "GTC",
        //             "tags": "partner:ccxt",
        //             "orderTime": 1774455603156417582,
        //             "stp": "",
        //             "cancelAfter": null,
        //             "postOnly": false,
        //             "reduceOnly": false,
        //             "triggerDirection": "",
        //             "triggerPrice": "",
        //             "triggerPriceType": "",
        //             "tpTriggerPrice": "",
        //             "tpTriggerPriceType": "",
        //             "slTriggerPrice": "",
        //             "slTriggerPriceType": "",
        //             "filledSize": "0",
        //             "avgPrice": "0",
        //             "fee": "0",
        //             "feeCurrency": "USDT",
        //             "tax": "0",
        //             "updatedTime": 1774455603371523690,
        //             "triggerOrderId": "",
        //             "cancelReason": "",
        //             "cancelSize": "0",
        //             "clientOid": "b896c118-a674-4863-baf4-a9ea3cd696c5",
        //             "sizeUnit": "BASECCY",
        //             "tradeType": "SPOT",
        //             "tradeId": "",
        //             "status": 2
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    handleTradeType(isContractMarket = false, marginMode = undefined, params = {}) {
        let tradeType = this.safeString(params, 'tradeType');
        if (tradeType === undefined) {
            if (isContractMarket) {
                tradeType = 'FUTURES';
            }
            else if (marginMode !== undefined) {
                tradeType = marginMode.toUpperCase();
            }
            else {
                tradeType = 'SPOT';
            }
        }
        return tradeType;
    }
    parseOrder(order, market = undefined) {
        const tradeType = this.safeString(order, 'tradeType');
        const utaTradeTypes = ['SPOT', 'CROSS', 'ISOLATED', 'FUTURES']; // tradeType specific for uta endpoint
        let isUtaOrder = this.inArray(tradeType, utaTradeTypes);
        if ('sizeUnit' in order) { // property specific for uta endpoint
            isUtaOrder = true;
        }
        if (isUtaOrder) {
            return this.parseUtaOrder(order, market);
        }
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        if ((market !== undefined) && (market['contract'])) {
            return this.parseContractOrder(order, market);
        }
        else {
            return this.parseSpotOrder(order, market);
        }
    }
    parseContractOrder(order, market = undefined) {
        //
        // fetchOrder, fetchOrdersByStatus
        //
        //     {
        //         "id": "64507d02921f1c0001ff6892",
        //         "symbol": "XBTUSDTM",
        //         "type": "market",
        //         "side": "buy",
        //         "price": null,
        //         "size": 1,
        //         "value": "27.992",
        //         "dealValue": "27.992",
        //         "dealSize": 1,
        //         "stp": "",
        //         "stop": "",
        //         "stopPriceType": "",
        //         "stopTriggered": false,
        //         "stopPrice": null,
        //         "timeInForce": "GTC",
        //         "postOnly": false,
        //         "hidden": false,
        //         "iceberg": false,
        //         "leverage": "17",
        //         "forceHold": false,
        //         "closeOrder": false,
        //         "visibleSize": null,
        //         "clientOid": null,
        //         "remark": null,
        //         "tags": null,
        //         "isActive": false,
        //         "cancelExist": false,
        //         "createdAt": 1682996482000,
        //         "updatedAt": 1682996483062,
        //         "endAt": 1682996483062,
        //         "orderTime": 1682996482953900677,
        //         "settleCurrency": "USDT",
        //         "status": "done",
        //         "filledValue": "27.992",
        //         "filledSize": 1,
        //         "reduceOnly": false
        //     }
        //
        // createOrder
        //
        //     {
        //         "orderId": "619717484f1d010001510cde"
        //     }
        //
        // createOrders
        //
        //     {
        //         "orderId": "80465574458560512",
        //         "clientOid": "5c52e11203aa677f33e491",
        //         "symbol": "ETHUSDTM",
        //         "code": "200000",
        //         "msg": "success"
        //     }
        //
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const orderId = this.safeString2(order, 'id', 'orderId');
        const type = this.safeString(order, 'type');
        const timestamp = this.safeInteger(order, 'createdAt');
        const datetime = this.iso8601(timestamp);
        const price = this.safeString(order, 'price');
        // price is zero for market order
        // omitZero is called in safeOrder2
        const side = this.safeString(order, 'side');
        const feeCurrencyId = this.safeString(order, 'feeCurrency');
        const feeCurrency = this.safeCurrencyCode(feeCurrencyId);
        const feeCost = this.safeNumber(order, 'fee');
        const amount = this.safeString(order, 'size');
        const filled = this.safeString(order, 'filledSize');
        const cost = this.safeString(order, 'filledValue');
        let average = this.safeString(order, 'avgDealPrice');
        if ((average === undefined) && Precise["default"].stringGt(filled, '0')) {
            const contractSize = this.safeString(market, 'contractSize');
            if (market['linear']) {
                average = Precise["default"].stringDiv(cost, Precise["default"].stringMul(contractSize, filled));
            }
            else {
                average = Precise["default"].stringDiv(Precise["default"].stringMul(contractSize, filled), cost);
            }
        }
        // precision reported by their api is 8 d.p.
        // const average = Precise.stringDiv (cost, Precise.stringMul (filled, market['contractSize']));
        // bool
        const isActive = this.safeValue(order, 'isActive');
        const cancelExist = this.safeBool(order, 'cancelExist', false);
        let status = undefined;
        if (isActive !== undefined) {
            status = isActive ? 'open' : 'closed';
        }
        status = cancelExist ? 'canceled' : status;
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'currency': feeCurrency,
                'cost': feeCost,
            };
        }
        const clientOrderId = this.safeString(order, 'clientOid');
        const timeInForce = this.safeString(order, 'timeInForce');
        const postOnly = this.safeValue(order, 'postOnly');
        const reduceOnly = this.safeValue(order, 'reduceOnly');
        const lastUpdateTimestamp = this.safeInteger(order, 'updatedAt');
        return this.safeOrder({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': reduceOnly,
            'side': side,
            'amount': amount,
            'price': price,
            'triggerPrice': this.safeNumber(order, 'stopPrice'),
            'cost': cost,
            'filled': filled,
            'remaining': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'fee': fee,
            'status': status,
            'info': order,
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'average': average,
            'trades': undefined,
        }, market);
    }
    parseSpotOrder(order, market = undefined) {
        //
        // createOrder
        //
        //    {
        //        "orderId": "63c97e47d686c5000159a656"
        //    }
        //
        // cancelOrder
        //
        //    {
        //        "cancelledOrderIds": [ "63c97e47d686c5000159a656" ]
        //    }
        //
        // fetchOpenOrders, fetchClosedOrders
        //
        //    {
        //        "id": "63c97ce8d686c500015793bb",
        //        "symbol": "USDC-USDT",
        //        "opType": "DEAL",
        //        "type": "limit",
        //        "side": "sell",
        //        "price": "1.05",
        //        "size": "1",
        //        "funds": "0",
        //        "dealFunds": "0",
        //        "dealSize": "0",
        //        "fee": "0",
        //        "feeCurrency": "USDT",
        //        "stp": "",
        //        "stop": "",
        //        "stopTriggered": false,
        //        "stopPrice": "0",
        //        "timeInForce": "GTC",
        //        "postOnly": false,
        //        "hidden": false,
        //        "iceberg": false,
        //        "visibleSize": "0",
        //        "cancelAfter": 0,
        //        "channel": "API",
        //        "clientOid": "d602d73f-5424-4751-bef0-8debce8f0a82",
        //        "remark": null,
        //        "tags": "partner:ccxt",
        //        "isActive": true,
        //        "cancelExist": false,
        //        "createdAt": 1674149096927,
        //        "tradeType": "TRADE"
        //    }
        //
        // stop orders (fetchOpenOrders, fetchClosedOrders)
        //
        //    {
        //        "id": "vs9f6ou9e864rgq8000t4qnm",
        //        "symbol": "USDC-USDT",
        //        "userId": "613a896885d8660006151f01",
        //        "status": "NEW",
        //        "type": "market",
        //        "side": "sell",
        //        "price": null,
        //        "size": "1.00000000000000000000",
        //        "funds": null,
        //        "stp": null,
        //        "timeInForce": "GTC",
        //        "cancelAfter": -1,
        //        "postOnly": false,
        //        "hidden": false,
        //        "iceberg": false,
        //        "visibleSize": null,
        //        "channel": "API",
        //        "clientOid": "5d3fd727-6456-438d-9550-40d9d85eee0b",
        //        "remark": null,
        //        "tags": "partner:ccxt",
        //        "relatedNo": null,
        //        "orderTime": 1674146316994000028,
        //        "domainId": "kucoin",
        //        "tradeSource": "USER",
        //        "tradeType": "MARGIN_TRADE",
        //        "feeCurrency": "USDT",
        //        "takerFeeRate": "0.00100000000000000000",
        //        "makerFeeRate": "0.00100000000000000000",
        //        "createdAt": 1674146316994,
        //        "stop": "loss",
        //        "stopTriggerTime": null,
        //        "stopPrice": "0.97000000000000000000"
        //    }
        // hf order
        //    {
        //        "id":"6478cf1439bdfc0001528a1d",
        //        "symbol":"LTC-USDT",
        //        "opType":"DEAL",
        //        "type":"limit",
        //        "side":"buy",
        //        "price":"50",
        //        "size":"0.1",
        //        "funds":"5",
        //        "dealSize":"0",
        //        "dealFunds":"0",
        //        "fee":"0",
        //        "feeCurrency":"USDT",
        //        "stp":null,
        //        "timeInForce":"GTC",
        //        "postOnly":false,
        //        "hidden":false,
        //        "iceberg":false,
        //        "visibleSize":"0",
        //        "cancelAfter":0,
        //        "channel":"API",
        //        "clientOid":"d4d2016b-8e3a-445c-aa5d-dc6df5d1678d",
        //        "remark":null,
        //        "tags":"partner:ccxt",
        //        "cancelExist":false,
        //        "createdAt":1685638932074,
        //        "lastUpdatedAt":1685639013735,
        //        "tradeType":"TRADE",
        //        "inOrderBook":true,
        //        "cancelledSize":"0",
        //        "cancelledFunds":"0",
        //        "remainSize":"0.1",
        //        "remainFunds":"5",
        //        "active":true
        //    }
        //
        const marketId = this.safeString(order, 'symbol');
        const timestamp = this.safeInteger(order, 'createdAt');
        const feeCurrencyId = this.safeString(order, 'feeCurrency');
        const cancelExist = this.safeBool(order, 'cancelExist', false);
        const responseStop = this.safeString(order, 'stop');
        const trigger = responseStop !== undefined;
        const stopTriggered = this.safeBool(order, 'stopTriggered', false);
        const isActive = this.safeBool2(order, 'isActive', 'active');
        const responseStatus = this.safeString(order, 'status');
        let status = undefined;
        if (isActive !== undefined) {
            if (isActive === true) {
                status = 'open';
            }
            else {
                status = 'closed';
            }
        }
        if (trigger) {
            if (responseStatus === 'NEW') {
                status = 'open';
            }
            else if (!isActive && !stopTriggered) {
                status = 'cancelled';
            }
        }
        if (cancelExist) {
            status = 'canceled';
        }
        if (responseStatus === 'fail') {
            status = 'rejected';
        }
        return this.safeOrder({
            'info': order,
            'id': this.safeStringN(order, ['id', 'orderId', 'newOrderId', 'cancelledOrderId']),
            'clientOrderId': this.safeString(order, 'clientOid'),
            'symbol': this.safeSymbol(marketId, market, '-'),
            'type': this.safeString(order, 'type'),
            'timeInForce': this.safeString(order, 'timeInForce'),
            'postOnly': this.safeBool(order, 'postOnly'),
            'side': this.safeString(order, 'side'),
            'amount': this.safeString(order, 'size'),
            'price': this.safeString(order, 'price'),
            'triggerPrice': this.safeNumber(order, 'stopPrice'),
            'cost': this.safeString(order, 'dealFunds'),
            'filled': this.safeString(order, 'dealSize'),
            'remaining': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'fee': {
                'currency': this.safeCurrencyCode(feeCurrencyId),
                'cost': this.safeNumber(order, 'fee'),
            },
            'status': status,
            'lastTradeTimestamp': undefined,
            'average': this.safeString(order, 'avgDealPrice'),
            'trades': undefined,
        }, market);
    }
    parseUtaOrder(order, market = undefined) {
        //
        // createOrder
        //     {
        //         "orderId": "426319129738321920",
        //         "tradeType": "SPOT",
        //         "ts": 1774455603216000000,
        //         "clientOid": "b896c118-a674-4863-baf4-a9ea3cd696c5"
        //     }
        //
        // fetchOrder
        //     {
        //         "orderId": "426319129738321920",
        //         "symbol": "ETH-USDT",
        //         "orderType": "LIMIT",
        //         "side": "BUY",
        //         "size": "0.001",
        //         "price": "1000",
        //         "timeInForce": "GTC",
        //         "tags": "partner:ccxt",
        //         "orderTime": 1774455603156417582,
        //         "stp": "",
        //         "cancelAfter": null,
        //         "postOnly": false,
        //         "reduceOnly": false,
        //         "triggerDirection": "",
        //         "triggerPrice": "",
        //         "triggerPriceType": "",
        //         "tpTriggerPrice": "",
        //         "tpTriggerPriceType": "",
        //         "slTriggerPrice": "",
        //         "slTriggerPriceType": "",
        //         "filledSize": "0",
        //         "avgPrice": "0",
        //         "fee": "0",
        //         "feeCurrency": "USDT",
        //         "tax": "0",
        //         "updatedTime": 1774455603371523690,
        //         "triggerOrderId": "",
        //         "cancelReason": "",
        //         "cancelSize": "0",
        //         "clientOid": "b896c118-a674-4863-baf4-a9ea3cd696c5",
        //         "sizeUnit": "BASECCY",
        //         "tradeType": "SPOT",
        //         "tradeId": "",
        //         "status": 2
        //     }
        //
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeIntegerProduct2(order, 'orderTime', 'ts', 0.000001);
        const lastUpdateTimestamp = this.safeIntegerProduct(order, 'updatedTime', 0.000001);
        const rawTimeInForce = this.safeString(order, 'timeInForce');
        let amount = undefined;
        let cost = undefined;
        const sizeUnit = this.safeString(order, 'sizeUnit');
        const size = this.safeString(order, 'size');
        const rawStatus = this.safeString(order, 'status');
        const average = this.safeString(order, 'avgPrice');
        let filled = this.safeString(order, 'filledSize'); // might be in base or quote, need to check sizeUnit
        if ((sizeUnit === 'BASECCY') || (sizeUnit === 'UNIT')) {
            amount = size;
        }
        else {
            cost = filled;
            filled = Precise["default"].stringDiv(filled, average);
            filled = this.amountToPrecision(symbol, filled);
        }
        const fee = {
            'currency': this.safeCurrencyCode(this.safeString(order, 'feeCurrency')),
            'cost': this.safeString(order, 'fee'),
        };
        return this.safeOrder({
            'id': this.safeString(order, 'orderId'),
            'clientOrderId': this.safeString(order, 'clientOid'),
            'symbol': symbol,
            'type': this.safeStringLower(order, 'orderType'),
            'timeInForce': this.parseOrderTimeInForce(rawTimeInForce),
            'postOnly': this.safeBool(order, 'postOnly'),
            'reduceOnly': this.safeBool(order, 'reduceOnly'),
            'side': this.safeStringLower(order, 'side'),
            'amount': amount,
            'price': this.safeString(order, 'price'),
            'triggerPrice': this.safeString2(order, 'stopPrice', 'triggerPrice'),
            'cost': cost,
            'filled': filled,
            'remaining': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'fee': fee,
            'status': this.parseOrderStatus(rawStatus),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'average': average,
            'trades': undefined,
            'stopLossPrice': this.safeString(order, 'slTriggerPrice'),
            'takeProfitPrice': this.safeString(order, 'tpTriggerPrice'),
            'info': order,
        }, market);
    }
    parseOrderTimeInForce(timeInForce) {
        const timeInForces = {
            'GTC': 'GTC',
            'IOC': 'IOC',
            'FOK': 'FOK',
            'GTT': 'GTD',
        };
        return this.safeString(timeInForces, timeInForce, timeInForce);
    }
    parseOrderStatus(status) {
        const statuses = {
            '0': 'open',
            '1': 'open',
            '2': 'open',
            '3': 'closed',
            '4': 'open',
            '5': 'canceled',
            '6': 'closed', // partial canceled
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name kucoin#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://docs.kucoin.com/#list-fills
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-trade-history
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-trade-history
     * @see https://www.kucoin.com/docs-new/rest/ua/get-trade-history
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @param {boolean} [params.uta] set to true if fetching trades from uta endpoint, default is false.
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'orderId': id,
        };
        return await this.fetchMyTrades(symbol, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name kucoin#fetchMyTrades
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-trade-history
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-trade-history
     * @see https://www.kucoin.com/docs-new/rest/ua/get-trade-history
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * Check fetchMySpotTrades() and fetchMyContractTrades() for more details on the extra parameters that can be used in params
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let marketType = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        [marketType, params] = this.handleMarketTypeAndParams('fetchMyTrades', market, params);
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'uta', uta);
        if (uta) {
            params = this.extend(params, { 'marketType': marketType });
            return await this.fetchMyUtaTrades(symbol, since, limit, params);
        }
        if ((marketType === 'spot') || (marketType === 'margin')) {
            return await this.fetchMySpotTrades(symbol, since, limit, params);
        }
        else {
            return await this.fetchMyContractTrades(symbol, since, limit, params);
        }
    }
    /**
     * @method
     * @name kucoin#fetchMySpotTrades
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-trade-history
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-trade-history
     * @description fetch all spot trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {bool} [params.hf] false, // true for hf order
     * @param {string} [params.marginMode] 'cross' or 'isolated', only for margin trades
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMySpotTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchMyTrades', symbol, since, limit, params);
        }
        let request = {};
        let hf = undefined;
        [hf, params] = this.handleHfAndParams(params);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchMyTrades', params);
        const isMargin = marginMode !== undefined;
        if (isMargin) {
            hf = true;
            request['tradeType'] = this.safeString(this.options['marginModes'], marginMode, marginMode);
        }
        if (hf && symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMyTrades() requires a symbol parameter for hf or margin orders');
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        const method = this.options['fetchMyTradesMethod'];
        let parseResponseData = false;
        let response = undefined;
        [request, params] = this.handleUntilOption('endAt', request, params);
        if (hf) {
            // does not return trades earlier than 2019-02-18T00:00:00Z
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            if (since !== undefined) {
                // only returns trades up to one week after the since param
                request['startAt'] = since;
            }
            if (isMargin) {
                response = await this.privateGetHfMarginFills(this.extend(request, params));
            }
            else {
                response = await this.privateGetHfFills(this.extend(request, params));
            }
        }
        else if (method === 'private_get_fills') {
            // does not return trades earlier than 2019-02-18T00:00:00Z
            if (since !== undefined) {
                // only returns trades up to one week after the since param
                request['startAt'] = since;
            }
            response = await this.privateGetFills(this.extend(request, params));
        }
        else if (method === 'private_get_limit_fills') {
            // does not return trades earlier than 2019-02-18T00:00:00Z
            // takes no params
            // only returns first 1000 trades (not only "in the last 24 hours" as stated in the docs)
            parseResponseData = true;
            response = await this.privateGetLimitFills(this.extend(request, params));
        }
        else {
            throw new errors.ExchangeError(this.id + ' fetchMyTradesMethod() invalid method');
        }
        //
        //     {
        //         "currentPage": 1,
        //         "pageSize": 50,
        //         "totalNum": 1,
        //         "totalPage": 1,
        //         "items": [
        //             {
        //                 "symbol":"BTC-USDT",       // symbol
        //                 "tradeId":"5c35c02709e4f67d5266954e",        // trade id
        //                 "orderId":"5c35c02703aa673ceec2a168",        // order id
        //                 "counterOrderId":"5c1ab46003aa676e487fa8e3", // counter order id
        //                 "side":"buy",              // transaction direction,include buy and sell
        //                 "liquidity":"taker",       // include taker and maker
        //                 "forceTaker":true,         // forced to become taker
        //                 "price":"0.083",           // order price
        //                 "size":"0.8424304",        // order quantity
        //                 "funds":"0.0699217232",    // order funds
        //                 "fee":"0",                 // fee
        //                 "feeRate":"0",             // fee rate
        //                 "feeCurrency":"USDT",      // charge fee currency
        //                 "stop":"",                 // stop type
        //                 "type":"limit",            // order type, e.g. limit, market, stop_limit.
        //                 "createdAt":1547026472000  // time
        //             },
        //             //------------------------------------------------------
        //             // v1 (historical) trade response structure
        //             {
        //                 "symbol": "SNOV-ETH",
        //                 "dealPrice": "0.0000246",
        //                 "dealValue": "0.018942",
        //                 "amount": "770",
        //                 "fee": "0.00001137",
        //                 "side": "sell",
        //                 "createdAt": 1540080199
        //                 "id":"5c4d389e4c8c60413f78e2e5",
        //             }
        //         ]
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        let trades = undefined;
        if (parseResponseData) {
            trades = data;
        }
        else {
            trades = this.safeList(data, 'items', []);
        }
        return this.parseTrades(trades, market, since, limit);
    }
    /**
     * @method
     * @name kucoin#fetchMyContractTrades
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-trade-history
     * @description fetch all contract trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] End time in ms
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMyContractTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchMyTrades', symbol, since, limit, params);
        }
        let request = {
        // orderId (String) [optional] Fills for a specific order (other parameters can be ignored if specified)
        // symbol (String) [optional] Symbol of the contract
        // side (String) [optional] buy or sell
        // type (String) [optional] limit, market, limit_stop or market_stop
        // startAt (long) [optional] Start time (millisecond)
        // endAt (long) [optional] End time (millisecond)
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = Math.min(1000, limit);
        }
        [request, params] = this.handleUntilOption('endAt', request, params);
        const response = await this.futuresPrivateGetFills(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //          "currentPage": 1,
        //          "pageSize": 1,
        //          "totalNum": 251915,
        //          "totalPage": 251915,
        //          "items": [
        //              {
        //                  "symbol": "XBTUSDM",  // Ticker symbol of the contract
        //                  "tradeId": "5ce24c1f0c19fc3c58edc47c",  // Trade ID
        //                  "orderId": "5ce24c16b210233c36ee321d",  // Order ID
        //                  "side": "sell",  // Transaction side
        //                  "liquidity": "taker",  // Liquidity- taker or maker
        //                  "price": "8302",  // Filled price
        //                  "size": 10,  // Filled amount
        //                  "value": "0.001204529",  // Order value
        //                  "feeRate": "0.0005",  // Floating fees
        //                  "fixFee": "0.00000006",  // Fixed fees
        //                  "feeCurrency": "XBT",  // Charging currency
        //                  "stop": "",  // A mark to the stop order type
        //                  "fee": "0.0000012022",  // Transaction fee
        //                  "orderType": "limit",  // Order type
        //                  "tradeType": "trade",  // Trade type (trade, liquidation, ADL or settlement)
        //                  "createdAt": 1558334496000,  // Time the order created
        //                  "settleCurrency": "XBT", // settlement currency
        //                  "tradeTime": 1558334496000000000 // trade time in nanosecond
        //              }
        //            ]
        //        }
        //    }
        //
        const data = this.safeDict(response, 'data', {});
        const trades = this.safeList(data, 'items', []);
        return this.parseTrades(trades, market, since, limit);
    }
    /**
     * @method
     * @name kucoin#fetchMyUtaTrades
     * @see https://www.kucoin.com/docs-new/rest/ua/get-trade-history
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve (default is 50, max is 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {string} [params.accountMode] 'unified' or 'classic', defaults to 'unified'
     * @param {string} [params.marginMode] 'cross' or 'isolated', only for margin trades
     * @param {string} [params.side] 'BUY' or 'SELL' (both if not provided)
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMyUtaTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchMyTrades', symbol, since, limit, params);
        }
        const marketType = this.safeString(params, 'marketType');
        if (marketType !== undefined) {
            params = this.omit(params, 'marketType');
        }
        let request = {};
        let isContract = false;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
            isContract = market['contract'];
        }
        else if ((marketType === 'spot') || (marketType === 'margin')) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMyTrades() requires a symbol parameter for uta spot or margin trades');
        }
        else {
            isContract = true;
        }
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchMyTrades', params);
        const tradeType = this.handleTradeType(isContract, marginMode, params);
        request['tradeType'] = tradeType;
        let accountMode = 'unified';
        [accountMode, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'accountMode', accountMode);
        request['accountMode'] = accountMode;
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        [request, params] = this.handleUntilOption('endAt', request, params);
        const response = await this.utaPrivateGetAccountModeOrderExecution(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "tradeType": "FUTURES",
        //             "lastId": 30000000000531982,
        //             "items": [
        //                 {
        //                     "orderId": "426373228194254848",
        //                     "symbol": "DOGEUSDTM",
        //                     "orderType": "MARKET",
        //                     "side": "BUY",
        //                     "tradeId": "1711108516570",
        //                     "size": "1",
        //                     "price": "0.09641",
        //                     "value": "9.641",
        //                     "executionTime": 1774468501294000000,
        //                     "fee": "0.0057846",
        //                     "feeCurrency": "USDT",
        //                     "tax": "",
        //                     "liquidityRole": "TAKER",
        //                     "fillType": "NORMAL"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const trades = this.safeList(data, 'items', []);
        return this.parseTrades(trades, market, since, limit);
    }
    /**
     * @method
     * @name kucoin#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-trade-history
     * @see https://www.kucoin.com/docs-new/rest/ua/get-trades
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-trade-history
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        // pagination is not supported on the exchange side anymore
        // if (since !== undefined) {
        //     request['startAt'] = Math.floor (since / 1000);
        // }
        // if (limit !== undefined) {
        //     request['pageSize'] = limit;
        // }
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'fetchTrades', 'uta', uta);
        let response = undefined;
        let trades = undefined;
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchTrades', market, params);
        if (uta) {
            if ((type === 'spot') || (type === 'margin')) {
                request['tradeType'] = 'SPOT';
            }
            else {
                request['tradeType'] = 'FUTURES';
            }
            response = await this.utaGetMarketTrade(this.extend(request, params));
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "tradeType": "SPOT",
            //             "list": [
            //                 {
            //                     "sequence": "18746044393340932",
            //                     "tradeId": "18746044393340932",
            //                     "price": "104355.6",
            //                     "size": "0.00011886",
            //                     "side": "sell",
            //                     "ts": 1762242540829000000
            //                 },
            //             ]
            //         }
            //     }
            //
            const data = this.safeDict(response, 'data', {});
            trades = this.safeList(data, 'list', []);
        }
        else if ((type === 'spot') || (type === 'margin')) {
            response = await this.publicGetMarketHistories(this.extend(request, params));
            //
            //     {
            //         "code": "200000",
            //         "data": [
            //             {
            //                 "sequence": "1548764654235",
            //                 "side": "sell",
            //                 "size":"0.6841354",
            //                 "price":"0.03202",
            //                 "time":1548848575203567174
            //             }
            //         ]
            //     }
            //
            trades = this.safeList(response, 'data', []);
        }
        else {
            response = await this.futuresPublicGetTradeHistory(this.extend(request, params));
            //
            //      {
            //          "code": "200000",
            //          "data": [
            //              {
            //                  "sequence": 32114961,
            //                  "side": "buy",
            //                  "size": 39,
            //                  "price": "4001.6500000000",
            //                  "takerOrderId": "61c20742f172110001e0ebe4",
            //                  "makerOrderId": "61c2073fcfc88100010fcb5d",
            //                  "tradeId": "61c2074277a0c473e69029b8",
            //                  "ts": 1640105794099993896   // filled time
            //              }
            //          ]
            //      }
            //
            trades = this.safeList(response, 'data', []);
        }
        return this.parseTrades(trades, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        if ('liquidityRole' in trade) { // property specific to myTrades from uta endpoint
            return this.parseMyUtaTrade(trade, market);
        }
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market);
        if ((market === undefined) || (market['spot'])) {
            return this.parseSpotOrUtaTrade(trade, market);
        }
        else {
            return this.parseContractTrade(trade, market);
        }
    }
    parseSpotOrUtaTrade(trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "sequence": "1548764654235",
        //         "side": "sell",
        //         "size":"0.6841354",
        //         "price":"0.03202",
        //         "time":1548848575203567174
        //     }
        //
        //     {
        //         "sequence": "1568787654360",
        //         "symbol": "BTC-USDT",
        //         "side": "buy",
        //         "size": "0.00536577",
        //         "price": "9345",
        //         "takerOrderId": "5e356c4a9f1a790008f8d921",
        //         "time": "1580559434436443257",
        //         "type": "match",
        //         "makerOrderId": "5e356bffedf0010008fa5d7f",
        //         "tradeId": "5e356c4aeefabd62c62a1ece"
        //     }
        //
        // fetchMyTrades (private) v2
        //
        //     {
        //         "symbol":"BTC-USDT",
        //         "tradeId":"5c35c02709e4f67d5266954e",
        //         "orderId":"5c35c02703aa673ceec2a168",
        //         "counterOrderId":"5c1ab46003aa676e487fa8e3",
        //         "side":"buy",
        //         "liquidity":"taker",
        //         "forceTaker":true,
        //         "price":"0.083",
        //         "size":"0.8424304",
        //         "funds":"0.0699217232",
        //         "fee":"0",
        //         "feeRate":"0",
        //         "feeCurrency":"USDT",
        //         "stop":"",
        //         "type":"limit",
        //         "createdAt":1547026472000
        //     }
        //
        // fetchMyTrades v2 alternative format since 2019-05-21 https://github.com/ccxt/ccxt/pull/5162
        //
        //     {
        //         "symbol": "OPEN-BTC",
        //         "forceTaker":  false,
        //         "orderId": "5ce36420054b4663b1fff2c9",
        //         "fee": "0",
        //         "feeCurrency": "",
        //         "type": "",
        //         "feeRate": "0",
        //         "createdAt": 1558417615000,
        //         "size": "12.8206",
        //         "stop": "",
        //         "price": "0",
        //         "funds": "0",
        //         "tradeId": "5ce390cf6e0db23b861c6e80"
        //     }
        //
        // fetchMyTrades (private) v1 (historical)
        //
        //     {
        //         "symbol": "SNOV-ETH",
        //         "dealPrice": "0.0000246",
        //         "dealValue": "0.018942",
        //         "amount": "770",
        //         "fee": "0.00001137",
        //         "side": "sell",
        //         "createdAt": 1540080199
        //         "id":"5c4d389e4c8c60413f78e2e5",
        //     }
        //
        // uta fetchTrades
        //
        //     {
        //         "sequence": "18746044393340932",
        //         "tradeId": "18746044393340932",
        //         "price": "104355.6",
        //         "size": "0.00011886",
        //         "side": "sell",
        //         "ts": 1762242540829000000
        //     }
        //
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market, '-');
        const id = this.safeString2(trade, 'tradeId', 'id');
        const orderId = this.safeString(trade, 'orderId');
        const takerOrMaker = this.safeString(trade, 'liquidity');
        let timestamp = this.safeInteger2(trade, 'time', 'ts');
        if (timestamp !== undefined) {
            timestamp = this.parseToInt(timestamp / 1000000);
        }
        else {
            timestamp = this.safeInteger(trade, 'createdAt');
            // if it's a historical v1 trade, the exchange returns timestamp in seconds
            if (('dealValue' in trade) && (timestamp !== undefined)) {
                timestamp = timestamp * 1000;
            }
        }
        const priceString = this.safeString2(trade, 'price', 'dealPrice');
        const amountString = this.safeString2(trade, 'size', 'amount');
        const side = this.safeString(trade, 'side');
        let fee = undefined;
        const feeCostString = this.safeString(trade, 'fee');
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString(trade, 'feeCurrency');
            let feeCurrency = this.safeCurrencyCode(feeCurrencyId);
            if (feeCurrency === undefined) {
                feeCurrency = (side === 'sell') ? market['quote'] : market['base'];
            }
            fee = {
                'cost': feeCostString,
                'currency': feeCurrency,
                'rate': this.safeString(trade, 'feeRate'),
            };
        }
        let type = this.safeString(trade, 'type');
        if (type === 'match') {
            type = undefined;
        }
        const costString = this.safeString2(trade, 'funds', 'dealValue');
        return this.safeTrade({
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }
    parseContractTrade(trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "sequence": 32114961,
        //         "side": "buy",
        //         "size": 39,
        //         "price": "4001.6500000000",
        //         "takerOrderId": "61c20742f172110001e0ebe4",
        //         "makerOrderId": "61c2073fcfc88100010fcb5d",
        //         "tradeId": "61c2074277a0c473e69029b8",
        //         "ts": 1640105794099993896   // filled time
        //     }
        //
        // fetchMyTrades (private) v2
        //
        //     {
        //         "symbol":"BTC-USDT",
        //         "tradeId":"5c35c02709e4f67d5266954e",
        //         "orderId":"5c35c02703aa673ceec2a168",
        //         "counterOrderId":"5c1ab46003aa676e487fa8e3",
        //         "side":"buy",
        //         "liquidity":"taker",
        //         "forceTaker":true,
        //         "price":"0.083",
        //         "size":"0.8424304",
        //         "funds":"0.0699217232",
        //         "fee":"0",
        //         "feeRate":"0",
        //         "feeCurrency":"USDT",
        //         "stop":"",
        //         "type":"limit",
        //         "createdAt":1547026472000
        //     }
        //
        // fetchMyTrades (private) v1
        //
        //    {
        //        "symbol":"DOGEUSDTM",
        //        "tradeId":"620ec41a96bab27b5f4ced56",
        //        "orderId":"620ec41a0d1d8a0001560bd0",
        //        "side":"sell",
        //        "liquidity":"taker",
        //        "forceTaker":true,
        //        "price":"0.13969",
        //        "size":1,
        //        "value":"13.969",
        //        "feeRate":"0.0006",
        //        "fixFee":"0",
        //        "feeCurrency":"USDT",
        //        "stop":"",
        //        "tradeTime":1645134874858018058,
        //        "fee":"0.0083814",
        //        "settleCurrency":"USDT",
        //        "orderType":"market",
        //        "tradeType":"trade",
        //        "createdAt":1645134874858
        //    }
        //
        // watchTrades
        //
        //    {
        //        "makerUserId": "62286a4d720edf0001e81961",
        //        "symbol": "ADAUSDTM",
        //        "sequence": 41320766,
        //        "side": "sell",
        //        "size": 2,
        //        "price": 0.35904,
        //        "takerOrderId": "636dd9da9857ba00010cfa44",
        //        "makerOrderId": "636dd9c8df149d0001e62bc8",
        //        "takerUserId": "6180be22b6ab210001fa3371",
        //        "tradeId": "636dd9da0000d400d477eca7",
        //        "ts": 1668143578987357700
        //    }
        //
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market, '-');
        const id = this.safeString2(trade, 'tradeId', 'id');
        const orderId = this.safeString(trade, 'orderId');
        const takerOrMaker = this.safeString(trade, 'liquidity');
        let timestamp = this.safeInteger(trade, 'ts');
        if (timestamp !== undefined) {
            timestamp = this.parseToInt(timestamp / 1000000);
        }
        else {
            timestamp = this.safeInteger(trade, 'createdAt');
            // if it's a historical v1 trade, the exchange returns timestamp in seconds
            if (('dealValue' in trade) && (timestamp !== undefined)) {
                timestamp = timestamp * 1000;
            }
        }
        const priceString = this.safeString2(trade, 'price', 'dealPrice');
        const amountString = this.safeString2(trade, 'size', 'amount');
        const side = this.safeString(trade, 'side');
        let fee = undefined;
        const feeCostString = this.safeString(trade, 'fee');
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString(trade, 'feeCurrency');
            let feeCurrency = this.safeCurrencyCode(feeCurrencyId);
            if (feeCurrency === undefined) {
                feeCurrency = (side === 'sell') ? market['quote'] : market['base'];
            }
            fee = {
                'cost': feeCostString,
                'currency': feeCurrency,
                'rate': this.safeString(trade, 'feeRate'),
            };
        }
        let type = this.safeString2(trade, 'type', 'orderType');
        if (type === 'match') {
            type = undefined;
        }
        let costString = this.safeString2(trade, 'funds', 'value');
        if (costString === undefined) {
            const contractSize = this.safeString(market, 'contractSize');
            const contractCost = Precise["default"].stringMul(priceString, amountString);
            costString = Precise["default"].stringMul(contractCost, contractSize);
        }
        return this.safeTrade({
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }
    parseMyUtaTrade(trade, market = undefined) {
        //
        //     {
        //         "orderId": "426373228194254848",
        //         "symbol": "DOGEUSDTM",
        //         "orderType": "MARKET",
        //         "side": "BUY",
        //         "tradeId": "1711108516570",
        //         "size": "1",
        //         "price": "0.09641",
        //         "value": "9.641",
        //         "executionTime": 1774468501294000000,
        //         "fee": "0.0057846",
        //         "feeCurrency": "USDT",
        //         "tax": "",
        //         "liquidityRole": "TAKER",
        //         "fillType": "NORMAL"
        //     }
        //
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeIntegerProduct(trade, 'executionTime', 0.000001);
        const fee = {
            'cost': this.safeString(trade, 'fee'),
            'currency': this.safeCurrencyCode(this.safeString(trade, 'feeCurrency')),
        };
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'tradeId'),
            'order': this.safeString(trade, 'orderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': this.safeStringLower(trade, 'orderType'),
            'takerOrMaker': this.safeStringLower(trade, 'liquidityRole'),
            'side': this.safeStringLower(trade, 'side'),
            'price': this.safeString(trade, 'price'),
            'amount': this.safeString(trade, 'size'),
            'cost': this.safeString(trade, 'value'),
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name kucoin#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://www.kucoin.com/docs-new/rest/account-info/trade-fee/get-actual-fee-spot-margin
     * @see https://www.kucoin.com/docs-new/rest/account-info/trade-fee/get-actual-fee-futures
     * @see https://www.kucoin.com/docs-new/rest/ua/get-actual-fee
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta) endpoint, defaults to false
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    async fetchTradingFee(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'fetchTradingFee', 'uta', uta);
        const request = {};
        let response = undefined;
        let entry = undefined;
        if (uta) {
            if (market['spot']) {
                request['tradeType'] = 'SPOT';
            }
            else {
                request['tradeType'] = 'FUTURES';
            }
            request['symbol'] = market['id'];
            response = await this.utaPrivateGetUserFeeRate(this.extend(request, params));
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "tradeType": "SPOT",
            //             "list": [
            //                 {
            //                     "symbol": "ETH-USDT",
            //                     "takerFeeRate": "0.001",
            //                     "makerFeeRate": "0.001"
            //                 }
            //             ]
            //         }
            //     }
            //
            const data = this.safeDict(response, 'data', {});
            const dataList = this.safeList(data, 'list', []);
            entry = this.safeDict(dataList, 0);
        }
        else if (market['spot']) {
            request['symbols'] = market['id'];
            response = await this.privateGetTradeFees(this.extend(request, params));
            //
            //     {
            //         "code": "200000",
            //         "data": [
            //           {
            //             "symbol": "BTC-USDT",
            //             "takerFeeRate": "0.001",
            //             "makerFeeRate": "0.001"
            //           }
            //         ]
            //     }
            //
            const data = this.safeList(response, 'data', []);
            entry = this.safeDict(data, 0);
        }
        else {
            request['symbol'] = market['id'];
            response = await this.futuresPrivateGetTradeFees(this.extend(request, params));
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "symbol": "ETHUSDTM",
            //             "takerFeeRate": "0.0006",
            //             "makerFeeRate": "0.0002",
            //             "feeTaxRate": "0"
            //         }
            //     }
            //
            entry = this.safeDict(response, 'data');
        }
        const marketId = this.safeString(entry, 'symbol');
        return {
            'info': response,
            'symbol': this.safeSymbol(marketId, market),
            'maker': this.safeNumber(entry, 'makerFeeRate'),
            'taker': this.safeNumber(entry, 'takerFeeRate'),
            'percentage': true,
            'tierBased': true,
        };
    }
    /**
     * @method
     * @name kucoin#withdraw
     * @description make a withdrawal
     * @see https://www.kucoin.com/docs-new/rest/account-info/withdrawals/withdraw-v3
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        await this.loadMarkets();
        this.checkAddress(address);
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
            'toAddress': address,
            'withdrawType': 'ADDRESS',
            // 'memo': tag,
            // 'isInner': false, // internal transfer or external withdrawal
            // 'remark': 'optional',
            // 'chain': 'OMNI', // 'ERC20', 'TRC20', default is ERC20, This only apply for multi-chain currency, and there is no need for single chain currency.
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode !== undefined) {
            request['chain'] = this.networkCodeToId(networkCode).toLowerCase();
        }
        request['amount'] = parseFloat(this.currencyToPrecision(code, amount, networkCode));
        let includeFee = undefined;
        [includeFee, params] = this.handleOptionAndParams(params, 'withdraw', 'includeFee', false);
        if (includeFee) {
            request['feeDeductType'] = 'INTERNAL';
        }
        const response = await this.privatePostWithdrawals(this.extend(request, params));
        //
        // the id is inside "data"
        //
        //     {
        //         "code":  200000,
        //         "data": {
        //             "withdrawalId":  "5bffb63303aa675e8bbe18f9"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseTransaction(data, currency);
    }
    parseTransactionStatus(status) {
        const statuses = {
            'SUCCESS': 'ok',
            'PROCESSING': 'pending',
            'WALLET_PROCESSING': 'pending',
            'FAILURE': 'failed',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "address": "0x5f047b29041bcfdbf0e4478cdfa753a336ba6989",
        //         "memo": "5c247c8a03aa677cea2a251d",
        //         "amount": 1,
        //         "fee": 0.0001,
        //         "currency": "KCS",
        //         "chain": "",
        //         "isInner": false,
        //         "walletTxId": "5bbb57386d99522d9f954c5a@test004",
        //         "status": "SUCCESS",
        //         "createdAt": 1544178843000,
        //         "updatedAt": 1544178891000
        //         "remark":"foobar"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "id": "5c2dc64e03aa675aa263f1ac",
        //         "address": "0x5bedb060b8eb8d823e2414d82acce78d38be7fe9",
        //         "memo": "",
        //         "currency": "ETH",
        //         "chain": "",
        //         "amount": 1.0000000,
        //         "fee": 0.0100000,
        //         "walletTxId": "3e2414d82acce78d38be7fe9",
        //         "isInner": false,
        //         "status": "FAILURE",
        //         "createdAt": 1546503758000,
        //         "updatedAt": 1546504603000
        //         "remark":"foobar"
        //     }
        //
        // withdraw
        //
        //     {
        //         "withdrawalId":  "5bffb63303aa675e8bbe18f9"
        //     }
        //
        const currencyId = this.safeString(transaction, 'currency');
        const code = this.safeCurrencyCode(currencyId, currency);
        let address = this.safeString(transaction, 'address');
        const amount = this.safeString(transaction, 'amount');
        let txid = this.safeString(transaction, 'walletTxId');
        if (txid !== undefined) {
            const txidParts = txid.split('@');
            const numTxidParts = txidParts.length;
            if (numTxidParts > 1) {
                if (address === undefined) {
                    if (txidParts[1].length > 1) {
                        address = txidParts[1];
                    }
                }
            }
            txid = txidParts[0];
        }
        let type = (txid === undefined) ? 'withdrawal' : 'deposit';
        const rawStatus = this.safeString(transaction, 'status');
        let fee = undefined;
        const feeCost = this.safeString(transaction, 'fee');
        if (feeCost !== undefined) {
            let rate = undefined;
            if (amount !== undefined) {
                rate = Precise["default"].stringDiv(feeCost, amount);
            }
            fee = {
                'cost': this.parseNumber(feeCost),
                'rate': this.parseNumber(rate),
                'currency': code,
            };
        }
        let timestamp = this.safeInteger2(transaction, 'createdAt', 'createAt');
        let updated = this.safeInteger(transaction, 'updatedAt');
        const isV1 = !('createdAt' in transaction);
        // if it's a v1 structure
        if (isV1) {
            type = ('address' in transaction) ? 'withdrawal' : 'deposit';
            if (timestamp !== undefined) {
                timestamp = timestamp * 1000;
            }
            if (updated !== undefined) {
                updated = updated * 1000;
            }
        }
        const internal = this.safeBool(transaction, 'isInner');
        const tag = this.safeString(transaction, 'memo');
        return {
            'info': transaction,
            'id': this.safeString2(transaction, 'id', 'withdrawalId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': this.networkIdToCode(this.safeString(transaction, 'chain')),
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'currency': code,
            'amount': this.parseNumber(amount),
            'txid': txid,
            'type': type,
            'status': this.parseTransactionStatus(rawStatus),
            'comment': this.safeString(transaction, 'remark'),
            'internal': internal,
            'fee': fee,
            'updated': updated,
        };
    }
    /**
     * @method
     * @name kucoin#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://www.kucoin.com/docs-new/rest/account-info/deposit/get-deposit-history
     * @see https://www.kucoin.com/docs/rest/funding/deposit/get-deposit-list
     * @see https://www.kucoin.com/docs/rest/funding/deposit/get-v1-historical-deposits-list
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] *main account only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.accountType] 'main' or 'contract' (default is 'main')
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let accountType = 'main';
        [accountType, params] = this.handleOptionAndParams(params, 'fetchDeposits', 'accountType', accountType);
        const accountsByType = this.safeDict(this.options, 'accountsByType', {});
        accountType = this.safeString(accountsByType, accountType, accountType);
        if (accountType === 'contract') {
            return await this.fetchContractDeposits(code, since, limit, params);
        }
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchDeposits', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchDeposits', code, since, limit, params);
        }
        let request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        [request, params] = this.handleUntilOption('endAt', request, params);
        let response = undefined;
        if (since !== undefined && since < 1550448000000) {
            // if since is earlier than 2019-02-18T00:00:00Z
            request['startAt'] = this.parseToInt(since / 1000);
            response = await this.privateGetHistDeposits(this.extend(request, params));
        }
        else {
            if (since !== undefined) {
                request['startAt'] = since;
            }
            response = await this.privateGetDeposits(this.extend(request, params));
        }
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "currentPage": 1,
        //             "pageSize": 5,
        //             "totalNum": 2,
        //             "totalPage": 1,
        //             "items": [
        //                 //--------------------------------------------------
        //                 // version 2 deposit response structure
        //                 {
        //                     "address": "0x5f047b29041bcfdbf0e4478cdfa753a336ba6989",
        //                     "memo": "5c247c8a03aa677cea2a251d",
        //                     "amount": 1,
        //                     "fee": 0.0001,
        //                     "currency": "KCS",
        //                     "isInner": false,
        //                     "walletTxId": "5bbb57386d99522d9f954c5a@test004",
        //                     "status": "SUCCESS",
        //                     "createdAt": 1544178843000,
        //                     "updatedAt": 1544178891000
        //                     "remark":"foobar"
        //                 },
        //                 //--------------------------------------------------
        //                 // version 1 (historical) deposit response structure
        //                 {
        //                     "currency": "BTC",
        //                     "createAt": 1528536998,
        //                     "amount": "0.03266638",
        //                     "walletTxId": "55c643bc2c68d6f17266383ac1be9e454038864b929ae7cee0bc408cc5c869e8@12ffGWmMMD1zA1WbFm7Ho3JZ1w6NYXjpFk@234",
        //                     "isInner": false,
        //                     "status": "SUCCESS",
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const items = this.safeList(data, 'items', []);
        return this.parseTransactions(items, currency, since, limit, { 'type': 'deposit' });
    }
    /**
     * @method
     * @name kucoin#fetchContractDeposits
     * @description helper method for fetching deposits for futures accounts
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchContractDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        const response = await this.futuresPrivateGetDepositList(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "currentPage": 1,
        //             "pageSize": 5,
        //             "totalNum": 2,
        //             "totalPage": 1,
        //             "items": [
        //                 {
        //                     "address": "0x5f047b29041bcfdbf0e4478cdfa753a336ba6989",
        //                     "memo": "5c247c8a03aa677cea2a251d",
        //                     "amount": 1,
        //                     "fee": 0.0001,
        //                     "currency": "KCS",
        //                     "isInner": false,
        //                     "walletTxId": "5bbb57386d99522d9f954c5a@test004",
        //                     "status": "SUCCESS",
        //                     "createdAt": 1544178843000,
        //                     "updatedAt": 1544178891000
        //                     "remark":"foobar"
        //                 },
        //                 ...
        //             ]
        //         }
        //     }
        //
        const responseData = response['data']['items'];
        return this.parseTransactions(responseData, currency, since, limit, { 'type': 'deposit' });
    }
    /**
     * @method
     * @name kucoin#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://www.kucoin.com/docs-new/rest/account-info/withdrawals/get-withdrawal-history
     * @see https://www.kucoin.com/docs/rest/funding/withdrawals/get-withdrawals-list
     * @see https://www.kucoin.com/docs/rest/funding/withdrawals/get-v1-historical-withdrawals-list
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] *main account only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.accountType] 'main' or 'contract' (default is 'main')
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let accountType = 'main';
        [accountType, params] = this.handleOptionAndParams(params, 'fetchWithdrawals', 'accountType', accountType);
        const accountsByType = this.safeDict(this.options, 'accountsByType', {});
        accountType = this.safeString(accountsByType, accountType, accountType);
        if (accountType === 'contract') {
            return await this.fetchContractWithdrawals(code, since, limit, params);
        }
        const maxLimit = 500;
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchWithdrawals', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchWithdrawals', code, since, limit, params, maxLimit);
        }
        let request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        [request, params] = this.handleUntilOption('endAt', request, params);
        let response = undefined;
        if (since !== undefined && since < 1550448000000) {
            // if since is earlier than 2019-02-18T00:00:00Z
            request['startAt'] = this.parseToInt(since / 1000);
            response = await this.privateGetHistWithdrawals(this.extend(request, params));
        }
        else {
            if (since !== undefined) {
                request['startAt'] = since;
            }
            response = await this.privateGetWithdrawals(this.extend(request, params));
        }
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "currentPage": 1,
        //             "pageSize": 5,
        //             "totalNum": 2,
        //             "totalPage": 1,
        //             "items": [
        //                 //--------------------------------------------------
        //                 // version 2 withdrawal response structure
        //                 {
        //                     "id": "5c2dc64e03aa675aa263f1ac",
        //                     "address": "0x5bedb060b8eb8d823e2414d82acce78d38be7fe9",
        //                     "memo": "",
        //                     "currency": "ETH",
        //                     "amount": 1.0000000,
        //                     "fee": 0.0100000,
        //                     "walletTxId": "3e2414d82acce78d38be7fe9",
        //                     "isInner": false,
        //                     "status": "FAILURE",
        //                     "createdAt": 1546503758000,
        //                     "updatedAt": 1546504603000
        //                 },
        //                 //--------------------------------------------------
        //                 // version 1 (historical) withdrawal response structure
        //                 {
        //                     "currency": "BTC",
        //                     "createAt": 1526723468,
        //                     "amount": "0.534",
        //                     "address": "33xW37ZSW4tQvg443Pc7NLCAs167Yc2XUV",
        //                     "walletTxId": "aeacea864c020acf58e51606169240e96774838dcd4f7ce48acf38e3651323f4",
        //                     "isInner": false,
        //                     "status": "SUCCESS"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const items = this.safeList(data, 'items', []);
        return this.parseTransactions(items, currency, since, limit, { 'type': 'withdrawal' });
    }
    /**
     * @method
     * @name kucoin#fetchContractWithdrawals
     * @description helper method for fetching withdrawals for futures accounts
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchContractWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        const response = await this.futuresPrivateGetWithdrawalList(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "currentPage": 1,
        //             "pageSize": 5,
        //             "totalNum": 2,
        //             "totalPage": 1,
        //             "items": [
        //                 {
        //                     "id": "5c2dc64e03aa675aa263f1ac",
        //                     "address": "0x5bedb060b8eb8d823e2414d82acce78d38be7fe9",
        //                     "memo": "",
        //                     "currency": "ETH",
        //                     "amount": 1.0000000,
        //                     "fee": 0.0100000,
        //                     "walletTxId": "3e2414d82acce78d38be7fe9",
        //                     "isInner": false,
        //                     "status": "FAILURE",
        //                     "createdAt": 1546503758000,
        //                     "updatedAt": 1546504603000
        //                 },
        //                 ...
        //             ]
        //         }
        //     }
        //
        const responseData = response['data']['items'];
        return this.parseTransactions(responseData, currency, since, limit, { 'type': 'withdrawal' });
    }
    parseBalanceHelper(entry) {
        const account = this.account();
        account['used'] = this.safeString2(entry, 'holdBalance', 'hold');
        account['free'] = this.safeString2(entry, 'availableBalance', 'available');
        account['total'] = this.safeString2(entry, 'totalBalance', 'total');
        const debt = this.safeString(entry, 'liability');
        const interest = this.safeString(entry, 'interest');
        account['debt'] = Precise["default"].stringAdd(debt, interest);
        return account;
    }
    /**
     * @method
     * @name kucoin#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-detail-spot
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-cross-margin
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-isolated-margin
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-futures
     * @see https://www.kucoin.com/docs-new/rest/ua/get-account-currency-assets-uta
     * @see https://www.kucoin.com/docs-new/rest/ua/get-account-currency-assets-classic
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.marginMode] 'cross' or 'isolated', margin type for fetching margin balance
     * @param {object} [params.type] extra parameters specific to the exchange API endpoint
     * @param {object} [params.hf] *default if false* if true, the result includes the balance of the high frequency account
     * @param {boolean} [params.uta] set to true for the unified trading account (uta) endpoint, defaults to false
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'fetchBalance', 'uta', uta);
        if (uta) {
            return await this.fetchUtaBalance(params);
        }
        let response = undefined;
        const request = {};
        const code = this.safeString(params, 'code');
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        let requestedType = 'spot';
        [requestedType, params] = this.handleMarketTypeAndParams('fetchBalance', undefined, params);
        const accountsByType = this.safeDict(this.options, 'accountsByType', {});
        let type = this.safeString(accountsByType, requestedType, requestedType);
        params = this.omit(params, 'type');
        if (type === 'contract') {
            return await this.fetchContractBalance(params);
        }
        let hf = undefined;
        [hf, params] = this.handleHfAndParams(params);
        if (hf && (type !== 'main')) {
            type = 'trade_hf';
        }
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchBalance', params);
        const isolated = (marginMode === 'isolated') || (type === 'isolated');
        const cross = (marginMode === 'cross') || (type === 'margin');
        if (isolated) {
            if (currency !== undefined) {
                request['balanceCurrency'] = currency['id'];
            }
            response = await this.privateGetIsolatedAccounts(this.extend(request, params));
        }
        else if (cross) {
            response = await this.privateGetMarginAccount(this.extend(request, params));
        }
        else {
            if (currency !== undefined) {
                request['currency'] = currency['id'];
            }
            request['type'] = type;
            response = await this.privateGetAccounts(this.extend(request, params));
        }
        //
        // Spot
        //
        //    {
        //        "code": "200000",
        //        "data": [
        //            {
        //                "balance": "0.00009788",
        //                "available": "0.00009788",
        //                "holds": "0",
        //                "currency": "BTC",
        //                "id": "5c6a4fd399a1d81c4f9cc4d0",
        //                "type": "trade",
        //            },
        //        ]
        //    }
        //
        // Cross
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "debtRatio": "0",
        //             "accounts": [
        //                 {
        //                     "currency": "USDT",
        //                     "totalBalance": "5",
        //                     "availableBalance": "5",
        //                     "holdBalance": "0",
        //                     "liability": "0",
        //                     "maxBorrowSize": "20"
        //                 },
        //             ]
        //         }
        //     }
        //
        // Isolated
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "totalAssetOfQuoteCurrency": "0",
        //            "totalLiabilityOfQuoteCurrency": "0",
        //            "timestamp": 1712085661155,
        //            "assets": [
        //                {
        //                    "symbol": "MANA-USDT",
        //                    "status": "EFFECTIVE",
        //                    "debtRatio": "0",
        //                    "baseAsset": {
        //                        "currency": "MANA",
        //                        "borrowEnabled": true,
        //                        "transferInEnabled": true,
        //                        "total": "0",
        //                        "hold": "0",
        //                        "available": "0",
        //                        "liability": "0",
        //                        "interest": "0",
        //                        "maxBorrowSize": "0"
        //                    },
        //                    "quoteAsset": {
        //                        "currency": "USDT",
        //                        "borrowEnabled": true,
        //                        "transferInEnabled": true,
        //                        "total": "0",
        //                        "hold": "0",
        //                        "available": "0",
        //                        "liability": "0",
        //                        "interest": "0",
        //                        "maxBorrowSize": "0"
        //                    }
        //                },
        //                ...
        //            ]
        //        }
        //    }
        //
        let data = undefined;
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        if (isolated) {
            data = this.safeDict(response, 'data', {});
            const assets = this.safeValue(data, 'assets', data);
            for (let i = 0; i < assets.length; i++) {
                const entry = assets[i];
                const marketId = this.safeString(entry, 'symbol');
                const symbol = this.safeSymbol(marketId, undefined, '_');
                const base = this.safeDict(entry, 'baseAsset', {});
                const quote = this.safeDict(entry, 'quoteAsset', {});
                const baseCode = this.safeCurrencyCode(this.safeString(base, 'currency'));
                const quoteCode = this.safeCurrencyCode(this.safeString(quote, 'currency'));
                const subResult = {};
                subResult[baseCode] = this.parseBalanceHelper(base);
                subResult[quoteCode] = this.parseBalanceHelper(quote);
                result[symbol] = this.safeBalance(subResult);
            }
        }
        else if (cross) {
            data = this.safeDict(response, 'data', {});
            const accounts = this.safeList(data, 'accounts', []);
            for (let i = 0; i < accounts.length; i++) {
                const balance = accounts[i];
                const currencyId = this.safeString(balance, 'currency');
                const codeInner = this.safeCurrencyCode(currencyId);
                result[codeInner] = this.parseBalanceHelper(balance);
            }
        }
        else {
            data = this.safeList(response, 'data', []);
            for (let i = 0; i < data.length; i++) {
                const balance = data[i];
                const balanceType = this.safeString(balance, 'type');
                if (balanceType === type) {
                    const currencyId = this.safeString(balance, 'currency');
                    const codeInner2 = this.safeCurrencyCode(currencyId);
                    const account = this.account();
                    account['total'] = this.safeString(balance, 'balance');
                    account['free'] = this.safeString(balance, 'available');
                    account['used'] = this.safeString(balance, 'holds');
                    result[codeInner2] = account;
                }
            }
        }
        let returnType = result;
        if (!isolated) {
            returnType = this.safeBalance(result);
        }
        return returnType;
    }
    /**
     * @method
     * @name kucoin#fetchContractBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-futures
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.code] the unified currency code to fetch the balance for, if not provided, the default .options['fetchBalance']['code'] will be used
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchContractBalance(params = {}) {
        await this.loadMarkets();
        // only fetches one balance at a time
        let defaultCode = this.safeString(this.options, 'code');
        const fetchBalanceOptions = this.safeValue(this.options, 'fetchBalance', {});
        defaultCode = this.safeString(fetchBalanceOptions, 'code', defaultCode);
        const code = this.safeString(params, 'code', defaultCode);
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.futuresPrivateGetAccountOverview(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "accountEquity": 0.00005,
        //             "unrealisedPNL": 0,
        //             "marginBalance": 0.00005,
        //             "positionMargin": 0,
        //             "orderMargin": 0,
        //             "frozenFunds": 0,
        //             "availableBalance": 0.00005,
        //             "currency": "XBT"
        //         }
        //     }
        //
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const data = this.safeValue(response, 'data');
        const currencyId = this.safeString(data, 'currency');
        const currencyCode = this.safeCurrencyCode(currencyId, currency);
        const account = this.account();
        account['free'] = this.safeString(data, 'availableBalance');
        account['total'] = this.safeString(data, 'accountEquity');
        result[currencyCode] = account;
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name kucoin#fetchUtaBalance
     * @description helper method for fetching balance with unified trading account (uta) endpoint
     * @see https://www.kucoin.com/docs-new/rest/ua/get-account-currency-assets-uta
     * @see https://www.kucoin.com/docs-new/rest/ua/get-account-currency-assets-classic
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot', 'unified', 'funding', 'cross', 'isolated' or 'swap' (default is 'spot')
     * @param {string} [params.marginMode] 'cross' or 'isolated', margin type for fetching margin balance, only applicable if type is margin (default is cross)
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchUtaBalance(params = {}) {
        await this.loadMarkets();
        let requestedType = undefined;
        [requestedType, params] = this.handleMarketTypeAndParams('fetchUtaBalance', undefined, params);
        if (requestedType === 'margin') {
            // assume cross margin if margin is specified but marginMode is not specified
            let marginMode = 'cross';
            [marginMode, params] = this.handleMarginModeAndParams('fetchUtaBalance', params, marginMode);
            requestedType = marginMode;
        }
        const utaAccountsByType = this.safeDict(this.options, 'utaAccountsByType', {});
        let type = undefined;
        type = this.safeString(utaAccountsByType, requestedType, type);
        const isIsolated = (type === 'ISOLATED');
        const request = {};
        let response = undefined;
        if (type === 'unified') {
            request['accountMode'] = type;
            // uta
            //     {
            //         "code": "200000",
            //         "data": {
            //             "accountType": "UNIFIED",
            //             "ts": 1764731696945,
            //             "accounts": [
            //                 {
            //                     "currencies": [
            //                         {
            //                             "currency": "USDT",
            //                             "equity": "97.9936711985",
            //                             "hold": "0.0000000000",
            //                             "balance": "97.9936711985",
            //                             "available": "97.9936711985",
            //                             "liability": "0.0000000000"
            //                         },
            //                         {
            //                             "currency": "BTC",
            //                             "equity": "0.0000216000",
            //                             "hold": "0.0000000000",
            //                             "balance": "0.0000216000",
            //                             "available": "0.0000216000",
            //                             "liability": "0.0000000000"
            //                         }
            //                     ]
            //                 }
            //             ]
            //         }
            //     }
            //
            response = await this.utaPrivateGetAccountModeAccountBalance(this.extend(request, params));
        }
        else {
            request['accountType'] = type;
            //
            // isolated
            //     {
            //         "code": "200000",
            //         "data": {
            //             "accountType": "ISOLATED",
            //             "ts": 1774244660519,
            //             "accounts": [
            //                 {
            //                     "accountSubtype": "LTC-USDT",
            //                     "riskRatio": "0",
            //                     "currencies": [
            //                         {
            //                             "currency": "LTC",
            //                             "hold": "0",
            //                             "available": "0",
            //                             "liability": "0",
            //                             "balance": "0",
            //                             "equity": "0"},{
            //                             "currency": "USDT",
            //                             "hold": "0",
            //                             "available": "6",
            //                             "liability": "0",
            //                             "balance": "6",
            //                             "equity": "6"
            //                         }
            //                     ]
            //                 }
            //             ]
            //         }
            //     }
            //
            response = await this.utaPrivateGetAccountBalance(this.extend(request, params));
        }
        const data = this.safeDict(response, 'data', {});
        const timestamp = this.safeInteger(data, 'ts');
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
        const accounts = this.safeList(data, 'accounts', []);
        if (isIsolated) {
            for (let i = 0; i < accounts.length; i++) {
                const entry = accounts[i];
                const marketId = this.safeString(entry, 'accountSubtype');
                const symbol = this.safeSymbol(marketId, undefined, '-');
                const subResult = {};
                const currencies = this.safeList(entry, 'currencies', []);
                for (let j = 0; j < currencies.length; j++) {
                    const currencyEntry = this.safeDict(currencies, j, {});
                    const currencyId = this.safeString(currencyEntry, 'currency');
                    const currencyCode = this.safeCurrencyCode(currencyId);
                    subResult[currencyCode] = this.parseBalanceHelper(currencyEntry);
                }
                result[symbol] = this.safeBalance(subResult);
            }
        }
        else {
            const firstAccount = this.safeDict(accounts, 0, {});
            const currencies = this.safeList(firstAccount, 'currencies', []);
            for (let i = 0; i < currencies.length; i++) {
                const currencyEntry = this.safeDict(currencies, i, {});
                const currencyId = this.safeString(currencyEntry, 'currency');
                const currencyCode = this.safeCurrencyCode(currencyId);
                result[currencyCode] = this.parseBalanceHelper(currencyEntry);
            }
        }
        let returnType = result;
        if (!isIsolated) {
            returnType = this.safeBalance(result);
        }
        return returnType;
    }
    /**
     * @method
     * @name kucoin#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://www.kucoin.com/docs-new/rest/account-info/transfer/flex-transfer?lang=en_US&
     * @see https://www.kucoin.com/docs-new/rest/ua/flex-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta) endpoint, defaults to false
     * Check transferClassic() and transferUta() for more details on params
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'transfer', 'uta', uta);
        if (uta) {
            return await this.transferUta(code, amount, fromAccount, toAccount, params);
        }
        return await this.transferClassic(code, amount, fromAccount, toAccount, params);
    }
    /**
     * @method
     * @name kucoin#transferUta
     * @description transfer currency internally between wallets on the same account with uta endpoint
     * @see https://www.kucoin.com/docs-new/rest/ua/flex-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.transferType] INTERNAL, PARENT_TO_SUB, SUB_TO_PARENT, SUB_TO_SUB (default is INTERNAL)
     * @param {string} [params.fromUserId] required if transferType is SUB_TO_PARENT or SUB_TO_SUB
     * @param {string} [params.toUserId] required if transferType is PARENT_TO_SUB or SUB_TO_SUB
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async transferUta(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const requestedAmount = this.currencyToPrecision(code, amount);
        const request = {
            'currency': currency['id'],
            'amount': requestedAmount,
        };
        let transferType = 'INTERNAL';
        [transferType, params] = this.handleParamString2(params, 'transferType', 'type', transferType);
        let fromUserId = undefined;
        [fromUserId, params] = this.handleParamString2(params, 'fromUserId', 'fromUid', fromUserId);
        let toUserId = undefined;
        [toUserId, params] = this.handleParamString2(params, 'toUserId', 'toUid', toUserId);
        if (transferType === 'PARENT_TO_SUB' || transferType === 'SUB_TO_SUB') {
            if (toUserId === undefined) {
                throw new errors.ExchangeError(this.id + ' transfer() requires a toUserId param for PARENT_TO_SUB or SUB_TO_SUB transfers');
            }
            else {
                request['toUid'] = toUserId;
            }
        }
        else if (transferType === 'SUB_TO_PARENT' || transferType === 'SUB_TO_SUB') {
            if (fromUserId === undefined) {
                throw new errors.ExchangeError(this.id + ' transfer() requires a fromUserId param for SUB_TO_PARENT or SUB_TO_SUB transfers');
            }
            else {
                request['fromUid'] = fromUserId;
            }
        }
        let clientOid = this.uuid();
        [clientOid, params] = this.handleParamString2(params, 'clientOid', 'clientOrderId', clientOid);
        request['clientOid'] = clientOid;
        let fromId = this.convertTypeToAccount(fromAccount);
        let toId = this.convertTypeToAccount(toAccount);
        const fromIsolated = this.inArray(fromId, this.ids);
        const toIsolated = this.inArray(toId, this.ids);
        if (fromIsolated) {
            request['fromAccountSymbol'] = fromId;
            fromId = 'ISOLATED';
        }
        if (toIsolated) {
            request['toAccountSymbol'] = toId;
            toId = 'ISOLATED';
        }
        const utaAccountsByType = this.safeDict(this.options, 'utaAccountsByType', {});
        fromId = this.safeString(utaAccountsByType, fromId, fromId);
        toId = this.safeString(utaAccountsByType, toId, toId);
        request['fromAccountType'] = fromId.toUpperCase();
        request['toAccountType'] = toId.toUpperCase();
        const types = {
            'INTERNAL': '0',
            'PARENT_TO_SUB': '1',
            'SUB_TO_PARENT': '2',
            'SUB_TO_SUB': '3',
        };
        request['type'] = this.safeString(types, transferType, transferType);
        const response = await this.utaPrivatePostAccountTransfer(this.extend(request, params));
        //
        //
        const data = this.safeDict(response, 'data');
        const transfer = this.parseTransfer(data, currency);
        const transferOptions = this.safeDict(this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeBool(transferOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            transfer['amount'] = amount;
            transfer['fromAccount'] = fromAccount;
            transfer['toAccount'] = toAccount;
            transfer['status'] = 'ok';
        }
        return transfer;
    }
    /**
     * @method
     * @name kucoin#transferClassic
     * @description transfer currency internally between wallets on the same account with classic endpoints
     * @see https://www.kucoin.com/docs-new/rest/account-info/transfer/flex-transfer?lang=en_US&
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.transferType] INTERNAL, PARENT_TO_SUB, SUB_TO_PARENT (default is INTERNAL)
     * @param {string} [params.fromUserId] required if transferType is SUB_TO_PARENT
     * @param {string} [params.toUserId] required if transferType is PARENT_TO_SUB
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async transferClassic(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const requestedAmount = this.currencyToPrecision(code, amount);
        const request = {
            'currency': currency['id'],
            'amount': requestedAmount,
        };
        let transferType = 'INTERNAL';
        [transferType, params] = this.handleParamString2(params, 'transferType', 'type', transferType);
        if (transferType === 'PARENT_TO_SUB') {
            if (!('toUserId' in params)) {
                throw new errors.ExchangeError(this.id + ' transfer() requires a toUserId param for PARENT_TO_SUB transfers');
            }
        }
        else if (transferType === 'SUB_TO_PARENT') {
            if (!('fromUserId' in params)) {
                throw new errors.ExchangeError(this.id + ' transfer() requires a fromUserId param for SUB_TO_PARENT transfers');
            }
        }
        if (!('clientOid' in params)) {
            request['clientOid'] = this.uuid();
        }
        let fromId = this.convertTypeToAccount(fromAccount);
        let toId = this.convertTypeToAccount(toAccount);
        const fromIsolated = this.inArray(fromId, this.ids);
        const toIsolated = this.inArray(toId, this.ids);
        if (fromIsolated) {
            request['fromAccountTag'] = fromId;
            fromId = 'isolated';
        }
        if (toIsolated) {
            request['toAccountTag'] = toId;
            toId = 'isolated';
        }
        const hfOrMining = this.isHfOrMining(fromId, toId);
        let response = undefined;
        if (hfOrMining) {
            // new endpoint does not support hf and mining transfers
            // use old endpoint for hf and mining transfers
            request['from'] = fromId;
            request['to'] = toId;
            response = await this.privatePostAccountsInnerTransfer(this.extend(request, params));
        }
        else {
            request['type'] = transferType;
            request['fromAccountType'] = fromId.toUpperCase();
            request['toAccountType'] = toId.toUpperCase();
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "orderId": "694fcb5b08bb1600015cda75"
            //         }
            //     }
            //
            response = await this.privatePostAccountsUniversalTransfer(this.extend(request, params));
        }
        const data = this.safeDict(response, 'data');
        const transfer = this.parseTransfer(data, currency);
        const transferOptions = this.safeDict(this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeBool(transferOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            transfer['amount'] = amount;
            transfer['fromAccount'] = fromAccount;
            transfer['toAccount'] = toAccount;
            transfer['status'] = 'ok';
        }
        return transfer;
    }
    isHfOrMining(fromId, toId) {
        return (fromId === 'trade_hf' || toId === 'trade_hf' || fromId === 'pool' || toId === 'pool');
    }
    parseTransfer(transfer, currency = undefined) {
        //
        // transfer (spot)
        //
        //    {
        //        "orderId": "605a6211e657f00006ad0ad6"
        //    }
        //
        //    {
        //        "code": "200000",
        //        "msg": "Failed to transfer out. The amount exceeds the upper limit"
        //    }
        //
        // transfer (futures)
        //
        //     {
        //         "applyId": "605a87217dff1500063d485d",
        //         "bizNo": "bcd6e5e1291f4905af84dc",
        //         "payAccountType": "CONTRACT",
        //         "payTag": "DEFAULT",
        //         "remark": '',
        //         "recAccountType": "MAIN",
        //         "recTag": "DEFAULT",
        //         "recRemark": '',
        //         "recSystem": "KUCOIN",
        //         "status": "PROCESSING",
        //         "currency": "XBT",
        //         "amount": "0.00001",
        //         "fee": "0",
        //         "sn": "573688685663948",
        //         "reason": '',
        //         "createdAt": 1616545569000,
        //         "updatedAt": 1616545569000
        //     }
        //
        // ledger entry - from account ledgers API (for fetchTransfers)
        //
        // {
        //     "id": "611a1e7c6a053300067a88d9",
        //     "currency": "USDT",
        //     "amount": "10.00059547",
        //     "fee": "0",
        //     "balance": "0",
        //     "accountType": "MAIN",
        //     "bizType": "Transfer",
        //     "direction": "in",
        //     "createdAt": 1629101692950,
        //     "context": "{\"orderId\":\"611a1e7c6a053300067a88d9\"}"
        // }
        //
        // ledger entry from contracts API
        //     {
        //         "time": 1771765696000,
        //         "type": "TransferIn",
        //         "amount": 10.0,
        //         "fee": 0.0,
        //         "accountEquity": 54.53821148,
        //         "status": "Completed",
        //         "remark": "Transferred from Trading Account",
        //         "offset": 71904927,
        //         "currency": "USDT"
        //     }
        const timestamp = this.safeInteger2(transfer, 'createdAt', 'time');
        const currencyId = this.safeString(transfer, 'currency');
        const rawStatus = this.safeString(transfer, 'status');
        const bizType = this.safeString(transfer, 'bizType');
        const isLedgerEntry = (bizType !== undefined);
        let accountFromRaw = undefined;
        let accountToRaw = undefined;
        if (isLedgerEntry) {
            // Ledger entry format: uses accountType + direction
            const accountType = this.safeStringLower(transfer, 'accountType');
            const direction = this.safeString(transfer, 'direction');
            if (direction === 'out') {
                accountFromRaw = accountType;
            }
            else if (direction === 'in') {
                accountToRaw = accountType;
            }
        }
        else {
            // Transfer API format: uses payAccountType/recAccountType
            accountFromRaw = this.safeStringLower(transfer, 'payAccountType');
            accountToRaw = this.safeStringLower(transfer, 'recAccountType');
        }
        const accountsByType = this.safeDict(this.options, 'accountsByType');
        const accountFrom = this.safeString(accountsByType, accountFromRaw, accountFromRaw);
        const accountTo = this.safeString(accountsByType, accountToRaw, accountToRaw);
        return {
            'id': this.safeStringN(transfer, ['id', 'applyId', 'orderId']),
            'currency': this.safeCurrencyCode(currencyId, currency),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'amount': this.safeNumber(transfer, 'amount'),
            'fromAccount': accountFrom,
            'toAccount': accountTo,
            'status': this.parseTransferStatus(rawStatus),
            'info': transfer,
        };
    }
    parseTransferStatus(status) {
        const statuses = {
            'PROCESSING': 'pending',
        };
        return this.safeString(statuses, status, status);
    }
    parseLedgerEntryType(type) {
        const types = {
            'Assets Transferred in After Upgrading': 'transfer',
            'Deposit': 'transaction',
            'Withdrawal': 'transaction',
            'Transfer': 'transfer',
            'Trade_Exchange': 'trade',
            // 'Vote for Coin': 'Vote for Coin', // Vote for Coin
            'KuCoin Bonus': 'bonus',
            'Referral Bonus': 'referral',
            'Rewards': 'bonus',
            // 'Distribution': 'Distribution', // Distribution, such as get GAS by holding NEO
            'Airdrop/Fork': 'airdrop',
            'Other rewards': 'bonus',
            'Fee Rebate': 'rebate',
            'Buy Crypto': 'trade',
            'Sell Crypto': 'sell',
            'Public Offering Purchase': 'trade',
            // 'Send red envelope': 'Send red envelope', // Send red envelope
            // 'Open red envelope': 'Open red envelope', // Open red envelope
            // 'Staking': 'Staking', // Staking
            // 'LockDrop Vesting': 'LockDrop Vesting', // LockDrop Vesting
            // 'Staking Profits': 'Staking Profits', // Staking Profits
            // 'Redemption': 'Redemption', // Redemption
            'Refunded Fees': 'fee',
            'KCS Pay Fees': 'fee',
            'Margin Trade': 'trade',
            'Loans': 'Loans',
            // 'Borrowings': 'Borrowings', // Borrowings
            // 'Debt Repayment': 'Debt Repayment', // Debt Repayment
            // 'Loans Repaid': 'Loans Repaid', // Loans Repaid
            // 'Lendings': 'Lendings', // Lendings
            // 'Pool transactions': 'Pool transactions', // Pool-X transactions
            'Instant Exchange': 'trade',
            'Sub-account transfer': 'transfer',
            'Liquidation Fees': 'fee',
            // 'Soft Staking Profits': 'Soft Staking Profits', // Soft Staking Profits
            // 'Voting Earnings': 'Voting Earnings', // Voting Earnings on Pool-X
            // 'Redemption of Voting': 'Redemption of Voting', // Redemption of Voting on Pool-X
            // 'Voting': 'Voting', // Voting on Pool-X
            // 'Convert to KCS': 'Convert to KCS', // Convert to KCS
            'RealisedPNL': 'trade',
            'TransferIn': 'transfer',
            'TransferOut': 'transfer',
            'TRADE_EXCHANGE': 'trade',
            'TRANSFER': 'transfer',
            'SUB_TRANSFER': 'transfer',
            'RETURNED_FEES': 'fee',
            'DEDUCTION_FEES': 'fee',
            'OTHER': 'other',
            'SUB_TO_SUB_TRANSFER': 'transfer',
            'SPOT_EXCHANGE': 'trade',
            'SPOT_EXCHANGE_REBATE': 'rebate',
            'FUTURES_EXCHANGE_OPEN': 'trade',
            'FUTURES_EXCHANGE_CLOSE': 'trade',
            'FUTURES_EXCHANGE_REBATE': 'rebate',
            'FUNDING_FEE': 'fee',
            'LIABILITY_INTEREST': 'fee',
            'KCS_DEDUCTION_FEES': 'fee',
            'KCS_RETURNED_FEES': 'fee',
            'AUTO_EXCHANGE_USER': 'trade',
        };
        return this.safeString(types, type, type);
    }
    parseLedgerDirection(direction) {
        const directions = {
            'in': 'in',
            'out': 'out',
            'TransferIn': 'in',
            'TransferOut': 'out',
            'IN': 'in',
            'OUT': 'out',
        };
        return this.safeString(directions, direction, direction);
    }
    parseLedgerStatus(status) {
        const statuses = {
            'Completed': 'ok',
            'Pending': 'pending',
        };
        return this.safeString(statuses, status, status);
    }
    parseLedgerEntry(item, currency = undefined) {
        //
        //     {
        //         "id": "611a1e7c6a053300067a88d9", //unique key for each ledger entry
        //         "currency": "USDT", //Currency
        //         "amount": "10.00059547", //The total amount of assets (fees included) involved in assets changes such as transaction, withdrawal and bonus distribution.
        //         "fee": "0", //Deposit or withdrawal fee
        //         "balance": "0", //Total assets of a currency remaining funds after transaction
        //         "accountType": "MAIN", //Account Type
        //         "bizType": "Loans Repaid", //business type
        //         "direction": "in", //side, in or out
        //         "createdAt": 1629101692950, //Creation time
        //         "context": "{\"borrowerUserId\":\"601ad03e50dc810006d242ea\",\"loanRepayDetailNo\":\"611a1e7cc913d000066cf7ec\"}" //Business core parameters
        //     }
        //
        // ledger entry from contracts API
        //     {
        //         "time": 1771765696000,
        //         "type": "TransferIn",
        //         "amount": 10.0,
        //         "fee": 0.0,
        //         "accountEquity": 54.53821148,
        //         "status": "Completed",
        //         "remark": "Transferred from Trading Account",
        //         "offset": 71904927,
        //         "currency": "USDT"
        //     }
        //
        // ledger entry from UTA API
        //     {
        //         "accountType": "UNIFIED",
        //         "id": "30000000001200350",
        //         "currency": "USDT",
        //         "direction": "IN",
        //         "businessType": "TRANSFER",
        //         "amount": "30",
        //         "balance": "30",
        //         "fee": "0",
        //         "tax": "0",
        //         "remark": "Funding Account",
        //         "ts": 1774241648267000000
        //     }
        //
        const id = this.safeString(item, 'id');
        const currencyId = this.safeString(item, 'currency');
        const code = this.safeCurrencyCode(currencyId, currency);
        currency = this.safeCurrency(currencyId, currency);
        const amount = this.safeString(item, 'amount');
        const balanceAfter = this.safeNumberOmitZero(item, 'balance');
        const bizType = this.safeStringN(item, ['bizType', 'businessType', 'type']);
        const type = this.parseLedgerEntryType(bizType);
        const direction = this.safeString2(item, 'direction', 'type');
        let account = this.safeString(item, 'accountType'); // MAIN, TRADE, MARGIN, or CONTRACT
        let timestamp = this.safeInteger(item, 'createdAt');
        if (timestamp === undefined) {
            timestamp = this.safeInteger(item, 'time');
            if (timestamp !== undefined) {
                account = 'CONTRACT'; // contract ledger entries do not have an accountType field, so we set it to CONTRACT if the time field is present
            }
            else {
                timestamp = this.safeIntegerProduct(item, 'ts', 0.000001); // for UTA API
            }
        }
        const datetime = this.iso8601(timestamp);
        const context = this.safeString(item, 'context'); // contains other information about the ledger entry
        //
        // withdrawal transaction
        //
        //     "{\"orderId\":\"617bb2d09e7b3b000196dac8\",\"txId\":\"0x79bb9855f86b351a45cab4dc69d78ca09586a94c45dde49475722b98f401b054\"}"
        //
        // deposit to MAIN, trade via MAIN
        //
        //     "{\"orderId\":\"617ab9949e7b3b0001948081\",\"txId\":\"0x7a06b16bbd6b03dbc3d96df5683b15229fc35e7184fd7179a5f3a310bd67d1fa@default@0\"}"
        //
        // sell trade
        //
        //     "{\"symbol\":\"ETH-USDT\",\"orderId\":\"617adcd1eb3fa20001dd29a1\",\"tradeId\":\"617adcd12e113d2b91222ff9\"}"
        //
        let referenceId = undefined;
        if (context !== undefined && context !== '') {
            try {
                const parsed = JSON.parse(context);
                const orderId = this.safeString(parsed, 'orderId');
                const tradeId = this.safeString(parsed, 'tradeId');
                // transactions only have an orderId but for trades we wish to use tradeId
                if (tradeId !== undefined) {
                    referenceId = tradeId;
                }
                else {
                    referenceId = orderId;
                }
            }
            catch (exc) {
                referenceId = context;
            }
        }
        let fee = undefined;
        const feeCost = this.omitZero(this.safeString(item, 'fee'));
        let feeCurrency = undefined;
        if (feeCost !== undefined) {
            feeCurrency = code;
            fee = { 'cost': this.parseNumber(feeCost), 'currency': feeCurrency };
        }
        const status = this.safeString(item, 'status');
        return this.safeLedgerEntry({
            'info': item,
            'id': id,
            'direction': this.parseLedgerDirection(direction),
            'account': account,
            'referenceId': referenceId,
            'referenceAccount': account,
            'type': type,
            'currency': code,
            'amount': this.parseNumber(Precise["default"].stringAbs(amount)),
            'timestamp': timestamp,
            'datetime': datetime,
            'before': undefined,
            'after': balanceAfter,
            'status': this.parseLedgerStatus(status),
            'fee': fee,
        }, currency);
    }
    /**
     * @method
     * @name kucoin#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-spot-margin
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-tradehf
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-marginhf
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-futures
     * @see https://www.kucoin.com/docs-new/rest/ua/get-account-ledger
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.type] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.hf] default false, when true will fetch ledger entries for the high frequency trading account
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.uta] default false, when true will fetch ledger entries for the unified trading account (UTA) instead of the regular accounts endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        await this.loadAccounts();
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'fetchLedger', 'uta', uta);
        let hf = undefined;
        [hf, params] = this.handleHfAndParams(params);
        let requestedType = undefined;
        [requestedType, params] = this.handleMarketTypeAndParams('fetchLedger', undefined, params);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchLedger', params);
        if (uta && (requestedType === 'margin')) {
            marginMode = (marginMode === undefined) ? 'cross' : marginMode; // default to cross margin for UTA if margin is requested but marginMode is not specified
            requestedType = marginMode;
        }
        let accountsByType = this.safeDict(this.options, 'accountsByType');
        if (uta) {
            accountsByType = this.safeDict(this.options, 'utaAccountsByType');
        }
        let type = undefined;
        type = this.safeString(accountsByType, requestedType, requestedType);
        let maxLimit = 500; // for spot non-uta and margin
        if (hf) {
            maxLimit = 200;
        }
        else if (type === 'contract') {
            maxLimit = 50;
        }
        else if (uta) {
            if ((type === 'UNIFIED') || (type === 'SPOT')) {
                maxLimit = 200;
            }
            else if (type === 'FUTURES') {
                maxLimit = 100;
            }
        }
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchLedger', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchLedger', code, since, limit, params, maxLimit);
        }
        let request = {
        // 'currency': currency['id'], // can choose up to 10, if not provided returns for all currencies by default
        // 'direction': 'in', // 'out'
        // 'bizType': 'DEPOSIT', // DEPOSIT, WITHDRAW, TRANSFER, SUB_TRANSFER,TRADE_EXCHANGE, MARGIN_EXCHANGE, KUCOIN_BONUS (optional)
        // 'startAt': since,
        // 'endAt': exchange.milliseconds (),
        };
        if (since !== undefined) {
            request['startAt'] = since;
        }
        // atm only single currency retrieval is supported
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        [request, params] = this.handleUntilOption('endAt', request, params);
        if (limit !== undefined) {
            if (type === 'contract') {
                request['maxCount'] = limit;
            }
            else if (hf) {
                request['limit'] = limit;
            }
            else {
                request['pageSize'] = limit;
            }
        }
        let response = undefined;
        if (uta) {
            request['accountType'] = type;
            response = await this.utaPrivateGetAccountLedger(this.extend(request, params));
        }
        else if (hf) {
            if (marginMode !== undefined) {
                response = await this.privateGetHfMarginAccountLedgers(this.extend(request, params));
            }
            else {
                response = await this.privateGetHfAccountsLedgers(this.extend(request, params));
            }
        }
        else if (type === 'contract') {
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "dataList": [
            //                 {
            //                     "time": 1771765696000,
            //                     "type": "TransferIn",
            //                     "amount": 10.0,
            //                     "fee": 0.0,
            //                     "accountEquity": 54.53821148,
            //                     "status": "Completed",
            //                     "remark": "Transferred from Trading Account",
            //                     "offset": 71904927,
            //                     "currency": "USDT"
            //                 }
            //             ],
            //             "hasMore": false
            //         }
            //     }
            //
            response = await this.futuresPrivateGetTransactionHistory(this.extend(request, params));
        }
        else {
            response = await this.privateGetAccountsLedgers(this.extend(request, params));
        }
        //
        //     {
        //         "code":"200000",
        //         "data":{
        //             "currentPage":1,
        //             "pageSize":50,
        //             "totalNum":1,
        //             "totalPage":1,
        //             "items":[
        //                 {
        //                     "id":"617cc528729f5f0001c03ceb",
        //                     "currency":"GAS",
        //                     "amount":"0.00000339",
        //                     "fee":"0",
        //                     "balance":"0",
        //                     "accountType":"MAIN",
        //                     "bizType":"Distribution",
        //                     "direction":"in",
        //                     "createdAt":1635566888183,
        //                     "context":"{\"orderId\":\"617cc47a1c47ed0001ce3606\",\"description\":\"Holding NEO,distribute GAS(2021/10/30)\"}"
        //                 }
        //                 {
        //                     "id": "611a1e7c6a053300067a88d9",//unique key
        //                     "currency": "USDT", //Currency
        //                     "amount": "10.00059547", //Change amount of the funds
        //                     "fee": "0", //Deposit or withdrawal fee
        //                     "balance": "0", //Total assets of a currency
        //                     "accountType": "MAIN", //Account Type
        //                     "bizType": "Loans Repaid", //business type
        //                     "direction": "in", //side, in or out
        //                     "createdAt": 1629101692950, //Creation time
        //                     "context": "{\"borrowerUserId\":\"601ad03e50dc810006d242ea\",\"loanRepayDetailNo\":\"611a1e7cc913d000066cf7ec\"}"
        //                 },
        //             ]
        //         }
        //     }
        //
        const dataList = this.safeList(response, 'data');
        if (dataList !== undefined) {
            return this.parseLedger(dataList, currency, since, limit);
        }
        const data = this.safeDict(response, 'data');
        const items = this.safeList2(data, 'items', 'dataList', []);
        return this.parseLedger(items, currency, since, limit);
    }
    calculateRateLimiterCost(api, method, path, params, config = {}) {
        const versions = this.safeDict(this.options, 'versions', {});
        const apiVersions = this.safeDict(versions, api, {});
        const methodVersions = this.safeDict(apiVersions, method, {});
        const defaultVersion = this.safeString(methodVersions, path, this.options['version']);
        const version = this.safeString(params, 'version', defaultVersion);
        if (version === 'v3' && ('v3' in config)) {
            return config['v3'];
        }
        else if (version === 'v2' && ('v2' in config)) {
            return config['v2'];
        }
        else if (version === 'v1' && ('v1' in config)) {
            return config['v1'];
        }
        return this.safeValue(config, 'cost', 1);
    }
    parseBorrowRate(info, currency = undefined) {
        //
        //     {
        //         "tradeId": "62db2dcaff219600012b56cd",
        //         "currency": "USDT",
        //         "size": "10",
        //         "dailyIntRate": "0.00003",
        //         "term": 7,
        //         "timestamp": 1658531274508488480
        //     },
        //
        //     {
        //         "createdAt": 1697783812257,
        //         "currency": "XMR",
        //         "interestAmount": "0.1",
        //         "dayRatio": "0.001"
        //     }
        //
        const timestampId = this.safeString2(info, 'createdAt', 'timestamp');
        const timestamp = this.parseToInt(timestampId.slice(0, 13));
        const currencyId = this.safeString(info, 'currency');
        return {
            'currency': this.safeCurrencyCode(currencyId, currency),
            'rate': this.safeNumber2(info, 'dailyIntRate', 'dayRatio'),
            'period': 86400000,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': info,
        };
    }
    /**
     * @method
     * @name kucoin#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-cross-margin
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-isolated-margin
     * @param {string} [code] unified currency code
     * @param {string} [symbol] unified market symbol, required for isolated margin
     * @param {int} [since] the earliest time in ms to fetch borrrow interest for
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' default is 'cross'
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/?id=borrow-interest-structure}
     */
    async fetchBorrowInterest(code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchBorrowInterest', params, 'cross');
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            if (marginMode === 'isolated') {
                request['balanceCurrency'] = currency['id'];
            }
            else {
                request['quoteCurrency'] = currency['id'];
            }
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let response = undefined;
        if (marginMode === 'isolated') {
            response = await this.privateGetIsolatedAccounts(this.extend(request, params));
        }
        else {
            response = await this.privateGetMarginAccounts(this.extend(request, params));
        }
        //
        // Cross
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "totalAssetOfQuoteCurrency": "0",
        //             "totalLiabilityOfQuoteCurrency": "0",
        //             "debtRatio": "0",
        //             "status": "EFFECTIVE",
        //             "accounts": [
        //                 {
        //                     "currency": "1INCH",
        //                     "total": "0",
        //                     "available": "0",
        //                     "hold": "0",
        //                     "liability": "0",
        //                     "maxBorrowSize": "0",
        //                     "borrowEnabled": true,
        //                     "transferInEnabled": true
        //                 }
        //             ]
        //         }
        //     }
        //
        // Isolated
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "totalConversionBalance": "0.02138647",
        //             "liabilityConversionBalance": "0.01480001",
        //             "assets": [
        //                 {
        //                     "symbol": "MANA-USDT",
        //                     "debtRatio": "0",
        //                     "status": "BORROW",
        //                     "baseAsset": {
        //                         "currency": "MANA",
        //                         "borrowEnabled": true,
        //                         "repayEnabled": true,
        //                         "transferEnabled": true,
        //                         "borrowed": "0",
        //                         "totalAsset": "0",
        //                         "available": "0",
        //                         "hold": "0",
        //                         "maxBorrowSize": "1000"
        //                     },
        //                     "quoteAsset": {
        //                         "currency": "USDT",
        //                         "borrowEnabled": true,
        //                         "repayEnabled": true,
        //                         "transferEnabled": true,
        //                         "borrowed": "0",
        //                         "totalAsset": "0",
        //                         "available": "0",
        //                         "hold": "0",
        //                         "maxBorrowSize": "50000"
        //                     }
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const assets = (marginMode === 'isolated') ? this.safeList(data, 'assets', []) : this.safeList(data, 'accounts', []);
        const interest = this.parseBorrowInterests(assets, market);
        const filteredByCurrency = this.filterByCurrencySinceLimit(interest, code, since, limit);
        return this.filterBySymbolSinceLimit(filteredByCurrency, symbol, since, limit);
    }
    parseBorrowInterest(info, market = undefined) {
        //
        // Cross
        //
        //     {
        //         "currency": "DOGE",
        //         "total": "119.99995308",
        //         "available": "119.99995308",
        //         "hold": "0",
        //         "liability": "10.00004692",
        //         "liabilityPrincipal": "10",
        //         "liabilityInterest": "0.00004692",
        //         "maxBorrowSize": "1140",
        //         "borrowEnabled": true,
        //         "transferInEnabled": true
        //     }
        //
        // Isolated
        //
        //     {
        //         "symbol": "DOGE-USDT",
        //         "status": "EFFECTIVE",
        //         "debtRatio": "0.0822",
        //         "baseAsset": {
        //             "currency": "DOGE",
        //             "borrowEnabled": true,
        //             "transferInEnabled": true,
        //             "liability": "10.00009385",
        //             "liabilityPrincipal": "10.00004692",
        //             "liabilityInterest": "0.00004693",
        //             "total": "10",
        //             "available": "10",
        //             "hold": "0",
        //             "maxBorrowSize": "990"
        //         },
        //         "quoteAsset": {
        //             "currency": "USDT",
        //             "borrowEnabled": true,
        //             "transferInEnabled": true,
        //             "liability": "0",
        //             "liabilityPrincipal": "0",
        //             "liabilityInterest": "0",
        //             "total": "10",
        //             "available": "10",
        //             "hold": "0",
        //             "maxBorrowSize": "89"
        //         }
        //     }
        //
        const marketId = this.safeString(info, 'symbol');
        const marginMode = (marketId === undefined) ? 'cross' : 'isolated';
        market = this.safeMarket(marketId, market);
        const symbol = this.safeString(market, 'symbol');
        const isolatedBase = this.safeDict(info, 'baseAsset', {});
        let amountBorrowed = undefined;
        let interest = undefined;
        let currencyId = undefined;
        if (marginMode === 'isolated') {
            amountBorrowed = this.safeNumber(isolatedBase, 'liabilityPrincipal');
            interest = this.safeNumber(isolatedBase, 'liabilityInterest');
            currencyId = this.safeString(isolatedBase, 'currency');
        }
        else {
            amountBorrowed = this.safeNumber(info, 'liabilityPrincipal');
            interest = this.safeNumber(info, 'liabilityInterest');
            currencyId = this.safeString(info, 'currency');
        }
        return {
            'info': info,
            'symbol': symbol,
            'currency': this.safeCurrencyCode(currencyId),
            'interest': interest,
            'interestRate': this.safeNumber(info, 'dailyIntRate'),
            'amountBorrowed': amountBorrowed,
            'marginMode': marginMode,
            'timestamp': undefined,
            'datetime': undefined,
        };
    }
    /**
     * @method
     * @name kucoin#fetchBorrowRateHistories
     * @description retrieves a history of a multiple currencies borrow interest rate at specific time slots, returns all currencies if no symbols passed, default is undefined
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/debit/get-interest-history
     * @param {string[]|undefined} codes list of unified currency codes, default is undefined
     * @param {int} [since] timestamp in ms of the earliest borrowRate, default is undefined
     * @param {int} [limit] max number of borrow rate prices to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' default is 'cross'
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object} a dictionary of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure} indexed by the market symbol
     */
    async fetchBorrowRateHistories(codes = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const marginResult = this.handleMarginModeAndParams('fetchBorrowRateHistories', params);
        const marginMode = this.safeString(marginResult, 0, 'cross');
        const isIsolated = (marginMode === 'isolated'); // true-isolated, false-cross
        let request = {
            'isIsolated': isIsolated,
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        if (limit !== undefined) {
            request['pageSize'] = limit; // default:50, min:10, max:500
        }
        const response = await this.privateGetMarginInterest(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "timestamp": 1710829939673,
        //             "currentPage": 1,
        //             "pageSize": 50,
        //             "totalNum": 0,
        //             "totalPage": 0,
        //             "items": [
        //                 {
        //                     "createdAt": 1697783812257,
        //                     "currency": "XMR",
        //                     "interestAmount": "0.1",
        //                     "dayRatio": "0.001"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data');
        const rows = this.safeList(data, 'items', []);
        return this.parseBorrowRateHistories(rows, codes, since, limit);
    }
    /**
     * @method
     * @name kucoin#fetchBorrowRateHistory
     * @description retrieves a history of a currencies borrow interest rate at specific time slots
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/debit/get-interest-history
     * @param {string} code unified currency code
     * @param {int} [since] timestamp for the earliest borrow rate
     * @param {int} [limit] the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure} to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' default is 'cross'
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} an array of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
     */
    async fetchBorrowRateHistory(code, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const marginResult = this.handleMarginModeAndParams('fetchBorrowRateHistories', params);
        const marginMode = this.safeString(marginResult, 0, 'cross');
        const isIsolated = (marginMode === 'isolated'); // true-isolated, false-cross
        const currency = this.currency(code);
        let request = {
            'isIsolated': isIsolated,
            'currency': currency['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        if (limit !== undefined) {
            request['pageSize'] = limit; // default:50, min:10, max:500
        }
        const response = await this.privateGetMarginInterest(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "timestamp": 1710829939673,
        //             "currentPage": 1,
        //             "pageSize": 50,
        //             "totalNum": 0,
        //             "totalPage": 0,
        //             "items": [
        //                 {
        //                     "createdAt": 1697783812257,
        //                     "currency": "XMR",
        //                     "interestAmount": "0.1",
        //                     "dayRatio": "0.001"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data');
        const rows = this.safeList(data, 'items', []);
        return this.parseBorrowRateHistory(rows, code, since, limit);
    }
    parseBorrowRateHistories(response, codes, since, limit) {
        //
        //     [
        //         {
        //             "createdAt": 1697783812257,
        //             "currency": "XMR",
        //             "interestAmount": "0.1",
        //             "dayRatio": "0.001"
        //         }
        //     ]
        //
        const borrowRateHistories = {};
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            const code = this.safeCurrencyCode(this.safeString(item, 'currency'));
            if (codes === undefined || this.inArray(code, codes)) {
                if (!(code in borrowRateHistories)) {
                    borrowRateHistories[code] = [];
                }
                const borrowRateStructure = this.parseBorrowRate(item);
                const borrowRateHistoriesCode = borrowRateHistories[code];
                borrowRateHistoriesCode.push(borrowRateStructure);
            }
        }
        const keys = Object.keys(borrowRateHistories);
        for (let i = 0; i < keys.length; i++) {
            const code = keys[i];
            borrowRateHistories[code] = this.filterByCurrencySinceLimit(borrowRateHistories[code], code, since, limit);
        }
        return borrowRateHistories;
    }
    /**
     * @method
     * @name kucoin#borrowCrossMargin
     * @description create a loan to borrow margin
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/debit/borrow
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoints
     * @param {string} [params.timeInForce] either IOC or FOK
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
     */
    async borrowCrossMargin(code, amount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
            'size': this.currencyToPrecision(code, amount),
            'timeInForce': 'FOK',
        };
        const response = await this.privatePostMarginBorrow(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "code": "200",
        //         "msg": "success",
        //         "retry": false,
        //         "data": {
        //             "orderNo": "5da6dba0f943c0c81f5d5db5",
        //             "actualSize": 10
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseMarginLoan(data, currency);
    }
    /**
     * @method
     * @name kucoin#borrowIsolatedMargin
     * @description create a loan to borrow margin
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/debit/borrow
     * @param {string} symbol unified market symbol, required for isolated margin
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoints
     * @param {string} [params.timeInForce] either IOC or FOK
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
     */
    async borrowIsolatedMargin(symbol, code, amount, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
            'size': this.currencyToPrecision(code, amount),
            'symbol': market['id'],
            'timeInForce': 'FOK',
            'isIsolated': true,
        };
        const response = await this.privatePostMarginBorrow(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "code": "200",
        //         "msg": "success",
        //         "retry": false,
        //         "data": {
        //             "orderNo": "5da6dba0f943c0c81f5d5db5",
        //             "actualSize": 10
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseMarginLoan(data, currency);
    }
    /**
     * @method
     * @name kucoin#repayCrossMargin
     * @description repay borrowed margin and interest
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/debit/repay
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoints
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
     */
    async repayCrossMargin(code, amount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
            'size': this.currencyToPrecision(code, amount),
        };
        const response = await this.privatePostMarginRepay(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "code": "200",
        //         "msg": "success",
        //         "retry": false,
        //         "data": {
        //             "orderNo": "5da6dba0f943c0c81f5d5db5",
        //             "actualSize": 10
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseMarginLoan(data, currency);
    }
    /**
     * @method
     * @name kucoin#repayIsolatedMargin
     * @description repay borrowed margin and interest
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/debit/repay
     * @param {string} symbol unified market symbol
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoints
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
     */
    async repayIsolatedMargin(symbol, code, amount, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
            'size': this.currencyToPrecision(code, amount),
            'symbol': market['id'],
            'isIsolated': true,
        };
        const response = await this.privatePostMarginRepay(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "code": "200",
        //         "msg": "success",
        //         "retry": false,
        //         "data": {
        //             "orderNo": "5da6dba0f943c0c81f5d5db5",
        //             "actualSize": 10
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseMarginLoan(data, currency);
    }
    parseMarginLoan(info, currency = undefined) {
        //
        //     {
        //         "orderNo": "5da6dba0f943c0c81f5d5db5",
        //         "actualSize": 10
        //     }
        //
        const timestamp = this.milliseconds();
        const currencyId = this.safeString(info, 'currency');
        return {
            'id': this.safeString(info, 'orderNo'),
            'currency': this.safeCurrencyCode(currencyId, currency),
            'amount': this.safeNumber(info, 'actualSize'),
            'symbol': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': info,
        };
    }
    /**
     * @method
     * @name kucoin#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees - *IMPORTANT* use fetchDepositWithdrawFee to get more in-depth info
     * @see https://docs.kucoin.com/#get-currencies
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    async fetchDepositWithdrawFees(codes = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.publicGetCurrencies(params);
        //
        //  [
        //      {
        //        "currency": "CSP",
        //        "name": "CSP",
        //        "fullName": "Caspian",
        //        "precision": 8,
        //        "confirms": 12,
        //        "contractAddress": "0xa6446d655a0c34bc4f05042ee88170d056cbaf45",
        //        "withdrawalMinSize": "2000",
        //        "withdrawalMinFee": "1000",
        //        "isWithdrawEnabled": true,
        //        "isDepositEnabled": true,
        //        "isMarginEnabled": false,
        //        "isDebitEnabled": false
        //      },
        //  ]
        //
        const data = this.safeList(response, 'data', []);
        return this.parseDepositWithdrawFees(data, codes, 'currency');
    }
    /**
     * @method
     * @name kucoin#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-cross-margin-leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    async fetchLeverage(symbol, params = {}) {
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams(symbol, params);
        if (marginMode !== 'cross') {
            throw new errors.NotSupported(this.id + ' fetchLeverage() currently supports only params["marginMode"] = "cross"');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['contract']) {
            throw new errors.NotSupported(this.id + ' fetchLeverage() supports contract markets only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.futuresPrivateGetGetCrossUserLeverage(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "symbol": "XBTUSDTM",
        //            "leverage": "3"
        //        }
        //    }
        //
        const data = this.safeDict(response, 'data', {});
        const parsed = this.parseLeverage(data, market);
        return this.extend(parsed, {
            'marginMode': marginMode,
        });
    }
    /**
     * @method
     * @name kucoin#setLeverage
     * @description set the level of leverage for a market
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/debit/modify-leverage
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/modify-cross-margin-leverage
     * @see https://www.kucoin.com/docs-new/rest/ua/modify-leverage-uta
     * @param {int } [leverage] New leverage multiplier. Must be greater than 1 and up to two decimal places, and cannot be less than the user's current debt leverage or greater than the system's maximum leverage
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] *contract markets only* set to true for the unified trading account (uta)
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('setLeverage', undefined, params);
        if ((symbol !== undefined) || ((marketType !== 'spot') && (marketType !== 'margin'))) {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' setLeverage requires a symbol argument for contract markets');
            }
            market = this.market(symbol);
            if (market['contract']) {
                return await this.setContractLeverage(leverage, symbol, params);
            }
        }
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'setLeverage', 'uta', uta);
        if (uta) {
            throw new errors.NotSupported(this.id + ' setLeverage with params["uta"] is supported for contract markets only');
        }
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('setLeverage', params);
        if (marginMode === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage requires a marginMode parameter');
        }
        const request = {};
        if (marginMode === 'isolated' && symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage requires a symbol parameter for isolated margin');
        }
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        request['leverage'] = leverage.toString();
        request['isIsolated'] = (marginMode === 'isolated');
        return await this.privatePostPositionUpdateUserLeverage(this.extend(request, params));
    }
    /**
     * @method
     * @name kucoin#setContractLeverage
     * @description set the level of leverage for a market
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/modify-cross-margin-leverage
     * @see https://www.kucoin.com/docs-new/rest/ua/modify-leverage-uta
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta)
     * @returns {object} response from the exchange
     */
    async setContractLeverage(leverage, symbol = undefined, params = {}) {
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams(symbol, params);
        if ((marginMode !== undefined) && (marginMode !== 'cross')) {
            throw new errors.NotSupported(this.id + ' setLeverage() currently supports only params["marginMode"] = "cross" for contracts');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'leverage': leverage.toString(),
        };
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'setLeverage', 'uta', uta);
        let response = undefined;
        if (uta) {
            request['accountMode'] = 'unified';
            response = await this.utaPrivatePostAccountModeAccountModifyLeverage(this.extend(request, params));
        }
        else {
            //
            //    {
            //        "code": "200000",
            //        "data": true
            //    }
            //
            response = await this.futuresPrivatePostChangeCrossUserLeverage(this.extend(request, params));
        }
        const data = this.safeDict(response, 'data', {});
        const leverageNum = this.safeNumber(data, 'leverage');
        return {
            'info': response,
            'symbol': market['symbol'],
            'marginMode': undefined,
            'longLeverage': leverageNum,
            'shortLeverage': leverageNum,
        };
    }
    /**
     * @method
     * @name kucoin#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-current-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    async fetchFundingInterval(symbol, params = {}) {
        return await this.fetchFundingRate(symbol, this.extend(params, { 'uta': false }));
    }
    /**
     * @method
     * @name kucoin#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://www.kucoin.com/docs-new/rest/ua/get-current-funding-rate
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-current-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta)
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    async fetchFundingRate(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'fetchFundingRate', 'uta', uta);
        let response = undefined;
        if (uta) {
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "symbol": ".XBTUSDTMFPI8H",
            //             "nextFundingRate": 7.4E-5,
            //             "fundingTime": 1762444800000,
            //             "fundingRateCap": 0.003,
            //             "fundingRateFloor": -0.003
            //         }
            //     }
            //
            response = await this.utaGetMarketFundingRate(this.extend(request, params));
        }
        else {
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "symbol": ".ETHUSDTMFPI8H",
            //             "granularity": 28800000,
            //             "timePoint": 1771747200000,
            //             "value": 3.0E-6,
            //             "dailyInterestRate": 3.0E-4,
            //             "fundingRateCap": 0.00375,
            //             "fundingRateFloor": -0.00375,
            //             "period": 1,
            //             "fundingTime": 1771776000000
            //         }
            //     }
            //
            response = await this.futuresPublicGetFundingRateSymbolCurrent(this.extend(request, params));
        }
        const data = this.safeDict(response, 'data', {});
        return this.parseFundingRate(data, market);
    }
    parseFundingRate(data, market = undefined) {
        // uta
        //     {
        //         "symbol": ".XBTUSDTMFPI8H",
        //         "nextFundingRate": 7.4E-5,
        //         "fundingTime": 1762444800000,
        //         "fundingRateCap": 0.003,
        //         "fundingRateFloor": -0.003
        //     }
        //
        // futures
        //     {
        //         "symbol": ".ETHUSDTMFPI8H",
        //         "granularity": 28800000,
        //         "timePoint": 1771747200000,
        //         "value": 3.0E-6,
        //         "dailyInterestRate": 3.0E-4,
        //         "fundingRateCap": 0.00375,
        //         "fundingRateFloor": -0.00375,
        //         "period": 1,
        //         "fundingTime": 1771776000000
        //     }
        //
        const fundingTimestamp = this.safeInteger(data, 'fundingTime');
        const previousFundingTimestamp = this.safeInteger(data, 'timePoint');
        const marketId = this.safeString(data, 'symbol');
        return {
            'info': data,
            'symbol': this.safeSymbol(marketId, market, undefined, 'contract'),
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': this.safeNumber(data, 'dailyInterestRate'),
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber2(data, 'nextFundingRate', 'value'),
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601(fundingTimestamp),
            'nextFundingRate': this.safeNumber(data, 'predictedValue'),
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': previousFundingTimestamp,
            'previousFundingDatetime': this.iso8601(previousFundingTimestamp),
            'interval': this.parseFundingInterval(this.safeString(data, 'granularity')),
        };
    }
    parseFundingInterval(interval) {
        const intervals = {
            '3600000': '1h',
            '14400000': '4h',
            '28800000': '8h',
            '57600000': '16h',
            '86400000': '24h',
        };
        return this.safeString(intervals, interval, interval);
    }
    /**
     * @method
     * @name kucoin#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-public-funding-history
     * @see https://www.kucoin.com/docs-new/rest/ua/get-history-funding-rate
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] not used by kucuoinfutures
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to true
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const until = this.safeInteger(params, 'until');
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'fetchFundingRateHistory', 'uta', uta);
        params = this.omit(params, 'until');
        let start = since;
        let end = until;
        if (since === undefined) {
            start = 0;
        }
        if (until === undefined) {
            end = this.milliseconds();
        }
        let response = undefined;
        let resultKey = 'data';
        if (uta) {
            request['startAt'] = start;
            request['endAt'] = end;
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "symbol": "XBTUSDTM",
            //             "list": [
            //                 {
            //                     "fundingRate": 7.6E-5,
            //                     "ts": 1706097600000
            //                 },
            //             ]
            //         }
            //     }
            //
            const utaResponse = await this.utaGetMarketFundingRateHistory(this.extend(request, params));
            response = this.safeDict(utaResponse, 'data', {});
            resultKey = 'list';
        }
        else {
            request['from'] = start;
            request['to'] = end;
            //
            //     {
            //         "code": "200000",
            //         "data": [
            //             {
            //                 "symbol": "IDUSDTM",
            //                 "fundingRate": 2.26E-4,
            //                 "timepoint": 1702296000000
            //             }
            //         ]
            //     }
            //
            response = await this.futuresPublicGetContractFundingRates(this.extend(request, params));
        }
        const result = this.safeList(response, resultKey, []);
        return this.parseFundingRateHistories(result, market, since, limit);
    }
    parseFundingRateHistory(info, market = undefined) {
        //
        // uta
        //     {
        //         "fundingRate": 7.6E-5,
        //         "ts": 1706097600000
        //     }
        //
        // futures
        //     {
        //         "symbol": "IDUSDTM",
        //         "fundingRate": 2.26E-4,
        //         "timepoint": 1702296000000
        //     }
        //
        const marketId = this.safeString(info, 'symbol');
        const timestamp = this.safeInteger2(info, 'ts', 'timepoint');
        return {
            'info': info,
            'symbol': this.safeSymbol(marketId, market),
            'fundingRate': this.safeNumber(info, 'fundingRate'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    /**
     * @method
     * @name kucoin#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-private-funding-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
     */
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingHistory() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (limit !== undefined) {
            // * Since is ignored if limit is defined
            request['maxCount'] = limit;
        }
        const response = await this.futuresPrivateGetFundingHistory(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "dataList": [
        //                {
        //                    "id": 239471298749817,
        //                    "symbol": "ETHUSDTM",
        //                    "timePoint": 1638532800000,
        //                    "fundingRate": 0.000100,
        //                    "markPrice": 4612.8300000000,
        //                    "positionQty": 12,
        //                    "positionCost": 553.5396000000,
        //                    "funding": -0.0553539600,
        //                    "settleCurrency": "USDT"
        //                },
        //                ...
        //            ],
        //            "hasMore": true
        //        }
        //    }
        //
        const data = this.safeValue(response, 'data');
        const dataList = this.safeList(data, 'dataList', []);
        const fees = [];
        for (let i = 0; i < dataList.length; i++) {
            const listItem = dataList[i];
            const timestamp = this.safeInteger(listItem, 'timePoint');
            fees.push({
                'info': listItem,
                'symbol': symbol,
                'code': this.safeCurrencyCode(this.safeString(listItem, 'settleCurrency')),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
                'id': this.safeNumber(listItem, 'id'),
                'amount': this.safeNumber(listItem, 'funding'),
                'fundingRate': this.safeNumber(listItem, 'fundingRate'),
                'markPrice': this.safeNumber(listItem, 'markPrice'),
                'positionQty': this.safeNumber(listItem, 'positionQty'),
                'positionCost': this.safeNumber(listItem, 'positionCost'),
            });
        }
        return fees;
    }
    /**
     * @method
     * @name kucoin#fetchPosition
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-details
     * @see https://www.kucoin.com/docs-new/rest/ua/get-position-list-uta
     * @description fetch data on an open position
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPosition(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'fetchPosition', 'uta', uta);
        let response = undefined;
        let position = undefined;
        if (uta) {
            request['accountMode'] = 'unified';
            response = await this.utaPrivateGetAccountModePositionOpenList(this.extend(request, params));
            //
            //     {
            //         "code": "200000",
            //         "data": [
            //             {
            //                 "symbol": "DOGEUSDTM",
            //                 "id": "30000000000084351",
            //                 "marginMode": "CROSS",
            //                 "size": "2",
            //                 "entryPrice": "0.093795",
            //                 "positionValue": "18.298",
            //                 "markPrice": "0.09149",
            //                 "leverage": "3",
            //                 "unrealizedPnL": "-0.461",
            //                 "realizedPnL": "-0.01122489",
            //                 "initialMargin": "6.0993333327234",
            //                 "mmr": "0.007",
            //                 "maintenanceMargin": "0.128086",
            //                 "creationTime": 1774469753178000000
            //             }
            //         ]
            //     }
            //
            const data = this.safeList(response, 'data', []);
            position = this.safeDict(data, 0, {});
        }
        else {
            response = await this.futuresPrivateGetPosition(this.extend(request, params));
            //
            //    {
            //        "code": "200000",
            //        "data": {
            //            "id": "6505ee6eaff4070001f651c4",
            //            "symbol": "XBTUSDTM",
            //            "autoDeposit": false,
            //            "maintMarginReq": 0,
            //            "riskLimit": 200,
            //            "realLeverage": 0.0,
            //            "crossMode": false,
            //            "delevPercentage": 0.0,
            //            "currentTimestamp": 1694887534594,
            //            "currentQty": 0,
            //            "currentCost": 0.0,
            //            "currentComm": 0.0,
            //            "unrealisedCost": 0.0,
            //            "realisedGrossCost": 0.0,
            //            "realisedCost": 0.0,
            //            "isOpen": false,
            //            "markPrice": 26611.71,
            //            "markValue": 0.0,
            //            "posCost": 0.0,
            //            "posCross": 0,
            //            "posInit": 0.0,
            //            "posComm": 0.0,
            //            "posLoss": 0.0,
            //            "posMargin": 0.0,
            //            "posMaint": 0.0,
            //            "maintMargin": 0.0,
            //            "realisedGrossPnl": 0.0,
            //            "realisedPnl": 0.0,
            //            "unrealisedPnl": 0.0,
            //            "unrealisedPnlPcnt": 0,
            //            "unrealisedRoePcnt": 0,
            //            "avgEntryPrice": 0.0,
            //            "liquidationPrice": 0.0,
            //            "bankruptPrice": 0.0,
            //            "settleCurrency": "USDT",
            //            "maintainMargin": 0,
            //            "riskLimitLevel": 1
            //        }
            //    }
            //
            position = this.safeDict(response, 'data', {});
        }
        return this.parsePosition(position, market);
    }
    /**
     * @method
     * @name kucoin#fetchPositions
     * @description fetch all open positions
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-list
     * @see https://www.kucoin.com/docs-new/rest/ua/get-position-list-uta
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'fetchPositions', 'uta', uta);
        let response = undefined;
        if (uta) {
            response = await this.utaPrivateGetAccountModePositionOpenList(this.extend(params, { 'accountMode': 'unified' }));
        }
        else {
            response = await this.futuresPrivateGetPositions(params);
            //
            //    {
            //        "code": "200000",
            //        "data": [
            //            {
            //                "id": "615ba79f83a3410001cde321",
            //                "symbol": "ETHUSDTM",
            //                "autoDeposit": false,
            //                "maintMarginReq": 0.005,
            //                "riskLimit": 1000000,
            //                "realLeverage": 18.61,
            //                "crossMode": false,
            //                "delevPercentage": 0.86,
            //                "openingTimestamp": 1638563515618,
            //                "currentTimestamp": 1638576872774,
            //                "currentQty": 2,
            //                "currentCost": 83.64200000,
            //                "currentComm": 0.05018520,
            //                "unrealisedCost": 83.64200000,
            //                "realisedGrossCost": 0.00000000,
            //                "realisedCost": 0.05018520,
            //                "isOpen": true,
            //                "markPrice": 4225.01,
            //                "markValue": 84.50020000,
            //                "posCost": 83.64200000,
            //                "posCross": 0.0000000000,
            //                "posInit": 3.63660870,
            //                "posComm": 0.05236717,
            //                "posLoss": 0.00000000,
            //                "posMargin": 3.68897586,
            //                "posMaint": 0.50637594,
            //                "maintMargin": 4.54717586,
            //                "realisedGrossPnl": 0.00000000,
            //                "realisedPnl": -0.05018520,
            //                "unrealisedPnl": 0.85820000,
            //                "unrealisedPnlPcnt": 0.0103,
            //                "unrealisedRoePcnt": 0.2360,
            //                "avgEntryPrice": 4182.10,
            //                "liquidationPrice": 4023.00,
            //                "bankruptPrice": 4000.25,
            //                "settleCurrency": "USDT",
            //                "isInverse": false
            //            }
            //        ]
            //    }
            //
        }
        const data = this.safeList(response, 'data');
        return this.parsePositions(data, symbols);
    }
    /**
     * @method
     * @name kucoin#fetchPositionsHistory
     * @description fetches historical positions
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-positions-history
     * @see https://www.kucoin.com/docs-new/rest/ua/get-position-history-uta
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch position history for
     * @param {int} [limit] the maximum number of entries to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] closing end time
     * @param {int} [params.pageId] page id
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositionsHistory(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'fetchPositionsHistory', 'uta', uta);
        let response = undefined;
        let request = {};
        symbols = this.marketSymbols(symbols);
        if (symbols !== undefined) {
            const length = symbols.length;
            if (length === 1) {
                const market = this.market(symbols[0]);
                request['symbol'] = market['id'];
            }
        }
        if (uta) {
            if (since !== undefined) {
                request['startAt'] = since;
            }
            if (limit !== undefined) {
                request['pageSize'] = limit;
            }
            [request, params] = this.handleUntilOption('endAt', request, params);
            //
            //     {
            //         "code": "200000",
            //         "data": {
            //             "items": [
            //                 {
            //                     "symbol": "DOGEUSDTM",
            //                     "closeId": "30000000000162175",
            //                     "marginMode": "CROSS",
            //                     "side": "LONG",
            //                     "entryPrice": "0.09641",
            //                     "closePrice": "0.09613",
            //                     "maxSize": "1",
            //                     "avgClosePrice": "0.09613",
            //                     "leverage": "3",
            //                     "realizedPnL": "-0.0395524",
            //                     "fee": "0.0115524",
            //                     "tax": "0",
            //                     "fundingFee": "0",
            //                     "closingTime": 1774469647311000000,
            //                     "creationTime": 1774468501294000000
            //                 }
            //             ],
            //             "lastId": 30000000000162175
            //         }
            //     }
            //
            response = await this.utaPrivateGetPositionHistory(this.extend(request, params));
        }
        else {
            if (limit === undefined) {
                limit = 200;
            }
            request['limit'] = limit;
            if (since !== undefined) {
                request['from'] = since;
            }
            const until = this.safeInteger(params, 'until');
            if (until !== undefined) {
                params = this.omit(params, 'until');
                request['to'] = until;
            }
            //
            // {
            //     "success": true,
            //     "code": "200",
            //     "msg": "success",
            //     "retry": false,
            //     "data": {
            //         "currentPage": 1,
            //         "pageSize": 10,
            //         "totalNum": 25,
            //         "totalPage": 3,
            //         "items": [
            //             {
            //                 "closeId": "300000000000000030",
            //                 "positionId": "300000000000000009",
            //                 "uid": 99996908309485,
            //                 "userId": "6527d4fc8c7f3d0001f40f5f",
            //                 "symbol": "XBTUSDM",
            //                 "settleCurrency": "XBT",
            //                 "leverage": "0.0",
            //                 "type": "LIQUID_LONG",
            //                 "side": null,
            //                 "closeSize": null,
            //                 "pnl": "-1.0000003793999999",
            //                 "realisedGrossCost": "0.9993849748999999",
            //                 "withdrawPnl": "0.0",
            //                 "roe": null,
            //                 "tradeFee": "0.0006154045",
            //                 "fundingFee": "0.0",
            //                 "openTime": 1713785751181,
            //                 "closeTime": 1713785752784,
            //                 "openPrice": null,
            //                 "closePrice": null
            //             }
            //         ]
            //     }
            // }
            //
            response = await this.futuresPrivateGetHistoryPositions(this.extend(request, params));
        }
        const data = this.safeDict(response, 'data');
        const items = this.safeList(data, 'items', []);
        return this.parsePositions(items, symbols);
    }
    parsePosition(position, market = undefined) {
        //
        //    {
        //        "code": "200000",
        //        "data": [
        //            {
        //                "id": "615ba79f83a3410001cde321",         // Position ID
        //                "symbol": "ETHUSDTM",                     // Symbol
        //                "autoDeposit": false,                     // Auto deposit margin or not
        //                "maintMarginReq": 0.005,                  // Maintenance margin requirement
        //                "riskLimit": 1000000,                     // Risk limit
        //                "realLeverage": 25.92,                    // Leverage of the order
        //                "crossMode": false,                       // Cross mode or not
        //                "delevPercentage": 0.76,                  // ADL ranking percentile
        //                "openingTimestamp": 1638578546031,        // Open time
        //                "currentTimestamp": 1638578563580,        // Current timestamp
        //                "currentQty": 2,                          // Current postion quantity
        //                "currentCost": 83.787,                    // Current postion value
        //                "currentComm": 0.0167574,                 // Current commission
        //                "unrealisedCost": 83.787,                 // Unrealised value
        //                "realisedGrossCost": 0.0,                 // Accumulated realised gross profit value
        //                "realisedCost": 0.0167574,                // Current realised position value
        //                "isOpen": true,                           // Opened position or not
        //                "markPrice": 4183.38,                     // Mark price
        //                "markValue": 83.6676,                     // Mark value
        //                "posCost": 83.787,                        // Position value
        //                "posCross": 0.0,                          // added margin
        //                "posInit": 3.35148,                       // Leverage margin
        //                "posComm": 0.05228309,                    // Bankruptcy cost
        //                "posLoss": 0.0,                           // Funding fees paid out
        //                "posMargin": 3.40376309,                  // Position margin
        //                "posMaint": 0.50707892,                   // Maintenance margin
        //                "maintMargin": 3.28436309,                // Position margin
        //                "realisedGrossPnl": 0.0,                  // Accumulated realised gross profit value
        //                "realisedPnl": -0.0167574,                // Realised profit and loss
        //                "unrealisedPnl": -0.1194,                 // Unrealised profit and loss
        //                "unrealisedPnlPcnt": -0.0014,             // Profit-loss ratio of the position
        //                "unrealisedRoePcnt": -0.0356,             // Rate of return on investment
        //                "avgEntryPrice": 4189.35,                 // Average entry price
        //                "liquidationPrice": 4044.55,              // Liquidation price
        //                "bankruptPrice": 4021.75,                 // Bankruptcy price
        //                "settleCurrency": "USDT",                 // Currency used to clear and settle the trades
        //                "isInverse": false
        //            }
        //        ]
        //    }
        // position history
        //             {
        //                 "closeId": "300000000000000030",
        //                 "positionId": "300000000000000009",
        //                 "uid": 99996908309485,
        //                 "userId": "6527d4fc8c7f3d0001f40f5f",
        //                 "symbol": "XBTUSDM",
        //                 "settleCurrency": "XBT",
        //                 "leverage": "0.0",
        //                 "type": "LIQUID_LONG",
        //                 "side": null,
        //                 "closeSize": null,
        //                 "pnl": "-1.0000003793999999",
        //                 "realisedGrossCost": "0.9993849748999999",
        //                 "withdrawPnl": "0.0",
        //                 "roe": null,
        //                 "tradeFee": "0.0006154045",
        //                 "fundingFee": "0.0",
        //                 "openTime": 1713785751181,
        //                 "closeTime": 1713785752784,
        //                 "openPrice": null,
        //                 "closePrice": null
        //             }
        //
        // uta fetchPositions
        //     {
        //         "symbol": "DOGEUSDTM",
        //         "id": "30000000000084351",
        //         "marginMode": "CROSS",
        //         "size": "2",
        //         "entryPrice": "0.093795",
        //         "positionValue": "18.298",
        //         "markPrice": "0.09149",
        //         "leverage": "3",
        //         "unrealizedPnL": "-0.461",
        //         "realizedPnL": "-0.01122489",
        //         "initialMargin": "6.0993333327234",
        //         "mmr": "0.007",
        //         "maintenanceMargin": "0.128086",
        //         "creationTime": 1774469753178000000
        //     }
        //
        // uta fetchPositionsHistory
        //     {
        //         "symbol": "DOGEUSDTM",
        //         "closeId": "30000000000162175",
        //         "marginMode": "CROSS",
        //         "side": "LONG",
        //         "entryPrice": "0.09641",
        //         "closePrice": "0.09613",
        //         "maxSize": "1",
        //         "avgClosePrice": "0.09613",
        //         "leverage": "3",
        //         "realizedPnL": "-0.0395524",
        //         "fee": "0.0115524",
        //         "tax": "0",
        //         "fundingFee": "0",
        //         "closingTime": 1774469647311000000,
        //         "creationTime": 1774468501294000000
        //     }
        //
        const symbol = this.safeString(position, 'symbol');
        market = this.safeMarket(symbol, market);
        let timestamp = this.safeInteger(position, 'currentTimestamp');
        if (timestamp === undefined) {
            timestamp = this.safeIntegerProduct(position, 'creationTime', 0.000001);
        }
        const size = this.safeStringN(position, ['currentQty', 'size', 'maxSize', 'closeSize']);
        let side = this.safeStringLower(position, 'side');
        const type = this.safeStringLower(position, 'type');
        if (side === undefined) {
            if (size !== undefined) {
                if (Precise["default"].stringGt(size, '0')) {
                    side = 'long';
                }
                else if (Precise["default"].stringLt(size, '0')) {
                    side = 'short';
                }
            }
            else if (type !== undefined) {
                if (type.indexOf('long') > -1) {
                    side = 'long';
                }
                else {
                    side = 'short';
                }
            }
        }
        const notional = Precise["default"].stringAbs(this.safeString2(position, 'posCost', 'positionValue'));
        const initialMargin = this.safeString2(position, 'posInit', 'initialMargin');
        const initialMarginPercentage = Precise["default"].stringDiv(initialMargin, notional);
        // const marginRatio = Precise.stringDiv (maintenanceRate, collateral);
        const unrealisedPnl = this.safeString2(position, 'unrealisedPnl', 'unrealizedPnL');
        const crossMode = this.safeValue(position, 'crossMode');
        // currently crossMode is always set to false and only isolated positions are supported
        let marginMode = this.safeStringLower(position, 'marginMode');
        if (crossMode !== undefined) {
            marginMode = crossMode ? 'cross' : 'isolated';
        }
        let lastUpdateTimestamp = this.safeInteger(position, 'closeTime');
        if (lastUpdateTimestamp === undefined) {
            lastUpdateTimestamp = this.safeIntegerProduct(position, 'closingTime', 0.000001);
        }
        return this.safePosition({
            'info': position,
            'id': this.safeStringN(position, ['id', 'positionId', 'closeId']),
            'symbol': this.safeString(market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'initialMargin': this.parseNumber(initialMargin),
            'initialMarginPercentage': this.parseNumber(initialMarginPercentage),
            'maintenanceMargin': this.safeNumber2(position, 'posMaint', 'maintenanceMargin'),
            'maintenanceMarginPercentage': this.safeNumber2(position, 'maintMarginReq', 'mmr'),
            'entryPrice': this.safeNumberN(position, ['avgEntryPrice', 'openPrice', 'entryPrice']),
            'notional': this.parseNumber(notional),
            'leverage': this.safeNumber2(position, 'realLeverage', 'leverage'),
            'unrealizedPnl': this.parseNumber(unrealisedPnl),
            'contracts': this.parseNumber(Precise["default"].stringAbs(size)),
            'contractSize': this.safeValue(market, 'contractSize'),
            'realizedPnl': this.safeNumberN(position, ['realisedPnl', 'pnl', 'realizedPnL']),
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber(position, 'liquidationPrice'),
            'markPrice': this.safeNumber(position, 'markPrice'),
            'lastPrice': this.safeNumber(position, 'closePrice'),
            'collateral': this.safeNumber(position, 'maintMargin'),
            'marginMode': marginMode,
            'side': side,
            'percentage': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    /**
     * @method
     * @name kucoin#cancelOrders
     * @description cancel multiple orders for contract markets
     * @see https://www.kucoin.com/docs-new/3470241e0
     * @see https://www.kucoin.com/docs-new/rest/ua/batch-cancel-order-by-id
     * @param {string[]} ids order ids
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] client order ids
     * @param {boolean} [params.uta] set to true to use the unified trading account (uta) endpoint, defaults to false for the contract orders
     * @param {string} [params.accountMode] *for uta endpoint only* 'unified' or 'classic' (default is 'unified')
     * @param {string} [params.marginMode] *for margin orders only* 'cross' or 'isolated'
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let uta = await this.isUTAEnabled();
        [uta, params] = this.handleOptionAndParams(params, 'cancelOrders', 'uta', uta);
        let market = undefined;
        let isContractMarket = true; // default to contract market orders if symbol is not provided, uta endpoint requires a symbol to be provided
        if (symbol !== undefined) {
            market = this.market(symbol);
            isContractMarket = market['contract'];
            if (!isContractMarket) {
                uta = true; // spot market orders can only be cancelled via the uta endpoint
            }
        }
        else if (uta) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrders() requires a symbol argument for uta endpoint');
        }
        const ordersRequests = [];
        const clientOrderIds = this.safeList2(params, 'clientOrderIds', 'clientOids', []);
        params = this.omit(params, ['clientOrderIds', 'clientOids']);
        let useClientorderId = false;
        for (let i = 0; i < clientOrderIds.length; i++) {
            useClientorderId = true;
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' cancelOrders() requires a symbol argument when cancelling by clientOrderIds');
            }
            ordersRequests.push({
                'symbol': market['id'],
                'clientOid': this.safeString(clientOrderIds, i),
            });
        }
        for (let i = 0; i < ids.length; i++) {
            const orderId = ids[i];
            if (uta) {
                ordersRequests.push({
                    'orderId': orderId,
                    'symbol': market['id'],
                });
            }
            else {
                ordersRequests.push(ids[i]);
            }
        }
        const request = {};
        let response = undefined;
        let orders = [];
        if (uta) {
            let accountMode = 'unified';
            [accountMode, params] = this.handleOptionAndParams(params, 'cancelOrders', 'accountMode', accountMode);
            request['accountMode'] = accountMode;
            let marginMode = undefined;
            [marginMode, params] = this.handleMarginModeAndParams('fetchOrder', params);
            const tradeType = this.handleTradeType(isContractMarket, marginMode, params);
            request['tradeType'] = tradeType;
            request['cancelOrderList'] = ordersRequests;
            response = await this.utaPrivatePostAccountModeOrderCancelBatch(this.extend(request, params));
            const data = this.safeDict(response, 'data', {});
            orders = this.safeList(data, 'items', []);
        }
        else {
            const requestKey = useClientorderId ? 'clientOidsList' : 'orderIdsList';
            request[requestKey] = ordersRequests;
            response = await this.futuresPrivateDeleteOrdersMultiCancel(this.extend(request, params));
            //
            //   {
            //       "code": "200000",
            //       "data":
            //       [
            //           {
            //               "orderId": "80465574458560512",
            //               "clientOid": null,
            //               "code": "200",
            //               "msg": "success"
            //           },
            //           {
            //               "orderId": "80465575289094144",
            //               "clientOid": null,
            //               "code": "200",
            //               "msg": "success"
            //           }
            //       ]
            //   }
            //
            orders = this.safeList(response, 'data', []);
        }
        return this.parseOrders(orders, market);
    }
    /**
     * @method
     * @name kucoin#addMargin
     * @description add margin
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/add-isolated-margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.positionSide] *required for hedged position* 'BOTH', 'LONG' or 'SHORT' (default is 'BOTH')
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
     */
    async addMargin(symbol, amount, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const uuid = this.uuid();
        const request = {
            'symbol': market['id'],
            'margin': this.amountToPrecision(symbol, amount),
            'bizNo': uuid,
        };
        const response = await this.futuresPrivatePostPositionMarginDepositMargin(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "id": "62311d26064e8f00013f2c6d",
        //            "symbol": "XRPUSDTM",
        //            "autoDeposit": false,
        //            "maintMarginReq": 0.01,
        //            "riskLimit": 200000,
        //            "realLeverage": 0.88,
        //            "crossMode": false,
        //            "delevPercentage": 0.4,
        //            "openingTimestamp": 1647385894798,
        //            "currentTimestamp": 1647414510672,
        //            "currentQty": -1,
        //            "currentCost": -7.658,
        //            "currentComm": 0.0053561,
        //            "unrealisedCost": -7.658,
        //            "realisedGrossCost": 0,
        //            "realisedCost": 0.0053561,
        //            "isOpen": true,
        //            "markPrice": 0.7635,
        //            "markValue": -7.635,
        //            "posCost": -7.658,
        //            "posCross": 1.00016084,
        //            "posInit": 7.658,
        //            "posComm": 0.00979006,
        //            "posLoss": 0,
        //            "posMargin": 8.6679509,
        //            "posMaint": 0.08637006,
        //            "maintMargin": 8.6909509,
        //            "realisedGrossPnl": 0,
        //            "realisedPnl": -0.0038335,
        //            "unrealisedPnl": 0.023,
        //            "unrealisedPnlPcnt": 0.003,
        //            "unrealisedRoePcnt": 0.003,
        //            "avgEntryPrice": 0.7658,
        //            "liquidationPrice": 1.6239,
        //            "bankruptPrice": 1.6317,
        //            "settleCurrency": "USDT"
        //        }
        //    }
        //
        //
        //    {
        //        "code":"200000",
        //        "msg":"Position does not exist"
        //    }
        //
        const data = this.safeValue(response, 'data');
        return this.extend(this.parseMarginModification(data, market), {
            'amount': this.amountToPrecision(symbol, amount),
            'direction': 'in',
        });
    }
    parseMarginModification(info, market = undefined) {
        //
        //    {
        //        "id": "62311d26064e8f00013f2c6d",
        //        "symbol": "XRPUSDTM",
        //        "autoDeposit": false,
        //        "maintMarginReq": 0.01,
        //        "riskLimit": 200000,
        //        "realLeverage": 0.88,
        //        "crossMode": false,
        //        "delevPercentage": 0.4,
        //        "openingTimestamp": 1647385894798,
        //        "currentTimestamp": 1647414510672,
        //        "currentQty": -1,
        //        "currentCost": -7.658,
        //        "currentComm": 0.0053561,
        //        "unrealisedCost": -7.658,
        //        "realisedGrossCost": 0,
        //        "realisedCost": 0.0053561,
        //        "isOpen": true,
        //        "markPrice": 0.7635,
        //        "markValue": -7.635,
        //        "posCost": -7.658,
        //        "posCross": 1.00016084,
        //        "posInit": 7.658,
        //        "posComm": 0.00979006,
        //        "posLoss": 0,
        //        "posMargin": 8.6679509,
        //        "posMaint": 0.08637006,
        //        "maintMargin": 8.6909509,
        //        "realisedGrossPnl": 0,
        //        "realisedPnl": -0.0038335,
        //        "unrealisedPnl": 0.023,
        //        "unrealisedPnlPcnt": 0.003,
        //        "unrealisedRoePcnt": 0.003,
        //        "avgEntryPrice": 0.7658,
        //        "liquidationPrice": 1.6239,
        //        "bankruptPrice": 1.6317,
        //        "settleCurrency": "USDT"
        //    }
        //
        //    {
        //        "code":"200000",
        //        "msg":"Position does not exist"
        //    }
        //
        const id = this.safeString(info, 'id');
        market = this.safeMarket(id, market);
        const currencyId = this.safeString(info, 'settleCurrency');
        const crossMode = this.safeValue(info, 'crossMode');
        const mode = crossMode ? 'cross' : 'isolated';
        const marketId = this.safeString(market, 'symbol');
        const timestamp = this.safeInteger(info, 'currentTimestamp');
        return {
            'info': info,
            'symbol': this.safeSymbol(marketId, market),
            'type': undefined,
            'marginMode': mode,
            'amount': undefined,
            'total': undefined,
            'code': this.safeCurrencyCode(currencyId),
            'status': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    /**
     * @method
     * @name kucoin#fetchMarginMode
     * @description fetches the margin mode of a trading pair
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-margin-mode
     * @param {string} symbol unified symbol of the market to fetch the margin mode for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    async fetchMarginMode(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.futuresPrivateGetPositionGetMarginMode(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "symbol": "XBTUSDTM",
        //             "marginMode": "ISOLATED"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseMarginMode(data, market);
    }
    parseMarginMode(marginMode, market = undefined) {
        let marginType = this.safeString(marginMode, 'marginMode');
        marginType = (marginType === 'ISOLATED') ? 'isolated' : 'cross';
        return {
            'info': marginMode,
            'symbol': market['symbol'],
            'marginMode': marginType,
        };
    }
    /**
     * @method
     * @name kucoin#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/switch-margin-mode
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setMarginMode(marginMode, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires a symbol argument');
        }
        this.checkRequiredArgument('setMarginMode', marginMode, 'marginMode', ['cross', 'isolated']);
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['contract']) {
            throw new errors.NotSupported(this.id + ' setMarginMode() supports contract markets only');
        }
        const request = {
            'symbol': market['id'],
            'marginMode': marginMode.toUpperCase(),
        };
        const response = await this.futuresPrivatePostPositionChangeMarginMode(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": {
        //            "symbol": "XBTUSDTM",
        //            "marginMode": "ISOLATED"
        //        }
        //    }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseMarginMode(data, market);
    }
    /**
     * @method
     * @name kucoin#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/switch-position-mode
     * @param {bool} hedged set to true to use two way position
     * @param {string} [symbol] not used by bybit setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a response from the exchange
     */
    async setPositionMode(hedged, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const posMode = hedged ? '1' : '0';
        const request = {
            'positionMode': posMode,
        };
        const response = await this.futuresPrivatePostPositionSwitchPositionMode(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": {
        //             "positionMode": 1
        //         }
        //     }
        //
        return response;
    }
    /**
     * @method
     * @name kucoin#fetchPositionMode
     * @description fetchs the position mode, hedged or one way
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-mode
     * @param {string} [symbol] unified symbol of the market to fetch the position mode for (not used in blofin fetchPositionMode)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    async fetchPositionMode(symbol = undefined, params = {}) {
        const response = await this.futuresPrivateGetPositionGetPositionMode(params);
        const data = this.safeDict(response, 'data', {});
        const positionMode = this.safeInteger(data, 'positionMode');
        return {
            'info': data,
            'hedged': positionMode === 1,
        };
    }
    /**
     * @method
     * @name kucoin#closePosition
     * @description closes open positions for a market
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order-test
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} side not used by kucoin closePositions
     * @param {object} [params] extra parameters specific to the okx api endpoint
     * @param {string} [params.clientOrderId] client order id of the order
     * @returns {object[]} [A list of position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async closePosition(symbol, side = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let clientOrderId = this.safeString(params, 'clientOrderId');
        const testOrder = this.safeBool(params, 'test', false);
        params = this.omit(params, ['test', 'clientOrderId']);
        if (clientOrderId === undefined) {
            clientOrderId = this.numberToString(this.nonce());
        }
        const request = {
            'symbol': market['id'],
            'closeOrder': true,
            'clientOid': clientOrderId,
            'type': 'market',
        };
        let response = undefined;
        if (testOrder) {
            response = await this.futuresPrivatePostOrdersTest(this.extend(request, params));
        }
        else {
            response = await this.futuresPrivatePostOrders(this.extend(request, params));
        }
        return this.parseOrder(response, market);
    }
    /**
     * @method
     * @name kucoin#fetchMarketLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-isolated-margin-risk-limit
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true to fetch leverage tiers for unified trading account instead of futures account (default is false)
     * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
     */
    async fetchMarketLeverageTiers(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['contract']) {
            throw new errors.BadRequest(this.id + ' fetchMarketLeverageTiers() supports contract markets only');
        }
        let uta = false;
        [uta, params] = this.handleOptionAndParams(params, 'fetchMarketLeverageTiers', 'uta', uta);
        if (uta) {
            const result = await this.fetchLeverageTiers([symbol], params);
            return this.safeList(result, symbol, []);
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.futuresPublicGetContractsRiskLimitSymbol(this.extend(request, params));
        //
        //    {
        //        "code": "200000",
        //        "data": [
        //            {
        //                "symbol": "ETHUSDTM",
        //                "level": 1,
        //                "maxRiskLimit": 300000,
        //                "minRiskLimit": 0,
        //                "maxLeverage": 100,
        //                "initialMargin": 0.0100000000,
        //                "maintainMargin": 0.0050000000
        //            },
        //            ...
        //        ]
        //    }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseMarketLeverageTiers(data, market);
    }
    parseMarketLeverageTiers(info, market = undefined) {
        /**
         * @ignore
         * @method
         * @name kucoin#parseMarketLeverageTiers
         * @param {object} info Exchange market response for 1 market
         * @param {object} market CCXT market
         */
        //
        // futures
        //    {
        //        "symbol": "ETHUSDTM",
        //        "level": 1,
        //        "maxRiskLimit": 300000,
        //        "minRiskLimit": 0,
        //        "maxLeverage": 100,
        //        "initialMargin": 0.0100000000,
        //        "maintainMargin": 0.0050000000
        //    }
        //
        // uta
        //     {
        //         "symbol": "XBTUSDTM",
        //         "tier": 2,
        //         "maxSize": "600000",
        //         "minSize": "250000",
        //         "maxLeverage": "100",
        //         "initialMarginRate": "0.0100000000",
        //         "maintainMarginRate": "0.0050000000"
        //     }
        //
        const tiers = [];
        for (let i = 0; i < info.length; i++) {
            const tier = this.safeDict(info, i);
            const marketId = this.safeString(tier, 'symbol');
            market = this.safeMarket(marketId, market);
            tiers.push({
                'tier': this.safeNumber2(tier, 'level', 'tier'),
                'symbol': market['symbol'],
                'currency': market['base'],
                'minNotional': this.safeNumber2(tier, 'minRiskLimit', 'minSize'),
                'maxNotional': this.safeNumber2(tier, 'maxRiskLimit', 'maxSize'),
                'maintenanceMarginRate': this.safeNumber2(tier, 'maintainMargin', 'maintainMarginRate'),
                'maxLeverage': this.safeNumber(tier, 'maxLeverage'),
                'info': tier,
            });
        }
        return tiers;
    }
    /**
     * @method
     * @name kucoin#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
     * @see https://www.kucoin.com/docs-new/rest/ua/get-position-tiers
     * @param {string[]} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
     */
    async fetchLeverageTiers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        if (symbols === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchLeverageTiers() requires a symbols argument');
        }
        symbols = this.marketSymbols(symbols, 'swap', false, true);
        let marginMode = 'cross';
        [marginMode, params] = this.handleMarginModeAndParams('fetchLeverageTiers', params, marginMode);
        marginMode = marginMode.toUpperCase();
        if (marginMode !== 'CROSS') {
            throw new errors.BadRequest(this.id + ' fetchLeverageTiers() supports cross margin only');
        }
        const marketIds = this.marketIds(symbols);
        const request = {
            'tradeType': 'FUTURES',
            'marginMode': marginMode,
            'data': 'RISK_LIMIT',
            'accountType': 'UNIFIED',
            'symbol': marketIds.join(','),
        };
        const response = await this.utaGetMarketPositionTiers(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": [
        //             {
        //                 "symbol": "XBTUSDTM",
        //                 "tier": 1,
        //                 "maxSize": "250000",
        //                 "minSize": "0",
        //                 "maxLeverage": "125",
        //                 "initialMarginRate": "0.0080000000",
        //                 "maintainMarginRate": "0.0040000000"
        //             },
        //             {
        //                 "symbol": "XBTUSDTM",
        //                 "tier": 2,
        //                 "maxSize": "600000",
        //                 "minSize": "250000",
        //                 "maxLeverage": "100",
        //                 "initialMarginRate": "0.0100000000",
        //                 "maintainMarginRate": "0.0050000000"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const result = {};
        const tiers = this.parseMarketLeverageTiers(data);
        for (let i = 0; i < tiers.length; i++) {
            const tier = this.safeDict(tiers, i);
            const symbol = this.safeString(tier, 'symbol');
            if (symbol !== undefined) {
                if (!(symbol in result)) {
                    result[symbol] = [];
                }
                result[symbol].push(tier);
            }
        }
        return result;
    }
    /**
     * @method
     * @name kucoin#fetchOpenInterests
     * @description Retrieves the open interest for a list of symbols
     * @see https://www.kucoin.com/docs-new/rest/ua/get-futures-open-interset
     * @param {string[]} [symbols] Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    async fetchOpenInterests(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const request = {};
        if (symbols !== undefined) {
            const length = symbols.length;
            if (length < 11) {
                // the endpoint does not accept more than 10 symbols at a time
                // if user provided more than 10 symbols, we will fetch all symbols
                const marketIds = this.marketIds(symbols);
                request['symbol'] = marketIds.join(',');
            }
        }
        const response = await this.utaGetMarketOpenInterest(this.extend(request, params));
        //
        //     {
        //         "code": "200000",
        //         "data": [
        //             {
        //                 "symbol": "ETHUSDTM",
        //                 "openInterest": "8053960",
        //                 "ts": 1774007467050
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOpenInterests(data, symbols);
    }
    parseOpenInterest(interest, market = undefined) {
        //
        //     {
        //         "symbol": "ETHUSDTM",
        //         "openInterest": "8053960",
        //         "ts": 1774007467050
        //     }
        //
        const marketId = this.safeString(interest, 'symbol');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(interest, 'ts');
        return this.safeOpenInterest({
            'symbol': this.safeSymbol(marketId),
            'openInterestAmount': this.safeNumber(interest, 'openInterest'),
            'openInterestValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': interest,
        }, market);
    }
    /**
     * @method
     * @name kucoin#fetchOpenInterestHistory
     * @description Retrieves the open interest history of a currency
     * @see https://www.kucoin.com/docs-new/rest/ua/get-futures-open-interset
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} timeframe '5m', '15m', '30m', '1h', '4h' or '1d'
     * @param {int} [since] the time(ms) of the earliest record to retrieve as a unix timestamp
     * @param {int} [limit] default 30，max 200
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} an array of [open interest structures]{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    async fetchOpenInterestHistory(symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        const timeframes = {
            '5m': '5min',
            '15m': '15min',
            '30m': '30min',
            '1h': '1hour',
            '4h': '4hour',
            '1d': '1day',
            '5min': '5min',
            '15min': '15min',
            '30min': '30min',
            '1hour': '1hour',
            '4hour': '4hour',
            '1day': '1day',
        };
        const interval = this.safeString(timeframes, timeframe);
        if (interval === undefined) {
            throw new errors.BadRequest(this.id + ' fetchOpenInterestHistory() invalid timeframe, supported are 5m, 15m, 30m, 1h, 4h, 1d');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const maxLimit = 200;
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOpenInterestHistory', 'paginate', paginate);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOpenInterestHistory', symbol, since, limit, timeframe, params, maxLimit);
        }
        let request = {
            'symbol': market['id'],
            'interval': interval,
        };
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        [request, params] = this.handleUntilOption('endAt', request, params);
        const response = await this.utaGetMarketOpenInterest(this.extend(request, params));
        const data = this.safeList(response, 'data');
        return this.parseOpenInterestsHistory(data, market, since, limit);
    }
    /**
     * @method
     * @name kucoin#isUTAEnabled
     * @see https://www.kucoin.com/docs-new/rest/ua/get-account-mode
     * @description returns true or false so the user can check if unified account is enabled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true if unified account is enabled, false otherwise
     */
    async isUTAEnabled(params = {}) {
        let uta = this.safeBool(this.options, 'uta');
        if (uta === undefined) {
            const response = await this.utaPrivateGetAccountMode(params);
            const data = this.safeDict(response, 'data', {});
            const accountMode = this.safeString(data, 'selfAccountMode');
            uta = (accountMode === 'UNIFIED');
            this.options['uta'] = uta;
        }
        return this.safeBool(this.options, 'uta', false);
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        //
        // the v2 URL is https://openapi-v2.kucoin.com/api/v1/endpoint
        //                                ↑                 ↑
        //                                ↑                 ↑
        //
        const versions = this.safeDict(this.options, 'versions', {});
        const apiVersions = this.safeDict(versions, api, {});
        const methodVersions = this.safeDict(apiVersions, method, {});
        const defaultVersion = this.safeString(methodVersions, path, this.options['version']);
        const version = this.safeString(params, 'version', defaultVersion);
        params = this.omit(params, 'version');
        let endpoint = '/api/' + version + '/' + this.implodeParams(path, params);
        if (api === 'webExchange') {
            endpoint = '/' + this.implodeParams(path, params);
        }
        if (api === 'earn') {
            endpoint = '/api/v1/' + this.implodeParams(path, params);
        }
        let isUtaPrivate = false;
        if ((api === 'uta') || (api === 'utaPrivate')) {
            endpoint = '/api/ua/v1/' + this.implodeParams(path, params);
            if (api === 'utaPrivate') {
                isUtaPrivate = true;
            }
        }
        const query = this.omit(params, this.extractParams(path));
        let endpart = '';
        headers = (headers !== undefined) ? headers : {};
        let url = this.urls['api'][api];
        const tradeType = this.safeString(query, 'tradeType');
        if (!this.isEmpty(query)) {
            if (((method === 'GET') || (method === 'DELETE')) && (path !== 'orders/multi-cancel')) {
                endpoint += '?' + this.rawencode(query);
            }
            else {
                if (endpoint === '/api/ua/v1/classic/order/place') {
                    endpoint += '?tradeType=' + tradeType;
                }
                body = this.json(query);
                endpart = body;
                headers['Content-Type'] = 'application/json';
            }
        }
        url = url + endpoint;
        const isFuturePrivate = (api === 'futuresPrivate');
        const isPrivate = (api === 'private');
        const isBroker = (api === 'broker');
        const isEarn = (api === 'earn');
        if (isPrivate || isFuturePrivate || isBroker || isEarn || isUtaPrivate) {
            this.checkRequiredCredentials();
            const timestamp = this.nonce().toString();
            headers = this.extend({
                'KC-API-KEY-VERSION': '2',
                'KC-API-KEY': this.apiKey,
                'KC-API-TIMESTAMP': timestamp,
            }, headers);
            const apiKeyVersion = this.safeString(headers, 'KC-API-KEY-VERSION');
            if (apiKeyVersion === '2') {
                const passphrase = this.hmac(this.encode(this.password), this.encode(this.secret), sha256.sha256, 'base64');
                headers['KC-API-PASSPHRASE'] = passphrase;
            }
            else {
                headers['KC-API-PASSPHRASE'] = this.password;
            }
            const payload = timestamp + method + endpoint + endpart;
            const signature = this.hmac(this.encode(payload), this.encode(this.secret), sha256.sha256, 'base64');
            headers['KC-API-SIGN'] = signature;
            let partner = this.safeDict(this.options, 'partner', {});
            const isUtaFuturePrivate = isUtaPrivate && (tradeType === 'FUTURES');
            const isFuturePartner = isFuturePrivate || isUtaFuturePrivate;
            partner = isFuturePartner ? this.safeValue(partner, 'future', partner) : this.safeValue(partner, 'spot', partner);
            const partnerId = this.safeString(partner, 'id');
            const partnerSecret = this.safeString2(partner, 'secret', 'key');
            if ((partnerId !== undefined) && (partnerSecret !== undefined)) {
                const partnerPayload = timestamp + partnerId + this.apiKey;
                const partnerSignature = this.hmac(this.encode(partnerPayload), this.encode(partnerSecret), sha256.sha256, 'base64');
                headers['KC-API-PARTNER-SIGN'] = partnerSignature;
                headers['KC-API-PARTNER'] = partnerId;
                headers['KC-API-PARTNER-VERIFY'] = 'true';
            }
            if (isBroker) {
                const brokerName = this.safeString(partner, 'name');
                if (brokerName !== undefined) {
                    headers['KC-BROKER-NAME'] = brokerName;
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            this.throwBroadlyMatchedException(this.exceptions['broad'], body, body);
            return undefined;
        }
        //
        // bad
        //     { "code": "400100", "msg": "validation.createOrder.clientOidIsRequired" }
        // good
        //     { code: '200000', data: { ... }}
        //
        const errorCode = this.safeString(response, 'code');
        const message = this.safeString2(response, 'msg', 'data', '');
        const feedback = this.id + ' ' + body;
        this.throwExactlyMatchedException(this.exceptions['exact'], message, feedback);
        this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
        this.throwBroadlyMatchedException(this.exceptions['broad'], body, feedback);
        if (errorCode !== '200000' && errorCode !== '200') {
            throw new errors.ExchangeError(feedback);
        }
        return undefined;
    }
    /**
     * @method
     * @name kucoin#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-spot-margin
     * @param {string} [code] unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfer structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchTransfers', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchTransfers', code, since, limit, params);
        }
        let request = {
            'bizType': 'TRANSFER',
        };
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, 'until');
            request['endAt'] = until;
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['startAt'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        else {
            request['pageSize'] = 500;
        }
        [request, params] = this.handleUntilOption('endAt', request, params);
        const response = await this.privateGetAccountsLedgers(this.extend(request, params));
        //
        // {
        //     "code": "200000",
        //     "data": {
        //         "currentPage": 1,
        //         "pageSize": 50,
        //         "totalNum": 1,
        //         "totalPage": 1,
        //         "items": [
        //             {
        //                 "id": "611a1e7c6a053300067a88d9",
        //                 "currency": "USDT",
        //                 "amount": "10.00059547",
        //                 "fee": "0",
        //                 "balance": "0",
        //                 "accountType": "MAIN",
        //                 "bizType": "Transfer",
        //                 "direction": "in",
        //                 "createdAt": 1629101692950,
        //                 "context": "{\"orderId\":\"611a1e7c6a053300067a88d9\"}"
        //             }
        //         ]
        //     }
        // }
        //
        const data = this.safeDict(response, 'data', {});
        const items = this.safeList(data, 'items', []);
        return this.parseTransfers(items, currency, since, limit);
    }
    /**
     * @method
     * @name kucoinfutures#fetchPositionsADLRank
     * @description fetches the auto deleveraging rank and risk percentage for a list of symbols
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-list
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of [auto de leverage structures]{@link https://docs.ccxt.com/?id=auto-de-leverage-structure}
     */
    async fetchPositionsADLRank(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, true, true, true);
        const response = await this.futuresPrivateGetPositions(params);
        //
        //     {
        //         "code": "200000",
        //         "data": [
        //             {
        //                 "id": "600000000001260912",
        //                 "symbol": "XBTUSDTM",
        //                 "crossMode": true,
        //                 "maintMarginReq": 0.0040000133,
        //                 "delevPercentage": 0.0,
        //                 "openingTimestamp": 1768481882915,
        //                 "currentTimestamp": 1768481897988,
        //                 "currentQty": 1,
        //                 "currentCost": 96.9768,
        //                 "currentComm": 0.05818608,
        //                 "unrealisedCost": 96.9768,
        //                 "realisedGrossCost": 0.0,
        //                 "realisedCost": 0.05818608,
        //                 "isOpen": true,
        //                 "markPrice": 96985.6,
        //                 "markValue": 96.9856,
        //                 "posCost": 96.9768,
        //                 "posInit": 4.84884,
        //                 "posMargin": 4.84928,
        //                 "posMaint": 0.38794369,
        //                 "realisedGrossPnl": 0.0,
        //                 "realisedPnl": -0.05818608,
        //                 "unrealisedPnl": 0.0088,
        //                 "unrealisedPnlPcnt": 1.0E-4,
        //                 "unrealisedRoePcnt": 0.0018,
        //                 "avgEntryPrice": 96976.8,
        //                 "liquidationPrice": 52351.69,
        //                 "bankruptPrice": 52110.87,
        //                 "settleCurrency": "USDT",
        //                 "isInverse": false,
        //                 "maintainMargin": 0.0040000133,
        //                 "marginMode": "CROSS",
        //                 "positionSide": "LONG",
        //                 "leverage": 20,
        //                 "dealComm": -0.05818608,
        //                 "fundingFee": 0,
        //                 "tax": 0
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseADLRanks(data, symbols);
    }
    parseADLRank(info, market = undefined) {
        //
        // fetchPositionsADLRank
        //
        //     {
        //         "id": "600000000001260912",
        //         "symbol": "XBTUSDTM",
        //         "crossMode": true,
        //         "maintMarginReq": 0.0040000133,
        //         "delevPercentage": 0.0,
        //         "openingTimestamp": 1768481882915,
        //         "currentTimestamp": 1768481897988,
        //         "currentQty": 1,
        //         "currentCost": 96.9768,
        //         "currentComm": 0.05818608,
        //         "unrealisedCost": 96.9768,
        //         "realisedGrossCost": 0.0,
        //         "realisedCost": 0.05818608,
        //         "isOpen": true,
        //         "markPrice": 96985.6,
        //         "markValue": 96.9856,
        //         "posCost": 96.9768,
        //         "posInit": 4.84884,
        //         "posMargin": 4.84928,
        //         "posMaint": 0.38794369,
        //         "realisedGrossPnl": 0.0,
        //         "realisedPnl": -0.05818608,
        //         "unrealisedPnl": 0.0088,
        //         "unrealisedPnlPcnt": 1.0E-4,
        //         "unrealisedRoePcnt": 0.0018,
        //         "avgEntryPrice": 96976.8,
        //         "liquidationPrice": 52351.69,
        //         "bankruptPrice": 52110.87,
        //         "settleCurrency": "USDT",
        //         "isInverse": false,
        //         "maintainMargin": 0.0040000133,
        //         "marginMode": "CROSS",
        //         "positionSide": "LONG",
        //         "leverage": 20,
        //         "dealComm": -0.05818608,
        //         "fundingFee": 0,
        //         "tax": 0
        //     }
        //
        const marketId = this.safeString(info, 'symbol');
        const timestamp = this.safeInteger(info, 'openingTimestamp');
        const percentage = this.safeString(info, 'delevPercentage');
        return {
            'info': info,
            'symbol': this.safeSymbol(marketId, market, undefined, 'contract'),
            'rank': undefined,
            'rating': undefined,
            'percentage': this.parseNumber(Precise["default"].stringMul(percentage, '100')),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
}

exports["default"] = kucoin;
