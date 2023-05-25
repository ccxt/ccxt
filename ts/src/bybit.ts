
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bybit.js';
import { TICK_SIZE } from './base/functions/number.js';
import { AuthenticationError, ExchangeError, ArgumentsRequired, PermissionDenied, InvalidOrder, OrderNotFound, InsufficientFunds, BadRequest, RateLimitExceeded, InvalidNonce, NotSupported, RequestTimeout } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { rsa } from './base/functions/rsa.js';
import { Int, OrderSide } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class bybit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bybit',
            'name': 'Bybit',
            'countries': [ 'VG' ], // British Virgin Islands
            'version': 'v5',
            'userAgent': undefined,
            'rateLimit': 20,
            'hostname': 'bybit.com', // bybit.com, bytick.com
            'pro': true,
            'certified': true,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': undefined,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowInterest': false, // temporarily disabled, as it does not work
                'fetchBorrowRate': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchFundingRate': true, // emulated in exchange
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': true,
                'fetchLedger': true,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': false,
                'fetchTransfers': true,
                'fetchWithdrawals': true,
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
                'logo': 'https://user-images.githubusercontent.com/51840849/76547799-daff5b80-649e-11ea-87fb-3be9bac08954.jpg',
                'api': {
                    'spot': 'https://api.{hostname}',
                    'futures': 'https://api.{hostname}',
                    'v2': 'https://api.{hostname}',
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
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
                        // inverse swap
                        'v2/public/orderBook/L2': 1,
                        'v2/public/kline/list': 3,
                        'v2/public/tickers': 1,
                        'v2/public/trading-records': 1,
                        'v2/public/symbols': 1,
                        'v2/public/mark-price-kline': 3,
                        'v2/public/index-price-kline': 3,
                        'v2/public/premium-index-kline': 2,
                        'v2/public/open-interest': 1,
                        'v2/public/big-deal': 1,
                        'v2/public/account-ratio': 1,
                        'v2/public/funding-rate': 1,
                        'v2/public/elite-ratio': 1,
                        'v2/public/funding/prev-funding-rate': 1,
                        'v2/public/risk-limit/list': 1,
                        // linear swap USDT
                        'public/linear/kline': 3,
                        'public/linear/recent-trading-records': 1,
                        'public/linear/risk-limit': 1,
                        'public/linear/funding/prev-funding-rate': 1,
                        'public/linear/mark-price-kline': 1,
                        'public/linear/index-price-kline': 1,
                        'public/linear/premium-index-kline': 1,
                        // spot
                        'spot/v1/time': 1,
                        'spot/v1/symbols': 1,
                        'spot/quote/v1/depth': 1,
                        'spot/quote/v1/depth/merged': 1,
                        'spot/quote/v1/trades': 1,
                        'spot/quote/v1/kline': 1,
                        'spot/quote/v1/ticker/24hr': 1,
                        'spot/quote/v1/ticker/price': 1,
                        'spot/quote/v1/ticker/book_ticker': 1,
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
                        'v2/public/time': 1,
                        'v3/public/time': 1,
                        'v2/public/announcement': 1,
                        // USDC endpoints
                        // option USDC
                        'option/usdc/openapi/public/v1/order-book': 1,
                        'option/usdc/openapi/public/v1/symbols': 1,
                        'option/usdc/openapi/public/v1/tick': 1,
                        'option/usdc/openapi/public/v1/delivery-price': 1,
                        'option/usdc/openapi/public/v1/query-trade-latest': 1,
                        'option/usdc/openapi/public/v1/query-historical-volatility': 1,
                        'option/usdc/openapi/public/v1/all-tickers': 1,
                        // perpetual swap USDC
                        'perpetual/usdc/openapi/public/v1/order-book': 1,
                        'perpetual/usdc/openapi/public/v1/symbols': 1,
                        'perpetual/usdc/openapi/public/v1/tick': 1,
                        'perpetual/usdc/openapi/public/v1/kline/list': 1,
                        'perpetual/usdc/openapi/public/v1/mark-price-kline': 1,
                        'perpetual/usdc/openapi/public/v1/index-price-kline': 1,
                        'perpetual/usdc/openapi/public/v1/premium-index-kline': 1,
                        'perpetual/usdc/openapi/public/v1/open-interest': 1,
                        'perpetual/usdc/openapi/public/v1/big-deal': 1,
                        'perpetual/usdc/openapi/public/v1/account-ratio': 1,
                        'perpetual/usdc/openapi/public/v1/prev-funding-rate': 1,
                        'perpetual/usdc/openapi/public/v1/risk-limit/list': 1,
                        // account
                        'asset/v1/public/deposit/allowed-deposit-list': 1,
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
                        'v5/market/kline': 1,
                        'v5/market/mark-price-kline': 1,
                        'v5/market/index-price-kline': 1,
                        'v5/market/premium-index-price-kline': 1,
                        'v5/market/instruments-info': 1,
                        'v5/market/orderbook': 1,
                        'v5/market/tickers': 1,
                        'v5/market/funding/history': 1,
                        'v5/market/recent-trade': 1,
                        'v5/market/open-interest': 1,
                        'v5/market/historical-volatility': 1,
                        'v5/market/insurance': 1,
                        'v5/market/risk-limit': 1,
                        'v5/market/delivery-price': 1,
                        'v5/spot-lever-token/info': 1,
                        'v5/spot-lever-token/reference': 1,
                        'v5/announcements/index': 1,
                        'v5/spot-cross-margin-trade/pledge-token': 1,
                        'v5/spot-cross-margin-trade/borrow-token': 1,
                        'v5/ins-loan/ensure-tokens-convert': 1,
                    },
                },
                'private': {
                    'get': {
                        // inverse swap
                        'v2/private/order/list': 5,
                        'v2/private/order': 5,
                        'v2/private/stop-order/list': 5,
                        'v2/private/stop-order': 1,
                        'v2/private/position/list': 25,
                        'v2/private/position/fee-rate': 40,
                        'v2/private/execution/list': 25,
                        'v2/private/trade/closed-pnl/list': 1,
                        'v2/public/risk-limit/list': 1, // TODO check
                        'v2/public/funding/prev-funding-rate': 25, // TODO check
                        'v2/private/funding/prev-funding': 25,
                        'v2/private/funding/predicted-funding': 25,
                        'v2/private/account/api-key': 5,
                        'v2/private/account/lcp': 1,
                        'v2/private/wallet/balance': 25, // 120 per minute = 2 per second => cost = 50 / 2 = 25
                        'v2/private/wallet/fund/records': 25,
                        'v2/private/wallet/withdraw/list': 25,
                        'v2/private/exchange-order/list': 1,
                        // linear swap USDT
                        'private/linear/order/list': 5, // 600 per minute = 10 per second => cost = 50 / 10 =  5
                        'private/linear/order/search': 5,
                        'private/linear/stop-order/list': 5,
                        'private/linear/stop-order/search': 5,
                        'private/linear/position/list': 25,
                        'private/linear/trade/execution/list': 25,
                        'private/linear/trade/closed-pnl/list': 25,
                        'public/linear/risk-limit': 1,
                        'private/linear/funding/predicted-funding': 25,
                        'private/linear/funding/prev-funding': 25,
                        // inverse futures
                        'futures/private/order/list': 5,
                        'futures/private/order': 5,
                        'futures/private/stop-order/list': 5,
                        'futures/private/stop-order': 5,
                        'futures/private/position/list': 25,
                        'futures/private/execution/list': 25,
                        'futures/private/trade/closed-pnl/list': 1,
                        // spot
                        'spot/v1/account': 2.5,
                        'spot/v1/order': 2.5,
                        'spot/v1/open-orders': 2.5,
                        'spot/v1/history-orders': 2.5,
                        'spot/v1/myTrades': 2.5,
                        'spot/v1/cross-margin/order': 10,
                        'spot/v1/cross-margin/accounts/balance': 10,
                        'spot/v1/cross-margin/loan-info': 10,
                        'spot/v1/cross-margin/repay/history': 10,
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
                        'asset/v1/private/transfer/list': 50, // 60 per minute = 1 per second => cost = 50 / 1 = 50
                        'asset/v3/private/transfer/inter-transfer/list/query': 0.84, // 60/s
                        'asset/v1/private/sub-member/transfer/list': 50,
                        'asset/v3/private/transfer/sub-member/list/query': 0.84, // 60/s
                        'asset/v3/private/transfer/sub-member-transfer/list/query': 0.84, // 60/s
                        'asset/v3/private/transfer/universal-transfer/list/query': 0.84, // 60/s
                        'asset/v1/private/sub-member/member-ids': 50,
                        'asset/v1/private/deposit/record/query': 50,
                        'asset/v1/private/withdraw/record/query': 25,
                        'asset/v1/private/coin-info/query': 25,
                        'asset/v3/private/coin-info/query': 25, // 2/s
                        'asset/v1/private/asset-info/query': 50,
                        'asset/v1/private/deposit/address': 100,
                        'asset/v3/private/deposit/address/query': 0.17, // 300/s
                        'asset/v1/private/universal/transfer/list': 50,
                        'contract/v3/private/copytrading/order/list': 1,
                        'contract/v3/private/copytrading/position/list': 1,
                        'contract/v3/private/copytrading/wallet/balance': 1,
                        'contract/v3/private/position/limit-info': 25, // 120 per minute = 2 per second => cost = 50 / 2 = 25
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
                        'asset/v2/private/exchange/exchange-order-all': 1,
                        'unified/v3/private/account/borrow-history': 1,
                        'unified/v3/private/account/borrow-rate': 1,
                        'unified/v3/private/account/info': 1,
                        'user/v3/private/frozen-sub-member': 10, // 5/s
                        'user/v3/private/query-sub-members': 5, // 10/s
                        'user/v3/private/query-api': 5, // 10/s
                        'asset/v3/private/transfer/transfer-coin/list/query': 0.84, // 60/s
                        'asset/v3/private/transfer/account-coin/balance/query': 0.84, // 60/s
                        'asset/v3/private/transfer/account-coins/balance/query': 50,
                        'asset/v3/private/transfer/asset-info/query': 0.84, // 60/s
                        'asset/v3/public/deposit/allowed-deposit-list/query': 0.17, // 300/s
                        'asset/v3/private/deposit/record/query': 0.17, // 300/s
                        'asset/v3/private/withdraw/record/query': 0.17, // 300/s
                        // v5
                        'v5/order/history': 2.5,
                        'v5/order/spot-borrow-check': 2.5,
                        'v5/order/realtime': 2.5,
                        'v5/position/list': 2.5,
                        'v5/position/switch-mode': 2.5,
                        'v5/execution/list': 2.5,
                        'v5/position/closed-pnl': 2.5,
                        'v5/account/wallet-balance': 2.5,
                        'v5/account/borrow-history': 2.5,
                        'v5/account/collateral-info': 2.5,
                        'v5/account/mmp-state': 2.5,
                        'v5/asset/coin-greeks': 2.5,
                        'v5/account/info': 2.5,
                        'v5/account/transaction-log': 2.5,
                        'v5/account/fee-rate': 1,
                        'v5/asset/exchange/order-record': 2.5,
                        'v5/asset/delivery-record': 2.5,
                        'v5/asset/settlement-record': 2.5,
                        'v5/asset/transfer/query-asset-info': 2.5,
                        'v5/asset/transfer/query-account-coin-balance': 2.5,
                        'v5/asset/transfer/query-transfer-coin-list': 2.5,
                        'v5/asset/transfer/query-inter-transfer-list': 2.5,
                        'v5/asset/transfer/query-sub-member-list': 2.5,
                        'v5/asset/transfer/query-universal-transfer-list': 1,
                        'v5/asset/deposit/query-allowed-list': 2.5,
                        'v5/asset/deposit/query-record': 2.5,
                        'v5/asset/deposit/query-sub-member-record': 2.5,
                        'v5/asset/deposit/query-address': 2.5,
                        'v5/asset/deposit/query-sub-member-address': 2.5,
                        'v5/asset/deposit/query-internal-record': 2.5,
                        'v5/asset/coin/query-info': 2.5,
                        'v5/asset/withdraw/query-record': 2.5,
                        'v5/asset/withdraw/withdrawable-amount': 2.5,
                        'v5/asset/transfer/query-account-coins-balance': 2.5,
                        // user
                        'v5/user/query-sub-members': 10,
                        'v5/user/query-api': 10,
                        'v5/spot-cross-margin-trade/loan-info': 1, // 50/s => cost = 50 / 50 = 1
                        'v5/spot-cross-margin-trade/account': 1, // 50/s => cost = 50 / 50 = 1
                        'v5/spot-cross-margin-trade/orders': 1, // 50/s => cost = 50 / 50 = 1
                        'v5/spot-cross-margin-trade/repay-history': 1, // 50/s => cost = 50 / 50 = 1
                        'v5/ins-loan/ltv-convert': 1,
                    },
                    'post': {
                        // inverse swap
                        'v2/private/order/create': 30,
                        'v2/private/order/cancel': 30,
                        'v2/private/order/cancelAll': 300, // 100 per minute + 'consumes 10 requests'
                        'v2/private/order/replace': 30,
                        'v2/private/stop-order/create': 30,
                        'v2/private/stop-order/cancel': 30,
                        'v2/private/stop-order/cancelAll': 300,
                        'v2/private/stop-order/replace': 30,
                        'v2/private/position/change-position-margin': 40,
                        'v2/private/position/trading-stop': 40,
                        'v2/private/position/leverage/save': 40,
                        'v2/private/tpsl/switch-mode': 40,
                        'v2/private/position/switch-isolated': 2.5,
                        'v2/private/position/risk-limit': 2.5,
                        'v2/private/position/switch-mode': 2.5,
                        // linear swap USDT
                        'private/linear/order/create': 30, // 100 per minute = 1.666 per second => cost = 50 / 1.6666 = 30
                        'private/linear/order/cancel': 30,
                        'private/linear/order/cancel-all': 300, // 100 per minute + 'consumes 10 requests'
                        'private/linear/order/replace': 30,
                        'private/linear/stop-order/create': 30,
                        'private/linear/stop-order/cancel': 30,
                        'private/linear/stop-order/cancel-all': 300,
                        'private/linear/stop-order/replace': 30,
                        'private/linear/position/set-auto-add-margin': 40,
                        'private/linear/position/switch-isolated': 40,
                        'private/linear/position/switch-mode': 40,
                        'private/linear/tpsl/switch-mode': 2.5,
                        'private/linear/position/add-margin': 40,
                        'private/linear/position/set-leverage': 40, // 75 per minute = 1.25 per second => cost = 50 / 1.25 = 40
                        'private/linear/position/trading-stop': 40,
                        'private/linear/position/set-risk': 2.5,
                        // inverse futures
                        'futures/private/order/create': 30,
                        'futures/private/order/cancel': 30,
                        'futures/private/order/cancelAll': 30,
                        'futures/private/order/replace': 30,
                        'futures/private/stop-order/create': 30,
                        'futures/private/stop-order/cancel': 30,
                        'futures/private/stop-order/cancelAll': 30,
                        'futures/private/stop-order/replace': 30,
                        'futures/private/position/change-position-margin': 40,
                        'futures/private/position/trading-stop': 40,
                        'futures/private/position/leverage/save': 40,
                        'futures/private/position/switch-mode': 40,
                        'futures/private/tpsl/switch-mode': 40,
                        'futures/private/position/switch-isolated': 40,
                        'futures/private/position/risk-limit': 2.5,
                        // spot
                        'spot/v1/order': 2.5,
                        'spot/v1/cross-margin/loan': 10,
                        'spot/v1/cross-margin/repay': 10,
                        'spot/v3/private/order': 2.5,
                        'spot/v3/private/cancel-order': 2.5,
                        'spot/v3/private/cancel-orders': 2.5,
                        'spot/v3/private/cancel-orders-by-ids': 2.5,
                        'spot/v3/private/purchase': 2.5,
                        'spot/v3/private/redeem': 2.5,
                        'spot/v3/private/cross-margin-loan': 10,
                        'spot/v3/private/cross-margin-repay': 10,
                        // account
                        'asset/v1/private/transfer': 150, // 20 per minute = 0.333 per second => cost = 50 / 0.3333 = 150
                        'asset/v3/private/transfer/inter-transfer': 2.5, // 20/s
                        'asset/v1/private/sub-member/transfer': 150,
                        'asset/v1/private/withdraw': 50,
                        'asset/v3/private/withdraw/create': 1, // 10/s
                        'asset/v1/private/withdraw/cancel': 50,
                        'asset/v3/private/withdraw/cancel': 0.84, // 60/s
                        'asset/v1/private/transferable-subs/save': 3000,
                        'asset/v1/private/universal/transfer': 1500,
                        'asset/v3/private/transfer/sub-member-transfer': 2.5, // 20/s
                        'asset/v3/private/transfer/transfer-sub-member-save': 2.5, // 20/s
                        'asset/v3/private/transfer/universal-transfer': 2.5, // 20/s
                        'user/v3/private/create-sub-member': 10, // 5/s
                        'user/v3/private/create-sub-api': 10, // 5/s
                        'user/v3/private/update-api': 10, // 5/s
                        'user/v3/private/delete-api': 10, // 5/s
                        'user/v3/private/update-sub-api': 10, // 5/s
                        'user/v3/private/delete-sub-api': 10, // 5/s
                        // USDC endpoints
                        // option USDC
                        'option/usdc/openapi/private/v1/place-order': 2.5,
                        'option/usdc/openapi/private/v1/batch-place-order': 2.5,
                        'option/usdc/openapi/private/v1/replace-order': 2.5,
                        'option/usdc/openapi/private/v1/batch-replace-orders': 2.5,
                        'option/usdc/openapi/private/v1/cancel-order': 2.5,
                        'option/usdc/openapi/private/v1/batch-cancel-orders': 2.5,
                        'option/usdc/openapi/private/v1/cancel-all': 2.5,
                        'option/usdc/openapi/private/v1/query-active-orders': 2.5,
                        'option/usdc/openapi/private/v1/query-order-history': 2.5,
                        'option/usdc/openapi/private/v1/execution-list': 2.5,
                        'option/usdc/openapi/private/v1/query-transaction-log': 2.5,
                        'option/usdc/openapi/private/v1/query-wallet-balance': 2.5,
                        'option/usdc/openapi/private/v1/query-asset-info': 2.5,
                        'option/usdc/openapi/private/v1/query-margin-info': 2.5,
                        'option/usdc/openapi/private/v1/query-position': 2.5,
                        'option/usdc/openapi/private/v1/query-delivery-list': 2.5,
                        'option/usdc/openapi/private/v1/query-position-exp-date': 2.5,
                        'option/usdc/openapi/private/v1/mmp-modify': 2.5,
                        'option/usdc/openapi/private/v1/mmp-reset': 2.5,
                        // perpetual swap USDC
                        'perpetual/usdc/openapi/private/v1/place-order': 2.5,
                        'perpetual/usdc/openapi/private/v1/replace-order': 2.5,
                        'perpetual/usdc/openapi/private/v1/cancel-order': 2.5,
                        'perpetual/usdc/openapi/private/v1/cancel-all': 2.5,
                        'perpetual/usdc/openapi/private/v1/position/leverage/save': 2.5,
                        'option/usdc/openapi/private/v1/session-settlement': 2.5,
                        'option/usdc/private/asset/account/setMarginMode': 2.5,
                        'perpetual/usdc/openapi/public/v1/risk-limit/list': 2.5,
                        'perpetual/usdc/openapi/private/v1/position/set-risk-limit': 2.5,
                        'perpetual/usdc/openapi/private/v1/predicted-funding': 2.5,
                        'contract/v3/private/copytrading/order/create': 2.5,
                        'contract/v3/private/copytrading/order/cancel': 2.5,
                        'contract/v3/private/copytrading/order/close': 2.5,
                        'contract/v3/private/copytrading/position/close': 2.5,
                        'contract/v3/private/copytrading/position/set-leverage': 2.5,
                        'contract/v3/private/copytrading/wallet/transfer': 2.5,
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
                        'unified/v3/private/order/create': 2.5,
                        'unified/v3/private/order/replace': 2.5,
                        'unified/v3/private/order/cancel': 2.5,
                        'unified/v3/private/order/create-batch': 2.5,
                        'unified/v3/private/order/replace-batch': 2.5,
                        'unified/v3/private/order/cancel-batch': 2.5,
                        'unified/v3/private/order/cancel-all': 2.5,
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
                        'v5/order/create': 2.5,
                        'v5/order/amend': 2.5,
                        'v5/order/cancel': 2.5,
                        'v5/order/cancel-all': 2.5,
                        'v5/order/create-batch': 2.5,
                        'v5/order/amend-batch': 2.5,
                        'v5/order/cancel-batch': 2.5,
                        'v5/order/disconnected-cancel-all': 2.5,
                        'v5/position/set-leverage': 2.5,
                        'v5/position/set-tpsl-mode': 2.5,
                        'v5/position/set-risk-limit': 2.5,
                        'v5/position/trading-stop': 2.5,
                        'v5/position/switch-isolated': 2.5,
                        'v5/position/switch-mode': 2.5,
                        'v5/position/set-auto-add-margin': 2.5,
                        'v5/account/upgrade-to-uta': 2.5,
                        'v5/account/set-margin-mode': 2.5,
                        'v5/asset/transfer/inter-transfer': 2.5,
                        'v5/asset/transfer/save-transfer-sub-member': 2.5,
                        'v5/asset/transfer/universal-transfer': 2.5,
                        'v5/asset/deposit/deposit-to-account': 2.5,
                        'v5/asset/withdraw/create': 2.5,
                        'v5/asset/withdraw/cancel': 2.5,
                        'v5/spot-lever-token/purchase': 2.5,
                        'v5/spot-lever-token/redeem': 2.5,
                        'v5/spot-lever-token/order-record': 2.5,
                        'v5/spot-margin-trade/switch-mode': 2.5,
                        'v5/spot-margin-trade/set-leverage': 2.5,
                        // user
                        'v5/user/create-sub-member': 10,
                        'v5/user/create-sub-api': 10,
                        'v5/user/frozen-sub-member': 10,
                        'v5/user/update-api': 10,
                        'v5/user/update-sub-api': 10,
                        'v5/user/delete-api': 10,
                        'v5/user/delete-sub-api': 10,
                        'v5/spot-cross-margin-trade/loan': 2.5, // 20/s => cost = 50 / 20 = 2.5
                        'v5/spot-cross-margin-trade/repay': 2.5, // 20/s => cost = 50 / 20 = 2.5
                        'v5/spot-cross-margin-trade/switch': 2.5, // 20/s => cost = 50 / 20 = 2.5
                    },
                    'delete': {
                        // spot
                        'spot/v1/order': 2.5,
                        'spot/v1/order/fast': 2.5,
                        'spot/order/batch-cancel': 2.5,
                        'spot/order/batch-fast-cancel': 2.5,
                        'spot/order/batch-cancel-by-ids': 2.5,
                    },
                },
            },
            'httpExceptions': {
                '403': RateLimitExceeded, // Forbidden -- You request too many times
            },
            'exceptions': {
                // Uncodumented explanation of error strings:
                // - oc_diff: order cost needed to place this order
                // - new_oc: total order cost of open orders including the order you are trying to open
                // - ob: order balance - the total cost of current open orders
                // - ab: available balance
                'exact': {
                    '-10009': BadRequest, // {"ret_code":-10009,"ret_msg":"Invalid period!","result":null,"token":null}
                    '-1004': BadRequest, // {"ret_code":-1004,"ret_msg":"Missing required parameter \u0027symbol\u0027","ext_code":null,"ext_info":null,"result":null}
                    '-1021': BadRequest, // {"ret_code":-1021,"ret_msg":"Timestamp for this request is outside of the recvWindow.","ext_code":null,"ext_info":null,"result":null}
                    '-1103': BadRequest, // An unknown parameter was sent.
                    '-1140': InvalidOrder, // {"ret_code":-1140,"ret_msg":"Transaction amount lower than the minimum.","result":{},"ext_code":"","ext_info":null,"time_now":"1659204910.248576"}
                    '-1197': InvalidOrder, // {"ret_code":-1197,"ret_msg":"Your order quantity to buy is too large. The filled price may deviate significantly from the market price. Please try again","result":{},"ext_code":"","ext_info":null,"time_now":"1659204531.979680"}
                    '-2013': InvalidOrder, // {"ret_code":-2013,"ret_msg":"Order does not exist.","ext_code":null,"ext_info":null,"result":null}
                    '-2015': AuthenticationError, // Invalid API-key, IP, or permissions for action.
                    '-6017': BadRequest, // Repayment amount has exceeded the total liability
                    '-6025': BadRequest, // Amount to borrow cannot be lower than the min. amount to borrow (per transaction)
                    '-6029': BadRequest, // Amount to borrow has exceeded the user's estimated max amount to borrow
                    '5004': ExchangeError, // {"retCode":5004,"retMsg":"Server Timeout","result":null,"retExtInfo":{},"time":1667577060106}
                    '7001': BadRequest, // {"retCode":7001,"retMsg":"request params type error"}
                    '10001': BadRequest, // parameter error
                    '10002': InvalidNonce, // request expired, check your timestamp and recv_window
                    '10003': AuthenticationError, // Invalid apikey
                    '10004': AuthenticationError, // invalid sign
                    '10005': PermissionDenied, // permission denied for current apikey
                    '10006': RateLimitExceeded, // too many requests
                    '10007': AuthenticationError, // api_key not found in your request parameters
                    '10008': AuthenticationError, // User had been banned
                    '10009': AuthenticationError, // IP had been banned
                    '10010': PermissionDenied, // request ip mismatch
                    '10014': BadRequest, // Request is duplicate
                    '10016': ExchangeError, // {"retCode":10016,"retMsg":"System error. Please try again later."}
                    '10017': BadRequest, // request path not found or request method is invalid
                    '10018': RateLimitExceeded, // exceed ip rate limit
                    '10020': PermissionDenied, // {"retCode":10020,"retMsg":"your account is not a unified margin account, please update your account","result":null,"retExtInfo":null,"time":1664783731123}
                    '10024': PermissionDenied, // Compliance rules triggered
                    '10027': PermissionDenied, // Trading Banned
                    '10028': PermissionDenied, // The API can only be accessed by unified account users.
                    '10029': PermissionDenied, // The requested symbol is invalid, please check symbol whitelist
                    '12201': BadRequest, // {"retCode":12201,"retMsg":"Invalid orderCategory parameter.","result":{},"retExtInfo":null,"time":1666699391220}
                    '100028': PermissionDenied, // The API cannot be accessed by unified account users.
                    '110001': InvalidOrder, // Order does not exist
                    '110003': InvalidOrder, // Order price is out of permissible range
                    '110004': InsufficientFunds, // Insufficient wallet balance
                    '110005': InvalidOrder, // position status
                    '110006': InsufficientFunds, // cannot afford estimated position_margin
                    '110007': InsufficientFunds, // {"retCode":110007,"retMsg":"ab not enough for new order","result":{},"retExtInfo":{},"time":1668838414793}
                    '110008': InvalidOrder, // Order has been finished or canceled
                    '110009': InvalidOrder, // The number of stop orders exceeds maximum limit allowed
                    '110010': InvalidOrder, // Order already cancelled
                    '110011': InvalidOrder, // Any adjustments made will trigger immediate liquidation
                    '110012': InsufficientFunds, // Available balance not enough
                    '110013': BadRequest, // Due to risk limit, cannot set leverage
                    '110014': InsufficientFunds, // Available balance not enough to add margin
                    '110015': BadRequest, // the position is in cross_margin
                    '110016': InvalidOrder, // Requested quantity of contracts exceeds risk limit, please adjust your risk limit level before trying again
                    '110017': InvalidOrder, // Reduce-only rule not satisfied
                    '110018': BadRequest, // userId illegal
                    '110019': InvalidOrder, // orderId illegal
                    '110020': InvalidOrder, // number of active orders greater than 500
                    '110021': InvalidOrder, // Open Interest exceeded
                    '110022': InvalidOrder, // qty has been limited, cannot modify the order to add qty
                    '110023': InvalidOrder, // This contract only supports position reduction operation, please contact customer service for details
                    '110024': InvalidOrder, // You have an existing position, so position mode cannot be switched
                    '110025': InvalidOrder, // Position mode is not modified
                    '110026': InvalidOrder, // Cross/isolated margin mode is not modified
                    '110027': InvalidOrder, // Margin is not modified
                    '110028': InvalidOrder, // Open orders exist, so you cannot change position mode
                    '110029': InvalidOrder, // Hedge mode is not available for this symbol
                    '110030': InvalidOrder, // Duplicate orderId
                    '110031': InvalidOrder, // risk limit info does not exists
                    '110032': InvalidOrder, // Illegal order
                    '110033': InvalidOrder, // Margin cannot be set without open position
                    '110034': InvalidOrder, // There is no net position
                    '110035': InvalidOrder, // Cancel order is not completed before liquidation
                    '110036': InvalidOrder, // Cross margin mode is not allowed to change leverage
                    '110037': InvalidOrder, // User setting list does not have this symbol
                    '110038': InvalidOrder, // Portfolio margin mode is not allowed to change leverage
                    '110039': InvalidOrder, // Maintain margin rate is too high, which may trigger liquidation
                    '110040': InvalidOrder, // Order will trigger forced liquidation, please resubmit the order
                    '110041': InvalidOrder, // Skip liquidation is not allowed when a position or maker order exists
                    '110042': InvalidOrder, // Pre-delivery status can only reduce positions
                    '110043': BadRequest, // Set leverage not modified
                    '110044': InsufficientFunds, // Insufficient available margin
                    '110045': InsufficientFunds, // Insufficient wallet balance
                    '110046': BadRequest, // Any adjustments made will trigger immediate liquidation
                    '110047': BadRequest, // Risk limit cannot be adjusted due to insufficient available margin
                    '110048': BadRequest, // Risk limit cannot be adjusted as the current/expected position value held exceeds the revised risk limit
                    '110049': BadRequest, // Tick notes can only be numbers
                    '110050': BadRequest, // Coin is not in the range of selected
                    '110051': InsufficientFunds, // The user's available balance cannot cover the lowest price of the current market
                    '110052': InsufficientFunds, // User's available balance is insufficient to set a price
                    '110053': InsufficientFunds, // The user's available balance cannot cover the current market price and upper limit price
                    '110054': InvalidOrder, // This position has at least one take profit link order, so the take profit and stop loss mode cannot be switched
                    '110055': InvalidOrder, // This position has at least one stop loss link order, so the take profit and stop loss mode cannot be switched
                    '110056': InvalidOrder, // This position has at least one trailing stop link order, so the take profit and stop loss mode cannot be switched
                    '110057': InvalidOrder, // Conditional order or limit order contains TP/SL related params
                    '110058': InvalidOrder, // Insufficient number of remaining position size to set take profit and stop loss
                    '110059': InvalidOrder, // In the case of partial filled of the open order, it is not allowed to modify the take profit and stop loss settings of the open order
                    '110060': BadRequest, // Under full TP/SL mode, it is not allowed to modify TP/SL
                    '110061': BadRequest, // Under partial TP/SL mode, TP/SL set more than 20
                    '110062': BadRequest, // Institution MMP profile not found.
                    '110063': ExchangeError, // Settlement in progress! xxx not available for trades.
                    '110064': InvalidOrder, // The number of contracts modified cannot be less than or equal to the filled quantity
                    '110065': PermissionDenied, // MMP hasn't yet been enabled for your account. Please contact your BD manager.
                    '110066': ExchangeError, // No trading is allowed at the current time
                    '110067': PermissionDenied, // unified account is not support
                    '110068': PermissionDenied, // Leveraged user trading is not allowed
                    '110069': PermissionDenied, // Do not allow OTC lending users to trade
                    '110070': InvalidOrder, // ETP symbols are not allowed to be traded
                    '110071': ExchangeError, // Sorry, we're revamping the Unified Margin Account! Currently, new upgrades are not supported. If you have any questions, please contact our 24/7 customer support.
                    '110072': InvalidOrder, // OrderLinkedID is duplicate
                    '110073': ExchangeError, // Set margin mode failed
                    '130006': InvalidOrder, // {"ret_code":130006,"ret_msg":"The number of contracts exceeds maximum limit allowed: too large","ext_code":"","ext_info":"","result":null,"time_now":"1658397095.099030","rate_limit_status":99,"rate_limit_reset_ms":1658397095097,"rate_limit":100}
                    '130021': InsufficientFunds, // {"ret_code":130021,"ret_msg":"orderfix price failed for CannotAffordOrderCost.","ext_code":"","ext_info":"","result":null,"time_now":"1644588250.204878","rate_limit_status":98,"rate_limit_reset_ms":1644588250200,"rate_limit":100} |  {"ret_code":130021,"ret_msg":"oc_diff[1707966351], new_oc[1707966351] with ob[....]+AB[....]","ext_code":"","ext_info":"","result":null,"time_now":"1658395300.872766","rate_limit_status":99,"rate_limit_reset_ms":1658395300855,"rate_limit":100} caused issues/9149#issuecomment-1146559498
                    '130074': InvalidOrder, // {"ret_code":130074,"ret_msg":"expect Rising, but trigger_price[190000000] \u003c= current[211280000]??LastPrice","ext_code":"","ext_info":"","result":null,"time_now":"1655386638.067076","rate_limit_status":97,"rate_limit_reset_ms":1655386638065,"rate_limit":100}
                    '131001': InsufficientFunds, // {"retCode":131001,"retMsg":"the available balance is not sufficient to cover the handling fee","result":{},"retExtInfo":{},"time":1666892821245}
                    '131084': ExchangeError, // Withdraw failed because of Uta Upgrading
                    '131200': ExchangeError, // Service error
                    '131201': ExchangeError, // Internal error
                    '131202': BadRequest, // Invalid memberId
                    '131203': BadRequest, // Request parameter error
                    '131204': BadRequest, // Account info error
                    '131205': BadRequest, // Query transfer error
                    '131206': ExchangeError, // Fail to transfer
                    '131207': BadRequest, // Account not exist
                    '131208': ExchangeError, // Forbid transfer
                    '131209': BadRequest, // Get subMember relation error
                    '131210': BadRequest, // Amount accuracy error
                    '131211': BadRequest, // fromAccountType can't be the same as toAccountType
                    '131212': InsufficientFunds, // Insufficient balance
                    '131213': BadRequest, // TransferLTV check error
                    '131214': BadRequest, // TransferId exist
                    '131215': BadRequest, // Amount error
                    '131216': ExchangeError, // Query balance error
                    '131217': ExchangeError, // Risk check error
                    '131002': BadRequest, // Parameter error
                    '131003': ExchangeError, // Interal error
                    '131004': AuthenticationError, // KYC needed
                    '131085': InsufficientFunds, // Withdrawal amount is greater than your availale balance (the deplayed withdrawal is triggered)
                    '131086': BadRequest, // Withdrawal amount exceeds risk limit (the risk limit of margin trade is triggered)
                    '131088': BadRequest, // The withdrawal amount exceeds the remaining withdrawal limit of your identity verification level. The current available amount for withdrawal : %s
                    '131089': BadRequest, // User sensitive operation, withdrawal is prohibited within 24 hours
                    '131090': ExchangeError, // User withdraw has been banned
                    '131091': ExchangeError, // Blocked login status does not allow withdrawals
                    '131092': ExchangeError, // User status is abnormal
                    '131093': ExchangeError, // The withdrawal address is not in the whitelist
                    '131094': BadRequest, // UserId is not in the whitelist
                    '131095': BadRequest, // Withdrawl amount exceeds the 24 hour platform limit
                    '131096': BadRequest, // Withdraw amount does not satify the lower limit or upper limit
                    '131097': ExchangeError, // Withdrawal of this currency has been closed
                    '131098': ExchangeError, // Withdrawal currently is not availble from new address
                    '131099': ExchangeError, // Hot wallet status can cancel the withdraw
                    '140001': OrderNotFound, // Order does not exist
                    '140003': InvalidOrder, // Order price is out of permissible range
                    '140004': InsufficientFunds, // Insufficient wallet balance
                    '140005': InvalidOrder, // position status
                    '140006': InsufficientFunds, // cannot afford estimated position_margin
                    '140007': InsufficientFunds, // Insufficient available balance
                    '140008': InvalidOrder, // Order has been finished or canceled
                    '140009': InvalidOrder, // The number of stop orders exceeds maximum limit allowed
                    '140010': InvalidOrder, // Order already cancelled
                    '140011': InvalidOrder, // Any adjustments made will trigger immediate liquidation
                    '140012': InsufficientFunds, // Available balance not enough
                    '140013': BadRequest, // Due to risk limit, cannot set leverage
                    '140014': InsufficientFunds, // Available balance not enough to add margin
                    '140015': InvalidOrder, // the position is in cross_margin
                    '140016': InvalidOrder, // Requested quantity of contracts exceeds risk limit, please adjust your risk limit level before trying again
                    '140017': InvalidOrder, // Reduce-only rule not satisfied
                    '140018': BadRequest, // userId illegal
                    '140019': InvalidOrder, // orderId illegal
                    '140020': InvalidOrder, // number of active orders greater than 500
                    '140021': InvalidOrder, // Open Interest exceeded
                    '140022': InvalidOrder, // qty has been limited, cannot modify the order to add qty
                    '140023': InvalidOrder, // This contract only supports position reduction operation, please contact customer service for details
                    '140024': BadRequest, // You have an existing position, so position mode cannot be switched
                    '140025': BadRequest, // Position mode is not modified
                    '140026': BadRequest, // Cross/isolated margin mode is not modified
                    '140027': BadRequest, // Margin is not modified
                    '140028': InvalidOrder, // Open orders exist, so you cannot change position mode
                    '140029': BadRequest, // Hedge mode is not available for this symbol
                    '140030': InvalidOrder, // Duplicate orderId
                    '140031': BadRequest, // risk limit info does not exists
                    '140032': InvalidOrder, // Illegal order
                    '140033': InvalidOrder, // Margin cannot be set without open position
                    '140034': InvalidOrder, // There is no net position
                    '140035': InvalidOrder, // Cancel order is not completed before liquidation
                    '140036': BadRequest, // Cross margin mode is not allowed to change leverage
                    '140037': InvalidOrder, // User setting list does not have this symbol
                    '140038': BadRequest, // Portfolio margin mode is not allowed to change leverage
                    '140039': BadRequest, // Maintain margin rate is too high, which may trigger liquidation
                    '140040': InvalidOrder, // Order will trigger forced liquidation, please resubmit the order
                    '140041': InvalidOrder, // Skip liquidation is not allowed when a position or maker order exists
                    '140042': InvalidOrder, // Pre-delivery status can only reduce positions
                    '140043': BadRequest, // Set leverage not modified
                    '140044': InsufficientFunds, // Insufficient available margin
                    '140045': InsufficientFunds, // Insufficient wallet balance
                    '140046': BadRequest, // Any adjustments made will trigger immediate liquidation
                    '140047': BadRequest, // Risk limit cannot be adjusted due to insufficient available margin
                    '140048': BadRequest, // Risk limit cannot be adjusted as the current/expected position value held exceeds the revised risk limit
                    '140049': BadRequest, // Tick notes can only be numbers
                    '140050': InvalidOrder, // Coin is not in the range of selected
                    '140051': InsufficientFunds, // The user's available balance cannot cover the lowest price of the current market
                    '140052': InsufficientFunds, // User's available balance is insufficient to set a price
                    '140053': InsufficientFunds, // The user's available balance cannot cover the current market price and upper limit price
                    '140054': InvalidOrder, // This position has at least one take profit link order, so the take profit and stop loss mode cannot be switched
                    '140055': InvalidOrder, // This position has at least one stop loss link order, so the take profit and stop loss mode cannot be switched
                    '140056': InvalidOrder, // This position has at least one trailing stop link order, so the take profit and stop loss mode cannot be switched
                    '140057': InvalidOrder, // Conditional order or limit order contains TP/SL related params
                    '140058': InvalidOrder, // Insufficient number of remaining position size to set take profit and stop loss
                    '140059': InvalidOrder, // In the case of partial filled of the open order, it is not allowed to modify the take profit and stop loss settings of the open order
                    '140060': BadRequest, // Under full TP/SL mode, it is not allowed to modify TP/SL
                    '140061': BadRequest, // Under partial TP/SL mode, TP/SL set more than 20
                    '140062': BadRequest, // Institution MMP profile not found.
                    '140063': ExchangeError, // Settlement in progress! xxx not available for trades.
                    '140064': InvalidOrder, // The number of contracts modified cannot be less than or equal to the filled quantity
                    '140065': PermissionDenied, // MMP hasn't yet been enabled for your account. Please contact your BD manager.
                    '140066': ExchangeError, // No trading is allowed at the current time
                    '140067': PermissionDenied, // unified account is not support
                    '140068': PermissionDenied, // Leveraged user trading is not allowed
                    '140069': PermissionDenied, // Do not allow OTC lending users to trade
                    '140070': InvalidOrder, // ETP symbols are not allowed to be traded
                    '170001': ExchangeError, // Internal error.
                    '170007': RequestTimeout, // Timeout waiting for response from backend server.
                    '170005': InvalidOrder, // Too many new orders; current limit is %s orders per %s.
                    '170031': ExchangeError, // The feature has been suspended
                    '170032': ExchangeError, // Network error. Please try again later
                    '170033': InsufficientFunds, // margin Insufficient account balance
                    '170034': InsufficientFunds, // Liability over flow in spot leverage trade!
                    '170035': BadRequest, // Submitted to the system for processing!
                    '170036': BadRequest, // You haven't enabled Cross Margin Trading yet. To do so, please head to the PC trading site or the Bybit app
                    '170037': BadRequest, // Cross Margin Trading not yet supported by the selected coin
                    '170105': BadRequest, // Parameter '%s' was empty.
                    '170115': InvalidOrder, // Invalid timeInForce.
                    '170116': InvalidOrder, // Invalid orderType.
                    '170117': InvalidOrder, // Invalid side.
                    '170121': InvalidOrder, // Invalid symbol.
                    '170130': BadRequest, // Data sent for paramter '%s' is not valid.
                    '170131': InsufficientFunds, // Balance insufficient
                    '170132': InvalidOrder, // Order price too high.
                    '170133': InvalidOrder, // Order price lower than the minimum.
                    '170134': InvalidOrder, // Order price decimal too long.
                    '170135': InvalidOrder, // Order quantity too large.
                    '170136': InvalidOrder, // Order quantity lower than the minimum.
                    '170137': InvalidOrder, // Order volume decimal too long
                    '170139': InvalidOrder, // Order has been filled.
                    '170140': InvalidOrder, // Transaction amount lower than the minimum.
                    '170124': InvalidOrder, // Order amount too large.
                    '170141': InvalidOrder, // Duplicate clientOrderId
                    '170142': InvalidOrder, // Order has been canceled
                    '170143': InvalidOrder, // Cannot be found on order book
                    '170144': InvalidOrder, // Order has been locked
                    '170145': InvalidOrder, // This order type does not support cancellation
                    '170146': InvalidOrder, // Order creation timeout
                    '170147': InvalidOrder, // Order cancellation timeout
                    '170148': InvalidOrder, // Market order amount decimal too long
                    '170149': ExchangeError, // Create order failed
                    '170150': ExchangeError, // Cancel order failed
                    '170151': InvalidOrder, // The trading pair is not open yet
                    '170157': InvalidOrder, // The trading pair is not available for api trading
                    '170159': InvalidOrder, // Market Order is not supported within the first %s minutes of newly launched pairs due to risk control.
                    '170190': InvalidOrder, // Cancel order has been finished
                    '170191': InvalidOrder, // Can not cancel order, please try again later
                    '170192': InvalidOrder, // Order price cannot be higher than %s .
                    '170193': InvalidOrder, // Buy order price cannot be higher than %s.
                    '170194': InvalidOrder, // Sell order price cannot be lower than %s.
                    '170195': InvalidOrder, // Please note that your order may not be filled
                    '170196': InvalidOrder, // Please note that your order may not be filled
                    '170197': InvalidOrder, // Your order quantity to buy is too large. The filled price may deviate significantly from the market price. Please try again
                    '170198': InvalidOrder, // Your order quantity to sell is too large. The filled price may deviate significantly from the market price. Please try again
                    '170199': InvalidOrder, // Your order quantity to buy is too large. The filled price may deviate significantly from the nav. Please try again.
                    '170200': InvalidOrder, // Your order quantity to sell is too large. The filled price may deviate significantly from the nav. Please try again.
                    '170221': BadRequest, // This coin does not exist.
                    '170222': RateLimitExceeded, // Too many requests in this time frame.
                    '170223': InsufficientFunds, // Your Spot Account with Institutional Lending triggers an alert or liquidation.
                    '170224': PermissionDenied, // You're not a user of the Innovation Zone.
                    '170226': InsufficientFunds, // Your Spot Account for Margin Trading is being liquidated.
                    '170227': ExchangeError, // This feature is not supported.
                    '170228': InvalidOrder, // The purchase amount of each order exceeds the estimated maximum purchase amount.
                    '170229': InvalidOrder, // The sell quantity per order exceeds the estimated maximum sell quantity.
                    '170234': ExchangeError, // System Error
                    '170210': InvalidOrder, // New order rejected.
                    '170213': OrderNotFound, // Order does not exist.
                    '170217': InvalidOrder, // Only LIMIT-MAKER order is supported for the current pair.
                    '170218': InvalidOrder, // The LIMIT-MAKER order is rejected due to invalid price.
                    '170010': InvalidOrder, // Purchase failed: Exceed the maximum position limit of leveraged tokens, the current available limit is %s USDT
                    '170011': InvalidOrder, // "Purchase failed: Exceed the maximum position limit of innovation tokens,
                    '170019': InvalidOrder, // the current available limit is replaceKey0 USDT"
                    '170201': PermissionDenied, // Your account has been restricted for trades. If you have any questions, please email us at support@bybit.com
                    '170202': InvalidOrder, // Invalid orderFilter parameter.
                    '170203': InvalidOrder, // Please enter the TP/SL price.
                    '170204': InvalidOrder, // trigger price cannot be higher than 110% price.
                    '170206': InvalidOrder, // trigger price cannot be lower than 90% of qty.
                    '175000': InvalidOrder, // The serialNum is already in use.
                    '175001': InvalidOrder, // Daily purchase limit has been exceeded. Please try again later.
                    '175002': InvalidOrder, // There's a large number of purchase orders. Please try again later.
                    '175003': InsufficientFunds, // Insufficient available balance. Please make a deposit and try again.
                    '175004': InvalidOrder, // Daily redemption limit has been exceeded. Please try again later.
                    '175005': InvalidOrder, // There's a large number of redemption orders. Please try again later.
                    '175006': InsufficientFunds, // Insufficient available balance. Please make a deposit and try again.
                    '175007': InvalidOrder, // Order not found.
                    '175008': InvalidOrder, // Purchase period hasn't started yet.
                    '175009': InvalidOrder, // Purchase amount has exceeded the upper limit.
                    '175010': PermissionDenied, // You haven't passed the quiz yet! To purchase and/or redeem an LT, please complete the quiz first.
                    '175012': InvalidOrder, // Redemption period hasn't started yet.
                    '175013': InvalidOrder, // Redemption amount has exceeded the upper limit.
                    '175014': InvalidOrder, // Purchase of the LT has been temporarily suspended.
                    '175015': InvalidOrder, // Redemption of the LT has been temporarily suspended.
                    '175016': InvalidOrder, // Invalid format. Please check the length and numeric precision.
                    '175017': InvalidOrder, // Failed to place order：Exceed the maximum position limit of leveraged tokens, the current available limit is XXXX USDT
                    '175027': ExchangeError, // Subscriptions and redemptions are temporarily unavailable while account upgrade is in progress
                    '176002': BadRequest, // Query user account info error
                    '176004': BadRequest, // Query order history start time exceeds end time
                    '176003': BadRequest, // Query user loan history error
                    '176006': BadRequest, // Repayment Failed
                    '176005': BadRequest, // Failed to borrow
                    '176008': BadRequest, // You haven't enabled Cross Margin Trading yet. To do so
                    '176007': BadRequest, // User not found
                    '176010': BadRequest, // Failed to locate the coins to borrow
                    '176009': BadRequest, // You haven't enabled Cross Margin Trading yet. To do so
                    '176012': BadRequest, // Pair not available
                    '176011': BadRequest, // Cross Margin Trading not yet supported by the selected coin
                    '176014': BadRequest, // Repeated repayment requests
                    '176013': BadRequest, // Cross Margin Trading not yet supported by the selected pair
                    '176015': InsufficientFunds, // Insufficient available balance
                    '176016': BadRequest, // No repayment required
                    '176017': BadRequest, // Repayment amount has exceeded the total liability
                    '176018': BadRequest, // Settlement in progress
                    '176019': BadRequest, // Liquidation in progress
                    '176020': BadRequest, // Failed to locate repayment history
                    '176021': BadRequest, // Repeated borrowing requests
                    '176022': BadRequest, // Coins to borrow not generally available yet
                    '176023': BadRequest, // Pair to borrow not generally available yet
                    '176024': BadRequest, // Invalid user status
                    '176025': BadRequest, // Amount to borrow cannot be lower than the min. amount to borrow (per transaction)
                    '176026': BadRequest, // Amount to borrow cannot be larger than the max. amount to borrow (per transaction)
                    '176027': BadRequest, // Amount to borrow cannot be higher than the max. amount to borrow per user
                    '176028': BadRequest, // Amount to borrow has exceeded Bybit's max. amount to borrow
                    '176029': BadRequest, // Amount to borrow has exceeded the user's estimated max. amount to borrow
                    '176030': BadRequest, // Query user loan info error
                    '176031': BadRequest, // Number of decimals has exceeded the maximum precision
                    '176034': BadRequest, // The leverage ratio is out of range
                    '176035': PermissionDenied, // Failed to close the leverage switch during liquidation
                    '176036': PermissionDenied, // Failed to adjust leverage switch during forced liquidation
                    '176037': PermissionDenied, // For non-unified transaction users, the operation failed
                    '176038': BadRequest, // The spot leverage is closed and the current operation is not allowed
                    '176039': BadRequest, // Borrowing, current operation is not allowed
                    '176040': BadRequest, // There is a spot leverage order, and the adjustment of the leverage switch failed!
                    '181000': BadRequest, // category is null
                    '181001': BadRequest, // category only support linear or option or spot.
                    '181002': InvalidOrder, // symbol is null.
                    '181003': InvalidOrder, // side is null.
                    '181004': InvalidOrder, // side only support Buy or Sell.
                    '182000': InvalidOrder, // symbol related quote price is null
                    '20001': OrderNotFound, // Order not exists
                    '20003': InvalidOrder, // missing parameter side
                    '20004': InvalidOrder, // invalid parameter side
                    '20005': InvalidOrder, // missing parameter symbol
                    '20006': InvalidOrder, // invalid parameter symbol
                    '20007': InvalidOrder, // missing parameter order_type
                    '20008': InvalidOrder, // invalid parameter order_type
                    '20009': InvalidOrder, // missing parameter qty
                    '20010': InvalidOrder, // qty must be greater than 0
                    '20011': InvalidOrder, // qty must be an integer
                    '20012': InvalidOrder, // qty must be greater than zero and less than 1 million
                    '20013': InvalidOrder, // missing parameter price
                    '20014': InvalidOrder, // price must be greater than 0
                    '20015': InvalidOrder, // missing parameter time_in_force
                    '20016': InvalidOrder, // invalid value for parameter time_in_force
                    '20017': InvalidOrder, // missing parameter order_id
                    '20018': InvalidOrder, // invalid date format
                    '20019': InvalidOrder, // missing parameter stop_px
                    '20020': InvalidOrder, // missing parameter base_price
                    '20021': InvalidOrder, // missing parameter stop_order_id
                    '20022': BadRequest, // missing parameter leverage
                    '20023': BadRequest, // leverage must be a number
                    '20031': BadRequest, // leverage must be greater than zero
                    '20070': BadRequest, // missing parameter margin
                    '20071': BadRequest, // margin must be greater than zero
                    '20084': BadRequest, // order_id or order_link_id is required
                    '30001': BadRequest, // order_link_id is repeated
                    '30003': InvalidOrder, // qty must be more than the minimum allowed
                    '30004': InvalidOrder, // qty must be less than the maximum allowed
                    '30005': InvalidOrder, // price exceeds maximum allowed
                    '30007': InvalidOrder, // price exceeds minimum allowed
                    '30008': InvalidOrder, // invalid order_type
                    '30009': ExchangeError, // no position found
                    '30010': InsufficientFunds, // insufficient wallet balance
                    '30011': PermissionDenied, // operation not allowed as position is undergoing liquidation
                    '30012': PermissionDenied, // operation not allowed as position is undergoing ADL
                    '30013': PermissionDenied, // position is in liq or adl status
                    '30014': InvalidOrder, // invalid closing order, qty should not greater than size
                    '30015': InvalidOrder, // invalid closing order, side should be opposite
                    '30016': ExchangeError, // TS and SL must be cancelled first while closing position
                    '30017': InvalidOrder, // estimated fill price cannot be lower than current Buy liq_price
                    '30018': InvalidOrder, // estimated fill price cannot be higher than current Sell liq_price
                    '30019': InvalidOrder, // cannot attach TP/SL params for non-zero position when placing non-opening position order
                    '30020': InvalidOrder, // position already has TP/SL params
                    '30021': InvalidOrder, // cannot afford estimated position_margin
                    '30022': InvalidOrder, // estimated buy liq_price cannot be higher than current mark_price
                    '30023': InvalidOrder, // estimated sell liq_price cannot be lower than current mark_price
                    '30024': InvalidOrder, // cannot set TP/SL/TS for zero-position
                    '30025': InvalidOrder, // trigger price should bigger than 10% of last price
                    '30026': InvalidOrder, // price too high
                    '30027': InvalidOrder, // price set for Take profit should be higher than Last Traded Price
                    '30028': InvalidOrder, // price set for Stop loss should be between Liquidation price and Last Traded Price
                    '30029': InvalidOrder, // price set for Stop loss should be between Last Traded Price and Liquidation price
                    '30030': InvalidOrder, // price set for Take profit should be lower than Last Traded Price
                    '30031': InsufficientFunds, // insufficient available balance for order cost
                    '30032': InvalidOrder, // order has been filled or cancelled
                    '30033': RateLimitExceeded, // The number of stop orders exceeds maximum limit allowed
                    '30034': OrderNotFound, // no order found
                    '30035': RateLimitExceeded, // too fast to cancel
                    '30036': ExchangeError, // the expected position value after order execution exceeds the current risk limit
                    '30037': InvalidOrder, // order already cancelled
                    '30041': ExchangeError, // no position found
                    '30042': InsufficientFunds, // insufficient wallet balance
                    '30043': InvalidOrder, // operation not allowed as position is undergoing liquidation
                    '30044': InvalidOrder, // operation not allowed as position is undergoing AD
                    '30045': InvalidOrder, // operation not allowed as position is not normal status
                    '30049': InsufficientFunds, // insufficient available balance
                    '30050': ExchangeError, // any adjustments made will trigger immediate liquidation
                    '30051': ExchangeError, // due to risk limit, cannot adjust leverage
                    '30052': ExchangeError, // leverage can not less than 1
                    '30054': ExchangeError, // position margin is invalid
                    '30057': ExchangeError, // requested quantity of contracts exceeds risk limit
                    '30063': ExchangeError, // reduce-only rule not satisfied
                    '30067': InsufficientFunds, // insufficient available balance
                    '30068': ExchangeError, // exit value must be positive
                    '30074': InvalidOrder, // can't create the stop order, because you expect the order will be triggered when the LastPrice(or IndexPrice、 MarkPrice, determined by trigger_by) is raising to stop_px, but the LastPrice(or IndexPrice、 MarkPrice) is already equal to or greater than stop_px, please adjust base_price or stop_px
                    '30075': InvalidOrder, // can't create the stop order, because you expect the order will be triggered when the LastPrice(or IndexPrice、 MarkPrice, determined by trigger_by) is falling to stop_px, but the LastPrice(or IndexPrice、 MarkPrice) is already equal to or less than stop_px, please adjust base_price or stop_px
                    '30078': ExchangeError, // {"ret_code":30078,"ret_msg":"","ext_code":"","ext_info":"","result":null,"time_now":"1644853040.916000","rate_limit_status":73,"rate_limit_reset_ms":1644853040912,"rate_limit":75}
                    // '30084': BadRequest, // Isolated not modified, see handleErrors below
                    '33004': AuthenticationError, // apikey already expired
                    '34026': ExchangeError, // the limit is no change
                    '34036': BadRequest, // {"ret_code":34036,"ret_msg":"leverage not modified","ext_code":"","ext_info":"","result":null,"time_now":"1652376449.258918","rate_limit_status":74,"rate_limit_reset_ms":1652376449255,"rate_limit":75}
                    '35015': BadRequest, // {"ret_code":35015,"ret_msg":"Qty not in range","ext_code":"","ext_info":"","result":null,"time_now":"1652277215.821362","rate_limit_status":99,"rate_limit_reset_ms":1652277215819,"rate_limit":100}
                    '340099': ExchangeError, // Server error
                    '3400045': ExchangeError, // Set margin mode failed
                    '3100116': BadRequest, // {"retCode":3100116,"retMsg":"Order quantity below the lower limit 0.01.","result":null,"retExtMap":{"key0":"0.01"}}
                    '3100198': BadRequest, // {"retCode":3100198,"retMsg":"orderLinkId can not be empty.","result":null,"retExtMap":{}}
                    '3200300': InsufficientFunds, // {"retCode":3200300,"retMsg":"Insufficient margin balance.","result":null,"retExtMap":{}}
                },
                'broad': {
                    'Request timeout': RequestTimeout, // {"retCode":10016,"retMsg":"Request timeout, please try again later","result":{},"retExtInfo":{},"time":1675307914985}
                    'unknown orderInfo': OrderNotFound, // {"ret_code":-1,"ret_msg":"unknown orderInfo","ext_code":"","ext_info":"","result":null,"time_now":"1584030414.005545","rate_limit_status":99,"rate_limit_reset_ms":1584030414003,"rate_limit":100}
                    'invalid api_key': AuthenticationError, // {"ret_code":10003,"ret_msg":"invalid api_key","ext_code":"","ext_info":"","result":null,"time_now":"1599547085.415797"}
                    // the below two issues are caused as described: issues/9149#issuecomment-1146559498, when response is such:  {"ret_code":130021,"ret_msg":"oc_diff[1707966351], new_oc[1707966351] with ob[....]+AB[....]","ext_code":"","ext_info":"","result":null,"time_now":"1658395300.872766","rate_limit_status":99,"rate_limit_reset_ms":1658395300855,"rate_limit":100}
                    'oc_diff': InsufficientFunds,
                    'new_oc': InsufficientFunds,
                    'openapi sign params error!': AuthenticationError, // {"retCode":10001,"retMsg":"empty value: apiTimestamp[] apiKey[] apiSignature[xxxxxxxxxxxxxxxxxxxxxxx]: openapi sign params error!","result":null,"retExtInfo":null,"time":1664789597123}
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'enableUnifiedMargin': undefined,
                'enableUnifiedAccount': undefined,
                'createMarketBuyOrderRequiresPrice': true,
                'createUnifiedMarginAccount': false,
                'defaultType': 'swap',  // 'swap', 'future', 'option', 'spot'
                'defaultSubType': 'linear',  // 'linear', 'inverse'
                'defaultSettle': 'USDT', // USDC for USDC settled markets
                'code': 'BTC',
                'recvWindow': 5 * 1000, // 5 sec default
                'timeDifference': 0, // the difference between system clock and exchange server clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
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
                },
                'networks': {
                    'ERC20': 'ETH',
                    'TRC20': 'TRX',
                    'BEP20': 'BSC',
                    'OMNI': 'OMNI',
                    'SPL': 'SOL',
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
            'commonCurrencies': {
                'GAS': 'GASDAO',
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async isUnifiedEnabled (params = {}) {
        // The API key of user id must own one of permissions will be allowed to call following API endpoints.
        // SUB UID: "Account Transfer"
        // MASTER UID: "Account Transfer", "Subaccount Transfer", "Withdrawal"
        const enableUnifiedMargin = this.safeValue (this.options, 'enableUnifiedMargin');
        const enableUnifiedAccount = this.safeValue (this.options, 'enableUnifiedAccount');
        if (enableUnifiedMargin === undefined || enableUnifiedAccount === undefined) {
            const response = await this.privateGetUserV3PrivateQueryApi (params);
            //
            //     {
            //         "retCode":0,
            //         "retMsg":"OK",
            //         "result":{
            //             "id":"88888888",
            //             "note":"ccxt-moon",
            //             "apiKey":"8s8c808v8u8",
            //             "readOnly":0,
            //             "secret":"",
            //             "permissions":{
            //                 "ContractTrade":[""],
            //                 "Spot":[""],
            //                 "Wallet":[""],
            //                 "Options":[""],
            //                 "Derivatives":[""],
            //                 "CopyTrading":[""],
            //                 "BlockTrade":[],
            //                 "Exchange":[""],
            //                 "NFT":[""]
            //             },
            //             "ips":[""],
            //             "type":1,
            //             "deadlineDay":27,
            //             "expiredAt":"",
            //             "createdAt":"",
            //             "unified":1,
            //             "uta": 1
            //         },
            //         "retExtInfo":null,
            //         "time":1669735171649
            //     }
            //
            const result = this.safeValue (response, 'result', {});
            this.options['enableUnifiedMargin'] = this.safeInteger (result, 'unified') === 1;
            this.options['enableUnifiedAccount'] = this.safeInteger (result, 'uta') === 1;
        }
        return [ this.options['enableUnifiedMargin'], this.options['enableUnifiedAccount'] ];
    }

    async upgradeUnifiedAccount (params = {}) {
        const createUnifiedMarginAccount = this.safeValue (this.options, 'createUnifiedMarginAccount');
        if (!createUnifiedMarginAccount) {
            throw new NotSupported (this.id + ' upgradeUnifiedAccount() warning this method can only be called once, it is not reverseable and you will be stuck with a unified margin account, you also need at least 5000 USDT in your bybit account to do this. If you want to disable this warning set exchange.options["createUnifiedMarginAccount"]=true.');
        }
        return await this.privatePostUnifiedV3PrivateAccountUpgradeUnifiedAccount (params);
    }

    async upgradeUnifiedTradeAccount (params = {}) {
        return await this.privatePostV5AccountUpgradeToUta (params);
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name bybit#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://bybit-exchange.github.io/docs/v3/server-time
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetV3PublicTime (params);
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
        return this.safeInteger (response, 'time');
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name bybit#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://bybit-exchange.github.io/docs/v5/asset/coin-info
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        if (!this.checkRequiredCredentials (false)) {
            return undefined;
        }
        const response = await this.privateGetV5AssetCoinQueryInfo (params);
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
        const data = this.safeValue (response, 'result', []);
        const rows = this.safeValue (data, 'rows', []);
        const result = {};
        for (let i = 0; i < rows.length; i++) {
            const currency = rows[i];
            const currencyId = this.safeString (currency, 'coin');
            const code = this.safeCurrencyCode (currencyId);
            const name = this.safeString (currency, 'name');
            const chains = this.safeValue (currency, 'chains', []);
            const networks = {};
            let minPrecision = undefined;
            let minWithdrawFeeString = undefined;
            let minWithdrawString = undefined;
            let minDepositString = undefined;
            let deposit = false;
            let withdraw = false;
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'chain');
                const networkCode = this.networkIdToCode (networkId);
                const precision = this.parseNumber (this.parsePrecision (this.safeString (chain, 'minAccuracy')));
                minPrecision = (minPrecision === undefined) ? precision : Math.min (minPrecision, precision);
                const depositAllowed = this.safeInteger (chain, 'chainDeposit') === 1;
                deposit = (depositAllowed) ? depositAllowed : deposit;
                const withdrawAllowed = this.safeInteger (chain, 'chainWithdraw') === 1;
                withdraw = (withdrawAllowed) ? withdrawAllowed : withdraw;
                const withdrawFeeString = this.safeString (chain, 'withdrawFee');
                if (withdrawFeeString !== undefined) {
                    minWithdrawFeeString = (minWithdrawFeeString === undefined) ? withdrawFeeString : Precise.stringMin (withdrawFeeString, minWithdrawFeeString);
                }
                const minNetworkWithdrawString = this.safeString (chain, 'withdrawMin');
                if (minNetworkWithdrawString !== undefined) {
                    minWithdrawString = (minWithdrawString === undefined) ? minNetworkWithdrawString : Precise.stringMin (minNetworkWithdrawString, minWithdrawString);
                }
                const minNetworkDepositString = this.safeString (chain, 'depositMin');
                if (minNetworkDepositString !== undefined) {
                    minDepositString = (minDepositString === undefined) ? minNetworkDepositString : Precise.stringMin (minNetworkDepositString, minDepositString);
                }
                networks[networkCode] = {
                    'info': chain,
                    'id': networkId,
                    'network': networkCode,
                    'active': depositAllowed && withdrawAllowed,
                    'deposit': depositAllowed,
                    'withdraw': withdrawAllowed,
                    'fee': this.parseNumber (withdrawFeeString),
                    'precision': precision,
                    'limits': {
                        'withdraw': {
                            'min': this.parseNumber (minNetworkWithdrawString),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.parseNumber (minNetworkDepositString),
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
                'fee': this.parseNumber (minWithdrawFeeString),
                'precision': minPrecision,
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
                'networks': networks,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bybit#fetchMarkets
         * @description retrieves data on all markets for bybit
         * @see https://bybit-exchange.github.io/docs/v5/market/instrument
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference ();
        }
        const promisesUnresolved = [
            this.fetchSpotMarkets (params),
            this.fetchDerivativesMarkets ({ 'category': 'linear' }),
            this.fetchDerivativesMarkets ({ 'category': 'inverse' }),
        ];
        const promises = await Promise.all (promisesUnresolved);
        const spotMarkets = promises[0];
        const linearMarkets = promises[1];
        const inverseMarkets = promises[2];
        let markets = spotMarkets;
        markets = this.arrayConcat (markets, linearMarkets);
        return this.arrayConcat (markets, inverseMarkets);
    }

    async fetchSpotMarkets (params) {
        const request = {
            'category': 'spot',
        };
        const response = await this.publicGetV5MarketInstrumentsInfo (this.extend (request, params));
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
        const responseResult = this.safeValue (response, 'result', {});
        const markets = this.safeValue (responseResult, 'list', []);
        const result = [];
        const takerFee = this.parseNumber ('0.001');
        const makerFee = this.parseNumber ('0.001');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseCoin');
            const quoteId = this.safeString (market, 'quoteCoin');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const status = this.safeString (market, 'status');
            const active = (status === 'Trading');
            const lotSizeFilter = this.safeValue (market, 'lotSizeFilter');
            const priceFilter = this.safeValue (market, 'priceFilter');
            const quotePrecision = this.safeNumber (lotSizeFilter, 'quotePrecision');
            result.push ({
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
                'margin': undefined,
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
                    'amount': this.safeNumber (lotSizeFilter, 'basePrecision'),
                    'price': this.safeNumber (priceFilter, 'tickSize', quotePrecision),
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber ('1'),
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (lotSizeFilter, 'minOrderQty'),
                        'max': this.safeNumber (lotSizeFilter, 'maxOrderQty'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (lotSizeFilter, 'minOrderAmt'),
                        'max': this.safeNumber (lotSizeFilter, 'maxOrderAmt'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchDerivativesMarkets (params) {
        params['limit'] = 1000; // minimize number of requests
        const response = await this.publicGetV5MarketInstrumentsInfo (params);
        const data = this.safeValue (response, 'result', {});
        let markets = this.safeValue (data, 'list', []);
        let paginationCursor = this.safeString (data, 'nextPageCursor');
        if (paginationCursor !== undefined) {
            while (paginationCursor !== undefined) {
                params['cursor'] = paginationCursor;
                const responseInner = await this.publicGetDerivativesV3PublicInstrumentsInfo (params);
                const dataNew = this.safeValue (responseInner, 'result', {});
                const rawMarkets = this.safeValue (dataNew, 'list', []);
                const rawMarketsLength = rawMarkets.length;
                if (rawMarketsLength === 0) {
                    break;
                }
                markets = this.arrayConcat (rawMarkets, markets);
                paginationCursor = this.safeString (dataNew, 'nextPageCursor');
            }
        }
        //
        // linear response
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
        // option response
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "category": "option",
        //             "nextPageCursor": "",
        //             "list": [
        //                 {
        //                     "category": "option",
        //                     "symbol": "ETH-3JAN23-1250-P",
        //                     "status": "ONLINE",
        //                     "baseCoin": "ETH",
        //                     "quoteCoin": "USD",
        //                     "settleCoin": "USDC",
        //                     "optionsType": "Put",
        //                     "launchTime": "1672560000000",
        //                     "deliveryTime": "1672732800000",
        //                     "deliveryFeeRate": "0.00015",
        //                     "priceFilter": {
        //                         "minPrice": "0.1",
        //                         "maxPrice": "10000000",
        //                         "tickSize": "0.1"
        //                     },
        //                     "lotSizeFilter": {
        //                         "maxOrderQty": "1500",
        //                         "minOrderQty": "0.1",
        //                         "qtyStep": "0.1"
        //                     }
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1672712537130
        //     }
        //
        const result = [];
        let category = this.safeString (data, 'category');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            if (category === undefined) {
                category = this.safeString (market, 'category');
            }
            const linear = (category === 'linear');
            const inverse = (category === 'inverse');
            const contractType = this.safeString (market, 'contractType');
            const inverseFutures = (contractType === 'InverseFutures');
            const linearFutures = (contractType === 'LinearFutures');
            const linearPerpetual = (contractType === 'LinearPerpetual');
            const inversePerpetual = (contractType === 'InversePerpetual');
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseCoin');
            const quoteId = this.safeString (market, 'quoteCoin');
            const defaultSettledId = linear ? quoteId : baseId;
            const settleId = this.safeString (market, 'settleCoin', defaultSettledId);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let settle = undefined;
            if (linearPerpetual && (settleId === 'USD')) {
                settle = 'USDC';
            } else {
                settle = this.safeCurrencyCode (settleId);
            }
            let symbol = base + '/' + quote;
            const lotSizeFilter = this.safeValue (market, 'lotSizeFilter', {});
            const priceFilter = this.safeValue (market, 'priceFilter', {});
            const leverage = this.safeValue (market, 'leverageFilter', {});
            const status = this.safeString (market, 'status');
            const active = (status === 'Trading');
            const swap = linearPerpetual || inversePerpetual;
            const future = inverseFutures || linearFutures;
            const option = (category === 'option');
            let type = undefined;
            if (swap) {
                type = 'swap';
            } else if (future) {
                type = 'future';
            } else if (option) {
                type = 'option';
            }
            let expiry = this.omitZero (this.safeString (market, 'deliveryTime'));
            if (expiry !== undefined) {
                expiry = parseInt (expiry);
            }
            const expiryDatetime = this.iso8601 (expiry);
            let strike = undefined;
            let optionType = undefined;
            symbol = symbol + ':' + settle;
            if (expiry !== undefined) {
                symbol = symbol + '-' + this.yymmdd (expiry);
                if (option) {
                    const splitId = id.split ('-');
                    strike = this.safeString (splitId, 2);
                    const optionLetter = this.safeString (splitId, 3);
                    symbol = symbol + '-' + strike + '-' + optionLetter;
                    if (optionLetter === 'P') {
                        optionType = 'put';
                    } else if (optionLetter === 'C') {
                        optionType = 'call';
                    }
                }
            }
            const contractSize = inverse ? this.safeNumber2 (lotSizeFilter, 'minTradingQty', 'minOrderQty') : this.parseNumber ('1');
            result.push ({
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
                'option': option,
                'active': active,
                'contract': true,
                'linear': linear,
                'inverse': inverse,
                'taker': this.safeNumber (market, 'takerFee', this.parseNumber ('0.0006')),
                'maker': this.safeNumber (market, 'makerFee', this.parseNumber ('0.0001')),
                'contractSize': contractSize,
                'expiry': expiry,
                'expiryDatetime': expiryDatetime,
                'strike': strike,
                'optionType': optionType,
                'precision': {
                    'amount': this.safeNumber (lotSizeFilter, 'qtyStep'),
                    'price': this.safeNumber (priceFilter, 'tickSize'),
                },
                'limits': {
                    'leverage': {
                        'min': this.safeNumber (leverage, 'minLeverage'),
                        'max': this.safeNumber (leverage, 'maxLeverage'),
                    },
                    'amount': {
                        'min': this.safeNumber2 (lotSizeFilter, 'minTradingQty', 'minOrderQty'),
                        'max': this.safeNumber2 (lotSizeFilter, 'maxTradingQty', 'maxOrderQty'),
                    },
                    'price': {
                        'min': this.safeNumber (priceFilter, 'minPrice'),
                        'max': this.safeNumber (priceFilter, 'maxPrice'),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
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
        const timestamp = this.safeInteger (ticker, 'time');
        const marketId = this.safeString (ticker, 'symbol');
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        market = this.safeMarket (marketId, market, undefined, defaultType);
        const symbol = this.safeSymbol (marketId, market, undefined, defaultType);
        const last = this.safeString (ticker, 'lastPrice');
        const open = this.safeString (ticker, 'prevPrice24h');
        let percentage = this.safeString (ticker, 'price24hPcnt');
        percentage = Precise.stringMul (percentage, '100');
        const quoteVolume = this.safeString (ticker, 'turnover24h');
        const baseVolume = this.safeString (ticker, 'volume24h');
        const bid = this.safeString (ticker, 'bid1Price');
        const ask = this.safeString (ticker, 'ask1Price');
        const high = this.safeString (ticker, 'highPrice24h');
        const low = this.safeString (ticker, 'lowPrice24h');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': this.safeString2 (ticker, 'bidSize', 'bid1Size'),
            'ask': ask,
            'askVolume': this.safeString2 (ticker, 'askSize', 'ask1Size'),
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
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name bybit#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://bybit-exchange.github.io/docs/v5/market/tickers
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        this.checkRequiredSymbol ('fetchTicker', symbol);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'baseCoin': '', Base coin. For option only
            // 'expDate': '', Expiry date. e.g., 25DEC22. For option only
        };
        if (market['spot']) {
            request['category'] = 'spot';
        } else {
            if (market['option']) {
                request['category'] = 'option';
            } else if (market['linear']) {
                request['category'] = 'linear';
            } else if (market['inverse']) {
                request['category'] = 'inverse';
            }
        }
        const response = await this.publicGetV5MarketTickers (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', []);
        const tickers = this.safeValue (result, 'list', []);
        const rawTicker = this.safeValue (tickers, 0);
        return this.parseTicker (rawTicker, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://bybit-exchange.github.io/docs/v5/market/tickers
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
            market = this.market (symbols[0]);
        }
        const request = {
            // 'symbol': market['id'],
            // 'baseCoin': '', Base coin. For option only
            // 'expDate': '', Expiry date. e.g., 25DEC22. For option only
        };
        let type = undefined;
        const isTypeInParams = ('type' in params);
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        if (type === 'spot') {
            request['category'] = 'spot';
        } else if (type === 'swap' || type === 'future') {
            let subType = undefined;
            [ subType, params ] = this.handleSubTypeAndParams ('fetchTickers', market, params, 'linear');
            request['category'] = subType;
        } else if (type === 'option') {
            request['category'] = 'option';
        }
        const response = await this.publicGetV5MarketTickers (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const tickerList = this.safeValue (result, 'list', []);
        const tickers = {};
        if (market === undefined && isTypeInParams) {
            // create a "fake" market for the type
            market = {
                'type': (type === 'swap' || type === 'future') ? 'swap' : type,
            };
        }
        for (let i = 0; i < tickerList.length; i++) {
            const ticker = this.parseTicker (tickerList[i], market);
            const symbol = ticker['symbol'];
            // this is needed because bybit returns
            // futures with type = swap
            const marketInner = this.market (symbol);
            if (marketInner['type'] === type) {
                tickers[symbol] = ticker;
            }
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    parseOHLCV (ohlcv, market = undefined) {
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
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, volumeIndex),
        ];
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
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
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        this.checkRequiredSymbol ('fetchOHLCV', symbol);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
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
        request['interval'] = this.safeString (this.timeframes, timeframe, timeframe);
        let method = undefined;
        if (market['spot']) {
            request['category'] = 'spot';
            method = 'publicGetV5MarketKline';
        } else {
            const price = this.safeString (params, 'price');
            params = this.omit (params, 'price');
            const methods = {
                'mark': 'publicGetV5MarketMarkPriceKline',
                'index': 'publicGetV5MarketIndexPriceKline',
                'premiumIndex': 'publicGetV5MarketPremiumIndexPriceKline',
            };
            method = this.safeValue (methods, price, 'publicGetV5MarketKline');
            if (market['linear']) {
                request['category'] = 'linear';
            } else if (market['inverse']) {
                request['category'] = 'inverse';
            } else {
                throw new NotSupported (this.id + ' fetchOHLCV() is not supported for option markets');
            }
        }
        const response = await this[method] (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const ohlcvs = this.safeValue (result, 'list', []);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseFundingRate (ticker, market = undefined) {
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
        const timestamp = this.safeInteger (ticker, 'timestamp'); // added artificially to avoid changing the signature
        ticker = this.omit (ticker, 'timestamp');
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, 'swap');
        const fundingRate = this.safeNumber (ticker, 'fundingRate');
        const fundingTimestamp = this.safeInteger (ticker, 'nextFundingTime');
        const markPrice = this.safeNumber (ticker, 'markPrice');
        const indexPrice = this.safeNumber (ticker, 'indexPrice');
        return {
            'info': ticker,
            'symbol': symbol,
            'markPrice': markPrice,
            'indexPrice': indexPrice,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': fundingRate,
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601 (fundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchFundingRates (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchFundingRates
         * @description fetches funding rates for multiple markets
         * @see https://bybit-exchange.github.io/docs/v5/market/tickers
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the funding rates for, all market funding rates are returned if not assigned
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} an array of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
            market = this.market (symbols[0]);
            if (symbols.length === 1) {
                request['symbol'] = market['id'];
            }
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchFundingRates', market, params);
        if (type !== 'swap') {
            throw new NotSupported (this.id + ' fetchFundingRates() does not support ' + type + ' markets');
        } else {
            let subType = undefined;
            [ subType, params ] = this.handleSubTypeAndParams ('fetchFundingRates', market, params, 'linear');
            request['category'] = subType;
        }
        const response = await this.publicGetV5MarketTickers (this.extend (request, params));
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
        let tickerList = this.safeValue (response, 'result', []);
        const timestamp = this.safeInteger (response, 'time');
        tickerList = this.safeValue (tickerList, 'list');
        const fundingRates = {};
        for (let i = 0; i < tickerList.length; i++) {
            const rawTicker = tickerList[i];
            rawTicker['timestamp'] = timestamp; // will be removed inside the parser
            const ticker = this.parseFundingRate (tickerList[i], undefined);
            const symbol = ticker['symbol'];
            fundingRates[symbol] = ticker;
        }
        return this.filterByArray (fundingRates, 'symbol', symbols);
    }

    async fetchFundingRateHistory (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @see https://bybit-exchange.github.io/docs/v5/market/history-fund-rate
         * @param {string|undefined} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int|undefined} since timestamp in ms of the earliest funding rate to fetch
         * @param {int|undefined} limit the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure} to fetch
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @param {int|undefined} params.until timestamp in ms of the latest funding rate
         * @returns {[object]} a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
         */
        this.checkRequiredSymbol ('fetchFundingRateHistory', symbol);
        await this.loadMarkets ();
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
        const market = this.market (symbol);
        symbol = market['symbol'];
        request['symbol'] = market['id'];
        if (market['option']) {
            throw new NotSupported (this.id + ' fetchFundingRateHistory() is not supported for option markets');
        } else if (market['linear']) {
            request['category'] = 'linear';
        } else if (market['inverse']) {
            request['category'] = 'inverse';
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger2 (params, 'until', 'till'); // unified in milliseconds
        const endTime = this.safeInteger (params, 'endTime', until); // exchange-specific in milliseconds
        params = this.omit (params, [ 'endTime', 'till', 'until' ]);
        if (endTime !== undefined) {
            request['endTime'] = endTime;
        } else {
            if (since !== undefined) {
                // end time is required when since is not empty
                const fundingInterval = 60 * 60 * 8 * 1000;
                request['endTime'] = since + limit * fundingInterval;
            }
        }
        const response = await this.publicGetV5MarketFundingHistory (this.extend (request, params));
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
        const result = this.safeValue (response, 'result');
        const resultList = this.safeValue (result, 'list');
        for (let i = 0; i < resultList.length; i++) {
            const entry = resultList[i];
            const timestamp = this.safeInteger (entry, 'fundingRateTimestamp');
            rates.push ({
                'info': entry,
                'symbol': this.safeSymbol (this.safeString (entry, 'symbol'), undefined, undefined, 'swap'),
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const isSpotTrade = ('isBuyerMaker' in trade) || ('feeTokenId' in trade);
        if (isSpotTrade) {
            return this.parseSpotTrade (trade, market);
        } else {
            return this.parseContractTrade (trade, market);
        }
    }

    parseSpotTrade (trade, market = undefined) {
        //
        //   public:
        //     {
        //        "price": "39548.68",
        //        "time": "1651748717850",
        //        "qty": "0.166872",
        //        "isBuyerMaker": 0
        //     }
        //
        //   private:
        //     {
        //         "orderPrice": "82.5",
        //         "creatTime": "1666702226326",
        //         "orderQty": "0.016",
        //         "isBuyer": "0",
        //         "isMaker": "0",
        //         "symbol": "AAVEUSDT",
        //         "id": "1274785101965716992",
        //         "orderId": "1274784252359089664",
        //         "tradeId": "2270000000031365639",
        //         "execFee": "0",
        //         "feeTokenId": "AAVE",
        //         "matchOrderId": "1274785101865076224",
        //         "makerRebate": "0",
        //         "executionTime": "1666702226335"
        //     }
        //
        const timestamp = this.safeIntegerN (trade, [ 'time', 'creatTime' ]);
        let takerOrMaker = undefined;
        let side = undefined;
        const isBuyerMaker = this.safeInteger (trade, 'isBuyerMaker');
        if (isBuyerMaker !== undefined) {
            // if public response
            side = (isBuyerMaker === 1) ? 'buy' : 'sell';
        } else {
            // if private response
            const isBuyer = this.safeInteger (trade, 'isBuyer');
            const isMaker = this.safeInteger (trade, 'isMaker');
            takerOrMaker = (isMaker === 0) ? 'maker' : 'taker';
            side = (isBuyer === 0) ? 'buy' : 'sell';
        }
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market, undefined, 'spot');
        let fee = undefined;
        const feeCost = this.safeString (trade, 'execFee');
        if (feeCost !== undefined) {
            const feeToken = this.safeString (trade, 'feeTokenId');
            const feeCurrency = this.safeCurrencyCode (feeToken);
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return this.safeTrade ({
            'id': this.safeString (trade, 'tradeId'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': this.safeString (trade, 'orderId'),
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeString2 (trade, 'price', 'orderPrice'),
            'amount': this.safeString2 (trade, 'qty', 'orderQty'),
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    parseContractTrade (trade, market = undefined) {
        //
        // public contract
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
        // public unified margin
        //
        //     {
        //         "execId": "da66abbc-f358-5864-8d34-84ef7274d853",
        //         "symbol": "BTCUSDT",
        //         "price": "20802.50",
        //         "size": "0.200",
        //         "side": "Sell",
        //         "time": "1657870316630"
        //     }
        //
        // private contract trades
        //
        //     {
        //         "symbol": "ETHUSD",
        //         "execFee": "0.00005484",
        //         "execId": "acf78206-d464-589b-b888-51bd130821c1",
        //         "execPrice": "1367.80",
        //         "execQty": "100",
        //         "execType": "Trade",
        //         "execValue": "0.0731101",
        //         "feeRate": "0.00075",
        //         "lastLiquidityInd": "RemovedLiquidity",
        //         "leavesQty": "0",
        //         "orderId": "fdc584c3-be5d-41ff-8f54-5be7649b1d1c",
        //         "orderLinkId": "",
        //         "orderPrice": "1299.50",
        //         "orderQty": "100",
        //         "orderType": "Market",
        //         "stopOrderType": "UNKNOWN",
        //         "side": "Sell",
        //         "execTime": "1611528105547",
        //         "closedSize": "100"
        //     }
        //
        // private unified margin
        //
        //     {
        //         "symbol": "AAVEUSDT",
        //         "id": "1274785101965716991",
        //         "orderId": "1274784252359089664",
        //         "tradeId": "2270000000031365639",
        //         "orderPrice": "82.5",
        //         "orderQty": "0.016",
        //         "execFee": "0",
        //         "feeTokenId": "AAVE",
        //         "creatTime": "1666702226326",
        //         "isBuyer": "0",
        //         "isMaker": "0",
        //         "matchOrderId": "1274785101865076224",
        //         "makerRebate": "0",
        //         "executionTime": "1666702226335"
        //     }
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
        const id = this.safeStringN (trade, [ 'execId', 'id', 'tradeId' ]);
        const marketId = this.safeString (trade, 'symbol');
        let marketType = 'contract';
        if (market !== undefined) {
            marketType = market['type'];
        }
        const category = this.safeString (trade, 'category');
        if (category !== undefined) {
            if (category === 'spot') {
                marketType = 'spot';
            }
        }
        market = this.safeMarket (marketId, market, undefined, marketType);
        const symbol = market['symbol'];
        const amountString = this.safeStringN (trade, [ 'execQty', 'orderQty', 'size' ]);
        const priceString = this.safeStringN (trade, [ 'execPrice', 'orderPrice', 'price' ]);
        const costString = this.safeString (trade, 'execValue');
        const timestamp = this.safeIntegerN (trade, [ 'time', 'execTime', 'tradeTime' ]);
        let side = this.safeStringLower (trade, 'side');
        if (side === undefined) {
            const isBuyer = this.safeInteger (trade, 'isBuyer');
            if (isBuyer !== undefined) {
                side = isBuyer ? 'buy' : 'sell';
            }
        }
        const isMaker = this.safeValue (trade, 'isMaker');
        let takerOrMaker = undefined;
        if (isMaker !== undefined) {
            takerOrMaker = isMaker ? 'maker' : 'taker';
        } else {
            let lastLiquidityInd = this.safeString (trade, 'lastLiquidityInd');
            if (lastLiquidityInd === 'UNKNOWN') {
                lastLiquidityInd = undefined;
            }
            if (lastLiquidityInd !== undefined) {
                if ((lastLiquidityInd === 'TAKER') || (lastLiquidityInd === 'MAKER')) {
                    takerOrMaker = lastLiquidityInd.toLowerCase ();
                } else {
                    takerOrMaker = (lastLiquidityInd === 'AddedLiquidity') ? 'maker' : 'taker';
                }
            }
        }
        let orderType = this.safeStringLower (trade, 'orderType');
        if (orderType === 'unknown') {
            orderType = undefined;
        }
        const feeCostString = this.safeString (trade, 'execFee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            let feeCurrencyCode = undefined;
            if (market['spot']) {
                feeCurrencyCode = this.safeString (trade, 'commissionAsset');
            } else {
                feeCurrencyCode = market['inverse'] ? market['base'] : market['settle'];
            }
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': this.safeString (trade, 'orderId'),
            'type': orderType,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://bybit-exchange.github.io/docs/v5/market/recent-trade
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        this.checkRequiredSymbol ('fetchTrades', symbol);
        await this.loadMarkets ();
        const market = this.market (symbol);
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
        if (market['type'] === 'spot') {
            request['category'] = 'spot';
        } else {
            if (market['option']) {
                request['category'] = 'option';
            } else if (market['linear']) {
                request['category'] = 'linear';
            } else if (market['inverse']) {
                request['category'] = 'inverse';
            }
        }
        const response = await this.publicGetV5MarketRecentTrade (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'list', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://bybit-exchange.github.io/docs/v5/market/orderbook
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        this.checkRequiredSymbol ('fetchOrderBook', symbol);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let defaultLimit = 25;
        if (market['spot']) {
            // limit: [1, 50]. Default: 1
            defaultLimit = 50;
            request['category'] = 'spot';
        } else {
            if (market['option']) {
                // limit: [1, 25]. Default: 1
                request['category'] = 'option';
            } else if (market['linear']) {
                // limit: [1, 200]. Default: 25
                request['category'] = 'linear';
            } else if (market['inverse']) {
                // limit: [1, 200]. Default: 25
                request['category'] = 'inverse';
            }
        }
        request['limit'] = (limit !== undefined) ? limit : defaultLimit;
        const response = await this.publicGetV5MarketOrderbook (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', []);
        const timestamp = this.safeInteger (result, 'ts');
        return this.parseOrderBook (result, symbol, timestamp, 'b', 'a');
    }

    parseBalance (response) {
        //
        // margin wallet
        //     [
        //         {
        //             "free": "0.001143855",
        //             "interest": "0",
        //             "loan": "0",
        //             "locked": "0",
        //             "tokenId": "BTC",
        //             "total": "0.001143855"
        //         },
        //         {
        //             "free": "200.00005568",
        //             "interest": "0.0008391",
        //             "loan": "200",
        //             "locked": "0",
        //             "tokenId": "USDT",
        //             "total": "200.00005568"
        //         },
        //     ]
        //
        // usdc wallet
        //    {
        //      "result": {
        //           "walletBalance": "10.0000",
        //           "accountMM": "0.0000",
        //           "bonus": "0.0000",
        //           "accountIM": "0.0000",
        //           "totalSessionRPL": "0.0000",
        //           "equity": "10.0000",
        //           "totalRPL": "0.0000",
        //           "marginBalance": "10.0000",
        //           "availableBalance": "10.0000",
        //           "totalSessionUPL": "0.0000"
        //       },
        //       "retCode": "0",
        //       "retMsg": "Success."
        //    }
        //
        // Unified Margin
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "Success",
        //         "result": {
        //             "totalEquity": "112.21267421",
        //             "accountIMRate": "0.6895",
        //             "totalMarginBalance": "80.37711012",
        //             "totalInitialMargin": "55.42180254",
        //             "totalAvailableBalance": "24.95530758",
        //             "accountMMRate": "0.0459",
        //             "totalPerpUPL": "-16.69586570",
        //             "totalWalletBalance": "97.07311619",
        //             "totalMaintenanceMargin": "3.68580537",
        //             "coin": [
        //                 {
        //                     "currencyCoin": "ETH",
        //                     "availableToBorrow": "0.00000000",
        //                     "borrowSize": "0.00000000",
        //                     "bonus": "0.00000000",
        //                     "accruedInterest": "0.00000000",
        //                     "availableBalanceWithoutConvert": "0.00000000",
        //                     "totalOrderIM": "",
        //                     "equity": "0.00000000",
        //                     "totalPositionMM": "",
        //                     "usdValue": "0.00000000",
        //                     "availableBalance": "0.02441165",
        //                     "unrealisedPnl": "",
        //                     "totalPositionIM": "",
        //                     "marginBalanceWithoutConvert": "0.00000000",
        //                     "walletBalance": "0.00000000",
        //                     "cumRealisedPnl": "",
        //                     "marginBalance": "0.07862610"
        //                 }
        //             ]
        //         },
        //         "time": 1657716037033
        //     }
        //
        // contract v3
        //
        //     [
        //         {
        //             "coin": "BTC",
        //             "equity": "0.00000002",
        //             "walletBalance": "0.00000002",
        //             "positionMargin": "0",
        //             "availableBalance": "0.00000002",
        //             "orderMargin": "0",
        //             "occClosingFee": "0",
        //             "occFundingFee": "0",
        //             "unrealisedPnl": "0",
        //             "cumRealisedPnl": "-0.00010941",
        //             "givenCash": "0",
        //             "serviceCash": "0"
        //         },
        //         {
        //             "coin": "USDT",
        //             "equity": "3662.81038535",
        //             "walletBalance": "3662.81038535",
        //             "positionMargin": "0",
        //             "availableBalance": "3662.81038535",
        //             "orderMargin": "0",
        //             "occClosingFee": "0",
        //             "occFundingFee": "0",
        //             "unrealisedPnl": "0",
        //             "cumRealisedPnl": "-36.01761465",
        //             "givenCash": "0",
        //             "serviceCash": "0"
        //         }
        //     ]
        // spot
        //     {
        //       retCode: '0',
        //       retMsg: 'OK',
        //       result: {
        //         balances: [
        //           {
        //             coin: 'BTC',
        //             coinId: 'BTC',
        //             total: '0.00977041118',
        //             free: '0.00877041118',
        //             locked: '0.001'
        //           },
        //           {
        //             coin: 'EOS',
        //             coinId: 'EOS',
        //             total: '2000',
        //             free: '2000',
        //             locked: '0'
        //           }
        //         ]
        //       },
        //       retExtInfo: {},
        //       time: '1670002625754'
        //  }
        //
        // Unified trade account
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
        //                     "totalMaintenanceMargin": "0.38106773",
        //                     "coin": [
        //                         {
        //                             "availableToBorrow": "2.5",
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
        // funding v5
        //    {
        //        retCode: '0',
        //        retMsg: 'success',
        //        result: {
        //          memberId: '452265',
        //          accountType: 'FUND',
        //          balance: [
        //            {
        //              coin: 'BTC',
        //              transferBalance: '0.2',
        //              walletBalance: '0.2',
        //              bonus: ''
        //            }
        //          ]
        //        },
        //        retExtInfo: {},
        //        time: '1677781902858'
        //    }
        //
        // all coins balance
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
        const result = {
            'info': response,
        };
        const responseResult = this.safeValue (response, 'result', {});
        const currencyList = this.safeValueN (responseResult, [ 'loanAccountList', 'list', 'coin', 'balances', 'balance' ]);
        if (currencyList === undefined) {
            // usdc wallet
            const code = 'USDC';
            const account = this.account ();
            account['free'] = this.safeString (responseResult, 'availableBalance');
            account['total'] = this.safeString (responseResult, 'walletBalance');
            result[code] = account;
        } else {
            for (let i = 0; i < currencyList.length; i++) {
                const entry = currencyList[i];
                const accountType = this.safeString (entry, 'accountType');
                if (accountType === 'UNIFIED' || accountType === 'CONTRACT') {
                    const coins = this.safeValue (entry, 'coin');
                    for (let j = 0; j < coins.length; j++) {
                        const account = this.account ();
                        const coinEntry = coins[j];
                        const loan = this.safeString (coinEntry, 'borrowAmount');
                        const interest = this.safeString (coinEntry, 'accruedInterest');
                        if ((loan !== undefined) && (interest !== undefined)) {
                            account['debt'] = Precise.stringAdd (loan, interest);
                        }
                        account['total'] = this.safeString (coinEntry, 'walletBalance');
                        account['free'] = this.safeString (coinEntry, 'availableToWithdraw');
                        // account['used'] = this.safeString (coinEntry, 'locked');
                        const currencyId = this.safeString (coinEntry, 'coin');
                        const code = this.safeCurrencyCode (currencyId);
                        result[code] = account;
                    }
                } else {
                    const account = this.account ();
                    const loan = this.safeString (entry, 'loan');
                    const interest = this.safeString (entry, 'interest');
                    if ((loan !== undefined) && (interest !== undefined)) {
                        account['debt'] = Precise.stringAdd (loan, interest);
                    }
                    account['total'] = this.safeString2 (entry, 'total', 'walletBalance');
                    account['free'] = this.safeStringN (entry, [ 'free', 'availableBalanceWithoutConvert', 'availableBalance', 'transferBalance' ]);
                    account['used'] = this.safeString (entry, 'locked');
                    const currencyId = this.safeStringN (entry, [ 'tokenId', 'coin', 'currencyCoin' ]);
                    const code = this.safeCurrencyCode (currencyId);
                    result[code] = account;
                }
            }
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bybit#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let method = undefined;
        const [ enableUnifiedMargin, enableUnifiedAccount ] = await this.isUnifiedEnabled ();
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const isSpot = (type === 'spot');
        if (isSpot) {
            if (enableUnifiedAccount || enableUnifiedMargin) {
                method = 'privateGetSpotV3PrivateAccount';
            } else {
                let marginMode = undefined;
                [ marginMode, params ] = this.handleMarginModeAndParams ('fetchBalance', params);
                if (marginMode !== undefined) {
                    method = 'privateGetSpotV3PrivateCrossMarginAccount';
                } else {
                    method = 'privateGetSpotV3PrivateAccount';
                }
            }
        } else if (enableUnifiedAccount || enableUnifiedMargin) {
            if (type === 'swap') {
                type = 'unified';
            }
        } else {
            if (type === 'swap') {
                type = 'contract';
            }
        }
        if (!isSpot) {
            const accountTypes = this.safeValue (this.options, 'accountsByType', {});
            const unifiedType = this.safeStringUpper (accountTypes, type, type);
            if (unifiedType === 'FUND') {
                // use this endpoint only we have no other choice
                // because it requires transfer permission
                method = 'privateGetAssetV3PrivateTransferAccountCoinsBalanceQuery';
                request['accountType'] = unifiedType;
            } else {
                if (enableUnifiedAccount) {
                    method = 'privateGetV5AccountWalletBalance';
                    request['accountType'] = unifiedType;
                } else if (enableUnifiedMargin) {
                    method = 'privateGetUnifiedV3PrivateAccountWalletBalance';
                } else {
                    method = 'privateGetContractV3PrivateAccountWalletBalance';
                    request['accountType'] = unifiedType;
                }
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot wallet
        //     {
        //       retCode: '0',
        //       retMsg: 'OK',
        //       result: {
        //         balances: [
        //           {
        //             coin: 'BTC',
        //             coinId: 'BTC',
        //             total: '0.00977041118',
        //             free: '0.00877041118',
        //             locked: '0.001'
        //           },
        //           {
        //             coin: 'EOS',
        //             coinId: 'EOS',
        //             total: '2000',
        //             free: '2000',
        //             locked: '0'
        //           }
        //         ]
        //       },
        //       retExtInfo: {},
        //       time: '1670002625754'
        //     }
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
        // all coins balance
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
        return this.parseBalance (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            // v3 spot
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PENDING_CANCEL': 'open',
            'PENDING_NEW': 'open',
            'REJECTED': 'rejected',
            'PARTIALLY_FILLED_CANCELLED': 'canceled',
            // v3 contract / unified margin / unified account
            'Created': 'open',
            'New': 'open',
            'Rejected': 'rejected', // order is triggered but failed upon being placed
            'PartiallyFilled': 'open',
            'PartiallyFilledCanceled': 'canceled',
            'Filled': 'closed',
            'PendingCancel': 'open',
            'Cancelled': 'canceled',
            // below this line the status only pertains to conditional orders
            'Untriggered': 'open',
            'Deactivated': 'canceled',
            'Triggered': 'open',
            'Active': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseTimeInForce (timeInForce) {
        const timeInForces = {
            'GoodTillCancel': 'GTC',
            'ImmediateOrCancel': 'IOC',
            'FillOrKill': 'FOK',
            'PostOnly': 'PO',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseOrder (order, market = undefined) {
        const orderCategoryExists = ('orderCategory' in order);
        if (orderCategoryExists) {
            return this.parseSpotOrder (order, market);
        }
        return this.parseContractOrder (order, market);
    }

    parseContractOrder (order, market = undefined) {
        //
        // contract v3
        //
        //     {
        //         "symbol": "XRPUSDT",
        //         "side": "Buy",
        //         "orderType": "Market",
        //         "price": "0.3431",
        //         "qty": "65",
        //         "reduceOnly": true,
        //         "timeInForce": "ImmediateOrCancel",
        //         "orderStatus": "Filled",
        //         "leavesQty": "0",
        //         "leavesValue": "0",
        //         "cumExecQty": "65",
        //         "cumExecValue": "21.3265",
        //         "cumExecFee": "0.0127959",
        //         "lastPriceOnCreated": "0.0000",
        //         "rejectReason": "EC_NoError",
        //         "orderLinkId": "",
        //         "createdTime": "1657526321499",
        //         "updatedTime": "1657526321504",
        //         "orderId": "ac0a8134-acb3-4ee1-a2d4-41891c9c46d7",
        //         "stopOrderType": "UNKNOWN",
        //         "takeProfit": "0.0000",
        //         "stopLoss": "0.0000",
        //         "tpTriggerBy": "UNKNOWN",
        //         "slTriggerBy": "UNKNOWN",
        //         "triggerPrice": "0.0000",
        //         "closeOnTrigger": true,
        //         "triggerDirection": 0,
        //         "positionIdx": 2
        //     }
        //
        //     {
        //         "orderId":"0b3499a4-9691-40ec-b2b9-7d94ee0165ff",
        //         "orderLinkId":"",
        //         "mmp":false,
        //         "symbol":"SOLPERP",
        //         "orderType":"Market",
        //         "side":"Buy",
        //         "orderQty":"0.10000000",
        //         "orderPrice":"23.030",
        //         "iv":"0",
        //         "timeInForce":"ImmediateOrCancel",
        //         "orderStatus":"Created",
        //         "createdAt":"1683380752146568",
        //         "basePrice":"0.000",
        //         "triggerPrice":"0.000",
        //         "takeProfit":"0.000",
        //         "stopLoss":"0.000",
        //         "slTriggerBy":"UNKNOWN",
        //         "tpTriggerBy":"UNKNOWN"
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        let marketType = 'contract';
        if (market !== undefined) {
            marketType = market['type'];
        }
        const category = this.safeString (order, 'category');
        if (category !== undefined) {
            if (category === 'spot') {
                marketType = 'spot';
            }
        }
        market = this.safeMarket (marketId, market, undefined, marketType);
        const symbol = market['symbol'];
        let timestamp = undefined;
        if ('createdTime' in order) {
            timestamp = this.safeInteger (order, 'createdTime');
        } else if ('createdAt' in order) {
            timestamp = this.safeIntegerProduct (order, 'createdAt', 0.001);
        }
        const id = this.safeString (order, 'orderId');
        const type = this.safeStringLower (order, 'orderType');
        const price = this.safeString2 (order, 'price', 'orderPrice');
        const amount = this.safeString2 (order, 'qty', 'orderQty');
        const cost = this.safeString (order, 'cumExecValue');
        const filled = this.safeString (order, 'cumExecQty');
        const remaining = this.safeString (order, 'leavesQty');
        const lastTradeTimestamp = this.safeInteger (order, 'updatedTime');
        const rawStatus = this.safeString (order, 'orderStatus');
        const status = this.parseOrderStatus (rawStatus);
        const side = this.safeStringLower (order, 'side');
        let fee = undefined;
        const feeCostString = this.safeString (order, 'cumExecFee');
        if (feeCostString !== undefined) {
            fee = {
                'cost': feeCostString,
                'currency': market['settle'],
            };
        }
        let clientOrderId = this.safeString (order, 'orderLinkId');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined;
        }
        const rawTimeInForce = this.safeString (order, 'timeInForce');
        const timeInForce = this.parseTimeInForce (rawTimeInForce);
        const stopPrice = this.omitZero (this.safeString (order, 'triggerPrice'));
        const takeProfitPrice = this.omitZero (this.safeString (order, 'takeProfit'));
        const stopLossPrice = this.omitZero (this.safeString (order, 'stopLoss'));
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'reduceOnly': this.safeValue (order, 'reduceOnly'),
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'takeProfitPrice': takeProfitPrice,
            'stopLossPrice': stopLossPrice,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    parseSpotOrder (order, market = undefined) {
        //
        //  createOrder, cancelOrer
        //
        //     {
        //         "orderId": "1274754916287346280",
        //         "orderLinkId": "1666798627015730",
        //         "symbol": "AAVEUSDT",
        //         "createTime": "1666698629821",
        //         "orderPrice": "80",
        //         "orderQty": "0.11",
        //         "orderType": "LIMIT",
        //         "side": "BUY",
        //         "status": "NEW",
        //         "timeInForce": "GTC",
        //         "accountId": "13380434",
        //         "execQty": "0",
        //         "orderCategory": "0"
        //     }
        //
        //     fetchOrder, fetchOpenOrders, fetchClosedOrders (and also for conditional orders) there are also present these additional fields:
        //     {
        //         "cummulativeQuoteQty": "0",
        //         "avgPrice": "0",
        //         "stopPrice": "0.0",
        //         "icebergQty": "0.0",
        //         "updateTime": "1666733357444",
        //         "isWorking": "1",
        //         "locked": "8.8",
        //         "executedOrderId": "1279094037543962113", // in conditional order
        //         "triggerPrice": "0.99", // in conditional order
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market, undefined, 'spot');
        const timestamp = this.safeInteger (order, 'createTime');
        const type = this.safeStringLower (order, 'orderType');
        let price = this.safeString (order, 'orderPrice');
        if (price === '0' && type === 'market') {
            price = undefined;
        }
        const filled = this.safeString (order, 'execQty');
        const side = this.safeStringLower (order, 'side');
        const timeInForce = this.parseTimeInForce (this.safeString (order, 'timeInForce'));
        const triggerPrice = this.safeString (order, 'triggerPrice');
        const postOnly = (timeInForce === 'PO');
        let amount = undefined;
        if (market['spot'] && type === 'market' && side === 'buy') {
            amount = filled;
        } else {
            amount = this.safeString (order, 'orderQty');
        }
        return this.safeOrder ({
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': this.safeString (order, 'orderLinkId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.safeInteger (order, 'updateTime'),
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'triggerPrice': triggerPrice,
            'stopPrice': triggerPrice, // deprecated field
            'amount': amount,
            'cost': this.safeString (order, 'cummulativeQuoteQty'),
            'average': this.safeString (order, 'avgPrice'),
            'filled': filled,
            'remaining': undefined,
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'fee': undefined,
            'trades': undefined,
            'info': order,
        }, market);
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
        const accounts = await this.isUnifiedEnabled ();
        const isUnifiedAccount = this.safeValue (accounts, 1, false);
        if (isUnifiedAccount) {
            throw new NotSupported (this.id + ' fetchOrder() does not support unified account. Please consider using fetchOpenOrders() or fetchClosedOrders()');
        }
        if (type === 'spot') {
            // only spot markets have a dedicated endpoint for fetching a order
            const request = {
                'orderId': id,
            };
            const response = await this.privateGetSpotV3PrivateOrder (this.extend (params, request));
            //
            //    {
            //        "retCode": "0",
            //        "retMsg": "OK",
            //        "result": {
            //            "accountId": "13380434",
            //            "symbol": "AAVEUSDT",
            //            "orderLinkId": "1666733357434617",
            //            "orderId": "1275046248585414144",
            //            "orderPrice": "80",
            //            "orderQty": "0.11",
            //            "execQty": "0",
            //            "cummulativeQuoteQty": "0",
            //            "avgPrice": "0",
            //            "status": "NEW",
            //            "timeInForce": "GTC",
            //            "orderType": "LIMIT",
            //            "side": "BUY",
            //            "stopPrice": "0.0",
            //            "icebergQty": "0.0",
            //            "createTime": "1666733357438",
            //            "updateTime": "1666733357444",
            //            "isWorking": "1",
            //            "locked": "8.8",
            //            "orderCategory": "0"
            //        },
            //        "retExtMap": {},
            //        "retExtInfo": null,
            //        "time": "1666733357744"
            //    }
            //
            const result = this.safeValue (response, 'result', {});
            return this.parseOrder (result, market);
        } else {
            this.checkRequiredSymbol ('fetchOrder', symbol);
            const request = {
                'orderId': id,
            };
            const result = await this.fetchOrders (symbol, undefined, undefined, this.extend (request, params));
            const length = result.length;
            if (length === 0) {
                throw new OrderNotFound ('Order ' + id + ' does not exist.');
            }
            if (length > 1) {
                throw new InvalidOrder (this.id + ' returned more than one order');
            }
            return this.safeValue (result, 0);
        }
    }

    async createOrder (symbol: string, type, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bybit#createOrder
         * @description create a trade order
         * @see https://bybit-exchange.github.io/docs/v5/order/create-order
         * @see https://bybit-exchange.github.io/docs/spot/trade/place-order
         * @see https://bybit-exchange.github.io/docs/derivatives/unified/place-order
         * @see https://bybit-exchange.github.io/docs/derivatives/contract/place-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        this.checkRequiredSymbol ('createOrder', symbol);
        const market = this.market (symbol);
        symbol = market['symbol'];
        const [ enableUnifiedMargin, enableUnifiedAccount ] = await this.isUnifiedEnabled ();
        const isUSDCSettled = market['settle'] === 'USDC';
        if (enableUnifiedAccount && !market['inverse']) {
            return await this.createUnifiedAccountOrder (symbol, type, side, amount, price, params);
        } else if (market['spot']) {
            return await this.createSpotOrder (symbol, type, side, amount, price, params);
        } else if (enableUnifiedMargin && !market['inverse']) {
            return await this.createUnifiedMarginOrder (symbol, type, side, amount, price, params);
        } else if (isUSDCSettled) {
            return await this.createUsdcOrder (symbol, type, side, amount, price, params);
        } else {
            return await this.createContractV3Order (symbol, type, side, amount, price, params);
        }
    }

    async createUnifiedAccountOrder (symbol: string, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const lowerCaseType = type.toLowerCase ();
        if ((price === undefined) && (lowerCaseType === 'limit')) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a price argument for limit orders');
        }
        const request = {
            'symbol': market['id'],
            'side': this.capitalize (side),
            'orderType': this.capitalize (lowerCaseType), // limit or market
            // 'timeInForce': 'GTC', // IOC, FOK, PostOnly
            // 'takeProfit': 123.45, // take profit price, only take effect upon opening the position
            // 'stopLoss': 123.45, // stop loss price, only take effect upon opening the position
            // 'reduceOnly': false, // reduce only, required for linear orders
            // when creating a closing order, bybit recommends a True value for
            //  closeOnTrigger to avoid failing due to insufficient available margin
            // 'closeOnTrigger': false, required for linear orders
            // 'orderLinkId': 'string', // unique client order id, max 36 characters
            // 'triggerPrice': 123.45, // trigger price, required for conditional orders
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
        if (market['spot']) {
            request['category'] = 'spot';
        } else if (market['linear']) {
            request['category'] = 'linear';
        } else if (market['option']) {
            request['category'] = 'option';
        } else {
            throw new NotSupported (this.id + ' createOrder does not allow inverse market orders for ' + symbol + ' markets');
        }
        if (market['spot'] && (type === 'market') && (side === 'buy')) {
            // for market buy it requires the amount of quote currency to spend
            if (this.options['createMarketBuyOrderRequiresPrice']) {
                const cost = this.safeNumber (params, 'cost');
                params = this.omit (params, 'cost');
                if (price === undefined && cost === undefined) {
                    throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                } else {
                    const amountString = this.numberToString (amount);
                    const priceString = this.numberToString (price);
                    const quoteAmount = Precise.stringMul (amountString, priceString);
                    amount = (cost !== undefined) ? cost : this.parseNumber (quoteAmount);
                    request['qty'] = this.costToPrecision (symbol, amount);
                }
            } else {
                request['qty'] = this.costToPrecision (symbol, amount);
            }
        } else {
            request['qty'] = this.amountToPrecision (symbol, amount);
        }
        const isMarket = lowerCaseType === 'market';
        const isLimit = lowerCaseType === 'limit';
        if (isLimit) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const timeInForce = this.safeStringLower (params, 'timeInForce'); // this is same as exchange specific param
        let postOnly = undefined;
        [ postOnly, params ] = this.handlePostOnly (isMarket, timeInForce === 'PostOnly', params);
        if (postOnly) {
            request['timeInForce'] = 'PostOnly';
        } else if (timeInForce === 'gtc') {
            request['timeInForce'] = 'GTC';
        } else if (timeInForce === 'fok') {
            request['timeInForce'] = 'FOK';
        } else if (timeInForce === 'ioc') {
            request['timeInForce'] = 'IOC';
        }
        let triggerPrice = this.safeNumber2 (params, 'triggerPrice', 'stopPrice');
        const stopLossTriggerPrice = this.safeNumber (params, 'stopLossPrice');
        const takeProfitTriggerPrice = this.safeNumber (params, 'takeProfitPrice');
        const stopLoss = this.safeNumber (params, 'stopLoss');
        const takeProfit = this.safeNumber (params, 'takeProfit');
        const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
        const isStopLoss = stopLoss !== undefined;
        const isTakeProfit = takeProfit !== undefined;
        const isBuy = side === 'buy';
        const ascending = stopLossTriggerPrice ? !isBuy : isBuy;
        if (triggerPrice !== undefined) {
            request['triggerDirection'] = ascending ? 2 : 1;
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
        } else if (isStopLossTriggerOrder || isTakeProfitTriggerOrder) {
            request['triggerDirection'] = ascending ? 2 : 1;
            triggerPrice = isStopLossTriggerOrder ? stopLossTriggerPrice : takeProfitTriggerPrice;
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
            request['reduceOnly'] = true;
        } else if (isStopLoss || isTakeProfit) {
            if (isStopLoss) {
                request['stopLoss'] = this.priceToPrecision (symbol, stopLoss);
            }
            if (isTakeProfit) {
                request['takeProfit'] = this.priceToPrecision (symbol, takeProfit);
            }
        }
        if (market['spot']) {
            // only works for spot market
            if (triggerPrice !== undefined || stopLossTriggerPrice !== undefined || takeProfitTriggerPrice !== undefined || isStopLoss || isTakeProfit) {
                request['orderFilter'] = 'tpslOrder';
            }
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['orderLinkId'] = clientOrderId;
        } else if (market['option']) {
            // mandatory field for options
            request['orderLinkId'] = this.uuid16 ();
        }
        params = this.omit (params, [ 'stopPrice', 'timeInForce', 'stopLossPrice', 'takeProfitPrice', 'postOnly', 'clientOrderId', 'triggerPrice', 'stopLoss', 'takeProfit' ]);
        const response = await this.privatePostV5OrderCreate (this.extend (request, params));
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
        const order = this.safeValue (response, 'result', {});
        return this.parseOrder (order);
    }

    async createSpotOrder (symbol: string, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const upperCaseType = type.toUpperCase ();
        const request = {
            'symbol': market['id'],
            'side': this.capitalize (side),
            'orderType': upperCaseType, // limit, market or limit_maker
            'timeInForce': 'GTC', // FOK, IOC
            // 'orderLinkId': 'string', // unique client order id, max 36 characters
        };
        if ((type === 'market') && (side === 'buy')) {
            // for market buy it requires the amount of quote currency to spend
            if (this.options['createMarketBuyOrderRequiresPrice']) {
                const cost = this.safeNumber (params, 'cost');
                params = this.omit (params, 'cost');
                if (price === undefined && cost === undefined) {
                    throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                } else {
                    const amountString = this.numberToString (amount);
                    const priceString = this.numberToString (price);
                    const quoteAmount = Precise.stringMul (amountString, priceString);
                    amount = (cost !== undefined) ? cost : this.parseNumber (quoteAmount);
                    request['orderQty'] = this.costToPrecision (symbol, amount);
                }
            } else {
                request['orderQty'] = this.costToPrecision (symbol, amount);
            }
        } else {
            request['orderQty'] = this.amountToPrecision (symbol, amount);
        }
        if ((upperCaseType === 'LIMIT') || (upperCaseType === 'LIMIT_MAKER')) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder requires a price argument for a ' + type + ' order');
            }
            request['orderPrice'] = this.priceToPrecision (symbol, price);
        }
        const isMarket = (upperCaseType === 'MARKET');
        let postOnly = undefined;
        [ postOnly, params ] = this.handlePostOnly (isMarket, type === 'LIMIT_MAKER', params);
        if (postOnly) {
            request['orderType'] = 'LIMIT_MAKER';
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'orderLinkId');
        if (clientOrderId !== undefined) {
            request['orderLinkId'] = clientOrderId;
        }
        params = this.omit (params, [ 'clientOrderId', 'orderLinkId', 'postOnly' ]);
        const brokerId = this.safeString (this.options, 'brokerId');
        if (brokerId !== undefined) {
            request['agentSource'] = brokerId;
        }
        const triggerPrice = this.safeNumber2 (params, 'triggerPrice', 'stopPrice');
        if (triggerPrice !== undefined) {
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
        }
        params = this.omit (params, 'stopPrice');
        const response = await this.privatePostSpotV3PrivateOrder (this.extend (request, params));
        //
        //    {
        //        "retCode": "0",
        //        "retMsg": "OK",
        //        "result": {
        //            "orderId": "1274754916287346280",
        //            "orderLinkId": "1666798627015730",
        //            "symbol": "AAVEUSDT",
        //            "createTime": "1666698629821",
        //            "orderPrice": "80",
        //            "orderQty": "0.11",
        //            "orderType": "LIMIT",
        //            "side": "BUY",
        //            "status": "NEW",
        //            "timeInForce": "GTC",
        //            "accountId": "13380434",
        //            "execQty": "0",
        //            "orderCategory": "0"
        //        },
        //        "retExtMap": {},
        //        "retExtInfo": null,
        //        "time": "1666698627926"
        //    }
        //
        const order = this.safeValue (response, 'result', {});
        return this.parseOrder (order);
    }

    async createUnifiedMarginOrder (symbol: string, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['linear'] && !market['option']) {
            throw new NotSupported (this.id + ' createOrder does not allow inverse market orders for ' + symbol + ' markets');
        }
        const lowerCaseType = type.toLowerCase ();
        if ((price === undefined) && (lowerCaseType === 'limit')) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a price argument for limit orders');
        }
        const request = {
            'symbol': market['id'],
            'side': this.capitalize (side),
            'orderType': this.capitalize (lowerCaseType), // limit or market
            'timeInForce': 'GoodTillCancel', // ImmediateOrCancel, FillOrKill, PostOnly
            'qty': this.amountToPrecision (symbol, amount),
            // 'takeProfit': 123.45, // take profit price, only take effect upon opening the position
            // 'stopLoss': 123.45, // stop loss price, only take effect upon opening the position
            // 'reduceOnly': false, // reduce only, required for linear orders
            // when creating a closing order, bybit recommends a True value for
            //  closeOnTrigger to avoid failing due to insufficient available margin
            // 'closeOnTrigger': false, required for linear orders
            // 'orderLinkId': 'string', // unique client order id, max 36 characters
            // 'triggerPrice': 123.45, // trigger price, required for conditional orders
            // 'triggerBy': 'MarkPrice', // IndexPrice, MarkPrice
            // 'tptriggerby': 'MarkPrice', // IndexPrice, MarkPrice
            // 'slTriggerBy': 'MarkPrice', // IndexPrice, MarkPrice
            // 'mmp': false // market maker protection
            // 'positionIdx': 0, // Position mode. unified margin account is only available in One-Way mode, which is 0
            // 'basePrice': '0', // It will be used to compare with the value of triggerPrice, to decide whether your conditional order will be triggered by crossing trigger price from upper side or lower side. Mainly used to identify the expected direction of the current conditional order.
            // 'iv': '0', // Implied volatility, for options only; parameters are passed according to the real value; for example, for 10%, 0.1 is passed
        };
        if (market['linear']) {
            request['category'] = 'linear';
        } else {
            request['category'] = 'option';
        }
        const isMarket = lowerCaseType === 'market';
        const isLimit = lowerCaseType === 'limit';
        if (isLimit) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const exchangeSpecificParam = this.safeString (params, 'time_in_force');
        const timeInForce = this.safeStringLower (params, 'timeInForce');
        let postOnly = undefined;
        [ postOnly, params ] = this.handlePostOnly (isMarket, exchangeSpecificParam === 'PostOnly', params);
        if (postOnly) {
            request['timeInForce'] = 'PostOnly';
        } else if (timeInForce === 'gtc') {
            request['timeInForce'] = 'GoodTillCancel';
        } else if (timeInForce === 'fok') {
            request['timeInForce'] = 'FillOrKill';
        } else if (timeInForce === 'ioc') {
            request['timeInForce'] = 'ImmediateOrCancel';
        }
        const triggerPrice = this.safeNumber2 (params, 'stopPrice', 'triggerPrice');
        const stopLossTriggerPrice = this.safeNumber (params, 'stopLossPrice', triggerPrice);
        const takeProfitTriggerPrice = this.safeNumber (params, 'takeProfitPrice');
        const stopLoss = this.safeNumber (params, 'stopLoss');
        const takeProfit = this.safeNumber (params, 'takeProfit');
        const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
        const isStopLoss = stopLoss !== undefined;
        const isTakeProfit = takeProfit !== undefined;
        if (isStopLossTriggerOrder || isTakeProfitTriggerOrder) {
            request['triggerBy'] = 'LastPrice';
            const triggerAt = isStopLossTriggerOrder ? stopLossTriggerPrice : takeProfitTriggerPrice;
            const preciseTriggerPrice = this.priceToPrecision (symbol, triggerAt);
            request['triggerPrice'] = preciseTriggerPrice;
            const isBuy = side === 'buy';
            // logical xor
            const ascending = stopLossTriggerPrice ? !isBuy : isBuy;
            const delta = this.numberToString (market['precision']['price']);
            request['basePrice'] = ascending ? Precise.stringAdd (preciseTriggerPrice, delta) : Precise.stringSub (preciseTriggerPrice, delta);
        } else if (isStopLoss || isTakeProfit) {
            if (isStopLoss) {
                request['stopLoss'] = this.priceToPrecision (symbol, stopLoss);
            }
            if (isTakeProfit) {
                request['takeProfit'] = this.priceToPrecision (symbol, takeProfit);
            }
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['orderLinkId'] = clientOrderId;
        } else if (market['option']) {
            // mandatory field for options
            request['orderLinkId'] = this.uuid16 ();
        }
        params = this.omit (params, [ 'stopPrice', 'timeInForce', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'postOnly', 'clientOrderId', 'stopLoss', 'takeProfit' ]);
        const response = await this.privatePostUnifiedV3PrivateOrderCreate (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "orderId": "e10b0716-7c91-4091-b98a-1fa0f401c7d5",
        //             "orderLinkId": "test0000003"
        //         },
        //         "retExtInfo": null,
        //         "time": 1664441344238
        //     }
        //
        const order = this.safeValue (response, 'result', {});
        return this.parseOrder (order);
    }

    async createContractV3Order (symbol: string, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const lowerCaseType = type.toLowerCase ();
        if ((price === undefined) && (lowerCaseType === 'limit')) {
            throw new ArgumentsRequired (this.id + ' createContractV3Order requires a price argument for limit orders');
        }
        const request = {
            'symbol': market['id'],
            'side': this.capitalize (side),
            'orderType': this.capitalize (lowerCaseType), // limit or market
            'timeInForce': 'GoodTillCancel', // ImmediateOrCancel, FillOrKill, PostOnly
            'qty': this.amountToPrecision (symbol, amount),
            // 'takeProfit': 123.45, // take profit price, only take effect upon opening the position
            // 'stopLoss': 123.45, // stop loss price, only take effect upon opening the position
            // 'reduceOnly': false, // reduce only, required for linear orders
            // when creating a closing order, bybit recommends a True value for
            //  closeOnTrigger to avoid failing due to insufficient available margin
            // 'closeOnTrigger': false, required for linear orders
            // 'orderLinkId': 'string', // unique client order id, max 36 characters
            // 'triggerPrice': 123.45, // trigger price, required for conditional orders
            // 'triggerBy': 'MarkPrice', // IndexPrice, MarkPrice
            // 'tptriggerby': 'MarkPrice', // IndexPrice, MarkPrice
            // 'slTriggerBy': 'MarkPrice', // IndexPrice, MarkPrice
            // 'positionIdx': 0, // Position mode. unified margin account is only available in One-Way mode, which is 0
            // 'triggerDirection': 1, // Trigger direction. Mainly used in conditional order. Trigger the order when market price rises to triggerPrice or falls to triggerPrice. 1: rise; 2: fall
        };
        if (market['future']) {
            const positionIdx = this.safeInteger (params, 'position_idx', 0); // 0 One-Way Mode, 1 Buy-side, 2 Sell-side
            request['position_idx'] = positionIdx;
            params = this.omit (params, 'position_idx');
        }
        const isMarket = lowerCaseType === 'market';
        const isLimit = lowerCaseType === 'limit';
        if (isLimit) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const timeInForce = this.safeStringLower (params, 'timeInForce'); // same as exchange specific param
        let postOnly = undefined;
        [ postOnly, params ] = this.handlePostOnly (isMarket, timeInForce === 'PostOnly', params);
        if (postOnly) {
            request['timeInForce'] = 'PostOnly';
        } else if (timeInForce === 'gtc') {
            request['timeInForce'] = 'GoodTillCancel';
        } else if (timeInForce === 'fok') {
            request['timeInForce'] = 'FillOrKill';
        } else if (timeInForce === 'ioc') {
            request['timeInForce'] = 'ImmediateOrCancel';
        }
        let triggerPrice = this.safeNumber2 (params, 'triggerPrice', 'stopPrice');
        const stopLossTriggerPrice = this.safeNumber (params, 'stopLossPrice', triggerPrice);
        const takeProfitTriggerPrice = this.safeNumber (params, 'takeProfitPrice');
        const stopLoss = this.safeNumber (params, 'stopLoss');
        const takeProfit = this.safeNumber (params, 'takeProfit');
        const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
        const isStopLoss = stopLoss !== undefined;
        const isTakeProfit = takeProfit !== undefined;
        const isBuy = side === 'buy';
        const ascending = stopLossTriggerPrice ? !isBuy : isBuy;
        if (triggerPrice !== undefined) {
            request['triggerDirection'] = ascending ? 2 : 1;
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
        } else if (isStopLossTriggerOrder || isTakeProfitTriggerOrder) {
            request['triggerDirection'] = ascending ? 2 : 1;
            triggerPrice = isStopLossTriggerOrder ? stopLossTriggerPrice : takeProfitTriggerPrice;
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
            request['reduceOnly'] = true;
        } else if (isStopLoss || isTakeProfit) {
            if (isStopLoss) {
                request['stopLoss'] = this.priceToPrecision (symbol, stopLoss);
            }
            if (isTakeProfit) {
                request['takeProfit'] = this.priceToPrecision (symbol, takeProfit);
            }
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['orderLinkId'] = clientOrderId;
        } else if (market['option']) {
            // mandatory field for options
            request['orderLinkId'] = this.uuid16 ();
        }
        params = this.omit (params, [ 'stopPrice', 'timeInForce', 'stopLossPrice', 'takeProfitPrice', 'postOnly', 'clientOrderId', 'triggerPrice', 'stopLoss', 'takeProfit' ]);
        const response = await this.privatePostContractV3PrivateOrderCreate (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "orderId": "e10b0716-7c91-4091-b98a-1fa0f401c7d5",
        //             "orderLinkId": "test0000003"
        //         },
        //         "retExtInfo": null,
        //         "time": 1664441344238
        //     }
        //
        const order = this.safeValue (response, 'result', {});
        return this.parseOrder (order);
    }

    async createUsdcOrder (symbol: string, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const lowerCaseType = type.toLowerCase ();
        if ((price === undefined) && (lowerCaseType === 'limit')) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a price argument for limit orders');
        }
        const request = {
            'symbol': market['id'],
            'side': this.capitalize (side),
            'orderType': this.capitalize (lowerCaseType), // limit or market
            'timeInForce': 'GoodTillCancel', // ImmediateOrCancel, FillOrKill, PostOnly
            'orderQty': this.amountToPrecision (symbol, amount),
            // 'takeProfit': 123.45, // take profit price, only take effect upon opening the position
            // 'stopLoss': 123.45, // stop loss price, only take effect upon opening the position
            // 'reduceOnly': false, // reduce only, required for linear orders
            // when creating a closing order, bybit recommends a True value for
            //  closeOnTrigger to avoid failing due to insufficient available margin
            // 'closeOnTrigger': false, required for linear orders
            // 'orderLinkId': 'string', // unique client order id, max 36 characters
            // 'triggerPrice': 123.45, // trigger price, required for conditional orders
            // 'trigger_by': 'MarkPrice', // IndexPrice, MarkPrice
            // 'tptriggerby': 'MarkPrice', // IndexPrice, MarkPrice
            // 'slTriggerBy': 'MarkPrice', // IndexPrice, MarkPrice
            // 'orderFilter': 'Order' or 'StopOrder'
            // 'mmp': false // market maker protection
        };
        const isMarket = lowerCaseType === 'market';
        const isLimit = lowerCaseType === 'limit';
        if (isLimit) {
            request['orderPrice'] = this.priceToPrecision (symbol, price);
        }
        const exchangeSpecificParam = this.safeString (params, 'time_in_force');
        const timeInForce = this.safeStringLower (params, 'timeInForce');
        let postOnly = undefined;
        [ postOnly, params ] = this.handlePostOnly (isMarket, exchangeSpecificParam === 'PostOnly', params);
        if (postOnly) {
            request['time_in_force'] = 'PostOnly';
        } else if (timeInForce === 'gtc') {
            request['time_in_force'] = 'GoodTillCancel';
        } else if (timeInForce === 'fok') {
            request['time_in_force'] = 'FillOrKill';
        } else if (timeInForce === 'ioc') {
            request['time_in_force'] = 'ImmediateOrCancel';
        }
        if (market['swap']) {
            const triggerPrice = this.safeNumber2 (params, 'stopPrice', 'triggerPrice');
            const stopLossTriggerPrice = this.safeNumber (params, 'stopLossPrice', triggerPrice);
            const takeProfitTriggerPrice = this.safeNumber (params, 'takeProfitPrice');
            const stopLoss = this.safeNumber (params, 'stopLoss');
            const takeProfit = this.safeNumber (params, 'takeProfit');
            const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
            const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
            const isStopLoss = stopLoss !== undefined;
            const isTakeProfit = takeProfit !== undefined;
            const isStopOrder = isStopLossTriggerOrder || isTakeProfitTriggerOrder;
            if (isStopOrder) {
                request['orderFilter'] = 'StopOrder';
                request['trigger_by'] = 'LastPrice';
                const stopPx = isStopLossTriggerOrder ? stopLossTriggerPrice : takeProfitTriggerPrice;
                const preciseStopPrice = this.priceToPrecision (symbol, stopPx);
                request['triggerPrice'] = preciseStopPrice;
                const delta = this.numberToString (market['precision']['price']);
                request['basePrice'] = isStopLossTriggerOrder ? Precise.stringSub (preciseStopPrice, delta) : Precise.stringAdd (preciseStopPrice, delta);
            } else if (isStopLoss || isTakeProfit) {
                if (isStopLoss) {
                    request['stopLoss'] = this.priceToPrecision (symbol, stopLoss);
                }
                if (isTakeProfit) {
                    request['takeProfit'] = this.priceToPrecision (symbol, takeProfit);
                }
            } else {
                request['orderFilter'] = 'Order';
            }
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['orderLinkId'] = clientOrderId;
        } else if (market['option']) {
            // mandatory field for options
            request['orderLinkId'] = this.uuid16 ();
        }
        params = this.omit (params, [ 'stopPrice', 'timeInForce', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'postOnly', 'clientOrderId', 'stopLoss', 'takeProfit' ]);
        let response = undefined;
        if (market['option']) {
            response = await this.privatePostOptionUsdcOpenapiPrivateV1PlaceOrder (this.extend (request, params));
        } else {
            response = await this.privatePostPerpetualUsdcOpenapiPrivateV1PlaceOrder (this.extend (request, params));
        }
        //
        //     {
        //         "retCode":0,
        //         "retMsg":"",
        //         "result":{
        //            "orderId":"34450a59-325e-4296-8af0-63c7c524ae33",
        //            "orderLinkId":"",
        //            "mmp":false,
        //            "symbol":"BTCPERP",
        //            "orderType":"Limit",
        //            "side":"Buy",
        //            "orderQty":"0.00100000",
        //            "orderPrice":"20000.00",
        //            "iv":"0",
        //            "timeInForce":"GoodTillCancel",
        //            "orderStatus":"Created",
        //            "createdAt":"1652261746007873",
        //            "basePrice":"0.00",
        //            "triggerPrice":"0.00",
        //            "takeProfit":"0.00",
        //            "stopLoss":"0.00",
        //            "slTriggerBy":"UNKNOWN",
        //            "tpTriggerBy":"UNKNOWN"
        //     }
        //
        const order = this.safeValue (response, 'result', {});
        return this.parseOrder (order);
    }

    async editUnifiedAccountOrder (id: string, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['linear'] && !market['option']) {
            throw new NotSupported (this.id + ' editOrder does not allow inverse market orders for ' + symbol + ' markets');
        }
        const request = {
            'symbol': market['id'],
            'orderId': id,
            'qty': this.amountToPrecision (symbol, amount),
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
        if (market['linear']) {
            request['category'] = 'linear';
        } else {
            request['category'] = 'option';
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        let triggerPrice = this.safeNumber2 (params, 'triggerPrice', 'stopPrice');
        const stopLossTriggerPrice = this.safeNumber (params, 'stopLossPrice');
        const takeProfitTriggerPrice = this.safeNumber (params, 'takeProfitPrice');
        const stopLoss = this.safeNumber (params, 'stopLoss');
        const takeProfit = this.safeNumber (params, 'takeProfit');
        const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
        const isStopLoss = stopLoss !== undefined;
        const isTakeProfit = takeProfit !== undefined;
        if (isStopLossTriggerOrder || isTakeProfitTriggerOrder) {
            triggerPrice = isStopLossTriggerOrder ? stopLossTriggerPrice : takeProfitTriggerPrice;
        }
        if (triggerPrice !== undefined) {
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
        }
        if (isStopLoss || isTakeProfit) {
            if (isStopLoss) {
                request['stopLoss'] = this.priceToPrecision (symbol, stopLoss);
            }
            if (isTakeProfit) {
                request['takeProfit'] = this.priceToPrecision (symbol, takeProfit);
            }
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['orderLinkId'] = clientOrderId;
        }
        params = this.omit (params, [ 'stopPrice', 'stopLossPrice', 'takeProfitPrice', 'triggerPrice', 'clientOrderId', 'stopLoss', 'takeProfit' ]);
        const response = await this.privatePostV5OrderAmend (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        return {
            'info': response,
            'id': this.safeString (result, 'orderId'),
        };
    }

    async editUnifiedMarginOrder (id: string, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['linear'] && !market['option']) {
            throw new NotSupported (this.id + ' editOrder does not allow inverse market orders for ' + symbol + ' markets');
        }
        const lowerCaseType = type.toLowerCase ();
        if ((price === undefined) && (lowerCaseType === 'limit')) {
            throw new ArgumentsRequired (this.id + ' editOrder requires a price argument for limit orders');
        }
        const request = {
            'orderId': id,
            'symbol': market['id'],
            'side': this.capitalize (side),
            'orderType': this.capitalize (lowerCaseType), // limit or market
            'timeInForce': 'GoodTillCancel', // ImmediateOrCancel, FillOrKill, PostOnly
            'qty': this.amountToPrecision (symbol, amount),
            // 'takeProfit': 123.45, // take profit price, only take effect upon opening the position
            // 'stopLoss': 123.45, // stop loss price, only take effect upon opening the position
            // 'orderLinkId': 'string', // unique client order id, max 36 characters
            // 'triggerPrice': 123.45, // trigger price, required for conditional orders
            // 'triggerBy': 'MarkPrice', // IndexPrice, MarkPrice
            // 'tptriggerby': 'MarkPrice', // IndexPrice, MarkPrice
            // 'slTriggerBy': 'MarkPrice', // IndexPrice, MarkPrice
            // 'iv': '0', // Implied volatility, for options only; parameters are passed according to the real value; for example, for 10%, 0.1 is passed
        };
        if (market['linear']) {
            request['category'] = 'linear';
        } else {
            request['category'] = 'option';
        }
        const isMarket = lowerCaseType === 'market';
        const isLimit = lowerCaseType === 'limit';
        if (isLimit) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const exchangeSpecificParam = this.safeString (params, 'time_in_force');
        const timeInForce = this.safeStringLower (params, 'timeInForce');
        const postOnly = this.isPostOnly (isMarket, exchangeSpecificParam === 'PostOnly', params);
        if (postOnly) {
            request['timeInForce'] = 'PostOnly';
        } else if (timeInForce === 'gtc') {
            request['timeInForce'] = 'GoodTillCancel';
        } else if (timeInForce === 'fok') {
            request['timeInForce'] = 'FillOrKill';
        } else if (timeInForce === 'ioc') {
            request['timeInForce'] = 'ImmediateOrCancel';
        }
        let triggerPrice = this.safeNumber2 (params, 'triggerPrice', 'stopPrice');
        const stopLossTriggerPrice = this.safeNumber (params, 'stopLossPrice');
        const takeProfitTriggerPrice = this.safeNumber (params, 'takeProfitPrice');
        const stopLoss = this.safeNumber (params, 'stopLoss');
        const takeProfit = this.safeNumber (params, 'takeProfit');
        const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
        const isStopLoss = stopLoss !== undefined;
        const isTakeProfit = takeProfit !== undefined;
        if (isStopLossTriggerOrder || isTakeProfitTriggerOrder) {
            triggerPrice = isStopLossTriggerOrder ? stopLossTriggerPrice : takeProfitTriggerPrice;
        }
        if (triggerPrice !== undefined) {
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
        }
        if (isStopLoss || isTakeProfit) {
            if (isStopLoss) {
                request['stopLoss'] = this.priceToPrecision (symbol, stopLoss);
            }
            if (isTakeProfit) {
                request['takeProfit'] = this.priceToPrecision (symbol, takeProfit);
            }
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['orderLinkId'] = clientOrderId;
        }
        params = this.omit (params, [ 'stopPrice', 'timeInForce', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'postOnly', 'clientOrderId', 'stopLoss', 'takeProfit' ]);
        const response = await this.privatePostUnifiedV3PrivateOrderReplace (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "orderId": "42c86d66331e41998d12c2440ce90c1a",
        //             "orderLinkId": "e80d558e-ed"
        //         }
        //     }
        //
        const order = this.safeValue (response, 'result', {});
        return this.parseOrder (order);
    }

    async editContractV3Order (id: string, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'orderId': id,
            'qty': this.amountToPrecision (symbol, amount),
            // 'orderLinkId': '', // User customised order id. Either orderId or orderLinkId is required
            // 'triggerPrice': '', // Trigger price. Don't pass it if not modify the qty
            // 'takeProfit': '', // Take profit price after modification. Don't pass it if not modify the take profit
            // 'stopLoss': '', // Stop loss price after modification. Don't pass it if not modify the Stop loss
            // 'tpTriggerBy': '', // The price type to trigger take profit. When set a take profit, this param is required if no initial value for the order
            // 'slTriggerBy': '', // The price type to trigger stop loss. When set a stop loss, this param is required if no initial value for the order
            // 'triggerBy': '', // Trigger price type. LastPrice, IndexPrice, MarkPrice, LastPrice
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        let triggerPrice = this.safeNumber2 (params, 'triggerPrice', 'stopPrice');
        const stopLossTriggerPrice = this.safeNumber (params, 'stopLossPrice');
        const takeProfitTriggerPrice = this.safeNumber (params, 'takeProfitPrice');
        const stopLoss = this.safeNumber (params, 'stopLoss');
        const takeProfit = this.safeNumber (params, 'takeProfit');
        const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
        const isStopLoss = stopLoss !== undefined;
        const isTakeProfit = takeProfit !== undefined;
        if (isStopLossTriggerOrder || isTakeProfitTriggerOrder) {
            triggerPrice = isStopLossTriggerOrder ? stopLossTriggerPrice : takeProfitTriggerPrice;
        }
        if (triggerPrice !== undefined) {
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
        }
        if (isStopLoss || isTakeProfit) {
            if (isStopLoss) {
                request['stopLoss'] = this.priceToPrecision (symbol, stopLoss);
            }
            if (isTakeProfit) {
                request['takeProfit'] = this.priceToPrecision (symbol, takeProfit);
            }
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['orderLinkId'] = clientOrderId;
        }
        params = this.omit (params, [ 'stopPrice', 'stopLossPrice', 'takeProfitPrice', 'triggerPrice', 'clientOrderId', 'stopLoss', 'takeProfit' ]);
        const response = await this.privatePostContractV3PrivateOrderReplace (this.extend (request, params));
        //
        // contract v3
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "orderId": "db8b74b3-72d3-4264-bf3f-52d39b41956e",
        //             "orderLinkId": "x002"
        //         },
        //         "retExtInfo": {},
        //         "time": 1658902610749
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return {
            'info': response,
            'id': this.safeString (result, 'orderId'),
        };
    }

    async editOrder (id: string, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ enableUnifiedMargin, enableUnifiedAccount ] = await this.isUnifiedEnabled ();
        if (enableUnifiedAccount) {
            return await this.editUnifiedAccountOrder (id, symbol, type, side, amount, price, params);
        } else if (market['spot']) {
            throw new NotSupported (this.id + ' editOrder() does not support spot markets');
        } else if (enableUnifiedMargin && !market['inverse']) {
            return await this.editUnifiedMarginOrder (id, symbol, type, side, amount, price, params);
        }
        return await this.editContractV3Order (id, symbol, type, side, amount, price, params);
    }

    async cancelUnifiedAccountOrder (id: string, symbol: string = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'orderLinkId': 'string',
            // 'orderId': id,
            // conditional orders
            // 'orderFilter': '', // Valid for spot only. Order,tpslOrder. If not passed, Order by default
        };
        if (market['spot']) {
            // only works for spot market
            const isStop = this.safeValue (params, 'stop', false);
            params = this.omit (params, [ 'stop' ]);
            request['orderFilter'] = isStop ? 'tpslOrder' : 'Order';
        }
        if (id !== undefined) { // The user can also use argument params["orderLinkId"]
            request['orderId'] = id;
        }
        if (market['spot']) {
            request['category'] = 'spot';
        } else if (market['option']) {
            request['category'] = 'option';
        } else if (market['linear']) {
            request['category'] = 'linear';
        } else {
            throw new NotSupported (this.id + ' cancelOrder() does not allow inverse market orders for ' + symbol + ' markets');
        }
        const response = await this.privatePostV5OrderCancel (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result, market);
    }

    async cancelSpotOrder (id: string, symbol: string = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // 'order_link_id': 'string', // one of order_id, stop_order_id or order_link_id is required
            // 'orderId': id
        };
        if (id !== undefined) { // The user can also use argument params["order_link_id"]
            request['orderId'] = id;
        }
        const response = await this.privatePostSpotV3PrivateCancelOrder (this.extend (request, params));
        //
        //     {
        //         "retCode": "0",
        //         "retMsg": "OK",
        //         "result": {
        //             "orderId": "1275046248585414144",
        //             "orderLinkId": "1666733357434617",
        //             "symbol": "AAVEUSDT",
        //             "status": "NEW",
        //             "accountId": "13380434",
        //             "createTime": "1666733357438",
        //             "orderPrice": "80",
        //             "orderQty": "0.11",
        //             "execQty": "0",
        //             "timeInForce": "GTC",
        //             "orderType": "LIMIT",
        //             "side": "BUY",
        //             "orderCategory": "0"
        //         },
        //         "retExtMap": {},
        //         "retExtInfo": null,
        //         "time": "1666733839493"
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result, market);
    }

    async cancelUnifiedMarginOrder (id: string, symbol: string = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelUnifiedMarginOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'orderLinkId': 'string',
            // 'orderId': id,
            // conditional orders
            // 'orderFilter': '',
            // 'category': '',
        };
        const isStop = this.safeValue (params, 'stop', false);
        params = this.omit (params, [ 'stop' ]);
        request['orderFilter'] = isStop ? 'StopOrder' : 'Order';
        if (id !== undefined) { // The user can also use argument params["orderLinkId"]
            request['orderId'] = id;
        }
        if (market['option']) {
            request['category'] = 'option';
        } else if (market['linear']) {
            request['category'] = 'linear';
        } else {
            throw new NotSupported (this.id + ' cancelUnifiedMarginOrder() does not allow inverse market orders for ' + symbol + ' markets');
        }
        const response = await this.privatePostUnifiedV3PrivateOrderCancel (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "orderId": "42c86d66331e41998d12c2440ce90c1a",
        //             "orderLinkId": "e80d558e-ed"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result, market);
    }

    async cancelUSDCOrder (id: string, symbol: string = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelUSDCOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'orderLinkId': 'string', // one of order_id, stop_order_id or order_link_id is required
            // 'orderId': id,
        };
        const isStop = this.safeValue (params, 'stop', false);
        params = this.omit (params, [ 'stop' ]);
        let method = undefined;
        if (id !== undefined) { // The user can also use argument params["order_link_id"]
            request['orderId'] = id;
        }
        if (market['option']) {
            method = 'privatePostOptionUsdcOpenapiPrivateV1CancelOrder';
        } else {
            method = 'privatePostPerpetualUsdcOpenapiPrivateV1CancelOrder';
            request['orderFilter'] = isStop ? 'StopOrder' : 'Order';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "outRequestId": "",
        //             "symbol": "BTC-13MAY22-40000-C",
        //             "orderId": "8c65df91-91fc-461d-9b14-786379ef138c",
        //             "orderLinkId": ""
        //         },
        //         "retExtMap": {}
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result, market);
    }

    async cancelDerivativesOrder (id: string, symbol: string = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelDerivativesOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'orderId': id,
        };
        const response = await this.privatePostContractV3PrivateOrderCancel (this.extend (request, params));
        //
        // contract v3
        //
        //     {
        //         "retCode":0,
        //         "retMsg":"OK",
        //         "result":{
        //             "orderId": "4030430d-1dba-4134-ac77-3d81c14aaa00",
        //             "orderLinkId": ""
        //         },
        //         "retExtInfo":null,
        //         "time":1658850321861
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result, market);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bybit#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ enableUnifiedMargin, enableUnifiedAccount ] = await this.isUnifiedEnabled ();
        const isUsdcSettled = market['settle'] === 'USDC';
        if (enableUnifiedAccount) {
            return await this.cancelUnifiedAccountOrder (id, symbol, params);
        } else if (market['spot']) {
            return await this.cancelSpotOrder (id, symbol, params);
        } else if (enableUnifiedMargin && !market['inverse']) {
            return await this.cancelUnifiedMarginOrder (id, symbol, params);
        } else if (isUsdcSettled) {
            return await this.cancelUSDCOrder (id, symbol, params);
        }
        return await this.cancelDerivativesOrder (id, symbol, params);
    }

    async cancelAllUnifiedAccountOrders (symbol: string = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let settle = undefined;
        let type = undefined;
        let subType = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            settle = market['settle'];
            request['symbol'] = market['id'];
        } else {
            [ settle, params ] = this.handleOptionAndParams (params, 'cancelAllOrders', 'settle', 'USDT');
        }
        [ type, params ] = this.handleMarketTypeAndParams ('cancelAllOrders', market, params);
        [ subType, params ] = this.handleSubTypeAndParams ('cancelAllOrders', market, params, 'linear');
        if (type === 'spot') {
            request['category'] = 'spot';
        } else if (type === 'option') {
            request['category'] = 'option';
        } else if (subType === 'linear') {
            request['category'] = 'linear';
        } else {
            throw new NotSupported (this.id + ' cancelAllOrders() does not allow inverse market orders for ' + type + ' markets');
        }
        request['settleCoin'] = settle;
        const isStop = this.safeValue (params, 'stop', false);
        params = this.omit (params, [ 'stop' ]);
        if (isStop) {
            request['orderFilter'] = 'tpslOrder';
        }
        const response = await this.privatePostV5OrderCancelAll (this.extend (request, params));
        //
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
        const result = this.safeValue (response, 'result', []);
        const orders = this.safeValue (result, 'list');
        if (!Array.isArray (orders)) {
            return response;
        }
        return this.parseOrders (orders, market);
    }

    async cancelAllSpotOrders (symbol: string = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllSpotOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateDeleteSpotOrderBatchCancel (this.extend (request, params));
        //
        //    {
        //        "ret_code": 0,
        //        "ret_msg": "",
        //        "ext_code": null,
        //        "ext_info": null,
        //        "result": {
        //            "success": true
        //        }
        //    }
        //
        const result = this.safeValue (response, 'result', []);
        if (!Array.isArray (result)) {
            return response;
        }
        return this.parseOrders (result, market);
    }

    async cancelAllUnifiedMarginOrders (symbol: string = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let settle = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            settle = market['settle'];
            request['symbol'] = market['id'];
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('cancelAllOrders', market, params, 'linear');
        request['category'] = subType;
        [ settle, params ] = this.handleOptionAndParams (params, 'cancelAllOrders', 'settle', settle);
        if (settle !== undefined) {
            request['settleCoin'] = settle;
        }
        const isStop = this.safeValue (params, 'stop', false);
        params = this.omit (params, [ 'stop' ]);
        if (isStop) {
            request['orderFilter'] = 'StopOrder';
        }
        const response = await this.privatePostUnifiedV3PrivateOrderCancelAll (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [{
        //                     "category": "option",
        //                     "symbol": "BTC-24JUN22-45000-P",
        //                     "orderId": "bd5f3b34-d64d-4b60-8188-438fbea4c552",
        //                     "orderLinkId": "ac4e3b34-d64d-4b60-8188-438fbea4c552",
        //                 }, {
        //                     "category": "option",
        //                     "symbol": "BTC-24JUN22-45000-P",
        //                     "orderId": "4ddd727a-2af8-430e-a293-42895e594d18",
        //                     "orderLinkId": "5cee727a-2af8-430e-a293-42895e594d18",
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {
        //             "list": [{
        //                 "code": 0,
        //                 "msg": "OK"
        //             }, {
        //                 "code": 0,
        //                 "msg": "OK"
        //             }]
        //         },
        //         "time": 1657200736570
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        const orders = this.safeValue (result, 'list');
        if (!Array.isArray (orders)) {
            return response;
        }
        return this.parseOrders (orders, market);
    }

    async cancelAllUSDCOrders (symbol: string = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllUSDCOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = undefined;
        const request = {
            'symbol': market['id'],
        };
        if (market['option']) {
            method = 'privatePostOptionUsdcOpenapiPrivateV1CancelAll';
        } else {
            method = 'privatePostPerpetualUsdcOpenapiPrivateV1CancelAll';
            const isStop = this.safeValue (params, 'stop', false);
            if (isStop) {
                request['orderFilter'] = 'StopOrder';
            } else {
                request['orderFilter'] = 'Order';
            }
            params = this.omit (params, [ 'stop' ]);
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "retExtMap": {},
        //         "result": [
        //             {
        //                 "outRequestId": "cancelAll-290119-1652176443114-0",
        //                 "symbol": "BTC-13MAY22-40000-C",
        //                 "orderId": "fa6cd740-56ed-477d-9385-90ccbfee49ca",
        //                 "orderLinkId": "",
        //                 "errorCode": 0,
        //                 "errorDesc": ""
        //             }
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        if (!Array.isArray (result)) {
            return response;
        }
        return this.parseOrders (result, market);
    }

    async cancelAllDerivativesOrders (symbol: string = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let settle = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            settle = market['settle'];
            request['symbol'] = market['id'];
        }
        [ settle, params ] = this.handleOptionAndParams (params, 'cancelAllOrders', 'settle', settle);
        if (settle !== undefined) {
            request['settleCoin'] = settle;
        }
        const response = await this.privatePostContractV3PrivateOrderCancelAll (this.extend (request, params));
        //
        // contract v3
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "orderId": "4030430d-1dba-4134-ac77-3d81c14aaa00",
        //                     "orderLinkId": "x001"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": {},
        //         "time": 1658901359225
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        const orders = this.safeValue (result, 'list', []);
        return this.parseOrders (orders, market);
    }

    async cancelAllOrders (symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bybit#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        let settle = this.safeString (params, 'settleCoin');
        if (settle === undefined) {
            [ settle, params ] = this.handleOptionAndParams (params, 'cancelAllOrders', 'settle', settle);
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
            settle = market['settle'];
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('cancelAllOrders', market, params);
        const isUsdcSettled = settle === 'USDC';
        const isInverse = subType === 'inverse';
        const isLinearSettle = isUsdcSettled || (settle === 'USDT');
        if (isInverse && isLinearSettle) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders with inverse subType requires settle to not be USDT or USDC');
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('cancelAllOrders', market, params);
        const [ enableUnifiedMargin, enableUnifiedAccount ] = await this.isUnifiedEnabled ();
        if (enableUnifiedAccount) {
            return await this.cancelAllUnifiedAccountOrders (symbol, query);
        } else if (type === 'spot') {
            return await this.cancelAllSpotOrders (symbol, query);
        } else if (enableUnifiedMargin && !isInverse) {
            return await this.cancelAllUnifiedMarginOrders (symbol, query);
        } else if (isUsdcSettled) {
            return await this.cancelAllUSDCOrders (symbol, query);
        } else {
            return await this.cancelAllDerivativesOrders (symbol, query);
        }
    }

    async fetchUnifiedAccountOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'symbol': market['id'],
            // 'category', Type of derivatives product: spot, linear or option.
            // 'baseCoin', Base coin. When category=option. If not passed, BTC by default; when category=linear, if BTC passed, BTCPERP & BTCUSDT returned.
            // 'orderId', Order ID
            // 'orderLinkId', Unique user-set order ID
            // 'orderStatus', // Return all status orders if not passed
            // 'orderFilter', Conditional order or active order
            // 'limit': number, Data quantity per page: Max data value per page is 50, and default value at 20.
            // 'cursor', API pass-through. accountType + category + cursor +. If inconsistent, the following should be returned: The account type does not match the service inquiry.
            // 'startTime': 0, // The start timestamp (ms) Support UTA only temporarily startTime and endTime must be passed together If not passed, query the past 7 days data by default
            // 'endTime': 0, // The end timestamp (ms)
        };
        let market = undefined;
        if (symbol === undefined) {
            let type = undefined;
            [ type, params ] = this.handleMarketTypeAndParams ('fetchOrders', market, params);
            // option, spot
            request['category'] = type;
            if (type === 'swap') {
                let subType = undefined;
                [ subType, params ] = this.handleSubTypeAndParams ('fetchOrders', market, params, 'linear');
                request['category'] = subType;
            }
        } else {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            if (market['spot']) {
                request['category'] = 'spot';
            } else if (market['option']) {
                request['category'] = 'option';
            } else if (market['linear']) {
                request['category'] = 'linear';
            } else {
                throw new NotSupported (this.id + ' fetchOrders() does not allow inverse market orders for ' + symbol + ' markets');
            }
        }
        const isStop = this.safeValue (params, 'stop', false);
        params = this.omit (params, [ 'stop' ]);
        if (isStop) {
            if (market['spot']) {
                request['orderFilter'] = 'tpslOrder';
            } else {
                request['orderFilter'] = 'StopOrder';
            }
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger2 (params, 'until', 'till'); // unified in milliseconds
        const endTime = this.safeInteger (params, 'endTime', until); // exchange-specific in milliseconds
        params = this.omit (params, [ 'endTime', 'till', 'until' ]);
        if (endTime !== undefined) {
            request['endTime'] = endTime;
        } else {
            if (since !== undefined) {
                throw new BadRequest (this.id + ' fetchOrders() requires until/endTime when since is provided.');
            }
        }
        const response = await this.privateGetV5OrderHistory (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'list', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchUnifiedMarginOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'symbol': market['id'],
            // 'category', Type of derivatives product: linear or option.
            // 'baseCoin', Base coin. When category=option. If not passed, BTC by default; when category=linear, if BTC passed, BTCPERP & BTCUSDT returned.
            // 'orderId', Order ID
            // 'orderLinkId', Unique user-set order ID
            // 'orderStatus', Query list of orders in designated states. If this parameter is not passed, the orders in all states shall be enquired by default. This parameter supports multi-state inquiry. States should be separated with English commas.
            // 'orderFilter', Conditional order or active order
            // 'direction', prev: prev, next: next.
            // 'limit': number, Data quantity per page: Max data value per page is 50, and default value at 20.
            // 'cursor', API pass-through. accountType + category + cursor +. If inconsistent, the following should be returned: The account type does not match the service inquiry.
        };
        let market = undefined;
        if (symbol === undefined) {
            let subType = undefined;
            [ subType, params ] = this.handleSubTypeAndParams ('fetchUnifiedMarginOrders', market, params, 'linear');
            request['category'] = subType;
        } else {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            if (market['option']) {
                request['category'] = 'option';
            } else if (market['linear']) {
                request['category'] = 'linear';
            } else {
                throw new NotSupported (this.id + ' fetchUnifiedMarginOrders() does not allow inverse market orders for ' + symbol + ' markets');
            }
        }
        const isStop = this.safeValue (params, 'stop', false);
        params = this.omit (params, [ 'stop' ]);
        if (isStop) {
            request['orderFilter'] = 'StopOrder';
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetUnifiedV3PrivateOrderList (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "Success",
        //         "result": {
        //         "nextPageCursor": "7d17d359-4e38-4d3a-9a31-29791ef2dfd7%3A1657711949928%2C7d17d359-4e38-4d3a-9a31-29791ef2dfd7%3A1657711949928",
        //         "category": "linear",
        //         "list": [
        //             {
        //                 "symbol": "ETHUSDT",
        //                 "orderType": "Market",
        //                 "orderLinkId": "",
        //                 "orderId": "7d17d359-4e38-4d3a-9a31-29791ef2dfd7",
        //                 "stopOrderType": "UNKNOWN",
        //                 "orderStatus": "Filled",
        //                 "takeProfit": "",
        //                 "cumExecValue": "536.92500000",
        //                 "blockTradeId": "",
        //                 "rejectReason": "EC_NoError",
        //                 "price": "1127.10000000",
        //                 "createdTime": 1657711949928,
        //                 "tpTriggerBy": "UNKNOWN",
        //                 "timeInForce": "ImmediateOrCancel",
        //                 "basePrice": "",
        //                 "leavesValue": "0.00000000",
        //                 "updatedTime": 1657711949945,
        //                 "side": "Buy",
        //                 "triggerPrice": "",
        //                 "cumExecFee": "0.32215500",
        //                 "slTriggerBy": "UNKNOWN",
        //                 "leavesQty": "0.0000",
        //                 "closeOnTrigger": false,
        //                 "cumExecQty": "0.5000",
        //                 "reduceOnly": false,
        //                 "qty": "0.5000",
        //                 "stopLoss": "",
        //                 "triggerBy": "UNKNOWN",
        //                 "orderIM": ""
        //             }]
        //         },
        //         "time": 1657713451741
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'list', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchDerivativesOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // 'symbol': market['id'],
            // 'category', Type of derivatives product: spot, linear or option.
            // 'baseCoin', Base coin. When category=option. If not passed, BTC by default; when category=linear, if BTC passed, BTCPERP & BTCUSDT returned.
            // 'orderId', Order ID
            // 'orderLinkId', Unique user-set order ID
            // 'orderStatus', // Return all status orders if not passed
            // 'orderFilter', Conditional order or active order
            // 'limit': number, Data quantity per page: Max data value per page is 50, and default value at 20.
            // 'cursor', API pass-through. accountType + category + cursor +. If inconsistent, the following should be returned: The account type does not match the service inquiry.
        };
        if (symbol === undefined) {
            let type = undefined;
            [ type, params ] = this.handleMarketTypeAndParams ('fetchOrders', market, params);
            request['category'] = type;
            if (type === 'swap') {
                let subType = undefined;
                [ subType, params ] = this.handleSubTypeAndParams ('fetchOrders', market, params, 'linear');
                request['category'] = subType;
            }
        } else {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            if (market['linear']) {
                request['category'] = 'linear';
            } else {
                request['category'] = 'inverse';
            }
        }
        const isStop = this.safeValue (params, 'stop', false);
        params = this.omit (params, [ 'stop' ]);
        if (isStop) {
            request['orderFilter'] = 'StopOrder';
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV5OrderHistory (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'list', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        let settle = this.safeString (params, 'settleCoin');
        if (settle === undefined) {
            [ settle, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'settle', settle);
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
            settle = market['settle'];
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchOrders', market, params);
        const isInverse = subType === 'inverse';
        const isUsdcSettled = settle === 'USDC';
        const isLinearSettle = isUsdcSettled || (settle === 'USDT');
        if (isInverse && isLinearSettle) {
            throw new ArgumentsRequired (this.id + ' fetchOrders with inverse subType requires settle to not be USDT or USDC');
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchOrders', market, params);
        const [ enableUnifiedMargin, enableUnifiedAccount ] = await this.isUnifiedEnabled ();
        if (enableUnifiedAccount && !isInverse) {
            return await this.fetchUnifiedAccountOrders (symbol, since, limit, query);
        } else if (type === 'spot') {
            throw new NotSupported (this.id + ' fetchOrders() only support ' + type + ' markets for unified trade account, use exchange.fetchOpenOrders () and exchange.fetchClosedOrders () instead');
        } else if (enableUnifiedMargin && !isInverse) {
            return await this.fetchUnifiedMarginOrders (symbol, since, limit, query);
        } else {
            return await this.fetchDerivativesOrders (symbol, since, limit, query);
        }
    }

    async fetchSpotClosedOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {};
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privateGetSpotV3PrivateHistoryOrders (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        //
        //    {
        //        "retCode": "0",
        //        "retMsg": "OK",
        //        "result": {
        //            "list": [
        //                {
        //                    "accountId": "13380434",
        //                    "symbol": "AAVEUSDT",
        //                    "orderLinkId": "1666697847966604",
        //                    "orderId": "1274748373594828288",
        //                    "orderPrice": "80",
        //                    "orderQty": "0.11",
        //                    "execQty": "0",
        //                    "cummulativeQuoteQty": "0",
        //                    "avgPrice": "0",
        //                    "status": "CANCELED",
        //                    "timeInForce": "GTC",
        //                    "orderType": "LIMIT",
        //                    "side": "BUY",
        //                    "stopPrice": "0.0",
        //                    "icebergQty": "0.0",
        //                    "createTime": "1666697847972",
        //                    "updateTime": "1666697865809",
        //                    "isWorking": "1",
        //                    "orderCategory": "0"
        //                },
        //            ]
        //        },
        //        "retExtInfo": null,
        //        "time": "1666732287588"
        //    }
        //
        const orders = this.safeValue (result, 'list', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchClosedOrders', market, params);
        const enableUnified = await this.isUnifiedEnabled ();
        const request = {};
        if ((type === 'spot') && !enableUnified[1]) {
            return await this.fetchSpotClosedOrders (symbol, since, limit, params);
        } else {
            request['orderStatus'] = 'Filled';
        }
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchCanceledOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchCanceledOrders
         * @description fetches information on multiple canceled orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since timestamp in ms of the earliest order, default is undefined
         * @param {int|undefined} limit max number of orders to return, default is undefined
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchCanceledOrders', market, params);
        const enableUnified = await this.isUnifiedEnabled ();
        const request = {};
        if ((type === 'spot') && !enableUnified[1]) {
            throw new NotSupported (this.id + ' fetchCanceledOrders() only allow spot market orders for unified trade account, use exchange.fetchOpenOrders () and exchange.fetchClosedOrders () instead');
        } else {
            request['orderStatus'] = 'Cancelled';
        }
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchUnifiedAccountOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'symbol': market['id'],
            // 'category', Type of derivatives product: linear or option.
            // 'baseCoin', Base coin. When category=option. If not passed, BTC by default; when category=linear, if BTC passed, BTCPERP & BTCUSDT returned.
            // 'settleCoin', Settle coin. For linear, either symbol or settleCoin is required
            // 'orderId', Order ID
            // 'orderLinkId', Unique user-set order ID
            // 'orderFilter', Conditional order or active order
            // 'limit': number, Data quantity per page: Max data value per page is 50, and default value at 20.
            // 'cursor', API pass-through. accountType + category + cursor +. If inconsistent, the following should be returned: The account type does not match the service inquiry.
            // 'openOnly': 0,
        };
        let market = undefined;
        if (symbol === undefined) {
            let type = undefined;
            [ type, params ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
            let subType = undefined;
            [ subType, params ] = this.handleSubTypeAndParams ('fetchOpenOrders', market, params, 'linear');
            request['category'] = type;
            if (type === 'swap') {
                if (subType === 'linear') {
                    this.checkRequiredSymbol ('fetchOpenOrders', symbol);
                } else if (subType === 'inverse') {
                    throw new NotSupported (this.id + ' fetchOpenOrders() does not allow inverse market orders for ' + symbol + ' markets');
                }
                request['category'] = subType;
            }
        } else {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            if (market['spot']) {
                request['category'] = 'spot';
            } else if (market['option']) {
                request['category'] = 'option';
            } else if (market['linear']) {
                request['category'] = 'linear';
            } else {
                throw new NotSupported (this.id + ' fetchOpenOrders() does not allow inverse market orders for ' + symbol + ' markets');
            }
        }
        const isStop = this.safeValue (params, 'stop', false);
        params = this.omit (params, [ 'stop' ]);
        if (isStop) {
            if (market['spot']) {
                request['orderFilter'] = 'tpslOrder';
            } else {
                request['orderFilter'] = 'StopOrder';
            }
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV5OrderRealtime (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'list', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchSpotOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetSpotV3PrivateOpenOrders (this.extend (request, params));
        //
        //    {
        //         "retCode": "0",
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "accountId": "13380434",
        //                     "symbol": "AAVEUSDT",
        //                     "orderLinkId": "1666734005300717",
        //                     "orderId": "1275051683279281664",
        //                     "orderPrice": "80",
        //                     "orderQty": "0.11",
        //                     "execQty": "0",
        //                     "cummulativeQuoteQty": "0",
        //                     "avgPrice": "0",
        //                     "status": "NEW",
        //                     "timeInForce": "GTC",
        //                     "orderType": "LIMIT",
        //                     "side": "BUY",
        //                     "stopPrice": "0.0",
        //                     "icebergQty": "0.0",
        //                     "createTime": "1666734005304",
        //                     "updateTime": "1666734005309",
        //                     "isWorking": "1",
        //                     "orderCategory": "0"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": null,
        //         "time": "1666734031592"
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const orders = this.safeValue (result, 'list', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchUnifiedMarginOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol === undefined) {
            let subType = undefined;
            [ subType, params ] = this.handleSubTypeAndParams ('fetchUnifiedMarginOrders', market, params, 'linear');
            request['category'] = subType;
        } else {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            if (market['option']) {
                request['category'] = 'option';
            } else if (market['linear']) {
                request['category'] = 'linear';
            } else {
                throw new NotSupported (this.id + ' fetchUnifiedMarginOpenOrders() does not allow inverse market orders for ' + symbol + ' markets');
            }
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchUnifiedMarginOpenOrders', market, params);
        const isStop = this.safeValue (params, 'stop', false);
        const isConditional = isStop || (type === 'stop') || (type === 'conditional');
        params = this.omit (params, [ 'stop' ]);
        if (isConditional) {
            request['orderFilter'] = 'StopOrder';
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetUnifiedV3PrivateOrderUnfilledOrders (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "Success",
        //         "result": {
        //             "nextPageCursor": "135ccc0d-8136-4e1b-8af3-07b11ee158d1%3A1665565610526%2C135ccc0d-8136-4e1b-8af3-07b11ee158d1%3A1665565610526",
        //             "category": "linear",
        //             "list": [
        //                 {
        //                     "symbol": "ETHUSDT",
        //                     "orderType": "Limit",
        //                     "orderLinkId": "test0000005",
        //                     "orderId": "135ccc0d-8136-4e1b-8af3-07b11ee158d1",
        //                     "stopOrderType": "UNKNOWN",
        //                     "orderStatus": "New",
        //                     "takeProfit": "",
        //                     "cumExecValue": "0.00000000",
        //                     "blockTradeId": "",
        //                     "price": "700.00000000",
        //                     "createdTime": 1665565610526,
        //                     "tpTriggerBy": "UNKNOWN",
        //                     "timeInForce": "GoodTillCancel",
        //                     "basePrice": "",
        //                     "updatedTime": 1665565610533,
        //                     "side": "Buy",
        //                     "triggerPrice": "",
        //                     "cumExecFee": "0.00000000",
        //                     "slTriggerBy": "UNKNOWN",
        //                     "leavesQty": "0.1000",
        //                     "closeOnTrigger": false,
        //                     "cumExecQty": "0.00000000",
        //                     "reduceOnly": false,
        //                     "qty": "0.1000",
        //                     "stopLoss": "",
        //                     "triggerBy": "UNKNOWN",
        //                     "orderIM": "0.00000000"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": null,
        //         "time": 1665565614320
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const orders = this.safeValue (result, 'list', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchDerivativesOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let settle = undefined;
        const request = {
            // 'symbol': market['id'],
            // 'category', Type of derivatives product: linear or option.
            // 'baseCoin', Base coin. When category=option. If not passed, BTC by default; when category=linear, if BTC passed, BTCPERP & BTCUSDT returned.
            // 'settleCoin', Settle coin. For linear, either symbol or settleCoin is required
            // 'orderId', Order ID
            // 'orderLinkId', Unique user-set order ID
            // 'orderFilter', Conditional order or active order
            // 'limit': number, Data quantity per page: Max data value per page is 50, and default value at 20.
            // 'cursor', API pass-through. accountType + category + cursor +. If inconsistent, the following should be returned: The account type does not match the service inquiry.
            // 'openOnly': 0,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            if (market['linear']) {
                request['category'] = 'linear';
            } else {
                request['category'] = 'inverse';
            }
        } else {
            let type = undefined;
            [ type, params ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
            let subType = undefined;
            [ subType, params ] = this.handleSubTypeAndParams ('fetchOpenOrders', market, params, 'linear');
            request['category'] = type;
            if (type === 'swap') {
                request['category'] = subType;
            }
        }
        [ settle, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'settle', settle);
        if (settle !== undefined) {
            request['settleCoin'] = settle;
        }
        const isStop = this.safeValue (params, 'stop', false);
        params = this.omit (params, [ 'stop' ]);
        if (isStop) {
            request['orderFilter'] = 'StopOrder';
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV5OrderRealtime (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const orders = this.safeValue (result, 'list', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchUSDCOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchUSDCOpenOrders', market, params);
        request['category'] = (type === 'swap') ? 'perpetual' : 'option';
        const response = await this.privatePostOptionUsdcOpenapiPrivateV1QueryActiveOrders (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        const orders = this.safeValue (result, 'dataList', []);
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "resultTotalSize": 1,
        //             "cursor": "id%3D1662019818569%23df31e03b-fc00-4b4c-bd1c-b97fd72b5c5c",
        //             "dataList": [
        //                 {
        //                     "orderId": "df31e03b-fc00-4b4c-bd1c-b97fd72b5c5c",
        //                     "orderLinkId": "",
        //                     "symbol": "BTC-2SEP22-18000-C",
        //                     "orderStatus": "New",
        //                     "orderPrice": "500",
        //                     "side": "Buy",
        //                     "remainingQty": "0.1",
        //                     "orderType": "Limit",
        //                     "qty": "0.1",
        //                     "iv": "0.0000",
        //                     "cancelType": "",
        //                     "updateTimestamp": "1662019818579"
        //                 }
        //             ]
        //         }
        //     }
        //
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        let settle = this.safeString (params, 'settleCoin');
        if (settle === undefined) {
            [ settle, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'settle', settle);
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
            settle = market['settle'];
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchOpenOrders', market, params);
        const isInverse = subType === 'inverse';
        const isUsdcSettled = settle === 'USDC';
        const isLinearSettle = isUsdcSettled || (settle === 'USDT');
        if (isInverse && isLinearSettle) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders with inverse subType requires settle to not be USDT or USDC');
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        const [ enableUnifiedMargin, enableUnifiedAccount ] = await this.isUnifiedEnabled ();
        if (enableUnifiedAccount && !isInverse) {
            return await this.fetchUnifiedAccountOpenOrders (symbol, since, limit, query);
        } else if (type === 'spot') {
            return await this.fetchSpotOpenOrders (symbol, since, limit, query);
        } else if (enableUnifiedMargin && !isInverse) {
            return await this.fetchUnifiedMarginOpenOrders (symbol, since, limit, query);
        } else if (isUsdcSettled) {
            return await this.fetchUSDCOpenOrders (symbol, since, limit, query);
        } else {
            return await this.fetchDerivativesOpenOrders (symbol, since, limit, query);
        }
    }

    async fetchOrderTrades (id: string, symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        const request = {
            'orderId': id,
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    async fetchMyUnifiedTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // 'symbol': market['id'],
            // 'category': '', // Product type. spot,linear,option
            // 'orderId': '', // Order ID
            // 'orderLinkId': '', // User customised order ID
            // 'baseCoin': '', // Base coin
            // 'startTime': 0, // The start timestamp (ms)
            // 'endTime': 0, // The end timestamp (ms)
            // 'execType': '', // Execution type
            // 'limit': 0, // Limit for data size per page. [1, 100]. Default: 50
            // 'cursor': '', // Cursor. Used for pagination
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        if (type === 'spot') {
            request['category'] = 'spot';
        } else {
            let subType = undefined;
            [ subType, params ] = this.handleSubTypeAndParams ('fetchMyTrades', market, params);
            if (subType === 'inverse') {
                throw new NotSupported (this.id + ' fetchMyTrades() does not support ' + subType + ' markets.');
            }
            request['category'] = subType;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 20, max 50
        }
        const response = await this.privateGetV5ExecutionList (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'list', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMySpotTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMySpotTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'orderId': 'f185806b-b801-40ff-adec-52289370ed62', // if not provided will return user's trading records
            // 'startTime': parseInt (since / 1000),
            // 'endTime': 0,
            // 'fromTradeId': '',
            // 'toTradeId': '',
            // 'limit' 20, // max 50
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 20, max 50
        }
        const response = await this.privateGetSpotV3PrivateMyTrades (this.extend (request, params));
        //
        //    {
        //         "retCode": "0",
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "symbol": "AAVEUSDT",
        //                     "id": "1274785101965716992",
        //                     "orderId": "1274784252359089664",
        //                     "tradeId": "2270000000031365639",
        //                     "orderPrice": "82.5",
        //                     "orderQty": "0.016",
        //                     "execFee": "0",
        //                     "feeTokenId": "AAVE",
        //                     "creatTime": "1666702226326",
        //                     "isBuyer": "0",
        //                     "isMaker": "0",
        //                     "matchOrderId": "1274785101865076224",
        //                     "makerRebate": "0",
        //                     "executionTime": "1666702226335"
        //                 },
        //             ]
        //         },
        //         "retExtMap": {},
        //         "retExtInfo": null,
        //         "time": "1666768215157"
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'list', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyUnifiedMarginTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let settle = undefined;
        const request = {
            // 'symbol': market['id'],
            // 'orderId': 'f185806b-b801-40ff-adec-52289370ed62', // if not provided will return user's trading records
            // 'startTime': parseInt (since / 1000),
            // 'endTime': 0,
            // 'category': ''
            // 'limit' 20, // max 50
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            settle = market['settle'];
            request['symbol'] = market['id'];
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchMyTrades', market, params, 'linear');
        request['category'] = subType;
        [ settle, params ] = this.handleOptionAndParams (params, 'cancelAllOrders', 'settle', settle);
        if (settle !== undefined) {
            request['settleCoin'] = settle;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 20, max 50
        }
        const response = await this.privateGetUnifiedV3PrivateExecutionList (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "Success",
        //         "result": {
        //             "nextPageCursor": "1565%3A0%2C1565%3A0",
        //             "category": "option",
        //             "list": [
        //                 {
        //                     "orderType": "Limit",
        //                     "symbol": "BTC-14JUL22-17500-C",
        //                     "orderLinkId": "188889689-yuanzhen-558998998899",
        //                     "side": "Buy",
        //                     "orderId": "09c5836f-81ef-4208-a5b4-43135d3e02a2",
        //                     "leavesQty": "0.0000",
        //                     "execTime": 1657714122417,
        //                     "execFee": "0.11897082",
        //                     "feeRate": "0.000300",
        //                     "execId": "6e492560-78b4-5d2b-b331-22921d3173c9",
        //                     "blockTradeId": "",
        //                     "execPrice": "2360.00000000",
        //                     "lastLiquidityInd": "TAKER",
        //                     "orderQty": "0.0200",
        //                     "orderPrice": "2360.00000000",
        //                     "execValue": "47.20000000",
        //                     "execType": "Trade",
        //                     "execQty": "0.0200"
        //                 }
        //             ]
        //         },
        //         "time": 1657714292783
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'list', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyContractTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyContractTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // 'symbol': market['id'],
            // 'category': '', // Product type. spot,linear,option
            // 'orderId': '', // Order ID
            // 'orderLinkId': '', // User customised order ID
            // 'baseCoin': '', // Base coin
            // 'startTime': 0, // The start timestamp (ms)
            // 'endTime': 0, // The end timestamp (ms)
            // 'execType': '', // Execution type
            // 'limit': 0, // Limit for data size per page. [1, 100]. Default: 50
            // 'cursor': '', // Cursor. Used for pagination
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchMyTrades', market, params);
        request['category'] = subType;
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 100
        }
        const response = await this.privateGetV5ExecutionList (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'list', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyUsdcTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            request['category'] = market['option'] ? 'OPTION' : 'PERPETUAL';
        } else {
            request['category'] = 'PERPETUAL';
        }
        const response = await this.privatePostOptionUsdcOpenapiPrivateV1ExecutionList (this.extend (request, params));
        //
        //     {
        //       "result": {
        //         "cursor": "29%3A1%2C28%3A1",
        //         "resultTotalSize": 2,
        //         "dataList": [
        //           {
        //             "symbol": "ETHPERP",
        //             "orderLinkId": "",
        //             "side": "Sell",
        //             "orderId": "d83f8b4d-2f60-4e04-a64a-a3f207989dc6",
        //             "execFee": "0.0210",
        //             "feeRate": "0.000600",
        //             "blockTradeId": "",
        //             "tradeTime": "1669196423581",
        //             "execPrice": "1161.45",
        //             "lastLiquidityInd": "TAKER",
        //             "execValue": "34.8435",
        //             "execType": "Trade",
        //             "execQty": "0.030",
        //             "tradeId": "d9aa8590-9e6a-575e-a1be-d6261e6ed2e5"
        //           }, ...
        //         ]
        //       },
        //       "retCode": 0,
        //       "retMsg": "Success."
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const dataList = this.safeValue (result, 'dataList', []);
        return this.parseTrades (dataList, market, since, limit);
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        let settle = this.safeString (params, 'settleCoin');
        if (settle === undefined) {
            [ settle, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'settle', settle);
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
            settle = market['settle'];
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchMyTrades', market, params);
        const isInverse = subType === 'inverse';
        const isUsdcSettled = settle === 'USDC';
        const isLinearSettle = isUsdcSettled || (settle === 'USDT');
        if (isInverse && isLinearSettle) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades with inverse subType requires settle to not be USDT or USDC');
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        const [ enableUnifiedMargin, enableUnifiedAccount ] = await this.isUnifiedEnabled ();
        if (enableUnifiedAccount && !isInverse) {
            const orderId = this.safeString (params, 'orderId');
            if (orderId === undefined && type !== 'spot') {
                this.checkRequiredSymbol ('fetchMyTrades', symbol);
            }
            return await this.fetchMyUnifiedTrades (symbol, since, limit, query);
        } else if (type === 'spot') {
            return await this.fetchMySpotTrades (symbol, since, limit, query);
        } else if (enableUnifiedMargin && !isInverse) {
            return await this.fetchMyUnifiedMarginTrades (symbol, since, limit, query);
        } else if (isUsdcSettled) {
            return await this.fetchMyUsdcTrades (symbol, since, limit, query);
        } else {
            return await this.fetchMyContractTrades (symbol, since, limit, query);
        }
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         chainType: 'ERC20',
        //         addressDeposit: '0xf56297c6717c1d1c42c30324468ed50a9b7402ee',
        //         tagDeposit: '',
        //         chain: 'ETH'
        //     }
        //
        const address = this.safeString (depositAddress, 'addressDeposit');
        const tag = this.safeString (depositAddress, 'tagDeposit');
        const code = this.safeString (currency, 'code');
        const chain = this.safeString (depositAddress, 'chain');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': chain,
            'info': depositAddress,
        };
    }

    async fetchDepositAddressesByNetwork (code: string, params = {}) {
        /**
         * @method
         * @name bybit#fetchDepositAddressesByNetwork
         * @description fetch a dictionary of addresses for a currency, indexed by network
         * @see https://bybit-exchange.github.io/docs/v5/asset/master-deposit-addr
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure} indexed by the network
         */
        await this.loadMarkets ();
        let currency = this.currency (code);
        const request = {
            'coin': currency['id'],
        };
        const response = await this.privateGetV5AssetDepositQueryAddress (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', []);
        const chains = this.safeValue (result, 'chains', []);
        const coin = this.safeString (result, 'coin');
        currency = this.currency (coin);
        const parsed = this.parseDepositAddresses (chains, [ currency['code'] ], false, {
            'currency': currency['id'],
        });
        return this.indexBy (parsed, 'network');
    }

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name bybit#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://bybit-exchange.github.io/docs/v5/asset/master-deposit-addr
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const [ networkCode, query ] = this.handleNetworkCodeAndParams (params);
        const networkId = this.networkCodeToId (networkCode);
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
        };
        if (networkId !== undefined) {
            request['chainType'] = networkId;
        }
        const response = await this.privateGetV5AssetDepositQueryAddress (this.extend (request, query));
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
        const result = this.safeValue (response, 'result', {});
        const chains = this.safeValue (result, 'chains', []);
        const chainsIndexedById = this.indexBy (chains, 'chain');
        const selectedNetworkId = this.selectNetworkIdFromRawNetworks (code, networkCode, chainsIndexedById);
        const addressObject = this.safeValue (chainsIndexedById, selectedNetworkId, {});
        return this.parseDepositAddress (addressObject, currency);
    }

    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://bybit-exchange.github.io/docs/v5/asset/deposit-record
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for, default = 30 days before the current time
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve, default = 50, max = 50
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @param {int|undefined} params.until the latest time in ms to fetch deposits for, default = 30 days after since
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string|undefined} params.cursor used for pagination
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
        */
        await this.loadMarkets ();
        const request = {
            // 'coin': currency['id'],
            // 'limit': 20, // max 50
            // 'cursor': '',
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV5AssetDepositQueryRecord (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'rows', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    async fetchWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://bybit-exchange.github.io/docs/v5/asset/withdraw-record
         * @param {string} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'coin': currency['id'],
            // 'limit': 20, // max 50
            // 'cusor': '',
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV5AssetWithdrawQueryRecord (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'rows', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            // v1/v2
            'ToBeConfirmed': 'pending',
            'UnderReview': 'pending',
            'Success': 'ok',
            'Expire': 'expired',
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
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
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
        const currencyId = this.safeString (transaction, 'coin');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger2 (transaction, 'createTime', 'successAt');
        const updated = this.safeInteger (transaction, 'updateTime');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const feeCost = this.safeNumber2 (transaction, 'depositFee', 'withdrawFee', 0);
        const type = ('depositFee' in transaction) ? 'deposit' : 'withdrawal';
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        const toAddress = this.safeString (transaction, 'toAddress');
        return {
            'info': transaction,
            'id': this.safeString2 (transaction, 'id', 'withdrawId'),
            'txid': this.safeString (transaction, 'txID'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': this.networkIdToCode (this.safeString (transaction, 'chain')),
            'address': undefined,
            'addressTo': toAddress,
            'addressFrom': undefined,
            'tag': this.safeString (transaction, 'tag'),
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    async fetchLedger (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @see https://bybit-exchange.github.io/docs/v5/account/transaction-log
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'coin': currency['id'],
            // 'currency': currency['id'], // alias
            // 'start_date': this.iso8601 (since),
            // 'end_date': this.iso8601 (till),
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
        const enableUnified = await this.isUnifiedEnabled ();
        let currency = undefined;
        let currencyKey = 'coin';
        if (enableUnified[1]) {
            currencyKey = 'currency';
            if (since !== undefined) {
                request['startTime'] = since;
            }
        } else {
            if (since !== undefined) {
                request['start_date'] = this.yyyymmdd (since);
            }
        }
        const method = (enableUnified[1]) ? 'privateGetV5AccountTransactionLog' : 'privateGetV2PrivateWalletFundRecords';
        if (code !== undefined) {
            currency = this.currency (code);
            request[currencyKey] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue2 (result, 'data', 'list', []);
        return this.parseLedger (data, currency, since, limit);
    }

    parseLedgerEntry (item, currency = undefined) {
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
        const currencyId = this.safeString2 (item, 'coin', 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const amount = this.safeString2 (item, 'amount', 'change');
        const after = this.safeString2 (item, 'wallet_balance', 'cashBalance');
        const direction = Precise.stringLt (amount, '0') ? 'out' : 'in';
        let before = undefined;
        if (after !== undefined && amount !== undefined) {
            const difference = (direction === 'out') ? amount : Precise.stringNeg (amount);
            before = Precise.stringAdd (after, difference);
        }
        let timestamp = this.parse8601 (this.safeString (item, 'exec_time'));
        if (timestamp === undefined) {
            timestamp = this.safeInteger (item, 'transactionTime');
        }
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const id = this.safeString (item, 'id');
        const referenceId = this.safeString (item, 'tx_id');
        return {
            'id': id,
            'currency': code,
            'account': this.safeString (item, 'wallet_id'),
            'referenceAccount': undefined,
            'referenceId': referenceId,
            'status': undefined,
            'amount': this.parseNumber (amount),
            'before': this.parseNumber (before),
            'after': this.parseNumber (after),
            'fee': this.parseNumber (this.safeString (item, 'fee')),
            'direction': direction,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'type': type,
            'info': item,
        };
    }

    parseLedgerEntryType (type) {
        const types = {
            'Deposit': 'transaction',
            'Withdraw': 'transaction',
            'RealisedPNL': 'trade',
            'Commission': 'fee',
            'Refund': 'cashback',
            'Prize': 'prize', // ?
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
        return this.safeString (types, type, type);
    }

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bybit#withdraw
         * @description make a withdrawal
         * @see https://bybit-exchange.github.io/docs/v5/asset/withdraw
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
            'amount': this.numberToString (amount),
            'address': address,
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const [ networkCode, query ] = this.handleNetworkCodeAndParams (params);
        const networkId = this.networkCodeToId (networkCode);
        if (networkId !== undefined) {
            request['chain'] = networkId.toUpperCase ();
        }
        const enableUnified = await this.isUnifiedEnabled ();
        const method = (enableUnified[1]) ? 'privatePostV5AssetWithdrawCreate' : 'privatePostAssetV3PrivateWithdrawCreate';
        const response = await this[method] (this.extend (request, query));
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
        const result = this.safeValue (response, 'result', {});
        return this.parseTransaction (result, currency);
    }

    async fetchPosition (symbol: string, params = {}) {
        /**
         * @method
         * @name bybit#fetchPosition
         * @description fetch data on a single open contract trade position
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        this.checkRequiredSymbol ('fetchPosition', symbol);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = undefined;
        const [ enableUnifiedMargin, enableUnifiedAccount ] = await this.isUnifiedEnabled ();
        const isUsdcSettled = market['settle'] === 'USDC';
        if (enableUnifiedMargin || enableUnifiedAccount) {
            method = (enableUnifiedAccount) ? 'privateGetV5PositionList' : 'privateGetUnifiedV3PrivatePositionList';
            if (market['option']) {
                request['category'] = 'option';
            } else if (market['linear']) {
                request['category'] = 'linear';
            } else {
                throw new NotSupported (this.id + ' fetchPosition() does not allow inverse market orders for ' + symbol + ' markets');
            }
        } else if (isUsdcSettled) {
            method = 'privatePostOptionUsdcOpenapiPrivateV1QueryPosition';
            if (market['option']) {
                request['category'] = 'OPTION';
            } else if (market['linear']) {
                request['category'] = 'PERPETUAL';
            }
        } else {
            if (market['linear']) {
                request['category'] = 'linear';
            } else if (market['inverse']) {
                request['category'] = 'inverse';
            } else {
                throw new NotSupported (this.id + ' fetchPosition() does not allow option market orders for ' + symbol + ' markets');
            }
            method = 'privateGetV5PositionList';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // unified account
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
        // unified margin
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
        // contract v3
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {
        //             "list": [
        //                 {
        //                     "positionIdx": 1,
        //                     "riskId": "41",
        //                     "symbol": "XRPUSDT",
        //                     "side": "Buy",
        //                     "size": "0",
        //                     "positionValue": "0",
        //                     "entryPrice": "0",
        //                     "tradeMode": 0,
        //                     "autoAddMargin": 0,
        //                     "leverage": "10",
        //                     "positionBalance": "0",
        //                     "liqPrice": "0.0000",
        //                     "bustPrice": "0.0000",
        //                     "takeProfit": "0.0000",
        //                     "stopLoss": "0.0000",
        //                     "trailingStop": "0.0000",
        //                     "unrealisedPnl": "0",
        //                     "createdTime": "1658827444328",
        //                     "updatedTime": "1658904863412",
        //                     "tpSlMode": "Full",
        //                     "riskLimitValue": "200000",
        //                     "activePrice": "0.0000"
        //                 },
        //                 {
        //                     "positionIdx": 2,
        //                     "riskId": "41",
        //                     "symbol": "XRPUSDT",
        //                     "side": "Sell",
        //                     "size": "50",
        //                     "positionValue": "16.68",
        //                     "entryPrice": "0.3336",
        //                     "tradeMode": 0,
        //                     "autoAddMargin": 0,
        //                     "leverage": "10",
        //                     "positionBalance": "1.6790088",
        //                     "liqPrice": "12.4835",
        //                     "bustPrice": "12.4869",
        //                     "takeProfit": "0.0000",
        //                     "stopLoss": "0.0000",
        //                     "trailingStop": "0.0000",
        //                     "unrealisedPnl": "0",
        //                     "createdTime": "1658827444328",
        //                     "updatedTime": "1658904863412",
        //                     "tpSlMode": "Full",
        //                     "riskLimitValue": "200000",
        //                     "activePrice": "0.0000"
        //                 }
        //             ]
        //         },
        //         "retExtInfo": null,
        //         "time": 1658904877942
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const positions = this.safeValue2 (result, 'list', 'dataList', []);
        const timestamp = this.safeInteger (response, 'time');
        const first = this.safeValue (positions, 0);
        const position = this.parsePosition (first, market);
        return this.extend (position, {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        });
    }

    async fetchUnifiedPositions (symbols: string[] = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let type = undefined;
        let settle = undefined;
        const enableUnified = await this.isUnifiedEnabled ();
        if (Array.isArray (symbols)) {
            const symbolsLength = symbols.length;
            if (symbolsLength > 1) {
                throw new ArgumentsRequired (this.id + ' fetchPositions() does not accept an array with more than one symbol');
            }
            const market = this.market (symbols[0]);
            settle = market['settle'];
        } else if (symbols !== undefined) {
            symbols = [ symbols ];
        }
        symbols = this.marketSymbols (symbols);
        if (symbols === undefined) {
            [ settle, params ] = this.handleOptionAndParams (params, 'fetchPositions', 'settle', 'USDT');
        } else {
            const first = this.safeValue (symbols, 0);
            const market = this.market (first);
            settle = market['settle'];
            request['symbol'] = market['id'];
        }
        if (enableUnified[1]) {
            request['settleCoin'] = settle;
            request['limit'] = 200;
        }
        // market undefined
        [ type, params ] = this.handleMarketTypeAndParams ('fetchPositions', undefined, params);
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchPositions', undefined, params, 'linear');
        request['category'] = subType;
        if (type === 'option') {
            request['category'] = 'option';
        }
        const method = (enableUnified[1]) ? 'privateGetV5PositionList' : 'privateGetUnifiedV3PrivatePositionList';
        const response = await this[method] (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const positions = this.safeValue (result, 'list', []);
        const results = [];
        for (let i = 0; i < positions.length; i++) {
            let rawPosition = positions[i];
            if (('data' in rawPosition) && ('is_valid' in rawPosition)) {
                // futures only
                rawPosition = this.safeValue (rawPosition, 'data');
            }
            results.push (this.parsePosition (rawPosition));
        }
        return this.filterByArray (results, 'symbol', symbols, false);
    }

    async fetchUSDCPositions (symbols: string[] = undefined, params = {}) {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request = {};
        let market = undefined;
        let type = undefined;
        if (Array.isArray (symbols)) {
            const length = symbols.length;
            if (length !== 1) {
                throw new ArgumentsRequired (this.id + ' fetchUSDCPositions() takes an array with exactly one symbol');
            }
            const symbol = this.safeString (symbols, 0);
            market = this.market (symbol);
            request['symbol'] = market['id'];
        } else if (symbols !== undefined) {
            market = this.market (symbols);
            request['symbol'] = market['id'];
        }
        [ type, params ] = this.handleMarketTypeAndParams ('fetchUSDCPositions', market, params);
        request['category'] = (type === 'option') ? 'OPTION' : 'PERPETUAL';
        const response = await this.privatePostOptionUsdcOpenapiPrivateV1QueryPosition (this.extend (request, params));
        //
        //     {
        //         "result": {
        //             "cursor": "BTC-31DEC21-24000-P%3A1640834421431%2CBTC-31DEC21-24000-P%3A1640834421431",
        //             "resultTotalSize": 1,
        //             "dataList": [
        //                 {
        //                 "symbol": "BTC-31DEC21-24000-P",
        //                 "leverage": "",
        //                 "occClosingFee": "",
        //                 "liqPrice": "",
        //                 "positionValue": "",
        //                 "takeProfit": "",
        //                 "riskId": "",
        //                 "trailingStop": "",
        //                 "unrealisedPnl": "",
        //                 "createdAt": "1640834421431",
        //                 "markPrice": "0.00",
        //                 "cumRealisedPnl": "",
        //                 "positionMM": "359.5271",
        //                 "positionIM": "467.0633",
        //                 "updatedAt": "1640834421431",
        //                 "tpSLMode": "",
        //                 "side": "Sell",
        //                 "bustPrice": "",
        //                 "deleverageIndicator": 0,
        //                 "entryPrice": "1.4",
        //                 "size": "-0.100",
        //                 "sessionRPL": "",
        //                 "positionStatus": "",
        //                 "sessionUPL": "",
        //                 "stopLoss": "",
        //                 "orderMargin": "",
        //                 "sessionAvgPrice": "1.5"
        //                 }
        //             ]
        //         },
        //         "retCode": 0,
        //         "retMsg": "Success."
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const positions = this.safeValue (result, 'dataList', []);
        const results = [];
        for (let i = 0; i < positions.length; i++) {
            let rawPosition = positions[i];
            if (('data' in rawPosition) && ('is_valid' in rawPosition)) {
                // futures only
                rawPosition = this.safeValue (rawPosition, 'data');
            }
            results.push (this.parsePosition (rawPosition, market));
        }
        return this.filterByArray (results, 'symbol', symbols, false);
    }

    async fetchDerivativesPositions (symbols: string[] = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        let settle = undefined;
        if (Array.isArray (symbols)) {
            const symbolsLength = symbols.length;
            if (symbolsLength > 1) {
                throw new ArgumentsRequired (this.id + ' fetchPositions() does not accept an array with more than one symbol');
            }
            if (symbolsLength === 1) {
                market = this.market (symbols[0]);
                settle = market['settle'];
                request['symbol'] = market['id'];
            }
        }
        [ settle, params ] = this.handleOptionAndParams (params, 'fetchPositions', 'settle', settle);
        if (settle !== undefined) {
            request['settleCoin'] = settle;
        }
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('fetchPositions', market, params, 'linear');
        request['category'] = subType;
        const response = await this.privateGetV5PositionList (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const positions = this.safeValue (result, 'list', []);
        return this.parsePositions (positions, symbols, params);
    }

    async fetchPositions (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        if (Array.isArray (symbols)) {
            const symbolsLength = symbols.length;
            if (symbolsLength > 1) {
                throw new ArgumentsRequired (this.id + ' fetchPositions() does not accept an array with more than one symbol');
            }
        } else if (symbols !== undefined) {
            symbols = [ symbols ];
        }
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const [ enableUnifiedMargin, enableUnifiedAccount ] = await this.isUnifiedEnabled ();
        let settle = this.safeString (params, 'settleCoin');
        let paramsOmitted = undefined;
        if (settle === undefined) {
            [ settle, paramsOmitted ] = this.handleOptionAndParams (params, 'fetchPositions', 'settle', settle);
        }
        const isUsdcSettled = settle === 'USDC';
        let subType = undefined;
        [ subType, paramsOmitted ] = this.handleSubTypeAndParams ('fetchPositions', undefined, paramsOmitted);
        const isInverse = subType === 'inverse';
        const isLinearSettle = isUsdcSettled || (settle === 'USDT');
        if (isInverse && isLinearSettle) {
            throw new ArgumentsRequired (this.id + ' fetchPositions with inverse subType requires settle to not be USDT or USDC');
        }
        if ((enableUnifiedMargin || enableUnifiedAccount) && !isInverse) {
            return await this.fetchUnifiedPositions (symbols, params);
        } else if (isUsdcSettled) {
            return await this.fetchUSDCPositions (symbols, paramsOmitted);
        } else {
            return await this.fetchDerivativesPositions (symbols, params);
        }
    }

    parsePosition (position, market = undefined) {
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
        const contract = this.safeString (position, 'symbol');
        market = this.safeMarket (contract, market, undefined, 'contract');
        const size = Precise.stringAbs (this.safeString (position, 'size'));
        let side = this.safeString (position, 'side');
        if (side !== undefined) {
            if (side === 'Buy') {
                side = 'long';
            } else if (side === 'Sell') {
                side = 'short';
            } else {
                side = undefined;
            }
        }
        const notional = this.safeString (position, 'positionValue');
        const unrealisedPnl = this.omitZero (this.safeString (position, 'unrealisedPnl'));
        let initialMarginString = this.safeString (position, 'positionIM');
        let maintenanceMarginString = this.safeString (position, 'positionMM');
        let timestamp = this.parse8601 (this.safeString (position, 'updated_at'));
        if (timestamp === undefined) {
            timestamp = this.safeIntegerN (position, [ 'updatedTime', 'updatedAt' ]);
        }
        // default to cross of USDC margined positions
        const tradeMode = this.safeInteger (position, 'tradeMode', 0);
        const marginMode = tradeMode ? 'isolated' : 'cross';
        let collateralString = this.safeString (position, 'positionBalance');
        const entryPrice = this.omitZero (this.safeString2 (position, 'entryPrice', 'avgPrice'));
        const liquidationPrice = this.omitZero (this.safeString (position, 'liqPrice'));
        const leverage = this.safeString (position, 'leverage');
        if (liquidationPrice !== undefined) {
            if (market['settle'] === 'USDC') {
                //  (Entry price - Liq price) * Contracts + Maintenance Margin + (unrealised pnl) = Collateral
                const difference = Precise.stringAbs (Precise.stringSub (entryPrice, liquidationPrice));
                collateralString = Precise.stringAdd (Precise.stringAdd (Precise.stringMul (difference, size), maintenanceMarginString), unrealisedPnl);
            } else {
                const bustPrice = this.safeString (position, 'bustPrice');
                if (market['linear']) {
                    // derived from the following formulas
                    //  (Entry price - Bust price) * Contracts = Collateral
                    //  (Entry price - Liq price) * Contracts = Collateral - Maintenance Margin
                    // Maintenance Margin = (Bust price - Liq price) x Contracts
                    const maintenanceMarginPriceDifference = Precise.stringAbs (Precise.stringSub (liquidationPrice, bustPrice));
                    maintenanceMarginString = Precise.stringMul (maintenanceMarginPriceDifference, size);
                    // Initial Margin = Contracts x Entry Price / Leverage
                    if (entryPrice !== undefined) {
                        initialMarginString = Precise.stringDiv (Precise.stringMul (size, entryPrice), leverage);
                    }
                } else {
                    // Contracts * (1 / Entry price - 1 / Bust price) = Collateral
                    // Contracts * (1 / Entry price - 1 / Liq price) = Collateral - Maintenance Margin
                    // Maintenance Margin = Contracts * (1 / Liq price - 1 / Bust price)
                    // Maintenance Margin = Contracts * (Bust price - Liq price) / (Liq price x Bust price)
                    const difference = Precise.stringAbs (Precise.stringSub (bustPrice, liquidationPrice));
                    const multiply = Precise.stringMul (bustPrice, liquidationPrice);
                    maintenanceMarginString = Precise.stringDiv (Precise.stringMul (size, difference), multiply);
                    // Initial Margin = Leverage x Contracts / EntryPrice
                    if (entryPrice !== undefined) {
                        initialMarginString = Precise.stringDiv (size, Precise.stringMul (entryPrice, leverage));
                    }
                }
            }
        }
        const maintenanceMarginPercentage = Precise.stringDiv (maintenanceMarginString, notional);
        const marginRatio = Precise.stringDiv (maintenanceMarginString, collateralString, 4);
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': undefined,
            'initialMargin': this.parseNumber (initialMarginString),
            'initialMarginPercentage': this.parseNumber (Precise.stringDiv (initialMarginString, notional)),
            'maintenanceMargin': this.parseNumber (maintenanceMarginString),
            'maintenanceMarginPercentage': this.parseNumber (maintenanceMarginPercentage),
            'entryPrice': this.parseNumber (entryPrice),
            'notional': this.parseNumber (notional),
            'leverage': this.parseNumber (leverage),
            'unrealizedPnl': this.parseNumber (unrealisedPnl),
            'contracts': this.parseNumber (size), // in USD for inverse swaps
            'contractSize': this.safeNumber (market, 'contractSize'),
            'marginRatio': this.parseNumber (marginRatio),
            'liquidationPrice': this.parseNumber (liquidationPrice),
            'markPrice': this.safeNumber (position, 'markPrice'),
            'lastPrice': undefined,
            'collateral': this.parseNumber (collateralString),
            'marginMode': marginMode,
            'side': side,
            'percentage': undefined,
        });
    }

    async setMarginMode (marginMode, symbol: string = undefined, params = {}) {
        await this.loadMarkets ();
        const values = await this.isUnifiedEnabled ();
        const isUnifiedAccount = this.safeValue (values, 1);
        if (isUnifiedAccount) {
            return await this.setUnifiedMarginMode (marginMode, symbol, params);
        }
        return await this.setDerivativesMarginMode (marginMode, symbol, params);
    }

    async setUnifiedMarginMode (marginMode, symbol: string = undefined, params = {}) {
        await this.loadMarkets ();
        if ((marginMode !== 'REGULAR_MARGIN') && (marginMode !== 'PORTFOLIO_MARGIN')) {
            throw new BadRequest (this.id + ' setMarginMode() marginMode must be either REGULAR_MARGIN or PORTFOLIO_MARGIN');
        }
        const request = {
            'setMarginMode': marginMode,
        };
        const response = await this.privatePostV5AccountSetMarginMode (this.extend (request, params));
        //
        //  {
        //      "setMarginMode": "PORTFOLIO_MARGIN"
        //  }
        //
        return response;
    }

    async setDerivativesMarginMode (marginMode, symbol: string = undefined, params = {}) {
        this.checkRequiredSymbol ('setMarginMode', symbol);
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['settle'] === 'USDC') {
            throw new NotSupported (this.id + ' setMarginMode() does not support market ' + symbol + '');
        }
        marginMode = marginMode.toUpperCase ();
        if ((marginMode !== 'ISOLATED') && (marginMode !== 'CROSS')) {
            throw new BadRequest (this.id + ' setMarginMode() marginMode must be either isolated or cross');
        }
        const leverage = this.safeString (params, 'leverage');
        let sellLeverage = undefined;
        let buyLeverage = undefined;
        if (leverage === undefined) {
            sellLeverage = this.safeString2 (params, 'sell_leverage', 'sellLeverage');
            buyLeverage = this.safeString2 (params, 'buy_leverage', 'buyLeverage');
            if (sellLeverage === undefined && buyLeverage === undefined) {
                throw new ArgumentsRequired (this.id + ' setMarginMode() requires a leverage parameter or sell_leverage and buy_leverage parameters');
            }
            if (buyLeverage === undefined) {
                buyLeverage = sellLeverage;
            }
            if (sellLeverage === undefined) {
                sellLeverage = buyLeverage;
            }
            params = this.omit (params, [ 'buy_leverage', 'sell_leverage', 'sellLeverage', 'buyLeverage' ]);
        } else {
            params = this.omit (params, 'leverage');
            sellLeverage = leverage;
            buyLeverage = leverage;
        }
        const tradeMode = (marginMode === 'ISOLATED') ? 1 : 0;
        const request = {
            'symbol': market['id'],
            'tradeMode': tradeMode,
            'buyLeverage': buyLeverage,
            'sellLeverage': sellLeverage,
        };
        const response = await this.privatePostContractV3PrivatePositionSwitchIsolated (this.extend (request, params));
        //
        //     {
        //         "retCode": 0,
        //         "retMsg": "OK",
        //         "result": {},
        //         "retExtInfo": null,
        //         "time": 1658908532580
        //     }
        //
        return response;
    }

    async setLeverage (leverage, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bybit#setLeverage
         * @description set the level of leverage for a market
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} response from the exchange
         */
        this.checkRequiredSymbol ('setLeverage', symbol);
        await this.loadMarkets ();
        const market = this.market (symbol);
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        const isUsdcSettled = market['settle'] === 'USDC';
        const [ enableUnifiedMargin, enableUnifiedAccount ] = await this.isUnifiedEnabled ();
        // engage in leverage setting
        // we reuse the code here instead of having two methods
        leverage = this.numberToString (leverage);
        let method = undefined;
        let request = undefined;
        if (enableUnifiedMargin || enableUnifiedAccount || !isUsdcSettled) {
            request = {
                'symbol': market['id'],
                'buyLeverage': leverage,
                'sellLeverage': leverage,
            };
            if (enableUnifiedAccount) {
                if (market['linear']) {
                    request['category'] = 'linear';
                } else {
                    throw new NotSupported (this.id + ' setUnifiedMarginLeverage() leverage doesn\'t support inverse and option market in unified account');
                }
                method = 'privatePostV5PositionSetLeverage';
            } else if (enableUnifiedMargin) {
                if (market['option']) {
                    request['category'] = 'option';
                } else if (market['linear']) {
                    request['category'] = 'linear';
                } else {
                    throw new NotSupported (this.id + ' setUnifiedMarginLeverage() leverage doesn\'t support inverse market in unified margin');
                }
                method = 'privatePostUnifiedV3PrivatePositionSetLeverage';
            } else {
                method = 'privatePostContractV3PrivatePositionSetLeverage';
            }
        } else {
            request = {
                'symbol': market['id'],
                'leverage': leverage,
            };
            method = 'privatePostPerpetualUsdcOpenapiPrivateV1PositionLeverageSave';
        }
        return await this[method] (this.extend (request, params));
    }

    async setPositionMode (hedged, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bybit#setPositionMode
         * @description set hedged to true or false for a market
         * @see https://bybit-exchange.github.io/docs/v5/position/position-mode
         * @see https://bybit-exchange.github.io/docs/derivatives/contract/position-mode
         * @param {bool} hedged
         * @param {string|undefined} symbol used for unified account with inverse market
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} response from the exchange
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let mode = undefined;
        if (hedged) {
            mode = 3;
        } else {
            mode = 0;
        }
        const request = {
            'mode': mode,
        };
        if (symbol === undefined) {
            request['coin'] = 'USDT';
        } else {
            request['symbol'] = market['id'];
        }
        const enableUnified = await this.isUnifiedEnabled ();
        let response = undefined;
        if (enableUnified[1] || enableUnified[0]) {
            if (symbol !== undefined) {
                request['category'] = market['linear'] ? 'linear' : 'inverse';
            } else {
                let subType = undefined;
                [ subType, params ] = this.handleSubTypeAndParams ('setPositionMode', market, params);
                request['category'] = subType;
            }
            response = await this.privatePostV5PositionSwitchMode (this.extend (request, params));
        } else {
            response = await this.privatePostContractV3PrivatePositionSwitchMode (this.extend (request, params));
        }
        //
        // contract v3
        //     {
        //         "ret_code": 0,
        //         "ret_msg": "ok",
        //         "ext_code": "",
        //         "result": null,
        //         "ext_info": null,
        //         "time_now": "1577477968.175013",
        //         "rate_limit_status": 74,
        //         "rate_limit_reset_ms": 1577477968183,
        //         "rate_limit": 75
        //     }
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

    async fetchDerivativesOpenInterestHistory (symbol: string, timeframe = '1h', since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        const subType = market['linear'] ? 'linear' : 'inverse';
        const category = this.safeString (params, 'category', subType);
        const intervals = this.safeValue (this.options, 'intervals');
        const interval = this.safeString (intervals, timeframe); // 5min,15min,30min,1h,4h,1d
        if (interval === undefined) {
            throw new BadRequest (this.id + ' fetchOpenInterestHistory() cannot use the ' + timeframe + ' timeframe');
        }
        const request = {
            'symbol': market['id'],
            'intervalTime': interval,
            'category': category,
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger2 (params, 'until', 'till'); // unified in milliseconds
        params = this.omit (params, [ 'till', 'until' ]);
        if (until !== undefined) {
            request['endTime'] = until;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV5MarketOpenInterest (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'list', []);
        const paginationCursor = this.safeString (result, 'nextPageCursor');
        if ((paginationCursor !== undefined) && (data.length > 0)) {
            const first = data[0];
            first['nextPageCursor'] = paginationCursor;
            data[0] = first;
        }
        const id = this.safeString (result, 'symbol');
        market = this.safeMarket (id, market, undefined, 'contract');
        return this.parseOpenInterests (data, market, since, limit);
    }

    async fetchOpenInterest (symbol: string, params = {}) {
        /**
         * @method
         * @name bybit#fetchOpenInterest
         * @description Retrieves the open interest of a derivative trading pair
         * @see https://bybit-exchange.github.io/docs/v5/market/open-interest
         * @param {string} symbol Unified CCXT market symbol
         * @param {object} params exchange specific parameters
         * @param {string|undefined} params.interval 5m, 15m, 30m, 1h, 4h, 1d
         * @param {string|undefined} params.category "linear" or "inverse"
         * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=interest-history-structure}
         */
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (!market['contract']) {
            throw new BadRequest (this.id + ' fetchOpenInterest() supports contract markets only');
        }
        const timeframe = this.safeString (params, 'interval', '1h');
        const intervals = this.safeValue (this.options, 'intervals');
        const interval = this.safeString (intervals, timeframe); // 5min,15min,30min,1h,4h,1d
        if (interval === undefined) {
            throw new BadRequest (this.id + ' fetchOpenInterest() cannot use the ' + timeframe + ' timeframe');
        }
        const subType = market['linear'] ? 'linear' : 'inverse';
        const category = this.safeString (params, 'category', subType);
        const request = {
            'symbol': market['id'],
            'intervalTime': interval,
            'category': category,
        };
        const response = await this.publicGetV5MarketOpenInterest (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const id = this.safeString (result, 'symbol');
        market = this.safeMarket (id, market, undefined, 'contract');
        const data = this.safeValue (result, 'list', []);
        return this.parseOpenInterest (data[0], market);
    }

    async fetchOpenInterestHistory (symbol: string, timeframe = '1h', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchOpenInterestHistory
         * @description Gets the total amount of unsettled contracts. In other words, the total number of contracts held in open positions
         * @see https://bybit-exchange.github.io/docs/v5/market/open-interest
         * @param {string} symbol Unified market symbol
         * @param {string} timeframe "5m", 15m, 30m, 1h, 4h, 1d
         * @param {int} since Not used by Bybit
         * @param {int} limit The number of open interest structures to return. Max 200, default 50
         * @param {object} params Exchange specific parameters
         * @returns An array of open interest structures
         */
        if (timeframe === '1m') {
            throw new BadRequest (this.id + 'fetchOpenInterestHistory cannot use the 1m timeframe');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot'] || market['option']) {
            throw new BadRequest (this.id + ' fetchOpenInterestHistory() symbol does not support market ' + symbol);
        }
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        return await this.fetchDerivativesOpenInterestHistory (symbol, timeframe, since, limit, params);
    }

    parseOpenInterest (interest, market = undefined) {
        //
        //    {
        //        "openInterest": 64757.62400000,
        //        "timestamp": 1665784800000,
        //    }
        //
        const timestamp = this.safeInteger (interest, 'timestamp');
        const value = this.safeNumber2 (interest, 'open_interest', 'openInterest');
        return {
            'symbol': market['symbol'],
            'openInterestAmount': undefined,
            'openInterestValue': value,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        };
    }

    async fetchBorrowRate (code: string, params = {}) {
        /**
         * @method
         * @name bybit#fetchBorrowRate
         * @description fetch the rate of interest to borrow a currency for margin trading
         * @see https://bybit-exchange.github.io/docs/spot/v3/#t-queryinterestquota
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [borrow rate structure]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
        };
        const response = await this.privateGetSpotV3PrivateCrossMarginLoanInfo (this.extend (request, params));
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
        const data = this.safeValue (response, 'result', {});
        return this.parseBorrowRate (data, currency);
    }

    parseBorrowRate (info, currency = undefined) {
        //
        //     {
        //         "coin": "USDT",
        //         "interestRate": "0.000107000000",
        //         "loanAbleAmount": "",
        //         "maxLoanAmount": "79999.999"
        //     }
        //
        const timestamp = this.milliseconds ();
        const currencyId = this.safeString (info, 'coin');
        return {
            'currency': this.safeCurrencyCode (currencyId, currency),
            'rate': this.safeNumber (info, 'interestRate'),
            'period': 86400000, // Daily
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    async fetchBorrowInterest (code: string = undefined, symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchBorrowInterest
         * @description fetch the interest owed by the user for borrowing currency for margin trading
         * @param {string|undefined} code unified currency code
         * @param {string|undefined} symbol unified market symbol when fetch interest in isolated markets
         * @param {number|undefined} since the earliest time in ms to fetch borrrow interest for
         * @param {number|undefined} limit the maximum number of structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
         */
        await this.loadMarkets ();
        const request = {};
        const response = await this.privateGetSpotV3PrivateCrossMarginAccount (this.extend (request, params));
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
        const data = this.safeValue (response, 'result', {});
        const rows = this.safeValue (data, 'loanAccountList', []);
        const interest = this.parseBorrowInterests (rows, undefined);
        return this.filterByCurrencySinceLimit (interest, code, since, limit);
    }

    parseBorrowInterest (info, market = undefined) {
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
            'symbol': undefined,
            'marginMode': 'cross',
            'currency': this.safeCurrencyCode (this.safeString (info, 'tokenId')),
            'interest': this.safeNumber (info, 'interest'),
            'interestRate': undefined,
            'amountBorrowed': this.safeNumber (info, 'loan'),
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }

    async transfer (code: string, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name bybit#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://bybit-exchange.github.io/docs/account_asset/#t-createinternaltransfer
         * @see https://bybit-exchange.github.io/docs/account_asset/v3/#t-createinternaltransfer
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @param {string} params.transferId UUID, which is unique across the platform
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets ();
        const transferId = this.safeString (params, 'transferId', this.uuid ());
        const accountTypes = this.safeValue (this.options, 'accountsByType', {});
        const fromId = this.safeString (accountTypes, fromAccount, fromAccount);
        const toId = this.safeString (accountTypes, toAccount, toAccount);
        const currency = this.currency (code);
        const amountToPrecision = this.currencyToPrecision (code, amount);
        let method = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'transfer', 'method', 'privatePostAssetV1PrivateTransfer'); // v1 preferred atm, because it supports funding
        let request = undefined;
        if (method === 'privatePostAssetV3PrivateTransferInterTransfer' || method === 'privatePostV5AssetTransferInterTransfer') {
            request = {
                'transferId': transferId,
                'fromAccountType': fromId,
                'toAccountType': toId,
                'coin': currency['id'],
                'amount': amountToPrecision,
            };
        } else {
            request = {
                'transfer_id': transferId,
                'from_account_type': fromId,
                'to_account_type': toId,
                'coin': currency['id'],
                'amount': amountToPrecision,
            };
        }
        const response = await this[method] (this.extend (request, params));
        //
        // {
        //     "retCode": 0,
        //     "retMsg": "success",
        //     "result": {
        //         "transferId": "4244af44-f3b0-4cf6-a743-b56560e987bc" // transfer_id in v1
        //     },
        //     "retExtInfo": {},
        //     "time": 1666875857205
        // }
        //
        const timestamp = this.safeInteger2 (response, 'time', 'time_now');
        const transfer = this.safeValue (response, 'result', {});
        const statusRaw = this.safeStringN (response, [ 'retCode', 'retMsg', 'ret_code', 'ret_msg' ]);
        const status = this.parseTransferStatus (statusRaw);
        return this.extend (this.parseTransfer (transfer, currency), {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'amount': this.parseNumber (amountToPrecision),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': status,
        });
    }

    async fetchTransfers (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bybit#fetchTransfers
         * @description fetch a history of internal transfers made on an account
         * @see https://bybit-exchange.github.io/docs/v5/asset/inter-transfer-list
         * @param {string|undefined} code unified currency code of the currency transferred
         * @param {int|undefined} since the earliest time in ms to fetch transfers for
         * @param {int|undefined} limit the maximum number of  transfers structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.safeCurrencyCode (code);
            request['coin'] = currency;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV5AssetTransferQueryInterTransferList (this.extend (request, params));
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
        const data = this.safeValue (response, 'result', {});
        const transfers = this.safeValue (data, 'list', []);
        return this.parseTransfers (transfers, currency, since, limit);
    }

    async borrowMargin (code: string, amount, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bybit#borrowMargin
         * @description create a loan to borrow margin
         * @see https://bybit-exchange.github.io/docs/spot/v3/#t-borrowmarginloan
         * @param {string} code unified currency code of the currency to borrow
         * @param {float} amount the amount to borrow
         * @param {string|undefined} symbol not used by bybit.borrowMargin ()
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const [ marginMode, query ] = this.handleMarginModeAndParams ('borrowMargin', params);
        if (marginMode === 'isolated') {
            throw new NotSupported (this.id + ' borrowMargin () cannot use isolated margin');
        }
        const request = {
            'coin': currency['id'],
            'qty': this.currencyToPrecision (code, amount),
        };
        const response = await this.privatePostSpotV3PrivateCrossMarginLoan (this.extend (request, query));
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
        const result = this.safeValue (response, 'result', {});
        const transaction = this.parseMarginLoan (result, currency);
        return this.extend (transaction, {
            'symbol': symbol,
            'amount': amount,
        });
    }

    async repayMargin (code: string, amount, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bybit#repayMargin
         * @description repay borrowed margin and interest
         * @see https://bybit-exchange.github.io/docs/spot/v3/#t-repaymarginloan
         * @param {string} code unified currency code of the currency to repay
         * @param {float} amount the amount to repay
         * @param {string|undefined} symbol not used by bybit.repayMargin ()
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const [ marginMode, query ] = this.handleMarginModeAndParams ('repayMargin', params);
        if (marginMode === 'isolated') {
            throw new NotSupported (this.id + ' repayMargin () cannot use isolated margin');
        }
        const request = {
            'coin': currency['id'],
            'qty': this.numberToString (amount),
        };
        const response = await this.privatePostSpotV3PrivateCrossMarginRepay (this.extend (request, query));
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
        const result = this.safeValue (response, 'result', {});
        const transaction = this.parseMarginLoan (result, currency);
        return this.extend (transaction, {
            'symbol': symbol,
            'amount': amount,
        });
    }

    parseMarginLoan (info, currency = undefined) {
        //
        // borrowMargin
        //
        //     {
        //         "transactId": "14143"
        //     }
        //
        // repayMargin
        //
        //     {
        //         "repayId": "12128"
        //     }
        //
        return {
            'id': this.safeString2 (info, 'transactId', 'repayId'),
            'currency': this.safeString (currency, 'code'),
            'amount': undefined,
            'symbol': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            '0': 'ok',
            'OK': 'ok',
            'SUCCESS': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        // transfer
        //
        //     {
        //         "transferId": "22c2bc11-ed5b-49a4-8647-c4e0f5f6f2b2" // transfer_id in v1
        //     }
        //
        // fetchTransfers
        //
        //     {
        //         "transferId": "e9c421c4-b010-4b16-abd6-106179f27702", // transfer_id in v1
        //         "coin": "USDT",
        //         "amount": "8",
        //         "fromAccountType": "FUND", // from_account_type in v1
        //         "toAccountType": "SPOT", // to_account_type in v1
        //         "timestamp": "1666879426000",
        //         "status": "SUCCESS"
        //      }
        //
        const currencyId = this.safeString (transfer, 'coin');
        const timestamp = this.safeInteger (transfer, 'timestamp');
        const fromAccountId = this.safeString2 (transfer, 'fromAccountType', 'from_account_type');
        const toAccountId = this.safeString2 (transfer, 'toAccountType', 'to_account_type');
        const accountIds = this.safeValue (this.options, 'accountsById', {});
        const fromAccount = this.safeString (accountIds, fromAccountId, fromAccountId);
        const toAccount = this.safeString (accountIds, toAccountId, toAccountId);
        return {
            'info': transfer,
            'id': this.safeString2 (transfer, 'transferId', 'transfer_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': this.parseTransferStatus (this.safeString (transfer, 'status')),
        };
    }

    async fetchDerivativesMarketLeverageTiers (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (market['linear']) {
            request['category'] = 'linear';
        } else if (market['inverse']) {
            request['category'] = 'inverse';
        }
        const response = await this.publicGetV5MarketRiskLimit (this.extend (request, params));
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
        const result = this.safeValue (response, 'result');
        const tiers = this.safeValue (result, 'list');
        return this.parseMarketLeverageTiers (tiers, market);
    }

    async fetchMarketLeverageTiers (symbol: string, params = {}) {
        /**
         * @method
         * @name bybit#fetchMarketLeverageTiers
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
         * @see https://bybit-exchange.github.io/docs/v5/market/risk-limit
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        market = this.market (symbol);
        if (market['spot'] || market['option']) {
            throw new BadRequest (this.id + ' fetchMarketLeverageTiers() symbol does not support market ' + symbol);
        }
        request['symbol'] = market['id'];
        return await this.fetchDerivativesMarketLeverageTiers (symbol, params);
    }

    parseMarketLeverageTiers (info, market = undefined) {
        //
        //     {
        //         "id": 1,
        //         "symbol": "BTCUSD",
        //         "riskLimitValue": "150",
        //         "maintenanceMargin": "0.5",
        //         "initialMargin": "1",
        //         "isLowestRisk": 1,
        //         "maxLeverage": "100.00"
        //     }
        //
        let minNotional = 0;
        const tiers = [];
        for (let i = 0; i < info.length; i++) {
            const item = info[i];
            const maxNotional = this.safeNumber (item, 'riskLimitValue');
            tiers.push ({
                'tier': this.sum (i, 1),
                'currency': market['base'],
                'minNotional': minNotional,
                'maxNotional': maxNotional,
                'maintenanceMarginRate': this.safeNumber (item, 'maintenanceMargin'),
                'maxLeverage': this.safeNumber (item, 'maxLeverage'),
                'info': item,
            });
            minNotional = maxNotional;
        }
        return tiers;
    }

    parseTradingFee (fee, market = undefined) {
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "makerFeeRate": 0.001,
        //         "takerFeeRate": 0.001
        //     }
        //
        const marketId = this.safeString (fee, 'symbol');
        const symbol = this.safeSymbol (marketId, undefined, undefined, 'contract');
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber (fee, 'makerFeeRate'),
            'taker': this.safeNumber (fee, 'takerFeeRate'),
        };
    }

    async fetchTradingFee (symbol: string, params = {}) {
        /**
         * @method
         * @name bybit#fetchTradingFee
         * @description fetch the trading fees for a market
         * @see https://bybit-exchange.github.io/docs/v5/account/fee-rate
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            throw new NotSupported (this.id + ' fetchTradingFee() is not supported for spot market');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetV5AccountFeeRate (this.extend (request, params));
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
        const result = this.safeValue (response, 'result', {});
        const fees = this.safeValue (result, 'list', []);
        const first = this.safeValue (fees, 0, {});
        return this.parseTradingFee (first);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name bybit#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @see https://bybit-exchange.github.io/docs/v5/account/fee-rate
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        let type = undefined;
        [ type, params ] = this.handleOptionAndParams (params, 'fetchTradingFees', 'type', 'future');
        if (type === 'spot') {
            throw new NotSupported (this.id + ' fetchTradingFees() is not supported for spot market');
        }
        const response = await this.privateGetV5AccountFeeRate (params);
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
        let fees = this.safeValue (response, 'result', {});
        fees = this.safeValue (fees, 'list', []);
        const result = {};
        for (let i = 0; i < fees.length; i++) {
            const fee = this.parseTradingFee (fees[i]);
            const symbol = fee['symbol'];
            result[symbol] = fee;
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api'][api]) + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.rawencode (params);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const isOpenapi = url.indexOf ('openapi') >= 0;
            const isV3UnifiedMargin = url.indexOf ('unified/v3') >= 0;
            const isV3Contract = url.indexOf ('contract/v3') >= 0;
            const isV5UnifiedAccount = url.indexOf ('v5') >= 0;
            const timestamp = this.nonce ().toString ();
            if (isOpenapi) {
                if (Object.keys (params).length) {
                    body = this.json (params);
                } else {
                    // this fix for PHP is required otherwise it generates
                    // '[]' on empty arrays even when forced to use objects
                    body = '{}';
                }
                const payload = timestamp + this.apiKey + body;
                const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'hex');
                headers = {
                    'Content-Type': 'application/json',
                    'X-BAPI-API-KEY': this.apiKey,
                    'X-BAPI-TIMESTAMP': timestamp,
                    'X-BAPI-SIGN': signature,
                };
            } else if (isV3UnifiedMargin || isV3Contract || isV5UnifiedAccount) {
                headers = {
                    'Content-Type': 'application/json',
                    'X-BAPI-API-KEY': this.apiKey,
                    'X-BAPI-TIMESTAMP': timestamp,
                    'X-BAPI-RECV-WINDOW': this.options['recvWindow'].toString (),
                };
                if (isV3UnifiedMargin || isV3Contract) {
                    headers['X-BAPI-SIGN-TYPE'] = '2';
                }
                const query = this.extend ({}, params);
                const queryEncoded = this.rawencode (query);
                const auth_base = timestamp.toString () + this.apiKey + this.options['recvWindow'].toString ();
                let authFull = undefined;
                if (method === 'POST') {
                    body = this.json (query);
                    authFull = auth_base + body;
                } else {
                    authFull = auth_base + queryEncoded;
                    url += '?' + this.rawencode (query);
                }
                let signature = undefined;
                if (this.secret.indexOf ('PRIVATE KEY') > -1) {
                    signature = rsa (authFull, this.secret, sha256);
                } else {
                    signature = this.hmac (this.encode (authFull), this.encode (this.secret), sha256);
                }
                headers['X-BAPI-SIGN'] = signature;
            } else {
                const query = this.extend (params, {
                    'api_key': this.apiKey,
                    'recv_window': this.options['recvWindow'],
                    'timestamp': timestamp,
                });
                const sortedQuery = this.keysort (query);
                const auth = this.rawencode (sortedQuery);
                let signature = undefined;
                if (this.secret.indexOf ('PRIVATE KEY') > -1) {
                    signature = rsa (auth, this.secret, sha256);
                } else {
                    signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256);
                }
                if (method === 'POST') {
                    const isSpot = url.indexOf ('spot') >= 0;
                    const extendedQuery = this.extend (query, {
                        'sign': signature,
                    });
                    if (isSpot) {
                        body = this.urlencode (extendedQuery);
                        headers = {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        };
                    } else {
                        body = this.json (extendedQuery);
                        headers = {
                            'Content-Type': 'application/json',
                        };
                    }
                } else {
                    url += '?' + this.rawencode (sortedQuery);
                    url += '&sign=' + signature;
                }
            }
        }
        if (method === 'POST') {
            const brokerId = this.safeString (this.options, 'brokerId');
            if (brokerId !== undefined) {
                headers['Referer'] = brokerId;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     {
        //         ret_code: 10001,
        //         ret_msg: 'ReadMapCB: expect { or n, but found \u0000, error ' +
        //         'found in #0 byte of ...||..., bigger context ' +
        //         '...||...',
        //         ext_code: '',
        //         ext_info: '',
        //         result: null,
        //         time_now: '1583934106.590436'
        //     }
        //
        //     {
        //         "retCode":10001,
        //         "retMsg":"symbol params err",
        //         "result":{"symbol":"","bid":"","bidIv":"","bidSize":"","ask":"","askIv":"","askSize":"","lastPrice":"","openInterest":"","indexPrice":"","markPrice":"","markPriceIv":"","change24h":"","high24h":"","low24h":"","volume24h":"","turnover24h":"","totalVolume":"","totalTurnover":"","fundingRate":"","predictedFundingRate":"","nextFundingTime":"","countdownHour":"0","predictedDeliveryPrice":"","underlyingPrice":"","delta":"","gamma":"","vega":"","theta":""}
        //     }
        //
        const errorCode = this.safeString2 (response, 'ret_code', 'retCode');
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
            if (errorCode === '10005') {
                feedback = this.id + ' private api uses /user/v3/private/query-api to check if you have a unified account. The API key of user id must own one of permissions: "Account Transfer", "Subaccount Transfer", "Withdrawal" ' + body;
            } else {
                feedback = this.id + ' ' + body;
            }
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
