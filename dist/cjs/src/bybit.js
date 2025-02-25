'use strict';

var bybit$1 = require('./abstract/bybit.js');
var number = require('./base/functions/number.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var rsa = require('./base/functions/rsa.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class bybit
 * @augments Exchange
 */
class bybit extends bybit$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'bybit',
            'name': 'Bybit',
            'countries': ['VG'],
            'version': 'v5',
            'userAgent': undefined,
            'rateLimit': 20,
            'hostname': 'bybit.com',
            'pro': true,
            'certified': true,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': true,
                'borrowCrossMargin': true,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'cancelOrdersForSymbols': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketSellOrderWithCost': true,
                'createOrder': true,
                'createOrders': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopLossOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': true,
                'createTriggerOrder': true,
                'editOrder': true,
                'editOrders': true,
                'fetchBalance': true,
                'fetchBidsAsks': 'emulated',
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrder': true,
                'fetchClosedOrders': true,
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
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': 'emulated',
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchGreeks': true,
                'fetchIndexOHLCV': true,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchLeverageTiers': true,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': true,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyLiquidations': true,
                'fetchMySettlementHistory': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': true,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOption': true,
                'fetchOptionChain': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionHistory': 'emulated',
                'fetchPositions': true,
                'fetchPositionsHistory': true,
                'fetchPremiumIndexOHLCV': true,
                'fetchSettlementHistory': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': false,
                'fetchTransfers': true,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': true,
                'fetchWithdrawals': true,
                'repayCrossMargin': true,
                'sandbox': true,
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': true,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': 'D',
                '1w': 'W',
                '1M': 'M',
            },
            'urls': {
                'test': {
                    'spot': 'https://api-testnet.{hostname}',
                    'futures': 'https://api-testnet.{hostname}',
                    'v2': 'https://api-testnet.{hostname}',
                    'public': 'https://api-testnet.{hostname}',
                    'private': 'https://api-testnet.{hostname}',
                },
                'logo': 'https://github.com/user-attachments/assets/97a5d0b3-de10-423d-90e1-6620960025ed',
                'api': {
                    'spot': 'https://api.{hostname}',
                    'futures': 'https://api.{hostname}',
                    'v2': 'https://api.{hostname}',
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'demotrading': {
                    'spot': 'https://api-demo.{hostname}',
                    'futures': 'https://api-demo.{hostname}',
                    'v2': 'https://api-demo.{hostname}',
                    'public': 'https://api-demo.{hostname}',
                    'private': 'https://api-demo.{hostname}',
                },
                'www': 'https://www.bybit.com',
                'doc': [
                    'https://bybit-exchange.github.io/docs/inverse/',
                    'https://bybit-exchange.github.io/docs/linear/',
                    'https://github.com/bybit-exchange',
                ],
                'fees': 'https://help.bybit.com/hc/en-us/articles/360039261154',
                'referral': 'https://www.bybit.com/register?affiliate_id=35953',
            },
            'api': {
                'public': {
                    'get': {
                        // spot
                        'spot/v3/public/symbols': 1,
                        'spot/v3/public/quote/depth': 1,
                        'spot/v3/public/quote/depth/merged': 1,
                        'spot/v3/public/quote/trades': 1,
                        'spot/v3/public/quote/kline': 1,
                        'spot/v3/public/quote/ticker/24hr': 1,
                        'spot/v3/public/quote/ticker/price': 1,
                        'spot/v3/public/quote/ticker/bookTicker': 1,
                        'spot/v3/public/server-time': 1,
                        'spot/v3/public/infos': 1,
                        'spot/v3/public/margin-product-infos': 1,
                        'spot/v3/public/margin-ensure-tokens': 1,
                        // data
                        'v3/public/time': 1,
                        'contract/v3/public/copytrading/symbol/list': 1,
                        // derivative
                        'derivatives/v3/public/order-book/L2': 1,
                        'derivatives/v3/public/kline': 1,
                        'derivatives/v3/public/tickers': 1,
                        'derivatives/v3/public/instruments-info': 1,
                        'derivatives/v3/public/mark-price-kline': 1,
                        'derivatives/v3/public/index-price-kline': 1,
                        'derivatives/v3/public/funding/history-funding-rate': 1,
                        'derivatives/v3/public/risk-limit/list': 1,
                        'derivatives/v3/public/delivery-price': 1,
                        'derivatives/v3/public/recent-trade': 1,
                        'derivatives/v3/public/open-interest': 1,
                        'derivatives/v3/public/insurance': 1,
                        // v5
                        'v5/announcements/index': 5,
                        // market
                        'v5/market/time': 5,
                        'v5/market/kline': 5,
                        'v5/market/mark-price-kline': 5,
                        'v5/market/index-price-kline': 5,
                        'v5/market/premium-index-price-kline': 5,
                        'v5/market/instruments-info': 5,
                        'v5/market/orderbook': 5,
                        'v5/market/tickers': 5,
                        'v5/market/funding/history': 5,
                        'v5/market/recent-trade': 5,
                        'v5/market/open-interest': 5,
                        'v5/market/historical-volatility': 5,
                        'v5/market/insurance': 5,
                        'v5/market/risk-limit': 5,
                        'v5/market/delivery-price': 5,
                        'v5/market/account-ratio': 5,
                        // spot leverage token
                        'v5/spot-lever-token/info': 5,
                        'v5/spot-lever-token/reference': 5,
                        // spot margin trade
                        'v5/spot-margin-trade/data': 5,
                        'v5/spot-margin-trade/collateral': 5,
                        'v5/spot-cross-margin-trade/data': 5,
                        'v5/spot-cross-margin-trade/pledge-token': 5,
                        'v5/spot-cross-margin-trade/borrow-token': 5,
                        // crypto loan
                        'v5/crypto-loan/collateral-data': 5,
                        'v5/crypto-loan/loanable-data': 5,
                        // institutional lending
                        'v5/ins-loan/product-infos': 5,
                        'v5/ins-loan/ensure-tokens-convert': 5,
                    },
                },
                'private': {
                    'get': {
                        'v5/market/instruments-info': 5,
                        // Legacy inverse swap
                        'v2/private/wallet/fund/records': 25,
                        // spot
                        'spot/v3/private/order': 2.5,
                        'spot/v3/private/open-orders': 2.5,
                        'spot/v3/private/history-orders': 2.5,
                        'spot/v3/private/my-trades': 2.5,
                        'spot/v3/private/account': 2.5,
                        'spot/v3/private/reference': 2.5,
                        'spot/v3/private/record': 2.5,
                        'spot/v3/private/cross-margin-orders': 10,
                        'spot/v3/private/cross-margin-account': 10,
                        'spot/v3/private/cross-margin-loan-info': 10,
                        'spot/v3/private/cross-margin-repay-history': 10,
                        'spot/v3/private/margin-loan-infos': 10,
                        'spot/v3/private/margin-repaid-infos': 10,
                        'spot/v3/private/margin-ltv': 10,
                        // account
                        'asset/v3/private/transfer/inter-transfer/list/query': 50,
                        'asset/v3/private/transfer/sub-member/list/query': 50,
                        'asset/v3/private/transfer/sub-member-transfer/list/query': 50,
                        'asset/v3/private/transfer/universal-transfer/list/query': 25,
                        'asset/v3/private/coin-info/query': 25,
                        'asset/v3/private/deposit/address/query': 10,
                        'contract/v3/private/copytrading/order/list': 30,
                        'contract/v3/private/copytrading/position/list': 40,
                        'contract/v3/private/copytrading/wallet/balance': 25,
                        'contract/v3/private/position/limit-info': 25,
                        'contract/v3/private/order/unfilled-orders': 1,
                        'contract/v3/private/order/list': 1,
                        'contract/v3/private/position/list': 1,
                        'contract/v3/private/execution/list': 1,
                        'contract/v3/private/position/closed-pnl': 1,
                        'contract/v3/private/account/wallet/balance': 1,
                        'contract/v3/private/account/fee-rate': 1,
                        'contract/v3/private/account/wallet/fund-records': 1,
                        // derivative
                        'unified/v3/private/order/unfilled-orders': 1,
                        'unified/v3/private/order/list': 1,
                        'unified/v3/private/position/list': 1,
                        'unified/v3/private/execution/list': 1,
                        'unified/v3/private/delivery-record': 1,
                        'unified/v3/private/settlement-record': 1,
                        'unified/v3/private/account/wallet/balance': 1,
                        'unified/v3/private/account/transaction-log': 1,
                        'unified/v3/private/account/borrow-history': 1,
                        'unified/v3/private/account/borrow-rate': 1,
                        'unified/v3/private/account/info': 1,
                        'user/v3/private/frozen-sub-member': 10,
                        'user/v3/private/query-sub-members': 5,
                        'user/v3/private/query-api': 5,
                        'user/v3/private/get-member-type': 1,
                        'asset/v3/private/transfer/transfer-coin/list/query': 50,
                        'asset/v3/private/transfer/account-coin/balance/query': 50,
                        'asset/v3/private/transfer/account-coins/balance/query': 25,
                        'asset/v3/private/transfer/asset-info/query': 50,
                        'asset/v3/public/deposit/allowed-deposit-list/query': 0.17,
                        'asset/v3/private/deposit/record/query': 10,
                        'asset/v3/private/withdraw/record/query': 10,
                        // v5
                        // trade
                        'v5/order/realtime': 5,
                        'v5/order/history': 5,
                        'v5/order/spot-borrow-check': 1,
                        // position
                        'v5/position/list': 5,
                        'v5/execution/list': 5,
                        'v5/position/closed-pnl': 5,
                        'v5/position/move-history': 5,
                        // pre-upgrade
                        'v5/pre-upgrade/order/history': 5,
                        'v5/pre-upgrade/execution/list': 5,
                        'v5/pre-upgrade/position/closed-pnl': 5,
                        'v5/pre-upgrade/account/transaction-log': 5,
                        'v5/pre-upgrade/asset/delivery-record': 5,
                        'v5/pre-upgrade/asset/settlement-record': 5,
                        // account
                        'v5/account/wallet-balance': 1,
                        'v5/account/borrow-history': 1,
                        'v5/account/collateral-info': 1,
                        'v5/asset/coin-greeks': 1,
                        'v5/account/fee-rate': 10,
                        'v5/account/info': 5,
                        'v5/account/transaction-log': 1,
                        'v5/account/contract-transaction-log': 1,
                        'v5/account/smp-group': 1,
                        'v5/account/mmp-state': 5,
                        'v5/account/withdrawal': 5,
                        // asset
                        'v5/asset/exchange/query-coin-list': 0.5,
                        'v5/asset/exchange/convert-result-query': 0.5,
                        'v5/asset/exchange/query-convert-history': 0.5,
                        'v5/asset/exchange/order-record': 5,
                        'v5/asset/delivery-record': 5,
                        'v5/asset/settlement-record': 5,
                        'v5/asset/transfer/query-asset-info': 50,
                        'v5/asset/transfer/query-account-coins-balance': 25,
                        'v5/asset/transfer/query-account-coin-balance': 50,
                        'v5/asset/transfer/query-transfer-coin-list': 50,
                        'v5/asset/transfer/query-inter-transfer-list': 50,
                        'v5/asset/transfer/query-sub-member-list': 50,
                        'v5/asset/transfer/query-universal-transfer-list': 25,
                        'v5/asset/deposit/query-allowed-list': 5,
                        'v5/asset/deposit/query-record': 10,
                        'v5/asset/deposit/query-sub-member-record': 10,
                        'v5/asset/deposit/query-internal-record': 5,
                        'v5/asset/deposit/query-address': 10,
                        'v5/asset/deposit/query-sub-member-address': 10,
                        'v5/asset/coin/query-info': 28,
                        'v5/asset/withdraw/query-record': 10,
                        'v5/asset/withdraw/withdrawable-amount': 5,
                        'v5/asset/withdraw/vasp/list': 5,
                        // user
                        'v5/user/query-sub-members': 5,
                        'v5/user/query-api': 5,
                        'v5/user/sub-apikeys': 5,
                        'v5/user/get-member-type': 5,
                        'v5/user/aff-customer-info': 5,
                        'v5/user/del-submember': 5,
                        'v5/user/submembers': 5,
                        // affilate
                        'v5/affiliate/aff-user-list': 5,
                        // spot leverage token
                        'v5/spot-lever-token/order-record': 1,
                        // spot margin trade
                        'v5/spot-margin-trade/interest-rate-history': 5,
                        'v5/spot-margin-trade/state': 5,
                        'v5/spot-cross-margin-trade/loan-info': 1,
                        'v5/spot-cross-margin-trade/account': 1,
                        'v5/spot-cross-margin-trade/orders': 1,
                        'v5/spot-cross-margin-trade/repay-history': 1,
                        // crypto loan
                        'v5/crypto-loan/borrowable-collateralisable-number': 5,
                        'v5/crypto-loan/ongoing-orders': 5,
                        'v5/crypto-loan/repayment-history': 5,
                        'v5/crypto-loan/borrow-history': 5,
                        'v5/crypto-loan/max-collateral-amount': 5,
                        'v5/crypto-loan/adjustment-history': 5,
                        // institutional lending
                        'v5/ins-loan/product-infos': 5,
                        'v5/ins-loan/ensure-tokens-convert': 5,
                        'v5/ins-loan/loan-order': 5,
                        'v5/ins-loan/repaid-history': 5,
                        'v5/ins-loan/ltv-convert': 5,
                        // c2c lending
                        'v5/lending/info': 5,
                        'v5/lending/history-order': 5,
                        'v5/lending/account': 5,
                        // broker
                        'v5/broker/earning-record': 5,
                        'v5/broker/earnings-info': 5,
                        'v5/broker/account-info': 5,
                        'v5/broker/asset/query-sub-member-deposit-record': 10,
                    },
                    'post': {
                        // spot
                        'spot/v3/private/order': 2.5,
                        'spot/v3/private/cancel-order': 2.5,
                        'spot/v3/private/cancel-orders': 2.5,
                        'spot/v3/private/cancel-orders-by-ids': 2.5,
                        'spot/v3/private/purchase': 2.5,
                        'spot/v3/private/redeem': 2.5,
                        'spot/v3/private/cross-margin-loan': 10,
                        'spot/v3/private/cross-margin-repay': 10,
                        // account
                        'asset/v3/private/transfer/inter-transfer': 150,
                        'asset/v3/private/withdraw/create': 300,
                        'asset/v3/private/withdraw/cancel': 50,
                        'asset/v3/private/transfer/sub-member-transfer': 150,
                        'asset/v3/private/transfer/transfer-sub-member-save': 150,
                        'asset/v3/private/transfer/universal-transfer': 10,
                        'user/v3/private/create-sub-member': 10,
                        'user/v3/private/create-sub-api': 10,
                        'user/v3/private/update-api': 10,
                        'user/v3/private/delete-api': 10,
                        'user/v3/private/update-sub-api': 10,
                        'user/v3/private/delete-sub-api': 10,
                        // contract
                        'contract/v3/private/copytrading/order/create': 30,
                        'contract/v3/private/copytrading/order/cancel': 30,
                        'contract/v3/private/copytrading/order/close': 30,
                        'contract/v3/private/copytrading/position/close': 40,
                        'contract/v3/private/copytrading/position/set-leverage': 40,
                        'contract/v3/private/copytrading/wallet/transfer': 25,
                        'contract/v3/private/copytrading/order/trading-stop': 2.5,
                        'contract/v3/private/order/create': 1,
                        'contract/v3/private/order/cancel': 1,
                        'contract/v3/private/order/cancel-all': 1,
                        'contract/v3/private/order/replace': 1,
                        'contract/v3/private/position/set-auto-add-margin': 1,
                        'contract/v3/private/position/switch-isolated': 1,
                        'contract/v3/private/position/switch-mode': 1,
                        'contract/v3/private/position/switch-tpsl-mode': 1,
                        'contract/v3/private/position/set-leverage': 1,
                        'contract/v3/private/position/trading-stop': 1,
                        'contract/v3/private/position/set-risk-limit': 1,
                        'contract/v3/private/account/setMarginMode': 1,
                        // derivative
                        'unified/v3/private/order/create': 30,
                        'unified/v3/private/order/replace': 30,
                        'unified/v3/private/order/cancel': 30,
                        'unified/v3/private/order/create-batch': 30,
                        'unified/v3/private/order/replace-batch': 30,
                        'unified/v3/private/order/cancel-batch': 30,
                        'unified/v3/private/order/cancel-all': 30,
                        'unified/v3/private/position/set-leverage': 2.5,
                        'unified/v3/private/position/tpsl/switch-mode': 2.5,
                        'unified/v3/private/position/set-risk-limit': 2.5,
                        'unified/v3/private/position/trading-stop': 2.5,
                        'unified/v3/private/account/upgrade-unified-account': 2.5,
                        'unified/v3/private/account/setMarginMode': 2.5,
                        // tax
                        'fht/compliance/tax/v3/private/registertime': 50,
                        'fht/compliance/tax/v3/private/create': 50,
                        'fht/compliance/tax/v3/private/status': 50,
                        'fht/compliance/tax/v3/private/url': 50,
                        // v5
                        // trade
                        'v5/order/create': 2.5,
                        'v5/order/amend': 5,
                        'v5/order/cancel': 2.5,
                        'v5/order/cancel-all': 50,
                        'v5/order/create-batch': 5,
                        'v5/order/amend-batch': 5,
                        'v5/order/cancel-batch': 5,
                        'v5/order/disconnected-cancel-all': 5,
                        // position
                        'v5/position/set-leverage': 5,
                        'v5/position/switch-isolated': 5,
                        'v5/position/set-tpsl-mode': 5,
                        'v5/position/switch-mode': 5,
                        'v5/position/set-risk-limit': 5,
                        'v5/position/trading-stop': 5,
                        'v5/position/set-auto-add-margin': 5,
                        'v5/position/add-margin': 5,
                        'v5/position/move-positions': 5,
                        'v5/position/confirm-pending-mmr': 5,
                        // account
                        'v5/account/upgrade-to-uta': 5,
                        'v5/account/quick-repayment': 5,
                        'v5/account/set-margin-mode': 5,
                        'v5/account/set-hedging-mode': 5,
                        'v5/account/mmp-modify': 5,
                        'v5/account/mmp-reset': 5,
                        // asset
                        'v5/asset/exchange/quote-apply': 1,
                        'v5/asset/exchange/convert-execute': 1,
                        'v5/asset/transfer/inter-transfer': 50,
                        'v5/asset/transfer/save-transfer-sub-member': 150,
                        'v5/asset/transfer/universal-transfer': 10,
                        'v5/asset/deposit/deposit-to-account': 5,
                        'v5/asset/withdraw/create': 50,
                        'v5/asset/withdraw/cancel': 50,
                        // user
                        'v5/user/create-sub-member': 10,
                        'v5/user/create-sub-api': 10,
                        'v5/user/frozen-sub-member': 10,
                        'v5/user/update-api': 10,
                        'v5/user/update-sub-api': 10,
                        'v5/user/delete-api': 10,
                        'v5/user/delete-sub-api': 10,
                        // spot leverage token
                        'v5/spot-lever-token/purchase': 2.5,
                        'v5/spot-lever-token/redeem': 2.5,
                        // spot margin trade
                        'v5/spot-margin-trade/switch-mode': 5,
                        'v5/spot-margin-trade/set-leverage': 5,
                        'v5/spot-cross-margin-trade/loan': 2.5,
                        'v5/spot-cross-margin-trade/repay': 2.5,
                        'v5/spot-cross-margin-trade/switch': 2.5,
                        // crypto loan
                        'v5/crypto-loan/borrow': 5,
                        'v5/crypto-loan/repay': 5,
                        'v5/crypto-loan/adjust-ltv': 5,
                        // institutional lending
                        'v5/ins-loan/association-uid': 5,
                        // c2c lending
                        'v5/lending/purchase': 5,
                        'v5/lending/redeem': 5,
                        'v5/lending/redeem-cancel': 5,
                        'v5/account/set-collateral-switch': 5,
                        'v5/account/set-collateral-switch-batch': 5,
                        // demo trading
                        'v5/account/demo-apply-money': 5,
                        // broker
                        'v5/broker/award/info': 5,
                        'v5/broker/award/distribute-award': 5,
                        'v5/broker/award/distribution-record': 5,
                    },
                },
            },
            'httpExceptions': {
                '403': errors.RateLimitExceeded, // Forbidden -- You request too many times
            },
            'exceptions': {
                // Uncodumented explanation of error strings:
                // - oc_diff: order cost needed to place this order
                // - new_oc: total order cost of open orders including the order you are trying to open
                // - ob: order balance - the total cost of current open orders
                // - ab: available balance
                'exact': {
                    '-10009': errors.BadRequest,
                    '-1004': errors.BadRequest,
                    '-1021': errors.BadRequest,
                    '-1103': errors.BadRequest,
                    '-1140': errors.InvalidOrder,
                    '-1197': errors.InvalidOrder,
                    '-2013': errors.InvalidOrder,
                    '-2015': errors.AuthenticationError,
                    '-6017': errors.BadRequest,
                    '-6025': errors.BadRequest,
                    '-6029': errors.BadRequest,
                    '5004': errors.ExchangeError,
                    '7001': errors.BadRequest,
                    '10001': errors.BadRequest,
                    '10002': errors.InvalidNonce,
                    '10003': errors.AuthenticationError,
                    '10004': errors.AuthenticationError,
                    '10005': errors.PermissionDenied,
                    '10006': errors.RateLimitExceeded,
                    '10007': errors.AuthenticationError,
                    '10008': errors.AccountSuspended,
                    '10009': errors.AuthenticationError,
                    '10010': errors.PermissionDenied,
                    '10014': errors.BadRequest,
                    '10016': errors.ExchangeError,
                    '10017': errors.BadRequest,
                    '10018': errors.RateLimitExceeded,
                    '10020': errors.PermissionDenied,
                    '10024': errors.PermissionDenied,
                    '10027': errors.PermissionDenied,
                    '10028': errors.PermissionDenied,
                    '10029': errors.PermissionDenied,
                    '12137': errors.InvalidOrder,
                    '12201': errors.BadRequest,
                    '12141': errors.BadRequest,
                    '100028': errors.PermissionDenied,
                    '110001': errors.OrderNotFound,
                    '110003': errors.InvalidOrder,
                    '110004': errors.InsufficientFunds,
                    '110005': errors.InvalidOrder,
                    '110006': errors.InsufficientFunds,
                    '110007': errors.InsufficientFunds,
                    '110008': errors.InvalidOrder,
                    '110009': errors.InvalidOrder,
                    '110010': errors.InvalidOrder,
                    '110011': errors.InvalidOrder,
                    '110012': errors.InsufficientFunds,
                    '110013': errors.BadRequest,
                    '110014': errors.InsufficientFunds,
                    '110015': errors.BadRequest,
                    '110016': errors.InvalidOrder,
                    '110017': errors.InvalidOrder,
                    '110018': errors.BadRequest,
                    '110019': errors.InvalidOrder,
                    '110020': errors.InvalidOrder,
                    '110021': errors.InvalidOrder,
                    '110022': errors.InvalidOrder,
                    '110023': errors.InvalidOrder,
                    '110024': errors.BadRequest,
                    '110025': errors.NoChange,
                    '110026': errors.MarginModeAlreadySet,
                    '110027': errors.NoChange,
                    '110028': errors.BadRequest,
                    '110029': errors.BadRequest,
                    '110030': errors.InvalidOrder,
                    '110031': errors.InvalidOrder,
                    '110032': errors.InvalidOrder,
                    '110033': errors.InvalidOrder,
                    '110034': errors.InvalidOrder,
                    '110035': errors.InvalidOrder,
                    '110036': errors.InvalidOrder,
                    '110037': errors.InvalidOrder,
                    '110038': errors.InvalidOrder,
                    '110039': errors.InvalidOrder,
                    '110040': errors.InvalidOrder,
                    '110041': errors.InvalidOrder,
                    '110042': errors.InvalidOrder,
                    '110043': errors.BadRequest,
                    '110044': errors.InsufficientFunds,
                    '110045': errors.InsufficientFunds,
                    '110046': errors.BadRequest,
                    '110047': errors.BadRequest,
                    '110048': errors.BadRequest,
                    '110049': errors.BadRequest,
                    '110050': errors.BadRequest,
                    '110051': errors.InsufficientFunds,
                    '110052': errors.InsufficientFunds,
                    '110053': errors.InsufficientFunds,
                    '110054': errors.InvalidOrder,
                    '110055': errors.InvalidOrder,
                    '110056': errors.InvalidOrder,
                    '110057': errors.InvalidOrder,
                    '110058': errors.InvalidOrder,
                    '110059': errors.InvalidOrder,
                    '110060': errors.BadRequest,
                    '110061': errors.BadRequest,
                    '110062': errors.BadRequest,
                    '110063': errors.ExchangeError,
                    '110064': errors.InvalidOrder,
                    '110065': errors.PermissionDenied,
                    '110066': errors.ExchangeError,
                    '110067': errors.PermissionDenied,
                    '110068': errors.PermissionDenied,
                    '110069': errors.PermissionDenied,
                    '110070': errors.InvalidOrder,
                    '110071': errors.ExchangeError,
                    '110072': errors.InvalidOrder,
                    '110073': errors.ExchangeError,
                    '110092': errors.InvalidOrder,
                    '110093': errors.InvalidOrder,
                    '110094': errors.InvalidOrder,
                    '130006': errors.InvalidOrder,
                    '130021': errors.InsufficientFunds,
                    '130074': errors.InvalidOrder,
                    '131001': errors.InsufficientFunds,
                    '131084': errors.ExchangeError,
                    '131200': errors.ExchangeError,
                    '131201': errors.ExchangeError,
                    '131202': errors.BadRequest,
                    '131203': errors.BadRequest,
                    '131204': errors.BadRequest,
                    '131205': errors.BadRequest,
                    '131206': errors.ExchangeError,
                    '131207': errors.BadRequest,
                    '131208': errors.ExchangeError,
                    '131209': errors.BadRequest,
                    '131210': errors.BadRequest,
                    '131211': errors.BadRequest,
                    '131212': errors.InsufficientFunds,
                    '131213': errors.BadRequest,
                    '131214': errors.BadRequest,
                    '131215': errors.BadRequest,
                    '131216': errors.ExchangeError,
                    '131217': errors.ExchangeError,
                    '131231': errors.NotSupported,
                    '131232': errors.NotSupported,
                    '131002': errors.BadRequest,
                    '131003': errors.ExchangeError,
                    '131004': errors.AuthenticationError,
                    '131085': errors.InsufficientFunds,
                    '131086': errors.BadRequest,
                    '131088': errors.BadRequest,
                    '131089': errors.BadRequest,
                    '131090': errors.ExchangeError,
                    '131091': errors.ExchangeError,
                    '131092': errors.ExchangeError,
                    '131093': errors.ExchangeError,
                    '131094': errors.BadRequest,
                    '131095': errors.BadRequest,
                    '131096': errors.BadRequest,
                    '131097': errors.ExchangeError,
                    '131098': errors.ExchangeError,
                    '131099': errors.ExchangeError,
                    '140001': errors.OrderNotFound,
                    '140003': errors.InvalidOrder,
                    '140004': errors.InsufficientFunds,
                    '140005': errors.InvalidOrder,
                    '140006': errors.InsufficientFunds,
                    '140007': errors.InsufficientFunds,
                    '140008': errors.InvalidOrder,
                    '140009': errors.InvalidOrder,
                    '140010': errors.InvalidOrder,
                    '140011': errors.InvalidOrder,
                    '140012': errors.InsufficientFunds,
                    '140013': errors.BadRequest,
                    '140014': errors.InsufficientFunds,
                    '140015': errors.InvalidOrder,
                    '140016': errors.InvalidOrder,
                    '140017': errors.InvalidOrder,
                    '140018': errors.BadRequest,
                    '140019': errors.InvalidOrder,
                    '140020': errors.InvalidOrder,
                    '140021': errors.InvalidOrder,
                    '140022': errors.InvalidOrder,
                    '140023': errors.InvalidOrder,
                    '140024': errors.BadRequest,
                    '140025': errors.BadRequest,
                    '140026': errors.BadRequest,
                    '140027': errors.BadRequest,
                    '140028': errors.InvalidOrder,
                    '140029': errors.BadRequest,
                    '140030': errors.InvalidOrder,
                    '140031': errors.BadRequest,
                    '140032': errors.InvalidOrder,
                    '140033': errors.InvalidOrder,
                    '140034': errors.InvalidOrder,
                    '140035': errors.InvalidOrder,
                    '140036': errors.BadRequest,
                    '140037': errors.InvalidOrder,
                    '140038': errors.BadRequest,
                    '140039': errors.BadRequest,
                    '140040': errors.InvalidOrder,
                    '140041': errors.InvalidOrder,
                    '140042': errors.InvalidOrder,
                    '140043': errors.BadRequest,
                    '140044': errors.InsufficientFunds,
                    '140045': errors.InsufficientFunds,
                    '140046': errors.BadRequest,
                    '140047': errors.BadRequest,
                    '140048': errors.BadRequest,
                    '140049': errors.BadRequest,
                    '140050': errors.InvalidOrder,
                    '140051': errors.InsufficientFunds,
                    '140052': errors.InsufficientFunds,
                    '140053': errors.InsufficientFunds,
                    '140054': errors.InvalidOrder,
                    '140055': errors.InvalidOrder,
                    '140056': errors.InvalidOrder,
                    '140057': errors.InvalidOrder,
                    '140058': errors.InvalidOrder,
                    '140059': errors.InvalidOrder,
                    '140060': errors.BadRequest,
                    '140061': errors.BadRequest,
                    '140062': errors.BadRequest,
                    '140063': errors.ExchangeError,
                    '140064': errors.InvalidOrder,
                    '140065': errors.PermissionDenied,
                    '140066': errors.ExchangeError,
                    '140067': errors.PermissionDenied,
                    '140068': errors.PermissionDenied,
                    '140069': errors.PermissionDenied,
                    '140070': errors.InvalidOrder,
                    '170001': errors.ExchangeError,
                    '170005': errors.InvalidOrder,
                    '170007': errors.RequestTimeout,
                    '170010': errors.InvalidOrder,
                    '170011': errors.InvalidOrder,
                    '170019': errors.InvalidOrder,
                    '170031': errors.ExchangeError,
                    '170032': errors.ExchangeError,
                    '170033': errors.InsufficientFunds,
                    '170034': errors.InsufficientFunds,
                    '170035': errors.BadRequest,
                    '170036': errors.BadRequest,
                    '170037': errors.BadRequest,
                    '170105': errors.BadRequest,
                    '170115': errors.InvalidOrder,
                    '170116': errors.InvalidOrder,
                    '170117': errors.InvalidOrder,
                    '170121': errors.InvalidOrder,
                    '170124': errors.InvalidOrder,
                    '170130': errors.BadRequest,
                    '170131': errors.InsufficientFunds,
                    '170132': errors.InvalidOrder,
                    '170133': errors.InvalidOrder,
                    '170134': errors.InvalidOrder,
                    '170135': errors.InvalidOrder,
                    '170136': errors.InvalidOrder,
                    '170137': errors.InvalidOrder,
                    '170139': errors.InvalidOrder,
                    '170140': errors.InvalidOrder,
                    '170141': errors.InvalidOrder,
                    '170142': errors.InvalidOrder,
                    '170143': errors.InvalidOrder,
                    '170144': errors.InvalidOrder,
                    '170145': errors.InvalidOrder,
                    '170146': errors.InvalidOrder,
                    '170147': errors.InvalidOrder,
                    '170148': errors.InvalidOrder,
                    '170149': errors.ExchangeError,
                    '170150': errors.ExchangeError,
                    '170151': errors.InvalidOrder,
                    '170157': errors.InvalidOrder,
                    '170159': errors.InvalidOrder,
                    '170190': errors.InvalidOrder,
                    '170191': errors.InvalidOrder,
                    '170192': errors.InvalidOrder,
                    '170193': errors.InvalidOrder,
                    '170194': errors.InvalidOrder,
                    '170195': errors.InvalidOrder,
                    '170196': errors.InvalidOrder,
                    '170197': errors.InvalidOrder,
                    '170198': errors.InvalidOrder,
                    '170199': errors.InvalidOrder,
                    '170200': errors.InvalidOrder,
                    '170201': errors.PermissionDenied,
                    '170202': errors.InvalidOrder,
                    '170203': errors.InvalidOrder,
                    '170204': errors.InvalidOrder,
                    '170206': errors.InvalidOrder,
                    '170210': errors.InvalidOrder,
                    '170213': errors.OrderNotFound,
                    '170217': errors.InvalidOrder,
                    '170218': errors.InvalidOrder,
                    '170221': errors.BadRequest,
                    '170222': errors.RateLimitExceeded,
                    '170223': errors.InsufficientFunds,
                    '170224': errors.PermissionDenied,
                    '170226': errors.InsufficientFunds,
                    '170227': errors.ExchangeError,
                    '170228': errors.InvalidOrder,
                    '170229': errors.InvalidOrder,
                    '170234': errors.ExchangeError,
                    '170241': errors.ManualInteractionNeeded,
                    '175000': errors.InvalidOrder,
                    '175001': errors.InvalidOrder,
                    '175002': errors.InvalidOrder,
                    '175003': errors.InsufficientFunds,
                    '175004': errors.InvalidOrder,
                    '175005': errors.InvalidOrder,
                    '175006': errors.InsufficientFunds,
                    '175007': errors.InvalidOrder,
                    '175008': errors.InvalidOrder,
                    '175009': errors.InvalidOrder,
                    '175010': errors.PermissionDenied,
                    '175012': errors.InvalidOrder,
                    '175013': errors.InvalidOrder,
                    '175014': errors.InvalidOrder,
                    '175015': errors.InvalidOrder,
                    '175016': errors.InvalidOrder,
                    '175017': errors.InvalidOrder,
                    '175027': errors.ExchangeError,
                    '176002': errors.BadRequest,
                    '176004': errors.BadRequest,
                    '176003': errors.BadRequest,
                    '176006': errors.BadRequest,
                    '176005': errors.BadRequest,
                    '176008': errors.BadRequest,
                    '176007': errors.BadRequest,
                    '176010': errors.BadRequest,
                    '176009': errors.BadRequest,
                    '176012': errors.BadRequest,
                    '176011': errors.BadRequest,
                    '176014': errors.BadRequest,
                    '176013': errors.BadRequest,
                    '176015': errors.InsufficientFunds,
                    '176016': errors.BadRequest,
                    '176017': errors.BadRequest,
                    '176018': errors.BadRequest,
                    '176019': errors.BadRequest,
                    '176020': errors.BadRequest,
                    '176021': errors.BadRequest,
                    '176022': errors.BadRequest,
                    '176023': errors.BadRequest,
                    '176024': errors.BadRequest,
                    '176025': errors.BadRequest,
                    '176026': errors.BadRequest,
                    '176027': errors.BadRequest,
                    '176028': errors.BadRequest,
                    '176029': errors.BadRequest,
                    '176030': errors.BadRequest,
                    '176031': errors.BadRequest,
                    '176034': errors.BadRequest,
                    '176035': errors.PermissionDenied,
                    '176036': errors.PermissionDenied,
                    '176037': errors.PermissionDenied,
                    '176038': errors.BadRequest,
                    '176039': errors.BadRequest,
                    '176040': errors.BadRequest,
                    '181000': errors.BadRequest,
                    '181001': errors.BadRequest,
                    '181002': errors.InvalidOrder,
                    '181003': errors.InvalidOrder,
                    '181004': errors.InvalidOrder,
                    '182000': errors.InvalidOrder,
                    '181017': errors.BadRequest,
                    '20001': errors.OrderNotFound,
                    '20003': errors.InvalidOrder,
                    '20004': errors.InvalidOrder,
                    '20005': errors.InvalidOrder,
                    '20006': errors.InvalidOrder,
                    '20007': errors.InvalidOrder,
                    '20008': errors.InvalidOrder,
                    '20009': errors.InvalidOrder,
                    '20010': errors.InvalidOrder,
                    '20011': errors.InvalidOrder,
                    '20012': errors.InvalidOrder,
                    '20013': errors.InvalidOrder,
                    '20014': errors.InvalidOrder,
                    '20015': errors.InvalidOrder,
                    '20016': errors.InvalidOrder,
                    '20017': errors.InvalidOrder,
                    '20018': errors.InvalidOrder,
                    '20019': errors.InvalidOrder,
                    '20020': errors.InvalidOrder,
                    '20021': errors.InvalidOrder,
                    '20022': errors.BadRequest,
                    '20023': errors.BadRequest,
                    '20031': errors.BadRequest,
                    '20070': errors.BadRequest,
                    '20071': errors.BadRequest,
                    '20084': errors.BadRequest,
                    '30001': errors.BadRequest,
                    '30003': errors.InvalidOrder,
                    '30004': errors.InvalidOrder,
                    '30005': errors.InvalidOrder,
                    '30007': errors.InvalidOrder,
                    '30008': errors.InvalidOrder,
                    '30009': errors.ExchangeError,
                    '30010': errors.InsufficientFunds,
                    '30011': errors.PermissionDenied,
                    '30012': errors.PermissionDenied,
                    '30013': errors.PermissionDenied,
                    '30014': errors.InvalidOrder,
                    '30015': errors.InvalidOrder,
                    '30016': errors.ExchangeError,
                    '30017': errors.InvalidOrder,
                    '30018': errors.InvalidOrder,
                    '30019': errors.InvalidOrder,
                    '30020': errors.InvalidOrder,
                    '30021': errors.InvalidOrder,
                    '30022': errors.InvalidOrder,
                    '30023': errors.InvalidOrder,
                    '30024': errors.InvalidOrder,
                    '30025': errors.InvalidOrder,
                    '30026': errors.InvalidOrder,
                    '30027': errors.InvalidOrder,
                    '30028': errors.InvalidOrder,
                    '30029': errors.InvalidOrder,
                    '30030': errors.InvalidOrder,
                    '30031': errors.InsufficientFunds,
                    '30032': errors.InvalidOrder,
                    '30033': errors.RateLimitExceeded,
                    '30034': errors.OrderNotFound,
                    '30035': errors.RateLimitExceeded,
                    '30036': errors.ExchangeError,
                    '30037': errors.InvalidOrder,
                    '30041': errors.ExchangeError,
                    '30042': errors.InsufficientFunds,
                    '30043': errors.InvalidOrder,
                    '30044': errors.InvalidOrder,
                    '30045': errors.InvalidOrder,
                    '30049': errors.InsufficientFunds,
                    '30050': errors.ExchangeError,
                    '30051': errors.ExchangeError,
                    '30052': errors.ExchangeError,
                    '30054': errors.ExchangeError,
                    '30057': errors.ExchangeError,
                    '30063': errors.ExchangeError,
                    '30067': errors.InsufficientFunds,
                    '30068': errors.ExchangeError,
                    '30074': errors.InvalidOrder,
                    '30075': errors.InvalidOrder,
                    '30078': errors.ExchangeError,
                    // '30084': BadRequest, // Isolated not modified, see handleErrors below
                    '33004': errors.AuthenticationError,
                    '34026': errors.ExchangeError,
                    '34036': errors.BadRequest,
                    '35015': errors.BadRequest,
                    '340099': errors.ExchangeError,
                    '3400045': errors.ExchangeError,
                    '3100116': errors.BadRequest,
                    '3100198': errors.BadRequest,
                    '3200300': errors.InsufficientFunds, // {"retCode":3200300,"retMsg":"Insufficient margin balance.","result":null,"retExtMap":{}}
                },
                'broad': {
                    'Not supported symbols': errors.BadSymbol,
                    'Request timeout': errors.RequestTimeout,
                    'unknown orderInfo': errors.OrderNotFound,
                    'invalid api_key': errors.AuthenticationError,
                    // the below two issues are caused as described: issues/9149#issuecomment-1146559498, when response is such:  {"ret_code":130021,"ret_msg":"oc_diff[1707966351], new_oc[1707966351] with ob[....]+AB[....]","ext_code":"","ext_info":"","result":null,"time_now":"1658395300.872766","rate_limit_status":99,"rate_limit_reset_ms":1658395300855,"rate_limit":100}
                    'oc_diff': errors.InsufficientFunds,
                    'new_oc': errors.InsufficientFunds,
                    'openapi sign params error!': errors.AuthenticationError, // {"retCode":10001,"retMsg":"empty value: apiTimestamp[] apiKey[] apiSignature[xxxxxxxxxxxxxxxxxxxxxxx]: openapi sign params error!","result":null,"retExtInfo":null,"time":1664789597123}
                },
            },
            'precisionMode': number.TICK_SIZE,
            'options': {
                'usePrivateInstrumentsInfo': false,
                'enableDemoTrading': false,
                'fetchMarkets': ['spot', 'linear', 'inverse', 'option'],
                'createOrder': {
                    'method': 'privatePostV5OrderCreate', // 'privatePostV5PositionTradingStop'
                },
                'enableUnifiedMargin': undefined,
                'enableUnifiedAccount': undefined,
                'unifiedMarginStatus': undefined,
                'createMarketBuyOrderRequiresPrice': false,
                'createUnifiedMarginAccount': false,
                'defaultType': 'swap',
                'defaultSubType': 'linear',
                'defaultSettle': 'USDT',
                'code': 'BTC',
                'recvWindow': 5 * 1000,
                'timeDifference': 0,
                'adjustForTimeDifference': false,
                'loadAllOptions': false,
                'loadExpiredOptions': false,
                'brokerId': 'CCXT',
                'accountsByType': {
                    'spot': 'SPOT',
                    'margin': 'SPOT',
                    'future': 'CONTRACT',
                    'swap': 'CONTRACT',
                    'option': 'OPTION',
                    'investment': 'INVESTMENT',
                    'unified': 'UNIFIED',
                    'funding': 'FUND',
                    'fund': 'FUND',
                    'contract': 'CONTRACT',
                },
                'accountsById': {
                    'SPOT': 'spot',
                    'MARGIN': 'spot',
                    'CONTRACT': 'contract',
                    'OPTION': 'option',
                    'INVESTMENT': 'investment',
                    'UNIFIED': 'unified',
                    'FUND': 'fund',
                },
                'networks': {
                    'ERC20': 'ETH',
                    'TRC20': 'TRX',
                    'BEP20': 'BSC',
                    'SOL': 'SOL',
                    'ACA': 'ACA',
                    'ADA': 'ADA',
                    'ALGO': 'ALGO',
                    'APT': 'APTOS',
                    'AR': 'AR',
                    'ARBONE': 'ARBI',
                    'AVAXC': 'CAVAX',
                    'AVAXX': 'XAVAX',
                    'ATOM': 'ATOM',
                    'BCH': 'BCH',
                    'BEP2': 'BNB',
                    'CHZ': 'CHZ',
                    'DCR': 'DCR',
                    'DGB': 'DGB',
                    'DOGE': 'DOGE',
                    'DOT': 'DOT',
                    'EGLD': 'EGLD',
                    'EOS': 'EOS',
                    'ETC': 'ETC',
                    'ETHF': 'ETHF',
                    'ETHW': 'ETHW',
                    'FIL': 'FIL',
                    'STEP': 'FITFI',
                    'FLOW': 'FLOW',
                    'FTM': 'FTM',
                    'GLMR': 'GLMR',
                    'HBAR': 'HBAR',
                    'HNT': 'HNT',
                    'ICP': 'ICP',
                    'ICX': 'ICX',
                    'KDA': 'KDA',
                    'KLAY': 'KLAY',
                    'KMA': 'KMA',
                    'KSM': 'KSM',
                    'LTC': 'LTC',
                    // 'TERRA': 'LUNANEW',
                    // 'TERRACLASSIC': 'LUNA',
                    'MATIC': 'MATIC',
                    'MINA': 'MINA',
                    'MOVR': 'MOVR',
                    'NEAR': 'NEAR',
                    'NEM': 'NEM',
                    'OASYS': 'OAS',
                    'OASIS': 'ROSE',
                    'OMNI': 'OMNI',
                    'ONE': 'ONE',
                    'OPTIMISM': 'OP',
                    'POKT': 'POKT',
                    'QTUM': 'QTUM',
                    'RVN': 'RVN',
                    'SC': 'SC',
                    'SCRT': 'SCRT',
                    'STX': 'STX',
                    'THETA': 'THETA',
                    'TON': 'TON',
                    'WAVES': 'WAVES',
                    'WAX': 'WAXP',
                    'XDC': 'XDC',
                    'XEC': 'XEC',
                    'XLM': 'XLM',
                    'XRP': 'XRP',
                    'XTZ': 'XTZ',
                    'XYM': 'XYM',
                    'ZEN': 'ZEN',
                    'ZIL': 'ZIL',
                    'ZKSYNC': 'ZKSYNC',
                    // todo: uncomment after consensus
                    // 'CADUCEUS': 'CMP',
                    // 'KON': 'KON', // konpay, "konchain"
                    // 'AURORA': 'AURORA',
                    // 'BITCOINGOLD': 'BTG',
                },
                'networksById': {
                    'ETH': 'ERC20',
                    'TRX': 'TRC20',
                    'BSC': 'BEP20',
                    'OMNI': 'OMNI',
                    'SPL': 'SOL',
                },
                'defaultNetwork': 'ERC20',
                'defaultNetworks': {
                    'USDT': 'TRC20',
                },
                'intervals': {
                    '5m': '5min',
                    '15m': '15min',
                    '30m': '30min',
                    '1h': '1h',
                    '4h': '4h',
                    '1d': '1d',
                },
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
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
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': true,
                        'selfTradePrevention': true,
                        'trailing': true,
                        'iceberg': false,
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': true,
                    },
                    'createOrders': {
                        'max': 10,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 365 * 2,
                        'untilDays': 7,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 50,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 50,
                        'daysBack': 365 * 2,
                        'daysBackCanceled': 1,
                        'untilDays': 7,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                    'editOrders': {
                        'max': 10,
                    },
                },
                'spot': {
                    'extends': 'default',
                    'createOrder': {
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'attachedStopLossTakeProfit': {
                            'triggerPriceType': undefined,
                            'price': true,
                        },
                        'marketBuyRequiresPrice': true,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': {
                        'extends': 'default',
                    },
                },
                'future': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': {
                        'extends': 'default',
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.00075,
                    'maker': 0.0001,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
        });
    }
    enableDemoTrading(enable) {
        /**
         * @method
         * @name bybit#enableDemoTrading
         * @description enables or disables demo trading mode
         * @see https://bybit-exchange.github.io/docs/v5/demo
         * @param {boolean} [enable] true if demo trading should be enabled, false otherwise
         */
        if (this.isSandboxModeEnabled) {
            throw new errors.NotSupported(this.id + ' demo trading does not support in sandbox environment');
        }
        // enable demo trading in bybit, see: https://bybit-exchange.github.io/docs/v5/demo
        if (enable) {
            this.urls['apiBackupDemoTrading'] = this.urls['api'];
            this.urls['api'] = this.urls['demotrading'];
        }
        else if ('apiBackupDemoTrading' in this.urls) {
            this.urls['api'] = this.urls['apiBackupDemoTrading'];
            const newUrls = this.omit(this.urls, 'apiBackupDemoTrading');
            this.urls = newUrls;
        }
        this.options['enableDemoTrading'] = enable;
    }
    nonce() {
        return this.milliseconds() - this.options['timeDifference'];
    }
    addPaginationCursorToResult(response) {
        const result = this.safeDict(response, 'result', {});
        const data = this.safeListN(result, ['list', 'rows', 'data', 'dataList'], []);
        const paginationCursor = this.safeString2(result, 'nextPageCursor', 'cursor');
        const dataLength = data.length;
        if ((paginationCursor !== undefined) && (dataLength > 0)) {
            const first = data[0];
            first['nextPageCursor'] = paginationCursor;
            data[0] = first;
        }
        return data;
    }
    /**
     * @method
     * @name bybit#isUnifiedEnabled
     * @see https://bybit-exchange.github.io/docs/v5/user/apikey-info#http-request
     * @see https://bybit-exchange.github.io/docs/v5/account/account-info
     * @description returns [enableUnifiedMargin, enableUnifiedAccount] so the user can check if unified account is enabled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} [enableUnifiedMargin, enableUnifiedAccount]
     */
    async isUnifiedEnabled(params = {}) {
        // The API key of user id must own one of permissions will be allowed to call following API endpoints:
        // SUB UID: "Account Transfer"
        // MASTER UID: "Account Transfer", "Subaccount Transfer", "Withdrawal"
        const enableUnifiedMargin = this.safeBool(this.options, 'enableUnifiedMargin');
        const enableUnifiedAccount = this.safeBool(this.options, 'enableUnifiedAccount');
        if (enableUnifiedMargin === undefined || enableUnifiedAccount === undefined) {
            if (this.options['enableDemoTrading']) {
                // info endpoint is not available in demo trading
                // so we're assuming UTA is enabled
                this.options['enableUnifiedMargin'] = false;
                this.options['enableUnifiedAccount'] = true;
                this.options['unifiedMarginStatus'] = 3;
                return [this.options['enableUnifiedMargin'], this.options['enableUnifiedAccount']];
            }
            const rawPromises = [this.privateGetV5UserQueryApi(params), this.privateGetV5AccountInfo(params)];
            const promises = await Promise.all(rawPromises);
            const response = promises[0];
            const accountInfo = promises[1];
            //
            //     {
            //         "retCode": 0,
            //         "retMsg": "",
            //         "result": {
            //             "id": "13770661",
            //             "note": "XXXXXX",
            //             "apiKey": "XXXXXX",
            //             "readOnly": 0,
            //             "secret": "",
            //             "permissions": {
            //                 "ContractTrade": [...],
            //                 "Spot": [...],
            //                 "Wallet": [...],
            //                 "Options": [...],
            //                 "Derivatives": [...],
            //                 "CopyTrading": [...],
            //                 "BlockTrade": [...],
            //                 "Exchange": [...],
            //                 "NFT": [...],
            //             },
            //             "ips": [...],
            //             "type": 1,
            //             "deadlineDay": 83,
            //             "expiredAt": "2023-05-15T03:21:05Z",
            //             "createdAt": "2022-10-16T02:24:40Z",
            //             "unified": 0,
            //             "uta": 0,
            //             "userID": 24600000,
            //             "inviterID": 0,
            //             "vipLevel": "No VIP",
            //             "mktMakerLevel": "0",
            //             "affiliateID": 0,
            //             "rsaPublicKey": "",
            //             "isMaster": false
            //         },
            //         "retExtInfo": {},
            //         "time": 1676891757649
            //     }
            // account info
            //     {
            //         "retCode": 0,
            //         "retMsg": "OK",
            //         "result": {
            //             "marginMode": "REGULAR_MARGIN",
            //             "updatedTime": "1697078946000",
            //             "unifiedMarginStatus": 4,
            //             "dcpStatus": "OFF",
            //             "timeWindow": 10,
            //             "smpGroup": 0,
            //             "isMasterTrader": false,
            //             "spotHedgingStatus": "OFF"
            //         }
            //     }
            //
            const result = this.safeDict(response, 'result', {});
            const accountResult = this.safeDict(accountInfo, 'result', {});
            this.options['enableUnifiedMargin'] = this.safeInteger(result, 'unified') === 1;
            this.options['enableUnifiedAccount'] = this.safeInteger(result, 'uta') === 1;
            this.options['unifiedMarginStatus'] = this.safeInteger(accountResult, 'unifiedMarginStatus', 3); // default to uta.1 if not found
        }
        return [this.options['enableUnifiedMargin'], this.options['enableUnifiedAccount']];
    }
    /**
     * @method
     * @name bybit#upgradeUnifiedTradeAccount
     * @description upgrades the account to unified trade account *warning* this is irreversible
     * @see https://bybit-exchange.github.io/docs/v5/account/upgrade-unified-account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} nothing
     */
    async upgradeUnifiedTradeAccount(params = {}) {
        return await this.privatePostV5AccountUpgradeToUta(params);
    }
    createExpiredOptionMarket(symbol) {
        // support expired option contracts
        let quote = undefined;
        let settle = undefined;
        const optionParts = symbol.split('-');
        const symbolBase = symbol.split('/');
        let base = undefined;
        let expiry = undefined;
        if (symbol.indexOf('/') > -1) {
            base = this.safeString(symbolBase, 0);
            expiry = this.safeString(optionParts, 1);
            const symbolQuoteAndSettle = this.safeString(symbolBase, 1);
            const splitQuote = symbolQuoteAndSettle.split(':');
            const quoteAndSettle = this.safeString(splitQuote, 0);
            quote = quoteAndSettle;
            settle = quoteAndSettle;
        }
        else {
            base = this.safeString(optionParts, 0);
            expiry = this.convertMarketIdExpireDate(this.safeString(optionParts, 1));
            if (symbol.endsWith('-USDT')) {
                quote = 'USDT';
                settle = 'USDT';
            }
            else {
                quote = 'USDC';
                settle = 'USDC';
            }
        }
        const strike = this.safeString(optionParts, 2);
        const optionType = this.safeString(optionParts, 3);
        const datetime = this.convertExpireDate(expiry);
        const timestamp = this.parse8601(datetime);
        let amountPrecision = undefined;
        let pricePrecision = undefined;
        // hard coded amount and price precisions from fetchOptionMarkets
        if (base === 'BTC') {
            amountPrecision = this.parseNumber('0.01');
            pricePrecision = this.parseNumber('5');
        }
        else if (base === 'ETH') {
            amountPrecision = this.parseNumber('0.1');
            pricePrecision = this.parseNumber('0.1');
        }
        else if (base === 'SOL') {
            amountPrecision = this.parseNumber('1');
            pricePrecision = this.parseNumber('0.01');
        }
        return {
            'id': base + '-' + this.convertExpireDateToMarketIdDate(expiry) + '-' + strike + '-' + optionType,
            'symbol': base + '/' + quote + ':' + settle + '-' + expiry + '-' + strike + '-' + optionType,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': base,
            'quoteId': quote,
            'settleId': settle,
            'active': false,
            'type': 'option',
            'linear': undefined,
            'inverse': undefined,
            'spot': false,
            'swap': false,
            'future': false,
            'option': true,
            'margin': false,
            'contract': true,
            'contractSize': this.parseNumber('1'),
            'expiry': timestamp,
            'expiryDatetime': datetime,
            'optionType': (optionType === 'C') ? 'call' : 'put',
            'strike': this.parseNumber(strike),
            'precision': {
                'amount': amountPrecision,
                'price': pricePrecision,
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
    safeMarket(marketId = undefined, market = undefined, delimiter = undefined, marketType = undefined) {
        const isOption = (marketId !== undefined) && ((marketId.indexOf('-C') > -1) || (marketId.indexOf('-P') > -1));
        if (isOption && !(marketId in this.markets_by_id)) {
            // handle expired option contracts
            return this.createExpiredOptionMarket(marketId);
        }
        return super.safeMarket(marketId, market, delimiter, marketType);
    }
    getBybitType(method, market, params = {}) {
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams(method, market, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams(method, market, params);
        if (type === 'option' || type === 'spot') {
            return [type, params];
        }
        return [subType, params];
    }
    getAmount(symbol, amount) {
        // some markets like options might not have the precision available
        // and we shouldn't crash in those cases
        const market = this.market(symbol);
        const emptyPrecisionAmount = (market['precision']['amount'] === undefined);
        const amountString = this.numberToString(amount);
        if (!emptyPrecisionAmount && (amountString !== '0')) {
            return this.amountToPrecision(symbol, amount);
        }
        return amountString;
    }
    getPrice(symbol, price) {
        if (price === undefined) {
            return price;
        }
        const market = this.market(symbol);
        const emptyPrecisionPrice = (market['precision']['price'] === undefined);
        if (!emptyPrecisionPrice) {
            return this.priceToPrecision(symbol, price);
        }
        return price;
    }
    getCost(symbol, cost) {
        const market = this.market(symbol);
        const emptyPrecisionPrice = (market['precision']['price'] === undefined);
        if (!emptyPrecisionPrice) {
            return this.costToPrecision(symbol, cost);
        }
        return cost;
    }
    /**
     * @method
     * @name bybit#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://bybit-exchange.github.io/docs/v5/market/time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.publicGetV5MarketTime(params);
        //
        //    {
        //         "retCode": "0",
        //         "retMsg": "OK",
        //         "result": {
        //             "timeSecond": "1666879482",
        //             "timeNano": "1666879482792685914"
        //         },
        //         "retExtInfo": {},
        //         "time": "1666879482792"
        //     }
        //
        return this.safeInteger(response, 'time');
    }
    /**
     * @method
     * @name bybit#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://bybit-exchange.github.io/docs/v5/asset/coin-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        if (!this.checkRequiredCredentials(false)) {
            return undefined;
        }
        if (this.options['enableDemoTrading']) {
            return undefined;
        }
        const response = await this.privateGetV5AssetCoinQueryInfo(params);
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "",
        //         "result": {
        //             "rows": [
        //                 {
        //                     "name": "BTC",
        //                     "coin": "BTC",
        //                     "remainAmount": "150",
        //                     "chains": [
        //                         {
        //                             "chainType": "BTC",
        //                             "confirmation": "10000",
        //                             "withdrawFee": "0.0005",
        //                             "depositMin": "0.0005",
        //                             "withdrawMin": "0.001",
        //                             "chain": "BTC",
        //                             "chainDeposit": "1",
        //                             "chainWithdraw": "1",
        //                             "minAccuracy": "8"
        //                         }
        //                     ]
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672194582264
        //     }
        //
        const data = this.safeDict(response, 'result', {});
        const rows = this.safeList(data, 'rows', []);
        const result = {};
        for (let i = 0; i < rows.length; i++) {
            const currency = rows[i];
            const currencyId = this.safeString(currency, 'coin');
            const code = this.safeCurrencyCode(currencyId);
            const name = this.safeString(currency, 'name');
            const chains = this.safeList(currency, 'chains', []);
            const networks = {};
            let minPrecision = undefined;
            let minWithdrawFeeString = undefined;
            let minWithdrawString = undefined;
            let minDepositString = undefined;
            let deposit = false;
            let withdraw = false;
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString(chain, 'chain');
                const networkCode = this.networkIdToCode(networkId);
                const precision = this.parseNumber(this.parsePrecision(this.safeString(chain, 'minAccuracy')));
                minPrecision = (minPrecision === undefined) ? precision : Math.min(minPrecision, precision);
                const depositAllowed = this.safeInteger(chain, 'chainDeposit') === 1;
                deposit = (depositAllowed) ? depositAllowed : deposit;
                const withdrawAllowed = this.safeInteger(chain, 'chainWithdraw') === 1;
                withdraw = (withdrawAllowed) ? withdrawAllowed : withdraw;
                const withdrawFeeString = this.safeString(chain, 'withdrawFee');
                if (withdrawFeeString !== undefined) {
                    minWithdrawFeeString = (minWithdrawFeeString === undefined) ? withdrawFeeString : Precise["default"].stringMin(withdrawFeeString, minWithdrawFeeString);
                }
                const minNetworkWithdrawString = this.safeString(chain, 'withdrawMin');
                if (minNetworkWithdrawString !== undefined) {
                    minWithdrawString = (minWithdrawString === undefined) ? minNetworkWithdrawString : Precise["default"].stringMin(minNetworkWithdrawString, minWithdrawString);
                }
                const minNetworkDepositString = this.safeString(chain, 'depositMin');
                if (minNetworkDepositString !== undefined) {
                    minDepositString = (minDepositString === undefined) ? minNetworkDepositString : Precise["default"].stringMin(minNetworkDepositString, minDepositString);
                }
                networks[networkCode] = {
                    'info': chain,
                    'id': networkId,
                    'network': networkCode,
                    'active': depositAllowed && withdrawAllowed,
                    'deposit': depositAllowed,
                    'withdraw': withdrawAllowed,
                    'fee': this.parseNumber(withdrawFeeString),
                    'precision': precision,
                    'limits': {
                        'withdraw': {
                            'min': this.parseNumber(minNetworkWithdrawString),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.parseNumber(minNetworkDepositString),
                            'max': undefined,
                        },
                    },
                };
            }
            result[code] = {
                'info': currency,
                'code': code,
                'id': currencyId,
                'name': name,
                'active': deposit && withdraw,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': this.parseNumber(minWithdrawFeeString),
                'precision': minPrecision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.parseNumber(minWithdrawString),
                        'max': undefined,
                    },
                    'deposit': {
                        'min': this.parseNumber(minDepositString),
                        'max': undefined,
                    },
                },
                'networks': networks,
            };
        }
        return result;
    }
    /**
     * @method
     * @name bybit#fetchMarkets
     * @description retrieves data on all markets for bybit
     * @see https://bybit-exchange.github.io/docs/v5/market/instrument
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference();
        }
        const promisesUnresolved = [];
        const fetchMarkets = this.safeList(this.options, 'fetchMarkets', ['spot', 'linear', 'inverse']);
        for (let i = 0; i < fetchMarkets.length; i++) {
            const marketType = fetchMarkets[i];
            if (marketType === 'spot') {
                promisesUnresolved.push(this.fetchSpotMarkets(params));
            }
            else if (marketType === 'linear') {
                promisesUnresolved.push(this.fetchFutureMarkets({ 'category': 'linear' }));
            }
            else if (marketType === 'inverse') {
                promisesUnresolved.push(this.fetchFutureMarkets({ 'category': 'inverse' }));
            }
            else if (marketType === 'option') {
                promisesUnresolved.push(this.fetchOptionMarkets({ 'baseCoin': 'BTC' }));
                promisesUnresolved.push(this.fetchOptionMarkets({ 'baseCoin': 'ETH' }));
                promisesUnresolved.push(this.fetchOptionMarkets({ 'baseCoin': 'SOL' }));
            }
            else {
                throw new errors.ExchangeError(this.id + ' fetchMarkets() this.options fetchMarkets "' + marketType + '" is not a supported market type');
            }
        }
        const promises = await Promise.all(promisesUnresolved);
        const spotMarkets = this.safeList(promises, 0, []);
        const linearMarkets = this.safeList(promises, 1, []);
        const inverseMarkets = this.safeList(promises, 2, []);
        const btcOptionMarkets = this.safeList(promises, 3, []);
        const ethOptionMarkets = this.safeList(promises, 4, []);
        const solOptionMarkets = this.safeList(promises, 5, []);
        const futureMarkets = this.arrayConcat(linearMarkets, inverseMarkets);
        let optionMarkets = this.arrayConcat(btcOptionMarkets, ethOptionMarkets);
        optionMarkets = this.arrayConcat(optionMarkets, solOptionMarkets);
        const derivativeMarkets = this.arrayConcat(futureMarkets, optionMarkets);
        return this.arrayConcat(spotMarkets, derivativeMarkets);
    }
    async fetchSpotMarkets(params) {
        const request = {
            'category': 'spot',
        };
        const usePrivateInstrumentsInfo = this.safeBool(this.options, 'usePrivateInstrumentsInfo', false);
        let response = undefined;
        if (usePrivateInstrumentsInfo) {
            response = await this.privateGetV5MarketInstrumentsInfo(this.extend(request, params));
        }
        else {
            response = await this.publicGetV5MarketInstrumentsInfo(this.extend(request, params));
        }
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "category": "spot",
        //             "list": [
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "baseCoin": "BTC",
        //                     "quoteCoin": "USDT",
        //                     "innovation": "0",
        //                     "status": "Trading",
        //                     "marginTrading": "both",
        //                     "lotSizeFilter": {
        //                         "basePrecision": "0.000001",
        //                         "quotePrecision": "0.00000001",
        //                         "minOrderQty": "0.00004",
        //                         "maxOrderQty": "63.01197227",
        //                         "minOrderAmt": "1",
        //                         "maxOrderAmt": "100000"
        //                     },
        //                     "priceFilter": {
        //                         "tickSize": "0.01"
        //                     }
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672712468011
        //     }
        //
        const responseResult = this.safeDict(response, 'result', {});
        const markets = this.safeList(responseResult, 'list', []);
        const result = [];
        const takerFee = this.parseNumber('0.001');
        const makerFee = this.parseNumber('0.001');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString(market, 'symbol');
            const baseId = this.safeString(market, 'baseCoin');
            const quoteId = this.safeString(market, 'quoteCoin');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const symbol = base + '/' + quote;
            const status = this.safeString(market, 'status');
            const active = (status === 'Trading');
            const lotSizeFilter = this.safeDict(market, 'lotSizeFilter');
            const priceFilter = this.safeDict(market, 'priceFilter');
            const quotePrecision = this.safeNumber(lotSizeFilter, 'quotePrecision');
            const marginTrading = this.safeString(market, 'marginTrading', 'none');
            const allowsMargin = marginTrading !== 'none';
            result.push(this.safeMarketStructure({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': allowsMargin,
                'swap': false,
                'future': false,
                'option': false,
                'active': active,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': takerFee,
                'maker': makerFee,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber(lotSizeFilter, 'basePrecision'),
                    'price': this.safeNumber(priceFilter, 'tickSize', quotePrecision),
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber('1'),
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber(lotSizeFilter, 'minOrderQty'),
                        'max': this.safeNumber(lotSizeFilter, 'maxOrderQty'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber(lotSizeFilter, 'minOrderAmt'),
                        'max': this.safeNumber(lotSizeFilter, 'maxOrderAmt'),
                    },
                },
                'created': undefined,
                'info': market,
            }));
        }
        return result;
    }
    async fetchFutureMarkets(params) {
        params = this.extend(params);
        params['limit'] = 1000; // minimize number of requests
        let preLaunchMarkets = [];
        const usePrivateInstrumentsInfo = this.safeBool(this.options, 'usePrivateInstrumentsInfo', false);
        let response = undefined;
        if (usePrivateInstrumentsInfo) {
            response = await this.privateGetV5MarketInstrumentsInfo(params);
        }
        else {
            const linearPromises = [
                this.publicGetV5MarketInstrumentsInfo(params),
                this.publicGetV5MarketInstrumentsInfo(this.extend(params, { 'status': 'PreLaunch' })),
            ];
            const promises = await Promise.all(linearPromises);
            response = this.safeDict(promises, 0, {});
            preLaunchMarkets = this.safeDict(promises, 1, {});
        }
        const data = this.safeDict(response, 'result', {});
        let markets = this.safeList(data, 'list', []);
        let paginationCursor = this.safeString(data, 'nextPageCursor');
        if (paginationCursor !== undefined) {
            while (paginationCursor !== undefined) {
                params['cursor'] = paginationCursor;
                let responseInner = undefined;
                if (usePrivateInstrumentsInfo) {
                    responseInner = await this.privateGetV5MarketInstrumentsInfo(params);
                }
                else {
                    responseInner = await this.publicGetV5MarketInstrumentsInfo(params);
                }
                const dataNew = this.safeDict(responseInner, 'result', {});
                const rawMarkets = this.safeList(dataNew, 'list', []);
                const rawMarketsLength = rawMarkets.length;
                if (rawMarketsLength === 0) {
                    break;
                }
                markets = this.arrayConcat(rawMarkets, markets);
                paginationCursor = this.safeString(dataNew, 'nextPageCursor');
            }
        }
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "category": "linear",
        //             "list": [
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "contractType": "LinearPerpetual",
        //                     "status": "Trading",
        //                     "baseCoin": "BTC",
        //                     "quoteCoin": "USDT",
        //                     "launchTime": "1585526400000",
        //                     "deliveryTime": "0",
        //                     "deliveryFeeRate": "",
        //                     "priceScale": "2",
        //                     "leverageFilter": {
        //                         "minLeverage": "1",
        //                         "maxLeverage": "100.00",
        //                         "leverageStep": "0.01"
        //                     },
        //                     "priceFilter": {
        //                         "minPrice": "0.50",
        //                         "maxPrice": "999999.00",
        //                         "tickSize": "0.50"
        //                     },
        //                     "lotSizeFilter": {
        //                         "maxOrderQty": "100.000",
        //                         "minOrderQty": "0.001",
        //                         "qtyStep": "0.001",
        //                         "postOnlyMaxOrderQty": "1000.000"
        //                     },
        //                     "unifiedMarginTrade": true,
        //                     "fundingInterval": 480,
        //                     "settleCoin": "USDT"
        //                 }
        //             ],
        //             "nextPageCursor": ""
        //         },
        //         "retExtInfo": {},
        //         "time": 1672712495660
        //     }
        //
        const preLaunchData = this.safeDict(preLaunchMarkets, 'result', {});
        const preLaunchMarketsList = this.safeList(preLaunchData, 'list', []);
        markets = this.arrayConcat(markets, preLaunchMarketsList);
        const result = [];
        let category = this.safeString(data, 'category');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            if (category === undefined) {
                category = this.safeString(market, 'category');
            }
            const linear = (category === 'linear');
            const inverse = (category === 'inverse');
            const contractType = this.safeString(market, 'contractType');
            const inverseFutures = (contractType === 'InverseFutures');
            const linearFutures = (contractType === 'LinearFutures');
            const linearPerpetual = (contractType === 'LinearPerpetual');
            const inversePerpetual = (contractType === 'InversePerpetual');
            const id = this.safeString(market, 'symbol');
            const baseId = this.safeString(market, 'baseCoin');
            const quoteId = this.safeString(market, 'quoteCoin');
            const defaultSettledId = linear ? quoteId : baseId;
            const settleId = this.safeString(market, 'settleCoin', defaultSettledId);
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            let settle = undefined;
            if (linearPerpetual && (settleId === 'USD')) {
                settle = 'USDC';
            }
            else {
                settle = this.safeCurrencyCode(settleId);
            }
            let symbol = base + '/' + quote;
            const lotSizeFilter = this.safeDict(market, 'lotSizeFilter', {});
            const priceFilter = this.safeDict(market, 'priceFilter', {});
            const leverage = this.safeDict(market, 'leverageFilter', {});
            const status = this.safeString(market, 'status');
            const swap = linearPerpetual || inversePerpetual;
            const future = inverseFutures || linearFutures;
            let type = undefined;
            if (swap) {
                type = 'swap';
            }
            else if (future) {
                type = 'future';
            }
            let expiry = undefined;
            // some swaps have deliveryTime meaning delisting time
            if (!swap) {
                expiry = this.omitZero(this.safeString(market, 'deliveryTime'));
                if (expiry !== undefined) {
                    expiry = parseInt(expiry);
                }
            }
            const expiryDatetime = this.iso8601(expiry);
            symbol = symbol + ':' + settle;
            if (expiry !== undefined) {
                symbol = symbol + '-' + this.yymmdd(expiry);
            }
            const contractSize = inverse ? this.safeNumber2(lotSizeFilter, 'minTradingQty', 'minOrderQty') : this.parseNumber('1');
            result.push(this.safeMarketStructure({
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
                'margin': undefined,
                'swap': swap,
                'future': future,
                'option': false,
                'active': (status === 'Trading'),
                'contract': true,
                'linear': linear,
                'inverse': inverse,
                'taker': this.safeNumber(market, 'takerFee', this.parseNumber('0.0006')),
                'maker': this.safeNumber(market, 'makerFee', this.parseNumber('0.0001')),
                'contractSize': contractSize,
                'expiry': expiry,
                'expiryDatetime': expiryDatetime,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber(lotSizeFilter, 'qtyStep'),
                    'price': this.safeNumber(priceFilter, 'tickSize'),
                },
                'limits': {
                    'leverage': {
                        'min': this.safeNumber(leverage, 'minLeverage'),
                        'max': this.safeNumber(leverage, 'maxLeverage'),
                    },
                    'amount': {
                        'min': this.safeNumber2(lotSizeFilter, 'minTradingQty', 'minOrderQty'),
                        'max': this.safeNumber2(lotSizeFilter, 'maxTradingQty', 'maxOrderQty'),
                    },
                    'price': {
                        'min': this.safeNumber(priceFilter, 'minPrice'),
                        'max': this.safeNumber(priceFilter, 'maxPrice'),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'created': this.safeInteger(market, 'launchTime'),
                'info': market,
            }));
        }
        return result;
    }
    async fetchOptionMarkets(params) {
        const request = {
            'category': 'option',
        };
        const usePrivateInstrumentsInfo = this.safeBool(this.options, 'usePrivateInstrumentsInfo', false);
        let response = undefined;
        if (usePrivateInstrumentsInfo) {
            response = await this.privateGetV5MarketInstrumentsInfo(this.extend(request, params));
        }
        else {
            response = await this.publicGetV5MarketInstrumentsInfo(this.extend(request, params));
        }
        const data = this.safeDict(response, 'result', {});
        let markets = this.safeList(data, 'list', []);
        if (this.options['loadAllOptions']) {
            request['limit'] = 1000;
            let paginationCursor = this.safeString(data, 'nextPageCursor');
            if (paginationCursor !== undefined) {
                while (paginationCursor !== undefined) {
                    request['cursor'] = paginationCursor;
                    let responseInner = undefined;
                    if (usePrivateInstrumentsInfo) {
                        responseInner = await this.privateGetV5MarketInstrumentsInfo(this.extend(request, params));
                    }
                    else {
                        responseInner = await this.publicGetV5MarketInstrumentsInfo(this.extend(request, params));
                    }
                    const dataNew = this.safeDict(responseInner, 'result', {});
                    const rawMarkets = this.safeList(dataNew, 'list', []);
                    const rawMarketsLength = rawMarkets.length;
                    if (rawMarketsLength === 0) {
                        break;
                    }
                    markets = this.arrayConcat(rawMarkets, markets);
                    paginationCursor = this.safeString(dataNew, 'nextPageCursor');
                }
            }
        }
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "success",
        //         "result": {
        //             "category": "option",
        //             "nextPageCursor": "0%2C2",
        //             "list": [
        //                 {
        //                     "symbol": "BTC-29DEC23-80000-C",
        //                     "status": "Trading",
        //                     "baseCoin": "BTC",
        //                     "quoteCoin": "USD",
        //                     "settleCoin": "USDC",
        //                     "optionsType": "Call",
        //                     "launchTime": "1688630400000",
        //                     "deliveryTime": "1703836800000",
        //                     "deliveryFeeRate": "0.00015",
        //                     "priceFilter": {
        //                         "minPrice": "5",
        //                         "maxPrice": "10000000",
        //                         "tickSize": "5"
        //                     },
        //                     "lotSizeFilter": {
        //                         "maxOrderQty": "500",
        //                         "minOrderQty": "0.01",
        //                         "qtyStep": "0.01"
        //                     }
        //                 },
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1688873094448
        //     }
        //
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString(market, 'symbol');
            const baseId = this.safeString(market, 'baseCoin');
            const quoteId = this.safeString(market, 'quoteCoin');
            const settleId = this.safeString(market, 'settleCoin');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const settle = this.safeCurrencyCode(settleId);
            const lotSizeFilter = this.safeDict(market, 'lotSizeFilter', {});
            const priceFilter = this.safeDict(market, 'priceFilter', {});
            const status = this.safeString(market, 'status');
            const expiry = this.safeInteger(market, 'deliveryTime');
            const splitId = id.split('-');
            const strike = this.safeString(splitId, 2);
            const optionLetter = this.safeString(splitId, 3);
            const isActive = (status === 'Trading');
            if (isActive || (this.options['loadAllOptions']) || (this.options['loadExpiredOptions'])) {
                result.push(this.safeMarketStructure({
                    'id': id,
                    'symbol': base + '/' + quote + ':' + settle + '-' + this.yymmdd(expiry) + '-' + strike + '-' + optionLetter,
                    'base': base,
                    'quote': quote,
                    'settle': settle,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'settleId': settleId,
                    'type': 'option',
                    'subType': 'linear',
                    'spot': false,
                    'margin': false,
                    'swap': false,
                    'future': false,
                    'option': true,
                    'active': isActive,
                    'contract': true,
                    'linear': true,
                    'inverse': false,
                    'taker': this.safeNumber(market, 'takerFee', this.parseNumber('0.0006')),
                    'maker': this.safeNumber(market, 'makerFee', this.parseNumber('0.0001')),
                    'contractSize': this.parseNumber('1'),
                    'expiry': expiry,
                    'expiryDatetime': this.iso8601(expiry),
                    'strike': this.parseNumber(strike),
                    'optionType': this.safeStringLower(market, 'optionsType'),
                    'precision': {
                        'amount': this.safeNumber(lotSizeFilter, 'qtyStep'),
                        'price': this.safeNumber(priceFilter, 'tickSize'),
                    },
                    'limits': {
                        'leverage': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'amount': {
                            'min': this.safeNumber(lotSizeFilter, 'minOrderQty'),
                            'max': this.safeNumber(lotSizeFilter, 'maxOrderQty'),
                        },
                        'price': {
                            'min': this.safeNumber(priceFilter, 'minPrice'),
                            'max': this.safeNumber(priceFilter, 'maxPrice'),
                        },
                        'cost': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                    'created': this.safeInteger(market, 'launchTime'),
                    'info': market,
                }));
            }
        }
        return result;
    }
    parseTicker(ticker, market = undefined) {
        //
        // spot
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "bid1Price": "20517.96",
        //         "bid1Size": "2",
        //         "ask1Price": "20527.77",
        //         "ask1Size": "1.862172",
        //         "lastPrice": "20533.13",
        //         "prevPrice24h": "20393.48",
        //         "price24hPcnt": "0.0068",
        //         "highPrice24h": "21128.12",
        //         "lowPrice24h": "20318.89",
        //         "turnover24h": "243765620.65899866",
        //         "volume24h": "11801.27771",
        //         "usdIndexPrice": "20784.12009279"
        //     }
        //
        // linear/inverse
        //
        //     {
        //         "symbol": "BTCUSD",
        //         "lastPrice": "16597.00",
        //         "indexPrice": "16598.54",
        //         "markPrice": "16596.00",
        //         "prevPrice24h": "16464.50",
        //         "price24hPcnt": "0.008047",
        //         "highPrice24h": "30912.50",
        //         "lowPrice24h": "15700.00",
        //         "prevPrice1h": "16595.50",
        //         "openInterest": "373504107",
        //         "openInterestValue": "22505.67",
        //         "turnover24h": "2352.94950046",
        //         "volume24h": "49337318",
        //         "fundingRate": "-0.001034",
        //         "nextFundingTime": "1672387200000",
        //         "predictedDeliveryPrice": "",
        //         "basisRate": "",
        //         "deliveryFeeRate": "",
        //         "deliveryTime": "0",
        //         "ask1Size": "1",
        //         "bid1Price": "16596.00",
        //         "ask1Price": "16597.50",
        //         "bid1Size": "1"
        //     }
        //
        // option
        //
        //     {
        //         "symbol": "BTC-30DEC22-18000-C",
        //         "bid1Price": "0",
        //         "bid1Size": "0",
        //         "bid1Iv": "0",
        //         "ask1Price": "435",
        //         "ask1Size": "0.66",
        //         "ask1Iv": "5",
        //         "lastPrice": "435",
        //         "highPrice24h": "435",
        //         "lowPrice24h": "165",
        //         "markPrice": "0.00000009",
        //         "indexPrice": "16600.55",
        //         "markIv": "0.7567",
        //         "underlyingPrice": "16590.42",
        //         "openInterest": "6.3",
        //         "turnover24h": "2482.73",
        //         "volume24h": "0.15",
        //         "totalVolume": "99",
        //         "totalTurnover": "1967653",
        //         "delta": "0.00000001",
        //         "gamma": "0.00000001",
        //         "vega": "0.00000004",
        //         "theta": "-0.00000152",
        //         "predictedDeliveryPrice": "0",
        //         "change24h": "86"
        //     }
        //
        const isSpot = this.safeString(ticker, 'openInterestValue') === undefined;
        const timestamp = this.safeInteger(ticker, 'time');
        const marketId = this.safeString(ticker, 'symbol');
        const type = isSpot ? 'spot' : 'contract';
        market = this.safeMarket(marketId, market, undefined, type);
        const symbol = this.safeSymbol(marketId, market, undefined, type);
        const last = this.safeString(ticker, 'lastPrice');
        const open = this.safeString(ticker, 'prevPrice24h');
        let percentage = this.safeString(ticker, 'price24hPcnt');
        percentage = Precise["default"].stringMul(percentage, '100');
        const quoteVolume = this.safeString(ticker, 'turnover24h');
        const baseVolume = this.safeString(ticker, 'volume24h');
        const bid = this.safeString(ticker, 'bid1Price');
        const ask = this.safeString(ticker, 'ask1Price');
        const high = this.safeString(ticker, 'highPrice24h');
        const low = this.safeString(ticker, 'lowPrice24h');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': this.safeString2(ticker, 'bidSize', 'bid1Size'),
            'ask': ask,
            'askVolume': this.safeString2(ticker, 'askSize', 'ask1Size'),
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
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
     * @name bybit#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://bybit-exchange.github.io/docs/v5/market/tickers
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchTicker() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            // 'baseCoin': '', Base coin. For option only
            // 'expDate': '', Expiry date. e.g., 25DEC22. For option only
        };
        if (market['spot']) {
            request['category'] = 'spot';
        }
        else {
            if (market['option']) {
                request['category'] = 'option';
            }
            else if (market['linear']) {
                request['category'] = 'linear';
            }
            else if (market['inverse']) {
                request['category'] = 'inverse';
            }
        }
        const response = await this.publicGetV5MarketTickers(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "category": "inverse",
        //             "list": [
        //                 {
        //                     "symbol": "BTCUSD",
        //                     "lastPrice": "16597.00",
        //                     "indexPrice": "16598.54",
        //                     "markPrice": "16596.00",
        //                     "prevPrice24h": "16464.50",
        //                     "price24hPcnt": "0.008047",
        //                     "highPrice24h": "30912.50",
        //                     "lowPrice24h": "15700.00",
        //                     "prevPrice1h": "16595.50",
        //                     "openInterest": "373504107",
        //                     "openInterestValue": "22505.67",
        //                     "turnover24h": "2352.94950046",
        //                     "volume24h": "49337318",
        //                     "fundingRate": "-0.001034",
        //                     "nextFundingTime": "1672387200000",
        //                     "predictedDeliveryPrice": "",
        //                     "basisRate": "",
        //                     "deliveryFeeRate": "",
        //                     "deliveryTime": "0",
        //                     "ask1Size": "1",
        //                     "bid1Price": "16596.00",
        //                     "ask1Price": "16597.50",
        //                     "bid1Size": "1"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672376496682
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const tickers = this.safeList(result, 'list', []);
        const rawTicker = this.safeDict(tickers, 0);
        return this.parseTicker(rawTicker, market);
    }
    /**
     * @method
     * @name bybit#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://bybit-exchange.github.io/docs/v5/market/tickers
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] *contract only* 'linear', 'inverse'
     * @param {string} [params.baseCoin] *option only* base coin, default is 'BTC'
     * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        let parsedSymbols = undefined;
        if (symbols !== undefined) {
            parsedSymbols = [];
            const marketTypeInfo = this.handleMarketTypeAndParams('fetchTickers', undefined, params);
            const defaultType = marketTypeInfo[0]; // don't omit here
            // we can't use marketSymbols here due to the conflicing ids between markets
            let currentType = undefined;
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                // using safeMarket here because if the user provides for instance BTCUSDT and "type": "spot" in params we should
                // infer the market type from the type provided and not from the conflicting id (BTCUSDT might be swap or spot)
                const isExchangeSpecificSymbol = (symbol.indexOf('/') === -1);
                if (isExchangeSpecificSymbol) {
                    market = this.safeMarket(symbol, undefined, undefined, defaultType);
                }
                else {
                    market = this.market(symbol);
                }
                if (currentType === undefined) {
                    currentType = market['type'];
                }
                else if (market['type'] !== currentType) {
                    throw new errors.BadRequest(this.id + ' fetchTickers can only accept a list of symbols of the same type');
                }
                parsedSymbols.push(market['symbol']);
            }
        }
        const request = {
        // 'symbol': market['id'],
        // 'baseCoin': '', // Base coin. For option only
        // 'expDate': '', // Expiry date. e.g., 25DEC22. For option only
        };
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchTickers', market, params);
        // Calls like `.fetchTickers (undefined, {subType:'inverse'})` should be supported for this exchange, so
        // as "options.defaultSubType" is also set in exchange options, we should consider `params.subType`
        // with higher priority and only default to spot, if `subType` is not set in params
        const passedSubType = this.safeString(params, 'subType');
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchTickers', market, params, 'linear');
        // only if passedSubType is undefined, then use spot
        if (type === 'spot' && passedSubType === undefined) {
            request['category'] = 'spot';
        }
        else if (type === 'option') {
            request['category'] = 'option';
            request['baseCoin'] = this.safeString(params, 'baseCoin', 'BTC');
        }
        else if (type === 'swap' || type === 'future' || subType !== undefined) {
            request['category'] = subType;
        }
        const response = await this.publicGetV5MarketTickers(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "category": "inverse",
        //             "list": [
        //                 {
        //                     "symbol": "BTCUSD",
        //                     "lastPrice": "16597.00",
        //                     "indexPrice": "16598.54",
        //                     "markPrice": "16596.00",
        //                     "prevPrice24h": "16464.50",
        //                     "price24hPcnt": "0.008047",
        //                     "highPrice24h": "30912.50",
        //                     "lowPrice24h": "15700.00",
        //                     "prevPrice1h": "16595.50",
        //                     "openInterest": "373504107",
        //                     "openInterestValue": "22505.67",
        //                     "turnover24h": "2352.94950046",
        //                     "volume24h": "49337318",
        //                     "fundingRate": "-0.001034",
        //                     "nextFundingTime": "1672387200000",
        //                     "predictedDeliveryPrice": "",
        //                     "basisRate": "",
        //                     "deliveryFeeRate": "",
        //                     "deliveryTime": "0",
        //                     "ask1Size": "1",
        //                     "bid1Price": "16596.00",
        //                     "ask1Price": "16597.50",
        //                     "bid1Size": "1"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672376496682
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const tickerList = this.safeList(result, 'list', []);
        return this.parseTickers(tickerList, parsedSymbols);
    }
    /**
     * @method
     * @name bybit#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://bybit-exchange.github.io/docs/v5/market/tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] *contract only* 'linear', 'inverse'
     * @param {string} [params.baseCoin] *option only* base coin, default is 'BTC'
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchBidsAsks(symbols = undefined, params = {}) {
        return await this.fetchTickers(symbols, params);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     [
        //         "1621162800",
        //         "49592.43",
        //         "49644.91",
        //         "49342.37",
        //         "49349.42",
        //         "1451.59",
        //         "2.4343353100000003"
        //     ]
        //
        const volumeIndex = (market['inverse']) ? 6 : 5;
        return [
            this.safeInteger(ohlcv, 0),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 4),
            this.safeNumber(ohlcv, volumeIndex),
        ];
    }
    /**
     * @method
     * @name bybit#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bybit-exchange.github.io/docs/v5/market/kline
     * @see https://bybit-exchange.github.io/docs/v5/market/mark-kline
     * @see https://bybit-exchange.github.io/docs/v5/market/index-kline
     * @see https://bybit-exchange.github.io/docs/v5/market/preimum-index-kline
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOHLCV() requires a symbol argument');
        }
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOHLCV', symbol, since, limit, timeframe, params, 1000);
        }
        const market = this.market(symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit === undefined) {
            limit = 200; // default is 200 when requested with `since`
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // max 1000, default 1000
        }
        [request, params] = this.handleUntilOption('end', request, params);
        request['interval'] = this.safeString(this.timeframes, timeframe, timeframe);
        let response = undefined;
        if (market['spot']) {
            request['category'] = 'spot';
            response = await this.publicGetV5MarketKline(this.extend(request, params));
        }
        else {
            const price = this.safeString(params, 'price');
            params = this.omit(params, 'price');
            if (market['linear']) {
                request['category'] = 'linear';
            }
            else if (market['inverse']) {
                request['category'] = 'inverse';
            }
            else {
                throw new errors.NotSupported(this.id + ' fetchOHLCV() is not supported for option markets');
            }
            if (price === 'mark') {
                response = await this.publicGetV5MarketMarkPriceKline(this.extend(request, params));
            }
            else if (price === 'index') {
                response = await this.publicGetV5MarketIndexPriceKline(this.extend(request, params));
            }
            else if (price === 'premiumIndex') {
                response = await this.publicGetV5MarketPremiumIndexPriceKline(this.extend(request, params));
            }
            else {
                response = await this.publicGetV5MarketKline(this.extend(request, params));
            }
        }
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "symbol": "BTCUSD",
        //             "category": "inverse",
        //             "list": [
        //                 [
        //                     "1670608800000",
        //                     "17071",
        //                     "17073",
        //                     "17027",
        //                     "17055.5",
        //                     "268611",
        //                     "15.74462667"
        //                 ],
        //                 [
        //                     "1670605200000",
        //                     "17071.5",
        //                     "17071.5",
        //                     "17061",
        //                     "17071",
        //                     "4177",
        //                     "0.24469757"
        //                 ],
        //                 [
        //                     "1670601600000",
        //                     "17086.5",
        //                     "17088",
        //                     "16978",
        //                     "17071.5",
        //                     "6356",
        //                     "0.37288112"
        //                 ]
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672025956592
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const ohlcvs = this.safeList(result, 'list', []);
        return this.parseOHLCVs(ohlcvs, market, timeframe, since, limit);
    }
    parseFundingRate(ticker, market = undefined) {
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "bidPrice": "19255",
        //         "askPrice": "19255.5",
        //         "lastPrice": "19255.50",
        //         "lastTickDirection": "ZeroPlusTick",
        //         "prevPrice24h": "18634.50",
        //         "price24hPcnt": "0.033325",
        //         "highPrice24h": "19675.00",
        //         "lowPrice24h": "18610.00",
        //         "prevPrice1h": "19278.00",
        //         "markPrice": "19255.00",
        //         "indexPrice": "19260.68",
        //         "openInterest": "48069.549",
        //         "turnover24h": "4686694853.047006",
        //         "volume24h": "243730.252",
        //         "fundingRate": "0.0001",
        //         "nextFundingTime": "1663689600000",
        //         "predictedDeliveryPrice": "",
        //         "basisRate": "",
        //         "deliveryFeeRate": "",
        //         "deliveryTime": "0"
        //     }
        //
        const timestamp = this.safeInteger(ticker, 'timestamp'); // added artificially to avoid changing the signature
        ticker = this.omit(ticker, 'timestamp');
        const marketId = this.safeString(ticker, 'symbol');
        const symbol = this.safeSymbol(marketId, market, undefined, 'swap');
        const fundingRate = this.safeNumber(ticker, 'fundingRate');
        const fundingTimestamp = this.safeInteger(ticker, 'nextFundingTime');
        const markPrice = this.safeNumber(ticker, 'markPrice');
        const indexPrice = this.safeNumber(ticker, 'indexPrice');
        const info = this.safeDict(this.safeMarket(marketId, market, undefined, 'swap'), 'info');
        const fundingInterval = this.safeInteger(info, 'fundingInterval');
        let intervalString = undefined;
        if (fundingInterval !== undefined) {
            const interval = this.parseToInt(fundingInterval / 60);
            intervalString = interval.toString() + 'h';
        }
        return {
            'info': ticker,
            'symbol': symbol,
            'markPrice': markPrice,
            'indexPrice': indexPrice,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'fundingRate': fundingRate,
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601(fundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': intervalString,
        };
    }
    /**
     * @method
     * @name bybit#fetchFundingRates
     * @description fetches funding rates for multiple markets
     * @see https://bybit-exchange.github.io/docs/v5/market/tickers
     * @param {string[]} symbols unified symbols of the markets to fetch the funding rates for, all market funding rates are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRates(symbols = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
            market = this.market(symbols[0]);
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                request['symbol'] = market['id'];
            }
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchFundingRates', market, params);
        if (type !== 'swap') {
            throw new errors.NotSupported(this.id + ' fetchFundingRates() does not support ' + type + ' markets');
        }
        else {
            let subType = undefined;
            [subType, params] = this.handleSubTypeAndParams('fetchFundingRates', market, params, 'linear');
            request['category'] = subType;
        }
        const response = await this.publicGetV5MarketTickers(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "category": "linear",
        //             "list": [
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "bidPrice": "19255",
        //                     "askPrice": "19255.5",
        //                     "lastPrice": "19255.50",
        //                     "lastTickDirection": "ZeroPlusTick",
        //                     "prevPrice24h": "18634.50",
        //                     "price24hPcnt": "0.033325",
        //                     "highPrice24h": "19675.00",
        //                     "lowPrice24h": "18610.00",
        //                     "prevPrice1h": "19278.00",
        //                     "markPrice": "19255.00",
        //                     "indexPrice": "19260.68",
        //                     "openInterest": "48069.549",
        //                     "turnover24h": "4686694853.047006",
        //                     "volume24h": "243730.252",
        //                     "fundingRate": "0.0001",
        //                     "nextFundingTime": "1663689600000",
        //                     "predictedDeliveryPrice": "",
        //                     "basisRate": "",
        //                     "deliveryFeeRate": "",
        //                     "deliveryTime": "0"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": null,
        //         "time": 1663670053454
        //     }
        //
        const data = this.safeDict(response, 'result', {});
        const tickerList = this.safeList(data, 'list', []);
        const timestamp = this.safeInteger(response, 'time');
        for (let i = 0; i < tickerList.length; i++) {
            tickerList[i]['timestamp'] = timestamp; // will be removed inside the parser
        }
        return this.parseFundingRates(tickerList, symbols);
    }
    /**
     * @method
     * @name bybit#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://bybit-exchange.github.io/docs/v5/market/history-fund-rate
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchFundingRateHistory', symbol, since, limit, '8h', params, 200);
        }
        if (limit === undefined) {
            limit = 200;
        }
        const request = {
            // 'category': '', // Product type. linear,inverse
            // 'symbol': '', // Symbol name
            // 'startTime': 0, // The start timestamp (ms)
            // 'endTime': 0, // The end timestamp (ms)
            'limit': limit, // Limit for data size per page. [1, 200]. Default: 200
        };
        const market = this.market(symbol);
        symbol = market['symbol'];
        request['symbol'] = market['id'];
        let type = undefined;
        [type, params] = this.getBybitType('fetchFundingRateHistory', market, params);
        if (type === 'spot' || type === 'option') {
            throw new errors.NotSupported(this.id + ' fetchFundingRateHistory() only support linear and inverse market');
        }
        request['category'] = type;
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger(params, 'until'); // unified in milliseconds
        const endTime = this.safeInteger(params, 'endTime', until); // exchange-specific in milliseconds
        params = this.omit(params, ['endTime', 'until']);
        if (endTime !== undefined) {
            request['endTime'] = endTime;
        }
        else {
            if (since !== undefined) {
                // end time is required when since is not empty
                const fundingInterval = 60 * 60 * 8 * 1000;
                request['endTime'] = since + limit * fundingInterval;
            }
        }
        const response = await this.publicGetV5MarketFundingHistory(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "category": "linear",
        //             "list": [
        //                 {
        //                     "symbol": "ETHPERP",
        //                     "fundingRate": "0.0001",
        //                     "fundingRateTimestamp": "1672041600000"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672051897447
        //     }
        //
        const rates = [];
        const result = this.safeDict(response, 'result');
        const resultList = this.safeList(result, 'list');
        for (let i = 0; i < resultList.length; i++) {
            const entry = resultList[i];
            const timestamp = this.safeInteger(entry, 'fundingRateTimestamp');
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
    parseTrade(trade, market = undefined) {
        //
        // public https://bybit-exchange.github.io/docs/v5/market/recent-trade
        //
        //     {
        //         "execId": "666042b4-50c6-58f3-bd9c-89b2088663ff",
        //         "symbol": "ETHUSD",
        //         "price": "1162.95",
        //         "size": "1",
        //         "side": "Sell",
        //         "time": "1669191277315",
        //         "isBlockTrade": false
        //     }
        //
        // private trades classic spot https://bybit-exchange.github.io/docs/v5/position/execution
        //
        //     {
        //         "symbol": "QNTUSDT",
        //         "orderId": "1538686353240339712",
        //         "orderLinkId": "",
        //         "side": "Sell",
        //         "orderPrice": "",
        //         "orderQty": "",
        //         "leavesQty": "",
        //         "orderType": "Limit",
        //         "stopOrderType": "",
        //         "execFee": "0.040919",
        //         "execId": "2210000000097330907",
        //         "execPrice": "98.6",
        //         "execQty": "0.415",
        //         "execType": "",
        //         "execValue": "",
        //         "execTime": "1698161716634",
        //         "isMaker": true,
        //         "feeRate": "",
        //         "tradeIv": "",
        //         "markIv": "",
        //         "markPrice": "",
        //         "indexPrice": "",
        //         "underlyingPrice": "",
        //         "blockTradeId": ""
        //     }
        //
        // private trades unified https://bybit-exchange.github.io/docs/v5/position/execution
        //
        //     {
        //         "symbol": "QNTUSDT",
        //         "orderType": "Limit",
        //         "underlyingPrice": "",
        //         "orderLinkId": "1549452573428424449",
        //         "orderId": "1549452573428424448",
        //         "stopOrderType": "",
        //         "execTime": "1699445151998",
        //         "feeRate": "0.00025",
        //         "tradeIv": "",
        //         "blockTradeId": "",
        //         "markPrice": "",
        //         "execPrice": "102.8",
        //         "markIv": "",
        //         "orderQty": "3.652",
        //         "orderPrice": "102.8",
        //         "execValue": "1.028",
        //         "closedSize": "",
        //         "execType": "Trade",
        //         "seq": "19157444346",
        //         "side": "Buy",
        //         "indexPrice": "",
        //         "leavesQty": "3.642",
        //         "isMaker": true,
        //         "execFee": "0.0000025",
        //         "execId": "2210000000101610464",
        //         "execQty": "0.01",
        //         "nextPageCursor": "267951%3A0%2C38567%3A0"
        //     },
        //
        // private USDC settled trades
        //
        //     {
        //         "symbol": "ETHPERP",
        //         "orderLinkId": "",
        //         "side": "Buy",
        //         "orderId": "aad0ee44-ce12-4112-aeee-b7829f6c3a26",
        //         "execFee": "0.0210",
        //         "feeRate": "0.000600",
        //         "blockTradeId": "",
        //         "tradeTime": "1669196417930",
        //         "execPrice": "1162.15",
        //         "lastLiquidityInd": "TAKER",
        //         "execValue": "34.8645",
        //         "execType": "Trade",
        //         "execQty": "0.030",
        //         "tradeId": "0e94eaf5-b08e-5505-b43f-7f1f30b1ca80"
        //     }
        //
        const id = this.safeStringN(trade, ['execId', 'id', 'tradeId']);
        const marketId = this.safeString(trade, 'symbol');
        let marketType = ('createType' in trade) ? 'contract' : 'spot';
        if (market !== undefined) {
            marketType = market['type'];
        }
        const category = this.safeString(trade, 'category');
        if (category !== undefined) {
            if (category === 'spot') {
                marketType = 'spot';
            }
        }
        market = this.safeMarket(marketId, market, undefined, marketType);
        const symbol = market['symbol'];
        const amountString = this.safeStringN(trade, ['execQty', 'orderQty', 'size']);
        const priceString = this.safeStringN(trade, ['execPrice', 'orderPrice', 'price']);
        const costString = this.safeString(trade, 'execValue');
        const timestamp = this.safeIntegerN(trade, ['time', 'execTime', 'tradeTime']);
        let side = this.safeStringLower(trade, 'side');
        if (side === undefined) {
            const isBuyer = this.safeInteger(trade, 'isBuyer');
            if (isBuyer !== undefined) {
                side = isBuyer ? 'buy' : 'sell';
            }
        }
        const isMaker = this.safeBool(trade, 'isMaker');
        let takerOrMaker = undefined;
        if (isMaker !== undefined) {
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        else {
            let lastLiquidityInd = this.safeString(trade, 'lastLiquidityInd');
            if (lastLiquidityInd === 'UNKNOWN') {
                lastLiquidityInd = undefined;
            }
            if (lastLiquidityInd !== undefined) {
                if ((lastLiquidityInd === 'TAKER') || (lastLiquidityInd === 'MAKER')) {
                    takerOrMaker = lastLiquidityInd.toLowerCase();
                }
                else {
                    takerOrMaker = (lastLiquidityInd === 'AddedLiquidity') ? 'maker' : 'taker';
                }
            }
        }
        let orderType = this.safeStringLower(trade, 'orderType');
        if (orderType === 'unknown') {
            orderType = undefined;
        }
        const feeCostString = this.safeString(trade, 'execFee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeRateString = this.safeString(trade, 'feeRate');
            let feeCurrencyCode = undefined;
            if (market['spot']) {
                if (Precise["default"].stringGt(feeCostString, '0')) {
                    if (side === 'buy') {
                        feeCurrencyCode = market['base'];
                    }
                    else {
                        feeCurrencyCode = market['quote'];
                    }
                }
                else {
                    if (side === 'buy') {
                        feeCurrencyCode = market['quote'];
                    }
                    else {
                        feeCurrencyCode = market['base'];
                    }
                }
            }
            else {
                feeCurrencyCode = market['inverse'] ? market['base'] : market['settle'];
            }
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
                'rate': feeRateString,
            };
        }
        return this.safeTrade({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'order': this.safeString(trade, 'orderId'),
            'type': orderType,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name bybit#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://bybit-exchange.github.io/docs/v5/market/recent-trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchTrades() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            // 'baseCoin': '', // Base coin. For option only. If not passed, return BTC data by default
            // 'optionType': 'Call', // Option type. Call or Put. For option only
        };
        if (limit !== undefined) {
            // spot: [1,60], default: 60.
            // others: [1,1000], default: 500
            request['limit'] = limit;
        }
        let type = undefined;
        [type, params] = this.getBybitType('fetchTrades', market, params);
        request['category'] = type;
        const response = await this.publicGetV5MarketRecentTrade(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "category": "spot",
        //             "list": [
        //                 {
        //                     "execId": "2100000000007764263",
        //                     "symbol": "BTCUSDT",
        //                     "price": "16618.49",
        //                     "size": "0.00012",
        //                     "side": "Buy",
        //                     "time": "1672052955758",
        //                     "isBlockTrade": false
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672053054358
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const trades = this.safeList(result, 'list', []);
        return this.parseTrades(trades, market, since, limit);
    }
    /**
     * @method
     * @name bybit#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://bybit-exchange.github.io/docs/v5/market/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrderBook() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let defaultLimit = 25;
        if (market['spot']) {
            // limit: [1, 50]. Default: 1
            defaultLimit = 50;
            request['category'] = 'spot';
        }
        else {
            if (market['option']) {
                // limit: [1, 25]. Default: 1
                request['category'] = 'option';
            }
            else if (market['linear']) {
                // limit: [1, 500]. Default: 25
                request['category'] = 'linear';
            }
            else if (market['inverse']) {
                // limit: [1, 500]. Default: 25
                request['category'] = 'inverse';
            }
        }
        request['limit'] = (limit !== undefined) ? limit : defaultLimit;
        const response = await this.publicGetV5MarketOrderbook(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "s": "BTCUSDT",
        //             "a": [
        //                 [
        //                     "16638.64",
        //                     "0.008479"
        //                 ]
        //             ],
        //             "b": [
        //                 [
        //                     "16638.27",
        //                     "0.305749"
        //                 ]
        //             ],
        //             "ts": 1672765737733,
        //             "u": 5277055
        //         },
        //         "retExtInfo": {},
        //         "time": 1672765737734
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const timestamp = this.safeInteger(result, 'ts');
        return this.parseOrderBook(result, symbol, timestamp, 'b', 'a');
    }
    parseBalance(response) {
        //
        // cross
        //     {
        //         "retCode": 0,
        //         "retMsg": "success",
        //         "result": {
        //             "acctBalanceSum": "0.122995614474732872",
        //             "debtBalanceSum": "0.011734191124529754",
        //             "loanAccountList": [
        //                 {
        //                     "free": "0.001143855",
        //                     "interest": "0",
        //                     "loan": "0",
        //                     "locked": "0",
        //                     "tokenId": "BTC",
        //                     "total": "0.001143855"
        //                 },
        //                 {
        //                     "free": "200.00005568",
        //                     "interest": "0.0008391",
        //                     "loan": "200",
        //                     "locked": "0",
        //                     "tokenId": "USDT",
        //                     "total": "200.00005568"
        //                 },
        //             ],
        //             "riskRate": "0.0954",
        //             "status": 1
        //         },
        //         "retExtInfo": {},
        //         "time": 1669843584123
        //     }
        //
        // funding
        //     {
        //         "retCode": 0,
        //         "retMsg": "success",
        //         "result": {
        //             "memberId": "533285",
        //             "accountType": "FUND",
        //             "balance": [
        //                 {
        //                     "coin": "USDT",
        //                     "transferBalance": "1010",
        //                     "walletBalance": "1010",
        //                     "bonus": ""
        //                 },
        //                 {
        //                     "coin": "USDC",
        //                     "transferBalance": "0",
        //                     "walletBalance": "0",
        //                     "bonus": ""
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1675865290069
        //     }
        //
        //  spot & swap
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "totalEquity": "18070.32797922",
        //                     "accountIMRate": "0.0101",
        //                     "totalMarginBalance": "18070.32797922",
        //                     "totalInitialMargin": "182.60183684",
        //                     "accountType": "UNIFIED",
        //                     "totalAvailableBalance": "17887.72614237",
        //                     "accountMMRate": "0",
        //                     "totalPerpUPL": "-0.11001349",
        //                     "totalWalletBalance": "18070.43799271",
        //                     "accountLTV": "0.017",
        //                     "totalMaintenanceMargin": "0.38106773",
        //                     "coin": [
        //                         {
        //                             "availableToBorrow": "2.5",
        //                             "bonus": "0",
        //                             "accruedInterest": "0",
        //                             "availableToWithdraw": "0.805994",
        //                             "totalOrderIM": "0",
        //                             "equity": "0.805994",
        //                             "totalPositionMM": "0",
        //                             "usdValue": "12920.95352538",
        //                             "unrealisedPnl": "0",
        //                             "borrowAmount": "0",
        //                             "totalPositionIM": "0",
        //                             "walletBalance": "0.805994",
        //                             "cumRealisedPnl": "0",
        //                             "coin": "BTC"
        //                         }
        //                     ]
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672125441042
        //     }
        //
        const timestamp = this.safeInteger(response, 'time');
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
        const responseResult = this.safeDict(response, 'result', {});
        const currencyList = this.safeListN(responseResult, ['loanAccountList', 'list', 'balance']);
        if (currencyList === undefined) {
            // usdc wallet
            const code = 'USDC';
            const account = this.account();
            account['free'] = this.safeString(responseResult, 'availableBalance');
            account['total'] = this.safeString(responseResult, 'walletBalance');
            result[code] = account;
        }
        else {
            for (let i = 0; i < currencyList.length; i++) {
                const entry = currencyList[i];
                const accountType = this.safeString(entry, 'accountType');
                if (accountType === 'UNIFIED' || accountType === 'CONTRACT' || accountType === 'SPOT') {
                    const coins = this.safeList(entry, 'coin');
                    for (let j = 0; j < coins.length; j++) {
                        const account = this.account();
                        const coinEntry = coins[j];
                        const loan = this.safeString(coinEntry, 'borrowAmount');
                        const interest = this.safeString(coinEntry, 'accruedInterest');
                        if ((loan !== undefined) && (interest !== undefined)) {
                            account['debt'] = Precise["default"].stringAdd(loan, interest);
                        }
                        account['total'] = this.safeString(coinEntry, 'walletBalance');
                        const free = this.safeString2(coinEntry, 'availableToWithdraw', 'free');
                        if (free !== undefined) {
                            account['free'] = free;
                        }
                        else {
                            const locked = this.safeString(coinEntry, 'locked', '0');
                            const totalPositionIm = this.safeString(coinEntry, 'totalPositionIM', '0');
                            const totalOrderIm = this.safeString(coinEntry, 'totalOrderIM', '0');
                            let totalUsed = Precise["default"].stringAdd(locked, totalPositionIm);
                            totalUsed = Precise["default"].stringAdd(totalUsed, totalOrderIm);
                            account['used'] = totalUsed;
                        }
                        // account['used'] = this.safeString (coinEntry, 'locked');
                        const currencyId = this.safeString(coinEntry, 'coin');
                        const code = this.safeCurrencyCode(currencyId);
                        result[code] = account;
                    }
                }
                else {
                    const account = this.account();
                    const loan = this.safeString(entry, 'loan');
                    const interest = this.safeString(entry, 'interest');
                    if ((loan !== undefined) && (interest !== undefined)) {
                        account['debt'] = Precise["default"].stringAdd(loan, interest);
                    }
                    account['total'] = this.safeString2(entry, 'total', 'walletBalance');
                    account['free'] = this.safeStringN(entry, ['free', 'availableBalanceWithoutConvert', 'availableBalance', 'transferBalance']);
                    account['used'] = this.safeString(entry, 'locked');
                    const currencyId = this.safeStringN(entry, ['tokenId', 'coin', 'currencyCoin']);
                    const code = this.safeCurrencyCode(currencyId);
                    result[code] = account;
                }
            }
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name bybit#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://bybit-exchange.github.io/docs/v5/spot-margin-normal/account-info
     * @see https://bybit-exchange.github.io/docs/v5/asset/all-balance
     * @see https://bybit-exchange.github.io/docs/v5/account/wallet-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] wallet type, ['spot', 'swap', 'funding']
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const request = {};
        const [enableUnifiedMargin, enableUnifiedAccount] = await this.isUnifiedEnabled();
        const isUnifiedAccount = (enableUnifiedMargin || enableUnifiedAccount);
        let type = undefined;
        // don't use getBybitType here
        [type, params] = this.handleMarketTypeAndParams('fetchBalance', undefined, params);
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchBalance', undefined, params);
        if ((type === 'swap') || (type === 'future')) {
            type = subType;
        }
        const lowercaseRawType = (type !== undefined) ? type.toLowerCase() : undefined;
        const isSpot = (type === 'spot');
        const isLinear = (type === 'linear');
        const isInverse = (type === 'inverse');
        const isFunding = (lowercaseRawType === 'fund') || (lowercaseRawType === 'funding');
        if (isUnifiedAccount) {
            const unifiedMarginStatus = this.safeInteger(this.options, 'unifiedMarginStatus', 3);
            if (unifiedMarginStatus < 5) {
                // it's not uta.20 where inverse are unified
                if (isInverse) {
                    type = 'contract';
                }
                else {
                    type = 'unified';
                }
            }
            else {
                type = 'unified'; // uta.20 where inverse are unified
            }
        }
        else {
            if (isLinear || isInverse) {
                type = 'contract';
            }
        }
        const accountTypes = this.safeDict(this.options, 'accountsByType', {});
        const unifiedType = this.safeStringUpper(accountTypes, type, type);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchBalance', params);
        let response = undefined;
        if (isSpot && (marginMode !== undefined)) {
            response = await this.privateGetV5SpotCrossMarginTradeAccount(this.extend(request, params));
        }
        else if (isFunding) {
            // use this endpoint only we have no other choice
            // because it requires transfer permission
            request['accountType'] = 'FUND';
            response = await this.privateGetV5AssetTransferQueryAccountCoinsBalance(this.extend(request, params));
        }
        else {
            request['accountType'] = unifiedType;
            response = await this.privateGetV5AccountWalletBalance(this.extend(request, params));
        }
        //
        // cross
        //     {
        //         "retCode": 0,
        //         "retMsg": "success",
        //         "result": {
        //             "acctBalanceSum": "0.122995614474732872",
        //             "debtBalanceSum": "0.011734191124529754",
        //             "loanAccountList": [
        //                 {
        //                     "free": "0.001143855",
        //                     "interest": "0",
        //                     "loan": "0",
        //                     "locked": "0",
        //                     "tokenId": "BTC",
        //                     "total": "0.001143855"
        //                 },
        //                 {
        //                     "free": "200.00005568",
        //                     "interest": "0.0008391",
        //                     "loan": "200",
        //                     "locked": "0",
        //                     "tokenId": "USDT",
        //                     "total": "200.00005568"
        //                 },
        //             ],
        //             "riskRate": "0.0954",
        //             "status": 1
        //         },
        //         "retExtInfo": {},
        //         "time": 1669843584123
        //     }
        //
        // funding
        //     {
        //         "retCode": 0,
        //         "retMsg": "success",
        //         "result": {
        //             "memberId": "533285",
        //             "accountType": "FUND",
        //             "balance": [
        //                 {
        //                     "coin": "USDT",
        //                     "transferBalance": "1010",
        //                     "walletBalance": "1010",
        //                     "bonus": ""
        //                 },
        //                 {
        //                     "coin": "USDC",
        //                     "transferBalance": "0",
        //                     "walletBalance": "0",
        //                     "bonus": ""
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1675865290069
        //     }
        //
        //  spot & swap
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "totalEquity": "18070.32797922",
        //                     "accountIMRate": "0.0101",
        //                     "totalMarginBalance": "18070.32797922",
        //                     "totalInitialMargin": "182.60183684",
        //                     "accountType": "UNIFIED",
        //                     "totalAvailableBalance": "17887.72614237",
        //                     "accountMMRate": "0",
        //                     "totalPerpUPL": "-0.11001349",
        //                     "totalWalletBalance": "18070.43799271",
        //                     "accountLTV": "0.017",
        //                     "totalMaintenanceMargin": "0.38106773",
        //                     "coin": [
        //                         {
        //                             "availableToBorrow": "2.5",
        //                             "bonus": "0",
        //                             "accruedInterest": "0",
        //                             "availableToWithdraw": "0.805994",
        //                             "totalOrderIM": "0",
        //                             "equity": "0.805994",
        //                             "totalPositionMM": "0",
        //                             "usdValue": "12920.95352538",
        //                             "unrealisedPnl": "0",
        //                             "borrowAmount": "0",
        //                             "totalPositionIM": "0",
        //                             "walletBalance": "0.805994",
        //                             "cumRealisedPnl": "0",
        //                             "coin": "BTC"
        //                         }
        //                     ]
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672125441042
        //     }
        //
        return this.parseBalance(response);
    }
    parseOrderStatus(status) {
        const statuses = {
            // v3 spot
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PENDING_CANCEL': 'open',
            'PENDING_NEW': 'open',
            'REJECTED': 'rejected',
            'PARTIALLY_FILLED_CANCELLED': 'closed',
            // v3 contract / unified margin / unified account
            'Created': 'open',
            'New': 'open',
            'Rejected': 'rejected',
            'PartiallyFilled': 'open',
            'PartiallyFilledCanceled': 'closed',
            'Filled': 'closed',
            'PendingCancel': 'open',
            'Cancelled': 'canceled',
            // below this line the status only pertains to conditional orders
            'Untriggered': 'open',
            'Deactivated': 'canceled',
            'Triggered': 'open',
            'Active': 'open',
        };
        return this.safeString(statuses, status, status);
    }
    parseTimeInForce(timeInForce) {
        const timeInForces = {
            'GoodTillCancel': 'GTC',
            'ImmediateOrCancel': 'IOC',
            'FillOrKill': 'FOK',
            'PostOnly': 'PO',
        };
        return this.safeString(timeInForces, timeInForce, timeInForce);
    }
    parseOrder(order, market = undefined) {
        //
        // v1 for usdc normal account
        //     {
        //         "symbol": "BTCPERP",
        //         "orderType": "Market",
        //         "orderLinkId": "",
        //         "orderId": "36190ad3-de08-4b83-9ad3-56942f684b79",
        //         "cancelType": "UNKNOWN",
        //         "stopOrderType": "UNKNOWN",
        //         "orderStatus": "Filled",
        //         "updateTimeStamp": "1692769133267",
        //         "takeProfit": "0.0000",
        //         "cumExecValue": "259.6830",
        //         "createdAt": "1692769133261",
        //         "blockTradeId": "",
        //         "orderPnl": "",
        //         "price": "24674.7",
        //         "tpTriggerBy": "UNKNOWN",
        //         "timeInForce": "ImmediateOrCancel",
        //         "updatedAt": "1692769133267",
        //         "basePrice": "0.0",
        //         "realisedPnl": "0.0000",
        //         "side": "Sell",
        //         "triggerPrice": "0.0",
        //         "cumExecFee": "0.1429",
        //         "leavesQty": "0.000",
        //         "cashFlow": "",
        //         "slTriggerBy": "UNKNOWN",
        //         "iv": "",
        //         "closeOnTrigger": "UNKNOWN",
        //         "cumExecQty": "0.010",
        //         "reduceOnly": 0,
        //         "qty": "0.010",
        //         "stopLoss": "0.0000",
        //         "triggerBy": "UNKNOWN",
        //         "orderIM": ""
        //     }
        //
        // v5
        //     {
        //         "orderId": "14bad3a1-6454-43d8-bcf2-5345896cf74d",
        //         "orderLinkId": "YLxaWKMiHU",
        //         "blockTradeId": "",
        //         "symbol": "BTCUSDT",
        //         "price": "26864.40",
        //         "qty": "0.003",
        //         "side": "Buy",
        //         "isLeverage": "",
        //         "positionIdx": 1,
        //         "orderStatus": "Cancelled",
        //         "cancelType": "UNKNOWN",
        //         "rejectReason": "EC_PostOnlyWillTakeLiquidity",
        //         "avgPrice": "0",
        //         "leavesQty": "0.000",
        //         "leavesValue": "0",
        //         "cumExecQty": "0.000",
        //         "cumExecValue": "0",
        //         "cumExecFee": "0",
        //         "timeInForce": "PostOnly",
        //         "orderType": "Limit",
        //         "stopOrderType": "UNKNOWN",
        //         "orderIv": "",
        //         "triggerPrice": "0.00",
        //         "takeProfit": "0.00",
        //         "stopLoss": "0.00",
        //         "tpTriggerBy": "UNKNOWN",
        //         "slTriggerBy": "UNKNOWN",
        //         "triggerDirection": 0,
        //         "triggerBy": "UNKNOWN",
        //         "lastPriceOnCreated": "0.00",
        //         "reduceOnly": false,
        //         "closeOnTrigger": false,
        //         "smpType": "None",
        //         "smpGroup": 0,
        //         "smpOrderId": "",
        //         "tpslMode": "",
        //         "tpLimitPrice": "",
        //         "slLimitPrice": "",
        //         "placeType": "",
        //         "createdTime": "1684476068369",
        //         "updatedTime": "1684476068372"
        //     }
        // createOrders failed order
        //    {
        //        "category": "linear",
        //        "symbol": "LTCUSDT",
        //        "orderId": '',
        //        "orderLinkId": '',
        //        "createAt": '',
        //        "code": "10001",
        //        "msg": "The number of contracts exceeds maximum limit allowed: too large"
        //    }
        //
        const code = this.safeString(order, 'code');
        if (code !== undefined) {
            if (code !== '0') {
                const category = this.safeString(order, 'category');
                const inferredMarketType = (category === 'spot') ? 'spot' : 'contract';
                return this.safeOrder({
                    'info': order,
                    'status': 'rejected',
                    'id': this.safeString(order, 'orderId'),
                    'clientOrderId': this.safeString(order, 'orderLinkId'),
                    'symbol': this.safeSymbol(this.safeString(order, 'symbol'), undefined, undefined, inferredMarketType),
                });
            }
        }
        const marketId = this.safeString(order, 'symbol');
        const isContract = ('tpslMode' in order);
        let marketType = undefined;
        if (market !== undefined) {
            marketType = market['type'];
        }
        else {
            marketType = isContract ? 'contract' : 'spot';
        }
        market = this.safeMarket(marketId, market, undefined, marketType);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger2(order, 'createdTime', 'createdAt');
        const marketUnit = this.safeString(order, 'marketUnit', 'baseCoin');
        const id = this.safeString(order, 'orderId');
        const type = this.safeStringLower(order, 'orderType');
        const price = this.safeString(order, 'price');
        let amount = undefined;
        let cost = undefined;
        if (marketUnit === 'baseCoin') {
            amount = this.safeString(order, 'qty');
            cost = this.safeString(order, 'cumExecValue');
        }
        else {
            cost = this.safeString(order, 'cumExecValue');
        }
        const filled = this.safeString(order, 'cumExecQty');
        const remaining = this.safeString(order, 'leavesQty');
        const lastTradeTimestamp = this.safeInteger2(order, 'updatedTime', 'updatedAt');
        const rawStatus = this.safeString(order, 'orderStatus');
        const status = this.parseOrderStatus(rawStatus);
        const side = this.safeStringLower(order, 'side');
        let fee = undefined;
        const feeCostString = this.safeString(order, 'cumExecFee');
        if (feeCostString !== undefined) {
            let feeCurrencyCode = undefined;
            if (market['spot']) {
                if (Precise["default"].stringGt(feeCostString, '0')) {
                    if (side === 'buy') {
                        feeCurrencyCode = market['base'];
                    }
                    else {
                        feeCurrencyCode = market['quote'];
                    }
                }
                else {
                    if (side === 'buy') {
                        feeCurrencyCode = market['quote'];
                    }
                    else {
                        feeCurrencyCode = market['base'];
                    }
                }
            }
            else {
                feeCurrencyCode = market['inverse'] ? market['base'] : market['settle'];
            }
            fee = {
                'cost': this.parseNumber(feeCostString),
                'currency': feeCurrencyCode,
            };
        }
        let clientOrderId = this.safeString(order, 'orderLinkId');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined;
        }
        const avgPrice = this.omitZero(this.safeString(order, 'avgPrice'));
        const rawTimeInForce = this.safeString(order, 'timeInForce');
        const timeInForce = this.parseTimeInForce(rawTimeInForce);
        const triggerPrice = this.omitZero(this.safeString(order, 'triggerPrice'));
        const reduceOnly = this.safeBool(order, 'reduceOnly');
        let takeProfitPrice = this.omitZero(this.safeString(order, 'takeProfit'));
        let stopLossPrice = this.omitZero(this.safeString(order, 'stopLoss'));
        const triggerDirection = this.safeString(order, 'triggerDirection');
        const isAscending = (triggerDirection === '1');
        const isStopOrderType2 = (triggerPrice !== undefined) && reduceOnly;
        if ((stopLossPrice === undefined) && isStopOrderType2) {
            // check if order is stop order type 2 - stopLossPrice
            if (isAscending && (side === 'buy')) {
                // stopLoss order against short position
                stopLossPrice = triggerPrice;
            }
            if (!isAscending && (side === 'sell')) {
                // stopLoss order against a long position
                stopLossPrice = triggerPrice;
            }
        }
        if ((takeProfitPrice === undefined) && isStopOrderType2) {
            // check if order is stop order type 2 - takeProfitPrice
            if (isAscending && (side === 'sell')) {
                // takeprofit order against a long position
                takeProfitPrice = triggerPrice;
            }
            if (!isAscending && (side === 'buy')) {
                // takeprofit order against a short position
                takeProfitPrice = triggerPrice;
            }
        }
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'reduceOnly': this.safeBool(order, 'reduceOnly'),
            'side': side,
            'price': price,
            'triggerPrice': triggerPrice,
            'takeProfitPrice': takeProfitPrice,
            'stopLossPrice': stopLossPrice,
            'amount': amount,
            'cost': cost,
            'average': avgPrice,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }
    /**
     * @method
     * @name bybit#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://bybit-exchange.github.io/docs/v5/order/create-order
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
        return await this.createOrder(symbol, 'market', 'buy', cost, 1, params);
    }
    /**
     * @method
     * @name bybit#createMarkeSellOrderWithCost
     * @description create a market sell order by providing the symbol and cost
     * @see https://bybit-exchange.github.io/docs/v5/order/create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createMarketSellOrderWithCost(symbol, cost, params = {}) {
        await this.loadMarkets();
        const types = await this.isUnifiedEnabled();
        const enableUnifiedAccount = types[1];
        if (!enableUnifiedAccount) {
            throw new errors.NotSupported(this.id + ' createMarketSellOrderWithCost() supports UTA accounts only');
        }
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' createMarketSellOrderWithCost() supports spot orders only');
        }
        return await this.createOrder(symbol, 'market', 'sell', cost, 1, params);
    }
    /**
     * @method
     * @name bybit#createOrder
     * @description create a trade order
     * @see https://bybit-exchange.github.io/docs/v5/order/create-order
     * @see https://bybit-exchange.github.io/docs/v5/position/trading-stop
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK"
     * @param {bool} [params.postOnly] true or false whether the order is post-only
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
     * @param {string} [params.positionIdx] *contracts only* 0 for one-way mode, 1 buy side of hedged mode, 2 sell side of hedged mode
     * @param {bool} [params.hedged] *contracts only* true for hedged mode, false for one way mode, default is false
     * @param {int} [params.isLeverage] *unified spot only* false then spot trading true then margin trading
     * @param {string} [params.tpslMode] *contract only* 'full' or 'partial'
     * @param {string} [params.mmp] *option only* market maker protection
     * @param {string} [params.triggerDirection] *contract only* the direction for trigger orders, 'above' or 'below'
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {float} [params.stopLossPrice] The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price at which a take profit order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {string} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {string} [params.trailingTriggerPrice] the price to trigger a trailing order, default uses the price argument
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const parts = await this.isUnifiedEnabled();
        const enableUnifiedAccount = parts[1];
        const trailingAmount = this.safeString2(params, 'trailingAmount', 'trailingStop');
        const isTrailingAmountOrder = trailingAmount !== undefined;
        const orderRequest = this.createOrderRequest(symbol, type, side, amount, price, params, enableUnifiedAccount);
        const options = this.safeDict(this.options, 'createOrder', {});
        const defaultMethod = this.safeString(options, 'method', 'privatePostV5OrderCreate');
        let response = undefined;
        if (isTrailingAmountOrder || (defaultMethod === 'privatePostV5PositionTradingStop')) {
            response = await this.privatePostV5PositionTradingStop(orderRequest);
        }
        else {
            response = await this.privatePostV5OrderCreate(orderRequest); // already extended inside createOrderRequest
        }
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "orderId": "1321003749386327552",
        //             "orderLinkId": "spot-test-postonly"
        //         },
        //         "retExtInfo": {},
        //         "time": 1672211918471
        //     }
        //
        const order = this.safeDict(response, 'result', {});
        return this.parseOrder(order, market);
    }
    createOrderRequest(symbol, type, side, amount, price = undefined, params = {}, isUTA = true) {
        const market = this.market(symbol);
        symbol = market['symbol'];
        const lowerCaseType = type.toLowerCase();
        if ((price === undefined) && (lowerCaseType === 'limit')) {
            throw new errors.ArgumentsRequired(this.id + ' createOrder requires a price argument for limit orders');
        }
        let defaultMethod = undefined;
        [defaultMethod, params] = this.handleOptionAndParams(params, 'createOrder', 'method', 'privatePostV5OrderCreate');
        const request = {
            'symbol': market['id'],
            // 'side': this.capitalize (side),
            // 'orderType': this.capitalize (lowerCaseType), // limit or market
            // 'timeInForce': 'GTC', // IOC, FOK, PostOnly
            // 'takeProfit': 123.45, // take profit price, only take effect upon opening the position
            // 'stopLoss': 123.45, // stop loss price, only take effect upon opening the position
            // 'reduceOnly': false, // reduce only, required for linear orders
            // when creating a closing order, bybit recommends a True value for
            //  closeOnTrigger to avoid failing due to insufficient available margin
            // 'closeOnTrigger': false, required for linear orders
            // 'orderLinkId': 'string', // unique client order id, max 36 characters
            // 'triggerPrice': 123.46, // trigger price, required for conditional orders
            // 'triggerBy': 'MarkPrice', // IndexPrice, MarkPrice, LastPrice
            // 'tpTriggerby': 'MarkPrice', // IndexPrice, MarkPrice, LastPrice
            // 'slTriggerBy': 'MarkPrice', // IndexPrice, MarkPrice, LastPrice
            // 'mmp': false // market maker protection
            // 'positionIdx': 0, // Position mode. Unified account has one-way mode only (0)
            // 'triggerDirection': 1, // Conditional order param. Used to identify the expected direction of the conditional order. 1: triggered when market price rises to triggerPrice 2: triggered when market price falls to triggerPrice
            // Valid for spot only.
            // 'isLeverage': 0, // Whether to borrow. 0(default): false, 1: true
            // 'orderFilter': 'Order' // Order,tpslOrder. If not passed, Order by default
            // Valid for option only.
            // 'orderIv': '0', // Implied volatility; parameters are passed according to the real value; for example, for 10%, 0.1 is passed
        };
        const hedged = this.safeBool(params, 'hedged', false);
        const reduceOnly = this.safeBool(params, 'reduceOnly');
        let triggerPrice = this.safeValue2(params, 'triggerPrice', 'stopPrice');
        const stopLossTriggerPrice = this.safeValue(params, 'stopLossPrice');
        const takeProfitTriggerPrice = this.safeValue(params, 'takeProfitPrice');
        const stopLoss = this.safeValue(params, 'stopLoss');
        const takeProfit = this.safeValue(params, 'takeProfit');
        const trailingTriggerPrice = this.safeString2(params, 'trailingTriggerPrice', 'activePrice', this.numberToString(price));
        const trailingAmount = this.safeString2(params, 'trailingAmount', 'trailingStop');
        const isTrailingAmountOrder = trailingAmount !== undefined;
        const isTriggerOrder = triggerPrice !== undefined;
        const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
        const isStopLoss = stopLoss !== undefined;
        const isTakeProfit = takeProfit !== undefined;
        const isMarket = lowerCaseType === 'market';
        const isLimit = lowerCaseType === 'limit';
        const isBuy = side === 'buy';
        const isAlternativeEndpoint = defaultMethod === 'privatePostV5PositionTradingStop';
        const amountString = this.getAmount(symbol, amount);
        const priceString = (price !== undefined) ? this.getPrice(symbol, this.numberToString(price)) : undefined;
        if (isTrailingAmountOrder || isAlternativeEndpoint) {
            if (isStopLoss || isTakeProfit || isTriggerOrder || market['spot']) {
                throw new errors.InvalidOrder(this.id + ' the API endpoint used only supports contract trailingAmount, stopLossPrice and takeProfitPrice orders');
            }
            if (isStopLossTriggerOrder || isTakeProfitTriggerOrder) {
                if (isStopLossTriggerOrder) {
                    request['stopLoss'] = this.getPrice(symbol, stopLossTriggerPrice);
                    if (isLimit) {
                        request['tpslMode'] = 'Partial';
                        request['slOrderType'] = 'Limit';
                        request['slLimitPrice'] = priceString;
                        request['slSize'] = amountString;
                    }
                }
                else if (isTakeProfitTriggerOrder) {
                    request['takeProfit'] = this.getPrice(symbol, takeProfitTriggerPrice);
                    if (isLimit) {
                        request['tpslMode'] = 'Partial';
                        request['tpOrderType'] = 'Limit';
                        request['tpLimitPrice'] = priceString;
                        request['tpSize'] = amountString;
                    }
                }
            }
        }
        else {
            request['side'] = this.capitalize(side);
            request['orderType'] = this.capitalize(lowerCaseType);
            const timeInForce = this.safeStringLower(params, 'timeInForce'); // this is same as exchange specific param
            let postOnly = undefined;
            [postOnly, params] = this.handlePostOnly(isMarket, timeInForce === 'postonly', params);
            if (postOnly) {
                request['timeInForce'] = 'PostOnly';
            }
            else if (timeInForce === 'gtc') {
                request['timeInForce'] = 'GTC';
            }
            else if (timeInForce === 'fok') {
                request['timeInForce'] = 'FOK';
            }
            else if (timeInForce === 'ioc') {
                request['timeInForce'] = 'IOC';
            }
            if (market['spot']) {
                // only works for spot market
                if (triggerPrice !== undefined) {
                    request['orderFilter'] = 'StopOrder';
                }
                else if (stopLossTriggerPrice !== undefined || takeProfitTriggerPrice !== undefined || isStopLoss || isTakeProfit) {
                    request['orderFilter'] = 'tpslOrder';
                }
            }
            const clientOrderId = this.safeString(params, 'clientOrderId');
            if (clientOrderId !== undefined) {
                request['orderLinkId'] = clientOrderId;
            }
            else if (market['option']) {
                // mandatory field for options
                request['orderLinkId'] = this.uuid16();
            }
            if (isLimit) {
                request['price'] = priceString;
            }
        }
        if (market['spot']) {
            request['category'] = 'spot';
        }
        else if (market['linear']) {
            request['category'] = 'linear';
        }
        else if (market['inverse']) {
            request['category'] = 'inverse';
        }
        else if (market['option']) {
            request['category'] = 'option';
        }
        const cost = this.safeString(params, 'cost');
        params = this.omit(params, 'cost');
        // if the cost is inferable, let's keep the old logic and ignore marketUnit, to minimize the impact of the changes
        const isMarketBuyAndCostInferable = (lowerCaseType === 'market') && (side === 'buy') && ((price !== undefined) || (cost !== undefined));
        if (market['spot'] && (type === 'market') && isUTA && !isMarketBuyAndCostInferable) {
            // UTA account can specify the cost of the order on both sides
            if ((cost !== undefined) || (price !== undefined)) {
                request['marketUnit'] = 'quoteCoin';
                let orderCost = undefined;
                if (cost !== undefined) {
                    orderCost = cost;
                }
                else {
                    const quoteAmount = Precise["default"].stringMul(amountString, priceString);
                    orderCost = quoteAmount;
                }
                request['qty'] = this.getCost(symbol, orderCost);
            }
            else {
                request['marketUnit'] = 'baseCoin';
                request['qty'] = amountString;
            }
        }
        else if (market['spot'] && (type === 'market') && (side === 'buy')) {
            // classic accounts
            // for market buy it requires the amount of quote currency to spend
            let createMarketBuyOrderRequiresPrice = true;
            [createMarketBuyOrderRequiresPrice, params] = this.handleOptionAndParams(params, 'createOrder', 'createMarketBuyOrderRequiresPrice');
            if (createMarketBuyOrderRequiresPrice) {
                if ((price === undefined) && (cost === undefined)) {
                    throw new errors.InvalidOrder(this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument');
                }
                else {
                    const quoteAmount = Precise["default"].stringMul(amountString, priceString);
                    const costRequest = (cost !== undefined) ? cost : quoteAmount;
                    request['qty'] = this.getCost(symbol, costRequest);
                }
            }
            else {
                if (cost !== undefined) {
                    request['qty'] = this.getCost(symbol, this.numberToString(cost));
                }
                else if (price !== undefined) {
                    request['qty'] = this.getCost(symbol, Precise["default"].stringMul(amountString, priceString));
                }
                else {
                    request['qty'] = amountString;
                }
            }
        }
        else {
            if (!isTrailingAmountOrder && !isAlternativeEndpoint) {
                request['qty'] = amountString;
            }
        }
        if (isTrailingAmountOrder) {
            if (trailingTriggerPrice !== undefined) {
                request['activePrice'] = this.getPrice(symbol, trailingTriggerPrice);
            }
            request['trailingStop'] = trailingAmount;
        }
        else if (isTriggerOrder && !isAlternativeEndpoint) {
            const triggerDirection = this.safeString(params, 'triggerDirection');
            params = this.omit(params, ['triggerPrice', 'stopPrice', 'triggerDirection']);
            if (market['spot']) {
                if (triggerDirection !== undefined) {
                    throw new errors.NotSupported(this.id + ' createOrder() : trigger order does not support triggerDirection for spot markets yet');
                }
            }
            else {
                if (triggerDirection === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' stop/trigger orders require a triggerDirection parameter, either "above" or "below" to determine the direction of the trigger.');
                }
                const isAsending = ((triggerDirection === 'above') || (triggerDirection === '1'));
                request['triggerDirection'] = isAsending ? 1 : 2;
            }
            request['triggerPrice'] = this.getPrice(symbol, triggerPrice);
        }
        else if ((isStopLossTriggerOrder || isTakeProfitTriggerOrder) && !isAlternativeEndpoint) {
            if (isBuy) {
                request['triggerDirection'] = isStopLossTriggerOrder ? 1 : 2;
            }
            else {
                request['triggerDirection'] = isStopLossTriggerOrder ? 2 : 1;
            }
            triggerPrice = isStopLossTriggerOrder ? stopLossTriggerPrice : takeProfitTriggerPrice;
            request['triggerPrice'] = this.getPrice(symbol, triggerPrice);
            request['reduceOnly'] = true;
        }
        if ((isStopLoss || isTakeProfit) && !isAlternativeEndpoint) {
            if (isStopLoss) {
                const slTriggerPrice = this.safeValue2(stopLoss, 'triggerPrice', 'stopPrice', stopLoss);
                request['stopLoss'] = this.getPrice(symbol, slTriggerPrice);
                const slLimitPrice = this.safeValue(stopLoss, 'price');
                if (slLimitPrice !== undefined) {
                    request['tpslMode'] = 'Partial';
                    request['slOrderType'] = 'Limit';
                    request['slLimitPrice'] = this.getPrice(symbol, slLimitPrice);
                }
            }
            if (isTakeProfit) {
                const tpTriggerPrice = this.safeValue2(takeProfit, 'triggerPrice', 'stopPrice', takeProfit);
                request['takeProfit'] = this.getPrice(symbol, tpTriggerPrice);
                const tpLimitPrice = this.safeValue(takeProfit, 'price');
                if (tpLimitPrice !== undefined) {
                    request['tpslMode'] = 'Partial';
                    request['tpOrderType'] = 'Limit';
                    request['tpLimitPrice'] = this.getPrice(symbol, tpLimitPrice);
                }
            }
        }
        if (!market['spot'] && hedged) {
            if (reduceOnly) {
                params = this.omit(params, 'reduceOnly');
                side = (side === 'buy') ? 'sell' : 'buy';
            }
            request['positionIdx'] = (side === 'buy') ? 1 : 2;
        }
        params = this.omit(params, ['stopPrice', 'timeInForce', 'stopLossPrice', 'takeProfitPrice', 'postOnly', 'clientOrderId', 'triggerPrice', 'stopLoss', 'takeProfit', 'trailingAmount', 'trailingTriggerPrice', 'hedged']);
        return this.extend(request, params);
    }
    /**
     * @method
     * @name bybit#createOrders
     * @description create a list of trade orders
     * @see https://bybit-exchange.github.io/docs/v5/order/batch-place
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders(orders, params = {}) {
        await this.loadMarkets();
        const accounts = await this.isUnifiedEnabled();
        const isUta = accounts[1];
        const ordersRequests = [];
        const orderSymbols = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString(rawOrder, 'symbol');
            orderSymbols.push(marketId);
            const type = this.safeString(rawOrder, 'type');
            const side = this.safeString(rawOrder, 'side');
            const amount = this.safeValue(rawOrder, 'amount');
            const price = this.safeValue(rawOrder, 'price');
            const orderParams = this.safeDict(rawOrder, 'params', {});
            const orderRequest = this.createOrderRequest(marketId, type, side, amount, price, orderParams, isUta);
            delete orderRequest['category'];
            ordersRequests.push(orderRequest);
        }
        const symbols = this.marketSymbols(orderSymbols, undefined, false, true, true);
        const market = this.market(symbols[0]);
        const unifiedMarginStatus = this.safeInteger(this.options, 'unifiedMarginStatus', 3);
        let category = undefined;
        [category, params] = this.getBybitType('createOrders', market, params);
        if ((category === 'inverse') && (unifiedMarginStatus < 5)) {
            throw new errors.NotSupported(this.id + ' createOrders does not allow inverse orders for non UTA2.0 account');
        }
        const request = {
            'category': category,
            'request': ordersRequests,
        };
        const response = await this.privatePostV5OrderCreateBatch(this.extend(request, params));
        const result = this.safeDict(response, 'result', {});
        const data = this.safeList(result, 'list', []);
        const retInfo = this.safeDict(response, 'retExtInfo', {});
        const codes = this.safeList(retInfo, 'list', []);
        // extend the error with the unsuccessful orders
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const retCode = this.safeInteger(code, 'code');
            if (retCode !== 0) {
                data[i] = this.extend(data[i], code);
            }
        }
        //
        // {
        //     "retCode":0,
        //     "retMsg":"OK",
        //     "result":{
        //        "list":[
        //           {
        //              "category":"linear",
        //              "symbol":"LTCUSDT",
        //              "orderId":"",
        //              "orderLinkId":"",
        //              "createAt":""
        //           },
        //           {
        //              "category":"linear",
        //              "symbol":"LTCUSDT",
        //              "orderId":"3c9f65b6-01ad-4ac0-9741-df17e02a4223",
        //              "orderLinkId":"",
        //              "createAt":"1698075516029"
        //           }
        //        ]
        //     },
        //     "retExtInfo":{
        //        "list":[
        //           {
        //              "code":10001,
        //              "msg":"The number of contracts exceeds maximum limit allowed: too large"
        //           },
        //           {
        //              "code":0,
        //              "msg":"OK"
        //           }
        //        ]
        //     },
        //     "time":1698075516029
        // }
        //
        return this.parseOrders(data);
    }
    editOrderRequest(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'orderId': id,
            // 'orderLinkId': 'string', // unique client order id, max 36 characters
            // 'takeProfit': 123.45, // take profit price, only take effect upon opening the position
            // 'stopLoss': 123.45, // stop loss price, only take effect upon opening the position
            // 'triggerPrice': 123.45, // trigger price, required for conditional orders
            // 'triggerBy': 'MarkPrice', // IndexPrice, MarkPrice, LastPrice
            // 'tpTriggerby': 'MarkPrice', // IndexPrice, MarkPrice, LastPrice
            // 'slTriggerBy': 'MarkPrice', // IndexPrice, MarkPrice, LastPrice
            // Valid for option only.
            // 'orderIv': '0', // Implied volatility; parameters are passed according to the real value; for example, for 10%, 0.1 is passed
        };
        if (market['spot']) {
            request['category'] = 'spot';
        }
        else if (market['linear']) {
            request['category'] = 'linear';
        }
        else if (market['inverse']) {
            request['category'] = 'inverse';
        }
        else if (market['option']) {
            request['category'] = 'option';
        }
        if (amount !== undefined) {
            request['qty'] = this.getAmount(symbol, amount);
        }
        if (price !== undefined) {
            request['price'] = this.getPrice(symbol, this.numberToString(price));
        }
        let triggerPrice = this.safeString2(params, 'triggerPrice', 'stopPrice');
        const stopLossTriggerPrice = this.safeString(params, 'stopLossPrice');
        const takeProfitTriggerPrice = this.safeString(params, 'takeProfitPrice');
        const stopLoss = this.safeValue(params, 'stopLoss');
        const takeProfit = this.safeValue(params, 'takeProfit');
        const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
        const isStopLoss = stopLoss !== undefined;
        const isTakeProfit = takeProfit !== undefined;
        if (isStopLossTriggerOrder || isTakeProfitTriggerOrder) {
            triggerPrice = isStopLossTriggerOrder ? stopLossTriggerPrice : takeProfitTriggerPrice;
        }
        if (triggerPrice !== undefined) {
            const triggerPriceRequest = (triggerPrice === '0') ? triggerPrice : this.getPrice(symbol, triggerPrice);
            request['triggerPrice'] = triggerPriceRequest;
            const triggerBy = this.safeString(params, 'triggerBy', 'LastPrice');
            request['triggerBy'] = triggerBy;
        }
        if (isStopLoss || isTakeProfit) {
            if (isStopLoss) {
                const slTriggerPrice = this.safeString2(stopLoss, 'triggerPrice', 'stopPrice', stopLoss);
                const stopLossRequest = (slTriggerPrice === '0') ? slTriggerPrice : this.getPrice(symbol, slTriggerPrice);
                request['stopLoss'] = stopLossRequest;
                const slTriggerBy = this.safeString(params, 'slTriggerBy', 'LastPrice');
                request['slTriggerBy'] = slTriggerBy;
            }
            if (isTakeProfit) {
                const tpTriggerPrice = this.safeString2(takeProfit, 'triggerPrice', 'stopPrice', takeProfit);
                const takeProfitRequest = (tpTriggerPrice === '0') ? tpTriggerPrice : this.getPrice(symbol, tpTriggerPrice);
                request['takeProfit'] = takeProfitRequest;
                const tpTriggerBy = this.safeString(params, 'tpTriggerBy', 'LastPrice');
                request['tpTriggerBy'] = tpTriggerBy;
            }
        }
        const clientOrderId = this.safeString(params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['orderLinkId'] = clientOrderId;
        }
        params = this.omit(params, ['stopPrice', 'stopLossPrice', 'takeProfitPrice', 'triggerPrice', 'clientOrderId', 'stopLoss', 'takeProfit']);
        return request;
    }
    /**
     * @method
     * @name bybit#editOrder
     * @description edit a trade order
     * @see https://bybit-exchange.github.io/docs/v5/order/amend-order
     * @see https://bybit-exchange.github.io/docs/derivatives/unified/replace-order
     * @see https://bybit-exchange.github.io/docs/api-explorer/derivatives/trade/contract/replace-order
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price that a trigger order is triggered at
     * @param {float} [params.stopLossPrice] The price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price that a take profit order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice that the attached take profit order will be triggered
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice that the attached stop loss order will be triggered
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {string} [params.triggerBy] 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for triggerPrice
     * @param {string} [params.slTriggerBy] 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for stopLoss
     * @param {string} [params.tpTriggerby] 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for takeProfit
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets();
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' editOrder() requires a symbol argument');
        }
        const request = this.editOrderRequest(id, symbol, type, side, amount, price, params);
        const response = await this.privatePostV5OrderAmend(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "orderId": "c6f055d9-7f21-4079-913d-e6523a9cfffa",
        //             "orderLinkId": "linear-004"
        //         },
        //         "retExtInfo": {},
        //         "time": 1672217093461
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        return this.safeOrder({
            'info': response,
            'id': this.safeString(result, 'orderId'),
        });
    }
    /**
     * @method
     * @name bybit#editOrders
     * @description edit a list of trade orders
     * @see https://bybit-exchange.github.io/docs/v5/order/batch-amend
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
            const symbol = this.safeString(rawOrder, 'symbol');
            orderSymbols.push(symbol);
            const id = this.safeString(rawOrder, 'id');
            const type = this.safeString(rawOrder, 'type');
            const side = this.safeString(rawOrder, 'side');
            const amount = this.safeValue(rawOrder, 'amount');
            const price = this.safeValue(rawOrder, 'price');
            const orderParams = this.safeDict(rawOrder, 'params', {});
            const orderRequest = this.editOrderRequest(id, symbol, type, side, amount, price, orderParams);
            delete orderRequest['category'];
            ordersRequests.push(orderRequest);
        }
        orderSymbols = this.marketSymbols(orderSymbols, undefined, false, true, true);
        const market = this.market(orderSymbols[0]);
        const unifiedMarginStatus = this.safeInteger(this.options, 'unifiedMarginStatus', 3);
        let category = undefined;
        [category, params] = this.getBybitType('editOrders', market, params);
        if ((category === 'inverse') && (unifiedMarginStatus < 5)) {
            throw new errors.NotSupported(this.id + ' editOrders does not allow inverse orders for non UTA2.0 account');
        }
        const request = {
            'category': category,
            'request': ordersRequests,
        };
        const response = await this.privatePostV5OrderAmendBatch(this.extend(request, params));
        const result = this.safeDict(response, 'result', {});
        const data = this.safeList(result, 'list', []);
        const retInfo = this.safeDict(response, 'retExtInfo', {});
        const codes = this.safeList(retInfo, 'list', []);
        // extend the error with the unsuccessful orders
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const retCode = this.safeInteger(code, 'code');
            if (retCode !== 0) {
                data[i] = this.extend(data[i], code);
            }
        }
        //
        // {
        //     "retCode": 0,
        //     "retMsg": "OK",
        //     "result": {
        //         "list": [
        //             {
        //                 "category": "option",
        //                 "symbol": "ETH-30DEC22-500-C",
        //                 "orderId": "b551f227-7059-4fb5-a6a6-699c04dbd2f2",
        //                 "orderLinkId": ""
        //             },
        //             {
        //                 "category": "option",
        //                 "symbol": "ETH-30DEC22-700-C",
        //                 "orderId": "fa6a595f-1a57-483f-b9d3-30e9c8235a52",
        //                 "orderLinkId": ""
        //             }
        //         ]
        //     },
        //     "retExtInfo": {
        //         "list": [
        //             {
        //                 "code": 0,
        //                 "msg": "OK"
        //             },
        //             {
        //                 "code": 0,
        //                 "msg": "OK"
        //             }
        //         ]
        //     },
        //     "time": 1672222808060
        // }
        //
        return this.parseOrders(data);
    }
    cancelOrderRequest(id, symbol = undefined, params = {}) {
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            // 'orderLinkId': 'string',
            // 'orderId': id,
            // conditional orders
            // 'orderFilter': '', // Valid for spot only. Order,tpslOrder. If not passed, Order by default
        };
        if (market['spot']) {
            // only works for spot market
            const isTrigger = this.safeBool2(params, 'stop', 'trigger', false);
            params = this.omit(params, ['stop', 'trigger']);
            request['orderFilter'] = isTrigger ? 'StopOrder' : 'Order';
        }
        if (id !== undefined) { // The user can also use argument params["orderLinkId"]
            request['orderId'] = id;
        }
        if (market['spot']) {
            request['category'] = 'spot';
        }
        else if (market['linear']) {
            request['category'] = 'linear';
        }
        else if (market['inverse']) {
            request['category'] = 'inverse';
        }
        else if (market['option']) {
            request['category'] = 'option';
        }
        return this.extend(request, params);
    }
    /**
     * @method
     * @name bybit#cancelOrder
     * @description cancels an open order
     * @see https://bybit-exchange.github.io/docs/v5/order/cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] *spot only* whether the order is a trigger order
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.orderFilter] *spot only* 'Order' or 'StopOrder' or 'tpslOrder'
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const requestExtended = this.cancelOrderRequest(id, symbol, params);
        const response = await this.privatePostV5OrderCancel(requestExtended);
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "orderId": "c6f055d9-7f21-4079-913d-e6523a9cfffa",
        //             "orderLinkId": "linear-004"
        //         },
        //         "retExtInfo": {},
        //         "time": 1672217377164
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        return this.parseOrder(result, market);
    }
    /**
     * @method
     * @name bybit#cancelOrders
     * @description cancel multiple orders
     * @see https://bybit-exchange.github.io/docs/v5/order/batch-cancel
     * @param {string[]} ids order ids
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] client order ids
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const types = await this.isUnifiedEnabled();
        const enableUnifiedAccount = types[1];
        if (!enableUnifiedAccount) {
            throw new errors.NotSupported(this.id + ' cancelOrders() supports UTA accounts only');
        }
        let category = undefined;
        [category, params] = this.getBybitType('cancelOrders', market, params);
        if (category === 'inverse') {
            throw new errors.NotSupported(this.id + ' cancelOrders does not allow inverse orders');
        }
        const ordersRequests = [];
        const clientOrderIds = this.safeList2(params, 'clientOrderIds', 'clientOids', []);
        params = this.omit(params, ['clientOrderIds', 'clientOids']);
        for (let i = 0; i < clientOrderIds.length; i++) {
            ordersRequests.push({
                'symbol': market['id'],
                'orderLinkId': this.safeString(clientOrderIds, i),
            });
        }
        for (let i = 0; i < ids.length; i++) {
            ordersRequests.push({
                'symbol': market['id'],
                'orderId': this.safeString(ids, i),
            });
        }
        const request = {
            'category': category,
            'request': ordersRequests,
        };
        const response = await this.privatePostV5OrderCancelBatch(this.extend(request, params));
        //
        //     {
        //         "retCode": "0",
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "category": "spot",
        //                     "symbol": "BTCUSDT",
        //                     "orderId": "1636282505818800896",
        //                     "orderLinkId": "1636282505818800897"
        //                 },
        //                 {
        //                     "category": "spot",
        //                     "symbol": "BTCUSDT",
        //                     "orderId": "1636282505818800898",
        //                     "orderLinkId": "1636282505818800899"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {
        //             "list": [
        //                 {
        //                     "code": "0",
        //                     "msg": "OK"
        //                 },
        //                 {
        //                     "code": "0",
        //                     "msg": "OK"
        //                 }
        //             ]
        //         },
        //         "time": "1709796158501"
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const row = this.safeList(result, 'list', []);
        return this.parseOrders(row, market);
    }
    /**
     * @method
     * @name bybit#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://bybit-exchange.github.io/docs/v5/order/dcp
     * @param {number} timeout time in milliseconds
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.product] OPTIONS, DERIVATIVES, SPOT, default is 'DERIVATIVES'
     * @returns {object} the api result
     */
    async cancelAllOrdersAfter(timeout, params = {}) {
        await this.loadMarkets();
        const request = {
            'timeWindow': this.parseToInt(timeout / 1000),
        };
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('cancelAllOrdersAfter', undefined, params, 'swap');
        const productMap = {
            'spot': 'SPOT',
            'swap': 'DERIVATIVES',
            'option': 'OPTIONS',
        };
        const product = this.safeString(productMap, type, type);
        request['product'] = product;
        const response = await this.privatePostV5OrderDisconnectedCancelAll(this.extend(request, params));
        //
        // {
        //     "retCode": 0,
        //     "retMsg": "success"
        // }
        //
        return response;
    }
    /**
     * @method
     * @name bybit#cancelOrdersForSymbols
     * @description cancel multiple orders for multiple symbols
     * @see https://bybit-exchange.github.io/docs/v5/order/batch-cancel
     * @param {CancellationRequest[]} orders list of order ids with symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrdersForSymbols(orders, params = {}) {
        await this.loadMarkets();
        const types = await this.isUnifiedEnabled();
        const enableUnifiedAccount = types[1];
        if (!enableUnifiedAccount) {
            throw new errors.NotSupported(this.id + ' cancelOrdersForSymbols() supports UTA accounts only');
        }
        const ordersRequests = [];
        let category = undefined;
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const symbol = this.safeString(order, 'symbol');
            const market = this.market(symbol);
            let currentCategory = undefined;
            [currentCategory, params] = this.getBybitType('cancelOrders', market, params);
            if (currentCategory === 'inverse') {
                throw new errors.NotSupported(this.id + ' cancelOrdersForSymbols does not allow inverse orders');
            }
            if ((category !== undefined) && (category !== currentCategory)) {
                throw new errors.ExchangeError(this.id + ' cancelOrdersForSymbols requires all orders to be of the same category (linear, spot or option))');
            }
            category = currentCategory;
            const id = this.safeString(order, 'id');
            const clientOrderId = this.safeString(order, 'clientOrderId');
            let idKey = 'orderId';
            if (clientOrderId !== undefined) {
                idKey = 'orderLinkId';
            }
            const orderItem = {
                'symbol': market['id'],
            };
            orderItem[idKey] = (idKey === 'orderId') ? id : clientOrderId;
            ordersRequests.push(orderItem);
        }
        const request = {
            'category': category,
            'request': ordersRequests,
        };
        const response = await this.privatePostV5OrderCancelBatch(this.extend(request, params));
        //
        //     {
        //         "retCode": "0",
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "category": "spot",
        //                     "symbol": "BTCUSDT",
        //                     "orderId": "1636282505818800896",
        //                     "orderLinkId": "1636282505818800897"
        //                 },
        //                 {
        //                     "category": "spot",
        //                     "symbol": "BTCUSDT",
        //                     "orderId": "1636282505818800898",
        //                     "orderLinkId": "1636282505818800899"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {
        //             "list": [
        //                 {
        //                     "code": "0",
        //                     "msg": "OK"
        //                 },
        //                 {
        //                     "code": "0",
        //                     "msg": "OK"
        //                 }
        //             ]
        //         },
        //         "time": "1709796158501"
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const row = this.safeList(result, 'list', []);
        return this.parseOrders(row, undefined);
    }
    /**
     * @method
     * @name bybit#cancelAllOrders
     * @description cancel all open orders
     * @see https://bybit-exchange.github.io/docs/v5/order/cancel-all
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if trigger order
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.baseCoin] Base coin. Supports linear, inverse & option
     * @param {string} [params.settleCoin] Settle coin. Supports linear, inverse & option
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const [enableUnifiedMargin, enableUnifiedAccount] = await this.isUnifiedEnabled();
        const isUnifiedAccount = (enableUnifiedMargin || enableUnifiedAccount);
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let type = undefined;
        [type, params] = this.getBybitType('cancelAllOrders', market, params);
        request['category'] = type;
        if ((type === 'option') && !isUnifiedAccount) {
            throw new errors.NotSupported(this.id + ' cancelAllOrders() Normal Account not support ' + type + ' market');
        }
        if ((type === 'linear') || (type === 'inverse')) {
            const baseCoin = this.safeString(params, 'baseCoin');
            if (symbol === undefined && baseCoin === undefined) {
                const defaultSettle = this.safeString(this.options, 'defaultSettle', 'USDT');
                request['settleCoin'] = this.safeString(params, 'settleCoin', defaultSettle);
            }
        }
        const isTrigger = this.safeBool2(params, 'stop', 'trigger', false);
        params = this.omit(params, ['stop', 'trigger']);
        if (isTrigger) {
            request['orderFilter'] = 'StopOrder';
        }
        const response = await this.privatePostV5OrderCancelAll(this.extend(request, params));
        //
        // linear / inverse / option
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "orderId": "f6a73e1f-39b5-4dee-af21-1460b2e3b27c",
        //                     "orderLinkId": "a001"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672219780463
        //     }
        //
        // spot
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "success": "1"
        //         },
        //         "retExtInfo": {},
        //         "time": 1676962409398
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const orders = this.safeList(result, 'list');
        if (!Array.isArray(orders)) {
            return response;
        }
        return this.parseOrders(orders, market);
    }
    /**
     * @method
     * @name bybit#fetchOrderClassic
     * @description fetches information on an order made by the user *classic accounts only*
     * @see https://bybit-exchange.github.io/docs/v5/order/order-list
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrderClassic(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (market['spot']) {
            throw new errors.NotSupported(this.id + ' fetchOrder() is not supported for spot markets');
        }
        const request = {
            'orderId': id,
        };
        const result = await this.fetchOrders(symbol, undefined, undefined, this.extend(request, params));
        const length = result.length;
        if (length === 0) {
            const isTrigger = this.safeBoolN(params, ['trigger', 'stop'], false);
            const extra = isTrigger ? '' : ' If you are trying to fetch SL/TP conditional order, you might try setting params["trigger"] = true';
            throw new errors.OrderNotFound('Order ' + id.toString() + ' was not found.' + extra);
        }
        if (length > 1) {
            throw new errors.InvalidOrder(this.id + ' returned more than one order');
        }
        return this.safeValue(result, 0);
    }
    /**
     * @method
     * @name bybit#fetchOrder
     * @description  *classic accounts only/ spot not supported*  fetches information on an order made by the user *classic accounts only*
     * @see https://bybit-exchange.github.io/docs/v5/order/order-list
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.acknowledged] to suppress the warning, set to true
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const [enableUnifiedMargin, enableUnifiedAccount] = await this.isUnifiedEnabled();
        const isUnifiedAccount = (enableUnifiedMargin || enableUnifiedAccount);
        if (!isUnifiedAccount) {
            return await this.fetchOrderClassic(id, symbol, params);
        }
        let acknowledge = false;
        [acknowledge, params] = this.handleOptionAndParams(params, 'fetchOrder', 'acknowledged');
        if (!acknowledge) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrder() can only access an order if it is in last 500 orders (of any status) for your account. Set params["acknowledged"] = true to hide this warning. Alternatively, we suggest to use fetchOpenOrder or fetchClosedOrder');
        }
        const market = this.market(symbol);
        let marketType = undefined;
        [marketType, params] = this.getBybitType('fetchOrder', market, params);
        const request = {
            'symbol': market['id'],
            'orderId': id,
            'category': marketType,
        };
        let isTrigger = undefined;
        [isTrigger, params] = this.handleParamBool2(params, 'trigger', 'stop', false);
        if (isTrigger) {
            request['orderFilter'] = 'StopOrder';
        }
        const response = await this.privateGetV5OrderRealtime(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "nextPageCursor": "1321052653536515584%3A1672217748287%2C1321052653536515584%3A1672217748287",
        //             "category": "spot",
        //             "list": [
        //                 {
        //                     "symbol": "ETHUSDT",
        //                     "orderType": "Limit",
        //                     "orderLinkId": "1672217748277652",
        //                     "orderId": "1321052653536515584",
        //                     "cancelType": "UNKNOWN",
        //                     "avgPrice": "",
        //                     "stopOrderType": "tpslOrder",
        //                     "lastPriceOnCreated": "",
        //                     "orderStatus": "Cancelled",
        //                     "takeProfit": "",
        //                     "cumExecValue": "0",
        //                     "triggerDirection": 0,
        //                     "isLeverage": "0",
        //                     "rejectReason": "",
        //                     "price": "1000",
        //                     "orderIv": "",
        //                     "createdTime": "1672217748287",
        //                     "tpTriggerBy": "",
        //                     "positionIdx": 0,
        //                     "timeInForce": "GTC",
        //                     "leavesValue": "500",
        //                     "updatedTime": "1672217748287",
        //                     "side": "Buy",
        //                     "triggerPrice": "1500",
        //                     "cumExecFee": "0",
        //                     "leavesQty": "0",
        //                     "slTriggerBy": "",
        //                     "closeOnTrigger": false,
        //                     "cumExecQty": "0",
        //                     "reduceOnly": false,
        //                     "qty": "0.5",
        //                     "stopLoss": "",
        //                     "triggerBy": "1192.5"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672219526294
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const innerList = this.safeList(result, 'list', []);
        if (innerList.length === 0) {
            const extra = isTrigger ? '' : ' If you are trying to fetch SL/TP conditional order, you might try setting params["trigger"] = true';
            throw new errors.OrderNotFound('Order ' + id.toString() + ' was not found.' + extra);
        }
        const order = this.safeDict(innerList, 0, {});
        return this.parseOrder(order, market);
    }
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const res = await this.isUnifiedEnabled();
        /**
         * @method
         * @name bybit#fetchOrders
         * @description *classic accounts only/ spot not supported* fetches information on multiple orders made by the user *classic accounts only/ spot not supported*
         * @see https://bybit-exchange.github.io/docs/v5/order/order-list
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.trigger] true if trigger order
         * @param {boolean} [params.stop] alias for trigger
         * @param {string} [params.type] market type, ['swap', 'option']
         * @param {string} [params.subType] market subType, ['linear', 'inverse']
         * @param {string} [params.orderFilter] 'Order' or 'StopOrder' or 'tpslOrder'
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const enableUnifiedAccount = this.safeBool(res, 1);
        if (enableUnifiedAccount) {
            throw new errors.NotSupported(this.id + ' fetchOrders() is not supported after the 5/02 update for UTA accounts, please use fetchOpenOrders, fetchClosedOrders or fetchCanceledOrders');
        }
        return await this.fetchOrdersClassic(symbol, since, limit, params);
    }
    /**
     * @method
     * @name bybit#fetchOrdersClassic
     * @description fetches information on multiple orders made by the user *classic accounts only*
     * @see https://bybit-exchange.github.io/docs/v5/order/order-list
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if trigger order
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.orderFilter] 'Order' or 'StopOrder' or 'tpslOrder'
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrdersClassic(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchOrders', symbol, since, limit, params, 'nextPageCursor', 'cursor', undefined, 50);
        }
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let type = undefined;
        [type, params] = this.getBybitType('fetchOrders', market, params);
        if (type === 'spot') {
            throw new errors.NotSupported(this.id + ' fetchOrders() is not supported for spot markets');
        }
        request['category'] = type;
        const isTrigger = this.safeBoolN(params, ['trigger', 'stop'], false);
        params = this.omit(params, ['trigger', 'stop']);
        if (isTrigger) {
            request['orderFilter'] = 'StopOrder';
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger(params, 'until'); // unified in milliseconds
        const endTime = this.safeInteger(params, 'endTime', until); // exchange-specific in milliseconds
        params = this.omit(params, ['endTime', 'until']);
        if (endTime !== undefined) {
            request['endTime'] = endTime;
        }
        const response = await this.privateGetV5OrderHistory(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "nextPageCursor": "03234de9-1332-41eb-b805-4a9f42c136a3%3A1672220109387%2C03234de9-1332-41eb-b805-4a9f42c136a3%3A1672220109387",
        //             "category": "linear",
        //             "list": [
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "orderType": "Limit",
        //                     "orderLinkId": "test-001",
        //                     "orderId": "03234de9-1332-41eb-b805-4a9f42c136a3",
        //                     "cancelType": "CancelByUser",
        //                     "avgPrice": "0",
        //                     "stopOrderType": "UNKNOWN",
        //                     "lastPriceOnCreated": "16656.5",
        //                     "orderStatus": "Cancelled",
        //                     "takeProfit": "",
        //                     "cumExecValue": "0",
        //                     "triggerDirection": 0,
        //                     "blockTradeId": "",
        //                     "rejectReason": "EC_PerCancelRequest",
        //                     "isLeverage": "",
        //                     "price": "18000",
        //                     "orderIv": "",
        //                     "createdTime": "1672220109387",
        //                     "tpTriggerBy": "UNKNOWN",
        //                     "positionIdx": 0,
        //                     "timeInForce": "GoodTillCancel",
        //                     "leavesValue": "0",
        //                     "updatedTime": "1672220114123",
        //                     "side": "Sell",
        //                     "triggerPrice": "",
        //                     "cumExecFee": "0",
        //                     "slTriggerBy": "UNKNOWN",
        //                     "leavesQty": "0",
        //                     "closeOnTrigger": false,
        //                     "cumExecQty": "0",
        //                     "reduceOnly": false,
        //                     "qty": "0.1",
        //                     "stopLoss": "",
        //                     "triggerBy": "UNKNOWN"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672221263862
        //     }
        //
        const data = this.addPaginationCursorToResult(response);
        return this.parseOrders(data, market, since, limit);
    }
    /**
     * @method
     * @name bybit#fetchClosedOrder
     * @description fetches information on a closed order made by the user
     * @see https://bybit-exchange.github.io/docs/v5/order/order-list
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for fetching a closed trigger order
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.orderFilter] 'Order' or 'StopOrder' or 'tpslOrder'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'orderId': id,
        };
        const result = await this.fetchClosedOrders(symbol, undefined, undefined, this.extend(request, params));
        const length = result.length;
        if (length === 0) {
            const isTrigger = this.safeBoolN(params, ['trigger', 'stop'], false);
            const extra = isTrigger ? '' : ' If you are trying to fetch SL/TP conditional order, you might try setting params["trigger"] = true';
            throw new errors.OrderNotFound('Order ' + id.toString() + ' was not found.' + extra);
        }
        if (length > 1) {
            throw new errors.InvalidOrder(this.id + ' returned more than one order');
        }
        return this.safeValue(result, 0);
    }
    /**
     * @method
     * @name bybit#fetchOpenOrder
     * @description fetches information on an open order made by the user
     * @see https://bybit-exchange.github.io/docs/v5/order/open-order
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for fetching an open trigger order
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.baseCoin] Base coin. Supports linear, inverse & option
     * @param {string} [params.settleCoin] Settle coin. Supports linear, inverse & option
     * @param {string} [params.orderFilter] 'Order' or 'StopOrder' or 'tpslOrder'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'orderId': id,
        };
        const result = await this.fetchOpenOrders(symbol, undefined, undefined, this.extend(request, params));
        const length = result.length;
        if (length === 0) {
            const isTrigger = this.safeBoolN(params, ['trigger', 'stop'], false);
            const extra = isTrigger ? '' : ' If you are trying to fetch SL/TP conditional order, you might try setting params["trigger"] = true';
            throw new errors.OrderNotFound('Order ' + id.toString() + ' was not found.' + extra);
        }
        if (length > 1) {
            throw new errors.InvalidOrder(this.id + ' returned more than one order');
        }
        return this.safeValue(result, 0);
    }
    /**
     * @method
     * @name bybit#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled and closed orders made by the user
     * @see https://bybit-exchange.github.io/docs/v5/order/order-list
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for fetching trigger orders
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.orderFilter] 'Order' or 'StopOrder' or 'tpslOrder'
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledAndClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchCanceledAndClosedOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchCanceledAndClosedOrders', symbol, since, limit, params, 'nextPageCursor', 'cursor', undefined, 50);
        }
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let type = undefined;
        [type, params] = this.getBybitType('fetchCanceledAndClosedOrders', market, params);
        request['category'] = type;
        const isTrigger = this.safeBoolN(params, ['trigger', 'stop'], false);
        params = this.omit(params, ['trigger', 'stop']);
        if (isTrigger) {
            request['orderFilter'] = 'StopOrder';
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger(params, 'until'); // unified in milliseconds
        const endTime = this.safeInteger(params, 'endTime', until); // exchange-specific in milliseconds
        params = this.omit(params, ['endTime', 'until']);
        if (endTime !== undefined) {
            request['endTime'] = endTime;
        }
        const response = await this.privateGetV5OrderHistory(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "nextPageCursor": "03234de9-1332-41eb-b805-4a9f42c136a3%3A1672220109387%2C03234de9-1332-41eb-b805-4a9f42c136a3%3A1672220109387",
        //             "category": "linear",
        //             "list": [
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "orderType": "Limit",
        //                     "orderLinkId": "test-001",
        //                     "orderId": "03234de9-1332-41eb-b805-4a9f42c136a3",
        //                     "cancelType": "CancelByUser",
        //                     "avgPrice": "0",
        //                     "stopOrderType": "UNKNOWN",
        //                     "lastPriceOnCreated": "16656.5",
        //                     "orderStatus": "Cancelled",
        //                     "takeProfit": "",
        //                     "cumExecValue": "0",
        //                     "triggerDirection": 0,
        //                     "blockTradeId": "",
        //                     "rejectReason": "EC_PerCancelRequest",
        //                     "isLeverage": "",
        //                     "price": "18000",
        //                     "orderIv": "",
        //                     "createdTime": "1672220109387",
        //                     "tpTriggerBy": "UNKNOWN",
        //                     "positionIdx": 0,
        //                     "timeInForce": "GoodTillCancel",
        //                     "leavesValue": "0",
        //                     "updatedTime": "1672220114123",
        //                     "side": "Sell",
        //                     "triggerPrice": "",
        //                     "cumExecFee": "0",
        //                     "slTriggerBy": "UNKNOWN",
        //                     "leavesQty": "0",
        //                     "closeOnTrigger": false,
        //                     "cumExecQty": "0",
        //                     "reduceOnly": false,
        //                     "qty": "0.1",
        //                     "stopLoss": "",
        //                     "triggerBy": "UNKNOWN"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672221263862
        //     }
        //
        const data = this.addPaginationCursorToResult(response);
        return this.parseOrders(data, market, since, limit);
    }
    /**
     * @method
     * @name bybit#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://bybit-exchange.github.io/docs/v5/order/order-list
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for fetching closed trigger orders
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.orderFilter] 'Order' or 'StopOrder' or 'tpslOrder'
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'orderStatus': 'Filled',
        };
        return await this.fetchCanceledAndClosedOrders(symbol, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name bybit#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://bybit-exchange.github.io/docs/v5/order/order-list
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] max number of orders to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if trigger order
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.orderFilter] 'Order' or 'StopOrder' or 'tpslOrder'
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'orderStatus': 'Cancelled',
        };
        return await this.fetchCanceledAndClosedOrders(symbol, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name bybit#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://bybit-exchange.github.io/docs/v5/order/open-order
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for fetching open trigger orders
     * @param {boolean} [params.stop] alias for trigger
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.baseCoin] Base coin. Supports linear, inverse & option
     * @param {string} [params.settleCoin] Settle coin. Supports linear, inverse & option
     * @param {string} [params.orderFilter] 'Order' or 'StopOrder' or 'tpslOrder'
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOpenOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchOpenOrders', symbol, since, limit, params, 'nextPageCursor', 'cursor', undefined, 50);
        }
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let type = undefined;
        [type, params] = this.getBybitType('fetchOpenOrders', market, params);
        if (type === 'linear' || type === 'inverse') {
            const baseCoin = this.safeString(params, 'baseCoin');
            if (symbol === undefined && baseCoin === undefined) {
                const defaultSettle = this.safeString(this.options, 'defaultSettle', 'USDT');
                const settleCoin = this.safeString(params, 'settleCoin', defaultSettle);
                request['settleCoin'] = settleCoin;
            }
        }
        request['category'] = type;
        const isTrigger = this.safeBool2(params, 'stop', 'trigger', false);
        params = this.omit(params, ['stop', 'trigger']);
        if (isTrigger) {
            request['orderFilter'] = 'StopOrder';
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV5OrderRealtime(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "nextPageCursor": "1321052653536515584%3A1672217748287%2C1321052653536515584%3A1672217748287",
        //             "category": "spot",
        //             "list": [
        //                 {
        //                     "symbol": "ETHUSDT",
        //                     "orderType": "Limit",
        //                     "orderLinkId": "1672217748277652",
        //                     "orderId": "1321052653536515584",
        //                     "cancelType": "UNKNOWN",
        //                     "avgPrice": "",
        //                     "stopOrderType": "tpslOrder",
        //                     "lastPriceOnCreated": "",
        //                     "orderStatus": "Cancelled",
        //                     "takeProfit": "",
        //                     "cumExecValue": "0",
        //                     "triggerDirection": 0,
        //                     "isLeverage": "0",
        //                     "rejectReason": "",
        //                     "price": "1000",
        //                     "orderIv": "",
        //                     "createdTime": "1672217748287",
        //                     "tpTriggerBy": "",
        //                     "positionIdx": 0,
        //                     "timeInForce": "GTC",
        //                     "leavesValue": "500",
        //                     "updatedTime": "1672217748287",
        //                     "side": "Buy",
        //                     "triggerPrice": "1500",
        //                     "cumExecFee": "0",
        //                     "leavesQty": "0",
        //                     "slTriggerBy": "",
        //                     "closeOnTrigger": false,
        //                     "cumExecQty": "0",
        //                     "reduceOnly": false,
        //                     "qty": "0.5",
        //                     "stopLoss": "",
        //                     "triggerBy": "1192.5"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672219526294
        //     }
        //
        const data = this.addPaginationCursorToResult(response);
        return this.parseOrders(data, market, since, limit);
    }
    /**
     * @method
     * @name bybit#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://bybit-exchange.github.io/docs/v5/position/execution
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {};
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'orderLinkId');
        if (clientOrderId !== undefined) {
            request['orderLinkId'] = clientOrderId;
        }
        else {
            request['orderId'] = id;
        }
        params = this.omit(params, ['clientOrderId', 'orderLinkId']);
        return await this.fetchMyTrades(symbol, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name bybit#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://bybit-exchange.github.io/docs/api-explorer/v5/position/execution
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchMyTrades', symbol, since, limit, params, 'nextPageCursor', 'cursor', undefined, 100);
        }
        let request = {
            'execType': 'Trade',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let type = undefined;
        [type, params] = this.getBybitType('fetchMyTrades', market, params);
        request['category'] = type;
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        const response = await this.privateGetV5ExecutionList(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "nextPageCursor": "132766%3A2%2C132766%3A2",
        //             "category": "linear",
        //             "list": [
        //                 {
        //                     "symbol": "ETHPERP",
        //                     "orderType": "Market",
        //                     "underlyingPrice": "",
        //                     "orderLinkId": "",
        //                     "side": "Buy",
        //                     "indexPrice": "",
        //                     "orderId": "8c065341-7b52-4ca9-ac2c-37e31ac55c94",
        //                     "stopOrderType": "UNKNOWN",
        //                     "leavesQty": "0",
        //                     "execTime": "1672282722429",
        //                     "isMaker": false,
        //                     "execFee": "0.071409",
        //                     "feeRate": "0.0006",
        //                     "execId": "e0cbe81d-0f18-5866-9415-cf319b5dab3b",
        //                     "tradeIv": "",
        //                     "blockTradeId": "",
        //                     "markPrice": "1183.54",
        //                     "execPrice": "1190.15",
        //                     "markIv": "",
        //                     "orderQty": "0.1",
        //                     "orderPrice": "1236.9",
        //                     "execValue": "119.015",
        //                     "execType": "Trade",
        //                     "execQty": "0.1"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672283754510
        //     }
        //
        const trades = this.addPaginationCursorToResult(response);
        return this.parseTrades(trades, market, since, limit);
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        //
        //     {
        //         "chainType": "ERC20",
        //         "addressDeposit": "0xf56297c6717c1d1c42c30324468ed50a9b7402ee",
        //         "tagDeposit": '',
        //         "chain": "ETH"
        //     }
        //
        const address = this.safeString(depositAddress, 'addressDeposit');
        const tag = this.safeString(depositAddress, 'tagDeposit');
        const code = this.safeString(currency, 'code');
        this.checkAddress(address);
        return {
            'info': depositAddress,
            'currency': code,
            'network': this.networkIdToCode(this.safeString(depositAddress, 'chain'), code),
            'address': address,
            'tag': tag,
        };
    }
    /**
     * @method
     * @name bybit#fetchDepositAddressesByNetwork
     * @description fetch a dictionary of addresses for a currency, indexed by network
     * @see https://bybit-exchange.github.io/docs/v5/asset/master-deposit-addr
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure} indexed by the network
     */
    async fetchDepositAddressesByNetwork(code, params = {}) {
        await this.loadMarkets();
        let currency = this.currency(code);
        const request = {
            'coin': currency['id'],
        };
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode !== undefined) {
            request['chainType'] = this.networkCodeToId(networkCode, code);
        }
        const response = await this.privateGetV5AssetDepositQueryAddress(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "success",
        //         "result": {
        //             "coin": "USDT",
        //             "chains": [
        //                 {
        //                     "chainType": "ERC20",
        //                     "addressDeposit": "0xd9e1cd77afa0e50b452a62fbb68a3340602286c3",
        //                     "tagDeposit": "",
        //                     "chain": "ETH"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672192792860
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const chains = this.safeList(result, 'chains', []);
        const coin = this.safeString(result, 'coin');
        currency = this.currency(coin);
        const parsed = this.parseDepositAddresses(chains, [currency['code']], false, {
            'currency': currency['code'],
        });
        return this.indexBy(parsed, 'network');
    }
    /**
     * @method
     * @name bybit#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://bybit-exchange.github.io/docs/v5/asset/master-deposit-addr
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const [networkCode, paramsOmited] = this.handleNetworkCodeAndParams(params);
        const indexedAddresses = await this.fetchDepositAddressesByNetwork(code, paramsOmited);
        const selectedNetworkCode = this.selectNetworkCodeFromUnifiedNetworks(currency['code'], networkCode, indexedAddresses);
        return indexedAddresses[selectedNetworkCode];
    }
    /**
     * @method
     * @name bybit#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://bybit-exchange.github.io/docs/v5/asset/deposit-record
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for, default = 30 days before the current time
     * @param {int} [limit] the maximum number of deposits structures to retrieve, default = 50, max = 50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch deposits for, default = 30 days after since
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.cursor] used for pagination
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchDeposits', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchDeposits', code, since, limit, params, 'nextPageCursor', 'cursor', undefined, 50);
        }
        let request = {
        // 'coin': currency['id'],
        // 'limit': 20, // max 50
        // 'cursor': '',
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        const response = await this.privateGetV5AssetDepositQueryRecord(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "success",
        //         "result": {
        //             "rows": [
        //                 {
        //                     "coin": "USDT",
        //                     "chain": "ETH",
        //                     "amount": "10000",
        //                     "txID": "skip-notification-scene-test-amount-202212270944-533285-USDT",
        //                     "status": 3,
        //                     "toAddress": "test-amount-address",
        //                     "tag": "",
        //                     "depositFee": "",
        //                     "successAt": "1672134274000",
        //                     "confirmations": "10000",
        //                     "txIndex": "",
        //                     "blockHash": ""
        //                 }
        //             ],
        //             "nextPageCursor": "eyJtaW5JRCI6MTA0NjA0MywibWF4SUQiOjEwNDYwNDN9"
        //         },
        //         "retExtInfo": {},
        //         "time": 1672191992512
        //     }
        //
        const data = this.addPaginationCursorToResult(response);
        return this.parseTransactions(data, currency, since, limit);
    }
    /**
     * @method
     * @name bybit#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://bybit-exchange.github.io/docs/v5/asset/withdraw-record
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchWithdrawals', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchWithdrawals', code, since, limit, params, 'nextPageCursor', 'cursor', undefined, 50);
        }
        let request = {
        // 'coin': currency['id'],
        // 'limit': 20, // max 50
        // 'cusor': '',
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        const response = await this.privateGetV5AssetWithdrawQueryRecord(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "success",
        //         "result": {
        //             "rows": [
        //                 {
        //                     "coin": "USDT",
        //                     "chain": "ETH",
        //                     "amount": "77",
        //                     "txID": "",
        //                     "status": "SecurityCheck",
        //                     "toAddress": "0x99ced129603abc771c0dabe935c326ff6c86645d",
        //                     "tag": "",
        //                     "withdrawFee": "10",
        //                     "createTime": "1670922217000",
        //                     "updateTime": "1670922217000",
        //                     "withdrawId": "9976",
        //                     "withdrawType": 0
        //                 },
        //                 {
        //                     "coin": "USDT",
        //                     "chain": "ETH",
        //                     "amount": "26",
        //                     "txID": "",
        //                     "status": "success",
        //                     "toAddress": "15638072681@163.com",
        //                     "tag": "",
        //                     "withdrawFee": "0",
        //                     "createTime": "1669711121000",
        //                     "updateTime": "1669711380000",
        //                     "withdrawId": "9801",
        //                     "withdrawType": 1
        //                 }
        //             ],
        //             "nextPageCursor": "eyJtaW5JRCI6OTgwMSwibWF4SUQiOjk5NzZ9"
        //         },
        //         "retExtInfo": {},
        //         "time": 1672194949928
        //     }
        //
        const data = this.addPaginationCursorToResult(response);
        return this.parseTransactions(data, currency, since, limit);
    }
    parseTransactionStatus(status) {
        const statuses = {
            // v3 deposit status
            '0': 'unknown',
            '1': 'pending',
            '2': 'processing',
            '3': 'ok',
            '4': 'fail',
            // v3 withdrawal status
            'SecurityCheck': 'pending',
            'Pending': 'pending',
            'success': 'ok',
            'CancelByUser': 'canceled',
            'Reject': 'rejected',
            'Fail': 'failed',
            'BlockchainConfirmed': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchWithdrawals
        //
        //     {
        //         "coin": "USDT",
        //         "chain": "TRX",
        //         "amount": "12.34",
        //         "txID": "de5ea0a2f2e59dc9a714837dd3ddc6d5e151b56ec5d786d351c4f52336f80d3c",
        //         "status": "success",
        //         "toAddress": "TQdmFKUoe1Lk2iwZuwRJEHJreTUBoN3BAw",
        //         "tag": "",
        //         "withdrawFee": "0.5",
        //         "createTime": "1665144183000",
        //         "updateTime": "1665144256000",
        //         "withdrawId": "8839035"
        //     }
        //
        // fetchDeposits
        //
        //     {
        //         "coin": "USDT",
        //         "chain": "TRX",
        //         "amount": "44",
        //         "txID": "0b038ea12fa1575e2d66693db3c346b700d4b28347afc39f80321cf089acc960",
        //         "status": "3",
        //         "toAddress": "TC6NCAC5WSVCCiaD3kWZXyW91ZKKhLm53b",
        //         "tag": "",
        //         "depositFee": "",
        //         "successAt": "1665142507000",
        //         "confirmations": "100",
        //         "txIndex": "0",
        //         "blockHash": "0000000002ac3b1064aee94bca1bd0b58c4c09c65813b084b87a2063d961129e"
        //     }
        //
        // withdraw
        //
        //     {
        //         "id": "9377266"
        //     }
        //
        const currencyId = this.safeString(transaction, 'coin');
        const code = this.safeCurrencyCode(currencyId, currency);
        const timestamp = this.safeInteger2(transaction, 'createTime', 'successAt');
        const updated = this.safeInteger(transaction, 'updateTime');
        const status = this.parseTransactionStatus(this.safeString(transaction, 'status'));
        const feeCost = this.safeNumber2(transaction, 'depositFee', 'withdrawFee');
        const type = ('depositFee' in transaction) ? 'deposit' : 'withdrawal';
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        const toAddress = this.safeString(transaction, 'toAddress');
        return {
            'info': transaction,
            'id': this.safeString2(transaction, 'id', 'withdrawId'),
            'txid': this.safeString(transaction, 'txID'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': this.networkIdToCode(this.safeString(transaction, 'chain')),
            'address': undefined,
            'addressTo': toAddress,
            'addressFrom': undefined,
            'tag': this.safeString(transaction, 'tag'),
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': this.safeNumber(transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
            'internal': undefined,
            'comment': undefined,
        };
    }
    /**
     * @method
     * @name bybit#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://bybit-exchange.github.io/docs/v5/account/transaction-log
     * @see https://bybit-exchange.github.io/docs/v5/account/contract-transaction-log
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.subType] if inverse will use v5/account/contract-transaction-log
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchLedger', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchLedger', code, since, limit, params, 'nextPageCursor', 'cursor', undefined, 50);
        }
        const request = {
        // 'coin': currency['id'],
        // 'currency': currency['id'], // alias
        // 'start_date': this.iso8601 (since),
        // 'end_date': this.iso8601 (until),
        // 'wallet_fund_type': 'Deposit', // Withdraw, RealisedPNL, Commission, Refund, Prize, ExchangeOrderWithdraw, ExchangeOrderDeposit
        // 'page': 1,
        // 'limit': 20, // max 50
        // v5 transaction log
        // 'accountType': '', Account Type. UNIFIED
        // 'category': '', Product type. spot,linear,option
        // 'currency': '', Currency
        // 'baseCoin': '', BaseCoin. e.g., BTC of BTCPERP
        // 'type': '', Types of transaction logs
        // 'startTime': 0, The start timestamp (ms)
        // 'endTime': 0, The end timestamp (ms)
        // 'limit': 0, Limit for data size per page. [1, 50]. Default: 20
        // 'cursor': '', Cursor. Used for pagination
        };
        const enableUnified = await this.isUnifiedEnabled();
        let currency = undefined;
        let currencyKey = 'coin';
        if (enableUnified[1]) {
            currencyKey = 'currency';
            if (since !== undefined) {
                request['startTime'] = since;
            }
        }
        else {
            if (since !== undefined) {
                request['start_date'] = this.yyyymmdd(since);
            }
        }
        if (code !== undefined) {
            currency = this.currency(code);
            request[currencyKey] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('fetchLedger', undefined, params);
        let response = undefined;
        if (enableUnified[1]) {
            if (subType === 'inverse') {
                response = await this.privateGetV5AccountContractTransactionLog(this.extend(request, params));
            }
            else {
                response = await this.privateGetV5AccountTransactionLog(this.extend(request, params));
            }
        }
        else {
            response = await this.privateGetV5AccountContractTransactionLog(this.extend(request, params));
        }
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "ok",
        //         "ext_code": "",
        //         "result": {
        //             "data": [
        //                 {
        //                     "id": 234467,
        //                     "user_id": 1,
        //                     "coin": "BTC",
        //                     "wallet_id": 27913,
        //                     "type": "Realized P&L",
        //                     "amount": "-0.00000006",
        //                     "tx_id": "",
        //                     "address": "BTCUSD",
        //                     "wallet_balance": "0.03000330",
        //                     "exec_time": "2019-12-09T00:00:25.000Z",
        //                     "cross_seq": 0
        //                 }
        //             ]
        //         },
        //         "ext_info": null,
        //         "time_now": "1577481867.115552",
        //         "rate_limit_status": 119,
        //         "rate_limit_reset_ms": 1577481867122,
        //         "rate_limit": 120
        //     }
        //
        // v5 transaction log
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "nextPageCursor": "21963%3A1%2C14954%3A1",
        //             "list": [
        //                 {
        //                     "symbol": "XRPUSDT",
        //                     "side": "Buy",
        //                     "funding": "-0.003676",
        //                     "orderLinkId": "",
        //                     "orderId": "1672128000-8-592324-1-2",
        //                     "fee": "0.00000000",
        //                     "change": "-0.003676",
        //                     "cashFlow": "0",
        //                     "transactionTime": "1672128000000",
        //                     "type": "SETTLEMENT",
        //                     "feeRate": "0.0001",
        //                     "size": "100",
        //                     "qty": "100",
        //                     "cashBalance": "5086.55825002",
        //                     "currency": "USDT",
        //                     "category": "linear",
        //                     "tradePrice": "0.3676",
        //                     "tradeId": "534c0003-4bf7-486f-aa02-78cee36825e4"
        //                 },
        //                 {
        //                     "symbol": "XRPUSDT",
        //                     "side": "Buy",
        //                     "funding": "",
        //                     "orderLinkId": "linear-order",
        //                     "orderId": "592b7e41-78fd-42e2-9aa3-91e1835ef3e1",
        //                     "fee": "0.01908720",
        //                     "change": "-0.0190872",
        //                     "cashFlow": "0",
        //                     "transactionTime": "1672121182224",
        //                     "type": "TRADE",
        //                     "feeRate": "0.0006",
        //                     "size": "100",
        //                     "qty": "88",
        //                     "cashBalance": "5086.56192602",
        //                     "currency": "USDT",
        //                     "category": "linear",
        //                     "tradePrice": "0.3615",
        //                     "tradeId": "5184f079-88ec-54c7-8774-5173cafd2b4e"
        //                 },
        //                 {
        //                     "symbol": "XRPUSDT",
        //                     "side": "Buy",
        //                     "funding": "",
        //                     "orderLinkId": "linear-order",
        //                     "orderId": "592b7e41-78fd-42e2-9aa3-91e1835ef3e1",
        //                     "fee": "0.00260280",
        //                     "change": "-0.0026028",
        //                     "cashFlow": "0",
        //                     "transactionTime": "1672121182224",
        //                     "type": "TRADE",
        //                     "feeRate": "0.0006",
        //                     "size": "12",
        //                     "qty": "12",
        //                     "cashBalance": "5086.58101322",
        //                     "currency": "USDT",
        //                     "category": "linear",
        //                     "tradePrice": "0.3615",
        //                     "tradeId": "8569c10f-5061-5891-81c4-a54929847eb3"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672132481405
        //     }
        //
        const data = this.addPaginationCursorToResult(response);
        return this.parseLedger(data, currency, since, limit);
    }
    parseLedgerEntry(item, currency = undefined) {
        //
        //     {
        //         "id": 234467,
        //         "user_id": 1,
        //         "coin": "BTC",
        //         "wallet_id": 27913,
        //         "type": "Realized P&L",
        //         "amount": "-0.00000006",
        //         "tx_id": "",
        //         "address": "BTCUSD",
        //         "wallet_balance": "0.03000330",
        //         "exec_time": "2019-12-09T00:00:25.000Z",
        //         "cross_seq": 0
        //     }
        //
        //     {
        //         "symbol": "XRPUSDT",
        //         "side": "Buy",
        //         "funding": "",
        //         "orderLinkId": "linear-order",
        //         "orderId": "592b7e41-78fd-42e2-9aa3-91e1835ef3e1",
        //         "fee": "0.00260280",
        //         "change": "-0.0026028",
        //         "cashFlow": "0",
        //         "transactionTime": "1672121182224",
        //         "type": "TRADE",
        //         "feeRate": "0.0006",
        //         "size": "12",
        //         "qty": "12",
        //         "cashBalance": "5086.58101322",
        //         "currency": "USDT",
        //         "category": "linear",
        //         "tradePrice": "0.3615",
        //         "tradeId": "8569c10f-5061-5891-81c4-a54929847eb3"
        //     }
        //
        const currencyId = this.safeString2(item, 'coin', 'currency');
        const code = this.safeCurrencyCode(currencyId, currency);
        currency = this.safeCurrency(currencyId, currency);
        const amountString = this.safeString2(item, 'amount', 'change');
        const afterString = this.safeString2(item, 'wallet_balance', 'cashBalance');
        const direction = Precise["default"].stringLt(amountString, '0') ? 'out' : 'in';
        let before = undefined;
        let after = undefined;
        let amount = undefined;
        if (afterString !== undefined && amountString !== undefined) {
            const difference = (direction === 'out') ? amountString : Precise["default"].stringNeg(amountString);
            before = this.parseToNumeric(Precise["default"].stringAdd(afterString, difference));
            after = this.parseToNumeric(afterString);
            amount = this.parseToNumeric(Precise["default"].stringAbs(amountString));
        }
        let timestamp = this.parse8601(this.safeString(item, 'exec_time'));
        if (timestamp === undefined) {
            timestamp = this.safeInteger(item, 'transactionTime');
        }
        return this.safeLedgerEntry({
            'info': item,
            'id': this.safeString(item, 'id'),
            'direction': direction,
            'account': this.safeString(item, 'wallet_id'),
            'referenceId': this.safeString(item, 'tx_id'),
            'referenceAccount': undefined,
            'type': this.parseLedgerEntryType(this.safeString(item, 'type')),
            'currency': code,
            'amount': amount,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'before': before,
            'after': after,
            'status': 'ok',
            'fee': {
                'currency': code,
                'cost': this.safeNumber(item, 'fee'),
            },
        }, currency);
    }
    parseLedgerEntryType(type) {
        const types = {
            'Deposit': 'transaction',
            'Withdraw': 'transaction',
            'RealisedPNL': 'trade',
            'Commission': 'fee',
            'Refund': 'cashback',
            'Prize': 'prize',
            'ExchangeOrderWithdraw': 'transaction',
            'ExchangeOrderDeposit': 'transaction',
            // v5
            'TRANSFER_IN': 'transaction',
            'TRANSFER_OUT': 'transaction',
            'TRADE': 'trade',
            'SETTLEMENT': 'trade',
            'DELIVERY': 'trade',
            'LIQUIDATION': 'trade',
            'BONUS': 'Prize',
            'FEE_REFUND': 'cashback',
            'INTEREST': 'transaction',
            'CURRENCY_BUY': 'trade',
            'CURRENCY_SELL': 'trade',
        };
        return this.safeString(types, type, type);
    }
    /**
     * @method
     * @name bybit#withdraw
     * @description make a withdrawal
     * @see https://bybit-exchange.github.io/docs/v5/asset/withdraw
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        let accountType = undefined;
        [accountType, params] = this.handleOptionAndParams(params, 'withdraw', 'accountType', 'SPOT');
        await this.loadMarkets();
        this.checkAddress(address);
        const currency = this.currency(code);
        const request = {
            'coin': currency['id'],
            'amount': this.numberToString(amount),
            'address': address,
            'timestamp': this.milliseconds(),
            'accountType': accountType,
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const [networkCode, query] = this.handleNetworkCodeAndParams(params);
        const networkId = this.networkCodeToId(networkCode);
        if (networkId !== undefined) {
            request['chain'] = networkId.toUpperCase();
        }
        const response = await this.privatePostV5AssetWithdrawCreate(this.extend(request, query));
        //
        //    {
        //         "retCode": "0",
        //         "retMsg": "success",
        //         "result": {
        //             "id": "9377266"
        //         },
        //         "retExtInfo": {},
        //         "time": "1666892894902"
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        return this.parseTransaction(result, currency);
    }
    /**
     * @method
     * @name bybit#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://bybit-exchange.github.io/docs/v5/position
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPosition(symbol, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchPosition() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        let type = undefined;
        [type, params] = this.getBybitType('fetchPosition', market, params);
        request['category'] = type;
        response = await this.privateGetV5PositionList(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "nextPageCursor": "updateAt%3D1672279322668",
        //             "category": "linear",
        //             "list": [
        //                 {
        //                     "symbol": "XRPUSDT",
        //                     "leverage": "10",
        //                     "avgPrice": "0.3615",
        //                     "liqPrice": "0.0001",
        //                     "riskLimitValue": "200000",
        //                     "takeProfit": "",
        //                     "positionValue": "36.15",
        //                     "tpslMode": "Full",
        //                     "riskId": 41,
        //                     "trailingStop": "0",
        //                     "unrealisedPnl": "-1.83",
        //                     "markPrice": "0.3432",
        //                     "cumRealisedPnl": "0.48805876",
        //                     "positionMM": "0.381021",
        //                     "createdTime": "1672121182216",
        //                     "positionIdx": 0,
        //                     "positionIM": "3.634521",
        //                     "updatedTime": "1672279322668",
        //                     "side": "Buy",
        //                     "bustPrice": "",
        //                     "size": "100",
        //                     "positionStatus": "Normal",
        //                     "stopLoss": "",
        //                     "tradeMode": 0
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672280219169
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const positions = this.safeList2(result, 'list', 'dataList', []);
        const timestamp = this.safeInteger(response, 'time');
        const first = this.safeDict(positions, 0, {});
        const position = this.parsePosition(first, market);
        position['timestamp'] = timestamp;
        position['datetime'] = this.iso8601(timestamp);
        return position;
    }
    /**
     * @method
     * @name bybit#fetchPositions
     * @description fetch all open positions
     * @see https://bybit-exchange.github.io/docs/v5/position
     * @param {string[]} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {string} [params.baseCoin] Base coin. Supports linear, inverse & option
     * @param {string} [params.settleCoin] Settle coin. Supports linear, inverse & option
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        let symbol = undefined;
        if ((symbols !== undefined) && Array.isArray(symbols)) {
            const symbolsLength = symbols.length;
            if (symbolsLength > 1) {
                throw new errors.ArgumentsRequired(this.id + ' fetchPositions() does not accept an array with more than one symbol');
            }
            else if (symbolsLength === 1) {
                symbol = symbols[0];
            }
            symbols = this.marketSymbols(symbols);
        }
        else if (symbols !== undefined) {
            symbol = symbols;
            symbols = [this.symbol(symbol)];
        }
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            request['symbol'] = market['id'];
        }
        let type = undefined;
        [type, params] = this.getBybitType('fetchPositions', market, params);
        if (type === 'linear' || type === 'inverse') {
            const baseCoin = this.safeString(params, 'baseCoin');
            if (type === 'linear') {
                if (symbol === undefined && baseCoin === undefined) {
                    const defaultSettle = this.safeString(this.options, 'defaultSettle', 'USDT');
                    const settleCoin = this.safeString(params, 'settleCoin', defaultSettle);
                    request['settleCoin'] = settleCoin;
                }
            }
            else {
                // inverse
                if (symbol === undefined && baseCoin === undefined) {
                    request['category'] = 'inverse';
                }
            }
        }
        params = this.omit(params, ['type']);
        request['category'] = type;
        const response = await this.privateGetV5PositionList(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "Success",
        //         "result": {
        //             "nextPageCursor": "0%3A1657711949945%2C0%3A1657711949945",
        //             "category": "linear",
        //             "list": [
        //                 {
        //                     "symbol": "ETHUSDT",
        //                     "leverage": "10",
        //                     "updatedTime": 1657711949945,
        //                     "side": "Buy",
        //                     "positionValue": "536.92500000",
        //                     "takeProfit": "",
        //                     "tpslMode": "Full",
        //                     "riskId": 11,
        //                     "trailingStop": "",
        //                     "entryPrice": "1073.85000000",
        //                     "unrealisedPnl": "",
        //                     "markPrice": "1080.65000000",
        //                     "size": "0.5000",
        //                     "positionStatus": "normal",
        //                     "stopLoss": "",
        //                     "cumRealisedPnl": "-0.32215500",
        //                     "positionMM": "2.97456450",
        //                     "createdTime": 1657711949928,
        //                     "positionIdx": 0,
        //                     "positionIM": "53.98243950"
        //                 }
        //             ]
        //         },
        //         "time": 1657713693182
        //     }
        //
        const positions = this.addPaginationCursorToResult(response);
        const results = [];
        for (let i = 0; i < positions.length; i++) {
            let rawPosition = positions[i];
            if (('data' in rawPosition) && ('is_valid' in rawPosition)) {
                // futures only
                rawPosition = this.safeDict(rawPosition, 'data');
            }
            results.push(this.parsePosition(rawPosition));
        }
        return this.filterByArrayPositions(results, 'symbol', symbols, false);
    }
    parsePosition(position, market = undefined) {
        //
        // linear swap
        //
        //     {
        //         "positionIdx": 0,
        //         "riskId": "11",
        //         "symbol": "ETHUSDT",
        //         "side": "Buy",
        //         "size": "0.10",
        //         "positionValue": "119.845",
        //         "entryPrice": "1198.45",
        //         "tradeMode": 1,
        //         "autoAddMargin": 0,
        //         "leverage": "4.2",
        //         "positionBalance": "28.58931118",
        //         "liqPrice": "919.10",
        //         "bustPrice": "913.15",
        //         "takeProfit": "0.00",
        //         "stopLoss": "0.00",
        //         "trailingStop": "0.00",
        //         "unrealisedPnl": "0.083",
        //         "createdTime": "1669097244192",
        //         "updatedTime": "1669413126190",
        //         "tpSlMode": "Full",
        //         "riskLimitValue": "900000",
        //         "activePrice": "0.00"
        //     }
        //
        // usdc
        //    {
        //       "symbol":"BTCPERP",
        //       "leverage":"1.00",
        //       "occClosingFee":"0.0000",
        //       "liqPrice":"",
        //       "positionValue":"30.8100",
        //       "takeProfit":"0.0",
        //       "riskId":"10001",
        //       "trailingStop":"0.0000",
        //       "unrealisedPnl":"0.0000",
        //       "createdAt":"1652451795305",
        //       "markPrice":"30809.41",
        //       "cumRealisedPnl":"0.0000",
        //       "positionMM":"0.1541",
        //       "positionIM":"30.8100",
        //       "updatedAt":"1652451795305",
        //       "tpSLMode":"UNKNOWN",
        //       "side":"Buy",
        //       "bustPrice":"",
        //       "deleverageIndicator":"0",
        //       "entryPrice":"30810.0",
        //       "size":"0.001",
        //       "sessionRPL":"0.0000",
        //       "positionStatus":"NORMAL",
        //       "sessionUPL":"-0.0006",
        //       "stopLoss":"0.0",
        //       "orderMargin":"0.0000",
        //       "sessionAvgPrice":"30810.0"
        //    }
        //
        // unified margin
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "leverage": "10",
        //         "updatedTime": 1657711949945,
        //         "side": "Buy",
        //         "positionValue": "536.92500000",
        //         "takeProfit": "",
        //         "tpslMode": "Full",
        //         "riskId": 11,
        //         "trailingStop": "",
        //         "entryPrice": "1073.85000000",
        //         "unrealisedPnl": "",
        //         "markPrice": "1080.65000000",
        //         "size": "0.5000",
        //         "positionStatus": "normal",
        //         "stopLoss": "",
        //         "cumRealisedPnl": "-0.32215500",
        //         "positionMM": "2.97456450",
        //         "createdTime": 1657711949928,
        //         "positionIdx": 0,
        //         "positionIM": "53.98243950"
        //     }
        //
        // unified account
        //
        //     {
        //         "symbol": "XRPUSDT",
        //         "leverage": "10",
        //         "avgPrice": "0.3615",
        //         "liqPrice": "0.0001",
        //         "riskLimitValue": "200000",
        //         "takeProfit": "",
        //         "positionValue": "36.15",
        //         "tpslMode": "Full",
        //         "riskId": 41,
        //         "trailingStop": "0",
        //         "unrealisedPnl": "-1.83",
        //         "markPrice": "0.3432",
        //         "cumRealisedPnl": "0.48805876",
        //         "positionMM": "0.381021",
        //         "createdTime": "1672121182216",
        //         "positionIdx": 0,
        //         "positionIM": "3.634521",
        //         "updatedTime": "1672279322668",
        //         "side": "Buy",
        //         "bustPrice": "",
        //         "size": "100",
        //         "positionStatus": "Normal",
        //         "stopLoss": "",
        //         "tradeMode": 0
        //     }
        //
        // fetchPositionsHistory
        //
        //    {
        //        symbol: 'XRPUSDT',
        //        orderType: 'Market',
        //        leverage: '10',
        //        updatedTime: '1712717265572',
        //        side: 'Sell',
        //        orderId: '071749f3-a9fa-427b-b5ca-27b2f52b81de',
        //        closedPnl: '-0.00049568',
        //        avgEntryPrice: '0.6045',
        //        qty: '3',
        //        cumEntryValue: '1.8135',
        //        createdTime: '1712717265566',
        //        orderPrice: '0.5744',
        //        closedSize: '3',
        //        avgExitPrice: '0.605',
        //        execType: 'Trade',
        //        fillCount: '1',
        //        cumExitValue: '1.815'
        //    }
        //
        const closedSize = this.safeString(position, 'closedSize');
        const isHistory = (closedSize !== undefined);
        const contract = this.safeString(position, 'symbol');
        market = this.safeMarket(contract, market, undefined, 'contract');
        const size = Precise["default"].stringAbs(this.safeString2(position, 'size', 'qty'));
        let side = this.safeString(position, 'side');
        if (side !== undefined) {
            if (side === 'Buy') {
                side = isHistory ? 'short' : 'long';
            }
            else if (side === 'Sell') {
                side = isHistory ? 'long' : 'short';
            }
            else {
                side = undefined;
            }
        }
        const notional = this.safeString2(position, 'positionValue', 'cumExitValue');
        const unrealisedPnl = this.omitZero(this.safeString(position, 'unrealisedPnl'));
        let initialMarginString = this.safeStringN(position, ['positionIM', 'cumEntryValue']);
        let maintenanceMarginString = this.safeString(position, 'positionMM');
        const timestamp = this.safeIntegerN(position, ['createdTime', 'createdAt']);
        let lastUpdateTimestamp = this.parse8601(this.safeString(position, 'updated_at'));
        if (lastUpdateTimestamp === undefined) {
            lastUpdateTimestamp = this.safeIntegerN(position, ['updatedTime', 'updatedAt', 'updatedTime']);
        }
        const tradeMode = this.safeInteger(position, 'tradeMode', 0);
        let marginMode = undefined;
        if ((!this.options['enableUnifiedAccount']) || (this.options['enableUnifiedAccount'] && market['inverse'])) {
            // tradeMode would work for classic and UTA(inverse)
            if (!isHistory) { // cannot tell marginMode for fetchPositionsHistory, and closedSize will only be defined for fetchPositionsHistory response
                marginMode = (tradeMode === 1) ? 'isolated' : 'cross';
            }
        }
        let collateralString = this.safeString(position, 'positionBalance');
        const entryPrice = this.omitZero(this.safeStringN(position, ['entryPrice', 'avgPrice', 'avgEntryPrice']));
        const liquidationPrice = this.omitZero(this.safeString(position, 'liqPrice'));
        const leverage = this.safeString(position, 'leverage');
        if (liquidationPrice !== undefined) {
            if (market['settle'] === 'USDC') {
                //  (Entry price - Liq price) * Contracts + Maintenance Margin + (unrealised pnl) = Collateral
                const difference = Precise["default"].stringAbs(Precise["default"].stringSub(entryPrice, liquidationPrice));
                collateralString = Precise["default"].stringAdd(Precise["default"].stringAdd(Precise["default"].stringMul(difference, size), maintenanceMarginString), unrealisedPnl);
            }
            else {
                const bustPrice = this.safeString(position, 'bustPrice');
                if (market['linear']) {
                    // derived from the following formulas
                    //  (Entry price - Bust price) * Contracts = Collateral
                    //  (Entry price - Liq price) * Contracts = Collateral - Maintenance Margin
                    // Maintenance Margin = (Bust price - Liq price) x Contracts
                    const maintenanceMarginPriceDifference = Precise["default"].stringAbs(Precise["default"].stringSub(liquidationPrice, bustPrice));
                    maintenanceMarginString = Precise["default"].stringMul(maintenanceMarginPriceDifference, size);
                    // Initial Margin = Contracts x Entry Price / Leverage
                    if (entryPrice !== undefined) {
                        initialMarginString = Precise["default"].stringDiv(Precise["default"].stringMul(size, entryPrice), leverage);
                    }
                }
                else {
                    // Contracts * (1 / Entry price - 1 / Bust price) = Collateral
                    // Contracts * (1 / Entry price - 1 / Liq price) = Collateral - Maintenance Margin
                    // Maintenance Margin = Contracts * (1 / Liq price - 1 / Bust price)
                    // Maintenance Margin = Contracts * (Bust price - Liq price) / (Liq price x Bust price)
                    const difference = Precise["default"].stringAbs(Precise["default"].stringSub(bustPrice, liquidationPrice));
                    const multiply = Precise["default"].stringMul(bustPrice, liquidationPrice);
                    maintenanceMarginString = Precise["default"].stringDiv(Precise["default"].stringMul(size, difference), multiply);
                    // Initial Margin = Leverage x Contracts / EntryPrice
                    if (entryPrice !== undefined) {
                        initialMarginString = Precise["default"].stringDiv(size, Precise["default"].stringMul(entryPrice, leverage));
                    }
                }
            }
        }
        const maintenanceMarginPercentage = Precise["default"].stringDiv(maintenanceMarginString, notional);
        const marginRatio = Precise["default"].stringDiv(maintenanceMarginString, collateralString, 4);
        const positionIdx = this.safeString(position, 'positionIdx');
        const hedged = (positionIdx !== undefined) && (positionIdx !== '0');
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'initialMargin': this.parseNumber(initialMarginString),
            'initialMarginPercentage': this.parseNumber(Precise["default"].stringDiv(initialMarginString, notional)),
            'maintenanceMargin': this.parseNumber(maintenanceMarginString),
            'maintenanceMarginPercentage': this.parseNumber(maintenanceMarginPercentage),
            'entryPrice': this.parseNumber(entryPrice),
            'notional': this.parseNumber(notional),
            'leverage': this.parseNumber(leverage),
            'unrealizedPnl': this.parseNumber(unrealisedPnl),
            'realizedPnl': this.safeNumber(position, 'closedPnl'),
            'contracts': this.parseNumber(size),
            'contractSize': this.safeNumber(market, 'contractSize'),
            'marginRatio': this.parseNumber(marginRatio),
            'liquidationPrice': this.parseNumber(liquidationPrice),
            'markPrice': this.safeNumber(position, 'markPrice'),
            'lastPrice': this.safeNumber(position, 'avgExitPrice'),
            'collateral': this.parseNumber(collateralString),
            'marginMode': marginMode,
            'side': side,
            'percentage': undefined,
            'stopLossPrice': this.safeNumber2(position, 'stop_loss', 'stopLoss'),
            'takeProfitPrice': this.safeNumber2(position, 'take_profit', 'takeProfit'),
            'hedged': hedged,
        });
    }
    /**
     * @method
     * @name bybit#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://bybit-exchange.github.io/docs/v5/position
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverage(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const position = await this.fetchPosition(symbol, params);
        return this.parseLeverage(position, market);
    }
    parseLeverage(leverage, market = undefined) {
        const marketId = this.safeString(leverage, 'symbol');
        const leverageValue = this.safeInteger(leverage, 'leverage');
        return {
            'info': leverage,
            'symbol': this.safeSymbol(marketId, market),
            'marginMode': this.safeStringLower(leverage, 'marginMode'),
            'longLeverage': leverageValue,
            'shortLeverage': leverageValue,
        };
    }
    /**
     * @method
     * @name bybit#setMarginMode
     * @description set margin mode (account) or trade mode (symbol)
     * @see https://bybit-exchange.github.io/docs/v5/account/set-margin-mode
     * @see https://bybit-exchange.github.io/docs/v5/position/cross-isolate
     * @param {string} marginMode account mode must be either [isolated, cross, portfolio], trade mode must be either [isolated, cross]
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.leverage] the rate of leverage, is required if setting trade mode (symbol)
     * @returns {object} response from the exchange
     */
    async setMarginMode(marginMode, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const [enableUnifiedMargin, enableUnifiedAccount] = await this.isUnifiedEnabled();
        const isUnifiedAccount = (enableUnifiedMargin || enableUnifiedAccount);
        let market = undefined;
        let response = undefined;
        if (isUnifiedAccount) {
            if (marginMode === 'isolated') {
                marginMode = 'ISOLATED_MARGIN';
            }
            else if (marginMode === 'cross') {
                marginMode = 'REGULAR_MARGIN';
            }
            else if (marginMode === 'portfolio') {
                marginMode = 'PORTFOLIO_MARGIN';
            }
            else {
                throw new errors.NotSupported(this.id + ' setMarginMode() marginMode must be either [isolated, cross, portfolio]');
            }
            const request = {
                'setMarginMode': marginMode,
            };
            response = await this.privatePostV5AccountSetMarginMode(this.extend(request, params));
        }
        else {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires a symbol parameter for non unified account');
            }
            market = this.market(symbol);
            const isUsdcSettled = market['settle'] === 'USDC';
            if (isUsdcSettled) {
                if (marginMode === 'cross') {
                    marginMode = 'REGULAR_MARGIN';
                }
                else if (marginMode === 'portfolio') {
                    marginMode = 'PORTFOLIO_MARGIN';
                }
                else {
                    throw new errors.NotSupported(this.id + ' setMarginMode() for usdc market marginMode must be either [cross, portfolio]');
                }
                const request = {
                    'setMarginMode': marginMode,
                };
                response = await this.privatePostV5AccountSetMarginMode(this.extend(request, params));
            }
            else {
                let type = undefined;
                [type, params] = this.getBybitType('setPositionMode', market, params);
                let tradeMode = undefined;
                if (marginMode === 'cross') {
                    tradeMode = 0;
                }
                else if (marginMode === 'isolated') {
                    tradeMode = 1;
                }
                else {
                    throw new errors.NotSupported(this.id + ' setMarginMode() with symbol marginMode must be either [isolated, cross]');
                }
                let sellLeverage = undefined;
                let buyLeverage = undefined;
                const leverage = this.safeString(params, 'leverage');
                if (leverage === undefined) {
                    sellLeverage = this.safeString2(params, 'sell_leverage', 'sellLeverage');
                    buyLeverage = this.safeString2(params, 'buy_leverage', 'buyLeverage');
                    if (sellLeverage === undefined && buyLeverage === undefined) {
                        throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires a leverage parameter or sell_leverage and buy_leverage parameters');
                    }
                    if (buyLeverage === undefined) {
                        buyLeverage = sellLeverage;
                    }
                    if (sellLeverage === undefined) {
                        sellLeverage = buyLeverage;
                    }
                    params = this.omit(params, ['buy_leverage', 'sell_leverage', 'sellLeverage', 'buyLeverage']);
                }
                else {
                    sellLeverage = leverage;
                    buyLeverage = leverage;
                    params = this.omit(params, 'leverage');
                }
                const request = {
                    'category': type,
                    'symbol': market['id'],
                    'tradeMode': tradeMode,
                    'buyLeverage': buyLeverage,
                    'sellLeverage': sellLeverage,
                };
                response = await this.privatePostV5PositionSwitchIsolated(this.extend(request, params));
            }
        }
        return response;
    }
    /**
     * @method
     * @name bybit#setLeverage
     * @description set the level of leverage for a market
     * @see https://bybit-exchange.github.io/docs/v5/position/leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.buyLeverage] leverage for buy side
     * @param {string} [params.sellLeverage] leverage for sell side
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        // engage in leverage setting
        // we reuse the code here instead of having two methods
        const leverageString = this.numberToString(leverage);
        const request = {
            'symbol': market['id'],
            'buyLeverage': leverageString,
            'sellLeverage': leverageString,
        };
        request['buyLeverage'] = leverageString;
        request['sellLeverage'] = leverageString;
        if (market['linear']) {
            request['category'] = 'linear';
        }
        else if (market['inverse']) {
            request['category'] = 'inverse';
        }
        else {
            throw new errors.NotSupported(this.id + ' setLeverage() only support linear and inverse market');
        }
        const response = await this.privatePostV5PositionSetLeverage(this.extend(request, params));
        return response;
    }
    /**
     * @method
     * @name bybit#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://bybit-exchange.github.io/docs/v5/position/position-mode
     * @param {bool} hedged
     * @param {string} symbol used for unified account with inverse market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setPositionMode(hedged, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let mode = undefined;
        if (hedged) {
            mode = 3;
        }
        else {
            mode = 0;
        }
        const request = {
            'mode': mode,
        };
        if (symbol === undefined) {
            request['coin'] = 'USDT';
        }
        else {
            request['symbol'] = market['id'];
        }
        if (symbol !== undefined) {
            request['category'] = market['linear'] ? 'linear' : 'inverse';
        }
        else {
            let type = undefined;
            [type, params] = this.getBybitType('setPositionMode', market, params);
            request['category'] = type;
        }
        params = this.omit(params, 'type');
        const response = await this.privatePostV5PositionSwitchMode(this.extend(request, params));
        //
        // v5
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {},
        //         "retExtInfo": {},
        //         "time": 1675249072814
        //     }
        return response;
    }
    async fetchDerivativesOpenInterestHistory(symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = this.market(symbol);
        const subType = market['linear'] ? 'linear' : 'inverse';
        const category = this.safeString(params, 'category', subType);
        const intervals = this.safeDict(this.options, 'intervals');
        const interval = this.safeString(intervals, timeframe); // 5min,15min,30min,1h,4h,1d
        if (interval === undefined) {
            throw new errors.BadRequest(this.id + ' fetchOpenInterestHistory() cannot use the ' + timeframe + ' timeframe');
        }
        const request = {
            'symbol': market['id'],
            'intervalTime': interval,
            'category': category,
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger(params, 'until'); // unified in milliseconds
        params = this.omit(params, ['until']);
        if (until !== undefined) {
            request['endTime'] = until;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV5MarketOpenInterest(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "symbol": "BTCUSD",
        //             "category": "inverse",
        //             "list": [
        //                 {
        //                     "openInterest": "461134384.00000000",
        //                     "timestamp": "1669571400000"
        //                 },
        //                 {
        //                     "openInterest": "461134292.00000000",
        //                     "timestamp": "1669571100000"
        //                 }
        //             ],
        //             "nextPageCursor": ""
        //         },
        //         "retExtInfo": {},
        //         "time": 1672053548579
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const data = this.addPaginationCursorToResult(response);
        const id = this.safeString(result, 'symbol');
        market = this.safeMarket(id, market, undefined, 'contract');
        return this.parseOpenInterestsHistory(data, market, since, limit);
    }
    /**
     * @method
     * @name bybit#fetchOpenInterest
     * @description Retrieves the open interest of a derivative trading pair
     * @see https://bybit-exchange.github.io/docs/v5/market/open-interest
     * @param {string} symbol Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @param {string} [params.interval] 5m, 15m, 30m, 1h, 4h, 1d
     * @param {string} [params.category] "linear" or "inverse"
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    async fetchOpenInterest(symbol, params = {}) {
        await this.loadMarkets();
        let market = this.market(symbol);
        if (!market['contract']) {
            throw new errors.BadRequest(this.id + ' fetchOpenInterest() supports contract markets only');
        }
        const timeframe = this.safeString(params, 'interval', '1h');
        const intervals = this.safeDict(this.options, 'intervals');
        const interval = this.safeString(intervals, timeframe); // 5min,15min,30min,1h,4h,1d
        if (interval === undefined) {
            throw new errors.BadRequest(this.id + ' fetchOpenInterest() cannot use the ' + timeframe + ' timeframe');
        }
        const subType = market['linear'] ? 'linear' : 'inverse';
        const category = this.safeString(params, 'category', subType);
        const request = {
            'symbol': market['id'],
            'intervalTime': interval,
            'category': category,
        };
        const response = await this.publicGetV5MarketOpenInterest(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "symbol": "BTCUSD",
        //             "category": "inverse",
        //             "list": [
        //                 {
        //                     "openInterest": "461134384.00000000",
        //                     "timestamp": "1669571400000"
        //                 },
        //                 {
        //                     "openInterest": "461134292.00000000",
        //                     "timestamp": "1669571100000"
        //                 }
        //             ],
        //             "nextPageCursor": ""
        //         },
        //         "retExtInfo": {},
        //         "time": 1672053548579
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const id = this.safeString(result, 'symbol');
        market = this.safeMarket(id, market, undefined, 'contract');
        const data = this.addPaginationCursorToResult(response);
        return this.parseOpenInterest(data[0], market);
    }
    /**
     * @method
     * @name bybit#fetchOpenInterestHistory
     * @description Gets the total amount of unsettled contracts. In other words, the total number of contracts held in open positions
     * @see https://bybit-exchange.github.io/docs/v5/market/open-interest
     * @param {string} symbol Unified market symbol
     * @param {string} timeframe "5m", 15m, 30m, 1h, 4h, 1d
     * @param {int} [since] Not used by Bybit
     * @param {int} [limit] The number of open interest structures to return. Max 200, default 50
     * @param {object} [params] Exchange specific parameters
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns An array of open interest structures
     */
    async fetchOpenInterestHistory(symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        if (timeframe === '1m') {
            throw new errors.BadRequest(this.id + ' fetchOpenInterestHistory cannot use the 1m timeframe');
        }
        await this.loadMarkets();
        const paginate = this.safeBool(params, 'paginate');
        if (paginate) {
            params = this.omit(params, 'paginate');
            params['timeframe'] = timeframe;
            return await this.fetchPaginatedCallCursor('fetchOpenInterestHistory', symbol, since, limit, params, 'nextPageCursor', 'cursor', undefined, 200);
        }
        const market = this.market(symbol);
        if (market['spot'] || market['option']) {
            throw new errors.BadRequest(this.id + ' fetchOpenInterestHistory() symbol does not support market ' + symbol);
        }
        ({
            'symbol': market['id'],
        });
        return await this.fetchDerivativesOpenInterestHistory(symbol, timeframe, since, limit, params);
    }
    parseOpenInterest(interest, market = undefined) {
        //
        //    {
        //        "openInterest": 64757.62400000,
        //        "timestamp": 1665784800000,
        //    }
        //
        const timestamp = this.safeInteger(interest, 'timestamp');
        const openInterest = this.safeNumber2(interest, 'open_interest', 'openInterest');
        // the openInterest is in the base asset for linear and quote asset for inverse
        const amount = market['linear'] ? openInterest : undefined;
        const value = market['inverse'] ? openInterest : undefined;
        return this.safeOpenInterest({
            'symbol': market['symbol'],
            'openInterestAmount': amount,
            'openInterestValue': value,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': interest,
        }, market);
    }
    /**
     * @method
     * @name bybit#fetchCrossBorrowRate
     * @description fetch the rate of interest to borrow a currency for margin trading
     * @see https://bybit-exchange.github.io/docs/zh-TW/v5/spot-margin-normal/interest-quota
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [borrow rate structure]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    async fetchCrossBorrowRate(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'coin': currency['id'],
        };
        const response = await this.privateGetV5SpotCrossMarginTradeLoanInfo(this.extend(request, params));
        //
        //    {
        //         "retCode": "0",
        //         "retMsg": "success",
        //         "result": {
        //             "coin": "USDT",
        //             "interestRate": "0.000107000000",
        //             "loanAbleAmount": "",
        //             "maxLoanAmount": "79999.999"
        //         },
        //         "retExtInfo": null,
        //         "time": "1666734490778"
        //     }
        //
        const timestamp = this.safeInteger(response, 'time');
        const data = this.safeDict(response, 'result', {});
        data['timestamp'] = timestamp;
        return this.parseBorrowRate(data, currency);
    }
    parseBorrowRate(info, currency = undefined) {
        //
        //     {
        //         "coin": "USDT",
        //         "interestRate": "0.000107000000",
        //         "loanAbleAmount": "",
        //         "maxLoanAmount": "79999.999",
        //         "timestamp": 1666734490778
        //     }
        //
        // fetchBorrowRateHistory
        //     {
        //         "timestamp": 1721469600000,
        //         "currency": "USDC",
        //         "hourlyBorrowRate": "0.000014621596",
        //         "vipLevel": "No VIP"
        //     }
        //
        const timestamp = this.safeInteger(info, 'timestamp');
        const currencyId = this.safeString2(info, 'coin', 'currency');
        const hourlyBorrowRate = this.safeNumber(info, 'hourlyBorrowRate');
        const period = (hourlyBorrowRate !== undefined) ? 3600000 : 86400000; // 1h or 1d
        return {
            'currency': this.safeCurrencyCode(currencyId, currency),
            'rate': this.safeNumber(info, 'interestRate', hourlyBorrowRate),
            'period': period,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': info,
        };
    }
    /**
     * @method
     * @name bybit#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://bybit-exchange.github.io/docs/zh-TW/v5/spot-margin-normal/account-info
     * @param {string} code unified currency code
     * @param {string} symbol unified market symbol when fetch interest in isolated markets
     * @param {number} [since] the earliest time in ms to fetch borrrow interest for
     * @param {number} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    async fetchBorrowInterest(code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        const response = await this.privateGetV5SpotCrossMarginTradeAccount(this.extend(request, params));
        //
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "",
        //         "ext_code": null,
        //         "ext_info": null,
        //         "result": {
        //             "status": "1",
        //             "riskRate": "0",
        //             "acctBalanceSum": "0.000486213817680857",
        //             "debtBalanceSum": "0",
        //             "loanAccountList": [
        //                 {
        //                     "tokenId": "BTC",
        //                     "total": "0.00048621",
        //                     "locked": "0",
        //                     "loan": "0",
        //                     "interest": "0",
        //                     "free": "0.00048621"
        //                 },
        //                 ...
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'result', {});
        const rows = this.safeList(data, 'loanAccountList', []);
        const interest = this.parseBorrowInterests(rows, undefined);
        return this.filterByCurrencySinceLimit(interest, code, since, limit);
    }
    /**
     * @method
     * @name bybit#fetchBorrowRateHistory
     * @description retrieves a history of a currencies borrow interest rate at specific time slots
     * @see https://bybit-exchange.github.io/docs/v5/spot-margin-uta/historical-interest
     * @param {string} code unified currency code
     * @param {int} [since] timestamp for the earliest borrow rate
     * @param {int} [limit] the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure} to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} an array of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    async fetchBorrowRateHistory(code, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        if (since === undefined) {
            since = this.milliseconds() - 86400000 * 30; // last 30 days
        }
        request['startTime'] = since;
        let endTime = this.safeInteger2(params, 'until', 'endTime');
        params = this.omit(params, ['until']);
        if (endTime === undefined) {
            endTime = since + 86400000 * 30; // since + 30 days
        }
        request['endTime'] = endTime;
        const response = await this.privateGetV5SpotMarginTradeInterestRateHistory(this.extend(request, params));
        //
        //   {
        //       "retCode": 0,
        //       "retMsg": "OK",
        //       "result": {
        //           "list": [
        //               {
        //                   "timestamp": 1721469600000,
        //                   "currency": "USDC",
        //                   "hourlyBorrowRate": "0.000014621596",
        //                   "vipLevel": "No VIP"
        //               }
        //           ]
        //       },
        //       "retExtInfo": "{}",
        //       "time": 1721899048991
        //   }
        //
        const data = this.safeDict(response, 'result');
        const rows = this.safeList(data, 'list', []);
        return this.parseBorrowRateHistory(rows, code, since, limit);
    }
    parseBorrowInterest(info, market = undefined) {
        //
        //     {
        //         "tokenId": "BTC",
        //         "total": "0.00048621",
        //         "locked": "0",
        //         "loan": "0",
        //         "interest": "0",
        //         "free": "0.00048621"
        //     },
        //
        return {
            'info': info,
            'symbol': undefined,
            'currency': this.safeCurrencyCode(this.safeString(info, 'tokenId')),
            'interest': this.safeNumber(info, 'interest'),
            'interestRate': undefined,
            'amountBorrowed': this.safeNumber(info, 'loan'),
            'marginMode': 'cross',
            'timestamp': undefined,
            'datetime': undefined,
        };
    }
    /**
     * @method
     * @name bybit#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://bybit-exchange.github.io/docs/v5/asset/create-inter-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.transferId] UUID, which is unique across the platform
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        const transferId = this.safeString(params, 'transferId', this.uuid());
        const accountTypes = this.safeDict(this.options, 'accountsByType', {});
        const fromId = this.safeString(accountTypes, fromAccount, fromAccount);
        const toId = this.safeString(accountTypes, toAccount, toAccount);
        const currency = this.currency(code);
        const amountToPrecision = this.currencyToPrecision(code, amount);
        const request = {
            'transferId': transferId,
            'fromAccountType': fromId,
            'toAccountType': toId,
            'coin': currency['id'],
            'amount': amountToPrecision,
        };
        const response = await this.privatePostV5AssetTransferInterTransfer(this.extend(request, params));
        //
        // {
        //     "retCode": 0,
        //     "retMsg": "success",
        //     "result": {
        //         "transferId": "4244af44-f3b0-4cf6-a743-b56560e987bc"
        //     },
        //     "retExtInfo": {},
        //     "time": 1666875857205
        // }
        //
        const timestamp = this.safeInteger(response, 'time');
        const transfer = this.safeDict(response, 'result', {});
        const statusRaw = this.safeStringN(response, ['retCode', 'retMsg']);
        const status = this.parseTransferStatus(statusRaw);
        return this.extend(this.parseTransfer(transfer, currency), {
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'amount': this.parseNumber(amountToPrecision),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': status,
        });
    }
    /**
     * @method
     * @name bybit#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://bybit-exchange.github.io/docs/v5/asset/inter-transfer-list
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfer structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchTransfers', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchTransfers', code, since, limit, params, 'nextPageCursor', 'cursor', undefined, 50);
        }
        let currency = undefined;
        let request = {};
        if (code !== undefined) {
            currency = this.safeCurrency(code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        const response = await this.privateGetV5AssetTransferQueryInterTransferList(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "success",
        //         "result": {
        //             "list": [
        //                 {
        //                     "transferId": "selfTransfer_a1091cc7-9364-4b74-8de1-18f02c6f2d5c",
        //                     "coin": "USDT",
        //                     "amount": "5000",
        //                     "fromAccountType": "SPOT",
        //                     "toAccountType": "UNIFIED",
        //                     "timestamp": "1667283263000",
        //                     "status": "SUCCESS"
        //                 }
        //             ],
        //             "nextPageCursor": "eyJtaW5JRCI6MTM1ODQ2OCwibWF4SUQiOjEzNTg0Njh9"
        //         },
        //         "retExtInfo": {},
        //         "time": 1670988271677
        //     }
        //
        const data = this.addPaginationCursorToResult(response);
        return this.parseTransfers(data, currency, since, limit);
    }
    /**
     * @method
     * @name bybit#borrowCrossMargin
     * @description create a loan to borrow margin
     * @see https://bybit-exchange.github.io/docs/v5/spot-margin-normal/borrow
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async borrowCrossMargin(code, amount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'coin': currency['id'],
            'qty': this.currencyToPrecision(code, amount),
        };
        const response = await this.privatePostV5SpotCrossMarginTradeLoan(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "success",
        //         "result": {
        //             "transactId": "14143"
        //         },
        //         "retExtInfo": null,
        //         "time": 1662617848970
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const transaction = this.parseMarginLoan(result, currency);
        return this.extend(transaction, {
            'symbol': undefined,
            'amount': amount,
        });
    }
    /**
     * @method
     * @name bybit#repayCrossMargin
     * @description repay borrowed margin and interest
     * @see https://bybit-exchange.github.io/docs/v5/spot-margin-normal/repay
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async repayCrossMargin(code, amount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'coin': currency['id'],
            'qty': this.numberToString(amount),
        };
        const response = await this.privatePostV5SpotCrossMarginTradeRepay(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "success",
        //         "result": {
        //            "repayId": "12128"
        //         },
        //         "retExtInfo": null,
        //         "time": 1662618298452
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const transaction = this.parseMarginLoan(result, currency);
        return this.extend(transaction, {
            'symbol': undefined,
            'amount': amount,
        });
    }
    parseMarginLoan(info, currency = undefined) {
        //
        // borrowCrossMargin
        //
        //     {
        //         "transactId": "14143"
        //     }
        //
        // repayCrossMargin
        //
        //     {
        //         "repayId": "12128"
        //     }
        //
        return {
            'id': this.safeString2(info, 'transactId', 'repayId'),
            'currency': this.safeString(currency, 'code'),
            'amount': undefined,
            'symbol': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }
    parseTransferStatus(status) {
        const statuses = {
            '0': 'ok',
            'OK': 'ok',
            'SUCCESS': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        // transfer
        //
        //     {
        //         "transferId": "22c2bc11-ed5b-49a4-8647-c4e0f5f6f2b2"
        //     }
        //
        // fetchTransfers
        //
        //     {
        //         "transferId": "e9c421c4-b010-4b16-abd6-106179f27702",
        //         "coin": "USDT",
        //         "amount": "8",
        //         "fromAccountType": "FUND",
        //         "toAccountType": "SPOT",
        //         "timestamp": "1666879426000",
        //         "status": "SUCCESS"
        //      }
        //
        const currencyId = this.safeString(transfer, 'coin');
        const timestamp = this.safeInteger(transfer, 'timestamp');
        const fromAccountId = this.safeString(transfer, 'fromAccountType');
        const toAccountId = this.safeString(transfer, 'toAccountType');
        const accountIds = this.safeDict(this.options, 'accountsById', {});
        const fromAccount = this.safeString(accountIds, fromAccountId, fromAccountId);
        const toAccount = this.safeString(accountIds, toAccountId, toAccountId);
        return {
            'info': transfer,
            'id': this.safeString(transfer, 'transferId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': this.safeCurrencyCode(currencyId, currency),
            'amount': this.safeNumber(transfer, 'amount'),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': this.parseTransferStatus(this.safeString(transfer, 'status')),
        };
    }
    async fetchDerivativesMarketLeverageTiers(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (market['linear']) {
            request['category'] = 'linear';
        }
        else if (market['inverse']) {
            request['category'] = 'inverse';
        }
        const response = await this.publicGetV5MarketRiskLimit(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "category": "inverse",
        //             "list": [
        //                 {
        //                     "id": 1,
        //                     "symbol": "BTCUSD",
        //                     "riskLimitValue": "150",
        //                     "maintenanceMargin": "0.5",
        //                     "initialMargin": "1",
        //                     "isLowestRisk": 1,
        //                     "maxLeverage": "100.00"
        //                 },
        //             ....
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672054488010
        //     }
        //
        const result = this.safeDict(response, 'result');
        const tiers = this.safeList(result, 'list');
        return this.parseMarketLeverageTiers(tiers, market);
    }
    /**
     * @method
     * @name bybit#fetchMarketLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
     * @see https://bybit-exchange.github.io/docs/v5/market/risk-limit
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
     */
    async fetchMarketLeverageTiers(symbol, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        market = this.market(symbol);
        if (market['spot'] || market['option']) {
            throw new errors.BadRequest(this.id + ' fetchMarketLeverageTiers() symbol does not support market ' + symbol);
        }
        market['id'];
        return await this.fetchDerivativesMarketLeverageTiers(symbol, params);
    }
    parseTradingFee(fee, market = undefined) {
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "makerFeeRate": 0.001,
        //         "takerFeeRate": 0.001
        //     }
        //
        const marketId = this.safeString(fee, 'symbol');
        const defaultType = (market !== undefined) ? market['type'] : 'contract';
        const symbol = this.safeSymbol(marketId, market, undefined, defaultType);
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber(fee, 'makerFeeRate'),
            'taker': this.safeNumber(fee, 'takerFeeRate'),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }
    /**
     * @method
     * @name bybit#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://bybit-exchange.github.io/docs/v5/account/fee-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFee(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let category = undefined;
        if (market['linear']) {
            category = 'linear';
        }
        else if (market['inverse']) {
            category = 'inverse';
        }
        else if (market['spot']) {
            category = 'spot';
        }
        else {
            category = 'option';
        }
        request['category'] = category;
        const response = await this.privateGetV5AccountFeeRate(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "symbol": "ETHUSDT",
        //                     "takerFeeRate": "0.0006",
        //                     "makerFeeRate": "0.0001"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1676360412576
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const fees = this.safeList(result, 'list', []);
        const first = this.safeDict(fees, 0, {});
        return this.parseTradingFee(first, market);
    }
    /**
     * @method
     * @name bybit#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://bybit-exchange.github.io/docs/v5/account/fee-rate
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees(params = {}) {
        await this.loadMarkets();
        let type = undefined;
        [type, params] = this.handleOptionAndParams(params, 'fetchTradingFees', 'type', 'future');
        if (type === 'spot') {
            throw new errors.NotSupported(this.id + ' fetchTradingFees() is not supported for spot market');
        }
        const response = await this.privateGetV5AccountFeeRate(params);
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "symbol": "ETHUSDT",
        //                     "takerFeeRate": "0.0006",
        //                     "makerFeeRate": "0.0001"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1676360412576
        //     }
        //
        let fees = this.safeDict(response, 'result', {});
        fees = this.safeList(fees, 'list', []);
        const result = {};
        for (let i = 0; i < fees.length; i++) {
            const fee = this.parseTradingFee(fees[i]);
            const symbol = fee['symbol'];
            result[symbol] = fee;
        }
        return result;
    }
    parseDepositWithdrawFee(fee, currency = undefined) {
        //
        //    {
        //        "name": "BTC",
        //        "coin": "BTC",
        //        "remainAmount": "150",
        //        "chains": [
        //            {
        //                "chainType": "BTC",
        //                "confirmation": "10000",
        //                "withdrawFee": "0.0005",
        //                "depositMin": "0.0005",
        //                "withdrawMin": "0.001",
        //                "chain": "BTC",
        //                "chainDeposit": "1",
        //                "chainWithdraw": "1",
        //                "minAccuracy": "8"
        //            }
        //        ]
        //    }
        //
        const chains = this.safeList(fee, 'chains', []);
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
        if (chainsLength !== 0) {
            for (let i = 0; i < chainsLength; i++) {
                const chain = chains[i];
                const networkId = this.safeString(chain, 'chain');
                const currencyCode = this.safeString(currency, 'code');
                const networkCode = this.networkIdToCode(networkId, currencyCode);
                result['networks'][networkCode] = {
                    'deposit': { 'fee': undefined, 'percentage': undefined },
                    'withdraw': { 'fee': this.safeNumber(chain, 'withdrawFee'), 'percentage': false },
                };
                if (chainsLength === 1) {
                    result['withdraw']['fee'] = this.safeNumber(chain, 'withdrawFee');
                    result['withdraw']['percentage'] = false;
                }
            }
        }
        return result;
    }
    /**
     * @method
     * @name bybit#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://bybit-exchange.github.io/docs/v5/asset/coin-info
     * @param {string[]} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchDepositWithdrawFees(codes = undefined, params = {}) {
        this.checkRequiredCredentials();
        await this.loadMarkets();
        const response = await this.privateGetV5AssetCoinQueryInfo(params);
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "",
        //         "result": {
        //             "rows": [
        //                 {
        //                     "name": "BTC",
        //                     "coin": "BTC",
        //                     "remainAmount": "150",
        //                     "chains": [
        //                         {
        //                             "chainType": "BTC",
        //                             "confirmation": "10000",
        //                             "withdrawFee": "0.0005",
        //                             "depositMin": "0.0005",
        //                             "withdrawMin": "0.001",
        //                             "chain": "BTC",
        //                             "chainDeposit": "1",
        //                             "chainWithdraw": "1",
        //                             "minAccuracy": "8"
        //                         }
        //                     ]
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672194582264
        //     }
        //
        const data = this.safeDict(response, 'result', {});
        const rows = this.safeList(data, 'rows', []);
        return this.parseDepositWithdrawFees(rows, codes, 'coin');
    }
    /**
     * @method
     * @name bybit#fetchSettlementHistory
     * @description fetches historical settlement records
     * @see https://bybit-exchange.github.io/docs/v5/market/delivery-price
     * @param {string} symbol unified market symbol of the settlement history
     * @param {int} [since] timestamp in ms
     * @param {int} [limit] number of records
     * @param {object} [params] exchange specific params
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @returns {object[]} a list of [settlement history objects]
     */
    async fetchSettlementHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let type = undefined;
        [type, params] = this.getBybitType('fetchSettlementHistory', market, params);
        if (type === 'spot') {
            throw new errors.NotSupported(this.id + ' fetchSettlementHistory() is not supported for spot market');
        }
        request['category'] = type;
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV5MarketDeliveryPrice(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "success",
        //         "result": {
        //             "category": "option",
        //             "nextPageCursor": "0%2C3",
        //             "list": [
        //                 {
        //                     "symbol": "SOL-27JUN23-20-C",
        //                     "deliveryPrice": "16.62258889",
        //                     "deliveryTime": "1687852800000"
        //                 },
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1689043527231
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const data = this.safeList(result, 'list', []);
        const settlements = this.parseSettlements(data, market);
        const sorted = this.sortBy(settlements, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, market['symbol'], since, limit);
    }
    /**
     * @method
     * @name bybit#fetchMySettlementHistory
     * @description fetches historical settlement records of the user
     * @see https://bybit-exchange.github.io/docs/v5/asset/delivery
     * @param {string} symbol unified market symbol of the settlement history
     * @param {int} [since] timestamp in ms
     * @param {int} [limit] number of records
     * @param {object} [params] exchange specific params
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @returns {object[]} a list of [settlement history objects]
     */
    async fetchMySettlementHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let type = undefined;
        [type, params] = this.getBybitType('fetchMySettlementHistory', market, params);
        if (type === 'spot' || type === 'inverse') {
            throw new errors.NotSupported(this.id + ' fetchMySettlementHistory() is not supported for spot market');
        }
        request['category'] = 'linear';
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV5AssetDeliveryRecord(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "success",
        //         "result": {
        //             "category": "option",
        //             "nextPageCursor": "0%2C3",
        //             "list": [
        //                 {
        //                     "symbol": "SOL-27JUN23-20-C",
        //                     "deliveryPrice": "16.62258889",
        //                     "deliveryTime": "1687852800000",
        //                     "side": "Buy",
        //                     "strike": "20",
        //                     "fee": "0.00000000",
        //                     "position": "0.01",
        //                     "deliveryRpl": "3.5"
        //                 },
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1689043527231
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const data = this.safeList(result, 'list', []);
        const settlements = this.parseSettlements(data, market);
        const sorted = this.sortBy(settlements, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, market['symbol'], since, limit);
    }
    parseSettlement(settlement, market) {
        //
        // fetchSettlementHistory
        //
        //     {
        //         "symbol": "SOL-27JUN23-20-C",
        //         "deliveryPrice": "16.62258889",
        //         "deliveryTime": "1687852800000"
        //     }
        //
        // fetchMySettlementHistory
        //
        //     {
        //         "symbol": "SOL-27JUN23-20-C",
        //         "deliveryPrice": "16.62258889",
        //         "deliveryTime": "1687852800000",
        //         "side": "Buy",
        //         "strike": "20",
        //         "fee": "0.00000000",
        //         "position": "0.01",
        //         "deliveryRpl": "3.5"
        //     }
        //
        const timestamp = this.safeInteger(settlement, 'deliveryTime');
        const marketId = this.safeString(settlement, 'symbol');
        return {
            'info': settlement,
            'symbol': this.safeSymbol(marketId, market),
            'price': this.safeNumber(settlement, 'deliveryPrice'),
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
        //             "symbol": "SOL-27JUN23-20-C",
        //             "deliveryPrice": "16.62258889",
        //             "deliveryTime": "1687852800000"
        //         }
        //     ]
        //
        // fetchMySettlementHistory
        //
        //     [
        //         {
        //             "symbol": "SOL-27JUN23-20-C",
        //             "deliveryPrice": "16.62258889",
        //             "deliveryTime": "1687852800000",
        //             "side": "Buy",
        //             "strike": "20",
        //             "fee": "0.00000000",
        //             "position": "0.01",
        //             "deliveryRpl": "3.5"
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
     * @name bybit#fetchVolatilityHistory
     * @description fetch the historical volatility of an option market based on an underlying asset
     * @see https://bybit-exchange.github.io/docs/v5/market/iv
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.period] the period in days to fetch the volatility for: 7,14,21,30,60,90,180,270
     * @returns {object[]} a list of [volatility history objects]{@link https://docs.ccxt.com/#/?id=volatility-structure}
     */
    async fetchVolatilityHistory(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'category': 'option',
            'baseCoin': currency['id'],
        };
        const response = await this.publicGetV5MarketHistoricalVolatility(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "SUCCESS",
        //         "category": "option",
        //         "result": [
        //             {
        //                 "period": 7,
        //                 "value": "0.23854072",
        //                 "time": "1690574400000"
        //             }
        //         ]
        //     }
        //
        const volatility = this.safeList(response, 'result', []);
        return this.parseVolatilityHistory(volatility);
    }
    parseVolatilityHistory(volatility) {
        //
        //     {
        //         "period": 7,
        //         "value": "0.23854072",
        //         "time": "1690574400000"
        //     }
        //
        const result = [];
        for (let i = 0; i < volatility.length; i++) {
            const entry = volatility[i];
            const timestamp = this.safeInteger(entry, 'time');
            result.push({
                'info': volatility,
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
                'volatility': this.safeNumber(entry, 'value'),
            });
        }
        return result;
    }
    /**
     * @method
     * @name bybit#fetchGreeks
     * @description fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
     * @see https://bybit-exchange.github.io/docs/api-explorer/v5/market/tickers
     * @param {string} symbol unified symbol of the market to fetch greeks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [greeks structure]{@link https://docs.ccxt.com/#/?id=greeks-structure}
     */
    async fetchGreeks(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'category': 'option',
        };
        const response = await this.publicGetV5MarketTickers(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "SUCCESS",
        //         "result": {
        //             "category": "option",
        //             "list": [
        //                 {
        //                     "symbol": "BTC-26JAN24-39000-C",
        //                     "bid1Price": "3205",
        //                     "bid1Size": "7.1",
        //                     "bid1Iv": "0.5478",
        //                     "ask1Price": "3315",
        //                     "ask1Size": "1.98",
        //                     "ask1Iv": "0.5638",
        //                     "lastPrice": "3230",
        //                     "highPrice24h": "3255",
        //                     "lowPrice24h": "3200",
        //                     "markPrice": "3273.02263032",
        //                     "indexPrice": "36790.96",
        //                     "markIv": "0.5577",
        //                     "underlyingPrice": "37649.67254894",
        //                     "openInterest": "19.67",
        //                     "turnover24h": "170140.33875912",
        //                     "volume24h": "4.56",
        //                     "totalVolume": "22",
        //                     "totalTurnover": "789305",
        //                     "delta": "0.49640971",
        //                     "gamma": "0.00004131",
        //                     "vega": "69.08651675",
        //                     "theta": "-24.9443226",
        //                     "predictedDeliveryPrice": "0",
        //                     "change24h": "0.18532111"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1699584008326
        //     }
        //
        const timestamp = this.safeInteger(response, 'time');
        const result = this.safeDict(response, 'result', {});
        const data = this.safeList(result, 'list', []);
        const greeks = this.parseGreeks(data[0], market);
        return this.extend(greeks, {
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        });
    }
    parseGreeks(greeks, market = undefined) {
        //
        //     {
        //         "symbol": "BTC-26JAN24-39000-C",
        //         "bid1Price": "3205",
        //         "bid1Size": "7.1",
        //         "bid1Iv": "0.5478",
        //         "ask1Price": "3315",
        //         "ask1Size": "1.98",
        //         "ask1Iv": "0.5638",
        //         "lastPrice": "3230",
        //         "highPrice24h": "3255",
        //         "lowPrice24h": "3200",
        //         "markPrice": "3273.02263032",
        //         "indexPrice": "36790.96",
        //         "markIv": "0.5577",
        //         "underlyingPrice": "37649.67254894",
        //         "openInterest": "19.67",
        //         "turnover24h": "170140.33875912",
        //         "volume24h": "4.56",
        //         "totalVolume": "22",
        //         "totalTurnover": "789305",
        //         "delta": "0.49640971",
        //         "gamma": "0.00004131",
        //         "vega": "69.08651675",
        //         "theta": "-24.9443226",
        //         "predictedDeliveryPrice": "0",
        //         "change24h": "0.18532111"
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
            'bidSize': this.safeNumber(greeks, 'bid1Size'),
            'askSize': this.safeNumber(greeks, 'ask1Size'),
            'bidImpliedVolatility': this.safeNumber(greeks, 'bid1Iv'),
            'askImpliedVolatility': this.safeNumber(greeks, 'ask1Iv'),
            'markImpliedVolatility': this.safeNumber(greeks, 'markIv'),
            'bidPrice': this.safeNumber(greeks, 'bid1Price'),
            'askPrice': this.safeNumber(greeks, 'ask1Price'),
            'markPrice': this.safeNumber(greeks, 'markPrice'),
            'lastPrice': this.safeNumber(greeks, 'lastPrice'),
            'underlyingPrice': this.safeNumber(greeks, 'underlyingPrice'),
            'info': greeks,
        };
    }
    /**
     * @method
     * @name bybit#fetchMyLiquidations
     * @description retrieves the users liquidated positions
     * @see https://bybit-exchange.github.io/docs/api-explorer/v5/position/execution
     * @param {string} [symbol] unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the exchange API endpoint
     * @param {string} [params.type] market type, ['swap', 'option', 'spot']
     * @param {string} [params.subType] market subType, ['linear', 'inverse']
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    async fetchMyLiquidations(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyLiquidations', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchMyLiquidations', symbol, since, limit, params, 'nextPageCursor', 'cursor', undefined, 100);
        }
        let request = {
            'execType': 'BustTrade',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let type = undefined;
        [type, params] = this.getBybitType('fetchMyLiquidations', market, params);
        request['category'] = type;
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        const response = await this.privateGetV5ExecutionList(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "nextPageCursor": "132766%3A2%2C132766%3A2",
        //             "category": "linear",
        //             "list": [
        //                 {
        //                     "symbol": "ETHPERP",
        //                     "orderType": "Market",
        //                     "underlyingPrice": "",
        //                     "orderLinkId": "",
        //                     "side": "Buy",
        //                     "indexPrice": "",
        //                     "orderId": "8c065341-7b52-4ca9-ac2c-37e31ac55c94",
        //                     "stopOrderType": "UNKNOWN",
        //                     "leavesQty": "0",
        //                     "execTime": "1672282722429",
        //                     "isMaker": false,
        //                     "execFee": "0.071409",
        //                     "feeRate": "0.0006",
        //                     "execId": "e0cbe81d-0f18-5866-9415-cf319b5dab3b",
        //                     "tradeIv": "",
        //                     "blockTradeId": "",
        //                     "markPrice": "1183.54",
        //                     "execPrice": "1190.15",
        //                     "markIv": "",
        //                     "orderQty": "0.1",
        //                     "orderPrice": "1236.9",
        //                     "execValue": "119.015",
        //                     "execType": "Trade",
        //                     "execQty": "0.1"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672283754510
        //     }
        //
        const liquidations = this.addPaginationCursorToResult(response);
        return this.parseLiquidations(liquidations, market, since, limit);
    }
    parseLiquidation(liquidation, market = undefined) {
        //
        //     {
        //         "symbol": "ETHPERP",
        //         "orderType": "Market",
        //         "underlyingPrice": "",
        //         "orderLinkId": "",
        //         "side": "Buy",
        //         "indexPrice": "",
        //         "orderId": "8c065341-7b52-4ca9-ac2c-37e31ac55c94",
        //         "stopOrderType": "UNKNOWN",
        //         "leavesQty": "0",
        //         "execTime": "1672282722429",
        //         "isMaker": false,
        //         "execFee": "0.071409",
        //         "feeRate": "0.0006",
        //         "execId": "e0cbe81d-0f18-5866-9415-cf319b5dab3b",
        //         "tradeIv": "",
        //         "blockTradeId": "",
        //         "markPrice": "1183.54",
        //         "execPrice": "1190.15",
        //         "markIv": "",
        //         "orderQty": "0.1",
        //         "orderPrice": "1236.9",
        //         "execValue": "119.015",
        //         "execType": "Trade",
        //         "execQty": "0.1"
        //     }
        //
        const marketId = this.safeString(liquidation, 'symbol');
        const timestamp = this.safeInteger(liquidation, 'execTime');
        const contractsString = this.safeString(liquidation, 'execQty');
        const contractSizeString = this.safeString(market, 'contractSize');
        const priceString = this.safeString(liquidation, 'execPrice');
        const baseValueString = Precise["default"].stringMul(contractsString, contractSizeString);
        const quoteValueString = Precise["default"].stringMul(baseValueString, priceString);
        return this.safeLiquidation({
            'info': liquidation,
            'symbol': this.safeSymbol(marketId, market, undefined, 'contract'),
            'contracts': this.parseNumber(contractsString),
            'contractSize': this.parseNumber(contractSizeString),
            'price': this.parseNumber(priceString),
            'baseValue': this.parseNumber(baseValueString),
            'quoteValue': this.parseNumber(quoteValueString),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        });
    }
    async getLeverageTiersPaginated(symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'getLeverageTiersPaginated', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('getLeverageTiersPaginated', symbol, undefined, undefined, params, 'nextPageCursor', 'cursor', undefined, 100);
        }
        let subType = undefined;
        [subType, params] = this.handleSubTypeAndParams('getLeverageTiersPaginated', market, params, 'linear');
        const request = {
            'category': subType,
        };
        const response = await this.publicGetV5MarketRiskLimit(this.extend(request, params));
        const result = this.addPaginationCursorToResult(response);
        const first = this.safeDict(result, 0);
        const total = result.length;
        const lastIndex = total - 1;
        const last = this.safeDict(result, lastIndex);
        const cursorValue = this.safeString(first, 'nextPageCursor');
        last['info'] = {
            'nextPageCursor': cursorValue,
        };
        result[lastIndex] = last;
        return result;
    }
    /**
     * @method
     * @name bybit#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, for different trade sizes
     * @see https://bybit-exchange.github.io/docs/v5/market/risk-limit
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] market subType, ['linear', 'inverse'], default is 'linear'
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
     */
    async fetchLeverageTiers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        let symbol = undefined;
        if (symbols !== undefined) {
            market = this.market(symbols[0]);
            if (market['spot']) {
                throw new errors.NotSupported(this.id + ' fetchLeverageTiers() is not supported for spot market');
            }
            symbol = market['symbol'];
        }
        const data = await this.getLeverageTiersPaginated(symbol, this.extend({ 'paginate': true, 'paginationCalls': 40 }, params));
        symbols = this.marketSymbols(symbols);
        return this.parseLeverageTiers(data, symbols, 'symbol');
    }
    parseLeverageTiers(response, symbols = undefined, marketIdKey = undefined) {
        //
        //  [
        //      {
        //          "id": 1,
        //          "symbol": "BTCUSD",
        //          "riskLimitValue": "150",
        //          "maintenanceMargin": "0.5",
        //          "initialMargin": "1",
        //          "isLowestRisk": 1,
        //          "maxLeverage": "100.00"
        //      }
        //  ]
        //
        const tiers = {};
        const marketIds = this.marketIds(symbols);
        const filteredResults = this.filterByArray(response, marketIdKey, marketIds, false);
        const grouped = this.groupBy(filteredResults, marketIdKey);
        const keys = Object.keys(grouped);
        for (let i = 0; i < keys.length; i++) {
            const marketId = keys[i];
            const entry = grouped[marketId];
            for (let j = 0; j < entry.length; j++) {
                const id = this.safeInteger(entry[j], 'id');
                entry[j]['id'] = id;
            }
            const market = this.safeMarket(marketId, undefined, undefined, 'contract');
            const symbol = market['symbol'];
            tiers[symbol] = this.parseMarketLeverageTiers(this.sortBy(entry, 'id'), market);
        }
        return tiers;
    }
    parseMarketLeverageTiers(info, market = undefined) {
        //
        //  [
        //      {
        //          "id": 1,
        //          "symbol": "BTCUSD",
        //          "riskLimitValue": "150",
        //          "maintenanceMargin": "0.5",
        //          "initialMargin": "1",
        //          "isLowestRisk": 1,
        //          "maxLeverage": "100.00"
        //      }
        //  ]
        //
        const tiers = [];
        for (let i = 0; i < info.length; i++) {
            const tier = info[i];
            const marketId = this.safeString(info, 'symbol');
            market = this.safeMarket(marketId);
            let minNotional = this.parseNumber('0');
            if (i !== 0) {
                minNotional = this.safeNumber(info[i - 1], 'riskLimitValue');
            }
            tiers.push({
                'tier': this.safeInteger(tier, 'id'),
                'symbol': this.safeSymbol(marketId, market),
                'currency': market['settle'],
                'minNotional': minNotional,
                'maxNotional': this.safeNumber(tier, 'riskLimitValue'),
                'maintenanceMarginRate': this.safeNumber(tier, 'maintenanceMargin'),
                'maxLeverage': this.safeNumber(tier, 'maxLeverage'),
                'info': tier,
            });
        }
        return tiers;
    }
    /**
     * @method
     * @name bybit#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://bybit-exchange.github.io/docs/api-explorer/v5/position/execution
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchFundingHistory', symbol, since, limit, params, 'nextPageCursor', 'cursor', undefined, 100);
        }
        let request = {
            'execType': 'Funding',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let type = undefined;
        [type, params] = this.getBybitType('fetchFundingHistory', market, params);
        request['category'] = type;
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        else {
            request['size'] = 100;
        }
        [request, params] = this.handleUntilOption('endTime', request, params);
        const response = await this.privateGetV5ExecutionList(this.extend(request, params));
        const fundings = this.addPaginationCursorToResult(response);
        return this.parseIncomes(fundings, market, since, limit);
    }
    parseIncome(income, market = undefined) {
        //
        // {
        //     "symbol": "XMRUSDT",
        //     "orderType": "UNKNOWN",
        //     "underlyingPrice": "",
        //     "orderLinkId": "",
        //     "orderId": "a11e5fe2-1dbf-4bab-a9b2-af80a14efc5d",
        //     "stopOrderType": "UNKNOWN",
        //     "execTime": "1710950400000",
        //     "feeCurrency": "",
        //     "createType": "",
        //     "feeRate": "-0.000761",
        //     "tradeIv": "",
        //     "blockTradeId": "",
        //     "markPrice": "136.79",
        //     "execPrice": "137.11",
        //     "markIv": "",
        //     "orderQty": "0",
        //     "orderPrice": "0",
        //     "execValue": "134.3678",
        //     "closedSize": "0",
        //     "execType": "Funding",
        //     "seq": "28097658790",
        //     "side": "Sell",
        //     "indexPrice": "",
        //     "leavesQty": "0",
        //     "isMaker": false,
        //     "execFee": "-0.10232512",
        //     "execId": "8d1ef156-4ec6-4445-9a6c-1c0c24dbd046",
        //     "marketUnit": "",
        //     "execQty": "0.98",
        //     "nextPageCursor": "5774437%3A0%2C5771289%3A0"
        // }
        //
        const marketId = this.safeString(income, 'symbol');
        market = this.safeMarket(marketId, market, undefined, 'contract');
        let code = 'USDT';
        if (market['inverse']) {
            code = market['quote'];
        }
        const timestamp = this.safeInteger(income, 'execTime');
        return {
            'info': income,
            'symbol': this.safeSymbol(marketId, market, '-', 'swap'),
            'code': code,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': this.safeString(income, 'execId'),
            'amount': this.safeNumber(income, 'execQty'),
            'rate': this.safeNumber(income, 'feeRate'),
        };
    }
    /**
     * @method
     * @name bybit#fetchOption
     * @description fetches option data that is commonly found in an option chain
     * @see https://bybit-exchange.github.io/docs/v5/market/tickers
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [option chain structure]{@link https://docs.ccxt.com/#/?id=option-chain-structure}
     */
    async fetchOption(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'category': 'option',
            'symbol': market['id'],
        };
        const response = await this.publicGetV5MarketTickers(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "SUCCESS",
        //         "result": {
        //             "category": "option",
        //             "list": [
        //                 {
        //                     "symbol": "BTC-27DEC24-55000-P",
        //                     "bid1Price": "0",
        //                     "bid1Size": "0",
        //                     "bid1Iv": "0",
        //                     "ask1Price": "0",
        //                     "ask1Size": "0",
        //                     "ask1Iv": "0",
        //                     "lastPrice": "10980",
        //                     "highPrice24h": "0",
        //                     "lowPrice24h": "0",
        //                     "markPrice": "11814.66756236",
        //                     "indexPrice": "63838.92",
        //                     "markIv": "0.8866",
        //                     "underlyingPrice": "71690.55303594",
        //                     "openInterest": "0.01",
        //                     "turnover24h": "0",
        //                     "volume24h": "0",
        //                     "totalVolume": "2",
        //                     "totalTurnover": "78719",
        //                     "delta": "-0.23284954",
        //                     "gamma": "0.0000055",
        //                     "vega": "191.70757975",
        //                     "theta": "-30.43617927",
        //                     "predictedDeliveryPrice": "0",
        //                     "change24h": "0"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1711162003672
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const resultList = this.safeList(result, 'list', []);
        const chain = this.safeDict(resultList, 0, {});
        return this.parseOption(chain, undefined, market);
    }
    /**
     * @method
     * @name bybit#fetchOptionChain
     * @description fetches data for an underlying asset that is commonly found in an option chain
     * @see https://bybit-exchange.github.io/docs/v5/market/tickers
     * @param {string} code base currency to fetch an option chain for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [option chain structures]{@link https://docs.ccxt.com/#/?id=option-chain-structure}
     */
    async fetchOptionChain(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'category': 'option',
            'baseCoin': currency['id'],
        };
        const response = await this.publicGetV5MarketTickers(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "SUCCESS",
        //         "result": {
        //             "category": "option",
        //             "list": [
        //                 {
        //                     "symbol": "BTC-27DEC24-55000-P",
        //                     "bid1Price": "0",
        //                     "bid1Size": "0",
        //                     "bid1Iv": "0",
        //                     "ask1Price": "0",
        //                     "ask1Size": "0",
        //                     "ask1Iv": "0",
        //                     "lastPrice": "10980",
        //                     "highPrice24h": "0",
        //                     "lowPrice24h": "0",
        //                     "markPrice": "11814.66756236",
        //                     "indexPrice": "63838.92",
        //                     "markIv": "0.8866",
        //                     "underlyingPrice": "71690.55303594",
        //                     "openInterest": "0.01",
        //                     "turnover24h": "0",
        //                     "volume24h": "0",
        //                     "totalVolume": "2",
        //                     "totalTurnover": "78719",
        //                     "delta": "-0.23284954",
        //                     "gamma": "0.0000055",
        //                     "vega": "191.70757975",
        //                     "theta": "-30.43617927",
        //                     "predictedDeliveryPrice": "0",
        //                     "change24h": "0"
        //                 },
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1711162003672
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const resultList = this.safeList(result, 'list', []);
        return this.parseOptionChain(resultList, undefined, 'symbol');
    }
    parseOption(chain, currency = undefined, market = undefined) {
        //
        //     {
        //         "symbol": "BTC-27DEC24-55000-P",
        //         "bid1Price": "0",
        //         "bid1Size": "0",
        //         "bid1Iv": "0",
        //         "ask1Price": "0",
        //         "ask1Size": "0",
        //         "ask1Iv": "0",
        //         "lastPrice": "10980",
        //         "highPrice24h": "0",
        //         "lowPrice24h": "0",
        //         "markPrice": "11814.66756236",
        //         "indexPrice": "63838.92",
        //         "markIv": "0.8866",
        //         "underlyingPrice": "71690.55303594",
        //         "openInterest": "0.01",
        //         "turnover24h": "0",
        //         "volume24h": "0",
        //         "totalVolume": "2",
        //         "totalTurnover": "78719",
        //         "delta": "-0.23284954",
        //         "gamma": "0.0000055",
        //         "vega": "191.70757975",
        //         "theta": "-30.43617927",
        //         "predictedDeliveryPrice": "0",
        //         "change24h": "0"
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
            'impliedVolatility': this.safeNumber(chain, 'markIv'),
            'openInterest': this.safeNumber(chain, 'openInterest'),
            'bidPrice': this.safeNumber(chain, 'bid1Price'),
            'askPrice': this.safeNumber(chain, 'ask1Price'),
            'midPrice': undefined,
            'markPrice': this.safeNumber(chain, 'markPrice'),
            'lastPrice': this.safeNumber(chain, 'lastPrice'),
            'underlyingPrice': this.safeNumber(chain, 'underlyingPrice'),
            'change': this.safeNumber(chain, 'change24h'),
            'percentage': undefined,
            'baseVolume': this.safeNumber(chain, 'totalVolume'),
            'quoteVolume': undefined,
        };
    }
    /**
     * @method
     * @name bybit#fetchPositionsHistory
     * @description fetches historical positions
     * @see https://bybit-exchange.github.io/docs/v5/position/close-pnl
     * @param {string[]} symbols a list of unified market symbols
     * @param {int} [since] timestamp in ms of the earliest position to fetch, params["until"] - since <= 7 days
     * @param {int} [limit] the maximum amount of records to fetch, default=50, max=100
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] timestamp in ms of the latest position to fetch, params["until"] - since <= 7 days
     * @param {string} [params.subType] 'linear' or 'inverse'
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositionsHistory(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        let subType = undefined;
        let symbolsLength = 0;
        if (symbols !== undefined) {
            symbolsLength = symbols.length;
            if (symbolsLength > 0) {
                market = this.market(symbols[0]);
            }
        }
        const until = this.safeInteger(params, 'until');
        [subType, params] = this.handleSubTypeAndParams('fetchPositionsHistory', market, params, 'linear');
        params = this.omit(params, 'until');
        const request = {
            'category': subType,
        };
        if ((symbols !== undefined) && (symbolsLength === 1)) {
            request['symbol'] = market['id'];
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
        const response = await this.privateGetV5PositionClosedPnl(this.extend(request, params));
        //
        //    {
        //        retCode: '0',
        //        retMsg: 'OK',
        //        result: {
        //            nextPageCursor: '071749f3-a9fa-427b-b5ca-27b2f52b81de%3A1712717265566520788%2C071749f3-a9fa-427b-b5ca-27b2f52b81de%3A1712717265566520788',
        //            category: 'linear',
        //            list: [
        //                {
        //                    symbol: 'XRPUSDT',
        //                    orderType: 'Market',
        //                    leverage: '10',
        //                    updatedTime: '1712717265572',
        //                    side: 'Sell',
        //                    orderId: '071749f3-a9fa-427b-b5ca-27b2f52b81de',
        //                    closedPnl: '-0.00049568',
        //                    avgEntryPrice: '0.6045',
        //                    qty: '3',
        //                    cumEntryValue: '1.8135',
        //                    createdTime: '1712717265566',
        //                    orderPrice: '0.5744',
        //                    closedSize: '3',
        //                    avgExitPrice: '0.605',
        //                    execType: 'Trade',
        //                    fillCount: '1',
        //                    cumExitValue: '1.815'
        //                }
        //            ]
        //        },
        //        retExtInfo: {},
        //        time: '1712717286073'
        //    }
        //
        const result = this.safeDict(response, 'result');
        const rawPositions = this.safeList(result, 'list');
        const positions = this.parsePositions(rawPositions, symbols, params);
        return this.filterBySinceLimit(positions, since, limit);
    }
    /**
     * @method
     * @name bybit#fetchConvertCurrencies
     * @description fetches all available currencies that can be converted
     * @see https://bybit-exchange.github.io/docs/v5/asset/convert/convert-coin-list
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountType] eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract
     * @returns {object} an associative dictionary of currencies
     */
    async fetchConvertCurrencies(params = {}) {
        await this.loadMarkets();
        let accountType = undefined;
        const [enableUnifiedMargin, enableUnifiedAccount] = await this.isUnifiedEnabled();
        const isUnifiedAccount = (enableUnifiedMargin || enableUnifiedAccount);
        const accountTypeDefault = isUnifiedAccount ? 'eb_convert_uta' : 'eb_convert_spot';
        [accountType, params] = this.handleOptionAndParams(params, 'fetchConvertCurrencies', 'accountType', accountTypeDefault);
        const request = {
            'accountType': accountType,
        };
        const response = await this.privateGetV5AssetExchangeQueryCoinList(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "ok",
        //         "result": {
        //             "coins": [
        //                 {
        //                     "coin": "MATIC",
        //                     "fullName": "MATIC",
        //                     "icon": "https://s1.bycsi.com/app/assets/token/0552ae79c535c3095fa18f7b377dd2e9.svg",
        //                     "iconNight": "https://t1.bycsi.com/app/assets/token/f59301aef2d6ac2165c4c4603e672fb4.svg",
        //                     "accuracyLength": 8,
        //                     "coinType": "crypto",
        //                     "balance": "0",
        //                     "uBalance": "0",
        //                     "timePeriod": 0,
        //                     "singleFromMinLimit": "1.1",
        //                     "singleFromMaxLimit": "20001",
        //                     "singleToMinLimit": "0",
        //                     "singleToMaxLimit": "0",
        //                     "dailyFromMinLimit": "0",
        //                     "dailyFromMaxLimit": "0",
        //                     "dailyToMinLimit": "0",
        //                     "dailyToMaxLimit": "0",
        //                     "disableFrom": false,
        //                     "disableTo": false
        //                 },
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1727256416250
        //     }
        //
        const result = {};
        const data = this.safeDict(response, 'result', {});
        const coins = this.safeList(data, 'coins', []);
        for (let i = 0; i < coins.length; i++) {
            const entry = coins[i];
            const id = this.safeString(entry, 'coin');
            const disableFrom = this.safeBool(entry, 'disableFrom');
            const disableTo = this.safeBool(entry, 'disableTo');
            const inactive = (disableFrom || disableTo);
            const code = this.safeCurrencyCode(id);
            result[code] = {
                'info': entry,
                'id': id,
                'code': code,
                'networks': undefined,
                'type': this.safeString(entry, 'coinType'),
                'name': this.safeString(entry, 'fullName'),
                'active': !inactive,
                'deposit': undefined,
                'withdraw': this.safeNumber(entry, 'balance'),
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': this.safeNumber(entry, 'singleFromMinLimit'),
                        'max': this.safeNumber(entry, 'singleFromMaxLimit'),
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
     * @name bybit#fetchConvertQuote
     * @description fetch a quote for converting from one currency to another
     * @see https://bybit-exchange.github.io/docs/v5/asset/convert/apply-quote
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountType] eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async fetchConvertQuote(fromCode, toCode, amount = undefined, params = {}) {
        await this.loadMarkets();
        let accountType = undefined;
        const [enableUnifiedMargin, enableUnifiedAccount] = await this.isUnifiedEnabled();
        const isUnifiedAccount = (enableUnifiedMargin || enableUnifiedAccount);
        const accountTypeDefault = isUnifiedAccount ? 'eb_convert_uta' : 'eb_convert_spot';
        [accountType, params] = this.handleOptionAndParams(params, 'fetchConvertQuote', 'accountType', accountTypeDefault);
        const request = {
            'fromCoin': fromCode,
            'toCoin': toCode,
            'requestAmount': this.numberToString(amount),
            'requestCoin': fromCode,
            'accountType': accountType,
        };
        const response = await this.privatePostV5AssetExchangeQuoteApply(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "ok",
        //         "result": {
        //             "quoteTxId": "1010020692439481682687668224",
        //             "exchangeRate": "0.000015330836780000",
        //             "fromCoin": "USDT",
        //             "fromCoinType": "crypto",
        //             "toCoin": "BTC",
        //             "toCoinType": "crypto",
        //             "fromAmount": "10",
        //             "toAmount": "0.000153308367800000",
        //             "expiredTime": "1727257413353",
        //             "requestId": ""
        //         },
        //         "retExtInfo": {},
        //         "time": 1727257398375
        //     }
        //
        const data = this.safeDict(response, 'result', {});
        const fromCurrencyId = this.safeString(data, 'fromCoin', fromCode);
        const fromCurrency = this.currency(fromCurrencyId);
        const toCurrencyId = this.safeString(data, 'toCoin', toCode);
        const toCurrency = this.currency(toCurrencyId);
        return this.parseConversion(data, fromCurrency, toCurrency);
    }
    /**
     * @method
     * @name bybit#createConvertTrade
     * @description convert from one currency to another
     * @see https://bybit-exchange.github.io/docs/v5/asset/convert/confirm-quote
     * @param {string} id the id of the trade that you want to make
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} amount how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async createConvertTrade(id, fromCode, toCode, amount = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'quoteTxId': id,
        };
        const response = await this.privatePostV5AssetExchangeConvertExecute(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "ok",
        //         "result": {
        //             "exchangeStatus": "processing",
        //             "quoteTxId": "1010020692439483803499737088"
        //         },
        //         "retExtInfo": {},
        //         "time": 1727257904969
        //     }
        //
        const data = this.safeDict(response, 'result', {});
        return this.parseConversion(data);
    }
    /**
     * @method
     * @name bybit#fetchConvertTrade
     * @description fetch the data for a conversion trade
     * @see https://bybit-exchange.github.io/docs/v5/asset/convert/get-convert-result
     * @param {string} id the id of the trade that you want to fetch
     * @param {string} [code] the unified currency code of the conversion trade
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountType] eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async fetchConvertTrade(id, code = undefined, params = {}) {
        await this.loadMarkets();
        let accountType = undefined;
        const [enableUnifiedMargin, enableUnifiedAccount] = await this.isUnifiedEnabled();
        const isUnifiedAccount = (enableUnifiedMargin || enableUnifiedAccount);
        const accountTypeDefault = isUnifiedAccount ? 'eb_convert_uta' : 'eb_convert_spot';
        [accountType, params] = this.handleOptionAndParams(params, 'fetchConvertQuote', 'accountType', accountTypeDefault);
        const request = {
            'quoteTxId': id,
            'accountType': accountType,
        };
        const response = await this.privateGetV5AssetExchangeConvertResultQuery(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "ok",
        //         "result": {
        //             "result": {
        //                 "accountType": "eb_convert_uta",
        //                 "exchangeTxId": "1010020692439483803499737088",
        //                 "userId": "100406395",
        //                 "fromCoin": "USDT",
        //                 "fromCoinType": "crypto",
        //                 "fromAmount": "10",
        //                 "toCoin": "BTC",
        //                 "toCoinType": "crypto",
        //                 "toAmount": "0.00015344889",
        //                 "exchangeStatus": "success",
        //                 "extInfo": {},
        //                 "convertRate": "0.000015344889",
        //                 "createdAt": "1727257904726"
        //             }
        //         },
        //         "retExtInfo": {},
        //         "time": 1727258257216
        //     }
        //
        const data = this.safeDict(response, 'result', {});
        const result = this.safeDict(data, 'result', {});
        const fromCurrencyId = this.safeString(result, 'fromCoin');
        const toCurrencyId = this.safeString(result, 'toCoin');
        let fromCurrency = undefined;
        let toCurrency = undefined;
        if (fromCurrencyId !== undefined) {
            fromCurrency = this.currency(fromCurrencyId);
        }
        if (toCurrencyId !== undefined) {
            toCurrency = this.currency(toCurrencyId);
        }
        return this.parseConversion(result, fromCurrency, toCurrency);
    }
    /**
     * @method
     * @name bybit#fetchConvertTradeHistory
     * @description fetch the users history of conversion trades
     * @see https://bybit-exchange.github.io/docs/v5/asset/convert/get-convert-history
     * @param {string} [code] the unified currency code
     * @param {int} [since] the earliest time in ms to fetch conversions for
     * @param {int} [limit] the maximum number of conversion structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountType] eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract
     * @returns {object[]} a list of [conversion structures]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    async fetchConvertTradeHistory(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV5AssetExchangeQueryConvertHistory(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "ok",
        //         "result": {
        //             "list": [
        //                 {
        //                     "accountType": "eb_convert_uta",
        //                     "exchangeTxId": "1010020692439483803499737088",
        //                     "userId": "100406395",
        //                     "fromCoin": "USDT",
        //                     "fromCoinType": "crypto",
        //                     "fromAmount": "10",
        //                     "toCoin": "BTC",
        //                     "toCoinType": "crypto",
        //                     "toAmount": "0.00015344889",
        //                     "exchangeStatus": "success",
        //                     "extInfo": {},
        //                     "convertRate": "0.000015344889",
        //                     "createdAt": "1727257904726"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1727258761874
        //     }
        //
        const data = this.safeDict(response, 'result', {});
        const dataList = this.safeList(data, 'list', []);
        return this.parseConversions(dataList, code, 'fromCoin', 'toCoin', since, limit);
    }
    parseConversion(conversion, fromCurrency = undefined, toCurrency = undefined) {
        //
        // fetchConvertQuote
        //
        //     {
        //         "quoteTxId": "1010020692439481682687668224",
        //         "exchangeRate": "0.000015330836780000",
        //         "fromCoin": "USDT",
        //         "fromCoinType": "crypto",
        //         "toCoin": "BTC",
        //         "toCoinType": "crypto",
        //         "fromAmount": "10",
        //         "toAmount": "0.000153308367800000",
        //         "expiredTime": "1727257413353",
        //         "requestId": ""
        //     }
        //
        // createConvertTrade
        //
        //     {
        //         "exchangeStatus": "processing",
        //         "quoteTxId": "1010020692439483803499737088"
        //     }
        //
        // fetchConvertTrade, fetchConvertTradeHistory
        //
        //     {
        //         "accountType": "eb_convert_uta",
        //         "exchangeTxId": "1010020692439483803499737088",
        //         "userId": "100406395",
        //         "fromCoin": "USDT",
        //         "fromCoinType": "crypto",
        //         "fromAmount": "10",
        //         "toCoin": "BTC",
        //         "toCoinType": "crypto",
        //         "toAmount": "0.00015344889",
        //         "exchangeStatus": "success",
        //         "extInfo": {},
        //         "convertRate": "0.000015344889",
        //         "createdAt": "1727257904726"
        //     }
        //
        const timestamp = this.safeInteger2(conversion, 'expiredTime', 'createdAt');
        const fromCoin = this.safeString(conversion, 'fromCoin');
        const fromCode = this.safeCurrencyCode(fromCoin, fromCurrency);
        const to = this.safeString(conversion, 'toCoin');
        const toCode = this.safeCurrencyCode(to, toCurrency);
        return {
            'info': conversion,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': this.safeString2(conversion, 'quoteTxId', 'exchangeTxId'),
            'fromCurrency': fromCode,
            'fromAmount': this.safeNumber(conversion, 'fromAmount'),
            'toCurrency': toCode,
            'toAmount': this.safeNumber(conversion, 'toAmount'),
            'price': undefined,
            'fee': undefined,
        };
    }
    /**
     * @method
     * @name bybit#fetchLongShortRatioHistory
     * @description fetches the long short ratio history for a unified market symbol
     * @see https://bybit-exchange.github.io/docs/v5/market/long-short-ratio
     * @param {string} symbol unified symbol of the market to fetch the long short ratio for
     * @param {string} [timeframe] the period for the ratio, default is 24 hours
     * @param {int} [since] the earliest time in ms to fetch ratios for
     * @param {int} [limit] the maximum number of long short ratio structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of [long short ratio structures]{@link https://docs.ccxt.com/#/?id=long-short-ratio-structure}
     */
    async fetchLongShortRatioHistory(symbol = undefined, timeframe = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let type = undefined;
        [type, params] = this.getBybitType('fetchLongShortRatioHistory', market, params);
        if (type === 'spot' || type === 'option') {
            throw new errors.NotSupported(this.id + ' fetchLongShortRatioHistory() only support linear and inverse markets');
        }
        if (timeframe === undefined) {
            timeframe = '1d';
        }
        const request = {
            'symbol': market['id'],
            'period': timeframe,
            'category': type,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV5MarketAccountRatio(this.extend(request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "buyRatio": "0.5707",
        //                     "sellRatio": "0.4293",
        //                     "timestamp": "1729123200000"
        //                 },
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1729147842516
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        const data = this.safeList(result, 'list', []);
        return this.parseLongShortRatioHistory(data, market);
    }
    parseLongShortRatio(info, market = undefined) {
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "buyRatio": "0.5707",
        //         "sellRatio": "0.4293",
        //         "timestamp": "1729123200000"
        //     }
        //
        const marketId = this.safeString(info, 'symbol');
        const timestamp = this.safeIntegerOmitZero(info, 'timestamp');
        const longString = this.safeString(info, 'buyRatio');
        const shortString = this.safeString(info, 'sellRatio');
        return {
            'info': info,
            'symbol': this.safeSymbol(marketId, market, undefined, 'contract'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'timeframe': undefined,
            'longShortRatio': this.parseToNumeric(Precise["default"].stringDiv(longString, shortString)),
        };
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname(this.urls['api'][api]) + '/' + path;
        if (api === 'public') {
            if (Object.keys(params).length) {
                url += '?' + this.rawencode(params);
            }
        }
        else if (api === 'private') {
            this.checkRequiredCredentials();
            const isOpenapi = url.indexOf('openapi') >= 0;
            const isV3UnifiedMargin = url.indexOf('unified/v3') >= 0;
            const isV3Contract = url.indexOf('contract/v3') >= 0;
            const isV5UnifiedAccount = url.indexOf('v5') >= 0;
            const timestamp = this.nonce().toString();
            if (isOpenapi) {
                if (Object.keys(params).length) {
                    body = this.json(params);
                }
                else {
                    // this fix for PHP is required otherwise it generates
                    // '[]' on empty arrays even when forced to use objects
                    body = '{}';
                }
                const payload = timestamp + this.apiKey + body;
                const signature = this.hmac(this.encode(payload), this.encode(this.secret), sha256.sha256, 'hex');
                headers = {
                    'Content-Type': 'application/json',
                    'X-BAPI-API-KEY': this.apiKey,
                    'X-BAPI-TIMESTAMP': timestamp,
                    'X-BAPI-SIGN': signature,
                };
            }
            else if (isV3UnifiedMargin || isV3Contract || isV5UnifiedAccount) {
                headers = {
                    'Content-Type': 'application/json',
                    'X-BAPI-API-KEY': this.apiKey,
                    'X-BAPI-TIMESTAMP': timestamp,
                    'X-BAPI-RECV-WINDOW': this.options['recvWindow'].toString(),
                };
                if (isV3UnifiedMargin || isV3Contract) {
                    headers['X-BAPI-SIGN-TYPE'] = '2';
                }
                const query = this.extend({}, params);
                const queryEncoded = this.rawencode(query);
                const auth_base = timestamp.toString() + this.apiKey + this.options['recvWindow'].toString();
                let authFull = undefined;
                if (method === 'POST') {
                    body = this.json(query);
                    authFull = auth_base + body;
                }
                else {
                    authFull = auth_base + queryEncoded;
                    url += '?' + this.rawencode(query);
                }
                let signature = undefined;
                if (this.secret.indexOf('PRIVATE KEY') > -1) {
                    signature = rsa.rsa(authFull, this.secret, sha256.sha256);
                }
                else {
                    signature = this.hmac(this.encode(authFull), this.encode(this.secret), sha256.sha256);
                }
                headers['X-BAPI-SIGN'] = signature;
            }
            else {
                const query = this.extend(params, {
                    'api_key': this.apiKey,
                    'recv_window': this.options['recvWindow'],
                    'timestamp': timestamp,
                });
                const sortedQuery = this.keysort(query);
                const auth = this.rawencode(sortedQuery);
                let signature = undefined;
                if (this.secret.indexOf('PRIVATE KEY') > -1) {
                    signature = rsa.rsa(auth, this.secret, sha256.sha256);
                }
                else {
                    signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
                }
                if (method === 'POST') {
                    const isSpot = url.indexOf('spot') >= 0;
                    const extendedQuery = this.extend(query, {
                        'sign': signature,
                    });
                    if (isSpot) {
                        body = this.urlencode(extendedQuery);
                        headers = {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        };
                    }
                    else {
                        body = this.json(extendedQuery);
                        headers = {
                            'Content-Type': 'application/json',
                        };
                    }
                }
                else {
                    url += '?' + this.rawencode(sortedQuery);
                    url += '&sign=' + signature;
                }
            }
        }
        if (method === 'POST') {
            const brokerId = this.safeString(this.options, 'brokerId');
            if (brokerId !== undefined) {
                headers['Referer'] = brokerId;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     {
        //         "ret_code": 10001,
        //         "ret_msg": "ReadMapCB: expect { or n, but found \u0000, error " +
        //         "found in #0 byte of ...||..., bigger context " +
        //         "...||...",
        //         "ext_code": '',
        //         "ext_info": '',
        //         "result": null,
        //         "time_now": "1583934106.590436"
        //     }
        //
        //     {
        //         "retCode":10001,
        //         "retMsg":"symbol params err",
        //         "result":{"symbol":"","bid":"","bidIv":"","bidSize":"","ask":"","askIv":"","askSize":"","lastPrice":"","openInterest":"","indexPrice":"","markPrice":"","markPriceIv":"","change24h":"","high24h":"","low24h":"","volume24h":"","turnover24h":"","totalVolume":"","totalTurnover":"","fundingRate":"","predictedFundingRate":"","nextFundingTime":"","countdownHour":"0","predictedDeliveryPrice":"","underlyingPrice":"","delta":"","gamma":"","vega":"","theta":""}
        //     }
        //
        const errorCode = this.safeString2(response, 'ret_code', 'retCode');
        if (errorCode !== '0') {
            if (errorCode === '30084') {
                // not an error
                // https://github.com/ccxt/ccxt/issues/11268
                // https://github.com/ccxt/ccxt/pull/11624
                // POST https://api.bybit.com/v2/private/position/switch-isolated 200 OK
                // {"ret_code":30084,"ret_msg":"Isolated not modified","ext_code":"","ext_info":"","result":null,"time_now":"1642005219.937988","rate_limit_status":73,"rate_limit_reset_ms":1642005219894,"rate_limit":75}
                return undefined;
            }
            let feedback = undefined;
            if (errorCode === '10005' && url.indexOf('order') < 0) {
                feedback = this.id + ' private api uses /user/v3/private/query-api to check if you have a unified account. The API key of user id must own one of permissions: "Account Transfer", "Subaccount Transfer", "Withdrawal" ' + body;
            }
            else {
                feedback = this.id + ' ' + body;
            }
            if (body.indexOf('Withdraw address chain or destination tag are not equal')) {
                feedback = feedback + '; You might also need to ensure the address is whitelisted';
            }
            this.throwBroadlyMatchedException(this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
}

module.exports = bybit;
